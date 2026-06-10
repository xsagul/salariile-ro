// src/lib/fiscal.ts
// Logică fiscală 2026 — sursă UNICĂ de adevăr pentru calculul salarial.
// Folosită de: calculatorul client (CalculatorSalariu.tsx) ȘI paginile server (/calculator/[valoare]).
// Orice modificare a formulelor se face DOAR aici.

// ─── CORESPONDENȚĂ cu softurile oficiale ANAF (D112 / Soft J / Soft A) ────────
// Punte de întreținere: când ANAF publică un fișier nou, mapează valorile de aici
// la codurile lor folosind tabelul. (Generatorul XML + validarea sunt în _d112-local/, unealtă locală.)
//
//   Concept (fiscal.ts)      D112 asigurat      Creanță (angajatorA)    Baza de calcul
//   ──────────────────────   ───────────────    ─────────────────────   ─────────────────────────
//   cas                      A_14               412 (CAS asigurat)      A_13 = brut − facilitate
//   cass                     A_12               432 (CASS asigurat)     A_11 = brut + tichete − facilit.
//   impozit                  E3_15 / E1_7       602 (impozit salarii)   E3_14 (bazaCalculImpozit)
//   cam                      C4_ct              480 (CAM angajator)     A_5/C4_baza = brut − facilitate
//   deducerePersonala        E1_4 (=E1_41+E1_42)
//     ├ bază (%×minim)       E1_41 / E3_121     din E1_3 = nr. TOTAL persoane în întreținere
//     ├ sub-26 (15%×minim)   E1_421 / E3_1221
//     └ copii (100 lei buc.) E1_422 / E3_1222   subset al persoanelor în întreținere (≤ E1_3)
//   bazaCalculImpozit        E3_14 / E1_6
//   facilitate (300 lei)     reduce A_13/A_11/A_5 (OUG 89/2025; derogare art.220⁴ ⇒ reduce ȘI CAM)
//   tichete                  excluse din baza CAS/CAM, INCLUSE în baza CASS
//
//   Rotunjiri (identice cu Soft A): CAS=round(bază×25%); CASS=round(bază×10%) O SINGURĂ dată;
//   CAM=round(bază×2,25%); deducere de bază=round(procent×minim) LA LEU (nu la 10).
//   Verificat contra motorului oficial: DUKIntegrator J26.0.3, schema 2026 (scripts/d112-gen.mts).
// ──────────────────────────────────────────────────────────────────────────────

// Actualizat la 1 iulie 2026 (trecere S1 → S2, conform HG 146/2026 + OUG 89/2025):
//   SALARIU_MINIM:   4325 (era 4050 în S1)
//   DEDUCERE_MINIM:   200 (era 300 în S1)
//   Plafonul deducerii personale (SALARIU_MINIM + 2000): 6325 (era 6050).
export const SALARIU_MINIM = 4325;
export const CAS_PROCENT = 0.25;
export const CASS_PROCENT = 0.10;
export const IMPOZIT_PROCENT = 0.10;
export const CAM_PROCENT = 0.0225;
export const DEDUCERE_MINIM = 200;

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
  net: number; //               salariu net încasat (bani + tichete nete)
  netBani: number; //           partea din net care intră în contul de salariu
  netTichete: number; //        partea din net primită pe cardul de tichete (după CASS + impozit)
  cas: number; //               D112: A_14 · creanța 412 (CAS asigurat 25%)
  cass: number; //              D112: A_12 · creanța 432 (CASS asigurat 10%)
  impozit: number; //           D112: E3_15 / E1_7 · creanța 602 (impozit pe venit 10%)
  deducerePersonala: number; // D112: E1_4 (= E1_41 bază + E1_421 sub-26 + E1_422 copii)
  bazaCalculImpozit: number; // D112: E3_14 / E1_6 (baza de calcul a impozitului)
  cam: number; //               D112: C4_ct · creanța 480 (CAM angajator 2,25%)
  costTotal: number; //         brut + CAM + tichete (cost total angajator)
  brutNet: number; //           % din brut care ajunge net (afișaj)
}

// ─── Calcul deducere personală (Codul Fiscal art. 77) ────────────────────────

