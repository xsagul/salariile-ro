// scripts/test-tva.mts
//
// Verifică aritmetica de pe /calculator-tva.
//
// Cifrele așteptate sunt calculate de mână, nu preluate din modul. Două
// greșeli fac un calculator de TVA să mintă cu un ban, iar un contabil o vede
// imediat pe factură:
//  - rotunjirea în virgulă mobilă (0,21 nu există exact în binar);
//  - „scoate TVA” făcut prin scăderea cotei din total: din 121 de lei, TVA-ul
//    e 21 de lei, nu 25,41 (21% din 121).

import assert from "node:assert/strict";

const modulPath = "../src/lib/tva.ts";
const M = (await import(modulPath)) as typeof import("../src/lib/tva");

let n = 0;
const ok = (mesaj: string, f: () => void) => {
  f();
  n++;
  console.log(`  ok  ${mesaj}`);
};

const adauga = (sumaBani: number, cotaSutimi: number) => M.calculeazaTva({ sumaBani, cotaSutimi, directie: "adauga" });
const scoate = (sumaBani: number, cotaSutimi: number) => M.calculeazaTva({ sumaBani, cotaSutimi, directie: "scoate" });

console.log("\nCotele din lege");

ok("cota standard e 21%, cota redusă 11% (Codul fiscal, art. 291)", () => {
  assert.equal(M.COTA_STANDARD_PROCENT, 21);
  assert.equal(M.COTA_REDUSA_PROCENT, 11);
});

ok("plafonul de scutire e 395.000 lei (art. 310)", () => {
  assert.equal(M.PLAFON_SCUTIRE_LEI, 395_000);
});

console.log("\nAdaugă TVA");

ok("1.000 lei la 21% dau 210 lei TVA și 1.210 lei cu TVA", () => {
  assert.deepEqual(adauga(100_000, 2100), { faraTva: 100_000, tva: 21_000, cuTva: 121_000, cotaSutimi: 2100 });
});

ok("100 lei la 11% dau 11 lei TVA și 111 lei cu TVA", () => {
  assert.deepEqual(adauga(10_000, 1100), { faraTva: 10_000, tva: 1_100, cuTva: 11_100, cotaSutimi: 1100 });
});

ok("49,99 lei la 21% dau 10,50 lei TVA (10,4979 rotunjit) și 60,49 lei", () => {
  const r = adauga(4_999, 2100);
  assert.equal(r?.tva, 1_050);
  assert.equal(r?.cuTva, 6_049);
});

ok("jumătatea de ban urcă: 0,50 lei la 21% dau 0,11 lei TVA (0,105)", () => {
  assert.equal(adauga(50, 2100)?.tva, 11);
  // 1,50 lei la 11% = 0,165 → 0,17.
  assert.equal(adauga(150, 1100)?.tva, 17);
});

console.log("\nScoate TVA");

ok("din 1.210 lei la 21%: 210 lei TVA, 1.000 lei fără TVA", () => {
  assert.deepEqual(scoate(121_000, 2100), { faraTva: 100_000, tva: 21_000, cuTva: 121_000, cotaSutimi: 2100 });
});

ok("din 100 lei la 21%: 17,36 lei TVA (100 × 21 ÷ 121 = 17,3553), nu 21 lei", () => {
  const r = scoate(10_000, 2100);
  assert.equal(r?.tva, 1_736);
  assert.equal(r?.faraTva, 8_264);
});

ok("din 100 lei la 11%: 9,91 lei TVA (100 × 11 ÷ 111 = 9,9099)", () => {
  const r = scoate(10_000, 1100);
  assert.equal(r?.tva, 991);
  assert.equal(r?.faraTva, 9_009);
});

ok("o cotă scrisă de mână: din 109 lei la 9% ies 9 lei TVA și 100 lei", () => {
  assert.deepEqual(scoate(10_900, 900), { faraTva: 10_000, tva: 900, cuTva: 10_900, cotaSutimi: 900 });
});

console.log("\nProprietăți care trebuie să țină pentru orice sumă");

ok("prețul fără TVA plus TVA dă exact prețul cu TVA", () => {
  for (const cota of [2100, 1100, 900, 1900, 500, 950]) {
    for (let bani = 1; bani <= 30_000; bani += 7) {
      for (const r of [adauga(bani, cota), scoate(bani, cota)]) {
        assert.ok(r, `${bani} bani la ${cota}`);
        assert.equal(r.faraTva + r.tva, r.cuTva, `${bani} bani la ${cota}`);
      }
    }
  }
});

