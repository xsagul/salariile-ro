// Raportarea unui anunț de angajare. Nu se indexează: fără id, pagina n-are conținut.
import type { Metadata } from "next";
import { H1, Lead, SPATIU_JOS, SPATIU_SUS } from "@/app/components/ui";
import RaporteazaAnunt from "@/app/components/anunturi/RaporteazaAnunt";

export const metadata: Metadata = {
  title: { absolute: "Raportează un anunț | Salariile" },
  description: "Raportează un anunț de angajare care cere bani, discriminează sau minte despre salariu.",
  alternates: { canonical: "https://salariile.ro/locuri-de-munca/raporteaza" },
  robots: { index: false, follow: true },
};

export default function Raporteaza() {
  return (
    <div className="bg-canvas">
      <div className={`mx-auto max-w-3xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>
        <H1>Raportează un anunț</H1>
        <Lead>Verificăm fiecare raportare. La trei raportări, anunțul se suspendă automat până îl verificăm.</Lead>
        <div className="mt-6 rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6">
          <RaporteazaAnunt />
        </div>
      </div>
    </div>
  );
}
