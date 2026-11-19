// src/lib/concediu-medical.ts
// Calculul indemnizației de concediu medical în 2026:
//   - OUG nr. 158/2005 (concedii și indemnizații de asigurări sociale de sănătate)
//   - Legea nr. 141/2025 (cotele pe durată pentru boală obișnuită cod 01: 55% / 65% / 75%)
//   - OUG nr. 91/2025 + Legea nr. 64/2026 (prima zi neplătită 1 feb. 2026 – 31 dec. 2027, excepții din 1 iun. 2026)
//   - Codul Fiscal, art. 143 (baza CAS = 35% × câștigul salarial mediu brut BASS),
//     art. 154/155 (CASS 10%), art. 62 lit. c) (scutiri de impozit).

import { CAS_PROCENT, CASS_PROCENT, IMPOZIT_PROCENT, SALARIU_MINIM } from "@/lib/fiscal";
import { SALARY_DATA_2026 } from "@/lib/date-salarii";

export const CASTIG_MEDIU_BASS =
  SALARY_DATA_2026.find((r) => r.id === "bass_average_indicator_2026")?.gross_lei ?? 9192;

/** Plafon lunar al bazei de calcul: 12 salarii minime brute (OUG 158/2005, art. 10). */
export const PLAFON_BAZA_LUNARA = 12 * SALARIU_MINIM;

/** Baza lunară completă CAS pentru concediu medical: 35% × câștigul salarial mediu brut BASS (CF art. 143). */
export const BAZA_LUNARA_CAS_MEDICAL = CASTIG_MEDIU_BASS * 0.35;

export type CodConcediuMedical = "01" | "06" | "08" | "09" | "15" | "17";

export type InfoCodMedical = {
  cod: CodConcediuMedical;
  nume: string;
  detaliu: string;
  procentFix: number | null; // null pentru cod 01 (depinde de durata episodului)
  suportaCASS: boolean;
  suportaImpozit: boolean;
  /** FNUASS suportă integral de la prima zi plătită (fără 5 zile la angajator). */
  integralFnuass: boolean;
  /** Scutit automat de regula primei zile neplătite (Legea 64/2026, din 1 iun. 2026). */
  exceptatPrimaZi: boolean;
};

export const CODURI_CONCEDIU_MEDICAL: readonly InfoCodMedical[] = [
  {
    cod: "01",
    nume: "Boală obișnuită (cod 01)",
    detaliu: "55% până la 7 zile, 65% între 8 și 14 zile, 75% de la 15 zile în sus.",
    procentFix: null,
    suportaCASS: true,
    suportaImpozit: true,
    integralFnuass: false,
    exceptatPrimaZi: false,
  },
  {
    cod: "06",
    nume: "Urgență medico-chirurgicală (cod 06)",
    detaliu: "100% din baza de calcul, scutit de CASS 10%.",
    procentFix: 1.0,
    suportaCASS: false,
    suportaImpozit: true,
    integralFnuass: false,
    exceptatPrimaZi: false,
  },
  {
    cod: "08",
    nume: "Maternitate: sarcină și lăuzie (cod 08)",
    detaliu: "85% din baza de calcul, scutit de CASS și impozit, fără prima zi neplătită.",
    procentFix: 0.85,
    suportaCASS: false,
    suportaImpozit: false,
    integralFnuass: true,
    exceptatPrimaZi: true,
  },
  {
    cod: "09",
    nume: "Îngrijire copil bolnav (cod 09)",
    detaliu: "85% din baza de calcul, scutit de CASS și impozit; prima zi este neplătită fără internare.",
    procentFix: 0.85,
    suportaCASS: false,
    suportaImpozit: false,
    integralFnuass: true,
    exceptatPrimaZi: false,
  },
  {
    cod: "15",
    nume: "Risc maternal (cod 15)",
    detaliu: "75% din baza de calcul, scutit de CASS și impozit, fără prima zi neplătită.",
    procentFix: 0.75,
    suportaCASS: false,
    suportaImpozit: false,
    integralFnuass: true,
    exceptatPrimaZi: true,
  },
  {
    cod: "17",
    nume: "Îngrijire pacient oncologic (cod 17)",
    detaliu: "85% din baza de calcul, scutit de CASS și impozit, fără prima zi neplătită.",
    procentFix: 0.85,
    suportaCASS: false,
    suportaImpozit: false,
    integralFnuass: true,
    exceptatPrimaZi: true,
  },
] as const;

export const TEMEI_MEDICAL = {
  oug158: "OUG nr. 158/2005",
  lege141: "Legea nr. 141/2025",
  lege64: "OUG nr. 91/2025 și Legea nr. 64/2026",
  cas: "Codul Fiscal, art. 143",
  cass: "Codul Fiscal, art. 154 și 155",
  impozit: "Codul Fiscal, art. 62 lit. c)",
} as const;

export type IntrareConcediuMedical = {
  /** Venitul brut lunar mediu pe ultimele 6 luni. */
  venitBrutMediu6Luni: number;
  cod: CodConcediuMedical;
  /** Durata totală a episodului de boală, în zile calendaristice (decide cota 55/65/75% la cod 01). */
  zileCalendaristiceEpisod: number;
  /** Numărul de zile lucrătoare din concediul medical din luna calculată. */
  zileLucratoareConcediu: number;
  /** Numărul de zile lucrătoare din luna respectivă (implicit 21). */
  zileLucratoareLuna?: number;
  /**
   * True dacă episodul este scutit de prima zi neplătită: internare în spital,
   * program național de sănătate, continuare de certificat sau cod exceptat.
   */
  faraPrimaZiNeplatita?: boolean;
};

