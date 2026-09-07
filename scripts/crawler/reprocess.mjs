// Re-evaluate saved primary evidence after parser changes, without inventing records.
import fs from 'node:fs';
import { detailRecord, assess } from './extract.mjs';
import { hash, fetchPage } from './http.mjs';
import { exportRun } from './export-run.mjs';
const run=process.argv.find(a=>a.startsWith('--run='))?.slice(6);
if(!run || !/^[\w-]+$/.test(run))throw new Error('Use --run=<id>');
const root=`.cercetare-privata/crawl-runs/${run}`;
const state=JSON.parse(fs.readFileSync(`${root}/state.json`,'utf8'));
const cache='.cercetare-privata/crawl-runs/verified-2026-09-07/evidence';
const completeDetails=process.argv.includes('--complete-details');
const preview=process.argv.includes('--preview');
if (!preview && !state.collectionStoppedAt) throw new Error('Stop the collector and record collectionStoppedAt before replacing its state; use --preview for a separate report.');
let changed=0;
for(const [source,entry] of Object.entries(state.sources)) {
  for(const url of entry.urls) {
    const old=state.results[url];
    const metaFile=`${cache}/${hash(url)}.json`;
    let page=null;
    if(old?.evidence?.file && fs.existsSync(old.evidence.file)) page={...old.evidence,evidenceFile:old.evidence.file,html:fs.readFileSync(old.evidence.file,'utf8'),url};
    else if(fs.existsSync(metaFile)) {const meta=JSON.parse(fs.readFileSync(metaFile,'utf8'));if(fs.existsSync(meta.evidenceFile))page={...meta,html:fs.readFileSync(meta.evidenceFile,'utf8')};}
    if(!page && completeDetails && entry.embedded?.[url]) {
      const e=entry.embedded[url];
      const pre=assess({...e.record,listedAt:e.listedAt,fx:state.fx},e.evidence,new Date(e.evidence.retrievedAt));
      if(pre.accepted)try{page=await fetchPage(url,cache);}catch(error){entry.events.push({url,stage:'complete_detail',error:error.message});if(/host_paused/.test(error.message))break;}
    }
    if(!page)continue;
    if(hash(page.html)!==page.sha256)throw new Error(`Evidence changed: ${url}`);
    const raw=detailRecord(page,source);
    const result=assess(raw?{...raw,listedAt:entry.listedAt,fx:state.fx}:null,page,new Date(page.retrievedAt));
    if(old?.accepted!==result.accepted)changed++;
    state.results[url]={...result,url,source,listedAt:entry.listedAt,raw,evidence:{file:page.evidenceFile,sha256:page.sha256,retrievedAt:page.retrievedAt}};
  }
}
state.reprocessedAt=new Date().toISOString();
const output=preview?`${root}/preview`:root;fs.mkdirSync(output,{recursive:true});
if(!preview)fs.writeFileSync(`${root}/state.json`,JSON.stringify(state,null,2));
const result=exportRun(state,output);
console.log(JSON.stringify({output,changed,...result.stats,ready:Object.values(result.coverage).filter(s=>s.midpointEstimate).length}));
