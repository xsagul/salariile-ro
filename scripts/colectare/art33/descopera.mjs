// Descoperă cel mai recent fișier de transparență salarială (art. 33) al fiecărei instituții.
//
//   node scripts/colectare/art33/descopera.mjs [--surse=id1,id2] [--toate]
//
// Pornește de la `pagina` din colectare/art33/surse.json: citește linkurile, urmează o dată
// paginile despre „transparență / venituri salariale”, apoi alege documentul (PDF, XLS, XLSX)
// cu cea mai recentă dată din adresă sau din textul linkului. Instituțiile publică pe 31
// martie și 30 septembrie, deci rularea de la începutul lui aprilie și octombrie găsește
// fișierele noi fără căutări manuale. Fără `--toate`, sare peste sursele care au deja fișier.
import fs from "node:fs";

const REG = "colectare/art33/surse.json";
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}`))?.split("=")[1] ?? (process.argv.includes(`--${k}`) ? true : null);
const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
const DOC = /\.(pdf|xlsx?|ods)(\?|#|$)/i;
const DESPRE = /transparen|venituri[\s_-]*salari|salarii|salarizare|drepturi[\s_-]*salariale/i;

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

async function ia(url) {
  const r = await fetch(url, { headers: { "user-agent": "salariile.ro colectare (https://salariile.ro/metodologie)" }, redirect: "follow", signal: AbortSignal.timeout(45_000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return { html: await r.text(), url: r.url };
}

function linkuri(html, baza) {
  const out = [];
  for (const m of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const href = new URL(m[1].replace(/&amp;/g, "&"), baza).href;
      const text = m[2].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
      out.push({ href, text });
    } catch { /* adresă invalidă */ }
  }
  return out;
}

/** Luna documentului (AAAA-LL): întâi din numele fișierului și textul linkului, apoi din
 *  folderul de încărcare (…/2026/08/…), care spune doar când a fost urcat fișierul. */
export function lunaDocument(href, text) {
  const cale = decodeURIComponent(new URL(href).pathname);
  const nume = cale.split("/").pop();
  return lunaDin(`${nume} ${text}`) ?? lunaDin(cale);
}

function lunaDin(s) {
  const t = norm(s);
  let best = null;
  const pune = (an, luna) => { if (an >= 2015 && an <= 2035 && luna >= 1 && luna <= 12) { const v = `${an}-${String(luna).padStart(2, "0")}`; if (!best || v > best) best = v; } };
  for (const m of t.matchAll(/(\d{1,2})[._-](\d{1,2})[._-](20\d{2})/g)) pune(+m[3], +m[2]);
  for (const m of t.matchAll(/(20\d{2})[._/-](\d{1,2})(?!\d)/g)) pune(+m[1], +m[2]);
  LUNI.forEach((l, i) => { for (const m of t.matchAll(new RegExp(`${l}[^0-9]{0,12}(20\\d{2})`, "g"))) pune(+m[1], i + 1); });
  return best;
}

async function descopera(sursa) {
  const start = await ia(sursa.pagina);
  let candidati = linkuri(start.html, start.url);
  // O dată mai adânc: paginile despre transparență salarială din același site.
  const pagini = candidati.filter((l) => !DOC.test(l.href) && DESPRE.test(`${l.href} ${l.text}`) && new URL(l.href).host === new URL(start.url).host).slice(0, 6);
  for (const p of pagini) {
    try { const r = await ia(p.href); candidati = candidati.concat(linkuri(r.html, r.url)); } catch { /* pagină indisponibilă */ }
    await new Promise((res) => setTimeout(res, 800));
  }
  const docs = candidati
    .filter((l) => DOC.test(l.href) && /transparen|venit|salari|salar|drepturi/i.test(norm(`${decodeURIComponent(l.href)} ${l.text}`)))
    // Transparența decizională și rapoartele anuale nu sunt liste de salarii.
    .filter((l) => !/decizional|informatii[\s_-]*publice|raport[\s_-]*anual|buget|cheltuieli/i.test(norm(`${decodeURIComponent(l.href)} ${l.text}`)))
    .map((l) => ({ ...l, luna: lunaDocument(l.href, l.text) }))
    .filter((l) => l.luna);
  docs.sort((a, b) => (a.luna < b.luna ? 1 : -1));
  return docs[0] ?? null;
}

async function main() {
  const reg = JSON.parse(fs.readFileSync(REG, "utf8"));
  const doar = typeof arg("surse") === "string" ? arg("surse").split(",") : null;
  for (const s of reg.surse) {
    if (doar && !doar.includes(s.id)) continue;
    if (s.fisier && !arg("toate") && !doar) continue;
    try {
      const d = await descopera(s);
      if (d) {
        if (d.href !== s.fisier) { s.fisier = d.href; s.perioada = d.luna; s.gasitLa = new Date().toISOString().slice(0, 10); delete s.nota; }
        console.log(`${s.id}: ${d.luna} ${d.href}`);
      } else console.log(`${s.id}: niciun document datat`);
    } catch (e) { console.log(`${s.id}: ${e.message}`); }
    await new Promise((res) => setTimeout(res, 1000));
  }
  fs.writeFileSync(REG, JSON.stringify(reg, null, 1));
}

main().catch((e) => { console.error(e); process.exit(1); });
