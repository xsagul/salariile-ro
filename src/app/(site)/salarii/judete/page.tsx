// src/app/(site)/salarii/judete/page.tsx
// Harta salariala a tarii: toate judetele, ordonate. Server Component pur.
//
// Ruta statica bate ruta dinamica `/salarii/[meserie]`, deci „judete" nu intra
// in conflict cu slug-urile de meserii.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import { CardCifra, NotaSursa, lei, procent } from "@/app/components/Salarii";
import { AN_JUDETE, JUDETE, MATRICE_JUDETE, NATIONAL_JUDETE } from "@/lib/ins-date";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const AN = AN_JUDETE.replace("Anul ", "");
const PRIMUL = JUDETE[0];
const ULTIMUL = JUDETE[JUDETE.length - 1];
const RAPORT = PRIMUL.brut / ULTIMUL.brut;
const URL_FOM107E = "https://statistici.insse.ro/tempoins/?ind=FOM107E&lang=ro&page=tempo3";
const URL_HG_900_2023 = "https://legislatie.just.ro/Public/DetaliiDocumentAfis/274843";
const URL_HG_598_2024 = "https://legislatie.just.ro/Public/DetaliiDocumentAfis/283807";
// Copia locala e necesara: ingustarea de tip a lui NATIONAL_JUDETE nu
// supravietuieste in interiorul callback-ului.
const MEDIA_TARA = NATIONAL_JUDETE;
const PESTE_MEDIE = MEDIA_TARA === null ? 0 : JUDETE.filter((j) => j.brut > MEDIA_TARA).length;

const TITLU = `Câștig salarial mediu brut pe județe ${AN}`;
const DESCRIERE = `Câștig salarial mediu brut lunar pe județe, media întregului an ${AN} (INS FOM107E). Valorile nu sunt nete și nu reprezintă salariul minim din 2026.`;

export const metadata: Metadata = {
  title: { absolute: `${TITLU} | Salariile.ro` },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/salarii/judete" },
  openGraph: ogPage({
    title: TITLU,
    description: DESCRIERE,
    path: "/salarii/judete",
  }),
  twitter: twPage({ title: TITLU, description: DESCRIERE }),
};

