"use client";

// src/app/components/CalculatorTva.tsx
// Adaugă TVA la un preț sau scoate TVA dintr-un preț care o conține.
//
// Toată aritmetica stă în `@/lib/tva`. Aici se citește ce a scris omul și se
// afișează cele trei sume.

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import IconCalculeaza from "@/app/components/IconCalculeaza";
import { SPATIU_JOS } from "@/app/components/ui";
import { masoaraCalcul } from "@/lib/analytics";
import { deruleazaLaRezultat } from "@/lib/deruleaza-la-rezultat";
import {
  COTA_REDUSA_PROCENT,
  COTA_STANDARD_PROCENT,
  calculeazaTva,
  citesteCota,
  citesteSuma,
  formatBani,
  formatCota,
  type DirectieTva,
} from "@/lib/tva";

const fieldLabel = "mb-2 block text-xs font-medium text-stone-600";
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const tabelRezultat = "w-full table-fixed border-collapse text-sm tabular-nums text-stone-700";
const celulaIndicator = "border-b border-r border-stone-300 px-3 py-3 text-left";
const celulaSuma = "border-b border-stone-300 px-3 py-3 text-right whitespace-nowrap";

type AlegereCota = "standard" | "redusa" | "alta";

const DIRECTII: { valoare: DirectieTva; eticheta: string; detaliu: string }[] = [
  { valoare: "adauga", eticheta: "Adaug TVA", detaliu: "Suma scrisă e fără TVA." },
  { valoare: "scoate", eticheta: "Scot TVA", detaliu: "Suma scrisă are TVA în ea." },
];

const COTE: { valoare: AlegereCota; eticheta: string; detaliu?: string }[] = [
  { valoare: "standard", eticheta: `${COTA_STANDARD_PROCENT}%`, detaliu: "Cota standard: tot ce nu e la cota redusă." },
  { valoare: "redusa", eticheta: `${COTA_REDUSA_PROCENT}%`, detaliu: "Cota redusă: mâncare, medicamente, cazare, cărți." },
  { valoare: "alta", eticheta: "Altă cotă" },
];

function Rand({ eticheta, valoare, sub, inversat, ultim, calcul }: {
  eticheta: string;
  valoare: string | null;
  sub?: boolean;
  inversat?: boolean;
  ultim?: boolean;
  calcul?: string;
}) {
  if (inversat) {
    return (
      <tr className="bg-stone-900 font-bold text-white">
        <th scope="row" className={`${ultim ? "" : "border-b border-b-stone-700 "}border-r border-r-stone-600 px-3 py-3 text-left`}>
          {eticheta}
        </th>
        <td className={`${ultim ? "" : "border-b border-b-stone-700 "}px-3 py-3 text-right whitespace-nowrap`}>
          {valoare ? <span className="marcaj">{valoare}</span> : "—"}
        </td>
      </tr>
    );
  }
  const b = ultim ? "border-b-0 " : "";
  return (
    <tr>
      <th scope="row" className={`${b}${celulaIndicator} font-normal ${sub ? "pl-4 sm:pl-8" : ""}`}>
        {eticheta}
        {calcul ? <span className="mt-0.5 block text-xs tabular-nums text-stone-600">{calcul}</span> : null}
      </th>
      <td className={`${b}${celulaSuma}`}>
        {valoare ?? "—"}
      </td>
    </tr>
  );
}

