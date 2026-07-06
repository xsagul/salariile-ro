import type { Metadata } from "next";
import Link from "next/link";
import { personSchema } from "@/lib/person";
import { calculeazaDeducerePersonala, SALARIU_MINIM } from "@/lib/fiscal";
import { ogPage, twPage } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Eyebrow } from "@/app/components/ui";

const TITLE = "Deducere personală 2026: tabel și calcul pentru salariu";
const DESCRIPTION =
  "Tabel deducere personală 2026 pentru salarii, cu plafonul de 6.325 lei, persoane în întreținere, formula Cod Fiscal art. 77 și exemple de calcul net.";
const PATH = "/deducere-personala-2026";
const PLAFON = SALARIU_MINIM + 2000;
const PERSOANE = [0, 1, 2, 3, 4] as const;
const BRUTURI = [4325, 4500, 5000, 5500, 6000, 6325, 6500] as const;

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

const FAQ = [
  {
    q: "Ce este deducerea personală?",
    a: "Deducerea personală este o sumă care se scade din baza de calcul a impozitului pe venit. Nu se scade din CAS sau CASS, ci doar reduce impozitul de 10%.",
  },
  {
    q: "Cine primește deducere personală în 2026?",
    a: "Se acordă salariaților care au funcția de bază la acel angajator și venit brut lunar de cel mult salariul minim plus 2.000 lei. Din 1 iulie 2026 plafonul este 6.325 lei brut.",
  },
  {
    q: "Deducerea personală crește salariul net?",
    a: "Da, dar indirect. Pentru fiecare 100 lei deducere, impozitul scade cu 10 lei, deci netul crește cu aproximativ 10 lei.",
  },
  {
    q: "Deducerea personală este același lucru cu facilitatea de 200 lei pentru salariul minim?",
    a: "Nu. Deducerea personală reduce doar baza impozitului pe venit. Facilitatea OUG 89/2025 reduce baza pentru CAS, CASS și impozit doar în cazul salariului minim eligibil.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `https://salariile.ro${PATH}` },
  openGraph: ogPage({ title: TITLE, description: DESCRIPTION, path: PATH }),
  twitter: twPage({ title: TITLE, description: DESCRIPTION }),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Deducere personală 2026", item: `https://salariile.ro${PATH}` },
      ],
    },
    {
      "@type": "Article",
      headline: "Deducere personală 2026: tabel și calcul pentru salariu",
      description: DESCRIPTION,
      url: `https://salariile.ro${PATH}`,
      inLanguage: "ro-RO",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile.ro",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      datePublished: "2026-07-06",
      dateModified: "2026-07-06",
      mainEntityOfPage: `https://salariile.ro${PATH}`,
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

export default function DeducerePersonalaPage() {
  const maxFaraPersoane = calculeazaDeducerePersonala(SALARIU_MINIM, 0);
  const maxCuPatruPersoane = calculeazaDeducerePersonala(SALARIU_MINIM, 4);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Hero>
        <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Deducere personală 2026" }]} />
        <H1>Deducere personală 2026</H1>
        <p className="mt-3 text-sm text-stone-500 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2">
          Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat 6 iulie 2026
        </p>
        <Lead>
          Tabel rapid pentru deducerea personală din salariu în 2026: plafonul actual este <strong>{fmt(PLAFON)} lei brut</strong>, adică salariul minim brut de {fmt(SALARIU_MINIM)} lei plus 2.000 lei.
        </Lead>
        <Eyebrow>Codul Fiscal art. 77 · regim valabil din 1 iulie 2026</Eyebrow>
      </Hero>

      <main>
        <Section wide>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
              <div className="text-3xl font-bold tabular-nums text-stone-900">{fmt(PLAFON)} lei</div>
              <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">Plafon brut</p>
            </div>
            <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
              <div className="text-3xl font-bold tabular-nums text-stone-900">{fmt(maxFaraPersoane)} lei</div>
              <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">Deducere maximă fără persoane</p>
            </div>
            <div className="rounded-md border border-stone-200 bg-surface p-5 shadow-soft">
              <div className="text-3xl font-bold tabular-nums text-stone-900">{fmt(maxCuPatruPersoane)} lei</div>
              <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">Deducere maximă cu 4+ persoane</p>
            </div>
          </div>
        </Section>

        <Section>
          <h2>Tabel deducere personală 2026</h2>
          <p>
            Valorile de mai jos sunt calculate pentru regimul fiscal aplicabil din 1 iulie 2026. Peste {fmt(PLAFON)} lei brut, deducerea personală de bază devine 0.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Salariu brut</th>
                  {PERSOANE.map((p) => (
                    <th key={p} className="text-right">{p === 4 ? "4+ persoane" : `${p} persoane`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BRUTURI.map((brut) => (
                  <tr key={brut}>
                    <td className="font-medium text-stone-900">{fmt(brut)} lei</td>
                    {PERSOANE.map((p) => (
                      <td key={p} className="text-right tabular-nums">{fmt(calculeazaDeducerePersonala(brut, p))} lei</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="source-note">
            Tabelul folosește aceeași funcție fiscală ca <Link href="/">calculatorul de salariu net</Link>. Pentru copii școlari sau salariat sub 26 de ani, se adaugă deduceri suplimentare în calculatorul avansat.
          </p>
        </Section>

        <Section>
          <h2>Cum se calculează</h2>
          <p>
            Deducerea personală de bază pleacă de la un procent din salariul minim brut și scade pe măsură ce brutul se apropie de plafonul de {fmt(PLAFON)} lei. Procentul depinde de numărul total de persoane în întreținere:
          </p>
          <ul>
            <li>0 persoane: 20% din salariul minim brut</li>
            <li>1 persoană: 25% din salariul minim brut</li>
            <li>2 persoane: 30% din salariul minim brut</li>
            <li>3 persoane: 35% din salariul minim brut</li>
            <li>4 sau mai multe persoane: 45% din salariul minim brut</li>
          </ul>
          <p>
            Pentru fiecare tranșă de 50 lei peste salariul minim brut, procentul scade cu 0,5 puncte procentuale. Deducerea nu poate depăși baza impozabilă rămasă după CAS și CASS.
          </p>
        </Section>

        <Section>
          <h2>Impactul asupra salariului net</h2>
          <p>
            Deducerea personală nu este bani primiți separat. Ea reduce doar suma pe care se aplică impozitul pe venit de 10%. De aceea, efectul în net este aproximativ 10% din deducerea aplicată.
          </p>
          <p>
            Exemplu: dacă deducerea aplicată este {fmt(maxFaraPersoane)} lei, impozitul scade cu aproximativ {fmt(Math.round(maxFaraPersoane * 0.1))} lei. Netul crește cu aceeași sumă.
          </p>
          <p>
            Pentru calculul exact al netului, cu persoane în întreținere, copii școlari, tichete sau scutire de impozit, folosește <Link href="/">calculatorul salariu net</Link> și deschide opțiunile avansate.
          </p>
        </Section>

        <Section>
          <h2>Deducere personală vs facilitatea de 200 lei</h2>
          <p>
            În 2026 există două mecanisme diferite care pot reduce taxele la salariile mici:
          </p>
          <ul>
            <li><strong>Deducerea personală</strong> reduce baza pentru impozitul pe venit.</li>
            <li><strong>Facilitatea OUG 89/2025</strong> scade 200 lei din baza pentru CAS, CASS și impozit, dar se aplică doar la salariul minim eligibil.</li>
          </ul>
          <p>
            Cele două se pot cumula la salariul minim, motiv pentru care netul de la {fmt(SALARIU_MINIM)} lei brut este {fmt(2699)} lei în regimul de după 1 iulie 2026. Vezi calculul complet pe pagina despre <Link href="/salariu-minim">salariul minim 2026</Link>.
          </p>
        </Section>

        <Section>
          <h2>Surse și pagini conexe</h2>
          <ul>
            <li><a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener">Codul Fiscal, Legea 227/2015</a> · art. 77 pentru deducerea personală</li>
            <li><Link href="/metodologie">Metodologia de calcul salariu net</Link>, cu formulele complete</li>
            <li><Link href="/salariu-minim">Salariul minim pe economie 2026</Link>, cu facilitatea OUG 89/2025</li>
            <li><Link href="/">Calculator salariu net 2026</Link>, pentru calculul complet brut-net</li>
          </ul>
          <p className="source-note">Pagina actualizată: 6 iulie 2026.</p>
        </Section>
      </main>
    </>
  );
}
