"use client";

import { useState, useCallback } from "react";

// ─── Tipuri ──────────────────────────────────────────────────────────────────

interface InputState {
  brut: string;
  tichete: string;
  functieDeBAza: boolean;
  persoanePretretinere: number;
  varstaSub26: boolean;
  copiiScolarizati: number;
  scutitImpozit: boolean;
  sectiune: "standard" | "constructii" | "it";
}

interface Rezultat {
  net: number;
  cas: number;
  cass: number;
  impozit: number;
  deducerePersonala: number;
  cam: number;
  costTotal: number;
  brutNet: number; // raport
}

// ─── Logică fiscală 2026 ──────────────────────────────────────────────────────

const SALARIU_MINIM = 4050;
const SALARIU_MINIM_IUL_2026 = 4325; // HG estimat
const CAS_PROCENT = 0.25;
const CASS_PROCENT = 0.10;
const IMPOZIT_PROCENT = 0.10;
const CAM_PROCENT = 0.0225;
const DEDUCERE_MINIM = 300; // OUG 156/2024

function calculeazaDeducerePersonala(
  brut: number,
  persoane: number,
  copii: number
): number {
  const totalPersoane = persoane + copii;
  const limita = SALARIU_MINIM + 2000; // 6050 lei

  if (brut > limita) return 0;

  const procente = [0.45, 0.55, 0.65, 0.75, 0.85];
  const procent = totalPersoane >= 4 ? 0.85 : procente[totalPersoane] || 0.45;
  const baza = Math.round(procent * SALARIU_MINIM / 50) * 50;

  if (brut <= SALARIU_MINIM) return baza;

  // reducere liniară
  const reducere = Math.round((baza * (brut - SALARIU_MINIM) / 2000) / 50) * 50;
  return Math.max(0, baza - reducere);
}

