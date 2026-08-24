import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AN_OCUPATII,
  FACTOR_INDEXARE_OCUPATII,
  LUNA_REFERINTA,
  MATRICE_OCUPATII,
  MATRICE_RATE_VACANTE,
  MATRICE_VACANTE,
  PERIOADA_VACANTE,
  diferentaSexeTotal,
  diferenteSexePeGrupe,
  diferenteSexePeVarste,
  grupaIsco,
  indexatLaZi,
  vacantePeGrupe,
  vacanteTotal,
  type DiferentaSexe,
  type Vacante,
} from "../src/lib/ins-date";

const ROOT = process.cwd();
const CHECK_ONLY = process.argv.includes("--check");

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csv(rows: unknown[][]): string {
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function percent(value: number | null): string {
  return value === null ? "" : (value * 100).toFixed(2);
}

const totalVacante = vacanteTotal();
const vacante = [totalVacante, ...vacantePeGrupe()].filter(
  (row): row is Vacante => row !== null,
);
const vacanciesCsv = csv([
  [
    "grupa_isco",
    "denumire",
    "posturi_vacante",
    "rata_procente",
    "variatie_anuala_procente",
    "salariu_brut_grupa_indexat_lei",
    "perioada_vacante",
    "perioada_salariu_isco",
    "luna_tinta_indexare_salariu",
    "factor_indexare_salariu",
    "matrice_vacante_ins",
    "matrice_rate_ins",
    "matrice_salariala_ins",
  ],
  ...vacante.map((row) => {
    const salariu = row.grupa === "total" ? null : grupaIsco(row.grupa);
    return [
      row.grupa,
      row.nume,
      row.posturi,
      row.rata,
      percent(row.variatieAnuala),
      salariu ? indexatLaZi(salariu.venitBrutTotal) : null,
      PERIOADA_VACANTE,
      AN_OCUPATII,
      LUNA_REFERINTA,
      salariu ? FACTOR_INDEXARE_OCUPATII : null,
      MATRICE_VACANTE,
      MATRICE_RATE_VACANTE,
      MATRICE_OCUPATII,
    ];
  }),
]);

const totalSexe = diferentaSexeTotal();
const grupeSexe = [totalSexe, ...diferenteSexePeGrupe()].filter(
  (row): row is DiferentaSexe => row !== null,
);
const varsteSexe = diferenteSexePeVarste();
const genderCsv = csv([
  [
    "dimensiune",
    "categorie",
    "denumire",
    "brut_masculin_lei",
    "brut_feminin_lei",
    "diferenta_fata_de_masculin_procente",
    "salariati_masculin",
    "salariati_feminin",
    "pondere_femei_procente",
    "perioada",
    "matrice_ins",
  ],
  ...grupeSexe.map((row) => [
    row.grupa === "total" ? "total" : "grupa_isco",
    row.grupa,
    row.nume,
    row.brutMasculin,
    row.brutFeminin,
    percent(row.diferenta),
    row.salariatiMasculin,
    row.salariatiFeminin,
    percent(row.pondereFemei),
    AN_OCUPATII,
    MATRICE_OCUPATII,
  ]),
  ...varsteSexe.map((row) => [
    "varsta_total_economie",
    row.varsta,
    row.varsta,
    row.brutMasculin,
    row.brutFeminin,
    percent(row.diferenta),
    null,
    null,
    null,
    AN_OCUPATII,
    MATRICE_OCUPATII,
  ]),
]);

const outputs = new Map([
  ["public/date-locuri-vacante-romania.csv", vacanciesCsv],
  ["public/date-diferente-salariale-femei-barbati-romania.csv", genderCsv],
]);

for (const [relativePath, content] of outputs) {
  const outputPath = path.join(ROOT, relativePath);
  if (CHECK_ONLY) {
    const existing = await readFile(outputPath, "utf8");
    assert.equal(existing, content, `${relativePath} nu mai este sincronizat cu datele INS.`);
  } else {
    await writeFile(outputPath, content, "utf8");
    console.log(`Generat: ${relativePath}`);
  }
}

if (CHECK_ONLY) console.log(`Active INS publice: ${outputs.size} fișiere sincronizate.`);
