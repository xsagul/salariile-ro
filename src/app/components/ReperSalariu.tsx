import { reperMeserie, textReper } from '@/lib/repere-meserii';
import type { DateMeserie } from '@/lib/meserii';

export default function ReperSalariu({date}:{date:DateMeserie}) {
  const r=reperMeserie(date);
  return <section className="mt-6 rounded-md border border-stone-300 bg-surface p-5 sm:p-6" data-salary-kind={r.kind}>
    <h2 className="text-sm font-semibold text-stone-700">{r.label}</h2>
    <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900">{textReper(r)} <span className="text-base font-normal">{r.unit}</span></p>
    <details className="mt-3 border-t border-stone-200 text-sm text-stone-600">
      <summary className="min-h-11 cursor-pointer py-3 font-medium text-stone-900">Sursa și detaliile cifrei</summary>
      <p className="mb-3">{r.population} · {r.period}</p>
      <p className="mb-3 leading-relaxed">{r.note}</p>
      <p className="mb-3">Sursă: <a href={r.url} className="underline underline-offset-2" rel="noopener">{r.source}</a>.</p>
      {r.median !== null ? <p>Statistici publicate de furnizor pentru oferte: mediană {r.median.toLocaleString('ro-RO')} lei net, P25 {r.p25?.toLocaleString('ro-RO')} lei net și P75 {r.p75?.toLocaleString('ro-RO')} lei net. Numărul exact de anunțuri din selecție nu este publicat. Nu reprezintă distribuția salariilor plătite tuturor programatorilor din România.</p> : <p>Mediana, P25/P75 și numărul de observații individuale pentru această meserie nu sunt disponibile în acest reper. Intervalul unei grile descrie trepte de încadrare.</p>}
      <p className="mt-3">Datele pe județe de mai jos descriu sectorul; vârsta nu măsoară experiența profesională.</p>
    </details>
  </section>;
}
