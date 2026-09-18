// src/lib/analytics.ts
// Singurul proprietar al măsurării GA4: fluxul, adresa trimisă și evenimentele
// proprii. Tagul se încarcă din src/app/(site)/layout.tsx, iar ciclul paginii
// (afișări, scroll, secțiuni, ieșire, viteză, erori) stă în
// src/app/components/Masurare.tsx. Widgeturile din (embed) nu sunt măsurate.
//
// Adresa paginii se trimite FĂRĂ suma introdusă. Calculatorul de salariu scrie
// `?brut=6000` în bară ca rezultatul să poată fi trimis mai departe, iar până pe
// 18 septembrie 2026 GA4 prelua adresa la fiecare schimbare și trimitea suma la
// Google, cu o afișare de pagină falsă la fiecare calcul. De aceea afișările se
// trimit din cod, iar în GA4 Admin „modificări de pagină pe baza istoricului
// browserului” este OPRIT. Dacă se repornește, suma revine în rapoarte și
// fiecare navigare internă se numără de două ori.
//
// Evenimente proprii (dimensiunile personalizate au aceleași nume în GA4 Admin):
//   page_view          afișare; poartă și `viewport` și `viewport_clasa`
//   scroll             percent_scrolled 25/50/75; 90 vine din măsurarea îmbunătățită
//   sectiune_vazuta    element = titlul H2 din <main> care a intrat în ecran
//   detalii_deschise   element = textul din <summary> (întrebări frecvente etc.)
//   parasire_pagina    secunde (vizibil), scroll_max, interactiune, motiv
//   calcul             instrument, varianta, avansat, moneda — EVENIMENT CHEIE
//   search             search_term, rezultate (filtrul de meserii)
//   copiaza_link       instrument
//   copiaza_embed      varianta
//   click_link_intern  link_url, link_text, zona
//   file_download      .ics, .json și PDF-ul de fluturaș; restul le prinde GA4
//   web_vitals         metrica (LCP/INP/CLS), valoare, evaluare
//   eroare_js          mesaj, sursa — doar scripturile noastre
//
// Nu se trimit niciodată: sume introduse, nume de firmă, texte libere din
// calculatoare. Singurul text liber este termenul din filtrul de meserii.

export const GA_MEASUREMENT_ID = "G-2L1J64H5H9";

/** Pe localhost, pe previzualizare sau pe o copie, evenimentele rămân în dataLayer. */
export const DOMENII_MASURATE: ReadonlySet<string> = new Set(["salariile.ro", "www.salariile.ro"]);

/** Parametrii de adresă care poartă suma introdusă de vizitator. */
export const PARAMETRI_CU_SUMA = ["brut", "net", "salariu-input"] as const;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Adresa fără sumă și fără fragment. Parametrii de campanie (utm_*) rămân. */
export function adresaFaraSume(adresa: string): string {
  if (!adresa) return adresa;
  try {
    const url = new URL(adresa);
    for (const parametru of PARAMETRI_CU_SUMA) url.searchParams.delete(parametru);
    url.hash = "";
    return url.toString();
  } catch {
    return adresa;
  }
}

/** Praguri aliniate cu breakpointurile Tailwind, plus trei trepte de telefon. */
export function clasaViewport(latime: number): string {
  if (latime < 360) return "<360";
  if (latime < 400) return "360-399";
  if (latime < 640) return "400-639";
  if (latime < 768) return "640-767";
  if (latime < 1024) return "768-1023";
  if (latime < 1280) return "1024-1279";
  if (latime < 1536) return "1280-1535";
  return ">=1536";
}

type Valoare = string | number | undefined;

export function gtag(...args: unknown[]): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag(...args);
}

export function trimiteEveniment(nume: string, parametri: Record<string, Valoare> = {}): void {
  const curati: Record<string, string | number> = {};
  for (const [cheie, valoare] of Object.entries(parametri)) {
    if (valoare !== undefined && valoare !== "") curati[cheie] = valoare;
  }
  gtag("event", nume, curati);
}

export type Instrument =
  | "salariu"
  | "fluturas"
  | "pfa"
  | "invatamant"
  | "sanatate"
  | "somaj"
  | "ore_suplimentare"
  | "part_time"
  | "interval_zile";

/** Un calcul cerut de vizitator. Fără sumă: doar ce instrument și ce variantă. */
export function masoaraCalcul(
  instrument: Instrument,
  detalii: { varianta?: string; avansat?: boolean; moneda?: string } = {},
): void {
  trimiteEveniment("calcul", {
    instrument,
    varianta: detalii.varianta,
    avansat: detalii.avansat === undefined ? undefined : detalii.avansat ? "da" : "nu",
    moneda: detalii.moneda,
  });
}

/** Text scurt și curat pentru parametri: GA4 taie oricum la 100 de caractere. */
export function textScurt(text: string | null | undefined, limita = 100): string {
  return (text ?? "").replace(/\s+/g, " ").trim().slice(0, limita);
}
