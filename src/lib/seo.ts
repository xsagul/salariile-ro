// src/lib/seo.ts
// Constante SEO partajate: sitemap, generateStaticParams, date lastModified reale.

export const SITE_URL = "https://salariile.ro";

/** Ultima modificare de conținut fiscal / editorial (nu la fiecare deploy). */
export const LAST_FISCAL_CONTENT_UPDATE = new Date("2026-06-08T00:00:00.000Z");

/** Pagini statice cu date de publicare cunoscute. */
export const PAGE_LAST_MODIFIED: Record<string, Date> = {
  "/": LAST_FISCAL_CONTENT_UPDATE,
  "/salariu-minim": new Date("2026-06-08T00:00:00.000Z"),
  "/calculator-pfa": new Date("2026-06-08T00:00:00.000Z"),
  "/salariu-mediu": new Date("2026-06-08T00:00:00.000Z"),
  "/metodologie": new Date("2026-04-30T00:00:00.000Z"),
  "/zile-libere-2026": new Date("2026-06-08T00:00:00.000Z"),
  "/noutati": new Date("2026-06-08T00:00:00.000Z"),
  "/despre": new Date("2026-04-01T00:00:00.000Z"),
  "/contact": new Date("2026-04-01T00:00:00.000Z"),
  "/politica-confidentialitate": new Date("2026-04-01T00:00:00.000Z"),
  "/cookies": new Date("2026-04-01T00:00:00.000Z"),
  "/termeni": new Date("2026-04-01T00:00:00.000Z"),
};

/** Valori brute indexate (net din brut) — aliniat cu sitemap + Ahrefs/GSC. */
export const CALCULATOR_BRUT_VALUES = [
  4050, 4325, 5000, 6000, 6500, 7000, 7350, 8000, 10000,
] as const;

/** Valori net indexate (brut din net) — doar cele cu semnal de căutare. */
export const CALCULATOR_NET_VALUES = [3000, 5000] as const;

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
