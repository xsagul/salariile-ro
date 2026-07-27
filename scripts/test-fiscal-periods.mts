// Regresie pentru grilele salariale distincte din 2026.
import assert from "node:assert/strict";
const fiscalModulePath = "../src/lib/fiscal.ts";
const {
  calculStandard,
  calculStandardCuRegim,
  brutDinNetStandardCuRegim,
  REGIMURI_FISCALE_SALARIU,
} = await import(fiscalModulePath);

assert.deepEqual(
  {
    from: REGIMURI_FISCALE_SALARIU["2026-S1"].validFrom,
    to: REGIMURI_FISCALE_SALARIU["2026-S1"].validTo,
  },
  { from: "2026-01-01", to: "2026-06-30" },
  "Regimul istoric trebuie delimitat explicit de regimul curent",
);

const minimS1 = calculStandardCuRegim(4050, "2026-S1");
assert.ok(minimS1, "Calculul pentru minimul S1 trebuie să producă rezultat");
assert.deepEqual(
  {
    net: minimS1.net,
    cas: minimS1.cas,
    cass: minimS1.cass,
    impozit: minimS1.impozit,
    cam: minimS1.cam,
    facilitate: minimS1.facilitate,
    deducerePersonala: minimS1.deducerePersonala,
  },
  {
    net: 2574,
    cas: 938,
    cass: 375,
    impozit: 163,
    cam: 84,
    facilitate: 300,
    deducerePersonala: 810,
  },
  "4.050 lei trebuie calculat cu grila aplicabilă în ianuarie–iunie 2026",
);

assert.equal(
  brutDinNetStandardCuRegim(2574, "2026-S1"),
  4050,
  "Calculul invers S1 trebuie să recupereze exact salariul minim brut",
);

const minimS2 = calculStandard(4325);
assert.ok(minimS2, "Calculul pentru minimul curent trebuie să producă rezultat");
assert.equal(minimS2.net, 2699, "API-ul curent trebuie să rămână pe grila S2");
assert.equal(minimS2.facilitate, 200, "Facilitatea curentă trebuie să rămână 200 lei");

const constructiiS1 = calculStandardCuRegim(4582, "2026-S1");
const constructiiS2 = calculStandardCuRegim(4582, "2026-S2");
assert.ok(constructiiS1 && constructiiS2, "Calculul minimului din construcții trebuie să producă rezultate");
assert.deepEqual(
  {
    netS1: constructiiS1.net,
    netS2: constructiiS2.net,
    cas: constructiiS2.cas,
    cass: constructiiS2.cass,
    impozitS1: constructiiS1.impozit,
    impozitS2: constructiiS2.impozit,
    deducereS1: constructiiS1.deducerePersonala,
    deducereS2: constructiiS2.deducerePersonala,
    facilitateS1: constructiiS1.facilitate,
    facilitateS2: constructiiS2.facilitate,
  },
  {
    netS1: 2739,
    netS2: 2754,
    cas: 1146,
    cass: 458,
    impozitS1: 239,
    impozitS2: 224,
    deducereS1: 587,
    deducereS2: 735,
    facilitateS1: 0,
    facilitateS2: 0,
  },
  "4.582 lei trebuie calculat fără facilitate generală, cu deducerea fiecărui semestru",
);

console.log("OK: regresii fiscale S1/S2 2026");
