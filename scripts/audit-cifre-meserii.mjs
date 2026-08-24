#!/usr/bin/env node
// scripts/audit-cifre-meserii.mjs
// Cate meserii afiseaza EXACT aceeasi cifra principala? Masurat din paginile
// randate, adica exact ce vede utilizatorul, nu din date.

import * as cheerio from "cheerio";

const BASE = (process.argv.find((a) => a.startsWith("--base=")) || "--base=http://localhost:3100").slice(7).replace(/\/$/, "");

const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname)
  .filter((p) => /^\/salarii\/[^/]+$/.test(p) && !["/salarii/clasament", "/salarii/judete"].includes(p));

async function grab(p) {
  const $ = cheerio.load(await (await fetch(`${BASE}${p}`)).text());
  const h1 = $("h1").first().text().trim();
  // Cifra principala se citeste din meta description, care are un format fix:
  // „Salariu <x> în 2026: 11.130 lei brut mediu în sectorul CAEN 69 (INS, ...)".
  // Textul din <main> NU e sigur: contine si varful pe judete din FAQ.
  const desc = $('meta[name="description"]').attr("content") || "";
  const m = desc.match(/([\d.]+) lei brut mediu în sectorul CAEN ([\w-]+)/);
  return { p, h1, brut: m ? m[1] : null, caen: m ? m[2] : null, desc };
}

const rows = [];
let i = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (i < paths.length) { const k = i++; rows.push(await grab(paths[k])); }
}));

const byNumber = new Map();
for (const r of rows) {
  if (!r.brut) continue;
  if (!byNumber.has(r.brut)) byNumber.set(r.brut, []);
  byNumber.get(r.brut).push(r);
}

const groups = [...byNumber].sort((a, b) => b[1].length - a[1].length);
const collided = groups.filter(([, g]) => g.length > 1);
const nCollided = collided.reduce((a, [, g]) => a + g.length, 0);

console.log(`\n# Cifre duplicate pe paginile de meserie\n`);
console.log(`Pagini analizate: **${rows.length}**`);
console.log(`Cifre brute distincte: **${byNumber.size}**`);
console.log(`Meserii care împart cifra cu altcineva: **${nCollided}** (${Math.round(nCollided / rows.length * 100)}%)\n`);
console.log(`## Grupurile care afișează exact aceeași cifră\n`);
for (const [num, g] of collided) {
  console.log(`\n**${num} lei brut** (CAEN ${g[0].caen}) — ${g.length} meserii:`);
  for (const r of g) console.log(`  - ${r.h1.replace(/^Salariu /, "").replace(/ în 2026$/, "")} \`${r.p}\``);
}
const unique = groups.filter(([, g]) => g.length === 1);
console.log(`\n## Meserii cu cifră proprie: ${unique.length}\n`);
