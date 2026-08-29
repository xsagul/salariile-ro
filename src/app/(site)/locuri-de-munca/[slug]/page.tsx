// src/app/(site)/locuri-de-munca/[slug]/page.tsx
// Pagina unui anunt. Server Component pur.
//
// SEO: `JobPosting` in JSON-LD e conditia de intrare in Google for Jobs, adica
// in widgetul de joburi din SERP. Fiecare anunt de aici are `baseSalary`, ceea
// ce e semnal puternic acolo — si e exact campul pe care 77,5% din anunturile
// de pe eJobs nu il au.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, H1, Hero, Section } from "@/app/components/ui";
import { Eticheta, SalariuJob } from "@/app/components/Joburi";
import RaporteazaAnunt from "@/app/components/RaporteazaAnunt";
import { NotaSursa } from "@/app/components/Salarii";
import { MESERII } from "@/lib/meserii";
import { ogPage, twPage } from "@/lib/seo";
import {
  MOD_LUCRU,
  TIP_CONTRACT,
  ZILE_PANA_LA_AVERTISMENT,
  esteVechi,
  jobDupaSlug,
  joburiActive,
  jobPostingSchema,
  varstaText,
  zilePanaLaExpirare,
} from "@/lib/joburi";

export function generateStaticParams() {
  return joburiActive().map((j) => ({ slug: j.slug }));
}

// JSON.stringify pus direct intr-un <script> se poate rupe daca textul contine
// „</script>". Anunturile vor veni de la angajatori, deci textul e necontrolat
// de noi — se escapeaza de pe acum, nu dupa primul incident.
function jsonLdSigur(obiect: unknown): string {
  return JSON.stringify(obiect).replace(/</g, "\\u003c");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = jobDupaSlug(slug);
  if (!job) return {};
  const titlu = `${job.titlu} – ${job.oras ?? job.judet}`;
  const descriere = `${job.companie} caută ${job.titlu.toLowerCase()} în ${job.oras ?? job.judet}. Salariu ${job.salariu.min}–${job.salariu.max} lei brut, cu netul calculat.`;
  return {
    title: { absolute: `${titlu} | Salariile.ro` },
    description: descriere,
    alternates: { canonical: `https://salariile.ro/locuri-de-munca/${job.slug}` },
    openGraph: ogPage({ title: titlu, description: descriere, path: `/locuri-de-munca/${job.slug}` }),
    twitter: twPage({ title: titlu, description: descriere }),
  };
}

export default async function PaginaJob({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = jobDupaSlug(slug);
  if (!job) notFound();

  const url = `https://salariile.ro/locuri-de-munca/${job.slug}`;
  const meserie = job.meserie ? MESERII.find((m) => m.slug === job.meserie) : undefined;
  const dataRo = (iso: string) =>
    new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <Hero peGrila>
        <Breadcrumb
          items={[
            { href: "/", label: "Acasă" },
            { href: "/joburi", label: "Locuri de muncă" },
            { label: job.titlu },
          ]}
        />
        <H1>{job.titlu}</H1>
        <p className="mt-2 text-lg text-stone-600">
          {job.companie} · {job.oras ?? job.judet}
        </p>

        <div className="mt-5 rounded-md border border-stone-200 bg-surface p-5">
          <SalariuJob job={job} marime="mare" />
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Eticheta>{TIP_CONTRACT[job.tipContract]}</Eticheta>
            <Eticheta>{MOD_LUCRU[job.modLucru]}</Eticheta>
            <Eticheta>{job.judet}</Eticheta>
          </div>
        </div>
      </Hero>

      <Section>
        <h2>Despre rol</h2>
        <p>{job.descriere}</p>
      </Section>

      {job.cerinte?.length ? (
        <Section>
          <h2>Cerințe</h2>
          <ul>
            {job.cerinte.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section faraProse>
        <h2 className="mb-4 text-xl font-bold tracking-[-0.02em] text-stone-900 sm:text-2xl">Aplică</h2>
        {/*
          Telefonul primul, si nu din intamplare. In HoReCa, retail, constructii
          sau transport nimeni nu trimite CV — se suna. Pe telefon, `tel:` e o
          singura apasare; pe desktop, numarul ramane vizibil si copiabil.
        */}
        {job.aplicaTelefon ? (
          <a
            href={`tel:${job.aplicaTelefon.replace(/[^\d+]/g, "")}`}
            className="inline-flex min-h-11 items-center rounded bg-stone-900 px-4 text-base font-semibold tracking-[-0.01em] text-white"
          >
            Sună la {job.aplicaTelefon}
          </a>
        ) : null}

        {job.aplicaUrl ? (
          <a
            href={job.aplicaUrl}
            rel="nofollow noopener"
            target="_blank"
            className={`inline-flex min-h-11 items-center rounded px-4 text-sm font-medium ${
              job.aplicaTelefon
                ? "ml-2 border border-stone-300 bg-surface text-stone-900"
                : "bg-stone-900 text-white"
            }`}
          >
            Aplică pe site-ul companiei
          </a>
        ) : null}

        {job.aplicaEmail ? (
          <a
            href={`mailto:${job.aplicaEmail}?subject=${encodeURIComponent(job.titlu)}`}
            className={`inline-flex min-h-11 items-center rounded px-4 text-sm font-medium ${
              job.aplicaTelefon || job.aplicaUrl
                ? "ml-2 border border-stone-300 bg-surface text-stone-900"
                : "bg-stone-900 text-white"
            }`}
          >
            Scrie pe email
          </a>
        ) : null}

        {!job.aplicaTelefon && !job.aplicaUrl && !job.aplicaEmail ? (
          <p className="text-stone-600">Anunțul nu are o modalitate de contact.</p>
        ) : null}
        <p className="mt-3 text-sm text-stone-600">
          Publicat pe {dataRo(job.publicatLa)} — {varstaText(job)}. Expiră automat pe{" "}
          {dataRo(job.expiraLa)}, peste {zilePanaLaExpirare(job)} zile.
        </p>
        {esteVechi(job) ? (
          <p className="mt-2 rounded border border-stone-500 bg-surface p-3 text-sm font-medium text-stone-900">
            Anunțul are peste {ZILE_PANA_LA_AVERTISMENT} de zile. Confirmă cu angajatorul că postul e încă
            deschis înainte să pregătești dosarul.
          </p>
        ) : null}
        <div className="mt-4 border-t border-stone-200 pt-4">
          <RaporteazaAnunt slug={job.slug} />
        </div>
      </Section>

      {meserie ? (
        <Section>
          <h2>Contextul salarial</h2>
          <p className="text-stone-700">
            Vezi ce se câștigă în general pe această meserie, cu mediile INS, pe pagina{" "}
            <Link href={`/salarii/${meserie.slug}`} className="underline">
              salariu {meserie.de}
            </Link>
            . Cifra de acolo este media sectorului, nu oferta acestui angajator.
          </p>
        </Section>
      ) : null}

      <NotaSursa>
        Salariul brut este cel declarat de angajator. Netul este calculat de noi, pentru normă întreagă și
        funcția de bază, fără persoane în întreținere. Nu verificăm veridicitatea ofertei.
      </NotaSursa>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSigur(jobPostingSchema(job, url)) }}
      />
    </>
  );
}
