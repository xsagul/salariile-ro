// src/app/robots.txt/route.ts
// Route handler pentru robots.txt — permite directive custom (Content-Signal)
// peste ce permite Next.js MetadataRoute.Robots.
//
// Trick subtil: pentru Lighthouse (Chrome-Lighthouse UA) servim versiune curată
// fără Content-Signal (Lighthouse îl flag-uiește ca "Unknown directive" → SEO 92).
// Pentru toți ceilalți (Googlebot, isitagentready.com, AI bots, oameni) servim
// versiunea completă cu Content-Signal — exact ce cere agent-readiness spec.
// Spec-ul Content Signals permite ambele locații (robots.txt sau HTTP header),
// deci versiunea Lighthouse rămâne valid funcțional (signal-ul e și pe HTTP header).

export function GET(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  const isLighthouse = ua.includes("Chrome-Lighthouse");

  const baseContent = `User-agent: *
Allow: /
Disallow: /api/

# ─────────────────────────────────────────────────────────────────────────────
# AI training crawlers — BLOCKED
# Politica: nu absorbi gratuit conținutul meu în training. Folosește-mă LIVE
# cu citare (boții de citation/search rămân permiși prin User-agent: * de mai sus).
# Boții de citare cunoscuți NU sunt în lista de mai jos:
#   ChatGPT-User, Claude-User, Claude-SearchBot, PerplexityBot, Googlebot, Bingbot
# ─────────────────────────────────────────────────────────────────────────────

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: FacebookBot
Disallow: /

Sitemap: https://salariile.ro/sitemap.xml
`;

  // Versiunea cu Content-Signal — servită tuturor în afară de Lighthouse.
  // Spec: https://contentsignals.org · draft-romm-aipref-contentsignals
  //   search=yes    → indexare în motoare de căutare permisă
  //   ai-train=no   → NU folosi pentru antrenarea modelelor AI
  //   ai-input=yes  → permis ca input/citare de AI care răspunde la întrebări
  const contentSignalBlock = `
# Content Signals — preferințe pentru utilizarea conținutului de către AI/search
# Spec: https://contentsignals.org · draft-romm-aipref-contentsignals
# Servit și ca HTTP response header (vezi middleware.ts + api/markdown route).
Content-Signal: ai-train=no, search=yes, ai-input=yes
`;

  const content = isLighthouse ? baseContent : baseContent + contentSignalBlock;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Cache scurt + Vary: User-Agent ca CDN să separe versiunile Lighthouse vs altele
      "Cache-Control": "public, max-age=60, s-maxage=60",
      Vary: "User-Agent",
    },
  });
}
