// scripts/extrage-grile-anexa1.mjs
//
// Extrage din Legea 153/2017, Anexa I, capitolul I:
//   sectiunea 2 — Functiile de conducere, de indrumare si control (director etc.)
//   sectiunea 6 — Salarii de baza pentru functiile didactice auxiliare
//
// Sectiunea 5 (invatamant preuniversitar) are extractorul ei separat,
// `extrage-grila-invatamant.mjs`, scris inaintea acestuia.
//
// Foloseste textul convertit din HTML-ul portalului legislativ. Vezi
// research/lege153-anexa1-invatamant-preuniversitar.txt pentru provenienta.

import fs from "node:fs";
import path from "node:path";

const SP = process.argv[2];
if (!SP) throw new Error("dă calea către folderul cu lege153.txt");
const t = fs.readFileSync(path.join(SP, "lege153.txt"), "utf8");

const lei = (s) => Number(s.replace(/\./g, ""));
const erori = [];

// ─── Sectiunea 2: functii de conducere ──────────────────────────────────────
//
// Format: "N Functia*) NIVEL ian_gradI ian_gradII iun_gradI iun_gradII"
//
// ATENTIE, nota 2 de sub tabel: "Salariile de baza prevazute la gradul I si
// gradul II cuprind sporul de vechime in munca LA NIVEL MAXIM." Deci la
// conducere NU se aplica gradatia — e deja inclusa. Aplicarea ei ar umfla
// rezultatul cu pana la 24,52%.
//
// Nota 1: pentru absolventii de studii superioare de scurta durata, salariile
// se diminueaza cu 20%.

function sectiunea2() {
  const i = t.lastIndexOf("2. Funcțiile de conducere, de îndrumare și control din învățământul preuniversitar");
  if (i < 0) { erori.push("sectiunea 2 negasita"); return []; }
  const bloc = t.slice(i, i + 1400);

  const RE = /^\s*(\d{1,2})\s+(.+?)\s+(S|SSD)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*$/;
  const out = [];
  for (const linie of bloc.split("\n")) {
    const m = linie.match(RE);
    if (!m) continue;
    out.push({
      nr: Number(m[1]),
      functie: m[2].replace(/\*+\)/g, "").replace(/\s+/g, " ").trim(),
      studii: m[3],
      gradI: { ian2024: lei(m[4]), iun2024: lei(m[6]) },
      gradII: { ian2024: lei(m[5]), iun2024: lei(m[7]) },
    });
  }
  return out;
}

// ─── Sectiunea 6: functii didactice auxiliare ───────────────────────────────
//
// Format identic ca structura cu sectiunea 5: un rand deschide functia si are
// numar, restul sunt continuari. Sumele sunt la Gradatia 0, deci AICI gradatia
// se aplica normal.

function sectiunea6() {
  const i = t.lastIndexOf("6. Salarii de bază pentru funcțiile didactice auxiliare");
  if (i < 0) { erori.push("sectiunea 6 negasita"); return []; }
  const dupa = t.slice(i);
  const capat = dupa.search(/\*\)\s*Se utilizeaz|NOTĂ:|NOTE:|Capitolul II/);
  const bloc = dupa.slice(0, capat > 0 ? capat : 26000);

  // Fiecare rand de date se termina cu: NIVEL suma suma.
  // Nivelurile reale din tabel: S, SSD, M, PL/M, M/G.
  const RE_RAND = /^(.*?)\s+([A-ZĂÂÎȘȚ]{1,3}(?:\/[A-ZĂÂÎȘȚ]{1,3})?)\s+([\d.]+)\s+([\d.]+)$/;

  // Treapta/gradul, la finalul partii de text. Vocabularul e mai larg decat pare:
  // "grad I A" (cu spatiu), "gradul II", "treapta IA", plus trepte fara numeral
  // (debutant, stagiar, principal, specialist, practicant) si gradele de
  // cercetare, unde numeralul roman e chiar treapta.
  const RE_TREAPTA = /((?:grad(?:ul)?|treapta)\s+[IVA]+(?:\s+[IVA]+)?|debutant|stagiar|principal|specialist|practicant|(?<=științific\s)[IVX]+)\s*$/i;

  const out = [];
  let nr = null, functie = null;
  for (const brut of bloc.split(String.fromCharCode(10))) {
    const linie = brut.trim();
    let m = linie.match(RE_RAND);
    // Cateva randuri n-au nici nivel de studii, nici treapta — doar numar,
    // denumire si cele doua sume (ex. 36 "Manuitor carte, garderobier").
    if (!m) {
      const f = linie.match(/^(\d{1,3}\s+.+?)\s+([\d.]+)\s+([\d.]+)$/);
      if (!f) continue;
      m = [linie, f[1], "—", f[2], f[3]];
    }

    let rest = m[1].trim();
    const nrM = rest.match(/^(\d{1,3})\s+/);
    if (nrM) { nr = Number(nrM[1]); rest = rest.slice(nrM[0].length); functie = null; }
    rest = rest.replace(/^\*\s*/, "").trim();

    const tM = rest.match(RE_TREAPTA);
    const treapta = tM ? tM[1].replace(/\s+/g, " ").trim() : "—";
    const nume = (tM ? rest.slice(0, rest.length - tM[0].length) : rest).replace(/[;:,]\s*$/, "").replace(/\s+/g, " ").trim();

    if (nume) functie = nume;
    if (nr === null || !functie) continue;

    out.push({ nr, functie, treapta, studii: m[2], ian2024: lei(m[3]), iun2024: lei(m[4]) });
  }
  return out;
}

