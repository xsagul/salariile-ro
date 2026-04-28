// src/app/page.tsx
// Homepage — Server Component cu schema JSON-LD complet:
// - WebApplication (calculatorul ca app)
// - FAQPage (întrebări frecvente)
// - Organization (brand authority)

import CalculatorSalariu from "@/app/components/CalculatorSalariu";

const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://salariile.ro/#organization",
      name: "Salariile.ro",
      url: "https://salariile.ro",
      logo: {
        "@type": "ImageObject",
        url: "https://salariile.ro/og-image.png",
      },
    },
    {
      "@type": "WebApplication",
      "@id": "https://salariile.ro/#calculator",
      name: "Calculator Salariu Net România",
      url: "https://salariile.ro/",
      description:
        "Calculator salariu net din brut pentru România. Actualizat conform legislației fiscale în vigoare: HG 146/2026, OUG 89/2025.",
      applicationCategory: "FinanceApplication",
      operatingSystem: "All",
      offers: { "@type": "Offer", price: "0", priceCurrency: "RON" },
      publisher: { "@id": "https://salariile.ro/#organization" },
      featureList: [
        "Calcul net din brut",
        "Calcul brut din net",
        "Sectoare: Standard, IT, Construcții",
        "Deducere personală automată",
        "Cost total angajator",
        "Tichete de masă",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Cum se calculează salariul net din brut în România?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Din salariul brut se rețin contribuțiile obligatorii: CAS (25% pentru pensie), CASS (10% pentru sănătate) și impozitul pe venit (10%). Pentru veniturile sub 6.050 lei brut se aplică o deducere personală care reduce baza de calcul a impozitului. Formula simplificată: Net = Brut − CAS − CASS − Impozit (calculat pe baza redusă cu deducerea).",
          },
        },
        {
          "@type": "Question",
          name: "Care este salariul minim brut în România în 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Salariul minim brut pe economie este 4.050 lei până la 30 iunie 2026 și 4.325 lei începând cu 1 iulie 2026, conform HG 146/2026. Salariul net corespunzător este 2.574 lei (semestrul I) și aproximativ 2.699 lei (semestrul II), ținând cont de facilitatea fiscală de 300, respectiv 200 lei (OUG 89/2025).",
          },
        },
        {
          "@type": "Question",
          name: "Ce este deducerea personală și cui se aplică?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Deducerea personală este o sumă scăzută din baza de calcul a impozitului pe venit pentru salariații cu venituri brute de până la 6.050 lei. Suma depinde de venit și de numărul de persoane în întreținere. Pentru salariul minim, deducerea de bază este de aproximativ 810 lei. Se aplică doar pe funcția de bază.",
          },
        },
        {
          "@type": "Question",
          name: "Ce facilități fiscale au angajații din IT și construcții?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Începând cu 1 ianuarie 2025, facilitățile fiscale pentru sectoarele IT, construcții și agricultură/industrie alimentară au fost ELIMINATE conform OUG 156/2024. Anterior, acești angajați erau scutiți de impozit pe venit pentru salarii brute de până la 10.000 lei. Acum plătesc impozit ca în sectorul standard.",
          },
        },
        {
          "@type": "Question",
          name: "Cât plătește total angajatorul pe lângă salariul brut?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "În plus față de salariul brut, angajatorul plătește Contribuția Asiguratorie pentru Muncă (CAM) de 2,25% din salariul brut. Aceasta nu afectează salariul net al angajatului. De exemplu, pentru un brut de 5.000 lei, costul total al firmei este 5.113 lei (5.000 + 113 lei CAM).",
          },
        },
        {
          "@type": "Question",
          name: "Cum se calculează salariul brut din net?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Calculul invers (din net în brut) folosește o formulă iterativă deoarece deducerea personală depinde de valoarea brută. Algoritmul nostru calculează automat brutul corespunzător unui net dorit, ținând cont de toate variabilele fiscale. Această funcție este utilă în negocierea salariilor, când vrei să afli ce brut îți garantează un anumit net.",
          },
        },
        {
          "@type": "Question",
          name: "Ce sunt tichetele de masă din punct de vedere fiscal?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Tichetele de masă sunt un beneficiu acordat de angajator în plus față de salariu. Începând cu 2024, tichetele sunt supuse contribuției CASS (10%) și impozitului pe venit (10%), dar NU sunt supuse CAS. Calculatorul nostru ține cont de aceste reguli și include tichetele în calculul net efectiv.",
          },
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
      <CalculatorSalariu />
    </>
  );
}
