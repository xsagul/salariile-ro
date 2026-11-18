// app/rata-inflatiei/page.tsx
// Rata inflației în România: anul curent, fiecare an din serie și ultimele luni.
//
// Mutată de pe calculatorulinflatiei.ro pe 17 noiembrie 2026. Acolo existau o
// pagină pe an (36) și una pe lună (48), cu câteva clicuri pe lună în total
// (Search Console, 90 de zile). Aici sunt o singură pagină: fiecare an are rândul
// lui în tabel, cu ancoră (#an-2024), iar paginile vechi trimit aici cu 301.
// Paginile pe variante (an, lună) sunt conținut subțire pentru Google; un tabel
// complet răspunde la aceleași căutări dintr-un loc cu autoritate.

import type { Metadata } from "next";
import TabelArticol from "@/app/components/TabelArticol";
import Reclama, { ReclamaIntreSectiuni } from "@/app/components/Reclama";
import { Breadcrumb, CardCompanion, Faq, H1, Hero, Lead, PaginiConexe, Repere, Section } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import {
  aniIntregi,
  etichetaLuna,
  factorPreturi,
  inflatieAnuala,
  inflatieMedieAnuala,
  lunileAnului,
  numeLuna,
  PRIMA_LUNA,
  SURSA,
  ULTIMA_LUNA,
} from "@/lib/inflatie";

const nr = (n: number, z = 1) => n.toLocaleString("ro-RO", { minimumFractionDigits: z, maximumFractionDigits: z });
const semn = (n: number, z = 2) => `${n > 0 ? "+" : ""}${nr(n, z)}%`;

const CALE = "/rata-inflatiei";
const ACTUALIZAT = etichetaLuna(ULTIMA_LUNA);
const ANUALA = inflatieAnuala(ULTIMA_LUNA.an, ULTIMA_LUNA.luna);
const DE_LA_INCEPUT = (factorPreturi({ an: ULTIMA_LUNA.an - 1, luna: 12 }, ULTIMA_LUNA) - 1) * 100;

