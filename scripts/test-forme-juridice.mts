// Verifică motorul de comparație PFA / SRL micro / SRL profit, an fiscal 2026.
// Cifrele de referință vin din verificarea pe Codul fiscal consolidat
// (versiunea în vigoare la 1 iulie 2026) pentru cazul 200.000 lei venituri și
// 20.000 lei cheltuieli, cu 6.000 lei contabilitate în plus la SRL.

import assert from "node:assert/strict";

// Calea stă într-o variabilă ca `tsc --noEmit` să rămână compatibil fără
// allowImportingTsExtensions, la fel ca în test-pfa.mts.
const formeModulePath = "../src/lib/forme-juridice.ts";
const pfaModulePath = "../src/lib/pfa.ts";
const fiscalModulePath = "../src/lib/fiscal.ts";
const {
  calculeazaSrl,
  cassDividende,
  PLAFON_MICRO_LEI,
  COST_ANGAJATOR_MINIM_2026,
  NET_SALARIU_MINIM_2026,
} = await import(formeModulePath);
const { calculeazaPFA, SALARIU_MINIM_PFA_2026 } = await import(pfaModulePath);
const { calculStandardCuRegim } = await import(fiscalModulePath);

// ─── Constantele locale nu au voie să diveargă de restul site-ului ───────────
// forme-juridice.ts își redefinește constantele, fiindcă modulele din src/lib
// nu se importă între ele. Aici verificăm că redefinirea încă spune adevărul.
const s1 = calculStandardCuRegim(4_050, "2026-S1");
const s2 = calculStandardCuRegim(4_325, "2026-S2");
assert.equal(
  COST_ANGAJATOR_MINIM_2026,
  6 * s1.costTotal + 6 * s2.costTotal,
  "Costul anual al salariului minim trebuie să vină din motorul fiscal al site-ului",
);
assert.equal(
  NET_SALARIU_MINIM_2026,
  6 * s1.netBani + 6 * s2.netBani,
  "Netul anual al salariului minim trebuie să vină din motorul fiscal al site-ului",
);
assert.equal(SALARIU_MINIM_PFA_2026, 4_050, "Reperul de plafoane este minimul de la 1 ianuarie 2026");

const standard = { salariatPestePlafonCASS: false, pensionar: false };

// ─── Trepte CASS pe dividende ────────────────────────────────────────────────
// Sunt praguri, nu o cotă: un leu peste prag schimbă brusc suma datorată.
assert.equal(cassDividende(24_299), 0, "Sub 6 salarii minime nu se datorează CASS pe dividende");
assert.equal(cassDividende(24_300), 2_430, "La exact 6 salarii minime se intră în prima treaptă");
assert.equal(cassDividende(48_599), 2_430, "Treapta ține până la 12 salarii minime");
assert.equal(cassDividende(48_600), 4_860, "La 12 salarii minime baza urcă la 12 minime");
assert.equal(cassDividende(97_199), 4_860, "A doua treaptă ține până la 24 de minime");
assert.equal(cassDividende(97_200), 9_720, "De la 24 de minime baza se blochează la 24");
assert.equal(cassDividende(5_000_000), 9_720, "CASS pe dividende este plafonată la 9.720 lei");

// Efectul de prag: un singur leu în plus costă 2.430 de lei.
assert.equal(
  cassDividende(48_600) - cassDividende(48_599),
  2_430,
  "Trecerea pragului de 12 salarii minime costă exact o treaptă",
);

// ─── Cazul de referință: 200.000 venituri, 20.000 cheltuieli ─────────────────
const VENITURI = 200_000;
const CHELTUIELI = 20_000;

const pfa = calculeazaPFA(VENITURI - CHELTUIELI, standard);
assert.equal(pfa.cas, 24_300, "PFA: baza CAS minimă a tranșei superioare");
assert.equal(pfa.cass, 18_000, "PFA: CASS 10% pe venitul net, sub plafonul de 72 de minime");
assert.equal(pfa.impozit, 13_770, "PFA: impozit 10% după deducerea contribuțiilor");
assert.equal(pfa.ramas, 123_930, "PFA: cât rămâne la 180.000 venit net");

