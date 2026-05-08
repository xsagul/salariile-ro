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
}

interface Rezultat {
  net: number;
  cas: number;
  cass: number;
  impozit: number;
  deducerePersonala: number;
  bazaCalculImpozit: number;
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
  const { functieDeBAza, persoanePretretinere, varstaSub26, copiiScolarizati, scutitImpozit } = input;

  const facilitate = (functieDeBAza && brut === SALARIU_MINIM) ? DEDUCERE_MINIM : 0;
  const bazaCasCassSalariu = Math.max(0, brut - facilitate);

  const cas = Math.round(bazaCasCassSalariu * CAS_PROCENT);

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
    const bazaImpozitSalariu = Math.max(0, brut - cas - cassSalariu - facilitate - deducere);
    const bazaImpozitTotala = bazaImpozitSalariu + bazaImpozitTichete;
    impozit = Math.round(bazaImpozitTotala * IMPOZIT_PROCENT);
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
    bazaCalculImpozit: Math.max(0, brut - cas - cassSalariu - facilitate - deducere),
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

// Am adăugat 'id' în paranteze și am legat label-ul de input
function InputNumber({ id, label, value, onChange, placeholder, hint }: any) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <span className="hint">{hint}</span>}
      <div className="input-wrap">
        <input id={id} name={id} type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "0"} min="0" />
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

// ─── Generare PDF Fluturaș (format SAGA C) ───────────────────────────────────

// Helper: înlocuiește diacriticele românești cu echivalente fără diacritice
// (necesar pentru că fontul Helvetica default din jsPDF nu suportă Unicode complet)
function fixDiacritice(text: string): string {
  return text
    .replace(/ă/g, "a").replace(/Ă/g, "A")
    .replace(/â/g, "a").replace(/Â/g, "A")
    .replace(/î/g, "i").replace(/Î/g, "I")
    .replace(/ș/g, "s").replace(/Ș/g, "S")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ț/g, "t").replace(/Ț/g, "T")
    .replace(/ţ/g, "t").replace(/Ţ/g, "T");
}

