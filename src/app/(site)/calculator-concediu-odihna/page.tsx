import type { Metadata } from "next";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import CalculatorConcediuOdihna from "@/app/components/CalculatorConcediuOdihna";
import { ReclamaSubCalculator } from "@/app/components/Reclama";
import { MINIM_ZILE_CONCEDIU_AN, URL_CODUL_MUNCII, calculeazaIndemnizatieCO } from "@/lib/concediu-odihna";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const TITLU = "Calculator Concediu de Odihnă 2026: indemnizație și zile";
const DESC =
  "Calculează indemnizația de concediu de odihnă, zilele proporționale și banii la plecare, plus modele scurte de cerere concediu și demisie.";

export const metadata: Metadata = {
  title: { absolute: TITLU },
  description: DESC,
  alternates: { canonical: "https://salariile.ro/calculator-concediu-odihna" },
  openGraph: ogPage({ title: TITLU, description: DESC, path: "/calculator-concediu-odihna" }),
  twitter: twPage({ title: TITLU, description: DESC }),
};

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

const EX_BONUS = calculeazaIndemnizatieCO({
  salariuBrutContract: 6300,
  mediaBruta3Luni: 7500,
  zileLucratoareLuna: 21,
  zileConcediu: 10,
})!;

const FAQ = [
  {
    q: "Câte zile de concediu de odihnă am pe an?",
    a: `Cel puțin ${MINIM_ZILE_CONCEDIU_AN} de zile lucrătoare pe an, indiferent dacă lucrezi 8 ore sau part-time. Contractul de muncă poate da mai multe (de obicei 21–25). Sărbătorile legale și zilele de concediu medical nu se scad din concediul de odihnă.`,
  },
  {
    q: "De ce uneori intră mai mulți bani în luna în care ai concediu?",
    a: `Indemnizația pe zi nu poate fi mai mică decât salariul curent, dar dacă media ultimelor 3 luni e mai mare (de exemplu, din bonusuri sau ore suplimentare), se plătește media mai mare. La 6.300 lei brut cu o medie de 7.500 lei pe ultimele 3 luni, 10 zile de concediu aduc cu ${fmt(EX_BONUS.diferentaNetFataDeNormal)} lei net mai mult în acea lună.`,
  },
  {
    q: "Primesc tichete de masă în zilele de concediu?",
    a: "Nu. Tichetele se dau doar pentru zilele lucrate efectiv, așa că în luna cu concediu primești mai puține tichete pe card.",
  },
  {
    q: "Pot primi bani pe zilele de concediu neluate dacă rămân la firmă?",
    a: "Nu. Zilele rămase se pot plăti în bani doar când se încheie contractul de muncă (la demisie, acordul părților sau concediere). Altfel, se reportează și pot fi luate în următoarele 18 luni.",
  },
  {
    q: "Când se plătește indemnizația de concediu?",
    a: "Codul Muncii cere plata cu cel puțin 5 zile lucrătoare înainte să pleci în concediu. În practică, multe firme virează suma odată cu salariul lunar, dacă nu ceri plata în avans.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Calculator concediu de odihnă", item: "https://salariile.ro/calculator-concediu-odihna" },
      ],
    },
    {
      "@type": "WebApplication",
      name: TITLU,
      url: "https://salariile.ro/calculator-concediu-odihna",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
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
      name: "Salariile",
      url: "https://salariile.ro",
      founder: { "@id": "https://salariile.ro/#person" },
    },
    personSchema,
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero peGrila>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Calculator concediu de odihnă" }]} />
        <H1>Calculator concediu de odihnă 2026</H1>
        <Lead>
          Vezi cât iei în luna cu concediu, câte zile ți se cuvin dacă nu ai lucrat tot anul și câți bani primești pe zilele rămase la plecare.
        </Lead>
      </Hero>

      <CalculatorConcediuOdihna />
      <ReclamaSubCalculator />

      <Section
        companion={
          <CardCompanion titlu="Regulile de bază">
            <Repere
              randuri={[
                ["Minim pe an", `${MINIM_ZILE_CONCEDIU_AN} zile lucrătoare`],
                ["Taxe pe concediu", "La fel ca pe salariu"],
                ["Reportare zile", "18 luni în anul următor"],
                ["Plată în bani", "Doar la plecare"],
                ["Tichete de masă", "Nu se dau în concediu"],
              ]}
            />
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se calculează concediul de odihnă</h2>
          <p>
            Pentru fiecare zi de concediu iei cel puțin cât ai fi câștigat într-o zi normală pe salariul din contract (cu sporurile permanente). Dacă în ultimele 3 luni ai avut bonusuri sau ore suplimentare și media zilnică iese mai mare, primești acea medie.
          </p>
          <Formula
            eticheta="Formule concediu de odihnă"
            randuri={[
              "Tarif pe zi        = max(brut contract ÷ zile lună, media 3 luni ÷ zile lună)",
              "Brut concediu      = tarif pe zi × zile concediu (taxat ca salariul)",
              "Zile proporționale = zile pe an × luni lucrate ÷ 12",
              "Bani la plecare    = (salariu brut ÷ 21) × zile rămase neluate",
            ]}
          />
          <p>
            Zilele de concediu medical, maternitate sau îngrijire copil bolnav nu îți taie din concediul de odihnă. În schimb, concediul fără plată și concediul de creștere a copilului pun pe pauză acumularea de zile noi.
          </p>

          <h2>Model cerere concediu de odihnă</h2>
          <pre className="overflow-x-auto rounded-md border border-stone-200 bg-canvas p-4 text-sm text-stone-800 whitespace-pre-wrap">{`Către conducerea [Nume firmă],

Subsemnatul(a) [Nume și Prenume], angajat(ă) pe postul de [Funcție], vă rog să îmi aprobați concediul de odihnă între [zz.ll.aaaa] și [zz.ll.aaaa] ([N] zile lucrătoare), pentru anul [An].

Pe durata absenței, activitățile curente pot fi preluate de [Nume coleg, dacă e cazul].

Data: [zz.ll.aaaa]                    Semnătura: _______________`}</pre>

          <h2>Model cerere de demisie (cu sau fără preaviz)</h2>
          <pre className="overflow-x-auto rounded-md border border-stone-200 bg-canvas p-4 text-sm text-stone-800 whitespace-pre-wrap">{`Către conducerea [Nume firmă],

Subsemnatul(a) [Nume și Prenume], angajat(ă) pe postul de [Funcție] cu contractul nr. [Nr./Dată], vă anunț încetarea contractului de muncă prin demisie (Codul Muncii, art. 81).

Preavizul este de [20 zile lucrătoare execuție / 45 zile lucrătoare conducere], iar ultima zi lucrată va fi [zz.ll.aaaa] (sau: solicit renunțarea la preaviz cu acordul dumneavoastră).

Vă rog ca la lichidare să fie plătite și zilele de concediu de odihnă neefectuate.

Data: [zz.ll.aaaa]                    Semnătura: _______________`}</pre>

          <p className="source-note">
            Sursa:{" "}
            <a href={URL_CODUL_MUNCII} target="_blank" rel="noopener">Codul Muncii (Legea 53/2003)</a>, art. 81 (demisia) și art. 145–150 (concediul de odihnă).
          </p>
        </Prose>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/zile-libere-2027", label: "Zile libere legale 2027", descriere: "Sărbătorile care nu se scad din concediu." },
          { href: "/zile-lucratoare-2026", label: "Zile lucrătoare 2026", descriere: "Câte zile lucrătoare are fiecare lună." },
          { href: "/calculator-concediu-medical", label: "Calculator concediu medical", descriere: "Procente, prima zi neplătită și netul estimat." },
          { href: "/", label: "Calculator salariu net", descriere: "Transformă brutul în net și vezi taxele." },
          { href: "/noutati/tichete-de-masa-2026", label: "Tichete de masă 2026–2027", descriere: "De ce nu primești tichete în concediu." },
        ]}
      />
    </>
  );
}
