import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
  },
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

  // Redirecturi utile pentru a evita 404
  async redirects() {
    return [
      // Redirect-urile tale vechi
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
      // Redirect-uri noi către pagina de INFO (ca să eviți penalizarea Google)
      // Adaugă astea în lista de redirecturi din next.config.ts
      {
        source: '/politica-confidentialitate',
        destination: '/info',
        permanent: false,
      },
      {
        source: '/termeni',
        destination: '/info',
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
        source: "/salariu-mediu",
        destination: "/info",
        permanent: false,
      },
      {
        source: "/noutati",
        destination: "/info",
        permanent: false,
      },
      {
        source: "/calculator",
        destination: "/",
        permanent: false,
      }
    ];
  },
};

export default nextConfig;