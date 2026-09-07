// Census of source inventories, followed by evidence collection. Resume safely by URL.
import fs from 'node:fs';
import * as cheerio from 'cheerio';
import { fetchPage } from './http.mjs';
import { classifyTitle } from './occupations.mjs';
import { detailRecord, assess, olxState, olxRecord } from './extract.mjs';
import { canonicalUrl, POLICY } from './policy.mjs';
import { exportRun } from './export-run.mjs';
const arg=(key,value)=>process.argv.find(a=>a.startsWith(`--${key}=`))?.slice(key.length+3)||value;
const run=arg('run','census-active-2026-09-07');if(!/^[\w-]+$/.test(run))throw new Error('Invalid run id');
const root=`.cercetare-privata/crawl-runs/${run}`;
const evidenceDir=arg('evidence','.cercetare-privata/crawl-runs/verified-2026-09-07/evidence');
const selectedSources=arg('sources','olx,ejobs,bestjobs,publi24,anuntul').split(',');
const includeUnknown=process.argv.includes('--include-unknown');
fs.mkdirSync(root,{recursive:true});
const statePath=`${root}/state.json`;
const state=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):{version:POLICY.version,run,startedAt:new Date().toISOString(),sources:{},results:{}};
if(state.version!==POLICY.version)throw new Error('Different policy; use a new run or reprocess evidence');
const save=()=>fs.writeFileSync(statePath,JSON.stringify(state,null,2));
const locs=html=>{const $=cheerio.load(html,{xmlMode:true});return $('loc').toArray().map(e=>$(e).text());};
const roots={
  publi24:['https://www.publi24.ro/sitemaps/sitemapindex-publi24.xml',/articles-by-category-Locuri(?: |%20)de(?: |%20)munca/],
  bestjobs:['https://www.bestjobs.eu/sitemap/sitemap.jobs.ro.xml',null],
  anuntul:['https://www.anuntul.ro/sitemap-category_1.xml',null],
  ejobs:['https://www.ejobs.ro/sitemap-listings-index.xml',/sitemap-listings-.*\.xml$/],
};
function titleFromUrl(url,source){const parts=new URL(url).pathname.split('/');return decodeURIComponent(source==='publi24'||source==='ejobs'?parts.at(-2):parts.at(-1)).replaceAll('-',' ');}
async function fxRate(){
  const url='https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',page=await fetchPage(url,evidenceDir);
  const date=page.html.match(/time=['"]([^'"]+)/)?.[1],rate=Number(page.html.match(/currency=['"]RON['"]\s+rate=['"]([^'"]+)/)?.[1]);
  if(!date||!(rate>0)||Math.abs(Date.now()-Date.parse(date))>7*86400000)throw new Error('Invalid/stale ECB rate');
  return {EURRON:rate,date,source:url,evidenceSha256:page.sha256};
}
state.fx=state.fx||await fxRate();
delete state.collectionStoppedAt;
async function inventory(source){
  if(state.sources[source]?.inventoryComplete)return state.sources[source];
  if(source==='olx')return olxInventory();
  const config=roots[source];if(!config)throw new Error('Unknown source');
  const entry=state.sources[source]||{urls:[],maps:[],events:[]};state.sources[source]=entry;
  try{
    const index=await fetchPage(config[0],evidenceDir);const maps=config[1]?locs(index.html).filter(u=>config[1].test(u)):[config[0]];
    const urls=new Set(entry.urls);
    for(const url of maps){if(entry.maps.includes(url))continue;const page=url===config[0]?index:await fetchPage(url,evidenceDir);for(const u of locs(page.html))urls.add(canonicalUrl(u));entry.maps.push(url);entry.urls=[...urls];save();}
    entry.inventoryComplete=true;entry.listedAt=new Date().toISOString();entry.totalUrls=entry.urls.length;
  }catch(e){entry.events.push({at:new Date().toISOString(),stage:'inventory',error:e.message});}
  save();return entry;
}
async function olxInventory(){
  const entry=state.sources.olx||{urls:[],maps:[],events:[],listings:[],embedded:{}};state.sources.olx=entry;
  const categories=locs((await fetchPage('https://www.olx.ro/sitemap-categories.xml',evidenceDir)).html).filter(u=>u.includes('/locuri-de-munca/'));
  // Leaf categories avoid the search engine's top-results cap on the all-jobs page.
  const leaves=categories.filter(u=>!categories.some(v=>v!==u&&v.startsWith(u)));
  const urls=new Set(entry.urls);const seenPages=new Set();
  for(const category of leaves){
    if(entry.maps.includes(category))continue;
    try{
      for(let n=1;n<=1000;n++){
        const url=`${category}?page=${n}`,page=await fetchPage(url,evidenceDir),list=olxState(page.html)?.listing?.listing;
        if(!list||!Array.isArray(list.ads))throw new Error('listing_schema_changed');
        const signature=list.ads.map(a=>a.id).sort().join(',');if(!signature||seenPages.has(signature))break;seenPages.add(signature);
        entry.listings.push({url,visible:list.visibleElements,total:list.totalElements,pages:list.totalPages,page:n});
        for(const ad of list.ads){urls.add(canonicalUrl(ad.url));entry.embedded[canonicalUrl(ad.url)]={record:olxRecord(ad),evidence:{sha256:page.sha256,evidenceFile:page.evidenceFile,retrievedAt:page.retrievedAt},listedAt:page.retrievedAt};}
        entry.urls=[...urls];save();if(n>=list.totalPages)break;
      }
      entry.maps.push(category);
    }catch(e){entry.events.push({category,stage:'inventory',error:e.message});if(/host_paused/.test(e.message))break;}
  }
  entry.inventoryComplete=entry.maps.length===leaves.length;entry.totalUrls=entry.urls.length;entry.listedAt=new Date().toISOString();save();return entry;
}
async function crawl(source){
  const entry=await inventory(source);const ids=entry.urls||[];
  const candidates=ids.map(url=>({url,classification:classifyTitle(titleFromUrl(url,source))}));
  candidates.sort((a,b)=>Number(!!b.classification.slug)-Number(!!a.classification.slug));
  entry.catalogCandidates=candidates.filter(c=>c.classification.slug).length;entry.includeUnknown=includeUnknown;save();
  let i=0;
  for(const {url,classification} of candidates){
    if(!classification.slug&&!includeUnknown)continue;
    if(state.results[url])continue;
    try{
      // Save the structured listing evidence even if no salary was declared.
      // Detail pages are necessary for accepted records, not for already unambiguous exclusions.
      const embedded=source==='olx'?entry.embedded?.[url]:null;
      if(embedded){const pre=assess({...embedded.record,listedAt:embedded.listedAt,fx:state.fx},embedded.evidence,new Date(embedded.evidence.retrievedAt));if(!pre.accepted){state.results[url]={...pre,url,source,listedAt:embedded.listedAt};continue;}}
      const page=await fetchPage(url,evidenceDir),raw=detailRecord(page,source);
      const result=assess(raw?{...raw,listedAt:entry.listedAt,fx:state.fx}:null,page,new Date(page.retrievedAt));
      state.results[url]={...result,url,source,listedAt:entry.listedAt,evidence:{file:page.evidenceFile,sha256:page.sha256,retrievedAt:page.retrievedAt}};
      if(raw)state.results[url].raw=raw;
    }catch(e){entry.events.push({url,stage:'detail',error:e.message});if(/host_paused/.test(e.message)){save();return;}state.results[url]={url,source,accepted:false,reasons:[e.message]};}
    i++;if(i%20===0){save();console.log(`${source}: ${Object.values(state.results).filter(r=>r.source===source).length}/${includeUnknown?ids.length:entry.catalogCandidates} read; ${Object.values(state.results).filter(r=>r.source===source&&r.accepted).length} eligible`);}
  }
  entry.finishedAt=new Date().toISOString();save();console.log(`${source}: inventory ${ids.length}, pass complete`);
}
await Promise.all(selectedSources.map(crawl));
state.collectionStoppedAt=new Date().toISOString();
save();
const payload=exportRun(state,root);
console.log(JSON.stringify(payload.stats));
