import assert from 'node:assert/strict';
import { classifyTitle, classifyAll } from './crawler/occupations.mjs';
import { assess, extractSalary, extractSalaryCandidates, resolveSalary, detailRecord, olxRecord } from './crawler/extract.mjs';
import { deduplicate, summarize } from './crawler/aggregate.mjs';
import { quantile, editDistance } from './crawler/policy.mjs';
import { allowedByRobots } from './crawler/http.mjs';
import { hydrateNuxt, listingRecords } from './crawler/ejobs-listing.mjs';
for (const [title,slug] of [['Programator CNC','operator-cnc'],['Medic veterinar','medic-veterinar'],['Secretar birou notarial','secretar'],['Asistent medical','asistent-medical'],['Ajutor bucătar',null],['Electrician și instalator',null],['Programator Java','programator'],['Consilier Juridic/Secretar Birou Notarial',null]]) assert.equal(classifyTitle(title).slug,slug,title);
// An advert may hire several trades at once; each is a separate observation.
assert.deepEqual(classifyAll('Electrician și instalator').slugs.sort(),['electrician','instalator']);
assert.deepEqual(classifyAll('Casiera/ vanzatoare pentru Ciorbarie').slugs.sort(),['casier','vanzator']);
assert.equal(classifyAll('Ajutor bucătar').slugs.length,0,'Assistant roles never inherit the senior occupation');
// Classifieds are misspelled. Tolerance grows with term length and never below seven characters.
assert.equal(classifyTitle('Angajam instalatpr sanitar').slug,'instalator');
assert.equal(classifyAll('Angajam instalatpr sanitar').reason,'title_fuzzy_match');
assert.equal(classifyTitle('Angajam sudor').slug,'sudor');
assert.equal(editDistance('sudor','sofer'),3);
const evidence={sha256:'a'.repeat(64),evidenceFile:'fixture.html',retrievedAt:'2026-09-07T10:00:00Z'};
const base={title:'Contabil',description:'Salariul fix net este 5.000 lei pe luna.',url:'https://example.org/job/1',employer:'Exemplu SRL',source:'fixture',country:'RO',contract:'full-time',active:true,date:'2026-09-01',salary:{from:5000,to:5000,currencyCode:'RON'}};
const now=new Date('2026-09-07T10:00:00Z');
assert.ok(assess(base,evidence,now).accepted);
for(const patch of [{date:'2027-01-01'},{country:null},{country:'DE'},{contract:null},{contract:'part-time'},{active:false},{expires:'2026-08-01'},{description:'Tichete de masa 5000 lei net lunar'},{description:'Salariu 5000 EUR net lunar'},{salary:{from:5500,to:5500,currencyCode:'RON'}},{description:'Salariu fix net 5000 lei lunar pentru lucru in Germania'}])assert.equal(assess({...base,...patch},evidence,now).accepted,false,JSON.stringify(patch));
// Staleness is an explicit rule, not an accident of which inventory a portal serves.
assert.ok(assess({...base,date:null},evidence,now).accepted,'A missing date falls back to current active status');
assert.ok(assess({...base,date:'2025-06-01'},evidence,now).accepted,'Inside the staleness bound');
assert.ok(assess({...base,date:'2024-01-01'},evidence,now).reasons.includes('ad_too_old'));
assert.ok(assess({...base,description:'Salariu fix brut 5000 lei lunar'},evidence,now).observation.netConversion);
assert.ok(assess({...base,description:'Salariu net 5000 lei lunar + bonus de performanta'},evidence,now).accepted,'Explicitly additional bonus is not part of the base');
assert.equal(assess({...base,active:undefined},evidence,now).accepted,false);
assert.equal(assess(base,{...evidence,retrievedAt:'2025-01-01'},now).accepted,false);
// Un anunt cu suma clara, dar cu o meserie care nu e in catalog, nu este un anunt
// fara suma. Confundandu-le, limita catalogului s-ar citi drept limita a pietei.
const faraCatalog=assess({...base,title:'Angajam stivuitorist',description:'Salariu 4500 lei net pe luna.',salary:null},evidence,now);
assert.equal(faraCatalog.accepted,false);
assert.ok(faraCatalog.reasons.includes('unknown_occupation'));
assert.ok(faraCatalog.reasons.includes('amount_without_catalogue_occupation'));
assert.ok(!faraCatalog.reasons.includes('salary_evidence_incomplete'),'Suma exista; ce lipseste este meseria');
// Cand chiar nu exista nicio suma, motivul ramane cel despre suma.
assert.ok(assess({...base,title:'Angajam stivuitorist',description:'Program de 8 ore.',salary:null},evidence,now)
  .reasons.includes('salary_evidence_incomplete'));
