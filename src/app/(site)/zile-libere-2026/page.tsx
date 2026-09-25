// app/zile-libere-2026/page.tsx
// Server Component pur — SSR maxim, zero JS la client.
// Calendar vizual 2026 GENERAT din cod (fără date introduse manual greșit).
// Design în limbajul pilonului: stone monocrom, fără accent, carduri, grilă.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { SARBATORI_LEGALE_2026 as HOLIDAYS } from "@/lib/sarbatori";
import TabelArticol from "@/app/components/TabelArticol";
import { TITLU_CARD, TITLU_PAGINA, TITLU_SECTIUNE, SEPARATOR_SECTIUNE, SPATIU_JOS, SPATIU_SUS, SUB_TITLU, LISTA_FAQ } from "@/app/components/ui";

// ─── Metadata SEO ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: { absolute: "Zile libere 2026: calendarul sărbătorilor legale" },
  description:
    "Calendar zile libere 2026 în România: datele sărbătorilor legale, weekenduri prelungite, minivacanțe și punți utile pentru concediu.",
  alternates: { canonical: "https://salariile.ro/zile-libere-2026" },
  openGraph: ogPage({
    title: "Zile libere 2026: calendar și sărbători legale",
    description:
      "Calendar 2026 cu datele sărbătorilor legale și punțile pentru weekenduri prelungite.",
    path: "/zile-libere-2026",
  }),
  twitter: twPage({
    title: "Zile libere 2026: calendar și sărbători legale",
    description:
      "Calendar 2026 cu datele sărbătorilor legale și punțile pentru weekenduri prelungite.",
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

// Lista sărbătorilor (în ordine), cu ziua săptămânii calculată.
const HOLIDAY_LIST = Object.entries(HOLIDAYS).map(([key, nume]) => {
  const [m, d] = key.split("-").map(Number);
  const dow = dowMonday(YEAR, m - 1, d);
  return { d, m, nume, zi: ZILE_LUNG[dow], weekend: dow >= 5 };
});
const SARBATORI_IN_SAPTAMANA = HOLIDAY_LIST.filter((h) => !h.weekend).length;

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
    a: `${TOTAL_LIBERE}: cele ${TOTAL_LIBERE - SARBATORI_IN_SAPTAMANA} zile de weekend și ${SARBATORI_IN_SAPTAMANA} sărbători legale care pică în timpul săptămânii.`,
  },
  {
    q: "Când este Paștele ortodox în 2026?",
    a: "Duminică, 12 aprilie 2026. Vinerea Mare a fost pe 10 aprilie, iar a doua zi de Paște luni, 13 aprilie. Rusaliile au fost pe 31 mai, iar a doua zi de Rusalii a căzut pe 1 iunie, chiar de Ziua Copilului.",
  },
  {
    q: "Ce sărbători legale cad în weekend în 2026?",
    a: "Cinci: Ziua Unirii (sâmbătă, 24 ianuarie), Paștele (duminică, 12 aprilie), Rusaliile (duminică, 31 mai), Adormirea Maicii Domnului (sâmbătă, 15 august) și a doua zi de Crăciun (sâmbătă, 26 decembrie). Nu se recuperează în altă zi.",
  },
  {
    q: "Cum se plătește lucrul în zilele de sărbătoare?",
    a: "Primești o zi liberă plătită în următoarele 30 de zile. Dacă angajatorul nu ți-o poate da, îți plătește orele lucrate cu un spor de cel puțin 100%.",
  },
  {
    q: "Numărul zilelor lucrătoare din lună îmi schimbă salariul?",
    a: "Nu, dacă ai salariu lunar. Primești aceeași sumă într-o lună cu 18 zile lucrătoare ca într-una cu 23. Diferă doar cât valorează o oră, lucru care contează la plata cu ora și la orele suplimentare.",
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
        "Calendar 2026 cu sărbătorile legale prevăzute de Codul Muncii art. 139 și punțile pentru minivacanțe.",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      mainEntityOfPage: "https://salariile.ro/zile-libere-2026",
      datePublished: "2026-05-19",
      dateModified: PAGE_LAST_MODIFIED["/zile-libere-2026"].toISOString().slice(0, 10),
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
  if (c.weekend) return "text-stone-600";
  return "text-stone-700";
}

// ─── Pagina ──────────────────────────────────────────────────────────────────

export default function ZileLibere2026Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>

          {/* PRIMA PARTE — ce caută omul: care zile sunt libere. Decis de proprietar pe
              24 septembrie 2026, după primele două rezultate din Google (zilelibere.com,
              zileliberelegale.ro): răspunsul într-o frază, apoi tabelul, apoi calendarul.
              Tabelul urmează modelul Pluxee: zilele libere lucrătoare îngroșate, cele din
              weekend estompate, fiindcă pe ele nu primești o zi liberă. */}
          <div className="max-w-3xl">
            <h1 className={TITLU_PAGINA}>Zile libere 2026</h1>
            {/* Fără autor și dată sus: e pagină-instrument, nu articol (proprietar, 24 sept. 2026). */}
            <p className={`${SUB_TITLU} text-base leading-normal tracking-[-0.01em] text-stone-700`}>
              În 2026 sunt <strong className="font-semibold text-stone-900">{HOLIDAY_LIST.length} sărbători legale</strong>:{" "}
              <strong className="font-semibold text-stone-900">{SARBATORI_IN_SAPTAMANA} în timpul săptămânii</strong> și{" "}
              {HOLIDAY_LIST.length - SARBATORI_IN_SAPTAMANA} în weekend.
            </p>

            {/* Pe telefon două coloane: data cu ziua săptămânii dedesubt și sărbătoarea,
                care primește tot restul lățimii. Cu trei coloane înguste, numele lungi
                treceau pe două-trei rânduri și rândurile ieșeau inegale. De la `sm` în sus,
                ziua are coloana ei. */}
            <TabelArticol>
              <thead>
                <tr>
                  <th scope="col" className="w-32 sm:w-auto">Data</th>
                  <th scope="col" className="hidden sm:table-cell">Ziua</th>
                  <th scope="col">Sărbătoarea</th>
                </tr>
              </thead>
              <tbody>
                {HOLIDAY_LIST.map((h) => {
                  const ton = h.weekend ? "text-stone-600" : "font-semibold text-stone-900";
                  return (
                    <tr key={`${h.m}-${h.d}`}>
                      <th scope="row" className={`whitespace-nowrap align-top ${h.weekend ? "!font-normal !text-stone-600" : "!font-semibold"}`}>
                        {h.d} {LUNI_NUME[h.m - 1].toLowerCase()}
                        <span className="mt-0.5 block text-xs font-normal text-stone-600 sm:hidden">{h.zi}</span>
                      </th>
                      <td className={`hidden align-top sm:table-cell ${ton}`}>{h.zi}</td>
                      <td className={`align-top ${ton}`}>{h.nume}</td>
                    </tr>
                  );
                })}
              </tbody>
            </TabelArticol>

            {/* Sub tabel, ce primești dacă lucrezi de sărbătoare, ca la primul rezultat din
                Google. Formulat după Codul Muncii, art. 142: întâi zi liberă în 30 de zile,
                abia apoi sporul de cel puțin 100% („plătită dublu” e doar a doua variantă). */}
            <p className="text-base leading-normal tracking-[-0.01em] text-stone-700">
              Potrivit Codului Muncii, angajații care lucrează într-o zi de sărbătoare legală primesc o zi liberă în
              următoarele 30 de zile sau, dacă aceasta nu poate fi acordată, ziua lucrată plătită cel puțin dublu.
            </p>
          </div>

          {/* CALENDAR — 12 luni */}
          <div className={`${SEPARATOR_SECTIUNE}`}>
            <h2 className={TITLU_SECTIUNE}>Calendarul anului 2026</h2>
            {/* Legendă */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-600">
              <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm bg-stone-100 ring-1 ring-inset ring-stone-300" aria-hidden="true" />Zi lucrătoare</span>
              <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm bg-stone-100 ring-1 ring-inset ring-stone-300" aria-hidden="true" /><span className="text-stone-600">Weekend</span></span>
              <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm bg-stone-900" aria-hidden="true" />Sărbătoare legală</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MONTHS.map((mo) => (
                <div key={mo.nume} className={card}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-semibold tracking-[-0.01em] text-stone-900">{mo.nume}</h3>
                    <span className="text-xs text-stone-600">{mo.lucr} lucr. · {mo.libere} libere</span>
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                    {ZILE_SCURT.map((z) => (
                      <div key={z} className="text-xs font-medium uppercase text-stone-600">{z}</div>
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

          {/* ZILE LUCRĂTOARE — trimitere spre pagina dedicată */}
          <div className={`${SEPARATOR_SECTIUNE}`}>
            <div className={`${card} max-w-3xl`}>
              <p className="text-xs font-medium uppercase tracking-wide text-stone-600">Tabel separat</p>
              <h2 className={`mt-2 ${TITLU_CARD}`}>Ai nevoie de zilele și orele lucrătoare pe lună?</h2>
              <p className="mt-2 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">
                Pagina dedicată centralizează pentru fiecare lună numărul de zile lucrătoare și orele la norme de 8, 6 și 4 ore,
                plus totalurile anuale. Aici păstrăm calendarul sărbătorilor și al minivacanțelor.
              </p>
              <Link
                href="/zile-lucratoare-2026"
                className="mt-4 inline-flex min-h-11 items-center rounded border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
              >
                Vezi tabelul zilelor lucrătoare 2026
              </Link>
            </div>
          </div>

          {/* PUNȚI */}
          <div className={`${SEPARATOR_SECTIUNE}`}>
            <h2 className={TITLU_SECTIUNE}>Minivacanțe și punți 2026</h2>
            <p className="mt-3 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">
              Combinații de sărbători și weekend care îți dau pauze mai lungi. Unele vin natural; la altele iei o zi din
              concediu („punte&quot;) și transformi câteva zile într-o minivacanță.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PUNTI.map((p) => (
                <div key={p.titlu} className={card}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-semibold tracking-[-0.01em] text-stone-900">{p.titlu}</h3>
                    <span className="text-xs font-medium text-stone-600">{p.zile}</span>
                  </div>
                  <p className="mt-2 text-sm leading-normal text-stone-600">{p.detalii}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ + SURSE */}
          <div className={`${SEPARATOR_SECTIUNE} md:grid md:grid-cols-5 md:gap-8 lg:gap-10`}>
            <div className="md:col-span-3">
              <h2 className={TITLU_SECTIUNE}>Întrebări frecvente</h2>
              <div className={LISTA_FAQ}>
                {FAQ.map((item, i) => (
                  <details key={i} name="faq-zile" className="group border-b border-stone-200">
                    <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-4 text-base font-medium tracking-[-0.01em] text-stone-900 [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span className="flex-shrink-0 text-xl text-stone-900 group-open:hidden">+</span>
                      <span className="hidden flex-shrink-0 text-xl text-stone-900 group-open:inline">−</span>
                    </summary>
                    <p className="mb-4 text-base leading-normal tracking-[-0.01em] text-stone-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <aside className="mt-8 md:col-span-2 md:mt-0 md:self-start">
              <div className={`flex h-full flex-col ${card}`}>
                <h3 className="mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Surse oficiale</h3>
                <ul className={`flex flex-col gap-2 text-sm leading-normal text-stone-600 ${links}`}>
                  <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Codul Muncii (Legea 53/2003)</a>: art. 139 (sărbători) și 142 (compensare)</li>
                  <li>Calendar ortodox 2026: datele de Paște și Rusalii</li>
                </ul>
                <h3 className="mt-6 mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Pagini conexe</h3>
                <ul className={`flex flex-col gap-2 text-sm ${links}`}>
                  <li><Link href="/zile-lucratoare-2026">Zile și ore lucrătoare 2026</Link></li>
                  <li><Link href="/noutati/zile-libere-ramase-2026-minivacante">Zile libere rămase și minivacanțe în 2026</Link></li>
                  <li><Link href="/salariu-minim">Salariul minim 2026</Link></li>
                  <li><Link href="/salariu-mediu">Salariul mediu pe economie</Link></li>
                  <li><Link href="/">Calculator salariu net</Link></li>
                </ul>
              </div>
            </aside>
          </div>

          {/* CTA */}
          <div className={`${SEPARATOR_SECTIUNE}`}>
            <div className={`max-w-prose ${card}`}>
              <h2 className={TITLU_CARD}>Calculează-ți salariul pe 2026</h2>
              <p className="mt-2 text-base leading-normal tracking-[-0.01em] text-stone-600">
                Scrie brutul și vezi cât primești în mână.
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
