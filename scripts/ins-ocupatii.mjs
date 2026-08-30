#!/usr/bin/env node
// scripts/ins-ocupatii.mjs
//
// Extrage din TEMPO matricea FOM121A: castigul pe INTERSECTIA activitate x
// ocupatie, plus numarul de salariati din fiecare celula.
//
// DE CE EXISTA. Pana acum am afirmat, in comentariul din `src/lib/meserii.ts`,
// ca INS publica doar doua marginale — activitatea angajatorului (CAEN) si
// grupa de ocupatii (ISCO) — si ca intersectia lor nu se publica. AFIRMATIA ERA
// FALSA. Verificat pe 31 august 2026, pe tot catalogul TEMPO (1.916 matrice):
// FOM121A incruciseaza CAEN Rev.2 (67 activitati) cu grupele majore ISCO-08,
// pe forme de proprietate, sexe si 11 ani, ultimul fiind 2024.
//
// Diferenta e mare. Pentru un programator, unde inainte aratam doua cifre care
// nu se intalnesc — 22.689 media sectorului IT si 14.122 reperul specialistilor
// din toata economia — intersectia da 18.565 lei brut (oct. 2024). Nu e media
// lor si nu se putea deduce din ele.
//
// CE NU REZOLVA. Tot nu exista salariu pe ocupatie individuala. COR nu apare
// nicaieri in TEMPO: fiecare matrice de salarii cu dimensiune ocupationala are
// exact 10 optiuni, Total plus cele 9 grupe majore. „Specialisti in servicii IT"
// ramane o grupa, nu „programator". E mai aproape, nu exact.
//
// GRANULARITATE MAXIMA. Tragem tot ce se poate: toate cele 67 de activitati,
// toate cele 10 grupe, ambele sexe plus totalul, toate cele 3 forme de
// proprietate, toti anii, si atat castigul cat si numarul de salariati — ultimul
// ca sa stim cate celule sunt suprimate si cat de solida e fiecare cifra.
//
// Folosire:  node scripts/ins-ocupatii.mjs [--ani=3]
// Iesire:    src/data/ins-ocupatii-caen.json

import fs from "node:fs/promises";
import path from "node:path";
import { LIMITA_CELULE, dupaEticheta, matrixMeta, matrixQuery, parseResultTable, toate } from "./lib-tempo.mjs";

const COD = "FOM121A";
const OUT = path.join(process.cwd(), "src", "data", "ins-ocupatii-caen.json");
const NR_ANI = Number((process.argv.find((a) => a.startsWith("--ani=")) ?? "").split("=")[1]) || 11;

const meta = await matrixMeta(COD);
const dims = meta.dimensionsMap;
const idx = (test) => dims.findIndex((d) => test(d.label.toLowerCase()));
const I = {
  masura: idx((l) => l.startsWith("salariati")),
  proprietate: idx((l) => l.includes("proprietate")),
  caen: idx((l) => l.includes("caen")),
  isco: idx((l) => l.includes("ocupat")),
  sexe: idx((l) => l.includes("sexe")),
  ani: idx((l) => l.includes("ani")),
  um: idx((l) => l.includes("unitati")),
};
for (const [nume, i] of Object.entries(I)) {
  if (i < 0) throw new Error(`Dimensiunea „${nume}" lipseste din ${COD}. Structura matricei s-a schimbat.`);
}

const anii = dims[I.ani].options.slice(-NR_ANI);
console.log(`${COD} — ${meta.matrixName.slice(0, 78)}…`);
console.log(`ani: ${anii.map((a) => a.label).join(", ")}`);
console.log(`activitati: ${dims[I.caen].options.length} · grupe: ${dims[I.isco].options.length}\n`);

/**
 * Un an, o masura. Interogarea completa ar depasi limita TEMPO, iar unitatea de
 * masura difera intre castig (lei) si efectiv (numar persoane), deci nu pot sta
 * in aceeasi cerere fara sa produca jumatate de tabel gol.
 */
async function trage(an, testMasura, testUm) {
  const selectii = dims.map((_, i) => {
    if (i === I.masura) return dupaEticheta(testMasura);
    if (i === I.ani) return dupaEticheta((l) => l === an.label.trim());
    if (i === I.um) return dupaEticheta(testUm);
    return toate;
  });
  const celule = selectii.reduce((t, sel, i) => t * sel(dims[i].options).length, 1);
  if (celule > LIMITA_CELULE) throw new Error(`${an.label}: ${celule} celule, peste limita.`);
  const raspuns = await matrixQuery(COD, meta, selectii);
  return parseResultTable(raspuns.resultTable);
}

