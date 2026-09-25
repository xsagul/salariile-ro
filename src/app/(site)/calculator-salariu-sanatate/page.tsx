// app/calculator-salariu-sanatate/page.tsx
// Calculator salariu sănătate — Legea 153/2017, Anexa nr. II.
//
// De ce pagina asta există, măsurat pe 9 septembrie 2026:
//
//   1. Intenția de unealtă nu declanșează AI Overview, intenția informațională
//      da. Verificat pe SERP-uri reale: „calculator salariu net" și „calculator
//      salariu brut" primesc zece linkuri simple, în timp ce „salariu asistent
//      medical" primește AI Overview care citează paylab. Clickul mai există
//      doar pe partea de unealtă.
//   2. Pe „calculator salariu sanatate" și „calcul salariu sanatate" stăteam pe
//      pozițiile 30,2 și 26,2 — adică nicăieri.
//   3. Tiparul e dovedit: după ce a apărut pagina de învățământ, „calculator
//      salarii invatamant" a trecut de la 1 la 41 de clickuri pe săptămână.
//
// Testul pe care pagina trebuie să-l treacă, ca să nu fie pagină-ușă: omul NU
// își știe brutul. Un asistent medical știe „principal, postliceal, 15 ani
// vechime"; brutul vine din grilă, iar peste el se aplică gradația și, sub un
// plafon, indemnizația de hrană. Un calculator sectorial pentru construcții sau
// IT ar pica testul — acolo calculul e identic cu cel standard din 2025.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Prose, Section } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import CalculatorSanatate from "@/app/components/CalculatorSanatate";
import { MESERII_SANATATE } from "@/lib/sanatate";
import { SURSA_GRILE } from "@/lib/grile-publice";
import { INDEMNIZATIE_HRANA, PLAFON_HRANA_NET } from "@/lib/lege153";

const TITLU = "Calculator Salarii Sănătate 2026 - Vezi net și grilă";
const DESC =
  "Calculează salariul din sistemul sanitar public în 2026, pe grila din Legea 153/2017: salariu de bază, gradația de vechime, indemnizația de hrană și netul.";

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: "https://salariile.ro/calculator-salariu-sanatate" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/calculator-salariu-sanatate" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

