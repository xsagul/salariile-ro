// Paginile de anunțuri, puse în șablonul static /locuri-de-munca/sablon (header, footer, CSS).
// Adresele (verificate în Google România, 28 septembrie 2026) sunt deținute de src/lib/anunturi/reguli.ts.
import type { Env } from "./index";
import catalog from "../src/data/meserii-catalog.json";
import { JUDETE, NORME, URL_ADAUGA, esteMobil, linkApel, linkWhatsApp, telefonAfisat, urlAnunt, urlLista } from "../src/lib/anunturi/reguli";
import { completeazaSablon } from "../src/lib/anunturi/sablon";
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
  const html = completeazaSablon(await sablon.text(), {
    titlu: `${p.titlu} | Salariile`, titluScurt: p.titlu, descriere: p.descriere, canonic: p.canonic,
    robots: p.indexabil ? "index, follow" : "noindex, follow",
  });
  let r = new HTMLRewriter()
    .on("[data-anunturi-continut]", { element(e) { e.setInnerContent(p.continut, { html: true }); } });
  if (p.jsonLd) r = r.on("head", { element(e) { e.append(`<script type="application/ld+json">${JSON.stringify(p.jsonLd).replace(/</g, "\\u003c")}</script>`, { html: true }); } });
  // Fără headerele șablonului: content-length și etag erau ale lui, nu ale paginii.
  const out = r.transform(new Response(html));
  const h = new Headers(out.headers);
  h.set("content-type", "text/html; charset=utf-8");
  h.set("cache-control", "public, max-age=60, s-maxage=60");
  return new Response(out.body, { status: p.status ?? 200, headers: h });
}

/** Cardul din liste; îl folosește și /api/anunturi/lista la „sortează după apropiere”. */
export function cardLista(a: Anunt): string {
  const meserie = a.meserie ? NUME_MESERIE.get(a.meserie) : null;
  return `<li><a href="${urlAnunt(a)}" class="block ${CARD} hover:border-stone-400" data-anunt="${a.id}">
    <span class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span class="text-base font-semibold text-stone-900">${esc(a.titlu)}</span>
      <span class="whitespace-nowrap font-semibold text-stone-900">${suma(a)}</span>
    </span>
    <span class="mt-1 block text-sm text-stone-600">${a.angajator ? `${esc(a.angajator)} · ` : ""}${esc(loc(a))} · ${norma(a)}${meserie ? ` · ${esc(meserie)}` : ""}</span>
    <span class="mt-1 block text-xs text-stone-600">Publicat pe ${data(a.confirmat_la!)}<span data-distanta class="font-semibold text-stone-900"></span></span>
  </a></li>`;
}

/** /locuri-de-munca?meserie=barman&oras=bucuresti (formularul de filtre) → /locuri-de-munca/bucuresti/barman. */
export function redirectFiltre(req: Request): Response | null {
  const u = new URL(req.url);
  if (!u.searchParams.has("meserie") && !u.searchParams.has("oras")) return null;
  const m = u.searchParams.get("meserie") ?? "", o = (u.searchParams.get("oras") ?? "").replace(/[^a-z0-9-]/g, "");
  return Response.redirect(new URL(urlLista(o || null, esteMeserie(m) ? m : null), req.url).toString(), 302);
}

/**
 * „Sortează după apropiere” (proprietar, 28 septembrie 2026, ca pe OLX și anuntul.ro). Browserul
 * cere poziția, ia toate anunțurile listei de la /api/anunturi/lista și le ordonează singur după
 * distanță. Poziția nu pleacă din telefon: nici în URL, nici în cerere.
 */
