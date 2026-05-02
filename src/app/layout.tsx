// src/app/layout.tsx
// Root layout — încarcă Figtree o singură dată, aplică pe tot site-ul.

import { Figtree } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { headers } from "next/headers"; // Adăugat pentru citirea nonce-ului
import type { Metadata } from "next";

import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Figtree — font modern, sans-serif, cu suport pentru diacritice românești.
const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://salariile.ro"),
  title: {
    default: "Salariile.ro — Calculator Salariu Net, Informații Salariale România",
    template: "%s | Salariile.ro",
  },
  description:
    "Calculator salariu net din brut 2026, salariu minim, salariu mediu și noutăți legislative. Totul despre salariile din România.",
  authors: [{ name: "Salariile.ro" }],
  creator: "Salariile.ro",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://salariile.ro",
    siteName: "Salariile.ro",
    title: "Salariile.ro — Calculator Salariu Net 2026",
    description:
      "Calculator salariu net, informații despre salariul minim și mediu în România.",
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

// src/app/layout.tsx

// 1. Schimbă funcția în 'async' pentru a putea folosi 'await'
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2. Adaugă 'await' înainte de headers()
  const headerStore = await headers();
  const nonce = headerStore.get("x-nonce") || undefined;

  return (
    <html lang="ro" className={figtree.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta
          name="google-site-verification"
          content="Ix4lU_YUiGCjX5B6z_v2gKpdpQ5VRsfp0uqzg8MMU_c"
        />
      </head>
      <body>
        <div className="page">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
        {/* Păstrăm fix-ul pentru eroarea de tip din Screenshot (3).jpg */}
        <SpeedInsights {...({ nonce } as any)} />
      </body>
    </html>
  );
}