const FAQ = [
  {
    q: "În ce județ se câștigă cel mai bine în România?",
    a: `Ca medie a întregului an ${AN}, cel mai mare câștig salarial mediu brut lunar a fost în ${PRIMUL.nume}: ${lei(PRIMUL.brut)} lei. Urmează ${JUDETE.slice(1, 4)
      .map((j) => `${j.nume} (${lei(j.brut)} lei)`)
      .join(", ")}. La celălalt capăt este ${ULTIMUL.nume}, cu ${lei(ULTIMUL.brut)} lei — un raport de ${RAPORT.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} la 1 între primul și ultimul.`,
  },
  {
    q: "Câte județe sunt peste media națională?",
    a: NATIONAL_JUDETE
      ? `${PESTE_MEDIE} din ${JUDETE.length}. Media națională a aceleiași serii a fost ${lei(NATIONAL_JUDETE)} lei brut lunar, ca medie a întregului an ${AN}. Distribuția e puternic asimetrică: câteva județe cu poli economici mari trag media în sus, iar majoritatea rămân sub ea.`
      : "Datele naționale de comparație nu sunt disponibile pentru această serie.",
  },
  {
    q: "De ce datele pe județe sunt mai vechi decât cele de pe restul site-ului?",
    a: `Pentru că INS publică două serii diferite. FOM107E oferă pe județe câștigul salarial mediu brut lunar ca medie a întregului an ${AN}, pe clasificarea CAEN Rev.2. Seria națională de pe paginile de meserii este lunară și mai recentă; nu le amestecăm.`,
  },
  {
    q: "Cifrele sunt pe județ sau pe oraș?",
    a: "Pe județ. INS nu publică la nivel de localitate în această serie. Într-un județ cu un singur angajator mare, media poate să nu se regăsească în restul localităților — de aceea nu traducem județul în oraș, cum fac unele site-uri.",
  },
  {
    q: "Sumele sunt nete sau reprezintă salariul minim?",
    a: `Nu. Sunt câștiguri salariale medii brute lunare, calculate ca medie pentru întregul an ${AN}. Seria nu publică netul. Nici nu reprezintă salariul minim: în 2024, minimul legal a fost 3.300 lei până la 30 iunie (HG 900/2023) și 3.700 lei din 1 iulie (HG 598/2024); salariul minim din 2026 este un reper legal separat.`,
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
        { "@type": "ListItem", position: 3, name: "Județe", item: "https://salariile.ro/salarii/judete" },
      ],
    },
    {
      "@type": "CollectionPage",
      name: TITLU,
      description: DESCRIERE,
      url: "https://salariile.ro/salarii/judete",
      dateModified: "2026-08-25",
      temporalCoverage: AN,
      isBasedOn: URL_FOM107E,
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: JUDETE.length,
        itemListElement: JUDETE.map((judet, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: judet.nume,
          url: `https://salariile.ro/salarii/judet/${judet.slug}`,
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

export default function JudetePage() {
  const maxim = PRIMUL.brut;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumb
            items={[
              { href: "/", label: "Acasă" },
              { href: "/salarii", label: "Salarii pe meserii" },
              { label: "Județe" },
            ]}
          />
          <H1>Câștigul salarial mediu brut lunar pe județe — media {AN}</H1>
          <Lead>
            Valorile INS de mai jos sunt <strong>câștiguri salariale medii brute lunare</strong>, calculate ca medie
            pentru întregul an <strong>{AN}</strong>. Nu sunt salarii nete și nu reprezintă salariul minim din 2026.
            Defalcarea este pe județ, nu pe oraș.
          </Lead>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CardCifra
              accent
              eticheta="Cel mai mare brut lunar mediu"
              valoare={lei(PRIMUL.brut)}
              nota={`${PRIMUL.nume} · media întregului an ${AN}.`}
            />
            <CardCifra
              eticheta="Cel mai mic brut lunar mediu"
              valoare={lei(ULTIMUL.brut)}
              nota={`${ULTIMUL.nume} · media întregului an ${AN}.`}
            />
            <CardCifra
              eticheta="Raport primul / ultimul"
              valoare={RAPORT.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              unitate="× "
              nota={NATIONAL_JUDETE ? `Media brută lunară pe țară în ${AN}: ${lei(NATIONAL_JUDETE)} lei.` : undefined}
            />
            <CardCifra
              eticheta="Peste media brută pe țară"
              valoare={String(PESTE_MEDIE)}
              unitate={`din ${JUDETE.length}`}
              nota="Distribuția e asimetrică: câțiva poli trag media în sus."
            />
          </div>

          <div className="my-8 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft tabular-nums">
              <caption className="sr-only">
                Câștigul salarial mediu brut lunar pe județe, media întregului an {AN}, ordonat descrescător
              </caption>
              <thead>
                <tr>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                    Loc
                  </th>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                    Județ
                  </th>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                    Brut lunar · media {AN}
                  </th>
                  <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                    Față de media brută pe țară
                  </th>
                </tr>
              </thead>
              <tbody>
                {JUDETE.map((judet, index) => {
                  const abatere = NATIONAL_JUDETE ? (judet.brut - NATIONAL_JUDETE) / NATIONAL_JUDETE : null;
                  return (
                    <tr key={judet.slug}>
                      <td className="border-b border-stone-100 px-3 py-2 text-left text-stone-500">{index + 1}</td>
                      <th
                        scope="row"
                        className="relative border-b border-stone-100 px-3 py-2 text-left font-medium text-stone-900"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-1 left-0 rounded-r bg-stone-900/[0.06]"
                          style={{ width: `${Math.max(4, (judet.brut / maxim) * 100)}%` }}
                        />
                        <Link
                          href={`/salarii/judet/${judet.slug}`}
                          className="relative underline underline-offset-2 hover:text-stone-600"
                        >
                          {judet.nume}
                        </Link>
                      </th>
                      <td className="border-b border-stone-100 px-3 py-2 text-right font-semibold text-stone-900">
                        {lei(judet.brut)} lei
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-600">
                        {abatere === null ? (
                          "—"
                        ) : (
                          <>
                            {abatere >= 0 ? "+" : "−"}
                            {procent(Math.abs(abatere), 0)}%
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <section className="max-w-3xl">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Ce spune și ce nu spune harta
            </h2>
            <p className="mt-4 text-base leading-normal text-stone-600">
              Diferența dintre primul și ultimul județ este de{" "}
              {RAPORT.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ori, dar ea nu
              măsoară cât valorează aceeași muncă în locuri diferite. Măsoară, în bună parte, ce fel de activități se
              află acolo: un județ cu servicii IT și financiare va sta mereu peste unul cu agricultură și industrie
              ușoară, chiar dacă un contabil câștigă asemănător în amândouă.
            </p>
            <p className="mt-4 text-base leading-normal text-stone-600">
              De aceea, pe pagina fiecărui județ, comparația se face cu media națională a <em>aceleiași</em>{" "}
              activități, nu cu media generală. Așa se vede unde județul chiar plătește peste nivelul sectorului, nu
              doar unde are sectoare bine plătite.
            </p>
            <NotaSursa>
              Sursa: Institutul Național de Statistică, TEMPO-Online, matricea{" "}
              <a href={URL_FOM107E} target="_blank" rel="noopener noreferrer">{MATRICE_JUDETE}</a> — câștig salarial
              nominal mediu brut lunar pe activități CAEN Rev.2 și județe, media întregului an {AN}. Nu este net și
              nu este salariul minim; în 2024, pragurile legale au fost stabilite prin{" "}
              <a href={URL_HG_900_2023} target="_blank" rel="noopener noreferrer">HG 900/2023</a> și{" "}
              <a href={URL_HG_598_2024} target="_blank" rel="noopener noreferrer">HG 598/2024</a>. Reutilizare conform
              licenței pentru o guvernare deschisă. Vezi <Link href="/metodologie">metodologia</Link>,{" "}
              <Link href="/salarii">toate meseriile</Link> și{" "}
              <Link href="/salarii/clasament">clasamentul meseriilor</Link>.
            </NotaSursa>
          </section>
        </div>
      </div>

      <Faq items={FAQ} />
    </>
  );
}
