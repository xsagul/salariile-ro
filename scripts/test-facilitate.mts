// Test facilitate OUG 89/2025: regresie + regula noua (baza + plafon)
import { calculeaza } from "../src/lib/fiscal";

const std = { tichete: "", functieDeBAza: true, persoanePretretinere: 0, varstaSub26: false, copiiScolarizati: 0, scutitImpozit: false };
let fail = 0;
const check = (nume: string, cond: boolean, detalii: string) => {
  console.log(`${cond ? "OK  " : "FAIL"} ${nume} — ${detalii}`);
  if (!cond) fail++;
};

// 1. Regresie: minim simplu
const a = calculeaza({ ...std, brut: "4325" })!;
check("minim simplu", a.net === 2699 && a.facilitate === 200, `net ${a.net}, facilitate ${a.facilitate}`);

// 2. Regresie: 5000 simplu
const b = calculeaza({ ...std, brut: "5000" })!;
check("5000 simplu", b.facilitate === 0, `facilitate ${b.facilitate}`);

// 3. NOU: baza 4325 + spor 200 => brut 4525 <= 4600 -> facilitatea SE PASTREAZA
const c = calculeaza({ ...std, brut: "4525", salariuDeBaza: "4325" })!;
check("baza minim + spor 200", c.facilitate === 200, `facilitate ${c.facilitate}, net ${c.net}`);

// 4. NOU: baza 4325 + spor 400 => brut 4725 > 4600 -> facilitatea SE PIERDE
const d = calculeaza({ ...std, brut: "4725", salariuDeBaza: "4325" })!;
check("baza minim + spor 400", d.facilitate === 0, `facilitate ${d.facilitate}`);

// 5. NOU: baza peste minim -> facilitate 0
const e = calculeaza({ ...std, brut: "4500", salariuDeBaza: "4400" })!;
check("baza 4400", e.facilitate === 0, `facilitate ${e.facilitate}`);

// 6. Regresie: nu e functie de baza
const f = calculeaza({ ...std, functieDeBAza: false, brut: "4325" })!;
check("minim, nu functie de baza", f.facilitate === 0, `facilitate ${f.facilitate}`);

// 7. Regresie: 4050 (fostul minim) — nu mai primeste facilitate in S2
const g = calculeaza({ ...std, brut: "4050" })!;
check("4050 in S2", g.facilitate === 0, `facilitate ${g.facilitate}`);

console.log(fail === 0 ? "\nTOATE TESTELE AU TRECUT" : `\n${fail} TESTE ESUATE`);
process.exit(fail === 0 ? 0 : 1);
