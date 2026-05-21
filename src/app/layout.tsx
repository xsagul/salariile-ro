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
    default: "Calculator Salariu Net 2026 — Brut în Net | Salariile.ro",
    template: "%s | Salariile.ro",
  },
  description:
    "Calculează salariul net din brut în 2026: CAS, CASS, impozit și cost angajator. Actualizat conform HG 146/2026. Rapid, gratuit, fără cont.",
  authors: [{ name: "Știuriuc Sorin-Marian", url: "https://salariile.ro/despre" }],
  creator: "Știuriuc Sorin-Marian",
  publisher: "Salariile.ro",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://salariile.ro",
    siteName: "Salariile.ro",
    title: "Calculator Salariu Net 2026 — Salariile.ro",
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
    title: "Calculator Salariu Net 2026 — Salariile.ro",
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
  const headerStore = await headers();
  const nonce = headerStore.get("x-nonce") || undefined;

  return (
    <html lang="ro" className={figtree.variable}>
      <head>
        {/* Next.js va folosi automat nonce-ul pentru scripturile sale de sistem */}
      </head>
      <body>
        <div className="page">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
        {/* Passam nonce-ul către SpeedInsights pentru a nu fi blocat */}
        <SpeedInsights {...({ nonce } as any)} />
      </body>
    </html>
  );
}