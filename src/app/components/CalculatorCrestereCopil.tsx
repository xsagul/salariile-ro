"use client";

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import IconCalculeaza from "@/app/components/IconCalculeaza";
import { SelectorPastile, type OptiunePastila } from "@/app/components/SelectorPastile";
import { SPATIU_JOS } from "@/app/components/ui";
import {
  MAXIM_ICC_BRUT,
  MINIM_ICC_BRUT,
  STIMULENT_DUPA_6_LUNI,
  STIMULENT_SUB_6_LUNI,
  TEMEI_ICC,
  calculeazaCrestereCopil,
  type RezultatCrestereCopil,
} from "@/lib/crestere-copil";
import { deruleazaLaRezultat } from "@/lib/deruleaza-la-rezultat";
import { masoaraCalcul } from "@/lib/analytics";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));
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

const OPTIUNI_COPII: OptiunePastila<number>[] = [
  { valoare: 1, eticheta: "1 copil", detaliu: "Indemnizație standard: 85% din media netă." },
  { valoare: 2, eticheta: "Gemeni", detaliu: "+50% din indemnizația cuvenită (minim 1.651 lei brut) pentru al doilea copil." },
  { valoare: 3, eticheta: "Tripleți", detaliu: "+50% pentru fiecare copil începând cu al doilea." },
];

export default function CalculatorCrestereCopil() {
  const [mediaNeta, setMediaNeta] = useState("5500");
  const [numarCopii, setNumarCopii] = useState(1);
  const [handicap, setHandicap] = useState(false);
  const [rez, setRez] = useState<RezultatCrestereCopil | null>(null);

  const reset = () => setRez(null);

  const calculeaza = () => {
    setRez(
      calculeazaCrestereCopil({
        mediaNeta12Luni: Number(mediaNeta) || 0,
        numarCopii,
        copilCuHandicap: handicap,
      }),
    );
    masoaraCalcul("crestere_copil", {
      varianta: numarCopii > 1 ? `multiplu_${numarCopii}` : "simplu",
    });
    deruleazaLaRezultat("rezultat-icc", "calc-icc");
  };

  const r = rez;

  return (
    <div id="calc-icc" className={`mx-auto grid max-w-6xl gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
      {/* ─── Intrări ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Datele tale</h2>

        <div className="flex flex-col gap-5">
          <label className="block">
            <span className="block text-sm font-medium text-stone-900">
              Venit net lunar mediu (ultimele 12 luni)
            </span>
            <span className="mt-0.5 block text-xs text-stone-600">
              Media veniturilor nete din 12 luni lucrate în ultimii 2 ani înainte de naștere.
            </span>
            <span className="mt-2 flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={100}
                value={mediaNeta}
                onChange={(e) => { setMediaNeta(e.target.value); reset(); }}
                className="min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
              />
              <span className="shrink-0 text-sm text-stone-600">lei</span>
            </span>
          </label>

          <SelectorPastile
            eticheta="Copii din aceeași naștere"
            optiuni={OPTIUNI_COPII}
            valoare={numarCopii}
            onChange={(v) => { setNumarCopii(v); reset(); }}
          />

          <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm text-stone-900">
            <input
              type="checkbox"
              checked={handicap}
              onChange={(e) => { setHandicap(e.target.checked); reset(); }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-400 text-stone-900 focus:ring-stone-300"
            />
            <span>
              Copil încadrat în grad de handicap
              <span className="mt-0.5 block text-xs text-stone-600">
                Concediul și indemnizația se acordă până la vârsta de 3 ani (în loc de 2 ani).
              </span>
            </span>
          </label>

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
      <div id="rezultat-icc" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
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
                label="85% din media veniturilor nete"
                value={r ? `${fmt(r.brutNecorectat)} lei` : null}
                temei={TEMEI_ICC.baza}
              />
              <Row
                label="Indemnizație brută de bază (cu praguri)"
                value={r ? `${fmt(r.brutBaza)} lei` : null}
                temei={
                  r?.plafonatMaxim
                    ? `Plafonată la maximul legal de ${fmt(MAXIM_ICC_BRUT)} lei brut.`
                    : r?.plafonatMinim
                      ? `Ridicată la minimul legal de ${fmt(MINIM_ICC_BRUT)} lei brut.`
                      : `Între minimul de ${fmt(MINIM_ICC_BRUT)} lei și maximul de ${fmt(MAXIM_ICC_BRUT)} lei.`
                }
              />
              {r && r.numarCopii > 1 ? (
                <Row
                  label={`Majorare sarcină multiplă (${r.numarCopii} copii)`}
                  value={`+ ${fmt(r.suplimentMultipluBrut)} lei`}
                  sub
                  temei={TEMEI_ICC.multiplu}
                />
              ) : null}
              <Row
                label="Indemnizația brută pe lună"
                value={r ? `${fmt(r.brutTotal)} lei` : null}
                bold
              />
              <Row
                label="CASS 10%, reținut"
                value={r ? `− ${fmt(r.cass)} lei` : null}
                sub
                temei={TEMEI_ICC.cass}
              />
              <Row
                label="Impozit pe venit și CAS"
                value={r ? "0 lei (scutit)" : null}
                sub
                temei={TEMEI_ICC.impozit}
              />
              <Row
                label="Primești în mână, lunar"
                value={r ? `${fmt(r.netLunar)} lei` : null}
                bold
              />
              <Row
                label="Durată concediu / lunile celuilalt părinte"
                value={r ? `${r.durataAni} ani (min. ${r.luniCelalaltParinte} luni)` : null}
                sub
                ultim
                temei={TEMEI_ICC.celalaltParinte}
              />
            </tbody>
          </table>
        </div>

        {r ? (
          <p className="mt-4 rounded border border-stone-300 bg-canvas p-3 text-sm text-stone-700">
            <strong className="text-stone-900">Dacă revii mai devreme la muncă:</strong> poți primi{" "}
            <strong className="text-stone-900">{fmt(STIMULENT_SUB_6_LUNI)} lei/lună</strong> stimulent de inserție dacă te întorci înainte de 6 luni ale copilului, sau{" "}
            <strong className="text-stone-900">{fmt(STIMULENT_DUPA_6_LUNI)} lei/lună</strong> dacă revii după 6 luni.
          </p>
        ) : (
          <p className="mt-4 text-sm text-stone-600">
            Introdu media veniturilor nete lunare din ultimele 12 luni și apasă{" "}
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
  );
}
