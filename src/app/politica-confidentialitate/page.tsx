// app/politica-confidentialitate/page.tsx
// Server Component. Politică de confidențialitate conformă GDPR.

import type { Metadata } from "next";
import Link from "next/link";
import { ogPage, twPage } from "@/lib/seo";
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
        "Politica GDPR a salariile.ro: date colectate (logs server, analytics anonime Vercel), bază legală interes legitim, drepturile vizitatorilor, autoritate ANSPDCP.",
      url: "https://salariile.ro/politica-confidentialitate",
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
        <Eyebrow>ÎN VIGOARE: 13 AUGUST 2026 · ÎNTREȚINUT INDEPENDENT · PUBLICITATE DOAR CU CONSIMȚĂMÂNT</Eyebrow>
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
                <strong>Adresa IP, user agent, URL accesat, data și ora vizitei</strong>: colectate automat de către infrastructura de hosting (Vercel) pentru fiecare cerere HTTP. Folosite pentru securitate (detectare abuz, atacuri automate) și debugging. Păstrate maximum 30 de zile.
              </li>
              <li>
                <strong>Metrici de performanță anonime</strong>: prin Vercel Speed Insights se înregistrează indicatori tehnici (timp de încărcare, Core Web Vitals) pentru îmbunătățirea site-ului. Speed Insights este cookieless (folosește <code>sendBeacon</code> pentru transmisia anonimă a metricilor), datele sunt agregate și nu pot identifica un vizitator individual.
              </li>
              <li>
                <strong>Statistici de vizitare anonime</strong>: prin Vercel Web Analytics se contorizează numărul de vizite, paginile cele mai accesate și țara de origine (la nivel general). Nu se folosesc cookies pentru această analiză, datele sunt complet anonime și nu se transferă către terți.
              </li>
            </ul>
            <h3>Date prelucrate pentru publicitate, numai cu consimțământul tău</h3>
            <p>
              Din 13 august 2026, site-ul afișează reclame prin Google AdSense. Scriptul AdSense se încarcă <strong>numai după</strong> ce îți exprimi acordul în bannerul de consimțământ. Până atunci nu se transmite nimic către Google în scop publicitar.
            </p>
            <ul>
              <li>
                <strong>Stocare pe dispozitiv</strong>: un cookie, <code>FCCDCF</code>, setat de platforma de consimțământ a Google. Reține alegerea ta din banner ca să nu fii întrebat la fiecare pagină.
              </li>
              <li>
                <strong>Date transmise către Google</strong>: adresa IP, tipul și versiunea browserului, sistemul de operare, rezoluția ecranului, fusul orar, adresa paginii vizitate și numărul de intrări din istoricul tabului curent. Google le folosește pentru selecția reclamelor, măsurarea afișărilor și prevenirea fraudei publicitare.
              </li>
              <li>
                <strong>Reclame personalizate</strong>: dacă îți dai acordul, Google poate folosi aceste date pentru a-ți afișa reclame adaptate profilului tău. Dacă refuzi, vei vedea reclame necontextualizate sau nicio reclamă, iar site-ul funcționează identic.
              </li>
            </ul>
            <p>
              Aceste informații nu provin din documentația Google, ci dintr-o verificare proprie a integrării. Detalii și instrucțiuni de verificare independentă pe pagina <Link href="/cookies">cookies</Link>.
            </p>
            <h3>Date pe care NU le colectăm</h3>
            <ul>
              <li>Nu există formulare de înregistrare, conturi de utilizator sau newsletter.</li>
              <li>Sumele brut/net pe care le introduci în calculator se procesează exclusiv în browser-ul tău și nu sunt transmise sau stocate pe server. Nu ajung la Google și nu sunt folosite pentru selecția reclamelor.</li>
              <li>Nu folosim Google Analytics, Facebook Pixel sau programe de afiliere.</li>
              <li>Nu vindem date către terți.</li>
            </ul>
        </Section>

        <Section>
            <h2>3. Baza legală a prelucrării</h2>
            <p>
              Datele colectate automat (logs de server, statistici anonime) se prelucrează în temeiul <strong>interesului legitim</strong> al operatorului (Art. 6 alin. 1 lit. f din GDPR), adică asigurarea funcționării și securității site-ului. Interesul legitim este proporțional cu impactul minim asupra vizitatorilor, datele fiind agregate sau de scurtă durată.
            </p>
            <p>
              Datele prelucrate pentru publicitate se bazează exclusiv pe <strong>consimțământ</strong> (Art. 6 alin. 1 lit. a din GDPR), coroborat cu cerințele Directivei ePrivacy privind stocarea de informații pe echipamentul terminal. Consimțământul se colectează printr-o platformă certificată de Google, este liber exprimat și poate fi retras oricând, fără consecințe asupra funcționării site-ului.
            </p>
        </Section>

        <Section>
            <h2>4. Subprocesatori</h2>
            <p>
              Site-ul folosește următorii furnizori tehnici care procesează date pe server-ele lor:
            </p>
            <ul>
              <li>
                <strong>Vercel Inc.</strong> (SUA): furnizor de hosting și CDN. Procesează automat fiecare cerere către site. Vercel este certificat conform mecanismului UE-SUA Data Privacy Framework. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">Politica Vercel</a>.
              </li>
              <li>
                <strong>Google LLC</strong> (SUA) — <strong>Search Console</strong>: pentru verificarea proprietății domeniului și monitorizarea performanței în rezultatele căutării. Nu colectează date despre vizitatorii individuali, doar statistici agregate despre cum apare site-ul în rezultatele Google.
              </li>
              <li>
                <strong>Google Ireland Limited / Google LLC</strong> — <strong>AdSense</strong>: afișarea reclamelor, măsurarea afișărilor și prevenirea fraudei publicitare. Activ numai după consimțământ. Google acționează ca operator independent pentru datele publicitare, nu ca simplu împuternicit. <a href="https://business.safety.google/privacy/" target="_blank" rel="noopener">Politica Google pentru parteneri publicitari</a> · <a href="https://support.google.com/adsense/answer/13554116" target="_blank" rel="noopener">Cum folosește Google datele</a>.
              </li>
              <li>
                <strong>Umami (instanță proprie)</strong>: statistici de vizitare cookieless, găzduite pe infrastructura noastră. Datele nu părăsesc controlul nostru și nu se transferă către terți.
              </li>
            </ul>
            <p>
              Transferurile către SUA se realizează în temeiul mecanismului UE-SUA Data Privacy Framework, la care Google și Vercel sunt certificate. Nu folosim alți subprocesatori. Lista se actualizează aici dacă apar modificări.
            </p>
        </Section>

        <Section>
            <h2>5. Durata stocării</h2>
            <ul>
              <li>Logs de server: maximum 30 de zile, după care se șterg automat de către Vercel.</li>
              <li>Statistici Vercel Analytics: agregate, păstrate la nivel anonim conform politicii Vercel.</li>
              <li>Date Google Search Console: agregate, păstrate conform politicii Google (16 luni pentru istoricul detaliat).</li>
              <li>Date publicitare Google AdSense: păstrate conform politicilor Google de retenție a datelor publicitare. Nu avem control asupra duratei și nu deținem copii ale acestor date.</li>
              <li>Alegerea ta din bannerul de consimțământ: stocată în cookie-ul <code>FCCDCF</code> din browserul tău, până când o modifici sau ștergi datele site-ului.</li>
            </ul>
        </Section>

        <Section>
            <h2>6. Cookies</h2>
            <p>
              Măsurarea traficului rămâne cookieless. Publicitatea Google AdSense se încarcă numai cu consimțământ și setează cookie-ul <code>FCCDCF</code> pentru a reține alegerea ta. Pagina dedicată <Link href="/cookies">cookies</Link> descrie exact ce am măsurat și cum poți verifica singur, în browser.
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
            <p className="source-note">Ultima actualizare: 13 august 2026 — integrarea Google AdSense și consimțământul pentru publicitate. Versiunea anterioară, în vigoare între 11 mai și 13 august 2026, descria un site fără publicitate.</p>
        </Section>
      </div>
    </>
  );
}
