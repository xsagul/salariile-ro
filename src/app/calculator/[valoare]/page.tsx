// Server Component — FĂRĂ "use client"
// Next.js calculează brutInitial și modInitial pe SERVER
// → rezultatul apare în HTML → Google îl vede ✅

import type { Metadata } from "next";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";

// 1. Props devine Promise
interface Props {
  params: Promise<{ valoare: string }>;
}

// ─── Meta tags dinamice per pagină ───────────────────────────────────────────

// 2. generateMetadata devine async
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { valoare } = await params;  // ← await
  const { mod, cifra } = parseSlug(valoare);

  if (mod === "net-din-brut") {
    return {
      title: `Salariu net pentru ${cifra} lei brut în 2026`,
      description: `Calculează instant salariul net pentru ${cifra} lei brut. Află cât reții după CAS, CASS și impozit pe venit.`,
      alternates: { canonical: `https://salariile.ro/calculator/${valoare}` },
      openGraph: {                                          // ← adaugă de aici
        title: `Salariu net pentru ${cifra} lei brut în 2026`,
        description: `Calculează instant salariul net pentru ${cifra} lei brut.`,
        url: `https://salariile.ro/calculator/${valoare}`,
      },                                                    // ← până aici
    };
  }

  if (mod === "brut-din-net") {
    return {
      title: `Salariu brut pentru ${cifra} lei net în 2026`,
      description: `Calculează instant salariul brut corespunzător unui net de ${cifra} lei. Formula inversă CAS, CASS, impozit.`,
      alternates: { canonical: `https://salariile.ro/calculator/${valoare}` },
      openGraph: {                                          // ← adaugă de aici
        title: `Salariu brut pentru ${cifra} lei net în 2026`,
        description: `Calculează instant salariul brut corespunzător unui net de ${cifra} lei.`,
        url: `https://salariile.ro/calculator/${valoare}`,
      },                                                    // ← până aici
    };
  }

  return {
    title: "Calculator Salariu Net 2026",
    description: "Calculator salariu net din brut pentru România, actualizat 2026.",
  };
}

// ─── Parser slug ─────────────────────────────────────────────────────────────

function parseSlug(slug: string): {
  valoare: string;
  mod: "net-din-brut" | "brut-din-net" | "necunoscut";
  cifra: string;
  brutInitial: string;
  modInitial: "brut" | "net";
} {
  // Format: calcul-salariu-net-4050-brut  → arată net pornind de la brut
  const matchNetDinBrut = slug?.match(/^calcul-salariu-net-(\d+)-brut$/);
  if (matchNetDinBrut) {
    return {
      valoare: slug,
      mod: "net-din-brut",
      cifra: matchNetDinBrut[1],
      brutInitial: matchNetDinBrut[1],
      modInitial: "brut",
    };
  }

  // Format: calcul-salariu-brut-2574-net  → arată brut pornind de la net
  const matchBrutDinNet = slug?.match(/^calcul-salariu-brut-(\d+)-net$/);
  if (matchBrutDinNet) {
    return {
      valoare: slug,
      mod: "brut-din-net",
      cifra: matchBrutDinNet[1],
      brutInitial: matchBrutDinNet[1],
      modInitial: "net",
    };
  }

  return { valoare: slug, mod: "necunoscut", cifra: "", brutInitial: "", modInitial: "brut" };
}

// ─── Pagina ───────────────────────────────────────────────────────────────────

export default async function CalculatorDinamic({ params }: Props) {
  const { valoare } = await params;  // ← await
  const { brutInitial, modInitial } = parseSlug(valoare);
  return <CalculatorSalariu brutInitial={brutInitial} modInitial={modInitial} />;
}
