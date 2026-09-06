import type { ReperMeserie } from '@/lib/repere-meserii';
import { indicatorMeserie, textIndicator } from '@/lib/indicator-meserie';

export default function IndicatorSalariu({ reper: r }: { reper: ReperMeserie }) {
  const indicator = indicatorMeserie(r);
  const t = r.triangulare;

  const tipReper =
    r.kind === 'public-grid'
      ? 'Grilă publică legală (Legea 153/2017)'
      : r.kind === 'sector-context'
      ? 'Context statistic INS (nivel de grupă)'
      : 'Mediană salarială netă de piață';

  const explicatieReper =
    r.kind === 'public-grid'
      ? 'Valoare de referință din treptele grilei oficiale de stat, înaintea sporurilor specifice.'
      : r.kind === 'sector-context'
      ? 'Cifră macroeconomică INS calculată din seria sectorului și ancheta ocupațională.'
      : 'Reprezintă suma câștigată cel mai frecvent de masa critică a lucrătorilor (50% sub mediană, 50% peste).';

  return (
    <div data-salary-primary={indicator.metric ?? 'unavailable'}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
          {tipReper}
        </span>
        {t?.scorIncredere && (
          <span className="text-xs text-stone-500">
            Consens surse: <strong className="text-stone-800">{t.scorIncredere}%</strong>
          </span>
        )}
      </div>

      <p className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
        {textIndicator(r)}
      </p>

      <p className="mt-1 text-sm font-medium text-stone-600">
        {r.label} · {r.period}
      </p>
      <p className="mt-1 text-xs text-stone-500">{explicatieReper}</p>

      {/* Intervalul reprezentativ P25 – P75 (Cvartilele pieței) */}
      {r.p25 && r.p75 && r.p25 !== r.p75 && (
        <div className="mt-5 rounded-md border border-stone-200 bg-stone-50/70 p-3.5">
          <div className="flex items-center justify-between text-xs font-medium text-stone-700">
            <span>Interval tipic (P25 – P75)</span>
            <span className="font-semibold text-stone-900">
              {r.p25.toLocaleString('ro-RO')} – {r.p75.toLocaleString('ro-RO')} lei net
            </span>
          </div>
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-stone-200">
            <div className="w-1/4 bg-stone-300" title="Sub P25 (debutanți / salarii de intrare)" />
            <div className="w-2/4 bg-emerald-500" title="P25–P75: 50% din forța de muncă" />
            <div className="w-1/4 bg-stone-300" title="Peste P75 (experiență avansată / seniori)" />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-stone-500">
            <span>Debutant: ~{r.p25.toLocaleString('ro-RO')} lei</span>
            <span className="font-medium text-stone-700">Mediană: {r.value?.toLocaleString('ro-RO')} lei</span>
            <span>Senior: ~{r.p75.toLocaleString('ro-RO')} lei</span>
          </div>
        </div>
      )}

      {/* Card de triangulare multi-sursă */}
      {t && (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {t.anunturi && (
            <div className="rounded border border-stone-200 bg-white p-3 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">1. Anunțuri active</span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  {t.anunturi.surseDistincte ?? 3} surse
                </span>
              </div>
              <div className="mt-1.5 text-stone-700">
                <strong>{t.anunturi.esantion} oferte</strong> verificate
              </div>
              <div className="mt-0.5 text-[11px] text-stone-500">
                pe {t.anunturi.platforme?.join(', ')}
              </div>
              <div className="mt-2 border-t border-stone-100 pt-1.5 font-mono text-[11px] text-stone-700">
                {t.anunturi.interval?.min?.toLocaleString('ro-RO')}–{t.anunturi.interval?.max?.toLocaleString('ro-RO')} lei net
              </div>
            </div>
          )}
          {t.survey && (
            <div className="rounded border border-stone-200 bg-white p-3 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">2. Ghiduri salariale</span>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                  Chestionare
                </span>
              </div>
              <div className="mt-1.5 text-stone-700">
                <strong>{t.survey.valoare?.toLocaleString('ro-RO')} lei</strong> net
              </div>
              <div className="mt-0.5 text-[11px] text-stone-500 truncate" title={t.survey.sursa}>
                {t.survey.sursa}
              </div>
              <div className="mt-2 border-t border-stone-100 pt-1.5 text-[11px] text-stone-600 truncate">
                Rol: {t.survey.rol}
              </div>
            </div>
          )}
          {t.ins && (
            <div className="rounded border border-stone-200 bg-white p-3 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">3. Statistica INS</span>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                  Oficial D112
                </span>
              </div>
              <div className="mt-1.5 text-stone-700">
                CAEN <strong>{t.ins.caen}</strong> · {t.ins.isco}
              </div>
              <div className="mt-0.5 text-[11px] text-stone-500">
                Ancheta FOM121A × FOM106G
              </div>
              <div className="mt-2 border-t border-stone-100 pt-1.5 text-[11px] text-stone-600">
                Etalon macroeconomic
              </div>
            </div>
          )}
        </div>
      )}

      <details className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-600">
        <summary className="min-h-11 cursor-pointer py-2 font-medium text-stone-800 hover:text-stone-900">
          Metodologie detaliată și dublă triangulare
        </summary>
        <p className="mt-2 leading-relaxed">{r.note}</p>

        {t?.anunturi?.distributie && (
          <div className="mt-3 rounded bg-stone-50 p-3 border border-stone-200">
            <span className="font-semibold text-stone-900">
              Triangularea internă a anunțurilor din piață (3 surse concurente):
            </span>
            <ul className="mt-1.5 list-disc pl-4 space-y-1 text-stone-700">
              {t.anunturi.distributie.map((d: { sursa: string; oferte: number }) => (
                <li key={d.sursa}>
                  <strong>{d.sursa}</strong>: {d.oferte} oferte verificate în lei
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-stone-500">
              Pentru a evita distorsiunile create de politicile comerciale ale unui singur portal de recrutare, colectăm și verificăm concomitent ofertele din 3 platforme independente.
            </p>
          </div>
        )}

        <p className="mt-2.5">
          Sursă primară:{' '}
          <a href={r.url} className="underline underline-offset-2 hover:text-stone-900" rel="nofollow noopener">
            {r.source}
          </a>
          .
        </p>
        <p className="mt-1 text-[11px] text-stone-500">
          Filtre de calitate obligatorii: strict România (fără contracte din diaspora/străinătate), strict contracte în LEI (fără EUR), podea garantată la salariul minim pe economie (2.699 lei net, HG 146/2026), eliminare outlieri P5–P95, vechime sub 18 luni (2025–2026).
        </p>
      </details>
    </div>
  );
}
