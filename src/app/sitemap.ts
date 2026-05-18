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
    // Selecție data-backed (Google Keyword Planner + Ahrefs + GSC propriu, mai 2026):
    // - 4050, 4325 = salariul minim S1/S2 (legislativ + Ahrefs >100/lună)
    // - 5000, 6000, 6500, 7000, 8000, 10000 = numere rotunde cu cerere confirmată
    // - 7350 = descoperit prin cross-check (Ahrefs >100/lună, distribuit pe variații)
    // Numere TĂIATE (zero/slab semnal): 4500, 5500, 7500, 9000, 12000, 15000, 20000.
    ...([4050, 4325, 5000, 6000, 6500, 7000, 7350, 8000, 10000].map(v => ({
      url: `${baseUrl}/calculator/calcul-salariu-net-${v}-brut`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))),

    // ─── Pagini dinamice — calcul brut pornind de la NET ────────────────────
    // Net→brut e direcție de nișă (Ahrefs <100/lună pentru toate).
    // Păstrăm doar 3000 și 5000 = singurele cu vreun semnal în Google data.
    // Tăiate: 2500, 2574, 2700, 3200, 3500, 4000, 4500, 6000, 7000.
    ...([3000, 5000].map(v => ({
      url: `${baseUrl}/calculator/calcul-salariu-brut-${v}-net`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))),
  ];
}
