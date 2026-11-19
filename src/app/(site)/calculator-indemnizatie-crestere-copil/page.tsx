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
  "Calculează indemnizația de creștere copil în 2026: 85% din netul pe 12 luni, minim 1.651 lei, maxim 8.500 lei, reținerea CASS 10%, gemeni și stimulent.";

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
    q: "Cât este indemnizația de creștere a copilului în 2026?",
    a: `Primești 85% din media veniturilor tale nete din ultimele 12 luni lucrate în ultimii 2 ani înainte de naștere, dar nu sub ${fmt(MINIM_ICC_BRUT)} lei și nu peste ${fmt(MAXIM_ICC_BRUT)} lei brut. Din suma rezultată se reține 10% pentru sănătate (CASS).`,
  },
  {
    q: "Se oprește CASS din indemnizația de creștere copil?",
    a: `Da, 10% se oprește automat înainte să intre banii pe card. Nu plătești impozit pe venit și nici pensie. Practic, minimul care intră în cont este ${fmt(EX_MIN.netLunar)} lei, iar maximul este ${fmt(EX_MAX.netLunar)} lei pe lună.`,
  },
  {
    q: "Cât primești în plus pentru gemeni sau tripleți?",
    a: `De la al doilea copil în sus, suma brută crește cu 50% din indemnizația calculată pentru fiecare copil în plus, dar cel puțin cu ${fmt(MINIM_ICC_BRUT)} lei brut pentru fiecare copil.`,
  },
  {
    q: "Ce se întâmplă dacă celălalt părinte nu își ia lunile lui?",
    a: `Cel puțin ${LUNI_CELALALT_PARINTE} luni din concediu îi revin celuilalt părinte, dacă are stagiul necesar. Dacă nu le cere, concediul nu se prelungește pentru primul părinte: se oprește cu ${LUNI_CELALALT_PARINTE} luni mai devreme.`,
  },
  {
    q: "Cât este stimulentul de inserție dacă te întorci mai repede la muncă?",
    a: `Primești ${fmt(STIMULENT_SUB_6_LUNI)} lei pe lună dacă revii la serviciu înainte ca cel mic să împlinească 6 luni (sau 1 an pentru copil cu handicap), și ${fmt(STIMULENT_DUPA_6_LUNI)} lei pe lună dacă revii după 6 luni.`,
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
          Scrie media salariului tău net din ultimele 12 luni și vezi cât intră pe card în fiecare lună, după reținerea de sănătate.
        </Lead>
      </Hero>

      <CalculatorCrestereCopil />
      <ReclamaSubCalculator />

      <Section
        companion={
          <CardCompanion titlu="Praguri în 2026">
            <Repere
              randuri={[
                ["Procent din media netă", "85%"],
                ["Minim brut / pe card", `${fmt(MINIM_ICC_BRUT)} / ${fmt(EX_MIN.netLunar)} lei`],
                ["Maxim brut / pe card", `${fmt(MAXIM_ICC_BRUT)} / ${fmt(EX_MAX.netLunar)} lei`],
                ["CASS reținut", "10%"],
                ["Stimulent sub 6 luni", `${fmt(STIMULENT_SUB_6_LUNI)} lei/lună`],
                ["Stimulent după 6 luni", `${fmt(STIMULENT_DUPA_6_LUNI)} lei/lună`],
              ]}
            />
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se calculează indemnizația de creștere copil</h2>
          <p>
            Ca să o primești, ai nevoie de cel puțin 12 luni cu venituri impozabile în ultimii 2 ani dinaintea nașterii. Intră salariile, veniturile din PFA sau profesii liberale, dar și perioade asimilate, cum ar fi concediul medical, șomajul sau facultatea la zi.
          </p>
          <Formula
            eticheta="Formula indemnizației de creștere copil"
            randuri={[
              "Brut lunar = 85% × media veniturilor nete pe 12 luni",
              `Limitele   = minim ${fmt(MINIM_ICC_BRUT)} lei, maxim ${fmt(MAXIM_ICC_BRUT)} lei`,
              "Sănătate   = 10% reținut din brut",
              "Pe card    = brut lunar − 10% (fără impozit)",
            ]}
          />
          <p>
            La o medie netă de 6.000 lei pe lună, 85% înseamnă {fmt(EX_MED.brutBaza)} lei brut. După ce se opresc {fmt(EX_MED.cass)} lei pentru sănătate, rămân {fmt(EX_MED.netLunar)} lei în cont. De la 10.000 lei net în sus se atinge plafonul maxim: {fmt(MAXIM_ICC_BRUT)} lei brut, adică {fmt(EX_MAX.netLunar)} lei pe card.
          </p>
          <p>
            În media netă de pe adeverința de la firmă intră și tichetele de masă sau bonusurile pe care s-a plătit impozit. La gemeni sau tripleți cu venituri peste plafon, suma exactă a majorării de 50% se confirmă în decizia de la AJPIS.
          </p>
          <p className="source-note">
            Surse:{" "}
            <a href={URL_OUG_111} target="_blank" rel="noopener">OUG 111/2010</a> (art. 2, 5, 7 și 11),
            Legea 141/2025 (CASS 10%) și{" "}
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/171282" target="_blank" rel="noopener">Codul Fiscal, art. 62</a>.
          </p>
        </Prose>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/calculator-concediu-medical", label: "Calculator concediu medical", descriere: "Calculează concediul de maternitate (cod 08, 126 zile)." },
          { href: "/", label: "Calculator salariu net", descriere: "Verifică netul lunar care intră în media pe 12 luni." },
          { href: "/calculator-concediu-odihna", label: "Calculator concediu de odihnă", descriere: "Zilele rămase înainte sau după concediul parental." },
          { href: "/calculator-pfa", label: "Calculator taxe PFA", descriere: "Venituri din activități independente pentru dosar." },
        ]}
      />
    </>
  );
}
