"use client";

// src/app/components/CalculatorSanatate.tsx
// Calculator salariu sănătate — Legea 153/2017, Anexa nr. II.
//
// Toată aritmetica stă în `@/lib/sanatate`. Aici nu se calculează nimic:
// componenta colectează opțiunile și afișează rezultatul cu temeiul legal pe
// fiecare linie.
//
// De ce selectorul de gradație și nu un câmp cu anii: legea nu cheie pe ani, ci
// pe benzi (art. 10 alin. (4)). Un câmp numeric ar sugera o precizie care nu
// există și ar pune utilizatorul să calculeze singur în ce bandă cade.
//
// Diferența față de calculatorul de învățământ, care e vizibilă în rezultat:
// aici plafonul indemnizației de hrană chiar mușcă. Un medic primar are salariul
// de bază peste 6.000 lei net, deci nu primește cei 347 de lei — iar asta se
// spune pe față, nu se ascunde printr-o linie lipsă.

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import { SelectorPastile, type OptiunePastila } from "@/app/components/SelectorPastile";
import {
  calculeazaSanatate,
  meserieSanatate,
  MESERII_SANATATE,
  type RezultatSanatate,
} from "@/lib/sanatate";
import { GRADATII, INDEMNIZATIE_DOCTORAT_2026, type NivelGradatie } from "@/lib/lege153";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";

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

