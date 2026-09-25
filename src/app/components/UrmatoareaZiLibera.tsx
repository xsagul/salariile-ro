"use client";

// Cardul de lângă tabelul sărbătorilor. Răspunde la două întrebări pe care le vedem
// în Search Console pe /zile-libere-2026 (26 septembrie 2026): „e zi liberă pe…?”
// („20 iulie zi liberă”, „21 mai 2026 zi liberă”, „este zi liberă azi”) și când
// vine următoarea zi liberă, cu câte zile iese la rând cu weekendul.
//
// Site-ul e static, deci HTML-ul se generează la publicare. Randarea de pe server
// folosește data build-ului (primită ca prop, ca hidratarea să iasă identică), iar
// în browser cardul se recalculează imediat pe data de azi a vizitatorului.

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "@/app/components/Link";
import { sarbatoriAn } from "@/lib/sarbatori";
import { masoaraCalcul } from "@/lib/analytics";
import { CARD_TITLU } from "@/app/components/ui";

const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
const ZILE = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];
const ZI_MS = 86_400_000;
const ANI = [2026, 2027];

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

const TOATE = ANI.flatMap(sarbatori);
const NUME = new Map<number, string>();
for (const z of TOATE) NUME.set(z.t, NUME.has(z.t) ? `${NUME.get(z.t)} / ${z.nume}` : z.nume);

const ziSapt = (t: number) => new Date(t).getUTCDay();
const eWeekend = (t: number) => ziSapt(t) === 0 || ziSapt(t) === 6;
const liber = (t: number) => eWeekend(t) || NUME.has(t);
const data = (t: number) => `${new Date(t).getUTCDate()} ${LUNI[new Date(t).getUTCMonth()]}`;
const an = (t: number) => new Date(t).getUTCFullYear();
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const dinIso = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const aziUtc = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
const abonare = () => () => {};

// „o zi”, „2 zile”, „20 de zile”: în română, de la 20 în sus numărul cere „de”.
function zile(n: number) {
  if (n === 1) return "o zi";
  const r = n % 100;
  return `${n} ${r === 0 || r >= 20 ? "de " : ""}zile`;
}

function raspuns(t: number) {
  const an = new Date(t).getUTCFullYear();
  if (!ANI.includes(an)) return { liber: null, text: "Avem calendarul legal pentru 2026 și 2027." };
  const nume = NUME.get(t);
  const zi = ZILE[ziSapt(t)];
  if (nume && eWeekend(t)) return { liber: true, text: `Da, e ${zi} și ${nume}. Pică în weekend, deci nu primești o zi liberă în plus.` };
  if (nume) return { liber: true, text: `Da, e sărbătoare legală: ${nume}.` };
  if (eWeekend(t)) return { liber: true, text: `Da, e ${zi}, zi de weekend.` };
  return { liber: false, text: `Nu, e ${zi}, zi lucrătoare.` };
}

function urmatoarea(azi: number) {
  // Sărbătorile de weekend nu dau o zi liberă în plus, deci nu sunt „următoarea zi liberă”.
  const urm = TOATE.find((z) => z.t > azi && !eWeekend(z.t));
  if (!urm) return null;
  let start = urm.t;
  let end = urm.t;
  while (liber(start - ZI_MS)) start -= ZI_MS;
  while (liber(end + ZI_MS)) end += ZI_MS;
  return { t: urm.t, nume: NUME.get(urm.t) ?? urm.nume, peste: Math.round((urm.t - azi) / ZI_MS), start, end, bloc: Math.round((end - start) / ZI_MS) + 1 };
}

export default function UrmatoareaZiLibera({ dataBuild }: { dataBuild: string }) {
  // Pe server, data build-ului; în browser, ziua de azi. Numărul e același toată
  // ziua, deci React nu re-randează în buclă.
  const azi = useSyncExternalStore(
    abonare,
    () => aziUtc(new Date()),
    () => aziUtc(new Date(dataBuild)),
  );
  const [ales, setAles] = useState<number | null>(null);
  const masurat = useRef(false);

  const zi = ales ?? azi;
  const r = raspuns(zi);
  const u = urmatoarea(azi);
  const links = "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600";

  return (
    <div className={`rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 ${links}`}>
      <h2 className={CARD_TITLU}>E zi liberă?</h2>
      <label htmlFor="zi-libera-data" className="block text-sm text-stone-600">Alege o zi</label>
      <input
        id="zi-libera-data"
        type="date"
        min="2026-01-01"
        max="2027-12-31"
        value={iso(zi)}
        onChange={(e) => {
          if (!e.target.value) return;
          setAles(dinIso(e.target.value));
          if (!masurat.current) {
            masurat.current = true;
            masoaraCalcul("zi_libera");
          }
        }}
        className="mt-1.5 min-h-11 w-full rounded border border-stone-300 bg-surface px-3 text-base text-stone-900"
      />
      <p className="mt-3 text-sm text-stone-700" aria-live="polite">
        <strong className="font-semibold text-stone-900">{ales === null && zi === azi ? `Azi, ${data(zi)}: ` : `${data(zi)}${an(zi) !== an(azi) ? ` ${an(zi)}` : ""}: `}</strong>
        {r.text}
      </p>

      {u ? (
        <div className="mt-4 border-t border-stone-100 pt-4">
          <p className="text-sm text-stone-600">Următoarea zi liberă</p>
          <p className="text-lg font-bold tracking-[-0.01em] text-stone-900">
            {data(u.t)}, {ZILE[ziSapt(u.t)]}
          </p>
          <p className="text-sm text-stone-600">
            {u.nume} · {u.peste === 1 ? "mâine" : `peste ${zile(u.peste)}`}
          </p>
          {u.bloc >= 3 ? (
            <p className="mt-1.5 text-sm text-stone-700">
              Cu weekendul ies {zile(u.bloc)} libere la rând: {data(u.start)} – {data(u.end)}.
            </p>
          ) : null}
        </div>
      ) : null}

      <ul className="mt-4 flex flex-col gap-1.5 border-t border-stone-100 pt-4 text-sm">
        <li><a href="/date/calendar/2026.ics" download>Adaugă sărbătorile 2026 în calendarul tău</a></li>
        <li><Link href="/zile-libere-2027">Zile libere 2027</Link></li>
      </ul>
    </div>
  );
}
