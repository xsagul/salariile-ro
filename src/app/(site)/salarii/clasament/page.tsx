// src/app/(site)/salarii/clasament/page.tsx
// Clasamentul complet al meseriilor din catalog. Server Component pur.
//
// Ruta statica bate ruta dinamica `/salarii/[meserie]`, deci „clasament" nu
// intra in conflict cu slug-urile de meserii.
//
// Ce masoara clasamentul, si ce NU: pozitia e a ACTIVITATII CAEN in care
// lucreaza majoritatea celor cu meseria, nu a ocupatiei. Meseriile din aceeasi
// activitate impart locul, si spunem asta la vedere in loc sa le despartim
// artificial. Un clasament care pretinde precizie pe care datele nu o au ar fi
// exact greseala pe care i-o reprosam presei.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import { CardCifra, NotaSursa, lei, lunaLunga, procent } from "@/app/components/Salarii";
import { denumireScurtaCaen } from "@/lib/caen-denumiri";
import { LUNA_REFERINTA, MATRICE_BRUT, MATRICE_NET, TOTAL_ECONOMIE } from "@/lib/ins-date";
import { MESERII, dateMeserie, type DateMeserie } from "@/lib/meserii";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const LUNA = lunaLunga(LUNA_REFERINTA);

const CLASAMENT: DateMeserie[] = MESERII.map((meserie) => dateMeserie(meserie))
  .filter((date): date is DateMeserie => date !== null)
  .sort((a, b) => b.sector.brutCurent - a.sector.brutCurent || a.meserie.nume.localeCompare(b.meserie.nume, "ro"));

const PRIMA = CLASAMENT[0];
const ULTIMA = CLASAMENT[CLASAMENT.length - 1];
const RAPORT = PRIMA.sector.brutCurent / ULTIMA.sector.brutCurent;
const PESTE_MEDIE = CLASAMENT.filter((d) => d.sector.brutCurent > TOTAL_ECONOMIE.brutCurent).length;

const DESCRIERE = `Cele ${CLASAMENT.length} meserii urmărite, ordonate după câștigul salarial mediu brut al activității în care se practică, cu datele INS din ${LUNA}.`;

export const metadata: Metadata = {
  title: { absolute: "Cele mai bine plătite meserii din România | Salariile.ro" },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/salarii/clasament" },
  openGraph: ogPage({
    title: "Cele mai bine plătite meserii din România",
    description: DESCRIERE,
    path: "/salarii/clasament",
  }),
  twitter: twPage({ title: "Cele mai bine plătite meserii din România", description: DESCRIERE }),
};

