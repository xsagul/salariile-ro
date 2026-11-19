import assert from "node:assert/strict";
import {
  calculeazaIndemnizatieCO,
  calculeazaZileProportionale,
} from "../src/lib/concediu-odihna";

// Indemnizație CO când media ultimelor 3 luni e egală cu brutul curent -> net identic
const egal = calculeazaIndemnizatieCO({
  salariuBrutContract: 6300,
  mediaBruta3Luni: 6300,
  zileLucratoareLuna: 21,
  zileConcediu: 10,
})!;
assert.equal(egal.castigaMedia3Luni, false);
assert.equal(egal.brutConcediu, 3000);
assert.equal(egal.brutZileLucrate, 3300);
assert.equal(egal.totalBrutLuna, 6300);
assert.equal(egal.diferentaNetFataDeNormal, 0);

// Media ultimelor 3 luni mai mare (ex: bonus) -> tarif zilnic mai mare pe zilele de CO
const bonus = calculeazaIndemnizatieCO({
  salariuBrutContract: 6300,
  mediaBruta3Luni: 8400,
  zileLucratoareLuna: 21,
  zileConcediu: 5,
})!;
assert.equal(bonus.castigaMedia3Luni, true);
assert.equal(bonus.brutConcediu, 2000); // 400/zi * 5
assert.equal(bonus.brutZileLucrate, 4800); // 300/zi * 16
assert.equal(bonus.totalBrutLuna, 6800);
assert.ok(bonus.diferentaNetFataDeNormal > 0);

// Media ultimelor 3 luni mai mică (ex: absențe/concediu) -> se păstrează salariul de bază din contract (art. 150)
const protejat = calculeazaIndemnizatieCO({
  salariuBrutContract: 6300,
  mediaBruta3Luni: 5000,
  zileLucratoareLuna: 21,
  zileConcediu: 5,
})!;
assert.equal(protejat.tarifZilnicAplicat, 300);
assert.equal(protejat.totalBrutLuna, 6300);

// Zile proporționale: 21 zile/an, 6 luni lucrate -> 10,5 -> 11 zile; 4 efectuate -> 7 rămase
const prop = calculeazaZileProportionale({
  zilePeAn: 21,
  luniLucrate: 6,
  zileEfectuate: 4,
  salariuBrut: 6300,
})!;
assert.equal(prop.zileCuveniteExact, 10.5);
assert.equal(prop.zileCuveniteRotunjite, 11);
assert.equal(prop.zileRamase, 7);
assert.equal(prop.brutCompensare, 2100);
assert.ok(prop.netCompensareEstimat > 1100 && prop.netCompensareEstimat < 1350);

// Sub minimul legal de 20 zile/an -> invalid
assert.equal(calculeazaZileProportionale({ zilePeAn: 15, luniLucrate: 6, zileEfectuate: 0, salariuBrut: 5000 }), null);

console.log("OK: calculator concediu de odihnă (Codul Muncii art. 145–150).");
