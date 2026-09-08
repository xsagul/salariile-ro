// scripts/test-sanatate.mts
//
// Verifica salarizarea din Anexa nr. II a Legii 153/2017 asa cum ajunge pe
// /calculator-salariu-sanatate.
//
// Cifrele asteptate sunt calculate de mana din textul legii, nu preluate din
// modul — altfel testul ar confirma doar ca modulul e de acord cu el insusi.
//
// Cea mai scumpa greseala posibila aici e alta decat la invatamant: plafonul
// indemnizatiei de hrana MUSCA in sanatate. Un medic primar trece de 6.000 lei
// net si nu primeste cei 347 de lei, pe cand un infirmier ii primeste. Daca
// vreodata amandoi primesc, sau niciunul, testul cade.

import assert from "node:assert/strict";

const modulPath = "../src/lib/sanatate.ts";
const {
  calculeazaSanatate,
  meserieSanatate,
  MESERII_SANATATE,
  TOTAL_TREPTE,
  ANEXA,
} = (await import(modulPath)) as typeof import("../src/lib/sanatate");

const legePath = "../src/lib/lege153.ts";
const { aplicaGradatia, gradatiaDupaVechime, INDEMNIZATIE_HRANA, PLAFON_HRANA_NET, INDEMNIZATIE_DOCTORAT_2026 } =
  (await import(legePath)) as typeof import("../src/lib/lege153");

let n = 0;
const ok = (mesaj: string, f: () => void) => {
  f();
  n++;
  console.log(`  ok  ${mesaj}`);
};

console.log("\nAcoperirea grilei");

ok("anexa e a doua, cea sanitara", () => {
  assert.equal(ANEXA, "Anexa nr. II");
});

ok("acopera cel putin 10 meserii, toate cu trepte", () => {
  assert.ok(MESERII_SANATATE.length >= 10, `doar ${MESERII_SANATATE.length} meserii`);
  for (const m of MESERII_SANATATE) assert.ok(m.trepte.length >= 2, `${m.slug} are ${m.trepte.length} trepte`);
});

ok("asistentul medical si medicul sunt acoperiti — cele mai cautate", () => {
  for (const slug of ["asistent-medical", "medic", "medic-rezident", "farmacist", "infirmier"]) {
    assert.ok(meserieSanatate(slug), `lipseste ${slug}`);
  }
});

ok("totalul de trepte e suma treptelor pe meserii", () => {
  assert.equal(TOTAL_TREPTE, MESERII_SANATATE.reduce((s, m) => s + m.trepte.length, 0));
});

ok("nicio treapta nu are brut sub salariul minim pe economie", () => {
  // 4.325 lei din 1 iulie 2026. O grila sub minim s-ar publica gresit ca
  // salariu efectiv: in practica omul e adus la minim.
  for (const m of MESERII_SANATATE) {
    for (const t of m.trepte) {
      assert.ok(t.brut >= 4325, `${m.slug} · ${t.eticheta} = ${t.brut} lei, sub minim`);
    }
  }
});

console.log("\nGradatia de vechime (art. 10 alin. (4))");

ok("gradatia 5 adauga 24,52%, nu 22,5%", () => {
  // 1000 → 1075 → 1129 → 1185 → 1215 → 1245
  const cu5 = aplicaGradatia(1000, 5);
  assert.ok(cu5 >= 1245 && cu5 <= 1246, `a iesit ${cu5}`);
  assert.notEqual(cu5, 1225, "s-au adunat cotele in loc sa se compuna");
});

ok("benzile de vechime dau gradatia corecta", () => {
  assert.equal(gradatiaDupaVechime(0), 0);
  assert.equal(gradatiaDupaVechime(2), 0);
  assert.equal(gradatiaDupaVechime(3), 1);
  assert.equal(gradatiaDupaVechime(9), 2);
  assert.equal(gradatiaDupaVechime(14), 3);
  assert.equal(gradatiaDupaVechime(19), 4);
  assert.equal(gradatiaDupaVechime(40), 5);
});

ok("medic primar: 14.125 din grila, 17.588 la gradatia 5", () => {
  // Calcul de mana, treapta cu treapta, cu rotunjire la leu dupa fiecare:
  //   14125 ×1,075 = 15184  ×1,05 = 15943  ×1,05 = 16740
  //   16740 ×1,025 = 17159  ×1,025 = 17588
  const r = calculeazaSanatate({ slug: "medic", treapta: "Medic primar", gradatie: 5 });
  assert.ok(r, "nu s-a calculat");
  assert.equal(r.salariuGrila, 14125);
  assert.equal(r.salariuDeBaza, 17588);
});

ok("gradatia 0 lasa salariul din grila neatins", () => {
  const r = calculeazaSanatate({ slug: "medic", treapta: "Medic primar", gradatie: 0 });
  assert.ok(r);
  assert.equal(r.salariuDeBaza, r.salariuGrila);
});

console.log("\nIndemnizatia de hrana (art. 18) — plafonul musca");

