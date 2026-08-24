// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prefersMarkdown } from "@/lib/http";

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
    prefersMarkdown(accept) &&
    !path.startsWith("/api/") &&
    !/\.[a-z0-9]+$/i.test(path)
  ) {
    return NextResponse.rewrite(
      new URL(`/api/markdown${path}`, request.url)
    );
  }

  // ─── CSP, diferit pe rute ──────────────────────────────────────────────────
  //
  // Doar rutele iframe declarate explicit pot rula pe alte site-uri.
  // Landingurile publice rămân protejate cu frame-ancestors 'none'.
  const isEmbeddableFrame =
    path === "/widget/frame" || path === "/widget/frame/fluturas";

  // De ce două politici și nu una singură, strictă peste tot:
  //
  // Un nonce e, prin definiție, incompatibil cu o pagină cache-uită — HTML-ul
  // servit din edge la o mie de oameni are un singur nonce, deci nonce-ul nu
  // mai e secret și nu mai protejează nimic. Iar Next generează ~48 de
  // scripturi inline pe pagină (payload-ul RSC), cu conținut diferit de la o
  // pagină la alta, deci nici hash-uri fixe nu se pot folosi.
  //
  // Alegerea nu e însă „strict vs relaxat”, ci „unde există risc real”:
  //
  //   - paginile publice sunt statice și NU primesc niciun input de la
  //     utilizator. Fără conturi, fără bază de date, fără parametri reflectați
  //     în pagină; /calculator/[valoare] e allowlist-only. Nu există vector de
  //     injecție, deci 'unsafe-inline' nu deschide nimic ce era închis.
  //     'unsafe-hashes' a fost scos: nu există niciun handler inline
  //     (onclick=, onload=) în tot src/ — îl purtam degeaba.
  //
  //   - rutele de widget sunt SINGURELE care citesc input (`?brut=`), deci
  //     singurele cu suprafață de injecție. Ele rămân dinamice oricum
  //     (searchParams), deci pot păstra nonce + 'strict-dynamic' fără să
  //     coste caching. Protecția tare rămâne exact acolo unde contează.
  //
  // Notă istorică: între 13 și 14 august 2026 au existat aici directive pentru
  // AdSense (frame-src, connect-src, img-src https:). Dacă se repune AdSense,
  // trebuie repuse TOATE, inclusiv `fundingchoicesmessages.google.com` în
  // connect-src — omiterea lui a lăsat site-ul o zi cu scriptul activ și
  // bannerul de consimțământ blocat, fără niciun semnal în interfața AdSense.
  // Vezi commit-urile 4f084d0 și 6b5b151.
  const csp = (scriptSrc: string) => `
    default-src 'self';
    script-src ${scriptSrc}${isDevelopment ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors ${isEmbeddableFrame ? "*" : "'none'"};
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  let response: NextResponse;
  let cspHeader: string;

  if (isEmbeddableFrame) {
    // Nonce per cerere. Next îl citește singur din header-ul CSP al cererii și
    // îl aplică pe scripturile lui — de aceea îl punem pe requestHeaders.
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    cspHeader = csp(`'self' 'nonce-${nonce}' 'strict-dynamic'`);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", cspHeader);
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    // IMPORTANT: aici NU modificăm headerele cererii. `NextResponse.next` cu
    // `request.headers` schimbate trimite cererea către funcție și anulează
    // servirea din cache-ul static — exact ce încercăm să obținem.
    cspHeader = csp("'self' 'unsafe-inline'");
    response = NextResponse.next();
  }

  response.headers.set('Content-Security-Policy', cspHeader);

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
