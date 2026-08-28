// scripts/test-context-drift.mts
//
// Împiedică documentele de context să rămână în urma codului.
//
// Motivul, concret: până pe 28 august 2026, AGENTS.md era o copie a CLAUDE.md.
// Copia a divergit tăcut și a păstrat strategia veche („monetizare prin AdSense",
// „tranziție profesională către front-end") — exact afirmațiile corectate în
// CLAUDE.md pentru că trimiseseră o sesiune pe direcția greșită. Nimic nu a
// semnalat-o, pentru că nimic nu verifica documentele.
//
// Ce verifică:
//   1. Blocul fiscal marcat din CLAUDE.md conține numai valori pe care le deține
//      codul (fiscal.ts, date-salarii.ts) — și le conține pe toate cele cheie.
//   2. AGENTS.md rămâne pointer, fără fapte proprii care pot diverge.
//   3. Nicio strategie respinsă nu reapare în documentele vii.
//
// Ce NU verifică, deliberat: PROGRES.md (jurnal append-only — o cifră veche
// acolo e o înregistrare corectă a ce era adevărat atunci), ROADMAP-90-ZILE.md
// și fișierele cu dată în nume (arhivă + slug-uri de rute live, de exemplu
// `/calculator/calcul-salariu-net-4325-brut`, unde cifra e parte din URL).

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fiscalPath = "../src/lib/fiscal.ts";
const dateSalariiPath = "../src/lib/date-salarii.ts";

const {
  SALARIU_MINIM,
  CAS_PROCENT,
  CASS_PROCENT,
  IMPOZIT_PROCENT,
  CAM_PROCENT,
  DEDUCERE_MINIM,
  PLAFON_FACILITATE,
  REGIMURI_FISCALE_SALARIU,
} = (await import(fiscalPath)) as typeof import("../src/lib/fiscal");

const { LATEST_INS_EARNINGS, SALARY_DATA_2026 } =
  (await import(dateSalariiPath)) as typeof import("../src/lib/date-salarii");

const esec: string[] = [];
const raporteaza = (mesaj: string) => esec.push(mesaj);

// ─── Valorile pe care codul le deține ────────────────────────────────────────

function dinDataset(id: string) {
  const record = SALARY_DATA_2026.find((x) => x.id === id);
  assert.ok(record, `Înregistrarea "${id}" lipsește din SALARY_DATA_2026`);
  return record;
}

const minimS1 = REGIMURI_FISCALE_SALARIU["2026-S1"];
const minimS2 = dinDataset("minimum_wage_h2_2026");
const bass = dinDataset("bass_average_indicator_2026");

// lei → sursa care deține valoarea. Orice „N lei" din blocul marcat trebuie
// să fie una dintre astea.
const LEI_DETINUTI = new Map<number, string>([
  [SALARIU_MINIM, "fiscal.ts → SALARIU_MINIM"],
  [minimS1.salariuMinim, "fiscal.ts → REGIMURI_FISCALE_SALARIU[2026-S1].salariuMinim"],
  [minimS2.net_lei!, "date-salarii.ts → minimum_wage_h2_2026.net_lei"],
  [DEDUCERE_MINIM, "fiscal.ts → DEDUCERE_MINIM"],
  [PLAFON_FACILITATE, "fiscal.ts → PLAFON_FACILITATE"],
  [minimS1.plafonFacilitate, "fiscal.ts → REGIMURI_FISCALE_SALARIU[2026-S1].plafonFacilitate"],
  [bass.gross_lei, "date-salarii.ts → bass_average_indicator_2026.gross_lei"],
  [bass.net_lei!, "date-salarii.ts → bass_average_indicator_2026.net_lei"],
  [LATEST_INS_EARNINGS.grossLei, "date-salarii.ts → LATEST_INS_EARNINGS.grossLei"],
  [LATEST_INS_EARNINGS.netLei, "date-salarii.ts → LATEST_INS_EARNINGS.netLei"],
  [SALARIU_MINIM + 2000, "fiscal.ts → SALARIU_MINIM + 2000 (plafon deducere personală)"],
]);

