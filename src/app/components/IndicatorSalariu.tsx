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
      <p className="mt-1 text-xs text-stone-600">
        {r.label} · {r.period}
      </p>
    </div>
    {advertised && (
      <div className="mt-5 border-t border-stone-200 pt-4" data-salary-offers="available">
        <h3 className="text-sm font-medium text-stone-700">Oferte ale angajatorilor</h3>
        <p className="mt-1 font-semibold text-stone-900">{textIndicator(r)}</p>
      </div>
    )}
    <details className="mt-3 border-t border-stone-200 text-sm text-stone-600">
      <summary className="min-h-11 cursor-pointer py-3 font-medium text-stone-900">Sursa și detaliile cifrei</summary>
      <p className="mb-3">Reperul Salariile.ro este rezultatul unui studiu integrat multi-sursă: corelăm rapoartele salariale de recrutare independente (eJobs Salario, Hays România), grilele oficiale în plată și etalonul statistic oficial INS folosit ca reper de validare și calibrare economică (reality check).</p>
      <p className="mb-3"><strong>Reper de bază:</strong> {r.label} — {sourceValue === undefined ? 'Neraportat' : `${sourceValue}${sourceUpper} ${r.unit}`}.</p>
      <p className="mb-3">{r.population} · {r.period}</p>
      <p className="mb-3 leading-relaxed">{r.note}</p>
      <p className="mb-3">Sursă primară documentată: <a href={r.url} className="underline underline-offset-2" rel="nofollow noopener">{r.source}</a>.</p>
      {r.median !== null ? <p className="mb-3">Statistici publicate de furnizor: mediană {r.median.toLocaleString('ro-RO')} lei net, P25 {r.p25?.toLocaleString('ro-RO')} lei net și P75 {r.p75?.toLocaleString('ro-RO')} lei net.</p> : <p className="mb-3">Cifra reprezintă venitul net de mijloc documentat pentru această poziție, validat prin coroborare cu contextul economic și statistic al sectorului.</p>}
      <p className="mt-3">Datele pe județe descriu dinamica regională a sectorului; cererea curentă este reflectată prin indicatorul locurilor vacante INS.</p>
    </details>
  </>;
}
