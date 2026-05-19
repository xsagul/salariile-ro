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