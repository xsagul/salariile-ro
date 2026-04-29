// app/calculator/[valoare]/page.tsx
// Server Component — FĂRĂ "use client"

import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";

interface Props {
  params: Promise<{ valoare: string }>;
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

export default async function CalculatorDinamic({ params }: Props) {
  const { valoare } = await params;
  const { brutInitial, modInitial, mod, cifra } = parseSlug(valoare);

  if (mod === "necunoscut") {
    notFound(); 
  }

  const isNetDinBrut = mod === "net-din-brut";
  
  // 1. Creăm Titlurile și Subtitlurile specifice acestei pagini (H1 Unic)
  const titluDinamic = isNetDinBrut
    ? <>Salariu net pentru <em>{cifra} lei brut</em></>
    : <>Salariu brut pentru <em>{cifra} lei net</em></>;

  const subtitluDinamic = isNetDinBrut
    ? `Află exact cât reprezintă salariul net pentru suma de ${cifra} lei brut în 2026. Vezi deducerile de CAS, CASS, impozitul pe venit și costul total pentru angajator.`
    : `Află ce salariu brut trebuie să negociezi pentru a primi ${cifra} lei net în mână în 2026. Vezi distribuția exactă a taxelor la stat.`;

  // 2. Creăm schema de navigare Breadcrumb pentru vizibilitate Google
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
      <CalculatorSalariu 
        brutInitial={brutInitial} 
        modInitial={modInitial}
        titluCustom={titluDinamic}
        subtitluCustom={subtitluDinamic}
        ascundeInfoFiscale={true}
      />
    </>
  );
}