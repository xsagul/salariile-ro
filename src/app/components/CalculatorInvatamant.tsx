"use client";

// src/app/components/CalculatorInvatamant.tsx
// Calculator salariu învățământ preuniversitar — Legea 153/2017, Anexa I, cap. I.
// Tipar identic cu CalculatorSalariu și CalculatorPFA: calcul o dată la
// „Calculează"/Enter, formular col-span-2 + rezultat col-span-3, tabel cu
// header, rând negru, bară.
//
// Toată aritmetica stă în `@/lib/invatamant`. Aici nu se calculează nimic —
// componenta doar colectează opțiunile și afișează rezultatul cu temeiul legal
// pe fiecare linie, conform promisiunii din BRAND.md: de la cifră se ajunge
// întotdeauna la formulă, la actul normativ și la data de la care se aplică.

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import { trackUmami } from "@/lib/umami";
import {
  calculeazaInvatamantComplet,
  functiiDisponibile,
  vechimiPentruFunctie,
  GRADATII,
  MAJORARI,
  INDEMNIZATIE_DOCTORAT_2026,
  SURSA_GRILA,
  type RezultatComplet,
} from "@/lib/invatamant";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));

const fieldLabel = "mb-2 block text-xs font-medium text-stone-500";
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const cellL = "border-b border-r border-stone-300 px-3 py-3 text-left";
const cellR = "border-b border-stone-300 px-3 py-3 text-right tabular-nums whitespace-nowrap";
// min-h-11 = 44 px, ținta minimă de atingere din BRAND.md §7. Fără ea,
// `py-2.5` dă 42 px pe mobil — sub prag cu 2 px, măsurat în browser.
const selectClass =
  "min-h-11 w-full rounded border border-stone-300 bg-surface px-3 py-2.5 text-base text-stone-900 " +
  "focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200";

const FUNCTII = functiiDisponibile();

function Row({ label, value, sub, neg, bold, temei }: {
  label: string; value: string; sub?: boolean; neg?: boolean; bold?: boolean; temei?: string;
}) {
  return (
    <tr>
      <td className={`${cellL} ${sub ? "pl-4 sm:pl-8" : ""} ${bold ? "font-bold text-stone-900" : ""}`}>
        {label}
        {temei ? <span className="mt-0.5 block text-xs text-stone-600">{temei}</span> : null}
      </td>
      <td className={`${cellR} ${bold ? "font-bold text-stone-900" : ""}`}>
        {neg ? "− " : ""}{value} lei
      </td>
    </tr>
  );
}

function Toggle({ label, hint, checked, onChange }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm text-stone-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-400 text-stone-900 focus:ring-stone-300"
      />
      <span>
        {label}
        {hint ? <span className="mt-0.5 block text-xs text-stone-600">{hint}</span> : null}
      </span>
    </label>
  );
}

