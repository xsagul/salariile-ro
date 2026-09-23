// app/politica-confidentialitate/page.tsx
// Server Component. Politică de confidențialitate conformă GDPR.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description:
    "Politica de confidențialitate salariile.ro: ce date colectăm, în ce scop, baza legală GDPR și drepturile vizitatorilor.",
  alternates: { canonical: "https://salariile.ro/politica-confidentialitate" },
  robots: { index: true, follow: true },
  openGraph: ogPage({
    title: "Politica de confidențialitate",
    description:
      "Ce date colectăm, în ce scop, baza legală GDPR și drepturile vizitatorilor salariile.ro.",
    path: "/politica-confidentialitate",
  }),
  twitter: twPage({
    title: "Politica de confidențialitate",
    description:
      "Ce date colectăm, în ce scop, baza legală GDPR și drepturile vizitatorilor salariile.ro.",
  }),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Politica de confidențialitate",
          item: "https://salariile.ro/politica-confidentialitate",
        },
      ],
    },
    {
      "@type": "WebPage",
      name: "Politica de confidențialitate salariile.ro",
      description:
        "Politica GDPR a salariile.ro: logs Cloudflare, analytics cookieless și Google Analytics 4 cu Consent Mode, baze legale și drepturile vizitatorilor.",
      url: "https://salariile.ro/politica-confidentialitate",
      inLanguage: "ro-RO",
      dateModified: PAGE_LAST_MODIFIED["/politica-confidentialitate"].toISOString().slice(0, 10),
      isPartOf: {
        "@type": "WebSite",
        name: "Salariile",
        url: "https://salariile.ro",
      },
    },
  ],
};

export default function PoliticaConfidentialitatePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Politica de confidențialitate" }]} />
        <H1>Politica de confidențialitate</H1>
        <Lead>
          Salariile.ro respectă Regulamentul UE 2016/679 privind protecția datelor cu caracter personal (GDPR) și Legea 190/2018. Această politică explică ce date prelucrăm, în ce scop și ce drepturi ai ca vizitator.
        </Lead>
        <Eyebrow>ÎN VIGOARE: 17 SEPTEMBRIE 2026 · CONSENT MODE · ZERO ANUNȚURI</Eyebrow>
      </Hero>

      <div>
        <Section>
            <h2>1. Operatorul de date</h2>
            <p>
              Acest site este întreținut individual ca proiect personal de către Știuriuc Sorin-Marian, persoană fizică din România. Pentru orice cerere privind datele tale personale, poți folosi adresa de email de pe pagina de <Link href="/contact">contact</Link>.
            </p>
            <p>
              Nu există companie, PFA sau SRL în spatele site-ului. Operatorul de date este persoana fizică ce întreține site-ul.
            </p>
        </Section>

        <Section>
            <h2>2. Ce date colectăm</h2>
            <p>
              Salariile.ro este conceput pentru a colecta cât mai puține date posibil. Concret:
            </p>
            <h3>Date colectate automat</h3>
            <ul>
              <li>
                <strong>Adresa IP, user agent, URL accesat, data și ora vizitei</strong>: prelucrate automat de infrastructura de hosting (Cloudflare) pentru fiecare cerere HTTP, ca pagina să fie livrată și protejată de abuz și atacuri automate. Site-ul nu păstrează jurnale proprii de acces; Cloudflare le prelucrează ca procesator, conform politicii sale.
              </li>
              <li>
                <strong>Statistici de vizitare anonime</strong>: prin Cloudflare Web Analytics se contorizează numărul de vizite, paginile cele mai accesate, țara de origine (la nivel general) și timpii de încărcare a paginilor. Nu se folosesc cookies sau stocare locală, vizitatorii nu sunt amprentați, iar datele sunt agregate și nu se transferă către terți.
              </li>
              <li>
                <strong>Google Analytics 4 cu Consent Mode</strong>: tagul folosește identificatorul <code>G-2L1J64H5H9</code>. Înainte de acord, stocarea este refuzată și pot fi trimise pinguri fără cookies; după acord, GA4 poate folosi cookies <code>_ga</code>. Se înregistrează paginile vizitate și pagina anterioară, sursa vizitei, tipul dispozitivului, rezoluția ecranului și dimensiunea ferestrei browserului, regiunea aproximativă; cât derulezi, ce secțiuni ajung în ecran, cât timp rămâne pagina vizibilă, ce întrebări deschizi și ce linkuri interne apeși; ce calculator folosești și tipul calculului (de exemplu brut în net), <strong>fără sumele introduse</strong>; termenul scris în căutarea de meserii; descărcările și linkurile copiate; timpii de încărcare și de răspuns ai paginii și erorile tehnice ale site-ului. Google Signals și personalizarea reclamelor sunt dezactivate.
              </li>
            </ul>
            <h3>Publicitate: niciuna</h3>
            <p>
              Site-ul nu afișează reclame. Scriptul Google AdSense este încărcat pentru a publica mesajul standard de consimțământ Google; Auto ads este oprit în cont și nu există unități de anunț. Testul din 13–14 august 2026 și efectele tehnice ale scriptului sunt documentate pe pagina <Link href="/cookies">cookies</Link>.
            </p>
            <p>
              Dacă afișarea reclamelor va fi activată, această pagină și pagina de cookies vor fi actualizate <strong>înainte</strong>, iar prelucrarea se va face conform alegerii din CMP.
            </p>
            <h3>Date pe care NU le colectăm</h3>
            <ul>
              <li>Nu există formulare de înregistrare, conturi de utilizator sau newsletter.</li>
              <li>Sumele pe care le introduci în calculatoare se procesează exclusiv în browser-ul tău. Nu sunt transmise sau stocate pe server și nu ajung nici în Google Analytics: adresa paginii se trimite fără parametrii <code>brut</code> și <code>net</code>, iar evenimentele de calcul spun doar ce calculator ai folosit.</li>
              <li>Nu folosim Facebook Pixel, remarketing, programe de afiliere sau profilare publicitară. GA4 respectă alegerea transmisă de CMP prin Consent Mode.</li>
              <li>Nu vindem și nu transferăm date către terți în scopuri comerciale.</li>
            </ul>
        </Section>

        <Section>
            <h2>3. Baza legală a prelucrării</h2>
            <p>
              Datele colectate automat (logs de server, statistici anonime) se prelucrează în temeiul <strong>interesului legitim</strong> al operatorului (Art. 6 alin. 1 lit. f din GDPR), adică asigurarea funcționării și securității site-ului. Interesul legitim este proporțional cu impactul minim asupra vizitatorilor, datele fiind agregate sau de scurtă durată.
            </p>
            <p>
              Datele Google Analytics 4 se prelucrează exclusiv în baza <strong>consimțământului</strong> (Art. 6 alin. 1 lit. a GDPR și regulile ePrivacy). Refuzul nu limitează nicio funcție, iar acordul poate fi retras oricând din „Setări cookies”.
            </p>
        </Section>

        <Section>
            <h2>4. Subprocesatori</h2>
            <p>
              Site-ul folosește următorii furnizori tehnici care procesează date pe server-ele lor:
            </p>
            <ul>
              <li>
                <strong>Google Ireland Limited</strong> (Irlanda, cu posibile transferuri către Google LLC în SUA): furnizor pentru CMP-ul AdSense și Google Analytics 4 cu Consent Mode. Google LLC este certificat în cadrul UE–SUA Data Privacy Framework. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Politica Google</a>.
              </li>
              <li>
                <strong>Cloudflare, Inc.</strong> (SUA): furnizor de hosting și CDN și al statisticilor anonime Web Analytics. Procesează automat, ca procesator, fiecare cerere către site. Cloudflare este certificat conform mecanismului UE-SUA Data Privacy Framework. <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Politica Cloudflare</a>.
              </li>
              <li>
                <strong>Google LLC</strong> (SUA) — <strong>Search Console</strong>: pentru verificarea proprietății domeniului și monitorizarea performanței în rezultatele căutării. Nu colectează date despre vizitatorii individuali, doar statistici agregate despre cum apare site-ul în rezultatele Google.
              </li>
            </ul>
            <p>
              Transferurile către SUA se realizează în temeiul mecanismului UE-SUA Data Privacy Framework, la care Google și Cloudflare sunt certificate. Lista se actualizează aici dacă apar modificări.
            </p>
        </Section>

        <Section>
            <h2>5. Durata stocării</h2>
            <ul>
              <li>Jurnale de acces: site-ul nu păstrează jurnale proprii; Cloudflare le prelucrează ca procesator, pe durata stabilită în politica sa de confidențialitate.</li>
              <li>Statistici Cloudflare Web Analytics: agregate, fără date de identificare a vizitatorilor, păstrate conform politicii Cloudflare.</li>
              <li>Date Google Analytics 4 asociate cu identificatori și evenimente: 14 luni, conform setării proprietății verificată la 17 septembrie 2026. Alegerea este păstrată de CMP-ul Google conform configurației mesajului.</li>
              <li>Date Google Search Console: agregate, păstrate conform politicii Google (16 luni pentru istoricul detaliat).</li>
            </ul>
        </Section>

        <Section>
            <h2>6. Cookies</h2>
            <p>
