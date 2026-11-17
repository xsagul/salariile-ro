"use client";

// src/app/components/CalculatorInflatie.tsx
// Cât valorează o sumă dintr-o lună în altă lună, pe indicele prețurilor de
// consum publicat de INS. Mutat de pe calculatorulinflatiei.ro pe 17 noiembrie
// 2026; aritmetica și seria stau în `@/lib/inflatie`, cu testele lor.
//
// Spre deosebire de calculatorul de TVA, pagina pornește cu un rezultat real:
// 1.000 de lei din ianuarie 2020, aduși la ultima lună publicată. Cine vine din
// „calculator inflatie” vede răspunsul înainte să atingă ceva, iar Google
// indexează o cifră, nu un formular gol. Așa era și pe site-ul vechi, cu 22 de
// clicuri pe zi din Google pe pagina asta.
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

const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const camp =
  "min-h-11 w-full rounded border border-stone-300 bg-surface px-3 py-2 text-base tabular-nums text-stone-900 sm:text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-300";

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

function Rand({ eticheta, valoare, calcul, bold, ultim, marcat }: {
  eticheta: string; valoare: string | null; calcul?: string; bold?: boolean; ultim?: boolean; marcat?: boolean;
}) {
  const b = ultim ? "" : "border-b ";
  return (
    <tr>
      <td className={`${b}border-r border-stone-300 px-3 py-3 text-left ${bold ? "font-bold text-stone-900" : ""}`}>
        {eticheta}
        {calcul ? <span className="mt-0.5 block text-xs font-normal tabular-nums text-stone-600">{calcul}</span> : null}
      </td>
      <td className={`${b}border-stone-300 px-3 py-3 text-right tabular-nums whitespace-nowrap ${bold ? "font-bold text-stone-900" : ""}`}>
        {valoare === null ? "–" : marcat ? <span className="marcaj">{valoare}</span> : valoare}
      </td>
    </tr>
  );
}

