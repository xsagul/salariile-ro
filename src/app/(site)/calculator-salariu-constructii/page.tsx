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
import { CardCompanion, Faq, PaginiConexe, Repere, Section } from "@/app/components/ui";
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

const TITLU = "Calculator salariu net construcții 2026: brut în net";
const DESC = `În construcții netul se calculează ca în restul economiei: la ${fmt(SALARIU_MINIM_CONSTRUCTII)} lei brut rămân ${fmt(LA_MINIM.netBani)} lei net, la 5.000 lei, ${fmt(LA_5000.netBani)} lei. Calcul brut-net și net-brut, 2026.`;

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: `https://salariile.ro${PATH}` },
  openGraph: ogPage({ title: TITLU, description: DESC, path: PATH }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const FAQ = [
  {
    q: "Cum se calculează salariul net în construcții în 2026?",
    a: `La fel ca pentru orice salariat: din brut se rețin CAS 25% și CASS 10%, apoi impozitul de 10% pe ce rămâne după deducerea personală. La 5.000 lei brut, în cazul standard, rămân ${fmt(LA_5000.netBani)} lei net. Singurul element specific domeniului este salariul de bază minim de ${fmt(SALARIU_MINIM_CONSTRUCTII)} lei brut.`,
  },
  {
    q: "Mai sunt angajații din construcții scutiți de impozit?",
    a: "Nu. Facilitățile fiscale pentru construcții au fost eliminate prin OUG 156/2024 începând cu veniturile lunii ianuarie 2025. Din acel moment se aplică aceleași cote ca în restul economiei: CAS 25%, CASS 10% și impozit pe venit 10%, iar angajatorul datorează CAM 2,25%.",
  },
  {
    q: "Cât este salariul net la minimul din construcții?",
    a: `La ${fmt(SALARIU_MINIM_CONSTRUCTII)} lei brut rămân ${fmt(LA_MINIM.netBani)} lei net în iulie-decembrie 2026, pentru funcția de bază și fără persoane în întreținere. Se rețin ${fmt(LA_MINIM.cas)} lei CAS, ${fmt(LA_MINIM.cass)} lei CASS și ${fmt(LA_MINIM.impozit)} lei impozit.`,
  },
  {
    q: "Ce salariu brut trebuie să cer ca să primesc 4.000 lei net în construcții?",
    a: `În cazul standard, 4.000 lei net corespund unui brut de ${fmt(PENTRU_4000_NET.brut)} lei. Angajatorul plătește în total ${fmt(PENTRU_4000_NET.costTotal)} lei, cu CAM inclus. Cu persoane în întreținere, brutul necesar scade puțin, fiindcă deducerea personală reduce impozitul.`,
  },
  {
    q: "Cât costă firma un angajat din construcții?",
    a: `Peste salariul brut, angajatorul plătește CAM 2,25%. La minimul sectorial de ${fmt(SALARIU_MINIM_CONSTRUCTII)} lei, costul total este ${fmt(LA_MINIM.costTotal)} lei pe lună. Tichetele de masă, dacă se acordă, se adaugă separat la cost.`,
  },
  {
    q: "Se aplică suma netaxabilă de 200 de lei în construcții?",
    a: `Nu la salariul de bază sectorial. Facilitatea din OUG 89/2025 cere ca salariul de bază să fie egal cu minimul general, adică ${fmt(SALARIU_MINIM)} lei în iulie-decembrie 2026, iar pragul din construcții este mai mare.`,
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
              Calculul pornește de la salariul de bază minim din construcții, {fmt(SALARIU_MINIM_CONSTRUCTII)} lei brut.
              Schimbă suma sau treci pe net în brut. Din 2025 nu mai există facilități pentru domeniu, deci se aplică
              CAS 25%, CASS 10% și impozit 10%, ca pentru orice salariat.
            </>
          }
        />
      </div>

      <Section
        wide
        companion={
          <CardCompanion
            titlu="Construcții · iulie-decembrie 2026"
            nota="Funcție de bază, normă întreagă, fără persoane în întreținere și fără tichete."
          >
            <Repere
              randuri={[
                ["Salariu de bază minim", `${fmt(SALARIU_MINIM_CONSTRUCTII)} lei`],
                ["Tarif orar mediu", `${TARIF_ORAR} lei`],
                ["Net la minim", `${fmt(LA_MINIM.netBani)} lei`],
                ["Cost firmă la minim", `${fmt(LA_MINIM.costTotal)} lei`],
                ["Minim general, pentru comparație", `${fmt(SALARIU_MINIM)} lei`],
              ]}
            />
          </CardCompanion>
        }
      >
        <h2 id="brut-in-net" className="scroll-mt-20">Salarii uzuale în construcții: brut în net</h2>
        <p>
          Tabelul pornește de la minimul sectorial și continuă cu sume rotunde, până la 10.000 lei brut.
          Netul este suma care intră în cont; costul firmei include CAM 2,25%.
        </p>
        <TabelArticol numeric>
          <thead>
            <tr>
              {/* Netul imediat după brut: pe mobil tabelul se derulează lateral,
                  iar răspunsul trebuie să încapă în primul ecran. */}
              <th scope="col">Brut</th>
              <th scope="col">Net</th>
              <th scope="col">CAS</th>
              <th scope="col">CASS</th>
              <th scope="col">Impozit</th>
              <th scope="col">Cost firmă</th>
            </tr>
          </thead>
          <tbody>
            {BRUT_IN_NET.map((rand) => (
              <tr key={rand.brut}>
                <th scope="row">{fmt(rand.brut)} lei</th>
                <td><strong>{fmt(rand.netBani)} lei</strong></td>
                <td>{fmt(rand.cas)}</td>
                <td>{fmt(rand.cass)}</td>
                <td>{fmt(rand.impozit)}</td>
                <td>{fmt(rand.costTotal)} lei</td>
              </tr>
            ))}
          </tbody>
        </TabelArticol>

        <h2 id="net-in-brut" className="scroll-mt-20">Cât brut corespunde netului promis</h2>
        <p>
          O ofertă se poate discuta în bani primiți în mână, dar contractul de muncă trece brutul, iar
          declarațiile către ANAF se fac pe brut. Pentru netul discutat, brutul din contract ar trebui să fie:
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
                <th scope="row">{fmt(rand.netDorit)} lei</th>
                <td><strong>{fmt(rand.brut)} lei</strong></td>
                <td>{fmt(rand.costTotal)} lei</td>
              </tr>
            ))}
          </tbody>
        </TabelArticol>
        <p className="source-note">
          Sume calculate de motorul fiscal al site-ului pentru iulie-decembrie 2026, rotunjite la leu ca în
          Declarația 112. Persoanele în întreținere, vârsta sub 26 de ani sau tichetele schimbă rezultatul: le
          poți adăuga în calculator.
        </p>
      </Section>

      <Section wide>
        <h2>Ce s-a schimbat pentru construcții din 2025</h2>
        <p>
          Până la sfârșitul lui 2024, salariații din construcții aveau un regim fiscal separat. OUG 156/2024 l-a
          eliminat începând cu veniturile lunii ianuarie 2025, așa că un calculator care aplică încă scutiri
          sectoriale dă astăzi un net prea mare. Pentru 2026, singura regulă proprie domeniului este pragul
          salariului de bază: <strong>{fmt(SALARIU_MINIM_CONSTRUCTII)} lei brut</strong> pentru normă întreagă,
          adică {TARIF_ORAR} lei pe oră.
        </p>
        <p>
          Pragul se aplică salariului de bază, nu venitului total: sporurile și primele se adaugă peste el. Pentru
          un contract cu timp parțial, minimul se stabilește proporțional cu orele lucrate. Cui i se aplică exact
          pragul și de ce netul la minim crește din iulie, deși brutul rămâne același, este explicat pe pagina{" "}
          <Link href="/salariu-minim-constructii-2026">salariul minim în construcții 2026</Link>.
        </p>
        <p>
          Dacă salariul are ore suplimentare sau spor de noapte, calculează întâi brutul lunii cu{" "}
          <Link href="/calculator-ore-suplimentare">calculatorul de ore suplimentare</Link>, apoi pune suma aici.
        </p>

        <h3>Surse oficiale</h3>
        <ul>
          <li>
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/293109" target="_blank" rel="noopener noreferrer">OUG 156/2024</a>{" "}
            · art. LXIX: salariul de bază minim în construcții; eliminarea facilităților sectoriale
          </li>
          <li>
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener noreferrer">Codul fiscal</a>{" "}
            · CAS, CASS, impozitul pe venit și deducerea personală
          </li>
          <li>
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener noreferrer">HG 146/2026</a>{" "}
            · minimul general de la 1 iulie, folosit în formula deducerii personale
          </li>
          <li>
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener noreferrer">OUG 89/2025</a>{" "}
            · condițiile sumei netaxabile de 200 de lei
          </li>
        </ul>
        <p className="source-note">Reguli verificate la 15 septembrie 2026.</p>
      </Section>

      <Faq items={FAQ} title="Întrebări despre salariul în construcții" />

      <PaginiConexe
        linkuri={[
          { href: "/salariu-minim-constructii-2026", label: "Salariul minim în construcții", descriere: "Pragul de 4.582 lei, tariful orar și cui se aplică." },
          { href: "/salarii/constructor", label: "Cât câștigă un muncitor în construcții", descriere: "Câștigul salarial din construcții, după datele INS." },
          { href: "/calculator-ore-suplimentare", label: "Ore suplimentare și spor de noapte", descriere: "Brutul lunii cu sporuri, înainte de calculul netului." },
          { href: "/", label: "Calculator salariu net", descriere: "Calculatorul general, pentru orice domeniu." },
        ]}
      />
    </>
  );
}
