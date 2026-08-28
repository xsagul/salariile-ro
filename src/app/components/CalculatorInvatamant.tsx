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
// Aceleași clase ca `controlBox` din CalculatorSalariu — controalele trebuie să
// arate identic pe tot site-ul. `text-base` pe mobil (sub 16 px Safari face zoom
// la focus), `sm:text-sm` pe desktop. Focus = bordură stone-400 + strălucire
// caldă, NU inel albastru de sistem (BRAND.md §9). `min-h-11` = ținta de 44 px.
const controlBox =
  "w-full rounded border border-stone-300 bg-surface px-3 py-2 text-base sm:text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:shadow-[0_0_6px_rgba(28,25,23,0.12)]";

/** Chevron propriu, ca la restul site-ului. `select`-ul nativ isi deseneaza
 *  sageata lipita de marginea campului si diferit pe fiecare sistem de operare;
 *  `appearance-none` o scoate, iar SVG-ul de aici o pune la `right-3`, in
 *  oglinda cu `px-3` din stanga. */
function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
      viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"
    >
      <path d="M5 7.5l5 5 5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FUNCTII = functiiDisponibile();

/** `value === null` = încă nu s-a calculat; se afișează „–”, ca structura
 *  rezultatului să fie vizibilă înainte de a apăsa Calculează. */
function Row({ label, value, sub, neg, bold, ultim, temei }: {
  label: string; value: string | null; sub?: boolean; neg?: boolean;
  bold?: boolean; ultim?: boolean; temei?: string;
}) {
  const b = ultim ? "" : "border-b ";
  return (
    <tr>
      <td className={`${b}border-r border-stone-300 px-3 py-3 text-left ${sub ? "pl-4 sm:pl-8" : ""} ${bold ? "font-bold text-stone-900" : ""}`}>
        {label}
        {temei ? <span className="mt-0.5 block text-xs text-stone-600">{temei}</span> : null}
      </td>
      <td className={`${b}border-stone-300 px-3 py-3 text-right tabular-nums whitespace-nowrap ${bold ? "font-bold text-stone-900" : ""}`}>
        {value === null ? "–" : `${neg ? "− " : ""}${value} lei`}
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
    // Secțiunea stă pe `canvas`, cardurile pe `surface` deasupra ei. Fără
    // învelișul ăsta, cardurile (#fffdf9) cad pe `<body>`-ul alb și dispar —
    // exact datoria de identitate din BRAND.md §15. Homepage-ul face la fel.
    <section className="border-y border-stone-200 bg-canvas">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-5">
      {/* ─── Formular ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Încadrarea ta</h2>

        <div className="mb-5">
          <label htmlFor="inv-functie" className={fieldLabel}>Funcția didactică și gradul</label>
          <div className="relative">
            <select
              id="inv-functie"
              className={`${controlBox} cursor-pointer appearance-none pr-9`}
              value={functie}
              onChange={(e) => schimbaFunctie(Number(e.target.value))}
            >
              {FUNCTII.map((f) => (
                <option key={f.nr} value={f.nr}>{f.functie}</option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="inv-vechime-inv" className={fieldLabel}>
            Vechimea în învățământ
            <span className="mt-0.5 block font-normal normal-case text-stone-600">
              Alege rândul din grilă. E diferită de vechimea în muncă.
            </span>
          </label>
          <div className="relative">
            <select
              id="inv-vechime-inv"
              className={`${controlBox} cursor-pointer appearance-none pr-9`}
              value={vechimeInv}
              onChange={(e) => { setVechimeInv(e.target.value); setRez(null); }}
            >
              {vechimi.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <Chevron />
          </div>
        </div>

        <div className="mb-5">
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
            className={controlBox}
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
          className="block min-h-12 w-full rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px"
        >
          Calculează
        </button>
      </div>

      {/* ─── Rezultat ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
        <h2 className={colHeader}>Rezultatul</h2>

        {/* Tabel fiscal, după BRAND.md §9: antet pe `canvas`, corp pe `surface`,
            sume la dreapta, iar rândul de total INVERSAT — singurul fundal plin
            de rând din sistem. Scheletul se arată și înainte de calcul, ca
            structura rezultatului să fie vizibilă din prima. */}
        <div className="overflow-hidden rounded border border-stone-300">
          <table className="w-full table-auto border-collapse [&_td]:align-middle [&_th]:align-middle text-sm text-stone-700 sm:table-fixed">
            <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
            <thead>
              <tr>
                <th className="border-b border-r border-b-stone-300 border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">
                  Element de salarizare
                </th>
                <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">
                  Sumă
                </th>
              </tr>
            </thead>
            <tbody>
              <Row
                label="Salariu de bază din grilă (gradația 0)"
                value={rez ? fmt(rez.salariuGrila) : null}
                temei={rez ? `Anexa I, cap. I, pct. 5 · iunie 2024 · ${rez.rand.studii}, ${rez.rand.vechime}` : undefined}
              />
              <Row
                label={rez ? `Gradația ${rez.gradatie} de vechime în muncă` : "Gradația de vechime în muncă"}
                value={rez ? fmt(rez.salariuDeBaza - rez.salariuGrila) : null}
                sub
                temei={rez ? "art. 10 alin. (4) · cotele se compun, nu se adună" : undefined}
              />
              <Row label="Salariul de bază deținut" value={rez ? fmt(rez.salariuDeBaza) : null} bold />

              {rez?.linii.map((l) => (
                <Row key={l.eticheta} label={l.eticheta} value={fmt(l.suma)} sub temei={l.temei} />
              ))}

              <Row label="Total brut" value={rez ? fmt(rez.brutTotal) : null} bold />
              <Row label="CAS (pensie – 25%)" value={rez ? fmt(rez.fiscal.cas) : null} sub neg />
              <Row label="CASS (sănătate – 10%)" value={rez ? fmt(rez.fiscal.cass) : null} sub neg />
              <Row label="Impozit pe venit (10%)" value={rez ? fmt(rez.fiscal.impozit) : null} sub neg />

              <tr className="bg-stone-900">
                <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">
                  Salariu net
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-bold tabular-nums text-white">
                  {rez ? `${fmt(rez.fiscal.netBani)} lei` : "–"}
                </td>
              </tr>

              {/* „Angajator" e vocabular de sector privat lipit pe un buget de
                  stat. Angajatorul unui cadru didactic e unitatea de invatamant,
                  institutie publica — care datoreaza CAM ca orice angajator.
                  Cifra ramane (promisiunea e ca de la cifra se ajunge la
                  formula), dar eticheta spune ce e de fapt. */}
              <Row label="CAM (plătit de unitate – 2,25%)" value={rez ? fmt(rez.fiscal.cam) : null} />
              <Row
                label="Cost total pentru unitatea de învățământ"
                value={rez ? fmt(rez.fiscal.costTotal) : null}
                bold
                ultim
              />
            </tbody>
          </table>
        </div>

        {!rez && (
          <p className="mt-4 text-xs leading-relaxed text-stone-500">
            Alege încadrarea și apasă <strong className="text-stone-900">Calculează</strong>.
            Fiecare linie își arată temeiul din lege.
          </p>
        )}

        {rez && (
          <>

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
    </section>
  );
}
