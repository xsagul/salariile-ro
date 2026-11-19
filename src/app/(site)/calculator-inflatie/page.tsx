// app/calculator-inflatie/page.tsx
// Calculatorul de inflație, mutat de pe calculatorulinflatiei.ro pe 17 noiembrie 2026.
//
// De ce aici: proprietarul nu mai întreține site-ul separat și l-a comasat în
// salariile.ro, cu 301 de la fiecare adresă veche la echivalentul ei. Pe
// calculatorulinflatiei.ro, în 90 de zile (16 august – 15 noiembrie 2026, Search
// Console), pagina principală adusese 1.979 din 2.170 de clicuri, pe „calculator
// inflatie”, „calculator inflatie romania” și „calculator rata inflatiei”.
//
// Pagina „actualizare cu rata inflației” (73 de clicuri) e comasată aici: calculul
// e același, iar cine scrie un act are nevoie de coeficient și de calculul
// desfășurat, care stau acum în tabelul de rezultat și în secțiunea de dedesubt.
//
// Seria, denominarea și testele: `src/lib/inflatie.ts`, `scripts/test-inflatie.mts`.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import TabelArticol from "@/app/components/TabelArticol";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Repere, Section } from "@/app/components/ui";
import CalculatorInflatie from "@/app/components/CalculatorInflatie";
import { ReclamaSubCalculator } from "@/app/components/Reclama";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import {
  converteste,
  etichetaLuna,
  factorPreturi,
  inflatieAnuala,
  PRIMA_LUNA,
  SURSA,
  ULTIMA_LUNA,
} from "@/lib/inflatie";

const nr = (n: number, z = 2) => n.toLocaleString("ro-RO", { minimumFractionDigits: z, maximumFractionDigits: z });

