// app/salariu-mediu/page.tsx
// Server Component pur — SSR maxim, SEO maxim, zero JS la client.
// Pattern-uri vizuale exclusiv din globals.css existent (homepage).

import type { Metadata } from "next";
import Link from "next/link";

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Salariul mediu pe economie 2026: cât e brut și net",
  description:
    "Câștigul salarial mediu brut pe economie în 2026 este 9.192 lei (~5.377 lei net), conform Legii 44/2026. Vezi pentru ce se folosește și evoluția istorică.",
  keywords: [
    "salariu mediu 2026",
    "salariu mediu brut 2026",
    "salariu mediu net 2026",
    "Legea 44/2026",
    "ajutor de deces 2026",
    "salariu mediu economie",
  ],
  alternates: { canonical: "https://salariile.ro/salariu-mediu" },
  openGraph: {
    title: "Salariul mediu pe economie 2026: cât e brut și net",
    description: "Valoarea oficială a salariului mediu brut pentru 2026 conform Legii 44/2026: 9.192 lei brut, ~5.377 lei net.",
    url: "https://salariile.ro/salariu-mediu",
  },
};

// ─── Date factuale 2026 (verificate prin acte normative) ─────────────────────

const ISTORIC = [
  { an: "2020", brut: 5429, lege: "Legea 6/2020",   crestere: "—" },
  { an: "2021", brut: 5380, lege: "Legea 16/2021",  crestere: "−0,9%" },
  { an: "2022", brut: 6095, lege: "Legea 318/2021", crestere: "+13,3%" },
  { an: "2023", brut: 6789, lege: "Legea 369/2022", crestere: "+11,4%" },
  { an: "2024", brut: 7567, lege: "Legea 422/2023", crestere: "+11,5%" },
  { an: "2025", brut: 8620, lege: "Legea 313/2024", crestere: "+13,9%" },
  { an: "2026", brut: 9192, lege: "Legea 44/2026",  crestere: "+6,6%", recent: true },
];

const PROGNOZE = [
  { an: "2027", brut: 9786,  net: 6079, sursa: "Prognoză CNSP toamnă 2025" },
  { an: "2028", brut: 10381, net: 6449, sursa: "Prognoză CNSP toamnă 2025" },
];

