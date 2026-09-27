// Baza de date pe meserii (27 septembrie 2026): tot ce știm despre fiecare meserie, din toate
// sursele, cu cât mai mulți factori, ca proprietarul să aibă pe ce construi granularitatea.
//
//   node scripts/colectare/baza.mjs
//
// Intrări (toate deja în repo, adunate de colectări):
//   colectare/anunturi/observatii/*.jsonl   anunțuri cu salariu, colectare continuă
//   colectare/anunturi/profil/*.jsonl       factorii fiecărui anunț citit, cu sau fără salariu
//   public/date/anunturi-verificate.json    colectarea din 8 septembrie (anunțuri cu salariu)
//   colectare/anofm/oferte/*.jsonl          ofertele ANOFM (COR, studii, experiență, contract)
//   colectare/art33/observatii/*.jsonl      salariile publicate de instituțiile publice
// Ieșiri:
//   colectare/baza/meserii/<slug>.json      fișa fiecărei meserii (se păstrează în git)
//   colectare/baza/rezumat.json             câte date are fiecare meserie, pe surse
//   .cercetare-privata/baza.sqlite          aceleași date pe rânduri, pentru interogări (local)
//
// Reguli: nicio cifră sub prag nu devine „statistică” (percentilele cer cel puțin 10 valori,
// defalcările cel puțin 5); ofertele fără bază net/brut declarată stau separat; nu se păstrează
// nume de angajatori, contacte sau textul anunțurilor.
import fs from "node:fs";
import path from "node:path";

const OUT = "colectare/baza", MES = `${OUT}/meserii`;
fs.mkdirSync(MES, { recursive: true });
const citesteJsonl = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".jsonl")).flatMap((f) =>
  fs.readFileSync(path.join(dir, f), "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)) : []);

// ─── Catalogul ──────────────────────────────────────────────────────────────
const CORURI = Object.fromEntries([...fs.readFileSync("src/lib/meserii.ts", "utf8").matchAll(/slug: "([^"]+)", nume: "[^"]+".*?cor: "(\d{6})"/g)].map(([, s, c]) => [s, c]));
const MESERII = JSON.parse(fs.readFileSync("src/data/meserii-catalog.json", "utf8")).meserii.map((m) => ({ ...m, cor: Object.hasOwn(CORURI, m.slug) ? CORURI[m.slug] : null }));

// ─── Statistici ─────────────────────────────────────────────────────────────
const P_MIN = 10, D_MIN = 5;
function percentile(sortat, p) { const i = (sortat.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return Math.round(sortat[lo] + (sortat[hi] - sortat[lo]) * (i - lo)); }
function distributie(valori) {
  const v = valori.filter((x) => Number.isFinite(x) && x > 0).sort((a, b) => a - b);
  if (v.length < P_MIN) return { n: v.length };
  return { n: v.length, p10: percentile(v, 0.1), p25: percentile(v, 0.25), median: percentile(v, 0.5), p75: percentile(v, 0.75), p90: percentile(v, 0.9), min: v[0], max: v[v.length - 1] };
}
const mijloc = (o) => (o.min && o.max ? (o.min + o.max) / 2 : o.min || o.max);
function peGrupe(randuri, cheie, valoare) {
  const g = {};
  for (const r of randuri) for (const k of [cheie(r)].flat().filter(Boolean)) (g[k] ??= []).push(valoare(r));
  return Object.fromEntries(Object.entries(g).map(([k, v]) => [k, v.length >= D_MIN ? distributie(v) : { n: v.length }]).sort((a, b) => b[1].n - a[1].n));
}
const frecventa = (randuri, f) => {
  const m = {};
  for (const r of randuri) for (const x of [f(r)].flat().filter((x) => x !== null && x !== undefined && x !== false)) m[x] = (m[x] || 0) + 1;
  return Object.fromEntries(Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, c]) => [k, { n: c, procent: Math.round((1000 * c) / Math.max(1, randuri.length)) / 10 }]));
};

// ─── Sursele ────────────────────────────────────────────────────────────────
const obsContinuu = citesteJsonl("colectare/anunturi/observatii");
const obs8sept = fs.existsSync("public/date/anunturi-verificate.json") ? JSON.parse(fs.readFileSync("public/date/anunturi-verificate.json", "utf8")).observations : [];
const vazut = new Set();
const anunturi = [...obsContinuu.map((o) => ({ ...o, colectare: "continuă" })), ...obs8sept.map((o) => ({ ...o, colectare: "8 septembrie 2026" }))]
  .filter((o) => { const k = o.url || o.id; if (vazut.has(k)) return false; vazut.add(k); return true; });
