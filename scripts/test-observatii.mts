// scripts/test-observatii.mts
// Verifica modelul de observatii salariale pe ocupatie.
//
// Ruleaza cu `tsx`, nu cu `node`: modulul importa `@/lib/meserii`, iar aliasul
// „@/" il rezolva doar tsx prin tsconfig. Celelalte teste citesc catalogul ca
// text tocmai ca sa evite asta; aici avem nevoie de logica, nu de date.

import assert from "node:assert/strict";
import {
  agregheaza,
  agregheazaTot,
  etichetaSursa,
  incadreaza,
  PRAG_PUBLICARE,
  type ObservatieSalariala,
} from "../src/lib/observatii-salariale";

let treceri = 0;
function verifica(nume: string, fn: () => void) {
  fn();
  treceri += 1;
  console.log("  ok  " + nume);
}

// ─── Incadrarea titlurilor ───────────────────────────────────────────────────
console.log("Incadrare titlu → meserie");

verifica("codul COR exact bate textul", () => {
  const m = incadreaza("Inginer ofertare", "251201");
  assert.equal(m?.slug, "programator", "COR 251201 e programator, oricare ar fi titlul");
});

verifica("COR necunoscut cade pe grupa de baza", () => {
  const m = incadreaza("Dezvoltator software", "251299");
  assert.equal(m?.slug, "programator", "2512xx trebuie sa cada tot pe grupa 2512");
});

verifica("potrivire pe nume complet", () => {
  assert.equal(incadreaza("Tester QA")?.slug, "tester-qa");
  assert.equal(incadreaza("Cautam Tester QA senior, Cluj")?.slug, "tester-qa");
});

verifica("cuvintele de grad nu impiedica potrivirea", () => {
  assert.equal(incadreaza("Programator junior")?.slug, "programator");
  assert.equal(incadreaza("Senior Programator")?.slug, "programator");
});

verifica("numele mai specific castiga", () => {
  const m = incadreaza("Asistent medical");
  assert.equal(m?.slug, "asistent-medical", "nu trebuie sa cada pe „Medic”");
});

verifica("potrivirea partiala NU incadreaza", () => {
  // „Medic rezident" nu e in catalog. Prefera null in loc de „Medic": o cifra
  // pusa pe meseria gresita e mai rea decat o observatie neincadrata.
  assert.equal(incadreaza("Registrator medical"), null);
  assert.equal(incadreaza("Operator drona"), null);
});

verifica("titlu gol nu produce incadrare", () => {
  assert.equal(incadreaza(""), null);
  assert.equal(incadreaza("senior junior lead"), null);
});

// ─── Agregarea ───────────────────────────────────────────────────────────────
console.log("\nAgregare");

const obs = (n: number, min: number, max: number, extra: Partial<ObservatieSalariala> = {}) =>
  Array.from({ length: n }, (_, i): ObservatieSalariala => ({
    meserie: "zugrav",
    titluSursa: "Zugrav",
    fel: "anunt",
    suma: "net",
    minim: min + i,
    maxim: max + i,
    data: "2026-08-27",
    referinta: "test-" + i,
    ...extra,
  }));

verifica("sub prag nu se publica nimic", () => {
  const rez = agregheaza(obs(PRAG_PUBLICARE - 1, 4000, 6000), {
    meserie: "zugrav",
    suma: "net",
  });
  assert.equal(rez, null);
});

verifica("la prag se publica", () => {
  const rez = agregheaza(obs(PRAG_PUBLICARE, 4000, 6000), { meserie: "zugrav", suma: "net" });
  assert.ok(rez, "trebuie sa treaca exact la prag");
  assert.equal(rez.observatii, PRAG_PUBLICARE);
  assert.ok(rez.p25 <= rez.median && rez.median <= rez.p75, "percentilele trebuie ordonate");
});

verifica("nu amesteca brut cu net", () => {
  const amestec = [
    ...obs(10, 4000, 6000, { suma: "net" }),
    ...obs(10, 8000, 12000, { suma: "brut" }),
  ];
  const net = agregheaza(amestec, { meserie: "zugrav", suma: "net" })!;
  assert.equal(net.observatii, 10, "netul nu trebuie sa inghita bruturile");
  assert.ok(net.median < 7000, "mediana neta nu poate fi trasa de brut");
});

verifica("nu amesteca judete", () => {
  const amestec = [
    ...obs(8, 4000, 5000, { judet: "Cluj" }),
    ...obs(8, 6000, 7000, { judet: "Bucuresti" }),
  ];
  const cluj = agregheaza(amestec, { meserie: "zugrav", suma: "net", judet: "Cluj" })!;
  assert.equal(cluj.observatii, 8);
  assert.ok(cluj.median < 6000, "Clujul nu trebuie sa contina observatii din Bucuresti");
});

verifica("respinge intervale imposibile", () => {
  const stricate = obs(10, 4000, 6000).map((o, i) =>
    i < 6 ? { ...o, minim: 9000, maxim: 1000 } : o,
  );
  const rez = agregheaza(stricate, { meserie: "zugrav", suma: "net" });
  assert.equal(rez, null, "raman 4 observatii valide, sub prag");
});

verifica("agregheazaTot da si national, si pe judet", () => {
  const toate = [
    ...obs(6, 4000, 5000, { judet: "Cluj" }),
    ...obs(6, 6000, 7000, { judet: "Bucuresti" }),
  ];
  const rez = agregheazaTot(toate);
  const national = rez.find((r) => r.judet === null);
  assert.ok(national, "trebuie sa existe agregatul national");
  assert.equal(national.observatii, 12);
  assert.equal(rez.filter((r) => r.judet !== null).length, 2, "cate un agregat pe judet");
});

verifica("fiecare agregat isi declara sursele si datele", () => {
  const rez = agregheaza(obs(6, 4000, 6000), { meserie: "zugrav", suma: "net" })!;
  assert.deepEqual(rez.surse, ["anunt"]);
  assert.equal(rez.dataPrimei, "2026-08-27");
  assert.equal(rez.dataUltimei, "2026-08-27");
});

verifica("fiecare fel de sursa are eticheta publica", () => {
  for (const fel of ["lege-153", "anunt", "declarat"] as const) {
    assert.ok(etichetaSursa(fel).length > 10, "eticheta pentru " + fel);
  }
});

console.log("\n" + treceri + " verificari, toate trecute.");
