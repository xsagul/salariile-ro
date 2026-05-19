// src/app/robots.txt/route.ts
// Route handler pentru robots.txt — permite directive custom (Content-Signal)
// peste ce permite Next.js MetadataRoute.Robots.

export function GET() {
  const content = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://salariile.ro/sitemap.xml
Host: https://salariile.ro

# Content Signals — preferințe pentru utilizarea conținutului de către AI/search
# Spec: https://contentsignals.org · draft-romm-aipref-contentsignals
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
