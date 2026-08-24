#!/usr/bin/env node
// scripts/audit-continut.mjs
// Audit de conținut pe TOATE rutele din sitemap, rulat contra serverului local.
// Răspunde la întrebările: e umplutură? se repetă? e subțire? e util?
//
// Folosire:
//   node scripts/audit-continut.mjs                 # contra http://localhost:3100
//   node scripts/audit-continut.mjs --base=https://salariile.ro
//   node scripts/audit-continut.mjs --json=out.json

import * as cheerio from "cheerio";
import fs from "node:fs";

const args = process.argv.slice(2);
const arg = (n, d) => {
  const m = args.find((a) => a.startsWith(`--${n}=`));
  return m ? m.slice(n.length + 3) : d;
};
const BASE = arg("base", "http://localhost:3100").replace(/\/$/, "");
const JSON_OUT = arg("json", null);
const CONCURRENCY = Number(arg("concurrency", 8));

async function sitemapUrls() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((m) => m[1].trim())
    .map((u) => new URL(u).pathname);
}

/** Text vizibil din <main>, fără script/style/nav/footer. */
function mainText($) {
  const $m = $("main").length ? $("main").clone() : $("body").clone();
  $m.find("script,style,noscript,nav,footer,header").remove();
  return $m.text().replace(/\s+/g, " ").trim();
}

const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) || []).length;

/** Shingles de 8 cuvinte, pentru detectat text repetat între pagini. */
function shingles(text, n = 8) {
  const w = (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}

async function fetchPage(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const html = await res.text();
  const $ = cheerio.load(html);
  const text = mainText($);
  const h2 = $("main h2").map((_, e) => $(e).text().trim()).get();
  // Numai linkurile din <main>: alea sunt semnalul editorial. Header-ul si
  // footerul apar identic pe toate paginile si ar face fiecare ruta sa para
  // bine legata, ceea ce ar goli verificarea de sens.
  const internal = new Set();
  $("main a[href^='/']").each((_, e) => internal.add($(e).attr("href").split("#")[0]));
  // Separat, linkurile din sabloanele comune, ca sa nu raportam drept „orfana"
  // o pagina care e de fapt in footer pe tot site-ul.
  const inSabloane = new Set();
  $("header a[href^='/'], footer a[href^='/']").each((_, e) =>
    inSabloane.add($(e).attr("href").split("#")[0]),
  );
  const jsonld = $('script[type="application/ld+json"]')
    .map((_, e) => {
      try { return JSON.stringify(JSON.parse($(e).contents().text())).length; }
      catch { return -1; }
    }).get();
  return {
    path,
    status: res.status,
    title: $("head title").text().trim(),
    desc: $('meta[name="description"]').attr("content") || "",
    canonical: $('link[rel="canonical"]').attr("href") || "",
    h1: $("h1").map((_, e) => $(e).text().trim()).get(),
    h2,
    h2count: h2.length,
    wordCount: words(text),
    text,
    internalLinks: [...internal],
    internalLinkCount: internal.size,
    linkuriSablon: [...inSabloane],
    jsonldBlocks: jsonld.length,
    jsonldBad: jsonld.filter((n) => n === -1).length,
    tables: $("main table").length,
    faqItems: $("main details").length,
  };
}

async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const idx = i++;
      try { out[idx] = await fn(items[idx]); }
      catch (e) { out[idx] = { path: items[idx], error: String(e) }; }
    }
  }));
  return out;
}

const paths = await sitemapUrls();
process.stderr.write(`Analizez ${paths.length} rute de pe ${BASE}...\n`);
const pages = (await pool(paths, CONCURRENCY, fetchPage)).filter(Boolean);
const ok = pages.filter((p) => !p.error && p.status === 200);

// ── Grupare pe șablon (prefix de rută) ─────────────────────────────────
const template = (p) => {
  if (p === "/") return "/ (homepage)";
  const seg = p.split("/").filter(Boolean);
  if (seg[0] === "calculator") return "/calculator/[valoare]";
  if (seg[0] === "compara") return seg.length > 1 ? "/compara/[pereche]" : "/compara";
  if (seg[0] === "noutati") return seg.length > 1 ? "/noutati/[slug]" : "/noutati";
  if (seg[0] === "salarii") {
    if (seg[1] === "judet") return "/salarii/judet/[judet]";
    if (seg[1] === "domeniu") return "/salarii/domeniu/[domeniu]";
    // Paginile tematice de sub /salarii/ nu sunt meserii. Fara excluderea lor,
    // statisticile pe sablon ies false: o pagina tematica scurta trage in jos
    // minimul de cuvinte al celor 123 de meserii.
    const TEMATICE = ["clasament", "judete", "femei-barbati", "locuri-vacante"];
    if (seg.length === 2 && !TEMATICE.includes(seg[1])) return "/salarii/[meserie]";
    return p;
  }
  return p;
};

