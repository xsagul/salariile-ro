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
const out = {};
for (const m of agregat.meserii) {
  if (!m.concluzie) continue;
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
  };
}
fs.writeFileSync("src/data/salariu-concluzie.json", JSON.stringify({ generatLa: agregat.generatLa, oferteAnofm: agregat.oferteAnofm, meserii: out }, null, 1) + "\n");
console.log(`publicat: ${Object.keys(out).length} meserii cu concluzie`);