const FAQ = [
  {
    q: "Care sunt cele mai bine plătite meserii din România?",
    a: `Din cele ${CLASAMENT.length} meserii urmărite aici, cel mai sus stau ${CLASAMENT.slice(0, 3)
      .map((d) => d.meserie.nume.toLocaleLowerCase("ro-RO"))
      .join(", ")}. Ordinea este dată de câștigul salarial mediu brut al activității economice în care se practică meseria, în ${LUNA}, conform INS. Nu este un clasament al persoanelor: în aceeași activitate intră și debutanți, și conducere.`,
  },
  {
    q: "De ce mai multe meserii apar pe același loc?",
    a: "Pentru că INS publică media lunară pe activitatea economică a angajatorului, nu pe ocupație. Toate meseriile care se practică în aceeași activitate CAEN moștenesc aceeași cifră și, deci, același loc. Le afișăm împreună în loc să inventăm o ordine între ele.",
  },
  {
    q: "Cât de mare e diferența între prima și ultima meserie din clasament?",
    a: `În ${LUNA}, activitatea din capul clasamentului a avut un câștig mediu brut de ${lei(PRIMA.sector.brutCurent)} lei, iar cea de la coadă ${lei(ULTIMA.sector.brutCurent)} lei — un raport de ${RAPORT.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} la 1. Dintre toate activitățile urmărite, ${PESTE_MEDIE} sunt peste media pe economie de ${lei(TOTAL_ECONOMIE.brutCurent)} lei.`,
  },
  {
    q: "Clasamentul arată salariul net sau brut?",
    a: "Brut. Este câștigul salarial mediu brut lunar publicat de INS, care include salariul de bază plus sporuri, prime și ore suplimentare. Pe pagina fiecărei meserii găsești și netul standard, calculat cu CAS 25%, CASS 10% și impozit 10%.",
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
      name: "Cele mai bine plătite meserii din România",
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
        itemListElement: CLASAMENT.map((intrare, index) => ({
          "@type": "ListItem",
          position: index + 1,
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
  const maxim = PRIMA.sector.brutCurent;

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
          <H1>Cele mai bine plătite meserii din România</H1>
          <Lead>
            Cele {CLASAMENT.length} meserii urmărite pe site, ordonate după câștigul salarial mediu brut al
            activității economice în care se practică, cu datele INS din <strong>{LUNA}</strong>. Locul este al
            activității, nu al ocupației: meseriile care se practică în aceeași activitate CAEN împart aceeași cifră
            și același loc, iar noi le arătăm așa, în loc să inventăm o ordine între ele.
          </Lead>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CardCifra
              accent
              eticheta="În capul clasamentului"
              valoare={lei(PRIMA.sector.brutCurent)}
              nota={`${PRIMA.meserie.nume} — CAEN ${PRIMA.sector.cheie}.`}
            />
            <CardCifra
              eticheta="La coada clasamentului"
              valoare={lei(ULTIMA.sector.brutCurent)}
              nota={`${ULTIMA.meserie.nume} — CAEN ${ULTIMA.sector.cheie}.`}
            />
            <CardCifra
              eticheta="Raport primul / ultimul"
              valoare={RAPORT.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              unitate="× "
              nota={`Media pe economie: ${lei(TOTAL_ECONOMIE.brutCurent)} lei brut.`}
            />
            <CardCifra
              eticheta="Peste media pe economie"
              valoare={String(PESTE_MEDIE)}
              unitate={`din ${CLASAMENT.length}`}
              nota="Restul sunt sub media pe economie."
            />
          </div>

          <div className="my-8 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft tabular-nums">
              <caption className="sr-only">
                Clasamentul celor {CLASAMENT.length} meserii după câștigul salarial mediu brut al activității, {LUNA}
              </caption>
              <thead>
                <tr>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                    Loc
                  </th>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                    Meserie
                  </th>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                    Activitate
                  </th>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                    Brut, {LUNA}
                  </th>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                    Față de economie
                  </th>
                </tr>
              </thead>
              <tbody>
                {CLASAMENT.map((intrare, index) => {
                  const abatere = (intrare.sector.brutCurent - TOTAL_ECONOMIE.brutCurent) / TOTAL_ECONOMIE.brutCurent;
                  return (
                    <tr key={intrare.meserie.slug}>
                      <td className="border-b border-stone-100 px-3 py-2 text-left text-stone-500">{index + 1}</td>
                      <th
                        scope="row"
                        className="relative border-b border-stone-100 px-3 py-2 text-left font-medium text-stone-900"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-1 left-0 rounded-r bg-stone-900/[0.06]"
                          style={{ width: `${Math.max(4, (intrare.sector.brutCurent / maxim) * 100)}%` }}
                        />
                        <Link
                          href={`/salarii/${intrare.meserie.slug}`}
                          className="relative underline underline-offset-2 hover:text-stone-600"
                        >
                          {intrare.meserie.nume}
                        </Link>
                      </th>
                      <td className="border-b border-stone-100 px-3 py-2 text-left text-xs text-stone-500">
                        CAEN {intrare.sector.cheie} ·{" "}
                        {denumireScurtaCaen(intrare.sector.cheie, intrare.sector.denumire)}
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right font-semibold text-stone-900">
                        {lei(intrare.sector.brutCurent)} lei
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-600">
                        {abatere >= 0 ? "+" : "−"}
                        {procent(Math.abs(abatere), 0)}%
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
              Fiecare rând arată câștigul salarial mediu brut al activității economice în care lucrează majoritatea
              celor cu meseria respectivă. Media aceea include toți salariații activității, de la debutant la
              director, deci nu este salariul unei persoane cu meseria din rând. Este însă cea mai proaspătă
              măsurătoare oficială pe care o avem: se actualizează lunar.
            </p>
            <p className="mt-4 text-base leading-normal text-stone-600">
              De aceea meseriile din aceeași activitate apar cu aceeași cifră. A doua măsurătoare, dinspre ocupație,
              e ancheta INS din octombrie pe grupe majore ISCO-08 — o găsești pe pagina fiecărei meserii, împreună cu
              progresia pe vârste și cu defalcarea pe județe. Cine vrea să compare două meserii direct are{" "}
              <Link href="/compara">paginile de comparație</Link>.
            </p>
            <NotaSursa>
              Sursa: Institutul Național de Statistică, TEMPO-Online, matricele {MATRICE_BRUT} și {MATRICE_NET},
              serie lunară pe activități CAEN Rev.3, ultima lună {LUNA}. Reutilizare conform licenței pentru o
              guvernare deschisă. Ordonarea și gruparea aparțin Salariile.ro. Vezi{" "}
              <Link href="/metodologie">metodologia</Link> și <Link href="/salarii">toate meseriile</Link>.
            </NotaSursa>
          </section>
        </div>
      </div>

      <Faq items={FAQ} />
    </>
  );
}