ok("medicul primar NU primeste indemnizatia: e peste plafon", () => {
  const r = calculeazaSanatate({ slug: "medic", treapta: "Medic primar", gradatie: 0 });
  assert.ok(r);
  assert.equal(r.hranaPesteplafon, true);
  assert.ok(
    !r.linii.some((l) => l.eticheta.includes("hrană")),
    "a primit indemnizatia desi e peste plafon",
  );
  assert.equal(r.brutTotal, r.salariuDeBaza);
});

ok("infirmiera PRIMESTE indemnizatia: e sub plafon", () => {
  const r = calculeazaSanatate({ slug: "infirmier", treapta: "Infirmier / infirmieră", gradatie: 3 });
  assert.ok(r);
  assert.equal(r.hranaPesteplafon, false);
  const linie = r.linii.find((l) => l.eticheta.includes("hrană"));
  assert.ok(linie, "nu a primit indemnizatia desi e sub plafon");
  assert.equal(linie.suma, INDEMNIZATIE_HRANA);
  assert.equal(r.brutTotal, r.salariuDeBaza + INDEMNIZATIE_HRANA);
});

ok("bifa de alte drepturi de hrana o scoate din calcul", () => {
  const fara = calculeazaSanatate({
    slug: "infirmier",
    treapta: "Infirmier / infirmieră",
    gradatie: 3,
    alteDrepturiHrana: true,
  });
  assert.ok(fara);
  assert.ok(!fara.linii.some((l) => l.eticheta.includes("hrană")));
  assert.equal(fara.brutTotal, fara.salariuDeBaza);
  // Si nu se raporteaza ca „peste plafon": motivul e bifa, nu suma.
  assert.equal(fara.hranaPesteplafon, false);
});

ok("plafonul se raporteaza la netul bazei, nu la brut", () => {
  // Daca s-ar compara brutul cu 6.000, un asistent medical principal cu
  // gradatia 4 (6.650 brut) ar pierde indemnizatia. Netul lui e ~3.900.
  const r = calculeazaSanatate({
    slug: "asistent-medical",
    treapta: "Principal (postliceal)",
    gradatie: 4,
  });
  assert.ok(r);
  assert.ok(r.salariuDeBaza > PLAFON_HRANA_NET, "premisa testului s-a schimbat");
  assert.ok(r.linii.some((l) => l.eticheta.includes("hrană")), "plafonul s-a aplicat pe brut");
});

console.log("\nDoctoratul (art. 14)");

ok("bifa de doctorat adauga exact suma fixa", () => {
  const fara = calculeazaSanatate({ slug: "medic", treapta: "Medic primar", gradatie: 0 });
  const cu = calculeazaSanatate({ slug: "medic", treapta: "Medic primar", gradatie: 0, doctorat: true });
  assert.ok(fara && cu);
  assert.equal(cu.brutTotal - fara.brutTotal, INDEMNIZATIE_DOCTORAT_2026);
});

console.log("\nNetul");

ok("orice treapta a oricarei meserii se calculeaza", () => {
  for (const m of MESERII_SANATATE) {
    for (const t of m.trepte) {
      for (const g of [0, 5] as const) {
        const r = calculeazaSanatate({ slug: m.slug, treapta: t.eticheta, gradatie: g });
        assert.ok(r, `${m.slug} · ${t.eticheta} · gradatia ${g} nu se calculeaza`);
        assert.ok(r.fiscal.netBani > 0);
      }
    }
  }
});

ok("netul e intre 55% si 65% din brut peste tot", () => {
  for (const m of MESERII_SANATATE) {
    for (const t of m.trepte) {
      const r = calculeazaSanatate({ slug: m.slug, treapta: t.eticheta, gradatie: 3 });
      assert.ok(r);
      const raport = r.fiscal.netBani / r.brutTotal;
      assert.ok(raport > 0.55 && raport < 0.65, `${m.slug} · ${t.eticheta}: ${(raport * 100).toFixed(1)}%`);
    }
  }
});

ok("treptele urca — o scara de cariera nu coboara", () => {
  for (const m of MESERII_SANATATE) {
    for (let i = 1; i < m.trepte.length; i++) {
      assert.ok(
        m.trepte[i].brut >= m.trepte[i - 1].brut,
        `${m.slug}: ${m.trepte[i].eticheta} sub ${m.trepte[i - 1].eticheta}`,
      );
    }
  }
});

console.log("\nIntrari gresite");

ok("meseria inexistenta intoarce null, nu arunca", () => {
  assert.equal(calculeazaSanatate({ slug: "programator", treapta: "orice", gradatie: 0 }), null);
  assert.equal(calculeazaSanatate({ slug: "toString", treapta: "orice", gradatie: 0 }), null);
});

ok("treapta care nu apartine meseriei intoarce null", () => {
  assert.equal(calculeazaSanatate({ slug: "infirmier", treapta: "Medic primar", gradatie: 0 }), null);
});

console.log(`\n${n} verificari trecute.\n`);
