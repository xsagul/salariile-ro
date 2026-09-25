// app/calculator-pfa/page.tsx
// Pagină calculator taxe PFA 2026 — structură oglindă a paginii principale
// (hero pe grilă + calculator + zonă-articol 3+2 cu carduri-companion).

import type { Metadata } from "next";
import { Formula, PaginiConexe, TITLU_PAGINA, TITLU_SECTIUNE, SPATIU_SECTIUNE, SPATIU_SUS, SUB_TITLU, SPATIU_PARAGRAF, SUB_TITLU_SECTIUNE, LISTA_FAQ, LISTA_CARD } from "@/app/components/ui";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import CalculatorPFA from "@/app/components/CalculatorPFA";
import TabelArticol from "@/app/components/TabelArticol";
import {
  calculeazaPFA,
  calculeazaPfaNormaVenit,
  PLAFON_CAS_12_2026,
  PLAFON_CAS_24_2026,
  PLAFON_CASS_MAXIM_2026,
  PLAFON_CASS_MINIM_2026,
  PLAFON_NORMA_VENIT_LEI,
  SALARIU_MINIM_PFA_2026,
} from "@/lib/pfa";
import { PLAFON_MICRO_LEI } from "@/lib/forme-juridice";

// Titlul și descrierea urmează intenția reală din SERP, nu doar cuvântul-cheie.
// Descrierea veche se termina cu „salariul minim de 4.050 lei" și arăta depășită
// în rezultate, deși e corectă: plafoanele PFA folosesc minimul de la 1 ianuarie.
const PFA_TITLU = "Calculator taxe PFA 2026 - Compară PFA, SRL și Micro";
const PFA_DESC =
  "Vezi ce plătește un PFA în 2026 și cât ar rămâne, la aceleași cifre, cu un SRL micro sau SRL pe impozit pe profit.";

export const metadata: Metadata = {
  title: { absolute: PFA_TITLU },
  description:
    "Compară pe loc PFA cu SRL micro și SRL pe impozit pe profit. La 60.000 lei venit net, un PFA plătește 22.335 lei taxe și rămâne cu 37.665 lei.",
  alternates: { canonical: "https://salariile.ro/calculator-pfa" },
  openGraph: ogPage({ title: PFA_TITLU, description: PFA_DESC, path: "/calculator-pfa" }),
  twitter: twPage({ title: PFA_TITLU, description: PFA_DESC }),
};

