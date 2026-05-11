// app/salariu-minim/page.tsx
// Server Component pur — SSR maxim, SEO maxim, zero JS la client.
// Pattern-uri vizuale exclusiv din globals.css existent (homepage).

import type { Metadata } from "next";
import Link from "next/link";

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Salariul minim 2026: cât e net și cât plătește angajatorul",
  description:
    "Salariul minim brut e 4.050 lei până la 30 iunie și 4.325 lei după (HG 146/2026). Vezi cât rămâne net (2.574 → 2.699 lei) și cât plătește total angajatorul.",
  keywords: [
    "salariu minim 2026",
    "salariu minim brut 2026",
    "salariu minim net 2026",
    "HG 146/2026",
    "OUG 89/2025",
    "cost angajator salariu minim",
  ],
  alternates: { canonical: "https://salariile.ro/salariu-minim" },
};

// ─── Date factuale 2026 (verificate prin acte normative) ─────────────────────

const ISTORIC = [
  { perioada: "2019",            brut: 2080, net: 1263, cost: 2127, hg: "HG 937/2018",   crestere: "—" },
  { perioada: "2020",            brut: 2230, net: 1346, cost: 2280, hg: "HG 935/2019",   crestere: "+7,2%" },
  { perioada: "2021",            brut: 2300, net: 1386, cost: 2351, hg: "HG 4/2021",     crestere: "+3,1%" },
  { perioada: "2022",            brut: 2550, net: 1524, cost: 2607, hg: "HG 1071/2021", crestere: "+10,9%" },
  { perioada: "ian 2023",        brut: 3000, net: 1863, cost: 3067, hg: "HG 1447/2022", crestere: "+17,6%" },
  { perioada: "oct 2023",        brut: 3300, net: 2079, cost: 3374, hg: "HG 900/2023",  crestere: "+10,0%" },
  { perioada: "iul 2024",        brut: 3700, net: 2363, cost: 3783, hg: "HG 598/2024",  crestere: "+12,1%" },
  { perioada: "ian 2025 – iun 2026", brut: 4050, net: 2574, cost: 4134, hg: "HG 1506/2024", crestere: "+9,5%" },
  { perioada: "iul 2026 – dec 2026", brut: 4325, net: 2699, cost: 4418, hg: "HG 146/2026", crestere: "+6,8%", recent: true },
];

