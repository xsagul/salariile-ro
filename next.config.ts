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

  // Redirecturi utile
  async redirects() {
    return [
      {
        source: "/calculator-salariu",
        destination: "/calculator",
        permanent: true,
      },
      {
        source: "/calcul-salariu-net",
        destination: "/calculator",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;