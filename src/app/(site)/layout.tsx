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
// `script-src 'self'`, nu `strict-dynamic`. Vezi src/proxy.ts pentru politica
// pe rute.

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
          /politica-confidentialitate. Singura măsurătoare de trafic de pe site
          de la dezafectarea instanței Umami, 28 august 2026. Doar pe Vercel. */}
      {process.env.VERCEL_ENV && <Analytics />}
      {/* Speed Insights (Vercel, cookieless) — Core Web Vitals din teren real.
          Declarat în /cookies și /politica-confidentialitate. Adăugat 1 septembrie
          2026: măsurătoarea de teren lipsea de la dezafectarea Umami. Doar pe
          Vercel. Same-origin (/_vercel/speed-insights/), deci trece de CSP-ul
          `script-src 'self'` fără modificări — vezi src/lib/csp.ts.

          `sampleRate` pus pe 10 septembrie 2026: planul Hobby dă 10.000 de
          evenimente pe perioadă, iar la rată plină cota s-a epuizat în 9 zile
          (10K/10K în dashboard) — deci măsurătoarea murea și restul lunii nu
          mai exista deloc. La ~830 de afișări/zi și ~1,34 evenimente pe
          afișare, rata plină cere ~33.000 de evenimente/lună. 0,2 lasă ~6.700,
          adică date pe toată luna, cu spațiu pentru creșterea traficului.
          Compromisul e că p75 pe rută devine zgomotos; p75 pe site rămâne
          solid. Ridică rata doar odată cu planul, nu „ca să vedem mai bine". */}
      {process.env.VERCEL_ENV && <SpeedInsights sampleRate={0.2} />}
    </>
  );
}