// procente deținute, exprimate ca număr de procent (25, 10, 2,25)
const PROCENTE_DETINUTE = new Map<number, string>([
  [CAS_PROCENT * 100, "fiscal.ts → CAS_PROCENT"],
  [CASS_PROCENT * 100, "fiscal.ts → CASS_PROCENT"],
  [IMPOZIT_PROCENT * 100, "fiscal.ts → IMPOZIT_PROCENT"],
  [CAM_PROCENT * 100, "fiscal.ts → CAM_PROCENT"],
]);

// Valorile fără de care blocul nu-și mai face treaba de briefing.
const OBLIGATORII_IN_BLOC: readonly (readonly [number, string])[] = [
  [SALARIU_MINIM, "salariul minim curent"],
  [LATEST_INS_EARNINGS.grossLei, "câștigul mediu INS brut"],
  [LATEST_INS_EARNINGS.netLei, "câștigul mediu INS net"],
];

// ─── Ajutoare ────────────────────────────────────────────────────────────────

// „4.325" → 4325 ; „2,25" → 2.25 (format ro-RO)
const numarRo = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));

const MARCAJ_START = "<!-- fiscal:start";
const MARCAJ_END = "<!-- fiscal:end";

function extrageBloc(text: string, fisier: string): string | null {
  const start = text.indexOf(MARCAJ_START);
  const end = text.indexOf(MARCAJ_END);
  if (start === -1 || end === -1) {
    raporteaza(
      `${fisier}: lipsește blocul marcat "${MARCAJ_START} ... ${MARCAJ_END}". ` +
        "Fără el, constantele fiscale din document nu sunt verificate contra codului.",
    );
    return null;
  }
  if (end < start) {
    raporteaza(`${fisier}: marcajele fiscale sunt inversate.`);
    return null;
  }
  return text.slice(start, end);
}

// ─── 1. Blocurile fiscale marcate ────────────────────────────────────────────
//
// Orice document poate declara un bloc verificat punând marcajele în jurul lui.
// CLAUDE.md e obligat să aibă unul (e briefing-ul încărcat automat); restul îl
// au opțional, dar dacă îl au, e verificat la fel de strict.

const CU_BLOC_OBLIGATORIU = ["CLAUDE.md"];
const CU_BLOC_OPTIONAL = ["README.md"];

for (const fisier of [...CU_BLOC_OBLIGATORIU, ...CU_BLOC_OPTIONAL]) {
  const text = await readFile(fisier, "utf8");
  const optional = CU_BLOC_OPTIONAL.includes(fisier);
  if (optional && !text.includes(MARCAJ_START)) continue;

  const bloc = extrageBloc(text, fisier);
  if (!bloc) continue;

  verificaBloc(bloc, fisier, { ceruteValori: !optional });
}

function verificaBloc(bloc: string, fisier: string, opt: { ceruteValori: boolean }) {
  for (const gasit of bloc.matchAll(/(\d[\d.,]*)\s*lei/gi)) {
    const valoare = numarRo(gasit[1]);
    if (!LEI_DETINUTI.has(valoare)) {
      const cunoscute = [...LEI_DETINUTI.keys()].sort((a, b) => a - b).join(", ");
      raporteaza(
        `${fisier}, bloc fiscal: „${gasit[0]}" nu corespunde niciunei valori din cod.\n` +
          `    Valori deținute: ${cunoscute}.\n` +
          "    Ori codul s-a schimbat și documentul a rămas în urmă, ori cifra n-are proprietar.",
      );
    }
  }

  for (const gasit of bloc.matchAll(/(\d+(?:,\d+)?)\s*%/g)) {
    const valoare = numarRo(gasit[1]);
    if (!PROCENTE_DETINUTE.has(valoare)) {
      const cunoscute = [...PROCENTE_DETINUTE.keys()]
        .sort((a, b) => a - b)
        .map((p) => `${p}%`)
        .join(", ");
      raporteaza(
        `${fisier}, bloc fiscal: procentul „${gasit[0]}" nu corespunde niciunei cote din fiscal.ts.\n` +
          `    Cote deținute: ${cunoscute}.`,
      );
    }
  }

  if (!opt.ceruteValori) return;

  for (const [valoare, eticheta] of OBLIGATORII_IN_BLOC) {
    const format = valoare.toLocaleString("ro-RO");
    if (!bloc.includes(format) && !bloc.includes(String(valoare))) {
      raporteaza(
        `${fisier}, bloc fiscal: lipsește ${eticheta} (${format} lei). ` +
          "Blocul e briefing-ul încărcat automat — dacă valoarea nu e acolo, nu există.",
      );
    }
  }
}