const micro = calculeazaSrl(VENITURI, CHELTUIELI, { tip: "micro" });
assert.equal(micro.impozitFirma, 2_000, "Micro: 1% pe venituri, nu pe profit");
assert.equal(micro.costSalarial, 51_312, "Micro: salariul minim e obligatoriu pentru încadrare");
assert.equal(micro.dividendeBrute, 120_688, "Micro: profit distribuibil după cheltuieli, salariu și impozit");
assert.equal(micro.impozitDividende, 19_310, "Micro: impozit pe dividende 16%");
assert.equal(micro.dividendeNete, 101_378, "Micro: dividende nete");
assert.equal(micro.cassDividende, 9_720, "Micro: dividendele nete depășesc 24 de salarii minime");
assert.equal(micro.ramas, 123_296, "Micro: cât ajunge la proprietar");

const profit = calculeazaSrl(VENITURI, CHELTUIELI, { tip: "profit" });
assert.equal(profit.impozitFirma, 19_630, "Profit: 16% pe profitul impozabil");
assert.equal(profit.impozitDividende, 16_489, "Profit: impozit pe dividende 16%");
assert.equal(profit.cassDividende, 4_860, "Profit: dividendele nete cad în treapta de 12 minime");
assert.equal(profit.ramas, 113_347, "Profit: cât ajunge la proprietar");

// Ordinea rezultatelor la acest nivel de venit, și cât de strânsă e.
assert.ok(pfa.ramas > micro.ramas, "La 200.000 lei, PFA trece la limită înaintea micro");
assert.ok(micro.ramas > profit.ramas, "Impozitul pe profit este clar ultimul la acest nivel");
assert.ok(
  pfa.ramas - micro.ramas < 1_000,
  "Diferența PFA–micro este sub 1.000 lei, deci în interiorul ipotezei de contabilitate",
);

// Cheltuiala de contabilitate chiar mișcă verdictul, ceea ce justifică
// expunerea ei ca input, nu ascunderea într-o constantă.
const microFaraContabil = calculeazaSrl(VENITURI, CHELTUIELI, { tip: "micro", cheltuialaContabilitate: 0 });
assert.ok(
  microFaraContabil.ramas > pfa.ramas,
  "Fără cheltuiala de contabilitate, micro depășește PFA — ipoteza schimbă câștigătorul",
);

// ─── Micro pe pierdere: impozitul se datorează oricum ────────────────────────
const microPierdere = calculeazaSrl(100_000, 150_000, { tip: "micro" });
assert.equal(microPierdere.impozitFirma, 1_000, "Micro: 1% se plătește și pe pierdere, fiindcă baza e cifra de afaceri");
assert.equal(microPierdere.dividendeBrute, 0, "Micro: fără profit nu există dividende");
assert.equal(microPierdere.cassDividende, 0, "Micro: fără dividende nu există CASS pe dividende");

const profitPierdere = calculeazaSrl(100_000, 150_000, { tip: "profit" });
assert.equal(profitPierdere.impozitFirma, 0, "Profit: pe pierdere nu se datorează impozit pe profit");

// ─── Opțiunea fără salariu, disponibilă doar la impozit pe profit ────────────
const profitFaraSalariu = calculeazaSrl(VENITURI, CHELTUIELI, { tip: "profit", cuSalariu: false });
assert.equal(profitFaraSalariu.costSalarial, 0, "Profit: salariul este opțional");
const microFaraSalariu = calculeazaSrl(VENITURI, CHELTUIELI, { tip: "micro", cuSalariu: false });
assert.equal(
  microFaraSalariu.costSalarial,
  COST_ANGAJATOR_MINIM_2026,
  "Micro: salariul nu poate fi eliminat, condiția de angajat este legală",
);

assert.equal(PLAFON_MICRO_LEI, 509_850, "Plafonul micro la cursul BNR de la 31 decembrie 2025");

console.log("Forme juridice 2026: 31 aserțiuni trecute (PFA, micro 1%, impozit pe profit).");
