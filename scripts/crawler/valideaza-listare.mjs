// Compara ce scoate parserul de listare cu ce a scos pagina de detaliu, pentru
// anunturile pe care le avem in ambele feluri. Fara potrivire exacta pe suma,
// moneda, angajator si titlu, listarea nu are voie sa produca observatii.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { listingRecords } from './ejobs-listing.mjs';
import { detailRecord, resolveSalary } from './extract.mjs';

const run = process.argv.find(a => a.startsWith('--run='))?.slice(6) ?? 'census-full-2026-09-08';
const state = JSON.parse(fs.readFileSync(`.cercetare-privata/crawl-runs/${run}/state.json`, 'utf8'));
const dir = '.cercetare-privata/crawl-runs/verified-2026-09-07/evidence';
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

// Ce stim din paginile de detaliu deja citite.
const fromDetail = new Map();
for (const r of Object.values(state.results)) {
  if (r.source !== 'ejobs' || !r.raw) continue;
  fromDetail.set(r.url.replace(/\/$/, ''), r.raw);
}

const stat = { paginiListare: 0, carduri: 0, comune: 0, potrivite: 0, diferite: 0, faraDetaliu: 0 };
const diffs = [];
for (const pageUrl of state.sources.ejobs.maps || []) {
  const file = `${dir}/${hash(pageUrl)}.html`;
  if (!fs.existsSync(file)) continue;
  stat.paginiListare++;
  for (const card of listingRecords(fs.readFileSync(file, 'utf8'), pageUrl)) {
    stat.carduri++;
    const detail = fromDetail.get(card.url.replace(/\/$/, ''));
    if (!detail) { stat.faraDetaliu++; continue; }
    stat.comune++;
    const problems = [];
    if (norm(card.title) !== norm(detail.title)) problems.push(`titlu: "${card.title}" vs "${detail.title}"`);
    if (norm(card.employer) !== norm(detail.employer)) problems.push(`angajator: "${card.employer}" vs "${detail.employer}"`);
    const a = resolveSalary(card).salary, b = resolveSalary(detail).salary;
    if (!a || !b) problems.push(`suma lipsa: listare ${!!a}, detaliu ${!!b}`);
    else if (a.min !== b.min || a.max !== b.max || a.currency !== b.currency)
      problems.push(`suma: ${a.min}-${a.max} ${a.currency} vs ${b.min}-${b.max} ${b.currency}`);
    if (problems.length) { stat.diferite++; if (diffs.length < 12) diffs.push({ url: card.url, problems }); }
    else stat.potrivite++;
  }
}
stat.rataPotrivire = stat.comune ? +(stat.potrivite / stat.comune).toFixed(4) : null;
console.log(JSON.stringify(stat, null, 1));
if (diffs.length) {
  console.log('\nDiferente:');
  for (const d of diffs) console.log(' ', d.url.split('/').slice(-2).join('/'), '=>', d.problems.join(' | '));
}
