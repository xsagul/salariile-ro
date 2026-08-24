// src/app/(site)/salarii/femei-barbati/page.tsx
// Diferenta salariala intre femei si barbati, din ancheta INS pe grupe majore
// de ocupatii. Server Component pur.
//
// De ce exista pagina: e singura masuratoare OFICIALA a subiectului pe care o
// putem publica — nu sondaj, nu estimare, ci salariatii numarati de INS. paylab
// arata procentul de femei dintr-o pozitie, dar nu si cat castiga fiecare.
// Datele stateau in matricea FOM121B de la inceput; pana pe 24 august 2026
// scriptul de import arunca dimensiunea de sex.
//
// Pozitia editoriala: cifra NU spune „la aceeasi munca, femeile primesc cu X%
// mai putin". Grupele de ocupatii sunt largi. Pagina o spune explicit, de doua
// ori, pentru ca e exact eroarea de interpretare care circula in presa.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import { CardCifra, NotaSursa, lei, procent } from "@/app/components/Salarii";
import {
  AN_OCUPATII,
  MATRICE_OCUPATII,
  diferenteSexePeGrupe,
  diferenteSexePeVarste,
  diferentaSexeTotal,
} from "@/lib/ins-date";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const AN = AN_OCUPATII.replace("Anul ", "");
const TOTAL = diferentaSexeTotal();
const PE_GRUPE = diferenteSexePeGrupe();
const PE_VARSTE = diferenteSexePeVarste();

/** „-0,057" → „5,7". Marimea fara semn, pentru fraze de tipul „o diferenta de X%". */
const marime = (valoare: number, zecimale = 1) => procent(Math.abs(valoare), zecimale);

/** Cu semn, pentru cifre afisate singure. In agricultura diferenta e POZITIVA —
 *  femeile castiga putin mai mult — iar un minus hardcodat ar minti. */
const cuSemn = (valoare: number, zecimale = 1) =>
  `${valoare > 0 ? "+" : "−"}${procent(Math.abs(valoare), zecimale)}`;

const celMaiMare = PE_GRUPE[0];
const celMaiMic = [...PE_GRUPE].sort((a, b) => Math.abs(a.diferenta) - Math.abs(b.diferenta))[0];
const varstaCeaMaiLarga = [...PE_VARSTE].sort((a, b) => a.diferenta - b.diferenta)[0];

const DESCRIERE = TOTAL
  ? `În ${AN}, femeile au câștigat în medie cu ${marime(TOTAL.diferenta)}% mai puțin decât bărbații, după datele INS. Pe grupe de ocupații, diferența ajunge la ${marime(celMaiMare.diferenta)}%.`
  : `Diferența de câștig între femei și bărbați în România, pe grupe de ocupații și pe vârste, din ancheta INS.`;

export const metadata: Metadata = {
  title: { absolute: `Diferența de salariu femei-bărbați ${AN} | Salariile.ro` },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/salarii/femei-barbati" },
  openGraph: ogPage({
    title: `Diferența de salariu între femei și bărbați, ${AN}`,
    description: DESCRIERE,
    path: "/salarii/femei-barbati",
  }),
  twitter: twPage({ title: `Diferența de salariu femei-bărbați ${AN}`, description: DESCRIERE }),
};

