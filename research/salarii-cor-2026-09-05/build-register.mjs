import fs from 'node:fs/promises';
import path from 'node:path';
const root=import.meta.dirname;
const registry=await fs.readFile(path.join(root,'REGISTRU-SURSE.md'),'utf8');
const sourceRows=registry.split('\n').filter(l=>/^\| S\d\d —/.test(l));
const sources=sourceRows.map(l=>{const cells=l.split('|').slice(1,-1).map(x=>x.trim());const [id,name]=cells[0].split(' — ');return{id,name,verified_granularity_and_fields:cells[1],access_files_api_cost:cells[2],rights_and_decision:cells[3],checked_at:'2026-09-05',verification_scope:'See field-level qualifications; listing is not a granted production licence.'};});
if(sources.length!==30||new Set(sources.map(x=>x.id)).size!==30)throw new Error('Registry count or IDs invalid');
await fs.writeFile(path.join(root,'registru-surse.json'),JSON.stringify({checked_at:'2026-09-05',scope:'30 primary source records; additional unverified candidate families in REGISTRU-SURSE.md',sources},null,2));
const cor=JSON.parse(await fs.readFile(path.join(root,'cor-catalogue-2024.json'),'utf8'));
const targets=cor.map(x=>({cor6:x.cor,official_name:x.name,taxonomy_snapshot:x.snapshot,taxonomy_certified_current:false,salary_coverage_status:'not_validated',mean:null,median:null,p25:null,p75:null,n:null,region:null,experience:null,publication_status:'not_evaluated'}));
await fs.writeFile(path.join(root,'acoperire-cor.json'),JSON.stringify({purpose:'Internal coverage register, not salary dataset; null means not established in this research, not zero pay or absence of employees.',taxonomy_source:'S01',taxonomy_snapshot:'2024-04-22',not_certified_current_2026:true,occupation_count:targets.length,targets},null,2));
const examples=JSON.parse(await fs.readFile(path.join(root,'exemple-dovezi.json'),'utf8'));
for(const e of examples.records){if(!sources.find(x=>x.id===e.source_id))throw new Error('Missing source '+e.source_id);if(e.n!==null||e.eligible_for_own_salary_distribution!==false)throw new Error('Examples must not invent n or enter national distributions');if(e.kind==='public_grid'&&e.median!==null)throw new Error('Grid must not become median');if(e.p25!==null&&!(e.p25<=e.median&&e.median<=e.p75))throw new Error('Quantile ordering');}
const documents=['STUDIU.md','REGISTRU-SURSE.md','ANEXA-API.md','ARHITECTURA.md','CERERI-DATE.md'];
const missing=[];
for(const f of documents){const s=await fs.readFile(path.join(root,f),'utf8');for(const m of s.matchAll(/\]\(([^)]+)\)/g)){if(!m[1].startsWith('http')&&!m[1].startsWith('#')){try{await fs.access(path.join(root,m[1]));}catch{missing.push({file:f,link:m[1]});}}}}
if(missing.length)throw new Error(JSON.stringify(missing));
const summary={checked_at:new Date().toISOString(),source_records:sources.length,cor_snapshot_occupations:targets.length,example_records:examples.records.length,example_records_with_invented_n:0,example_records_eligible_for_own_national_distribution:0,local_document_links_missing:missing.length,production_source_files_changed_by_this_study:false};
await fs.writeFile(path.join(root,'verificare-pachet.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
