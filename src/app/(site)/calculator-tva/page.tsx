// app/calculator-tva/page.tsx
// Calculator de TVA: adaugă TVA la un preț sau o scoate dintr-un preț care o conține.
//
// De ce există pagina, măsurat pe 15 noiembrie 2026 în SE Ranking (România):
// „calculator tva” are 18.100 de căutări pe lună și „calcul tva” 5.700 — cea mai
// mare căutare de instrument fiscal pe care site-ul nu o acoperea. Pe prima
// pagină din Google stăteau un ERP, un site de cărți agricole, aplicații de
// telefon și un exemplu de curs universitar; niciun site de calculatoare fiscale.
//
// Trece testul „nu e pagină-ușă”: e alt calcul și alt public decât salariul
// (cine facturează sau verifică o factură), iar intenția e instrumentul. De
// aceea textul de sub el e scurt: formula, ce cotă se aplică și cine pune TVA.
//
// Cotele, plafonul și temeiul lor au un singur proprietar: `src/lib/tva.ts`.

import type { Metadata } from "next";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Repere, Section } from "@/app/components/ui";
import CalculatorTva from "@/app/components/CalculatorTva";
import { ReclamaSubCalculator } from "@/app/components/Reclama";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import {
  COTA_REDUSA_PROCENT,
  COTA_STANDARD_PROCENT,
  EXCEPTII_ALIMENTE,
  LA_COTA_REDUSA,
  PLAFON_SCUTIRE_LEI,
  URL_COD_FISCAL,
} from "@/lib/tva";

const S = COTA_STANDARD_PROCENT;
const R = COTA_REDUSA_PROCENT;
const lei = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
/** „1,21” din 21: cu cât se înmulțește prețul fără TVA. */
const factor = (procent: number) => (1 + procent / 100).toLocaleString("ro-RO", { minimumFractionDigits: 2 });
/** Cât la sută din prețul cu TVA e TVA: 21 din 121 înseamnă 17,36%. */
const dinTotal = (procent: number) =>
  ((procent / (100 + procent)) * 100).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CALE = "/calculator-tva";
