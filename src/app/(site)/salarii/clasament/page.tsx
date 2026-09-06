// src/app/(site)/salarii/clasament/page.tsx
// Clasamentul complet al meseriilor din catalog. Server Component pur.
//
// Ruta statică bate ruta dinamică `/salarii/[meserie]`, deci „clasament" nu
// intră în conflict cu slug-urile de meserii.
//
// Fiecare dintre cele 132 de meserii are un rang unic de la 1 la 132, stabilit
// după salariul net de referință (banii primiți în mână), identic cu cifra din
// pagina fiecărei meserii.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import { CardCifra, NotaSursa, lei, lunaLunga, procent } from "@/app/components/Salarii";
import { calculStandard } from "@/lib/fiscal";
import { LUNA_REFERINTA, MATRICE_BRUT, MATRICE_NET, TOTAL_ECONOMIE } from "@/lib/ins-date";
import { MESERII, dateMeserieSauEroare, type DateMeserie, type Meserie, type CategorieMeserii } from "@/lib/meserii";
import { reperMeserie, type ReperMeserie } from "@/lib/repere-meserii";
import { indicatorMeserie, textIndicator } from "@/lib/indicator-meserie";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const LUNA = lunaLunga(LUNA_REFERINTA);
const NET_STANDARD_ECONOMIE = calculStandard(TOTAL_ECONOMIE.brutCurent)?.net ?? 0;

type IntrareClasament = {
  meserie: Meserie;
  date: DateMeserie;
  reper: ReperMeserie;
  net: number;
  loc: number;
  categorie: CategorieMeserii;
};

const CLASAMENT: IntrareClasament[] = MESERII.map((meserie) => {
  const date = dateMeserieSauEroare(meserie);
  const reper = reperMeserie(date);
  const ind = indicatorMeserie(reper);
  return {
    meserie,
    date,
    reper,
    net: ind.value ?? 0,
    loc: date.clasament?.loc ?? 0,
    categorie: date.categorie,
  };
}).sort((a, b) => a.loc - b.loc);

const PRIMA = CLASAMENT[0];
const ULTIMA = CLASAMENT[CLASAMENT.length - 1];
const RAPORT = PRIMA.net / ULTIMA.net;
const MEDIANA_NET = Math.round((CLASAMENT[65].net + CLASAMENT[66].net) / 2);
const PESTE_MEDIE = CLASAMENT.filter((c) => c.net > NET_STANDARD_ECONOMIE).length;

const DESCRIERE = `Topul celor ${CLASAMENT.length} meserii din România ordonate după salariul net real (bani în mână): repere multi-sursă din rapoarte salariale, grile de stat și date INS.`;

export const metadata: Metadata = {
  title: { absolute: "Top salarii meserii în România 2026 | Salariile.ro" },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/salarii/clasament" },
  openGraph: ogPage({
    title: "Top salarii meserii în România 2026",
    description: DESCRIERE,
    path: "/salarii/clasament",
  }),
  twitter: twPage({ title: "Top salarii meserii în România 2026", description: DESCRIERE }),
};

function tipSursaScurt(r: ReperMeserie): string {
  if (r.kind === "public-grid") return "Grilă legală (Legea 153/2017)";
  if (r.kind === "external-reported") return "Piață privată (Salario / Hays)";
  return "Statistică oficială INS";
}

