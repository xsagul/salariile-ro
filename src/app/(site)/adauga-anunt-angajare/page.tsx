// Adăugarea unui anunț de angajare, fără cont (28 septembrie 2026). Pagina e statică; formularul
// trimite la Worker (/api/anunturi), care publică anunțul și trimite pe email linkul de gestionare. Adresa urmează
// formularea căutată („adaugă anunț”, SE Ranking); nicio pagină de publicare nu e în top 3.
import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Breadcrumb, H1, Lead, SPATIU_JOS, SPATIU_SUS } from "@/app/components/ui";
import PublicaAnunt from "@/app/components/anunturi/PublicaAnunt";
import { ogPage, twPage } from "@/lib/seo";

const TITLU = "Adaugă anunț de angajare gratuit, fără cont";
const DESCRIERE = "Adaugă gratuit un anunț de angajare, fără cont: cu salariul scris, ajunge la oamenii care caută exact meseria și orașul tău.";

export const metadata: Metadata = {
  title: { absolute: `${TITLU} | Salariile` },
  description: DESCRIERE,
  alternates: { canonical: "https://salariile.ro/adauga-anunt-angajare" },
  openGraph: ogPage({ title: TITLU, description: DESCRIERE, path: "/adauga-anunt-angajare" }),
  twitter: twPage({ title: TITLU, description: DESCRIERE }),
};

export default function AdaugaAnunt() {
  return (
    <div className="bg-canvas">
      <div className={`mx-auto max-w-3xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>
        <Breadcrumb items={[{ href: "/locuri-de-munca", label: "Locuri de muncă" }, { label: "Adaugă anunț" }]} />
        <H1>Adaugă un anunț de angajare</H1>
        <Lead>Gratuit și fără cont. Scrie salariul lunar: anunțurile cu salariu primesc mai mulți candidați potriviți. Apare pe site imediat; pe email primești linkul cu care îl modifici sau îl ștergi.</Lead>
        <div className="mt-6 rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6">
          <PublicaAnunt />
        </div>
        <p className="mt-4 text-xs text-stone-600">
          Anunțul stă publicat 30 de zile și se poate prelungi. Nu publicăm anunțuri cu cerințe de vârstă sau sex, cu bani ceruți candidaților sau pentru muncă în străinătate. <Link href="/termeni#anunturi" className="underline underline-offset-2">Regulile anunțurilor</Link>.
        </p>
      </div>
    </div>
  );
}
