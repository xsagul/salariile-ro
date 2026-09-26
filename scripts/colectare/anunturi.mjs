// Colectarea continuă a anunțurilor cu salariu de pe platforme (OLX, eJobs, BestJobs, Publi24,
// Anuntul.ro, hipo.ro, undelucram.ro). Rulează zilnic din .github/workflows/colectare-anunturi.yml.
//
// Până la această colectare, anunțurile se citeau într-o singură „fotografie” (8 septembrie 2026):
// 26 de anunțuri cu sumă și bază la chelner, 5 la programator. O zi nu adună destule. Aici fiecare
// rulare citește doar anunțurile încă necitite, le adaugă la depozitul din repo și recalculează
// acoperirea pe tot ce s-a adunat, cu vechimea maximă din POLICY.maxAdAgeDays.
//
//   node scripts/colectare/anunturi.mjs --buget-min=300          colectare + acoperire
//   node scripts/colectare/anunturi.mjs --doar-acoperire         doar recalculează din depozit
//
// Depozitul (colectare/anunturi/):
//   vazute.txt              URL-urile deja citite, orice rezultat (nu se mai deschid)
//   observatii/AAAA-LL.jsonl  observațiile acceptate, fără numele angajatorului (cheie hash)
//   citite.json             pe meserie: câte anunțuri s-au citit și câte n-aveau nicio sumă
//   stare.json              pe sursă: când s-a terminat o trecere completă prin inventar
//
// Cifrele de pe site (src/data/acoperire-anunturi.json) se înlocuiesc abia după ce fiecare sursă a
// avut o trecere completă. Până atunci rămâne colectarea din 8 septembrie, ca să nu scadă nimic.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { occupations } from "../crawler/occupations.mjs";
import { deduplicate, summarize } from "../crawler/aggregate.mjs";
import { POLICY } from "../crawler/policy.mjs";

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const DIR = arg("dir", "colectare/anunturi"); // --dir= doar pentru probe locale
const VAZUTE = `${DIR}/vazute.txt`, CITITE = `${DIR}/citite.json`, STARE = `${DIR}/stare.json`, OBS = `${DIR}/observatii`;
const SURSE = ["olx", "ejobs", "bestjobs", "publi24", "anuntul", "hipo", "undelucram"];
fs.mkdirSync(OBS, { recursive: true });
const citeste = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : d);
const cheie = (s) => (s ? crypto.createHash("sha256").update(String(s)).digest("hex").slice(0, 16) : null);

// Ce păstrăm din observație: tot ce cer deduplicarea, pragurile și registrul public, fără numele
// angajatorului (poate fi o persoană fizică) și fără fragmentul de text din anunț.
function curata(o) {
  const { employer, salaryEvidence, salaryFieldEvidence, evidence, employerKey, ...rest } = o;
  const { snippet, ...originalSalary } = rest.originalSalary || {};
  return { ...rest, originalSalary, employerKey: cheie(employerKey), evidenceSha256: evidence?.sha256 ?? o.evidenceSha256 ?? null };
}

function colecteaza() {
  const run = `continuu-${new Date().toISOString().slice(0, 10)}`;
  const root = `.cercetare-privata/crawl-runs/${run}`;
  const r = spawnSync(process.execPath, ["scripts/crawler/census.mjs", `--run=${run}`, `--seen=${VAZUTE}`,
    `--evidence=${root}/evidence`, `--budget-min=${arg("buget-min", "300")}`, ...(arg("surse") ? [`--sources=${arg("surse")}`] : [])], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`colectorul s-a oprit cu codul ${r.status}`);
  const state = JSON.parse(fs.readFileSync(`${root}/state.json`, "utf8"));
  const verified = JSON.parse(fs.readFileSync(`${root}/verified.json`, "utf8"));

  // Observațiile noi, pe luna colectării.
  const luna = new Date().toISOString().slice(0, 7);
  const noi = verified.observations.map(curata);
  if (noi.length) fs.appendFileSync(`${OBS}/${luna}.jsonl`, noi.map((o) => JSON.stringify(o)).join("\n") + "\n");

  // URL-urile citite nu se mai deschid. O eroare trecătoare nu ajunge în results, deci se reîncearcă.
  const citite = Object.keys(state.results);
  if (citite.length) fs.appendFileSync(VAZUTE, citite.join("\n") + "\n");

  const cnt = citeste(CITITE, {});
  for (const res of Object.values(state.results)) {
    for (const slug of res.slugs || (res.slug ? [res.slug] : [])) {
      cnt[slug] ??= { read: 0, withoutSalary: 0 };
      cnt[slug].read++;
      if (!res.accepted && (res.reasons || []).includes("salary_evidence_incomplete")) cnt[slug].withoutSalary++;
    }
  }
  fs.writeFileSync(CITITE, JSON.stringify(cnt, null, 1) + "\n");

  // O sursă are o trecere completă când inventarul e enumerat și niciun candidat nu mai așteaptă.
  const st = citeste(STARE, { surse: {}, rulari: [] });
  for (const s of SURSE) {
    const inv = verified.sourceInventory?.[s], e = state.sources?.[s];
    if (inv?.inventoryEnumerated && !e?.stoppedByBudget && inv.catalogCandidates === inv.catalogChecked) st.surse[s] = { trecereCompletaLa: new Date().toISOString() };
  }
  st.rulari.push({ run, la: new Date().toISOString(), citite: citite.length, acceptate: noi.length, stats: verified.stats });
  st.rulari = st.rulari.slice(-60);
  fs.writeFileSync(STARE, JSON.stringify(st, null, 1) + "\n");
  console.log(`rulare ${run}: ${citite.length} anunțuri citite, ${noi.length} observații noi`);
}

