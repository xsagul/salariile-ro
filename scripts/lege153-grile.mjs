#!/usr/bin/env node
// scripts/lege153-grile.mjs
//
// Extrage grilele de salarii din anexele Legii-cadru nr. 153/2017, forma
// consolidata de pe legislatie.just.ro.
//
// DE CE. Pana acum, cifra pe meserie venea exclusiv din statistica: media unui
// sector CAEN, ajustata cu raportul grupei ocupationale (`ocupatii-caen.ts`).
// Aia e o ESTIMARE — buna, dar tot o estimare, si identica pentru toate
// ocupatiile din aceeasi grupa. Pentru sectorul bugetar exista insa altceva,
// mult mai bun: SUMA EXACTA IN LEI, scrisa in lege, pe fiecare functie.
// Un medic primar din unitati clinice nu „castiga in jur de", ci are salariul
// de baza 14.125 lei la gradatia 0, pentru ca asa scrie in Anexa II.
//
// Acopera medic, asistent medical, judecator, procuror, politist, militar,
// pompier, bibliotecar, muzeograf, preot si functionar public — meserii pe care
// statistica le ineaca in „Specialisti" sau „Administratie publica".
//
// CE COLOANA E IN PLATA. Anexele au grile succesive. Cea in vigoare azi e
// coloana „iunie 2024", prin lantul de mentinere verificat in textul
// consolidat: in 2025 salariile se mentin la nivelul lunii decembrie 2024, iar
// in 2026 la nivelul lunii decembrie 2025. Acelasi rationament ca la grila de
// invatamant din `src/lib/invatamant.ts`.
//
// CAPCANA, si de ce scriptul nu e un simplu grep de tabele. Documentul contine
// SI versiunile vechi ale fiecarui tabel, ca text istoric. Pentru medic primar
// in unitati clinice sunt trei variante in aceeasi pagina: 12.500 (forma
// modificata in 2020), 13.625 (martie 2024) si 14.125 (iunie 2024). Versiunile
// istorice stau in blocuri <span class="S_BLC" style="...color:blue">, iar
// textul in vigoare in fluxul principal. Un extractor care ia primul tabel
// gasit publica 12.500 — cu doi ani si 1.625 de lei in urma. De aceea scriptul
// calculeaza imbricarea span-urilor si arunca tot ce cade intr-un bloc albastru.
//
// Folosire:  node scripts/lege153-grile.mjs [--refetch]
// Iesire:    src/data/grile-153-2017.json

import fs from "node:fs/promises";
import path from "node:path";

const URL_ACT = "https://legislatie.just.ro/Public/DetaliiDocument/190446";
const CACHE = path.join(process.cwd(), "research", "lege153-consolidat.html");
const OUT = path.join(process.cwd(), "src", "data", "grile-153-2017.json");
const REFETCH = process.argv.includes("--refetch");

// ─── Sursa ───────────────────────────────────────────────────────────────────

async function html() {
  if (!REFETCH) {
    try {
      return await fs.readFile(CACHE, "utf8");
    } catch {
      /* prima rulare */
    }
  }
  const raspuns = await fetch(URL_ACT, {
    headers: { "User-Agent": "salariile.ro/1.0 (+https://salariile.ro)" },
    signal: AbortSignal.timeout(120_000),
  });
  if (!raspuns.ok) throw new Error(`legislatie.just.ro a raspuns ${raspuns.status}`);
  const text = await raspuns.text();
  await fs.mkdir(path.dirname(CACHE), { recursive: true });
  await fs.writeFile(CACHE, text, "utf8");
  return text;
}

// ─── Utilitare de text ───────────────────────────────────────────────────────

