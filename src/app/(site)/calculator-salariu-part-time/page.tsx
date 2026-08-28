import type { Metadata } from "next";
import CalculatorPartTime from "@/app/components/CalculatorPartTime";
import { Breadcrumb, CardCompanion, Faq, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import TabelArticol from "@/app/components/TabelArticol";
import {
  calculeazaPartTime,
  salariuMinimPartTime,
  type InputState,
} from "@/lib/fiscal";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const PATH = "/calculator-salariu-part-time";
const TITLU = "Calculator salariu part-time 2026: net și cost firmă";
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
    a: `La minimul proporțional pentru 4 ore pe zi, rezultatul standard este ${fmt(scenariu4h.faraExceptie.netBani)} lei net. Calculul presupune funcția de bază, o lună completă și zero persoane în întreținere.`,
  },
  {
    q: "Cât costă firma un contract de 4 ore?",
    a: `Fără excepție de la baza minimă CAS/CASS, costul total este ${fmt(scenariu4h.faraExceptie.costTotalCuDiferente)} lei. Cu o excepție legală documentată, costul este ${fmt(scenariu4h.cuExceptie.costTotalCuDiferente)} lei. Diferența nu schimbă netul angajatului.`,
  },
  {
    q: "Cine plătește diferența CAS și CASS la part-time?",
    a: "Angajatorul suportă diferența dintre contribuțiile calculate la venitul realizat și nivelul minim prevăzut de Codul fiscal. Diferența se plătește în numele angajatului și nu se reține încă o dată din salariul net.",
  },
  {
    q: "Cine este exceptat de la baza minimă a contribuțiilor?",
    a: "Codul fiscal prevede excepții pentru elevi sau studenți de până la 26 de ani, ucenici de până la 18 ani, anumite persoane cu dizabilități, pensionari pentru limită de vârstă și persoane cu mai multe contracte care cumulează cel puțin salariul minim. Excepția trebuie justificată cu documentele cerute.",
  },
  {
    q: "Excepția de student schimbă salariul net?",
    a: "Excepția de la baza minimă schimbă costul angajatorului, nu formula contribuțiilor reținute din brutul angajatului. Deducerea suplimentară pentru persoanele sub 26 de ani este o regulă separată și se aplică numai dacă sunt îndeplinite propriile condiții.",
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
      name: "Salariile.ro",
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
          Alege câte ore are contractul și vezi netul angajatului, costul firmei și
          diferența de CAS și CASS pe care angajatorul o suportă separat când brutul
          e sub baza minimă. Fiecare linie arată cine plătește ce.
        </Lead>
      </Hero>

      <CalculatorPartTime />

      <Section wide>
        <div className="md:grid md:grid-cols-5 md:gap-6">
          <Prose className="min-w-0 md:col-span-3">
            <h2>Salariul la 2, 4 și 6 ore</h2>
            <p>
              Brutul minim scade proporțional cu timpul din contract. Netul nu scade exact în aceeași proporție,
              deoarece deducerea personală se calculează după propriile reguli. Costul firmei urmează încă o regulă:
              dacă nu există o excepție, angajatorul completează CAS și CASS până la baza minimă a lunii.
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
                  <tr key={scenariu.ore}>
                    <th scope="row">{scenariu.ore} ore/zi</th>
                    <td>{fmt(scenariu.brut)} lei</td>
                    <td><strong>{fmt(scenariu.faraExceptie.netBani)} lei</strong></td>
                    <td>{fmt(scenariu.faraExceptie.costTotalCuDiferente)} lei</td>
                    <td>{fmt(scenariu.cuExceptie.costTotalCuDiferente)} lei</td>
                  </tr>
                ))}
              </tbody>
            </TabelArticol>
            <p className="source-note">
              Scenarii pentru iulie–decembrie 2026, contract activ toată luna, funcție de bază, fără persoane în
              întreținere. Sumele sunt calculate de motorul fiscal al site-ului și rotunjite la leu.
            </p>

            <h2>De ce firma plătește mai mult decât brutul plus CAM</h2>
            <p>
              Angajatului i se rețin CAS și CASS la venitul realizat. Separat, art. 146 alin. (5^6) și art. 168
              alin. (6^1) din Codul fiscal cer un nivel minim al contribuțiilor pentru contractele cu venit sub prag.
              Art. 146 alin. (5^9) pune diferența în sarcina angajatorului.
            </p>
            <p>
              Pentru perioada curentă, OUG 89/2025 reduce reperul folosit la această regulă cu suma stabilită pentru
              semestrul al doilea. Reducerea bazei minime și facilitatea contractului full-time sunt mecanisme juridice
              diferite. Un contract part-time nu primește automat facilitatea rezervată normei întregi.
            </p>

            <h2>Excepția trebuie dovedită, nu doar bifată</h2>
            <p>
              Selectorul din calculator arată efectul unei excepții, dar nu decide dacă ești eligibil. Pentru contracte
              multiple, procedura este stabilită prin Ordinul MF 1.855/2022 și implică o declarație pe propria răspundere.
              Pentru celelalte categorii, angajatorul păstrează documentele justificative potrivite situației.
            </p>
          </Prose>

          <aside className="min-w-0 md:col-span-2">
            <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6">
              <h2 className="text-lg font-bold tracking-[-0.02em] text-stone-900">Surse oficiale</h2>
              <ul className="mt-4 space-y-3 text-sm leading-normal text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2">
                <li><a href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/308231" target="_blank" rel="noopener noreferrer">HG 146/2026</a> — salariul minim și media de ore</li>
                <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener noreferrer">OUG 89/2025</a> — reducerea bazei minime în 2026</li>
                <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/291539" target="_blank" rel="noopener noreferrer">Codul fiscal consolidat</a> — art. 146 și 168</li>
                <li><a href="https://static.anaf.ro/static/10/Anaf/legislatie/OPANAF_605_2026.pdf" target="_blank" rel="noopener noreferrer">Instrucțiunile D112 din 2026</a> — câmpurile diferențelor suportate de firmă</li>
                <li><a href="https://legislatie.just.ro/public/DetaliiDocument/258471" target="_blank" rel="noopener noreferrer">Ordinul MF 1.855/2022</a> — procedura pentru mai multe contracte</li>
              </ul>
              <p className="mt-5 text-xs leading-normal text-stone-600">
                Calculatorul acoperă o lună completă. Pentru un contract început sau încheiat în cursul lunii, baza
                minimă se ajustează după zilele în care contractul a fost activ.
              </p>
              <p className="mt-4 text-xs text-stone-600">
                Reguli verificate la 28 august 2026.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <Faq
        items={FAQ}
        companion={
          <CardCompanion
            titlu="Baza minimă de contribuții · 2026"
            nota="Diferența o suportă firma, peste brut. Nu se scade din netul angajatului."
          >
            <Repere
              randuri={[
                ["Salariu minim, normă întreagă", "4.325 lei"],
                ["Reducere OUG 89/2025", "− 200 lei"],
                ["Bază minimă CAS și CASS", "4.125 lei"],
                ["Minim proporțional, 2 ore", `${fmt(SCENARII[0].brut)} lei`],
                ["Minim proporțional, 4 ore", `${fmt(SCENARII[1].brut)} lei`],
                ["Minim proporțional, 6 ore", `${fmt(SCENARII[2].brut)} lei`],
              ]}
            />
          </CardCompanion>
        }
      />

      <PaginiConexe
        linkuri={[
          { href: "/", label: "Calculator salariu net", descriere: "Calcul complet brut–net, tichete, deduceri și fluturaș PDF." },
          { href: "/salariu-minim", label: "Salariul minim 2026", descriere: "Brut, net, tarif orar și regulile aplicabile din iulie." },
          { href: "/deducere-personala-2026", label: "Deducerea personală", descriere: "Cum schimbă persoanele în întreținere și vârsta netul lunar." },
          { href: "/metodologie", label: "Metodologia de calcul", descriere: "Formule, rotunjiri și validarea în Declarația 112." },
        ]}
      />
    </>
  );
}
