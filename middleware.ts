// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  const path = request.nextUrl.pathname;

  // ─── Markdown for Agents (content negotiation) ─────────────────────────────
  // Dacă agentul cere Accept: text/markdown, rewrite la endpoint-ul care
  // generează markdown din HTML-ul propriu (turndown + cheerio).
  // Spec: developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
  // Excludem:
  //   - /api/*    (n-are sens să convertim răspunsuri API)
  //   - *.ext     (fișiere statice .png, .svg, .txt etc.)
  if (
    accept.includes("text/markdown") &&
    !path.startsWith("/api/") &&
    !/\.[a-z0-9]+$/i.test(path)
  ) {
    return NextResponse.rewrite(
      new URL(`/api/markdown${path}`, request.url)
    );
  }

  // ─── CSP cu nonce pentru răspunsurile HTML ─────────────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-hashes';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', cspHeader);

  // Vary: Accept — semnalează la CDN că răspunsul depinde de header-ul Accept
  // (HTML pentru browser, markdown pentru agenți). Previne cache poisoning.
  // Append la Vary-ul existent (Next adaugă deja rsc, next-router-* etc.).
  const existingVary = response.headers.get("Vary");
  response.headers.set(
    "Vary",
    existingVary ? `${existingVary}, Accept` : "Accept"
  );

  // Link headers (RFC 8288) pentru descoperire agenți AI:
  // - sitemap      → unde sunt toate URL-urile indexabile
  // - describedby  → llms.txt (overview markdown al site-ului)
  // Adăugat aici (în middleware) ca să se aplice doar pe pagini HTML/dynamic,
  // nu pe asseturi statice (middleware-ul oricum nu rulează pe /_next/static/*).
  response.headers.set(
    "Link",
    '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="describedby"; type="text/markdown"'
  );

  // Content-Signal HTTP header — politica de utilizare AI a conținutului.
  // Spec: https://contentsignals.org · draft-romm-aipref-contentsignals
  // Servită ca HTTP header (nu în robots.txt) ca să trecem Lighthouse SEO audit
  // ("Unknown directive in robots.txt"). Spec-ul permite ambele locații.
  //   search=yes    → indexare în motoare de căutare permisă
  //   ai-train=no   → NU folosi pentru antrenarea modelelor AI
  //   ai-input=yes  → permis ca input/citare de AI care răspunde live
  response.headers.set(
    "Content-Signal",
    "ai-train=no, search=yes, ai-input=yes"
  );

  const host = request.headers.get("host") || "";
  if (host.endsWith(".vercel.app")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt).*)",
  ],
};