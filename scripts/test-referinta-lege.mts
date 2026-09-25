// Referință independentă pentru calculul brut → net, scrisă direct din lege, NU din fiscal.ts:
// tabelul art. 77 alin. (4) e căutat rând cu rând („salariul minim + 1 leu … + 50 lei”), cu
// aritmetică în numere întregi. Compară motorul pe toate perioadele alese din calculator.
// Adăugat pe 26 septembrie 2026, când a găsit două erori: deducerea calculată fără tichete
// (64.462 de diferențe din 468.864) și rotunjirea în virgulă mobilă (33% × 4.050 = 1.336,5).
// Când se adaugă o perioadă în fiscal.ts, se adaugă aici din actul normativ, nu din cod.
import assert from "node:assert/strict";
const fiscalModulePath = "../src/lib/fiscal.ts";
const { calculeazaCuRegim } = await import(fiscalModulePath);
const R: Record<string, { min: number; fac: number; plafon: number; cuTichete: boolean }> = {
  "2024-S1": { min: 3300, fac: 200, plafon: 4000, cuTichete: true },  // HG 900/2023; OUG 115/2023 art. LXXIII
  "2024-S2": { min: 3700, fac: 300, plafon: 4000, cuTichete: false }, // HG 598/2024; OUG 59/2024 art. II; OUG 87/2024 art. V
  "2025":    { min: 4050, fac: 300, plafon: 4300, cuTichete: false }, // HG 1506/2024; OUG 156/2024 art. LXVI
  "2026-S1": { min: 4050, fac: 300, plafon: 4300, cuTichete: false }, // OUG 89/2025 art. III
  "2026-S2": { min: 4325, fac: 200, plafon: 4600, cuTichete: false }, // HG 146/2026; OUG 89/2025 art. III
};
const PROC = [[200, 250, 300, 350, 450]]; // rândul „până la salariul minim”, în zecimi de procent
for (let r = 1; r <= 40; r++) PROC.push(PROC[0].map((p) => p - 5 * r));
function procentTabel(V: number, min: number, persoane: number): number | null {
  const col = Math.min(persoane, 4);
  if (V <= min) return PROC[0][col];
  for (let r = 1; r <= 40; r++) {
    const jos = min + 50 * (r - 1) + 1, sus = min + 50 * r; // „salariul minim + 1 leu … + 50 lei”
    if (V >= jos && V <= sus) return PROC[r][col];
  }
  return null; // peste minim + 2.000: fără deducere de bază
}
type Optiuni = { p: number; copii: number; sub26: boolean; fb: boolean; scutit: boolean };
function ref(brut: number, tichete: number, o: Optiuni, regim: keyof typeof R) {
  const g = R[regim];
  const F = o.fb && brut === g.min && (g.cuTichete ? brut + tichete : brut) <= g.plafon ? g.fac : 0;
  const cas = Math.round(((brut - F) * 25) / 100);
  const cass = Math.round((brut - F + tichete) / 10);
  const V = brut + tichete;
  let ded = 0;
  if (o.fb) {
    const p = procentTabel(V, g.min, o.p);
    if (p !== null) ded += Math.round((p * g.min) / 1000);
    if (o.sub26 && V <= g.min + 2000) ded += Math.round((15 * g.min) / 100);
    ded += 100 * o.copii;
  }
  const impozabil = Math.max(0, brut + tichete - cas - cass - F);
  const dedApl = Math.min(ded, impozabil);
  const impozit = o.scutit ? 0 : Math.round((impozabil - dedApl) / 10);
  return { cas, cass, ded: dedApl, impozit, netBani: brut - cas - cass - impozit, cam: Math.round(((brut - F) * 225) / 10000), F };
}
let n = 0, dif = 0; const exemple: string[] = [];
for (const regim of Object.keys(R) as (keyof typeof R)[]) {
  const m = R[regim].min;
  const bruturi = new Set<number>([m - 1, m, m + 1, m + 49, m + 50, m + 51, m + 1999, m + 2000, m + 2001, R[regim].plafon, R[regim].plafon + 1, 100, 300]);
  for (let b = 500; b <= 15000; b += 97) bruturi.add(b);
  for (const brut of bruturi) for (const tichete of [0, 1, 200, 500, 945, 1100]) for (const p of [0, 1, 2, 3, 4, 5]) for (const copii of [0, Math.min(p, 2)]) for (const sub26 of [false, true]) for (const fb of [true, false]) for (const scutit of [false, true]) {
    const o = { p, copii, sub26, fb, scutit };
    const a = ref(brut, tichete, o, regim);
    const r = calculeazaCuRegim({ brut: String(brut), tichete: tichete ? String(tichete) : "", functieDeBAza: fb, persoanePretretinere: p, varstaSub26: sub26, copiiScolarizati: copii, scutitImpozit: scutit }, regim)!;
    const b = { cas: r.cas, cass: r.cass, ded: r.deducerePersonala, impozit: r.impozit, netBani: r.netBani, cam: r.cam, F: r.facilitate };
    n++;
    if (JSON.stringify(a) !== JSON.stringify(b)) { dif++; if (exemple.length < 8) exemple.push(`${regim} brut ${brut} tichete ${tichete} ${JSON.stringify(o)}\n  lege: ${JSON.stringify(a)}\n  noi:  ${JSON.stringify(b)}`); }
  }
}
assert.equal(dif, 0, `Motorul diferă de lege în ${dif} din ${n} combinații:\n${exemple.join("\n")}`);
console.log(`OK: referința din lege — ${n} combinații, 5 perioade, zero diferențe`);
