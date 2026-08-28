"use client";

import { useState } from "react";
import {
  calculeazaPartTime,
  salariuMinimPartTime,
  type InputState,
  type RezultatPartTime,
} from "@/lib/fiscal";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));
const fmtOre = (n: number) =>
  new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 }).format(n);

const fieldLabel = "mb-2 block text-xs font-medium text-stone-500";
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const controlBox =
  "w-full min-w-0 rounded border border-stone-300 bg-surface px-3 py-2 text-base text-stone-900 outline-none transition focus:border-stone-400 focus:shadow-[0_0_6px_rgba(28,25,23,0.12)] sm:text-sm";

const EXCEPTII = [
  { value: "", label: "Nu se aplică nicio excepție" },
  { value: "student", label: "Elev sau student, până la 26 de ani" },
  { value: "ucenic", label: "Ucenic, până la 18 ani" },
  { value: "dizabilitate", label: "Dizabilitate / drept legal la program redus" },
  { value: "pensionar", label: "Pensionar pentru limită de vârstă" },
  { value: "contracte", label: "Mai multe contracte, cumulat cel puțin minimul" },
] as const;

type DateCalcul = {
  orePeZi: number;
  brut: string;
  exceptie: string;
  functieDeBaza: boolean;
  persoane: number;
  sub26: boolean;
};

type RezultatAfisat = {
  rezultat: RezultatPartTime;
  brut: number;
  exceptat: boolean;
  key: string;
};

const dateInitiale: DateCalcul = {
  orePeZi: 4,
  brut: String(salariuMinimPartTime(4)),
  exceptie: "",
  functieDeBaza: true,
  persoane: 0,
  sub26: false,
};

function inputFiscal(date: DateCalcul): InputState {
  return {
    brut: date.brut,
    tichete: "0",
    functieDeBAza: date.functieDeBaza,
    persoanePretretinere: date.persoane,
    varstaSub26: date.sub26,
    copiiScolarizati: 0,
    scutitImpozit: false,
    normaContract: "partiala",
  };
}

function cheieCalcul(date: DateCalcul): string {
  return JSON.stringify([
    date.orePeZi,
    date.brut,
    date.exceptie,
    date.functieDeBaza,
    date.persoane,
    date.sub26,
  ]);
}

function executaCalculul(date: DateCalcul): RezultatAfisat | null {
  const rezultat = calculeazaPartTime(inputFiscal(date), {
    orePeZi: date.orePeZi,
    exceptatBazaMinima: Boolean(date.exceptie),
  });
  if (!rezultat) return null;
  return {
    rezultat,
    brut: Number(date.brut),
    exceptat: Boolean(date.exceptie),
    key: cheieCalcul(date),
  };
}

// Garda de mai jos e in IIFE pentru ca ingustarea de tip de la `throw` nu
// traverseaza granita de functie: un `if` la nivel de modul nu ingusteaza
// variabila si inauntrul componentei.
const rezultatInitial: RezultatAfisat = (() => {
  const r = executaCalculul(dateInitiale);
  if (!r) throw new Error("Scenariul inițial part-time nu poate fi calculat.");
  return r;
})();

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M5 7.5l5 5 5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Toggle({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 border-b border-stone-200 py-2 text-sm text-stone-700 last:border-b-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-stone-900"
      />
      {label}
    </label>
  );
}

function RandRezultat({ eticheta, suportatDe, valoare, bold, ultim }: {
  eticheta: string;
  suportatDe: string;
  valoare: number | null;
  bold?: boolean;
  ultim?: boolean;
}) {
  const b = ultim ? "" : "border-b ";
  return (
    <tr>
      <th scope="row" className={`${b}border-r border-stone-200 px-3 py-3 text-left ${bold ? "font-bold text-stone-900" : "font-normal text-stone-700"}`}>
        {eticheta}
        <span className="mt-0.5 block text-xs text-stone-600 sm:hidden">{suportatDe}</span>
      </th>
      <td className={`hidden ${b}border-r border-stone-200 px-3 py-3 text-right text-stone-600 sm:table-cell`}>
        {suportatDe}
      </td>
      <td className={`${b}border-stone-200 px-3 py-3 text-right whitespace-nowrap ${bold ? "font-bold text-stone-900" : "font-medium text-stone-900"}`}>
        {valoare === null ? "—" : `${fmt(valoare)} lei`}
      </td>
    </tr>
  );
}

