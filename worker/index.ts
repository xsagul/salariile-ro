// Worker-ul hubului de anunțuri (28 septembrie 2026). Restul site-ului rămâne fișiere statice:
// wrangler.jsonc trimite prin Worker numai rutele din `assets.run_worker_first` (/locuri-de-munca*,
// /anunt-angajare-* și /api/anunturi*), deci paginile de salarii și calculatoarele nu devin
// invocări numărate.
//
// Paginile de anunțuri se construiesc pe șablonul static /locuri-de-munca/sablon (același header,
// footer și CSS ca restul site-ului): Worker-ul îl ia din assets și îi pune conținutul cu
// HTMLRewriter. Headerele de securitate le pune tot el — _headers se aplică doar asseturilor.
import { CSP_ANUNTURI, LINK_HEADER } from "../src/lib/csp";
import { api } from "./api";
import { cheieLista, esteMeserie, paginaAnunt, paginaIndisponibila, paginaLista, redirectFiltre, sitemap, sitemapScoase } from "./pagini";
import { curatenie } from "./date";

export type Env = {
  ASSETS: Fetcher;
  DB: D1Database;
  EMAIL?: { send: (m: { to: string; from: string | { email: string; name?: string }; subject: string; text: string; html?: string }) => Promise<unknown> };
  SARE: string;               // sarea pentru hash-urile de IP și email din limite
  SITE: string;               // https://salariile.ro
  EMAIL_EXPEDITOR: string;    // anunturi@salariile.ro
  EMAIL_PROPRIETAR: string;   // unde ajung raportările
  GOOGLE_INDEXARE?: string;   // cheia JSON a contului de serviciu pentru Indexing API (google.ts)
};

const SECURITATE: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Ca în _headers, cu o excepție: „Sortează după apropiere” cere locația, numai pentru pagina
  // noastră (self), niciodată pentru iframe-uri. Cu geolocation=() butonul n-ar funcționa deloc.
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), browsing-topics=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

export function cuSecuritate(r: Response, html = true): Response {
  const h = new Headers(r.headers);
  for (const [k, v] of Object.entries(SECURITATE)) if (!h.has(k)) h.set(k, v);
  // Șablonul vine din assets cu Permissions-Policy din _headers, care blochează locația.
  h.set("Permissions-Policy", SECURITATE["Permissions-Policy"]);
  if (html && (h.get("content-type") ?? "").includes("text/html")) {
    h.set("Content-Security-Policy", CSP_ANUNTURI);
    h.set("Link", LINK_HEADER);
  }
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: h });
}

