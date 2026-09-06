import data from '@/data/transparenta-constanta.json';
import { calculStandard } from '@/lib/fiscal';

export default function TransparentaSalariu({slug}:{slug:string}) {
  const r=data.records.find(r=>r.slug===slug);
  if(!r) return null;
  const f=(n:number)=>n.toLocaleString('ro-RO');
  return <section className="mt-8 rounded-md border border-stone-200 bg-surface p-5" aria-labelledby="salarii-institutie">
    <h2 id="salarii-institutie" className="text-xl font-bold">Bază și sporuri publicate de un angajator</h2>
    <p className="mt-3 text-sm text-stone-600">{data.source} · {data.period}. {r.rows} rânduri de funcții de execuție publicate, fără identificatori de persoane.</p>
    <dl className="mt-4 space-y-3 text-sm">
      <div><dt className="font-medium">Salarii de bază publicate</dt><dd>{f(r.baseMin)}–{f(r.baseMax)} lei brut / lună</dd></div>
      <div><dt className="font-medium">Bază și componente lunare publicate</dt><dd>{f(r.componentsMin)}–{f(r.componentsMax)} lei brut / lună</dd></div>
      <div><dt className="font-medium">Conversie fiscală standard a componentelor</dt><dd>{f(calculStandard(r.componentsMin)!.net)}–{f(calculStandard(r.componentsMax)!.net)} lei net / lună, estimat</dd></div>
    </dl>
    <p className="mt-4 text-sm text-stone-600">Intervalul include diferențe de grad, vechime, ture și sporuri. Nu este intervalul pieței naționale și nici o mediană a angajaților. Conversia standard nu reconstituie fluturașele individuale. Excludem voucherele și indemnizația de hrană anuală.</p>
    <details className="mt-3 text-sm text-stone-600"><summary className="min-h-11 cursor-pointer py-3 font-medium">Funcții și calcul verificabil</summary>
      <p>{r.roles.join('; ')}.</p><p className="mt-2">{r.locator}. Bază: coloana D. Componente lunare: D–U. Componente anuale excluse: V–W. Rândurile publicate nu dovedesc numărul de persoane distincte.</p>
    </details>
    <a className="inline-flex min-h-11 items-center text-sm underline underline-offset-4" href={data.url}>Deschide raportarea angajatorului (Excel)</a>
    <p className="text-xs text-stone-600">Sursă verificată la {data.checkedAt}.</p>
  </section>;
}
