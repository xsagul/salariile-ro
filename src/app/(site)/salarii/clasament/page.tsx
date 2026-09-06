import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb, H1, Lead } from '@/app/components/ui';
import { MESERII, CATEGORII, dateMeserieSauEroare } from '@/lib/meserii';
import { reperMeserie } from '@/lib/repere-meserii';
import { textIndicator } from '@/lib/indicator-meserie';
import { ogPage, twPage } from '@/lib/seo';
import triangulare from '@/data/triangulare-date.json';

const entries = MESERII.map(m => {
  const d = dateMeserieSauEroare(m);
  const r = reperMeserie(d);
  return { m, d, r };
}).sort((a, b) => (b.r.value ?? 0) - (a.r.value ?? 0) || a.m.slug.localeCompare(b.m.slug, 'ro'));

const description = `Clasament complet al celor ${entries.length} de meserii din România în 2026, ordonate după mediana netă estimată prin triangulare multi-sursă (anunțuri active, rapoarte de piață, INS).`;

export const metadata: Metadata = {
  title: 'Top salarii pe meserii în România 2026 | Clasament complet',
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
          Toate cele {entries.length} de meserii din catalog, clasate după mediana netă estimată prin triangulare multi-sursă: piața activă a anunțurilor din România, rapoarte salariale, statistica oficială INS și grile legale.
        </Lead>

        <div className="mt-4 rounded-md border border-stone-200 bg-surface p-4 text-sm text-stone-700">
          <h2 className="font-semibold text-stone-900">Cum se citește clasamentul pe mediană:</h2>
          <p className="mt-1 leading-relaxed">
            Spre deosebire de o simplă medie aritmetică (care este distorsionată în sus de câteva salarii foarte mari) sau tabele comerciale cu cifre rotunjite din burtă la 5.000 lei, acest clasament urmărește <strong>ceea ce sunt plătiți cei mai mulți oameni dintr-o ocupație (mediana pieței)</strong> și intervalul reprezentativ P25–P75 (debutant vs. experimentat).
          </p>
        </div>

        <div className="my-8 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Clasamentul celor 132 de meserii după mediana netă</caption>
            <thead>
              <tr className="border-b border-stone-300 text-stone-700">
                <th scope="col" className="p-3 text-left font-semibold">Loc</th>
                <th scope="col" className="p-3 text-left font-semibold">Meserie</th>
                <th scope="col" className="p-3 text-left font-semibold">Domeniu</th>
                <th scope="col" className="p-3 text-right font-semibold">Mediană netă / lună</th>
                <th scope="col" className="p-3 text-right font-semibold">Interval tipic (P25–P75)</th>
                <th scope="col" className="p-3 text-left font-semibold">Tip reper</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((x, i) => {
                const cat = CATEGORII.find(c => c.slug === x.m.categorie);
                const isPublic = x.r.kind === 'public-grid';
                return (
                  <tr key={x.m.slug} className="hover:bg-stone-50/60 border-b border-stone-100">
                    <td className="p-3 font-mono text-xs font-medium text-stone-500">#{i + 1}</td>
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
                        {cat?.nume ?? x.m.categorie}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-3 text-right font-bold text-stone-900">
                      {textIndicator(x.r)}
                    </td>
                    <td className="whitespace-nowrap p-3 text-right text-xs text-stone-600">
                      {x.r.p25 && x.r.p75 ? (
                        <span>
                          {x.r.p25.toLocaleString('ro-RO')} – {x.r.p75.toLocaleString('ro-RO')} lei
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-xs text-stone-500">
                      {isPublic ? (
                        <span className="text-amber-800 font-medium">Grilă Legea 153</span>
                      ) : (
                        <span className="text-emerald-800 font-medium">Triangulat piață</span>
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
            <strong>Metodologia Salariile.ro:</strong> Nicio cifră nu provine dintr-o singură sursă nevalidată. Filtrele obligatorii aplicate la colectare elimină ofertele externe din diaspora/străinătate, anunțurile exprimate în EUR și contractele sub salariul minim net legal (2.699 lei net, HG 146/2026). Trunchierea P5–P95 curăță valorile aberante.
          </p>
          <p>
            Vezi și <Link className="underline hover:text-stone-900" href="/salarii">Catalogul tuturor meseriilor</Link>, <Link className="underline hover:text-stone-900" href="/compara">Comparatorul salarial între două profesii</Link> sau <Link className="underline hover:text-stone-900" href="/metodologie">Metodologia detaliată</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