function acoperire() {
  const limita = Date.now() - POLICY.maxAdAgeDays * 86400000;
  const toate = fs.readdirSync(OBS).filter((f) => f.endsWith(".jsonl")).flatMap((f) =>
    fs.readFileSync(path.join(OBS, f), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)));
  const valabile = toate.filter((o) => Date.parse(o.publishedAt || o.retrievedAt) >= limita);
  const records = deduplicate(valabile);
  const cnt = citeste(CITITE, {});
  const coverage = Object.fromEntries(occupations.map((j) => {
    const subset = records.filter((r) => r.slug === j.slug);
    return [j.slug, { name: j.nume, read: cnt[j.slug]?.read ?? 0, withoutSalary: cnt[j.slug]?.withoutSalary ?? 0,
      ...summarize(subset), examples: subset.slice(0, 5).map(({ url, source, min, max }) => ({ url, source, min, max })) }];
  }));
  const st = citeste(STARE, { surse: {}, rulari: [] });
  const complet = SURSE.every((s) => st.surse[s]?.trecereCompletaLa) && !arg("dir");
  const rezultat = { generatedAt: new Date().toISOString(), run: "colectare-continua", policy: POLICY,
    scope: { sources: SURSE, slugs: occupations.map((j) => j.slug), method: "public_source_inventories_accumulated" },
    stats: { observatii: toate.length, valabile: valabile.length, accepted: records.length, surseCuTrecereCompleta: Object.keys(st.surse) },
    sourceInventory: {}, coverage, rejectionCounts: {}, sourceErrors: [] };
  fs.writeFileSync(`${DIR}/acoperire.json`, JSON.stringify(rezultat, null, 1) + "\n");
  const cu = Object.values(coverage).filter((c) => c.status === "advertised_interval").length;
  console.log(`acoperire: ${records.length} observații unice, ${cu} meserii trec pragurile; treceri complete: ${Object.keys(st.surse).join(", ") || "niciuna"}`);
  if (!complet) {
    console.log("încă nu toate sursele au o trecere completă: cifrele de pe site rămân cele din 8 septembrie");
    return;
  }
  fs.writeFileSync("src/data/acoperire-anunturi.json", JSON.stringify(rezultat, null, 2) + "\n");
  const pub = records.map(({ id, adId, url, source, slug, min, max, basis, basisDeclared, salaryEvidenceKind, figureSharedAcrossRoles, publishedAt, retrievedAt, listedAt, activityEvidence, periodEvidence, originalSalary, conversion, netConversion, evidenceSha256, sourceUrls }) => ({
    id, adId, url, source, slug, min, max, unit: "lei net/lună", concept: "salariu oferit", basis, basisDeclared, salaryEvidenceKind,
    figureSharedAcrossRoles: figureSharedAcrossRoles || null, publishedAt, retrievedAt, listedAt, activityEvidence, periodEvidence,
    originalSalary: { min: originalSalary.min, max: originalSalary.max, currency: originalSalary.currency, basis: originalSalary.basis, monthlyExplicit: originalSalary.monthly },
    conversion, netConversion, evidenceSha256, sourceUrls }));
  fs.writeFileSync("public/date/anunturi-verificate.json", JSON.stringify({ generatedAt: rezultat.generatedAt, run: rezultat.run,
    limitations: "Oferte, nu salarii efectiv încasate, adunate continuu din anunțurile publice. Conversiile standard și ipoteza lunară pentru ofertele fără perioadă explicită sunt marcate pe fiecare înregistrare. Eșantionul nu este reprezentativ național.",
    observations: pub }, null, 2) + "\n");
  const rows = ["meserie,anunturi,anunturi_baza_nedeclarata,lunar_explicit,lunar_presupus,angajatori,judete,platforme,status,lipsuri"];
  for (const [slug, a] of Object.entries(coverage)) rows.push([slug, a.n, a.undeclaredBasis.n, a.explicitMonthly, a.assumedMonthly, a.employers, a.counties, Object.keys(a.sourceCounts).length, a.status, a.gaps.join("|")].join(","));
  fs.writeFileSync("public/date/acoperire-anunturi.csv", rows.join("\n") + "\n");
  console.log("cifrele de pe site actualizate din colectarea continuă");
}

if (!process.argv.includes("--doar-acoperire")) colecteaza();
acoperire();
