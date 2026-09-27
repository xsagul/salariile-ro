// Pagina „Baza pe meserii” (artefact privat al proprietarului) din colectare/baza.
//   node scripts/colectare/pagina-baza.mjs   → .cercetare-privata/baza-meserii.html
import fs from "node:fs";
const ROOT = ".";
const OUT = ".cercetare-privata/baza-meserii.html";
const rez = JSON.parse(fs.readFileSync(`${ROOT}/colectare/baza/rezumat.json`, "utf8"));
const taie = (o, n) => (o && typeof o === "object" ? Object.fromEntries(Object.entries(o).slice(0, n)) : o);
const fise = rez.meserii.map((r) => {
  const f = JSON.parse(fs.readFileSync(`${ROOT}/colectare/baza/meserii/${r.slug}.json`, "utf8"));
  if (f.institutiiPublice) f.institutiiPublice.peFunctie = taie(f.institutiiPublice.peFunctie, 25);
  if (f.anofm) { f.anofm.coduriCorInGrupa = taie(f.anofm.coduriCorInGrupa, 12); f.anofm.judete = taie(f.anofm.judete, 15); f.anofm.domenii = taie(f.anofm.domenii, 8); }
  if (f.anunturi) { f.anunturi.peOras = taie(f.anunturi.peOras, 15); f.anunturi.peJudet = taie(f.anunturi.peJudet, 15); }
  if (f.factori) { f.factori.tehnologii = taie(f.factori.tehnologii, 20); f.factori.peJudet = taie(f.factori.peJudet, 12); }
  if (f.angajatori) f.angajatori.peOras = taie(f.angajatori.peOras, 12);
  return f;
});
const date = { generatLa: rez.generatLa, total: rez.total, rezumat: rez.meserii, fise };
const tpl = fs.readFileSync("scripts/colectare/pagina-baza.sablon.html", "utf8");
fs.writeFileSync(OUT, tpl.replace("/*DATE*/null", JSON.stringify(date).replace(/</g, "\\u003c")));
console.log("scris", OUT, Math.round(fs.statSync(OUT).size / 1024), "KB");
