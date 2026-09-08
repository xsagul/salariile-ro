// Titluri de anunt care declara un salariu dar nu se potrivesc catalogului.
// Arata unde ar creste acoperirea daca s-ar extinde catalogul de meserii.
import fs from 'node:fs';
import { classifyAll } from './occupations.mjs';
import { extractSalary } from './extract.mjs';
import { normalizeText } from './policy.mjs';
const run = process.argv.find(a => a.startsWith('--run='))?.slice(6) ?? 'census-full-2026-09-08';
if (!/^[\w-]+$/.test(run)) throw new Error('Use --run=<id>');
const state = JSON.parse(fs.readFileSync(`.cercetare-privata/crawl-runs/${run}/state.json`, 'utf8'));
const stop = /\b(angajam|angajeaza|angajez|caut|cautam|urgent|se angajeaza|firma|societate|companie|srl|sa|cu experienta|fara experienta|full time|part time|bucuresti|zona|pentru|si|sau|de|la|in|cu|un|o|ne|marire|echipa|salariu|lei|net|brut|urgenta|imediat|start|nou|noi)\b/;
const counts = new Map();
let neclasificate = 0, cuSalariu = 0;
for (const r of Object.values(state.results)) {
  if (r.accepted || !r.raw?.title) continue;
  if (classifyAll(r.raw.title).slugs.length) continue;
  neclasificate++;
  if (!extractSalary({ ...r.raw, fx: state.fx })) continue;
  cuSalariu++;
  const words = normalizeText(r.raw.title).split(' ').filter(w => w.length > 3 && !stop.test(w));
  for (let i = 0; i < words.length; i++) {
    for (const key of [words[i], words.slice(i, i + 2).join(' ')].filter(k => k.split(' ').every(w => w))) {
      if (key.split(' ').length === 2 && i + 1 >= words.length) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
}
const top = [...counts.entries()].filter(([k, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 40);
console.log(`Titluri neclasificate: ${neclasificate}; dintre care cu salariu extractibil: ${cuSalariu}.`);
console.log('Un numar mic inseamna ca cele 132 de meserii acopera ce cere efectiv piata.\n');
if (top.length) console.log('Termeni recurenti in afara catalogului:\n');
for (const [term, n] of top) console.log(String(n).padStart(4), term);
