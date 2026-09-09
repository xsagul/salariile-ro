// Ce meserii ne lipsesc din catalog, masurat pe anunturile la care parserul
// nostru chiar a gasit o suma.
//
// Motivul pentru care asta conteaza: `salary_evidence_incomplete` se adauga si
// atunci cand suma exista, dar titlul nu se leaga de nicio meserie din catalog.
// Numarat asa, motivul pare o limita a pietei. Nu este: este limita catalogului.
//
//   node scripts/crawler/gol-catalog-anunturi.mjs --lot=<dir>:<index>:<sursa> [--lot=...]
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { canonicalUrl, normalizeText } from './policy.mjs';
import { detailRecord, resolveSalary } from './extract.mjs';
import { classifyAll } from './occupations.mjs';

const loturi = process.argv.filter(a => a.startsWith('--lot=')).map(a => {
  const [dir, index, sursa] = a.slice(6).split('::');
  return { dir, index, sursa };
});
if (!loturi.length) throw new Error('Foloseste --lot=<dir>::<index>::<sursa>');
const run = process.argv.find(a => a.startsWith('--run='))?.slice(6) ?? 'census-full-2026-09-08';
const fx = JSON.parse(fs.readFileSync(`.cercetare-privata/crawl-runs/${run}/state.json`, 'utf8')).fx;
const idDinUrl = url => new URL(url).pathname.split('/').filter(Boolean).at(-1).replace(/\.html$/, '');

// Cuvintele care descriu meseria, nu firma, orasul sau conditiile. Lista este
// deliberat scurta: scopul e sa grupam titluri, nu sa inventam o taxonomie.
const ZGOMOT = new Set(`angajam angajez angajeaza angajare angajari recrutam cautam caut urgent
srl sa pentru cu si sau in la de pe din zona sector bucuresti cluj timisoara iasi brasov constanta
oradea sibiu craiova galati ploiesti arad pitesti bacau buzau braila deva alba baia mare targu
mures suceava focsani ramnicu valcea slatina botosani satu piatra neamt drobeta severin
experienta fara calificare full time norma intreaga part program schimburi schimbul turi tura
lei ron eur euro net brut luna lunar salariu salar pachet bonus bonusuri prime tichete masa
posturi post loc locuri munca job jobs nou noua noi echipa companie firma societate comerciala
personal colega coleg colegi hai noi acum oferim cautam ang pers depozit`.split(/\s+/).filter(Boolean));

const titluri = new Map();
let cuCifra = 0, faraMeserie = 0, citite = 0;

for (const { dir, index, sursa } of loturi) {
  for (const linie of fs.readFileSync(index, 'utf8').split(/\r?\n/)) {
    const parti = linie.split('|').map(x => x.trim());
    if (parti[1] !== 'DA') continue;
    const url = parti[0];
    const fisier = path.join(dir, `${idDinUrl(url)}.html`);
    if (!fs.existsSync(fisier)) continue;
    const html = fs.readFileSync(fisier, 'utf8');
    const canonic = cheerio.load(html)('link[rel="canonical"]').attr('href');
    if (!canonic || canonic !== canonicalUrl(url)) continue;
    citite++;
    const raw = detailRecord({ html, url: canonicalUrl(url) }, sursa);
    if (!raw) continue;
    const salariu = resolveSalary({ ...raw, fx }).salary;
    if (!salariu) continue;
    cuCifra++;
    if (classifyAll(raw.title || '').slugs.length) continue;
    faraMeserie++;
    for (const cuvant of normalizeText(raw.title || '').split(' ')) {
      if (cuvant.length < 4 || ZGOMOT.has(cuvant) || /^\d/.test(cuvant)) continue;
      const t = titluri.get(cuvant) || { n: 0, exemple: [], sume: [] };
      t.n++;
      if (t.exemple.length < 3) t.exemple.push(raw.title.slice(0, 70));
      t.sume.push(Math.round((salariu.min + salariu.max) / 2));
      titluri.set(cuvant, t);
    }
  }
}

const mediana = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
console.log(JSON.stringify({ citite, cuCifra, faraMeserie }, null, 1));
console.log('\nCUVINTE DE MESERIE IN ANUNTURILE CU SUMA PE CARE CATALOGUL NU LE PRINDE');
console.log('  n  cuvant               mediana  exemplu');
for (const [cuvant, t] of [...titluri].sort((a, b) => b[1].n - a[1].n).slice(0, 45)) {
  if (t.n < 3) continue;
  console.log(`${String(t.n).padStart(3)}  ${cuvant.padEnd(20)} ${String(mediana(t.sume)).padStart(6)}  ${t.exemple[0]}`);
}
