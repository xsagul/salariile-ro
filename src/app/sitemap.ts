import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const baseUrl = "https://salariile.ro";

  return [
    // ─── Pagina principală ──────────────────────────────────────────────────
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },

    // ─── Pagini de conținut (high priority pentru SEO) ──────────────────────
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

    // ─── Pagini de încredere / E-E-A-T ──────────────────────────────────────
    {
      url: `${baseUrl}/metodologie`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/despre`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },

    // ─── Pagini legale (priority mică, dar prezente) ────────────────────────
    {
      url: `${baseUrl}/politica-confidentialitate`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/termeni`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },

    // ─── Pagini dinamice — calcul net pornind de la BRUT ────────────────────
    ...([4050, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 9000, 10000, 12000, 15000, 20000].map(v => ({
      url: `${baseUrl}/calculator/calcul-salariu-net-${v}-brut`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))),

    // ─── Pagini dinamice — calcul brut pornind de la NET ────────────────────
    ...([2500, 2574, 2700, 3000, 3200, 3500, 4000, 4500, 5000, 6000, 7000].map(v => ({
      url: `${baseUrl}/calculator/calcul-salariu-brut-${v}-net`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))),
  ];
}