export default function CalculatorPartTime() {
  const [orePeZi, setOrePeZi] = useState(dateInitiale.orePeZi);
  const [brut, setBrut] = useState(dateInitiale.brut);
  const [exceptie, setExceptie] = useState(dateInitiale.exceptie);
  const [functieDeBaza, setFunctieDeBaza] = useState(dateInitiale.functieDeBaza);
  const [persoane, setPersoane] = useState(dateInitiale.persoane);
  const [sub26, setSub26] = useState(dateInitiale.sub26);
  const [avansat, setAvansat] = useState(false);
  const [emptyWarn, setEmptyWarn] = useState(false);
  const [rezAfisat, setRezAfisat] = useState<RezultatAfisat>(rezultatInitial);

  const dateCurente: DateCalcul = {
    orePeZi,
    brut,
    exceptie,
    functieDeBaza,
    persoane,
    sub26,
  };
  const stale = rezAfisat.key !== cheieCalcul(dateCurente);
  const rezultat = rezAfisat.rezultat;
  const minimProportional = salariuMinimPartTime(orePeZi);
  const brutNumeric = Number(brut);
  const subMinimulLegal = brutNumeric > 0 && brutNumeric < minimProportional;
  const diferenteAngajator = rezultat.diferentaCasAngajator + rezultat.diferentaCassAngajator;

  const schimbaOrele = (ore: number) => {
    setOrePeZi(ore);
    setBrut(String(salariuMinimPartTime(ore)));
    setEmptyWarn(false);
  };

  const calculeaza = () => {
    if (!Number.isFinite(brutNumeric) || brutNumeric <= 0) {
      setEmptyWarn(true);
      document.getElementById("part-time-brut")?.focus();
      return;
    }
    const urmatorul = executaCalculul(dateCurente);
    if (!urmatorul) return;
    setEmptyWarn(false);
    setRezAfisat(urmatorul);

    // Ca pe homepage: mobil -> rezultatul, desktop -> tot blocul.
    const mobil = window.matchMedia("(max-width: 768px)").matches;
    const tinta = mobil ? "rezultat-part-time" : "calc-part-time";
    requestAnimationFrame(() => {
      document.getElementById(tinta)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const comutaAvansat = () => {
    if (avansat) {
      setExceptie("");
      setFunctieDeBaza(true);
      setPersoane(0);
      setSub26(false);
    }
    setAvansat(!avansat);
  };

  return (
    <section className="border-b border-stone-200 bg-canvas" aria-labelledby="calculator-part-time">
      <div id="calc-part-time" className="mx-auto grid max-w-6xl items-start gap-6 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-5">
        <form
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2"
          onSubmit={(event) => {
            event.preventDefault();
            calculeaza();
          }}
        >
          <h2 id="calculator-part-time" className={colHeader}>Datele contractului</h2>

          <fieldset className="mb-5 min-w-0">
            <legend className={fieldLabel}>Ore lucrate pe zi</legend>
            <div className="grid grid-cols-3 gap-2">
              {[2, 4, 6].map((ore) => (
                <button
                  key={ore}
                  type="button"
                  aria-pressed={orePeZi === ore}
                  onClick={() => schimbaOrele(ore)}
                  className={`min-h-11 min-w-0 rounded border px-2 text-sm font-medium transition-colors ${
                    orePeZi === ore
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 bg-surface text-stone-700 hover:bg-canvas"
                  }`}
                >
                  {ore} ore
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mb-5 min-w-0">
            <label htmlFor="part-time-brut" className={fieldLabel}>Salariu brut lunar</label>
            <div className={`flex min-w-0 overflow-hidden rounded border bg-surface transition focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)] ${
              emptyWarn || subMinimulLegal ? "border-stone-500" : "border-stone-300 focus-within:border-stone-400"
            }`}>
              <input
                id="part-time-brut"
                name="salariu-brut-part-time"
                inputMode="numeric"
                value={brut ? fmt(Number(brut)) : ""}
                placeholder={`ex: ${fmt(salariuMinimPartTime(4))}`}
                aria-invalid={emptyWarn || subMinimulLegal}
                aria-describedby="part-time-brut-ajutor"
                onChange={(event) => {
                  setBrut(event.target.value.replace(/\D/g, ""));
                  if (emptyWarn) setEmptyWarn(false);
                }}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
              />
              <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-500">lei / lună</span>
            </div>
            <p
              id="part-time-brut-ajutor"
              role={emptyWarn ? "alert" : undefined}
              className={`mt-2 text-xs leading-normal ${emptyWarn || subMinimulLegal ? "font-medium text-stone-900" : "text-stone-600"}`}
            >
              {emptyWarn
                ? "Introdu un salariu brut mai întâi."
                : subMinimulLegal
                  ? `Sub minimul proporțional de ${fmt(minimProportional)} lei brut pentru ${orePeZi} ore/zi.`
                  : `Minimul proporțional pentru ${orePeZi} ore/zi este ${fmt(minimProportional)} lei brut.`}
            </p>
          </div>

          <button
            type="button"
            aria-expanded={avansat}
            aria-controls="optiuni-avansate-part-time"
            onClick={comutaAvansat}
            className="mb-5 flex min-h-11 w-full items-center justify-center rounded border border-dashed border-stone-300 px-4 text-xs font-medium text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-700"
          >
            {avansat ? "▲ Ascunde opțiuni avansate" : "▼ Calculator avansat"}
          </button>

          {avansat && (
            <div id="optiuni-avansate-part-time" className="mb-5 min-w-0">
              <div className="mb-5 min-w-0">
                <label htmlFor="exceptie-part-time" className={fieldLabel}>Excepție de la baza minimă CAS/CASS</label>
                <div className="relative min-w-0">
                  <select
                    id="exceptie-part-time"
                    value={exceptie}
                    onChange={(event) => setExceptie(event.target.value)}
                    className={`${controlBox} cursor-pointer appearance-none pr-9`}
                  >
                    {EXCEPTII.map((optiune) => (
                      <option key={optiune.value} value={optiune.value}>{optiune.label}</option>
                    ))}
                  </select>
                  <Chevron />
                </div>
                <p className="mt-2 text-xs leading-normal text-stone-600">Excepția trebuie susținută cu documentele cerute de lege.</p>
              </div>

              <div className="mb-4 min-w-0">
                <label htmlFor="persoane-part-time" className={fieldLabel}>Persoane în întreținere</label>
                <div className="relative min-w-0">
                  <select
                    id="persoane-part-time"
                    value={persoane}
                    onChange={(event) => setPersoane(Number(event.target.value))}
                    className={`${controlBox} cursor-pointer appearance-none pr-9`}
                  >
                    {[0, 1, 2, 3, 4].map((nr) => (
                      <option key={nr} value={nr}>{nr === 0 ? "Niciuna" : nr === 4 ? "4 sau mai multe" : nr}</option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              </div>

              <div>
                <Toggle label="Contractul este la funcția de bază" checked={functieDeBaza} onChange={setFunctieDeBaza} />
                <Toggle label="Am sub 26 de ani" checked={sub26} onChange={setSub26} />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="block min-h-12 w-full rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px"
            aria-label="Calculează salariul part-time și navighează la rezultat"
          >
            Calculează
          </button>
        </form>

        <div
          id="rezultat-part-time"
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3"
          aria-live="polite"
        >
          <h2 className={colHeader}>Rezultat calcul</h2>

          {stale && (
            <p className="mb-4 rounded border border-stone-300 bg-canvas px-3 py-2 text-xs text-stone-600" role="status">
              Ai modificat datele – apasă <strong className="font-medium text-stone-900">Calculează</strong> pentru a actualiza rezultatul.
            </p>
          )}

          <div className={stale ? "opacity-50 transition-opacity" : "transition-opacity"}>
            {/* Un singur fel de prezentare, ca la restul calculatoarelor:
                tabel fiscal cu rândul de total inversat. BRAND.md §9 spune că
                inversarea e "rezervată rezultatului final" — pe un calculator de
                salariu, ăla e netul angajatului, nu costul firmei.

                Coloana "Suportată de" rămâne: e chiar diferența dintre pagina
                asta și un calculator obișnuit de net. La part-time, cine plătește
                diferența de CAS/CASS e întrebarea. */}
            <div className="overflow-hidden rounded border border-stone-300">
              <table className="w-full table-fixed border-collapse text-sm tabular-nums text-stone-700">
                <colgroup>
                  <col />
                  <col className="hidden w-28 sm:table-column" />
                  <col className="w-24 sm:w-28" />
                </colgroup>
                <thead>
                  <tr className="bg-canvas">
                    <th scope="col" className="border-b border-r border-stone-300 px-3 py-3 text-left font-medium">Componentă</th>
                    <th scope="col" className="hidden border-b border-r border-stone-300 px-3 py-3 text-right font-medium sm:table-cell">Suportată de</th>
                    <th scope="col" className="border-b border-stone-300 px-3 py-3 text-right font-medium">Sumă</th>
                  </tr>
                </thead>
                <tbody>
                  <RandRezultat eticheta="Salariu brut" suportatDe={`${rezultat.orePeZi} ore/zi`} valoare={rezAfisat.brut} bold />
                  <RandRezultat eticheta="CAS (pensie – 25%)" suportatDe="angajat" valoare={rezultat.cas} />
                  <RandRezultat eticheta="CASS (sănătate – 10%)" suportatDe="angajat" valoare={rezultat.cass} />
                  <RandRezultat eticheta="Impozit pe venit (10%)" suportatDe="angajat" valoare={rezultat.impozit} />

                  <tr className="bg-stone-900">
                    <th scope="row" className="border-r border-stone-600 px-3 py-3 text-left font-bold text-white">Salariu net</th>
                    <td className="hidden border-r border-stone-600 px-3 py-3 text-right text-white/80 sm:table-cell">în mână</td>
                    <td className="px-3 py-3 text-right font-bold whitespace-nowrap text-white">{fmt(rezultat.netBani)} lei</td>
                  </tr>

                  <RandRezultat eticheta="CAM (contribuția firmei – 2,25%)" suportatDe="firmă" valoare={rezultat.cam} />
                  <RandRezultat eticheta="Diferență CAS până la baza minimă" suportatDe="firmă" valoare={rezultat.diferentaCasAngajator} />
                  <RandRezultat eticheta="Diferență CASS până la baza minimă" suportatDe="firmă" valoare={rezultat.diferentaCassAngajator} />
                  <RandRezultat eticheta="Cost total firmă" suportatDe="brut + taxe" valoare={rezultat.costTotalCuDiferente} bold ultim />
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-stone-600">
              Aproximativ {fmtOre(rezultat.oreLunareEstimate)} ore pe lună · net pe oră{" "}
              {fmt(rezultat.netBani / rezultat.oreLunareEstimate)} lei · cost firmă pe oră{" "}
              {fmt(rezultat.costTotalCuDiferente / rezultat.oreLunareEstimate)} lei
            </p>

            <p className="mt-4 text-sm leading-normal text-stone-600">
              {diferenteAngajator > 0
                ? `Firma completează cu ${fmt(diferenteAngajator)} lei CAS și CASS până la baza minimă de ${fmt(rezultat.bazaMinimaContributii)} lei. Diferența nu se scade din netul tău.`
                : rezAfisat.exceptat
                  ? "Excepția elimină diferența CAS/CASS suportată de firmă. Netul angajatului se calculează din brutul realizat."
                  : "Brutul a ajuns la baza minimă a contribuțiilor, deci firma nu mai completează CAS/CASS."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
