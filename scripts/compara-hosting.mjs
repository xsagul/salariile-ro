#!/usr/bin/env node
// scripts/compara-hosting.mjs
//
// Compară, URL cu URL, două găzduiri ale aceluiași site: tot ce vede Google.
//
// De ce există: la mutarea de pe Vercel pe Cloudflare (septembrie 2026),
// pozițiile din Google țin de URL-uri, coduri de status, canonical, titluri,
// meta, JSON-LD, linkuri interne și conținut — nu de furnizorul de hosting.
// Dacă toate ies identice pe fiecare URL din sitemap, mutarea e invizibilă
// pentru Google.
//
//   node scripts/compara-hosting.mjs --a=https://salariile.ro --b=http://127.0.0.1:8788
//
// Iese cu cod 1 la orice diferență care nu e trecută explicit mai jos ca asumată.

const arg = (nume, implicit) => {
  const gasit = process.argv.find((x) => x.startsWith(`--${nume}=`));
  return gasit ? gasit.slice(nume.length + 3) : implicit;
};
const A = arg("a", "https://salariile.ro").replace(/\/+$/, "");
const B = arg("b", "http://127.0.0.1:8788").replace(/\/+$/, "");
const UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

// Diferențe cunoscute, fiecare cu motivul ei. Orice altceva pică verificarea.
const DESCARCARI_STATICE =
  "Linkul de descărcare trece de la /api/...?format= (rută dinamică) la fișier static /date/...; vechiul URL are 301 în _redirects și e blocat în robots.txt.";
const TEXT_LEGAL = "Textul legal numește noul furnizor (Cloudflare, Web Analytics cookieless) și data actualizării.";
const ASUMATE = new Map([
  [
    "/info|status",
    "Vercel dădea 410; găzduirea statică nu poate întoarce 410 și dă 404. URL-ul e scos din sitemap și din linkuri de luni de zile, iar pe termen lung Google tratează 404 și 410 la fel.",
  ],
  ["/zile-libere-2026|linkuriInterne", DESCARCARI_STATICE],
  ["/zile-libere-2027|linkuriInterne", DESCARCARI_STATICE],
  ["/zile-lucratoare-2027|linkuriInterne", DESCARCARI_STATICE],
  ["/date-salarii|linkuriInterne", DESCARCARI_STATICE],
  ["/cookies|text", TEXT_LEGAL],
  ["/cookies|jsonLd", TEXT_LEGAL],
  ["/politica-confidentialitate|text", TEXT_LEGAL],
  ["/politica-confidentialitate|jsonLd", TEXT_LEGAL],
  ["/despre|text", "Hostingul numit în secțiunea despre costuri: Cloudflare în loc de Vercel."],
  ["/sitemap.xml|corp", "lastmod actualizat pe cele 3 pagini al căror text s-a schimbat; verificat pe 12 septembrie 2026 că sunt singurele 3 linii diferite."],
  ["/llms.txt|corp", "Linia tehnică despre găzduire și analytics; verificat pe 12 septembrie 2026 că e singura linie diferită."],
]);

const SPECIALE = [
  "/calculator-salariu",
  "/calcul-salariu-net",
  "/calculator",
  "/salariu-minim/net",
  "/salariu-minim/",
  "/salarii/programator/",
  "/info",
  "/pagina-inexistenta-audit-migrare",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/manifest.webmanifest",
  "/widget/frame",
  "/widget/frame?brut=5000&variant=complet",
  "/widget/frame/fluturas",
];

const HEADERE = ["x-robots-tag", "strict-transport-security", "x-frame-options", "x-content-type-options", "referrer-policy"];
const eText = (tip) => /text\/|xml|json|markdown|manifest/.test(tip);
const eRedirect = (status) => status >= 300 && status < 400;
const permanent = (status) => status === 301 || status === 308;

async function cere(baza, cale) {
  const raspuns = await fetch(baza + cale, { redirect: "manual", headers: { "User-Agent": UA } });
  const tip = raspuns.headers.get("content-type") || "";
  return {
    status: raspuns.status,
    location: raspuns.headers.get("location"),
    tip,
    corp: eText(tip) ? await raspuns.text() : "",
    headere: raspuns.headers,
  };
}

const faraGazda = (url) => {
  if (!url) return url;
  const u = new URL(url, "http://gazda");
  return u.pathname + u.search;
};

const primul = (html, re) => {
  const m = html.match(re);
  return m ? m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : null;
};

