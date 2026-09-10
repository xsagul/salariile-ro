// app/calculator-salariu-invatamant/page.tsx
// Calculator salariu învățământ preuniversitar — Legea 153/2017, Anexa I, cap. I.
//
// De ce pagina asta există: „calculator salariu învățământ" e cel mai mare gol
// de acoperire față de paylab (16.200 volum cumulat, ei pe poziția 13 și 18).
// Vezi GOL-KEYWORDS-PAYLAB-2026-08-28.md.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Breadcrumb, CardCompanion, Faq, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import CalculatorInvatamant from "@/app/components/CalculatorInvatamant";
import GrilaInvatamant from "@/app/components/GrilaInvatamant";
import { GRILA, SURSA_GRILA, GRADATII, calculeazaInvatamantComplet, INDEMNIZATIE_HRANA, INDEMNIZATIE_DOCTORAT_2026, MAJORARI } from "@/lib/invatamant";

const TITLU = "Calculator salariu învățământ 2026: net și grilă";
const DESC =
  "Calculator salariu învățământ 2026 cu gradație, dirigenție și net. Consultă grila de salarizare pe funcții, studii și vechime sau descarcă tabelul CSV.";

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: "https://salariile.ro/calculator-salariu-invatamant" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/calculator-salariu-invatamant" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const MIN_GRILA = Math.min(...GRILA.map((g) => g.iun2024));
const MAX_GRILA = Math.max(...GRILA.map((g) => g.iun2024));
const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
const EXEMPLE = [
  { label: "Profesor, studii superioare, grad I, peste 25 de ani în învățământ și în muncă, cu dirigenție", href: "/salarii/profesor", input: { functie: 1, vechimeInvatamant: "peste 25 ani", aniMunca: 26, majorari: ["dirigentie"] } },
  { label: "Învățător, studii liceale, grad I, 10–15 ani în învățământ și 12 ani în muncă, cu majorarea pentru învățători", href: "/salarii/invatator", input: { functie: 17, vechimeInvatamant: "10-15 ani", aniMunca: 12, majorari: ["dirigentie"] } },
  { label: "Educatoare debutantă, studii liceale, sub un an de vechime, cu majorarea pentru educatoare", href: "/salarii/educator", input: { functie: 20, vechimeInvatamant: "până la 1 an", aniMunca: 0, majorari: ["dirigentie"] } },
].map(exemplu => {
  const rezultat = calculeazaInvatamantComplet(exemplu.input);
  if (!rezultat) throw new Error(`Exemplu de învățământ fără încadrare: ${exemplu.label}`);
  return { ...exemplu, rezultat };
});

