#!/usr/bin/env node
// scripts/audit-repetitie.mjs
// Arată EXACT ce fraze se repetă pe un șablon de pagini și cât cântăresc.
// Folosire: node scripts/audit-repetitie.mjs /salarii/ [--n=20]

import * as cheerio from "cheerio";

const args = process.argv.slice(2);
const prefix = args.find((a) => a.startsWith("/")) || "/salarii/";
const arg = (n, d) => { const m = args.find((a) => a.startsWith(`--${n}=`)); return m ? m.slice(n.length + 3) : d; };
const BASE = arg("base", "http://localhost:3100").replace(/\/$/, "");
const TOP = Number(arg("n", 25));

const res = await fetch(`${BASE}/sitemap.xml`);
const xml = await res.text();
const all = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const paths = all.filter((p) => p.startsWith(prefix) && p.split("/").filter(Boolean).length === prefix.split("/").filter(Boolean).length + 1);

process.stderr.write(`${paths.length} pagini pe ${prefix}\n`);

async function txt(p) {
  const r = await fetch(`${BASE}${p}`);
  const $ = cheerio.load(await r.text());
  const $m = $("main").clone();
  $m.find("script,style,noscript").remove();
  return { p, t: $m.text().replace(/\s+/g, " ").trim() };
}

const pages = [];
let i = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (i < paths.length) { const k = i++; pages.push(await txt(paths[k])); }
}));

// Împarte în propoziții și numără în câte pagini apare fiecare
const counts = new Map();
for (const { t } of pages) {
  const sents = new Set(
    t.split(/(?<=[.!?])\s+(?=[A-ZĂÂÎȘȚ])/)
      .map((s) => s.trim())
      .filter((s) => s.split(/\s+/).length >= 5)
  );
  for (const s of sents) counts.set(s, (counts.get(s) || 0) + 1);
}

const repeated = [...counts]
  .filter(([, c]) => c >= pages.length * 0.9)
  .sort((a, b) => b[0].split(/\s+/).length - a[0].split(/\s+/).length);

const totalWords = Math.round(pages.reduce((a, p) => a + p.t.split(/\s+/).length, 0) / pages.length);
const repWords = repeated.reduce((a, [s]) => a + s.split(/\s+/).length, 0);

console.log(`\n# Repetiție pe \`${prefix}\` — ${pages.length} pagini\n`);
console.log(`Cuvinte medii pe pagină: **${totalWords}**`);
console.log(`Cuvinte în propoziții identice pe ≥90% din pagini: **${repWords}** (${Math.round(repWords / totalWords * 100)}%)\n`);
console.log(`## Propozițiile identice, de la cea mai lungă\n`);
for (const [s, c] of repeated.slice(0, TOP)) {
  console.log(`- **${c}/${pages.length}** (${s.split(/\s+/).length} cuv.) — ${s.slice(0, 220)}${s.length > 220 ? "…" : ""}`);
}
if (repeated.length > TOP) console.log(`\n…și încă ${repeated.length - TOP} propoziții identice.`);
