import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { personSchema } from "@/lib/person";
import { calculeazaDeducerePersonala, SALARIU_MINIM } from "@/lib/fiscal";
import { ogPage, twPage, PAGE_LAST_MODIFIED } from "@/lib/seo";
import { Hero, Section, Breadcrumb, H1, Lead, Formula, PaginiConexe, CardCompanion, SUB_TITLU } from "@/app/components/ui";
import TabelArticol from "@/app/components/TabelArticol";

// Titlul vechi („tabel și calcul pentru salariu") depășea 60 de caractere cu brandul și
// nu conținea niciun număr. Descrierea veche era o listă de cuvinte-cheie despre ce
// CONȚINE pagina, nu răspunsul la „cât e deducerea personală" — de aceea Google o
// ignora și afișa meniul de navigație în locul ei.
const TITLE = "Deducere personală 2026: 865–1.946 lei";
const DESCRIPTION =
  "Deducerea personală 2026 este 865 lei fără persoane în întreținere și până la 1.946 lei cu 4+ persoane, la 4.325 lei brut. Peste 6.325 lei brut devine 0.";
const PATH = "/deducere-personala-2026";
const PLAFON = SALARIU_MINIM + 2000;
const PERSOANE = [0, 1, 2, 3, 4] as const;
const BRUTURI = [4325, 4500, 5000, 5500, 6000, 6325, 6500] as const;

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

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
      headline: "Deducere personală 2026: valori, plafon și tabel de calcul",
      description: DESCRIPTION,
      url: `https://salariile.ro${PATH}`,
      inLanguage: "ro-RO",
      author: personSchema,
      publisher: {
        "@type": "Organization",
        name: "Salariile",
        logo: { "@type": "ImageObject", url: "https://salariile.ro/icon-512.png", width: 512, height: 512 },
      },
      image: { "@type": "ImageObject", url: "https://salariile.ro/og-image.png", width: 1200, height: 630 },
      datePublished: "2026-07-06",
      dateModified: PAGE_LAST_MODIFIED["/deducere-personala-2026"].toISOString().slice(0, 10),
      mainEntityOfPage: `https://salariile.ro${PATH}`,
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
        <p className={`${SUB_TITLU} text-sm text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2`}>
          Scris de <Link href="/despre">Știuriuc Sorin-Marian</Link> · Actualizat {PAGE_LAST_MODIFIED[PATH].toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
        </p>
        <Lead>
          Deducerea personală e partea din salariu pe care nu plătești impozit. La salariul minim, e de{" "}
          <strong>{fmt(maxFaraPersoane)}&nbsp;lei</strong> fără persoane în întreținere și urcă până la{" "}
          <strong>{fmt(maxCuPatruPersoane)}&nbsp;lei</strong> cu patru sau mai multe. Scade pe măsură ce salariul crește și
          dispare peste <strong>{fmt(PLAFON)} lei brut</strong>.
        </Lead>
      </Hero>

      <Section
        companion={
          <CardCompanion titlu="Cine are dreptul">
            <ul className="flex flex-col gap-3 text-sm leading-normal text-stone-600">
              <li>
                Salariații cu brut de cel mult <strong className="font-semibold text-stone-900">{fmt(PLAFON)}&nbsp;lei</strong>,
                la locul de muncă de bază. La al doilea contract nu se acordă.
              </li>
              <li>
                În întreținere intră soțul sau soția, copiii și rudele până la gradul al doilea, ale tale sau ale
                partenerului, dacă au venituri de cel mult{" "}
                <strong className="font-semibold text-stone-900">{fmt(Math.round(SALARIU_MINIM * 0.2))}&nbsp;lei</strong> pe lună.
              </li>
              <li>
                Un copil se trece la un singur părinte. Dacă lucrați amândoi, alegeți care dintre voi îl declară.
              </li>
            </ul>
          </CardCompanion>
        }
      >
        <h2>Tabel deducere personală 2026</h2>
        <p>
          Caută-ți salariul brut pe rând și numărul de persoane în întreținere pe coloană.
        </p>
          <TabelArticol>
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
                    <td className="font-medium text-stone-900">{fmt(brut)}&nbsp;lei</td>
                    {PERSOANE.map((p) => (
                      <td key={p} className="text-right tabular-nums">{fmt(calculeazaDeducerePersonala(brut, p))}&nbsp;lei</td>
                    ))}
                  </tr>
                ))}
              </tbody>
          </TabelArticol>
        <p className="source-note">
          Valabil din 1 iulie 2026. Dacă ai sub 26 de ani sau copii la școală, deducerea e mai mare, ca mai jos.
        </p>
      </Section>

      <Section
        companion={
          <CardCompanion titlu="Separat: 200 de lei la salariul minim">
            <p className="text-sm leading-normal text-stone-600">
              La salariul minim, 200 de lei din brut nu plătesc nicio taxă: nici pensie, nici sănătate, nici impozit.
              Deducerea scade doar impozitul. La minim le primești pe amândouă, de aceea netul de acolo e relativ mai
              mare. Calculul complet e la <Link href="/salariu-minim" className="font-medium text-stone-900 underline underline-offset-2">salariul minim</Link>.
            </p>
          </CardCompanion>
        }
      >
        <h2>Cum se calculează</h2>
        <p>
          Deducerea pornește de la un procent din salariul minim, mai mare cu cât ai mai multe persoane în întreținere.
          Pentru fiecare 50 de lei peste minim, procentul scade puțin, până dispare la plafon.
        </p>
        <Formula
          eticheta="Formula deducerii personale"
          randuri={[
            "Deducere  = salariul minim × procent",
            "Procent   = 20% | 25% | 30% | 35% | 45%",
            "            (0 | 1 | 2 | 3 | 4+ persoane în întreținere)",
            "          − 0,5% pentru fiecare 50 lei peste salariul minim",
            "Plus:       15% din salariul minim, dacă ai sub 26 de ani",
            "            100 lei pentru fiecare copil la școală",
          ]}
        />
        <p>
          Deducerea nu e bani în plus pe fluturaș. E suma pe care nu se plătește impozitul de 10%, așa că netul crește
          cu a zecea parte din ea: la o deducere de {fmt(maxFaraPersoane)} lei, primești cu{" "}
          {fmt(Math.round(maxFaraPersoane * 0.1))} de lei mai mult în mână. Pentru calculul tău exact, deschide
          opțiunile avansate din <Link href="/">calculatorul de salariu net</Link>.
        </p>
        <p className="source-note">
          Sursa: <a href="https://legislatie.just.ro/Public/DetaliiDocument/257144" target="_blank" rel="noopener">Codul Fiscal</a>, art. 77.
          Formulele complete sunt în <Link href="/metodologie">metodologie</Link>.
        </p>
      </Section>

      <PaginiConexe
        linkuri={[
          { href: "/salarii", label: "Salarii pe meserii", descriere: "Cât se câștigă în fiecare meserie." },
          { href: "/salariu-minim", label: "Salariul minim 2026", descriere: "Unde deducerea e cea mai mare." },
          { href: "/fluturas-salariu", label: "Generator de fluturaș", descriere: "Fluturaș PDF cu deducerea inclusă." },
          { href: "/metodologie", label: "Metodologia de calcul", descriere: "Toate formulele, cu sursele lor." },
        ]}
      />
    </>
  );
}
