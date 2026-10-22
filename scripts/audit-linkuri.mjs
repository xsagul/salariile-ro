// Auditul linkurilor interne pe site-ul live (22 octombrie 2026, cererea proprietarului).
//
// Parcurge salariile.ro pornind de la homepage și de la cele două sitemap-uri, urmează fiecare
// <a href> intern și raportează, după ghidul Google despre linkuri (developers.google.com/search/
// docs/crawling-indexing/links-crawlable):
//   - linkuri moarte (4xx/5xx) și linkuri spre redirecționări (merg direct la adresa finală);
//   - pagini din sitemap fără niciun link intern spre ele (orfane) sau doar din meniu/subsol;
//   - adâncimea în clicuri de la homepage (paginile importante, la cel mult 3);
//   - linkuri spre pagini noindex, linkuri interne nofollow, texte de link goale sau generice,
//     același text de link spre adrese diferite, adrese cu „www”, „http” sau „/” la final.
//
// Rulare: node scripts/audit-linkuri.mjs [--max=4000] [--paralel=6]
// Rezultatul: research/audit-linkuri/<data>.json și un rezumat în terminal. Nu scrie nimic pe site;
// face doar cereri GET, câte `paralel` deodată.
import * as cheerio from "cheerio";
import fs from "node:fs";

const SITE = "https://salariile.ro";
const arg = (n, d) => Number(process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1] ?? d);
const MAX = arg("max", 4000);
const PARALEL = arg("paralel", 6);
const UA = "salariile-audit-linkuri/1.0 (+https://salariile.ro/contact)";
const GENERICE = /^(aici|click aici|apasă aici|apasa aici|citește mai mult|citeste mai mult|mai mult|detalii|vezi|vezi mai mult|link|află mai multe|afla mai multe|continuă|continua)$/i;

