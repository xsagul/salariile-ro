"use client";

// src/app/components/CalculatorOreSuplimentare.tsx
// Ore suplimentare, muncă de noapte și sărbători legale — Codul Muncii.
//
// Toată aritmetica stă în `@/lib/ore-suplimentare`. Aici nu se calculează
// nimic: componenta colectează orele și afișează rezultatul cu articolul din
// lege pe fiecare linie.
//
// De ce luna e un selector și nu un câmp de ore: tariful orar depinde de câte
// zile lucrătoare are luna aceea. Februarie 2026 are 160 de ore, septembrie
// 176. Dacă utilizatorul ar tasta orele lunare, ar tasta 168 și ar greși în
// zece luni din douăsprezece.

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import { SelectorPastile, type OptiunePastila } from "@/app/components/SelectorPastile";
import {
  calculeazaOre,
  oreNormaleLuna,
  COTA_MINIMA_NOAPTE,
  COTA_MINIMA_SARBATOARE,
  COTA_MINIMA_SUPLIMENTARE,
  INTERVAL_NOAPTE,
  LUNI,
  PRAG_ORE_NOAPTE_ZI,
  TEMEI,
  type RezultatOre,
} from "@/lib/ore-suplimentare";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));
const fmt2 = (n: number) =>
  new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";

const AN = 2026;

function Camp({ eticheta, ajutor, valoare, onChange, sufix, min = 0, pas = 1 }: {
  eticheta: string; ajutor?: string; valoare: string; onChange: (v: string) => void;
  sufix: string; min?: number; pas?: number;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-stone-900">{eticheta}</span>
      {ajutor ? <span className="mt-0.5 block text-xs leading-relaxed text-stone-600">{ajutor}</span> : null}
      <span className="mt-2 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={pas}
          value={valoare}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 w-full rounded border border-stone-300 px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300"
        />
        <span className="shrink-0 text-sm text-stone-600">{sufix}</span>
      </span>
    </label>
  );
}

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

