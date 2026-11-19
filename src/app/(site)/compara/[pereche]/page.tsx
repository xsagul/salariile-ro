// src/app/(site)/compara/[pereche]/page.tsx
// Doua meserii puse alaturi net-first, pe cifrele verificate ale paginilor lor,
// cu contextul INS separat in tabelul de detalii.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { notFound } from "next/navigation";
import { Breadcrumb, Faq, H1, Lead, TITLU_CARD, TITLU_SECTIUNE, SPATIU_JOS, SPATIU_SUS } from "@/app/components/ui";
import { LinkCard, NotaSursa, lei, lunaLunga } from "@/app/components/Salarii";
import {
  AN_OCUPATII,
  LUNA_REFERINTA,
  MATRICE_BRUT,
  MATRICE_NET,
  MATRICE_OCUPATII,
} from "@/lib/ins-date";
import {
  COMPARATII,
  comparatiiInrudite,
  dateMeserieSauEroare,
  getComparatie,
  type Comparatie,
  type DateMeserie,
} from "@/lib/meserii";
import ReperSalariu from "@/app/components/ReperSalariu";
import { reperMeserie, textReper } from "@/lib/repere-meserii";
import { concluzieMeserie } from "@/app/components/SalariuConcluzie";
import { netDeStart } from "@/app/components/SalariuGrila";
import { netOficialDeStart } from "@/app/components/SalariuOficial";
import { netDeclarat } from "@/app/components/SalariuDeclarat";
import { brutDinNetStandard, calculStandard } from "@/lib/fiscal";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, MESERII_LAST_MODIFIED } from "@/lib/seo";
import { TABEL_STANDARD } from "@/app/components/TabelArticol";

type CifraVerificata = {
  net: number;
  brutEstimat: number;
  costFirma: number;
  text: string;
  sursa: string;
  perioada: string | null;
  tip: string;
  nota: string;
};

const LUNI_SCURT = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

function formateazaPerioade(perioade: string[]): string | null {
  if (!perioade.length) return null;
  const luna = (p: string) => `${LUNI_SCURT[Number(p.slice(5, 7)) - 1]} ${p.slice(0, 4)}`;
  if (perioade.length === 1) return luna(perioade[0]);
  const [a, b] = [perioade[0], perioade[perioade.length - 1]];
  return a.slice(0, 4) === b.slice(0, 4)
    ? `${LUNI_SCURT[Number(a.slice(5, 7)) - 1]}–${luna(b)}`
    : `${luna(a)}–${luna(b)}`;
}

function cifraVerificata(slug: string): CifraVerificata | null {
  const build = (
    net: number,
    text: string,
    sursa: string,
    perioada: string | null,
    tip: string,
    nota: string,
  ): CifraVerificata => {
    const brutEstimat = Math.round(brutDinNetStandard(net) / 10) * 10;
    const costFirma = calculStandard(brutEstimat)?.costTotal ?? Math.round(brutEstimat * 1.0225);
    return { net, brutEstimat, costFirma, text, sursa, perioada, tip, nota };
  };

  const c = concluzieMeserie(slug);
  if (c) {
    const perioada =
      c.sursa === "platit" && c.platit?.perioade?.length
        ? formateazaPerioade(c.platit.perioade)
        : c.sursa === "oferit"
          ? "2026"
          : null;
    return build(
      c.net,
      `${lei(c.net)} lei net`,
      c.sursa === "platit" ? "salarii plătite la stat" : "anunțuri verificate",
      perioada,
      `concluzie-${c.sursa}`,
      c.sursa === "platit"
        ? "Salariul fix net din statele publicate de instituții publice, fără ture și gărzi."
        : "Mijlocul salariilor oferite la angajare în anunțurile verificate.",
    );
  }
  const g = netDeStart(slug);
  if (g) {
    return build(
      g,
      `de la ${lei(g)} lei net`,
      "grila legală",
      null,
      "grila-legala",
      "Salariul de pornire din grila legii, înainte de vechime și sporuri.",
    );
  }
  const o = netOficialDeStart(slug);
  if (o) {
    return build(
      o,
      `de la ${lei(o)} lei net`,
      "tabel oficial",
      null,
      "venit-oficial-platit",
      "Venitul net de pornire din tabelul publicat de angajatorul public.",
    );
  }
  const d = netDeclarat(slug);
  if (d) {
    return build(
      d,
      `${lei(d)} lei net`,
      "reper declarat",
      null,
      "declarat",
      "Media sau mijlocul salariilor declarate pentru această meserie.",
    );
  }
  return null;
}

