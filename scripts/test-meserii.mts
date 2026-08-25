// scripts/test-meserii.mts
// Verifica setul de date INS si catalogul de meserii care stau sub /salarii si
// /compara.
//
// De ce citim catalogul din sursa, in loc sa-l importam: `src/lib/meserii.ts`
// foloseste aliasul `@/`, pe care Node nu il rezolva. Build-ul Next verifica
// deja ca fiecare pagina se randeaza; testul de aici pazeste exact ce nu vede
// build-ul — chei CAEN ramase fara valoare, slug-uri duplicate (Map-ul de
// cautare le-ar inghiti in tacere) si perechi de comparatie din acelasi sector
// (ar fi filtrate tot in tacere).

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const date = JSON.parse(await readFile(path.join(root, "src/data/ins-caen.json"), "utf8"));
const sursa = await readFile(path.join(root, "src/lib/meserii.ts"), "utf8");
const llms = await readFile(path.join(root, "public/llms.txt"), "utf8");

/** Decupeaza corpul unui literal de tablou, dupa antetul lui. */
function blocDupa(antet: string): string {
  const inceput = sursa.indexOf(antet);
  assert.notEqual(inceput, -1, `Nu am gasit „${antet}" in catalog.`);
  const sfarsit = sursa.indexOf("\n];", inceput);
  assert.notEqual(sfarsit, -1, `Lista „${antet}" nu are inchidere.`);
  return sursa.slice(inceput + antet.length, sfarsit);
}

// ─── Structura setului de date ───────────────────────────────────────────────

for (const cheie of ["generatLa", "sursa", "brut", "net", "judete", "ocupatii"]) {
  assert.ok(cheie in date, `Setul INS nu contine sectiunea „${cheie}".`);
}
assert.match(date.generatLa, /^\d{4}-\d{2}-\d{2}$/, "Data generarii setului nu e in format ISO.");
assert.ok(
  date.sursa.nume.includes("Institutul Național de Statistică"),
  "Setul trebuie sa declare INS ca sursa.",
);

assert.ok(date.brut.luni.length >= 12, `Seria bruta are doar ${date.brut.luni.length} luni.`);
assert.deepEqual(date.brut.luni, date.net.luni, "Seriile brut si net acopera luni diferite.");
assert.match(date.brut.luni.at(-1), /^Luna \p{L}+ \d{4}$/u, "Ultima luna nu are eticheta INS asteptata.");
assert.equal(date.judete.matrice, "FOM107E", "Seria pe judete trebuie sa ramana matricea INS FOM107E.");
assert.match(
  date.judete.denumire,
  /câștigul salarial nominal mediu brut lunar|castigul salarial nominal mediu brut lunar/i,
  "Seria pe judete nu mai declara indicatorul brut lunar.",
);
assert.match(date.judete.an, /^Anul \d{4}$/, "Perioada seriei pe judete nu mai este un an explicit.");

const cheieActivitate = (eticheta: string) => eticheta.trim().split(/\s+/)[0];
const brutDupaCheie = new Map<string, (number | null)[]>(
  date.brut.activitati.map((a: { caen: string; valori: (number | null)[] }) => [cheieActivitate(a.caen), a.valori]),
);
const netDupaCheie = new Map<string, (number | null)[]>(
  date.net.activitati.map((a: { caen: string; valori: (number | null)[] }) => [cheieActivitate(a.caen), a.valori]),
);
const judeteDupaCheie = new Map<string, Record<string, number | null>>(
  date.judete.activitati.map((a: { caen: string; valori: Record<string, number | null> }) => [
    cheieActivitate(a.caen),
    a.valori,
  ]),
);

const totalBrut = brutDupaCheie.get("TOTAL");
assert.ok(totalBrut, "Lipseste randul TOTAL ECONOMIE din seria bruta.");
const mediaEconomie = [...totalBrut].reverse().find((v) => v !== null);
assert.ok(
  typeof mediaEconomie === "number" && mediaEconomie > 4325,
  `Media pe economie (${mediaEconomie}) e sub salariul minim brut — setul e probabil corupt.`,
);

const grupeIsco = new Set(
  date.ocupatii.grupe.map((g: { isco: string }) => g.isco).filter((isco: string) => isco !== "Total"),
);
assert.equal(grupeIsco.size, 9, `Ancheta pe ocupatii ar trebui sa aiba 9 grupe majore, are ${grupeIsco.size}.`);

// ─── Catalogul de meserii ────────────────────────────────────────────────────
// Atentie: `CATEGORII` incepe la fel (`{ slug: "…", nume: "…"`), asa ca lucram
// numai in blocul MESERII si nu lasam potrivirea sa treaca peste acolade.

type IntrareMeserie = { slug: string; caen3: string; caen2: string; isco: string };

