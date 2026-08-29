"use client";

// src/app/components/FormularAnunt.tsx
//
// Formularul de publicare. Trei lucruri deliberate:
//
// 1. SALARIUL E OBLIGATORIU. Butonul e inactiv fara el. Nu e o validare de
//    curtoazie — e singura regula care face hubul sa difere de eJobs.
//
// 2. BRUT SAU NET, la alegerea angajatorului. Jumatate din piata nu gandeste
//    in brut: in HoReCa, retail sau constructii oferta se spune „3.000 in
//    mana". Daca l-am obliga sa converteasca singur, ar gresi sau ar renunta.
//    Il intrebam ce a vrut sa spuna si convertim noi, in ambele sensuri.
//
// 3. TELEFONUL E CONTACTUL PRINCIPAL. Pe OLX, Publi24 si anuntul.ro lumea
//    suna; nimeni nu trimite CV la un bar. Emailul si linkul raman optionale,
//    pentru cine recruteaza altfel.
//
// Nu trimite nimic catre server: compune un email, iar anuntul se publica
// manual. Asa hubul exista inainte de baza de date, iar site-ul continua sa nu
// colecteze nimic de la vizitatori.

import { useMemo, useState } from "react";
import { brutDinNetStandard, calculStandard } from "@/lib/fiscal";
import { TIP_CONTRACT, MOD_LUCRU, type ModLucru, type TipContract } from "@/lib/joburi";
import { localitatiDupaCerere } from "@/lib/localitati";

const lei = (v: number) => new Intl.NumberFormat("ro-RO").format(Math.round(v));
const ADRESA = "contact@salariile.ro";