export default function CalculatorInvatamant() {
  const [functie, setFunctie] = useState(1);
  const [vechimeInv, setVechimeInv] = useState(vechimiPentruFunctie(1)[0]);
  const [aniMunca, setAniMunca] = useState(20);
  const [majorari, setMajorari] = useState<string[]>([]);
  const [doctorat, setDoctorat] = useState(false);
  const [rez, setRez] = useState<RezultatComplet | null>(null);

  const vechimi = vechimiPentruFunctie(functie);

  function schimbaFunctie(nr: number) {
    setFunctie(nr);
    const noi = vechimiPentruFunctie(nr);
    if (!noi.includes(vechimeInv)) setVechimeInv(noi[0]);
    setRez(null);
  }

  function comuta(cod: string, on: boolean) {
    setMajorari((prev) => (on ? [...prev, cod] : prev.filter((c) => c !== cod)));
    setRez(null);
  }

  function calculeaza() {
    const r = calculeazaInvatamantComplet({
      functie,
      vechimeInvatamant: vechimeInv,
      aniMunca,
      majorari,
      doctorat,
    });
    setRez(r);
    if (r) trackUmami({ name: "calcul-invatamant", data: { gradatie: String(r.gradatie) as "0" | "1" | "2" | "3" | "4" | "5" } });
  }

  const gradatie = GRADATII[Math.min(5, aniMunca < 3 ? 0 : aniMunca < 5 ? 1 : aniMunca < 10 ? 2 : aniMunca < 15 ? 3 : aniMunca < 20 ? 4 : 5)];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-5">
      {/* ─── Formular ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Încadrarea ta</h2>

        <div className="mb-4">
          <label htmlFor="inv-functie" className={fieldLabel}>Funcția didactică și gradul</label>
          <select
            id="inv-functie"
            className={selectClass}
            value={functie}
            onChange={(e) => schimbaFunctie(Number(e.target.value))}
          >
            {FUNCTII.map((f) => (
              <option key={f.nr} value={f.nr}>{f.functie}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="inv-vechime-inv" className={fieldLabel}>
            Vechimea în învățământ
            <span className="mt-0.5 block font-normal normal-case text-stone-600">
              Alege rândul din grilă. E diferită de vechimea în muncă.
            </span>
          </label>
          <select
            id="inv-vechime-inv"
            className={selectClass}
            value={vechimeInv}
            onChange={(e) => { setVechimeInv(e.target.value); setRez(null); }}
          >
            {vechimi.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="inv-ani-munca" className={fieldLabel}>
            Vechimea în muncă (ani)
            <span className="mt-0.5 block font-normal normal-case text-stone-600">
              Dă gradația. Acum: <strong className="text-stone-900">gradația {gradatie.nivel}</strong> ({gradatie.eticheta}).
            </span>
          </label>
          <input
            id="inv-ani-munca"
            type="number"
            min={0}
            max={50}
            value={aniMunca}
            onChange={(e) => { setAniMunca(Number(e.target.value)); setRez(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") calculeaza(); }}
            className={selectClass}
          />
        </div>

        <fieldset className="mb-5 border-t border-stone-200 pt-4">
          <legend className={fieldLabel}>Majorări</legend>
          {MAJORARI.map((m) => (
            <Toggle
              key={m.cod}
              label={m.eticheta}
              hint={`+${(m.cota * 100).toLocaleString("ro-RO")}% · ${m.temei}`}
              checked={majorari.includes(m.cod)}
              onChange={(v) => comuta(m.cod, v)}
            />
          ))}
          <Toggle
            label="Titlu științific de doctor"
            hint={`${INDEMNIZATIE_DOCTORAT_2026} lei brut · OUG 7/2026`}
            checked={doctorat}
            onChange={(v) => { setDoctorat(v); setRez(null); }}
          />
        </fieldset>

        <button
          type="button"
          onClick={calculeaza}
          className="min-h-11 w-full rounded bg-stone-900 px-4 py-3 font-medium text-white transition-colors hover:bg-stone-700"
        >
          Calculează
        </button>
      </div>

      {/* ─── Rezultat ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
        <h2 className={colHeader}>Rezultatul</h2>

        {!rez ? (
          <p className="text-sm text-stone-600">
            Alege încadrarea și apasă <strong className="text-stone-900">Calculează</strong>.
            Fiecare linie din rezultat își arată temeiul din lege.
          </p>
        ) : (
          <>
            <table className="w-full border-collapse text-sm">
              <tbody>
                <Row
                  label="Salariu de bază din grilă (gradația 0)"
                  value={fmt(rez.salariuGrila)}
                  temei={`Anexa I, cap. I, pct. 5 · coloana iunie 2024 · ${rez.rand.studii}, ${rez.rand.vechime}`}
                />
                <Row
                  label={`Gradația ${rez.gradatie} de vechime în muncă`}
                  value={fmt(rez.salariuDeBaza - rez.salariuGrila)}
                  sub
                  temei="art. 10 alin. (4) · cotele se compun, nu se adună"
                />
                <Row label="Salariul de bază deținut" value={fmt(rez.salariuDeBaza)} bold />

                {rez.linii.map((l) => (
                  <Row key={l.eticheta} label={l.eticheta} value={fmt(l.suma)} sub temei={l.temei} />
                ))}

                <Row label="Total brut" value={fmt(rez.brutTotal)} bold />
                <Row label="CAS (pensie) 25%" value={fmt(rez.fiscal.cas)} sub neg />
                <Row label="CASS (sănătate) 10%" value={fmt(rez.fiscal.cass)} sub neg />
                <Row label="Impozit pe venit 10%" value={fmt(rez.fiscal.impozit)} sub neg />
              </tbody>
            </table>

            <div className="mt-4 rounded bg-stone-900 px-4 py-4 text-white">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm">Salariu net, în cont</span>
                <span className="text-2xl font-bold tabular-nums">{fmt(rez.fiscal.netBani)} lei</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-stone-600">
              Cost total angajator: {fmt(rez.fiscal.costTotal)} lei (brut + CAM 2,25%).
            </p>

            <div className="mt-5 border-t border-stone-200 pt-4 text-xs text-stone-600">
              <p className="mb-2">
                <strong className="text-stone-900">De unde vine cifra.</strong>{" "}
                {SURSA_GRILA.act}, {SURSA_GRILA.anexa}. Formă consolidată la{" "}
                {new Date(SURSA_GRILA.formaConsolidata).toLocaleDateString("ro-RO")}.
              </p>
              <p className="mb-2">
                Coloana folosită este cea din <strong className="text-stone-900">iunie 2024</strong>, pentru că
                salariile de bază din sectorul public s-au menținut prin lege: în 2025 la nivelul lunii
                decembrie 2024, iar în 2026 la nivelul lunii decembrie 2025.
              </p>
              <p>
                Rezultatul este salariul de bază plus majorările bifate. Nu include sporuri de condiții
                de muncă, plata cu ora, premii sau norma didactică sub/peste normă.
              </p>
            </div>

            <FeedbackContextual context="calcul" />
          </>
        )}
      </div>
    </div>
  );
}
