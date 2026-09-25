// app/calculator-salariu-invatamant/page.tsx
// Calculator salariu învățământ preuniversitar — Legea 153/2017, Anexa I, cap. I.
//
// De ce pagina asta există: „calculator salariu învățământ" e cel mai mare gol
// de acoperire față de paylab (16.200 volum cumulat, ei pe poziția 13 și 18).
// Vezi GOL-KEYWORDS-PAYLAB-2026-08-28.md.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section, INAINTE_DE_SECTIUNE, LISTA_CARD } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import CalculatorInvatamant from "@/app/components/CalculatorInvatamant";
import GrilaInvatamant from "@/app/components/GrilaInvatamant";
import { GRADATII, calculeazaInvatamantComplet, MAJORARI } from "@/lib/invatamant";
import { TABEL_STANDARD } from "@/app/components/TabelArticol";

const TITLU = "Calculator Salarii Învățământ 2026 - Vezi net și grilă";
const DESC =
  "Calculator salariu învățământ 2026 cu gradație, dirigenție și net. Consultă grila de salarizare pe funcții, studii și vechime sau descarcă tabelul CSV.";

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: "https://salariile.ro/calculator-salariu-invatamant" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/calculator-salariu-invatamant" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
const cota = (cod: string) => fmt(MAJORARI.find((m) => m.cod === cod)!.cota * 100);

// Trei trepte din cariera aceluiași profesor, cu studii superioare, fără
// dirigenție. Cititorul vrea să știe cât ia în mână și cât crește salariul cu
// anii, nu defalcarea fiecărei linii, pe care o dă calculatorul.
const TREPTE = [
  { eticheta: "Debutant", input: { functie: 4, vechimeInvatamant: "până la 1 an", aniMunca: 0, majorari: [] } },
  { eticheta: "Definitivat, 7 ani vechime", input: { functie: 3, vechimeInvatamant: "5-10 ani", aniMunca: 7, majorari: [] } },
  { eticheta: "Gradul I, peste 25 de ani", input: { functie: 1, vechimeInvatamant: "peste 25 ani", aniMunca: 26, majorari: [] } },
].map((treapta) => {
  const rezultat = calculeazaInvatamantComplet(treapta.input);
  if (!rezultat) throw new Error(`Treaptă de învățământ fără încadrare: ${treapta.eticheta}`);
  return { eticheta: treapta.eticheta, net: rezultat.fiscal.netBani };
});
const [DEBUTANT, , VARF] = TREPTE;
// Rotunjit la zeci în proză, ca un om care povestește; tabelul din card dă leul exact.
const aprox = (n: number) => fmt(Math.round(n / 10) * 10);

