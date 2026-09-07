import Link from 'next/link';
import type { ReperMeserie } from '@/lib/repere-meserii';
import { indicatorMeserie, textIndicator } from '@/lib/indicator-meserie';

export default function IndicatorSalariu({ reper: r }: { reper: ReperMeserie }) {
  const indicator = indicatorMeserie(r), a = r.anunturi;
  const explanation = r.kind === 'public-grid'
    ? 'Intervalul descrie trepte din grila de bază, convertite în net standard. Nu arată distribuția salariilor încasate, sporurile sau vechimea individuală.'
    : r.kind === 'sector-context'
    ? 'Acesta este un reper pentru o grupă largă de ocupații din sector. Salariul meseriei exacte nu este măsurat separat în această serie.'
    : r.kind === 'external-advertised'
    ? 'Interval calculat din salariile oferite în anunțurile eligibile. Oferta de angajare poate diferi de salariul efectiv încasat.'
    : 'Media provine din raportări voluntare ale angajaților în sursa citată. Numărul de răspunsuri pentru această meserie și mediana nu sunt publicate de sursă.';
  return (
    <div data-salary-primary={indicator.metric ?? 'unavailable'}>
      <p className="text-xs font-medium text-stone-700">{r.label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{textIndicator(r)}</p>
      <p className="mt-1 text-sm text-stone-600">pe lună · {r.period}</p>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{explanation}</p>
      <p className="mt-2 text-xs text-stone-600">
        Sursă: <a className="underline underline-offset-2" href={r.url} rel="nofollow noopener">{r.source}</a>
      </p>
      <div className="mt-5 border-t border-stone-200 pt-4 text-sm text-stone-700">
        <p className="font-semibold text-stone-900">Ce am verificat în anunțuri</p>
        {a?.n ? <>
          <p className="mt-1">{a.n} anunțuri eligibile după deduplicare · {a.employers} angajatori identificați · {a.counties} județe identificate.</p>
          <p className="mt-1 text-xs text-stone-600">{Object.entries(a.sourceCounts).map(([source,n]) => `${source}: ${n}`).join(' · ')}</p>
          <p className="mt-1 text-xs text-stone-600">{a.explicitMonthly} cu perioadă lunară explicită; {a.assumedMonthly} cu perioadă lunară presupusă pentru normă întreagă. Conversiile din brut și euro sunt documentate în registru.</p>
          {a.midpointEstimate !== null && a.midpointEstimate !== undefined && <p className="mt-2">Reper central estimat al ofertelor: <strong>{Math.round(a.midpointEstimate/100)*100} lei net / lună</strong>. Calculat ca mediană a mijloacelor intervalelor oferite.</p>}
          {a.medianBounds ? <p className="mt-2">Limitele medianei ofertelor: <strong>{a.medianBounds.min.toLocaleString('ro-RO')}–{a.medianBounds.max.toLocaleString('ro-RO')} lei net / lună</strong>. Intervalele oferite nu permit determinarea unei mediane exacte.</p>
            : <p className="mt-2">Acoperirea este insuficientă pentru a publica mediana ofertelor acestei meserii.</p>}
        </> : <p className="mt-1">Nu avem încă anunțuri care să îndeplinească toate criteriile de verificare pentru această meserie.</p>}
        <p className="mt-2 text-xs leading-relaxed text-stone-600">Anunțurile nu formează un eșantion reprezentativ al tuturor angajaților. Mai multe platforme pot conține aceeași ofertă. Mediana este valoarea din mijlocul unei distribuții; nu este neapărat salariul cel mai frecvent.</p>
        <Link className="mt-2 inline-flex min-h-11 items-center underline underline-offset-2" href="/salarii/acoperire">Vezi acoperirea fiecărei meserii și criteriile de publicare</Link>
      </div>
      <details className="mt-3 border-t border-stone-200 text-xs text-stone-600">
        <summary className="min-h-11 cursor-pointer py-3 font-medium text-stone-900">Sursa și detaliile cifrei</summary>
        <p className="leading-relaxed">{r.note}</p>
        <p className="mt-2">Populația descrisă: {r.population}.</p>
        {!!a?.examples?.length && <ul className="mt-3 space-y-2">{a.examples.map(o => <li key={o.url}><a className="inline-flex min-h-11 items-center underline" href={o.url} rel="nofollow noopener">{o.source}: {o.min.toLocaleString('ro-RO')}–{o.max.toLocaleString('ro-RO')} lei net / lună</a></li>)}</ul>}
      </details>
    </div>
  );
}