function butonApropiere(meserie: string | null, oras: string | null): string {
  const q = new URLSearchParams();
  if (meserie) q.set("meserie", meserie);
  if (oras) q.set("oras", oras);
  return `<div class="mt-6 flex flex-wrap items-center gap-3">
    <button type="button" data-apropiere="/api/anunturi/lista?${q}" class="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-surface px-4 font-semibold text-stone-900 hover:border-stone-500">Sortează după apropiere</button>
    <span data-apropiere-stare class="text-sm text-stone-600"></span>
  </div>
  <script>
  (function () {
    // Scriptul stă înaintea listei: elementele se caută la apăsare, nu acum.
    if (!navigator.geolocation) { document.querySelectorAll("[data-apropiere]").forEach(function (x) { x.hidden = true; }); return; }
    function km(a, b2, c, d) { var r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b2) * r / 2); return 12742 * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y)); }
    document.addEventListener("click", function (ev) {
      var b = ev.target.closest && ev.target.closest("[data-apropiere]"), stare = document.querySelector("[data-apropiere-stare]"), ul = document.querySelector("[data-lista-anunturi]");
      if (!b || !stare || !ul) return;
      stare.textContent = "Caut unde ești…";
      navigator.geolocation.getCurrentPosition(function (p) {
        var la = p.coords.latitude, lo = p.coords.longitude;
        fetch(b.getAttribute("data-apropiere")).then(function (r) { return r.json(); }).then(function (lista) {
          // Fără adresă, coordonatele sunt centrul localității: pe lista unui oraș nu spun cât e de
          // aproape, deci anunțul trece la coadă; pe lista națională, orașul tot contează.
          var peOras = /[?&]oras=/.test(b.getAttribute("data-apropiere"));
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
        }).catch(function () { stare.textContent = "Nu am putut încărca anunțurile. Încearcă din nou."; });
      }, function () { stare.textContent = "Fără acces la locație, anunțurile rămân în ordinea publicării."; }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    });
  })();
  </script>`;
}

type OptiuneFiltru = { s: string; n: string; c: number };

/**
 * Filtrele listei: scrii „b” și apar București, Bacău (proprietar, 29 septembrie 2026, ca pe OLX),
 * fără să derulezi toată lista. Pagina vine cu două <select>, care merg și fără JavaScript; scriptul
 * le înlocuiește cu câmpuri de căutare, iar alegerea deschide imediat lista filtrată. Potrivirea e
 * cea din `cauta` (src/lib/anunturi/localitati.ts): întâi începutul, apoi începutul unui cuvânt,
 * apoi, de la 3 litere, oriunde. Localitățile sunt numai cele cu anunțuri: altfel alegerea ar duce
 * la o pagină 404.
 */
