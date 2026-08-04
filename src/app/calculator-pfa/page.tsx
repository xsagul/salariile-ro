// app/calculator-pfa/page.tsx
// Pagină calculator taxe PFA 2026 — structură oglindă a paginii principale
// (hero pe grilă + calculator + zonă-articol 3+2 cu carduri-companion).

import type { Metadata } from "next";
import Link from "next/link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import CalculatorPFA from "@/app/components/CalculatorPFA";
import TabelArticol from "@/app/components/TabelArticol";
import {
  calculeazaPFA,
  calculeazaPfaNormaVenit,
  CURS_MEDIU_EUR_2025,
  PLAFON_CAS_12_2026,
  PLAFON_CAS_24_2026,
  PLAFON_NORMA_VENIT_LEI,
  SALARIU_MINIM_PFA_2026,
} from "@/lib/pfa";
import { PLAFON_MICRO_LEI } from "@/lib/forme-juridice";

// Titlul și descrierea urmează intenția reală din SERP, nu doar cuvântul-cheie.
// Descrierea veche se termina cu „salariul minim de 4.050 lei" și arăta depășită
// în rezultate, deși e corectă: plafoanele PFA folosesc minimul de la 1 ianuarie.
const PFA_TITLU = "Calculator taxe PFA 2026: cât rămâne, pe tranșe de venit";
const PFA_DESC =
  "Vezi ce plătește un PFA în sistem real în 2026, pe tranșe de venit, și cât îi rămâne.";

export const metadata: Metadata = {
  title: { absolute: PFA_TITLU },
  description:
    "La 60.000 lei venit net, un PFA plătește 22.335 lei taxe și rămâne cu 37.665 lei. Tabel pe tranșe, pragul CAS care costă 10.854 lei și comparație PFA vs SRL.",
  alternates: { canonical: "https://salariile.ro/calculator-pfa" },
  openGraph: ogPage({ title: PFA_TITLU, description: PFA_DESC, path: "/calculator-pfa" }),
  twitter: twPage({ title: PFA_TITLU, description: PFA_DESC }),
};

