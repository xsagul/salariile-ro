// Gestionarea anunțului din linkul primit pe email. Nu se indexează: fără token, pagina e goală.
import type { Metadata } from "next";
import { H1, SPATIU_JOS, SPATIU_SUS } from "@/app/components/ui";
import GestioneazaAnunt from "@/app/components/anunturi/GestioneazaAnunt";

export const metadata: Metadata = {
  title: { absolute: "Anunțul tău | Salariile" },
  description: "Publică, modifică, prelungește sau șterge anunțul de angajare din linkul primit pe email.",
  alternates: { canonical: "https://salariile.ro/adauga-anunt-angajare/gestioneaza" },
  robots: { index: false, follow: false },
};

export default function Gestioneaza() {
  return (
    <div className="bg-canvas">
      <div className={`mx-auto max-w-3xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>
        <H1>Anunțul tău</H1>
        <div className="mt-6 rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6">
          <GestioneazaAnunt />
        </div>
      </div>
    </div>
  );
}