// Același anunț poate fi citit de două rulări (local și în GitHub Actions): rămâne ultima citire.
const profil = [...new Map(citesteJsonl("colectare/anunturi/profil").map((p) => [p.k, p])).values()];
const anofm = citesteJsonl("colectare/anofm/oferte");
// Numai sursele acceptate de verificare (colectare/art33/raport.json) intră în cifre; celelalte
// („de verificat”: baza ghicită, puține rânduri valide) se numără separat, ca să se vadă ce așteaptă.
const RAPORT_ART33 = fs.existsSync("colectare/art33/raport.json") ? JSON.parse(fs.readFileSync("colectare/art33/raport.json", "utf8")) : {};
const art33Toate = citesteJsonl("colectare/art33/observatii").filter((r) => !r.invalid);
const art33 = art33Toate.filter((r) => RAPORT_ART33[r.sursa]?.stare === "acceptat");

// Salariul minim brut pe lunile anului, pentru „cât din ANOFM e la minim”.
const MINIM = (luna) => (luna >= "2026-07" ? 4325 : luna >= "2025-01" ? 4050 : 3700);

// ─── Fișa unei meserii ──────────────────────────────────────────────────────
const rezumat = [];
for (const m of MESERII) {
  const a = anunturi.filter((o) => o.slug === m.slug);
  const declarate = a.filter((o) => o.basisDeclared);
  const pr = profil.filter((p) => p.meserii.includes(m.slug));
  const prSal = pr.filter((p) => p.salariu?.bazaDeclarata);
  const of = m.cor ? anofm.filter((o) => String(o.cor_name ?? "").startsWith(m.cor)) : [];
  const ofGrupa = m.cor ? anofm.filter((o) => String(o.cor_name ?? "").startsWith(m.cor.slice(0, 4))) : [];
  const st = art33.filter((r) => r.meserie === m.slug);
  const netAnofm = (o) => Number(o.salary_type === "net" ? o.minimum_salary : NaN);

  // Salariul oferit, pe fiecare factor prezent: „cu engleză” față de toate, „cu ture”, „senior”...
  const peFactor = {};
  for (const [nume, f] of Object.entries({
    nivel: (p) => p.atribute.nivel, experienta: (p) => p.atribute.experienta?.cerinta === "ani" ? `${p.atribute.experienta.min}+ ani` : p.atribute.experienta?.cerinta,
    experientaPortal: (p) => p.atribute.experientaPortal,
    studii: (p) => p.atribute.studii, limbi: (p) => p.atribute.limbi, program: (p) => p.atribute.program, mod: (p) => p.atribute.mod,
    beneficii: (p) => p.atribute.beneficii, tehnologii: (p) => p.atribute.tehnologii, permis: (p) => p.atribute.permis, atestate: (p) => p.atribute.atestate,
  })) {
    const g = peGrupe(prSal, f, (p) => mijloc(p.salariu));
    if (Object.keys(g).length) peFactor[nume] = g;
  }

  const fisa = {
    slug: m.slug, nume: m.nume, cor: m.cor, generatLa: new Date().toISOString(),
    anunturi: {
      descriere: "Oferte din anunțuri publice, lei net pe lună (brutul declarat e convertit), mijlocul intervalului publicat.",
      cuSalariu: a.length, cuBazaDeclarata: declarate.length, faraBazaDeclarata: a.length - declarate.length,
      surse: frecventa(a, (o) => o.source), colectari: frecventa(a, (o) => o.colectare),
      net: distributie(declarate.map(mijloc)),
      netMinimOferit: distributie(declarate.map((o) => o.min)), netMaximOferit: distributie(declarate.map((o) => o.max)),
      faraBazaDeclarata_valori: distributie(a.filter((o) => !o.basisDeclared).map(mijloc)),
      peOras: peGrupe(declarate, (o) => (o.city || "").split(/[;,]/)[0].trim() || null, mijloc),
      peJudet: peGrupe(declarate, (o) => o.county || null, mijloc),
      peLuna: frecventa(a, (o) => (o.publishedAt || o.retrievedAt || "").slice(0, 7) || null),
    },
    factori: {
      descriere: "Ce cer și ce oferă anunțurile citite pentru meserie, cu sau fără salariu. Procentul e din anunțurile citite.",
      anunturiCitite: pr.length, cuSalariu: prSal.length,
      nivel: frecventa(pr, (p) => p.atribute.nivel), experienta: frecventa(pr, (p) => p.atribute.experienta?.cerinta === "ani" ? `${p.atribute.experienta.min}+ ani` : p.atribute.experienta?.cerinta),
      experientaPortal: frecventa(pr, (p) => p.atribute.experientaPortal),
      studii: frecventa(pr, (p) => p.atribute.studii), limbi: frecventa(pr, (p) => p.atribute.limbi), permis: frecventa(pr, (p) => p.atribute.permis),
      atestate: frecventa(pr, (p) => p.atribute.atestate), program: frecventa(pr, (p) => p.atribute.program), mod: frecventa(pr, (p) => p.atribute.mod),
      norma: frecventa(pr, (p) => p.atribute.norma), durata: frecventa(pr, (p) => p.atribute.durata), beneficii: frecventa(pr, (p) => p.atribute.beneficii),
      tehnologii: frecventa(pr, (p) => p.atribute.tehnologii), negociabil: frecventa(pr, (p) => p.atribute.negociabil ? "salariu negociabil" : null),
      strainatate: frecventa(pr, (p) => p.atribute.strainatate ? "lucru în străinătate" : null), limbaAnuntului: frecventa(pr, (p) => p.atribute.limbaAnunt),
      surse: frecventa(pr, (p) => p.sursa), peJudet: frecventa(pr, (p) => p.judet), motiveFaraSalariu: frecventa(pr.filter((p) => !p.salariu), (p) => p.motive),
      salariuPeFactor: peFactor,
    },
    anofm: {
      descriere: "Oferte înregistrate la ANOFM cu codul COR exact al meseriei; la ANOFM angajatorii declară adesea salariul minim ca formalitate.",
      oferte: of.length, posturi: of.reduce((s, o) => s + (o.open_positions || 0), 0),
      ofertePeGrupaCor: ofGrupa.length,
      tipSalariu: frecventa(of, (o) => o.salary_type), netMinimDeclarat: distributie(of.map(netAnofm)),
      brutMinimDeclarat: distributie(of.filter((o) => ["brut", "gross"].includes(o.salary_type)).map((o) => Number(o.minimum_salary))),
      laSalariulMinim: of.filter((o) => ["brut", "gross"].includes(o.salary_type) && Number(o.minimum_salary) <= MINIM(String(o.created_at).slice(0, 7))).length,
      studii: frecventa(of, (o) => o.education_level_name), experienta: frecventa(of, (o) => o.professional_experience_name),
      contract: frecventa(of, (o) => o.contract_type_name), norma: frecventa(of, (o) => o.work_type_name), regim: frecventa(of, (o) => o.work_regime_name),
      judete: frecventa(of, (o) => String(o.address_locality_name || "").split(" > ")[0] || null),
      domenii: frecventa(of, (o) => o.job_domain_name), coduriCorInGrupa: frecventa(ofGrupa, (o) => o.cor_name),
    },
    institutiiPublice: {
      descriere: "Salariile publicate de instituțiile publice (art. 33 din Legea 153/2017), un rând pe post; baza brută lunară.",
      posturi: st.length, institutii: new Set(st.map((r) => r.sursa)).size,
      posturiDinSurseDeVerificat: art33Toate.filter((r) => r.meserie === m.slug && RAPORT_ART33[r.sursa]?.stare !== "acceptat").length, judete: frecventa(st, (r) => r.judet),
      tipInstitutie: frecventa(st, (r) => r.tip), perioade: frecventa(st, (r) => r.perioada), studii: frecventa(st, (r) => r.studii),
      bazaBruta: distributie(st.map((r) => r.baza)), bazaCuSporuriFixe: distributie(st.map((r) => r.baza + (r.sporFix || 0))),
      peGradatie: peGrupe(st, (r) => (r.gradatie ?? null) === null ? null : `gradația ${r.gradatie}`, (r) => r.baza + (r.sporFix || 0)),
      peFunctie: peGrupe(st, (r) => r.text?.replace(/\s+/g, " ").slice(0, 60) || null, (r) => r.baza + (r.sporFix || 0)),
    },
  };
  fs.writeFileSync(`${MES}/${m.slug}.json`, JSON.stringify(fisa, null, 1) + "\n");
  rezumat.push({ slug: m.slug, nume: m.nume, anunturiCuSalariu: a.length, cuBazaDeclarata: declarate.length, anunturiCitite: pr.length, anofm: of.length, anofmGrupa: ofGrupa.length, posturiPublice: st.length });
}

