// Publică salariul-concluzie pe site: din colectare/agregat/meserii.json în
// src/data/salariu-concluzie.json, doar meseriile cu concluzie și doar câmpurile afișate.
//
//   npx tsx scripts/colectare/agregare.mjs && node scripts/colectare/publica.mjs
//
// Pragurile sunt aplicate la agregare; aici nu se mai hotărăște nimic, doar se alege ce
// ajunge în pagină. Numele județelor le punem aici, o singură dată.
import fs from "node:fs";

const JUDETE = {
  AB: "Alba", AR: "Arad", AG: "Argeș", BC: "Bacău", BH: "Bihor", BN: "Bistrița-Năsăud", BT: "Botoșani", BV: "Brașov",
  BR: "Brăila", B: "București", BZ: "Buzău", CS: "Caraș-Severin", CL: "Călărași", CJ: "Cluj", CT: "Constanța",
  CV: "Covasna", DB: "Dâmbovița", DJ: "Dolj", GL: "Galați", GR: "Giurgiu", GJ: "Gorj", HR: "Harghita", HD: "Hunedoara",
  IL: "Ialomița", IS: "Iași", IF: "Ilfov", MM: "Maramureș", MH: "Mehedinți", MS: "Mureș", NT: "Neamț", OT: "Olt",
  PH: "Prahova", SM: "Satu Mare", SJ: "Sălaj", SB: "Sibiu", SV: "Suceava", TR: "Teleorman", TM: "Timiș", TL: "Tulcea",
  VS: "Vaslui", VL: "Vâlcea", VN: "Vrancea",
};

const agregat = JSON.parse(fs.readFileSync("colectare/agregat/meserii.json", "utf8"));

// Ofertele marilor angajatori, citate ca atare (nu statistici): anunțurile active în ultimele
// 30 de zile, pe șablonul de post al angajatorului. Dicționar strict, ca la art. 33.
const SABLON = [
  ["vanzator", "Lidl", /^vânzător$/i],
  ["agent-curatenie", "Kaufland", /personal curățenie/i],
  ["agent-curatenie", "Lidl", /^personal de serviciu$/i],
];
const capete = (_, s) => (s.length >= 20
  ? { min: s[Math.floor(0.05 * s.length)], max: s[Math.ceil(0.95 * s.length) - 1] }
  : { min: s[0], max: s[s.length - 1] });
const angajatori = {};
for (const site of ["kaufland", "lidl"]) {
  const dir = `colectare/angajatori/${site}`;
  if (!fs.existsSync(dir)) continue;
  const index = JSON.parse(fs.readFileSync(`${dir}/index.json`, "utf8"));
  const limita = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const anunturi = fs.readdirSync(`${dir}/oferte`).flatMap((f) => fs.readFileSync(`${dir}/oferte/${f}`, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)))
    .filter((o) => (index[o.id]?.[1] ?? "") >= limita);
  const nume = site === "lidl" ? "Lidl" : "Kaufland";
  for (const [slug, firma, re] of SABLON) {
    if (firma !== nume) continue;
    // Lidl: după titlu — „Responsabil de tură” are tot șablonul „Vânzător”. Sub salariul minim
    // nu poate fi normă întreagă, oricum ar fi etichetat anunțul („Personal de Serviciu” 2.650).
    const lot = anunturi.filter((o) => re.test(site === "lidl" ? o.titlu.replace(/\s*\(.*$/, "").replace(/\s+[A-ZĂÂÎȘȚ][\wăâîșț-]*(,.*)?$/u, "") : o.sablon ?? "")
      && /full/i.test(o.norma ?? "") && o.salariu?.min >= 4325);
    if (lot.length < 3) continue;
    const sume = lot.map((o) => o.salariu.min).sort((a, b) => a - b);
    const venit = lot.map((o) => o.venitMediuBrut).filter(Boolean).sort((a, b) => a - b);
    (angajatori[slug] ??= []).push({
      firma, post: lot[0].sablon.replace(/^\d+_RO_[^_]+_/, ""), anunturi: lot.length, orase: new Set(lot.map((o) => o.oras)).size,
      // Peste 20 de anunțuri, fără cele mai extreme 5% din fiecare capăt: un singur anunț din
      // București (7.120) întindea altfel intervalul celorlalte 77 (5.300–5.830).
      ...capete("", sume), baza: lot.every((o) => o.salariu.baza === "brut") ? "brut" : null,
      venitMediuBrut: venit.length ? capete("", venit) : null,
    });
  }
}
const out = {};
for (const m of agregat.meserii) {
  if (!m.concluzie) continue;
  const mari = angajatori[m.slug] ?? null;
  const P = m.platit;
  out[m.slug] = {
    sursa: m.concluzie.sursa,
    net: m.concluzie.net,
    interval: m.concluzie.interval,
    platit: P && P.trece ? {
      randuri: P.randuri, institutii: P.institutii, judete: P.judete, perioade: P.perioade, surse: P.surse.sort(),
      debutant: P.debutant?.net.mediana ?? null,
      cuVariabil: P.variabil ? { net: P.variabil.netCuVariabil.mediana, cota: P.variabil.cota } : null,
      studii: Object.fromEntries(Object.entries(P.peStudii).map(([k, v]) => [k, v.net.mediana])),
      peJudet: Object.entries(P.peJudet).map(([k, v]) => ({ judet: JUDETE[k] ?? k, randuri: v.randuri, institutii: v.institutii, net: v.net.mediana }))
        .sort((a, b) => b.net - a.net),
    } : null,
    // Sub praguri nu se arată nimic, nici ca verificare (CLAUDE.md): anunțurile numai peste
    // pragurile lor, ANOFM numai cu 20 de oferte și 10 angajatori pe un COR al meseriei singure,
    // salariile plătite numai peste pragurile de la agregare.
    oferit: m.oferit?.netCentral && m.oferit.trece ? { net: m.oferit.netCentral, anunturi: m.oferit.anunturi } : null,
    declarat: m.declarat?.netMinimDeclarat && m.declarat.brutNormaIntreaga >= 20 && m.declarat.angajatori >= 10 && !m.declarat.codComun
      ? { net: m.declarat.netMinimDeclarat.mediana, oferte: m.declarat.brutNormaIntreaga, laMinim: m.declarat.laMinim } : null,
    angajatori: mari,
  };
}
fs.writeFileSync("src/data/salariu-concluzie.json", JSON.stringify({ generatLa: agregat.generatLa, oferteAnofm: agregat.oferteAnofm, meserii: out }, null, 1) + "\n");
console.log(`publicat: ${Object.keys(out).length} meserii cu concluzie`);
