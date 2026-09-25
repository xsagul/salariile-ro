"use client";

// Cardurile de lângă tabelul sărbătorilor, fără nimic de completat (decis de
// proprietar pe 25 septembrie 2026, după ce un câmp de dată a încărcat cardul):
//   1. următoarea zi liberă și câte zile ies la rând cu weekendul;
//   2. punțile care urmează: câte zile de concediu iei și câte zile libere obții.
// Calculul e în src/lib/punti.ts, comun cu hașura din calendar.
//
// Site-ul e static, deci HTML-ul se generează la publicare, cu data build-ului.
// În browser, cardurile se recalculează pe ziua de azi din România, luată de la
// server de `oraServer` (src/lib/azi-ro.ts).

import { useEffect, useState } from "react";
import { oraServer, ziRo } from "@/lib/azi-ro";
import { ZILE, data, interval, punti, urmatoarea, ziSapt, zile } from "@/lib/punti";
import { CARD_TITLU } from "@/app/components/ui";

const CARD = "rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6";

export default function UrmatoareaZiLibera({ dataBuild }: { dataBuild: string }) {
  const [azi, setAzi] = useState(() => ziRo(new Date(dataBuild)));
  useEffect(() => {
    let activ = true;
    oraServer(new Date(dataBuild).getTime()).then((d) => {
      if (activ && d) setAzi(ziRo(d));
    });
    return () => {
      activ = false;
    };
  }, [dataBuild]);
  const u = urmatoarea(azi);
  const p = punti(azi).slice(0, 3);
  const anAzi = new Date(azi).getUTCFullYear();

  return (
    <div className="flex flex-col gap-6">
      {u ? (
        <div className={CARD}>
          <h2 className={CARD_TITLU}>Următoarea zi liberă</h2>
          <p className="text-2xl font-bold tracking-[-0.02em] text-stone-900">
            {data(u.t)}, {ZILE[ziSapt(u.t)]}
          </p>
          <p className="mt-1.5 text-sm text-stone-600">
            {u.nume} · {u.peste === 1 ? "mâine" : `peste ${zile(u.peste)}`}
          </p>
          {u.total >= 3 ? (
            <p className="mt-1.5 text-sm text-stone-700">
              Cu weekendul: {zile(u.total)} libere la rând, {interval(u.s, u.e, anAzi)}.
            </p>
          ) : null}
        </div>
      ) : null}

      {p.length ? (
        <div className={CARD}>
          <h2 className={CARD_TITLU}>Punțile care urmează</h2>
          <ul className="flex flex-col divide-y divide-stone-100 text-sm">
            {p.map((x) => (
              <li key={x.s} className="py-3 first:pt-0 last:pb-0">
                <p className="font-semibold text-stone-900">
                  {zile(x.total)} libere: {interval(x.s, x.e, anAzi)}
                </p>
                <p className="text-stone-600">
                  {x.concediu.length === 1 ? "o zi de concediu" : `${x.concediu.length} zile de concediu`}: {interval(x.concediu[0], x.concediu[x.concediu.length - 1], anAzi)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