const FAQ = [
  {
    q: "De la ce venit plătesc pensie (CAS) ca PFA?",
    a: "De la 48.600 de lei venit net pe an, adică 12 salarii minime. Sub prag, CAS e opțional. Peste el, îl plătești pe o bază fixă: 12 salarii minime până la 97.200 de lei, apoi 24. Poți alege și o bază mai mare, dacă vrei o pensie mai mare. Pensionarii nu plătesc CAS.",
  },
  {
    q: "Cât e CASS și are un maxim?",
    a: "10% din venitul net, dar cel mult 29.160 de lei pe an. Dacă venitul e sub 24.300 de lei, plătești de regulă un minim de 2.430 de lei, cu excepții: de exemplu, dacă ai și salariu de cel puțin atât sau ești pensionar.",
  },
  {
    q: "Sunt și salariat. Mai plătesc CAS și CASS la PFA?",
    a: "Da, pe venitul din PFA. Salariul te scutește doar de minimul CASS, dacă ai câștigat din salarii cel puțin 24.300 de lei în an. CAS rămâne obligatoriu de la pragul de 48.600 de lei.",
  },
  {
    q: "Ce plătește un pensionar cu PFA?",
    a: "Doar CASS, 10% din venitul net, și impozitul. Pensionarii nu plătesc CAS și nici minimul CASS.",
  },
  {
    q: "Dacă deschid PFA-ul în cursul anului, pragurile scad?",
    a: "Nu. Pragurile rămân cele anuale, chiar dacă ai lucrat doar câteva luni. Același lucru la suspendare sau închidere.",
  },
  {
    q: "PFA sau SRL: care iese mai bine?",
    a: "Depinde de venit și de cheltuieli, iar diferența e adesea mai mică decât se crede. La 200.000 de lei încasări, PFA și SRL-ul micro ies la câteva sute de lei distanță pe an, mai puțin decât costă contabilitatea unui SRL. Calculatorul de sus le compară la cifrele tale.",
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
//
// Cardul spune ce se schimbă la fiecare prag, cu efectul întâi (varianta C aleasă
// de proprietar pe 24 septembrie 2026), nu doar cifra: o listă de sume fără
// efect nu-i spunea nimic cititorului (semnalat de proprietar, 24 septembrie 2026).
// Sumele pe an vin din aceleași constante ca motorul de calcul.
const PRAGURI: { efect: string; rest: string }[] = [
  {
    efect: "Sănătatea are un minim",
    rest: `: sub ${lei(PLAFON_CASS_MINIM_2026)} lei plătești tot ${lei(PLAFON_CASS_MINIM_2026 * 0.1)} lei pe an.`,
  },
  {
    efect: "Pensia apare",
    rest: ` de la ${lei(PLAFON_CAS_12_2026)} lei: ${lei(PLAFON_CAS_12_2026 * 0.25)} lei pe an.`,
  },
  {
    efect: "Pensia se dublează",
    rest: ` de la ${lei(PLAFON_CAS_24_2026)} lei: ${lei(PLAFON_CAS_24_2026 * 0.25)} lei pe an.`,
  },
  {
    efect: "Sănătatea se plafonează",
    rest: ` peste ${lei(PLAFON_CASS_MAXIM_2026)} lei: cel mult ${lei(PLAFON_CASS_MAXIM_2026 * 0.1)} lei pe an.`,
  },
];

// Data vizibila iese din ACEEASI sursa ca lastmod-ul din sitemap si ca
// dateModified-ul din JSON-LD: un fapt viu are o singura sursa de adevar.
//
// timeZone UTC explicit: build-ul poate rula in orice fus, iar fara el o data
// de miezul noptii UTC s-ar afisa cu o zi mai devreme la vest de Greenwich,
// deci textul vizibil ar contrazice sitemap-ul.
const ACTUALIZAT = PAGE_LAST_MODIFIED["/calculator-pfa"].toLocaleDateString("ro-RO", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
});

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
      publisher: { "@type": "Organization", name: "Salariile", url: "https://salariile.ro" },
      author: personSchema,
      // Aceeasi sursa ca lastmod-ul din sitemap, ca sa nu apara doua date
      // diferite pentru aceeasi pagina. Tiparul e luat de la /fluturas-salariu.
      dateModified: PAGE_LAST_MODIFIED["/calculator-pfa"].toISOString().slice(0, 10),
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
const p = `${SPATIU_PARAGRAF} text-base leading-normal tracking-[-0.01em] text-stone-600 last:mb-0`;

export default function CalculatorPfaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        {/* HERO — titlu și o frază, pe grila calculatorului. Ca pe homepage din 15
            septembrie 2026: primul câmp începea la 432–468 px pe telefon, iar
            butonul „Calculează" era sub primul ecran. Data a trecut lângă surse. */}
        <section className="bg-canvas">
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS}`}>
          <div className="md:grid md:grid-cols-5 md:gap-6">
            <div className="md:col-span-3">
              <h1 className={TITLU_PAGINA}>Calculator taxe PFA 2026</h1>
              <p className={`${SUB_TITLU} max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600`}>
                Cât plătești ca PFA în sistem real și cât îți rămâne, comparat cu SRL micro și SRL pe profit.
              </p>
            </div>
          </div>
        </div>
        </section>

        {/* CALCULATOR */}
        <CalculatorPFA />

        {/* ZONĂ ARTICOL — 3+2, ca pe homepage */}
        <section className={`rule-t ${SPATIU_SECTIUNE}`}>
          <div className="mx-auto max-w-6xl space-y-8 px-4 sm:space-y-9 sm:px-6">

            {/* Rândul 1 — Cum se calculează + card Plafoane */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className={`md:col-span-3 ${proseLinks}`}>
                <h2 className={`${SUB_TITLU_SECTIUNE} ${TITLU_SECTIUNE}`}>Cum se calculează taxele unui PFA</h2>
                <div className="max-w-prose">
                  <p className={p}>
                    Totul pornește de la <strong>venitul net</strong>: ce ai încasat într-un an, minus cheltuielile
                    activității. Spre deosebire de un salariat, la PFA nu există un angajator care să plătească ceva
                    peste: toate taxele sunt ale tale. În schimb, îți scazi cheltuielile reale.
                  </p>
                  <Formula
                    eticheta="Formula taxelor unui PFA în sistem real"
                    randuri={[
                      "Venit net  = încasări − cheltuieli",
                      "CASS       = venit net × 10%",
                      "CAS        = 12 sau 24 salarii minime × 25%, peste prag",
                      "Impozit    = (venit net − CAS − CASS) × 10%",
                      "Îți rămâne = venit net − CAS − CASS − impozit",
                    ]}
                  />
                  <p className={p}>
                    Pragurile se socotesc în salarii minime, dar cu minimul de la 1 ianuarie: pentru tot anul 2026 se
                    folosesc {lei(SALARIU_MINIM_PFA_2026)} de lei, chiar dacă minimul a crescut în iulie.
                  </p>
                </div>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0 md:self-start">
                <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <h3 className="mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Unde se schimbă taxele</h3>
                  <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-normal text-stone-600">
                    {PRAGURI.map(({ efect, rest }) => (
                      <li key={efect}>
                        <strong className="font-semibold text-stone-900">{efect}</strong>
                        {rest}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-stone-600">Venit net pe an: încasări minus cheltuieli.</p>
                </div>
              </aside>
            </div>

            {/* Rândul 1b — Tabel pe tranșe + cardul pragului */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className={`md:col-span-3 ${proseLinks}`}>
                <h2 className={`${SUB_TITLU_SECTIUNE} ${TITLU_SECTIUNE}`}>
                  Cât plătește un PFA, pe tranșe de venit
                </h2>
                <p className={p}>
                  Pentru un PFA fără alte venituri. Procentul luat de taxe nu crește lin: sare la pragurile de pensie și
                  scade când CASS ajunge la maxim.
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
                <p className="mt-3 text-xs text-stone-600">Pentru anul fiscal 2026.</p>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0 md:self-start">
                <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <h3 className="mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Pragul care te costă</h3>
                  <p className="text-sm leading-normal text-stone-700">
                    Sub {lei(PLAFON_CAS_12_2026)} lei venit net nu datorezi CAS. La fix acest prag, CAS devine
                    obligatoriu pe o bază fixă de 12 salarii minime.
                  </p>
                  <p className="mt-3 text-sm leading-normal text-stone-700">
                    Practic, <strong>100 de lei în plus la încasări îți scad venitul rămas cu{" "}
                    {lei(PIERDERE_PRAG)} lei</strong>. Același salt apare și la {lei(PLAFON_CAS_24_2026)} lei, unde baza
                    CAS urcă la 24 de salarii minime.
                  </p>
                  <p className="mt-3 text-xs text-stone-600">
                    Dacă ești aproape de prag la final de an, momentul încasării unei facturi poate conta mai mult decât
                    valoarea ei.
                  </p>
                </div>
              </aside>
            </div>

            {/* Rândul 1c — Sistem real vs normă de venit */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className={`md:col-span-3 ${proseLinks}`}>
                <h2 className={`${SUB_TITLU_SECTIUNE} ${TITLU_SECTIUNE}`}>
                  Sistem real sau normă de venit
                </h2>
                <p className={p}>
                  Sunt două feluri de a fi impozitat, iar peste un anumit venit nu mai poți alege.
                </p>
                <ul className="mb-4 list-disc pl-5 text-base leading-normal tracking-[-0.01em] text-stone-600 [&_li]:mb-2">
                  <li>
                    <strong>Sistem real:</strong> plătești taxe pe ce ai câștigat de fapt, după cheltuieli. Ții evidența
                    încasărilor și plăților.
                  </li>
                  <li>
                    <strong>Normă de venit:</strong> Fiscul stabilește în fiecare an o sumă fixă pentru activitatea ta,
                    iar taxele se calculează pe ea, <strong>oricât ai încasa</strong>. Cheltuielile nu mai contează.
                  </li>
                </ul>
                <p className={p}>
                  Un detaliu care scapă multora: la normă, impozitul se calculează <strong>fără să scazi CAS și CASS</strong>.
                  La o normă de {lei(NORMA_EXEMPLU)} de lei, impozitul e de {lei(NORMA_EXEMPLU_REZULTAT.impozit)} de lei, față
                  de {lei(REAL_EXEMPLU.impozit)} la același venit în sistem real.
                </p>
                <p className={p}>
                  Dacă într-un an încasezi peste <strong>25.000 de euro</strong>, din anul următor treci obligatoriu la
                  sistem real. Euro se transformă în lei la cursul mediu al anului în care ai încasat banii: pentru 2025,
                  pragul a fost de {lei(PLAFON_NORMA_VENIT_LEI)} de lei.
                </p>
                <p className={p}>
                  Pe scurt, norma avantajează pe cine încasează mult peste ea și are cheltuieli mici. Sistemul real
                  avantajează pe cine are cheltuieli mari. Calculatorul de sus le acoperă pe amândouă.
                </p>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0 md:self-start">
                <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <h3 className="mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Cheltuieli deductibile uzuale</h3>
                  <ul className="list-disc pl-4 text-sm leading-normal text-stone-600 [&_li]:mb-1.5">
                    <li>chirie și utilități pentru spațiul activității</li>
                    <li>echipamente, software, abonamente profesionale</li>
                    <li>transport și combustibil aferente activității</li>
                    <li>servicii contabile și consultanță</li>
                    <li>cursuri și materiale de specialitate</li>
                    <li>comisioane bancare ale contului de activitate</li>
                  </ul>
                  <p className="mt-3 text-xs text-stone-600">
                    Deductibilitatea depinde de legătura cu activitatea și de documentele justificative. Unele categorii
                    au plafoane proprii în Codul fiscal.
                  </p>
                </div>
              </aside>
            </div>

            {/* Rândul 1d — PFA sau SRL */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className={`md:col-span-3 ${proseLinks}`}>
                <h2 className={`${SUB_TITLU_SECTIUNE} ${TITLU_SECTIUNE}`}>
                  PFA sau SRL: ce diferă, dincolo de taxe
                </h2>
                <p className={p}>
                  Taxele sunt doar o parte. Pe termen lung contează la fel de mult cât răspunzi cu banii tăi și cât de
                  ușor ajungi la ei.
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
                  Trei reguli noi, pe care multe ghiduri mai vechi nu le au:
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
                  Ca să vezi cifrele tale, pune încasările și cheltuielile în calculatorul de sus și comută rezultatul pe{" "}
                  <strong>SRL micro</strong> sau <strong>SRL profit</strong>. Ipotezele sunt scrise sub tabel.
                </p>
              </div>

              <aside className="mt-8 md:col-span-2 md:mt-0 md:self-start">
                <div className="flex h-full flex-col rounded-md border border-stone-200 bg-surface p-4 shadow-soft sm:p-6">
                  <h3 className="mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Calendarul unui PFA</h3>
                  <dl className="text-sm [&>div:first-child]:pt-0">
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
                  <p className="mt-3 text-xs text-stone-600">
                    Termenele exacte se verifică anual pe anaf.ro, pentru că se pot modifica prin ordin.
                  </p>
                </div>
              </aside>
            </div>

            {/* Rândul 2 — FAQ + card Surse */}
            <div className="md:grid md:grid-cols-5 md:gap-6">
              <div className="md:col-span-3">
                <h2 className={TITLU_SECTIUNE}>Întrebări frecvente</h2>
                <div className={LISTA_FAQ}>
                  {FAQ.map((item, i) => (
                    <details key={i} name="faq-pfa" className="group border-b border-stone-200">
                      <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-4 text-base font-medium tracking-[-0.01em] text-stone-900 [&::-webkit-details-marker]:hidden">
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
                  <ul className={`${LISTA_CARD} text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600`}>
                    <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener">Codul Fiscal (Legea 227/2015)</a> – contribuții și impozit pentru activități independente</li>
                    <li><a href="https://static.anaf.ro/static/10/Cluj/cj_DU_activ_indep_22apr2026.pdf" target="_blank" rel="noopener">ANAF – ghid Declarația Unică 2026</a> – plafoane, excepții CAS/CASS și cazuri practice</li>
                  </ul>
                  <h3 className="mt-6 mb-2 text-base font-bold tracking-[-0.01em] text-stone-900">Pagini conexe</h3>
                  <ul className={`${LISTA_CARD} [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-600`}>
                    <li><Link href="/noutati/pfa-sau-srl-2026">Ghid comparativ: PFA sau SRL în 2026</Link></li>
                    <li><Link href="/">Calculator salariu net</Link></li>
                    <li><Link href="/salariu-minim">Salariul minim 2026</Link></li>
                    <li><Link href="/salariu-mediu">Salariul mediu pe economie</Link></li>
                  </ul>
                  <p className="mt-auto pt-6 text-xs text-stone-600">
                    Pentru situații speciale, confirmă cu un contabil. Actualizat {ACTUALIZAT}.
                  </p>
                </div>
              </aside>
            </div>

          </div>
        </section>
      </div>
      <PaginiConexe
        linkuri={[
          { href: "/noutati/pfa-sau-srl-2026", label: "PFA sau SRL în 2026?", descriere: "Comparație detaliată la 60.000, 100.000 și 200.000 lei încasări." },
          { href: "/salarii", label: "Salarii pe meserii", descriere: "Cât ai câștiga ca angajat în meseria ta." },
          { href: "/", label: "Calculator salariu net", descriere: "Compară cu un contract de muncă." },
          { href: "/salariu-minim", label: "Salariul minim 2026", descriere: "Unitatea de măsură a pragurilor PFA." },
          { href: "/smartbill", label: "SmartBill Conta", descriere: "Prețuri, salarizare, D112 și planurile SmartBill Conta." },
          { href: "/saga", label: "SAGA C și SAGA WEB", descriere: "Contabilitate, salarii, D112 și licențiere." },
          { href: "/metodologie", label: "Metodologia de calcul", descriere: "Formulele și sursele, în detaliu." },
        ]}
      />
    </>
  );
}
