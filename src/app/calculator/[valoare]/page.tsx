// app/calculator/[valoare]/page.tsx
// Server Component — FĂRĂ "use client"

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import { Section } from "@/app/components/ui";
import {
  brutDinNetStandardCuRegim,
  calculStandard,
  calculStandardCuRegim,
  REGIM_FISCAL_CURENT,
  REGIMURI_FISCALE_SALARIU,
  SALARIU_MINIM,
  type RegimFiscalSalariu,
  type Rezultat,
} from "@/lib/fiscal";
import {
  allCalculatorSlugs,
  CALCULATOR_BRUT_VALUES,
  CALCULATOR_NET_VALUES,
  calculatorSlugBrut,
  calculatorSlugNet,
  LAST_FISCAL_CONTENT_UPDATE,
  ogPage,
  twPage,
} from "@/lib/seo";

interface Props {
  params: Promise<{ valoare: string }>;
}

type CalculatorMode = "net-din-brut" | "brut-din-net" | "necunoscut";

const CALCULATOR_SLUG_ALLOWLIST = new Set(allCalculatorSlugs());

// Indexăm numai valorile validate prin date de căutare. Restul răspund 404, inclusiv
// variantele cu zerouri la început, ca să nu generăm un spațiu infinit de pagini similare.
export const dynamicParams = false;

export function generateStaticParams() {
  return allCalculatorSlugs().map((valoare) => ({ valoare }));
}

