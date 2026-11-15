"use client";

// src/app/components/CalculatorTva.tsx
// Adaugă TVA la un preț sau scoate TVA dintr-un preț care o conține.
//
// Toată aritmetica stă în `@/lib/tva`. Aici se citește ce a scris omul și se
// afișează cele trei sume.
//
// De ce câmpul sumei e text, nu număr: un preț are zecimale, iar oamenii le
// scriu cu virgulă sau cu punct, cu sau fără punct la mii. Un câmp de tip număr
// acceptă o singură formă, după limba telefonului, și respinge în tăcere restul.
//
// De ce rămâne butonul „Calculează”, deși calculul e instantaneu: pe telefon
// rezultatul stă sub formular, ascuns de tastatură. Butonul îl aduce în ecran,
// ca la celelalte calculatoare. După primul calcul, orice schimbare (altă sumă,
// altă cotă, cealaltă direcție) se vede pe loc, fără altă apăsare.

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import IconCalculeaza from "@/app/components/IconCalculeaza";
import { SelectorPastile, type OptiunePastila } from "@/app/components/SelectorPastile";
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

const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const camp =
  "min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300";

type AlegereCota = "standard" | "redusa" | "alta";

const DIRECTII: OptiunePastila<DirectieTva>[] = [
  { valoare: "adauga", eticheta: "Adaug TVA", detaliu: "Suma scrisă e fără TVA." },
  { valoare: "scoate", eticheta: "Scot TVA", detaliu: "Suma scrisă are TVA în ea." },
];

const COTE: OptiunePastila<AlegereCota>[] = [
  { valoare: "standard", eticheta: `${COTA_STANDARD_PROCENT}%`, detaliu: "Cota standard: tot ce nu e la cota redusă." },
  { valoare: "redusa", eticheta: `${COTA_REDUSA_PROCENT}%`, detaliu: "Cota redusă: mâncare, medicamente, cazare, cărți." },
  { valoare: "alta", eticheta: "Altă cotă" },
];

function Rand({ eticheta, valoare, sub, bold, ultim, calcul }: {
  eticheta: string; valoare: string | null; sub?: boolean; bold?: boolean; ultim?: boolean; calcul?: string;
}) {
  const b = ultim ? "" : "border-b ";
  return (
    <tr>
      <td className={`${b}border-r border-stone-300 px-3 py-3 text-left ${sub ? "pl-4 sm:pl-8" : ""} ${bold ? "font-bold text-stone-900" : ""}`}>
        {eticheta}
        {calcul ? <span className="mt-0.5 block text-xs tabular-nums text-stone-600">{calcul}</span> : null}
      </td>
      <td className={`${b}border-stone-300 px-3 py-3 text-right tabular-nums whitespace-nowrap ${bold ? "font-bold text-stone-900" : ""}`}>
        {valoare === null ? "–" : valoare}
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

  // Mesajele apar numai la apăsarea pe „Calculează” și dispar cum începe omul să scrie:
  // un câmp golit ca să pui altă sumă, sau „Altă cotă” abia aleasă, nu sunt greșeli.
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

  const laEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") calculeaza();
  };

  const cota = r ? formatCota(r.cotaSutimi) : cotaSutimi !== null ? formatCota(cotaSutimi) : null;
  // Calculul scris cu cifrele omului, sub rândul de TVA: așa se vede de unde vine suma.
  const calculTva = r
    ? directie === "adauga"
      ? `${formatBani(r.faraTva)} lei × ${cota}%`
      : `${formatBani(r.cuTva)} lei × ${cota} ÷ ${formatCota(10_000 + r.cotaSutimi)}`
    : undefined;

  return (
    <div id="calc-tva" className={`mx-auto grid max-w-6xl gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
      {/* ─── Intrări ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Suma ta</h2>

        <div className="flex flex-col gap-2">
          <SelectorPastile
            eticheta="Ce vrei să faci"
            optiuni={DIRECTII}
            valoare={directie}
            onChange={setDirectie}
          />

          <label className="mb-3 block">
            <span className="block text-sm font-medium text-stone-900">
              {directie === "adauga" ? "Preț fără TVA" : "Preț cu TVA"}
            </span>
            <span className="mt-2 flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                enterKeyHint="done"
                placeholder="0,00"
                value={suma}
                onChange={(e) => { setSuma(e.target.value); setLipsa((l) => ({ ...l, suma: false })); }}
                onKeyDown={laEnter}
                aria-invalid={eroareSuma ? true : undefined}
                aria-describedby={eroareSuma ? "eroare-suma-tva" : undefined}
                className={camp}
              />
              <span className="shrink-0 text-sm text-stone-600">lei</span>
            </span>
            {eroareSuma ? (
              <span id="eroare-suma-tva" role="alert" className="mt-1 block text-sm text-red-700">{eroareSuma}</span>
            ) : null}
          </label>

          <SelectorPastile
            eticheta="Cota de TVA"
            optiuni={COTE}
            valoare={alegere}
            onChange={(v) => { setAlegere(v); setLipsa((l) => ({ ...l, cota: false })); }}
          />

          {alegere === "alta" ? (
            <label className="mb-3 block">
              <span className="block text-sm font-medium text-stone-900">Cota</span>
              <span className="mt-0.5 block text-xs text-stone-600">Pentru o factură mai veche sau din altă țară.</span>
              <span className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  enterKeyHint="done"
                  value={cotaScrisa}
                  onChange={(e) => { setCotaScrisa(e.target.value); setLipsa((l) => ({ ...l, cota: false })); }}
                  onKeyDown={laEnter}
                  aria-invalid={eroareCota ? true : undefined}
                  aria-describedby={eroareCota ? "eroare-cota-tva" : undefined}
                  className={camp}
                />
                <span className="shrink-0 text-sm text-stone-600">%</span>
              </span>
              {eroareCota ? (
                <span id="eroare-cota-tva" role="alert" className="mt-1 block text-sm text-red-700">{eroareCota}</span>
              ) : null}
            </label>
          ) : null}

          <button
            type="button"
            onClick={calculeaza}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
          >
            <IconCalculeaza />
            Calculează
          </button>
        </div>
      </div>

      {/* ─── Rezultat ────────────────────────────────────────────────── */}
      <div id="rezultat-tva" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
        <h2 className={colHeader}>Rezultatul</h2>

        <div className="overflow-hidden rounded border border-stone-300">
          <table className="w-full table-auto border-collapse text-sm text-stone-700 sm:table-fixed" aria-live="polite">
            <colgroup><col /><col className="w-36 sm:w-44" /></colgroup>
            <thead>
              <tr>
                <th className="border-b border-r border-b-stone-300 border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">
                  Element
                </th>
                <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">
                  Valoare
                </th>
              </tr>
            </thead>
            <tbody>
              <Rand
                eticheta="Preț fără TVA"
                valoare={r ? `${formatBani(r.faraTva)} lei` : null}
                bold={directie === "scoate"}
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
                bold={directie === "adauga"}
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
  );
}
