"use client";

// Calendarul celor 12 luni de pe Zile libere. Decis de proprietar pe 25 septembrie
// 2026: fără text sub luni, care lungea cardurile; numele sărbătorii apare când pui
// degetul pe ea (sau mouse-ul, pe desktop), iar pe ziua de azi scrie „Azi”.
// Aceleași nume stau oricum în tabelul de deasupra, deci grila e ascunsă de
// cititoarele de ecran.
//
// Ziua de azi vine de la server (src/lib/azi-ro.ts), abia după încărcare: în HTML-ul
// static nu e marcată nicio zi, altfel data build-ului ar rămâne „azi” până la
// următoarea publicare. Lunile trecute se estompează, ca ochiul să ajungă la ce urmează.

import { useEffect, useState } from "react";
import { oraServer, ziRo } from "@/lib/azi-ro";

export type CelulaZi = { day: number; weekend: boolean; name?: string } | null;
export type LunaCalendar = { luna: number; nume: string; cells: CelulaZi[]; lucr: number; libere: number };

const ZILE_SCURT = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];
const CARD = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";
const PATRAT = "inline-block h-3 w-3 rounded-sm";

// Weekendul are fundal propriu, ca legenda să arate ce se vede în grilă.
function ton(c: NonNullable<CelulaZi>) {
  if (c.name) return "bg-stone-900 font-semibold text-white";
  if (c.weekend) return "bg-stone-100 text-stone-600";
  return "text-stone-700";
}

export default function CalendarAn({ an, luni, dataBuild }: { an: number; luni: LunaCalendar[]; dataBuild: string }) {
  const [azi, setAzi] = useState<number | null>(null);
  const [activ, setActiv] = useState<string | null>(null);

  useEffect(() => {
    let viu = true;
    oraServer(new Date(dataBuild).getTime()).then((d) => {
      if (viu && d) setAzi(ziRo(d));
    });
    return () => {
      viu = false;
    };
  }, [dataBuild]);

  // Eticheta deschisă se închide la atingere în afara ei.
  useEffect(() => {
    if (!activ) return;
    const inchide = (e: PointerEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest("[data-eticheta]")) setActiv(null);
    };
    document.addEventListener("pointerdown", inchide);
    return () => document.removeEventListener("pointerdown", inchide);
  }, [activ]);

  const d = azi === null ? null : new Date(azi);
  const anAzi = d?.getUTCFullYear();
  // Lunile dinaintea celei curente, doar în anul în curs. Un an încheiat (pagina 2025)
  // rămâne neestompat: acolo nu e nimic „de urmat”, ar fi doar greu de citit.
  const trecute = d !== null && anAzi === an ? d.getUTCMonth() : 0;
  const ziAzi = d !== null && anAzi === an ? `${d.getUTCMonth() + 1}-${d.getUTCDate()}` : null;

  return (
    <>
      {/* Legendă: fiecare pătrățel arată exact cum apare ziua în grilă. */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-600">
        <span className="flex items-center gap-2"><span className={`${PATRAT} bg-surface ring-1 ring-inset ring-stone-300`} aria-hidden="true" />Zi lucrătoare</span>
        <span className="flex items-center gap-2"><span className={`${PATRAT} bg-stone-100 ring-1 ring-inset ring-stone-300`} aria-hidden="true" />Weekend</span>
        <span className="flex items-center gap-2"><span className={`${PATRAT} bg-stone-900`} aria-hidden="true" />Sărbătoare legală</span>
        {ziAzi ? <span className="flex items-center gap-2"><span className={`${PATRAT} ring-2 ring-inset ring-stone-900`} aria-hidden="true" />Azi</span> : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {luni.map((mo) => (
          <div key={mo.luna} className={`${CARD} transition-opacity ${mo.luna <= trecute ? "opacity-55" : ""}`}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold tracking-[-0.01em] text-stone-900">{mo.nume}</h3>
              <span className="text-xs text-stone-600">{mo.lucr} lucr. · {mo.libere} libere</span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center" aria-hidden="true">
              {ZILE_SCURT.map((z) => (
                <div key={z} className="text-xs font-medium uppercase text-stone-600">{z}</div>
              ))}
              {mo.cells.map((c, i) => {
                if (c === null) return <div key={i} />;
                const cheie = `${mo.luna}-${c.day}`;
                const eAzi = cheie === ziAzi;
                const eticheta = eAzi ? (c.name ? `Azi · ${c.name}` : "Azi") : c.name;
                // Inelul de „azi” iese în afara pătratului negru al unei sărbători, ca să se vadă.
                const inel = eAzi ? (c.name ? "ring-2 ring-stone-900 ring-offset-2 ring-offset-surface" : "ring-2 ring-inset ring-stone-900") : "";
                const clase = `flex h-7 items-center justify-center rounded text-xs tabular-nums ${ton(c)} ${inel}`;
                if (!eticheta) return <div key={i} className={clase}>{c.day}</div>;
                // Eticheta nu iese din card: pe primele două coloane se aliniază la stânga,
                // pe weekend la dreapta.
                const col = i % 7;
                const pos = col <= 1 ? "left-0" : col >= 5 ? "right-0" : "left-1/2 -translate-x-1/2";
                return (
                  <div
                    key={i}
                    data-eticheta=""
                    onClick={() => setActiv(activ === cheie ? null : cheie)}
                    className={`group relative cursor-pointer ${clase}`}
                  >
                    {c.day}
                    <span className={`pointer-events-none absolute bottom-full z-20 mb-1 w-max max-w-56 rounded-md border border-stone-200 bg-surface px-2 py-1 text-left text-xs font-normal text-stone-700 shadow-soft group-hover:block ${activ === cheie ? "block" : "hidden"} ${pos}`}>
                      {eticheta}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
