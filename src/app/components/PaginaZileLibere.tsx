// Șablonul paginilor /zile-libere-<an>. Pornit din pagina 2026, cerut de proprietar pe
// 25 septembrie 2026, după zileliberelegale.ro (locul 2 în Google), care are file pe
// ani cu același șablon. Tot ce era scris de mână pentru 2026 (întrebările, lista de
// minivacanțe) se calculează din calendarul legal, deci fiecare an iese corect.
// Server Component; interactive sunt doar calendarul și cardurile din dreapta.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { ANI_CALENDAR, pasteOrtodox, sarbatoriAn } from "@/lib/sarbatori";
import { interval, puntiAn, sarbatoriIntre, weekenduriPrelungite, zile, ZI_MS, type Minivacanta, type Punte } from "@/lib/punti";
import TabelArticol from "@/app/components/TabelArticol";
import UrmatoareaZiLibera from "@/app/components/UrmatoareaZiLibera";
import CalendarAn, { type CelulaZi, type LunaCalendar } from "@/app/components/CalendarAn";
import { CARD_TITLU, LISTA_CARD, TITLU_CARD, TITLU_PAGINA, TITLU_SECTIUNE, SEPARATOR_SECTIUNE, SPATIU_JOS, SPATIU_SUS, SUB_TITLU, LISTA_FAQ } from "@/app/components/ui";

export type AnZileLibere = (typeof ANI_CALENDAR)[number];
type CaleAn = `/zile-libere-${AnZileLibere}`;

const cale = (an: AnZileLibere): CaleAn => `/zile-libere-${an}`;
// Anii care au și tabel de zile lucrătoare.
const ZILE_LUCRATOARE = new Set<number>([2026, 2027]);
// Prima publicare a fiecărei pagini; anii noi au apărut odată cu șablonul.
const PUBLICAT: Partial<Record<AnZileLibere, string>> = { 2026: "2026-05-19", 2027: "2026-09-07" };

const LUNI_NUME = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
const ZILE_LUNG = ["luni", "marți", "miercuri", "joi", "vineri", "sâmbătă", "duminică"];
const NUMERE = ["Niciuna", "Una", "Două", "Trei", "Patru", "Cinci", "Șase", "Șapte", "Opt"];

// Index Luni-first (0=Luni … 6=Duminică) pentru o zi calendaristică.
const dowMonday = (y: number, m: number, d: number) => (new Date(Date.UTC(y, m, d)).getUTCDay() + 6) % 7;
const dataLunga = (t: number) => `${ZILE_LUNG[(new Date(t).getUTCDay() + 6) % 7]}, ${new Date(t).getUTCDate()} ${LUNI_NUME[new Date(t).getUTCMonth()].toLowerCase()}`;
// Numele din tabel, în mijlocul unei fraze: „a doua zi de Paște”, „Paștele” fără
// „(ortodox)”, care lângă o paranteză cu data ar da două paranteze la rând.
const inFraza = (nume: string) => nume.replace(/(^|\/ )A doua/g, "$1a doua").replace(" (ortodox)", "");
// „Anul Nou, a doua zi de Anul Nou și Bobotează”
const enumerare = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} și ${xs[xs.length - 1]}`);
// Titlul unei minivacanțe: sărbătorile principale din ea, fără „a doua zi de…”, fără
// Vinerea Mare (merge cu Paștele) și Sfântul Ioan (merge cu Boboteaza).
function numeMinivacanta(s: number, e: number) {
  const toate = sarbatoriIntre(s, e).flatMap((n) => n.split(" / ")).map((n) => n.replace(" (ortodox)", ""));
  const principale = toate.filter((n) => !n.startsWith("A doua zi") && n !== "Vinerea Mare" && n !== "Sfântul Ioan Botezătorul");
  return enumerare([...new Set(principale.length ? principale : toate)]);
}

export function metadataZileLibere(an: AnZileLibere): Metadata {
  const titlu = `Zile libere ${an}: calendar și sărbători legale`;
  const descriere = `Calendar ${an} cu datele sărbătorilor legale și zilele de concediu propuse pentru minivacanțe.`;
  return {
    title: { absolute: `Zile libere ${an}: calendarul sărbătorilor legale` },
    description: `Calendar zile libere ${an} în România: datele sărbătorilor legale, weekenduri prelungite și zilele de concediu propuse pentru minivacanțe.`,
    alternates: { canonical: `https://salariile.ro${cale(an)}` },
    openGraph: ogPage({ title: titlu, description: descriere, path: cale(an) }),
    twitter: twPage({ title: titlu, description: descriere }),
  };
}

