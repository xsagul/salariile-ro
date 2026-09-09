"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  calculeaza,
  calculeazaCuRegim,
  calculeazaBrutDinNetCuRegim,
  REGIM_FISCAL_CURENT,
  REGIMURI_FISCALE_SALARIU,
  SALARIU_MINIM,
  type InputState,
  type RegimFiscalSalariu,
  type Rezultat,
} from "@/lib/fiscal";
import { zileLucratoareLuna } from "@/lib/sarbatori";
import { compuneFluturas } from "@/lib/fluturas";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import { TEXTE, type Limba, type TexteCalculator } from "@/lib/calculator-texte";
import { CURS_DATA, EUR_RON, converteste, cursVechi, inEuro, inLei, type Moneda } from "@/lib/curs";

type SelectOption = { v: number; l: string };

type InputNumberProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  onEnter?: () => void;
  tall?: boolean;
  error?: string;
  unit?: string;
};

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
};

type SelectProps = {
  id: string;
  label: string;
  value: number;
  options: SelectOption[];
  onChange: (v: number) => void;
  disabled?: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Formatarea sumelor. Depinde de limbă — separatorul de mii și denumirea monedei
 * diferă între „4.050 lei" și „4,050 RON" — deci se construiește din dicționar,
 * nu se scrie o dată la nivel de modul.
 *
 * `fmt` rămâne varianta românească, pentru codul care rulează în afara
 * componentei. În interiorul ei se folosește o versiune legată de limba aleasă.
 */
const fmtCu = (loc: string, mon: string) => (n: number) =>
  new Intl.NumberFormat(loc).format(n) + " " + mon;
const fmt = fmtCu("ro-RO", "lei");

// Inputurile monetare stochează DOAR cifre în state (ex: "4050"), dar se afișează
// grupate cu separator de mii (ex: "4.050"). Astfel calculul primește mereu un
// întreg corect, iar utilizatorul nu poate strica valoarea tastând un punct.
const doarCifre = (s: string) => s.replace(/\D/g, "");
const grupeazaMii = (raw: string) => {
  const n = Number(raw);
  return raw && Number.isFinite(n) ? new Intl.NumberFormat("ro-RO").format(n) : "";
};

// Construiește rezultatul afișat dintr-un snapshot de input + mod.
// Calculul se face O DATĂ, la momentul click pe Calculează – nu la fiecare render.
// Conține tot ce e nevoie să randeze tabelul + payload-ul PDF.
function buildResult(
  snapshotInput: InputState,
  snapshotMod: "brut" | "net",
  regimFiscal: RegimFiscalSalariu = REGIM_FISCAL_CURENT,
) {
  const brutEfectiv = snapshotMod === "net"
    ? String(calculeazaBrutDinNetCuRegim(parseFloat(snapshotInput.brut) || 0, snapshotInput, regimFiscal))
    : snapshotInput.brut;
  const rez = calculeazaCuRegim({ ...snapshotInput, brut: brutEfectiv }, regimFiscal);
  if (!rez) return null;
  return {
    rez,
    brutEfectiv,
    functieDeBAza: snapshotInput.functieDeBAza,
    scutitImpozit: snapshotInput.scutitImpozit,
  };
}

// Cheie de snapshot a inputului + mod. Folosită pentru a detecta dacă datele
// s-au schimbat față de ultimul calcul → semnalul „rezultat învechit"
// (închide Gulful Evaluării – Norman, DOET cap. 2 & 5).
function inputKey(inp: InputState, m: "brut" | "net") {
  return JSON.stringify([
    m, inp.brut, inp.tichete, inp.functieDeBAza,
    inp.persoanePretretinere, inp.varstaSub26, inp.copiiScolarizati, inp.scutitImpozit,
    inp.salariuDeBaza ?? null, inp.normaContract ?? null, inp.fractieLuna ?? null,
  ]);
}

// Exemple pentru placeholder – derivate din fiscal.ts (NU hardcodate).
const EX_PLACEHOLDER_BRUT = String(SALARIU_MINIM); // 4325
const EX_PLACEHOLDER_NET = String(
  calculeaza({
    brut: String(SALARIU_MINIM),
    tichete: "",
    functieDeBAza: true,
    persoanePretretinere: 0,
    varstaSub26: false,
    copiiScolarizati: 0,
    scutitImpozit: false,
  })?.net ?? ""
); // = 2699 (salariul minim net, caz standard, din 1 iulie 2026)

// ─── Componente UI ────────────────────────────────────────────────────────────

// ─── Clase utilitare reutilizate (design tokens „în linie") ──────────────────
const fieldLabel =
  "mb-2 block text-xs font-medium text-stone-600";
// text-base sm:text-sm → 16px pe mobil împiedică zoom-ul automat iOS la focus; 14px pe desktop.
const controlBox =
  "w-full rounded border border-stone-300 bg-surface px-3 py-2 text-base sm:text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:shadow-[0_0_6px_rgba(28,25,23,0.12)]";

// Celule tabel-fluturaș
const cellL = "border-b border-r border-stone-300 px-3 py-3 text-left";
const cellR = "border-b border-stone-300 px-3 py-3 text-right tabular-nums whitespace-nowrap";
const colHeader =
  "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";

// Am adăugat 'id' în paranteze și am legat label-ul de input
function InputNumber({ id, label, value, onChange, placeholder, hint, onEnter, tall, error, unit = "lei / lună" }: InputNumberProps) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className={fieldLabel}>{label}</label>
      {hint && <span className="mb-2 block text-xs text-stone-600">{hint}</span>}
      <div className={`flex w-full overflow-hidden rounded border transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)] ${error ? "border-stone-500" : "border-stone-300"}`}>
        <input
          id={id}
          name={id}
          type="text"
          inputMode="numeric"
          value={grupeazaMii(value)}
          onChange={(e) => onChange(doarCifre(e.target.value))}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEnter?.(); } }}
          placeholder={placeholder || "0"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-stone-900 outline-none${tall ? " leading-7" : ""}`}
        />
        {unit && <span className="flex items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">{unit}</span>}
      </div>
      {error && <span id={`${id}-error`} role="alert" className="mt-2 block text-xs font-medium text-stone-900">{error}</span>}
    </div>
  );
}

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between border-b border-stone-100 py-3 text-sm text-stone-700 last:border-b-0">
      <span>{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        type="button"
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked ? "bg-stone-900" : "bg-stone-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface shadow-soft transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}

function Select({ id, label, value, options, onChange, disabled = false }: SelectProps) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className={`${fieldLabel} ${disabled ? "opacity-40" : ""}`}>{label}</label>
      <div className="relative">
        <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} className={`${controlBox} appearance-none pr-9 ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
          {options.map((o) => (<option key={o.v} value={o.v}>{o.l}</option>))}
        </select>
        {/* Chevron custom – aliniat la right-3 (12px), oglindă cu px-3 din stânga */}
        <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M5 7.5l5 5 5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
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
    .replace(/ș/g, "s").replace(/Ș/g, "S")
    .replace(/ț/g, "t").replace(/Ț/g, "T")
    .replace(/ț/g, "t").replace(/Ț/g, "T");
}

