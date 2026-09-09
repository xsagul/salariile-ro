#!/usr/bin/env node
// scripts/curs-valutar.mjs
//
// Aduce cursul de referinta EUR/RON si il scrie in `src/data/curs-valutar.json`.
//
// De ce exista: pagina in engleza afiseaza sumele in euro, iar un curs scris de
// mana in cod devine fals in cateva luni — exact genul de cifra pe care site-ul
// asta nu o publica. Cursul are nevoie de o sursa vie, cu proprietar si cu data
// vizibila, la fel ca datele INS sau grilele din lege.
//
// Sursa: Banca Centrala Europeana, cursul de referinta zilnic.
//   https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml
//
// De ce BCE si nu BNR: feed-ul XML al BNR (nbrfxrates.xml) returneaza pagina
// HTML a site-ului lor la orice cerere programatica, verificat pe 9 septembrie
// 2026 pe trei adrese. BCE publica un XML curat, datat, care include RON. Pentru
// o pagina in engleza, adresata unui public european, cursul de referinta BCE e
// si sursa mai naturala.
//
// ATENTIE: cursul NU intra in calculul salarial. Contributiile, plafoanele si
// deducerea se calculeaza in lei, pentru ca asa sunt scrise in lege. Euro e doar
// un strat de afisare si de introducere a sumei.
//
// Rulare:  node scripts/curs-valutar.mjs
//          node scripts/curs-valutar.mjs --check   (nu scrie, doar compara)

import fs from "node:fs";
import path from "node:path";

const URL_BCE = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const IESIRE = path.join(process.cwd(), "src", "data", "curs-valutar.json");
const doarVerifica = process.argv.includes("--check");

/** Cate zile poate avea cursul inainte sa fie considerat vechi. */
export const ZILE_MAXIME = 30;

async function adu() {
  const r = await fetch(URL_BCE, {
    headers: { "user-agent": "salariile.ro/1.0 (curs de referinta; contact prin salariile.ro)" },
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error(`BCE a raspuns ${r.status}`);
  const xml = await r.text();

  const data = /time='(\d{4}-\d{2}-\d{2})'/.exec(xml)?.[1];
  const rata = /currency='RON'\s+rate='([\d.]+)'/.exec(xml)?.[1];
  if (!data || !rata) throw new Error("nu am gasit RON sau data in raspunsul BCE");

  const eurRon = Number(rata);
  // Plaja de siguranta: RON s-a miscat intre 4,4 si 5,6 in ultimul deceniu. O
  // valoare in afara ei inseamna ca formatul s-a schimbat, nu ca leul a explodat.
  if (!Number.isFinite(eurRon) || eurRon < 4 || eurRon > 7) {
    throw new Error(`curs implauzibil: ${rata}`);
  }

  return {
    eurRon,
    data,
    generatLa: new Date().toISOString(),
    sursa: {
      nume: "Banca Centrală Europeană — curs de referință",
      url: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-ron.en.html",
      licenta: "Reutilizare permisă cu indicarea sursei",
    },
  };
}

const nou = await adu();

if (doarVerifica) {
  if (!fs.existsSync(IESIRE)) {
    console.error("EROARE: lipseste src/data/curs-valutar.json. Rulează `node scripts/curs-valutar.mjs`.");
    process.exit(1);
  }
  const vechi = JSON.parse(fs.readFileSync(IESIRE, "utf8"));
  const zile = Math.floor((Date.parse(nou.data) - Date.parse(vechi.data)) / 86400000);
  console.log(`curs local: ${vechi.eurRon} din ${vechi.data} · BCE azi: ${nou.eurRon} din ${nou.data} · diferență ${zile} zile`);
  if (zile > ZILE_MAXIME) {
    console.error(`EROARE: cursul local e mai vechi de ${ZILE_MAXIME} de zile. Rulează scriptul fără --check.`);
    process.exit(1);
  }
  console.log("OK: cursul local e în termen.");
} else {
  fs.mkdirSync(path.dirname(IESIRE), { recursive: true });
  fs.writeFileSync(IESIRE, JSON.stringify(nou, null, 2) + "\n");
  console.log(`scris ${IESIRE}: 1 EUR = ${nou.eurRon} RON, curs BCE din ${nou.data}`);
}
