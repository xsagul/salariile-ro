import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, CtaCard, Eyebrow, Faq, H1, Hero, Lead, Section } from "@/app/components/ui";
import { calculStandardCuRegim } from "@/lib/fiscal";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const TITLE = "Salariu minim construcții 2026: 4.582 lei brut";
const DESCRIPTION =
  "Salariul minim în construcții este 4.582 lei brut și 27,714 lei/oră în 2026. Calcul net: 2.739 lei în S1 și 2.754 lei în S2, cu taxe și surse.";
const PATH = "/salariu-minim-constructii-2026";
const MINIM_CONSTRUCTII = 4582;
const TARIF_ORAR = "27,714";

type Regim = "2026-S1" | "2026-S2";

function calculStandard(brut: number, regim: Regim) {
  const rezultat = calculStandardCuRegim(brut, regim);
  if (!rezultat) throw new Error(`Calcul fiscal indisponibil pentru ${brut} lei, ${regim}`);
  return rezultat;
}

const CONSTRUCTII_S1 = calculStandard(MINIM_CONSTRUCTII, "2026-S1");
const CONSTRUCTII_S2 = calculStandard(MINIM_CONSTRUCTII, "2026-S2");
const GENERAL_S1 = calculStandard(4050, "2026-S1");
const GENERAL_S2 = calculStandard(4325, "2026-S2");

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

