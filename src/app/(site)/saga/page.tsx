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
    "SAGA C și SAGA WEB în 2026: contabilitate, salarizare, D112, licență freeware și diferențele față de SmartBill. Surse oficiale SAGA.",
  alternates: { canonical: "https://salariile.ro/saga" },
  openGraph: ogPage({
    title: "SAGA Web și SAGA C: salarii și contabilitate",
    description:
      "Ce sunt SAGA C și SAGA WEB, cum funcționează salarizarea și D112 și cum diferă de SmartBill.",
    path: PATH,
  }),
  twitter: twPage({
    title: "SAGA Web și SAGA C: salarii și contabilitate",
    description:
      "Ce sunt SAGA C și SAGA WEB, cum funcționează salarizarea și D112 și cum diferă de SmartBill.",
  }),
};

const FAQ = [
  {
    q: "Ce este SAGA C?",
    a: "SAGA C este programul SAGA pentru evidență contabilă, salarială și de stocuri în partidă dublă. Aplicația desktop are atât licență freeware, cât și licență plătită.",
  },
  {
    q: "Ce este SAGA WEB?",
    a: "SAGA WEB este versiunea online a programelor SAGA C și SAGA P.S. și permite accesarea funcționalităților similare prin browser.",
  },
  {
    q: "SAGA poate calcula salarii și genera D112?",
    a: "Da. Manualul SAGA are module pentru configurarea salariilor, salariați, state de salarii și Declarația 112. Actualizările din 2026 includ modificări de salarizare și actualizări D112.",
  },
  {
    q: "SAGA C este gratuit?",
    a: "SAGA oferă o licență Freeware pentru SAGA C și SAGA P.S. pe termen nedeterminat cât timp furnizorul continuă această variantă. Freeware nu include actualizări, asistență, suport tehnic și mentenanță; acestea intră în licența plătită.",
  },
  {
    q: "SAGA sau SmartBill pentru salarii?",
    a: "Ambele acoperă salarii și D112. SAGA C este aplicație desktop, SAGA WEB funcționează în browser, iar SmartBill Conta este un serviciu cloud pe planuri. Comparația utilă ține de fluxul de lucru, licențiere, numărul de firme și nevoia de acces online.",
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
                SAGA: desktop sau web pentru contabilitate?
              </h1>
              <p className="mt-4 text-xs text-stone-600 [&_a]:font-medium [&_a]:text-stone-700 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-stone-900">
                Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat {ACTUALIZAT}
              </p>
              <p className="mt-5 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 [&_strong]:font-semibold [&_strong]:text-stone-900">
                <strong>Alege SAGA C dacă lucrezi local pe PC și ai nevoie de contabilitate, salarii și stocuri într-un singur program.</strong>{" "}
                Dacă accesul din browser este prioritar, varianta relevantă este SAGA WEB.
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
          <CardCompanion titlu="Verdict rapid">
            <ul className="space-y-3 text-sm leading-normal text-stone-600 [&_strong]:font-semibold [&_strong]:text-stone-900">
              <li><strong>SAGA C:</strong> pentru contabilitate în partidă dublă și lucru local pe PC.</li>
              <li><strong>SAGA WEB:</strong> dacă vrei să intri în program direct din browser.</li>
              <li><strong>Pentru salarii:</strong> ambele variante includ fluxuri de salarizare și D112.</li>
            </ul>
          </CardCompanion>
        }
      >
        <h2>Ce variantă SAGA ți se potrivește?</h2>
        <p>
          SAGA C este alegerea firească pentru contabili și firme care lucrează pe Windows, gestionează mai
          multe tipuri de evidențe și vor să păstreze fluxul principal pe calculatorul propriu.
        </p>
        <p>
          SAGA WEB răspunde altei nevoi: accesul online. Nu alegi între ele după numărul de funcții afișate,
          ci după locul din care lucrezi și felul în care vrei să accesezi datele firmei.
        </p>
        <p className="source-note">
          Informațiile despre produse și licențiere au fost verificate la {ACTUALIZAT} în sursele oficiale SAGA Software.
        </p>
      </Section>

      <Section>
        <h2>SAGA C, SAGA WEB și SAGA P.S.</h2>
        <p>
          <strong>SAGA C</strong> este aplicația desktop pentru evidență contabilă, salarială și de
          stocuri în partidă dublă. Pentru partidă simplă există SAGA P.S. <strong>SAGA WEB</strong>{" "}
          este versiunea online a produselor și oferă acces prin browser.
        </p>
        <p>
          Diferența este importantă pentru că expresii precum „SAGA”, „SAGA C” și „SAGA WEB” nu descriu
          exact același lucru. Dacă ai nevoie de lucru local pe PC, SAGA C este produsul relevant.
          Dacă ai nevoie de acces din browser, te interesează SAGA WEB.
        </p>
        <p className="source-note">
          Surse:{" "}
          <a href="https://www.sagasoft.ro/formular-licente.php?tip=juridica">
            SAGA Software — formular licențe și descriere produse
          </a>
          {" · "}
          <a href="https://www.sagasoft.ro/conditii-licenta.php">
            condiții de licență
          </a>.
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Salarizare în SAGA">
            <ul className="space-y-2 text-sm text-stone-600">
              <li>configurare salarii</li>
              <li>evidență salariați</li>
              <li>state de salarii</li>
              <li>concedii și diurne</li>
              <li>Declarația 112</li>
            </ul>
          </CardCompanion>
        }
      >
        <h2>SAGA pentru salarii și D112</h2>
        <p>
          Manualul SAGA are o zonă separată de <strong>configurare salarii</strong>. Acolo sunt setate
          valorile și regulile folosite la calcul, iar în evidența salariaților se completează tipul
          salariului, salariul brut, contractele și datele necesare raportării.
        </p>
        <p>
          Statele de salarii sunt legate de Declarația 112. Manualul descrie separat angajații standard,
          contractele cu scutiri sau concedii medicale și celelalte categorii raportate în D112.
        </p>
        <p>
          SAGA a continuat să actualizeze aceste funcții în 2026. Jurnalul oficial consemnează modificări
          pentru salarizarea aplicabilă din iulie și actualizări D112, iar pagina SAGA C afișează în prezent
          versiunea 3.0.605, datată 9 septembrie 2026.
        </p>
        <p>
          Pentru verificarea rapidă a unui salariu individual poți folosi
          <Link href="/"> calculatorul brut-net</Link>. SAGA este relevant când trebuie să gestionezi
          mai mulți angajați, state și declarații.
        </p>
        <p className="source-note">
          Surse:{" "}
          <a href="https://manual.sagasoft.ro/sagac/glosar-14-kw-48-letter-C.html">
            Manual SAGA C — Configurare salarii
          </a>
          {" · "}
          <a href="https://manual.sagasoft.ro/sagac/topic-25-salariati.html">
            Salariați
          </a>
          {" · "}
          <a href="https://www.sagasoft.ro/actualizari.php?program=SAGA+C">
            actualizări SAGA C
          </a>.
        </p>
      </Section>

      <Section>
        <h2>SAGA gratuit vs licență plătită</h2>
        <p>
          SAGA Software definește explicit o <strong>licență Freeware</strong> pentru SAGA C și SAGA P.S.
          Pagina SAGA C descrie programul drept gratuit și fără limitări; condițiile de licențiere precizează
          că varianta Freeware poate fi folosită pe termen nedeterminat cât timp furnizorul continuă să o ofere.
        </p>
        <p>
          Limita importantă este alta: licența Freeware <strong>nu include actualizările programului,
          asistență, suport tehnic și mentenanță</strong>. Licența plătită le include. Pentru un program de
          salarizare, actualizările contează deoarece formularele și regulile fiscale se schimbă.
        </p>
        <p>
          Prețul curent este calculat în formularul oficial de achiziție în funcție de pachet și numărul
          de accesări/CIF-uri incluse. Nu dăm aici o sumă luată de pe un forum sau de pe o factură veche,
          pentru că probabil n-ar fi oferta pe care o primește firma ta azi.
        </p>
        <p className="source-note">
          Surse:{" "}
          <a href="https://www.sagasoft.ro/conditii-licenta.php">SAGA — condiții licență</a>
          {" · "}
          <a href="https://www.sagasoft.ro/formular-licente.php?tip=juridica">
            formular oficial de achiziție
          </a>.
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Diferența de model">
            <Repere
              randuri={[
                ["SAGA C", "desktop"],
                ["SAGA WEB", "browser"],
                ["SmartBill Conta", "cloud / browser"],
                ["D112", "ambele"],
              ]}
            />
          </CardCompanion>
        }
      >
        <h2>SAGA vs SmartBill pentru salarizare</h2>
        <p>
          Nu există o diferență de tipul „unul calculează salarii, celălalt nu”. <strong>Ambele</strong>{" "}
          au fluxuri de salarizare și D112. Diferența este în modul în care lucrezi cu ele.
        </p>
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
                <th>Acces</th>
                <td>SAGA C desktop; SAGA WEB în browser</td>
                <td>cloud / browser</td>
              </tr>
              <tr>
                <th>Salarizare</th>
                <td>Da</td>
                <td>Da</td>
              </tr>
              <tr>
                <th>D112</th>
                <td>Da</td>
                <td>Da</td>
              </tr>
              <tr>
                <th>Variantă gratuită</th>
                <td>Freeware desktop, fără actualizări/support</td>
                <td>Plan Free în Conta</td>
              </tr>
              <tr>
                <th>Preț public</th>
                <td>calculat în formularul de licențiere</td>
                <td>planuri publicate per CIF/lună</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Pentru prețurile și limitele SmartBill am separat analiza într-o pagină proprie:
          <Link href="/smartbill"> SmartBill 2026 — preț, salarizare și Conta</Link>.
        </p>
      </Section>

      <Section>
        <h2>Actualizări SAGA în 2026</h2>
        <p>
          Pentru software-ul de salarizare, o listă de funcții nu este suficientă. Contează și cât de repede
          este actualizat când se schimbă declarațiile sau regulile fiscale.
        </p>
        <p>
          Jurnalul oficial SAGA C arată în 2026 actualizări pentru D112, REGES, concedii medicale și regulile
          de salarizare aplicabile din iulie. Asta nu garantează că orice caz particular este automat
          configurat corect, dar arată că produsul este întreținut pentru schimbările curente.
        </p>
        <p className="source-note">
          Sursă: <a href="https://www.sagasoft.ro/actualizari.php?program=SAGA+C">SAGA C — lista actualizărilor</a>.
        </p>
      </Section>

      <Faq items={FAQ} />

      <Section>
        <h2>Surse verificate</h2>
        <ul>
          <li>
            <a href="https://www.sagasoft.ro/saga-c.php">
              SAGA Software — SAGA C
            </a>
          </li>
          <li>
            <a href="https://www.sagasoft.ro/conditii-licenta.php">
              SAGA Software — licență și condiții de utilizare
            </a>
          </li>
          <li>
            <a href="https://www.sagasoft.ro/formular-licente.php?tip=juridica">
              SAGA Software — formular de achiziție și produse
            </a>
          </li>
          <li>
            <a href="https://manual.sagasoft.ro/sagac/glosar-14-kw-48-letter-C.html">
              Manual SAGA C — Configurare salarii
            </a>
          </li>
          <li>
            <a href="https://www.sagasoft.ro/actualizari.php?program=SAGA+C">
              SAGA C — actualizări
            </a>
          </li>
        </ul>
        <p>
          Salariile.ro nu este afiliat cu SAGA Software sau SmartBill. Numele produselor apar pentru
          identificarea și compararea serviciilor descrise.
        </p>
      </Section>

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
