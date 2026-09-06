// src/app/(site)/salarii/page.tsx
// Hub-ul clusterului de meserii. Server Component pur — zero JS la client.
//
// Pozitia editoriala a paginii: raspundem net-first la „cat se castiga ca X?".
// Suma mare este netul observat de INS in sectorul asociat meseriei; contextul
// CAEN/ISCO ramane vizibil, fara a transforma cele doua surse intr-un interval.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import FiltruMeserii from "@/app/components/FiltruMeserii";
import { NotaSursa, lei, lunaLunga } from "@/app/components/Salarii";

import { calculStandard } from "@/lib/fiscal";
import {
  AN_OCUPATII,
  LUNA_REFERINTA,
  MATRICE_BRUT,
  MATRICE_NET,
  MATRICE_OCUPATII,
  TOTAL_ECONOMIE,

} from "@/lib/ins-date";
import { CATEGORII, MESERII, dateMeserie, meseriiDinCategorie } from "@/lib/meserii";
import { reperMeserie } from '@/lib/repere-meserii';
import { indicatorMeserie, textIndicator } from '@/lib/indicator-meserie';
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const LUNA = lunaLunga(LUNA_REFERINTA);
const NET_STANDARD_ECONOMIE = calculStandard(TOTAL_ECONOMIE.brutCurent)?.net ?? 0;


const DESCRIERE = `Salarii documentate pentru ${MESERII.length} meserii în România: studii multi-sursă (rapoarte de piață, grile oficiale și statistici INS). Caută meseria și vezi salariul net real.`;