export default function CalculatorOreSuplimentare() {
  const [baza, setBaza] = useState("5000");
  const [luna0, setLuna0] = useState(new Date().getMonth());
  const [oreSup, setOreSup] = useState("8");
  const [oreNoapte, setOreNoapte] = useState("0");
  const [oreSarb, setOreSarb] = useState("0");
  const [cotaSup, setCotaSup] = useState("75");
  const [cotaNoapte, setCotaNoapte] = useState("25");
  const [cotaSarb, setCotaSarb] = useState("100");
  const [rez, setRez] = useState<RezultatOre | null>(null);

  const optiuniLuni: OptiunePastila<number>[] = LUNI.map((nume, i) => ({
    valoare: i,
    eticheta: nume.charAt(0).toLocaleUpperCase("ro-RO") + nume.slice(1),
    detaliu: `${oreNormaleLuna(AN, i)} ore de program normal în ${nume} ${AN}.`,
  }));

  function calculeaza() {
    setRez(
      calculeazaOre({
        salariuDeBaza: Number(baza),
        an: AN,
        luna0,
        oreSuplimentare: Number(oreSup) || 0,
        cotaSuplimentare: (Number(cotaSup) || 75) / 100,
        oreNoapte: Number(oreNoapte) || 0,
        cotaNoapte: (Number(cotaNoapte) || 25) / 100,
        oreSarbatoare: Number(oreSarb) || 0,
        cotaSarbatoare: (Number(cotaSarb) || 100) / 100,
      }),
    );
  }

  const r = rez;
  const castig = r && r.netFaraSporuri !== null ? r.fiscal.netBani - r.netFaraSporuri : null;
  const reset = () => setRez(null);

  return (
    <div id="calc-ore" className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-5">
      {/* ─── Intrări ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Orele tale</h2>

        <div className="flex flex-col gap-5">
          <Camp
            eticheta="Salariul de bază brut"
            ajutor="Din contract, înainte de sporuri."
            valoare={baza}
            onChange={(v) => { setBaza(v); reset(); }}
            sufix="lei"
            pas={50}
          />

          <SelectorPastile
            eticheta="Luna"
            ajutor="Tariful orar depinde de zilele lucrătoare ale lunii."
            optiuni={optiuniLuni}
            valoare={luna0}
            onChange={(v) => { setLuna0(v); reset(); }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Camp
              eticheta="Ore suplimentare"
              ajutor="Doar cele neplătite cu timp liber."
              valoare={oreSup}
              onChange={(v) => { setOreSup(v); reset(); }}
              sufix="ore"
              pas={0.5}
            />
            <Camp
              eticheta="Spor"
              ajutor={`Minimul legal: ${COTA_MINIMA_SUPLIMENTARE * 100}%.`}
              valoare={cotaSup}
              onChange={(v) => { setCotaSup(v); reset(); }}
              sufix="%"
              pas={5}
            />
            <Camp
              eticheta="Ore de noapte"
              ajutor={`Prestate între ${INTERVAL_NOAPTE}.`}
              valoare={oreNoapte}
              onChange={(v) => { setOreNoapte(v); reset(); }}
              sufix="ore"
              pas={0.5}
            />
            <Camp
              eticheta="Spor"
              ajutor={`Minimul legal: ${COTA_MINIMA_NOAPTE * 100}%.`}
              valoare={cotaNoapte}
              onChange={(v) => { setCotaNoapte(v); reset(); }}
              sufix="%"
              pas={5}
            />
            <Camp
              eticheta="Ore în sărbători legale"
              ajutor="Necompensate cu timp liber."
              valoare={oreSarb}
              onChange={(v) => { setOreSarb(v); reset(); }}
              sufix="ore"
              pas={0.5}
            />
            <Camp
              eticheta="Spor"
              ajutor={`Minimul legal: ${COTA_MINIMA_SARBATOARE * 100}%.`}
              valoare={cotaSarb}
              onChange={(v) => { setCotaSarb(v); reset(); }}
              sufix="%"
              pas={25}
            />
          </div>

          <button
            type="button"
            onClick={calculeaza}
            className="min-h-11 w-full rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
          >
            Calculează
          </button>
        </div>
      </div>

      {/* ─── Rezultat ────────────────────────────────────────────────── */}
      <div id="rezultat-ore" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
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
                label={r ? `Program normal în ${LUNI[luna0]} (${r.zileLucratoare} zile lucrătoare)` : "Program normal în lună"}
                value={r ? `${r.oreNormale} ore` : null}
                temei={TEMEI.norma}
              />
              <Row
                label="Tarif orar"
                value={r ? `${fmt2(r.tarifOrar)} lei/oră` : null}
                sub
                temei="salariul de bază împărțit la orele lunii"
              />
              <Row label="Salariu de bază brut" value={r ? `${fmt(Number(baza))} lei` : null} bold />

              {(r?.linii ?? []).map((l) => (
                <Row
                  key={l.eticheta}
                  label={`${l.eticheta} — ${l.ore} ore × ${Math.round(l.cota * 100)}%`}
                  value={`${fmt(l.suma)} lei`}
                  sub
                  temei={`${l.temei}. ${l.detaliu ?? ""}`}
                />
              ))}

              <Row label="Brut total" value={r ? `${fmt(r.brutTotal)} lei` : null} bold />
              <Row label="CAS 25%" value={r ? `− ${fmt(r.fiscal.cas)} lei` : null} sub />
              <Row label="CASS 10%" value={r ? `− ${fmt(r.fiscal.cass)} lei` : null} sub />
              <Row label="Impozit 10%" value={r ? `− ${fmt(r.fiscal.impozit)} lei` : null} sub />
              <Row label="Salariu net" value={r ? `${fmt(r.fiscal.netBani)} lei` : null} bold />
              <Row
                label="Din care, net din ore în plus"
                value={castig === null ? null : `${fmt(castig)} lei`}
                sub
                ultim
                temei="diferența față de netul salariului de bază singur"
              />
            </tbody>
          </table>
        </div>

        {r?.avertismentNoapte ? (
          <p className="mt-4 rounded border border-stone-300 bg-canvas p-3 text-sm leading-relaxed text-stone-700">
            <strong className="text-stone-900">Atenție la pragul de {PRAG_ORE_NOAPTE_ZI} ore.</strong>{" "}
            Sporul de noapte se cuvine salariatului care lucrează cel puțin {PRAG_ORE_NOAPTE_ZI} ore
            de noapte din ziua de lucru, sau cel puțin 30% din timpul lunar ({TEMEI.noapteDefinitie}).
            Sub prag, sporul poate veni doar din contractul colectiv, nu din lege.
          </p>
        ) : null}

        {!r ? (
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            Completează orele și apasă <strong className="text-stone-900">Calculează</strong>.
          </p>
        ) : null}

        <div className="mt-5 border-t border-stone-200 pt-4 text-xs leading-relaxed text-stone-600">
          <p>
            <strong className="text-stone-800">Sporul nu e prima opțiune a legii.</strong> Munca
            suplimentară se compensează întâi cu ore libere plătite ({TEMEI.compensare}); sporul se
            plătește abia dacă asta nu e posibilă. Cotele de mai sus sunt minimele legale — contractul
            colectiv sau cel individual pot da mai mult, niciodată mai puțin.
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
