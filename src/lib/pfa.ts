// Reguli pentru veniturile PFA, anul fiscal 2026: sistem real și normă de venit.
// Plafoanele anuale folosesc salariul minim de la 1 ianuarie 2026 (4.050 lei).
// Temeiul este art. 135^1 alin. (3) din Codul fiscal: se ia minimul de la
// 1 ianuarie al anului de venit, indiferent dacă în cursul aceluiași an se
// folosesc mai multe valori. Majorarea la 4.325 lei din 1 iulie 2026 nu atinge
// deci plafoanele anului 2026.

export const SALARIU_MINIM_PFA_2026 = 4_050;
export const PLAFON_CASS_MINIM_2026 = 6 * SALARIU_MINIM_PFA_2026;
export const PLAFON_CAS_12_2026 = 12 * SALARIU_MINIM_PFA_2026;
export const PLAFON_CAS_24_2026 = 24 * SALARIU_MINIM_PFA_2026;
export const PLAFON_CASS_MAXIM_2026 = 72 * SALARIU_MINIM_PFA_2026;

/**
 * Pragul care scoate un PFA de pe normă de venit: venit brut peste echivalentul
 * în lei a 25.000 euro într-un an duce, din anul fiscal următor, la obligația
 * determinării venitului net în sistem real.
 */
export const PLAFON_NORMA_VENIT_EUR = 25_000;
/** Curs mediu anual BNR folosit pentru conversia pragului. */
export const CURS_MEDIU_EUR_2025 = 5.0415;
export const PLAFON_NORMA_VENIT_LEI = Math.round(PLAFON_NORMA_VENIT_EUR * CURS_MEDIU_EUR_2025);

export type OptiuniPFA = {
  /** Venituri salariale/asimilate cumulate de cel puțin 6 salarii minime în anul fiscal. */
  salariatPestePlafonCASS: boolean;
  /** Persoana are calitatea de pensionar pentru situația anuală simulată. */
  pensionar: boolean;
};

export type RezultatPFA = {
  venitNet: number;
  cas: number;
  cass: number;
  cassDiferentaMinima: number;
  cassDeductibila: number;
  impozit: number;
  totalTaxe: number;
  ramas: number;
};

/**
 * Calculează obligațiile minime uzuale pentru un PFA în sistem real.
 *
 * Veniturile obținute într-o fracțiune de an sunt tratate ca venit anual. De aceea,
 * simpla începere, suspendare sau încetare a activității nu proratează plafoanele.
 * CAS folosește baza minimă permisă de tranșa în care se află venitul; contribuabilul
 * poate opta pentru o bază CAS mai mare în Declarația unică.
 */
export function calculeazaPFA(venitNetInitial: number, optiuni: OptiuniPFA): RezultatPFA {
  const venitNet = Math.max(0, venitNetInitial);

  // Pierderea fiscală și venitul net anual egal cu zero nu generează obligații
  // CASS/CAS; eventuala opțiune voluntară pentru asigurare nu este simulată aici.
  if (venitNet === 0) {
    return {
      venitNet: 0,
      cas: 0,
      cass: 0,
      cassDiferentaMinima: 0,
      cassDeductibila: 0,
      impozit: 0,
      totalTaxe: 0,
      ramas: 0,
    };
  }

  const exceptatDiferentaCass = optiuni.salariatPestePlafonCASS || optiuni.pensionar;

  // CASS pe venitul efectiv este datorată inclusiv de salariați și pensionari.
  // Excepțiile îi scutesc doar de diferența până la baza minimă de 6 salarii.
  const bazaCassPeVenit = Math.min(venitNet, PLAFON_CASS_MAXIM_2026);
  const cassPeVenit = Math.round(bazaCassPeVenit * 0.1);
  const cassMinima = Math.round(PLAFON_CASS_MINIM_2026 * 0.1);
  const cass = !exceptatDiferentaCass && venitNet < PLAFON_CASS_MINIM_2026
    ? cassMinima
    : cassPeVenit;
  const cassDiferentaMinima = Math.max(0, cass - cassPeVenit);

  // Diferența CASS până la minim, prevăzută de art. 174 alin. (6), nu este
  // deductibilă la stabilirea venitului anual impozabil.
  const cassDeductibila = cass - cassDiferentaMinima;

  let cas = 0;
  if (!optiuni.pensionar && venitNet >= PLAFON_CAS_12_2026) {
    const bazaCasMinima = venitNet >= PLAFON_CAS_24_2026
      ? PLAFON_CAS_24_2026
      : PLAFON_CAS_12_2026;
    cas = Math.round(bazaCasMinima * 0.25);
  }

  const impozit = Math.round(Math.max(0, venitNet - cas - cassDeductibila) * 0.1);
  const totalTaxe = cas + cass + impozit;

  return {
    venitNet,
    cas,
    cass,
    cassDiferentaMinima,
    cassDeductibila,
    impozit,
    totalTaxe,
    ramas: venitNet - totalTaxe,
  };
}

