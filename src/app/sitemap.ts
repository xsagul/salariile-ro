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
  ];
}