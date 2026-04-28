// app/salariu-minim/page.tsx
// Server Component pur — zero JavaScript la client = SSR maxim, SEO maxim
// Date verificate: HG 146/2026 (MO 196/13.03.2026) + OUG 89/2025

import type { Metadata } from "next";
import Link from "next/link";

// ─── Metadata SEO optimizat ──────────────────────────────────────────────────

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
  alternates: {
    canonical: "https://salariile.ro/salariu-minim",
  },
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

// ─── Date factuale (verificate la surse oficiale) ───────────────────────────

type IstoricRow = {
  perioada: string;
  brut: number;
  net: number;
  hg: string;
  highlight?: boolean;
};

const ISTORIC_SALARIU_MINIM: IstoricRow[] = [
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
        {
          "@type": "ListItem",
          position: 2,
          name: "Salariu Minim 2026",
          item: "https://salariile.ro/salariu-minim",
        },
      ],
    },
    {
      "@type": "Article",
      headline:
        "Salariu Minim 2026 în România: 4.050 → 4.325 lei. Calcul Complet, Net și Legislație",
      description:
        "Ghid complet despre salariul minim în România 2026: valori brut și net pentru ambele semestre (4.050 lei ian-iun, 4.325 lei iul-dec), HG 146/2026, OUG 89/2025, cost angajator și istoric.",
      datePublished: "2026-01-01T00:00:00.000Z",
      dateModified: new Date().toISOString(),
      author: {
        "@type": "Organization",
        name: "Salariile.ro",
        url: "https://salariile.ro",
      },
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        url: "https://salariile.ro",
      },
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
            text:
              "Salariul minim brut în România în 2026 are două valori: 4.050 lei lunar pentru perioada 1 ianuarie - 30 iunie 2026 (conform HG 1506/2024) și 4.325 lei lunar începând cu 1 iulie 2026 (conform HG 146/2026, publicată în Monitorul Oficial nr. 196 din 13 martie 2026).",
          },
        },
        {
          "@type": "Question",
          name: "Cât rămâne net la salariul minim în 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "În semestrul I 2026 (ian-iun), salariul minim net este 2.574 lei, cu aplicarea facilității fiscale de 300 lei. Din 1 iulie 2026, la un brut de 4.325 lei și facilitate redusă la 200 lei, salariul net devine aproximativ 2.699 lei. Creșterea netă pe lună este de 125 lei față de prima jumătate a anului.",
          },
        },
        {
          "@type": "Question",
          name: "Când crește salariul minim în 2026 și cu cât?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Salariul minim brut crește de la 4.050 lei la 4.325 lei începând cu 1 iulie 2026, conform Hotărârii de Guvern nr. 146/2026. Creșterea brută este de 275 lei (+6,8%), însă creșterea netă reală pentru angajat este de aproximativ 125 lei, deoarece facilitatea fiscală scade de la 300 la 200 lei (OUG 89/2025).",
          },
        },
        {
          "@type": "Question",
          name: "Cât plătește total angajatorul pentru un salariu minim în 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Costul total al angajatorului pentru un salariu minim este de 4.134 lei pe lună în semestrul I 2026 (4.050 brut + CAM 2,25%) și de aproximativ 4.418 lei începând cu 1 iulie 2026 (4.325 brut + CAM 2,25%). Diferența pentru angajator este de 284 lei suplimentari pe angajat lunar.",
          },
        },
        {
          "@type": "Question",
          name: "Care este salariul minim în construcții în 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Salariul minim brut în sectorul construcțiilor rămâne 4.582 lei în 2026, conform OUG 156/2024, fără modificări prin HG 146/2026. Această valoare nu este afectată de creșterea generală a salariului minim din iulie 2026.",
          },
        },
        {
          "@type": "Question",
          name: "Ce este facilitatea fiscală de 300/200 lei pentru salariul minim?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Facilitatea fiscală reglementată de OUG 89/2025 scutește de impozit pe venit și contribuții sociale o sumă fixă din salariul minim: 300 lei/lună în perioada 1 ianuarie - 30 iunie 2026 și 200 lei/lună în perioada 1 iulie - 31 decembrie 2026. Se aplică doar salariaților cu funcție de bază, normă întreagă, plătiți la nivelul exact al salariului minim brut.",
          },
        },
        {
          "@type": "Question",
          name: "Pot fi angajat legal sub salariul minim pe economie?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Nu. Conform Codului Muncii (art. 164), angajatorul are obligația legală de a plăti minimum salariul minim brut pe țară pentru un program de muncă cu normă întreagă. Excepție fac contractele part-time, unde valoarea se calculează proporțional cu orele lucrate. Sancțiunile pentru încălcare pot ajunge la 5.000-8.000 lei pentru angajator.",
          },
        },
        {
          "@type": "Question",
          name: "Salariul minim influențează plafoanele PFA în 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Pentru calculul plafoanelor CAS și CASS la veniturile din activități independente (PFA, dividende) în anul 2026 se folosește salariul minim brut în vigoare la 1 ianuarie 2026, respectiv 4.050 lei. Majorarea de la 1 iulie 2026 la 4.325 lei NU afectează plafoanele PFA pentru 2026.",
          },
        },
      ],
    },
  ],
};

