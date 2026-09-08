// Verifica un fisier de rezultate produs in afara pipeline-ului nostru.
// Nimic nu intra in date pe baza increderii: citatul trebuie sa existe literal
// in pagina, iar suma trebuie sa coincida cu ce extrage parserul nostru.
//
//   node scripts/crawler/verifica-lot-extern.mjs fisier.txt [--esantion=40]
import fs from 'node:fs';
import { fetchPage } from './http.mjs';
import { detailRecord, resolveSalary } from './extract.mjs';
import { normalizeText } from './policy.mjs';

const file = process.argv[2];
if (!file) throw new Error('Foloseste: verifica-lot-extern.mjs <fisier> [--esantion=N]');
const size = Number(process.argv.find(a => a.startsWith('--esantion='))?.slice(11) ?? 40);
const run = process.argv.find(a => a.startsWith('--run='))?.slice(6) ?? 'census-full-2026-09-08';
const dir = `.cercetare-privata/crawl-runs/${run}/verificare-externa`;

const asteptate = new Set(fs.readFileSync('.cercetare-privata/gemini/toate.txt', 'utf8').split(/\r?\n/).filter(Boolean));
const linii = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(l => l.trim());

// 1. Integritate: formatul, URL-urile, absenta inventiilor.
const forma = { linii: linii.length, asteptate: asteptate.size, formatGresit: 0, urlNecunoscut: 0, duplicate: 0, da: 0, nu: 0, eroare: 0 };
const vazute = new Set(), inregistrari = [];
for (const linie of linii) {
  const p = linie.split('|');
  if (p.length < 2) { forma.formatGresit++; continue; }
  const [url, verdict, suma = '', citat = ''] = p.map(x => x.trim());
  if (!asteptate.has(url)) { forma.urlNecunoscut++; continue; }
  if (vazute.has(url)) { forma.duplicate++; continue; }
  vazute.add(url);
  const v = verdict.toUpperCase();
  if (v === 'DA') { forma.da++; inregistrari.push({ url, suma, citat }); }
  else if (v === 'NU') forma.nu++;
  else if (v === 'EROARE') forma.eroare++;
  else forma.formatGresit++;
}
forma.lipsa = asteptate.size - vazute.size;
forma.rataDa = forma.da + forma.nu ? +(forma.da / (forma.da + forma.nu)).toFixed(3) : null;
console.log('INTEGRITATE'); console.log(JSON.stringify(forma, null, 1));

// 2. Semnale statistice inainte de a atinge reteaua.
const citateDuplicate = new Map();
for (const r of inregistrari) citateDuplicate.set(r.citat, (citateDuplicate.get(r.citat) || 0) + 1);
const repetate = [...citateDuplicate.entries()].filter(([c, n]) => n > 2 && c.length > 20);
console.log('\nSEMNALE');
console.log(' citate identice repetate de peste doua ori:', repetate.length, repetate.slice(0, 3).map(([c, n]) => `${n}x "${c.slice(0, 40)}"`));
const faraCifre = inregistrari.filter(r => !/\d/.test(r.suma)).length;
console.log(' inregistrari DA fara nicio cifra in suma:', faraCifre);
const rotunde = inregistrari.filter(r => /\d+000/.test(r.suma)).length;
console.log(' sume care se termina in trei zerouri:', rotunde, `(${inregistrari.length ? Math.round(100 * rotunde / inregistrari.length) : 0}%)`);

// 3. Esantion aleator citit cu crawlerul nostru.
let seed = 20260908;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const esantion = [...inregistrari].sort(() => rnd() - 0.5).slice(0, size);
const rezultat = { verificate: 0, citatGasit: 0, sumaPotrivita: 0, erori: 0 };
const abateri = [];
for (const r of esantion) {
  let raw;
  try { raw = detailRecord(await fetchPage(r.url, dir), 'ejobs'); }
  catch (e) { rezultat.erori++; if (/host_paused/.test(e.message)) { console.log('\nGazda a oprit verificarea dupa', rezultat.verificate, 'pagini.'); break; } continue; }
  if (!raw) { rezultat.erori++; continue; }
  rezultat.verificate++;
  const pagina = normalizeText(`${raw.title} ${raw.description} ${raw.salaryText || ''}`);
  const citat = normalizeText(r.citat);
  const gasit = citat.length > 8 && pagina.includes(citat);
  if (gasit) rezultat.citatGasit++;
  const nostru = resolveSalary(raw).salary;
  const cifre = t => (String(t).match(/\d[\d.\s]*/g) || []).map(x => Number(x.replace(/[.\s]/g, ''))).filter(n => n > 99);
  const alLui = cifre(r.suma), alNostru = nostru ? [nostru.min, nostru.max] : [];
  const potrivit = nostru && alLui.length && alLui.every(n => alNostru.includes(n));
  if (potrivit) rezultat.sumaPotrivita++;
  if (!gasit || !potrivit) abateri.push({ url: r.url.split('/').slice(-2).join('/'), citatGasit: gasit, alLui: r.suma, alNostru: nostru ? `${nostru.min}-${nostru.max}` : 'niciuna' });
}
console.log('\nESANTION');
console.log(JSON.stringify({ ...rezultat, rataCitat: rezultat.verificate ? +(rezultat.citatGasit / rezultat.verificate).toFixed(3) : null,
  rataSuma: rezultat.verificate ? +(rezultat.sumaPotrivita / rezultat.verificate).toFixed(3) : null }, null, 1));
if (abateri.length) { console.log('\nABATERI:'); for (const a of abateri.slice(0, 15)) console.log(' ', JSON.stringify(a)); }
const curat = forma.urlNecunoscut === 0 && forma.duplicate === 0 && rezultat.verificate > 0
  && rezultat.citatGasit === rezultat.verificate && rezultat.sumaPotrivita === rezultat.verificate;
console.log('\nVERDICT:', curat ? 'LOT ACCEPTAT — se poate folosi' : 'LOT RESPINS — nu se foloseste');
