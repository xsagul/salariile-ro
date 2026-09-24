// app/calculator/[valoare]/page.tsx
// Server Component — FĂRĂ "use client"

import React from "react";
import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { notFound } from "next/navigation";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import { Formula, Section } from "@/app/components/ui";
import {
  brutDinNetStandardCuRegim,
  calculStandard,
  calculStandardCuRegim,
  REGIM_FISCAL_CURENT,
  SALARIU_MINIM,
  SALARIU_MINIM_CONSTRUCTII,
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

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

/** Sufixul de titlu adăugat automat de layout: `%s | Salariile`. */
const BRAND_SUFFIX_LENGTH = " | Salariile".length;
const TITLE_MAX_LENGTH = 60;

/**
 * Rezultatul fiscal REAL al paginii, calculat identic în generateMetadata și în
 * componentă. Cifra rezultat trebuie să apară în title, în description și în
 * paragraful-răspuns, altfel SERP-ul și LLM-urile nu au ce extrage.
 */
function calculPagina(mod: ValidCalculatorMode, cifra: string) {
  const cifraNum = parseInt(cifra, 10);
  const esteCalculIstoricS1 = isCalculIstoricS1(mod, cifra);
  const regimFiscal: RegimFiscalSalariu = esteCalculIstoricS1 ? "2026-S1" : REGIM_FISCAL_CURENT;
  const isNetDinBrut = mod === "net-din-brut";
  const brutEfectiv = isNetDinBrut
    ? cifraNum
    : brutDinNetStandardCuRegim(cifraNum, regimFiscal);
  const rez = calculStandardCuRegim(brutEfectiv, regimFiscal);

  return { cifraNum, esteCalculIstoricS1, regimFiscal, isNetDinBrut, brutEfectiv, rez };
}

type CalculPagina = ReturnType<typeof calculPagina>;

/**
 * Titlu de tip răspuns: „5.000 lei brut în net = 2.981 lei (2026)".
 * Cifra rezultat este în titlu, iar sintagma „brut în net" / „net în brut"
 * acoperă tiparul real de căutare. Brandul rămâne acolo unde titlul complet
 * încape sub 60 de caractere; altfel titlul devine absolut, fără sufix.
 */
function titluSeo(date: CalculPagina) {
  const { cifraNum, isNetDinBrut, brutEfectiv, rez, esteCalculIstoricS1 } = date;
  const rezultat = isNetDinBrut ? (rez?.net ?? 0) : brutEfectiv;
  const directie = isNetDinBrut ? "lei brut în net" : "lei net în brut";
  const perioada = esteCalculIstoricS1 ? "(ian.–iun. 2026)" : "(2026)";
  return `${fmt(cifraNum)} ${directie} = ${fmt(rezultat)} lei ${perioada}`;
}

/** Titlul gata de pus în Metadata: cu brand prin template sau absolut dacă nu încape. */
function metadataTitle(titlu: string): Metadata["title"] {
  return titlu.length + BRAND_SUFFIX_LENGTH <= TITLE_MAX_LENGTH
    ? titlu
    : { absolute: titlu };
}

/**
 * Descriere care începe cu cifra rezultat, nu cu un verb la imperativ, și care
 * conține defalcarea. Un call-to-action nu răspunde intenției query-ului, deci
 * Google îl înlocuiește cu altceva din pagină (în trecut, meniul de navigație).
 */
function descriereSeo(date: CalculPagina) {
  const { cifraNum, isNetDinBrut, brutEfectiv, rez, esteCalculIstoricS1 } = date;
  if (!rez) {
    return `Calcul salariu ${isNetDinBrut ? "net din brut" : "brut din net"} pentru ${fmt(cifraNum)} lei, cu CAS, CASS și impozit pe venit, conform regimului fiscal 2026.`;
  }

  const taxe = `CAS ${fmt(rez.cas)} lei, CASS ${fmt(rez.cass)} lei și impozit ${fmt(rez.impozit)} lei`;

  if (esteCalculIstoricS1) {
    const perioada = "în ianuarie–iunie 2026";
    return isNetDinBrut
      ? `${fmt(rez.net)} lei net rezultau din ${fmt(brutEfectiv)} lei brut ${perioada}: ${taxe}. Cost total angajator: ${fmt(rez.costTotal)} lei.`
      : `${fmt(brutEfectiv)} lei brut corespundeau unui net de ${fmt(cifraNum)} lei ${perioada}: ${taxe}. Cost total angajator: ${fmt(rez.costTotal)} lei.`;
  }

  return isNetDinBrut
    ? `${fmt(rez.net)} lei net rămân din ${fmt(cifraNum)} lei brut în 2026, după ${taxe}. Cost total angajator: ${fmt(rez.costTotal)} lei pe lună.`
    : `${fmt(brutEfectiv)} lei brut sunt necesari pentru ${fmt(cifraNum)} lei net în 2026, cu ${taxe}. Cost total angajator: ${fmt(rez.costTotal)} lei pe lună.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { valoare } = await params;
  const { mod, cifra } = parseSlug(valoare);

  if (mod === "necunoscut") {
    notFound();
  }

  const date = calculPagina(mod, cifra);
  const titlu = titluSeo(date);
  const description = descriereSeo(date);

  return {
    title: metadataTitle(titlu),
    description,
    alternates: { canonical: `https://salariile.ro/calculator/${valoare}` },
    openGraph: ogPage({ title: titlu, description, path: `/calculator/${valoare}` }),
    twitter: twPage({ title: titlu, description }),
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

// ─── O singură observație utilă, după unde cade suma ─────────────────────────
// Rescris pe 24 septembrie 2026: paginile comparau suma cu indicatorul BASS și
// cu „netul standard la brutul minim", cifre care nu răspundeau la nimic din ce
// căutase omul. Acum rămâne o frază, doar când spune ceva ce tabelul nu spune.

const PLAFON_DEDUCERE = SALARIU_MINIM + 2000;
const REZULTAT_MINIM_S1_2026 = calculStandardCuRegim(4050, "2026-S1");
const NET_MINIM_S1_2026 = REZULTAT_MINIM_S1_2026?.net ?? 2574;
const REZULTAT_MINIM_CURENT = calculStandard(SALARIU_MINIM);

function observatieBrut(v: number): React.ReactNode {
  if (v === 4050) {
    return <>Acesta a fost <Link href="/salariu-minim">salariul minim</Link> până la 30 iunie 2026. Calculul folosește regulile de atunci, cu o facilitate de 300 lei netaxați. Din iulie, minimul e {fmt(SALARIU_MINIM)} lei brut.</>;
  }
  if (v < SALARIU_MINIM) {
    return <>Suma e sub <Link href="/salariu-minim">salariul minim</Link>, deci e legală doar la un contract part-time. Pentru calculul corect, cu contribuțiile completate de firmă, folosește <Link href="/calculator-salariu-part-time">calculatorul de part-time</Link>.</>;
  }
  if (v === SALARIU_MINIM) {
    return <>E <Link href="/salariu-minim">salariul minim</Link> din 1 iulie 2026. La normă întreagă și la locul de muncă de bază, 200 de lei din brut nu se taxează deloc, de aceea netul iese relativ mare.</>;
  }
  if (v === SALARIU_MINIM_CONSTRUCTII) {
    return <>E <Link href="/salariu-minim-constructii-2026">salariul minim din construcții</Link>. Se taxează ca orice salariu: scutirea de 200 de lei e doar pentru minimul general.</>;
  }
  if (v <= PLAFON_DEDUCERE) {
    return <>Sub {fmt(PLAFON_DEDUCERE)} lei brut primești <Link href="/deducere-personala-2026">deducerea personală</Link>. Cu persoane în întreținere, e mai mare și netul crește: le bifezi în opțiunile avansate de sus.</>;
  }
  return <>Peste {fmt(PLAFON_DEDUCERE)} lei brut nu mai există deducere personală, așa că netul e mereu 58,5% din brut, oricât de mare ar fi salariul. Doar tichetele sau o scutire de impozit îl mai schimbă.</>;
}

function observatieNet(v: number): React.ReactNode {
  const netMinim = REZULTAT_MINIM_CURENT?.net ?? 0;
  if (v === NET_MINIM_S1_2026) {
    return <>Acesta a fost netul la salariul minim până la 30 iunie 2026. Calculul folosește regulile de atunci, cu o facilitate de 300 lei netaxați.</>;
  }
  if (v < netMinim) {
    return <>Suma e sub netul de la <Link href="/salariu-minim">salariul minim</Link>, deci e posibilă doar la un contract part-time. Vezi <Link href="/calculator-salariu-part-time">calculatorul de part-time</Link>.</>;
  }
  if (v === netMinim) {
    return <>E netul de la <Link href="/salariu-minim">salariul minim</Link> din 1 iulie 2026.</>;
  }
  return <>Când negociezi pe net, cere ca în contract să fie trecut brutul. Taxele se pot schimba, iar atunci netul se schimbă odată cu ele. Brutul din contract rămâne.</>;
}

// ─── Formula cu cifrele acestei pagini ───────────────────────────────────────

function randuriFormula(brut: number, rez: Rezultat): string[] {
  const baza = brut - rez.facilitate;
  const bazaImpozit = baza - rez.cas - rez.cass;
  const randuri: string[] = [];
  if (rez.facilitate > 0) {
    randuri.push(`Bază    = ${fmt(brut)} − ${fmt(rez.facilitate)} netaxați = ${fmt(baza)}`);
  }
  randuri.push(`CAS     = ${fmt(baza)} × 25% = ${fmt(rez.cas)}`);
  randuri.push(`CASS    = ${fmt(baza)} × 10% = ${fmt(rez.cass)}`);
  randuri.push(
    rez.deducerePersonala > 0
      ? `Impozit = (${fmt(bazaImpozit)} − ${fmt(rez.deducerePersonala)} deducere) × 10% = ${fmt(rez.impozit)}`
      : `Impozit = ${fmt(bazaImpozit)} × 10% = ${fmt(rez.impozit)}`,
  );
  randuri.push(`Net     = ${fmt(brut)} − ${fmt(rez.cas)} − ${fmt(rez.cass)} − ${fmt(rez.impozit)} = ${fmt(rez.netBani)} lei`);
  return randuri;
}

// ─── Componenta paginii ──────────────────────────────────────────────────────

export default async function CalculatorDinamic({ params }: Props) {
  const { valoare } = await params;
  const { brutInitial, modInitial, mod, cifra } = parseSlug(valoare);

  if (mod === "necunoscut") {
    notFound();
  }

  const date = calculPagina(mod, cifra);
  const { cifraNum, esteCalculIstoricS1, regimFiscal, isNetDinBrut, brutEfectiv, rez } = date;

  const linkuriCalculatoare = getCalculatorLinks(
    mod,
    cifraNum,
    isNetDinBrut ? (rez?.net ?? cifraNum) : brutEfectiv,
  );

  // H1 și <title> spun același lucru: întrebarea ȘI răspunsul, cu cifra.
  const titluText = titluSeo(date);
  const rezultatH1 = isNetDinBrut ? (rez?.net ?? 0) : brutEfectiv;
  const titluDinamic = isNetDinBrut
    ? <>{fmt(cifraNum)} lei brut în net = <em>{fmt(rezultatH1)} lei</em></>
    : <>{fmt(cifraNum)} lei net în brut = <em>{fmt(rezultatH1)} lei</em></>;

  // Paragraful-răspuns de deasupra calculatorului: cifra și taxele, într-o frază
  // care se poate cita singură (featured snippets, LLM-uri). E răspunsul la
  // căutare, deci singurul loc de pe pagină unde taxele apar în proză.
  const perioadaFraza = esteCalculIstoricS1 ? "între 1 ianuarie și 30 iunie 2026" : "în 2026";
  const subtitluDinamic = rez ? (
    isNetDinBrut ? (
      <>
        Din <strong>{fmt(cifraNum)} lei brut</strong> îți rămân <strong>{fmt(rez.net)} lei net</strong>{" "}
        {perioadaFraza}. Se opresc CAS {fmt(rez.cas)} lei, CASS {fmt(rez.cass)} lei și impozit {fmt(rez.impozit)} lei,
        iar costul total al angajatorului e <strong>{fmt(rez.costTotal)} lei</strong> pe lună.
      </>
    ) : (
      <>
        Ca să primești <strong>{fmt(cifraNum)} lei net</strong> {perioadaFraza}, ai nevoie de{" "}
        <strong>{fmt(brutEfectiv)} lei brut</strong>. Din el se opresc CAS {fmt(rez.cas)} lei, CASS {fmt(rez.cass)} lei
        și impozit {fmt(rez.impozit)} lei, iar costul total al angajatorului e <strong>{fmt(rez.costTotal)} lei</strong>.
      </>
    )
  ) : (
    descriereSeo(date)
  );

  const observatie = isNetDinBrut ? observatieBrut(cifraNum) : observatieNet(cifraNum);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
          { "@type": "ListItem", position: 2, name: "Calculator", item: "https://salariile.ro/" },
          { "@type": "ListItem", position: 3, name: `${fmt(cifraNum)} lei ${isNetDinBrut ? 'brut' : 'net'}`, item: `https://salariile.ro/calculator/${valoare}` }
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

      {rez && (
        <Section>
          <h2>Cum se ajunge la {isNetDinBrut ? `${fmt(rez.netBani)} lei net` : `${fmt(brutEfectiv)} lei brut`}</h2>
          <p>
            Din brut se opresc 25% pentru pensie și 10% pentru sănătate, apoi impozitul de 10% pe ce rămâne
            {rez.deducerePersonala > 0 ? ", după deducerea personală" : ""}.
          </p>
          <Formula eticheta={`Calculul pentru ${fmt(brutEfectiv)} lei brut`} randuri={randuriFormula(brutEfectiv, rez)} />
          <p>{observatie}</p>
          <p className="source-note">
            {esteCalculIstoricS1
              ? "Pentru ianuarie–iunie 2026, la locul de muncă de bază, fără tichete sau persoane în întreținere."
              : "La locul de muncă de bază, fără tichete sau persoane în întreținere. Pentru situația ta, folosește opțiunile avansate de sus."}
          </p>
        </Section>
      )}

      <Section>
        <h2>Alte sume căutate des</h2>
        <ul aria-label="Calcule salariale apropiate">
          {linkuriCalculatoare.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
