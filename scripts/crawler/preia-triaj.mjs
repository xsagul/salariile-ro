// Preia dintr-un fisier extern doar verdictul „acest anunt are o suma", ca sa
// citim intai anunturile care conteaza. Nicio cifra din fisier nu intra in date:
// suma o extrage parserul nostru din pagina, cu dovada ei.
import fs from 'node:fs';
const file = process.argv[2];
const run = process.argv.find(a => a.startsWith('--run='))?.slice(6) ?? 'census-full-2026-09-08';
const path = `.cercetare-privata/crawl-runs/${run}/state.json`;
const state = JSON.parse(fs.readFileSync(path, 'utf8'));
const cunoscute = new Set(state.sources.ejobs.urls);
const da = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean)
  .filter(l => l.split('|')[1] === 'DA').map(l => l.split('|')[0])
  .filter(u => cunoscute.has(u));
const prioritare = new Set([...(state.sources.ejobs.withSalary || []), ...da]);
state.sources.ejobs.withSalary = [...prioritare];
state.sources.ejobs.triajExtern = { fisier: file, adaugateLa: new Date().toISOString(), marcateDa: da.length,
  nota: 'Doar ordinea de citire. Sumele si dovezile vin din paginile citite de noi.' };
fs.writeFileSync(path, JSON.stringify(state, null, 2));
const necitite = da.filter(u => !state.results[u]).length;
console.log(JSON.stringify({ marcateDa: da.length, necitite, coadaPrioritara: prioritare.size }, null, 1));
