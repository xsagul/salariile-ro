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

const STATIC_ENTRIES: {
  path: keyof typeof PAGE_LAST_MODIFIED;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/salariu-minim", priority: 0.9, changeFrequency: "monthly" },
  { path: "/salariu-mediu", priority: 0.9, changeFrequency: "monthly" },
  { path: "/zile-libere-2026", priority: 0.8, changeFrequency: "monthly" },
  { path: "/metodologie", priority: 0.6, changeFrequency: "monthly" },
  { path: "/despre", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/politica-confidentialitate", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  { path: "/termeni", priority: 0.3, changeFrequency: "yearly" },
];

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
  ];
}
