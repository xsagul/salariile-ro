// app/calculator-pfa/page.tsx
// Pagină calculator taxe PFA 2026 — structură oglindă a paginii principale
// (hero pe grilă + calculator + zonă-articol 3+2 cu carduri-companion).

import type { Metadata } from "next";
import Link from "next/link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import CalculatorPFA from "@/app/components/CalculatorPFA";

const PFA_TITLU = "Calculator taxe PFA 2026: CAS, CASS, impozit";
const PFA_DESC =
  "Calculează taxele de PFA în sistem real pentru 2026: CAS 25%, CASS 10%, impozit 10% și venitul rămas.";

export const metadata: Metadata = {
  title: PFA_TITLU,
  description:
    "Calculator PFA 2026 (sistem real): vezi CAS, CASS, impozitul de 10% și cât îți rămâne din venit. Plafoane raportate la salariul minim de 4.050 lei.",
  alternates: { canonical: "https://salariile.ro/calculator-pfa" },
  openGraph: ogPage({ title: PFA_TITLU, description: PFA_DESC, path: "/calculator-pfa" }),
  twitter: twPage({ title: PFA_TITLU, description: PFA_DESC }),
};

const FAQ = [
  {
    q: "Ce taxe plătește un PFA în 2026?",
    a: "În sistem real, un PFA plătește: impozit pe venit 10%, CAS (pensie) 25% – dar doar dacă venitul net depășește 12 salarii minime (48.600 lei/an) – și CASS (sănătate) 10% pe venitul net, între un prag de 6 salarii minime și un plafon de 72. Toate se raportează la venitul net (încasări minus cheltuieli deductibile).",
  },
  {
    q: "De la ce venit plătesc CAS ca PFA?",
    a: "CAS se datorează doar dacă venitul net anual atinge 12 salarii minime, adică 48.600 lei în 2026. Între 12 și 24 de salarii minime, baza e 12 minime (CAS = 12.150 lei/an). Peste 24 de salarii minime (97.200 lei), baza e 24 de minime (CAS = 24.300 lei/an). Sub prag, CAS e opțional; pensionarii sunt scutiți.",
  },
  {
    q: "Cât este CASS și are plafon?",
    a: "CASS este 10% din venitul net, cu un prag de 6 salarii minime (24.300 lei) și un plafon de 72 de salarii minime (291.600 lei) în 2026. Astfel, CASS maximă pe care o poți plăti este 29.160 lei/an, oricât ai câștiga peste plafon. Sub 6 minime datorezi la prag, dacă nu ești asigurat și prin altă parte.",
  },
  {
    q: "Ce salariu minim se folosește la plafoanele PFA în 2026?",
    a: "Se folosește salariul minim în vigoare la 1 ianuarie 2026 – 4.050 lei. Majorarea la 4.325 lei din iulie nu schimbă plafoanele anuale pentru anul fiscal 2026; valoarea se actualizează la depunerea Declarației Unice.",
  },
  {
    q: "Care e diferența dintre sistem real și normă de venit?",
    a: "În sistem real, taxele se calculează pe venitul net efectiv (încasări minus cheltuieli deductibile) – varianta acoperită de calculatorul de aici. La normă de venit, statul stabilește un venit fix pe tipul de activitate, iar taxele se aplică la acea normă, indiferent cât câștigi efectiv.",
  },
  {
    q: "Sunt și salariat – mai plătesc CAS și CASS la PFA?",
    a: "Da, impozitul de 10% și contribuțiile se aplică și pe venitul din PFA. Diferența: fiind deja asigurat la sănătate prin salariu, pragul de 6 salarii minime la CASS nu îți mai impune o plată minimă – CASS se calculează pe venitul efectiv. CAS rămâne datorat doar peste pragul de 12 minime.",
  },
];

