import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const baseUrl = "https://salariile.ro";

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/salariu-minim`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/salariu-mediu`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // 1. Pentru cei care caută NET pornind de la BRUT
    ...([4050, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 9000, 10000, 12000, 15000, 20000].map(v => ({
      url: `${baseUrl}/calculator/calcul-salariu-net-${v}-brut`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))),

    // 2. Pentru cei care caută BRUT pornind de la NET
    ...([2500, 2574, 2700, 3000, 3200, 3500, 4000, 4500, 5000, 6000, 7000].map(v => ({
      url: `${baseUrl}/calculator/calcul-salariu-brut-${v}-net`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))),
  ];
}
