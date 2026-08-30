// src/app/(site)/salarii/[meserie]/page.tsx
// Pagina unei meserii. Server Component pur.
//
// Structura raspunde direct la intrebarea reala din cautare („cat se castiga
// ca X?"): netul observat de INS in sector este reperul principal, apoi vine
// netul orientativ al grupei de ocupatii. Brutul ramane context secundar.

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
  trimestruScurt,
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
  MATRICE_VACANTE,
  PERIOADA_VACANTE,
  diferentaSexe,
  etichetaJudete,
  vacantePentruGrupa,
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
import { denumireScurtaCaen } from "@/lib/caen-denumiri";
import { intersectie } from "@/lib/ocupatii-caen";
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

/**
 * Cifra principala a paginii — un singur proprietar, ca titlul, descrierea si
 * corpul sa nu poata diverge. Ordinea: intersectia activitate x ocupatie, apoi
 * netul observat in sector, apoi calculul standard.
 */
function netPrincipal(date: DateMeserie) {
  const x = intersectie(date.meserie.caen2, date.meserie.isco);
  return x ? x.net : (date.netObservat ?? date.netStandard);
}

function titluPagina(date: DateMeserie) {
  const scurt = `Salariu ${date.meserie.nume.toLocaleLowerCase("ro-RO")} 2026: ${lei(netPrincipal(date))} lei net`;
  return scurt.length + BRAND.length <= TITLU_MAX ? `${scurt}${BRAND}` : scurt;
}

