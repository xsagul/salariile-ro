// app/salariu-minim/page.tsx
// Server Component pur — zero JavaScript la client = SSR maxim, SEO maxim
// Date verificate: HG 146/2026 (MO 196/13.03.2026) + OUG 89/2025

import type { Metadata } from "next";
import Link from "next/link";

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:
    "Salariu Minim 2026: 4.050 lei (ian-iun) → 4.325 lei (iul-dec) | Net 2.574 / 2.699 lei",
  description:
    "Salariul minim brut în România 2026: 4.050 lei până în 30 iunie, 4.325 lei din 1 iulie (HG 146/2026). Calcul net 2.574 / 2.699 lei, cost angajator, deducere fiscală 300/200 lei și istoric complet.",
  keywords: [
    "salariu minim 2026",
    "salariu minim brut 2026",
    "salariu minim net 2026",
    "salariu minim iulie 2026",
    "4325 lei net",
    "4050 lei net",
    "HG 146/2026",
    "salariu minim construcții 2026",
  ],
  alternates: { canonical: "https://salariile.ro/salariu-minim" },
  openGraph: {
    type: "article",
    locale: "ro_RO",
    title: "Salariu Minim 2026: 4.050 → 4.325 lei | Calcul Complet",
    description:
      "Salariul minim crește la 4.325 lei din 1 iulie 2026 (HG 146/2026). Vezi calculul net, cost angajator și impactul pentru ambele semestre.",
    url: "https://salariile.ro/salariu-minim",
    publishedTime: "2026-01-01T00:00:00.000Z",
    modifiedTime: new Date().toISOString(),
    authors: ["Salariile.ro"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Salariu Minim 2026: 4.050 → 4.325 lei",
    description:
      "Calculul complet pentru salariul minim în 2026, ambele semestre. HG 146/2026.",
  },
};

// ─── Datele FAQ (Sursa unică pentru SEO și UI) ───────────────────────────────

const faqSalariuMinim = [
  {
    q: "Cât este salariul minim brut în România în 2026?",
    a: "Salariul minim brut în România în 2026 are două valori: 4.050 lei lunar pentru perioada 1 ianuarie - 30 iunie 2026 (conform HG 1506/2024) și 4.325 lei lunar începând cu 1 iulie 2026 (conform HG 146/2026, publicată în Monitorul Oficial nr. 196 din 13 martie 2026)."
  },
  {
    q: "Cât rămâne net la salariul minim în 2026?",
    a: "În semestrul I 2026 (ian-iun), salariul minim net este 2.574 lei, cu aplicarea facilității fiscale de 300 lei. Din 1 iulie 2026, la un brut de 4.325 lei și facilitate redusă la 200 lei, salariul net devine aproximativ 2.699 lei. Creșterea netă pe lună este de 125 lei față de prima jumătate a anului."
  },
  {
    q: "Când crește salariul minim în 2026 și cu cât?",
    a: "Salariul minim brut crește de la 4.050 lei la 4.325 lei începând cu 1 iulie 2026, conform Hotărârii de Guvern nr. 146/2026. Creșterea brută este de 275 lei (+6,8%), însă creșterea netă reală pentru angajat este de aproximativ 125 lei, deoarece facilitatea fiscală scade de la 300 la 200 lei (OUG 89/2025)."
  },
  {
    q: "Cât plătește total angajatorul pentru un salariu minim în 2026?",
    a: "Costul total al angajatorului pentru un salariu minim este de 4.134 lei pe lună în semestrul I 2026 (4.050 brut + CAM 2,25%) și de aproximativ 4.418 lei începând cu 1 iulie 2026 (4.325 brut + CAM 2,25%). Diferența pentru angajator este de 284 lei suplimentari pe angajat lunar."
  },
  {
    q: "Care este salariul minim în construcții în 2026?",
    a: "Salariul minim brut în sectorul construcțiilor rămâne 4.582 lei în 2026, conform OUG 156/2024, fără modificări prin HG 146/2026. Această valoare nu este afectată de creșterea generală a salariului minim din iulie 2026."
  },
  {
    q: "Ce este facilitatea fiscală de 300/200 lei pentru salariul minim?",
    a: "Facilitatea fiscală reglementată de OUG 89/2025 scutește de impozit pe venit și contribuții sociale o sumă fixă din salariul minim: 300 lei/lună în perioada 1 ianuarie - 30 iunie 2026 și 200 lei/lună în perioada 1 iulie - 31 decembrie 2026. Se aplică doar salariaților cu funcție de bază, normă întreagă, plătiți la nivelul exact al salariului minim brut."
  },
  {
    q: "Pot fi angajat legal sub salariul minim pe economie?",
    a: "Nu. Conform Codului Muncii (art. 164), angajatorul are obligația legală de a plăti minimum salariul minim brut pe țară pentru un program de muncă cu normă întreagă. Excepție fac contractele part-time, unde valoarea se calculează proporțional cu orele lucrate. Sancțiunile pentru încălcare pot ajunge la 5.000-8.000 lei pentru angajator."
  },
  {
    q: "Salariul minim influențează plafoanele PFA în 2026?",
    a: "Pentru calculul plafoanelor CAS și CASS la veniturile din activități independente (PFA, dividende) în anul 2026 se folosește salariul minim brut în vigoare la 1 ianuarie 2026, respectiv 4.050 lei. Majorarea de la 1 iulie 2026 la 4.325 lei NU afectează plafoanele PFA pentru 2026."
  }
];

