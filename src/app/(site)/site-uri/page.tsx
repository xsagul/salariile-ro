// app/site-uri/page.tsx
// Server Component. Oferta de site-uri, cerută de proprietar pe 19 octombrie 2026.
// Noindex și în afara sitemap-ului: subiectul nu e salariile, iar pagina e pentru
// vizitatorii care o găsesc din subsol, nu pentru căutările din Google.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Hero, Section, Breadcrumb, H1, Lead, CardCompanion, LISTA_CARD } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Îți fac site-ul",
  description:
    "Site-uri rapide pentru firme și profesioniști, făcute de autorul salariile.ro: pagini de prezentare, calculatoare și instrumente, gata pentru Google.",
  alternates: { canonical: "https://salariile.ro/site-uri" },
  robots: { index: false, follow: true },
};

const MAILTO = "mailto:contact@salariile.ro?subject=Site%20nou";

export default function SiteUriPage() {
  return (
    <>
      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Îți fac site-ul" }]} />
        <H1>Îți fac site-ul</H1>
        <Lead>
          Salariile.ro e construit și întreținut de un singur om. Fac și pentru alții site-uri la fel: rapide, clare pe
          telefon și pregătite să fie găsite în Google.
        </Lead>
      </Hero>

      <Section
        noTopBorder
        companion={
          <CardCompanion titlu="Cum lucrăm">
            <ul className={`${LISTA_CARD} text-stone-600`}>
              <li>Îmi scrii ce faci și ce vrei să afle clienții tăi.</li>
              <li>Îți trimit o propunere și un preț, înainte de orice lucru.</li>
              <li>Site-ul e al tău: domeniul, textele și codul.</li>
            </ul>
          </CardCompanion>
        }
      >
        <h2>Ce pot face</h2>
        <ul>
          <li>
            <strong>Site de prezentare</strong> pentru o firmă, un PFA sau un cabinet: ce oferi, prețuri, program,
            contact.
          </li>
          <li>
            <strong>Un calculator sau un instrument</strong> pe site-ul tău, ca{" "}
            <Link href="/">calculatorul de salariu</Link> de aici.
          </li>
          <li>
            <strong>Un site existent făcut mai rapid</strong> și mai ușor de găsit în Google.
          </li>
        </ul>

        <h2>Scrie-mi</h2>
        <p className="text-base">
          <strong><a href={MAILTO}>contact@salariile.ro</a></strong>
        </p>
        <p>Spune-mi pe scurt ce faci și ce site ai acum, dacă ai unul. Prețul se stabilește după ce discutăm.</p>
      </Section>
    </>
  );
}
