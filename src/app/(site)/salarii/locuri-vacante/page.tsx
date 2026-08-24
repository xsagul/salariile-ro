// src/app/(site)/salarii/locuri-vacante/page.tsx
// Locuri de munca vacante pe grupe majore de ocupatii. Server Component pur.
//
// De ce exista: tot restul site-ului masoara cat se PLATESTE. Asta e singura
// pagina care masoara cat se CAUTA. Puse alaturi, cele doua raspund la
// intrebarea pe care si-o pune cineva care isi alege drumul: unde se plateste
// bine SI unde e nevoie de oameni.
//
// E si cea mai proaspata serie din tot setul — trimestriala, nu anuala — deci
// pagina se reactualizeaza singura la fiecare `npm run ins:tempo`.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import { CardCifra, NotaSursa, lei, procent, trimestruScurt } from "@/app/components/Salarii";
import {
  AN_OCUPATII,
  MATRICE_OCUPATII,
  MATRICE_RATE_VACANTE,
  MATRICE_VACANTE,
  PERIOADA_VACANTE,
  PERIOADE_VACANTE,
  grupaIsco,
  indexatLaZi,
  vacantePeGrupe,
  vacanteTotal,
  type GrupaIsco,
} from "@/lib/ins-date";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const AN_ANCHETA = AN_OCUPATII.replace("Anul ", "");
const TOTAL = vacanteTotal();
const GRUPE = vacantePeGrupe();
const PERIOADA = trimestruScurt(PERIOADA_VACANTE);

/** Vacantele langa salariul aceleiasi grupe. Cele doua serii au perioade
 *  diferite, iar tabelul o spune pe fiecare coloana. */
const RANDURI = GRUPE.map((v) => {
  const salariu = v.grupa === "total" ? null : grupaIsco(v.grupa as GrupaIsco);
  return {
    ...v,
    brutIndexat: salariu ? indexatLaZi(salariu.venitBrutTotal) : null,
  };
});

const celMaiCautat = [...GRUPE].sort((a, b) => (b.rata ?? 0) - (a.rata ?? 0))[0];
const celMaiMultePosturi = GRUPE[0];

const DESCRIERE = TOTAL
  ? `În ${PERIOADA} erau ${lei(TOTAL.posturi)} locuri de muncă vacante în România, o rată de ${TOTAL.rata?.toLocaleString("ro-RO", { maximumFractionDigits: 2 })}%. Vezi defalcarea pe grupe de ocupații, alături de salariul fiecăreia.`
  : "Locuri de muncă vacante în România, pe grupe majore de ocupații, din datele INS.";

export const metadata: Metadata = {
  title: { absolute: `Locuri de muncă vacante în România | Salariile.ro` },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/salarii/locuri-vacante" },
  openGraph: ogPage({
    title: "Locuri de muncă vacante în România",
    description: DESCRIERE,
    path: "/salarii/locuri-vacante",
  }),
  twitter: twPage({ title: "Locuri de muncă vacante în România", description: DESCRIERE }),
};

const FAQ = TOTAL
  ? [
      {
        q: "Câte locuri de muncă vacante sunt în România?",
        a: `În ${PERIOADA}, ultimul trimestru publicat de INS, erau ${lei(TOTAL.posturi)} locuri de muncă vacante în economie, adică o rată a locurilor vacante de ${TOTAL.rata?.toLocaleString("ro-RO", { maximumFractionDigits: 2 })}%. Rata arată ce pondere au posturile neocupate din totalul posturilor, ocupate și vacante la un loc.`,
      },
      {
        q: "În ce ocupații se caută cei mai mulți oameni?",
        a: `După numărul absolut de posturi, grupa „${celMaiMultePosturi.nume}" are cele mai multe locuri vacante: ${lei(celMaiMultePosturi.posturi)}. După rată, care corectează pentru mărimea grupei, cea mai mare cerere este în „${celMaiCautat.nume}", cu ${celMaiCautat.rata?.toLocaleString("ro-RO", { maximumFractionDigits: 2 })}%.`,
      },
      {
        q: "Ce înseamnă rata locurilor de muncă vacante?",
        a: "Este raportul dintre posturile vacante și totalul posturilor, exprimat în procente. O rată de 0,5% înseamnă că la fiecare 200 de posturi din economie, unul este neocupat și se caută cineva pentru el. Rata permite comparația între grupe de mărimi foarte diferite, ceea ce numărul absolut nu permite.",
      },
      {
        q: "Datele acoperă și posturile care nu sunt publicate ca anunț?",
        a: "Da. INS măsoară posturile vacante declarate de angajatori în ancheta trimestrială, indiferent dacă au fost sau nu anunțate public. De aceea cifra nu se compară direct cu numărul de anunțuri de pe site-urile de recrutare, care e o submulțime a ei.",
      },
      {
        q: "Cât de proaspete sunt cifrele?",
        a: `Seria este trimestrială și este cea mai recentă sursă de pe site — ultimul trimestru disponibil este ${PERIOADA}. Prin comparație, datele despre salariul pe grupe de ocupații vin din ancheta anuală din octombrie ${AN_ANCHETA}. De aceea cele două coloane din tabel au perioade diferite, declarate în antet.`,
      },
    ]
  : [];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Salarii pe meserii", item: "https://salariile.ro/salarii" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Locuri de muncă vacante",
          item: "https://salariile.ro/salarii/locuri-vacante",
        },
      ],
    },
    {
      "@type": "Article",
      headline: "Locuri de muncă vacante în România, pe grupe de ocupații",
      description: DESCRIERE,
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      mainEntityOfPage: "https://salariile.ro/salarii/locuri-vacante",
      dateModified: "2026-08-24",
    },
    ...(FAQ.length
      ? [
          {
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
        ]
      : []),
  ],
};

