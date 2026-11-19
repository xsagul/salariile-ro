"use client";

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import IconCalculeaza from "@/app/components/IconCalculeaza";
import { SPATIU_JOS } from "@/app/components/ui";
import {
  CASTIG_MEDIU_BASS,
  CODURI_CONCEDIU_MEDICAL,
  calculeazaConcediuMedical,
  infoCodMedical,
  type CodConcediuMedical,
  type RezultatConcediuMedical,
} from "@/lib/concediu-medical";
import { deruleazaLaRezultat } from "@/lib/deruleaza-la-rezultat";
import { masoaraCalcul } from "@/lib/analytics";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));
const suma = (n: number | undefined, semn = "") => (n === undefined ? "—" : `${semn}${fmt(n)} lei`);

const fieldLabel = "mb-2 block text-xs font-medium text-stone-600";
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const controlBox =
  "w-full min-w-0 rounded border border-stone-300 bg-surface px-3 py-2 text-base text-stone-900 outline-none transition focus:border-stone-400 focus:shadow-[0_0_6px_rgba(28,25,23,0.12)] sm:text-sm";
const tabelRezultat = "w-full table-fixed border-collapse text-sm tabular-nums text-stone-700";
const celulaIndicator = "border-b border-r border-stone-300 px-3 py-3 text-left";
const celulaSuma = "border-b border-stone-300 px-3 py-3 text-right whitespace-nowrap";

const TRANSE_COD01 = [
  { zile: 7, eticheta: "1–7 zile", procent: "55%" },
  { zile: 14, eticheta: "8–14 zile", procent: "65%" },
  { zile: 15, eticheta: "15+ zile", procent: "75%" },
] as const;

type DateMedical = {
  venit: string;
  cod: CodConcediuMedical;
  zileCal: number;
  zileLucr: string;
  zileLuna: string;
  scutitPrimaZi: boolean;
};

type RezultatAfisat = {
  rezultat: RezultatConcediuMedical;
  key: string;
};

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M5 7.5l5 5 5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 py-2 text-sm text-stone-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-stone-900"
      />
      {label}
    </label>
  );
}

function RandRezultat({ eticheta, valoare, retinere = false, ultim = false }: {
  eticheta: string;
  valoare: number | undefined;
  retinere?: boolean;
  ultim?: boolean;
}) {
  const b = ultim ? "border-b-0 " : "";
  return (
    <tr>
      <th scope="row" className={`${b}${celulaIndicator} font-normal`}>{eticheta}</th>
      <td className={`${b}${celulaSuma}`}>
        {valoare === undefined ? "—" : valoare === 0 && retinere ? "0 lei" : suma(valoare, retinere ? "− " : "")}
      </td>
    </tr>
  );
}

