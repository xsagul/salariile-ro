// src/app/(site)/compara/[pereche]/page.tsx
// Doua meserii puse alaturi net-first. Valorile mari sunt mediile nete observate
// in sectoarele asociate, iar reperele ISCO vin separat. Nu construim intervale,
// medii ale reperelor, diferente derivate sau un „castigator".

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
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
import ReperSalariu from '@/app/components/ReperSalariu';
import { reperMeserie, textReper } from '@/lib/repere-meserii';
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



function descrierePagina(a: DateMeserie, b: DateMeserie) {
  return `Compară ${a.meserie.nume.toLocaleLowerCase('ro-RO')} și ${b.meserie.nume.toLocaleLowerCase('ro-RO')}: repere salariale cu surse și perioade, atribuții, brut și net, context INS.`;
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
    {q: 'Care dintre cele două meserii se plătește mai bine?', a: 'Reperele afișate au populația și perioada precizate separat. Mediile de sector, salariile declarate și grilele publice nu stabilesc un clasament al ocupațiilor. Pentru o decizie, compară oferte cu aceeași normă, experiență și localitate.'},
    {q: 'Ce se poate compara corect în tabel?', a: 'Mediile INS de sector din aceeași lună se compară între activități economice. Grilele arată funcții și trepte din sistemul public. Valorile din surse diferite nu sunt un minim și un maxim al salariului unei meserii.'},
    {q: 'Cum compar salariul brut cu netul?', a: 'Folosește calculatorul pentru brutul din ofertă și situația ta fiscală. Netul calculat din media brută a unui sector nu este același indicator cu media netă măsurată de INS.'},
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
        dateModified: "2026-09-06",
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

  const ra=reperMeserie(a), rb=reperMeserie(b);
  const randuriTabel = [
    {eticheta:'Reper salarial documentat',a:textReper(ra)+' '+ra.unit,b:textReper(rb)+' '+rb.unit},
    {eticheta:'Ce măsoară',a:ra.label,b:rb.label},
    {eticheta:'Perioada reperului',a:ra.period,b:rb.period},
    {eticheta:'Populația acoperită',a:ra.population,b:rb.population},
    {eticheta:'Mediană / P25 / P75 ale furnizorului',a:ra.median===null?'Nepublicate în acest reper':`${lei(ra.median)} / ${lei(ra.p25!)} / ${lei(ra.p75!)} lei net · oferte`,b:rb.median===null?'Nepublicate în acest reper':`${lei(rb.median)} / ${lei(rb.p25!)} / ${lei(rb.p75!)} lei net · oferte`},
    {eticheta:'Număr de observații individuale',a:'Nepublicat pentru meserie',b:'Nepublicat pentru meserie'},
    {eticheta:'Responsabilități',a:a.meserie.ceFace,b:b.meserie.ceFace},
    {eticheta:`Context: net mediu sector, ${LUNA}`,a:a.netObservat===null?'—':lei(a.netObservat)+' lei',b:b.netObservat===null?'—':lei(b.netObservat)+' lei'},

    {eticheta:'Activitate CAEN',a:a.sector.cheie+' — '+a.sector.denumire,b:b.sector.cheie+' — '+b.sector.denumire},
    {eticheta:'Grupă majoră ISCO',a:a.isco?.nume??'—',b:b.isco?.nume??'—'},
    {eticheta:'Net calculat al grupei ISCO, indexat',a:reperIsco(a,'net'),b:reperIsco(b,'net')},
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
          <Lead>Salariile nete, unul lângă altul. Deschide detaliile pentru surse și informații despre cele două meserii.</Lead>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {[a,b].map(d=><div key={d.meserie.slug}><h2 className="text-lg font-semibold">{d.meserie.nume}</h2><ReperSalariu date={d}/></div>)}
          </div>


          <details className="mt-8"><summary className="min-h-11 cursor-pointer py-3 text-lg font-semibold">Detalii ale comparației</summary><p className="mt-3 text-sm text-stone-600">Mediile de sector și reperele ISCO nu sunt un minim și un maxim salarial.</p>
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
          </details>

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
            din octombrie pe grupe majore de ocupații, {AN_ANCHETA}). Neturile standard sunt calculate de Salariile.ro — vezi <Link href="/metodologie">metodologia</Link>.
            Metodologia explică separat populația fiecărui reper.
          </NotaSursa>
        </div>
      </div>

      <Faq items={faq} />
    </>
  );
}
