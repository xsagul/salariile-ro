// src/lib/csp.ts
//
// Proprietarul unic al politicii CSP și al header-ului `Link`.
//
// De ce există: până pe 10 septembrie 2026 aceste headere se puneau din
// `src/proxy.ts`, deci middleware-ul rula la FIECARE cerere HTML — inclusiv la
// fiecare trecere de bot, iar `robots.txt` e deschis către toți boții AI.
// Pe rutele publice headerul e un șir constant: nu depinde de cerere, deci nu
// are ce căuta într-o funcție. Mutat în `next.config.ts`, îl pune CDN-ul, fără
// nicio invocare. Middleware-ul rămâne doar unde chiar e nevoie de cerere:
// nonce-ul per cerere pe rutele de widget și negocierea de conținut markdown.
//
// Importat din DOUĂ locuri, de aceea stă separat:
//   - `next.config.ts`  → varianta constantă, pentru paginile publice
//   - `src/proxy.ts`    → varianta cu nonce, pentru /widget/frame*

/**
 * Header `Link` (RFC 8288) pentru descoperirea de către agenți AI:
 * sitemap-ul și llms.txt.
 */
export const LINK_HEADER =
  '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="describedby"; type="text/markdown"';

/**
 * Construiește politica CSP.
 *
 * `scriptSrc` și `frameAncestors` sunt singurele care diferă între rutele
 * publice și cele embeddabile. Restul directivelor sunt identice peste tot.
 */
export function construiesteCsp({
  scriptSrc,
  frameAncestors,
  development = false,
}: {
  scriptSrc: string;
  frameAncestors: string;
  development?: boolean;
}): string {
  return `
    default-src 'self';
    script-src ${scriptSrc}${development ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors ${frameAncestors};
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Politica pentru paginile publice.
 *
 * De ce `'unsafe-inline'` și nu nonce: un nonce e prin definiție incompatibil
 * cu o pagină cache-uită — HTML-ul servit din edge la o mie de oameni are un
 * singur nonce, deci nonce-ul nu mai e secret. Iar paginile publice sunt
 * statice și NU primesc input de la utilizator (fără conturi, fără bază de
 * date, `/calculator/[valoare]` e allowlist-only), deci nu există vector de
 * injecție pe care `'unsafe-inline'` să-l deschidă.
 *
 * Evaluat o singură dată, la încărcarea configului: nu depinde de cerere.
 */
export const CSP_PAGINI_PUBLICE = construiesteCsp({
  scriptSrc: "'self' 'unsafe-inline'",
  frameAncestors: "'none'",
  development: process.env.NODE_ENV === "development",
});