export default function FormularAnunt() {
  const [titlu, setTitlu] = useState("");
  const [companie, setCompanie] = useState("");
  const [oras, setOras] = useState("");
  const LOCALITATI_OPT = localitatiDupaCerere();
  const [telefon, setTelefon] = useState("");
  const [altContact, setAltContact] = useState("");
  const [sumaMin, setSumaMin] = useState("");
  const [sumaMax, setSumaMax] = useState("");
  const [tipSuma, setTipSuma] = useState<"net" | "brut">("net");
  const [tip, setTip] = useState<TipContract>("norma-intreaga");
  const [mod, setMod] = useState<ModLucru>("la-birou");
  const [descriere, setDescriere] = useState("");

  const nr = (s: string) => {
    const v = Number(s.replace(/[^\d]/g, ""));
    return Number.isFinite(v) && v > 0 ? v : null;
  };
  const min = nr(sumaMin);
  const max = nr(sumaMax) ?? min;

  // Se completeaza celalalt capat, oricare ar fi fost declarat. Suma scrisa de
  // angajator ramane neatinsa — rotunjirea inversa poate misca un leu, iar el
  // trebuie sa vada exact ce a tastat.
  const pereche = useMemo(() => {
    if (min == null || max == null) return null;
    if (tipSuma === "net") {
      const bMin = brutDinNetStandard(min);
      const bMax = brutDinNetStandard(max);
      return bMin && bMax ? { netMin: min, netMax: max, brutMin: bMin, brutMax: bMax } : null;
    }
    const nMin = calculStandard(min)?.net;
    const nMax = calculStandard(max)?.net;
    return nMin != null && nMax != null ? { netMin: nMin, netMax: nMax, brutMin: min, brutMax: max } : null;
  }, [min, max, tipSuma]);

  const salariuValid = min != null && max != null && max >= min;
  const gata = Boolean(salariuValid && titlu.trim() && companie.trim() && oras.trim() && (telefon.trim() || altContact.trim()));

  const interval = (a: number, b: number) => (a === b ? `${lei(a)} lei` : `${lei(a)} – ${lei(b)} lei`);

  const corp = [
    `Titlu: ${titlu}`,
    `Companie: ${companie}`,
    `Localitate: ${LOCALITATI_OPT.find((l) => l.slug === oras)?.nume ?? "—"} (${oras})`,
    `Salariu declarat: ${min} – ${max} lei ${tipSuma}`,
    pereche
      ? tipSuma === "net"
        ? `  (brut calculat: ${pereche.brutMin} – ${pereche.brutMax} lei)`
        : `  (net calculat: ${pereche.netMin} – ${pereche.netMax} lei)`
      : "",
    `Tip contract: ${TIP_CONTRACT[tip]}`,
    `Mod de lucru: ${MOD_LUCRU[mod]}`,
    `Telefon: ${telefon || "—"}`,
    `Alt contact: ${altContact || "—"}`,
    "",
    "Descriere:",
    descriere,
  ]
    .filter(Boolean)
    .join("\n");

  const mailto = `mailto:${ADRESA}?subject=${encodeURIComponent(`Anunț: ${titlu || "(fără titlu)"}`)}&body=${encodeURIComponent(corp)}`;

  const camp = "min-h-11 w-full rounded border border-stone-300 bg-surface px-3 text-sm text-stone-900";
  const eticheta = "mb-1 block text-xs font-medium text-stone-500";

  return (
    <div className="rounded-md border border-stone-200 bg-surface p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={eticheta} htmlFor="an-titlu">Titlul postului</label>
          <input id="an-titlu" className={camp} value={titlu} onChange={(e) => setTitlu(e.target.value)}
            placeholder="Barman" />
        </div>
        <div>
          <label className={eticheta} htmlFor="an-companie">Compania sau localul</label>
          <input id="an-companie" className={camp} value={companie} onChange={(e) => setCompanie(e.target.value)} />
        </div>
        <div>
          <label className={eticheta} htmlFor="an-oras">Localitatea</label>
          {/*
            Listă închisă, nu text liber. Fără localitate normalizată, filtrul de
            distanță nu are pe ce lucra — „Cluj", „cluj napoca" și „Cluj-Napoca"
            ar fi trei orașe diferite, iar anunțul n-ar apărea în raza nimănui.
          */}
          <select id="an-oras" className={camp} value={oras} onChange={(e) => setOras(e.target.value)}>
            <option value="">Alege localitatea…</option>
            {LOCALITATI_OPT.map((l) => (
              <option key={l.slug} value={l.slug}>{l.nume} ({l.judet})</option>
            ))}
          </select>
        </div>
        <div>
          <label className={eticheta} htmlFor="an-tel">Telefon pentru candidați</label>
          <input id="an-tel" type="tel" inputMode="tel" className={camp} value={telefon}
            onChange={(e) => setTelefon(e.target.value)} placeholder="07xx xxx xxx" />
        </div>
      </div>

      <fieldset className="mt-5 rounded border border-stone-300 bg-canvas p-4">
        <legend className="px-1 text-xs font-medium text-stone-900">Salariul lunar — obligatoriu</legend>

        <div className="mb-3 flex gap-1" role="group" aria-label="Suma declarată este">
          {(["net", "brut"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTipSuma(t)} aria-pressed={tipSuma === t}
              className={`min-h-11 rounded px-3 text-sm transition-colors ${
                tipSuma === t
                  ? "bg-stone-900 font-medium text-white"
                  : "border border-stone-300 bg-surface text-stone-900 hover:bg-canvas"
              }`}>
              {t === "net" ? "În mână (net)" : "În contract (brut)"}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={eticheta} htmlFor="an-min">De la (lei)</label>
            <input id="an-min" inputMode="numeric" className={camp} value={sumaMin}
              onChange={(e) => setSumaMin(e.target.value)} placeholder="3000" />
          </div>
          <div>
            <label className={eticheta} htmlFor="an-max">Până la (lei)</label>
            <input id="an-max" inputMode="numeric" className={camp} value={sumaMax}
              onChange={(e) => setSumaMax(e.target.value)} placeholder="3800" />
          </div>
        </div>

        {pereche ? (
          <p className="mt-3 text-sm text-stone-700">
            Candidatul va vedea{" "}
            <strong className="text-stone-900">{interval(pereche.netMin, pereche.netMax)} net în mână</strong>, iar
            în contract{" "}
            <strong className="text-stone-900">{interval(pereche.brutMin, pereche.brutMax)} brut</strong>.
          </p>
        ) : (
          <p className="mt-3 text-sm text-stone-600">
            Fără salariu, anunțul nu se poate publica. Un interval este suficient, iar cealaltă sumă o
            calculăm noi.
          </p>
        )}
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={eticheta} htmlFor="an-tip">Tip contract</label>
          <select id="an-tip" className={camp} value={tip} onChange={(e) => setTip(e.target.value as TipContract)}>
            {Object.entries(TIP_CONTRACT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={eticheta} htmlFor="an-mod">Mod de lucru</label>
          <select id="an-mod" className={camp} value={mod} onChange={(e) => setMod(e.target.value as ModLucru)}>
            {Object.entries(MOD_LUCRU).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className={eticheta} htmlFor="an-alt">Email sau link, dacă preferi (opțional)</label>
        <input id="an-alt" className={camp} value={altContact} onChange={(e) => setAltContact(e.target.value)}
          placeholder="adresa@firma.ro sau link către pagina de cariere" />
      </div>

      <div className="mt-4">
        <label className={eticheta} htmlFor="an-descriere">Ce presupune jobul</label>
        <textarea id="an-descriere" rows={5}
          className="w-full rounded border border-stone-300 bg-surface p-3 text-sm text-stone-900"
          value={descriere} onChange={(e) => setDescriere(e.target.value)} />
      </div>

      <div className="mt-5">
        {gata ? (
          <a href={mailto}
            className="inline-flex min-h-11 items-center rounded bg-stone-900 px-4 text-sm font-medium text-white">
            Trimite anunțul
          </a>
        ) : (
          <span aria-disabled="true"
            className="inline-flex min-h-11 cursor-not-allowed items-center rounded border border-stone-300 bg-canvas px-4 text-sm font-medium text-stone-400">
            Trimite anunțul
          </span>
        )}
        <p className="mt-2 text-xs text-stone-600">
          Se deschide clientul tău de email, cu anunțul completat. Publicarea e gratuită și o facem manual,
          de obicei în aceeași zi.
        </p>
      </div>
    </div>
  );
}
