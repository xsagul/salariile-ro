// app/en/salary-calculator/page.tsx
// The Romanian salary calculator, in English.
//
// De ce exista, masurat pe 9 septembrie 2026 in baza romana SE Ranking:
// „salary calculator" 480 cautari pe luna, „calculate salary" 480,
// „calculator salary" 480, plus variantele — circa 1.650 pe luna pe intentie de
// unealta. In GSC aparem pe pozitia 54,8 la „romania salary calculator" si 66,5
// la „gross to net". undelucram.ro e pe locul 1 la „gross salary" si
// „gross to net", cu o pagina in /en/.
//
// De ce /en/ si nu /salary-calculator: prefixul de limba e conventia, iar
// URL-urile se schimba greu. Daca se mai adauga vreodata o a doua pagina in
// engleza, directorul trebuia sa existe de la inceput.
//
// De ce ACELASI calculator si nu o varianta simplificata: decizia
// proprietarului — „exact acelas calculator ca homepageul, exact exact, dar in
// engleza". Textele au fost scoase intr-un dictionar (`@/lib/calculator-texte`),
// componenta a ramas una singura. O copie ar fi divergat de la prima modificare
// fiscala, iar una dintre cele doua ar fi ramas in urma tacut.
//
// Verificat dupa refactor: continutul vizibil al homepage-ului e identic, cu o
// singura exceptie asumata — eticheta „CASS (Sănătate – 10%)" a fost unificata
// cu „CASS (sănătate – 10%)", care aparea deja in celalalt tabel al aceleiasi
// pagini. Substantiv comun, deci varianta cu litera mica e cea corecta.

import type { Metadata } from "next";
import Link from "next/link";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import { PaginiConexe, Section } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import { CAM_PROCENT, CASS_PROCENT, CAS_PROCENT, IMPOZIT_PROCENT, SALARIU_MINIM, calculStandard } from "@/lib/fiscal";

const TITLE = "Romanian Salary Calculator 2026: gross to net and employer cost";
const DESCRIPTION =
  "Work out net pay from a gross salary in Romania for 2026: pension and health contributions, the 10% flat income tax, the personal deduction and the total employer cost.";
