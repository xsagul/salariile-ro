// scripts/test-pdf-text.mts
// Verifica extractorul de text din PDF folosit de pipeline-ul de salarizare
// publica (art. 33, Legea 153/2017).
//
// Fixture-ul se construieste aici, in cod, nu se descarca: un PDF minimal,
// necomprimat, cu doua randuri de „tabel" asezate la coordonate diferite.
// Testul apara exact comportamentul care conteaza — reconstruirea randului din
// fragmente separate — nu formatarea unui fisier anume de pe un site anume.

import assert from "node:assert/strict";
import zlib from "node:zlib";
import { benzi, calitateText, pagini, randuri } from "./lib/pdf-text.mjs";

/** Un PDF de o pagina, cu content stream-ul dat. */
function pdfCu(continut: string, comprimat: boolean): Buffer {
  const flux = comprimat ? zlib.deflateSync(Buffer.from(continut, "latin1")) : Buffer.from(continut, "latin1");
  const filtru = comprimat ? "/Filter/FlateDecode" : "";
  const antet = Buffer.from(
    `%PDF-1.7\n1 0 obj\n<</Type/Catalog>>\nendobj\n2 0 obj\n<<${filtru}/Length ${flux.length}>>\nstream\n`,
    "latin1",
  );
  const coada = Buffer.from("\nendstream\nendobj\ntrailer\n<</Root 1 0 R>>\n%%EOF\n", "latin1");
  return Buffer.concat([antet, flux, coada]);
}

// Doua celule pe acelasi rand (acelasi Y, X diferit) si un rand mai jos.
// Asa arata in realitate un tabel: fiecare celula e propriul ei Tj.
const CONTINUT = [
  "BT",
  "/F1 10 Tf",
  "1 0 0 1 72 700 Tm (SECRETAR) Tj",
  "1 0 0 1 300 700 Tm (15300) Tj",
  "1 0 0 1 72 680 Tm (DIRECTOR GENERAL) Tj",
  "1 0 0 1 300 680 Tm (15045) Tj",
  "ET",
].join("\n");

const asteptat = ["SECRETAR 15300", "DIRECTOR GENERAL 15045"];

for (const comprimat of [true, false]) {
  const eticheta = comprimat ? "FlateDecode" : "necomprimat";
  const extras = randuri(pdfCu(CONTINUT, comprimat));
  if (comprimat) {
    assert.deepEqual(extras, asteptat, `${eticheta}: randurile nu s-au reconstruit din fragmente`);
  } else {
    // Fara filtru nu dezarhivam nimic, deci nu extragem text. Verificam doar ca
    // nu aruncam si nu inventam continut.
    assert.deepEqual(extras, [], `${eticheta}: un stream fara FlateDecode nu trebuie sa produca text`);
  }
}

// Operatorul TJ, cu tablou de siruri si ajustari de kerning intre ele.
const CU_TJ = ["BT", "1 0 0 1 72 700 Tm [(SALA) -20 (RIUL)] TJ", "ET"].join("\n");
assert.deepEqual(randuri(pdfCu(CU_TJ, true)), ["SALARIUL"], "TJ: bucatile din tablou trebuie lipite");

// Td muta linia de baza relativ, nu absolut.
const CU_TD = ["BT", "72 700 Td (RAND UNU) Tj", "0 -20 Td (RAND DOI) Tj", "ET"].join("\n");
assert.deepEqual(randuri(pdfCu(CU_TD, true)), ["RAND UNU", "RAND DOI"], "Td: deplasarea relativa trebuie sa separe randurile");

// Escapari octale si paranteze in sirurile literale.
const CU_ESCAPE = ["BT", "1 0 0 1 72 700 Tm (A\\050B\\051 \\134 C) Tj", "ET"].join("\n");
assert.deepEqual(randuri(pdfCu(CU_ESCAPE, true)), ["A(B) \\ C"], "escaparile octale si backslash trebuie decodate");

// Un fisier care nu e PDF nu trebuie sa arunce.
assert.deepEqual(randuri(Buffer.from("nu sunt un pdf", "utf8")), [], "intrare invalida: fara exceptie, fara text");

// Coordonatele raman disponibile pentru parserele de tabele: denumirea unei
// functii sta in alta coloana decat cifrele, iar uneori pe alt rand.
const paginiTest = pagini(pdfCu(CONTINUT, true));
assert.equal(paginiTest.length, 1, "un singur content stream inseamna o singura pagina");
const benziTest = benzi(paginiTest[0]);
assert.equal(benziTest.length, 2, "doua benzi orizontale");
assert.deepEqual(
  benziTest[0].bucati.map((b) => b.x),
  [72, 300],
  "bucatile unei benzi pastreaza X-ul si vin de la stanga la dreapta",
);

// Poarta de calitate: un fisier fara strat de text nu trebuie sa treaca drept
// citit cu succes. E singurul lucru care opreste publicarea unei extrageri
// partiale ca si cum ar fi completa.
assert.equal(calitateText(Buffer.from("nu sunt un pdf", "utf8")).areText, false, "fisier fara text: areText false");
const calitate = calitateText(pdfCu(CONTINUT, true));
assert.equal(calitate.areText, true, "fisier cu text: areText true");
assert.equal(calitate.suspecte, 0, "text romanesc curat: zero fragmente suspecte");

console.log("OK: extractorul PDF reconstruieste randurile din fragmente (9 cazuri).");