const FAQ = TOTAL
  ? [
      {
        q: "Cu cât câștigă mai puțin femeile în România?",
        a: `În ancheta INS din octombrie ${AN}, venitul brut realizat a fost ${lei(TOTAL.brutMasculin)} lei pentru bărbați și ${lei(TOTAL.brutFeminin)} lei pentru femei, adică o diferență de ${marime(TOTAL.diferenta)}% în defavoarea femeilor. Cifra acoperă toți salariații cu program complet plătiți întreaga lună, indiferent de ocupație.`,
      },
      {
        q: "Înseamnă că femeile sunt plătite mai puțin pentru aceeași muncă?",
        a: `Nu, iar asta este cea mai frecventă interpretare greșită. Cifra compară câștigul mediu al tuturor femeilor cu cel al tuturor bărbaților, nu salariile a doi oameni pe același post. Grupele de ocupații sunt largi, iar în interiorul lor femeile și bărbații nu ocupă aceleași funcții și nu au aceeași vechime. Datele arată o diferență de câștig mediu; nu măsoară discriminarea la post egal, care ar cere date pe post individual.`,
      },
      {
        q: "În ce ocupații este diferența cea mai mare?",
        a: `În grupa „${celMaiMare.nume}", unde bărbații au câștigat ${lei(celMaiMare.brutMasculin)} lei și femeile ${lei(celMaiMare.brutFeminin)} lei, o diferență de ${marime(celMaiMare.diferenta)}%. La polul opus, în grupa „${celMaiMic.nume}" diferența este de doar ${marime(celMaiMic.diferenta)}%.`,
      },
      {
        q: "Diferența crește sau scade cu vârsta?",
        a: `Nu este constantă. Cea mai mare diferență apare la ${varstaCeaMaiLarga.varsta}, unde ajunge la ${marime(varstaCeaMaiLarga.diferenta)}%. La începutul carierei este mai mică, iar după 60 de ani se inversează: femeile care încă lucrează câștigă în medie mai mult decât bărbații de aceeași vârstă. Ultima parte trebuie citită cu prudență, pentru că la vârste mari rămân în activitate mai ales persoanele din funcții bine plătite.`,
      },
      {
        q: "De unde vin cifrele?",
        a: `Din ancheta Institutului Național de Statistică publicată în matricea ${MATRICE_OCUPATII}, care măsoară în octombrie numărul salariaților, salariul brut de bază și venitul brut realizat, defalcate pe grupe de vârstă, pe grupe majore de ocupații ISCO-08 și pe sexe. Ultimul an disponibil este ${AN}. Nu este un sondaj și nu este o estimare a noastră.`,
      },
    ]
  : [];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Salarii pe meserii", item: "https://salariile.ro/salarii" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Diferența femei-bărbați",
          item: "https://salariile.ro/salarii/femei-barbati",
        },
      ],
    },
    {
      "@type": "Article",
      headline: `Diferența de salariu între femei și bărbați în România, ${AN}`,
      description: DESCRIERE,
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      mainEntityOfPage: "https://salariile.ro/salarii/femei-barbati",
      dateModified: "2026-08-24",
    },
    ...(FAQ.length
      ? [
          {
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
        ]
      : []),
  ],
};

/** Bara orizontala pentru marimea diferentei. SVG randat pe server, fara JS. */
function BaraDiferenta({ valoare, maxim }: { valoare: number; maxim: number }) {
  const latime = Math.min(100, (Math.abs(valoare) / maxim) * 100);
  const inFavoareaFemeilor = valoare > 0;
  return (
    <span className="flex items-center gap-2">
      <span className="h-2 w-16 shrink-0 overflow-hidden rounded bg-stone-900/[0.08]" aria-hidden="true">
        <span
          className={`block h-full rounded ${inFavoareaFemeilor ? "bg-stone-400" : "bg-stone-900"}`}
          style={{ width: `${latime}%` }}
        />
      </span>
      <span className="tabular-nums">
        {inFavoareaFemeilor ? "+" : "−"}
        {marime(valoare)}%
      </span>
    </span>
  );
}

