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
import { Breadcrumb, CardCompanion, Faq, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import CalculatorOreSuplimentare from "@/app/components/CalculatorOreSuplimentare";
import {
  COTA_MINIMA_NOAPTE,
  COTA_MINIMA_SARBATOARE,
  COTA_MINIMA_SUPLIMENTARE,
  INTERVAL_NOAPTE,
  ORE_PE_ZI,
  PRAG_ORE_NOAPTE_ZI,
  URL_COD_MUNCII,
  oreNormaleLuna,
} from "@/lib/ore-suplimentare";

const TITLU = "Calculator ore suplimentare 2026: spor 75%, noapte și sărbători";
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

const FAQ = [
  {
    q: "Cât este sporul pentru ore suplimentare în 2026?",
    a: `Minimum ${pct(COTA_MINIMA_SUPLIMENTARE)} din salariul de bază, conform art. 123 alin. (2) din Codul Muncii. Este un prag, nu o valoare fixă: contractul colectiv sau cel individual pot stabili mai mult, niciodată mai puțin. Ora suplimentară se plătește integral, iar sporul se adaugă peste ea — la cota minimă, o oră suplimentară valorează 1,75 × tariful orar.`,
  },
  {
    q: "Orele suplimentare se plătesc obligatoriu?",
    a: "Nu în primul rând. Art. 122 spune că munca suplimentară se compensează întâi cu ore libere plătite; plata cu spor vine abia dacă acea compensare nu este posibilă în termenul prevăzut de lege. Un angajator care îți dă timp liber în locul banilor respectă legea.",
  },
  {
    q: "Cât este sporul de noapte?",
    a: `Minimum ${pct(COTA_MINIMA_NOAPTE)} din salariul de bază, dar legea oferă angajatorului o alternativă: art. 126 spune că salariatul de noapte beneficiază fie de program redus cu o oră fără scăderea salariului, fie de sporul de ${pct(COTA_MINIMA_NOAPTE)}. Munca de noapte este cea prestată între ${INTERVAL_NOAPTE}.`,
  },
  {
    q: "De la câte ore se cuvine sporul de noapte?",
    a: `Art. 125 alin. (2) definește salariatul de noapte ca fiind cel care lucrează cel puțin ${PRAG_ORE_NOAPTE_ZI} ore de noapte din ziua sa de lucru, sau cel puțin 30% din timpul său lunar de lucru. Sub aceste praguri, sporul nu decurge din lege — poate exista din contractul colectiv, dar nu se poate presupune.`,
  },
  {
    q: "Cât se plătește munca în zi de sărbătoare legală?",
    a: `Dacă nu se acordă zile libere în compensare, art. 142 alin. (2) prevede un spor de minimum ${pct(COTA_MINIMA_SARBATOARE)} din salariul de bază corespunzător muncii prestate. Ziua de sărbătoare este deja plătită prin salariul lunar, așa că sporul se adaugă peste ea.`,
  },
  {
    q: "De ce contează în ce lună am făcut orele?",
    a: `Pentru că tariful orar se obține împărțind salariul de bază la orele de program normal din luna respectivă, iar acestea variază: în 2026 lunile au între ${ORE_MIN} și ${ORE_MAX} ore. Aceeași oră suplimentară valorează mai mult într-o lună scurtă. Un calculator care folosește o medie fixă de 168 de ore greșește în aproape fiecare lună.`,
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
      name: "Salariile.ro",
      url: "https://salariile.ro",
      founder: { "@id": "https://salariile.ro/#person" },
    },
    personSchema,
  ],
};

