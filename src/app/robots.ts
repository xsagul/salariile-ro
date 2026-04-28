import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /info e thin content, nu vrem să fie crawlat
        disallow: ["/api/", "/info"],
      },
    ],
    sitemap: "https://salariile.ro/sitemap.xml",
    host: "https://salariile.ro",
  };
}