// ─── Validari ───────────────────────────────────────────────────────────────

const s2 = sectiunea2();
const s6 = sectiunea6();

if (s2.length === 0) erori.push("sectiunea 2: zero randuri");
if (s6.length < 250) erori.push(`sectiunea 6: doar ${s6.length} randuri, pare trunchiata`);

for (const r of s2) {
  if (!(r.gradII.iun2024 >= r.gradI.iun2024)) erori.push(`s2 #${r.nr}: gradul II (${r.gradII.iun2024}) sub gradul I (${r.gradI.iun2024})`);
  if (!(r.gradI.iun2024 > r.gradI.ian2024)) erori.push(`s2 #${r.nr}: iunie nu e peste ianuarie`);
  for (const v of [r.gradI.iun2024, r.gradII.iun2024]) {
    if (v < 8000 || v > 20000) erori.push(`s2 #${r.nr}: valoare implauzibila ${v}`);
  }
}

for (const r of s6) {
  if (r.iun2024 < r.ian2024) erori.push(`s6 #${r.nr} ${r.treapta}: iunie (${r.iun2024}) SUB ianuarie (${r.ian2024})`);
  if (r.iun2024 < 3000 || r.iun2024 > 12000) erori.push(`s6 #${r.nr} ${r.treapta}: valoare implauzibila ${r.iun2024}`);
}

const functii6 = [...new Set(s6.map((r) => r.nr))];
const lipsa = [];
for (let i = 1; i <= Math.max(...functii6); i++) if (!functii6.includes(i)) lipsa.push(i);
if (lipsa.length) erori.push(`s6: lipsesc functiile ${lipsa.join(", ")}`);

// ─── Raport ─────────────────────────────────────────────────────────────────

console.log(`Secțiunea 2 (conducere):        ${s2.length} funcții`);
s2.forEach((r) => console.log(`   ${String(r.nr).padStart(2)}. ${r.functie.slice(0, 52).padEnd(54)} gr.I ${String(r.gradI.iun2024).padStart(6)}  gr.II ${String(r.gradII.iun2024).padStart(6)}`));

console.log(`\nSecțiunea 6 (didactic auxiliar): ${s6.length} rânduri, ${functii6.length} funcții`);
const grup = new Map();
for (const r of s6) if (!grup.has(r.nr)) grup.set(r.nr, r);
[...grup.values()].slice(0, 12).forEach((r) => console.log(`   ${String(r.nr).padStart(2)}. ${r.functie.slice(0, 58).padEnd(60)} ${r.studii}`));
if (functii6.length > 12) console.log(`   … și încă ${functii6.length - 12}`);

console.log(`\nInterval salarii s6: ${Math.min(...s6.map((r) => r.iun2024))} – ${Math.max(...s6.map((r) => r.iun2024))} lei`);
console.log(`\nERORI: ${erori.length}`);
erori.slice(0, 12).forEach((e) => console.log("  ✗ " + e));

fs.writeFileSync(path.join(SP, "anexa1-s2-s6.json"), JSON.stringify({ conducere: s2, auxiliar: s6 }, null, 1));
console.log(`\n→ anexa1-s2-s6.json`);
