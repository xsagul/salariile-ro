"use client";

// src/app/components/CalculatorInflatie.tsx
// Cât valorează o sumă dintr-o lună în altă lună, pe indicele prețurilor de
// consum publicat de INS. Mutat de pe calculatorulinflatiei.ro pe 17 noiembrie
// 2026; aritmetica și seria stau în `@/lib/inflatie`, cu testele lor.
//
// Piesele sunt cele ale calculatorului de salariu de pe homepage, la cererea
// proprietarului (17 noiembrie 2026, după prima versiune, cu selectoare de sistem
// și un tabel lat pe telefon): câmpul gol cu „ex:” și unitatea în chenar,
// selectoarele cu săgeată desenată (anul îngust, luna lată), tabelul compact cu
// coloana de valori de 112 px pe telefon și rândul final negru, cu cifra marcată.
// Rezultatul apare la „Calculează”; de atunci urmează formularul, ca la TVA.
//
// Ambele capete se aleg. „Cât valorau 1.000 de lei din 2010 în 2015” e o
// întrebare la fel de legitimă ca „cât valorează azi”, iar actualizarea unei
// sume dintr-un contract sau dintr-o hotărâre cere luni anume, nu „azi”.

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import IconCalculeaza from "@/app/components/IconCalculeaza";
import { SPATIU_JOS } from "@/app/components/ui";
import { masoaraCalcul } from "@/lib/analytics";
import { deruleazaLaRezultat } from "@/lib/deruleaza-la-rezultat";
import {
  aniDisponibili,
  converteste,
  etichetaLuna,
  moneda,
  numeLuna,
  PRIMA_LUNA,
  ULTIMA_LUNA,
  type Luna,
} from "@/lib/inflatie";

// Aceleași clase ca în CalculatorSalariu.tsx (homepage).
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const controlBox =
  "w-full rounded border border-stone-300 bg-surface px-3 py-2 text-base sm:text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:shadow-[0_0_6px_rgba(28,25,23,0.12)]";
const etichetaRand = "mb-2 block text-sm text-stone-700";
const cellL = "border-b border-r border-stone-300 px-3 py-3 text-left";
const cellR = "border-b border-stone-300 px-3 py-3 text-right tabular-nums whitespace-nowrap";

const ANI = aniDisponibili();
const LUNI = Array.from({ length: 12 }, (_, i) => i + 1);

const rang = (l: Luna) => l.an * 12 + l.luna;
const inSerie = (l: Luna) => rang(l) >= rang(PRIMA_LUNA) && rang(l) <= rang(ULTIMA_LUNA);

const nr = (n: number, zecimale = 2) =>
  n.toLocaleString("ro-RO", { minimumFractionDigits: zecimale, maximumFractionDigits: zecimale });
/** Sumele dinainte de 1 iulie 2005 sunt în lei vechi (ROL). */
const unitate = (l: Luna) => (moneda(l) === "ROL" ? "lei vechi" : "lei");

/**
 * Suma scrisă de om: „1.250,50”, „1250.5”, „1 250”. Punctul e separator de mii
 * când urmează exact trei cifre, altfel e virgula zecimală a tastaturii englezești.
 */
function citesteSuma(text: string): number | null {
  const t = text.replace(/\s/g, "");
  if (!t) return null;
  let normal: string;
  if (t.includes(",")) normal = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) normal = t.replace(/\./g, "");
  else normal = t;
  if (!/^\d+(\.\d+)?$/.test(normal)) return null;
  const n = Number(normal);
  return Number.isFinite(n) ? n : null;
}