export type RezultatConcediuMedical = {
  cod: CodConcediuMedical;
  procent: number;
  venitPlafonat: number;
  plafonAplicat: boolean;
  bazaZilnica: number;
  zileLucratoareConcediu: number;
  zileNeplatite: number;
  zilePlatite: number;
  zileAngajator: number;
  zileFnuass: number;
  indemnizatieBruta: number;
  brutAngajator: number;
  brutFnuass: number;
  bazaCas: number;
  cas: number;
  cass: number;
  impozit: number;
  indemnizatieNeta: number;
};

/** Cota pentru cod 01 (boală obișnuită) după Legea nr. 141/2025, pe durata episodului. */
export function procentBoalaObisnuita(zileCalendaristice: number): number {
  if (zileCalendaristice <= 7) return 0.55;
  if (zileCalendaristice <= 14) return 0.65;
  return 0.75;
}

export function infoCodMedical(cod: CodConcediuMedical): InfoCodMedical {
  return CODURI_CONCEDIU_MEDICAL.find((c) => c.cod === cod) ?? CODURI_CONCEDIU_MEDICAL[0];
}

export function calculeazaConcediuMedical(input: IntrareConcediuMedical): RezultatConcediuMedical | null {
  const venit = Number(input.venitBrutMediu6Luni);
  const zileCal = Math.round(Number(input.zileCalendaristiceEpisod));
  const zileLucr = Math.round(Number(input.zileLucratoareConcediu));
  const zileLuna = Math.round(Number(input.zileLucratoareLuna ?? 21));

  if (!Number.isFinite(venit) || venit <= 0) return null;
  if (!Number.isFinite(zileCal) || zileCal < 1) return null;
  if (!Number.isFinite(zileLucr) || zileLucr < 1 || zileLucr > 23) return null;
  if (!Number.isFinite(zileLuna) || zileLuna < 18 || zileLuna > 23) return null;

  const info = infoCodMedical(input.cod);
  const procent = info.procentFix ?? procentBoalaObisnuita(zileCal);
  const plafonAplicat = venit > PLAFON_BAZA_LUNARA;
  const venitPlafonat = Math.min(venit, PLAFON_BAZA_LUNARA);
  // Media zilnică din ultimele 6 luni (aproximată pe baza mediei de zile lucrătoare ale lunii selectate).
  const bazaZilnica = venitPlafonat / zileLuna;

  const scutitPrimaZi = info.exceptatPrimaZi || Boolean(input.faraPrimaZiNeplatita);
  const zileNeplatite = scutitPrimaZi ? 0 : 1;
  const zilePlatite = Math.max(0, zileLucr - zileNeplatite);

  // Împărțirea zilelor plătite între angajator și FNUASS:
  // La codurile cu suportare integrală FNUASS (08, 09, 15, 17): angajator = 0.
  // La boală obișnuită / urgențe: angajatorul suportă primele 5 zile plătite (zilele 2–6 când ziua 1 e neplătită).
  const zileAngajator = info.integralFnuass ? 0 : Math.min(5, zilePlatite);
  const zileFnuass = Math.max(0, zilePlatite - zileAngajator);

  const indemnizatieBruta = Math.round(bazaZilnica * procent * zilePlatite);
  const brutAngajator = Math.round(bazaZilnica * procent * zileAngajator);
  const brutFnuass = Math.max(0, indemnizatieBruta - brutAngajator);

  // CAS 25% pe 35% × câștigul salarial mediu brut BASS proporțional cu zilele lucrătoare plătite (CF art. 143).
  // Când indemnizația brută este 0 (o singură zi neplătită), toate reținerile sunt 0.
  const bazaCas = zilePlatite > 0 ? Math.round(BAZA_LUNARA_CAS_MEDICAL * (zilePlatite / zileLuna)) : 0;
  const cas = zilePlatite > 0 ? Math.min(indemnizatieBruta, Math.round(bazaCas * CAS_PROCENT)) : 0;
  const cass = info.suportaCASS && zilePlatite > 0 ? Math.round(indemnizatieBruta * CASS_PROCENT) : 0;
  const bazaImpozit = Math.max(0, indemnizatieBruta - cas - cass);
  const impozit = info.suportaImpozit && zilePlatite > 0 ? Math.round(bazaImpozit * IMPOZIT_PROCENT) : 0;
  const indemnizatieNeta = Math.max(0, indemnizatieBruta - cas - cass - impozit);

  return {
    cod: input.cod,
    procent,
    venitPlafonat,
    plafonAplicat,
    bazaZilnica,
    zileLucratoareConcediu: zileLucr,
    zileNeplatite,
    zilePlatite,
    zileAngajator,
    zileFnuass,
    indemnizatieBruta,
    brutAngajator,
    brutFnuass,
    bazaCas,
    cas,
    cass,
    impozit,
    indemnizatieNeta,
  };
}
