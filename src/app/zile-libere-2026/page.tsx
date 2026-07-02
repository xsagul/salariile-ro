// app/zile-libere-2026/page.tsx
// Server Component pur — SSR maxim, zero JS la client.
// Calendar vizual 2026 GENERAT din cod (fără date introduse manual greșit).
// Design în limbajul pilonului: stone monocrom, fără accent, carduri, grilă.

import type { Metadata } from "next";
import Link from "next/link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import { SARBATORI_LEGALE_2026 as HOLIDAYS } from "@/lib/sarbatori";

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Zile libere 2026: calendar, sărbători legale, zile lucrătoare",
  description:
    "Calendar 2026 complet: 250 zile lucrătoare, 115 zile libere, sărbătorile legale (Cod Muncii art. 139) și punțile pentru minivacanțe. Paștele ortodox: 12 aprilie.",
  alternates: { canonical: "https://salariile.ro/zile-libere-2026" },
  openGraph: ogPage({
    title: "Zile libere 2026: calendar și sărbători legale",
    description:
      "Calendar 2026: 250 zile lucrătoare, 115 libere, toate sărbătorile legale și punțile pentru weekend-uri prelungite.",
    path: "/zile-libere-2026",
  }),
  twitter: twPage({
    title: "Zile libere 2026: calendar și sărbători legale",
    description:
      "Calendar 2026: 250 zile lucrătoare, 115 libere, toate sărbătorile legale și punțile pentru weekend-uri prelungite.",
  }),
};

// Sărbătorile legale 2026 (Cod Muncii art. 139) sunt în src/lib/sarbatori.ts —
// sursă unică, partajată cu fluturașul PDF (zile lucrătoare pe lună).

const YEAR = 2026;
const LUNI_NUME = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
const ZILE_SCURT = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];
const ZILE_LUNG = ["luni", "marți", "miercuri", "joi", "vineri", "sâmbătă", "duminică"];

// Index Luni-first (0=Luni … 6=Duminică) pentru o zi calendaristică.
const dowMonday = (y: number, m: number, d: number) => (new Date(Date.UTC(y, m, d)).getUTCDay() + 6) % 7;

type Cell = { day: number; weekend: boolean; holiday: boolean; name?: string } | null;

function buildMonth(m: number) {
  const daysInMonth = new Date(Date.UTC(YEAR, m + 1, 0)).getUTCDate();
  const start = dowMonday(YEAR, m, 1);
  const cells: Cell[] = Array.from({ length: start }, () => null);
  let lucr = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = dowMonday(YEAR, m, d);
    const weekend = dow >= 5;
    const name = HOLIDAYS[`${m + 1}-${d}`];
    const holiday = Boolean(name);
    cells.push({ day: d, weekend, holiday, name });
    if (!weekend && !holiday) lucr++;
  }
  return { nume: LUNI_NUME[m], cells, lucr, libere: daysInMonth - lucr };
}

const MONTHS = Array.from({ length: 12 }, (_, m) => buildMonth(m));
const TOTAL_LUCR = MONTHS.reduce((s, x) => s + x.lucr, 0); // 250
const TOTAL_LIBERE = 365 - TOTAL_LUCR; // 115
const TOTAL_ORE = TOTAL_LUCR * 8; // 2000

// Numărări pentru stat-carduri.
let WEEKEND_DAYS = 0;
let HOLIDAY_WORKDAYS = 0;
for (let m = 0; m < 12; m++) {
  for (const c of MONTHS[m].cells) {
    if (!c) continue;
    if (c.weekend) WEEKEND_DAYS++;
    if (c.holiday && !c.weekend) HOLIDAY_WORKDAYS++;
  }
}

// Lista sărbătorilor (în ordine), cu ziua săptămânii calculată.
const HOLIDAY_LIST = Object.entries(HOLIDAYS).map(([key, nume]) => {
  const [m, d] = key.split("-").map(Number);
  const dow = dowMonday(YEAR, m - 1, d);
  return { d, m, nume, zi: ZILE_LUNG[dow], weekend: dow >= 5 };
});

