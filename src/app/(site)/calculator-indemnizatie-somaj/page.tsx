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
import { Breadcrumb, CardCompanion, Faq, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import CalculatorSomaj from "@/app/components/CalculatorSomaj";
import { COTE, ISR, ISR_AN, SURSA_ISR, TEMEI, URL_LEGE, calculeazaSomaj } from "@/lib/somaj";

const TITLU = "Calculator indemnizație șomaj 2026: cât primești și cât timp";
const DESC =
  "Calculează ajutorul de șomaj în 2026: partea fixă din indicatorul social de referință, cota pe stagiul de cotizare, durata de 6–12 luni și cât rămâne după CASS.";

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
    a: `Pornește de la ${fmt(ISR)} lei pe lună — valoarea integrală a indicatorului social de referință — pentru oricine are cel puțin un an de stagiu de cotizare. Peste 3 ani de stagiu se adaugă un procent din media salariului brut pe ultimele 12 luni: 3%, 5%, 7% sau 10%, după vechime. La ${fmt(5000)} de lei brut și 7 ani de stagiu, indemnizația este ${fmt(EX_MEDIU.brut)} lei brut, adică ${fmt(EX_MEDIU.net)} lei după reținerea CASS.`,
  },
  {
    q: "Cât e șomajul în România, ca sumă minimă?",
    a: `Minimul unui ajutor de șomaj acordat pe stagiu de cotizare este ${fmt(ISR)} lei brut pe lună, adică ${fmt(EX_MIC.net)} lei după CASS — atât primește cineva cu între unu și trei ani de vechime, la care nu se adaugă nicio cotă. Sub un an de stagiu nu se acordă nimic pe acest temei. Cea mai mică sumă din sistem este cea a absolventului: ${fmt(EX_ABS.brut)} lei brut, jumătate din indicatorul social de referință.`,
  },
  {
    q: "Partea fixă este 75% din ISR sau ISR întreg?",
    a: `Este ISR-ul întreg, ${fmt(ISR)} lei. Procentul de 75% a fost eliminat prin Legea nr. 273 din 29 septembrie 2022, în vigoare de la 3 octombrie 2022, care a modificat art. 39 alin. (2) lit. a) din Legea 76/2002. Calculatoarele care încă folosesc 75% dau un rezultat mai mic cu ${fmt(Math.round(ISR * 0.25))} de lei pe lună doar pe partea fixă.`,
  },
  {
    q: "Cât timp se primește indemnizația de șomaj?",
    a: "Șase luni la un stagiu de cotizare de cel puțin un an, nouă luni la cel puțin cinci ani și douăsprezece luni la un stagiu mai mare de zece ani, conform art. 39 alin. (1). Atenție la exact zece ani: durata rămâne de nouă luni, pentru că legea cere un stagiu mai mare de 10 ani, dar cota variabilă urcă deja la 7%, unde legea cere doar un stagiu de cel puțin 10 ani. Pragurile sunt diferite, iar diferența este intenționată.",
  },
  {
    q: "Se rețin taxe din indemnizația de șomaj?",
    a: `Se reține doar CASS, 10%, pentru că indemnizația de șomaj este în baza contribuției de sănătate — ${TEMEI.cass}. Nu se reține CAS: contribuția la pensie o plătește Agenția Națională pentru Ocuparea Forței de Muncă din bugetul asigurărilor pentru șomaj (${TEMEI.cas}), deci stagiul de pensie curge mai departe fără să scadă suma primită. Impozit pe venit nu se aplică.`,
  },
  {
    q: "Ce primesc dacă am sub un an de stagiu de cotizare?",
    a: "Pe temeiul art. 39 nu se deschide dreptul la indemnizație. Excepția este situația de absolvent al unei instituții de învățământ, care are temei separat, art. 40 alin. (1): o sumă fixă egală cu 50% din ISR, adică " + fmt(EX_ABS.brut) + " lei pe lună, timp de 6 luni, o singură dată pentru fiecare formă de învățământ absolvită.",
  },
  {
    q: "Cum se calculează media veniturilor din ultimele 12 luni?",
    a: "Este media veniturilor care au constituit baza de calcul al contribuției de asigurări pentru șomaj, pe ultimele 12 luni în care s-a realizat stagiu de cotizare — practic, media salariului brut. Contează doar dacă ai peste 3 ani de stagiu: sub acest prag nu există cotă, iar indemnizația este exact partea fixă.",
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
      name: "Salariile.ro",
      url: "https://salariile.ro",
      founder: { "@id": "https://salariile.ro/#person" },
    },
    personSchema,
  ],
};

