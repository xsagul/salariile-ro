import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Breadcrumb, CtaCard, Eyebrow, H1, Hero, Lead, Section, CardCompanion, SUB_TITLU } from "@/app/components/ui";
import {
  LATEST_INS_EARNINGS,
  SALARY_DATA_2026,
  SALARY_DATASET_REFERENCE_DATE,
  SALARY_DATASET_SOURCES,
  SALARY_DATASET_USAGE_TERMS,
  SALARY_DATASET_VERSION,
} from "@/lib/date-salarii";
import { personSchema } from "@/lib/person";
import { ogPage, SITE_URL, twPage } from "@/lib/seo";
import BuletinSalarii from '@/app/components/BuletinSalarii';
import TabelArticol from "@/app/components/TabelArticol";

const PAGE_PATH = "/date-salarii";
const CSV_PATH = "/date-salarii-romania-2026.csv";
const JSON_PATH = "/date-salarii-romania-2026.json";

const title = "Date salariale România 2026: CSV și JSON";
const description =
  "Set de date salariale România 2026: salariu minim, indicator BASS și câștig mediu INS, cu surse oficiale, metodologie și fișiere CSV/JSON.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: SITE_URL + PAGE_PATH },
  openGraph: ogPage({ title, description, path: PAGE_PATH }),
  twitter: twPage({ title, description }),
};

const valueTypeLabels = {
  legal_threshold: "prag legal",
  statutory_budget_indicator: "indicator bugetar legal",
  observed_aggregate: "statistică agregată",
  not_included: "neinclus",
  standard_calculation: "calcul standard",
  standard_estimate: "estimare standard",
} as const;

const formatLei = (value: number | null) =>
  value === null ? "—" : new Intl.NumberFormat("ro-RO").format(value);

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Date salariale România 2026",
          item: SITE_URL + PAGE_PATH,
        },
      ],
    },
    {
      "@type": "Dataset",
      name: "Date salariale România 2026",
      alternateName: "Romania Salary Data 2026",
      description,
      url: SITE_URL + PAGE_PATH,
      identifier: "salariile-ro-date-salarii-2026",
      version: SALARY_DATASET_VERSION,
      datePublished: "2026-07-29",
      dateModified: SALARY_DATASET_REFERENCE_DATE,
      inLanguage: "ro-RO",
      isAccessibleForFree: true,
      temporalCoverage: "2026-01-01/2026-12-31",
      // GSC a raportat pe 1 august 2026 „Invalid object type for field
      // 'spatialCoverage'" pentru varianta cu `Country`. Deși Country e subtip
      // de Place în schema.org, validatorul Google pentru Dataset acceptă doar
      // Place sau text. Bounding box-ul e formatul din documentația lor:
      // "latitudine_min longitudine_min latitudine_max longitudine_max".
      spatialCoverage: {
        "@type": "Place",
        name: "România",
        geo: {
          "@type": "GeoShape",
          box: "43.618 20.261 48.265 29.691",
        },
      },
      creator: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: SITE_URL + "/icon-512.png",
          width: 512,
          height: 512,
        },
      },
      mainEntityOfPage: SITE_URL + PAGE_PATH,
      // URI canonic, nu o ancoră proprie: un parser nu poate interpreta o
      // secțiune de pagină. CC0 pentru că valorile sunt fapte din acte
      // normative și comunicate INS, asupra cărora nu revendicăm drepturi;
      // citarea rămâne cerută ca normă, explicată în secțiunea #reutilizare.
      license: "https://creativecommons.org/publicdomain/zero/1.0/",
      keywords: [
        "salariu minim România 2026",
        "câștig salarial mediu INS",
        "indicator BASS 2026",
        "date salariale CSV",
        "date salariale JSON",
      ],
      variableMeasured: [
        "salariu brut lunar în lei",
        "salariu net lunar în lei",
        "perioada de referință",
        "natura valorii",
      ],
      measurementTechnique:
        "Transcriere și clasificare manuală a valorilor din acte normative și comunicatul INS, cu separarea valorilor oficiale de calculele și estimările Salariile.ro.",
      citation: Object.values(SALARY_DATASET_SOURCES).map((source) => ({
        "@type": "CreativeWork",
        name: source.name,
        url: source.official_url,
      })),
      distribution: [
        {
          "@type": "DataDownload",
          name: "Date salariale România 2026 — CSV",
          encodingFormat: "text/csv",
          contentUrl: SITE_URL + CSV_PATH,
        },
        {
          "@type": "DataDownload",
          name: "Date salariale România 2026 — JSON",
          encodingFormat: "application/json",
          contentUrl: SITE_URL + JSON_PATH,
        },
      ],
    },
  ],
};