const FAQ = [
  {
    q: "Cât este salariul minim brut pe țară în 2026?",
    a: "Salariul minim brut are două valori în 2026: 4.050 lei pentru perioada 1 ianuarie – 30 iunie (conform HG 1506/2024, în vigoare din ianuarie 2025) și 4.325 lei începând cu 1 iulie 2026 (conform HG 146/2026, publicat în Monitorul Oficial nr. 196 din 13 martie 2026).",
  },
  {
    q: "Cât rămâne net la salariul minim în 2026?",
    a: "În semestrul I 2026, la 4.050 lei brut, salariatul primește net 2.574 lei (cu facilitatea fiscală OUG 89/2025 de 300 lei netaxabili). Din 1 iulie 2026, la 4.325 lei brut și facilitate redusă la 200 lei, netul devine 2.699 lei.",
  },
  {
    q: "Care este costul total al angajatorului?",
    a: "Costul total pentru un salariu minim include brutul plus contribuția asiguratorie pentru muncă (CAM 2,25%). Rezultă 4.134 lei lunar în semestrul I 2026 și 4.418 lei începând cu 1 iulie 2026 — o creștere de 284 lei lunar.",
  },
  {
    q: "Salariul minim sectorul construcții se schimbă?",
    a: "Nu. HG 146/2026 menționează explicit că nu modifică salariul minim brut pentru sectorul construcțiilor, care rămâne 4.582 lei lunar pe tot parcursul anului 2026.",
  },
  {
    q: "Ce este facilitatea fiscală de 300/200 lei?",
    a: "OUG 89/2025 scutește o sumă fixă din salariul minim de impozit pe venit și contribuții sociale: 300 lei/lună în perioada 1 ianuarie – 30 iunie 2026, respectiv 200 lei/lună în perioada 1 iulie – 31 decembrie 2026. Facilitatea se aplică doar dacă brutul este exact la nivelul salariului minim și salariatul este încadrat la funcția de bază cu normă întreagă.",
  },
  {
    q: "Salariul minim influențează plafoanele PFA în 2026?",
    a: "Da, dar se folosește salariul minim în vigoare la 1 ianuarie 2026 (4.050 lei) pentru toate plafoanele anuale CAS/CASS pe veniturile din activități independente. Majorarea la 4.325 lei din iulie NU afectează plafoanele anuale pentru anul fiscal 2026.",
  },
  {
    q: "Mai există scutirea de impozit pentru IT, construcții și agricultură?",
    a: "Nu. OUG 156/2024 a eliminat scutirile fiscale pentru salariații din IT, construcții, agricultură și industria alimentară începând cu veniturile lunii ianuarie 2025. Acum se aplică toate taxele și contribuțiile standard, indiferent de sector.",
  },
  {
    q: "Pot fi angajat legal sub salariul minim brut pe țară?",
    a: "Nu. Codul Muncii (art. 164) obligă orice angajator să plătească minimum salariul minim brut pe țară garantat în plată pentru un program normal de lucru. Pentru programul parțial, suma se calculează proporțional cu numărul de ore lucrate.",
  },
  {
    q: "Ce obligații are angajatorul de la 1 iulie 2026?",
    a: "Angajatorul trebuie să încheie un act adițional individual cu fiecare salariat plătit la nivelul minim, să transmită modificarea în REGES-Online în maximum 20 zile lucrătoare și să aplice noua valoare la calculul salariilor. Nu se emit decizii colective de majorare.",
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
        { "@type": "ListItem", position: 2, name: "Salariul minim 2026", item: "https://salariile.ro/salariu-minim" },
      ],
    },
    {
      "@type": "Article",
      headline: "Salariul minim brut 2026 în România: 4.050 → 4.325 lei",
      description:
        "Analiză completă a salariului minim brut pe țară în 2026: cadrul legal (HG 146/2026, OUG 89/2025), calcul net detaliat, sectoare specifice (construcții 4.582 lei), plafoane fiscale și obligații pentru angajatori.",
      author: { "@type": "Organization", name: "Salariile.ro", url: "https://salariile.ro" },
      publisher: { "@type": "Organization", name: "Salariile.ro" },
      mainEntityOfPage: "https://salariile.ro/salariu-minim",
      dateModified: new Date().toISOString(),
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

export default function SalariuMinimPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Salariul minim 2026</span>
          </nav>
          <h1>Salariul minim brut 2026</h1>
          <p className="subtitle">
            Pentru anul 2026, salariul minim brut pe țară garantat în plată are două valori: <strong>4.050 lei</strong> până la 30 iunie și <strong>4.325 lei</strong> începând cu 1 iulie (HG 146/2026, publicat în Monitorul Oficial nr. 196 din 13 martie 2026).
          </p>
          <p className="skeleton-hint">
            ULTIMA ACTUALIZARE: 30 APRILIE 2026 · SURSE: MONITORUL OFICIAL, ANAF, MMUNCII
          </p>
        </div>
      </section>

      <main>
        {/* CIFRE ESENȚIALE */}
        <section className="article-section">
          <div className="container">
            <h2>Cifre esențiale 2026</h2>
            <table className="flat-table">
              <thead>
                <tr>
                  <th>Indicator</th>
                  <th>Ian – iun 2026</th>
                  <th>Iul – dec 2026</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-base">
                  <td>Salariu brut</td>
                  <td>{fmt(4050)} lei</td>
                  <td>{fmt(4325)} lei</td>
                </tr>
                <tr className="total-net">
                  <td>Salariu net</td>
                  <td>{fmt(2574)} lei</td>
                  <td>{fmt(2699)} lei</td>
                </tr>
                <tr className="row-base">
                  <td>Facilitate fiscală (OUG 89/2025)</td>
                  <td>300 lei netaxabili</td>
                  <td>200 lei netaxabili</td>
                </tr>
                <tr className="row-base">
                  <td>Tarif orar</td>
                  <td>24,496 lei/oră</td>
                  <td>25,949 lei/oră</td>
                </tr>
                <tr className="row-base">
                  <td>Program normal lucru</td>
                  <td>165,334 ore/lună</td>
                  <td>166,667 ore/lună</td>
                </tr>
                <tr className="total-cost">
                  <td>Cost total angajator</td>
                  <td>{fmt(4134)} lei</td>
                  <td>{fmt(4418)} lei</td>
                </tr>
              </tbody>
            </table>
            <p className="source-note">
              Surse: <a href="https://legislatie.just.ro" target="_blank" rel="noopener">HG 1506/2024</a> (S1), <a href="https://legislatie.just.ro" target="_blank" rel="noopener">HG 146/2026</a> (S2), OUG 89/2025.
            </p>
          </div>
        </section>

        {/* CADRU LEGISLATIV */}
        <section className="article-section">
          <div className="container">
            <h2>Cadrul legislativ pentru 2026</h2>
            <p>
              Salariul minim brut pe țară garantat în plată este reglementat prin art. 164 alin. (1) din Codul Muncii (Legea 53/2003). Nivelul se stabilește anual prin hotărâre de guvern, după consultarea partenerilor sociali în cadrul Consiliului Național Tripartit.
            </p>
            <p>
              În 2026, două acte normative reglementează nivelul salariului minim, etapizat semestrial:
            </p>
            <ul className="article-list">
              <li>
                <strong>HG 1506/2024</strong>, publicată în Monitorul Oficial nr. 1185 din 28 noiembrie 2024, a stabilit salariul minim la 4.050 lei brut începând cu 1 ianuarie 2025. Rămâne în vigoare până la 30 iunie 2026.
              </li>
              <li>
                <strong>HG 146/2026</strong>, publicată în Monitorul Oficial nr. 196 din 13 martie 2026, majorează salariul minim la 4.325 lei brut începând cu 1 iulie 2026 și abrogă HG 1506/2024.
              </li>
              <li>
                <strong>OUG 89/2025</strong> introduce facilitatea fiscală de scutire pentru o sumă fixă din salariul minim: 300 lei netaxabili (1 ianuarie – 30 iunie 2026), respectiv 200 lei netaxabili (1 iulie – 31 decembrie 2026).
              </li>
              <li>
                <strong>HG 35/2025</strong> stabilește mecanismul tehnic de calcul anual al salariului minim, în conformitate cu Directiva UE 2022/2041 privind salariile minime adecvate, transpusă în legislația națională.
              </li>
            </ul>
            <p>
              Salariul minim brut este obligatoriu pentru toți angajatorii din sectorul privat și public, indiferent de domeniul de activitate, cu excepția sectoarelor cu salarii minime sectoriale (construcții).
            </p>
          </div>
        </section>

        {/* CALCUL DETALIAT */}
        <section className="article-section">
          <div className="container">
            <h2>Calculul net detaliat: S1 vs S2</h2>
            <p>
              Din salariul brut se rețin trei contribuții obligatorii: CAS 25% (pensie), CASS 10% (sănătate) și impozit pe venit 10%. Pentru salariații la nivelul salariului minim, cu funcția de bază și normă întreagă, o sumă fixă este scutită de taxe — facilitatea OUG 89/2025.
            </p>
            <table className="flat-table">
              <thead>
                <tr>
                  <th>Etapă calcul</th>
                  <th>Ian – iun 2026</th>
                  <th>Iul – dec 2026</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-base">
                  <td>Salariu brut</td>
                  <td>4.050,00 lei</td>
                  <td>4.325,00 lei</td>
                </tr>
                <tr className="sub-row">
                  <td>Sumă netaxabilă (OUG 89/2025)</td>
                  <td>−300,00 lei</td>
                  <td>−200,00 lei</td>
                </tr>
                <tr className="row-bright">
                  <td>Bază pentru contribuții</td>
                  <td>3.750,00 lei</td>
                  <td>4.125,00 lei</td>
                </tr>
                <tr className="sub-row">
                  <td>CAS — pensie (25%)</td>
                  <td>−937,50 lei</td>
                  <td>−1.031,25 lei</td>
                </tr>
                <tr className="sub-row">
                  <td>CASS — sănătate (10%)</td>
                  <td>−375,00 lei</td>
                  <td>−412,50 lei</td>
                </tr>
                <tr className="sub-row">
                  <td>Deducere personală (Codul Fiscal art. 77)</td>
                  <td>−810,00 lei</td>
                  <td>−865,00 lei</td>
                </tr>
                <tr className="row-bright">
                  <td>Bază impozabilă</td>
                  <td>1.627,50 lei</td>
                  <td>1.816,25 lei</td>
                </tr>
                <tr className="sub-row">
                  <td>Impozit pe venit (10%)</td>
                  <td>−163,00 lei</td>
                  <td>−182,00 lei</td>
                </tr>
                <tr className="total-retineri">
                  <td>Total rețineri angajat</td>
                  <td>1.475,50 lei</td>
                  <td>1.625,75 lei</td>
                </tr>
                <tr className="total-net">
                  <td>Salariu net (în mână)</td>
                  <td>2.574,00 lei</td>
                  <td>2.699,00 lei</td>
                </tr>
                <tr className="spacer-row"><td colSpan={3}></td></tr>
                <tr className="sub-row">
                  <td>CAM angajator (2,25%)</td>
                  <td>84,38 lei</td>
                  <td>93,38 lei</td>
                </tr>
                <tr className="total-cost">
                  <td>Cost total angajator</td>
                  <td>4.134,00 lei</td>
                  <td>4.418,00 lei</td>
                </tr>
              </tbody>
            </table>
            <p className="source-note">
              Rotunjirile finale sunt la nivelul leului. Calculatorul aplică formulele complete conform Codului Fiscal (Legea 227/2015) și sincronizat cu Declarația 112 ANAF.
            </p>
          </div>
        </section>

        {/* SECTOARE */}
        <section className="article-section">
          <div className="container">
            <h2>Salariul minim pe sectoare</h2>
            <p>
              Pe lângă salariul minim general, sectorul construcțiilor are propriul salariu minim sectorial, stabilit la un nivel superior pentru a reflecta specificul activităților:
            </p>
            <table className="flat-table">
              <thead>
                <tr>
                  <th>Sector</th>
                  <th>Salariu minim 2026</th>
                  <th>Bază legală</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-base">
                  <td>General (toate sectoarele, inclusiv sector agroalimentar)</td>
                  <td>4.050 → 4.325 lei</td>
                  <td>HG 1506/2024, HG 146/2026</td>
                </tr>
                <tr className="row-bright">
                  <td>Construcții</td>
                  <td>4.582 lei (neschimbat)</td>
                  <td>Legea 50/1991, OUG 114/2018</td>
                </tr>
              </tbody>
            </table>
            <p>
              HG 146/2026 menționează explicit că nu modifică salariile minime sectoriale. Valoarea de 4.582 lei pentru construcții rămâne în vigoare pe tot parcursul anului 2026.
            </p>
            <p>
              <strong>Important:</strong> Anterior, sectoarele IT (creare programe de calculator), construcții și agroalimentar beneficiau de scutiri fiscale (impozit pe venit 0% pentru brut sub 10.000 lei, cotă redusă CAS la 20,25% și scutire de la Pilonul II). Aceste facilități au fost <strong>eliminate prin OUG 156/2024</strong> începând cu veniturile lunii ianuarie 2025. Salariații din aceste sectoare plătesc acum toate taxele standard, la fel ca în restul economiei.
            </p>
          </div>
        </section>

        {/* OBLIGAȚII ANGAJATORI */}
        <section className="article-section">
          <div className="container">
            <h2>Obligațiile angajatorilor de la 1 iulie 2026</h2>
            <p>
              Majorarea salariului minim la 4.325 lei generează obligații concrete pentru angajatori care au salariați plătiți la nivelul minim:
            </p>
            <ul className="article-list">
              <li>
                <strong>Act adițional individual</strong> pentru fiecare contract de muncă afectat. Conform Codului Muncii, modificarea elementelor contractuale individuale necesită acord scris între părți — nu se emit decizii colective de majorare.
              </li>
              <li>
                <strong>Transmitere REGES-Online</strong>: orice modificare a salariului brut stabilit prin contract trebuie comunicată în Registrul General de Evidență a Salariaților (REGES-Online) în maximum 20 zile lucrătoare de la data producerii.
              </li>
              <li>
                <strong>Regula celor 24 de luni</strong>: salariații menținuți la nivelul salariului minim peste 24 luni consecutive trebuie negociați individual la un nivel superior salariului minim, conform art. 164^2 din Codul Muncii.
              </li>
              <li>
                <strong>Sancțiuni ITM</strong>: nerespectarea obligației de plată a salariului minim este contravenție conform art. 260 din Codul Muncii. Amenzile pot ajunge la 3.000–10.000 lei pentru fiecare contract neactualizat.
              </li>
              <li>
                <strong>Contractul colectiv de muncă</strong>: dacă există CCM aplicabil cu un nivel mai mare decât salariul minim, negocierea individuală pornește de la nivelul din CCM, nu de la salariul minim legal.
              </li>
            </ul>
          </div>
        </section>

        {/* PLAFOANE FISCALE */}
        <section className="article-section">
          <div className="container">
            <h2>Plafoane fiscale dependente de salariul minim</h2>
            <p>
              Multe limite din legislația fiscală sunt definite ca multipli ai salariului minim brut. Pentru anul fiscal 2026, se aplică salariul minim în vigoare la <strong>1 ianuarie 2026 — 4.050 lei</strong>. Majorarea la 4.325 lei din 1 iulie 2026 nu afectează plafoanele anuale pentru veniturile din 2026.
            </p>
            <table className="flat-table">
              <thead>
                <tr>
                  <th>Plafon</th>
                  <th>Formulă</th>
                  <th>Valoare 2026</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-base">
                  <td>CASS PFA — plafon maxim</td>
                  <td>24 × salariu minim</td>
                  <td>97.200 lei venit anual</td>
                </tr>
                <tr className="row-base">
                  <td>CAS PFA — plafon maxim</td>
                  <td>24 × salariu minim</td>
                  <td>97.200 lei venit anual</td>
                </tr>
                <tr className="row-base">
                  <td>Plafon minim CASS PFA</td>
                  <td>6 × salariu minim</td>
                  <td>24.300 lei venit anual</td>
                </tr>
                <tr className="row-base">
                  <td>Plafon dividende (CASS)</td>
                  <td>24 × salariu minim</td>
                  <td>97.200 lei venit anual</td>
                </tr>
                <tr className="row-base">
                  <td>Deducere personală S1 (plafon brut)</td>
                  <td>salariu minim + 2.000 lei</td>
                  <td>6.050 lei</td>
                </tr>
                <tr className="row-base">
                  <td>Deducere personală S2 (plafon brut)</td>
                  <td>salariu minim + 2.000 lei</td>
                  <td>6.325 lei</td>
                </tr>
                <tr className="row-bright">
                  <td>Indemnizație însoțitor (din 1 iul 2026)</td>
                  <td>50% × salariu minim</td>
                  <td>2.163 lei lunar</td>
                </tr>
              </tbody>
            </table>
            <p className="source-note">
              Plafonul deducerii personale la salarii folosește salariul minim al lunii în care se calculează venitul (6.050 lei până în iunie, 6.325 lei din iulie). Restul plafoanelor anuale rămân ancorate la valoarea de 1 ianuarie.
            </p>
          </div>
        </section>

        {/* ISTORIC */}
        <section className="article-section">
          <div className="container">
            <h2>Evoluția salariului minim 2019 – 2026</h2>
            <table className="flat-table">
              <thead>
                <tr>
                  <th>Perioadă</th>
                  <th>Brut (lei)</th>
                  <th>Net (lei)</th>
                  <th>Cost angajator</th>
                  <th>Bază legală</th>
                  <th>Creștere</th>
                </tr>
              </thead>
              <tbody>
                {ISTORIC.map((row) => (
                  <tr key={row.perioada} className={row.recent ? "total-net" : "row-base"}>
                    <td>{row.perioada}</td>
                    <td>{fmt(row.brut)}</td>
                    <td>{fmt(row.net)}</td>
                    <td>{fmt(row.cost)}</td>
                    <td>{row.hg}</td>
                    <td>{row.crestere}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="source-note">
              Valorile nete sunt calculate fără facilitatea fiscală de 300/200 lei (introdusă în 2024 și menținută pentru salariul minim). Cu facilitate, netul efectiv este mai mare cu aproximativ 100–150 lei pe perioada de aplicare.
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
              <li>Monitorul Oficial nr. 196 din 13 martie 2026 — <strong>HG 146/2026</strong> privind salariul minim de la 1 iulie 2026</li>
              <li>Monitorul Oficial nr. 1185 din 28 noiembrie 2024 — <strong>HG 1506/2024</strong> privind salariul minim de la 1 ianuarie 2025</li>
              <li><strong>OUG 89/2025</strong> — facilitatea fiscală 300/200 lei pentru salariul minim</li>
              <li><strong>OUG 156/2024</strong> — eliminarea scutirilor fiscale IT, construcții, agroalimentar</li>
              <li><strong>HG 35/2025</strong> — mecanismul tehnic de stabilire a salariului minim (Directiva UE 2022/2041)</li>
              <li>Legea 53/2003 — Codul Muncii, art. 164 alin. (1) și art. 164^2</li>
              <li>Legea 227/2015 — Codul Fiscal, art. 77 (deducere personală)</li>
              <li>
                <a href="https://mmuncii.gov.ro" target="_blank" rel="noopener">Ministerul Muncii și Solidarității Sociale</a> · <a href="https://www.anaf.ro" target="_blank" rel="noopener">ANAF</a>
              </li>
            </ul>
            <p className="source-note">Pagină actualizată: 30 aprilie 2026.</p>
          </div>
        </section>

        {/* CTA */}
        <div className="cta-card">
          <h2>Calculează orice salariu net 2026</h2>
          <p>Folosește calculatorul nostru pentru a vedea exact ce primești în mână, ce reține statul și cât plătește angajatorul — pentru orice sumă brută.</p>
          <Link href="/" className="btn-cta">Mergi la calculator →</Link>
        </div>
      </main>
    </>
  );
}
