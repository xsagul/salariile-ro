// src/app/layout.tsx
// Root layout — doar <html>/<body>, fontul și metadata implicită.
//
// Deliberat MINIMAL și complet static. Header, Footer și analytics stau în
// src/app/(site)/layout.tsx, iar rutele de widget în src/app/(embed)/.
//
// De ce: până pe 15 august 2026 acest fișier citea `headers()` ca să afle
// nonce-ul CSP și pathname-ul (pentru a decide dacă randează Header/Footer).
// `await headers()` într-un server component scoate din render static tot ce
// e sub el — iar fiind în root layout, „tot ce e sub el” însemna ÎNTREGUL
// site. Rezultatul măsurat: 26 de rute dinamice, `Cache-Control: no-store` și
// `X-Vercel-Cache: MISS` pe absolut fiecare cerere, inclusiv la fiecare
// trecere de bot. `export const revalidate` din zile-lucratoare-2026 era cod
// mort din același motiv.
//
// După separarea în route groups: 28 de rute statice/prerandate, 3 dinamice
// (API-ul de markdown și cele două rute de widget, care citesc searchParams).
//
// Nu adăuga aici `headers()`, `cookies()` sau alt API dinamic. Dacă ai nevoie
// de ele, pune-le în layout-ul grupului care le cere, nu în rădăcină.

import { Inter } from "next/font/google";
import type { Metadata } from "next";

import "./globals.css";

// Inter Variable — font unic pentru tot site-ul (UI, body, tabele, cifre).
// Fără weight specific → variable font version, ~30 KB optimizat.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://salariile.ro"),
  title: {
    default: "Calculator Salariu Net 2026: Brut în Net | Salariile.ro",
    template: "%s | Salariile.ro",
  },
  description:
    "Calculează salariul net din brut în 2026: CAS, CASS, impozit și cost angajator, conform HG 146/2026. Făcut pentru angajații din România. Fără reclame, fără cont.",
  authors: [{ name: "Știuriuc Sorin-Marian", url: "https://salariile.ro/despre" }],
  creator: "Știuriuc Sorin-Marian",
  publisher: "Salariile.ro",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://salariile.ro",
    siteName: "Salariile.ro",
    title: "Calculator Salariu Net 2026 | Salariile.ro",
    description:
      "Calculează salariul net din brut sau brutul din net, cu regulile fiscale 2026. Fără reclame, fără cont.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Salariile.ro, calculator salariu net",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculator Salariu Net 2026 | Salariile.ro",
    description: "Calculează salariul net din brut sau brutul din net, cu regulile fiscale 2026.",
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
  verification: {
    other: {
      seobility: "341f6613f4c3739772cc254cbb6f6102",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={inter.variable}>
      <body className="min-h-screen overflow-x-hidden bg-white font-sans text-stone-700 antialiased">
        {children}
      </body>
    </html>
  );
}