const REPERE = [
  [`Indicator social de referință ${ISR_AN}`, `${fmt(ISR)} lei`],
  ["Partea fixă", "ISR integral"],
  ["Cote pe stagiu", "3% · 5% · 7% · 10%"],
  ["Durata", "6, 9 sau 12 luni"],
  ["Absolvenți", `${fmt(EX_ABS.brut)} lei, 6 luni`],
  ["Reținere", "CASS 10%"],
  ["CAS", "plătit de ANOFM"],
] as const;

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator indemnizație șomaj" }]} />
        <H1>Calculator indemnizație șomaj 2026</H1>
        <Lead>
          Alege-ți stagiul de cotizare și media salariului brut. Vezi cât primești pe lună, câte
          luni și cât rămâne după reținerea CASS — fiecare linie cu articolul din lege.
        </Lead>
      </Hero>

      <CalculatorSomaj />

      <Section
        companion={
          <CardCompanion
            titlu={`Repere · Legea 76/2002`}
            nota={`Indicatorul social de referință este menținut pentru ${ISR_AN}. ${SURSA_ISR.nota}`}
          >
            <Repere randuri={REPERE} />
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se calculează ajutorul de șomaj</h2>
          <p>
            Indemnizația are două componente, iar a doua apare abia după trei ani de stagiu de
            cotizare:
          </p>
          <ol>
            <li>
              <strong>Partea fixă</strong> — valoarea integrală a indicatorului social de referință,{" "}
              {fmt(ISR)} lei în {ISR_AN}. Se cuvine oricui are cel puțin un an de stagiu de cotizare
              ({TEMEI.parteFixa}).
            </li>
            <li>
              <strong>Partea variabilă</strong> — un procent din media veniturilor brute pe ultimele
              12 luni în care s-a realizat stagiu: {COTE.slice().reverse().map((c) => `${Math.round(c.cota * 100)}% de la ${c.minAni} ani`).join(", ")} ({TEMEI.cote}).
            </li>
          </ol>
          <p>
            La un stagiu de doi ani și un salariu brut de 5.000 de lei, indemnizația este{" "}
            {fmt(EX_MIC.brut)} lei pe lună — doar partea fixă, pentru că sub trei ani nu există
            cotă. La șapte ani de stagiu și același salariu urcă la {fmt(EX_MEDIU.brut)} lei, iar la
            peste douăzeci de ani și 8.000 de lei brut ajunge la {fmt(EX_MARE.brut)} lei.
          </p>

          <h2>Greșeala de 75% pe care o fac calculatoarele</h2>
          <p>
            Până în octombrie 2022, partea fixă era 75% din indicatorul social de referință. Legea
            nr. 273 din 29 septembrie 2022 a modificat art. 39 alin. (2) lit. a) și a înlocuit
            procentul cu valoarea integrală. Diferența este de {fmt(Math.round(ISR * 0.25))} de lei
            pe lună, iar pe o perioadă de douăsprezece luni înseamnă{" "}
            {fmt(Math.round(ISR * 0.25 * 12))} de lei.
          </p>
          <p>
            Verificat pe 9 septembrie 2026: două dintre site-urile care apar pe prima pagină la
            „calculator indemnizație șomaj" folosesc încă formula veche.
          </p>

          <h2>Ce se reține și ce nu</h2>
          <p>
            Din indemnizație se reține <strong>doar CASS, 10%</strong>. Indemnizațiile de șomaj
            acordate potrivit Legii nr. 76/2002 sunt enumerate expres în baza contribuției de
            sănătate ({TEMEI.cass}).
          </p>
          <p>
            <strong>CAS nu se reține.</strong> Contribuția la pensie pentru perioada de șomaj o
            plătește Agenția Națională pentru Ocuparea Forței de Muncă, prin agențiile județene,
            din bugetul asigurărilor pentru șomaj ({TEMEI.cas}). Perioada contează ca stagiu de
            pensie, iar suma primită nu scade din cauza ei. Impozit pe venit nu se aplică:
            indemnizația nu este venit salarial și nu apare între veniturile impozabile.
          </p>
          <p>
            Temeiul complet:{" "}
            <a href={URL_LEGE} target="_blank" rel="noopener">
              Legea nr. 76/2002, art. 39, 40 și 43
            </a>
            .
          </p>

          <h2>Ce nu acoperă calculatorul</h2>
          <p>
            Condițiile de eligibilitate — încetarea raporturilor de muncă din motive neimputabile,
            înregistrarea la agenția județeană, obligațiile lunare de la art. 41 — nu se pot deduce
            dintr-un formular. Nici situațiile speciale: fracțiunile de lună se calculează
            proporțional cu zilele calendaristice (art. 43 alin. (2)), iar plata încetează la
            angajare sau la depășirea unor praguri de venit din activități autorizate (art. 44).
            Cifra de aici este cuantumul stabilit potrivit legii, nu o confirmare a dreptului.
          </p>
        </Prose>
      </Section>

      <Faq
        items={FAQ}
        companion={
          <CardCompanion
            titlu="Pragurile care schimbă rezultatul"
            nota="La exact 10 ani durata rămâne 9 luni, dar cota urcă la 7% — legea folosește praguri diferite pentru cele două."
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
