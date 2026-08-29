// src/app/(site)/locuri-de-munca/[oras]/page.tsx
//
// Pagina de oras — cea mai valoroasa din tot clusterul de recrutare.
//
// MASURAT, 30 august 2026: interogarile care contin o localitate aduna 1.743.710
// cautari lunare, fata de 93.100 pentru meserie singura si 68.870 pentru
// combinatie. „locuri de munca brasov" singur are 27.100 si e detinut de eJobs
// de pe pozitia 1. Un oras mediu valoreaza cat tot clusterul nostru de
// calculatoare.
//
// TITLUL copiaza formula eJobs, pentru ca e buna si se genereaza din date:
// numarul real de anunturi plus luna curenta. Numarul da concretete, luna da
// prospetime — si niciunul nu minte, fiindca amandoua vin din continut.
//
// Rutele sunt allowlist: `generateStaticParams` peste catalogul de localitati.
// Un oras inexistent da 404, nu o pagina goala.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, CardCompanion, Faq, H1, Hero, Lead, Prose, Repere, Section } from "@/app/components/ui";
import FiltruDistanta, { type JobCuDistanta } from "@/app/components/FiltruDistanta";
import { lei } from "@/app/components/Salarii";
import { calculStandard } from "@/lib/fiscal";
import { MESERII } from "@/lib/meserii";
import { LOCALITATI, distantaKm, localitate as gasesteLocalitate } from "@/lib/localitati";
import { ogPage, twPage } from "@/lib/seo";
import { joburiDinLocalitate, joburiInRaza, medianaBrut, meseriiDinLocalitate } from "@/lib/joburi";

const RAZA_MAXIMA_KM = 100;

export function generateStaticParams() {
  return LOCALITATI.map((l) => ({ oras: l.slug }));
}

const lunaAn = () =>
  new Date().toLocaleDateString("ro-RO", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase());

export async function generateMetadata({ params }: { params: Promise<{ oras: string }> }): Promise<Metadata> {
  const { oras } = await params;
  const l = gasesteLocalitate(oras);
  if (!l) return {};
  // Numai posturile din oras. Cele remote apar in lista, dar nu sunt „in Cluj".
  const nr = joburiDinLocalitate(l.slug).length;
  const titlu = `Locuri de muncă ${l.nume}${nr ? ` • ${nr} anunțuri` : ""} • ${lunaAn()}`;
  const descriere = `Locuri de muncă în ${l.nume}, ${l.judet}, toate cu salariul afișat în net și în brut. Filtru de distanță până la ${RAZA_MAXIMA_KM} km, fără cont.`;
  return {
    title: { absolute: `${titlu} | Salariile.ro` },
    description: descriere,
    alternates: { canonical: `https://salariile.ro/locuri-de-munca/${l.slug}` },
    openGraph: ogPage({ title: titlu, description: descriere, path: `/locuri-de-munca/${l.slug}` }),
    twitter: twPage({ title: titlu, description: descriere }),
  };
}

