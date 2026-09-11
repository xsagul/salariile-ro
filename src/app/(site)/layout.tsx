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
// `script-src 'self'`, nu `strict-dynamic`. Vezi src/lib/csp.ts pentru politica
// pe rute.


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
      {/* Analytics: Cloudflare Web Analytics, injectat automat la edge
          (cookieless, fără localStorage, fără amprentare). Nu se încarcă nimic
          din cod; CSP-ul permite beacon-ul în src/lib/csp.ts. Declarat în
          /cookies și /politica-confidentialitate. Vercel Analytics și Speed
          Insights au dispărut la mutarea pe Cloudflare (septembrie 2026); Core
          Web Vitals din teren rămân disponibile din CrUX (`npm run psi`). */}
    </>
  );
}
