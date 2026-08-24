// src/app/(site)/salarii/domeniu/[domeniu]/page.tsx
// Pagina unui domeniu de activitate. Server Component pur.
//
// De ce exista: pe hub-ul /salarii, categoriile sunt doar ancore intr-o lista.
// Concurenta trateaza categoria ca document — la paylab, pagina de categorie IT
// are peste 6.000 de cuvinte si 109 linkuri interne, si de acolo isi distribuie
// autoritatea catre paginile de pozitie. Aici facem acelasi lucru, dar cu
// etichetarea corecta: fiecare cifra spune ce masoara si din ce luna vine.
//
// Ruta e `/salarii/domeniu/{slug}`, nu `/salarii/{slug}`, pentru ca al doilea
// segment de sub /salarii e deja luat de meserii si doua rute dinamice nu pot
// sta pe acelasi nivel.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import { CardCifra, LinkCard, NotaSursa, lei, lunaLunga, procent } from "@/app/components/Salarii";
import { denumireScurtaCaen } from "@/lib/caen-denumiri";
import { AN_JUDETE, LUNA_REFERINTA, MATRICE_BRUT, MATRICE_JUDETE, MATRICE_NET, TOTAL_ECONOMIE } from "@/lib/ins-date";
import { CATEGORII, COMPARATII, dateMeserie, getCategorie, meseriiDinCategorie, type DateMeserie } from "@/lib/meserii";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

interface Props {
  params: Promise<{ domeniu: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORII.map((categorie) => ({ domeniu: categorie.slug }));
}

const LUNA = lunaLunga(LUNA_REFERINTA);
const AN_JUDETE_SCURT = AN_JUDETE.replace("Anul ", "");

/**
 * Numele domeniului asa cum se scrie in mijlocul unei fraze.
 *
 * Nu se poate folosi `toLocaleLowerCase` pe tot: „IT și telecomunicații" ar
 * deveni „it și telecomunicații", iar „HoReCa și turism" ar deveni „hoReCa".
 * Coboram prima litera doar cand primul cuvant nu are alte majuscule in el,
 * adica atunci cand e cuvant obisnuit, nu acronim.
 */
function numeInFraza(nume: string): string {
  const primulCuvant = nume.split(" ")[0];
  const areMajusculeInInterior = /[A-ZĂÂÎȘȚ]/.test(primulCuvant.slice(1));
  if (areMajusculeInInterior) return nume;
  return nume.charAt(0).toLocaleLowerCase("ro-RO") + nume.slice(1);
}

/** Meseriile domeniului, cu date, ordonate descrescator dupa brutul sectorului. */
function meseriileDomeniului(slug: string): DateMeserie[] {
  return meseriiDinCategorie(slug)
    .map((meserie) => dateMeserie(meserie))
    .filter((date): date is DateMeserie => date !== null)
    .sort((a, b) => b.sector.brutCurent - a.sector.brutCurent);
}

/** Activitatile CAEN distincte atinse de domeniu, cu cate meserii cad in fiecare. */
function activitatiDomeniu(date: DateMeserie[]) {
  const harta = new Map<string, { cheie: string; denumire: string; brut: number; meserii: string[] }>();
  for (const intrare of date) {
    const cheie = intrare.sector.cheie;
    if (!harta.has(cheie)) {
      harta.set(cheie, { cheie, denumire: intrare.sector.denumire, brut: intrare.sector.brutCurent, meserii: [] });
    }
    harta.get(cheie)!.meserii.push(intrare.meserie.nume);
  }
  return [...harta.values()].sort((a, b) => b.brut - a.brut);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domeniu: slug } = await params;
  const categorie = getCategorie(slug);
  if (!categorie) return {};
  const date = meseriileDomeniului(slug);
  if (date.length === 0) return {};

  const descriere = `Salariile din ${numeInFraza(categorie.nume)}: ${date.length} meserii, cu datele INS din ${LUNA}. Brut, net calculat și activitatea CAEN a fiecăreia.`;
  // Titlul nu poarta anul: cu el, domeniile cu nume lung trec de 60 de caractere.
  const titlu = `Salarii în ${numeInFraza(categorie.nume)}`;

  return {
    title: { absolute: `${titlu} | Salariile.ro` },
    description: descriere,
    alternates: { canonical: `https://salariile.ro/salarii/domeniu/${slug}` },
    openGraph: ogPage({ title: titlu, description: descriere, path: `/salarii/domeniu/${slug}` }),
    twitter: twPage({ title: titlu, description: descriere }),
  };
}