// ── Text repetat între paginile aceluiași șablon ───────────────────────
const byTemplate = new Map();
for (const p of ok) {
  const t = template(p.path);
  if (!byTemplate.has(t)) byTemplate.set(t, []);
  byTemplate.get(t).push(p);
}

const templateReport = [];
for (const [tpl, group] of byTemplate) {
  if (group.length < 2) {
    templateReport.push({ tpl, n: group.length, medianWords: group[0]?.wordCount ?? 0, boilerplatePct: null });
    continue;
  }
  // shingles prezente în >=90% din pagini = boilerplate
  const counts = new Map();
  const sets = group.map((p) => shingles(p.text));
  for (const s of sets) for (const sh of s) counts.set(sh, (counts.get(sh) || 0) + 1);
  const threshold = Math.ceil(group.length * 0.9);
  const common = new Set([...counts].filter(([, c]) => c >= threshold).map(([s]) => s));
  // procent de shingles boilerplate per pagină
  const pcts = sets.map((s) => (s.size ? [...s].filter((sh) => common.has(sh)).length / s.size : 0));
  const sorted = [...group].map((p) => p.wordCount).sort((a, b) => a - b);
  templateReport.push({
    tpl,
    n: group.length,
    medianWords: sorted[Math.floor(sorted.length / 2)],
    minWords: sorted[0],
    maxWords: sorted[sorted.length - 1],
    boilerplatePct: Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 100),
    exampleCommon: [...common].slice(0, 3),
  });
}

// ── Duplicate globale ──────────────────────────────────────────────────
const dupBy = (key) => {
  const m = new Map();
  for (const p of ok) {
    const v = p[key];
    if (!v) continue;
    if (!m.has(v)) m.set(v, []);
    m.get(v).push(p.path);
  }
  return [...m].filter(([, ps]) => ps.length > 1).sort((a, b) => b[1].length - a[1].length);
};

// ── Orfane: pagini spre care nu linkează nicio altă pagină ─────────────
// „Orfană" = nu e linkată nici din corpul vreunei pagini, nici din header/footer.
// O pagină aflată doar în footer NU e orfană, dar nici nu are semnal editorial,
// așa că o raportăm separat.
const norm = (l) => l.replace(/\/$/, "") || "/";
const dinCorp = new Set();
const dinSabloane = new Set();
for (const p of ok) {
  for (const l of p.internalLinks) dinCorp.add(norm(l));
  for (const l of p.linkuriSablon ?? []) dinSabloane.add(norm(l));
}
const orphans = ok
  .map((p) => p.path)
  .filter((p) => p !== "/" && !dinCorp.has(norm(p)) && !dinSabloane.has(norm(p)));
const doarInSablon = ok
  .map((p) => p.path)
  .filter((p) => p !== "/" && !dinCorp.has(norm(p)) && dinSabloane.has(norm(p)));

// ── Raport ─────────────────────────────────────────────────────────────
const L = console.log;
L(`\n# Audit de conținut — ${ok.length}/${pages.length} rute HTTP 200\n`);

L(`## Șabloane: volum și cât e boilerplate\n`);
L(`| Șablon | Pagini | Cuvinte (min/median/max) | Text repetat pe șablon |`);
L(`|---|---:|---:|---:|`);
for (const r of templateReport.sort((a, b) => (b.boilerplatePct ?? -1) - (a.boilerplatePct ?? -1))) {
  const w = r.boilerplatePct === null ? `${r.medianWords}` : `${r.minWords} / ${r.medianWords} / ${r.maxWords}`;
  L(`| \`${r.tpl}\` | ${r.n} | ${w} | ${r.boilerplatePct === null ? "—" : r.boilerplatePct + "%"} |`);
}

