// src/app/layout.tsx
// Root layout — design modern & simplu, font unic Inter (UI + body + cifre).
// Cifrele folosesc font-variant-numeric: tabular-nums (setat în globals.css).

import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import TimpPePagina from "@/app/components/TimpPePagina";
import { headers } from "next/headers"; // Adăugat pentru citirea nonce-ului
import type { Metadata } from "next";

import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

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
      "Calculator salariu net, informații despre salariul minim și mediu în România.",
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
  verification: {
    other: {
      seobility: "341f6613f4c3739772cc254cbb6f6102",
    },
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

  // /widget/frame și subrutele sale rulează în <iframe> pe alte site-uri: fără
  // Header/Footer, doar conținutul widgetului. Pathname-ul vine din proxy.
  const isEmbeddableFrame = (headerStore.get("x-pathname") || "").startsWith("/widget/frame");

  return (
    <html lang="ro" className={inter.variable}>
      <head>
        {/* Next.js va folosi automat nonce-ul pentru scripturile sale de sistem */}
      </head>
      <body className="min-h-screen overflow-x-hidden bg-white font-sans text-stone-700 antialiased">
        {isEmbeddableFrame ? (
          children
        ) : (
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        )}
        {/* Speed Insights doar pe Vercel — pe localhost scriptul /_vercel/speed-insights/script.js
            dă 404 și loghează eroare în consolă (scade Best Practices). VERCEL_ENV e setat doar pe Vercel.
            nonce necesar pentru CSP; prop lipsește din tipurile @vercel/speed-insights. */}
        {process.env.VERCEL_ENV && (
          // @ts-expect-error SpeedInsights acceptă nonce la runtime
          <SpeedInsights nonce={nonce} />
        )}
        {/* Web Analytics (Vercel, cookieless) — declarat în /cookies și /politica-confidentialitate.
            Doar pe Vercel, ca Speed Insights. Nonce-ul CSP e aplicat automat de Next.js pe
            scriptul next/script al componentei (CSP are 'strict-dynamic'). */}
        {process.env.VERCEL_ENV && <Analytics />}
        {/* Umami — instanță proprie, cookieless. Servit prin /stats.js de pe
            domeniul propriu (rewrite în next.config.ts), ca să nu fie blocat.
            Nu setează cookies, deci nu cere banner și nu contrazice /cookies.
            Nonce necesar: CSP are 'strict-dynamic', care ignoră 'self'.
            Nu se montează în iframe: widgetul rulează pe site-uri terțe, iar
            vizitele lor nu sunt vizitele noastre. */}
        {process.env.VERCEL_ENV && !isEmbeddableFrame && (
          <Script
            src="/stats.js"
            nonce={nonce}
            strategy="afterInteractive"
            data-website-id="17dce2b5-ee24-4155-9ad9-a7ed937066fd"
            // Core Web Vitals. Colectarea e opt-in în tracker: fără atributul
            // ăsta, `initPerformance()` nu se apelează deloc, iar coloanele
            // lcp/cls/inp/fcp/ttfb din baza de date rămân goale — exact ce am
            // constatat după prima zi. Metricile se trimit ca event_type 5,
            // când pagina devine ascunsă.
            data-performance="true"
          />
        )}
        {/* Eveniment de ieșire cu timpul petrecut. Fără el, o vizită de o
            singură pagină are un singur timestamp și Umami raportează 0s. */}
        {process.env.VERCEL_ENV && !isEmbeddableFrame && <TimpPePagina />}
      </body>
    </html>
  );
}
