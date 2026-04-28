// app/salariu-minim/page.tsx
// Server Component — FĂRĂ "use client"

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Salariu Minim 2026 România — 4.050 lei (ian–iun) și 4.325 lei (iul–dec)",
  description:
    "Salariul minim brut în România în 2026 este 4.050 lei (ian–iun) și 4.325 lei din iulie. Salariu net 2.574 lei, respectiv ~2.699 lei. Calcul complet, istoric și legislație.",
  alternates: {
    canonical: "https://salariile.ro/salariu-minim",
  },
  openGraph: {
    title: "Salariu Minim 2026 România — 4.050 lei și 4.325 lei",
    description:
      "Salariul minim în 2026 se modifică de două ori. Află valorile brut, net și costul angajatorului pentru ambele semestre.",
    url: "https://salariile.ro/salariu-minim",
  },
};

// Date istorice precise
const ISTORIC = [
  { an: "2019", brut: 2080, net: 1263, hg: "HG 937/2018" },
  { an: "2020", brut: 2230, net: 1346, hg: "HG 935/2019" },
  { an: "2021", brut: 2300, net: 1386, hg: "HG 4/2021" },
  { an: "2022", brut: 2550, net: 1524, hg: "HG 1071/2021" },
  { an: "ian 2023", brut: 3000, net: 1863, hg: "HG 1447/2022" },
  { an: "oct 2023", brut: 3300, net: 2079, hg: "HG 900/2023" },
  { an: "iul 2024", brut: 3700, net: 2363, hg: "HG 598/2024" },
  { an: "ian 2026", brut: 4050, net: 2574, hg: "HG 1506/2024", highlight: true },
  { an: "iul 2026", brut: 4325, net: 2699, hg: "HG 146/2026", highlight: true },
];

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