ok("adaugi TVA, apoi o scoți: ajungi la suma de la care ai plecat", () => {
  for (const cota of [2100, 1100]) {
    for (let bani = 1; bani <= 50_000; bani++) {
      const cuTva = adauga(bani, cota)!.cuTva;
      assert.equal(scoate(cuTva, cota)!.faraTva, bani, `${bani} bani la ${cota}`);
    }
  }
});

ok("sumele mari rămân exacte: 999.999.999,99 lei la 21%", () => {
  // 99.999.999.999 bani × 0,21 = 20.999.999.999,79 → 21.000.000.000 bani.
  assert.equal(adauga(99_999_999_999, 2100)?.tva, 21_000_000_000);
  assert.equal(adauga(100_000_000_000, 2100), null);
});

ok("fără sumă, cu sumă negativă sau cu o cotă imposibilă nu iese nimic", () => {
  assert.equal(adauga(0, 2100), null);
  assert.equal(adauga(-100, 2100), null);
  assert.equal(adauga(100.5, 2100), null);
  assert.equal(adauga(10_000, 0), null);
  assert.equal(adauga(10_000, 10_001), null);
});

console.log("\nCum scriu oamenii o sumă");

ok("românește, englezește și cu spații: aceeași sumă", () => {
  for (const scris of ["1.234,56", "1234,56", "1234.56", "1 234,56", "1,234.56", "1.234,56 lei", " 1234,56 RON"]) {
    assert.equal(M.citesteSuma(scris), 123_456, scris);
  }
});

ok("un punct urmat de trei cifre desparte miile; altfel e zecimal", () => {
  assert.equal(M.citesteSuma("1.234"), 123_400);
  assert.equal(M.citesteSuma("12.500"), 1_250_000);
  assert.equal(M.citesteSuma("49.99"), 4_999);
  assert.equal(M.citesteSuma("12.5"), 1_250);
  assert.equal(M.citesteSuma("0.125"), 13);
  assert.equal(M.citesteSuma("1.234.567"), 123_456_700);
});

ok("virgula e zecimală, cum se scrie în română: 7,459 lei = 7,46 lei", () => {
  assert.equal(M.citesteSuma("7,459"), 746);
  assert.equal(M.citesteSuma("1,5"), 150);
  assert.equal(M.citesteSuma("100"), 10_000);
  assert.equal(M.citesteSuma("1,234,567"), 123_456_700);
  assert.equal(M.citesteSuma("1.234.567,89"), 123_456_789);
});

ok("ce nu e sumă nu devine sumă", () => {
  for (const scris of ["", "   ", "abc", "-5", "0", "0,00", "1,2,3.4.5", "12,34,56.78.9", "1e5", ",5", "1.234,56,7"]) {
    assert.equal(M.citesteSuma(scris), null, JSON.stringify(scris));
  }
});

ok("cota scrisă de mână: 9, 9,5 și 19% sunt cote; 0 și 101 nu", () => {
  assert.equal(M.citesteCota("9"), 900);
  assert.equal(M.citesteCota("9,5"), 950);
  assert.equal(M.citesteCota("19%"), 1900);
  assert.equal(M.citesteCota(" 5 % "), 500);
  assert.equal(M.citesteCota("100"), 10_000);
  for (const scris of ["", "0", "101", "abc", "-9", "9,555", "1.000"]) {
    assert.equal(M.citesteCota(scris), null, JSON.stringify(scris));
  }
});

console.log("\nCum se afișează");

ok("banii se scriu cu două zecimale și punct la mii", () => {
  assert.equal(M.formatBani(123_456), "1.234,56");
  assert.equal(M.formatBani(5), "0,05");
  assert.equal(M.formatBani(21_000_000_000), "210.000.000,00");
  assert.equal(M.formatCota(2100), "21");
  assert.equal(M.formatCota(950), "9,5");
});

ok("rezumatul cotei reduse nu promite 11% la răcoritoare sau alcool", () => {
  assert.ok(!M.LA_COTA_REDUSA.some((x) => /băuturi/i.test(x)), "lit. b) scoate alcoolul și răcoritoarele");
  assert.match(M.EXCEPTII_ALIMENTE, /alcoolice/);
  assert.match(M.EXCEPTII_ALIMENTE, /răcoritoarele/);
});

console.log(`\n${n} verificări trecute.\n`);
