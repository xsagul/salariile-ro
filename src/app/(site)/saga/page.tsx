import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { Section, Breadcrumb, CardCompanion, Repere, PaginiConexe, Faq, TITLU_PAGINA, SPATIU_JOS, SPATIU_SUS } from "@/app/components/ui";

const PATH = "/saga";
const ACTUALIZAT = PAGE_LAST_MODIFIED[PATH].toLocaleDateString("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const metadata: Metadata = {
  title: { absolute: "SAGA Web și SAGA C: salarii, contabilitate | Salariile" },
  description:
    "SAGA C și SAGA WEB în 2026: contabilitate, salarizare, D112, diferența între licența Freeware și cea plătită și comparație cu SmartBill.",
  alternates: { canonical: "https://salariile.ro/saga" },
  openGraph: ogPage({
    title: "SAGA Web și SAGA C: salarii și contabilitate",
    description:
      "Ce oferă SAGA C, SAGA P.S. și SAGA WEB pentru contabilitate, salarizare și D112.",
    path: PATH,
  }),
  twitter: twPage({
    title: "SAGA Web și SAGA C: salarii și contabilitate",
    description:
      "Ce oferă SAGA C, SAGA P.S. și SAGA WEB pentru contabilitate, salarizare și D112.",
  }),
};

