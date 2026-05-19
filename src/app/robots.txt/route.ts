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

# Content Signals: ai-train=no, search=yes, ai-input=yes
# Spec: https://contentsignals.org · draft-romm-aipref-contentsignals
# NOTĂ: directiva Content-Signal este servită ca HTTP response header pe pagini
# (vezi middleware.ts și api/markdown route handler), NU în robots.txt. Aceasta
# evită false-positive-ul Lighthouse "Unknown directive in robots.txt" — Google's
# parser e lenient și ignoră oricum, dar audit-urile stricte flag-uiesc.
# Spec-ul Content Signals permite ambele locații (robots.txt sau HTTP header).
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
