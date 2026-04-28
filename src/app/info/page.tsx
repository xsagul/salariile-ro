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
    <div
      className="container"
      style={{
        padding: "60px 20px",
        maxWidth: "800px",
        margin: "0 auto",
        minHeight: "70vh",
        lineHeight: "1.8",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1
          style={{
            color: "#1a6b3c",
            fontSize: "2.5rem",
            marginBottom: "20px",
          }}
        >
          Centru de Informații Salariale 2026
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#444" }}>
          Resurse actualizate privind legislația muncii și fiscalitatea din
          România.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gap: "30px",
          background: "#fff",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid #e5e3dd",
        }}
      >
        <section>
          <h2 style={{ color: "#1a6b3c", fontSize: "1.4rem" }}>
            Actualizări Salariu Minim și Mediu
          </h2>
          <p>
            Monitorizăm implementarea Directivei UE privind salariul minim
            european. Pentru anul <strong>2026</strong>, valorile de referință
            sunt în curs de stabilire, pragul estimat fiind de{" "}
            <strong>4.325 lei brut</strong>. Secțiunea va cuprinde istoricul
            evoluției și impactul asupra costurilor salariale.
          </p>
        </section>

        <section>
          <h2 style={{ color: "#1a6b3c", fontSize: "1.4rem" }}>
            Calculatoare Specializate (PFA & Concedii)
          </h2>
          <p>
            Dezvoltăm module noi pentru calculul impozitării veniturilor din
            activități independente (<strong>PFA 2026</strong>) și simulatoare
            pentru <strong>concedii medicale</strong> sau de odihnă. Acestea
            vor reflecta ultimele cote CAS și CASS.
          </p>
        </section>

        <section>
          <h2 style={{ color: "#1a6b3c", fontSize: "1.4rem" }}>
            Documentație Legală și Transparență
          </h2>
          <p>
            Lucrăm la finalizarea paginilor de{" "}
            <strong>Termeni și Condiții</strong> și{" "}
            <strong>Politică de Confidențialitate (GDPR)</strong>. Salariile.ro
            se angajează să ofere transparență totală în modul în care datele
            introduse în calculator sunt procesate (exclusiv local, fără
            stocare).
          </p>
        </section>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            paddingTop: "20px",
            borderTop: "1px solid #eee",
          }}
        >
          <p style={{ marginBottom: "20px", fontWeight: "500" }}>
            Ai nevoie de un calcul rapid acum?
          </p>
          <Link
            href="/"
            style={{
              background: "#1a6b3c",
              color: "white",
              padding: "14px 28px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-block",
              transition: "opacity 0.2s",
            }}
          >
            Mergi la Calculatorul Principal Net/Brut
          </Link>
        </div>
      </div>
    </div>
  );
}
