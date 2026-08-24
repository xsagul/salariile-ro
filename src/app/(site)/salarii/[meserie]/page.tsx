// src/app/(site)/salarii/[meserie]/page.tsx
// Pagina unei meserii. Server Component pur.
//
// Structura raspunde la intrebarea reala din spatele cautarii („cat se castiga
// ca X?") fara sa pretinda o precizie pe care datele nu o au: intai cifra de
// sector cu eticheta ei, apoi cifra dinspre ocupatie, apoi geografia si
// experienta. Netul e calculat cu motorul fiscal al site-ului, nu estimat.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import {
  CardCifra,
  GraficSerie,
  LinkCard,
  NotaSursa,
  TabelJudete,
  lei,
  lunaLunga,
  procent,
} from "@/app/components/Salarii";
import {
  AN_JUDETE,
  AN_OCUPATII,
  LUNA_REFERINTA,
  LUNI_SERIE,
  MATRICE_BRUT,
  MATRICE_JUDETE,
  MATRICE_NET,
  MATRICE_OCUPATII,
  TOTAL_ECONOMIE,
  etichetaJudete,
  variatieAnuala,
} from "@/lib/ins-date";
import {
  COMPARATII,
  MESERII,
  dateMeserieSauEroare,
  getMeserie,
  meseriiDinCategorie,
  type DateMeserie,
} from "@/lib/meserii";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

interface Props {
  params: Promise<{ meserie: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return MESERII.map((meserie) => ({ meserie: meserie.slug }));
}

const LUNA = lunaLunga(LUNA_REFERINTA);
const AN_ANCHETA = AN_OCUPATII.replace("Anul ", "");
const AN_JUDETE_SCURT = AN_JUDETE.replace("Anul ", "");
const BRAND = " | Salariile.ro";
const TITLU_MAX = 60;

function titluPagina(nume: string) {
  const scurt = `Salariu ${nume.toLocaleLowerCase("ro-RO")} 2026: brut și net`;
  return scurt.length + BRAND.length <= TITLU_MAX ? `${scurt}${BRAND}` : scurt;
}

function descrierePagina(date: DateMeserie) {
  const numeMic = date.meserie.nume.toLocaleLowerCase("ro-RO");
  // Netul intai: oamenii cauta „salariu net <meserie>", nu brutul. Intervalul
  // in loc de cifra de sector: altfel meseriile din acelasi CAEN ar avea toate
  // aceeasi descriere, iar in SERP ar arata identic.
  const { estimare } = date;
  if (estimare && !estimare.capeteApropiate) {
    return `Cât câștigă un ${numeMic} în 2026: estimativ ${lei(estimare.netMin)}–${lei(estimare.netMax)} lei net pe lună (${lei(estimare.brutMin)}–${lei(estimare.brutMax)} lei brut), din datele INS. Pe județe și pe vârste.`;
  }
  return `Salariu ${numeMic} în 2026: ${lei(date.sector.brutCurent)} lei brut mediu în sectorul CAEN ${date.sector.cheie} (INS, ${LUNA}) și ${lei(date.netStandard)} lei net calculat standard. Date pe județe și pe vârste.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { meserie: slug } = await params;
  const meserie = getMeserie(slug);
  if (!meserie) return {};
  const date = dateMeserieSauEroare(meserie);
  const titlu = titluPagina(meserie.nume);
  const descriere = descrierePagina(date);
  const titluSocial = `Salariu ${meserie.nume.toLocaleLowerCase("ro-RO")} 2026`;

  return {
    title: { absolute: titlu },
    description: descriere,
    alternates: { canonical: `https://salariile.ro/salarii/${slug}` },
    openGraph: ogPage({ title: titluSocial, description: descriere, path: `/salarii/${slug}` }),
    twitter: twPage({ title: titluSocial, description: descriere }),
  };
}

