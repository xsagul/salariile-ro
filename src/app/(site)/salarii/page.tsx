// src/app/(site)/salarii/page.tsx
// Hub-ul clusterului de meserii. Server Component pur — zero JS la client.
//
// Pozitia editoriala a paginii: INS nu masoara „salariul de programator". Cine
// publica o astfel de cifra ca fapt masurat spune, de fapt, media sectorului in
// care lucreaza programatorii. Noi aratam aceleasi date, dar cu eticheta
// corecta si cu luna de referinta la vedere.

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
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const LUNA = lunaLunga(LUNA_REFERINTA);
const NET_STANDARD_ECONOMIE = calculStandard(TOTAL_ECONOMIE.brutCurent)?.net ?? 0;
const OCUPATII_TOTAL = totalOcupatii();

const DESCRIERE = `Câștigul salarial mediu pe ${MESERII.length} meserii, cu datele INS din ${LUNA}: brut, net observat și net standard calculat. Sursa fiecărei cifre este declarată.`;

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
    a: `Nu. INS publică lunar câștigul salarial mediu pe activitatea economică a angajatorului (clasificarea CAEN) și, o dată pe an, câștigul pe grupe majore de ocupații (clasificarea ISCO-08), din ancheta din octombrie. Nu există o statistică oficială lunară pentru „salariul de programator” sau „salariul de bucătar” luate separat. Paginile de aici combină cele două surse și spun explicit ce reprezintă fiecare cifră.`,
  },
  {
    q: "Cât este câștigul salarial mediu pe economie acum?",
    a: `În ${LUNA}, câștigul salarial mediu brut pe economie a fost ${lei(TOTAL_ECONOMIE.brutCurent)} lei, iar câștigul mediu net observat de INS ${TOTAL_ECONOMIE.netCurent ? `${lei(TOTAL_ECONOMIE.netCurent)} lei` : "nu este disponibil"}. Un salariu brut de ${lei(TOTAL_ECONOMIE.brutCurent)} lei, calculat standard pentru funcția de bază fără persoane în întreținere, dă ${lei(NET_STANDARD_ECONOMIE)} lei net.`,
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
            Cele {MESERII.length} meserii de mai jos folosesc datele oficiale INS actualizate până în{" "}
            <strong>{LUNA}</strong>. Institutul
            Național de Statistică nu publică o medie separată pentru fiecare ocupație, ci pentru activitatea
            economică a angajatorului și pentru grupa majoră de ocupații. Pe fiecare pagină vezi ambele, etichetate
            corect, plus netul calculat cu regulile fiscale în vigoare.
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

          {/* Legenda celor doua cifre de pe card. Fara ea, cifra a doua ar
              parea un al doilea salariu al aceleiasi meserii, cand de fapt e
              alta masuratoare, din alta ancheta si alt an. */}
          <p className="mt-6 rounded-md border border-stone-200 bg-surface p-4 text-sm leading-normal text-stone-600 shadow-soft">
            Fiecare card arată două măsurători diferite, nu două variante ale aceleiași cifre. Sus, în bold, este{" "}
            <strong className="font-semibold text-stone-900">media lunară a activității CAEN</strong> unde lucrează
            majoritatea ({LUNA}); dedesubt, <strong className="font-semibold text-stone-900">venitul brut realizat
            al grupei de ocupații</strong> din ancheta INS din octombrie {AN_OCUPATII.replace("Anul ", "")}. Prima e
            proaspătă dar largă, a doua e mai veche dar ancorată în ocupație.
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
                    // Aceeasi baza ca pe pagina meseriei: intervalul net. Cat
                    // timp cardul arata media sectorului, hubul si pagina de
                    // detaliu spuneau doua cifre diferite pentru aceeasi meserie.
                    valoare={
                      date!.estimare
                        ? `${lei(date!.estimare.netMin)}–${lei(date!.estimare.netMax)}`
                        : `${lei(date!.netStandard)}`
                    }
                    subvaloare="lei net"
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
              Suma din dreptul fiecărei meserii este câștigul salarial mediu brut din activitatea economică unde
              lucrează majoritatea celor care practică meseria — de exemplu, CAEN 62 pentru un programator. Media
              aceea include toți salariații activității, de la debutant la director, așa că nu este „salariul unui
              programator”. Este cea mai apropiată măsurătoare oficială și lunară de care dispunem.
            </p>
            <p className="mt-4 text-base leading-normal text-stone-600">
              A doua măsurătoare vine dinspre ocupație, nu dinspre angajator: ancheta INS din octombrie publică
              venitul brut realizat pe grupe majore de ocupații ISCO-08, defalcat pe grupe de vârstă. În{" "}
              {AN_OCUPATII.replace("Anul ", "")}, media pe toate ocupațiile a fost{" "}
              {OCUPATII_TOTAL ? `${lei(OCUPATII_TOTAL.venitBrut)} lei venit brut realizat și ${lei(OCUPATII_TOTAL.salariuDeBaza ?? 0)} lei salariu de bază` : "—"}
              . Diferența dintre cele două arată cât cântăresc sporurile și primele peste încadrare. Fiecare pagină de
              meserie afișează grupa relevantă și progresia pe vârste.
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
              Diferența de brut și de net între două ocupații din sectoare diferite, cu aceleași date INS.
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
