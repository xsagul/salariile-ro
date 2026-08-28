// scripts/test-invatamant.mts
//
// Verifica grila si calculul pentru invatamantul preuniversitar.
// Cifrele asteptate sunt calculate de mana din textul legii, nu preluate din
// modul — altfel testul ar confirma doar ca modulul e de acord cu el insusi.

import assert from "node:assert/strict";

const modulPath = "../src/lib/invatamant.ts";

const {
  GRILA,
  GRADATII,
  gradatiaDupaVechime,
  aplicaGradatia,
  calculeazaInvatamant,
  functiiDisponibile,
  vechimiPentruFunctie,
  INDEMNIZATIE_DOCTORAT_2026,
  SURSA_GRILA,
} = (await import(modulPath)) as typeof import("../src/lib/invatamant");

let treceri = 0;
const ok = (nume: string, f: () => void) => {
  f();
  treceri++;
  console.log("  ok  " + nume);
};

console.log("\nGrila");

ok("are 97 de randuri", () => assert.equal(GRILA.length, 97));

ok("are 21 de functii, numerotate 1-21 fara lipsuri", () => {
  const nr = [...new Set(GRILA.map((g) => g.nr))].sort((a, b) => a - b);
  assert.equal(nr.length, 21);
  assert.deepEqual(nr, Array.from({ length: 21 }, (_, i) => i + 1));
});

ok("fiecare valoare din iunie 2024 e peste cea din ianuarie", () => {
  for (const g of GRILA) assert.ok(g.iun2024 > g.ian2024, `${g.nr} ${g.vechime}`);
});

ok("sumele sunt in interval plauzibil", () => {
  for (const g of GRILA) {
    assert.ok(g.iun2024 >= 6000 && g.iun2024 <= 9000, `${g.nr} ${g.vechime}: ${g.iun2024}`);
  }
});

ok("declara sursa si forma consolidata", () => {
  assert.match(SURSA_GRILA.act, /153\/2017/);
  assert.equal(SURSA_GRILA.formaConsolidata, "2026-01-01");
});

console.log("\nGradatii");

ok("pragurile de vechime dau gradatia corecta", () => {
  assert.equal(gradatiaDupaVechime(0), 0);
  assert.equal(gradatiaDupaVechime(2), 0);
  assert.equal(gradatiaDupaVechime(3), 1);
  assert.equal(gradatiaDupaVechime(4), 1);
  assert.equal(gradatiaDupaVechime(5), 2);
  assert.equal(gradatiaDupaVechime(9), 2);
  assert.equal(gradatiaDupaVechime(10), 3);
  assert.equal(gradatiaDupaVechime(14), 3);
  assert.equal(gradatiaDupaVechime(15), 4);
  assert.equal(gradatiaDupaVechime(19), 4);
  assert.equal(gradatiaDupaVechime(20), 5);
  assert.equal(gradatiaDupaVechime(40), 5);
});

ok("gradatiile se COMPUN, nu se aduna", () => {
  // 1000 lei, gradatia 5, calculat de mana pas cu pas:
  //   g1: 1000 * 1,075 = 1075
  //   g2: 1075 * 1,05  = 1128,75 -> 1129
  //   g3: 1129 * 1,05  = 1185,45 -> 1185
  //   g4: 1185 * 1,025 = 1214,63 -> 1215
  //   g5: 1215 * 1,025 = 1245,38 -> 1245
  assert.equal(aplicaGradatia(1000, 5), 1245);
  // adunarea ar da 1225 — daca testul asta cade cu 1225, cineva a "simplificat"
  assert.notEqual(aplicaGradatia(1000, 5), 1225);
});

ok("gradatia 0 nu schimba nimic", () => assert.equal(aplicaGradatia(7045, 0), 7045));

ok("cotele sunt cele din art. 10 alin. (4)", () => {
  assert.deepEqual(GRADATII.map((g) => g.cota), [0, 0.075, 0.05, 0.05, 0.025, 0.025]);
});

console.log("\nCalcul");