function calculeaza(input: InputState): Rezultat | null {
  const brut = parseFloat(input.brut);
  if (!brut || brut <= 0) return null;

  const tichete = parseFloat(input.tichete) || 0;
  const { functieDeBAza, persoanePretretinere, varstaSub26, copiiScolarizati, scutitImpozit, sectiune } = input;

  // Facilitatea de 300 lei la salariul minim
  const bazaCAS =
    brut <= SALARIU_MINIM && brut + tichete <= 4000
      ? Math.max(0, brut - DEDUCERE_MINIM)
      : brut;

  const cas = sectiune === "constructii" ? 0 : Math.round(bazaCAS * CAS_PROCENT);
  const cass = Math.round((bazaCAS + tichete) * CASS_PROCENT);

  const venItImpozabil = brut - cas - cass;

  let deducere = 0;
  if (functieDeBAza) {
    deducere = calculeazaDeducerePersonala(brut, persoanePretretinere, copiiScolarizati);
    if (varstaSub26) deducere += Math.round(0.15 * SALARIU_MINIM);
    deducere += copiiScolarizati * 100;
  }

  const bazaImpozit = Math.max(0, venItImpozabil - deducere);
  const impozit = scutitImpozit || sectiune === "it"
    ? 0
    : Math.round(bazaImpozit * IMPOZIT_PROCENT);

  const net = brut - cas - cass - impozit + tichete;
  const cam = Math.round(brut * CAM_PROCENT);
  const costTotal = brut + cam;

  return {
    net: Math.round(net),
    cas: Math.round(cas),
    cass: Math.round(cass),
    impozit: Math.round(impozit),
    deducerePersonala: Math.round(deducere),
    cam: Math.round(cam),
    costTotal: Math.round(costTotal),
    brutNet: brut > 0 ? Math.round((net / brut) * 100) : 0,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("ro-RO").format(n) + " lei";

// ─── Componente UI ────────────────────────────────────────────────────────────

function InputNumber({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {hint && <span className="hint">{hint}</span>}
      <div className="input-wrap">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "0"}
          min="0"
        />
        <span className="suffix">LEI / lună</span>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        className={`toggle ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span className="thumb" />
      </button>
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: { v: number; l: string }[];
  onChange: (v: number) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );
}

function BarRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="bar-row">
      <div className="bar-label">
        <span>{label}</span>
        <span className="bar-val">{fmt(value)}</span>
      </div>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ─── Pagina principală ────────────────────────────────────────────────────────

export default function CalculatorSalariu() {
  const [input, setInput] = useState<InputState>({
    brut: "",
    tichete: "",
    functieDeBAza: true,
    persoanePretretinere: 0,
    varstaSub26: false,
    copiiScolarizati: 0,
    scutitImpozit: false,
    sectiune: "standard",
  } as InputState);

  const set = useCallback(
    <K extends keyof InputState>(k: K, v: InputState[K]) =>
      setInput((p) => ({ ...p, [k]: v })),
    []
  );

  const rez = calculeaza(input);

  const sectiuni = [
    { id: "standard", label: "Standard" },
    { id: "it", label: "IT (scutit impozit)" },
    { id: "constructii", label: "Construcții" },
  ] as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Calculator Salariu Net 2026",
            "url": "https://salariile.ro/calculator",
            "description": "Calculator salariu net din brut pentru România, actualizat 2026.",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "All",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RON" },
            "publisher": {
              "@type": "Organization",
              "name": "Salariile.ro",
              "url": "https://salariile.ro",
            },
          }),
        }}
      />
      <div className="page">
        {/* ── Header ── */}
        <header className="site-header">
          <div className="container">
            <a href="/" className="logo">
              salariile<span>.ro</span>
            </a>
            <nav>
              <a href="/calculator" className="active">Calculator</a>
              <a href="/salariu-minim">Salariu minim</a>
              <a href="/salariu-mediu">Salariu mediu</a>
              <a href="/noutati">Noutăți</a>
            </nav>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="hero">
          <div className="container">
            <div className="breadcrumb">
              <a href="/">Acasă</a>
              <span>/</span>
              <span>Calculator salariu</span>
            </div>
            <h1>Calculator Salariu Net <em>2026</em></h1>
            <p className="subtitle">
              Calculează instantaneu salariul net din brut, CAS, CASS,
              impozit și costul total al angajatorului — actualizat cu
              legislația fiscală în vigoare.
            </p>
            <div className="badges">
              <span className="badge">Actualizat 2026</span>
              <span className="badge">Salariu minim 4.050 lei</span>
              <span className="badge">Gratuit</span>
            </div>
          </div>
        </section>

        {/* ── Calculator ── */}
        <main className="container calc-layout">
          {/* Form */}
          <div className="card form-card">
            <div className="card-head">
              <h2>Date salariale</h2>
              <p>Completează câmpurile de mai jos</p>
            </div>

            {/* Tabs sectiune */}
            <div className="tab-group">
              {sectiuni.map((s) => (
                <button
                  key={s.id}
                  className={`tab ${input.sectiune === s.id ? "active" : ""}`}
                  onClick={() => set("sectiune", s.id)}
                  type="button"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <InputNumber
              label="Salariu brut"
              value={input.brut}
              onChange={(v) => set("brut", v)}
              placeholder={String(SALARIU_MINIM)}
              hint="Suma din contractul de muncă"
            />

            <InputNumber
              label="Tichete de masă"
              value={input.tichete}
              onChange={(v) => set("tichete", v)}
              placeholder="0"
              hint="Valoare lunară totală"
            />

            <Toggle
              label="Funcție de bază"
              checked={input.functieDeBAza}
              onChange={(v) => set("functieDeBAza", v)}
            />

            <Select
              label="Persoane în întreținere"
              value={input.persoanePretretinere}
              options={[0, 1, 2, 3, 4].map((n) => ({
                v: n,
                l: n === 0 ? "Niciuna" : `${n} ${n === 1 ? "persoană" : "persoane"}`,
              }))}
              onChange={(v) => set("persoanePretretinere", v)}
            />

            <Select
              label="Copii minori școlari"
              value={input.copiiScolarizati}
              options={[0, 1, 2, 3, 4, 5].map((n) => ({
                v: n,
                l: n === 0 ? "Niciunul" : `${n} ${n === 1 ? "copil" : "copii"}`,
              }))}
              onChange={(v) => set("copiiScolarizati", v)}
            />

            <Toggle
              label="Vârstă sub 26 ani"
              checked={input.varstaSub26 as boolean}
              onChange={(v) => set("varstaSubA26" as keyof InputState, v)}
            />

            {input.sectiune === "standard" && (
              <Toggle
                label="Scutit de impozit (handicap etc.)"
                checked={input.scutitImpozit}
                onChange={(v) => set("scutitImpozit", v)}
              />
            )}

            {/* Info box */}
            {parseFloat(input.brut) === SALARIU_MINIM && (
              <div className="info-box">
                <strong>Facilitate aplicată:</strong> deducere de 300 lei din
                baza de calcul pentru salariul minim (OUG 156/2024).
              </div>
            )}
          </div>

          {/* Rezultate */}
          <div className="results-col">
            {rez ? (
              <>
                {/* Net highlight */}
                <div className="card net-card">
                  <div className="net-label">Salariu net în mână</div>
                  <div className="net-value">{fmt(rez.net)}</div>
                  <div className="net-sub">
                    din {fmt(parseFloat(input.brut))} brut —{" "}
                    <strong>{rez.brutNet}%</strong> din brut
                  </div>
                </div>

                {/* Detalii card */}
                <div className="card details-card">
                  <h3>Deduceri angajat</h3>
                  <div className="detail-rows">
                    <div className="detail-row">
                      <span>CAS (pensie 25%)</span>
                      <strong>−{fmt(rez.cas)}</strong>
                    </div>
                    <div className="detail-row">
                      <span>CASS (sănătate 10%)</span>
                      <strong>−{fmt(rez.cass)}</strong>
                    </div>
                    {rez.deducerePersonala > 0 && (
                      <div className="detail-row green">
                        <span>Deducere personală</span>
                        <strong>+{fmt(rez.deducerePersonala)}</strong>
                      </div>
                    )}
                    <div className="detail-row">
                      <span>Impozit venit (10%)</span>
                      <strong>−{fmt(rez.impozit)}</strong>
                    </div>
                  </div>
                </div>

                {/* Cost angajator */}
                <div className="card details-card">
                  <h3>Cost angajator</h3>
                  <div className="detail-rows">
                    <div className="detail-row">
                      <span>Salariu brut</span>
                      <strong>{fmt(parseFloat(input.brut))}</strong>
                    </div>
                    <div className="detail-row">
                      <span>CAM (2.25%)</span>
                      <strong>+{fmt(rez.cam)}</strong>
                    </div>
                    <div className="detail-row total-row">
                      <span>Cost total</span>
                      <strong>{fmt(rez.costTotal)}</strong>
                    </div>
                  </div>
                </div>

                {/* Grafic distribuție */}
                <div className="card details-card">
                  <h3>Distribuția brut-ului</h3>
                  <div className="bars">
                    <BarRow
                      label="Salariu net"
                      value={rez.net}
                      total={parseFloat(input.brut)}
                      color="#16a34a"
                    />
                    <BarRow
                      label="CAS angajat"
                      value={rez.cas}
                      total={parseFloat(input.brut)}
                      color="#f59e0b"
                    />
                    <BarRow
                      label="CASS angajat"
                      value={rez.cass}
                      total={parseFloat(input.brut)}
                      color="#f97316"
                    />
                    <BarRow
                      label="Impozit venit"
                      value={rez.impozit}
                      total={parseFloat(input.brut)}
                      color="#ef4444"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="card empty-card">
                <div className="empty-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M9 12h6m-3-3v6M16 3h5v5M21 3l-7 7" />
                  </svg>
                </div>
                <p>Introdu salariul brut pentru a vedea calculul</p>
                <span className="empty-hint">
                  Salariu minim 2026: {fmt(SALARIU_MINIM)}
                </span>
              </div>
            )}
          </div>
        </main>

        {/* ── Informații SEO ── */}
        <section className="info-section">
          <div className="container">
            <div className="info-grid">
              <div className="info-card">
                <h3>Cum se calculează salariul net?</h3>
                <p>
                  Din salariul brut se deduc contribuțiile obligatorii: CAS
                  (25%), CASS (10%) și impozitul pe venit (10%). Formula de
                  calcul ține cont de deducerile personale și facilitățile
                  fiscale aplicabile.
                </p>
              </div>
              <div className="info-card">
                <h3>Salariul minim în 2026</h3>
                <p>
                  Salariul minim brut în 2026 este de{" "}
                  <strong>4.050 lei</strong>, rezultând un net de aproximativ{" "}
                  <strong>2.574 lei</strong> cu aplicarea facilității de 300
                  lei (OUG 156/2024).
                </p>
              </div>
              <div className="info-card">
                <h3>Ce este deducerea personală?</h3>
                <p>
                  Angajații cu venituri până la 6.050 lei brut beneficiază de
                  o deducere din baza de calcul a impozitului pe venit. Suma
                  depinde de venitul brut și numărul de persoane în întreținere.
                </p>
              </div>
              <div className="info-card">
                <h3>Facilități IT și construcții</h3>
                <p>
                  Angajații din IT și construcții beneficiază de scutire de
                  impozit pe venit pentru venituri brute de până la{" "}
                  <strong>10.000 lei</strong>. Selectează secțiunea
                  corespunzătoare din calculator.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="site-footer">
          <div className="container">
            <div className="footer-top">
              <a href="/" className="logo">
                salariile<span>.ro</span>
              </a>
              <p>
                Informații și instrumente despre salariile din România.
                <br />
                Calculele au caracter orientativ. Consultați un specialist
                contabil pentru situații complexe.
              </p>
            </div>
            <div className="footer-links">
              <div>
                <h4>Calculatoare</h4>
                <a href="/calculator">Calculator salariu net</a>
                <a href="/calculator-pfa">Calculator PFA</a>
                <a href="/calculator-concediu">Calculator concediu medical</a>
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
              <p>© 2026 Salariile.ro — Actualizat conform legislației fiscale în vigoare</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f8f7f4;
          --surface: #ffffff;
          --border: #e5e3dd;
          --text: #1a1916;
          --muted: #6b6860;
          --accent: #1a6b3c;
          --accent-light: #e8f5ee;
          --accent-mid: #16a34a;
          --warn: #f59e0b;
          --danger: #ef4444;
          --radius: 12px;
          --shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04);
        }

        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        .page { min-height: 100vh; }

        /* Container */
        .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }

        /* ── Header ── */
        .site-header {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .site-header .container {
          display: flex;
          align-items: center;
          gap: 2rem;
          height: 60px;
        }
        .logo {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
          text-decoration: none;
          letter-spacing: -0.02em;
        }
        .logo span { color: var(--accent); }
        nav { display: flex; gap: 0; margin-left: auto; }
        nav a {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.875rem;
          padding: 0.5rem 0.875rem;
          border-radius: 6px;
          font-family: system-ui, sans-serif;
          transition: color .15s, background .15s;
        }
        nav a:hover { color: var(--text); background: var(--bg); }
        nav a.active { color: var(--accent); font-weight: 500; }

        /* ── Hero ── */
        .hero {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 2.5rem 0 2rem;
        }
        .breadcrumb {
          display: flex;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--muted);
          font-family: system-ui, sans-serif;
          margin-bottom: 1rem;
        }
        .breadcrumb a { color: var(--muted); text-decoration: none; }
        .breadcrumb a:hover { color: var(--accent); }
        h1 {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: var(--text);
          margin-bottom: 0.75rem;
        }
        h1 em { font-style: normal; color: var(--accent); }
        .subtitle {
          font-size: 1rem;
          color: var(--muted);
          max-width: 580px;
          margin-bottom: 1.25rem;
        }
        .badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge {
          background: var(--accent-light);
          color: var(--accent);
          font-size: 0.75rem;
          font-weight: 600;
          font-family: system-ui, sans-serif;
          padding: 3px 10px;
          border-radius: 20px;
        }

        /* ── Calculator layout ── */
        .calc-layout {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 1.5rem;
          padding-top: 2rem;
          padding-bottom: 2rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .calc-layout { grid-template-columns: 1fr; }
        }

        /* ── Cards ── */
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          box-shadow: var(--shadow);
        }
        .card-head { margin-bottom: 1.25rem; }
        .card-head h2 {
          font-size: 1.125rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }
        .card-head p { font-size: 0.8125rem; color: var(--muted); font-family: system-ui, sans-serif; }

        /* ── Tabs ── */
        .tab-group {
          display: flex;
          background: var(--bg);
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
          margin-bottom: 1.25rem;
        }
        .tab {
          flex: 1;
          padding: 0.375rem 0.5rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 0.8125rem;
          font-family: system-ui, sans-serif;
          color: var(--muted);
          cursor: pointer;
          transition: all .15s;
          white-space: nowrap;
        }
        .tab.active {
          background: var(--surface);
          color: var(--text);
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0,0,0,.08);
        }

        /* ── Fields ── */
        .field { margin-bottom: 1.125rem; }
        .field label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: system-ui, sans-serif;
          margin-bottom: 4px;
          color: var(--text);
        }
        .hint {
          display: block;
          font-size: 0.75rem;
          color: var(--muted);
          font-family: system-ui, sans-serif;
          margin-bottom: 4px;
        }
        .input-wrap {
          display: flex;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          transition: border-color .15s;
        }
        .input-wrap:focus-within { border-color: var(--accent); }
        .input-wrap input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0.625rem 0.875rem;
          font-size: 1rem;
          font-family: system-ui, sans-serif;
          background: transparent;
          color: var(--text);
        }
        .suffix {
          padding: 0 0.75rem;
          background: var(--bg);
          font-size: 0.75rem;
          font-family: system-ui, sans-serif;
          color: var(--muted);
          display: flex;
          align-items: center;
          border-left: 1px solid var(--border);
          white-space: nowrap;
        }
        select {
          width: 100%;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 0.625rem 0.875rem;
          font-size: 0.9375rem;
          font-family: system-ui, sans-serif;
          background: var(--surface);
          color: var(--text);
          outline: none;
          cursor: pointer;
          transition: border-color .15s;
        }
        select:focus { border-color: var(--accent); }

        /* ── Toggle ── */
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 0;
          cursor: pointer;
          font-size: 0.875rem;
          font-family: system-ui, sans-serif;
          font-weight: 500;
          border-bottom: 1px solid var(--border);
          margin-bottom: 1rem;
        }
        .toggle-row:last-of-type { border-bottom: none; margin-bottom: 0; }
        .toggle {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background: var(--border);
          border: none;
          cursor: pointer;
          transition: background .2s;
          position: relative;
          flex-shrink: 0;
        }
        .toggle.on { background: var(--accent); }
        .thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: transform .2s;
        }
        .toggle.on .thumb { transform: translateX(20px); }

        /* ── Info box ── */
        .info-box {
          background: var(--accent-light);
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.8125rem;
          font-family: system-ui, sans-serif;
          color: var(--accent);
          margin-top: 1rem;
        }

        /* ── Rezultate ── */
        .results-col { display: flex; flex-direction: column; gap: 1rem; }

        .net-card {
          background: var(--accent);
          color: white;
          text-align: center;
          padding: 2rem 1.5rem;
        }
        .net-label {
          font-size: 0.875rem;
          font-family: system-ui, sans-serif;
          opacity: 0.85;
          margin-bottom: 0.5rem;
        }
        .net-value {
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
        }
        .net-sub {
          font-size: 0.875rem;
          font-family: system-ui, sans-serif;
          opacity: 0.8;
        }
        .net-sub strong { opacity: 1; }

        .details-card h3 {
          font-size: 0.9375rem;
          font-weight: 600;
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
        }
        .detail-rows { display: flex; flex-direction: column; gap: 2px; }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.9rem;
          font-family: system-ui, sans-serif;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-row span { color: var(--muted); }
        .detail-row strong { color: var(--text); font-weight: 600; }
        .detail-row.green strong { color: var(--accent-mid); }
        .detail-row.total-row { border-top: 2px solid var(--border); margin-top: 4px; }
        .detail-row.total-row span,
        .detail-row.total-row strong { font-weight: 700; color: var(--text); }

        /* ── Bars ── */
        .bars { display: flex; flex-direction: column; gap: 12px; }
        .bar-row {}
        .bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          font-family: system-ui, sans-serif;
          margin-bottom: 4px;
        }
        .bar-label span { color: var(--muted); }
        .bar-val { font-weight: 600; color: var(--text); }
        .bar-track {
          height: 8px;
          background: var(--bg);
          border-radius: 4px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width .4s ease;
        }

        /* ── Empty ── */
        .empty-card {
          text-align: center;
          padding: 3rem 1.5rem;
          color: var(--muted);
        }
        .empty-icon { margin-bottom: 1rem; opacity: 0.4; }
        .empty-card p { font-size: 1rem; margin-bottom: 0.5rem; }
        .empty-hint { font-size: 0.8125rem; font-family: system-ui, sans-serif; color: var(--accent); }

        /* ── Info section ── */
        .info-section {
          background: var(--surface);
          border-top: 1px solid var(--border);
          padding: 3rem 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .info-card { }
        .info-card h3 {
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin-bottom: 0.5rem;
        }
        .info-card p {
          font-size: 0.875rem;
          color: var(--muted);
          font-family: system-ui, sans-serif;
          line-height: 1.65;
        }
        .info-card strong { color: var(--text); }

        /* ── Footer ── */
        .site-footer {
          background: var(--text);
          color: rgba(255,255,255,.7);
          padding: 3rem 0 1.5rem;
          margin-top: 0;
        }
        .footer-top {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }
        .footer-top p {
          font-size: 0.875rem;
          font-family: system-ui, sans-serif;
          line-height: 1.6;
          max-width: 400px;
        }
        .site-footer .logo { color: white; }
        .site-footer .logo span { color: #4ade80; }
        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }
        .footer-links h4 {
          font-size: 0.75rem;
          font-family: system-ui, sans-serif;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,.4);
          margin-bottom: 0.75rem;
        }
        .footer-links a {
          display: block;
          color: rgba(255,255,255,.65);
          text-decoration: none;
          font-size: 0.875rem;
          font-family: system-ui, sans-serif;
          margin-bottom: 0.4rem;
          transition: color .15s;
        }
        .footer-links a:hover { color: white; }
        .footer-bottom p {
          font-size: 0.8125rem;
          font-family: system-ui, sans-serif;
          color: rgba(255,255,255,.35);
          text-align: center;
        }

        @media (max-width: 640px) {
          .footer-top { flex-direction: column; }
          .footer-links { grid-template-columns: 1fr 1fr; }
          nav { display: none; }
        }

        /* Print */
        @media print {
          .site-header, .hero .badges, .site-footer, .info-section { display: none; }
          .calc-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
