// scripts/lib-tempo.mjs
//
// Client minimal pentru TEMPO-Online (INS). Extras din `ins-tempo.mjs`, care
// ramane neatins — pipeline-ul lui functioneaza si nu merita destabilizat.
// Scripturile noi importa de aici.
//
// Protocolul nu e documentat public: GET /matrix/{cod} intoarce nomenclatoarele,
// iar POST pe acelasi URL, cu optiunile selectate in `arr`, intoarce un tabel
// HTML. Structura payloadului e cea folosita de UI-ul TEMPO (`sendMatrix`),
// inclusiv stergerea campului `dimCode` din optiuni.
//
// Licenta sursei: continutul TEMPO se reutilizeaza conform licentei pentru o
// guvernare deschisa (OGL-ROU-1.0), cu indicarea clara a sursei.

export const BASE = "http://statistici.insse.ro:8077/tempo-ins";
const TIMEOUT_MS = 60_000;
const RETRIES = 6;
/** Limita pe care o impune TEMPO unei singure interogari. */
export const LIMITA_CELULE = 30_000;

export async function req(url, init) {
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

export async function matrixMeta(code) {
  return (await req(`${BASE}/matrix/${code}`)).json();
}

/**
 * `selections` e un tablou de functii, una per dimensiune, care primeste
 * optiunile dimensiunii si intoarce subsetul dorit.
 */
export async function matrixQuery(code, meta, selections) {
  const arr = selections.map((select, index) =>
    select(meta.dimensionsMap[index].options).map(({ label, nomItemId, offset, parentId }) => ({
      label,
      nomItemId,
      offset,
      parentId,
    })),
  );
  const celule = arr.reduce((total, dimension) => total * dimension.length, 1);
  if (celule === 0) throw new Error(`${code}: selectie goala pe cel putin o dimensiune.`);
  if (celule > LIMITA_CELULE) {
    throw new Error(`${code}: selectie de ${celule} celule, peste limita TEMPO de ${LIMITA_CELULE}.`);
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
// TEMPO aseaza ultimele doua dimensiuni pe coloane si pe toate celelalte pe
// randuri, imbricate. In randurile de date, "-" inseamna "aceeasi valoare ca pe
// randul de deasupra".
//
// Atentie: TEMPO inchide celulele de date malformat — `</td align='right'>` —
// asa ca eticheta de inchidere trebuie sa accepte si atribute.

const CELL_RE = /<(th|td)\b([^>]*)>([\s\S]*?)<\/\1\b[^>]*>/g;
const ROW_RE = /<tr>([\s\S]*?)<\/tr>/g;

const stripTags = (value) =>
  value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();

const cellsOf = (row) =>
  [...row.matchAll(CELL_RE)].map((match) => ({
    tag: match[1],
    colspan: Number(match[2].match(/colspan='(\d+)'/)?.[1] ?? 1),
    rowspan: Number(match[2].match(/rowspan='(\d+)'/)?.[1] ?? 1),
    text: stripTags(match[3]),
  }));

/**
 * `null` acopera si celulele suprimate de INS: ':' pentru date lipsa si 'c'
 * pentru date confidentiale. Distinctia se pastreaza in `brut`, ca apelantul
 * sa poata numara cate celule sunt confidentiale.
 */
function toNumber(text) {
  const raw = text.replace(/\./g, "").replace(",", ".");
  const numeric = Number(raw);
  return raw !== "" && Number.isFinite(numeric) ? numeric : null;
}

export function parseResultTable(html) {
  const rows = [...html.matchAll(ROW_RE)]
    .map((match) => match[1])
    .filter((row) => !/class='yellowTitle'/.test(row) && !/<strong>Legenda:/.test(row));
  if (rows.length === 0) throw new Error("Tabelul TEMPO nu contine randuri.");

  const first = cellsOf(rows[0]);
  const headerRowCount = first[0]?.rowspan ?? 1;
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
    data.push({
      labels,
      values: cells.slice(rowDims).map((cell) => toNumber(cell.text)),
      brut: cells.slice(rowDims).map((cell) => cell.text),
    });
  }
  return { rowDims, columns, rows: data };
}

// Selectoare uzuale.
export const toate = (options) => options;
export const ultimele = (n) => (options) => options.slice(-n);
export const dupaEticheta = (test) => (options) => options.filter((o) => test(o.label.trim()));
