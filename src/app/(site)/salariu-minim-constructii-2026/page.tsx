import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Breadcrumb, CtaCard, Faq, Formula, H1, Hero, Lead, Section } from "@/app/components/ui";
import { calculStandardCuRegim, SALARIU_MINIM_CONSTRUCTII } from "@/lib/fiscal";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";

// Titlul depășea 60 de caractere cu sufixul de brand, iar descrierea folosea jargon
// („S1", „S2") plus meta-limbaj despre pagină („cu taxe și surse"), nu răspunsul la
// întrebarea utilizatorului — motiv pentru care Google prefera meniul de navigație.
const TITLE = "Salariu minim construcții 2026 - 4.582 lei brut, 2.754 net";
const DESCRIPTION =
  "Salariul minim în construcții este 4.582 lei brut pe lună în 2026, adică 27,714 lei pe oră și 2.754 lei net din iulie. Cost total angajator: 4.685 lei.";
const PATH = "/salariu-minim-constructii-2026";
const MINIM_CONSTRUCTII = SALARIU_MINIM_CONSTRUCTII;
const TARIF_ORAR = "27,714";

type Regim = "2026-S1" | "2026-S2";

function calculStandard(brut: number, regim: Regim) {
  const rezultat = calculStandardCuRegim(brut, regim);
  if (!rezultat) throw new Error(`Calcul fiscal indisponibil pentru ${brut} lei, ${regim}`);
  return rezultat;
}

const CONSTRUCTII_S1 = calculStandard(MINIM_CONSTRUCTII, "2026-S1");
const CONSTRUCTII_S2 = calculStandard(MINIM_CONSTRUCTII, "2026-S2");
const GENERAL_S2 = calculStandard(4325, "2026-S2");

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

const FAQ = [
  {
    q: "Creșterea minimului general din iulie a schimbat minimul din construcții?",
    a: `Nu. Minimul general a urcat la 4.325 lei, dar pragul din construcții are o lege separată și a rămas ${fmt(MINIM_CONSTRUCTII)} lei brut tot anul.`,
  },
  {
    q: "Se aplică în construcții suma de 200 de lei netaxați?",
    a: "Nu la minimul din construcții. Scutirea e doar pentru cei plătiți exact cu salariul minim general, iar 4.582 lei e peste el.",
  },
  {
    q: "De ce a crescut netul din iulie, dacă brutul a rămas același?",
    a: `Pentru că deducerea personală se calculează din salariul minim general, care a crescut. Deducerea mai mare a scăzut impozitul, iar netul a urcat de la ${fmt(CONSTRUCTII_S1.netBani)} la ${fmt(CONSTRUCTII_S2.netBani)} lei.`,
  },
  {
    q: "Mai există scutirea de impozit în construcții?",
    a: "Nu, din ianuarie 2025. De atunci, salariile din construcții se taxează ca oricare altele. A rămas doar minimul mai mare.",
  },
];

