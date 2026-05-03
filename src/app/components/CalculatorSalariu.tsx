"use client";

import React, { useState, useCallback } from "react";

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
  brutNet: number;
}

// ─── Logică fiscală 2026 ──────────────────────────────────────────────────────

const SALARIU_MINIM = 4050;
const CAS_PROCENT = 0.25;
const CASS_PROCENT = 0.10;
const IMPOZIT_PROCENT = 0.10;
const CAM_PROCENT = 0.0225;
const DEDUCERE_MINIM = 300;

function calculeazaDeducerePersonala(brut: number, persoane: number, copii: number): number {
  const totalPersoane = persoane + copii;
  const limita = SALARIU_MINIM + 2000;

  if (brut > limita) return 0;

  const procente = [0.20, 0.25, 0.30, 0.35, 0.45];
  const procent = totalPersoane >= 4 ? 0.45 : procente[totalPersoane] || 0.20;
  const baza = Math.floor((procent * SALARIU_MINIM) / 10) * 10;

  if (brut <= SALARIU_MINIM) return baza;

  const coeficient = 1 - (brut - SALARIU_MINIM) / 2000;
  return Math.max(0, Math.floor((baza * coeficient) / 10) * 10);
}

function calculeaza(input: InputState): Rezultat | null {
  const brut = parseFloat(input.brut);
  if (!brut || brut <= 0) return null;

  const tichete = parseFloat(input.tichete) || 0;
  const { functieDeBAza, persoanePretretinere, varstaSub26, copiiScolarizati, scutitImpozit, sectiune } = input;

  const facilitate = (functieDeBAza && brut === SALARIU_MINIM) ? DEDUCERE_MINIM : 0;
  const bazaCasCassSalariu = Math.max(0, brut - facilitate);

  let cas = 0;
  if (sectiune === "constructii") {
    if (brut <= 10000) {
      cas = Math.round(bazaCasCassSalariu * 0.2025);
    } else {
      const bazaPanaLa10k = 10000 - facilitate;
      const bazaPeste10k = brut - 10000;
      cas = Math.round(bazaPanaLa10k * 0.2025) + Math.round(bazaPeste10k * CAS_PROCENT);
    }
  } else {
    cas = Math.round(bazaCasCassSalariu * CAS_PROCENT);
  }

  const cassSalariu = Math.round(bazaCasCassSalariu * CASS_PROCENT);
  const cassTichete = Math.round(tichete * CASS_PROCENT);
  const cassTotal = cassSalariu + cassTichete;

  let deducere = 0;
  if (functieDeBAza) {
    deducere = calculeazaDeducerePersonala(brut, persoanePretretinere, copiiScolarizati);
    if (varstaSub26) deducere += Math.round(0.15 * SALARIU_MINIM);
    deducere += copiiScolarizati * 100;
  }

  let impozit = 0;
  const bazaImpozitTichete = Math.max(0, tichete - cassTichete);

  if (!scutitImpozit) {
    if (sectiune === "it" || sectiune === "constructii") {
      if (brut > 10000) {
        const parteTaxabilaBrut = brut - 10000;
        const casAferentPeste10k = Math.round(parteTaxabilaBrut * CAS_PROCENT);
        const cassAferentPeste10k = Math.round(parteTaxabilaBrut * CASS_PROCENT);
        const bazaImpozitSalariuPeste10k = parteTaxabilaBrut - casAferentPeste10k - cassAferentPeste10k;
        impozit = Math.round((bazaImpozitSalariuPeste10k + bazaImpozitTichete) * IMPOZIT_PROCENT);
      } else {
        impozit = Math.round(bazaImpozitTichete * IMPOZIT_PROCENT);
      }
    } else {
      const bazaImpozitSalariu = Math.max(0, brut - cas - cassSalariu - facilitate - deducere);
      const bazaImpozitTotala = bazaImpozitSalariu + bazaImpozitTichete;
      impozit = Math.round(bazaImpozitTotala * IMPOZIT_PROCENT);
    }
  }

  const impozitTichete = scutitImpozit ? 0 : Math.round(bazaImpozitTichete * IMPOZIT_PROCENT);
  const impozitSalariu = Math.max(0, impozit - impozitTichete);
  const netBaniMunciti = brut - cas - cassSalariu - impozitSalariu;
  const netTicheteEfectiv = tichete - cassTichete - impozitTichete;
  const netCumulat = netBaniMunciti + netTicheteEfectiv;

  const bazaCAM = brut - facilitate;
  const cam = Math.round(bazaCAM * CAM_PROCENT);

  return {
    net: Math.round(netCumulat),
    cas,
    cass: cassTotal,
    impozit,
    deducerePersonala: Math.round(deducere),
    cam,
    costTotal: brut + cam,
    brutNet: brut > 0 ? Math.round((netBaniMunciti / brut) * 100) : 0,
  };
}

