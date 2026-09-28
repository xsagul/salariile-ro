// Străzile cu nume din OpenStreetMap, pe oraș/comună, pentru sugestiile din formularul anunțurilor
// (decizia proprietarului, 28 septembrie 2026: lista ținută pe site, nu Google și nu un serviciu
// care primește fiecare literă). Datele OSM sunt sub ODbL: atribuirea stă lângă câmp.
//
// Rulare: node scripts/anunturi/strazi-osm.mjs [COD ...]   (fără coduri: toate județele)
// Ieșire: research/strazi-osm/{COD}.json = [{ uat, strazi: [...] }]. Un județ deja descărcat se sare;
// ca să-l iei din nou, șterge-i fișierul. Între cereri, o pauză: Overpass e un serviciu gratuit.
import fs from "node:fs";

const SERVERE = ["https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/api/interpreter"];
const DRUMURI = "^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|pedestrian|service|road)$";
const COduri = ["AB", "AR", "AG", "BC", "BH", "BN", "BT", "BV", "BR", "B", "BZ", "CS", "CL", "CJ", "CT", "CV", "DB", "DJ", "GL", "GR",
  "GJ", "HR", "HD", "IL", "IS", "IF", "MM", "MH", "MS", "NT", "OT", "PH", "SM", "SJ", "SB", "SV", "TR", "TM", "TL", "VS", "VL", "VN"];
const DIR = "research/strazi-osm";
fs.mkdirSync(DIR, { recursive: true });

// Bucureștiul nu are orașe/comune (nivelul 8) în interior, doar sectoare: se ia tot, ca o singură unitate.
const cerere = (cod) => cod === "B"
  ? `[out:json][timeout:900];area["ISO3166-2"="RO-B"]->.a;rel(pivot.a)->.u;.u out tags;way(area.a)["highway"~"${DRUMURI}"]["name"];out tags;`
  : `[out:json][timeout:900];area["ISO3166-2"="RO-${cod}"]["admin_level"="4"]->.j;
rel(area.j)["boundary"="administrative"]["admin_level"="8"]->.uats;
foreach.uats->.u(.u out tags;.u map_to_area->.a;way(area.a)["highway"~"${DRUMURI}"]["name"];out tags;);`;

const pauza = (ms) => new Promise((r) => setTimeout(r, ms));

async function descarca(cod) {
  for (let incercare = 0; incercare < 6; incercare++) {
    const server = SERVERE[incercare % SERVERE.length];
    try {
      const r = await fetch(server, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "salariile.ro anunturi (https://salariile.ro/contact)" },
        body: "data=" + encodeURIComponent(cerere(cod)),
        signal: AbortSignal.timeout(1_000_000),
      });
      const text = await r.text();
      // Overpass poate răspunde 200 cu o listă goală și eroarea în „remark” (timeout, memorie):
      // pe 28 septembrie 2026, 7 județe au venit așa, cu 0 unități. Un județ fără unități e o eroare.
      if (r.ok && text.startsWith("{")) {
        const j = JSON.parse(text);
        if (j.elements?.some((e) => e.type === "relation")) return j;
        console.log(`  ${cod}: răspuns fără unități${j.remark ? ` (${j.remark.slice(0, 80)})` : ""}; reîncerc`);
      } else console.log(`  ${cod}: ${server} a răspuns ${r.status}; reîncerc`);
    } catch (e) { console.log(`  ${cod}: ${server} ${e.message}; reîncerc`); }
    await pauza(30_000 * (incercare + 1));
  }
  throw new Error(`${cod}: niciun server nu a răspuns`);
}

const ceruti = process.argv.slice(2).length ? process.argv.slice(2) : COduri;
for (const cod of ceruti) {
  const fisier = `${DIR}/${cod}.json`;
  if (fs.existsSync(fisier)) { console.log(`${cod}: există, sar`); continue; }
  const t = Date.now();
  const j = await descarca(cod).catch((e) => { console.log(e.message); return null; });
  if (!j) continue;
  const uat = [];
  for (const e of j.elements) {
    if (e.type === "relation") uat.push({ uat: e.tags.name, strazi: new Set() });
    else if (uat.length) uat.at(-1).strazi.add(e.tags.name.trim());
  }
  const iesire = uat.map((u) => ({ uat: u.uat, strazi: [...u.strazi].sort((a, b) => a.localeCompare(b, "ro")) }));
  fs.writeFileSync(fisier, JSON.stringify(iesire));
  console.log(`${cod}: ${iesire.length} unități, ${iesire.reduce((s, u) => s + u.strazi.length, 0)} străzi, ${Math.round((Date.now() - t) / 1000)}s`);
  await pauza(10_000);
}
