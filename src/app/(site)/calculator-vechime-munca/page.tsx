import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import CalculatorVechimeMunca from "@/app/components/CalculatorVechimeMunca";
import { ReclamaSubCalculator } from "@/app/components/Reclama";
import { STAGIU_COMPLET_PENSIE_ANI, STAGIU_MINIM_PENSIE_ANI } from "@/lib/vechime-munca";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const TITLU = "Calculator Vechime în Muncă 2026: ani, luni și zile";
const DESC =
  "Calculează exact vechimea în muncă din perioadele lucrate, cu eliminarea suprapunerilor, gradația de vechime la stat și pragurile de pensie și șomaj.";

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: "https://salariile.ro/calculator-vechime-munca" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/calculator-vechime-munca" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const FAQ = [
  {
    q: "Dacă am două contracte de muncă în paralel, se dublează vechimea?",
    a: "Nu. Vechimea în muncă și stagiul calendaristic de cotizare nu se dublează pentru zilele în care ai două contracte simultane. În schimb, veniturile brute cumulate cresc punctajul de pensie. Calculatorul elimină automat suprapunerile dintre perioade.",
  },
  {
    q: "Contractul part-time se pune la vechimea în muncă?",
    a: "Da. Potrivit Codului Muncii, contractele cu timp parțial se iau în calcul integral ca vechime în muncă (ani, luni, zile), la fel ca norma întreagă, iar la pensie stagiul de cotizare se acordă integral dacă se plătesc contribuțiile legale.",
  },
  {
    q: "Care este diferența dintre vechimea în muncă și stagiul de cotizare la pensie?",
    a: `Vechimea în muncă reprezintă perioadele lucrate cu contract individual de muncă (dovedite prin cartea de muncă, adeverințe sau REGES-ONLINE). Stagiul de cotizare la pensie include toate lunile în care s-a plătit CAS (inclusiv PFA, contracte de asigurare cu CNPP sau perioade asimilate precum facultatea la zi, armata și șomajul indemnizat). Stagiul minim pentru pensia de limită de vârstă este ${STAGIU_MINIM_PENSIE_ANI} ani, iar cel complet este ${STAGIU_COMPLET_PENSIE_ANI} ani.`,
  },
  {
    q: "Cum verific oficial ce vechime am înregistrată?",
    a: "Poți verifica contractele de muncă din contul tău de salariat în REGES-ONLINE și poți solicita online stagiul complet de cotizare din contul personal pe portalul Casei Naționale de Pensii Publice (cnpp.ro).",
  },
  {
    q: "Concediul de creștere a copilului se consideră vechime în muncă?",
    a: "Da. Potrivit OUG nr. 111/2010, perioada concediului de creștere a copilului constituie vechime în muncă, în serviciu și în specialitate, și este perioadă asimilată la stagiul de cotizare pentru pensie.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Calculator vechime în muncă", item: "https://salariile.ro/calculator-vechime-munca" },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: "https://salariile.ro/calculator-vechime-munca",
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
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator vechime în muncă" }]} />
        <H1>Calculator vechime în muncă 2026</H1>
        <Lead>
          Adaugă perioadele lucrate și află totalul în ani, luni și zile, gradația de vechime la stat și cât mai ai până la pragurile de pensie.
        </Lead>
      </Hero>

      <CalculatorVechimeMunca />
      <ReclamaSubCalculator />

      <Section
        companion={
          <CardCompanion titlu="Gradații de vechime la stat">
            <Repere
              randuri={[
                ["Sub 3 ani", "Gradația 0 (0%)"],
                ["3–5 ani", "Gradația 1 (+7,5%)"],
                ["5–10 ani", "Gradația 2 (+12,88%)"],
                ["10–15 ani", "Gradația 3 (+18,52%)"],
                ["15–20 ani", "Gradația 4 (+21,48%)"],
                ["Peste 20 de ani", "Gradația 5 (+24,52%)"],
              ]}
            />
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se calculează vechimea în muncă</h2>
          <p>
            Fiecare interval lucrat se măsoară inclusiv de la data de început până la data de încetare a contractului. Dacă ai avut două contracte suprapuse, calculatorul le unifică mai întâi pe calendar, apoi adună perioadele distincte (30 de zile = 1 lună, 12 luni = 1 an).
          </p>
          <Formula
            eticheta="Praguri legale legate de vechime"
            randuri={[
              "Gradații bugetari = 3, 5, 10, 15 și 20 ani (Legea 153/2017, art. 10)",
              `Pensie limită     = ${STAGIU_MINIM_PENSIE_ANI} ani stagiu minim / ${STAGIU_COMPLET_PENSIE_ANI} ani stagiu complet (Legea 360/2023)`,
              "Ajutor șomaj      = cote 3% (3 ani), 5% (5), 7% (10), 10% (20 ani)",
            ]}
          />
          <p>
            În sectorul privat, sporul de vechime nu este obligatoriu prin lege, ci doar dacă apare în contractul individual sau colectiv de muncă. În sectorul bugetar, gradațiile se aplică în cascadă peste salariul de bază de la gradația 0. Poți vedea cum verifici contractele înregistrate în ghidul{" "}
            <Link href="/noutati/reges-online">REGES-ONLINE</Link>.
          </p>
          <p className="source-note">
            Surse:{" "}
            <a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Codul Muncii (Legea nr. 53/2003)</a>,
            Legea-cadru nr. 153/2017 (art. 10), Legea nr. 360/2023 privind sistemul public de pensii și Legea nr. 76/2002.
          </p>
        </Prose>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/calculator-indemnizatie-somaj", label: "Calculator indemnizație șomaj", descriere: "Calculează șomajul în funcție de vechimea ta." },
          { href: "/calculator-salariu-invatamant", label: "Calculator salarii învățământ", descriere: "Aplică gradația de vechime pe grila din educație." },
          { href: "/calculator-salariu-sanatate", label: "Calculator salarii sănătate", descriere: "Grila medicală cu gradații și sporuri." },
          { href: "/noutati/reges-online", label: "Cum verifici contractele în REGES", descriere: "Extrage istoricul contractelor tale de muncă." },
          { href: "/", label: "Calculator salariu net", descriere: "Brut în net și invers pentru orice salariu." },
        ]}
      />
    </>
  );
}
