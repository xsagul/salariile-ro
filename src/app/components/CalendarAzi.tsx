"use client";

// Ziua de azi și lunile trecute în calendarul de pe Zile libere (cerut de
// proprietar pe 25 septembrie 2026): ochiul ajunge direct la ce urmează.
//
// Grila rămâne randată pe server; componenta scrie doar o regulă CSS pe
// atributele `data-zi` și `data-luna` ale calendarului. În HTML-ul static nu
// apare nimic: data build-ului ar marca o zi greșită până la următoarea
// publicare, deci marcajul vine abia după ce serverul spune ce zi e.

import { useEffect, useState } from "react";
import { oraServer, ziRo } from "@/lib/azi-ro";

export default function CalendarAzi({ an, dataBuild }: { an: number; dataBuild: string }) {
  const [azi, setAzi] = useState<number | null>(null);
  useEffect(() => {
    let activ = true;
    oraServer(new Date(dataBuild).getTime()).then((d) => {
      if (activ && d) setAzi(ziRo(d));
    });
    return () => {
      activ = false;
    };
  }, [dataBuild]);
  if (azi === null) return null;

  const d = new Date(azi);
  const anAzi = d.getUTCFullYear();
  // Lunile dinaintea celei curente; toate, dacă anul calendarului a trecut.
  const trecute = anAzi > an ? 12 : anAzi < an ? 0 : d.getUTCMonth();
  const reguli = Array.from({ length: trecute }, (_, m) => `[data-luna="${m + 1}"]`);
  const ziua = anAzi === an ? d.toISOString().slice(0, 10) : null;

  return (
    <>
      <style>
        {`${reguli.length ? `${reguli.join(",")}{opacity:.55}` : ""}
${ziua ? `[data-zi="${ziua}"]{box-shadow:inset 0 0 0 2px var(--color-stone-900)}[data-zi="${ziua}"][data-sarbatoare]{box-shadow:0 0 0 2px var(--color-surface),0 0 0 4px var(--color-stone-900)}` : ""}`}
      </style>
      {ziua ? (
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm ring-2 ring-inset ring-stone-900" aria-hidden="true" />
          Azi
        </span>
      ) : null}
    </>
  );
}