export default async function PaginaOras({ params }: { params: Promise<{ oras: string }> }) {
  const { oras } = await params;
  const l = gasesteLocalitate(oras);
  if (!l) notFound();

  const joburi = joburiInRaza(l.slug, RAZA_MAXIMA_KM);
  const inOras = joburiDinLocalitate(l.slug);
  const remote = joburi.filter((j) => j.modLucru === "remote" && j.localitate !== l.slug);
  const intrari: JobCuDistanta[] = joburi
    .map((job) => {
      const lj = gasesteLocalitate(job.localitate);
      const km = job.modLucru === "remote" ? null : lj ? distantaKm(l, lj) : null;
      return { job, km, localitate: lj?.nume ?? job.localitate };
    })
    .sort((a, b) => (a.km ?? -1) - (b.km ?? -1));

  const mediana = inOras.length ? medianaBrut(inOras) : null;
  const medianaNet = mediana ? (calculStandard(mediana)?.net ?? null) : null;
  const meserii = meseriiDinLocalitate(l.slug);
  const numeMeserie = (slug: string) => MESERII.find((m) => m.slug === slug)?.nume ?? slug;
  const apropiate = LOCALITATI.filter((x) => x.slug !== l.slug)
    .map((x) => ({ x, km: distantaKm(l, x) }))
    .filter(({ km }) => km <= 80)
    .sort((a, b) => a.km - b.km)
    .slice(0, 6);

  return (
    <>
      <Hero peGrila>
        <Breadcrumb
          items={[
            { href: "/", label: "Acasă" },
            { href: "/locuri-de-munca", label: "Locuri de muncă" },
            { label: l.nume },
          ]}
        />
        <H1>
          {inOras.length ? `${inOras.length} locuri de muncă în ${l.nume}` : `Locuri de muncă în ${l.nume}`}
        </H1>
        <Lead>
          Toate anunțurile din {l.nume}, județul {l.judet}, cu salariul afișat — în net și în brut. Poți
          extinde căutarea la localitățile din jur, până la {RAZA_MAXIMA_KM} km
          {remote.length > 0 ? `, iar ${remote.length === 1 ? "un post remote apare" : `${remote.length} posturi remote apar`} indiferent de rază` : ""}.
        </Lead>
      </Hero>

      <Section
        wide
        faraProse
        companion={
          mediana && medianaNet ? (
            <CardCompanion
              titlu={`Salariile din ${l.nume}`}
              nota={`Mediana celor ${inOras.length} anunțuri din ${l.nume}. Nu e o medie de piață.`}
            >
              <Repere
                randuri={[
                  ["Brut", `${lei(mediana)} lei`],
                  ["Net în mână", `${lei(medianaNet)} lei`],
                  ["Anunțuri în oraș", String(inOras.length)],
                ]}
              />
            </CardCompanion>
          ) : undefined
        }
      >
        <FiltruDistanta intrari={intrari} numeOras={l.nume} />
      </Section>

      {meserii.length > 0 && (
        <Section wide faraProse>
          <h2 className="mb-4 text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">
            Meserii căutate în {l.nume}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {meserii.map(({ meserie, nr }) => (
              <li key={meserie}>
                <Link
                  href={`/locuri-de-munca/${l.slug}/${meserie}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded border border-stone-200 bg-surface px-3 text-sm text-stone-900 transition-colors hover:bg-canvas"
                >
                  {numeMeserie(meserie)} <span className="text-xs text-stone-600">{nr}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section wide>
        <div className="md:grid md:grid-cols-5 md:gap-6">
          <Prose className="min-w-0 md:col-span-3">
            <h2>Cât se câștigă în {l.nume}</h2>
            <p>
              Cifrele de mai sus sunt din anunțurile publicate aici, nu o medie de piață. Pentru media reală
              pe județ, cu datele INS, vezi{" "}
              <Link href="/salarii/judete">salariile pe județe</Link>. Iar dacă vrei să verifici o ofertă
              primită, calculatorul îți spune exact cât rămâne în mână.
            </p>
            <p>
              Netul din fiecare anunț e calculat cu{" "}
              <Link href="/">același motor fiscal</Link> ca restul site-ului: CAS 25%, CASS 10%, impozit 10%,
              cu deducerea personală aplicată. Nu e declarat de angajator.
            </p>

            {apropiate.length > 0 && (
              <>
                <h2>Localități apropiate</h2>
                <ul>
                  {apropiate.map(({ x, km }) => (
                    <li key={x.slug}>
                      <Link href={`/locuri-de-munca/${x.slug}`}>{x.nume}</Link> — la {Math.round(km)} km
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Prose>

          <aside className="mt-8 md:col-span-2 md:mt-0">
            <CardCompanion titlu={`Angajezi în ${l.nume}?`} nota="Gratuit, fără cont.">
              <p className="text-sm text-stone-700">
                Publică anunțul cu salariul trecut. Netul îl calculăm noi și îl vede candidatul lângă brut.
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
            q: `Cum găsesc un loc de muncă aproape de casă în ${l.nume}?`,
            a: `Folosește filtrul de distanță din capul listei. La „În oraș" vezi doar anunțurile din ${l.nume}; la +15 sau +30 km apar și cele din localitățile din jur, cu distanța scrisă pe fiecare.`,
          },
          {
            q: "De ce toate anunțurile au salariul?",
            a: "Pentru că formularul de publicare nu permite altfel. Un anunț fără sumă nu se poate trimite, deci nu ajunge pe site.",
          },
          {
            q: "Anunțurile remote apar în lista orașului?",
            a: "Da, la orice rază. Un post remote nu are distanță față de nimic, deci nu are sens să fie ascuns de un filtru geografic.",
          },
        ]}
      />
    </>
  );
}
