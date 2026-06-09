// app/calculator/[valoare]/page.tsx
// Server Component — FĂRĂ "use client"

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import { Section } from "@/app/components/ui";
import { calculStandard, brutDinNetStandard, SALARIU_MINIM, type Rezultat } from "@/lib/fiscal";
import { allCalculatorSlugs } from "@/lib/seo";

interface Props {
  params: Promise<{ valoare: string }>;
}

export function generateStaticParams() {
  return allCalculatorSlugs().map((valoare) => ({ valoare }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { valoare } = await params;
  const { mod, cifra } = parseSlug(valoare);

  if (mod === "necunoscut") {
    notFound();
  }

  if (mod === "net-din-brut") {
    return {
      title: `Salariu net pentru ${cifra} lei brut în 2026`,
      description: `Calculează instant salariul net pentru ${cifra} lei brut. Află cât reții după CAS, CASS și impozit pe venit.`,
      alternates: { canonical: `https://salariile.ro/calculator/${valoare}` },
      openGraph: {
        title: `Salariu net pentru ${cifra} lei brut în 2026`,
        description: `Calculează instant salariul net pentru ${cifra} lei brut.`,
        url: `https://salariile.ro/calculator/${valoare}`,
      },
    };
  }

  if (mod === "brut-din-net") {
    return {
      title: `Salariu brut pentru ${cifra} lei net în 2026`,
      description: `Calculează instant salariul brut corespunzător unui net de ${cifra} lei. Formula inversă CAS, CASS, impozit.`,
      alternates: { canonical: `https://salariile.ro/calculator/${valoare}` },
      openGraph: {
        title: `Salariu brut pentru ${cifra} lei net în 2026`,
        description: `Calculează instant salariul brut corespunzător unui net de ${cifra} lei.`,
        url: `https://salariile.ro/calculator/${valoare}`,
      },
    };
  }

  return {
    title: "Calculator Salariu Net 2026",
    description: "Calculator salariu net din brut pentru România, actualizat 2026.",
  };
}

function parseSlug(slug: string): {
  valoare: string;
  mod: "net-din-brut" | "brut-din-net" | "necunoscut";
  cifra: string;
  brutInitial: string;
  modInitial: "brut" | "net";
} {
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

// ─── Context editorial per tranșă salarială ──────────────────────────────────
// Aceste 3 secțiuni (poziție, sectoare, insight) sunt informații de NIVEL DE
// CATEGORIE — legitim partajate de salariile din aceeași bandă. Unicitatea per
// pagină vine din secțiunea "Defalcare fiscală", care folosește cifrele REALE
// calculate de modulul fiscal (diferite pentru fiecare valoare).

type Context = {
  pozitie: React.ReactNode;
  sectoare: string[];
  insight: React.ReactNode;
};

function getContextBrut(v: number): Context {
  if (v === 4325) {
    return {
      pozitie: <>Brutul de <strong>4.325 lei</strong> este exact <Link href="/salariu-minim">salariul minim brut pe economie</Link> în vigoare din 1 iulie 2026, conform HG 146/2026. Conform datelor INS, peste 1,2 milioane de salariați din România sunt plătiți la acest nivel — aproximativ 25% din totalul forței de muncă salariate.</>,
      sectoare: ["Comerț cu amănuntul (vânzători, casieri)", "HoReCa (ospătari, bucătari ajutor)", "Curățenie și mentenanță", "Producție necalificată", "Agricultură și industria alimentară", "Securitate și pază"],
      insight: <>Dacă ești plătit la salariul minim, verifică pe fluturaș dacă angajatorul aplică corect facilitatea OUG 89/2025 de 200 lei netaxabili. Mulți angajatori o omit, ceea ce rezultă în net mai mic cu ~80–100 lei lunar. Vezi <Link href="/salariu-minim">analiza completă a salariului minim</Link> pentru toate plafoanele și obligațiile aplicabile.</>,
    };
  }

  if (v === 4050) {
    return {
      pozitie: <>Brutul de <strong>4.050 lei</strong> a fost <Link href="/salariu-minim">salariul minim brut pe economie</Link> în prima jumătate a anului 2026, conform HG 1506/2024. Din 1 iulie 2026, minimul a crescut la 4.325 lei (HG 146/2026). Conform datelor INS, peste 1,2 milioane de salariați din România au fost plătiți la acest nivel — aproximativ 25% din totalul forței de muncă salariate.</>,
      sectoare: ["Comerț cu amănuntul (vânzători, casieri)", "HoReCa (ospătari, bucătari ajutor)", "Curățenie și mentenanță", "Producție necalificată", "Agricultură și industria alimentară", "Securitate și pază"],
      insight: <>Dacă ești plătit la salariul minim din iulie 2026, brutul corect este 4.325 lei (nu 4.050). Verifică pe fluturaș facilitatea OUG 89/2025 de 200 lei netaxabili. Vezi <Link href="/salariu-minim">analiza completă a salariului minim</Link> pentru toate plafoanele și obligațiile aplicabile.</>,
    };
  }

  if (v >= 4051 && v <= 5500) {
    return {
      pozitie: <>Brutul de <strong>{fmt(v)} lei</strong> se situează <em>imediat deasupra <Link href="/salariu-minim">salariului minim</Link></em> (4.325 lei din iulie 2026) și sub mediana salariilor din economia României, estimată la aproximativ 5.500–6.000 lei brut. Este un nivel întâlnit la posturi de început în sectorul privat, personal calificat fără experiență sau roluri operaționale standard.</>,
      sectoare: ["Asistent administrativ, secretariat", "Casier-vânzător cu experiență", "Operator producție calificat", "Personal medical auxiliar", "Recepționer, agent contact center", "Coordonator de tură în retail"],
      insight: <>Pentru această tranșă, salariații cu copii minori școlari sau persoane în întreținere beneficiază de deduceri suplimentare semnificative (până la 30–45% din salariul minim). Folosește opțiunile avansate ale calculatorului pentru a vedea netul corect ținând cont de situația ta familială.</>,
    };
  }

  if (v >= 5501 && v <= 7500) {
    return {
      pozitie: <>Brutul de <strong>{fmt(v)} lei</strong> se situează în zona mediană a salariilor din economia României. La acest nivel se găsesc majoritatea posturilor administrative, comerciale și operaționale cu 2–5 ani experiență. O parte importantă dintre salariații cu studii superioare sunt remunerați în această bandă.</>,
      sectoare: ["Specialist marketing, comunicare", "Contabil cu experiență", "Reprezentant vânzări B2B", "Inginer junior (non-IT)", "Coordonator proiect", "Specialist HR, recrutare"],
      insight: <>La acest nivel salarial, negocierea pe net e mai relevantă decât pe brut. Folosește <Link href="/">calculatorul în mod „din net în brut”</Link> pentru a afla exact ce brut îți garantează netul dorit, ținând cont de toate variabilele fiscale (funcție de bază, copii, vârstă sub 26 ani).</>,
    };
  }

  if (v >= 7501 && v <= 10000) {
    return {
      pozitie: <>Brutul de <strong>{fmt(v)} lei</strong> se apropie sau se egalează cu <Link href="/salariu-mediu">salariul mediu brut pe economie</Link> (9.192 lei în 2026, conform Legii 44/2026). Reprezintă nivelul tipic pentru specialiști cu studii superioare și 3–5 ani experiență, middle management în firme medii sau roluri tehnice intermediare în industrie.</>,
      sectoare: ["Specialist IT junior, QA", "Inginer cu 3–5 ani experiență", "Team lead (echipe mici)", "Specialist financiar-contabil", "Project Manager junior", "Specialist juridic, fiscal"],
      insight: <>În această tranșă, beneficiile extrasalariale (tichete de masă, asigurare medicală privată, bonusuri de performanță) pot adăuga 10–15% la valoarea netă efectivă. Folosește câmpul „tichete de masă” din calculator pentru a vedea impactul real, ținând cont că tichetele sunt supuse CASS și impozit pe venit din 2024.</>,
    };
  }

  if (v >= 10001 && v <= 15000) {
    return {
      pozitie: <>Brutul de <strong>{fmt(v)} lei</strong> depășește <Link href="/salariu-mediu">salariul mediu pe economie</Link> (9.192 lei) și se situează în topul 20% al salariilor din România. Acest nivel este comun pentru specialiști IT cu experiență, roluri senior în finanțe, consultanță sau management de proiecte complexe.</>,
      sectoare: ["Specialist IT mid-level (3–7 ani)", "Senior accountant, controller", "Project Manager cu experiență", "Specialist banking, asigurări", "Consultant fiscal, juridic", "Manager comercial regional"],
      insight: <>Începând cu 2025, scutirile fiscale pentru sectorul IT au fost eliminate (OUG 156/2024) — salariații din IT plătesc acum impozit standard 10%. Pentru salarii peste 10.000 lei brut, compară costul unui contract de muncă față de un contract PFA: diferența fiscală poate ajunge la 20–30%, dar cu pierdere de beneficii sociale (concediu medical, șomaj, pensie).</>,
    };
  }

  // v > 15000
  return {
    pozitie: <>Brutul de <strong>{fmt(v)} lei</strong> se situează în topul 10% al salariilor din economia României. Este nivelul tipic pentru roluri senior și executive: senior software engineers, architecți IT, directori de departament, parteneri în firme de consultanță sau specialiști cu expertiză rară pe piață.</>,
    sectoare: ["Senior Software Engineer / Architect", "Tech Lead, Engineering Manager", "Director financiar, juridic", "Senior consultant (Big4)", "Specialist data science, AI", "Head of department (firme mari)"],
    insight: <>Pentru salariile peste 15.000 lei brut, structurile alternative (PFA, microîntreprindere până la 500.000 € cifră afaceri, contractor internațional) pot oferi optimizare fiscală semnificativă. Atenție însă la pierderea drepturilor de asigurări sociale, concediu medical/odihnă plătit și protecția Codului Muncii.</>,
  };
}

function getContextNet(v: number): Context {
  if (v >= 2500 && v <= 2750) {
    return {
      pozitie: <>Netul de <strong>{fmt(v)} lei</strong> corespunde aproximativ <Link href="/salariu-minim">salariului minim pe economie</Link>: din iulie 2026, minimul net este 2.699 lei (la un brut de 4.325 lei). Acest nivel reprezintă pragul legal minim pe care îl poate primi în mână un angajat cu normă întreagă.</>,
      sectoare: ["Comerț cu amănuntul", "HoReCa entry-level", "Curățenie, mentenanță", "Producție necalificată", "Agricultură", "Securitate, pază"],
      insight: <>Dacă ai un net sub 2.699 lei lucrând cu normă întreagă, există o problemă — fie nu primești corect facilitatea de 200 lei (OUG 89/2025), fie angajatorul nu aplică deducerea personală. Verifică fluturașul și solicită clarificări. Vezi și <Link href="/salariu-minim">drepturile complete asociate salariului minim</Link>.</>,
    };
  }

  if (v >= 2751 && v <= 3500) {
    return {
      pozitie: <>Netul de <strong>{fmt(v)} lei</strong> se situează imediat deasupra <Link href="/salariu-minim">salariului minim net</Link> (2.699 lei din iulie 2026). Este nivelul tipic pentru posturi entry-level peste salariul minim, lucrători calificați cu puțină experiență sau personal auxiliar cu sporuri.</>,
      sectoare: ["Vânzător-casier cu experiență", "Asistent administrativ", "Operator producție calificat", "Recepționer", "Asistent medical debutant", "Personal HoReCa cu experiență"],
      insight: <>Negocierea pe net este recomandată: în 2026, schimbările legislative (OUG 156/2024 pentru IT/construcții, modificări la facilități) au făcut ca același brut să producă neturi diferite de la o lună la alta. Verifică pe <Link href="/">calculator</Link> netul exact pentru orice ofertă primită.</>,
    };
  }

  if (v >= 3501 && v <= 4750) {
    return {
      pozitie: <>Netul de <strong>{fmt(v)} lei</strong> este în jurul medianei salariilor nete din economia României. La acest nivel se situează majoritatea posturilor cu studii medii sau superioare la început de carieră, în sectoare precum administrație, comerț, servicii financiare junior sau marketing.</>,
      sectoare: ["Specialist marketing, comunicare", "Contabil junior", "Reprezentant vânzări", "Specialist HR junior", "Coordonator administrativ", "Inginer non-IT debutant"],
      insight: <>Pentru această tranșă, persoanele în întreținere și copiii minori școlari pot crește semnificativ netul prin deducere personală suplimentară. Verifică în calculator opțiunile avansate — diferența poate ajunge la 100–200 lei net lunar în plus.</>,
    };
  }

  if (v >= 4751 && v <= 6000) {
    return {
      pozitie: <>Netul de <strong>{fmt(v)} lei</strong> se apropie de <Link href="/salariu-mediu">salariul mediu net pe economie</Link> (~5.377 lei în 2026). Este nivelul tipic pentru specialiști cu experiență, middle management în firme medii sau roluri tehnice intermediare.</>,
      sectoare: ["IT specialist junior-mid", "Inginer cu 3–5 ani experiență", "Team lead echipe mici", "Specialist financiar-contabil senior", "Project Manager junior", "Specialist juridic, fiscal"],
      insight: <>În această tranșă, beneficiile suplimentare (tichete de masă, asigurare privată, bonusuri) pot reprezenta 10–15% din pachetul total. Tichetele de masă sunt supuse CASS și impozit pe venit din 2024 — folosește calculatorul cu câmpul „tichete” pentru cifra reală.</>,
    };
  }

  // v >= 6001
  return {
    pozitie: <>Netul de <strong>{fmt(v)} lei</strong> depășește <Link href="/salariu-mediu">salariul mediu net pe economie</Link> (~5.377 lei) și se situează în topul 25% al salariilor din România. La acest nivel se găsesc specialiștii IT seniori, roluri de coordonare, consultanți cu experiență sau personal cu competențe rare.</>,
    sectoare: ["IT specialist senior, architect", "Senior Project Manager", "Specialist banking, fonduri UE", "Consultant Big4", "Manager regional", "Specialist data, BI senior"],
    insight: <>Pentru salariile mari, comparația contract individual de muncă vs. PFA cu normă întreagă merită analizată. PFA poate oferi optimizare fiscală până la 15–25%, cu pierdere de beneficii (concediu medical, șomaj, contribuții la pensie). Folosește calculatorul nostru pentru cifra exactă pe contract de muncă.</>,
  };
}

// ─── Defalcare fiscală cu CIFRE REALE — unică per pagină ──────────────────────
// Folosește rezultatul calculat de modulul fiscal: fiecare valoare produce
// numere complet diferite (CAS, CASS, impozit, net, CAM, cost) → conținut unic.

function DefalcareFiscala({ brut, rez }: { brut: number; rez: Rezultat }) {
  const fataDeMinimNet = (rez.net / 2699).toFixed(1);
  const fataDeMediuNet = Math.round((rez.net / 5377) * 100);

  return (
    <p>
      Pentru un salariu brut de <strong>{fmt(brut)} lei</strong>, reținerile obligatorii ale
      angajatului sunt: <strong>CAS</strong> (pensie, 25%) — {fmt(rez.cas)} lei,{" "}
      <strong>CASS</strong> (sănătate, 10%) — {fmt(rez.cass)} lei și{" "}
      <strong>impozit pe venit</strong> (10%) — {fmt(rez.impozit)} lei.{" "}
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
      Rezultă un salariu <strong>net de {fmt(rez.net)} lei</strong> — adică {rez.brutNet}% din brut.
      În plus, angajatorul plătește contribuția CAM de 2,25% ({fmt(rez.cam)} lei), deci{" "}
      <strong>costul total al firmei</strong> pentru acest post este {fmt(rez.costTotal)} lei lunar.
      Față de salariul minim net (2.699 lei) acest venit este de {fataDeMinimNet}× mai mare și
      reprezintă {fataDeMediuNet}% din <Link href="/salariu-mediu">salariul mediu net pe economie</Link>.
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

  // Calculul fiscal REAL pentru această valoare — sursa unicității conținutului.
  const brutEfectiv = isNetDinBrut ? cifraNum : brutDinNetStandard(cifraNum);
  const rez = calculStandard(brutEfectiv);

  const titluDinamic = isNetDinBrut
    ? <>Salariu net pentru <em>{cifra} lei brut</em></>
    : <>Salariu brut pentru <em>{cifra} lei net</em></>;

  const subtitluDinamic = isNetDinBrut
    ? `Află exact cât reprezintă salariul net pentru suma de ${cifra} lei brut în 2026. Vezi deducerile de CAS, CASS, impozitul pe venit și costul total pentru angajator.`
    : `Află ce salariu brut trebuie să negociezi pentru a primi ${cifra} lei net în mână în 2026. Vezi distribuția exactă a taxelor la stat.`;

  const ctx = isNetDinBrut ? getContextBrut(cifraNum) : getContextNet(cifraNum);

  // Frază introductivă generată din cifrele REALE ale acestei valori — diferită de la
  // o pagină la alta (procent din salariul mediu brut + procent peste salariul minim).
  // Totul rămâne în aceeași unitate (brut lunar) ca restul paginii, ca să nu deruteze.
  // Rolul ei e să ancoreze fiecare pagină în date proprii, astfel încât paginile din
  // aceeași bandă de venit (care împart contextul de categorie) să rămână unice.
  const SALARIU_MEDIU_BRUT = 9192;
  const pctDinMediuBrut = Math.round((brutEfectiv / SALARIU_MEDIU_BRUT) * 100);
  const pctPesteMinim = Math.round((brutEfectiv / SALARIU_MINIM - 1) * 100);
  const fataDeMinim = pctPesteMinim <= 0
    ? <>se situează la nivelul <Link href="/salariu-minim">salariului minim brut</Link> ({fmt(SALARIU_MINIM)} lei)</>
    : <>este cu <strong>{pctPesteMinim}%</strong> peste <Link href="/salariu-minim">salariul minim brut</Link> ({fmt(SALARIU_MINIM)} lei)</>;

  const leadPozitie = isNetDinBrut ? (
    <>
      Un salariu brut de <strong>{fmt(cifraNum)} lei</strong> reprezintă aproximativ{" "}
      <strong>{pctDinMediuBrut}%</strong> din{" "}
      <Link href="/salariu-mediu">salariul mediu brut pe economie</Link> ({fmt(SALARIU_MEDIU_BRUT)} lei) și {fataDeMinim}.
    </>
  ) : (
    <>
      Pentru a primi <strong>{fmt(cifraNum)} lei</strong> net pe lună, salariul brut negociat trebuie să fie
      aproximativ <strong>{fmt(brutEfectiv)} lei</strong> — adică circa <strong>{pctDinMediuBrut}%</strong> din{" "}
      <Link href="/salariu-mediu">salariul mediu brut pe economie</Link> ({fmt(SALARIU_MEDIU_BRUT)} lei). Acest brut {fataDeMinim}.
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
        />
      </div>

      {/* Conținut editorial — poziție (categorie) + defalcare reală (unică) */}
      <Section>
          <h2>Cine câștigă {cifra} lei {isNetDinBrut ? "brut" : "net"}?</h2>
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
            <DefalcareFiscala brut={brutEfectiv} rez={rez} />
            <p className="source-note">
              Calcul standard pentru funcția de bază, fără tichete sau persoane în întreținere. Vezi
              tabelul interactiv de mai sus pentru scenarii personalizate. Conform Codului Fiscal
              (Legea 227/2015), HG 146/2026 și OUG 89/2025.
            </p>
        </Section>
      )}

      <Section>
          <h2>Sectoare și roluri tipice</h2>
          <p>La nivelul de {cifra} lei {isNetDinBrut ? "brut" : "net"}, posturile întâlnite frecvent pe piața muncii din România includ:</p>
          <ul>
            {ctx.sectoare.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
          <p className="source-note">Lista este indicativă, pe baza datelor INS privind distribuția salarială pe sectoare CAEN și a rapoartelor publice ale firmelor de recrutare (Hipo, eJobs) pentru anul 2026.</p>
      </Section>

      <Section>
          <h2>Ce trebuie să știi</h2>
          <p>{ctx.insight}</p>
          <p className="source-note">
            Pentru context legislativ complet, consultă <Link href="/salariu-minim">analiza salariului minim 2026</Link> și <Link href="/salariu-mediu">salariul mediu pe economie</Link>. Calculul de pe această pagină respectă HG 146/2026, OUG 89/2025 și Codul Fiscal (Legea 227/2015) — ultima actualizare: 8 iunie 2026.
          </p>
      </Section>
    </>
  );
}
