// Regulile de publicare ale salariului-concluzie (src/data/salariu-concluzie.json).
// Sub praguri nu se arată nimic — nici cifră, nici interval, nici ca verificare (CLAUDE.md).
import assert from "node:assert/strict";
import fs from "node:fs";

const date = JSON.parse(fs.readFileSync("src/data/salariu-concluzie.json", "utf8"));
const agregat = JSON.parse(fs.readFileSync("colectare/agregat/meserii.json", "utf8"));
const { platit: prag } = agregat.praguri;
let n = 0;
for (const [slug, c] of Object.entries(date.meserii)) {
  n++;
  assert.ok(["platit", "oferit"].includes(c.sursa), `${slug}: concluzia vine din salarii plătite sau din anunțuri, nu din minimul declarat`);
  assert.ok(Number.isInteger(c.net) && c.net > 1500 && c.net < 60000, `${slug}: cifră neplauzibilă ${c.net}`);
  if (c.sursa === "platit") {
    assert.ok(c.platit, `${slug}: concluzia din salarii plătite are detaliile ei`);
    assert.ok(c.platit.institutii >= prag.institutii && c.platit.judete >= prag.judete && c.platit.randuri >= prag.randuri,
      `${slug}: sub pragurile salariilor plătite (${c.platit.institutii} instituții, ${c.platit.judete} județe, ${c.platit.randuri} posturi)`);
    assert.ok(c.interval && c.interval[0] <= c.net && c.net <= c.interval[1], `${slug}: intervalul trebuie să conțină cifra`);
    for (const j of c.platit.peJudet) assert.ok(j.randuri >= agregat.praguri.platitJudet.randuri, `${slug}: ${j.judet} sub pragul pe județ`);
  }
  if (c.sursa === "oferit") assert.equal(c.platit, null, `${slug}: fără salarii plătite peste prag, nu arătăm detaliile lor`);
  if (c.declarat) assert.ok(c.declarat.oferte >= 20, `${slug}: ANOFM sub 20 de oferte nu se arată`);
  for (const a of c.angajatori ?? []) {
    assert.ok(a.min >= 4325 && a.min <= a.max, `${slug}: ${a.firma} — normă întreagă sub salariul minim sau interval inversat`);
    assert.ok(a.anunturi >= 3, `${slug}: ${a.firma} — sub trei anunțuri nu se citează`);
  }
  assert.ok(!("platitSubPrag" in c), `${slug}: salariile plătite sub prag nu se publică nici ca verificare`);
}
assert.ok(n >= 10, "Cel puțin zece meserii cu concluzie");
console.log(`OK: salariul-concluzie — ${n} meserii, praguri respectate`);