const FAQ = [
  {
    q: "Cât este salariul minim în construcții în 2026?",
    a: "Salariul de bază minim brut în sectorul construcții este 4.582 lei pe lună în tot anul 2026. OUG 156/2024 indică și valoarea medie de 27,714 lei pe oră, pentru un program normal de lucru de 165,334 ore în medie pe lună.",
  },
  {
    q: "Cât este salariul net în construcții la minimul de 4.582 lei?",
    a: "În cazul standard — funcție de bază, fără persoane în întreținere, tichete, sporuri sau alte rețineri — netul este 2.739 lei în perioada ianuarie-iunie 2026 și 2.754 lei în perioada iulie-decembrie 2026.",
  },
  {
    q: "De ce crește netul din iulie dacă brutul rămâne 4.582 lei?",
    a: "Deducerea personală se raportează la salariul minim general, care crește de la 4.050 la 4.325 lei la 1 iulie. Pentru cazul standard de 4.582 lei brut, deducerea calculată crește de la 587 la 735 lei, iar impozitul scade de la 239 la 224 lei.",
  },
  {
    q: "Se aplică suma netaxabilă de 300 sau 200 lei în construcții?",
    a: "Nu în calculul salariului de bază sectorial de 4.582 lei. Facilitatea generală din OUG 89/2025 cere ca salariul de bază să fie egal cu salariul minim brut general aplicabil perioadei: 4.050 lei în semestrul I și 4.325 lei în semestrul al II-lea.",
  },
  {
    q: "Mai există scutiri fiscale pentru angajații din construcții?",
    a: "Nu. Facilitățile fiscale sectoriale au fost eliminate începând cu veniturile lunii ianuarie 2025 prin OUG 156/2024. Calculul folosește cotele standard: CAS 25%, CASS 10% și impozit pe venit 10%, plus CAM 2,25% datorată de angajator.",
  },
  {
    q: "Majorarea salariului minim general din iulie schimbă minimul din construcții?",
    a: "Nu. HG 146/2026 stabilește minimul general la 4.325 lei de la 1 iulie. Pragul sectorial de 4.582 lei rămâne reglementat distinct prin art. LXIX din OUG 156/2024.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
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
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      datePublished: "2026-07-26",
      dateModified: "2026-07-26",
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
        <p className="mt-3 text-sm text-stone-500 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2">
          Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat 26 iulie 2026
        </p>
        <Lead>
          În 2026, salariul de bază minim brut din construcții este <strong>{fmt(MINIM_CONSTRUCTII)} lei pe lună</strong>,
          adică <strong>{TARIF_ORAR} lei/oră</strong>. Brutul rămâne neschimbat tot anul; în cazul standard, netul este
          2.739 lei în semestrul I și 2.754 lei în semestrul al II-lea.
        </Lead>
        <Eyebrow>OUG 156/2024, art. LXIX · calcul standard fără facilități sectoriale</Eyebrow>
      </Hero>

      <div>
        <Section wide noTopBorder>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [`${fmt(MINIM_CONSTRUCTII)} lei`, "Brut lunar"],
              [`${TARIF_ORAR} lei`, "Tarif orar mediu"],
              [`${fmt(CONSTRUCTII_S2.netBani)} lei`, "Net iulie-decembrie"],
              [`${fmt(CONSTRUCTII_S2.costTotal)} lei`, "Cost total angajator"],
            ].map(([valoare, eticheta]) => (
              <div key={eticheta} className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
                <div className="text-3xl font-bold tabular-nums tracking-[-0.02em] text-stone-900">{valoare}</div>
                <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">{eticheta}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <h2>Calculul net în cele două semestre</h2>
          <p>
            Tabelul folosește cazul standard: contract cu normă întreagă, funcția de bază, fără persoane în întreținere,
            fără tichete, sporuri, prime sau alte rețineri. Contribuțiile și impozitul sunt rotunjite la leu, conform
            regulilor implementate în motorul fiscal și structurii Declarației 112.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Componentă</th>
                  <th className="text-right">Ianuarie-iunie</th>
                  <th className="text-right">Iulie-decembrie</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Salariu brut</td>
                  <td className="text-right">{fmt(MINIM_CONSTRUCTII)} lei</td>
                  <td className="text-right">{fmt(MINIM_CONSTRUCTII)} lei</td>
                </tr>
                <tr>
                  <td>Sumă netaxabilă OUG 89/2025</td>
                  <td className="text-right">{fmt(CONSTRUCTII_S1.facilitate)} lei</td>
                  <td className="text-right">{fmt(CONSTRUCTII_S2.facilitate)} lei</td>
                </tr>
                <tr>
                  <td>CAS 25%</td>
                  <td className="text-right">− {fmt(CONSTRUCTII_S1.cas)} lei</td>
                  <td className="text-right">− {fmt(CONSTRUCTII_S2.cas)} lei</td>
                </tr>
                <tr>
                  <td>CASS 10%</td>
                  <td className="text-right">− {fmt(CONSTRUCTII_S1.cass)} lei</td>
                  <td className="text-right">− {fmt(CONSTRUCTII_S2.cass)} lei</td>
                </tr>
                <tr>
                  <td>Deducere personală</td>
                  <td className="text-right">{fmt(CONSTRUCTII_S1.deducerePersonala)} lei</td>
                  <td className="text-right">{fmt(CONSTRUCTII_S2.deducerePersonala)} lei</td>
                </tr>
                <tr>
                  <td>Impozit pe venit 10%</td>
                  <td className="text-right">− {fmt(CONSTRUCTII_S1.impozit)} lei</td>
                  <td className="text-right">− {fmt(CONSTRUCTII_S2.impozit)} lei</td>
                </tr>
                <tr>
                  <td><strong>Salariu net</strong></td>
                  <td className="text-right"><strong>{fmt(CONSTRUCTII_S1.netBani)} lei</strong></td>
                  <td className="text-right"><strong>{fmt(CONSTRUCTII_S2.netBani)} lei</strong></td>
                </tr>
                <tr>
                  <td>CAM 2,25% — angajator</td>
                  <td className="text-right">{fmt(CONSTRUCTII_S1.cam)} lei</td>
                  <td className="text-right">{fmt(CONSTRUCTII_S2.cam)} lei</td>
                </tr>
                <tr>
                  <td><strong>Cost total angajator</strong></td>
                  <td className="text-right"><strong>{fmt(CONSTRUCTII_S1.costTotal)} lei</strong></td>
                  <td className="text-right"><strong>{fmt(CONSTRUCTII_S2.costTotal)} lei</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="source-note">
            Valoarea netă individuală poate diferi dacă există persoane în întreținere, deducere suplimentară pentru
            salariați sub 26 de ani sau copii școlarizați, tichete, sporuri ori alte elemente de salarizare.
          </p>
        </Section>

        <Section>
          <h2>De ce netul urcă cu 15 lei din iulie</h2>
          <p>
            Brutul sectorial rămâne {fmt(MINIM_CONSTRUCTII)} lei, iar CAS și CASS au aceleași valori în ambele semestre.
            Se schimbă însă salariul minim general folosit în formula deducerii personale: 4.050 lei până la 30 iunie și
            4.325 lei din 1 iulie.
          </p>
          <p>
            În cazul standard, deducerea personală crește de la <strong>{fmt(CONSTRUCTII_S1.deducerePersonala)} lei</strong> la{" "}
            <strong>{fmt(CONSTRUCTII_S2.deducerePersonala)} lei</strong>. Baza impozitului scade, iar impozitul trece de la{" "}
            {fmt(CONSTRUCTII_S1.impozit)} la {fmt(CONSTRUCTII_S2.impozit)} lei. Diferența de 15 lei se vede integral în net.
          </p>
          <p>
            Aceasta este <Link href="/deducere-personala-2026">deducerea personală</Link>, care reduce numai baza
            impozitului. Nu trebuie confundată cu suma netaxabilă de 300/200 lei din OUG 89/2025.
          </p>
        </Section>

        <Section>
          <h2>Construcții față de minimul general</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Perioadă</th>
                  <th className="text-right">General brut</th>
                  <th className="text-right">General net</th>
                  <th className="text-right">Construcții brut</th>
                  <th className="text-right">Construcții net</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ianuarie-iunie</td>
                  <td className="text-right">4.050 lei</td>
                  <td className="text-right">{fmt(GENERAL_S1.netBani)} lei</td>
                  <td className="text-right">{fmt(MINIM_CONSTRUCTII)} lei</td>
                  <td className="text-right"><strong>{fmt(CONSTRUCTII_S1.netBani)} lei</strong></td>
                </tr>
                <tr>
                  <td>Iulie-decembrie</td>
                  <td className="text-right">4.325 lei</td>
                  <td className="text-right">{fmt(GENERAL_S2.netBani)} lei</td>
                  <td className="text-right">{fmt(MINIM_CONSTRUCTII)} lei</td>
                  <td className="text-right"><strong>{fmt(CONSTRUCTII_S2.netBani)} lei</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            În semestrul al II-lea, diferența de brut față de minimul general este 257 lei, dar diferența de net standard
            este 55 lei. Explicația este fiscală: salariatul de la minimul general eligibil primește facilitatea de 200 lei,
            în timp ce calculul la 4.582 lei folosește baza integrală pentru CAS și CASS.
          </p>
        </Section>

        <Section>
          <h2>Cui i se aplică pragul de 4.582 lei</h2>
          <p>
            Art. LXIX din OUG 156/2024 stabilește pragul pentru sectorul construcții, prin derogare de la minimul general.
            Încadrarea concretă a angajatorului și a activității trebuie verificată în raport cu domeniile definite de
            legislația fiscală; simpla denumire a postului nu stabilește singură aplicarea pragului sectorial.
          </p>
          <ul>
            <li>4.582 lei reprezintă <strong>salariul de bază</strong>; sporurile, indemnizațiile și alte adaosuri nu intră în acest prag.</li>
            <li>27,714 lei/oră este valoarea medie legală pentru 165,334 ore pe lună, nu un motiv pentru diminuarea salariului lunar în lunile cu alt număr de ore.</li>
            <li>Pentru un contract cu timp parțial, salariul se stabilește proporțional cu timpul lucrat, cu respectarea tarifului minim aplicabil.</li>
          </ul>
        </Section>

        <Section>
          <h2>Taxele din construcții după 1 ianuarie 2025</h2>
          <p>
            Facilitățile fiscale sectoriale au fost eliminate prin OUG 156/2024 începând cu veniturile lunii ianuarie 2025.
            Salariații din construcții nu mai au scutirea de impozit și reducerile sectoriale folosite în anii anteriori.
          </p>
          <p>
            Pentru cazul standard din 2026 se aplică CAS 25%, CASS 10% și impozit pe venit 10%, iar angajatorul datorează
            CAM 2,25%. Deducerea personală poate reduce baza impozitului în funcție de venitul brut și situația salariatului,
            dar nu reduce CAS sau CASS.
          </p>
        </Section>

        <Section>
          <h2>Surse oficiale</h2>
          <ul>
            <li>
              <a href="https://legislatie.just.ro/Public/DetaliiDocument/293109" target="_blank" rel="noopener">
                OUG 156/2024
              </a>{" "}
              · art. LXIX: 4.582 lei lunar și 27,714 lei/oră; eliminarea facilităților sectoriale
            </li>
            <li>
              <a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener">
                HG 146/2026
              </a>{" "}
              · majorarea minimului general de la 1 iulie; pragul din construcții are temei separat
            </li>
            <li>
              <a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener">
                OUG 89/2025
              </a>{" "}
              · condițiile facilității generale de 300/200 lei
            </li>
            <li>
              <a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener">
                Codul Fiscal
              </a>{" "}
              · contribuții, impozit și deducere personală
            </li>
            <li>
              <a href="https://reges.inspectiamuncii.ro/informatii-utile/informatii-salariati/salarizarea/" target="_blank" rel="noopener">
                Inspecția Muncii — salarizarea
              </a>{" "}
              · valorile minime publicate pentru salariați
            </li>
          </ul>
          <h3>Pagini conexe</h3>
          <ul>
            <li><Link href="/salariu-minim">Salariul minim general în 2026</Link></li>
            <li><Link href="/deducere-personala-2026">Deducerea personală 2026</Link></li>
            <li><Link href="/metodologie">Metodologia calculatorului brut-net</Link></li>
            <li><Link href="/noutati/salariul-minim-1-iulie-2026">Ce s-a schimbat la 1 iulie 2026</Link></li>
          </ul>
          <p className="source-note">Calculele sunt pentru regimurile fiscale 2026-S1 și 2026-S2. Pagina a fost actualizată la 26 iulie 2026.</p>
        </Section>

        <Faq items={FAQ} title="Întrebări despre salariul minim în construcții" />

        <CtaCard
          title="Calculează salariul tău exact"
          href="/calculator/calcul-salariu-net-4582-brut"
          label="Vezi calculul pentru 4.582 lei brut"
        >
          Introdu 4.582 lei sau orice alt salariu brut și adaugă persoanele în întreținere, tichetele și opțiunile care se
          aplică situației tale.
        </CtaCard>
      </div>
    </>
  );
}
