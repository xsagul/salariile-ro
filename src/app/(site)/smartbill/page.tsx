import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import {
  Hero,
  Section,
  Breadcrumb,
  H1,
  Lead,
  Eyebrow,
  CardCompanion,
  Repere,
  PaginiConexe,
  Faq,
} from "@/app/components/ui";

const PATH = "/smartbill";
const ACTUALIZAT = PAGE_LAST_MODIFIED[PATH].toLocaleDateString("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const metadata: Metadata = {
  title: { absolute: "SmartBill 2026: preț, salarizare și Conta | Salariile.ro" },
  description:
    "SmartBill în 2026: prețuri Conta, salarizare și D112, limitele planurilor și comparație cu SAGA. Date verificate în sursele oficiale SmartBill.",
  alternates: { canonical: "https://salariile.ro/smartbill" },
  openGraph: ogPage({
    title: "SmartBill 2026: preț, salarizare și Conta",
    description:
      "Prețurile SmartBill Conta, ce include salarizarea și D112 și cum se compară cu SAGA.",
    path: PATH,
  }),
  twitter: twPage({
    title: "SmartBill 2026: preț, salarizare și Conta",
    description:
      "Prețurile SmartBill Conta, ce include salarizarea și D112 și cum se compară cu SAGA.",
  }),
};