const PATH = "/en/salary-calculator";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `https://salariile.ro${PATH}` },
  openGraph: ogPage({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: twPage({ title: TITLE, description: DESCRIPTION }),
};

const pct = (c: number) => `${String(c * 100).replace(".", ".")}%`;
const money = (n: number) => new Intl.NumberFormat("en-GB").format(Math.round(n));

const MINIM = calculStandard(SALARIU_MINIM);
const EX = calculStandard(10000);

const FAQ = [
  {
    q: "How much tax do you pay on a salary in Romania?",
    a: `An employee pays ${pct(CAS_PROCENT)} of the gross for the pension contribution (CAS), ${pct(CASS_PROCENT)} for the health contribution (CASS) and a flat ${pct(IMPOZIT_PROCENT)} income tax on what is left after those two and after the personal deduction. There are no tax brackets: the rate is the same at every salary level. On top of the gross, the employer pays a further ${pct(CAM_PROCENT)} work insurance contribution (CAM).`,
  },
  {
    q: "What does a gross salary of 10,000 RON leave you?",
    a: EX
      ? `About ${money(EX.netBani)} RON net per month in the standard case — full-time contract, main employer, no dependants. The employer's total cost is ${money(EX.costTotal)} RON, so roughly ${EX.brutNet}% of the gross reaches the employee.`
      : "",
  },
  {
    q: "What is the minimum wage in Romania in 2026?",
    a: MINIM
      ? `${money(SALARIU_MINIM)} RON gross per month from 1 July 2026, which comes to about ${money(MINIM.netBani)} RON net. Employees paid exactly the minimum benefit from a tax-free allowance introduced by OUG 89/2025, which is why their net is higher than a plain percentage of the gross would suggest.`
      : "",
  },
  {
    q: "Is the income tax progressive in Romania?",
    a: "No. Romania applies a flat 10% income tax on salaries, regardless of the amount. What changes with income is the personal deduction, which shrinks as the gross salary rises and disappears above a threshold — so the effective rate rises slightly, but the statutory rate never does.",
  },
  {
    q: "What is the difference between gross salary and total employer cost?",
    a: "The gross salary is what your contract states and what the employee's contributions are withheld from. The total employer cost adds the work insurance contribution (CAM) of 2.25% and, where they are granted, meal vouchers. When you negotiate with a Romanian company, the figure discussed is almost always the gross.",
  },
  {
    q: "Are salaries in Romania quoted gross or net?",
    a: "Job offers and employment contracts are quoted in gross. Employees, on the other hand, usually think in net — which is why this calculator works in both directions. Switch to net-to-gross if you know what you want in your account and need the gross figure to put in an offer.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Salary calculator", item: `https://salariile.ro${PATH}` },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLE,
      url: `https://salariile.ro${PATH}`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      inLanguage: "en",
      offers: { "@type": "Offer", price: "0", priceCurrency: "RON" },
      description: DESCRIPTION,
    },
    {
      "@type": "FAQPage",
      inLanguage: "en",
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

export default function Page() {
  return (
    <div lang="en">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <CalculatorSalariu
        limba="en"
        titluCustom={<>Romanian Salary Calculator 2026</>}
        subtitluCustom={
          <>
            Enter a gross salary and see what reaches the employee&rsquo;s account, with the pension
            and health contributions, the flat 10% income tax and the employer&rsquo;s total cost.
            It works from net to gross as well. Same engine as the{" "}
            <Link href="/">Romanian version of this calculator</Link>, same 2026 rules.
          </>
        }
      />

      <Section>
        <h2>How Romanian payroll works</h2>
        <p>
          Romania splits the cost of employment into three visible parts, and the gross salary in
          your contract sits in the middle of them.
        </p>
        <ul>
          <li>
            <strong>Withheld from the employee:</strong> {pct(CAS_PROCENT)} pension contribution
            (CAS) and {pct(CASS_PROCENT)} health contribution (CASS), both taken from the gross.
          </li>
          <li>
            <strong>Income tax:</strong> a flat {pct(IMPOZIT_PROCENT)}, charged on what remains
            after those contributions and after the personal deduction. There are no brackets.
          </li>
          <li>
            <strong>Paid by the employer, above the gross:</strong> the {pct(CAM_PROCENT)} work
            insurance contribution (CAM). This is the only employer-side contribution left after the
            2018 reform moved almost everything onto the employee&rsquo;s side.
          </li>
        </ul>
        <p>
          The abbreviations are kept in Romanian on purpose. CAS, CASS and CAM are what appear on a
          real payslip and in the employer&rsquo;s monthly D112 declaration, so recognising them is
          more useful than translating them.
        </p>

        <h2>The personal deduction, and why the effective rate moves</h2>
        <p>
          The statutory income tax rate never changes, but the <em>personal deduction</em> does. It
          reduces the tax base, grows with the number of dependants and shrinks as the gross salary
          rises, disappearing above a threshold tied to the minimum wage. Two people on different
          salaries therefore pay the same 10% rate but keep slightly different shares of their
          gross. The calculator applies it automatically; open the advanced options to add
          dependants.
        </p>

        <h2>What the numbers look like</h2>
        <p>
          {MINIM ? (
            <>
              At the minimum wage of {money(SALARIU_MINIM)} RON gross, an employee receives about{" "}
              {money(MINIM.netBani)} RON net. Employees paid exactly the minimum also benefit from a
              tax-free allowance introduced by OUG 89/2025, which lifts their net above what a plain
              percentage would give.
            </>
          ) : null}{" "}
          {EX ? (
            <>
              At {money(10000)} RON gross, the net is roughly {money(EX.netBani)} RON and the
              employer&rsquo;s total cost {money(EX.costTotal)} RON — about {EX.brutNet}% of the
              gross reaches the employee.
            </>
          ) : null}
        </p>

        <h2>Negotiating a Romanian salary</h2>
        <p>
          Offers are made in gross. If you are moving here, or hiring here, the two figures worth
          having in the same conversation are the gross and the total employer cost — the first is
          what the contract says, the second is what the company actually spends. The net follows
          from the gross mechanically, which is what this page is for.
        </p>
      </Section>

      <Section>
        <h2>Frequently asked questions</h2>
        <div className="flex flex-col">
          {FAQ.map((item, i) => (
            <details key={i} name="faq-en" className="group border-b border-stone-200">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between py-4 text-sm font-medium text-stone-900">
                {item.q}
                <span className="ml-4 shrink-0 text-stone-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-stone-600">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <PaginiConexe
        linkuri={[
          { href: "/", label: "Calculator salariu net", descriere: "The same calculator, in Romanian." },
          { href: "/salariu-minim", label: "Salariul minim 2026", descriere: "Minimum wage figures and the rules behind them." },
          { href: "/calculator-pfa", label: "Calculator taxe PFA", descriere: "Taxes for self-employed work in Romania." },
          { href: "/fluturas-salariu", label: "Generator de fluturaș", descriere: "Generate a payslip PDF from a gross salary." },
          { href: "/salariu-mediu", label: "Salariul mediu pe economie", descriere: "Average earnings, from the statistics institute." },
          { href: "/zile-libere-2026", label: "Zile libere 2026", descriere: "Public holidays and working days in Romania." },
        ]}
      />
    </div>
  );
}
