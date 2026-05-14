import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /info are noindex on-page (metadata.robots) — îl lăsăm crawlabil ca
        // Google să citească directiva. Disallow l-ar bloca înainte de citire.
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://salariile.ro/sitemap.xml",
    host: "https://salariile.ro",
  };
}
