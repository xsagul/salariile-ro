// scripts/genereaza-cloudflare.mts
//
// Rulează după `next build` (output: "export") și scrie în out/ ce aplică
// Cloudflare la edge. Exportul static ignoră headers() și redirects() din
// next.config.ts, iar pe găzduirea statică nu există middleware:
//
//   _headers    securitate + CSP, din src/lib/csp.ts
//   _redirects  redirecturile permanente, din src/lib/redirecturi.ts
//
// Fișierele `<ruta>.md` pentru agenți AI au fost scoase pe 15 septembrie 2026:
// aproape niciun agent nu le cerea, iar Googlebot descărcase 974 într-o zi, fără
// noindex și fără canonical — copii duplicate ale paginilor.
//
// `--previzualizare` adaugă X-Robots-Tag noindex pe tot. Google cere noindex pe
// hostname-ul temporar (workers.dev) cât timp se testează înainte de mutare.

import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CSP_PAGINI_PUBLICE, CSP_WIDGET, LINK_HEADER } from "../src/lib/csp";
import { REDIRECTURI } from "../src/lib/redirecturi";
import { FISIERE_CALENDAR } from "../src/lib/export-calendar";

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
  // HSTS e deținut de setarea zonei (SSL/TLS → Edge Certificates → HSTS, pornită pe
  // 15 septembrie 2026: 12 luni, subdomenii, preload), care îl înlocuiește pe acesta
  // și îl pune și pe redirecturile www. Valoarea de aici e aceeași, ca rezervă.
  "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
];

// Asseturile n-au avut niciodată CSP sau Link: nu sunt documente, iar pe Vercel
// matcher-ul proxy-ului excludea orice cale cu extensie.
const ASSETURI = ["/_next/*", "/_img/*", "/*.txt", "/*.xml", "/*.json", "/*.webmanifest", "/*.csv", "/*.ics"];
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

console.log(
  `Cloudflare: _headers ${headere.length} reguli · _redirects ${redirecturi.length}` +
    (previzualizare ? " · PREVIZUALIZARE (noindex pe tot)" : ""),
);
