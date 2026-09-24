// app/calculator-ore-suplimentare/page.tsx
// Ore suplimentare, muncă de noapte și sărbători legale — Codul Muncii.
//
// De ce pagina asta există, măsurat pe 9 septembrie 2026 în SE Ranking și GSC:
// „calculator ore suplimentare", „calcul salariu cu ore suplimentare",
// „calculator salariu cu ore suplimentare" și „calcul spor de noapte" adună
// ~990 de căutări lunar la dificultate 5–6. Noi apăream pe poziția 54, adică
// nicăieri, iar nimeni din piață nu țintește clusterul.
//
// Trece testul „nu e pagină-ușă": calculatorul obișnuit nu poate face asta.
// Are nevoie de tariful orar (care depinde de câte zile lucrătoare are luna),
// de cotele minime din lege și de regula că ora suplimentară se plătește
// integral plus spor, pe când ora de noapte e deja în salariul lunar și
// primește numai sporul. Confuzia dintre cele două e cea mai frecventă eroare
// din calculatoarele existente.

import type { Metadata } from "next";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import CalculatorOreSuplimentare from "@/app/components/CalculatorOreSuplimentare";
import {
  COTA_MINIMA_NOAPTE,
  COTA_MINIMA_SARBATOARE,
  COTA_MINIMA_SUPLIMENTARE,
  INTERVAL_NOAPTE,
  PRAG_ORE_NOAPTE_ZI,
  URL_COD_MUNCII,
  oreNormaleLuna,
} from "@/lib/ore-suplimentare";

const TITLU = "Calculator ore suplimentare 2026 - Vezi cât primești";
const DESC =
  "Calculează sporul pentru ore suplimentare, muncă de noapte și sărbători legale în 2026, pe tariful orar real al lunii și pe cotele din Codul Muncii.";

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: "https://salariile.ro/calculator-ore-suplimentare" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/calculator-ore-suplimentare" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const pct = (c: number) => `${Math.round(c * 100)}%`;

// Luna cu cele mai puține și cea cu cele mai multe ore, calculate — nu scrise
// de mână, ca să nu rămână în urmă când se schimbă calendarul.
const ORE_PE_LUNA = Array.from({ length: 12 }, (_, i) => oreNormaleLuna(2026, i));
const ORE_MIN = Math.min(...ORE_PE_LUNA);
const ORE_MAX = Math.max(...ORE_PE_LUNA);

const DIFERENTA_TARIF = Math.round((ORE_MAX / ORE_MIN - 1) * 100);

const FAQ = [
  {
    q: "Sunt obligat să primesc bani pentru orele suplimentare?",
    a: "Nu neapărat. Legea cere întâi timp liber plătit, în următoarele 90 de zile. Doar dacă asta nu e posibil, orele se plătesc cu spor. Un angajator care îți dă zile libere în loc de bani respectă legea.",
  },
  {
    q: "De la câte ore de noapte primesc spor?",
    a: `De la cel puțin ${PRAG_ORE_NOAPTE_ZI} ore lucrate noaptea într-o zi de lucru, sau dacă cel puțin 30% din timpul tău lunar de lucru e noaptea. Sub aceste praguri, sporul poate exista doar dacă îl prevede contractul.`,
  },
  {
    q: "Cât pot lucra peste program?",
    a: "Cel mult 48 de ore pe săptămână cu tot cu orele suplimentare, socotit ca medie pe câteva luni. Tinerii sub 18 ani nu pot face deloc ore suplimentare.",
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
          name: "Calculator ore suplimentare",
          item: "https://salariile.ro/calculator-ore-suplimentare",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: "https://salariile.ro/calculator-ore-suplimentare",
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

const REPERE = [
  ["Oră suplimentară", `spor de ${pct(COTA_MINIMA_SUPLIMENTARE)}`],
  ["Oră de noapte", `spor de ${pct(COTA_MINIMA_NOAPTE)}`],
  ["Zi de sărbătoare", `spor de ${pct(COTA_MINIMA_SARBATOARE)}`],
  ["Noaptea înseamnă", INTERVAL_NOAPTE],
] as const;

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator ore suplimentare" }]} />
        <H1>Calculator ore suplimentare 2026</H1>
        <Lead>
          Scrie salariul de bază și orele lucrate peste program, noaptea sau de sărbători, și vezi cât primești în plus.
        </Lead>
      </Hero>

      <CalculatorOreSuplimentare />

      <Section
        companion={
          <CardCompanion
            titlu="Sporurile minime din lege"
            nota="Contractul colectiv sau cel individual pot da mai mult, niciodată mai puțin."
          >
            <Repere randuri={REPERE} />
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se calculează</h2>
          <p>
            Totul pornește de la cât valorează o oră din salariul tău. Apoi fiecare fel de oră primește sporul ei:
          </p>
          <Formula
            eticheta="Formulele pentru ore suplimentare, noapte și sărbători"
            randuri={[
              "Tarif orar       = salariu de bază ÷ ore de program din lună",
              "Oră suplimentară = tarif orar × 1,75",
              "Spor de noapte   = tarif orar × 25% × ore de noapte",
              "Zi de sărbătoare = tarif orar × 100% × ore lucrate",
            ]}
          />
          <p>
            Diferența care se pierde cel mai des: ora suplimentară e în plus față de program, așa că se plătește
            întreagă și primește și spor. Ora de noapte face parte din programul tău, e deja plătită prin salariu,
            deci primești doar sporul.
          </p>

          <h2>De ce contează luna</h2>
          <p>
            Lunile nu au același număr de ore de program: în 2026, între {ORE_MIN} și {ORE_MAX}. Salariul e același,
            dar se împarte la mai puține ore, așa că într-o lună scurtă ora ta valorează cu până la{" "}
            {DIFERENTA_TARIF}% mai mult. Odată cu ea, și ora suplimentară. Calculatorul folosește calendarul lunii
            alese, nu o medie.
          </p>

          <h2>Timp liber sau bani</h2>
          <p>
            Pentru orele suplimentare, legea preferă timpul liber: angajatorul îți dă ore libere plătite în
            următoarele 90 de zile, iar sporul vine doar dacă asta nu se poate. La munca de noapte, angajatorul poate
            alege între spor și un program mai scurt cu o oră, fără să-ți scadă salariul.
          </p>

          <h2>Ce nu intră în calcul</h2>
          <p>
            Sporurile din contractul colectiv, cum ar fi cele pentru condiții grele sau pentru vechime, depind de
            fiecare angajator. Procentele din calculator pornesc de la minimul legal, dar le poți urca dacă
            contractul tău dă mai mult.
          </p>
          <p className="source-note">
            Sursa:{" "}
            <a href={URL_COD_MUNCII} target="_blank" rel="noopener">
              Codul Muncii, art. 112, 122–126 și 142
            </a>
            .
          </p>
        </Prose>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/", label: "Calculator salariu net", descriere: "Brut în net pentru orice salariu." },
          { href: "/calculator-salariu-part-time", label: "Calculator part-time", descriere: "Norme reduse și contribuții." },
          { href: "/zile-lucratoare-2026", label: "Zile lucrătoare 2026", descriere: "Câte ore are fiecare lună." },
          { href: "/fluturas-salariu", label: "Generator de fluturaș", descriere: "Vezi defalcarea, ca pe hârtie." },
          { href: "/zile-libere-2026", label: "Zile libere 2026", descriere: "Sărbătorile legale ale anului." },
          { href: "/calculator-salariu-sanatate", label: "Calculator salariu sănătate", descriere: "Grila din Legea 153/2017." },
        ]}
      />
    </>
  );
}
