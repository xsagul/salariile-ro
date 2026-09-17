// app/cookies/page.tsx
// Server Component. Politica cookies.
//
// Istoric, ca să nu se piardă contextul:
//   - până la 13 aug 2026: site fără publicitate, pagina afirma „zero cookies
//     de tracking, zero publicitate” și explica de ce nu există consent banner;
//   - 13 aug 2026: integrat Google AdSense, pagina rescrisă;
//   - 14 aug 2026: AdSense scos, pagina rescrisă din nou.
//
// Din 17 septembrie 2026: GA4 rulează numai după acord explicit. AdSense este
// conectat exclusiv prin meta tag + ads.txt, fără script și fără reclame.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Politica de cookies și analiză",
  description:
    "Cloudflare Analytics este cookieless, iar GA4 pornește doar după acord. AdSense este conectat fără reclame sau script publicitar.",
  alternates: { canonical: "https://salariile.ro/cookies" },
  openGraph: ogPage({
    title: "Politica de cookies și analiză",
    description:
      "GA4 se încarcă numai după acord explicit, iar AdSense nu afișează reclame.",
    path: "/cookies",
  }),
  twitter: twPage({
    title: "Politica de cookies și analiză",
    description:
      "GA4 se încarcă numai după acord explicit, iar AdSense nu afișează reclame.",
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
        "Cloudflare Analytics este cookieless, Google Analytics 4 este opțional, iar AdSense este conectat fără reclame și fără script publicitar.",
      url: "https://salariile.ro/cookies",
      inLanguage: "ro-RO",
      dateModified: PAGE_LAST_MODIFIED["/cookies"].toISOString().slice(0, 10),
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
          Cloudflare Web Analytics măsoară traficul fără cookies. Google Analytics 4 este opțional și nu se încarcă înainte să alegi „Da”. AdSense este conectat pentru verificarea proprietății, dar reclamele și scriptul publicitar sunt oprite.
        </Lead>
        <Eyebrow>GA4 DOAR CU ACORD · ZERO RECLAME · ÎN VIGOARE: 17 SEPTEMBRIE 2026</Eyebrow>
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
              Pe scurt: <strong>niciun cookie înainte să îți dai acordul și niciun cookie de publicitate</strong>.
            </p>
            <p>
              Decizia de design este deliberată: calculatorul de salariu nu are nevoie să te urmărească pentru a funcționa. Toate calculele se execută local în browser, nu există conturi de utilizator, nu există formulare care să necesite păstrarea stării între pagini.
            </p>
            <ul>
              <li>
                <strong>Cookies strict necesare</strong>: site-ul nu setează cookies funcționale de tipul „preferințe limbă” sau „mod întunecat”, pentru că aceste funcționalități nu există în versiunea curentă.
              </li>
              <li>
                <strong>Cloudflare Web Analytics</strong>: rulează cookieless, fără stocare locală sau amprentare. Datele sunt agregate: vizite, pagini populare și timpi de încărcare.
              </li>
              <li>
                <strong>Google Analytics 4</strong>: se încarcă numai după ce alegi „Da”. Poate seta cookies <code>_ga</code> și <code>_ga_2L1J64H5H9</code> pentru a distinge vizitele. Măsoară paginile accesate, sursa vizitei, tipul dispozitivului, regiunea aproximativă și interacțiuni standard precum scrollul, clickurile externe și descărcările. Semnalele și personalizarea publicitară sunt dezactivate explicit.
              </li>
              <li>
                <strong>Google AdSense</strong>: site-ul este verificat printr-un meta tag neexecutabil și prin <code>ads.txt</code>. Nu există script AdSense, unități de anunț sau Auto ads active, deci integrarea nu afișează reclame și nu trimite date despre vizitatori către rețeaua publicitară.
              </li>
              <li>
                <strong>Rețele sociale</strong>: niciunul. Nu sunt integrate widget-uri Facebook, X sau alte rețele.
              </li>
            </ul>
        </Section>

        <Section>
            <h2>Cum funcționează consimțământul</h2>
            <p>
              La prima vizită, bannerul are două opțiuni la fel de accesibile: „Da” și „Nu”. Până nu alegi „Da”, codul Google Analytics nu este descărcat și nu pleacă niciun ping către Google Analytics.
            </p>
            <p>
              Alegerea se păstrează șase luni în <code>localStorage</code>, strict pentru a nu te întreba la fiecare pagină. O poți schimba oricând din „Setări cookies” în subsol. La retragerea acordului, colectarea este oprită și cookies <code>_ga</code> sunt șterse. Site-ul funcționează integral indiferent de alegere.
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
            <p>
              Conectarea actuală prin meta tag și <code>ads.txt</code> nu repune acel script și nu repetă testul: este doar o dovadă de proprietate citită de crawlerul AdSense.
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
              <li>În tab-ul „Network”, înainte de acord, nu trebuie să existe cereri către Google Analytics sau AdSense</li>
            </ul>
            <p>
              Dacă găsești ceva ce nu este descris aici, <Link href="/contact">scrie-ne</Link> — pagina se corectează, nu se apără.
            </p>
        </Section>

        <Section>
            <h2>Cum dezactivezi cookies (pentru orice site)</h2>
            <p>
              Pe lângă opțiunea „Nu” din banner, orice browser modern permite blocarea cookies global sau per site:
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
            <p className="source-note">Ultima actualizare: 17 septembrie 2026 — GA4 reintrodus numai după acord; AdSense conectat fără script și fără reclame.</p>
        </Section>
      </div>
    </>
  );
}
