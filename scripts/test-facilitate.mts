// Test facilitate OUG 89/2025: regresie + regula noua (baza + plafon)
// Calea variabilă păstrează compatibilitatea între Node 24 (TypeScript direct)
// și verificarea TypeScript din `next build`.
const fiscalModulePath = "../src/lib/fiscal.ts";
const { calculeaza, calculeazaCuRegim, calculeazaBrutDinNet } = await import(fiscalModulePath);
const fluturasModulePath = "../src/lib/fluturas.ts";
const { compuneFluturas } = await import(fluturasModulePath);

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

// 8. Contract cu normă întreagă, dar numai jumătate de lună realizată:
// OUG 89/2025 art. III alin. (4) cere proratarea sumei de 200 lei.
const fluturasJumatate = compuneFluturas(
  { ...std, brut: "4325" },
  { sporOre: "75", sporuri: "", normaOre: "168", oreLucrate: "84" },
  168,
);
const h = calculeaza(fluturasJumatate.input)!;
check("norma intreaga, jumatate de luna", h.facilitate === 100, `facilitate ${h.facilitate}, net cash ${h.netBani}`);

// 9. Un contract part-time nu este eligibil, chiar dacă baza introdusă coincide
// numeric cu minimul unui contract cu normă întreagă.
const fluturasPartTime = compuneFluturas(
  { ...std, brut: "4325" },
  { sporOre: "75", sporuri: "", normaOre: "84", oreLucrate: "84" },
  168,
);
const i = calculeaza(fluturasPartTime.input)!;
check("contract part-time", i.facilitate === 0, `facilitate ${i.facilitate}, net cash ${i.netBani}`);
check(
  "model fluturas explicit",
  fluturasJumatate.input.normaContract === "intreaga"
    && fluturasJumatate.input.fractieLuna === 0.5
    && fluturasPartTime.input.normaContract === "partiala"
    && fluturasPartTime.input.fractieLuna === 1,
  `partial-month ${fluturasJumatate.input.normaContract}/${fluturasJumatate.input.fractieLuna}, part-time ${fluturasPartTime.input.normaContract}/${fluturasPartTime.input.fractieLuna}`,
);

// 10. Proratarea funcționează și în S1 (300 × 1/2 = 150), iar fracția este plafonată la 1.
const j = calculeazaCuRegim({
  ...std,
  brut: "2025",
  salariuDeBaza: "4050",
  normaContract: "intreaga",
  fractieLuna: 0.5,
}, "2026-S1")!;
const k = calculeaza({ ...std, brut: "4325", normaContract: "intreaga", fractieLuna: 2 })!;
check("prorata S1", j.facilitate === 150, `facilitate ${j.facilitate}`);
check("fractie plafonata", k.facilitate === 200, `facilitate ${k.facilitate}`);

// 11. Inversarea urmărește netul cash, nu totalul cash + card de tichete.
const cuTicheteInput = { ...std, brut: "5000", tichete: "840" };
const cuTichete = calculeaza(cuTicheteInput)!;
const roundTrip = calculeazaBrutDinNet(cuTichete.netBani, cuTicheteInput);
check("round-trip cu tichete", roundTrip === 5000, `brut ${roundTrip}, net cash ${cuTichete.netBani}, total ${cuTichete.net}`);

// 12. Pentru o țintă cash mică și tichete mari, intervalul net × 3 era insuficient.
const brutCashMic = calculeazaBrutDinNet(100, { ...std, tichete: "840" });
const cashMic = calculeaza({ ...std, brut: String(brutCashMic), tichete: "840" })!;
check(
  "plafon dinamic net-brut",
  brutCashMic > 300 && Math.abs(cashMic.netBani - 100) <= 1,
  `brut ${brutCashMic}, net cash ${cashMic.netBani}`,
);

console.log(fail === 0 ? "\nTOATE TESTELE AU TRECUT" : `\n${fail} TESTE ESUATE`);
process.exit(fail === 0 ? 0 : 1);
