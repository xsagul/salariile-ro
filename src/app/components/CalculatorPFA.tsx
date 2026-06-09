"use client";

// src/app/components/CalculatorPFA.tsx
// Calculator PFA 2026 (sistem real).
// Tipar identic cu CalculatorSalariu: calcul O DATĂ la „Calculează"/Enter,
// formular col-span-2 + rezultat col-span-3, tabel cu header, rând negru, bară.
//
// Reguli 2026 (reper salariu minim 4.050 lei, 1 ian):
//   impozit 10% × (venit net − CAS − CASS);
//   CAS 25% doar peste 12 salarii minime (bază 12 minime între 12–24, 24 minime peste);
//   CASS 10% pe venitul net, prag 6 minime, plafon 72 minime;
//   rotunjire Math.round (confirmat din codul ANAF al Declarației Unice).

import { useState } from "react";

const MINIM = 4050;
const P6 = 6 * MINIM, P12 = 12 * MINIM, P24 = 24 * MINIM, P72 = 72 * MINIM;

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));
const doarCifre = (s: string) => s.replace(/\D/g, "");
const grupeazaMii = (raw: string) => {
  const n = Number(raw);
  return raw && Number.isFinite(n) ? new Intl.NumberFormat("ro-RO").format(n) : "";
};

function calcPFA(venitNet: number, salariat: boolean, pensionar: boolean, luni = 12) {
  venitNet = Math.max(0, venitNet);
  const factor = Math.min(12, Math.max(1, luni)) / 12;
  let cassBaza: number;
  if (venitNet >= P6) cassBaza = Math.min(venitNet, P72);
  else cassBaza = salariat ? venitNet : P6;
  const cass = Math.round(cassBaza * 0.1);
  let cas = 0;
  if (!pensionar) {
    const p12 = P12 * factor, p24 = P24 * factor;
    if (venitNet >= p12) cas = Math.round((venitNet >= p24 ? p24 : p12) * 0.25);
  }
  const impozit = Math.round(Math.max(0, venitNet - cas - cass) * 0.1);
  const totalTaxe = cas + cass + impozit;
  return { venitNet, cas, cass, impozit, totalTaxe, ramas: venitNet - totalTaxe };
}