export function calculeazaDeducerePersonala(brut: number, persoane: number): number {
  if (brut > SALARIU_MINIM + 2000) return 0;

  // Procentul de bază după numărul TOTAL de persoane în întreținere (D112: câmpul E1_3).
  // Copiii minori sunt și ei persoane în întreținere (art. 77 alin. 7), deci se numără AICI;
  // suplimentul de 100 lei/copil (E1_422) se adaugă SEPARAT în calculeaza().
  const procenteBaza = [0.20, 0.25, 0.30, 0.35, 0.45];
  const procentBaza = persoane >= 4 ? 0.45 : (procenteBaza[persoane] ?? 0.20);

  // Procentul scade cu 0,5 puncte (0,005) la fiecare tranșă de 50 lei peste salariul minim.
  const transe = brut <= SALARIU_MINIM ? 0 : Math.ceil((brut - SALARIU_MINIM) / 50);
  const procent = Math.max(0, procentBaza - 0.005 * transe);

  // Rotunjire la leu. Art. 77 NU prevede rotunjirea la 10 (aceea era regula veche, pre-2023);
  // textul actual spune „se aplică suma rezultată din calcul" (ex. oficial ANAF: 0,195×4325=843,375).
  return Math.round(procent * SALARIU_MINIM);
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
  // CASS se calculează pe baza COMBINATĂ (salariu + tichete) și se rotunjește o SINGURĂ dată,
  // exact ca în Declarația 112 (A_12 = round(A_11 × 10%), unde A_11 = bază salariu + tichete).
  // cassTichete = porțiunea aferentă tichetelor (rest), folosită doar la defalcarea netului.
  const cassTotal = Math.round((bazaCasCassSalariu + tichete) * CASS_PROCENT);
  const cassTichete = cassTotal - cassSalariu;

  let deducere = 0;
  if (functieDeBAza) {
    // Deducerea de bază (E1_41) — pe numărul TOTAL de persoane în întreținere (copiii incluși).
    deducere = calculeazaDeducerePersonala(brut, persoanePretretinere);
    // Sub-26: 15% din minim, DOAR pentru venit brut ≤ salariul minim + 2000 (Cod Fiscal art. 77 alin. 10).
    if (varstaSub26 && brut <= SALARIU_MINIM + 2000) deducere += Math.round(0.15 * SALARIU_MINIM);
    // Supliment copii (E1_422): 100 lei/copil școlar, INDIFERENT de venit. Copiii sunt un
    // SUBSET al persoanelor în întreținere (copiiScolarizati ≤ persoanePretretinere).
    deducere += copiiScolarizati * 100;
  }

  // Deducerea se acordă ÎN LIMITA venitului impozabil din salariu (Cod Fiscal art. 77) — nu poate
  // depăși baza. Ex: la 100 lei brut, deducerea efectiv aplicată e ~65, nu 865.
  const venitImpozabilSalariu = Math.max(0, brut - cas - cassSalariu - facilitate);
  const deducereAplicata = Math.min(deducere, venitImpozabilSalariu);
  const bazaImpozitTichete = Math.max(0, tichete - cassTichete);
  const bazaImpozitTotala = (venitImpozabilSalariu - deducereAplicata) + bazaImpozitTichete;
  const impozit = scutitImpozit ? 0 : Math.round(bazaImpozitTotala * IMPOZIT_PROCENT);

  const impozitTichete = scutitImpozit ? 0 : Math.round(bazaImpozitTichete * IMPOZIT_PROCENT);
  const impozitSalariu = Math.max(0, impozit - impozitTichete);
  const netBaniMunciti = brut - cas - cassSalariu - impozitSalariu;
  const netTicheteEfectiv = tichete - cassTichete - impozitTichete;
  const netCumulat = netBaniMunciti + netTicheteEfectiv;

  const bazaCAM = brut - facilitate;
  const cam = Math.round(bazaCAM * CAM_PROCENT);

  return {
    net: Math.round(netCumulat),
    netBani: Math.round(netBaniMunciti),
    // diferență (nu rotunjire separată), ca netBani + netTichete = net întotdeauna
    netTichete: Math.round(netCumulat) - Math.round(netBaniMunciti),
    cas,
    cass: cassTotal,
    impozit,
    deducerePersonala: Math.round(deducereAplicata),
    bazaCalculImpozit: bazaImpozitTotala,
    cam,
    costTotal: brut + cam + tichete,
    brutNet: brut > 0 ? Math.round((netBaniMunciti / brut) * 100) : 0,
  };
}

// ─── Calcul invers: brut din net ─────────────────────────────────────────────

// Ținta este netul ÎN BANI (ce intră în cont) — „Salariu net" în UI. Tichetele se
// adaugă separat peste; fără tichete, netBani === net, deci comportament identic.
export function calculeazaBrutDinNet(net: number, input: Omit<InputState, "brut">): number {
  const valoriSpeciale = [SALARIU_MINIM];
  for (const v of valoriSpeciale) {
    const rez = calculeaza({ ...input, brut: String(v) });
    if (rez && rez.netBani === net) return v;
  }

  let lo = net;
  let hi = net * 3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const rez = calculeaza({ ...input, brut: String(mid) });
    if (!rez) { lo = mid; continue; }
    if (rez.netBani < net) lo = mid;
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
