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
import { esteMeserie, paginaAnunt, paginaLista, redirectFiltre, sitemap } from "./pagini";
import { curatenie } from "./date";

export type Env = {
  ASSETS: Fetcher;
  DB: D1Database;
  EMAIL?: { send: (m: { to: string; from: string | { email: string; name?: string }; subject: string; text: string; html?: string }) => Promise<unknown> };
  TURNSTILE_SECRET?: string;
  SARE: string;               // sarea pentru hash-urile de IP și email din limite
  SITE: string;               // https://salariile.ro
  EMAIL_EXPEDITOR: string;    // anunturi@salariile.ro
  EMAIL_PROPRIETAR: string;   // unde ajung raportările
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
      if (cale === "/locuri-de-munca/sitemap.xml") return cuSecuritate(await sitemap(env), false);

      // Listele: /locuri-de-munca[/{oraș}][/{meserie}] și /locuri-de-munca/{meserie}.
      if (cale === "/locuri-de-munca") return cuSecuritate(redirectFiltre(req) ?? (await paginaLista(req, env, null, null)));
      const p = cale.slice("/locuri-de-munca/".length).split("/");
      if (p.length === 1 && SLUG.test(p[0])) return cuSecuritate(await (esteMeserie(p[0]) ? paginaLista(req, env, null, p[0]) : paginaLista(req, env, p[0], null)));
      if (p.length === 2 && SLUG.test(p[0]) && esteMeserie(p[1])) return cuSecuritate(await paginaLista(req, env, p[0], p[1]));
      return cuSecuritate(await env.ASSETS.fetch(req));
    } catch (e) {
      console.error("eroare", cale, e);
      return cuSecuritate(new Response("A apărut o eroare. Încearcă din nou peste un minut.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }), false);
    }
  },

  // Zilnic: expiră anunțurile, șterge emailurile vechi, curăță limitele (wrangler.jsonc → triggers).
  async scheduled(_ev: ScheduledController, env: Env): Promise<void> {
    await curatenie(env);
  },
} satisfies ExportedHandler<Env>;
