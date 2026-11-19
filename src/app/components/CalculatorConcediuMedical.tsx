"use client";

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import IconCalculeaza from "@/app/components/IconCalculeaza";
import { SPATIU_JOS } from "@/app/components/ui";
import {
  CASTIG_MEDIU_BASS,
  CODURI_CONCEDIU_MEDICAL,
  TEMEI_MEDICAL,
  calculeazaConcediuMedical,
  infoCodMedical,
  type CodConcediuMedical,
  type RezultatConcediuMedical,
} from "@/lib/concediu-medical";
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

export default function CalculatorConcediuMedical() {
  const [venit, setVenit] = useState("6000");
  const [cod, setCod] = useState<CodConcediuMedical>("01");
  const [zileCal, setZileCal] = useState("7");
  const [zileLucr, setZileLucr] = useState("5");
  const [zileLuna, setZileLuna] = useState("21");
  const [scutitPrimaZi, setScutitPrimaZi] = useState(false);
  const [rez, setRez] = useState<RezultatConcediuMedical | null>(null);

  const info = infoCodMedical(cod);
  const reset = () => setRez(null);

  const calculeaza = () => {
    const r = calculeazaConcediuMedical({
      venitBrutMediu6Luni: Number(venit) || 0,
      cod,
      zileCalendaristiceEpisod: Number(zileCal) || 1,
      zileLucratoareConcediu: Number(zileLucr) || 1,
      zileLucratoareLuna: Number(zileLuna) || 21,
      faraPrimaZiNeplatita: info.exceptatPrimaZi || scutitPrimaZi,
    });
    setRez(r);
    masoaraCalcul("concediu_medical", { varianta: `cod_${cod}` });
    deruleazaLaRezultat("rezultat-medical", "calc-medical");
  };

  const r = rez;

  return (
    <div id="calc-medical" className={`mx-auto grid max-w-6xl gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
      {/* ─── Intrări ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Datele concediului</h2>

        <div className="flex flex-col gap-5">
          <label className="block">
            <span className="block text-sm font-medium text-stone-900">
              Salariu brut lunar mediu (ultimele 6 luni)
            </span>
            <span className="mt-0.5 block text-xs text-stone-600">
              Media brutului tău din ultimele 6 luni, plafonată la 12 salarii minime.
            </span>
            <span className="mt-2 flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={1}
                step={100}
                value={venit}
                onChange={(e) => { setVenit(e.target.value); reset(); }}
                className="min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
              />
              <span className="shrink-0 text-sm text-stone-600">lei</span>
            </span>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-stone-900">Tipul concediului medical</span>
            <select
              value={cod}
              onChange={(e) => { setCod(e.target.value as CodConcediuMedical); reset(); }}
              className="mt-2 min-h-11 w-full rounded border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
            >
              {CODURI_CONCEDIU_MEDICAL.map((item) => (
                <option key={item.cod} value={item.cod}>
                  {item.nume}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-stone-600">{info.detaliu}</span>
          </label>

          {cod === "01" && (
            <label className="block">
              <span className="block text-sm font-medium text-stone-900">
                Durata totală a episodului (zile calendaristice)
              </span>
              <span className="mt-0.5 block text-xs text-stone-600">
                Decide procentul: 55% (1–7 zile), 65% (8–14 zile), 75% (15+ zile).
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={183}
                value={zileCal}
                onChange={(e) => { setZileCal(e.target.value); reset(); }}
                className="mt-2 min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
              />
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium text-stone-900">Zile lucrătoare concediu</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={23}
                value={zileLucr}
                onChange={(e) => { setZileLucr(e.target.value); reset(); }}
                className="mt-2 min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-stone-900">Zile lucrătoare în lună</span>
              <input
                type="number"
                inputMode="numeric"
                min={18}
                max={23}
                value={zileLuna}
                onChange={(e) => { setZileLuna(e.target.value); reset(); }}
                className="mt-2 min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
              />
            </label>
          </div>

          {!info.exceptatPrimaZi && (
            <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm text-stone-900">
              <input
                type="checkbox"
                checked={scutitPrimaZi}
                onChange={(e) => { setScutitPrimaZi(e.target.checked); reset(); }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-400 text-stone-900 focus:ring-stone-300"
              />
              <span>
                Fără prima zi neplătită
                <span className="mt-0.5 block text-xs text-stone-600">
                  Bifează pentru internare în spital, program național de sănătate sau certificat în continuare.
                </span>
              </span>
            </label>
          )}

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
      <div id="rezultat-medical" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
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
                label="Procent aplicat"
                value={r ? `${Math.round(r.procent * 100)}%` : null}
                temei={r?.cod === "01" ? TEMEI_MEDICAL.lege141 : TEMEI_MEDICAL.oug158}
              />
              <Row
                label="Zile lucrătoare plătite"
                value={r ? `${r.zilePlatite} din ${r.zileLucratoareConcediu}` : null}
                temei={r?.zileNeplatite ? `Prima zi lucrătoare nu se plătește (${TEMEI_MEDICAL.lege64}).` : "Toate zilele lucrătoare sunt plătite."}
              />
              <Row
                label="Bază zilnică de calcul"
                value={r ? `${r.bazaZilnica.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei/zi` : null}
                sub
              />
              <Row
                label="Indemnizație brută totală"
                value={r ? `${fmt(r.indemnizatieBruta)} lei` : null}
                bold
              />
              <Row
                label={r ? `Suportată de angajator (${r.zileAngajator} zile)` : "Suportată de angajator"}
                value={r ? `${fmt(r.brutAngajator)} lei` : null}
                sub
              />
              <Row
                label={r ? `Suportată din FNUASS (${r.zileFnuass} zile)` : "Suportată din FNUASS"}
                value={r ? `${fmt(r.brutFnuass)} lei` : null}
                sub
              />
              <Row
                label="CAS 25% (pe baza plafonată)"
                value={r ? `− ${fmt(r.cas)} lei` : null}
                sub
                temei={`25% din 35% × ${fmt(CASTIG_MEDIU_BASS)} lei BASS, proporțional (${TEMEI_MEDICAL.cas})`}
              />
              <Row
                label="CASS 10%"
                value={r ? (r.cass > 0 ? `− ${fmt(r.cass)} lei` : "0 lei (scutit)") : null}
                sub
                temei={TEMEI_MEDICAL.cass}
              />
              <Row
                label="Impozit pe venit 10%"
                value={r ? (r.impozit > 0 ? `− ${fmt(r.impozit)} lei` : "0 lei (scutit)") : null}
                sub
                temei={TEMEI_MEDICAL.impozit}
              />
              <Row
                label="Indemnizație netă estimată"
                value={r ? `${fmt(r.indemnizatieNeta)} lei` : null}
                bold
                ultim
              />
            </tbody>
          </table>
        </div>

        {r ? (
          <p className="mt-4 rounded border border-stone-300 bg-canvas p-3 text-sm text-stone-700">
            {r.plafonAplicat ? (
              <>
                <strong className="text-stone-900">Baza de calcul a fost plafonată</strong> la 12 salarii minime brute ({fmt(r.venitPlafonat)} lei/lună).{" "}
              </>
            ) : null}
            Pentru zilele lucrate efectiv din aceeași lună primești salariul obișnuit, iar pe fluturaș indemnizația medicală și salariul apar pe rânduri separate.
          </p>
        ) : (
          <p className="mt-4 text-sm text-stone-600">
            Introdu salariul brut mediu din ultimele 6 luni, alege codul concediului și apasă{" "}
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
