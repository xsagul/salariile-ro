// src/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import { personSchema } from "@/lib/person";
import { LAST_FISCAL_CONTENT_UPDATE } from "@/lib/seo";

// Metadata proprie homepage-ului (suprascrie default-ul global din layout, fără
// să atingă celelalte pagini). Țintește termenul cu cel mai mare volum din nișă,
// „calcul salariu net" (110K), plus head terms „salariu brut" / „brut în net".
export const metadata: Metadata = {
  title: {
    absolute: "Calcul salariu net 2026: calculator brut în net | Salariile.ro",
  },
  description:
    "Calcul salariu net din brut în 2026: pune salariul brut, vezi netul, cu CAS, CASS, impozit și costul angajatorului, conform HG 146/2026. Merge și invers, din net în brut. Fără reclame, fără cont.",
};

// 1. Extragem datele pentru a le folosi și în schema ascunsă, și pe ecran
const faqData = [
  {
    q: "Cum se calculează salariul net din brut?",
    a: "Din salariul brut se rețin CAS (25% pentru pensie), CASS (10% pentru sănătate) și impozitul pe venit (10%). Pentru veniturile sub 6.325 lei brut se aplică și deducerea personală, care reduce baza impozitului. Pe scurt: Net = Brut − CAS − CASS − Impozit. Calculatorul face și operația inversă, din net în brut, utilă la negocierea salariului.",
  },
  {
    q: "Care este salariul minim brut în România în 2026?",
    a: "Salariul minim brut pe economie este 4.325 lei din 1 iulie 2026, conform HG 146/2026. Salariul net corespunzător este 2.699 lei, cu facilitatea fiscală de 200 lei (OUG 89/2025). În prima jumătate a anului a fost 4.050 lei brut (2.574 lei net, facilitate 300 lei).",
  },
  {
    q: "Ce este deducerea personală și cui se aplică?",
    a: "Deducerea personală este o sumă scăzută din baza de calcul a impozitului pe venit. Se aplică salariaților cu venituri brute de până la 6.325 lei, doar pe funcția de bază. Suma depinde de venit și de numărul de persoane în întreținere. La salariul minim, deducerea de bază este de aproximativ 865 lei și crește cu numărul persoanelor în întreținere. Scade treptat pe măsură ce salariul urcă spre 6.325 lei, iar peste acest prag devine zero. În plus, se adaugă o deducere pentru tinerii sub 26 de ani (15% din salariul minim, circa 649 lei) și 100 lei pentru fiecare copil minor aflat în școlarizare.",
  },
  {
    q: "Ce facilități fiscale au angajații din IT și construcții?",
    a: "Începând cu 1 ianuarie 2025, facilitățile fiscale pentru sectoarele IT, construcții și agricultură/industrie alimentară au fost ELIMINATE conform OUG 156/2024. Anterior, acești angajați erau scutiți de impozit pe venit pentru salarii brute de până la 10.000 lei. Acum plătesc impozit ca în sectorul standard.",
  },
  {
    q: "Cât plătește total angajatorul pe lângă salariul brut?",
    a: "În plus față de salariul brut, angajatorul plătește Contribuția Asiguratorie pentru Muncă (CAM) de 2,25% din salariul brut. Aceasta nu afectează salariul net al angajatului. De exemplu, pentru un brut de 5.000 lei, costul total al firmei este 5.113 lei (5.000 + 113 lei CAM).",
  },
  {
    q: "Se trece salariul brut sau net în contractul de muncă?",
    a: "În contractul individual de muncă (CIM) se trece întotdeauna salariul brut – este suma negociată și declarată la ANAF. Salariul net, banii primiți efectiv „în mână”, nu apare ca atare în contract: rezultă din brut după reținerea CAS (25%), CASS (10%) și a impozitului pe venit (10%). De aceea, la negociere, clarifică mereu dacă suma discutată este brută sau netă, fiindcă diferența este semnificativă – pentru un salariu standard, contribuțiile și impozitul înseamnă circa 41% din brut.",
  },
  {
    q: "Ce sunt tichetele de masă din punct de vedere fiscal?",
    a: "Tichetele de masă sunt un beneficiu extrasalarial: cel mult un tichet pe zi lucrată, cu valoare nominală de maximum 45 lei (Legea 201/2025). Pentru angajat, tichetele sunt supuse CASS (10%) și impozitului pe venit (10%), dar NU și CAS – iar aceste taxe se rețin din salariul în bani, cardul de tichete primind valoarea integrală. Angajatorul nu datorează contribuții pentru tichete (nici CAM); costul lui este valoarea nominală. De aceea, cu tichete, suma din cont poate coborî puțin sub netul standard – calculatorul le afișează separat, exact ca pe fluturaș.",
  },
];

