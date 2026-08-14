// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  const path = request.nextUrl.pathname;
  const isDevelopment = process.env.NODE_ENV === "development";

  // Placeholder vechi, cu informații fiscale depășite. A fost deja scos din
  // sitemap și din linkurile interne; 410 îi spune explicit motorului de
  // căutare că URL-ul nu mai trebuie păstrat în index.
  if (path === "/info") {
    return new NextResponse("Această pagină nu mai este disponibilă.", {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  }

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

  // Doar rutele iframe declarate explicit pot rula pe alte site-uri. Landingurile
  // publice rămân protejate cu frame-ancestors 'none'.
  const isEmbeddableFrame =
    path === "/widget/frame" || path === "/widget/frame/fluturas";

  // CSP strict, fără excepții pentru rețele publicitare.
  //
  // Între 13 și 14 august 2026 aici au existat directive suplimentare pentru
  // AdSense: `frame-src` și `connect-src` (care lipseau complet — `default-src`
  // le acoperea) plus `img-src https:`. Au fost scoase odată cu scriptul.
  //
  // Dacă se repune AdSense, trebuie repuse TOATE, inclusiv
  // `fundingchoicesmessages.google.com` în connect-src. Omiterea lui a lăsat
  // site-ul o zi cu scriptul activ și bannerul de consimțământ blocat, fără
  // niciun semnal în interfața AdSense — doar în consola browserului.
  // Vezi commit-urile 4f084d0 și 6b5b151.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-hashes'${isDevelopment ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors ${isEmbeddableFrame ? "*" : "'none'"};
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-pathname', path);
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
  // Adăugat aici (în proxy) ca să se aplice doar pe pagini HTML/dynamic,
  // nu pe asseturi statice (proxy-ul oricum nu rulează pe /_next/static/*).
  response.headers.set(
    "Link",
    '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="describedby"; type="text/markdown"'
  );

  const host = request.headers.get("host") || "";
  if (host.endsWith(".vercel.app")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\..*).*)",
  ],
};