export default function CalculatorSanatate() {
  // Implicit asistentul medical: e cea mai căutată meserie din sănătate.
  const [slug, setSlug] = useState("asistent-medical");
  const [treapta, setTreapta] = useState<string | null>(null);
  const [gradatie, setGradatie] = useState<NivelGradatie>(3);
  const [doctorat, setDoctorat] = useState(false);
  const [alteDrepturiHrana, setAlteDrepturiHrana] = useState(false);
  const [rez, setRez] = useState<RezultatSanatate | null>(null);

  const meserie = meserieSanatate(slug);
  const trepte = meserie?.trepte ?? [];
  // Treapta aleasă rămâne validă doar cât timp aparține meseriei curente.
  const treaptaCurenta = trepte.some((t) => t.eticheta === treapta) ? treapta : null;

  const optiuniMeserii: OptiunePastila<string>[] = MESERII_SANATATE.map((m) => ({
    valoare: m.slug,
    eticheta: m.nume,
    detaliu: `Grilă pentru ${m.domeniu}. ${m.trepte.length} trepte.`,
  }));

  const optiuniTrepte: OptiunePastila<string>[] = trepte.map((t) => ({
    valoare: t.eticheta,
    eticheta: t.eticheta,
    detaliu: `${fmt(t.brut)} lei brut la gradația 0, înainte de vechime.`,
  }));

  const optiuniGradatie: OptiunePastila<number>[] = GRADATII.map((g) => ({
    valoare: g.nivel,
    eticheta: `Gradația ${g.nivel}`,
    detaliu: `Vechime în muncă ${g.eticheta}.`,
  }));

  function calculeaza() {
    if (!treaptaCurenta) return;
    setRez(
      calculeazaSanatate({
        slug,
        treapta: treaptaCurenta,
        gradatie,
        doctorat,
        alteDrepturiHrana,
      }),
    );
  }

  const r = rez;
  const sporGradatie = r ? r.salariuDeBaza - r.salariuGrila : null;

  return (
    <div id="calc-sanatate" className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-5">
      {/* ─── Opțiuni ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Încadrarea</h2>

        <div className="flex flex-col gap-5">
          <SelectorPastile
            eticheta="Meseria"
            optiuni={optiuniMeserii}
            valoare={slug}
            onChange={(v) => {
              setSlug(v);
              setTreapta(null);
              setRez(null);
            }}
          />

          <SelectorPastile
            eticheta="Treapta profesională"
            optiuni={optiuniTrepte}
            valoare={treaptaCurenta}
            onChange={(v) => {
              setTreapta(v);
              setRez(null);
            }}
          />

          <SelectorPastile
            eticheta="Gradația de vechime în muncă"
            ajutor="Din toată cariera, nu doar din sănătate."
            optiuni={optiuniGradatie}
            valoare={gradatie}
            onChange={(v) => {
              setGradatie(v as NivelGradatie);
              setRez(null);
            }}
          />

          <div className="border-t border-stone-200 pt-4">
            <Toggle
              label="Titlu științific de doctor"
              hint={`${fmt(INDEMNIZATIE_DOCTORAT_2026)} lei lunar, dacă lucrezi în domeniul titlului.`}
              checked={doctorat}
              onChange={(v) => {
                setDoctorat(v);
                setRez(null);
              }}
            />
            <Toggle
              label="Primesc alte drepturi de hrană"
              hint="Atunci indemnizația de hrană nu se cuvine."
              checked={alteDrepturiHrana}
              onChange={(v) => {
                setAlteDrepturiHrana(v);
                setRez(null);
              }}
            />
          </div>

          <button
            type="button"
            onClick={calculeaza}
            disabled={!treaptaCurenta}
            className="min-h-11 w-full rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            Calculează
          </button>
        </div>
      </div>

      {/* ─── Rezultat ────────────────────────────────────────────────── */}
      <div id="rezultat-sanatate" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
        <h2 className={colHeader}>Rezultatul</h2>

        <div className="overflow-hidden rounded border border-stone-300">
          <table className="w-full table-auto border-collapse text-sm text-stone-700 [&_td]:align-middle [&_th]:align-middle sm:table-fixed">
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
                value={r ? fmt(r.salariuGrila) : null}
                temei="Legea 153/2017, Anexa nr. II"
              />
              <Row
                label={r ? `Gradația ${r.gradatie} de vechime în muncă` : "Gradația de vechime în muncă"}
                value={sporGradatie === null ? null : fmt(sporGradatie)}
                sub
                temei="art. 10 alin. (4) — cotele se compun, nu se adună"
              />
              <Row label="Salariul de bază deținut" value={r ? fmt(r.salariuDeBaza) : null} bold />

              {(r?.linii ?? []).map((l) => (
                <Row key={l.eticheta} label={l.eticheta} value={fmt(l.suma)} sub temei={l.temei} />
              ))}

              <Row label="Brut total" value={r ? fmt(r.brutTotal) : null} bold />
              <Row label="CAS 25%" value={r ? fmt(r.fiscal.cas) : null} sub neg />
              <Row label="CASS 10%" value={r ? fmt(r.fiscal.cass) : null} sub neg />
              <Row label="Impozit pe venit 10%" value={r ? fmt(r.fiscal.impozit) : null} sub neg />
              <Row label="Salariu net" value={r ? fmt(r.fiscal.netBani) : null} bold ultim />
            </tbody>
          </table>
        </div>

        {r?.hranaPesteplafon ? (
          <p className="mt-4 rounded border border-stone-300 bg-canvas p-3 text-sm leading-relaxed text-stone-700">
            <strong className="text-stone-900">Fără indemnizație de hrană.</strong> Salariul de bază
            depășește plafonul de 6.000 lei net din art. 18 alin. (1), așa că cei 347 de lei nu se
            acordă. La treptele de început ale aceleiași meserii, plafonul nu se atinge și
            indemnizația apare în tabel.
          </p>
        ) : null}

        {!r ? (
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            Alege încadrarea și apasă <strong className="text-stone-900">Calculează</strong>.
          </p>
        ) : null}

        <div className="mt-5 border-t border-stone-200 pt-4 text-xs leading-relaxed text-stone-600">
          <p>
            Calculul acoperă salariul de bază din grilă, gradația de vechime și indemnizațiile
            generale din corpul legii. <strong className="text-stone-800">Nu include</strong>{" "}
            sporurile pentru condiții deosebite, vătămătoare sau periculoase din Anexa nr. II
            cap. II, gărzile și sporul de noapte: procentele depind de încadrarea concretă a
            postului și de graficul lunar, care nu se pot deduce din lege.
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
