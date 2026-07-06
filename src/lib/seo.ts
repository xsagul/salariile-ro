// src/lib/seo.ts
// Constante SEO partajate: sitemap, generateStaticParams, date lastModified reale.

import type { Metadata } from "next";

export const SITE_URL = "https://salariile.ro";

/** Imaginea OG implicită (brand). Sursă unică, folosită când pagina nu are imagine proprie. */
export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Salariile.ro, calculator salariu net",
} as const;

type OgImage = { url: string; width: number; height: number; alt: string };

/**
 * OpenGraph COMPLET pentru o pagină: titlu/descriere/url specifice paginii, dar cu
 * type, locale, siteName și imagine din brand. Sursă unică, ca nicio pagină să nu mai
 * rămână cu OG incomplet (fără imagine) sau cu OG generic de homepage.
 */
export function ogPage(opts: {
  title: string;
  description: string;
  path: string;
  image?: OgImage;
}): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    locale: "ro_RO",
    siteName: "Salariile.ro",
    url: `${SITE_URL}${opts.path}`,
    title: opts.title,
    description: opts.description,
    images: [opts.image ?? OG_IMAGE],
  };
}

/** Twitter card complet, specific paginii (titlu/descriere/imagine). */
export function twPage(opts: {
  title: string;
  description: string;
  image?: OgImage;
}): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title: opts.title,
    description: opts.description,
    images: [(opts.image ?? OG_IMAGE).url],
  };
}

/** Ultima modificare de conținut fiscal / editorial (nu la fiecare deploy). */
export const LAST_FISCAL_CONTENT_UPDATE = new Date("2026-07-01T00:00:00.000Z");

/** Pagini statice cu date de publicare cunoscute. */
export const PAGE_LAST_MODIFIED: Record<string, Date> = {
  // Homepage (calculatorul) are dată proprie: 1 iulie 2026, ziua în care
  // salariul minim de 4.325 lei (HG 146/2026) chiar intră în vigoare — decizie
  // asumată să rămână FIXĂ la 1 iulie (nu "azi"), ca să nu necesite update
  // zilnic. Paginile de calculator folosesc aceeași dată fiscală, fiindcă
  // rezultatele și textele lor se raportează la regimul intrat în vigoare atunci.
  "/": new Date("2026-07-01T00:00:00.000Z"),
  "/salariu-minim": new Date("2026-07-01T00:00:00.000Z"),
  "/calculator-pfa": new Date("2026-06-08T00:00:00.000Z"),
  "/salariu-mediu": new Date("2026-06-08T00:00:00.000Z"),
  "/metodologie": new Date("2026-07-01T00:00:00.000Z"),
  "/zile-libere-2026": new Date("2026-07-02T00:00:00.000Z"),
  "/fluturas-salariu": new Date("2026-07-02T00:00:00.000Z"),
  "/widget": new Date("2026-07-05T00:00:00.000Z"),
  "/noutati": new Date("2026-06-12T00:00:00.000Z"),
  "/despre": new Date("2026-04-01T00:00:00.000Z"),
  "/contact": new Date("2026-04-01T00:00:00.000Z"),
  "/politica-confidentialitate": new Date("2026-04-01T00:00:00.000Z"),
  "/cookies": new Date("2026-04-01T00:00:00.000Z"),
  "/termeni": new Date("2026-04-01T00:00:00.000Z"),
};

/** Valori brute indexate (net din brut) — aliniat cu sitemap + Ahrefs/GSC.
 *  Extins 2 iul 2026 pe baza studiului de keywords (GSC impressions + gap
 *  Seobility): competitorul #1 acoperă intervalul din 100 în 100; noi doar
 *  valorile cu semnal real de căutare, ca să nu riscăm thin content. */
export const CALCULATOR_BRUT_VALUES = [
  4050, 4325, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5200, 5500, 5800,
  6000, 6200, 6500, 6800, 7000, 7200, 7350, 7500, 8000, 8500, 9000, 9500,
  10000, 12000,
] as const;

/** Valori net indexate (brut din net) — doar cele cu semnal de căutare. */
export const CALCULATOR_NET_VALUES = [2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000] as const;

export function calculatorSlugBrut(v: number): string {
  return `calcul-salariu-net-${v}-brut`;
}

export function calculatorSlugNet(v: number): string {
  return `calcul-salariu-brut-${v}-net`;
}

/** Toate slug-urile calculator pentru pre-render (generateStaticParams). */
export function allCalculatorSlugs(): string[] {
  return [
    ...CALCULATOR_BRUT_VALUES.map(calculatorSlugBrut),
    ...CALCULATOR_NET_VALUES.map(calculatorSlugNet),
  ];
}
