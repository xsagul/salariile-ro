// app/cookies/page.tsx
// Server Component. Politica cookies.
//
// Istoric, ca să nu se piardă contextul:
//   - până la 13 aug 2026: site fără publicitate, pagina afirma „zero cookies
//     de tracking, zero publicitate” și explica de ce nu există consent banner;
//   - 13 aug 2026: integrat Google AdSense, pagina rescrisă;
//   - 14 aug 2026: AdSense scos, pagina rescrisă din nou.
//
// Secțiunea „Ce am măsurat” se păstrează deliberat, deși reclamele nu mai sunt
// active: e o măsurătoare reală pe utilizatorii noștri, e utilă publicului și
// documentează de ce am renunțat. Dacă AdSense se repune, se remăsoară înainte
// de a modifica textul — măsurătoarea inițială, făcută pe localhost cu CMP-ul
// nepublicat, a dat alt rezultat decât producția.

import type { Metadata } from "next";
import Link from "next/link";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Politica de cookies, fără tracking",
  description:
    "Salariile.ro este cookieless. Nu folosim cookies pentru analiză, publicitate sau tracking. Inclusiv ce am măsurat în cele 24 de ore în care am testat reclame.",
  alternates: { canonical: "https://salariile.ro/cookies" },
  openGraph: ogPage({
    title: "Politica de cookies, fără tracking",
    description:
      "Salariile.ro este cookieless: fără cookies de analiză, publicitate sau tracking.",
    path: "/cookies",
  }),
  twitter: twPage({
    title: "Politica de cookies, fără tracking",
    description:
      "Salariile.ro este cookieless: fără cookies de analiză, publicitate sau tracking.",
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
        "Salariile.ro este cookieless prin design, fără cookies de tracking, analiză comportamentală sau publicitate.",
      url: "https://salariile.ro/cookies",
      inLanguage: "ro-RO",
      dateModified: "2026-08-14",
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
          Salariile.ro funcționează fără cookies pentru tracking, publicitate sau analiză comportamentală. Pagina explică ce există efectiv, de ce nu folosim consent banner și ce am aflat în cele 24 de ore în care am testat reclame.
        </Lead>
        <Eyebrow>ZERO COOKIES DE TRACKING · ZERO PUBLICITATE · ÎN VIGOARE: 14 AUGUST 2026</Eyebrow>
      </Hero>

      <div>
        <Section>
            <h2>Ce sunt cookies</h2>
            <p>
              Cookies sunt fișiere mici de text pe care un site le poate salva în browser-ul tău pentru a păstra informații între vizite (preferințe de afișare, autentificare, sesiuni de cumpărături etc.).
            </p>
            <p>
              Regulamentul ePrivacy și GDPR impun ca site-urile să ceară consimțământul utilizatorului <strong>înainte</strong> de a stoca sau citi informații pe dispozitivul lui în scopuri non-esențiale. Regula nu se limitează la cookies: se aplică la fel pentru <code>localStorage</code>, identificatori de dispozitiv sau amprentare (fingerprinting). Cookies strict necesare funcționării tehnice a site-ului nu necesită consimțământ.
            </p>
        </Section>

        <Section>
            <h2>Ce folosește salariile.ro</h2>
            <p>
              Pe scurt: <strong>niciun cookie pentru tracking sau publicitate</strong>.
            </p>
            <p>
              Decizia de design este deliberată: calculatorul de salariu nu are nevoie să te urmărească pentru a funcționa. Toate calculele se execută local în browser, nu există conturi de utilizator, nu există formulare care să necesite păstrarea stării între pagini.
            </p>
            <ul>
              <li>
                <strong>Cookies strict necesare</strong>: site-ul nu setează cookies funcționale de tipul „preferințe limbă” sau „mod întunecat”, pentru că aceste funcționalități nu există în versiunea curentă.
              </li>
              <li>
                <strong>Analiză</strong>: folosim Vercel Web Analytics și o instanță proprie de Umami, ambele <strong>cookieless</strong>. Nu setează cookies și nu identifică vizitatori individuali. Datele sunt agregate: număr de vizite, pagini populare, timp petrecut pe pagină.
              </li>
              <li>
                <strong>Publicitate</strong>: niciuna. Site-ul nu afișează reclame, nu folosește remarketing și nu integrează platforme publicitare.
              </li>
              <li>
                <strong>Rețele sociale</strong>: niciunul. Nu sunt integrate widget-uri Facebook, X sau alte rețele.
              </li>
            </ul>
        </Section>

        <Section>
            <h2>De ce nu există consent banner</h2>
            <p>
              Cele mai multe site-uri afișează un banner „Acceptă cookies” pentru că setează cookies care necesită consimțământ: Google Analytics, Facebook Pixel, programe de afiliere, rețele publicitare.
            </p>
            <p>
              Salariile.ro nu setează astfel de cookies, deci nu are obligația legală să ceară consimțământ. Nu e o portiță: pur și simplu nu există date pentru care să se ceară acordul.
            </p>
        </Section>

        <Section>
            <h2>Testul de publicitate din 13–14 august 2026</h2>
            <p>
              Timp de aproximativ 24 de ore, site-ul a avut integrat Google AdSense, cu banner de consimțământ. L-am scos. Păstrăm aici ce am măsurat, pentru că e o informație pe care rar o publică cineva și pentru că explică decizia.
            </p>
            <p>
              Cu scriptul AdSense activ și <strong>zero reclame afișate efectiv</strong>, măsurat pe propriii vizitatori:
            </p>
            <ul>
              <li>
                <strong>Un cookie</strong>: <code>FCCDCF</code>, setat de platforma de consimțământ a Google pentru a reține alegerea din banner.
              </li>
              <li>
                <strong>Cereri către Google</strong>: platforma de consimțământ, o cerere de reclamă către <code>pagead2.googlesyndication.com</code> și sistemul antifraudă de pe <code>adtrafficquality.google</code>.
              </li>
              <li>
                <strong>Date transmise</strong>: adresa IP, tipul și versiunea browserului, sistemul de operare, rezoluția ecranului, fusul orar, adresa paginii vizitate și numărul de intrări din istoricul tabului curent.
              </li>
              <li>
                <strong>Cost de performanță</strong>: timpul median de încărcare a crescut de la 760 ms la 884 ms, iar timpul median de răspuns la interacțiune de la 64 ms la 80 ms. Fără nicio reclamă afișată.
              </li>
            </ul>
            <p>
              Am considerat că nu merită: vizitatorii ar fi plătit cu date personale și cu un site mai lent, pentru un venit estimat sub 100 de lei pe lună. Contul AdSense rămâne aprobat și e posibil să reluăm testul în viitor — dacă o facem, această pagină va fi actualizată <em>înainte</em>, nu după.
            </p>
        </Section>

        <Section>
            <h2>Cum verifici singur</h2>
            <p>
              Nu trebuie să ne crezi pe cuvânt. Pe orice browser modern (Chrome, Firefox, Brave, Safari):
            </p>
            <ul>
              <li>Deschide salariile.ro</li>
              <li>Apasă F12 pentru a deschide instrumentele de dezvoltator</li>
              <li>Mergi la tab-ul „Application” (Chrome/Brave) sau „Storage” (Firefox)</li>
              <li>Verifică secțiunile „Cookies” și „Local storage” pentru salariile.ro</li>
              <li>În tab-ul „Network” vezi toate cererile făcute de pagină</li>
            </ul>
            <p>
              Dacă găsești ceva ce nu este descris aici, <Link href="/contact">scrie-ne</Link> — pagina se corectează, nu se apără.
            </p>
        </Section>

        <Section>
            <h2>Cum dezactivezi cookies (pentru orice site)</h2>
            <p>
              Chiar dacă pe salariile.ro nu sunt relevante, orice browser modern permite blocarea cookies global sau per site:
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
              Pentru detalii despre toate datele prelucrate (inclusiv logs de server, statistici anonime și temeiul juridic), vezi <Link href="/politica-confidentialitate">politica de confidențialitate</Link>.
            </p>
            <p className="source-note">Ultima actualizare: 14 august 2026. Între 13 și 14 august 2026 site-ul a afișat un banner de consimțământ și a avut integrat Google AdSense; ambele au fost eliminate.</p>
        </Section>
      </div>
    </>
  );
}
