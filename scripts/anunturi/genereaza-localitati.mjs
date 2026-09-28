// Localitățile (SIRUTA, INS) și străzile (OpenStreetMap) pentru sugestiile din formularul anunțurilor.
//
// Localitățile vin din SIRUTA, lista oficială: toate satele, cu comuna și județul lor, cu numele
// scrise corect, fiindcă numele localității devine adresa listei (/locuri-de-munca/{oraș}). Străzile
// nu există la INS; vin din OpenStreetMap (scripts/anunturi/strazi-osm.mjs), legate de oraș/comună
// prin nume, în același județ (relațiile OSM nu au codul SIRUTA).
//
// Rulare: node scripts/anunturi/genereaza-localitati.mjs
// Ieșire: public/date/anunturi/localitati.json   [nume, județ, comuna (la sate), rang]; cheia străzilor
//         e cheieUat() din src/lib/anunturi/localitati.ts: comuna, altfel numele; la București, „bucuresti”
//         public/date/anunturi/strazi/{JUDEȚ}.json  { cheie UAT: [străzi] }
import fs from "node:fs";

const SIRUTA = "research/siruta/siruta_s1_2026.csv";
const OSM = "research/strazi-osm";
const IESIRE = "public/date/anunturi";

const faraDiacritice = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const virgula = (s) => s.replace(/Ş/g, "Ș").replace(/ş/g, "ș").replace(/Ţ/g, "Ț").replace(/ţ/g, "ț");
const MICI = new Set(["de", "din", "pe", "la", "lui", "cu", "sub", "peste", "lângă", "și", "după", "dintre"]);
const titlu = (s) => virgula(s).toLowerCase().split(" ").map((c, i) =>
  i > 0 && MICI.has(c) ? c : c.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("-")).join(" ");
// „î” și „â” dau aceeași cheie: SIRUTA mai are ortografia veche („Rîșca”), OSM pe cea nouă.
const cheie = (s) => faraDiacritice(s.replace(/î/gi, "a")).replace(/^(municipiul|orasul|oras|comuna)\s+/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Județele: numele din SIRUTA → codul auto folosit de anunțuri (reguli.ts).
const COD = { alba: "AB", arad: "AR", arges: "AG", bacau: "BC", bihor: "BH", "bistrita-nasaud": "BN", botosani: "BT", brasov: "BV",
  braila: "BR", bucuresti: "B", buzau: "BZ", "caras-severin": "CS", calarasi: "CL", cluj: "CJ", constanta: "CT", covasna: "CV",
  dambovita: "DB", dolj: "DJ", galati: "GL", giurgiu: "GR", gorj: "GJ", harghita: "HR", hunedoara: "HD", ialomita: "IL", iasi: "IS",
  ilfov: "IF", maramures: "MM", mehedinti: "MH", mures: "MS", neamt: "NT", olt: "OT", prahova: "PH", "satu-mare": "SM", salaj: "SJ",
  sibiu: "SB", suceava: "SV", teleorman: "TR", timis: "TM", tulcea: "TL", vaslui: "VS", valcea: "VL", vrancea: "VN" };

const randuri = fs.readFileSync(SIRUTA, "utf8").replace(/^﻿/, "").split(/\r?\n/).slice(1).filter(Boolean).map((r) => r.split(";"));
const dupaCod = new Map(randuri.map((r) => [r[0], { siruta: r[0], nume: r[1], jud: r[3], sup: r[4], tip: Number(r[5]), niv: r[6] }]));
const judet = new Map();
for (const r of dupaCod.values()) if (r.niv === "1") {
  const c = COD[cheie(r.nume.replace(/^(JUDEŢUL|MUNICIPIUL)\s+/, ""))];
  if (!c) throw new Error(`Județ necunoscut: ${r.nume}`);
  judet.set(r.jud, c);
}

// Rangul ordonează sugestiile cu același început: reședințele de județ, municipiile, orașele, comunele, satele.
const RANG_UAT = { 1: 0, 4: 1, 2: 2, 5: 2, 3: 3 };
// Bucureștiul înaintea reședințelor de județ: e cel mai căutat și cel mai mare.
const localitati = [["București", "B", "", -1]];
for (const r of dupaCod.values()) {
  if (r.niv !== "3") continue;
  const uat = dupaCod.get(r.sup), jud = judet.get(r.jud);
  if (r.tip === 6) { localitati.push([`București, ${titlu(r.nume.replace(/^BUCUREŞTI\s+/, ""))}`, "B", "", 1]); continue; }
  const nume = titlu(r.nume), numeUat = titlu(uat.nume.replace(/^(MUNICIPIUL|ORAŞ|ORAȘ|COMUNA)\s+/, ""));
  const resedinta = r.tip === 9 || r.tip === 17 || r.tip === 22;
  const rang = resedinta ? (RANG_UAT[uat.tip] ?? 3) : 4;
  localitati.push([nume, jud, nume === numeUat ? "" : numeUat, rang]);
}
localitati.sort((a, b) => a[3] - b[3] || a[0].localeCompare(b[0], "ro"));

// Străzile: fiecare unitate OSM se leagă de orașul/comuna cu același nume din județ.
fs.rmSync(`${IESIRE}/strazi`, { recursive: true, force: true });
fs.mkdirSync(`${IESIRE}/strazi`, { recursive: true });
// Numele din OSM care nu se potrivesc cu SIRUTA nici după regula „î”/„â”: SIRUTA scrie „Rișca”, „Covăsinț”.
const ALIAS = { "CJ:rasca": "risca", "AR:covasant": "covasint" };
const uatJudet = new Map();
const cheieUat = ([nume, jud, comuna]) => jud === "B" ? "bucuresti" : cheie(comuna || nume);
for (const l of localitati) (uatJudet.get(l[1]) ?? uatJudet.set(l[1], new Set()).get(l[1])).add(cheieUat(l));
let total = 0, legate = 0, fara = [];
for (const [, cod] of Object.entries(COD)) {
  const f = `${OSM}/${cod}.json`;
  if (!fs.existsSync(f)) { fara.push(`${cod} (nedescărcat)`); continue; }
  const pe = {};
  for (const u of JSON.parse(fs.readFileSync(f, "utf8"))) {
    const k = cod === "B" ? "bucuresti" : ALIAS[`${cod}:${cheie(u.uat)}`] ?? cheie(u.uat);
    total++;
    if (!uatJudet.get(cod)?.has(k)) { fara.push(`${cod}: ${u.uat}`); continue; }
    legate++;
    pe[k] = [...new Set([...(pe[k] ?? []), ...u.strazi])].sort((a, b) => a.localeCompare(b, "ro"));
  }
  fs.writeFileSync(`${IESIRE}/strazi/${cod}.json`, JSON.stringify(pe));
}
fs.writeFileSync(`${IESIRE}/localitati.json`, JSON.stringify(localitati));
console.log(`localități: ${localitati.length}; unități OSM legate: ${legate}/${total}`);
if (fara.length) console.log("nelegate:", fara.join(" | "));
