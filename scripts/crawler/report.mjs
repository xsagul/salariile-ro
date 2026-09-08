import fs from 'node:fs';
import crypto from 'node:crypto';
import { occupations } from './occupations.mjs';
import { deduplicate, summarize } from './aggregate.mjs';
import { POLICY } from './policy.mjs';
import { assess, detailRecord } from './extract.mjs';
import { listingRecords } from './ejobs-listing.mjs';
const run = process.argv.find(a=>a.startsWith('--run='))?.slice(6);
if (!run || !/^[\w-]+$/.test(run)) throw new Error('Use --run=<id>');
const root = `.cercetare-privata/crawl-runs/${run}`;
const data = JSON.parse(fs.readFileSync(`${root}/verified.json`, 'utf8'));
if (data.version !== POLICY.version) throw new Error('Unsupported dataset version');
for (const o of data.observations) {
  const content = fs.readFileSync(o.evidence.file);
  if (crypto.createHash('sha256').update(content).digest('hex') !== o.evidence.sha256) throw new Error(`Evidence changed: ${o.id}`);
  const page={html:content.toString('utf8'),url:o.url,sha256:o.evidence.sha256,evidenceFile:o.evidence.file,retrievedAt:o.retrievedAt};
  // O observatie venita din listare se reciteste din aceeasi pagina de listare.
  const raw=o.evidenceScope==='listing_page'
    ? listingRecords(page.html,o.url).find(c=>c.url.replace(/\/$/,'')===o.url.replace(/\/$/,''))
    : detailRecord(page,o.source);
  const checked=assess(raw?{...raw,listedAt:o.listedAt,fx:o.conversion}:null,page,new Date(o.retrievedAt));
  if (!checked.accepted) throw new Error(`Evidence no longer passes extraction: ${o.url}: ${checked.reasons}`);
  // One advert may hold several trades; verify against the observation for this trade.
  const same=(checked.observations||[checked.observation]).find(x=>x.slug===o.slug);
  if(!same)throw new Error(`Evidence no longer yields this occupation: ${o.url} (${o.slug})`);
  for(const key of ['slug','min','max','title','publishedAt','periodEvidence'])if(same[key]!==o[key])throw new Error(`Observation differs from evidence: ${o.url} (${key})`);
}
const records = deduplicate(data.observations);
const coverage = Object.fromEntries(occupations.map(job => {
  const subset=records.filter(r=>r.slug===job.slug);
  const prev=data.coverage?.[job.slug]||{};
  return [job.slug,{name:job.nume,read:prev.read??null,withoutSalary:prev.withoutSalary??null,
    ...summarize(subset),examples:subset.slice(0,5).map(({url,source,min,max})=>({url,source,min,max}))}];
}));
const result = { generatedAt:data.generatedAt, run, policy:POLICY, scope:data.scope, stats:data.stats, sourceInventory:data.sourceInventory || {}, coverage };
const checkpoint = JSON.parse(fs.readFileSync(`${root}/checkpoint.json`,'utf8'));
const rejectionCounts={};for(const r of checkpoint.rejected)for(const reason of r.reasons)rejectionCounts[reason]=(rejectionCounts[reason]||0)+1;
result.rejectionCounts=rejectionCounts;
result.sourceErrors=checkpoint.events.filter(e=>e.error);
fs.writeFileSync(`${root}/coverage.json`,JSON.stringify(result,null,2));
const rows = ['meserie,anunturi,anunturi_baza_nedeclarata,lunar_explicit,lunar_presupus,angajatori,judete,platforme,status,lipsuri'];
for (const [slug,a] of Object.entries(coverage)) rows.push([slug,a.n,a.undeclaredBasis.n,a.explicitMonthly,a.assumedMonthly,a.employers,a.counties,Object.keys(a.sourceCounts).length,a.status,a.gaps.join('|')].join(','));
fs.writeFileSync(`${root}/coverage.csv`,rows.join('\n')+'\n');
if (process.argv.includes('--publish')) {
  if (data.scope.slugs.length !== occupations.length) throw new Error('A partial catalogue run cannot replace coverage');
  // Errors and rejected records remain explicit; no claim that blocked sources were scanned.
  fs.writeFileSync('src/data/acoperire-anunturi.json',JSON.stringify(result,null,2)+'\n');
  fs.mkdirSync('public/date',{recursive:true});
  const publicRecords=records.map(({id,adId,url,source,slug,min,max,basis,basisDeclared,salaryEvidenceKind,figureSharedAcrossRoles,publishedAt,retrievedAt,evidence,originalSalary,conversion,netConversion,periodEvidence,activityEvidence,listedAt,sourceUrls})=>({id,adId,url,source,slug,min,max,unit:'lei net/lună',concept:'salariu oferit',basis,basisDeclared,salaryEvidenceKind,figureSharedAcrossRoles:figureSharedAcrossRoles||null,publishedAt,retrievedAt,listedAt,activityEvidence,periodEvidence,originalSalary:{min:originalSalary.min,max:originalSalary.max,currency:originalSalary.currency,basis:originalSalary.basis,monthlyExplicit:originalSalary.monthly},conversion,netConversion,evidenceSha256:evidence.sha256,sourceUrls}));
  fs.writeFileSync('public/date/anunturi-verificate.json',JSON.stringify({generatedAt:data.generatedAt,run,limitations:'Oferte, nu salarii efectiv încasate. Conversiile standard și ipoteza lunară pentru ofertele fără perioadă explicită sunt marcate pe fiecare înregistrare. Eșantionul nu este reprezentativ național.',observations:publicRecords},null,2)+'\n');
  fs.writeFileSync('public/date/acoperire-anunturi.csv',rows.join('\n')+'\n');
}
console.log(JSON.stringify({run,accepted:records.length,withAds:Object.values(coverage).filter(a=>a.n).length,publishable:Object.values(coverage).filter(a=>a.medianBounds).length,rejectionCounts}));
