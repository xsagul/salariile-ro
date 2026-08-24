"use client";

// src/app/components/FiltruMeserii.tsx
// Cautare peste lista de meserii de pe /salarii.
//
// De ce lucreaza pe DOM si nu pe stare React: lista celor 123 de meserii e
// randata pe server si trebuie sa RAMANA in HTML, altfel paginile ar deveni
// descoperibile doar cu JavaScript pornit — adica exact problema de indexare
// pe care proiectul a rezolvat-o deja o data. Filtrul doar ascunde carduri
// dintr-o lista care exista oricum. Fara JS, se vad toate; cu JS, se pot
// filtra. Nimic nu se pierde.
//
// Filtrarea se face in handlerul de input, nu intr-un efect: e o actiune
// declansata de utilizator, nu o sincronizare cu un sistem extern.

import { useRef, useState } from "react";

/** Fara diacritice si fara majuscule: „Faianțar" se gaseste si scriind „faiantar". */
function normalizeaza(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[șş]/gi, "s")
    .replace(/[țţ]/gi, "t")
    .toLowerCase();
}

/** Ascunde cardurile care nu se potrivesc. Intoarce cate au ramas vizibile. */
function aplicaFiltrul(termen: string): number {
  const cautat = normalizeaza(termen.trim());
  let vizibile = 0;

  for (const card of document.querySelectorAll<HTMLElement>("[data-cauta]")) {
    const potriveste = !cautat || normalizeaza(card.dataset.cauta ?? "").includes(cautat);
    card.hidden = !potriveste;
    if (potriveste) vizibile++;
  }

  // O sectiune de categorie ramasa fara niciun card vizibil se ascunde si ea,
  // altfel raman titluri urmate de gol.
  for (const sectiune of document.querySelectorAll<HTMLElement>("[data-sectiune-meserii]")) {
    sectiune.hidden = sectiune.querySelector("[data-cauta]:not([hidden])") === null;
  }

  // Scurtaturile catre categorii n-au sens cat timp filtram.
  const scurtaturi = document.querySelector<HTMLElement>("[data-scurtaturi-categorii]");
  if (scurtaturi) scurtaturi.dataset.filtrat = cautat ? "da" : "nu";

  return vizibile;
}

export default function FiltruMeserii({ total }: { total: number }) {
  const [termen, setTermen] = useState("");
  const [gasite, setGasite] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function schimba(valoare: string) {
    setTermen(valoare);
    const vizibile = aplicaFiltrul(valoare);
    setGasite(valoare.trim() ? vizibile : null);
  }

  return (
    <div className="mt-8">
      <label htmlFor="cauta-meserie" className="block text-sm font-medium text-stone-900">
        Caută meseria
      </label>
      <div className="relative mt-2">
        <input
          ref={inputRef}
          id="cauta-meserie"
          type="search"
          value={termen}
          onChange={(e) => schimba(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") schimba("");
          }}
          placeholder="electrician, asistent medical, programator…"
          autoComplete="off"
          className="min-h-11 w-full rounded-md border border-stone-300 bg-surface px-4 py-2.5 pr-12 text-base text-stone-900 shadow-soft outline-none placeholder:text-stone-400 focus-visible:border-stone-900 focus-visible:ring-2 focus-visible:ring-stone-900/20"
          aria-describedby="cauta-meserie-stare"
        />
        {termen && (
          <button
            type="button"
            onClick={() => {
              schimba("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
            aria-label="Șterge căutarea"
          >
            ✕
          </button>
        )}
      </div>
      <p id="cauta-meserie-stare" role="status" aria-live="polite" className="mt-2 text-sm text-stone-600">
        {gasite === null
          ? `${total} de meserii, cu date INS pentru fiecare.`
          : gasite === 0
            ? `Nicio meserie nu se potrivește cu „${termen}”. Încearcă un cuvânt mai scurt.`
            : `${gasite} ${gasite === 1 ? "meserie găsită" : "meserii găsite"}.`}
      </p>
    </div>
  );
}
