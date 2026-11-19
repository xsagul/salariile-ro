import assert from "node:assert/strict";
import { calculeazaVechime } from "../src/lib/vechime-munca";

// Exact 1 an calendaristic inclusiv
const unAn = calculeazaVechime([{ deLa: "2024-01-01", panaLa: "2024-12-31" }])!;
assert.equal(unAn.ani, 1);
assert.equal(unAn.luni, 0);
assert.equal(unAn.zile, 0);
assert.equal(unAn.zileTotale, 366); // 2024 an bisect
assert.equal(unAn.gradatie.gradatie, 0);
assert.equal(unAn.cotaSomajProcent, 0);

// Suprapunerea a două contracte simultane nu dublează vechimea
const suprapus = calculeazaVechime([
  { deLa: "2020-01-01", panaLa: "2025-12-31" },
  { deLa: "2022-01-01", panaLa: "2023-12-31" },
])!;
assert.equal(suprapus.ani, 6);
assert.equal(suprapus.luni, 0);
assert.equal(suprapus.zile, 0);
assert.ok(suprapus.zileSuprapuseEliminate === 730);
assert.equal(suprapus.gradatie.gradatie, 2); // 5–10 ani
assert.equal(suprapus.cotaSomajProcent, 5);
assert.equal(suprapus.luniRamaseStagiuMinimPensie, 9 * 12);

// Două perioade separate adunate: 10 ani + 5 ani = 15 ani -> stagiu minim pensie atins
const pensie = calculeazaVechime([
  { deLa: "2005-01-01", panaLa: "2014-12-31" },
  { deLa: "2016-01-01", panaLa: "2020-12-31" },
])!;
assert.equal(pensie.ani, 15);
assert.equal(pensie.luniRamaseStagiuMinimPensie, 0);
assert.equal(pensie.luniRamaseStagiuCompletPensie, 20 * 12);
assert.equal(pensie.gradatie.gradatie, 4); // 15–20 ani

// Intrări invalide
assert.equal(calculeazaVechime([{ deLa: "2025-05-01", panaLa: "2024-01-01" }]), null);
assert.equal(calculeazaVechime([]), null);

console.log("OK: calculator vechime în muncă (perioade, suprapuneri, gradații, pensie, șomaj).");
