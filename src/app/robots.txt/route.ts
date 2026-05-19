// src/app/robots.txt/route.ts
// Route handler pentru robots.txt — permite directive custom (Content-Signal)
// peste ce permite Next.js MetadataRoute.Robots.

export function GET() {
  const content = `User-agent: *
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

# Content Signals — preferințe pentru utilizarea conținutului de către AI/search
# Spec: https://contentsignals.org · draft-romm-aipref-contentsignals
# Fallback pentru boții ce respectă spec-ul în loc de User-agent lists.
#   search=yes    → indexare în motoare de căutare permisă
#   ai-train=no   → conținutul NU poate fi folosit pentru antrenarea modelelor AI
#   ai-input=yes  → conținutul poate fi folosit ca input/citare de AI care răspunde la întrebări
Content-Signal: ai-train=no, search=yes, ai-input=yes
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
