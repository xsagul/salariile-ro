// scripts/test-granularitate.mts
//
// Verifică granularitatea salarială pentru toate cele 126 de meserii din catalog.
// Criteriu de succes: ZERO coliziuni (126 valori salariale unice), nicio meserie cu
// salariu nul sau lipsă, și metadate complete pe fiecare reper (sursă, perioadă, populație).

import assert from 'node:assert/strict';
import { MESERII, dateMeserieSauEroare } from '../src/lib/meserii';
import { reperMeserie, textReper } from '../src/lib/repere-meserii';
import { indicatorMeserie, textIndicator } from '../src/lib/indicator-meserie';

console.log('\n--- Testare granularitate salarială (126 meserii) ---');

const valMap: Record<number, { slug: string; nume: string; kind: string; source: string }[]> = {};

for (const m of MESERII) {
  const d = dateMeserieSauEroare(m);
  const reper = reperMeserie(d);
  const ind = indicatorMeserie(reper);

  // 1. Nicio meserie fără salariu sau cu salariu invalid
  assert.ok(ind.value !== null, `Meseria „${m.slug}" are valoare null`);
  assert.ok(typeof ind.value === 'number' && ind.value > 0, `Meseria „${m.slug}" are valoare nepozitivă: ${ind.value}`);
  assert.ok(reper.value !== null && reper.value > 0, `Meseria „${m.slug}" reper.value invalid: ${reper.value}`);

  // 2. Format text valid, fără NaN
  const text = textReper(reper);
  assert.ok(!text.includes('NaN'), `Meseria „${m.slug}" produce text cu NaN: ${text}`);
  assert.ok(text.length > 0, `Meseria „${m.slug}" textReper este gol`);

  // 3. Metadate obligatorii prezente și valide
  assert.ok(reper.source.length > 0, `Meseria „${m.slug}" nu are sursă`);
  assert.ok(reper.period.length > 0, `Meseria „${m.slug}" nu are perioadă`);
  assert.ok(reper.population.length > 0, `Meseria „${m.slug}" nu are populație`);
  assert.ok(reper.note.length > 0, `Meseria „${m.slug}" nu are notă`);
  assert.ok(reper.url.startsWith('https://'), `Meseria „${m.slug}" URL invalid: ${reper.url}`);

  // 4. Nicio meserie nu mai afișează intervale în textIndicator (toate au o singură cifră clară: X.XXX lei net)
  const indText = textIndicator(reper);
  assert.ok(!indText.includes('–'), `Meseria „${m.slug}" produce interval în textIndicator: ${indText}`);
  assert.match(indText, /^\d{1,3}(\.\d{3})* lei net$/, `Meseria „${m.slug}" format incorect: ${indText}`);

  // 4. Agregare pentru verificarea coliziunilor
  valMap[ind.value] = valMap[ind.value] || [];
  valMap[ind.value].push({ slug: m.slug, nume: m.nume, kind: reper.kind, source: reper.source });
}

const collisions = Object.entries(valMap).filter(([, items]) => items.length > 1);

console.log(`Total meserii analizate: ${MESERII.length}`);
console.log(`Valori salariale distincte: ${Object.keys(valMap).length}`);
console.log(`Grupuri de coliziune: ${collisions.length}`);

if (collisions.length > 0) {
  console.error('\nEroare: Au fost detectate coliziuni de salarii:');
  for (const [val, items] of collisions) {
    console.error(`  La ${val} lei (${items.length} meserii):`);
    for (const item of items) {
      console.error(`    - ${item.slug} (${item.nume}) [${item.kind}] -> ${item.source}`);
    }
  }
}

assert.equal(Object.keys(valMap).length, MESERII.length, `Trebuie să existe exact ${MESERII.length} valori unice, dar există ${Object.keys(valMap).length}`);
assert.equal(collisions.length, 0, `Trebuie să existe 0 coliziuni, dar există ${collisions.length}`);

console.log('✓ OK: Toate cele 126 de meserii au salarii 100% unice, reale și documentate!\n');
