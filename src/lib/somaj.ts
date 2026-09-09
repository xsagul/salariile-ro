// src/lib/somaj.ts
//
// Indemnizatia de somaj — Legea nr. 76/2002 privind sistemul asigurarilor
// pentru somaj, forma consolidata (`research/lege76-2002-somaj.html`).
//
// De ce e in scopul site-ului: indemnizatia se calculeaza DIN salariu. Partea
// variabila e un procent din media veniturilor brute pe ultimele 12 luni de
// stagiu, deci intrarea e exact cifra pe care site-ul o detine deja. Omul isi
// stie salariul si vechimea, dar nu stie ce iese — acelasi test pe care l-au
// trecut calculatorul de sanatate si cel de ore suplimentare, si pe care l-au
// picat calculatoarele sectoriale pentru constructii si IT.
//
// ─── De ce a meritat citita legea, si nu concurenta ─────────────────────────
//
// Pe 9 septembrie 2026, doua dintre site-urile care rankeaza pe prima pagina
// scriu ca partea fixa e „75% din ISR". Este formula dinainte de 3 octombrie
// 2022. LEGEA nr. 273 din 29 septembrie 2022 a modificat art. 39 alin. (2)
// lit. a) si a inlocuit procentul cu valoarea INTEGRALA a indicatorului. O
// eroare veche de trei ani si jumatate, inca live pe pozitii bune.
//
// ─── Temeiul, verificat cuvant cu cuvant ───────────────────────────────────
//
// Legea 76/2002:
//   art. 39 alin. (1)  durata: 6 luni la stagiu de cel putin un an, 9 luni la
//                      cel putin 5 ani, 12 luni la peste 10 ani;
//   art. 39 alin. (2)  lit. a) — valoarea indicatorului social de referinta in
//                      vigoare la data stabilirii, pentru stagiu de cel putin
//                      un an; lit. b) — suma de la lit. a) plus o suma
//                      calculata prin aplicarea unei cote procentuale asupra
//                      mediei veniturilor care constituie baza de calcul pe
//                      ultimele 12 luni in care s-a realizat stagiu;
//   art. 39 alin. (3)  cotele: 3% la cel putin 3 ani, 5% la cel putin 5 ani,
//                      7% la cel putin 10 ani, 10% la cel putin 20 de ani;
//   art. 40 alin. (1)  absolventii: 6 luni, suma fixa de 50% din ISR;
//   art. 43 alin. (2)  pentru fractiuni de luna, calcul proportional cu zilele.
//
// Codul Fiscal (Legea 227/2015, forma consolidata la 8 august 2026):
//   art. 155 alin. (1) lit. j)  indemnizatiile de somaj acordate potrivit
//                      Legii nr. 76/2002 sunt in baza CASS;
//   art. 136 lit. d)   ANOFM, prin agentiile judetene, e platitorul CAS pentru
//                      persoanele care beneficiaza de indemnizatie de somaj —
//                      deci CAS NU se retine din indemnizatie, o suporta
//                      bugetul asigurarilor pentru somaj, iar stagiul de
//                      pensie curge mai departe;
//   Titlul IV          indemnizatia de somaj nu apare intre veniturile
//                      impozabile si nu e venit salarial in sensul art. 76,
//                      deci nu se retine impozit pe venit.

import { CASS_PROCENT as COTA_CASS } from "@/lib/fiscal";

// ─── Indicatorul social de referinta ────────────────────────────────────────
//
// 660 lei in 2026. Sursa: ANOFM, comunicarile pentru absolventii promotiei
// 2026 („prima de insertie este de 3 ori valoarea ISR", 1.980 lei).
//
// Valoarea e inghetata pentru 2026: art. XXXIII din LEGEA nr. 141 din 25 iulie
// 2025 mentine indicatorul la nivelul stabilit pentru decembrie 2025. Deci nu
// se schimba in cursul anului si nu trebuie urmarita lunar — dar se verifica
// la fiecare inceput de an.

export const ISR = 660;
export const ISR_AN = 2026;
export const SURSA_ISR = {
  nume: "Agenția Națională pentru Ocuparea Forței de Muncă",
  url: "https://www.anofm.ro/",
  nota: "Valoare menținută pentru 2026 prin art. XXXIII din Legea nr. 141/2025.",
};

export const URL_LEGE = "https://legislatie.just.ro/Public/DetaliiDocumentAfis/259039";

