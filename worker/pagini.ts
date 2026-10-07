// Paginile de anunțuri, puse în șablonul static /locuri-de-munca/sablon (header, footer, CSS).
// Adresele (verificate în Google România, 28 septembrie 2026) sunt deținute de src/lib/anunturi/reguli.ts.
import type { Env } from "./index";
import { CONTRACTE, JUDETE, LOCURI_MUNCA, NORME, URL_ADAUGA, esteMobil, linkApel, linkDistribuieFacebook, linkDistribuieWhatsApp, linkWhatsApp, telefonAfisat, urlAnunt, urlLista, type Contract, type LocMunca, type Norma } from "../src/lib/anunturi/reguli";
import { completeazaSablon } from "../src/lib/anunturi/sablon";
import { DOMENII, MESERII_ANUNTURI, esteDomeniu, grupMeserie, numeDomeniu, slugurileGrupului, variante, cuvantAfisat } from "../src/lib/anunturi/meserii";
import { PE_PAGINA, cuvinteCautate, dupaId, fatete, lista, listeIndexabile, numeOras, scoaseRecent, toateActive, type Anunt, type Filtru } from "./date";

// Meseriile hubului, cu sinonimele lor (src/lib/anunturi/meserii.ts), nu catalogul paginilor de salarii.
const NUME_MESERIE = new Map(MESERII_ANUNTURI.map((m) => [m.slug, m.nume]));
export const esteMeserie = (s: string) => NUME_MESERIE.has(s);
const CARD = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";
const BUTON_MIC = "inline-flex min-h-11 items-center rounded-md border border-stone-300 bg-surface px-3 font-semibold text-stone-900 hover:border-stone-500";
/**
 * O listă intră în Google de la atâtea anunțuri (proprietar, 29 septembrie 2026: 2, nu 5, ca primul
 * angajator dintr-un oraș să nu aștepte alți patru). Cu un singur anunț lista ar fi o copie a paginii
 * lui, care e indexată oricum din prima clipă; de la 2, lista chiar compară oferte.
 */
export const PRAG_INDEX = 2;
const SITE = "https://salariile.ro";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const lei = (n: number) => n.toLocaleString("ro-RO");
const data = (iso: string) => new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "long", timeZone: "Europe/Bucharest" });
const suma = (a: Anunt) => `${a.salariu_max ? `${lei(a.salariu_min)}–${lei(a.salariu_max)}` : lei(a.salariu_min)} lei ${a.baza}`;
const norma = (a: Anunt) => (a.norma === "partiala" ? `${NORME.partiala}, ${a.ore_pe_zi} ore pe zi` : NORME.intreaga);
const oras = (a: Anunt) => a.oras.replace(/,.*$/, "").trim();
/** „Cluj-Napoca, Cluj”, dar „București”, nu „București, București”. */
const loc = (a: Anunt) => (oras(a) === JUDETE[a.judet] ? oras(a) : `${oras(a)}, ${JUDETE[a.judet]}`);

type Pagina = { titlu: string; descriere: string; canonic: string; indexabil: boolean; continut: string; jsonLd?: object[]; status?: number };

/** BreadcrumbList pentru Google, aceleași trepte ca breadcrumb-ul vizibil; ultima e pagina însăși, fără link. */
function firImplicit(trepte: [string, string | null][]): object {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: trepte.map(([name, cale], i) => ({ "@type": "ListItem", position: i + 1, name, ...(cale ? { item: `${SITE}${cale}` } : {}) })),
  };
}

async function inSablon(req: Request, env: Env, p: Pagina): Promise<Response> {
  const sablon = await env.ASSETS.fetch(new Request(new URL("/locuri-de-munca/sablon", req.url)));
  const html = completeazaSablon(await sablon.text(), {
    titlu: `${p.titlu} | Salariile`, titluScurt: p.titlu, descriere: p.descriere, canonic: p.canonic,
    robots: p.indexabil ? "index, follow" : "noindex, follow",
  });
  let r = new HTMLRewriter()
    .on("[data-anunturi-continut]", { element(e) { e.setInnerContent(p.continut, { html: true }); } });
  if (p.jsonLd?.length) {
    const scripturi = p.jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("");
    r = r.on("head", { element(e) { e.append(scripturi, { html: true }); } });
  }
  // Fără headerele șablonului: content-length și etag erau ale lui, nu ale paginii.
  const out = r.transform(new Response(html));
  const h = new Headers(out.headers);
  h.set("content-type", "text/html; charset=utf-8");
  h.set("cache-control", "public, max-age=60, s-maxage=60");
  return new Response(out.body, { status: p.status ?? 200, headers: h });
}

/** Când D1 nu mai răspunde (limita zilnică): pagina e șablonul static, fără nicio citire din bază. */
export function paginaIndisponibila(req: Request, env: Env): Promise<Response> {
  return inSablon(req, env, {
    titlu: "Anunțurile revin în câteva ore", descriere: "Anunțurile de angajare sunt indisponibile temporar.", canonic: `${SITE}/locuri-de-munca`, indexabil: false, status: 503,
    continut: `<h1 class="text-[28px] font-bold text-stone-900">Anunțurile revin în câteva ore</h1>
      <p class="mt-3 max-w-prose text-base text-stone-700">Lista de anunțuri e indisponibilă temporar. Anunțurile publicate nu s-au pierdut și revin singure, fără să faci nimic.</p>
      <p class="mt-3"><a class="underline underline-offset-2" href="/">Calculează salariul net</a></p>`,
  });
}

/**
 * Filtrele din interogare: domeniul, căutarea liberă, norma și ordinea. O valoare necunoscută se
 * ignoră. Fără praguri de salariu: proprietarul nu le vrea (29 septembrie 2026).
 */
export type Extra = { domeniu?: string; q?: string; norma?: Norma; contract?: Contract; loc?: LocMunca; experienta?: "fara"; ordine?: "salariu" };
export function citesteExtra(u: URL): Extra {
  const norma = u.searchParams.get("norma"), domeniu = u.searchParams.get("domeniu") ?? "";
  const contract = u.searchParams.get("contract") ?? "", loc = u.searchParams.get("loc") ?? "";
  // Căutarea: cel mult 60 de caractere, cu spațiile strânse; fără niciun cuvânt de căutat nu contează.
  const q = (u.searchParams.get("q") ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
  return {
    domeniu: esteDomeniu(domeniu) ? domeniu : undefined,
    q: q && cuvinteCautate(q).length ? q : undefined,
    norma: norma === "intreaga" || norma === "partiala" ? norma : undefined,
    contract: Object.hasOwn(CONTRACTE, contract) ? (contract as Contract) : undefined,
    loc: Object.hasOwn(LOCURI_MUNCA, loc) ? (loc as LocMunca) : undefined,
    experienta: u.searchParams.get("experienta") === "fara" ? "fara" : undefined,
    ordine: u.searchParams.get("ordine") === "salariu" ? "salariu" : undefined,
  };
}
const paginaDin = (u: URL) => Math.max(1, Math.min(500, Number(u.searchParams.get("pagina")) || 1));
/** Interogarea, mereu în aceeași ordine: o listă are o singură adresă, deci o singură intrare în cache. */
function interogare(e: Extra, pagina = 1): string {
  const q = new URLSearchParams();
  if (e.domeniu) q.set("domeniu", e.domeniu);
  if (e.q) q.set("q", e.q);
  if (e.norma) q.set("norma", e.norma);
  if (e.contract) q.set("contract", e.contract);
  if (e.loc) q.set("loc", e.loc);
  if (e.experienta) q.set("experienta", e.experienta);
  if (e.ordine) q.set("ordine", e.ordine);
  if (pagina > 1) q.set("pagina", String(pagina));
  const s = q.toString();
  return s ? `?${s}` : "";
}
/**
 * Cheia de cache a unei liste, fără parametrii pe care pagina îi ignoră: un link distribuit pe
 * Facebook primește `fbclid`, unic la fiecare distribuire, și fiecare ar fi citit D1 din nou.
 */
export const cheieLista = (u: URL) => `${u.origin}${u.pathname.replace(/\/+$/, "")}${interogare(citesteExtra(u), paginaDin(u))}`;

const ziua = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });
/** „Publicat azi”, „ieri” sau data. */
function publicat(iso: string): string {
  const z = ziua(new Date(iso));
  if (z === ziua(new Date())) return "Publicat azi";
  if (z === ziua(new Date(Date.now() - 86400000))) return "Publicat ieri";
  return `Publicat pe ${data(iso)}`;
}
const PIN = `<svg class="mt-0.5 size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`;
const PASTILA = "rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700";
/** Contractul, locul muncii (fără „la sediu”, care e de la sine) și „Fără experiență”, când anunțul le spune. */
const detalii = (a: Anunt) => [
  a.contract ? CONTRACTE[a.contract] : "", a.loc_munca && a.loc_munca !== "sediu" ? LOCURI_MUNCA[a.loc_munca] : "", a.fara_experienta ? "Fără experiență" : "",
].filter(Boolean);

