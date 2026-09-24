// app/contact/page.tsx
// Server Component. Pagina de contact — onest minimal.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, CardCompanion } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Contact: raportează erori sau sugestii",
  description:
    "Trimite corecturi, erori de calcul sau sugestii pentru salariile.ro. Verific formulele, sursele legislative și paginile unde apar date fiscale.",
  alternates: { canonical: "https://salariile.ro/contact" },
  openGraph: ogPage({
    title: "Contact: raportează erori sau sugestii",
    description:
      "Scrie-mi pentru a raporta erori de calcul, a sugera funcționalități noi sau pentru cereri privind datele personale.",
    path: "/contact",
  }),
  twitter: twPage({
    title: "Contact: raportează erori sau sugestii",
    description:
      "Scrie-mi pentru a raporta erori de calcul, a sugera funcționalități noi sau cereri privind datele personale.",
  }),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Contact", item: "https://salariile.ro/contact" },
      ],
    },
    {
      "@type": "ContactPage",
      name: "Contact Salariile",
      description:
        "Pagina de contact pentru salariile.ro: email, subiecte potrivite și limitări declarate.",
      url: "https://salariile.ro/contact",
      inLanguage: "ro-RO",
      mainEntity: {
        ...personSchema,
        email: "contact@salariile.ro",
      },
    },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Contact" }]} />
        <H1>Contact</H1>
        <Lead>
          Salariile.ro este un proiect personal întreținut de un singur om. Cel mai bun mod de contact este prin email.
        </Lead>
      </Hero>

      <Section
        noTopBorder
        companion={
          <CardCompanion titlu="Ce nu pot face">
            <ul className="flex flex-col gap-3 text-sm leading-normal text-stone-600">
              <li>
                <strong className="font-semibold text-stone-900">Consultanță fiscală.</strong> Nu sunt contabil sau
                expert fiscal. Pentru sporuri, beneficii sau venituri cumulate, Camera Consultanților Fiscali și Corpul
                Experților Contabili au liste publice de specialiști.
              </li>
              <li>
                <strong className="font-semibold text-stone-900">Dispute cu angajatorul.</strong> Dacă salariul plătit
                nu se potrivește cu legea, mergi la Inspectoratul Teritorial de Muncă sau la un avocat de dreptul muncii.
              </li>
              <li>
                <strong className="font-semibold text-stone-900">Verificarea unui fluturaș real.</strong> Pot explica
                o formulă, dar fără toate elementele lunii nu pot confirma un fluturaș anume.
              </li>
            </ul>
          </CardCompanion>
        }
      >
        <h2>Scrie-mi</h2>
        <p className="text-lg">
          <strong><a href="mailto:contact@salariile.ro">contact@salariile.ro</a></strong>
        </p>
        <p>
          Răspund la toate mesajele, de obicei în câteva ore, uneori în câteva zile: site-ul e un proiect personal,
          întreținut în timpul liber.
        </p>
        <ul>
          <li>
            <strong>O eroare de calcul.</strong> Trimite brutul folosit, cifra de pe site, cifra corectă și sursa ta.
            Erorile concrete au prioritate și de regulă le corectez în aceeași zi.
          </li>
          <li>
            <strong>O idee de calculator sau de pagină.</strong> Un calcul care îți lipsește, o meserie pe care n-o
            găsești. Sugestiile mă ajută să aleg ce fac mai întâi.
          </li>
          <li>
            <strong>O întrebare despre cum calculăm.</strong> Cazurile principale sunt în{" "}
            <Link href="/metodologie">metodologie</Link>; pentru restul, întreabă.
          </li>
          <li>
            <strong>Datele tale personale.</strong> Acces, ștergere sau opoziție, după{" "}
            <Link href="/politica-confidentialitate">politica de confidențialitate</Link>. Răspund în cel mult 30 de zile.
          </li>
          <li>
            <strong>Preluarea conținutului.</strong> Dacă vrei să folosești pasaje întregi într-o publicație sau un
            material educațional, scrie-mi înainte.
          </li>
        </ul>
      </Section>
    </>
  );
}
