// Calcul temporar pentru cardurile noi din draft-sm: deducerea cu copii și
// plafonul facilității (bonus care depășește 4.600 lei).
import { calculeaza } from "../src/lib/fiscal";

const base = { tichete: "", functieDeBAza: true, persoanePretretinere: 0, varstaSub26: false, copiiScolarizati: 0, scutitImpozit: false };

const cazuri: [string, Parameters<typeof calculeaza>[0]][] = [
  ["minim, 0 pers.", { ...base, brut: "4325" }],
  ["minim, 1 copil", { ...base, brut: "4325", persoanePretretinere: 1, copiiScolarizati: 1 }],
  ["minim, 2 copii", { ...base, brut: "4325", persoanePretretinere: 2, copiiScolarizati: 2 }],
  ["bază 4325 + spor 275 = 4600", { ...base, brut: "4600", salariuDeBaza: "4325" }],
  ["bază 4325 + spor 300 = 4625", { ...base, brut: "4625", salariuDeBaza: "4325" }],
];

for (const [nume, input] of cazuri) {
  const r = calculeaza(input);
  console.log(nume, "→ net", r?.net, "| impozit", r?.impozit, "| deducere", r?.deducerePersonala, "| facilitate", r?.facilitate);
}
