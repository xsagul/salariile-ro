// app/salariu-minim/page.tsx
// Server Component pur — zero JavaScript la client = SSR maxim, SEO maxim
// Stiluri migrate 100% în globals.css

import type { Metadata } from "next";
import Link from "next/link";

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Salariu Minim 2026: 4.050 lei (ian-iun) → 4.325 lei (iul-dec) | Net 2.574 / 2.699 lei",
  description: "Salariul minim brut în România 2026: 4.050 lei până în 30 iunie, 4.325 lei din 1 iulie (HG 146/2026). Calcul net, cost angajator și istoric.",
  keywords: ["salariu minim 2026", "salariu minim brut 2026", "salariu minim net 2026", "HG 146/2026"],
  alternates: { canonical: "https://salariile.ro/salariu-minim" },
};

// ─── Date factuale ───────────────────────────────────────────────────────────

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

// ─── Date structurate (JSON-LD) ─────────────────────────────────────────────

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
      author: { "@type": "Organization", name: "Salariile.ro", url: "https://salariile.ro" },
      mainEntityOfPage: "https://salariile.ro/salariu-minim",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
            "@type": "Question",
            name: "Cât este salariul minim brut în România în 2026?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Salariul minim brut în România în 2026 are două valori: 4.050 lei lunar (ian-iun) și 4.325 lei lunar (din 1 iulie) conform HG 146/2026."
            }
        }
        // ... restul de FAQ rămâne neschimbat în script
      ]
    }
  ]
};

// ─── Componenta paginii ─────────────────────────────────────────────────────