const ISTORIC_SALARIU_MINIM = [
  { perioada: "2019", brut: 2080, net: 1263, hg: "HG 937/2018" },
  { perioada: "2020", brut: 2230, net: 1346, hg: "HG 935/2019" },
  { perioada: "2021", brut: 2300, net: 1386, hg: "HG 4/2021" },
  { perioada: "2022", brut: 2550, net: 1524, hg: "HG 1071/2021" },
  { perioada: "ian 2023", brut: 3000, net: 1863, hg: "HG 1447/2022" },
  { perioada: "oct 2023", brut: 3300, net: 2079, hg: "HG 900/2023" },
  { perioada: "iul 2024", brut: 3700, net: 2363, hg: "HG 598/2024" },
  { perioada: "ian 2025 → iun 2026", brut: 4050, net: 2574, hg: "HG 1506/2024" },
  { perioada: "iul 2026", brut: 4325, net: 2699, hg: "HG 146/2026", highlight: true },
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
        { "@type": "ListItem", position: 2, name: "Salariu Minim 2026", item: "https://salariile.ro/salariu-minim" },
      ],
    },
    {
      "@type": "Article",
      headline: "Salariu Minim 2026 în România: 4.050 → 4.325 lei. Calcul Complet, Net și Legislație",
      description: "Ghid complet despre salariul minim în România 2026: valori brut și net pentru ambele semestre (4.050 lei ian-iun, 4.325 lei iul-dec), HG 146/2026, OUG 89/2025, cost angajator și istoric.",
      datePublished: "2026-01-01T00:00:00.000Z",
      dateModified: new Date().toISOString(),
      author: { "@type": "Organization", name: "Salariile.ro", url: "https://salariile.ro" },
      publisher: { "@type": "Organization", name: "Salariile.ro", url: "https://salariile.ro" },
      mainEntityOfPage: "https://salariile.ro/salariu-minim",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqSalariuMinim.map(item => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a }
      }))
    }
  ]
};

// ─── Pagina ──────────────────────────────────────────────────────────────────