const FAQ = [
  {
    q: "Ce taxe plătește un PFA în 2026?",
    a: "În sistem real, un PFA plătește impozit pe venit 10%, CAS (pensie) 25% dacă venitul net anual atinge cel puțin 12 salarii minime (48.600 lei) și CASS (sănătate) 10% pe venitul net, cu plafon maxim de 72 de salarii minime. Dacă venitul net este sub 6 salarii minime, în mod obișnuit se datorează și diferența CASS până la contribuția minimă, cu excepțiile prevăzute de Codul fiscal.",
  },
  {
    q: "De la ce venit plătesc CAS ca PFA?",
    a: "CAS se datorează doar dacă venitul net anual atinge 12 salarii minime, adică 48.600 lei în 2026. Între 12 și 24 de salarii minime, baza minimă e 12 minime (CAS = 12.150 lei/an). De la 24 de salarii minime (97.200 lei) în sus, baza minimă e 24 de minime (CAS = 24.300 lei/an). Atenție: art. 148 alin. (2) din Codul fiscal spune că baza este venitul ales de contribuabil, care nu poate fi mai mic decât aceste praguri – deci 24.300 lei este CAS la baza minimă a tranșei superioare, nu un plafon maxim. Poți opta pentru o bază mai mare în Declarația unică. Sub prag, CAS e opțional; pensionarii sunt scutiți (art. 150).",
  },
  {
    q: "Cât este CASS și are plafon?",
    a: "CASS este 10% din venitul net, până la plafonul de 72 de salarii minime (291.600 lei) în 2026, deci cel mult 29.160 lei (art. 170 alin. (1)). Dacă venitul net este sub 6 salarii minime (24.300 lei), se datorează de regulă diferența până la CASS minimă de 2.430 lei (art. 174 alin. (6)). Diferența nu se datorează, între altele, dacă ai venituri salariale de cel puțin 24.300 lei în anul fiscal sau venituri din pensii – excepțiile sunt enumerate la art. 174 alin. (7) și (8).",
  },
  {
    q: "Ce salariu minim se folosește la plafoanele PFA în 2026?",
    a: "Se folosește salariul minim în vigoare la 1 ianuarie 2026 – 4.050 lei. Regula este la art. 135^1 alin. (3) din Codul fiscal: se ia minimul de la 1 ianuarie al anului de venit, indiferent dacă în cursul aceluiași an se folosesc mai multe valori ale salariului minim. Majorarea la 4.325 lei din 1 iulie 2026 nu schimbă deci plafoanele anului 2026. Obligațiile pentru 2026 se declară și se plătesc prin Declarația unică până la 25 mai 2027 inclusiv (art. 122 alin. (3)).",
  },
  {
    q: "Care e diferența dintre sistem real și normă de venit?",
    a: "În sistem real, taxele se calculează pe venitul net efectiv, adică încasări minus cheltuieli deductibile. La normă de venit, direcția regională a finanțelor publice stabilește un venit fix pentru activitatea autorizată, iar taxele se aplică la acea normă, indiferent cât încasezi efectiv. Calculatorul de aici acoperă ambele regimuri, iar dacă introduci și încasările reale îți arată care dintre ele te costă mai puțin.",
  },
  {
    q: "Cum se calculează impozitul la normă de venit?",
    a: "Impozitul este 10% aplicat direct pe norma anuală ajustată, fără să scazi CAS și CASS, iar impozitul este final (art. 69^2 alin. (1) din Codul fiscal). Deducerea contribuțiilor prevăzută la art. 118 alin. (2) privește veniturile al căror venit net anual se determină în sistem real, pe baza datelor din contabilitate. Norma ține locul venitului net și la contribuții: ea este suma comparată cu plafoanele CAS și CASS (art. 148 alin. (3) și art. 170 alin. (1)), nu încasările efective.",
  },
  {
    q: "Când sunt obligat să trec de la normă de venit la sistem real?",
    a: `Dacă în anul fiscal precedent ai încasat un venit brut mai mare decât echivalentul în lei a 25.000 de euro, începând cu anul următor ai obligația să determini venitul net în sistem real. La cursul mediu folosit în calculator, pragul înseamnă aproximativ ${new Intl.NumberFormat("ro-RO").format(PLAFON_NORMA_VENIT_LEI)} lei.`,
  },
  {
    q: "PFA sau SRL: care iese mai bine în 2026?",
    a: "Depinde de nivelul veniturilor și de cheltuielile reale, iar diferența este adesea mai mică decât se crede. La 200.000 lei încasări și 20.000 lei cheltuieli, PFA în sistem real și SRL microîntreprindere ies la câteva sute de lei distanță pe an – sub costul anual de contabilitate al unui SRL, deci în interiorul marjei de eroare. SRL cu impozit pe profit iese vizibil mai prost la acest nivel, dar devine singura variantă peste plafonul micro. Calculatorul de pe această pagină compară cele trei forme la aceleași cifre.",
  },
  {
    q: "Cât este impozitul pe microîntreprindere în 2026?",
    a: "1% pe venituri, o cotă unică. Tranșa de 3% și excepțiile pentru consultanță, IT și HoReCa au fost abrogate prin OUG 89/2025, cu efect de la 1 ianuarie 2026. Multe surse online încă afișează 1% și 3%. Impozitul se aplică pe cifra de afaceri, nu pe profit, deci se datorează și în pierdere. Microîntreprinderea trebuie să aibă cel puțin un salariat, condiție îndeplinită și de un contract de mandat remunerat cel puțin la nivelul salariului minim.",
  },
  {
    q: "Cât este impozitul pe dividende în 2026?",
    a: "16%, față de 10% anterior, potrivit Legii 141/2025. Se aplică dividendelor distribuite începând cu 1 ianuarie 2026 – contează data distribuirii, nu anul din care provine profitul. Dividendele distribuite pe baza situațiilor financiare interimare întocmite în cursul anului 2025 rămân impozitate cu 10%, fără recalculare. Peste impozit se adaugă CASS, datorată pe trepte de 6, 12 sau 24 de salarii minime, calculate la dividendul net.",
  },
  {
    q: "Sunt și salariat – mai plătesc CAS și CASS la PFA?",
    a: "Da. Salariul nu elimină CAS sau CASS aferente venitului PFA. Dacă veniturile salariale și asimilate cumulate în 2026 sunt de cel puțin 24.300 lei, nu mai datorezi doar diferența CASS până la minimul de 6 salarii; plătești în continuare 10% pe venitul PFA efectiv. CAS rămâne obligatoriu de la pragul anual de 12 salarii minime.",
  },
  {
    q: "Ce taxe plătește un pensionar care are PFA?",
    a: "Pensionarii nu datorează CAS pentru venitul PFA. Ei datorează însă CASS de 10% pe venitul net al activității, până la plafonul de 72 de salarii minime. Veniturile din pensii îi scutesc de diferența CASS până la minimul de 6 salarii, nu de CASS aferentă venitului PFA efectiv.",
  },
  {
    q: "Plafoanele se reduc dacă deschid, suspend sau închid PFA în cursul anului?",
    a: "Nu în situația obișnuită. Veniturile din activități independente obținute într-o fracțiune de an se consideră venit anual, iar simpla începere, suspendare sau încetare a activității nu proratează automat plafoanele CAS și CASS. Există reguli speciale pentru schimbarea în cursul anului a statutului de persoană exceptată de la CAS; calculatorul nu simulează aceste cazuri individuale.",
  },
];

