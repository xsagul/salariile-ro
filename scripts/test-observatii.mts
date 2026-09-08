import assert from 'node:assert/strict';
import { agregheaza, incadreaza, PRAG_PUBLICARE, type ObservatieSalariala } from '../src/lib/observatii-salariale';
import { MESERII, dateMeserieSauEroare, COMPARATII } from '../src/lib/meserii';
import { reperMeserie, textReper, piloniMeserie, convergentaPiloni, reperCompus } from '../src/lib/repere-meserii';
import { indicatorMeserie } from '../src/lib/indicator-meserie';
import cor from '../src/data/cor-meserii.json';
import reports from '../src/data/repere-piata-verificate.json';
const make=(n:number):ObservatieSalariala[]=>Array.from({length:n},(_,i)=>({meserie:'zugrav',titluSursa:'Zugrav',fel:'declarat',suma:'net',minim:4000+i*10,maxim:4000+i*10,data:'2026-08-27',referinta:'https://example.org/record/'+i,id:'source:'+i,perioada:'2026-08',concept:'realizat',norma:'intreaga',experienta:'3-5 ani',reutilizarePermisa:true}));
const options={meserie:'zugrav',suma:'net' as const};
assert.equal(incadreaza('Inginer ofertare','251202')?.slug,'programator');
assert.equal(incadreaza('Programator','251299'),null,'un COR necunoscut nu se deduce din prefix sau din titlu');
// Meseriile cu cerere mare de cautare intra in catalog cu maparea lor COR.
assert.equal(incadreaza('Registrator medical')?.slug,'registrator-medical');
assert.equal(incadreaza('Grefier')?.slug,'grefier');
assert.equal(incadreaza('Jandarm')?.slug,'jandarm');
assert.equal(incadreaza('Titlu care nu exista in nomenclator'),null,'un titlu necunoscut nu se deduce');
assert.equal(incadreaza('Asistent medical')?.slug,'asistent-medical');
assert.equal(agregheaza(make(PRAG_PUBLICARE-1),options),null);
assert.equal(agregheaza(make(30),{...options,prag:1}),null,'pragul nu poate fi ocolit');
const a=agregheaza(make(30),options)!;
assert.equal(a.mean,4145); assert.equal(a.median,4145); assert.equal(a.p25,null); assert.equal(a.p75,null);
const b=agregheaza(make(60),options)!;
assert.equal(b.p25,4140); assert.equal(b.p75,4440); assert.equal(b.observatii,60);
assert.equal(agregheaza([...make(20),...make(20)],options),null,'duplicatele nu ridică eșantionul');
for(const patch of [{maxim:9000},{fel:'lege-153' as const},{reutilizarePermisa:false},{perioada:undefined},{id:undefined},{norma:undefined},{experienta:undefined},{minim:NaN},{data:'necunoscut'}]) assert.equal(agregheaza(make(60).map(x=>({...x,...patch})),options),null,JSON.stringify(patch));
for(const patch of [{fel:'anunt' as const},{perioada:'2025-08'},{concept:'baza' as const},{norma:'partiala' as const},{experienta:'junior'}]) assert.equal(agregheaza(make(60).map((x,i)=>i===0?{...x,...patch}:x),options),null,'cohorta mixtă '+JSON.stringify(patch));
assert.equal(agregheaza(make(60).map(x=>({...x,suma:'brut'})),options),null);
assert.equal(agregheaza(make(60).map((x,i)=>({...x,judet:i<29?'Cluj':'Iași'})),{...options,judet:'Cluj'}),null);
const counts:Record<string,number>={};
for(const m of MESERII) {
 const r=reperMeserie(dateMeserieSauEroare(m)); counts[r.kind]=(counts[r.kind]??0)+1;
 assert.equal(r.unit,'lei net/lună');assert.ok(r.url.startsWith('https://'));assert.ok(r.period);assert.ok(r.population);assert.ok(r.note);
 assert.equal(r.median,null,`${m.slug}: source does not publish a median`);
 assert.equal(r.p25,null); assert.equal(r.p75,null);
 assert.ok(r.n === null || (typeof r.n === 'number' && r.n > 0), m.slug);
 assert.ok(!textReper(r).includes('NaN')); assert.ok(r.value===null || r.value>0);
 const mapping=cor.occupations[m.slug as keyof typeof cor.occupations];assert.ok(mapping);
 assert.equal(m.cor??null,mapping.code);if(m.cor)assert.ok(mapping.name);
 if(r.kind==='sector-context'){assert.ok(r.value && r.value>0);assert.equal(indicatorMeserie(r).value,r.value);}
 if(r.kind==='public-grid')assert.equal(indicatorMeserie(r).value,r.value);
 if(r.kind==='external-reported')assert.equal(indicatorMeserie(r).value,r.value);
 if(r.kind==='external-advertised'){
  // Colectarea proprie conduce doar cand a trecut toate pragurile, cu n si limite afisate.
  assert.ok(r.n && r.n>0,`${m.slug}: reperul din anunturi are nevoie de n`);
  assert.equal(indicatorMeserie(r).metric,'advertised',m.slug);
  assert.ok(/limitele posibile ale medianei/.test(r.note),`${m.slug}: nota trebuie sa arate limitele medianei`);
  assert.ok(r.url.includes('/salarii/acoperire'),m.slug);
 }
 const val = indicatorMeserie(r).value;
 assert.ok(val !== null && val > 0);
}
// Ierarhia reperului principal: reperul propriu din doua surse, apoi colectarea
// proprie trecuta prin praguri, apoi media externa citata.
{
 const r=reperMeserie(dateMeserieSauEroare(MESERII.find(x=>x.slug==='contabil')!));
 const salario=reports.records.find(x=>x.slug==='contabil')!.net;
 if(r.kind==='salariile-ro'){
  const valori=r.compus!.intrari.map(i=>i.valoare);
  assert.ok(valori.includes(salario),'media citata este una dintre intrarile reperului propriu');
  assert.ok(r.value!>=Math.min(...valori)&&r.value!<=Math.max(...valori),'reperul nu iese din intrarile lui');
 } else if(r.kind==='external-advertised') assert.ok(r.n && r.n>=30);
 else assert.equal(r.value,salario);
}
assert.equal(reperMeserie(dateMeserieSauEroare(MESERII.find(x=>x.slug==='cercetator')!)).kind,'sector-context');
assert.equal(reperMeserie(dateMeserieSauEroare(MESERII.find(x=>x.slug==='constructor')!)).kind,'sector-context');
// Pilonii raman calculati separat, cu sursa fiecaruia, si cand din ei se
// construieste reperul propriu al site-ului.
for(const m of MESERII){
 const p=piloniMeserie(dateMeserieSauEroare(m));
 assert.equal(p.length,3,m.slug);
 assert.deepEqual(p.map(x=>x.cheie),['anunturi','declarat','oficial'],m.slug);
 assert.equal(new Set(p.map(x=>x.concept)).size,3,`${m.slug}: fiecare pilon masoara altceva`);
 for(const x of p){
  assert.ok(x.titlu && x.sursa && x.nota && x.url,`${m.slug}/${x.cheie}`);
  assert.ok(x.valoare===null || x.valoare>0,`${m.slug}/${x.cheie}`);
  assert.ok(x.interval===null || x.interval.max>=x.interval.min,`${m.slug}/${x.cheie}`);
  if(x.cheie==='anunturi') assert.ok(x.valoare===null || x.stare==='publicat','o cifra centrala din anunturi apare doar peste praguri');
 }
 const c=convergentaPiloni(p);
 if(c){assert.ok(c.max>=c.min);assert.ok(c.puncte.length>=2);assert.ok(!('valoare' in c),'convergenta nu produce o cifra unica');}
 // Statistica oficiala verifica reperul propriu, dar nu intra niciodata in el.
 const comp=reperCompus(p);
 if(comp)assert.ok(!comp.intrari.some(i=>i.cheie==='oficial'),`${m.slug}: grupa ISCO nu intra in reper`);
}
assert.equal(cor.occupations.zugrav.code,'713102');assert.equal(cor.occupations.contabil.code,'331302');
for(const c of COMPARATII)assert.notEqual(c.a.slug,c.b.slug);
console.log(`OK: mapări COR, ${MESERII.length} repere și 37 comparații; cohorte, deduplicare, medie/mediană și quartile.`,counts);
