// Paginile de anunțuri, puse în șablonul static /locuri-de-munca/sablon (header, footer, CSS).
// Adresele (verificate în Google România, 28 septembrie 2026) sunt deținute de src/lib/anunturi/reguli.ts.
import type { Env } from "./index";
import catalog from "../src/data/meserii-catalog.json";
import { JUDETE, NORME, URL_ADAUGA, urlAnunt, urlLista } from "../src/lib/anunturi/reguli";
import { PE_PAGINA, dupaId, lista, listeIndexabile, numeOras, toateActive, type Anunt } from "./date";

const NUME_MESERIE = new Map((catalog as { meserii: { slug: string; nume: string }[] }).meserii.map((m) => [m.slug, m.nume]));
export const esteMeserie = (s: string) => NUME_MESERIE.has(s);
const CARD = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";
/** O listă intră în Google abia cu atâtea anunțuri: top 3 e numai al listelor pline. */
export const PRAG_INDEX = 5;
const SITE = "https://salariile.ro";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const lei = (n: number) => n.toLocaleString("ro-RO");
const data = (iso: string) => new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "long", timeZone: "Europe/Bucharest" });
const suma = (a: Anunt) => `${a.salariu_max ? `${lei(a.salariu_min)}–${lei(a.salariu_max)}` : lei(a.salariu_min)} lei ${a.baza}`;
const norma = (a: Anunt) => (a.norma === "partiala" ? `${NORME.partiala}, ${a.ore_pe_zi} ore pe zi` : NORME.intreaga);
const oras = (a: Anunt) => a.oras.replace(/,.*$/, "").trim();
/** „Cluj-Napoca, Cluj”, dar „București”, nu „București, București”. */
const loc = (a: Anunt) => (oras(a) === JUDETE[a.judet] ? oras(a) : `${oras(a)}, ${JUDETE[a.judet]}`);

type Pagina = { titlu: string; descriere: string; canonic: string; indexabil: boolean; continut: string; jsonLd?: object; status?: number };

async function inSablon(req: Request, env: Env, p: Pagina): Promise<Response> {
  const sablon = await env.ASSETS.fetch(new Request(new URL("/locuri-de-munca/sablon", req.url)));
  let r = new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(`${p.titlu} | Salariile`); } })
    .on('meta[name="description"]', { element(e) { e.setAttribute("content", p.descriere); } })
    .on('meta[property="og:title"]', { element(e) { e.setAttribute("content", p.titlu); } })
    .on('meta[property="og:description"]', { element(e) { e.setAttribute("content", p.descriere); } })
    .on('meta[property="og:url"]', { element(e) { e.setAttribute("content", p.canonic); } })
    .on('link[rel="canonical"]', { element(e) { e.setAttribute("href", p.canonic); } })
    .on('meta[name="robots"]', { element(e) { e.setAttribute("content", p.indexabil ? "index, follow" : "noindex, follow"); } })
    .on("[data-anunturi-continut]", { element(e) { e.setInnerContent(p.continut, { html: true }); } });
  if (p.jsonLd) r = r.on("head", { element(e) { e.append(`<script type="application/ld+json">${JSON.stringify(p.jsonLd).replace(/</g, "\\u003c")}</script>`, { html: true }); } });
  const out = r.transform(sablon);
  const h = new Headers(out.headers);
  h.set("content-type", "text/html; charset=utf-8");
  h.set("cache-control", "public, max-age=60, s-maxage=60");
  return new Response(out.body, { status: p.status ?? 200, headers: h });
}

function cardLista(a: Anunt): string {
  const meserie = a.meserie ? NUME_MESERIE.get(a.meserie) : null;
  return `<li><a href="${urlAnunt(a)}" class="block ${CARD} hover:border-stone-400" data-anunt="${a.id}">
    <span class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span class="text-base font-semibold text-stone-900">${esc(a.titlu)}</span>
      <span class="whitespace-nowrap font-semibold text-stone-900">${suma(a)}</span>
    </span>
    <span class="mt-1 block text-sm text-stone-600">${esc(a.angajator)} · ${esc(loc(a))} · ${norma(a)}${meserie ? ` · ${esc(meserie)}` : ""}</span>
    <span class="mt-1 block text-xs text-stone-600">Publicat pe ${data(a.confirmat_la!)}</span>
  </a></li>`;
}

/** /locuri-de-munca?meserie=barman&oras=bucuresti (formularul de filtre) → /locuri-de-munca/bucuresti/barman. */
export function redirectFiltre(req: Request): Response | null {
  const u = new URL(req.url);
  if (!u.searchParams.has("meserie") && !u.searchParams.has("oras")) return null;
  const m = u.searchParams.get("meserie") ?? "", o = (u.searchParams.get("oras") ?? "").replace(/[^a-z0-9-]/g, "");
  return Response.redirect(new URL(urlLista(o || null, esteMeserie(m) ? m : null), req.url).toString(), 302);
}