function AlegeLuna({ eticheta, valoare, onChange }: { eticheta: string; valoare: Luna; onChange: (l: Luna) => void }) {
  return (
    <fieldset className="mb-3">
      <legend className="block text-sm font-medium text-stone-900">{eticheta}</legend>
      <div className="mt-2 grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-2">
        <select
          aria-label={`${eticheta}: luna`}
          value={valoare.luna}
          onChange={(e) => onChange({ ...valoare, luna: Number(e.target.value) })}
          className={camp}
        >
          {LUNI.map((l) => (
            <option key={l} value={l}>{numeLuna(l)}</option>
          ))}
        </select>
        <select
          aria-label={`${eticheta}: anul`}
          value={valoare.an}
          onChange={(e) => onChange({ ...valoare, an: Number(e.target.value) })}
          className={camp}
        >
          {ANI.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}

export default function CalculatorInflatie() {
  const [suma, setSuma] = useState("1.000");
  const [de, setDe] = useState<Luna>({ an: 2020, luna: 1 });
  const [la, setLa] = useState<Luna>({ an: ULTIMA_LUNA.an, luna: ULTIMA_LUNA.luna });
  const [lipsaSuma, setLipsaSuma] = useState(false);

  const valoare = citesteSuma(suma);
  const inafara = [de, la].find((l) => !inSerie(l));
  const r = valoare !== null && !inafara ? converteste(valoare, de, la) : null;

  const eroareSuma = lipsaSuma && valoare === null ? "Scrie o sumă, de exemplu 1.000." : null;
  const eroarePerioada = inafara
    ? rang(inafara) > rang(ULTIMA_LUNA)
      ? `INS a publicat indicele până în ${etichetaLuna(ULTIMA_LUNA)}. Alege o lună până atunci.`
      : `Seria INS începe în ${etichetaLuna(PRIMA_LUNA)}. Pentru lunile de dinainte nu există indice oficial.`
    : null;

  function calculeaza() {
    setLipsaSuma(valoare === null);
    if (valoare === null || inafara) return;
    masoaraCalcul("inflatie", { varianta: rang(la) >= rang(de) ? "inainte" : "inapoi" });
    deruleazaLaRezultat("rezultat-inflatie", "calc-inflatie");
  }

  const crescut = r ? r.factorPreturi >= 1 : true;

  return (
    <div id="calc-inflatie" className={`mx-auto grid max-w-6xl gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
      {/* ─── Intrări ─────────────────────────────────────────────────── */}
      <div className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2">
        <h2 className={colHeader}>Suma și perioada</h2>

        <div className="flex flex-col gap-2">
          <label className="mb-3 block">
            <span className="block text-sm font-medium text-stone-900">Suma</span>
            <span className="mt-2 flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                enterKeyHint="done"
                value={suma}
                onChange={(e) => { setSuma(e.target.value); setLipsaSuma(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") calculeaza(); }}
                aria-invalid={eroareSuma ? true : undefined}
                aria-describedby={eroareSuma ? "eroare-suma-inflatie" : undefined}
                className={camp}
              />
              <span className="shrink-0 text-sm text-stone-600">{unitate(de)}</span>
            </span>
            {eroareSuma ? (
              <span id="eroare-suma-inflatie" role="alert" className="mt-1 block text-sm font-medium text-stone-900">{eroareSuma}</span>
            ) : null}
          </label>

          <AlegeLuna eticheta="Din luna" valoare={de} onChange={setDe} />
          <AlegeLuna eticheta="Până în luna" valoare={la} onChange={setLa} />

          {eroarePerioada ? (
            <p role="alert" className="mb-3 rounded border border-stone-500 px-3 py-2 text-sm font-medium text-stone-900">
              {eroarePerioada}
            </p>
          ) : null}

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
      <div id="rezultat-inflatie" className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3">
        <h2 className={colHeader}>Rezultatul</h2>

        <div className="overflow-hidden rounded border border-stone-300">
          <table className="w-full table-auto border-collapse text-sm text-stone-700 sm:table-fixed" aria-live="polite">
            <colgroup><col /><col className="w-40 sm:w-48" /></colgroup>
            <thead>
              <tr>
                <th className="border-b border-r border-b-stone-300 border-r-stone-300 bg-antet px-3 py-3 text-left text-sm font-medium text-stone-700">
                  Element
                </th>
                <th className="border-b border-stone-300 bg-antet px-3 py-3 text-right text-sm font-medium text-stone-700">
                  Valoare
                </th>
              </tr>
            </thead>
            <tbody>
              <Rand
                eticheta={`Suma, în ${etichetaLuna(de)}`}
                valoare={r ? `${nr(r.suma)} ${unitate(de)}` : null}
              />
              <Rand
                eticheta="Coeficient de actualizare"
                valoare={r ? nr(r.factorPreturi, 4) : null}
                calcul={
                  r
                    ? crescut
                      ? `Prețurile au crescut de ${nr(r.factorPreturi)} ori`
                      : `Prețurile au scăzut cu ${nr((1 - r.factorPreturi) * 100, 1)}%`
                    : undefined
                }
              />
              <Rand eticheta="Inflație cumulată" valoare={r ? `${nr(r.inflatieCumulata, 1)}%` : null} />
              <Rand eticheta="Putere de cumpărare rămasă" valoare={r ? `${nr(r.putereRamasa, 1)}%` : null} />
              <Rand
                eticheta="Rata medie anuală"
                valoare={r ? (r.rataMedieAnuala !== null ? `${nr(r.rataMedieAnuala, 1)}%` : "sub un an") : null}
              />
              <Rand
                eticheta={`Valorează în ${etichetaLuna(la)}`}
                valoare={r ? `${nr(r.echivalent)} ${unitate(la)}` : null}
                calcul={
                  r
                    ? `${nr(r.suma)} × ${nr(r.factorPreturi, 4)}${r.denominareAplicata ? (moneda(de) === "ROL" ? " ÷ 10.000" : " × 10.000") : ""}`
                    : undefined
                }
                bold
                marcat
                ultim
              />
            </tbody>
          </table>
        </div>

        {r?.denominareAplicata ? (
          <p className="mt-4 text-sm text-stone-600">
            Suma trece peste 1 iulie 2005, când 10.000 de lei vechi au devenit 1 leu nou. Calculul aplică denominarea.
          </p>
        ) : null}

        <p className="mt-4 text-xs text-stone-600">
          Pe indicele prețurilor de consum publicat de INS, lună de lună, până în {etichetaLuna(ULTIMA_LUNA)}.
        </p>
        {r ? (
          <div className="mt-4">
            <FeedbackContextual context="calcul" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