const TITLU = `Calculator TVA 2026 - Adaugă sau scoate TVA ${S}% și ${R}%`;
const DESC = `Calculator de TVA cu cotele în vigoare în 2026, ${S}% și ${R}%: adaugi TVA la un preț sau o scoți din total și vezi prețul fără TVA, taxa și prețul cu TVA.`;

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: `https://salariile.ro${CALE}` },
  openGraph: ogPage({ title: TITLU, description: DESC, path: CALE }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

// Exemplul din a doua întrebare, socotit din cotă, nu scris de mână: din 121 de
// lei, cât e TVA și cât ar ieși dacă ai scădea greșit cota din total.
const TOTAL_EXEMPLU = 100 + S;
const SCAZUT_GRESIT = ((TOTAL_EXEMPLU * S) / 100).toLocaleString("ro-RO", { minimumFractionDigits: 2 });
const PREA_MULT = ((TOTAL_EXEMPLU * S) / 100 - S).toLocaleString("ro-RO", { minimumFractionDigits: 2 });

const FAQ = [
  {
    q: "Cum scot TVA dintr-un preț?",
    a: `Împarți prețul cu TVA la ${factor(S)} și obții prețul fără TVA. Diferența dintre cele două e TVA-ul. La cota de ${R}%, împarți la ${factor(R)}.`,
  },
  {
    q: `De ce nu pot scădea ${S}% din prețul cu TVA?`,
    a: `Fiindcă cei ${S}% se socotesc din prețul fără TVA, nu din total. Din ${TOTAL_EXEMPLU} de lei plătiți, TVA-ul e de ${S} de lei, adică ${dinTotal(S)}% din total. Dacă ai scădea ${S}% din ${TOTAL_EXEMPLU}, ai scoate ${SCAZUT_GRESIT} lei, cu ${PREA_MULT} lei prea mult.`,
  },
  {
    q: "Cât e TVA la mâncare și la restaurant?",
    a: `${R}%, atât la alimentele din magazin, cât și la restaurant sau catering. La ${S}% rămân băuturile alcoolice și răcoritoarele, oriunde le cumperi. În magazin, tot la ${S}% sunt alimentele cu zahăr adăugat care au cel puțin 10 g de zahăr la 100 g și suplimentele alimentare.`,
  },
  {
    q: "Trebuie să pun TVA pe facturile mele?",
    a: `Numai dacă ești înregistrat în scopuri de TVA. O firmă sau un PFA cu cifra de afaceri anuală de cel mult ${lei(PLAFON_SCUTIRE_LEI)} de lei poate aplica scutirea pentru întreprinderile mici și facturează fără TVA.`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Calculator TVA", item: `https://salariile.ro${CALE}` },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: `https://salariile.ro${CALE}`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
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

const REPERE = [
  ["Cota standard", `${S}%`],
  ["Cota redusă", `${R}%`],
  ["Plafonul de scutire", `${lei(PLAFON_SCUTIRE_LEI)} lei`],
] as const;

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator TVA" }]} />
        <H1>Calculator TVA 2026</H1>
        <Lead>
          Scrie suma și alege dacă adaugi TVA sau o scoți din preț. Vezi prețul fără TVA, taxa și prețul cu TVA, la
          cotele în vigoare.
        </Lead>
      </Hero>

      <CalculatorTva />
      <ReclamaSubCalculator />

      <Section
        companion={
          <CardCompanion
            titlu="Cotele de TVA în vigoare"
            nota={`La ${R}% sunt numai bunurile și serviciile numite în lege. Tot restul e la ${S}%.`}
          >
            <Repere randuri={REPERE} />
          </CardCompanion>
        }
      >
        <h2>Cum se calculează TVA</h2>
        <p>
          TVA-ul se socotește întotdeauna din prețul fără TVA. De aceea, ca să o scoți dintr-un preț care o conține,
          împarți, nu scazi:
        </p>
        <Formula
          eticheta="Formulele pentru adăugarea și scoaterea TVA"
          randuri={[
            `TVA           = preț fără TVA × ${S}%`,
            `Preț cu TVA   = preț fără TVA × ${factor(S)}`,
            `Preț fără TVA = preț cu TVA ÷ ${factor(S)}`,
            `TVA din total = preț cu TVA × ${S} ÷ ${100 + S}`,
          ]}
        />
        <p>
          La cota de {R}%, în loc de {factor(S)} pui {factor(R)}, iar în loc de {S} ÷ {100 + S} pui {R} ÷ {100 + R}.
          Greșeala cea mai des întâlnită e să scazi {S}% din prețul cu TVA: scoți prea mult, fiindcă {S}% din total e
          mai mult decât TVA-ul din el.
        </p>

        <h2>Ce cotă se aplică</h2>
        <p>
          Cota standard, de {S}%, e regula. Cota redusă, de {R}%, se aplică numai la ce numește legea, între altele:
        </p>
        <ul>
          {LA_COTA_REDUSA.map((ce) => (
            <li key={ce}>{ce}</li>
          ))}
        </ul>
        <p>
          La {S}% rămân {EXCEPTII_ALIMENTE}. Dacă ai în față o factură mai veche, alege „Altă cotă” și scrie cota de pe
          ea.
        </p>

        <h2>Cine pune TVA pe factură</h2>
        <p>
          Numai firmele și PFA-urile înregistrate în scopuri de TVA. Cine are cifra de afaceri anuală de cel mult{" "}
          {lei(PLAFON_SCUTIRE_LEI)} de lei poate aplica scutirea pentru întreprinderile mici: facturează fără TVA, dar
          nici nu își scade TVA-ul din ce cumpără.
        </p>
        <p className="source-note">
          Sursa:{" "}
          <a href={URL_COD_FISCAL} target="_blank" rel="noopener">
            Codul fiscal, art. 291 și 310
          </a>
          .
        </p>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/calculator-pfa", label: "Calculator taxe PFA", descriere: "Impozit, CAS și CASS, comparat cu SRL." },
          { href: "/noutati/pfa-sau-srl-2026", label: "PFA sau SRL în 2026?", descriere: "Cât rămâne în mână la fiecare formă." },
          { href: "/", label: "Calculator salariu net", descriere: "Brut în net pentru orice salariu." },
          { href: "/smartbill", label: "SmartBill Conta", descriere: "Prețuri, salarizare, D112 și planurile SmartBill Conta." },
          { href: "/saga", label: "SAGA C și SAGA WEB", descriere: "Contabilitate, salarii, D112 și licențiere." },
          { href: "/noutati", label: "Noutăți fiscale", descriere: "Ce s-a schimbat la taxe și la salarii." },
        ]}
      />
    </>
  );
}