export default function SalariuMinimPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Cât este salariul minim în 2026?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Salariul minim brut în 2026 este de 4.050 lei (ianuarie–iunie) și 4.325 lei (iulie–decembrie), conform HG 1506/2024 și HG 146/2026. Salariul net corespunzător este de 2.574 lei, respectiv aproximativ 2.699 lei.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Cât este salariul minim net în 2026?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Salariul minim net în semestrul I 2026 (ianuarie–iunie) este de 2.574 lei, cu aplicarea facilității fiscale de 300 lei (OUG 89/2025). Din iulie 2026, la un brut de 4.325 lei și facilitate de 200 lei, salariul net devine aproximativ 2.699 lei.",
                  },
                },
                {
                  "@type": "Question",
                  name: "De când crește salariul minim în 2026?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Salariul minim crește de la 4.050 lei la 4.325 lei începând cu 1 iulie 2026, conform Hotărârii de Guvern nr. 146/2026, publicată în Monitorul Oficial nr. 196 din 13 martie 2026.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Cât plătește angajatorul pentru salariul minim?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Costul total pentru angajator la salariul minim este de 4.134 lei (semestrul I) și aproximativ 4.418 lei (din iulie 2026), incluzând contribuția asiguratorie pentru muncă (CAM) de 2,25%.",
                  },
                },
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: "Salariu Minim 2026 România — Brut, Net și Legislație",
              description:
                "Ghid complet despre salariul minim în România în 2026: valori brut și net pentru ambele semestre, istoric, facilități fiscale și obligații legale.",
              dateModified: new Date().toISOString(),
              publisher: {
                "@type": "Organization",
                name: "Salariile.ro",
                url: "https://salariile.ro",
              },
            },
          ]),
        }}
      />

      <div className="page">
        {/* Header */}
        <header className="site-header">
          <div className="container">
            <a href="/" className="logo">
              salariile<span>.ro</span>
            </a>
            <nav>
              <a href="/">Calculator</a>
              <a href="/salariu-minim" className="active">
                Salariu minim
              </a>
              <a href="/salariu-mediu">Salariu mediu</a>
              <a href="/noutati">Noutăți</a>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="hero">
          <div className="container">
            <div className="breadcrumb">
              <a href="/">Acasă</a>
              <span>/</span>
              <span>Salariu minim 2026</span>
            </div>
            <h1>
              Salariu Minim <em>2026</em>
            </h1>
            <p className="subtitle">
              Valorile oficiale brut și net, facilitate fiscală, cost angajator
              și istoricul complet — actualizat cu HG 146/2026.
            </p>
            <div className="badges">
              <span className="badge">Ian–Iun: 4.050 lei brut</span>
              <span className="badge">Iul–Dec: 4.325 lei brut</span>
              <span className="badge">HG 146/2026</span>
            </div>
          </div>
        </section>

        <main>
          {/* Carduri principale — cele 2 semestre */}
          <section style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "2rem 0" }}>
            <div className="container">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
                {/* Semestrul I */}
                <div className="card" style={{ borderTop: "3px solid var(--accent)" }}>
                  <div style={{ fontSize: "0.75rem", fontFamily: "system-ui", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.75rem" }}>
                    Ianuarie – 30 Iunie 2026
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.875rem", fontFamily: "system-ui", color: "var(--muted)" }}>Salariu brut</span>
                      <strong style={{ fontSize: "1.25rem", color: "var(--text)" }}>4.050 lei</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.875rem", fontFamily: "system-ui", color: "var(--muted)" }}>Salariu net</span>
                      <strong style={{ fontSize: "1.5rem", color: "var(--accent)" }}>2.574 lei</strong>
                    </div>
                    <div style={{ height: "1px", background: "var(--border)", margin: "0.25rem 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", color: "var(--muted)" }}>Cost angajator</span>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", fontWeight: 600 }}>4.134 lei</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", color: "var(--muted)" }}>Facilitate fiscală</span>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", color: "var(--accent)", fontWeight: 600 }}>300 lei netaxabili</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", color: "var(--muted)" }}>Tarif orar</span>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", fontWeight: 600 }}>24,496 lei/oră</span>
                    </div>
                  </div>
                  <a href="/calculator/calcul-salariu-net-4050-brut" style={{ display: "block", marginTop: "1rem", padding: "0.5rem", background: "var(--accent-light)", color: "var(--accent)", borderRadius: "6px", textAlign: "center", textDecoration: "none", fontSize: "0.8125rem", fontFamily: "system-ui", fontWeight: 600 }}>
                    Calculează detaliat →
                  </a>
                </div>

                {/* Semestrul II */}
                <div className="card" style={{ borderTop: "3px solid var(--warn)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.75rem", fontFamily: "system-ui", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>
                      1 Iulie – 31 Decembrie 2026
                    </div>
                    <span style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.6875rem", fontFamily: "system-ui", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>NOU</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.875rem", fontFamily: "system-ui", color: "var(--muted)" }}>Salariu brut</span>
                      <strong style={{ fontSize: "1.25rem", color: "var(--text)" }}>4.325 lei</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.875rem", fontFamily: "system-ui", color: "var(--muted)" }}>Salariu net</span>
                      <strong style={{ fontSize: "1.5rem", color: "var(--accent)" }}>~2.699 lei</strong>
                    </div>
                    <div style={{ height: "1px", background: "var(--border)", margin: "0.25rem 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", color: "var(--muted)" }}>Cost angajator</span>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", fontWeight: 600 }}>~4.418 lei</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", color: "var(--muted)" }}>Facilitate fiscală</span>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", color: "var(--warn)", fontWeight: 600 }}>200 lei netaxabili</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", color: "var(--muted)" }}>Tarif orar</span>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "system-ui", fontWeight: 600 }}>25,949 lei/oră</span>
                    </div>
                  </div>
                  <a href="/calculator/calcul-salariu-net-4325-brut" style={{ display: "block", marginTop: "1rem", padding: "0.5rem", background: "#fef3c7", color: "#92400e", borderRadius: "6px", textAlign: "center", textDecoration: "none", fontSize: "0.8125rem", fontFamily: "system-ui", fontWeight: 600 }}>
                    Calculează detaliat →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Continut informational */}
          <section style={{ padding: "3rem 0" }}>
            <div className="container" style={{ maxWidth: "860px" }}>

              {/* Cum se calculează */}
              <article style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
                  Cum se calculează salariul minim net în 2026
                </h2>
                <p style={{ color: "var(--muted)", fontFamily: "system-ui", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                  Din salariul minim brut de <strong style={{ color: "var(--text)" }}>4.050 lei</strong> se rețin contribuțiile obligatorii. 
                  Particularitatea anului 2026 este facilitatea fiscală (OUG 89/2025), care scutește de taxe o parte din salariu:
                </p>

                {/* Calcul detaliat S1 */}
                <div className="card" style={{ marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--accent)" }}>
                    Calcul salariu minim net — Semestrul I (ian–iun 2026)
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontFamily: "system-ui", fontSize: "0.875rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>Salariu brut</span>
                      <strong>4.050 lei</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>Facilitate fiscală (scutită de taxe)</span>
                      <strong style={{ color: "var(--accent)" }}>− 300 lei</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>Baza de calcul contribuții</span>
                      <strong>3.750 lei</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>CAS — pensie (25%)</span>
                      <strong style={{ color: "var(--danger)" }}>− 938 lei</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>CASS — sănătate (10%)</span>
                      <strong style={{ color: "var(--danger)" }}>− 375 lei</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>Deducere personală standard</span>
                      <strong style={{ color: "var(--accent)" }}>+ 810 lei</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)" }}>Impozit pe venit (10%)</span>
                      <strong style={{ color: "var(--danger)" }}>− 163 lei</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", fontWeight: 700, fontSize: "1rem" }}>
                      <span>Salariu net în mână</span>
                      <strong style={{ color: "var(--accent)", fontSize: "1.25rem" }}>2.574 lei</strong>
                    </div>
                  </div>
                </div>

                <div className="info-box">
                  <strong>Atenție:</strong> Din iulie 2026, facilitatea fiscală scade de la 300 lei la 200 lei, iar brutul crește la 4.325 lei.
                  Creșterea reală în mână este de aproximativ <strong>125 lei</strong>, nu 275 lei (diferența de brut).
                </div>
              </article>

              {/* Facilitate fiscala */}
              <article style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
                  Facilitatea fiscală pentru salariul minim în 2026
                </h2>
                <p style={{ color: "var(--muted)", fontFamily: "system-ui", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                  Prin OUG 89/2025, publicată în Monitorul Oficial nr. 1203 din 24 decembrie 2025, angajații cu salariul minim beneficiază de o sumă scutită de impozit și contribuții sociale:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="card" style={{ background: "var(--accent-light)", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "0.75rem", fontFamily: "system-ui", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", marginBottom: "0.5rem" }}>Ian–Iun 2026</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.03em" }}>300 lei</div>
                    <div style={{ fontSize: "0.8125rem", fontFamily: "system-ui", color: "var(--accent)", marginTop: "0.25rem" }}>scutiți de taxe/lună</div>
                  </div>
                  <div className="card" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
                    <div style={{ fontSize: "0.75rem", fontFamily: "system-ui", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#92400e", marginBottom: "0.5rem" }}>Iul–Dec 2026</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#92400e", letterSpacing: "-0.03em" }}>200 lei</div>
                    <div style={{ fontSize: "0.8125rem", fontFamily: "system-ui", color: "#92400e", marginTop: "0.25rem" }}>scutiți de taxe/lună</div>
                  </div>
                </div>
                <p style={{ color: "var(--muted)", fontFamily: "system-ui", fontSize: "0.875rem", lineHeight: 1.7 }}>
                  Facilitatea se aplică <strong style={{ color: "var(--text)" }}>doar dacă</strong>: contractul este cu normă întreagă, 
                  la funcția de bază, salariul de bază este exact salariul minim legal, și venitul brut lunar (fără tichete) 
                  nu depășește 4.300 lei (S1) respectiv 4.600 lei (S2).
                </p>
              </article>

              {/* Tabel istoric */}
              <article style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                  Evoluția salariului minim în România (2019–2026)
                </h2>
                <p style={{ color: "var(--muted)", fontFamily: "system-ui", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                  Salariul minim a crescut de la 2.080 lei în 2019 la 4.325 lei în iulie 2026 — o majorare de <strong style={{ color: "var(--text)" }}>+108%</strong> în 7 ani.
                </p>
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "system-ui", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ background: "var(--bg)" }}>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "var(--muted)", fontSize: "0.8125rem" }}>Perioadă</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, color: "var(--muted)", fontSize: "0.8125rem" }}>Brut</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, color: "var(--muted)", fontSize: "0.8125rem" }}>Net</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "var(--muted)", fontSize: "0.8125rem", display: "table-cell" } as React.CSSProperties}>Bază legală</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ISTORIC.map((r, i) => (
                        <tr
                          key={r.an}
                          style={{
                            borderTop: "1px solid var(--border)",
                            background: r.highlight ? "var(--accent-light)" : i % 2 === 0 ? "var(--surface)" : "var(--bg)",
                          }}
                        >
                          <td style={{ padding: "0.75rem 1rem", fontWeight: r.highlight ? 600 : 400, color: r.highlight ? "var(--accent)" : "var(--text)" }}>
                            {r.an}
                          </td>
                          <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>
                            {fmt(r.brut)} lei
                          </td>
                          <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--accent)", fontWeight: r.highlight ? 700 : 400 }}>
                            {fmt(r.net)} lei
                          </td>
                          <td style={{ padding: "0.75rem 1rem", color: "var(--muted)", fontSize: "0.8125rem" }}>
                            {r.hg}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              {/* Obligatii angajatori */}
              <article style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
                  Obligații pentru angajatori de la 1 iulie 2026
                </h2>
                <p style={{ color: "var(--muted)", fontFamily: "system-ui", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                  Conform <strong style={{ color: "var(--text)" }}>HG 146/2026</strong> (MO nr. 196/13 martie 2026), angajatorii sunt obligați să majoreze salariile angajaților plătiți la nivelul minimului. Pașii necesari:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { nr: "1", text: "Identificați toți angajații cu salariu de bază egal cu 4.050 lei" },
                    { nr: "2", text: "Emiteți acte adiționale la contractele individuale de muncă cu noul salariu de 4.325 lei" },
                    { nr: "3", text: "Înregistrați modificările în REGES (ReviSal) cu cel târziu 20 de zile lucrătoare de la 1 iulie 2026" },
                    { nr: "4", text: "Actualizați statele de plată și calculul contribuțiilor sociale" },
                  ].map((item) => (
                    <div key={item.nr} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, fontFamily: "system-ui", flexShrink: 0 }}>
                        {item.nr}
                      </div>
                      <p style={{ color: "var(--muted)", fontFamily: "system-ui", fontSize: "0.9375rem", lineHeight: 1.6, paddingTop: "3px" }}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="info-box" style={{ marginTop: "1.25rem" }}>
                  Nerespectarea termenului de înregistrare în REGES poate atrage <strong>sancțiuni contravenționale</strong> din partea Inspectoratului Teritorial de Muncă.
                </div>
              </article>

              {/* FAQ */}
              <article style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1.25rem" }}>
                  Întrebări frecvente
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    {
                      q: "Cât este salariul minim pe oră în 2026?",
                      a: "Tariful orar la salariul minim este de 24,496 lei/oră (ian–iun, pentru 165,334 ore/lună) și 25,949 lei/oră (iul–dec, pentru 166,667 ore/lună).",
                    },
                    {
                      q: "Există salariu minim diferit în construcții în 2026?",
                      a: "Nu. Începând cu 1 ianuarie 2025, salariul minim în construcții este același cu cel general (4.050 lei), după ce facilitățile sectoriale specifice au fost eliminate. Angajații din construcții beneficiază însă de scutire de impozit pe venit pentru brut până la 10.000 lei.",
                    },
                    {
                      q: "Câți angajați primesc salariul minim în România?",
                      a: "Conform datelor Ministerului Muncii, de majorarea la 4.325 lei vor beneficia aproximativ 1.759.027 de salariați, reprezentând o parte semnificativă din forța de muncă activă.",
                    },
                    {
                      q: "Se poate negocia un salariu sub minimul legal?",
                      a: "Nu. Angajatorul nu poate stabili prin contract individual de muncă un salariu de bază inferior salariului minim brut garantat în plată, conform Codului Muncii (Legea 53/2003).",
                    },
                    {
                      q: "Tichete de masă se adaugă la salariul minim?",
                      a: "Da. Tichetele de masă sunt beneficii extrasalariale și nu fac parte din salariul de bază. Un angajat poate primi salariul minim plus tichete de masă. Atenție: valoarea tichetelor se ia în calcul la stabilirea plafonului de venit pentru facilitatea fiscală.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="card" style={{ padding: "1.25rem" }}>
                      <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>{item.q}</h3>
                      <p style={{ color: "var(--muted)", fontFamily: "system-ui", fontSize: "0.875rem", lineHeight: 1.65 }}>{item.a}</p>
                    </div>
                  ))}
                </div>
              </article>

              {/* CTA Calculator */}
              <div className="card net-card" style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ opacity: 0.9, fontFamily: "system-ui", marginBottom: "0.75rem", fontSize: "1rem" }}>
                  Calculează exact cât primești în mână
                </p>
                <p style={{ opacity: 0.75, fontFamily: "system-ui", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                  Calculatorul nostru ține cont de deducerea personală, tichete de masă, vârstă sub 26 ani și facilități IT/construcții
                </p>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <a
                    href="/calculator/calcul-salariu-net-4050-brut"
                    style={{ background: "white", color: "var(--accent)", padding: "0.75rem 1.5rem", borderRadius: "8px", textDecoration: "none", fontFamily: "system-ui", fontWeight: 700, fontSize: "0.9375rem" }}
                  >
                    Calculator 4.050 lei brut →
                  </a>
                  <a
                    href="/calculator/calcul-salariu-net-4325-brut"
                    style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "0.75rem 1.5rem", borderRadius: "8px", textDecoration: "none", fontFamily: "system-ui", fontWeight: 600, fontSize: "0.9375rem", border: "1px solid rgba(255,255,255,0.3)" }}
                  >
                    Calculator 4.325 lei brut →
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="site-footer">
          <div className="container">
            <div className="footer-top">
              <a href="/" className="logo">salariile<span>.ro</span></a>
              <p>
                Informații și instrumente despre salariile din România.<br />
                Calculele au caracter orientativ. Consultați un specialist contabil pentru situații complexe.
              </p>
            </div>
            <div className="footer-links">
              <div>
                <h4>Calculatoare</h4>
                <a href="/">Calculator salariu net</a>
                <a href="/calculator-pfa">Calculator PFA</a>
                <a href="/calculator-concediu">Calculator concediu</a>
              </div>
              <div>
                <h4>Informații</h4>
                <a href="/salariu-minim">Salariu minim 2026</a>
                <a href="/salariu-mediu">Salariu mediu 2026</a>
                <a href="/noutati">Noutăți legislative</a>
              </div>
              <div>
                <h4>Legal</h4>
                <a href="/politica-confidentialitate">Politică confidențialitate</a>
                <a href="/termeni">Termeni și condiții</a>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2026 Salariile.ro — Actualizat conform HG 146/2026</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
