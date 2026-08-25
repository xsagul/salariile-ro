// src/app/(site)/salarii/judet/[judet]/page.tsx
// Salariile dintr-un judet, pe activitati economice. Server Component pur.
//
// Perspectiva e inversa fata de pagina de meserie: acolo raspundem la „cum arata
// activitatea X pe judete", aici la „cum arata judetul Y pe toate activitatile"
// — intrebarea din spatele cautarii „salariu mediu in Cluj".
//
// AVERTISMENT DE DATE, repetat in pagina: defalcarea pe judete e ANUALA si pe
// CAEN Rev.2, deci mai veche decat seria lunara de pe restul site-ului. INS nu
// publica judete lunar. Anul se scrie la vedere peste tot, ca nimeni sa nu
// creada ca sunt cifre din luna curenta.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import { CardCifra, LinkCard, NotaSursa, lei, procent } from "@/app/components/Salarii";
import { denumireScurtaCaenRev2 } from "@/lib/caen-denumiri";
import {
  AN_JUDETE,
  JUDETE,
  MATRICE_JUDETE,
  NATIONAL_JUDETE,
  activitatiInJudet,
  getJudet,
  type ActivitateInJudet,
  type Judet,
} from "@/lib/ins-date";
import { MESERII } from "@/lib/meserii";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