/**
 * Cardul din liste (varianta B a schițelor, aleasă de proprietar pe 29 septembrie 2026); îl
 * folosește și /api/anunturi/lista la „sortează după apropiere”. Salariul e eticheta galbenă de sub
 * titlu; strada și începutul descrierii umplu cardul cu ce e deja în anunț. Pe card scrie „Vezi
 * anunțul”, nu „Sună”: cine sună trebuie să fi citit anunțul (proprietar).
 */
export function cardLista(a: Anunt): string {
  const meserie = a.meserie ? NUME_MESERIE.get(a.meserie) : null;
  const unde = `${a.angajator ? `${esc(a.angajator)} · ` : ""}${a.adresa ? `${esc(a.adresa)}, ` : ""}${esc(loc(a))}`;
  const net = a.baza === "brut" ? `<span class="${PASTILA}">${a.salariu_max ? "de la " : ""}≈ ${lei(a.net_min)} lei net</span>` : "";
  return `<li><a href="${urlAnunt(a)}" class="block rounded-md border border-stone-200 bg-surface p-4 shadow-soft hover:border-stone-400 sm:px-5" data-anunt="${a.id}">
    <span class="block text-base font-bold leading-snug text-stone-900">${esc(a.titlu)}</span>
    <span class="mt-1 flex items-start gap-1.5 text-sm text-stone-600">${PIN}<span class="min-w-0">${unde}</span></span>
    <span class="mt-3 flex flex-wrap items-center gap-1.5">
      <span class="rounded-md bg-marcaj/25 px-2 py-1 text-sm font-bold tabular-nums text-stone-900">${suma(a)}</span>${net}
      <span class="${PASTILA}">${norma(a)}</span>${detalii(a).map((d) => `<span class="${PASTILA}">${d}</span>`).join("")}${meserie ? `<span class="${PASTILA}">${esc(meserie)}</span>` : ""}
    </span>
    <span class="mt-2.5 block truncate text-sm text-stone-700">${esc(a.descriere.replace(/\s+/g, " ").trim().slice(0, 240))}</span>
    <span class="mt-3 flex items-center gap-3">
      <span class="text-xs text-stone-600">${publicat(a.confirmat_la!)}<span data-distanta class="font-semibold text-stone-900"></span></span>
      <span class="ml-auto inline-flex min-h-9 items-center rounded-md border border-stone-300 bg-surface px-3 text-sm font-semibold text-stone-900">Vezi anunțul</span>
    </span>
  </a></li>`;
}

/** /locuri-de-munca?meserie=barman&oras=bucuresti (formularul de filtre) → /locuri-de-munca/bucuresti/barman. */
export function redirectFiltre(req: Request): Response | null {
  const u = new URL(req.url);
  if (!u.searchParams.has("meserie") && !u.searchParams.has("oras")) return null;
  const m = u.searchParams.get("meserie") ?? "", o = (u.searchParams.get("oras") ?? "").replace(/[^a-z0-9-]/g, "");
  return Response.redirect(new URL(urlLista(o || null, esteMeserie(m) ? m : null) + interogare(citesteExtra(u)), req.url).toString(), 302);
}

/** Iconițele din bara listei (aceleași trasee ca în schițe). */
const SVG = (cls: string, d: string) => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const D_LUPA = '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>';
const D_FILTRE = '<path d="M4 6h16M7 12h10M10 18h4"/>';
const D_ORDINE = '<path d="M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3"/>';
const D_JOS = '<path d="M6 9l6 6 6-6"/>';

/**
 * Ordinea listei, ca în schița B: un singur buton „Cele mai noi ▾”. Primele două opțiuni sunt
 * adrese. „Aproape de mine” (proprietar, 28 septembrie 2026, ca pe OLX) ordonează în telefon:
 * browserul cere poziția, ia anunțurile listei de la /api/anunturi/lista și le ordonează singur.
 * Poziția nu pleacă din telefon: nici în URL, nici în cerere.
 */
function sortare(extra: Extra, q: (p: number, e?: Extra) => string, apropiere: string | null): string {
  return `<div class="relative">
      ${SVG("pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-600", D_ORDINE)}
      <select data-ordine aria-label="Ordinea anunțurilor" class="block min-h-11 w-full appearance-none rounded-md border border-stone-300 bg-surface pl-9 pr-9 text-base font-semibold text-stone-900 hover:border-stone-500 lg:text-sm">
        <option value="${q(1, { ...extra, ordine: undefined })}"${extra.ordine ? "" : " selected"}>Cele mai noi</option>
        <option value="${q(1, { ...extra, ordine: "salariu" })}"${extra.ordine ? " selected" : ""}>Salariul cel mai mare</option>${apropiere ? `
        <option value="aproape" data-apropiere="${apropiere}">Aproape de mine</option>` : ""}
      </select>
      ${SVG("pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-stone-600", D_JOS)}
    </div>`;
}

const SCRIPT_ORDINE = `<script>
  (function () {
    var sel = document.querySelectorAll("select[data-ordine]");
    function toate(v) { sel.forEach(function (s) { s.value = v; }); }
    function km(a, b2, c, d) { var r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b2) * r / 2); return 12742 * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y)); }
    sel.forEach(function (s) {
      if (!navigator.geolocation) s.querySelectorAll('option[value="aproape"]').forEach(function (o) { o.remove(); });
      var inainte = s.value;
      s.addEventListener("change", function () {
        if (s.value !== "aproape") { location.href = s.value; return; }
        toate("aproape");
        aproape(s.selectedOptions[0].getAttribute("data-apropiere"), function () { toate(inainte); });
      });
    });
    function aproape(url, renunta) {
      var stare = document.querySelector("[data-apropiere-stare]"), ul = document.querySelector("[data-lista-anunturi]");
      if (!stare || !ul) return;
      stare.textContent = "Caut unde ești…";
      navigator.geolocation.getCurrentPosition(function (p) {
        var la = p.coords.latitude, lo = p.coords.longitude;
        fetch(url).then(function (r) { return r.json(); }).then(function (lista) {
          // Fără adresă, coordonatele sunt centrul localității: pe lista unui oraș nu spun cât e de
          // aproape, deci anunțul trece la coadă; pe lista națională, orașul tot contează.
          var peOras = /[?&]oras=/.test(url);
          lista.forEach(function (x) {
            x.d = x.lat == null ? Infinity : km(la, lo, x.lat, x.lon);
            x.k = x.precis || !peOras ? x.d : 1e9 + x.d;
          });
          lista.sort(function (x, y) { return x.k - y.k; });
          ul.innerHTML = lista.map(function (x) { return x.html; }).join("");
          ul.querySelectorAll("li").forEach(function (li, i) {
            var d = lista[i].d, e = li.querySelector("[data-distanta]");
            if (!e) return;
            if (!lista[i].precis) e.textContent = " · fără adresă exactă";
            else if (isFinite(d)) e.textContent = " · la " + (d < 1 ? Math.round(d * 1000) + " m" : d.toLocaleString("ro-RO", { maximumFractionDigits: 1 }) + " km") + " de tine";
          });
          document.querySelectorAll("nav[aria-label=Pagini]").forEach(function (n) { n.hidden = true; });
          stare.textContent = "Cele mai apropiate primele.";
        }).catch(function () { stare.textContent = "Nu am putut încărca anunțurile. Încearcă din nou."; renunta(); });
      }, function () { stare.textContent = "Fără acces la locație, ordinea rămâne cea de dinainte."; renunta(); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    }
  })();
  </script>`;

