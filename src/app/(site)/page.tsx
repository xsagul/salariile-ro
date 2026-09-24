// src/app/page.tsx
import type { Metadata } from "next";
import Link from "@/app/components/Link";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import { Formula, TITLU_SECTIUNE } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { calculatorSlugBrut, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { calculStandard, SALARIU_MINIM } from "@/lib/fiscal";

const lei = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

// Cifrele din text și din FAQ se calculează din motorul fiscal,
// ca să nu rămână în urmă la următoarea schimbare de reguli.
const PLAFON_DEDUCERE = SALARIU_MINIM + 2000;
const MINIM = calculStandard(SALARIU_MINIM)!;

// Metadata proprie homepage-ului (suprascrie default-ul global din layout, fără
// să atingă celelalte pagini). Țintește termenul cu cel mai mare volum din nișă,
// „calculator salariu net" (90.500/lună în snapshotul DataForSEO din 2026-07-15),
// plus head terms „salariu brut" / „brut în net".
export const metadata: Metadata = {
  title: {
    absolute: "Calculator salariu net 2026 - Brut în net și invers",
  },
  description:
    "Calculează salariul net din brut sau brutul din net pentru 2026. Vezi taxele plătite de angajat și angajator în România.",
  alternates: { canonical: "https://salariile.ro" },
};

// Întrebările la care corpul paginii nu răspunde deja. Aceleași texte intră și
// în schema FAQPage, deci fiecare răspuns trebuie să se înțeleagă singur.
// Rescrise pe 24 septembrie 2026: un răspuns, o idee, cel mult o cifră.
const faqData = [
  {
    q: "În contract se trece salariul brut sau net?",
    a: "Brutul. Contractul de muncă, statul de plată și declarațiile către ANAF pornesc toate de la brut, iar netul rezultă din el după taxe. Când negociezi, întreabă mereu dacă suma discutată e brută sau netă: netul e doar cam 60% din brut.",
  },
  {
    q: "Salariul de bază e același lucru cu salariul brut?",
    a: "Nu întotdeauna. Salariul de bază e partea fixă din contract. Brutul unei luni poate fi mai mare, pentru că include și sporurile, orele suplimentare sau primele din luna respectivă.",
  },
  {
    q: "Ce înseamnă avans și lichidare?",
    a: "Sunt două tranșe ale aceluiași salariu. Avansul se plătește la jumătatea lunii, lichidarea e restul, după ce se scad avansul și reținerile. Adunate, dau netul lunii.",
  },
  {
    q: "Cât e salariul minim net în 2026?",
    a: `${lei(MINIM.netBani)} lei în mână, din ${lei(SALARIU_MINIM)} lei brut, de la 1 iulie 2026. La salariul minim cu normă întreagă, 200 de lei din brut nu se taxează deloc, de aceea netul iese ceva mai mare decât la alte salarii.`,
  },
  {
    q: "Ce este deducerea personală?",
    a: `O parte din venit pe care nu plătești impozit. O primesc doar salariații cu brut de până la ${lei(PLAFON_DEDUCERE)} lei, la locul de muncă de bază. E cea mai mare la salariul minim, scade pe măsură ce brutul crește și urcă pentru fiecare persoană pe care o ai în întreținere.`,
  },
  {
    q: "Cum se taxează tichetele de masă?",
    a: "Tichetul ajunge întreg pe card, dar pe valoarea lui se plătesc CASS și impozit, care se opresc din salariul în bani. De aceea, cu tichete, suma din cont iese puțin mai mică decât netul fără ele. Pensia (CAS) nu se plătește pe tichete.",
  },
  {
    q: "Mai există scutirea de impozit în IT și construcții?",
    a: "Nu. Scutirile pentru IT, construcții, agricultură și industria alimentară au dispărut din ianuarie 2025. Acum salariile din aceste domenii se taxează la fel ca oricare altele.",
  },
];

const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://salariile.ro/#organization",
      name: "Salariile",
      alternateName: "Salariile.ro",
      url: "https://salariile.ro",
      logo: {
        "@type": "ImageObject",
        url: "https://salariile.ro/icon-512.png",
        width: 512,
        height: 512,
      },
      founder: { "@id": "https://salariile.ro/#person" },
    },
    personSchema,
    {
      "@type": "WebSite",
      "@id": "https://salariile.ro/#website",
      url: "https://salariile.ro/",
      // Numele mărcii afișat de Google deasupra URL-ului. Trebuie să coincidă
      // cu og:site_name și cu sufixul titlurilor (NUME_SITE din src/lib/seo.ts).
      name: "Salariile",
      alternateName: ["salariile.ro", "Salariile.ro"],
      inLanguage: "ro-RO",
      publisher: { "@id": "https://salariile.ro/#organization" },
    },
    {
      "@type": "WebPage",
      "@id": "https://salariile.ro/#webpage",
      url: "https://salariile.ro/",
      name: "Calculator salariu net 2026: brut în net",
      inLanguage: "ro",
      // Aceeași dată ca lastModified din sitemap și ca „Ultima actualizare" vizibilă —
      // consistența între bylineDate / sitemap / schema e un semnal de încredere.
      dateModified: PAGE_LAST_MODIFIED["/"].toISOString().slice(0, 10),
      isPartOf: { "@id": "https://salariile.ro/#website" },
      publisher: { "@id": "https://salariile.ro/#organization" },
    },
    {
      "@type": "WebApplication",
      "@id": "https://salariile.ro/#calculator",
      name: "Calculator Salariu Net România",
      url: "https://salariile.ro/",
      description:
        "Calculator salariu net din brut pentru România. Actualizat conform legislației fiscale în vigoare: HG 146/2026, OUG 89/2025.",
      applicationCategory: "FinanceApplication",
      operatingSystem: "All",
      // isAccessibleForFree în loc de offers – evităm cerința Google pentru
      // aggregateRating/review pe SoftwareApplication cu offers (Semrush flag).
      // Spec Schema.org: isAccessibleForFree=true semnalează clar că e gratuit
      // fără să declanșeze validarea de "produs comercial".
      isAccessibleForFree: true,
      publisher: { "@id": "https://salariile.ro/#organization" },
      featureList: [
        "Calcul net din brut",
        "Calcul brut din net",
        "Deducere personală automată",
        "Facilitate salariu minim (OUG 89/2025)",
        "Cost total angajator (CAM 2,25%)",
        "Tichete de masă",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqData.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
  ],
};

