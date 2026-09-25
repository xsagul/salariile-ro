// Zilele libere legate și punțile, calculate din calendarul legal (src/lib/sarbatori.ts),
// pentru cardurile de lângă tabelul sărbătorilor. Calendarul nu marchează punțile:
// o hașură a fost încercată și scoasă pe 25 septembrie 2026 (proprietar), cardul le
// arată deja, iar „punți 2026” nu are volum de căutare măsurabil în SE Ranking.
//
// Zilele sunt momente UTC la miezul nopții: `Date.UTC(an, luna, zi)`.

import { ANI_CALENDAR, sarbatoriAn } from "@/lib/sarbatori";

export const ZI_MS = 86_400_000;
const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
export const ZILE = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];

type Zi = { t: number; nume: string };

function sarbatori(an: number): Zi[] {
  // Calendarul legal e publicat doar pentru ANI_CALENDAR; pentru alt an, arătăm ce
  // știm, fără să ghicim date.
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

const TOATE = ANI_CALENDAR.flatMap(sarbatori);
const NUME = new Map<number, string>();
for (const z of TOATE) NUME.set(z.t, NUME.has(z.t) ? `${NUME.get(z.t)} / ${z.nume}` : z.nume);
// Dincolo de anii documentați nu știm sărbătorile, deci nu știm nici punțile.
const PRIMA = TOATE.length ? Date.UTC(new Date(TOATE[0].t).getUTCFullYear(), 0, 1) : 0;
const ULTIMA = TOATE.length ? TOATE[TOATE.length - 1].t : 0;

export const ziSapt = (t: number) => new Date(t).getUTCDay();
const eWeekend = (t: number) => ziSapt(t) === 0 || ziSapt(t) === 6;
const liber = (t: number) => eWeekend(t) || NUME.has(t);
export const data = (t: number) => `${new Date(t).getUTCDate()} ${LUNI[new Date(t).getUTCMonth()]}`;

// „o zi”, „2 zile”, „20 de zile”: în română, de la 20 în sus numărul cere „de”.
export function zile(n: number) {
  if (n === 1) return "o zi";
  const r = n % 100;
  return `${n} ${r === 0 || r >= 20 ? "de " : ""}zile`;
}

// „2–4 decembrie”, „28 noiembrie – 6 decembrie”; anul apare doar când nu e cel curent.
export function interval(a: number, b: number, anCurent: number) {
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
function gol(margine: number, pas: number, max: number) {
  const zileLucru: number[] = [];
  let t = margine + pas;
  while (!liber(t) && zileLucru.length <= max) {
    zileLucru.push(t);
    t += pas;
  }
  return { zileLucru, dincolo: t };
}

export type Punte = { s: number; e: number; total: number; concediu: number[] };

// Pentru fiecare sărbătoare din timpul săptămânii de după `dupa`: cea mai bună punte
// cu cel mult `concediuMax` zile de concediu, spre stânga sau spre dreapta. Peste
// patru zile nu mai e punte, e concediu. Două sărbători care duc la aceeași punte
// (Anul Nou și Boboteaza, prin 5 ianuarie 2026) o dau o singură dată.
export function punti(dupa: number, concediuMax = 4): Punte[] {
  const vazute = new Set<number>();
  const gasite = new Set<string>();
  const rez: Punte[] = [];
  for (const z of TOATE) {
    if (z.t <= dupa || eWeekend(z.t)) continue;
    const b = bloc(z.t);
    if (vazute.has(b.s)) continue;
    vazute.add(b.s);
    const variante: Punte[] = [];
    for (const [margine, pas] of [[b.e, ZI_MS], [b.s, -ZI_MS]] as const) {
      const g = gol(margine, pas, concediuMax);
      if (!g.zileLucru.length || g.zileLucru.length > concediuMax) continue;
      if (g.dincolo > ULTIMA || g.dincolo < PRIMA) continue;
      const alt = bloc(g.dincolo);
      const s = Math.min(b.s, alt.s), e = Math.max(b.e, alt.e);
      variante.push({ s, e, total: Math.round((e - s) / ZI_MS) + 1, concediu: [...g.zileLucru].sort((x, y) => x - y) });
    }
    // Cea mai bună: cele mai multe zile libere pe zi de concediu, apoi cea mai lungă.
    variante.sort((x, y) => y.total / y.concediu.length - x.total / x.concediu.length || y.total - x.total);
    const v = variante[0];
    if (v && v.s > dupa && !gasite.has(`${v.s}-${v.e}`)) {
      gasite.add(`${v.s}-${v.e}`);
      rez.push(v);
    }
  }
  return rez;
}

// Următoarea sărbătoare din timpul săptămânii și blocul liber din care face parte.
export function urmatoarea(azi: number) {
  // Sărbătorile de weekend nu dau o zi liberă în plus, deci nu sunt „următoarea zi liberă”.
  const urm = TOATE.find((z) => z.t > azi && !eWeekend(z.t));
  if (!urm) return null;
  const b = bloc(urm.t);
  return { t: urm.t, nume: NUME.get(urm.t) ?? urm.nume, peste: Math.round((urm.t - azi) / ZI_MS), ...b, total: Math.round((b.e - b.s) / ZI_MS) + 1 };
}

// Toate punțile care încep cu o zi de concediu în anul `an`: cardul de pe pagina unui
// an care nu e cel curent și secțiunea „Minivacanțe și punți”.
export function puntiAn(an: number): Punte[] {
  return punti(Date.UTC(an, 0, 1) - ZI_MS).filter((x) => new Date(x.concediu[0]).getUTCFullYear() === an);
}

// Numele sărbătorilor dintre două zile, inclusiv, în ordinea zilelor.
export function sarbatoriIntre(s: number, e: number): string[] {
  const rez: string[] = [];
  for (let t = s; t <= e; t += ZI_MS) if (NUME.has(t)) rez.push(NUME.get(t)!);
  return rez;
}

export type Minivacanta = { s: number; e: number; total: number; sarbatori: string[] };

// Weekendurile prelungite fără nicio zi de concediu: blocurile de cel puțin 3 zile
// libere legate care conțin o sărbătoare din timpul săptămânii din anul `an`.
export function weekenduriPrelungite(an: number): Minivacanta[] {
  const rez: Minivacanta[] = [];
  const vazute = new Set<number>();
  for (const z of TOATE) {
    if (new Date(z.t).getUTCFullYear() !== an || eWeekend(z.t)) continue;
    const b = bloc(z.t);
    if (vazute.has(b.s)) continue;
    vazute.add(b.s);
    const total = Math.round((b.e - b.s) / ZI_MS) + 1;
    if (total < 3) continue;
    const sarbatori: string[] = [];
    for (let t = b.s; t <= b.e; t += ZI_MS) if (NUME.has(t)) sarbatori.push(NUME.get(t)!);
    rez.push({ ...b, total, sarbatori });
  }
  return rez;
}
