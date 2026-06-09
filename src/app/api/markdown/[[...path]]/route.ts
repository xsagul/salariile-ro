// src/app/api/markdown/[[...path]]/route.ts
// Dynamic HTML → Markdown conversion endpoint pentru agenți AI.
//
// Replică funcționalitatea Cloudflare "Markdown for Agents" la nivel aplicație:
// - Fetch HTML-ul propriu al paginii
// - Strip nav/header/footer/scripts/styles
// - Extract YAML frontmatter din <meta> tags
// - Convert body HTML → markdown (turndown + GFM tables)
// - Append JSON-LD ca code block la final
// - Return cu Content-Type: text/markdown + x-markdown-tokens + Content-Signal
//
// Apelat intern de middleware când request-ul are Accept: text/markdown.
// Nu se expune public (nu e linkat); rolul lui e content negotiation.

import * as cheerio from "cheerio";
import TurndownService from "turndown";
// @ts-expect-error — turndown-plugin-gfm nu are tipuri oficiale
import { gfm } from "turndown-plugin-gfm";

export const dynamic = "force-dynamic";

type Params = { path?: string[] };

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  const { path = [] } = await params;
  const pathStr = path.join("/");
  const url = new URL(req.url);
  const targetUrl = `${url.protocol}//${url.host}/${pathStr}`;

  // Fetch HTML-ul propriu fără Accept: text/markdown → middleware nu rewrite-uiește,
  // evităm loop-ul infinit.
  let html: string;
  try {
    const res = await fetch(targetUrl, {
      headers: { Accept: "text/html" },
      // Cache 1h în Next/Vercel CDN — pentru un site cu conținut rar schimbat e OK.
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return new Response(`Page not found: /${pathStr}`, {
        status: res.status,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    html = await res.text();
  } catch (err) {
    return new Response(`Failed to fetch source HTML: ${String(err)}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const $ = cheerio.load(html);

  // ─── Frontmatter din <meta> tags ───────────────────────────────────────────
  // Prioritate: <title> element și meta[name="description"] sunt sursele
  // canonice page-specific. OG tags sunt fallback (pot fi moștenite din layout
  // și pot reflecta default-ul site-ului, nu pagina curentă).
  const title =
    $("title").text().trim() ||
    $('meta[name="title"]').attr("content") ||
    $('meta[property="og:title"]').attr("content") ||
    "";
  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";

  // ─── JSON-LD blocks (păstrate ca code blocks la final, conform spec Cloudflare) ──
  const jsonLds: string[] = [];
  $('script[type="application/ld+json"]').each((_i, el) => {
    const raw = $(el).html();
    if (raw && raw.trim()) {
      try {
        // Re-stringify pretty pentru lizibilitate
        const parsed = JSON.parse(raw);
        jsonLds.push(JSON.stringify(parsed, null, 2));
      } catch {
        jsonLds.push(raw.trim());
      }
    }
  });

  // ─── Strip chrome (nav, header, footer, scripts, styles, UI interactiv) ──
  // Pe homepage și paginile dinamice, calculatorul are formulare interactive +
  // un tabel skeleton gol — agentul nu poate interacționa cu ele, doar rezultă
  // text confuz în markdown. Componentele Tailwind v4 marchează aceste elemente
  // cu atributul `data-md-strip`:
  //   - coloana stângă cu input form (DIRECȚIE, BRUT, butoane)
  //   - tabelul skeleton gol cu „—" (afișat înainte de calcul / pe homepage)
  //   - butonul de download PDF + hintul „completează salariul brut"
  // Pe paginile dinamice (/calculator/X-brut), tabelul real cu valori calculate
  // NU are `data-md-strip` și rămâne în markdown.
  $("header, footer, nav, script, style, noscript, [data-md-strip]").remove();

  // Conținutul principal: încercăm <main>, apoi <body>
  const mainHtml = $("main").html() || $("body").html() || "";

  // ─── Convert body HTML → markdown ─────────────────────────────────────────
  const turndown = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
  });
  turndown.use(gfm);

  // Custom rule: ignoră elementele cu aria-hidden (skeleton, decorative)
  turndown.addRule("ariaHidden", {
    filter: (node) =>
      (node as Element).getAttribute?.("aria-hidden") === "true",
    replacement: () => "",
  });

  const bodyMd = turndown.turndown(mainHtml).trim();

  // ─── Compunere răspuns final ──────────────────────────────────────────────
  const parts: string[] = [];

  // Frontmatter YAML (doar dacă există măcar un câmp)
  if (title || description || ogImage) {
    const fm: string[] = ["---"];
    if (title) fm.push(`title: ${JSON.stringify(title)}`);
    if (description) fm.push(`description: ${JSON.stringify(description)}`);
    if (ogImage) fm.push(`image: ${JSON.stringify(ogImage)}`);
    fm.push("---");
    parts.push(fm.join("\n"));
  }

  // Body markdown
  if (bodyMd) parts.push(bodyMd);

  // JSON-LD blocks
  for (const jsonLd of jsonLds) {
    parts.push("```json\n" + jsonLd + "\n```");
  }

  const markdown = parts.join("\n\n");

  // Estimare tokens: ~4 caractere/token (rough, ca în spec Cloudflare)
  const tokenEstimate = Math.ceil(markdown.length / 4);

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(tokenEstimate),
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      // Vary: Accept — esențial pentru CDN să separe cache-ul HTML vs markdown
      // (altfel risc de cache poisoning: browser primește markdown când vrea HTML)
      Vary: "Accept",
      // Indică canonical URL-ul HTML pentru claritate
      Link: `<${targetUrl}>; rel="canonical"`,
      // Markdown e doar pentru agenți — nu vrem să apară ca pagină separată în SERP.
      // Robots.txt deja disallow /api/* dar X-Robots-Tag e garanție suplimentară.
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
