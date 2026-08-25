#!/usr/bin/env node
// Verifica paginile randate de meserie dupa recastul net-first din 25 aug.
// 2026: netul sectorului si netul grupei ISCO trebuie sa fie separate, iar
// vechiul interval CAEN×ISCO nu trebuie sa reapara in copy sau metadata.

import * as cheerio from "cheerio";

const BASE = (process.argv.find((a) => a.startsWith("--base=")) || "--base=http://localhost:3100")
  .slice(7)
  .replace(/\/$/, "");

const EXCLUSE = new Set([
  "/salarii/clasament",
  "/salarii/judete",
  "/salarii/femei-barbati",
  "/salarii/locuri-vacante",
]);

const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname)
  .filter((p) => /^\/salarii\/[^/]+$/.test(p) && !EXCLUSE.has(p));

function valoareCard($, prefix) {
  const card = $("div")
    .filter((_, el) => $(el).children().first().text().trim().startsWith(prefix))
    .first();
  return card.children().eq(1).text().replace(/\s+/g, " ").trim() || null;
}

async function grab(p) {
  const raspuns = await fetch(`${BASE}${p}`);
  const html = await raspuns.text();
  const $ = cheerio.load(html);
  const text = $("main").text().replace(/\s+/g, " ");
  return {
    p,
    status: raspuns.status,
    h1: $("h1").first().text().trim(),
    desc: $('meta[name="description"]').attr("content") || "",
    caenNet: valoareCard($, "Câștig net lunar orientativ"),
    iscoNet: valoareCard($, "Net orientativ · grupa ISCO"),
    explicaSepararea: text.includes("nu formează un interval"),
    legacy: /Estimare net, pe lună|Cum citești intervalul|câștigă, estimativ, între|capetele (?:sunt|de mai sus)/i.test(
      `${text} ${$('meta[name="description"]').attr("content") || ""}`,
    ),
  };
}

const rows = [];
let i = 0;
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (i < paths.length) {
      const k = i++;
      rows.push(await grab(paths[k]));
    }
  }),
);

const faraCaenNet = rows.filter((r) => !r.caenNet);
const faraIscoNet = rows.filter((r) => !r.iscoNet);
const faraExplicatie = rows.filter((r) => !r.explicaSepararea);
const legacy = rows.filter((r) => r.legacy);
const eroriHttp = rows.filter((r) => r.status !== 200);

console.log("\n# Audit net-first pe paginile de meserie\n");
console.log(`Pagini analizate: **${rows.length}**`);
console.log(`Cu netul sectorului în prim-plan: **${rows.length - faraCaenNet.length}**`);
console.log(`Cu netul grupei ISCO separat: **${rows.length - faraIscoNet.length}**`);
console.log(`Cu avertisment că reperele nu formează un interval: **${rows.length - faraExplicatie.length}**`);
console.log(`Cu formulări moștenite despre intervalul ocupației: **${legacy.length}**\n`);

for (const [titlu, lista] of [
  ["Răspuns HTTP diferit de 200", eroriHttp],
  ["Lipsește netul sectorului", faraCaenNet],
  ["Lipsește netul grupei ISCO", faraIscoNet],
  ["Lipsește avertismentul metodologic", faraExplicatie],
  ["Copy vechi despre interval", legacy],
]) {
  if (lista.length === 0) continue;
  console.log(`## ${titlu}`);
  for (const r of lista) console.log(`- ${r.h1 || r.p} \`${r.p}\``);
  console.log("");
}

if (eroriHttp.length || faraCaenNet.length || faraIscoNet.length || faraExplicatie.length || legacy.length) {
  process.exitCode = 1;
} else {
  console.log("OK: toate paginile afișează netul primul și păstrează CAEN/ISCO separat, fără interval derivat.\n");
}
