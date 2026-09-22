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
  title: { absolute: "SmartBill 2026: prețuri, facturare și Conta | Salariile.ro" },
  description:
    "SmartBill în 2026: prețuri actuale, Facturare, Gestiune, Conta, POS, e-Factura, login și salarizare. Ghid independent cu surse oficiale.",
  alternates: { canonical: "https://salariile.ro/smartbill" },
  openGraph: ogPage({
    title: "SmartBill 2026: prețuri, facturare și Conta",
    description:
      "Prețurile și produsele SmartBill: Facturare, Gestiune, Conta, POS, e-Factura, login și salarizare.",
    path: PATH,
  }),
  twitter: twPage({
    title: "SmartBill 2026: prețuri, facturare și Conta",
    description:
      "Prețurile și produsele SmartBill: Facturare, Gestiune, Conta, POS, e-Factura, login și salarizare.",
  }),
};

const FAQ = [
  {
    q: "Ce este SmartBill?",
    a: "SmartBill este o suită românească de aplicații cloud pentru facturare, e-Factura, gestiune, POS și contabilitate. Produsele sunt separate pe planuri, iar funcțiile de salarizare și D112 sunt în SmartBill Conta.",
  },
  {
    q: "Cât costă SmartBill?",
    a: "La verificarea din 22 septembrie 2026, SmartBill Facturare pornește de la 5,84 euro + TVA pe lună, iar Gestiune + Facturare de la 16,32 euro + TVA pe lună. SmartBill Conta are plan Free la 0 euro, Conta S la 2 euro + TVA/CIF/lună și Conta M la 79 euro + TVA/CIF/lună pentru firmele de contabilitate. Furnizorul poate modifica prețurile.",
  },
  {
    q: "SmartBill are salarizare?",
    a: "Da. SmartBill Conta include salarizare și D112. În evidența salariaților se pot completa date contractuale, salariul de bază, norma, sporurile, contribuțiile și deducerile, iar aplicația poate genera state și fluturași.",
  },
  {
    q: "Unde este login-ul SmartBill?",
    a: "Autentificarea se face pe serviciul oficial cloud.smartbill.ro. Salariile.ro nu cere și nu intermediază datele de acces SmartBill.",
  },
  {
    q: "Se scrie SmartBill sau Smart Bill?",
    a: "Numele oficial al produsului este SmartBill, într-un singur cuvânt. Căutarea „Smart Bill” este însă folosită frecvent pentru același produs, de aceea o tratăm aici ca aceeași intenție.",
  },
  {
    q: "SmartBill sau SAGA pentru salarii?",
    a: "Ambele au funcții de salarizare și D112. SmartBill Conta este un serviciu cloud, SAGA C este aplicație desktop, iar SAGA WEB funcționează în browser. Diferența practică ține de fluxul de lucru, licențiere și modul în care gestionezi firmele.",
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
      headline: "SmartBill 2026: prețuri, facturare, gestiune și contabilitate",
      description:
        "Ghid independent despre SmartBill: produse, prețuri, e-Factura, Conta, salarizare și comparație cu SAGA.",
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
        <H1>SmartBill în 2026: prețuri, facturare, gestiune și Conta</H1>
        <Lead>
          <strong>SmartBill este o suită cloud pentru facturare, e-Factura, gestiune, POS și contabilitate.</strong>{" "}
          Facturarea pornește de la 5,84 € + TVA/lună, iar Gestiune + Facturare de la 16,32 € + TVA/lună.
          SmartBill Conta are planuri separate și include salarizare + D112. Mai jos găsești produsele,
          prețurile, login-ul și diferența față de SAGA.
        </Lead>
        <Eyebrow>Ghid independent · verificat {ACTUALIZAT} în sursele oficiale SmartBill</Eyebrow>
      </Hero>

      <Section
        noTopBorder
        companion={
          <CardCompanion titlu="SmartBill pe scurt" nota="Prețurile sunt cele afișate public la 22 septembrie 2026.">
            <Repere
              randuri={[
                ["Facturare", "de la 5,84 € + TVA/lună"],
                ["Gestiune + Facturare", "de la 16,32 € + TVA/lună"],
                ["Conta", "Free / S / M"],
                ["Acces", "cloud / browser"],
              ]}
            />
          </CardCompanion>
        }
      >
        <h2>Ce este SmartBill și ce produse are</h2>
        <p>
          SmartBill nu este un singur program. Este un ecosistem de produse pentru administrarea financiară
          a unei firme. Homepage-ul oficial separă <strong>Facturare</strong>, <strong>Gestiune + Facturare</strong>,
          <strong>POS</strong> și <strong>Contabilitate</strong>, iar toate sunt legate de același ecosistem cloud.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produs</th>
                <th>Pentru ce îl folosești</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>SmartBill Facturare</th>
                <td>Facturi, e-Factura, proforme, chitanțe, încasări și rapoarte.</td>
              </tr>
              <tr>
                <th>SmartBill Gestiune</th>
                <td>Stocuri, NIR, inventar, coduri de bare, plus funcțiile de facturare.</td>
              </tr>
              <tr>
                <th>SmartBill POS</th>
                <td>Vânzare prin casă de marcat, inclusiv integrare cu gestiunea.</td>
              </tr>
              <tr>
                <th>SmartBill Conta</th>
                <td>Contabilitate, declarații, salarizare, D112, SAF-T și integrare SPV.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Dacă ai căutat „Smart Bill” scris separat, este aceeași entitate: forma folosită oficial de companie
          este <strong>SmartBill</strong>.
        </p>
        <p className="source-note">
          Surse:{" "}
          <a href="https://www.smartbill.ro/">SmartBill — pagina principală</a>
          {" · "}
          <a href="https://www.smartbill.ro/preturi/facturare-gestiune">
            SmartBill — Facturare și Gestiune
          </a>.
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Prețuri de intrare">
            <Repere
              randuri={[
                ["Facturare", "5,84 € + TVA/lună"],
                ["Gestiune + Facturare", "16,32 € + TVA/lună"],
                ["Conta Free", "0 €"],
                ["Conta S", "2 € + TVA/CIF/lună"],
                ["Conta M", "79 € + TVA/CIF/lună"],
              ]}
            />
          </CardCompanion>
        }
      >
        <h2>Prețuri SmartBill în 2026</h2>
        <p>
          Pagina oficială de prețuri afișează <strong>SmartBill Facturare de la 5,84 € + TVA/lună</strong> și
          <strong> SmartBill Gestiune + Facturare de la 16,32 € + TVA/lună</strong>. Ambele pot fi testate
          gratuit 30 de zile. Pentru firmele aflate în primul an de la înființare, SmartBill afișează o
          promoție de 12 luni gratuite pentru Facturare, Gestiune și programul de vânzare cu casă de marcat.
        </p>
        <p>
          La Facturare, planurile sunt Silver, Gold și Platinum. Diferențele principale sunt numărul de
          facturi, utilizatorii incluși, automatizarea e-Factura, rapoartele și accesul la API/plugin-uri.
          La Gestiune apar în plus stocurile, inventarul, NIR, codurile de bare și rapoartele de gestiune.
        </p>
        <p>
          SmartBill Conta are altă structură de preț. Pentru firmele de contabilitate, pagina oficială
          afișează Free la 0 €, Conta S la 2 € + TVA/CIF/lună și Conta M la 79 € + TVA/CIF/lună. Pentru
          contabilitatea internă se adaugă 25 € + TVA/lună per cont.
        </p>
        <p>
          Prețurile se pot schimba. De aceea păstrăm data verificării vizibilă și trimitem la paginile
          oficiale, nu la capturi sau tarife istorice.
        </p>
        <p className="source-note">
          Surse:{" "}
          <a href="https://www.smartbill.ro/preturi/facturare-gestiune">
            SmartBill — prețuri Facturare și Gestiune
          </a>
          {" · "}
          <a href="https://www.smartbill.ro/preturi/contabilitate?tip=intern">
            SmartBill — prețuri Conta
          </a>.
        </p>
      </Section>

      <Section>
        <h2>SmartBill Facturare și e-Factura</h2>
        <p>
          Zona de Facturare acoperă emiterea și trimiterea facturilor, proformelor și chitanțelor, precum și
          integrarea cu RO e-Factura. Planurile superioare adaugă trimitere automată sau în masă, facturare
          recurentă, notificări către clienți și funcții pentru magazine online.
        </p>
        <p>
          Pentru un utilizator care caută pur și simplu „SmartBill”, aceasta este una dintre intențiile
          dominante din rezultatele Google: acces rapid la facturare și e-Factura, nu salarizare. Din acest
          motiv ghidul începe cu produsele și prețurile și abia apoi intră în SmartBill Conta.
        </p>
      </Section>

      <Section>
        <h2>SmartBill Gestiune și POS</h2>
        <p>
          SmartBill Gestiune adaugă peste facturare evidența stocurilor: recepții și NIR, mișcări de stoc,
          inventar, coduri de bare, plăți către furnizori și rapoarte. Poate fi conectat cu SmartBill POS
          pentru vânzarea prin casă de marcat.
        </p>
        <p>
          Pentru magazine sau firme care lucrează cu marfă, comparația relevantă nu este între un simplu
          program de facturare și SmartBill, ci între pachetele de gestiune și fluxul complet necesar firmei.
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Salarizare în SmartBill Conta">
            <ul className="space-y-2 text-sm text-stone-600">
              <li>salariați și contracte</li>
              <li>salariu de bază, normă și program</li>
              <li>sporuri, contribuții și deduceri</li>
              <li>state de salarii și fluturași</li>
              <li>Declarația 112</li>
            </ul>
          </CardCompanion>
        }
      >
        <h2>SmartBill Conta: contabilitate, salarii și D112</h2>
        <p>
          <strong>Salarizarea este în SmartBill Conta</strong>, nu în planul simplu de Facturare. Documentația
          oficială pentru salariați include date personale și contractuale, salariul de bază, norma de lucru,
          programul, sporurile, contribuțiile și deducerile.
        </p>
        <p>
          Pagina de prețuri Conta include explicit <strong>Salarizare + D112</strong>. Planul Free afișează
          două contracte incluse, Conta S zece, iar Conta M douăzeci. SmartBill precizează însă că, la data
          verificării, limitele și taxarea suplimentară pentru numărul de salariați nu sunt încă aplicate.
        </p>
        <p>
          Dacă vrei doar să verifici un brut sau un net, nu ai nevoie de un program contabil. Pentru un
          calcul individual poți folosi <Link href="/">calculatorul salariile.ro</Link>. SmartBill Conta
          devine relevant când ai de gestionat angajați, state, fluturași și declarații.
        </p>
        <p className="source-note">
          Surse:{" "}
          <a href="https://www.smartbill.ro/preturi/contabilitate?tip=intern">
            SmartBill Conta — prețuri și salarizare
          </a>
          {" · "}
          <a href="https://ajutorconta.smartbill.ro/article/718-salariati">
            Ajutor SmartBill Conta — Salariați
          </a>.
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Acces rapid">
            <Repere
              randuri={[
                ["Login SmartBill", "cloud.smartbill.ro"],
                ["Facturare", "online"],
                ["Conta", "online"],
                ["Aplicații", "iOS / Android"],
              ]}
            />
          </CardCompanion>
        }
      >
        <h2>SmartBill login și autentificare</h2>
        <p>
          Dacă ai deja cont și intenția este doar autentificarea, intrarea corectă este serviciul oficial
          SmartBill Cloud. Salariile.ro nu reproduce formularul de login și nu cere date de acces.
        </p>
        <p>
          Pentru utilizatorii care caută informații înainte de a cumpăra, pagina de față rămâne separată de
          autentificare: explică produsele, prețurile și funcțiile, apoi te trimite la serviciul oficial.
        </p>
        <p className="source-note">
          Login oficial: <a href="https://cloud.smartbill.ro/auth/login/">cloud.smartbill.ro/auth/login</a>.
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
        <h2>SmartBill vs SAGA pentru contabilitate și salarizare</h2>
        <p>
          SmartBill și SAGA se suprapun la contabilitate și salarii, dar au modele diferite. SmartBill Conta
          este un serviciu cloud pe planuri. SAGA C este aplicația desktop, iar SAGA WEB este varianta
          accesibilă din browser.
        </p>
        <p>
          Pentru salarii, ambele documentații includ evidența angajaților și D112. Alegerea practică ține de
          modul în care vrei să lucrezi, de numărul de firme și de modelul de licențiere, nu de existența sau
          absența calculului salarial.
        </p>
        <p>
          Detaliile despre SAGA sunt într-o pagină separată, ca fiecare pagină să aibă o entitate și o
          intenție principală clară: <Link href="/saga">SAGA C și SAGA WEB</Link>.
        </p>
      </Section>

      <Faq items={FAQ} />

      <Section>
        <h2>Surse verificate</h2>
        <ul>
          <li><a href="https://www.smartbill.ro/">SmartBill — pagina principală</a></li>
          <li><a href="https://www.smartbill.ro/preturi/facturare-gestiune">SmartBill — prețuri Facturare și Gestiune</a></li>
          <li><a href="https://www.smartbill.ro/preturi/contabilitate?tip=intern">SmartBill — prețuri Conta</a></li>
          <li><a href="https://ajutorconta.smartbill.ro/article/718-salariati">SmartBill Conta — evidența salariaților</a></li>
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
          { href: "/fluturas-salariu", label: "Fluturaș de salariu", descriere: "Vezi ce înseamnă fiecare rând din statul de plată." },
          { href: "/calculator-pfa", label: "Calculator PFA", descriere: "Calculează taxele pentru activitate independentă." },
        ]}
      />
    </>
  );
}
