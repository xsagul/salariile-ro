// app/calculator-indemnizatie-somaj/page.tsx
// Indemnizația de șomaj — Legea nr. 76/2002.
//
// De ce pagina asta există, măsurat pe 9 septembrie 2026 în SE Ranking:
// clusterul de șomaj adună ~38.000 de căutări în grupul urmărit, iar dintre
// concurenții comparați un singur site — calculator-salarii.ro — îl acoperă,
// pe pozițiile 1–15. paylab, undelucram și noi lipseam complet. „somaj" singur
// are 6.600 de căutări lunar.
//
// Trece testul „nu e pagină-ușă": indemnizația se calculează DIN salariu, iar
// omul își știe salariul și vechimea, dar nu poate face calculul — are nevoie
// de ISR, de pragurile de durată și de cotele pe stagiu.
//
// Motivul pentru care a meritat citită legea, nu concurența: două site-uri de
// pe prima pagină scriu că partea fixă e „75% din ISR". Este formula dinainte
// de 3 octombrie 2022, când Legea nr. 273/2022 a înlocuit procentul cu valoarea
// integrală a indicatorului. Diferența, la un stagiu mic, e de 165 de lei pe
// lună dintr-o indemnizație de 660.

import type { Metadata } from "next";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import CalculatorSomaj from "@/app/components/CalculatorSomaj";
import { ISR, SURSA_ISR, URL_LEGE, calculeazaSomaj } from "@/lib/somaj";

const TITLU = "Calculator Ajutor Șomaj 2026 - Cât primești și cât timp";
const DESC =
  "Calculează ajutorul de șomaj în 2026: partea fixă din indicatorul social de referință, cota pe stagiul de cotizare, durata de 6–12 luni și netul după CASS.";

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: "https://salariile.ro/calculator-indemnizatie-somaj" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/calculator-indemnizatie-somaj" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

// Exemple calculate, nu scrise de mână — dacă ISR-ul se schimbă, textul urmează.
const EX_MIC = calculeazaSomaj({ aniStagiu: 2, mediaBruta: 5000 })!;
const EX_MEDIU = calculeazaSomaj({ aniStagiu: 7, mediaBruta: 5000 })!;
const EX_MARE = calculeazaSomaj({ aniStagiu: 25, mediaBruta: 8000 })!;
const EX_ABS = calculeazaSomaj({ aniStagiu: 0, mediaBruta: 0, absolvent: true })!;

