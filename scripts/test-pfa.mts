import assert from "node:assert/strict";

// Node 24 execută TypeScript direct. Calea este păstrată într-o variabilă pentru ca
// verificarea `tsc --noEmit` să rămână compatibilă fără allowImportingTsExtensions.
const pfaModulePath = "../src/lib/pfa.ts";
const {
  calculeazaPFA,
  calculeazaPfaNormaVenit,
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

// ─── Normă de venit ──────────────────────────────────────────────────────────
// Regula care separă cele două regimuri: la normă, impozitul se aplică pe normă,
// fără deducerea CAS și CASS (art. 118 alin. (2) rezervă deducerea sistemului real).

const normaZero = calculeazaPfaNormaVenit(0, standard);
assert.equal(normaZero.totalTaxe, 0, "Norma zero nu generează obligații");

const norma60k = calculeazaPfaNormaVenit(60_000, standard);
assert.equal(norma60k.cas, 12_150, "Norma de 60.000 depășește 12 salarii minime, deci CAS pe baza minimă");
assert.equal(norma60k.cass, 6_000, "CASS 10% pe normă");
assert.equal(norma60k.impozit, 6_000, "La normă, impozitul este 10% din normă, fără deducerea CAS/CASS");
assert.equal(norma60k.totalTaxe, 24_150, "Total taxe la normă de 60.000");

// Aceeași sumă în sistem real produce impozit mai mic, fiindcă acolo se deduc
// contribuțiile. Diferența este exact regula pe care o testăm.
const real60k = calculeazaPFA(60_000, standard);
assert.equal(real60k.impozit, 4_185, "În sistem real impozitul se calculează după CAS și CASS");
assert.ok(norma60k.impozit > real60k.impozit, "Impozitul la normă este mai mare la venit net egal");

const normaMica = calculeazaPfaNormaVenit(20_000, standard);
assert.equal(normaMica.cas, 0, "Sub 12 salarii minime norma nu declanșează CAS");
assert.equal(normaMica.cass, 2_430, "Sub 6 salarii minime se datorează CASS minimă");
assert.equal(normaMica.cassDiferentaMinima, 430, "Diferența până la CASS minimă rămâne identificabilă");
assert.equal(normaMica.impozit, 2_000, "Impozitul rămâne 10% din normă și sub pragurile de contribuții");

const normaPensionar = calculeazaPfaNormaVenit(100_000, pensionar);
assert.equal(normaPensionar.cas, 0, "Pensionarul este exceptat de CAS și la normă de venit");
assert.equal(normaPensionar.cass, 10_000, "Pensionarul datorează CASS pe normă");

const normaMare = calculeazaPfaNormaVenit(400_000, standard);
assert.equal(normaMare.cass, PLAFON_CASS_MAXIM_2026 * 0.1, "CASS se plafonează la 72 salarii minime și la normă");
assert.equal(normaMare.cas, 24_300, "Baza CAS maximă se aplică și la normă");

// Exemplul ANAF 2026 pentru normă de venit, folosit ca test de regresie:
// normă ajustată 42.150 lei -> CASS 4.215 lei -> impozit 42.150 × 10% = 4.215 lei.
// CASS nu se scade din bază, ceea ce fixează exact regula testată mai sus.
const anafNorma = calculeazaPfaNormaVenit(42_150, standard);
assert.equal(anafNorma.cass, 4_215, "ANAF: CASS 10% pe norma ajustată de 42.150 lei");
assert.equal(anafNorma.cas, 0, "ANAF: norma sub 12 salarii minime nu declanșează CAS");
assert.equal(anafNorma.impozit, 4_215, "ANAF: impozitul este 10% din normă, nu din normă minus CASS");
assert.equal(anafNorma.totalTaxe, 8_430, "ANAF: total obligații pentru norma de 42.150 lei");

// ─── Handicap grav sau accentuat (art. 60 pct. 1) ────────────────────────────
// Scutirea privește DOAR impozitul pe venit. Contribuțiile rămân datorate:
// scutirea de CASS pentru handicap acoperă veniturile salariale, nu pe cele din
// activități independente, iar art. 150 nu prevede o excepție de CAS.
const handicap = { salariatPestePlafonCASS: false, pensionar: false, handicapGravAccentuat: true };

const hFara = calculeazaPFA(93_600, standard);
const hCu = calculeazaPFA(93_600, handicap);

assert.equal(hCu.impozit, 0, "Handicapul grav sau accentuat scutește de impozitul pe venit");
assert.equal(hCu.cas, hFara.cas, "Scutirea nu atinge CAS");
assert.equal(hCu.cass, hFara.cass, "Scutirea nu atinge CASS");
assert.equal(hCu.totalTaxe, hFara.totalTaxe - hFara.impozit, "Scade exact impozitul, nimic altceva");
assert.equal(hCu.ramas, hFara.ramas + hFara.impozit, "Ce ramane creste exact cu impozitul scutit");

// Sub pragul CAS, scutirea lasa doar CASS de plata.
const hMic = calculeazaPFA(30_000, handicap);
assert.equal(hMic.impozit, 0, "Scutirea se aplica si sub pragul CAS");
assert.equal(hMic.cas, 0, "Sub 12 salarii minime nu se datoreaza CAS, indiferent de handicap");
assert.equal(hMic.totalTaxe, hMic.cass, "Sub prag ramane doar CASS");

// Absenta optiunii se comporta ca inainte — e optionala, nu implicita.
assert.deepEqual(calculeazaPFA(93_600, { ...standard, handicapGravAccentuat: false }), hFara, "false = fara scutire");

// ─── Art. 154 + art. 174 alin. (8): diferenta pana la CASS minim ─────────────
// Categoriile din art. 154 — elevi/studenti pana in 26 de ani, persoane cu
// handicap grav (gr. 1) sau accentuat (gr. 2) — NU datoreaza completarea pana
// la baza minima de 6 salarii. Datoreaza insa CASS 10% pe venitul PFA efectiv.
// Verificat contra calculatorului public SOLO la 800 lei/luna: 80 lei CASS
// lunar cu bifa, 203 fara. Toate cele 10 valori comparate coincid.
const venitSubPragMinim = 9_600; // 800 lei/luna, sub cele 6 salarii minime (24.300)

const vspFara = calculeazaPFA(venitSubPragMinim, standard);
assert.equal(vspFara.cass, 2_430, "Fara scutire, sub prag se plateste CASS la baza minima");

for (const [nume, opt] of [
  ["student", { ...standard, student: true }],
  ["handicap grav/accentuat", { ...standard, handicapGravAccentuat: true }],
  ["salariat peste prag", salariatEligibil],
  ["pensionar", pensionar],
] as const) {
  const r = calculeazaPFA(venitSubPragMinim, opt);
  assert.equal(r.cass, 960, `${nume}: CASS este 10% pe venitul efectiv, nu baza minima`);
  assert.equal(r.cassDiferentaMinima, 0, `${nume}: nu se adauga diferenta pana la minim`);
}

// Scutirea de la minim NU e scutire de CASS: contributia pe venit ramane.
assert.ok(calculeazaPFA(venitSubPragMinim, { ...standard, student: true }).cass > 0, "Studentul datoreaza CASS pe venitul PFA");

// Studentul nu e scutit de impozit — doar handicapul grav sau accentuat este.
assert.equal(
  calculeazaPFA(venitSubPragMinim, { ...standard, student: true }).impozit,
  calculeazaPFA(venitSubPragMinim, { ...standard, handicapGravAccentuat: true }).impozit + 864,
  "Studentul plateste impozit, persoana cu handicap grav sau accentuat nu",
);

console.log("PFA 2026: 58 aserțiuni fiscale trecute (sistem real + normă + art. 60 + art. 154).");
