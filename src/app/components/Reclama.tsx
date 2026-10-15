"use client";

// src/app/components/Reclama.tsx
// Un slot de reclamă AdSense pe paginile Next. Contul, unitățile, starea și dimensiunile au un
// singur proprietar: src/lib/reclame.ts. Fără unitate configurată nu randează nimic.
//
// Locul e rezervat din HTML (dimensiune fixă pe lățimea ecranului), deci reclama nu împinge
// pagina când vine. Cererea către AdSense pleacă abia când caseta ajunge la 600 px de ecran:
// prima afișare a paginii nu plătește munca reclamelor de mai jos, iar cele cerute ajung, de
// regulă, să fie văzute. Scriptul AdSense e încărcat de layout-ul public (și pentru CMP).
//
// `pereche` (cerut de proprietar pe 15 octombrie 2026): pe lățimea întreagă a paginii, de la
// `md`, două casete una lângă alta în loc de una singură în mijlocul unui rând de ~1.100 px.
// Locul celei de-a doua e rezervat din HTML (doar pe PC, prin CSS), dar caseta propriu-zisă se
// pune în pagină abia după ce browserul confirmă lățimea. Pe telefon nu există deloc: AdSense
// umple casetele în ordinea din pagină, iar una ascunsă, fără lățime, ar opri și cererile pentru
// toate casetele de după ea.

import { useEffect, useRef } from "react";
import {
  ADSENSE_CLIENT,
  CLASA_ETICHETA_RECLAMA,
  CLASA_INS_RECLAMA,
  CLASA_SLOT_RECLAMA,
  ETICHETA_RECLAMA,
  unitate,
  type PlasareReclama,
} from "@/lib/reclame";

type FereastraCuAdsense = Window & { adsbygoogle?: { push: (o: object) => void } };

/** De la `md` (768 px) încap două casete de 336 px cu 24 px între ele, în marginile paginii. */
const PE_PC = "(min-width: 768px)";

export default function Reclama({
  plasare,
  className = "",
  pereche = false,
}: {
  plasare: PlasareReclama;
  className?: string;
  /** Pe PC, a doua casetă lângă prima. Numai pe lățimea întreagă a paginii, nu într-o coloană. */
  pereche?: boolean;
}) {
  const id = unitate(plasare);
  const slot = useRef<HTMLElement>(null);
  const locPereche = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aside = slot.current;
    if (!aside || !id) return;

    const loc = locPereche.current;
    if (pereche && loc && !loc.firstChild && window.matchMedia(PE_PC).matches) {
      const aDoua = document.createElement("ins");
      aDoua.className = CLASA_INS_RECLAMA;
      aDoua.style.display = "inline-block";
      aDoua.dataset.adClient = ADSENSE_CLIENT;
      aDoua.dataset.adSlot = id;
      loc.appendChild(aDoua);
    }

    const cere = (ins: HTMLElement) => {
      // AdSense aruncă eroare dacă aceeași casetă e cerută de două ori.
      if (ins.dataset.adsbygoogleStatus || ins.dataset.cerut) return;
      ins.dataset.cerut = "1";
      try {
        const w = window as FereastraCuAdsense;
        (w.adsbygoogle = w.adsbygoogle || ([] as unknown as { push: (o: object) => void })).push({});
      } catch {
        // Blocat de un ad blocker sau scriptul n-a ajuns: caseta rămâne goală, pagina merge la fel.
      }
    };
    const casete = Array.from(aside.querySelectorAll<HTMLElement>("ins.adsbygoogle"));
    if (!("IntersectionObserver" in window)) {
      casete.forEach(cere);
      return;
    }
    const observator = new IntersectionObserver(
      (intrari) => {
        for (const i of intrari) {
          if (!i.isIntersecting) continue;
          observator.unobserve(i.target);
          cere(i.target as HTMLElement);
        }
      },
      { rootMargin: "600px 0px" },
    );
    casete.forEach((ins) => observator.observe(ins));
    return () => observator.disconnect();
  }, [id, pereche]);

  if (!id) return null;
  return (
    <aside ref={slot} aria-label={ETICHETA_RECLAMA} className={`${CLASA_SLOT_RECLAMA} ${className}`} data-reclama={plasare}>
      <span className={CLASA_ETICHETA_RECLAMA}>{ETICHETA_RECLAMA}</span>
      <div className="flex justify-center gap-6">
        <ins
          className={CLASA_INS_RECLAMA}
          style={{ display: "inline-block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={id}
        />
        {pereche && <div ref={locPereche} className="hidden h-[280px] w-[336px] shrink-0 md:block" data-loc-pereche />}
      </div>
    </aside>
  );
}

// Un slot pe lățimea paginii, între un bloc care se termină cu SPATIU_JOS și o secțiune care
// începe cu linia ei. Fără unitate nu lasă nici spațiul gol în urmă.
function PeLatimePaginii({ plasare }: { plasare: PlasareReclama }) {
  if (!unitate(plasare)) return null;
  return (
    <div className="mx-auto max-w-6xl px-4 pb-[38px] sm:px-6 sm:pb-[42px]">
      <Reclama plasare={plasare} pereche />
    </div>
  );
}

/** Sub un calculator, înaintea primei secțiuni de text. */
export function ReclamaSubCalculator() {
  return <PeLatimePaginii plasare="calculator" />;
}

/** Între două secțiuni ale unei pagini de conținut (de exemplu, înaintea întrebărilor frecvente). */
export function ReclamaIntreSectiuni() {
  return <PeLatimePaginii plasare="continut" />;
}
