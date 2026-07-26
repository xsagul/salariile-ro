import assert from "node:assert/strict";

// Node 24 execută TypeScript direct. Calea este păstrată într-o variabilă pentru ca
// verificarea `tsc --noEmit` să rămână compatibilă fără allowImportingTsExtensions.
const pfaModulePath = "../src/lib/pfa.ts";
const {
  calculeazaPFA,
  PLAFON_CAS_12_2026,
  PLAFON_CAS_24_2026,
  PLAFON_CASS_MAXIM_2026,
  venitNetPfaPentruRamas,
} = await import(pfaModulePath) as typeof import("../src/lib/pfa");

const standard = { salariatPestePlafonCASS: false, pensionar: false };
const salariatEligibil = { salariatPestePlafonCASS: true, pensionar: false };
const pensionar = { salariatPestePlafonCASS: false, pensionar: true };

assert.deepEqual(
  calculeazaPFA(0, standard),
  {
    venitNet: 0,
    cas: 0,
    cass: 0,
    cassDiferentaMinima: 0,
    cassDeductibila: 0,
    impozit: 0,
    totalTaxe: 0,
    ramas: 0,
  },
  "Venitul net zero nu generează contribuția CASS minimă",
);

const subPrag = calculeazaPFA(20_000, standard);
assert.equal(subPrag.cas, 0, "Sub 12 salarii minime nu se datorează CAS obligatoriu");
assert.equal(subPrag.cass, 2_430, "CASS standard se completează până la baza de 6 salarii minime");
assert.equal(subPrag.cassDiferentaMinima, 430, "Diferența CASS trebuie identificată separat");
assert.equal(subPrag.cassDeductibila, 2_000, "Diferența până la minimul CASS nu este deductibilă");
assert.equal(subPrag.impozit, 1_800, "Impozitul deduce numai CASS aferentă venitului efectiv");

const salariatSubPrag = calculeazaPFA(20_000, salariatEligibil);
assert.equal(salariatSubPrag.cass, 2_000, "Salariatul eligibil nu datorează diferența până la minimul CASS");
assert.equal(salariatSubPrag.cas, 0, "Statutul de salariat nu introduce CAS sub prag");

// Un salariat cu venituri salariale sub 6 salarii minime lasă opțiunea de excepție
// dezactivată și datorează în continuare diferența până la CASS minimă.
const salariatNeeligibil = calculeazaPFA(20_000, standard);
assert.equal(salariatNeeligibil.cass, 2_430, "Simpla calitate de salariat sub plafon nu acordă excepția CASS");

const pensionarSubPrag = calculeazaPFA(20_000, pensionar);
assert.equal(pensionarSubPrag.cas, 0, "Pensionarul este exceptat de la CAS");
assert.equal(pensionarSubPrag.cass, 2_000, "Pensionarul plătește CASS pe venitul PFA, fără diferența minimă");

const laPragCas = calculeazaPFA(PLAFON_CAS_12_2026, standard);
assert.equal(laPragCas.cas, 12_150, "CAS nu se proratează: se datorează integral de la pragul anual, inclusiv pentru activitate începută în cursul anului");

// Exemplul ANAF din ghidul Declarației Unice: venit net 57.000 lei.
const exempluAnaf57k = calculeazaPFA(57_000, standard);
assert.equal(exempluAnaf57k.cas, 12_150, "Exemplul ANAF: CAS la baza de 12 salarii minime");
assert.equal(exempluAnaf57k.cass, 5_700, "Exemplul ANAF: CASS 10% din venitul net");
assert.equal(exempluAnaf57k.impozit, 3_915, "Exemplul ANAF: impozit 10% după CAS și CASS");

const laPrag24 = calculeazaPFA(PLAFON_CAS_24_2026, standard);
assert.equal(laPrag24.cas, 24_300, "Baza CAS minimă urcă la 24 de salarii minime inclusiv");

const pensionarPestePrag = calculeazaPFA(120_000, pensionar);
assert.equal(pensionarPestePrag.cas, 0, "Pensionarul rămâne exceptat de CAS peste prag");
assert.equal(pensionarPestePrag.cass, 12_000, "Pensionarul datorează CASS pe venitul PFA peste pragul minim");

const pestePlafonCass = calculeazaPFA(400_000, standard);
assert.equal(pestePlafonCass.cass, PLAFON_CASS_MAXIM_2026 * 0.1, "CASS este plafonată la 72 salarii minime");

const venitPentru35k = venitNetPfaPentruRamas(35_000, standard);
assert.equal(venitPentru35k, 43_210, "Calculul invers alege venitul minim înainte de saltul CAS");
assert.ok(calculeazaPFA(venitPentru35k, standard).ramas >= 35_000, "Calculul invers atinge suma dorită");
assert.ok(calculeazaPFA(venitPentru35k - 1, standard).ramas < 35_000, "Calculul invers nu supraestimează venitul necesar");

console.log("PFA 2026: 22 aserțiuni fiscale trecute.");
