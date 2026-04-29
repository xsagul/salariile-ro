// app/salariu-mediu/page.tsx
// Server Component pur — SSR maxim, SEO maxim, zero JS la client

import type { Metadata } from "next";
import Link from "next/link";

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Salariu Mediu 2026: 9.195 lei brut | Prognoză și Impact (Plafoane)",
  description: "Câștigul salarial mediu brut în România pentru 2026 este prognozat la 9.195 lei (aprox. 5.378 lei net). Află istoricul și impactul asupra plafoanelor PFA și CASS.",
  alternates: { canonical: "https://salariile.ro/salariu-mediu" },
  openGraph: {
    title: "Salariu Mediu Brut și Net în România (2026)",
    description: "Valoarea salariului mediu brut pe economie prognozat pentru 2026 este de 9.195 lei. Vezi calculul complet și evoluția istorică.",
    url: "https://salariile.ro/salariu-mediu",
  },
};

// ─── Date Factuale (Surse: INS, CNSP, Legea Bugetului) ──────────────────────

const faqSalariuMediu = [
  {
    q: "Cât este salariul mediu brut în România în 2026?",
    a: "Conform prognozei Comisiei Naționale de Strategie și Prognoză (CNSP), câștigul salarial mediu brut estimat pentru anul 2026 este de 9.195 lei lunar."
  },
  {
    q: "Cât reprezintă salariul mediu net în mână în 2026?",
    a: "La un salariu mediu brut de 9.195 lei, angajatul primește un salariu net standard de aproximativ 5.378 lei, după reținerea taxelor (CAS 25%, CASS 10% și Impozit 10%)."
  },
  {
    q: "Cine stabilește salariul mediu brut pe economie?",
    a: "Valoarea utilizată oficial (pentru plafoane și ajutoare) este stabilită anual prin Legea bugetului asigurărilor sociale de stat, bazându-se pe estimările Institutului Național de Statistică și CNSP."
  },
  {
    q: "La ce se folosește salariul mediu brut pe economie?",
    a: "Acesta este un indicator macroeconomic esențial folosit pentru: calculul ajutorului de deces, stabilirea plafonului maxim pentru indemnizația de concediu de maternitate și calcularea diverselor penalități sau ajutoare de stat."
  },
  {
    q: "Salariul mediu afectează taxele PFA-urilor?",
    a: "Nu direct. Taxele (CAS și CASS) pentru PFA-uri și alte activități independente (inclusiv dividende) se calculează pe baza plafoanelor de 6, 12 sau 24 de salarii MINIME brute pe economie, nu pe baza salariului mediu."
  }
];

const ISTORIC_SALARIU_MEDIU = [
  { an: "2020", brut: 5429, lege: "Legea 6/2020" },
  { an: "2021", brut: 5380, lege: "Legea 16/2021" },
  { an: "2022", brut: 6095, lege: "Legea 318/2021" },
  { an: "2023", brut: 6789, lege: "Legea 369/2022" },
  { an: "2024", brut: 7567, lege: "Legea 422/2023" },
  { an: "2025", brut: 8597, lege: "Legea 313/2024" },
  { an: "2026", brut: 9195, lege: "Prognoză CNSP", highlight: true },
];

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

// ─── JSON-LD (Schema.org) ───────────────────────────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Salariu Mediu 2026", item: "https://salariile.ro/salariu-mediu" },
      ],
    },
    {
      "@type": "Article",
      headline: "Salariu Mediu Brut pe Economie 2026: 9.195 lei. Evoluție și Impact",
      author: { "@type": "Organization", name: "Salariile.ro", url: "https://salariile.ro" },
      mainEntityOfPage: "https://salariile.ro/salariu-mediu",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqSalariuMediu.map(item => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a }
      }))
    }
  ]
};

// ─── Pagina ──────────────────────────────────────────────────────────────────

