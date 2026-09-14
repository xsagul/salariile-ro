// src/app/page.tsx
import type { Metadata } from "next";
import Link from "@/app/components/Link";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import { personSchema } from "@/lib/person";
import { calculatorSlugBrut, PAGE_LAST_MODIFIED, ogPage, twPage } from "@/lib/seo";

import { H1, Lead } from "@/app/components/ui";
import { calculStandard, SALARIU_MINIM, CAS_PROCENT, CASS_PROCENT, IMPOZIT_PROCENT, CAM_PROCENT, DEDUCERE_MINIM } from "@/lib/fiscal";

const numar = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
const procent = (n: number) => new Intl.NumberFormat("ro-RO", { style: "percent", maximumFractionDigits: 2 }).format(n);
const exempluNet = calculStandard(5000)!;
const minimNet = calculStandard(SALARIU_MINIM)!;
const descriere = "Calculează salariul net din brut sau brutul din net în 2026. Vezi banii primiți, taxele, deducerile și costul angajatorului. Include tichete de masă.";

// Metadata proprie homepage-ului (suprascrie default-ul global din layout, fără
// să atingă celelalte pagini). Țintește termenul cu cel mai mare volum din nișă,
// „calculator salariu net" (90.500/lună în snapshotul DataForSEO din 2026-07-15),
// plus head terms „salariu brut" / „brut în net".
export const metadata: Metadata = {
  title: {
    absolute: "Calculator salariu net 2026: brut în net și invers",
  },
  description: descriere,
  openGraph: ogPage({ title: "Calculator salariu net 2026: brut în net și invers", description: descriere, path: "/" }),
  twitter: twPage({ title: "Calculator salariu net 2026: brut în net și invers", description: descriere }),
  alternates: { canonical: "https://salariile.ro" },
};