export default function FemeiBarbatiPage() {
  if (!TOTAL) {
    return (
      <div className="bg-canvas">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <H1>Diferența de salariu între femei și bărbați</H1>
          <Lead>Datele pe sexe lipsesc din setul INS curent. Pagina revine la următoarea actualizare.</Lead>
        </div>
      </div>
    );
  }

  const maximGrupe = Math.max(...PE_GRUPE.map((g) => Math.abs(g.diferenta)));
  const maximVarste = Math.max(...PE_VARSTE.map((v) => Math.abs(v.diferenta)));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumb
            items={[
              { href: "/", label: "Acasă" },
              { href: "/salarii", label: "Salarii pe meserii" },
              { label: "Diferența femei-bărbați" },
            ]}
          />
          <H1>Diferența de salariu între femei și bărbați</H1>
          <Lead>
            În octombrie {AN}, bărbații au avut un venit brut realizat de <strong>{lei(TOTAL.brutMasculin)} lei</strong>{" "}
            în medie, iar femeile <strong>{lei(TOTAL.brutFeminin)} lei</strong> — o diferență de{" "}
            <strong>{marime(TOTAL.diferenta)}%</strong>. Cifra de ansamblu ascunde însă diferențe mult mai mari
            înăuntrul ocupațiilor: în grupa „{celMaiMare.nume.toLocaleLowerCase("ro-RO")}” ajunge la{" "}
            <strong>{marime(celMaiMare.diferenta)}%</strong>.
          </Lead>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CardCifra
              accent
              eticheta={`Diferența pe economie, ${AN}`}
              valoare={cuSemn(TOTAL.diferenta)}
              unitate="%"
              nota={`${lei(TOTAL.brutMasculin)} lei bărbați față de ${lei(TOTAL.brutFeminin)} lei femei, venit brut realizat.`}
            />
            <CardCifra
              eticheta="Cea mai mare diferență"
              valoare={cuSemn(celMaiMare.diferenta)}
              unitate="%"
              nota={celMaiMare.nume}
            />
            <CardCifra
              eticheta="Cea mai mică diferență"
              valoare={cuSemn(celMaiMic.diferenta)}
              unitate="%"
              nota={celMaiMic.nume}
            />
            <CardCifra
              eticheta="Ponderea femeilor"
              valoare={TOTAL.pondereFemei !== null ? procent(TOTAL.pondereFemei, 0) : "—"}
              unitate="%"
              nota={
                TOTAL.salariatiFeminin !== null && TOTAL.salariatiMasculin !== null
                  ? `${lei(TOTAL.salariatiFeminin)} femei și ${lei(TOTAL.salariatiMasculin)} bărbați, salariați cu program complet.`
                  : undefined
              }
            />
          </div>

          <p className="mt-4 rounded-md border border-stone-300 bg-surface p-4 text-sm leading-normal text-stone-700 shadow-soft">
            <strong className="font-semibold text-stone-900">Ce NU spune cifra:</strong> nu spune că femeile primesc cu{" "}
            {marime(TOTAL.diferenta)}% mai puțin <em>pentru aceeași muncă</em>. Compară câștigul mediu al tuturor
            femeilor cu al tuturor bărbaților. Grupele de ocupații sunt largi, iar în interiorul lor cele două grupuri
            nu ocupă aceleași funcții și nu au aceeași vechime. Este o diferență de câștig mediu, nu o măsură a
            discriminării la post egal — pentru asta ar trebui date pe post individual, pe care INS nu le publică.
          </p>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Diferența pe grupe de ocupații
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-normal text-stone-600">
              Aici se vede de ce media pe economie induce în eroare. Diferența de {marime(TOTAL.diferenta)}% pe total
              este mai mică decât diferența din majoritatea grupelor luate separat, pentru că femeile sunt
              concentrate în grupe mai bine plătite — mai ales printre specialiști, unde sunt majoritare.
            </p>
            <div className="my-6 overflow-x-auto">
              <table className="w-full min-w-[42rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft">
                <caption className="sr-only">
                  Venit brut realizat pe grupe majore de ocupații și sexe, octombrie {AN}
                </caption>
                <thead>
                  <tr>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                      Grupa de ocupații
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Bărbați
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Femei
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                      Diferență
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Femei în grupă
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PE_GRUPE.map((grupa) => (
                    <tr key={grupa.grupa}>
                      <th
                        scope="row"
                        className="border-b border-stone-100 px-3 py-2 text-left font-medium text-stone-900"
                      >
                        {grupa.nume}
                      </th>
                      <td className="border-b border-stone-100 px-3 py-2 text-right tabular-nums text-stone-700">
                        {lei(grupa.brutMasculin)} lei
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right tabular-nums text-stone-700">
                        {lei(grupa.brutFeminin)} lei
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-left text-stone-700">
                        <BaraDiferenta valoare={grupa.diferenta} maxim={maximGrupe} />
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right tabular-nums text-stone-700">
                        {grupa.pondereFemei !== null ? `${procent(grupa.pondereFemei, 0)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Cum se schimbă diferența cu vârsta
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-normal text-stone-600">
              Tiparul este cel mai interesant din toate datele de pe pagina asta. La început de carieră diferența este
              mică. Se lărgește puternic între 30 și 44 de ani, atinge maximul de {marime(varstaCeaMaiLarga.diferenta)}%
              la {varstaCeaMaiLarga.varsta}, apoi se strânge la loc. După 60 de ani se inversează: femeile rămase în
              activitate câștigă mai mult decât bărbații de aceeași vârstă.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-normal text-stone-600">
              Datele nu spun <em>de ce</em>. Intervalul în care diferența se lărgește coincide cu anii în care apar
              copiii, iar concediul de creștere și întreruperile de carieră sunt explicația uzuală în literatură — dar
              asta este o interpretare, nu ceva măsurat aici. La fel, inversarea de după 60 de ani se explică probabil
              prin cine rămâne în activitate la vârsta aceea, nu printr-un avantaj real.
            </p>
            <div className="my-6 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft">
                <caption className="sr-only">
                  Venit brut realizat pe grupe de vârstă și sexe, toate ocupațiile, octombrie {AN}
                </caption>
                <thead>
                  <tr>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                      Vârstă
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Bărbați
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Femei
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                      Diferență
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PE_VARSTE.map((prag) => (
                    <tr key={prag.varsta}>
                      <th
                        scope="row"
                        className="border-b border-stone-100 px-3 py-2 text-left font-medium text-stone-900"
                      >
                        {prag.varsta}
                      </th>
                      <td className="border-b border-stone-100 px-3 py-2 text-right tabular-nums text-stone-700">
                        {lei(prag.brutMasculin)} lei
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right tabular-nums text-stone-700">
                        {lei(prag.brutFeminin)} lei
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-left text-stone-700">
                        <BaraDiferenta valoare={prag.diferenta} maxim={maximVarste} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12 max-w-3xl">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Ce se schimbă odată cu transparența salarială
            </h2>
            <p className="mt-4 text-base leading-normal text-stone-600">
              Directiva europeană privind transparența salarială cere angajatorilor să publice intervale de salariu și
              să raporteze diferența de câștig între femei și bărbați din propria organizație. Când intră în vigoare,
              diferența nu va mai fi vizibilă doar la nivel de economie, ca aici, ci la nivel de angajator — acolo unde
              comparația chiar poate fi între posturi similare.{" "}
              <Link
                href="/noutati/transparenta-salariala-2026"
                className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
              >
                Ce prevede legea și în ce stadiu este
              </Link>
              .
            </p>
            <NotaSursa>
              Sursa datelor: Institutul Național de Statistică, TEMPO-Online, matricea {MATRICE_OCUPATII} — numărul
              salariaților cu program complet plătiți întreaga lună, salariul brut de bază și venitul brut realizat în
              octombrie, pe grupe de vârstă, pe grupe majore de ocupații (ISCO-08) și pe sexe. Ultimul an disponibil:{" "}
              {AN}. Reutilizare conform licenței pentru o guvernare deschisă. Vezi{" "}
              <Link href="/metodologie">metodologia</Link> și{" "}
              <Link href="/salarii">salariile pe meserii</Link>.
            </NotaSursa>
          </section>
        </div>
      </div>

      <Faq items={FAQ} />
    </>
  );
}
