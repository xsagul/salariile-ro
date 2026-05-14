// app/politica-confidentialitate/page.tsx
// Server Component. Politică de confidențialitate conformă GDPR.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description:
    "Politica de confidențialitate salariile.ro: ce date colectăm, în ce scop, baza legală GDPR și drepturile vizitatorilor.",
  alternates: { canonical: "https://salariile.ro/politica-confidentialitate" },
  robots: { index: true, follow: true },
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
      dateModified: "2026-05-11",
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

      <section className="hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Politica de confidențialitate</span>
          </nav>
          <h1>Politica de confidențialitate</h1>
          <p className="subtitle">
            Salariile.ro respectă Regulamentul UE 2016/679 privind protecția datelor cu caracter personal (GDPR) și Legea 190/2018. Această politică explică ce date prelucrăm, în ce scop și ce drepturi ai ca vizitator.
          </p>
          <p className="skeleton-hint">
            ÎN VIGOARE: 11 MAI 2026 · ÎNTREȚINUT INDEPENDENT · ZERO ANUNȚURI
          </p>
        </div>
      </section>

      <main>
        <section className="article-section">
          <div className="container">
            <h2>1. Operatorul de date</h2>
            <p>
              Acest site este întreținut individual ca proiect personal de către Știuriuc Sorin-Marian, persoană fizică din România. Pentru orice cerere privind datele tale personale, poți folosi adresa de email de pe pagina de <Link href="/contact">contact</Link>.
            </p>
            <p>
              Nu există companie, PFA sau SRL în spatele site-ului. Operatorul de date este persoana fizică ce întreține site-ul.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>2. Ce date colectăm</h2>
            <p>
              Salariile.ro este conceput pentru a colecta cât mai puține date posibil. Concret:
            </p>
            <h3>Date colectate automat</h3>
            <ul className="article-list">
              <li>
                <strong>Adresa IP, user agent, URL accesat, data și ora vizitei</strong> — colectate automat de către infrastructura de hosting (Vercel) pentru fiecare cerere HTTP. Folosite pentru securitate (detectare abuz, atacuri automate) și debugging. Păstrate maximum 30 de zile.
              </li>
              <li>
                <strong>Metrici de performanță anonime</strong> — prin Vercel Speed Insights se înregistrează indicatori tehnici (timp de încărcare, Core Web Vitals) pentru îmbunătățirea site-ului. Speed Insights este cookieless (folosește <code>sendBeacon</code> pentru transmisia anonimă a metricilor), datele sunt agregate și nu pot identifica un vizitator individual.
              </li>
              <li>
                <strong>Statistici de vizitare anonime</strong> — prin Vercel Web Analytics se contorizează numărul de vizite, paginile cele mai accesate și țara de origine (la nivel general). Nu se folosesc cookies pentru această analiză, datele sunt complet anonime și nu se transferă către terți.
              </li>
            </ul>
            <h3>Date pe care NU le colectăm</h3>
            <ul className="article-list">
              <li>Nu există formulare de înregistrare, conturi de utilizator sau newsletter.</li>
              <li>Sumele brut/net pe care le introduci în calculator se procesează exclusiv în browser-ul tău și nu sunt transmise sau stocate pe server.</li>
              <li>Nu folosim Google Analytics, Facebook Pixel, programe de afiliere sau alte instrumente de tracking comportamental.</li>
              <li>Nu vindem și nu transferăm date către terți în scopuri comerciale.</li>
            </ul>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>3. Baza legală a prelucrării</h2>
            <p>
              Datele colectate automat (logs de server, statistici anonime) se prelucrează în temeiul interesului legitim al operatorului (Art. 6 alin. 1 lit. f din GDPR) — asigurarea funcționării și securității site-ului. Interesul legitim este proporțional cu impactul minim asupra vizitatorilor, datele fiind agregate sau de scurtă durată.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>4. Subprocesatori</h2>
            <p>
              Site-ul folosește următorii furnizori tehnici care procesează date pe server-ele lor:
            </p>
            <ul className="article-list">
              <li>
                <strong>Vercel Inc.</strong> (SUA) — furnizor de hosting și CDN. Procesează automat fiecare cerere către site. Vercel este certificat conform mecanismului UE-SUA Data Privacy Framework. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">Politica Vercel</a>.
              </li>
              <li>
                <strong>Google LLC</strong> (SUA) — exclusiv prin Google Search Console pentru verificarea proprietății domeniului și monitorizarea performanței în rezultatele căutării. Search Console nu colectează date despre vizitatorii individuali — doar statistici agregate despre cum apare site-ul în rezultatele Google.
              </li>
            </ul>
            <p>
              Nu folosim alți subprocesatori. Lista se actualizează aici dacă apar modificări.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>5. Durata stocării</h2>
            <ul className="article-list">
              <li>Logs de server: maximum 30 de zile, după care se șterg automat de către Vercel.</li>
              <li>Statistici Vercel Analytics: agregate, păstrate la nivel anonim conform politicii Vercel.</li>
              <li>Date Google Search Console: agregate, păstrate conform politicii Google (16 luni pentru istoricul detaliat).</li>
            </ul>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>6. Cookies</h2>
            <p>
              Salariile.ro nu folosește cookies pentru tracking. Pentru detalii despre cookies tehnice strict necesare, vezi pagina dedicată <Link href="/cookies">cookies</Link>.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>7. Drepturile tale</h2>
            <p>
              Conform GDPR (Art. 12-22), ai următoarele drepturi cu privire la datele tale personale:
            </p>
            <ul className="article-list">
              <li>Dreptul de acces — să afli ce date avem despre tine</li>
              <li>Dreptul la rectificare — să corectezi date inexacte</li>
              <li>Dreptul la ștergere („dreptul de a fi uitat")</li>
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
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>8. Autoritatea de supraveghere</h2>
            <p>
              Dacă consideri că drepturile tale GDPR au fost încălcate, poți depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP):
            </p>
            <ul className="article-list">
              <li>Sediul: B-dul G-ral. Gheorghe Magheru 28-30, sector 1, București, cod poștal 010336</li>
              <li>Email: anspdcp@dataprotection.ro</li>
              <li>Website: <a href="https://www.dataprotection.ro" target="_blank" rel="noopener">www.dataprotection.ro</a></li>
            </ul>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>9. Modificări ale politicii</h2>
            <p>
              Această politică poate fi actualizată periodic, în special dacă se modifică stack-ul tehnic al site-ului sau apar cerințe legale noi. Versiunea curentă este menționată în antetul paginii cu data intrării în vigoare. Modificările semnificative vor fi anunțate vizibil pe homepage înainte de a intra în vigoare.
            </p>
            <p className="source-note">Ultima actualizare: 11 mai 2026.</p>
          </div>
        </section>
      </main>
    </>
  );
}
