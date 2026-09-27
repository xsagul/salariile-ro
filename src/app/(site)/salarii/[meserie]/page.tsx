// src/app/(site)/salarii/[meserie]/page.tsx
// Pagina unei meserii. Server Component pur.
//
// Structura raspunde direct la intrebarea reala din cautare („cat se castiga
// ca X?"): netul observat de INS in sector este reperul principal, apoi vine
// netul orientativ al grupei de ocupatii. Brutul ramane context secundar.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { notFound } from "next/navigation";
import { Faq, SUB_TITLU, TITLU_CARD, TITLU_PAGINA, SPATIU_JOS, SPATIU_SUS } from "@/app/components/ui";
import { TabelGrila, lei } from "@/app/components/Salarii";
import {
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
import SalariuConcluzie, { concluzieMeserie } from '@/app/components/SalariuConcluzie';
import SalariuGrila, { netDeStart, trepteGrila } from '@/app/components/SalariuGrila';
import { descriereReper, grilaEducatie, reperMeserie } from '@/lib/repere-meserii';
import { textIndicator } from '@/lib/indicator-meserie';
import corCatalogue from '@/data/cor-meserii.json';
import { calculStandard } from '@/lib/fiscal';
import { personSchema } from "@/lib/person";
import { ogPage, twPage, MESERII_LAST_MODIFIED } from "@/lib/seo";
import { TABEL_IN_CARD } from "@/app/components/TabelArticol";

interface Props {
  params: Promise<{ meserie: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return MESERII.map((meserie) => ({ meserie: meserie.slug }));
}

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

  const c = concluzieMeserie(date.meserie.slug);
  if (c?.sursa === "platit" && c.platit) {
    return `${inceput}: ${lei(c.net)} lei net fix la stat; jumătate au între ${lei(c.interval![0])} și ${lei(c.interval![1])} lei. Din salariile a ${c.platit.institutii} instituții, pe județe.`;
  }
  if (c?.sursa === "oferit" && c.oferit) {
    return `${inceput}: ${lei(c.net)} lei net oferit la angajare, din ${c.oferit.anunturi} anunțuri verificate. Vezi cât plătește statul și ce declară angajatorii la ANOFM.`;
  }

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

  const c = concluzieMeserie(date.meserie.slug);
  const raspunsPrincipal = c?.sursa === "platit" && c.platit
    ? `La angajatorii publici, un ${de} ia în mână ${lei(c.net)} lei pe lună, salariul fix din mijloc; jumătate din posturi au între ${lei(c.interval![0])} și ${lei(c.interval![1])} lei.${c.platit.cuVariabil && c.platit.cuVariabil.net > c.net * 1.03 ? ` Cu ture și gărzi, ${lei(c.platit.cuVariabil.net)} lei.` : ""} Cifrele vin din salariile publicate de ${c.platit.institutii} instituții publice din ${c.platit.judete} județe, netul fiind calculat pentru o persoană fără persoane în întreținere.`
    : c?.sursa === "oferit" && c.oferit
    ? `La angajare se oferă unui ${de} în jur de ${lei(c.net)} lei net pe lună, mijlocul salariilor din ${c.oferit.anunturi} anunțuri verificate.`
    : candidata?.veche
    // Grila veche (2022) nu e salariul de azi, iar media INS a sectorului nu e a meseriei.
    ? `Salariul unui ${de} e stabilit prin lege, cu gradații de vechime, sporuri și, unde e cazul, indemnizație de hrană. Nu afișăm încă o cifră: tabelele din lege sunt la nivelul din 2022 și nu cuprind majorările date de atunci prin ordonanțe.`
    : descriereReper(date);
  const intrebari = [
    { q: `Cât câștigă un ${de} în România?`, a: raspunsPrincipal },
  ];
  if (debutant) {
    intrebari.push({
      q: `Cât câștigă un ${de} debutant?`,
      a: `La început de carieră, treapta „${debutant.eticheta}" înseamnă ${lei(debutant.net)}, calculat din salariul de bază brut prevăzut în grila legală, la gradația 0.${varf ? ` Cea mai bine plătită treaptă din grilă, „${varf.eticheta}", ajunge la ${lei(varf.net)}.` : ""} Peste aceste sume vin gradațiile de vechime și sporurile, care nu sunt incluse aici.`,
    });
  }
  // Întrebarea despre trepte doar unde există o grilă; altfel răspunsul era generic.
  if (trepte.length) intrebari.push(
    {
      q: `Care sunt treptele de salarizare pentru ${numeMic}?`,
      // Cu multe trepte (la învățământ sunt zeci), lista întreagă devenea un
      // paragraf cu zeci de cifre. Răspunsul dă capetele; tabelul are restul.
      a: trepte.length > 4
        ? `Grila legală are ${trepte.length} de trepte, de la ${lei(dupaSuma[0].net)} la ${lei(dupaSuma[dupaSuma.length - 1].net)}, înainte de vechime și sporuri. Toate sunt în tabelul de pe pagină.`
        : `Grila legală prevede ${trepte.length} trepte: ${trepte.map(t => `${t.eticheta.toLocaleLowerCase("ro-RO")} ${lei(t.net)}`).join("; ")}. Sumele sunt salariile de pornire, înainte de vechime și sporuri.`,
    }
  );
  intrebari.push(
    {
      q: `Cum compar o ofertă de angajare cu salariul unui ${de}?`,
      a: "Verifică salariul de bază brut, norma și orele, tichetele de masă, sporurile garantate și bonusurile variabile. Folosește calculatorul nostru de salariu ca să afli suma netă exactă a ofertei tale și compar-o cu salariul de mai sus.",
    },
  );
  return intrebari;
}

export default async function MeseriePage({ params }: Props) {
  const { meserie: slug } = await params;
  const meserie = getMeserie(slug);
  if (!meserie) notFound();

  const date = dateMeserieSauEroare(meserie);
  const { categorie } = date;
  const numeMic = meserie.nume.toLocaleLowerCase("ro-RO");
  // Grila legala, doar pentru meseriile bugetare. Cu `doarSectiune`, apare ca sectiune cu
  // domeniul ei, fara sa devina cifra paginii (vezi grile-publice.ts).
  const grila = grilaPublica(meserie.slug);
  const grilaDidactica = grilaEducatie(meserie.slug);
  const faq = faqPentru(date);

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

  // Cifra meseriilor apropiate: concluzia, unde există, ca să fie aceeași cifră ca pe pagina lor.
  const apropiate = meseriiInrudite(meserie).map((alta) => {
    const c = concluzieMeserie(alta.slug);
    const r = reperMeserie(dateMeserieSauEroare(alta));
    // Meseriile plătite după lege: cifra de început din grilă, ca în cardul paginii lor.
    const start = c ? null : netDeStart(alta.slug);
    // Grilele rămase la 2022 nu sunt salariul de azi, iar media INS a sectorului nu e a meseriei.
    if (!c && !start && grilaPublica(alta.slug)?.veche) return { alta, cifra: undefined };
    return { alta, cifra: c ? `${lei(c.net)} lei net` : start ? `de la ${lei(start)} lei net` : r.value ? textIndicator(r) : undefined };
  });
  const cor = meserie.cor ? corCatalogue.occupations[meserie.slug as keyof typeof corCatalogue.occupations] : undefined;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Refăcută pe 27 septembrie 2026 după modelul paginilor de zile lucrătoare: titlul, o
          frază, cifra cu cardul din dreapta, apoi doar ce e despre meserie. Contextul INS pe
          sector și pe grupa ISCO (evoluția CAEN, vârstele, județele sectorului, posturile
          vacante ale grupei) a ieșit: nu era despre meserie și cerea avertismente peste tot. */}
      <div className="bg-canvas">
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>
          <h1 className={TITLU_PAGINA}>Salariu {numeMic} 2026</h1>
          <p className={`${SUB_TITLU} max-w-3xl text-base leading-normal tracking-[-0.01em] text-stone-700`}>{meserie.ceFace}</p>

          <div className="md:grid md:grid-cols-5 md:gap-6">
            <div className="min-w-0 md:col-span-3">
              {/* Cu salariul-concluzie, primul ecran e o singură cifră cu proveniență. Fără ea,
                  pagina rămâne pe reperele de până acum. */}
              {concluzieMeserie(slug) ? (
                <SalariuConcluzie slug={slug} de={meserie.de} />
              ) : trepteGrila(slug) ? (
                // Meseriile plătite după lege: cifra din grilă, fără rândurile goale ale surselor
                // care nu se aplică („meserie plătită după grilă, nu prin ofertă”).
                <SalariuGrila slug={slug} de={meserie.de} />
              ) : grilaPublica(slug)?.veche ? (
                // Meseriile plătite după o grilă rămasă la nivelul din 2022 (armată, poliție,
                // magistrați...): nici grila veche, nici media INS a sectorului nu sunt salariul
                // lor (decizia proprietarului, 27 septembrie 2026). Până la sumele plătite azi,
                // primul ecran rămâne fără cifră.
                <p className="mt-6 text-sm text-stone-600" data-salary-kind="grila-legala-neactualizata">
                  Salariul se stabilește prin lege, pe grade și vechime, cu sporurile prevăzute de lege ·{" "}
                  <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">sursele</Link>
                </p>
              ) : (
                <>
                  <ReperSalariu date={date} />
                  <TrepteRapide date={date} />
                  <PiloniSalariu date={date} />
                  <TransparentaSalariu slug={slug} />
                </>
              )}

              {meserie.nota && (
                <p className="mt-4 rounded-md border border-stone-200 bg-surface p-4 text-sm text-stone-700 shadow-soft">
                  <strong className="font-semibold text-stone-900">De reținut:</strong> {meserie.nota}
                </p>
              )}

              {grilaDidactica.length > 0 && (
                <section className="mt-4 rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
                  <h2 className={TITLU_CARD}>Grad didactic, studii și vechime în învățământ</h2>
                  <p className="mt-1 text-xs text-stone-600">Net standard pe trepte didactice.</p>
                  <div className="mt-3 max-h-96 overflow-auto"><table className={`${TABEL_IN_CARD} min-w-[32rem]`}>
                    <caption className="sr-only">Grila didactică: funcție, studii, vechime și net standard</caption>
                    <thead><tr>{['Funcție și grad','Studii','Vechime în învățământ','Net lunar'].map(h=><th key={h} scope="col" className="border-b p-3 text-left">{h}</th>)}</tr></thead>
                    <tbody>{grilaDidactica.map((r,i)=><tr key={i}><th scope="row" className="border-b border-stone-100 p-3 text-left font-normal">{r.functie}</th><td className="p-3">{r.studii}</td><td className="p-3">{r.vechime}</td><td className="whitespace-nowrap p-3 font-semibold">{lei(calculStandard(r.iun2024)!.net)} lei</td></tr>)}</tbody>
                  </table></div>
                  <Link href="/calculator-salariu-invatamant" className="mt-4 inline-flex min-h-11 items-center underline underline-offset-4">Calculează salariul cu gradația și majorările tale</Link>
                </section>
              )}

              {grila && !grila.veche && (
                <section className="mt-4 rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
                  <h2 className={TITLU_CARD}>Grila pentru {numeMic}: funcții și trepte</h2>
                  <p className="mt-1 text-xs text-stone-600">Net standard pe trepte, în {grila.domeniu}.</p>
                  <TabelGrila grila={grila} meserie={numeMic} />
                  {grila.nota && <p className="mt-3 text-sm text-stone-600">{grila.nota}</p>}
                  <p className="mt-3 text-xs text-stone-600">
                    Sursă: {SURSA_GRILE.act}, {grila.anexa}, pe{" "}
                    <a href={SURSA_GRILE.url} target="_blank" rel="noopener" className="underline underline-offset-2">legislatie.just.ro</a>.
                    Netul e calculat de noi din brut, fără persoane în întreținere. Grila se aplică la stat; în privat salariul se negociază.
                  </p>
                </section>
              )}
            </div>

            {/* Cardul din dreapta pornește de la nivelul cifrei, ca la zile libere. */}
            <aside className="mt-8 min-w-0 md:col-span-2 md:mt-6 md:self-start">
              {apropiate.length > 0 && (
                <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6">
                  <h2 className={TITLU_CARD}>Meserii apropiate</h2>
                  <ul className="mt-3 divide-y divide-stone-100">
                    {apropiate.map(({ alta, cifra }) => (
                      <li key={alta.slug}>
                        <Link href={`/salarii/${alta.slug}`} className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm hover:text-stone-600">
                          <span className="font-medium text-stone-900 underline-offset-2 hover:underline">{alta.nume}</span>
                          {cifra && <span className="whitespace-nowrap tabular-nums text-stone-700">{cifra}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/salarii/domeniu/${categorie.slug}`} className="mt-3 inline-block text-sm font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">
                    Toate meseriile din {categorie.nume.toLocaleLowerCase("ro-RO")}
                  </Link>
                </div>
              )}
              <div className="mt-4 rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6">
                <h2 className={TITLU_CARD}>Ai o ofertă?</h2>
                <p className="mt-2 text-sm text-stone-600">Scrie brutul din ofertă și vezi cât primești în mână.</p>
                <Link
                  href="/"
                  className="mt-4 inline-flex min-h-11 items-center rounded border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
                >
                  Calculează netul
                </Link>
              </div>
            </aside>
          </div>

          {cor && (
            <p className="mt-8 text-xs text-stone-600">
              Cod COR: {meserie.cor}, {cor.name} ·{" "}
              <a href={corCatalogue.source} className="underline underline-offset-2">catalogul COR</a>
            </p>
          )}
        </div>
      </div>

      <Faq items={faq} />
    </>
  );
}