Salariile.ro nu afișează reclame. Cookies de analiză GA4 apar numai după acord, iar pagina dedicată <Link href="/cookies">cookies</Link> explică alegerea, retragerea și verificarea în browser.
            </p>
        </Section>

        <Section>
            <h2>7. Drepturile tale</h2>
            <p>
              Conform GDPR (Art. 12-22), ai următoarele drepturi cu privire la datele tale personale:
            </p>
            <ul>
              <li>Dreptul de acces, să afli ce date avem despre tine</li>
              <li>Dreptul la rectificare, să corectezi date inexacte</li>
              <li>Dreptul la ștergere („dreptul de a fi uitat”)</li>
              <li>Dreptul la restricționarea prelucrării</li>
              <li>Dreptul la portabilitatea datelor</li>
              <li>Dreptul de opoziție la prelucrare</li>
              <li>Dreptul de a nu fi supus unei decizii automate</li>
              <li>Dreptul de a depune plângere la autoritatea de supraveghere</li>
            </ul>
            <p>
              Pentru exercitarea acestor drepturi, contactează-mă la adresa de email de pe pagina de <Link href="/contact">contact</Link>. Răspund în maximum 30 de zile, conform termenului GDPR.
            </p>
            <p>
              Notă practică: pentru că nu colectăm date care să te identifice individual (doar logs anonime de scurtă durată și statistici agregate), în multe cazuri răspunsul la o cerere de acces va fi că nu există date personale identificabile asociate cu tine în sistemele noastre.
            </p>
        </Section>

        <Section>
            <h2>8. Autoritatea de supraveghere</h2>
            <p>
              Dacă consideri că drepturile tale GDPR au fost încălcate, poți depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP):
            </p>
            <ul>
              <li>Sediul: B-dul G-ral. Gheorghe Magheru 28-30, sector 1, București, cod poștal 010336</li>
              <li>Email: anspdcp@dataprotection.ro</li>
              <li>Website: <a href="https://www.dataprotection.ro" target="_blank" rel="noopener">www.dataprotection.ro</a></li>
            </ul>
        </Section>

        <Section>
            <h2>9. Modificări ale politicii</h2>
            <p>
              Această politică poate fi actualizată periodic, în special dacă se modifică stack-ul tehnic al site-ului sau apar cerințe legale noi. Versiunea curentă este menționată în antetul paginii cu data intrării în vigoare. Modificările semnificative vor fi anunțate vizibil pe homepage înainte de a intra în vigoare.
            </p>
            <p className="source-note">Ultima actualizare: 18 septembrie 2026 — GA4 măsoară folosirea paginilor și a calculatoarelor, fără sumele introduse; CMP-ul Google și Consent Mode rămân neschimbate.</p>
        </Section>
      </div>
    </>
  );
}
