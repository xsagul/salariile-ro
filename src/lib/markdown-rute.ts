// src/lib/markdown-rute.ts
//
// Rutele publice care au reprezentare Markdown pentru agenți AI.
//
// Lista stătea în ruta dinamică /api/markdown, care convertea HTML-ul la fiecare
// cerere. Pe găzduirea statică Markdown-ul se generează o singură dată, la build
// (scripts/genereaza-cloudflare.mts), din exact aceeași listă.

import { PAGE_LAST_MODIFIED, allCalculatorSlugs } from "@/lib/seo";
import { getAllArticles } from "@/lib/noutati";
import { CATEGORII, COMPARATII, MESERII } from "@/lib/meserii";
import { JUDETE } from "@/lib/ins-date";

export const ALLOWED_MARKDOWN_PATHS = new Set([
  ...Object.keys(PAGE_LAST_MODIFIED),
  ...getAllArticles().map((article) => `/noutati/${article.slug}`),
  ...allCalculatorSlugs().map((slug) => `/calculator/${slug}`),
  ...MESERII.map((m) => `/salarii/${m.slug}`),
  ...JUDETE.map((j) => `/salarii/judet/${j.slug}`),
  ...CATEGORII.map((c) => `/salarii/domeniu/${c.slug}`),
  ...COMPARATII.map((comp) => `/compara/${comp.slug}`),
]);
