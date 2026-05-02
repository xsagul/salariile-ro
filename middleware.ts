// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Generăm un nonce unic și aleatoriu pentru fiecare request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // 2. Construim politica CSP folosind acest nonce
  // Notă: Păstrăm 'unsafe-inline' la style-src pentru ca designul tău să nu se strice.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // 3. Adăugăm nonce-ul și CSP-ul în request-ul pe care îl vede Next.js
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // 4. Pasăm headerele modificate mai departe
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 5. Setăm CSP-ul și pe răspunsul trimis către browser
  response.headers.set('Content-Security-Policy', cspHeader);

  // 6. Logica ta existentă pentru blocarea domeniilor de test Vercel
  const host = request.headers.get("host") || "";
  if (host.endsWith(".vercel.app")) {
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive"
    );
  }

  return response;
}

export const config = {
  // Rulează pe toate rutele, mai puțin assets statice
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};