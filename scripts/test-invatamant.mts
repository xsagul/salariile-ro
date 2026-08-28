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


console.log("\nIndemnizația de hrană (art. 18)");

const {
  calculeazaInvatamantComplet,
  INDEMNIZATIE_HRANA,
  PLAFON_HRANA_NET,
} = (await import(modulPath)) as typeof import("../src/lib/invatamant");

ok("se adauga la brut, nu la net", () => {
  const r = calculeazaInvatamantComplet({ functie: 1, vechimeInvatamant: "peste 25 ani", aniMunca: 30 });
  assert.ok(r);
  const linie = r.linii.find((l) => l.eticheta.includes("hrană"));
  assert.ok(linie, "lipseste linia de hrana");
  assert.equal(linie.suma, INDEMNIZATIE_HRANA);
  assert.equal(INDEMNIZATIE_HRANA, 347);
  // salariul de baza ramane neatins; brutul creste cu 347
  assert.equal(r.salariuDeBaza, 10230);
  assert.equal(r.brutTotal, 10230 + 347);
});

ok("se poate exclude, pentru cine are alte drepturi de hrana", () => {
  const r = calculeazaInvatamantComplet(
    { functie: 1, vechimeInvatamant: "peste 25 ani", aniMunca: 30 },
    { faraHrana: true },
  );
  assert.ok(r);
  assert.ok(!r.linii.some((l) => l.eticheta.includes("hrană")));
  assert.equal(r.brutTotal, 10230);
});

ok("toata grila actuala e sub plafonul de 6.000 lei net", () => {
  // Daca asta cade, grila a crescut peste prag si art. 18 incepe sa muste.
  for (const f of functiiDisponibile()) {
    for (const v of vechimiPentruFunctie(f.nr)) {
      const r = calculeazaInvatamantComplet({ functie: f.nr, vechimeInvatamant: v, aniMunca: 40 });
      assert.ok(r, `${f.nr} × ${v}`);
      assert.ok(
        r.linii.some((l) => l.eticheta.includes("hrană")),
        `${f.nr} × ${v} n-a primit hrana — netul bazei a depasit ${PLAFON_HRANA_NET}?`,
      );
    }
  }
});

ok("hrana e impozitata — intra in baza de contributii", () => {
  const cu = calculeazaInvatamantComplet({ functie: 1, vechimeInvatamant: "peste 25 ani", aniMunca: 30 });
  const fara = calculeazaInvatamantComplet(
    { functie: 1, vechimeInvatamant: "peste 25 ani", aniMunca: 30 }, { faraHrana: true });
  assert.ok(cu && fara);
  assert.ok(cu.fiscal.cas > fara.fiscal.cas, "CAS n-a crescut, deci hrana n-a intrat in baza");
  // CAS se rotunjeste O DATA, pe baza totala — nu pe fiecare componenta. De aceea
  // diferenta e 86, nu round(347 x 25%) = 87. Verificam regula, nu diferenta.
  assert.equal(fara.fiscal.cas, Math.round(10230 * 0.25));
  assert.equal(cu.fiscal.cas, Math.round((10230 + 347) * 0.25));
});


console.log("\nAxele de selecție");

const {
  GRUPURI, GRADE, NIVELURI, toateAxele, functiaPentru, gradePosibile, studiiPosibile,
  CONDUCERE, AUXILIAR, salariuConducere, salariuAuxiliar, functiiAuxiliare, trepteAuxiliare,
} = (await import(modulPath)) as typeof import("../src/lib/invatamant");

ok("descompunerea acopera toate cele 21 de functii", () => {
  assert.equal(toateAxele().length, 21);
});

ok("fiecare combinatie grup x grad x studii e unica", () => {
  const chei = new Set(toateAxele().map((a) => `${a.grup}|${a.grad}|${a.studii}`));
  assert.equal(chei.size, 21, "exista coliziuni intre combinatii");
});