const CALE = "/calculator-inflatie";
const ACTUALIZAT = etichetaLuna(ULTIMA_LUNA);
const TITLU = "Calculator inflație România - Actualizare cu rata inflației";
const DESC = `Cât valorează azi o sumă din trecut, între oricare două luni. Coeficientul de actualizare și inflația cumulată, pe indicele INS, la zi până în ${ACTUALIZAT}.`;

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: `https://salariile.ro${CALE}` },
  openGraph: ogPage({ title: TITLU, description: DESC, path: CALE }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

// Exemplele sunt calculate din serie, nu scrise de mână: când INS publică o lună
// nouă, se schimbă singure.
const EXEMPLE = [
  { suma: 100, de: { an: 2000, luna: 1 } },
  { suma: 1000, de: { an: 2010, luna: 1 } },
  { suma: 1000, de: { an: 2020, luna: 1 } },
  { suma: 1000, de: { an: ULTIMA_LUNA.an - 1, luna: 1 } },
].map((e) => ({ ...e, r: converteste(e.suma, e.de, ULTIMA_LUNA) }));

// Exemplul de actualizare: o sumă de acum trei ani, adusă la ultima lună.
const EX_DE = { an: ULTIMA_LUNA.an - 3, luna: ULTIMA_LUNA.luna };
const EX = converteste(2000, EX_DE, ULTIMA_LUNA);
const EX_COEF = factorPreturi(EX_DE, ULTIMA_LUNA);

const ANUALA = inflatieAnuala(ULTIMA_LUNA.an, ULTIMA_LUNA.luna);
const DE_LA_INCEPUT = (factorPreturi({ an: ULTIMA_LUNA.an - 1, luna: 12 }, ULTIMA_LUNA) - 1) * 100;
const LUNARA = (factorPreturi({ an: ULTIMA_LUNA.luna === 1 ? ULTIMA_LUNA.an - 1 : ULTIMA_LUNA.an, luna: ULTIMA_LUNA.luna === 1 ? 12 : ULTIMA_LUNA.luna - 1 }, ULTIMA_LUNA) - 1) * 100;

const REPERE = [
  ["Rata anuală", ANUALA !== null ? `${nr(ANUALA, 1)}%` : "—"],
  ["De la începutul anului", `${nr(DE_LA_INCEPUT, 1)}%`],
  ["Față de luna precedentă", `${LUNARA >= 0 ? "+" : ""}${nr(LUNARA)}%`],
] as const;

const FAQ = [
  {
    q: "Cum se actualizează o sumă cu rata inflației?",
    a: `Se înmulțește suma cu coeficientul de actualizare, adică produsul indicilor lunari ai prețurilor de consum dintre cele două luni. ${nr(EX.suma, 0)} de lei din ${etichetaLuna(EX_DE)} devin ${nr(EX.echivalent)} lei în ${ACTUALIZAT}, la un coeficient de ${nr(EX_COEF, 4)}.`,
  },
  {
    q: "Ce indice se folosește?",
    a: `Indicele prețurilor de consum publicat lunar de Institutul Național de Statistică, matricea ${SURSA.matrice}. E indicele oficial și cel la care trimit de obicei clauzele de indexare din contracte și cererile de actualizare a unei creanțe.`,
  },
  {
    q: "Coeficientul de actualizare e același lucru cu rata inflației?",
    a: `Nu. Rata e o creștere în procente, coeficientul e un multiplicator. O inflație cumulată de ${nr(EX.inflatieCumulata, 1)}% înseamnă un coeficient de ${nr(EX_COEF, 4)}: suma se înmulțește cu ${nr(EX_COEF, 4)}.`,
  },
  {
    q: "De ce calculatorul nu merge înainte de 1991?",
    a: `Seria lunară publicată de INS începe în ${etichetaLuna(PRIMA_LUNA)}. Pentru anii de dinainte nu există un indice oficial lunar, iar o estimare ar arăta la fel de precisă ca o cifră reală fără să fie.`,
  },
  {
    q: "Cât de des se actualizează datele?",
    a: "INS publică indicele unei luni în comunicatul de presă din jurul datei de 12 a lunii următoare. Calculatorul folosește luna nouă din ziua comunicatului, fără să aștepte încărcarea ei în baza de date TEMPO, care vine uneori cu două luni mai târziu.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Calculator inflație", item: `https://salariile.ro${CALE}` },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: `https://salariile.ro${CALE}`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator inflație" }]} />
        <H1>Calculator inflație</H1>
        <Lead>
          Cât valorează o sumă dintr-o lună în altă lună, pe indicele prețurilor de consum publicat de INS. Datele sunt la
          zi până în {ACTUALIZAT}.
        </Lead>
      </Hero>

      <CalculatorInflatie />
      <ReclamaSubCalculator />

      <Section
        companion={
          <CardCompanion
            titlu={`Inflația în ${ACTUALIZAT}`}
            nota="Rata anuală compară luna cu aceeași lună de anul trecut."
          >
            <Repere randuri={REPERE} />
            <p className="mt-3 text-sm">
              <Link href="/rata-inflatiei" className="font-medium text-stone-900 underline underline-offset-2">
                Rata inflației pe ani și pe luni
              </Link>
            </p>
          </CardCompanion>
        }
      >
        <h2>Cum se calculează</h2>
        <p>
          INS publică în fiecare lună un indice: cât costă coșul de consum față de luna dinainte. Înmulțiți lună după lună,
          indicii dau coeficientul de actualizare, adică de câte ori au crescut prețurile între cele două luni.
        </p>
        <Formula
          eticheta="Formulele calculatorului de inflație"
          randuri={[
            "Coeficient       = indice₁ × indice₂ × … × indiceₙ",
            "Valoare azi      = suma × coeficient",
            "Inflație cumulată = (coeficient − 1) × 100",
            "Putere rămasă    = 100 ÷ coeficient",
          ]}
        />
        <p>
          Indicii intră ca fracții: 100,82% devine 1,0082. Lanțul e lunar, nu anual, fiindcă ianuarie și decembrie din
          același an dau răspunsuri diferite.
        </p>

        <h2 id="actualizare">Actualizarea unei sume cu rata inflației</h2>
        <p>
          O chirie indexată, o datorie dintr-o hotărâre sau o clauză dintr-un contract se actualizează între lunile pe care
          le spune actul, nu neapărat până azi. De aceea calculatorul lasă ambele capete libere.
        </p>
        <p>
          Exemplu: {nr(EX.suma, 0)} de lei din {etichetaLuna(EX_DE)}, actualizați la {ACTUALIZAT}. Coeficientul e{" "}
          {nr(EX_COEF, 4)}, deci suma devine {nr(EX.suma, 0)} × {nr(EX_COEF, 4)} = {nr(EX.echivalent)} lei. În act se trec
          coeficientul, cele două luni și sursa: indicele prețurilor de consum publicat de INS.
        </p>

        <h2>Sumele dinainte de iulie 2005</h2>
        <p>
          La 1 iulie 2005, 10.000 de lei vechi au devenit 1 leu nou. Indicii de preț nu conțin tăierea, fiindcă e o
          schimbare de unitate, nu de preț. Când intervalul trece peste acea dată, calculatorul împarte la 10.000 și
          afișează rezultatul în lei noi.
        </p>

        <h2>Câteva răspunsuri, calculate</h2>
        <TabelArticol numeric>
          <thead>
            <tr>
              <th>Suma</th>
              <th>Din</th>
              <th>Valorează în {ACTUALIZAT}</th>
              <th>Prețuri × de</th>
            </tr>
          </thead>
          <tbody>
            {EXEMPLE.map(({ suma, de, r }) => (
              <tr key={`${de.an}-${suma}`}>
                <td>{nr(suma, 0)} {r.monedaDe === "ROL" ? "lei vechi" : "lei"}</td>
                <td>{etichetaLuna(de)}</td>
                <td className="font-medium text-stone-900">{nr(r.echivalent)} lei</td>
                <td>{nr(r.factorPreturi)}</td>
              </tr>
            ))}
          </tbody>
        </TabelArticol>

        <p className="source-note">
          Sursa: {SURSA.institutie},{" "}
          <a href={SURSA.url} target="_blank" rel="noopener">
            TEMPO-Online, matricea {SURSA.matrice}
          </a>
          , și comunicatele lunare ale INS. Seria completă se descarcă în{" "}
          <a href="/date/ipc-lunar.csv">CSV</a> și <a href="/date/ipc-lunar.json">JSON</a>.
        </p>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/rata-inflatiei", label: "Rata inflației în România", descriere: "Pe fiecare an, din 1992, și lună de lună." },
          { href: "/", label: "Calculator salariu net", descriere: "Brut în net pentru orice salariu." },
          { href: "/salariu-mediu", label: "Salariul mediu", descriere: "Ultimul câștig salarial mediu publicat de INS." },
          { href: "/salariu-minim", label: "Salariul minim", descriere: "Brut și net, cu istoricul creșterilor." },
          { href: "/calculator-tva", label: "Calculator TVA", descriere: "Adaugă sau scoate TVA dintr-un preț." },
          { href: "/noutati", label: "Noutăți fiscale", descriere: "Ce s-a schimbat la taxe și la salarii." },
        ]}
      />
    </>
  );
}
