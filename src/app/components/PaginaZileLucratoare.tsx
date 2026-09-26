// Șablonul paginilor /zile-lucratoare-<an>, pe modelul PaginaZileLibere.tsx: aceeași
// grilă, aceleași distanțe, aceleași file cu anii, fără linie între titlu și tabel
// (cerut de proprietar pe 27 septembrie 2026). Înainte, 2026 avea o pagină proprie,
// iar 2027 folosea Calendar2027, cu alt aspect, iar ceilalți ani nu existau.
// Server Component; interactiv e doar calculatorul pe interval.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { ANI_CALENDAR, sarbatoriAn, zileLucratoareLuna } from "@/lib/sarbatori";
import TabelArticol from "@/app/components/TabelArticol";
import CalculatorIntervalZile from "@/app/components/CalculatorIntervalZile";
import { CARD_TITLU, Formula, LISTA_CARD, SEPARATOR_SECTIUNE, SPATIU_JOS, SPATIU_SUS, SUB_TITLU, TITLU_PAGINA, TITLU_SECTIUNE } from "@/app/components/ui";

export type AnZileLucratoare = (typeof ANI_CALENDAR)[number];
type CaleAn = `/zile-lucratoare-${AnZileLucratoare}`;

const cale = (an: AnZileLucratoare): CaleAn => `/zile-lucratoare-${an}`;
// Prima publicare a fiecărei pagini; anii noi au apărut odată cu șablonul.
const PUBLICAT: Partial<Record<AnZileLucratoare, string>> = { 2026: "2026-07-06", 2027: "2026-09-07" };

const LUNI = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];

// Anul și luna în fusul orar al României, la build. Pagina se reconstruiește la fiecare
// publicare, iar colectarea zilnică publică în fiecare zi.
function acumRo() {
  const acum = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Bucharest" }));
  return { an: acum.getFullYear(), luna: acum.getMonth() };
}

function dateAn(an: AnZileLucratoare) {
  const sarbatori = sarbatoriAn(an);
  const rows = LUNI.map((name, m) => {
    const zileCalendaristice = new Date(Date.UTC(an, m + 1, 0)).getUTCDate();
    const lucratoare = zileLucratoareLuna(an, m);
    const holidays = Object.entries(sarbatori)
      .map(([key, label]) => {
        const [luna, zi] = key.split("-").map(Number);
        if (luna !== m + 1) return null;
        const dow = new Date(Date.UTC(an, m, zi)).getUTCDay();
        return { day: zi, label, weekend: dow === 0 || dow === 6 };
      })
      .filter(Boolean) as { day: number; label: string; weekend: boolean }[];
    return { name, zileCalendaristice, lucratoare, ore: lucratoare * 8, libere: zileCalendaristice - lucratoare, holidays };
  });
  const zileAn = rows.reduce((s, r) => s + r.zileCalendaristice, 0);
  const total = rows.reduce((s, r) => s + r.lucratoare, 0);
  // Doar ele scad zile din normă; din aceleași date ca tabelul.
  const inSaptamana = rows.flatMap((r) =>
    r.holidays.filter((h) => !h.weekend).map((h) => ({ data: `${h.day} ${r.name.toLowerCase()}`, label: h.label })),
  );
  const csv = [
    "Luna,Zile lucratoare,Ore lucratoare (8h/zi),Zile libere,Sarbatori legale",
    ...rows.map((r) => {
      const s = r.holidays.map((h) => `${h.day} ${r.name.toLowerCase()} (${h.label}${h.weekend ? " - weekend" : ""})`).join("; ");
      return `"${r.name}",${r.lucratoare},${r.ore},${r.libere},"${s}"`;
    }),
    `"Total ${an}",${total},${total * 8},${zileAn - total},""`,
  ].join("\r\n");
  return { rows, total, ore: total * 8, libere: zileAn - total, inSaptamana, csv: `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}` };
}

// Titlul rămâne anual tot anul; luna curentă trăiește în descriere. Măsurat în GSC pe
// 21 august 2026: potrivirea titlului cu luna nu ridica CTR-ul pe căutările lunare
// (iulie 0,2%, august 0,2%), iar căutarea anuală e cea mai mare a paginii.
// 2027 își păstrează titlul de dinainte: face 7,1% CTR pe poziția 3,6 (GSC, 29 aug – 25 sept 2026).
const TITLU_PROPRIU: Partial<Record<AnZileLucratoare, { title: string; description: string }>> = {
  2027: {
    title: "Zile lucrătoare 2027: tabel lunar și calcul pe interval",
    description: "Zile și ore lucrătoare în 2027, pe luni. Descarcă tabelul CSV și calculează norma pe un interval. Sărbători ortodoxe, program luni–vineri.",
  },
};

