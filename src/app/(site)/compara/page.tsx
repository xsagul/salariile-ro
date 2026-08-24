// src/app/(site)/compara/page.tsx
// Hub-ul comparatiilor. Server Component pur.
//
// Fiecare pagina pune alaturi doua seturi de repere CAEN si ISCO, fara sa
// transforme mediile de grup in salarii ale ocupatiilor individuale.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import { NotaSursa, lei, lunaLunga } from "@/app/components/Salarii";
import { AN_OCUPATII, LUNA_REFERINTA, MATRICE_BRUT, MATRICE_OCUPATII } from "@/lib/ins-date";
import { COMPARATII, dateMeserieSauEroare } from "@/lib/meserii";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const LUNA = lunaLunga(LUNA_REFERINTA);
const DESCRIERE = `Pune alături reperele INS pentru două meserii: mediile sectoarelor CAEN și ale grupelor ISCO, afișate separat, fără câștigători sau diferențe derivate.`;

export const metadata: Metadata = {
  title: { absolute: "Compară salarii între meserii 2026 | Salariile.ro" },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/compara" },
  openGraph: ogPage({ title: "Compară salarii între meserii 2026", description: DESCRIERE, path: "/compara" }),
  twitter: twPage({ title: "Compară salarii între meserii 2026", description: DESCRIERE }),
};

const FAQ = [
  {
    q: "Pe ce se compară cele două meserii?",
    a: `Afișăm separat două contexte statistice pentru fiecare meserie: câștigul mediu din activitatea CAEN a angajatorului tipic, în ${LUNA}, și venitul mediu al grupei majore ISCO, din ancheta din octombrie ${AN_OCUPATII.replace("Anul ", "")}. INS nu publică media ocupației individuale, iar pagina nu combină reperele într-un interval sau o estimare unică.`,
  },
  {
    q: "De ce nu există comparații între două meserii din același domeniu?",
    a: "Pentru că INS măsoară activitatea angajatorului, nu ocupația individuală. Un tester și un programator lucrează în aceeași activitate CAEN, deci ar apărea cu exact aceeași cifră. O pagină care le compară ar fi goală de conținut, așa că nu o publicăm.",
  },
  {
    q: "Pot spune datele care meserie câștigă mai mult?",
    a: "Nu. Mediile CAEN includ toate ocupațiile dintr-un sector, iar mediile ISCO includ familii largi de ocupații din toate sectoarele. Valorile pot oferi context, dar nu izolează cele două posturi și nu susțin un câștigător, o diferență procentuală sau o diferență anuală între meserii.",
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
  const comparatii = COMPARATII.map((comparatie) => {
    const a = dateMeserieSauEroare(comparatie.a);
    const b = dateMeserieSauEroare(comparatie.b);
    return { comparatie, a, b };
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Compară salarii" }]} />
          <H1>Compară salarii între meserii</H1>
          <Lead>
            Fiecare pagină pune alături două tipuri de repere pentru fiecare meserie: activitatea CAEN a angajatorului
            tipic și grupa majoră ISCO. INS nu publică salariul ocupației individuale, așa că nu ordonăm meseriile, nu
            declarăm un câștigător și nu calculăm o diferență între ele.
          </Lead>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comparatii.map(({ comparatie, a, b }) => (
              <Link
                key={comparatie.slug}
                href={`/compara/${comparatie.slug}`}
                className="flex flex-col rounded-md border border-stone-200 bg-surface p-5 shadow-soft transition-colors hover:border-stone-300 hover:bg-canvas"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-semibold tracking-[-0.01em] text-stone-900">{comparatie.a.nume}</span>
                  <span className="shrink-0 text-right text-xs tabular-nums text-stone-600">
                    CAEN {lei(a.sector.brutCurent)} lei
                    {a.repere && <span className="block">ISCO {lei(a.repere.grupa.brut)} lei</span>}
                  </span>
                </div>
                <div className="my-2 text-xs uppercase tracking-wide text-stone-400">vs</div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-semibold tracking-[-0.01em] text-stone-900">{comparatie.b.nume}</span>
                  <span className="shrink-0 text-right text-xs tabular-nums text-stone-600">
                    CAEN {lei(b.sector.brutCurent)} lei
                    {b.repere && <span className="block">ISCO {lei(b.repere.grupa.brut)} lei</span>}
                  </span>
                </div>
                <p className="mt-3 border-t border-stone-200 pt-3 text-xs leading-normal text-stone-600">
                  Repere CAEN și ISCO afișate separat; niciuna dintre valori nu este salariul meseriei.
                </p>
              </Link>
            ))}
          </div>

          <NotaSursa>
            Sursa cifrelor: Institutul Național de Statistică, TEMPO-Online, matricea {MATRICE_BRUT} (câștig salarial
            mediu brut lunar pe activități CAEN Rev.3), luna {LUNA}, și {MATRICE_OCUPATII} (grupe majore ISCO,
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
