import type { Metadata } from "next";
import Link from "@/app/components/Link";
import { Breadcrumb, H1, Lead, SPATIU_JOS, SPATIU_SUS } from "@/app/components/ui";
import { MESERII, CATEGORII } from "@/lib/meserii";
import { concluzieMeserie } from "@/app/components/SalariuConcluzie";
import { netDeStart } from "@/app/components/SalariuGrila";
import { netOficialDeStart } from "@/app/components/SalariuOficial";
import { netDeclarat } from "@/app/components/SalariuDeclarat";
import { ogPage, twPage } from "@/lib/seo";
import { TABEL_STANDARD } from "@/app/components/TabelArticol";

type IntrareClasament = {
  slug: string;
  nume: string;
  categorie: string;
  net: number;
  deLa: boolean;
  sursa: string;
};

function reperClasament(slug: string): { net: number; deLa: boolean; sursa: string } | null {
  const c = concluzieMeserie(slug);
  if (c) return { net: c.net, deLa: false, sursa: c.sursa === "platit" ? "Plătit la stat" : "Anunțuri verificate" };
  const g = netDeStart(slug);
  if (g) return { net: g, deLa: true, sursa: "Grila legii" };
  const o = netOficialDeStart(slug);
  if (o) return { net: o, deLa: true, sursa: "Tabel oficial" };
  const d = netDeclarat(slug);
  if (d) return { net: d, deLa: false, sursa: "Reper declarat" };
  return null;
}

const entries: IntrareClasament[] = MESERII
  .map((m) => {
    const r = reperClasament(m.slug);
    if (!r) return null;
    const cat = CATEGORII.find((c) => c.slug === m.categorie);
    return {
      slug: m.slug,
      nume: m.nume,
      categorie: cat?.nume ?? m.categorie,
      ...r,
    };
  })
  .filter((x): x is IntrareClasament => x !== null)
  .sort((a, b) => b.net - a.net || a.nume.localeCompare(b.nume, "ro"));

const description = `Clasamentul salariilor nete pentru ${entries.length} de meserii din România în 2026: de la cele mai bine plătite profesii la salariile de pornire, cu sursa fiecărei cifre.`;

export const metadata: Metadata = {
  title: { absolute: "Clasament salarii pe meserii 2026 | Salariile" },
  description,
  alternates: { canonical: "https://salariile.ro/salarii/clasament" },
  openGraph: ogPage({
    title: "Clasament salarii pe meserii în România 2026",
    description,
    path: "/salarii/clasament",
  }),
  twitter: twPage({
    title: "Clasament salarii pe meserii în România 2026",
    description,
  }),
};

export default function Clasament() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: entries.length,
    itemListElement: entries.map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: x.nume,
      url: `https://salariile.ro/salarii/${x.slug}`,
    })),
  };

  return (
    <div className="bg-canvas">
      <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${SPATIU_SUS} ${SPATIU_JOS}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <Breadcrumb
          items={[
            { href: "/", label: "Acasă" },
            { href: "/salarii", label: "Salarii pe meserii" },
            { label: "Clasament" },
          ]}
        />
        <H1>Clasament salarii pe meserii în România 2026</H1>
        <Lead>
          {entries.length} de meserii ordonate după reperul net lunar publicat pe pagina fiecăreia. Coloana din dreapta arată tipul sursei (salarii plătite la stat, anunțuri verificate, grila legii, tabele oficiale sau repere declarate), ca să știi exact ce compari.
        </Lead>

        <div className="my-8 overflow-x-auto">
          <table className={TABEL_STANDARD}>
            <caption className="sr-only">Clasament salarii nete pe meserii și sursa reperului</caption>
            <thead>
              <tr className="border-b border-stone-300 text-stone-700">
                <th scope="col" className="p-3 text-left font-semibold">Loc</th>
                <th scope="col" className="p-3 text-left font-semibold">Meserie</th>
                <th scope="col" className="p-3 text-left font-semibold">Domeniu</th>
                <th scope="col" className="p-3 text-right font-semibold">Reper net / lună</th>
                <th scope="col" className="p-3 text-left font-semibold">Sursa reperului</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((x, idx) => (
                <tr key={x.slug} className="border-b border-stone-100 hover:bg-stone-50/60">
                  <td className="p-3 font-medium tabular-nums text-stone-600">#{idx + 1}</td>
                  <th scope="row" className="p-3 text-left font-medium text-stone-900">
                    <Link
                      className="inline-flex min-h-11 items-center underline underline-offset-2 hover:text-stone-700"
                      href={`/salarii/${x.slug}`}
                    >
                      {x.nume}
                    </Link>
                  </th>
                  <td className="p-3 text-stone-600">{x.categorie}</td>
                  <td className="whitespace-nowrap p-3 text-right font-bold tabular-nums text-stone-900">
                    {x.deLa ? "de la " : ""}{x.net.toLocaleString("ro-RO")} lei net
                  </td>
                  <td className="p-3 text-stone-600">
                    <span className="inline-block rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
                      {x.sursa}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 rounded-md border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600">
          <p>
            <strong>Metodologia Salariile.ro:</strong> Ordinea este orientativă, deoarece sursele măsoară populații diferite (salarii efectiv plătite la stat, trepte de pornire din grila legii, oferte din anunțuri sau medii declarate de angajați). Pe pagina fiecărei meserii vezi detalii pe vechime, sporuri și oraș.
          </p>
          <p>
            Vezi și <Link className="underline hover:text-stone-900" href="/salarii">catalogul complet al meseriilor</Link>, <Link className="underline hover:text-stone-900" href="/compara">comparatorul între două meserii</Link>, <Link className="underline hover:text-stone-900" href="/salarii/judete">salariile pe județe</Link> sau <Link className="underline hover:text-stone-900" href="/metodologie">metodologia detaliată</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
