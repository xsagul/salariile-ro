"use client";

// src/app/components/FormularAnunt.tsx
//
// Formularul de publicare. Doua lucruri deliberate:
//
// 1. SALARIUL E OBLIGATORIU. Butonul e inactiv fara el. Nu e o validare de
//    curtoazie — e singura regula care face hubul sa difere de eJobs.
// 2. Angajatorul vede NETUL pe masura ce tasteaza. Cei mai multi gandesc in
//    brut si nu stiu ce ajunge in mana; aici afla inainte sa publice, iar
//    candidatul vede exact aceeasi cifra.
//
// Nu trimite nimic catre server. Compune un email, iar anuntul se publica
// manual. Asa hubul poate exista inainte de a avea baza de date, iar site-ul
// continua sa nu colecteze nimic de la vizitatori.

import { useMemo, useState } from "react";
import { calculStandard } from "@/lib/fiscal";
import { TIP_CONTRACT, MOD_LUCRU, type ModLucru, type TipContract } from "@/lib/joburi";

const lei = (v: number) => new Intl.NumberFormat("ro-RO").format(Math.round(v));
const ADRESA = "contact@salariile.ro";

export default function FormularAnunt() {
  const [titlu, setTitlu] = useState("");
  const [companie, setCompanie] = useState("");
  const [oras, setOras] = useState("");
  const [brutMin, setBrutMin] = useState("");
  const [brutMax, setBrutMax] = useState("");
  const [tip, setTip] = useState<TipContract>("norma-intreaga");
  const [mod, setMod] = useState<ModLucru>("la-birou");
  const [descriere, setDescriere] = useState("");
  const [contact, setContact] = useState("");

  const nr = (s: string) => {
    const v = Number(s.replace(/[^\d]/g, ""));
    return Number.isFinite(v) && v > 0 ? v : null;
  };
  const min = nr(brutMin);
  const max = nr(brutMax) ?? min;

  const net = useMemo(() => {
    if (min == null || max == null) return null;
    const a = calculStandard(min)?.net;
    const b = calculStandard(max)?.net;
    return a == null || b == null ? null : { a, b };
  }, [min, max]);

  const salariuValid = min != null && max != null && max >= min;
  const gata = salariuValid && titlu.trim() && companie.trim() && oras.trim() && contact.trim();

  const corp = [
    `Titlu: ${titlu}`,
    `Companie: ${companie}`,
    `Localitate: ${oras}`,
    `Salariu brut: ${min} – ${max} lei/lună`,
    `Tip contract: ${TIP_CONTRACT[tip]}`,
    `Mod de lucru: ${MOD_LUCRU[mod]}`,
    `Contact pentru candidați: ${contact}`,
    "",
    "Descriere:",
    descriere,
  ].join("\n");

  const mailto = `mailto:${ADRESA}?subject=${encodeURIComponent(`Anunț: ${titlu || "(fără titlu)"}`)}&body=${encodeURIComponent(corp)}`;

  const camp = "min-h-11 w-full rounded border border-stone-300 bg-surface px-3 text-sm text-stone-900";
  const eticheta = "mb-1 block text-xs font-medium text-stone-500";

  return (
    <div className="rounded-md border border-stone-200 bg-surface p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={eticheta} htmlFor="an-titlu">Titlul postului</label>
          <input id="an-titlu" className={camp} value={titlu} onChange={(e) => setTitlu(e.target.value)}
            placeholder="Electrician mentenanță" />
        </div>
        <div>
          <label className={eticheta} htmlFor="an-companie">Compania</label>
          <input id="an-companie" className={camp} value={companie} onChange={(e) => setCompanie(e.target.value)} />
        </div>
        <div>
          <label className={eticheta} htmlFor="an-oras">Localitatea</label>
          <input id="an-oras" className={camp} value={oras} onChange={(e) => setOras(e.target.value)}
            placeholder="Cluj-Napoca" />
        </div>
        <div>
          <label className={eticheta} htmlFor="an-contact">Unde aplică candidații</label>
          <input id="an-contact" className={camp} value={contact} onChange={(e) => setContact(e.target.value)}
            placeholder="email sau link" />
        </div>
      </div>

      <fieldset className="mt-5 rounded border border-stone-300 bg-canvas p-4">
        <legend className="px-1 text-xs font-medium text-stone-900">Salariul brut lunar — obligatoriu</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={eticheta} htmlFor="an-min">De la (lei)</label>
            <input id="an-min" inputMode="numeric" className={camp} value={brutMin}
              onChange={(e) => setBrutMin(e.target.value)} placeholder="4800" />
          </div>
          <div>
            <label className={eticheta} htmlFor="an-max">Până la (lei)</label>
            <input id="an-max" inputMode="numeric" className={camp} value={brutMax}
              onChange={(e) => setBrutMax(e.target.value)} placeholder="6200" />
          </div>
        </div>

        {net ? (
          <p className="mt-3 text-sm text-stone-700">
            Candidatul va vedea{" "}
            <strong className="text-stone-900">
              {net.a === net.b ? `${lei(net.a)} lei` : `${lei(net.a)} – ${lei(net.b)} lei`} net în mână
            </strong>
            , alături de brutul pe care l-ai scris.
          </p>
        ) : (
          <p className="mt-3 text-sm text-stone-600">
            Fără salariu, anunțul nu se poate publica. Un interval este suficient.
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
        <label className={eticheta} htmlFor="an-descriere">Descrierea rolului</label>
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
