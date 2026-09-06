import assert from 'node:assert/strict';
import {zileLucratoareLuna,zileLucratoareInterval,sarbatoriAn} from '../src/lib/sarbatori';
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
console.log('OK: calendare, Paște/Rusalii, intervale incluzive, suprapuneri, DST și date invalide.');
