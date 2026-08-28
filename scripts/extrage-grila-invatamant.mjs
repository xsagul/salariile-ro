import fs from "node:fs";
import path from "node:path";

const SP = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const t = fs.readFileSync(path.join(SP, "lege153.txt"), "utf8");

// Delimitează secțiunea „5. Salarii de bază învățământ preuniversitar”
const start = t.indexOf("5. Salarii de bază învățământ preuniversitar");
if (start < 0) throw new Error("nu găsesc antetul secțiunii de preuniversitar");
// se termină la nota de subsol de după tabel
const dupa = t.slice(start);
const endRel = dupa.search(/\*\)\s*Funcțiile se ocupă|NOTĂ:|NOTE:/);
const sectiune = dupa.slice(0, endRel > 0 ? endRel : 20000);

const linii = sectiune.split("\n").map((l) => l.trim()).filter(Boolean);

const lei = (s) => Number(s.replace(/\./g, ""));

// rând care începe o funcție nouă: "12 Denumire... NIVEL VECHIME x.xxx y.yyy"
const RE_NOU = /^(\d{1,2})\s+(.+?)\s+(S|SSD|M|PL|SD)\s+(peste 25 ani|\d+-\d+ ani|pana la 1 an|până la 1 an|până la 3 ani)\s+([\d.]+)\s+([\d.]+)$/;
// rând de continuare: "NIVEL VECHIME x.xxx y.yyy"
const RE_CONT = /^(S|SSD|M|PL|SD)\s+(peste 25 ani|\d+-\d+ ani|pana la 1 an|până la 1 an|până la 3 ani)\s+([\d.]+)\s+([\d.]+)$/;

const grila = [];
let functieCurenta = null, nrCurent = null;

for (const l of linii) {
  let m = l.match(RE_NOU);
  if (m) {
    nrCurent = Number(m[1]);
    functieCurenta = m[2].replace(/\s+/g, " ").trim();
    grila.push({ nr: nrCurent, functie: functieCurenta, studii: m[3], vechime: m[4].replace("pana", "până"), ian2024: lei(m[5]), iun2024: lei(m[6]) });
    continue;
  }
  m = l.match(RE_CONT);
  if (m && functieCurenta) {
    grila.push({ nr: nrCurent, functie: functieCurenta, studii: m[1], vechime: m[2].replace("pana", "până"), ian2024: lei(m[3]), iun2024: lei(m[4]) });
  }
}

// ─── validări ───────────────────────────────────────────────────────────────
const erori = [];
const functii = [...new Set(grila.map((g) => g.nr))].sort((a, b) => a - b);

if (functii.length !== 21) erori.push(`Aștept 21 de funcții, am ${functii.length}: ${functii.join(",")}`);
for (let i = 1; i <= 21; i++) if (!functii.includes(i)) erori.push(`lipsește funcția nr. ${i}`);

for (const g of grila) {
  if (!(g.iun2024 > g.ian2024)) erori.push(`${g.nr} ${g.studii} ${g.vechime}: iunie (${g.iun2024}) nu e peste ianuarie (${g.ian2024})`);
  if (g.iun2024 < 4000 || g.iun2024 > 20000) erori.push(`${g.nr} ${g.studii} ${g.vechime}: valoare implauzibilă ${g.iun2024}`);
}

console.log(`Rânduri extrase: ${grila.length}`);
console.log(`Funcții distincte: ${functii.length} (nr. ${Math.min(...functii)}–${Math.max(...functii)})`);
console.log(`Interval salarii iunie 2024: ${Math.min(...grila.map((g) => g.iun2024)).toLocaleString("ro-RO")} – ${Math.max(...grila.map((g) => g.iun2024)).toLocaleString("ro-RO")} lei`);
console.log(`Creștere medie ian→iun 2024: ${((grila.reduce((s, g) => s + g.iun2024 / g.ian2024, 0) / grila.length - 1) * 100).toFixed(2)}%`);

console.log(`\nERORI: ${erori.length}`);
erori.slice(0, 10).forEach((e) => console.log("  ✗ " + e));

console.log("\nFuncțiile, cu numărul de tranșe:");
for (const n of functii) {
  const r = grila.filter((g) => g.nr === n);
  console.log(`  ${String(n).padStart(2)}. ${String(r.length).padStart(2)} tranșe · ${r[0].studii.padEnd(3)} · ${r[0].functie.slice(0, 78)}`);
}

fs.writeFileSync(path.join(SP, "grila-invatamant.json"), JSON.stringify(grila, null, 1));
console.log(`\n→ grila-invatamant.json (${grila.length} rânduri)`);
