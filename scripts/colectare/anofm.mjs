// Colectarea zilnică a ofertelor de muncă declarate la ANOFM (mediere.anofm.ro).
//
// De ce ANOFM: angajatorii sunt obligați prin Legea 76/2002 să declare locurile vacante,
// iar fiecare ofertă are cod COR, salariu minim și maxim, baza declarată (brut/net/fără),
// normă, experiența cerută, studii, județ și CUI. Decizia de colectare continuă:
// CLAUDE.md, 26 septembrie 2026; măsurătorile: research/meserii-2026-09-26/.
//
//   node scripts/colectare/anofm.mjs [--dir=colectare/anofm] [--zi=AAAA-LL-ZZ]
//
// Scrie în `dir`:
//   oferte/AAAA-LL.jsonl   — fiecare ofertă o singură dată, la prima apariție (append);
//   active/AAAA-LL-ZZ.json — ID-urile active în ziua colectării (ultima zi văzută);
//   index.json             — ID → [prima zi, ultima zi], ca reluarea să nu dubleze.
// Nu păstrează date de contact. Pentru angajatorii persoane fizice (cod fiscal de 13 cifre,
// PFA, II, IF) nu păstrează nici codul, nici numele.
import fs from "node:fs";
import path from "node:path";

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const DIR = arg("dir", "colectare/anofm");
const ZI = arg("zi", new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Bucharest" }));
const URL_API = "https://mediere.anofm.ro/api/entity/vw_public_job_posting";
const PAUZA_MS = 1500;
const PE_PAGINA = 250;

const CAMPURI = [
  "id", "created_at", "job_start_date", "job_expiry_date", "cor_name", "occupation_id",
  "job_domain_name", "minimum_salary", "maximum_salary", "salary_type", "open_positions",
  "county_id", "address_locality_name", "contract_type_name", "number_of_months",
  "work_type_name", "work_regime_name", "education_level_name",
  "professional_experience_name", "job_posting_target_name",
];

export function persoanaFizica(o) {
  const cod = String(o.employer_tax_code ?? "").replace(/\D/g, "");
  return cod.length === 13 || /\b(P\.?F\.?A|I\.?I\.?|I\.?F\.?)\b/i.test(o.employer_name ?? "");
}

export function curata(o) {
  const r = Object.fromEntries(CAMPURI.map((k) => [k, o[k] ?? null]));
  const pf = persoanaFizica(o);
  r.employer_tax_code = pf ? null : String(o.employer_tax_code ?? "").replace(/\D/g, "") || null;
  r.employer_name = pf ? null : o.employer_name ?? null;
  r.employer_individual = pf;
  return r;
}

async function pagina(nr, incercari = 3) {
  for (let i = 1; ; i++) {
    try {
      const raspuns = await fetch(URL_API, {
        method: "POST",
        headers: { "content-type": "application/json", "user-agent": "salariile.ro colectare zilnica (https://salariile.ro/metodologie)" },
        body: JSON.stringify({ current: nr, rowCount: PE_PAGINA, sort: { id: "desc" } }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!raspuns.ok) throw new Error(`HTTP ${raspuns.status}`);
      return await raspuns.json();
    } catch (e) {
      if (i >= incercari) throw e;
      await new Promise((r) => setTimeout(r, 10_000 * i));
    }
  }
}

async function main() {
  fs.mkdirSync(path.join(DIR, "oferte"), { recursive: true });
  fs.mkdirSync(path.join(DIR, "active"), { recursive: true });
  const fisIndex = path.join(DIR, "index.json");
  const index = fs.existsSync(fisIndex) ? JSON.parse(fs.readFileSync(fisIndex, "utf8")) : {};

  const active = [];
  const noi = [];
  let total = Infinity;
  for (let nr = 1; (nr - 1) * PE_PAGINA < total; nr++) {
    const d = await pagina(nr);
    total = d.total;
    for (const o of d.rows) {
      active.push(o.id);
      if (!index[o.id]) noi.push(curata(o));
      index[o.id] = [index[o.id]?.[0] ?? ZI, ZI];
    }
    await new Promise((r) => setTimeout(r, PAUZA_MS));
  }
  // Sub 90% din totalul anunțat înseamnă o colectare ruptă: nu scriem o zi incompletă.
  if (active.length < total * 0.9) throw new Error(`Colectare incompletă: ${active.length} din ${total}`);

  if (noi.length) fs.appendFileSync(path.join(DIR, "oferte", `${ZI.slice(0, 7)}.jsonl`), noi.map((o) => JSON.stringify(o)).join("\n") + "\n");
  fs.writeFileSync(path.join(DIR, "active", `${ZI}.json`), JSON.stringify({ zi: ZI, total, ids: active.sort((a, b) => a - b) }));
  fs.writeFileSync(fisIndex, JSON.stringify(index));
  console.log(`ANOFM ${ZI}: ${active.length} oferte active din ${total}, ${noi.length} noi, ${Object.keys(index).length} în total`);
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.endsWith("anofm.mjs")) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
