// ── app/layout.tsx ──────────────────────────────────────────────────────────
// Pune acest fișier în app/layout.tsx (Next.js 14+ App Router)
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://salariile.ro"),
  title: {
    default: "Salariile.ro — Calculator Salariu Net, Informații Salariale România",
    template: "%s | Salariile.ro",
  },
  description:
    "Calculator salariu net din brut 2026, salariu minim, salariu mediu și noutăți legislative. Totul despre salariile din România.",
  keywords: [
    "calculator salariu",
    "calculator salariu net",
    "calcul salariu net",
    "salariu net brut",
    "salariu minim 2026",
    "salariu mediu Romania",
    "calculator salarii",
  ],
  authors: [{ name: "Salariile.ro" }],
  creator: "Salariile.ro",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://salariile.ro",
    siteName: "Salariile.ro",
    title: "Salariile.ro — Calculator Salariu Net 2026",
    description: "Calculator salariu net, informații despre salariul minim și mediu în România.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Salariile.ro — Calculator Salariu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Salariile.ro — Calculator Salariu Net 2026",
    description: "Calculează salariul net din brut în câteva secunde.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://salariile.ro",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="google-site-verification" content="Ix4lU_YUiGCjX5B6z_v2gKpdpQ5VRsfp0uqzg8MMU_c" />
      </head>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}


// ── app/robots.ts ─────────────────────────────────────────────────────────────
// Pune în app/robots.ts — generează /robots.txt automat

/*
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: "https://salariile.ro/sitemap.xml",
    host: "https://salariile.ro",
  };
}
*/


// ── app/sitemap.ts ────────────────────────────────────────────────────────────
// Pune în app/sitemap.ts — generează /sitemap.xml automat

/*
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
*/


// ── next.config.ts ────────────────────────────────────────────────────────────

/*
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
*/
