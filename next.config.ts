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
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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

      // ─── Redirect-uri TEMPORARE către /info pentru pagini neimplementate ────
      // ATENȚIE: Pe măsură ce construim paginile reale, ștergem entry-urile
      // corespunzătoare de aici (ca am făcut deja cu /salariu-minim).
      {
        source: "/politica-confidentialitate",
        destination: "/info",
        permanent: false,
      },
      {
        source: "/termeni",
        destination: "/info",
        permanent: false,
      },
      {
        source: "/calculator-pfa",
        destination: "/info",
        permanent: false,
      },
      {
        source: "/calculator-concediu",
        destination: "/info",
        permanent: false,
      },
      {
        source: "/noutati",
        destination: "/info",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
