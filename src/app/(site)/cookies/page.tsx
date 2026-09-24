// app/cookies/page.tsx
// Server Component. Politica cookies.
//
// Istoric, ca să nu se piardă contextul:
//   - până la 13 aug 2026: site fără publicitate, pagina afirma „zero cookies
//     de tracking, zero publicitate” și explica de ce nu există consent banner;
//   - 13 aug 2026: integrat Google AdSense, pagina rescrisă;
//   - 14 aug 2026: AdSense scos, pagina rescrisă din nou.
//
// Din 17 septembrie 2026: CMP-ul Google din AdSense gestionează acordul pentru
// GA4 prin Consent Mode. Scriptul AdSense este prezent, dar reclamele sunt OFF.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow, PaginaCuCuprins } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Politica de cookies și analiză",
  description:
    "Cloudflare Analytics este cookieless, iar GA4 respectă alegerea din CMP-ul Google. AdSense nu afișează reclame.",
  alternates: { canonical: "https://salariile.ro/cookies" },
  openGraph: ogPage({
    title: "Politica de cookies și analiză",
    description:
      "GA4 folosește Consent Mode, iar AdSense nu afișează reclame.",
    path: "/cookies",
  }),
  twitter: twPage({
    title: "Politica de cookies și analiză",
    description:
      "GA4 folosește Consent Mode, iar AdSense nu afișează reclame.",
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
        "Cloudflare Analytics este cookieless, Google Analytics 4 respectă consimțământul, iar AdSense este conectat fără reclame.",
      url: "https://salariile.ro/cookies",
      inLanguage: "ro-RO",
      dateModified: PAGE_LAST_MODIFIED["/cookies"].toISOString().slice(0, 10),
      isPartOf: {
        "@type": "WebSite",
        name: "Salariile",
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
          Cloudflare Web Analytics măsoară traficul fără cookies. Google Analytics 4 respectă alegerea din bannerul Google, iar stocarea este blocată înainte de acord. AdSense încarcă bannerul, dar reclamele sunt oprite.
        </Lead>
        <Eyebrow>CONSENT MODE · ZERO RECLAME · ÎN VIGOARE: 17 SEPTEMBRIE 2026</Eyebrow>
      </Hero>

      <PaginaCuCuprins cta={null}>
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
              Pe scurt: <strong>niciun cookie Google de analiză sau publicitate înainte să îți dai acordul și nicio reclamă afișată</strong>.
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
                <strong>Google Analytics 4</strong>: tagul se încarcă în modul avansat Consent Mode cu stocarea refuzată implicit. Înainte de acord poate trimite pinguri fără cookies, care nu conțin un identificator persistent; după acord poate seta cookies <code>_ga</code> și <code>_ga_2L1J64H5H9</code>. Măsoară paginile accesate, sursa vizitei, tipul dispozitivului, dimensiunea ecranului și a ferestrei, regiunea aproximativă, cât derulezi și ce secțiuni vezi, timpul petrecut pe pagină, clickurile pe linkuri, descărcările, folosirea calculatoarelor (fără sumele introduse), căutările în lista de meserii, viteza paginii și erorile tehnice. Google Signals și personalizarea publicitară sunt dezactivate.
              </li>
              <li>
                <strong>Google AdSense</strong>: scriptul său publică platforma de consimțământ Google (CMP). Auto ads este oprit și nu există unități de anunț, deci nu se afișează reclame. Scriptul poate face cereri tehnice către Google pentru banner, verificare și protecție antifraudă.
              </li>
              <li>
                <strong>Rețele sociale</strong>: niciunul. Nu sunt integrate widget-uri Facebook, X sau alte rețele.
              </li>
            </ul>
        </Section>

        <Section>
            <h2>Cum funcționează consimțământul</h2>
            <p>
              Pentru vizitatorii din Spațiul Economic European, Regatul Unit și Elveția, mesajul standard Google publicat din AdSense cere acordul și oferă administrarea opțiunilor. Până la alegere, Consent Mode păstrează stocarea pentru analiză și publicitate pe <code>denied</code>.
            </p>
            <p>
              Google păstrează alegerea în înregistrarea CMP, inclusiv prin cookie-ul <code>FCCDCF</code>. O poți schimba oricând din „Setări cookies” în subsol; acțiunea redeschide mesajul Google și permite retragerea acordului. Site-ul funcționează integral indiferent de alegere.
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
              Am considerat că reclamele nu merită: vizitatorii ar fi plătit cu date personale și cu un site mai lent, pentru un venit estimat sub 100 de lei pe lună. Contul AdSense rămâne aprobat, dar în configurația actuală scriptul este folosit pentru CMP, cu Auto ads oprit și fără unități de anunț.
            </p>
            <p>
              Integrarea actuală repune costul tehnic al scriptului și al CMP-ului, dar nu componenta vizibilă de publicitate. Meta tag-ul și <code>ads.txt</code> rămân și ele prezente pentru verificarea contului.
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
              <li>În tab-ul „Network”, înainte de acord pot exista cereri Consent Mode și AdSense, dar în „Application” nu trebuie să apară cookies <code>_ga</code></li>
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
            <p className="source-note">Ultima actualizare: 18 septembrie 2026 — GA4 măsoară folosirea paginilor și a calculatoarelor, fără sumele introduse; bannerul standard Google și Consent Mode rămân neschimbate; AdSense este fără reclame.</p>
        </Section>
      </PaginaCuCuprins>
    </>
  );
}
