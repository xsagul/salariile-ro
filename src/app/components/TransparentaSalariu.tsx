import data from '@/data/transparenta-constanta.json';
import { calculStandard } from '@/lib/fiscal';

/**
 * Un exemplu real, publicat de un angajator: salariile de bază și cele cu
 * sporuri pentru funcțiile acestei meserii. Rescris pe 24 septembrie 2026 pe
 * limba cititorului; detaliile de verificare (foaia, rândurile, coloanele) au
 * rămas, dar în secțiunea care se deschide la cerere.
 */
export default function TransparentaSalariu({slug}:{slug:string}) {
  const r=data.records.find(r=>r.slug===slug);
  if(!r) return null;
  const f=(n:number)=>n.toLocaleString('ro-RO');
  return <section className="mt-8 rounded-md border border-stone-200 bg-surface p-5" aria-labelledby="salarii-institutie">
    <h2 id="salarii-institutie" className="text-xl font-bold">Un exemplu real: {data.source}</h2>
    <p className="mt-3 text-sm text-stone-600">Salariile publicate de angajator în {data.period}, pentru {r.roles.join(', ').toLocaleLowerCase('ro-RO')}.</p>
    <dl className="mt-4 space-y-3 text-sm">
      <div><dt className="font-medium">Salariul de bază</dt><dd>{f(r.baseMin)}–{f(r.baseMax)} lei brut pe lună</dd></div>
      <div><dt className="font-medium">Cu sporuri și ture</dt><dd>{f(r.componentsMin)}–{f(r.componentsMax)} lei brut, adică cam {f(calculStandard(r.componentsMin)!.net)}–{f(calculStandard(r.componentsMax)!.net)} lei net</dd></div>
    </dl>
    <p className="mt-4 text-sm text-stone-600">Diferențele vin din grad, vechime, ture și sporuri. E un singur angajator, nu media din țară.</p>
    <details className="mt-3 text-sm text-stone-600"><summary className="min-h-11 cursor-pointer py-3 font-medium">De unde sunt cifrele</summary>
      <p>{r.rows} rânduri de funcții de execuție, fără nume de persoane: {r.locator}. Baza e în coloana D, sporurile lunare în coloanele D–U. Primele anuale, voucherele și indemnizația de hrană nu sunt incluse. Netul e calculat standard și nu reconstituie fluturașe individuale.</p>
      <p className="mt-2">Sursă verificată la {data.checkedAt}.</p>
    </details>
    <a className="inline-flex min-h-11 items-center text-sm underline underline-offset-4" href={data.url}>Deschide raportarea angajatorului (Excel)</a>
  </section>;
}