// Fluturașul imită formatul clasic emis de softurile de salarizare românești
// (SAGA, Nexus): font monospace (Courier), rânduri cu puncte de umplere,
// secțiuni despărțite de linii, câmpuri de completat (unitate, angajat, marcă),
// zile lucrate, baze de calcul, tichete pe card și rest de plată.
async function generarePDFFluturas(opts: {
  brut: number;
  rez: Rezultat;
  nrTichete: string;
  valoareTichet: string;
  scutitImpozit: boolean;
  /** Numele firmei, tipărit în antet (generatorul de fluturaș). */
  firma?: string;
  /** Defalcarea brutului compus: bază + ore suplimentare + sporuri (generatorul de fluturaș). */
  detalii?: { baza: number; bazaRealizata: number; plataSupl: number; oreSupl: number; sporProc: number; fixe: number; oreNorma: number; oreLucrate: number; normaContract: "intreaga" | "partiala"; fractieLuna: number };
  /** Rețineri din net (avans, popriri) — scad din REST DE PLATĂ. */
  retineri?: number;
  /** Textele documentului. Fluturașul se generează în limba interfeței. */
  t: TexteCalculator;
  /** Moneda de afișare. Sumele sunt calculate în lei și convertite doar aici. */
  moneda: Moneda;
}): Promise<void> {
  const { brut, rez, nrTichete, valoareTichet, scutitImpozit, firma, detalii, retineri = 0, t, moneda } = opts;

  // Import dinamic – biblioteca se încarcă doar când utilizatorul apasă butonul
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ─── Valori derivate (oglindesc exact fiscal.ts) ───────────────────────────
  // Facilitatea vine direct din motorul fiscal (sursa unică de adevăr) — include
  // și cazul bază minimă + sporuri sub plafonul OUG 89/2025.
  const facilitateEf = rez.facilitate;
  const tichete = rez.tichete;
  const bazaCas = brut - facilitateEf; //                 D112: A_13
  const bazaCass = brut - facilitateEf + tichete; //      D112: A_11
  const totalRetineri = rez.cas + rez.cass + rez.impozit;

  const azi = new Date();
  const zileLucr = zileLucratoareLuna(azi.getFullYear(), azi.getMonth());
  const lunaNume = azi
    .toLocaleDateString("ro-RO", { month: "long", year: "numeric" })
    .toUpperCase();

  // ─── Geometrie monospace ───────────────────────────────────────────────────
  const pageWidth = 210;
  const margin = 17;
  const boxW = pageWidth - margin * 2;
  const FS = 9; //                       mărimea fontului courier
  const COLS = 84; //                    caractere pe rând (încap în box la 9pt)
  const xText = margin + 4;
  const LH = 5; //                       înălțimea unui rând, mm
  let y = 20;

  // Fluturasul urmeaza moneda aleasa in interfata. Calculul de deasupra e in
  // lei; aici se converteste doar la tiparire, ca sa nu existe doua monede pe
  // acelasi document.
  const lei = (n: number) =>
    moneda === "EUR"
      ? `${converteste(n, "EUR").toLocaleString(t.locale)} EUR`
      : `${n.toLocaleString(t.locale)} ${t.moneda}`;
  const mono = (bold = false, dim = false) => {
    doc.setFont("courier", bold ? "bold" : "normal");
    doc.setFontSize(FS);
    doc.setTextColor(dim ? 110 : 0);
  };

  // Rând "Eticheta ........... valoare" — aliniere perfectă prin monospace.
  const rand = (label: string, valoare: string, o?: { bold?: boolean; dim?: boolean }) => {
    mono(o?.bold, o?.dim);
    const l = fixDiacritice(label);
    const v = fixDiacritice(valoare);
    const dots = ".".repeat(Math.max(2, COLS - l.length - v.length - 2));
    doc.text(`${l} ${dots} ${v}`, xText, y);
    y += LH;
  };

  // Rând cu două coloane (stânga + dreapta), fără puncte — pentru antet/semnături.
  const rand2 = (st: string, dr: string, o?: { bold?: boolean }) => {
    mono(o?.bold);
    const s = fixDiacritice(st);
    const d = fixDiacritice(dr);
    doc.text(s.padEnd(Math.max(s.length + 1, COLS - d.length)) + d, xText, y);
    y += LH;
  };

  // Titlu de secțiune + separator orizontal deasupra lui.
  const sectiune = (titlu?: string) => {
    y += 1;
    doc.setLineWidth(0.2);
    doc.line(margin, y - 3.4, margin + boxW, y - 3.4);
    y += 1.5;
    if (titlu) {
      mono(true);
      doc.text(fixDiacritice(titlu), xText, y);
      y += LH;
    }
  };

  // ─── Titlu document ──────────────────────────────────────────────────────
  doc.setFont("courier", "bold");
  doc.setFontSize(13);
  doc.text(t.pdfTitlu, pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(10);
  doc.text(fixDiacritice(`Luna: ${lunaNume}`), pageWidth / 2, y, { align: "center" });
  y += 8;

  const yBoxTop = y - 4;

  // ─── Antet unitate / angajat (câmpuri de completat, ca pe formularul real) ─
  const numeFirma = (firma || "").trim();
  rand2(
    numeFirma ? `Unitatea: ${numeFirma.slice(0, 34)}` : `Unitatea: ${"_".repeat(34)}`,
    `C.U.I.: ${"_".repeat(14)}`
  );
  rand2(`Angajat:  ${"_".repeat(34)}`, `Marca:  ${"_".repeat(14)}`);
  rand2(`Functia:  ${"_".repeat(34)}`, `CNP:    ${"_".repeat(14)}`);

  // ─── Pontaj ───────────────────────────────────────────────────────────────
  sectiune();
  const oreSuplPontaj = detalii?.oreSupl || 0;
  const oreNormaPontaj = detalii?.oreNorma ?? zileLucr * 8;
  const oreLucratePontaj = detalii?.oreLucrate ?? oreNormaPontaj;
  rand2(
    `Zile lucratoare: ${zileLucr}    Ore norma: ${oreNormaPontaj}    Ore lucrate: ${oreLucratePontaj}${oreSuplPontaj > 0 ? ` + ${oreSuplPontaj} supl.` : ""}`,
    detalii?.normaContract === "partiala" ? t.pdfContractPartial : t.pdfContractIntreaga
  );

  // ─── Drepturi ─────────────────────────────────────────────────────────────
  sectiune(t.pdfDrepturi);
  // Tariful orar standard (informativ, ca pe statul de plată) — bază ÷ normă.
  const bazaPdf = detalii?.baza ?? brut;
  const tarifOrarPdf = oreNormaPontaj > 0
    ? (bazaPdf / oreNormaPontaj).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "";
  const lunaPartiala = detalii ? detalii.oreLucrate < detalii.oreNorma : false;
  if (detalii && (detalii.plataSupl > 0 || detalii.fixe > 0 || lunaPartiala)) {
    rand(t.salariuDeBazaIncadrare, lei(detalii.baza));
    if (tarifOrarPdf) rand(`Ore standard (${oreNormaPontaj} ore/luna)`, `${tarifOrarPdf} lei/ora`, { dim: true });
    if (lunaPartiala) {
      rand(`Venit realizat (${detalii.oreLucrate} din ${detalii.oreNorma} ore)`, lei(detalii.bazaRealizata));
    }
    if (detalii.plataSupl > 0) {
      rand(`Ore suplimentare (${detalii.oreSupl} ore, spor ${detalii.sporProc}%)`, lei(detalii.plataSupl));
    }
    if (detalii.fixe > 0) {
      rand(t.sporuriPrimeRand, lei(detalii.fixe));
    }
    rand(t.venitBrutTotal, lei(brut), { bold: true });
  } else {
    rand(t.salariuDeBazaIncadrare, lei(brut));
    if (tarifOrarPdf) rand(`Ore standard (${oreNormaPontaj} ore/luna)`, `${tarifOrarPdf} lei/ora`, { dim: true });
  }
  if (tichete > 0) {
    const nrT = parseInt(nrTichete) || 0;
    const valT = parseInt(valoareTichet) || 0;
    const detaliu = nrT > 0 && valT > 0 && nrT * valT === tichete ? ` (${nrT} buc x ${valT} lei)` : "";
    rand(`Tichete de masa${detaliu}`, lei(tichete));
  }
  rand("TOTAL DREPTURI", lei(brut + tichete), { bold: true });

  // ─── Rețineri ─────────────────────────────────────────────────────────────
  sectiune(t.pdfRetineri);
  if (facilitateEf > 0) {
    rand("Suma netaxabila salariu minim (OUG 89/2025)", lei(facilitateEf), { dim: true });
  }
  rand(`C.A.S. pensii 25% (baza: ${lei(bazaCas)})`, lei(rez.cas));
  rand(`C.A.S.S. sanatate 10% (baza: ${lei(bazaCass)})`, lei(rez.cass));
  if (rez.deducerePersonala > 0) {
    rand(t.deducerePersonala, lei(rez.deducerePersonala), { dim: true });
  }
  rand(t.bazaImpozit, lei(Math.round(rez.bazaCalculImpozit)), { dim: true });
  rand("Impozit pe venit 10%", scutitImpozit ? "0 lei (scutit)" : lei(rez.impozit));
  rand(t.totalRetineri, lei(totalRetineri), { bold: true });

  // ─── De plată ─────────────────────────────────────────────────────────────
  sectiune("DE PLATA");
  // „Salariu net" = după taxe; ce intră efectiv în cont e REST DE PLATA (după
  // rețineri) — exact ca pe fluturașul real.
  rand(t.pdfSalariuNet, lei(rez.netBani), { bold: true });
  if (tichete > 0) {
    rand("Tichete de masa (pe card, valoare integrala)", lei(tichete));
    rand("TOTAL INCASAT (cont + card)", lei(rez.net), { bold: true });
  }
  rand(t.retineriRand, lei(retineri));
  rand("REST DE PLATA", lei(rez.netBani - retineri), { bold: true });

  // Fluturașul real e documentul ANGAJATULUI — costurile angajatorului (CAM,
  // cost total) nu apar pe el, deci nu apar nici aici, nici în tabelul de pe pagină.

  // ─── Semnături ────────────────────────────────────────────────────────────
  sectiune();
  rand2(t.pdfIntocmit, t.pdfAmPrimit);
  y += 4;
  rand2("_".repeat(24), "_".repeat(24));
  y += 1;

  // Chenarul documentului
  doc.setLineWidth(0.4);
  doc.rect(margin, yBoxTop, boxW, y - yBoxTop - 2);

  // ─── Footer ───────────────────────────────────────────────────────────────
  y += 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(
    fixDiacritice("Document informativ generat pe salariile.ro, conform HG 146/2026 si OUG 89/2025."),
    pageWidth / 2, y, { align: "center" }
  );
  y += 3.6;
  doc.text(
    fixDiacritice(`Nu inlocuieste fluturasul oficial emis de angajator. Generat la ${azi.toLocaleString("ro-RO")}.`),
    pageWidth / 2, y, { align: "center" }
  );

  // Salvare
  const lunaSlug = azi.toLocaleDateString("ro-RO", { month: "long" }).toLowerCase();
  doc.save(`fluturas-salariu-${brut}-lei-${fixDiacritice(lunaSlug)}-${azi.getFullYear()}.pdf`);
}

// ─── Componenta principală (ACUM ACCEPTĂ PROPS DINAMICE) ──────────────────────

export default function CalculatorSalariu({
  brutInitial = "",
  modInitial = "brut",
  titluCustom,
  subtitluCustom,
  regimFiscal = REGIM_FISCAL_CURENT,
  wide = false,
  fluturas = false,
  embedded = false,
  limba = "ro",
  monedaInitiala = "RON",
  cuMoneda = false,
}: {
  brutInitial?: string;
  modInitial?: "brut" | "net";
  titluCustom?: React.ReactNode;
  subtitluCustom?: React.ReactNode;
  /** Perioada fiscală păstrată explicit pe paginile istorice. Implicit: regimul curent. */
  regimFiscal?: RegimFiscalSalariu;
  wide?: boolean;
  /** Mod generator de fluturaș: câmpuri de stat de plată (firmă, ore suplimentare,
   *  sporuri, rețineri), direcția fixă brut→net. Folosit de /fluturas-salariu. */
  fluturas?: boolean;
  /** Ascunde hero-ul când grila calculatorului este reutilizată într-un iframe. */
  embedded?: boolean;
  /**
   * Limba interfeței. Româna e implicită, deci paginile existente nu transmit
   * nimic și randează exact ca înainte. Engleza e folosită de
   * /en/salary-calculator, care e ACELAȘI calculator, nu o variantă
   * simplificată — de aceea textele stau într-un dicționar, nu într-o a doua
   * componentă care ar diverge la prima modificare fiscală.
   */
  limba?: Limba;
  /**
   * Moneda de afișare și de introducere a sumei. Calculul rămâne ÎNTOTDEAUNA în
   * lei — contribuțiile, plafoanele și deducerea sunt scrise în lege în lei.
   * Euro e un strat de conversie la intrare și la ieșire, la cursul de referință
   * BCE, cu data lui afișată. Pagina engleză pornește în euro.
   */
  monedaInitiala?: Moneda;
  /**
   * Arată comutatorul RON/EUR. Implicit ascuns, ca paginile românești să rămână
   * exact cum erau — o pagină în lei nu are nevoie de el, iar homepage-ul nu
   * trebuie atins.
   */
  cuMoneda?: boolean;
}) {
  const t = TEXTE[limba];
  const [moneda, setMoneda] = useState<Moneda>(monedaInitiala);
  // Umbrește `fmt`-ul de modul, ca toate sumele afișate în componentă să urmeze
  // limba aleasă fără să fie nevoie să se atingă fiecare apel în parte.
  // Sumele se calculează în lei și se convertesc doar la afișare. Un singur
  //  pentru tot tabelul înseamnă că nicio linie nu poate rămâne în altă
  // monedă decât celelalte.
  const fmtLei = fmtCu(t.locale, t.moneda);
  // Eticheta unității urmează moneda aleasă, nu limba: în euro scrie „EUR",
  // nu „RON". Altfel câmpul cere lei și afișează euro.
  const etMoneda = moneda === "EUR" ? "EUR" : t.moneda;
  const etMonedaLuna = `${etMoneda} ${t.perLuna}`;
  /** Un exemplu în lei, arătat în moneda aleasă. */
  const exemplu = (lei: number) => grupeazaMii(String(converteste(lei, moneda)));
  const fmt = (n: number) =>
    moneda === "EUR"
      ? new Intl.NumberFormat(t.locale).format(converteste(n, "EUR")) + " EUR"
      : fmtLei(n);
  const wrap = wide ? "max-w-7xl" : "max-w-6xl";
  const [mod, setMod] = useState<"brut" | "net">(modInitial);
  const [avansat, setAvansat] = useState(false);
  // Avertisment scurt când se apasă Calculează fără un salariu valid (Nielsen h1/h9).
  const [emptyWarn, setEmptyWarn] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [linkCopiat, setLinkCopiat] = useState(false);
  // Tichete: nr. × valoare/tichet → total stocat în input.tichete (calculul folosește totalul).
  const [nrTichete, setNrTichete] = useState("");
  const [valoareTichet, setValoareTichet] = useState("");

  // Câmpurile generatorului de fluturaș (folosite doar când fluturas=true).
  // Firma și reținerile NU intră în calculul fiscal: firma apare doar pe PDF,
  // reținerile se scad din net (aplicate „live", fără recalcul).
  const [firma, setFirma] = useState("");
  const [sporOre, setSporOre] = useState("75");
  const [sporuri, setSporuri] = useState("");
  const [retineri, setRetineri] = useState("");
  const [normaOre, setNormaOre] = useState("");
  const [oreLucrate, setOreLucrate] = useState("");
  // Norma reală a lunii curente — placeholder pentru normă și ore lucrate.
  const oreNormaCurenta = zileLucratoareLuna(new Date().getFullYear(), new Date().getMonth()) * 8;

  const initialInput: InputState = {
    brut: brutInitial,
    tichete: "",
    functieDeBAza: true,
    persoanePretretinere: 0,
    varstaSub26: false,
    copiiScolarizati: 0,
    scutitImpozit: false,
  };

  const [input, setInput] = useState<InputState>(initialInput);

  // În modul fluturaș, inputul de calcul e brutul COMPUS (bază + suplimentare +
  // sporuri) cu salariuDeBaza atașat; altfel, inputul brut, neschimbat.
  // Sumele tastate sunt in moneda aleasa; motorul fiscal primeste MEREU lei.
  // Conversia se face aici, in singurul loc prin care trece orice calcul — si
  // calculul propriu-zis, si cheia de prospetime a rezultatului. Daca ar fi
  // facuta in doua locuri, cele doua ar putea diverge si rezultatul ar parea
  // invechit fara motiv.
  const inLeiDacaTrebuie = (v: string) =>
    moneda === "EUR" && parseFloat(v) > 0 ? String(inLei(parseFloat(v))) : v;

  /** Inputul, cu sumele aduse în lei. Motorul fiscal nu vede niciodată euro. */
  const inputInLei = (inp: InputState): InputState =>
    moneda === "EUR"
      ? { ...inp, brut: inLeiDacaTrebuie(inp.brut), tichete: inLeiDacaTrebuie(inp.tichete) }
      : inp;

  const pregatesteInput = (inp: InputState): InputState => {
    const inLeiInp = inputInLei(inp);
    return fluturas
      ? compuneFluturas(inLeiInp, { sporOre, sporuri, normaOre, oreLucrate }, oreNormaCurenta).input
      : inLeiInp;
  };

  // Rezultatul afișat – calculat O DATĂ la click pe Calculează, stocat ca obiect.
  // Nu se schimbă la tastare/toggle, doar la click. La mount, dacă brutInitial
  // e prezent (pagini dinamice tip /4050-brut-...), pre-calculează (auto-commit
  // pentru SEO/SSR – Google vede tabelul completat la randare).
  const [rezAfisat, setRezAfisat] = useState<ReturnType<typeof buildResult>>(
    brutInitial && parseFloat(brutInitial) > 0 ? buildResult(pregatesteInput(initialInput), modInitial, regimFiscal) : null
  );

  // Defalcarea brutului compus la momentul ultimului calcul (doar mod fluturaș).
  const [fluturasSnap, setFluturasSnap] = useState<{ baza: number; bazaRealizata: number; plataSupl: number; fixe: number; oreSupl: number; sporProc: number; oreNorma: number; oreLucrate: number; normaContract: "intreaga" | "partiala"; fractieLuna: number } | null>(
    fluturas && brutInitial && parseFloat(brutInitial) > 0
      ? (() => { const c = compuneFluturas(initialInput, { sporOre: "75", sporuri: "", normaOre: "", oreLucrate: "" }, oreNormaCurenta); return { baza: c.baza, bazaRealizata: c.bazaRealizata, plataSupl: c.plataSupl, fixe: c.fixe, oreSupl: c.oreSupl, sporProc: 75, oreNorma: c.oreNorma, oreLucrate: c.oreLucrate, normaContract: c.normaContract, fractieLuna: c.fractieLuna }; })()
      : null
  );

  // Cheia inputului care a produs rezultatul afișat (pentru detectarea „învechirii").
  const [rezKey, setRezKey] = useState<string>(
    brutInitial && parseFloat(brutInitial) > 0 ? inputKey(pregatesteInput(initialInput), modInitial) : ""
  );

  const set = useCallback(
    <K extends keyof InputState>(k: K, v: InputState[K]) =>
      setInput((p) => ({ ...p, [k]: v })),
    []
  );

  // Calculează O DATĂ + derulează la rezultat. Folosit de butonul „Calculează"
  // ȘI de tasta Enter din câmpul de salariu.
  const handleCalculeaza = useCallback(() => {
    // Câmp gol / invalid → nu calcula; semnalează și pune focus pe input.
    if (!((parseFloat(input.brut) || 0) > 0)) {
      setEmptyWarn(true);
      if (typeof window !== "undefined") document.getElementById("salariu-input")?.focus();
      return;
    }
    setEmptyWarn(false);
    if (fluturas) {
      const c = compuneFluturas(inputInLei(input), { sporOre, sporuri, normaOre, oreLucrate }, oreNormaCurenta);
      setRezAfisat(buildResult(c.input, mod, regimFiscal));
      setRezKey(inputKey(c.input, mod));
      setFluturasSnap({ baza: c.baza, bazaRealizata: c.bazaRealizata, plataSupl: c.plataSupl, fixe: c.fixe, oreSupl: c.oreSupl, sporProc: parseFloat(sporOre) || 0, oreNorma: c.oreNorma, oreLucrate: c.oreLucrate, normaContract: c.normaContract, fractieLuna: c.fractieLuna });
    } else {
      // `pregatesteInput`, nu `input`: altfel cheia rezultatului s-ar calcula pe
      // suma în euro, iar verificarea de prospețime pe cea în lei — și rezultatul
      // ar apărea învechit imediat după ce a fost calculat.
      setRezAfisat(buildResult(pregatesteInput(input), mod, regimFiscal));
      setRezKey(inputKey(pregatesteInput(input), mod));
    }
    if (typeof window === "undefined") return;

    // Rezultatul devine partajabil: pana acum, dupa un calcul, URL-ul ramanea „/"
    // si nu puteai trimite nimanui cifra la care ajunsesesi.
    //
    // Se rescrie DOAR pe calculatorul liber. Intr-un iframe n-avem ce cauta in
    // URL-ul gazdei, iar paginile /calculator/<valoare>-brut sunt deja adresa
    // permanenta a acelui calcul si nu se rescriu peste ele.
    // Canonical-ul homepage-ului e fix, deci parametrul nu creeaza duplicat.
    if (!embedded && !brutInitial) {
      // Linkul poartă întotdeauna lei, indiferent de moneda afișată. Altfel un
      // link făcut în euro s-ar redeschide ca lei și ar arăta alt salariu.
      const valoare = Math.round(parseFloat(inputInLei(input).brut) || 0);
      if (valoare > 0) {
        const parametri = new URLSearchParams({ [mod]: String(valoare) });
        window.history.replaceState(null, "", `?${parametri}`);
        setLinkCopiat(false);
      }
    }

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const targetId = isMobile ? "rezultat-calcul" : "calc-layout";
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [input, mod, regimFiscal, fluturas, sporOre, sporuri, normaOre, oreLucrate, oreNormaCurenta, embedded, brutInitial]);

  // Deschiderea unui link partajat: „?brut=5000" trebuie sa arate calculul, nu
  // un formular gol.
  //
  // De ce efect si nu initializator de stare: pe server nu exista `location`.
  // Daca starea initiala ar citi URL-ul, serverul ar randa un formular gol si
  // clientul unul completat — hidratare rupta pe pagina cea mai vizitata a
  // site-ului. Efectul ruleaza o singura data, dupa hidratare, si e exact cazul
  // descris in documentatia regulii: sincronizare cu un sistem din afara React,
  // aici bara de adrese. De aceea regula e dezactivata punctual, cu motiv.
  const paramCitit = useRef(false);
  useEffect(() => {
    if (paramCitit.current || embedded || brutInitial) return;

    const parametri = new URLSearchParams(window.location.search);
    const dinBrut = parametri.get("brut");
    const dinNet = parametri.get("net");
    // `salariu-input` nu vine dintr-un link partajat, ci dintr-un submit nativ:
    // cine tasteaza si apasa Enter INAINTE ca React sa se hidrateze declanseaza
    // trimiterea normala a formularului, fiindca `preventDefault` nu exista inca.
    // Browserul reincarca pagina cu `?salariu-input=<valoare>`, iar omul ramanea
    // cu formularul gol dupa ce tocmai isi scrisese salariul.
    // Masurat in Umami pe 24 august 2026: 28 de aparitii reale. Il tratam ca pe
    // un `brut` si normalizam URL-ul, deci reincarcarea da raspunsul, nu un gol.
    const dinSubmitNativ = parametri.get("salariu-input");
    const brut = dinBrut ?? dinNet ?? dinSubmitNativ;
    if (!brut) return;

    // Valoarea poate veni formatata („7.823"), asa cum o afiseaza inputul.
    const valoare = Math.round(Number(String(brut).replace(/[^\d]/g, "")));
    // Taie valorile absurde dintr-un link modificat manual.
    if (!Number.isFinite(valoare) || valoare <= 0 || valoare > 10_000_000) return;

    paramCitit.current = true;
    const modDinLink = dinNet && !dinBrut ? "net" : "brut";
    // Linkul poartă lei. Dacă interfața e în euro, câmpul trebuie să arate euro,
    // altfel omul vede „4.325" lângă eticheta EUR. Se convertește o singură dată,
    // iar rezultatul și cheia se calculează din valoarea convertită înapoi — nu
    // din cea originală — ca rotunjirea dus-întors să nu lase rezultatul
    // permanent „învechit" pentru un leu diferență.
    const inputNou: InputState = {
      brut: String(moneda === "EUR" ? inEuro(valoare) : valoare),
      tichete: "",
      functieDeBAza: true,
      persoanePretretinere: 0,
      varstaSub26: false,
      copiiScolarizati: 0,
      scutitImpozit: false,
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- citire unica din URL dupa hidratare; vezi comentariul de mai sus
    setMod(modDinLink);
    setInput(inputNou);
    setRezAfisat(buildResult(pregatesteInput(inputNou), modDinLink, regimFiscal));
    setRezKey(inputKey(pregatesteInput(inputNou), modDinLink));

    // Dupa un submit nativ, URL-ul contine numele campului din formular. Il
    // rescriem in forma partajabila, ca sa nu circule linkuri cu `salariu-input`.
    if (dinSubmitNativ && !dinBrut && !dinNet) {
      window.history.replaceState(null, "", `?${new URLSearchParams({ brut: String(valoare) })}`);
    }
    // Fara scroll: cine deschide linkul vede pagina de la inceput, ca oricare alta.
  }, [embedded, brutInitial, regimFiscal]);

  const handleCopiazaLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopiat(true);
      window.setTimeout(() => setLinkCopiat(false), 3000);
    } catch {
      // Clipboard refuzat (permisiuni, context non-secure): selectam URL-ul din
      // bara de adrese nu putem, dar utilizatorul il are deja acolo, corect.
      setLinkCopiat(false);
    }
  };

  // Rezultatul afișat e „învechit" dacă datele curente diferă de cele de la ultimul calcul.
  const stale = rezAfisat !== null && rezKey !== inputKey(pregatesteInput(input), mod);
  // Reținerile se aplică live pe net (scădere simplă, fără recalcul fiscal).
  const retineriNum = fluturas ? Math.max(0, parseInt(retineri) || 0) : 0;
  const handleDescarcaPdf = async () => {
    if (!rezAfisat || stale) return;
    setPdfStatus("generating");
    try {
      await generarePDFFluturas({
        brut: parseFloat(rezAfisat.brutEfectiv), rez: rezAfisat.rez, nrTichete, valoareTichet,
        scutitImpozit: rezAfisat.scutitImpozit, firma: fluturas ? firma : undefined,
        detalii: fluturas && fluturasSnap ? fluturasSnap : undefined, retineri: retineriNum,
        t, moneda,
      });
      setPdfStatus("success");
    } catch {
      setPdfStatus("error");
    }
  };
  // Firma și luna NU apar în tabelul de pe ecran (ar aglomera UI-ul) — doar pe
  // PDF, unde antetul documentului le are ca pe fluturașul real.

  return (
    <>
      {/* ── Hero ── */}
      {!embedded && (
        <section className="border-b border-stone-200 bg-canvas">
          <div className={`mx-auto ${wrap} px-4 py-8 sm:px-6 sm:py-12`}>
            {/* Hero pe aceeași grilă (col-span-3) = exact lățimea cardului „Rezultat calcul", la orice viewport. */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className="md:col-span-3">
                {/* Breadcrumb doar pe pagini dinamice, nu pe homepage */}
                {titluCustom && (
                  <nav className="mb-4 flex gap-2 text-xs text-stone-600" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-stone-700">{t.acasa}</Link>
                    <span>/</span>
                    <span aria-current="page">{fluturas ? t.breadcrumbFluturas : t.breadcrumbCalculator}</span>
                  </nav>
                )}

                {/* Titlul Dinamic */}
                <h1 className="mb-3 text-3xl font-bold tracking-[-0.02em] text-stone-900 sm:text-4xl">
                  {titluCustom || <>{t.titlu}</>}
                </h1>

                {/* Subtitlul Dinamic */}
                <p className="max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 [&_a]:font-medium [&_a]:text-stone-700 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-stone-900">
                  {subtitluCustom || (
                    <>
                      {t.subtitluInainteLink}
                      <a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener noreferrer">HG 146/2026</a>
                      {t.subtitluIntreLinkuri}
                      <a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener noreferrer">OUG 89/2025</a>{t.subtitluDupaLink}
                    </>
                  )}
                </p>

                {/* Dateline tehnic, scurt și curat */}
                {!titluCustom && (
                  <div className="mt-4 text-xs text-stone-600">
                    {t.ultimaActualizare}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Calculator ── */}
      <div className={`mx-auto grid ${wrap} gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-5`} id="calc-layout">
        {/* Coloana Stângă – formular */}
        <form
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2"
          data-md-strip
          onSubmit={(event) => {
            event.preventDefault();
            handleCalculeaza();
          }}
        >
          <h2 className={colHeader}>{t.dateSalariale}</h2>

          {!fluturas && (
          <div className="mb-5">
            <span className={fieldLabel}>{t.directieCalcul}</span>
            <div className="flex w-full overflow-hidden rounded border border-stone-300">
              <button
                type="button"
                className={`flex-1 inline-flex min-h-11 items-center justify-center px-4 text-sm font-medium transition-colors ${mod === "brut" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-canvas"}`}
                onClick={() => {
                  if (mod === "brut") return;
                  if (mod === "net") {
                    const netVal = parseFloat(input.brut);
                    if (netVal > 0) set("brut", String(calculeazaBrutDinNetCuRegim(netVal, input, regimFiscal)));
                  }
                  setMod("brut");
                }}
              >
                {t.dinBrutInNet}
              </button>
              <button
                type="button"
                className={`border-l border-stone-300 flex-1 inline-flex min-h-11 items-center justify-center px-4 text-sm font-medium transition-colors ${mod === "net" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-canvas"}`}
                onClick={() => {
                  if (mod === "net") return;
                  if (mod === "brut") {
                    const brutVal = parseFloat(input.brut);
                    if (brutVal > 0) {
                      const rezTemp = calculeazaCuRegim(input, regimFiscal);
                      if (rezTemp) set("brut", String(rezTemp.netBani));
                    }
                  }
                  setMod("net");
                }}
              >
                {t.dinNetInBrut}
              </button>
            </div>
          </div>
          )}

          {/* Comutator de monedă. Schimbă și suma tastată, ca valoarea reală să
              rămână aceeași: 5.250 lei devin 1.000 EUR, nu 5.250 EUR. */}
          {cuMoneda && (
          <div className="mb-5">
            <span className={fieldLabel}>{t.moneda_}</span>
            <div className="flex w-full overflow-hidden rounded border border-stone-300">
              {(["EUR", "RON"] as const).map((m, i) => (
                <button
                  key={m}
                  type="button"
                  className={`${i > 0 ? "border-l border-stone-300 " : ""}flex-1 inline-flex min-h-11 items-center justify-center px-4 text-sm font-medium transition-colors ${moneda === m ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-canvas"}`}
                  onClick={() => {
                    if (moneda === m) return;
                    const val = parseFloat(input.brut);
                    if (val > 0) set("brut", String(m === "EUR" ? Math.round(val / EUR_RON) : Math.round(val * EUR_RON)));
                    setMoneda(m);
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-stone-600">
              {t.cursNota(String(EUR_RON), CURS_DATA)}
              {cursVechi() ? <> · {t.cursVechiNota}</> : null}
            </p>
          </div>
          )}

          <InputNumber id="salariu-input" unit={etMonedaLuna} label={fluturas ? t.salariuDeBazaBrut : mod === "brut" ? t.salariuBrut : t.salariuNet} value={input.brut} onChange={(v) => { set("brut", v); if (emptyWarn) setEmptyWarn(false); }} placeholder={mod === "brut" ? `${t.exemplu} ${exemplu(Number(EX_PLACEHOLDER_BRUT))}` : `${t.exemplu} ${exemplu(Number(EX_PLACEHOLDER_NET))}`} onEnter={handleCalculeaza} error={emptyWarn ? t.eroareSalariuGol : undefined} tall />

          <button
            type="button"
            className="mb-5 flex min-h-11 w-full items-center justify-center rounded border border-dashed border-stone-300 px-4 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-700"
            onClick={() => {
              if (avansat) {
                set("tichete", ""); setNrTichete(""); setValoareTichet(""); set("functieDeBAza", true); set("persoanePretretinere", 0); set("varstaSub26", false); set("copiiScolarizati", 0); set("scutitImpozit", false);
                if (fluturas) { setFirma(""); setSporOre("75"); setSporuri(""); setRetineri(""); setNormaOre(""); setOreLucrate(""); }
              }
              setAvansat(!avansat);
            }}
          >
            {avansat ? t.ascundeAvansate : t.calculatorAvansat}
          </button>

          {avansat && (
            <>
              {fluturas && (
                <>
                  {/* Câmpurile statului de plată — doar în generatorul de fluturaș */}
                  <div className="mb-5">
                    <label htmlFor="firma-input" className={fieldLabel}>{t.firma}</label>
                    <input
                      id="firma-input"
                      name="firma-input"
                      type="text"
                      value={firma}
                      onChange={(e) => setFirma(e.target.value)}
                      placeholder="ex: Exemplu SRL"
                      maxLength={34}
                      className={controlBox}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputNumber id="norma-ore" label={t.normaContract} unit={t.ore} value={normaOre} placeholder={`${t.exemplu} ${oreNormaCurenta}`}
                      onChange={setNormaOre} />
                    <InputNumber id="ore-lucrate" label={t.oreLucrate} unit={t.ore} value={oreLucrate} placeholder={`${t.exemplu} ${oreNormaCurenta}`}
                      onChange={setOreLucrate} />
                  </div>
                  <p className="-mt-3 mb-5 text-xs text-stone-600">
                    Norma întreagă a lunii curente este {oreNormaCurenta} ore. O normă contractuală mai mică este tratată ca
                    timp parțial, fără facilitatea OUG 89/2025. La normă întreagă, orele lucrate sub normă proratează baza și
                    facilitatea; peste normă, diferența este plătită ca ore suplimentare.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <InputNumber id="spor-ore" label={t.sporOreSupl} unit="%" value={sporOre} placeholder={`${t.exemplu} 75`}
                      onChange={setSporOre} />
                    <InputNumber id="sporuri-fixe" label={t.sporuriPrime} unit={etMoneda} value={sporuri} placeholder={`${t.exemplu} ${exemplu(200)}`}
                      onChange={setSporuri} />
                  </div>
                  <p className="-mt-3 mb-5 text-xs text-stone-600">
                    Sporul legal minim la ore suplimentare e 75% (Codul Muncii art. 123). Sporurile brute se taxează ca salariul.
                  </p>
                  <InputNumber id="retineri-input" label={t.retineri} unit={etMoneda} value={retineri} placeholder={`${t.exemplu} 0`}
                    onChange={setRetineri} hint={t.retineriExplicatie} />
                </>
              )}
              {/* Câmpuri-valoare (cât / câți) – ritm de câmp, mb-5 fiecare */}
              {/* Tichete de masă: nr. × valoare/tichet, înmulțite automat în total */}
              <div className="grid grid-cols-2 gap-3">
                <InputNumber id="nr-tichete" label={t.tichetePeLuna} unit="" value={nrTichete} placeholder={`${t.exemplu} 21`}
                  onChange={(v) => { setNrTichete(v); const t = (parseInt(v) || 0) * (parseInt(valoareTichet) || 0); set("tichete", t ? String(t) : ""); }} />
                <InputNumber id="valoare-tichet" label={t.valoareTichet} unit={etMoneda} value={valoareTichet} placeholder={`${t.exemplu} ${exemplu(40)}`}
                  onChange={(v) => { setValoareTichet(v); const t = (parseInt(nrTichete) || 0) * (parseInt(v) || 0); set("tichete", t ? String(t) : ""); }} />
              </div>
              <p className="-mt-3 mb-5 text-xs text-stone-600">
                {t.tichetExplicatie}
                {(parseInt(input.tichete) || 0) > 0 && (
                  <> Total: <span className="font-medium text-stone-700">{fmt(parseInt(input.tichete))}</span> / lună.</>
                )}
              </p>
              <Select id="persoane-intretinere" label={t.persoaneIntretinere} value={input.persoanePretretinere} options={[0, 1, 2, 3, 4, 5].map((n) => ({ v: n, l: n === 0 ? "Niciuna" : `${n} ${n === 1 ? "persoană" : "persoane"}` }))} onChange={(v) => { set("persoanePretretinere", v); if (input.copiiScolarizati > v) set("copiiScolarizati", v); }} />
              <Select id="copii-scolari" label={t.copiiScolari} value={input.copiiScolarizati} disabled={input.persoanePretretinere === 0} options={Array.from({ length: input.persoanePretretinere + 1 }, (_, n) => ({ v: n, l: n === 0 ? "Niciunul" : `${n} ${n === 1 ? "copil" : "copii"}` }))} onChange={(v) => set("copiiScolarizati", v)} />
              {/* Switch-uri (da/nu) – listă contiguă cu hairline-uri interne; last:border-b-0 prinde pe Scutit */}
              <div>
                <Toggle label={t.functieDeBaza} checked={input.functieDeBAza} onChange={(v) => set("functieDeBAza", v)} />
                <Toggle label={t.varstaSub26} checked={input.varstaSub26} onChange={(v) => set("varstaSub26", v)} />
                <Toggle label="Scutit de impozit (de exemplu, handicap)" checked={input.scutitImpozit} onChange={(v) => set("scutitImpozit", v)} />
              </div>
            </>
          )}

          <button
            type="submit"
            className={`${avansat ? "mt-5 " : ""}block min-h-12 w-full rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px`}
            aria-label={t.ariaCalculeaza}
          >
            {t.calculeaza}
          </button>
        </form>

        {/* Coloana Dreaptă – rezultate */}
        <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3" id="rezultat-calcul">
          <h2 className={colHeader}>{fluturas ? t.fluturasDeSalariu : t.rezultatCalcul}</h2>

          {stale && (
            <p className="mb-4 rounded border border-stone-300 bg-canvas px-3 py-2 text-xs text-stone-600" role="status">
              {t.staleInainte}
              <strong className="font-medium text-stone-900">{t.calculeaza}</strong>{t.staleDupa}
            </p>
          )}

          {rezAfisat && fluturas ? (
            /* Modul fluturaș: rezultatul E fluturașul. Trei blocuri separate
               (Drepturi / Rețineri / De plată), cu aceeași despărțitură vizuală
               ca pe homepage între tabelul principal și costurile angajatorului. */
            <div className={stale ? "opacity-50 transition-opacity" : "transition-opacity"}>
              {/* Drepturi salariale */}
              <div className="overflow-hidden rounded border border-stone-300">
                <table className="w-full table-auto border-collapse [&_td]:align-middle [&_th]:align-middle sm:table-fixed text-sm text-stone-700">
                  <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                  <thead>
                    <tr>
                      <th className="border-b border-b-stone-300 border-r border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">{t.indicatorFiscal}</th>
                      <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">{t.suma}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`${cellL} font-medium text-stone-900`}>{t.salariuDeBazaIncadrare}</td>
                      <td className={`${cellR} font-medium text-stone-900`}>{fmt(fluturasSnap?.baza ?? parseFloat(rezAfisat.brutEfectiv))}</td>
                    </tr>
                    {fluturasSnap && fluturasSnap.oreNorma > 0 && fluturasSnap.baza > 0 && (
                      <tr>
                        <td className={`${cellL} text-stone-600`}>Ore standard ({fluturasSnap.oreNorma} ore/lună)</td>
                        <td className={`${cellR} text-stone-600`}>{(fluturasSnap.baza / fluturasSnap.oreNorma).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei/oră</td>
                      </tr>
                    )}
                    {fluturasSnap && fluturasSnap.oreLucrate < fluturasSnap.oreNorma && (
                      <tr>
                        <td className={`${cellL} pl-4 sm:pl-8`}>Venit realizat ({fluturasSnap.oreLucrate} din {fluturasSnap.oreNorma} ore)</td>
                        <td className={cellR}>{fmt(fluturasSnap.bazaRealizata)}</td>
                      </tr>
                    )}
                    {fluturasSnap && fluturasSnap.plataSupl > 0 && (
                      <tr>
                        <td className={`${cellL} pl-4 sm:pl-8`}>Ore suplimentare ({fluturasSnap.oreSupl} ore, spor {fluturasSnap.sporProc}%)</td>
                        <td className={cellR}>+ {fmt(fluturasSnap.plataSupl)}</td>
                      </tr>
                    )}
                    {fluturasSnap && fluturasSnap.fixe > 0 && (
                      <tr>
                        <td className={`${cellL} pl-4 sm:pl-8`}>{t.sporuriPrimeRand}</td>
                        <td className={cellR}>+ {fmt(fluturasSnap.fixe)}</td>
                      </tr>
                    )}
                    {rezAfisat.rez.tichete > 0 && (
                      <tr>
                        <td className={cellL}>
                          Tichete de masă{(parseInt(nrTichete) || 0) > 0 && (parseInt(valoareTichet) || 0) > 0 ? ` (${parseInt(nrTichete)} × ${parseInt(valoareTichet)} lei)` : ""}
                        </td>
                        <td className={cellR}>+ {fmt(rezAfisat.rez.tichete)}</td>
                      </tr>
                    )}
                    <tr className="bg-canvas">
                      <td className={`${cellL} border-b-0 font-bold text-stone-900`}>Total drepturi</td>
                      <td className={`${cellR} border-b-0 font-bold text-stone-900`}>{fmt(parseFloat(rezAfisat.brutEfectiv) + rezAfisat.rez.tichete)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rețineri */}
              <div className="mt-3 overflow-hidden rounded border border-stone-300">
                <table className="w-full table-auto border-collapse [&_td]:align-middle sm:table-fixed text-sm text-stone-700">
                  <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                  <tbody>
                    {rezAfisat.rez.facilitate > 0 && (
                      <tr>
                        <td className={`${cellL} text-stone-600`}>{t.sumaNetaxabila}</td>
                        <td className={`${cellR} text-stone-600`}>{fmt(rezAfisat.rez.facilitate)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className={cellL}>CAS (pensii – 25%)</td>
                      <td className={cellR}>− {fmt(rezAfisat.rez.cas)}</td>
                    </tr>
                    <tr>
                      <td className={cellL}>{t.cassSanatate}</td>
                      <td className={cellR}>− {fmt(rezAfisat.rez.cass)}</td>
                    </tr>
                    {rezAfisat.rez.deducerePersonala > 0 && (
                      <tr>
                        <td className={`${cellL} text-stone-600`}>{t.deducerePersonala}</td>
                        <td className={`${cellR} text-stone-600`}>{fmt(rezAfisat.rez.deducerePersonala)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className={cellL}>{t.impozitVenit}</td>
                      <td className={cellR}>− {fmt(rezAfisat.rez.impozit)}</td>
                    </tr>
                    <tr className="bg-canvas">
                      <td className={`${cellL} border-b-0 font-bold text-stone-900`}>{t.totalRetineri}</td>
                      <td className={`${cellR} border-b-0 font-bold text-stone-900`}>{fmt(rezAfisat.rez.cas + rezAfisat.rez.cass + rezAfisat.rez.impozit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* De plată */}
              <div className="mt-3 overflow-hidden rounded border border-stone-300">
                <table className="w-full table-auto border-collapse [&_td]:align-middle sm:table-fixed text-sm text-stone-700">
                  <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                  <tbody>
                    <tr className="bg-stone-900">
                      <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">{t.salariuNetRand}</td>
                      <td className="px-3 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap text-white">{fmt(rezAfisat.rez.netBani)}</td>
                    </tr>
                    {rezAfisat.rez.tichete > 0 && (
                      <tr>
                        <td className={cellL}>{t.tichetePeCard}</td>
                        <td className={cellR}>+ {fmt(rezAfisat.rez.tichete)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className={cellL}>{t.retineriRand}</td>
                      <td className={cellR}>− {fmt(retineriNum)}</td>
                    </tr>
                    <tr className="bg-canvas">
                      <td className={`${cellL} border-b-0 font-bold text-stone-900`}>{t.restDePlata}</td>
                      <td className={`${cellR} border-b-0 font-bold text-stone-900`}>{fmt(rezAfisat.rez.netBani - retineriNum)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {rezAfisat.rez.tichete > 0 && (
                <p className="mt-2 text-xs text-stone-600">
                  E normal ca banii din cont să coboare sub netul standard al salariului: taxele pe tichete (CASS + impozit)
                  se opresc din salariul în bani, iar tichetele intră integral pe card. Așa apare și pe fluturaș.
                </p>
              )}
            </div>
          ) : rezAfisat ? (
            <div className={stale ? "opacity-50 transition-opacity" : "transition-opacity"}>
            <div className="overflow-hidden rounded border border-stone-300">
              <table className="w-full table-auto border-collapse [&_td]:align-middle [&_th]:align-middle sm:table-fixed text-sm text-stone-700">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <thead>
                  <tr>
                    <th className="border-b border-b-stone-300 border-r border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">{t.indicatorFiscal}</th>
                    <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">{t.suma}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`${cellL} font-medium text-stone-900`}>{t.salariuIncadrareBrut}</td>
                    <td className={`${cellR} font-medium text-stone-900`}>{fmt(parseFloat(rezAfisat.brutEfectiv))}</td>
                  </tr>
                  {rezAfisat.rez.facilitate > 0 && (
                    <tr>
                      <td className={`${cellL} pl-4 sm:pl-8`}>{t.facilitateFiscala}</td>
                      <td className={cellR}>{fmt(rezAfisat.rez.facilitate)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className={`${cellL} pl-4 sm:pl-8`}>{t.casPensii}</td>
                    <td className={cellR}>− {fmt(rezAfisat.rez.cas)}</td>
                  </tr>
                  <tr>
                    <td className={`${cellL} pl-4 sm:pl-8`}>{t.cassSanatate}</td>
                    <td className={cellR}>− {fmt(rezAfisat.rez.cass)}</td>
                  </tr>
                  {rezAfisat.rez.deducerePersonala > 0 && (
                    <tr>
                      <td className={`${cellL} pl-4 sm:pl-8`}>{t.deducereAplicata}</td>
                      <td className={cellR}>{fmt(rezAfisat.rez.deducerePersonala)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className={cellL}>{t.impozitVenit}</td>
                    <td className={cellR}>− {fmt(rezAfisat.rez.impozit)}</td>
                  </tr>
                  <tr className="bg-canvas">
                    <td className={`${cellL} font-bold text-stone-900`}>{t.totalRetineriAngajat}</td>
                    <td className={`${cellR} font-bold text-stone-900`}>{fmt(rezAfisat.rez.cas + rezAfisat.rez.cass + rezAfisat.rez.impozit)}</td>
                  </tr>
                  {/* „Salariu net" = banii care intră în cont, după toate reținerile (inclusiv
                      taxele pe tichete, oprite din bani — ca pe fluturașul real). Tichetele
                      intră integral pe card, la valoarea nominală, pe rând separat. */}
                  <tr className="bg-stone-900">
                    <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">{t.salariuNetRand}</td>
                    <td className="px-3 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap text-white">{fmt(rezAfisat.rez.netBani)}</td>
                  </tr>
                  {rezAfisat.rez.tichete > 0 && (
                    <tr>
                      <td className={cellL}>{t.tichete}</td>
                      <td className={cellR}>+ {fmt(rezAfisat.rez.tichete)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Cu tichete, banii din cont coboară sub netul standard al salariului (taxele
                pe tichete se opresc din bani) — explicăm, ca cifra să nu pară o eroare. */}
            {rezAfisat.rez.tichete > 0 && (
              <p className="mt-2 text-xs text-stone-600">
                E normal ca banii din cont să coboare sub netul standard al salariului: taxele pe tichete (CASS + impozit)
                se opresc din salariul în bani, iar tichetele intră integral pe card. Așa apare și pe fluturaș.
              </p>
            )}
            <div className="mt-3 overflow-hidden rounded border border-stone-300">
              <table className="w-full table-auto border-collapse [&_td]:align-middle [&_th]:align-middle sm:table-fixed text-sm text-stone-700">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <tbody>
                  <tr>
                    <td className={cellL}>{t.camAngajatorRand}</td>
                    <td className={cellR}>{fmt(rezAfisat.rez.cam)}</td>
                  </tr>
                  {/* Tichetele nu se repetă aici — apar deja în tabelul de sus; costul total
                      le include (brut + CAM + tichete). */}
                  <tr className="bg-canvas">
                    <td className="border-r border-stone-300 px-3 py-3 text-left text-sm font-bold text-stone-700">{t.costTotalAngajator}</td>
                    <td className="px-3 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap text-stone-900">{fmt(rezAfisat.rez.costTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bară de proporție monocromă: din costul total, cât ajunge la angajat (net) vs la stat */}
            {(() => {
              const r = rezAfisat.rez;
              const total = r.net + r.cas + r.cass + r.impozit + r.cam;
              const ang = total > 0 ? Math.round((r.net / total) * 100) : 0;
              const stat = 100 - ang;
              return (
                <div className="mt-3">
                  <div
                    className="flex h-10 w-full overflow-hidden rounded border border-dashed border-stone-300 text-xs font-medium"
                    role="img"
                    aria-label={`Din costul total al firmei, ${ang}% ajunge la angajat (salariu net) și ${stat}% la stat (CAS, CASS, impozit, CAM).`}
                  >
                    <div className="flex min-w-0 items-center justify-start overflow-hidden whitespace-nowrap bg-stone-900 px-3 text-white" style={{ flexGrow: ang, flexBasis: 0 }}>{t.barAngajat(ang)}</div>
                    <div className="flex min-w-0 items-center justify-end overflow-hidden whitespace-nowrap border-l border-dashed border-stone-300 bg-canvas px-3 text-stone-700" style={{ flexGrow: stat, flexBasis: 0 }}>{t.barStat(stat)}</div>
                  </div>
                  <p className="mt-2 text-xs text-stone-600">{t.baraNota}</p>
                </div>
              );
            })()}
            </div>
          ) : fluturas ? (
            /* Stare goală în modul fluturaș: scheletul documentului, în aceleași
               trei blocuri ca varianta calculată, cu antetul colorat ca pe homepage. */
            <div aria-hidden="true" data-md-strip>
              <div className="overflow-hidden rounded border border-stone-300 text-stone-600">
                <table className="w-full table-auto border-collapse [&_td]:align-middle [&_th]:align-middle sm:table-fixed text-sm">
                  <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                  <thead>
                    <tr>
                      <th className="border-b border-b-stone-300 border-r border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">{t.indicatorFiscal}</th>
                      <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">{t.suma}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={cellL}>{t.salariuDeBazaIncadrare}</td>
                      <td className={cellR}>–</td>
                    </tr>
                    <tr className="bg-canvas">
                      <td className={`${cellL} border-b-0 font-bold`}>Total drepturi</td>
                      <td className={`${cellR} border-b-0`}>–</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 overflow-hidden rounded border border-stone-300 text-stone-600">
                <table className="w-full table-auto border-collapse [&_td]:align-middle sm:table-fixed text-sm">
                  <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                  <tbody>
                    <tr>
                      <td className={cellL}>CAS (pensii – 25%)</td>
                      <td className={cellR}>–</td>
                    </tr>
                    <tr>
                      <td className={cellL}>{t.cassSanatate}</td>
                      <td className={cellR}>–</td>
                    </tr>
                    <tr>
                      <td className={cellL}>{t.impozitVenit}</td>
                      <td className={cellR}>–</td>
                    </tr>
                    <tr className="bg-canvas">
                      <td className={`${cellL} border-b-0 font-bold`}>{t.totalRetineri}</td>
                      <td className={`${cellR} border-b-0`}>–</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 overflow-hidden rounded border border-stone-300 text-stone-600">
                <table className="w-full table-auto border-collapse [&_td]:align-middle sm:table-fixed text-sm">
                  <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                  <tbody>
                    <tr className="bg-stone-900">
                      <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">{t.salariuNetRand}</td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-white/80">–</td>
                    </tr>
                    <tr>
                      <td className={`${cellL} border-b-0 font-bold`}>{t.restDePlata}</td>
                      <td className={`${cellR} border-b-0`}>–</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
            <div className="overflow-hidden rounded border border-stone-300 text-stone-600" aria-hidden="true" data-md-strip>
              <table className="w-full table-auto border-collapse [&_td]:align-middle [&_th]:align-middle sm:table-fixed text-sm">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <thead>
                  <tr>
                    <th className="border-b border-b-stone-300 border-r border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">{t.indicatorFiscal}</th>
                    <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">{t.suma}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={cellL}>{t.salariuIncadrareBrut}</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr>
                    <td className={`${cellL} pl-4 sm:pl-8`}>{t.casPensii}</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr>
                    <td className={`${cellL} pl-4 sm:pl-8`}>{t.cassSanatate}</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr>
                    <td className={cellL}>{t.impozitVenit}</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr className="bg-canvas">
                    <td className={`${cellL} font-bold`}>{t.totalRetineriAngajat}</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr className="bg-stone-900">
                    <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">{t.salariuNetRand}</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-white/80" aria-hidden="true">–</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 overflow-hidden rounded border border-stone-300 text-stone-600" aria-hidden="true">
              <table className="w-full table-auto border-collapse [&_td]:align-middle [&_th]:align-middle sm:table-fixed text-sm">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <tbody>
                  <tr>
                    <td className={cellL}>{t.camAngajatorRand}</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr className="bg-canvas">
                    <td className="border-r border-stone-300 px-3 py-3 text-left text-sm font-bold text-stone-700">{t.costTotalAngajator}</td>
                    <td className="px-3 py-3 text-right text-sm font-bold" aria-hidden="true">–</td>
                  </tr>
                </tbody>
              </table>
            </div>
            </>
          )}

          {rezAfisat && regimFiscal === REGIM_FISCAL_CURENT && (
            <button
              type="button"
              data-md-strip
              disabled={stale || pdfStatus === "generating"}
              aria-disabled={stale || pdfStatus === "generating"}
              className={`mt-5 inline-flex min-h-12 items-center gap-2 rounded border border-stone-300 px-4 py-3 text-xs font-medium text-stone-700 transition-colors ${stale || pdfStatus === "generating" ? "cursor-not-allowed opacity-50" : "hover:border-stone-900 hover:bg-stone-900 hover:text-white"}`}
              onClick={handleDescarcaPdf}
            >
              {pdfStatus === "generating" ? t.seGenereaza : t.descarcaPdf}
            </button>
          )}

          {rezAfisat && !embedded && !brutInitial && (
            <button
              type="button"
              data-md-strip
              disabled={stale}
              aria-disabled={stale}
              className={`ml-0 mt-3 inline-flex min-h-12 items-center gap-2 rounded border border-stone-300 px-4 py-3 text-xs font-medium text-stone-700 transition-colors sm:ml-3 sm:mt-5 ${stale ? "cursor-not-allowed opacity-50" : "hover:border-stone-900 hover:bg-stone-900 hover:text-white"}`}
              onClick={handleCopiazaLink}
            >
              {linkCopiat ? t.linkCopiat : t.copiazaLink}
            </button>
          )}

          {rezAfisat && regimFiscal === REGIM_FISCAL_CURENT && (
            <>
              {pdfStatus === "success" && <p className="mt-3 text-xs text-stone-600" role="status">{t.pdfDescarcat}</p>}
              {pdfStatus === "error" && <p className="mt-3 text-xs font-medium text-stone-900" role="alert">PDF-ul nu a putut fi generat. Încearcă din nou.</p>}
              <FeedbackContextual context={pdfStatus === "error" ? "pdf" : "calcul"} limba={limba} />
            </>
          )}

          {/* Punctul de descoperire pentru widget, afișat după calcul când
              utilizatorul a văzut deja produsul. Integrarea păstrează o
              atribuire vizibilă, calificată nofollow. */}
          {rezAfisat && !embedded && (
            <p className="mt-4 text-xs leading-relaxed text-stone-600" data-md-strip>
              {t.aiUnSite}{" "}
              <Link
                href="/widget"
                className="font-medium text-stone-700 underline underline-offset-2 hover:text-stone-900"
              >
                {t.puneCalculatorul}
              </Link>{" "}
              {t.faraCont}
            </p>
          )}

          {rezAfisat && regimFiscal !== REGIM_FISCAL_CURENT && (
            <p className="mt-5 text-xs leading-relaxed text-stone-600" data-md-strip>
              Calcul istoric pentru ianuarie–iunie 2026. Fluturașul PDF este disponibil numai pentru grila fiscală curentă.
            </p>
          )}

          {!rezAfisat && (
            <p className="mt-4 text-xs leading-relaxed text-stone-600" data-md-strip>
              {t.golCuMinim(fmt(REGIMURI_FISCALE_SALARIU[regimFiscal].salariuMinim))}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
