// app/calculator-salariu-sanatate/page.tsx
// Calculator salariu sănătate — Legea 153/2017, Anexa nr. II.
//
// De ce pagina asta există, măsurat pe 9 septembrie 2026:
//
//   1. Intenția de unealtă nu declanșează AI Overview, intenția informațională
//      da. Verificat pe SERP-uri reale: „calculator salariu net" și „calculator
//      salariu brut" primesc zece linkuri simple, în timp ce „salariu asistent
//      medical" primește AI Overview care citează paylab. Clickul mai există
//      doar pe partea de unealtă.
//   2. Pe „calculator salariu sanatate" și „calcul salariu sanatate" stăteam pe
//      pozițiile 30,2 și 26,2 — adică nicăieri.
//   3. Tiparul e dovedit: după ce a apărut pagina de învățământ, „calculator
//      salarii invatamant" a trecut de la 1 la 41 de clickuri pe săptămână.
//
// Testul pe care pagina trebuie să-l treacă, ca să nu fie pagină-ușă: omul NU
// își știe brutul. Un asistent medical știe „principal, postliceal, 15 ani
// vechime"; brutul vine din grilă, iar peste el se aplică gradația și, sub un
// plafon, indemnizația de hrană. Un calculator sectorial pentru construcții sau
// IT ar pica testul — acolo calculul e identic cu cel standard din 2025.

import type { Metadata } from "next";
import { Breadcrumb, CardCompanion, Faq, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";
import CalculatorSanatate from "@/app/components/CalculatorSanatate";
import { MESERII_SANATATE, TOTAL_TREPTE } from "@/lib/sanatate";
import { SURSA_GRILE } from "@/lib/grile-publice";
import { INDEMNIZATIE_HRANA, PLAFON_HRANA_NET, INDEMNIZATIE_DOCTORAT_2026 } from "@/lib/lege153";

const TITLU = "Calculator salariu sănătate 2026: grilă, gradație și net";
const DESC =
  "Calculează salariul din sistemul sanitar public în 2026, pe grila din Legea 153/2017: salariu de bază, gradația de vechime, indemnizația de hrană și netul.";

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: "https://salariile.ro/calculator-salariu-sanatate" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/calculator-salariu-sanatate" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

const TOATE = MESERII_SANATATE.flatMap((m) => m.trepte.map((t) => t.brut));
const MIN_GRILA = Math.min(...TOATE);
const MAX_GRILA = Math.max(...TOATE);

const FAQ = [
  {
    q: "Cât câștigă un asistent medical în 2026?",
    a: `Salariul de bază din grilă pornește de la ${fmt(
      MESERII_SANATATE.find((m) => m.slug === "asistent-medical")?.trepte[0]?.brut ?? 0,
    )} lei brut pentru un debutant cu studii postliceale și urcă pe treapta de principal. Peste suma din grilă se aplică gradația de vechime în muncă, care poate adăuga până la 24,52%, iar sub plafonul de ${fmt(
      PLAFON_HRANA_NET,
    )} lei net se adaugă și indemnizația de hrană de ${fmt(INDEMNIZATIE_HRANA)} lei.`,
  },
  {
    q: "Cum se calculează gradația de vechime?",
    a: "Cotele se compun, nu se adună. Gradația 1 adaugă 7,5%, gradația 2 încă 5% peste rezultatul anterior, gradația 3 alți 5%, gradațiile 4 și 5 câte 2,5%. Cumulat, gradația 5 înseamnă +24,52% față de valoarea din grilă, nu +22,5% cum ar da adunarea simplă. Temeiul e art. 10 alin. (4) din Legea 153/2017, iar regula e generală: se aplică la fel în sănătate, în învățământ și în administrație.",
  },
  {
    q: "De ce un medic primar nu primește indemnizația de hrană?",
    a: `Art. 18 alin. (1) o acordă numai personalului „ale cărui salarii lunare sunt de până la ${fmt(
      PLAFON_HRANA_NET,
    )} lei net inclusiv". Salariul de bază al unui medic primar depășește plafonul, deci cei ${fmt(
      INDEMNIZATIE_HRANA,
    )} de lei nu se cuvin. La treptele de început ale aceleiași profesii plafonul nu se atinge, iar indemnizația apare în calcul. Tot art. 18 exclude și personalul căruia i se acordă alte drepturi de hrană potrivit legislației specifice — de aceea calculatorul are un comutator, nu o presupunere.`,
  },
  {
    q: "Sunt incluse gărzile și sporurile pentru condiții deosebite?",
    a: "Nu, și e o alegere deliberată. Sporurile pentru condiții deosebite, vătămătoare sau periculoase din Anexa nr. II, cap. II depind de încadrarea concretă a locului de muncă, stabilită prin regulament intern și buletine de determinare, nu prin lege. Gărzile și sporul de noapte depind de graficul lunar. O cifră care le-ar presupune ar ieși mai mare și mai falsă, așa că salariul de aici este cel de bază plus drepturile generale ale legii.",
  },
  {
    q: "Salariile din grilă sunt brute sau nete?",
    a: "Sumele din anexă sunt salariu de bază brut, la gradația 0 — adică înainte de vechime și înainte de orice spor. Calculatorul le convertește în net aplicând CAS 25%, CASS 10% și impozitul pe venit de 10%, aceleași cote ca pentru orice salariat.",
  },
  {
    q: "Ce se întâmplă dacă apare noua lege a salarizării?",
    a: "Până la publicarea în Monitorul Oficial nu se schimbă nimic aici. Un proiect se modifică până la adoptare, iar publicarea unor cifre neadoptate ar însemna un an de sume false. Personalul sanitar este plătit azi după grila din Legea 153/2017, în forma consolidată citată mai jos.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Calculator salariu sănătate",
          item: "https://salariile.ro/calculator-salariu-sanatate",
        },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: "https://salariile.ro/calculator-salariu-sanatate",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "RON" },
      description: DESC,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "Organization",
      "@id": "https://salariile.ro/#organization",
      name: "Salariile.ro",
      url: "https://salariile.ro",
      founder: { "@id": "https://salariile.ro/#person" },
    },
    personSchema,
  ],
};

