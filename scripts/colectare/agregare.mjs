// Salariul-concluzie pe meserie: toate sursele, fiecare măsurată corect, apoi o concluzie
// prin triangulare — nu prin medie ponderată între surse (CLAUDE.md: pilonii nu se topesc
// într-o cifră fără sursă). Decizia proprietarului, 26 septembrie 2026.
//
//   npx tsx scripts/colectare/agregare.mjs [--out=colectare/agregat/meserii.json]
//
// Surse:
//   plătit    — listele art. 33 L153/2017 (colectare/art33/observatii), fișiere acceptate
//   declarat  — ofertele ANOFM (colectare/anofm/oferte), pe codul COR al meseriei
//   oferit    — anunțurile verificate (src/data/acoperire-anunturi.json)
// Concluzia: prima sursă, în ordinea plătit → oferit → declarat, care trece pragurile;
// celelalte o verifică (diferența procentuală față de concluzie).
import fs from "node:fs";
import path from "node:path";

const fiscal = await import("../../src/lib/fiscal.ts");
// Rulează cu tsx (aliasurile @/ din grile-publice.ts): npx tsx scripts/colectare/agregare.mjs
const { grilaPublica } = await import("../../src/lib/grile-publice.ts");

export const PRAGURI = {
  platit: { institutii: 5, judete: 3, randuri: 50, vechimeLuniMax: 18 },
  platitJudet: { randuri: 30, institutii: 1 },
  platitGradatie: { randuri: 30, institutii: 3 },
  declarat: { oferte: 30, angajatori: 10, laMinimMax: 0.25 }, // peste un sfert la minim, minimul declarat e formalitate, nu salariu
  // Anunțurile au pragurile lor în scripts/crawler/policy.mjs; aici doar citim statusul.
};

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const OUT = arg("out", "colectare/agregat/meserii.json");
const AZI = new Date().toISOString().slice(0, 7);