// Punți / minivacanțe 2026 (derivate manual din calendar, dar verificabile pe el).
const PUNTI = [
  { titlu: "1–4 ianuarie", zile: "4 zile", detalii: "Anul Nou (joi) + a doua zi (vineri) + weekend. Fără punte." },
  { titlu: "3–7 ianuarie", zile: "5 zile", detalii: "Iei liber luni 5 ian → cu Bobotează (marți 6) și Sf. Ioan (miercuri 7), de sâmbătă până miercuri." },
  { titlu: "10–13 aprilie", zile: "4 zile", detalii: "Vinerea Mare (vineri 10) + weekend de Paște + a doua zi de Paște (luni 13). Fără punte." },
  { titlu: "1–3 mai", zile: "3 zile", detalii: "Ziua Muncii (vineri 1) + weekend." },
  { titlu: "30 mai – 1 iunie", zile: "3 zile", detalii: "Weekend + Rusalii și Ziua Copilului (luni 1 iunie, aceeași zi)." },
  { titlu: "28 nov. – 1 dec.", zile: "4 zile", detalii: "Weekend + Sf. Andrei (luni 30) + Ziua Națională (marți 1 dec). Fără punte." },
  { titlu: "25–27 decembrie", zile: "3 zile", detalii: "Crăciunul (vineri 25) + a doua zi (sâmbătă) + duminică. Ajunul (24) nu e zi liberă." },
];