export default function CalculatorConcediuMedical() {
  const [venit, setVenit] = useState("");
  const [cod, setCod] = useState<CodConcediuMedical>("01");
  const [zileCal, setZileCal] = useState<number>(7);
  const [zileLucr, setZileLucr] = useState("");
  const [zileLuna, setZileLuna] = useState("");
  const [scutitPrimaZi, setScutitPrimaZi] = useState(false);
  const [avansat, setAvansat] = useState(false);
  const [eroareVenit, setEroareVenit] = useState(false);
  const [eroareZile, setEroareZile] = useState(false);
  const [rezAfisat, setRezAfisat] = useState<RezultatAfisat | null>(null);

  const info = infoCodMedical(cod);
  const dateCurente: DateMedical = { venit, cod, zileCal, zileLucr, zileLuna, scutitPrimaZi };
  const cheieCurenta = JSON.stringify(dateCurente);
  const stale = rezAfisat !== null && rezAfisat.key !== cheieCurenta;
  const r = rezAfisat?.rezultat;

  const calculeaza = () => {
    const v = Number(venit);
    const zl = Number(zileLucr);
    const lipsaV = !v || v <= 0;
    const lipsaZ = !zl || zl <= 0;
    setEroareVenit(lipsaV);
    setEroareZile(lipsaZ);
    if (lipsaV || lipsaZ) return;

    const zLuna = Math.min(23, Math.max(18, Number(zileLuna) || 21));
    const rez = calculeazaConcediuMedical({
      venitBrutMediu6Luni: v,
      cod,
      zileCalendaristiceEpisod: cod === "01" ? zileCal : Math.max(zl, 7),
      zileLucratoareConcediu: Math.min(zl, zLuna),
      zileLucratoareLuna: zLuna,
      faraPrimaZiNeplatita: info.exceptatPrimaZi || scutitPrimaZi,
    });
    if (!rez) return;
    setRezAfisat({ rezultat: rez, key: cheieCurenta });
    masoaraCalcul("concediu_medical", { varianta: `cod_${cod}` });
    deruleazaLaRezultat("rezultat-medical", "calc-medical");
  };

  return (
    <section className="border-b border-stone-200 bg-canvas" aria-labelledby="calculator-medical-titlu">
      <div id="calc-medical" className={`mx-auto grid max-w-6xl items-start gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
        <form
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2"
          onSubmit={(e) => {
            e.preventDefault();
            calculeaza();
          }}
        >
          <h2 id="calculator-medical-titlu" className={colHeader}>Datele concediului</h2>

          <div className="mb-5 min-w-0">
            <label htmlFor="cm-venit" className={fieldLabel}>Salariu brut mediu (ultimele 6 luni)</label>
            <div className={`flex min-w-0 overflow-hidden rounded border bg-surface transition focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)] ${
              eroareVenit ? "border-stone-500" : "border-stone-300 focus-within:border-stone-400"
            }`}>
              <input
                id="cm-venit"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="next"
                value={venit ? fmt(Number(venit)) : ""}
                placeholder="ex: 6.000"
                aria-invalid={eroareVenit}
                onChange={(e) => {
                  setVenit(e.target.value.replace(/\D/g, ""));
                  if (eroareVenit) setEroareVenit(false);
                }}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
              />
              <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                lei / lună
              </span>
            </div>
            {eroareVenit && (
              <p role="alert" className="mt-2 text-xs font-medium text-stone-900">Introdu salariul brut mediu.</p>
            )}
          </div>

          <div className="mb-5 min-w-0">
            <label htmlFor="cm-cod" className={fieldLabel}>Tip concediu medical</label>
            <div className="relative min-w-0">
              <select
                id="cm-cod"
                value={cod}
                onChange={(e) => setCod(e.target.value as CodConcediuMedical)}
                className={`${controlBox} min-h-11 cursor-pointer appearance-none pr-9`}
              >
                {CODURI_CONCEDIU_MEDICAL.map((item) => (
                  <option key={item.cod} value={item.cod}>{item.nume}</option>
                ))}
              </select>
              <Chevron />
            </div>
          </div>

          {cod === "01" && (
            <fieldset className="mb-5 min-w-0">
              <legend className={fieldLabel}>Durata episodului de boală</legend>
              <div className="grid grid-cols-3 gap-2">
                {TRANSE_COD01.map((t) => (
                  <button
                    key={t.zile}
                    type="button"
                    aria-pressed={zileCal === t.zile}
                    onClick={() => setZileCal(t.zile)}
                    className={`min-h-11 min-w-0 rounded border px-2 py-1.5 text-center text-xs font-medium transition-colors sm:text-sm ${
                      zileCal === t.zile
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 bg-surface text-stone-700 hover:bg-canvas"
                    }`}
                  >
                    <span className="block">{t.eticheta}</span>
                    <span className={`block text-[11px] font-normal ${zileCal === t.zile ? "text-stone-300" : "text-stone-600"}`}>
                      {t.procent}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mb-5 min-w-0">
            <label htmlFor="cm-zile" className={fieldLabel}>Zile lucrătoare de concediu</label>
            <div className={`flex min-w-0 overflow-hidden rounded border bg-surface transition focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)] ${
              eroareZile ? "border-stone-500" : "border-stone-300 focus-within:border-stone-400"
            }`}>
              <input
                id="cm-zile"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="done"
                value={zileLucr}
                placeholder="ex: 5"
                aria-invalid={eroareZile}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setZileLucr(clean);
                  if (eroareZile) setEroareZile(false);
                }}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
              />
              <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                zile
              </span>
            </div>
            {eroareZile && (
              <p role="alert" className="mt-2 text-xs font-medium text-stone-900">Introdu numărul de zile lucrătoare.</p>
            )}
          </div>

          <button
            type="button"
            aria-expanded={avansat}
            aria-controls="optiuni-avansate-cm"
            onClick={() => {
              if (avansat) {
                setZileLuna("");
                setScutitPrimaZi(false);
              }
              setAvansat(!avansat);
            }}
            className="mb-5 flex min-h-11 w-full items-center justify-center rounded border border-dashed border-stone-300 px-4 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-700"
          >
            {avansat ? "▲ Ascunde opțiuni avansate" : "▼ Opțiuni avansate"}
          </button>

          {avansat && (
            <div id="optiuni-avansate-cm" className="mb-5 min-w-0">
              <div className="mb-4 min-w-0">
                <label htmlFor="cm-zile-luna" className={fieldLabel}>Zile lucrătoare în lună</label>
                <div className="flex min-w-0 overflow-hidden rounded border border-stone-300 bg-surface transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
                  <input
                    id="cm-zile-luna"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={zileLuna}
                    placeholder="ex: 21"
                    onChange={(e) => setZileLuna(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
                  />
                  <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                    zile
                  </span>
                </div>
              </div>

              {!info.exceptatPrimaZi && (
                <Toggle
                  label="Fără prima zi neplătită (internare, oncologic, continuare)"
                  checked={scutitPrimaZi}
                  onChange={setScutitPrimaZi}
                />
              )}
            </div>
          )}

          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px"
          >
            <IconCalculeaza />
            Calculează
          </button>
        </form>

        <div
          id="rezultat-medical"
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3"
          aria-live="polite"
        >
          <h2 className={colHeader}>Rezultat calcul</h2>

          {stale && (
            <p className="mb-4 rounded border border-stone-300 bg-canvas px-3 py-2 text-xs text-stone-600" role="status">
              Ai modificat datele – apasă <strong className="font-medium text-stone-900">Calculează</strong> pentru actualizare.
            </p>
          )}

          <div aria-hidden={!r} className={stale ? "opacity-50 transition-opacity" : "transition-opacity"}>
            <div className="overflow-hidden rounded border border-stone-300">
              <table aria-label="Calcul indemnizație concediu medical" className={tabelRezultat}>
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <thead>
                  <tr className="bg-canvas">
                    <th scope="col" className={`${celulaIndicator} font-medium`}>Indicator</th>
                    <th scope="col" className={`${celulaSuma} font-medium`}>Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  <RandRezultat
                    eticheta={r ? `Indemnizație brută (${Math.round(r.procent * 100)}% · ${r.zilePlatite} zile plătite)` : "Indemnizație brută"}
                    valoare={r?.indemnizatieBruta}
                  />
                  <RandRezultat eticheta="CAS (pensie, bază plafonată)" valoare={r?.cas} retinere />
                  <RandRezultat eticheta="CASS (sănătate)" valoare={r?.cass} retinere />
                  <RandRezultat eticheta="Impozit pe venit" valoare={r?.impozit} retinere />
                  <tr className="bg-stone-900 font-bold text-white">
                    <th scope="row" className="border-r border-stone-600 px-3 py-3 text-left">Primești în mână (net)</th>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {r ? <span className="marcaj">{suma(r.indemnizatieNeta)}</span> : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3 overflow-hidden rounded border border-stone-300">
              <table aria-label="Cine suportă plata concediului medical" className={tabelRezultat}>
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <tbody>
                  <RandRezultat
                    eticheta={r ? `Plătit de firmă (${r.zileAngajator} zile)` : "Plătit de firmă"}
                    valoare={r?.brutAngajator}
                  />
                  <RandRezultat
                    eticheta={r ? `Plătit de stat / FNUASS (${r.zileFnuass} zile)` : "Plătit de stat / FNUASS"}
                    valoare={r?.brutFnuass}
                    ultim
                  />
                </tbody>
              </table>
            </div>

            {r && (
              <details className="mt-3 text-sm text-stone-600">
                <summary className="min-h-11 cursor-pointer py-3 font-medium text-stone-900">Detalii de calcul</summary>
                <p className="mb-2">
                  Bază zilnică: {r.bazaZilnica.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei/zi ·{" "}
                  {r.zileNeplatite ? "prima zi lucrătoare nu se plătește" : "toate zilele lucrătoare sunt plătite"}.
                </p>
                <p className="mb-2">
                  CAS 25% se calculează la baza plafonată de 35% din {fmt(CASTIG_MEDIU_BASS)} lei (BASS), proporțional cu zilele plătite ({fmt(r.bazaCas)} lei).
                </p>
                {r.plafonAplicat && (
                  <p className="mb-2">
                    Venitul a fost plafonat la 12 salarii minime brute ({fmt(r.venitPlafonat)} lei/lună).
                  </p>
                )}
                <p>Zilele lucrate din aceeași lună rămân plătite separat ca salariu obișnuit.</p>
              </details>
            )}
          </div>

          {r && (
            <div className="mt-4">
              <FeedbackContextual context="calcul" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
