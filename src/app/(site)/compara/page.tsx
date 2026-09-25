// src/app/(site)/compara/page.tsx
// Hub-ul comparatiilor. Server Component pur.
//
// Fiecare pagina pune neturile in prim-plan si pastreaza separat contextul
// sectoarelor CAEN si al grupelor ISCO.

import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Breadcrumb, Faq, H1, Lead, TITLU_SECTIUNE, SPATIU_JOS, SPATIU_SUS, SECTIUNE_DUPA_TEXT, SUB_TITLU_SECTIUNE_CUTIE } from "@/app/components/ui";
import { NotaSursa, lunaLunga } from "@/app/components/Salarii";
import { AN_OCUPATII, LUNA_REFERINTA, MATRICE_BRUT, MATRICE_NET, MATRICE_OCUPATII } from "@/lib/ins-date";
import { MESERII, COMPARATII, dateMeserieSauEroare } from "@/lib/meserii";
import { reperMeserie } from '@/lib/repere-meserii';
import { textIndicator } from '@/lib/indicator-meserie';
import AlegeComparatie from '@/app/components/AlegeComparatie';
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const LUNA = lunaLunga(LUNA_REFERINTA);
const DESCRIERE = `Compară oricare două meserii: surse salariale, grile publice, perioade și responsabilități. Reperele despre ocupație sunt separate de contextul INS.`;

export const metadata: Metadata = {
  title: { absolute: "Compară salarii între meserii 2026 | Salariile" },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/compara" },
  openGraph: ogPage({ title: "Compară salarii între meserii 2026", description: DESCRIERE, path: "/compara" }),
  twitter: twPage({ title: "Compară salarii între meserii 2026", description: DESCRIERE }),
};

const COMPARATII_CU_CERERE = [
  "electrician-vs-sudor",
  "sofer-tir-vs-curier",
  "asistent-social-vs-asistent-medical",
  "farmacist-vs-asistent-medical",
  "avocat-vs-analist-financiar",
  "profesor-vs-contabil",
];

const FAQ = [
  {
    q: "Pe ce se compară cele două meserii?",
    a: `Fiecare meserie afișează reperul documentat: medie declarată dintr-o sursă externă, grilă publică sau context de sector. Tabelul arată separat mediile INS, perioada și populația fiecărei cifre.`,
  },
  {
    q: "Pot compara meserii din același domeniu?",
    a: "Da, selectorul include toate meseriile din catalog. Dacă împart același reper de sector, asta nu dovedește că salariile lor sunt egale. Paginile detaliate adaugă responsabilități și surse specifice, unde sunt disponibile.",
  },
  {
    q: "Pot spune datele care meserie câștigă mai mult?",
    a: "Valorile arată direct care sector are media netă mai mare și oferă un reper util de piață. Pentru două persoane concrete, ordinea se poate schimba în funcție de experiență, companie, oraș și responsabilități, de aceea nu declarăm un câștigător absolut între ocupații.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Acasă", item: "https://salariile.ro" },
        { "@type": "ListItem", position: 2, name: "Compară salarii", item: "https://salariile.ro/compara" },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "Compară salarii între meserii",
      description: DESCRIERE,
      url: "https://salariile.ro/compara",
      author: personSchema,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: COMPARATII.length,
        itemListElement: COMPARATII.map((comparatie, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${comparatie.a.nume} vs ${comparatie.b.nume}`,
          url: `https://salariile.ro/compara/${comparatie.slug}`,
        })),
      },
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

export default function ComparaPage() {
  // Doar comparațiile cu cerere, nu toate cele 37. /compara are backlink dofollow
  // (legalmarketing.ro), iar cu 59 de linkuri pe pagină homepage-ul primea 1/59
  // din ce transmite. Cele 37 de perechi au adus împreună ~25 de clicuri în 90 de
  // zile; restul rămân legate din paginile de meserie. Ordinea: afișări GSC, 15
  // septembrie 2026.
  const comparatii = COMPARATII.filter((comparatie) => COMPARATII_CU_CERERE.includes(comparatie.slug))
    .sort((x, y) => COMPARATII_CU_CERERE.indexOf(x.slug) - COMPARATII_CU_CERERE.indexOf(y.slug))
    .map((comparatie) => {
    const a = dateMeserieSauEroare(comparatie.a);
    const b = dateMeserieSauEroare(comparatie.b);
    return { comparatie, a, b };
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>
          <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Compară salarii" }]} />
          <H1>Compară salarii între meserii</H1>
          <Lead>Alege două meserii și vezi salariile nete, unul lângă altul.</Lead>
          <AlegeComparatie options={MESERII.map(m=>{const d=dateMeserieSauEroare(m);return {slug:m.slug,name:m.nume,activity:d.sector.denumire,description:m.ceFace,reference:reperMeserie(d)};})} />
          <p className="mt-6 text-base text-stone-600">
            Oferta e în brut? Vezi cât rămâne în mână cu{" "}
            <Link href="/" className="font-medium text-stone-900 underline underline-offset-2">calculatorul de salariu net</Link>.
          </p>
          <h2 className={`${SECTIUNE_DUPA_TEXT} ${SUB_TITLU_SECTIUNE_CUTIE} ${TITLU_SECTIUNE}`}>Comparații detaliate</h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comparatii.map(({ comparatie, a, b }) => (
              <Link
                key={comparatie.slug}
                href={`/compara/${comparatie.slug}`}
                className="flex flex-col rounded-md border border-stone-200 bg-surface p-5 shadow-soft transition-colors hover:border-stone-300 hover:bg-canvas"
              >
                <div className="grid gap-2">
                  <span className="text-base font-semibold tracking-[-0.01em] text-stone-900">{comparatie.a.nume}</span>
                  <span className="text-xs tabular-nums text-stone-600">
                    <strong className="text-stone-900">{textIndicator(reperMeserie(a))}</strong>
                    
                  </span>
                </div>
                <div className="my-2 text-xs uppercase tracking-wide text-stone-600">vs</div>
                <div className="grid gap-2">
                  <span className="text-base font-semibold tracking-[-0.01em] text-stone-900">{comparatie.b.nume}</span>
                  <span className="text-xs tabular-nums text-stone-600">
                    <strong className="text-stone-900">{textIndicator(reperMeserie(b))}</strong>
                    
                  </span>
                </div>
                <p className="mt-3 border-t border-stone-200 pt-3 text-xs text-stone-600">
                  Vezi comparația →
                </p>
              </Link>
            ))}
          </div>

          <NotaSursa>
            Contextul statistic: Institutul Național de Statistică, TEMPO-Online, matricele {MATRICE_NET} și {MATRICE_BRUT}{" "}
            (câștig salarial mediu net și brut lunar pe activități CAEN Rev.3), luna {LUNA}, și {MATRICE_OCUPATII} (grupe majore ISCO,
            octombrie {AN_OCUPATII.replace("Anul ", "")}). Mediile descriu grupuri statistice, nu posturi individuale;
            vezi <Link href="/metodologie">metodologia</Link> și explicația completă în{" "}
            <Link href="/salarii">hub-ul de meserii</Link>.
          </NotaSursa>
        </div>
      </div>

      <Faq items={FAQ} />
    </>
  );
}
