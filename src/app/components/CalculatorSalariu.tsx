"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
  calculeaza,
  calculeazaBrutDinNet,
  SALARIU_MINIM,
  type InputState,
  type Rezultat,
} from "@/lib/fiscal";
import { zileLucratoareLuna } from "@/lib/sarbatori";

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

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n) + " lei";

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
function buildResult(snapshotInput: InputState, snapshotMod: "brut" | "net") {
  const brutEfectiv = snapshotMod === "net"
    ? String(calculeazaBrutDinNet(parseFloat(snapshotInput.brut) || 0, snapshotInput))
    : snapshotInput.brut;
  const rez = calculeaza({ ...snapshotInput, brut: brutEfectiv });
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
    inp.salariuDeBaza ?? null,
  ]);
}

// ─── Compunere brut pentru generatorul de fluturaș ────────────────────────────
// Salariu de bază + ore suplimentare (tarif orar × ore × (1+spor%)) + sporuri fixe.
// Rulează ÎNAINTE de motorul fiscal: calculeaza() primește brutul compus plus
// salariuDeBaza (pentru eligibilitatea facilității OUG 89/2025). Reținerile NU
// intră aici — se scad din net, după taxe (popriri/avans, ca pe statul de plată).
function compuneFluturas(inp: InputState, extra: { oreSupl: string; sporOre: string; sporuri: string }) {
  const baza = parseFloat(inp.brut) || 0;
  const ore = parseInt(extra.oreSupl) || 0;
  const sporProc = parseFloat(extra.sporOre) || 0;
  const fixe = parseInt(extra.sporuri) || 0;
  const azi = new Date();
  const oreNorma = zileLucratoareLuna(azi.getFullYear(), azi.getMonth()) * 8;
  const plataSupl = baza > 0 && ore > 0 && oreNorma > 0
    ? Math.round((baza / oreNorma) * ore * (1 + sporProc / 100))
    : 0;
  const brutCompus = baza + plataSupl + fixe;
  return {
    input: { ...inp, brut: String(brutCompus), salariuDeBaza: String(baza) } as InputState,
    baza,
    plataSupl,
    fixe,
    oreNorma,
  };
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
  "mb-2 block text-xs font-medium text-stone-500";
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
      {hint && <span className="mb-2 block text-xs text-stone-500">{hint}</span>}
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
        {unit && <span className="flex items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-500">{unit}</span>}
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
        <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
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
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ț/g, "t").replace(/Ț/g, "T")
    .replace(/ţ/g, "t").replace(/Ţ/g, "T");
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
  detalii?: { baza: number; plataSupl: number; oreSupl: number; sporProc: number; fixe: number };
  /** Rețineri din net (avans, popriri) — scad din REST DE PLATĂ. */
  retineri?: number;
}): Promise<void> {
  const { brut, rez, nrTichete, valoareTichet, scutitImpozit, firma, detalii, retineri = 0 } = opts;

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

  const lei = (n: number) => `${n.toLocaleString("ro-RO")} lei`;
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
  doc.text("FLUTURAS DE SALARIU", pageWidth / 2, y, { align: "center" });
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
  rand2(
    `Zile lucratoare: ${zileLucr}    Zile lucrate: ${zileLucr}    Ore lucrate: ${zileLucr * 8 + oreSuplPontaj}`,
    "Norma: 8 h/zi"
  );

  // ─── Drepturi ─────────────────────────────────────────────────────────────
  sectiune("DREPTURI SALARIALE");
  if (detalii && (detalii.plataSupl > 0 || detalii.fixe > 0)) {
    rand("Salariu de baza (incadrare)", lei(detalii.baza));
    if (detalii.plataSupl > 0) {
      rand(`Ore suplimentare (${detalii.oreSupl} ore, spor ${detalii.sporProc}%)`, lei(detalii.plataSupl));
    }
    if (detalii.fixe > 0) {
      rand("Sporuri si prime (brute)", lei(detalii.fixe));
    }
    rand("Venit brut total", lei(brut), { bold: true });
  } else {
    rand("Salariu de baza (incadrare)", lei(brut));
  }
  if (tichete > 0) {
    const nrT = parseInt(nrTichete) || 0;
    const valT = parseInt(valoareTichet) || 0;
    const detaliu = nrT > 0 && valT > 0 && nrT * valT === tichete ? ` (${nrT} buc x ${valT} lei)` : "";
    rand(`Tichete de masa${detaliu}`, lei(tichete));
  }
  rand("TOTAL DREPTURI", lei(brut + tichete), { bold: true });

  // ─── Rețineri ─────────────────────────────────────────────────────────────
  sectiune("RETINERI");
  if (facilitateEf > 0) {
    rand("Suma netaxabila salariu minim (OUG 89/2025)", lei(facilitateEf), { dim: true });
  }
  rand(`C.A.S. pensii 25% (baza: ${lei(bazaCas)})`, lei(rez.cas));
  rand(`C.A.S.S. sanatate 10% (baza: ${lei(bazaCass)})`, lei(rez.cass));
  if (rez.deducerePersonala > 0) {
    rand("Deducere personala (netaxabila)", lei(rez.deducerePersonala), { dim: true });
  }
  rand("Baza de calcul impozit", lei(Math.round(rez.bazaCalculImpozit)), { dim: true });
  rand("Impozit pe venit 10%", scutitImpozit ? "0 lei (scutit)" : lei(rez.impozit));
  rand("TOTAL RETINERI", lei(totalRetineri), { bold: true });

  // ─── De plată ─────────────────────────────────────────────────────────────
  sectiune("DE PLATA");
  rand("SALARIU NET (virat in cont)", lei(rez.netBani), { bold: true });
  if (tichete > 0) {
    rand("Tichete de masa (pe card, valoare integrala)", lei(tichete));
    rand("TOTAL INCASAT (cont + card)", lei(rez.net), { bold: true });
  }
  rand("Retineri (avans, popriri)", lei(retineri));
  rand("REST DE PLATA", lei(rez.netBani - retineri), { bold: true });

  // Fluturașul real e documentul ANGAJATULUI — costurile angajatorului (CAM,
  // cost total) nu apar pe el, deci nu apar nici aici, nici în tabelul de pe pagină.

  // ─── Semnături ────────────────────────────────────────────────────────────
  sectiune();
  rand2("Intocmit (angajator),", "Am primit (angajat),");
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
  wide = false,
  fluturas = false,
}: {
  brutInitial?: string;
  modInitial?: "brut" | "net";
  titluCustom?: React.ReactNode;
  subtitluCustom?: React.ReactNode;
  wide?: boolean;
  /** Mod generator de fluturaș: câmpuri de stat de plată (firmă, ore suplimentare,
   *  sporuri, rețineri), direcția fixă brut→net. Folosit de /fluturas-salariu. */
  fluturas?: boolean;
}) {
  const wrap = wide ? "max-w-7xl" : "max-w-6xl";
  const [mod, setMod] = useState<"brut" | "net">(modInitial);
  const [avansat, setAvansat] = useState(false);
  // Avertisment scurt când se apasă Calculează fără un salariu valid (Nielsen h1/h9).
  const [emptyWarn, setEmptyWarn] = useState(false);
  // Tichete: nr. × valoare/tichet → total stocat în input.tichete (calculul folosește totalul).
  const [nrTichete, setNrTichete] = useState("");
  const [valoareTichet, setValoareTichet] = useState("");

  // Câmpurile generatorului de fluturaș (folosite doar când fluturas=true).
  // Firma și reținerile NU intră în calculul fiscal: firma apare doar pe PDF,
  // reținerile se scad din net (aplicate „live", fără recalcul).
  const [firma, setFirma] = useState("");
  const [oreSupl, setOreSupl] = useState("");
  const [sporOre, setSporOre] = useState("75");
  const [sporuri, setSporuri] = useState("");
  const [retineri, setRetineri] = useState("");

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
  const pregatesteInput = (inp: InputState): InputState =>
    fluturas ? compuneFluturas(inp, { oreSupl, sporOre, sporuri }).input : inp;

  // Rezultatul afișat – calculat O DATĂ la click pe Calculează, stocat ca obiect.
  // Nu se schimbă la tastare/toggle, doar la click. La mount, dacă brutInitial
  // e prezent (pagini dinamice tip /4050-brut-...), pre-calculează (auto-commit
  // pentru SEO/SSR – Google vede tabelul completat la randare).
  const [rezAfisat, setRezAfisat] = useState<ReturnType<typeof buildResult>>(
    brutInitial && parseFloat(brutInitial) > 0 ? buildResult(pregatesteInput(initialInput), modInitial) : null
  );

  // Defalcarea brutului compus la momentul ultimului calcul (doar mod fluturaș).
  const [fluturasSnap, setFluturasSnap] = useState<{ baza: number; plataSupl: number; fixe: number; oreSupl: number; sporProc: number } | null>(
    fluturas && brutInitial && parseFloat(brutInitial) > 0
      ? (() => { const c = compuneFluturas(initialInput, { oreSupl: "", sporOre: "75", sporuri: "" }); return { baza: c.baza, plataSupl: c.plataSupl, fixe: c.fixe, oreSupl: 0, sporProc: 75 }; })()
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
      const c = compuneFluturas(input, { oreSupl, sporOre, sporuri });
      setRezAfisat(buildResult(c.input, mod));
      setRezKey(inputKey(c.input, mod));
      setFluturasSnap({ baza: c.baza, plataSupl: c.plataSupl, fixe: c.fixe, oreSupl: parseInt(oreSupl) || 0, sporProc: parseFloat(sporOre) || 0 });
    } else {
      setRezAfisat(buildResult(input, mod));
      setRezKey(inputKey(input, mod));
    }
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const targetId = isMobile ? "rezultat-calcul" : "calc-layout";
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [input, mod, fluturas, oreSupl, sporOre, sporuri]);

  // Rezultatul afișat e „învechit" dacă datele curente diferă de cele de la ultimul calcul.
  const stale = rezAfisat !== null && rezKey !== inputKey(pregatesteInput(input), mod);
  // Reținerile se aplică live pe net (scădere simplă, fără recalcul fiscal).
  const retineriNum = fluturas ? Math.max(0, parseInt(retineri) || 0) : 0;
  // Rând de secțiune în tabelul-fluturaș (DREPTURI / REȚINERI / DE PLATĂ).
  const sectF = (titlu: string) => (
    <tr>
      <td colSpan={2} className="border-b border-stone-300 bg-canvas px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">{titlu}</td>
    </tr>
  );

  return (
    <>
      {/* ── Hero ── */}
      <section className="border-b border-stone-200 bg-canvas">
        <div className={`mx-auto ${wrap} px-4 py-8 sm:px-6 sm:py-12`}>
          {/* Hero pe aceeași grilă (col-span-3) = exact lățimea cardului „Rezultat calcul", la orice viewport. */}
          <div className="md:grid md:grid-cols-5 md:gap-6">
            <div className="md:col-span-3">
          {/* Breadcrumb doar pe pagini dinamice, nu pe homepage */}
          {titluCustom && (
            <nav className="mb-4 flex gap-2 text-xs text-stone-600" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-stone-700">Acasă</Link>
              <span>/</span>
              <span aria-current="page">Calculator salariu</span>
            </nav>
          )}

          {/* Titlul Dinamic */}
          <h1 className="mb-3 text-3xl font-bold tracking-[-0.02em] text-stone-900 sm:text-4xl">
            {titluCustom || <>Calculator salariu net 2026</>}
          </h1>

          {/* Subtitlul Dinamic */}
          <p className="max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 [&_a]:font-medium [&_a]:text-stone-700 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-stone-900">
            {subtitluCustom || (
              <>
                Calcul salariu net din brut: pune salariul brut și vezi netul, cu CAS, CASS, impozit și costul angajatorului, conform{" "}
                <a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener noreferrer">HG 146/2026</a>
                {" "}și{" "}
                <a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener noreferrer">OUG 89/2025</a>. Funcționează și invers, din net în brut.
              </>
            )}
          </p>

          {/* Dateline tehnic, scurt și curat */}
          {!titluCustom && (
            <div className="mt-4 text-xs text-stone-600">
              Ultima actualizare: 1 iulie 2026
            </div>
          )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Calculator ── */}
      <div className={`mx-auto grid ${wrap} gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-5`} id="calc-layout">
        {/* Coloana Stângă – formular */}
        <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2" data-md-strip>
          <h2 className={colHeader}>Date salariale</h2>

          {!fluturas && (
          <div className="mb-5">
            <span className={fieldLabel}>Direcție de calcul</span>
            <div className="flex w-full overflow-hidden rounded border border-stone-300">
              <button
                type="button"
                className={`flex-1 inline-flex min-h-11 items-center justify-center px-4 text-sm font-medium transition-colors ${mod === "brut" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-canvas"}`}
                onClick={() => {
                  if (mod === "net") {
                    const netVal = parseFloat(input.brut);
                    if (netVal > 0) set("brut", String(calculeazaBrutDinNet(netVal, input)));
                  }
                  setMod("brut");
                }}
              >
                Din brut în net
              </button>
              <button
                type="button"
                className={`border-l border-stone-300 flex-1 inline-flex min-h-11 items-center justify-center px-4 text-sm font-medium transition-colors ${mod === "net" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-canvas"}`}
                onClick={() => {
                  if (mod === "brut") {
                    const brutVal = parseFloat(input.brut);
                    if (brutVal > 0) {
                      const rezTemp = calculeaza(input);
                      if (rezTemp) set("brut", String(rezTemp.net));
                    }
                  }
                  setMod("net");
                }}
              >
                Din net în brut
              </button>
            </div>
          </div>
          )}

          <InputNumber id="salariu-input" label={fluturas ? "Salariu de bază (brut)" : mod === "brut" ? "Salariu brut" : "Salariu net"} value={input.brut} onChange={(v) => { set("brut", v); if (emptyWarn) setEmptyWarn(false); }} placeholder={mod === "brut" ? `ex: ${grupeazaMii(EX_PLACEHOLDER_BRUT)}` : `ex: ${grupeazaMii(EX_PLACEHOLDER_NET)}`} onEnter={handleCalculeaza} error={emptyWarn ? "Introdu un salariu mai întâi." : undefined} tall />

          <button
            type="button"
            className="mb-5 flex min-h-11 w-full items-center justify-center rounded border border-dashed border-stone-300 px-4 text-xs font-medium text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-700"
            onClick={() => {
              if (avansat) {
                set("tichete", ""); setNrTichete(""); setValoareTichet(""); set("functieDeBAza", true); set("persoanePretretinere", 0); set("varstaSub26", false); set("copiiScolarizati", 0); set("scutitImpozit", false);
                if (fluturas) { setFirma(""); setOreSupl(""); setSporOre("75"); setSporuri(""); setRetineri(""); }
              }
              setAvansat(!avansat);
            }}
          >
            {avansat ? "▲ Ascunde opțiuni avansate" : "▼ Calculator avansat"}
          </button>

          {avansat && (
            <>
              {fluturas && (
                <>
                  {/* Câmpurile statului de plată — doar în generatorul de fluturaș */}
                  <div className="mb-5">
                    <label htmlFor="firma-input" className={fieldLabel}>Firma (opțional, apare pe PDF)</label>
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
                    <InputNumber id="ore-supl" label="Ore suplimentare" unit="ore" value={oreSupl} placeholder="ex: 8"
                      onChange={setOreSupl} />
                    <InputNumber id="spor-ore" label="Spor ore supl." unit="%" value={sporOre} placeholder="ex: 75"
                      onChange={setSporOre} />
                  </div>
                  <p className="-mt-3 mb-5 text-xs text-stone-500">
                    Plata orelor suplimentare: tariful orar al lunii curente × ore × (100% + spor). Sporul legal minim e 75% (Codul Muncii art. 123).
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <InputNumber id="sporuri-fixe" label="Sporuri și prime (brute)" unit="lei" value={sporuri} placeholder="ex: 200"
                      onChange={setSporuri} />
                    <InputNumber id="retineri-input" label="Rețineri (avans, popriri)" unit="lei" value={retineri} placeholder="ex: 0"
                      onChange={setRetineri} />
                  </div>
                  <p className="-mt-3 mb-5 text-xs text-stone-500">
                    Sporurile brute se taxează ca salariul. Reținerile se scad la final, din netul de plată.
                  </p>
                </>
              )}
              {/* Câmpuri-valoare (cât / câți) – ritm de câmp, mb-5 fiecare */}
              {/* Tichete de masă: nr. × valoare/tichet, înmulțite automat în total */}
              <div className="grid grid-cols-2 gap-3">
                <InputNumber id="nr-tichete" label="Tichete / lună" unit="" value={nrTichete} placeholder="ex: 21"
                  onChange={(v) => { setNrTichete(v); const t = (parseInt(v) || 0) * (parseInt(valoareTichet) || 0); set("tichete", t ? String(t) : ""); }} />
                <InputNumber id="valoare-tichet" label="Valoare / tichet" unit="lei" value={valoareTichet} placeholder="ex: 40"
                  onChange={(v) => { setValoareTichet(v); const t = (parseInt(nrTichete) || 0) * (parseInt(v) || 0); set("tichete", t ? String(t) : ""); }} />
              </div>
              <p className="-mt-3 mb-5 text-xs text-stone-500">
                Cel mult un tichet pe zi lucrată · maxim legal 45 lei/tichet (Legea 201/2025).
                {(parseInt(input.tichete) || 0) > 0 && (
                  <> Total: <span className="font-medium text-stone-700">{fmt(parseInt(input.tichete))}</span> / lună.</>
                )}
              </p>
              <Select id="persoane-intretinere" label="Persoane în întreținere" value={input.persoanePretretinere} options={[0, 1, 2, 3, 4, 5].map((n) => ({ v: n, l: n === 0 ? "Niciuna" : `${n} ${n === 1 ? "persoană" : "persoane"}` }))} onChange={(v) => { set("persoanePretretinere", v); if (input.copiiScolarizati > v) set("copiiScolarizati", v); }} />
              <Select id="copii-scolari" label="Dintre care, copii minori școlari" value={input.copiiScolarizati} disabled={input.persoanePretretinere === 0} options={Array.from({ length: input.persoanePretretinere + 1 }, (_, n) => ({ v: n, l: n === 0 ? "Niciunul" : `${n} ${n === 1 ? "copil" : "copii"}` }))} onChange={(v) => set("copiiScolarizati", v)} />
              {/* Switch-uri (da/nu) – listă contiguă cu hairline-uri interne; last:border-b-0 prinde pe Scutit */}
              <div>
                <Toggle label="Funcție de bază (jobul principal)" checked={input.functieDeBAza} onChange={(v) => set("functieDeBAza", v)} />
                <Toggle label="Vârstă sub 26 ani" checked={input.varstaSub26} onChange={(v) => set("varstaSub26", v)} />
                <Toggle label="Scutit de impozit (de exemplu, handicap)" checked={input.scutitImpozit} onChange={(v) => set("scutitImpozit", v)} />
              </div>
            </>
          )}

          <button
            type="button"
            className={`${avansat ? "mt-5 " : ""}block min-h-12 w-full rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px`}
            onClick={handleCalculeaza}
            aria-label="Calculează salariul și navighează la rezultat"
          >
            Calculează
          </button>
        </div>

        {/* Coloana Dreaptă – rezultate */}
        <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3" id="rezultat-calcul">
          <h2 className={colHeader}>{fluturas ? "Fluturaș de salariu" : "Rezultat calcul"}</h2>

          {stale && (
            <p className="mb-4 rounded border border-stone-300 bg-canvas px-3 py-2 text-xs text-stone-600" role="status">
              Ai modificat datele – apasă{" "}
              <strong className="font-medium text-stone-900">Calculează</strong> pentru a actualiza rezultatul.
            </p>
          )}

          {rezAfisat && fluturas ? (
            /* Modul fluturaș: rezultatul E fluturașul — aceleași secțiuni ca pe PDF
               (Drepturi / Rețineri / De plată / Angajator), fără bara angajat-stat. */
            <div className={stale ? "opacity-50 transition-opacity" : "transition-opacity"}>
              <div className="overflow-hidden rounded border border-stone-300">
                <table className="w-full table-auto border-collapse [&_td]:align-middle sm:table-fixed text-sm text-stone-700">
                  <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                  <tbody>
                    {sectF("Drepturi salariale")}
                    <tr>
                      <td className={cellL}>Salariu de bază (încadrare)</td>
                      <td className={cellR}>{fmt(fluturasSnap?.baza ?? parseFloat(rezAfisat.brutEfectiv))}</td>
                    </tr>
                    {fluturasSnap && fluturasSnap.plataSupl > 0 && (
                      <tr>
                        <td className={`${cellL} pl-4 sm:pl-8`}>Ore suplimentare ({fluturasSnap.oreSupl} ore, spor {fluturasSnap.sporProc}%)</td>
                        <td className={cellR}>+ {fmt(fluturasSnap.plataSupl)}</td>
                      </tr>
                    )}
                    {fluturasSnap && fluturasSnap.fixe > 0 && (
                      <tr>
                        <td className={`${cellL} pl-4 sm:pl-8`}>Sporuri și prime (brute)</td>
                        <td className={cellR}>+ {fmt(fluturasSnap.fixe)}</td>
                      </tr>
                    )}
                    {fluturasSnap && (fluturasSnap.plataSupl > 0 || fluturasSnap.fixe > 0) && (
                      <tr>
                        <td className={`${cellL} font-medium text-stone-900`}>Venit brut total</td>
                        <td className={`${cellR} font-medium text-stone-900`}>{fmt(parseFloat(rezAfisat.brutEfectiv))}</td>
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
                    {sectF("Rețineri")}
                    {rezAfisat.rez.facilitate > 0 && (
                      <tr>
                        <td className={`${cellL} text-stone-500`}>Sumă netaxabilă salariu minim (OUG 89/2025)</td>
                        <td className={`${cellR} text-stone-500`}>{fmt(rezAfisat.rez.facilitate)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className={`${cellL} pl-4 sm:pl-8`}>CAS (pensii – 25%)</td>
                      <td className={cellR}>− {fmt(rezAfisat.rez.cas)}</td>
                    </tr>
                    <tr>
                      <td className={`${cellL} pl-4 sm:pl-8`}>CASS (sănătate – 10%)</td>
                      <td className={cellR}>− {fmt(rezAfisat.rez.cass)}</td>
                    </tr>
                    {rezAfisat.rez.deducerePersonala > 0 && (
                      <tr>
                        <td className={`${cellL} text-stone-500`}>Deducere personală (netaxabilă)</td>
                        <td className={`${cellR} text-stone-500`}>{fmt(rezAfisat.rez.deducerePersonala)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className={`${cellL} pl-4 sm:pl-8`}>Impozit pe venit (10%)</td>
                      <td className={cellR}>− {fmt(rezAfisat.rez.impozit)}</td>
                    </tr>
                    <tr className="bg-canvas">
                      <td className={`${cellL} font-bold text-stone-900`}>Total rețineri</td>
                      <td className={`${cellR} font-bold text-stone-900`}>{fmt(rezAfisat.rez.cas + rezAfisat.rez.cass + rezAfisat.rez.impozit)}</td>
                    </tr>
                    {sectF("De plată")}
                    <tr className="bg-stone-900">
                      <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">Salariu net (virat în cont)</td>
                      <td className="px-3 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap text-white">{fmt(rezAfisat.rez.netBani)}</td>
                    </tr>
                    {rezAfisat.rez.tichete > 0 && (
                      <tr>
                        <td className={cellL}>Tichete de masă (pe card, valoare integrală)</td>
                        <td className={cellR}>+ {fmt(rezAfisat.rez.tichete)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className={cellL}>Rețineri (avans, popriri)</td>
                      <td className={cellR}>− {fmt(retineriNum)}</td>
                    </tr>
                    <tr className="bg-canvas">
                      <td className={`${cellL} border-b-0 font-bold text-stone-900`}>Rest de plată</td>
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
                    <th className="border-b border-b-stone-300 border-r border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">Indicator fiscal</th>
                    <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`${cellL} font-medium text-stone-900`}>Salariu de încadrare (Brut)</td>
                    <td className={`${cellR} font-medium text-stone-900`}>{fmt(parseFloat(rezAfisat.brutEfectiv))}</td>
                  </tr>
                  {rezAfisat.rez.facilitate > 0 && (
                    <tr>
                      <td className={`${cellL} pl-4 sm:pl-8`}>Facilitate fiscală (neimpozabilă)</td>
                      <td className={cellR}>{fmt(rezAfisat.rez.facilitate)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className={`${cellL} pl-4 sm:pl-8`}>CAS (Pensii – 25%)</td>
                    <td className={cellR}>− {fmt(rezAfisat.rez.cas)}</td>
                  </tr>
                  <tr>
                    <td className={`${cellL} pl-4 sm:pl-8`}>CASS (Sănătate – 10%)</td>
                    <td className={cellR}>− {fmt(rezAfisat.rez.cass)}</td>
                  </tr>
                  {rezAfisat.rez.deducerePersonala > 0 && (
                    <tr>
                      <td className={`${cellL} pl-4 sm:pl-8`}>Deducere personală (aplicată)</td>
                      <td className={cellR}>{fmt(rezAfisat.rez.deducerePersonala)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className={cellL}>Impozit pe venit (10%)</td>
                    <td className={cellR}>− {fmt(rezAfisat.rez.impozit)}</td>
                  </tr>
                  <tr className="bg-canvas">
                    <td className={`${cellL} font-bold text-stone-900`}>Total rețineri angajat</td>
                    <td className={`${cellR} font-bold text-stone-900`}>{fmt(rezAfisat.rez.cas + rezAfisat.rez.cass + rezAfisat.rez.impozit)}</td>
                  </tr>
                  {/* „Salariu net" = banii care intră în cont, după toate reținerile (inclusiv
                      taxele pe tichete, oprite din bani — ca pe fluturașul real). Tichetele
                      intră integral pe card, la valoarea nominală, pe rând separat. */}
                  <tr className="bg-stone-900">
                    <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">Salariu net</td>
                    <td className="px-3 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap text-white">{fmt(rezAfisat.rez.netBani)}</td>
                  </tr>
                  {rezAfisat.rez.tichete > 0 && (
                    <tr>
                      <td className={cellL}>Tichete de masă</td>
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
                    <td className={cellL}>CAM (angajator – 2,25%)</td>
                    <td className={cellR}>{fmt(rezAfisat.rez.cam)}</td>
                  </tr>
                  {/* Tichetele nu se repetă aici — apar deja în tabelul de sus; costul total
                      le include (brut + CAM + tichete). */}
                  <tr className="bg-canvas">
                    <td className="border-r border-stone-300 px-3 py-3 text-left text-sm font-bold text-stone-700">Cost total angajator</td>
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
                    <div className="flex min-w-0 items-center justify-start overflow-hidden whitespace-nowrap bg-stone-900 px-3 text-white" style={{ flexGrow: ang, flexBasis: 0 }}>Angajat {ang}%</div>
                    <div className="flex min-w-0 items-center justify-end overflow-hidden whitespace-nowrap border-l border-dashed border-stone-300 bg-canvas px-3 text-stone-700" style={{ flexGrow: stat, flexBasis: 0 }}>Stat {stat}%</div>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">Din costul total al firmei: cât ajunge la tine (net) și cât la stat (CAS, CASS, impozit, CAM).</p>
                </div>
              );
            })()}
            </div>
          ) : fluturas ? (
            /* Stare goală în modul fluturaș: scheletul documentului, cu secțiunile PDF-ului */
            <div className="overflow-hidden rounded border border-stone-300 text-stone-600" aria-hidden="true" data-md-strip>
              <table className="w-full table-auto border-collapse [&_td]:align-middle sm:table-fixed text-sm">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <tbody>
                  {sectF("Drepturi salariale")}
                  <tr>
                    <td className={cellL}>Salariu de bază (încadrare)</td>
                    <td className={cellR}>–</td>
                  </tr>
                  {sectF("Rețineri")}
                  <tr>
                    <td className={`${cellL} pl-4 sm:pl-8`}>CAS (pensii – 25%)</td>
                    <td className={cellR}>–</td>
                  </tr>
                  <tr>
                    <td className={`${cellL} pl-4 sm:pl-8`}>CASS (sănătate – 10%)</td>
                    <td className={cellR}>–</td>
                  </tr>
                  <tr>
                    <td className={`${cellL} pl-4 sm:pl-8`}>Impozit pe venit (10%)</td>
                    <td className={cellR}>–</td>
                  </tr>
                  <tr className="bg-canvas">
                    <td className={`${cellL} font-bold`}>Total rețineri</td>
                    <td className={cellR}>–</td>
                  </tr>
                  {sectF("De plată")}
                  <tr className="bg-stone-900">
                    <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">Salariu net (virat în cont)</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-white/80">–</td>
                  </tr>
                  <tr>
                    <td className={`${cellL} border-b-0 font-bold`}>Rest de plată</td>
                    <td className={`${cellR} border-b-0`}>–</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <>
            <div className="overflow-hidden rounded border border-stone-300 text-stone-600" aria-hidden="true" data-md-strip>
              <table className="w-full table-auto border-collapse [&_td]:align-middle [&_th]:align-middle sm:table-fixed text-sm">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <thead>
                  <tr>
                    <th className="border-b border-b-stone-300 border-r border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">Indicator fiscal</th>
                    <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={cellL}>Salariu de încadrare (Brut)</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr>
                    <td className={`${cellL} pl-4 sm:pl-8`}>CAS (Pensii – 25%)</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr>
                    <td className={`${cellL} pl-4 sm:pl-8`}>CASS (Sănătate – 10%)</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr>
                    <td className={cellL}>Impozit pe venit (10%)</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr className="bg-canvas">
                    <td className={`${cellL} font-bold`}>Total rețineri angajat</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr className="bg-stone-900">
                    <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">Salariu net</td>
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
                    <td className={cellL}>CAM (angajator – 2,25%)</td>
                    <td className={cellR} aria-hidden="true">–</td>
                  </tr>
                  <tr className="bg-canvas">
                    <td className="border-r border-stone-300 px-3 py-3 text-left text-sm font-bold text-stone-700">Cost total angajator</td>
                    <td className="px-3 py-3 text-right text-sm font-bold" aria-hidden="true">–</td>
                  </tr>
                </tbody>
              </table>
            </div>
            </>
          )}

          {rezAfisat && (
            <button
              type="button"
              data-md-strip
              disabled={stale}
              aria-disabled={stale}
              className={`mt-5 inline-flex min-h-12 items-center gap-2 rounded border border-stone-300 px-4 py-3 text-xs font-medium text-stone-700 transition-colors ${stale ? "cursor-not-allowed opacity-50" : "hover:border-stone-900 hover:bg-stone-900 hover:text-white"}`}
              onClick={() => generarePDFFluturas({
                brut: parseFloat(rezAfisat.brutEfectiv),
                rez: rezAfisat.rez,
                // Butonul e dezactivat când rezultatul e „învechit" (stale), deci
                // nr/valoare tichete din state corespund snapshot-ului calculat.
                nrTichete,
                valoareTichet,
                scutitImpozit: rezAfisat.scutitImpozit,
                // Extra generatorului de fluturaș (firma și reținerile se aplică live,
                // fără recalcul fiscal — nu intră în snapshot-ul de staleness).
                firma: fluturas ? firma : undefined,
                detalii: fluturas && fluturasSnap ? fluturasSnap : undefined,
                retineri: retineriNum,
              })}
            >
              ↓ Descarcă fluturaș PDF
            </button>
          )}

          {!rezAfisat && (
            <p className="mt-4 text-xs leading-relaxed text-stone-500" data-md-strip>
              Completează salariul brut pentru a genera fluturașul · Grila fiscală 2026 (minim: 4.325 lei)
            </p>
          )}
        </div>
      </div>
    </>
  );
}