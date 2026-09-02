import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, H1, Lead } from "@/app/components/ui";
import { lei, lunaLunga, procent } from "@/app/components/Salarii";
import { LUNA_REFERINTA, MATRICE_BRUT, MATRICE_NET, TOTAL_ECONOMIE } from "@/lib/ins-date";
import { MESERII, dateMeserie, type DateMeserie } from "@/lib/meserii";
import { personSchema } from "@/lib/person";
import { ogPage, SITE_URL, twPage } from "@/lib/seo";

const PAGE_PATH = "/studiu-salarii-meserii-romania-2026";
const LUNA = lunaLunga(LUNA_REFERINTA);

const DATE: DateMeserie[] = MESERII.map((meserie) => dateMeserie(meserie))
  .filter((date): date is DateMeserie => date !== null)
  .sort((a, b) => b.sector.brutCurent - a.sector.brutCurent || a.meserie.nume.localeCompare(b.meserie.nume, "ro"));

const ACTIVITATI = Array.from(new Map(DATE.map((item) => [item.sector.cheie, item])).values()).sort(
  (a, b) => b.sector.brutCurent - a.sector.brutCurent,
);

const PRIMA = ACTIVITATI[0];
const ULTIMA = ACTIVITATI[ACTIVITATI.length - 1];
const RAPORT = PRIMA.sector.brutCurent / ULTIMA.sector.brutCurent;
const PESTE_MEDIE = DATE.filter((d) => d.sector.brutCurent > TOTAL_ECONOMIE.brutCurent).length;
const TOP_10 = ACTIVITATI.slice(0, 10);
const BOTTOM_10 = ACTIVITATI.slice(-10).reverse();

const title = `Harta salariilor 2026: ${DATE.length} meserii și diferențele dintre domenii`;
const description = `Analiză Salariile.ro pe baza INS TEMPO-Online: ${DATE.length} meserii asociate activităților economice în care se practică, clasament, diferențe față de media pe economie și materiale reutilizabile pentru presă.`;

export const metadata: Metadata = {
  title: { absolute: `${title} | Salariile.ro` },
  description,
  alternates: { canonical: SITE_URL + PAGE_PATH },
  openGraph: ogPage({ title, description, path: PAGE_PATH }),
  twitter: twPage({ title, description }),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: title,
  description,
  url: SITE_URL + PAGE_PATH,
  datePublished: "2026-08-28",
  dateModified: "2026-08-28",
  inLanguage: "ro-RO",
  author: personSchema,
  publisher: {
    "@type": "Organization",
    name: "Salariile.ro",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: SITE_URL + "/og-image.png", width: 1200, height: 630 },
  },
  about: ["salarii România", "meserii", "piața muncii", "INS TEMPO-Online"],
  mainEntityOfPage: SITE_URL + PAGE_PATH,
};

function abatereFataDeEconomie(brut: number) {
  return (brut - TOTAL_ECONOMIE.brutCurent) / TOTAL_ECONOMIE.brutCurent;
}