// Cazul de referință al tabelelor: PFA fără alte venituri, nepensionar.
const CAZ_STANDARD = { salariatPestePlafonCASS: false, pensionar: false };

const lei = (n: number) => new Intl.NumberFormat("ro-RO").format(Math.round(n));

// Tabelul pe tranșe se derivă din același motor ca rezultatul calculatorului.
// Dacă s-ar scrie de mână, cifrele ar diverge silențios la prima schimbare de
// plafon — exact riscul semnalat pentru plafoanele hardcodate din FAQ.
const TRANSE = [20_000, 30_000, 48_600, 60_000, 97_200, 150_000].map((venit) => {
  const r = calculeazaPFA(venit, CAZ_STANDARD);
  return { venit, ...r, rata: r.totalTaxe / venit };
});

// Exemplul care arată diferența invizibilă dintre regimuri: la aceeași sumă,
// impozitul la normă e mai mare, fiindcă acolo contribuțiile nu se deduc.
const NORMA_EXEMPLU = 60_000;
const NORMA_EXEMPLU_REZULTAT = calculeazaPfaNormaVenit(NORMA_EXEMPLU, CAZ_STANDARD);
const REAL_EXEMPLU = calculeazaPFA(NORMA_EXEMPLU, CAZ_STANDARD);

// „Pragul care costă": trecerea peste 12 salarii minime declanșează CAS pe o bază
// fixă, deci ultimii lei de sub prag valorează mai mult decât primii de peste el.
const SUB_PRAG = calculeazaPFA(PLAFON_CAS_12_2026 - 100, CAZ_STANDARD);
const PESTE_PRAG = calculeazaPFA(PLAFON_CAS_12_2026, CAZ_STANDARD);
const PIERDERE_PRAG = SUB_PRAG.ramas - PESTE_PRAG.ramas;

