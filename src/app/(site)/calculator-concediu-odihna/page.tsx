import type { Metadata } from "next";
import { Breadcrumb, CardCompanion, Faq, Formula, H1, Hero, Lead, PaginiConexe, Prose, Repere, Section } from "@/app/components/ui";
import CalculatorConcediuOdihna from "@/app/components/CalculatorConcediuOdihna";
import { ReclamaSubCalculator } from "@/app/components/Reclama";
import { MINIM_ZILE_CONCEDIU_AN, URL_CODUL_MUNCII, calculeazaIndemnizatieCO } from "@/lib/concediu-odihna";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const TITLU = "Calculator Concediu de Odihnă 2026: indemnizație și zile";
const DESC =
  "Calculează indemnizația de concediu de odihnă, zilele proporționale și compensarea la plecare, plus modele scurte de cerere concediu și demisie.";

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
    q: "Câte zile de concediu de odihnă am dreptul pe an?",
    a: `Minimul legal din Codul Muncii este de ${MINIM_ZILE_CONCEDIU_AN} de zile lucrătoare pe an pentru normă întreagă sau part-time. Contractul individual sau colectiv de muncă poate acorda mai multe zile (de regulă 21–25). Sărbătorile legale și zilele de concediu medical nu intră în aceste zile.`,
  },
  {
    q: "De ce uneori iei mai mulți bani în luna în care ești în concediu de odihnă?",
    a: `Indemnizația zilnică se compară între salariul curent și media zilnică din ultimele 3 luni, alegându-se valoarea mai mare. Dacă ai avut bonusuri sau ore suplimentare în ultimele 3 luni, indemnizația de concediu crește (de exemplu, la 6.300 lei brut cu o medie de 7.500 lei pe 3 luni, 10 zile de concediu aduc +${fmt(EX_BONUS.diferentaNetFataDeNormal)} lei net în acea lună).`,
  },
  {
    q: "Se primesc tichete de masă pe zilele de concediu de odihnă?",
    a: "Nu. Tichetele de masă se acordă doar pentru zilele lucrate efectiv, deci în luna cu concediu de odihnă vei primi mai puține tichete pe card.",
  },
  {
    q: "Pot cere bani în locul zilelor de concediu neefectuate?",
    a: "Nu în timpul contractului. Potrivit Codului Muncii, compensarea în bani a concediului neefectuat este permisă exclusiv la încetarea contractului individual de muncă (demisie, acordul părților sau concediere).",
  },
  {
    q: "Când trebuie plătită indemnizația de concediu de odihnă?",
    a: "Codul Muncii prevede că indemnizația se plătește cu cel puțin 5 zile lucrătoare înainte de plecarea în concediu, deși în practică multe firme o virează odată cu salariul lunar dacă salariatul nu cere plata în avans.",
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
          Calculează indemnizația de concediu, zilele proporționale cuvenite pe anul în curs și compensarea în bani la încetarea contractului.
        </Lead>
      </Hero>

      <CalculatorConcediuOdihna />
      <ReclamaSubCalculator />

      <Section
        companion={
          <CardCompanion titlu="Reguli din Codul Muncii">
            <Repere
              randuri={[
                ["Minim legal anual", `${MINIM_ZILE_CONCEDIU_AN} zile lucrătoare`],
                ["Taxare indemnizație", "Identică salariului"],
                ["Reportare zile rămase", "18 luni (anul următor)"],
                ["Compensare în bani", "Doar la încetarea CIM"],
                ["Tichete de masă în CO", "Nu se acordă"],
              ]}
            />
          </CardCompanion>
        }
      >
        <Prose>
          <h2>Cum se calculează indemnizația și zilele proporționale</h2>
          <p>
            Indemnizația de concediu de odihnă nu poate fi mai mică decât salariul de bază, indemnizațiile și sporurile cu caracter permanent prevăzute în contract. Dacă media zilnică a veniturilor din ultimele 3 luni este mai mare, se aplică acea medie.
          </p>
          <Formula
            eticheta="Formule concediu de odihnă"
            randuri={[
              "Tarif zilnic CO    = max(brut contract ÷ zile lună, media 3 luni ÷ zile lună)",
              "Indemnizație brută = tarif zilnic CO × zile concediu (taxată ca salariul)",
              "Zile proporționale = zile anuale × luni lucrate ÷ 12",
              "Compensare plecare = (salariu brut ÷ 21) × zile rămase neefectuate",
            ]}
          />
          <p>
            Concediul medical, concediul de maternitate și concediul pentru îngrijirea copilului bolnav nu reduc numărul de zile de concediu de odihnă cuvenite. În schimb, concediul fără plată și concediul de creștere a copilului suspendă acumularea de zile noi.
          </p>

          <h2>Model cerere concediu de odihnă</h2>
          <pre className="overflow-x-auto rounded-md border border-stone-200 bg-canvas p-4 text-sm text-stone-800 whitespace-pre-wrap">{`Către conducerea [Nume firmă],

Subsemnatul(a) [Nume și Prenume], angajat(ă) pe funcția de [Funcție], vă rog să îmi aprobați efectuarea concediului de odihnă în perioada [zz.ll.aaaa] – [zz.ll.aaaa] ([N] zile lucrătoare), aferent anului [An].

Pe durata concediului, atribuțiile curente vor fi preluate de [Nume coleg, dacă este cazul].

Data: [zz.ll.aaaa]                    Semnătura: _______________`}</pre>

          <h2>Model notificare de demisie (cu sau fără preaviz)</h2>
          <pre className="overflow-x-auto rounded-md border border-stone-200 bg-canvas p-4 text-sm text-stone-800 whitespace-pre-wrap">{`Către conducerea [Nume firmă],

Subsemnatul(a) [Nume și Prenume], angajat(ă) pe funcția de [Funcție] în baza contractului individual de muncă nr. [Nr./Dată], vă notific încetarea contractului prin demisie, în temeiul art. 81 din Codul Muncii.

Termenul de preaviz este de [20 zile lucrătoare execuție / 45 zile lucrătoare conducere], ultima zi de activitate fiind [zz.ll.aaaa] (sau: solicit renunțarea totală/parțială la termenul de preaviz cu acordul angajatorului).

Rog compensarea în bani, la lichidare, a zilelor de concediu de odihnă neefectuate.

Data: [zz.ll.aaaa]                    Semnătura: _______________`}</pre>

          <p className="source-note">
            Sursa:{" "}
            <a href={URL_CODUL_MUNCII} target="_blank" rel="noopener">Codul Muncii (Legea nr. 53/2003)</a>, art. 81 (demisie) și art. 145–150 (concediul de odihnă).
          </p>
        </Prose>
      </Section>

      <Faq items={FAQ} />

      <PaginiConexe
        linkuri={[
          { href: "/zile-libere-2027", label: "Zile libere legale 2027", descriere: "Sărbătorile care nu se scad din concediul de odihnă." },
          { href: "/zile-lucratoare-2026", label: "Zile lucrătoare 2026", descriere: "Numărul exact de zile lucrătoare din fiecare lună." },
          { href: "/calculator-concediu-medical", label: "Calculator concediu medical", descriere: "Procente, prima zi neplătită și net estimat." },
          { href: "/", label: "Calculator salariu net", descriere: "Transformă brutul în net și vezi contribuțiile." },
          { href: "/noutati/tichete-de-masa-2026", label: "Tichete de masă 2026–2027", descriere: "De ce nu primești tichete în zilele de concediu." },
        ]}
      />
    </>
  );
}
