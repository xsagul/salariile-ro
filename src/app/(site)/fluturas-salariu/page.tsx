// app/fluturas-salariu/page.tsx
// Landing dedicat: generator de fluturaș de salariu (PDF) + explicații.
// Refolosește CalculatorSalariu (butonul „Descarcă fluturaș PDF" există deja
// în componenta de rezultat); pagina adaugă contextul editorial și FAQ-ul.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import { Formula, PaginiConexe, Section, PaginaCuCuprins } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Fluturaș de salariu: generator PDF 2026",
  description:
    "Generează gratuit un fluturaș de salariu PDF, cu rândurile statului de plată: brut, net, CAS, CASS, impozit, deducere personală și cost angajator, 2026.",
  alternates: { canonical: "https://salariile.ro/fluturas-salariu" },
  openGraph: ogPage({
    title: "Fluturaș de salariu: generator PDF 2026",
    description:
      "Generează un fluturaș de salariu PDF cu ore suplimentare, sporuri, tichete și rețineri, calculat pe legislația 2026.",
    path: "/fluturas-salariu",
  }),
  twitter: twPage({
    title: "Fluturaș de salariu: generator PDF 2026",
    description:
      "Generează un fluturaș de salariu PDF cu ore suplimentare, sporuri, tichete și rețineri, calculat pe legislația 2026.",
  }),
};