function descrierePagina(date: DateMeserie) {
  const numeMic = date.meserie.nume.toLocaleLowerCase("ro-RO");
  return `${lei(netPrincipal(date))} lei net/lună pentru ${numeMic}, din datele INS pe grupa de ocupații din sectorul asociat, indexate la ${LUNA}. Vezi brutul, diferența pe sexe, județele și vârstele.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { meserie: slug } = await params;
  const meserie = getMeserie(slug);
  if (!meserie) return {};
  const date = dateMeserieSauEroare(meserie);
  const titlu = titluPagina(date);
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
  const { meserie, sector, isco, judete, interval, clasament, repere } = date;
  const X = intersectie(meserie.caen2, meserie.isco);
  const numeMic = meserie.nume.toLocaleLowerCase("ro-RO");
  const primele = judete.slice(0, 3).map((j) => j.judet).join(", ");
  const netCurent = netPrincipal(date);

  // Raspunsurile din FAQ ajung in SERP ca rich result. Dau intai suma neta
  // cautata de utilizator, apoi explica pe scurt baza statistica.
  const intrebari = [
    {
      q: `Cât câștigă un ${numeMic} în România în 2026?`,
      a: `Ca reper actual, un ${numeMic} câștigă aproximativ ${lei(netCurent)} lei net pe lună în 2026. Cifra este media netă observată de INS în activitatea CAEN ${sector.cheie} (${sector.denumire}) din ${LUNA}. Salariul concret poate fi mai mic sau mai mare, în funcție de experiență, firmă, oraș și responsabilități.`,
    },
    {
      q: `Care este salariul net al unui ${numeMic}?`,
      a: X
        ? `Aproximativ ${lei(X.net)} lei net pe lună, din ${lei(X.brut)} lei brut. Cifra vine din ancheta INS pe grupa „${isco?.nume ?? ""}” din același sector de activitate, adică din ${lei(X.salariati ?? 0)} de salariați, și este indexată la ${LUNA}. Ancheta se face în octombrie; ultima disponibilă este din ${X.an.replace("Anul ", "")}. Media întregului sector, indiferent de ocupație, este ${lei(sector.brutCurent)} lei brut — o cifră mai largă, care include și posturile foarte diferite de acesta.`
        : `Reperul este ${lei(netCurent)} lei net pe lună, media observată de INS în sectorul asociat meseriei. Pentru această ocupație INS nu publică o cifră pe grupa de ocupații din sector, pentru că administrația publică nu intră în ancheta salarială.`,
    },
  ];

  if (repere?.inceput) {
    intrebari.push({
      q: `Cât câștigă un ${numeMic} la început de carieră?`,
      a: `Pentru începutul de carieră, reperul grupei ISCO la 20–24 de ani este ${lei(repere.inceput.net)} lei net pe lună, calculat din ${lei(repere.inceput.brut)} lei brut și indexat la ${LUNA}. Este o orientare pentru grupa largă „${isco?.nume ?? ""}”; oferta concretă depinde de angajator, oraș și pregătire.`,
    });
  }

  if (judete.length > 0) {
    intrebari.push({
      q: `În ce județe se câștigă cel mai bine ca ${numeMic}?`,
      a: `Ca medie lunară a întregului an ${AN_JUDETE_SCURT}, cele mai mari câștiguri salariale medii brute din activitatea CAEN Rev.2 asociată meseriei au fost în ${primele}. Vârful a fost ${lei(judete[0].brut)} lei brut în ${judete[0].judet}, iar valoarea cea mai mică ${lei(judete[judete.length - 1].brut)} lei, în ${judete[judete.length - 1].judet}. Sunt medii brute istorice ale sectorului, nu salarii nete ale meseriei și nu salariul minim din 2026.`,
    });
  }

  if (interval) {
    intrebari.push({
      q: `Cum variază media sectorului pe județe pentru un ${numeMic}?`,
      a: `În seria anuală INS pentru ${AN_JUDETE_SCURT}, câștigul salarial mediu brut lunar al sectorului asociat meseriei a fost între ${lei(interval.minim.brut)} lei în ${interval.minim.judet} și ${lei(interval.maxim.brut)} lei în ${interval.maxim.judet}. Acestea sunt mediile activității CAEN Rev.2 calculate pentru întregul an, nu un minim și un maxim salarial al meseriei.`,
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
  const { sector, isco, judete, categorie, interval, clasament } = date;
  // Celula comuna activitate x ocupatie. `null` pentru administratia publica,
  // pe care INS nu o include in ancheta salariala.
  const X = intersectie(meserie.caen2, meserie.isco);
  const numeMic = meserie.nume.toLocaleLowerCase("ro-RO");
  const netCurent = netPrincipal(date);
  const variatie = variatieAnuala(sector.net);
  const faq = faqPentru(date);
  const similare = meseriiDinCategorie(categorie.slug).filter((m) => m.slug !== meserie.slug).slice(0, 6);
  const comparatii = COMPARATII.filter((c) => c.a.slug === meserie.slug || c.b.slug === meserie.slug).slice(0, 4);
  const etichetaSectorJudete = etichetaJudete(meserie.caen2);
  const sexe = diferentaSexe(meserie.isco);
  const vacante = vacantePentruGrupa(meserie.isco);
  // Cat din castig vine din afara incadrarii, in grupa de ocupatii.
  const pesteBaza =
    isco?.salariuDeBazaTotal && isco.salariuDeBazaTotal > 0
      ? (isco.venitBrutTotal - isco.salariuDeBazaTotal) / isco.salariuDeBazaTotal
      : null;

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
        dateModified: "2026-08-25",
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
          <Lead>
            {X ? (
              <>
                Un {numeMic} câștigă în medie <strong>{lei(X.net)} lei net pe lună</strong>, din{" "}
                <strong>{lei(X.brut)} lei brut</strong>. Cifra vine din ancheta INS pe {X.salariati ? `${lei(X.salariati)} de salariați` : "salariații"}{" "}
                din aceeași grupă de ocupații și același sector, actualizată la {LUNA}.
              </>
            ) : (
              <>
                Ca reper, un {numeMic} câștigă aproximativ <strong>{lei(netCurent)} lei net pe lună</strong> în 2026 —
                media netă observată de INS în sectorul CAEN {sector.cheie}, actualizată pentru {LUNA}.
              </>
            )}
          </Lead>

          {/*
            DOUA cifre, nu patru. Pana pe 31 august 2026 pagina arata media
            sectorului, brutul sectorului, reperul grupei ISCO si reperul de
            inceput de cariera — plus un paragraf care explica cum sa le citesti.
            Patru repere cu greutate egala nu ajuta pe nimeni: omul cauta „cat
            castiga un web developer", nu un tabel statistic. Restul reperelor
            raman mai jos in pagina, unde nu concureaza cu raspunsul.
          */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <CardCifra
              accent
              eticheta="Câștig net lunar"
              valoare={lei(X ? X.net : netCurent)}
              unitate="lei net"
              nota={
                X
                  ? `Grupa „${isco?.nume ?? ""}” în ${denumireScurtaCaen(sector.cheie, sector.denumire).toLocaleLowerCase("ro-RO")}, ancheta INS din octombrie ${X.an.replace("Anul ", "")}, indexată la ${LUNA}.`
                  : `Media netă INS din sectorul CAEN ${sector.cheie}, ${LUNA}.`
              }
            />
            <CardCifra
              eticheta="Salariu brut"
              valoare={lei(X ? X.brut : sector.brutCurent)}
              unitate="lei brut"
              nota={
                X
                  ? `Suma din contract, înainte de CAS, CASS și impozit. Netul de alături e calculat din ea.`
                  : `Media tuturor salariaților din CAEN ${sector.cheie}, ${LUNA}.`
              }
            />
          </div>

          {X && (
            <p className="mt-4 rounded-md border border-stone-200 bg-surface p-4 text-sm leading-normal text-stone-600 shadow-soft">
              <strong className="font-semibold text-stone-900">Ce măsoară cifra:</strong> media grupei de ocupații
              „{isco?.nume ?? ""}” din acest sector — nu a meseriei în sine. INS nu publică salarii pe ocupații
              individuale, așa că meserii înrudite din aceeași grupă apar cu aceeași valoare. Este cel mai fin nivel
              disponibil, nu o măsurătoare directă a postului.{" "}
              <Link href="/metodologie" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">
                Metodologia completă
              </Link>
              .
            </p>
          )}

          {X?.peSexe && (
            <p className="mt-4 text-sm leading-normal text-stone-600">
              În aceeași grupă și același sector, bărbații câștigă {lei(X.peSexe.masculin)} lei brut și femeile{" "}
              {lei(X.peSexe.feminin)} lei — o diferență de{" "}
              <strong className="font-semibold text-stone-900">{X.peSexe.diferentaProcent}%</strong>.{" "}
              <Link href="/salarii/femei-barbati" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">
                Vezi diferența pe toată economia
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
          {(clasament || interval || vacante) && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    Brut lunar pe județe · media {AN_JUDETE_SCURT}
                  </div>
                  <p className="mt-2 text-base leading-normal text-stone-700">
                    <strong className="font-semibold text-stone-900">
                      {lei(interval.minim.brut)}–{lei(interval.maxim.brut)} lei brut
                    </strong>
                    , de la {interval.minim.judet} la {interval.maxim.judet}. Sunt mediile lunare ale activității CAEN
                    Rev.2 pentru întregul an, nu salarii nete și nu limite individuale.
                  </p>
                </div>
              )}
              {/* Cererea, nu doar plata. Pagina raspundea pana acum doar la
                  „cat se castiga"; asta raspunde la „cat se cauta". E si cea
                  mai proaspata cifra de pe pagina: trimestriala, in timp ce
                  ancheta pe ocupatii e anuala si din octombrie. */}
              {vacante && (
                <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
                  <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Posturi vacante, {trimestruScurt(PERIOADA_VACANTE)}
                  </div>
                  <p className="mt-2 text-base leading-normal text-stone-700">
                    <strong className="font-semibold text-stone-900">{lei(vacante.posturi)} posturi</strong> vacante în
                    grupa de ocupații din care face parte meseria, pe toată economia
                    {vacante.rata !== null && (
                      <>
                        {" "}
                        — o rată de {vacante.rata.toLocaleString("ro-RO", { maximumFractionDigits: 2 })}%
                      </>
                    )}
                    .
                    {vacante.variatieAnuala !== null && (
                      <>
                        {" "}
                        Față de același trimestru al anului trecut,{" "}
                        {vacante.variatieAnuala >= 0 ? "în creștere" : "în scădere"} cu{" "}
                        {procent(Math.abs(vacante.variatieAnuala), 0)}%.
                      </>
                    )}{" "}
                    Cifra e a grupei, nu a meseriei.
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
                      Față de aceeași lună a anului trecut, câștigul mediu net din CAEN {sector.cheie}{" "}
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
                  valori={sector.net}
                  titlu={`Câștig salarial mediu net lunar, CAEN ${sector.cheie} — ${sector.denumire}. Sursa: INS, ${MATRICE_NET}.`}
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
                  {/* Cifra explica o confuzie reala: omul isi vede salariul de
                      baza in contract, vede media de pe site mai mare si crede
                      ca cifra e gresita. La operatori, jumatate din castig vine
                      din afara incadrarii. */}
                  {pesteBaza !== null && (
                    <p className="mt-4 text-base leading-normal text-stone-600">
                      În această grupă, venitul realizat este cu{" "}
                      <strong className="font-semibold text-stone-900">{procent(pesteBaza, 0)}% peste</strong> salariul
                      de bază de încadrare. Dacă în contractul tău scrie o sumă mai mică decât cifrele de pe pagină, de
                      obicei asta e explicația: contractul trece încadrarea, iar statistica măsoară ce s-a plătit
                      efectiv, cu tot cu sporuri și ore suplimentare.
                    </p>
                  )}
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

                  {/* Diferenta pe sexe din ACEEASI ancheta si aceeasi grupa.
                      E context, nu diferentiere: toate meseriile dintr-o grupa
                      ISCO au aceeasi cifra, si pagina spune asta. */}
                  {sexe && (
                    <p className="mt-4 rounded-md border border-stone-200 bg-surface p-4 text-sm leading-normal text-stone-600 shadow-soft">
                      <strong className="font-semibold text-stone-900">Femei și bărbați:</strong> în aceeași grupă de
                      ocupații, bărbații au avut un venit brut realizat de {lei(sexe.brutMasculin)} lei, iar femeile{" "}
                      {lei(sexe.brutFeminin)} lei — o diferență de {procent(Math.abs(sexe.diferenta))}%
                      {sexe.diferenta < 0 ? " în defavoarea femeilor" : " în favoarea femeilor"}.
                      {sexe.pondereFemei !== null && ` Femeile reprezintă ${procent(sexe.pondereFemei, 0)}% din grupă.`}{" "}
                      Cifra e a grupei întregi, nu a acestei meserii, și nu măsoară diferența la post egal.{" "}
                      <Link
                        href="/salarii/femei-barbati"
                        className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
                      >
                        Toate grupele și evoluția pe vârste
                      </Link>
                      .
                    </p>
                  )}
                </section>
              )}

              {judete.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
                    Câștigul mediu brut lunar al sectorului pe județe — media {AN_JUDETE_SCURT}
                  </h2>
                  <p className="mt-4 text-base leading-normal text-stone-600">
                    Seria județeană INS este separată de cifrele nete din 2026 afișate mai sus. Fiecare sumă din tabel
                    este câștigul salarial nominal mediu <strong>brut lunar</strong> al activității CAEN Rev.2
                    „{etichetaSectorJudete}”, calculat ca medie pentru întregul an {AN_JUDETE_SCURT}. Primul județ a
                    avut o medie de{" "}
                    <strong>
                      {(interval?.raport ?? judete[0].brut / judete[judete.length - 1].brut).toLocaleString("ro-RO", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}{" "}
                      ori
                    </strong>{" "}
                    mai mare decât ultimul. Valorile sunt pe județ, nu pe oraș, nu sunt nete și nu reprezintă
                    salariul minim din 2026.
                  </p>
                  {/* Baza de comparație este valoarea NAȚIONALĂ a aceleiași serii
                      anuale, nu media lunară pe CAEN Rev.3 — altfel toate județele
                      ar apărea sub medie, doar pentru că se compară alt an și altă
                      clasificare. */}
                  <TabelJudete
                    judete={judete}
                    media={date.mediaJudete}
                    an={AN_JUDETE_SCURT}
                    numeActivitate={etichetaSectorJudete ?? sector.denumire}
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
                      ? `${lei(judete[0].brut - judete[judete.length - 1].brut)} lei brut lunar în media anului ${AN_JUDETE_SCURT}`
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
            lunară pe activități CAEN Rev.3, ultima lună {LUNA}),{" "}
            <a
              href="https://statistici.insse.ro/tempoins/?ind=FOM107E&lang=ro&page=tempo3"
              target="_blank"
              rel="noopener"
            >
              {MATRICE_JUDETE}
            </a>{" "}
            (câștig salarial nominal mediu brut lunar pe județe, CAEN Rev.2, media anului {AN_JUDETE_SCURT}),{" "}
            {MATRICE_OCUPATII} (ancheta din octombrie pe grupe majore de ocupații ISCO-08,{" "}
            {AN_ANCHETA})
            {vacante && MATRICE_VACANTE ? (
              <>
                {" "}
                și {MATRICE_VACANTE} (locuri de muncă vacante pe grupe de ocupații, trimestrial,{" "}
                {trimestruScurt(PERIOADA_VACANTE)})
              </>
            ) : null}
            . Reutilizare conform licenței pentru o guvernare deschisă. Netul standard este calculat de
            Salariile.ro cu regulile în vigoare din 1 iulie 2026 — vezi{" "}
            <Link href="/metodologie">metodologia</Link>. Cifra principală vine din matricea FOM121A (câștig pe grupe de ocupații și activități, anual, octombrie). Valorile sunt repere la nivel de grupă și sector;
            oferta individuală variază în funcție de rol, experiență, angajator și localitate.
          </NotaSursa>
        </div>
      </div>

      <Faq items={faq} />
    </>
  );
}
