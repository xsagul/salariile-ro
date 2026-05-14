// app/cookies/page.tsx
// Server Component. Politica cookies — salariile.ro nu folosește cookies non-essential.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de cookies — fără tracking",
  description:
    "Salariile.ro este conceput cookieless. Nu folosim cookies pentru analiză, publicitate sau tracking. Detalii complete despre poziția noastră.",
  alternates: { canonical: "https://salariile.ro/cookies" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Politica cookies", item: "https://salariile.ro/cookies" },
      ],
    },
    {
      "@type": "WebPage",
      name: "Politica cookies salariile.ro",
      description:
        "Salariile.ro este cookieless prin design — fără cookies de tracking, analiză comportamentală sau publicitate.",
      url: "https://salariile.ro/cookies",
      inLanguage: "ro-RO",
      dateModified: "2026-05-11",
      isPartOf: {
        "@type": "WebSite",
        name: "Salariile.ro",
        url: "https://salariile.ro",
      },
    },
  ],
};

export default function CookiesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Politica cookies</span>
          </nav>
          <h1>Politica cookies</h1>
          <p className="subtitle">
            Salariile.ro este conceput să funcționeze fără cookies pentru tracking, publicitate sau analiză comportamentală. Această pagină explică ce cookies tehnice există (dacă există) și de ce nu folosim consent banner.
          </p>
          <p className="skeleton-hint">
            ZERO COOKIES DE TRACKING · ZERO PUBLICITATE · ÎN VIGOARE: 11 MAI 2026
          </p>
        </div>
      </section>

      <main>
        <section className="article-section">
          <div className="container">
            <h2>Ce sunt cookies</h2>
            <p>
              Cookies sunt fișiere mici de text pe care un site le poate salva în browser-ul tău pentru a păstra informații între vizite (preferințe de afișare, autentificare, sesiuni de cumpărături etc.).
            </p>
            <p>
              Regulamentul ePrivacy și GDPR impun ca site-urile să ceară consimțământul utilizatorului <strong>înainte</strong> de a seta cookies non-essential (cookies de marketing, analitică third-party, profilare etc.). Cookies strict necesare funcționării tehnice a site-ului nu necesită consimțământ.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Ce cookies folosește salariile.ro</h2>
            <p>
              Pe scurt: <strong>niciunul pentru tracking sau publicitate</strong>.
            </p>
            <p>
              Decizia de design este deliberată — calculatorul de salariu nu are nevoie să te urmărească pentru a funcționa. Toate calculele se execută local în browser, nu există conturi de utilizator, nu există formulare care să necesite păstrarea stării între pagini.
            </p>
            <p>
              În detaliu, pe categorii standard:
            </p>
            <ul className="article-list">
              <li>
                <strong>Cookies strict necesare</strong> — site-ul nu setează cookies funcționale de tipul „preferințe limbă" sau „mod întunecat", pentru că aceste funcționalități nu există în versiunea curentă. Dacă vor fi adăugate, această pagină va fi actualizată.
              </li>
              <li>
                <strong>Cookies de analiză</strong> — folosim Vercel Web Analytics, care este conceput <strong>cookieless</strong>. Vercel nu setează cookies pentru analiză și nu identifică vizitatori individuali. Datele agregate (număr de vizite, pagini populare) se calculează server-side pe baza request-urilor anonime.
              </li>
              <li>
                <strong>Cookies de marketing/publicitate</strong> — niciunul. Salariile.ro nu afișează reclame, nu folosește remarketing, nu integrează platforme publicitare.
              </li>
              <li>
                <strong>Cookies de la rețele sociale</strong> — niciunul. Nu sunt integrate widget-uri Facebook, Twitter sau alte rețele.
              </li>
            </ul>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>De ce nu există consent banner</h2>
            <p>
              Cele mai multe site-uri afișează un banner „Acceptă cookies" pentru că setează cookies care necesită consimțământ — cookies Google Analytics, Facebook Pixel, programe de afiliere etc.
            </p>
            <p>
              Salariile.ro nu setează astfel de cookies, deci nu are obligația legală să ceară consimțământ și nu afișează banner. Acest aspect este menit să facă experiența mai curată, nu să eludeze obligațiile GDPR — pur și simplu nu există date pentru care să se ceară consimțământ.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Cum verifici că nu există cookies</h2>
            <p>
              Poți verifica direct în browser. Pe orice browser modern (Chrome, Firefox, Brave, Safari):
            </p>
            <ul className="article-list">
              <li>Deschide salariile.ro</li>
              <li>Apasă F12 pentru a deschide instrumentele de dezvoltator</li>
              <li>Mergi la tab-ul „Application" (Chrome/Brave) sau „Storage" (Firefox)</li>
              <li>Caută secțiunea „Cookies" → lista pentru salariile.ro</li>
            </ul>
            <p>
              Lista trebuie să fie goală sau să conțină eventual cookies tehnice setate de Vercel pentru rutare/securitate (nu de tracking).
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Cum dezactivezi cookies (pentru orice site)</h2>
            <p>
              Chiar dacă pe salariile.ro nu sunt relevante, orice browser modern permite blocarea cookies global sau per site:
            </p>
            <ul className="article-list">
              <li><strong>Chrome / Brave / Edge:</strong> Setări → Confidențialitate și securitate → Cookies și alte date ale site-ului</li>
              <li><strong>Firefox:</strong> Setări → Confidențialitate și securitate → Cookies și date ale site-ului</li>
              <li><strong>Safari:</strong> Preferințe → Confidențialitate</li>
            </ul>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Informații suplimentare</h2>
            <p>
              Pentru detalii despre toate datele prelucrate (inclusiv logs de server, statistici anonime), vezi <Link href="/politica-confidentialitate">politica de confidențialitate</Link>.
            </p>
            <p className="source-note">Ultima actualizare: 11 mai 2026.</p>
          </div>
        </section>
      </main>
    </>
  );
}