export default function SalariuMinimPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Salariu minim 2026</span>
          </nav>
          <h1>Salariu Minim <em>2026</em></h1>
          <p className="subtitle">
            Salariul minim brut în România 2026 are două valori: <strong>4.050 lei</strong> până în 30 iunie și <strong>4.325 lei</strong> din 1 iulie (HG 146/2026).
          </p>
          <div className="badges">
            <span className="badge">Ian–Iun: 4.050 lei brut</span>
            <span className="badge">Iul–Dec: 4.325 lei brut</span>
            <span className="badge">HG 146/2026</span>
          </div>
        </div>
      </section>

      <main>
        <section className="section-surface">
          <div className="container">
            <div className="grid-auto">
              {/* Semestrul I */}
              <article className="card card-accent">
                <div className="eyebrow">1 Ianuarie – 30 Iunie 2026</div>
                <div className="stat-rows">
                  <StatRow label="Salariu brut" value={`${fmt(4050)} lei`} lg />
                  <StatRow label="Salariu net" value={`${fmt(2574)} lei`} xl accent />
                  <div className="stat-divider" />
                  <StatRow label="Cost angajator" value={`${fmt(4134)} lei`} sm />
                  <StatRow label="Facilitate fiscală" value="300 lei netaxabili" sm accent bold />
                  <StatRow label="Tarif orar" value="24,496 lei/oră" sm />
                </div>
                <Link href="/calculator/calcul-salariu-net-4050-brut" className="chip">
                  Calculează detaliat 4.050 lei →
                </Link>
              </article>

              {/* Semestrul II */}
              <article className="card card-warn">
                <div className="card-head-row">
                  <div className="eyebrow" style={{marginBottom: 0}}>1 Iulie – 31 Decembrie 2026</div>
                  <span className="tag">NOU</span>
                </div>
                <div className="stat-rows">
                  <StatRow label="Salariu brut" value={`${fmt(4325)} lei`} lg />
                  <StatRow label="Salariu net" value={`${fmt(2699)} lei`} xl warn bold />
                  <div className="stat-divider" />
                  <StatRow label="Cost angajator" value={`${fmt(4418)} lei`} sm />
                  <StatRow label="Facilitate fiscală" value="200 lei netaxabili" sm warn bold />
                  <StatRow label="Tarif orar" value="25,949 lei/oră" sm />
                </div>
                <Link href="/calculator/calcul-salariu-net-4325-brut" className="chip chip-warn">
                  Calculează detaliat 4.325 lei →
                </Link>
              </article>
            </div>
            <p className="source-note text-center">
              Sursa: HG 146/2026 (Monitorul Oficial nr. 196/13 martie 2026), OUG 89/2025
            </p>
          </div>
        </section>

        <section className="article-section">
          <div className="container container-narrow">
            <article className="article">
              <h2>Ce este salariul minim brut pe economie</h2>
              <p>Salariul minim brut pe țară este suma minimă pe care un angajator are obligația legală să o plătească unui salariat cu normă întreagă.</p>
              <p>În 2026, salariul minim are două valori distincte: <strong>4.050 lei brut</strong> (S1) și <strong>4.325 lei brut</strong> (S2).</p>
            </article>

            <article className="article">
              <h2>Cum se calculează salariul minim net în 2026</h2>
              <p>Particularitatea anului 2026 este facilitatea fiscală: o sumă fixă din salariul minim este scutită de impozit și contribuții.</p>

              <div className="card mb-2">
                <h3 className="accent">Semestrul I: 4.050 lei brut → 2.574 lei net</h3>
                <div className="stat-rows">
                  <CalcRow label="Salariu brut" value="4.050,00 lei" bold />
                  <CalcRow label="Facilitate fiscală (OUG 89/2025)" value="−300,00 lei" accent />
                  <CalcRow label="CAS — pensie (25%)" value="−937,50 lei" danger />
                  <CalcRow label="CASS — sănătate (10%)" value="−375,00 lei" danger />
                  <CalcRow label="Impozit pe venit (10%)" value="−243,75 lei" danger />
                  <CalcRow label="Salariu net (în mână)" value="2.574,00 lei" total />
                </div>
              </div>

              <div className="card">
                <h3 className="warn">Semestrul II: 4.325 lei brut → ~2.699 lei net</h3>
                <div className="stat-rows">
                  <CalcRow label="Salariu brut" value="4.325,00 lei" bold />
                  <CalcRow label="Facilitate fiscală (OUG 89/2025)" value="−200,00 lei" warn />
                  <CalcRow label="CAS — pensie (25%)" value="−1.031,25 lei" danger />
                  <CalcRow label="CASS — sănătate (10%)" value="−412,50 lei" danger />
                  <CalcRow label="Impozit pe venit (10%)" value="−268,13 lei" danger />
                  <CalcRow label="Salariu net (în mână)" value="~2.699,00 lei" total warn />
                </div>
              </div>
            </article>

            <article className="article">
              <h2>Evoluția salariului minim în România</h2>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Perioadă</th>
                      <th className="right">Brut (lei)</th>
                      <th className="right">Net (lei)</th>
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
            </article>

            <div className="cta-card">
              <h2>Calculează orice salariu cu instrumentul nostru</h2>
              <p>Calculatorul nostru îți arată salariul net pentru orice sumă brută, cu opțiuni avansate.</p>
              <Link href="/" className="btn-cta">Mergi la Calculator →</Link>
            </div>

            <div className="card">
              <h3>Citește și</h3>
              <ul className="link-list">
                <li><Link href="/salariu-mediu">Salariul mediu în România 2026 →</Link></li>
                <li><Link href="/">Calculator general salariu net/brut →</Link></li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// ─── Helpers UI ──────────────────────────────────────────────────────────────

function StatRow({ label, value, lg, xl, accent, warn, sm, bold }: any) {
  let classes = "stat-row";
  if (lg) classes += " lg";
  if (xl) classes += " xl";
  if (sm) classes += " sm";
  return (
    <div className={classes}>
      <span>{label}</span>
      <strong className={`${accent ? "accent" : ""} ${warn ? "warn" : ""} ${bold ? "bold" : ""}`}>
        {value}
      </strong>
    </div>
  );
}

function CalcRow({ label, value, bold, danger, accent, warn, total }: any) {
  let classes = "calc-row";
  if (bold) classes += " bold";
  if (danger) classes += " danger";
  if (accent) classes += " accent";
  if (warn) classes += " warn";
  if (total) classes += " total";
  return (
    <div className={classes}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}