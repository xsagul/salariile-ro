"use client";

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import IconCalculeaza from "@/app/components/IconCalculeaza";
import { SelectorPastile, type OptiunePastila } from "@/app/components/SelectorPastile";
import { SPATIU_JOS } from "@/app/components/ui";
import {
  TEMEI_CONCEDIU_ODIHNA,
  calculeazaIndemnizatieCO,
  calculeazaZileProportionale,
  type RezultatIndemnizatieCO,
  type RezultatZileProportionale,
} from "@/lib/concediu-odihna";
import { deruleazaLaRezultat } from "@/lib/deruleaza-la-rezultat";
import { masoaraCalcul } from "@/lib/analytics";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";

type ModCalcul = "indemnizatie" | "zile";

const MODURI: OptiunePastila<ModCalcul>[] = [
  { valoare: "indemnizatie", eticheta: "Indemnizație concediu", detaliu: "Cât primești în luna în care îți iei concediu de odihnă." },
  { valoare: "zile", eticheta: "Zile proporționale și lichidare", detaliu: "Câte zile ți se cuvin și compensarea în bani la plecare." },
];

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

export default function CalculatorConcediuOdihna() {
  const [mod, setMod] = useState<ModCalcul>("indemnizatie");

  // Mod 1: Indemnizație
  const [brut, setBrut] = useState("6500");
  const [media3, setMedia3] = useState("6500");
  const [zileLuna, setZileLuna] = useState("21");
  const [zileCO, setZileCO] = useState("10");
  const [rezInd, setRezInd] = useState<RezultatIndemnizatieCO | null>(null);

  // Mod 2: Zile proporționale & lichidare
  const [zileAn, setZileAn] = useState("21");
  const [luniLucrate, setLuniLucrate] = useState("7");
  const [zileEfectuate, setZileEfectuate] = useState("5");
  const [brutLichidare, setBrutLichidare] = useState("6500");
  const [rezZile, setRezZile] = useState<RezultatZileProportionale | null>(null);

  const reset = () => {
    setRezInd(null);
    setRezZile(null);
  };

  const calculeaza = () => {
    if (mod === "indemnizatie") {
      setRezInd(
        calculeazaIndemnizatieCO({
          salariuBrutContract: Number(brut) || 0,
          mediaBruta3Luni: Number(media3) || 0,
          zileLucratoareLuna: Number(zileLuna) || 21,
          zileConcediu: Number(zileCO) || 1,
        }),
      );
    } else {
      setRezZile(
        calculeazaZileProportionale({
          zilePeAn: Number(zileAn) || 20,
          luniLucrate: Number(luniLucrate) || 1,
          zileEfectuate: Number(zileEfectuate) || 0,
          salariuBrut: Number(brutLichidare) || 0,
        }),
      );
    }
    masoaraCalcul("concediu_odihna", { varianta: mod });
    deruleazaLaRezultat("rezultat-co", "calc-co");
  };

  const areRezultat = mod === "indemnizatie" ? rezInd !== null : rezZile !== null;

  return (
    <div id="calc-co" className={`mx-auto grid max-w-6xl gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
      {/* ─── Intrări ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Ce vrei să calculezi</h2>

        <div className="flex flex-col gap-5">
          <SelectorPastile
            eticheta="Tip calcul"
            optiuni={MODURI}
            valoare={mod}
            onChange={(v) => { setMod(v); reset(); }}
          />

          {mod === "indemnizatie" ? (
            <>
              <label className="block">
                <span className="block text-sm font-medium text-stone-900">Salariu brut din contract</span>
                <span className="mt-0.5 block text-xs text-stone-600">Salariul de bază plus sporurile permanente.</span>
                <span className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step={100}
                    value={brut}
                    onChange={(e) => { setBrut(e.target.value); reset(); }}
                    className="min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
                  />
                  <span className="shrink-0 text-sm text-stone-600">lei</span>
                </span>
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-stone-900">Media brută din ultimele 3 luni</span>
                <span className="mt-0.5 block text-xs text-stone-600">
                  Dacă ai primit bonusuri sau ore suplimentare, media mai mare crește indemnizația.
                </span>
                <span className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={100}
                    value={media3}
                    onChange={(e) => { setMedia3(e.target.value); reset(); }}
                    className="min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
                  />
                  <span className="shrink-0 text-sm text-stone-600">lei</span>
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-sm font-medium text-stone-900">Zile de concediu</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={23}
                    value={zileCO}
                    onChange={(e) => { setZileCO(e.target.value); reset(); }}
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
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-sm font-medium text-stone-900">Zile concediu/an</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={20}
                    max={60}
                    value={zileAn}
                    onChange={(e) => { setZileAn(e.target.value); reset(); }}
                    className="mt-2 min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-stone-900">Luni lucrate în an</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={12}
                    step={0.5}
                    value={luniLucrate}
                    onChange={(e) => { setLuniLucrate(e.target.value); reset(); }}
                    className="mt-2 min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-sm font-medium text-stone-900">Zile de concediu deja efectuate</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={60}
                  value={zileEfectuate}
                  onChange={(e) => { setZileEfectuate(e.target.value); reset(); }}
                  className="mt-2 min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-stone-900">Salariu brut lunar</span>
                <span className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step={100}
                    value={brutLichidare}
                    onChange={(e) => { setBrutLichidare(e.target.value); reset(); }}
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
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
          >
            <IconCalculeaza />
            Calculează
          </button>
        </div>
      </div>

      {/* ─── Rezultat ────────────────────────────────────────────────── */}
      <div id="rezultat-co" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
        <h2 className={colHeader}>Rezultatul</h2>

        {mod === "indemnizatie" ? (
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
                  label="Tarif zilnic brut pentru concediu"
                  value={rezInd ? `${rezInd.tarifZilnicAplicat.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei/zi` : null}
                  temei={rezInd?.castigaMedia3Luni ? "Se aplică media ultimelor 3 luni (mai mare decât baza)." : TEMEI_CONCEDIU_ODIHNA.indemnizatie}
                />
                <Row
                  label={rezInd ? `Indemnizație brută concediu (${rezInd.zileConcediu} zile)` : "Indemnizație brută concediu"}
                  value={rezInd ? `${fmt(rezInd.brutConcediu)} lei` : null}
                  bold
                />
                <Row
                  label={rezInd ? `Salariu brut zile lucrate (${rezInd.zileLucrate} zile)` : "Salariu brut zile lucrate"}
                  value={rezInd ? `${fmt(rezInd.brutZileLucrate)} lei` : null}
                  sub
                />
                <Row
                  label="Total brut pe lună"
                  value={rezInd ? `${fmt(rezInd.totalBrutLuna)} lei` : null}
                  sub
                />
                <Row
                  label="Indemnizație netă estimată (partea de concediu)"
                  value={rezInd ? `${fmt(rezInd.netConcediuEstimat)} lei` : null}
                  bold
                />
                <Row
                  label="Total net încasat în luna cu concediu"
                  value={rezInd ? `${fmt(rezInd.netLunaTotal)} lei` : null}
                  bold
                  ultim
                  temei={
                    rezInd
                      ? rezInd.diferentaNetFataDeNormal > 0
                        ? `+${fmt(rezInd.diferentaNetFataDeNormal)} lei față de o lună fără bonusuri.`
                        : "Identic cu o lună obișnuită (fără tichete de masă pe zilele de concediu)."
                      : undefined
                  }
                />
              </tbody>
            </table>
          </div>
        ) : (
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
                  label="Zile cuvenite proporțional"
                  value={rezZile ? `${rezZile.zileCuveniteRotunjite} zile` : null}
                  temei={
                    rezZile
                      ? `Calcul exact: ${rezZile.zileCuveniteExact.toLocaleString("ro-RO", { maximumFractionDigits: 2 })} zile (${TEMEI_CONCEDIU_ODIHNA.proportional}).`
                      : TEMEI_CONCEDIU_ODIHNA.proportional
                  }
                />
                <Row
                  label="Zile neefectuate rămase"
                  value={rezZile ? `${rezZile.zileRamase} zile` : null}
                  bold
                />
                <Row
                  label="Compensare brută la încetarea contractului"
                  value={rezZile ? `${fmt(rezZile.brutCompensare)} lei` : null}
                  sub
                  temei={TEMEI_CONCEDIU_ODIHNA.compensare}
                />
                <Row
                  label="Compensare netă estimată"
                  value={rezZile ? `${fmt(rezZile.netCompensareEstimat)} lei` : null}
                  bold
                  ultim
                />
              </tbody>
            </table>
          </div>
        )}

        {areRezultat ? (
          <p className="mt-4 rounded border border-stone-300 bg-canvas p-3 text-sm text-stone-700">
            Pe zilele de concediu de odihnă nu se acordă tichete de masă. Compensarea în bani a zilelor neefectuate este permisă legal doar la încetarea contractului individual de muncă.
          </p>
        ) : (
          <p className="mt-4 text-sm text-stone-600">
            Completează datele din stânga și apasă <strong className="text-stone-900">Calculează</strong>.
          </p>
        )}

        {areRezultat ? (
          <div className="mt-4">
            <FeedbackContextual context="calcul" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