export default function SalariuMinimPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero">
        <div className="container">
          <nav className="breadcrumb"><Link href="/">Acasă</Link><span>/</span><span>Salariu minim 2026</span></nav>
          <h1>Salariu Minim <em>2026</em></h1>
          <p className="subtitle">
            Salariul minim brut în România 2026 are două valori: <strong>4.050 lei</strong> până în 30 iunie și <strong>4.325 lei</strong> din 1 iulie (HG 146/2026). Calcul complet net, cost angajator și legislație actualizată.
          </p>
          <div className="badges">
            <span className="badge">Ian–Iun: 4.050 lei brut</span>
            <span className="badge">Iul–Dec: 4.325 lei brut</span>
            <span className="badge">HG 146/2026</span>
            <span className="badge">OUG 89/2025</span>
          </div>
        </div>
      </section>

      <main>
        {/* ─── Carduri sumare semestre ──────────────────────────────────── */}
        <section className="section-surface">
          <div className="container">
            <div className="grid-auto">
              {/* S1 */}
              <article className="card card-accent">
                <div className="eyebrow">1 Ianuarie – 30 Iunie 2026</div>
                <div className="stat-rows">
                  <StatRow label="Salariu brut" value={`${fmt(4050)} lei`} lg />
                  <StatRow label="Salariu net" value={`${fmt(2574)} lei`} xl accent bold />
                  <div className="stat-divider" />
                  <StatRow label="Cost angajator" value={`${fmt(4134)} lei`} sm />
                  <StatRow label="Facilitate fiscală" value="300 lei netaxabili" sm accent bold />
                  <StatRow label="Tarif orar" value="24,496 lei/oră" sm />
                </div>
                <Link href="/calculator/calcul-salariu-net-4050-brut" className="chip">Calculează detaliat 4.050 lei →</Link>
              </article>
              {/* S2 */}
              <article className="card card-warn">
                <div className="card-head-row"><div className="eyebrow">1 Iulie – 31 Decembrie 2026</div><span className="tag">NOU</span></div>
                <div className="stat-rows">
                  <StatRow label="Salariu brut" value={`${fmt(4325)} lei`} lg />
                  <StatRow label="Salariu net" value={`${fmt(2699)} lei`} xl warn bold />
                  <div className="stat-divider" />
                  <StatRow label="Cost angajator" value={`${fmt(4418)} lei`} sm />
                  <StatRow label="Facilitate fiscală" value="200 lei netaxabili" sm warn bold />
                  <StatRow label="Tarif orar" value="25,949 lei/oră" sm />
                </div>
                <Link href="/calculator/calcul-salariu-net-4325-brut" className="chip chip-warn">Calculează detaliat 4.325 lei →</Link>
              </article>
            </div>
            <p className="source-note text-center">Sursa: HG 146/2026 (Monitorul Oficial nr. 196/13 martie 2026), OUG 89/2025</p>
          </div>
        </section>

        {/* ─── Conținut text bogat ──────────────────────────────────────── */}
        <section className="article-section">
          <div className="container container-narrow">

            {/* Ce este salariul minim */}
            <article className="article">
              <h2>Ce este salariul minim brut pe economie</h2>
              <p>
                Salariul minim brut pe țară este suma minimă pe care un angajator are obligația legală să o plătească unui salariat cu normă întreagă (166,667 ore lunar de la 1 iulie 2026). Reglementat prin Codul Muncii (art. 164) și actualizat anual sau semestrial prin Hotărâri de Guvern, are rolul de a proteja puterea de cumpărare a angajaților cu venituri reduse.
              </p>
              <p>
                În 2026, salariul minim are două valori distincte: <strong>4.050 lei brut</strong> în prima jumătate a anului (conform HG 1506/2024) și <strong>4.325 lei brut</strong> în a doua jumătate, începând cu 1 iulie 2026 (conform HG 146/2026, publicată în Monitorul Oficial nr. 196 din 13 martie 2026). De majorarea de la 1 iulie vor beneficia aproximativ 1.759.027 de salariați, conform datelor oficiale ale Ministerului Muncii.
              </p>
            </article>

            {/* Calcul detaliat */}
            <article className="article">
              <h2>Cum se calculează salariul minim net în 2026</h2>
              <p>
                Particularitatea anului 2026 este facilitatea fiscală introdusă prin OUG 89/2025: o sumă fixă din salariul minim este scutită de impozit și contribuții sociale. Suma diferă între cele două semestre — 300 lei până în iunie, apoi 200 lei.
              </p>

              {/* Calcul S1 */}
              <div className="card mb-2">
                <h3 className="accent">Semestrul I: 4.050 lei brut → 2.574 lei net</h3>
                <div className="stat-rows">
                  <CalcRow label="Salariu brut" value="4.050,00 lei" bold />
                  <CalcRow label="Facilitate fiscală (OUG 89/2025) — netaxabilă" value="−300,00 lei" accent />
                  <CalcRow label="Bază de calcul contribuții" value="3.750,00 lei" />
                  <CalcRow label="CAS — pensie (25%)" value="−937,50 lei" danger />
                  <CalcRow label="CASS — sănătate (10%)" value="−375,00 lei" danger />
                  <CalcRow label="Bază impozabilă" value="2.437,50 lei" />
                  <CalcRow label="Impozit pe venit (10%)" value="−243,75 lei" danger />
                  <CalcRow label="Adăugare 300 lei facilitate (necontribuit)" value="+300,00 lei" accent />
                  <CalcRow label="Salariu net (în mână)" value="2.574,00 lei" total />
                </div>
              </div>

              {/* Calcul S2 */}
              <div className="card">
                <h3 className="warn">Semestrul II: 4.325 lei brut → ~2.699 lei net</h3>
                <div className="stat-rows">
                  <CalcRow label="Salariu brut" value="4.325,00 lei" bold />
                  <CalcRow label="Facilitate fiscală (redusă la 200 lei) — netaxabilă" value="−200,00 lei" warn />
                  <CalcRow label="Bază de calcul contribuții" value="4.125,00 lei" />
                  <CalcRow label="CAS — pensie (25%)" value="−1.031,25 lei" danger />
                  <CalcRow label="CASS — sănătate (10%)" value="−412,50 lei" danger />
                  <CalcRow label="Bază impozabilă" value="2.681,25 lei" />
                  <CalcRow label="Impozit pe venit (10%)" value="−268,13 lei" danger />
                  <CalcRow label="Adăugare 200 lei facilitate (necontribuit)" value="+200,00 lei" warn />
                  <CalcRow label="Salariu net (în mână)" value="~2.699,00 lei" total warn />
                </div>
              </div>

              <p className="source-note">
                Notă: valorile pot diferi cu câțiva lei din cauza rotunjirilor. Calculul folosit de programele oficiale poate produce 2.699 lei, 2.700 lei sau valori apropiate.
              </p>
            </article>

            {/* Cost angajator */}
            <article className="article">
              <h2>Cât plătește total angajatorul în 2026</h2>
              <p>
                Pe lângă salariul brut, angajatorul mai plătește o singură contribuție: <strong>CAM (Contribuția Asiguratorie pentru Muncă)</strong>, în cotă de <strong>2,25%</strong> aplicată salariului brut. CAM nu afectează salariul net al angajatului — este un cost suportat exclusiv de firmă.
              </p>

              <div className="grid-auto-sm mb-2">
                <div className="cost-box muted-bg">
                  <div className="eyebrow">Sem. I (ian-iun)</div>
                  Brut: <strong>4.050 lei</strong><br />
                  CAM (2,25%): <strong>+91,13 lei</strong><br />
                  <span className="total accent">Cost total: 4.134 lei</span>
                </div>

                <div className="cost-box warn-bg">
                  <div className="eyebrow">Sem. II (iul-dec)</div>
                  Brut: <strong>4.325 lei</strong><br />
                  CAM (2,25%): <strong>+97,31 lei</strong><br />
                  <span className="total warn">Cost total: ~4.418 lei</span>
                </div>
              </div>

              <p>
                Pentru o firmă cu 10 angajați la salariul minim, costul lunar suplimentar de la 1 iulie 2026 este de aproximativ <strong>2.840 lei</strong>, iar pe semestrul II impactul total depășește <strong>17.000 lei</strong>.
              </p>
            </article>

            {/* Construcții */}
            <article className="article">
              <h2>Salariul minim în construcții 2026</h2>
              <p>
                Sectorul construcțiilor are un salariu minim brut diferit, stabilit la <strong>4.582 lei</strong> pentru întregul an 2026, conform OUG 156/2024. Această valoare a fost menținută la nivelul din 2024 și <strong>nu este afectată de HG 146/2026</strong>, care se aplică doar salariului minim general.
              </p>
              <p>
                Important: începând cu 1 ianuarie 2025, au fost <strong>eliminate facilitățile fiscale</strong> care existau anterior pentru sectoarele construcții, IT și agricultură/industrie alimentară. În consecință, un angajat în construcții cu salariul minim de 4.582 lei brut ajunge la un net de aproximativ <strong>2.739 lei</strong>, semnificativ mai puțin decât în 2024.
              </p>
            </article>

            {/* Istoric */}
            <article className="article">
              <h2>Evoluția salariului minim în România (2019 – 2026)</h2>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Perioadă</th>
                      <th className="right">Brut (lei)</th>
                      <th className="right">Net aprox. (lei)</th>
                      <th>Bază legală</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ISTORIC_SALARIU_MINIM.map((row) => (
                      <tr key={row.perioada} className={row.highlight ? "highlight" : ""}>
                        <td>{row.perioada}</td>
                        <td className="right">{fmt(row.brut)}</td>
                        <td className="right">{fmt(row.net)}</td>
                        <td className="muted text-xs">{row.hg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="source-note">
                Sursa: Hotărâri de Guvern publicate în Monitorul Oficial. Valorile nete sunt estimative, calculate pentru un angajat cu funcție de bază, normă întreagă, fără persoane în întreținere.
              </p>
            </article>

            {/* Obligații angajatori */}
            <article className="article">
              <h2>Obligații pentru angajatori la majorarea din iulie 2026</h2>
              <p>
                Angajatorii care au salariați plătiți la nivelul salariului minim trebuie să actualizeze contractele individuale de muncă și să raporteze schimbarea în <strong>REGES-Online</strong> cel târziu până la <strong>28 iulie 2026</strong>. Neîndeplinirea la timp poate atrage amenzi între 5.000 și 8.000 lei.
              </p>
              <p>
                Pentru salariații menținuți la nivelul minim mai mult de 24 de luni de la semnarea contractului, angajatorul are obligația suplimentară de a renegocia salariul la un nivel superior celui minim, conform Legii nr. 283/2024 privind stabilirea salariilor minime adecvate.
              </p>
            </article>

            {/* FAQ */}
            <article className="article">
              <h2>Întrebări frecvente despre salariul minim 2026</h2>
              <div className="faq-list">
                {faqSalariuMinim.map((item, index) => (
                  <details key={index} className="faq-item">
                    <summary>{item.q}</summary>
                    <p className="faq-answer">{item.a}</p>
                  </details>
                ))}
              </div>
            </article>

            {/* CTA */}
            <div className="cta-card">
              <h2>Calculează orice salariu cu instrumentul nostru</h2>
              <p>
                Calculatorul nostru îți arată salariul net pentru orice sumă brută, cu opțiuni pentru IT, construcții, persoane în întreținere și tichete de masă.
              </p>
              <Link href="/" className="btn-cta">Mergi la Calculator →</Link>
            </div>

            {/* Linkuri interne — Citește și */}
            <div className="card">
              <h3>Citește și</h3>
              <ul className="link-list">
                <li>
                  <Link href="/salariu-mediu">
                    Salariul mediu în România 2026 — date INS și statistici →
                  </Link>
                </li>
                <li>
                  <Link href="/calculator/calcul-salariu-net-4050-brut">
                    Calcul detaliat: 4.050 lei brut → net (semestrul I) →
                  </Link>
                </li>
                <li>
                  <Link href="/calculator/calcul-salariu-net-4325-brut">
                    Calcul detaliat: 4.325 lei brut → net (semestrul II) →
                  </Link>
                </li>
                <li>
                  <Link href="/">
                    Calculator general salariu net/brut →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// ─── Helpers UI ──────────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  lg,
  xl,
  accent,
  warn,
  sm,
  bold,
}: {
  label: string;
  value: string;
  lg?: boolean;
  xl?: boolean;
  accent?: boolean;
  warn?: boolean;
  sm?: boolean;
  bold?: boolean;
}) {
  let cls = "stat-row";
  if (lg) cls += " lg";
  if (xl) cls += " xl";
  if (sm) cls += " sm";
  return (
    <div className={cls}>
      <span>{label}</span>
      <strong className={`${accent ? "accent" : ""} ${warn ? "warn" : ""} ${bold ? "bold" : ""}`.trim()}>
        {value}
      </strong>
    </div>
  );
}

function CalcRow({
  label,
  value,
  bold,
  danger,
  accent,
  warn,
  total,
}: {
  label: string;
  value: string;
  bold?: boolean;
  danger?: boolean;
  accent?: boolean;
  warn?: boolean;
  total?: boolean;
}) {
  let cls = "calc-row";
  if (bold) cls += " bold";
  if (danger) cls += " danger";
  if (accent) cls += " accent";
  if (warn) cls += " warn";
  if (total) cls += " total";
  return (
    <div className={cls}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