const Sageata = () => (
  <svg className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
    <path d="M5 7.5l5 5 5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Anul îngust și luna lată, ca selectorul „Anul” de pe homepage. */
function AlegeLuna({ id, eticheta, valoare, onChange }: {
  id: string; eticheta: string; valoare: Luna; onChange: (l: Luna) => void;
}) {
  return (
    <div className="mb-5">
      <label htmlFor={`${id}-an`} className={etichetaRand}>{eticheta}</label>
      <div className="flex min-w-0 gap-2">
        <div className="relative w-2/5 shrink-0 sm:w-[4.875rem]">
          <select
            id={`${id}-an`}
            value={valoare.an}
            onChange={(e) => onChange({ ...valoare, an: Number(e.target.value) })}
            className={`${controlBox} min-h-11 cursor-pointer appearance-none pr-6 tabular-nums`}
          >
            {ANI.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <Sageata />
        </div>
        <div className="relative min-w-0 flex-1">
          <label htmlFor={`${id}-luna`} className="sr-only">{`${eticheta}: luna`}</label>
          <select
            id={`${id}-luna`}
            value={valoare.luna}
            onChange={(e) => onChange({ ...valoare, luna: Number(e.target.value) })}
            className={`${controlBox} min-h-11 cursor-pointer appearance-none pr-6`}
          >
            {LUNI.map((l) => (
              <option key={l} value={l}>{numeLuna(l)}</option>
            ))}
          </select>
          <Sageata />
        </div>
      </div>
    </div>
  );
}

export default function CalculatorInflatie() {
  const [suma, setSuma] = useState("");
  const [de, setDe] = useState<Luna>({ an: 2020, luna: 1 });
  const [la, setLa] = useState<Luna>({ an: ULTIMA_LUNA.an, luna: ULTIMA_LUNA.luna });
  // Devine adevărat la prima apăsare pe „Calculează”; de atunci rezultatul urmează formularul.
  const [cerut, setCerut] = useState(false);
  const [lipsaSuma, setLipsaSuma] = useState(false);

  const valoare = citesteSuma(suma);
  const inafara = [de, la].find((l) => !inSerie(l));
  const r = cerut && valoare !== null && !inafara ? converteste(valoare, de, la) : null;

  const eroareSuma = lipsaSuma ? "Scrie o sumă, de exemplu 1.000." : null;
  const eroarePerioada = inafara
    ? rang(inafara) > rang(ULTIMA_LUNA)
      ? `INS a publicat indicele până în ${etichetaLuna(ULTIMA_LUNA)}. Alege o lună până atunci.`
      : `Seria INS începe în ${etichetaLuna(PRIMA_LUNA)}. Pentru lunile de dinainte nu există indice oficial.`
    : null;

  function calculeaza() {
    setCerut(true);
    setLipsaSuma(valoare === null);
    if (valoare === null || inafara) return;
    masoaraCalcul("inflatie", { varianta: rang(la) >= rang(de) ? "inainte" : "inapoi" });
    deruleazaLaRezultat("rezultat-inflatie", "calc-inflatie");
  }

  const gol = "–";

  return (
    <div id="calc-inflatie" className={`mx-auto grid max-w-6xl gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
      {/* ─── Intrări ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Suma și perioada</h2>

        <div className="mb-5">
          <label htmlFor="suma-inflatie" className={etichetaRand}>Suma</label>
          <div className={`flex w-full overflow-hidden rounded border transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)] ${eroareSuma ? "border-stone-500 shadow-[0_0_6px_rgba(28,25,23,0.12)]" : "border-stone-300"}`}>
            <input
              id="suma-inflatie"
              name="suma-inflatie"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              enterKeyHint="done"
              placeholder="ex: 1.000"
              value={suma}
              onChange={(e) => { setSuma(e.target.value); setLipsaSuma(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); calculeaza(); } }}
              aria-invalid={eroareSuma ? true : undefined}
              aria-describedby={eroareSuma ? "suma-inflatie-eroare" : undefined}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-stone-900 outline-none tabular-nums"
            />
            <span className="flex items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
              {unitate(de)}
            </span>
          </div>
          {eroareSuma ? (
            <span id="suma-inflatie-eroare" role="alert" className="mt-2 block text-xs font-medium text-stone-900">{eroareSuma}</span>
          ) : null}
        </div>

        <AlegeLuna id="de-la" eticheta="Din luna" valoare={de} onChange={setDe} />
        <AlegeLuna id="pana-la" eticheta="Până în luna" valoare={la} onChange={setLa} />

        {eroarePerioada ? (
          <p role="alert" className="mb-5 rounded border border-stone-500 px-3 py-2 text-xs font-medium text-stone-900">
            {eroarePerioada}
          </p>
        ) : null}

        <button
          type="button"
          onClick={calculeaza}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px"
        >
          <IconCalculeaza />
          Calculează
        </button>
      </div>

      {/* ─── Rezultat ────────────────────────────────────────────────── */}
      <div id="rezultat-inflatie" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
        <h2 className={colHeader}>Rezultatul</h2>

        <div aria-live="polite">
          <div className="overflow-hidden rounded border border-stone-300">
            <table className="w-full table-auto border-collapse text-sm text-stone-700 [&_td]:align-middle [&_th]:align-middle sm:table-fixed">
              <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
              <thead>
                <tr>
                  <th className="border-b border-b-stone-300 border-r border-r-stone-300 bg-canvas px-3 py-3 text-left text-sm font-medium text-stone-700">Indicator</th>
                  <th className="border-b border-stone-300 bg-canvas px-3 py-3 text-right text-sm font-medium text-stone-700">Valoare</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={cellL}>Suma din {etichetaLuna(de)}</td>
                  <td className={cellR}>{r ? `${nr(r.suma)} ${unitate(de)}` : gol}</td>
                </tr>
                <tr>
                  <td className={cellL}>Coeficient de actualizare</td>
                  <td className={cellR}>{r ? nr(r.factorPreturi, 4) : gol}</td>
                </tr>
                <tr>
                  <td className={cellL}>Inflație cumulată</td>
                  <td className={cellR}>{r ? `${nr(r.inflatieCumulata, 1)}%` : gol}</td>
                </tr>
                <tr>
                  <td className={cellL}>Putere de cumpărare rămasă</td>
                  <td className={cellR}>{r ? `${nr(r.putereRamasa, 1)}%` : gol}</td>
                </tr>
                <tr>
                  <td className={`${cellL} border-b-0`}>Rata medie anuală</td>
                  <td className={`${cellR} border-b-0`}>
                    {r ? (r.rataMedieAnuala !== null ? `${nr(r.rataMedieAnuala, 1)}%` : "sub un an") : gol}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Răspunsul, separat și inversat, ca „Salariu net” pe homepage. */}
          <div className="mt-3 overflow-hidden rounded border border-stone-300">
            <table className="w-full table-auto border-collapse text-sm text-stone-700 [&_td]:align-middle sm:table-fixed">
              <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
              <tbody>
                <tr className="bg-stone-900">
                  <td className="border-r border-r-stone-600 px-3 py-3 text-left text-sm font-bold text-white">
                    Valorează în {etichetaLuna(la)}
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-bold tabular-nums whitespace-nowrap text-white">
                    {r ? <span className="marcaj">{nr(r.echivalent)} {unitate(la)}</span> : gol}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {r?.denominareAplicata ? (
          <p className="mt-4 text-sm text-stone-600">
            Intervalul trece peste 1 iulie 2005, când 10.000 de lei vechi au devenit 1 leu nou. Calculul aplică denominarea.
          </p>
        ) : null}

        {!r ? (
          <p className="mt-4 text-xs text-stone-600">
            Scrie suma, alege lunile și apasă <strong className="font-medium text-stone-900">Calculează</strong>. Indicele INS
            e publicat până în {etichetaLuna(ULTIMA_LUNA)}.
          </p>
        ) : (
          <div className="mt-4">
            <FeedbackContextual context="calcul" />
          </div>
        )}
      </div>
    </div>
  );
}