rezumat.sort((x, y) => (y.cuBazaDeclarata + y.anofm + y.posturiPublice) - (x.cuBazaDeclarata + x.anofm + x.posturiPublice));
const total = rezumat.reduce((s, r) => ({ anunturi: s.anunturi + r.anunturiCuSalariu, citite: s.citite + r.anunturiCitite, anofm: s.anofm + r.anofm, publice: s.publice + r.posturiPublice }), { anunturi: 0, citite: 0, anofm: 0, publice: 0 });
fs.writeFileSync(`${OUT}/rezumat.json`, JSON.stringify({ generatLa: new Date().toISOString(), total, meserii: rezumat }, null, 1) + "\n");

// ─── SQLite local, pentru interogări ────────────────────────────────────────
try {
  const { DatabaseSync } = await import("node:sqlite");
  fs.mkdirSync(".cercetare-privata", { recursive: true });
  const f = ".cercetare-privata/baza.sqlite";
  if (fs.existsSync(f)) fs.rmSync(f);
  const db = new DatabaseSync(f);
  db.exec(`CREATE TABLE anunturi (meserie TEXT, sursa TEXT, colectare TEXT, net_min REAL, net_max REAL, baza TEXT, baza_declarata INT, oras TEXT, judet TEXT, publicat TEXT, url TEXT);
    CREATE TABLE profil (k TEXT, meserie TEXT, sursa TEXT, judet TEXT, oras TEXT, publicat TEXT, cu_salariu INT, net_min REAL, net_max REAL, nivel TEXT, experienta TEXT, exp_min INT, studii TEXT, limbi TEXT, permis TEXT, atestate TEXT, program TEXT, mod TEXT, norma TEXT, durata TEXT, beneficii TEXT, tehnologii TEXT, negociabil INT, strainatate INT, limba_anunt TEXT);
    CREATE TABLE anofm (meserie TEXT, cor TEXT, tip_salariu TEXT, salariu_min REAL, salariu_max REAL, studii TEXT, experienta TEXT, contract TEXT, norma TEXT, regim TEXT, judet TEXT, posturi INT, creat TEXT);
    CREATE TABLE publice (meserie TEXT, sursa TEXT, judet TEXT, tip TEXT, perioada TEXT, studii TEXT, gradatie INT, functie TEXT, baza REAL, spor_fix REAL, variabil REAL);`);
  const ins = (t, n) => db.prepare(`INSERT INTO ${t} VALUES (${Array(n).fill("?").join(",")})`);
  const i1 = ins("anunturi", 11), i2 = ins("profil", 25), i3 = ins("anofm", 13), i4 = ins("publice", 11);
  const corLaSlug = Object.fromEntries(MESERII.filter((m) => m.cor).map((m) => [m.cor, m.slug]));
  db.exec("BEGIN");
  for (const o of anunturi) i1.run(o.slug ?? null, o.source ?? null, o.colectare, o.min ?? null, o.max ?? null, o.basis ?? null, o.basisDeclared ? 1 : 0, o.city ?? null, o.county ?? null, o.publishedAt ?? null, o.url ?? null);
  for (const p of profil) for (const s of p.meserii) { const x = p.atribute; i2.run(p.k, s, p.sursa, p.judet, p.oras, p.data, p.salariu ? 1 : 0, p.salariu?.min ?? null, p.salariu?.max ?? null, x.nivel, x.experienta?.cerinta ?? null, x.experienta?.min ?? null, x.studii, x.limbi.join("|"), x.permis.join("|"), x.atestate.join("|"), x.program.join("|"), x.mod.join("|"), x.norma, x.durata, x.beneficii.join("|"), x.tehnologii.join("|"), x.negociabil ? 1 : 0, x.strainatate ? 1 : 0, x.limbaAnunt); }
  for (const o of anofm) { const cor = String(o.cor_name ?? "").slice(0, 6); i3.run(corLaSlug[cor] ?? null, cor, o.salary_type, Number(o.minimum_salary) || null, Number(o.maximum_salary) || null, o.education_level_name, o.professional_experience_name, o.contract_type_name, o.work_type_name, o.work_regime_name, String(o.address_locality_name || "").split(" > ")[0], o.open_positions ?? null, o.created_at); }
  for (const r of art33) i4.run(r.meserie, r.sursa, r.judet, r.tip, r.perioada, r.studii, r.gradatie ?? null, r.text, r.baza, r.sporFix || 0, r.variabil || 0);
  db.exec("COMMIT");
  db.close();
  console.log(`SQLite: ${f}`);
} catch (e) { console.log(`SQLite sărit: ${e.message}`); }

console.log(`baza: ${MESERII.length} meserii · ${total.anunturi} anunțuri cu salariu · ${total.citite} profiluri de anunțuri · ${total.anofm} oferte ANOFM pe COR exact · ${total.publice} posturi publice`);
for (const r of rezumat.slice(0, 12)) console.log(`  ${r.slug.padEnd(24)} anunțuri ${String(r.cuBazaDeclarata).padStart(4)}/${String(r.anunturiCuSalariu).padEnd(4)} citite ${String(r.anunturiCitite).padStart(4)}  ANOFM ${String(r.anofm).padStart(4)} (grupă ${r.anofmGrupa})  publice ${r.posturiPublice}`);
