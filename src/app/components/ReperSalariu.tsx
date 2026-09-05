import { reperMeserie } from '@/lib/repere-meserii';
import type { DateMeserie } from '@/lib/meserii';
import IndicatorSalariu from './IndicatorSalariu';

export default function ReperSalariu({date}:{date:DateMeserie}) {
  const r=reperMeserie(date);
  return <section className="mt-6 rounded-md border border-stone-300 bg-surface p-5 sm:p-6" data-salary-kind={r.kind}>
    <IndicatorSalariu reper={r} />
  </section>;
}
