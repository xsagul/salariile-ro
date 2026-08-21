// src/app/(site)/compara/page.tsx
// Hub-ul comparatiilor. Server Component pur.
//
// Regula editoriala: o comparatie exista numai daca cele doua meserii cad in
// activitati CAEN diferite. Doua ocupatii din acelasi sector ar afisa aceeasi
// cifra de doua ori si ar da o pagina fara continut.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Faq, H1, Lead } from "@/app/components/ui";
import { NotaSursa, lei, lunaLunga, procent } from "@/app/components/Salarii";
import { LUNA_REFERINTA, MATRICE_BRUT } from "@/lib/ins-date";
import { COMPARATII, dateMeserieSauEroare } from "@/lib/meserii";
import { personSchema } from "@/lib/person";
import { ogPage, twPage } from "@/lib/seo";

const LUNA = lunaLunga(LUNA_REFERINTA);
const DESCRIERE = `Compară două meserii pe datele INS din ${LUNA}: brut, net calculat și diferența procentuală, cu sectorul CAEN al fiecăreia declarat explicit.`;

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
    a: `Pe câștigul salarial mediu brut din activitatea economică a angajatorului tipic pentru fiecare meserie, publicat lunar de INS, cu ultima lună disponibilă ${LUNA}. Netul este calculat de noi din acel brut, cu regulile fiscale în vigoare. Nu comparăm oferte de job și nu folosim date declarate de utilizatori.`,
  },
  {
    q: "De ce nu există comparații între două meserii din același domeniu?",
    a: "Pentru că INS măsoară activitatea angajatorului, nu ocupația individuală. Un tester și un programator lucrează în aceeași activitate CAEN, deci ar apărea cu exact aceeași cifră. O pagină care le compară ar fi goală de conținut, așa că nu o publicăm.",
  },
  {
    q: "Diferența procentuală se aplică și la net?",
    a: "Aproape, dar nu exact. Contribuțiile sunt procentuale, deci raportul se păstrează în mare parte, însă deducerea personală se acordă doar sub un anumit prag de venit, iar la salarii mici ea ridică netul. Comparațiile arată ambele valori, ca să vezi diferența reală în mână.",
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
    const diferenta = (a.sector.brutCurent - b.sector.brutCurent) / b.sector.brutCurent;
    return { comparatie, a, b, diferenta };
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumb items={[{ href: "/", label: "Acasă" }, { label: "Compară salarii" }]} />
          <H1>Compară salarii între meserii</H1>
          <Lead>
            Fiecare comparație pune față în față câștigul mediu brut din sectorul celor două meserii, cu datele INS
            din {LUNA}, și netul calculat din fiecare brut. Publicăm doar perechi din activități economice diferite:
            două ocupații din același sector ar avea, în statistica oficială, exact aceeași cifră.
          </Lead>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comparatii.map(({ comparatie, a, b, diferenta }) => (
              <Link
                key={comparatie.slug}
                href={`/compara/${comparatie.slug}`}
                className="flex flex-col rounded-md border border-stone-200 bg-surface p-5 shadow-soft transition-colors hover:border-stone-300 hover:bg-canvas"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-semibold tracking-[-0.01em] text-stone-900">{comparatie.a.nume}</span>
                  <span className="shrink-0 text-sm tabular-nums text-stone-600">{lei(a.sector.brutCurent)} lei</span>
                </div>
                <div className="my-2 text-xs uppercase tracking-wide text-stone-400">vs</div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-semibold tracking-[-0.01em] text-stone-900">{comparatie.b.nume}</span>
                  <span className="shrink-0 text-sm tabular-nums text-stone-600">{lei(b.sector.brutCurent)} lei</span>
                </div>
                <p className="mt-3 border-t border-stone-200 pt-3 text-xs leading-normal text-stone-600">
                  Diferență de {procent(Math.abs(diferenta), 0)}% brut, în favoarea{" "}
                  {diferenta >= 0 ? comparatie.a.nume.toLocaleLowerCase("ro-RO") : comparatie.b.nume.toLocaleLowerCase("ro-RO")}.
                </p>
              </Link>
            ))}
          </div>

          <NotaSursa>
            Sursa cifrelor: Institutul Național de Statistică, TEMPO-Online, matricea {MATRICE_BRUT} (câștig salarial
            mediu brut lunar pe activități CAEN Rev.3), luna {LUNA}. Netul este calculat de Salariile.ro — vezi{" "}
            <Link href="/metodologie">metodologia</Link>. Mediile descriu activități economice, nu posturi
            individuale; vezi explicația completă în <Link href="/salarii">hub-ul de meserii</Link>.
          </NotaSursa>
        </div>
      </div>

      <Faq items={FAQ} />
    </>
  );
}
