import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import CalculatorConcediuMedical from "@/app/components/CalculatorConcediuMedical";
import { ReclamaSubCalculator } from "@/app/components/Reclama";
import {
  CASTIG_MEDIU_BASS,
  PLAFON_BAZA_LUNARA,
  calculeazaConcediuMedical,
} from "@/lib/concediu-medical";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const TITLU = "Calculator Concediu Medical 2026: brut, net și taxe";
const DESC =
  "Calculează cât primești în concediu medical în 2026: 55%/65%/75%, prima zi neplătită, cât plătește firma vs statul, CAS, CASS și suma netă.";

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: "https://salariile.ro/calculator-concediu-medical" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/calculator-concediu-medical" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

const EX_5Z = calculeazaConcediuMedical({
  venitBrutMediu6Luni: 6000,
  cod: "01",
  zileCalendaristiceEpisod: 5,
  zileLucratoareConcediu: 5,
  zileLucratoareLuna: 21,
})!;
const EX_MAT = calculeazaConcediuMedical({
  venitBrutMediu6Luni: 6000,
  cod: "08",
  zileCalendaristiceEpisod: 30,
  zileLucratoareConcediu: 21,
  zileLucratoareLuna: 21,
})!;

const FAQ = [
  {
    q: "Cu cât se plătește concediul medical pentru boală obișnuită (cod 01) în 2026?",
    a: `Procentul crește cu durata bolii: 55% până la 7 zile calendaristice, 65% între 8 și 14 zile și 75% de la 15 zile în sus. De exemplu, la un brut mediu de 6.000 lei și 5 zile lucrătoare de concediu (prima zi neplătită), ies ${fmt(EX_5Z.indemnizatieBruta)} lei brut și cam ${fmt(EX_5Z.indemnizatieNeta)} lei în mână.`,
  },
  {
    q: "Se mai plătește prima zi de concediu medical?",
    a: "Pentru majoritatea certificatelor emise până la finalul lui 2027, nu: prima zi lucrătoare a episodului de boală rămâne neplătită, o singură dată pe episod. Fac excepție maternitatea, riscul maternal, îngrijirea unui pacient oncologic, programele naționale de sănătate și internarea în spital.",
  },
  {
    q: "Cine plătește concediul medical: angajatorul sau Casa de Sănătate?",
    a: "La boală obișnuită, firma plătește zilele lucrătoare 2–6 (când prima zi e neplătită), iar statul (FNUASS) preia plata din ziua a 7-a. La maternitate, copil bolnav, risc maternal și oncologic, FNUASS acoperă toate zilele plătite, chiar dacă banii îți intră tot prin firmă.",
  },
  {
    q: "Ce taxe se opresc din concediul medical?",
    a: `Pensia (CAS 25%) se calculează pe o bază fixată de lege, 35% din câștigul salarial mediu brut BASS (${fmt(CASTIG_MEDIU_BASS)} lei), proporțional cu zilele plătite. Sănătatea (CASS 10%) se oprește la boală obișnuită (cod 01), nu și la urgențe, maternitate, copil bolnav sau oncologic. Impozitul de 10% nu se oprește la maternitate, copil bolnav, risc maternal și oncologic.`,
  },
  {
    q: "Cât iei în mână în concediul de maternitate (cod 08)?",
    a: `Indemnizația de maternitate este 85% din brutul mediu, fără prima zi neplătită, fără CASS și fără impozit (rămâne doar CAS-ul plafonat). La un brut de 6.000 lei pe o lună întreagă, primești în mână cam ${fmt(EX_MAT.indemnizatieNeta)} lei.`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Calculator concediu medical", item: "https://salariile.ro/calculator-concediu-medical" },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: "https://salariile.ro/calculator-concediu-medical",
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
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator concediu medical" }]} />
        <H1>Calculator concediu medical 2026</H1>
        <Lead>
          Pune salariul brut din ultimele luni, alege codul de pe certificat și vezi cât iei în mână și cât suportă firma.
        </Lead>
      </Hero>

      <CalculatorConcediuMedical />
      <ReclamaSubCalculator />

      <Section
        companion={
          <CardCompanion titlu="Procente pe coduri în 2026">
            <Repere
              randuri={[
                ["Cod 01 (1–7 zile)", "55%"],
                ["Cod 01 (8–14 zile)", "65%"],
                ["Cod 01 (15+ zile)", "75%"],
                ["Cod 06 (urgență)", "100%"],
                ["Cod 08 (maternitate)", "85%"],
                ["Cod 09 (copil bolnav)", "85%"],
                ["Cod 15 (risc maternal)", "75%"],
              ]}
            />
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se calculează concediul medical</h2>
          <p>
            Calculul pornește din media salariului tău brut pe ultimele 6 luni lucrate, plafonată la 12 salarii minime pe lună ({fmt(PLAFON_BAZA_LUNARA)} lei). Se plătesc doar zilele lucrătoare din certificat, nu și weekendurile.
          </p>
          <Formula
            eticheta="Formula concediului medical"
            randuri={[
              "Bază pe zi       = brut ultimele 6 luni ÷ zile lucrătoare 6 luni",
              "Indemnizație brut= bază pe zi × procent cod × zile lucrătoare plătite",
              `Bază CAS         = 35% × ${fmt(CASTIG_MEDIU_BASS)} lei (BASS) × (zile plătite ÷ zile lună)`,
              "Net în mână      = brut − CAS 25% − CASS 10% (cod 01) − impozit 10%",
            ]}
          />
          <p>
            La boala obișnuită (cod 01), procentul de 55%, 65% sau 75% se alege după cât durează tot episodul de boală, chiar dacă medicul îți dă două certificate legate. În plus, prima zi lucrătoare nu se plătește, cu excepția maternității, riscului maternal, îngrijirii unui pacient oncologic, programelor naționale de sănătate și internării în spital.
          </p>
          <p>
            Dacă vrei toate detaliile despre stagiul minim de 6 luni și excepții, le-am pus separat în articolul despre{" "}
            <Link href="/noutati/concediu-medical-2026">concediul medical în 2026</Link>.
          </p>
          <p className="source-note">
            Surse:{" "}
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/66611" target="_blank" rel="noopener">OUG 158/2005</a>,
            Legea 141/2025, OUG 91/2025, Legea 64/2026 și{" "}
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/171282" target="_blank" rel="noopener">Codul Fiscal (art. 62, 143, 154–155)</a>.
            Indicatorul bugetului asigurărilor sociale (BASS) pentru 2026 este {fmt(CASTIG_MEDIU_BASS)} lei (Legea 44/2026).
          </p>
        </Prose>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/noutati/concediu-medical-2026", label: "Ghid concediu medical 2026", descriere: "Prima zi neplătită, excepțiile și stagiul minim." },
          { href: "/calculator-indemnizatie-crestere-copil", label: "Calculator creștere copil", descriere: "85% din net, plafoane și reținerea de 10%." },
          { href: "/calculator-concediu-odihna", label: "Calculator concediu de odihnă", descriere: "Indemnizația de concediu și zilele rămase." },
          { href: "/", label: "Calculator salariu net", descriere: "Transformă brutul în net și vezi taxele." },
          { href: "/zile-lucratoare-2026", label: "Zile lucrătoare 2026", descriere: "Câte zile lucrătoare are fiecare lună." },
        ]}
      />
    </>
  );
}
