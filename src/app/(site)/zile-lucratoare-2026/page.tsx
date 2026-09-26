import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { SARBATORI_LEGALE_2026, zileLucratoareLuna } from "@/lib/sarbatori";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { Hero, Section, H1, Lead, Formula, CardCompanion, LISTA_CARD } from "@/app/components/ui";
import TabelArticol from "@/app/components/TabelArticol";
import CalculatorIntervalZile from '@/app/components/CalculatorIntervalZile';

const PATH = "/zile-lucratoare-2026";
const YEAR = 2026;
const MONTHS = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
] as const;

const rows = MONTHS.map((name, index) => {
  const zileCalendaristice = new Date(Date.UTC(YEAR, index + 1, 0)).getUTCDate();
  const lucratoare = zileLucratoareLuna(YEAR, index);
  const holidays = Object.entries(SARBATORI_LEGALE_2026)
    .map(([key, label]) => {
      const [month, day] = key.split("-").map(Number);
      if (month !== index + 1) return null;
      const dow = new Date(Date.UTC(YEAR, index, day)).getUTCDay();
      return { day, label, weekend: dow === 0 || dow === 6 };
    })
    .filter(Boolean) as { day: number; label: string; weekend: boolean }[];

  return {
    name,
    zileCalendaristice,
    lucratoare,
    ore: lucratoare * 8,
    libere: zileCalendaristice - lucratoare,
    holidays,
  };
});

// Doar ele scad zile din normă; din aceleași date ca tabelul.
const SARBATORI_IN_SAPTAMANA = rows.flatMap((r) =>
  r.holidays.filter((h) => !h.weekend).map((h) => ({ data: `${h.day} ${r.name.toLowerCase()}`, label: h.label })),
);
const TOTAL_LUCRATOARE = rows.reduce((sum, row) => sum + row.lucratoare, 0);
const TOTAL_ORE = TOTAL_LUCRATOARE * 8;
const TOTAL_LIBERE = 365 - TOTAL_LUCRATOARE;

const CSV_CONTENT = [
  "Luna,Zile lucratoare,Ore lucratoare (8h/zi),Zile libere,Sarbatori legale",
  ...rows.map((r) => {
    const s = r.holidays.map((h) => `${h.day} ${r.name.toLowerCase()} (${h.label}${h.weekend ? " - weekend" : ""})`).join("; ");
    return `"${r.name}",${r.lucratoare},${r.ore},${r.libere},"${s}"`;
  }),
  `"Total ${YEAR}",${TOTAL_LUCRATOARE},${TOTAL_ORE},${TOTAL_LIBERE},""`,
].join("\r\n");

const CSV_DATA_URI = `data:text/csv;charset=utf-8,${encodeURIComponent(CSV_CONTENT)}`;

// Luna curentă în fusul orar al României. Descrierea și cardul de lângă
// calculator vizează luna în curs, pentru că acolo e cererea reală
// („zile lucrătoare <lună> 2026"). Rebuild-ul zilnic o mută la luna următoare.
function lunaCurentaIndex(): number | null {
  const acum = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Bucharest" }));
  return acum.getFullYear() === YEAR ? acum.getMonth() : null;
}

// Titlul ramane ANUAL tot anul; luna curenta traieste in descriere.
// Masurat in GSC pe 21 august 2026: potrivirea titlului cu luna NU ridica
// CTR-ul pe interogarile lunare. In iulie, cu titlul pe "iulie",
// "zile lucratoare iulie 2026" a facut 0,2% (15 clicuri / 6.290 impresii).
// In august, cu titlul pe "august", "zile lucratoare august 2026" face tot
// 0,2% (9 / 3.603). Clusterul e zero-click: Google si competitorii afiseaza
// numarul direct in SERP. In schimb interogarea ANUALA e cea mai mare a
// paginii (14.979 impresii, pozitia 4,2) si primea un titlu care promitea o
// luna diferita de ce se cautase.
function metaLuna() {
  const index = lunaCurentaIndex();
  const title = `Zile lucrătoare ${YEAR}: ${TOTAL_LUCRATOARE} de zile și ${TOTAL_ORE.toLocaleString("ro-RO")} ore`;
  if (index === null) {
    return {
      title,
      description: `${title}. Tabel lunar cu zilele lucrătoare, sărbătorile legale scăzute din normă și totalul anual.`,
    };
  }
  const row = rows[index];
  return {
    title,
    description: `${title}. ${row.name}: ${row.lucratoare} de zile și ${row.ore} de ore. Tabel complet pe toate lunile, cu sărbătorile legale scăzute din normă.`,
  };
}

// Luna curentă din descriere se calculează la build. Pe găzduirea statică nu
// există regenerare la cerere: rebuild-ul zilnic din .github/workflows/ci.yml
// o face să treacă singură la luna următoare.

export function generateMetadata(): Metadata {
  const { title, description } = metaLuna();
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `https://salariile.ro${PATH}` },
    openGraph: ogPage({ title, description, path: PATH }),
    twitter: twPage({ title, description }),
  };
}

const buildJsonLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Zile lucrătoare 2026", item: `https://salariile.ro${PATH}` },
      ],
    },
    {
      "@type": "Article",
      headline: "Zile lucrătoare 2026 în România",
      description: metaLuna().description,
      url: `https://salariile.ro${PATH}`,
      inLanguage: "ro-RO",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      datePublished: "2026-07-06",
      dateModified: PAGE_LAST_MODIFIED["/zile-lucratoare-2026"].toISOString().slice(0, 10),
      mainEntityOfPage: `https://salariile.ro${PATH}`,
    },
  ],
});

