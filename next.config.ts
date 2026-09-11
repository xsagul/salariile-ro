import type { NextConfig } from "next";
import { LATIMI_IMAGINI } from "./src/lib/image-loader";

// Site 100% static, găzduit pe Cloudflare din septembrie 2026.
//
// `output: "export"` scrie tot site-ul în out/ ca fișiere. Consecințe asumate:
// - headers() și redirects() nu mai stau aici: scripts/genereaza-cloudflare.mts
//   le scrie în out/_headers și out/_redirects, din src/lib/csp.ts și
//   src/lib/redirecturi.ts;
// - nu există middleware, ISR sau rute dinamice; ce depindea de cerere a devenit
//   fișier generat la build sau cod care rulează în browser;
// - imaginile nu se optimizează la cerere: vezi src/lib/image-loader.ts.
const nextConfig: NextConfig = {
  output: "export",

  // Nu expunem implementarea frameworkului în răspunsurile HTTP.
  poweredByHeader: false,

  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    imageSizes: LATIMI_IMAGINI.filter((latime) => latime < 640),
    deviceSizes: LATIMI_IMAGINI.filter((latime) => latime >= 640),
  },
};

export default nextConfig;