const PLAFOANE: [string, string][] = [
  ["Prag CASS (6 minime)", "24.300 lei"],
  ["Prag CAS (12 minime)", "48.600 lei"],
  ["Bază CAS maximă (24 minime)", "97.200 lei"],
  ["Plafon CASS (72 minime)", "291.600 lei"],
  ["CASS maximă / an", "29.160 lei"],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Calculator PFA 2026", item: "https://salariile.ro/calculator-pfa" },
      ],
    },
    {
      "@type": "WebApplication",
      name: "Calculator taxe PFA 2026",
      url: "https://salariile.ro/calculator-pfa",
      applicationCategory: "FinanceApplication",
      operatingSystem: "All",
      isAccessibleForFree: true,
      description:
        "Calculator pentru taxele unui PFA în sistem real, 2026: CAS, CASS, impozit pe venit și venitul rămas.",
      publisher: { "@type": "Organization", name: "Salariile.ro", url: "https://salariile.ro" },
      author: personSchema,
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

const proseLinks =
  "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600 [&_strong]:font-bold";
const p = "mb-4 text-base leading-normal tracking-[-0.01em] text-stone-600";

export default function CalculatorPfaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        {/* HERO — pe grila calculatorului (col-span-3), cu linie sub el ca pe homepage */}
        <section className="border-b border-stone-200 bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="md:grid md:grid-cols-5 md:gap-6">
            <div className="md:col-span-3">
              <h1 className="mb-3 text-3xl font-bold tracking-[-0.02em] text-stone-900 sm:text-4xl">Calculator taxe PFA 2026</h1>
              <p className="max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">
                Vezi cât plătești ca PFA în sistem real – CAS, CASS și impozit – și cât îți rămâne. Pune încasările și
                cheltuielile, apasă Calculează.
              </p>
              <div className="mt-5 max-w-prose border-l-2 border-stone-900 pl-4 text-sm leading-normal tracking-[-0.01em] text-stone-700">
                <p className="font-semibold text-stone-900">Răspuns scurt</p>
                <p className="mt-1">
                  La PFA în sistem real, taxele pornesc de la venitul net anual: <strong>CASS 10%</strong>,{" "}
                  <strong>CAS 25%</strong> dacă treci de plafonul de 12 salarii minime și <strong>impozit 10%</strong>{" "}
                  după deducerea contribuțiilor.
                </p>
              </div>
              <div className="mt-4 text-xs text-stone-600">Actualizat 6 iulie 2026</div>
            </div>
          </div>
        </div>
        </section>

        {/* CALCULATOR */}
        <CalculatorPFA />

        {/* ZONĂ ARTICOL — 3+2, ca pe homepage */}
        <section className="rule-t py-8 sm:py-12">
          <div className="mx-auto max-w-6xl space-y-8 px-4 sm:space-y-12 sm:px-6">

            {/* Rândul 1 — Cum se calculează + card Plafoane */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className={`md:col-span-3 ${proseLinks}`}>
                <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Cum se calculează taxele unui PFA</h2>
                <div className="max-w-prose">
                  <p className={p}>
                    La PFA în sistem real, totul pornește de la <strong>venitul net</strong> = încasări minus cheltuielile
                    deductibile dintr-un an. Pe el se aplică trei taxe:
                  </p>
                  <ul className="mb-4 list-disc pl-5 text-base leading-normal tracking-[-0.01em] text-stone-600 [&_li]:mb-2">
                    <li><strong>CASS 10%</strong> (sănătate) – pe tot venitul net, dar nu sub 6 salarii minime și nu peste 72.</li>
                    <li><strong>CAS 25%</strong> (pensie) – doar dacă venitul net trece de 12 salarii minime; altfel e opțional.</li>
                    <li><strong>Impozit 10%</strong> – pe ce rămâne după ce scazi CAS și CASS (ambele sunt deductibile din 2024).</li>
                  </ul>
                  <p className={p}>
                    Spre deosebire de un salariat, la PFA <strong>tu plătești tot</strong> – nu există „angajator&quot; care să
                    adauge contribuții peste. Dar ai dreptul să scazi cheltuielile reale ale activității.
                  </p>
                </div>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0">
                <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <h3 className="mb-3 text-xs font-medium text-stone-500">Plafoane PFA · 2026</h3>
                  <dl className="text-sm">
                    {PLAFOANE.map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between border-b border-stone-100 py-2 last:border-b-0">
                        <dt className="text-stone-600">{k}</dt>
                        <dd className="font-medium tabular-nums text-stone-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-xs text-stone-500">Plafoane anuale pentru anul fiscal 2026.</p>
                </div>
              </aside>
            </div>

            {/* Rândul 2 — FAQ + card Surse */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className="md:col-span-3">
                <h2 className="mb-6 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Întrebări frecvente</h2>
                <div className="flex flex-col">
                  {FAQ.map((item, i) => (
                    <details key={i} name="faq-pfa" className="group border-b border-stone-200 py-4">
                      <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium tracking-[-0.01em] text-stone-900 [&::-webkit-details-marker]:hidden">
                        {item.q}
                        <span className="flex-shrink-0 text-xl text-stone-900 group-open:hidden">+</span>
                        <span className="hidden flex-shrink-0 text-xl text-stone-900 group-open:inline">−</span>
                      </summary>
                      <p className="mt-3 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0">
                <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <h3 className="mb-3 text-xs font-medium text-stone-500">Surse oficiale</h3>
                  <ul className="flex flex-col gap-2 text-sm leading-normal text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600">
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener">Codul Fiscal (Legea 227/2015)</a> – contribuții și impozit pentru activități independente</li>
                    <li>ANAF – Declarația Unică (D212), termen 25 mai pentru anul fiscal</li>
                  </ul>
                  <h3 className="mb-3 mt-6 text-xs font-medium text-stone-500">Pagini conexe</h3>
                  <ul className="flex flex-col gap-2 text-sm [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600">
                    <li><Link href="/">Calculator salariu net</Link></li>
                    <li><Link href="/salariu-minim">Salariul minim 2026</Link></li>
                    <li><Link href="/salariu-mediu">Salariul mediu pe economie</Link></li>
                  </ul>
                  <p className="mt-auto pt-6 text-xs text-stone-500">
                    Calculatorul acoperă sistemul real și cazurile uzuale. Pentru situații speciale, confirmă cu un contabil.
                  </p>
                </div>
              </aside>
            </div>

          </div>
        </section>
      </div>
    </>
  );
}