export async function paginaLista(req: Request, env: Env, orasSlug: string | null, meserie: string | null): Promise<Response> {
  const u = new URL(req.url);
  const pagina = Math.max(1, Math.min(500, Number(u.searchParams.get("pagina")) || 1));
  const { anunturi, total } = await lista(env, { meserie: meserie ?? undefined, oras: orasSlug ?? undefined, pagina });
  const numeLoc = orasSlug ? (await numeOras(env, orasSlug)) : null;
  // O localitate fără niciun anunț activ nu e o pagină: altfel orice cuvânt din URL ar deveni una.
  if (orasSlug && !numeLoc) {
    return inSablon(req, env, { titlu: "Nu sunt anunțuri aici", descriere: "Nu sunt anunțuri de angajare pentru această localitate.", canonic: `${SITE}/locuri-de-munca`, indexabil: false, status: 404,
      continut: `<h1 class="text-[28px] font-bold text-stone-900">Nu sunt anunțuri pentru această localitate</h1><p class="mt-3"><a class="underline" href="/locuri-de-munca">Vezi toate anunțurile</a> · <a class="underline" href="${URL_ADAUGA}">Adaugă un anunț</a></p>` });
  }
  const pagini = Math.max(1, Math.ceil(total / PE_PAGINA));
  const numeM = meserie ? NUME_MESERIE.get(meserie)!.toLowerCase() : "";
  const unde = [numeM, numeLoc ? `în ${numeLoc}` : ""].filter(Boolean).join(" ");
  const cat = total ? `${lei(total)} ${total === 1 ? "loc de muncă" : "locuri de muncă"}` : "Locuri de muncă";
  const titlu = `${cat}${unde ? ` ${unde}` : ""}, cu salariul scris`;
  const cale = urlLista(orasSlug, meserie);
  const q = (p: number) => `${cale}${p > 1 ? `?pagina=${p}` : ""}`;
  const optiuni = (valori: [string, string][], ales: string) => valori.map(([v, n]) => `<option value="${v}"${v === ales ? " selected" : ""}>${esc(n)}</option>`).join("");
  const orase = (await env.DB.prepare("SELECT oras_slug AS s, MIN(oras) AS n FROM anunturi WHERE stare = 'activ' GROUP BY oras_slug ORDER BY n").all<{ s: string; n: string }>()).results;

  const breadcrumb = (orasSlug || meserie) ? `<nav class="mb-4 flex flex-wrap gap-2 text-xs text-stone-600" aria-label="Breadcrumb"><a class="underline underline-offset-2" href="/locuri-de-munca">Locuri de muncă</a>${orasSlug && meserie ? `<span>/</span><a class="underline underline-offset-2" href="${urlLista(orasSlug, null)}">${esc(numeLoc!)}</a>` : ""}</nav>` : "";
  const continut = `${breadcrumb}
    <h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-stone-900 sm:text-[34px]">${esc(titlu.charAt(0).toUpperCase() + titlu.slice(1))}</h1>
    <p class="mt-3 max-w-prose text-base text-stone-600">Fiecare anunț are salariul lunar, cu brutul sau netul spus clar. Aplici direct la angajator, fără cont.${meserie ? ` <a class="underline underline-offset-2" href="/salarii/${meserie}">Cât câștigă un ${esc(numeM)}</a>.` : ""}</p>
    <div class="mt-5"><a href="${URL_ADAUGA}" class="inline-flex min-h-11 items-center rounded-md bg-stone-900 px-4 font-semibold text-white hover:bg-stone-700">Adaugă un anunț gratuit</a></div>
    <form method="get" action="/locuri-de-munca" class="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <label class="text-sm text-stone-700">Meseria
        <select name="meserie" class="mt-1 block w-full rounded-md border border-stone-300 bg-surface px-3 py-2 text-base"><option value="">Toate meseriile</option>${optiuni([...NUME_MESERIE].sort((a, b) => a[1].localeCompare(b[1], "ro")), meserie ?? "")}</select>
      </label>
      <label class="text-sm text-stone-700">Localitatea
        <select name="oras" class="mt-1 block w-full rounded-md border border-stone-300 bg-surface px-3 py-2 text-base"><option value="">Toată țara</option>${optiuni(orase.map((o) => [o.s, o.n.replace(/,.*$/, "")]), orasSlug ?? "")}</select>
      </label>
      <button type="submit" class="min-h-11 self-end rounded-md border border-stone-300 bg-surface px-4 font-semibold text-stone-900 hover:border-stone-500">Caută</button>
    </form>
    ${anunturi.length ? `<ul class="mt-6 grid gap-3">${anunturi.map(cardLista).join("")}</ul>` : `
      <div class="mt-6 ${CARD}"><p class="text-base text-stone-800">${unde ? "Nu sunt încă anunțuri pentru căutarea asta." : "Nu sunt încă anunțuri publicate."}</p>
      <p class="mt-2 text-sm text-stone-600">Angajezi? Anunțul tău apare aici în câteva minute, gratuit și fără cont.</p></div>`}
    ${pagini > 1 ? `<nav aria-label="Pagini" class="mt-6 flex gap-4 text-sm">${pagina > 1 ? `<a class="underline underline-offset-2" href="${q(pagina - 1)}">Pagina anterioară</a>` : ""}<span class="text-stone-600">Pagina ${pagina} din ${pagini}</span>${pagina < pagini ? `<a class="underline underline-offset-2" href="${q(pagina + 1)}">Pagina următoare</a>` : ""}</nav>` : ""}`;

  return inSablon(req, env, {
    titlu, descriere: `${titlu}. Anunțuri de angajare din România, fiecare cu salariul lunar și baza lui, brut sau net. Aplici direct la angajator.`.slice(0, 158),
    canonic: `${SITE}${q(pagina)}`,
    indexabil: total >= PRAG_INDEX && pagina === 1,
    continut,
  });
}