const FAQ = [
  {
    q: "Care este diferența dintre SAGA C, SAGA P.S. și SAGA WEB?",
    a: "SAGA C este aplicația desktop Windows pentru contabilitate în partidă dublă, stocuri și salarii. SAGA P.S. acoperă evidența în partidă simplă (PFA, profesii liberale). SAGA WEB este versiunea online, accesată direct din browser.",
  },
  {
    q: "SAGA poate calcula salarii și genera Declarația 112?",
    a: "Da. Programul include configurarea parametrilor salariali, evidența salariaților, concediile medicale, statele de salarii, fluturașii și generarea D112.",
  },
  {
    q: "SAGA C este gratuit?",
    a: "Există o licență Freeware pentru SAGA C și SAGA P.S., utilizabilă pe termen nedeterminat, dar fără actualizări de versiune, suport tehnic și mentenanță. Pentru actualizările legislative (salariu minim, D112, REGES) este necesară licența plătită.",
  },
  {
    q: "SAGA sau SmartBill Conta pentru salarii?",
    a: "Ambele gestionează salarii și D112. SAGA C lucrează local pe Windows, SAGA WEB în browser, iar SmartBill Conta este un serviciu cloud pe abonament per CIF.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "SAGA", item: "https://salariile.ro/saga" },
      ],
    },
    {
      "@type": "Article",
      headline: "SAGA 2026: program pentru salarii și contabilitate",
      description:
        "Ghid despre SAGA C și SAGA WEB: salarizare, D112, licențiere și comparație cu SmartBill.",
      author: personSchema,
      publisher: { "@type": "Organization", name: "Salariile", url: "https://salariile.ro" },
      mainEntityOfPage: "https://salariile.ro/saga",
      datePublished: "2026-09-22",
      dateModified: PAGE_LAST_MODIFIED[PATH].toISOString().slice(0, 10),
      inLanguage: "ro-RO",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function SagaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-canvas">
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>
          <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "SAGA" }]} />
          <div className="md:grid md:grid-cols-5 md:items-center md:gap-8 lg:gap-10">
            <div className="md:col-span-3">
              <h1 className={`max-w-xl ${TITLU_PAGINA}`}>
                SAGA C și SAGA WEB: salarii, contabilitate și licențe
              </h1>
              <p className="mt-4 text-xs text-stone-600 [&_a]:font-medium [&_a]:text-stone-700 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-900">
                Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat {ACTUALIZAT}
              </p>
              <p className="mt-5 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 [&_strong]:font-semibold [&_strong]:text-stone-900">
                <strong>SAGA C</strong> este aplicația desktop pe Windows pentru contabilitate în partidă dublă, gestiune și salarii. Pentru evidență în partidă simplă există <strong>SAGA P.S.</strong>, iar pentru lucru direct din browser există <strong>SAGA WEB</strong>.
              </p>
            </div>
            <div className="mt-7 md:col-span-2 md:mt-0">
              <Image
                src="/hero-saga.webp"
                alt="Ilustrație cu o contabilă care organizează documente lângă un calculator de birou"
                width={1200}
                height={900}
                priority
                sizes="(max-width: 768px) 100vw, 480px"
                className="w-full rounded-md"
              />
            </div>
          </div>
        </div>
      </section>

      <Section
        companion={
          <CardCompanion titlu="Salarizare în SAGA">
            <Repere
              randuri={[
                ["SAGA C", "Desktop Windows"],
                ["SAGA WEB", "Acces din browser"],
                ["Declarații", "D112, REGES, state"],
                ["Freeware", "Fără actualizări și suport"],
              ]}
            />
          </CardCompanion>
        }
      >
        <h2>Salarizare, D112 și actualizări legislative</h2>
        <p>
          SAGA include module dedicate pentru configurarea parametrilor salariali, evidența salariaților, concedii medicale, diurne, state de salarii și generarea Declarației 112. Manualul tratează separat angajații standard, contractele part-time și categoriile cu scutiri.
        </p>
        <p>
          În 2026, jurnalul oficial SAGA C consemnează actualizări pentru salariul minim din 1 iulie, concediile medicale, REGES și structura D112. Pentru un calcul punctual brut-net fără program contabil poți folosi direct{" "}
          <Link href="/">calculatorul de salariu net</Link>.
        </p>
        <p className="source-note">
          Surse:{" "}
          <a href="https://manual.sagasoft.ro/sagac/glosar-14-kw-48-letter-C.html" rel="noopener noreferrer">
            Manual SAGA C: Configurare salarii
          </a>
          {" · "}
          <a href="https://manual.sagasoft.ro/sagac/topic-25-salariati.html" rel="noopener noreferrer">
            Salariați
          </a>
          {" · "}
          <a href="https://www.sagasoft.ro/actualizari.php?program=SAGA+C" rel="noopener noreferrer">
            Actualizări SAGA C
          </a>.
        </p>
      </Section>

      <Section>
        <h2>Licența Freeware vs licența plătită</h2>
        <p>
          SAGA Software oferă o <strong>licență Freeware</strong> pentru SAGA C și SAGA P.S., fără limitare de timp cât timp furnizorul menține această variantă. Limita practică este că varianta Freeware <strong>nu include actualizările programului, suportul tehnic și mentenanța</strong>. Cum regulile fiscale și formularele D112 se modifică frecvent, pentru salarizare curentă este necesară licența plătită.
        </p>
        <p>
          Prețul licenței se calculează direct în formularul oficial SAGA în funcție de pachet și de numărul de firme sau accesări.
        </p>
        <p className="source-note">
          Surse:{" "}
          <a href="https://www.sagasoft.ro/conditii-licenta.php" rel="noopener noreferrer">Condiții de licență SAGA</a>
          {" · "}
          <a href="https://www.sagasoft.ro/formular-licente.php?tip=juridica" rel="noopener noreferrer">Formular oficial de achiziție</a>.
        </p>
      </Section>

      <Section>
        <h2>SAGA vs SmartBill Conta</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aspect</th>
                <th>SAGA</th>
                <th>SmartBill Conta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Mod de lucru</th>
                <td>SAGA C desktop; SAGA WEB în browser</td>
                <td>Cloud / browser</td>
              </tr>
              <tr>
                <th>Salarizare și D112</th>
                <td>Da</td>
                <td>Da</td>
              </tr>
              <tr>
                <th>Variantă gratuită</th>
                <td>Freeware desktop, fără actualizări și suport</td>
                <td>Plan Free în Conta</td>
              </tr>
              <tr>
                <th>Structură de preț</th>
                <td>Calculat în formularul de licențiere</td>
                <td>Planuri publicate per CIF/lună</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Pentru detalii despre planurile și modulele SmartBill, vezi pagina separată{" "}
          <Link href="/smartbill">SmartBill 2026: prețuri și Conta</Link>.
        </p>
        <p className="source-note">
          Salariile.ro este un site independent și nu este afiliat cu SAGA Software sau SmartBill.
        </p>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/smartbill", label: "SmartBill Conta", descriere: "Prețuri, salarizare, D112 și diferențe față de SAGA." },
          { href: "/", label: "Calculator salariu net", descriere: "Transformă brutul în net și vezi taxele." },
          { href: "/fluturas-salariu", label: "Fluturaș de salariu", descriere: "Înțelege statul de plată și reținerile." },
          { href: "/calculator-pfa", label: "Calculator PFA", descriere: "Calculează taxele pentru activitate independentă." },
        ]}
      />
    </>
  );
}