const blocMeserii = blocDupa("export const MESERII: Meserie[] = [");
const meserii: IntrareMeserie[] = [
  ...blocMeserii.matchAll(
    /\{ slug: "([^"]+)"[^{}]*?caen3: "([^"]+)", caen2: "([^"]+)", isco: "([^"]+)"/g,
  ),
].map((potrivire) => ({
  slug: potrivire[1],
  caen3: potrivire[2],
  caen2: potrivire[3],
  isco: potrivire[4],
}));

const totalIntrari = [...blocMeserii.matchAll(/\{ slug: "/g)].length;
assert.equal(
  meserii.length,
  totalIntrari,
  `Potrivirea a prins ${meserii.length} din ${totalIntrari} intrari MESERII — formatul catalogului s-a schimbat.`,
);
assert.ok(meserii.length >= 60, `Catalogul are doar ${meserii.length} meserii.`);

const slugAparitii = new Map<string, number>();
for (const meserie of meserii) {
  slugAparitii.set(meserie.slug, (slugAparitii.get(meserie.slug) ?? 0) + 1);
}
const duplicate = [...slugAparitii].filter(([, numar]) => numar > 1).map(([slug]) => slug);
assert.deepEqual(duplicate, [], `Slug-uri duplicate in catalog: ${duplicate.join(", ")}`);

for (const meserie of meserii) {
  const brut = brutDupaCheie.get(meserie.caen3);
  assert.ok(brut, `${meserie.slug}: activitatea CAEN Rev.3 „${meserie.caen3}" lipseste din setul INS.`);
  const valoare = brut.at(-1);
  assert.ok(
    typeof valoare === "number" && valoare > 0,
    `${meserie.slug}: CAEN ${meserie.caen3} nu are brut in ultima luna publicata.`,
  );

  const net = netDupaCheie.get(meserie.caen3);
  assert.ok(net, `${meserie.slug}: CAEN ${meserie.caen3} lipseste din seria neta.`);
  const netUltim = net.at(-1);
  assert.ok(
    typeof netUltim === "number" && netUltim > 0,
    `${meserie.slug}: CAEN ${meserie.caen3} nu are net in ultima luna publicata.`,
  );
  assert.ok(
    netUltim < valoare,
    `${meserie.slug}: netul curent (${netUltim}) nu este sub brutul curent (${valoare}).`,
  );

  const judete = judeteDupaCheie.get(meserie.caen2);
  assert.ok(judete, `${meserie.slug}: activitatea CAEN Rev.2 „${meserie.caen2}" lipseste din defalcarea pe judete.`);
  // Diviziunile inguste (extractia carbunelui, transportul aerian) exista in
  // putine judete, iar INS suprima valorile confidentiale. Pragul cere doar sa
  // ramana un tabel care merita afisat.
  const judeteCuValori = Object.values(judete).filter((v) => v !== null).length;
  assert.ok(
    judeteCuValori >= 5,
    `${meserie.slug}: doar ${judeteCuValori} judete au valoare pentru CAEN ${meserie.caen2}.`,
  );
}

// ─── Perechile de comparatie ─────────────────────────────────────────────────
// Regula editoriala: doua meserii din acelasi sector CAEN ar afisa aceeasi
// cifra de doua ori. `COMPARATII` le filtreaza tacut, deci o pereche gresita ar
// face pagina sa dispara fara ca nimeni sa observe.

const blocPerechi = blocDupa("const PERECHI: [string, string][] = [");
const perechi = [...blocPerechi.matchAll(/\["([^"]+)", "([^"]+)"\]/g)].map((p) => [p[1], p[2]] as const);
assert.ok(perechi.length > 0, "Lista PERECHI e goala.");

const dupaSlug = new Map(meserii.map((m) => [m.slug, m]));
for (const [a, b] of perechi) {
  const meserieA = dupaSlug.get(a);
  const meserieB = dupaSlug.get(b);
  assert.ok(meserieA, `Comparatia ${a} vs ${b}: meseria „${a}" nu exista in catalog.`);
  assert.ok(meserieB, `Comparatia ${a} vs ${b}: meseria „${b}" nu exista in catalog.`);
  assert.notEqual(
    meserieA.caen3,
    meserieB.caen3,
    `Comparatia ${a} vs ${b} pune fata in fata acelasi sector CAEN (${meserieA.caen3}).`,
  );
}

const slugComparatii = new Set(perechi.map(([a, b]) => `${a}-vs-${b}`));
assert.equal(slugComparatii.size, perechi.length, "Exista perechi de comparatie duplicate.");
assert.match(llms, new RegExp(`\\b${meserii.length} de meserii\\b`), "llms.txt are un numar vechi de meserii.");
assert.match(llms, new RegExp(`\\b${perechi.length} de comparații\\b`), "llms.txt are un numar vechi de comparatii.");

console.log(
  `OK: ${meserii.length} meserii si ${perechi.length} comparatii, pe setul INS din ${date.generatLa} (ultima luna: ${date.brut.luni.at(-1)}).`,
);
