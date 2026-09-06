import assert from 'node:assert/strict';
import { MESERII, dateMeserieSauEroare } from '../src/lib/meserii';
import { reperMeserie, textReper } from '../src/lib/repere-meserii';
import { textIndicator } from '../src/lib/indicator-meserie';
import { judetePentru, nationalJudete } from '../src/lib/ins-date';
import triangulare from '../src/data/triangulare-date.json';
import disclosure from '../src/data/transparenta-constanta.json';

for (const m of MESERII) {
  const r = reperMeserie(dateMeserieSauEroare(m));
  const d = dateMeserieSauEroare(m);

  assert.deepEqual(d.judete, [...judetePentru(m.caen2)].sort((a, b) => b.brut - a.brut), 'nu indexăm sau plafonăm istoricul județean');
  assert.equal(d.mediaJudete, nationalJudete(m.caen2));
  assert.ok(r.value === null || (Number.isFinite(r.value) && r.value > 0), m.slug);
  assert.ok(r.upper === null || (r.value !== null && r.upper >= r.value), m.slug);
  assert.ok(r.median !== null && Number.isFinite(r.median) && r.median > 0, m.slug);
  assert.ok(r.p25 !== null && Number.isFinite(r.p25) && r.p25 > 0, m.slug);
  assert.ok(r.p75 !== null && Number.isFinite(r.p75) && r.p75 >= r.median, m.slug);
  assert.ok(r.p25 <= r.median, m.slug);

  for (const value of [r.source, r.period, r.population, r.note]) assert.ok(value.length > 0, m.slug);
  assert.ok(r.url.startsWith('https://'));
  assert.ok(!textReper(r).includes('NaN'));

  if (r.upper !== null && r.upper !== r.value) {
    assert.ok(textIndicator(r).includes('–'), 'intervalul nu se ascunde');
  }

  const t = triangulare.meserii[m.slug as keyof typeof triangulare.meserii];
  assert.ok(t, `Meseria ${m.slug} trebuie să fie inclusă în registrul de triangulare`);
  assert.equal(r.value, t.median);
}

for (const r of disclosure.records) {
  assert.ok(r.rows >= 5);
  assert.ok(r.componentsMin >= r.baseMin);
  assert.ok(r.componentsMax >= r.baseMax);
}

const electric = reperMeserie(dateMeserieSauEroare(MESERII.find(m => m.slug === 'electrician')!));
const instalator = reperMeserie(dateMeserieSauEroare(MESERII.find(m => m.slug === 'instalator')!));

assert.ok(electric.value !== null && electric.value >= 5000, 'electricianul are un reper valid');
assert.ok(instalator.value !== null && instalator.value >= 5000, 'instalatorul are un reper valid');
assert.ok(electric.median !== null && instalator.median !== null, 'ambele meserii au mediane documentate');

console.log(`OK: ${MESERII.length} repere triangulate, ${triangulare.totalMeserii} meserii verificate, ${disclosure.records.length} grupuri de transparență; mediane și quartile păstrate.`);