const MASURI = [
  { cheie: "venitBrut", test: (l) => /^venitul brut realizat/i.test(l), um: (l) => /^lei$/i.test(l) },
  { cheie: "salariuBaza", test: (l) => /^salariul\s+brut de baza/i.test(l), um: (l) => /^lei$/i.test(l) },
  { cheie: "salariati", test: (l) => /^numarul salariatilor/i.test(l), um: (l) => /numar persoane/i.test(l) },
];

// celule[an][masura][caen][isco][sex] = numar sau null
const date = {};
let cereri = 0, suprimate = 0, total = 0;

for (const an of anii) {
  const peAn = {};
  for (const m of MASURI) {
    const parsed = await trage(an, m.test, m.um);
    cereri += 1;
    for (const rand of parsed.rows) {
      // labels: [masura, proprietate, caen, isco, sexe]
      const [, proprietate, caen, isco, sex] = rand.labels;
      const valoare = rand.values[0];
      const brut = rand.brut[0];
      if (valoare === null && /^c$/i.test(brut ?? "")) suprimate += 1;
      total += 1;
      const p = (peAn[m.cheie] ??= {});
      const pp = (p[proprietate] ??= {});
      const pc = (pp[caen] ??= {});
      const pi = (pc[isco] ??= {});
      pi[sex] = valoare;
    }
    process.stdout.write(`\r  ${an.label} · ${m.cheie.padEnd(12)} · ${cereri} cereri`);
  }
  date[an.label] = peAn;
}
console.log();

// ─── Iesire ──────────────────────────────────────────────────────────────────
//
// Formatul e pe INDICI, nu pe etichete. Cu etichete repetate, fisierul iese la
// 5,5 MB si intra tot in bundle-ul Next. Pe indici, aceleasi date incap in sub
// 5% din asta. Nomenclatoarele stau o singura data, in cap.

const nom = {
  caen: dims[I.caen].options.map((o) => o.label.trim()),
  isco: dims[I.isco].options.map((o) => o.label.trim()),
  sexe: dims[I.sexe].options.map((o) => o.label.trim()),
  proprietate: dims[I.proprietate].options.map((o) => o.label.trim()),
  ani: anii.map((a) => a.label.trim()),
  masuri: MASURI.map((m) => m.cheie),
};
// celule[an][masura][proprietate][caen][isco][sex]
const celule = nom.ani.map((an) =>
  nom.masuri.map((masura) =>
    nom.proprietate.map((prop) =>
      nom.caen.map((caen) =>
        nom.isco.map((isco) =>
          nom.sexe.map((sex) => date[an]?.[masura]?.[prop]?.[caen]?.[isco]?.[sex] ?? null),
        ),
      ),
    ),
  ),
);

const payload = {
  matrice: COD,
  denumire: meta.matrixName,
  ultimaActualizare: meta.ultimaActualizare ?? null,
  generatLa: new Date().toISOString().slice(0, 10),
  sursa: {
    nume: "Institutul Național de Statistică — TEMPO-Online",
    url: "http://statistici.insse.ro:8077/tempo-online/",
    licenta: "Licența pentru o guvernare deschisă (OGL-ROU-1.0)",
  },
  nomenclatoare: nom,
  /** Indexat [an][masura][proprietate][caen][isco][sex]. */
  celule,
};

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(payload), "utf8");
const kb = ((await fs.stat(OUT)).size / 1024).toFixed(0);

console.log(`
scris ${path.relative(process.cwd(), OUT)} — ${kb} KB`);
console.log(`celule: ${total.toLocaleString("ro-RO")} · confidentiale: ${suprimate.toLocaleString("ro-RO")} (${((100 * suprimate) / total).toFixed(1)}%)`);
console.log(`dimensiuni: ${nom.ani.length} ani × ${nom.masuri.length} masuri × ${nom.proprietate.length} proprietate × ${nom.caen.length} CAEN × ${nom.isco.length} ISCO × ${nom.sexe.length} sexe`);