const FAQ = [
  {
    q: "Ce salariu are un profesor în 2026?",
    a: `Depinde de grad și de vechime. Un profesor debutant cu studii superioare ia în mână cam ${aprox(DEBUTANT.net)} de lei, iar unul cu gradul I și peste 25 de ani de vechime, cam ${aprox(VARF.net)}. Dirigenția adaugă ${cota("dirigentie")}% la salariul de bază.`,
  },
  {
    q: "De ce contează două feluri de vechime?",
    a: "Anii lucrați în învățământ aleg rândul din grilă. Anii de muncă, toți, inclusiv cei de dinainte de catedră, dau gradația. Cine vine la școală după zece ani în privat pornește de jos în grilă, dar cu o gradație mai mare.",
  },
  {
    q: "Cum se calculează gradația de vechime?",
    a: "Fiecare treaptă adaugă un procent peste salariul deja crescut de treapta dinainte, deci procentele se înmulțesc, nu se adună. La gradația 5, salariul e cu 24,52% peste suma din grilă.",
  },
  {
    q: "Cât valorează dirigenția?",
    a: `${cota("dirigentie")}% din salariul de bază, calculat după gradație, deci crește odată cu vechimea. O primesc diriginții și, fără să fie diriginți, învățătorii, educatoarele și institutorii.`,
  },
  {
    q: "De ce grila în plată e cea din 2024?",
    a: "Pentru că salariile de bază din sectorul public au fost înghețate prin lege, în 2025 și din nou în 2026. Coloana din iunie 2024 a anexei a rămas cea după care se plătește.",
  },
  {
    q: "Grila arată salariul brut sau net?",
    a: "Brut, și doar salariul de pornire, înainte de gradație și de sporuri. Cât primești în mână afli din calculatorul de mai sus.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator salariu învățământ" }]} />
        <H1>Calculator salariu învățământ 2026</H1>
        <Lead>
          Alegi funcția, gradul și vechimea, iar calculatorul îți arată cât primești în mână, după
          grila în vigoare.
        </Lead>
      </Hero>

      <CalculatorInvatamant />

      {/* Cine a venit pentru grilă (cam 10% din căutări) o găsește dintr-un click;
          restul citește întâi cum se calculează. */}
      <div className="mx-auto -mt-4 max-w-6xl px-4 pb-4 sm:px-6">
        <a href="#grila-salarizare" className="inline-flex min-h-11 items-center text-sm font-medium text-stone-900 underline underline-offset-2">Vezi grila completă, pe funcții și vechime</a>
      </div>

      <Section
        companion={
          <div className="md:sticky md:top-24">
          <CardCompanion
            titlu="Cât ia un profesor în mână"
            nota="Net lunar, studii superioare, cu indemnizația de hrană, fără dirigenție."
          >
            <Repere randuri={TREPTE.map((t) => [t.eticheta, `${fmt(t.net)} lei`] as const)} />
          </CardCompanion>
          </div>
        }
      >
        <Prose>
          <h2>Cum se calculează salariul unui profesor</h2>
          <p>
            Salariul nu se citește direct din grilă. Pornește de la suma din grilă, crește cu vechimea,
            apoi cu sporurile, iar la final se scad taxele obișnuite ale oricărui salariu.
          </p>
          <Formula
            eticheta="Formula salariului în învățământ"
            randuri={[
              "Salariu de bază = suma din grilă × (1 + gradația)",
              "Sporuri        = salariu de bază × procentul sporului",
              "Brut           = salariu de bază + sporuri + hrană",
              "Net            = brut − CAS − CASS − impozit",
            ]}
          />
          <p>
            <strong>Suma din grilă</strong> o dau funcția, gradul didactic, studiile și anii lucrați în
            învățământ. <strong>Gradația</strong> vine din anii de muncă, toți, nu doar cei de la catedră.
            <strong> Sporurile</strong>, ca dirigenția sau gradația de merit, se calculează din salariul
            de după gradație, deci cresc și ele cu vechimea. <strong>Hrana</strong> e o sumă fixă, aceeași
            pentru toți. Taxele se calculează ca la <Link href="/">orice salariu</Link>.
          </p>
          <p>
            Pe scurt, un profesor ia în mână cam {aprox(DEBUTANT.net)} de lei la debut și cam{" "}
            {aprox(VARF.net)} după 25 de ani cu gradul I.
          </p>

          <h2>Gradațiile de vechime</h2>
          <p>
            Sunt cinci trepte. Fiecare procent se aplică peste salariul deja crescut de treapta
            dinainte, așa că la ultima gradație creșterea totală trece puțin de suma procentelor.
          </p>
        </Prose>

        <div className="mt-4 overflow-x-auto">
          <table className={`${TABEL_STANDARD}`}>
            <thead>
              <tr className="bg-antet">
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

        <Prose className={INAINTE_DE_SECTIUNE}>
          <h2>Ce nu intră în calcul</h2>
          <p>
            Calculatorul acoperă salariul din grilă, gradația, sporurile din listă și indemnizația de
            hrană. Nu include sporurile pentru condiții de muncă, orele plătite separat, premiile sau
            orele peste normă. Personalul didactic auxiliar, de la secretară la bibliotecar, are o
            grilă separată. Detaliile sunt pe pagina de <Link href="/metodologie">metodologie</Link>.
          </p>
        </Prose>
      </Section>

      <GrilaInvatamant />

      <Faq
        items={FAQ}
        companion={
          <CardCompanion titlu="Alte salarii din sectorul public">
            <ul className={`${LISTA_CARD} [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2`}>
              <li><Link href="/calculator-salariu-sanatate">Calculator salariu în sănătate</Link>, pentru medici, asistenți și infirmieri.</li>
              <li><Link href="/noutati/legea-salarizarii-2026">Ce s-a întâmplat cu noua lege a salarizării</Link> și de ce grila de acum rămâne în plată.</li>
            </ul>
            <p className="mt-auto pt-4 text-xs text-stone-600">
              Personalul didactic auxiliar, cum ar fi secretarul sau bibliotecarul, are o grilă separată, care nu e în acest calculator.
            </p>
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
          { href: "/noutati/legea-salarizarii-2026", label: "Legea salarizării 2026 a picat", descriere: "De ce grila în vigoare rămâne Legea 153/2017." },
        ]}
      />
    </>
  );
}