/** `p`: numele principal al grupului; câmpul gol arată numai principalele, ca „Chelner” să nu dubleze „Ospătar”. */
type OptiuneFiltru = { s: string; n: string; c: number; p?: boolean };

const BLOC = "rounded-md border border-stone-200 bg-surface p-4";
const TITLU_BLOC = "block text-sm font-bold text-stone-900";

/** O opțiune din coloana de filtre: link spre lista filtrată; un clic pe cea aleasă o scoate. */
function optiune(href: string, text: string, n: number, ales: boolean): string {
  if (!n && !ales) return `<span class="flex min-h-10 items-center gap-2.5 text-sm text-stone-400"><span class="size-4 shrink-0 rounded border border-stone-200"></span>${esc(text)}<span class="ml-auto text-xs tabular-nums">0</span></span>`;
  const cutie = ales ? "border-stone-900 bg-stone-900 shadow-[inset_0_0_0_3px_var(--color-surface)]" : "border-stone-300 bg-surface";
  return `<a href="${href}" class="flex min-h-10 items-center gap-2.5 text-sm ${ales ? "font-semibold text-stone-900" : "text-stone-700 hover:text-stone-900"}"${ales ? ' aria-current="true"' : ""}><span class="size-4 shrink-0 rounded border ${cutie}"></span>${esc(text)}<span class="ml-auto text-xs tabular-nums text-stone-500">${n}</span></a>`;
}

/**
 * Filtrele listei, ca în schița B (proprietar, 29 septembrie 2026). Pe PC, coloana din stânga:
 * „Caută meseria…” și „Caută localitatea…” cu primele opțiuni bifabile, apoi norma. Pe telefon, un
 * singur câmp „Meseria sau localitatea” deasupra listei, iar coloana se deschide din „Filtre”.
 *
 * Câmpurile pornesc ca <select>, care merg și fără JavaScript; scriptul le înlocuiește cu căutare
 * pe măsură ce scrii: „b” aduce București, Bacău (proprietar, ca pe OLX). Potrivirea e cea din
 * `cauta` (src/lib/anunturi/localitati.ts): întâi începutul, apoi începutul unui cuvânt, apoi, de la
 * 3 litere, oriunde. Localitățile sunt numai cele cu anunțuri: altfel alegerea ar duce la un 404.
 */
