"use client";

import { useState } from "react";
import FeedbackContextual from "@/app/components/FeedbackContextual";
import IconCalculeaza from "@/app/components/IconCalculeaza";
import { SPATIU_JOS } from "@/app/components/ui";
import {
  calculeazaIndemnizatieCO,
  calculeazaZileProportionale,
  type RezultatIndemnizatieCO,
  type RezultatZileProportionale,
} from "@/lib/concediu-odihna";
import { deruleazaLaRezultat } from "@/lib/deruleaza-la-rezultat";
import { masoaraCalcul } from "@/lib/analytics";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));
const suma = (n: number | undefined) => (n === undefined ? "—" : `${fmt(n)} lei`);

const fieldLabel = "mb-2 block text-xs font-medium text-stone-600";
const colHeader = "mb-4 border-b border-stone-200 pb-2 text-lg font-medium text-stone-900";
const tabelRezultat = "w-full table-fixed border-collapse text-sm tabular-nums text-stone-700";
const celulaIndicator = "border-b border-r border-stone-300 px-3 py-3 text-left";
const celulaSuma = "border-b border-stone-300 px-3 py-3 text-right whitespace-nowrap";

type ModCalcul = "indemnizatie" | "zile";

type RezultatAfisat =
  | { mod: "indemnizatie"; rez: RezultatIndemnizatieCO; key: string }
  | { mod: "zile"; rez: RezultatZileProportionale; key: string };

function RandRezultat({ eticheta, valoare, ultim = false }: { eticheta: string; valoare: string | undefined; ultim?: boolean }) {
  const b = ultim ? "border-b-0 " : "";
  return (
    <tr>
      <th scope="row" className={`${b}${celulaIndicator} font-normal`}>{eticheta}</th>
      <td className={`${b}${celulaSuma}`}>{valoare ?? "—"}</td>
    </tr>
  );
}

