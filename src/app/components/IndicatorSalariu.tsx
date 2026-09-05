import type { ReperMeserie } from '@/lib/repere-meserii';
import { indicatorMeserie, textIndicator } from '@/lib/indicator-meserie';

/** Aceeași selecție și proveniență în pagina meseriei și în ambele comparatoare. */
export default function IndicatorSalariu({ reper: r }: { reper: ReperMeserie }) {
  const indicator = indicatorMeserie(r);
  const advertised = r.kind === 'external-advertised';
  const sourceValue = r.value?.toLocaleString('ro-RO');
  const sourceUpper = r.upper !== null && r.upper !== r.value ? `–${r.upper.toLocaleString('ro-RO')}` : '';

  return <>
    <div data-salary-primary={indicator.metric ?? 'unavailable'}>
      <h2 className="text-sm font-semibold text-stone-700">Reper Salariile.ro</h2>
      <p className={`mt-2 font-bold tracking-tight text-stone-900 ${indicator.value === null ? 'text-xl' : 'text-3xl'}`}>
        {textIndicator(r)}
      </p>
    </div>
    <div className="mt-5 border-t border-stone-200 pt-4" data-salary-offers={advertised ? 'available' : 'unavailable'}>
      <h3 className="text-sm font-medium text-stone-700">Oferte ale angajatorilor</h3>
      <p className="mt-1 font-semibold text-stone-900">{advertised ? textIndicator(r) : 'Date insuficiente'}</p>
    </div>
    <details className="mt-3 border-t border-stone-200 text-sm text-stone-600">
      <summary className="min-h-11 cursor-pointer py-3 font-medium text-stone-900">Sursa și detaliile cifrei</summary>
      <p className="mb-3">Reperul Salariile.ro selectează mediana disponibilă, apoi media pentru meserie. Este un reper citat, nu o măsurare proprie. Sumele sunt lunare.</p>
      {advertised && <p className="mb-3">Reperul și ofertele folosesc aceeași mediană publicată de DevJob. Anunțul și suma oferită de angajator sunt aceeași sursă, fără dublarea observațiilor.</p>}
      <p className="mb-3">{r.label}: {sourceValue === undefined ? 'Neraportat' : `${sourceValue}${sourceUpper} ${r.unit}`}.</p>
      <p className="mb-3">{r.population} · {r.period}</p>
      <p className="mb-3 leading-relaxed">{r.note}</p>
      <p className="mb-3">Sursă: <a href={r.url} className="underline underline-offset-2" rel="noopener">{r.source}</a>.</p>
      {r.median !== null ? <p>Statistici publicate de furnizor pentru oferte: mediană {r.median.toLocaleString('ro-RO')} lei net, P25 {r.p25?.toLocaleString('ro-RO')} lei net și P75 {r.p75?.toLocaleString('ro-RO')} lei net. Numărul exact de anunțuri din selecție nu este publicat. Nu reprezintă distribuția salariilor plătite tuturor angajaților acestei meserii din România.</p> : <p>Mediana, P25/P75 și numărul de observații individuale pentru această meserie nu sunt disponibile în acest reper. Intervalul unei grile descrie trepte de încadrare.</p>}
      <p className="mt-3">Datele pe județe descriu sectorul; vârsta nu măsoară experiența profesională. „Date insuficiente” nu înseamnă salariu zero sau lipsa ofertelor de muncă.</p>
    </details>
  </>;
}
