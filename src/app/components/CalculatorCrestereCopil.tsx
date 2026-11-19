"use client";

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import IconCalculeaza from "@/app/components/IconCalculeaza";
import { SPATIU_JOS } from "@/app/components/ui";
import {
  MAXIM_ICC_BRUT,
  MINIM_ICC_BRUT,
  STIMULENT_DUPA_6_LUNI,
  STIMULENT_SUB_6_LUNI,
  calculeazaCrestereCopil,
  type RezultatCrestereCopil,
} from "@/lib/crestere-copil";
import { deruleazaLaRezultat } from "@/lib/deruleaza-la-rezultat";
import { masoaraCalcul } from "@/lib/analytics";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));
const suma = (n: number | undefined, semn = "") => (n === undefined ? "—" : `${semn}${fmt(n)} lei`);

const fieldLabel = "mb-2 block text-xs font-medium text-stone-600";
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const tabelRezultat = "w-full table-fixed border-collapse text-sm tabular-nums text-stone-700";
const celulaIndicator = "border-b border-r border-stone-300 px-3 py-3 text-left";
const celulaSuma = "border-b border-stone-300 px-3 py-3 text-right whitespace-nowrap";

const COPII = [
  { valoare: 1, eticheta: "1 copil" },
  { valoare: 2, eticheta: "Gemeni" },
  { valoare: 3, eticheta: "Tripleți" },
] as const;

type RezultatAfisat = {
  rezultat: RezultatCrestereCopil;
  key: string;
};

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
        {valoare === undefined ? "—" : valoare === 0 ? "0 lei" : suma(valoare, retinere ? "− " : "")}
      </td>
    </tr>
  );
}

