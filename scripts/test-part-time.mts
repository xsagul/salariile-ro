// Verifică separat regula contribuțiilor minime pentru contractele part-time.
// Valorile așteptate sunt reproduse din pașii D112, nu derivate din rezultatul
// modulului, ca testul să poată prinde o schimbare greșită de formulă.

import assert from "node:assert/strict";

const fiscalPath = "../src/lib/fiscal.ts";
const {
  calculeazaPartTime,
  calculeazaPartTimeCuRegim,
  salariuMinimPartTime,
} = (await import(fiscalPath)) as typeof import("../src/lib/fiscal");
import type { InputState } from "../src/lib/fiscal";

const baza: InputState = {
  brut: "2163",
  tichete: "0",
  functieDeBAza: true,
  persoanePretretinere: 0,
  varstaSub26: false,
  copiiScolarizati: 0,
  scutitImpozit: false,
  normaContract: "partiala",
};

let treceri = 0;
const ok = (nume: string, verificare: () => void) => {
  verificare();
  treceri += 1;
  console.log("  ok  " + nume);
};

console.log("\nContract part-time");

ok("minimul proporțional se rotunjește la leu", () => {
  assert.equal(salariuMinimPartTime(2), 1081);
  assert.equal(salariuMinimPartTime(4), 2163);
  assert.equal(salariuMinimPartTime(6), 3244);
});

ok("4 ore: netul se calculează numai din brutul angajatului", () => {
  const r = calculeazaPartTime(baza, { orePeZi: 4, exceptatBazaMinima: false });
  assert.ok(r);
  assert.equal(r.cas, 541);
  assert.equal(r.cass, 216);
  assert.equal(r.impozit, 54);
  assert.equal(r.netBani, 1352);
});

ok("4 ore: diferențele CAS/CASS sunt ale angajatorului", () => {
  const r = calculeazaPartTime(baza, { orePeZi: 4, exceptatBazaMinima: false });
  assert.ok(r);
  assert.equal(r.bazaMinimaContributii, 4125);
  assert.equal(r.diferentaCasAngajator, 490);
  assert.equal(r.diferentaCassAngajator, 197);
  assert.equal(r.cam, 49);
  assert.equal(r.costTotalCuDiferente, 2899);
});

ok("excepția elimină diferențele, nu schimbă netul", () => {
  const normal = calculeazaPartTime(baza, { orePeZi: 4, exceptatBazaMinima: false });
  const exceptat = calculeazaPartTime(baza, { orePeZi: 4, exceptatBazaMinima: true });
  assert.ok(normal && exceptat);
  assert.equal(exceptat.netBani, normal.netBani);
  assert.equal(exceptat.diferentaCasAngajator, 0);
  assert.equal(exceptat.diferentaCassAngajator, 0);
  assert.equal(exceptat.costTotalCuDiferente, 2212);
});

ok("2 ore: reproduce pașii D112", () => {
  const r = calculeazaPartTime({ ...baza, brut: "1081" }, { orePeZi: 2, exceptatBazaMinima: false });
  assert.ok(r);
  assert.equal(r.netBani, 703);
  assert.equal(r.diferentaCasAngajator, 761);
  assert.equal(r.diferentaCassAngajator, 305);
  assert.equal(r.costTotalCuDiferente, 2171);
});

ok("6 ore: reproduce pașii D112", () => {
  const r = calculeazaPartTime({ ...baza, brut: "3244" }, { orePeZi: 6, exceptatBazaMinima: false });
  assert.ok(r);
  assert.equal(r.netBani, 1985);
  assert.equal(r.diferentaCasAngajator, 220);
  assert.equal(r.diferentaCassAngajator, 89);
  assert.equal(r.costTotalCuDiferente, 3626);
});

ok("peste baza minimă nu mai există diferențe", () => {
  const r = calculeazaPartTime({ ...baza, brut: "5000" }, { orePeZi: 4, exceptatBazaMinima: false });
  assert.ok(r);
  assert.equal(r.diferentaCasAngajator, 0);
  assert.equal(r.diferentaCassAngajator, 0);
  assert.equal(r.costTotalCuDiferente, r.costTotal);
});

ok("regimul S1 folosește pragul redus corect", () => {
  const r = calculeazaPartTimeCuRegim(
    { ...baza, brut: "2025" },
    { orePeZi: 4, exceptatBazaMinima: false, regimFiscal: "2026-S1" },
  );
  assert.ok(r);
  assert.equal(r.bazaMinimaContributii, 3750);
  assert.equal(r.brutMinimProportional, 2025);
});

ok("ore invalide nu produc un calcul", () => {
  assert.equal(salariuMinimPartTime(0), 0);
  assert.equal(salariuMinimPartTime(9), 0);
  assert.equal(calculeazaPartTime(baza, { orePeZi: 0, exceptatBazaMinima: false }), null);
  assert.equal(calculeazaPartTime(baza, { orePeZi: 9, exceptatBazaMinima: false }), null);
});

console.log(`\n${treceri} verificări, toate trecute.`);
