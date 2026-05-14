// src/lib/fiscal.ts
// Logică fiscală 2026 — sursă UNICĂ de adevăr pentru calculul salarial.
// Folosită de: calculatorul client (CalculatorSalariu.tsx) ȘI paginile server (/calculator/[valoare]).
// Orice modificare a formulelor se face DOAR aici.

// ⚠️ DE SCHIMBAT MANUAL LA 1 IULIE 2026 (trecere S1 → S2, conform HG 146/2026 + OUG 89/2025):
//   SALARIU_MINIM:   4050 → 4325
//   DEDUCERE_MINIM:   300 → 200
//   Plafonul deducerii personale (SALARIU_MINIM + 2000) se ajustează automat: 6050 → 6325.
export const SALARIU_MINIM = 4050;
export const CAS_PROCENT = 0.25;
export const CASS_PROCENT = 0.10;
export const IMPOZIT_PROCENT = 0.10;
export const CAM_PROCENT = 0.0225;
export const DEDUCERE_MINIM = 300;

// ─── Tipuri ──────────────────────────────────────────────────────────────────

export interface InputState {
  brut: string;
  tichete: string;
  functieDeBAza: boolean;
  persoanePretretinere: number;
  varstaSub26: boolean;
  copiiScolarizati: number;
  scutitImpozit: boolean;
}

export interface Rezultat {
  net: number;
  cas: number;
  cass: number;
  impozit: number;
  deducerePersonala: number;
  bazaCalculImpozit: number;
  cam: number;
  costTotal: number;
  brutNet: number;
}

// ─── Calcul deducere personală (Codul Fiscal art. 77) ────────────────────────

export function calculeazaDeducerePersonala(brut: number, persoane: number, copii: number): number {
  const totalPersoane = persoane + copii;
  const limita = SALARIU_MINIM + 2000;

  if (brut > limita) return 0;

  const procente = [0.20, 0.25, 0.30, 0.35, 0.45];
  const procent = totalPersoane >= 4 ? 0.45 : procente[totalPersoane] || 0.20;
  const baza = Math.floor((procent * SALARIU_MINIM) / 10) * 10;

  if (brut <= SALARIU_MINIM) return baza;

  const coeficient = 1 - (brut - SALARIU_MINIM) / 2000;
  return Math.max(0, Math.floor((baza * coeficient) / 10) * 10);
}

// ─── Calcul net din brut ─────────────────────────────────────────────────────

export function calculeaza(input: InputState): Rezultat | null {
  const brut = parseFloat(input.brut);
  if (!brut || brut <= 0) return null;

  const tichete = parseFloat(input.tichete) || 0;
  const { functieDeBAza, persoanePretretinere, varstaSub26, copiiScolarizati, scutitImpozit } = input;

  const facilitate = (functieDeBAza && brut === SALARIU_MINIM) ? DEDUCERE_MINIM : 0;
  const bazaCasCassSalariu = Math.max(0, brut - facilitate);

  const cas = Math.round(bazaCasCassSalariu * CAS_PROCENT);

  const cassSalariu = Math.round(bazaCasCassSalariu * CASS_PROCENT);
  const cassTichete = Math.round(tichete * CASS_PROCENT);
  const cassTotal = cassSalariu + cassTichete;

  let deducere = 0;
  if (functieDeBAza) {
    deducere = calculeazaDeducerePersonala(brut, persoanePretretinere, copiiScolarizati);
    if (varstaSub26) deducere += Math.round(0.15 * SALARIU_MINIM);
    deducere += copiiScolarizati * 100;
  }

  let impozit = 0;
  const bazaImpozitTichete = Math.max(0, tichete - cassTichete);

  if (!scutitImpozit) {
    const bazaImpozitSalariu = Math.max(0, brut - cas - cassSalariu - facilitate - deducere);
    const bazaImpozitTotala = bazaImpozitSalariu + bazaImpozitTichete;
    impozit = Math.round(bazaImpozitTotala * IMPOZIT_PROCENT);
  }

  const impozitTichete = scutitImpozit ? 0 : Math.round(bazaImpozitTichete * IMPOZIT_PROCENT);
  const impozitSalariu = Math.max(0, impozit - impozitTichete);
  const netBaniMunciti = brut - cas - cassSalariu - impozitSalariu;
  const netTicheteEfectiv = tichete - cassTichete - impozitTichete;
  const netCumulat = netBaniMunciti + netTicheteEfectiv;

  const bazaCAM = brut - facilitate;
  const cam = Math.round(bazaCAM * CAM_PROCENT);

  return {
    net: Math.round(netCumulat),
    cas,
    cass: cassTotal,
    impozit,
    deducerePersonala: Math.round(deducere),
    bazaCalculImpozit: Math.max(0, brut - cas - cassSalariu - facilitate - deducere),
    cam,
    costTotal: brut + cam,
    brutNet: brut > 0 ? Math.round((netBaniMunciti / brut) * 100) : 0,
  };
}

// ─── Calcul invers: brut din net ─────────────────────────────────────────────

export function calculeazaBrutDinNet(net: number, input: Omit<InputState, "brut">): number {
  const valoriSpeciale = [SALARIU_MINIM];
  for (const v of valoriSpeciale) {
    const rez = calculeaza({ ...input, brut: String(v) });
    if (rez && rez.net === net) return v;
  }

  let lo = net;
  let hi = net * 3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const rez = calculeaza({ ...input, brut: String(mid) });
    if (!rez) { lo = mid; continue; }
    if (rez.net < net) lo = mid;
    else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

// ─── Helpers pentru calcul standard (funcție de bază, fără tichete/persoane) ──
// Folosite de paginile server pentru a injecta cifre reale în conținutul editorial.

const INPUT_STANDARD: Omit<InputState, "brut"> = {
  tichete: "",
  functieDeBAza: true,
  persoanePretretinere: 0,
  varstaSub26: false,
  copiiScolarizati: 0,
  scutitImpozit: false,
};

/** Calculul net + defalcare pentru un brut standard (funcție de bază, fără extra). */
export function calculStandard(brut: number): Rezultat | null {
  return calculeaza({ ...INPUT_STANDARD, brut: String(brut) });
}

/** Brutul standard corespunzător unui net dorit. */
export function brutDinNetStandard(net: number): number {
  return calculeazaBrutDinNet(net, INPUT_STANDARD);
}