function venitNetDinRamas(targetAnual: number, salariat: boolean, pensionar: boolean, luni = 12) {
  if (targetAnual <= 0) return 0;
  let lo = 0, hi = targetAnual * 3 + 1_000_000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (calcPFA(mid, salariat, pensionar, luni).ramas < targetAnual) lo = mid; else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

type Mod = "venit" | "net";
type Snap = { mod: Mod; incasari: string; cheltuieli: string; netDorit: string; salariat: boolean; pensionar: boolean; luni: number };
const snapKey = (s: Snap) => JSON.stringify([s.mod, s.incasari, s.cheltuieli, s.netDorit, s.salariat, s.pensionar, s.luni]);

function buildResult(s: Snap) {
  let venitNet: number;
  if (s.mod === "venit") {
    venitNet = Math.max(0, (Number(s.incasari) || 0) - (Number(s.cheltuieli) || 0));
  } else {
    const lunar = Number(s.netDorit) || 0;
    if (lunar <= 0) return null;
    venitNet = venitNetDinRamas(lunar * 12, s.salariat, s.pensionar, s.luni);
  }
  if (venitNet <= 0) return null;
  return calcPFA(venitNet, s.salariat, s.pensionar, s.luni);
}

// ─── Tokens ──────────────────────────────────────────────────────────────────
const fieldLabel = "mb-2 block text-xs font-medium text-stone-500";
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const cellL = "border-b border-r border-stone-300 px-3 py-3 text-left";
const cellR = "border-b border-stone-300 px-3 py-3 text-right tabular-nums whitespace-nowrap";

function MoneyField({ id, label, hint, value, placeholder, unit = "lei / an", onChange, onEnter }: {
  id: string; label: string; hint?: string; value: string; placeholder?: string; unit?: string;
  onChange: (v: string) => void; onEnter: () => void;
}) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className={fieldLabel}>{label}</label>
      {hint && <span className="mb-2 block text-xs text-stone-500">{hint}</span>}
      <div className="flex w-full overflow-hidden rounded border border-stone-300 transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
        <input id={id} name={id} type="text" inputMode="numeric" value={grupeazaMii(value)}
          onChange={(e) => onChange(doarCifre(e.target.value))}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(); } }}
          placeholder={placeholder || "0"}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base leading-7 text-stone-900 outline-none" />
        <span className="flex items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-500">{unit}</span>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between border-b border-stone-100 py-3 text-sm text-stone-700 last:border-b-0">
      <span>{label}</span>
      <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} type="button"
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${checked ? "bg-stone-900" : "bg-stone-300"}`}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface shadow-soft transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );
}

function Row({ label, value, sub, neg, bold }: { label: string; value: string; sub?: boolean; neg?: boolean; bold?: boolean }) {
  return (
    <tr className={bold ? "bg-canvas" : undefined}>
      <td className={`${cellL} ${sub ? "pl-4 sm:pl-8" : ""} ${bold ? "font-bold text-stone-900" : ""}`} dangerouslySetInnerHTML={{ __html: label }} />
      <td className={`${cellR} ${bold ? "font-bold text-stone-900" : ""}`}>{neg ? "− " : ""}{value}</td>
    </tr>
  );
}

export default function CalculatorPFA() {
  const [mod, setMod] = useState<Mod>("venit");
  const [incasari, setIncasari] = useState("");
  const [cheltuieli, setCheltuieli] = useState("");
  const [netDorit, setNetDorit] = useState("");
  const [salariat, setSalariat] = useState(false);
  const [pensionar, setPensionar] = useState(false);
  const [luni, setLuni] = useState(12);
  const [avansat, setAvansat] = useState(false);

  const [rez, setRez] = useState<ReturnType<typeof buildResult>>(null);
  const [rezKey, setRezKey] = useState("");
  const [warn, setWarn] = useState(false);

  const snap: Snap = { mod, incasari, cheltuieli, netDorit, salariat, pensionar, luni };
  const stale = rez !== null && rezKey !== snapKey(snap);

  const handleCalc = () => {
    const r = buildResult(snap);
    if (!r) {
      setWarn(true);
      if (typeof window !== "undefined") document.getElementById(mod === "venit" ? "pfa-incasari" : "pfa-netdorit")?.focus();
      return;
    }
    setWarn(false);
    setRez(r); setRezKey(snapKey(snap));
    if (typeof window !== "undefined") {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      document.getElementById(isMobile ? "pfa-rezultat" : "pfa-layout")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const switchMod = (target: Mod) => {
    if (target === mod) return;
    if (target === "net") {
      const vn = Math.max(0, (Number(incasari) || 0) - (Number(cheltuieli) || 0));
      if (vn > 0) { const lunar = Math.round(calcPFA(vn, salariat, pensionar, luni).ramas / 12); setNetDorit(lunar > 0 ? String(lunar) : ""); }
    } else {
      const lunar = Number(netDorit) || 0;
      if (lunar > 0) { const vn = venitNetDinRamas(lunar * 12, salariat, pensionar, luni); setIncasari(vn > 0 ? String(vn) : ""); setCheltuieli(""); }
    }
    setMod(target);
  };

  const tab = (active: boolean, extra = "") =>
    `${extra} flex-1 inline-flex min-h-11 items-center justify-center px-2 text-sm font-medium transition-colors ${active ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-canvas"}`;

  const ang = rez && rez.venitNet > 0 ? Math.max(0, Math.min(100, Math.round((rez.ramas / rez.venitNet) * 100))) : 0;

  return (
    <div id="pfa-layout" className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-5">
      {/* FORMULAR */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Date</h2>

        <div className="mb-5">
          <span className={fieldLabel}>Direcție de calcul</span>
          <div className="flex w-full overflow-hidden rounded border border-stone-300">
            <button type="button" className={tab(mod === "venit")} onClick={() => switchMod("venit")}>Din venit anual</button>
            <button type="button" className={tab(mod === "net", "border-l border-stone-300")} onClick={() => switchMod("net")}>Din net lunar</button>
          </div>
        </div>

        {mod === "venit" ? (
          <>
            <MoneyField id="pfa-incasari" label="Încasări brute" placeholder="ex: 100.000" value={incasari} onChange={(v) => { setIncasari(v); if (warn) setWarn(false); }} onEnter={handleCalc} />
            <MoneyField id="pfa-cheltuieli" label="Cheltuieli deductibile" hint="Costurile activității (chirie, echipamente, transport…) – se scad din încasări, iar taxele se calculează pe ce rămâne." placeholder="ex: 20.000" value={cheltuieli} onChange={setCheltuieli} onEnter={handleCalc} />
          </>
        ) : (
          <MoneyField id="pfa-netdorit" label="Vreau să-mi rămână" unit="lei / lună" hint="Suma netă pe care vrei s-o ai în mână, pe lună." placeholder="ex: 6.000" value={netDorit} onChange={(v) => { setNetDorit(v); if (warn) setWarn(false); }} onEnter={handleCalc} />
        )}

        <button type="button"
          className="mb-5 flex min-h-11 w-full items-center justify-center rounded border border-dashed border-stone-300 px-4 text-xs font-medium text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-700"
          onClick={() => { if (avansat) { setSalariat(false); setPensionar(false); setLuni(12); } setAvansat(!avansat); }}>
          {avansat ? "▲ Ascunde opțiuni avansate" : "▼ Calculator avansat"}
        </button>

        {avansat && (
          <>
            <div className="mb-5">
              <label htmlFor="pfa-luni" className={fieldLabel}>Câte luni de activitate ai în an?</label>
              <select id="pfa-luni" value={luni} onChange={(e) => setLuni(Number(e.target.value))}
                className="w-full rounded border border-stone-300 bg-surface px-3 py-2 text-base text-stone-900 outline-none transition focus:border-stone-400 sm:text-sm">
                {Array.from({ length: 12 }, (_, i) => 12 - i).map((n) => (
                  <option key={n} value={n}>{n === 12 ? "12 (tot anul)" : `${n} ${n === 1 ? "lună" : "luni"}`}</option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <Toggle label="Sunt și salariat (asigurat)" checked={salariat} onChange={setSalariat} />
              <Toggle label="Sunt pensionar (scutit de CAS)" checked={pensionar} onChange={setPensionar} />
            </div>
          </>
        )}

        <button type="button" onClick={handleCalc}
          className="block min-h-12 w-full rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px"
          aria-label="Calculează și navighează la rezultat">
          Calculează
        </button>
        {warn && <p role="alert" className="mt-3 text-xs font-medium text-stone-900">{mod === "venit" ? "Introdu niște încasări mai întâi." : "Introdu cât vrei să-ți rămână pe lună."}</p>}
      </div>

      {/* REZULTAT */}
      <div id="pfa-rezultat" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
        <h2 className={colHeader}>Rezultat</h2>

        {stale && (
          <p className="mb-4 rounded border border-stone-300 bg-canvas px-3 py-2 text-xs text-stone-600" role="status">
            Ai modificat datele – apasă <strong className="font-medium text-stone-900">Calculează</strong> pentru a actualiza rezultatul.
          </p>
        )}

        {rez ? (
          <div className={stale ? "opacity-50 transition-opacity" : "transition-opacity"}>
            <div className="overflow-hidden rounded border border-stone-300">
              <table className="w-full table-auto border-collapse text-sm text-stone-700 [&_td]:align-middle [&_th]:align-middle sm:table-fixed">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <thead>
                  <tr>
                    <th className="border-b border-r border-b-stone-300 border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">Indicator fiscal</th>
                    <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  <Row label={mod === "net" ? "Venit net necesar" : "Venit net (încasări − cheltuieli)"} value={fmt(rez.venitNet)} />
                  <Row label='CAS <span class="text-stone-400">(Pensii − 25%)</span>' value={fmt(rez.cas)} sub neg />
                  <Row label='CASS <span class="text-stone-400">(Sănătate − 10%)</span>' value={fmt(rez.cass)} sub neg />
                  <Row label="Impozit pe venit (10%)" value={fmt(rez.impozit)} sub neg />
                  <Row label="Total taxe la stat" value={fmt(rez.totalTaxe)} bold />
                  <tr className="bg-stone-900">
                    <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">Rămâne la tine</td>
                    <td className="px-3 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap text-white">{fmt(rez.ramas)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3 overflow-hidden rounded border border-stone-300">
              <table className="w-full table-auto border-collapse text-sm text-stone-700 [&_td]:align-middle sm:table-fixed">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <tbody>
                  <tr className="bg-canvas">
                    <td className="border-r border-stone-300 px-3 py-3 text-left text-sm font-bold text-stone-700">Rămâne pe lună (≈)</td>
                    <td className="px-3 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap text-stone-900">{fmt(rez.ramas / 12)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <div className="flex h-10 w-full overflow-hidden rounded border border-dashed border-stone-300 text-xs font-medium" role="img" aria-label={`Din venitul net, ${ang}% rămâne la tine și ${100 - ang}% merge la stat.`}>
                <div className="flex min-w-0 items-center justify-start overflow-hidden whitespace-nowrap bg-stone-900 px-3 text-white" style={{ flexGrow: ang, flexBasis: 0 }}>Tu {ang}%</div>
                <div className="flex min-w-0 items-center justify-end overflow-hidden whitespace-nowrap border-l border-dashed border-stone-300 bg-canvas px-3 text-stone-700" style={{ flexGrow: 100 - ang, flexBasis: 0 }}>Stat {100 - ang}%</div>
              </div>
              <p className="mt-2 text-xs text-stone-500">Din venitul net: cât rămâne la tine și cât la stat.</p>
            </div>

            <p className="mt-4 text-xs leading-normal text-stone-500">
              PFA în sistem real, an fiscal 2026 (reper salariu minim 4.050 lei). Tu plătești tot, dar sub 12 salarii minime (48.600 lei) nu datorezi CAS. Estimare orientativă – pentru situații speciale confirmă cu un contabil.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded border border-stone-300 text-stone-600" aria-hidden="true">
              <table className="w-full table-auto border-collapse text-sm [&_td]:align-middle [&_th]:align-middle sm:table-fixed">
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <thead>
                  <tr>
                    <th className="border-b border-r border-b-stone-300 border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">Indicator fiscal</th>
                    <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className={`${cellL} font-medium`}>Venit net</td><td className={cellR}>–</td></tr>
                  <tr><td className={`${cellL} pl-4 sm:pl-8`}>CAS (Pensii)</td><td className={cellR}>–</td></tr>
                  <tr><td className={`${cellL} pl-4 sm:pl-8`}>CASS (Sănătate)</td><td className={cellR}>–</td></tr>
                  <tr><td className={`${cellL} pl-4 sm:pl-8`}>Impozit pe venit</td><td className={cellR}>–</td></tr>
                  <tr className="bg-canvas"><td className={`${cellL} font-bold`}>Total taxe la stat</td><td className={cellR}>–</td></tr>
                  <tr className="bg-stone-900">
                    <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">Rămâne la tine</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-white/80">–</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-stone-500">
              Completează datele și apasă Calculează · CAS 25%, CASS 10%, impozit 10% · Plafoane 2026
            </p>
          </>
        )}
      </div>
    </div>
  );
}
