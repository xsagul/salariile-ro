// src/app/robots.txt/route.ts
// Robots.txt deschis pentru AI — strategie GEO (Generative Engine Optimization).
// Politica: PERMITEM toți boții AI (inclusiv training + citation), pentru a
// maximiza șansa ca site-ul să fie cunoscut și CITAT de motoarele generative
// (ChatGPT, Claude, Perplexity, Google AI Overviews, Copilot, articole scrise
// cu AI etc.). Cererea de atribuire/citare cu link e exprimată în /llms.txt.
// Excluderi: /api/ (endpoint-uri tehnice) și crawlerele de tooling SEO, care
// nu produc nicio citare dar costa Edge Requests — vezi comentariul din payload.

export function GET() {
  const content = `# Crawlerele de tooling SEO: blocate pe 10 septembrie 2026.
# Nu aduc nicio citare si niciun vizitator, dar consuma Edge Requests pe 331
# de rute. Masurat atunci: 467K/1M cereri in 30 de zile, din care ~115K de la
# boti. Toate cele de mai jos respecta robots.txt. Strategia GEO NU e atinsa:
# botii AI si motoarele de cautare raman permise mai jos.
User-agent: AhrefsBot
User-agent: SemrushBot
User-agent: DataForSeoBot
User-agent: MJ12bot
User-agent: DotBot
User-agent: BLEXBot
User-agent: rogerbot
User-agent: Barkrowler
User-agent: ZoominfoBot
Disallow: /

# Restul: deschis. Strategie GEO — permitem toti botii AI (training + citation)
# ca sa maximizam sansa ca site-ul sa fie cunoscut si CITAT de motoarele
# generative (ChatGPT, Claude, Perplexity, Google AI Overviews, Copilot).
# Cererea de atribuire cu link e exprimata in /llms.txt.
User-agent: *
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
