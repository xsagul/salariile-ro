// src/app/(site)/compara/[pereche]/page.tsx
// Comparatia dintre doua meserii. Server Component pur.
//
// Diferenta fata de restul pietei: netul nu e estimat cu un procent inventat,
// ci calculat cu acelasi motor fiscal ca al calculatorului, si se vede si
// netul mediu observat de INS pentru fiecare sector.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import { CardCifra, LinkCard, NotaSursa, lei, lunaLunga, procent } from "@/app/components/Salarii";
import { calculStandard } from "@/lib/fiscal";
import {
  AN_OCUPATII,
  LUNA_REFERINTA,
  MATRICE_BRUT,
  MATRICE_NET,
  MATRICE_OCUPATII,
  TOTAL_ECONOMIE,
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
  const scurt = `${comparatie.a.nume} vs ${comparatie.b.nume}: salarii 2026`;
  return scurt.length + BRAND.length <= TITLU_MAX ? `${scurt}${BRAND}` : scurt;
}

function descrierePagina(a: DateMeserie, b: DateMeserie) {
  return `${a.meserie.nume} vs ${b.meserie.nume} în 2026: ${lei(a.sector.brutCurent)} lei față de ${lei(b.sector.brutCurent)} lei brut mediu în sectoarele respective (INS, ${LUNA}), cu netul calculat pentru fiecare.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pereche } = await params;
  const comparatie = getComparatie(pereche);
  if (!comparatie) return {};
  const a = dateMeserieSauEroare(comparatie.a);
  const b = dateMeserieSauEroare(comparatie.b);
  const descriere = descrierePagina(a, b);
  const titluSocial = `${comparatie.a.nume} vs ${comparatie.b.nume} — salarii 2026`;

  return {
    title: { absolute: titluPagina(comparatie) },
    description: descriere,
    alternates: { canonical: `https://salariile.ro/compara/${pereche}` },
    openGraph: ogPage({ title: titluSocial, description: descriere, path: `/compara/${pereche}` }),
    twitter: twPage({ title: titluSocial, description: descriere }),
  };
}

