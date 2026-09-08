import Link from 'next/link';
import type { ReperMeserie } from '@/lib/repere-meserii';
import { indicatorMeserie, textIndicator } from '@/lib/indicator-meserie';

/**
 * Cifra si o singura propozitie care spune ce masoara. Cate anunturi stau in
 * spate, din ce surse si cat de tare e dovada nu apartin aici: sunt pe pagina de
 * acoperire, la un click, pentru cine le cere. Cine intreaba „cat castiga un
 * electrician" nu are nevoie de metodologie ca sa primeasca raspunsul.
 */
export default function IndicatorSalariu({ reper: r, slug }: { reper: ReperMeserie; slug: string }) {
  const indicator = indicatorMeserie(r), a = r.anunturi;
  const platforme = Object.keys(a?.sourceCounts ?? {}).length;
  const explanation = r.kind === 'public-grid'
    ? 'Trepte din grila de salarizare, convertite în net. Fără sporuri și fără vechime individuală.'
    : r.kind === 'sector-context'
    ? 'Reper pentru o grupă largă de ocupații din acest sector. INS nu publică salarii pe meseria exactă.'
    : r.kind === 'external-advertised'
    ? `Mediana salariilor oferite în ${a?.n} anunțuri verificate de noi, din ${platforme} platforme.`
    : 'Medie din raportări voluntare ale angajaților, în sursa citată.';
  return (
    <div data-salary-primary={indicator.metric ?? 'unavailable'}>
      <p className="text-xs font-medium text-stone-700">{r.label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{textIndicator(r)}</p>
      <p className="mt-1 text-sm text-stone-600">pe lună · {r.period}</p>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{explanation}</p>
      <p className="mt-3 text-xs text-stone-600">
        Sursă:{' '}
        {r.url.startsWith('http') && !r.url.includes('salariile.ro')
          ? <a className="underline underline-offset-2" href={r.url} rel="nofollow noopener">{r.source}</a>
          : <Link className="underline underline-offset-2" href="/salarii/acoperire">{r.source}</Link>}
        {' · '}
        <Link className="underline underline-offset-2" href={`/salarii/acoperire#${slug}`}>
          {a?.n ? `anunțurile din spate (${a.n})` : 'cum verificăm anunțurile'}
        </Link>
      </p>
    </div>
  );
}
