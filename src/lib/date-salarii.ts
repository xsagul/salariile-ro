// Setul de date publicat la /date-salarii. Valorile sunt intenționat puține și
// strict documentate: nu amestecăm praguri legale, estimări și statistici INS.

export const SALARY_DATASET_VERSION = "2026-07-29";
export const SALARY_DATASET_REFERENCE_DATE = "2026-07-29";

export const SALARY_DATASET_SOURCES = {
  hg_1506_2024: {
    name: "HG 1506/2024",
    institution: "Guvernul României",
    official_url: "https://legislatie.just.ro/Public/DetaliiDocument/291450",
  },
  hg_146_2026: {
    name: "HG 146/2026",
    institution: "Guvernul României",
    official_url: "https://legislatie.just.ro/Public/DetaliiDocument/308231",
  },
  oug_89_2025: {
    name: "OUG 89/2025",
    institution: "Guvernul României",
    official_url: "https://legislatie.just.ro/Public/DetaliiDocument/305817",
  },
  legea_44_2026: {
    name: "Legea 44/2026, art. 19",
    institution: "Parlamentul României",
    official_url: "https://legislatie.just.ro/Public/DetaliiDocument/308863",
  },
  ins_mai_2026: {
    name: "INS, câștigul salarial mediu — mai 2026",
    institution: "Institutul Național de Statistică",
    official_url: "https://insse.ro/cms/sites/default/files/com_presa/com_pdf/cs05r26.pdf",
  },
} as const;

export type SalaryDatasetSourceId = keyof typeof SALARY_DATASET_SOURCES;

export type SalaryDatasetRecord = {
  id: string;
  indicator: string;
  period_label: string;
  period_start: string;
  period_end: string;
  gross_lei: number;
  net_lei: number | null;
  gross_value_type: "legal_threshold" | "statutory_budget_indicator" | "observed_aggregate";
  net_value_type: "not_included" | "standard_calculation" | "standard_estimate" | "observed_aggregate";
  source_ids: readonly SalaryDatasetSourceId[];
  methodology_note: string;
};

export const SALARY_DATA_2026 = [
  {
    id: "minimum_wage_h1_2026",
    indicator: "Salariul minim general — semestrul I 2026",
    period_label: "1 ianuarie–30 iunie 2026",
    period_start: "2026-01-01",
    period_end: "2026-06-30",
    gross_lei: 4050,
    net_lei: null,
    gross_value_type: "legal_threshold",
    net_value_type: "not_included",
    source_ids: ["hg_1506_2024"],
    methodology_note:
      "Prag legal brut lunar pentru normă întreagă; valoarea netă nu este inclusă în această versiune a setului.",
  },
  {
    id: "minimum_wage_h2_2026",
    indicator: "Salariul minim general — semestrul II 2026",
    period_label: "1 iulie–31 decembrie 2026",
    period_start: "2026-07-01",
    period_end: "2026-12-31",
    gross_lei: 4325,
    net_lei: 2699,
    gross_value_type: "legal_threshold",
    net_value_type: "standard_calculation",
    source_ids: ["hg_146_2026", "oug_89_2025"],
    methodology_note:
      "Net standard calculat pentru funcția de bază, normă întreagă, fără tichete și fără persoane în întreținere, cu facilitatea de 200 lei.",
  },
  {
    id: "bass_average_indicator_2026",
    indicator: "Indicatorul salarial brut BASS 2026",
    period_label: "anul 2026",
    period_start: "2026-01-01",
    period_end: "2026-12-31",
    gross_lei: 9192,
    net_lei: 5377,
    gross_value_type: "statutory_budget_indicator",
    net_value_type: "standard_estimate",
    source_ids: ["legea_44_2026"],
    methodology_note:
      "9.192 lei este indicatorul stabilit prin Legea 44/2026 pentru bugetul asigurărilor sociale; 5.377 lei este o estimare netă standard Salariile.ro, nu o statistică INS.",
  },
  {
    id: "ins_average_earnings_may_2026",
    indicator: "Câștigul salarial mediu lunar INS — mai 2026",
    period_label: "mai 2026",
    period_start: "2026-05-01",
    period_end: "2026-05-31",
    gross_lei: 9483,
    net_lei: 5684,
    gross_value_type: "observed_aggregate",
    net_value_type: "observed_aggregate",
    source_ids: ["ins_mai_2026"],
    methodology_note:
      "Valori agregate publicate de INS pentru luna mai; netul agregat nu reprezintă conversia fiscală a unui salariu individual de 9.483 lei brut.",
  },
] as const satisfies readonly SalaryDatasetRecord[];

export const SALARY_DATASET_USAGE_TERMS =
  "Valorile factuale din această selecție pot fi reutilizate, inclusiv comercial, cu indicarea surselor oficiale și a datei de referință. Un link către pagina setului este apreciat pentru trasabilitate, dar Salariile.ro nu revendică drepturi asupra datelor oficiale. Nota nu acordă drepturi asupra codului site-ului sau asupra documentelor și sistemelor-sursă.";
