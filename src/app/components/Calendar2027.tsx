import Link from "@/app/components/Link";
import {Breadcrumb,GrilaPagina,H1,Lead} from '@/app/components/ui';
import {SARBATORI_LEGALE_2027,zileLucratoareLuna} from '@/lib/sarbatori';
import CalculatorIntervalZile from './CalculatorIntervalZile';
const months=Array.from({length:12},(_,m)=>({name:new Intl.DateTimeFormat('ro-RO',{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2027,m,1))),days:zileLucratoareLuna(2027,m)}));
const total=months.reduce((n,m)=>n+m.days,0);
// Câte sărbători pică în timpul săptămânii: singurul număr care îi spune omului
// câte zile libere în plus are, calculat din aceeași listă ca tabelul.
const sarbatori=Object.keys(SARBATORI_LEGALE_2027).map(k=>{const [m,d]=k.split('-').map(Number);return new Date(Date.UTC(2027,m-1,d)).getUTCDay();});
const inSaptamana=sarbatori.filter(z=>z!==0&&z!==6).length;
export default function Calendar2027({tip}:{tip:'libere'|'lucratoare'}){
 const work=tip==='lucratoare';
 // Aceeași margine și aceeași coloană (3 din 5) ca restul paginilor, nu o coloană centrată.
 return <div className="bg-canvas"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><GrilaPagina continut={<>
  <Breadcrumb items={[{href:'/',label:'Acasă'},{label:work?'Zile lucrătoare 2027':'Zile libere 2027'}]}/>
  <H1>{work?`Zile lucrătoare 2027: ${total} de zile`:'Zile libere 2027: calendarul sărbătorilor legale'}</H1>
  <Lead>{work?`În 2027 sunt ${total} de zile lucrătoare, adică ${(total*8).toLocaleString('ro-RO')} de ore la program de 8 ore pe zi, de luni până vineri.`:`În 2027 sunt ${sarbatori.length} zile de sărbătoare legală, iar ${inSaptamana} pică în timpul săptămânii și îți dau o zi liberă. Paștele ortodox e pe 2 mai.`}</Lead>
  <nav className="mt-5 flex flex-wrap gap-4 text-sm"><Link className="min-h-11 py-3 underline" href={work?'/zile-libere-2027':'/zile-lucratoare-2027'}>{work?'Calendarul zilelor libere':'Tabelul zilelor lucrătoare'}</Link><Link className="min-h-11 py-3 underline" href={`/zile-${tip}-2026`}>Calendar 2026</Link><a download className="min-h-11 py-3 underline" href={`/date/calendar/2027.${work?'csv':'ics'}`}>{work?'Descarcă tabel CSV':'Importă sărbătorile în calendar (ICS)'}</a></nav>
  {work?<div className="my-5 overflow-x-auto"><table className="w-full text-sm"><caption className="sr-only">Norma lunară pentru 2027</caption><thead><tr>{['Luna','Zile lucrătoare','Ore (8/zi)'].map(h=><th scope="col" key={h} className="border-b p-3 text-left">{h}</th>)}</tr></thead><tbody>{months.map(m=><tr key={m.name}><th scope="row" className="border-b p-3 text-left font-normal capitalize">{m.name}</th><td className="border-b p-3">{m.days}</td><td className="border-b p-3">{m.days*8}</td></tr>)}</tbody></table></div>:<div className="my-5 overflow-x-auto"><table className="w-full text-sm"><caption className="sr-only">Sărbători legale 2027</caption><thead><tr><th className="p-3 text-left" scope="col">Data și ziua</th><th className="p-3 text-left" scope="col">Sărbătoarea</th></tr></thead><tbody>{Object.entries(SARBATORI_LEGALE_2027).map(([key,name])=>{const [m,d]=key.split('-').map(Number);return <tr key={key}><th className="border-b p-3 text-left font-normal" scope="row">{new Intl.DateTimeFormat('ro-RO',{day:'numeric',month:'long',weekday:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2027,m-1,d)))}</th><td className="border-b p-3">{name}</td></tr>;})}</tbody></table></div>}
  {work&&<CalculatorIntervalZile an={2027}/>}
  <section className="mt-8 space-y-3 text-sm text-stone-600"><h2 className="text-xl font-bold text-stone-900">De reținut</h2><p>Calendarul arată doar sărbătorile din lege. Zilele libere în plus pe care Guvernul le dă uneori bugetarilor le adăugăm abia după ce sunt aprobate. O sărbătoare care pică în weekend nu se mută luni. Dacă aparții altui cult creștin, Vinerea Mare, Paștele și Rusaliile ți se acordă după calendarul cultului tău. Cine lucrează în ture sau într-o activitate care nu se poate opri are reguli separate.</p><p>Temei: <a className="underline" href="https://legislatie.just.ro/Public/DetaliiDocument/128647">Codul Muncii, art. 139–142</a>. Data Paștelui: <a className="underline" href="https://roea.org/resources-category/calendar-tipic-paschalia/">calendarul și paschalia Episcopiei Ortodoxe Române din America</a>. Verificat la 7 septembrie 2026.</p></section>
 </>}/></div></div>;
}
