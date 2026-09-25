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

// ── 2024–2025: perioadele alese din calculator ──────────────────────────────
// Netul la salariul minim, cifrele publicate la vremea lor: 2.079 (ian. 2024),
// 2.363 (iul. 2024), 2.574 (2025). Cu 200 lei în loc de 300 în 2025, netul ar
// ieși 2.544 — testul prinde exact greșeala pe care o făcea memoria.
const minim = (brut: number, regim: string) => {
  const r = calculStandardCuRegim(brut, regim);
  assert.ok(r, `Calculul pentru ${brut} lei în ${regim} trebuie să producă rezultat`);
  return { net: r.net, facilitate: r.facilitate, cam: r.cam, deducere: r.deducerePersonala };
};
assert.deepEqual(minim(3300, "2024-S1"), { net: 2079, facilitate: 200, cam: 70, deducere: 660 }, "Minimul din ianuarie–iunie 2024");
assert.deepEqual(minim(3700, "2024-S2"), { net: 2363, facilitate: 300, cam: 77, deducere: 740 }, "Minimul din iulie–decembrie 2024");
assert.deepEqual(minim(4050, "2025"), { net: 2574, facilitate: 300, cam: 84, deducere: 810 }, "Minimul din 2025");

// Plafonul: 4.000 lei în 2024, 4.300 în 2025. Peste el, fără facilitate.
const { calculeazaCuRegim, regimPentruLuna } = await import(fiscalModulePath);
const intrare = (brut: number, tichete = 0) => ({
  brut: String(brut), tichete: tichete ? String(tichete) : "", functieDeBAza: true,
  persoanePretretinere: 0, varstaSub26: false, copiiScolarizati: 0, scutitImpozit: false,
  salariuDeBaza: String(brut === 3300 || brut === 3700 ? brut : 4050),
});
// În ianuarie–iunie 2024 tichetele intrau în plafon: 3.300 + 800 lei tichete > 4.000.
assert.equal(calculeazaCuRegim(intrare(3300, 800), "2024-S1").facilitate, 0, "Ian.–iun. 2024: tichetele intră în plafonul de 4.000 lei");
assert.equal(calculeazaCuRegim(intrare(3300, 600), "2024-S1").facilitate, 200, "Ian.–iun. 2024: 3.900 lei cu tichete rămân sub plafon");
// Din iulie 2024 nu mai intră (OUG 87/2024 art. V).
assert.equal(calculeazaCuRegim(intrare(3700, 800), "2024-S2").facilitate, 300, "Din iulie 2024 tichetele nu mai intră în plafon");

// Deducerea personală se stabilește pe venitul brut din salarii CU tichetele de masă
// (art. 77 alin. 3-4; tichetele sunt venit din salarii și nu sunt excluse ca la plafonul
// sumei netaxabile). Exemplul publicat de infotva.manager.ro (12 februarie 2025):
// 4.050 lei + 500 lei tichete → CAS 938, CASS 425, deducere 608, impozit 228.
const cuTichete = (brut: number, tichete: number, regim: string, extra = {}) => {
  const r = calculeazaCuRegim({ ...intrare(brut, tichete), salariuDeBaza: String(brut), ...extra }, regim);
  return { cas: r.cas, cass: r.cass, deducere: r.deducerePersonala, impozit: r.impozit };
};
assert.deepEqual(cuTichete(4050, 500, "2025"), { cas: 938, cass: 425, deducere: 608, impozit: 228 }, "2025: deducerea pe 4.550 lei (brut + tichete), nu pe 4.050");
assert.equal(cuTichete(4325, 945, "2026-S2").deducere, 454, "4.325 + 945 lei tichete: 4.325 + 945 = 5.270 → 19 tranșe → 10,5% × 4.325");
assert.equal(cuTichete(3300, 600, "2024-S1").deducere, 462, "Ian.–iun. 2024: 3.900 lei → 12 tranșe → 14% × 3.300");
// Sub 26 de ani: același venit brut decide pragul de minim + 2.000 lei.
assert.equal(cuTichete(5000, 800, "2026-S2", { varstaSub26: true }).deducere, 865, "5.800 lei ≤ 6.325: 5% × 4.325 + 15% × 4.325");
assert.equal(cuTichete(6000, 400, "2026-S2", { varstaSub26: true }).deducere, 0, "6.400 lei > 6.325: fără deducere de bază și fără cea pentru sub 26 de ani");

// Calculul invers dă netul cerut, nu cu 1 leu mai puțin: rotunjirea mijlocului intervalului
// cădea sub țintă în 12.310 din 51.030 de cazuri (26 septembrie 2026).
const { calculeazaBrutDinNetCuRegim } = await import(fiscalModulePath);
const standard = { tichete: "", functieDeBAza: true, persoanePretretinere: 0, varstaSub26: false, copiiScolarizati: 0, scutitImpozit: false };
for (const regim of ["2024-S1", "2024-S2", "2025", "2026-S1", "2026-S2"]) {
  for (const tichete of ["", "945"]) {
    for (let net = 100; net <= 9000; net += 13) {
      const intrareNet = { ...standard, tichete };
      const brut = calculeazaBrutDinNetCuRegim(net, intrareNet, regim);
      const rez = calculeazaCuRegim({ ...intrareNet, brut: String(brut) }, regim);
      assert.ok(rez.netBani >= net, `${regim}, net ${net}, tichete ${tichete || 0}: brutul ${brut} dă netul ${rez.netBani}`);
    }
  }
}
assert.equal(brutDinNetStandardCuRegim(2500, "2026-S2"), 4127, "Netul 2.500: brutul 4.125 dădea 2.499; 4.126 tot 2.499, abia 4.127 dă 2.500");

// Luna aleasă în calculator → perioada fiscală.
assert.deepEqual(
  [[2024, 1], [2024, 6], [2024, 7], [2024, 12], [2025, 1], [2025, 12], [2026, 1], [2026, 6], [2026, 7], [2026, 12], [2023, 12], [2027, 1]]
    .map(([an, luna]) => regimPentruLuna(an, luna)),
  ["2024-S1", "2024-S1", "2024-S2", "2024-S2", "2025", "2025", "2026-S1", "2026-S1", "2026-S2", "2026-S2", null, null],
  "Fiecare lună 2024–2026 are exact o perioadă fiscală; în afara lor, niciuna",
);

console.log("OK: regresii fiscale 2024, 2025 și S1/S2 2026");
