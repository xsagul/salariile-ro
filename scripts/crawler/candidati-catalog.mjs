// Cate anunturi cu suma ar prinde fiecare meserie propusa, daca ar intra in catalog.
//
// Nu propune adaugarea nimanui: masoara. O meserie noua inseamna o pagina publica,
// deci intrebarea nu e „exista anunturi?", ci „sunt destule cat sa nu publicam o
// pagina goala?". Pragurile raman ale `policy.mjs`.
//
//   node scripts/crawler/candidati-catalog.mjs --lot=<dir>::<index>::<sursa> [--lot=...]
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { canonicalUrl, normalizeText } from './policy.mjs';
import { detailRecord, resolveSalary } from './extract.mjs';
import { classifyAll } from './occupations.mjs';

// Propunerile vin din titlurile pe care catalogul nu le prinde, grupate manual.
// Fiecare termen se cauta pe cuvinte intregi, in titlul normalizat.
const PROPUNERI = [
  ['stivuitorist', ['stivuitorist', 'stivuitoristi', 'operator stivuitor', 'motostivuitor']],
  ['sofer-camion', ['sofer camion', 'sofer de camion', 'sofer c e', 'sofer categoria c', 'conducator camion', 'sofer marfa', 'sofer transport marfa']],
  ['sofer-distributie', ['sofer distributie', 'sofer livrator', 'sofer livrari', 'sofer categoria b']],
  ['magaziner', ['magaziner', 'gestionar depozit', 'gestionar magazie', 'lucrator depozit', 'operator depozit', 'gestionar']],
  ['manipulant-marfa', ['manipulant', 'manipulanti', 'manipulant marfa', 'ambalator', 'ambalatori']],
  ['muncitor-necalificat', ['muncitor necalificat', 'muncitori necalificati', 'necalificat', 'necalificati']],
  ['montator', ['montator', 'montatori', 'reglor montator']],
  ['macelar', ['macelar', 'macelari', 'transator', 'transatori']],
  ['frigotehnist', ['frigotehnist', 'frigotehnisti', 'tehnician frigotehnist']],
  ['camerista', ['camerista', 'cameriste']],
  ['spalator-auto', ['spalator auto', 'spalatori auto']],
  ['vopsitor-industrial', ['vopsitor', 'vopsitori', 'vopsitor industrial']],
  ['macaragiu', ['macaragiu', 'macaragii', 'pod rulant']],
  ['operator-utilaje', ['operator utilaje', 'operator utilaj', 'mecanic utilaje']],
  ['dispecer-transport', ['dispecer', 'dispecer transport']],
  ['merchandiser', ['merchandiser', 'merchandiseri']],
  ['sudor-mig-mag', ['sudor mig', 'sudor mag', 'sudor tig']],
  ['lacatus', ['lacatus', 'lacatusi', 'lacatus mecanic']],
  ['operator-ambalare', ['operator ambalare', 'operator asamblare', 'operator productie linie']],
  ['tehnician-service', ['tehnician service', 'tehnician montaj', 'tehnician interventii']],
];

const loturi = process.argv.filter(a => a.startsWith('--lot=')).map(a => {
  const [dir, index, sursa] = a.slice(6).split('::');
  return { dir, index, sursa };
});
if (!loturi.length) throw new Error('Foloseste --lot=<dir>::<index>::<sursa>');
const run = process.argv.find(a => a.startsWith('--run='))?.slice(6) ?? 'census-full-2026-09-08';
const fx = JSON.parse(fs.readFileSync(`.cercetare-privata/crawl-runs/${run}/state.json`, 'utf8')).fx;
const idDinUrl = url => new URL(url).pathname.split('/').filter(Boolean).at(-1).replace(/\.html$/, '');

const potriveste = (titlu, termeni) => termeni.some(t => new RegExp(`(^| )${t.replace(/ /g, ' ')}( |$)`).test(titlu));

const gasite = new Map(PROPUNERI.map(([slug]) => [slug, { ads: [], employers: new Set(), sources: new Set(), sume: [] }]));
let neatribuite = 0;

for (const { dir, index, sursa } of loturi) {
  for (const linie of fs.readFileSync(index, 'utf8').split(/\r?\n/)) {
    const parti = linie.split('|').map(x => x.trim());
    if (parti[1] !== 'DA') continue;
    const fisier = path.join(dir, `${idDinUrl(parti[0])}.html`);
    if (!fs.existsSync(fisier)) continue;
    const html = fs.readFileSync(fisier, 'utf8');
    const canonic = cheerio.load(html)('link[rel="canonical"]').attr('href');
    if (!canonic || canonic !== canonicalUrl(parti[0])) continue;
    const raw = detailRecord({ html, url: canonicalUrl(parti[0]) }, sursa);
    if (!raw) continue;
    const salariu = resolveSalary({ ...raw, fx }).salary;
    if (!salariu || classifyAll(raw.title || '').slugs.length) continue;
    const titlu = normalizeText(raw.title || '');
    let prins = false;
    for (const [slug, termeni] of PROPUNERI) {
      if (!potriveste(titlu, termeni)) continue;
      const g = gasite.get(slug);
      g.ads.push(raw.title);
      g.employers.add(normalizeText(raw.employer || '') || `necunoscut:${g.ads.length}`);
      g.sources.add(sursa);
      g.sume.push(Math.round((salariu.min + salariu.max) / 2));
      prins = true;
    }
    if (!prins) neatribuite++;
  }
}

const mediana = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
console.log('meserie propusa        anunturi  angajatori  surse  mediana  exemplu');
for (const [slug, g] of [...gasite].sort((a, b) => b[1].ads.length - a[1].ads.length)) {
  if (!g.ads.length) continue;
  console.log(`${slug.padEnd(22)} ${String(g.ads.length).padStart(8)}  ${String(g.employers.size).padStart(10)}  ${String(g.sources.size).padStart(5)}  ${String(mediana(g.sume)).padStart(7)}  ${g.ads[0].slice(0, 45)}`);
}
console.log(`\nAnunturi cu suma, fara meserie in catalog, pe care nici propunerile de mai sus nu le prind: ${neatribuite}`);
console.log(`Pragul de publicare din policy.mjs cere ${JSON.parse(fs.readFileSync('src/data/acoperire-anunturi.json', 'utf8')).policy.minAds} anunturi si ${JSON.parse(fs.readFileSync('src/data/acoperire-anunturi.json', 'utf8')).policy.minEmployers} angajatori.`);