function descriereHtml(t: string): string {
  return t.split(/\n{2,}/).map((p) => `<p class="mb-2.5">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
}

export async function paginaAnunt(req: Request, env: Env, id: number, slug: string): Promise<Response> {
  const a = await dupaId(env, id);
  if (!a || a.stare === "neconfirmat") return inSablon(req, env, { titlu: "Anunț negăsit", descriere: "Anunțul nu există.", canonic: `${SITE}/locuri-de-munca`, indexabil: false, status: 404,
    continut: `<h1 class="text-[28px] font-bold text-stone-900">Anunțul nu există</h1><p class="mt-3"><a class="underline" href="/locuri-de-munca">Vezi anunțurile publicate</a></p>` });
  if (a.slug !== slug) return Response.redirect(new URL(urlAnunt(a), req.url).toString(), 301);
  const canonic = `${SITE}${urlAnunt(a)}`;
  const meserie = a.meserie ? NUME_MESERIE.get(a.meserie) : null;
  const listaMeserie = urlLista(a.oras_slug, a.meserie);

  if (a.stare !== "activ") {
    // 410: anunțul a existat și nu mai e. Google îl scoate din index mai repede decât la 404.
    return inSablon(req, env, { titlu: `Anunț angajare ${a.titlu} — expirat`, descriere: "Anunțul nu mai e publicat.", canonic, indexabil: false, status: 410,
      continut: `<h1 class="text-[28px] font-bold leading-tight text-stone-900">${esc(a.titlu)}</h1>
        <div class="mt-5 ${CARD}"><p class="text-base text-stone-800">${a.stare === "suspendat" ? "Anunțul e suspendat cât timp îl verificăm." : "Anunțul nu mai e publicat."}</p>
        <p class="mt-2 text-sm"><a class="underline underline-offset-2" href="${listaMeserie}">Vezi anunțurile ${meserie ? `pentru ${esc(meserie.toLowerCase())} ` : ""}din ${esc(oras(a))}</a>${a.meserie ? ` · <a class="underline underline-offset-2" href="/salarii/${a.meserie}">Salariul unui ${esc(meserie!.toLowerCase())}</a>` : ""}</p></div>` });
  }

  const contact = [
    a.telefon ? `<li><a class="font-semibold underline underline-offset-2" href="tel:${esc(a.telefon.replace(/[^\d+]/g, ""))}">${esc(a.telefon)}</a></li>` : "",
    a.email_contact ? `<li><a class="font-semibold underline underline-offset-2" href="mailto:${esc(a.email_contact)}?subject=${encodeURIComponent(`Anunț: ${a.titlu}`)}">${esc(a.email_contact)}</a></li>` : "",
    a.link_aplicare ? `<li><a class="font-semibold underline underline-offset-2" href="${esc(a.link_aplicare)}" rel="nofollow ugc noopener" target="_blank">Aplică pe site-ul angajatorului</a></li>` : "",
  ].join("");
  const continut = `
    <nav class="mb-4 flex flex-wrap gap-2 text-xs text-stone-600" aria-label="Breadcrumb"><a class="underline underline-offset-2" href="/locuri-de-munca">Locuri de muncă</a><span>/</span><a class="underline underline-offset-2" href="${urlLista(a.oras_slug, null)}">${esc(oras(a))}</a>${a.meserie ? `<span>/</span><a class="underline underline-offset-2" href="${listaMeserie}">${esc(meserie!)}</a>` : ""}</nav>
    <p class="text-xs font-medium uppercase tracking-wide text-stone-600">Anunț angajare</p>
    <h1 class="mt-1 text-[28px] font-bold leading-tight tracking-[-0.02em] text-stone-900 sm:text-[34px]">${esc(a.titlu)}</h1>
    <p class="mt-2 text-base text-stone-600">${esc(a.angajator)} · ${esc(loc(a))}</p>
    <div class="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
      <div class="${CARD}">
        <p class="text-xs font-medium text-stone-700">Salariul oferit</p>
        <p class="mt-2 text-3xl font-bold tracking-tight text-stone-900">${suma(a)}</p>
        <p class="mt-1 text-sm text-stone-600">Pe lună · ${norma(a)}</p>
        <div class="mt-5 text-base text-stone-800">${descriereHtml(a.descriere)}</div>
        <p class="mt-4 text-xs text-stone-600">Publicat pe ${data(a.confirmat_la!)} · valabil până pe ${data(a.expira_la!)}</p>
      </div>
      <div class="flex flex-col gap-4">
        <div class="${CARD}">
          <h2 class="text-base font-bold text-stone-900">Aplică direct la angajator</h2>
          <ul class="mt-3 flex flex-col gap-2 text-base">${contact}</ul>
          <p class="mt-3 text-xs text-stone-600">Nu plăti niciodată ca să fii angajat. Legea interzice taxele cerute candidaților.</p>
        </div>
        <div class="${CARD}">
          <h2 class="text-base font-bold text-stone-900">Cât primești în mână</h2>
          <p class="mt-2 text-sm text-stone-600">${a.baza === "brut" ? `Din ${lei(a.salariu_min)} lei brut rămân ${lei(a.net_min)} lei net, după contribuții și impozit.` : "Suma e deja netă: atât primești pe card."}</p>
          <a class="mt-3 inline-flex min-h-11 items-center rounded-md bg-stone-900 px-4 font-semibold text-white hover:bg-stone-700" href="/?${a.baza}=${a.salariu_min}">Calculează ${a.baza === "brut" ? "netul" : "brutul"}</a>
          ${a.meserie ? `<p class="mt-3 text-sm"><a class="underline underline-offset-2" href="/salarii/${a.meserie}">Cât câștigă un ${esc(meserie!.toLowerCase())}</a></p>` : ""}
        </div>
        <div class="${CARD}">
          <p class="text-sm text-stone-700">Țeapă, discriminare, salariu fals? <a class="font-semibold underline underline-offset-2" href="/locuri-de-munca/raporteaza#${a.id}">Raportează anunțul</a>. La trei raportări, se suspendă până îl verificăm.</p>
        </div>
      </div>
    </div>`;

  // JobPosting pentru Google Jobs: numai câmpurile pe care anunțul le are de fapt.
  const jsonLd = {
    "@context": "https://schema.org", "@type": "JobPosting",
    title: a.titlu, description: descriereHtml(a.descriere), datePosted: a.confirmat_la, validThrough: a.expira_la,
    employmentType: a.norma === "partiala" ? "PART_TIME" : "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: a.angajator },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: oras(a), addressRegion: JUDETE[a.judet], addressCountry: "RO" } },
    baseSalary: { "@type": "MonetaryAmount", currency: "RON", value: { "@type": "QuantitativeValue", unitText: "MONTH", ...(a.salariu_max ? { minValue: a.salariu_min, maxValue: a.salariu_max } : { value: a.salariu_min }) } },
    ...(a.cui ? { identifier: { "@type": "PropertyValue", name: "CUI", value: a.cui } } : {}),
    directApply: false,
  };
  // Titlul începe cu „Anunț angajare”, ca paginile din top 3 la „anunt de angajare”.
  const titlu = `Anunț angajare ${a.titlu}, ${oras(a)} — ${suma(a)}`;
  const desc = `Anunț angajare ${a.titlu}, ${oras(a)}: ${suma(a)} pe lună, ${norma(a).toLowerCase()}. ${a.angajator}. Aplici direct la angajator.`;
  return inSablon(req, env, { titlu, descriere: desc.slice(0, 158), canonic, indexabil: true, continut, jsonLd });
}

export async function sitemap(env: Env): Promise<Response> {
  const [anunturi, liste] = await Promise.all([toateActive(env), listeIndexabile(env, PRAG_INDEX)]);
  const urls = [
    `<url><loc>${SITE}/locuri-de-munca</loc></url>`,
    ...liste.map((l) => `<url><loc>${SITE}${urlLista(l.oras, l.meserie)}</loc></url>`),
    ...anunturi.map((a) => `<url><loc>${SITE}${urlAnunt(a)}</loc><lastmod>${a.confirmat_la!.slice(0, 10)}</lastmod></url>`),
  ];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`,
    { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
