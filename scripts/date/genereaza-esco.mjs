// Ce face fiecare meserie, din clasificarea europeană ESCO (Comisia Europeană), în română:
// descrierea ocupației și aptitudinile/cunoștințele esențiale. Pagina meseriei le arată sub cifră
// (13 noiembrie 2026, cererea proprietarului: paginile cu un singur card păreau goale dedesubt).
// Potrivirea: căutarea ESCO după numele meseriei; când meseria are cod COR, grupa ISCO din ESCO
// trebuie să fie aceeași cu primele 4 cifre ale codului COR (COR e ISCO-08 adaptat).
// Rulare: node scripts/date/genereaza-esco.mjs [--doar=slug,slug] ; scrie src/data/esco-meserii.json
// Licență ESCO: reutilizare liberă cu menționarea sursei (Decizia Comisiei 2011/833/UE).
import fs from "node:fs";
const API = "https://ec.europa.eu/esco/api";
const cat = JSON.parse(fs.readFileSync("src/data/meserii-catalog.json", "utf8")).meserii;
const cor = JSON.parse(fs.readFileSync("src/data/cor-meserii.json", "utf8")).occupations;
const iesire = "src/data/esco-meserii.json";
const vechi = fs.existsSync(iesire) ? JSON.parse(fs.readFileSync(iesire, "utf8")).meserii : {};
// Alegeri făcute de mână: un URI ESCO („http…”) sau termenul de căutat în locul numelui din catalog.
// „-” înseamnă că ESCO nu are ocupația (pagina rămâne fără secțiune).
const FORTAT = JSON.parse(fs.readFileSync("scripts/date/esco-fortat.json", "utf8"));
const fortat = (slug) => (Object.hasOwn(FORTAT, slug) ? FORTAT[slug] : null);
const doar = process.argv.find((a) => a.startsWith("--doar="))?.slice(7).split(",");
const get = async (u) => { for (let i = 0; i < 3; i++) { try { const r = await fetch(u, { signal: AbortSignal.timeout(30000) }); if (r.ok) return r.json(); } catch {} await new Promise((s) => setTimeout(s, 1500)); } throw new Error("ESCO nu răspunde: " + u); };
const iscoDin = (o) => String(o.code ?? "").slice(0, 4);
const rezultat = { ...vechi };
for (const m of cat) {
  if (doar && !doar.includes(m.slug)) continue;
  const corCod = cor[m.slug]?.code ?? null;
  const f = fortat(m.slug);
  if (f === "-") { delete rezultat[m.slug]; console.log("FĂRĂ (ales)", m.slug); continue; }
  let uri = f?.startsWith("http") ? f : null, motiv = uri ? "ales de mână" : null;
  const termeni = [...new Set([f && !f.startsWith("http") ? f : m.nume, cor[m.slug]?.name].filter(Boolean))];
  for (const t of uri ? [] : termeni) {
    const s = await get(`${API}/search?text=${encodeURIComponent(t)}&language=ro&type=occupation&limit=8&full=false`);
    for (const c of s._embedded?.results ?? []) {
      if (!corCod) { uri = c.uri; motiv = f ? `căutat „${t}”, verificat de mână` : "DE VERIFICAT: fără cod COR"; break; }
      const o = await get(`${API}/resource/occupation?uri=${encodeURIComponent(c.uri)}&language=ro`);
      if (iscoDin(o) === corCod.slice(0, 4)) { uri = c.uri; motiv = `grupa ISCO ${iscoDin(o)} = COR ${corCod} („${t}”)`; break; }
    }
    if (uri) break;
  }
  if (!uri) { console.log("FĂRĂ", m.slug, m.nume, corCod); delete rezultat[m.slug]; continue; }
  const o = await get(`${API}/resource/occupation?uri=${encodeURIComponent(uri)}&language=ro`);
  const esentiale = o._links?.hasEssentialSkill ?? [];
  const tip = (s) => String(s.skillType ?? "").split("/").pop();
  rezultat[m.slug] = {
    titlu: o.preferredLabel?.ro ?? o.title,
    uri, isco: iscoDin(o), potrivire: motiv,
    descriere: (o.description?.ro?.literal ?? "").replace(/\s+/g, " ").trim(),
    face: esentiale.filter((s) => tip(s) === "skill").map((s) => s.title),
    stie: esentiale.filter((s) => tip(s) === "knowledge").map((s) => s.title),
  };
  console.log(m.slug.padEnd(28), "→", rezultat[m.slug].titlu, "|", motiv, "|", rezultat[m.slug].face.length, "/", rezultat[m.slug].stie.length);
}
fs.writeFileSync(iesire, JSON.stringify({ sursa: "ESCO, clasificarea europeană a aptitudinilor, competențelor, calificărilor și ocupațiilor (Comisia Europeană), versiunea în limba română", url: "https://esco.ec.europa.eu/ro", citit: new Date().toISOString().slice(0, 10), meserii: Object.fromEntries(Object.entries(rezultat).sort()) }, null, 1) + "\n");