function faqPentru(date: DateMeserie) {
  const { meserie, sector, isco, judete, interval, clasament, estimare } = date;
  const numeMic = meserie.nume.toLocaleLowerCase("ro-RO");
  const primele = judete.slice(0, 3).map((j) => j.judet).join(", ");
  const areInterval = estimare !== null && !estimare.capeteApropiate;

  // Raspunsurile din FAQ ajung in SERP ca rich result. Trebuie sa dea aceeasi
  // cifra ca lead-ul paginii, altfel utilizatorul vede un numar in Google si
  // altul dupa click.
  const intrebari = areInterval
    ? [
        {
          q: `Cât câștigă un ${numeMic} în România în 2026?`,
          a: `Estimativ între ${lei(estimare.netMin)} și ${lei(estimare.netMax)} lei net pe lună, adică ${lei(estimare.brutMin)}–${lei(estimare.brutMax)} lei brut. INS nu publică salariul mediu pe ocupații individuale, ci două măsurători care încadrează ocupația: câștigul mediu din activitatea CAEN ${sector.cheie} (${sector.denumire}), unde lucrează majoritatea, și câștigul mediu al grupei de ocupații „${isco?.nume ?? ""}”, în toate sectoarele. Capetele intervalului sunt exact aceste două cifre.`,
        },
        {
          q: `Care este salariul net al unui ${numeMic}?`,
          a: `Între ${lei(estimare.netMin)} și ${lei(estimare.netMax)} lei net pe lună, calculat pentru funcția de bază, normă întreagă și fără persoane în întreținere, după CAS 25%, CASS 10% și impozit pe venit 10%.${estimare.inceput ? ` La început de carieră, la 20–24 de ani, reperul este ${lei(estimare.inceput.net)} lei net.` : ""}`,
        },
      ]
    : [
        {
          q: `Cât câștigă un ${numeMic} în România în 2026?`,
          a: `Nu există o statistică oficială separată pentru această ocupație. Cea mai apropiată măsurătoare lunară este câștigul salarial mediu brut din activitatea CAEN ${sector.cheie} (${sector.denumire}), unde lucrează majoritatea: ${lei(sector.brutCurent)} lei brut în ${LUNA}, conform INS. Media include toți salariații activității, de la debutanți la conducere.`,
        },
        {
          q: `Care este salariul net al unui ${numeMic}?`,
          a: `Un salariu brut de ${lei(sector.brutCurent)} lei, calculat pentru funcția de bază, normă întreagă și fără persoane în întreținere, dă ${lei(date.netStandard)} lei net în 2026, după CAS 25%, CASS 10% și impozit 10%.${date.netObservat ? ` Separat, netul mediu observat de INS în același sector și în aceeași lună a fost ${lei(date.netObservat)} lei — o medie a încasărilor reale, care include deduceri și scutiri.` : ""}`,
        },
      ];

  if (areInterval && estimare.inceput) {
    intrebari.push({
      q: `Cât câștigă un ${numeMic} la început de carieră?`,
      a: `În ancheta INS pe grupe de ocupații, salariații de 20–24 de ani din grupa „${isco?.nume ?? ""}” au avut un venit brut care, adus la nivelul lunii ${LUNA}, înseamnă ${lei(estimare.inceput.brut)} lei brut, adică ${lei(estimare.inceput.net)} lei net. Este un reper pentru începutul de carieră în grupa de ocupații, nu un salariu garantat de angajare.`,
    });
  }

  if (judete.length > 0) {
    intrebari.push({
      q: `În ce județe se câștigă cel mai bine ca ${numeMic}?`,
      a: `În ${AN_JUDETE_SCURT}, cele mai mari câștiguri medii brute din sectorul asociat meseriei au fost în ${primele}. Vârful a fost ${lei(judete[0].brut)} lei brut în ${judete[0].judet}, iar valoarea cea mai mică ${lei(judete[judete.length - 1].brut)} lei, în ${judete[judete.length - 1].judet}. Datele sunt pe județ, nu pe oraș.`,
    });
  }

  if (interval) {
    intrebari.push({
      q: `Care sunt cele mai mari salarii pentru un ${numeMic}?`,
      a: `În defalcarea INS pe județe din ${AN_JUDETE_SCURT}, câștigul mediu brut din sectorul asociat meseriei a variat între ${lei(interval.minim.brut)} lei în ${interval.minim.judet} și ${lei(interval.maxim.brut)} lei în ${interval.maxim.judet} — de ${interval.raport.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ori mai mult. Sunt medii pe județ, nu maxime individuale: un ${numeMic} cu experiență poate depăși capătul de sus, iar un debutant poate fi sub cel de jos.`,
    });
  }

  if (clasament) {
    intrebari.push({
      q: `Este ${numeMic} o meserie bine plătită?`,
      a: `Raportat la celelalte activități urmărite pe site, sectorul în care lucrează un ${numeMic} este pe locul ${clasament.loc} din ${clasament.total}, după câștigul mediu brut din ${LUNA}.${clasament.laEgalitate > 0 ? ` Locul este al activității, nu al ocupației: încă ${clasament.laEgalitate} ${clasament.laEgalitate === 1 ? "meserie din catalog împarte" : "meserii din catalog împart"} aceeași poziție, pentru că împart aceeași activitate CAEN.` : ""} Comparația corectă se face între sectoare, nu între persoane.`,
    });
  }

  if (isco) {
    const tanar = isco.varste.find((v) => v.varsta === "25-29 ani");
    const matur = isco.varste.find((v) => v.varsta === "40-44 ani");
    if (tanar && matur) {
      intrebari.push({
        q: `Cum crește salariul cu experiența pentru un ${numeMic}?`,
        a: `Meseria intră în grupa majoră de ocupații „${isco.nume}”. În ancheta INS din octombrie ${AN_ANCHETA}, venitul brut realizat în această grupă a fost ${lei(tanar.venitBrut)} lei la 25–29 de ani și ${lei(matur.venitBrut)} lei la 40–44 de ani, adică o creștere de ${procent((matur.venitBrut - tanar.venitBrut) / tanar.venitBrut, 0)}% între cele două praguri de vârstă.`,
      });
    }
  }

  if (meserie.cor) {
    intrebari.push({
      q: `Ce cod COR are meseria de ${numeMic}?`,
      a: `Codul COR folosit uzual pentru ${numeMic} este ${meserie.cor}. Codul se trece în contractul individual de muncă și în registrul general de evidență a salariaților; nu determină salariul, dar determină grupa de ocupații în care intră postul în statistici.`,
    });
  }

  return intrebari;
}