function BaraComparativa({ a, b }: { a: DateMeserie; b: DateMeserie }) {
  const max = Math.max(a.sector.brutCurent, b.sector.brutCurent);
  const randuri = [
    { nume: a.meserie.nume, brut: a.sector.brutCurent, net: a.netStandard },
    { nume: b.meserie.nume, brut: b.sector.brutCurent, net: b.netStandard },
  ];

  return (
    <div className="my-6 grid gap-4">
      {randuri.map((rand) => (
        <div key={rand.nume}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium text-stone-900">{rand.nume}</span>
            <span className="tabular-nums text-stone-600">
              {lei(rand.brut)} lei brut · {lei(rand.net)} lei net
            </span>
          </div>
          <div className="h-6 w-full overflow-hidden rounded bg-stone-900/[0.06]">
            <div className="h-full rounded bg-stone-900/[0.18]" style={{ width: `${(rand.brut / max) * 100}%` }}>
              <div className="h-full rounded bg-stone-900" style={{ width: `${(rand.net / rand.brut) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
      <p className="text-xs leading-normal text-stone-600">
        Bara plină este netul care ajunge în mână; porțiunea deschisă, partea reținută ca CAS, CASS și impozit.
      </p>
    </div>
  );
}

export default async function ComparatiePage({ params }: Props) {
  const { pereche } = await params;
  const comparatie = getComparatie(pereche);
  if (!comparatie) notFound();

  const a = dateMeserieSauEroare(comparatie.a);
  const b = dateMeserieSauEroare(comparatie.b);
  const castigator = a.sector.brutCurent >= b.sector.brutCurent ? a : b;
  const celalalt = castigator === a ? b : a;
  const diferentaBrut = castigator.sector.brutCurent - celalalt.sector.brutCurent;
  const diferentaProcent = diferentaBrut / celalalt.sector.brutCurent;
  const diferentaNet = castigator.netStandard - celalalt.netStandard;
  const rezultatA = calculStandard(a.sector.brutCurent);
  const rezultatB = calculStandard(b.sector.brutCurent);
  const inrudite = comparatiiInrudite(comparatie);
  const aceeasiGrupa = a.meserie.isco === b.meserie.isco;

  const faq = [
    {
      q: `Cine câștigă mai mult: ${comparatie.a.nume.toLocaleLowerCase("ro-RO")} sau ${comparatie.b.nume.toLocaleLowerCase("ro-RO")}?`,
      a: `Pe datele INS din ${LUNA}, sectorul în care lucrează majoritatea celor cu meseria de ${castigator.meserie.nume.toLocaleLowerCase("ro-RO")} are un câștig mediu brut cu ${procent(diferentaProcent, 0)}% mai mare — ${lei(castigator.sector.brutCurent)} lei față de ${lei(celalalt.sector.brutCurent)} lei, adică o diferență de ${lei(diferentaBrut)} lei brut pe lună. Comparația este între activități economice, nu între două posturi concrete.`,
    },
    {
      q: "Cât înseamnă diferența în mână?",
      a: `După CAS 25%, CASS 10% și impozit 10%, cele două brute dau ${lei(castigator.netStandard)} lei, respectiv ${lei(celalalt.netStandard)} lei net, într-un calcul standard pentru funcția de bază fără persoane în întreținere. Diferența netă este de aproximativ ${lei(diferentaNet)} lei pe lună, adică ${lei(diferentaNet * 12)} lei pe an.`,
    },
    {
      q: "Ce sectoare stau în spatele celor două cifre?",
      a: `${comparatie.a.nume}: CAEN ${a.sector.cheie} — ${a.sector.denumire}. ${comparatie.b.nume}: CAEN ${b.sector.cheie} — ${b.sector.denumire}. Media fiecărei activități include toți salariații ei, indiferent de ocupație și de nivel ierarhic.`,
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
        headline: `${comparatie.a.nume} vs ${comparatie.b.nume} — comparație salarii 2026`,
        description: descrierePagina(a, b),
        author: personSchema,
        publisher: {
          "@type": "Organization",
          name: "Salariile.ro",
          logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
        },
        mainEntityOfPage: `https://salariile.ro/compara/${pereche}`,
        dateModified: "2026-08-21",
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
    { eticheta: `Brut mediu sector, ${LUNA}`, a: `${lei(a.sector.brutCurent)} lei`, b: `${lei(b.sector.brutCurent)} lei` },
    { eticheta: "Net standard calculat", a: `${lei(a.netStandard)} lei`, b: `${lei(b.netStandard)} lei` },
    {
      eticheta: "Net mediu observat de INS",
      a: a.netObservat ? `${lei(a.netObservat)} lei` : "—",
      b: b.netObservat ? `${lei(b.netObservat)} lei` : "—",
    },
    {
      eticheta: "CAS + CASS + impozit",
      a: rezultatA ? `${lei(rezultatA.cas + rezultatA.cass + rezultatA.impozit)} lei` : "—",
      b: rezultatB ? `${lei(rezultatB.cas + rezultatB.cass + rezultatB.impozit)} lei` : "—",
    },
    {
      eticheta: "Cost total angajator",
      a: rezultatA ? `${lei(rezultatA.costTotal)} lei` : "—",
      b: rezultatB ? `${lei(rezultatB.costTotal)} lei` : "—",
    },
    { eticheta: "Activitate CAEN", a: `${a.sector.cheie} — ${a.sector.denumire}`, b: `${b.sector.cheie} — ${b.sector.denumire}` },
    {
      eticheta: `Grupa de ocupații, venit brut oct. ${AN_ANCHETA}`,
      a: a.isco ? `${lei(a.isco.venitBrutTotal)} lei` : "—",
      b: b.isco ? `${lei(b.isco.venitBrutTotal)} lei` : "—",
    },
    {
      eticheta: "Față de media pe economie",
      a: `${a.sector.brutCurent >= TOTAL_ECONOMIE.brutCurent ? "+" : "−"}${procent(Math.abs((a.sector.brutCurent - TOTAL_ECONOMIE.brutCurent) / TOTAL_ECONOMIE.brutCurent), 0)}%`,
      b: `${b.sector.brutCurent >= TOTAL_ECONOMIE.brutCurent ? "+" : "−"}${procent(Math.abs((b.sector.brutCurent - TOTAL_ECONOMIE.brutCurent) / TOTAL_ECONOMIE.brutCurent), 0)}%`,
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
            În {LUNA}, sectorul unde lucrează majoritatea celor cu meseria de{" "}
            {castigator.meserie.nume.toLocaleLowerCase("ro-RO")} a avut un câștig mediu brut cu{" "}
            <strong>{procent(diferentaProcent, 0)}%</strong> mai mare: {lei(castigator.sector.brutCurent)} lei față de{" "}
            {lei(celalalt.sector.brutCurent)} lei. În mână, diferența este de aproximativ{" "}
            <strong>{lei(diferentaNet)} lei pe lună</strong>.
          </Lead>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <CardCifra
              accent
              eticheta={comparatie.a.nume}
              valoare={lei(a.sector.brutCurent)}
              nota={`${lei(a.netStandard)} lei net · CAEN ${a.sector.cheie}`}
            />
            <CardCifra
              eticheta={comparatie.b.nume}
              valoare={lei(b.sector.brutCurent)}
              nota={`${lei(b.netStandard)} lei net · CAEN ${b.sector.cheie}`}
            />
          </div>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Brut și net, alături</h2>
            <BaraComparativa a={a} b={b} />
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Tabel comparativ</h2>
            <div className="my-6 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft tabular-nums">
                <caption className="sr-only">
                  Comparație {comparatie.a.nume} față de {comparatie.b.nume}
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
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Cum se citește comparația
            </h2>
            <p className="mt-4 text-base leading-normal text-stone-600">
              Cele două cifre nu sunt salariile a doi oameni, ci mediile a două activități economice. În fiecare
              activitate intră toți salariații ei — și cei de la început de drum, și conducerea. Diferența dintre
              sectoare spune ceva real despre unde se plătește mai bine în economie, dar nu garantează nimic pentru
              un post anume.
            </p>
            {/* Cand ambele meserii cad in aceeasi grupa ISCO, cifra de ocupatie
                e identica si concluzia se schimba: decalajul e sectorial, nu de
                nivel de calificare. Merita spus, nu ascuns. */}
            {aceeasiGrupa ? (
              <p className="mt-4 text-base leading-normal text-stone-600">
                A doua linie de lectură este grupa de ocupații — și aici cele două meserii cad în aceeași grupă,{" "}
                {a.isco ? `„${a.isco.nume}”` : "din clasificarea ISCO-08"}, cu același venit brut mediu în ancheta din
                octombrie {AN_ANCHETA}. Cu alte cuvinte, statistica nu vede o diferență de nivel de calificare între
                ele: decalajul de mai sus vine din sectorul care le angajează, nu din pregătirea cerută.
              </p>
            ) : (
              <p className="mt-4 text-base leading-normal text-stone-600">
                A doua linie de lectură este grupa de ocupații: {comparatie.a.nume.toLocaleLowerCase("ro-RO")} intră în{" "}
                {a.isco ? `„${a.isco.nume}”` : "o grupă ISCO-08"}, iar {comparatie.b.nume.toLocaleLowerCase("ro-RO")}{" "}
                în {b.isco ? `„${b.isco.nume}”` : "alta"}. Grupele fiind diferite, o parte din decalaj vine din
                nivelul de calificare cerut, nu doar din sectorul în care s-a nimerit angajatorul.
              </p>
            )}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <LinkCard
                href={`/salarii/${comparatie.a.slug}`}
                titlu={`Detalii: salariu ${comparatie.a.nume.toLocaleLowerCase("ro-RO")}`}
                detaliu="Evoluție lunară, județe, vârste"
              />
              <LinkCard
                href={`/salarii/${comparatie.b.slug}`}
                titlu={`Detalii: salariu ${comparatie.b.nume.toLocaleLowerCase("ro-RO")}`}
                detaliu="Evoluție lunară, județe, vârste"
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
            deschisă. Netul standard și costul angajatorului sunt calculate de Salariile.ro — vezi{" "}
            <Link href="/metodologie">metodologia</Link>.
          </NotaSursa>
        </div>
      </div>

      <Faq items={faq} />
    </>
  );
}
