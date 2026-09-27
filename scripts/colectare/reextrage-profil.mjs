// Reface profilurile de anunțuri (colectare/anunturi/profil/) din paginile deja descărcate, fără
// nicio cerere nouă. Se rulează după o reparație a extragerii (scripts/crawler/extract.mjs,
// atribute.mjs, occupations.mjs), ca factorii vechi, citiți greșit, să nu rămână în bază.
//
//   node scripts/colectare/reextrage-profil.mjs      toate rulările din .cercetare-privata/crawl-runs
//
// Profilul păstrează doar factorii, locul, data și salariul acceptat. Fără text, titlu sau angajator.
import fs from "node:fs";
import crypto from "node:crypto";
import { detailRecord } from "../crawler/extract.mjs";
import { atributeAnunt } from "../crawler/atribute.mjs";
import { classifyAll } from "../crawler/occupations.mjs";

const RUNS = ".cercetare-privata/crawl-runs", PROFIL = "colectare/anunturi/profil";
const cheie = (s) => crypto.createHash("sha256").update(String(s)).digest("hex").slice(0, 16);
fs.mkdirSync(PROFIL, { recursive: true });

const peLuna = {};
let citite = 0, fara = 0, schimbateMeserii = 0;
const vazute = new Set();
for (const run of fs.readdirSync(RUNS).filter((r) => fs.existsSync(`${RUNS}/${r}/state.json`)).sort().reverse()) {
  const state = JSON.parse(fs.readFileSync(`${RUNS}/${run}/state.json`, "utf8"));
  const ev = `${RUNS}/${run}/evidence`;
  const fisiere = fs.existsSync(ev) ? Object.fromEntries(fs.readdirSync(ev).filter((f) => f.endsWith(".json") && !f.startsWith("pause"))
    .map((f) => { try { return [JSON.parse(fs.readFileSync(`${ev}/${f}`, "utf8")).url, `${ev}/${f}`]; } catch { return [null, null]; } })) : {};
  const luna = (run.match(/(\d{4}-\d{2})-\d{2}/) || [])[1] || new Date().toISOString().slice(0, 7);
  for (const [url, res] of Object.entries(state.results || {})) {
    if (vazute.has(url)) continue;
    const f = fisiere[url] || fisiere[res.raw?.url];
    let raw = res.raw || null;
    if (f && fs.existsSync(f.replace(/\.json$/, ".html"))) {
      try { raw = detailRecord({ ...JSON.parse(fs.readFileSync(f, "utf8")), html: fs.readFileSync(f.replace(/\.json$/, ".html"), "utf8") }, res.source) || raw; } catch { /* rămâne cel vechi */ }
    }
    if (!raw) { fara++; continue; }
    // Meseriile se recitesc din titlu cu clasificatorul curent: o potrivire greșită reparată iese.
    const vechi = res.slugs || (res.slug ? [res.slug] : []);
    const meserii = raw.title ? classifyAll(raw.title).slugs : vechi;
    if (JSON.stringify(meserii) !== JSON.stringify(vechi)) schimbateMeserii++;
    if (!meserii.length) continue;
    vazute.add(url);
    citite++;
    const o = res.accepted ? res.observation : null;
    (peLuna[luna] ??= []).push({
      k: cheie(url), sursa: res.source, meserii, data: raw.date || null,
      judet: raw.county || null, oras: (raw.city || "").slice(0, 60) || null, contract: raw.contract || null,
      salariu: o && meserii.includes(o.slug) ? { min: o.min, max: o.max, baza: o.basis, bazaDeclarata: o.basisDeclared } : null,
      motive: res.accepted ? [] : (res.reasons || []).slice(0, 4),
      atribute: atributeAnunt(raw),
    });
  }
}
// Rândurile refăcute le înlocuiesc pe cele vechi cu aceeași cheie; restul (rulări ale căror pagini
// nu mai sunt pe disc, de exemplu cele din GitHub Actions) rămân neatinse.
for (const [luna, randuri] of Object.entries(peLuna)) {
  const f = `${PROFIL}/${luna}.jsonl`, noi = new Set(randuri.map((p) => p.k));
  const pastrate = fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).filter((l) => !noi.has(JSON.parse(l).k)) : [];
  fs.writeFileSync(f, [...pastrate, ...randuri.map((p) => JSON.stringify(p))].join("\n") + "\n");
}
console.log(`profiluri refăcute: ${citite} anunțuri (${fara} fără pagină citită), ${schimbateMeserii} cu meseria corectată; luni: ${Object.keys(peLuna).join(", ")}`);
