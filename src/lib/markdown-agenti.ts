// src/lib/markdown-agenti.ts
//
// Conversia HTML -> Markdown pentru agenți AI (turndown + GFM), mutată din ruta
// dinamică /api/markdown. Pe găzduirea statică rulează la build, pe HTML-ul
// exportat, nu la fiecare cerere.

import * as cheerio from "cheerio";
import TurndownService from "turndown";
// @ts-expect-error — turndown-plugin-gfm nu are tipuri oficiale
import { gfm } from "turndown-plugin-gfm";

export function htmlInMarkdown(html: string): string {
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

  return markdown;
}
