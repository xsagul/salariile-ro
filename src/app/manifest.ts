// src/app/manifest.ts
// Next.js file convention — generează /manifest.webmanifest automat la build.
// Înregistrat ca <link rel="manifest"> în <head> fără configurare suplimentară.

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Salariile.ro — Calculator salariu net 2026",
    short_name: "salariile.ro",
    description:
      "Calculator salariu net din brut 2026, salariu minim, salariu mediu, informații fiscale România.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#52565f",
    lang: "ro-RO",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
