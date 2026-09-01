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
          `script-src 'self'` fără modificări — vezi src/proxy.ts. */}
      {process.env.VERCEL_ENV && <SpeedInsights />}
    </>
  );
}