// Paginile statice din secțiune (raportarea) trec neatinse spre assets.
const STATICE = new Set(["/locuri-de-munca/raporteaza"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Roboții nu primesc listele cu parametri în adresă (filtre, pagini, ordine). Pe 30 septembrie 2026
 * ClaudeBot a parcurs combinațiile filtrelor: fiecare e altă adresă, deci fără cache, și fiecare
 * citea toate anunțurile de ~9 ori. D1 a ajuns la 10,4 milioane de rânduri citite în 24 de ore,
 * peste limita gratuită de 5 milioane, și hubul a căzut până la miezul nopții UTC. Adresele astea
 * sunt noindex și blocate în robots.txt; aici, pentru cine nu citește robots.txt sau îl ține în cache.
 * Listele fără parametri (oraș, meserie) rămân deschise și vin din cache.
 */
const ROBOT = /bot\b|crawl|spider|slurp/i;

/** D1 gratuit se reface la miezul nopții UTC; până atunci orice citire eșuează. */
const limitaD1 = (e: unknown) => /D1_ERROR/.test(String(e)) && /limit/i.test(String(e));
const secundePanaLaMiezulNoptiiUtc = () => { const m = new Date(); m.setUTCHours(24, 0, 0, 0); return Math.ceil((m.getTime() - Date.now()) / 1000); };

/**
 * Listele și sitemap-ul, din cache-ul Cloudflare cât spune `cache-control` (60 s la liste, o oră
 * la sitemap). D1 gratuit are 5 milioane de rânduri citite pe zi. Din 30 septembrie 2026 listele
 * nu mai citesc D1 la fiecare cerere: anunțurile active stau un minut în memoria Worker-ului
 * (`active` din date.ts), iar cache-ul de aici scutește și calculul. Anunțul însuși nu trece prin cache: cine tocmai l-a
 * publicat îl vede imediat. `cheie` înlocuiește adresa cererii: la liste, fără parametrii ignorați.
 */
async function dinCache(req: Request, ctx: ExecutionContext, fa: () => Promise<Response>, cheie: Request | string = req): Promise<Response> {
  if (req.method !== "GET") return fa();
  const cache = caches.default;
  const gasit = await cache.match(cheie);
  if (gasit) return gasit;
  const r = await fa();
  if (r.status === 200) ctx.waitUntil(cache.put(cheie, r.clone()));
  return r;
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const cale = url.pathname.replace(/\/+$/, "") || "/";
    try {
      if (cale.startsWith("/api/anunturi")) return cuSecuritate(await api(req, env, ctx, cale), false);
      if (req.method !== "GET" && req.method !== "HEAD") return new Response("Metodă nepermisă", { status: 405, headers: { Allow: "GET, HEAD" } });

      // Anunțul: /anunt-angajare-{titlu}-{oraș}-{id}
      const a = /^\/anunt-angajare-([a-z0-9-]+)-(\d+)$/.exec(cale);
      if (a) return cuSecuritate(await paginaAnunt(req, env, Number(a[2]), a[1]));

      // Șablonul nu e o pagină: se cere numai din interior, prin binding.
      if (cale === "/locuri-de-munca/sablon") return cuSecuritate(new Response("Negăsit", { status: 404 }), false);
      if (STATICE.has(cale) || !cale.startsWith("/locuri-de-munca")) return cuSecuritate(await env.ASSETS.fetch(req));
      if (cale === "/locuri-de-munca/sitemap.xml") return cuSecuritate(await dinCache(req, ctx, () => sitemap(env)), false);
      if (cale === "/locuri-de-munca/sitemap-expirate.xml") return cuSecuritate(await dinCache(req, ctx, () => sitemapScoase(env)), false);

      if (url.search && ROBOT.test(req.headers.get("user-agent") ?? "")) {
        return cuSecuritate(new Response("Filtrele listelor nu sunt pentru roboți: vezi robots.txt.", { status: 403, headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" } }), false);
      }

      // Listele: /locuri-de-munca[/{oraș}][/{meserie}] și /locuri-de-munca/{meserie}.
      const cheie = cheieLista(url);
      if (cale === "/locuri-de-munca") return cuSecuritate(redirectFiltre(req) ?? (await dinCache(req, ctx, () => paginaLista(req, env, null, null), cheie)));
      const p = cale.slice("/locuri-de-munca/".length).split("/");
      if (p.length === 1 && SLUG.test(p[0])) return cuSecuritate(await dinCache(req, ctx, () => (esteMeserie(p[0]) ? paginaLista(req, env, null, p[0]) : paginaLista(req, env, p[0], null)), cheie));
      if (p.length === 2 && SLUG.test(p[0]) && esteMeserie(p[1])) return cuSecuritate(await dinCache(req, ctx, () => paginaLista(req, env, p[0], p[1]), cheie));
      return cuSecuritate(await env.ASSETS.fetch(req));
    } catch (e) {
      console.error("eroare", cale, e);
      if (limitaD1(e)) {
        // 503 cu Retry-After: Google înțelege că e temporar și revine, nu scoate paginile din index.
        const dupa = String(secundePanaLaMiezulNoptiiUtc());
        if (cale.startsWith("/api/")) return cuSecuritate(new Response(JSON.stringify({ eroare: "Anunțurile sunt indisponibile câteva ore. Încearcă din nou mai târziu." }), { status: 503, headers: { "content-type": "application/json; charset=utf-8", "retry-after": dupa } }), false);
        try {
          const r = await paginaIndisponibila(req, env);
          const h = new Headers(r.headers); h.set("retry-after", dupa); h.set("cache-control", "no-store");
          return cuSecuritate(new Response(r.body, { status: 503, headers: h }));
        } catch { /* cade pe textul simplu de mai jos */ }
      }
      return cuSecuritate(new Response("A apărut o eroare. Încearcă din nou peste un minut.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }), false);
    }
  },

  // Zilnic: expiră anunțurile, șterge emailurile vechi, curăță limitele (wrangler.jsonc → triggers).
  async scheduled(_ev: ScheduledController, env: Env): Promise<void> {
    await curatenie(env);
  },
} satisfies ExportedHandler<Env>;
