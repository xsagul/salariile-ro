"use client";

// Cardul de lângă tabelul sărbătorilor: următoarea zi liberă, cât mai e până la ea,
// dacă se leagă cu weekendul și câte mai sunt până la sfârșitul anului.
//
// Site-ul e static, deci HTML-ul se generează la publicare. Randarea de pe server
// folosește data build-ului (primită ca prop, ca hidratarea să iasă identică), iar
// în browser cardul se recalculează imediat pe data de azi a vizitatorului.

import { useEffect, useState } from "react";
import Link from "@/app/components/Link";
import { sarbatoriAn } from "@/lib/sarbatori";
import { CARD_TITLU } from "@/app/components/ui";

const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
const ZILE = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];
const ZI_MS = 86_400_000;

type Zi = { t: number; nume: string };

function sarbatori(an: number): Zi[] {
  // Calendarul legal e documentat doar pentru 2026 și 2027; pentru alt an, cardul
  // arată ce știe, fără să ghicească date.
  let lista: Record<string, string>;
  try {
    lista = sarbatoriAn(an);
  } catch {
    return [];
  }
  return Object.entries(lista)
    .map(([k, nume]) => {
      const [m, d] = k.split("-").map(Number);
      return { t: Date.UTC(an, m - 1, d), nume };
    })
    .sort((a, b) => a.t - b.t);
}

const ziSapt = (t: number) => new Date(t).getUTCDay();
const eWeekend = (t: number) => ziSapt(t) === 0 || ziSapt(t) === 6;
const data = (t: number) => `${new Date(t).getUTCDate()} ${LUNI[new Date(t).getUTCMonth()]}`;

// „o zi”, „2 zile”, „20 de zile”: în română, de la 20 în sus numărul cere „de”.
function zile(n: number, adjectiv = "") {
  const a = adjectiv ? ` ${adjectiv}` : "";
  if (n === 1) return `o zi${adjectiv ? " liberă" : ""}`;
  const r = n % 100;
  return `${n} ${r === 0 || r >= 20 ? "de " : ""}zile${a}`;
}

function calcul(azi: number) {
  const an = new Date(azi).getUTCFullYear();
  const toate = [...sarbatori(an), ...sarbatori(an + 1)];
  const libere = new Set(toate.map((z) => z.t));
  // Sărbătorile de weekend nu dau o zi liberă în plus, deci nu sunt „următoarea zi liberă”.
  const urm = toate.find((z) => z.t >= azi && !eWeekend(z.t));
  if (!urm) return null;
  // Toate sărbătorile din aceeași zi (de ex. Rusalii și Ziua Copilului) apar împreună.
  const nume = toate.filter((z) => z.t === urm.t).map((z) => z.nume).join(" / ");
  // Blocul de zile libere legate: weekend sau sărbătoare, fără întrerupere.
  const liber = (t: number) => eWeekend(t) || libere.has(t);
  let start = urm.t;
  let end = urm.t;
  while (liber(start - ZI_MS)) start -= ZI_MS;
  while (liber(end + ZI_MS)) end += ZI_MS;
  const bloc = Math.round((end - start) / ZI_MS) + 1;
  const anUrm = new Date(urm.t).getUTCFullYear();
  const ramase = new Set(toate.filter((z) => z.t >= urm.t && !eWeekend(z.t) && new Date(z.t).getUTCFullYear() === anUrm).map((z) => z.t)).size;
  return { urm, nume, peste: Math.round((urm.t - azi) / ZI_MS), start, end, bloc, anUrm, ramase };
}

const aziUtc = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

export default function UrmatoareaZiLibera({ dataBuild }: { dataBuild: string }) {
  const [azi, setAzi] = useState(() => aziUtc(new Date(dataBuild)));
  useEffect(() => setAzi(aziUtc(new Date())), []);
  const r = calcul(azi);
  const links = "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600";

  return (
    <div className={`rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 ${links}`}>
      <h2 className={CARD_TITLU}>Următoarea zi liberă</h2>
      {r ? (
        <>
          <p className="text-2xl font-bold tracking-[-0.02em] text-stone-900">
            {data(r.urm.t)}, {ZILE[ziSapt(r.urm.t)]}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {r.nume} · {r.peste === 0 ? "azi" : r.peste === 1 ? "mâine" : `peste ${zile(r.peste)}`}
          </p>
          {r.bloc >= 3 ? (
            <p className="mt-4 text-sm text-stone-700">
              Cu weekendul, ies <strong className="font-semibold text-stone-900">{zile(r.bloc, "libere")} la rând</strong>: {data(r.start)} – {data(r.end)}.
            </p>
          ) : null}
          <p className="mt-1.5 text-sm text-stone-700">
            Până la sfârșitul lui {r.anUrm} {r.ramase === 1 ? "mai e" : "mai sunt"} {zile(r.ramase, "libere")} în timpul săptămânii, cu tot cu aceasta.
          </p>
        </>
      ) : null}
      <ul className="mt-4 flex flex-col gap-1.5 border-t border-stone-100 pt-4 text-sm">
        <li><a href={`/date/calendar/${r?.anUrm === 2027 ? 2027 : 2026}.ics`} download>Adaugă sărbătorile în calendarul tău</a></li>
        <li><Link href="/zile-libere-2027">Zile libere 2027</Link></li>
      </ul>
    </div>
  );
}