export default function DateSalariiPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Date salariale 2026" }]} />
        <H1>Date salariale România 2026</H1>
        <p className={`${SUB_TITLU} text-sm text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2`}>
          Compilat și verificat de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Publicat 29 iulie 2026 · Actualizat 25 august 2026
        </p>
        <Lead>
          Un set mic, verificabil și pregătit pentru reutilizare: salariul minim din ambele semestre,
          indicatorul BASS și ultimul câștig salarial mediu disponibil de la INS. Fiecare valoare păstrează
          perioada, natura și sursa ei.
        </Lead>
        <Eyebrow>DATA DE REFERINȚĂ 25 AUGUST 2026 · 4 ÎNREGISTRĂRI · RON/LUNĂ</Eyebrow>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={CSV_PATH}
            download
            type="text/csv"
            className="inline-flex min-h-11 items-center rounded border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white no-underline transition-colors hover:bg-stone-700"
          >
            Descarcă CSV
          </a>
          <a
            href={JSON_PATH}
            download
            type="application/json"
            className="inline-flex min-h-11 items-center rounded border border-stone-300 bg-white px-5 text-sm font-medium text-stone-900 no-underline transition-colors hover:bg-stone-100"
          >
            Descarcă JSON
          </a>
        </div>
      </Hero>

      <Section
        companion={
          <CardCompanion titlu="Reutilizare și citare">
            <div id="reutilizare" className="scroll-mt-24 flex flex-col gap-3 text-sm leading-normal text-stone-600">
              <p>{SALARY_DATASET_USAGE_TERMS}</p>
              <p>
                Citează așa: <strong className="font-semibold text-stone-900">Salariile.ro, „Date salariale România
                2026”, versiunea {SALARY_DATASET_VERSION}, accesată la data utilizării</strong>. Într-o analiză fiscală,
                adaugă și actul normativ sau comunicatul INS al valorii folosite.
              </p>
            </div>
          </CardCompanion>
        }
      >
        <h2>Setul de date, pe scurt</h2>
        <p>
          Tabelul nu pune semnul egal între indicatori diferiți. <strong>Pragul legal</strong>,{" "}
          <strong>indicatorul bugetar</strong>, <strong>estimarea fiscală</strong> și{" "}
          <strong>statistica INS</strong> sunt etichetate separat tocmai pentru a nu fi citate în afara contextului.
        </p>

        <TabelArticol>
            <thead>
              <tr>
                <th scope="col">Indicator și perioadă</th>
                <th scope="col">Brut (lei)</th>
                <th scope="col">Net (lei)</th>
                <th scope="col">Sursă</th>
              </tr>
            </thead>
            <tbody>
              {SALARY_DATA_2026.map((record) => (
                <tr key={record.id}>
                  <th scope="row">
                    <strong>{record.indicator}</strong>
                    <span className="mt-1 block text-xs text-stone-600">{record.period_label}</span>
                  </th>
                  <td>
                    <strong>{formatLei(record.gross_lei)}</strong>
                    <span className="mt-1 block text-xs text-stone-600">
                      {valueTypeLabels[record.gross_value_type]}
                    </span>
                  </td>
                  <td>
                    <strong>{formatLei(record.net_lei)}</strong>
                    <span className="mt-1 block text-xs text-stone-600">
                      {valueTypeLabels[record.net_value_type]}
                    </span>
                  </td>
                  <td>
                    {record.source_ids.map((sourceId, index) => {
                      const source = SALARY_DATASET_SOURCES[sourceId];
                      return (
                        <span key={sourceId}>
                          {index > 0 && " · "}
                          <a href={source.official_url} target="_blank" rel="noopener noreferrer">
                            {source.name}
                          </a>
                        </span>
                      );
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
        </TabelArticol>
        <p className="source-note">
          „—” înseamnă că valoarea nu este inclusă în această versiune, nu că ar fi zero. Fișierele descărcabile
          conțin și datele ISO ale perioadelor, tipul fiecărei valori și notele metodologice.
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Cum se actualizează">
            <ul className="flex flex-col gap-2 text-sm leading-normal text-stone-600">
              <li>Pragurile legale sunt transcrise din actele de pe Portalul Legislativ.</li>
              <li>Cifrele statistice vin din comunicatul lunar INS indicat la fiecare rând.</li>
              <li>
                Calculele și estimările sunt etichetate separat și urmează{" "}
                <Link href="/metodologie" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">metodologia</Link>.
              </li>
              <li>Setul se schimbă când intră în vigoare un prag nou sau când INS publică o lună nouă.</li>
            </ul>
            <p className="mt-3 text-sm leading-normal text-stone-600">
              Ultima lună INS inclusă e {LATEST_INS_EARNINGS.periodLabel}: statisticile lunare apar la câteva
              săptămâni după luna măsurată. Câmpul <code>reference_date</code> spune până când a fost verificat setul.
            </p>
          </CardCompanion>
        }
      >
        <h2>De ce 9.192 lei nu este același lucru cu {formatLei(LATEST_INS_EARNINGS.grossLei)} lei</h2>
        <p>
          <strong>9.192 lei brut</strong> este câștigul salarial mediu brut utilizat la fundamentarea bugetului
          asigurărilor sociale de stat pentru întregul an 2026. Este stabilit prin <strong>Legea 44/2026</strong> și
          intră în calcule precum cele din sistemul de pensii. Nu este o măsurătoare lunară a salariilor plătite.
        </p>
        <p>
          <strong>{formatLei(LATEST_INS_EARNINGS.grossLei)} lei brut și {formatLei(LATEST_INS_EARNINGS.netLei)} lei net</strong> sunt valorile agregate publicate de INS pentru{" "}
          <strong>{LATEST_INS_EARNINGS.periodLabel}</strong>. Ele descriu populația și metodologia statistică INS. Netul de {formatLei(LATEST_INS_EARNINGS.netLei)} lei nu este
          rezultatul introducerii unui brut individual de {formatLei(LATEST_INS_EARNINGS.grossLei)} lei într-un calculator salarial.
        </p>
        <p>
          <strong>5.377 lei net</strong> este numai estimarea Salariile.ro pentru un calcul salarial standard pornind
          de la indicatorul BASS de 9.192 lei. Este marcată ca estimare atât în pagină, cât și în CSV și JSON.
        </p>
      </Section>

      <Section wide>
        <BuletinSalarii />
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Surse oficiale">
            <ul className="flex flex-col gap-2 text-sm leading-normal text-stone-600">
              {Object.entries(SALARY_DATASET_SOURCES).map(([sourceId, source]) => (
                <li key={sourceId}>
                  <a href={source.official_url} target="_blank" rel="noopener noreferrer" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600">
                    {source.name}
                  </a>{" "}
                  · {source.institution}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-stone-600">
              Salariile.ro e un proiect independent, fără legătură cu instituțiile care publică sursele.
            </p>
          </CardCompanion>
        }
      >
        <h2>Dicționar de date</h2>
        <TabelArticol>
            <thead>
              <tr>
                <th scope="col">Câmp</th>
                <th scope="col">Semnificație</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row"><code>gross_lei</code></th><td>Valoarea brută lunară, în lei.</td></tr>
              <tr><th scope="row"><code>net_lei</code></th><td>Valoarea netă lunară; <code>null</code> în JSON sau câmp gol în CSV înseamnă „neinclus”.</td></tr>
              <tr><th scope="row"><code>gross_value_type</code></th><td>Separă pragul legal, indicatorul bugetar și statistica agregată observată.</td></tr>
              <tr><th scope="row"><code>net_value_type</code></th><td>Separă calculul, estimarea, statistica agregată și valoarea neinclusă.</td></tr>
              <tr><th scope="row"><code>period_start</code> / <code>period_end</code></th><td>Intervalul de referință în format ISO 8601.</td></tr>
              <tr><th scope="row"><code>source_ids</code></th><td>Chei către lista de surse oficiale din JSON; în CSV sunt separate prin caracterul <code>|</code>.</td></tr>
            </tbody>
        </TabelArticol>
      </Section>

      <CtaCard title="Ai nevoie de formulele din spatele valorilor?" href="/metodologie" label="Vezi metodologia completă">
        Documentația explică separat CAS, CASS, impozitul, deducerea personală, facilitatea salariului minim și
        modul de rotunjire.
      </CtaCard>
    </>
  );
}