interface Props {
  params: Promise<{ judet: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return JUDETE.map((judet) => ({ judet: judet.slug }));
}

const AN = AN_JUDETE.replace("Anul ", "");
const BRAND = " | Salariile.ro";
const TITLU_MAX = 60;
const URL_FOM107E = "https://statistici.insse.ro/tempoins/?ind=FOM107E&lang=ro&page=tempo3";
const URL_HG_900_2023 = "https://legislatie.just.ro/Public/DetaliiDocumentAfis/274843";
const URL_HG_598_2024 = "https://legislatie.just.ro/Public/DetaliiDocumentAfis/283807";

function titluPagina(judet: Judet) {
  const titlu = `Câștig salarial brut în ${judet.nume}, media ${AN}`;
  return titlu.length + BRAND.length <= TITLU_MAX ? `${titlu}${BRAND}` : titlu;
}

function descrierePagina(judet: Judet) {
  return `În ${judet.nume}, câștigul salarial mediu brut lunar a fost ${lei(judet.brut)} lei, ca medie a întregului an ${AN} (INS FOM107E). Nu este net sau salariul minim 2026.`;
}

/** Meseriile din catalog care cad intr-o activitate Rev.2 data. */
function meseriiPentruActivitate(cheieRev2: string): string[] {
  return MESERII.filter((m) => m.caen2 === cheieRev2).map((m) => m.nume);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { judet: slug } = await params;
  const judet = getJudet(slug);
  if (!judet) return {};

  const titluSocial = `Câștig salarial mediu brut în ${judet.nume}, media ${AN}`;
  const descriere = descrierePagina(judet);

  return {
    title: { absolute: titluPagina(judet) },
    description: descriere,
    alternates: { canonical: `https://salariile.ro/salarii/judet/${slug}` },
    openGraph: ogPage({ title: titluSocial, description: descriere, path: `/salarii/judet/${slug}` }),
    twitter: twPage({ title: titluSocial, description: descriere }),
  };
}

export default async function JudetPage({ params }: Props) {
  const { judet: slug } = await params;
  const judet = getJudet(slug);
  if (!judet) notFound();
  const activitati = activitatiInJudet(slug);
  if (activitati.length === 0) notFound();

  const loc = JUDETE.findIndex((j) => j.slug === slug) + 1;
  const abatereJudet = NATIONAL_JUDETE ? (judet.brut - NATIONAL_JUDETE) / NATIONAL_JUDETE : null;
  const ceaMaiBine = activitati[0];
  const ceaMaiProst = activitati[activitati.length - 1];
  const maxim = ceaMaiBine.brut;
  // Activitatile in care judetul sta cel mai bine RAPORTAT la media nationala a
  // aceleiasi activitati — altfel clasamentul ar repeta doar ierarhia sectoarelor.
  const punctForte = [...activitati]
    .filter((a): a is ActivitateInJudet & { national: number } => a.national !== null && a.national > 0)
    .sort((a, b) => (b.brut - b.national) / b.national - (a.brut - a.national) / a.national)[0];
  const vecine = JUDETE.filter((j) => j.slug !== slug).slice(Math.max(0, loc - 3), Math.max(0, loc - 3) + 5);

  const intrebari = [
    {
      q: `Care este salariul mediu în ${judet.nume}?`,
      a: `Ca medie a întregului an ${AN}, câștigul salarial mediu brut lunar în ${judet.nume} a fost ${lei(judet.brut)} lei${NATIONAL_JUDETE ? `, față de ${lei(NATIONAL_JUDETE)} lei media brută lunară pe țară` : ""}${abatereJudet !== null ? ` — ${abatereJudet >= 0 ? "cu " + procent(abatereJudet, 0) + "% peste" : "cu " + procent(Math.abs(abatereJudet), 0) + "% sub"} media națională` : ""}. Județul este pe locul ${loc} din ${JUDETE.length}.`,
    },
    {
      q: `În ce domenii se câștigă cel mai bine în ${judet.nume}?`,
      a: `Ca medie a întregului an ${AN}, activitatea cu cel mai mare câștig mediu brut lunar a fost ${ceaMaiBine.denumire.toLocaleLowerCase("ro-RO")} (CAEN ${ceaMaiBine.cheie}), cu ${lei(ceaMaiBine.brut)} lei, iar cea cu valoarea cea mai mică ${ceaMaiProst.denumire.toLocaleLowerCase("ro-RO")}, cu ${lei(ceaMaiProst.brut)} lei.${punctForte ? ` Raportat la media pe țară a aceleiași activități, ${judet.nume} stă cel mai bine la ${punctForte.denumire.toLocaleLowerCase("ro-RO")}: ${procent((punctForte.brut - punctForte.national) / punctForte.national, 0)}% peste nivelul național.` : ""}`,
    },
    {
      q: `De ce cifrele pe județ sunt din ${AN}, nu din luna curentă?`,
      a: `Pentru că INS publică două serii diferite. FOM107E oferă pe județe câștigul salarial mediu brut lunar ca medie a întregului an ${AN}, pe clasificarea CAEN Rev.2. Seria națională de pe paginile de meserii este lunară și mai recentă; le ținem separate.`,
    },
    {
      q: `Salariul mediu din ${judet.nume} este brut sau net?`,
      a: `Brut. ${lei(judet.brut)} lei este câștigul salarial mediu brut lunar, ca medie a întregului an ${AN}; include salariul de bază, sporuri și prime. Seria nu publică netul și nu reprezintă salariul minim: în 2024, minimul legal a fost 3.300 lei până la 30 iunie (HG 900/2023) și 3.700 lei din 1 iulie (HG 598/2024). Minimul din 2026 este un reper legal separat.`,
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
          { "@type": "ListItem", position: 4, name: judet.nume, item: `https://salariile.ro/salarii/judet/${slug}` },
        ],
      },
      {
        "@type": "CollectionPage",
        name: `Câștig salarial mediu brut lunar în ${judet.nume}, media ${AN}`,
        description: descrierePagina(judet),
        url: `https://salariile.ro/salarii/judet/${slug}`,
        dateModified: "2026-08-25",
        temporalCoverage: AN,
        isBasedOn: URL_FOM107E,
        author: personSchema,
        publisher: {
          "@type": "Organization",
          name: "Salariile.ro",
          logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: intrebari.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumb
            items={[
              { href: "/", label: "Acasă" },
              { href: "/salarii", label: "Salarii pe meserii" },
              { href: "/salarii/judete", label: "Județe" },
              { label: judet.nume },
            ]}
          />
          <H1>Câștigul salarial mediu brut lunar în {judet.nume} — media {AN}</H1>
          <Lead>
            Ca medie a întregului an <strong>{AN}</strong>, câștigul salarial mediu brut lunar din {judet.nume} a fost{" "}
            <strong>{lei(judet.brut)} lei</strong>
            {abatereJudet !== null && NATIONAL_JUDETE ? (
              <>
                , {abatereJudet >= 0 ? "peste" : "sub"} media pe țară de {lei(NATIONAL_JUDETE)} lei cu{" "}
                {procent(Math.abs(abatereJudet), 0)}%
              </>
            ) : null}
            . Județul e pe locul {loc} din {JUDETE.length}. Valoarea nu este netă și nu reprezintă salariul minim din
            2026; seria județeană este anuală și separată de datele curente ale site-ului.
          </Lead>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CardCifra
              accent
              eticheta={`Brut lunar mediu · ${AN}`}
              valoare={lei(judet.brut)}
              nota={`Media întregului an ${AN} · locul ${loc} din ${JUDETE.length} județe.`}
            />
            <CardCifra
              eticheta={`Media brută lunară pe țară · ${AN}`}
              valoare={NATIONAL_JUDETE ? lei(NATIONAL_JUDETE) : "—"}
              nota={
                abatereJudet !== null
                  ? `${judet.nume} e ${abatereJudet >= 0 ? "peste" : "sub"} cu ${procent(Math.abs(abatereJudet), 0)}%.`
                  : undefined
              }
            />
            <CardCifra
              eticheta={`Cel mai mare brut lunar pe activitate · ${AN}`}
              valoare={lei(ceaMaiBine.brut)}
              nota={`Media întregului an · CAEN ${ceaMaiBine.cheie} — ${denumireScurtaCaenRev2(ceaMaiBine.cheie, ceaMaiBine.denumire)}.`}
            />
            <CardCifra
              eticheta="Activități cu date"
              valoare={String(activitati.length)}
              unitate=""
              nota={`Din cele publicate de INS pentru ${AN}.`}
            />
          </div>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Câștiguri medii brute lunare pe activități în {judet.nume} — media {AN}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-normal text-stone-600">
              Toate sumele sunt brute lunare, calculate ca medie pentru întregul an {AN}; nu sunt nete și nu sunt
              salariul minim din 2026. Coloana din dreapta compară județul cu media națională a <em>aceleiași</em>{" "}
              activități. Unde o activitate găzduiește meserii din catalogul nostru, le găsești linkate.
            </p>
            <div className="my-6 overflow-x-auto">
              <table className="w-full min-w-[44rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft tabular-nums">
                <caption className="sr-only">
                  Câștigul salarial mediu brut lunar pe activități economice în {judet.nume}, media întregului an {AN}
                </caption>
                <thead>
                  <tr>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                      Activitate
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                      Meserii din catalog
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Brut lunar · media {AN}
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Față de aceeași activitate pe țară
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activitati.map((activitate) => {
                    const meserii = meseriiPentruActivitate(activitate.cheie);
                    const abatere =
                      activitate.national && activitate.national > 0
                        ? (activitate.brut - activitate.national) / activitate.national
                        : null;
                    return (
                      <tr key={activitate.cheie}>
                        <th
                          scope="row"
                          className="relative border-b border-stone-100 px-3 py-2 text-left font-medium text-stone-900"
                        >
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-1 left-0 rounded-r bg-stone-900/[0.06]"
                            style={{ width: `${Math.max(4, (activitate.brut / maxim) * 100)}%` }}
                          />
                          <span className="relative">
                            CAEN {activitate.cheie} ·{" "}
                            {denumireScurtaCaenRev2(activitate.cheie, activitate.denumire)}
                          </span>
                        </th>
                        <td className="border-b border-stone-100 px-3 py-2 text-left text-xs text-stone-500">
                          {meserii.length > 0 ? meserii.slice(0, 3).join(", ") : "—"}
                          {meserii.length > 3 ? ` +${meserii.length - 3}` : ""}
                        </td>
                        <td className="border-b border-stone-100 px-3 py-2 text-right font-semibold text-stone-900">
                          {lei(activitate.brut)} lei
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
            <NotaSursa>
              Sursa: Institutul Național de Statistică, TEMPO-Online, matricea{" "}
              <a href={URL_FOM107E} target="_blank" rel="noopener noreferrer">{MATRICE_JUDETE}</a> — câștig salarial
              nominal mediu brut lunar pe activități CAEN Rev.2 și județe, media întregului an {AN}. Nu este net și
              nu este salariul minim; în 2024, pragurile legale au fost stabilite prin{" "}
              <a href={URL_HG_900_2023} target="_blank" rel="noopener noreferrer">HG 900/2023</a> și{" "}
              <a href={URL_HG_598_2024} target="_blank" rel="noopener noreferrer">HG 598/2024</a>. Reutilizare conform
              licenței pentru o guvernare deschisă. Sunt medii pe județ, nu pe oraș. Vezi{" "}
              <Link href="/metodologie">metodologia</Link> și{" "}
              <Link href="/salarii/judete">toate județele</Link>.
            </NotaSursa>
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Județe din jurul lui</h2>
            <p className="mt-1 text-sm text-stone-600">Vecinii din clasament, nu vecinii geografici.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vecine.map((alt) => (
                <LinkCard
                  key={alt.slug}
                  href={`/salarii/judet/${alt.slug}`}
                  titlu={alt.nume}
                  detaliu={`Brut lunar · media ${AN} · locul ${JUDETE.findIndex((j) => j.slug === alt.slug) + 1} din ${JUDETE.length}`}
                  valoare={`${lei(alt.brut)} lei`}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <Faq items={intrebari} />
    </>
  );
}
