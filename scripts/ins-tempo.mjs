#!/usr/bin/env node
// scripts/ins-tempo.mjs
// Descarca din TEMPO-Online (INS) seriile de castig salarial folosite de
// paginile /salarii si /compara si le scrie in src/data/ins-caen.json.
//
// De ce script si nu cifre scrise de mana: sursa se actualizeaza lunar, iar
// diferenta fata de restul pietei (care publica inca "date INS 2024") e tocmai
// prospetimea. Rulare reproductibila: `npm run ins:tempo`.
//
// Matrice folosite:
//   FOM107G - castig salarial mediu BRUT lunar, CAEN Rev.3, lunar (serie noua)
//   FOM106G - castig salarial mediu NET lunar, CAEN Rev.3, lunar (serie noua)
//   FOM107E - castig salarial mediu BRUT lunar, CAEN Rev.2, pe judete, anual
//
// Protocolul TEMPO nu e documentat public: GET /matrix/{cod} intoarce
// nomenclatoarele, iar POST pe acelasi URL, cu optiunile selectate in `arr`,
// intoarce un tabel HTML. Structura payloadului e cea folosita de UI-ul TEMPO
// (`sendMatrix`), inclusiv stergerea campului `dimCode` din optiuni.
//
// Licenta sursei: continutul TEMPO se reutilizeaza conform licentei pentru o
// guvernare deschisa (OGL-ROU-1.0), cu indicarea clara a sursei. Paginile
// generate citeaza INS + matricea + perioada de referinta.

import fs from "node:fs/promises";
import path from "node:path";

const BASE = "http://statistici.insse.ro:8077/tempo-ins";
const OUT = path.join(process.cwd(), "src", "data", "ins-caen.json");
const TIMEOUT_MS = 60_000;
const RETRIES = 6;
const MONTHS = 24;

async function req(url, init) {
  let lastError;
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }
  throw new Error(`TEMPO nu a raspuns la ${url}: ${lastError?.message ?? lastError}`);
}

async function matrixMeta(code) {
  return (await req(`${BASE}/matrix/${code}`)).json();
}