const FAQ = [
  {
    q: "Câte zile libere are 2026 în România?",
    a: "În 2026 sunt 115 zile libere: 104 zile de weekend plus 11 sărbători legale care cad în zile lucrătoare. Restul de 250 de zile sunt lucrătoare (echivalent cu 2.000 de ore la 8 ore/zi).",
  },
  {
    q: "Când este Paștele ortodox în 2026?",
    a: "Paștele ortodox este duminică, 12 aprilie 2026. Vinerea Mare cade pe 10 aprilie, iar a doua zi de Paște pe 13 aprilie (luni). Rusaliile sunt pe 31 mai, iar a doua zi de Rusalii pe 1 iunie, aceeași zi cu Ziua Copilului.",
  },
  {
    q: "Câte zile lucrătoare are anul 2026?",
    a: "2026 are 250 de zile lucrătoare, adică 2.000 de ore la program de 8 ore/zi. Iulie are cele mai multe zile lucrătoare (23), iar ianuarie cele mai puține (18), din cauza sărbătorilor de la început de an.",
  },
  {
    q: "Ce sărbători legale cad în weekend în 2026?",
    a: "Cinci sărbători cad în weekend și nu aduc o zi liberă în plus: 24 ianuarie (sâmbătă), 12 aprilie, Paștele (duminică), 31 mai, Rusalii (duminică), 15 august (sâmbătă) și 26 decembrie (sâmbătă). Codul Muncii nu prevede recuperarea lor.",
  },
  {
    q: "Cum se plătește lucrul în zilele de sărbătoare?",
    a: "Conform Codului Muncii (art. 142), pentru munca în zilele de sărbătoare legală angajatorul acordă zile libere plătite în următoarele 30 de zile. Dacă nu poate, plătește un spor de minimum 100% din salariul de bază pentru orele lucrate.",
  },
  {
    q: "Numărul zilelor lucrătoare din lună îmi schimbă salariul?",
    a: "Nu. Salariul lunar negociat (brut) se plătește integral, indiferent dacă luna are 18 sau 23 de zile lucrătoare. Diferă doar tariful pe oră, relevant la contractele part-time sau plătite la oră.",
  },
];

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Zile libere 2026", item: "https://salariile.ro/zile-libere-2026" },
      ],
    },
    {
      "@type": "Article",
      headline: "Zile libere 2026 în România: calendar și sărbători legale",
      description:
        "Calendar 2026: 250 zile lucrătoare, 115 zile libere, sărbătorile legale (Cod Muncii art. 139) și punțile pentru minivacanțe.",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      mainEntityOfPage: "https://salariile.ro/zile-libere-2026",
      datePublished: "2026-05-19",
      dateModified: "2026-07-02",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

// ─── Stiluri ─────────────────────────────────────────────────────────────────

const card = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";
const links =
  "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600";

function dayClass(c: NonNullable<Cell>) {
  if (c.holiday) return "bg-stone-900 font-semibold text-white";
  if (c.weekend) return "text-stone-400";
  return "text-stone-700";
}

// ─── Pagina ──────────────────────────────────────────────────────────────────

export default function ZileLibere2026Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">

          {/* HERO */}
          <div className="max-w-prose">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Calendar 2026</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-stone-900 sm:text-4xl">Zile libere 2026</h1>
            <p className="mt-3 text-xs text-stone-600 [&_a]:font-medium [&_a]:text-stone-700 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-900">
              Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat 2 iulie 2026
            </p>
            <p className="mt-5 text-base leading-normal tracking-[-0.01em] text-stone-600">
              Calendarul complet al zilelor libere legale din România în 2026: sărbătorile (Codul Muncii art. 139),
              zilele lucrătoare lună de lună și punțile prin care îți faci minivacanțe.
            </p>
          </div>

          {/* STAT-CARDURI */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4 sm:gap-4">
            {([
              [TOTAL_LUCR, "Zile lucrătoare"],
              [TOTAL_LIBERE, "Zile libere total"],
              [HOLIDAY_WORKDAYS, "Sărbători în zile lucrătoare"],
              [WEEKEND_DAYS, "Zile de weekend"],
            ] as const).map(([n, label]) => (
              <div key={label} className={card}>
                <div className="text-3xl font-bold tabular-nums tracking-[-0.02em] text-stone-900">{n}</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-stone-500">{label}</div>
              </div>
            ))}
          </div>

          {/* CALENDAR — 12 luni */}
          <div className="mt-12 border-t border-stone-200 pt-10 sm:mt-16 sm:pt-14">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Calendarul anului 2026</h2>
            {/* Legendă */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-600">
              <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm bg-stone-100 ring-1 ring-inset ring-stone-300" aria-hidden="true" />Zi lucrătoare</span>
              <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm bg-stone-100 ring-1 ring-inset ring-stone-300" aria-hidden="true" /><span className="text-stone-400">Weekend</span></span>
              <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm bg-stone-900" aria-hidden="true" />Sărbătoare legală</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MONTHS.map((mo) => (
                <div key={mo.nume} className={card}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-semibold tracking-[-0.01em] text-stone-900">{mo.nume}</h3>
                    <span className="text-xs text-stone-500">{mo.lucr} lucr. · {mo.libere} libere</span>
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                    {ZILE_SCURT.map((z) => (
                      <div key={z} className="text-[10px] font-medium uppercase text-stone-400">{z}</div>
                    ))}
                    {mo.cells.map((c, i) => {
                      if (c === null) return <div key={i} />;
                      if (!c.holiday) {
                        return (
                          <div key={i} className={`flex h-7 items-center justify-center rounded text-xs tabular-nums ${dayClass(c)}`}>
                            {c.day}
                          </div>
                        );
                      }
                      const col = i % 7;
                      const pos = col <= 1 ? "left-0" : col >= 5 ? "right-0" : "left-1/2 -translate-x-1/2";
                      return (
                        <div
                          key={i}
                          tabIndex={0}
                          aria-label={`${c.day} ${mo.nume}, ${c.name}`}
                          className="group relative flex h-7 items-center justify-center rounded bg-stone-900 text-xs font-semibold tabular-nums text-white outline-none"
                        >
                          {c.day}
                          <span className={`pointer-events-none absolute bottom-full z-20 mb-1 hidden whitespace-nowrap rounded-md border border-stone-200 bg-surface px-2 py-1 text-xs font-normal text-stone-700 shadow-soft group-hover:block group-focus:block ${pos}`}>
                            {c.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ZILE LUCRĂTOARE PE LUNI — tabel */}
          <div className="mt-12 border-t border-stone-200 pt-10 sm:mt-16 sm:pt-14">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Zile lucrătoare 2026, lună de lună</h2>
            <p className="mt-3 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">
              Numărul de zile lucrătoare și ore de lucru (la program de 8 ore/zi) pentru fiecare lună din 2026. Util la
              calculul tarifului orar, al contractelor part-time și al normelor de lucru.
            </p>
            <div className={`mt-6 ${card}`}>
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-stone-300 text-xs font-medium uppercase tracking-wide text-stone-500">
                    <th scope="col" className="pb-2 text-left">Luna</th>
                    <th scope="col" className="pb-2 text-right">Zile lucrătoare</th>
                    <th scope="col" className="pb-2 text-right">Ore de lucru</th>
                    <th scope="col" className="pb-2 text-right">Zile libere</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map((mo) => (
                    <tr key={mo.nume} className="border-b border-stone-100 last:border-b-0">
                      <th scope="row" className="py-2 text-left font-normal text-stone-700">{mo.nume}</th>
                      <td className="py-2 text-right font-medium text-stone-900">{mo.lucr}</td>
                      <td className="py-2 text-right text-stone-600">{mo.lucr * 8}</td>
                      <td className="py-2 text-right text-stone-600">{mo.libere}</td>
                    </tr>
                  ))}
                  <tr className="[&_td]:pt-3 [&_td]:font-bold [&_td]:text-stone-900 [&_th]:pt-3 [&_th]:font-bold [&_th]:text-stone-900">
                    <th scope="row" className="text-left">Total 2026</th>
                    <td className="text-right">{TOTAL_LUCR}</td>
                    <td className="text-right">{TOTAL_ORE.toLocaleString("ro-RO")}</td>
                    <td className="text-right">{TOTAL_LIBERE}</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-4 text-xs text-stone-500">
                Zilele lucrătoare exclud weekendurile și sărbătorile legale care cad în zile lucrătoare. Iulie are cele mai
                multe (23), ianuarie cele mai puține (18).
              </p>
            </div>
          </div>

          {/* SĂRBĂTORI — listă */}
          <div className="mt-12 border-t border-stone-200 pt-10 sm:mt-16 sm:pt-14">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Sărbătorile legale din 2026</h2>
            <p className="mt-3 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">
              Cele 16 zile de sărbătoare legală recunoscute de{" "}
              <a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">Codul Muncii (art. 139)</a>.
              Cele 11 care cad în zile lucrătoare îți aduc o zi liberă în plus; 5 cad în weekend.
            </p>
            <div className={`mt-6 ${card}`}>
              <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 [&>li:last-child]:border-b-0 sm:[&>li:nth-last-child(2)]:border-b-0">
                {HOLIDAY_LIST.map((h) => (
                  <li key={`${h.m}-${h.d}-${h.nume}`} className="flex items-baseline justify-between gap-4 border-b border-stone-100 py-2.5">
                    <span className="text-sm text-stone-800">
                      {h.nume}
                      {h.weekend && <span className="ml-2 text-xs text-stone-400">(weekend)</span>}
                    </span>
                    <span className="flex-shrink-0 text-sm tabular-nums text-stone-500">{h.d} {LUNI_NUME[h.m - 1].toLowerCase()} · {h.zi}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* PUNȚI */}
          <div className="mt-12 border-t border-stone-200 pt-10 sm:mt-16 sm:pt-14">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Minivacanțe și punți 2026</h2>
            <p className="mt-3 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">
              Combinații de sărbători și weekend care îți dau pauze mai lungi. Unele vin natural; la altele iei o zi din
              concediu („punte") și transformi câteva zile într-o minivacanță.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PUNTI.map((p) => (
                <div key={p.titlu} className={card}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-semibold tracking-[-0.01em] text-stone-900">{p.titlu}</h3>
                    <span className="text-xs font-medium text-stone-500">{p.zile}</span>
                  </div>
                  <p className="mt-2 text-sm leading-normal text-stone-600">{p.detalii}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ + SURSE */}
          <div className="mt-12 border-t border-stone-200 pt-10 sm:mt-16 sm:pt-14 md:grid md:grid-cols-5 md:gap-8 lg:gap-10">
            <div className="md:col-span-3">
              <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Întrebări frecvente</h2>
              <div className="flex flex-col">
                {FAQ.map((item, i) => (
                  <details key={i} name="faq-zile" className="group border-b border-stone-200 py-4">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium tracking-[-0.01em] text-stone-900 [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span className="flex-shrink-0 text-xl text-stone-900 group-open:hidden">+</span>
                      <span className="hidden flex-shrink-0 text-xl text-stone-900 group-open:inline">−</span>
                    </summary>
                    <p className="mt-3 text-base leading-normal tracking-[-0.01em] text-stone-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <aside className="mt-8 md:col-span-2 md:mt-0">
              <div className={`flex h-full flex-col ${card}`}>
                <h3 className="mb-3 text-xs font-medium text-stone-500">Surse oficiale</h3>
                <ul className={`flex flex-col gap-2 text-sm leading-normal text-stone-600 ${links}`}>
                  <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Codul Muncii (Legea 53/2003)</a>: art. 139 (sărbători) și 142 (compensare)</li>
                  <li>Calendar ortodox 2026: datele de Paște și Rusalii</li>
                </ul>
                <h3 className="mb-3 mt-6 text-xs font-medium text-stone-500">Pagini conexe</h3>
                <ul className={`flex flex-col gap-2 text-sm ${links}`}>
                  <li><Link href="/salariu-minim">Salariul minim 2026</Link></li>
                  <li><Link href="/salariu-mediu">Salariul mediu pe economie</Link></li>
                  <li><Link href="/">Calculator salariu net</Link></li>
                </ul>
                <p className="mt-auto pt-6 text-xs text-stone-500">Ultima actualizare: 2 iulie 2026.</p>
              </div>
            </aside>
          </div>

          {/* CTA */}
          <div className="mt-12 border-t border-stone-200 pt-10 sm:mt-16 sm:pt-14">
            <div className={`max-w-prose ${card}`}>
              <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900">Calculează-ți salariul pe 2026</h2>
              <p className="mt-2 text-base leading-normal tracking-[-0.01em] text-stone-600">
                Numărul zilelor lucrătoare nu-ți schimbă salariul lunar, dar vezi exact cât primești net, ce reține statul
                și cât costă firma.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex min-h-11 items-center self-start rounded border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
              >
                Mergi la calculator →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
