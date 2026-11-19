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
  "Calculează indemnizația de concediu medical în 2026: procente 55%/65%/75%, prima zi neplătită, plată angajator vs FNUASS, CAS, CASS și net estimat.";

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
    q: "Cum se calculează concediul medical pentru boală obișnuită (cod 01) în 2026?",
    a: `Procentul depinde de durata întregului episod de boală: 55% până la 7 zile calendaristice, 65% între 8 și 14 zile, și 75% de la 15 zile în sus. De exemplu, la un salariu brut mediu de 6.000 lei și 5 zile lucrătoare de concediu (prima zi neplătită), rezultă ${fmt(EX_5Z.indemnizatieBruta)} lei brut și aproximativ ${fmt(EX_5Z.indemnizatieNeta)} lei net.`,
  },
  {
    q: "Se mai plătește prima zi de concediu medical în 2026?",
    a: "Nu, pentru majoritatea certificatelor emise între 1 februarie 2026 și 31 decembrie 2027, prima zi lucrătoare a episodului de boală este neplătită (o singură dată pe episod). Sunt exceptate concediile de maternitate, risc maternal, îngrijire pacient oncologic, programele naționale de sănătate și episoadele cu internare în spital.",
  },
  {
    q: "Cine plătește concediul medical: firma sau statul?",
    a: "Pentru boală obișnuită, angajatorul suportă zilele lucrătoare 2–6 (când prima zi este neplătită), iar de la ziua 7 plătește FNUASS (Casa de Sănătate). Pentru maternitate, copil bolnav, risc maternal și îngrijire pacient oncologic, FNUASS suportă integral de la prima zi plătită.",
  },
  {
    q: "Ce taxe se rețin din concediul medical?",
    a: `CAS (25%) se calculează la o bază plafonată egală cu 35% din câștigul salarial mediu brut BASS (${fmt(CASTIG_MEDIU_BASS)} lei), proporțional cu zilele de concediu. CASS (10%) se reține la boală obișnuită (cod 01), dar nu la maternitate, copil bolnav, urgențe sau oncologic. Impozitul de 10% nu se aplică la maternitate, copil bolnav, risc maternal și oncologic.`,
  },
  {
    q: "Cât primești în concediul de maternitate (cod 08)?",
    a: `Indemnizația de maternitate este 85% din baza de calcul, fără prima zi neplătită, scutită de CASS și impozit pe venit (se reține doar CAS pe baza plafonată). La un brut mediu de 6.000 lei pe o lună întreagă (21 zile lucrătoare), netul este în jur de ${fmt(EX_MAT.indemnizatieNeta)} lei.`,
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
          Calculează indemnizația brută și netă pentru boală obișnuită, urgențe, maternitate sau copil bolnav, cu regulile în vigoare în 2026.
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
          <h2>Cum se calculează indemnizația de concediu medical</h2>
          <p>
            Baza de calcul este media zilnică a veniturilor brute din ultimele 6 luni de stagiu, plafonată la 12 salarii minime brute pe lună ({fmt(PLAFON_BAZA_LUNARA)} lei). Indemnizația se plătește doar pentru zilele lucrătoare din certificat.
          </p>
          <Formula
            eticheta="Formula concediului medical"
            randuri={[
              "Bază zilnică      = venituri brute 6 luni ÷ zile lucrătoare 6 luni",
              "Indemnizație brut = bază zilnică × procent cod × zile lucrătoare plătite",
              `Bază CAS (art.143)= 35% × ${fmt(CASTIG_MEDIU_BASS)} lei (BASS) × (zile plătite ÷ zile lună)`,
              "Net estimat       = brut − CAS 25% − CASS 10% (cod 01) − impozit 10%",
            ]}
          />
          <p>
            Pentru boala obișnuită (cod 01), cota de 55%, 65% sau 75% depinde de durata întregului episod de boală, nu de durata fiecărui certificat separat. Prima zi lucrătoare nu se plătește între februarie 2026 și decembrie 2027, cu excepția cazurilor de maternitate, risc maternal, îngrijire pacient oncologic, programe naționale de sănătate și internare în spital.
          </p>
          <p>
            Toate detaliile legislative despre stagiul minim de 6 luni în ultimele 12 luni și excepțiile din 2026 sunt explicate pe larg în ghidul nostru despre{" "}
            <Link href="/noutati/concediu-medical-2026">concediul medical în 2026</Link>.
          </p>
          <p className="source-note">
            Surse:{" "}
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/66611" target="_blank" rel="noopener">OUG nr. 158/2005</a>,
            Legea nr. 141/2025, OUG nr. 91/2025, Legea nr. 64/2026 și{" "}
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/171282" target="_blank" rel="noopener">Codul Fiscal (art. 62, 143, 154–155)</a>.
            Indicatorul bugetului asigurărilor sociale de stat (BASS) pentru 2026 este {fmt(CASTIG_MEDIU_BASS)} lei (Legea nr. 44/2026).
          </p>
        </Prose>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/noutati/concediu-medical-2026", label: "Ghid concediu medical 2026", descriere: "Regulile noi pentru prima zi neplătită, excepții și stagiu minim." },
          { href: "/calculator-indemnizatie-crestere-copil", label: "Calculator creștere copil", descriere: "Indemnizația de 85% din net, plafoane și CASS 10%." },
          { href: "/calculator-concediu-odihna", label: "Calculator concediu de odihnă", descriere: "Indemnizația de concediu și zilele proporționale." },
          { href: "/", label: "Calculator salariu net", descriere: "Transformă brutul în net și vezi contribuțiile." },
          { href: "/zile-lucratoare-2026", label: "Zile lucrătoare 2026", descriere: "Numărul exact de zile lucrătoare pentru fiecare lună." },
        ]}
      />
    </>
  );
}
