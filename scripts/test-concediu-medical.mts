import assert from "node:assert/strict";
import {
  BAZA_LUNARA_CAS_MEDICAL,
  CASTIG_MEDIU_BASS,
  PLAFON_BAZA_LUNARA,
  calculeazaConcediuMedical,
  procentBoalaObisnuita,
} from "../src/lib/concediu-medical";
import { SALARIU_MINIM } from "../src/lib/fiscal";

assert.equal(CASTIG_MEDIU_BASS, 9192, "Câștigul salarial mediu brut BASS 2026 trebuie să fie 9.192 lei");
assert.equal(PLAFON_BAZA_LUNARA, 12 * SALARIU_MINIM);
assert.equal(Math.round(BAZA_LUNARA_CAS_MEDICAL * 100) / 100, 3217.2);

// Procente boală obișnuită (Legea 141/2025)
assert.equal(procentBoalaObisnuita(1), 0.55);
assert.equal(procentBoalaObisnuita(7), 0.55);
assert.equal(procentBoalaObisnuita(8), 0.65);
assert.equal(procentBoalaObisnuita(14), 0.65);
assert.equal(procentBoalaObisnuita(15), 0.75);

// Cod 01, 5 zile lucrătoare (5 zile calendaristice): ziua 1 neplătită, 4 zile angajator, 0 FNUASS, 55%, CAS + CASS + impozit
const c01 = calculeazaConcediuMedical({
  venitBrutMediu6Luni: 6300,
  cod: "01",
  zileCalendaristiceEpisod: 5,
  zileLucratoareConcediu: 5,
  zileLucratoareLuna: 21,
})!;
assert.equal(c01.procent, 0.55);
assert.equal(c01.zileNeplatite, 1);
assert.equal(c01.zilePlatite, 4);
assert.equal(c01.zileAngajator, 4);
assert.equal(c01.zileFnuass, 0);
assert.equal(c01.indemnizatieBruta, 660); // 300/zi * 0.55 * 4 = 660
assert.ok(c01.cas > 0 && c01.cass === 66 && c01.impozit > 0);
assert.equal(c01.indemnizatieNeta, c01.indemnizatieBruta - c01.cas - c01.cass - c01.impozit);

// Cod 01, 10 zile lucrătoare (14 calendaristice): 65%, 1 neplătită, 5 angajator, 4 FNUASS
const c01Lung = calculeazaConcediuMedical({
  venitBrutMediu6Luni: 6300,
  cod: "01",
  zileCalendaristiceEpisod: 14,
  zileLucratoareConcediu: 10,
  zileLucratoareLuna: 21,
})!;
assert.equal(c01Lung.procent, 0.65);
assert.equal(c01Lung.zileAngajator, 5);
assert.equal(c01Lung.zileFnuass, 4);

// Cod 08 Maternitate: 85%, fără prima zi neplătită, integral FNUASS, scutit CASS și impozit, doar CAS art. 143
const c08 = calculeazaConcediuMedical({
  venitBrutMediu6Luni: 6300,
  cod: "08",
  zileCalendaristiceEpisod: 30,
  zileLucratoareConcediu: 21,
  zileLucratoareLuna: 21,
})!;
assert.equal(c08.procent, 0.85);
assert.equal(c08.zileNeplatite, 0);
assert.equal(c08.zileAngajator, 0);
assert.equal(c08.zileFnuass, 21);
assert.equal(c08.cass, 0);
assert.equal(c08.impozit, 0);
assert.equal(c08.cas, Math.round(Math.round(BAZA_LUNARA_CAS_MEDICAL) * 0.25));
assert.equal(c08.indemnizatieBruta, Math.round(6300 * 0.85));
assert.equal(c08.indemnizatieNeta, c08.indemnizatieBruta - c08.cas);

// Plafon 12 salarii minime
const cPlafon = calculeazaConcediuMedical({
  venitBrutMediu6Luni: 80000,
  cod: "08",
  zileCalendaristiceEpisod: 30,
  zileLucratoareConcediu: 21,
  zileLucratoareLuna: 21,
})!;
assert.equal(cPlafon.plafonAplicat, true);
assert.equal(cPlafon.venitPlafonat, PLAFON_BAZA_LUNARA);

// Intrări invalide
assert.equal(calculeazaConcediuMedical({ venitBrutMediu6Luni: 0, cod: "01", zileCalendaristiceEpisod: 5, zileLucratoareConcediu: 5 }), null);

console.log("OK: calculator concediu medical 2026 (OUG 158/2005, Legea 141/2025, Legea 64/2026, CF art. 143).");
