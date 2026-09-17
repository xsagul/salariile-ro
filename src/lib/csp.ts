// src/lib/csp.ts
//
// Proprietarul unic al politicii CSP și al header-ului `Link`.
//
// Pe Cloudflare site-ul e static: nu există middleware și nici server care să
// genereze un nonce per cerere. scripts/genereaza-cloudflare.mts scrie aceste
// politici în out/_headers, iar Cloudflare le aplică la edge.
//
// Istoric: până pe 10 septembrie 2026 CSP-ul se punea din src/proxy.ts la
// fiecare cerere HTML (o invocare de funcție pe Vercel, boți incluși), apoi din
// next.config.ts. La mutarea pe Cloudflare (septembrie 2026) proxy-ul a dispărut.

/**
 * Header `Link` (RFC 8288) pentru descoperirea de către agenți AI:
 * sitemap-ul și llms.txt.
 */
export const LINK_HEADER =
  '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="describedby"; type="text/markdown"';

/** Beacon-ul Cloudflare Web Analytics (cookieless), injectat automat la edge. */
export const CLOUDFLARE_INSIGHTS = "https://static.cloudflareinsights.com";
export const GOOGLE_TAG_MANAGER = "https://www.googletagmanager.com";
const GOOGLE_ANALYTICS_CONNECT =
  "https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com";
const ADSENSE_SCRIPT =
  "https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com https://fundingchoicesmessages.google.com";
const ADSENSE_FRAME =
  "https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://fundingchoicesmessages.google.com";
const ADSENSE_CONNECT =
  "https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://csi.gstatic.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com";

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
  imgSrc = "'self' blob: data:",
  connectSrc,
  frameSrc,
}: {
  scriptSrc: string;
  frameAncestors: string;
  development?: boolean;
  imgSrc?: string;
  connectSrc?: string;
  frameSrc?: string;
}): string {
  return `
    default-src 'self';
    script-src ${scriptSrc}${development ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src ${imgSrc};
    ${connectSrc ? `connect-src ${connectSrc};` : ""}
    ${frameSrc ? `frame-src ${frameSrc};` : ""}
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
 * cu o pagină statică — același HTML servit la o mie de oameni are un singur
 * nonce, deci nonce-ul nu mai e secret. Iar paginile publice NU primesc input
 * de la utilizator (fără conturi, fără bază de date, `/calculator/[valoare]` e
 * allowlist-only), deci nu există vector de injecție pe care `'unsafe-inline'`
 * să-l deschidă.
 *
 * Beacon-ul Web Analytics raportează la /cdn-cgi/rum pe același domeniu, deci
 * `default-src 'self'` îl acoperă fără connect-src separat.
 */
export const CSP_PAGINI_PUBLICE = construiesteCsp({
  scriptSrc: `'self' 'unsafe-inline' ${CLOUDFLARE_INSIGHTS} ${GOOGLE_TAG_MANAGER} ${ADSENSE_SCRIPT}`,
  frameAncestors: "'none'",
  imgSrc: `'self' blob: data: https:`,
  connectSrc: `'self' ${GOOGLE_ANALYTICS_CONNECT} ${ADSENSE_CONNECT}`,
  frameSrc: `'self' ${ADSENSE_FRAME}`,
  development: process.env.NODE_ENV === "development",
});

/**
 * Politica pentru iframe-urile /widget/frame*: încadrabile pe orice site.
 *
 * Pe Vercel aveau nonce per cerere și `'strict-dynamic'`, fiind singurele rute
 * dinamice. Pe găzduirea statică nonce-ul nu mai e posibil. Riscul rămâne închis
 * altfel: singurul input e `?brut=`, acceptat doar ca 3–6 cifre și randat de
 * React, care escapează textul. Fără analytics în iframe: afișările de pe
 * site-urile altora nu sunt vizitele noastre.
 */
export const CSP_WIDGET = construiesteCsp({
  scriptSrc: "'self' 'unsafe-inline'",
  frameAncestors: "*",
});
