#!/usr/bin/env node
// scripts/indexnow-schimbari.mjs
//
// Anunță Bing (IndexNow) doar paginile al căror conținut s-a schimbat de la rularea
// trecută. Bing e și sursa căutării web din ChatGPT și Copilot: o cifră nouă care
// nu e anunțată rămâne veche în răspunsurile lor. Între 15 septembrie și 6 noiembrie
// 2026 nu s-a anunțat nimic, fiindcă publicarea devenise automată, iar anunțarea nu.
//
// Cum:
//   1. (opțional) așteaptă ca https://salariile.ro/versiune.txt să arate commitul dat;
//   2. citește fiecare adresă din sitemap.xml și calculează amprenta textului din
//      <main>, fără scripturi și stiluri: un build nou schimbă hash-urile fișierelor
//      JS, dar nu și textul, deci numai paginile cu conținut schimbat diferă;
//   3. compară cu starea salvată și trimite diferențele într-un singur POST.
// Prima rulare, fără stare, doar salvează amprentele.
//
//   node scripts/indexnow-schimbari.mjs --stare indexnow-stare.json [--asteapta <sha>] [--fara-trimitere]

import { createHash } from "node:crypto";
import fs from "node:fs";

const HOST = "salariile.ro";
const ORIGIN = `https://${HOST}`;

const arg = (nume) => {
  const i = process.argv.indexOf(nume);
  return i === -1 ? null : process.argv[i + 1];
};
const caleStare = arg("--stare") ?? "indexnow-stare.json";
const asteapta = arg("--asteapta");
const faraTrimitere = process.argv.includes("--fara-trimitere");

const keyFile = fs.readdirSync("./public").find((f) => /^[a-f0-9]{8,128}\.txt$/i.test(f));
if (!keyFile) throw new Error("Nu găsesc cheia IndexNow în public/");
const KEY = keyFile.replace(/\.txt$/i, "");

const dormi = (ms) => new Promise((r) => setTimeout(r, ms));
const proaspat = (url) => `${url}${url.includes("?") ? "&" : "?"}indexnow=${Date.now()}`;

async function text(url) {
  for (let incercare = 1; incercare <= 3; incercare++) {
    try {
      const res = await fetch(proaspat(url), { headers: { "User-Agent": "salariile.ro-indexnow" } });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch {}
    await dormi(1000 * incercare);
  }
  throw new Error(`Nu pot citi ${url}`);
}

if (asteapta) {
  const limita = Date.now() + 20 * 60 * 1000;
  for (;;) {
    const live = ((await text(`${ORIGIN}/versiune.txt`)) ?? "").trim();
    if (live === asteapta) {
      console.log(`Pe site e commitul ${asteapta.slice(0, 7)}.`);
      break;
    }
    if (Date.now() > limita) {
      console.log(`Pe site e tot ${live.slice(0, 7) || "(nimic)"} după 20 de minute; ies fără să trimit.`);
      process.exit(0);
    }
    await dormi(20_000);
  }
}

function amprenta(html) {
  const main = html.match(/<main[\s\S]*<\/main>/i)?.[0] ?? html;
  const curat = main
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return createHash("sha256").update(curat).digest("hex").slice(0, 20);
}

const sitemap = await text(`${ORIGIN}/sitemap.xml`);
const adrese = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());

const acum = {};
const coada = [...adrese];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (coada.length) {
      const url = coada.shift();
      const html = await text(url);
      if (html) acum[url] = amprenta(html);
    }
  }),
);

const inainte = fs.existsSync(caleStare) ? JSON.parse(fs.readFileSync(caleStare, "utf8")) : null;
// Starea se scrie abia după o trimitere reușită: dacă trimiterea pică sau rularea e
// oprită, paginile rămân „schimbate” și pleacă la rularea următoare.
const salveaza = () => fs.writeFileSync(caleStare, `${JSON.stringify(acum, null, 1)}\n`);

if (!inainte) {
  salveaza();
  console.log(`Prima rulare: am salvat amprentele a ${Object.keys(acum).length} pagini, nu trimit nimic.`);
  process.exit(0);
}

const schimbate = Object.keys(acum).filter((url) => inainte[url] !== acum[url]);
console.log(`${Object.keys(acum).length} pagini citite, ${schimbate.length} schimbate sau noi.`);
schimbate.forEach((u) => console.log("  •", u));

if (!schimbate.length || faraTrimitere) {
  salveaza();
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGIN}/${keyFile}`, urlList: schimbate.slice(0, 10_000) }),
});
console.log(`IndexNow: HTTP ${res.status}`);
if (res.status !== 200 && res.status !== 202) {
  console.log((await res.text()).slice(0, 300));
  process.exit(1);
}
salveaza();