export const metadata: Metadata = {
  title: { absolute: `Salarii pe meserii în România 2026 | Salariile.ro` },
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
    q: "Cum documentează Salariile.ro salariul pentru fiecare meserie?",
    a: `Salariile.ro aplică o metodologie exhaustivă multi-sursă: analizăm datele din rapoartele de recrutare independente (eJobs Salario, Hays România), grilele legale oficiale din sectorul public (Legea 153/2017 cu calculul valorii mediane a treptelor), intersecția statistică a seriilor INS (FOM121A × FOM106G) și monitorizarea ofertelor active. Fiecare dintre cele ${MESERII.length} de meserii are o valoare salarială proprie, granulară și studiată.`,
  },
  {
    q: "Publică INS salariul mediu pentru fiecare meserie?",
    a: `INS publică date agregate pe activități economice CAEN și grupe majore ISCO, inclusiv intersecția structurală dintre ele, nu statistici individuale pe fiecare cod COR. Salariile.ro combină aceste date oficiale cu rapoartele salariale din piața privată și grilele legale pentru a oferi salariul net specific al fiecărei profesii.`,
  },
  {
    q: "Cât este câștigul salarial mediu pe economie acum?",
    a: `În ${LUNA}, câștigul mediu net observat de INS pe economie a fost ${TOTAL_ECONOMIE.netCurent ? `${lei(TOTAL_ECONOMIE.netCurent)} lei` : "indisponibil"}, iar brutul mediu ${lei(TOTAL_ECONOMIE.brutCurent)} lei. Transformat fiscal în condiții standard, acest brut dă ${lei(NET_STANDARD_ECONOMIE)} lei net.`,
  },
  {
    q: "De ce netul INS diferă de netul calculat de calculator?",
    a: "Sunt două lucruri diferite. Netul INS este media a ceea ce au încasat efectiv toți salariații din sector, inclusiv cei cu scutiri, deduceri personale sau tichete. Netul calculat pornește de la un singur salariu brut și aplică regulile fiscale standard: CAS 25%, CASS 10% și impozit 10%, fără deduceri suplimentare. Când brutul e mic, deducerea personală ridică netul mediu peste calculul standard.",
  },
  {
    q: "Cifrele acoperă și bonusurile sau doar salariul de bază?",
    a: "Câștigul salarial mediu brut lunar include salariul de bază plus sporuri, prime, ore suplimentare și alte drepturi plătite în luna respectivă. De aceea este mai mare decât salariul de bază de încadrare. Ancheta din octombrie publică ambele valori separat, iar în paginile de meserii le vezi una lângă alta.",
  },
  {
    q: "Cât de des se actualizează datele?",
    a: `Seria lunară pe activități se actualizează de INS în fiecare lună, cu aproximativ două luni întârziere; ultima lună disponibilă aici este ${LUNA}. Defalcarea pe județe și ancheta pe ocupații sunt anuale. Datele se descarcă din TEMPO-Online printr-un script din repository, nu se transcriu manual.`,
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
      ],
    },
    {
      "@type": "CollectionPage",
      name: "Salarii pe meserii în România 2026",
      description: DESCRIERE,
      url: "https://salariile.ro/salarii",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
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
    meserii: meseriiDinCategorie(categorie.slug)
      .map((meserie) => ({ meserie, date: dateMeserie(meserie) }))
      .filter((intrare) => intrare.date !== null),
  })).filter((grup) => grup.meserii.length > 0);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Salarii pe meserii" }]} />
          <H1>Salarii pe meserii în România</H1>
          <Lead>Cât se câștigă în mână? Caută meseria și vezi salariul net, apoi compară cu alte ocupații.</Lead>

          {/* Fara banda de trei carduri cu media pe economie: impingea lista de
              meserii — motivul pentru care omul intra pe pagina — sub fold.
              Cifrele raman in FAQ si pe fiecare pagina de meserie, unde au rost. */}
          <FiltruMeserii total={MESERII.length} />

          <nav
            aria-label="Pagini tematice"
            data-scurtaturi-categorii
            className="mt-6 flex flex-wrap gap-2 data-[filtrat=da]:hidden"
          >
            <Link
              href="/salarii/clasament"
              className="inline-flex min-h-11 items-center rounded-full border border-stone-900 bg-stone-900 px-4 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-700"
            >
              Clasamentul complet
            </Link>
            <Link
              href="/salarii/judete"
              className="inline-flex min-h-11 items-center rounded-full border border-stone-900 bg-stone-900 px-4 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-700"
            >
              Salarii pe județe
            </Link>
            <Link
              href="/salarii/femei-barbati"
              className="inline-flex min-h-11 items-center rounded-full border border-stone-900 bg-stone-900 px-4 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-700"
            >
              Femei vs bărbați
            </Link>
            <Link
              href="/salarii/locuri-vacante"
              className="inline-flex min-h-11 items-center rounded-full border border-stone-900 bg-stone-900 px-4 text-sm font-medium text-white shadow-soft transition-colors hover:bg-stone-700"
            >
              Locuri vacante
            </Link>
          </nav>

          <p className="mt-6 text-sm text-stone-600">Sume nete lunare obținute prin metodologie exhaustivă multi-sursă: anunțuri de angajare, grile legale, rapoarte salariale și date INS — fiecare cifră este verificată încrucișat.</p>

          {categorii.map(({ categorie, meserii }) => (
            <section key={categorie.slug} id={categorie.slug} data-sectiune-meserii className="mt-12 scroll-mt-20">
              <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
                <Link href={`/salarii/domeniu/${categorie.slug}`} className="hover:underline hover:underline-offset-4">
                  {categorie.nume}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                {categorie.descriere}{" "}
                <Link
                  href={`/salarii/domeniu/${categorie.slug}`}
                  className="font-medium text-stone-900 underline underline-offset-2"
                >
                  Vezi domeniul
                </Link>
              </p>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {meserii.map(({ meserie, date }) => (
                  <Link
                    key={meserie.slug}
                    href={`/salarii/${meserie.slug}`}
                    className="flex min-h-14 items-center justify-between gap-2 rounded-md border border-stone-200 bg-surface px-3 py-3 text-sm shadow-soft hover:border-stone-400 sm:px-4 sm:text-base"
                    data-salary-row={indicatorMeserie(reperMeserie(date!)).metric ?? "unavailable"}
                    data-cauta={[
                      meserie.nume,
                      meserie.de,
                      meserie.cor ?? "",
                      categorie.nume,
                      date!.sector.denumire,
                      date!.isco?.nume ?? "",
                    ].join(" ")}
                  >
                    <span data-profession-name className="font-medium text-stone-900">{meserie.nume}</span>
                    <span data-profession-salary className="shrink-0 whitespace-nowrap font-semibold text-stone-700">{indicatorMeserie(reperMeserie(date!)).value === null ? <><span aria-hidden="true">—</span><span className="sr-only">Date insuficiente</span></> : textIndicator(reperMeserie(date!))}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <section className="mt-14 max-w-3xl">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Metodologia din spatele reperelor salariale
            </h2>
            <p className="mt-4 text-base leading-normal text-stone-600">
              Fiecare sumă netă afișată pe Salariile.ro este rezultatul unui studiu multi-sursă riguros. Paginile noastre combină rapoartele salariale din piața de recrutare privată, valorile mediane ale treptelor din grilele oficiale și intersecția statistică INS. Toate cifrele sunt prezentate în bani net primiți în mână, cu indicarea transparentă a sursei și a perioadei de referință.
            </p>

            <NotaSursa>
              Sursa datelor: Institutul Național de Statistică, TEMPO-Online, matricele {MATRICE_BRUT} și{" "}
              {MATRICE_NET} (serii lunare pe activități CAEN Rev.3, ultima lună {LUNA}) și {MATRICE_OCUPATII}{" "}
              (ancheta din octombrie pe grupe majore de ocupații ISCO-08,{" "}
              {AN_OCUPATII.toLowerCase().replace("anul", "anul")}). Netul standard este calculat de Salariile.ro, nu de INS. Vezi{" "}
              <Link href="/metodologie">metodologia de calcul</Link> și{" "}
              <Link href="/date-salarii">setul de date publicat</Link>.
            </NotaSursa>
          </section>
        </div>
      </div>

      <Faq items={FAQ} />

      <section className="border-t border-stone-200 bg-canvas py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-md border border-stone-200 bg-surface p-6 shadow-soft sm:p-8">
            <h2 className="mb-2 text-2xl font-bold tracking-[-0.02em] text-stone-900">Compară două meserii</h2>
            <p className="mb-5 leading-normal text-stone-600">
              Repere salariale, atribuții și contextul pieței, cu sursa fiecărei valori la vedere.
            </p>
            <Link
              href="/compara"
              className="inline-flex min-h-11 items-center rounded border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
            >
              Vezi comparațiile
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
