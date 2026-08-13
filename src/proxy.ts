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

  // ─── AdSense ───────────────────────────────────────────────────────────────
  // Reclamele au nevoie de trei directive pe care CSP-ul nostru nu le avea
  // deloc: `frame-src` (creativele rulează în iframe-uri Google), `connect-src`
  // (licitația și raportarea) și imagini de pe domenii pe care nu le putem
  // enumera — creativele vin de la orice advertiser.
  //
  // Fără ele reclamele NU se încarcă și eșecul e silențios: nimic în interfața
  // AdSense, doar erori de consolă. `script-src` nu are nevoie de adăugiri,
  // pentru că `strict-dynamic` lasă scriptul cu nonce să-și încarce copiii.
  //
  // Compromis asumat: `img-src https:` și lista de domenii de mai jos slăbesc
  // real politica față de ce aveam. E prețul reclamelor, nu o scăpare — dacă
  // renunțăm la AdSense, se șterge blocul ăsta și CSP-ul revine strict.
  //
  // Nu se aplică pe rutele de widget: alea rulează în iframe pe site-uri
  // terțe, unde nu servim reclame și nu vrem CSP slăbit.
  // `fundingchoicesmessages.google.com` este platforma de consimțământ (CMP).
  // Lipsea din connect-src la primul deploy, iar efectul a fost exact cel
  // descris mai sus: AdSense se încărca, dar bannerul de consimțământ era
  // blocat — adică starea cea mai proastă posibilă, reclame fără acord.
  // Nu se scoate de aici fără să se scoată și AdSense.
  const adsScriptSrc = "https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com https://fundingchoicesmessages.google.com";
  const adsFrameSrc = "https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://fundingchoicesmessages.google.com";
  const adsConnectSrc = "https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://csi.gstatic.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com";

  const adsEnabled = !isEmbeddableFrame;

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-hashes'${isDevelopment ? " 'unsafe-eval'" : ""}${adsEnabled ? ` ${adsScriptSrc}` : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:${adsEnabled ? " https:" : ""};
    font-src 'self' data:;
    ${adsEnabled ? `frame-src 'self' ${adsFrameSrc};` : ""}
    ${adsEnabled ? `connect-src 'self' ${adsConnectSrc};` : ""}
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
