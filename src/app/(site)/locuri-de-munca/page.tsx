// src/app/(site)/locuri-de-munca/page.tsx
// Hubul de recrutare. Server Component pur.
//
// Promisiunea paginii, si singurul motiv pentru care ar alege cineva locul asta
// in locul eJobs: fiecare anunt are salariu, iar salariul e aratat in net.
//
// Structura urmeaza ce am masurat pe 30 august 2026: traficul din recrutare sta
// in ORAS (1.743.710 cautari lunare pe interogari cu localitate), nu in meserie
// (93.100) si nici in combinatie (68.870). Deci hubul trimite intai spre orase.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, CardCompanion, Faq, H1, Hero, Lead, Prose, Repere, Section } from "@/app/components/ui";
import { ListaJoburi } from "@/app/components/Joburi";
import { lei } from "@/app/components/Salarii";
import { calculStandard } from "@/lib/fiscal";
import { CATEGORII } from "@/lib/meserii";
import { localitatiDupaCerere } from "@/lib/localitati";
import { ogPage, twPage } from "@/lib/seo";
import { categoriiCuJoburi, joburiActive, localitatiCuJoburi, medianaBrut } from "@/lib/joburi";

const DESCRIERE =
  "Locuri de muncă în România unde salariul e obligatoriu afișat, în net și în brut. Fără „salariu negociabil” și fără cont.";

export const metadata: Metadata = {
  title: { absolute: "Locuri de muncă cu salariul afișat | Salariile.ro" },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/locuri-de-munca" },
  openGraph: ogPage({ title: "Locuri de muncă cu salariul afișat", description: DESCRIERE, path: "/locuri-de-munca" }),
  twitter: twPage({ title: "Locuri de muncă cu salariul afișat", description: DESCRIERE }),
};

