// src/app/(site)/salarii/[meserie]/page.tsx
// Pagina unei meserii. Server Component pur.
//
// Structura raspunde direct la intrebarea reala din cautare („cat se castiga
// ca X?"): netul observat de INS in sector este reperul principal, apoi vine
// netul orientativ al grupei de ocupatii. Brutul ramane context secundar.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { notFound } from "next/navigation";
import { Breadcrumb, Faq, H1, Lead, TITLU_CARD, TITLU_SECTIUNE, SPATIU_JOS, SPATIU_SUS, INAINTE_DE_SECTIUNE } from "@/app/components/ui";
import {
  GraficSerie,
  LinkCard,
  NotaSursa,
  TabelGrila,
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
  INS_SURSA,
} from "@/lib/ins-date";
import {
  COMPARATII,
  MESERII,
  dateMeserieSauEroare,
  getMeserie,
  meseriiInrudite,
  type DateMeserie,
} from "@/lib/meserii";
import { SURSA_GRILE, grilaPublica } from "@/lib/grile-publice";
import TransparentaSalariu from '@/app/components/TransparentaSalariu';
import ReperSalariu from '@/app/components/ReperSalariu';
import PiloniSalariu from '@/app/components/PiloniSalariu';
import TrepteRapide from '@/app/components/TrepteRapide';
import { descriereReper, grilaEducatie, reperMeserie } from '@/lib/repere-meserii';
import { textIndicator } from '@/lib/indicator-meserie';
import corCatalogue from '@/data/cor-meserii.json';
import { calculStandard } from '@/lib/fiscal';
import { personSchema } from "@/lib/person";
import { ogPage, twPage, MESERII_LAST_MODIFIED } from "@/lib/seo";
import { TABEL_STANDARD } from "@/app/components/TabelArticol";

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
const BRAND = " | Salariile";
const TITLU_MAX = 60;

/**
 * Cifra principala a paginii — un singur proprietar, ca titlul, descrierea si
 * corpul sa nu poata diverge. Ordinea: intersectia activitate x ocupatie, apoi
 * netul observat in sector, apoi calculul standard.
 */


function titluPagina(date: DateMeserie) {
  const scurt = `Salariu ${date.meserie.nume.toLocaleLowerCase("ro-RO")} 2026`;
  return scurt.length + BRAND.length <= TITLU_MAX ? `${scurt}${BRAND}` : scurt;
}

/**
 * Descrierea porneste de la intrebarea pe care omul o tasteaza si da o cifra
 * concreta, dar niciodata una care sa inchida intrebarea. Un interval sau un
 * reper insotit de „din ce e facut" arata ca avem raspunsul si lasa deschisa
 * intrebarea „eu unde ma incadrez", la care se raspunde doar in pagina.
 */