export function metadataZileLucratoare(an: AnZileLucratoare): Metadata {
  const { rows, total, ore } = dateAn(an);
  const acum = acumRo();
  const propriu = TITLU_PROPRIU[an];
  const title = propriu?.title ?? `Zile lucrătoare ${an}: ${total} de zile și ${ore.toLocaleString("ro-RO")} ore`;
  const luna = acum.an === an ? rows[acum.luna] : null;
  const description =
    propriu?.description ??
    (luna
      ? `${title}. ${luna.name}: ${luna.lucratoare} de zile și ${luna.ore} de ore. Tabel complet pe toate lunile, cu sărbătorile legale scăzute din normă.`
      : `${title}. Tabel lunar cu zilele lucrătoare, sărbătorile legale scăzute din normă și totalul anual.`);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `https://salariile.ro${cale(an)}` },
    openGraph: ogPage({ title, description, path: cale(an) }),
    twitter: twPage({ title, description }),
  };
}

// ─── Stiluri ─────────────────────────────────────────────────────────────────

const card = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";
const text = "text-base leading-normal tracking-[-0.01em] text-stone-700";
const linkCard = "font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600";

// Filele cu anii, identice cu cele de la zile libere.
function AniZileLucratoare({ an }: { an: AnZileLucratoare }) {
  return (
    <nav aria-label="Zile lucrătoare pe ani" className="mt-5 flex w-full rounded-md border border-stone-300 bg-surface p-1 shadow-soft sm:inline-flex sm:w-auto">
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

export default function PaginaZileLucratoare({ an }: { an: AnZileLucratoare }) {
  const { rows, total, ore, libere, inSaptamana, csv } = dateAn(an);
  const acum = acumRo();
  const lunaCurenta = acum.an === an ? acum.luna : null;
  const trecut = an < acum.an;
  const url = `https://salariile.ro${cale(an)}`;
  const { description } = metadataZileLucratoare(an) as { description: string };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
          { "@type": "ListItem", position: 2, name: `Zile lucrătoare ${an}`, item: url },
        ],
      },
      {
        "@type": "Article",
        headline: `Zile lucrătoare ${an} în România`,
        description,
        url,
        inLanguage: "ro-RO",
        author: personSchema,
        publisher: {
          "@type": "Organization",
          name: "Salariile",
          logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
        },
        image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
        datePublished: PUBLICAT[an] ?? PAGE_LAST_MODIFIED[cale(an)].toISOString().slice(0, 10),
        dateModified: PAGE_LAST_MODIFIED[cale(an)].toISOString().slice(0, 10),
        mainEntityOfPage: url,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>

          {/* Fără cale de navigare, autor și dată sus: e pagină-instrument (proprietar, 27 sept. 2026). */}
          <h1 className={TITLU_PAGINA}>Zile lucrătoare {an}</h1>
          <p className={`${SUB_TITLU} ${text}`}>
            În {an} {trecut ? "au fost" : "sunt"} <strong className="font-semibold text-stone-900">{total} de zile lucrătoare</strong>, adică{" "}
            {ore.toLocaleString("ro-RO")} de ore la program de 8 ore pe zi. Restul de {libere} de zile{" "}
            {trecut ? "au fost" : "sunt"} weekenduri și sărbători legale.
          </p>
          <AniZileLucratoare an={an} />

          {/* Grila începe la tabel, iar cardul din dreapta pornește de la nivelul lui, ca la zile libere. */}
          <div className="md:grid md:grid-cols-5 md:gap-6">
            <div className="md:col-span-3">
              <TabelArticol>
                <thead>
                  <tr>
                    <th>Luna</th>
                    <th className="text-right">Zile lucrătoare</th>
                    <th className="text-right">Ore lucrătoare</th>
                    <th className="text-right">Zile libere</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.name}
                      id={row.name.toLowerCase()}
                      aria-current={i === lunaCurenta ? "date" : undefined}
                      className={`scroll-mt-24 ${i === lunaCurenta ? "bg-antet font-semibold text-stone-900" : ""}`}
                    >
                      <td className="font-medium text-stone-900">
                        <a href={`#${row.name.toLowerCase()}`} className="hover:underline">
                          {row.name}
                        </a>
                        {i === lunaCurenta ? <span className="ml-2 text-xs font-normal text-stone-600">luna curentă</span> : null}
                      </td>
                      <td className="text-right tabular-nums">{row.lucratoare}</td>
                      <td className="text-right tabular-nums">{row.ore}</td>
                      <td className="text-right tabular-nums">{row.libere}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="font-bold text-stone-900">Total {an}</td>
                    <td className="text-right font-bold tabular-nums text-stone-900">{total}</td>
                    <td className="text-right font-bold tabular-nums text-stone-900">{ore.toLocaleString("ro-RO")}</td>
                    <td className="text-right font-bold tabular-nums text-stone-900">{libere}</td>
                  </tr>
                </tbody>
              </TabelArticol>
              <p className="text-sm text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2">
                <a href={csv} download={`zile-lucratoare-${an}.csv`}>Descarcă tabelul (CSV)</a> pentru Excel sau pontaj. Temei:{" "}
                <a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Codul Muncii</a>, art. 139 și 142.
              </p>
            </div>

            <aside className="mt-8 md:col-span-2 md:col-start-4 md:row-start-1 md:mt-6 md:self-start">
              <div className={card}>
                <h2 className={CARD_TITLU}>Sărbătorile care scad o zi de lucru</h2>
                <ul className={`${LISTA_CARD} text-stone-600`}>
                  {inSaptamana.map((h) => (
                    <li key={h.data}>
                      <span className="font-medium text-stone-900">{h.data}</span> · {h.label}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-stone-600">
                  Cele care pică sâmbăta sau duminica nu se recuperează în altă zi. Calendarul complet, cu minivacanțele, e la{" "}
                  <Link href={`/zile-libere-${an}`} className={linkCard}>zile libere {an}</Link>.
                </p>
              </div>
            </aside>
          </div>

          {/* CALCUL PE INTERVAL */}
          <div className={`${SEPARATOR_SECTIUNE} md:grid md:grid-cols-5 md:gap-6`}>
            <div className="md:col-span-3 [&>section]:mt-0">
              <CalculatorIntervalZile an={an} />
            </div>
          </div>

          {/* CE FACI CU NUMĂRUL */}
          <div className={`${SEPARATOR_SECTIUNE} md:grid md:grid-cols-5 md:gap-6`}>
            <div className="md:col-span-3">
              <h2 className={TITLU_SECTIUNE}>Ce faci cu numărul de zile lucrătoare</h2>
              <p className={`mt-3 ${text}`}>
                Dacă ai salariu lunar fix, nimic nu se schimbă: primești aceeași sumă într-o lună scurtă ca într-una
                lungă. Numărul de zile contează când plata sau un beneficiu se calculează pe zi ori pe oră:
              </p>
              <Formula
                eticheta="Calcule pe baza zilelor lucrătoare"
                randuri={[
                  "Ore de lucru  = zile lucrătoare × 8",
                  "Plata pe oră  = salariu brut ÷ ore de lucru din lună",
                  "Tichete       = cel mult unul pe zi lucrată",
                ]}
              />
              <p className={text}>
                De aceea, aceeași oră de muncă valorează mai mult într-o lună cu puține zile lucrătoare. Pentru netul
                lunar, cu taxele pe rând, folosește{" "}
                <Link href="/" className={linkCard}>calculatorul de salariu net</Link>.
              </p>
            </div>
            <aside className="mt-8 md:col-span-2 md:mt-0 md:self-start">
              <div className={card}>
                <h2 className={CARD_TITLU}>Unde se folosește numărul</h2>
                <ul className={`${LISTA_CARD} text-stone-600`}>
                  <li>
                    <Link href="/calculator-ore-suplimentare" className={linkCard}>Ore suplimentare</Link>: plata pe oră, cu
                    sporul pentru ore în plus, noapte și sărbători.
                  </li>
                  <li>
                    <Link href="/calculator-salariu-part-time" className={linkCard}>Part-time</Link>: salariul la o normă de
                    4 sau 6 ore pe zi.
                  </li>
                  <li>
                    <Link href="/fluturas-salariu" className={linkCard}>Fluturaș de salariu</Link>: zilele lucrate și netul
                    lunii, într-un PDF.
                  </li>
                </ul>
              </div>
            </aside>
          </div>

        </div>
      </div>
    </>
  );
}
