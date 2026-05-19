// src/app/robots.txt/route.ts
// Robots.txt aliniat strict cu recomandările Google.
// Folosim doar directive standard recunoscute oficial:
//   - User-agent / Allow / Disallow (RFC 9309)
//   - Sitemap
// Politica de opt-out din training AI = exclusiv prin blocuri User-agent
// (Google-Extended pentru Gemini, plus GPTBot, ClaudeBot, etc. pentru restul).
// Asta e ce recomandă Google oficial și ce respectă boții reali din piață azi.
// Content-Signal (Cloudflare initiative) NU îl folosim — e încă IETF draft,
// nerecunoscut de Google, și creează false-positive pe Lighthouse audits.

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
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
