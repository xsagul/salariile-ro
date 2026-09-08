import fs from 'node:fs';
import * as cheerio from 'cheerio';

function hydrateNuxt(flat) {
  const seen = new Array(flat.length);
  const done = new Array(flat.length).fill(false);
  const specials = { '-1': undefined, '-2': undefined, '-3': NaN, '-4': Infinity, '-5': -Infinity, '-6': -0 };
  function at(i) {
    if (typeof i !== 'number') return i;
    if (i < 0) return specials[String(i)];
    if (done[i]) return seen[i];
    const v = flat[i];
    if (v === null || typeof v !== 'object') { done[i] = true; return (seen[i] = v); }
    if (Array.isArray(v)) {
      if (typeof v[0] === 'string') {
        const [tag, ...rest] = v;
        if (tag === 'Date') { done[i] = true; return (seen[i] = new Date(at(rest[0]))); }
        if (tag === 'Set') { done[i] = true; return (seen[i] = new Set(rest.map(at))); }
        if (tag === 'Map') { const m = new Map(); done[i] = true; seen[i] = m; for (let k = 0; k < rest.length; k += 2) m.set(at(rest[k]), at(rest[k + 1])); return m; }
        // Nuxt wrappers: Ref, Reactive, ShallowRef, EmptyRef ... unwrap to the target
        done[i] = true; seen[i] = null;
        const inner = at(rest[0]);
        return (seen[i] = inner);
      }
      const out = []; seen[i] = out; done[i] = true;
      for (const j of v) out.push(at(j));
      return out;
    }
    const out = {}; seen[i] = out; done[i] = true;
    for (const [k, j] of Object.entries(v)) out[k] = at(j);
    return out;
  }
  return at(0);
}

const html = fs.readFileSync(process.argv[2], 'utf8');
const $ = cheerio.load(html);
const raw = $('#__NUXT_DATA__').text();
console.log('lungime payload:', raw.length);
const flat = JSON.parse(raw);
console.log('elemente in tabelul plat:', flat.length);
const root = hydrateNuxt(flat);

// cauta liste de anunturi: obiecte cu id numeric mare + title + salary
const hits = [];
function walk(node, path, depth) {
  if (depth > 12 || node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    if (node.length > 5 && node.every(x => x && typeof x === 'object' && 'title' in x && 'salary' in x)) hits.push({ path, n: node.length, sample: node[0] });
    node.slice(0, 60).forEach((x, i) => walk(x, `${path}[${i}]`, depth + 1));
    return;
  }
  for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, depth + 1);
}
walk(root, '$', 0);
const items = hits[0] ? root.pinia.jobs._listItems : [];
console.log('carduri:', items.length);
console.log('chei pe un card:', Object.keys(items[0]||{}).join(','));
console.log('--- chei de nivel inalt in pinia ---');
for (const [k, v] of Object.entries(root.pinia || {})) console.log('   pinia.' + k, v && typeof v === 'object' ? Object.keys(v).slice(0, 18).join(',') : typeof v);
console.log('--- exista net/brut in tabelul plat? ---');
const flatStrings = flat.filter(x => typeof x === 'string');
const netish = flatStrings.filter(x => /^(net|brut|gross|NET|BRUT)$/i.test(x) || /net|brut|salaryType|periodicity|lun/i.test(x));
console.log('siruri relevante:', [...new Set(netish)].slice(0, 25));
console.log('--- chei din obiecte care contin "salar" ---');
const keys = new Set();
for (const x of flat) if (x && typeof x === 'object' && !Array.isArray(x)) for (const k of Object.keys(x)) if (/salar|net|brut|period|currency/i.test(k)) keys.add(k);
console.log([...keys]);

