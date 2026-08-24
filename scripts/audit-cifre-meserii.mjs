#!/usr/bin/env node
// Verifica paginile randate de meserie dupa recastul metodologic din 25 aug.
// 2026: reperul CAEN si reperul ISCO trebuie sa fie separate, iar vechiul
// interval CAEN×ISCO nu trebuie sa reapara in copy sau metadata.

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
    caen: valoareCard($, "Reper CAEN · brut"),
    isco: valoareCard($, "Reper ISCO · brut indexat"),
    explicaSepararea:
      text.includes("nu formează un interval") ||
      (text.includes("nu sunt limitele salariului") && text.includes("nu le combinăm")),
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

const faraCaen = rows.filter((r) => !r.caen);
const faraIsco = rows.filter((r) => !r.isco);
const faraExplicatie = rows.filter((r) => !r.explicaSepararea);
const legacy = rows.filter((r) => r.legacy);
const eroriHttp = rows.filter((r) => r.status !== 200);

console.log("\n# Audit repere CAEN și ISCO pe paginile de meserie\n");
console.log(`Pagini analizate: **${rows.length}**`);
console.log(`Cu reper CAEN etichetat: **${rows.length - faraCaen.length}**`);
console.log(`Cu reper ISCO etichetat: **${rows.length - faraIsco.length}**`);
console.log(`Cu avertisment că reperele nu formează un interval: **${rows.length - faraExplicatie.length}**`);
console.log(`Cu formulări moștenite despre intervalul ocupației: **${legacy.length}**\n`);

for (const [titlu, lista] of [
  ["Răspuns HTTP diferit de 200", eroriHttp],
  ["Lipsește reperul CAEN", faraCaen],
  ["Lipsește reperul ISCO", faraIsco],
  ["Lipsește avertismentul metodologic", faraExplicatie],
  ["Copy vechi despre interval", legacy],
]) {
  if (lista.length === 0) continue;
  console.log(`## ${titlu}`);
  for (const r of lista) console.log(`- ${r.h1 || r.p} \`${r.p}\``);
  console.log("");
}

if (eroriHttp.length || faraCaen.length || faraIsco.length || faraExplicatie.length || legacy.length) {
  process.exitCode = 1;
} else {
  console.log("OK: toate paginile păstrează separat reperele CAEN și ISCO, fără interval derivat.\n");
}
