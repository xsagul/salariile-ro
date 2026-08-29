// src/app/(site)/locuri-de-munca/[oras]/[meserie]/page.tsx
//
// Oras × meserie. Ordinea segmentelor e ORAS/MESERIE, nu invers — asta e
// ordinea canonica a eJobs, verificata pe 30 august 2026: cererea
// /locuri-de-munca/barman/bucuresti raspunde 200, dar canonicalul ei arata
// catre /locuri-de-munca/bucuresti/barman. Prind ambele forme, indexeaza una.
//
// Volumul masurat pentru combinatie e mic — 68.870 pe 273 de cuvinte, fata de
// 1.743.710 pentru oras singur. DAR e sub-masurat: Seobility intoarce maximum
// 1.000 de cuvinte pe domeniu si coada lunga cade prima, iar 55 de localitati ×
// 126 de meserii inseamna peste 6.900 de combinatii posibile. De aceea paginile
// astea se genereaza DOAR pentru combinatiile care au anunturi reale — nu se
// pre-genereaza 6.900 de pagini goale, care ar fi exact tiparul de continut
// subtire pe care Google il penalizeaza.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, CardCompanion, Faq, H1, Hero, Lead, Prose, Section } from "@/app/components/ui";
import { ListaJoburi } from "@/app/components/Joburi";
import { lei } from "@/app/components/Salarii";
import { calculStandard } from "@/lib/fiscal";
import { MESERII } from "@/lib/meserii";
import { localitate as gasesteLocalitate } from "@/lib/localitati";
import { ogPage, twPage } from "@/lib/seo";
import { joburiActive, joburiDinLocalitateSiMeserie, medianaBrut } from "@/lib/joburi";

/** Doar combinatiile cu anunturi reale. Zero pagini goale. */
export function generateStaticParams() {
  const vazute = new Set<string>();
  const out: { oras: string; meserie: string }[] = [];
  for (const j of joburiActive()) {
    if (!j.meserie) continue;
    const cheie = `${j.localitate}/${j.meserie}`;
    if (vazute.has(cheie)) continue;
    vazute.add(cheie);
    out.push({ oras: j.localitate, meserie: j.meserie });
  }
  return out;
}

const lunaAn = () =>
  new Date().toLocaleDateString("ro-RO", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase());

export async function generateMetadata({
  params,
}: {
  params: Promise<{ oras: string; meserie: string }>;
}): Promise<Metadata> {
  const { oras, meserie } = await params;
  const l = gasesteLocalitate(oras);
  const m = MESERII.find((x) => x.slug === meserie);
  if (!l || !m) return {};
  const nr = joburiDinLocalitateSiMeserie(l.slug, m.slug).length;
  const titlu = `Locuri de muncă ${m.nume} ${l.nume}${nr ? ` • ${nr} ${nr === 1 ? "anunț" : "anunțuri"}` : ""} • ${lunaAn()}`;
  const descriere = `Posturi de ${m.de} în ${l.nume}, cu salariul afișat în net și în brut. Vezi cât se câștigă efectiv, nu „salariu negociabil”.`;
  return {
    title: { absolute: `${titlu} | Salariile.ro` },
    description: descriere,
    alternates: { canonical: `https://salariile.ro/locuri-de-munca/${l.slug}/${m.slug}` },
    openGraph: ogPage({ title: titlu, description: descriere, path: `/locuri-de-munca/${l.slug}/${m.slug}` }),
    twitter: twPage({ title: titlu, description: descriere }),
  };
}

export default async function PaginaOrasMeserie({
  params,
}: {
  params: Promise<{ oras: string; meserie: string }>;
}) {
  const { oras, meserie } = await params;
  const l = gasesteLocalitate(oras);
  const m = MESERII.find((x) => x.slug === meserie);
  if (!l || !m) notFound();

  const joburi = joburiDinLocalitateSiMeserie(l.slug, m.slug);
  if (!joburi.length) notFound();

  const mediana = medianaBrut(joburi);
  const medianaNet = mediana ? (calculStandard(mediana)?.net ?? null) : null;

  return (
    <>
      <Hero peGrila>
        <Breadcrumb
          items={[
            { href: "/", label: "Acasă" },
            { href: "/locuri-de-munca", label: "Locuri de muncă" },
            { href: `/locuri-de-munca/${l.slug}`, label: l.nume },
            { label: m.nume },
          ]}
        />
        <H1>
          {joburi.length} {joburi.length === 1 ? "loc de muncă" : "locuri de muncă"} {m.nume.toLowerCase()} în{" "}
          {l.nume}
        </H1>
        <Lead>
          Posturi de {m.de} în {l.nume}, toate cu salariul afișat. Vezi netul în mână lângă brutul din
          contract, calculat de noi.
        </Lead>
      </Hero>

      <Section
        wide
        faraProse
        companion={
          mediana && medianaNet ? (
            <CardCompanion
              titlu={`${m.nume} în ${l.nume}`}
              nota="Mediana anunțurilor de pe această pagină, nu o medie de piață."
            >
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-600">Brut</dt>
                  <dd className="font-medium text-stone-900">{lei(mediana)} lei</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-600">Net în mână</dt>
                  <dd className="font-medium text-stone-900">{lei(medianaNet)} lei</dd>
                </div>
              </dl>
            </CardCompanion>
          ) : undefined
        }
      >
        <ListaJoburi joburi={joburi} />
      </Section>

      <Section wide>
        <div className="md:grid md:grid-cols-5 md:gap-6">
          <Prose className="min-w-0 md:col-span-3">
            <h2>Cât câștigă un {m.de} în general</h2>
            <p>
              Cifrele de mai sus vin din anunțurile publicate aici. Pentru media pe sector, cu datele INS,
              vezi pagina <Link href={`/salarii/${m.slug}`}>salariu {m.de}</Link>. Cele două nu se compară
              direct: una e ce oferă acești angajatori acum, cealaltă e media statistică a sectorului.
            </p>
            <p>
              Vezi și <Link href={`/locuri-de-munca/${l.slug}`}>toate locurile de muncă din {l.nume}</Link>,
              cu filtru de distanță pentru localitățile din jur.
            </p>
          </Prose>

          <aside className="mt-8 md:col-span-2 md:mt-0">
            <CardCompanion titlu={`Angajezi ${m.de}?`} nota="Gratuit, fără cont.">
              <p className="text-sm text-stone-700">
                Anunțul intră automat și pe pagina orașului, și pe cea de meserie.
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
            q: `Cât se câștigă ca ${m.de} în ${l.nume}?`,
            a: mediana && medianaNet
              ? `Mediana anunțurilor active de aici este ${lei(mediana)} lei brut, adică ${lei(medianaNet)} lei net în mână. Este mediana ofertelor publicate, nu o medie de piață — pentru aceasta din urmă vezi pagina de meserie.`
              : "Nu avem încă suficiente anunțuri active pentru o mediană. Vezi pagina de meserie pentru media pe sector, din datele INS.",
          },
          {
            q: "De ce sunt puține anunțuri?",
            a: "Pentru că acceptăm doar anunțuri cu salariul afișat. Preferăm o listă scurtă și verificabilă uneia lungi, în care jumătate spun „salariu negociabil”.",
          },
        ]}
      />
    </>
  );
}
