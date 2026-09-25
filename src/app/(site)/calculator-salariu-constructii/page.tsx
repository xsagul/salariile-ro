// Calculatorul de salariu pentru construcții.
//
// De ce există, deși formula e cea standard: măsurat pe 15 septembrie 2026 în SE
// Ranking și în Google, familia „calculator salariu (net) construcții" are ~2.900
// de căutări lunare pe nouă variante, iar primele zece rezultate sunt aproape
// numai calculatoare dedicate. Noi apăream abia pe pagina a doua, cu homepage-ul,
// iar rezumatul AI din SERP dădea un net greșit (~2.680 lei la minimul sectorial).
// Pagina răspunde exact întrebării: calculul e cel standard, pornit de la pragul
// sectorial. `/salariu-minim-constructii-2026` rămâne proprietarul cifrei minime.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import { CardCompanion, Faq, Formula, PaginiConexe, Section } from "@/app/components/ui";
import TabelArticol from "@/app/components/TabelArticol";
import {
  brutDinNetStandardCuRegim,
  calculStandardCuRegim,
  REGIM_FISCAL_CURENT,
  SALARIU_MINIM,
  SALARIU_MINIM_CONSTRUCTII,
  TARIF_ORAR_MINIM_CONSTRUCTII,
} from "@/lib/fiscal";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";

const PATH = "/calculator-salariu-constructii";
const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
const TARIF_ORAR = new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 3 }).format(TARIF_ORAR_MINIM_CONSTRUCTII);

function calcul(brut: number) {
  const rezultat = calculStandardCuRegim(brut, REGIM_FISCAL_CURENT);
  if (!rezultat) throw new Error(`Calcul fiscal indisponibil pentru ${brut} lei brut`);
  return { brut, ...rezultat };
}

const LA_MINIM = calcul(SALARIU_MINIM_CONSTRUCTII);
const LA_5000 = calcul(5000);

const BRUT_IN_NET = [SALARIU_MINIM_CONSTRUCTII, 5000, 5500, 6000, 7000, 8000, 10000].map(calcul);

// Neturile uzuale din anunțurile de construcții. Brutul rezultat trebuie să rămână
// peste pragul sectorial, altfel rândul ar descrie un contract ilegal în domeniu.
const NET_IN_BRUT = [3000, 3500, 4000, 4500, 5000, 6000].map((net) => {
  const brut = brutDinNetStandardCuRegim(net, REGIM_FISCAL_CURENT);
  if (brut < SALARIU_MINIM_CONSTRUCTII) throw new Error(`${net} lei net cere ${brut} lei brut, sub pragul sectorial`);
  return { netDorit: net, ...calcul(brut) };
});
const PENTRU_4000_NET = NET_IN_BRUT.find((rand) => rand.netDorit === 4000)!;