L(`\n## Pagini subțiri (sub 300 de cuvinte în <main>)\n`);
const thin = ok.filter((p) => p.wordCount < 300).sort((a, b) => a.wordCount - b.wordCount);
if (!thin.length) L(`Niciuna.`);
else { L(`| Rută | Cuvinte | H2 | Linkuri interne |`); L(`|---|---:|---:|---:|`);
  for (const p of thin.slice(0, 30)) L(`| \`${p.path}\` | ${p.wordCount} | ${p.h2count} | ${p.internalLinkCount} |`); }

L(`\n## Titluri duplicate\n`);
const dt = dupBy("title");
if (!dt.length) L(`Niciunul.`);
else for (const [t, ps] of dt.slice(0, 15)) L(`- **${ps.length}×** \`${t.slice(0, 70)}\` → ${ps.slice(0, 4).map((p) => `\`${p}\``).join(", ")}${ps.length > 4 ? " …" : ""}`);

L(`\n## Meta descrieri duplicate\n`);
const dd = dupBy("desc");
if (!dd.length) L(`Niciuna.`);
else for (const [t, ps] of dd.slice(0, 15)) L(`- **${ps.length}×** \`${t.slice(0, 70)}\` → ${ps.slice(0, 4).map((p) => `\`${p}\``).join(", ")}${ps.length > 4 ? " …" : ""}`);

L(`\n## Titluri peste 60 de caractere\n`);
const longT = ok.filter((p) => p.title.length > 60).sort((a, b) => b.title.length - a.title.length);
if (!longT.length) L(`Niciunul.`);
else for (const p of longT.slice(0, 20)) L(`- ${p.title.length} car. \`${p.path}\` — ${p.title}`);

L(`\n## Meta descrieri lipsă, prea scurte sau prea lungi\n`);
const badD = ok.filter((p) => !p.desc || p.desc.length < 70 || p.desc.length > 165);
if (!badD.length) L(`Niciuna.`);
else for (const p of badD.slice(0, 25)) L(`- ${p.desc ? p.desc.length + " car." : "LIPSĂ"} \`${p.path}\``);

L(`\n## Probleme de H1\n`);
const badH1 = ok.filter((p) => p.h1.length !== 1);
if (!badH1.length) L(`Niciuna — fiecare pagină are exact un H1.`);
else for (const p of badH1) L(`- ${p.h1.length} H1 pe \`${p.path}\``);

L(`\n## Pagini orfane (nici din corpul altei pagini, nici din header/footer)\n`);
if (!orphans.length) L(`Niciuna.`);
else { L(`${orphans.length} rute:\n`); for (const o of orphans.slice(0, 40)) L(`- \`${o}\``); }

L(`\n## Pagini ajunse doar din header/footer, fără niciun link editorial\n`);
if (!doarInSablon.length) L(`Niciuna.`);
else { L(`${doarInSablon.length} rute:\n`); for (const o of doarInSablon.slice(0, 40)) L(`- \`${o}\``); }

L(`\n## Pagini cu puține linkuri interne (sub 5)\n`);
const lonely = ok.filter((p) => p.internalLinkCount < 5).sort((a, b) => a.internalLinkCount - b.internalLinkCount);
if (!lonely.length) L(`Niciuna.`);
else for (const p of lonely.slice(0, 25)) L(`- ${p.internalLinkCount} linkuri \`${p.path}\``);

L(`\n## JSON-LD\n`);
const noLd = ok.filter((p) => p.jsonldBlocks === 0);
const badLd = ok.filter((p) => p.jsonldBad > 0);
L(`- Fără JSON-LD: ${noLd.length}${noLd.length ? " → " + noLd.slice(0, 10).map((p) => `\`${p.path}\``).join(", ") : ""}`);
L(`- JSON-LD invalid: ${badLd.length}${badLd.length ? " → " + badLd.slice(0, 10).map((p) => `\`${p.path}\``).join(", ") : ""}`);

const errs = pages.filter((p) => p.error || p.status !== 200);
L(`\n## Rute cu probleme\n`);
if (!errs.length) L(`Niciuna — toate răspund 200.`);
else for (const e of errs) L(`- \`${e.path}\` → ${e.error || e.status}`);

if (JSON_OUT) {
  const faraText = ok.map((r) => { const copie = { ...r }; delete copie.text; return copie; });
  fs.writeFileSync(JSON_OUT, JSON.stringify({ templateReport, pages: faraText }, null, 2));
  process.stderr.write(`\nJSON scris în ${JSON_OUT}\n`);
}