export const metadata: Metadata = {
  // Absolut: cu sufixul „| Salariile" titlul ar trece de 60 de caractere și s-ar
  // trunchia în SERP exact peste cifra de net.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `https://salariile.ro${PATH}` },
  openGraph: ogPage({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: twPage({ title: TITLE, description: DESCRIPTION }),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Salariul minim 2026", item: "https://salariile.ro/salariu-minim" },
        { "@type": "ListItem", position: 3, name: "Salariul minim în construcții 2026", item: `https://salariile.ro${PATH}` },
      ],
    },
    {
      "@type": "Article",
      headline: "Salariul minim în construcții 2026: brut, net și tarif orar",
      description: DESCRIPTION,
      url: `https://salariile.ro${PATH}`,
      inLanguage: "ro-RO",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      datePublished: "2026-07-26",
      dateModified: PAGE_LAST_MODIFIED["/salariu-minim-constructii-2026"].toISOString().slice(0, 10),
      mainEntityOfPage: `https://salariile.ro${PATH}`,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function SalariuMinimConstructii2026Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb
          items={[
            { href: "/", label: "Acasă" },
            { href: "/salariu-minim", label: "Salariul minim 2026" },
            { label: "Construcții" },
          ]}
        />
        <H1>Salariul minim în construcții 2026</H1>
        <p className="mt-3 text-sm text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2">
          Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat {PAGE_LAST_MODIFIED[PATH].toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
        </p>
        <Lead>
          În construcții, salariul minim e <strong>{fmt(MINIM_CONSTRUCTII)} lei brut</strong> pe lună, mai mare decât
          minimul din restul economiei. În mână ajung <strong>{fmt(CONSTRUCTII_S2.netBani)} lei</strong>. Pe oră,
          minimul e {TARIF_ORAR} lei brut.
        </Lead>
      </Hero>

      <div>
        <Section noTopBorder>
          <h2>Cum se ajunge de la {fmt(MINIM_CONSTRUCTII)} la {fmt(CONSTRUCTII_S2.netBani)} lei</h2>
          <p>
            Din 2025, un salariu din construcții se taxează exact ca oricare altul. Din brut pleacă 25% pentru pensie,
            10% pentru sănătate și impozitul de 10%, calculat după deducerea personală:
          </p>
          <Formula
            eticheta={`Calculul netului la ${fmt(MINIM_CONSTRUCTII)} lei brut`}
            randuri={[
              `CAS     = ${fmt(MINIM_CONSTRUCTII)} × 25%          = ${fmt(CONSTRUCTII_S2.cas)}`,
              `CASS    = ${fmt(MINIM_CONSTRUCTII)} × 10%          = ${fmt(CONSTRUCTII_S2.cass)}`,
              `Impozit = 10%, după deducere     = ${fmt(CONSTRUCTII_S2.impozit)}`,
              `Net     = ${fmt(MINIM_CONSTRUCTII)} − ${fmt(CONSTRUCTII_S2.cas)} − ${fmt(CONSTRUCTII_S2.cass)} − ${fmt(CONSTRUCTII_S2.impozit)} = ${fmt(CONSTRUCTII_S2.netBani)} lei`,
            ]}
          />
          <p>
            Firma mai plătește peste brut 2,25% pentru asigurarea de muncă, așa că un muncitor la minim o costă{" "}
            {fmt(CONSTRUCTII_S2.costTotal)} de lei pe lună. Dacă ai persoane în întreținere, sub 26 de ani sau tichete,
            netul tău iese altfel: îl afli din <Link href="/calculator-salariu-constructii">calculatorul pentru construcții</Link>.
          </p>
        </Section>

        <Section>
          <h2>{fmt(MINIM_CONSTRUCTII - 4325)} de lei în plus la brut, doar {fmt(CONSTRUCTII_S2.netBani - GENERAL_S2.netBani)} în mână</h2>
          <p>
            Minimul din construcții e cu {fmt(MINIM_CONSTRUCTII - 4325)} de lei mai mare decât minimul general. Pe
            fluturaș, diferența se topește: în mână, un muncitor din construcții primește doar cu{" "}
            {fmt(CONSTRUCTII_S2.netBani - GENERAL_S2.netBani)} de lei mai mult.
          </p>
          <p>
            Motivul e scutirea de la salariul minim general: acolo, 200 de lei din brut nu se taxează deloc. În
            construcții, salariul e peste acel minim, așa că se taxează tot.
          </p>
        </Section>

        <Section>
          <h2>Cui i se aplică</h2>
          <p>
            Pragul e pentru firmele care au ca activitate construcțiile, în domeniile definite de legislația fiscală.
            Contează activitatea angajatorului, nu doar numele postului din contract.
          </p>
          <ul>
            <li>{fmt(MINIM_CONSTRUCTII)} lei e <strong>salariul de bază</strong>. Sporurile și primele vin peste el, nu intră în prag.</li>
            <li>{TARIF_ORAR} lei pe oră e o medie legală. Nu e un motiv ca salariul lunar să scadă în lunile cu mai puține ore.</li>
            <li>La part-time, salariul scade proporțional cu orele, dar nu sub tariful minim pe oră.</li>
          </ul>
        </Section>

        <Section>
          <h2>Surse oficiale</h2>
          <ul>
            <li>
              <a href="https://legislatie.just.ro/Public/DetaliiDocument/293109" target="_blank" rel="noopener">
                OUG 156/2024
              </a>
              , art. LXIX: minimul de {fmt(MINIM_CONSTRUCTII)} lei și tariful de {TARIF_ORAR} lei pe oră; eliminarea scutirilor
            </li>
            <li>
              <a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener">
                HG 146/2026
              </a>
              : minimul general de la 1 iulie
            </li>
            <li>
              <a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener">
                OUG 89/2025
              </a>
              : scutirea de 200 de lei de la minimul general
            </li>
            <li>
              <a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener">
                Codul Fiscal
              </a>
              : contribuții, impozit și deducerea personală
            </li>
            <li>
              <a href="https://reges.inspectiamuncii.ro/informatii-utile/informatii-salariati/salarizarea/" target="_blank" rel="noopener">
                Inspecția Muncii
              </a>
              : valorile minime publicate pentru salariați
            </li>
          </ul>
          <h3>Pagini conexe</h3>
          <ul>
            <li><Link href="/salariu-minim">Salariul minim general în 2026</Link></li>
            <li><Link href="/deducere-personala-2026">Deducerea personală 2026</Link></li>
            <li><Link href="/metodologie">Metodologia calculatorului brut-net</Link></li>
            <li><Link href="/noutati/salariul-minim-1-iulie-2026">Ce s-a schimbat la 1 iulie 2026</Link></li>
          </ul>
        </Section>

        <Faq items={FAQ} title="Întrebări despre salariul minim în construcții" />

        <CtaCard
          title="Calculează salariul tău exact"
          href="/calculator-salariu-constructii"
          label="Calculator salariu construcții"
        >
          Scrie brutul sau netul dorit și adaugă ce se aplică la tine: persoane în întreținere, tichete, vârsta.
          Calculul complet pentru {fmt(MINIM_CONSTRUCTII)} lei brut e și pe{" "}
          <Link href="/calculator/calcul-salariu-net-4582-brut">pagina lui separată</Link>.
        </CtaCard>
      </div>
    </>
  );
}