// „Bază CAS maximă" era greșit: art. 148 alin. (2) definește 12 și 24 de salarii
// minime ca praguri sub care baza aleasă nu poate coborî, nu ca plafon superior.
const PLAFOANE: [string, string][] = [
  ["Prag CASS (6 minime)", "24.300 lei"],
  ["Prag CAS (12 minime)", "48.600 lei"],
  ["Prag CAS superior (24 minime)", "97.200 lei"],
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
                Vezi cât plătești ca PFA – CAS, CASS și impozit – și cât îți rămâne. Merge în ambele regimuri, sistem
                real și normă de venit, și poate calcula și invers: îi spui cât vrei să-ți rămână pe lună și îți arată
                ce venit îți trebuie.
              </p>
              <div className="mt-5 max-w-prose border-l-2 border-stone-900 pl-4 text-sm leading-normal tracking-[-0.01em] text-stone-700">
                <p className="font-semibold text-stone-900">Răspuns scurt</p>
                <p className="mt-1">
                  La PFA, taxele pornesc de la venitul net anual: <strong>CASS 10%</strong>, <strong>CAS 25%</strong>{" "}
                  dacă atingi plafonul de 12 salarii minime și <strong>impozit 10%</strong>.
                </p>
                <p className="mt-2">
                  Plafoanele anului fiscal 2026 se raportează la salariul minim de la 1 ianuarie,{" "}
                  <strong>{lei(SALARIU_MINIM_PFA_2026)} lei</strong>. Majorarea la 4.325 lei din 1 iulie 2026{" "}
                  <strong>nu le schimbă</strong> – pentru 2027 va conta minimul aflat în vigoare la 1 ianuarie 2027.
                </p>
              </div>
              <div className="mt-4 text-xs text-stone-600">Actualizat 4 august 2026</div>
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
                    <li><strong>CASS 10%</strong> (sănătate) – pe venitul net, fără a depăși 72 de salarii minime. Sub 6 minime se poate datora diferența până la contribuția minimă.</li>
                    <li><strong>CAS 25%</strong> (pensie) – dacă venitul net atinge 12 salarii minime; sub prag este opțional. Calculatorul folosește baza minimă permisă pentru fiecare tranșă.</li>
                    <li><strong>Impozit 10%</strong> – după deducerea CAS și a CASS aferente venitului efectiv. Diferența CASS până la minimul de 6 salarii nu este deductibilă.</li>
                  </ul>
                  <p className={p}>
                    Calculatorul deduce integral contribuțiile, ceea ce este corect dacă veniturile tale vin exclusiv
                    din activitatea în sistem real. Dacă ai și venituri la normă de venit sau din drepturi de
                    proprietate intelectuală, CAS și CASS deductibile se stabilesc proporțional, conform art. 118 alin.
                    (2^2)–(2^4) din Codul fiscal.
                  </p>
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

            {/* Rândul 1b — Tabel pe tranșe + cardul pragului */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className={`md:col-span-3 ${proseLinks}`}>
                <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">
                  Cât plătește un PFA, pe tranșe de venit
                </h2>
                <p className={p}>
                  Cifrele de mai jos sunt calculate cu același motor ca rezultatul de sus, pentru un PFA fără alte
                  venituri și nepensionar. Rata efectivă <strong>nu crește constant</strong>: sare brusc la pragurile CAS
                  și scade după plafonarea CASS.
                </p>
                <TabelArticol numeric>
                    <thead>
                      <tr>
                        <th scope="col">Venit net anual</th>
                        <th scope="col">CAS</th>
                        <th scope="col">CASS</th>
                        <th scope="col">Impozit</th>
                        <th scope="col">Îți rămâne</th>
                        <th scope="col">Rată efectivă</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TRANSE.map((t) => (
                        <tr key={t.venit}>
                          <th scope="row">{lei(t.venit)} lei</th>
                          <td>{t.cas ? `${lei(t.cas)} lei` : "—"}</td>
                          <td>{lei(t.cass)} lei</td>
                          <td>{lei(t.impozit)} lei</td>
                          <td><strong>{lei(t.ramas)} lei</strong></td>
                          <td>{(t.rata * 100).toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</td>
                        </tr>
                      ))}
                    </tbody>
                </TabelArticol>
                <p className="mt-3 text-xs text-stone-500">
                  Valori orientative pentru anul fiscal 2026, la salariul minim de {lei(SALARIU_MINIM_PFA_2026)} lei
                  valabil la 1 ianuarie 2026.
                </p>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0">
                <div className="flex h-full flex-col rounded-md border border-stone-300 bg-surface p-4 shadow-soft sm:p-6">
                  <h3 className="mb-3 text-xs font-medium text-stone-500">Pragul care te costă</h3>
                  <p className="text-sm leading-normal text-stone-700">
                    Sub {lei(PLAFON_CAS_12_2026)} lei venit net nu datorezi CAS. La fix acest prag, CAS devine
                    obligatoriu pe o bază fixă de 12 salarii minime.
                  </p>
                  <p className="mt-3 text-sm leading-normal text-stone-700">
                    Practic, <strong>100 de lei în plus la încasări îți scad venitul rămas cu{" "}
                    {lei(PIERDERE_PRAG)} lei</strong>. Același salt apare și la {lei(PLAFON_CAS_24_2026)} lei, unde baza
                    CAS urcă la 24 de salarii minime.
                  </p>
                  <p className="mt-3 text-xs text-stone-500">
                    Dacă ești aproape de prag la final de an, momentul încasării unei facturi poate conta mai mult decât
                    valoarea ei.
                  </p>
                </div>
              </aside>
            </div>

            {/* Rândul 1c — Sistem real vs normă de venit */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className={`md:col-span-3 ${proseLinks}`}>
                <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">
                  Sistem real sau normă de venit
                </h2>
                <p className={p}>
                  Sunt două regimuri diferite de impozitare, iar alegerea nu e liberă la orice nivel de venit.
                </p>
                <ul className="mb-4 list-disc pl-5 text-base leading-normal tracking-[-0.01em] text-stone-600 [&_li]:mb-2">
                  <li>
                    <strong>Sistem real</strong> – taxele se aplică pe venitul net efectiv, adică încasări minus
                    cheltuieli deductibile. Ai evidență contabilă, dar cheltuielile reale îți reduc baza.
                  </li>
                  <li>
                    <strong>Normă de venit</strong> – direcția regională a finanțelor publice stabilește anual o sumă
                    fixă pentru fiecare activitate autorizată, iar impozitul de 10% se aplică la acea normă,{" "}
                    <strong>indiferent cât încasezi</strong>. Cheltuielile reale nu reduc baza.
                  </li>
                </ul>
                <p className={p}>
                  Diferența care se vede cel mai puțin: la normă, impozitul se calculează pe normă{" "}
                  <strong>fără să scazi CAS și CASS</strong>. Deducerea contribuțiilor este prevăzută doar pentru
                  veniturile stabilite în sistem real. La o normă de {lei(NORMA_EXEMPLU)} lei, impozitul este{" "}
                  {lei(NORMA_EXEMPLU_REZULTAT.impozit)} lei, față de {lei(REAL_EXEMPLU.impozit)} lei la același venit
                  net în sistem real.
                </p>
                <p className={p}>
                  Pragul care decide: dacă în anul precedent ai depășit <strong>25.000 de euro</strong> venit brut, din
                  anul următor treci obligatoriu la sistem real (art. 69 alin. (9)). Conversia se face cu{" "}
                  <strong>cursul mediu anual BNR al anului în care ai realizat venitul</strong>, nu cu cursul de azi.
                  Pentru veniturile din 2025, cursul mediu a fost{" "}
                  {CURS_MEDIU_EUR_2025.toLocaleString("ro-RO", { minimumFractionDigits: 4 })} lei/euro, deci pragul a
                  fost <strong>{lei(PLAFON_NORMA_VENIT_LEI)} lei</strong>, iar depășirea lui obligă la sistem real din
                  2026. Pentru veniturile din 2026 se va folosi cursul mediu al anului 2026, comunicat de BNR la
                  începutul lui 2027.
                </p>
                <p className={p}>
                  Regula simplă: norma de venit avantajează pe cine încasează mult peste normă și are cheltuieli mici;
                  sistemul real avantajează pe cine are cheltuieli reale consistente. Comută calculatorul de mai sus pe{" "}
                  <strong>Normă de venit</strong>, pune și încasările reale, și îți arată direct care variantă te costă
                  mai puțin.
                </p>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0">
                <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <h3 className="mb-3 text-xs font-medium text-stone-500">Cheltuieli deductibile uzuale</h3>
                  <ul className="list-disc pl-4 text-sm leading-normal text-stone-600 [&_li]:mb-1.5">
                    <li>chirie și utilități pentru spațiul activității</li>
                    <li>echipamente, software, abonamente profesionale</li>
                    <li>transport și combustibil aferente activității</li>
                    <li>servicii contabile și consultanță</li>
                    <li>cursuri și materiale de specialitate</li>
                    <li>comisioane bancare ale contului de activitate</li>
                  </ul>
                  <p className="mt-3 text-xs text-stone-500">
                    Deductibilitatea depinde de legătura cu activitatea și de documentele justificative. Unele categorii
                    au plafoane proprii în Codul fiscal.
                  </p>
                </div>
              </aside>
            </div>

            {/* Rândul 1d — PFA sau SRL */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className={`md:col-span-3 ${proseLinks}`}>
                <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">
                  PFA sau SRL: ce diferă, dincolo de taxe
                </h2>
                <p className={p}>
                  Comparația se face de obicei doar pe taxe, dar diferențele care contează pe termen lung sunt
                  administrative și juridice. Calculatorul de aici acoperă PFA; pentru SRL, cifrele depind de forma de
                  impozitare aleasă și de modul în care îți retragi banii.
                </p>
                <TabelArticol>
                    <thead>
                      <tr>
                        <th scope="col">Criteriu</th>
                        <th scope="col">PFA</th>
                        <th scope="col">SRL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">Răspundere</th>
                        <td>cu patrimoniul personal</td>
                        <td>limitată la capitalul social</td>
                      </tr>
                      <tr>
                        <th scope="row">Acces la bani</th>
                        <td>imediat, sunt banii tăi</td>
                        <td>prin dividende sau salariu</td>
                      </tr>
                      <tr>
                        <th scope="row">Administrare</th>
                        <td>simplă, contabilitate în partidă simplă</td>
                        <td>contabilitate în partidă dublă</td>
                      </tr>
                      <tr>
                        <th scope="row">Angajați</th>
                        <td>posibil, dar limitat ca practică</td>
                        <td>fără restricții de model</td>
                      </tr>
                      <tr>
                        <th scope="row">Obiect de activitate</th>
                        <td>legat de calificarea ta</td>
                        <td>liber, în limita codurilor CAEN</td>
                      </tr>
                      <tr>
                        <th scope="row">Percepția clienților</th>
                        <td>uzual pentru freelanceri</td>
                        <td>preferat de companii mari</td>
                      </tr>
                    </tbody>
                </TabelArticol>
                <p className={p}>
                  Pe partea fiscală, regimul de microîntreprindere are propriul prag de venit: peste{" "}
                  <a
                    href="https://legislatie.just.ro/Public/DetaliiDocument/307580"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    100.000 de euro
                  </a>{" "}
                  ({lei(PLAFON_MICRO_LEI)} lei la cursul de la 31 decembrie 2025) se trece la impozit pe profit, iar
                  eligibilitatea depinde și de celelalte condiții legale.
                </p>
                <p className={p}>
                  Trei lucruri s-au schimbat în 2026 și încă sunt raportate greșit în multe locuri:
                </p>
                <ul className="mb-4 list-disc pl-5 text-base leading-normal tracking-[-0.01em] text-stone-600 [&_li]:mb-2">
                  <li>
                    <strong>Cota micro este 1%, una singură.</strong> Tranșa de 3% și excepțiile pentru consultanță, IT
                    și HoReCa au fost abrogate prin OUG 89/2025, de la 1 ianuarie 2026.
                  </li>
                  <li>
                    <strong>Limita de 20% la veniturile din consultanță nu mai există.</strong> A fost abrogată prin
                    OUG 156/2024, încă din 2025, dar e în continuare citată ca fiind în vigoare.
                  </li>
                  <li>
                    <strong>Impozitul pe dividende este 16%</strong>, față de 10% înainte. Contează{" "}
                    <strong>data distribuirii</strong>, nu anul din care provine profitul: se aplică dividendelor
                    distribuite începând cu 1 ianuarie 2026.
                  </li>
                </ul>
                <p className={p}>
                  Comparația numerică cere ipoteze despre salariu, dividende și costuri de contabilitate, așa că nu o
                  ascundem într-o singură cifră. Calculatorul de mai sus o face totuși: pune încasările și cheltuielile,
                  apoi comută rezultatul pe <strong>SRL micro</strong> sau <strong>SRL profit</strong> și vezi cât ți-ar
                  rămâne pe fiecare, cu ipotezele scrise sub tabel.
                </p>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0">
                <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <h3 className="mb-3 text-xs font-medium text-stone-500">Calendarul unui PFA</h3>
                  <dl className="text-sm">
                    <div className="border-b border-stone-100 py-2">
                      <dt className="font-medium text-stone-900">Declarația unică (D212)</dt>
                      <dd className="text-stone-600">
                        se depune pentru veniturile anului încheiat și stabilește CAS, CASS și impozitul datorate.
                        Pentru veniturile anului 2026, termenul este 25 mai 2027 inclusiv.
                      </dd>
                    </div>
                    <div className="border-b border-stone-100 py-2">
                      <dt className="font-medium text-stone-900">Plata contribuțiilor</dt>
                      <dd className="text-stone-600">
                        la aceeași dată cu depunerea declarației, pentru anul fiscal încheiat.
                      </dd>
                    </div>
                    <div className="py-2">
                      <dt className="font-medium text-stone-900">Registrul de încasări și plăți</dt>
                      <dd className="text-stone-600">
                        se ține pe tot parcursul anului; el susține cheltuielile deduse.
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-stone-500">
                    Termenele exacte se verifică anual pe anaf.ro, pentru că se pot modifica prin ordin.
                  </p>
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
                    <li><a href="https://static.anaf.ro/static/10/Cluj/cj_DU_activ_indep_22apr2026.pdf" target="_blank" rel="noopener">ANAF – ghid Declarația Unică 2026</a> – plafoane, excepții CAS/CASS și cazuri practice</li>
                  </ul>
                  <h3 className="mb-3 mt-6 text-xs font-medium text-stone-500">Pagini conexe</h3>
                  <ul className="flex flex-col gap-2 text-sm [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600">
                    <li><Link href="/">Calculator salariu net</Link></li>
                    <li><Link href="/salariu-minim">Salariul minim 2026</Link></li>
                    <li><Link href="/salariu-mediu">Salariul mediu pe economie</Link></li>
                  </ul>
                  <p className="mt-auto pt-6 text-xs text-stone-500">
                    Calculatorul acoperă sistemul real, norma de venit și cazurile uzuale. Pentru situații speciale,
                    confirmă cu un contabil.
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