const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://salariile.ro/#organization",
      name: "Salariile.ro",
      url: "https://salariile.ro",
      logo: {
        "@type": "ImageObject",
        url: "https://salariile.ro/og-image.png",
      },
      founder: { "@id": "https://salariile.ro/#person" },
    },
    personSchema,
    {
      "@type": "WebPage",
      "@id": "https://salariile.ro/#webpage",
      url: "https://salariile.ro/",
      name: "Calcul salariu net 2026: calculator brut în net",
      inLanguage: "ro",
      // Aceeași dată ca lastModified din sitemap și ca „Ultima actualizare" vizibilă —
      // consistența între bylineDate / sitemap / schema e un semnal de încredere.
      dateModified: LAST_FISCAL_CONTENT_UPDATE.toISOString().slice(0, 10),
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

// Conținutul „Cum funcționează calculul" – definit O SINGURĂ DATĂ și folosit
// atât în layout-ul mobil (secțiune always-open), cât și ca primul tab pe desktop.
const cumFunctioneazaTitlu = "Cum funcționează calculul";
const cumFunctioneazaBody = (
  <>
    <p className="mb-4 text-base leading-normal tracking-[-0.01em] text-stone-600">
      Din salariul brut se rețin trei contribuții obligatorii: <strong>CAS</strong> (25% pentru pensie), <strong>CASS</strong> (10% pentru sănătate) și <strong>impozitul pe venit</strong> (10%). Pentru salariile sub 6.325 lei brut se aplică o deducere personală care reduce baza de calcul a impozitului.
    </p>
    <p className="mb-4 text-base leading-normal tracking-[-0.01em] text-stone-600">
      Salariații plătiți la nivelul <Link href="/salariu-minim">salariului minim</Link> au o sumă fixă de 200 lei scutită de contribuții (OUG 89/2025). Salariul minim brut este <strong>4.325 lei din 1 iulie 2026</strong> (HG 146/2026). Pentru referință statistică, <Link href="/salariu-mediu">salariul mediu brut pe economie</Link> în 2026 este 9.192 lei.
    </p>
    <p className="mb-4 text-base leading-normal tracking-[-0.01em] text-stone-600">
      Pe lângă salariul brut, angajatorul mai plătește o contribuție de 2,25% (CAM – Contribuția Asiguratorie pentru Muncă), care nu afectează salariul net al angajatului dar crește costul total al firmei.
    </p>
  </>
);

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

            {/* Rândul 1 – articol „Cum funcționează" + repere fiscale */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className="md:col-span-3 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600 [&_strong]:font-bold">
                <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">{cumFunctioneazaTitlu}</h2>
                <div className="max-w-prose">{cumFunctioneazaBody}</div>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0">
                <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <h3 className="mb-3 text-xs font-medium text-stone-500">Repere fiscale · 2026</h3>
                  <dl className="text-sm">
                    {([
                      ["Salariu minim net", "2.699 lei"],
                      ["Salariu mediu net", "5.377 lei"],
                      ["Plafon deducere personală", "6.325 lei"],
                      ["CAS (pensie)", "25%"],
                      ["CASS (sănătate)", "10%"],
                      ["Impozit pe venit", "10%"],
                      ["CAM (angajator)", "2,25%"],
                    ] as const).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between border-b border-stone-100 py-2 last:border-b-0">
                        <dt className="text-stone-600">{k}</dt>
                        <dd className="font-medium tabular-nums text-stone-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-xs text-stone-500">Net standard, funcție de bază. Brut: minim 4.325 lei (HG 146/2026), mediu 9.192 lei.</p>
                </div>
              </aside>
            </div>

            {/* Rândul 2 – FAQ + surse oficiale și linkuri */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className="md:col-span-3">
                <h2 className="mb-6 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">Întrebări frecvente</h2>
                <div className="flex flex-col">
                  {faqData.map((item, i) => (
                    <details key={i} name="faq" className="group border-b border-stone-200 py-4">
                      <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium text-stone-900 [&::-webkit-details-marker]:hidden">
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
                  <ul className="flex flex-col gap-2 text-sm [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600">
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" target="_blank" rel="noopener">HG 146/2026 – salariul minim</a></li>
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" target="_blank" rel="noopener">OUG 89/2025 – facilitate salariu minim</a></li>
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/293109" target="_blank" rel="noopener">OUG 156/2024 – eliminare facilități IT/construcții</a></li>
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener">Codul Fiscal (Legea 227/2015) – contribuții, impozit, deduceri</a></li>
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/75203" target="_blank" rel="noopener">Codul Muncii (Legea 53/2003) – salariul în contract</a></li>
                    <li className="text-stone-600">ANAF – Declarația 112</li>
                  </ul>

                  <h3 className="mb-3 mt-6 text-xs font-medium text-stone-500">Pagini conexe</h3>
                  <ul className="flex flex-col gap-2 text-sm">
                    {([
                      ["Calculator salariu minim", "/salariu-minim"],
                      ["Salariul minim net", "/salariu-minim#net"],
                      ["Salariul mediu pe economie", "/salariu-mediu"],
                      ["Calculator taxe PFA", "/calculator-pfa"],
                    ] as const).map(([label, href]) => (
                      <li key={href}>
                        <Link href={href} className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">{label}</Link>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 text-xs text-stone-500">Ultima actualizare: 8 iunie 2026.</p>
                </div>
              </aside>
            </div>

          </div>
        </section>
      </div>
    </>
  );
}
