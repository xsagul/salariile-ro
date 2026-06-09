import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // Compresie automată
  compress: true,

  // Headers pentru SEO și performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Headere noi adăugate pentru securitate maximă (Lighthouse):
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" }
          // NOTE: Link header (RFC 8288) e setat din middleware ca să se aplice
          // DOAR pe răspunsurile HTML/dynamic (nu pe asseturi statice — nu are
          // sens să trimitem hint-uri de sitemap pe fiecare .png/.woff2/.svg).
        ],
      },
      {
        source: "/(.*)\\.(ico|png|svg|jpg|jpeg|webp|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // ─── Redirect-uri permanente pentru URL-uri vechi (păstrează SEO juice) ───
      // Acestea au intent clar: utilizatorul caută calculator → îl ducem pe homepage.
      {
        source: "/calculator-salariu",
        destination: "/",
        permanent: true,
      },
      {
        source: "/calcul-salariu-net",
        destination: "/",
        permanent: true,
      },
      {
        source: "/calculator",
        destination: "/",
        permanent: true,
      },

      // Consolidare: pagina „net" a fost absorbită în pilonul /salariu-minim
      // (secțiunea #net). Redirect permanent ca să nu pierdem autoritatea URL-ului.
      {
        source: "/salariu-minim/net",
        destination: "/salariu-minim",
        permanent: true,
      },

      // ─── Redirectele către /info au fost ELIMINATE (30 aprilie 2026) ─────────
      // Motivul: /info e noindex, deci Google marca lanțul "redirect → pagină
      // neindexabilă", afectând crawl budget și generând mesaje GSC.
      //
      // URL-urile afectate (acum returnează 404 natural):
      //   /politica-confidentialitate
      //   /termeni
      //   /calculator-pfa
      //   /calculator-concediu
      //   /noutati
      //
      // Pe măsură ce construim aceste pagini real, le adăugăm ca rute Next.js,
      // nu ca redirecte. Google va re-indexa automat cu conținut real.
    ];
  },
};

export default nextConfig;
