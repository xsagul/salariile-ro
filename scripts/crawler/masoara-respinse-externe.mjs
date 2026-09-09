// Un motiv de respingere numarat nu spune daca respingerea e corecta.
// Scoate un esantion din paginile respinse, cu ce a vazut parserul nostru si ce
// a citat colectorul extern, ca judecata sa se faca pe text, nu pe agregat.
//
//   node scripts/crawler/masoara-respinse-externe.mjs --dir=... --index=... \
//     --sursa=publi24 --motiv=salary_evidence_incomplete [--n=8]
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { hash } from './http.mjs';
import { canonicalUrl } from './policy.mjs';
import { detailRecord, assess, extractSalaryCandidates, resolveSalary } from './extract.mjs';

const arg = (k, d) => process.argv.find(a => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const dir = arg('dir'), index = arg('index'), source = arg('sursa');
const motivCerut = arg('motiv'), n = Number(arg('n', 8));
const run = arg('run', 'census-full-2026-09-08');
const state = JSON.parse(fs.readFileSync(`.cercetare-privata/crawl-runs/${run}/state.json`, 'utf8'));
const fx = state.fx;
const idDinUrl = url => new URL(url).pathname.split('/').filter(Boolean).at(-1).replace(/\.html$/, '');

const randuri = fs.readFileSync(index, 'utf8').split(/\r?\n/).filter(l => l.trim())
  .map(l => l.split('|').map(x => x.trim())).filter(p => p[1] === 'DA');

// Esantion aleator reproductibil, ca sa nu judecam mereu primele randuri.
let seed = 20260909;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const amestecate = randuri.map(p => [rnd(), p]).sort((a, b) => a[0] - b[0]).map(x => x[1]);

let gasite = 0;
for (const parti of amestecate) {
  if (gasite >= n) break;
  const url = parti[0], citat = parti.at(-1), sumaLor = parti.at(-2);
  const fisier = path.join(dir, `${idDinUrl(url)}.html`);
  if (!fs.existsSync(fisier)) continue;
  const html = fs.readFileSync(fisier, 'utf8');
  const canonic = cheerio.load(html)('link[rel="canonical"]').attr('href');
  if (!canonic || canonic !== canonicalUrl(url)) continue;
  const stat = fs.statSync(fisier), retrievedAt = new Date(stat.mtime).toISOString();
  const evidence = { url, retrievedAt, sha256: hash(html), evidenceFile: fisier };
  const raw = detailRecord({ html, url, ...evidence }, source);
  const rezultat = assess(raw ? { ...raw, listedAt: retrievedAt, fx } : null, evidence, new Date(retrievedAt));
  if (rezultat.accepted || !rezultat.reasons.includes(motivCerut)) continue;
  gasite++;
  // `extractSalaryCandidates` intoarce lista, cu excluderile atasate pe ea.
  const candidati = raw ? extractSalaryCandidates(raw) : [];
  console.log('─'.repeat(100));
  console.log(url);
  console.log(' motive        :', rezultat.reasons.join(', '));
  console.log(' titlu (noi)   :', JSON.stringify(raw?.title ?? null));
  console.log(' descriere     :', raw ? `${raw.description.length} caractere` : 'fara record');
  console.log(' camp salariu  :', JSON.stringify(raw?.salaryText ?? null), JSON.stringify(raw?.salary ?? null));
  console.log(' contract/tara :', JSON.stringify(raw?.contract ?? null), JSON.stringify(raw?.country ?? null));
  console.log(' candidati     :', JSON.stringify(candidati.map(c => ({ min: c.min, max: c.max, basis: c.basis, monthly: c.monthly, kind: c.evidenceKind }))));
  console.log(' excluse       :', JSON.stringify((candidati.excluded || []).map(c => ({ min: c.min, reason: c.reason }))));
  console.log(' rezolvat      :', JSON.stringify(raw ? (resolveSalary(raw, extractSalaryCandidates(raw)).salary ?? resolveSalary(raw).error) : null));
  console.log(' extern zice   :', JSON.stringify(sumaLor), '|', JSON.stringify((citat || '').slice(0, 160)));
  if (raw?.description) console.log(' text (300)    :', JSON.stringify(raw.description.slice(0, 300)));
}
console.log(`\n${gasite} exemple pentru motivul "${motivCerut}".`);
