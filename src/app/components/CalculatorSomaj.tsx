"use client";

// src/app/components/CalculatorSomaj.tsx
// Indemnizația de șomaj — Legea 76/2002.
//
// Toată aritmetica stă în `@/lib/somaj`. Aici nu se calculează nimic.
//
// Cele două lucruri pe care interfața trebuie să le spună explicit, pentru că
// tot restul pieței le ratează:
//   1. partea fixă e ISR-ul INTEGRAL, nu 75% din el — s-a schimbat în 2022;
//   2. CAS nu se reține: îl plătește ANOFM, deci stagiul de pensie curge.

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import { SelectorPastile, type OptiunePastila } from "@/app/components/SelectorPastile";
import {
  COTE,
  ISR,
  ISR_AN,
  TEMEI,
  calculeazaSomaj,
  durataLuni,
  type RezultatSomaj,
} from "@/lib/somaj";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";

function Row({ label, value, sub, bold, ultim, temei }: {
  label: string; value: string | null; sub?: boolean; bold?: boolean; ultim?: boolean; temei?: string;
}) {
  const b = ultim ? "" : "border-b ";
  return (
    <tr>
      <td className={`${b}border-r border-stone-300 px-3 py-3 text-left ${sub ? "pl-4 sm:pl-8" : ""} ${bold ? "font-bold text-stone-900" : ""}`}>
        {label}
        {temei ? <span className="mt-0.5 block text-xs text-stone-600">{temei}</span> : null}
      </td>
      <td className={`${b}border-stone-300 px-3 py-3 text-right tabular-nums whitespace-nowrap ${bold ? "font-bold text-stone-900" : ""}`}>
        {value === null ? "–" : value}
      </td>
    </tr>
  );
}

/** Praguri care schimbă rezultatul — se aleg direct, ca la gradații. */
const STAGII: OptiunePastila<number>[] = [
  { valoare: 0.5, eticheta: "sub 1 an", detaliu: "Dreptul nu se deschide pe art. 39." },
  { valoare: 2, eticheta: "1–3 ani", detaliu: "6 luni, doar partea fixă: sub 3 ani nu există cotă." },
  { valoare: 4, eticheta: "3–5 ani", detaliu: "6 luni, cu o cotă de 3%." },
  { valoare: 7, eticheta: "5–10 ani", detaliu: "9 luni, cu o cotă de 5%." },
  { valoare: 10, eticheta: "exact 10 ani", detaliu: "9 luni, dar cota urcă deja la 7%." },
  { valoare: 15, eticheta: "10–20 ani", detaliu: "12 luni, cu o cotă de 7%." },
  { valoare: 25, eticheta: "peste 20 ani", detaliu: "12 luni, cu cota maximă de 10%." },
];