export default function CalculatorConcediuOdihna() {
  const [mod, setMod] = useState<ModCalcul>("indemnizatie");
  const [avansat, setAvansat] = useState(false);

  // Mod 1: Indemnizație
  const [brut, setBrut] = useState("");
  const [zileCO, setZileCO] = useState("");
  const [media3, setMedia3] = useState("");
  const [zileLuna, setZileLuna] = useState("");

  // Mod 2: Zile proporționale & lichidare
  const [luniLucrate, setLuniLucrate] = useState("");
  const [zileAn, setZileAn] = useState("");
  const [zileEfectuate, setZileEfectuate] = useState("");
  const [brutLichidare, setBrutLichidare] = useState("");

  const [eroare, setEroare] = useState<string | null>(null);
  const [rezAfisat, setRezAfisat] = useState<RezultatAfisat | null>(null);

  const cheieCurenta =
    mod === "indemnizatie"
      ? JSON.stringify([mod, brut, zileCO, media3, zileLuna])
      : JSON.stringify([mod, luniLucrate, zileAn, zileEfectuate, brutLichidare]);

  const rezPotrivit = rezAfisat && rezAfisat.mod === mod ? rezAfisat : null;
  const stale = rezPotrivit !== null && rezPotrivit.key !== cheieCurenta;

  const calculeaza = () => {
    if (mod === "indemnizatie") {
      const b = Number(brut);
      const z = Number(zileCO);
      if (!b || b <= 0) {
        setEroare("Introdu salariul brut din contract.");
        return;
      }
      if (!z || z <= 0) {
        setEroare("Introdu numărul de zile de concediu.");
        return;
      }
      setEroare(null);
      const zl = Math.min(23, Math.max(18, Number(zileLuna) || 21));
      const m3 = Number(media3) > 0 ? Number(media3) : b;
      const rez = calculeazaIndemnizatieCO({
        salariuBrutContract: b,
        mediaBruta3Luni: m3,
        zileLucratoareLuna: zl,
        zileConcediu: Math.min(z, zl),
      });
      if (!rez) return;
      setRezAfisat({ mod: "indemnizatie", rez, key: cheieCurenta });
    } else {
      const luni = Number(luniLucrate.replace(",", "."));
      const b = Number(brutLichidare);
      if (!luni || luni <= 0 || luni > 12) {
        setEroare("Introdu lunile lucrate în an (între 1 și 12).");
        return;
      }
      if (!b || b <= 0) {
        setEroare("Introdu salariul brut lunar.");
        return;
      }
      setEroare(null);
      const rez = calculeazaZileProportionale({
        zilePeAn: Math.max(20, Number(zileAn) || 21),
        luniLucrate: luni,
        zileEfectuate: Number(zileEfectuate) || 0,
        salariuBrut: b,
      });
      if (!rez) return;
      setRezAfisat({ mod: "zile", rez, key: cheieCurenta });
    }
    masoaraCalcul("concediu_odihna", { varianta: mod });
    deruleazaLaRezultat("rezultat-co", "calc-co");
  };

  const rezInd = rezPotrivit?.mod === "indemnizatie" ? rezPotrivit.rez : undefined;
  const rezZile = rezPotrivit?.mod === "zile" ? rezPotrivit.rez : undefined;

  return (
    <section className="border-b border-stone-200 bg-canvas" aria-labelledby="calculator-co-titlu">
      <div id="calc-co" className={`mx-auto grid max-w-6xl items-start gap-6 px-4 pt-5 sm:px-6 sm:pt-6 ${SPATIU_JOS} md:grid-cols-5`}>
        <form
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-2"
          onSubmit={(e) => {
            e.preventDefault();
            calculeaza();
          }}
        >
          <h2 id="calculator-co-titlu" className={colHeader}>Datele concediului</h2>

          <div className="mb-5">
            <span className={fieldLabel}>Ce calculezi</span>
            <div className="flex w-full overflow-hidden rounded border border-stone-300">
              {(
                [
                  { id: "indemnizatie", label: "Indemnizație" },
                  { id: "zile", label: "Zile și lichidare" },
                ] as const
              ).map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={mod === item.id}
                  onClick={() => {
                    setMod(item.id);
                    setEroare(null);
                  }}
                  className={`${i > 0 ? "border-l border-stone-300 " : ""}inline-flex min-h-11 flex-1 items-center justify-center px-3 text-sm font-medium transition-colors ${
                    mod === item.id ? "bg-stone-900 text-white" : "bg-surface text-stone-600 hover:bg-canvas"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {mod === "indemnizatie" ? (
            <>
              <div className="mb-5 min-w-0">
                <label htmlFor="co-brut" className={fieldLabel}>Salariu brut lunar</label>
                <div className="flex min-w-0 overflow-hidden rounded border border-stone-300 bg-surface transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
                  <input
                    id="co-brut"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    enterKeyHint="next"
                    value={brut ? fmt(Number(brut)) : ""}
                    placeholder="ex: 6.500"
                    onChange={(e) => {
                      setBrut(e.target.value.replace(/\D/g, ""));
                      if (eroare) setEroare(null);
                    }}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
                  />
                  <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                    lei / lună
                  </span>
                </div>
              </div>

              <div className="mb-5 min-w-0">
                <label htmlFor="co-zile" className={fieldLabel}>Zile de concediu</label>
                <div className="flex min-w-0 overflow-hidden rounded border border-stone-300 bg-surface transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
                  <input
                    id="co-zile"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    enterKeyHint="done"
                    value={zileCO}
                    placeholder="ex: 10"
                    onChange={(e) => {
                      setZileCO(e.target.value.replace(/\D/g, "").slice(0, 2));
                      if (eroare) setEroare(null);
                    }}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
                  />
                  <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                    zile
                  </span>
                </div>
              </div>

              <button
                type="button"
                aria-expanded={avansat}
                aria-controls="optiuni-avansate-co"
                onClick={() => {
                  if (avansat) {
                    setMedia3("");
                    setZileLuna("");
                  }
                  setAvansat(!avansat);
                }}
                className="mb-5 flex min-h-11 w-full items-center justify-center rounded border border-dashed border-stone-300 px-4 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-700"
              >
                {avansat ? "▲ Ascunde opțiuni avansate" : "▼ Bonusuri ultimele 3 luni / zile lună"}
              </button>

              {avansat && (
                <div id="optiuni-avansate-co" className="mb-5 min-w-0">
                  <div className="mb-4 min-w-0">
                    <label htmlFor="co-media3" className={fieldLabel}>Media brută din ultimele 3 luni</label>
                    <div className="flex min-w-0 overflow-hidden rounded border border-stone-300 bg-surface transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
                      <input
                        id="co-media3"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={media3 ? fmt(Number(media3)) : ""}
                        placeholder="ex: 7.500"
                        onChange={(e) => setMedia3(e.target.value.replace(/\D/g, ""))}
                        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
                      />
                      <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                        lei / lună
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-stone-600">Doar dacă ai avut bonusuri sau ore suplimentare.</p>
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="co-zile-luna" className={fieldLabel}>Zile lucrătoare în lună</label>
                    <div className="flex min-w-0 overflow-hidden rounded border border-stone-300 bg-surface transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
                      <input
                        id="co-zile-luna"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={zileLuna}
                        placeholder="ex: 21"
                        onChange={(e) => setZileLuna(e.target.value.replace(/\D/g, "").slice(0, 2))}
                        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
                      />
                      <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                        zile
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-5 min-w-0">
                <label htmlFor="co-brut-lichidare" className={fieldLabel}>Salariu brut lunar</label>
                <div className="flex min-w-0 overflow-hidden rounded border border-stone-300 bg-surface transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
                  <input
                    id="co-brut-lichidare"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={brutLichidare ? fmt(Number(brutLichidare)) : ""}
                    placeholder="ex: 6.500"
                    onChange={(e) => {
                      setBrutLichidare(e.target.value.replace(/\D/g, ""));
                      if (eroare) setEroare(null);
                    }}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
                  />
                  <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                    lei / lună
                  </span>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label htmlFor="co-luni" className={fieldLabel}>Luni lucrate în an</label>
                  <div className="flex min-w-0 overflow-hidden rounded border border-stone-300 bg-surface transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
                    <input
                      id="co-luni"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={luniLucrate}
                      placeholder="ex: 7"
                      onChange={(e) => {
                        setLuniLucrate(e.target.value.replace(/[^0-9.,]/g, "").slice(0, 4));
                        if (eroare) setEroare(null);
                      }}
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
                    />
                    <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-2.5 text-xs font-medium text-stone-600">
                      luni
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <label htmlFor="co-luate" className={fieldLabel}>Zile deja luate</label>
                  <div className="flex min-w-0 overflow-hidden rounded border border-stone-300 bg-surface transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
                    <input
                      id="co-luate"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={zileEfectuate}
                      placeholder="ex: 5"
                      onChange={(e) => setZileEfectuate(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
                    />
                    <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-2.5 text-xs font-medium text-stone-600">
                      zile
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-5 min-w-0">
                <label htmlFor="co-zile-an" className={fieldLabel}>Zile de concediu pe an (în contract)</label>
                <div className="flex min-w-0 overflow-hidden rounded border border-stone-300 bg-surface transition focus-within:border-stone-400 focus-within:shadow-[0_0_6px_rgba(28,25,23,0.12)]">
                  <input
                    id="co-zile-an"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={zileAn}
                    placeholder="ex: 21"
                    onChange={(e) => setZileAn(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base tabular-nums text-stone-900 outline-none"
                  />
                  <span className="flex shrink-0 items-center whitespace-nowrap border-l border-stone-200 px-3 text-xs font-medium text-stone-600">
                    zile / an
                  </span>
                </div>
              </div>
            </>
          )}

          {eroare && (
            <p role="alert" className="mb-4 text-xs font-medium text-stone-900">{eroare}</p>
          )}

          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded bg-stone-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-800 active:translate-y-px"
          >
            <IconCalculeaza />
            Calculează
          </button>
        </form>

        <div
          id="rezultat-co"
          className="min-w-0 rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 md:col-span-3"
          aria-live="polite"
        >
          <h2 className={colHeader}>Rezultat calcul</h2>

          {stale && (
            <p className="mb-4 rounded border border-stone-300 bg-canvas px-3 py-2 text-xs text-stone-600" role="status">
              Ai modificat datele – apasă <strong className="font-medium text-stone-900">Calculează</strong> pentru actualizare.
            </p>
          )}

          <div aria-hidden={!rezPotrivit} className={stale ? "opacity-50 transition-opacity" : "transition-opacity"}>
            {mod === "indemnizatie" ? (
              <>
                <div className="overflow-hidden rounded border border-stone-300">
                  <table aria-label="Calcul indemnizație concediu de odihnă" className={tabelRezultat}>
                    <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                    <thead>
                      <tr className="bg-canvas">
                        <th scope="col" className={`${celulaIndicator} font-medium`}>Indicator</th>
                        <th scope="col" className={`${celulaSuma} font-medium`}>Sumă</th>
                      </tr>
                    </thead>
                    <tbody>
                      <RandRezultat
                        eticheta={rezInd ? `Indemnizație brută (${rezInd.zileConcediu} zile)` : "Indemnizație brută concediu"}
                        valoare={rezInd ? suma(rezInd.brutConcediu) : undefined}
                      />
                      <RandRezultat
                        eticheta={rezInd ? `Salariu brut zile lucrate (${rezInd.zileLucrate} zile)` : "Salariu brut zile lucrate"}
                        valoare={rezInd ? suma(rezInd.brutZileLucrate) : undefined}
                      />
                      <RandRezultat
                        eticheta="Indemnizație netă (partea de concediu)"
                        valoare={rezInd ? suma(rezInd.netConcediuEstimat) : undefined}
                      />
                      <tr className="bg-stone-900 font-bold text-white">
                        <th scope="row" className="border-r border-stone-600 px-3 py-3 text-left">Total net în luna cu concediu</th>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          {rezInd ? <span className="marcaj">{suma(rezInd.netLunaTotal)}</span> : "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {rezInd && (
                  <details className="mt-3 text-sm text-stone-600">
                    <summary className="min-h-11 cursor-pointer py-3 font-medium text-stone-900">Detalii de calcul</summary>
                    <p className="mb-2">
                      Tarif zilnic brut: {rezInd.tarifZilnicAplicat.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei/zi
                      {rezInd.castigaMedia3Luni ? " (media pe 3 luni, mai mare decât baza)." : "."}
                    </p>
                    <p>
                      {rezInd.diferentaNetFataDeNormal > 0
                        ? `În luna aceasta primești cu ${fmt(rezInd.diferentaNetFataDeNormal)} lei net mai mult decât într-o lună obișnuită. `
                        : ""}
                      Pe zilele de concediu de odihnă nu se acordă tichete de masă.
                    </p>
                  </details>
                )}
              </>
            ) : (
              <>
                <div className="overflow-hidden rounded border border-stone-300">
                  <table aria-label="Zile proporționale și compensare la plecare" className={tabelRezultat}>
                    <colgroup><col /><col className="w-28 sm:w-36" /></colgroup>
                    <thead>
                      <tr className="bg-canvas">
                        <th scope="col" className={`${celulaIndicator} font-medium`}>Indicator</th>
                        <th scope="col" className={`${celulaSuma} font-medium`}>Valoare</th>
                      </tr>
                    </thead>
                    <tbody>
                      <RandRezultat
                        eticheta="Zile cuvenite proporțional"
                        valoare={rezZile ? `${rezZile.zileCuveniteRotunjite} zile` : undefined}
                      />
                      <RandRezultat
                        eticheta="Zile rămase neluate"
                        valoare={rezZile ? `${rezZile.zileRamase} zile` : undefined}
                      />
                      <RandRezultat
                        eticheta="Compensare brută la plecare"
                        valoare={rezZile ? suma(rezZile.brutCompensare) : undefined}
                      />
                      <tr className="bg-stone-900 font-bold text-white">
                        <th scope="row" className="border-r border-stone-600 px-3 py-3 text-left">Compensare netă la plecare</th>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          {rezZile ? <span className="marcaj">{suma(rezZile.netCompensareEstimat)}</span> : "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {rezZile && (
                  <details className="mt-3 text-sm text-stone-600">
                    <summary className="min-h-11 cursor-pointer py-3 font-medium text-stone-900">Detalii de calcul</summary>
                    <p>
                      Calcul exact: {rezZile.zileCuveniteExact.toLocaleString("ro-RO", { maximumFractionDigits: 2 })} zile cuvenite.
                      Zilele rămase pot fi plătite în bani doar când se încheie contractul de muncă.
                    </p>
                  </details>
                )}
              </>
            )}
          </div>

          {rezPotrivit && (
            <div className="mt-4">
              <FeedbackContextual context="calcul" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
