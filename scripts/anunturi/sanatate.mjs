#!/usr/bin/env node
// Verifică, pe site-ul publicat, că paginile hubului de anunțuri ajung întregi la vizitator.
//
// De ce există: pe 10–12 noiembrie 2026 lista națională a răspuns 200 cu pagina goală (doar bara de
// sus) timp de două zile. Un emoji tăiat în două în descrierea unui anunț oprea Worker-ul la mijlocul
// paginii, după ce statusul plecase deja. Niciun test nu vede asta: codul era corect pentru toate
// anunțurile de până atunci. Se vede numai pe pagina servită.
//
// Ce verifică: lista națională, fiecare listă și fiecare anunț din /locuri-de-munca/sitemap.xml
// răspund 200, se termină cu </html>, iar listele chiar conțin anunțuri. Iese cu 1 la prima
// problemă, deci workflow-ul pică și GitHub trimite email.
//
//   node scripts/anunturi/sanatate.mjs                 # https://salariile.ro
//   node scripts/anunturi/sanatate.mjs http://127.0.0.1:8788

const SITE = (process.argv[2] ?? "https://salariile.ro").replace(/\/+$/, "");
const MAXIM = 80; // cereri pe rulare: fiecare e o invocare de Worker
const UA = "Mozilla/5.0 (compatible; salariile-sanatate/1.0)";

const ia = async (cale) => {
  const r = await fetch(`${SITE}${cale}`, { headers: { "user-agent": UA }, redirect: "manual" });
  return { status: r.status, text: await r.text() };
};

const probleme = [];
const harta = await ia("/locuri-de-munca/sitemap.xml");
if (harta.status !== 200) {
  console.error(`sitemap-ul hubului răspunde ${harta.status}`);
  process.exit(1);
}
const adrese = [...harta.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const anunturi = adrese.filter((a) => a.startsWith("/anunt-angajare-"));
const liste = [...new Set(["/locuri-de-munca", ...adrese.filter((a) => a.startsWith("/locuri-de-munca"))])];

for (const cale of [...liste, ...anunturi].slice(0, MAXIM)) {
  const { status, text } = await ia(cale);
  const lista = cale.startsWith("/locuri-de-munca");
  if (status !== 200) probleme.push(`${cale}: status ${status}`);
  else if (!text.includes("</html>")) probleme.push(`${cale}: pagina e tăiată (${text.length} caractere, fără </html>)`);
  else if (!/<h1[\s>]/.test(text)) probleme.push(`${cale}: fără titlu (h1)`);
  else if (lista && anunturi.length && !text.includes("data-anunt=")) probleme.push(`${cale}: lista nu arată niciun anunț, deși sitemap-ul are ${anunturi.length}`);
  else if (!lista && !text.includes('"@type":"JobPosting"')) probleme.push(`${cale}: anunț fără JobPosting`);
}

console.log(`${SITE}: ${liste.length} liste și ${anunturi.length} anunțuri verificate`);
if (probleme.length) {
  console.error(`\n${probleme.length} probleme:\n- ${probleme.join("\n- ")}`);
  process.exit(1);
}
console.log("Toate paginile ajung întregi.");