const REPERE = [
  ["Spor ore suplimentare, minim", pct(COTA_MINIMA_SUPLIMENTARE)],
  ["Spor de noapte, minim", pct(COTA_MINIMA_NOAPTE)],
  ["Spor sărbători legale, minim", pct(COTA_MINIMA_SARBATOARE)],
  ["Munca de noapte", INTERVAL_NOAPTE],
  ["Prag ore de noapte pe zi", `${PRAG_ORE_NOAPTE_ZI} ore`],
  ["Normă întreagă", `${ORE_PE_ZI} ore/zi, 40/săptămână`],
  ["Ore de program în 2026", `${ORE_MIN}–${ORE_MAX} pe lună`],
] as const;

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator ore suplimentare" }]} />
        <H1>Calculator ore suplimentare 2026</H1>
        <Lead>
          Pune-ți salariul de bază și orele lucrate peste program, noaptea sau în sărbători legale.
          Vezi sporul pe fiecare linie, cu articolul din Codul Muncii, și cât rămâne net.
        </Lead>
      </Hero>

      <CalculatorOreSuplimentare />

      <Section
        companion={
          <CardCompanion
            titlu="Repere · Codul Muncii"
            nota="Toate cotele sunt minime legale. Contractul colectiv sau cel individual pot da mai mult, niciodată mai puțin."
          >
            <Repere randuri={REPERE} />
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cele două reguli care se confundă</h2>
          <p>
            Ora suplimentară și ora de noapte se plătesc după logici diferite, iar amestecul lor
            este cea mai frecventă eroare din calculatoarele de pe piață.
          </p>
          <ul>
            <li>
              <strong>Ora suplimentară nu este cuprinsă în salariul lunar.</strong> Ea se plătește
              integral, la tariful orar, iar peste ea se adaugă sporul de minimum{" "}
              {pct(COTA_MINIMA_SUPLIMENTARE)}. La cota minimă, o oră suplimentară valorează 1,75 ×
              tariful orar.
            </li>
            <li>
              <strong>Ora de noapte este deja cuprinsă în salariul lunar.</strong> Este parte din
              programul normal, doar că se prestează între {INTERVAL_NOAPTE}. Se adaugă numai sporul
              de {pct(COTA_MINIMA_NOAPTE)}, nu încă o plată a orei.
            </li>
          </ul>
          <p>
            Un calculator care tratează ora de noapte ca pe una suplimentară supraestimează câștigul
            cu zeci de procente.
          </p>

          <h2>De ce tariful orar diferă de la lună la lună</h2>
          <p>
            Tariful orar este salariul de bază împărțit la orele de program normal din luna
            respectivă, iar acestea nu sunt constante. În 2026, lunile au între {ORE_MIN} și{" "}
            {ORE_MAX} ore de program. Aceeași oră suplimentară, cu același salariu, valorează mai
            mult într-o lună scurtă decât într-una lungă — pentru că salariul se împarte la mai
            puține ore. Calculatorul de aici folosește calendarul real al lunii alese, nu o medie.
          </p>

          <h2>Formula tarifului orar</h2>
          <p>
            Tot calculul pornește de aici, iar formula are un singur pas:
          </p>
          <p>
            <strong>tarif orar = salariul de bază brut ÷ orele de program normal ale lunii</strong>
          </p>
          <p>
            La un salariu de bază de 5.000 de lei în septembrie 2026, luna are 22 de zile
            lucrătoare, adică 176 de ore, deci tariful orar este 28,41 lei. Aceeași persoană, în
            ianuarie, are 144 de ore de program și un tarif orar de 34,72 lei — cu 22% mai mult, la
            același salariu. Ora suplimentară urmează tariful, așa că valorează și ea mai mult.
          </p>

          <h2>Cum se calculează sporul de noapte</h2>
          <p>
            Sporul de noapte se aplică la tariful orar, pentru orele efectiv prestate între{" "}
            {INTERVAL_NOAPTE}, și este de minimum {pct(COTA_MINIMA_NOAPTE)} din salariul de bază.
            Calculul unui spor de noapte are trei intrări: tariful orar, numărul de ore de noapte și
            cota. La 40 de ore de noapte și un tarif de 28,41 lei, sporul de noapte este 284 de lei
            brut, nu 1.420 — pentru că orele sunt deja plătite prin salariul lunar.
          </p>
          <p>
            Legea îi lasă însă angajatorului o alegere: art. 126 spune că salariatul de noapte
            beneficiază <em>fie</em> de program redus cu o oră fără scăderea salariului,{" "}
            <em>fie</em> de sporul de {pct(COTA_MINIMA_NOAPTE)}. Dacă primești program redus, sporul
            nu se mai cuvine din acest temei.
          </p>

          <h2>Ce nu intră în calcul</h2>
          <p>
            Sporurile stabilite prin contractul colectiv peste minimele legale — de condiții
            deosebite, de vechime, de fidelitate — nu sunt incluse, pentru că nu decurg din lege și
            diferă de la un angajator la altul. Poți însă ridica procentele din calculator dacă
            știi ce cotă îți dă contractul: câmpurile pornesc de la pragul legal, dar nu se pot
            coborî sub el.
          </p>
          <p>
            Temeiul complet:{" "}
            <a href={URL_COD_MUNCII} target="_blank" rel="noopener">
              Codul Muncii, art. 112, 122–126 și 142
            </a>
            .
          </p>
        </Prose>
      </Section>

      <Faq
        items={FAQ}
        companion={
          <CardCompanion
            titlu="Limitele muncii suplimentare"
            nota="Munca suplimentară nu poate depăși limitele din art. 114–115, cu excepția forței majore sau a lucrărilor urgente."
          >
            <Repere
              randuri={[
                ["Compensare preferată de lege", "ore libere plătite"],
                ["Plata cu spor", "doar dacă timpul liber nu e posibil"],
                ["Tinerii sub 18 ani", "nu pot presta muncă suplimentară"],
              ]}
            />
          </CardCompanion>
        }
      />

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
