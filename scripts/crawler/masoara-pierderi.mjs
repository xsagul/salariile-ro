// Cuantifica pierderile parserului pe corpusul deja descarcat. Nu foloseste reteaua
// si nu modifica starea rularii; doar raporteaza.
import fs from 'node:fs';
import { classifyTitle } from './occupations.mjs';
import { normalizeText } from './policy.mjs';

const run = process.argv.find(a => a.startsWith('--run='))?.slice(6) ?? 'census-full-2026-09-08';
if (!/^[\w-]+$/.test(run)) throw new Error('Use --run=<id>');
const state = JSON.parse(fs.readFileSync(`.cercetare-privata/crawl-runs/${run}/state.json`, 'utf8'));
const corpus = Object.values(state.results).filter(r => r.raw && (r.raw.description || r.raw.title));

const AMOUNT = String.raw`(?:\d{1,3}(?:[ .]\d{3})+|\d{3,6})`;
const SALARY = new RegExp(`(${AMOUNT})(?:\\s*(?:[-–—]|si|și)\\s*(${AMOUNT}))?\\s*(lei|ron|eur|euro|€)`, 'gi');
const num = s => Number(s.replace(/[ .]/g, ''));
const sume = text => [...String(text || '').matchAll(SALARY)].map(m => `${num(m[1])}-${num(m[2] || m[1])}`);

const s = { corpus: corpus.length, acceptate: 0, respinse: 0, salariuInTitlu: 0, doarInTitlu: 0,
  inMana: 0, multiRol: 0, ocupatieNecunoscuta: 0, ocupatieNecunoscutaCuSuma: 0, sumaFaraNetBrut: 0 };
const exTitlu = [], exMulti = [], exNecunoscut = [];

for (const r of corpus) {
  if (r.accepted) { s.acceptate++; continue; }
  s.respinse++;
  const titlu = r.raw.title || '', desc = r.raw.description || '';
  const plat = normalizeText(`${titlu} ${desc}`);
  const inTitlu = sume(titlu), inDesc = sume(desc), distincte = [...new Set(inDesc)];
  const areSuma = inTitlu.length || inDesc.length || r.raw.salaryText;

  if (inTitlu.length) { s.salariuInTitlu++; if (!inDesc.length) { s.doarInTitlu++; if (exTitlu.length < 6) exTitlu.push(titlu); } }
  if (/\bin mana\b|\bin cont\b|\bpe mana\b/.test(plat)) s.inMana++;
  if (distincte.length > 1) { s.multiRol++; if (exMulti.length < 6) exMulti.push(`${titlu.slice(0, 52)} => ${distincte.slice(0, 4).join(' / ')}`); }
  if (!classifyTitle(titlu).slug) {
    s.ocupatieNecunoscuta++;
    if (areSuma) { s.ocupatieNecunoscutaCuSuma++; if (exNecunoscut.length < 8) exNecunoscut.push(titlu.slice(0, 60)); }
  }
  if (areSuma && !/\bnet\b|\bbrut\b/.test(plat)) s.sumaFaraNetBrut++;
}

console.log(JSON.stringify(s, null, 1));
const arata = (titlu, list) => { console.log(`\n${titlu}`); list.forEach(x => console.log('  ·', x)); };
arata('Salariu doar in titlu (parserul citeste doar descrierea):', exTitlu);
arata('Anunturi multi-rol aruncate integral:', exMulti);
arata('Ocupatie neclasificata desi anuntul are suma:', exNecunoscut);
