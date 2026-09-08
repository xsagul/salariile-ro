// Cat ar mai avea de castigat o citire mai inteligenta a anunturilor deja
// descarcate, fara nicio cerere noua de retea.
import fs from 'node:fs';
import { classifyAll } from './occupations.mjs';
import { resolveSalary, extractSalaryCandidates } from './extract.mjs';
import { normalizeText } from './policy.mjs';
const run = process.argv.find(a => a.startsWith('--run='))?.slice(6) ?? 'census-full-2026-09-08';
const state = JSON.parse(fs.readFileSync(`.cercetare-privata/crawl-runs/${run}/state.json`, 'utf8'));
const AMOUNT = String.raw`(?:\d{1,3}(?:[ .]\d{3})+|\d{3,6})`;
const MONEY = new RegExp(`${AMOUNT}\s*(lei|ron|eur|euro|€)`, 'i');

const s = { respinse: 0, faraNiciOSuma: 0, cuSumaDarRespins: 0, ocupatieNecunoscutaCuSuma: 0, sumeMultipleNerezolvate: 0 };
const exemple = [];
for (const r of Object.values(state.results)) {
  if (r.accepted || !r.raw) continue;
  s.respinse++;
  const text = `${r.raw.title || ''} ${r.raw.description || ''} ${r.raw.salaryText || ''}`;
  if (!MONEY.test(text)) { s.faraNiciOSuma++; continue; }
  s.cuSumaDarRespins++;
  const reasons = r.reasons || [];
  if (reasons.includes('unknown_occupation') || reasons.includes('ambiguous_occupation')) s.ocupatieNecunoscutaCuSuma++;
  if (reasons.includes('multiple_unresolved_amounts')) s.sumeMultipleNerezolvate++;
  if (reasons.includes('salary_evidence_incomplete') && exemple.length < 8) {
    const m = text.match(new RegExp(`.{0,70}${AMOUNT}\s*(lei|ron|eur|euro|€).{0,50}`, 'i'));
    exemple.push({ titlu: (r.raw.title || '').slice(0, 45), context: (m?.[0] || '').replace(/\s+/g, ' ').trim() });
  }
}
console.log(JSON.stringify(s, null, 1));
console.log('\nAnunturi cu suma in text, respinse ca „fara dovada de salariu":');
for (const e of exemple) console.log('  ·', e.titlu, '=>', e.context.slice(0, 110));
