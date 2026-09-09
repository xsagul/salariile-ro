// Preia un corpus de pagini salvate in afara pipeline-ului nostru si le trece
// prin parserul nostru, fara sa atinga reteaua.
//
// Regula ramane cea din `verifica-lot-extern.mjs`: nicio cifra din fisierul
// extern nu intra in date. Fisierul extern da doar adresa si pagina; suma,
// meseria, baza si acceptarea le decide `extract.mjs` din HTML-ul salvat.
//
// O pagina este acceptata drept dovada numai daca isi declara singura adresa:
// `<link rel="canonical">` trebuie sa fie exact URL-ul caruia i-o atribuim.
// Altfel fisierul ar putea fi orice pagina, salvata sub orice nume.
//
// Provenienta ramane scrisa in dovada. `retrievedAt` este data reala a
// fisierului, nu momentul importului, fiindca de ea depinde fereastra de
// prospetime din `policy.mjs`.
//
//   node scripts/crawler/importa-pagini-externe.mjs \
//     --dir="C:/.../pagini" --index="C:/.../rezultate.txt" --sursa=ejobs [--scrie]
//
// Fara `--scrie` nu modifica nimic: citeste, masoara si raporteaza.
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { hash } from './http.mjs';
import { canonicalUrl } from './policy.mjs';
import { detailRecord, assess, resolveSalary } from './extract.mjs';
import { classifyAll } from './occupations.mjs';

const arg = (key, fallback) => process.argv.find(a => a.startsWith(`--${key}=`))?.slice(key.length + 3) ?? fallback;
const dir = arg('dir');
const index = arg('index');
const source = arg('sursa');
const run = arg('run', 'census-full-2026-09-08');
const evidenceDir = arg('evidence', '.cercetare-privata/crawl-runs/verified-2026-09-07/evidence');
const scrie = process.argv.includes('--scrie');
const limita = Number(arg('limita', Infinity));
if (!dir || !index || !source) throw new Error('Foloseste: --dir=<pagini> --index=<rezultate.txt> --sursa=<ejobs|publi24>');
if (!/^[\w-]+$/.test(run)) throw new Error('Run invalid');

// Numele fisierului este identitatea anuntului la sursa: ultimul segment din URL.
const idDinUrl = url => {
  const ultim = new URL(url).pathname.split('/').filter(Boolean).at(-1);
  return ultim.replace(/\.html$/, '');
};

const randuri = fs.readFileSync(index, 'utf8').split(/\r?\n/).filter(l => l.trim());
const state = JSON.parse(fs.readFileSync(`.cercetare-privata/crawl-runs/${run}/state.json`, 'utf8'));
const fx = state.fx;
if (!fx?.EURRON) throw new Error('Rularea nu are curs BCE salvat');

const numarare = {
  randuri: randuri.length, declaratDA: 0, fisierLipsa: 0, canonicNepotrivit: 0,
  deCitit: 0, dejaInStare: 0, acceptate: 0, respinse: 0, schemaNesuportata: 0, erori: 0,
  // `salary_evidence_incomplete` apare si cand suma exista, dar nu are de cine sa
  // se lege: fara meserie din catalog nu se formeaza nicio pereche. Numaram separat
  // „am gasit o cifra" de „am putut sa o atribuim", altfel motivul se citeste gresit
  // drept limita a pietei.
  cifraGasita: 0, cifraFaraMeserie: 0, faraCifra: 0,
};
const titluriNecunoscute = new Map();
const motive = {};
const noi = [];
const acorduri = { verificate: 0, sumaNoastraInCitatulLor: 0, amandouaFaraSuma: 0 };

for (const linie of randuri) {
  if (noi.length >= limita) break;
  const parti = linie.split('|').map(x => x.trim());
  const [url, verdict] = parti;
  const citatExtern = parti.at(-1) ?? '';
  if (verdict !== 'DA') continue;
  numarare.declaratDA++;

  const fisier = path.join(dir, `${idDinUrl(url)}.html`);
  if (!fs.existsSync(fisier)) { numarare.fisierLipsa++; continue; }
  const html = fs.readFileSync(fisier, 'utf8');

  // Pagina trebuie sa isi declare singura adresa.
  const canonic = cheerio.load(html)('link[rel="canonical"]').attr('href');
  let potrivit = false;
  try { potrivit = canonic && canonicalUrl(canonic) === canonicalUrl(url); } catch { potrivit = false; }
  if (!potrivit) { numarare.canonicNepotrivit++; continue; }

  const canonica = canonicalUrl(url);
  if (state.results[canonica]) numarare.dejaInStare++;

  const stat = fs.statSync(fisier);
  const retrievedAt = new Date(stat.mtime).toISOString();
  const evidence = {
    url: canonica, retrievedAt, sha256: hash(html),
    evidenceFile: `${evidenceDir}/${hash(canonica)}.html`,
    provenance: 'colectare-externa', externalFile: fisier.replaceAll('\\', '/'),
  };

  numarare.deCitit++;
  let raw = null;
  try { raw = detailRecord({ html, url: canonica, ...evidence }, source); }
  catch (e) { numarare.erori++; motive[`eroare:${e.message}`] = (motive[`eroare:${e.message}`] || 0) + 1; continue; }
  if (!raw) numarare.schemaNesuportata++;

  const rezultat = assess(raw ? { ...raw, listedAt: retrievedAt, fx } : null, evidence, new Date(retrievedAt));
  if (rezultat.accepted) numarare.acceptate++;
  else { numarare.respinse++; for (const m of rezultat.reasons) motive[m] = (motive[m] || 0) + 1; }

  if (raw) {
    const cifra = resolveSalary({ ...raw, fx }).salary;
    const meserii = classifyAll(raw.title || '').slugs;
    if (cifra) numarare.cifraGasita++; else numarare.faraCifra++;
    if (cifra && !meserii.length) {
      numarare.cifraFaraMeserie++;
      const t = (raw.title || '').trim();
      titluriNecunoscute.set(t, (titluriNecunoscute.get(t) || 0) + 1);
    }
  }

  // Semnal de coerenta cu fisierul extern, doar raportat: suma noastra ar trebui
  // sa apara in textul pe care l-a citat colectorul extern.
  if (rezultat.accepted && citatExtern) {
    acorduri.verificate++;
    const cifre = new Set((citatExtern.match(/\d[\d .]*/g) || []).map(x => Number(x.replace(/[ .]/g, ''))));
    const o = rezultat.observation.originalSalary;
    if (cifre.has(o.min) || cifre.has(o.max)) acorduri.sumaNoastraInCitatulLor++;
  }

  noi.push({ url: canonica, html, evidence, raw, rezultat, retrievedAt });
}

