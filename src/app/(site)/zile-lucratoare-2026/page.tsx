import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { SARBATORI_LEGALE_2026, zileLucratoareLuna } from "@/lib/sarbatori";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow } from "@/app/components/ui";
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

// Luna curentă în fusul orar al României. Titlul, blocul „Răspuns rapid" și una
// dintre întrebările FAQ vizează luna în curs, pentru că acolo e cererea reală
// („zile lucrătoare <lună> 2026"). Calculul se face la fiecare regenerare ISR,
// nu la build: altfel pagina promite în SERP o lună deja încheiată.
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

function faqLuna() {
  const index = lunaCurentaIndex();
  if (index === null) {
    return {
      q: `Câte zile lucrătoare are fiecare lună din ${YEAR}?`,
      a: `Tabelul lunar de mai jos arată zilele lucrătoare, orele de lucru și sărbătorile legale pentru fiecare dintre cele 12 luni ale anului ${YEAR}.`,
    };
  }
  const row = rows[index];
  const luna = row.name.toLowerCase();
  const sarbatori = row.holidays.filter((h) => !h.weekend);
  const nota = sarbatori.length
    ? `Norma lunară este redusă de ${sarbatori.length === 1 ? "o sărbătoare legală" : `${sarbatori.length} sărbători legale`} care cad în zile lucrătoare.`
    : "Luna nu are nicio sărbătoare legală care să reducă norma de lucru.";
  return {
    q: `Câte zile lucrătoare are luna ${luna} ${YEAR}?`,
    a: `${row.name} ${YEAR} are ${row.lucratoare} de zile lucrătoare și ${row.ore} de ore de lucru la program de 8 ore pe zi. ${nota}`,
  };
}

const faqList = () => [
  {
    q: "Câte zile lucrătoare are anul 2026?",
    a: "Anul 2026 are 250 de zile lucrătoare în România, calculat pentru program luni-vineri și cu sărbătorile legale scăzute.",
  },
  {
    q: "Câte ore lucrătoare sunt în 2026?",
    a: "La program standard de 8 ore pe zi, 2026 are 2.000 de ore lucrătoare.",
  },
  faqLuna(),
  {
    q: "Zilele lucrătoare schimbă salariul lunar?",
    a: "Nu pentru un salariu lunar fix. Salariul brut negociat se plătește lunar, dar numărul de zile lucrătoare contează pentru tarif orar, pontaj, part-time și tichete.",
  },
];

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
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      datePublished: "2026-07-06",
      dateModified: PAGE_LAST_MODIFIED["/zile-lucratoare-2026"].toISOString().slice(0, 10),
      mainEntityOfPage: `https://salariile.ro${PATH}`,
    },
    {
      "@type": "FAQPage",
      mainEntity: faqList().map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
});

