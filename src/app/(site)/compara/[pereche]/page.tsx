// src/app/(site)/compara/[pereche]/page.tsx
// Doua meserii puse alaturi net-first. Valorile mari sunt mediile nete observate
// in sectoarele asociate, iar reperele ISCO vin separat. Nu construim intervale,
// medii ale reperelor, diferente derivate sau un „castigator".

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import { CardCifra, LinkCard, NotaSursa, lei, lunaLunga } from "@/app/components/Salarii";
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
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

interface Props {
  params: Promise<{ pereche: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARATII.map((comparatie) => ({ pereche: comparatie.slug }));
}

const LUNA = lunaLunga(LUNA_REFERINTA);
const AN_ANCHETA = AN_OCUPATII.replace("Anul ", "");
const BRAND = " | Salariile.ro";
const TITLU_MAX = 60;

function titluPagina(comparatie: Comparatie) {
  const complet = `${comparatie.a.nume} vs ${comparatie.b.nume}: salarii nete 2026`;
  const scurt = complet.length <= TITLU_MAX ? complet : `${comparatie.a.nume} vs ${comparatie.b.nume}: net 2026`;
  return scurt.length + BRAND.length <= TITLU_MAX ? `${scurt}${BRAND}` : scurt;
}

function netPrincipal(date: DateMeserie) {
  return date.netObservat ?? date.netStandard;
}

function descrierePagina(a: DateMeserie, b: DateMeserie) {
  const baza = `${a.meserie.nume}: ${lei(netPrincipal(a))} lei net; ${b.meserie.nume}: ${lei(netPrincipal(b))} lei net.`;
  const completa = `${baza} Medii INS pe sectoarele CAEN (${LUNA}), cu brutul și contextul ISCO afișate separat.`;
  return completa.length <= 165 ? completa : `${baza} Medii nete INS pe sectoarele CAEN, ${LUNA}.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pereche } = await params;
  const comparatie = getComparatie(pereche);
  if (!comparatie) return {};
  const a = dateMeserieSauEroare(comparatie.a);
  const b = dateMeserieSauEroare(comparatie.b);
  const descriere = descrierePagina(a, b);
  const titluSocial = `${comparatie.a.nume} vs ${comparatie.b.nume} — salarii nete 2026`;

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

  const faq = [
    {
      q: `Cine câștigă mai mult: ${comparatie.a.nume.toLocaleLowerCase("ro-RO")} sau ${comparatie.b.nume.toLocaleLowerCase("ro-RO")}?`,
      a: `Ca repere nete de sector, un ${comparatie.a.de} are ${lei(netPrincipal(a))} lei pe lună, iar un ${comparatie.b.de} ${lei(netPrincipal(b))} lei, conform INS pentru ${LUNA}. Cifrele compară sectoarele CAEN asociate, nu două persoane cu acele posturi, așa că experiența și angajatorul pot schimba ordinea în cazuri concrete.`,
    },
    {
      q: "Ce se poate compara corect în tabel?",
      a: `Poți compara netul mediu observat în sectoarele CAEN din ${LUNA} și, separat, netul orientativ al grupelor majore ISCO din ancheta din octombrie ${AN_ANCHETA}, indexat la nivelul salarial curent. Sunt repere utile de piață, iar salariile individuale variază.`,
    },
    {
      q: "Cum este calculat netul afișat?",
      a: "Netul principal este media observată și publicată de INS pentru sectorul CAEN. Pentru grupa ISCO și pentru comparația fiscală standard aplicăm separat CAS, CASS și impozitul pe venit la brutul aferent, pentru funcția de bază și fără persoane în întreținere.",
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
        headline: `${comparatie.a.nume} vs ${comparatie.b.nume} — salarii nete 2026`,
        description: descrierePagina(a, b),
        author: personSchema,
        publisher: {
          "@type": "Organization",
          name: "Salariile.ro",
          logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
        },
        mainEntityOfPage: `https://salariile.ro/compara/${pereche}`,
        dateModified: "2026-08-25",
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

  const randuriTabel: { eticheta: string; a: string; b: string }[] = [
    {
      eticheta: `Net mediu observat în sector, ${LUNA}`,
      a: `${lei(netPrincipal(a))} lei`,
      b: `${lei(netPrincipal(b))} lei`,
    },
    {
      eticheta: "Net calculat standard din brutul sectorului",
      a: `${lei(a.netStandard)} lei`,
      b: `${lei(b.netStandard)} lei`,
    },
    {
      eticheta: "Net orientativ · grupa ISCO",
      a: reperIsco(a, "net"),
      b: reperIsco(b, "net"),
    },
    {
      eticheta: "La început de carieră · grupa ISCO net",
      a: a.repere?.inceput ? `${lei(a.repere.inceput.net)} lei` : "—",
      b: b.repere?.inceput ? `${lei(b.repere.inceput.net)} lei` : "—",
    },
    {
      eticheta: "Activitate CAEN",
      a: `${a.sector.cheie} — ${a.sector.denumire}`,
      b: `${b.sector.cheie} — ${b.sector.denumire}`,
    },
    {
      eticheta: `Brut mediu în sector, ${LUNA}`,
      a: `${lei(a.sector.brutCurent)} lei`,
      b: `${lei(b.sector.brutCurent)} lei`,
    },
    {
      eticheta: "Grupă majoră ISCO",
      a: a.isco?.nume ?? "—",
      b: b.isco?.nume ?? "—",
    },
    {
      eticheta: `Brut mediu · grupa ISCO, indexat la ${LUNA}`,
      a: reperIsco(a, "brut"),
      b: reperIsco(b, "brut"),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
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
          <Lead>
            Ca repere actuale de sector, un {comparatie.a.de} are{" "}
            <strong>{lei(netPrincipal(a))} lei net pe lună</strong>, iar un {comparatie.b.de}{" "}
            <strong>{lei(netPrincipal(b))} lei net</strong>. Sunt mediile nete INS din sectoarele CAEN asociate, în{" "}
            {LUNA}; experiența, compania și orașul pot schimba salariile concrete.
          </Lead>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[a, b].map((date) => (
              <section key={date.meserie.slug} className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
                <h2 className="text-lg font-semibold tracking-[-0.01em] text-stone-900">{date.meserie.nume}</h2>
                <div className="mt-4 grid gap-3">
                  <CardCifra
                    accent
                    eticheta={`Salariu net orientativ · ${LUNA}`}
                    valoare={lei(netPrincipal(date))}
                    nota={`Media netă INS din sectorul CAEN ${date.sector.cheie}; ${lei(date.sector.brutCurent)} lei brut.`}
                  />
                  <CardCifra
                    eticheta="Net orientativ · grupa ISCO"
                    valoare={date.repere ? lei(date.repere.grupa.net) : "—"}
                    nota={
                      date.repere
                        ? `Calcul standard din ${lei(date.repere.grupa.brut)} lei brut · grupa „${date.isco?.nume ?? "—"}”`
                        : undefined
                    }
                  />
                </div>
              </section>
            ))}
          </div>

          <p className="mt-4 rounded-md border border-stone-200 bg-surface p-4 text-sm leading-normal text-stone-600 shadow-soft">
            <strong className="font-semibold text-stone-900">Cum citești comparația:</strong> valoarea mare este netul
            mediu observat în sector; a doua este netul orientativ al grupei ISCO. Cele două valori nu sunt un minim și
            un maxim, iar salariul unei persoane poate fi sub sau peste aceste repere.
          </p>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Net, brut și context statistic</h2>
            <div className="my-6 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft tabular-nums">
                <caption className="sr-only">
                  Repere statistice pentru {comparatie.a.nume} și {comparatie.b.nume}
                </caption>
                <thead>
                  <tr>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                      Indicator
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      {comparatie.a.nume}
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
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
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Cum se citește comparația</h2>
            <p className="mt-4 text-base leading-normal text-stone-600">
              Rândurile CAEN arată mediile nete și brute din activitățile economice asociate, de la debutanți la
              conducere. Rândurile ISCO adaugă perspectiva grupelor majore de ocupații din întreaga economie. Împreună
              oferă un reper de piață, iar suma individuală depinde de rol, experiență și angajator.
            </p>
            <p className="mt-4 text-base leading-normal text-stone-600">
              {aceeasiGrupa
                ? `Cele două meserii apar în aceeași grupă ISCO, „${a.isco?.nume ?? "—"}”, de aceea împart același reper de grupă. Asta nu dovedește că au salarii egale.`
                : `Cele două meserii apar în grupe ISCO diferite. Grupele sunt largi și au compoziții diferite, astfel că valorile lor nu pot fi atribuite direct celor două posturi.`}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <LinkCard
                href={`/salarii/${comparatie.a.slug}`}
                titlu={`Detalii: salariu ${comparatie.a.nume.toLocaleLowerCase("ro-RO")}`}
                detaliu="Sector, grupă ISCO, județe și vârste"
              />
              <LinkCard
                href={`/salarii/${comparatie.b.slug}`}
                titlu={`Detalii: salariu ${comparatie.b.nume.toLocaleLowerCase("ro-RO")}`}
                detaliu="Sector, grupă ISCO, județe și vârste"
              />
            </div>
          </section>

          {inrudite.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Alte comparații</h2>
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
            Sursa: Institutul Național de Statistică, TEMPO-Online — matricele {MATRICE_BRUT} și {MATRICE_NET}{" "}
            (câștig salarial mediu brut și net pe activități CAEN Rev.3, luna {LUNA}) și {MATRICE_OCUPATII} (ancheta
            din octombrie pe grupe majore de ocupații, {AN_ANCHETA}). Reutilizare conform licenței pentru o guvernare
            deschisă. Neturile standard sunt calculate de Salariile.ro — vezi <Link href="/metodologie">metodologia</Link>.
            Metodologia explică separat populația fiecărui reper.
          </NotaSursa>
        </div>
      </div>

      <Faq items={faq} />
    </>
  );
}