export default function LocuriDeMunca() {
  const joburi = joburiActive();
  const cuJoburi = localitatiCuJoburi();
  const categorii = categoriiCuJoburi();
  const mediana = medianaBrut(joburi);
  const medianaNet = mediana ? (calculStandard(mediana)?.net ?? null) : null;
  const numeCategorie = (slug: string) => CATEGORII.find((c) => c.slug === slug)?.nume ?? slug;
  const orase = localitatiDupaCerere().slice(0, 24);
  const cuAnunturi = new Map(cuJoburi.map((x) => [x.localitate.slug, x.nr]));

  return (
    <>
      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Locuri de muncă" }]} />
        <H1>Locuri de muncă cu salariul afișat</H1>
        <Lead>
          Fiecare anunț de aici are salariul scris. Nu există „salariu negociabil”, pentru că un anunț fără
          sumă nu se poate publica. Iar suma o vezi în net, nu doar în brut.
        </Lead>
      </Hero>

      <Section
        wide
        faraProse
        companion={
          mediana && medianaNet ? (
            <CardCompanion titlu="Mediana anunțurilor" nota="Calculată pe anunțurile active de pe această pagină.">
              <Repere
                randuri={[
                  ["Brut", `${lei(mediana)} lei`],
                  ["Net în mână", `${lei(medianaNet)} lei`],
                  ["Anunțuri active", String(joburi.length)],
                ]}
              />
            </CardCompanion>
          ) : undefined
        }
      >
        <h2 className="mb-4 text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
          {joburi.length} anunțuri active
        </h2>
        <ListaJoburi joburi={joburi} />
        <p className="mt-4 text-sm leading-normal text-stone-600">
          Netul e calculat cu același motor fiscal ca{" "}
          <Link href="/" className="font-medium text-stone-900 underline underline-offset-2">
            calculatorul de salariu
          </Link>
          , pentru normă întreagă și funcția de bază. Cifra din anunț și cifra din calculator nu pot diverge.
        </p>
      </Section>

      <Section wide faraProse>
        <h2 className="mb-2 text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Caută în orașul tău</h2>
        <p className="mb-5 max-w-prose text-base leading-normal text-stone-600">
          Fiecare oraș are pagina lui, cu filtru de distanță — poți vedea și ce e în localitățile din jur, până
          la 100 km.
        </p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {orase.map((l) => {
            const nr = cuAnunturi.get(l.slug) ?? 0;
            return (
              <li key={l.slug}>
                <Link
                  href={`/locuri-de-munca/${l.slug}`}
                  className="flex min-h-11 items-center justify-between gap-2 rounded border border-stone-200 bg-surface px-3 py-2 text-sm text-stone-900 transition-colors hover:bg-canvas"
                >
                  <span>{l.nume}</span>
                  {nr > 0 ? <span className="text-xs font-medium text-stone-600">{nr}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section wide>
        <div className="md:grid md:grid-cols-5 md:gap-6">
          <Prose className="min-w-0 md:col-span-3">
            <h2>De ce toate anunțurile au salariul</h2>
            <p>
              Pe site-urile mari de recrutare, aproximativ un anunț din patru are salariul scris. Restul spun
              „salariu motivant” sau „pachet atractiv”, iar cifra apare abia la interviu. Aici formularul de
              publicare nu permite trimiterea fără sumă, deci problema nu poate ajunge pe site.
            </p>
            <p>
              A doua diferență e netul. Un anunț care spune „6.000 lei” înseamnă, pentru cei mai mulți oameni,
              o sumă necunoscută până își deschid un calculator. Aici e deja calculată, lângă brut. Iar dacă
              angajatorul a gândit în net — cum se întâmplă în HoReCa sau construcții — el scrie suma din mână
              și noi calculăm brutul.
            </p>

            {categorii.length > 0 && (
              <>
                <h2>După domeniu</h2>
                <ul>
                  {categorii.map(({ categorie, nr }) => (
                    <li key={categorie}>
                      {numeCategorie(categorie)} — {nr} {nr === 1 ? "anunț" : "anunțuri"}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Prose>

          <aside className="mt-8 md:col-span-2 md:mt-0">
            <CardCompanion titlu="Publici un anunț?" nota="Gratuit, fără cont și fără abonament.">
              <p className="text-sm text-stone-700">
                Singura condiție este să treci salariul. Un interval e suficient, iar netul îl calculăm noi.
              </p>
              <p className="mt-3">
                <Link
                  href="/locuri-de-munca/publica"
                  className="inline-flex min-h-11 items-center rounded bg-stone-900 px-4 text-sm font-medium text-white"
                >
                  Publică un anunț
                </Link>
              </p>
            </CardCompanion>
          </aside>
        </div>
      </Section>

      <Faq
        items={[
          {
            q: "De ce toate anunțurile au salariul afișat?",
            a: "Pentru că formularul nu permite altfel. Un anunț fără sumă nu se poate trimite, deci nu poate ajunge pe site. Este singura regulă care diferențiază hubul acesta.",
          },
          {
            q: "Ce înseamnă netul afișat?",
            a: "Suma care ajunge în cont pentru un contract cu normă întreagă, fără persoane în întreținere, la funcția de bază. Este calculat cu același motor fiscal ca restul site-ului: CAS 25%, CASS 10%, impozit 10%, cu deducerea personală aplicată.",
          },
          {
            q: "Pot căuta locuri de muncă aproape de casă?",
            a: "Da. Pe pagina fiecărui oraș există un filtru de distanță — 5, 10, 15, 30, 50 sau 100 km. Anunțurile remote apar indiferent de rază, pentru că nu au distanță.",
          },
          {
            q: "Legea transparenței salariale obligă angajatorii să publice salariul?",
            a: "Nu. Proiectul aflat în Parlament obligă angajatorul să comunice nivelul de salarizare candidatului în procesul de recrutare, nu să îl publice în anunț. Regula de aici este a noastră, nu a legii.",
          },
          {
            q: "Costă ceva publicarea?",
            a: "Nu. Nu există cont, abonament sau taxă de listare.",
          },
        ]}
      />
    </>
  );
}
