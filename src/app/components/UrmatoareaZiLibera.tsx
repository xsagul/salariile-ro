"use client";

// Cardurile de lângă tabelul sărbătorilor, fără nimic de completat (decis de
// proprietar pe 25 septembrie 2026, după ce un câmp de dată a încărcat cardul):
//   1. următoarea zi liberă și câte zile ies la rând cu weekendul;
//   2. punțile care urmează: câte zile de concediu iei și câte zile libere obții.
//
// Site-ul e static, deci HTML-ul se generează la publicare, cu data build-ului.
// În browser, cardurile se recalculează pe ziua de azi din România, luată de la
// server de `oraServer` (src/lib/azi-ro.ts).

import { useEffect, useState } from "react";
import { sarbatoriAn } from "@/lib/sarbatori";
import { oraServer, ziRo } from "@/lib/azi-ro";
import { CARD_TITLU } from "@/app/components/ui";

const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
const ZILE = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];
const ZI_MS = 86_400_000;
// Cel mult atâtea zile de concediu pentru o punte: peste, nu mai e punte, e concediu.
const CONCEDIU_MAX = 4;

type Zi = { t: number; nume: string };

function sarbatori(an: number): Zi[] {
  // Calendarul legal e documentat doar pentru 2026 și 2027; pentru alt an, cardul
  // arată ce știe, fără să ghicească date.
  try {
    return Object.entries(sarbatoriAn(an))
      .map(([k, nume]) => {
        const [m, d] = k.split("-").map(Number);
        return { t: Date.UTC(an, m - 1, d), nume };
      })
      .sort((a, b) => a.t - b.t);
  } catch {
    return [];
  }
}

const TOATE = [2026, 2027].flatMap(sarbatori);
const NUME = new Map<number, string>();
for (const z of TOATE) NUME.set(z.t, NUME.has(z.t) ? `${NUME.get(z.t)} / ${z.nume}` : z.nume);
const ULTIMA = TOATE.length ? TOATE[TOATE.length - 1].t : 0;

const ziSapt = (t: number) => new Date(t).getUTCDay();
const eWeekend = (t: number) => ziSapt(t) === 0 || ziSapt(t) === 6;
const liber = (t: number) => eWeekend(t) || NUME.has(t);
const data = (t: number) => `${new Date(t).getUTCDate()} ${LUNI[new Date(t).getUTCMonth()]}`;

// „o zi”, „2 zile”, „20 de zile”: în română, de la 20 în sus numărul cere „de”.
function zile(n: number) {
  if (n === 1) return "o zi";
  const r = n % 100;
  return `${n} ${r === 0 || r >= 20 ? "de " : ""}zile`;
}

// „2–4 decembrie”, „28 noiembrie – 6 decembrie”; anul apare doar când nu e cel curent.
function interval(a: number, b: number, anCurent: number) {
  const an = (t: number) => new Date(t).getUTCFullYear();
  const cuAn = (t: number) => (an(t) !== anCurent ? `${data(t)} ${an(t)}` : data(t));
  if (a === b) return cuAn(a);
  const ma = new Date(a).getUTCMonth(), mb = new Date(b).getUTCMonth();
  return ma === mb && an(a) === an(b) ? `${new Date(a).getUTCDate()}–${cuAn(b)}` : `${an(a) !== an(b) ? data(a) : cuAn(a)} – ${cuAn(b)}`;
}

// Blocul de zile libere legate care conține ziua t.
function bloc(t: number) {
  let s = t, e = t;
  while (liber(s - ZI_MS)) s -= ZI_MS;
  while (liber(e + ZI_MS)) e += ZI_MS;
  return { s, e };
}

// Zilele lucrătoare dintre un bloc și următorul bloc liber, într-o direcție.
function gol(margine: number, pas: number) {
  const zileLucru: number[] = [];
  let t = margine + pas;
  while (!liber(t) && zileLucru.length <= CONCEDIU_MAX) {
    zileLucru.push(t);
    t += pas;
  }
  return { zileLucru, dincolo: t };
}

type Punte = { s: number; e: number; total: number; concediu: number[] };

// Pentru fiecare sărbătoare din timpul săptămânii care urmează: cea mai bună punte
// cu cel mult CONCEDIU_MAX zile de concediu, spre stânga sau spre dreapta.
function punti(azi: number): Punte[] {
  const vazute = new Set<number>();
  const rez: Punte[] = [];
  for (const z of TOATE) {
    if (z.t <= azi || eWeekend(z.t)) continue;
    const b = bloc(z.t);
    if (vazute.has(b.s)) continue;
    vazute.add(b.s);
    const variante: Punte[] = [];
    for (const [margine, pas] of [[b.e, ZI_MS], [b.s, -ZI_MS]] as const) {
      const g = gol(margine, pas);
      if (!g.zileLucru.length || g.zileLucru.length > CONCEDIU_MAX) continue;
      if (g.dincolo > ULTIMA) continue;
      const alt = bloc(g.dincolo);
      const s = Math.min(b.s, alt.s), e = Math.max(b.e, alt.e);
      variante.push({ s, e, total: Math.round((e - s) / ZI_MS) + 1, concediu: [...g.zileLucru].sort((x, y) => x - y) });
    }
    // Cea mai bună: cele mai multe zile libere pe zi de concediu, apoi cea mai lungă.
    variante.sort((x, y) => y.total / y.concediu.length - x.total / x.concediu.length || y.total - x.total);
    if (variante[0] && variante[0].s > azi) rez.push(variante[0]);
  }
  return rez.slice(0, 3);
}

function urmatoarea(azi: number) {
  // Sărbătorile de weekend nu dau o zi liberă în plus, deci nu sunt „următoarea zi liberă”.
  const urm = TOATE.find((z) => z.t > azi && !eWeekend(z.t));
  if (!urm) return null;
  const b = bloc(urm.t);
  return { t: urm.t, nume: NUME.get(urm.t) ?? urm.nume, peste: Math.round((urm.t - azi) / ZI_MS), ...b, total: Math.round((b.e - b.s) / ZI_MS) + 1 };
}

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
  const p = punti(azi);
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
