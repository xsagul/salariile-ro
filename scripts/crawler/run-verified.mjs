import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { fetchPage, hash } from './http.mjs';
import { occupations, queriesFor, classifyTitle } from './occupations.mjs';
import { olxState, olxRecord, detailRecord, assess } from './extract.mjs';
import { deduplicate, summarize } from './aggregate.mjs';
import { POLICY, canonicalUrl } from './policy.mjs';

const arg = (key, fallback) => process.argv.find(x=>x.startsWith(`--${key}=`))?.split('=').slice(1).join('=') || fallback;
const run = arg('run', new Date().toISOString().replace(/[:.]/g,'-'));
if (!/^[a-zA-Z0-9_-]+$/.test(run)) throw new Error('Invalid run id');
const pages = Number(arg('pages','3')), queryCount = Number(arg('queries','1'));
if (![pages,queryCount].every(x=>Number.isInteger(x)&&x>0&&x<=10)) throw new Error('Invalid crawl budget');
const sources = arg('sources','olx,ejobs,bestjobs,publi24,anuntul').split(',');
const selected = arg('slugs','').split(',').filter(Boolean);
const jobs = selected.length ? occupations.filter(j=>selected.includes(j.slug)) : occupations;
if (!jobs.length || selected.some(s=>!occupations.some(j=>j.slug===s))) throw new Error('Unknown occupation');
const root = `.cercetare-privata/crawl-runs/${run}`, evidenceDir = `${root}/evidence`;
fs.mkdirSync(root,{recursive:true});
const records = [], rejected = [], events = [], seen = new Set();
const checkpoint = () => { fs.writeFileSync(`${root}/checkpoint.json`,JSON.stringify({policy:POLICY,records,rejected,events},null,2)); };
function log(event) { events.push({ ...event, at:new Date().toISOString() }); if (event.error) console.log(`${event.source}: ${event.error}`); }
async function detail(url,source) {
  url=canonicalUrl(url); if(seen.has(url))return; seen.add(url);
  try {
    const page=await fetchPage(url,evidenceDir), result=assess(detailRecord(page,source),page);
    if(result.accepted)records.push(result.observation); else rejected.push({...result,url,source});
  } catch(e){rejected.push({url,source,reasons:[e.message]});}
}
async function crawlSource(source) {
  if(!['olx','ejobs','bestjobs','publi24','anuntul'].includes(source))throw new Error('Unknown source '+source);
  const globalSignatures = new Set();
  for(let index=0;index<jobs.length;index++) {
    const job=jobs[index];
    for(const query of queriesFor(job).slice(0,queryCount)) {
      let cursor=null; const pageSignatures=new Set();
      for(let pageNo=1;pageNo<=pages;pageNo++) {
        const slug=query.replace(/ /g,'-');
        const url=source==='olx'?`https://www.olx.ro/locuri-de-munca/q-${encodeURIComponent(slug)}/?page=${pageNo}`:
          source==='ejobs'?`https://www.ejobs.ro/locuri-de-munca/${encodeURIComponent(slug)}${pageNo>1?'/pagina'+pageNo:''}`:
          source==='bestjobs'?`https://www.bestjobs.eu/ro/locuri-de-munca?keyword=${encodeURIComponent(query)}${cursor?'&cursor='+encodeURIComponent(cursor):''}`:
          source==='publi24'?`https://www.publi24.ro/anunturi/locuri-de-munca/?q=${encodeURIComponent(query)}&pag=${pageNo}`:
          `https://www.anuntul.ro/anunturi-locuri-de-munca/oferte-full-time/?q=${encodeURIComponent(query)}&page=${pageNo}`;
        try {
          const page=await fetchPage(url,evidenceDir),$=cheerio.load(page.html);let urls=[];
          if(source==='olx') {
            const ads=olxState(page.html)?.listing?.listing?.ads;
            if(!Array.isArray(ads))throw new Error('listing_schema_changed');
            const sig=hash(ads.map(a=>a.id).sort().join(','));if(pageSignatures.has(sig))break;pageSignatures.add(sig);
            // SSR includes description and salary. Pre-screen then fetch the actual detail.
            for(const ad of ads) {const result=assess(olxRecord(ad),page); if(result.accepted)urls.push(ad.url);else if(!seen.has(ad.url)){rejected.push({...result,url:ad.url,source});seen.add(ad.url);} }
            if(!ads.length)break;
          } else if(source==='bestjobs') {
            const raw=$('#__NEXT_DATA__').text();if(!raw)throw new Error('listing_schema_changed');
            const list=JSON.parse(raw).props?.pageProps?.jobListCardsFromServer;if(!list)throw new Error('listing_schema_changed');
            urls=(list.items||[]).filter(i=>i.salary&&!i.estimatedSalary && classifyTitle(i.title || '').slug===job.slug).map(i=>`https://www.bestjobs.eu/loc-de-munca/${i.slug}`);cursor=list.nextCursor;
          } else if(source==='ejobs') {
            urls=$('.job-card-content-middle__salary').toArray().map(e=>$(e).closest('.job-card-content-middle').find('a[href*="/user/locuri-de-munca/"]').first().attr('href')).filter(Boolean).map(u=>new URL(u,url).href);
            // Only the first cards are in the SSR DOM; the complete result list is in JSON-LD.
            $('script[type="application/ld+json"]').each((_,e)=>{
              try { const nodes=JSON.parse($(e).text())['@graph'] || [];
                for(const node of nodes)for(const item of node.mainEntity?.itemListElement || []) {
                  if(classifyTitle(item.item?.name || '').slug===job.slug && item.url)urls.push(item.url);
                }
              }catch { /* diagnosed by empty candidate count */ }
            });
          } else {
            const selector=source==='publi24'?'a[href*="/anunt/"]':'a[href*="/anunt-angajare-"]';
            urls=$(selector).toArray().filter(e=>classifyTitle($(e).text().trim()).slug).map(e=>new URL($(e).attr('href'),url).href);
          }
          urls=[...new Set(urls.map(canonicalUrl))];
          const sig=hash(urls.slice().sort().join(','));if(source!=='olx'&&pageSignatures.has(sig))break;pageSignatures.add(sig);
          // A portal may ignore the query and return the same global listing.
          // Identical pages do not justify repeatedly requesting their next pages.
          if(globalSignatures.has(sig)){log({source,query,page:pageNo,duplicateListing:true});break;}globalSignatures.add(sig);
          log({source,query,page:pageNo,candidates:urls.length});
          for(const u of urls)await detail(u,source);
          if(!urls.length || (source==='bestjobs'&&!cursor))break;
        }catch(e){log({source,query,page:pageNo,error:e.message});if(/host_paused/.test(e.message)){checkpoint();return;}break;}
      }
    }
    checkpoint();console.log(`${source} ${index+1}/${jobs.length} ${job.slug}: ${records.filter(r=>r.source===source).length} accepted`);
  }
}
// Sources run independently; each host is serial and rate-limited by http.mjs.
await Promise.all(sources.map(crawlSource));
const unique=deduplicate(records);
const coverage=Object.fromEntries(occupations.map(j=>[j.slug,{name:j.nume,...summarize(unique.filter(r=>r.slug===j.slug))}]));
const payload={version:POLICY.version,run,generatedAt:new Date().toISOString(),policy:POLICY,scope:{sources,pages,queries:queryCount,slugs:jobs.map(j=>j.slug)},stats:{acceptedBeforeDedup:records.length,accepted:unique.length,duplicates:records.length-unique.length,rejected:rejected.length,errors:events.filter(e=>e.error).length},observations:unique,coverage};
fs.writeFileSync(`${root}/verified.json`,JSON.stringify(payload,null,2));
if(process.argv.includes("--publish"))throw new Error("Publication requires crawl:report --run=<id> --publish to verify saved evidence.");
console.log(JSON.stringify({file:path.resolve(`${root}/verified.json`),...payload.stats,ready:Object.values(coverage).filter(c=>c.status==='advertised_interval').length}));
