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
          {t.kind === 'public-grid' ? (
            <>
              <div className="rounded border border-stone-200 bg-white p-3 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">1. Grilă legală bază</span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    Legea 153
                  </span>
                </div>
                <div className="mt-1.5 text-stone-700">
                  <strong>{t.grila?.bazaMin?.toLocaleString('ro-RO')}–{t.grila?.bazaMax?.toLocaleString('ro-RO')} lei</strong> net
                </div>
                <div className="mt-0.5 text-[11px] text-stone-500">
                  Salariu de bază pe trepte
                </div>
                <div className="mt-2 border-t border-stone-100 pt-1.5 text-[11px] text-stone-600 truncate">
                  Fără sporuri și indemnizații
                </div>
              </div>

              <div className="rounded border border-stone-200 bg-white p-3 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">2. Transparență D112</span>
                  <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                    În plată
                  </span>
                </div>
                <div className="mt-1.5 text-stone-700">
                  <strong>{t.median?.toLocaleString('ro-RO')} lei</strong> net median
                </div>
                <div className="mt-0.5 text-[11px] text-stone-500 truncate">
                  Fluturași reali cu sporuri
                </div>
                <div className="mt-2 border-t border-stone-100 pt-1.5 text-[11px] text-stone-600 truncate">
                  P25: {t.p25?.toLocaleString('ro-RO')} · P75: {t.p75?.toLocaleString('ro-RO')} lei
                </div>
              </div>

              <div className="rounded border border-stone-200 bg-white p-3 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">3. Statistica INS</span>
                  <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                    Sector public
                  </span>
                </div>
                <div className="mt-1.5 text-stone-700">
                  CAEN <strong>{t.ins?.caen}</strong> · {t.ins?.isco}
                </div>
                <div className="mt-0.5 text-[11px] text-stone-500">
                  Ancheta FOM121A × FOM106G
                </div>
                <div className="mt-2 border-t border-stone-100 pt-1.5 text-[11px] text-stone-600">
                  Etalon macroeconomic
                </div>
              </div>
            </>
          ) : (
            <>
              {t.anunturi ? (
                <div className="rounded border border-stone-200 bg-white p-3 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">1. Anunțuri active</span>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      {t.anunturi.surseDistincte} {t.anunturi.surseDistincte === 1 ? 'sursă' : 'surse'}
                    </span>
                  </div>
                  <div className="mt-1.5 text-stone-700">
                    <strong>{t.anunturi.esantion} oferte</strong> verificate
                  </div>
                  <div className="mt-0.5 text-[11px] text-stone-500">
                    pe {t.anunturi.platforme?.join(' și ')}
                  </div>
                  <div className="mt-2 border-t border-stone-100 pt-1.5 font-mono text-[11px] text-stone-700">
                    {t.anunturi.interval?.min?.toLocaleString('ro-RO')}–{t.anunturi.interval?.max?.toLocaleString('ro-RO')} lei net
                  </div>
                </div>
              ) : (
                <div className="rounded border border-stone-200 bg-white p-3 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">1. Anunțuri active</span>
                    <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                      Transparență redusă
                    </span>
                  </div>
                  <div className="mt-1.5 text-stone-700">
                    Salariu confidențial online
                  </div>
                  <div className="mt-0.5 text-[11px] text-stone-500">
                    Negociere directă la interviu
                  </div>
                  <div className="mt-2 border-t border-stone-100 pt-1.5 text-[11px] text-stone-600">
                    Ancorat în Salario & INS
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
            </>
          )}
        </div>
      )}

      <details className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-600">
        <summary className="min-h-11 cursor-pointer py-2 font-medium text-stone-800 hover:text-stone-900">
          Metodologie detaliată și triangulare pe 3 surse (Snapshot: septembrie 2026)
        </summary>
        <p className="mt-2 leading-relaxed">{r.note}</p>

        {t?.anunturi?.distributie && (
          <div className="mt-3 rounded bg-stone-50 p-3 border border-stone-200">
            <span className="font-semibold text-stone-900">
              Distribuția ofertelor verificate din piață (crawling direct & deduplicare anti-spam):
            </span>
            <ul className="mt-1.5 list-disc pl-4 space-y-1 text-stone-700">
              {t.anunturi.distributie.map((d: { sursa: string; oferte: number }) => (
                <li key={d.sursa}>
                  <strong>{d.sursa}</strong>: {d.oferte} poziții unice verificate în lei
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-stone-500">
              Garanție anti-spam: 1 post = 1 vot. Dacă o companie clonează același anunț în zeci de orașe, sistemul reține o singură observație. Se filtrează strict contractele cu normă întreagă, salariile exprimate brut sunt convertite la net conform Codului Fiscal 2026, iar vechimea anunțurilor este sub 18 luni (martie 2025 – septembrie 2026).
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