export default function CalculatorTva() {
  const [directie, setDirectie] = useState<DirectieTva>("adauga");
  const [suma, setSuma] = useState("");
  const [alegere, setAlegere] = useState<AlegereCota>("standard");
  const [cotaScrisa, setCotaScrisa] = useState("");
  // Devine adevărat la prima apăsare pe „Calculează”; de atunci rezultatul urmează formularul.
  const [cerut, setCerut] = useState(false);

  const sumaBani = citesteSuma(suma);
  const cotaSutimi =
    alegere === "standard" ? COTA_STANDARD_PROCENT * 100
    : alegere === "redusa" ? COTA_REDUSA_PROCENT * 100
    : citesteCota(cotaScrisa);

  const r = cerut && sumaBani !== null && cotaSutimi !== null ? calculeazaTva({ sumaBani, cotaSutimi, directie }) : null;

  const [lipsa, setLipsa] = useState({ suma: false, cota: false });
  const eroareSuma = lipsa.suma ? "Scrie o sumă, de exemplu 1.250,50." : null;
  const eroareCota = lipsa.cota && alegere === "alta" ? "Scrie cota, de exemplu 9." : null;

  function calculeaza() {
    setCerut(true);
    setLipsa({ suma: sumaBani === null, cota: cotaSutimi === null });
    if (sumaBani === null || cotaSutimi === null) return;
    masoaraCalcul("tva", { varianta: directie });
    deruleazaLaRezultat("rezultat-tva", "calc-tva");
  }

  const cota = r ? formatCota(r.cotaSutimi) : cotaSutimi !== null ? formatCota(cotaSutimi) : null;
  const calculTva = r
    ? directie === "adauga"
      ? `${formatBani(r.faraTva)} lei × ${cota}%`
      : `${formatBani(r.cuTva)} lei × ${cota} ÷ ${formatCota(10_000 + r.cotaSutimi)}`
    : undefined;

  const detaliuDirectie = DIRECTII.find((d) => d.valoare === directie)?.detaliu;
  const detaliuCota = COTE.find((c) => c.valoare === alegere)?.detaliu;

  return (
    <section className="border-b border-stone-200 bg-canvas" aria-labelledby="calculator-tva-titlu">
      <div id="calc-tva" className={`mx-auto grid max-w-6xl items-start gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
        {/* ─── Intrări ─────────────────────────────────────────────────── */}
        <form
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2"
          onSubmit={(e) => {
            e.preventDefault();
            calculeaza();
          }}
        >
          <h2 id="calculator-tva-titlu" className={colHeader}>Suma ta</h2>

          <div className="mb-5">
            <span className={fieldLabel}>Ce vrei să faci</span>
            <div className="flex w-full overflow-hidden rounded border border-stone-300">
              {DIRECTII.map((item, i) => (
                <button
                  key={item.valoare}
                  type="button"
                  aria-pressed={directie === item.valoare}
                  onClick={() => setDirectie(item.valoare)}
                  className={`${i > 0 ? "border-l border-stone-300 " : ""}inline-flex min-h-11 flex-1 items-center justify-center px-3 text-sm font-medium transition-colors ${
                    directie === item.valoare ? "bg-stone-900 text-white" : "bg-surface text-stone-600 hover:bg-canvas"
                  }`}
                >
                  {item.eticheta}
                </button>
              ))}
            </div>
            {detaliuDirectie ? <p className="mt-1.5 text-xs text-stone-600">{detaliuDirectie}</p> : null}
          </div>

          <div className="mb-5 min-w-0">
            <label htmlFor="suma-tva" className={fieldLabel}>
              {directie === "adauga" ? "Preț fără TVA" : "Preț cu TVA"}
            </label>
            <div className={`flex min-w-0 overflow-hidden rounded border bg-surface transition focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)] ${
              eroareSuma ? "border-stone-500" : "border-stone-300 focus-within:border-stone-400"
            }`}>
              <input
                id="suma-tva"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                enterKeyHint="done"
                placeholder="ex: 1.000"
                value={suma}
                onChange={(e) => { setSuma(e.target.value); setLipsa((l) => ({ ...l, suma: false })); }}
                aria-invalid={eroareSuma ? true : undefined}
                aria-describedby={eroareSuma ? "eroare-suma-tva" : undefined}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
              />
              <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                lei
              </span>
            </div>
            {eroareSuma ? (
              <p id="eroare-suma-tva" role="alert" className="mt-2 text-xs font-medium text-stone-900">{eroareSuma}</p>
            ) : null}
          </div>

          <fieldset className="mb-5 min-w-0">
            <legend className={fieldLabel}>Cota de TVA</legend>
            <div className="grid grid-cols-3 gap-2">
              {COTE.map((item) => (
                <button
                  key={item.valoare}
                  type="button"
                  aria-pressed={alegere === item.valoare}
                  onClick={() => { setAlegere(item.valoare); setLipsa((l) => ({ ...l, cota: false })); }}
                  className={`min-h-11 min-w-0 rounded border px-2 text-sm font-medium transition-colors ${
                    alegere === item.valoare
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 bg-surface text-stone-700 hover:bg-canvas"
                  }`}
                >
                  {item.eticheta}
                </button>
              ))}
            </div>
            {detaliuCota ? <p className="mt-1.5 text-xs text-stone-600">{detaliuCota}</p> : null}
          </fieldset>

          {alegere === "alta" ? (
            <div className="mb-5 min-w-0">
              <label htmlFor="cota-tva" className={fieldLabel}>Cota</label>
              <div className={`flex min-w-0 overflow-hidden rounded border bg-surface transition focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)] ${
                eroareCota ? "border-stone-500" : "border-stone-300 focus-within:border-stone-400"
              }`}>
                <input
                  id="cota-tva"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  enterKeyHint="done"
                  placeholder="ex: 9"
                  value={cotaScrisa}
                  onChange={(e) => { setCotaScrisa(e.target.value); setLipsa((l) => ({ ...l, cota: false })); }}
                  aria-invalid={eroareCota ? true : undefined}
                  aria-describedby={eroareCota ? "eroare-cota-tva" : undefined}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
                />
                <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                  %
                </span>
              </div>
              <p className="mt-1.5 text-xs text-stone-600">Pentru o factură mai veche sau din altă țară.</p>
              {eroareCota ? (
                <p id="eroare-cota-tva" role="alert" className="mt-1.5 text-xs font-medium text-stone-900">{eroareCota}</p>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px"
          >
            <IconCalculeaza />
            Calculează
          </button>
        </form>

        {/* ─── Rezultat ────────────────────────────────────────────────── */}
        <div
          id="rezultat-tva"
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3"
          aria-live="polite"
        >
          <h2 className={colHeader}>Rezultat calcul</h2>

          <div className="overflow-hidden rounded border border-stone-300">
            <table className={tabelRezultat} aria-label="Rezultat calcul TVA">
              <colgroup><col /><col className="w-32 sm:w-44" /></colgroup>
              <thead>
                <tr className="bg-canvas">
                  <th scope="col" className={`${celulaIndicator} font-medium`}>Element</th>
                  <th scope="col" className={`${celulaSuma} font-medium`}>Valoare</th>
                </tr>
              </thead>
              <tbody>
                <Rand
                  eticheta="Preț fără TVA"
                  valoare={r ? `${formatBani(r.faraTva)} lei` : null}
                  inversat={directie === "scoate"}
                />
                <Rand
                  eticheta={cota ? `TVA ${cota}%` : "TVA"}
                  valoare={r ? `${formatBani(r.tva)} lei` : null}
                  sub
                  calcul={calculTva}
                />
                <Rand
                  eticheta="Preț cu TVA"
                  valoare={r ? `${formatBani(r.cuTva)} lei` : null}
                  inversat={directie === "adauga"}
                  ultim
                />
              </tbody>
            </table>
          </div>

          {!r ? (
            <p className="mt-4 text-sm text-stone-600">
              Scrie suma și apasă <strong className="text-stone-900">Calculează</strong>.
            </p>
          ) : (
            <div className="mt-4">
              <FeedbackContextual context="calcul" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