function filtre(p: {
  meserii: OptiuneFiltru[]; meserie: string | null; orase: OptiuneFiltru[]; orasSlug: string | null; domenii: OptiuneFiltru[]; extra: Extra;
  norme: Map<Norma, number>; contracte: Map<Contract, number>; locuri: Map<LocMunca, number>; faraExperienta: number;
}): { cautare: string; panou: string; script: string } {
  const { meserii, meserie, orase, orasSlug, extra } = p;
  const optiuni = (valori: OptiuneFiltru[], ales: string | null) => valori.map((o) => `<option value="${o.s}" data-n="${o.c}"${o.p === false ? "" : " data-p"}${o.s === ales ? " selected" : ""}>${esc(o.n)}</option>`).join("");
  const SELECT = "mt-2 block w-full rounded-md border border-stone-300 bg-surface px-2.5 py-1.5 text-base lg:text-sm";
  const url = (o: string | null, m: string | null, e: Extra) => urlLista(o, m) + interogare(e);
  // Primele opțiuni cu anunțuri, cele mai multe primele; cea aleasă rămâne mereu în listă.
  const primele = (v: OptiuneFiltru[], ales: string | null, cate = 6) => v.filter((o) => (o.c > 0 && o.p !== false) || o.s === ales).sort((a, b) => b.c - a.c || a.n.localeCompare(b.n, "ro")).slice(0, cate);
  // Meseria și domeniul aleși din coloană înlocuiesc căutarea liberă, ca în bară.
  const listaMeserii = primele(meserii, meserie).map((o) => optiune(url(orasSlug, o.s === meserie ? null : o.s, { ...extra, q: undefined }), o.n, o.c, o.s === meserie)).join("");
  const listaOrase = primele(orase, orasSlug).map((o) => optiune(url(o.s === orasSlug ? null : o.s, meserie, extra), o.n, o.c, o.s === orasSlug)).join("");
  // Domeniile cu anunțuri, ca rubricile OLX și departamentele eJobs.
  const listaDomenii = primele(p.domenii, extra.domeniu ?? null, 20).map((o) => optiune(url(orasSlug, meserie, { ...extra, domeniu: o.s === extra.domeniu ? undefined : o.s, q: undefined }), o.n, o.c, o.s === extra.domeniu)).join("");
  const norme = (["intreaga", "partiala"] as const).map((k) => {
    const ales = extra.norma === k;
    return optiune(url(orasSlug, meserie, { ...extra, norma: ales ? undefined : k }), NORME[k], p.norme.get(k) ?? 0, ales);
  }).join("");
  // Filtrele de pe OLX și eJobs (proprietar, 29 septembrie 2026); câmpurile sunt opționale la postare.
  const experienta = optiune(url(orasSlug, meserie, { ...extra, experienta: extra.experienta ? undefined : "fara" }), "Fără experiență", p.faraExperienta, Boolean(extra.experienta));
  const contracte = (Object.keys(CONTRACTE) as Contract[]).map((k) => {
    const ales = extra.contract === k;
    return optiune(url(orasSlug, meserie, { ...extra, contract: ales ? undefined : k }), CONTRACTE[k], p.contracte.get(k) ?? 0, ales);
  }).join("");
  const locuri = (["acasa", "hibrid"] as const).map((k) => {
    const ales = extra.loc === k;
    return optiune(url(orasSlug, meserie, { ...extra, loc: ales ? undefined : k }), LOCURI_MUNCA[k], p.locuri.get(k) ?? 0, ales);
  }).join("");
  const ascunse = `<input type="hidden" name="domeniu" value="${extra.domeniu ?? ""}"><input type="hidden" name="q" value="${esc(extra.q ?? "")}">${extra.norma ? `<input type="hidden" name="norma" value="${extra.norma}">` : ""}${extra.contract ? `<input type="hidden" name="contract" value="${extra.contract}">` : ""}${extra.loc ? `<input type="hidden" name="loc" value="${extra.loc}">` : ""}${extra.experienta ? `<input type="hidden" name="experienta" value="${extra.experienta}">` : ""}${extra.ordine ? `<input type="hidden" name="ordine" value="${extra.ordine}">` : ""}`;
  // Câmpul comun de pe telefon: aceleași opțiuni, cu tipul lor. „m:” schimbă meseria, „o:” localitatea.
  const combinate = [
    ...meserii.map((o) => `<option value="m:${o.s}" data-n="${o.c}" data-tip="meserie"${o.p === false ? "" : " data-p"}>${esc(o.n)}</option>`),
    ...orase.map((o) => `<option value="o:${o.s}" data-n="${o.c}" data-tip="localitate" data-p>${esc(o.n)}</option>`),
    ...p.domenii.map((o) => `<option value="d:${o.s}" data-n="${o.c}" data-tip="domeniu" data-p>${esc(o.n)}</option>`),
  ].join("");
  const cautare = `<div class="relative">${SVG("pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-stone-500", D_LUPA)}
        <select data-cauta="Caută: barman, ajutor bucătar, București…" data-combinat data-q="${esc(extra.q ?? "")}" aria-label="Caută meseria sau localitatea" class="block w-full rounded-md border border-stone-300 bg-surface py-2.5 pl-10 pr-3 text-base"><option value="">Meseria sau localitatea</option>${combinate}</select>
      </div>`;
  const panou = `<aside id="panou-filtre" class="grid gap-3">
      <form method="get" action="/locuri-de-munca" class="grid gap-3" data-filtre>${ascunse}
        ${listaDomenii ? `<div class="${BLOC}"><p class="${TITLU_BLOC}">Domeniul</p><div class="mt-1">${listaDomenii}</div></div>` : ""}
        <div class="${BLOC}">
          <label class="block"><span class="${TITLU_BLOC}">Meseria</span>
            <select name="meserie" class="${SELECT}" data-cauta="Caută meseria…"><option value="">Toate meseriile</option>${optiuni(meserii, meserie)}</select>
          </label>
          ${listaMeserii ? `<div class="mt-2">${listaMeserii}</div>` : ""}
        </div>
        <div class="${BLOC}">
          <label class="block"><span class="${TITLU_BLOC}">Localitatea</span>
            <select name="oras" class="${SELECT}" data-cauta="Caută localitatea…"><option value="">Toată țara</option>${optiuni(orase, orasSlug)}</select>
          </label>
          ${listaOrase ? `<div class="mt-2">${listaOrase}</div>` : ""}
        </div>
        <button type="submit" data-filtre-buton class="min-h-11 rounded-md border border-stone-300 bg-surface px-4 font-semibold text-stone-900 hover:border-stone-500">Caută</button>
        <div class="${BLOC}"><p class="${TITLU_BLOC}">Norma</p><div class="mt-1">${norme}</div></div>
        <div class="${BLOC}"><p class="${TITLU_BLOC}">Experiența</p><div class="mt-1">${experienta}</div></div>
        <div class="${BLOC}"><p class="${TITLU_BLOC}">Contractul</p><div class="mt-1">${contracte}</div></div>
        <div class="${BLOC}"><p class="${TITLU_BLOC}">Unde se lucrează</p><div class="mt-1">${locuri}</div></div>
      </form>
      <div class="rounded-md border border-dashed border-stone-300 bg-canvas p-4 text-sm text-stone-700">
        <p class="text-base font-bold text-stone-900">Angajezi?</p>
        <p class="mt-1">Anunț gratuit, fără cont, publicat în câteva minute.</p>
        <a href="${URL_ADAUGA}" class="mt-3 flex min-h-11 items-center justify-center rounded-md bg-stone-900 px-4 font-semibold text-white hover:bg-stone-700">Adaugă anunț</a>
      </div>
    </aside>
    <script>
    // Pe telefon, coloana stă strânsă sub „Filtre”; fără script rămâne deschisă, deci tot se poate filtra.
    (function () {
      var panou = document.getElementById("panou-filtre"), buton = document.querySelector("[data-filtre-comuta]");
      document.querySelectorAll("[data-doar-cu-script]").forEach(function (x) { x.hidden = false; });
      if (!panou || !buton) return;
      panou.classList.add("max-lg:hidden");
      buton.addEventListener("click", function () { var ascuns = panou.classList.toggle("max-lg:hidden"); buton.setAttribute("aria-expanded", String(!ascuns)); });
    })();
    </script>`;
  // Scriptul câmpurilor stă la sfârșitul paginii: câmpul de căutare de pe PC vine după coloană.
  const script = `<script>
    (function () {
      var form = document.querySelector("[data-filtre]");
      if (!form) return;
      // Cu script, alegerea deschide lista imediat; „Caută” rămâne doar pentru browserele fără script.
      var buton = form.querySelector("[data-filtre-buton]");
      if (buton) buton.hidden = true;
      var nr = 0;
      function pune(nume, x) { var h = form.querySelector('input[type="hidden"][name="' + nume + '"]'); if (h) h.value = x; }
      function fara(s) { return s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase(); }
      // Distanța dintre două cuvinte (ca în src/lib/anunturi/meserii.ts): sugestiile găsesc „Barman” și la „barmn”.
      function dist(a, b) {
        var d = [], i, j;
        for (i = 0; i <= a.length; i++) { d.push([i]); for (j = 1; j <= b.length; j++) d[i].push(i ? 0 : j); }
        for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) {
          d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
        return d[a.length][b.length];
      }
      function cate(n) { return n === 0 ? "niciun anunț încă" : n === 1 ? "1 anunț" : n.toLocaleString("ro-RO") + (n % 100 >= 20 || n % 100 === 0 ? " de anunțuri" : " anunțuri"); }
      document.querySelectorAll("select[data-cauta]").forEach(function (sel) {
        // Câmpul de pe telefon caută deodată în meserii și în localități.
        var combinat = sel.hasAttribute("data-combinat");
        var id = "filtru-" + (++nr), toate = [], ales = combinat ? "" : sel.value, activ = 0, gasite = [];
        Array.prototype.forEach.call(sel.options, function (o) { if (o.value) toate.push({ v: o.value, t: o.text, n: Number(o.dataset.n) || 0, p: o.hasAttribute("data-p"), tip: o.dataset.tip || "", f: fara(o.text) }); });
        function nume(v) { for (var i = 0; i < toate.length; i++) if (toate[i].v === v) return toate[i].t; return ""; }
        var tot = sel.options[0].text;

        var cutie = document.createElement("div"); cutie.className = combinat ? "relative" : "relative mt-2";
        var inp = document.createElement("input");
        inp.type = "text"; inp.id = id; inp.autocomplete = "off"; inp.spellcheck = false;
        inp.setAttribute("role", "combobox"); inp.setAttribute("aria-autocomplete", "list"); inp.setAttribute("aria-expanded", "false"); inp.setAttribute("aria-controls", id + "-l");
        if (sel.getAttribute("aria-label")) inp.setAttribute("aria-label", sel.getAttribute("aria-label"));
        // În câmpul comun rămâne scris ce s-a căutat, ca pe OLX.
        var initial = combinat ? sel.dataset.q || "" : "";
        inp.placeholder = sel.dataset.cauta; inp.value = combinat ? initial : nume(ales);
        inp.className = combinat
          ? "block w-full rounded-md border border-stone-300 bg-surface py-2.5 pl-10 pr-3 text-base text-stone-900 focus:border-stone-600 focus:outline-none"
          : "block w-full rounded-md border border-stone-300 bg-surface py-1.5 pl-2.5 pr-9 text-base text-stone-900 focus:border-stone-600 focus:outline-none lg:text-sm";
        var sterge = document.createElement("button");
        sterge.type = "button"; sterge.textContent = "×"; sterge.setAttribute("aria-label", tot);
        sterge.className = "absolute right-0 top-0 flex h-full w-9 items-center justify-center text-xl leading-none text-stone-500 hover:text-stone-900";
        sterge.hidden = combinat || !ales;
        var ul = document.createElement("ul");
        ul.id = id + "-l"; ul.setAttribute("role", "listbox"); ul.hidden = true;
        ul.className = "absolute left-0 right-0 z-20 mt-1 max-h-80 overflow-auto rounded-md border border-stone-300 bg-surface py-1 shadow-lg";
        var ascuns = document.createElement("input"); ascuns.type = "hidden"; if (!combinat) ascuns.name = sel.name; ascuns.value = ales;
        cutie.append(inp, sterge, ul);
        sel.replaceWith(cutie, ascuns);

        function cauta(text) {
          var q = fara(text).replace(/\\s+/g, " ").trim();
          // Primul rând al câmpului comun caută textul scris în toate anunțurile (Enter îl alege).
          var liber = combinat && q.length >= 2 ? [{ v: "q:" + text.replace(/\\s+/g, " ").trim(), t: "Caută „" + text.trim() + "”", n: -1, tip: "", p: true }] : [];
          // Câmpul gol sau cu alegerea de acum: arată ce are anunțuri, cele mai multe primele.
          if (!q || text === nume(ales)) return liber.concat(toate.filter(function (o) { return o.n > 0 && o.p; }).sort(function (a, b) { return b.n - a.n || a.t.localeCompare(b.t, "ro"); }).slice(0, 8));
          var r = [];
          toate.forEach(function (o) {
            var s = o.f.startsWith(q) ? 0 : o.f.indexOf(" " + q) >= 0 || o.f.indexOf("-" + q) >= 0 ? 1 : q.length >= 3 && o.f.indexOf(q) >= 0 ? 2 : -1;
            if (s >= 0) r.push([o, s]);
          });
          // Puține potriviri: se adaugă numele scrise aproape la fel, cu o greșeală (două de la 8 litere).
          if (r.length < 3 && q.length >= 4) {
            var max = q.length >= 8 ? 2 : 1;
            toate.forEach(function (o) {
              if (r.some(function (x) { return x[0] === o; })) return;
              if (o.f.split(/[\\s-]+/).some(function (w) { return Math.abs(w.length - q.length) <= max && dist(q, w) <= max; })) r.push([o, 3]);
            });
          }
          return liber.concat(r.sort(function (a, b) { return a[1] - b[1] || (b[0].n > 0) - (a[0].n > 0) || a[0].t.localeCompare(b[0].t, "ro"); }).slice(0, 8).map(function (x) { return x[0]; }));
        }
        function arata() {
          gasite = cauta(inp.value); activ = 0;
          ul.innerHTML = "";
          if (!gasite.length) { var gol = document.createElement("li"); gol.className = "px-3 py-2 text-sm text-stone-600"; gol.textContent = "Nu se potrivește nimic."; ul.append(gol); }
          gasite.forEach(function (o, i) {
            var li = document.createElement("li");
            li.id = id + "-o" + i; li.setAttribute("role", "option");
            li.className = "flex min-h-11 cursor-pointer flex-col justify-center px-3 py-1.5";
            var a = document.createElement("span"); a.className = "text-base text-stone-900"; a.textContent = o.t;
            var b = document.createElement("span"); b.className = "text-xs text-stone-600"; b.textContent = o.n < 0 ? "În titlul, descrierea și firma anunțurilor" : (o.tip ? o.tip.charAt(0).toUpperCase() + o.tip.slice(1) + " · " : "") + cate(o.n);
            li.append(a, b);
            // mousedown, nu click: altfel câmpul pierde focusul și lista se închide înainte de alegere.
            li.addEventListener("mousedown", function (e) { e.preventDefault(); alege(o.v); });
            li.addEventListener("mouseenter", function () { activ = i; marcheaza(); });
            ul.append(li);
          });
          ul.hidden = false; inp.setAttribute("aria-expanded", "true"); marcheaza();
        }
        function marcheaza() {
          Array.prototype.forEach.call(ul.children, function (li, i) { li.classList.toggle("bg-stone-100", i === activ && gasite.length > 0); li.setAttribute("aria-selected", String(i === activ)); });
          if (gasite.length) inp.setAttribute("aria-activedescendant", id + "-o" + activ); else inp.removeAttribute("aria-activedescendant");
        }
        function inchide() { ul.hidden = true; inp.setAttribute("aria-expanded", "false"); inp.removeAttribute("aria-activedescendant"); }
        // Ce scriu oamenii în bară (proprietar, 30 septembrie 2026: „monitorizăm ce scriu ei exact”):
        // evenimentul GA4 „search”, ca la filtrul de meserii, cu zona „anunturi”; \`element\` spune ce au
        // ales („nimic” = au scris și au plecat: cererea pe care n-o acoperim). Cifrele de 3+ semne ies:
        // nu trimitem sume (src/lib/analytics.ts).
        var masurat = false;
        function masoara(v) {
          if (masurat || !window.gtag) return;
          var scris = inp.value.replace(/\\d{3,}/g, "").replace(/\\s+/g, " ").trim().slice(0, 60);
          if (scris.length < 2) return;
          masurat = true;
          var i = v.indexOf(":"), o = toate.filter(function (x) { return x.v === v; })[0];
          var tip = !v ? "nimic" : i > 0 ? ({ m: "meserie", o: "localitate", d: "domeniu", q: "text liber" })[v.slice(0, i)] : sel.name;
          try { window.gtag("event", "search", { search_term: scris, zona: "anunturi", element: tip + (o ? ": " + o.t : ""), rezultate: o && o.n >= 0 ? o.n : -1, transport_type: "beacon" }); } catch (e) {}
        }
        // Alegerea deschide lista imediat, ca pe OLX: fără încă un clic pe „Caută”.
        function alege(v) {
          masoara(v);
          inchide();
          if (combinat) {
            // Localitatea se adaugă la ce e ales. Meseria, domeniul și textul liber se înlocuiesc între ele:
            // o căutare nouă nu se încrucișează cu meseria de dinainte.
            var i = v.indexOf(":"), tip = v.slice(0, i), val = v.slice(i + 1);
            if (!val) return;
            if (tip === "o") pune("oras", val);
            else { pune("meserie", tip === "m" ? val : ""); pune("domeniu", tip === "d" ? val : ""); pune("q", tip === "q" ? val : ""); }
            inp.value = tip === "q" ? val : nume(v); form.submit(); return;
          }
          if (sel.name === "meserie") pune("q", "");
          ales = v; ascuns.value = v; inp.value = nume(v); sterge.hidden = !v; form.submit();
        }

        inp.addEventListener("focus", function () { inp.select(); arata(); });
        inp.addEventListener("input", arata);
        inp.addEventListener("blur", function () {
          if (inp.value !== (combinat ? initial : nume(ascuns.value))) masoara("");
          inchide();
          if (combinat) { inp.value = initial; return; }
          // Ce s-a scris fără alegere nu devine filtru: câmpul revine la alegerea de acum. Golit
          // înseamnă „toate”, aplicat la „Caută”.
          if (!inp.value.trim()) { ascuns.value = ""; sterge.hidden = true; } else inp.value = nume(ascuns.value);
        });
        inp.addEventListener("keydown", function (e) {
          if (e.key === "ArrowDown" && gasite.length) { e.preventDefault(); if (ul.hidden) arata(); else { activ = (activ + 1) % gasite.length; marcheaza(); } }
          else if (e.key === "ArrowUp" && gasite.length) { e.preventDefault(); activ = (activ - 1 + gasite.length) % gasite.length; marcheaza(); }
          else if (e.key === "Enter") { e.preventDefault(); if (!inp.value.trim()) { if (!combinat) alege(""); else if (initial) { pune("q", ""); form.submit(); } } else if (!ul.hidden && gasite[activ]) alege(gasite[activ].v); }
          else if (e.key === "Escape") inchide();
        });
        sterge.addEventListener("click", function () { alege(""); });
      });
    })();
    </script>`;
  return { cautare, panou, script };
}