const FAQ = [
  {
    q: "Care sunt cele mai bine plătite meserii din România în 2026?",
    a: `Topul este condus de piloții de linie (18.500 lei net), notari (16.500 lei net), specialiștii în infrastructură DevOps (14.200 lei net), programatori (13.474 lei net) și inginerii de petrol și gaze (12.747 lei net). În sectorul public, magistrații (judecători 10.091 lei net, procurori 9.611 lei net) și medicii specialiști (6.544 lei net bază fără sporuri) ocupă de asemenea poziții fruntașe.`,
  },
  {
    q: "Clasamentul arată salariul net sau brut?",
    a: "Net. Toate sumele afișate reprezintă venitul net lunar de referință (banii primiți în mână de salariat), după reținerea contribuțiilor obligatorii (CAS 25%, CASS 10%) și a impozitului pe venit (10%). Sumele sunt perfect corelate cu cifrele afișate pe pagina dedicată fiecărei meserii.",
  },
  {
    q: "Cum sunt calculate și documentate salariile din clasament?",
    a: `Salariile.ro folosește o metodologie riguroasă multi-sursă: pentru fiecare ocupație coroborăm datele din rapoartele salariale din piața privată (eJobs Salario, Hays România 2026), valorile mediane ale treptelor de încadrare din grilele oficiale de stat (Legea 153/2017) și intersecția statistică a seriilor INS (matricele FOM121A × FOM106G). Fiecare cifră este granulară, distinctă și verificată încrucișat.`,
  },
  {
    q: "De ce un debutant sau un specialist dintr-un alt oraș poate câștiga diferit?",
    a: `Suma din clasament reflectă valoarea mediană sau media reprezentativă a întregii profesii la nivel național. Pe pagina fiecărei meserii găsești defalcarea detaliată: salariul de pornire la 20–24 de ani pentru debutanți, progresia pe grupe de vârstă și intervalul salarial pe județe.`,
  },
  {
    q: "Cât de mare este diferența între primul și ultimul loc?",
    a: `Cel mai bine plătită meserie din catalog (${PRIMA.meserie.nume}, ${lei(PRIMA.net)} lei net) are un venit de ${RAPORT.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ori mai mare decât cea de la baza clasamentului (${ULTIMA.meserie.nume}, ${lei(ULTIMA.net)} lei net). Din cele ${CLASAMENT.length} de meserii analizate, ${PESTE_MEDIE} au salarii nete peste media pe economie de ${lei(NET_STANDARD_ECONOMIE)} lei net.`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Salarii pe meserii", item: "https://salariile.ro/salarii" },
        { "@type": "ListItem", position: 3, name: "Clasament", item: "https://salariile.ro/salarii/clasament" },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "Top salarii meserii în România 2026",
      description: DESCRIERE,
      url: "https://salariile.ro/salarii/clasament",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: CLASAMENT.length,
        itemListElement: CLASAMENT.map((intrare) => ({
          "@type": "ListItem",
          position: intrare.loc,
          name: intrare.meserie.nume,
          url: `https://salariile.ro/salarii/${intrare.meserie.slug}`,
        })),
      },
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

export default function ClasamentPage() {
  const maxim = PRIMA.net;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumb
            items={[
              { href: "/", label: "Acasă" },
              { href: "/salarii", label: "Salarii pe meserii" },
              { label: "Clasament" },
            ]}
          />
          <H1>Top salarii pe meserii în România</H1>
          <Lead>
            Cele {CLASAMENT.length} meserii documentate pe site, ordonate descrescător după salariul net lunar de
            referință (banii primiți în mână). Fiecare cifră este obținută prin metodologie multi-sursă: rapoarte
            de recrutare de piață (Salario, Hays), grile oficiale de stat (Legea 153/2017) și date INS
            din <strong>{LUNA}</strong>.
          </Lead>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CardCifra
              accent
              eticheta="Locul 1 în clasament"
              valoare={lei(PRIMA.net)}
              unitate=" lei net"
              nota={`${PRIMA.meserie.nume} — ${PRIMA.reper.label}.`}
            />
            <CardCifra
              eticheta="Mediana catalogului"
              valoare={lei(MEDIANA_NET)}
              unitate=" lei net"
              nota={`Jumătate dintre cele ${CLASAMENT.length} de meserii au salarii peste acest prag.`}
            />
            <CardCifra
              eticheta="Raport maxim / minim"
              valoare={RAPORT.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              unitate="× "
              nota={`Locul 1 (${PRIMA.meserie.nume}) față de locul ${ULTIMA.loc} (${ULTIMA.meserie.nume}: ${lei(ULTIMA.net)} lei net).`}
            />
            <CardCifra
              eticheta="Peste media pe economie"
              valoare={String(PESTE_MEDIE)}
              unitate={`meserii din ${CLASAMENT.length}`}
              nota={`Depășesc câștigul mediu net de ${lei(NET_STANDARD_ECONOMIE)} lei pe economie (${LUNA}).`}
            />
          </div>

          <div className="my-8 overflow-x-auto">
            <table className="w-full min-w-[44rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft tabular-nums">
              <caption className="sr-only">
                Clasamentul celor {CLASAMENT.length} meserii după salariul net de referință
              </caption>
              <thead>
                <tr>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                    Loc
                  </th>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                    Meserie și domeniu
                  </th>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                    Salariu net (în mână)
                  </th>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                    Sursă reper
                  </th>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                    Față de economie
                  </th>
                </tr>
              </thead>
              <tbody>
                {CLASAMENT.map((intrare) => {
                  const abatere = (intrare.net - NET_STANDARD_ECONOMIE) / NET_STANDARD_ECONOMIE;
                  return (
                    <tr key={intrare.meserie.slug} className="hover:bg-stone-50/60 transition-colors">
                      <td className="border-b border-stone-100 px-3 py-2.5 text-left font-medium text-stone-500">
                        #{intrare.loc}
                      </td>
                      <th
                        scope="row"
                        className="relative border-b border-stone-100 px-3 py-2.5 text-left font-medium text-stone-900"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-1 left-0 rounded-r bg-stone-900/[0.05]"
                          style={{ width: `${Math.max(4, (intrare.net / maxim) * 100)}%` }}
                        />
                        <div className="relative">
                          <Link
                            href={`/salarii/${intrare.meserie.slug}`}
                            className="underline underline-offset-2 hover:text-stone-600"
                          >
                            {intrare.meserie.nume}
                          </Link>
                          <span className="block text-xs font-normal text-stone-500">
                            {intrare.categorie.nume} · CAEN {intrare.date.sector.cheie}
                          </span>
                        </div>
                      </th>
                      <td className="border-b border-stone-100 px-3 py-2.5 text-right">
                        <span className="font-semibold text-stone-900">{textIndicator(intrare.reper)}</span>
                        <span className="block text-xs text-stone-500 font-normal">lunar</span>
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2.5 text-left">
                        <span className="text-xs font-medium text-stone-800">{tipSursaScurt(intrare.reper)}</span>
                        <span className="block text-[11px] text-stone-500 line-clamp-1" title={intrare.reper.source}>
                          {intrare.reper.source}
                        </span>
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2.5 text-right font-medium text-stone-700">
                        <span>
                          {abatere >= 0 ? "+" : "−"}
                          {procent(Math.abs(abatere), 0)}%
                        </span>
                        <span className="block text-[11px] font-normal text-stone-400">
                          {abatere >= 0 ? "peste medie" : "sub medie"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <section className="max-w-3xl">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Cum se citește clasamentul
            </h2>
            <p className="mt-4 text-base leading-normal text-stone-600">
              Fiecare rând arată salariul net lunar de referință pentru ocupația respectivă. Spre deosebire de simplele
              medii agregate pe sectoare economice (care amestecă directorii cu debutanții din aceeași ramură),
              Salariile.ro aplică o metodologie multi-sursă granulară pentru a reflecta realitatea din piață:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-700">
              <li>
                <strong>Pentru profesiile din piața privată:</strong> integrăm raportările directe din comparatorul
                național eJobs Salario, ghidurile de recrutare Hays România 2026 și contractele colective de ramură,
                calibrate cu datele statistice INS.
              </li>
              <li>
                <strong>Pentru meseriile bugetare:</strong> calculăm valoarea mediană a treptelor din grila legală
                în vigoare (Legea-cadru nr. 153/2017), oferind un reper fiscal clar înaintea sporurilor specifice.
              </li>
              <li>
                <strong>Pentru ocupațiile din producție și servicii:</strong> coroborăm ancheta anuală a ocupațiilor
                (FOM121A) cu dinamica lunară a sectorului angajatorului (FOM106G).
              </li>
            </ul>
            <p className="mt-4 text-base leading-normal text-stone-600">
              Cine dorește să compare două meserii direct are la dispoziție{" "}
              <Link href="/compara" className="underline underline-offset-2 hover:text-stone-900">
                paginile de comparație dedicate
              </Link>
              , iar dinamica cererii de forță de muncă se poate urmări în{" "}
              <Link href="/salarii/locuri-vacante" className="underline underline-offset-2 hover:text-stone-900">
                datele INS despre locurile de muncă vacante
              </Link>
              .
            </p>
            <NotaSursa>
              Sursa: Date multi-sursă Salariile.ro (rapoarte de piață eJobs Salario, Hays România, grile oficiale
              Legea 153/2017) și Institutul Național de Statistică, TEMPO-Online (matricele {MATRICE_BRUT} și {MATRICE_NET},
              seria lunară pe activități CAEN, ultima lună {LUNA}). Ordonarea și calculele aparțin Salariile.ro. Vezi{" "}
              <Link href="/metodologie">metodologia</Link> și <Link href="/salarii">catalogul tuturor meseriilor</Link>.
            </NotaSursa>
          </section>
        </div>
      </div>

      <Faq items={FAQ} />
    </>
  );
}
