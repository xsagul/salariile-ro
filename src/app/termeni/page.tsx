// app/termeni/page.tsx
// Server Component. Termeni și condiții de utilizare.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termeni și condiții de utilizare",
  description:
    "Termenii și condițiile de utilizare a site-ului salariile.ro: caracter informativ, limitări de răspundere, drepturi de autor.",
  alternates: { canonical: "https://salariile.ro/termeni" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Termeni și condiții", item: "https://salariile.ro/termeni" },
      ],
    },
    {
      "@type": "WebPage",
      name: "Termeni și condiții salariile.ro",
      description:
        "Termenii de utilizare a salariile.ro: caracter informativ al conținutului, limitări de răspundere, drepturi de autor, soluționare litigii.",
      url: "https://salariile.ro/termeni",
      inLanguage: "ro-RO",
      lastReviewed: "2026-05-11",
      reviewedBy: {
        "@type": "Person",
        name: "Știuriuc Sorin-Marian",
      },
      isPartOf: {
        "@type": "WebSite",
        name: "Salariile.ro",
        url: "https://salariile.ro",
      },
      specialty: "Terms of Service",
    },
  ],
};

export default function TermeniPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Termeni și condiții</span>
          </nav>
          <h1>Termeni și condiții de utilizare</h1>
          <p className="subtitle">
            Prin accesarea și utilizarea salariile.ro accepți termenii de mai jos. Te rugăm să citești această pagină înainte de a folosi calculatorul sau informațiile publicate.
          </p>
          <p className="skeleton-hint">
            ÎN VIGOARE: 11 MAI 2026
          </p>
        </div>
      </section>

      <main>
        <section className="article-section">
          <div className="container">
            <h2>1. Acceptarea termenilor</h2>
            <p>
              Salariile.ro este un site web public, accesibil oricui. Prin vizitarea și utilizarea oricărei pagini, accepți implicit termenii descriși mai jos. Dacă nu ești de acord cu acești termeni, te rugăm să nu folosești site-ul.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>2. Caracterul informativ al conținutului</h2>
            <p>
              Toate informațiile, calculele și articolele publicate pe salariile.ro au <strong>caracter strict informativ</strong>. Nu constituie consultanță fiscală, juridică, financiară sau de altă natură profesională.
            </p>
            <p>
              Site-ul este întreținut individual ca proiect personal — nu de către un contabil autorizat, expert fiscal sau jurist. Detalii despre cine întreține site-ul găsești pe pagina <Link href="/despre">Despre</Link>, iar metodologia de calcul este documentată pe pagina <Link href="/metodologie">Metodologie</Link>.
            </p>
            <p>
              Pentru situații fiscale individuale complexe (cumul de venituri, scutiri speciale, beneficii nesalariale ample, contracte cu clauze atipice, situații PFA, micro-întreprinderi, dividende etc.) recomand consultarea unui specialist autorizat — contabil, expert contabil sau consultant fiscal.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>3. Acuratețea informațiilor</h2>
            <p>
              Depun efortul rezonabil pentru ca toate informațiile publicate să fie corecte și actualizate conform legislației în vigoare. Sursele folosite sunt acte normative oficiale publicate în Monitorul Oficial, iar fiecare cifră afișată este însoțită, acolo unde este relevant, de referința legală exactă.
            </p>
            <p>
              Cu toate acestea, <strong>nu garantez că informațiile sunt complete, exacte sau actualizate în orice moment</strong>. Legislația fiscală română se modifică frecvent, uneori prin ordonanțe de urgență cu efect imediat, și pot exista perioade scurte (de regulă câteva zile) între o modificare oficială și actualizarea conținutului site-ului.
            </p>
            <p>
              Dacă observi o eroare sau o informație neactualizată, poți semnala asta prin pagina de <Link href="/contact">contact</Link>. Erorile concrete (cifre greșite, articole citate inexact) sunt prioritate maximă și se corectează rapid.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>4. Limitarea răspunderii</h2>
            <p>
              Operatorul site-ului nu este responsabil pentru decizii financiare, fiscale sau de altă natură luate de utilizator pe baza informațiilor obținute de pe salariile.ro. Utilizatorul este singurul responsabil pentru verificarea independentă a informațiilor înainte de a le folosi în orice scop oficial (negocieri salariale, declarații fiscale, planificare financiară etc.).
            </p>
            <p>
              În măsura permisă de legislația aplicabilă, nu se asumă răspunderea pentru:
            </p>
            <ul className="article-list">
              <li>Erori de calcul rezultate din diferențe între cazul standard și situații individuale</li>
              <li>Daune directe sau indirecte rezultate din utilizarea informațiilor publicate</li>
              <li>Indisponibilitatea temporară a site-ului din motive tehnice</li>
              <li>Modificări ale informațiilor publicate fără notificare prealabilă</li>
            </ul>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>5. Drepturi de autor</h2>
            <p>
              Conținutul editorial al site-ului (textele explicative, structura informațiilor, designul, codul sursă) este proprietatea operatorului și este protejat de Legea 8/1996 privind dreptul de autor.
            </p>
            <p>
              Utilizarea informațiilor publicate este permisă gratuit pentru uz personal (calcul propriu, informare, planificare individuală). Republicarea integrală a articolelor sau preluarea structurii editoriale fără permisiune nu este permisă. Pentru cereri de utilizare extinsă (citare în publicații, integrare educațională, reproducere în alte medii), scrie la adresa de pe pagina de <Link href="/contact">contact</Link>.
            </p>
            <p>
              Cifrele și valorile fiscale (salariu minim, cote contribuții etc.) provin din acte normative publice și pot fi reutilizate liber, cu mențiunea sursei legale (HG, OUG, articol Cod Fiscal etc.) — nu este necesară citarea salariile.ro pentru aceste informații publice.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>6. Linkuri către alte site-uri</h2>
            <p>
              Site-ul include linkuri către surse oficiale (Monitorul Oficial, ANAF, MMUNCII, INS) și ocazional către alte resurse externe relevante. Operatorul nu este responsabil pentru conținutul, disponibilitatea sau practicile de confidențialitate ale acestor site-uri externe.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>7. Date personale</h2>
            <p>
              Prelucrarea datelor personale este descrisă separat în <Link href="/politica-confidentialitate">politica de confidențialitate</Link>. Pe scurt: site-ul nu colectează date care să te identifice individual, nu folosește cookies pentru tracking și nu transferă date către terți în scopuri comerciale.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>8. Modificări ale termenilor</h2>
            <p>
              Acești termeni pot fi modificați periodic. Modificările semnificative vor fi marcate vizibil pe homepage înainte de a intra în vigoare. Continuarea utilizării site-ului după publicarea unei versiuni noi reprezintă acceptarea acesteia. Versiunea în vigoare este menționată în antetul paginii cu data corespunzătoare.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>9. Legislația aplicabilă și soluționarea litigiilor</h2>
            <p>
              Acești termeni sunt guvernați de legislația din România. Orice litigiu legat de utilizarea site-ului va fi soluționat conform procedurilor de drept român, în fața instanțelor competente teritorial conform regulilor din Codul de procedură civilă.
            </p>
            <p>
              Pentru reclamații prealabile, recomand contactul direct la adresa de pe pagina de <Link href="/contact">contact</Link>. Răspund la toate reclamațiile rezonabile în maximum 30 de zile.
            </p>
            <p className="source-note">Ultima actualizare: 11 mai 2026.</p>
          </div>
        </section>
      </main>
    </>
  );
}
