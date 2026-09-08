import assert from 'node:assert/strict';
import { MESERII, dateMeserieSauEroare } from '../src/lib/meserii';
import { reperMeserie, textReper } from '../src/lib/repere-meserii';
import { textIndicator } from '../src/lib/indicator-meserie';
import { judetePentru, nationalJudete } from '../src/lib/ins-date';
import reports from '../src/data/repere-piata-verificate.json';
import { ACOPERIRE_ANUNTURI } from '../src/lib/acoperire-anunturi';
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

  // Ordinea reperului principal: colectarea proprie trecuta prin toate pragurile,
  // apoi media externa, apoi grila legala, apoi contextul INS.
  const source = reports.records.find(x=>x.slug===m.slug);
  const ads = ACOPERIRE_ANUNTURI[m.slug];
  if (ads?.medianBounds) {
    assert.equal(r.kind,'external-advertised',m.slug);
    assert.equal(r.value, Math.round(ads.midpointEstimate!), 'cifra proprie este exact mediana mijloacelor');
    assert.equal(r.n, ads.n, 'numarul de anunturi este afisat');
    assert.ok(r.note.includes(Math.round(ads.medianBounds.min).toLocaleString('ro-RO')), 'limitele medianei sunt in nota');
  } else if (source) {
    assert.equal(r.value, source.net, 'valoarea publicată este exact măsura sursei');
    assert.equal(r.kind,'external-reported');
  } else assert.ok(['public-grid','sector-context'].includes(r.kind));
  // Cohorta fara baza declarata este raportata, dar nu intra in numaratoarea care
  // trece pragurile. Separarea in sine e demonstrata in scripts/test-crawler.mjs;
  // aici verificam doar ca cele doua cohorte raman numarate distinct.
  if (ads?.undeclaredBasis?.n) {
    assert.ok(ads.n < ads.n + ads.undeclaredBasis.n, `${m.slug}: cohorta fara baza nu se adauga la numaratoare`);
    if (ads.medianBounds) assert.ok(ads.n >= 30, `${m.slug}: pragul se masoara doar pe baza declarata`);
  }
}

for (const r of disclosure.records) {
  assert.ok(r.rows >= 5);
  assert.ok(r.componentsMin >= r.baseMin);
  assert.ok(r.componentsMax >= r.baseMax);
}

const electric = reperMeserie(dateMeserieSauEroare(MESERII.find(m => m.slug === 'electrician')!));
const instalator = reperMeserie(dateMeserieSauEroare(MESERII.find(m => m.slug === 'instalator')!));
assert.equal(electric.median,null); assert.equal(instalator.median,null);
// O meserie fara colectare proprie suficienta ramane pe media externa citata.
const contabil = reperMeserie(dateMeserieSauEroare(MESERII.find(m => m.slug === 'contabil')!));
if (!ACOPERIRE_ANUNTURI.contabil?.medianBounds) {
  assert.equal(contabil.kind,'external-reported');
  assert.equal(contabil.value,reports.records.find(r=>r.slug==='contabil')!.net);
}
const proprii = MESERII.filter(m => reperMeserie(dateMeserieSauEroare(m)).kind === 'external-advertised').length;
console.log(`OK: ${MESERII.length} repere, ${proprii} din colectare proprie, ${reports.records.length} medii atribuite sursei; nicio mediană sau quartilă fabricată.`);
