import fs from 'node:fs';
import * as cheerio from 'cheerio';
import {MESERII,dateMeserieSauEroare} from '../src/lib/meserii';
import {reperMeserie} from '../src/lib/repere-meserii';
const queue=MESERII.filter(m=>reperMeserie(dateMeserieSauEroare(m)).kind==='sector-context');
const results:object[]=[];
await Promise.all(Array.from({length:4},async()=>{
 while(queue.length){
  const m=queue.shift()!;const url=`https://www.ejobs.ro/salario/salarii-${m.slug}`;
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(15000)});const dom=cheerio.load(await response.text());
   dom('script,style,nav,header,footer').remove();const title=dom('h1').text().trim();
   const text=dom('body').text().replace(/\s+/g,' ').trim();
   const match=text.slice(0,650).match(/([\d.]+) Lei \(net\).*?introduse de ([\d.]+) specialiști/i);
   const n=match?Number(match[2].replaceAll('.','')):null;
   results.push({slug:m.slug,url:response.url,status:response.status,role:title.replace(/^Salariu\s+/i,''),net:match?Number(match[1].replaceAll('.','')):null,providerN:n,excerpt:text.slice(0,Math.min(350,text.indexOf('Vezi unde')>0?text.indexOf('Vezi unde'):350)),decision:match&&response.url===url&&n!>=30?'eligible-after-role-review':'insufficient-evidence'});
  }catch(error){results.push({slug:m.slug,url,error:String(error),decision:'fetch-failed'});}
 }
}));
results.sort((a,b)=>(a as {slug:string}).slug.localeCompare((b as {slug:string}).slug));
fs.writeFileSync('research/surse-salarii/salario-pagini.json',JSON.stringify({checkedAt:'2026-09-07',method:'Pagini individuale ale furnizorului, fără reproducerea anunțurilor. Perioada raportărilor nu este publicată.',records:results},null,2)+'\n');
console.log(results.map(r=>{const x=r as {slug:string;net:number;providerN:number;role:string};return `${x.slug} | ${x.net??'—'} | n=${x.providerN??'—'} | ${x.role??''}`;}).join('\n'));