export const TEMEI = {
  durata: "Legea 76/2002, art. 39 alin. (1)",
  parteFixa: "Legea 76/2002, art. 39 alin. (2) lit. a)",
  parteVariabila: "Legea 76/2002, art. 39 alin. (2) lit. b)",
  cote: "Legea 76/2002, art. 39 alin. (3)",
  absolventi: "Legea 76/2002, art. 40 alin. (1)",
  cass: "Codul Fiscal, art. 155 alin. (1) lit. j)",
  cas: "Codul Fiscal, art. 136 lit. d)",
} as const;

// ─── Stagiul de cotizare ────────────────────────────────────────────────────

/** Pragurile de durata, art. 39 alin. (1). Ordinea conteaza: se ia primul prag atins. */
const DURATE: { minAni: number; luni: number; eticheta: string }[] = [
  { minAni: 10.000001, luni: 12, eticheta: "peste 10 ani" }, // legea spune „mai mare de 10 ani"
  { minAni: 5, luni: 9, eticheta: "cel puțin 5 ani" },
  { minAni: 1, luni: 6, eticheta: "cel puțin 1 an" },
];

/** Cotele pentru partea variabila, art. 39 alin. (3). */
export const COTE: { minAni: number; cota: number }[] = [
  { minAni: 20, cota: 0.10 },
  { minAni: 10, cota: 0.07 },
  { minAni: 5, cota: 0.05 },
  { minAni: 3, cota: 0.03 },
];

/**
 * Durata in luni. `null` daca stagiul e sub un an — atunci dreptul nu se
 * deschide pe art. 39, iar persoana nu e somer indemnizat pe acest temei.
 */
export function durataLuni(aniStagiu: number): number | null {
  for (const d of DURATE) if (aniStagiu >= d.minAni) return d.luni;
  return null;
}

/** Cota pentru partea variabila. Sub 3 ani de stagiu nu exista cota, deci 0. */
export function cotaVariabila(aniStagiu: number): number {
  for (const c of COTE) if (aniStagiu >= c.minAni) return c.cota;
  return 0;
}

// ─── Calculul ───────────────────────────────────────────────────────────────

export type IntrareSomaj = {
  /** Stagiul de cotizare in ani impliniti. */
  aniStagiu: number;
  /**
   * Media veniturilor brute pe ultimele 12 luni de stagiu — baza pe care s-au
   * platit contributiile de somaj, adica salariul brut lunar.
   */
  mediaBruta: number;
  /** Absolvent, in conditiile art. 17 alin. (2): suma fixa, alt temei. */
  absolvent?: boolean;
};

export type RezultatSomaj = {
  /** Cate luni se acorda. */
  luni: number;
  parteFixa: number;
  parteVariabila: number;
  cota: number;
  /** Cuantumul lunar stabilit, inainte de retineri. */
  brut: number;
  /** CASS 10%, retinuta din indemnizatie. */
  cass: number;
  /** Ce ramane efectiv de incasat. */
  net: number;
  /** Totalul net pe toata perioada de acordare. */
  totalNet: number;
  absolvent: boolean;
};

const lei = (n: number) => Math.round(n);

export function calculeazaSomaj(input: IntrareSomaj): RezultatSomaj | null {
  const ani = Number(input.aniStagiu);
  if (!Number.isFinite(ani) || ani < 0) return null;

  if (input.absolvent) {
    // Art. 40 alin. (1): suma fixa de 50% din ISR, pe 6 luni. Nu depinde de
    // niciun venit anterior — absolventul nu are stagiu de cotizare.
    const brut = lei(ISR * 0.5);
    const cass = lei(brut * COTA_CASS);
    const net = brut - cass;
    return { luni: 6, parteFixa: brut, parteVariabila: 0, cota: 0, brut, cass, net, totalNet: net * 6, absolvent: true };
  }

  const luni = durataLuni(ani);
  if (luni === null) return null;

  const media = Number(input.mediaBruta);
  if (!Number.isFinite(media) || media < 0) return null;

  const cota = cotaVariabila(ani);
  const parteFixa = ISR;
  const parteVariabila = lei(media * cota);
  const brut = parteFixa + parteVariabila;
  const cass = lei(brut * COTA_CASS);
  const net = brut - cass;

  return { luni, parteFixa, parteVariabila, cota, brut, cass, net, totalNet: net * luni, absolvent: false };
}