export default function SalariuMediuPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero">
        <div className="container">
          <nav className="breadcrumb"><Link href="/">Acasă</Link><span>/</span><span>Salariu mediu 2026</span></nav>
          <h1>Salariu Mediu <em>2026</em></h1>
          <p className="subtitle">
            Câștigul salarial mediu brut estimat pentru 2026 este de <strong>9.195 lei</strong> (aprox. 5.378 lei net). Un indicator esențial pentru economia României.
          </p>
          <div className="badges">
            <span className="badge">Prognoză: 9.195 lei brut</span>
            <span className="badge">Evoluție: +6,9%</span>
          </div>
        </div>
      </section>

      <main>
        {/* Sumar Carduri */}
        <section className="section-surface">
          <div className="container">
            <div className="grid-auto">
              {/* Anul 2025 (Referința anterioară) */}
              <article className="card card-accent">
                <div className="eyebrow">Anul 2025 (Referință legală)</div>
                <div className="stat-rows">
                  <StatRow label="Salariu mediu brut" value={`${fmt(8597)} lei`} lg />
                  <StatRow label="Salariu net (aprox.)" value={`${fmt(5029)} lei`} xl accent bold />
                  <div className="stat-divider" />
                  <StatRow label="Bază legală" value="Legea 313/2024" sm />
                </div>
                <Link href="/calculator/calcul-salariu-net-8597-brut" className="chip">Calculează detaliat 8.597 lei →</Link>
              </article>

              {/* Anul 2026 (Prognoza) */}
              <article className="card card-warn">
                <div className="card-head-row"><div className="eyebrow">Anul 2026 (Prognoză)</div><span className="tag">ESTIMAT</span></div>
                <div className="stat-rows">
                  <StatRow label="Salariu mediu brut" value={`${fmt(9195)} lei`} lg />
                  <StatRow label="Salariu net (aprox.)" value={`${fmt(5378)} lei`} xl warn bold />
                  <div className="stat-divider" />
                  <StatRow label="Creștere față de 2025" value="+598 lei brut" sm warn bold />
                </div>
                <Link href="/calculator/calcul-salariu-net-9195-brut" className="chip chip-warn">Calculează detaliat 9.195 lei →</Link>
              </article>
            </div>
            <p className="source-note text-center">Sursa datelor 2026: Comisia Națională de Strategie și Prognoză (CNSP), Prognoza 2024-2028.</p>
          </div>
        </section>

        <section className="article-section">
          <div className="container container-narrow">
            
            <article className="article">
              <h2>Ce este salariul mediu brut utilizat la fundamentarea bugetului?</h2>
              <p>Spre deosebire de <strong>salariul minim</strong>, care obligă toți angajatorii să plătească o sumă minimă, <strong>salariul mediu brut</strong> este un indicator statistic și macroeconomic. Acesta reprezintă media veniturilor brute realizate de toți salariații din România.</p>
              <p>În fiecare an, Legea bugetului asigurărilor sociale de stat stabilește o valoare oficială a acestui indicator. Deși angajatorii nu sunt obligați să ofere acest salariu, valoarea lui dictează plafoanele pentru anumite ajutoare sociale și limite fiscale de stat.</p>
            </article>

            <article className="article">
              <h2>Calculul salariului mediu net (9.195 lei brut)</h2>
              <p>Pentru anul 2026, la valoarea prognozată de 9.195 lei, calculul standard al taxelor se prezintă astfel (fără deduceri personale sau scutiri specifice domeniilor IT/Construcții):</p>
              <div className="card mb-2">
                <h3 className="warn">Câștig mediu estimat 2026</h3>
                <div className="stat-rows">
                  <CalcRow label="Salariu brut" value="9.195,00 lei" bold />
                  <CalcRow label="CAS — pensie (25%)" value="−2.298,75 lei" danger />
                  <CalcRow label="CASS — sănătate (10%)" value="−919,50 lei" danger />
                  <CalcRow label="Impozit pe venit (10%)" value="−597,68 lei" danger />
                  <CalcRow label="Salariu net (în mână)" value="~5.378,00 lei" total warn />
                </div>
              </div>
            </article>

            <article className="article">
              <h2>La ce folosește acest indicator?</h2>
              <p>Valoarea oficială a salariului mediu brut pe economie are un impact direct în următoarele situații legale:</p>
              <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem", color: "var(--muted)" }}>
                <li><strong>Ajutorul de deces:</strong> Cuantumul ajutorului de deces acordat în cazul decesului asiguratului sau pensionarului este egal cu câștigul salarial mediu brut utilizat la fundamentarea bugetului asigurărilor sociale de stat (ex: 8.597 lei în 2025).</li>
                <li><strong>Concedii medicale:</strong> Baza maximă de calcul lunară pentru indemnizațiile de maternitate sau risc maternal nu poate depăși 12 salarii minime brute, însă în trecut și pentru anumite deduceri se făcea raportarea la salariul mediu.</li>
              </ul>
            </article>

            <article className="article">
              <h2>Evoluția salariului mediu brut (2020 – 2026)</h2>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead><tr><th>Anul</th><th className="right">Valoare Brută (lei)</th><th>Bază legală</th></tr></thead>
                  <tbody>
                    {ISTORIC_SALARIU_MEDIU.map((row) => (
                      <tr key={row.an} className={row.highlight ? "highlight" : ""}>
                        <td><strong>{row.an}</strong></td>
                        <td className="right">{fmt(row.brut)}</td>
                        <td className="muted text-xs">{row.lege}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            {/* SECȚIUNEA FAQ */}
            <article className="article">
              <h2>Întrebări frecvente despre salariul mediu</h2>
              <div className="faq-list">
                {faqSalariuMediu.map((item, index) => (
                  <details key={index} className="faq-item">
                    <summary>{item.q}</summary>
                    <p className="faq-answer">{item.a}</p>
                  </details>
                ))}
              </div>
            </article>

            <div className="cta-card">
              <h2>Analizează propriul salariu</h2>
              <p>Ești sub sau peste media națională? Folosește calculatorul nostru detaliat pentru a vedea exact unde se duc taxele tale.</p>
              <Link href="/" className="btn-cta">Calculează Salariul Tău →</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// ─── Helpers UI ──────────────────────────────────────────────────────────────

function StatRow({ label, value, lg, xl, accent, warn, sm, bold }: any) {
  let cls = "stat-row";
  if (lg) cls += " lg"; if (xl) cls += " xl"; if (sm) cls += " sm";
  return (
    <div className={cls}>
      <span>{label}</span>
      <strong className={`${accent ? "accent" : ""} ${warn ? "warn" : ""} ${bold ? "bold" : ""}`}>{value}</strong>
    </div>
  );
}

function CalcRow({ label, value, bold, danger, accent, warn, total }: any) {
  let cls = "calc-row";
  if (bold) cls += " bold"; if (danger) cls += " danger";
  if (accent) cls += " accent"; if (warn) cls += " warn"; if (total) cls += " total";
  return (
    <div className={cls}><span>{label}</span><strong>{value}</strong></div>
  );
}