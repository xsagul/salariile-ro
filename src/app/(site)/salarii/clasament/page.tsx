import type { Metadata } from 'next';
import Link from "@/app/components/Link";
import { Breadcrumb, H1, Lead } from '@/app/components/ui';
import { MESERII, CATEGORII, dateMeserieSauEroare } from '@/lib/meserii';
import { ogPage, twPage } from '@/lib/seo';
import reports from '@/data/repere-piata-verificate.json';
import { ACOPERIRE_ANUNTURI } from '@/lib/acoperire-anunturi';

// Clasamentul compara o singura masura, din aceeasi editie a aceleiasi surse.
// De aceea porneste din inregistrarile Salario, nu din reperul principal al
// paginii: cand colectarea noastra devine reperul unei meserii, meseria trebuie
// sa ramana comparabila aici, nu sa dispara din clasament.
const entries = reports.records
  .map(rec => {
    const m = MESERII.find(x => x.slug === rec.slug);
    return m ? { m, d: dateMeserieSauEroare(m), rec, a: ACOPERIRE_ANUNTURI[rec.slug] } : null;
  })
  .filter((x): x is NonNullable<typeof x> => x !== null)
  .sort((a, b) => b.rec.net - a.rec.net || a.m.slug.localeCompare(b.m.slug, 'ro'));

const description = `Clasament pentru ${entries.length} de meserii cu medii nete declarate în aceeași ediție Salario, cu sursa și acoperirea anunțurilor salariale.`;

export const metadata: Metadata = {
  title: 'Clasament salarii pe meserii 2026',
  description,
  alternates: { canonical: 'https://salariile.ro/salarii/clasament' },
  openGraph: ogPage({
    title: 'Top salarii pe meserii în România 2026',
    description,
    path: '/salarii/clasament',
  }),
  twitter: twPage({
    title: 'Top salarii pe meserii în România 2026',
    description,
  }),
};

export default function Clasament() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: entries.length,
    itemListElement: entries.map((x, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: x.m.nume,
      url: `https://salariile.ro/salarii/${x.m.slug}`,
    })),
  };

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <Breadcrumb
          items={[
            { href: '/', label: 'Acasă' },
            { href: '/salarii', label: 'Salarii pe meserii' },
            { label: 'Clasament' },
          ]}
        />
        <H1>Top salarii pe meserii în România 2026</H1>
        <Lead>
          {entries.length} de meserii cu medii nete declarate în aceeași ediție Salario. Celelalte meserii rămân în catalog, cu grila publică sau contextul INS disponibil.
        </Lead>

        <div className="mt-4 rounded-md border border-stone-200 bg-surface p-4 text-sm text-stone-700">
          <h2 className="font-semibold text-stone-900">Cum se citește clasamentul</h2>
          <p className="mt-1 leading-relaxed">
            Comparăm aceeași măsură și perioadă: media națională declarată de angajați în Salario. Eșantioanele pe meserie nu sunt publicate, iar raportările voluntare pot avea dezechilibre. Ordinea este orientativă; valorile egale au același loc. Nu avem o mediană națională verificată pentru fiecare meserie.
          </p>
          <p className="mt-2 leading-relaxed">
            Pentru unele meserii avem și un reper din propriile noastre anunțuri verificate. Nu îl amestecăm aici, pentru că măsoară altceva — ce se oferă la angajare, nu ce declară cine lucrează deja. Îl găsești pe pagina meseriei, marcat ca atare.
          </p>
        </div>

        <div className="my-8 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Repere salariale pe meserii și tipul sursei</caption>
            <thead>
              <tr className="border-b border-stone-300 text-stone-700">
                <th scope="col" className="p-3 text-left font-semibold">Loc</th>
                <th scope="col" className="p-3 text-left font-semibold">Meserie</th>
                <th scope="col" className="p-3 text-left font-semibold">Rolul din sursă</th>
                <th scope="col" className="p-3 text-right font-semibold">Reper net / lună</th>
                <th scope="col" className="p-3 text-right font-semibold">Anunțuri eligibile</th>
                <th scope="col" className="p-3 text-left font-semibold">Tip reper</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((x) => {
                const cat = CATEGORII.find(c => c.slug === x.m.categorie);
                return (
                  <tr key={x.m.slug} className="hover:bg-stone-50/60 border-b border-stone-100">
                    <td className="p-3 font-mono text-xs font-medium text-stone-600">#{x.d.clasament?.loc}</td>
                    <th scope="row" className="p-3 text-left font-medium text-stone-900">
                      <Link
                        className="inline-flex min-h-11 items-center underline hover:text-stone-700"
                        href={`/salarii/${x.m.slug}`}
                      >
                        {x.m.nume}
                      </Link>
                    </th>
                    <td className="p-3 text-xs text-stone-600">
                      <span className="inline-block rounded bg-stone-100 px-2 py-0.5 font-medium text-stone-700">
                        {x.rec.role ?? cat?.nume}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-3 text-right font-bold text-stone-900">
                      {x.rec.net.toLocaleString('ro-RO')} lei net
                    </td>
                    <td className="whitespace-nowrap p-3 text-right text-xs text-stone-600">
                      {x.a?.n ?? 0}
                    </td>
                    <td className="p-3 text-xs text-stone-600">
                      {x.a?.medianBounds ? (
                        <Link className="font-medium text-stone-800 underline" href={`/salarii/${x.m.slug}`}>
                          Avem și cifră proprie
                        </Link>
                      ) : (
                        <span className="font-medium text-stone-800">Medie declarată</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-md border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600 space-y-2">
          <p>
            <strong>Metodologia Salariile.ro:</strong> Publicăm numai măsura susținută de sursă. Anunțurile eligibile sunt analizate separat, cu dovadă pentru sumă, net/brut, normă și perioadă. Nu completăm lipsurile cu salarii generate și nu ajustăm cifrele pentru a impune o anumită ordine.
          </p>
          <p>
            Vezi și <Link className="underline hover:text-stone-900" href="/salarii">Catalogul tuturor meseriilor</Link>, <Link className="underline hover:text-stone-900" href="/compara">Comparatorul salarial între două profesii</Link> sau <Link className="underline hover:text-stone-900" href="/metodologie">Metodologia detaliată</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
