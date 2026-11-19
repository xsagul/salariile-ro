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

const fieldLabel = "mb-1.5 block text-xs font-medium text-stone-600";
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const dateInput =
  "min-h-11 w-full min-w-0 rounded border border-stone-300 bg-surface px-3 py-2 text-base tabular-nums text-stone-900 outline-none transition focus:border-stone-400 focus:shadow-[0_0_6px_rgba(28,25,23,0.12)] sm:text-sm";
const tabelRezultat = "w-full table-fixed border-collapse text-sm tabular-nums text-stone-700";
const celulaIndicator = "border-b border-r border-stone-300 px-3 py-3 text-left";
const celulaSuma = "border-b border-stone-300 px-3 py-3 text-right whitespace-nowrap";

type RezultatAfisat = {
  rezultat: RezultatVechime;
  key: string;
};

function formatLuniInAni(luniTotale: number): string {
  if (luniTotale <= 0) return "Îndeplinit";
  const ani = Math.floor(luniTotale / 12);
  const luni = luniTotale % 12;
  if (ani === 0) return `− ${luni} ${luni === 1 ? "lună" : "luni"}`;
  if (luni === 0) return `− ${ani} ${ani === 1 ? "an" : "ani"}`;
  return `− ${ani}a ${luni}l`;
}

function astaziIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const zi = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${zi}`;
}

export default function CalculatorVechimeMunca() {
  const [perioade, setPerioade] = useState<PerioadaMunca[]>([{ deLa: "", panaLa: "" }]);
  const [eroare, setEroare] = useState(false);
  const [rezAfisat, setRezAfisat] = useState<RezultatAfisat | null>(null);

  const cheieCurenta = JSON.stringify(perioade);
  const stale = rezAfisat !== null && rezAfisat.key !== cheieCurenta;
  const r = rezAfisat?.rezultat;

  const actualizeaza = (index: number, camp: keyof PerioadaMunca, valoare: string) => {
    setPerioade((vechi) => vechi.map((p, i) => (i === index ? { ...p, [camp]: valoare } : p)));
    if (eroare) setEroare(false);
  };

  const adaugaPerioada = () => {
    setPerioade((vechi) => [...vechi, { deLa: "", panaLa: "" }]);
  };

  const stergePerioada = (index: number) => {
    setPerioade((vechi) => (vechi.length <= 1 ? vechi : vechi.filter((_, i) => i !== index)));
  };

  const calculeaza = () => {
    const rez = calculeazaVechime(perioade);
    if (!rez || rez.perioadeValide === 0) {
      setEroare(true);
      return;
    }
    setEroare(false);
    setRezAfisat({ rezultat: rez, key: cheieCurenta });
    masoaraCalcul("vechime_munca", {
      varianta: perioade.length > 1 ? "multiplu" : "o_perioada",
    });
    deruleazaLaRezultat("rezultat-vechime", "calc-vechime");
  };

  return (
    <section className="border-b border-stone-200 bg-canvas" aria-labelledby="calculator-vechime-titlu">
      <div id="calc-vechime" className={`mx-auto grid max-w-6xl items-start gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
        <form
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2"
          onSubmit={(e) => {
            e.preventDefault();
            calculeaza();
          }}
        >
          <h2 id="calculator-vechime-titlu" className={colHeader}>Perioade lucrate</h2>

          <div className="mb-5 flex flex-col gap-4">
            {perioade.map((p, i) => (
              <div key={i} className={perioade.length > 1 ? "border-b border-stone-200 pb-4 last:border-b-0 last:pb-0" : ""}>
                {perioade.length > 1 && (
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-600">Perioada {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => stergePerioada(i)}
                      className="text-xs text-stone-600 underline underline-offset-2 hover:text-stone-900"
                    >
                      Șterge
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label htmlFor={`vech-de-${i}`} className={fieldLabel}>De la</label>
                    <input
                      id={`vech-de-${i}`}
                      type="date"
                      value={p.deLa}
                      onChange={(e) => actualizeaza(i, "deLa", e.target.value)}
                      className={dateInput}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor={`vech-pana-${i}`} className="text-xs font-medium text-stone-600">Până la</label>
                      <button
                        type="button"
                        onClick={() => actualizeaza(i, "panaLa", astaziIso())}
                        className="text-xs text-stone-600 underline underline-offset-2 hover:text-stone-900"
                      >
                        azi
                      </button>
                    </div>
                    <input
                      id={`vech-pana-${i}`}
                      type="date"
                      value={p.panaLa}
                      onChange={(e) => actualizeaza(i, "panaLa", e.target.value)}
                      className={dateInput}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {eroare && (
            <p role="alert" className="mb-4 text-xs font-medium text-stone-900">
              Completează cel puțin o perioadă validă (data de început înainte de data de sfârșit).
            </p>
          )}

          <button
            type="button"
            onClick={adaugaPerioada}
            className="mb-5 flex min-h-11 w-full items-center justify-center rounded border border-dashed border-stone-300 px-4 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-700"
          >
            + Adaugă încă o perioadă
          </button>

          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px"
          >
            <IconCalculeaza />
            Calculează
          </button>
        </form>

        <div
          id="rezultat-vechime"
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
              <table aria-label="Rezultat calcul vechime în muncă" className={tabelRezultat}>
                <colgroup><col /><col className="w-36 sm:w-44" /></colgroup>
                <thead>
                  <tr className="bg-canvas">
                    <th scope="col" className={`${celulaIndicator} font-medium`}>Indicator</th>
                    <th scope="col" className={`${celulaSuma} font-medium`}>Valoare</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-stone-900 font-bold text-white">
                    <th scope="row" className="border-r border-stone-600 px-3 py-3 text-left">Vechime totală</th>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {r ? <span className="marcaj">{r.ani}a {r.luni}l {r.zile}z</span> : "—"}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={`${celulaIndicator} font-normal`}>Gradație la stat</th>
                    <td className={celulaSuma}>{r ? `Gr. ${r.gradatie.gradatie} (${r.gradatie.sporCumulat})` : "—"}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={`${celulaIndicator} font-normal`}>Stagiu minim pensie ({STAGIU_MINIM_PENSIE_ANI} ani)</th>
                    <td className={celulaSuma}>{r ? formatLuniInAni(r.luniRamaseStagiuMinimPensie) : "—"}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={`${celulaIndicator} font-normal`}>Stagiu complet pensie ({STAGIU_COMPLET_PENSIE_ANI} ani)</th>
                    <td className={celulaSuma}>{r ? formatLuniInAni(r.luniRamaseStagiuCompletPensie) : "—"}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={`${celulaIndicator} border-b-0 font-normal`}>Cotă ajutor de șomaj</th>
                    <td className={`${celulaSuma} border-b-0`}>{r ? `${r.cotaSomajProcent}%` : "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {r && (
              <details className="mt-3 text-sm text-stone-600">
                <summary className="min-h-11 cursor-pointer py-3 font-medium text-stone-900">Detalii de calcul</summary>
                <p className="mb-2">
                  Total exact: <strong className="font-medium text-stone-900">{r.ani} ani, {r.luni} luni și {r.zile} zile</strong> ({fmt(r.zileTotale)} zile calendaristice din {r.perioadeValide} {r.perioadeValide === 1 ? "perioadă" : "perioade"}).
                </p>
                {r.zileSuprapuseEliminate > 0 && (
                  <p className="mb-2">
                    Au fost eliminate {fmt(r.zileSuprapuseEliminate)} zile suprapuse între contracte simultane.
                  </p>
                )}
                <p>
                  {r.gradatie.aniUrmator
                    ? `Următoarea gradație de vechime la stat este la ${r.gradatie.aniUrmator} ani. `
                    : "Ești la gradația maximă de vechime la stat. "}
                  Extrasele oficiale se descarcă din REGES-ONLINE și cnpp.ro.
                </p>
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
