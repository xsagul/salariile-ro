// Rezumatul ofertelor ANOFM pe meseriile din catalog (legătura: codul COR din
// src/lib/meserii.ts). Cercetare, nu publicare: pragurile de afișare rămân în
// scripts/crawler/policy.mjs, iar pilonii nu se topesc într-o cifră (CLAUDE.md).
//
//   node scripts/colectare/anofm-rezumat.mjs [--dir=colectare/anofm] [--out=fisier.json]
//
// Cohorte separate, ca la anunțuri: brut declarat, net declarat, bază nedeclarată. Salariul
// minim se judecă după data ofertei (4.050 lei până la 30 iunie 2026, 4.325 de la 1 iulie).
import fs from "node:fs";
import path from "node:path";

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const DIR = arg("dir", "colectare/anofm");
const OUT = arg("out", "");

const meserii = [...fs.readFileSync("src/lib/meserii.ts", "utf8").matchAll(/slug: "([^"]+)", nume: "([^"]+)".*?cor: "(\d{6})"/g)]
  .map(([, slug, nume, cor]) => ({ slug, nume, cor }));

const oferte = new Map();
for (const f of fs.readdirSync(path.join(DIR, "oferte")).filter((f) => f.endsWith(".jsonl")).sort()) {
  for (const linie of fs.readFileSync(path.join(DIR, "oferte", f), "utf8").split("\n")) {
    if (!linie.trim()) continue;
    const o = JSON.parse(linie);
    oferte.set(o.id, o);
  }
}

const minimLa = (zi) => (zi < "2026-07-01" ? 4050 : 4325);
const cuantila = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.max(0, Math.ceil(p * s.length) - 1)] : null; };
const bani = (x) => (x === null || x === undefined || x === "" ? null : Number(x));

const rezultat = [];
for (const m of meserii) {
  const lot = [...oferte.values()].filter((o) => String(o.cor_name ?? "").startsWith(m.cor));
  if (!lot.length) { rezultat.push({ ...m, oferte: 0 }); continue; }
  // La normă întreagă, o sumă sub jumătate din minimul de la data ofertei e o greșeală de
  // completare (ex. „1” leu la electromecanic, 26 septembrie 2026), nu un salariu.
  const brutIntreaga = lot.filter((o) => o.salary_type === "gross" && o.work_type_name === "Cu normă întreagă" && bani(o.minimum_salary) >= minimLa(o.created_at) / 2);
  const minime = brutIntreaga.map((o) => bani(o.minimum_salary));
  const laMinim = brutIntreaga.filter((o) => bani(o.minimum_salary) === minimLa(o.created_at)).length;
  const peExperienta = {};
  for (const o of brutIntreaga) (peExperienta[o.professional_experience_name] ??= []).push(bani(o.minimum_salary));
  rezultat.push({
    ...m,
    oferte: lot.length,
    posturi: lot.reduce((s, o) => s + (o.open_positions ?? 0), 0),
    angajatori: new Set(lot.map((o) => o.employer_tax_code ?? `pf-${o.id}`)).size,
    judete: new Set(lot.map((o) => o.county_id)).size,
    baza: { brut: lot.filter((o) => o.salary_type === "gross").length, net: lot.filter((o) => o.salary_type === "net").length, nedeclarata: lot.filter((o) => o.salary_type === "none").length },
    brutNormaIntreaga: brutIntreaga.length
      ? { n: brutIntreaga.length, laSalariulMinim: laMinim, p25: cuantila(minime, 0.25), mediana: cuantila(minime, 0.5), p75: cuantila(minime, 0.75),
          cuInterval: brutIntreaga.filter((o) => bani(o.maximum_salary) > bani(o.minimum_salary)).length,
          medianaPeExperienta: Object.fromEntries(Object.entries(peExperienta).map(([k, v]) => [k, { n: v.length, mediana: cuantila(v, 0.5) }])) }
      : null,
  });
}

rezultat.sort((a, b) => b.oferte - a.oferte);
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ generatLa: new Date().toISOString(), oferteUnice: oferte.size, meserii: rezultat }, null, 1));
console.log(`${oferte.size} oferte unice; ${rezultat.filter((r) => r.oferte).length} din ${meserii.length} meserii au cel puțin o ofertă`);
for (const r of rezultat.filter((r) => r.oferte).slice(0, 40)) {
  const b = r.brutNormaIntreaga;
  console.log(`${r.nume.padEnd(28)} ${String(r.oferte).padStart(4)} oferte ${String(r.angajatori).padStart(4)} angaj. ${String(r.judete).padStart(2)} jud. | brut întreagă n=${b?.n ?? 0} la minim ${b ? Math.round((100 * b.laSalariulMinim) / b.n) : "-"}% | P25/med/P75 ${b ? `${b.p25}/${b.mediana}/${b.p75}` : "-"}`);
}
