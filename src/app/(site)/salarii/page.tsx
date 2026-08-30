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
import { LinkCard, NotaSursa, lei, lunaLunga } from "@/app/components/Salarii";
import { denumireScurtaCaen } from "@/lib/caen-denumiri";
import { calculStandard } from "@/lib/fiscal";
import {
  AN_OCUPATII,
  LUNA_REFERINTA,
  MATRICE_BRUT,
  MATRICE_NET,
  MATRICE_OCUPATII,
  TOTAL_ECONOMIE,
  totalOcupatii,
} from "@/lib/ins-date";
import { CATEGORII, MESERII, dateMeserie, meseriiDinCategorie } from "@/lib/meserii";
import { cifreMeserie } from "@/lib/ocupatii-caen";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const LUNA = lunaLunga(LUNA_REFERINTA);
const NET_STANDARD_ECONOMIE = calculStandard(TOTAL_ECONOMIE.brutCurent)?.net ?? 0;
const OCUPATII_TOTAL = totalOcupatii();

const DESCRIERE = `Salarii nete pentru ${MESERII.length} meserii din România, cu mediile INS actualizate la ${LUNA}. Vezi netul lunar, brutul, experiența și diferențele pe județe.`;

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
    q: "Publică INS salariul mediu pentru fiecare meserie?",
    a: `Pentru fiecare meserie afișăm netul și brutul grupei de ocupații din sectorul în care lucrează de regulă — cea mai fină combinație publicată de INS. Nu există salarii pe ocupații individuale, așa că meserii înrudite din aceeași grupă apar cu aceeași valoare. Salariul concret variază după experiență, firmă și localitate.`,
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
          <Lead>
            Vezi direct cât se câștigă <strong>net</strong> în cele {MESERII.length} de meserii, cu datele INS actualizate
            până în <strong>{LUNA}</strong>. Suma principală de pe fiecare card este media netă a sectorului asociat;
            pagina meseriei explică brutul, grupa ocupațională, experiența și diferențele regionale.
          </Lead>

          {/* Fara banda de trei carduri cu media pe economie: impingea lista de
              meserii — motivul pentru care omul intra pe pagina — sub fold.
              Cifrele raman in FAQ si pe fiecare pagina de meserie, unde au rost. */}
          <FiltruMeserii total={MESERII.length} />

          <nav
            aria-label="Categorii de meserii"
            data-scurtaturi-categorii
            className="mt-8 flex flex-wrap gap-2 data-[filtrat=da]:hidden"
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
            {categorii.map(({ categorie }) => (
              <a
                key={categorie.slug}
                href={`#${categorie.slug}`}
                className="inline-flex min-h-11 items-center rounded-full border border-stone-200 bg-surface px-4 text-sm text-stone-700 shadow-soft transition-colors hover:border-stone-300 hover:text-stone-900"
              >
                {categorie.nume}
              </a>
            ))}
          </nav>

          {/* Legenda celor doua neturi: primul este observat lunar in sector,
              al doilea este calculat pentru grupa larga de ocupatii. */}
          <p className="mt-6 rounded-md border border-stone-200 bg-surface p-4 text-sm leading-normal text-stone-600 shadow-soft">
            Suma mare este <strong className="font-semibold text-stone-900">netul mediu observat în sectorul CAEN</strong>{" "}
            din {LUNA}. Dedesubt apare <strong className="font-semibold text-stone-900">netul orientativ al grupei
            ISCO</strong>, calculat fiscal din ancheta pe ocupații și adus la nivelul salarial curent. Sunt două contexte,
            nu un minim și un maxim; salariul individual poate varia.
          </p>

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
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {meserii.map(({ meserie, date }) => (
                  <LinkCard
                    key={meserie.slug}
                    href={`/salarii/${meserie.slug}`}
                    titlu={meserie.nume}
                    detaliu={`CAEN ${date!.sector.cheie} · ${denumireScurtaCaen(date!.sector.cheie, date!.sector.denumire)}`}
                    valoare={lei(cifreMeserie(meserie.caen2, meserie.isco, { net: date!.netObservat ?? date!.netStandard, brut: date!.sector.brutCurent }).net)}
                    subvaloare={`lei net · ${lei(cifreMeserie(meserie.caen2, meserie.isco, { net: date!.netObservat ?? date!.netStandard, brut: date!.sector.brutCurent }).brut)} lei brut`}
                    cauta={[
                      meserie.nume,
                      meserie.de,
                      categorie.nume,
                      date!.sector.denumire,
                      date!.isco?.nume ?? "",
                    ].join(" ")}
                  />
                ))}
              </div>
            </section>
          ))}

          <section className="mt-14 max-w-3xl">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Ce arată și ce nu arată cifrele de mai sus
            </h2>
            <p className="mt-4 text-base leading-normal text-stone-600">
              Suma netă din dreptul fiecărei meserii este media observată în activitatea economică unde lucrează de
              regulă cei care practică meseria — de exemplu, CAEN 62 pentru un programator. Este cel mai actual reper
              lunar disponibil și include toate nivelurile de experiență; salariul unei persoane poate fi sub sau peste
              medie.
            </p>
            <p className="mt-4 text-base leading-normal text-stone-600">
              Al doilea net vine dinspre ocupație, nu dinspre angajator: ancheta INS din octombrie publică venitul brut
              realizat pe grupe majore ISCO-08, iar noi îl transformăm fiscal și îl afișăm net. În{" "}
              {AN_OCUPATII.replace("Anul ", "")}, media pe toate ocupațiile a fost{" "}
              {OCUPATII_TOTAL ? `${lei(OCUPATII_TOTAL.venitBrut)} lei venit brut realizat și ${lei(OCUPATII_TOTAL.salariuDeBaza ?? 0)} lei salariu de bază` : "—"}
              . Diferența dintre cele două arată cât cântăresc sporurile și primele peste încadrare. Fiecare pagină de
              meserie afișează grupa relevantă și progresia pe vârste. Reperul CAEN și reperul ISCO nu se scad, nu se
              mediază și nu delimitează salariul ocupației aflate la intersecția lor.
            </p>
            <NotaSursa>
              Sursa datelor: Institutul Național de Statistică, TEMPO-Online, matricele {MATRICE_BRUT} și{" "}
              {MATRICE_NET} (serii lunare pe activități CAEN Rev.3, ultima lună {LUNA}) și {MATRICE_OCUPATII}{" "}
              (ancheta din octombrie pe grupe majore de ocupații ISCO-08,{" "}
              {AN_OCUPATII.toLowerCase().replace("anul", "anul")}). Reutilizare conform licenței pentru o guvernare
              deschisă. Netul standard este calculat de Salariile.ro, nu de INS. Vezi{" "}
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
              Netul și brutul aceleiași grupe de ocupații din sectorul asociat, puse alături, fără clasarea ori declararea unui câștigător.
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
