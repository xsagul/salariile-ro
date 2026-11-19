import assert from "node:assert/strict";
import {
  MAXIM_ICC_BRUT,
  MINIM_ICC_BRUT,
  calculeazaCrestereCopil,
} from "../src/lib/crestere-copil";

// Minim: venit mic -> plafonat la 1.651 brut, CASS 10% = 165, net = 1.486
const min = calculeazaCrestereCopil({ mediaNeta12Luni: 1500 })!;
assert.equal(min.plafonatMinim, true);
assert.equal(min.brutBaza, MINIM_ICC_BRUT);
assert.equal(min.cass, 165);
assert.equal(min.netLunar, 1486);

// Mediu: 6.000 net -> 85% = 5.100 brut -> CASS 510 -> 4.590 net
const med = calculeazaCrestereCopil({ mediaNeta12Luni: 6000 })!;
assert.equal(med.plafonatMinim, false);
assert.equal(med.plafonatMaxim, false);
assert.equal(med.brutBaza, 5100);
assert.equal(med.cass, 510);
assert.equal(med.netLunar, 4590);

// Maxim: 15.000 net -> plafonat la 8.500 brut -> CASS 850 -> 7.650 net
const max = calculeazaCrestereCopil({ mediaNeta12Luni: 15000 })!;
assert.equal(max.plafonatMaxim, true);
assert.equal(max.brutBaza, MAXIM_ICC_BRUT);
assert.equal(max.cass, 850);
assert.equal(max.netLunar, 7650);

// Gemeni: 6.000 net -> bază 5.100 + 50% (2.550) = 7.650 brut -> CASS 765 -> 6.885 net
const gemeni = calculeazaCrestereCopil({ mediaNeta12Luni: 6000, numarCopii: 2 })!;
assert.equal(gemeni.suplimentMultipluBrut, 2550);
assert.equal(gemeni.brutTotal, 7650);
assert.equal(gemeni.netLunar, 6885);

// Gemeni pe venit mic: suplimentul nu poate fi sub 1.651 lei
const gemeniMin = calculeazaCrestereCopil({ mediaNeta12Luni: 2500, numarCopii: 2 })!;
assert.equal(gemeniMin.suplimentMultipluBrut, MINIM_ICC_BRUT);

// Copil cu handicap -> 3 ani
const handicap = calculeazaCrestereCopil({ mediaNeta12Luni: 5000, copilCuHandicap: true })!;
assert.equal(handicap.durataAni, 3);

assert.equal(calculeazaCrestereCopil({ mediaNeta12Luni: -100 }), null);

console.log("OK: calculator indemnizație creștere copil 2026 (OUG 111/2010 + CASS 10% Legea 141/2025).");