/** Evolutia pe ultimele trimestre, ca sminigrafic SVG randat pe server. */
function SerieTrimestre({ valori, etichete }: { valori: (number | null)[]; etichete: string[] }) {
  const puncte = valori.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v !== null);
  if (puncte.length < 2) return null;
  const maxim = Math.max(...puncte.map((p) => p.v));
  const minim = Math.min(...puncte.map((p) => p.v));
  const interval = maxim - minim || 1;
  const L = 640;
  const H = 160;
  const pas = L / (valori.length - 1);
  const cale = puncte
    .map((p, index) => `${index === 0 ? "M" : "L"} ${p.i * pas} ${H - ((p.v - minim) / interval) * (H - 30) - 15}`)
    .join(" ");

  return (
    <figure className="my-6">
      <svg
        viewBox={`0 0 ${L} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Locuri de muncă vacante, de la ${lei(puncte[0].v)} în ${etichete[puncte[0].i]} la ${lei(puncte[puncte.length - 1].v)} în ${etichete[puncte[puncte.length - 1].i]}.`}
      >
        <path d={cale} fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-900" />
        {puncte.map((p) => (
          <circle
            key={p.i}
            cx={p.i * pas}
            cy={H - ((p.v - minim) / interval) * (H - 30) - 15}
            r="3"
            className="fill-stone-900"
          />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-stone-500">
        <span>{trimestruScurt(etichete[0])}</span>
        <span>{trimestruScurt(etichete[etichete.length - 1])}</span>
      </div>
      <figcaption className="mt-2 text-xs leading-normal text-stone-600">
        Locuri de muncă vacante pe total economie, ultimele {etichete.length} trimestre. Sursa: INS, {MATRICE_VACANTE}.
      </figcaption>
    </figure>
  );
}

export default function LocuriVacantePage() {
  if (!TOTAL) {
    return (
      <div className="bg-canvas">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <H1>Locuri de muncă vacante în România</H1>
          <Lead>Datele lipsesc din setul INS curent. Pagina revine la următoarea actualizare.</Lead>
        </div>
      </div>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumb
            items={[
              { href: "/", label: "Acasă" },
              { href: "/salarii", label: "Salarii pe meserii" },
              { label: "Locuri de muncă vacante" },
            ]}
          />
          <H1>Locuri de muncă vacante în România</H1>
          <Lead>
            În {PERIOADA} erau <strong>{lei(TOTAL.posturi)} locuri de muncă vacante</strong> în economie, o rată de{" "}
            <strong>{TOTAL.rata?.toLocaleString("ro-RO", { maximumFractionDigits: 2 })}%</strong>. Restul site-ului
            măsoară cât se plătește; pagina asta măsoară cât se caută. Tabelul de mai jos le pune alături, pe aceleași
            grupe de ocupații.
          </Lead>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CardCifra
              accent
              eticheta={`Posturi vacante, ${PERIOADA}`}
              valoare={lei(TOTAL.posturi)}
              unitate=""
              nota={
                TOTAL.variatieAnuala !== null
                  ? `${TOTAL.variatieAnuala >= 0 ? "În creștere" : "În scădere"} cu ${procent(Math.abs(TOTAL.variatieAnuala), 0)}% față de același trimestru al anului trecut.`
                  : "Pe toată economia."
              }
            />
            <CardCifra
              eticheta="Rata locurilor vacante"
              valoare={TOTAL.rata?.toLocaleString("ro-RO", { maximumFractionDigits: 2 }) ?? "—"}
              unitate="%"
              nota="Ponderea posturilor neocupate din totalul posturilor."
            />
            <CardCifra
              eticheta="Cele mai multe posturi"
              valoare={lei(celMaiMultePosturi.posturi)}
              unitate=""
              nota={celMaiMultePosturi.nume}
            />
            <CardCifra
              eticheta="Cea mai mare rată"
              valoare={celMaiCautat.rata?.toLocaleString("ro-RO", { maximumFractionDigits: 2 }) ?? "—"}
              unitate="%"
              nota={celMaiCautat.nume}
            />
          </div>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Cum a evoluat cererea
            </h2>
            <SerieTrimestre valori={TOTAL.serie} etichete={PERIOADE_VACANTE} />
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
              Cerere și plată, pe aceleași grupe
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-normal text-stone-600">
              Coloanele vin din două anchete diferite ale INS, cu perioade diferite — vacantele sunt trimestriale și
              recente, salariul vine din ancheta anuală din octombrie {AN_ANCHETA}, adus la zi cu evoluția câștigului
              mediu pe economie. Nu sunt măsurate în același moment și nu trebuie citite ca o corelație; sunt două
              lucruri adevărate despre aceeași grupă, puse unul lângă altul.
            </p>
            <div className="my-6 overflow-x-auto">
              <table className="w-full min-w-[44rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft">
                <caption className="sr-only">
                  Locuri de muncă vacante și câștig brut pe grupe majore de ocupații
                </caption>
                <thead>
                  <tr>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                      Grupa de ocupații
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Posturi vacante, {PERIOADA}
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Rata
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Brut estimat, la zi
                    </th>
                    <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                      Față de anul trecut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RANDURI.map((rand) => (
                    <tr key={rand.grupa}>
                      <th scope="row" className="border-b border-stone-100 px-3 py-2 text-left font-medium text-stone-900">
                        {rand.nume}
                      </th>
                      <td className="border-b border-stone-100 px-3 py-2 text-right tabular-nums text-stone-900">
                        {lei(rand.posturi)}
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right tabular-nums text-stone-700">
                        {rand.rata !== null ? `${rand.rata.toLocaleString("ro-RO", { maximumFractionDigits: 2 })}%` : "—"}
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right tabular-nums text-stone-700">
                        {rand.brutIndexat !== null ? `${lei(rand.brutIndexat)} lei` : "—"}
                      </td>
                      <td className="border-b border-stone-100 px-3 py-2 text-right tabular-nums text-stone-700">
                        {rand.variatieAnuala !== null
                          ? `${rand.variatieAnuala >= 0 ? "+" : "−"}${procent(Math.abs(rand.variatieAnuala), 0)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="max-w-3xl text-sm leading-normal text-stone-600">
              Numărul absolut și rata spun lucruri diferite. O grupă mare poate avea multe posturi vacante și totuși o
              rată mică, pentru că are și foarte multe posturi ocupate. Rata e comparația corectă între grupe de mărimi
              diferite; numărul absolut spune unde sunt, efectiv, cele mai multe oportunități.
            </p>
          </section>

          <section className="mt-12 max-w-3xl">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Ce nu măsoară cifrele</h2>
            <ul className="mt-4 flex flex-col gap-2 text-base leading-normal text-stone-600">
              <li>
                <strong className="font-semibold text-stone-900">Nu sunt anunțuri de angajare.</strong> INS numără
                posturile vacante declarate de angajatori, publicate sau nu. Numărul de anunțuri de pe site-urile de
                recrutare este o submulțime a acestei cifre, nu același lucru.
              </li>
              <li>
                <strong className="font-semibold text-stone-900">Nu coboară sub grupa majoră.</strong> Nu există o
                cifră separată pentru „programator” sau „asistent medical”, ci pentru grupa din care fac parte. Aceeași
                limită ca la datele de salariu pe ocupații.
              </li>
              <li>
                <strong className="font-semibold text-stone-900">Nu spun cât de ușor se ocupă un post.</strong> Un
                număr mare de vacante poate însemna și cerere mare, și fluctuație mare de personal. Datele nu disting
                între cele două.
              </li>
            </ul>
            <NotaSursa>
              Sursa datelor: Institutul Național de Statistică, TEMPO-Online, matricele {MATRICE_VACANTE} (numărul
              locurilor de muncă vacante) și {MATRICE_RATE_VACANTE} (rata lor), pe macroregiuni și grupe majore de
              ocupații ISCO-08, serie trimestrială; ultimul trimestru disponibil {PERIOADA}. Coloana de salariu vine
              din {MATRICE_OCUPATII}, ancheta din octombrie {AN_ANCHETA}, indexată la luna curentă. Reutilizare conform
              licenței pentru o guvernare deschisă. Vezi <Link href="/metodologie">metodologia</Link>,{" "}
              <Link href="/salarii">salariile pe meserii</Link> și{" "}
              <Link href="/salarii/femei-barbati">diferența femei-bărbați</Link>.
            </NotaSursa>
          </section>
        </div>
      </div>

      <Faq items={FAQ} />
    </>
  );
}