assert.equal(classifyTitle('Ajutoare de bucătar').slug,null);
assert.equal(extractSalary({description:'Salariu net de la 5000 lei lunar'}),null);
assert.equal(extractSalary({description:'Pachet salarial 5000 lei net lunar include tichete'}),null);
assert.equal(extractSalary({description:'Salariu net 5000 lei. Bonus lunar de performanta 1000 lei.'}).monthly,false);
assert.equal(assess({...base,description:'Salariu net 5000 lei'},evidence,now).observation.periodEvidence,'assumed_monthly_full_time');
assert.equal(assess(base,null,now).accepted,false);
assert.equal(extractSalary({description:'Salariu net 5.000–7.000 lei lunar'}).min,5000);
assert.equal(resolveSalary({description:'Salariu net 5000 lei sau salariu brut 9000 lei lunar'}).error,'multiple_unresolved_amounts');
// Pay is named in many ways. Take-home wording is an explicit net basis.
assert.equal(extractSalary({description:'Venit net lunar: 4.000 - 6.000 lei net'}).min,4000);
assert.equal(extractSalary({description:'Se ofera 5000 lei in mana lunar'}).basis,'net');
assert.equal(extractSalary({description:'Castig lunar 4500 lei in cont'}).basis,'net');
assert.equal(extractSalary({description:'Salariu 3600 lei lunar'}).basis,null,'An undeclared basis is kept, never guessed');
assert.equal(assess({...base,description:'Salariu 3600 lei lunar',salary:null},evidence,now).observation.basisDeclared,false);
// Baza declarata o singura data in tot anuntul este dovada din text, nu o presupunere.
assert.equal(extractSalary({description:'Toate salariile sunt nete. Salariu 3600 lei lunar.'}).basis,'net');
assert.equal(extractSalary({description:'Toate salariile sunt nete. Salariu 3600 lei lunar.'}).basisEvidence,'document');
assert.equal(extractSalary({description:'Salariu net 5000 lei lunar'}).basisEvidence,'local');
assert.equal(extractSalary({description:'Oferim si net si brut. Salariu 3600 lei lunar.'}).basis,null,'Ambele mentiuni lasa baza nedeclarata');
assert.equal(resolveSalary({title:'Contabil',description:'Angajam contabil, plata neta.',salary:{from:4000,to:4500,currencyCode:'RON',period:'MONTH'},source:'olx'}).salary.basis,'net');
// The title carries the figure often enough that ignoring it loses real adverts.
assert.equal(extractSalary({title:'Cofetarie angajam cofetar salariu 6000 lei',description:'Program de luni pana vineri.'}).min,6000);
// A gross and net pair for one job is one figure, not two conflicting ones.
assert.equal(extractSalary({description:'Salariu brut 5000 lei lunar, adica net 2981 lei lunar'}).min,2981);
assert.ok(extractSalary({description:'Salariu brut 5000 lei lunar, adica net 2981 lei lunar'}).pairedGross);
// A portal pay field is primary evidence when the wording adds nothing.
const structuredOnly={...base,description:'Angajam contabil cu experienta.',salary:{from:4000,to:4500,currencyCode:'RON',period:'MONTH'}};
assert.equal(resolveSalary(structuredOnly).salary.min,4000);
assert.equal(resolveSalary(structuredOnly).salary.evidenceKind,'structured_field');
assert.equal(resolveSalary(structuredOnly).salary.basis,null);
assert.equal(resolveSalary({...structuredOnly,description:'Salariul se plateste net.'}).salary.basis,'net');
assert.equal(olxRecord({title:'x',salary:{from:5700,to:5701,currencyCode:'RON'}}).salary.to,5700,'OLX stores one figure as from = to - 1');
// Cifra exacta din text, cu baza langa ea, in interiorul intervalului declarat de portal.
const inRange={...base,description:'Salariu: 3.200 lei NET pe luna.',salary:{from:2800,to:3500,currencyCode:'RON',period:'MONTH'},source:'olx'};
assert.equal(resolveSalary(inRange).salary.min,3200);
assert.equal(resolveSalary(inRange).salary.basis,'net');
assert.equal(resolveSalary(inRange).salary.evidenceKind,'text_within_structured_range');
// Doua capete numite in text acopera exact intervalul portalului.
assert.equal(resolveSalary({...inRange,description:'Salariul cuprins intre 2800 lei net si 3500 lei net.'}).salary.max,3500);
// In afara intervalului declarat ramane conflict, niciodata o suprascriere tacuta.
assert.equal(resolveSalary({...inRange,description:'Salariu: 9.000 lei NET pe luna.'}).error,'salary_conflict');
// Eticheta constanta a unui portal este dovada mai slaba si se numara separat.
assert.equal(extractSalary({source:'ejobs',salaryText:'3500 - 4000 RON net',description:'Angajam contabil.'}).basisEvidence,'platform');
assert.equal(extractSalary({source:'bestjobs',salaryText:'3500 - 4000 RON net',description:'Angajam contabil.'}).basisEvidence,'local');
// Baza declarata in alta parte a anuntului ramane dovada, marcata ca atare.
const departe=resolveSalary({...inRange,description:['Toate sumele din acest anunt sunt nete si se platesc pe 15.','Program de luni pana vineri, opt ore.','Salariu: 3.200 lei pe luna.'].join(String.fromCharCode(10))}).salary;
assert.equal(departe.min,3200); assert.equal(departe.basisEvidence,'document');
// O suma din interval fara nicio baza declarata nu adauga nimic peste portal.
const faraBaza=resolveSalary({...inRange,description:'Se ofera 3.200 lei pe luna.'}).salary;
assert.equal(faraBaza.evidenceKind,'structured_field'); assert.equal(faraBaza.basis,null);
// Several trades in one advert, one figure: an observation for each trade.
const multi=assess({...base,title:'Angajam zidari, dulgheri si fierari',description:'Salariu net 5000 lei lunar.',salary:null},evidence,now);
assert.ok(multi.accepted);
assert.deepEqual(multi.observations.map(o=>o.slug).sort(),['dulgher','zidar']);
assert.ok(multi.observations[0].figureSharedAcrossRoles);
assert.equal(new Set(multi.observations.map(o=>o.adId)).size,1,'One advert stays one advert for the gates');
// Several trades, several figures: attribute each figure only where the wording links them.
const roles=assess({...base,title:'Angajam bucatar si ospatar',description:'Salariu bucatar net 5000 lei lunar.\nSalariu ospatar net 3500 lei lunar.',salary:null},evidence,now);
assert.ok(roles.accepted);
assert.deepEqual(roles.observations.map(o=>[o.slug,o.min]).sort(),[['bucatar',5000],['chelner',3500]]);
assert.equal(quantile([100,200,300,400],.5),250);
assert.equal(quantile([100,200,300,400],.25),175);
const o=assess(base,evidence,now).observation;
assert.equal(deduplicate([o,{...o,url:o.url+'?tracking=1'}]).length,1);
assert.equal(deduplicate([o,{...o,url:'https://second.org/job',source:'other',sources:['other'],sourceUrls:['https://second.org/job']}]).length,1);
assert.equal(deduplicate([{...o,employerKnown:false,employerKey:null},{...o,url:'https://second.org/job',employerKnown:false,employerKey:null}]).length,2);
const many=Array.from({length:40},(_,i)=>({...o,id:`obs-${i}`,adId:`ad-${i}`,url:`https://example.org/job/${i}`,employerKey:`firm-${i%20}`,county:`county-${i%5}`,source:i%2?'a':'b',min:4000+i*10,max:6000+i*10}));
assert.deepEqual(summarize(many).medianBounds,{min:4195,max:6195});
assert.equal(summarize(many.slice(0,29)).medianBounds,null);
assert.equal(summarize(many.map(o=>({...o,source:'a'}))).medianBounds,null);
assert.equal(summarize(many.map(o=>({...o,employerKey:'same'}))).medianBounds,null);
assert.equal(summarize(many.map(o=>({...o,periodEvidence:'assumed_monthly_full_time'}))).midpointEstimate,null,'Assumed pay periods alone cannot pass');
// The undeclared-basis cohort is reported beside the headline, never inside it.
const mixed=[...many,...Array.from({length:20},(_,i)=>({...o,id:`u-${i}`,adId:`ua-${i}`,url:`https://example.org/u/${i}`,basisDeclared:false,basis:'nedeclarat',employerKey:`u-${i}`,county:`county-${i%5}`,source:'c',min:9000,max:9000}))];
assert.deepEqual(summarize(mixed).medianBounds,summarize(many).medianBounds,'An undeclared basis never moves the published figure');
assert.equal(summarize(mixed).undeclaredBasis.n,20);
assert.equal(summarize(many).basisNearAmount,40,'Baza de langa suma se numara separat de cea din restul anuntului');
assert.equal(summarize(many.map(x=>({...x,basisEvidence:'platform'}))).basisFromPlatform,40);
assert.equal(summarize(many.map(x=>({...x,basisEvidence:'platform'}))).basisNearAmount,0);
assert.equal(summarize(many.map(o=>({...o,basisEvidence:'document'}))).basisFromDocument,40);
assert.equal(summarize(mixed).n,40,'Only declared-basis adverts count towards the gates');
const shifted=many.map((o,i)=>({...o,min:i%2?10000:3000,max:i%2?10000:3000}));
assert.ok(summarize(shifted).gaps.includes('source_sensitivity'),'Strongly conflicting portals cannot produce a green light');
assert.equal(extractSalary({description:'Pachet salarial competitiv și beneficii. (venit între 4500–6000 lei net).'}),null);
assert.equal(extractSalary({description:'Salariu net 5000 lei lunar + tichete de masă 800 lei'}).min,5000);
assert.equal(extractSalaryCandidates({description:'Salariu net 5000 lei lunar. Tichete de masa 800 lei.'}).length,1,'Benefits never become salary candidates');
assert.equal(summarize([]).observedRange,null);
assert.equal(allowedByRobots('User-agent: *\nDisallow: /api/\nAllow: /','https://example.org/api/v1'),false);
assert.equal(allowedByRobots('User-agent: *\nDisallow: */pagina\nAllow: */pagina2$','https://example.org/foo/pagina2'),true);
assert.equal(allowedByRobots('User-agent: *\nDisallow: */pagina\nAllow: */pagina2$','https://example.org/foo/pagina20'),false);
const olxJob={title:'Contabil',description:base.description,url:base.url,createdAt:'2026-09-01',validTo:'2026-10-01',status:'active',location:{city:{name:'Brasov'},region:{name:'Brasov'}},params:[{key:'type',value:{key:'full-time'}}],salary:base.salary};
const page={html:'<script>window.__PRERENDERED_STATE__= '+JSON.stringify(JSON.stringify({jobAd:{job:olxJob}}))+';</script>',url:base.url};
assert.ok(assess(detailRecord(page,'olx'),evidence,now).accepted,'OLX detail schema differs from listing schema');
// Payload-ul aplatizat pe indici: valorile nu stau langa chei.
assert.deepEqual(hydrateNuxt([{a:1,b:2},'x',[1]]),{a:'x',b:['x']});
assert.deepEqual(hydrateNuxt([[1,2],'a','b']),['a','b']);
assert.equal(hydrateNuxt([{v:-1}]).v,undefined,'indicii negativi sunt valori speciale');
// O pagina de listare produce inregistrari in aceeasi forma ca pagina de detaliu.
const listing='<div id="__NUXT_DATA__" style="display:none">'+JSON.stringify([
  {pinia:1},{jobs:2},{_listItems:3},[4],
  {id:5,title:6,company:7,salary:10,locations:11,creationDate:14,slug:15,expirationDate:16,contractTypesIds:17},
  1984891,'Contabil',{id:8,name:9},191366,'Exemplu SRL','4000 - 4500 RON',[12],{cityId:13},1,
  '2026-09-01T00:00:00Z','contabil','2026-10-01T00:00:00Z',[18],5,
  '[[1,"bucuresti",10,"Bucuresti"]]',
])+'</div>';
const cards=listingRecords(listing,'https://www.ejobs.ro/locuri-de-munca/salarii');
assert.equal(cards.length,1);
assert.equal(cards[0].title,'Contabil');
assert.equal(cards[0].employer,'Exemplu SRL');
assert.equal(cards[0].salaryText,'4000 - 4500 RON');
assert.equal(cards[0].city,'Bucuresti','orasul vine din nomenclatorul portalului, nu din id brut');
assert.equal(cards[0].country,'RO');
assert.equal(cards[0].contract,'full-time');
assert.equal(cards[0].url,'https://www.ejobs.ro/user/locuri-de-munca/contabil/1984891');
// Un oras necunoscut nu devine tacit Romania.
const strain=listing.replace('{"cityId":13}','{"cityId":99999}');
assert.equal(listingRecords(strain,'https://www.ejobs.ro/locuri-de-munca/salarii')[0].country,null);
console.log('OK: crawler evidence, units, dates, staleness, pay wording, gross/net pairs, multi-trade adverts, occupation ambiguity, interval statistics, cohorts, deduplication and robots policy.');