/** Adresa internă, normalizată: fără fragment; `null` pentru linkuri externe sau neparcurse. */
function intern(href, de) {
  if (!href || /^(mailto:|tel:|javascript:|data:|#)/i.test(href)) return null;
  let u;
  try { u = new URL(href, de); } catch { return null; }
  if (!/^(www\.)?salariile\.ro$/.test(u.hostname)) return null;
  u.hash = "";
  return u;
}

async function cere(url) {
  for (let incercare = 0; incercare < 3; incercare++) {
    try {
      const r = await fetch(url, { redirect: "manual", headers: { "user-agent": UA } });
      const tip = r.headers.get("content-type") ?? "";
      const corp = r.status === 200 && tip.includes("text/html") ? await r.text() : (await r.arrayBuffer(), "");
      return { status: r.status, locatie: r.headers.get("location"), tip, corp, robotsAntet: r.headers.get("x-robots-tag") ?? "" };
    } catch (e) {
      if (incercare === 2) return { status: 0, eroare: String(e), corp: "" };
      await new Promise((ok) => setTimeout(ok, 1000 * (incercare + 1)));
    }
  }
}

async function sitemap(url) {
  const r = await fetch(url, { headers: { "user-agent": UA } });
  const x = await r.text();
  return [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const pagini = new Map();   // cheie (cale + interogare) → { status, adancime, canonic, noindex, linkuri[] }
const tinte = new Map();    // cheie → { status, locatie }
const deParcurs = [];
const adauga = (cheie, adancime) => {
  if (pagini.has(cheie) || pagini.size + deParcurs.length >= MAX) return;
  pagini.set(cheie, { adancime });
  deParcurs.push(cheie);
};
const cheieDin = (u) => u.pathname + u.search;
// Paginile cu interogare (paginare, filtre, ?brut=) nu se parcurg: se verifică doar statusul lor.
const deParcurgere = (u) => !u.search && !/\.(pdf|csv|json|xml|txt|png|jpe?g|webp|svg|ico|zip|xlsx)$/i.test(u.pathname);

const dinSitemap = [...await sitemap(`${SITE}/sitemap.xml`), ...await sitemap(`${SITE}/locuri-de-munca/sitemap.xml`)]
  .map((s) => new URL(s)).filter((u) => /^(www\.)?salariile\.ro$/.test(u.hostname));
const cheiSitemap = new Set(dinSitemap.map(cheieDin));

adauga("/", 0);
let index = 0;
async function lucrator() {
  while (index < deParcurs.length) {
    const cheie = deParcurs[index++];
    const p = pagini.get(cheie);
    const r = await cere(SITE + cheie);
    Object.assign(p, { status: r.status, locatie: r.locatie, robotsAntet: r.robotsAntet });
    tinte.set(cheie, { status: r.status, locatie: r.locatie });
    if (r.status !== 200 || !r.corp) continue;
    const $ = cheerio.load(r.corp);
    p.canonic = $('link[rel="canonical"]').attr("href") ?? null;
    p.noindex = /noindex/i.test($('meta[name="robots"]').attr("content") ?? "") || /noindex/i.test(r.robotsAntet);
    p.titlu = $("title").first().text().trim();
    p.linkuri = [];
    $("a[href]").each((_, el) => {
      const a = $(el);
      const u = intern(a.attr("href"), SITE + cheie);
      if (!u) return;
      const text = (a.text().replace(/\s+/g, " ").trim() || a.find("img").attr("alt") || a.attr("aria-label") || "").slice(0, 120);
      const zona = a.closest("header").length ? "antet" : a.closest("footer").length ? "subsol" : a.closest("nav").length ? "navigare" : "continut";
      p.linkuri.push({ href: a.attr("href"), tinta: cheieDin(u), gazda: u.host, protocol: u.protocol, text, rel: a.attr("rel") ?? "", zona });
      if (deParcurgere(u)) adauga(cheieDin(u), p.adancime + 1);
    });
  }
}
await Promise.all(Array.from({ length: PARALEL }, lucrator));
// Paginile din sitemap la care nu s-a ajuns prin linkuri: se cer și ele, ca să fie verificate.
for (const c of cheiSitemap) if (!pagini.has(c)) { pagini.set(c, { adancime: null }); deParcurs.push(c); }
await Promise.all(Array.from({ length: PARALEL }, lucrator));

// Țintele cu interogare: doar statusul.
const cuInterogare = new Set();
for (const p of pagini.values()) for (const l of p.linkuri ?? []) if (!pagini.has(l.tinta) && !tinte.has(l.tinta)) cuInterogare.add(l.tinta);
const lista = [...cuInterogare];
let j = 0;
await Promise.all(Array.from({ length: PARALEL }, async () => {
  while (j < lista.length) { const c = lista[j++]; const r = await cere(SITE + c); tinte.set(c, { status: r.status, locatie: r.locatie }); }
}));

// Analiza.
const intrari = new Map(); // țintă → { total, continut, surse: Set }
const rezultat = { moarte: [], redirectionari: [], spreNoindex: new Map(), nofollow: [], textGol: [], textGeneric: [], gazdaGresita: [], acelasiTextAdreseDiferite: [] };
const textSpreTinte = new Map();
for (const [sursa, p] of pagini) {
  for (const l of p.linkuri ?? []) {
    if (l.tinta === sursa) continue;
    const i = intrari.get(l.tinta) ?? { total: 0, continut: 0, surse: new Set() };
    i.total++; if (l.zona === "continut") i.continut++; i.surse.add(sursa);
    intrari.set(l.tinta, i);
    const t = tinte.get(l.tinta) ?? pagini.get(l.tinta);
    if (t && (t.status >= 400 || t.status === 0)) rezultat.moarte.push({ sursa, tinta: l.tinta, status: t.status, text: l.text });
    if (t && t.status >= 300 && t.status < 400) rezultat.redirectionari.push({ sursa, tinta: l.tinta, spre: t.locatie, status: t.status, text: l.text });
    const pt = pagini.get(l.tinta);
    if (pt?.noindex) rezultat.spreNoindex.set(l.tinta, (rezultat.spreNoindex.get(l.tinta) ?? 0) + 1);
    if (/nofollow/i.test(l.rel)) rezultat.nofollow.push({ sursa, tinta: l.tinta, text: l.text });
    if (!l.text) rezultat.textGol.push({ sursa, tinta: l.tinta, href: l.href });
    else if (GENERICE.test(l.text)) rezultat.textGeneric.push({ sursa, tinta: l.tinta, text: l.text });
    if (l.gazda !== "salariile.ro" || l.protocol !== "https:" || (l.tinta.length > 1 && /\/(\?|$)/.test(l.tinta))) rezultat.gazdaGresita.push({ sursa, href: l.href });
    if (l.zona === "continut" && l.text && !l.tinta.includes("?")) {
      const k = l.text.toLowerCase();
      const s = textSpreTinte.get(k) ?? new Set(); s.add(l.tinta); textSpreTinte.set(k, s);
    }
  }
}
for (const [text, s] of textSpreTinte) if (s.size > 1) rezultat.acelasiTextAdreseDiferite.push({ text, tinte: [...s] });

const indexabile = [...pagini].filter(([, p]) => p.status === 200 && !p.noindex);
const orfane = [...cheiSitemap].filter((c) => !(intrari.get(c)?.surse.size));
const doarMeniu = [...cheiSitemap].filter((c) => intrari.get(c)?.surse.size && !intrari.get(c).continut);
const adanci = [...cheiSitemap].filter((c) => { const a = pagini.get(c)?.adancime; return a == null || a > 3; });
const canonicAltaAdresa = indexabile.filter(([c, p]) => p.canonic && new URL(p.canonic, SITE).pathname !== new URL(SITE + c).pathname).map(([c, p]) => ({ pagina: c, canonic: p.canonic }));
const sitemapNeindexabil = [...cheiSitemap].filter((c) => { const p = pagini.get(c); return p && (p.status !== 200 || p.noindex); }).map((c) => ({ pagina: c, status: pagini.get(c).status, noindex: pagini.get(c).noindex }));
const adancimi = {};
for (const c of cheiSitemap) { const a = pagini.get(c)?.adancime; const k = a == null ? "neajuns" : String(a); adancimi[k] = (adancimi[k] ?? 0) + 1; }

const raport = {
  data: new Date().toISOString(), paginiCerute: pagini.size, inSitemap: cheiSitemap.size, indexabile: indexabile.length,
  adancimiSitemap: adancimi,
  moarte: rezultat.moarte, redirectionari: rezultat.redirectionari, orfane, doarMeniu, adanci,
  spreNoindex: Object.fromEntries([...rezultat.spreNoindex].sort((a, b) => b[1] - a[1]).slice(0, 50)),
  nofollow: rezultat.nofollow, textGol: rezultat.textGol, textGeneric: rezultat.textGeneric, gazdaGresita: rezultat.gazdaGresita,
  acelasiTextAdreseDiferite: rezultat.acelasiTextAdreseDiferite, canonicAltaAdresa, sitemapNeindexabil,
  intrari: Object.fromEntries([...cheiSitemap].map((c) => [c, { total: intrari.get(c)?.total ?? 0, continut: intrari.get(c)?.continut ?? 0, surse: intrari.get(c)?.surse.size ?? 0, adancime: pagini.get(c)?.adancime ?? null }])),
};
fs.mkdirSync("research/audit-linkuri", { recursive: true });
const fisier = `research/audit-linkuri/${raport.data.slice(0, 10)}.json`;
fs.writeFileSync(fisier, JSON.stringify(raport, null, 1));

const unic = (arr, k) => [...new Map(arr.map((x) => [k(x), x])).values()];
console.log(`Pagini cerute: ${raport.paginiCerute} · în sitemap: ${raport.inSitemap} · indexabile: ${raport.indexabile}`);
console.log(`Adâncimea paginilor din sitemap (clicuri de la homepage):`, adancimi);
console.log(`Linkuri moarte: ${rezultat.moarte.length} (ținte unice: ${unic(rezultat.moarte, (x) => x.tinta).length})`);
console.log(`Linkuri spre redirecționări: ${rezultat.redirectionari.length} (ținte unice: ${unic(rezultat.redirectionari, (x) => x.tinta).length})`);
console.log(`Orfane (în sitemap, fără niciun link): ${orfane.length} · doar din meniu/subsol: ${doarMeniu.length} · peste 3 clicuri: ${adanci.length}`);
console.log(`Spre pagini noindex: ${rezultat.spreNoindex.size} ținte · nofollow interne: ${rezultat.nofollow.length} · text gol: ${rezultat.textGol.length} · text generic: ${rezultat.textGeneric.length}`);
console.log(`Adrese scrise greșit (www/http/„/” final): ${rezultat.gazdaGresita.length} · același text spre adrese diferite: ${rezultat.acelasiTextAdreseDiferite.length}`);
console.log(`Canonic spre altă adresă: ${canonicAltaAdresa.length} · în sitemap, dar nu 200 indexabil: ${sitemapNeindexabil.length}`);
console.log(`Raportul complet: ${fisier}`);
