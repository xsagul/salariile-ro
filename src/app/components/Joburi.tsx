// src/app/components/Joburi.tsx
// Bucatile vizuale ale hubului de joburi. Server Components — zero JS la client.
//
// Regula de afisare, care e si pozitia editoriala: brutul si netul stau
// impreuna, iar netul e cel ingrosat. Pe orice alt site de recrutare vezi doar
// brutul si trebuie sa deschizi un calculator ca sa stii ce iei in mana. Aici
// nu exista pasul ala.

import Link from "next/link";
import { lei } from "@/app/components/Salarii";
import { MOD_LUCRU, TIP_CONTRACT, esteVechi, salariuCalculat, varstaText, type Job } from "@/lib/joburi";

/** „4.800 – 6.200 lei" sau „4.800 lei" cand intervalul e un punct. */
export function intervalLei(min: number, max: number): string {
  return min === max ? `${lei(min)} lei` : `${lei(min)} – ${lei(max)} lei`;
}

export function Eticheta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-stone-300 bg-surface px-2 py-0.5 text-xs text-stone-600">
      {children}
    </span>
  );
}

/**
 * Salariul unui anunt. `marime="mare"` pe pagina anuntului, „mic" in lista.
 * Netul e raspunsul; brutul ramane vizibil pentru ca el e ce scrie in contract.
 */
export function SalariuJob({ job, marime = "mic" }: { job: Job; marime?: "mic" | "mare" }) {
  const s = salariuCalculat(job.salariu);
  if (!s) return null;
  const mare = marime === "mare";
  return (
    <div>
      <p className={mare ? "text-2xl font-bold text-stone-900" : "text-base font-semibold text-stone-900"}>
        {intervalLei(s.netMin, s.netMax)}
        <span className={mare ? "ml-2 text-base font-normal text-stone-600" : "ml-1.5 text-xs font-normal text-stone-600"}>
          net în mână
        </span>
      </p>
      <p className={mare ? "mt-1 text-sm text-stone-600" : "text-xs text-stone-600"}>
        {intervalLei(s.brutMin, s.brutMax)} brut
      </p>
    </div>
  );
}

/** Un rand din lista de anunturi. */
export function CardJob({ job }: { job: Job }) {
  return (
    <li>
      <Link
        href={`/joburi/${job.slug}`}
        className="block rounded-md border border-stone-200 bg-surface p-4 transition-colors hover:bg-canvas"
      >
        <div className="sm:flex sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-stone-900">{job.titlu}</h3>
            <p className="mt-0.5 text-sm text-stone-600">
              {job.companie} · {job.oras ?? job.judet}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Eticheta>{TIP_CONTRACT[job.tipContract]}</Eticheta>
              <Eticheta>{MOD_LUCRU[job.modLucru]}</Eticheta>
              <span className={esteVechi(job) ? "text-xs font-medium text-stone-900" : "text-xs text-stone-600"}>
                {varstaText(job)}
              </span>
            </div>
          </div>
          <div className="mt-3 shrink-0 sm:mt-0 sm:text-right">
            <SalariuJob job={job} />
          </div>
        </div>
      </Link>
    </li>
  );
}

export function ListaJoburi({ joburi }: { joburi: Job[] }) {
  if (!joburi.length) {
    return (
      <p className="rounded-md border border-stone-200 bg-surface p-4 text-sm text-stone-600">
        Nu există anunțuri active care să corespundă.
      </p>
    );
  }
  return (
    <ul className="list-none space-y-3 pl-0">
      {joburi.map((j) => (
        <CardJob key={j.slug} job={j} />
      ))}
    </ul>
  );
}
