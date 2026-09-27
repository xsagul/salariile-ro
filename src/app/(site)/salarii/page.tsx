// src/app/(site)/salarii/page.tsx
// Hubul meseriilor. Server Component pur — zero JS la client în afara filtrului.
//
// Refăcut pe 27 septembrie 2026, pe principiile paginilor de zile libere: titlul, căutarea,
// apoi lista pe domenii, cu o singură cifră verificată pe meserie (salariul-concluzie, grila în
// plată sau venitul oficial al angajatorului), meseriile cu cifră primele. Au ieșit calea de
// navigare, butoanele spre paginile INS din fața listei, avertismentul despre „semnificații
// diferite” și întrebările despre INS: nu erau ce caută omul aici.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Faq, H1, Lead, TITLU_SECTIUNE, SPATIU_JOS, SPATIU_SUS, INAINTE_DE_SECTIUNE } from "@/app/components/ui";
import FiltruMeserii from "@/app/components/FiltruMeserii";
import { CATEGORII, MESERII, dateMeserie, meseriiDinCategorie } from "@/lib/meserii";
import { concluzieMeserie } from "@/app/components/SalariuConcluzie";
import { netDeStart } from "@/app/components/SalariuGrila";
import { netOficialDeStart } from "@/app/components/SalariuOficial";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const DESCRIERE = `Salarii pe ${MESERII.length} de meserii în România: cât se câștigă în mână, din salariile plătite la stat, anunțuri verificate și grila legii în plată.`;

export const metadata: Metadata = {
  title: { absolute: `Salarii pe meserii în România 2026 | Salariile` },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/salarii" },
  openGraph: ogPage({
    title: "Salarii pe meserii în România 2026",
    description: DESCRIERE,
    path: "/salarii",
  }),
  twitter: twPage({ title: "Salarii pe meserii în România 2026", description: DESCRIERE }),
};

const FAQ = [
  {
    q: "De unde vin salariile de pe fiecare meserie?",
    a: "Din patru surse, fiecare scrisă pe pagina meseriei: salariile plătite pe fiecare post, publicate de spitale, primării și alte instituții publice; ofertele din anunțurile de angajare verificate; grila legii salarizării, acolo unde e în plată; tabelele de venituri publicate de angajatorii publici, cum e Ministerul Apărării. Nu facem medii între surse.",
  },
  {
    q: "Sumele sunt nete sau brute?",
    a: "Nete, adică ce ajunge în mână, pe lună. Unde salariul se impozitează ca unul obișnuit, pagina meseriei arată și brutul echivalent, ca să îl poți compara cu o ofertă.",
  },
  {
    q: "De ce unele meserii au o cifră și altele nu?",
    a: "Punem o cifră doar când o sursă măsoară chiar meseria aceea, pe destule posturi sau anunțuri. Unde nu e încă așa, pagina meseriei arată ce cer angajatorii: experiența, studiile, programul și beneficiile din anunțuri.",
  },
  {
    q: "Cât de des se actualizează?",
    a: "Anunțurile și ofertele depuse la ANOFM se adună în fiecare zi. Listele de salarii ale instituțiilor publice apar de două ori pe an, pe 31 martie și 30 septembrie, iar tabelele angajatorilor publici, lunar.",
  },
];