numarare.rataAcceptare = numarare.deCitit ? +(numarare.acceptate / numarare.deCitit).toFixed(3) : null;
console.log(JSON.stringify({ sursa: source, numarare, acorduri }, null, 1));
console.log('MOTIVE DE RESPINGERE');
for (const [m, n] of Object.entries(motive).sort((a, b) => b[1] - a[1])) console.log(` ${String(n).padStart(5)}  ${m}`);
console.log('');
console.log('ANUNTURI CU CIFRA GASITA DE NOI, DAR FARA MESERIE IN CATALOG (primele 40 de titluri)');
for (const [t, n] of [...titluriNecunoscute].sort((a, b) => b[1] - a[1]).slice(0, 40)) console.log(` ${String(n).padStart(3)}  ${t}`);

if (!scrie) {
  console.log('\nMasurare fara scriere. Adauga --scrie pentru a salva dovezile si rezultatele.');
  process.exit(0);
}

// Scrierea: dovada intra in cache-ul comun sub numele pe care il asteapta
// `http.mjs`, deci orice rulare ulterioara o citeste fara sa atinga reteaua.
fs.mkdirSync(evidenceDir, { recursive: true });
let scrise = 0;
for (const n of noi) {
  const cheie = hash(n.url);
  fs.writeFileSync(`${evidenceDir}/${cheie}.html`, n.html);
  fs.writeFileSync(`${evidenceDir}/${cheie}.json`, JSON.stringify({
    url: n.url, retrievedAt: n.retrievedAt, sha256: n.evidence.sha256,
    evidenceFile: n.evidence.evidenceFile, provenance: 'colectare-externa',
    externalFile: n.evidence.externalFile, importedAt: new Date().toISOString(),
  }));
  scrise++;
}
console.log(JSON.stringify({ dovezScrise: scrise, evidenceDir }, null, 1));

if (!process.argv.includes('--adauga-in-stare')) {
  console.log('Dovezile sunt in cache. Adauga --adauga-in-stare pentru a inscrie si rezultatele.');
  process.exit(0);
}

// Inscrierea in starea rularii. Un URL deja citit de noi nu se rescrie: dovada
// noastra, obtinuta direct, ramane cea principala.
const statePath = `.cercetare-privata/crawl-runs/${run}/state.json`;
const copie = `${statePath}.inainte-de-import-${new Date().toISOString().slice(0, 10)}`;
if (!fs.existsSync(copie)) fs.copyFileSync(statePath, copie);
const proaspat = JSON.parse(fs.readFileSync(statePath, 'utf8'));
if (!proaspat.collectionStoppedAt) throw new Error('Colectorul inca ruleaza; opreste-l inainte de import.');

const entry = proaspat.sources[source] || { urls: [], maps: [], events: [] };
proaspat.sources[source] = entry;
const urls = new Set(entry.urls);
let adaugate = 0, sarite = 0;
for (const n of noi) {
  urls.add(n.url);
  if (proaspat.results[n.url]) { sarite++; continue; }
  proaspat.results[n.url] = {
    ...n.rezultat, url: n.url, source, listedAt: n.retrievedAt,
    evidence: { file: n.evidence.evidenceFile, sha256: n.evidence.sha256, retrievedAt: n.retrievedAt },
    ...(n.raw ? { raw: n.raw } : {}),
    provenance: 'colectare-externa',
  };
  adaugate++;
}
entry.urls = [...urls];
entry.importExtern = {
  ...(entry.importExtern || {}),
  [new Date().toISOString()]: {
    dir, index, pagini: noi.length, adaugate, sarite,
    nota: 'Pagini salvate de o colectare externa, citite de parserul nostru. Sumele si meseriile nu vin din fisierul extern.',
  },
};
fs.writeFileSync(statePath, JSON.stringify(proaspat, null, 2));
console.log(JSON.stringify({ adaugateInStare: adaugate, dejaAvute: sarite, copieDeSiguranta: copie }, null, 1));
