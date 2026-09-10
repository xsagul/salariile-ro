// src/app/info/route.ts
//
// Placeholder vechi, cu informații fiscale depășite. A fost scos din sitemap și
// din linkurile interne; 410 îi spune explicit motorului de căutare că URL-ul
// nu mai trebuie păstrat în index.
//
// De ce e rută și nu middleware: până pe 10 septembrie 2026 verificarea
// `path === "/info"` se făcea în `src/proxy.ts`, deci costa o invocare la
// FIECARE cerere de pe site ca să prindă o singură cale moartă. Ca rută, costă
// o invocare doar când cineva chiar cere /info.

export function GET() {
  return new Response("Această pagină nu mai este disponibilă.", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