interface Props {
  params: Promise<{ pereche: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARATII.map((comparatie) => ({ pereche: comparatie.slug }));
}

const LUNA = lunaLunga(LUNA_REFERINTA);
const AN_ANCHETA = AN_OCUPATII.replace("Anul ", "");
const BRAND = " | Salariile";
const TITLU_MAX = 60;

function titluPagina(comparatie: Comparatie) {
  const complet = `${comparatie.a.nume} vs ${comparatie.b.nume}: salarii nete 2026`;
  const scurt = complet.length <= TITLU_MAX ? complet : `${comparatie.a.nume} vs ${comparatie.b.nume}: net 2026`;
  return scurt.length + BRAND.length <= TITLU_MAX ? `${scurt}${BRAND}` : scurt;
}

function descrierePagina(a: DateMeserie, b: DateMeserie) {
  return `Compară ${a.meserie.nume.toLocaleLowerCase("ro-RO")} și ${b.meserie.nume.toLocaleLowerCase("ro-RO")}: salarii nete și brute în 2026, surse, atribuții și context INS pe sector.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pereche } = await params;
  const comparatie = getComparatie(pereche);
  if (!comparatie) return {};
  const a = dateMeserieSauEroare(comparatie.a);
  const b = dateMeserieSauEroare(comparatie.b);
  const descriere = descrierePagina(a, b);
  const titluSocial = `${comparatie.a.nume} vs ${comparatie.b.nume}: salarii nete 2026`;

  return {
    title: { absolute: titluPagina(comparatie) },
    description: descriere,
    alternates: { canonical: `https://salariile.ro/compara/${pereche}` },
    openGraph: ogPage({ title: titluSocial, description: descriere, path: `/compara/${pereche}` }),
    twitter: twPage({ title: titluSocial, description: descriere }),
  };
}

function reperIsco(d: DateMeserie, camp: "brut" | "net") {
  return d.repere ? `${lei(d.repere.grupa[camp])} lei` : "—";
}