const TITLU = `Rata inflației în România ${ULTIMA_LUNA.an}, pe ani și pe luni`;
const DESC = `Rata anuală a inflației în ${ACTUALIZAT}: ${ANUALA !== null ? nr(ANUALA) : "—"}%. Inflația în fiecare an din 1992, decembrie față de decembrie și media anuală, plus evoluția lună de lună.`;

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: `https://salariile.ro${CALE}` },
  openGraph: ogPage({ title: TITLU, description: DESC, path: CALE }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

// Anii, cel mai nou primul. Anul în curs are rândul lui, cu ultima lună în loc de decembrie.
const ANI = aniIntregi()
  .filter((an) => an > PRIMA_LUNA.an)
  .reverse()
  .map((an) => ({ an, decembrie: inflatieAnuala(an, 12), medie: inflatieMedieAnuala(an) }));

// Ultimele 24 de luni, cea mai nouă prima.
const LUNI = [...lunileAnului(ULTIMA_LUNA.an - 1), ...lunileAnului(ULTIMA_LUNA.an)].reverse().slice(0, 24);

const REPERE = [
  ["Rata anuală", ANUALA !== null ? `${nr(ANUALA)}%` : "—"],
  ["De la începutul anului", `${nr(DE_LA_INCEPUT)}%`],
  ["Ultima lună publicată", ACTUALIZAT],
] as const;

const FAQ = [
  {
    q: "Ce înseamnă rata anuală a inflației?",
    a: `Cu cât sunt mai mari prețurile dintr-o lună față de aceeași lună de anul trecut. În ${ACTUALIZAT}, prețurile de consum erau cu ${ANUALA !== null ? nr(ANUALA) : "—"}% mai mari decât cu un an înainte.`,
  },
  {
    q: "Care e diferența dintre inflația din decembrie și media anuală?",
    a: "Decembrie față de decembrie arată cât au crescut prețurile pe parcursul anului. Media anuală compară nivelul mediu al prețurilor dintr-un an cu cel din anul precedent. Un an care începe cu scumpiri mari și se liniștește are media peste cifra din decembrie.",
  },
  {
    q: "Când publică INS rata inflației?",
    a: "În comunicatul de presă din jurul datei de 12 a fiecărei luni, pentru luna precedentă. Tabelele de aici se actualizează din comunicat.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Rata inflației", item: `https://salariile.ro${CALE}` },
      ],
    },
    {
      "@type": "Dataset",
      name: "Indicele prețurilor de consum în România, serie lunară",
      description: `Lanțul lunar al indicelui prețurilor de consum, din ${etichetaLuna(PRIMA_LUNA)} până în ${ACTUALIZAT}.`,
      url: `https://salariile.ro${CALE}`,
      license: "https://data.gov.ro/base/images/logoinst/OGL-ROU-1.0.pdf",
      creator: { "@type": "GovernmentOrganization", name: SURSA.institutie },
      isBasedOn: SURSA.url,
      temporalCoverage: `${PRIMA_LUNA.an}-01/${ULTIMA_LUNA.an}-${String(ULTIMA_LUNA.luna).padStart(2, "0")}`,
      distribution: [
        { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: "https://salariile.ro/date/ipc-lunar.csv" },
        { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: "https://salariile.ro/date/ipc-lunar.json" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    personSchema,
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Rata inflației" }]} />
        <H1>Rata inflației în România</H1>
        <Lead>
          În {ACTUALIZAT}, prețurile de consum erau cu {ANUALA !== null ? nr(ANUALA) : "—"}% mai mari decât cu un an
          înainte. Mai jos, inflația în fiecare an și ultimele luni, din datele INS.
        </Lead>
      </Hero>

      <Reclama plasare="continut" className="pt-6 sm:pt-8" />

      <Section
        noTopBorder
        companion={
          <CardCompanion titlu={`Inflația în ${ACTUALIZAT}`} nota="Din comunicatul lunar al INS.">
            <Repere randuri={REPERE} />
          </CardCompanion>
        }
      >
        <h2>Inflația pe ani</h2>
        <p>
          Prima coloană compară decembrie cu decembrie, felul în care se anunță de obicei inflația unui an. A doua compară
          media prețurilor din an cu media anului dinainte.
        </p>
        <TabelArticol numeric>
          <thead>
            <tr>
              <th>Anul</th>
              <th>Decembrie față de decembrie</th>
              <th>Media anuală</th>
            </tr>
          </thead>
          <tbody>
            <tr id={`an-${ULTIMA_LUNA.an}`}>
              <th scope="row">{ULTIMA_LUNA.an}</th>
              <td>{ANUALA !== null ? `${nr(ANUALA)}% (${numeLuna(ULTIMA_LUNA.luna)})` : "—"}</td>
              <td>—</td>
            </tr>
            {ANI.map(({ an, decembrie, medie }) => (
              <tr key={an} id={`an-${an}`}>
                <th scope="row">{an}</th>
                <td>{decembrie !== null ? `${nr(decembrie)}%` : "—"}</td>
                <td>{medie !== null ? `${nr(medie)}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </TabelArticol>
        <p>
          Pentru {ULTIMA_LUNA.an}, rândul arată rata anuală a ultimei luni publicate; anul se închide cu cifra din decembrie.
        </p>

        <h2 id="lunar">Lună de lună</h2>
        <p>
          Indicele lunar e cel publicat de INS: cât la sută din prețul lunii precedente reprezintă prețul lunii curente. Peste
          100 înseamnă scumpire, sub 100 ieftinire.
        </p>
        <TabelArticol numeric>
          <thead>
            <tr>
              <th>Luna</th>
              <th>Indice</th>
              <th>Față de luna precedentă</th>
              <th>Față de anul trecut</th>
            </tr>
          </thead>
          <tbody>
            {LUNI.map((l) => (
              <tr key={`${l.an}-${l.luna}`}>
                <th scope="row">{etichetaLuna(l)}</th>
                <td>{nr(l.indice, 2)}</td>
                <td>{semn(l.indice - 100)}</td>
                <td>{l.anLaAn !== null ? `${nr(l.anLaAn)}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </TabelArticol>

        <h2 id="date">Datele, descărcabile</h2>
        <p>
          Seria lunară completă, din {etichetaLuna(PRIMA_LUNA)}, pe total și pe mărfuri alimentare, nealimentare și servicii:{" "}
          <a href="/date/ipc-lunar.csv">CSV</a> (se deschide în Excel) și <a href="/date/ipc-lunar.json">JSON</a>. Datele se
          reutilizează conform licenței {SURSA.licenta}, cu indicarea sursei.
        </p>

        <p className="source-note">
          Sursa: {SURSA.institutie},{" "}
          <a href={SURSA.url} target="_blank" rel="noopener">
            TEMPO-Online, matricea {SURSA.matrice}
          </a>
          , și comunicatul lunar „Indicele prețurilor de consum”.
        </p>
      </Section>

      <ReclamaIntreSectiuni />
      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/calculator-inflatie", label: "Calculator inflație", descriere: "Cât valorează o sumă din trecut, azi." },
          { href: "/salariu-mediu", label: "Salariul mediu", descriere: "Ultimul câștig salarial mediu publicat de INS." },
          { href: "/", label: "Calculator salariu net", descriere: "Brut în net pentru orice salariu." },
        ]}
      />
    </>
  );
}
