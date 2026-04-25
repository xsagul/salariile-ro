import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: "https://salariile.ro",
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://salariile.ro/calculator",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://salariile.ro/salariu-minim",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://salariile.ro/salariu-mediu",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://salariile.ro/noutati",
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // PAGINI GENERATE AUTOMAT CU NOUL FORMAT
    // 1. Pentru cei care caută NET pornind de la BRUT
    ...([4050, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 9000, 10000, 12000, 15000, 20000].map(v => ({
      url: `https://salariile.ro/calculator/calcul-salariu-net-${v}-brut`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))),
    // 2. Pentru cei care caută BRUT pornind de la NET
    ...([2363, 2500, 2700, 3000, 3200, 3500, 4000, 4500, 5000, 6000, 7000].map(v => ({
      url: `https://salariile.ro/calculator/calcul-salariu-brut-${v}-net`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))),
  ];
}