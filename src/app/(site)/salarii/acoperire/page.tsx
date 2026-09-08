import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb, H1, Lead } from '@/app/components/ui';
import { MESERII } from '@/lib/meserii';
import { ACOPERIRE_ANUNTURI, DATA_VERIFICARE_ANUNTURI, PRAGURI_ANUNTURI, INVENTAR_SURSE } from '@/lib/acoperire-anunturi';

export const metadata: Metadata = {
  title: 'Acoperirea datelor salariale pe meserii',
  description: 'Câte anunțuri salariale eligibile avem pentru fiecare meserie, din ce surse provin și când datele sunt insuficiente.',
  alternates: { canonical: 'https://salariile.ro/salarii/acoperire' },
};
export default function Acoperire() {
  const rows = MESERII.map(m => ({ m, a: ACOPERIRE_ANUNTURI[m.slug] })).sort((x,y) => (y.a?.n ?? 0)-(x.a?.n ?? 0) || x.m.nume.localeCompare(y.m.nume,'ro'));
  const total = rows.reduce((sum,r)=>sum+(r.a?.n ?? 0),0);
  const totalNedeclarat = rows.reduce((sum,r)=>sum+(r.a?.undeclaredBasis?.n ?? 0),0);
  const cuDate = rows.filter(r=>(r.a?.n ?? 0) > 0).length;
  const publicabile = rows.filter(r=>r.a?.medianBounds).length;
  const surseIncomplete = Object.entries(INVENTAR_SURSE).filter(([,s])=>!s.catalogPassComplete);
  return <div className="bg-canvas"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <Breadcrumb items={[{href:'/',label:'Acasă'},{href:'/salarii',label:'Salarii pe meserii'},{label:'Acoperirea datelor'}]} />
    <H1>Cât știm despre salariile pe meserii</H1>
    <Lead>{total.toLocaleString('ro-RO')} anunțuri eligibile după verificare și deduplicare, plus {totalNedeclarat.toLocaleString('ro-RO')} cu bază nedeclarată. {cuDate} din {MESERII.length} meserii au cel puțin o observație; {publicabile} trec toate pragurile de publicare.</Lead>
    {!!surseIncomplete.length && <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-stone-800">
      <strong>Colectarea este în curs.</strong> {surseIncomplete.map(([nume,s])=>`${nume} ${s.catalogChecked.toLocaleString('ro-RO')} din ${s.catalogCandidates.toLocaleString('ro-RO')}`).join(', ')}.
      Cifrele de mai jos descriu ce am verificat până acum, nu inventarul întreg. Meseriile sub praguri pot trece pe măsură ce parcurgerea avansează.
    </p>}
    <p className="mt-3 text-sm text-stone-600">Ultima colectare: {new Date(DATA_VERIFICARE_ANUNTURI).toLocaleDateString('ro-RO', {timeZone:'Europe/Bucharest'})}. Un anunț reprezintă o ofertă, nu salariul încasat de un angajat.</p>
    <div className="mt-6 max-w-3xl space-y-3 text-sm leading-relaxed text-stone-700">
      <p>Păstrăm anunțuri cu ocupație identificabilă, normă întreagă, muncă în România și o sumă explicită. Cifra principală se calculează doar din anunțurile care precizează net sau brut; restul sunt numărate separat. Convertim brutul în net prin calculul fiscal standard și euro în lei la cursul de referință BCE datat. Registrul păstrează suma originală și fiecare conversie. Comisioanele fără salariu de bază, pachetele care includ beneficii fără defalcare și remunerațiile pe oră rămân în afara comparației.</p>
      <p>Unele anunțuri omit perioada plății. Pentru acestea păstrăm separat ipoteza unui salariu lunar la normă întreagă. Afișăm câte observații au perioada lunară explicită și verificăm cât se schimbă rezultatul fără cele cu perioadă presupusă.</p>
      <p>Pentru publicarea limitelor medianei ofertelor cerem cel puțin {PRAGURI_ANUNTURI.minAds} anunțuri, {PRAGURI_ANUNTURI.minEmployers} angajatori identificați, {PRAGURI_ANUNTURI.minCounties} județe identificate și {PRAGURI_ANUNTURI.minSources} platforme. Verificăm și concentrarea pe angajator și platformă. Aceste praguri sunt reguli operaționale; nu garantează reprezentativitatea națională.</p>
      <p>Cerem și minimum {PRAGURI_ANUNTURI.minExplicitMonthly} oferte cu perioadă lunară explicită. Dacă rezultatul se modifică cu peste {Math.round(PRAGURI_ANUNTURI.maxSensitivity*100)}% la eliminarea unei platforme sau a perioadelor presupuse, nu publicăm un reper central. Acesta este un test de sensibilitate, nu un interval de încredere statistică.</p>
      <p>Păstrăm intervalele oferite. Reperul central, când există suficiente date, este mediana mijloacelor intervalelor, o estimare. Afișăm și limitele posibile ale medianei. Nu deducem nivelurile de junior sau senior din quartile și nu amestecăm anunțurile cu mediile Salario ori cu treptele grilelor publice.</p>
      <p>Aproape jumătate dintre anunțurile care dau o sumă nu spun dacă e netă sau brută. Nu presupunem netul: 3.600 lei brut înseamnă aproximativ 2.100 lei net, iar diferența ar strica orice comparație. Aceste anunțuri formează o cohortă separată, numărată și publicată alături, dar niciodată adunată la cifra principală.</p>
      <p>Un anunț poate angaja mai multe meserii deodată. Când textul leagă o meserie de o sumă, fiecare meserie primește observația ei; când anunțul dă o singură sumă pentru toate posturile, aceeași sumă se atribuie fiecărei meserii și este marcată ca atare. Un anunț rămâne un singur anunț pentru pragurile de concentrare.</p>
      <p>Fotografia pieței descrie perioada colectării. O ofertă poate expira după verificare; cifra nu este o prognoză pentru următoarele luni. Niciun inventar public nu garantează accesul la toate posturile unei platforme.</p>
      <p>Un anunț necunoscut sau exclus nu dovedește că meseria este prost plătită. Înseamnă că sursa nu oferă suficiente informații pentru comparația noastră. Linkurile și sumele acceptate sunt disponibile în <a className="underline" href="/date/anunturi-verificate.json">registrul observațiilor</a>.</p>
    </div>
    {!!Object.keys(INVENTAR_SURSE).length && <section className="mt-8"><h2 className="text-xl font-bold text-stone-900">Cât am parcurs din fiecare sursă</h2><div className="mt-3 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-stone-300 text-left"><th className="p-3">Sursă</th><th className="p-3">URL-uri în inventar</th><th className="p-3">Candidate pentru catalog verificate</th><th className="p-3">Starea parcurgerii</th></tr></thead><tbody>{Object.entries(INVENTAR_SURSE).map(([source,s])=><tr key={source} className="border-b border-stone-200"><th className="p-3 text-left">{source}</th><td className="p-3">{s.inventoryUrls.toLocaleString('ro-RO')}</td><td className="p-3">{s.catalogChecked.toLocaleString('ro-RO')} / {s.catalogCandidates.toLocaleString('ro-RO')}</td><td className="p-3">{s.catalogPassComplete?'Inventarul accesibil parcurs':'Parcurgere incompletă'}{s.events.some(e=>e.error.includes('429') || e.error.includes('403') || e.error.includes('challenge'))?' · limitare de acces întâlnită':''}</td></tr>)}</tbody></table></div></section>}
    <div className="mt-8 overflow-x-auto"><table className="w-full text-sm">
      <caption className="sr-only">Acoperirea anunțurilor salariale pentru fiecare meserie</caption>
      <thead className="text-left text-stone-700"><tr className="border-b border-stone-300"><th className="p-3">Meserie</th><th className="p-3 text-right">Anunțuri / lunar explicit</th><th className="p-3 text-right">Bază nedeclarată</th><th className="p-3 text-right">Angajatori</th><th className="p-3 text-right">Județe</th><th className="p-3">Surse</th><th className="p-3">Publicarea medianei ofertelor</th></tr></thead>
      <tbody>{rows.map(({m,a})=><tr key={m.slug} className="border-b border-stone-200"><th scope="row" className="p-3 text-left font-medium"><Link className="inline-flex min-h-11 items-center underline" href={`/salarii/${m.slug}`}>{m.nume}</Link></th><td className="p-3 text-right">{a?.n ?? 0} / {a?.explicitMonthly ?? 0}</td><td className="p-3 text-right text-stone-600">{a?.undeclaredBasis?.n ?? 0}</td><td className="p-3 text-right">{a?.employers ?? 0}</td><td className="p-3 text-right">{a?.counties ?? 0}</td><td className="p-3 text-stone-600">{a ? Object.entries(a.sourceCounts).map(([s,n])=>`${s}: ${n}`).join(' · ') || '—' : '—'}</td><td className="p-3 text-stone-600">{a?.medianBounds ? 'Limite calculabile' : a?.n ? 'Acoperire insuficientă' : 'Fără anunțuri eligibile'}</td></tr>)}</tbody>
    </table></div>
  </div></div>;
}
