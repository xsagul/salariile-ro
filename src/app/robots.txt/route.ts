// src/app/robots.txt/route.ts
// Robots.txt deschis — strategie GEO (Generative Engine Optimization).
// Politica: PERMITEM toți boții (inclusiv AI training + citation), pentru a
// maximiza șansa ca site-ul să fie cunoscut și CITAT de motoarele generative
// (ChatGPT, Claude, Perplexity, Google AI Overviews, Copilot, articole scrise
// cu AI etc.). Cererea de atribuire/citare cu link e exprimată în /llms.txt.
// Singura excludere: /api/ (endpoint-uri tehnice, fără valoare de conținut).

export function GET() {
  const content = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://salariile.ro/sitemap.xml
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
