import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const datasetModulePath = "../src/lib/date-salarii.ts";
const {
  LATEST_INS_EARNINGS,
  SALARY_DATA_2026,
  SALARY_DATASET_REFERENCE_DATE,
  SALARY_DATASET_SOURCES,
  SALARY_DATASET_USAGE_TERMS,
  SALARY_DATASET_VERSION,
} = await import(datasetModulePath) as typeof import("../src/lib/date-salarii");

const projectRoot = process.cwd();
const jsonPath = path.join(projectRoot, "public", "date-salarii-romania-2026.json");
const csvPath = path.join(projectRoot, "public", "date-salarii-romania-2026.csv");
const insTempoPath = path.join(projectRoot, "src", "data", "ins-caen.json");

const publicJson = JSON.parse(await readFile(jsonPath, "utf8"));
const insTempo = JSON.parse(await readFile(insTempoPath, "utf8"));

const ultimaLunaBrut = insTempo.brut.luni.at(-1);
const ultimaLunaNet = insTempo.net.luni.at(-1);
const totalBrut = insTempo.brut.activitati.find((row: { caen: string }) => row.caen.startsWith("TOTAL"));
const totalNet = insTempo.net.activitati.find((row: { caen: string }) => row.caen.startsWith("TOTAL"));

assert.equal(
  ultimaLunaBrut,
  `Luna ${LATEST_INS_EARNINGS.periodLabel}`,
  "Datasetul public a rămas în urma ultimei luni brute din TEMPO",
);
assert.equal(ultimaLunaNet, ultimaLunaBrut, "Seriile brute și nete INS nu au aceeași lună de referință");
assert.ok(totalBrut && totalNet, "Rândul TOTAL ECONOMIE lipsește din datele TEMPO");
assert.equal(totalBrut.valori.at(-1), LATEST_INS_EARNINGS.grossLei, "Brutul INS public nu corespunde TOTAL ECONOMIE");
assert.equal(totalNet.valori.at(-1), LATEST_INS_EARNINGS.netLei, "Netul INS public nu corespunde TOTAL ECONOMIE");

assert.equal(publicJson.version, SALARY_DATASET_VERSION, "Versiunea JSON nu corespunde modulului TypeScript");
assert.equal(
  publicJson.reference_date,
  SALARY_DATASET_REFERENCE_DATE,
  "Data de referință JSON nu corespunde modulului TypeScript",
);
assert.equal(
  publicJson.usage_terms,
  SALARY_DATASET_USAGE_TERMS,
  "Termenii de reutilizare diferă între JSON și pagina generată",
);
assert.deepEqual(publicJson.sources, SALARY_DATASET_SOURCES, "Sursele JSON nu corespund sursei unice TypeScript");
assert.deepEqual(publicJson.records, SALARY_DATA_2026, "Înregistrările JSON nu corespund sursei unice TypeScript");

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  assert.equal(quoted, false, "CSV-ul se termină în interiorul unui câmp citat");
  return rows;
}

const csvRows = parseCsv(await readFile(csvPath, "utf8"));
const expectedHeader = [
  "id",
  "indicator",
  "period_label",
  "period_start",
  "period_end",
  "gross_lei",
  "net_lei",
  "gross_value_type",
  "net_value_type",
  "source_ids",
  "source_urls",
  "reference_date",
  "methodology_note",
];

assert.deepEqual(csvRows[0], expectedHeader, "Antetul CSV nu este cel documentat");
assert.equal(csvRows.length - 1, SALARY_DATA_2026.length, "CSV-ul nu are toate înregistrările");

const csvObjects = csvRows.slice(1).map((values) =>
  Object.fromEntries(expectedHeader.map((key, index) => [key, values[index]])),
);

for (const record of SALARY_DATA_2026) {
  const csvRecord = csvObjects.find((candidate) => candidate.id === record.id);
  assert.ok(csvRecord, "Lipsește din CSV înregistrarea " + record.id);
  assert.equal(csvRecord.indicator, record.indicator);
  assert.equal(csvRecord.period_label, record.period_label);
  assert.equal(csvRecord.period_start, record.period_start);
  assert.equal(csvRecord.period_end, record.period_end);
  assert.equal(csvRecord.gross_lei, String(record.gross_lei));
  assert.equal(csvRecord.net_lei, record.net_lei === null ? "" : String(record.net_lei));
  assert.equal(csvRecord.gross_value_type, record.gross_value_type);
  assert.equal(csvRecord.net_value_type, record.net_value_type);
  assert.equal(csvRecord.source_ids, record.source_ids.join("|"));
  assert.equal(
    csvRecord.source_urls,
    record.source_ids.map((sourceId) => SALARY_DATASET_SOURCES[sourceId].official_url).join("|"),
  );
  assert.equal(csvRecord.reference_date, SALARY_DATASET_REFERENCE_DATE);
  assert.equal(csvRecord.methodology_note, record.methodology_note);
}

console.log("OK: datasetul salarial TypeScript, JSON și CSV este sincronizat (4 înregistrări, 5 surse).");
