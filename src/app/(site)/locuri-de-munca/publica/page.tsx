// src/app/(site)/locuri-de-munca/publica/page.tsx
// Pagina de publicare pentru angajatori.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Faq, H1, Lead, Section } from "@/app/components/ui";
import FormularAnunt from "@/app/components/FormularAnunt";
import { ogPage, twPage } from "@/lib/seo";

const DESCRIERE =
  "Publică gratuit un anunț de angajare. Singura condiție: salariul afișat. Vezi netul pe care îl va vedea candidatul, înainte să publici.";

export const metadata: Metadata = {
  title: { absolute: "Publică un anunț de angajare | Salariile.ro" },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/locuri-de-munca/publica" },
  openGraph: ogPage({ title: "Publică un anunț de angajare", description: DESCRIERE, path: "/locuri-de-munca/publica" }),
  twitter: twPage({ title: "Publică un anunț de angajare", description: DESCRIERE }),
};

export default function Publica() {
  return (
    <>
      <Breadcrumb
        items={[
          { href: "/", label: "Acasă" },
          { href: "/joburi", label: "Locuri de muncă" },
          { label: "Publică un anunț" },
        ]}
      />

      <H1>Publică un anunț de angajare</H1>
      <Lead>
        Gratuit, fără cont. O singură condiție: treci salariul. Un interval este suficient.
      </Lead>

      <Section>
        <h2>Anunțul</h2>
        <FormularAnunt />
      </Section>

      <Section>
        <h2>De ce cerem salariul</h2>
        <p>
          Pe site-urile mari de recrutare, aproximativ un anunț din patru are salariul scris. Restul spun
          „salariu motivant” sau „negociabil”, iar candidatul află cifra abia la interviu — uneori după două
          runde.
        </p>
        <p>
          Anunțurile cu salariu afișat primesc aplicanți care știu deja ce urmează. Filtrează singure, iar
          interviurile irosite dispar. Ăsta e schimbul: publici cifra, primești candidați care au acceptat-o
          dinainte.
        </p>
        <p>
          Proiectul de lege privind transparența salarială, aflat în Parlament, obligă angajatorul să comunice
          nivelul de salarizare candidatului în procesul de recrutare. Nu obligă la publicarea în anunț — deci
          regula de aici este a noastră, nu a legii. Vezi{" "}
          <Link href="/noutati/transparenta-salariala-2026" className="underline">
            ce prevede proiectul
          </Link>
          .
        </p>
      </Section>

      <Faq
        items={[
          {
            q: "Cât costă?",
            a: "Nimic. Nu există abonament, cont sau taxă de listare.",
          },
          {
            q: "Pot publica fără să trec salariul?",
            a: "Nu. Butonul rămâne inactiv fără sumă. Este singura regulă a hubului și motivul pentru care candidații îl folosesc.",
          },
          {
            q: "Ce net va vedea candidatul?",
            a: "Netul pentru normă întreagă, funcție de bază, fără persoane în întreținere — calculat cu aceleași reguli fiscale ca restul site-ului. Îl vezi în formular, în timp ce completezi.",
          },
          {
            q: "Cât durează până apare anunțul?",
            a: "Îl publicăm manual, de obicei în aceeași zi. Verificăm doar că are salariu și că postul există.",
          },
          {
            q: "Cât stă anunțul pe site?",
            a: "30 de zile, apoi expiră automat. Cu două săptămâni înainte îți scriem să confirmi că postul e încă deschis. Dacă nu răspunzi, anunțul iese — preferăm o listă mai scurtă decât una cu posturi deja ocupate.",
          },
        ]}
      />
    </>
  );
}
