'use client';
import {useState} from 'react';
import {zileLucratoareInterval} from '@/lib/sarbatori';
export default function CalculatorIntervalZile({an=2026}:{an?:number}) {
 const [start,setStart]=useState(`${an}-01-01`),[end,setEnd]=useState(`${an}-12-31`);
 let result=null,error='';
 try{result=zileLucratoareInterval(start,end);}catch(e){error=(e as Error).message;}
 return <section className="mt-8 rounded-md border border-stone-200 bg-surface p-5">
  <h2 className="text-xl font-bold">Calculează zilele lucrătoare pe interval</h2>
  <div className="mt-4 flex flex-wrap gap-4">{[{id:'start',label:'Prima zi',value:start,set:setStart},{id:'end',label:'Ultima zi',value:end,set:setEnd}].map(x=><label key={x.id} className="text-sm font-medium">{x.label}<input type="date" className="mt-2 block min-h-11 rounded border border-stone-400 bg-surface px-3 text-base" min="2026-01-01" max="2027-12-31" value={x.value} onChange={e=>x.set(e.target.value)} aria-invalid={!!error} aria-describedby="interval-rezultat"/></label>)}</div>
  <p id="interval-rezultat" aria-live="polite" className="mt-4 font-semibold">{error || `${result!.lucratoare} zile lucrătoare · ${result!.ore} ore la 8 ore/zi`}</p>
  <p className="mt-2 text-sm text-stone-600">Ambele date sunt incluse. Program luni–vineri, sărbători ortodoxe. Nu scădem concedii și nu adăugăm punți sau recuperări stabilite separat.</p>
 </section>;
}