export default function CalculatorCrestereCopil() {
  const [mediaNeta, setMediaNeta] = useState("");
  const [numarCopii, setNumarCopii] = useState(1);
  const [handicap, setHandicap] = useState(false);
  const [avansat, setAvansat] = useState(false);
  const [emptyWarn, setEmptyWarn] = useState(false);
  const [rezAfisat, setRezAfisat] = useState<RezultatAfisat | null>(null);

  const cheieCurenta = JSON.stringify([mediaNeta, numarCopii, handicap]);
  const stale = rezAfisat !== null && rezAfisat.key !== cheieCurenta;
  const r = rezAfisat?.rezultat;

  const calculeaza = () => {
    const v = Number(mediaNeta);
    if (!v || v <= 0) {
      setEmptyWarn(true);
      return;
    }
    setEmptyWarn(false);
    const rez = calculeazaCrestereCopil({
      mediaNeta12Luni: v,
      numarCopii,
      copilCuHandicap: handicap,
    });
    if (!rez) return;
    setRezAfisat({ rezultat: rez, key: cheieCurenta });
    masoaraCalcul("crestere_copil", {
      varianta: numarCopii > 1 ? `multiplu_${numarCopii}` : "simplu",
    });
    deruleazaLaRezultat("rezultat-icc", "calc-icc");
  };

  return (
    <section className="border-b border-stone-200 bg-canvas" aria-labelledby="calculator-icc-titlu">
      <div id="calc-icc" className={`mx-auto grid max-w-6xl items-start gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
        <form
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2"
          onSubmit={(e) => {
            e.preventDefault();
            calculeaza();
          }}
        >
          <h2 id="calculator-icc-titlu" className={colHeader}>Venitul tău</h2>

          <div className="mb-5 min-w-0">
            <label htmlFor="icc-net" className={fieldLabel}>Venit net mediu (ultimele 12 luni)</label>
            <div className={`flex min-w-0 overflow-hidden rounded border bg-surface transition focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)] ${
              emptyWarn ? "border-stone-500" : "border-stone-300 focus-within:border-stone-400"
            }`}>
              <input
                id="icc-net"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="done"
                value={mediaNeta ? fmt(Number(mediaNeta)) : ""}
                placeholder="ex: 5.500"
                aria-invalid={emptyWarn}
                onChange={(e) => {
                  setMediaNeta(e.target.value.replace(/\D/g, ""));
                  if (emptyWarn) setEmptyWarn(false);
                }}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
              />
              <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                lei / lună
              </span>
            </div>
            <p role={emptyWarn ? "alert" : undefined} className={`mt-2 text-xs ${emptyWarn ? "font-medium text-stone-900" : "text-stone-600"}`}>
              {emptyWarn
                ? "Introdu media veniturilor nete din ultimele 12 luni."
                : "Din ultimele 12 luni lucrate în ultimii 2 ani înainte de naștere."}
            </p>
          </div>

          <button
            type="button"
            aria-expanded={avansat}
            aria-controls="optiuni-avansate-icc"
            onClick={() => {
              if (avansat) {
                setNumarCopii(1);
                setHandicap(false);
              }
              setAvansat(!avansat);
            }}
            className="mb-5 flex min-h-11 w-full items-center justify-center rounded border border-dashed border-stone-300 px-4 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-700"
          >
            {avansat ? "▲ Ascunde opțiuni avansate" : "▼ Gemeni sau copil cu handicap"}
          </button>

          {avansat && (
            <div id="optiuni-avansate-icc" className="mb-5 min-w-0">
              <fieldset className="mb-4 min-w-0">
                <legend className={fieldLabel}>Copii din aceeași naștere</legend>
                <div className="grid grid-cols-3 gap-2">
                  {COPII.map((opt) => (
                    <button
                      key={opt.valoare}
                      type="button"
                      aria-pressed={numarCopii === opt.valoare}
                      onClick={() => setNumarCopii(opt.valoare)}
                      className={`min-h-11 min-w-0 rounded border px-2 text-sm font-medium transition-colors ${
                        numarCopii === opt.valoare
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-300 bg-surface text-stone-700 hover:bg-canvas"
                      }`}
                    >
                      {opt.eticheta}
                    </button>
                  ))}
                </div>
              </fieldset>

              <Toggle
                label="Copil încadrat în grad de handicap (concediu 3 ani)"
                checked={handicap}
                onChange={setHandicap}
              />
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
          id="rezultat-icc"
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
              <table aria-label="Calcul indemnizație creștere copil" className={tabelRezultat}>
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <thead>
                  <tr className="bg-canvas">
                    <th scope="col" className={`${celulaIndicator} font-medium`}>Indicator</th>
                    <th scope="col" className={`${celulaSuma} font-medium`}>Sumă lunară</th>
                  </tr>
                </thead>
                <tbody>
                  <RandRezultat eticheta="Indemnizație brută (85%)" valoare={r?.brutBaza} />
                  {r && r.numarCopii > 1 && (
                    <RandRezultat eticheta={`Majorare ${r.numarCopii} copii`} valoare={r.suplimentMultipluBrut} />
                  )}
                  <RandRezultat eticheta="CASS (sănătate, 10%)" valoare={r?.cass} retinere />
                  <RandRezultat eticheta="Impozit pe venit și CAS" valoare={r ? 0 : undefined} />
                  <tr className="bg-stone-900 font-bold text-white">
                    <th scope="row" className="border-r border-stone-600 px-3 py-3 text-left">Primești pe card, lunar</th>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {r ? <span className="marcaj">{suma(r.netLunar)}</span> : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3 overflow-hidden rounded border border-stone-300">
              <table aria-label="Durată și stimulent de inserție" className={tabelRezultat}>
                <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                <tbody>
                  <tr>
                    <th scope="row" className={`${celulaIndicator} font-normal`}>Durată concediu</th>
                    <td className={celulaSuma}>{r ? `${r.durataAni} ani` : "—"}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={`${celulaIndicator} font-normal`}>Stimulent întoarcere sub 6 luni</th>
                    <td className={celulaSuma}>{r ? `${fmt(STIMULENT_SUB_6_LUNI)} lei` : "—"}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={`${celulaIndicator} border-b-0 font-normal`}>Stimulent întoarcere după 6 luni</th>
                    <td className={`${celulaSuma} border-b-0`}>{r ? `${fmt(STIMULENT_DUPA_6_LUNI)} lei` : "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {r && (
              <details className="mt-3 text-sm text-stone-600">
                <summary className="min-h-11 cursor-pointer py-3 font-medium text-stone-900">Detalii de calcul</summary>
                <p className="mb-2">
                  85% din media ta netă înseamnă {fmt(r.brutNecorectat)} lei brut
                  {r.plafonatMaxim
                    ? `, plafonat la maximul de ${fmt(MAXIM_ICC_BRUT)} lei.`
                    : r.plafonatMinim
                      ? `, ridicat la minimul de ${fmt(MINIM_ICC_BRUT)} lei.`
                      : "."}
                </p>
                <p>Cel puțin {r.luniCelalaltParinte} luni din concediu îi revin celuilalt părinte, dacă are stagiul legal.</p>
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
