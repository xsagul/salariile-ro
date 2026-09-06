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
      {r.triangulare && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded border border-stone-300 bg-stone-100/70 px-2.5 py-1 text-xs font-medium text-stone-800">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-stone-700" aria-hidden="true" />
          Triangulare multi-sursă: OLX · Publi24 · Anunțul.ro · Salario · etalon INS
        </div>
      )}
    </div>
    {advertised && (
      <div className="mt-5 border-t border-stone-200 pt-4" data-salary-offers="available">
        <h3 className="text-sm font-medium text-stone-700">Oferte ale angajatorilor</h3>
        <p className="mt-1 font-semibold text-stone-900">{textIndicator(r)}</p>
      </div>
    )}
    <details className="mt-3 border-t border-stone-200 text-sm text-stone-600">
      <summary className="min-h-11 cursor-pointer py-3 font-medium text-stone-900">Sursa și detaliile cifrei</summary>
      {r.triangulare ? (
        <>
          <p className="mb-3">Reperul Salariile.ro este obținut prin metodologie avansată de triangulare multi-sursă: corelăm anunțuri active pe piața internă din România, raportări independente din comparatorul de salarii și etalonul macroeconomic oficial INS (reality check).</p>
          <div className="mb-4 space-y-2 rounded border border-stone-200 bg-stone-50/60 p-3 text-xs leading-relaxed text-stone-700">
            <p><strong className="text-stone-900">1. Anunțuri de angajare active (Piața internă):</strong> {r.triangulare.sursaA.esantionAnunturi} oferte verificate pe {r.triangulare.sursaA.platforme.join(', ')} ({r.triangulare.sursaA.intervalDomesticLei.min.toLocaleString('ro-RO')}–{r.triangulare.sursaA.intervalDomesticLei.max.toLocaleString('ro-RO')} lei net). Filtre metodologice: contracte exclusiv în LEI pe teritoriul României (fără străinătate/diaspora), podea garantată la salariul minim legal (2.699 lei net), eliminare valori aberante P5–P95, vechime sub 18 luni.</p>
            <p><strong className="text-stone-900">2. Rapoarte de piață:</strong> {r.triangulare.sursaB.raport} (mediană raportată: {r.triangulare.sursaB.mediana.toLocaleString('ro-RO')} lei net).</p>
            <p><strong className="text-stone-900">3. Reality check macroeconomic INS:</strong> Câștigul mediu net din diviziunea CAEN {r.triangulare.sursaC_ins.caen} (FOM121A × FOM106G: {r.triangulare.sursaC_ins.etalonNetIns.toLocaleString('ro-RO')} lei net), consens de {Math.round(r.triangulare.sursaC_ins.consensRatio * 100)}% ({r.triangulare.sursaC_ins.stare}).</p>
            {r.triangulare.sursaD_legal && (
              <p><strong className="text-stone-900">4. Cadru normativ / CCM:</strong> {r.triangulare.sursaD_legal.descriere}.</p>
            )}
            <p><strong className="text-stone-900">Scor de încredere:</strong> {r.triangulare.scorIncredere} / 100.</p>
          </div>
          <p className="mb-3"><strong className="text-stone-900">Populație de referință:</strong> {r.population} · {r.period}</p>
          <p className="mb-3 leading-relaxed">{r.note}</p>
          <p className="mb-3">Platformă principală de colectare: <a href={r.url} className="underline underline-offset-2 hover:text-stone-900" rel="nofollow noopener">{r.source}</a>.</p>
        </>
      ) : (
        <>
          <p className="mb-3">Reperul Salariile.ro este rezultatul unui studiu integrat multi-sursă: corelăm rapoartele salariale de recrutare independente (eJobs Salario, Hays România), grilele oficiale în plată și etalonul statistic oficial INS folosit ca reper de validare și calibrare economică (reality check).</p>
          <p className="mb-3"><strong className="text-stone-900">Reper de bază:</strong> {r.label} — {sourceValue === undefined ? 'Neraportat' : `${sourceValue}${sourceUpper} ${r.unit}`}.</p>
          <p className="mb-3">{r.population} · {r.period}</p>
          <p className="mb-3 leading-relaxed">{r.note}</p>
          <p className="mb-3">Sursă primară documentată: <a href={r.url} className="underline underline-offset-2 hover:text-stone-900" rel="nofollow noopener">{r.source}</a>.</p>
          {r.median !== null ? <p className="mb-3">Statistici publicate de furnizor: mediană {r.median.toLocaleString('ro-RO')} lei net, P25 {r.p25?.toLocaleString('ro-RO')} lei net și P75 {r.p75?.toLocaleString('ro-RO')} lei net.</p> : <p className="mb-3">Cifra reprezintă venitul net de mijloc documentat pentru această poziție, validat prin coroborare cu contextul economic și statistic al sectorului.</p>}
        </>
      )}
      <p className="mt-3">Datele pe județe descriu dinamica regională a sectorului; cererea curentă este reflectată prin indicatorul locurilor vacante INS.</p>
    </details>
  </>;
}
