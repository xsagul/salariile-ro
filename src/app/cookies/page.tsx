// app/cookies/page.tsx
// Server Component. Politica cookies.
//
// Pagina a fost rescrisă pe 13 august 2026, când site-ul a integrat Google
// AdSense. Până atunci afirma „zero publicitate, zero cookies de tracking” și
// explica de ce nu există consent banner — afirmații care au încetat să fie
// adevărate în momentul în care scriptul AdSense a ajuns în producție.
//
// Cifrele din secțiunea „Ce am măsurat” nu sunt preluate din documentația
// Google, ci dintr-o măsurătoare proprie pe build-ul de producție. Dacă se
// schimbă integrarea, se remăsoară înainte de a modifica textul.

import type { Metadata } from "next";
import Link from "next/link";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Politica de cookies",
  description:
    "Ce stochează salariile.ro în browserul tău: nimic pentru analiză, iar pentru publicitate doar după consimțământul tău explicit. Măsurat, nu declarat.",
  alternates: { canonical: "https://salariile.ro/cookies" },
  openGraph: ogPage({
    title: "Politica de cookies",
    description:
      "Analiza rămâne cookieless. Publicitatea (Google AdSense) rulează doar cu consimțământ.",
    path: "/cookies",
  }),
  twitter: twPage({
    title: "Politica de cookies",
    description:
      "Analiza rămâne cookieless. Publicitatea (Google AdSense) rulează doar cu consimțământ.",
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
        "Analiza de trafic rămâne cookieless. Publicitatea Google AdSense se încarcă numai după consimțământ explicit.",
      url: "https://salariile.ro/cookies",
      inLanguage: "ro-RO",
      dateModified: "2026-08-13",
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
          Măsurarea traficului rămâne cookieless, ca până acum. Ce s-a schimbat este că site-ul afișează reclame Google AdSense — iar acelea nu se încarcă până nu îți dai acordul. Pagina explică exact ce se stochează, ce se trimite și cum îți retragi consimțământul.
        </Lead>
        <Eyebrow>ANALIZĂ FĂRĂ COOKIES · PUBLICITATE DOAR CU CONSIMȚĂMÂNT · ÎN VIGOARE: 13 AUGUST 2026</Eyebrow>
      </Hero>

      <div>
        <Section>
            <h2>Ce s-a schimbat în august 2026</h2>
            <p>
              Până în august 2026, salariile.ro nu afișa nicio reclamă, iar această pagină explica de ce nu era nevoie de un banner de consimțământ. Din 13 august 2026, site-ul este înscris în Google AdSense.
            </p>
            <p>
              Nu ascundem schimbarea și nu o îmbrăcăm în limbaj juridic: site-ul a trecut de la „nu avem ce să te întrebăm” la „trebuie să te întrebăm”. Restul paginii spune exact ce se întâmplă cu datele tale, verificat de noi, nu copiat din documentația Google.
            </p>
        </Section>

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
            <h2>Ce folosește salariile.ro, pe categorii</h2>
            <ul>
              <li>
                <strong>Cookies strict necesare</strong>: site-ul nu setează cookies funcționale de tipul „preferințe limbă” sau „mod întunecat”, pentru că aceste funcționalități nu există în versiunea curentă. Dacă vor fi adăugate, această pagină va fi actualizată.
              </li>
              <li>
                <strong>Analiză</strong>: folosim Vercel Web Analytics și o instanță proprie de Umami, ambele <strong>cookieless</strong>. Nu setează cookies, nu identifică vizitatori individuali și nu au fost afectate de trecerea la AdSense. Datele sunt agregate: număr de vizite, pagini populare, timp petrecut pe pagină.
              </li>
              <li>
                <strong>Publicitate</strong>: Google AdSense. Se încarcă <strong>numai după ce îți dai consimțământul</strong> prin bannerul afișat la prima vizită. Dacă refuzi, scriptul nu rulează.
              </li>
              <li>
                <strong>Rețele sociale</strong>: niciunul. Nu sunt integrate widget-uri Facebook, X sau alte rețele.
              </li>
            </ul>
        </Section>

        <Section>
            <h2>Ce am măsurat efectiv la AdSense</h2>
            <p>
              Înainte de a publica această pagină am pornit site-ul cu scriptul AdSense activ și am verificat direct ce face, în loc să ne bazăm pe descrieri generale. Rezultatul, pe o pagină fără nicio unitate de reclamă afișată:
            </p>
            <ul>
              <li><strong>Cookies setate: niciunul.</strong> Scriptul AdSense nu a setat cookies în acest test.</li>
              <li><strong>Stocare locală</strong>: o singură cheie, <code>google_auto_fc_cmp_setting</code>, folosită pentru a reține ce ai ales în bannerul de consimțământ.</li>
              <li><strong>Cereri către Google</strong>: o cerere de reclamă către <code>pagead2.googlesyndication.com</code> și încărcarea sistemului antifraudă de pe <code>adtrafficquality.google</code>.</li>
              <li>
                <strong>Date trimise în acea cerere</strong>: tipul și versiunea browserului, sistemul de operare, rezoluția ecranului, fusul orar, adresa paginii vizitate și numărul de intrări din istoricul tabului curent. Adresa ta IP ajunge la Google, ca la orice resursă încărcată de pe serverele lor.
              </li>
            </ul>
            <p>
              Concluzia onestă: chiar dacă nu se setează cookies, se stochează informații pe dispozitivul tău și se transmit date care pot contribui la identificarea browserului tău. De aceea AdSense se încarcă numai cu consimțământ, nu „pentru că oricum nu sunt cookies”.
            </p>
        </Section>

        <Section>
            <h2>Bannerul de consimțământ</h2>
            <p>
              La prima vizită din Spațiul Economic European, Regatul Unit sau Elveția vezi un banner care îți cere acordul pentru publicitate. Este platforma de consimțământ certificată de Google, obligatorie contractual pentru orice site care afișează AdSense.
            </p>
            <p>
              Bannerul are două butoane: <strong>„Consimt”</strong> și <strong>„Gestionează opțiunile”</strong>. Nu există un buton de refuz direct în primul ecran — ca să refuzi, intri în „Gestionează opțiunile” și dezactivezi scopurile de acolo. Preferăm să scriem asta explicit decât să lăsăm impresia că refuzul e la fel de rapid ca acceptul: nu este.
            </p>
            <p>
              Refuzul rămâne însă complet posibil și fără costuri pentru tine. Dacă refuzi, vei vedea reclame necontextualizate sau nicio reclamă, iar calculatorul funcționează identic — nicio funcție a site-ului nu depinde de acceptul tău și nu îți restricționăm accesul.
            </p>
            <p>
              Îți poți schimba oricând alegerea din linkul de gestionare a consimțământului afișat de banner. Ștergerea datelor site-ului din browser resetează de asemenea alegerea, iar bannerul va apărea din nou.
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
              <li>În tab-ul „Network” vezi toate cererile făcute de pagină, inclusiv cele către Google</li>
            </ul>
            <p>
              Dacă găsești ceva ce nu este descris aici, <Link href="/contact">scrie-ne</Link> — pagina se corectează, nu se apără.
            </p>
        </Section>

        <Section>
            <h2>Cum blochezi cookies și reclame</h2>
            <p>
              Orice browser modern permite blocarea cookies global sau per site:
            </p>
            <ul>
              <li><strong>Chrome / Brave / Edge:</strong> Setări → Confidențialitate și securitate → Cookies și alte date ale site-ului</li>
              <li><strong>Firefox:</strong> Setări → Confidențialitate și securitate → Cookies și date ale site-ului</li>
              <li><strong>Safari:</strong> Preferințe → Confidențialitate</li>
            </ul>
            <p>
              Poți folosi și o extensie de blocare a reclamelor. Nu o vom detecta și nu îți vom restricționa accesul din acest motiv.
            </p>
        </Section>

        <Section>
            <h2>Informații suplimentare</h2>
            <p>
              Pentru detalii despre toate datele prelucrate (inclusiv logs de server, statistici anonime și temeiul juridic), vezi <Link href="/politica-confidentialitate">politica de confidențialitate</Link>.
            </p>
            <p className="source-note">Ultima actualizare: 13 august 2026. Versiunea anterioară, în vigoare între 11 mai și 13 august 2026, descria un site fără publicitate.</p>
        </Section>
      </div>
    </>
  );
}