ok("descompunerea se reconstituie exact — round-trip pe toate 21", () => {
  for (const a of toateAxele()) {
    assert.equal(functiaPentru(a.grup, a.grad, a.studii), a.nr, `${a.grup}/${a.grad}/${a.studii}`);
  }
});

ok("combinatiile imposibile intorc null", () => {
  // invatatorul nu exista cu studii superioare de lunga durata
  assert.equal(functiaPentru("invatator", "gradul-i", "S"), null);
  // necalificatul nu are grad didactic
  assert.equal(functiaPentru("necalificat", "gradul-i", "M"), null);
});

ok("restrictiile de studii sunt cele din grila", () => {
  assert.deepEqual([...studiiPosibile("profesor", "gradul-i")].sort(), ["S", "SSD"]);
  assert.deepEqual([...studiiPosibile("invatator", "gradul-i")], ["M"]);
  assert.deepEqual([...gradePosibile("necalificat")], ["fara-grad"]);
});

ok("etichetele acopera toate codurile folosite", () => {
  const grupuri = new Set(GRUPURI.map((g) => g.cod));
  const grade = new Set(GRADE.map((g) => g.cod));
  const niv = new Set(NIVELURI.map((n) => n.cod));
  for (const a of toateAxele()) {
    assert.ok(grupuri.has(a.grup), `grup fara eticheta: ${a.grup}`);
    assert.ok(grade.has(a.grad), `grad fara eticheta: ${a.grad}`);
    assert.ok(niv.has(a.studii), `nivel fara eticheta: ${a.studii}`);
  }
});

console.log("\nConducere și didactic auxiliar");

ok("conducerea are 6 functii, cu director de unitate", () => {
  assert.equal(CONDUCERE.length, 6);
  assert.ok(CONDUCERE.some((r) => /Director unitate/.test(r.functie)));
});

ok("la conducere NU se aplica gradatia — e deja inclusa", () => {
  const r = salariuConducere(5, "I");
  assert.ok(r);
  // valoarea din tabel, neatinsa de gradatie
  assert.equal(r.salariu, 11484);
  assert.match(r.temei, /nivel maxim/);
});

ok("studiile scurte diminueaza cu 20% la conducere", () => {
  const plin = salariuConducere(5, "I");
  const scurt = salariuConducere(5, "I", true);
  assert.ok(plin && scurt);
  assert.equal(scurt.salariu, Math.round(plin.salariu * 0.8));
  assert.match(scurt.temei, /nota 1/);
});

ok("auxiliarul are 296 de randuri si 100 de functii", () => {
  assert.equal(AUXILIAR.length, 296);
  assert.equal(functiiAuxiliare().length, 100);
});

ok("contabilul si secretara scolii se gasesc", () => {
  const nume = AUXILIAR.map((r) => r.functie.toLowerCase()).join(" | ");
  assert.match(nume, /administrator financiar/);
  assert.match(nume, /secretar/);
  assert.match(nume, /bibliotecar/);
});

ok("la auxiliar gradatia se aplica normal", () => {
  const f = functiiAuxiliare()[0];
  const t = trepteAuxiliare(f.nr)[0];
  const g0 = salariuAuxiliar(f.nr, t.treapta, 0);
  const g5 = salariuAuxiliar(f.nr, t.treapta, 40);
  assert.ok(g0 && g5);
  assert.equal(g0.salariuDeBaza, g0.salariuGrila);
  assert.ok(g5.salariuDeBaza > g5.salariuGrila, "gradatia n-a fost aplicata");
  assert.equal(g5.gradatie, 5);
});

ok("orice functie auxiliara are cel putin o treapta care calculeaza", () => {
  for (const f of functiiAuxiliare()) {
    const tr = trepteAuxiliare(f.nr);
    assert.ok(tr.length >= 1, `functia ${f.nr} n-are trepte`);
    const r = salariuAuxiliar(f.nr, tr[0].treapta, 10);
    assert.ok(r && r.salariuDeBaza > 0, `functia ${f.nr} nu calculeaza`);
  }
});

console.log(`\n${treceri} verificari, toate trecute.`);
