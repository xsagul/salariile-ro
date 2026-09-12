// scripts/genereaza-cloudflare.mts
//
// Rulează după `next build` (output: "export") și scrie în out/ ce aplică
// Cloudflare la edge. Exportul static ignoră headers() și redirects() din
// next.config.ts, iar pe găzduirea statică nu există middleware:
//
//   _headers    securitate + CSP, din src/lib/csp.ts
//   _redirects  redirecturile permanente, din src/lib/redirecturi.ts
//   <ruta>.md   Markdown pentru agenți AI, din src/lib/markdown-rute.ts
//
// `--previzualizare` adaugă X-Robots-Tag noindex pe tot. Google cere noindex pe
// hostname-ul temporar (workers.dev) cât timp se testează înainte de mutare.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CSP_PAGINI_PUBLICE, CSP_WIDGET, LINK_HEADER } from "../src/lib/csp";
import { REDIRECTURI } from "../src/lib/redirecturi";
import { FISIERE_CALENDAR } from "../src/lib/export-calendar";
import { ALLOWED_MARKDOWN_PATHS } from "../src/lib/markdown-rute";
import { htmlInMarkdown } from "../src/lib/markdown-agenti";

const OUT = path.join(process.cwd(), "out");
const previzualizare = process.argv.includes("--previzualizare");

if (!existsSync(path.join(OUT, "index.html"))) {
  throw new Error("out/index.html lipsește: rulează întâi `next build` cu output: export.");
}

const bloc = (cale: string, linii: string[]) => [cale, ...linii.map((linie) => `  ${linie}`)].join("\n");

// Aceleași headere de securitate pe care next.config.ts le punea pe toate rutele.
const SECURITATE = [
  "X-Content-Type-Options: nosniff",
  "Referrer-Policy: strict-origin-when-cross-origin",
  "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
];

// Asseturile n-au avut niciodată CSP sau Link: nu sunt documente, iar pe Vercel
// matcher-ul proxy-ului excludea orice cale cu extensie.
const ASSETURI = ["/_next/*", "/_img/*", "/*.txt", "/*.xml", "/*.json", "/*.webmanifest", "/*.csv", "/*.ics", "/*.md"];
const IMAGINI_SI_FONTURI = ["/*.png", "/*.jpg", "/*.jpeg", "/*.webp", "/*.svg", "/*.ico", "/*.woff2"];
const FARA_DOCUMENT = ["! Content-Security-Policy", "! Link"];

// Descărcările: pe Vercel rutele puneau X-Robots-Tag și numele fișierului salvat.
// Exportul static păstrează doar conținutul, deci headerele se refac aici.
const DESCARCARI: Array<[string, string]> = [
  ["/date/grila-invatamant.csv", "grila-invatamant-2026.csv"],
  ["/date/salarii-serie-ins.csv", "salarii-serie-ins.csv"],
  ["/date/salarii-serie-ins.json", "salarii-serie-ins.json"],
  ...FISIERE_CALENDAR.map((fisier): [string, string] => [`/date/calendar/${fisier}`, `calendar-${fisier}`]),
];

const headere = [
  bloc("/*", [
    ...SECURITATE,
    "X-Frame-Options: DENY",
    "Cross-Origin-Opener-Policy: same-origin",
    `Content-Security-Policy: ${CSP_PAGINI_PUBLICE}`,
    `Link: ${LINK_HEADER}`,
    ...(previzualizare ? ["X-Robots-Tag: noindex, nofollow, noarchive"] : []),
  ]),
  ...ASSETURI.map((cale) => bloc(cale, FARA_DOCUMENT)),
  // Fișierele din public/ nu au hash în nume: TTL finit, ca înlocuirea unei
  // imagini să nu rămână un an în cache-ul browserului. Aceeași regulă ca pe Vercel.
  ...IMAGINI_SI_FONTURI.map((cale) =>
    bloc(cale, [...FARA_DOCUMENT, "Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"]),
  ),
  // Doar fișierele cu hash în nume sunt imuabile.
  bloc("/_next/static/*", ["Cache-Control: public, max-age=31536000, immutable"]),
  // Fișierele de date nu sunt pagini: nu se indexează, se descarcă cu numele lor.
  bloc("/date/*", ["X-Robots-Tag: noindex"]),
  ...DESCARCARI.map(([cale, nume]) => bloc(cale, [`Content-Disposition: attachment; filename="${nume}"`])),
  // Iframe-urile: încadrabile pe orice site, fără X-Frame-Options.
  ...["/widget/frame", "/widget/frame/fluturas"].map((cale) =>
    bloc(cale, ["! X-Frame-Options", "! Cross-Origin-Opener-Policy", "! Content-Security-Policy", `Content-Security-Policy: ${CSP_WIDGET}`]),
  ),
];
writeFileSync(path.join(OUT, "_headers"), `${headere.join("\n")}\n`);

// Ultima regulă: slash final → fără slash, permanent. Vercel dădea 308; fără ea,
// Cloudflare dă 307 (temporar). Verificat cu wrangler dev pe 12 septembrie 2026:
// /salariu-minim/ → 301 → /salariu-minim, iar / rămâne 200, fără buclă.
const redirecturi = [...REDIRECTURI.map(({ de, la }) => `${de} ${la} 301`), "/*/ /:splat 301"];
writeFileSync(path.join(OUT, "_redirects"), `${redirecturi.join("\n")}\n`);

let markdown = 0;
for (const ruta of ALLOWED_MARKDOWN_PATHS) {
  const fisierHtml = path.join(OUT, ruta === "/" ? "index.html" : `${ruta.slice(1)}.html`);
  if (!existsSync(fisierHtml)) {
    throw new Error(`Lipsește ${fisierHtml}, necesar pentru reprezentarea Markdown a ${ruta}.`);
  }
  const fisierMd = path.join(OUT, ruta === "/" ? "index.md" : `${ruta.slice(1)}.md`);
  writeFileSync(fisierMd, htmlInMarkdown(readFileSync(fisierHtml, "utf8")));
  markdown += 1;
}

console.log(
  `Cloudflare: _headers ${headere.length} reguli · _redirects ${redirecturi.length} · Markdown ${markdown} fișiere` +
    (previzualizare ? " · PREVIZUALIZARE (noindex pe tot)" : ""),
);
