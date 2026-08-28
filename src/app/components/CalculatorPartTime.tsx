"use client";

import { useMemo, useState } from "react";
import {
  calculeazaPartTime,
  salariuMinimPartTime,
  type InputState,
} from "@/lib/fiscal";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
const fmtOre = (n: number) =>
  new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 }).format(n);

const EXCEPTII = [
  { value: "", label: "Nu se aplică nicio excepție" },
  { value: "student", label: "Elev sau student, până la 26 de ani" },
  { value: "ucenic", label: "Ucenic, până la 18 ani" },
  { value: "dizabilitate", label: "Dizabilitate / drept legal la program redus" },
  { value: "pensionar", label: "Pensionar pentru limită de vârstă" },
  { value: "contracte", label: "Mai multe contracte, cumulat cel puțin minimul" },
] as const;

export default function CalculatorPartTime() {
  const [orePeZi, setOrePeZi] = useState(4);
  const [brut, setBrut] = useState(String(salariuMinimPartTime(4)));
  const [exceptie, setExceptie] = useState("");
  const [functieDeBaza, setFunctieDeBaza] = useState(true);
  const [persoane, setPersoane] = useState(0);
  const [sub26, setSub26] = useState(false);

  const rezultat = useMemo(() => {
    const input: InputState = {
      brut,
      tichete: "0",
      functieDeBAza: functieDeBaza,
      persoanePretretinere: persoane,
      varstaSub26: sub26,
      copiiScolarizati: 0,
      scutitImpozit: false,
      normaContract: "partiala",
    };
    return calculeazaPartTime(input, {
      orePeZi,
      exceptatBazaMinima: Boolean(exceptie),
    });
  }, [brut, exceptie, functieDeBaza, orePeZi, persoane, sub26]);

  const schimbaOrele = (ore: number) => {
    setOrePeZi(ore);
    setBrut(String(salariuMinimPartTime(ore)));
  };

  const minimProportional = salariuMinimPartTime(orePeZi);
  const brutNumeric = Number(brut);
  const subMinimulLegal = brutNumeric > 0 && brutNumeric < minimProportional;
  const diferenteAngajator = rezultat
    ? rezultat.diferentaCasAngajator + rezultat.diferentaCassAngajator
    : 0;

  return (
    <section className="border-b border-stone-200 bg-canvas py-8 sm:py-10" aria-labelledby="calculator-part-time">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-5">
        <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6 lg:col-span-2">
          <h2 id="calculator-part-time" className="text-xl font-bold tracking-[-0.02em] text-stone-900">
            Datele contractului
          </h2>
          <p className="mt-2 text-sm leading-normal text-stone-600">
            Calcul pentru un contract activ toată luna, în perioada iulie–decembrie 2026.
          </p>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-stone-900">Ore lucrate pe zi</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[2, 4, 6].map((ore) => (
                <button
                  key={ore}
                  type="button"
                  aria-pressed={orePeZi === ore}
                  onClick={() => schimbaOrele(ore)}
                  className={`min-h-11 rounded border px-3 text-sm font-medium transition-colors ${
                    orePeZi === ore
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 bg-surface text-stone-900 hover:border-stone-500"
                  }`}
                >
                  {ore} ore
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-5">
            <label htmlFor="part-time-brut" className="text-sm font-medium text-stone-900">
              Salariu brut lunar
            </label>
            <div className="mt-2 flex overflow-hidden rounded border border-stone-300 bg-white focus-within:border-stone-500 focus-within:shadow-[0_0_0_6px_rgba(214,211,209,0.28)]">
              <input
                id="part-time-brut"
                inputMode="numeric"
                pattern="[0-9]*"
                value={brut ? fmt(Number(brut)) : ""}
                aria-invalid={subMinimulLegal}
                aria-describedby="part-time-brut-ajutor"
                onChange={(event) => setBrut(event.target.value.replace(/\D/g, ""))}
                className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-base tabular-nums text-stone-900 outline-none"
              />
              <span className="flex min-h-12 items-center border-l border-stone-300 px-3 text-sm text-stone-600">lei</span>
            </div>
            <p id="part-time-brut-ajutor" className={`mt-2 text-xs leading-normal ${subMinimulLegal ? "font-medium text-stone-900" : "text-stone-600"}`}>
              {subMinimulLegal
                ? `Sub minimul proporțional de ${fmt(minimProportional)} lei brut pentru ${orePeZi} ore/zi.`
                : `Minimul proporțional pentru ${orePeZi} ore/zi este ${fmt(minimProportional)} lei brut.`}
            </p>
          </div>

          <div className="mt-5">
            <label htmlFor="exceptie-part-time" className="text-sm font-medium text-stone-900">
              Excepție de la baza minimă CAS/CASS
            </label>
            <select
              id="exceptie-part-time"
              value={exceptie}
              onChange={(event) => setExceptie(event.target.value)}
              className="mt-2 min-h-12 w-full rounded border border-stone-300 bg-white px-3 text-base text-stone-900 outline-none focus:border-stone-500 focus:shadow-[0_0_0_6px_rgba(214,211,209,0.28)]"
            >
              {EXCEPTII.map((optiune) => (
                <option key={optiune.value} value={optiune.value}>{optiune.label}</option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-normal text-stone-600">
              Selecția simulează efectul fiscal. Excepția trebuie susținută cu documentele cerute de lege.
            </p>
          </div>

          <details className="mt-5 border-t border-stone-200 pt-4">
            <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-stone-900">
              Deducere personală
            </summary>
            <div className="space-y-4 pt-3">
              <label className="flex min-h-11 items-center gap-3 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={functieDeBaza}
                  onChange={(event) => setFunctieDeBaza(event.target.checked)}
                  className="h-5 w-5 accent-stone-900"
                />
                Contractul este la funcția de bază
              </label>
              <label className="flex min-h-11 items-center gap-3 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={sub26}
                  onChange={(event) => setSub26(event.target.checked)}
                  className="h-5 w-5 accent-stone-900"
                />
                Am sub 26 de ani
              </label>
              <div>
                <label htmlFor="persoane-part-time" className="text-sm text-stone-700">Persoane în întreținere</label>
                <select
                  id="persoane-part-time"
                  value={persoane}
                  onChange={(event) => setPersoane(Number(event.target.value))}
                  className="mt-2 min-h-11 w-full rounded border border-stone-300 bg-white px-3 text-base text-stone-900"
                >
                  {[0, 1, 2, 3, 4].map((nr) => <option key={nr} value={nr}>{nr === 4 ? "4 sau mai multe" : nr}</option>)}
                </select>
              </div>
            </div>
          </details>
        </div>

        <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6 lg:col-span-3" aria-live="polite">
          {rezultat ? (
            <>
              <p className="text-xs uppercase tracking-wide text-stone-600">Primești în mână</p>
              <p className="mt-1 text-4xl font-bold tracking-[-0.03em] tabular-nums text-stone-900">
                {fmt(rezultat.netBani)} lei net
              </p>
              <p className="mt-2 text-sm text-stone-600">
                {orePeZi} ore/zi · aproximativ {fmtOre(rezultat.oreLunareEstimate)} ore/lună · {fmt(brutNumeric)} lei brut
              </p>

              <div className="mt-6 grid gap-px overflow-hidden rounded border border-stone-200 bg-stone-200 sm:grid-cols-3">
                <div className="bg-canvas p-4">
                  <p className="text-xs text-stone-600">Cost total firmă</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-stone-900">{fmt(rezultat.costTotalCuDiferente)} lei</p>
                </div>
                <div className="bg-canvas p-4">
                  <p className="text-xs text-stone-600">Net pe oră</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-stone-900">
                    {fmt(Math.round(rezultat.netBani / rezultat.oreLunareEstimate))} lei
                  </p>
                </div>
                <div className="bg-canvas p-4">
                  <p className="text-xs text-stone-600">Cost firmă pe oră</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-stone-900">
                    {fmt(Math.round(rezultat.costTotalCuDiferente / rezultat.oreLunareEstimate))} lei
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto rounded border border-stone-300">
                <table className="w-full min-w-[30rem] border-collapse text-sm tabular-nums">
                  <thead>
                    <tr className="bg-canvas text-stone-700">
                      <th scope="col" className="border-b border-stone-300 px-3 py-3 text-left font-medium">Componentă</th>
                      <th scope="col" className="border-b border-stone-300 px-3 py-3 text-right font-medium">Cine o suportă</th>
                      <th scope="col" className="border-b border-stone-300 px-3 py-3 text-right font-medium">Sumă</th>
                    </tr>
                  </thead>
                  <tbody className="[&_td]:border-b [&_td]:border-stone-100 [&_td]:px-3 [&_td]:py-3 [&_th]:border-b [&_th]:border-stone-100 [&_th]:px-3 [&_th]:py-3">
                    <tr><th scope="row" className="text-left font-normal text-stone-600">CAS</th><td className="text-right text-stone-600">angajat</td><td className="text-right text-stone-900">{fmt(rezultat.cas)} lei</td></tr>
                    <tr><th scope="row" className="text-left font-normal text-stone-600">CASS</th><td className="text-right text-stone-600">angajat</td><td className="text-right text-stone-900">{fmt(rezultat.cass)} lei</td></tr>
                    <tr><th scope="row" className="text-left font-normal text-stone-600">Impozit pe venit</th><td className="text-right text-stone-600">angajat</td><td className="text-right text-stone-900">{fmt(rezultat.impozit)} lei</td></tr>
                    <tr><th scope="row" className="text-left font-normal text-stone-600">CAM</th><td className="text-right text-stone-600">firmă</td><td className="text-right text-stone-900">{fmt(rezultat.cam)} lei</td></tr>
                    <tr><th scope="row" className="text-left font-normal text-stone-600">Diferență CAS</th><td className="text-right text-stone-600">firmă</td><td className="text-right text-stone-900">{fmt(rezultat.diferentaCasAngajator)} lei</td></tr>
                    <tr><th scope="row" className="text-left font-normal text-stone-600">Diferență CASS</th><td className="text-right text-stone-600">firmă</td><td className="text-right text-stone-900">{fmt(rezultat.diferentaCassAngajator)} lei</td></tr>
                    <tr className="bg-stone-900 text-white"><th scope="row" className="border-b-0 text-left font-bold">Cost total firmă</th><td className="border-b-0 text-right text-white/80">brut + taxe firmă</td><td className="border-b-0 text-right font-bold">{fmt(rezultat.costTotalCuDiferente)} lei</td></tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-sm leading-normal text-stone-600">
                {diferenteAngajator > 0
                  ? `Firma completează cu ${fmt(diferenteAngajator)} lei CAS și CASS până la baza minimă de ${fmt(rezultat.bazaMinimaContributii)} lei. Această diferență nu se scade din netul tău.`
                  : exceptie
                    ? "Excepția elimină diferența CAS/CASS suportată de firmă. Netul angajatului se calculează la fel, din brutul realizat."
                    : "Brutul a ajuns la baza minimă a contribuțiilor, deci firma nu mai are o diferență CAS/CASS de completat."}
              </p>
            </>
          ) : (
            <p className="text-sm text-stone-600">Introdu un salariu brut mai mare decât zero pentru calcul.</p>
          )}
        </div>
      </div>
    </section>
  );
}
