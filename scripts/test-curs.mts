// scripts/test-curs.mts
//
// Verifica fisierul de curs valutar. NU atinge reteaua: testele trebuie sa
// treaca si fara internet. Aducerea cursului e treaba lui
// `scripts/curs-valutar.mjs`; aici se verifica doar ce e pe disc.
//
// Ce apara testul asta: pagina in engleza afiseaza sume in euro, iar un curs
// vechi de luni de zile ar produce cifre gresite fara ca nimeni sa observe.
// Cursul e singurul numar de pe site care se schimba zilnic si care nu vine
// dintr-un act normativ — deci singurul care poate imbatrani in tacere.

import assert from "node:assert/strict";

const modulPath = "../src/lib/curs.ts";
const C = (await import(modulPath)) as typeof import("../src/lib/curs");

let n = 0;
const ok = (mesaj: string, f: () => void) => {
  f();
  n++;
  console.log(`  ok  ${mesaj}`);
};

console.log("\nCursul de referință EUR/RON");

ok("cursul există și e un număr plauzibil", () => {
  assert.ok(Number.isFinite(C.EUR_RON), "cursul nu e număr");
  // Leul s-a mișcat între 4,4 și 5,6 în ultimul deceniu. În afara plajei
  // înseamnă că s-a schimbat formatul sursei, nu că a explodat moneda.
  assert.ok(C.EUR_RON > 4 && C.EUR_RON < 7, `curs implauzibil: ${C.EUR_RON}`);
});

ok("data cursului e validă și nu e din viitor", () => {
  assert.match(C.CURS_DATA, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Date.parse(C.CURS_DATA) <= Date.now() + 86400000, "curs datat în viitor");
});

ok("cursul nu e mai vechi de 90 de zile", () => {
  const zile = C.vechimeCursZile();
  assert.ok(
    zile <= 90,
    `cursul are ${zile} zile. Rulează \`npm run curs\` — pagina în engleză afișează sume convertite cu el.`,
  );
});

ok("sursa e numită, cu link", () => {
  assert.ok(C.CURS_SURSA.nume.length > 3);
  assert.match(C.CURS_SURSA.url, /^https:\/\//);
});

console.log("\nConversia");

ok("lei → euro → lei se închide aproximativ", () => {
  for (const lei of [1000, 4325, 5000, 12345]) {
    const dus = C.inEuro(lei);
    const intors = C.inLei(dus);
    // Rotunjirea la unitate întreagă în ambele sensuri poate pierde până la
    // jumătate de euro, adică vreo 3 lei. Peste atât ar fi o eroare de formulă.
    assert.ok(Math.abs(intors - lei) <= Math.ceil(C.EUR_RON), `${lei} → ${dus} → ${intors}`);
  }
});

ok("conversia în RON nu schimbă suma", () => {
  assert.equal(C.converteste(4325, "RON"), 4325);
});

ok("euro e mai puțin decât leul, la orice sumă", () => {
  for (const lei of [100, 5000, 100000]) {
    assert.ok(C.converteste(lei, "EUR") < lei, `${lei} lei ar trebui să fie mai puțini euro`);
  }
});

console.log(`\n${n} verificari trecute.\n`);