const TITLU = "Calculator Salariu Construcții 2026 - Brut în net și invers";
const DESC = `În construcții netul se calculează ca în restul economiei: la ${fmt(SALARIU_MINIM_CONSTRUCTII)} lei brut rămân ${fmt(LA_MINIM.netBani)} lei net, la 5.000 lei, ${fmt(LA_5000.netBani)} lei. Calcul brut-net și invers, 2026.`;

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: `https://salariile.ro${PATH}` },
  openGraph: ogPage({ title: TITLU, description: DESC, path: PATH }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const FAQ = [
  {
    q: "Mai sunt angajații din construcții scutiți de impozit?",
    a: "Nu, din ianuarie 2025. De atunci, salariile din construcții se taxează ca oricare altele. A rămas doar un salariu minim mai mare.",
  },
  {
    q: "Ce brut să cer ca să primesc 4.000 de lei net?",
    a: `${fmt(PENTRU_4000_NET.brut)} lei brut, dacă nu ai persoane în întreținere. Firma plătește în total ${fmt(PENTRU_4000_NET.costTotal)} lei. Cu persoane în întreținere, brutul necesar scade puțin.`,
  },
  {
    q: "Se aplică în construcții suma de 200 de lei netaxați?",
    a: `Nu. Scutirea e doar pentru cine are exact salariul minim general, de ${fmt(SALARIU_MINIM)} lei, iar minimul din construcții e mai mare.`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Calculator salariu construcții", item: `https://salariile.ro${PATH}` },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Calculator salariu construcții 2026",
      url: `https://salariile.ro${PATH}`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      description: DESC,
      author: personSchema,
    },
    {
      "@type": "WebPage",
      url: `https://salariile.ro${PATH}`,
      name: TITLU,
      inLanguage: "ro",
      dateModified: PAGE_LAST_MODIFIED[PATH].toISOString().slice(0, 10),
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

export default function CalculatorSalariuConstructiiPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <CalculatorSalariu
          brutInitial={String(SALARIU_MINIM_CONSTRUCTII)}
          titluCustom={<>Calculator salariu construcții 2026</>}
          subtitluCustom={
            <>
              Scrie brutul și vezi cât primești în mână, sau pornește de la net și află ce brut să ceri.
            </>
          }
        />
      </div>

      <Section
        wide
        companion={
          <CardCompanion titlu="Ce s-a schimbat din 2025">
            <p className="text-sm text-stone-600">
              Până în 2024, salariații din construcții nu plăteau impozit și aveau contribuții mai mici. Din ianuarie
              2025, scutirile au dispărut (OUG 156/2024). A rămas o singură regulă proprie domeniului: un salariu
              minim mai mare, de <strong className="font-semibold text-stone-900">{fmt(SALARIU_MINIM_CONSTRUCTII)} lei brut</strong>,
              adică {TARIF_ORAR} lei pe oră.
            </p>
            <p className="mt-3 text-sm text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2">
              Cui i se aplică pragul e explicat pe pagina{" "}
              <Link href="/salariu-minim-constructii-2026">salariul minim în construcții</Link>.
            </p>
          </CardCompanion>
        }
      >
        <h2 id="cum-se-calculeaza" className="scroll-mt-20">Cum se calculează</h2>
        <p>
          Exact ca orice salariu. Din brut se opresc 25% pentru pensie și 10% pentru sănătate, apoi impozitul de 10%
          pe ce rămâne, după deducerea personală:
        </p>
        <Formula
          eticheta="Formula salariului net"
          randuri={[
            "CAS     = brut × 25%",
            "CASS    = brut × 10%",
            "Impozit = (brut − CAS − CASS − deducere) × 10%",
            "Net     = brut − CAS − CASS − impozit",
          ]}
        />
        <p>
          La minimul din construcții, asta înseamnă {fmt(LA_MINIM.netBani)} lei în mână. Dacă ai ore suplimentare sau
          spor de noapte, află întâi brutul lunii cu{" "}
          <Link href="/calculator-ore-suplimentare">calculatorul de ore suplimentare</Link>, apoi pune suma aici.
        </p>

        <h2 id="brut-in-net" className="scroll-mt-20">Salarii uzuale în construcții</h2>
        <TabelArticol numeric>
          <thead>
            <tr>
              <th scope="col">Brut</th>
              <th scope="col">Net în mână</th>
              <th scope="col">Cost firmă</th>
            </tr>
          </thead>
          <tbody>
            {BRUT_IN_NET.map((rand) => (
              <tr key={rand.brut}>
                <th scope="row">{fmt(rand.brut)}&nbsp;lei</th>
                <td><strong>{fmt(rand.netBani)}&nbsp;lei</strong></td>
                <td>{fmt(rand.costTotal)}&nbsp;lei</td>
              </tr>
            ))}
          </tbody>
        </TabelArticol>

        <h2 id="net-in-brut" className="scroll-mt-20">Ce brut să ceri pentru netul promis</h2>
        <p>
          Oferta se discută des în bani „în mână”, dar în contract se trece brutul. Pentru netul discutat, brutul
          din contract ar trebui să fie:
        </p>
        <TabelArticol numeric>
          <thead>
            <tr>
              <th scope="col">Net dorit</th>
              <th scope="col">Brut în contract</th>
              <th scope="col">Cost firmă</th>
            </tr>
          </thead>
          <tbody>
            {NET_IN_BRUT.map((rand) => (
              <tr key={rand.netDorit}>
                <th scope="row">{fmt(rand.netDorit)}&nbsp;lei</th>
                <td><strong>{fmt(rand.brut)}&nbsp;lei</strong></td>
                <td>{fmt(rand.costTotal)}&nbsp;lei</td>
              </tr>
            ))}
          </tbody>
        </TabelArticol>
        <p className="source-note">
          Fără persoane în întreținere și fără tichete, la locul de muncă de bază. Surse:{" "}
          <a href="https://legislatie.just.ro/Public/DetaliiDocument/293109" target="_blank" rel="noopener noreferrer">OUG 156/2024</a>,{" "}
          <a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener noreferrer">Codul fiscal</a>,{" "}
          <a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener noreferrer">HG 146/2026</a>,{" "}
          <a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener noreferrer">OUG 89/2025</a>.
        </p>
      </Section>

      <Faq items={FAQ} title="Întrebări despre salariul în construcții" />

      <PaginiConexe
        linkuri={[
          { href: "/salariu-minim-constructii-2026", label: "Salariul minim în construcții", descriere: "Cât e minimul și cui se aplică." },
          { href: "/salarii/constructor", label: "Cât câștigă un muncitor în construcții", descriere: "Câștigul salarial din construcții, după datele INS." },
          { href: "/calculator-ore-suplimentare", label: "Ore suplimentare și spor de noapte", descriere: "Brutul lunii cu sporuri, înainte de calculul netului." },
          { href: "/", label: "Calculator salariu net", descriere: "Calculatorul general, pentru orice domeniu." },
        ]}
      />
    </>
  );
}
