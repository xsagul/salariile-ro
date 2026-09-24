// app/despre/page.tsx
// Server Component. Pagina "Despre" pentru E-E-A-T — transparența autorului.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow, PaginaCuCuprins } from "@/app/components/ui";

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

      <PaginaCuCuprins>
        <Section>
            <h2>Cine întreține site-ul</h2>
            <p>
              Mă numesc Știuriuc Sorin-Marian și sunt dezvoltator full-stack. Construiesc și mențin singur salariile.ro ca proiect personal, fără echipă, agenție sau firmă în spate.
            </p>
            <p>
              Nu sunt contabil sau consultant fiscal. Sunt programator care a citit Codul Fiscal și a implementat formulele publice de calcul al salariului net. Diferența contează: informațiile de pe acest site sunt acurate fiscal pentru cazul standard, dar pentru situații individuale complexe (sporuri specifice, beneficii nesalariale, scutiri sectoriale, contracte cu clauze speciale) calculatorul nu poate înlocui un contabil sau un expert fiscal.
            </p>
            <p>
              Acest lucru este declarat deschis pe pagina de <Link href="/termeni">termeni</Link>, iar pagina de <Link href="/metodologie">metodologie</Link> documentează exact ce formulă folosește calculatorul și ce nu acoperă.
            </p>
        </Section>

        <Section>
            <h2>De ce a apărut site-ul</h2>
            <p>
              În aprilie 2026, când am început să urmăresc mai atent calculul propriului meu venit, am vrut să pot urmări ușor drumul de la rezultatul numeric la formulă, act normativ și data de la care regula se aplică.
            </p>
            <p>
              Am construit salariile.ro în jurul acestei idei: un utilizator care verifică un calcul trebuie să poată ajunge la sursa oficială, la articolul relevant și la perioada fiscală folosită. De aceea metodologia și legăturile spre actele normative fac parte din produs, nu sunt doar note de subsol.
            </p>
        </Section>

        <Section>
            <h2>Cum se mențin calculele actualizate</h2>
            <p>
              Legislația fiscală română se modifică frecvent, uneori prin ordonanțe de urgență publicate cu efect imediat. Pentru ca site-ul să rămână relevant, monitorizez lunar:
            </p>
            <ul>
              <li>Monitorul Oficial și portalul legislativ legislatie.just.ro</li>
              <li>Comunicările Ministerului Finanțelor și ANAF</li>
              <li>Comunicările Ministerului Muncii pentru actele normative ce privesc salariul minim</li>
              <li>Publicațiile Institutului Național de Statistică pentru date macroeconomice</li>
            </ul>
            <p>
              La fiecare modificare semnificativă (de exemplu introducerea OUG 89/2025, publicarea HG 146/2026, intrarea în vigoare a Legii 44/2026 pentru salariul mediu) actualizez atât formulele calculatorului, cât și paginile editoriale aferente, și marchez în mod vizibil data ultimei actualizări.
            </p>
            <p>
              Calculatorul în sine este sincronizat cu structura Declarației 112 ANAF, declarația lunară pe care orice angajator o transmite. Sumele calculate pentru CAS, CASS, impozit și CAM corespund cu ce ar transmite efectiv angajatorul către ANAF pentru un brut standard.
            </p>
        </Section>

        <Section>
            <h2>Cum este finanțat proiectul</h2>
            <p>
              Costurile sunt mici: domeniul, plătit anual, și găzduirea, pe planul gratuit Cloudflare. Le acopăr personal. Site-ul nu folosește programe de afiliere și nu vinde date despre utilizatori.
            </p>
            <p>
              Nu există formulare, conturi de utilizator sau newsletter. Ce date tehnice se folosesc pentru statisticile de trafic, și doar cu acordul tău, e scris în <Link href="/politica-confidentialitate">politica de confidențialitate</Link>.
            </p>
        </Section>

        <Section>
            <h2>Cum poți contribui</h2>
            <p>
              Dacă observi o eroare de calcul, o referință legislativă depășită sau ai sugestii pentru calculatoare noi ori scenarii fiscale specifice, poți scrie la adresa de pe pagina de <Link href="/contact">contact</Link>. Răspund la toate mesajele primite, deși timpul de răspuns poate fi de câteva zile, fiind un proiect personal întreținut în timpul liber.
            </p>
            <p>
              Erorile concrete (de exemplu o cifră greșită într-un calcul detaliat) au prioritate maximă, le corectez de regulă în aceeași zi în care primesc raportarea.
            </p>
        </Section>

        <Section>
            <h2>Jurnal de corecții și actualizări</h2>
            <p>
              Fiecare schimbare de lege importantă și fiecare corectură de metodă e notată aici:
            </p>
            <ul>
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
        </Section>
      </PaginaCuCuprins>
    </>
  );
}