const FAQ = [
  {
    q: "Cât este salariul mediu brut pe economie în 2026?",
    a: "Câștigul salarial mediu brut utilizat la fundamentarea bugetului asigurărilor sociale pentru 2026 este stabilit la 9.192 lei lunar, conform Legii 44/2026 (publicată în Monitorul Oficial pe 27 martie 2026, în vigoare din 30 martie 2026). Datele reale INS pentru ianuarie 2026 indică o valoare apropiată — 9.220 lei brut.",
  },
  {
    q: "Care este diferența între salariul mediu și salariul minim?",
    a: "Salariul minim este suma minimă pe care un angajator trebuie să o plătească legal (4.050/4.325 lei brut în 2026). Salariul mediu brut este un indicator statistic care reflectă media veniturilor din economie — nu obligă pe nimeni să plătească această sumă. În schimb, valoarea lui dictează plafoane pentru ajutoare sociale, indemnizații și prestații.",
  },
  {
    q: "Cât rezultă net dintr-un brut de 9.192 lei?",
    a: "După reținerea CAS (25%), CASS (10%) și impozit pe venit (10%), netul rezultat este aproximativ 5.377 lei. Pentru veniturile peste 6.325 lei brut nu se aplică deducerea personală, deci toată suma după contribuții se impozitează.",
  },
  {
    q: "Cine stabilește valoarea oficială a salariului mediu?",
    a: "Valoarea utilizată oficial pentru plafoane și ajutoare sociale se stabilește anual prin Legea bugetului asigurărilor sociale de stat, pe baza prognozelor Comisiei Naționale de Strategie și Prognoză (CNSP) și a datelor furnizate de Institutul Național de Statistică (INS). Pentru 2026, Legea 44/2026 a fixat valoarea la 9.192 lei.",
  },
  {
    q: "Cât este ajutorul de deces în 2026?",
    a: "Din 30 martie 2026, ajutorul de deces este de 9.192 lei pentru decesul unui asigurat sau pensionar și 4.596 lei pentru decesul unui membru de familie. Suma este corelată direct cu salariul mediu brut utilizat la fundamentarea bugetului. Anterior (1 ianuarie – 29 martie 2026), valorile aplicate erau 8.620 lei, respectiv 4.310 lei.",
  },
  {
    q: "Salariul mediu afectează plafoanele PFA?",
    a: "Nu direct. Plafoanele pentru CAS și CASS la veniturile din activități independente (PFA, dividende, chirii etc.) se calculează ca multipli ai salariului MINIM brut, nu ai salariului mediu. Pentru 2026, plafoanele PFA folosesc 4.050 lei (salariul minim la 1 ianuarie 2026).",
  },
  {
    q: "Ce prevede prognoza pentru anii următori?",
    a: "Conform variantei de toamnă 2025 a prognozei CNSP, câștigul salarial mediu brut va atinge 9.786 lei în 2027 și 10.381 lei în 2028. Acestea sunt estimări — valorile oficiale anuale se stabilesc prin legile bugetelor de asigurări sociale.",
  },
];

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Salariul mediu 2026", item: "https://salariile.ro/salariu-mediu" },
      ],
    },
    {
      "@type": "Article",
      headline: "Salariul mediu brut pe economie 2026: 9.192 lei",
      description:
        "Analiză completă a salariului mediu brut pe economie pentru 2026: cadrul legal (Legea 44/2026), calcul net, ajutor de deces, plafoane sociale, date reale INS și prognoze CNSP.",
      author: { "@type": "Organization", name: "Salariile.ro", url: "https://salariile.ro" },
      publisher: { "@type": "Organization", name: "Salariile.ro" },
      mainEntityOfPage: "https://salariile.ro/salariu-mediu",
      datePublished: "2026-03-30",
      dateModified: "2026-04-30",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

// ─── Pagina ──────────────────────────────────────────────────────────────────

export default function SalariuMediuPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Salariul mediu 2026</span>
          </nav>
          <h1>Salariul mediu brut pe economie 2026</h1>
          <p className="subtitle">
            Câștigul salarial mediu brut utilizat la fundamentarea bugetului asigurărilor sociale pentru 2026 este <strong>9.192 lei</strong> lunar, stabilit prin Legea 44/2026, în vigoare din 30 martie 2026.
          </p>
          <p className="skeleton-hint">
            ULTIMA ACTUALIZARE: 30 APRILIE 2026 · SURSE: LEGEA 44/2026, CNSP, INS
          </p>
        </div>
      </section>

      <main>
        {/* CIFRE ESENȚIALE */}
        <section className="article-section">
          <div className="container">
            <h2>Cifre esențiale 2026</h2>
            <div className="table-scroll"><table className="flat-table">
              <thead>
                <tr>
                  <th>Indicator</th>
                  <th>Valoare 2026</th>
                  <th>Bază legală</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-base">
                  <td>Salariu mediu brut (oficial)</td>
                  <td>{fmt(9192)} lei</td>
                  <td>Legea 44/2026</td>
                </tr>
                <tr className="total-net">
                  <td>Salariu mediu net (estimat)</td>
                  <td>~{fmt(5377)} lei</td>
                  <td>Codul Fiscal</td>
                </tr>
                <tr className="row-base">
                  <td>Salariu mediu real ianuarie 2026</td>
                  <td>{fmt(9220)} lei brut</td>
                  <td>INS, raport martie 2026</td>
                </tr>
                <tr className="row-bright">
                  <td>Ajutor deces — asigurat/pensionar</td>
                  <td>{fmt(9192)} lei</td>
                  <td>Legea 44/2026, art. cf. L. 263/2010</td>
                </tr>
                <tr className="row-bright">
                  <td>Ajutor deces — membru de familie</td>
                  <td>{fmt(4596)} lei</td>
                  <td>Legea 44/2026</td>
                </tr>
                <tr className="row-base">
                  <td>Creștere față de 2025</td>
                  <td>+572 lei brut (+6,6%)</td>
                  <td>Față de Legea 313/2024</td>
                </tr>
              </tbody>
            </table></div>
            <p className="source-note">
              Legea 44/2026 a fost publicată în Monitorul Oficial pe 27 martie 2026 și a intrat în vigoare începând cu 30 martie 2026. Până la acea dată, în primele luni ale anului 2026, s-a aplicat valoarea anterioară (8.620 lei).
            </p>
          </div>
        </section>

        {/* SALARIU MEDIU VS MINIM */}
        <section className="article-section">
          <div className="container">
            <h2>Ce este salariul mediu brut pe economie</h2>
            <p>
              Salariul mediu brut este un indicator statistic și macroeconomic care reflectă media câștigurilor brute realizate de salariații din economia României. Spre deosebire de salariul minim, care obligă angajatorii să plătească cel puțin o sumă fixă, salariul mediu este o referință — nu impune obligații directe angajatorilor.
            </p>
            <p>
              În fiecare an, Legea bugetului asigurărilor sociale de stat stabilește o valoare oficială a acestui indicator, folosită pentru:
            </p>
            <ul className="article-list">
              <li>Calculul ajutorului de deces acordat prin sistemul public de pensii</li>
              <li>Stabilirea plafoanelor pentru anumite prestații sociale</li>
              <li>Indexări ale unor drepturi și indemnizații</li>
              <li>Fundamentarea bugetului asigurărilor sociale (pensii, șomaj, accidente de muncă)</li>
              <li>Indicator macroeconomic pentru analize și raportări către UE</li>
            </ul>
            <p>
              <strong>Diferența cheie:</strong> <Link href="/salariu-minim">salariul minim brut</Link> (4.050 → 4.325 lei în 2026) este pragul legal pe care orice angajator trebuie să-l respecte. Salariul mediu brut (9.192 lei în 2026) este o medie statistică — angajatorii nu sunt obligați să ofere această sumă, dar valoarea ei dictează ajutoare și plafoane sociale.
            </p>
          </div>
        </section>

        {/* CADRU LEGAL */}
        <section className="article-section">
          <div className="container">
            <h2>Cadrul legal 2026</h2>
            <p>
              Valoarea oficială a salariului mediu brut pentru 2026 a fost stabilită prin <strong>Legea 44 din 27 martie 2026</strong> privind bugetul asigurărilor sociale de stat, publicată în Monitorul Oficial și intrată în vigoare la 30 martie 2026.
            </p>
            <p>
              Articolul relevant prevede: <em>„Câștigul salarial mediu brut utilizat la fundamentarea bugetului asigurărilor sociale de stat pe anul 2026 este de 9.192 lei. Începând cu data intrării în vigoare a prezentei legi, cuantumul ajutorului de deces se stabilește, în condițiile legii, în cazul: a) asiguratului sau pensionarului, la 9.192 lei; b) unui membru de familie al asiguratului sau al pensionarului, la 4.596 lei.”</em>
            </p>
            <p>
              <strong>Perioada de tranziție</strong>: până la intrarea în vigoare a Legii 44/2026 (29 martie 2026 inclusiv), s-a aplicat valoarea anterioară de 8.620 lei (Legea 313/2024) — atât pentru salariul mediu utilizat la fundamentarea bugetului, cât și pentru ajutorul de deces (8.620 / 4.310 lei).
            </p>
            <p>
              Conform <strong>Legii 263/2010</strong> privind sistemul unitar de pensii publice, cuantumul ajutorului de deces nu poate fi mai mic decât valoarea câștigului salarial mediu brut utilizat la fundamentarea bugetului. Acest mecanism asigură indexarea automată a ajutorului în funcție de evoluția salariului mediu.
            </p>
          </div>
        </section>

        {/* CALCUL NET */}
        <section className="article-section">
          <div className="container">
            <h2>Calculul net pentru 9.192 lei brut</h2>
            <p>
              Pentru un salariu brut egal cu salariul mediu pe economie, deducerea personală nu se aplică (plafonul este 6.325 lei brut în S2 2026). Toate contribuțiile se calculează la nivelul integral al brutului.
            </p>
            <div className="table-scroll"><table className="flat-table">
              <thead>
                <tr>
                  <th>Etapă calcul</th>
                  <th>Sumă</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-base">
                  <td>Salariu brut</td>
                  <td>9.192,00 lei</td>
                </tr>
                <tr className="sub-row">
                  <td>CAS — pensie (25%)</td>
                  <td>−2.298,00 lei</td>
                </tr>
                <tr className="sub-row">
                  <td>CASS — sănătate (10%)</td>
                  <td>−919,20 lei</td>
                </tr>
                <tr className="sub-row">
                  <td>Deducere personală</td>
                  <td>0 lei (depășește plafonul)</td>
                </tr>
                <tr className="row-bright">
                  <td>Bază impozabilă</td>
                  <td>5.974,80 lei</td>
                </tr>
                <tr className="sub-row">
                  <td>Impozit pe venit (10%)</td>
                  <td>−597,48 lei</td>
                </tr>
                <tr className="total-retineri">
                  <td>Total rețineri angajat</td>
                  <td>3.814,68 lei</td>
                </tr>
                <tr className="total-net">
                  <td>Salariu net (în mână)</td>
                  <td>~5.377 lei</td>
                </tr>
                <tr className="spacer-row"><td colSpan={2}></td></tr>
                <tr className="sub-row">
                  <td>CAM angajator (2,25%)</td>
                  <td>206,82 lei</td>
                </tr>
                <tr className="total-cost">
                  <td>Cost total angajator</td>
                  <td>~9.399 lei</td>
                </tr>
              </tbody>
            </table></div>
            <p className="source-note">
              Calcul standard fără sporuri, fără tichete de masă și fără alte beneficii. Pentru salarii la nivelul mediei, scutirea pentru personal cu copii sau alte deduceri specifice pot ajusta netul. Vezi <Link href="/calculator/calcul-salariu-net-9000-brut">calculul detaliat pentru 9.000 lei brut</Link> sau <Link href="/calculator/calcul-salariu-net-10000-brut">10.000 lei brut</Link>.
            </p>
          </div>
        </section>

        {/* DATE REALE INS */}
        <section className="article-section">
          <div className="container">
            <h2>Salariul mediu real (date INS) vs valoare bugetară</h2>
            <p>
              Există două valori distincte care circulă pentru salariul mediu brut și sunt deseori confundate:
            </p>
            <ul className="article-list">
              <li>
                <strong>Valoarea oficială bugetară</strong> (9.192 lei pentru 2026): stabilită prin Legea bugetului asigurărilor sociale, folosită pentru calculul ajutorului de deces și al unor plafoane sociale. Această valoare este fixă pentru tot anul fiscal.
              </li>
              <li>
                <strong>Valorile reale lunare publicate de INS</strong>: rezultatul efectiv al statisticilor lunare. Pentru ianuarie 2026, INS a raportat un salariu mediu brut de 9.220 lei, în scădere cu 648 lei (−6,6%) față de decembrie 2025 — efect tipic al absenței bonusurilor de sfârșit de an.
              </li>
            </ul>
            <p>
              Valoarea bugetară (9.192 lei) este apropiată de media INS din ianuarie, ceea ce confirmă acuratețea prognozei CNSP pe baza căreia s-a fundamentat bugetul. În cursul anului, datele INS lunare vor varia în jurul acestei valori, cu vârfuri în decembrie (bonusuri) și minime în ianuarie.
            </p>
            <p>
              Pentru calcule fiscale, salariale și ajutoare sociale se folosește exclusiv valoarea bugetară (9.192 lei), nu valorile lunare INS.
            </p>
          </div>
        </section>

        {/* ISTORIC */}
        <section className="article-section">
          <div className="container">
            <h2>Evoluția salariului mediu 2020 – 2026</h2>
            <div className="table-scroll"><table className="flat-table">
              <thead>
                <tr>
                  <th>Anul</th>
                  <th>Salariu mediu brut</th>
                  <th>Creștere</th>
                  <th>Bază legală</th>
                </tr>
              </thead>
              <tbody>
                {ISTORIC.map((row) => (
                  <tr key={row.an} className={row.recent ? "total-net" : "row-base"}>
                    <td>{row.an}</td>
                    <td>{fmt(row.brut)} lei</td>
                    <td>{row.crestere}</td>
                    <td>{row.lege}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <p className="source-note">
              Valoarea pentru 2021 a fost mai mică decât 2020 din cauza ajustărilor metodologice impuse de pandemia COVID-19. Începând cu 2022, creșterea a fost stabilă, în corelație cu inflația și politica salarială.
            </p>
          </div>
        </section>

        {/* PROGNOZE */}
        <section className="article-section">
          <div className="container">
            <h2>Prognoze pentru anii următori (CNSP)</h2>
            <p>
              Conform variantei de toamnă 2025 a Prognozei Comisiei Naționale de Strategie și Prognoză, evoluția estimată pentru perioada 2027 – 2028 este:
            </p>
            <div className="table-scroll"><table className="flat-table">
              <thead>
                <tr>
                  <th>Anul</th>
                  <th>Brut estimat</th>
                  <th>Net estimat</th>
                  <th>Sursă</th>
                </tr>
              </thead>
              <tbody>
                {PROGNOZE.map((row) => (
                  <tr key={row.an} className="row-base">
                    <td>{row.an}</td>
                    <td>{fmt(row.brut)} lei</td>
                    <td>{fmt(row.net)} lei</td>
                    <td>{row.sursa}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <p className="source-note">
              Acestea sunt estimări CNSP, nu valori oficiale legale. Valoarea oficială pentru fiecare an se stabilește prin legea bugetului asigurărilor sociale aprobată anual.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="info-section">
          <div className="container">
            <h2 className="mb-2">Întrebări frecvente</h2>
            <div className="faq-list">
              {FAQ.map((item, i) => (
                <details key={i} className="faq-item">
                  <summary>{item.q}</summary>
                  <p className="faq-answer">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* SURSE */}
        <section className="article-section">
          <div className="container">
            <h2>Surse oficiale</h2>
            <ul className="article-list">
              <li><strong>Legea 44/2026</strong> privind bugetul asigurărilor sociale de stat pe anul 2026 — publicată în Monitorul Oficial pe 27 martie 2026</li>
              <li><strong>Legea 313/2024</strong> — bugetul asigurărilor sociale pentru 2025 (referință valori anterioare)</li>
              <li><strong>Legea 263/2010</strong> privind sistemul unitar de pensii publice — art. 112 și următoarele (ajutor de deces)</li>
              <li><strong>Prognoza CNSP, varianta de toamnă 2025</strong> — proiecții 2026 – 2028</li>
              <li><strong>Date statistice INS</strong> — raportul lunar privind câștigul salarial mediu brut și net</li>
              <li>
                <a href="https://insse.ro" target="_blank" rel="noopener">Institutul Național de Statistică</a> · <a href="https://cnsp.gov.ro" target="_blank" rel="noopener">CNSP</a> · <a href="https://cnpp.ro" target="_blank" rel="noopener">Casa Națională de Pensii Publice</a>
              </li>
            </ul>
            <p className="source-note">Pagină actualizată: 30 aprilie 2026.</p>
          </div>
        </section>

        {/* CTA */}
        <div className="cta-card">
          <h2>Vezi unde te poziționezi față de media națională</h2>
          <p>Calculatorul nostru îți arată exact unde se situează salariul tău net față de cel mediu și care e impactul fiscal al fiecărei sume brute.</p>
          <Link href="/" className="btn-cta">Calculează salariul tău →</Link>
        </div>
      </main>
    </>
  );
}
