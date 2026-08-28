import type { MetadataRoute } from "next";
import {
  SITE_URL,
  PAGE_LAST_MODIFIED,
  CALCULATOR_BRUT_VALUES,
  CALCULATOR_NET_VALUES,
  calculatorSlugBrut,
  calculatorSlugNet,
  LAST_FISCAL_CONTENT_UPDATE,
} from "@/lib/seo";
import { getAllArticles } from "@/lib/noutati";
import { CATEGORII, COMPARATII, MESERII } from "@/lib/meserii";
import { INS_GENERAT_LA, JUDETE } from "@/lib/ins-date";

const STATIC_ENTRIES: {
  path: keyof typeof PAGE_LAST_MODIFIED;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/salariu-minim", priority: 0.9, changeFrequency: "monthly" },
  { path: "/salariu-minim-constructii-2026", priority: 0.85, changeFrequency: "monthly" },
  { path: "/calculator-pfa", priority: 0.8, changeFrequency: "monthly" },
  { path: "/calculator-salariu-part-time", priority: 0.9, changeFrequency: "monthly" },
  { path: "/calculator-salariu-invatamant", priority: 0.9, changeFrequency: "monthly" },
  { path: "/salariu-mediu", priority: 0.9, changeFrequency: "monthly" },
  { path: "/salarii", priority: 0.8, changeFrequency: "monthly" },
  { path: "/compara", priority: 0.7, changeFrequency: "monthly" },
  { path: "/salarii/clasament", priority: 0.7, changeFrequency: "monthly" },
  { path: "/salarii/judete", priority: 0.7, changeFrequency: "monthly" },
  { path: "/salarii/femei-barbati", priority: 0.7, changeFrequency: "yearly" },
  { path: "/salarii/locuri-vacante", priority: 0.7, changeFrequency: "monthly" },
  { path: "/deducere-personala-2026", priority: 0.8, changeFrequency: "monthly" },
  { path: "/zile-libere-2026", priority: 0.8, changeFrequency: "monthly" },
  { path: "/zile-lucratoare-2026", priority: 0.8, changeFrequency: "monthly" },
  { path: "/fluturas-salariu", priority: 0.8, changeFrequency: "monthly" },
  { path: "/widget", priority: 0.6, changeFrequency: "monthly" },
  { path: "/date-salarii", priority: 0.7, changeFrequency: "monthly" },
  { path: "/noutati", priority: 0.7, changeFrequency: "weekly" },
  { path: "/metodologie", priority: 0.6, changeFrequency: "monthly" },
  { path: "/despre", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/politica-confidentialitate", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  { path: "/termeni", priority: 0.3, changeFrequency: "yearly" },
];

const MESERII_EDITORIAL_UPDATE = new Date("2026-08-25T00:00:00.000Z");
const MESERII_LAST_MODIFIED = new Date(
  Math.max(new Date(INS_GENERAT_LA).getTime(), MESERII_EDITORIAL_UPDATE.getTime()),
);

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  return [
    ...STATIC_ENTRIES.map(({ path, priority, changeFrequency }) => ({
      url: path === "/" ? baseUrl : `${baseUrl}${path}`,
      lastModified: PAGE_LAST_MODIFIED[path],
      changeFrequency,
      priority,
    })),

    ...CALCULATOR_BRUT_VALUES.map((v) => ({
      url: `${baseUrl}/calculator/${calculatorSlugBrut(v)}`,
      lastModified: LAST_FISCAL_CONTENT_UPDATE,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    ...CALCULATOR_NET_VALUES.map((v) => ({
      url: `${baseUrl}/calculator/${calculatorSlugNet(v)}`,
      lastModified: LAST_FISCAL_CONTENT_UPDATE,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // Paginile de meserii si comparatii se reimprospateaza atat la un import
    // INS, cat si la un recast editorial. Sitemapul foloseste data cea mai noua.
    ...JUDETE.map((judet) => ({
      url: `${baseUrl}/salarii/judet/${judet.slug}`,
      lastModified: new Date(INS_GENERAT_LA),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),

    ...CATEGORII.map((categorie) => ({
      url: `${baseUrl}/salarii/domeniu/${categorie.slug}`,
      lastModified: new Date(INS_GENERAT_LA),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    ...MESERII.map((meserie) => ({
      url: `${baseUrl}/salarii/${meserie.slug}`,
      lastModified: MESERII_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),

    ...COMPARATII.map((comparatie) => ({
      url: `${baseUrl}/compara/${comparatie.slug}`,
      lastModified: MESERII_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    ...getAllArticles().map((a) => ({
      url: `${baseUrl}/noutati/${a.slug}`,
      lastModified: a.updated ? new Date(a.updated) : a.date ? new Date(a.date) : LAST_FISCAL_CONTENT_UPDATE,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
