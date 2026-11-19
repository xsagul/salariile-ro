import type { Metadata } from "next";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import CalculatorCrestereCopil from "@/app/components/CalculatorCrestereCopil";
import { ReclamaSubCalculator } from "@/app/components/Reclama";
import {
  LUNI_CELALALT_PARINTE,
  MAXIM_ICC_BRUT,
  MINIM_ICC_BRUT,
  STIMULENT_DUPA_6_LUNI,
  STIMULENT_SUB_6_LUNI,
  URL_OUG_111,
  calculeazaCrestereCopil,
} from "@/lib/crestere-copil";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const TITLU = "Calculator Indemnizație Creștere Copil 2026 | Salariile";
const DESC =
  "Calculează indemnizația de creștere a copilului în 2026: 85% din media netă pe 12 luni, minim 1.651 lei, maxim 8.500 lei, CASS 10%, gemeni și stimulent.";

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: "https://salariile.ro/calculator-indemnizatie-crestere-copil" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/calculator-indemnizatie-crestere-copil" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

const EX_MIN = calculeazaCrestereCopil({ mediaNeta12Luni: 1500 })!;
const EX_MED = calculeazaCrestereCopil({ mediaNeta12Luni: 6000 })!;
const EX_MAX = calculeazaCrestereCopil({ mediaNeta12Luni: 12000 })!;

const FAQ = [
  {
    q: "Cum se calculează indemnizația de creștere a copilului în 2026?",
    a: `Indemnizația brută este 85% din media veniturilor nete realizate în ultimele 12 luni eligibile din ultimii 2 ani anteriori nașterii, dar nu mai puțin de ${fmt(MINIM_ICC_BRUT)} lei și nu mai mult de ${fmt(MAXIM_ICC_BRUT)} lei. Din suma rezultată se reține 10% CASS la sursă.`,
  },
  {
    q: "Se reține CASS din indemnizația de creștere a copilului?",
    a: `Da. Din suma brută stabilită se reține automat 10% contribuție de sănătate (CASS), fără impozit pe venit și fără CAS. Astfel, minimul net încasat este ${fmt(EX_MIN.netLunar)} lei/lună, iar maximul net este ${fmt(EX_MAX.netLunar)} lei/lună.`,
  },
  {
    q: "Cât primești pentru gemeni sau tripleți?",
    a: `Pentru fiecare copil născut dintr-o sarcină multiplă, începând cu al doilea, indemnizația brută se majorează cu 50% din cuantumul cuvenit, dar nu mai puțin decât valoarea minimă de ${fmt(MINIM_ICC_BRUT)} lei.`,
  },
  {
    q: "Câte luni sunt rezervate celuilalt părinte (luna tatălui)?",
    a: `Cel puțin ${LUNI_CELALALT_PARINTE} luni din durata totală a concediului sunt rezervate netransferabil celuilalt părinte, dacă acesta îndeplinește condițiile de stagiu. Dacă nu le solicită, concediul total se scurtează cu ${LUNI_CELALALT_PARINTE} luni.`,
  },
  {
    q: "Cât este stimulentul de inserție dacă revii mai devreme la serviciu?",
    a: `Primești ${fmt(STIMULENT_SUB_6_LUNI)} lei pe lună dacă revii la activitate înainte ca copilul să împlinească 6 luni (1 an pentru copil cu handicap), sau ${fmt(STIMULENT_DUPA_6_LUNI)} lei pe lună dacă revii după această vârstă.`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Calculator indemnizație creștere copil", item: "https://salariile.ro/calculator-indemnizatie-crestere-copil" },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: "https://salariile.ro/calculator-indemnizatie-crestere-copil",
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

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator indemnizație creștere copil" }]} />
        <H1>Calculator indemnizație creștere copil 2026</H1>
        <Lead>
          Introdu media veniturilor nete din ultimele 12 luni și vezi cuantumul brut, reținerea CASS de 10% și suma lunară care intră pe card.
        </Lead>
      </Hero>

      <CalculatorCrestereCopil />
      <ReclamaSubCalculator />

      <Section
        companion={
          <CardCompanion titlu="Praguri și repere în 2026">
            <Repere
              randuri={[
                ["Procent din media netă", "85%"],
                ["Minim brut / net", `${fmt(MINIM_ICC_BRUT)} / ${fmt(EX_MIN.netLunar)} lei`],
                ["Maxim brut / net", `${fmt(MAXIM_ICC_BRUT)} / ${fmt(EX_MAX.netLunar)} lei`],
                ["CASS reținut la sursă", "10%"],
                ["Stimulent sub 6 luni", `${fmt(STIMULENT_SUB_6_LUNI)} lei/lună`],
                ["Stimulent după 6 luni", `${fmt(STIMULENT_DUPA_6_LUNI)} lei/lună`],
              ]}
            />
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se calculează indemnizația de creștere a copilului</h2>
          <p>
            Pentru a primi indemnizația, trebuie să fi realizat venituri impozabile (salarii, activități independente, profesii liberale sau perioade asimilate, cum ar fi concediul medical sau studiile universitare la zi) timp de cel puțin 12 luni în ultimii 2 ani anteriori datei nașterii copilului.
          </p>
          <Formula
            eticheta="Formula indemnizației de creștere copil"
            randuri={[
              "Indemnizație brută = 85% × media veniturilor nete pe 12 luni",
              `Încadrare legală   = minim ${fmt(MINIM_ICC_BRUT)} lei, maxim ${fmt(MAXIM_ICC_BRUT)} lei`,
              "Reținere CASS      = 10% × indemnizația brută",
              "Net lunar pe card  = indemnizația brută − CASS (impozit 0%)",
            ]}
          />
          <p>
            De exemplu, la o medie a veniturilor nete de 6.000 lei pe lună, 85% înseamnă {fmt(EX_MED.brutBaza)} lei brut, iar după reținerea CASS de {fmt(EX_MED.cass)} lei, suma încasată lunar este {fmt(EX_MED.netLunar)} lei. De la o medie netă de 10.000 lei în sus se atinge plafonul maxim de {fmt(MAXIM_ICC_BRUT)} lei brut ({fmt(EX_MAX.netLunar)} lei net).
          </p>
          <p>
            Tichetele de masă și alte venituri impozabile incluse în baza de impozit intră în calculul mediei veniturilor nete din adeverința eliberată de angajator. Pentru sarcinile multiple cu venituri peste plafon, decizia finală de calcul a majorării de 50% se confirmă de AJPIS.
          </p>
          <p className="source-note">
            Surse:{" "}
            <a href={URL_OUG_111} target="_blank" rel="noopener">OUG nr. 111/2010</a> (art. 2, 5, 7 și 11),
            Legea nr. 141/2025 (CASS 10% reținut la sursă) și{" "}
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/171282" target="_blank" rel="noopener">Codul Fiscal, art. 62</a>.
          </p>
        </Prose>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/calculator-concediu-medical", label: "Calculator concediu medical", descriere: "Calculează indemnizația de maternitate (cod 08, 126 zile)." },
          { href: "/", label: "Calculator salariu net", descriere: "Verifică netul lunar pentru calculul mediei pe 12 luni." },
          { href: "/calculator-concediu-odihna", label: "Calculator concediu de odihnă", descriere: "Zile proporționale înainte sau după concediul parental." },
          { href: "/calculator-pfa", label: "Calculator taxe PFA", descriere: "Venituri independente luate în calcul la dosarul AJPIS." },
        ]}
      />
    </>
  );
}