function seo(html) {
  const jsonLd = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => {
      try {
        return JSON.stringify(JSON.parse(m[1]));
      } catch {
        return m[1].trim();
      }
    })
    .sort();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const linkuri = [...new Set([...html.matchAll(/<a\b[^>]*href="(\/[^"#?]*)/gi)].map((m) => m[1]))].sort();
  return {
    title: primul(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: primul(html, /<meta name="description" content="([^"]*)"/i),
    robots: primul(html, /<meta name="robots" content="([^"]*)"/i),
    canonical: primul(html, /<link rel="canonical" href="([^"]*)"/i),
    h1: primul(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
    jsonLd: jsonLd.join(" | "),
    linkuriInterne: linkuri.join(" "),
    text,
  };
}

// Pe Cloudflare script-src primește domeniul beacon-ului Web Analytics; restul
// politicii trebuie să fie identic.
const csp = (headere) => (headere.get("content-security-policy") || "").replace(" https://static.cloudflareinsights.com", "");

const diferente = [];
const asumate = [];

function compara(url, camp, a, b) {
  if (a === b) return;
  let [va, vb] = [String(a), String(b)];
  if (va.length > 160 || vb.length > 160) {
    let i = 0;
    while (i < va.length && va[i] === vb[i]) i += 1;
    [va, vb] = [va.slice(Math.max(0, i - 60), i + 100), vb.slice(Math.max(0, i - 60), i + 100)];
  }
  const intrare = { url, camp, a: va, b: vb };
  const motiv = ASUMATE.get(`${url}|${camp}`);
  if (motiv) asumate.push({ ...intrare, motiv });
  else diferente.push(intrare);
}

async function verifica(url) {
  const [a, b] = await Promise.all([cere(A, url), cere(B, url)]);
  if (eRedirect(a.status) && eRedirect(b.status)) {
    compara(url, "redirect.destinatie", faraGazda(a.location), faraGazda(b.location));
    compara(url, "redirect.permanent", permanent(a.status), permanent(b.status));
    return;
  }
  compara(url, "status", a.status, b.status);
  if (a.status !== b.status) return;

  for (const nume of HEADERE) compara(url, `header.${nume}`, a.headere.get(nume), b.headere.get(nume));

  if (url.startsWith("/widget/frame")) {
    // Iframe-urile sunt noindex, iar pe Cloudflare parametrii se aplică în
    // browser. Contează doar că rămân încadrabile pe alte site-uri.
    const incadrabil = (h) => /frame-ancestors \*/.test(h.get("content-security-policy") || "");
    compara(url, "header.csp.frame-ancestors", incadrabil(a.headere), incadrabil(b.headere));
    return;
  }

  compara(url, "header.content-security-policy", csp(a.headere), csp(b.headere));

  if (a.tip.includes("text/html")) {
    const [sa, sb] = [seo(a.corp), seo(b.corp)];
    for (const camp of Object.keys(sa)) compara(url, camp, sa[camp], sb[camp]);
  } else if (eText(a.tip)) {
    compara(url, "corp", a.corp.trim(), b.corp.trim());
  }
}

const sitemap = await (await fetch(`${A}/sitemap.xml`, { headers: { "User-Agent": UA } })).text();
const dinSitemap = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const toate = [...new Set([...dinSitemap, ...SPECIALE])];

let urmatorul = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (urmatorul < toate.length) {
      const url = toate[urmatorul];
      urmatorul += 1;
      try {
        await verifica(url);
      } catch (eroare) {
        diferente.push({ url, camp: "eroare", a: "", b: eroare instanceof Error ? eroare.message : String(eroare) });
      }
    }
  }),
);

console.log(`Comparat: ${toate.length} URL-uri (${dinSitemap.length} din sitemap + cazuri speciale)`);
console.log(`  A = ${A}`);
console.log(`  B = ${B}`);
for (const d of asumate) console.log(`ASUMAT  ${d.url} ${d.camp}: ${d.a} -> ${d.b}\n        ${d.motiv}`);
for (const d of diferente.slice(0, 80)) console.log(`DIFERIT ${d.url} · ${d.camp}\n   A: ${d.a}\n   B: ${d.b}`);
if (diferente.length > 80) console.log(`... încă ${diferente.length - 80} diferențe`);
console.log(diferente.length ? `\n${diferente.length} diferențe neasumate.` : "\nOK: identic pe tot ce vede Google.");
process.exit(diferente.length ? 1 : 0);