/** Cifra verificată a meseriei, aceeași ca pe pagina ei; altfel nimic. */
function cifraMeserie(slug: string): { text: string; tip: string } | null {
  const c = concluzieMeserie(slug);
  if (c) return { text: `${c.net.toLocaleString("ro-RO")} lei net`, tip: `concluzie-${c.sursa}` };
  const g = netDeStart(slug);
  if (g) return { text: `de la ${g.toLocaleString("ro-RO")} lei net`, tip: "grila-legala" };
  const o = netOficialDeStart(slug);
  if (o) return { text: `de la ${o.toLocaleString("ro-RO")} lei net`, tip: "venit-oficial" };
  return null;
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: "Salarii pe meserii în România 2026",
      description: DESCRIERE,
      url: "https://salariile.ro/salarii",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: MESERII.length,
        itemListElement: MESERII.map((meserie, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: meserie.nume,
          url: `https://salariile.ro/salarii/${meserie.slug}`,
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

export default function SalariiPage() {
  const categorii = CATEGORII.map((categorie) => ({
    categorie,
    // Meseriile cu cifră verificată primele, ca lista să se citească de sus; apoi celelalte.
    meserii: meseriiDinCategorie(categorie.slug)
      .map((meserie) => ({ meserie, date: dateMeserie(meserie), cifra: cifraMeserie(meserie.slug) }))
      .filter((intrare) => intrare.date !== null)
      .sort((a, b) => Number(!!b.cifra) - Number(!!a.cifra)),
  })).filter((grup) => grup.meserii.length > 0)
    // Domeniile cu cele mai multe cifre verificate primele: primul ecran nu începe cu rânduri goale.
    .sort((a, b) => b.meserii.filter((m) => m.cifra).length - a.meserii.filter((m) => m.cifra).length);
  const cuCifra = categorii.reduce((n, g) => n + g.meserii.filter((m) => m.cifra).length, 0);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>
          <H1>Salarii pe meserii în România</H1>
          <Lead>Caută meseria și vezi cât se câștigă în mână. {cuCifra} de meserii au deja salariul verificat.</Lead>

          <FiltruMeserii total={MESERII.length} />

          {categorii.map(({ categorie, meserii }) => (
            <section key={categorie.slug} id={categorie.slug} data-sectiune-meserii className={`${INAINTE_DE_SECTIUNE} scroll-mt-20`}>
              <h2 className={TITLU_SECTIUNE}>
                <Link href={`/salarii/domeniu/${categorie.slug}`} className="hover:underline hover:underline-offset-4">
                  {categorie.nume}
                </Link>
              </h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {meserii.map(({ meserie, date, cifra }) => (
                  <Link
                    key={meserie.slug}
                    href={`/salarii/${meserie.slug}`}
                    className="flex min-h-14 items-center justify-between gap-2 rounded-md border border-stone-200 bg-surface px-3 py-3 text-sm shadow-soft hover:border-stone-400 sm:px-4 sm:text-base"
                    data-salary-row={cifra?.tip ?? "unavailable"}
                    data-cauta={[meserie.nume, meserie.de, meserie.cor ?? "", categorie.nume, date!.sector.denumire, date!.isco?.nume ?? ""].join(" ")}
                  >
                    <span data-profession-name className="font-medium text-stone-900">{meserie.nume}</span>
                    {cifra && <span data-profession-salary className="shrink-0 whitespace-nowrap font-semibold text-stone-700">{cifra.text}</span>}
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {/* Paginile cu statistici pe economie, la final, ca simple legături. */}
          <nav aria-label="Alte pagini despre salarii" data-scurtaturi-categorii className={`${INAINTE_DE_SECTIUNE} data-[filtrat=da]:hidden`}>
            <h2 className={TITLU_SECTIUNE}>Alte pagini despre salarii</h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <li><Link href="/compara" className="underline underline-offset-2">Compară două meserii</Link></li>
              <li><Link href="/salarii/clasament" className="underline underline-offset-2">Clasamentul pe domenii</Link></li>
              <li><Link href="/salarii/judete" className="underline underline-offset-2">Salarii pe județe</Link></li>
              <li><Link href="/salarii/femei-barbati" className="underline underline-offset-2">Femei și bărbați</Link></li>
              <li><Link href="/salarii/locuri-vacante" className="underline underline-offset-2">Locuri vacante</Link></li>
              <li><Link href="/salarii/acoperire" className="underline underline-offset-2">Sursele, pe fiecare meserie</Link></li>
            </ul>
          </nav>
        </div>
      </div>

      <Faq items={FAQ} />
    </>
  );
}