// ─── 2. AGENTS.md trebuie să rămână pointer ──────────────────────────────────

const agents = await readFile("AGENTS.md", "utf8");

if (agents.includes(MARCAJ_START)) {
  raporteaza("AGENTS.md are bloc fiscal propriu. Trebuie să rămână pointer către CLAUDE.md.");
}

for (const gasit of agents.matchAll(/(\d[\d.,]*)\s*lei/gi)) {
  raporteaza(
    `AGENTS.md afirmă o valoare fiscală („${gasit[0]}"). Fișierul e pointer, deliberat fără fapte ` +
      "proprii — exact ca să nu mai poată diverge de CLAUDE.md, cum s-a întâmplat până pe 28 august 2026.",
  );
}

if (!/CLAUDE\.md/.test(agents)) {
  raporteaza("AGENTS.md nu mai trimite la CLAUDE.md. Și-a pierdut singurul rol.");
}

// ─── 3. Strategiile respinse nu au voie să reapară ───────────────────────────

// Tiparele se scriu FĂRĂ diacritice și se compară pe text normalizat, ca să
// prindă și o reintroducere scrisă „monetizare prin AdSense" fără ș/ț/ă.
const faraDiacritice = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[șş]/gi, "s").replace(/[țţ]/gi, "t");

const STRATEGII_RESPINSE = [
  {
    tipar: /monetizare prin AdSense/i,
    deCe: "monetizarea a fost respinsă explicit pe 24 august 2026 — activul se construiește întâi",
  },
  {
    tipar: /obiectiv de tranzitie profesionala catre front-end/i,
    deCe: "obiectivul real e ca site-ul să înlocuiască salariul, nu tranziția profesională",
  },
];

// CLAUDE.md și AGENTS.md citează aceste formulări tocmai ca fiind greșite;
// nota explicativă e legitimă, afirmarea lor ca strategie nu.
const CITARE_LEGITIMA = /(era greșit|au fost corectate|strategia veche|corectate în|două afirmații)/i;

for (const fisier of ["CLAUDE.md", "AGENTS.md", "BRAND.md", "README.md"]) {
  const text = await readFile(fisier, "utf8");
  for (const linie of text.split("\n")) {
    const normalizata = faraDiacritice(linie);
    for (const { tipar, deCe } of STRATEGII_RESPINSE) {
      if (tipar.test(normalizata) && !CITARE_LEGITIMA.test(linie)) {
        raporteaza(
          `${fisier} afirmă o strategie respinsă: „${linie.trim().slice(0, 90)}…"\n    ${deCe}.`,
        );
      }
    }
  }
}

// ─── Rezultat ────────────────────────────────────────────────────────────────

if (esec.length > 0) {
  console.error(`\nDRIFT DE CONTEXT — ${esec.length} problemă/probleme:\n`);
  for (const problema of esec) console.error("  ✗ " + problema + "\n");
  console.error("Sursa de adevăr e codul. Adu documentul la zi, nu invers.\n");
  process.exit(1);
}

console.log(
  `OK: context sincronizat cu codul — ${LEI_DETINUTI.size} valori și ` +
    `${PROCENTE_DETINUTE.size} cote verificate, AGENTS.md e pointer, ` +
    "nicio strategie respinsă reintrodusă.",
);