const calculeBrutPopulare = [4325, 5000, 7000, 10000, 20000] as const;
const paragraf = "mb-4 text-base leading-normal tracking-[-0.01em] text-stone-600";


export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />

      <div className="bg-canvas">
        <CalculatorSalariu />

        {/* ── Zonă de articol: două rânduri, fiecare cu conținut (stânga,
            col-span-3, aliniat la grila calculatorului) + companion (dreapta,
            col-span-2) de aceeași înălțime prin grid-stretch. Fără sticky —
            totul scrollează împreună. Pe mobil se stivuiește. ── */}
        <section className="rule-t py-8 sm:py-12">
          <div className="mx-auto max-w-6xl space-y-8 px-4 sm:space-y-12 sm:px-6">

            {/* Rândul 1 – explicația și formula */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className="md:col-span-3 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600 [&_strong]:font-semibold [&_strong]:text-stone-900">
                <h2 className={`mb-4 ${TITLU_SECTIUNE}`}>Cum se calculează salariul net</h2>
                <div className="max-w-prose">
                  <p className={paragraf}>
                    Înainte să-ți intre banii în cont, firma oprește din brut trei taxe și le trimite la stat:
                    contribuția la pensie, cea pentru sănătate și impozitul. Primele două se calculează din brut,
                    impozitul din ce rămâne după ele.
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

                  <p className={paragraf}>
                    Formula e aceeași pentru toată lumea. Ce diferă de la om la om e deducerea, adică partea din
                    venit pe care nu se plătește impozit. Peste {lei(PLAFON_DEDUCERE)} lei brut deducerea dispare,
                    așa că netul iese mereu 58,5% din brut.
                  </p>
                  <p className={paragraf}>
                    Firma mai plătește, peste brut, 2,25% pentru asigurarea de muncă (CAM). Nu se scade din banii
                    tăi, dar arată cât costă de fapt postul.
                  </p>
                </div>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0 md:self-start">
                <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600">
                  <h3 className="text-base font-bold tracking-[-0.01em] text-stone-900">Ce mai modifică netul</h3>
                  <p className="mt-2 text-sm leading-normal text-stone-600">La același brut, doi oameni pot primi sume diferite în mână. Contează:</p>
                  <ul className="mt-3 flex flex-col gap-3 text-sm leading-normal text-stone-600">
                    <li><strong className="font-semibold text-stone-900">Brutul, față de {lei(PLAFON_DEDUCERE)} lei.</strong> Sub acest prag primești <Link href="/deducere-personala-2026">deducerea personală</Link>, mai mare cu cât salariul e mai mic. Peste el, nu mai există.</li>
                    <li><strong className="font-semibold text-stone-900">Persoanele în întreținere.</strong> Măresc deducerea, dar doar sub {lei(PLAFON_DEDUCERE)} lei brut.</li>
                    <li><strong className="font-semibold text-stone-900">Vârsta sub 26 de ani.</strong> O deducere în plus, tot sub {lei(PLAFON_DEDUCERE)} lei brut.</li>
                    <li><strong className="font-semibold text-stone-900">Copiii la școală.</strong> 100 de lei scutiți de impozit pentru fiecare, la orice salariu.</li>
                    <li><strong className="font-semibold text-stone-900">Salariul minim.</strong> La normă întreagă, <Link href="/salariu-minim">200 de lei din brut</Link> nu se taxează deloc.</li>
                  </ul>
                  <p className="mt-auto pt-4 text-xs text-stone-600">Toate se bifează în calculatorul avansat.</p>
                </div>
              </aside>

            </div>

            {/* Rândul 2 – FAQ + surse oficiale și linkuri */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className="md:col-span-3">
                <h2 className={`mb-6 ${TITLU_SECTIUNE}`}>Întrebări frecvente</h2>
                <div className="flex flex-col">
                  {faqData.map((item, i) => (
                    <details key={i} name="faq" className="group border-b border-stone-200">
                      {/* min-h-11 = 44px, pragul de zona de atingere. Vezi nota
                          din componenta Faq: aceeasi corectie, alt fisier. */}
                      <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-4 text-base font-medium text-stone-900 [&::-webkit-details-marker]:hidden">
                        {item.q}
                        <span className="flex-shrink-0 text-xl text-stone-900 group-open:hidden">+</span>
                        <span className="hidden flex-shrink-0 text-xl text-stone-900 group-open:inline">−</span>
                      </summary>
                      <p className="mb-4 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0 md:self-start">
                <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <h3 className="mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Surse oficiale</h3>
                  <ul className="flex flex-col gap-2 text-sm [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600">
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener">HG 146/2026 – salariul minim</a></li>
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener">OUG 89/2025 – facilitate salariu minim</a></li>
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/293109" target="_blank" rel="noopener">OUG 156/2024 – eliminare facilități IT/construcții</a></li>
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener">Codul Fiscal (Legea 227/2015) – contribuții, impozit, deduceri</a></li>
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/75203" target="_blank" rel="noopener">Codul Muncii (Legea 53/2003) – salariul în contract</a></li>
                    <li className="text-stone-600">ANAF – Declarația 112</li>
                  </ul>

                  <h3 className="mt-6 mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Pagini conexe</h3>
                  <ul className="flex flex-col gap-2 text-sm">
                    {/* Legături editoriale către instrumentele și paginile
                        principale care altfel ar fi accesibile mai ales din
                        meniu sau footer. */}
                    {([
                      ["Salarii pe meserii", "/salarii"],
                      ["Salariul minim pe economie 2026", "/salariu-minim"],
                      ["Salariul minim în construcții", "/salariu-minim-constructii-2026"],
                      ["Salariul mediu pe economie", "/salariu-mediu"],
                      ["Deducerea personală 2026", "/deducere-personala-2026"],
                      ["Calculator salariu part-time", "/calculator-salariu-part-time"],
                      ["Calculator salariu construcții", "/calculator-salariu-constructii"],
                      ["Calculator taxe PFA și SRL", "/calculator-pfa"],
                      ["Calculator salarii învățământ", "/calculator-salariu-invatamant"],
                      ["Calculator salarii sănătate", "/calculator-salariu-sanatate"],
                      ["Calculator ore suplimentare și spor de noapte", "/calculator-ore-suplimentare"],
                      ["Generator fluturaș de salariu", "/fluturas-salariu"],
                      ["Zile lucrătoare 2026", "/zile-lucratoare-2026"],
                      ["Widget pentru site-ul tău", "/widget"],
                      // Singurul link intern spre pagina engleză: în subsol primea
                      // câte o parte din autoritatea fiecărei pagini pentru 35 de afișări.
                      ["Romanian salary calculator (English)", "/en/salary-calculator"],
                    ] as const).map(([label, href]) => (
                      <li key={href}>
                        <Link href={href} className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">{label}</Link>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 text-xs text-stone-600">Ultima actualizare: {PAGE_LAST_MODIFIED["/"].toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}.</p>
                </div>
              </aside>
            </div>

            <div className="border-t border-stone-200 pt-8">
              <h2 className={`mb-3 ${TITLU_SECTIUNE}`}>
                Calcule salariale populare
              </h2>
              <p className="mb-4 max-w-prose text-sm leading-normal text-stone-600">
                Calculele gata făcute pentru sumele căutate cel mai des.
              </p>
              <ul className="flex flex-wrap gap-2">
                {calculeBrutPopulare.map((valoare) => (
                  <li key={valoare}>
                    <Link
                      href={`/calculator/${calculatorSlugBrut(valoare)}`}
                      className="inline-flex min-h-11 items-center rounded border border-stone-300 bg-surface px-4 text-sm font-medium text-stone-900 shadow-soft transition-colors hover:border-stone-400"
                    >
                      {new Intl.NumberFormat("ro-RO").format(valoare)} lei brut → net
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>
      </div>
    </>
  );
}