const luniIntre = (a, b) => (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + Number(b.slice(5, 7)) - Number(a.slice(5, 7));
const regim = (perioada) => fiscal.regimPentruLuna(Number(perioada.slice(0, 4)), Number(perioada.slice(5, 7))) ?? fiscal.REGIM_FISCAL_CURENT;
const net = (brut, perioada) => fiscal.calculStandardCuRegim(Math.round(brut), regim(perioada))?.netBani ?? null;
const rot = (x) => (x === null || x === undefined ? null : Math.round(x));

/** Cuantila ponderată Q(p) = inf{x : F(x) ≥ p}. */
function cuantila(val, p) {
  const s = [...val].sort((a, b) => a.v - b.v);
  const total = s.reduce((t, x) => t + x.w, 0);
  let cum = 0;
  for (const x of s) { cum += x.w; if (cum / total >= p - 1e-12) return x.v; }
  return s.length ? s[s.length - 1].v : null;
}

/** Fiecare instituție cântărește la fel: un spital mare nu domină mediana. */
function distributie(randuri, cheie) {
  const peInst = {};
  for (const r of randuri) peInst[r.sursa] = (peInst[r.sursa] ?? 0) + 1;
  const val = randuri.map((r) => ({ v: cheie(r), w: 1 / peInst[r.sursa] })).filter((x) => x.v !== null);
  if (!val.length) return null;
  return { p25: rot(cuantila(val, 0.25)), mediana: rot(cuantila(val, 0.5)), p75: rot(cuantila(val, 0.75)) };
}

// ── Plătit: art. 33 ─────────────────────────────────────────────────────────
const raport = JSON.parse(fs.readFileSync("colectare/art33/raport.json", "utf8"));
const reg = JSON.parse(fs.readFileSync("colectare/art33/surse.json", "utf8"));
const numeSursa = Object.fromEntries(reg.surse.map((s) => [s.id, s.institutie]));
// Un post cu normă întreagă nu are baza sub cea mai mică treaptă legală a funcției (gradația
// 0) și nici sub salariul minim. Rândurile de sub prag sunt contracte de gardă ale medicilor
// („MEDIC PRIMAR 7.020” cu 9.195 lei gărzi, Miercurea Ciuc) sau normă parțială: se numără
// separat și nu intră în salariul fix (26 septembrie 2026).
const minimPerioada = (p) => (p < "2026-07" ? (p < "2024-07" ? 3300 : p < "2025-01" ? 3700 : 4050) : 4325);
const pragBaza = (slug, perioada) => {
  const g = grilaPublica(slug);
  const trepte = g && !g.doarSectiune ? g.trepte.map((t) => t.brut).filter((x) => x > 0) : [];
  return Math.max(0.95 * minimPerioada(perioada), trepte.length ? 0.97 * Math.min(...trepte) : 0);
};
const subPrag = {};
const obs = [];
for (const f of fs.readdirSync("colectare/art33/observatii").filter((f) => f.endsWith(".jsonl"))) {
  const id = f.replace(/\.jsonl$/, "");
  if (raport[id]?.stare !== "acceptat") continue;
  for (const l of fs.readFileSync(path.join("colectare/art33/observatii", f), "utf8").split("\n")) {
    if (!l.trim()) continue;
    const o = JSON.parse(l);
    if (o.invalid || !o.perioada || luniIntre(o.perioada, AZI) > PRAGURI.platit.vechimeLuniMax) continue;
    if (o.baza < pragBaza(o.meserie, o.perioada)) { subPrag[o.meserie] = (subPrag[o.meserie] ?? 0) + 1; continue; }
    const brutFix = o.baza + o.sporFix;
    // Gradația = vechimea în muncă (0: sub 3 ani … 5: peste 20). Din câmpul citit sau din text
    // („Gradatia 4”); „BAZA” în locul gradației (Alba) înseamnă gradația 0.
    const gt = /grada[tț]ia\s*(\d)/i.exec(o.text) ?? /\bgr\.?\s*([0-5])\b/i.exec(o.text);
    const gradatie = o.gradatie ?? (gt ? Number(gt[1]) : /\bBAZA\b/.test(o.text) ? 0 : null);
    obs.push({ ...o, gradatie, brutFix, netFix: net(brutFix, o.perioada), netBaza: net(o.baza, o.perioada),
      netCuVariabil: net(brutFix + o.variabil, o.perioada), debutant: /DEBUTANT/i.test(o.text) });
  }
}

function platit(slug) {
  const r = obs.filter((o) => o.meserie === slug);
  if (!r.length) return null;
  const institutii = new Set(r.map((o) => o.sursa));
  const judete = new Set(r.map((o) => o.judet));
  const peJudet = {};
  for (const j of judete) {
    const rj = r.filter((o) => o.judet === j);
    if (rj.length >= PRAGURI.platitJudet.randuri) peJudet[j] = { randuri: rj.length, institutii: new Set(rj.map((o) => o.sursa)).size, net: distributie(rj, (o) => o.netFix) };
  }
  const peStudii = {};
  for (const s of ["S", "SSD", "PL", "M"]) {
    const rs = r.filter((o) => o.studii === s);
    if (rs.length >= 20) peStudii[s] = { randuri: rs.length, net: distributie(rs, (o) => o.netFix) };
  }
  // Pe vechime: fiecare gradație cu cel puțin 30 de posturi din 3 instituții.
  const peGradatie = {};
  for (let g = 0; g <= 5; g++) {
    const rg = r.filter((o) => o.gradatie === g);
    const inst = new Set(rg.map((o) => o.sursa)).size;
    if (rg.length >= PRAGURI.platitGradatie.randuri && inst >= PRAGURI.platitGradatie.institutii) peGradatie[g] = { randuri: rg.length, institutii: inst, net: distributie(rg, (o) => o.netFix) };
  }
  const deb = r.filter((o) => o.debutant);
  const cuVar = r.filter((o) => o.variabil > 0);
  const trece = institutii.size >= PRAGURI.platit.institutii && judete.size >= PRAGURI.platit.judete && r.length >= PRAGURI.platit.randuri;
  return {
    randuri: r.length, subPragExclus: subPrag[slug] ?? 0, institutii: institutii.size, judete: judete.size, trece,
    perioade: [...new Set(r.map((o) => o.perioada))].sort(),
    surse: [...institutii].map((id) => numeSursa[id] ?? id),
    netFix: distributie(r, (o) => o.netFix), brutFix: distributie(r, (o) => o.brutFix), netBaza: distributie(r, (o) => o.netBaza),
    debutant: deb.length >= 10 ? { randuri: deb.length, net: distributie(deb, (o) => o.netFix) } : null,
    variabil: cuVar.length >= 20 ? { cota: Math.round((100 * cuVar.length) / r.length) / 100, netCuVariabil: distributie(cuVar, (o) => o.netCuVariabil) } : null,
    peJudet, peStudii, peGradatie,
  };
}

// ── Declarat: ANOFM ─────────────────────────────────────────────────────────
const oferte = new Map();
for (const f of fs.readdirSync("colectare/anofm/oferte").filter((f) => f.endsWith(".jsonl"))) {
  for (const l of fs.readFileSync(path.join("colectare/anofm/oferte", f), "utf8").split("\n")) if (l.trim()) { const o = JSON.parse(l); oferte.set(o.id, o); }
}
const meserii = [...fs.readFileSync("src/lib/meserii.ts", "utf8").matchAll(/slug: "([^"]+)", nume: "([^"]+)".*?cor: "(\d{6})"/g)].map(([, slug, nume, cor]) => ({ slug, nume, cor }));
const corComun = {};
for (const m of meserii) corComun[m.cor] = (corComun[m.cor] ?? 0) + 1;
const minimLa = (zi) => (zi < "2026-07-01" ? 4050 : 4325);

function declarat(m) {
  if (!m?.cor) return null;
  const lot = [...oferte.values()].filter((o) => String(o.cor_name ?? "").startsWith(m.cor));
  const brut = lot.filter((o) => o.salary_type === "gross" && o.work_type_name === "Cu normă întreagă" && Number(o.minimum_salary) >= minimLa(o.created_at) / 2);
  if (!brut.length) return { oferte: lot.length, brutNormaIntreaga: 0 };
  const angajatori = new Set(brut.map((o) => o.employer_tax_code ?? `pf-${o.id}`)).size;
  const laMinim = brut.filter((o) => Number(o.minimum_salary) === minimLa(o.created_at)).length / brut.length;
  const val = brut.map((o) => ({ v: net(Number(o.minimum_salary), o.created_at.slice(0, 7)), w: 1 }));
  const comun = corComun[m.cor] > 1;
  return {
    oferte: lot.length, brutNormaIntreaga: brut.length, angajatori, judete: new Set(brut.map((o) => o.county_id)).size,
    laMinim: Math.round(laMinim * 100) / 100, codComun: comun,
    netMinimDeclarat: { p25: rot(cuantila(val, 0.25)), mediana: rot(cuantila(val, 0.5)), p75: rot(cuantila(val, 0.75)) },
    trece: !comun && brut.length >= PRAGURI.declarat.oferte && angajatori >= PRAGURI.declarat.angajatori && laMinim <= PRAGURI.declarat.laMinimMax,
  };
}

// ── Oferit: anunțuri ────────────────────────────────────────────────────────
const anunturi = JSON.parse(fs.readFileSync("src/data/acoperire-anunturi.json", "utf8")).coverage;
function oferit(slug) {
  const a = anunturi[slug];
  if (!a) return null;
  return { anunturi: a.n, angajatori: a.employers, judete: a.counties, status: a.status,
    netCentral: rot(a.midpointEstimate ?? a.centralEstimate ?? null), trece: Boolean(a.medianBounds && a.midpointEstimate !== null) };
}

// ── Concluzia ───────────────────────────────────────────────────────────────
const dif = (x, ref) => (x && ref ? Math.round((100 * (x - ref)) / ref) : null);
const rezultat = [];
for (const m of meserii) {
  const P = platit(m.slug), O = oferit(m.slug), D = declarat(m);
  let concluzie = null;
  if (P?.trece) concluzie = { sursa: "platit", net: P.netFix.mediana, interval: [P.netFix.p25, P.netFix.p75], ce: "salariul fix plătit la angajatorii publici (bază + sporuri permanente, fără ture și gărzi)" };
  else if (O?.trece) concluzie = { sursa: "oferit", net: O.netCentral, interval: null, ce: "salariul oferit la angajare în anunțurile verificate" };
  else if (D?.trece) concluzie = { sursa: "declarat", net: D.netMinimDeclarat.mediana, interval: [D.netMinimDeclarat.p25, D.netMinimDeclarat.p75], ce: "salariul minim declarat în ofertele oficiale ANOFM" };
  if (concluzie) {
    concluzie.verificare = {
      platit: concluzie.sursa !== "platit" && P?.netFix ? { net: P.netFix.mediana, diferenta: dif(P.netFix.mediana, concluzie.net), trece: P.trece } : null,
      oferit: concluzie.sursa !== "oferit" && O?.netCentral ? { net: O.netCentral, diferenta: dif(O.netCentral, concluzie.net), trece: O.trece } : null,
      declarat: concluzie.sursa !== "declarat" && D?.netMinimDeclarat ? { net: D.netMinimDeclarat.mediana, diferenta: dif(D.netMinimDeclarat.mediana, concluzie.net), laMinim: D.laMinim, trece: D.trece } : null,
    };
  }
  rezultat.push({ slug: m.slug, nume: m.nume, cor: m.cor, concluzie, platit: P, oferit: O, declarat: D });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatLa: new Date().toISOString(), praguri: PRAGURI, observatiiPlatite: obs.length, oferteAnofm: oferte.size, meserii: rezultat }, null, 1));
const cu = rezultat.filter((r) => r.concluzie);
console.log(`${cu.length} din ${rezultat.length} meserii au concluzie: plătit ${cu.filter((r) => r.concluzie.sursa === "platit").length}, oferit ${cu.filter((r) => r.concluzie.sursa === "oferit").length}, declarat ${cu.filter((r) => r.concluzie.sursa === "declarat").length}`);
for (const r of cu) {
  const c = r.concluzie, v = c.verificare;
  const ver = Object.entries(v).filter(([, x]) => x).map(([k, x]) => `${k} ${x.net} (${x.diferenta > 0 ? "+" : ""}${x.diferenta}%)`).join(", ");
  console.log(`${r.nume.padEnd(26)} ${String(c.net).padStart(6)} net [${c.sursa}]${c.interval ? ` ${c.interval[0]}–${c.interval[1]}` : ""} | ${ver}`);
}
