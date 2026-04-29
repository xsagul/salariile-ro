// src/app/info/page.tsx
// Pagină tampon pentru funcționalități în curs de dezvoltare.
// noindex pentru a nu primi autoritate Google (e thin content placeholder).

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Informații",
  description:
    "Pagină de informații despre dezvoltarea continuă a Salariile.ro.",
  robots: { index: false, follow: true },
};

export default function InfoPage() {
  return (
    <div className="container info-page">
      <header>
        <h1>Centru de Informații Salariale 2026</h1>
        <p className="lead">
          Resurse actualizate privind legislația muncii și fiscalitatea din
          România.
        </p>
      </header>

      <div className="panel">
        <section>
          <h2>Actualizări Salariu Minim și Mediu</h2>
          <p>
            Monitorizăm implementarea Directivei UE privind salariul minim
            european. Pentru anul <strong>2026</strong>, valorile de referință
            sunt în curs de stabilire, pragul estimat fiind de{" "}
            <strong>4.325 lei brut</strong>. Secțiunea va cuprinde istoricul
            evoluției și impactul asupra costurilor salariale.
          </p>
        </section>

        <section>
          <h2>Calculatoare Specializate (PFA &amp; Concedii)</h2>
          <p>
            Dezvoltăm module noi pentru calculul impozitării veniturilor din
            activități independente (<strong>PFA 2026</strong>) și simulatoare
            pentru <strong>concedii medicale</strong> sau de odihnă. Acestea
            vor reflecta ultimele cote CAS și CASS.
          </p>
        </section>

        <section>
          <h2>Documentație Legală și Transparență</h2>
          <p>
            Lucrăm la finalizarea paginilor de{" "}
            <strong>Termeni și Condiții</strong> și{" "}
            <strong>Politică de Confidențialitate (GDPR)</strong>. Salariile.ro
            se angajează să ofere transparență totală în modul în care datele
            introduse în calculator sunt procesate (exclusiv local, fără
            stocare).
          </p>
        </section>

        <div className="footer-cta">
          <p>Ai nevoie de un calcul rapid acum?</p>
          <Link href="/" className="btn-primary">
            Mergi la Calculatorul Principal Net/Brut
          </Link>
        </div>
      </div>
    </div>
  );
}