// ─── Componenta paginii ─────────────────────────────────────────────────────

export default function SalariuMinimPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Salariu minim 2026</span>
          </nav>

          <h1>
            Salariu Minim <em>2026</em>
          </h1>
          <p className="subtitle">
            Salariul minim brut în România 2026 are două valori: <strong>4.050 lei</strong>{" "}
            până în 30 iunie și <strong>4.325 lei</strong> din 1 iulie (HG 146/2026). Calcul
            complet net, cost angajator și legislație actualizată.
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
        {/* Cele 2 semestre — carduri side-by-side */}
        <section
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            padding: "2rem 0",
          }}
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {/* Semestrul I */}
              <article className="card" style={{ borderTop: "3px solid var(--accent)" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "system-ui, sans-serif",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--muted)",
                    marginBottom: "0.75rem",
                  }}
                >
                  1 Ianuarie – 30 Iunie 2026
                </div>
                <SemestruRows
                  brut={4050}
                  net={2574}
                  cost={4134}
                  facilitate={300}
                  facilitateColor="var(--accent)"
                  tarifOrar="24,496"
                />
                <Link
                  href="/calculator/calcul-salariu-net-4050-brut"
                  style={{
                    display: "block",
                    marginTop: "1rem",
                    padding: "0.5rem",
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                    borderRadius: "6px",
                    textAlign: "center",
                    textDecoration: "none",
                    fontSize: "0.8125rem",
                    fontFamily: "system-ui, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Calculează detaliat 4.050 lei →
                </Link>
              </article>

              {/* Semestrul II */}
              <article className="card" style={{ borderTop: "3px solid var(--warn)" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontFamily: "system-ui, sans-serif",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--muted)",
                    }}
                  >
                    1 Iulie – 31 Decembrie 2026
                  </div>
                  <span
                    style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      fontSize: "0.6875rem",
                      fontFamily: "system-ui, sans-serif",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "20px",
                    }}
                  >
                    NOU
                  </span>
                </div>
                <SemestruRows
                  brut={4325}
                  net={2699}
                  cost={4418}
                  facilitate={200}
                  facilitateColor="var(--warn)"
                  tarifOrar="25,949"
                />
                <Link
                  href="/calculator/calcul-salariu-net-4325-brut"
                  style={{
                    display: "block",
                    marginTop: "1rem",
                    padding: "0.5rem",
                    background: "#fef3c7",
                    color: "#92400e",
                    borderRadius: "6px",
                    textAlign: "center",
                    textDecoration: "none",
                    fontSize: "0.8125rem",
                    fontFamily: "system-ui, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Calculează detaliat 4.325 lei →
                </Link>
              </article>
            </div>

            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted)",
                fontFamily: "system-ui, sans-serif",
                textAlign: "center",
                marginTop: "1rem",
              }}
            >
              Sursa: HG 146/2026 (Monitorul Oficial nr. 196/13 martie 2026), OUG 89/2025
            </p>
          </div>
        </section>

        {/* Conținut principal */}
        <section style={{ padding: "3rem 0 1rem" }}>
          <div className="container" style={{ maxWidth: "860px" }}>
            {/* Ce este salariul minim */}
            <article style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: "1rem",
                }}
              >
                Ce este salariul minim brut pe economie
              </h2>
              <p
                style={{
                  marginBottom: "1rem",
                  fontFamily: "system-ui, sans-serif",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                Salariul minim brut pe țară este suma minimă pe care un angajator are obligația
                legală să o plătească unui salariat cu normă întreagă (166,667 ore lunar de la 1
                iulie 2026). Reglementat prin Codul Muncii (art. 164) și actualizat anual sau
                semestrial prin Hotărâri de Guvern, are rolul de a proteja puterea de cumpărare
                a angajaților cu venituri reduse.
              </p>
              <p
                style={{
                  fontFamily: "system-ui, sans-serif",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                În 2026, salariul minim are două valori distincte: <strong>4.050 lei brut</strong>{" "}
                în prima jumătate a anului (conform HG 1506/2024) și <strong>4.325 lei brut
                </strong> în a doua jumătate, începând cu 1 iulie 2026 (conform HG 146/2026,
                publicată în Monitorul Oficial nr. 196 din 13 martie 2026). De majorarea de la 1
                iulie vor beneficia aproximativ 1.759.027 de salariați, conform datelor oficiale
                ale Ministerului Muncii.
              </p>
            </article>

            {/* Calcul detaliat S1 */}
            <article style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: "1rem",
                }}
              >
                Cum se calculează salariul minim net în 2026
              </h2>
              <p
                style={{
                  marginBottom: "1.25rem",
                  fontFamily: "system-ui, sans-serif",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                Particularitatea anului 2026 este facilitatea fiscală introdusă prin OUG 89/2025:
                o sumă fixă din salariul minim este scutită de impozit și contribuții sociale.
                Suma diferă între cele două semestre — 300 lei până în iunie, apoi 200 lei.
              </p>

              {/* Calcul S1 */}
              <div className="card" style={{ marginBottom: "1.25rem" }}>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                    color: "var(--accent)",
                  }}
                >
                  Semestrul I: 4.050 lei brut → 2.574 lei net
                </h3>
                <CalculRows
                  rows={[
                    { label: "Salariu brut", value: "4.050,00 lei", bold: true },
                    {
                      label: "Facilitate fiscală (OUG 89/2025) — netaxabilă",
                      value: "−300,00 lei",
                      color: "var(--accent)",
                    },
                    { label: "Bază de calcul contribuții", value: "3.750,00 lei", muted: true },
                    {
                      label: "CAS — pensie (25%)",
                      value: "−937,50 lei",
                      color: "var(--danger)",
                    },
                    {
                      label: "CASS — sănătate (10%)",
                      value: "−375,00 lei",
                      color: "var(--danger)",
                    },
                    { label: "Bază impozabilă", value: "2.437,50 lei", muted: true },
                    {
                      label: "Impozit pe venit (10%)",
                      value: "−243,75 lei",
                      color: "var(--danger)",
                    },
                    { label: "Adăugare 300 lei facilitate (necontribuit)", value: "+300,00 lei", color: "var(--accent)", muted: true },
                  ]}
                  total={{ label: "Salariu net (în mână)", value: "2.574,00 lei" }}
                />
              </div>

              {/* Calcul S2 */}
              <div className="card">
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                    color: "var(--warn)",
                  }}
                >
                  Semestrul II: 4.325 lei brut → ~2.699 lei net
                </h3>
                <CalculRows
                  rows={[
                    { label: "Salariu brut", value: "4.325,00 lei", bold: true },
                    {
                      label: "Facilitate fiscală (redusă la 200 lei) — netaxabilă",
                      value: "−200,00 lei",
                      color: "var(--warn)",
                    },
                    { label: "Bază de calcul contribuții", value: "4.125,00 lei", muted: true },
                    {
                      label: "CAS — pensie (25%)",
                      value: "−1.031,25 lei",
                      color: "var(--danger)",
                    },
                    {
                      label: "CASS — sănătate (10%)",
                      value: "−412,50 lei",
                      color: "var(--danger)",
                    },
                    { label: "Bază impozabilă", value: "2.681,25 lei", muted: true },
                    {
                      label: "Impozit pe venit (10%)",
                      value: "−268,13 lei",
                      color: "var(--danger)",
                    },
                    { label: "Adăugare 200 lei facilitate (necontribuit)", value: "+200,00 lei", color: "var(--warn)", muted: true },
                  ]}
                  total={{ label: "Salariu net (în mână)", value: "~2.699,00 lei" }}
                />
              </div>

              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--muted)",
                  fontFamily: "system-ui, sans-serif",
                  marginTop: "1rem",
                  fontStyle: "italic",
                }}
              >
                Notă: valorile pot diferi cu câțiva lei din cauza rotunjirilor. Calculul folosit
                de programele oficiale poate produce 2.699 lei, 2.700 lei sau valori apropiate.
              </p>
            </article>

            {/* Cost angajator */}
            <article style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: "1rem",
                }}
              >
                Cât plătește total angajatorul în 2026
              </h2>
              <p
                style={{
                  marginBottom: "1rem",
                  fontFamily: "system-ui, sans-serif",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                Pe lângă salariul brut, angajatorul mai plătește o singură contribuție:{" "}
                <strong>CAM (Contribuția Asiguratorie pentru Muncă)</strong>, în cotă de{" "}
                <strong>2,25%</strong> aplicată salariului brut. CAM nu afectează salariul net
                al angajatului — este un cost suportat exclusiv de firmă.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    background: "var(--bg)",
                    padding: "1rem 1.25rem",
                    borderRadius: "8px",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      letterSpacing: "0.05em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Sem. I (ian-iun)
                  </div>
                  <div style={{ fontSize: "0.9375rem", lineHeight: 1.9 }}>
                    Brut: <strong>4.050 lei</strong>
                    <br />
                    CAM (2,25%): <strong>+91,13 lei</strong>
                    <br />
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                      Cost total: 4.134 lei
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: "#fef9e7",
                    padding: "1rem 1.25rem",
                    borderRadius: "8px",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      letterSpacing: "0.05em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Sem. II (iul-dec)
                  </div>
                  <div style={{ fontSize: "0.9375rem", lineHeight: 1.9 }}>
                    Brut: <strong>4.325 lei</strong>
                    <br />
                    CAM (2,25%): <strong>+97,31 lei</strong>
                    <br />
                    <span style={{ color: "var(--warn)", fontWeight: 700 }}>
                      Cost total: ~4.418 lei
                    </span>
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontFamily: "system-ui, sans-serif",
                  color: "var(--muted)",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                }}
              >
                Pentru o firmă cu 10 angajați la salariul minim, costul lunar suplimentar de la 1
                iulie 2026 este de aproximativ <strong>2.840 lei</strong>, iar pe semestrul II
                impactul total depășește <strong>17.000 lei</strong>.
              </p>
            </article>

            {/* Construcții */}
            <article style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: "1rem",
                }}
              >
                Salariul minim în construcții 2026
              </h2>
              <p
                style={{
                  marginBottom: "1rem",
                  fontFamily: "system-ui, sans-serif",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                Sectorul construcțiilor are un salariu minim brut diferit, stabilit la{" "}
                <strong>4.582 lei</strong> pentru întregul an 2026, conform OUG 156/2024.
                Această valoare a fost menținută la nivelul din 2024 și{" "}
                <strong>nu este afectată de HG 146/2026</strong>, care se aplică doar salariului
                minim general.
              </p>
              <p
                style={{
                  fontFamily: "system-ui, sans-serif",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                Important: începând cu 1 ianuarie 2025, au fost{" "}
                <strong>eliminate facilitățile fiscale</strong> care existau anterior pentru
                sectoarele construcții, IT și agricultură/industrie alimentară. În consecință,
                un angajat în construcții cu salariul minim de 4.582 lei brut ajunge la un net
                de aproximativ <strong>2.739 lei</strong>, semnificativ mai puțin decât în 2024.
              </p>
            </article>

            {/* Istoric */}
            <article style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: "1rem",
                }}
              >
                Evoluția salariului minim în România (2019 – 2026)
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "0.9375rem",
                  }}
                >
                  <thead>
                    <tr style={{ background: "var(--bg)" }}>
                      <th
                        style={{
                          padding: "0.625rem 0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid var(--border)",
                        }}
                      >
                        Perioadă
                      </th>
                      <th
                        style={{
                          padding: "0.625rem 0.75rem",
                          textAlign: "right",
                          borderBottom: "2px solid var(--border)",
                        }}
                      >
                        Brut (lei)
                      </th>
                      <th
                        style={{
                          padding: "0.625rem 0.75rem",
                          textAlign: "right",
                          borderBottom: "2px solid var(--border)",
                        }}
                      >
                        Net aprox. (lei)
                      </th>
                      <th
                        style={{
                          padding: "0.625rem 0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid var(--border)",
                        }}
                      >
                        Bază legală
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ISTORIC_SALARIU_MINIM.map((row) => (
                      <tr
                        key={row.perioada}
                        style={{
                          background: row.highlight ? "var(--accent-light)" : "transparent",
                        }}
                      >
                        <td
                          style={{
                            padding: "0.625rem 0.75rem",
                            borderBottom: "1px solid var(--border)",
                            fontWeight: row.highlight ? 700 : 400,
                          }}
                        >
                          {row.perioada}
                        </td>
                        <td
                          style={{
                            padding: "0.625rem 0.75rem",
                            textAlign: "right",
                            borderBottom: "1px solid var(--border)",
                            fontWeight: row.highlight ? 700 : 600,
                          }}
                        >
                          {fmt(row.brut)}
                        </td>
                        <td
                          style={{
                            padding: "0.625rem 0.75rem",
                            textAlign: "right",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          {fmt(row.net)}
                        </td>
                        <td
                          style={{
                            padding: "0.625rem 0.75rem",
                            borderBottom: "1px solid var(--border)",
                            fontSize: "0.8125rem",
                            color: "var(--muted)",
                          }}
                        >
                          {row.hg}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--muted)",
                  marginTop: "1rem",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Sursa: Hotărâri de Guvern publicate în Monitorul Oficial. Valorile nete sunt
                estimative, calculate pentru un angajat cu funcție de bază, normă întreagă, fără
                persoane în întreținere.
              </p>
            </article>

            {/* Obligații angajatori */}
            <article style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: "1rem",
                }}
              >
                Obligații pentru angajatori la majorarea din iulie 2026
              </h2>
              <p
                style={{
                  marginBottom: "1rem",
                  fontFamily: "system-ui, sans-serif",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                Angajatorii care au salariați plătiți la nivelul salariului minim trebuie să
                actualizeze contractele individuale de muncă și să raporteze schimbarea în{" "}
                <strong>REGES-Online</strong> cel târziu până la <strong>28 iulie 2026</strong>.
                Neîndeplinirea la timp poate atrage amenzi între 5.000 și 8.000 lei.
              </p>
              <p
                style={{
                  fontFamily: "system-ui, sans-serif",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                Pentru salariații menținuți la nivelul minim mai mult de 24 de luni de la
                semnarea contractului, angajatorul are obligația suplimentară de a renegocia
                salariul la un nivel superior celui minim, conform Legii nr. 283/2024 privind
                stabilirea salariilor minime adecvate.
              </p>
            </article>

            {/* FAQ */}
            <article style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: "1.25rem",
                }}
              >
                Întrebări frecvente despre salariul minim 2026
              </h2>

              <FaqItem question="Cât este salariul minim brut în România în 2026?">
                Salariul minim brut în 2026 are două valori: <strong>4.050 lei</strong> pentru
                perioada 1 ianuarie – 30 iunie 2026 și <strong>4.325 lei</strong> începând cu 1
                iulie 2026, conform HG 146/2026 publicată în Monitorul Oficial nr. 196 din 13
                martie 2026.
              </FaqItem>

              <FaqItem question="Cât rămâne net la salariul minim în 2026?">
                În semestrul I (ian-iun), salariul minim net este <strong>2.574 lei</strong>, cu
                facilitatea fiscală de 300 lei. Din 1 iulie, la un brut de 4.325 lei și
                facilitate redusă la 200 lei, salariul net devine <strong>~2.699 lei</strong>.
                Creșterea netă reală pe lună este de aproximativ 125 lei.
              </FaqItem>

              <FaqItem question="Când crește salariul minim în 2026 și cu cât?">
                Salariul minim crește de la 4.050 la 4.325 lei începând cu 1 iulie 2026.
                Creșterea brută este de 275 lei (+6,8%), însă creșterea netă pentru angajat este
                de doar ~125 lei deoarece facilitatea fiscală scade simultan de la 300 la 200
                lei (OUG 89/2025).
              </FaqItem>

              <FaqItem question="Cât plătește total angajatorul pentru un salariu minim în 2026?">
                Costul total pentru angajator este de <strong>4.134 lei</strong> în semestrul I
                și <strong>~4.418 lei</strong> începând cu 1 iulie 2026. Diferența reprezintă o
                creștere de 284 lei lunar per angajat la salariu minim.
              </FaqItem>

              <FaqItem question="Care este salariul minim în construcții în 2026?">
                Salariul minim brut în sectorul construcțiilor este <strong>4.582 lei</strong>{" "}
                pentru tot anul 2026, fără modificări (OUG 156/2024). HG 146/2026 NU afectează
                acest sector. Netul este de aproximativ 2.739 lei, fără facilitățile fiscale
                eliminate din ianuarie 2025.
              </FaqItem>

              <FaqItem question="Ce este facilitatea fiscală de 300/200 lei pentru salariul minim?">
                Conform OUG 89/2025, o sumă fixă din salariul minim este scutită de impozit pe
                venit și contribuții sociale: <strong>300 lei</strong> în perioada ianuarie–iunie
                2026 și <strong>200 lei</strong> în perioada iulie–decembrie 2026. Se aplică
                doar salariaților cu funcție de bază, normă întreagă, plătiți exact la nivelul
                salariului minim brut.
              </FaqItem>

              <FaqItem question="Pot fi angajat legal sub salariul minim pe economie?">
                Nu. Conform Codului Muncii (art. 164), angajatorul trebuie să plătească minimum
                salariul minim brut pentru un program cu normă întreagă. Excepție fac
                contractele part-time, calculate proporțional cu orele lucrate. Sancțiunile pot
                ajunge la 5.000–8.000 lei.
              </FaqItem>

              <FaqItem question="Salariul minim influențează plafoanele PFA în 2026?">
                Pentru calculul plafoanelor CAS și CASS la veniturile din PFA și activități
                independente în 2026, se folosește salariul minim brut în vigoare la 1 ianuarie
                2026 (4.050 lei). <strong>Majorarea de la 1 iulie nu afectează plafoanele
                PFA</strong> pentru anul fiscal 2026.
              </FaqItem>
            </article>

            {/* CTA principal */}
            <div
              style={{
                background: "var(--accent)",
                color: "white",
                borderRadius: "var(--radius)",
                padding: "2rem 1.5rem",
                textAlign: "center",
                marginBottom: "2rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.375rem",
                  marginBottom: "0.75rem",
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                Calculează orice salariu cu instrumentul nostru
              </h2>
              <p
                style={{
                  fontSize: "0.9375rem",
                  fontFamily: "system-ui, sans-serif",
                  opacity: 0.9,
                  marginBottom: "1.25rem",
                  maxWidth: "500px",
                  margin: "0 auto 1.25rem",
                }}
              >
                Calculatorul nostru îți arată salariul net pentru orice sumă brută, cu opțiuni
                pentru IT, construcții, persoane în întreținere și tichete de masă.
              </p>
              <Link
                href="/"
                style={{
                  display: "inline-block",
                  background: "white",
                  color: "var(--accent)",
                  padding: "0.625rem 1.5rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                }}
              >
                Mergi la Calculator →
              </Link>
            </div>

            {/* Linkuri interne */}
            <div className="card">
              <h3
                style={{
                  fontSize: "1rem",
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.01em",
                }}
              >
                Citește și
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "0.9375rem",
                  margin: 0,
                  padding: 0,
                }}
              >
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <Link
                    href="/salariu-mediu"
                    style={{ color: "var(--accent)", textDecoration: "none" }}
                  >
                    Salariul mediu în România 2026 — date INS și statistici →
                  </Link>
                </li>
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <Link
                    href="/calculator/calcul-salariu-net-4050-brut"
                    style={{ color: "var(--accent)", textDecoration: "none" }}
                  >
                    Calcul detaliat: 4.050 lei brut → net (semestrul I) →
                  </Link>
                </li>
                <li
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <Link
                    href="/calculator/calcul-salariu-net-4325-brut"
                    style={{ color: "var(--accent)", textDecoration: "none" }}
                  >
                    Calcul detaliat: 4.325 lei brut → net (semestrul II) →
                  </Link>
                </li>
                <li style={{ padding: "0.5rem 0" }}>
                  <Link
                    href="/"
                    style={{ color: "var(--accent)", textDecoration: "none" }}
                  >
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

// ─── Sub-componente reutilizabile ────────────────────────────────────────────

function SemestruRows({
  brut,
  net,
  cost,
  facilitate,
  facilitateColor,
  tarifOrar,
}: {
  brut: number;
  net: number;
  cost: number;
  facilitate: number;
  facilitateColor: string;
  tarifOrar: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      <Row label="Salariu brut" value={`${fmt(brut)} lei`} valueSize="1.25rem" />
      <Row
        label="Salariu net"
        value={`${fmt(net)} lei`}
        valueSize="1.5rem"
        valueColor="var(--accent)"
        valueBold
      />
      <div style={{ height: "1px", background: "var(--border)", margin: "0.25rem 0" }} />
      <Row label="Cost angajator" value={`${fmt(cost)} lei`} small />
      <Row
        label="Facilitate fiscală"
        value={`${facilitate} lei netaxabili`}
        small
        valueColor={facilitateColor}
        valueBold
      />
      <Row label="Tarif orar" value={`${tarifOrar} lei/oră`} small />
    </div>
  );
}

function Row({
  label,
  value,
  valueSize,
  valueColor,
  valueBold,
  small,
}: {
  label: string;
  value: string;
  valueSize?: string;
  valueColor?: string;
  valueBold?: boolean;
  small?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: small ? "0.8125rem" : "0.875rem",
          fontFamily: "system-ui, sans-serif",
          color: "var(--muted)",
        }}
      >
        {label}
      </span>
      <strong
        style={{
          fontSize: valueSize || (small ? "0.8125rem" : "1rem"),
          fontFamily: "system-ui, sans-serif",
          color: valueColor || "var(--text)",
          fontWeight: valueBold ? 700 : 600,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function CalculRows({
  rows,
  total,
}: {
  rows: Array<{
    label: string;
    value: string;
    bold?: boolean;
    color?: string;
    muted?: boolean;
  }>;
  total: { label: string; value: string };
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        fontFamily: "system-ui, sans-serif",
        fontSize: "0.875rem",
      }}
    >
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.5rem 0",
            borderBottom: "1px solid var(--border)",
            opacity: row.muted ? 0.85 : 1,
          }}
        >
          <span style={{ color: "var(--muted)" }}>{row.label}</span>
          <strong style={{ color: row.color || "var(--text)" }}>{row.value}</strong>
        </div>
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0.875rem 0.75rem",
          background: "var(--accent-light)",
          borderRadius: "6px",
          marginTop: "0.5rem",
        }}
      >
        <strong style={{ color: "var(--text)" }}>{total.label}</strong>
        <strong style={{ color: "var(--accent)", fontSize: "1.0625rem" }}>
          {total.value}
        </strong>
      </div>
    </div>
  );
}

function FaqItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <details
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "0.875rem 0",
      }}
    >
      <summary
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: "0.9375rem",
          fontWeight: 500,
          color: "var(--text)",
          cursor: "pointer",
          listStyle: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {question}
        <span
          style={{
            color: "var(--accent)",
            fontSize: "1.125rem",
            fontFamily: "system-ui, sans-serif",
            flexShrink: 0,
          }}
        >
          +
        </span>
      </summary>
      <div
        style={{
          marginTop: "0.75rem",
          fontFamily: "system-ui, sans-serif",
          fontSize: "0.9375rem",
          color: "var(--muted)",
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>
    </details>
  );
}
