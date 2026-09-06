// scripts/inspect-blue-collar.mts
import { MESERII, dateMeserieSauEroare } from "../src/lib/meserii";
import { reperMeserie } from "../src/lib/repere-meserii";
import { indicatorMeserie } from "../src/lib/indicator-meserie";

console.log("Toate meseriile din catalog cu ISCO / Categorie:");
const all = MESERII.map((m) => {
  const d = dateMeserieSauEroare(m);
  const r = reperMeserie(d);
  return {
    slug: m.slug,
    nume: m.nume,
    net: indicatorMeserie(r).value,
    loc: d.clasament?.loc ?? 0,
    categorie: m.categorie,
    isco: m.isco,
    caen: m.caen3,
    kind: r.kind,
    source: r.source,
  };
});

// Toate ocupațiile blue-collar (muncitori calificați, necalificați, operatori mașini, agricultură, lucrători comerciali și servicii)
const blueCollar = all.filter((x) =>
  ["muncitori", "operatori", "agricultura", "servicii", "elementare"].includes(x.isco) ||
  ["constructii", "transport", "industrie", "horeca", "agricultura", "utilitati"].includes(x.categorie)
).filter((x) => !["inginer", "manager", "arhitect", "medic", "profesor", "programator", "director", "avocat", "notar", "judecator", "procuror", "pilot"].some(term => x.slug.includes(term)));

console.log("Blue-collar total:", blueCollar.length);
for (const b of blueCollar.sort((a, b) => (b.net ?? 0) - (a.net ?? 0))) {
  console.log(
    "#" + String(b.loc).padStart(3, " ") + " | " +
    b.nume.padEnd(25, " ") + " (" + b.slug.padEnd(22, " ") + ") | " +
    String(b.net).padStart(5, " ") + " lei | [" +
    b.kind.padEnd(17, " ") + "] | ISCO: " +
    b.isco.padEnd(12, " ") + " | " +
    b.source.slice(0, 45)
  );
}
