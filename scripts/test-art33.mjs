// Regresii pentru cititorul listelor art. 33 și dicționarul de funcții. Etichetele sunt
// cele reale, întâlnite în fișierele spitalelor pe 26 septembrie 2026; fiecare caz a fost
// cândva citit greșit.
import assert from "node:assert/strict";
import { tipColoana, randValid, fisierAcceptat } from "./colectare/art33/citeste.mjs";
import { meserie, studii } from "./colectare/art33/functii.mjs";

const cazuri = [
  // Bacău: baza, bazele de calcul, valoare vs. procent, sume variabile cu „100%” în nume
  ["Salariu de baza Legea 153/2017", 6407, "baza"],
  ["Baza calcul spor", 4576, "bazaCalcul"],
  ["Spor pentru conditii periculoase Anexa 1 din HG 153/2018 Valoare", 3432, "sporFix"],
  ["Spor pentru conditii periculoase Anexa 1 din HG 153/2018 %", 75, "procent"],
  ["Spor 100% pentru ore lucrate in zilele de repaus si sarbatori Anexa nr.II", 659, "variabil"],
  ["Spor ture 15% Anexa nr.II Cap.II art.1 din Legea nr.153/2017 Valoare", 457, "variabil"],
  ["Indemnizatie lunara Anexa nr.II Cap.II art.3^1 (1) g) Legea nr.153/2017", 300, "sporFix"],
  ["Indemnizatie de hrana anuala art.18 din Legea nr.153/2017", 4164, "hrana"],
  ["Vouchere de vacanta OUG 8/2009", 800, "hrana"],
  // Alba: „Procent / Sumă tură”, OUG 19/2024, gărzi la domiciliu
  ["Procent Sumă tură", 534, "variabil"],
  ["Ind OUG 63/OG 42/2023/ OUG 19/2024*", 800, "sporFix"],
  ["Sume gărzi la domicil iu", 300, "variabil"],
  // Cluj: „VeniTURI” nu e tură
  ["Venituri salariale la data de 31.03.2026 salariu de bază (lei)", 6281, "baza"],
  // Sibiu: „Salariu spor” e bază de calcul; „sărbă-tori” cu cratimă
  ["Salariu spor Salariu spor", 5411, "bazaCalcul"],
  ["Spor sărbă-tori legale", 928, "variabil"],
  // Miercurea Ciuc
  ["Sume ore prestate in zile libere conf. Cap.II art.2", 1062, "variabil"],
  // Brăila și Filantropia: „bază” singur și prescurtări
  ["Baza lei grila:", 5250, "baza"],
  ["Transparenta venituri salariale Legea 153/2017 Val. cond deoseb de peric", 3100, "sporFix"],
  // DGASPC Sector 2: total publicat
  ["TRANSPARENȚA VENITURILOR SALARIALE Total salariu brut - lei", 6639, "total"],
];
for (const [et, v, asteptat] of cazuri) assert.equal(tipColoana(et, false, v), asteptat, `„${et}” (${v}) trebuie să fie ${asteptat}`);

// Dicționarul de funcții
assert.equal(meserie("SECTIA ATI ASISTENT MEDICAL PRINCIPAL Gradatia 5", "spital"), "asistent-medical");
assert.equal(meserie("ASISTENT MEDICAL SEF", "spital"), null, "Funcțiile de conducere nu intră");
assert.equal(meserie("ASISTENT MEDICAL DE FARMACIE", "spital"), "asistent-farmacie");
assert.equal(meserie("INGRIJITOARE", "spital"), null, "Îngrijitoarea din spital face curățenie, nu îngrijire de bătrâni");
assert.equal(meserie("INGRIJITOR", "dgaspc"), "ingrijitor-batrani");
assert.equal(meserie("CONSILIER JURIDIC", "primarie"), "consilier-juridic");
assert.equal(meserie("Consilier clasa I grad superior", "primarie"), "functionar-public");
assert.equal(meserie("Consilier clasa I grad superior", "spital"), null);
assert.equal(studii("ASISTENT MEDICAL (PL) Gradatia 3"), "PL");
assert.equal(studii("ASISTENT MEDICAL S PRINCIPAL"), "S");

// Validarea rândurilor și a fișierelor
assert.equal(randValid({ baza: 5, sporFix: 4184, variabil: 0 }), "bază în afara plajei");
assert.equal(randValid({ baza: 6819, sporFix: 1200, variabil: 400 }), null);
const rand = (baza) => ({ baza, sporFix: 0, variabil: 0, sume: [] });
assert.equal(fisierAcceptat([rand(6000), rand(6100), rand(6200), rand(6300), rand(6400)]), null);
assert.match(fisierAcceptat([rand(6000), rand(5), rand(5), rand(5), rand(5)]), /rânduri valide/);

console.log(`OK: cititorul art. 33 — ${cazuri.length} etichete reale, dicționarul de funcții, validarea`);
