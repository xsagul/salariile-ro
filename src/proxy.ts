// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prefersMarkdown } from "@/lib/http";
import { construiesteCsp, LINK_HEADER } from "@/lib/csp";

// ─────────────────────────────────────────────────────────────────────────────
// Ce a mai rămas aici, și de ce
//
// Până pe 10 septembrie 2026 acest fișier rula la FIECARE cerere HTML de pe
// site. Cu `robots.txt` deschis către toți boții AI și 331 de rute prerandate,
// asta însemna o invocare de funcție pentru fiecare trecere de bot — pe o
// pagină care oricum se servea din cache-ul static și nu costa nimic altfel.
// Motivul pentru care a fost scoasă Umami pe 28 august 2026 era exact același:
// invocări per vizualizare.
//
// Cele patru lucruri pe care le făcea pe ruta normală erau constante:
//   CSP, header-ul Link, X-Robots-Tag pe *.vercel.app și un 410 pe /info.
// Nu depindeau de cerere, deci nu aveau ce căuta într-o funcție. Primele trei
// stau acum în `next.config.ts` (le pune CDN-ul, zero invocări), a patra în
// `src/app/info/route.ts`.
//
// Aici rămân DOAR cele două cazuri care chiar au nevoie de cerere, iar
// `config.matcher` de la final se asigură că funcția nici măcar nu pornește în
// rest:
//   1. negocierea de conținut markdown — decizia depinde de q-values din
//      `Accept`, deci nu se poate exprima ca regex în config;
//   2. nonce-ul per cerere pe rutele de widget, singurele care citesc input.
// ─────────────────────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  const path = request.nextUrl.pathname;
  const isDevelopment = process.env.NODE_ENV === "development";

  // ─── Markdown for Agents (content negotiation) ─────────────────────────────
  // Dacă agentul cere Accept: text/markdown, rewrite la endpoint-ul care
  // generează markdown din HTML-ul propriu (turndown + cheerio).
  // Spec: developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
  //
  // Matcher-ul prefiltrează deja după prezența lui `text/markdown` în Accept,
  // dar prefiltrul e un regex: nu poate compara q-values. Verificarea reală
  // rămâne aici. Excludem /api/* și fișierele cu extensie.
  if (
    prefersMarkdown(accept) &&
    !path.startsWith("/api/") &&
    !/\.[a-z0-9]+$/i.test(path)
  ) {
    return NextResponse.rewrite(new URL(`/api/markdown${path}`, request.url));
  }

  // ─── CSP cu nonce, doar pe rutele embeddabile ──────────────────────────────
  //
  // Rutele de widget sunt SINGURELE care citesc input (`?brut=`), deci singurele
  // cu suprafață de injecție. Ele rămân dinamice oricum (searchParams), deci pot
  // păstra nonce + 'strict-dynamic' fără să coste caching. Paginile publice
  // primesc politica constantă din `next.config.ts` — vezi comentariul din
  // `src/lib/csp.ts` pentru de ce un nonce e incompatibil cu o pagină cache-uită.
  //
  // Notă istorică: între 13 și 14 august 2026 au existat aici directive pentru
  // AdSense (frame-src, connect-src, img-src https:). Dacă se repune AdSense,
  // trebuie repuse TOATE, inclusiv `fundingchoicesmessages.google.com` în
  // connect-src — omiterea lui a lăsat site-ul o zi cu scriptul activ și
  // bannerul de consimțământ blocat, fără niciun semnal în interfața AdSense.
  // Vezi commit-urile 4f084d0 și 6b5b151.
  const isEmbeddableFrame =
    path === "/widget/frame" || path === "/widget/frame/fluturas";

  if (isEmbeddableFrame) {
    // Nonce per cerere. Next îl citește singur din header-ul CSP al cererii și
    // îl aplică pe scripturile lui — de aceea îl punem pe requestHeaders.
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const cspHeader = construiesteCsp({
      scriptSrc: `'self' 'nonce-${nonce}' 'strict-dynamic'`,
      frameAncestors: "*",
      development: isDevelopment,
    });

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", cspHeader);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Security-Policy", cspHeader);
    response.headers.set("Link", LINK_HEADER);
    return response;
  }

  // Cerere care a trecut de prefiltrul de Accept dar nu preferă efectiv
  // markdown (q-values). Headerele constante vin din `next.config.ts`; aici NU
  // le mai punem, altfel ar apărea de două ori.
  //
  // IMPORTANT: `NextResponse.next({ request })` cu headerele cererii schimbate
  // trimite cererea către funcție și anulează servirea din cache-ul static.
  // De aceea aici e `next()` gol.
  return NextResponse.next();
}

export const config = {
  // Funcția pornește DOAR în cele două cazuri de mai sus. Restul traficului —
  // adică tot traficul uman și tot traficul de boți — nu mai atinge nicio
  // funcție: paginile se servesc prerandate din CDN, cu headerele din
  // `next.config.ts`.
  matcher: [
    {
      // Negociere markdown: prefiltru pe prezența lui `text/markdown` în Accept.
      // Un browser normal trimite `text/html,...` și nu se potrivește, deci nu
      // invocă nimic.
      source: "/((?!api|_next/static|_next/image|.*\\..*).*)",
      has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
    },
    // Rutele embeddabile: nonce per cerere.
    "/widget/frame",
    "/widget/frame/fluturas",
  ],
};
