import type { Metadata } from "next";
import CalculatorPartTime from "@/app/components/CalculatorPartTime";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Repere, Section } from "@/app/components/ui";
import TabelArticol from "@/app/components/TabelArticol";
import {
  calculeazaPartTime,
  salariuMinimPartTime,
  type InputState,
} from "@/lib/fiscal";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const PATH = "/calculator-salariu-part-time";
const TITLU = "Calculator salariu part-time 2026 - Vezi net și ore";
const DESC =
  "Calculează salariul net și costul firmei pentru un contract part-time de 2, 4 sau 6 ore, inclusiv diferența CAS/CASS și excepțiile legale.";
const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: `https://salariile.ro${PATH}` },
  openGraph: ogPage({ title: TITLU, description: DESC, path: PATH }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const inputPentru = (brut: number): InputState => ({
  brut: String(brut),
  tichete: "0",
  functieDeBAza: true,
  persoanePretretinere: 0,
  varstaSub26: false,
  copiiScolarizati: 0,
  scutitImpozit: false,
  normaContract: "partiala",
});

const SCENARII = [2, 4, 6].map((ore) => {
  const brut = salariuMinimPartTime(ore);
  const faraExceptie = calculeazaPartTime(inputPentru(brut), { orePeZi: ore, exceptatBazaMinima: false });
  const cuExceptie = calculeazaPartTime(inputPentru(brut), { orePeZi: ore, exceptatBazaMinima: true });
  if (!faraExceptie || !cuExceptie) throw new Error(`Calcul part-time invalid pentru ${ore} ore.`);
  return { ore, brut, faraExceptie, cuExceptie };
});

const scenariu4h = SCENARII.find((scenariu) => scenariu.ore === 4)!;

const FAQ = [
  {
    q: "Cât este salariul net la 4 ore în 2026?",
    a: `${fmt(scenariu4h.faraExceptie.netBani)} lei net, din ${fmt(scenariu4h.brut)} lei brut, cât e minimul pentru 4 ore pe zi. Calculul presupune că e locul de muncă de bază și că nu ai persoane în întreținere.`,
  },
  {
    q: "Cine nu intră la regula bazei minime?",
    a: "Elevii și studenții de până la 26 de ani, ucenicii de până la 18 ani, unele persoane cu dizabilități, pensionarii pentru limită de vârstă și cei care strâng cel puțin salariul minim din mai multe contracte. Pentru ei, firma nu mai completează contribuțiile, dar excepția trebuie dovedită cu acte.",
  },
  {
    q: "Dacă sunt student, primesc mai mult în mână?",
    a: "Nu din cauza excepției. Ea scade doar costul firmei. Netul tău poate crește din alt motiv: deducerea în plus pentru cei sub 26 de ani, dacă îndeplinești condițiile ei.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Calculator salariu part-time", item: `https://salariile.ro${PATH}` },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: `https://salariile.ro${PATH}`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      description: DESC,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
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
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator salariu part-time" }]} />
        <H1>Calculator salariu part-time 2026</H1>
        <Lead>
          Alege câte ore pe zi scrie în contract și vezi cât primești în mână și cât plătește firma.
        </Lead>
      </Hero>

      <CalculatorPartTime />

      <Section
        companion={
          <CardCompanion
            titlu="Baza minimă pentru contribuții"
            nota="Pentru o lună întreagă. La un contract început în cursul lunii, baza scade proporțional cu zilele."
          >
            <Repere
              randuri={[
                ["Salariul minim", "4.325 lei"],
                ["Minus suma scăzută", "− 200 lei"],
                ["Baza minimă", "4.125 lei"],
              ]}
            />
          </CardCompanion>
        }
      >
        <h2 id="scenarii-part-time" className="scroll-mt-20">Salariul la 2, 4 și 6 ore</h2>
        <p>
          Brutul minim scade proporțional cu orele. Netul scade ceva mai puțin, pentru că deducerea personală nu se
          micșorează odată cu programul.
        </p>
        <TabelArticol numeric>
          <thead>
            <tr>
              <th scope="col">Program</th>
              <th scope="col">Brut minim</th>
              <th scope="col">Net</th>
              <th scope="col">Cost fără excepție</th>
              <th scope="col">Cost cu excepție</th>
            </tr>
          </thead>
          <tbody>
            {SCENARII.map((scenariu) => (
              <tr key={scenariu.ore} id={`scenariu-${scenariu.ore}-ore`} className="scroll-mt-20">
                <th scope="row">
                  <a href={`#scenariu-${scenariu.ore}-ore`} className="hover:underline">
                    {scenariu.ore} ore/zi
                  </a>
                </th>
                <td>{fmt(scenariu.brut)} lei</td>
                <td><strong>{fmt(scenariu.faraExceptie.netBani)} lei</strong></td>
                <td>{fmt(scenariu.faraExceptie.costTotalCuDiferente)} lei</td>
                <td>{fmt(scenariu.cuExceptie.costTotalCuDiferente)} lei</td>
              </tr>
            ))}
          </tbody>
        </TabelArticol>
        <p className="source-note">
          Pentru o lună întreagă, la locul de muncă de bază, fără persoane în întreținere. „Cu excepție” înseamnă un
          angajat scutit de regula bazei minime, explicată mai jos.
        </p>

        <h2>Cum se calculează</h2>
        <p>
          Tu plătești taxele obișnuite, doar pe salariul tău. Legea cere însă ca pentru orice contract să ajungă la
          stat contribuții de pensie și sănătate cel puțin cât pentru un salariu minim. Diferența o pune firma, peste
          brut, și nu se scade din banii tăi.
        </p>
        <Formula
          eticheta="Calculul unui salariu part-time"
          randuri={[
            "Brut minim   = salariul minim × ore pe zi ÷ 8",
            "Net          = brut − CAS − CASS − impozit",
            "Diferență    = contribuțiile la baza minimă − cele reținute",
            "Cost firmă   = brut + CAM + diferență",
          ]}
        />
        <p>
          Cei 200 de lei netaxați de la salariul minim nu se dau la part-time: sunt doar pentru norma întreagă.
          Pentru regula bazei minime, legea scade însă tot 200 de lei din minim.
        </p>

        <h2>Excepția se dovedește cu acte</h2>
        <p>
          Butonul pentru excepție din calculator îți arată doar efectul ei. Dacă ai dreptul la ea o decide situația
          ta: cine are mai multe contracte dă o declarație pe propria răspundere, iar pentru celelalte cazuri
          angajatorul păstrează actele care o dovedesc.
        </p>
      </Section>

      <Faq
        items={FAQ}
        companion={
          <CardCompanion titlu="Surse oficiale">
            <ul className="space-y-3 text-sm leading-normal text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2">
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/308231" target="_blank" rel="noopener noreferrer">HG 146/2026</a>: salariul minim și media de ore</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener noreferrer">OUG 89/2025</a>: suma scăzută din baza minimă</li>
              <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/291539" target="_blank" rel="noopener noreferrer">Codul fiscal</a>, art. 146 și 168: baza minimă și cine plătește diferența</li>
              <li><a href="https://static.anaf.ro/static/10/Anaf/legislatie/OPANAF_605_2026.pdf" target="_blank" rel="noopener noreferrer">Instrucțiunile D112 din 2026</a>: diferențele plătite de firmă</li>
              <li><a href="https://legislatie.just.ro/public/DetaliiDocument/258471" target="_blank" rel="noopener noreferrer">Ordinul MF 1.855/2022</a>: procedura pentru mai multe contracte</li>
            </ul>
          </CardCompanion>
        }
      />

      <PaginiConexe
        linkuri={[
          { href: "/", label: "Calculator salariu net", descriere: "Brut în net pentru orice salariu, cu tichete și fluturaș PDF." },
          { href: "/salariu-minim", label: "Salariul minim 2026", descriere: "Cât e minimul, pe lună și pe oră." },
          { href: "/deducere-personala-2026", label: "Deducerea personală", descriere: "Cât îți mărește netul fiecare persoană în întreținere." },
          { href: "/metodologie", label: "Metodologia de calcul", descriere: "Formulele complete și cum le verificăm." },
        ]}
      />
    </>
  );
}
