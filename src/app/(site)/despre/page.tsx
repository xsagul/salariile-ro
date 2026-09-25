// app/despre/page.tsx
// Server Component. Pagina "Despre" pentru E-E-A-T — transparența autorului.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow, CardCompanion, LISTA_CARD } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Despre proiect: cine întreține site-ul",
  description:
    "salariile.ro este un proiect independent despre salarii și fiscalitate în România: calculator brut-net, surse legislative și actualizări verificabile.",
  alternates: { canonical: "https://salariile.ro/despre" },
  openGraph: ogPage({
    title: "Despre proiect: cine întreține site-ul",
    description:
      "Salariile.ro e un proiect independent de transparență fiscală pentru România. Cine îl întreține, de ce a apărut și cum se mențin calculele actualizate.",
    path: "/despre",
  }),
  twitter: twPage({
    title: "Despre proiect: cine întreține site-ul",
    description:
      "Proiect independent de transparență fiscală pentru România. Cine îl întreține și de ce a apărut.",
  }),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Despre", item: "https://salariile.ro/despre" },
      ],
    },
    {
      "@type": "AboutPage",
      name: "Despre salariile.ro",
      description:
        "Pagina Despre a salariile.ro: cine întreține proiectul, motivația, metodologia de menținere a acurateței.",
      url: "https://salariile.ro/despre",
      inLanguage: "ro-RO",
      mainEntity: personSchema,
      isPartOf: {
        "@type": "WebSite",
        name: "Salariile",
        url: "https://salariile.ro",
      },
    },
  ],
};

export default function DesprePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Despre" }]} />
        <H1>Despre acest proiect</H1>
        <Lead>
          Salariile.ro e un proiect independent de transparență fiscală pentru România, întreținut individual. Aici găsești cine îl menține și pe ce surse se bazează fiecare calcul.
        </Lead>
        <Eyebrow>PROIECT INDEPENDENT · LANSAT ÎN APRILIE 2026</Eyebrow>
      </Hero>

      <Section
        noTopBorder
        companion={
          <CardCompanion titlu="Ai găsit o greșeală?">
            <p className="text-sm leading-normal text-stone-600">
              O cifră greșită, o lege depășită sau un calculator care îți lipsește: scrie-mi la adresa de pe pagina de{" "}
              <Link href="/contact" className="LINK">contact</Link>. Răspund la toate mesajele, uneori în câteva zile.
            </p>
            <p className="mt-3 text-sm leading-normal text-stone-600">
              O eroare concretă de calcul are prioritate: de regulă o corectez în aceeași zi.
            </p>
          </CardCompanion>
        }
      >
        <h2>Cine întreține site-ul</h2>
        <p>
          Mă numesc Știuriuc Sorin-Marian și sunt dezvoltator full-stack. Construiesc și mențin singur salariile.ro ca
          proiect personal, fără echipă, agenție sau firmă în spate.
        </p>
        <p>
          Nu sunt contabil sau consultant fiscal. Sunt programator care a citit Codul Fiscal și a implementat formulele
          publice de calcul al salariului net. Calculele sunt corecte pentru cazul standard, dar la sporuri specifice,
          beneficii nesalariale sau contracte cu clauze speciale, un contabil rămâne referința. Ce acoperă
          calculatorul și ce nu, e scris în <Link href="/metodologie">metodologie</Link>.
        </p>
        <p>
          Costurile sunt mici, domeniul și găzduirea pe planul gratuit Cloudflare, și le acopăr personal. Site-ul nu
          folosește programe de afiliere și nu vinde date despre utilizatori. Nu există formulare, conturi de utilizator
          sau newsletter. Ce date tehnice se folosesc pentru statisticile de trafic, și doar cu acordul tău, e scris în{" "}
          <Link href="/politica-confidentialitate">politica de confidențialitate</Link>.
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Jurnal de corecții și actualizări">
                <ul className={`${LISTA_CARD} text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-stone-900`}>
                  <li>
                    <strong>24 septembrie 2026</strong> — Textele site-ului rescrise pe înțelesul tuturor: sub fiecare calculator stă acum formula, iar cifrele apar doar unde răspund la o întrebare.
                  </li>
                  <li>
                    <strong>7 septembrie 2026</strong> — <Link href="/metodologie#corectii">Corecțiile datelor pe meserii</Link>.
                  </li>
                  <li>
                    <strong>5 septembrie 2026</strong> — Etichete verificate pe toate calculatoarele și o distincție mai clară între mediile INS pe domenii și salariile individuale.
                  </li>
                  <li>
                    <strong>28 august 2026</strong> — Actualizare a metadatelor și corelare a formulelor fiscale pentru semestrul II 2026; revizie a calculatoarelor specializate (învățământ, part-time, PFA).
                  </li>
                  <li>
                    <strong>4 august 2026</strong> — Aliniere la OUG nr. 89/2025 și publicarea analizei dedicate facilității de 300 lei / 200 lei pentru salariul minim brut garantat în plată de 4.325 lei.
                  </li>
                  <li>
                    <strong>1 iulie 2026</strong> — Intrarea în vigoare a salariului minim brut garantat în plată de 4.325 lei (HG nr. 146/2026 și OUG nr. 89/2025) și ajustarea automată a grilelor de deduceri personale.
                  </li>
                </ul>
          </CardCompanion>
        }
      >
        <h2>De ce a apărut și cum rămâne corect</h2>
        <p>
          În aprilie 2026, când am început să urmăresc mai atent calculul propriului venit, am vrut să pot merge ușor
          de la o cifră la formula ei, la actul normativ și la data de la care se aplică regula.
        </p>
        <p>
          Site-ul e construit în jurul acestei idei: cine verifică un calcul trebuie să ajungă la sursa oficială și la
          articolul care contează. De aceea metodologia și legăturile spre legi fac parte din produs, nu sunt note de
          subsol.
        </p>
        <p>
          Legislația fiscală se schimbă des, uneori prin ordonanțe cu efect imediat. Urmăresc Monitorul Oficial,
          Ministerul Finanțelor, ANAF, Ministerul Muncii și INS, iar la fiecare act nou schimb formulele și paginile
          care le folosesc. Calculatorul urmează structura Declarației 112, pe care orice angajator o trimite lunar la
          ANAF: pentru un salariu standard, CAS, CASS, impozitul și CAM ies la fel ca în declarația firmei.
        </p>
      </Section>
    </>
  );
}
