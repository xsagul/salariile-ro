import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import * as cheerio from 'cheerio';
const root=import.meta.dirname, raw=path.join(root,'raw');
await fs.mkdir(raw,{recursive:true});
const sources=[
 ['paylab-api','https://www.paylab.com/paylab-api?lang=en'],
 ['paylab-method','https://www.paylab.ro/en/methodology'],
 ['cor-ckan','https://data.gov.ro/api/3/action/package_show?id=clasificarea-ocupatiilor-din-romania'],
 ['eurostat-catalogue','https://ec.europa.eu/eurostat/api/dissemination/catalogue/toc/txt?lang=en'],
 ['eurostat-monthly','https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/earn_ses_monthly?geo=RO&lang=EN'],
 ['ses-ro','https://ec.europa.eu/eurostat/cache/metadata/en/earn_ses2022_esqrs_ro.htm'],
 ['ses-microdata','https://ec.europa.eu/eurostat/web/microdata/structure-of-earnings-survey'],
 ['hays-overview','https://www.hays.ro/en/salary-guide/overview'],
 ['ins-disparitati','https://insse.ro/cms/ro/content/disparităţi-salariale-factori-de-influenţă-anul-2022'],
 ['ejobs-review-2026','https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf'],
 ...['FOM121A','FOM121B','FOM107G','FOM106G','FOM107E'].map(c=>['tempo-'+c,'http://statistici.insse.ro:8077/tempo-ins/matrix/'+c]),
];
const wanted=process.argv.slice(2);let manifest=[];
try{manifest=JSON.parse(await fs.readFile(path.join(raw,'manifest.json'),'utf8'));}catch{}
for(const [id,url] of sources.filter(s=>!wanted.length||wanted.includes(s[0]))){
 try{
  const cached=manifest.find(x=>x.id===id&&x.status===200);if(cached){console.log('CACHED',id);continue;}
  const res=await fetch(url,{signal:AbortSignal.timeout(25000)});const bytes=new Uint8Array(await res.arrayBuffer());
  const type=res.headers.get('content-type')||'';const ext=type.includes('pdf')?'pdf':type.includes('json')?'json':type.includes('html')?'html':'txt';
  const file=id+'.'+ext;await fs.writeFile(path.join(raw,file),bytes);
  let detail={};
  if(type.includes('html')){const $=cheerio.load(new TextDecoder().decode(bytes));$('script,style,nav,footer,header').remove();const txt=$('body').text().replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n');await fs.writeFile(path.join(raw,id+'.text.txt'),txt);
   const links=$('a[href]').map((_,e)=>({text:$(e).text().trim(),url:new URL($(e).attr('href'),res.url).href})).get().filter(l=>/api|docum|xlsx|\.xls|\.pdf|\.zip|licen|term|micro|download|salari|disparit/i.test(l.url+' '+l.text));await fs.writeFile(path.join(raw,id+'.links.json'),JSON.stringify(links,null,2));detail={links:links.length};}
  if(type.includes('json')){let j=JSON.parse(new TextDecoder().decode(bytes));if(j.dimensionsMap)detail={matrixName:j.matrixName,dimensions:j.dimensionsMap.map(d=>({label:d.label||d.dimName,keys:Object.keys(d).filter(k=>k!=='options'),count:d.options.length,sample:d.options.slice(0,5).map(x=>x.label)}))};else if(j.dimension)detail={label:j.label,id:j.id,size:j.size,dimensions:Object.fromEntries(Object.entries(j.dimension).map(([k,v])=>[k,{label:v.label,codes:v.category.label}]))};else if(j.result)detail={title:j.result.title,license:j.result.license_title,resources:j.result.resources?.map(x=>({name:x.name,url:x.url,format:x.format,modified:x.last_modified}))};}
  const entry={id,url,finalUrl:res.url,status:res.status,type,file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),fetchedAt:new Date().toISOString(),detail};manifest=manifest.filter(x=>x.id!==id);manifest.push(entry);await fs.writeFile(path.join(raw,'manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify({id,status:res.status,bytes:bytes.length,detail}));
 }catch(e){const entry={id,url,error:e.message,cause:e.cause?.code,fetchedAt:new Date().toISOString()};manifest=manifest.filter(x=>x.id!==id);manifest.push(entry);await fs.writeFile(path.join(raw,'manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify(entry));}
}
