// src/app/manifest.ts
// Next.js file convention — generează /manifest.webmanifest automat la build.
// Înregistrat ca <link rel="manifest"> în <head> fără configurare suplimentară.

import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Salariile",
    short_name: "Salariile",
    description:
      "Calculator salariu net din brut 2026, salariu minim, salariu mediu, informații fiscale România.",
    start_url: "/",
    display: "standalone",
    // Fundalul de splash rămâne canvas-ul site-ului, ca prima pagină să nu
    // „clipească” din alb în crem. Galbenul mărcii e culoarea barei.
    background_color: "#f8f5ef",
    theme_color: "#FFC61A",
    lang: "ro-RO",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