function dateAn(an: AnZileLibere) {
  const sarbatori = sarbatoriAn(an);

  const luni: LunaCalendar[] = Array.from({ length: 12 }, (_, m) => {
    const zileLuna = new Date(Date.UTC(an, m + 1, 0)).getUTCDate();
    const cells: CelulaZi[] = Array.from({ length: dowMonday(an, m, 1) }, () => null);
    let lucr = 0;
    for (let d = 1; d <= zileLuna; d++) {
      const weekend = dowMonday(an, m, d) >= 5;
      const name = sarbatori[`${m + 1}-${d}`];
      cells.push({ day: d, weekend, name });
      if (!weekend && !name) lucr++;
    }
    return { luna: m + 1, nume: LUNI_NUME[m], cells, lucr, libere: zileLuna - lucr };
  });
  const zileAn = Math.round((Date.UTC(an + 1, 0, 1) - Date.UTC(an, 0, 1)) / ZI_MS);
  const totalLibere = zileAn - luni.reduce((s, x) => s + x.lucr, 0);

  // Lista sărbătorilor (în ordine), cu ziua săptămânii calculată.
  const lista = Object.entries(sarbatori).map(([key, nume]) => {
    const [m, d] = key.split("-").map(Number);
    const dow = dowMonday(an, m - 1, d);
    return { t: Date.UTC(an, m - 1, d), d, m, nume, zi: ZILE_LUNG[dow], weekend: dow >= 5 };
  });
  const inSaptamana = lista.filter((h) => !h.weekend).length;
  const inWeekend = lista.filter((h) => h.weekend);

  // Minivacanțele: un card pe sărbătoare, cu varianta fără concediu și cu zilele de
  // concediu propuse (proprietar, 25 septembrie 2026: „punte” nu e cuvânt pe care îl
  // știe oricine, iar două carduri pentru aceeași sărbătoare se repetau). Rămân și
  // variantele cu 4 zile de concediu: oamenii le iau. Până în aceeași zi lista era
  // scrisă de mână și greșea 5 ianuarie 2026 („3–7 ianuarie, 5 zile”, în loc de 7).
  const carduri: { s: number; e: number; fara?: Minivacanta; cu?: Punte }[] = puntiAn(an).map((p) => ({ s: p.s, e: p.e, cu: p }));
  for (const w of weekenduriPrelungite(an)) {
    const c = carduri.find((x) => x.cu && !x.fara && x.s <= w.s && w.e <= x.e);
    if (c) c.fara = w;
    else carduri.push({ s: w.s, e: w.e, fara: w });
  }
  const minivacante = carduri.sort((a, b) => a.s - b.s).map((c) => ({ ...c, titlu: numeMinivacanta(c.s, c.e) }));

  const paste = pasteOrtodox(an);
  const numeLa = (t: number) => sarbatori[`${new Date(t).getUTCMonth() + 1}-${new Date(t).getUTCDate()}`];
  const luniRusalii = paste + 50 * ZI_MS;
  const cuZiuaCopilului = numeLa(luniRusalii)?.includes("Ziua Copilului") ? ", chiar de Ziua Copilului" : "";
  const rusaliiDeZiuaCopilului = numeLa(paste + 49 * ZI_MS)?.includes("Ziua Copilului") ? ", chiar de Ziua Copilului" : "";

  const faq = [
    {
      q: `Câte zile libere are ${an} în România?`,
      a: `${totalLibere}: cele ${totalLibere - inSaptamana} zile de weekend și ${inSaptamana} sărbători legale care pică în timpul săptămânii.`,
    },
    {
      q: `Când este Paștele ortodox în ${an}?`,
      a: `${dataLunga(paste)[0].toUpperCase()}${dataLunga(paste).slice(1)} ${an}. Vinerea Mare e pe ${dataLunga(paste - 2 * ZI_MS).split(", ")[1]}, iar a doua zi de Paște ${dataLunga(paste + ZI_MS)}. Rusaliile sunt pe ${dataLunga(paste + 49 * ZI_MS).split(", ")[1]}${rusaliiDeZiuaCopilului}, iar a doua zi de Rusalii ${dataLunga(luniRusalii)}${cuZiuaCopilului}.`,
    },
    {
      q: `Ce sărbători legale cad în weekend în ${an}?`,
      a: inWeekend.length
        ? `${NUMERE[inWeekend.length] ?? inWeekend.length}: ${enumerare(inWeekend.map((h) => `${inFraza(h.nume)} (${dataLunga(h.t)})`))}. Nu se recuperează în altă zi.`
        : "Niciuna: toate cad în timpul săptămânii.",
    },
    {
      q: "Cum se plătește lucrul în zilele de sărbătoare?",
      a: "Primești o zi liberă plătită în următoarele 30 de zile. Dacă angajatorul nu ți-o poate da, îți plătește orele lucrate cu un spor de cel puțin 100%.",
    },
    {
      q: "Sunt incluse zilele libere date de Guvern bugetarilor?",
      a: "Nu. Calendarul arată doar sărbătorile din Codul Muncii. Zilele libere în plus pe care Guvernul le dă uneori în sectorul public le adăugăm abia după ce hotărârea e publicată. Dacă aparții altui cult creștin, Vinerea Mare, Paștele și Rusaliile ți se acordă după calendarul cultului tău.",
    },
    {
      q: "Numărul zilelor lucrătoare din lună îmi schimbă salariul?",
      a: "Nu, dacă ai salariu lunar. Primești aceeași sumă într-o lună cu 18 zile lucrătoare ca într-una cu 23. Diferă doar cât valorează o oră, lucru care contează la plata cu ora și la orele suplimentare.",
    },
  ];

  return { luni, lista, inSaptamana, minivacante, faq };
}