const FAQ = [
  {
    q: "Cât câștigă un asistent medical în 2026?",
    a: `Un asistent debutant cu studii postliceale pornește de la ${fmt(
      MESERII_SANATATE.find((m) => m.slug === "asistent-medical")?.trepte[0]?.brut ?? 0,
    )} lei brut în grilă. Salariul crește cu treapta, de la debutant la principal, și cu vechimea în muncă. Cât iei în mână pentru situația ta afli din calculatorul de sus.`,
  },
  {
    q: "Cum se calculează gradația de vechime?",
    a: "Sunt cinci trepte, după anii de muncă, toți, nu doar cei din sănătate. Fiecare procent se aplică peste salariul deja crescut de treapta dinainte, așa că la ultima gradație salariul e cu 24,52% peste suma din grilă.",
  },
  {
    q: "Sunt incluse gărzile și sporurile?",
    a: "Nu. Sporurile pentru condiții grele depind de locul de muncă și diferă între două spitale pentru aceeași funcție, iar gărzile și orele de noapte depind de graficul lunii. O cifră care le-ar ghici ar ieși mai mare, dar falsă.",
  },
  {
    q: "Sumele din grilă sunt brute sau nete?",
    a: "Brute, și reprezintă salariul de pornire, înainte de vechime și de orice spor. Calculatorul le transformă în net.",
  },
  {
    q: "Se schimbă ceva cu noua lege a salarizării?",
    a: "Nu până nu apare în Monitorul Oficial. Proiectul s-a schimbat de mai multe ori, iar personalul sanitar e plătit azi după grila în vigoare. Actualizăm calculatorul în ziua publicării.",
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
          name: "Calculator salariu sănătate",
          item: "https://salariile.ro/calculator-salariu-sanatate",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: "https://salariile.ro/calculator-salariu-sanatate",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator salariu sănătate" }]} />
        <H1>Calculator salariu sănătate 2026</H1>
        <Lead>
          Alegi meseria, treapta și vechimea, iar calculatorul îți arată cât primești în mână, după grila în
          vigoare.
        </Lead>
      </Hero>

      <CalculatorSanatate meserii={MESERII_SANATATE} />

      <Section
        companion={
          <CardCompanion titlu="Ce nu intră în calcul">
            <p className="text-sm text-stone-600">
              Sporurile pentru condiții grele, gărzile și orele de noapte. Primele depind de locul de muncă și diferă
              între două spitale pentru aceeași funcție, celelalte de graficul fiecărei luni.
            </p>
            <p className="mt-3 text-sm text-stone-600">
              Nici funcțiile de conducere nu sunt aici: au tabele separate, după mărimea spitalului.
            </p>
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se calculează salariul în sănătate</h2>
          <p>
            Pornește de la suma din grilă pentru meseria și treapta ta, crește cu vechimea, primește peste ea
            indemnizațiile legii, iar din brutul care iese se scad taxele obișnuite.
          </p>
          <Formula
            eticheta="Formula salariului în sănătate"
            randuri={[
              "Salariu de bază = suma din grilă × (1 + gradația)",
              "Brut            = salariu de bază + hrană + doctorat",
              "Net             = brut − CAS − CASS − impozit",
            ]}
          />
          <p>
            <strong>Suma din grilă</strong> o dau meseria și treapta, de la debutant la principal.{" "}
            <strong>Gradația</strong> vine din anii de muncă, toți, nu doar cei din sănătate.{" "}
            <strong>Doctoratul</strong> adaugă o sumă fixă, dacă ai titlul și îl folosești în activitate. Taxele se
            calculează ca la <Link href="/">orice salariu</Link>.
          </p>

          <h2>De ce un medic nu primește bani de hrană</h2>
          <p>
            Indemnizația de hrană, {fmt(INDEMNIZATIE_HRANA)} de lei pe lună, se dă doar celor care câștigă cel mult{" "}
            {fmt(PLAFON_HRANA_NET)} de lei net. Un asistent sau un infirmier o primesc. Un medic specialist sau primar
            trece de plafon și o pierde.
          </p>
          <p>
            În învățământ, plafonul nu se atinge niciodată, așa că orice profesor o primește. În sănătate, calculatorul
            îți spune când ai trecut de el, ca să nu cauți degeaba rândul lipsă.
          </p>
        </Prose>
      </Section>

      <Faq
        items={FAQ}
        companion={
          <CardCompanion titlu="Sursa grilei">
            <p className="text-sm text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2">
              <a href={SURSA_GRILE.url} target="_blank" rel="noopener">Legea-cadru 153/2017</a>, anexa II, în forma
              consolidată la {new Date(SURSA_GRILE.dataExtragerii).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}.
              Calculatorul acoperă {MESERII_SANATATE.length} de meserii din sistemul sanitar public.
            </p>
          </CardCompanion>
        }
      />

      <PaginiConexe
        linkuri={[
          { href: "/salarii/asistent-medical", label: "Salariu asistent medical", descriere: "Grila și reperele pentru asistenți." },
          { href: "/salarii/medic", label: "Salariu medic", descriere: "De la rezident la medic primar." },
          { href: "/salarii/medic-rezident", label: "Salariu medic rezident", descriere: "Treptele pe ani de rezidențiat." },
          { href: "/noutati/legea-salarizarii-2026", label: "Legea salarizării 2026 a picat", descriere: "De ce grila în vigoare rămâne Legea 153/2017." },
          { href: "/salarii/domeniu/medical", label: "Salarii în sănătate", descriere: "Cifrele INS pentru sectorul sanitar." },
          { href: "/", label: "Calculator salariu net", descriere: "Brut în net pentru orice salariu." },
        ]}
      />
    </>
  );
}