export default function StudiuSalariiMeserii2026Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <main className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumb items={[{ href: "/", label: "Acasă" }, { href: "/salarii", label: "Salarii" }, { label: "Studiu 2026" }]} />

          <div className="max-w-4xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Studiu Salariile.ro · date INS · actualizat lunar</p>
            <H1>Harta salariilor în România: {DATE.length} meserii și diferențele dintre domenii în 2026</H1>
            <Lead>
              Am asociat {DATE.length} meserii cu activitățile economice în care sunt practicate și le-am pus pe aceeași scară folosind cea mai recentă serie lunară INS disponibilă, din <strong>{LUNA}</strong>. Rezultatul arată unde sunt cele mai mari diferențe între domenii, fără să inventeze „salarii pe ocupație” pe care INS nu le publică lunar.
            </Lead>
            <p className="mt-4 text-sm leading-relaxed text-stone-500">
              Publicat la 28 august 2026 · Autor: <Link href="/despre" className="font-medium text-stone-900 underline underline-offset-2">Știuriuc Sorin-Marian</Link> · Sursă primară: Institutul Național de Statistică, TEMPO-Online.
            </p>
          </div>

          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Cifre cheie">
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft lg:col-span-1">
              <p className="text-xs uppercase tracking-wide text-stone-500">Meserii urmărite</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">{DATE.length}</p>
              <p className="mt-2 text-sm text-stone-500">catalogul Salariile.ro</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
              <p className="text-xs uppercase tracking-wide text-stone-500">Vârful clasamentului</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">{lei(PRIMA.sector.brutCurent)}</p>
              <p className="mt-2 text-sm text-stone-500">lei brut/lună · CAEN {PRIMA.sector.cheie}</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
              <p className="text-xs uppercase tracking-wide text-stone-500">Coada clasamentului</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">{lei(ULTIMA.sector.brutCurent)}</p>
              <p className="mt-2 text-sm text-stone-500">lei brut/lună · CAEN {ULTIMA.sector.cheie}</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
              <p className="text-xs uppercase tracking-wide text-stone-500">Diferența vârf / bază</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">{RAPORT.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}×</p>
              <p className="mt-2 text-sm text-stone-500">între activitățile extreme</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
              <p className="text-xs uppercase tracking-wide text-stone-500">Peste media economiei</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-stone-900">{PESTE_MEDIE}</p>
              <p className="mt-2 text-sm text-stone-500">din {DATE.length} meserii asociate</p>
            </div>
          </section>

          <section className="mt-12 max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">Ce merită citat din studiu</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-stone-700">
              <p>
                Între activitatea aflată în vârful clasamentului și cea de la coadă există un raport de <strong>{RAPORT.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} la 1</strong>. Prima are un câștig salarial mediu brut de <strong>{lei(PRIMA.sector.brutCurent)} lei</strong>, iar ultima de <strong>{lei(ULTIMA.sector.brutCurent)} lei</strong> în {LUNA}.
              </p>
              <p>
                Media pe întreaga economie este de <strong>{lei(TOTAL_ECONOMIE.brutCurent)} lei brut/lună</strong>. Dintre cele {DATE.length} meserii din catalog, <strong>{PESTE_MEDIE}</strong> sunt asociate unor activități cu o medie peste acest prag.
              </p>
              <p>
                Diferențele nu trebuie citite ca salariul garantat al unei persoane. INS publică lunar câștigul pe <strong>activitatea economică a angajatorului (CAEN)</strong>, nu salariul individual pentru fiecare ocupație. Tocmai de aceea păstrăm această delimitare în toate tabelele.
              </p>
            </div>
          </section>

          <section className="mt-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-stone-900">Top 10 activități reprezentate în catalog</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-500">Folosim activități unice în acest top, ca meseriile care împart același CAEN să nu ocupe artificial mai multe poziții.</p>
              </div>
              <a href={`${PAGE_PATH}/grafic.svg`} className="text-sm font-semibold text-stone-900 underline underline-offset-4">Descarcă graficul SVG</a>
            </div>

            <div className="mt-5 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-soft">
              <table className="w-full min-w-[44rem] text-sm tabular-nums">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Loc</th>
                    <th className="px-4 py-3">Activitate INS</th>
                    <th className="px-4 py-3">Exemplu de meserie</th>
                    <th className="px-4 py-3 text-right">Brut/lună</th>
                    <th className="px-4 py-3 text-right">Față de economie</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_10.map((item, index) => {
                    const abatere = abatereFataDeEconomie(item.sector.brutCurent);
                    return (
                      <tr key={item.sector.cheie} className="border-t border-stone-100">
                        <td className="px-4 py-3 text-stone-500">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-stone-900">CAEN {item.sector.cheie} · {item.sector.denumire}</td>
                        <td className="px-4 py-3"><Link href={`/salarii/${item.meserie.slug}`} className="underline underline-offset-2">{item.meserie.nume}</Link></td>
                        <td className="px-4 py-3 text-right font-semibold">{lei(item.sector.brutCurent)} lei</td>
                        <td className="px-4 py-3 text-right">+{procent(abatere, 0)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">Cele 10 activități de la baza clasamentului</h2>
            <div className="mt-5 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-soft">
              <table className="w-full min-w-[44rem] text-sm tabular-nums">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Poziție</th>
                    <th className="px-4 py-3">Activitate INS</th>
                    <th className="px-4 py-3">Exemplu de meserie</th>
                    <th className="px-4 py-3 text-right">Brut/lună</th>
                    <th className="px-4 py-3 text-right">Față de economie</th>
                  </tr>
                </thead>
                <tbody>
                  {BOTTOM_10.map((item, index) => {
                    const abatere = abatereFataDeEconomie(item.sector.brutCurent);
                    return (
                      <tr key={item.sector.cheie} className="border-t border-stone-100">
                        <td className="px-4 py-3 text-stone-500">{ACTIVITATI.length - index}</td>
                        <td className="px-4 py-3 font-medium text-stone-900">CAEN {item.sector.cheie} · {item.sector.denumire}</td>
                        <td className="px-4 py-3"><Link href={`/salarii/${item.meserie.slug}`} className="underline underline-offset-2">{item.meserie.nume}</Link></td>
                        <td className="px-4 py-3 text-right font-semibold">{lei(item.sector.brutCurent)} lei</td>
                        <td className="px-4 py-3 text-right">−{procent(Math.abs(abatere), 0)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12 rounded-xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">Pentru presă, cercetare și citare</h2>
            <p className="mt-4 max-w-4xl text-base leading-relaxed text-stone-700">
              Datele factuale din tabele pot fi reutilizate. Pentru ca cititorul să poată verifica rapid metodologia și luna de referință, recomandăm formularea: <strong>„Sursa: Salariile.ro, Harta salariilor în România 2026, pe baza INS TEMPO-Online, {LUNA}”</strong>, cu link către această pagină.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`${PAGE_PATH}/date.csv`} download className="inline-flex min-h-11 items-center rounded-md bg-stone-900 px-5 text-sm font-semibold text-white no-underline hover:bg-stone-700">Descarcă datele studiului (CSV)</a>
              <a href={`${PAGE_PATH}/grafic.svg`} download className="inline-flex min-h-11 items-center rounded-md border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-900 no-underline hover:bg-stone-50">Descarcă graficul (SVG)</a>
              <Link href="/salarii/clasament" className="inline-flex min-h-11 items-center rounded-md border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-900 no-underline hover:bg-stone-50">Vezi clasamentul complet</Link>
            </div>
          </section>

          <section className="mt-12 max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">Metodologie</h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-stone-700">
              <p>
                Catalogul conține {DATE.length} meserii. Fiecărei meserii îi este asociată activitatea economică CAEN în care este practicată în mod tipic. Pentru comparația lunară folosim câștigul salarial mediu brut publicat de INS pe activități economice.
              </p>
              <p>
                Sursa este Institutul Național de Statistică, TEMPO-Online, matricele <strong>{MATRICE_BRUT}</strong> și <strong>{MATRICE_NET}</strong>, ultima lună inclusă fiind <strong>{LUNA}</strong>. Media pe economie și valorile pe activități sunt preluate din aceeași familie de serii pentru comparabilitate.
              </p>
              <p>
                Studiul nu afirmă că o ocupație individuală are exact media activității. Pentru paginile pe meserii folosim separat și datele ocupaționale anuale pe grupe ISCO-08. Detaliile complete sunt în <Link href="/metodologie" className="font-medium underline underline-offset-2">metodologia Salariile.ro</Link>.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