function calculeazaBrutDinNet(net: number, input: Omit<InputState, "brut">): number {
  const valoriSpeciale = [SALARIU_MINIM];
  for (const v of valoriSpeciale) {
    const rez = calculeaza({ ...input, brut: String(v) });
    if (rez && rez.net === net) return v;
  }

  let lo = net;
  let hi = net * 3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const rez = calculeaza({ ...input, brut: String(mid) });
    if (!rez) { lo = mid; continue; }
    if (rez.net < net) lo = mid;
    else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n) + " lei";

// ─── Componente UI ────────────────────────────────────────────────────────────

function InputNumber({ label, value, onChange, placeholder, hint }: any) {
  return (
    <div className="field">
      <label>{label}</label>
      {hint && <span className="hint">{hint}</span>}
      <div className="input-wrap">
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "0"} min="0" />
        <span className="suffix">LEI / lună</span>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: any) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <button role="switch" aria-checked={checked} className={`toggle ${checked ? "on" : ""}`} onClick={() => onChange(!checked)} type="button">
        <span className="thumb" />
      </button>
    </label>
  );
}

function Select({ id, label, value, options, onChange }: any) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((o: any) => (<option key={o.v} value={o.v}>{o.l}</option>))}
      </select>
    </div>
  );
}

function BarRow({ label, value, total, color }: any) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="bar-row">
      <div className="bar-label"><span>{label}</span><span className="bar-val">{fmt(value)}</span></div>
      <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

// ─── Componenta principală (ACUM ACCEPTĂ PROPS DINAMICE) ──────────────────────

