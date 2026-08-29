"use client";

// src/app/components/FiltruDistanta.tsx
//
// Filtrul de rază. Singura funcție pe care OLX o are și eJobs nu — și e cea
// care răspunde la întrebarea reală a candidatului: „ce e aproape de casă".
// Pragurile (5, 10, 15, 30, 50, 100 km) sunt cele de la OLX, deliberat: sunt
// deja învățate de utilizatori, iar reinventarea lor n-ar aduce nimic.
//
// Filtrarea se face în browser, nu pe server, ca pagina să rămână statică și
// indexabilă. Distanțele sunt calculate deja pe server și trimise cu fiecare
// anunț, deci aici nu se recalculează nimic.

import Link from "next/link";
import { useState } from "react";
import { CardJob } from "@/app/components/Joburi";
import { RAZE_KM } from "@/lib/localitati";
import type { Job } from "@/lib/joburi";

export type JobCuDistanta = { job: Job; km: number | null; localitate: string };

export default function FiltruDistanta({
  intrari,
  numeOras,
}: {
  intrari: JobCuDistanta[];
  numeOras: string;
}) {
  const [raza, setRaza] = useState<number>(0);

  const vizibile = intrari.filter((x) => x.km === null || x.km <= raza + 0.5);
  const disponibile = RAZE_KM.filter((km) => km === 0 || intrari.some((x) => x.km !== null && x.km > 0.5 && x.km <= km + 0.5));

  return (
    <div>
      {disponibile.length > 1 && (
        <fieldset className="mb-5">
          <legend className="mb-2 text-xs font-medium text-stone-500">Distanța față de {numeOras}</legend>
          <div className="flex flex-wrap gap-1">
            {disponibile.map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRaza(km)}
                aria-pressed={raza === km}
                className={`min-h-11 rounded px-3 text-sm transition-colors ${
                  raza === km
                    ? "bg-stone-900 font-medium text-white"
                    : "border border-stone-300 bg-surface text-stone-900 hover:bg-canvas"
                }`}
              >
                {km === 0 ? "În oraș" : `+${km} km`}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {vizibile.length === 0 ? (
        <p className="rounded-md border border-stone-200 bg-surface p-4 text-sm text-stone-600">
          Niciun anunț activ în {numeOras}. Încearcă o rază mai mare sau vezi{" "}
          <Link href="/locuri-de-munca" className="font-medium text-stone-900 underline underline-offset-2">
            toate anunțurile
          </Link>
          .
        </p>
      ) : (
        <ul className="list-none space-y-3 pl-0">
          {vizibile.map(({ job, km, localitate }) => (
            <li key={job.slug} className="relative">
              <CardJob job={job} />
              {km !== null && km > 0.5 ? (
                <span className="mt-1 block text-xs text-stone-600">
                  {localitate} — la {Math.round(km)} km de {numeOras}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-stone-600">
        {vizibile.length} din {intrari.length}{" "}
        {intrari.length === 1 ? "anunț" : "anunțuri"}. Anunțurile remote apar la orice rază, pentru că nu au
        distanță.
      </p>
    </div>
  );
}
