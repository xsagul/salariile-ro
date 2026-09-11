// src/lib/redirecturi.ts
//
// Redirecturile permanente ale site-ului — proprietar unic.
//
// Pe Vercel stăteau în `redirects()` din next.config.ts. Exportul static le
// ignoră, așa că scripts/genereaza-cloudflare.mts le scrie în out/_redirects,
// iar Cloudflare le aplică la edge cu 301. Verificat cu `wrangler dev` pe 11
// septembrie 2026: /calculator-salariu → 301 → /.

export const REDIRECTURI: ReadonlyArray<{ de: string; la: string }> = [
  // URL-uri vechi cu intenție clară de calculator (păstrează autoritatea).
  { de: "/calculator-salariu", la: "/" },
  { de: "/calcul-salariu-net", la: "/" },
  { de: "/calculator", la: "/" },

  // Pagina „net" a fost absorbită în pilonul /salariu-minim (secțiunea #net).
  { de: "/salariu-minim/net", la: "/salariu-minim" },

  // API-urile de descărcare au devenit fișiere statice la mutarea pe Cloudflare.
  // `_redirects` nu vede query string-ul, deci formatul implicit e cel folosit
  // cel mai des: ICS pentru calendar, JSON pentru seria INS.
  { de: "/api/calendar/2026", la: "/date/calendar/2026.ics" },
  { de: "/api/calendar/2027", la: "/date/calendar/2027.ics" },
  { de: "/api/date-salarii/serie", la: "/date/salarii-serie-ins.json" },
];