ok("profesor grad I, peste 25 ani invatamant, gradatia 5", () => {
  // Randul 1, "peste 25 ani" = 8.215 lei (verificat in extrasul sursa).
  // Gradatia 5 pas cu pas:
  //   8215 * 1,075 = 8831,125 -> 8831
  //   8831 * 1,05  = 9272,55  -> 9273
  //   9273 * 1,05  = 9736,65  -> 9737
  //   9737 * 1,025 = 9980,43  -> 9980
  //   9980 * 1,025 = 10229,5  -> 10230  (Math.round: .5 in sus)
  const r = calculeazaInvatamant({ functie: 1, vechimeInvatamant: "peste 25 ani", aniMunca: 30 });
  assert.ok(r);
  assert.equal(r.salariuGrila, 8215);
  assert.equal(r.gradatie, 5);
  assert.equal(r.salariuDeBaza, 10230);
  assert.equal(r.brutTotal, 10230);
});

ok("dirigentia se aplica la salariul DUPA gradatie, nu la grila", () => {
  const r = calculeazaInvatamant({
    functie: 1, vechimeInvatamant: "peste 25 ani", aniMunca: 30, majorari: ["dirigentie"],
  });
  assert.ok(r);
  // 10% din 10230 = 1023, NU 10% din 8215 = 822
  assert.equal(r.linii[0].suma, 1023);
  assert.equal(r.brutTotal, 10230 + 1023);
});

ok("doctoratul e suma fixa, nu procent", () => {
  const r = calculeazaInvatamant({
    functie: 1, vechimeInvatamant: "peste 25 ani", aniMunca: 30, doctorat: true,
  });
  assert.ok(r);
  assert.equal(r.linii.at(-1)!.suma, INDEMNIZATIE_DOCTORAT_2026);
  assert.equal(INDEMNIZATIE_DOCTORAT_2026, 500);
});

ok("debutant fara vechime ramane la valoarea din grila", () => {
  const r = calculeazaInvatamant({ functie: 4, vechimeInvatamant: "până la 1 an", aniMunca: 0 });
  assert.ok(r);
  assert.equal(r.gradatie, 0);
  assert.equal(r.salariuDeBaza, r.salariuGrila);
  assert.equal(r.salariuGrila, 6446);
});

ok("fiecare linie isi declara temeiul legal", () => {
  const r = calculeazaInvatamant({
    functie: 1, vechimeInvatamant: "peste 25 ani", aniMunca: 30,
    majorari: ["dirigentie", "gradatie-merit"], doctorat: true,
  });
  assert.ok(r);
  assert.equal(r.linii.length, 3);
  for (const l of r.linii) assert.ok(l.temei.length > 5, `linia "${l.eticheta}" n-are temei`);
});

ok("combinatie inexistenta intoarce null, nu o cifra inventata", () => {
  assert.equal(calculeazaInvatamant({ functie: 4, vechimeInvatamant: "peste 25 ani", aniMunca: 10 }), null);
  assert.equal(calculeazaInvatamant({ functie: 99, vechimeInvatamant: "peste 25 ani", aniMunca: 10 }), null);
});

console.log("\nSelectoare");

ok("functiiDisponibile da 21 de functii, in ordine", () => {
  const f = functiiDisponibile();
  assert.equal(f.length, 21);
  assert.deepEqual(f.map((x) => x.nr), Array.from({ length: 21 }, (_, i) => i + 1));
});

ok("fiecare functie are cel putin o transa de vechime", () => {
  for (const f of functiiDisponibile()) {
    assert.ok(vechimiPentruFunctie(f.nr).length >= 1, `functia ${f.nr} n-are transe`);
  }
});

ok("orice pereche functie x vechime din selectoare produce un calcul", () => {
  for (const f of functiiDisponibile()) {
    for (const v of vechimiPentruFunctie(f.nr)) {
      const r = calculeazaInvatamant({ functie: f.nr, vechimeInvatamant: v, aniMunca: 12 });
      assert.ok(r, `${f.nr} × ${v} intoarce null`);
      assert.ok(r.brutTotal > 0);
    }
  }
});

console.log(`\n${treceri} verificari, toate trecute.`);