/** Trimite selectia si intoarce raspunsul brut, exact ca UI-ul TEMPO. */
async function matrixQuery(code, meta, selections) {
  const arr = selections.map((select, index) =>
    select(meta.dimensionsMap[index].options).map(({ label, nomItemId, offset, parentId }) => ({
      label,
      nomItemId,
      offset,
      parentId,
    })),
  );
  const cells = arr.reduce((total, dimension) => total * dimension.length, 1);
  if (cells > 30_000) {
    throw new Error(`${code}: selectie de ${cells} celule, peste limita TEMPO de 30.000.`);
  }

  const response = await req(`${BASE}/matrix/${code}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: "ro",
      arr,
      matrixName: meta.matrixName,
      matrixDetails: meta.details,
    }),
  });
  return response.json();
}

// ─── Parser pentru tabelul HTML returnat de TEMPO ────────────────────────────
// TEMPO aseaza ultimele doua dimensiuni (timpul si unitatea de masura) pe
// coloane si pe toate celelalte pe randuri, imbricate. In randurile de date,
// "-" inseamna "aceeasi valoare ca pe randul de deasupra".

// Atentie: TEMPO inchide celulele de date malformat — `</td align='right'>` —
// asa ca eticheta de inchidere trebuie sa accepte si atribute.
const CELL_RE = /<(th|td)\b([^>]*)>([\s\S]*?)<\/\1\b[^>]*>/g;
const ROW_RE = /<tr>([\s\S]*?)<\/tr>/g;

function stripTags(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function cellsOf(row) {
  return [...row.matchAll(CELL_RE)].map((match) => ({
    tag: match[1],
    colspan: Number(match[2].match(/colspan='(\d+)'/)?.[1] ?? 1),
    rowspan: Number(match[2].match(/rowspan='(\d+)'/)?.[1] ?? 1),
    text: stripTags(match[3]),
  }));
}

function toNumber(text) {
  const raw = text.replace(/\./g, "").replace(",", ".");
  const numeric = Number(raw);
  return raw !== "" && Number.isFinite(numeric) ? numeric : null;
}

function parseResultTable(html) {
  const rows = [...html.matchAll(ROW_RE)]
    .map((match) => match[1])
    .filter((row) => !/class='yellowTitle'/.test(row) && !/<strong>Legenda:/.test(row));
  if (rows.length === 0) throw new Error("Tabelul TEMPO nu contine randuri.");

  const first = cellsOf(rows[0]);
  const headerRowCount = first[0]?.rowspan ?? 1;
  // Dimensiunile-rand sunt celulele de la inceput care se intind pe tot antetul.
  let rowDims = 0;
  while (rowDims < first.length && first[rowDims].rowspan === headerRowCount) rowDims += 1;

  const tuples = [];
  for (let level = 0; level < headerRowCount; level += 1) {
    const cells = level === 0 ? cellsOf(rows[level]).slice(rowDims) : cellsOf(rows[level]);
    let column = 0;
    for (const cell of cells) {
      for (let i = 0; i < cell.colspan; i += 1) {
        (tuples[column] = tuples[column] ?? []).push(cell.text);
        column += 1;
      }
    }
  }
  // Nivelurile pare sunt numele dimensiunilor, cele impare valorile lor.
  const columns = tuples.map((tuple) => tuple.filter((_, index) => index % 2 === 1));

  const data = [];
  const carried = [];
  for (const row of rows.slice(headerRowCount)) {
    const cells = cellsOf(row);
    if (cells.length <= rowDims) continue;
    const labels = cells.slice(0, rowDims).map((cell, index) => {
      if (cell.text !== "-") carried[index] = cell.text;
      return carried[index];
    });
    data.push({ labels, values: cells.slice(rowDims).map((cell) => toNumber(cell.text)) });
  }

  return { rowDims, columns, rows: data };
}

// ─── Selectii ────────────────────────────────────────────────────────────────

const all = (options) => options;
const lastMonths = (count) => (options) => options.slice(-count);
const byLabel = (test) => (options) => options.filter((option) => test(option.label.trim()));

async function serieLunara(code) {
  const meta = await matrixMeta(code);
  const result = await matrixQuery(code, meta, [all, lastMonths(MONTHS), all]);
  const parsed = parseResultTable(result.resultTable);
  return {
    matrice: code,
    denumire: meta.matrixName,
    ultimaActualizare: meta.ultimaActualizare,
    luni: parsed.columns.map((tuple) => tuple[0]),
    activitati: parsed.rows.map((row) => ({ caen: row.labels[0], valori: row.values })),
  };
}

async function serieJudete() {
  const code = "FOM107E";
  const meta = await matrixMeta(code);
  const ani = meta.dimensionsMap[3].options;
  const ultimulAn = ani[ani.length - 1];
  // Randul national („TOTAL") intra in aceeasi cerere: fara el, abaterea unui
  // judet ar trebui raportata la seria lunara pe CAEN Rev.3, adica la alt an si
  // la alta clasificare — o comparatie care arata toate judetele sub medie.
  const result = await matrixQuery(code, meta, [
    all,
    byLabel((label) => label === "Total"),
    byLabel((label) => label === "TOTAL" || !/^(TOTAL|MACROREGIUNEA|Regiunea)/.test(label)),
    () => [ultimulAn],
    all,
  ]);
  const parsed = parseResultTable(result.resultTable);

  const perCaen = new Map();
  for (const row of parsed.rows) {
    const caen = row.labels[0];
    const regiune = row.labels[row.labels.length - 1].trim();
    if (!perCaen.has(caen)) perCaen.set(caen, { national: null, valori: {} });
    if (regiune === "TOTAL") perCaen.get(caen).national = row.values[0];
    else perCaen.get(caen).valori[regiune] = row.values[0];
  }

  return {
    matrice: code,
    denumire: meta.matrixName,
    ultimaActualizare: meta.ultimaActualizare,
    an: ultimulAn.label,
    activitati: [...perCaen].map(([caen, date]) => ({ caen, national: date.national, valori: date.valori })),
  };
}

/** Ancheta din octombrie, pe grupe majore de ocupatii ISCO-08 si pe varste.
 *  E singura sursa INS care priveste dinspre OCUPATIE, nu dinspre sectorul
 *  angajatorului — si singura care arata cum creste salariul cu varsta. */
async function serieOcupatii() {
  const code = "FOM121B";
  const meta = await matrixMeta(code);
  const ani = meta.dimensionsMap[4].options;
  const ultimulAn = ani[ani.length - 1];
  const result = await matrixQuery(code, meta, [
    all,
    all,
    all,
    byLabel((label) => label === "Total"),
    () => [ultimulAn],
    all,
  ]);
  const parsed = parseResultTable(result.resultTable);

  // Randuri: [indicator, grupa de varsta, grupa ISCO, sex]; coloane: an x UM.
  const unitati = parsed.columns.map((tuple) => tuple[1]);
  const perGrupa = new Map();
  for (const row of parsed.rows) {
    const [indicator, varsta, isco] = row.labels;
    if (!perGrupa.has(isco)) perGrupa.set(isco, {});
    const bucket = perGrupa.get(isco);
    const cheieVarsta = varsta.trim();
    bucket[cheieVarsta] = bucket[cheieVarsta] ?? {};
    // Fiecare indicator are o singura unitate de masura cu sens.
    const valoare = row.values.find((value, index) =>
      value !== null && (indicator.startsWith("Numarul") ? unitati[index] === "Numar persoane" : unitati[index] !== "Numar persoane"),
    );
    const cheie = indicator.startsWith("Numarul")
      ? "salariati"
      : indicator.startsWith("Salariul")
        ? "salariuDeBaza"
        : "venitBrut";
    bucket[cheieVarsta][cheie] = valoare ?? null;
  }

  return {
    matrice: code,
    denumire: meta.matrixName,
    ultimaActualizare: meta.ultimaActualizare,
    an: ultimulAn.label,
    grupe: [...perGrupa].map(([isco, varste]) => ({ isco, varste })),
  };
}

const brut = await serieLunara("FOM107G");
const net = await serieLunara("FOM106G");
const judete = await serieJudete();
const ocupatii = await serieOcupatii();

const payload = {
  generatLa: new Date().toISOString().slice(0, 10),
  sursa: {
    nume: "Institutul Național de Statistică — TEMPO-Online",
    url: "http://statistici.insse.ro:8077/tempo-online/",
    licenta: "Licența pentru o guvernare deschisă (OGL-ROU-1.0)",
  },
  brut,
  net,
  judete,
  ocupatii,
};

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const numarJudete = Object.keys(judete.activitati[0]?.valori ?? {}).length;
console.log(`Scris ${OUT}`);
console.log(`  brut  ${brut.activitati.length} activitati x ${brut.luni.length} luni (ultima: ${brut.luni.at(-1)})`);
console.log(`  net   ${net.activitati.length} activitati x ${net.luni.length} luni (ultima: ${net.luni.at(-1)})`);
console.log(`  jud.  ${judete.activitati.length} activitati x ${numarJudete} judete (${judete.an})`);
console.log(`  ISCO  ${ocupatii.grupe.length} grupe majore x ${Object.keys(ocupatii.grupe[0]?.varste ?? {}).length} grupe de varsta (${ocupatii.an})`);
