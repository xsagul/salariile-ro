import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { Section, Breadcrumb, CardCompanion, Repere, PaginiConexe, Faq, TITLU_PAGINA, SPATIU_JOS, SPATIU_SUS } from "@/app/components/ui";

const PATH = "/smartbill";
const ACTUALIZAT = PAGE_LAST_MODIFIED[PATH].toLocaleDateString("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const metadata: Metadata = {
  title: { absolute: "SmartBill 2026: prețuri, facturare și Conta | Salariile" },
  description:
    "SmartBill în 2026: prețuri Facturare, Gestiune și Conta, salarizare cu D112, e-Factura și comparație cu SAGA, pe baza datelor oficiale.",
  alternates: { canonical: "https://salariile.ro/smartbill" },
  openGraph: ogPage({
    title: "SmartBill 2026: prețuri, facturare și Conta",
    description:
      "Prețurile și produsele SmartBill: Facturare, Gestiune, Conta, POS, e-Factura și salarizare.",
    path: PATH,
  }),
  twitter: twPage({
    title: "SmartBill 2026: prețuri, facturare și Conta",
    description:
      "Prețurile și produsele SmartBill: Facturare, Gestiune, Conta, POS, e-Factura și salarizare.",
  }),
};

const FAQ = [
  {
    q: "Ce este SmartBill?",
    a: "SmartBill este o suită românească de aplicații cloud pentru facturare, RO e-Factura, gestiune, POS și contabilitate. Produsele sunt separate pe planuri, iar funcțiile de salarizare și D112 se află în SmartBill Conta.",
  },
  {
    q: "Cât costă SmartBill?",
    a: "La verificarea din septembrie 2026, SmartBill Facturare pornește de la 5,84 euro + TVA/lună, iar Gestiune + Facturare de la 16,32 euro + TVA/lună. SmartBill Conta are plan Free la 0 euro, Conta S la 2 euro + TVA/CIF/lună și Conta M la 79 euro + TVA/CIF/lună pentru firmele de contabilitate.",
  },
  {
    q: "SmartBill are modul de salarizare și D112?",
    a: "Da, în SmartBill Conta. Modulul gestionează contracte, salariu de bază, normă, sporuri, contribuții, deduceri, state de salarii, fluturași și Declarația 112. Planul simplu de Facturare nu include salarizare.",
  },
  {
    q: "Unde este autentificarea în contul SmartBill?",
    a: "Autentificarea se face direct pe portalul oficial cloud.smartbill.ro.",
  },
  {
    q: "SmartBill Conta sau SAGA pentru salarii?",
    a: "Ambele includ evidența salariaților și generarea D112. SmartBill Conta funcționează exclusiv în cloud, SAGA C este aplicație desktop Windows, iar SAGA WEB rulează în browser.",
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
      publisher: { "@type": "Organization", name: "Salariile", url: "https://salariile.ro" },
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

      <section className="bg-canvas">
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>
          <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "SmartBill" }]} />
          <div className="md:grid md:grid-cols-5 md:items-center md:gap-8 lg:gap-10">
            <div className="md:col-span-3">
              <h1 className={`max-w-xl ${TITLU_PAGINA}`}>
                SmartBill: produse, prețuri și salarizare
              </h1>
              <p className="mt-4 text-xs text-stone-600 [&_a]:font-medium [&_a]:text-stone-700 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-900">
                Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat {ACTUALIZAT}
              </p>
              <p className="mt-5 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 [&_strong]:font-semibold [&_strong]:text-stone-900">
                SmartBill este o suită cloud pentru <strong>facturare online și RO e-Factura</strong>, disponibilă din browser și din aplicațiile mobile. Evidența stocurilor necesită pachetul Gestiune, iar contabilitatea și salarizarea sunt separate în <strong>SmartBill Conta</strong>.
              </p>
            </div>
            <div className="mt-7 md:col-span-2 md:mt-0">
              <Image
                src="/hero-smartbill.webp"
                alt="Ilustrație cu o antreprenoare care verifică o factură lângă un calculator de birou"
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

      <Section>
        <h2>Produsele SmartBill și ce acoperă fiecare</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produs</th>
                <th>Ce acoperă</th>
                <th>Preț de pornire (fără TVA)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>SmartBill Facturare</th>
                <td>Facturi, proforme, chitanțe, încasări, RO e-Factura și rapoarte (planuri Silver, Gold, Platinum).</td>
                <td>5,84 €/lună</td>
              </tr>
              <tr>
                <th>SmartBill Gestiune</th>
                <td>Stocuri, recepții NIR, inventar, coduri de bare și plăți furnizori, plus funcțiile de facturare.</td>
                <td>16,32 €/lună</td>
              </tr>
              <tr>
                <th>SmartBill POS</th>
                <td>Vânzare prin casă de marcat conectată la gestiune.</td>
                <td>Pe ofertă / în pachet</td>
              </tr>
              <tr>
                <th>SmartBill Conta</th>
                <td>Contabilitate, declarații fiscale, SAF-T, integrare SPV, salarizare și D112.</td>
                <td>Free 0 € · S 2 €/CIF · M 79 €/CIF</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Facturare și Gestiune includ 30 de zile de testare gratuită, iar firmele aflate în primul an de la înființare beneficiază de promoția de 12 luni gratuite afișată de furnizor. Pentru contabilitatea internă în SmartBill Conta se adaugă 25 € + TVA/lună per cont.
        </p>
        <p className="source-note">
          Autentificare cont:{" "}
          <a href="https://cloud.smartbill.ro/auth/login/" rel="noopener noreferrer">cloud.smartbill.ro</a>
          {" · "}
          <a href="https://www.smartbill.ro/preturi/facturare-gestiune" rel="noopener noreferrer">Prețuri Facturare și Gestiune</a>
          {" · "}
          <a href="https://www.smartbill.ro/preturi/contabilitate?tip=intern" rel="noopener noreferrer">Prețuri SmartBill Conta</a>
          {" "}(tarife verificate în septembrie 2026; verifică pagina furnizorului înainte de achiziție).
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Salarizare în SmartBill Conta">
            <Repere
              randuri={[
                ["Modul", "SmartBill Conta"],
                ["Documente", "State, fluturași, D112"],
                ["Contracte Free", "2 incluse"],
                ["Contracte S / M", "10 / 20 incluse"],
              ]}
            />
          </CardCompanion>
        }
      >
        <h2>Salarizare și Declarația 112</h2>
        <p>
          <strong>Salarizarea este disponibilă doar în SmartBill Conta</strong>, separat de abonamentul de Facturare. Fișa salariatului acoperă datele contractuale, salariul de bază, norma, programul de lucru, sporurile, contribuțiile și deducerile personale, pe baza cărora aplicația generează statele de plată, fluturașii și fișierul pentru Declarația 112.
        </p>
        <p>
          Planurile Free, Conta S și Conta M listează 2, 10, respectiv 20 de contracte incluse (furnizorul precizând la verificarea din septembrie 2026 că taxarea suplimentară peste aceste praguri nu este activată). Pentru verificarea unui singur salariu brut-net fără software contabil poți folosi direct{" "}
          <Link href="/">calculatorul de salariu net</Link>.
        </p>
        <p className="source-note">
          Documentație:{" "}
          <a href="https://ajutorconta.smartbill.ro/article/718-salariati" rel="noopener noreferrer">
            Ajutor SmartBill Conta: evidența salariaților
          </a>.
        </p>
      </Section>

      <Section>
        <h2>SmartBill Conta vs SAGA</h2>
        <p>
          Ambele programe acoperă contabilitatea completă, statele de salarii și Declarația 112. Diferența principală ține de modul de lucru și licențiere: SmartBill Conta rulează integral în cloud pe abonament per CIF, în timp ce{" "}
          <Link href="/saga">SAGA C și SAGA WEB</Link> oferă atât o aplicație desktop pe Windows (inclusiv variantă Freeware fără actualizări), cât și acces din browser.
        </p>
        <p className="source-note">
          Salariile.ro este un site independent și nu este afiliat cu SmartBill sau SAGA Software.
        </p>
      </Section>

      <Faq items={FAQ} />

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