const FAQ = [
  {
    q: "SmartBill are salarizare?",
    a: "Da. Modulul SmartBill Conta include salarizare și generarea D112. În evidența salariaților se pot completa date personale, contractuale, salariul de bază, norma, sporurile, taxele și deducerile.",
  },
  {
    q: "Cât costă SmartBill Conta?",
    a: "Pentru firmele de contabilitate, pagina oficială afișează Free la 0 euro, Conta S la 2 euro + TVA/CIF/lună și Conta M la 79 euro + TVA/CIF/lună. Pentru contabilitate internă se adaugă un tarif de 25 euro/lună per cont. Prețurile și condițiile pot fi schimbate de furnizor.",
  },
  {
    q: "SmartBill Conta este același lucru cu SmartBill Facturare?",
    a: "Nu. SmartBill are produse și planuri distincte pentru facturare, gestiune, POS și contabilitate. Funcțiile de salarizare și D112 analizate aici apar în SmartBill Conta.",
  },
  {
    q: "SmartBill sau SAGA pentru salarii?",
    a: "Ambele au funcții de salarizare și D112, dar modelul de utilizare diferă. SmartBill Conta este orientat spre lucru în cloud și abonamente pe planuri; SAGA C este aplicația desktop, iar SAGA WEB oferă acces prin browser. Alegerea depinde de fluxul firmei, numărul de societăți și nevoia de lucru online.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "SmartBill", item: "https://salariile.ro/smartbill" },
      ],
    },
    {
      "@type": "Article",
      headline: "SmartBill 2026: preț, salarizare și contabilitate",
      description:
        "Ghid despre SmartBill Conta: prețuri, salarizare, D112, planuri și comparație cu SAGA.",
      author: personSchema,
      publisher: { "@type": "Organization", name: "Salariile.ro", url: "https://salariile.ro" },
      mainEntityOfPage: "https://salariile.ro/smartbill",
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

export default function SmartBillPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "SmartBill" }]} />
        <H1>SmartBill în 2026: preț, salarizare și contabilitate</H1>
        <Lead>
          <strong>SmartBill Conta include salarizare și D112.</strong> Pentru firmele de contabilitate,
          planul Free este 0 €, Conta S este 2 € + TVA/CIF/lună, iar Conta M este 79 € + TVA/CIF/lună.
          Dacă ții contabilitatea intern, SmartBill afișează și un tarif de 25 € pe lună per cont.
          Mai jos vezi ce primești pentru salarii și unde diferă de SAGA.
        </Lead>
        <Eyebrow>Verificat {ACTUALIZAT} · surse oficiale SmartBill</Eyebrow>
      </Hero>

      <Section
        noTopBorder
        companion={
          <CardCompanion
            titlu="Pe scurt"
            nota="Prețurile sunt cele afișate de SmartBill la verificarea din 22 septembrie 2026 și pot fi modificate de furnizor."
          >
            <Repere
              randuri={[
                ["Free", "0 €"],
                ["Conta S", "2 € + TVA/CIF/lună"],
                ["Conta M", "79 € + TVA/CIF/lună"],
                ["Testare", "3 luni contabile"],
              ]}
            />
          </CardCompanion>
        }
      >
        <h2>Preț SmartBill Conta în 2026</h2>
        <p>
          SmartBill separă oferta pentru firmele de contabilitate de situația în care o firmă își ține
          contabilitatea intern. În varianta pentru firme de contabilitate, pagina oficială afișează:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Preț afișat</th>
                <th>Salarizare + D112</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Free</th>
                <td>0 €</td>
                <td>2 contracte incluse</td>
              </tr>
              <tr>
                <th>Conta S</th>
                <td>2 € + TVA/CIF/lună</td>
                <td>10 contracte incluse*</td>
              </tr>
              <tr>
                <th>Conta M</th>
                <td>79 € + TVA/CIF/lună</td>
                <td>20 contracte incluse*</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Pentru contabilitate internă, pagina afișează suplimentar <strong>25 € pe lună per cont</strong>,
          peste planul Conta S sau Conta M. SmartBill oferă o perioadă de testare de trei luni contabile.
        </p>
        <p>
          *SmartBill precizează chiar pe pagina de prețuri că limitele și taxarea suplimentară pentru
          numărul de salariați din Conta S și M <strong>nu sunt aplicate încă</strong> la data verificării.
          Așadar, tabelul descrie structura publicată a planurilor, nu o taxare care se aplică deja fiecărui
          contract peste limită.
        </p>
        <p className="source-note">
          Sursă:{" "}
          <a href="https://www.smartbill.ro/preturi/contabilitate?tip=intern">
            SmartBill — prețuri Conta
          </a>.
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Ce intră în fluxul de salarii">
            <ul className="space-y-2 text-sm text-stone-600">
              <li>salariați și date contractuale</li>
              <li>salariu de bază, normă și program</li>
              <li>sporuri, taxe și deduceri</li>
              <li>stat de plată și fluturași</li>
              <li>Declarația 112</li>
            </ul>
          </CardCompanion>
        }
      >
        <h2>Ce poate face SmartBill pentru salarizare</h2>
        <p>
          Salarizarea nu este un produs separat: este inclusă în <strong>SmartBill Conta</strong>.
          În zona „Salariați”, documentația oficială arată că poți introduce datele personale și bancare,
          funcția, salariul de bază, norma de lucru, datele contractului, concediul, sporurile, contribuțiile
          și deducerile personale.
        </p>
        <p>
          Din același flux se generează statul de salarii și informațiile necesare pentru D112. SmartBill
          publică separat actualizările legislative ale modulului; în august 2026 a actualizat D112 pentru
          regulile aplicabile din iulie 2026.
        </p>
        <p>
          Dacă vrei doar să verifici un brut sau un net, nu ai nevoie de un program contabil. Pentru un
          calcul individual poți folosi <Link href="/">calculatorul de salariu net</Link>. Programul
          contabil devine relevant când trebuie să ții evidența angajaților, să generezi state și să
          raportezi lunar.
        </p>
        <p className="source-note">
          Surse:{" "}
          <a href="https://ajutorconta.smartbill.ro/article/718-salariati">SmartBill Conta — Salariați</a>
          {" · "}
          <a href="https://www.smartbill.ro/actualizari">SmartBill — actualizări produse</a>.
        </p>
      </Section>

      <Section>
        <h2>SmartBill Conta, Facturare și Gestiune nu sunt același produs</h2>
        <p>
          O căutare după „SmartBill” poate însemna lucruri diferite. SmartBill are produse pentru facturare,
          gestiune, POS și contabilitate. <strong>Salarizarea și D112 sunt în SmartBill Conta</strong>.
        </p>
        <p>
          Dacă ai nevoie doar de emiterea facturilor, comparația de preț trebuie făcută pe planurile de
          Facturare. Dacă ai nevoie de salarii, declarații și evidență contabilă, planurile Conta sunt cele
          relevante. Am separat aceste două lucruri fiindcă prețurile de facturare nu spun cât costă
          automat fluxul complet de contabilitate și salarii.
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Diferența de model">
            <Repere
              randuri={[
                ["SmartBill Conta", "cloud / browser"],
                ["SAGA C", "desktop"],
                ["SAGA WEB", "browser"],
                ["D112", "ambele"],
              ]}
            />
          </CardCompanion>
        }
      >
        <h2>SmartBill vs SAGA pentru salarizare</h2>
        <p>
          SmartBill și SAGA se suprapun la contabilitate și salarii, dar nu sunt construite identic.
          SmartBill Conta este un serviciu cloud cu planuri de abonament. SAGA C este programul desktop,
          iar SAGA WEB este varianta accesibilă din browser.
        </p>
        <p>
          Pentru salarii, ambele documentații includ evidența angajaților și D112. Diferența practică este
          mai ales în fluxul de lucru, licențiere și ecosistem. SAGA oferă și o licență freeware pentru
          aplicația desktop, dar fără actualizări, suport și mentenanță; SmartBill are plan Free și planuri
          Conta cu funcționalități și limite publicate.
        </p>
        <p>
          Am pus detaliile despre SAGA separat, ca să nu amestecăm două intenții de căutare diferite:
          <Link href="/saga"> vezi ghidul SAGA C și SAGA WEB</Link>.
        </p>
      </Section>

      <Section>
        <h2>SmartBill login și autentificare</h2>
        <p>
          Dacă intenția ta este doar autentificarea, intrarea corectă este serviciul oficial SmartBill.
          Salariile.ro nu reproduce formularul de login și nu cere date de acces. Pagina aceasta explică
          produsul, prețul și funcțiile de salarizare.
        </p>
        <p className="source-note">
          Autentificare oficială: <a href="https://cloud.smartbill.ro">cloud.smartbill.ro</a>.
        </p>
      </Section>

      <Faq items={FAQ} />

      <Section>
        <h2>Surse verificate</h2>
        <ul>
          <li>
            <a href="https://www.smartbill.ro/preturi/contabilitate?tip=intern">
              SmartBill — prețuri SmartBill Conta
            </a>
          </li>
          <li>
            <a href="https://ajutorconta.smartbill.ro/article/718-salariati">
              SmartBill Conta — evidența salariaților
            </a>
          </li>
          <li>
            <a href="https://www.smartbill.ro/actualizari">
              SmartBill — actualizări produse
            </a>
          </li>
          <li>
            <a href="https://www.sagasoft.ro/conditii-licenta.php">
              SAGA Software — condițiile licenței
            </a>
          </li>
        </ul>
        <p>
          Salariile.ro nu este afiliat cu SmartBill sau SAGA. Numele produselor apar pentru identificarea
          și compararea serviciilor descrise.
        </p>
      </Section>

      <PaginiConexe
        linkuri={[
          { href: "/saga", label: "SAGA C și SAGA WEB", descriere: "Contabilitate, salarii, D112 și licențiere." },
          { href: "/", label: "Calculator salariu net", descriere: "Transformă brutul în net și vezi taxele." },
          { href: "/calculator-pfa", label: "Calculator PFA", descriere: "Compară taxele PFA cu formele de firmă." },
          { href: "/fluturas-salariu", label: "Fluturaș de salariu", descriere: "Vezi ce înseamnă fiecare rând din statul de plată." },
        ]}
      />
    </>
  );
}
