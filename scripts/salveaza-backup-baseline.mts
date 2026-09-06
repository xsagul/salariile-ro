// scripts/salveaza-backup-baseline.mts
// Salvează instantaneul complet al celor 132 de meserii ca bază de siguranță.

import fs from "node:fs";
import path from "node:path";
import { MESERII, dateMeserieSauEroare } from "../src/lib/meserii";
import { reperMeserie } from "../src/lib/repere-meserii";
import { indicatorMeserie } from "../src/lib/indicator-meserie";

const snapshot = MESERII.map((m, idx) => {
  const d = dateMeserieSauEroare(m);
  const r = reperMeserie(d);
  const ind = indicatorMeserie(r);
  return {
    index: idx + 1,
    loc: d.clasament?.loc ?? idx + 1,
    slug: m.slug,
    nume: m.nume,
    net: ind.value,
    categorie: m.categorie,
    caen3: m.caen3,
    caen2: m.caen2,
    isco: m.isco,
    cor: m.cor ?? null,
    kind: r.kind,
    label: r.label,
    period: r.period,
    population: r.population,
    source: r.source,
    url: r.url,
    note: r.note,
  };
}).sort((a, b) => a.loc - b.loc);

const jsonPath = path.resolve(process.cwd(), "src/data/backup-baseline-132-meserii-2026-09-06.json");
fs.writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2), "utf8");

const txtPath = path.resolve(process.cwd(), "src/data/backup-baseline-132-meserii-2026-09-06.txt");
const txtContent = [
  "================================================================================",
  "   BACKUP BAZĂ SALARIALĂ — 132 MESERII SALARIILE.RO (6 SEPTEMBRIE 2026)",
  "================================================================================\n",
  ...snapshot.map(
    (s) =>
      `[#${String(s.loc).padStart(3, " ")}] ${s.nume.padEnd(26, " ")} | ${String(s.net).padStart(6, " ")} lei net | ${s.kind.padEnd(17, " ")} | ISCO: ${s.isco.padEnd(12, " ")} | CAEN: ${s.caen3.padEnd(3, " ")} | Sursa: ${s.source} (${s.period})`,
  ),
  "\n================================================================================",
].join("\n");

fs.writeFileSync(txtPath, txtContent, "utf8");

console.log(`✓ Backup JSON salvat cu succes: ${jsonPath} (${snapshot.length} meserii)`);
console.log(`✓ Backup TXT salvat cu succes: ${txtPath} (${snapshot.length} meserii)`);