// ─── Stiluri ─────────────────────────────────────────────────────────────────

const card = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";
const links =
  "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600";

// Filele cu anii, ca la zileliberelegale.ro: fiecare e un link spre pagina anului.
// Pe telefon umplu lățimea, cu margini mici: șase ani încap în 343 px doar așa.
// Pe ecranele mari stau cât le e textul.
function AniZileLibere({ an }: { an: AnZileLibere }) {
  return (
    <nav aria-label="Zile libere pe ani" className="mt-5 flex w-full rounded-md border border-stone-300 bg-surface p-1 shadow-soft sm:inline-flex sm:w-auto">
      {ANI_CALENDAR.map((x) => (
        <Link
          key={x}
          href={cale(x)}
          aria-current={x === an ? "page" : undefined}
          className={`flex min-h-11 min-w-0 flex-1 items-center justify-center rounded px-1 text-sm font-medium tabular-nums transition-colors sm:flex-none sm:px-4 ${
            x === an ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
          }`}
        >
          {x}
        </Link>
      ))}
    </nav>
  );
}

// ─── Pagina ──────────────────────────────────────────────────────────────────

export default function PaginaZileLibere({ an }: { an: AnZileLibere }) {
  const { luni, lista, inSaptamana, minivacante, faq } = dateAn(an);
  const url = `https://salariile.ro${cale(an)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
          { "@type": "ListItem", position: 2, name: `Zile libere ${an}`, item: url },
        ],
      },
      {
        "@type": "Article",
        headline: `Zile libere ${an} în România: calendar și sărbători legale`,
        description: `Calendar ${an} cu sărbătorile legale prevăzute de Codul Muncii art. 139 și zilele de concediu propuse pentru minivacanțe.`,
        author: personSchema,
        publisher: {
          "@type": "Organization",
          name: "Salariile",
          logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
        },
        image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
        mainEntityOfPage: url,
        datePublished: PUBLICAT[an] ?? PAGE_LAST_MODIFIED[cale(an)].toISOString().slice(0, 10),
        dateModified: PAGE_LAST_MODIFIED[cale(an)].toISOString().slice(0, 10),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

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
          <h1 className={TITLU_PAGINA}>Zile libere {an}</h1>
          {/* Fără autor și dată sus: e pagină-instrument, nu articol (proprietar, 24 sept. 2026). */}
          <p className={`${SUB_TITLU} text-base leading-normal tracking-[-0.01em] text-stone-700`}>
            În {an} sunt <strong className="font-semibold text-stone-900">{lista.length} sărbători legale</strong>:{" "}
            <strong className="font-semibold text-stone-900">{inSaptamana} în timpul săptămânii</strong> și{" "}
            {lista.length - inSaptamana} în weekend.
          </p>
          <AniZileLibere an={an} />
          {/* Grila începe la tabel: titlul și fraza stau deasupra, pe toată lățimea,
              iar cardurile din dreapta pornesc de la nivelul tabelului, nu de lângă
              titlu (proprietar, 25 septembrie 2026). În HTML cardurile vin după
              calendar: tabel → calendar → carduri. */}
          <div className="md:grid md:grid-cols-5 md:gap-6">
          <div className="md:col-span-3">

            {/* Pe telefon două coloane: data cu ziua săptămânii dedesubt și sărbătoarea,
                care primește tot restul lățimii. Cu trei coloane înguste, numele lungi
                treceau pe două-trei rânduri și rândurile ieșeau inegale. De la `lg` în sus,
                ziua are coloana ei. */}
            <TabelArticol>
              <thead>
                <tr>
                  <th scope="col" className="w-32 lg:w-auto">Data</th>
                  <th scope="col" className="hidden lg:table-cell">Ziua</th>
                  <th scope="col">Sărbătoarea</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((h) => {
                  const ton = h.weekend ? "text-stone-600" : "font-semibold text-stone-900";
                  return (
                    <tr key={`${h.m}-${h.d}`}>
                      <th scope="row" className={`whitespace-nowrap align-top ${h.weekend ? "!font-normal !text-stone-600" : "!font-semibold"}`}>
                        {h.d} {LUNI_NUME[h.m - 1].toLowerCase()}
                        <span className="mt-0.5 block text-xs font-normal text-stone-600 lg:hidden">{h.zi}</span>
                      </th>
                      <td className={`hidden align-top lg:table-cell ${ton}`}>{h.zi}</td>
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
          <div className={`${SEPARATOR_SECTIUNE} md:col-span-5`}>
            <h2 className={TITLU_SECTIUNE}>Calendarul anului {an}</h2>
            <CalendarAn an={an} luni={luni} dataBuild={new Date().toISOString()} />
          </div>
          <aside className="mt-8 md:col-span-2 md:col-start-4 md:row-start-1 md:mt-6 md:self-start">
            <UrmatoareaZiLibera an={an} dataBuild={new Date().toISOString()} />
          </aside>
          </div>

          {/* ZILE LUCRĂTOARE — trimitere spre pagina dedicată, unde există */}
          {ZILE_LUCRATOARE.has(an) ? (
            <div className={`${SEPARATOR_SECTIUNE}`}>
              <div className={`${card} max-w-3xl`}>
                <p className="text-xs font-medium uppercase tracking-wide text-stone-600">Tabel separat</p>
                <h2 className={`mt-2 ${TITLU_CARD}`}>Ai nevoie de zilele și orele lucrătoare pe lună?</h2>
                <p className="mt-2 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">
                  Pagina dedicată centralizează pentru fiecare lună numărul de zile lucrătoare și orele de lucru,
                  plus totalurile anuale. Aici păstrăm calendarul sărbătorilor și al minivacanțelor.
                </p>
                <Link
                  href={`/zile-lucratoare-${an}`}
                  className="mt-4 inline-flex min-h-11 items-center rounded border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
                >
                  Vezi tabelul zilelor lucrătoare {an}
                </Link>
              </div>
            </div>
          ) : null}

          {/* MINIVACANȚE — calculate din calendarul legal (src/lib/punti.ts) */}
          <div className={`${SEPARATOR_SECTIUNE}`}>
            <h2 className={TITLU_SECTIUNE}>Minivacanțe {an}</h2>
            <p className="mt-3 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">
              Când se leagă sărbătorile de weekend și ce zile de concediu îți propunem ca să prelungești pauza.
              Zilele libere de la rând includ weekendurile.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {minivacante.map((c) => (
                <div key={c.s} className={card}>
                  <h3 className={CARD_TITLU}>{c.titlu}</h3>
                  <dl className={LISTA_CARD}>
                    {c.fara ? (
                      <div>
                        <dt className="text-stone-600">Fără concediu</dt>
                        <dd className="text-stone-900">{interval(c.fara.s, c.fara.e, an)} · {zile(c.fara.total)} libere</dd>
                      </div>
                    ) : null}
                    {c.cu ? (
                      <div>
                        <dt className="text-stone-600">
                          Concediu propus: {interval(c.cu.concediu[0], c.cu.concediu[c.cu.concediu.length - 1], an)}
                          {` (${zile(c.cu.concediu.length)})`}
                        </dt>
                        <dd className="font-semibold text-stone-900">{interval(c.cu.s, c.cu.e, an)} · {zile(c.cu.total)} libere</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ + SURSE */}
          <div className={`${SEPARATOR_SECTIUNE} md:grid md:grid-cols-5 md:gap-8 lg:gap-10`}>
            <div className="md:col-span-3">
              <h2 className={TITLU_SECTIUNE}>Întrebări frecvente</h2>
              <div className={LISTA_FAQ}>
                {faq.map((item, i) => (
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
                <ul className={`flex flex-col gap-2 text-sm text-stone-600 ${links}`}>
                  <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Codul Muncii (Legea 53/2003)</a>: art. 139 (sărbători) și 142 (compensare)</li>
                  <li>Paștele și Rusaliile: <a href="https://roea.org/resources-category/calendar-tipic-paschalia/" target="_blank" rel="noopener">pascalia ortodoxă</a></li>
                </ul>
                <h3 className="mt-6 mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Pagini conexe</h3>
                <ul className={`flex flex-col gap-2 text-sm ${links}`}>
                  {ZILE_LUCRATOARE.has(an) ? <li><Link href={`/zile-lucratoare-${an}`}>Zile și ore lucrătoare {an}</Link></li> : null}
                  {an === 2026 ? <li><Link href="/noutati/zile-libere-ramase-2026-minivacante">Zile libere rămase și minivacanțe în 2026</Link></li> : null}
                  <li><Link href="/salariu-minim">Salariul minim</Link></li>
                  <li><Link href="/salariu-mediu">Salariul mediu pe economie</Link></li>
                  <li><Link href="/">Calculator salariu net</Link></li>
                </ul>
              </div>
            </aside>
          </div>

          {/* CTA */}
          <div className={`${SEPARATOR_SECTIUNE}`}>
            <div className={`max-w-prose ${card}`}>
              <h2 className={TITLU_CARD}>Calculează-ți salariul net</h2>
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
