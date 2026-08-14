// src/app/(site)/layout.tsx
// Layout pentru site-ul public: Header, Footer și analytics.
//
// Grupul `(site)` nu apare în URL — /salariu-minim rămâne /salariu-minim.
// Rostul lui e să separe paginile normale de rutele de widget din `(embed)`,
// care rulează în <iframe> pe site-uri terțe și nu trebuie să aibă nici
// navigație, nici măsurare (vizitele lor nu sunt vizitele noastre).
//
// Înainte, decizia asta se lua citind `x-pathname` din headere, în root
// layout — ceea ce făcea întregul site dinamic. Acum e o chestiune de
// structură de fișiere și nu costă nimic la runtime.
//
// Fără `nonce` pe scripturi: CSP-ul paginilor statice folosește
// `script-src 'self'`, nu `strict-dynamic`, iar /stats.js e servit de pe
// domeniul propriu (rewrite în next.config.ts). Vezi src/proxy.ts pentru
// politica pe rute.

import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import TimpPePagina from "@/app/components/TimpPePagina";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      {/* Web Analytics (Vercel, cookieless) — declarat în /cookies și
          /politica-confidentialitate. Rămâne ca referință independentă față de
          Umami: două măsurători ale aceluiași trafic, utile pentru validare
          încrucișată. Doar pe Vercel. */}
      {process.env.VERCEL_ENV && <Analytics />}
      {/* Umami — instanță proprie, cookieless. Servit prin /stats.js de pe
          domeniul propriu, ca să nu fie blocat de blocantele de reclame.
          Nu setează cookies, deci nu cere banner și nu contrazice /cookies. */}
      {process.env.VERCEL_ENV && (
        <Script
          src="/stats.js"
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
      {process.env.VERCEL_ENV && <TimpPePagina />}
    </>
  );
}
