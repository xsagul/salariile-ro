// scripts/test-somaj.mts
//
// Verifica indemnizatia de somaj asa cum ajunge pe
// /calculator-indemnizatie-somaj.
//
// Cifrele asteptate sunt calculate de mana din Legea 76/2002, nu preluate din
// modul. Cea mai scumpa greseala posibila aici e formula veche: pana la 3
// octombrie 2022 partea fixa era 75% din indicatorul social de referinta, iar
// Legea 273/2022 a inlocuit procentul cu valoarea INTEGRALA. Doua site-uri de
// pe prima pagina Google folosesc si azi 75%. Daca modulul nostru ajunge
// vreodata sa dea 495 in loc de 660 pe partea fixa, testul cade.

import assert from "node:assert/strict";

const modulPath = "../src/lib/somaj.ts";
const M = (await import(modulPath)) as typeof import("../src/lib/somaj");

let n = 0;
const ok = (mesaj: string, f: () => void) => {
  f();
  n++;
  console.log(`  ok  ${mesaj}`);
};

console.log("\nIndicatorul social de referinta");

ok("ISR 2026 este 660 lei, valoarea integrala", () => {
  assert.equal(M.ISR, 660);
  assert.equal(M.ISR_AN, 2026);
});

ok("partea fixa NU e 75% din ISR — formula dinainte de octombrie 2022", () => {
  const r = M.calculeazaSomaj({ aniStagiu: 2, mediaBruta: 5000 });
  assert.ok(r);
  assert.equal(r.parteFixa, 660);
  assert.notEqual(r.parteFixa, 495, "s-a intors la formula veche, cu 75% din ISR");
});

console.log("\nDurata (art. 39 alin. (1))");

ok("sub un an de stagiu nu se deschide dreptul", () => {
  assert.equal(M.durataLuni(0.5), null);
  assert.equal(M.calculeazaSomaj({ aniStagiu: 0.5, mediaBruta: 5000 }), null);
});

ok("pragurile de durata: 6, 9 si 12 luni", () => {
  assert.equal(M.durataLuni(1), 6);
  assert.equal(M.durataLuni(4), 6);
  assert.equal(M.durataLuni(5), 9);
  assert.equal(M.durataLuni(9), 9);
  assert.equal(M.durataLuni(11), 12);
  assert.equal(M.durataLuni(30), 12);
});

ok("la EXACT 10 ani durata ramane 9 luni, dar cota e deja 7%", () => {
  // Legea cere „mai mare de 10 ani" pentru 12 luni (art. 39 alin. (1) lit. c),
  // dar „cel putin 10 ani" pentru cota de 7% (art. 39 alin. (3) lit. c).
  // Pragurile sunt diferite, si asta nu e o scapare de redactare.
  assert.equal(M.durataLuni(10), 9);
  assert.equal(M.cotaVariabila(10), 0.07);
});

console.log("\nCotele variabile (art. 39 alin. (3))");

ok("sub 3 ani de stagiu nu exista cota", () => {
  assert.equal(M.cotaVariabila(0), 0);
  assert.equal(M.cotaVariabila(2.9), 0);
});

ok("cotele urca la 3, 5, 10 si 20 de ani", () => {
  assert.equal(M.cotaVariabila(3), 0.03);
  assert.equal(M.cotaVariabila(4.9), 0.03);
  assert.equal(M.cotaVariabila(5), 0.05);
  assert.equal(M.cotaVariabila(9.9), 0.05);
  assert.equal(M.cotaVariabila(10), 0.07);
  assert.equal(M.cotaVariabila(19.9), 0.07);
  assert.equal(M.cotaVariabila(20), 0.10);
});

console.log("\nCuantumul");

ok("2 ani si 5.000 brut: doar partea fixa, 660 lei", () => {
  const r = M.calculeazaSomaj({ aniStagiu: 2, mediaBruta: 5000 });
  assert.ok(r);
  assert.equal(r.parteVariabila, 0);
  assert.equal(r.brut, 660);
  assert.equal(r.luni, 6);
});

ok("7 ani si 5.000 brut: 660 + 5% = 910 lei", () => {
  const r = M.calculeazaSomaj({ aniStagiu: 7, mediaBruta: 5000 });
  assert.ok(r);
  assert.equal(r.parteVariabila, 250);
  assert.equal(r.brut, 910);
  assert.equal(r.luni, 9);
});

ok("25 de ani si 8.000 brut: 660 + 10% = 1.460 lei pe 12 luni", () => {
  const r = M.calculeazaSomaj({ aniStagiu: 25, mediaBruta: 8000 });
  assert.ok(r);
  assert.equal(r.parteVariabila, 800);
  assert.equal(r.brut, 1460);
  assert.equal(r.luni, 12);
});

console.log("\nAbsolventii (art. 40 alin. (1))");

ok("absolventul primeste 50% din ISR, adica 330 lei, pe 6 luni", () => {
  const r = M.calculeazaSomaj({ aniStagiu: 0, mediaBruta: 0, absolvent: true });
  assert.ok(r);
  assert.equal(r.brut, 330);
  assert.equal(r.luni, 6);
  assert.equal(r.absolvent, true);
});

ok("absolventului nu i se aplica nicio cota, oricat salariu ar declara", () => {
  const a = M.calculeazaSomaj({ aniStagiu: 0, mediaBruta: 0, absolvent: true });
  const b = M.calculeazaSomaj({ aniStagiu: 25, mediaBruta: 99999, absolvent: true });
  assert.ok(a && b);
  assert.equal(a.brut, b.brut, "salariul nu are ce cauta in formula absolventului");
});

console.log("\nRetinerile");

ok("se retine CASS 10%, si nimic altceva", () => {
  const r = M.calculeazaSomaj({ aniStagiu: 7, mediaBruta: 5000 });
  assert.ok(r);
  assert.equal(r.cass, Math.round(r.brut * 0.10));
  assert.equal(r.net, r.brut - r.cass);
  // Daca s-ar retine si CAS 25%, netul ar cadea sub 65% din brut.
  assert.ok(r.net / r.brut > 0.85, "pare ca se retine si CAS — ANOFM il plateste, art. 136 lit. d)");
});

ok("totalul pe perioada e netul lunar inmultit cu lunile", () => {
  const r = M.calculeazaSomaj({ aniStagiu: 25, mediaBruta: 8000 });
  assert.ok(r);
  assert.equal(r.totalNet, r.net * r.luni);
});

console.log("\nIntrari gresite");

ok("stagiu negativ sau nenumeric intoarce null", () => {
  for (const v of [-1, NaN]) {
    assert.equal(M.calculeazaSomaj({ aniStagiu: v, mediaBruta: 5000 }), null, String(v));
  }
});

ok("media negativa intoarce null", () => {
  assert.equal(M.calculeazaSomaj({ aniStagiu: 7, mediaBruta: -100 }), null);
});

ok("media zero da doar partea fixa, nu o eroare", () => {
  const r = M.calculeazaSomaj({ aniStagiu: 7, mediaBruta: 0 });
  assert.ok(r);
  assert.equal(r.brut, M.ISR);
});

console.log(`\n${n} verificari trecute.\n`);
