// Cat declara cu adevarat o sursa, fata de cat accepta parserul.
// Deschide un esantion aleator din anunturile respinse pe lipsa de salariu si
// raporteaza rata reala de declarare. Nu modifica starea rularii.
//
//   node scripts/crawler/masoara-olx.mjs --run=<id> --source=olx --esantion=150
import fs from 'node:fs';
import { fetchPage } from './http.mjs';
import { detailRecord, extractSalary } from './extract.mjs';
import { normalizeText } from './policy.mjs';

const arg = (key, fallback) => process.argv.find(a => a.startsWith(`--${key}=`))?.slice(key.length + 3) ?? fallback;
const run = arg('run', 'census-full-2026-09-08');
const source = arg('source', 'olx');
const size = Number(arg('esantion', 150));
if (!/^[\w-]+$/.test(run)) throw new Error('Use --run=<id>');

const state = JSON.parse(fs.readFileSync(`.cercetare-privata/crawl-runs/${run}/state.json`, 'utf8'));
const dir = `.cercetare-privata/crawl-runs/${run}/esantion`;
const pool = Object.values(state.results).filter(r => r.source === source && !r.accepted
  && (r.reasons || []).includes('salary_evidence_incomplete'));
let seed = 20260908;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const sample = [...pool].sort(() => rnd() - 0.5).slice(0, size);

const stat = { run, source, bazin: pool.length, esantion: sample.length, deschise: 0, erori: 0,
  campStructurat: 0, textCuSalariu: 0, netSauBrutInText: 0, acceptateDeParser: 0 };
for (const r of sample) {
  let page, raw;
  try { page = await fetchPage(r.url, dir); raw = detailRecord(page, source); }
  catch (e) { stat.erori++; if (/host_paused/.test(e.message)) break; continue; }
  if (!raw) { stat.erori++; continue; }
  stat.deschise++;
  const s = raw.salary;
  if (s && Number(s.from) > 0 && ['RON', 'EUR'].includes(s.currencyCode)) stat.campStructurat++;
  const text = normalizeText(`${raw.title} ${raw.description} ${raw.salaryText || ''}`);
  if (/salari|remunerat|venit|castig|in mana|in cont/.test(text)) stat.textCuSalariu++;
  if (/\bnet\b|\bbrut\b/.test(text)) stat.netSauBrutInText++;
  if (extractSalary(raw)) stat.acceptateDeParser++;
}
stat.rataDeclarare = stat.deschise ? +(stat.campStructurat / stat.deschise).toFixed(3) : null;
stat.rataParser = stat.deschise ? +(stat.acceptateDeParser / stat.deschise).toFixed(3) : null;
console.log(JSON.stringify(stat, null, 1));
