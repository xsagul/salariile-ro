"use client";

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import IconCalculeaza from "@/app/components/IconCalculeaza";
import { SPATIU_JOS } from "@/app/components/ui";
import {
  STAGIU_COMPLET_PENSIE_ANI,
  STAGIU_MINIM_PENSIE_ANI,
  calculeazaVechime,
  type PerioadaMunca,
  type RezultatVechime,
} from "@/lib/vechime-munca";
import { deruleazaLaRezultat } from "@/lib/deruleaza-la-rezultat";
import { masoaraCalcul } from "@/lib/analytics";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";

function Row({
  label,
  value,
  sub,
  bold,
  ultim,
  temei,
}: {
  label: string;
  value: string | null;
  sub?: boolean;
  bold?: boolean;
  ultim?: boolean;
  temei?: string;
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

function formatLuniInAni(luniTotale: number): string {
  if (luniTotale <= 0) return "Îndeplinit";
  const ani = Math.floor(luniTotale / 12);
  const luni = luniTotale % 12;
  if (ani === 0) return `mai lipsesc ${luni} ${luni === 1 ? "lună" : "luni"}`;
  if (luni === 0) return `mai lipsesc ${ani} ${ani === 1 ? "an" : "ani"}`;
  return `mai lipsesc ${ani} ${ani === 1 ? "an" : "ani"} și ${luni} ${luni === 1 ? "lună" : "luni"}`;
}

export default function CalculatorVechimeMunca() {
  const [perioade, setPerioade] = useState<PerioadaMunca[]>([
    { deLa: "2020-01-01", panaLa: "2026-11-19" },
  ]);
  const [rez, setRez] = useState<RezultatVechime | null>(null);

  const actualizeaza = (index: number, camp: keyof PerioadaMunca, valoare: string) => {
    setPerioade((vechi) => vechi.map((p, i) => (i === index ? { ...p, [camp]: valoare } : p)));
    setRez(null);
  };

  const adaugaPerioada = () => {
    setPerioade((vechi) => [...vechi, { deLa: "", panaLa: "" }]);
    setRez(null);
  };

  const stergePerioada = (index: number) => {
    setPerioade((vechi) => (vechi.length <= 1 ? vechi : vechi.filter((_, i) => i !== index)));
    setRez(null);
  };

  const calculeaza = () => {
    const r = calculeazaVechime(perioade);
    setRez(r);
    masoaraCalcul("vechime_munca", {
      varianta: perioade.length > 1 ? "multiplu" : "o_perioada",
    });
    deruleazaLaRezultat("rezultat-vechime", "calc-vechime");
  };

  const r = rez;

  return (
    <div id="calc-vechime" className={`mx-auto grid max-w-6xl gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
      {/* ─── Intrări ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Perioade lucrate</h2>

        <div className="flex flex-col gap-4">
          {perioade.map((p, i) => (
            <div key={i} className="rounded border border-stone-200 bg-canvas p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-stone-700">Perioada {i + 1}</span>
                {perioade.length > 1 && (
                  <button
                    type="button"
                    onClick={() => stergePerioada(i)}
                    className="text-xs text-stone-600 underline underline-offset-2 hover:text-stone-900"
                  >
                    Șterge
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="block text-xs text-stone-600">De la</span>
                  <input
                    type="date"
                    value={p.deLa}
                    onChange={(e) => actualizeaza(i, "deLa", e.target.value)}
                    className="mt-1 min-h-11 w-full rounded border border-stone-300 bg-white px-2.5 py-2 text-sm tabular-nums text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs text-stone-600">Până la</span>
                  <input
                    type="date"
                    value={p.panaLa}
                    onChange={(e) => actualizeaza(i, "panaLa", e.target.value)}
                    className="mt-1 min-h-11 w-full rounded border border-stone-300 bg-white px-2.5 py-2 text-sm tabular-nums text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
                  />
                </label>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={adaugaPerioada}
            className="min-h-11 w-full rounded border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-stone-500 hover:bg-stone-50"
          >
            + Adaugă încă o perioadă
          </button>

          <button
            type="button"
            onClick={calculeaza}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
          >
            <IconCalculeaza />
            Calculează vechimea
          </button>
        </div>
      </div>

      {/* ─── Rezultat ────────────────────────────────────────────────── */}
      <div id="rezultat-vechime" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
        <h2 className={colHeader}>Rezultatul</h2>

        <div className="overflow-hidden rounded border border-stone-300">
          <table className="w-full table-auto border-collapse text-sm text-stone-700 sm:table-fixed">
            <colgroup><col /><col className="w-40 sm:w-48" /></colgroup>
            <thead>
              <tr>
                <th className="border-b border-r border-b-stone-300 border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">
                  Indicator
                </th>
                <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">
                  Valoare
                </th>
              </tr>
            </thead>
            <tbody>
              <Row
                label="Vechime totală în muncă"
                value={r ? `${r.ani} ani, ${r.luni} luni, ${r.zile} zile` : null}
                bold
                temei={r ? `${fmt(r.zileTotale)} zile calendaristice cumulate (${r.perioadeValide} ${r.perioadeValide === 1 ? "perioadă" : "perioade"}).` : undefined}
              />
              <Row
                label="Gradație vechime la stat"
                value={r ? `Gradația ${r.gradatie.gradatie} (${r.gradatie.sporCumulat})` : null}
                temei={
                  r
                    ? r.gradatie.aniUrmator
                      ? `Tranșa ${r.gradatie.interval}; următoarea gradație la ${r.gradatie.aniUrmator} ani (Legea 153/2017).`
                      : "Gradația maximă de vechime (peste 20 de ani, Legea 153/2017)."
                    : "Legea-cadru 153/2017, art. 10."
                }
              />
              <Row
                label={`Stagiu minim de pensie (${STAGIU_MINIM_PENSIE_ANI} ani)`}
                value={r ? formatLuniInAni(r.luniRamaseStagiuMinimPensie) : null}
                sub
              />
              <Row
                label={`Stagiu complet de pensie (${STAGIU_COMPLET_PENSIE_ANI} ani)`}
                value={r ? formatLuniInAni(r.luniRamaseStagiuCompletPensie) : null}
                sub
              />
              <Row
                label="Cotă variabilă ajutor de șomaj"
                value={r ? `${r.cotaSomajProcent}%` : null}
                sub
                ultim
                temei="Legea 76/2002: 3% (3 ani), 5% (5 ani), 7% (10 ani), 10% (20 ani)."
              />
            </tbody>
          </table>
        </div>

        {r ? (
          <p className="mt-4 rounded border border-stone-300 bg-canvas p-3 text-sm text-stone-700">
            {r.zileSuprapuseEliminate > 0 ? (
              <>
                <strong className="text-stone-900">Suprapunere detectată:</strong> am eliminat {fmt(r.zileSuprapuseEliminate)} zile suprapuse între contracte simultane, deoarece două contracte din aceeași zi nu dublează vechimea calendaristică.{" "}
              </>
            ) : null}
            Pentru actele oficiale poți scoate extrasul din contul CNPP (stagiul de pensie) sau din REGES-ONLINE (contractele de muncă).
          </p>
        ) : (
          <p className="mt-4 text-sm text-stone-600">
            Introdu datele de început și sfârșit pentru fiecare contract și apasă{" "}
            <strong className="text-stone-900">Calculează vechimea</strong>.
          </p>
        )}

        {r ? (
          <div className="mt-4">
            <FeedbackContextual context="calcul" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
