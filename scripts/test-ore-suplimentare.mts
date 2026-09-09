// scripts/test-ore-suplimentare.mts
//
// Verifica sporurile din Codul Muncii asa cum ajung pe
// /calculator-ore-suplimentare.
//
// Cifrele asteptate sunt calculate de mana din cotele legale, nu preluate din
// modul. Cea mai scumpa greseala posibila aici e confuzia dintre ora
// suplimentara si ora de noapte: prima NU e in salariul lunar si se plateste
// integral plus spor (1,75 x tarif), a doua E in salariul lunar si primeste
// numai sporul (0,25 x tarif). Un modul care le trateaza la fel supraestimeaza
// castigul cu zeci de procente, si exact asta fac calculatoarele de pe piata.

import assert from "node:assert/strict";

const modulPath = "../src/lib/ore-suplimentare.ts";
const M = (await import(modulPath)) as typeof import("../src/lib/ore-suplimentare");

let n = 0;
const ok = (mesaj: string, f: () => void) => {
  f();
  n++;
  console.log(`  ok  ${mesaj}`);
};

console.log("\nOrele lunii");

ok("norma e 8 ore pe zi (art. 112)", () => {
  assert.equal(M.ORE_PE_ZI, 8);
});

ok("februarie 2026 are 160 de ore, septembrie 176", () => {
  // Februarie 2026: 20 de zile lucratoare. Septembrie 2026: 22.
  assert.equal(M.oreNormaleLuna(2026, 1), 160);
  assert.equal(M.oreNormaleLuna(2026, 8), 176);
});

ok("orele lunare variaza intre 144 si 184 in 2026", () => {
  const toate = Array.from({ length: 12 }, (_, i) => M.oreNormaleLuna(2026, i));
  // Ianuarie are 144 de ore: 18 zile lucratoare, pentru ca patru sarbatori
  // legale cad in zile de lucru (1 si 2 ianuarie, Boboteaza, Sfantul Ion).
  // Iulie are 184, adica 23 de zile. Diferenta dintre ele e de 28%, si exact
  // ea face ca o medie fixa de 168 de ore sa fie gresita in zece luni din
  // douasprezece.
  assert.equal(Math.min(...toate), 144, JSON.stringify(toate));
  assert.equal(Math.max(...toate), 184, JSON.stringify(toate));
  assert.ok(toate.every((o) => o % M.ORE_PE_ZI === 0), "orele nu sunt multipli de 8");
  assert.ok(new Set(toate).size >= 4, "prea putina variatie ca pagina sa aiba rost");
});

console.log("\nOra suplimentara — se plateste integral PLUS spor");

ok("10 ore la 5.000 lei in septembrie dau 497 lei", () => {
  // tarif = 5000 / 176 = 28,4090…
  // 10 x 28,4090 x 1,75 = 497,15 → 497
  const r = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreSuplimentare: 10 });
  assert.ok(r);
  assert.equal(r.oreNormale, 176);
  assert.equal(r.linii.length, 1);
  assert.equal(r.linii[0].suma, 497);
});

ok("cota nu poate cobori sub minimul legal de 75%", () => {
  const subPrag = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreSuplimentare: 10, cotaSuplimentare: 0.1 });
  const laPrag = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreSuplimentare: 10 });
  assert.ok(subPrag && laPrag);
  assert.equal(subPrag.linii[0].suma, laPrag.linii[0].suma);
});

ok("o cota mai mare din contract se aplica", () => {
  const r = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreSuplimentare: 10, cotaSuplimentare: 1 });
  assert.ok(r);
  // 10 x 28,4090 x 2 = 568,18 → 568
  assert.equal(r.linii[0].suma, 568);
});

console.log("\nOra de noapte — se adauga NUMAI sporul");