const ENTITATI = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const deEntitati = (s) =>
  s.replace(/&(#?\w+);/g, (tot, cod) => {
    if (ENTITATI[cod]) return ENTITATI[cod];
    if (/^#\d+$/.test(cod)) return String.fromCodePoint(Number(cod.slice(1)));
    if (/^#x[0-9a-f]+$/i.test(cod)) return String.fromCodePoint(parseInt(cod.slice(2), 16));
    return tot;
  });
const curat = (s) => deEntitati(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

// ─── Blocurile de text istoric ───────────────────────────────────────────────
//
// Imbricarea span-urilor, calculata o singura data. Un tabel e „istoric" daca
// pozitia lui cade intr-un span S_BLC colorat albastru.

function intervaleIstorice(doc) {
  const intervale = [];
  const stiva = [];
  const re = /<span\b([^>]*)>|<\/span>/g;
  let m;
  while ((m = re.exec(doc)) !== null) {
    if (m[0] === "</span>") {
      const deschis = stiva.pop();
      if (deschis?.istoric) intervale.push([deschis.start, re.lastIndex]);
    } else {
      stiva.push({
        start: m.index,
        istoric: /class="S_BLC"/.test(m[1]) && /color:\s*blue/i.test(m[1]),
      });
    }
  }
  return intervale;
}

// ─── Structura documentului ──────────────────────────────────────────────────

function anexe(doc) {
  const lista = [];
  const re = /<span class="S_ANX"[^>]*id="(id_anxA\d+)"/g;
  let m;
  while ((m = re.exec(doc)) !== null) {
    const cap = doc.slice(m.index, m.index + 3000);
    lista.push({
      id: m[1],
      start: m.index,
      titlu: curat(/class="S_ANX_TTL"[^>]*>([\s\S]*?)<\/span>/.exec(cap)?.[1] ?? ""),
      denumire: curat(/class="S_ANX_DEN"[^>]*>([\s\S]*?)</.exec(cap)?.[1] ?? ""),
    });
  }
  lista.forEach((a, i) => {
    a.end = lista[i + 1]?.start ?? doc.length;
  });
  return lista;
}

/**
 * Firul Ariadnei: ultimele doua titluri structurale dinaintea unui tabel.
 *
 * Marcajul isi tine numarul si denumirea in span-uri fratesti, nu in unul
 * singur: `S_LIT_TTL` da „a.1.", iar `S_LIT_BDY` care urmeaza da „Unitati
 * clinice". Luate separat, breadcrumb-ul iese „a.1. — a.2." si nu spune nimic.
 */
function contextul(corp, pana) {
  const titluri = [];
  const re = /class="S_(?:CAP|PCT|LIT|SLIT|PAR)_TTL"[^>]*>([\s\S]*?)<\/span>(?:\s*<span class="S_[A-Z]+_(?:DEN|BDY)"[^>]*>([^<]*))?/g;
  let m;
  while ((m = re.exec(corp)) !== null) {
    if (m.index >= pana) break;
    const t = `${curat(m[1])} ${curat(m[2] ?? "")}`.replace(/\s+/g, " ").trim();
    if (t) titluri.push(t);
  }
  return titluri.slice(-2).join(" — ");
}

// ─── Tabele ──────────────────────────────────────────────────────────────────

const STUDII = new Set(["S", "SSD", "M", "G", "PL", "SD", "M;G", "M/G", "S/SSD"]);
const celule = (tr) => [...tr.matchAll(/<t[dh][\s\S]*?<\/t[dh]>/gi)].map((c) => curat(c[0]));

/**
 * Sumele din grile sunt intre 500 si 999.999 lei, fara zecimale.
 *
 * Unele tabele isi scriu unitatea in celula — „3.135 lei" in grila soldelor de
 * grad din Anexa VI — iar altele o pun doar in antet. Fara `lei` optional aici,
 * toata grila soldelor de grad se pierde tacut.
 */
function suma(text) {
  const brut = text.replace(/\s*lei\s*$/i, "").replace(/[.\s]/g, "");
  if (!/^\d{3,6}$/.test(brut)) return null;
  const n = Number(brut);
  return n >= 500 ? n : null;
}

const eNume = (x) => x.length > 3 && !/^[\d.,\s]+$/.test(x);

/**
 * Grilele nu repeta denumirea functiei pe fiecare treapta. Scriu o data
 * „Consilier, consilier juridic, expert, inspector; grad profesional superior",
 * apoi doar „grad profesional principal", „grad profesional asistent". La fel
 * la judecatori, unde treptele sunt benzi de vechime — „15-20 ani" — sub gradul
 * instantei. Luat rand cu rand, jumatate din grila iese pe site ca „gradul II"
 * si „debutant", fara sa spuna al cui.
 */
const E_TREAPTA =
  /^(grad(ul)?\b|grad profesional\b|treapta\b|clasa\b|definitiv$|debutant$|stagiar$|\d+\s*-\s*\d+\s*ani$|peste \d+ ani$|baza\b)/i;

/** Numele functiei fara treapta finala, ca sa nu iasa „...superior; principal". */
const radacina = (nume) =>
  nume
    .split(/;\s*/)[0]
    .replace(/,\s*(grad(ul)?(\s+profesional)?\s+\S+|treapta\s+\S+)\s*$/i, "")
    .trim();

// „Minim"/„Maxim" intra in lista pentru ca altfel randul lor de antet trece
// drept cap de grup: n-are suma, dar are text. Consecinta, daca lipsesc de
// aici, e dubla — intervalul soldelor din Anexa VI isi pierde eticheta, iar
// toate gradele militare de dupa ajung sa se numeasca „Minim".
const GENERICE =
  /^(nr\.?\s*crt\.?|func[țt]ia|nivelul studiilor|salari|coeficient|grada[țt]ia|anul\b|indemniza[țt]|solde? |vechimea|minim$|maxim$)/i;

/**
 * Randurile unei grile sunt de trei feluri, si toate trei conteaza:
 *
 *   antet         — „Nr. crt. | Functia | Nivelul studiilor | Unitati clinice"
 *   cap de grup   — „1 | Preot | | Anul 2022 |", fara nicio suma pe rand
 *   rand de date  — „gradul I | S | 4000 | 1,60"
 *
 * Capul de grup e usor de ratat, pentru ca seamana cu antetul: n-are suma. Dar
 * el poarta singurul loc din tabel unde scrie „Preot". Aruncat, grila cultelor
 * iese pe site ca patru trepte anonime — „gradul I", „gradul II", „definitiv",
 * „debutant" — fara sa spuna a cui meserie sunt.
 */
function grila(tabel) {
  const randuri = [...tabel.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) => celule(r[0]));
  const numeleDin = (c) =>
    c.filter((x) => eNume(x) && !STUDII.has(x) && suma(x) === null && !GENERICE.test(x));

  const antet = [];
  const date = [];
  const clasificate = [];
  for (const c of randuri) {
    const areSuma = c.some((x) => suma(x) !== null);
    const nume = numeleDin(c);
    if (areSuma && nume.length) {
      date.push(c);
      clasificate.push({ tip: "date", c, nume });
      continue;
    }
    // Un rand fara suma, dar cu text, e ori antet ori cap de grup. Inainte de
    // primele date le deosebeste numarul de ordine: capul de grup e o intrare
    // numerotata din grila — „1 | Preot | | Anul 2022" — pe cand antetul isi
    // incepe randul cu „Nr. crt." sau cu numele unei coloane. Fara distinctia
    // asta, primul rand de antet trece drept grup si grila isi pierde eticheta
    // de domeniu („Unitati clinice"), care se ia tocmai din el.
    const capDeGrup = nume.length > 0 && (date.length > 0 || /^\d{1,3}\.?$/.test(c[0] ?? ""));
    if (capDeGrup) clasificate.push({ tip: "grup", c, nume });
    else if (date.length === 0) antet.push(c);
  }
  if (date.length === 0) return null;

  const capText = [...antet, ...clasificate.filter((r) => r.tip === "grup").map((r) => r.c)]
    .flat()
    .join(" | ");
  const coloane = [...capText.matchAll(/(ianuarie|martie|iunie|septembrie|decembrie)\s+(20\d\d)/gi)].map(
    (m) => `${m[1].toLowerCase()} ${m[2]}`,
  );

  // Antetul isi poarta singur domeniul de aplicare, in ultima celula a primului
  // rand: „Nr. crt. | Functia | Nivelul studiilor | Unitati clinice". E eticheta
  // cea mai sigura — nu depinde de imbricarea span-urilor din jur.
  const aplicaLa = (antet[0] ?? []).filter((x) => eNume(x) && !GENERICE.test(x)).join("; ") || null;

  // Cand grila da un interval, ultimul rand de antet spune care valoare ce e:
  // „Minim | Maxim". Fara eticheta asta, soldele de functie din Anexa VI par
  // doua cifre fara sens in loc de un interval.
  const ultimulAntet = antet[antet.length - 1] ?? [];
  const etichetaValori = ultimulAntet.every((x) => /^(minim|maxim)$/i.test(x)) && ultimulAntet.length
    ? ultimulAntet.map((x) => x.toLowerCase())
    : null;

  const iesire = [];
  let purtat = null;
  for (const { tip, c, nume } of clasificate) {
    const brut = nume.reduce((a, b) => (b.length > a.length ? b : a));
    if (tip === "grup") {
      purtat = radacina(brut);
      continue;
    }
    const valori = c.map(suma).filter((v) => v !== null);
    const treapta = E_TREAPTA.test(brut);
    if (!treapta) purtat = radacina(brut);
    const functie = treapta && purtat ? `${purtat}; ${brut}` : brut;

    iesire.push({
      nr: /^\d{1,3}$/.test(c[0]) ? Number(c[0]) : null,
      functie,
      /** Ce scrie exact in tabel, ca sa se poata verifica in lege. */
      textOriginal: treapta && purtat ? brut : null,
      studii: c.find((x) => STUDII.has(x)) ?? null,
      valori,
    });
  }
  if (!iesire.length) return null;
  return { aplicaLa, etichetaValori, coloane, anul: /Anul\s+(20\d\d)/i.exec(capText)?.[1] ?? null, randuri: iesire };
}

// ─── Rulare ──────────────────────────────────────────────────────────────────

const doc = await html();
const istorice = intervaleIstorice(doc);
const eIstoric = (p) => istorice.some(([a, b]) => a <= p && p < b);

const rezultat = [];
let tabeleTotal = 0;
let tabeleIstorice = 0;

for (const a of anexe(doc)) {
  const corp = doc.slice(a.start, a.end);
  const grile = [];
  for (const t of corp.matchAll(/<table[\s\S]*?<\/table>/gi)) {
    tabeleTotal += 1;
    if (eIstoric(a.start + t.index)) {
      tabeleIstorice += 1;
      continue;
    }
    const g = grila(t[0]);
    if (g) grile.push({ sectiune: contextul(corp, t.index), ...g });
  }
  if (grile.length) rezultat.push({ anexa: a.titlu, denumire: a.denumire, grile });
}

const nrRanduri = (a) => a.grile.reduce((s, g) => s + g.randuri.length, 0);

const payload = {
  sursa: {
    act: "Legea-cadru nr. 153/2017 privind salarizarea personalului plătit din fonduri publice",
    url: URL_ACT,
    licenta: "Text consolidat publicat de Ministerul Justiției (legislatie.just.ro)",
    dataExtragerii: new Date().toISOString().slice(0, 10),
  },
  coloanaInPlata: "iunie 2024",
  deCeIunie2024: [
    "Grilele modificate în 2024 au două coloane: martie 2024 și iunie 2024.",
    "Coloana iunie 2024 este cea în plată azi, prin lanțul de menținere din textul consolidat:",
    "  — în 2025 salariile de bază se mențin la nivelul lunii decembrie 2024;",
    "  — în 2026 se mențin la nivelul lunii decembrie 2025.",
    "Unde o anexă nu a fost modificată în 2024, grila în vigoare rămâne cea marcată „Anul 2022”.",
  ],
  atentie: [
    "Sumele sunt salariu de bază BRUT la gradația 0 — înainte de gradația de vechime și de sporuri.",
    "Se aplică personalului plătit din fonduri publice. Nu descriu sectorul privat.",
    "Versiunile istorice ale tabelelor au fost excluse la extragere; vezi comentariul din script.",
  ],
  anexe: rezultat,
};

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(payload), "utf8");

const kb = ((await fs.stat(OUT)).size / 1024).toFixed(0);
console.log(`scris ${path.relative(process.cwd(), OUT)} — ${kb} KB`);
console.log(
  `tabele: ${tabeleTotal} · istorice ignorate: ${tabeleIstorice} · grile păstrate: ${rezultat.reduce((t, a) => t + a.grile.length, 0)}`,
);
console.log(`rânduri de salariu: ${rezultat.reduce((t, a) => t + nrRanduri(a), 0)}\n`);
for (const a of rezultat) {
  console.log(
    `  ${a.anexa.padEnd(15)} grile ${String(a.grile.length).padStart(3)} · rânduri ${String(nrRanduri(a)).padStart(4)}  ${a.denumire.slice(0, 50)}`,
  );
}
