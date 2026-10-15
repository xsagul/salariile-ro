"use client";

// src/app/components/Reclama.tsx
// Un slot de reclamă AdSense pe paginile Next. Contul, unitățile, starea și dimensiunile au un
// singur proprietar: src/lib/reclame.ts. Fără unitate configurată nu randează nimic.
//
// Locul e rezervat din HTML (dimensiune fixă pe lățimea ecranului), deci reclama nu împinge
// pagina când vine. Cererea către AdSense pleacă abia când slotul ajunge la 600 px de ecran:
// prima afișare a paginii nu plătește munca reclamelor de mai jos, iar cele cerute ajung, de
// regulă, să fie văzute. Scriptul AdSense e încărcat de layout-ul public (și pentru CMP).

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

export default function Reclama({ plasare, className = "" }: { plasare: PlasareReclama; className?: string }) {
  const id = unitate(plasare);
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    const ins = ref.current;
    if (!ins) return;
    const cere = () => {
      // AdSense aruncă eroare dacă aceeași unitate e cerută de două ori.
      if (ins.dataset.adsbygoogleStatus) return;
      try {
        const w = window as FereastraCuAdsense;
        (w.adsbygoogle = w.adsbygoogle || ([] as unknown as { push: (o: object) => void })).push({});
      } catch {
        // Blocat de un ad blocker sau scriptul n-a ajuns: slotul rămâne gol, pagina merge la fel.
      }
    };
    if (!("IntersectionObserver" in window)) {
      cere();
      return;
    }
    const observator = new IntersectionObserver(
      (intrari) => {
        if (!intrari.some((i) => i.isIntersecting)) return;
        observator.disconnect();
        cere();
      },
      { rootMargin: "600px 0px" },
    );
    observator.observe(ins);
    return () => observator.disconnect();
  }, []);

  if (!id) return null;
  return (
    <aside aria-label={ETICHETA_RECLAMA} className={`${CLASA_SLOT_RECLAMA} ${className}`} data-reclama={plasare}>
      <span className={CLASA_ETICHETA_RECLAMA}>{ETICHETA_RECLAMA}</span>
      <ins
        ref={ref}
        className={CLASA_INS_RECLAMA}
        style={{ display: "inline-block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={id}
      />
    </aside>
  );
}

// Un slot pe lățimea paginii, între un bloc care se termină cu SPATIU_JOS și o secțiune care
// începe cu linia ei. Fără unitate nu lasă nici spațiul gol în urmă.
function PeLatimePaginii({ plasare }: { plasare: PlasareReclama }) {
  if (!unitate(plasare)) return null;
  return (
    <div className="mx-auto max-w-6xl px-4 pb-[38px] sm:px-6 sm:pb-[42px]">
      <Reclama plasare={plasare} />
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
