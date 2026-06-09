#!/usr/bin/env node
// scripts/indexnow.mjs
// Notifică instant Bing + Yandex (IndexNow) despre pagini noi/modificate.
// Zero dependențe. Cheia trăiește în public/<KEY>.txt (servită la rădăcina site-ului).
//
// Folosire:
//   node scripts/indexnow.mjs                       # trimite TOATE URL-urile din sitemap
//   node scripts/indexnow.mjs /noutati/articol-nou  # trimite doar pagini anume
//   node scripts/indexnow.mjs https://salariile.ro/calculator-pfa
//
// Rulează asta după ce publici/modifici pagini (sau după un deploy cu conținut nou).

import fs from "node:fs";

const HOST = "salariile.ro";
const ORIGIN = `https://${HOST}`;

// Cheia = numele fișierului din public/ (sursă unică de adevăr).
const keyFile = fs
  .readdirSync("./public")
  .find((f) => /^[a-f0-9]{8,128}\.txt$/i.test(f));
if (!keyFile) {
  console.error("✗ Nu găsesc fișierul cheie IndexNow în public/ (ex. <hex>.txt)");
  process.exit(1);
}
const KEY = keyFile.replace(/\.txt$/i, "");
const KEY_LOCATION = `${ORIGIN}/${keyFile}`;

const toFull = (a) =>
  /^https?:\/\//i.test(a) ? a : ORIGIN + (a.startsWith("/") ? a : "/" + a);

async function urlsFromSitemap() {
  const res = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!res.ok) throw new Error(`Nu pot citi sitemap.xml (${res.status})`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
}

(async () => {
  try {
    const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
    const urlList = args.length ? args.map(toFull) : await urlsFromSitemap();

    if (!urlList.length) {
      console.error("✗ Nicio adresă de trimis.");
      process.exit(1);
    }

    console.log(`\nIndexNow → trimit ${urlList.length} URL-uri pentru ${HOST}`);
    console.log(`Cheie: ${KEY_LOCATION}\n`);
    urlList.forEach((u) => console.log("  •", u));

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
    });

    // IndexNow: 200/202 = acceptat. 422 = URL-uri/cheie nevalide. 403 = cheie negăsită la keyLocation.
    const body = await res.text();
    console.log("");
    if (res.status === 200 || res.status === 202) {
      console.log(`✓ Acceptat (HTTP ${res.status}) — Bing/Yandex vor crawla curând.`);
    } else if (res.status === 403) {
      console.log(`✗ HTTP 403 — cheia nu e accesibilă la ${KEY_LOCATION} (deploy-ul e gata?).`);
    } else {
      console.log(`! HTTP ${res.status}: ${body.slice(0, 200)}`);
    }
    console.log("");
  } catch (e) {
    console.error("\n✗ " + e.message + "\n");
    process.exit(1);
  }
})();
