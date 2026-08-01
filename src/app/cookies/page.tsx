// app/cookies/page.tsx
// Server Component. Politica cookies — cookies de analiză doar cu consimțământ explicit.

import type { Metadata } from "next";
import Link from "next/link";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Politica de cookies: analiză doar cu acordul tău",
  description:
    "Salariile.ro nu setează cookies până nu accepți. Analiza traficului e opțională, publicitate nu există, iar site-ul funcționează integral dacă refuzi.",
  alternates: { canonical: "https://salariile.ro/cookies" },
  openGraph: ogPage({
    title: "Politica de cookies: analiză doar cu acordul tău",
    description:
      "Salariile.ro nu setează cookies până nu accepți. Analiza e opțională, publicitate nu există.",
    path: "/cookies",
  }),
  twitter: twPage({
    title: "Politica de cookies: analiză doar cu acordul tău",
    description:
      "Salariile.ro nu setează cookies până nu accepți. Analiza e opțională, publicitate nu există.",
  }),
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
        "Salariile.ro nu setează cookies fără consimțământ. Analiza traficului este opțională și refuzabilă, fără cookies de publicitate sau profilare.",
      url: "https://salariile.ro/cookies",
      inLanguage: "ro-RO",
      dateModified: "2026-07-31",
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

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Politica cookies" }]} />
        <H1>Politica cookies</H1>
        <Lead>
          Salariile.ro nu setează niciun cookie până nu îți ceri acordul, iar site-ul funcționează integral dacă refuzi. Singurele cookies posibile sunt cele de analiză a traficului, pe care le poți accepta sau refuza din bannerul afișat la prima vizită. Publicitate nu există deloc.
        </Lead>
        <Eyebrow>ZERO PUBLICITATE · ANALIZĂ DOAR CU ACORD · ACTUALIZAT: 31 IULIE 2026</Eyebrow>
      </Hero>

      <div>
        <Section>
            <h2>Ce sunt cookies</h2>
            <p>
              Cookies sunt fișiere mici de text pe care un site le poate salva în browser-ul tău pentru a păstra informații între vizite (preferințe de afișare, autentificare, sesiuni de cumpărături etc.).
            </p>
            <p>
              Regulamentul ePrivacy și GDPR impun ca site-urile să ceară consimțământul utilizatorului <strong>înainte</strong> de a seta cookies non-essential (cookies de marketing, analitică third-party, profilare etc.). Cookies strict necesare funcționării tehnice a site-ului nu necesită consimțământ.
            </p>
        </Section>

        <Section>
            <h2>Ce cookies folosește salariile.ro</h2>
            <p>
              Pe scurt: <strong>niciunul pentru publicitate</strong>, iar cele de analiză doar dacă le accepți explicit.
            </p>
            <p>
              Calculatorul de salariu nu are nevoie să te urmărească pentru a funcționa. Toate calculele se execută local în browser, nu există conturi de utilizator, nu există formulare care să necesite păstrarea stării între pagini. Dacă refuzi analiza, nu pierzi absolut nicio funcționalitate.
            </p>
            <p>
              În detaliu, pe categorii standard:
            </p>
            <ul>
              <li>
                <strong>Cookies strict necesare</strong>: site-ul nu setează cookies funcționale de tipul „preferințe limbă” sau „mod întunecat”, pentru că aceste funcționalități nu există în versiunea curentă. Dacă vor fi adăugate, această pagină va fi actualizată.
              </li>
              <li>
                <strong>Cookies de analiză</strong>: folosim două instrumente, cu regimuri diferite. <strong>Vercel Web Analytics</strong> este conceput <strong>cookieless</strong> — nu setează cookies, nu identifică vizitatori individuali, iar datele agregate se calculează server-side pe baza request-urilor anonime; de aceea rulează fără să-ți cerem acordul. <strong>Google Analytics 4</strong> setează cookies (<code>_ga</code> și <code>_ga_2L1J64H5H9</code>, valabile până la 2 ani) și <strong>se încarcă doar dacă apeși „Accept” în banner</strong>. Dacă refuzi, scriptul Google nu este descărcat deloc — nu îl încărcăm „în modul refuzat”, pur și simplu nu ajunge în pagină.
              </li>
              <li>
                <strong>Cookies de marketing/publicitate</strong>: niciunul. Salariile.ro nu afișează reclame, nu folosește remarketing, nu integrează platforme publicitare.
              </li>
              <li>
                <strong>Cookies de la rețele sociale</strong>: niciunul. Nu sunt integrate widget-uri Facebook, Twitter sau alte rețele.
              </li>
            </ul>
        </Section>

        <Section>
            <h2>Cum funcționează bannerul de consimțământ</h2>
            <p>
              Până pe 31 iulie 2026 site-ul nu a avut banner, pentru că nu seta niciun cookie. Odată cu adăugarea Google Analytics 4 situația s-a schimbat, iar pagina aceasta a fost actualizată ca să spună exact ce se întâmplă.
            </p>
            <p>
              Bannerul apare la prima vizită și are două butoane, <strong>Da</strong> și <strong>Nu</strong>, ambele pe primul ecran și la un singur click. Refuzul nu este ascuns după un meniu de setări. Nimic nu se încarcă înainte să alegi.
            </p>
            <p>
              Alegerea se salvează local, în spațiul de stocare al browserului, nu într-un cookie. Reținem cele două răspunsuri diferit, și preferăm să scriem asta explicit decât să o descoperi singur: dacă accepți, ținem minte <strong>6 luni</strong>; dacă refuzi, ținem minte <strong>doar pe durata vizitei</strong>, iar la următoarea accesare bannerul apare din nou. Refuzul rămâne valabil integral cât timp ești pe site și nu se încarcă nimic de la Google în acel timp.
            </p>
            <p>
              Dacă refuzi, ștergem și eventualele cookies <code>_ga</code> rămase de la o acceptare anterioară. Ca să îți schimbi alegerea, șterge datele site-ului din browser: bannerul reapare la următoarea încărcare.
            </p>
        </Section>

        <Section>
            <h2>Cum verifici ce cookies există</h2>
            <p>
              Poți verifica direct în browser. Pe orice browser modern (Chrome, Firefox, Brave, Safari):
            </p>
            <ul>
              <li>Deschide salariile.ro</li>
              <li>Apasă F12 pentru a deschide instrumentele de dezvoltator</li>
              <li>Mergi la tab-ul „Application” (Chrome/Brave) sau „Storage” (Firefox)</li>
              <li>Caută secțiunea „Cookies” → lista pentru salariile.ro</li>
            </ul>
            <p>
              Dacă ai refuzat sau încă nu ai ales, lista trebuie să fie goală sau să conțină cel mult cookies tehnice setate de Vercel pentru rutare și securitate. Dacă ai acceptat, vei vedea <code>_ga</code> și <code>_ga_2L1J64H5H9</code> — acelea sunt cele de la Google Analytics și dispar dacă ștergi datele site-ului și alegi „Refuz”.
            </p>
        </Section>

        <Section>
            <h2>Cum dezactivezi cookies (pentru orice site)</h2>
            <p>
              Dacă vrei o barieră suplimentară față de alegerea din banner, orice browser modern permite blocarea cookies global sau per site:
            </p>
            <ul>
              <li><strong>Chrome / Brave / Edge:</strong> Setări → Confidențialitate și securitate → Cookies și alte date ale site-ului</li>
              <li><strong>Firefox:</strong> Setări → Confidențialitate și securitate → Cookies și date ale site-ului</li>
              <li><strong>Safari:</strong> Preferințe → Confidențialitate</li>
            </ul>
        </Section>

        <Section>
            <h2>Informații suplimentare</h2>
            <p>
              Pentru detalii despre toate datele prelucrate (inclusiv logs de server, statistici anonime), vezi <Link href="/politica-confidentialitate">politica de confidențialitate</Link>.
            </p>
            <p className="source-note">Ultima actualizare: 11 mai 2026.</p>
        </Section>
      </div>
    </>
  );
}