export type RezultatNormaVenit = {
  /** Norma anuală stabilită de DGRFP, ajustată dacă e cazul. */
  norma: number;
  cas: number;
  cass: number;
  cassDiferentaMinima: number;
  impozit: number;
  totalTaxe: number;
  /** Cât ar rămâne dacă încasările ar fi exact cât norma. */
  ramas: number;
};

/**
 * Obligațiile unui PFA impozitat pe bază de NORMĂ DE VENIT.
 *
 * Diferența esențială față de sistemul real: impozitul se aplică direct pe
 * normă, fără să se scadă CAS și CASS. Temeiul direct este art. 69^2 alin. (1)
 * din Codul fiscal — cota de 10% se aplică „asupra normei anuale de venit
 * ajustate", impozitul fiind final. Deducerea contribuțiilor de la art. 118
 * alin. (2) nu se aplică, fiindcă art. 69^3 trimite la capitolul respectiv doar
 * veniturile determinate în sistem real. Confirmat de exemplul ANAF 2026:
 * normă ajustată 42.150 lei, CASS 4.215 lei, impozit 42.150 × 10% = 4.215 lei,
 * adică fără scăderea CASS din bază.
 *
 * Norma ține locul venitului net și la contribuții: ea este suma raportată la
 * plafoanele CAS și CASS (art. 148 alin. (3), art. 170 alin. (1)), indiferent
 * cât s-a încasat efectiv.
 */
export function calculeazaPfaNormaVenit(
  normaInitiala: number,
  optiuni: OptiuniPFA,
): RezultatNormaVenit {
  const norma = Math.max(0, normaInitiala);

  if (norma === 0) {
    return { norma: 0, cas: 0, cass: 0, cassDiferentaMinima: 0, impozit: 0, totalTaxe: 0, ramas: 0 };
  }

  const exceptatDiferentaCass = optiuni.salariatPestePlafonCASS || optiuni.pensionar;

  const cassPeNorma = Math.round(Math.min(norma, PLAFON_CASS_MAXIM_2026) * 0.1);
  const cassMinima = Math.round(PLAFON_CASS_MINIM_2026 * 0.1);
  const cass = !exceptatDiferentaCass && norma < PLAFON_CASS_MINIM_2026 ? cassMinima : cassPeNorma;
  const cassDiferentaMinima = Math.max(0, cass - cassPeNorma);

  let cas = 0;
  if (!optiuni.pensionar && norma >= PLAFON_CAS_12_2026) {
    const bazaCasMinima = norma >= PLAFON_CAS_24_2026 ? PLAFON_CAS_24_2026 : PLAFON_CAS_12_2026;
    cas = Math.round(bazaCasMinima * 0.25);
  }

  // Fără deducerea contribuțiilor: cota se aplică pe normă, nu pe normă − CAS − CASS.
  const impozit = Math.round(norma * 0.1);
  const totalTaxe = cas + cass + impozit;

  return { norma, cas, cass, cassDiferentaMinima, impozit, totalTaxe, ramas: norma - totalTaxe };
}

export function venitNetPfaPentruRamas(
  targetAnual: number,
  optiuni: OptiuniPFA,
): number {
  if (targetAnual <= 0) return 0;

  let limitaSuperioara = Math.max(PLAFON_CAS_24_2026, targetAnual * 3);
  while (calculeazaPFA(limitaSuperioara, optiuni).ramas < targetAnual) {
    limitaSuperioara *= 2;
  }

  // CAS apare în trepte la 12 și 24 de salarii minime, deci suma rămasă are
  // două scăderi discrete. Căutăm separat în fiecare interval monoton și alegem
  // cel mai mic venit care produce suma dorită.
  const intervale: Array<[number, number]> = [
    [1, PLAFON_CAS_12_2026 - 1],
    [PLAFON_CAS_12_2026, PLAFON_CAS_24_2026 - 1],
    [PLAFON_CAS_24_2026, Math.ceil(limitaSuperioara)],
  ];

  let celMaiMicVenit = Number.POSITIVE_INFINITY;

  for (const [inceput, sfarsit] of intervale) {
    if (inceput > sfarsit || calculeazaPFA(sfarsit, optiuni).ramas < targetAnual) continue;

    let lo = inceput;
    let hi = sfarsit;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (calculeazaPFA(mid, optiuni).ramas >= targetAnual) hi = mid;
      else lo = mid + 1;
    }

    celMaiMicVenit = Math.min(celMaiMicVenit, lo);
  }

  return Number.isFinite(celMaiMicVenit) ? celMaiMicVenit : 0;
}
