"use client";
import { useState } from 'react';
import type { ReperMeserie } from '@/lib/repere-meserii';
import IndicatorSalariu from './IndicatorSalariu';

export type OptiuneComparatie = {slug:string; name:string; activity:string; description:string; reference:ReperMeserie};
export default function AlegeComparatie({options}:{options:OptiuneComparatie[]}) {
  const [first,setFirst]=useState(options[0]?.slug ?? '');
  const [second,setSecond]=useState(options[1]?.slug ?? '');
  const a=options.find(x=>x.slug===first),b=options.find(x=>x.slug===second);
  if(!a||!b) return null;
  return <section className="mt-8 rounded-md border border-stone-300 bg-surface p-5 sm:p-6" aria-labelledby="alege-comparatie">
    <h2 id="alege-comparatie" className="text-xl font-bold">Alege oricare două meserii</h2>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {([{id:'meserie-a',label:'Prima meserie',value:first,change:setFirst},{id:'meserie-b',label:'A doua meserie',value:second,change:setSecond}]).map(x=><div key={x.id}>
        <label htmlFor={x.id} className="block text-sm font-medium">{x.label}</label>
        <select id={x.id} value={x.value} onChange={e=>x.change(e.target.value)} className="mt-2 min-h-11 w-full rounded border border-stone-300 bg-surface px-3 text-base">
          {options.map(o=><option key={o.slug} value={o.slug}>{o.name}</option>)}
        </select>
      </div>)}
    </div>
    {first===second ? <p role="status" className="mt-5">Ai ales aceeași meserie. Selectează o a doua meserie pentru comparație.</p> : <div aria-live="polite" aria-atomic="true">
      <div className="mt-6 grid gap-6 sm:grid-cols-2">{[a,b].map(o=><article key={o.slug}>
        <h3 className="text-lg font-semibold"><a href={`/salarii/${o.slug}`} className="underline underline-offset-4">{o.name}</a></h3>
        <div className="mt-3"><IndicatorSalariu reper={o.reference} /></div>
        <p className="mt-4 text-sm">{o.description}</p>
      </article>)}</div>
    </div>}
  </section>;
}