const FAQ = [
  {
    q: "Este angajatorul obligat să-mi dea fluturaș?",
    a: "Legea nu numește fluturașul, dar îi cere angajatorului să poată dovedi plata salariului, iar tu ai dreptul să vezi cum s-a calculat. În practică, aproape toate firmele îl dau, iar multe contracte colective îl prevăd. Dacă nu-l primești, cere-l în scris.",
  },
  {
    q: "Ce verific prima dată pe fluturaș?",
    a: "Trei lucruri. Brutul să fie cel din contract. Deducerea personală să apară, dacă ai sub 6.325 lei brut la locul de muncă de bază. Iar la salariul minim, cei 200 de lei netaxați să fie scăzuți din baza taxelor, altfel pierzi cam 80–100 de lei pe lună.",
  },
  {
    q: "Fluturașul generat aici e valabil oficial?",
    a: "Nu. E un document orientativ, calculat după regulile fiscale în vigoare, bun ca să verifici fluturașul primit sau o ofertă de salariu. Documentul oficial îl emite doar angajatorul.",
  },
  {
    q: "Pot adăuga ore suplimentare, sporuri sau o lună lucrată parțial?",
    a: "Da. În opțiunile avansate poți pune orele lucrate, orele suplimentare cu sporul lor, sporurile și primele, tichetele de masă, avansul sau popririle și numele firmei. Dacă ai salariul minim și sporurile nu trec brutul peste 4.600 de lei, cei 200 de lei netaxați se păstrează.",
  },
  {
    q: "De ce ar putea diferi fluturașul meu de calculul de aici?",
    a: "Generatorul nu acoperă concediul medical, concediul de odihnă plătit la medie, cumulul de funcții sau deducerile negociate separat. Dacă ai avut ceva din astea în lună, fluturașul angajatorului rămâne referința.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Fluturaș de salariu", item: "https://salariile.ro/fluturas-salariu" },
      ],
    },
    {
      "@type": "WebApplication",
      "@id": "https://salariile.ro/fluturas-salariu#generator",
      name: "Generator fluturaș de salariu PDF",
      url: "https://salariile.ro/fluturas-salariu",
      description:
        "Generator gratuit de fluturaș de salariu în format PDF, cu CAS, CASS, impozit, deducere personală și tichete de masă, conform legislației 2026.",
      applicationCategory: "FinanceApplication",
      operatingSystem: "All",
      isAccessibleForFree: true,
      publisher: { "@type": "Organization", name: "Salariile", url: "https://salariile.ro" },
      author: personSchema,
    },
    {
      "@type": "WebPage",
      url: "https://salariile.ro/fluturas-salariu",
      name: "Fluturaș de salariu: generator PDF gratuit și model explicat 2026",
      inLanguage: "ro",
      dateModified: PAGE_LAST_MODIFIED["/fluturas-salariu"].toISOString().slice(0, 10),
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

export default function FluturasSalariuPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <CalculatorSalariu
          modInitial="brut"
          fluturas
          titluCustom={<>Generator fluturaș de salariu</>}
          subtitluCustom={
            <>
              Scrie salariul de bază, apasă Calculează și descarcă fluturașul în PDF, în formatul programelor de
              salarizare. Orele suplimentare, sporurile, tichetele și avansul sunt în opțiunile avansate.
            </>
          }
        />
      </div>

      <PaginaCuCuprins cta={{ titlu: "Generează-ți fluturașul", text: "Scrie salariul de bază și descarcă PDF-ul.", href: "#calc-layout", eticheta: "Înapoi la generator" }}>
      <Section>
        <h2>Cum se calculează un fluturaș</h2>
        <p>
          Orice fluturaș are trei părți: ce ți se cuvine în luna respectivă, ce se reține din asta și ce rămâne de
          plată. PDF-ul generat aici le așază în aceeași ordine ca programele de salarizare ale firmelor.
        </p>
        <Formula
          eticheta="Structura unui fluturaș de salariu"
          randuri={[
            "Drepturi      = salariu de bază + ore suplimentare + sporuri",
            "Rețineri      = CAS + CASS + impozit",
            "Net           = drepturi − rețineri",
            "Rest de plată = net − avans − popriri",
          ]}
        />
        <p>
          Taxele se calculează ca la <Link href="/">orice salariu</Link>. Tichetele de masă intră întregi pe card,
          dar taxele pe ele se opresc din salariul în bani, așa că apar pe un rând separat.
        </p>
        <p className="source-note">
          Ca să înțelegi fiecare rând de pe fluturașul primit de la firmă, citește{" "}
          <Link href="/noutati/cum-citesti-fluturasul-de-salariu">cum îți citești fluturașul</Link>. Pentru lunile cu
          zile de boală sau cu tichete, vezi ghidurile despre{" "}
          <Link href="/noutati/concediu-medical-2026">concediul medical</Link> și{" "}
          <Link href="/noutati/tichete-de-masa-2026">tichetele de masă</Link>.
        </p>
      </Section>

      <Section>
        <h2>Fluturaș, stat de plată sau adeverință de salariu</h2>
        <p>
          Toate trei pornesc din același calcul lunar, dar servesc la lucruri diferite.
        </p>
        <ul>
          <li>
            <strong>Statul de plată</strong> e documentul firmei, cu toți salariații pe el. Se semnează ca
            dovadă a plății și se arhivează ca orice act contabil.
          </li>
          <li>
            <strong>Fluturașul</strong> e rândul tău din statul de plată: aceleași cifre, dar numai ale tale.
          </li>
          <li>
            <strong>Adeverința de salariu</strong> o ceri pentru bancă sau pentru o instituție. Arată de obicei
            venitul pe mai multe luni, nu calculul unei singure luni.
          </li>
        </ul>
        <p>
          Pentru un singur salariat, calculul de aici îți dă toate rândurile unui stat de plată. Rămâne însă un
          model: statul oficial îl întocmește și îl semnează angajatorul.
        </p>
      </Section>

      <Section>
        <h2>La ce îți folosește</h2>
        <ul>
          <li>
            <strong>Verifici fluturașul primit.</strong> Îl generezi pe al tău și compari rând cu rând. O deducere
            lipsă sau o scutire neaplicată se văd imediat.
          </li>
          <li>
            <strong>Înțelegi o ofertă de muncă.</strong> Oferta vine în brut, fluturașul îți arată cât rămâne în mână.
          </li>
          <li>
            <strong>Negociezi o mărire.</strong> Vezi cât din fiecare sută de lei în plus ajunge la tine și cât la stat.
          </li>
        </ul>
      </Section>

      <Section>
        <h2>Întrebări frecvente</h2>
        <div className="flex flex-col">
          {FAQ.map((item, i) => (
            <details key={i} name="faq-fluturas" className="group border-b border-stone-200">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-4 text-base font-medium tracking-[-0.01em] text-stone-900 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex-shrink-0 text-xl text-stone-900 group-open:hidden">+</span>
                <span className="hidden flex-shrink-0 text-xl text-stone-900 group-open:inline">−</span>
              </summary>
              <p className="mb-4 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="source-note">
          Surse: Codul Muncii (Legea 53/2003, art. 166–168), Codul Fiscal (Legea 227/2015), HG 146/2026, OUG 89/2025.
          Ultima actualizare: {PAGE_LAST_MODIFIED["/fluturas-salariu"].toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}.
        </p>
      </Section>
      </PaginaCuCuprins>
      <PaginiConexe
        linkuri={[
          { href: "/salarii", label: "Salarii pe meserii", descriere: "Cât se câștigă în fiecare meserie." },
          { href: "/salariu-minim", label: "Salariul minim 2026", descriere: "Cât e minimul și cum se ajunge la net." },
          { href: "/widget", label: "Widget pentru site-ul tău", descriere: "Pune calculatorul pe propriul site, gratuit și fără cont." },
          { href: "/metodologie", label: "Metodologia de calcul", descriere: "Formula completă, sursele și limitele calculului." },
          { href: "/smartbill", label: "SmartBill și salarizare", descriere: "Prețuri, SmartBill Conta, D112 și funcțiile pentru salarii." },
          { href: "/saga", label: "SAGA pentru salarii", descriere: "SAGA C, SAGA WEB, D112 și licențiere." },
        ]}
      />
    </>
  );
}
