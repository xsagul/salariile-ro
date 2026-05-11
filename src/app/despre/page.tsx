// app/despre/page.tsx
// Server Component. Pagina "Despre" pentru E-E-A-T — transparența autorului.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Despre proiect: cine întreține salariile.ro",
  description:
    "Salariile.ro e un proiect independent de transparență fiscală pentru România. Aici găsești cine îl întreține, de ce a apărut și cum se mențin calculele actualizate.",
  alternates: { canonical: "https://salariile.ro/despre" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Despre", item: "https://salariile.ro/despre" },
      ],
    },
    {
      "@type": "AboutPage",
      name: "Despre salariile.ro",
      description:
        "Pagina Despre a salariile.ro: cine întreține proiectul, motivația, metodologia de menținere a acurateței.",
      url: "https://salariile.ro/despre",
      inLanguage: "ro-RO",
      mainEntity: {
        "@type": "Person",
        name: "Știuriuc Sorin-Marian",
        jobTitle: "Dezvoltator front-end",
        description:
          "Întreține salariile.ro ca proiect personal independent de transparență fiscală pentru România.",
      },
      isPartOf: {
        "@type": "WebSite",
        name: "Salariile.ro",
        url: "https://salariile.ro",
      },
    },
  ],
};

export default function DesprePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Despre</span>
          </nav>
          <h1>Despre acest proiect</h1>
          <p className="subtitle">
            Salariile.ro e un proiect independent de transparență fiscală pentru România, întreținut individual. Aici găsești cine îl menține și pe ce surse se bazează fiecare calcul.
          </p>
          <p className="skeleton-hint">
            PROIECT INDEPENDENT · LANSAT APRILIE 2026 · FĂRĂ PUBLICITATE
          </p>
        </div>
      </section>

      <main>
        <section className="article-section">
          <div className="container">
            <h2>Cine întreține site-ul</h2>
            <p>
              Mă numesc Știuriuc Sorin-Marian și sunt dezvoltator front-end. Construiesc și mențin singur salariile.ro ca proiect personal — nu există echipă, agenție sau firmă în spate.
            </p>
            <p>
              Nu sunt contabil sau consultant fiscal. Sunt programator care a citit Codul Fiscal și a implementat formulele publice de calcul al salariului net. Diferența contează — informațiile de pe acest site sunt acurate fiscal pentru cazul standard, dar pentru situații individuale complexe (sporuri specifice, beneficii nesalariale, scutiri sectoriale, contracte cu clauze speciale) calculatorul nu poate înlocui un contabil sau un expert fiscal.
            </p>
            <p>
              Acest lucru este declarat deschis pe pagina de <Link href="/termeni">termeni</Link>, iar pagina de <Link href="/metodologie">metodologie</Link> documentează exact ce formulă folosește calculatorul și ce nu acoperă.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>De ce a apărut site-ul</h2>
            <p>
              În aprilie 2026, când am început să urmăresc mai atent calculul propriului meu venit, am descoperit că majoritatea calculatoarelor de salariu online din România erau fie depășite legislativ, fie afișau cifre fără să precizeze pe ce act normativ se bazează.
            </p>
            <p>
              Un utilizator care vrea să verifice corectitudinea unui calcul trebuie să poată ajunge la sursa oficială — actul normativ, articolul exact, data intrării în vigoare. Asta lipsea practic peste tot. Am construit salariile.ro ca răspuns la această problemă: fiecare cifră afișată trebuie să fie trasabilă până la o sursă oficială din Monitorul Oficial.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Cum se mențin calculele actualizate</h2>
            <p>
              Legislația fiscală română se modifică frecvent — uneori prin ordonanțe de urgență publicate cu efect imediat. Pentru ca site-ul să rămână relevant, monitorizez lunar:
            </p>
            <ul className="article-list">
              <li>Monitorul Oficial (versiunea online a publicației legislative.just.ro)</li>
              <li>Comunicările Ministerului Finanțelor și ANAF</li>
              <li>Comunicările Ministerului Muncii pentru actele normative ce privesc salariul minim</li>
              <li>Publicațiile Institutului Național de Statistică pentru date macroeconomice</li>
            </ul>
            <p>
              La fiecare modificare semnificativă (de exemplu introducerea OUG 89/2025, publicarea HG 146/2026, intrarea în vigoare a Legii 44/2026 pentru salariul mediu) actualizez atât formulele calculatorului, cât și paginile editoriale aferente, și marchez în mod vizibil data ultimei actualizări.
            </p>
            <p>
              Calculatorul în sine este sincronizat cu structura Declarației 112 ANAF — declarația lunară pe care orice angajator o transmite. Sumele calculate pentru CAS, CASS, impozit și CAM corespund cu ce ar transmite efectiv angajatorul către ANAF pentru un brut standard.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Cum este finanțat proiectul</h2>
            <p>
              Salariile.ro nu afișează reclame, nu folosește programe de afiliere și nu vinde date despre utilizatori. Singurele costuri sunt domeniul anual și hostingul (Vercel, plan gratuit pentru proiecte mici), pe care le acopăr personal.
            </p>
            <p>
              Pentru transparență totală: site-ul nu colectează date personale despre vizitatori dincolo de informațiile tehnice strict necesare funcționării (vezi <Link href="/politica-confidentialitate">politica de confidențialitate</Link>). Nu există formulare, conturi de utilizator sau newsletter.
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container">
            <h2>Cum poți contribui</h2>
            <p>
              Dacă observi o eroare de calcul, o referință legislativă depășită sau ai sugestii pentru pagini noi (calculator PFA, calculator concediu medical etc.), poți scrie la adresa de pe pagina de <Link href="/contact">contact</Link>. Răspund la toate mesajele primite, deși timpul de răspuns poate fi de câteva zile, fiind un proiect personal întreținut în timpul liber.
            </p>
            <p>
              Erorile concrete (de exemplu o cifră greșită într-un calcul detaliat) au prioritate maximă — le corectez de regulă în aceeași zi în care primesc raportarea.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