export default async function ComparatiePage({ params }: Props) {
  const { pereche } = await params;
  const comparatie = getComparatie(pereche);
  if (!comparatie) notFound();

  const a = dateMeserieSauEroare(comparatie.a);
  const b = dateMeserieSauEroare(comparatie.b);
  const inrudite = comparatiiInrudite(comparatie);
  const aceeasiGrupa = a.meserie.isco === b.meserie.isco;
  const acelasiSector = a.sector.cheie === b.sector.cheie;
  const ra = reperMeserie(a);
  const rb = reperMeserie(b);
  const ca = cifraVerificata(a.meserie.slug);
  const cb = cifraVerificata(b.meserie.slug);

  const numeA = a.meserie.nume.toLocaleLowerCase("ro-RO");
  const numeB = b.meserie.nume.toLocaleLowerCase("ro-RO");

  const faq = [
    {
      q: `Care se plătește mai bine: ${numeA} sau ${numeB}?`,
      a: `${ca ? `Pentru ${numeA}, reperul de pe pagină este ${ca.text} (${ca.sursa})` : `Pentru ${numeA}, reperul este ${textReper(ra)} ${ra.unit}`}, iar ${cb ? `pentru ${numeB} este ${cb.text} (${cb.sursa})` : `pentru ${numeB} este ${textReper(rb)} ${rb.unit}`}. În practică, diferența dintre două oferte concrete depinde mult de vechime, oraș, sporuri și mărimea angajatorului.`,
    },
    {
      q: `Cât este salariul brut pentru ${numeA} și pentru ${numeB}?`,
      a:
        ca && cb
          ? `La impozitarea standard (fără persoane în întreținere), un net de ${lei(ca.net)} lei pentru ${numeA} înseamnă aproximativ ${lei(ca.brutEstimat)} lei brut (cost firmă ${lei(ca.costFirma)} lei), iar un net de ${lei(cb.net)} lei pentru ${numeB} înseamnă aproximativ ${lei(cb.brutEstimat)} lei brut (cost firmă ${lei(cb.costFirma)} lei).`
          : "Brutul depinde de situația fiscală individuală și se poate calcula exact cu calculatorul de pe prima pagină.",
    },
    acelasiSector
      ? {
          q: `Cum stă sectorul ${a.sector.denumire.toLocaleLowerCase("ro-RO")} în datele INS?`,
          a: `În ${LUNA}, câștigul mediu net pe întreg sectorul CAEN ${a.sector.cheie} a fost ${a.netObservat ? `${lei(a.netObservat)} lei` : "nepublicat"}. Media de sector adună toți angajații din domeniu, de la debutanți la conducere, așa că nu este un minim și nici un maxim pentru ${numeA} ori ${numeB}.`,
        }
      : {
          q: `Ce arată mediile INS pentru domeniile în care lucrează ${numeA} și ${numeB}?`,
          a: `În ${LUNA}, sectorul CAEN ${a.sector.cheie} (${a.sector.denumire.toLocaleLowerCase("ro-RO")}) a avut o medie netă de ${a.netObservat ? `${lei(a.netObservat)} lei` : "—"}, iar sectorul CAEN ${b.sector.cheie} (${b.sector.denumire.toLocaleLowerCase("ro-RO")}) de ${b.netObservat ? `${lei(b.netObservat)} lei` : "—"}. Mediile de sector nu sunt un minim și un maxim, dar arată nivelul general al fiecărui domeniu.`,
        },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
          { "@type": "ListItem", position: 2, name: "Compară salarii", item: "https://salariile.ro/compara" },
          {
            "@type": "ListItem",
            position: 3,
            name: `${comparatie.a.nume} vs ${comparatie.b.nume}`,
            item: `https://salariile.ro/compara/${pereche}`,
          },
        ],
      },
      {
        "@type": "Article",
        headline: `${comparatie.a.nume} vs ${comparatie.b.nume}: salarii nete 2026`,
        description: descrierePagina(a, b),
        author: personSchema,
        publisher: {
          "@type": "Organization",
          name: "Salariile",
          logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
        },
        mainEntityOfPage: `https://salariile.ro/compara/${pereche}`,
        dateModified: MESERII_LAST_MODIFIED.toISOString().slice(0, 10),
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

  const randuriTabel = [
    {
      eticheta: "Salariu net pe lună",
      a: ca ? ca.text : `${textReper(ra)} ${ra.unit}`,
      b: cb ? cb.text : `${textReper(rb)} ${rb.unit}`,
    },
    ...(ca && cb
      ? [
          { eticheta: "Brut echivalent estimat", a: `≈ ${lei(ca.brutEstimat)} lei`, b: `≈ ${lei(cb.brutEstimat)} lei` },
          { eticheta: "Cost total angajator", a: `≈ ${lei(ca.costFirma)} lei`, b: `≈ ${lei(cb.costFirma)} lei` },
        ]
      : []),
    { eticheta: "Sursa cifrei", a: ca ? ca.sursa : ra.label, b: cb ? cb.sursa : rb.label },
    { eticheta: "Perioada reperului", a: ca?.perioada ?? ra.period, b: cb?.perioada ?? rb.period },
    { eticheta: "Ce face meseria", a: a.meserie.ceFace, b: b.meserie.ceFace },
    {
      eticheta: `Net mediu pe sector INS (${LUNA})`,
      a: a.netObservat === null ? "—" : `${lei(a.netObservat)} lei`,
      b: b.netObservat === null ? "—" : `${lei(b.netObservat)} lei`,
    },
    { eticheta: "Sector CAEN", a: `${a.sector.cheie}: ${a.sector.denumire}`, b: `${b.sector.cheie}: ${b.sector.denumire}` },
    { eticheta: "Grupă de ocupații ISCO", a: a.isco?.nume ?? "—", b: b.isco?.nume ?? "—" },
    { eticheta: "Net indexat pe grupa ISCO", a: reperIsco(a, "net"), b: reperIsco(b, "net") },
  ];

  const descriereSector = acelasiSector
    ? `Ambele meserii lucrează în același sector economic (${a.sector.denumire.toLocaleLowerCase("ro-RO")}, CAEN ${a.sector.cheie}), unde media netă INS din ${LUNA} a fost ${a.netObservat ? `${lei(a.netObservat)} lei` : "indisponibilă"}.`
    : `${a.meserie.nume} intră în sectorul „${a.sector.denumire.toLocaleLowerCase("ro-RO")}” (${a.netObservat ? `${lei(a.netObservat)} lei net` : "fără medie netă"} în ${LUNA}), în timp ce ${numeB} intră în „${b.sector.denumire.toLocaleLowerCase("ro-RO")}” (${b.netObservat ? `${lei(b.netObservat)} lei net` : "fără medie netă"}).`;

  const descriereGrupa = aceeasiGrupa
    ? `În clasificarea ocupațiilor, ambele fac parte din aceeași grupă majoră („${a.isco?.nume ?? "—"}”), deci diferența de plată vine din cererea pieței, specializare și tipul angajatorului, nu din nivelul general de calificare.`
    : `Cele două ocupații intră în grupe diferite (${a.isco?.nume ?? "—"} față de ${b.isco?.nume ?? "—"}), cu trepte de intrare și responsabilități distincte.`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS} [&>*]:max-w-4xl`}>
          <Breadcrumb
            items={[
              { href: "/", label: "Acasă" },
              { href: "/compara", label: "Compară salarii" },
              { label: `${comparatie.a.nume} vs ${comparatie.b.nume}` },
            ]}
          />
          <H1>
            {comparatie.a.nume} vs {comparatie.b.nume}
          </H1>
          <Lead>Salariile nete, unul lângă altul. Deschide detaliile pentru brut, costul firmei și contextul INS.</Lead>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {[
              { d: a, c: ca },
              { d: b, c: cb },
            ].map(({ d, c }) => (
              <div key={d.meserie.slug}>
                <h2 className={TITLU_CARD}>{d.meserie.nume}</h2>
                {c ? (
                  <section
                    className="mt-4 rounded-md border border-stone-300 bg-surface p-5 sm:p-6"
                    data-salary-kind={c.tip}
                    data-salary-primary={c.net}
                  >
                    <p className="text-xs font-medium text-stone-700">Reper net lunar ({c.sursa})</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{c.text}</p>
                    <p className="mt-1 text-sm text-stone-700">≈ {lei(c.brutEstimat)} lei brut pe lună</p>
                    <p className="mt-2 text-sm text-stone-600">{c.nota}</p>
                    <p className="mt-3 text-xs text-stone-600">
                      <Link className="underline underline-offset-2" href={`/salarii/${d.meserie.slug}`}>
                        Vezi toate detaliile și sursele
                      </Link>
                    </p>
                  </section>
                ) : (
                  <ReperSalariu date={d} />
                )}
              </div>
            ))}
          </div>

          {(ca?.sursa ?? ra.label) !== (cb?.sursa ?? rb.label) ? (
            <div className="mt-6 rounded-md border border-stone-300 bg-surface p-4 text-xs text-stone-700">
              <strong className="text-stone-900">Surse diferite:</strong> pentru {numeA} cifra vine din {ca?.sursa ?? ra.label}, iar pentru {numeB} din {cb?.sursa ?? rb.label}. Le punem alături ca puncte de orientare, nu ca o comparație între două contracte identice.
            </div>
          ) : (
            <p className="mt-4 text-xs text-stone-600">
              Ambele cifre vin din același tip de sursă ({ca?.sursa ?? ra.label}). Salariul real depinde de experiență, oraș și firmă.
            </p>
          )}

          <details className="mt-8">
            <summary className="min-h-11 cursor-pointer py-3 text-lg font-semibold">Detalii ale comparației</summary>
            <p className="mt-3 text-sm text-stone-600">Mediile de sector și reperele ISCO nu sunt un minim și un maxim salarial.</p>
            <h2 className={TITLU_SECTIUNE}>Net, brut și context statistic</h2>
            <div className="my-6 overflow-x-auto">
              <table className={`${TABEL_STANDARD} min-w-[34rem]`}>
                <caption className="sr-only">
                  Date salariale pentru {comparatie.a.nume} și {comparatie.b.nume}
                </caption>
                <thead>
                  <tr>
                    <th className="border-b border-stone-200 bg-antet px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                      Indicator
                    </th>
                    <th className="border-b border-stone-200 bg-antet px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      {comparatie.a.nume}
                    </th>
                    <th className="border-b border-stone-200 bg-antet px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      {comparatie.b.nume}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {randuriTabel.map((rand) => (
                    <tr key={rand.eticheta}>
                      <th scope="row" className="border-b border-stone-100 px-3 py-2 text-left font-medium text-stone-900">
                        {rand.eticheta}
                      </th>
                      <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-700">{rand.a}</td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-700">{rand.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <section className="mt-12">
            <h2 className={TITLU_SECTIUNE}>
              {comparatie.a.nume} vs {comparatie.b.nume}: ce diferă în practică
            </h2>
            <p className="mt-4 text-base leading-normal text-stone-600">
              <strong className="font-semibold text-stone-900">{comparatie.a.nume}:</strong> {a.meserie.ceFace}{" "}
              {ca ? `La un net de ${lei(ca.net)} lei, costul total al angajatorului este în jur de ${lei(ca.costFirma)} lei pe lună.` : ""}
            </p>
            <p className="mt-4 text-base leading-normal text-stone-600">
              <strong className="font-semibold text-stone-900">{comparatie.b.nume}:</strong> {b.meserie.ceFace}{" "}
              {cb ? `La un net de ${lei(cb.net)} lei, costul total al angajatorului este în jur de ${lei(cb.costFirma)} lei pe lună.` : ""}
            </p>
            <p className="mt-4 text-base leading-normal text-stone-600">
              {descriereSector} {descriereGrupa}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <LinkCard
                href={`/salarii/${comparatie.a.slug}`}
                titlu={`Salariu ${numeA}`}
                detaliu={ca ? `${ca.text} · vechime, sporuri și surse` : "Detalii și surse"}
              />
              <LinkCard
                href={`/salarii/${comparatie.b.slug}`}
                titlu={`Salariu ${numeB}`}
                detaliu={cb ? `${cb.text} · vechime, sporuri și surse` : "Detalii și surse"}
              />
            </div>
          </section>

          {inrudite.length > 0 && (
            <section className="mt-12">
              <h2 className={TITLU_SECTIUNE}>Alte comparații</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {inrudite.map((alta) => (
                  <LinkCard
                    key={alta.slug}
                    href={`/compara/${alta.slug}`}
                    titlu={`${alta.a.nume} vs ${alta.b.nume}`}
                  />
                ))}
              </div>
            </section>
          )}

          <NotaSursa>
            Context statistic: Institutul Național de Statistică, TEMPO-Online, matricele {MATRICE_BRUT} și {MATRICE_NET}{" "}
            (activități CAEN Rev.3, {LUNA}) și {MATRICE_OCUPATII} (grupe majore ISCO, octombrie {AN_ANCHETA}). Bruturile
            și costurile de angajator sunt calculate standard; detalii în <Link href="/metodologie">metodologie</Link>.
          </NotaSursa>
        </div>
      </div>

      <Faq items={faq} />
    </>
  );
}