async function generarePDFFluturas(
  brut: number,
  rez: any,
  esteSalariuMinim: boolean,
  facilitate: number
): Promise<void> {
  // Import dinamic — biblioteca se încarcă doar când utilizatorul apasă butonul
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Dimensiuni pagină
  const pageWidth = 210;
  const margin = 20;
  const colRight = pageWidth - margin; // 190 mm

  // Helper: scrie text (cu fix diacritice automat)
  const T = (text: string, x: number, y: number, opts?: any) => {
    doc.text(fixDiacritice(text), x, y, opts);
  };

  // Helper pentru linii orizontale
  const linie = (y: number, gros = 0.2) => {
    doc.setLineWidth(gros);
    doc.line(margin, y, colRight, y);
  };

  // Helper pentru rând (label stânga + valoare dreapta)
  const rand = (y: number, label: string, valoare: string, bold = false, indent = 0) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    T(label, margin + indent, y);
    T(valoare, colRight, y, { align: "right" });
  };

  let y = margin;

  // ─── Header firmă ─────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  T("Calculator generat de salariile.ro", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  T("HG 146/2026 · OUG 89/2025", colRight, y, { align: "right" });
  y += 5;
  doc.setFontSize(8);
  T("Salariu calculat conform legislatiei fiscale 2026", margin, y);
  y += 8;

  linie(y, 0.5);
  y += 8;

  // ─── Titlu document ─────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  T("FLUTURAS SALARIU", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const luna = new Date().toLocaleDateString("ro-RO", { month: "long", year: "numeric" });
  T(`Luna: ${luna.charAt(0).toUpperCase() + luna.slice(1)}`, pageWidth / 2, y, { align: "center" });
  y += 10;

  linie(y);
  y += 8;

  // ─── Linii de calcul (Venituri) ─────────────────────────────────────
  doc.setFontSize(10);

  // Salariu brut
  rand(y, "Salariu brut:", `${brut.toLocaleString("ro-RO")} lei`);
  y += 7;

  // Facilitate (doar dacă se aplică)
  if (esteSalariuMinim && facilitate > 0) {
    doc.setTextColor(80);
    rand(y, "Facilitate fiscala (neimpozabila):", `${facilitate} lei`);
    doc.setTextColor(0);
    y += 7;
  }

  y += 2;
  linie(y);
  y += 8;

  // ─── Rețineri (header secțiune) ─────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  T("RETINERI", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // CAS
  rand(y, "C.A.S. (Asigurari Sociale - 25%)", `- ${rez.cas.toLocaleString("ro-RO")} lei`, false, 5);
  y += 6;

  // CASS
  rand(y, "C.A.S.S. (Asigurari Sanatate - 10%)", `- ${rez.cass.toLocaleString("ro-RO")} lei`, false, 5);
  y += 6;

  // Deducere personală (informativ — text gri)
  if (rez.deducerePersonala > 0) {
    doc.setTextColor(100);
    rand(y, "Deducere personala", `${rez.deducerePersonala.toLocaleString("ro-RO")} lei`, false, 5);
    doc.setTextColor(0);
    y += 6;
  }

  // Bază calcul impozit (informativ — text gri)
  doc.setTextColor(100);
  rand(y, "Baza calcul impozit", `${rez.bazaCalculImpozit.toLocaleString("ro-RO")} lei`, false, 5);
  doc.setTextColor(0);
  y += 6;

  // Impozit
  rand(y, "Impozit pe venit (10%)", `- ${rez.impozit.toLocaleString("ro-RO")} lei`, false, 5);
  y += 8;

  linie(y);
  y += 7;

  // Total rețineri
  doc.setFontSize(10);
  rand(y, "Total Retineri Angajat:", `${(rez.cas + rez.cass + rez.impozit).toLocaleString("ro-RO")} lei`, true);
  y += 9;

  // Salariu net (mare)
  doc.setFontSize(13);
  rand(y, "SALARIU NET:", `${rez.net.toLocaleString("ro-RO")} lei`, true);
  y += 8;

  linie(y, 0.5);
  y += 10;

  // ─── Cost angajator ─────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  T("COST ANGAJATOR", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  rand(y, "C.A.M. (Contributie Munca - 2,25%)", `${rez.cam.toLocaleString("ro-RO")} lei`, false, 5);
  y += 6;
  rand(y, "Cost total firma:", `${rez.costTotal.toLocaleString("ro-RO")} lei`, true);
  y += 14;

  linie(y, 0.2);
  y += 5;

  // ─── Footer ─────────────────────────────────────
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120);
  T("Document generat de salariile.ro · Calcul informativ, conform legislatiei fiscale in vigoare", pageWidth / 2, y, { align: "center" });
  y += 4;
  T(`Generat la ${new Date().toLocaleString("ro-RO")}`, pageWidth / 2, y, { align: "center" });

  // Salvare
  const numefisier = `fluturas-salariu-${brut}-lei.pdf`;
  doc.save(numefisier);
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
{/* ── Hero Minimalist ── */}
      <section className="hero">
        <div className="container">
          {/* Breadcrumb cu rol semantic */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Acasă</a>
            <span>/</span>
            <span aria-current="page">Calculator salariu</span>
          </nav>
          
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
          
          {/* Dateline tehnic, scurt și curat */}
          {!titluCustom && (
            <div className="dateline">
              Ultima actualizare: 30 aprilie 2026 · Validat ANAF D-112
            </div>
          )}
        </div>
      </section>

      {/* ── Calculator ── */}
      <div className="container calc-layout">
        {/* Coloana Stângă */}
      <div className="form-column"> 
      {/* Titlul stă acum AFARĂ, la fel ca în dreapta */}
        <h2 className="results-header">DATE SALARIALE</h2>
        {/* Form */}
        <div className="card form-card">
          <div className="card-head">
            
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

          <InputNumber id="salariu-input" label={mod === "brut" ? "SALARIU BRUT:" : "SALARIU NET:"} value={input.brut} onChange={(v: any) => set("brut", v)} />
          
          <button className="avansat-toggle" onClick={() => {
            if (avansat) { set("tichete", ""); set("functieDeBAza", true); set("persoanePretretinere", 0); set("varstaSub26", false); set("copiiScolarizati", 0); set("scutitImpozit", false); }
            setAvansat(!avansat);
          }}>
            {avansat ? "▲ Ascunde opțiuni avansate" : "▼ Calculator avansat"}
          </button>

          {avansat && (
            <>
              <InputNumber id="tichete-input" label="Tichete de masă" value={input.tichete} onChange={(v: any) => set("tichete", v)} placeholder="0" hint="Valoare lunară totală" />
              <Toggle label="Funcție de bază" checked={input.functieDeBAza} onChange={(v: any) => set("functieDeBAza", v)} />
              <Select id="persoane-intretinere" label="Persoane în întreținere" value={input.persoanePretretinere} options={[0, 1, 2, 3, 4].map((n) => ({ v: n, l: n === 0 ? "Niciuna" : `${n} ${n === 1 ? "persoană" : "persoane"}` }))} onChange={(v: any) => set("persoanePretretinere", v)} />
              <Select id="copii-scolari" label="Copii minori școlari" value={input.copiiScolarizati} options={[0, 1, 2, 3, 4, 5].map((n) => ({ v: n, l: n === 0 ? "Niciunul" : `${n} ${n === 1 ? "copil" : "copii"}` }))} onChange={(v: any) => set("copiiScolarizati", v)} />
              <Toggle label="Vârstă sub 26 ani" checked={input.varstaSub26} onChange={(v: any) => set("varstaSub26", v)} />
              <Toggle label="Scutit de impozit (handicap etc.)" checked={input.scutitImpozit} onChange={(v: any) => set("scutitImpozit", v)} />
            </>
          )}
        </div> {/* <--- AICI SE ÎNCHIDE DIV-UL NOU CREAT */}
      </div>

        {/* Rezultate — editorial: 1 card cu tabel-fluturas */}
        <div className="results-col">
          <h2 className="results-header">REZULTAT CALCUL</h2>

          {rez ? (
            <div className="results-wrapper">
              
              <table className="payslip-table flat-table">
                <thead>
                  <tr>
                    <th>Indicator Fiscal</th>
                    <th>Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="row-bright">
                    <td>Salariu de încadrare (Brut)</td>
                    <td>{fmt(parseFloat(brutEfectiv))}</td>
                  </tr>
                  {parseFloat(brutEfectiv) === SALARIU_MINIM && input.functieDeBAza && (
                    <tr className="sub-row">
                      <td><span className="muted">Facilitate fiscală (neimpozabilă)</span></td>
                      <td>{fmt(DEDUCERE_MINIM)}</td>
                    </tr>
                  )}
                  <tr className="sub-row indent">
                    <td><span className="muted">CAS (Pensii - 25%)</span></td>
                    <td>− {fmt(rez.cas)}</td>
                  </tr>
                  <tr className="sub-row indent">
                    <td><span className="muted">CASS (Sănătate - 10%)</span></td>
                    <td>− {fmt(rez.cass)}</td>
                  </tr>
                  {rez.deducerePersonala > 0 && (
                    <tr className="sub-row indent">
                      <td><span className="muted">Deducere personală (aplicată)</span></td>
                      <td>{fmt(rez.deducerePersonala)}</td>
                    </tr>
                  )}
                  <tr className="row-base">
                    <td>Bază calcul impozit</td>
                    <td>{fmt(rez.bazaCalculImpozit)}</td>
                  </tr>
                  <tr className="sub-row indent">
                    <td><span className="muted">Impozit pe venit (10%)</span></td>
                    <td>− {fmt(rez.impozit)}</td>
                  </tr>
                  <tr className="total-retineri">
                    <td>Total Rețineri Angajat</td>
                    <td>{fmt(rez.cas + rez.cass + rez.impozit)}</td>
                  </tr>
                  <tr className="total-net">
                    <td>SALARIU NET</td>
                    <td>{fmt(rez.net)}</td>
                  </tr>
                </tbody>
                {/* --- RÂND PENTRU SPAȚIERE (Accesibil + Linii corecte) --- */}
                <tbody>
                  <tr className="spacer-row" aria-hidden="true">
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
                {/* --- PARTEA 2: COST ANGAJATOR --- */}
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

              <button
                type="button"
                className="pdf-button"
                onClick={() => generarePDFFluturas(
                  parseFloat(brutEfectiv),
                  rez,
                  parseFloat(brutEfectiv) === SALARIU_MINIM && input.functieDeBAza,
                  DEDUCERE_MINIM
                )}
              >
                ↓ Descarcă fluturaș PDF
              </button>

            </div>
          ) : (
            <div className="empty-card">
              <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M9 12h6m-3-3v6M16 3h5v5M21 3l-7 7" /></svg>
              </div>
              <p>Completează salariul pentru a genera fluturașul</p>
              <span className="empty-hint">Actualizat la grila fiscală 2026 (Minim: 4.050 lei)</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}