// 1. Extragem datele pentru a le folosi și în schema ascunsă, și pe ecran
const faqData = [
  {
    q: "Ce înseamnă salariu brut și salariu net?",
    a: "Salariul brut este suma înainte de reținerile fiscale. Salariul net este suma rămasă după contribuții și impozit. Pentru a compara două oferte, verifică dacă ambele sume sunt brute sau nete și dacă beneficiile, precum tichetele de masă, sunt incluse ori acordate separat.",
  },
  {
    q: "Salariul de bază este același lucru cu salariul brut?",
    a: "Salariul de bază este componenta fixă a remunerației. Venitul brut al unei luni poate include și sporuri, indemnizații sau alte adaosuri, potrivit art. 160 din Codul muncii. Dacă ai ore suplimentare sau bonusuri, brutul lunar poate fi mai mare decât salariul de bază din contract.",
  },
  {
    q: "Ce înseamnă avans și lichidare la salariu?",
    a: "Avansul este o parte din salariu plătită înaintea plății finale a lunii. Lichidarea este suma rămasă de achitat după scăderea avansului și a reținerilor aplicabile. Nu sunt două salarii: compară totalul net pentru aceeași lună. Datele de plată sunt cele stabilite prin contract sau regulamentul intern, conform art. 166 din Codul muncii.",
  },
  {
    q: "Cum se calculează salariul net din brut?",
    // Google ignoră meta descrierea homepage-ului și își compune singur snippetul
    // din acest răspuns. De aceea textul trebuie să se citească bine SCOS din
    // context: fără formula cu minusuri, care arăta rupt în SERP, și fără
    // referiri la „calculatorul de aici" (întrebarea următoare acoperă oricum
    // calculul invers).
    a: `La 5.000 lei brut rămân ${numar(exempluNet.netBani)} lei net, pentru o lună întreagă, funcție de bază, fără tichete, persoane în întreținere sau scutiri. Din brut se rețin CAS (${procent(CAS_PROCENT)}), CASS (${procent(CASS_PROCENT)}) și impozitul pe venit (${procent(IMPOZIT_PROCENT)} din baza impozabilă, după contribuții și deduceri). Exemplul folosește regulile din iulie–decembrie 2026.`,
  },
  {
    q: "Cum folosesc calculatorul de salarii brut-net?",
    a: "Alegi Din brut în net sau Din net în brut, introduci suma lunară și apeși Calculează. Dacă primești tichete, ai persoane în întreținere, ai sub 26 de ani sau beneficiezi de o scutire, completezi și opțiunile. Rezultatul se actualizează când apeși din nou Calculează.",
  },
  {
    q: "Care este salariul minim brut în România în 2026?",
    a: `Salariul minim brut este ${numar(SALARIU_MINIM)} lei din 1 iulie 2026, conform HG 146/2026. În cazul standard, netul este ${numar(minimNet.netBani)} lei. Acesta include facilitatea de ${numar(DEDUCERE_MINIM)} lei netaxabili, dacă sunt îndeplinite condițiile OUG 89/2025. Valorile și condițiile pentru ambele semestre sunt explicate pe pagina salariului minim.`,
  },
  {
    q: "Ce este deducerea personală și cui se aplică?",
    a: "Deducerea personală reduce baza impozitului pe venit, nu suma contribuțiilor. Deducerea de bază se aplică la funcția de bază, în limita plafonului de venit, și depinde de salariul brut și persoanele în întreținere. Există și deduceri suplimentare pentru tinerii sub 26 de ani și copiii școlarizați, fiecare cu propriile condiții. Completează situația ta în opțiunile calculatorului.",
  },
  {
    q: "Ce facilități fiscale au angajații din IT și construcții?",
    a: "Facilitățile fiscale sectoriale pentru IT, construcții și agricultură/industria alimentară au fost eliminate de la 1 ianuarie 2025, conform OUG 156/2024. Calculatorul folosește regulile generale. Alte scutiri individuale se aplică numai dacă sunt îndeplinite condițiile legale.",
  },
  {
    q: "Cât plătește total angajatorul pe lângă salariul brut?",
    a: `Angajatorul plătește contribuția asiguratorie pentru muncă (CAM), cu o cotă de ${procent(CAM_PROCENT)} aplicată bazei de calcul. Pentru 5.000 lei brut, fără tichete, costul total este ${numar(exempluNet.costTotal)} lei. Când se aplică facilitatea pentru salariul minim, suma netaxabilă reduce și baza CAM. Tichetele se adaugă separat la costul firmei.`,
  },
  {
    q: "Se trece salariul brut sau net în contractul de muncă?",
    a: "În contractul individual de muncă se specifică salariul de bază brut. Netul rezultă după contribuții și impozit și poate varia cu deducerile, tichetele sau alte elemente ale lunii. La negociere, clarifică dacă suma discutată este brută sau netă și ce beneficii sunt acordate separat.",
  },
  {
    q: "Ce sunt tichetele de masă din punct de vedere fiscal?",
    a: "Tichetele de masă se acordă separat de salariul în bani. Taxele aferente lor se rețin din salariu, iar pe cardul de masă intră valoarea nominală. De aceea, suma primită în cont poate fi mai mică decât netul fără tichete. Introdu numărul și valoarea tichetelor în opțiunile calculatorului: rezultatul arată separat banii și tichetele.",
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
      "@type": "WebSite",
      "@id": "https://salariile.ro/#website",
      url: "https://salariile.ro/",
      name: "Salariile.ro",
      alternateName: "Calculator salariu net România",
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

const calculeBrutPopulare = [SALARIU_MINIM, 5000, 7000, 10000, 20000];
const faqPrincipale = [faqData[3], faqData[0], faqData[4], faqData[5], faqData[6], faqData[10]];
const faqAlte = [faqData[1], faqData[2], faqData[7], faqData[8], faqData[9]];
const linkClass = "font-medium text-stone-900 underline underline-offset-4 hover:text-stone-600 focus-visible:outline-2 focus-visible:outline-offset-4";

function Intrebare({ item }: { item: { q: string; a: string } }) {
  return <details name="faq" className="group border-b border-stone-200">
    <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-5 py-4 text-sm font-medium text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
      {item.q}<span aria-hidden="true" className="group-open:hidden">+</span><span aria-hidden="true" className="hidden group-open:inline">−</span>
    </summary>
    <p className="mb-5 max-w-prose text-sm leading-relaxed text-stone-600">{item.a}</p>
  </details>;
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }} />
      <div className="bg-canvas [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4">
        <section aria-labelledby="titlu-homepage" className="mx-auto max-w-6xl px-4 pb-5 pt-7 sm:px-6 sm:pb-6 sm:pt-9">
          <div id="titlu-homepage"><H1>Calculator salariu net 2026</H1></div>
          <Lead>Introdu salariul brut și află câți bani primești. Poți calcula și invers, din net în brut.</Lead>
        </section>
        <CalculatorSalariu homepage />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-stone-300 pb-6 text-xs leading-relaxed text-stone-600">
            <span>Reguli aplicabile din 1 iulie 2026.</span>
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/308231" className={linkClass}>HG 146/2026</a><span aria-hidden="true">·</span>
            <a href="https://legislatie.just.ro/Public/DetaliiDocument/305817" className={linkClass}>OUG 89/2025</a>
          </div>

          <section aria-labelledby="alte-calcule" className="border-b border-stone-300 py-6 sm:flex sm:items-baseline sm:gap-8">
            <h2 id="alte-calcule" className="shrink-0 text-sm font-semibold text-stone-900">Ai nevoie de alt calcul?</h2>
            <ul className="mt-2 flex flex-wrap gap-x-6 sm:mt-0">
              {[["Învățământ", "/calculator-salariu-invatamant"], ["Part-time", "/calculator-salariu-part-time"], ["PFA", "/calculator-pfa"], ["Ore suplimentare", "/calculator-ore-suplimentare"]].map(([label, href]) => <li key={href}><Link href={href} className={`${linkClass} inline-flex min-h-11 items-center text-sm`}>{label}<span aria-hidden="true" className="ml-2">↗</span></Link></li>)}
            </ul>
          </section>

          <section aria-labelledby="cum-se-calculeaza" className="grid gap-8 border-b border-stone-300 py-9 sm:py-10 md:grid-cols-5 md:gap-12">
            <div className="md:col-span-3">
              <h2 id="cum-se-calculeaza" className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Cum se calculează salariul net?</h2>
              <p className="mt-4 max-w-prose text-base leading-relaxed text-stone-600">Din brut se scad contribuțiile pentru pensie (CAS), sănătate (CASS) și impozitul pe venit. Impozitul se aplică bazei rămase după contribuții și deduceri.</p>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">La <strong className="text-stone-900">5.000 lei brut</strong>, rezultatul standard este <strong className="text-stone-900">{numar(exempluNet.netBani)} lei net</strong>. Tichetele, deducerile și scutirile pot schimba suma primită.</p>
              <p className="mt-3 text-xs leading-relaxed text-stone-600">Exemplu pentru iulie–decembrie 2026: normă întreagă, funcție de bază, fără tichete sau persoane în întreținere, vârstă de cel puțin 26 de ani, fără scutiri.</p>
              <Link href="/metodologie" className={`${linkClass} mt-3 inline-flex min-h-11 items-center text-sm`}>Vezi formula și condițiile de calcul <span aria-hidden="true" className="ml-2">→</span></Link>
            </div>
            <aside className="md:col-span-2">
              <h3 className="text-sm font-semibold text-stone-900">Din brut în net, pentru o sumă anume</h3>
              <ul className="mt-3 divide-y divide-stone-200">
                {calculeBrutPopulare.map((valoare) => <li key={valoare}><Link href={`/calculator/${calculatorSlugBrut(valoare)}`} className="flex min-h-11 items-center justify-between gap-4 py-2 text-sm text-stone-700 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-4"><span>{numar(valoare)} lei brut</span><span className="font-medium text-stone-900">{numar(calculStandard(valoare)!.netBani)} lei net <span aria-hidden="true">↗</span></span></Link></li>)}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-stone-600">Aceleași ipoteze standard ca în exemplu. <Link href="/salariu-minim" className={linkClass}>Vezi salariul minim și condițiile facilității.</Link></p>
            </aside>
          </section>

          <section aria-labelledby="faq-home" className="grid gap-8 border-b border-stone-300 py-9 sm:py-10 md:grid-cols-5 md:gap-12">
            <div className="md:col-span-2">
              <h2 id="faq-home" className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Întrebări despre calcul</h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">Brut, net, deduceri și tichete: explicațiile de care ai nevoie pentru a înțelege rezultatul.</p>
            </div>
            <div className="md:col-span-3">
              {faqPrincipale.map(item => <Intrebare key={item.q} item={item} />)}
              <details className="mt-3">
                <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-stone-900 underline underline-offset-4">Alte întrebări despre salariu</summary>
                {faqAlte.map(item => <Intrebare key={item.q} item={item} />)}
              </details>
            </div>
          </section>

          <section aria-labelledby="salarii-meserii" className="grid gap-6 border-b border-stone-300 py-9 sm:py-10 md:grid-cols-5 md:gap-12">
            <div className="md:col-span-3">
              <h2 id="salarii-meserii" className="text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Cât se câștigă în meseria ta?</h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-stone-600">Consultă salarii din anunțuri, salarii declarate și grile publice. Sursele și perioadele sunt afișate separat, ca să știi ce compari.</p>
              <Link href="/salarii" className={`${linkClass} mt-3 inline-flex min-h-11 items-center text-sm`}>Vezi salariile pe meserii <span aria-hidden="true" className="ml-2">→</span></Link>
            </div>
            <nav aria-label="Informații salariale" className="flex flex-col items-start text-sm md:col-span-2">
              {[["Compară două meserii", "/compara"], ["Salariul mediu în România", "/salariu-mediu"], ["Zile libere 2026", "/zile-libere-2026"]].map(([label, href]) => <Link key={href} href={href} className={`${linkClass} inline-flex min-h-11 items-center`}>{label}</Link>)}
            </nav>
          </section>

          <section aria-labelledby="surse-home" className="grid gap-5 py-8 text-xs leading-relaxed text-stone-600 md:grid-cols-5 md:gap-12">
            <div className="md:col-span-2">
              <h2 id="surse-home" className="text-sm font-semibold text-stone-900">Surse și verificare</h2>
              <p className="mt-2">Proiect de <Link href="/despre" className={linkClass}>Știuriuc Sorin-Marian</Link>.</p>
              <p className="mt-1">Conținut revizuit: <time dateTime={PAGE_LAST_MODIFIED["/"].toISOString().slice(0, 10)}>{PAGE_LAST_MODIFIED["/"].toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time>.</p>
            </div>
            <div className="md:col-span-3">
              <ul className="flex flex-wrap gap-x-5 gap-y-3">
                <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" className={linkClass}>Codul fiscal · contribuții și deduceri</a></li>
                <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/75203" className={linkClass}>Codul muncii · salariul în contract</a></li>
                <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/293109" className={linkClass}>OUG 156/2024 · facilități eliminate</a></li>
              </ul>
              <p className="mt-3">Calcule orientative. Pentru situații speciale, verifică <Link href="/metodologie" className={linkClass}>ipotezele și limitele metodei</Link>. Cotele standard: CAS {procent(CAS_PROCENT)}, CASS {procent(CASS_PROCENT)}, impozit {procent(IMPOZIT_PROCENT)}, CAM {procent(CAM_PROCENT)}.</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