export default function CalculatorSalariu({
  brutInitial = "",
  modInitial = "brut",
  titluCustom,
  subtitluCustom,
  ascundeInfoFiscale = false,
}: {
  brutInitial?: string;
  modInitial?: "brut" | "net";
  titluCustom?: React.ReactNode;
  subtitluCustom?: React.ReactNode;
  ascundeInfoFiscale?: boolean;
}) {
  const [mod, setMod] = useState<"brut" | "net">(modInitial);
  const [avansat, setAvansat] = useState(false);

  const [input, setInput] = useState<InputState>({
    brut: brutInitial,
    tichete: "",
    functieDeBAza: true,
    persoanePretretinere: 0,
    varstaSub26: false,
    copiiScolarizati: 0,
    scutitImpozit: false,
    sectiune: "standard",
  });

  const set = useCallback(
    <K extends keyof InputState>(k: K, v: InputState[K]) =>
      setInput((p) => ({ ...p, [k]: v })),
    []
  );
  
  const brutEfectiv = mod === "net" ? String(calculeazaBrutDinNet(parseFloat(input.brut) || 0, input)) : input.brut;
  const rez = calculeaza({ ...input, brut: brutEfectiv });

  return (
    <>
      {/* ── Hero (Acum afișează titluri dinamice dacă sunt trimise) ── */}
      <section className="hero">
        <div className="container">
          <div className="breadcrumb">
            <a href="/">Acasă</a>
            <span>/</span>
            <span>Calculator salariu</span>
          </div>
          
          {/* Titlul Dinamic */}
          <h1>
            {titluCustom || <>Calculator salariu net 2026</>}
          </h1>
          
          {/* Subtitlul Dinamic */}
          <p className="subtitle">
            {subtitluCustom || (
              <>
                Calculează salariul net din brut. CAS, CASS, impozit și cost angajator — actualizat conform{" "}
                <a href="https://legislatie.just.ro" target="_blank" rel="noopener noreferrer">HG 146/2026</a>
                {" "}și{" "}
                <a href="https://legislatie.just.ro" target="_blank" rel="noopener noreferrer">OUG 89/2025</a>.
              </>
            )}
          </p>
          
          {!titluCustom && (
            <div className="dateline">
              Ultima actualizare: 30 aprilie 2026 · Surse: <a href="https://monitoruloficial.ro" target="_blank" rel="noopener noreferrer">Monitorul Oficial 196/2026</a>
            </div>
          )}
        </div>
      </section>

      {/* ── Calculator ── */}
      <div className="container calc-layout">
        {/* Form */}
        <div className="card form-card">
          <div className="card-head">
            <h3 className="results-header">DATE DE INTRARE</h3>
            
            <div className="field direction-field">
              <label className="tech-label">DIRECȚIE DE CALCUL:</label>
              <div className="mod-pills">
                <button className={mod === "brut" ? "pill active" : "pill"} onClick={() => {
                  if (mod === "net") {
                    const netVal = parseFloat(input.brut) || 0;
                    set("brut", String(calculeazaBrutDinNet(netVal, input)));
                  }
                  setMod("brut");
                }}>Din brut în net</button>
                <button className={mod === "net" ? "pill active" : "pill"} onClick={() => {
                  if (mod === "brut") {
                    const rezTemp = calculeaza(input);
                    if (rezTemp) set("brut", String(rezTemp.net));
                  }
                  setMod("net");
                }}>Din net în brut</button>
              </div>
            </div>
          </div>

          <InputNumber label={mod === "brut" ? "SALARIU BRUT:" : "SALARIU NET:"} value={input.brut} onChange={(v: any) => set("brut", v)} />
          
          <button className="avansat-toggle" onClick={() => {
            if (avansat) { set("tichete", ""); set("functieDeBAza", true); set("persoanePretretinere", 0); set("varstaSub26", false); set("copiiScolarizati", 0); set("scutitImpozit", false); }
            setAvansat(!avansat);
          }}>
            {avansat ? "[-] ASCUNDE DATE SUPLIMENTARE" : "[+] DATE SUPLIMENTARE (OPȚIONAL)"}
          </button>

          {avansat && (
            <>
              <InputNumber label="Tichete de masă" value={input.tichete} onChange={(v: any) => set("tichete", v)} placeholder="0" hint="Valoare lunară totală" />
              <Toggle label="Funcție de bază" checked={input.functieDeBAza} onChange={(v: any) => set("functieDeBAza", v)} />
              <Select id="persoane-intretinere" label="Persoane în întreținere" value={input.persoanePretretinere} options={[0, 1, 2, 3, 4].map((n) => ({ v: n, l: n === 0 ? "Niciuna" : `${n} ${n === 1 ? "persoană" : "persoane"}` }))} onChange={(v: any) => set("persoanePretretinere", v)} />
              <Select id="copii-scolari" label="Copii minori școlari" value={input.copiiScolarizati} options={[0, 1, 2, 3, 4, 5].map((n) => ({ v: n, l: n === 0 ? "Niciunul" : `${n} ${n === 1 ? "copil" : "copii"}` }))} onChange={(v: any) => set("copiiScolarizati", v)} />
              <Toggle label="Vârstă sub 26 ani" checked={input.varstaSub26} onChange={(v: any) => set("varstaSub26", v)} />
              {input.sectiune === "standard" && <Toggle label="Scutit de impozit (handicap etc.)" checked={input.scutitImpozit} onChange={(v: any) => set("scutitImpozit", v)} />}
              {parseFloat(input.brut) === SALARIU_MINIM && (
                <div className="info-box"><strong>Facilitate aplicată:</strong> deducere de 300 lei din baza de calcul pentru salariul minim (OUG 89/2025).</div>
              )}
            </>
          )}
        </div>

        {/* Rezultate — editorial: 1 card cu tabel-fluturas */}
        <div className="results-col">
          <h3 className="results-header">REZULTAT CALCUL</h3>

          {rez ? (
            <div className="results-wrapper">
              
              <table className="payslip-table flat-table">
                <thead>
                  <tr>
                    <th>ANGAJAT</th>
                    <th>SUMĂ (LEI)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Salariu brut</td>
                    <td>{fmt(parseFloat(brutEfectiv))}</td>
                  </tr>
                  <tr className="sub-row">
                    <td>CAS <span className="muted">(Asigurări Sociale - 25%)</span></td>
                    <td>− {fmt(rez.cas)}</td>
                  </tr>
                  <tr className="sub-row">
                    <td>CASS <span className="muted">(Asigurări Sănătate - 10%)</span></td>
                    <td>− {fmt(rez.cass)}</td>
                  </tr>
                  <tr className="bold-row">
                    <td>Bază impozabilă</td>
                    <td>{fmt(parseFloat(brutEfectiv) - rez.cas - rez.cass)}</td>
                  </tr>
                  <tr className="sub-row">
                    <td>Deducere personală</td>
                    <td>{fmt(rez.deducerePersonala)}</td>
                  </tr>
                  <tr className="sub-row">
                    <td>Impozit pe venit <span className="muted">(10%)</span></td>
                    <td>− {fmt(rez.impozit)}</td>
                  </tr>
                  <tr className="total-net">
                    <td>SALARIU NET</td>
                    <td>{fmt(rez.net)}</td>
                  </tr>
                </tbody>
              </table>

              <table className="payslip-table flat-table mt-table">
                <tbody>
                  <tr>
                    <td>CAM (Contribuție Muncă - 2.25%)</td>
                    <td>{fmt(rez.cam)}</td>
                  </tr>
                  <tr className="total-cost">
                    <td>COST TOTAL ANGAJATOR</td>
                    <td>{fmt(rez.costTotal)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="action-buttons">
                <button type="button">COPIAZĂ TABEL</button>
                <button type="button">DESCARCĂ PDF</button>
                <button type="button">TRIMITE PE EMAIL</button>
              </div>
            </div>
          ) : (
            <div className="empty-card">
              <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M9 12h6m-3-3v6M16 3h5v5M21 3l-7 7" /></svg>
              </div>
              <p>Introdu salariul brut pentru a vedea calculul</p>
              <span className="empty-hint">Salariu minim 2026: {fmt(SALARIU_MINIM)}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}