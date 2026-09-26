// Salariile publicate direct de angajatorii mari pe site-urile lor de cariere.
//
// Kaufland și Lidl (grupul Schwarz) folosesc aceeași platformă, cu un API public de căutare
// (/api/v1/search) care dă, pe fiecare anunț, salariul într-un câmp structurat
// („5500 lei brut”), norma, orele și orașul cu coordonate. Decizia de colectare continuă:
// CLAUDE.md, 26 septembrie 2026.
//
//   node scripts/colectare/angajatori.mjs [--dir=colectare/angajatori] [--zi=AAAA-LL-ZZ]
//
// Pentru fiecare site: oferte/AAAA-LL.jsonl (fiecare anunț o singură dată, la prima apariție),
// active/AAAA-LL-ZZ.json și index.json (ID → [prima zi, ultima zi]).
import fs from "node:fs";
import path from "node:path";

const SITE = {
  kaufland: "https://cariere.kaufland.ro",
  lidl: "https://cariere.lidl.ro",
};
const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const DIR = arg("dir", "colectare/angajatori");
const ZI = arg("zi", new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Bucharest" }));

const text = (html) => String(html ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#13;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

/** Salariul dintr-un text: sume în lei și baza (brut / net / null), cu fraza sursă. */
export function salariuDin(s) {
  const t = String(s ?? "");
  const m = t.match(/([^.;•]*?(\d{1,2}[.\s]?\d{3})(?:\s*[-–]\s*(\d{1,2}[.\s]?\d{3}))?\s*(?:lei|ron)[^.;•]*)/i);
  if (!m) return null;
  const nr = (x) => (x ? Number(x.replace(/[.\s]/g, "")) : null);
  const fraza = m[1].trim();
  const baza = /\bbrut/i.test(fraza) ? "brut" : /\bnet\b|în mână/i.test(fraza) ? "net" : null;
  return { min: nr(m[2]), max: nr(m[3]) ?? nr(m[2]), baza, fraza: fraza.slice(0, 200) };
}

/**
 * Lidl scrie separat „Venit mediu brut lunar de 7300 RON … (include salariu brut, tichete de
 * masă, bonusuri și sporuri)”: venitul total, alt concept decât salariul din câmpul structurat
 * („5300 RON”, fără bază). Se păstrează separat; nu se amestecă cu salariile de bază.
 */
export function venitMediu(t) {
  const m = String(t ?? "").match(/venit(?:ul)? mediu brut(?: lunar)? de\s*(\d{1,2}[.\s]?\d{3})\s*(?:ron|lei)/i);
  return m ? Number(m[1].replace(/[.\s]/g, "")) : null;
}

async function toate(baza) {
  const out = [];
  for (let p = 1; ; p++) {
    const general = encodeURIComponent(JSON.stringify({ page: p, results_per_page: 100, sort_field: "", sort_order: "asc" }));
    const r = await fetch(`${baza}/api/v1/search?locales=ro-RO&general=${general}`, { headers: { "user-agent": "salariile.ro colectare (https://salariile.ro/metodologie)" }, signal: AbortSignal.timeout(60_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    out.push(...d.jobs);
    if (out.length >= d.meta.totalCount || !d.jobs.length) return { jobs: out, total: d.meta.totalCount };
    await new Promise((res) => setTimeout(res, 1500));
  }
}

async function main() {
  for (const [site, baza] of Object.entries(SITE)) {
    const dir = path.join(DIR, site);
    fs.mkdirSync(path.join(dir, "oferte"), { recursive: true });
    fs.mkdirSync(path.join(dir, "active"), { recursive: true });
    const fisIndex = path.join(dir, "index.json");
    const index = fs.existsSync(fisIndex) ? JSON.parse(fs.readFileSync(fisIndex, "utf8")) : {};
    const { jobs, total } = await toate(baza);
    if (jobs.length < total * 0.9) throw new Error(`${site}: colectare incompletă (${jobs.length} din ${total})`);
    const noi = [];
    for (const j of jobs) {
      const id = String(j.postingId ?? j.requisitionId);
      if (!index[id]) {
        const s = salariuDin(j.salaryValue) ?? salariuDin(j.salaryNote) ?? salariuDin(text(j.descResponsibilities));
        noi.push({
          id, titlu: j.title, oras: j.location?.city ?? null, judet: j.location?.state || null, cod: j.location?.zipCode ?? null,
          lat: j.location?.latitude ?? null, lon: j.location?.longitude ?? null,
          norma: j.contractType ?? j.categories?.contract_type?.value ?? null, ore: j.workingHours ?? null,
          durata: j.categories?.contract_duration?.value ?? null, nivel: j.entryLevel ?? j.categories?.entry_level?.value ?? null,
          sablon: j.categories?.job_template?.value ?? j.categories?.bulk_template?.value ?? null,
          salariuCamp: j.salaryValue || null, salariu: s, venitMediuBrut: venitMediu(text(j.descResponsibilities)),
          online: j.onlineFrom ?? null, url: j.jobDetailUrl ?? null,
        });
      }
      index[id] = [index[id]?.[0] ?? ZI, ZI];
    }
    if (noi.length) fs.appendFileSync(path.join(dir, "oferte", `${ZI.slice(0, 7)}.jsonl`), noi.map((o) => JSON.stringify(o)).join("\n") + "\n");
    fs.writeFileSync(path.join(dir, "active", `${ZI}.json`), JSON.stringify({ zi: ZI, total, ids: jobs.map((j) => String(j.postingId ?? j.requisitionId)).sort() }));
    fs.writeFileSync(fisIndex, JSON.stringify(index));
    console.log(`${site} ${ZI}: ${jobs.length} anunțuri active, ${noi.length} noi, ${noi.filter((o) => o.salariu).length} cu salariu`);
  }
}

if (process.argv[1]?.endsWith("angajatori.mjs")) main().catch((e) => { console.error(e); process.exit(1); });