export default function CalculatorSomaj() {
  const [aniStagiu, setAniStagiu] = useState(7);
  const [media, setMedia] = useState("5000");
  const [absolvent, setAbsolvent] = useState(false);
  const [rez, setRez] = useState<RezultatSomaj | null>(null);

  const reset = () => setRez(null);
  const calculeaza = () =>
    setRez(calculeazaSomaj({ aniStagiu, mediaBruta: Number(media) || 0, absolvent }));

  const r = rez;
  const fara = !absolvent && durataLuni(aniStagiu) === null;

  return (
    <div id="calc-somaj" className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-5">
      {/* ─── Intrări ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Situația ta</h2>

        <div className="flex flex-col gap-5">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm text-stone-900">
            <input
              type="checkbox"
              checked={absolvent}
              onChange={(e) => { setAbsolvent(e.target.checked); reset(); }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-400 text-stone-900 focus:ring-stone-300"
            />
            <span>
              Sunt absolvent
              <span className="mt-0.5 block text-xs text-stone-600">
                Sumă fixă, pe 6 luni, indiferent de salariul anterior.
              </span>
            </span>
          </label>

          {!absolvent && (
            <>
              <SelectorPastile
                eticheta="Stagiul de cotizare"
                ajutor="Decide și durata, și cota."
                optiuni={STAGII}
                valoare={aniStagiu}
                onChange={(v) => { setAniStagiu(v); reset(); }}
              />

              <label className="block">
                <span className="block text-sm font-medium text-stone-900">
                  Media salariului brut, ultimele 12 luni
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-stone-600">
                  Contează doar peste 3 ani de stagiu.
                </span>
                <span className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={100}
                    value={media}
                    onChange={(e) => { setMedia(e.target.value); reset(); }}
                    className="min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
                  />
                  <span className="shrink-0 text-sm text-stone-600">lei</span>
                </span>
              </label>
            </>
          )}

          <button
            type="button"
            onClick={calculeaza}
            disabled={fara}
            className="min-h-11 w-full rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            Calculează
          </button>

          {fara && (
            <p className="rounded border border-stone-300 bg-canvas p-3 text-sm leading-relaxed text-stone-700">
              Cu un stagiu de cotizare sub un an, dreptul la indemnizație nu se deschide pe{" "}
              {TEMEI.durata}. Excepția este situația de absolvent, care are temei separat.
            </p>
          )}
        </div>
      </div>

      {/* ─── Rezultat ────────────────────────────────────────────────── */}
      <div id="rezultat-somaj" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
        <h2 className={colHeader}>Rezultatul</h2>

        <div className="overflow-hidden rounded border border-stone-300">
          <table className="w-full table-auto border-collapse text-sm text-stone-700 sm:table-fixed">
            <colgroup><col /><col className="w-32 sm:w-40" /></colgroup>
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
              <Row
                label="Durata acordării"
                value={r ? `${r.luni} luni` : null}
                temei={r?.absolvent ? TEMEI.absolventi : TEMEI.durata}
              />
              <Row
                label={r?.absolvent ? `Sumă fixă — 50% din ISR (${fmt(ISR)} lei)` : `Partea fixă — indicatorul social de referință ${ISR_AN}`}
                value={r ? `${fmt(r.parteFixa)} lei` : null}
                temei={r?.absolvent ? TEMEI.absolventi : TEMEI.parteFixa}
              />
              {!r?.absolvent && (
                <Row
                  label={r ? `Partea variabilă — ${Math.round(r.cota * 100)}% din media brută` : "Partea variabilă"}
                  value={r ? `${fmt(r.parteVariabila)} lei` : null}
                  sub
                  temei={`${TEMEI.parteVariabila} · cote la ${TEMEI.cote}`}
                />
              )}
              <Row label="Indemnizație lunară stabilită" value={r ? `${fmt(r.brut)} lei` : null} bold />
              <Row
                label="CASS 10%, reținută"
                value={r ? `− ${fmt(r.cass)} lei` : null}
                sub
                temei={TEMEI.cass}
              />
              <Row label="Rămâne de încasat, lunar" value={r ? `${fmt(r.net)} lei` : null} bold />
              <Row
                label={r ? `Total pe cele ${r.luni} luni` : "Total pe toată perioada"}
                value={r ? `${fmt(r.totalNet)} lei` : null}
                sub
                ultim
              />
            </tbody>
          </table>
        </div>

        {r ? (
          <p className="mt-4 rounded border border-stone-300 bg-canvas p-3 text-sm leading-relaxed text-stone-700">
            <strong className="text-stone-900">CAS nu se reține.</strong> Contribuția la pensie
            pentru perioada de șomaj o plătește Agenția Națională pentru Ocuparea Forței de Muncă,
            din bugetul asigurărilor pentru șomaj ({TEMEI.cas}). Suma de mai sus nu este micșorată
            de ea, iar stagiul tău de pensie curge mai departe. Indemnizația nu se impozitează.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            Alege stagiul, pune media salariului brut și apasă{" "}
            <strong className="text-stone-900">Calculează</strong>.
          </p>
        )}

        <div className="mt-5 border-t border-stone-200 pt-4 text-xs leading-relaxed text-stone-600">
          <p>
            Partea fixă este <strong className="text-stone-800">valoarea integrală a ISR</strong>,
            nu 75% din ea. Procentul a fost eliminat prin Legea nr. 273/2022, în vigoare din 3
            octombrie 2022, iar calculatoarele care încă îl folosesc dau un rezultat mai mic cu
            un sfert din partea fixă. Cotele variabile sunt cele de la {TEMEI.cote}:{" "}
            {COTE.slice().reverse().map((c) => `${Math.round(c.cota * 100)}% de la ${c.minAni} ani`).join(", ")}.
          </p>
        </div>

        {r ? (
          <div className="mt-4">
            <FeedbackContextual context="calcul" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