function descrierePagina(date: DateMeserie) {
  const de = date.meserie.de;
  const lei = (n: number) => n.toLocaleString("ro-RO");
  const r = reperMeserie(date);
  const inceput = `Cât câștigă un ${de}`;

  const grilaCandidata = grilaPublica(date.meserie.slug);
  const grila = grilaCandidata?.doarSectiune ? undefined : grilaCandidata;
  const didactic = grilaEducatie(date.meserie.slug);
  const trepte = didactic.length
    ? didactic.map(x => calculStandard(x.iun2024)!.net)
    : grila?.trepte.map(t => t.net) ?? [];
  if (trepte.length > 1) {
    const min = Math.min(...trepte), max = Math.max(...trepte);
    return `${inceput}: ${lei(min)}–${lei(max)} lei net calculat pe treptele grilei publice afișate. Vezi funcțiile, studiile și componentele incluse.`;
  }

  const a = r.anunturi;
  if (r.kind === "salariile-ro" && r.value) {
    const surse = r.compus?.surse ?? 2;
    return `${inceput}: reper ${lei(r.value)} lei net, din ${surse} surse independente. Vezi anunțurile verificate și cum se compară cu oferta ta.`;
  }
  if (r.kind === "external-advertised" && r.value && a?.n) {
    return `${inceput}: ${lei(r.value)} lei net, mediana din ${a.n} anunțuri verificate. Vezi sursele, județele și cum se compară cu oferta ta.`;
  }
  if (r.kind === "external-reported" && r.value) {
    return `${inceput}: ${lei(r.value)} lei net, medie declarată de angajați. Plus salarii din anunțuri verificate și context din datele INS.`;
  }
  if (r.kind === "public-grid" && r.value) {
    return `${inceput}: ${lei(r.value)} lei net din grila legală, la gradația 0. Plus salarii din anunțuri verificate și context din datele INS.`;
  }
  // Fara reper pe meseria exacta nu se pune o cifra care ar parea masurata.
  return `${inceput} în România: anunțuri verificate, salarii declarate și datele INS pentru sectorul în care lucrează.`;
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
  const numeMic = date.meserie.nume.toLocaleLowerCase("ro-RO");
  const de = date.meserie.de;
  const candidata = grilaPublica(date.meserie.slug);
  const grila = candidata?.doarSectiune ? undefined : candidata;
  const didactic = grilaEducatie(date.meserie.slug);
  const trepte = didactic.length
    ? didactic.map(r => ({ eticheta: r.functie, net: calculStandard(r.iun2024)!.net }))
    : grila?.trepte.map(t => ({ eticheta: t.eticheta, net: t.net })) ?? [];
  // Oamenii nu cauta „ce salariu este documentat". Cauta „cat castiga un X",
  // „ce salariu are un X" si, cel mai des, treapta de inceput: „X debutant".
  // Randurile grilei nu sunt ordonate dupa vechime — la invatamant sunt niveluri
  // de studii — deci capetele se aleg dupa suma, nu dupa pozitia in tabel.
  const dupaSuma = [...trepte].sort((a, b) => a.net - b.net);
  const debutanti = trepte.filter(t => /debutant|stagiar|an i/i.test(t.eticheta));
  const debutant = debutanti.length
    ? debutanti.reduce((min, t) => (t.net < min.net ? t : min))
    : undefined;
  const maxim = dupaSuma[dupaSuma.length - 1];
  const varf = maxim && debutant && maxim.net > debutant.net * 1.05 ? maxim : null;
  const lei = (n: number) => `${n.toLocaleString("ro-RO")} lei net pe lună`;

  const intrebari = [
    { q: `Cât câștigă un ${de} în România?`, a: descriereReper(date) },
  ];
  if (debutant) {
    intrebari.push({
      q: `Cât câștigă un ${de} debutant?`,
      a: `La început de carieră, treapta „${debutant.eticheta}" înseamnă ${lei(debutant.net)}, calculat din salariul de bază brut prevăzut în grila legală, la gradația 0.${varf ? ` Cea mai bine plătită treaptă din grilă, „${varf.eticheta}", ajunge la ${lei(varf.net)}.` : ""} Peste aceste sume vin gradațiile de vechime și sporurile, care nu sunt incluse aici.`,
    });
  }
  intrebari.push(
    {
      q: `Care sunt treptele de salarizare pentru ${numeMic}?`,
      // Cu multe trepte (la învățământ sunt zeci), lista întreagă devenea un
      // paragraf cu zeci de cifre. Răspunsul dă capetele; tabelul are restul.
      a: trepte.length > 4
        ? `Grila legală are ${trepte.length} de trepte, de la ${lei(dupaSuma[0].net)} la ${lei(dupaSuma[dupaSuma.length - 1].net)}, înainte de vechime și sporuri. Toate sunt în tabelul de pe pagină.`
        : trepte.length
        ? `Grila legală prevede ${trepte.length} trepte: ${trepte.map(t => `${t.eticheta.toLocaleLowerCase("ro-RO")} ${lei(t.net)}`).join("; ")}. Sumele sunt salariile de pornire, înainte de vechime și sporuri.`
        : "Pentru rolurile din sectorul public, grilele legale prevăd trepte explicite după grad și vechime. În sectorul privat remunerația variază după experiență, competențe și responsabilități, iar reperul de pe pagină este însoțit de tipul sursei și de populația pe care o descrie.",
    },
    {
      q: `Cum compar o ofertă de angajare cu salariul unui ${de}?`,
      a: "Verifică salariul de bază brut, norma și orele, tichetele de masă, sporurile garantate și bonusurile variabile. Folosește calculatorul nostru de salariu ca să afli suma netă exactă a ofertei tale și compar-o cu reperul de mai sus.",
    },
  );
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

  const numeMic = meserie.nume.toLocaleLowerCase("ro-RO");
  // Grila legala, doar pentru meseriile bugetare. `null` pentru restul.
  const grila = grilaPublica(meserie.slug);
  const grilaDidactica = grilaEducatie(meserie.slug);

  const variatie = variatieAnuala(sector.net);
  const faq = faqPentru(date);
  // Ordonate dupa apropierea reala — grupa de ocupatii si activitate — nu dupa
  // pozitia in categorie, si insotite de cifra, ca legatura sa merite clickul.
  const similare = meseriiInrudite(meserie).map((alta) => {
    const r = reperMeserie(dateMeserieSauEroare(alta));
    return { alta, cifra: r.value ? `${textIndicator(r)} · ${r.label.toLocaleLowerCase("ro-RO")}` : undefined };
  });
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
          name: "Salariile",
          logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
        },
        mainEntityOfPage: `https://salariile.ro/salarii/${slug}`,
        dateModified: MESERII_LAST_MODIFIED.toISOString().slice(0, 10),
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
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>
          <Breadcrumb
            items={[
              { href: "/", label: "Acasă" },
              { href: "/salarii", label: "Salarii pe meserii" },
              { label: meserie.nume },
            ]}
          />
          <H1>Salariu {numeMic} în 2026</H1>
          <Lead>{meserie.ceFace}</Lead>
          <ReperSalariu date={date} />
          <TrepteRapide date={date} />
          <PiloniSalariu date={date} />
          <TransparentaSalariu slug={slug} />
          {grilaDidactica.length > 0 && <section className="mt-8 rounded-md border border-stone-200 bg-surface p-5">
            <h2 className={TITLU_CARD}>Grad didactic, studii și vechime în învățământ</h2>
            <p className="mt-3 text-sm text-stone-600">Net standard pe trepte didactice.</p>
            <div className="mt-4 max-h-96 overflow-auto"><table className={`${TABEL_STANDARD} min-w-[32rem]`}>
              <caption className="sr-only">Grila didactică: funcție, studii, vechime și net standard</caption>
              <thead><tr>{['Funcție și grad','Studii','Vechime în învățământ','Net lunar'].map(h=><th key={h} scope="col" className="border-b p-3 text-left">{h}</th>)}</tr></thead>
              <tbody>{grilaDidactica.map((r,i)=><tr key={i}><th scope="row" className="border-b border-stone-100 p-3 text-left font-normal">{r.functie}</th><td className="p-3">{r.studii}</td><td className="p-3">{r.vechime}</td><td className="whitespace-nowrap p-3 font-semibold">{lei(calculStandard(r.iun2024)!.net)} lei</td></tr>)}</tbody>
            </table></div>
            <Link href="/calculator-salariu-invatamant" className="mt-4 inline-flex min-h-11 items-center underline underline-offset-4">Calculează salariul cu gradația și majorările tale</Link>
          </section>}
          <nav aria-label="În această pagină" className="mt-6 flex flex-wrap gap-4 text-sm underline underline-offset-4">
            <a href="#profil" className="min-h-11 py-3">Meserie și COR</a>
            <a href="#piata" className="min-h-11 py-3">Evoluția sectorului</a>
            <a href="#oferta" className="min-h-11 py-3">Verifică oferta</a>
            <Link href="/compara" className="min-h-11 py-3">Compară meseriile</Link>
          </nav>

          {meserie.nota && (
            <p className="mt-4 rounded-md border border-stone-300 bg-surface p-4 text-sm text-stone-700 shadow-soft">
              <strong className="font-semibold text-stone-900">De reținut:</strong> {meserie.nota}
            </p>
          )}

          {/* Poziționarea și intervalul geografic. Amândouă sunt măsurători, nu
              estimări: locul vine din clasarea activităților din catalog, iar
              capetele intervalului sunt județe reale din aceeași serie anuală.
              Egalitatea de loc se declară explicit — locul e al activității, nu
              al ocupației, iar cititorul trebuie să știe asta. */}
          {(clasament || interval || vacante) && (
            <details className="mt-6"><summary className="min-h-11 cursor-pointer py-3 font-semibold">Contextul pieței muncii</summary><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clasament && (
                <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
                  <div className="text-xs font-medium uppercase tracking-wide text-stone-600">
                    Poziția în clasament
                  </div>
                  <p className="mt-2 text-base leading-normal text-stone-700">
                    Ocupația este pe{" "}
                    <strong className="font-semibold text-stone-900">
                      locul {clasament.loc} din {clasament.total}
                    </strong>{" "}
                    în{" "}
                    <Link href="/salarii/clasament" className="underline underline-offset-2 hover:text-stone-900">
                      clasamentul salariilor nete
                    </Link>{" "}
                    cu medii declarate în aceeași ediție Salario. Valorile egale au același loc.
                  </p>
                </div>
              )}
              {interval && (
                <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
                  <div className="text-xs font-medium uppercase tracking-wide text-stone-600">
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
                  <div className="text-xs font-medium uppercase tracking-wide text-stone-600">
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
            </div></details>
          )}

          <div className={`${INAINTE_DE_SECTIUNE} grid gap-10 lg:grid-cols-5 lg:gap-6`}>
            <div className="min-w-0 lg:col-span-3">
              {grila && (
                <section className="mb-12">
                  <h2 className={TITLU_SECTIUNE}>
                    Grila pentru {numeMic}: funcții și trepte
                  </h2>
                  <p className="mt-4 text-sm text-stone-600">Net standard pe trepte, în {grila.domeniu}.</p>
                  <TabelGrila grila={grila} meserie={numeMic} />
                  {grila.nota && <p className="mt-4 text-sm text-stone-600">{grila.nota}</p>}
                  <NotaSursa>
                    Sursă: {SURSA_GRILE.act}, {grila.anexa}, text consolidat pe{" "}
                    <a href={SURSA_GRILE.url} target="_blank" rel="noopener">
                      legislatie.just.ro
                    </a>
                    . Netul e calculat de noi din brut, în condiții standard (fără persoane în întreținere), cu cotele
                    din 2026. Grila se aplică personalului plătit din fonduri publice; în privat salariul se
                    negociază, iar grila publică nu stabilește salariul negociat.
                  </NotaSursa>
                </section>
              )}

              <section id="profil">
                <h2 className={TITLU_SECTIUNE}>
                  Ce face un {numeMic}
                </h2>
                <p className="mt-4 text-base leading-normal text-stone-600">
                  În statisticile INS, meseria intră la activitatea CAEN {sector.cheie}, {sector.denumire.toLocaleLowerCase("ro-RO")},
                  și în grupa de ocupații „{isco?.nume ?? 'ISCO-08'}”. Amândouă cuprind mai mulți oameni decât meseria, de aceea
                  cifrele lor sunt doar context.
                </p>
                <p className="mt-4 text-sm text-stone-600">
                  {meserie.cor ? <>Codul COR: <strong>{meserie.cor}</strong>, {corCatalogue.occupations[meserie.slug as keyof typeof corCatalogue.occupations]?.name}. Verifică dacă atribuțiile se potrivesc cu postul tău. </> : <>Meseria poate avea mai multe coduri COR; cel corect se alege după atribuțiile postului. </>}
                  Sursa: <a href={corCatalogue.source} className="underline">catalogul COR din aprilie 2024</a>.
                </p>
              </section>

              <section className={INAINTE_DE_SECTIUNE} id="piata">
                <h2 className={TITLU_SECTIUNE}>
                  Cum a evoluat sectorul în ultimele {LUNI_SERIE.length} luni
                </h2>
                <p className="mt-4 text-base leading-normal text-stone-600">
                  {variatie !== null ? (
                    <>
                      Într-un an, câștigul mediu net din CAEN {sector.cheie}{" "}
                      {variatie >= 0 ? "a crescut" : "a scăzut"} cu{" "}
                      <strong>{procent(Math.abs(variatie))}%</strong>. Sumele nu țin cont de inflație.
                    </>
                  ) : (
                    <>Sumele nu țin cont de inflație.</>
                  )}
                </p>
                <GraficSerie
                  luni={LUNI_SERIE}
                  valori={sector.net}
                  titlu={`Câștig salarial mediu net lunar, CAEN ${sector.cheie} — ${sector.denumire}. Sursa: INS, ${MATRICE_NET}.`}
                />
              </section>

              {isco && isco.varste.length > 0 && (
                <details className="mt-8"><summary className="min-h-11 cursor-pointer py-3 text-lg font-semibold">Venituri pe grupe de vârstă</summary>
                  <h2 className={TITLU_SECTIUNE}>
                    Vârsta și veniturile grupei ISCO
                  </h2>
                  <p className="mt-4 text-base leading-normal text-stone-600">
                    Datele sunt pentru toată grupa „{isco.nume}”, nu doar pentru această meserie, din ancheta INS
                    din octombrie {AN_ANCHETA}. Arată salariul de bază din contract și cât s-a câștigat de fapt, cu
                    sporuri, prime și ore suplimentare.
                  </p>
                  {/* Cifra explica o confuzie reala: omul isi vede salariul de
                      baza in contract, vede media de pe site mai mare si crede
                      ca cifra e gresita. La operatori, jumatate din castig vine
                      din afara incadrarii. */}
                  {pesteBaza !== null && (
                    <p className="mt-4 text-base leading-normal text-stone-600">
                      În această grupă, oamenii câștigă de fapt cu{" "}
                      <strong className="font-semibold text-stone-900">{procent(pesteBaza, 0)}% mai mult</strong> decât
                      salariul de bază din contract.
                    </p>
                  )}
                  <div className="my-6 overflow-x-auto">
                    <table className={`${TABEL_STANDARD} min-w-[30rem]`}>
                      <caption className="sr-only">
                        Salariu de bază și venit brut realizat pe grupe de vârstă, grupa {isco.nume}
                      </caption>
                      <thead>
                        <tr>
                          <th className="border-b border-stone-200 bg-antet px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                            Vârstă
                          </th>
                          <th className="border-b border-stone-200 bg-antet px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                            Salariu de bază
                          </th>
                          <th className="border-b border-stone-200 bg-antet px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                            Venit brut realizat
                          </th>
                          <th className="border-b border-stone-200 bg-antet px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
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
                    <p className="mt-4 rounded-md border border-stone-200 bg-surface p-4 text-sm text-stone-600 shadow-soft">
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
                </details>
              )}

              {judete.length > 0 && (
                <details className="mt-8"><summary className="min-h-11 cursor-pointer py-3 text-lg font-semibold">Date regionale INS</summary>
                  <h2 className={TITLU_SECTIUNE}>
                    Câștigul mediu brut lunar al sectorului pe județe — media {AN_JUDETE_SCURT}
                  </h2>
                  <p className="mt-4 text-base leading-normal text-stone-600">
                    Media salariului brut din sectorul „{etichetaSectorJudete}”, în fiecare județ, pe tot anul{" "}
                    {AN_JUDETE_SCURT}. În primul județ se câștigă de{" "}
                    <strong>
                      {(interval?.raport ?? judete[0].brut / judete[judete.length - 1].brut).toLocaleString("ro-RO", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}{" "}
                      ori
                    </strong>{" "}
                    mai mult decât în ultimul.
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
                  <p className="text-sm text-stone-600">
                    Cum stă fiecare județ pe toate activitățile:{" "}
                    <Link href="/salarii/judete" className="underline underline-offset-2">salariile pe județe</Link>.
                  </p>
                </details>
              )}

            </div>

            <aside id="oferta" className="min-w-0 lg:col-span-2">
              <div className="rounded-md border border-stone-200 bg-surface p-6 shadow-soft">
                <h2 className={TITLU_CARD}>Calculează-ți net-ul</h2>
                <p className="mt-2 text-sm text-stone-600">
                  Scrie brutul din oferta ta și vezi cât primești în mână.
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
                  <h2 className={TITLU_CARD}>Comparații</h2>
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
                  <h2 className={TITLU_CARD}>
                    Meserii apropiate de {numeMic}
                  </h2>
                  <div className="mt-3 grid gap-2">
                    {similare.map(({ alta, cifra }) => (
                      <LinkCard key={alta.slug} href={`/salarii/${alta.slug}`} titlu={alta.nume} detaliu={cifra} />
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
              href={INS_SURSA.url}
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
            . Netul standard este calculat de
            Salariile.ro cu regulile în vigoare din 1 iulie 2026 — vezi{" "}
            <Link href="/metodologie">metodologia</Link>. Fiecare reper salarial este citat separat în partea de sus a paginii. Valorile sunt repere la nivel de grupă și sector;
            oferta individuală variază în funcție de rol, experiență, angajator și localitate.
          </NotaSursa>
        </div>
      </div>

      <Faq items={faq} />
    </>
  );
}