export default async function MeseriePage({ params }: Props) {
  const { meserie: slug } = await params;
  const meserie = getMeserie(slug);
  if (!meserie) notFound();

  const date = dateMeserieSauEroare(meserie);
  const { sector, isco, judete, categorie, interval, clasament, estimare } = date;
  const numeMic = meserie.nume.toLocaleLowerCase("ro-RO");
  const variatie = variatieAnuala(sector.brut);
  const fataDeEconomie = (sector.brutCurent - TOTAL_ECONOMIE.brutCurent) / TOTAL_ECONOMIE.brutCurent;
  const faq = faqPentru(date);
  const similare = meseriiDinCategorie(categorie.slug).filter((m) => m.slug !== meserie.slug).slice(0, 6);
  const comparatii = COMPARATII.filter((c) => c.a.slug === meserie.slug || c.b.slug === meserie.slug).slice(0, 4);
  const etichetaSectorJudete = etichetaJudete(meserie.caen2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
          { "@type": "ListItem", position: 2, name: "Salarii pe meserii", item: "https://salariile.ro/salarii" },
          { "@type": "ListItem", position: 3, name: meserie.nume, item: `https://salariile.ro/salarii/${slug}` },
        ],
      },
      {
        "@type": "Article",
        headline: `Salariu ${numeMic} 2026`,
        description: descrierePagina(date),
        author: personSchema,
        publisher: {
          "@type": "Organization",
          name: "Salariile.ro",
          logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
        },
        mainEntityOfPage: `https://salariile.ro/salarii/${slug}`,
        dateModified: "2026-08-21",
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
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
              { label: meserie.nume },
            ]}
          />
          <H1>Salariu {numeMic} în 2026</H1>
          {estimare && !estimare.capeteApropiate ? (
            <Lead>
              Un {numeMic} câștigă, estimativ, între <strong>{lei(estimare.netMin)} și {lei(estimare.netMax)} lei net</strong>{" "}
              pe lună, adică {lei(estimare.brutMin)}–{lei(estimare.brutMax)} lei brut. INS nu măsoară salariul pe
              ocupație, ci două lucruri care o încadrează: cât se câștigă în{" "}
              <strong>activitatea angajatorului</strong> (CAEN {sector.cheie}) și cât se câștigă în{" "}
              <strong>grupa de ocupații</strong> din care face parte postul. Capetele de mai sus sunt exact aceste două
              măsurători.
            </Lead>
          ) : (
            <Lead>
              Media lunară a sectorului în care lucrează majoritatea celor cu această meserie — CAEN {sector.cheie},{" "}
              {sector.denumire.toLocaleLowerCase("ro-RO")} — a fost <strong>{lei(sector.brutCurent)} lei brut</strong> în{" "}
              {LUNA}, conform INS. Din acest brut rezultă <strong>{lei(date.netStandard)} lei net</strong> într-un calcul
              standard. Nu este salariul unui {numeMic} anume: e media tuturor salariaților din activitate, de la
              debutant la conducere.
            </Lead>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {estimare && !estimare.capeteApropiate ? (
              <CardCifra
                accent
                eticheta="Estimare net, pe lună"
                valoare={`${lei(estimare.netMin)}–${lei(estimare.netMax)}`}
                nota={`Din ${lei(estimare.brutMin)}–${lei(estimare.brutMax)} lei brut. Capetele sunt cele două măsurători INS care încadrează ocupația.`}
              />
            ) : (
              <CardCifra
                accent
                eticheta={`Brut mediu sector, ${LUNA}`}
                valoare={lei(sector.brutCurent)}
                nota={`CAEN ${sector.cheie}. ${fataDeEconomie >= 0 ? "Peste" : "Sub"} media pe economie cu ${procent(Math.abs(fataDeEconomie), 0)}%.`}
              />
            )}
            <CardCifra
              eticheta={`Sectorul angajatorului, ${LUNA}`}
              valoare={lei(sector.brutCurent)}
              nota={`Brut, CAEN ${sector.cheie}. ${fataDeEconomie >= 0 ? "Peste" : "Sub"} media pe economie cu ${procent(Math.abs(fataDeEconomie), 0)}%. Include toate ocupațiile din activitate.`}
            />
            <CardCifra
              eticheta="Grupa de ocupații, indexat"
              valoare={estimare ? lei(estimare.brutOcupatie) : "—"}
              nota={
                isco
                  ? `Brut, „${isco.nume}”, în toate sectoarele. Ancheta INS din oct. ${AN_ANCHETA}, adusă la ${LUNA}.`
                  : undefined
              }
            />
            <CardCifra
              eticheta="La început de carieră"
              valoare={estimare?.inceput ? lei(estimare.inceput.net) : "—"}
              nota={
                estimare?.inceput
                  ? `Net, din ${lei(estimare.inceput.brut)} lei brut. Grupa de ocupații la 20–24 de ani, indexat.`
                  : undefined
              }
            />
          </div>

          {estimare && !estimare.capeteApropiate && (
            <p className="mt-4 rounded-md border border-stone-200 bg-surface p-4 text-sm leading-normal text-stone-600 shadow-soft">
              <strong className="font-semibold text-stone-900">Cum citești intervalul:</strong> nu e o decilă dintr-un
              sondaj și nu garantăm că orice {numeMic} se încadrează în el. Sunt cele două cifre pe care le publică INS
              și între care stă ocupația: media activității unde lucrează și media grupei de ocupații din care face
              parte. Cifra pe grupe de ocupații vine din ancheta din octombrie {AN_ANCHETA} și e adusă la {LUNA} cu
              evoluția câștigului mediu pe economie, ca să nu compare două perioade diferite.{" "}
              <Link href="/metodologie" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">
                Metodologia completă
              </Link>
              .
            </p>
          )}

          {meserie.nota && (
            <p className="mt-4 rounded-md border border-stone-300 bg-surface p-4 text-sm leading-normal text-stone-700 shadow-soft">
              <strong className="font-semibold text-stone-900">De reținut:</strong> {meserie.nota}
            </p>
          )}

          {/* Poziționarea și intervalul geografic. Amândouă sunt măsurători, nu
              estimări: locul vine din clasarea activităților din catalog, iar
              capetele intervalului sunt județe reale din aceeași serie anuală.
              Egalitatea de loc se declară explicit — locul e al activității, nu
              al ocupației, iar cititorul trebuie să știe asta. */}
          {(clasament || interval) && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {clasament && (
                <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
                  <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Poziția pe piața muncii
                  </div>
                  <p className="mt-2 text-base leading-normal text-stone-700">
                    Activitatea este pe{" "}
                    <strong className="font-semibold text-stone-900">
                      locul {clasament.loc} din {clasament.total}
                    </strong>{" "}
                    dintre cele urmărite pe site, după câștigul mediu brut din {LUNA}.
                    {clasament.laEgalitate > 0 && (
                      <>
                        {" "}
                        Alte {clasament.laEgalitate}{" "}
                        {clasament.laEgalitate === 1 ? "meserie împarte" : "meserii împart"} același loc, pentru că
                        împart aceeași activitate CAEN. Locul este al activității, nu al ocupației.
                      </>
                    )}
                  </p>
                </div>
              )}
              {interval && (
                <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
                  <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Interval pe județe, {AN_JUDETE_SCURT}
                  </div>
                  <p className="mt-2 text-base leading-normal text-stone-700">
                    <strong className="font-semibold text-stone-900">
                      {lei(interval.minim.brut)} – {lei(interval.maxim.brut)} lei
                    </strong>{" "}
                    brut, de la {interval.minim.judet} la {interval.maxim.judet}. Nu e o decilă estimată dintr-un
                    sondaj: sunt capetele reale ale defalcării INS pe județe.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 grid gap-10 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <section>
                <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
                  Ce face un {numeMic}
                </h2>
                <p className="mt-4 text-base leading-normal text-stone-600">{meserie.ceFace}</p>
                <p className="mt-4 text-base leading-normal text-stone-600">
                  În statistica oficială, postul apare de două ori și în două feluri: prin activitatea angajatorului
                  (CAEN {sector.cheie} — {sector.denumire.toLocaleLowerCase("ro-RO")}) și prin grupa majoră de
                  ocupații {isco ? `„${isco.nume}”` : "din clasificarea ISCO-08"}
                  {meserie.cor ? `, corespunzătoare codului COR ${meserie.cor}` : ""}. Cele două nu se suprapun: în
                  aceeași activitate lucrează și specialiști, și personal administrativ, și muncitori.
                </p>
              </section>

              <section className="mt-12">
                <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
                  Cum a evoluat sectorul în ultimele {LUNI_SERIE.length} luni
                </h2>
                <p className="mt-4 text-base leading-normal text-stone-600">
                  {variatie !== null ? (
                    <>
                      Față de aceeași lună a anului trecut, câștigul mediu brut din CAEN {sector.cheie}{" "}
                      {variatie >= 0 ? "a crescut" : "a scăzut"} cu{" "}
                      <strong>{procent(Math.abs(variatie))}%</strong>. Seria de mai jos este lunară și nedeflatată:
                      arată lei nominali, nu putere de cumpărare.
                    </>
                  ) : (
                    <>Seria de mai jos este lunară și nedeflatată: arată lei nominali, nu putere de cumpărare.</>
                  )}
                </p>
                <GraficSerie
                  luni={LUNI_SERIE}
                  valori={sector.brut}
                  titlu={`Câștig salarial mediu brut lunar, CAEN ${sector.cheie} — ${sector.denumire}. Sursa: INS, ${MATRICE_BRUT}.`}
                />
              </section>

              {isco && isco.varste.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
                    Cât contează vechimea
                  </h2>
                  <p className="mt-4 text-base leading-normal text-stone-600">
                    Aici nu mai vorbim despre sector, ci despre ocupație. Ancheta INS din octombrie {AN_ANCHETA}{" "}
                    publică, pentru grupa „{isco.nume}”, atât salariul de bază de încadrare, cât și venitul brut
                    realizat — adică baza plus sporuri, prime și ore suplimentare. Diferența dintre coloane arată cât
                    din câștig vine din afara încadrării.
                  </p>
                  <div className="my-6 overflow-x-auto">
                    <table className="w-full min-w-[30rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft tabular-nums">
                      <caption className="sr-only">
                        Salariu de bază și venit brut realizat pe grupe de vârstă, grupa {isco.nume}
                      </caption>
                      <thead>
                        <tr>
                          <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                            Vârstă
                          </th>
                          <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                            Salariu de bază
                          </th>
                          <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                            Venit brut realizat
                          </th>
                          <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                            Salariați
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {isco.varste.map((rand) => (
                          <tr key={rand.varsta}>
                            <th scope="row" className="border-b border-stone-100 px-3 py-2 text-left font-medium text-stone-900">
                              {rand.varsta}
                            </th>
                            <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-700">
                              {rand.salariuDeBaza ? `${lei(rand.salariuDeBaza)} lei` : "—"}
                            </td>
                            <td className="border-b border-stone-100 px-3 py-2 text-right font-medium text-stone-900">
                              {lei(rand.venitBrut)} lei
                            </td>
                            <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-600">
                              {rand.salariati ? lei(rand.salariati) : "—"}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <th scope="row" className="px-3 py-2 text-left font-semibold text-stone-900">
                            Toate vârstele
                          </th>
                          <td className="px-3 py-2 text-right text-stone-700">
                            {isco.salariuDeBazaTotal ? `${lei(isco.salariuDeBazaTotal)} lei` : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-stone-900">
                            {lei(isco.venitBrutTotal)} lei
                          </td>
                          <td className="px-3 py-2 text-right text-stone-600">
                            {isco.salariati ? lei(isco.salariati) : "—"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {judete.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
                    Unde se câștigă mai mult
                  </h2>
                  <p className="mt-4 text-base leading-normal text-stone-600">
                    Defalcarea pe județe este anuală și se publică pe clasificarea CAEN Rev.2, unde activitatea
                    apare ca „{etichetaSectorJudete}”. În {AN_JUDETE_SCURT}, primul județ din tabel a avut un câștig
                    mediu brut de{" "}
                    <strong>
                      {(interval?.raport ?? judete[0].brut / judete[judete.length - 1].brut).toLocaleString("ro-RO", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}{" "}
                      ori
                    </strong>{" "}
                    cât ultimul. Sunt valori pe județ, nu pe oraș: un județ cu un singur angajator mare poate arăta o
                    medie care nu se regăsește în restul localităților.
                  </p>
                  {/* Baza de comparație este valoarea NAȚIONALĂ a aceleiași serii
                      anuale, nu media lunară pe CAEN Rev.3 — altfel toate județele
                      ar apărea sub medie, doar pentru că se compară alt an și altă
                      clasificare. */}
                  <TabelJudete
                    judete={judete}
                    media={date.mediaJudete ?? judete[Math.floor(judete.length / 2)].brut}
                    an={AN_JUDETE_SCURT}
                    numeSector={sector.denumire}
                  />
                </section>
              )}

              <section className="mt-12">
                <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
                  Ce mută salariul în sus sau în jos
                </h2>
                <ul className="mt-4 list-disc pl-5 text-base leading-normal text-stone-600 [&_li]:mb-2">
                  <li>
                    <strong className="font-semibold text-stone-900">Județul.</strong> În sectorul asociat acestei
                    meserii, distanța dintre extreme a fost de{" "}
                    {judete.length > 0
                      ? `${lei(judete[0].brut - judete[judete.length - 1].brut)} lei brut pe lună`
                      : "una semnificativă"}
                    .
                  </li>
                  <li>
                    <strong className="font-semibold text-stone-900">Vechimea.</strong> În grupa de ocupații
                    relevantă, câștigul crește până în jurul vârstei de 35–44 de ani, apoi se aplatizează.
                  </li>
                  <li>
                    <strong className="font-semibold text-stone-900">Partea variabilă.</strong> Diferența dintre
                    salariul de bază și venitul brut realizat este sporuri, prime și ore suplimentare — negociabile
                    separat de încadrare.
                  </li>
                  <li>
                    <strong className="font-semibold text-stone-900">Mărimea angajatorului.</strong> Media sectorului
                    e trasă în sus de firmele mari; într-o firmă mică din aceeași activitate, brutul e de regulă sub
                    medie.
                  </li>
                  <li>
                    <strong className="font-semibold text-stone-900">Regimul fiscal.</strong> Din 1 ianuarie 2025 nu
                    mai există scutiri de impozit pentru IT și construcții, deci brutul se transformă în net la fel
                    în toate domeniile.
                  </li>
                </ul>
              </section>
            </div>

            <aside className="min-w-0 lg:col-span-1">
              <div className="rounded-md border border-stone-200 bg-surface p-6 shadow-soft">
                <h2 className="text-lg font-semibold tracking-[-0.01em] text-stone-900">Calculează-ți net-ul</h2>
                <p className="mt-2 text-sm leading-normal text-stone-600">
                  Pune brutul tău, nu media sectorului, și vezi exact CAS, CASS, impozit și costul angajatorului.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex min-h-11 items-center rounded border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
                >
                  Deschide calculatorul
                </Link>
              </div>

              {comparatii.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-stone-600">Comparații</h2>
                  <div className="mt-3 grid gap-2">
                    {comparatii.map((comparatie) => (
                      <LinkCard
                        key={comparatie.slug}
                        href={`/compara/${comparatie.slug}`}
                        titlu={`${comparatie.a.nume} vs ${comparatie.b.nume}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {similare.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-stone-600">
                    Alte meserii din {categorie.nume.toLocaleLowerCase("ro-RO")}
                  </h2>
                  <div className="mt-3 grid gap-2">
                    {similare.map((alta) => (
                      <LinkCard key={alta.slug} href={`/salarii/${alta.slug}`} titlu={alta.nume} />
                    ))}
                    <LinkCard
                      href={`/salarii/domeniu/${categorie.slug}`}
                      titlu={`Tot domeniul: ${categorie.nume}`}
                      detaliu="Toate meseriile, cu activitățile CAEN"
                    />
                  </div>
                </div>
              )}
            </aside>
          </div>

          <NotaSursa>
            Sursa: Institutul Național de Statistică, TEMPO-Online — matricele {MATRICE_BRUT} și {MATRICE_NET} (serie
            lunară pe activități CAEN Rev.3, ultima lună {LUNA}), {MATRICE_JUDETE} (pe județe, CAEN Rev.2,{" "}
            {AN_JUDETE_SCURT}) și {MATRICE_OCUPATII} (ancheta din octombrie pe grupe majore de ocupații ISCO-08,{" "}
            {AN_ANCHETA}). Reutilizare conform licenței pentru o guvernare deschisă. Netul standard este calculat de
            Salariile.ro cu regulile în vigoare din 1 iulie 2026 — vezi{" "}
            <Link href="/metodologie">metodologia</Link>. INS nu publică medii pe ocupații individuale, iar cifrele de
            aici nu sunt o promisiune salarială pentru un post anume.
          </NotaSursa>
        </div>
      </div>

      <Faq items={faq} />
    </>
  );
}
