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
  ISR,
  ISR_AN,
  TEMEI,
  calculeazaSomaj,
  durataLuni,
  type RezultatSomaj,
} from "@/lib/somaj";
import { deruleazaLaRezultat } from "@/lib/deruleaza-la-rezultat";
import { masoaraCalcul } from "@/lib/analytics";
import IconCalculeaza from "@/app/components/IconCalculeaza";
import { SPATIU_JOS } from "@/app/components/ui";

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
  const calculeaza = () => {
    setRez(calculeazaSomaj({ aniStagiu, mediaBruta: Number(media) || 0, absolvent }));
    masoaraCalcul("somaj", { varianta: absolvent ? "absolvent" : "stagiu" });
    deruleazaLaRezultat("rezultat-somaj", "calc-somaj");
  };

  const r = rez;
  const fara = !absolvent && durataLuni(aniStagiu) === null;

  return (
    <section className="border-b border-stone-200 bg-canvas" aria-labelledby="calculator-somaj-titlu">
      <div id="calc-somaj" className={`mx-auto grid max-w-6xl items-start gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
        {/* ─── Intrări ─────────────────────────────────────────────────── */}
        <form
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!fara) calculeaza();
          }}
        >
          <h2 id="calculator-somaj-titlu" className={colHeader}>Situația ta</h2>

          <div className="flex flex-col gap-5">
            <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm text-stone-900">
              <input
                type="checkbox"
                checked={absolvent}
                onChange={(e) => { setAbsolvent(e.target.checked); reset(); }}
                className="mt-0.5 h-5 w-5 shrink-0 accent-stone-900"
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

                <div className="min-w-0">
                  <label htmlFor="somaj-media" className="mb-1 block text-xs font-medium text-stone-600">
                    Media salariului brut, ultimele 12 luni
                  </label>
                  <div className="flex min-w-0 overflow-hidden rounded border border-stone-300 bg-surface transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
                    <input
                      id="somaj-media"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      enterKeyHint="done"
                      placeholder="ex: 5.000"
                      value={media ? fmt(Number(media)) : ""}
                      onChange={(e) => { setMedia(e.target.value.replace(/\D/g, "")); reset(); }}
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
                    />
                    <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                      lei / lună
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-stone-600">Contează doar peste 3 ani de stagiu.</p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={fara}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              <IconCalculeaza />
              Calculează
            </button>

            {fara && (
              <p className="rounded border border-stone-300 bg-canvas p-3 text-sm text-stone-700">
                Cu un stagiu de cotizare sub un an, dreptul la indemnizație nu se deschide pe{" "}
                {TEMEI.durata}. Excepția este situația de absolvent, care are temei separat.
              </p>
            )}
          </div>
        </form>

        {/* ─── Rezultat ────────────────────────────────────────────────── */}
        <div id="rezultat-somaj" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3" aria-live="polite">
          <h2 className={colHeader}>Rezultat calcul</h2>

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
                <tr className="bg-stone-900 font-bold text-white">
                  <th scope="row" className="border-b border-r border-b-stone-700 border-r-stone-600 px-3 py-3 text-left">
                    Rămâne de încasat, lunar
                  </th>
                  <td className="border-b border-b-stone-700 px-3 py-3 text-right tabular-nums whitespace-nowrap">
                    {r ? <span className="marcaj">{fmt(r.net)} lei</span> : "—"}
                  </td>
                </tr>
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
            <p className="mt-4 rounded border border-stone-300 bg-canvas p-3 text-sm text-stone-700">
              <strong className="text-stone-900">CAS nu se reține.</strong> Contribuția la pensie
              pentru perioada de șomaj o plătește Agenția Națională pentru Ocuparea Forței de Muncă,
              din bugetul asigurărilor pentru șomaj ({TEMEI.cas}). Suma de mai sus nu este micșorată
              de ea, iar stagiul tău de pensie curge mai departe. Indemnizația nu se impozitează.
            </p>
          ) : (
            <p className="mt-4 text-sm text-stone-600">
              Alege stagiul, pune media salariului brut și apasă{" "}
              <strong className="text-stone-900">Calculează</strong>.
            </p>
          )}

          {r ? (
            <div className="mt-4">
              <FeedbackContextual context="calcul" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
