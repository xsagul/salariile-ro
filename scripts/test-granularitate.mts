import assert from 'node:assert/strict';
import { MESERII, dateMeserieSauEroare } from '../src/lib/meserii';
import { reperMeserie, textReper } from '../src/lib/repere-meserii';
import { textIndicator } from '../src/lib/indicator-meserie';
import { judetePentru, nationalJudete } from '../src/lib/ins-date';
import reports from '../src/data/repere-piata-verificate.json';
import disclosure from '../src/data/transparenta-constanta.json';

for (const m of MESERII) {
  const r = reperMeserie(dateMeserieSauEroare(m));
  const d = dateMeserieSauEroare(m);

  assert.deepEqual(d.judete, [...judetePentru(m.caen2)].sort((a, b) => b.brut - a.brut), 'nu indexăm sau plafonăm istoricul județean');
  assert.equal(d.mediaJudete, nationalJudete(m.caen2));
  assert.ok(r.value === null || (Number.isFinite(r.value) && r.value > 0), m.slug);
  assert.ok(r.upper === null || (r.value !== null && r.upper >= r.value), m.slug);
  assert.equal(r.median, null, 'nu inventăm mediane din medii sau grile');
  assert.equal(r.p25, null, 'nu inventăm quartile');
  assert.equal(r.p75, null, 'nu inventăm quartile');

  for (const value of [r.source, r.period, r.population, r.note]) assert.ok(value.length > 0, m.slug);
  assert.ok(r.url.startsWith('https://'));
  assert.ok(!textReper(r).includes('NaN'));

  if (r.upper !== null && r.upper !== r.value) {
    assert.ok(textIndicator(r).includes('–'), 'intervalul nu se ascunde');
  }

  const source = reports.records.find(x=>x.slug===m.slug);
  if (source) {
    assert.equal(r.value, source.net, 'valoarea publicată este exact măsura sursei');
    assert.equal(r.kind,'external-reported');
  } else assert.ok(['public-grid','sector-context'].includes(r.kind));
}

for (const r of disclosure.records) {
  assert.ok(r.rows >= 5);
  assert.ok(r.componentsMin >= r.baseMin);
  assert.ok(r.componentsMax >= r.baseMax);
}

const electric = reperMeserie(dateMeserieSauEroare(MESERII.find(m => m.slug === 'electrician')!));
const instalator = reperMeserie(dateMeserieSauEroare(MESERII.find(m => m.slug === 'instalator')!));

assert.equal(electric.value,reports.records.find(r=>r.slug==='electrician')!.net);
assert.equal(instalator.value,reports.records.find(r=>r.slug==='instalator')!.net);
assert.equal(electric.median,null); assert.equal(instalator.median,null);

console.log(`OK: ${MESERII.length} repere, ${reports.records.length} medii atribuite sursei; nicio mediană sau quartilă fabricată.`);
