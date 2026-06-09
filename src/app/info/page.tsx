// src/app/info/page.tsx
// Pagină tampon pentru funcționalități în curs de dezvoltare.
// noindex pentru a nu primi autoritate Google (e thin content placeholder).

import type { Metadata } from "next";
import Link from "next/link";
import { Hero, Section, H1, Lead } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Informații",
  description:
    "Pagină de informații despre dezvoltarea continuă a Salariile.ro.",
  robots: { index: false, follow: true },
};

export default function InfoPage() {
  return (
    <>
      <Hero>
        <H1>Centru de Informații Salariale 2026</H1>
        <Lead>
          Resurse actualizate privind legislația muncii și fiscalitatea din România.
        </Lead>
      </Hero>

      <Section>
        <h2>Actualizări Salariu Minim și Mediu</h2>
        <p>
          Monitorizăm implementarea Directivei UE privind salariul minim
          european. Pentru anul <strong>2026</strong>, valorile de referință
          sunt în curs de stabilire, pragul estimat fiind de{" "}
          <strong>4.325 lei brut</strong>. Secțiunea va cuprinde istoricul
          evoluției și impactul asupra costurilor salariale.
        </p>

        <h2>Calculatoare Specializate (PFA &amp; Concedii)</h2>
        <p>
          Dezvoltăm module noi pentru calculul impozitării veniturilor din
          activități independente (<strong>PFA 2026</strong>) și simulatoare
          pentru <strong>concedii medicale</strong> sau de odihnă. Acestea
          vor reflecta ultimele cote CAS și CASS.
        </p>

        <h2>Documentație Legală și Transparență</h2>
        <p>
          Lucrăm la finalizarea paginilor de <strong>Termeni și Condiții</strong>{" "}
          și <strong>Politică de Confidențialitate (GDPR)</strong>. Salariile.ro
          se angajează să ofere transparență totală în modul în care datele
          introduse în calculator sunt procesate (exclusiv local, fără stocare).
        </p>

        <div className="mt-8 rounded-md border border-stone-200 bg-surface p-6 shadow-soft">
          <p className="mb-4 font-medium text-stone-900">Ai nevoie de un calcul rapid acum?</p>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            Mergi la Calculatorul Principal Net/Brut
          </Link>
        </div>
      </Section>
    </>
  );
}