export default function ZileLucratoare2026Page() {
  const FAQ = faqList();
  const lunaIndex = lunaCurentaIndex();
  const lunaCurenta = lunaIndex === null ? null : rows[lunaIndex];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Zile lucrătoare 2026" }]} />
        <H1>Zile lucrătoare 2026</H1>
        <p className="mt-3 text-sm text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2">
          Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat 21 august 2026
        </p>
        <Lead>
          În 2026 sunt <strong>{TOTAL_LUCRATOARE} zile lucrătoare</strong> și <strong>{TOTAL_ORE.toLocaleString("ro-RO")} ore de lucru</strong> la program standard de 8 ore pe zi.
        </Lead>
        <Eyebrow>Calendar luni-vineri · sărbători legale scăzute</Eyebrow>
      </Hero>

      <div>
        <Section wide>
          <CalculatorIntervalZile />
          <Link href="/zile-lucratoare-2027" className="mt-4 inline-flex min-h-11 items-center underline">Zile lucrătoare 2027 și export CSV</Link>
          <div className="rounded-md border border-stone-300 bg-surface p-5 shadow-soft sm:p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-600">Răspuns rapid pentru luna curentă</p>
            <h2 id="luna-curenta" className="mt-2">
              {lunaCurenta ? `Zile lucrătoare ${lunaCurenta.name.toLowerCase()} ${YEAR}` : `Zile lucrătoare în ${YEAR}`}
            </h2>
            <p className="mt-3 max-w-prose">
              {lunaCurenta ? (
                <>
                  {lunaCurenta.name} {YEAR} are <strong>{lunaCurenta.lucratoare} de zile lucrătoare</strong> și{" "}
                  <strong>{lunaCurenta.ore} de ore de lucru</strong> la program de 8 ore pe zi.{" "}
                  {lunaCurenta.holidays.filter((h) => !h.weekend).length === 0
                    ? "Luna nu are nicio sărbătoare legală care să reducă norma de lucru."
                    : `Norma lunară este redusă de ${lunaCurenta.holidays.filter((h) => !h.weekend).length === 1 ? "o sărbătoare legală care cade" : `${lunaCurenta.holidays.filter((h) => !h.weekend).length} sărbători legale care cad`} în zile lucrătoare.`}
                </>
              ) : (
                <>
                  Anul {YEAR} are <strong>{TOTAL_LUCRATOARE} de zile lucrătoare</strong> și{" "}
                  <strong>{TOTAL_ORE.toLocaleString("ro-RO")} de ore de lucru</strong> la program de 8 ore pe zi.
                </>
              )}
            </p>
            <p className="source-note"><a href="#tabel-2026">Vezi toate lunile din 2026 în tabel</a>.</p>
          </div>
        </Section>

        <Section wide>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
              <div className="text-3xl font-bold tabular-nums text-stone-900">{TOTAL_LUCRATOARE}</div>
              <p className="mt-1 text-xs uppercase tracking-wide text-stone-600">Zile lucrătoare</p>
            </div>
            <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
              <div className="text-3xl font-bold tabular-nums text-stone-900">{TOTAL_ORE.toLocaleString("ro-RO")}</div>
              <p className="mt-1 text-xs uppercase tracking-wide text-stone-600">Ore de lucru</p>
            </div>
            <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
              <div className="text-3xl font-bold tabular-nums text-stone-900">{TOTAL_LIBERE}</div>
              <p className="mt-1 text-xs uppercase tracking-wide text-stone-600">Zile libere total</p>
            </div>
          </div>
        </Section>

        <Section>
          <div id="tabel-2026" className="scroll-mt-24" />
          <h2>Tabel zile lucrătoare 2026</h2>
          <p>
            Tabelul scade weekendurile și sărbătorile legale care cad în zile de luni-vineri. Este util pentru pontaj, tarif orar, tichete de masă și contracte part-time.
          </p>

          <div className="my-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600">
              <span className="font-medium text-stone-700">Sari la lună:</span>
              {rows.map((r) => (
                <a
                  key={r.name}
                  href={`#${r.name.toLowerCase()}`}
                  className="rounded border border-stone-200 bg-surface px-1.5 py-0.5 text-stone-700 hover:border-stone-400 hover:text-stone-900"
                >
                  {r.name.slice(0, 3)}
                </a>
              ))}
            </div>
            <a
              href={CSV_DATA_URI}
              download={`zile-lucratoare-${YEAR}.csv`}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-surface px-3 py-1 text-xs font-medium text-stone-700 shadow-soft hover:border-stone-400 hover:bg-stone-50 hover:text-stone-900"
              title="Descarcă tabelul complet în format CSV pentru Excel sau pontaj"
            >
              <svg className="h-3.5 w-3.5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descarcă tabelul (CSV)
            </a>
          </div>

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
                {rows.map((row) => (
                  <tr key={row.name} id={row.name.toLowerCase()} className="scroll-mt-24">
                    <td className="font-medium text-stone-900">
                      <a href={`#${row.name.toLowerCase()}`} className="hover:underline">
                        {row.name}
                      </a>
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
          <p className="source-note">
            Dacă ai nevoie de calendar vizual și minivacanțe, vezi pagina completă de <Link href="/zile-libere-2026">zile libere 2026</Link>.
          </p>
        </Section>

        <Section>
          <h2>Sărbători legale scăzute din zilele lucrătoare</h2>
          <p>
            În 2026 sunt 16 sărbători legale în calendar, dar doar cele care cad în zile lucrătoare reduc norma de lucru lunară. Cele care cad sâmbăta sau duminica nu se recuperează automat.
          </p>
          <TabelArticol>
              <thead>
                <tr>
                  <th>Luna</th>
                  <th>Sărbători legale în lună</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name}>
                    <td className="font-medium text-stone-900">{row.name}</td>
                    <td>
                      {row.holidays.length
                        ? row.holidays.map((h) => `${h.day} ${row.name.toLowerCase()} - ${h.label}${h.weekend ? " (weekend)" : ""}`).join("; ")
                        : "Nu sunt sărbători legale"}
                    </td>
                  </tr>
                ))}
              </tbody>
          </TabelArticol>
        </Section>

        <Section>
          <h2>De ce contează pentru salarii</h2>
          <p>
            Pentru un salariat cu salariu lunar fix, numărul de zile lucrătoare nu schimbă salariul brut sau net al lunii. Totuși, contează în calcule operaționale:
          </p>
          <ul>
            <li>tarif orar și normă lunară de lucru;</li>
            <li>contracte part-time și pontaj;</li>
            <li>număr de tichete de masă acordate;</li>
            <li>comparații între luni cu 18 zile lucrătoare și luni cu 23 zile lucrătoare.</li>
          </ul>
          <p>
            Pentru netul lunar exact, cu taxe defalcate, folosește <Link href="/">calculatorul salariu net 2026</Link>.
          </p>
        </Section>

        <Section>
          <h2>Întrebări frecvente</h2>
          {FAQ.map((item) => (
            <section key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </section>
          ))}
        </Section>

        <Section>
          <h2>Surse și pagini conexe</h2>
          <ul>
            <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Codul Muncii, Legea 53/2003</a> · art. 139 și art. 142</li>
            <li><Link href="/zile-libere-2026">Zile libere 2026</Link>, calendar vizual și punți</li>
            <li><Link href="/noutati/zile-libere-ramase-2026-minivacante">Zile libere rămase și minivacanțe în 2026</Link></li>
            <li><Link href="/salariu-minim">Salariul minim 2026</Link>, pentru normă și calcul net</li>
            <li><Link href="/fluturas-salariu">Generator fluturaș salariu</Link>, pentru fluturaș PDF orientativ</li>
            <li><Link href="/calculator-ore-suplimentare">Calculator ore suplimentare</Link>, pentru sporul de 75%, cel de noapte și cel de sărbători</li>
          </ul>
          <p className="source-note">Pagina actualizată: 15 iulie 2026.</p>
        </Section>
      </div>
    </>
  );
}
