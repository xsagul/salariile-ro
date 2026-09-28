// Regulile anunțurilor de angajare (src/lib/anunturi/reguli.ts): ce se publică, ce se respinge și
// adresele verificate în Google România pe 28 septembrie 2026.
import assert from "node:assert/strict";
import { MINIM_BRUT, MINIM_NET, cuiValid, orasSlug, slugAnunt, urlAnunt, urlLista, valideaza, type Eroare } from "../src/lib/anunturi/reguli";

const MESERII = new Set(["barman", "sofer-distributie"]);
const bun = {
  titlu: "Barman pentru bar în centru", meserie: "barman", angajator: "Bar Centru SRL", cui: "", judet: "B", oras: "București",
  norma: "intreaga", salariuMin: "4000", salariuMax: "", baza: "net",
  descriere: "Căutăm barman pentru program în ture, 2 zile cu 2 libere. Oferim bacșiș, o masă pe zi și contract pe perioadă nedeterminată.",
  telefon: "0722 123 456", emailContact: "", linkAplicare: "", email: "angajator@exemplu.ro", acordPublicare: true,
};
const erori = (x: Record<string, unknown>): Eroare[] => { const r = valideaza({ ...bun, ...x }, MESERII); return "erori" in r ? r.erori : []; };
const camp = (x: Record<string, unknown>) => erori(x).map((e) => e.camp);

// Un anunț complet trece și iese curățat.
const r = valideaza(bun, MESERII);
assert.ok("anunt" in r, JSON.stringify(r));
if ("anunt" in r) { assert.equal(r.anunt.salariuMin, 4000); assert.equal(r.anunt.salariuMax, null); assert.equal(r.anunt.judet, "B"); }

// Salariul e obligatoriu, cu bază, și nu sub minimul legal (proporțional la normă parțială).
assert.deepEqual(camp({ salariuMin: "" }), ["salariuMin"]);
assert.deepEqual(camp({ baza: "" }), ["baza"]);
assert.deepEqual(camp({ salariuMin: String(MINIM_NET - 1) }), ["salariuMin"], "sub netul minim");
assert.deepEqual(camp({ salariuMin: String(MINIM_BRUT - 1), baza: "brut" }), ["salariuMin"], "sub brutul minim");
assert.deepEqual(camp({ salariuMin: String(Math.round(MINIM_BRUT / 2)), baza: "brut", norma: "partiala", orePeZi: "4" }), [], "4 ore: jumătate din minim e legal");
assert.deepEqual(camp({ salariuMax: "3000" }), ["salariuMax"], "maxim sub minim");
assert.deepEqual(camp({ salariuMax: "20000" }), ["salariuMax"], "interval de peste trei ori");

// Contactul: cel puțin unul, valid; emailul celui care postează și acordul, obligatorii.
assert.deepEqual(camp({ telefon: "" }), ["telefon"]);
assert.deepEqual(camp({ telefon: "12345" }), ["telefon"]);
assert.deepEqual(camp({ email: "nu-e-email" }), ["email"]);
assert.deepEqual(camp({ acordPublicare: false }), ["acordPublicare"]);
assert.deepEqual(camp({ meserie: "astronaut" }), ["meserie"]);
assert.deepEqual(camp({ judet: "XX" }), ["judet"]);

// Conținutul interzis se respinge cu motivul lui.
const motiv = (descriere: string) => erori({ descriere: `${bun.descriere} ${descriere}` }).find((e) => e.camp === "general")?.mesaj ?? "";
assert.match(motiv("Căutăm doar femei."), /sex/);
assert.match(motiv("Vârsta maximă 35 de ani."), /vârstă/);
assert.match(motiv("Candidații plătesc o taxă de înscriere de 200 lei."), /bani/);
assert.match(motiv("Muncă în Germania, lucru în fabrică."), /România/);
assert.match(motiv("Câștig garantat din trading."), /schemă/);
assert.equal(motiv("Experiența de minim 2 ani constituie avantaj."), "", "experiența nu e vârstă");
assert.match(erori({ titlu: "ANGAJAM BARMAN URGENT ACUM" }).map((e) => e.mesaj).join(), /majuscule/);

// CUI: cifra de control ANAF.
assert.ok(cuiValid("RO14399840"));   // Dante International (eMAG)
assert.ok(!cuiValid("RO14399841"));
assert.deepEqual(camp({ cui: "123" }), ["cui"]);

// Adresele: liste pe oraș și meserie, anunțul cu „anunt-angajare-”, adăugarea fără cont.
assert.equal(orasSlug("București, Sectorul 3"), "bucuresti");
assert.equal(orasSlug("Cluj-Napoca"), "cluj-napoca");
assert.equal(orasSlug("Municipiul Iași"), "iasi");
assert.equal(slugAnunt("Angajăm barman, bar centru", "București"), "barman-bar-centru-bucuresti");
assert.equal(slugAnunt("Barman pentru bar", "București, Sectorul 3"), "barman-pentru-bar-bucuresti", "sectorul nu intră în adresă");
assert.equal(slugAnunt("Șofer distribuție Cluj-Napoca", "Cluj-Napoca"), "sofer-distributie-cluj-napoca", "orașul nu se repetă");
assert.equal(urlAnunt({ id: 123, slug: "barman-bar-centru-bucuresti" }), "/anunt-angajare-barman-bar-centru-bucuresti-123");
assert.equal(urlLista("bucuresti", "barman"), "/locuri-de-munca/bucuresti/barman");
assert.equal(urlLista(null, "barman"), "/locuri-de-munca/barman");
assert.equal(urlLista(null, null), "/locuri-de-munca");

console.log("OK: anunțurile de angajare — salariul și minimul legal, contactul, conținutul interzis, CUI, adresele");
