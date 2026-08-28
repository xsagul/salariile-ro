// src/app/(site)/joburi/page.tsx
// Hubul de recrutare. Server Component pur.
//
// Promisiunea paginii, si singurul motiv pentru care ar alege cineva locul asta
// in locul eJobs: fiecare anunt are salariu, iar salariul e aratat in net.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, CardCompanion, Faq, H1, Hero, Lead, Prose, Repere, Section } from "@/app/components/ui";
import { ListaJoburi } from "@/app/components/Joburi";
import { lei } from "@/app/components/Salarii";
import { calculStandard } from "@/lib/fiscal";
import { CATEGORII } from "@/lib/meserii";
import { ogPage, twPage } from "@/lib/seo";
import { categoriiCuJoburi, joburiActive, judeteCuJoburi, medianaBrut } from "@/lib/joburi";

const DESCRIERE =
  "Locuri de muncă în România unde salariul e obligatoriu afișat, în net și în brut. Fără „salariu negociabil” și fără cont.";

export const metadata: Metadata = {
  title: { absolute: "Locuri de muncă cu salariul afișat | Salariile.ro" },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/joburi" },
  openGraph: ogPage({ title: "Locuri de muncă cu salariul afișat", description: DESCRIERE, path: "/joburi" }),
  twitter: twPage({ title: "Locuri de muncă cu salariul afișat", description: DESCRIERE }),
};

export default function Joburi() {
  const joburi = joburiActive();
  const judete = judeteCuJoburi();
  const categorii = categoriiCuJoburi();
  const mediana = medianaBrut(joburi);
  const medianaNet = mediana ? (calculStandard(mediana)?.net ?? null) : null;
  const numeCategorie = (slug: string) => CATEGORII.find((c) => c.slug === slug)?.nume ?? slug;

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
        <h2>{joburi.length} anunțuri active</h2>
        <ListaJoburi joburi={joburi} />
        <p className="source-note">
          Netul e calculat cu același motor fiscal ca{" "}
          <Link href="/">calculatorul de salariu</Link>, pentru normă întreagă și funcția de bază. Cifra din
          anunț și cifra din calculator nu pot diverge.
        </p>
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
              o sumă necunoscută până își deschid un calculator. Aici e deja calculată, lângă brut.
            </p>

            {judete.length > 0 && (
              <>
                <h2>După județ</h2>
                <ul>
                  {judete.map(({ judet, nr }) => (
                    <li key={judet}>
                      {judet} — {nr} {nr === 1 ? "anunț" : "anunțuri"}
                    </li>
                  ))}
                </ul>
              </>
            )}

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
                  href="/joburi/publica"
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
