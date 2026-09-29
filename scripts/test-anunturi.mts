// Regulile anunțurilor de angajare (src/lib/anunturi/reguli.ts): ce se publică, ce se respinge și
// adresele verificate în Google România pe 28 septembrie 2026.
import assert from "node:assert/strict";
import fs from "node:fs";
import { cauta, cheieUat, numarDinText, type Localitate } from "../src/lib/anunturi/localitati";
import { MARCAJE, completeazaSablon } from "../src/lib/anunturi/sablon";
import { EMAIL_ACTIV } from "../src/lib/anunturi/config";
import { MESERII_ANUNTURI, distanta, ghicesteMeserie, grupMeserie, numeMeserieAnunt, radacina, slugMeserie, slugurileGrupului, variante } from "../src/lib/anunturi/meserii";
import { esteMobil, linkApel, linkWhatsApp, orasSlug, slugAnunt, telefonAfisat, telefonCurat, urlAnunt, urlLista, valideaza, type Eroare } from "../src/lib/anunturi/reguli";

const MESERII = new Set(["barman", "sofer-distributie"]);
const bun = {
  titlu: "Barman pentru bar în centru", meserie: "barman", angajator: "Bar Centru SRL", judet: "B", oras: "București",
  norma: "intreaga", salariuMin: "4000", salariuMax: "", baza: "net",
  descriere: "Căutăm barman pentru program în ture, 2 zile cu 2 libere. Oferim bacșiș, o masă pe zi și contract pe perioadă nedeterminată.",
  telefon: "0722 123 456", email: "angajator@exemplu.ro", acordPublicare: true,
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
// Orice sumă (proprietar, 28 septembrie 2026): fără prag minim; numai greșelile evidente se opresc.
assert.deepEqual(camp({ salariuMin: "1500" }), [], "sub minimul pe economie se publică");
assert.deepEqual(camp({ salariuMin: "0" }), ["salariuMin"]);
assert.deepEqual(camp({ salariuMin: "4000000" }), ["salariuMin"], "cifre în plus");
assert.deepEqual(camp({ salariuMax: "3000" }), ["salariuMax"], "maxim sub minim");
assert.deepEqual(camp({ salariuMax: "20000" }), [], "interval larg: se publică");

// Căutarea iartă ca pe OLX (proprietar, 29 septembrie 2026: „barmanA” găsea barmanii).
assert.equal(radacina("barmana"), "barman");
assert.equal(radacina("barmanii"), "barman");
assert.equal(radacina("barmanului"), "barman");
assert.equal(radacina("bona"), "bona", "cuvintele scurte nu se taie");
assert.equal(distanta("barmn", "barman"), 1);
assert.equal(distanta("bramna", "barman"), 2, "două litere inversate de două ori");
assert.ok(variante("barmana").includes("barman"));
assert.ok(variante("barmn").includes("barman"));
assert.ok(variante("bucuresit").includes("bucuresti"), "și județele");
assert.ok(!variante("bar").some((x) => x !== "bar"), "sub 4 litere, nicio corectură");

// Meseria lăsată necompletată se ghicește din titlu: cea mai lungă formulare întreagă din catalog.
assert.equal(ghicesteMeserie("Ajutor barman restaurant Beraria H"), "ajutor-barman", "anunțul care nu apărea la niciun filtru");
assert.equal(ghicesteMeserie("Tractorist pentru ferma"), "tractorist", "cuvinte întregi: nu „actor”");

// Contactul: telefonul, valid; acordul, obligatoriu.
assert.deepEqual(camp({ telefon: "" }), ["telefon"]);
assert.deepEqual(camp({ telefon: "12345" }), ["telefon"]);
// Contactul (proprietar, 28 septembrie 2026): numărul curățat, butonul de apel și WhatsApp la mobil.
assert.equal(telefonCurat("+40 722-123-456"), "0722123456");
assert.equal(telefonCurat("0264 123 456"), "0264123456");
assert.equal(telefonCurat("12345"), null);
assert.ok(esteMobil("0722123456") && !esteMobil("0264123456"), "WhatsApp numai la mobil");
assert.equal(linkApel("0722123456"), "tel:+40722123456");
assert.match(linkWhatsApp("0722123456", "Barman"), /^https:\/\/wa\.me\/40722123456\?text=/);
assert.equal(telefonAfisat("0722123456"), "0722 123 456");
if ("anunt" in r) assert.equal(r.anunt.telefon, "0722123456", "telefonul se păstrează curățat");
// Adresa e opțională, dar nu nelimitată.
assert.deepEqual(camp({ adresa: "Strada Lipscani 69" }), []);
assert.deepEqual(camp({ adresa: "x".repeat(121) }), ["adresa"]);
// Emailul contează numai cu EMAIL_ACTIV; oprit, nu se cere și nu se păstrează.
if (EMAIL_ACTIV) assert.deepEqual(camp({ email: "nu-e-email" }), ["email"]);
else {
  assert.deepEqual(camp({ email: "" }), [], "fără emailuri, anunțul se publică fără email");
  if ("anunt" in r) assert.equal(r.anunt.email, "", "emailul nu se păstrează cât timp nu-l folosim");
}
assert.deepEqual(camp({ acordPublicare: false }), ["acordPublicare"]);
assert.deepEqual(camp({ meserie: "astronaut" }), ["meserie"]);
assert.deepEqual(camp({ judet: "XX" }), ["oras"], "județul vine din localitatea aleasă");
assert.deepEqual(camp({ oras: "" }), ["oras"]);
// Numele firmei e opțional, CUI-ul nu se mai cere.
assert.deepEqual(camp({ angajator: "" }), []);

// Conținutul interzis se respinge cu motivul lui.
const motiv = (descriere: string) => erori({ descriere: `${bun.descriere} ${descriere}` }).find((e) => e.camp === "general")?.mesaj ?? "";
assert.match(motiv("Căutăm doar femei."), /sex/);
assert.match(motiv("Vârsta maximă 35 de ani."), /vârstă/);
assert.match(motiv("Candidații plătesc o taxă de înscriere de 200 lei."), /bani/);
assert.match(motiv("Muncă în Germania, lucru în fabrică."), /România/);
assert.match(motiv("Câștig garantat din trading."), /schemă/);
assert.equal(motiv("Experiența de minim 2 ani constituie avantaj."), "", "experiența nu e vârstă");
assert.match(erori({ titlu: "ANGAJAM BARMAN URGENT ACUM" }).map((e) => e.mesaj).join(), /majuscule/);


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

// Șablonul: marcajele se înlocuiesc și în <head>, și în datele React din <script>, cu escaparea locului.
{
  const v = { titlu: 'Barman „Floreasca” & <co> | Salariile', titluScurt: "Barman", descriere: 'Spune "da"', canonic: "https://salariile.ro/anunt-angajare-barman-bucuresti-1", robots: "index, follow" };
  const html = `<title>${MARCAJE.titlu}</title><link rel="canonical" href="${MARCAJE.canonic}"/><script>self.__next_f.push([1,"[\\"$\\",\\"title\\",{\\"children\\":\\"${MARCAJE.titlu}\\"}]"])</script><meta name="robots" content="${MARCAJE.robots}"/>`;
  const out = completeazaSablon(html, v);
  assert.ok(!out.includes("ANUNTURI_MARCAJ"), "niciun marcaj rămas");
  assert.ok(out.includes("<title>Barman „Floreasca” &amp; &lt;co&gt; | Salariile</title>"));
  assert.ok(out.includes('href="https://salariile.ro/anunt-angajare-barman-bucuresti-1"') && out.includes('content="index, follow"'));
  const script = out.match(/<script>([\s\S]*?)<\/script>/)![1];
  assert.ok(!script.includes("<"), "„<” nu apare literal în script");
  const rsc = JSON.parse(JSON.parse(script.slice("self.__next_f.push([1,".length, -2)));
  assert.equal(rsc[2].children, v.titlu, "React primește exact titlul din <head>");
}

// Sugestiile: „b” aduce întâi reședințele de județ; satul poartă comuna și județul; strada se
// găsește și după „str.” sau fără cuvântul „Strada”, iar numărul scris rămâne.
{
  const loc = JSON.parse(fs.readFileSync("public/date/anunturi/localitati.json", "utf8")) as Localitate[];
  assert.ok(loc.length > 13000, `SIRUTA are peste 13.000 de localități, nu ${loc.length}`);
  assert.deepEqual(cauta(loc, "b", (l) => l[0], (l) => l[3], 5).map((l) => l[0]), ["București", "Bacău", "Baia Mare", "Bistrița", "Botoșani"]);
  assert.equal(cauta(loc, "bucu", (l) => l[0], (l) => l[3])[0][0], "București");
  assert.equal(cauta(loc, "cluj", (l) => l[0], (l) => l[3])[0][0], "Cluj-Napoca");
  const ciumbrud = loc.find((l) => l[0] === "Ciumbrud")!;
  assert.deepEqual([ciumbrud[1], ciumbrud[2], cheieUat(ciumbrud)], ["AB", "Aiud", "aiud"]);
  assert.equal(cheieUat(loc.find((l) => l[0] === "București, Sectorul 3")!), "bucuresti");
  const strazi = ["Strada Lipscani", "Bulevardul Iuliu Maniu", "Calea Victoriei", "Strada Liviu Rebreanu"];
  assert.deepEqual(cauta(strazi, "lipscani 69", (x) => x), ["Strada Lipscani"]);
  assert.deepEqual(cauta(strazi, "str. li", (x) => x), ["Strada Lipscani", "Strada Liviu Rebreanu"]);
  assert.deepEqual(cauta(strazi, "iuliu", (x) => x), ["Bulevardul Iuliu Maniu"]);
  assert.equal(numarDinText("lipscani 69, bl. A"), "69, bl. A");
  const b = JSON.parse(fs.readFileSync("public/date/anunturi/strazi/B.json", "utf8")) as Record<string, string[]>;
  assert.ok(b.bucuresti.includes("Strada Lipscani") && b.bucuresti.length > 4000, "străzile Bucureștiului din OpenStreetMap");
}

// Meseriile hubului: fiecare formulare are adresa ei, iar adresa nu poate fi a unei localități
// (/locuri-de-munca/{x} ar fi ambiguu) și nici a unei pagini existente. Grupul cumulează sinonimele.
{
  const sluguri = MESERII_ANUNTURI.map((m) => m.slug);
  assert.deepEqual(sluguri.filter((s, i) => sluguri.indexOf(s) !== i), [], "două formulări cu aceeași adresă");
  const loc = JSON.parse(fs.readFileSync("public/date/anunturi/localitati.json", "utf8")) as Localitate[];
  const orase = new Set(loc.flatMap((l) => [orasSlug(l[0]), orasSlug(l[2] || l[0])]));
  const rezervate = ["sitemap-xml", "raporteaza", "sablon"];
  assert.deepEqual(sluguri.filter((s) => orase.has(s) || rezervate.includes(s)), [], "meserie cu adresa unei localități");
  assert.deepEqual(slugurileGrupului("chelner"), ["ospatar", "chelner", "ospatarita"]);
  assert.equal(grupMeserie("paznic"), "agent-de-paza");
  assert.equal(numeMeserieAnunt("femeie-de-serviciu"), "Femeie de serviciu");
  assert.equal(slugMeserie("Șofer C+E"), "sofer-c-e");
  // „Ajutor ospătar” e altă muncă decât „Ospătar”: nu intră în grupul lui.
  assert.ok(!slugurileGrupului("ospatar").includes("ajutor-ospatar"));
  assert.deepEqual(cauta(MESERII_ANUNTURI, "ospat", (m) => m.nume).map((m) => m.nume).slice(0, 2), ["Ospătar", "Ospătăriță"]);
}

console.log("OK: anunțurile de angajare — salariul, contactul, conținutul interzis, adresele, șablonul, sugestiile de localitate și stradă, meseriile");
