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
  "Calculează exact vechimea în muncă din perioadele lucrate, fără zile dublate, gradația de vechime la stat și cât mai ai până la pensie.";

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: "https://salariile.ro/calculator-vechime-munca" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/calculator-vechime-munca" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const FAQ = [
  {
    q: "Dacă am două joburi în același timp, se dublează vechimea?",
    a: "Nu. O zi în care ai două contracte se numără o singură dată la vechime. Veniturile de pe ambele contracte se adună însă la punctajul de pensie. Calculatorul scoate automat zilele suprapuse.",
  },
  {
    q: "Contractul part-time se pune întreg la vechime?",
    a: "Da. O lună lucrată pe 2, 4 sau 6 ore se pune la fel ca o lună pe 8 ore la vechimea în muncă. Și la pensie contează ca stagiu întreg dacă s-au plătit contribuțiile legale.",
  },
  {
    q: "Care e diferența dintre vechimea în muncă și stagiul de pensie?",
    a: `Vechimea în muncă adună perioadele lucrate cu contract de muncă (din cartea de muncă, adeverințe sau REGES-ONLINE). Stagiul de pensie e mai larg: include toate lunile în care ai plătit CAS (și pe PFA sau contract cu casa de pensii) plus facultatea la zi, armata sau șomajul. Pentru pensie îți trebuie cel puțin ${STAGIU_MINIM_PENSIE_ANI} ani stagiu minim; stagiul complet este de ${STAGIU_COMPLET_PENSIE_ANI} de ani.`,
  },
  {
    q: "Unde verific oficial câți ani am înregistrați?",
    a: "Pentru contractele de muncă intri în contul tău de salariat din REGES-ONLINE. Pentru tot stagiul de cotizare la pensie scoți extrasul online din contul de pe cnpp.ro.",
  },
  {
    q: "Concediul de creștere a copilului se pune la vechime?",
    a: "Da. Perioada în care stai în concediu de creștere copil se pune la vechimea în muncă, în specialitate și la stagiul de pensie.",
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
          Pune perioadele lucrate și vezi totalul în ani, luni și zile, gradația de vechime la stat și cât mai ai până la pragurile de pensie.
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
          <h2>Cum se adună perioadele de vechime</h2>
          <p>
            Fiecare contract se numără de la prima până la ultima zi lucrată. Dacă două contracte se suprapun în timp, calculatorul păstrează o singură dată zilele comune, apoi transformă restul după regula clasică de evidență a muncii (30 de zile fac o lună, 12 luni fac un an).
          </p>
          <Formula
            eticheta="Praguri care depind de vechime"
            randuri={[
              "Gradații la stat = 3, 5, 10, 15 și 20 de ani (Legea 153/2017)",
              `Pensie           = ${STAGIU_MINIM_PENSIE_ANI} ani stagiu minim / ${STAGIU_COMPLET_PENSIE_ANI} ani complet (Legea 360/2023)`,
              "Ajutor șomaj     = 3% (3 ani) | 5% (5) | 7% (10) | 10% (20 ani)",
            ]}
          />
          <p>
            La privat, sporul de vechime se plătește doar dacă este trecut în contractul tău sau în contractul colectiv al firmei. La stat, gradațiile cresc automat salariul de bază în trepte. Istoricul contractelor înregistrate îl găsești urmând pașii din ghidul{" "}
            <Link href="/noutati/reges-online">REGES-ONLINE</Link>.
          </p>
          <p className="source-note">
            Surse:{" "}
            <a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/128646" target="_blank" rel="noopener">Codul Muncii (Legea 53/2003)</a>,
            Legea 153/2017 (art. 10), Legea 360/2023 privind pensiile și Legea 76/2002.
          </p>
        </Prose>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/calculator-indemnizatie-somaj", label: "Calculator indemnizație șomaj", descriere: "Vezi cât primești la șomaj pentru vechimea ta." },
          { href: "/calculator-salariu-invatamant", label: "Calculator salarii învățământ", descriere: "Grila din educație cu gradația ta de vechime." },
          { href: "/calculator-salariu-sanatate", label: "Calculator salarii sănătate", descriere: "Grila din spitale cu gradații și sporuri." },
          { href: "/noutati/reges-online", label: "Verifică contractele în REGES", descriere: "Cum scoți istoricul oficial al contractelor." },
          { href: "/", label: "Calculator salariu net", descriere: "Brut în net și invers pentru orice salariu." },
        ]}
      />
    </>
  );
}