const FAQ = [
  {
    q: "Cât este ajutorul de șomaj în 2026?",
    a: `Cel puțin ${fmt(ISR)} lei brut pe lună, dacă ai minimum un an lucrat cu contribuții. După trei ani se adaugă un procent din salariul tău brut mediu. De exemplu, cu 7 ani de stagiu și ${fmt(5000)} de lei brut, primești ${fmt(EX_MEDIU.net)} lei în mână.`,
  },
  {
    q: "Care e cel mai mic ajutor de șomaj?",
    a: `Pentru cine a lucrat între unu și trei ani, ${fmt(ISR)} lei brut, adică ${fmt(EX_MIC.net)} lei în mână. Absolvenții fără stagiu primesc jumătate: ${fmt(EX_ABS.brut)} lei.`,
  },
  {
    q: "Partea fixă e 75% din indicatorul social sau întreg?",
    a: `Întreg, ${fmt(ISR)} lei. Procentul de 75% a fost eliminat în octombrie 2022. Dacă dai peste un calcul cu 75%, e după regula veche.`,
  },
  {
    q: "Ce primesc dacă am lucrat mai puțin de un an?",
    a: `Nu ai dreptul la ajutorul de șomaj obișnuit. Excepție fac absolvenții, care primesc ${fmt(EX_ABS.brut)} lei pe lună, timp de 6 luni, o singură dată pentru fiecare școală sau facultate terminată.`,
  },
  {
    q: "Ce salariu se ia în calcul?",
    a: "Media salariului brut din ultimele 12 luni lucrate. Contează doar dacă ai peste trei ani de stagiu. Sub acest prag primești exact partea fixă, oricât ai fi câștigat.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Calculator indemnizație șomaj",
          item: "https://salariile.ro/calculator-indemnizatie-somaj",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: "https://salariile.ro/calculator-indemnizatie-somaj",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "RON" },
      description: DESC,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "Organization",
      "@id": "https://salariile.ro/#organization",
      name: "Salariile",
      url: "https://salariile.ro",
      founder: { "@id": "https://salariile.ro/#person" },
    },
    personSchema,
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator indemnizație șomaj" }]} />
        <H1>Calculator indemnizație șomaj 2026</H1>
        <Lead>
          Alege câți ani ai lucrat și salariul brut mediu, și vezi cât primești pe lună și câte luni.
        </Lead>
      </Hero>

      <CalculatorSomaj />

      <Section
        companion={
          <CardCompanion titlu="Ce se reține din ajutor">
            <p className="text-sm text-stone-600">
              Doar <strong className="font-semibold text-stone-900">10% pentru sănătate</strong>. Nu plătești impozit.
            </p>
            <p className="mt-3 text-sm text-stone-600">
              Contribuția la pensie o plătește agenția de ocupare, nu tu. Lunile de șomaj se socotesc la pensie, fără să
              scadă suma primită.
            </p>
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se calculează ajutorul de șomaj</h2>
          <p>
            Are o parte fixă, aceeași pentru toți, și o parte care crește cu anii lucrați și cu salariul. A doua apare
            abia după trei ani de stagiu.
          </p>
          <Formula
            eticheta="Formula ajutorului de șomaj"
            randuri={[
              `Ajutor = ${fmt(ISR)} lei + cotă × salariul brut mediu`,
              "Cotă   = 3% după 3 ani | 5% după 5 | 7% după 10 | 10% după 20",
              "Net    = ajutor − 10% sănătate",
              "Durată = 6 luni | 9 după 5 ani | 12 peste 10 ani",
            ]}
          />
          <p>
            Cei {fmt(ISR)} lei sunt indicatorul social de referință, o sumă fixată de stat. Salariul brut mediu e media
            din ultimele 12 luni lucrate. Cu 7 ani de stagiu și {fmt(5000)} de lei brut, ajutorul e de{" "}
            {fmt(EX_MEDIU.brut)} lei. Cu 25 de ani și {fmt(8000)} de lei, urcă la {fmt(EX_MARE.brut)} lei.
          </p>
          <p>
            Dacă dai peste calcule în care partea fixă e 75% din indicator, sunt după regula veche. Din octombrie 2022,
            partea fixă e indicatorul întreg.
          </p>

          <h2>Ce nu verifică un calculator</h2>
          <p>
            Dacă ai dreptul la ajutor: contractul trebuie să se fi încheiat fără vina ta, iar tu trebuie să te
            înscrii la agenția de ocupare și să-ți îndeplinești obligațiile lunare. Plata se oprește când te angajezi.
            Cifra de aici e suma prevăzută de lege, nu confirmarea că o primești.
          </p>
          <p className="source-note">
            Sursa:{" "}
            <a href={URL_LEGE} target="_blank" rel="noopener">
              Legea nr. 76/2002, art. 39, 40 și 43
            </a>
            . {SURSA_ISR.nota}
          </p>
        </Prose>
      </Section>

      <Faq
        items={FAQ}
        companion={
          <CardCompanion
            titlu="Pragurile care schimbă suma"
            nota="La exact 10 ani, durata rămâne 9 luni, dar cota urcă deja la 7%. Legea folosește praguri diferite pentru cele două."
          >
            <Repere
              randuri={[
                ["1 an", "6 luni, fără cotă"],
                ["3 ani", "apare cota de 3%"],
                ["5 ani", "9 luni, cotă 5%"],
                ["10 ani", "cotă 7%"],
                ["peste 10 ani", "12 luni"],
                ["20 de ani", "cotă 10%"],
              ]}
            />
          </CardCompanion>
        }
      />

      <PaginiConexe
        linkuri={[
          { href: "/", label: "Calculator salariu net", descriere: "Brut în net pentru orice salariu." },
          { href: "/salariu-minim", label: "Salariul minim 2026", descriere: "Reperul de la care pornesc contribuțiile." },
          { href: "/calculator-ore-suplimentare", label: "Calculator ore suplimentare", descriere: "Sporuri de 75%, noapte și sărbători." },
          { href: "/fluturas-salariu", label: "Generator de fluturaș", descriere: "Vezi defalcarea salariului, ca pe hârtie." },
          { href: "/salariu-mediu", label: "Salariul mediu pe economie", descriere: "Cifrele INS, actualizate lunar." },
          { href: "/calculator-pfa", label: "Calculator taxe PFA", descriere: "Contribuții pentru activități independente." },
        ]}
      />
    </>
  );
}