function isCalculIstoricS1(mod: CalculatorMode, cifra: string) {
  return (
    (mod === "net-din-brut" && cifra === "4050") ||
    (mod === "brut-din-net" && cifra === "2574")
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { valoare } = await params;
  const { mod, cifra } = parseSlug(valoare);

  if (mod === "necunoscut") {
    notFound();
  }

  const esteCalculIstoricS1 = isCalculIstoricS1(mod, cifra);

  if (mod === "net-din-brut") {
    const perioada = esteCalculIstoricS1 ? " în ianuarie–iunie 2026" : " în 2026";
    return {
      title: `Salariu net pentru ${cifra} lei brut${perioada}`,
      description: esteCalculIstoricS1
        ? "Calcul istoric pentru salariul minim brut de 4.050 lei, cu regimul fiscal aplicabil între 1 ianuarie și 30 iunie 2026."
        : `Calculează instant salariul net pentru ${cifra} lei brut. Află cât reții după CAS, CASS și impozit pe venit.`,
      alternates: { canonical: `https://salariile.ro/calculator/${valoare}` },
      openGraph: ogPage({
        title: `Salariu net pentru ${cifra} lei brut${perioada}`,
        description: esteCalculIstoricS1
          ? "Calcul istoric pentru salariul minim din primul semestru al anului 2026."
          : `Calculează instant salariul net pentru ${cifra} lei brut.`,
        path: `/calculator/${valoare}`,
      }),
      twitter: twPage({
        title: `Salariu net pentru ${cifra} lei brut${perioada}`,
        description: esteCalculIstoricS1
          ? "Calcul istoric pentru salariul minim din primul semestru al anului 2026."
          : `Calculează instant salariul net pentru ${cifra} lei brut.`,
      }),
    };
  }

  if (mod === "brut-din-net") {
    const perioada = esteCalculIstoricS1 ? " în ianuarie–iunie 2026" : " în 2026";
    const description = esteCalculIstoricS1
      ? "Calcul istoric: află brutul de 4.050 lei corespunzător netului standard de 2.574 lei din primul semestru al anului 2026."
      : `Calculează instant salariul brut corespunzător unui net de ${cifra} lei. Formula inversă CAS, CASS, impozit.`;

    return {
      title: `Salariu brut pentru ${cifra} lei net${perioada}`,
      description,
      alternates: { canonical: `https://salariile.ro/calculator/${valoare}` },
      openGraph: ogPage({
        title: `Salariu brut pentru ${cifra} lei net${perioada}`,
        description,
        path: `/calculator/${valoare}`,
      }),
      twitter: twPage({
        title: `Salariu brut pentru ${cifra} lei net${perioada}`,
        description,
      }),
    };
  }

  return {
    title: "Calculator Salariu Net 2026",
    description: "Calculator salariu net din brut pentru România, actualizat 2026.",
  };
}

function parseSlug(slug: string): {
  valoare: string;
  mod: CalculatorMode;
  cifra: string;
  brutInitial: string;
  modInitial: "brut" | "net";
} {
  if (!CALCULATOR_SLUG_ALLOWLIST.has(slug)) {
    return { valoare: slug, mod: "necunoscut", cifra: "", brutInitial: "", modInitial: "brut" };
  }

  const matchNetDinBrut = slug?.match(/^calcul-salariu-net-(\d+)-brut$/);
  if (matchNetDinBrut) {
    return { valoare: slug, mod: "net-din-brut", cifra: matchNetDinBrut[1], brutInitial: matchNetDinBrut[1], modInitial: "brut" };
  }

  const matchBrutDinNet = slug?.match(/^calcul-salariu-brut-(\d+)-net$/);
  if (matchBrutDinNet) {
    return { valoare: slug, mod: "brut-din-net", cifra: matchBrutDinNet[1], brutInitial: matchBrutDinNet[1], modInitial: "net" };
  }

  return { valoare: slug, mod: "necunoscut", cifra: "", brutInitial: "", modInitial: "brut" };
}

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

const CALCULATOR_BRUT_REFERENCE_VALUES = [4325, 5000, 7000, 10000, 20000] as const;
const CALCULATOR_NET_REFERENCE_VALUES = [2574, 3000, 5000, 7000] as const;

type ValidCalculatorMode = Exclude<CalculatorMode, "necunoscut">;

type CalculatorLink = {
  href: string;
  label: string;
};

function calculatorLink(mod: ValidCalculatorMode, valoare: number): CalculatorLink {
  const esteBrut = mod === "net-din-brut";
  return {
    href: `/calculator/${esteBrut ? calculatorSlugBrut(valoare) : calculatorSlugNet(valoare)}`,
    label: esteBrut
      ? `${fmt(valoare)} lei brut → net`
      : `${fmt(valoare)} lei net → brut`,
  };
}

function getCalculatorLinks(
  mod: ValidCalculatorMode,
  valoare: number,
  valoareOpusa: number,
): CalculatorLink[] {
  const valoriCurente: readonly number[] =
    mod === "net-din-brut" ? CALCULATOR_BRUT_VALUES : CALCULATOR_NET_VALUES;
  const indexCurent = valoriCurente.indexOf(valoare);
  const indiciVecini = [indexCurent - 2, indexCurent - 1, indexCurent + 1, indexCurent + 2];
  const vecini = indiciVecini
    .filter((index) => index >= 0 && index < valoriCurente.length)
    .map((index) => calculatorLink(mod, valoriCurente[index]));

  const modOpus: ValidCalculatorMode =
    mod === "net-din-brut" ? "brut-din-net" : "net-din-brut";
  const valoriOpuse: readonly number[] =
    modOpus === "net-din-brut" ? CALCULATOR_BRUT_VALUES : CALCULATOR_NET_VALUES;
  const ceaMaiApropiata = valoriOpuse.reduce((best, candidate) =>
    Math.abs(candidate - valoareOpusa) < Math.abs(best - valoareOpusa) ? candidate : best,
  );

  const repere = (
    mod === "net-din-brut"
      ? CALCULATOR_BRUT_REFERENCE_VALUES
      : CALCULATOR_NET_REFERENCE_VALUES
  )
    .filter((candidate) => candidate !== valoare)
    .map((candidate) => calculatorLink(mod, candidate));

  const linkuri = [...vecini, calculatorLink(modOpus, ceaMaiApropiata), ...repere];
  return [...new Map(linkuri.map((link) => [link.href, link])).values()];
}

// ─── Context editorial per tranșă salarială ──────────────────────────────────
// Aceste 3 secțiuni (poziție, sectoare, insight) sunt informații de NIVEL DE
// CATEGORIE — legitim partajate de salariile din aceeași bandă. Unicitatea per
// pagină vine din secțiunea "Defalcare fiscală", care folosește cifrele REALE
// calculate de modulul fiscal (diferite pentru fiecare valoare).

type Context = {
  pozitie: React.ReactNode;
  insight: React.ReactNode;
};

const CASTIG_MEDIU_BRUT_BUGETAR_2026 = 9192;
const REZULTAT_MINIM_S1_2026 = calculStandardCuRegim(4050, "2026-S1");
const NET_MINIM_S1_2026 = REZULTAT_MINIM_S1_2026?.net ?? 2574;
const REZULTAT_MINIM_CURENT = calculStandard(SALARIU_MINIM);

function getContextBrut(v: number): Context {
  if (v === 4325) {
    return {
      pozitie: <>Brutul de <strong>4.325 lei</strong> este <Link href="/salariu-minim">salariul minim brut pe economie</Link> în vigoare din 1 iulie 2026, conform HG 146/2026.</>,
      insight: <>În cazul standard folosit pe această pagină — funcție de bază, fără tichete și fără persoane în întreținere — rezultatul include facilitatea de 200 lei și deducerea personală. Netul efectiv poate fi diferit dacă nu sunt îndeplinite condițiile facilității sau situația angajatului diferă.</>,
    };
  }

  if (v === 4050) {
    return {
      pozitie: <>Brutul de <strong>4.050 lei</strong> a fost <Link href="/salariu-minim">salariul minim brut pe economie</Link> între 1 ianuarie și 30 iunie 2026, conform HG 1506/2024. În cazul standard, grila fiscală S1 produce un net de <strong>{fmt(REZULTAT_MINIM_S1_2026?.net ?? 0)} lei</strong>.</>,
      insight: <>Acesta este un calcul istoric: folosește facilitatea de 300 lei, plafonul de 4.300 lei și deducerea personală raportată la minimul de 4.050 lei. Din 1 iulie 2026, minimul brut este 4.325 lei, iar facilitatea este 200 lei.</>,
    };
  }

  if (v < SALARIU_MINIM) {
    return {
      pozitie: <>Brutul de <strong>{fmt(v)} lei</strong> este sub <Link href="/salariu-minim">salariul minim brut</Link> de 4.325 lei aplicabil din iulie 2026. Pentru un contract individual de muncă cu normă întreagă, reperul legal este salariul de bază brut minim/oră; contractele part-time și lunile lucrate parțial necesită calcul separat.</>,
      insight: <>Valoarea netă nu poate stabili singură dacă un contract respectă salariul minim. Trebuie verificate norma, salariul de bază brut, timpul efectiv lucrat și eventualele excepții privind contribuțiile.</>,
    };
  }

  if (v <= SALARIU_MINIM + 2000) {
    return {
      pozitie: <>Brutul de <strong>{fmt(v)} lei</strong> este peste salariul minim actual și se află în intervalul în care deducerea personală de bază poate fi acordată la funcția de bază.</>,
      insight: <>Deducerea depinde de brut și de numărul persoanelor în întreținere și scade gradual până la plafonul de {fmt(SALARIU_MINIM + 2000)} lei. Calculatorul avansat permite introducerea situației individuale.</>,
    };
  }

  if (v > 15000) {
    return {
      pozitie: <>Brutul de <strong>{fmt(v)} lei</strong> depășește atât salariul minim, cât și indicatorul salarial brut de 9.192 lei folosit la fundamentarea bugetului asigurărilor sociale de stat pentru 2026. Acest indicator nu este salariul mediu lunar publicat de INS.</>,
      insight: <>Dacă analizezi alternative precum PFA sau microîntreprindere, compară obligațiile și protecția juridică, nu doar taxele. În 2026, <a href="https://legislatie.just.ro/Public/DetaliiDocument/307580" target="_blank" rel="noopener noreferrer">plafonul de venit pentru regimul microîntreprinderilor este 100.000 euro</a>, iar eligibilitatea depinde și de celelalte condiții legale.</>,
    };
  }

  return {
    pozitie: <>Brutul de <strong>{fmt(v)} lei</strong> depășește plafonul deducerii personale de bază. Raportarea la salariul minim sau la indicatorul bugetar oferă context, dar nu descrie distribuția salariilor din România.</>,
    insight: <>La acest nivel, netul standard este determinat în principal de CAS, CASS și impozitul pe venit. Tichetele, scutirile aplicabile și deducerea suplimentară pentru copii pot modifica rezultatul individual.</>,
  };
}

function getContextNet(v: number): Context {
  const netMinimStandard = REZULTAT_MINIM_CURENT?.net ?? 0;

  if (v === NET_MINIM_S1_2026) {
    return {
      pozitie: <>Netul standard de <strong>{fmt(v)} lei</strong> corespunde brutului minim istoric de <strong>4.050 lei</strong>, aplicabil între 1 ianuarie și 30 iunie 2026.</>,
      insight: <>Acesta este un calcul istoric în grila S1 2026: facilitate de 300 lei și deducere personală raportată la salariul minim de 4.050 lei. Pentru perioada de după 1 iulie se folosește regimul fiscal curent.</>,
    };
  }

  if (v < netMinimStandard) {
    return {
      pozitie: <>Netul de <strong>{fmt(v)} lei</strong> este sub estimarea standard de {fmt(netMinimStandard)} lei obținută din brutul minim actual de 4.325 lei. Aceasta este o comparație fiscală, nu un prag legal net.</>,
      insight: <>Legea stabilește salariul minim în termeni de brut și tarif orar. Netul depinde de funcția de bază, facilitate, deduceri, tichete și situația contractului; o valoare mai mică nu dovedește singură o încălcare.</>,
    };
  }

  if (v <= netMinimStandard + 100) {
    return {
      pozitie: <>Netul de <strong>{fmt(v)} lei</strong> este apropiat de estimarea standard de {fmt(netMinimStandard)} lei pentru un brut de 4.325 lei, la funcția de bază și fără alte venituri sau beneficii.</>,
      insight: <>Nu există un „salariu minim net” unic stabilit prin hotărâre. Pentru verificarea unui fluturaș trebuie pornit de la brutul contractual și de la condițiile fiscale efectiv aplicabile.</>,
    };
  }

  return {
    pozitie: <>Pentru a obține <strong>{fmt(v)} lei net</strong>, brutul necesar trebuie calculat din condițiile fiscale concrete. Rezultatul standard al paginii presupune funcție de bază, fără tichete și fără persoane în întreținere.</>,
    insight: <>Negocierea pe net trebuie transpusă într-un brut contractual clar. Folosește opțiunile avansate pentru situația individuală și verifică separat beneficiile extrasalariale.</>,
  };
}

// ─── Defalcare fiscală cu CIFRE REALE — unică per pagină ──────────────────────
// Folosește rezultatul calculat de modulul fiscal: fiecare valoare produce
// numere complet diferite (CAS, CASS, impozit, net, CAM, cost) → conținut unic.

function DefalcareFiscala({
  brut,
  rez,
  regimFiscal,
}: {
  brut: number;
  rez: Rezultat;
  regimFiscal: RegimFiscalSalariu;
}) {
  const regim = REGIMURI_FISCALE_SALARIU[regimFiscal];
  const netStandardMinim = calculStandardCuRegim(regim.salariuMinim, regimFiscal)?.net ?? 0;
  const ratieNetStandard = netStandardMinim > 0 ? rez.net / netStandardMinim : 0;
  const comparatieNetStandard =
    ratieNetStandard >= 1
      ? <>este de {ratieNetStandard.toFixed(1)}× mai mare decât netul standard calculat la brutul minim ({fmt(netStandardMinim)} lei)</>
      : <>este <strong>sub</strong> netul standard calculat la brutul minim ({fmt(netStandardMinim)} lei), reprezentând {Math.round(ratieNetStandard * 100)}% din acesta</>;

  return (
    <p>
      Pentru un salariu brut de <strong>{fmt(brut)} lei</strong>, reținerile obligatorii ale
      angajatului sunt: <strong>CAS</strong> (pensie, 25%) de {fmt(rez.cas)} lei,{" "}
      <strong>CASS</strong> (sănătate, 10%) de {fmt(rez.cass)} lei și{" "}
      <strong>impozit pe venit</strong> (10%) de {fmt(rez.impozit)} lei.{" "}
      {rez.deducerePersonala > 0 ? (
        <>
          Se aplică o deducere personală de {fmt(rez.deducerePersonala)} lei, care reduce
          impozitul datorat.{" "}
        </>
      ) : (
        <>
          La acest nivel deducerea personală nu se aplică, deoarece brutul depășește plafonul
          de 6.325 lei.{" "}
        </>
      )}
      Rezultă un salariu <strong>net de {fmt(rez.net)} lei</strong>, adică {rez.brutNet}% din brut.
      În plus, angajatorul plătește contribuția CAM de 2,25% ({fmt(rez.cam)} lei), deci{" "}
      <strong>costul total al firmei</strong> pentru acest post este {fmt(rez.costTotal)} lei lunar.
      Ca reper fiscal, acest venit {comparatieNetStandard}. Reperul net este un calcul
      standard, nu o valoare minimă garantată de lege.
    </p>
  );
}

// ─── Componenta paginii ──────────────────────────────────────────────────────

export default async function CalculatorDinamic({ params }: Props) {
  const { valoare } = await params;
  const { brutInitial, modInitial, mod, cifra } = parseSlug(valoare);

  if (mod === "necunoscut") {
    notFound();
  }

  const isNetDinBrut = mod === "net-din-brut";
  const cifraNum = parseInt(cifra, 10);
  const esteCalculIstoricS1 = isCalculIstoricS1(mod, cifra);
  const regimFiscal: RegimFiscalSalariu = esteCalculIstoricS1 ? "2026-S1" : REGIM_FISCAL_CURENT;

  // Calculul fiscal REAL pentru această valoare — sursa unicității conținutului.
  const brutEfectiv = isNetDinBrut
    ? cifraNum
    : brutDinNetStandardCuRegim(cifraNum, regimFiscal);
  const rez = calculStandardCuRegim(brutEfectiv, regimFiscal);
  const linkuriCalculatoare = getCalculatorLinks(
    mod,
    cifraNum,
    isNetDinBrut ? (rez?.net ?? cifraNum) : brutEfectiv,
  );

  const titluDinamic = isNetDinBrut
    ? <>Salariu net pentru <em>{cifra} lei brut</em></>
    : <>Salariu brut pentru <em>{cifra} lei net</em></>;
  const titluText = isNetDinBrut
    ? `Salariu net pentru ${cifra} lei brut${esteCalculIstoricS1 ? " în ianuarie–iunie 2026" : " în 2026"}`
    : `Salariu brut pentru ${cifra} lei net${esteCalculIstoricS1 ? " în ianuarie–iunie 2026" : " în 2026"}`;

  const subtitluDinamic = esteCalculIstoricS1
    ? isNetDinBrut
      ? `Calcul istoric pentru salariul minim de 4.050 lei brut, folosind grila fiscală aplicabilă între 1 ianuarie și 30 iunie 2026: facilitate de 300 lei și deducere raportată la minimul de 4.050 lei.`
      : `Calcul istoric pentru netul standard de 2.574 lei din primul semestru al anului 2026. Brutul corespunzător este 4.050 lei, calculat cu facilitatea de 300 lei și grila fiscală S1.`
    : isNetDinBrut
    ? `Află exact cât reprezintă salariul net pentru suma de ${cifra} lei brut în 2026. Vezi deducerile de CAS, CASS, impozitul pe venit și costul total pentru angajator.`
    : `Află ce salariu brut trebuie să negociezi pentru a primi ${cifra} lei net în mână în 2026. Vezi distribuția exactă a taxelor la stat.`;

  const ctx = isNetDinBrut ? getContextBrut(cifraNum) : getContextNet(cifraNum);

  // Frază introductivă generată din cifrele REALE ale acestei valori — diferită de la
  // o pagină la alta (procent din salariul mediu brut + procent peste salariul minim).
  // Totul rămâne în aceeași unitate (brut lunar) ca restul paginii, ca să nu deruteze.
  // Rolul ei e să ancoreze fiecare pagină în date proprii, astfel încât paginile din
  // aceeași bandă de venit (care împart contextul de categorie) să rămână unice.
  const pctDinIndicatorBugetar = Math.round((brutEfectiv / CASTIG_MEDIU_BRUT_BUGETAR_2026) * 100);
  const pctPesteMinim = Math.round((brutEfectiv / SALARIU_MINIM - 1) * 100);
  const fataDeMinim = esteCalculIstoricS1
    ? <>era exact <Link href="/salariu-minim">salariul minim brut</Link> aplicabil între 1 ianuarie și 30 iunie 2026</>
    : pctPesteMinim < 0
      ? <>este <strong>sub</strong> <Link href="/salariu-minim">salariul minim brut</Link> ({fmt(SALARIU_MINIM)} lei), nivel întâlnit de regulă la contracte cu normă redusă (part-time)</>
      : pctPesteMinim === 0
        ? <>se situează exact la nivelul <Link href="/salariu-minim">salariului minim brut</Link> ({fmt(SALARIU_MINIM)} lei)</>
        : <>este cu <strong>{pctPesteMinim}%</strong> peste <Link href="/salariu-minim">salariul minim brut</Link> ({fmt(SALARIU_MINIM)} lei)</>;

  const leadPozitie = isNetDinBrut ? (
    <>
      Un salariu brut de <strong>{fmt(cifraNum)} lei</strong> reprezintă aproximativ{" "}
      <strong>{pctDinIndicatorBugetar}%</strong> din indicatorul salarial brut de{" "}
      <Link href="/salariu-mediu">{fmt(CASTIG_MEDIU_BRUT_BUGETAR_2026)} lei folosit la bugetul asigurărilor sociale</Link> și {fataDeMinim}.
    </>
  ) : (
    <>
      Pentru a primi <strong>{fmt(cifraNum)} lei</strong> net pe lună, salariul brut negociat trebuie să fie
      aproximativ <strong>{fmt(brutEfectiv)} lei</strong>, adică circa <strong>{pctDinIndicatorBugetar}%</strong> din indicatorul salarial brut de{" "}
      <Link href="/salariu-mediu">{fmt(CASTIG_MEDIU_BRUT_BUGETAR_2026)} lei folosit la bugetul asigurărilor sociale</Link>. Acest brut {fataDeMinim}.
    </>
  );

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
          { "@type": "ListItem", position: 2, name: "Calculator", item: "https://salariile.ro/" },
          { "@type": "ListItem", position: 3, name: `${cifra} lei ${isNetDinBrut ? 'brut' : 'net'}`, item: `https://salariile.ro/calculator/${valoare}` }
        ]
      },
      {
        "@type": "WebPage",
        url: `https://salariile.ro/calculator/${valoare}`,
        name: titluText,
        inLanguage: "ro",
        // Aceeași dată ca lastModified din sitemap — consistența datelor contează
        dateModified: LAST_FISCAL_CONTENT_UPDATE.toISOString().slice(0, 10),
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="bg-canvas">
        <CalculatorSalariu
          brutInitial={brutInitial}
          modInitial={modInitial}
          titluCustom={titluDinamic}
          subtitluCustom={subtitluDinamic}
          regimFiscal={regimFiscal}
        />
      </div>

      {/* Conținut editorial — poziție (categorie) + defalcare reală (unică) */}
      <Section>
          <h2>Ce înseamnă {cifra} lei {isNetDinBrut ? "brut" : "net"}?</h2>
          <p>{leadPozitie}</p>
          <p>{ctx.pozitie}</p>
      </Section>

      {/* Defalcarea fiscală cu cifre reale — unică pentru fiecare valoare */}
      {rez && (
        <Section>
            <h2>
              Defalcarea fiscală pentru {isNetDinBrut ? `${cifra} lei brut` : `un net de ${cifra} lei`}
            </h2>
            {!isNetDinBrut && (
              <p className="source-note">
                Pentru un net de {cifra} lei, salariul brut necesar este aproximativ{" "}
                <strong>{fmt(brutEfectiv)} lei</strong>. Mai jos, defalcarea completă pornind de la acest brut.
              </p>
            )}
            <DefalcareFiscala brut={brutEfectiv} rez={rez} regimFiscal={regimFiscal} />
            <p className="source-note">
              {esteCalculIstoricS1
                ? <>Calcul istoric pentru funcția de bază, fără tichete sau persoane în întreținere, în regimul aplicabil între 1 ianuarie și 30 iunie 2026. Conform Codului Fiscal, HG 1506/2024 și OUG 89/2025.</>
                : <>Calcul standard pentru funcția de bază, fără tichete sau persoane în întreținere. Vezi tabelul interactiv de mai sus pentru scenarii personalizate. Conform Codului Fiscal (Legea 227/2015), HG 146/2026 și OUG 89/2025.</>}
            </p>
        </Section>
      )}

      <Section>
          <h2>Calcule salariale apropiate și repere populare</h2>
          <p>
            Compară această valoare cu salariile învecinate și cu repere pentru care există
            semnal real de căutare. Legăturile rămân în lista editorială verificată, fără
            pagini generate automat pentru fiecare număr posibil.
          </p>
          <ul aria-label="Calcule salariale apropiate">
            {linkuriCalculatoare.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
      </Section>

      <Section>
          <h2>Ce trebuie să știi</h2>
          <p>{ctx.insight}</p>
          <p className="source-note">
            Pentru context legislativ complet, consultă <Link href="/salariu-minim">analiza salariului minim 2026</Link> și <Link href="/salariu-mediu">datele salariale medii</Link>. {esteCalculIstoricS1 ? "Această pagină păstrează regimul fiscal S1 2026." : "Calculul folosește regimul în vigoare din 1 iulie 2026."} Ultima actualizare: 26 iulie 2026.
          </p>
      </Section>
    </>
  );
}