export async function paginaLista(req: Request, env: Env, orasSlug: string | null, meserie: string | null): Promise<Response> {
  const u = new URL(req.url);
  const pagina = paginaDin(u), extra = citesteExtra(u);
  const f: Filtru = { meserie: meserie ?? undefined, oras: orasSlug ?? undefined, norma: extra.norma, domeniu: extra.domeniu, q: extra.q,
    faraExperienta: Boolean(extra.experienta), contract: extra.contract, locMunca: extra.loc };
  const [{ anunturi, total }, fat, numeLoc] = await Promise.all([
    lista(env, { ...f, pagina, ordine: extra.ordine }), fatete(env, f), orasSlug ? numeOras(env, orasSlug) : Promise.resolve(null),
  ]);
  // O localitate fără niciun anunț activ nu e o pagină: altfel orice cuvânt din URL ar deveni una.
  if (orasSlug && !numeLoc) {
    return inSablon(req, env, { titlu: "Nu sunt anunțuri aici", descriere: "Nu sunt anunțuri de angajare pentru această localitate.", canonic: `${SITE}/locuri-de-munca`, indexabil: false, status: 404,
      continut: `<h1 class="text-[28px] font-bold text-stone-900">Nu sunt anunțuri pentru această localitate</h1><p class="mt-3"><a class="underline" href="/locuri-de-munca">Vezi toate anunțurile</a> · <a class="underline" href="${URL_ADAUGA}">Adaugă un anunț</a></p>` });
  }
  const pagini = Math.max(1, Math.ceil(total / PE_PAGINA));
  const numeM = meserie ? NUME_MESERIE.get(meserie)!.toLowerCase() : "";
  // Sinonimele cumulate în listă, spuse pe față: altfel un anunț de „chelner” la „ospătar” ar părea o greșeală.
  const alteNume = meserie ? slugurileGrupului(meserie).filter((x) => x !== meserie).map((x) => NUME_MESERIE.get(x)!.toLowerCase()).join(", ") : "";
  // Domeniul intră în titlu, după meserie. Textul căutat nu (proprietar, 29 septembrie 2026): pe telefon
  // rupea titlul pe trei rânduri, cu greșeala de tastare în el („parman”); stă în câmp și în etichetă.
  const ce = numeM || (extra.domeniu ? numeDomeniu(extra.domeniu) : "");
  const unde = [ce, numeLoc ? `în ${numeLoc}` : ""].filter(Boolean).join(" ");
  // Fără numărul de anunțuri (proprietar, 29 septembrie 2026): „3 locuri de muncă” spunea „site mic”.
  // Începe cu „Locuri de muncă”, forma căutată în Google („locuri de muncă București”).
  const titlu = unde ? `Locuri de muncă ${unde}, cu salariul afișat` : "Locuri de muncă cu salariul afișat";
  const cale = urlLista(orasSlug, meserie);
  const q = (p: number, e: Extra = extra) => `${cale}${interogare(e, p)}`;
  // Numărul de lângă fiecare opțiune ține cont de celelalte filtre (proprietar, 29 septembrie 2026):
  // cu „Barman” ales, București arată câți barmani caută, nu toate anunțurile din oraș.
  const orase = fat.orase.map((o) => ({ ...o, n: o.n.replace(/,.*$/, "") }));
  const peGrup = new Map<string, number>();
  for (const m of fat.meserii) peGrup.set(grupMeserie(m.s), (peGrup.get(grupMeserie(m.s)) ?? 0) + m.c);
  const meserii = MESERII_ANUNTURI.map((m) => ({ s: m.slug, n: m.nume, c: peGrup.get(m.grup) ?? 0, p: m.slug === m.grup }))
    .sort((a, b) => a.n.localeCompare(b.n, "ro"));
  const norme = new Map(fat.norme.map((x) => [x.s, x.c] as const));
  const peDomeniu = new Map(fat.domenii.map((x) => [x.s, x.c] as const));
  const domenii = DOMENII.map((d) => ({ s: d.slug, n: d.nume, c: peDomeniu.get(d.slug) ?? 0 }));
  const contracte = new Map(fat.contracte.map((x) => [x.s, x.c] as const));
  const locuri = new Map(fat.locuri.map((x) => [x.s, x.c] as const));
  const activ = [meserie, orasSlug, extra.norma, extra.domeniu, extra.contract, extra.loc, extra.experienta].filter(Boolean).length;
  // Cuvintele corectate din catalog, spuse pe față: „barmn” caută și „barman”. Rădăcinile nu se arată.
  const corectii = extra.q ? [...new Set(cuvinteCautate(extra.q).flatMap((w) => variante(w).filter((x) => !w.startsWith(x) && !x.startsWith(w))))] : [];
  const cuFiltre = Boolean(extra.norma || extra.domeniu || extra.q || extra.contract || extra.loc || extra.experienta);

  // Filtrele alese, ca etichete deasupra listei: un clic pe una o scoate.
  const eticheta = (href: string, text: string) => `<a href="${href}" class="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-stone-900 px-3 text-sm font-medium text-white hover:bg-stone-700">${esc(text)}<span aria-hidden="true" class="text-stone-300">✕</span><span class="sr-only"> (scoate filtrul)</span></a>`;
  const etichete = [
    extra.q ? eticheta(q(1, { ...extra, q: undefined }), `„${extra.q}”`) : "",
    extra.domeniu ? eticheta(q(1, { ...extra, domeniu: undefined }), numeDomeniu(extra.domeniu)) : "",
    meserie ? eticheta(urlLista(orasSlug, null) + interogare(extra), NUME_MESERIE.get(meserie)!) : "",
    orasSlug ? eticheta(urlLista(null, meserie) + interogare(extra), numeLoc!) : "",
    extra.norma ? eticheta(q(1, { ...extra, norma: undefined }), NORME[extra.norma]) : "",
    extra.experienta ? eticheta(q(1, { ...extra, experienta: undefined }), "Fără experiență") : "",
    extra.contract ? eticheta(q(1, { ...extra, contract: undefined }), CONTRACTE[extra.contract]) : "",
    extra.loc ? eticheta(q(1, { ...extra, loc: undefined }), LOCURI_MUNCA[extra.loc]) : "",
  ].join("");
  const qa = new URLSearchParams();
  if (meserie) qa.set("meserie", meserie);
  if (orasSlug) qa.set("oras", orasSlug);
  if (extra.norma) qa.set("norma", extra.norma);
  if (extra.domeniu) qa.set("domeniu", extra.domeniu);
  if (extra.q) qa.set("q", extra.q);
  if (extra.contract) qa.set("contract", extra.contract);
  if (extra.loc) qa.set("loc", extra.loc);
  if (extra.experienta) qa.set("experienta", extra.experienta);
  const ordine = sortare(extra, q, anunturi.length > 1 ? `/api/anunturi/lista?${qa}` : null);
  const { cautare, panou, script } = filtre({ meserii, meserie, orase, orasSlug, domenii, extra, norme, contracte, locuri, faraExperienta: fat.faraExperienta });
  const gol = `<div class="mt-3 ${CARD}"><p class="text-base text-stone-800">${cuFiltre ? "Niciun anunț nu se potrivește căutării." : unde ? "Nu sunt încă anunțuri pentru căutarea asta." : "Nu sunt încă anunțuri publicate."}</p>
      ${cuFiltre ? `<p class="mt-2 text-sm"><a class="font-semibold underline underline-offset-2" href="${cale}">Arată toate anunțurile${unde ? ` ${esc(unde)}` : ""}</a></p>` : `<p class="mt-2 text-sm text-stone-600">Angajezi? Anunțul tău apare aici în câteva minute, gratuit și fără cont.</p>`}</div>`;

  // Celelalte liste, legate de sub anunțuri (7 octombrie 2026): până atunci o listă trimitea numai
  // spre primele 6 meserii și localități din coloană, iar restul se ajungeau doar prin căutarea cu
  // sugestii, pe care Google n-o urmează („Google nu cunoaște adresa URL” la /locuri-de-munca/barman).
  // Numai listele care intră în Google (PRAG_INDEX), cu numerele deja calculate pentru filtre: pe
  // lista unei meserii, localitățile sunt cele cu meseria aceea; pe lista unui oraș, meseriile lui.
  const legaturi = (titluBloc: string, toate: string, v: { href: string; n: string; c: number }[]) => {
    if (!v.length) return "";
    const a = (o: { href: string; n: string }) => `<li><a class="flex min-h-9 items-center text-sm text-stone-700 underline-offset-2 hover:text-stone-900 hover:underline" href="${o.href}">${esc(o.n)}</a></li>`;
    const GRILA = "grid grid-cols-2 gap-x-4 sm:grid-cols-3 lg:grid-cols-4";
    const dupaNumar = [...v].sort((x, y) => y.c - x.c || x.n.localeCompare(y.n, "ro"));
    const restul = dupaNumar.slice(18).sort((x, y) => x.n.localeCompare(y.n, "ro"));
    return `<section class="mt-6"><h2 class="text-base font-bold text-stone-900">${esc(titluBloc)}</h2>
        <ul class="mt-2 ${GRILA}">${dupaNumar.slice(0, 18).map(a).join("")}</ul>
        ${restul.length ? `<details class="mt-1"><summary class="flex min-h-9 cursor-pointer items-center gap-1.5 text-sm font-semibold text-stone-900">${toate}${SVG("size-4 shrink-0", D_JOS)}</summary><ul class="mt-1 ${GRILA}">${restul.map(a).join("")}</ul></details>` : ""}
      </section>`;
  };
  const alteListe = cuFiltre ? "" : [
    legaturi(`Locuri de muncă ${numeM ? `${numeM} ` : ""}pe orașe`, "Toate localitățile",
      orase.filter((o) => o.c >= PRAG_INDEX && o.s !== orasSlug).map((o) => ({ href: urlLista(o.s, meserie), n: o.n, c: o.c }))),
    legaturi(`Locuri de muncă ${numeLoc ? `în ${numeLoc}, ` : ""}pe meserii`, "Toate meseriile",
      meserii.filter((m) => m.p && m.c >= PRAG_INDEX && m.s !== (meserie ? grupMeserie(meserie) : null)).map((m) => ({ href: urlLista(orasSlug, m.s), n: m.n, c: m.c }))),
  ].join("");

  const breadcrumb = (orasSlug || meserie) ? `<nav class="mb-4 flex flex-wrap gap-2 text-xs text-stone-600" aria-label="Breadcrumb"><a class="underline underline-offset-2" href="/locuri-de-munca">Locuri de muncă</a>${orasSlug && meserie ? `<span>/</span><a class="underline underline-offset-2" href="${urlLista(orasSlug, null)}">${esc(numeLoc!)}</a>` : ""}</nav>` : "";
  // Schița B: pe telefon, câmpul comun, apoi „Filtre” și ordinea, una lângă alta, apoi filtrele alese;
  // pe PC, coloana din stânga și, deasupra listei, filtrele alese (sau „Toate meseriile, toată țara”) și ordinea.
  const continut = `${breadcrumb}
    <h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-stone-900 sm:text-[34px]">${esc(titlu.charAt(0).toUpperCase() + titlu.slice(1))}</h1>
    <p class="mt-3 max-w-prose text-base text-stone-600">Fiecare anunț are salariul lunar, cu brutul sau netul spus clar. Aplici direct la angajator, fără cont.${alteNume ? ` Cuprinde și anunțurile de ${esc(alteNume)}.` : ""}</p>
    <div class="mt-5 grid gap-2 lg:hidden" data-doar-cu-script hidden>
      ${cautare}
      <div class="grid grid-cols-2 gap-2">
        <button type="button" data-filtre-comuta aria-controls="panou-filtre" aria-expanded="false" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-surface px-3 text-base font-semibold text-stone-900">${SVG("size-4 shrink-0", D_FILTRE)}Filtre${activ ? `<span class="inline-grid min-w-5 place-items-center rounded-full bg-marcaj px-1.5 text-xs font-bold text-stone-900">${activ}</span>` : ""}</button>
        ${ordine}
      </div>
      ${etichete ? `<div class="flex flex-wrap gap-2">${etichete}</div>` : ""}
    </div>
    <div class="mt-4 grid grid-cols-1 gap-6 lg:mt-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
      ${panou}
      <div class="min-w-0">
        <div class="hidden items-center gap-3 lg:flex">
          <div class="min-w-0 flex-1">${cautare}</div>
          <div class="w-60 shrink-0">${ordine}</div>
        </div>
        <div class="mt-3 hidden flex-wrap gap-2 lg:flex">${etichete || `<p class="text-sm text-stone-600">Toate meseriile, toată țara</p>`}</div>
        ${corectii.length ? `<p class="mt-2 text-sm text-stone-600">Am căutat și: ${corectii.map((c) => `„${esc(cuvantAfisat(c))}”`).join(", ")}</p>` : ""}
        <p data-apropiere-stare class="mt-2 text-sm text-stone-600 empty:hidden"></p>
        ${anunturi.length ? `<ul class="mt-3 grid grid-cols-1 gap-3" data-lista-anunturi>${anunturi.map(cardLista).join("")}</ul>` : gol}
        ${pagini > 1 ? `<nav aria-label="Pagini" class="mt-6 flex gap-4 text-sm">${pagina > 1 ? `<a class="underline underline-offset-2" href="${q(pagina - 1)}">Pagina anterioară</a>` : ""}<span class="text-stone-600">Pagina ${pagina} din ${pagini}</span>${pagina < pagini ? `<a class="underline underline-offset-2" href="${q(pagina + 1)}">Pagina următoare</a>` : ""}</nav>` : ""}
      </div>
    </div>
    ${alteListe ? `<div class="mt-10 border-t border-stone-200 pt-2">${alteListe}</div>` : ""}
    ${script}
    ${SCRIPT_ORDINE}`;

  return inSablon(req, env, {
    titlu, descriere: `${titlu}. Anunțuri de angajare din România, fiecare cu salariul lunar și baza lui, brut sau net. Aplici direct la angajator.`.slice(0, 158),
    canonic: `${SITE}${cale}${interogare({}, pagina)}`,
    // Filtrele din interogare nu fac pagini noi pentru Google: sunt variații ale aceleiași liste.
    indexabil: total >= PRAG_INDEX && pagina === 1 && !cuFiltre && !extra.ordine,
    continut,
    jsonLd: orasSlug || meserie ? [firImplicit([
      ["Locuri de muncă", "/locuri-de-munca"],
      ...(orasSlug && meserie ? [[numeLoc!, urlLista(orasSlug, null)] as [string, string]] : []),
      [titlu.charAt(0).toUpperCase() + titlu.slice(1), null],
    ])] : undefined,
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
        <p class="mt-2 text-sm"><a class="underline underline-offset-2" href="${listaMeserie}">Vezi anunțurile ${meserie ? `pentru ${esc(meserie.toLowerCase())} ` : ""}din ${esc(oras(a))}</a></p></div>` });
  }

  // Contactul: un buton care sună, cu numărul scris pe el, și unul de WhatsApp la mobil (proprietar,
  // 28 septembrie 2026). Fără CV prin site, fără chat, fără email.
  const tel = a.telefon ?? "";
  const contact = tel ? `
    <a href="${linkApel(tel)}" class="flex min-h-12 items-center justify-center gap-2 rounded-md bg-stone-900 px-4 text-lg font-semibold text-white hover:bg-stone-700" data-contact="apel">Sună: ${telefonAfisat(tel)}</a>
    ${esteMobil(tel) ? `<a href="${esc(linkWhatsApp(tel, a.titlu))}" rel="noopener" target="_blank" class="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-md border border-stone-300 bg-surface px-4 text-lg font-semibold text-stone-900 hover:border-stone-500" data-contact="whatsapp">Scrie pe WhatsApp</a>` : ""}` : "";
  // Locul: adresa, harta OpenStreetMap (fără cookies Google pe pagină) și linkuri spre Google Maps.
  const adresaText = [a.adresa, loc(a)].filter(Boolean).join(", ");
  const dest = a.adresa ? `${a.adresa}, ${oras(a)}` : oras(a);
  let harta = "";
  if (a.lat != null && a.lon != null) {
    const dx = a.loc_precizie === "adresa" ? 0.008 : 0.05, dy = dx * 0.6;
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${a.lon - dx},${a.lat - dy},${a.lon + dx},${a.lat + dy}&layer=mapnik${a.loc_precizie === "adresa" ? `&marker=${a.lat},${a.lon}` : ""}`;
    harta = `<iframe src="${esc(src)}" title="Harta: ${esc(adresaText)}" loading="lazy" class="mt-3 h-56 w-full rounded-md border border-stone-200" referrerpolicy="no-referrer"></iframe>`;
  }
  const locatie = `
        <div class="${CARD}">
          <h2 class="text-base font-bold text-stone-900">Unde e locul de muncă</h2>
          <p class="mt-2 text-base text-stone-800">${esc(adresaText)}</p>
          ${a.loc_precizie !== "adresa" ? `<p class="mt-1 text-xs text-stone-600">Anunțul nu are adresa exactă; harta arată localitatea.</p>` : ""}
          ${harta}
          <p class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <a class="underline underline-offset-2" rel="noopener" target="_blank" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(dest)}">Deschide în Google Maps</a>
            <a class="underline underline-offset-2" rel="noopener" target="_blank" href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(dest)}">Vezi drumul până acolo</a>
          </p>
        </div>`;
  const continut = `
    <nav class="mb-4 flex flex-wrap gap-2 text-xs text-stone-600" aria-label="Breadcrumb"><a class="underline underline-offset-2" href="/locuri-de-munca">Locuri de muncă</a><span>/</span><a class="underline underline-offset-2" href="${urlLista(a.oras_slug, null)}">${esc(oras(a))}</a>${a.meserie ? `<span>/</span><a class="underline underline-offset-2" href="${listaMeserie}">${esc(meserie!)}</a>` : ""}</nav>
    <p class="text-xs font-medium uppercase tracking-wide text-stone-600">Anunț angajare</p>
    <h1 class="mt-1 text-[28px] font-bold leading-tight tracking-[-0.02em] text-stone-900 sm:text-[34px]">${esc(a.titlu)}</h1>
    <p class="mt-2 text-base text-stone-600">${a.angajator ? `${esc(a.angajator)} · ` : ""}${esc(loc(a))}</p>
    <div class="mt-5 grid items-start gap-4 lg:grid-cols-[1fr_320px]">
      <div class="${CARD}">
        <p class="text-xs font-medium text-stone-700">Salariul oferit</p>
        <p class="mt-2 text-3xl font-bold tracking-tight text-stone-900">${suma(a)}</p>
        <p class="mt-1 text-sm text-stone-600">Pe lună · ${[norma(a), ...detalii(a)].join(" · ")}</p>
        <div class="mt-5 text-base text-stone-800">${descriereHtml(a.descriere)}</div>
        <p class="mt-4 text-xs text-stone-600">Publicat pe ${data(a.confirmat_la!)} · valabil până pe ${data(a.expira_la!)}</p>
      </div>
      <div class="flex flex-col gap-4">
        <div class="${CARD}">
          <h2 class="text-base font-bold text-stone-900">Aplică direct la angajator</h2>
          <div class="mt-3">${contact}</div>
          <p class="mt-3 text-xs text-stone-600">Nu plăti niciodată ca să fii angajat. Legea interzice taxele cerute candidaților.</p>
        </div>
        ${locatie}
        <div class="${CARD}">
          <h2 class="text-base font-bold text-stone-900">Știi pe cineva potrivit?</h2>
          <p class="mt-1 text-sm text-stone-600">Trimite-i anunțul: vede salariul și sună direct.</p>
          <p class="mt-3 flex flex-wrap gap-2 text-sm">
            <a class="${BUTON_MIC}" rel="noopener" target="_blank" href="${esc(linkDistribuieWhatsApp(canonic, a.titlu, suma(a)))}" data-distribuie="whatsapp">WhatsApp</a>
            <a class="${BUTON_MIC}" rel="noopener" target="_blank" href="${esc(linkDistribuieFacebook(canonic))}" data-distribuie="facebook">Facebook</a>
            <button type="button" class="${BUTON_MIC}" data-copiaza="${canonic}">Copiază linkul</button>
          </p>
          <script>
          // Candidatul care sună sau scrie pe WhatsApp (proprietar, 30 septembrie 2026): evenimentul GA4
          // „contact_anunt”, element = apel/whatsapp. Numărul de telefon nu pleacă nicăieri; ID-ul din
          // link_url spune dacă anunțul e din importul ANOFM (4–790) sau pus de un angajator.
          document.addEventListener("click", function (e) {
            var c = e.target.closest && e.target.closest("[data-contact]");
            if (!c || !window.gtag) return;
            try { window.gtag("event", "contact_anunt", { element: c.getAttribute("data-contact"), link_url: location.pathname, zona: "anunturi", transport_type: "beacon" }); } catch (x) {}
          });
          document.addEventListener("click", function (e) {
            var b = e.target.closest && e.target.closest("[data-copiaza]");
            if (!b || !navigator.clipboard) return;
            navigator.clipboard.writeText(b.getAttribute("data-copiaza")).then(function () { b.textContent = "Linkul e copiat"; });
          });
          </script>
        </div>
        <div class="${CARD}">
          <p class="text-sm text-stone-700">Țeapă, discriminare, salariu fals? <a class="font-semibold underline underline-offset-2" href="/locuri-de-munca/raporteaza#${a.id}">Raportează anunțul</a>. Verificăm fiecare raportare în cel mult 3 zile.</p>
        </div>
      </div>
    </div>`;

  // JobPosting pentru Google Jobs: numai câmpurile pe care anunțul le are de fapt. Google cere
  // firma (hiringOrganization); pentru anunțul fără numele ei, care e opțional, documentația Google
  // cere valoarea „confidential” (angajare anonimă), cum face și OLX. Până pe 7 octombrie 2026
  // anunțurile fără firmă n-aveau JobPosting deloc, deci nu intrau în Google Jobs.
  const jsonLd = {
    "@context": "https://schema.org", "@type": "JobPosting",
    title: a.titlu, description: descriereHtml(a.descriere), datePosted: a.confirmat_la, validThrough: a.expira_la,
    employmentType: a.contract === "determinata" || a.contract === "sezonier" ? [a.norma === "partiala" ? "PART_TIME" : "FULL_TIME", "TEMPORARY"] : a.norma === "partiala" ? "PART_TIME" : "FULL_TIME",
    // Google: „no requirements” când nu se cere experiență; munca de acasă cere și țara candidaților.
    ...(a.fara_experienta ? { experienceRequirements: "no requirements" } : {}),
    ...(a.loc_munca === "acasa" ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "RO" } } : {}),
    hiringOrganization: { "@type": "Organization", name: a.angajator || "confidential" },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", ...(a.adresa ? { streetAddress: a.adresa } : {}), addressLocality: oras(a), addressRegion: JUDETE[a.judet], addressCountry: "RO" } },
    baseSalary: { "@type": "MonetaryAmount", currency: "RON", value: { "@type": "QuantitativeValue", unitText: "MONTH", ...(a.salariu_max ? { minValue: a.salariu_min, maxValue: a.salariu_max } : { value: a.salariu_min }) } },
    directApply: false,
  };
  // Titlul începe cu „Anunț angajare”, ca paginile din top 3 la „anunt de angajare”.
  const titlu = `Anunț angajare ${a.titlu}, ${oras(a)} — ${suma(a)}`;
  const desc = `Anunț angajare ${a.titlu}, ${oras(a)}: ${suma(a)} pe lună, ${norma(a).toLowerCase()}.${a.angajator ? ` ${a.angajator}.` : ""} Aplici direct la angajator.`;
  const fir = firImplicit([
    ["Locuri de muncă", "/locuri-de-munca"], [oras(a), urlLista(a.oras_slug, null)],
    ...(a.meserie ? [[meserie!, listaMeserie] as [string, string]] : []), [a.titlu, null],
  ]);
  return inSablon(req, env, { titlu, descriere: desc.slice(0, 158), canonic, indexabil: true, continut, jsonLd: [jsonLd, fir] });
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

/**
 * Anunțurile scoase în ultima săptămână, cu data scoaterii ca lastmod. Google are un sitemap pe care
 * îl reverifică și află în zile, nu în săptămâni, că anunțul dă 410; Google Jobs cere ca joburile
 * închise să dispară repede. Anunțurile nu rămân publicate: pagina lor e tot 410.
 */
export async function sitemapScoase(env: Env): Promise<Response> {
  const urls = (await scoaseRecent(env, 7)).map((a) => `<url><loc>${SITE}${urlAnunt(a)}</loc><lastmod>${a.la.slice(0, 10)}</lastmod></url>`);
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`,
    { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