ok("40 de ore de noapte la 5.000 lei dau 284 lei, nu 1.420", () => {
  // 40 x 28,4090 x 0,25 = 284,09 → 284
  // Daca s-ar trata ca ora suplimentara: 40 x 28,4090 x 1,25 = 1.420 — gresit.
  const r = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreNoapte: 40 });
  assert.ok(r);
  assert.equal(r.linii[0].suma, 284);
  assert.notEqual(r.linii[0].suma, 1420);
});

ok("aceleasi ore, ca suplimentare, valoreaza de 7 ori mai mult", () => {
  const noapte = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreNoapte: 40 });
  const supl = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreSuplimentare: 40 });
  assert.ok(noapte && supl);
  assert.ok(supl.totalSporuri > noapte.totalSporuri * 6, "regulile nu se disting");
});

ok("sub 3 ore de noapte se ridica avertismentul (art. 125)", () => {
  const sub = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreNoapte: 2 });
  const peste = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreNoapte: 3 });
  assert.ok(sub && peste);
  assert.equal(sub.avertismentNoapte, true);
  assert.equal(peste.avertismentNoapte, false);
});

console.log("\nSarbatorile legale (art. 142)");

ok("8 ore de sarbatoare dau sporul de 100%, adica 227 lei", () => {
  // 8 x 28,4090 x 1,00 = 227,27 → 227
  const r = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreSarbatoare: 8 });
  assert.ok(r);
  assert.equal(r.linii[0].suma, 227);
});

console.log("\nTariful orar depinde de luna");

ok("aceleasi ore valoreaza mai mult intr-o luna scurta", () => {
  const feb = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 1, oreSuplimentare: 10 });
  const sep = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreSuplimentare: 10 });
  assert.ok(feb && sep);
  assert.ok(feb.tarifOrar > sep.tarifOrar, "februarie ar trebui sa aiba tarif mai mare");
  assert.ok(feb.linii[0].suma > sep.linii[0].suma);
});

console.log("\nNetul");

ok("brutul creste cu exact suma sporurilor", () => {
  const r = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreSuplimentare: 10, oreNoapte: 40, oreSarbatoare: 8 });
  assert.ok(r);
  assert.equal(r.brutTotal, 5000 + r.totalSporuri);
  assert.equal(r.totalSporuri, r.linii.reduce((s, l) => s + l.suma, 0));
});

ok("netul creste, dar mai putin decat brutul — contributiile se aplica si pe sporuri", () => {
  const r = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreSuplimentare: 10, oreNoapte: 40, oreSarbatoare: 8 });
  assert.ok(r && r.netFaraSporuri !== null);
  const castigNet = r.fiscal.netBani - r.netFaraSporuri;
  assert.ok(castigNet > 0, "sporurile nu ajung in net");
  assert.ok(castigNet < r.totalSporuri, "sporurile ar trebui impozitate");
  // Raportul net/brut pe sporuri sta in jur de 58%, ca la orice venit salarial.
  assert.ok(castigNet / r.totalSporuri > 0.5 && castigNet / r.totalSporuri < 0.65);
});

ok("fara ore, netul e cel al salariului de baza", () => {
  const r = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8 });
  assert.ok(r);
  assert.equal(r.linii.length, 0);
  assert.equal(r.totalSporuri, 0);
  assert.equal(r.brutTotal, 5000);
  assert.equal(r.fiscal.netBani, r.netFaraSporuri);
});

console.log("\nIntrari gresite");

ok("salariu zero, negativ sau nenumeric intoarce null", () => {
  for (const v of [0, -100, NaN]) {
    assert.equal(M.calculeazaOre({ salariuDeBaza: v, an: 2026, luna0: 8, oreSuplimentare: 5 }), null, String(v));
  }
});

ok("luna in afara intervalului intoarce null", () => {
  assert.equal(M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 12 }), null);
  assert.equal(M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: -1 }), null);
});

ok("orele negative nu scad brutul", () => {
  const r = M.calculeazaOre({ salariuDeBaza: 5000, an: 2026, luna0: 8, oreSuplimentare: -10 });
  assert.ok(r);
  assert.equal(r.brutTotal, 5000);
});

console.log(`\n${n} verificari trecute.\n`);