const FAQ = [
  {
    q: "Ce salariu are un profesor în 2026?",
    a: `În tabelul personalului didactic de predare, salariile de bază sunt între ${fmt(MIN_GRILA)} și ${fmt(MAX_GRILA)} lei brut, la gradația 0. Intervalul cuprinde funcții și niveluri de studii diferite; nu este salariul net al unui profesor. Pentru încadrarea ta, alege funcția, studiile și vechimea, apoi aplică gradația de vechime în muncă și majorările la care ai dreptul.`,
  },
  {
    q: "De ce sunt două feluri de vechime?",
    a: "Sunt criterii diferite și se combină. Vechimea în învățământ alege rândul din grilă — cât timp ai lucrat efectiv în sistem. Vechimea în muncă dă gradația, aplicată peste valoarea din grilă, și include toată cariera. Un profesor cu 22 de ani în învățământ și 25 în muncă e pe rândul „20-25 ani” și primește gradația 5.",
  },
  {
    q: "Cum se calculează gradația de vechime?",
    a: "Cotele se compun, nu se adună. Gradația 1 adaugă 7,5%, gradația 2 încă 5% peste rezultatul anterior, gradația 3 alți 5%, gradațiile 4 și 5 câte 2,5%. Cumulat, gradația 5 înseamnă +24,52% față de valoarea din grilă, nu +22,5% cum ar da adunarea simplă. Temeiul e art. 10 alin. (4) din Legea 153/2017.",
  },
  {
    q: "De ce folosiți valorile din iunie 2024?",
    a: "Pentru că sunt cele în plată. Anexa are două coloane, ianuarie și iunie 2024. Salariile de bază din sectorul public au fost menținute prin lege: în 2025 la nivelul lunii decembrie 2024, iar în 2026 la nivelul lunii decembrie 2025. Deci coloana din iunie 2024 este grila aplicabilă în 2026.",
  },
  {
    q: "Cât e majorarea pentru dirigenție?",
    a: "10% din salariul de bază, conform Anexei I, cap. I, lit. B, art. 8. Beneficiază personalul didactic care îndeplinește funcția de diriginte, precum și învățătorii, educatoarele, institutorii și profesorii pentru învățământul primar și preșcolar. Se aplică la salariul de bază deținut, adică după gradație — nu la valoarea brută din grilă.",
  },
  {
    q: "Tabelul grilei arată salariul net sau brut?",
    a: "Tabelul arată salariul de bază brut la gradația 0 pentru personalul didactic de predare. Pentru net trebuie calculate gradația de vechime în muncă, majorările și indemnizațiile aplicabile, apoi contribuțiile și impozitul. Folosește calculatorul pentru încadrarea completă; nu transforma întregul interval al grilei într-un salariu mediu.",
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
          name: "Calculator salariu învățământ",
          item: "https://salariile.ro/calculator-salariu-invatamant",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: "https://salariile.ro/calculator-salariu-invatamant",
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

const REPERE_INVATAMANT = [
  ["Salariu de bază, minim în grilă", `${fmt(MIN_GRILA)} lei`],
  ["Salariu de bază, maxim în grilă", `${fmt(MAX_GRILA)} lei`],
  ["Gradația 5, cumulat", "+24,52%"],
  ["Dirigenție", `+${fmt(MAJORARI.find(m => m.cod === "dirigentie")!.cota * 100)}%`],
  ["Gradație de merit", `+${fmt(MAJORARI.find(m => m.cod === "gradatie-merit")!.cota * 100)}%`],
  ["Indemnizație de hrană", `${fmt(INDEMNIZATIE_HRANA)} lei brut`],
  ["Indemnizație doctorat", `${fmt(INDEMNIZATIE_DOCTORAT_2026)} lei brut`],
] as const;

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator salariu învățământ" }]} />
        <H1>Calculator salariu învățământ 2026</H1>
        <Lead>
          Alege-ți încadrarea și vezi salariul de bază, gradația și netul — fiecare
          linie cu articolul din lege. Grila e cea în plată azi, din Legea 153/2017,
          formă consolidată la {new Date(SURSA_GRILA.formaConsolidata).toLocaleDateString("ro-RO")}.
        </Lead>
      </Hero>

      <CalculatorInvatamant />

      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <a href="#grila-salarizare" className="inline-flex min-h-11 items-center text-sm font-medium text-stone-900 underline underline-offset-2">Vezi grila de salarizare pe funcții și vechime</a>
      </div>

      <GrilaInvatamant />

      <Section
        companion={
          <CardCompanion
            titlu="Repere · Legea 153/2017"
            nota="Sume brute, la gradația 0. Peste ele se aplică gradația de vechime în muncă și majorările bifate."
          >
            <Repere randuri={REPERE_INVATAMANT} />
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se construiește salariul unui cadru didactic</h2>
          <p>
            Salariul de bază nu e o singură cifră citită dintr-un tabel. Se compune în trei pași,
            iar ordinea lor schimbă rezultatul:
          </p>
          <ol>
            <li>
              <strong>Salariul din grilă.</strong> Se alege după funcția didactică, gradul didactic,
              nivelul studiilor și vechimea în învățământ. Valorile din anexă sunt la gradația 0 și
              merg de la {fmt(MIN_GRILA)} la {fmt(MAX_GRILA)} lei brut.
            </li>
            <li>
              <strong>Gradația de vechime în muncă.</strong> Se aplică peste valoarea din grilă și
              produce salariul de bază deținut. Cotele se compun.
            </li>
            <li>
              <strong>Majorările.</strong> Dirigenția, gradația de merit și predarea simultană se
              aplică la salariul de bază <em>deținut</em>, nu la valoarea din grilă. Diferența e
              reală: în primul exemplu de mai jos, majorarea pentru dirigenție este calculată
              după aplicarea gradației.
            </li>
          </ol>

          <h2>Gradațiile de vechime</h2>
          <p>
            Art. 10 alin. (4) din Legea 153/2017 stabilește cinci gradații. Fiecare se aplică la
            salariul de bază avut, nu la cel din anexă — de aceea efectul lor se compune:
          </p>
        </Prose>

        <div className="mx-auto mt-4 max-w-3xl overflow-x-auto px-4 sm:px-6">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-canvas">
                <th className="border-b border-stone-300 px-2 py-2 text-left font-medium sm:px-3">Gradație</th>
                <th className="border-b border-stone-300 px-2 py-2 text-left font-medium sm:px-3"><span className="sm:hidden">Vechime</span><span className="hidden sm:inline">Vechime în muncă</span></th>
                <th className="hidden border-b border-stone-300 px-2 py-2 text-right font-medium sm:table-cell sm:px-3">Cotă</th>
                <th className="border-b border-stone-300 px-2 py-2 text-right font-medium sm:px-3">Cumulat</th>
              </tr>
            </thead>
            <tbody>
              {GRADATII.map((g, i) => {
                const cumulat = GRADATII.slice(1, i + 1).reduce((s, x) => s * (1 + x.cota), 1);
                return (
                  <tr key={g.nivel}>
                    <td className="border-b border-stone-200 px-2 py-2 sm:px-3">{g.nivel}</td>
                    <td className="border-b border-stone-200 px-2 py-2 sm:px-3">{g.eticheta}</td>
                    <td className="hidden border-b border-stone-200 px-2 py-2 text-right tabular-nums sm:table-cell sm:px-3">
                      {g.cota ? `+${(g.cota * 100).toLocaleString("ro-RO")}%` : "—"}
                    </td>
                    <td className="border-b border-stone-200 px-2 py-2 text-right tabular-nums sm:px-3">
                      +{((cumulat - 1) * 100).toFixed(2).replace(".", ",")}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Prose>
          <h2>Exemple practice: profesor, învățător, educator</h2>
          <p>
            Trei încadrări distincte, calculate cu aceleași formule ca instrumentul de mai sus:
            normă întreagă, funcție de bază, fără persoane în întreținere, fără deducerea
            suplimentară pentru vârsta sub 26 de ani și fără doctorat. Indemnizația de hrană
            este inclusă când se îndeplinește pragul legal. Exemplele nu sunt medii salariale.
          </p>
          <ul>
            {EXEMPLE.map(({ label, href, rezultat: r }) => (
              <li key={href}>
                <strong>{label}:</strong> {fmt(r.salariuGrila)} lei brut în grilă;
                gradația {r.gradatie} produce {fmt(r.salariuDeBaza)} lei salariu de bază brut.
                {r.linii.map(l => ` ${l.eticheta}: ${fmt(l.suma)} lei brut.`).join("")}
                {" "}Total: {fmt(r.brutTotal)} lei brut, <strong>{fmt(r.fiscal.netBani)} lei net</strong>.
                {" "}<Link href={href}>Vezi reperele și sursele pentru meserie</Link>.
              </li>
            ))}
          </ul>

          <h2>De unde vin cifrele</h2>
          <p>
            Grila are {GRILA.length} de combinații de funcție, nivel de studii și vechime în
            învățământ, extrase din {SURSA_GRILA.act}, {SURSA_GRILA.anexa}, formă consolidată la{" "}
            {new Date(SURSA_GRILA.formaConsolidata).toLocaleDateString("ro-RO")}. Textul integral e
            pe{" "}
            <a href={SURSA_GRILA.url} rel="nofollow noopener" target="_blank">
              portalul legislativ
            </a>
            .
          </p>
          <p>
            Calculatorul acoperă salariul de bază și majorările bifate. Nu include sporurile de
            condiții de muncă, plata cu ora, premiile sau norma didactică sub ori peste normă.
            Metodologia completă e pe pagina de <Link href="/metodologie">metodologie</Link>.
          </p>
        </Prose>
      </Section>

      <Faq
        items={FAQ}
        companion={
          <CardCompanion titlu="Cine e acoperit" nota="Personalul didactic auxiliar — contabil, secretară, bibliotecar — are altă secțiune în anexă și nu e inclus aici.">
            <Repere
              randuri={[
                ["Funcții didactice de predare", "21"],
                ["Combinații din grilă", `${GRILA.length}`],
                ["Funcții de conducere", "6"],
                ["Trepte de gradație", "6"],
              ]}
            />
          </CardCompanion>
        }
      />

      <PaginiConexe
        linkuri={[
          { href: "/salarii/profesor", label: "Salariu profesor", descriere: "Grila și reperele din sectorul de educație." },
          { href: "/salarii/invatator", label: "Salariu învățător", descriere: "Grila pentru cadrele din învățământul primar." },
          { href: "/salarii/educator", label: "Salariu educator", descriere: "Salarii și trepte pentru învățământul preșcolar." },
          { href: "/calculator-salariu-sanatate", label: "Calculator salariu sănătate", descriere: "Aceeași lege, Anexa II." },
          { href: "/", label: "Calculator salariu net", descriere: "Brut în net pentru orice salariu." },
          { href: "/fluturas-salariu", label: "Generator de fluturaș", descriere: "Vezi defalcarea, ca pe hârtie." },
        ]}
      />
    </>
  );
}
