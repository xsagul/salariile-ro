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


import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const GA_MEASUREMENT_ID = "G-2L1J64H5H9";
const ADSENSE_CLIENT = "ca-pub-5894290637571256";

// Meta tag-ul rămâne ca metodă suplimentară de verificare a contului.
export const metadata: Metadata = {
  other: {
    "google-adsense-account": ADSENSE_CLIENT,
  },
};

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
      {/* Starea implicită este refuzată înainte de încărcarea tagurilor. CMP-ul
          Google publicat în AdSense actualizează automat Consent Mode după
          alegerea vizitatorului. În modul avansat pot exista pinguri fără
          cookies înainte de acord, dar stocarea rămâne blocată. */}
      <script
        id="google-consent-default"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
window.googlefc=window.googlefc||{};
window.googlefc.callbackQueue=window.googlefc.callbackQueue||[];
gtag('consent','default',{
  'ad_storage':'denied',
  'ad_user_data':'denied',
  'ad_personalization':'denied',
  'analytics_storage':'denied',
  'wait_for_update':500
});
gtag('set','ads_data_redaction',true);
try{localStorage.removeItem('salariile-consimtamant-analytics')}catch(e){}`,
        }}
      />
      {/* Scriptul AdSense publică CMP-ul Google. Auto ads este OFF în cont și
          nu există unități publicitare în pagini, deci nu apar reclame. */}
      <Script
        id="adsense-cmp"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <Script
        id="ga4-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`gtag('js',new Date());
gtag('config','${GA_MEASUREMENT_ID}',{
  'anonymize_ip':true,
  'allow_google_signals':false,
  'allow_ad_personalization_signals':false
});`}
      </Script>
      {/* Analytics: Cloudflare Web Analytics, injectat automat la edge
          (cookieless, fără localStorage, fără amprentare). Nu se încarcă nimic
          din cod; CSP-ul permite beacon-ul în src/lib/csp.ts. Declarat în
          /cookies și /politica-confidentialitate. GA4 respectă alegerea din
          CMP-ul Google prin Consent Mode. Vercel Analytics și Speed
          Insights au dispărut la mutarea pe Cloudflare (septembrie 2026); Core
          Web Vitals din teren rămân disponibile din CrUX (`npm run psi`). */}
    </>
  );
}