// Filele cu anii, ca la zile libere (PaginaZileLibere.tsx). Doar anii care au pagină.
const ANI_ZILE_LUCRATOARE = [2026, 2027] as const;
function AniZileLucratoare({ an }: { an: number }) {
  return (
    <nav aria-label="Zile lucrătoare pe ani" className="mt-5 flex w-full rounded-md border border-stone-300 bg-surface p-1 shadow-soft sm:inline-flex sm:w-auto">
      {ANI_ZILE_LUCRATOARE.map((x) => (
        <Link
          key={x}
          href={`/zile-lucratoare-${x}`}
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

export default function ZileLucratoare2026Page() {
  const lunaIndex = lunaCurentaIndex();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }} />

      <Hero>
        <H1>Zile lucrătoare 2026</H1>
        {/* Fără cale de navigare, autor și dată sus: e pagină-instrument, ca zile libere (proprietar, 27 sept. 2026). */}
        <Lead>
          În 2026 sunt <strong>{TOTAL_LUCRATOARE} de zile lucrătoare</strong>, adică {TOTAL_ORE.toLocaleString("ro-RO")} de ore la
          program de 8 ore pe zi. Restul de {TOTAL_LIBERE} de zile sunt weekenduri și sărbători legale.
        </Lead>
        <AniZileLucratoare an={YEAR} />
      </Hero>

      <Section
        noTopBorder
        companion={
          <CardCompanion titlu="Sărbătorile care scad o zi de lucru">
            <ul className={`${LISTA_CARD} text-stone-600`}>
              {SARBATORI_IN_SAPTAMANA.map((h) => (
                <li key={h.data}>
                  <span className="font-medium text-stone-900">{h.data}</span> · {h.label}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-stone-600">
              Cele care pică sâmbăta sau duminica nu se recuperează în altă zi. Calendarul complet, cu punțile, e la{" "}
              <Link href="/zile-libere-2026" className="LINK">zile libere 2026</Link>.
            </p>
          </CardCompanion>
        }
      >
        {/* Tabelul începe secțiunea, fără titlu deasupra, ca să fie aliniat cu cardul din
            dreapta, ca la zile libere (proprietar, 27 sept. 2026). Fără marginea de sus a
            tabelului, altfel pornește cu 24 px sub card. */}
        <div className="[&>.table-wrap]:mt-0">
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
                    aria-current={i === lunaIndex ? "date" : undefined}
                    className={`scroll-mt-24 ${i === lunaIndex ? "bg-antet font-semibold text-stone-900" : ""}`}
                  >
                    <td className="font-medium text-stone-900">
                      <a href={`#${row.name.toLowerCase()}`} className="hover:underline">
                        {row.name}
                      </a>
                      {i === lunaIndex ? <span className="ml-2 text-xs font-normal text-stone-600">luna curentă</span> : null}
                    </td>
                    <td className="text-right tabular-nums">{row.lucratoare}</td>
                    <td className="text-right tabular-nums">{row.ore}</td>
                    <td className="text-right tabular-nums">{row.libere}</td>
                  </tr>
                ))}
                <tr>
                  <td className="font-bold text-stone-900">Total 2026</td>
                  <td className="text-right font-bold tabular-nums text-stone-900">{TOTAL_LUCRATOARE}</td>
                  <td className="text-right font-bold tabular-nums text-stone-900">{TOTAL_ORE.toLocaleString("ro-RO")}</td>
                  <td className="text-right font-bold tabular-nums text-stone-900">{TOTAL_LIBERE}</td>
                </tr>
              </tbody>
          </TabelArticol>
        </div>
        <p className="source-note">
          <a href={CSV_DATA_URI} download={`zile-lucratoare-${YEAR}.csv`}>Descarcă tabelul (CSV)</a> pentru Excel sau
          pontaj. Temei: <a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Codul Muncii</a>, art. 139 și 142.
        </p>
      </Section>

      {/* Cardul cu luna curentă a ieșit: repeta rândul marcat din tabel (proprietar, 27 sept. 2026). */}
      <Section>
        <CalculatorIntervalZile />
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Unde se folosește numărul">
            <ul className={`${LISTA_CARD} text-stone-600`}>
              <li>
                <Link href="/calculator-ore-suplimentare" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">Ore suplimentare</Link>: plata pe oră, cu
                sporul pentru ore în plus, noapte și sărbători.
              </li>
              <li>
                <Link href="/calculator-salariu-part-time" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">Part-time</Link>: salariul la o normă de
                4 sau 6 ore pe zi.
              </li>
              <li>
                <Link href="/fluturas-salariu" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">Fluturaș de salariu</Link>: zilele lucrate și netul
                lunii, într-un PDF.
              </li>
            </ul>
          </CardCompanion>
        }
      >
        <h2>Ce faci cu numărul de zile lucrătoare</h2>
        <p>
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
        <p>
          De aceea, aceeași oră de muncă valorează mai mult într-o lună cu puține zile lucrătoare. Pentru netul
          lunar, cu taxele pe rând, folosește <Link href="/">calculatorul de salariu net</Link>.
        </p>
      </Section>
    </>
  );
}