export default async function DomeniuPage({ params }: Props) {
  const { domeniu: slug } = await params;
  const categorie = getCategorie(slug);
  if (!categorie) notFound();
  const date = meseriileDomeniului(slug);
  if (date.length === 0) notFound();

  const numeMic = numeInFraza(categorie.nume);
  const activitati = activitatiDomeniu(date);
  const ceaMaiBine = date[0];
  const ceaMaiProst = date[date.length - 1];
  const mediaDomeniu = Math.round(date.reduce((sumă, d) => sumă + d.sector.brutCurent, 0) / date.length);
  const fataDeEconomie = (mediaDomeniu - TOTAL_ECONOMIE.brutCurent) / TOTAL_ECONOMIE.brutCurent;
  const slugurile = new Set(date.map((d) => d.meserie.slug));
  const comparatii = COMPARATII.filter((c) => slugurile.has(c.a.slug) || slugurile.has(c.b.slug)).slice(0, 6);
  const alteDomenii = CATEGORII.filter((c) => c.slug !== slug);

  const intrebari = [
    {
      q: `Cât se câștigă în ${numeMic} în România?`,
      a: `Cele ${date.length} meserii urmărite aici se împart pe ${activitati.length} ${activitati.length === 1 ? "activitate economică" : "activități economice"} din clasificarea CAEN. În ${LUNA}, câștigul salarial mediu brut al acestor activități a mers de la ${lei(ceaMaiProst.sector.brutCurent)} lei (${ceaMaiProst.sector.denumire.toLocaleLowerCase("ro-RO")}) până la ${lei(ceaMaiBine.sector.brutCurent)} lei (${ceaMaiBine.sector.denumire.toLocaleLowerCase("ro-RO")}). Media simplă a activităților din domeniu este ${lei(mediaDomeniu)} lei brut, ${fataDeEconomie >= 0 ? "peste" : "sub"} media pe economie cu ${procent(Math.abs(fataDeEconomie), 0)}%.`,
    },
    {
      q: `Care este cea mai bine plătită meserie din ${numeMic}?`,
      a: `După câștigul mediu brut al activității în care lucrează, ${ceaMaiBine.meserie.nume.toLocaleLowerCase("ro-RO")} stă cel mai bine: ${lei(ceaMaiBine.sector.brutCurent)} lei brut în ${LUNA}, în CAEN ${ceaMaiBine.sector.cheie}. Atenție la ce înseamnă cifra: e media tuturor salariaților activității, de la debutant la conducere, nu salariul unei persoane cu această meserie.`,
    },
    {
      q: `De ce mai multe meserii din ${numeMic} au aceeași cifră?`,
      a: `Pentru că INS nu publică o medie lunară pe ocupație, ci pe activitatea economică a angajatorului. Meseriile care lucrează în aceeași activitate CAEN au același reper de sector. Pe pagina fiecărei meserii vezi separat și reperul grupei majore ISCO-08 din ancheta INS din octombrie. Acesta descrie o familie largă de ocupații din toate sectoarele; nu este o estimare care diferențiază automat meseriile.`,
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
          { "@type": "ListItem", position: 3, name: categorie.nume, item: `https://salariile.ro/salarii/domeniu/${slug}` },
        ],
      },
      {
        "@type": "CollectionPage",
        name: `Salarii în ${numeMic}`,
        url: `https://salariile.ro/salarii/domeniu/${slug}`,
        author: personSchema,
        publisher: {
          "@type": "Organization",
          name: "Salariile.ro",
          logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: date.length,
          itemListElement: date.map((intrare, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: intrare.meserie.nume,
            url: `https://salariile.ro/salarii/${intrare.meserie.slug}`,
          })),
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
              { label: categorie.nume },
            ]}
          />
          <H1>Salarii în {numeMic}</H1>
          <Lead>
            {categorie.descriere} Sunt <strong>{date.length} meserii</strong>, împărțite pe {activitati.length}{" "}
            {activitati.length === 1 ? "activitate economică" : "activități economice"} din clasificarea CAEN, cu
            datele INS din <strong>{LUNA}</strong>. Fiecare cifră de mai jos este media activității în care lucrează
            majoritatea celor cu meseria respectivă — nu salariul unei persoane.
          </Lead>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CardCifra
              accent
              eticheta={`Media domeniului, ${LUNA}`}
              valoare={lei(mediaDomeniu)}
              nota={`Media simplă a celor ${activitati.length} activități. ${fataDeEconomie >= 0 ? "Peste" : "Sub"} media pe economie cu ${procent(Math.abs(fataDeEconomie), 0)}%.`}
            />
            <CardCifra
              eticheta="Cel mai bine plătit sector"
              valoare={lei(ceaMaiBine.sector.brutCurent)}
              nota={`CAEN ${ceaMaiBine.sector.cheie} — ${denumireScurtaCaen(ceaMaiBine.sector.cheie, ceaMaiBine.sector.denumire)}.`}
            />
            <CardCifra
              eticheta="Cel mai prost plătit sector"
              valoare={lei(ceaMaiProst.sector.brutCurent)}
              nota={`CAEN ${ceaMaiProst.sector.cheie} — ${denumireScurtaCaen(ceaMaiProst.sector.cheie, ceaMaiProst.sector.denumire)}.`}
            />
            <CardCifra
              eticheta="Meserii urmărite"
              valoare={String(date.length)}
              unitate=""
              nota={`Din ${activitati.length} ${activitati.length === 1 ? "activitate CAEN" : "activități CAEN"} distincte.`}
            />
          </div>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Toate meseriile din {numeMic}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-normal text-stone-600">
              Ordonate după câștigul mediu brut al activității. Coloana „ce face” e fișa scurtă a meseriei, iar
              intervalul arată capetele reale ale defalcării INS pe județe din {AN_JUDETE_SCURT} — județul cel mai
              bine plătit și cel mai prost plătit din aceeași activitate.
            </p>
            <div className="my-6 overflow-x-auto">
              <table className="w-full min-w-[46rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft">
                <caption className="sr-only">
                  Meseriile din {numeMic}, cu activitatea CAEN, câștigul mediu brut și intervalul pe județe
                </caption>
                <thead>
                  <tr>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                      Meserie
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                      Ce face
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Brut sector
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Interval județe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {date.map((intrare) => (
                    <tr key={intrare.meserie.slug}>
                      <th scope="row" className="border-b border-stone-100 px-3 py-3 text-left align-top font-medium">
                        <Link
                          href={`/salarii/${intrare.meserie.slug}`}
                          className="text-stone-900 underline underline-offset-2 hover:text-stone-600"
                        >
                          {intrare.meserie.nume}
                        </Link>
                        <span className="mt-1 block text-xs font-normal text-stone-500">
                          CAEN {intrare.sector.cheie} ·{" "}
                          {denumireScurtaCaen(intrare.sector.cheie, intrare.sector.denumire)}
                        </span>
                      </th>
                      <td className="border-b border-stone-100 px-3 py-3 align-top text-stone-600">
                        {intrare.meserie.ceFace}
                      </td>
                      <td className="border-b border-stone-100 px-3 py-3 text-right align-top font-semibold tabular-nums text-stone-900">
                        {lei(intrare.sector.brutCurent)} lei
                      </td>
                      <td className="border-b border-stone-100 px-3 py-3 text-right align-top tabular-nums text-stone-600">
                        {intrare.interval
                          ? `${lei(intrare.interval.minim.brut)} – ${lei(intrare.interval.maxim.brut)}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12 max-w-3xl">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Ce activități economice acoperă domeniul
            </h2>
            <p className="mt-4 text-base leading-normal text-stone-600">
              Domeniul e o grupare editorială a noastră, făcută ca să poți naviga. Statistica, în schimb, se publică
              pe activități CAEN, iar acestea sunt cele atinse aici. Unde mai multe meserii cad în aceeași activitate,
              ele împart inevitabil aceeași medie lunară.
            </p>
            <ul className="mt-4 list-disc pl-5 text-base leading-normal text-stone-600 [&_li]:mb-2">
              {activitati.map((activitate) => (
                <li key={activitate.cheie}>
                  <strong className="font-semibold text-stone-900">CAEN {activitate.cheie}</strong> —{" "}
                  {activitate.denumire.toLocaleLowerCase("ro-RO")}: {lei(activitate.brut)} lei brut în {LUNA}
                  {activitate.meserii.length > 1
                    ? `, comun pentru ${activitate.meserii.length} meserii (${activitate.meserii.join(", ")})`
                    : ` (${activitate.meserii[0]})`}
                  .
                </li>
              ))}
            </ul>
            <NotaSursa>
              Sursa: Institutul Național de Statistică, TEMPO-Online — matricele {MATRICE_BRUT} și {MATRICE_NET}{" "}
              (serie lunară pe activități CAEN Rev.3, ultima lună {LUNA}) și {MATRICE_JUDETE} (defalcarea pe județe,
              CAEN Rev.2, {AN_JUDETE_SCURT}). Reutilizare conform licenței pentru o guvernare deschisă. Gruparea pe
              domenii aparține Salariile.ro, nu INS. Vezi <Link href="/metodologie">metodologia</Link> și{" "}
              <Link href="/salarii">toate meseriile</Link>.
            </NotaSursa>
          </section>

          {comparatii.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
                Comparații care ating domeniul
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {comparatii.map((comparatie) => (
                  <LinkCard
                    key={comparatie.slug}
                    href={`/compara/${comparatie.slug}`}
                    titlu={`${comparatie.a.nume} vs ${comparatie.b.nume}`}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Celelalte domenii</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {alteDomenii.map((alta) => (
                <LinkCard
                  key={alta.slug}
                  href={`/salarii/domeniu/${alta.slug}`}
                  titlu={alta.nume}
                  detaliu={alta.descriere}
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