const REPERE_SANATATE = [
  ["Salariu de bază, minim în grilă", `${fmt(MIN_GRILA)} lei`],
  ["Salariu de bază, maxim în grilă", `${fmt(MAX_GRILA)} lei`],
  ["Gradația 5, cumulat", "+24,52%"],
  ["Indemnizație de hrană", `${fmt(INDEMNIZATIE_HRANA)} lei`],
  ["Plafon indemnizație de hrană", `${fmt(PLAFON_HRANA_NET)} lei net`],
  ["Indemnizație doctorat", `${fmt(INDEMNIZATIE_DOCTORAT_2026)} lei`],
] as const;

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator salariu sănătate" }]} />
        <H1>Calculator salariu sănătate 2026</H1>
        <Lead>
          Alege-ți încadrarea și vezi salariul de bază, gradația de vechime și netul — fiecare linie
          cu articolul din lege. Grila e cea în plată azi, din Legea 153/2017, Anexa nr. II.
        </Lead>
      </Hero>

      <CalculatorSanatate />

      <Section
        companion={
          <CardCompanion
            titlu="Repere · Anexa nr. II"
            nota="Sume brute, la gradația 0. Peste ele se aplică gradația de vechime în muncă și indemnizațiile generale ale legii."
          >
            <Repere randuri={REPERE_SANATATE} />
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se construiește salariul din sistemul sanitar</h2>
          <p>
            Salariul de bază nu e o singură cifră citită dintr-un tabel. Se compune în pași, iar
            ordinea lor schimbă rezultatul:
          </p>
          <ol>
            <li>
              <strong>Salariul din grilă.</strong> Se alege după funcție și treaptă profesională —
              debutant, specialist, principal. Valorile din anexă sunt la gradația 0 și sunt brute.
            </li>
            <li>
              <strong>Gradația de vechime în muncă.</strong> Se aplică peste valoarea din grilă și
              ține de toată cariera, nu doar de anii lucrați în sănătate. Cele cinci gradații se
              compun între ele, iar la vârf adaugă 24,52%.
            </li>
            <li>
              <strong>Indemnizațiile generale.</strong> Hrana și titlul de doctor se adaugă peste
              salariul de bază deținut, fiecare cu propria condiție.
            </li>
          </ol>

          <h2>Unde diferă sănătatea de învățământ</h2>
          <p>
            Regulile de bază sunt aceleași — sunt articole din corpul legii, nu din anexă. Diferența
            practică e plafonul indemnizației de hrană. În învățământ el nu se atinge niciodată: cea
            mai mare valoare din grilă, cu gradația maximă, rămâne sub {fmt(PLAFON_HRANA_NET)} lei
            net. În sănătate se atinge, pentru că un medic specialist sau primar depășește plafonul
            și pierde cei {fmt(INDEMNIZATIE_HRANA)} de lei. Calculatorul o spune explicit când se
            întâmplă, în loc să lase linia să lipsească fără explicație.
          </p>

          <h2>Ce nu intră în calcul</h2>
          <p>
            Sporurile pentru condiții deosebite, vătămătoare sau periculoase din Anexa nr. II,
            cap. II nu sunt incluse. Ele se stabilesc pe locul de muncă, prin buletine de
            determinare și regulament intern, și pot varia mult între două spitale pentru aceeași
            funcție. Nici gărzile și nici sporul de noapte nu intră, pentru că depind de graficul
            lunar. Cifra de aici este salariul de bază plus drepturile pe care legea le acordă
            general — adică partea care se poate verifica în act, linie cu linie.
          </p>
        </Prose>
      </Section>

      <Faq
        items={FAQ}
        companion={
          <CardCompanion
            titlu="Cine e acoperit"
            nota="Funcțiile de conducere din unitățile sanitare au tabele separate în anexă, cu coloane pe mărimea spitalului, și nu sunt incluse aici."
          >
            <Repere
              randuri={[
                ["Meserii acoperite", `${MESERII_SANATATE.length}`],
                ["Trepte profesionale", `${TOTAL_TREPTE}`],
                ["Trepte de gradație", "6"],
                ["Formă consolidată", new Date(SURSA_GRILE.dataExtragerii).toLocaleDateString("ro-RO")],
              ]}
            />
          </CardCompanion>
        }
      />

      <PaginiConexe
        linkuri={[
          { href: "/salarii/asistent-medical", label: "Salariu asistent medical", descriere: "Grila și reperele pentru asistenți." },
          { href: "/salarii/medic", label: "Salariu medic", descriere: "De la rezident la medic primar." },
          { href: "/salarii/medic-rezident", label: "Salariu medic rezident", descriere: "Treptele pe ani de rezidențiat." },
          { href: "/calculator-salariu-invatamant", label: "Calculator salariu învățământ", descriere: "Aceeași lege, Anexa I." },
          { href: "/salarii/domeniu/sanatate", label: "Salarii în sănătate", descriere: "Cifrele INS pentru sectorul sanitar." },
          { href: "/", label: "Calculator salariu net", descriere: "Brut în net pentru orice salariu." },
        ]}
      />
    </>
  );
}
