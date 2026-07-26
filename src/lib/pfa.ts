// Reguli pentru veniturile PFA în sistem real, anul fiscal 2026.
// Plafoanele anuale folosesc salariul minim de la 1 ianuarie 2026 (4.050 lei).

export const SALARIU_MINIM_PFA_2026 = 4_050;
export const PLAFON_CASS_MINIM_2026 = 6 * SALARIU_MINIM_PFA_2026;
export const PLAFON_CAS_12_2026 = 12 * SALARIU_MINIM_PFA_2026;
export const PLAFON_CAS_24_2026 = 24 * SALARIU_MINIM_PFA_2026;
export const PLAFON_CASS_MAXIM_2026 = 72 * SALARIU_MINIM_PFA_2026;

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
