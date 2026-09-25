import assert from 'node:assert/strict';
import {zileLucratoareLuna,zileLucratoareInterval,sarbatoriAn,sarbatoriCalculate,pasteOrtodox,SARBATORI_LEGALE_2026,SARBATORI_LEGALE_2027} from '../src/lib/sarbatori';
assert.equal(zileLucratoareLuna(2027,0),18); // 21 luni–vineri minus 1,6,7 ianuarie
assert.equal(zileLucratoareLuna(2027,3),21); // Vinerea Mare
assert.equal(zileLucratoareLuna(2027,4),20); // A doua zi de Paște
assert.equal(zileLucratoareLuna(2027,5),20); // 1 iunie și luni Rusalii
assert.equal(zileLucratoareInterval('2027-04-30','2027-05-03').lucratoare,0);
assert.equal(zileLucratoareInterval('2026-12-31','2027-01-04').lucratoare,2);
assert.equal(zileLucratoareInterval('2027-03-26','2027-03-29').lucratoare,2); // DST
assert.equal(zileLucratoareInterval('2026-06-01','2026-06-01').lucratoare,0); // două sărbători, o zi
assert.throws(()=>zileLucratoareInterval('2027-02-30','2027-03-02'));
assert.throws(()=>zileLucratoareInterval('2027-06-02','2027-06-01'));
assert.throws(()=>zileLucratoareInterval('2028-01-01','2028-01-02'));
assert.equal(Object.keys(sarbatoriAn(2027)).length,17);
// Calculul din Codul Muncii dă exact listele verificate de mână, cu tot cu ordinea și numele.
assert.deepEqual(Object.entries(sarbatoriCalculate(2026)),Object.entries(SARBATORI_LEGALE_2026));
assert.deepEqual(Object.entries(sarbatoriCalculate(2027)),Object.entries(SARBATORI_LEGALE_2027));
// Paștele ortodox, după paschalia publicată: 2026–2031.
const paste=(an:number)=>new Date(pasteOrtodox(an)).toISOString().slice(0,10);
assert.deepEqual([2026,2027,2028,2029,2030,2031].map(paste),['2026-04-12','2027-05-02','2028-04-16','2029-04-08','2030-04-28','2031-04-13']);
assert.equal(sarbatoriAn(2031)['6-1'],'Rusalii / Ziua Copilului'); // Paștele pe 13 aprilie: Rusaliile cad de 1 iunie
assert.throws(()=>sarbatoriAn(2032));
console.log('OK: calendare, Paște/Rusalii, intervale incluzive, suprapuneri, DST și date invalide.');