function filtre(meserii: OptiuneFiltru[], meserie: string | null, orase: OptiuneFiltru[], orasSlug: string | null): string {
  const optiuni = (valori: OptiuneFiltru[], ales: string | null) => valori.map((o) => `<option value="${o.s}" data-n="${o.c}"${o.s === ales ? " selected" : ""}>${esc(o.n)}</option>`).join("");
  const SELECT = "mt-1 block w-full rounded-md border border-stone-300 bg-surface px-3 py-2 text-base";
  return `<form method="get" action="/locuri-de-munca" class="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" data-filtre>
      <label class="text-sm text-stone-700">Meseria
        <select name="meserie" class="${SELECT}" data-cauta="Scrie: barman, șofer, vânzător…"><option value="">Toate meseriile</option>${optiuni(meserii, meserie)}</select>
      </label>
      <label class="text-sm text-stone-700">Localitatea
        <select name="oras" class="${SELECT}" data-cauta="Scrie: București, Cluj…"><option value="">Toată țara</option>${optiuni(orase, orasSlug)}</select>
      </label>
      <button type="submit" class="min-h-11 self-end rounded-md border border-stone-300 bg-surface px-4 font-semibold text-stone-900 hover:border-stone-500">Caută</button>
    </form>
    <script>
    (function () {
      var form = document.querySelector("[data-filtre]");
      if (!form) return;
      var nr = 0;
      function fara(s) { return s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase(); }
      function cate(n) { return n === 0 ? "niciun anunț încă" : n === 1 ? "1 anunț" : n.toLocaleString("ro-RO") + (n % 100 >= 20 || n % 100 === 0 ? " de anunțuri" : " anunțuri"); }
      form.querySelectorAll("select[data-cauta]").forEach(function (sel) {
        var id = "filtru-" + (++nr), toate = [], ales = sel.value, activ = 0, gasite = [];
        Array.prototype.forEach.call(sel.options, function (o) { if (o.value) toate.push({ v: o.value, t: o.text, n: Number(o.dataset.n) || 0, f: fara(o.text) }); });
        function nume(v) { for (var i = 0; i < toate.length; i++) if (toate[i].v === v) return toate[i].t; return ""; }
        var tot = sel.options[0].text;

        var cutie = document.createElement("div"); cutie.className = "relative mt-1";
        var inp = document.createElement("input");
        inp.type = "text"; inp.id = id; inp.autocomplete = "off"; inp.spellcheck = false;
        inp.setAttribute("role", "combobox"); inp.setAttribute("aria-autocomplete", "list"); inp.setAttribute("aria-expanded", "false"); inp.setAttribute("aria-controls", id + "-l");
        inp.placeholder = sel.dataset.cauta; inp.value = nume(ales);
        inp.className = "block w-full rounded-md border border-stone-300 bg-surface py-2 pl-3 pr-11 text-base text-stone-900 focus:border-stone-600 focus:outline-none";
        var sterge = document.createElement("button");
        sterge.type = "button"; sterge.textContent = "×"; sterge.setAttribute("aria-label", tot);
        sterge.className = "absolute right-0 top-0 flex h-full w-11 items-center justify-center text-2xl leading-none text-stone-500 hover:text-stone-900";
        sterge.hidden = !ales;
        var ul = document.createElement("ul");
        ul.id = id + "-l"; ul.setAttribute("role", "listbox"); ul.hidden = true;
        ul.className = "absolute left-0 right-0 z-20 mt-1 max-h-80 overflow-auto rounded-md border border-stone-300 bg-surface py-1 shadow-lg";
        var ascuns = document.createElement("input"); ascuns.type = "hidden"; ascuns.name = sel.name; ascuns.value = ales;
        cutie.append(inp, sterge, ul);
        sel.replaceWith(cutie, ascuns);

        function cauta(text) {
          var q = fara(text).replace(/\\s+/g, " ").trim();
          // Câmpul gol sau cu alegerea de acum: arată ce are anunțuri, cele mai multe primele.
          if (!q || text === nume(ales)) return toate.filter(function (o) { return o.n > 0; }).sort(function (a, b) { return b.n - a.n || a.t.localeCompare(b.t, "ro"); }).slice(0, 8);
          var r = [];
          toate.forEach(function (o) {
            var s = o.f.startsWith(q) ? 0 : o.f.indexOf(" " + q) >= 0 || o.f.indexOf("-" + q) >= 0 ? 1 : q.length >= 3 && o.f.indexOf(q) >= 0 ? 2 : -1;
            if (s >= 0) r.push([o, s]);
          });
          return r.sort(function (a, b) { return a[1] - b[1] || (b[0].n > 0) - (a[0].n > 0) || a[0].t.localeCompare(b[0].t, "ro"); }).slice(0, 8).map(function (x) { return x[0]; });
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
            var b = document.createElement("span"); b.className = "text-xs text-stone-600"; b.textContent = cate(o.n);
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
        // Alegerea deschide lista imediat, ca pe OLX: fără încă un clic pe „Caută”.
        function alege(v) { ales = v; ascuns.value = v; inp.value = nume(v); sterge.hidden = !v; inchide(); form.submit(); }

        inp.addEventListener("focus", function () { inp.select(); arata(); });
        inp.addEventListener("input", arata);
        inp.addEventListener("blur", function () {
          inchide();
          // Ce s-a scris fără alegere nu devine filtru: câmpul revine la alegerea de acum. Golit
          // înseamnă „toate”, aplicat la „Caută”.
          if (!inp.value.trim()) { ascuns.value = ""; sterge.hidden = true; } else inp.value = nume(ascuns.value);
        });
        inp.addEventListener("keydown", function (e) {
          if (e.key === "ArrowDown" && gasite.length) { e.preventDefault(); if (ul.hidden) arata(); else { activ = (activ + 1) % gasite.length; marcheaza(); } }
          else if (e.key === "ArrowUp" && gasite.length) { e.preventDefault(); activ = (activ - 1 + gasite.length) % gasite.length; marcheaza(); }
          else if (e.key === "Enter") { e.preventDefault(); if (!inp.value.trim()) alege(""); else if (!ul.hidden && gasite[activ]) alege(gasite[activ].v); }
          else if (e.key === "Escape") inchide();
        });
        sterge.addEventListener("click", function () { alege(""); });
      });
    })();
    </script>`;
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
  // Numărul de sub fiecare opțiune ține cont de celălalt filtru (proprietar, 29 septembrie 2026): cu
  // „Barman” ales, București arată câți barmani caută, nu toate anunțurile din oraș.
  const [ro, rm] = await env.DB.batch([
    env.DB.prepare("SELECT oras_slug AS s, MIN(oras) AS n, SUM(CASE WHEN ?1 IS NULL OR meserie = ?1 THEN 1 ELSE 0 END) AS c FROM anunturi WHERE stare = 'activ' GROUP BY oras_slug ORDER BY n").bind(meserie),
    env.DB.prepare("SELECT meserie AS s, COUNT(*) AS c FROM anunturi WHERE stare = 'activ' AND meserie IS NOT NULL AND (?1 IS NULL OR oras_slug = ?1) GROUP BY meserie").bind(orasSlug),
  ]);
  const orase = (ro.results as OptiuneFiltru[]).map((o) => ({ ...o, n: o.n.replace(/,.*$/, "") }));
  const cateM = new Map((rm.results as { s: string; c: number }[]).map((m) => [m.s, m.c]));
  const meserii = [...NUME_MESERIE].sort((a, b) => a[1].localeCompare(b[1], "ro")).map(([s, n]) => ({ s, n, c: cateM.get(s) ?? 0 }));

  const breadcrumb = (orasSlug || meserie) ? `<nav class="mb-4 flex flex-wrap gap-2 text-xs text-stone-600" aria-label="Breadcrumb"><a class="underline underline-offset-2" href="/locuri-de-munca">Locuri de muncă</a>${orasSlug && meserie ? `<span>/</span><a class="underline underline-offset-2" href="${urlLista(orasSlug, null)}">${esc(numeLoc!)}</a>` : ""}</nav>` : "";
  const continut = `${breadcrumb}
    <h1 class="text-[28px] font-bold leading-tight tracking-[-0.02em] text-stone-900 sm:text-[34px]">${esc(titlu.charAt(0).toUpperCase() + titlu.slice(1))}</h1>
    <p class="mt-3 max-w-prose text-base text-stone-600">Fiecare anunț are salariul lunar, cu brutul sau netul spus clar. Aplici direct la angajator, fără cont.${meserie ? ` <a class="underline underline-offset-2" href="/salarii/${meserie}">Cât câștigă un ${esc(numeM)}</a>.` : ""}</p>
    <div class="mt-5"><a href="${URL_ADAUGA}" class="inline-flex min-h-11 items-center rounded-md bg-stone-900 px-4 font-semibold text-white hover:bg-stone-700">Adaugă un anunț gratuit</a></div>
    ${filtre(meserii, meserie, orase, orasSlug)}
    ${anunturi.length > 1 ? butonApropiere(meserie, orasSlug) : ""}
    ${anunturi.length ? `<ul class="mt-4 grid gap-3" data-lista-anunturi>${anunturi.map(cardLista).join("")}</ul>` : `
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
          <div class="mt-3">${contact}</div>
          <p class="mt-3 text-xs text-stone-600">Nu plăti niciodată ca să fii angajat. Legea interzice taxele cerute candidaților.</p>
        </div>
        ${locatie}
        <div class="${CARD}">
          <p class="text-sm text-stone-700">Țeapă, discriminare, salariu fals? <a class="font-semibold underline underline-offset-2" href="/locuri-de-munca/raporteaza#${a.id}">Raportează anunțul</a>. La trei raportări, se suspendă până îl verificăm.</p>
        </div>
      </div>
    </div>`;

  // JobPosting pentru Google Jobs: numai câmpurile pe care anunțul le are de fapt. Google cere
  // firma (hiringOrganization); fără numele ei, care e opțional, anunțul rămâne doar în căutarea obișnuită.
  const jsonLd = a.angajator ? {
    "@context": "https://schema.org", "@type": "JobPosting",
    title: a.titlu, description: descriereHtml(a.descriere), datePosted: a.confirmat_la, validThrough: a.expira_la,
    employmentType: a.norma === "partiala" ? "PART_TIME" : "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: a.angajator },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", ...(a.adresa ? { streetAddress: a.adresa } : {}), addressLocality: oras(a), addressRegion: JUDETE[a.judet], addressCountry: "RO" } },
    baseSalary: { "@type": "MonetaryAmount", currency: "RON", value: { "@type": "QuantitativeValue", unitText: "MONTH", ...(a.salariu_max ? { minValue: a.salariu_min, maxValue: a.salariu_max } : { value: a.salariu_min }) } },
    directApply: false,
  } : undefined;
  // Titlul începe cu „Anunț angajare”, ca paginile din top 3 la „anunt de angajare”.
  const titlu = `Anunț angajare ${a.titlu}, ${oras(a)} — ${suma(a)}`;
  const desc = `Anunț angajare ${a.titlu}, ${oras(a)}: ${suma(a)} pe lună, ${norma(a).toLowerCase()}.${a.angajator ? ` ${a.angajator}.` : ""} Aplici direct la angajator.`;
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
