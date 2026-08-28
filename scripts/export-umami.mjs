#!/usr/bin/env node
// scripts/export-umami.mjs
//
// Scoate TOT din instanta Umami inainte de a o inchide. Ruleaza o singura data,
// dar e idempotent: rescrie fisierele la fiecare rulare.
//
// De ce exista: instanta Umami (proiectul Vercel `umami-salariile`) se
// dezafecteaza, iar baza Neon din spatele ei dispare cu ea. Dupa aia datele nu
// se mai recupereaza. Scriptul salveaza doua lucruri:
//
//   1. RANDURILE BRUTE, tabel cu tabel, in NDJSON — ca sa se poata reinteroga
//      oricand, cu orice intrebare pe care n-am pus-o azi.
//   2. AGREGATELE CALCULATE, in JSON si Markdown — concluziile pe care le
//      folosim in CLAUDE.md si PROGRES.md raman verificabile si dupa ce baza
//      nu mai exista.
//
// Folosire:
//   DATABASE_URL="postgres://..." node scripts/export-umami.mjs
//   sau: pune DATABASE_URL intr-un fisier .env.umami langa script.
//
// Iesirea merge in `export-umami/`, care e gitignored: contine date de trafic
// defalcate, iar repo-ul e public.

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

// ─── Conexiune ──────────────────────────────────────────────────────────────

function citesteUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const f of [".env.umami", ".env.local", ".env"]) {
    if (!fs.existsSync(f)) continue;
    const linie = fs.readFileSync(f, "utf8").split(/\r?\n/).find((l) => l.startsWith("DATABASE_URL="));
    if (!linie) continue;
    const v = linie.slice("DATABASE_URL=".length).replace(/^["']|["']$/g, "");
    if (v && v !== "[SENSITIVE]" && v.startsWith("post")) return v;
  }
  return null;
}

const url = citesteUrl();
if (!url) {
  console.error(`
Lipseste DATABASE_URL.

  Vercel il marcheaza secret, deci "vercel env pull" intoarce [SENSITIVE].
  Ia-l din consola Neon (sau din Vercel > umami-salariile > Settings >
  Environment Variables > DATABASE_URL > Reveal) si ruleaza:

    DATABASE_URL="postgres://..." node scripts/export-umami.mjs

  Sau pune-l intr-un fisier .env.umami in radacina proiectului. Fisierul e
  deja acoperit de .gitignore prin regula .env*.
`);
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1, idle_timeout: 20 });
const DIR = "export-umami";
fs.mkdirSync(DIR, { recursive: true });

const scrie = (nume, date) => {
  fs.writeFileSync(path.join(DIR, nume), typeof date === "string" ? date : JSON.stringify(date, null, 1));
  const kb = (fs.statSync(path.join(DIR, nume)).size / 1024).toFixed(0);
  console.log(`  → ${nume.padEnd(38)} ${kb.padStart(7)} KB`);
};

const nrLinii = (n) => new Intl.NumberFormat("ro-RO").format(n);

try {
  // ─── 1. Randurile brute ──────────────────────────────────────────────────

  console.log("\n1. TABELE BRUTE\n");
  const tabele = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public' order by table_name`;

  const inventar = [];
  for (const { table_name } of tabele) {
    const randuri = await sql`select * from ${sql(table_name)}`;
    inventar.push({ tabel: table_name, randuri: randuri.length });
    // NDJSON: un obiect pe linie, ca sa se poata citi in flux fara sa incarci tot
    scrie(`${table_name}.ndjson`, randuri.map((r) => JSON.stringify(r)).join("\n"));
  }

  // ─── 2. Agregatele calculate ─────────────────────────────────────────────

  console.log("\n2. AGREGATE CALCULATE\n");
  const A = {};

  A.perioada = (await sql`
    select min(created_at)::date as prima_zi, max(created_at)::date as ultima_zi,
           count(*)::int as evenimente
    from website_event`)[0];

  A.total = (await sql`
    select count(distinct session_id)::int as sesiuni,
           count(distinct visit_id)::int as vizite,
           count(*) filter (where event_type = 1)::int as vizualizari
    from website_event`)[0];

  A.peLuna = await sql`
    select to_char(created_at, 'YYYY-MM') as luna,
           count(distinct session_id)::int as sesiuni,
           count(*) filter (where event_type = 1)::int as vizualizari
    from website_event group by 1 order by 1`;

  A.peUrl = await sql`
    select url_path, count(*)::int as vizualizari,
           count(distinct session_id)::int as sesiuni
    from website_event where event_type = 1
    group by 1 order by 2 desc limit 300`;

  A.evenimenteCustom = await sql`
    select event_name, count(*)::int as declansari,
           count(distinct session_id)::int as sesiuni
    from website_event where event_type = 2 and event_name is not null
    group by 1 order by 2 desc`;

  // Datele evenimentelor custom: cheie + valoare + de cate ori. Aici stau
  // categoriile pe care le-am emis din calculatoare (mod de calcul, regim PFA,
  // gradatie de invatamant), deci raspunsul la "ce anume calculeaza oamenii".
  A.dateEvenimente = await sql`
    select e.event_name, d.data_key, d.string_value, count(*)::int as aparitii
    from event_data d join website_event e on e.event_id = d.website_event_id
    where d.string_value is not null
    group by 1, 2, 3 order by 4 desc limit 400`;

  // `url_query` a dezvaluit odata un bug invizibil: un submit dinainte de
  // hidratare care golea calculatorul. Se pastreaza intreg.
  A.urlQuery = await sql`
    select url_path, url_query, count(*)::int as aparitii,
           count(distinct session_id)::int as sesiuni
    from website_event where url_query is not null and url_query <> ''
    group by 1, 2 order by 3 desc limit 500`;

  A.referrer = await sql`
    select coalesce(nullif(referrer_domain, ''), '(direct)') as sursa,
           count(distinct session_id)::int as sesiuni
    from website_event group by 1 order by 2 desc limit 100`;

  A.geo = await sql`
    select country, region, city, count(distinct session_id)::int as sesiuni
    from session group by 1, 2, 3 order by 4 desc limit 300`;

  A.dispozitive = await sql`
    select device, os, browser, count(distinct session_id)::int as sesiuni
    from session group by 1, 2, 3 order by 4 desc limit 100`;

  // Core Web Vitals — colectate cu data-performance="true".
  A.webVitals = (await sql`
    select count(*)::int as masuratori,
           round(avg(lcp)::numeric, 0) as lcp_mediu,
           round(avg(cls)::numeric, 3) as cls_mediu,
           round(avg(inp)::numeric, 0) as inp_mediu,
           round(avg(fcp)::numeric, 0) as fcp_mediu,
           round(avg(ttfb)::numeric, 0) as ttfb_mediu
    from website_event where lcp is not null`)[0];

  scrie("agregate.json", A);

  // ─── 3. Rezumat lizibil ──────────────────────────────────────────────────

  const md = [
    "# Export Umami — arhivă finală",
    "",
    `Generat: ${new Date().toISOString().slice(0, 10)}`,
    `Perioadă acoperită: ${A.perioada.prima_zi} → ${A.perioada.ultima_zi}`,
    "",
    "Instanța Umami (proiectul Vercel `umami-salariile`) a fost dezafectată.",
    "Fișierul ăsta și `agregate.json` sunt tot ce a rămas; datele brute stau în",
    "fișierele `.ndjson` de alături.",
    "",
    "## Total",
    "",
    `- Evenimente: ${nrLinii(A.perioada.evenimente)}`,
    `- Sesiuni: ${nrLinii(A.total.sesiuni)}`,
    `- Vizualizări de pagină: ${nrLinii(A.total.vizualizari)}`,
    "",
    "## Pe lună",
    "",
    "| Luna | Sesiuni | Vizualizări |",
    "|---|---:|---:|",
    ...A.peLuna.map((r) => `| ${r.luna} | ${nrLinii(r.sesiuni)} | ${nrLinii(r.vizualizari)} |`),
    "",
    "## Top 20 pagini",
    "",
    "| Pagina | Vizualizări | Sesiuni |",
    "|---|---:|---:|",
    ...A.peUrl.slice(0, 20).map((r) => `| \`${r.url_path}\` | ${nrLinii(r.vizualizari)} | ${nrLinii(r.sesiuni)} |`),
    "",
    "## Evenimente proprii",
    "",
    "| Eveniment | Declanșări | Sesiuni |",
    "|---|---:|---:|",
    ...A.evenimenteCustom.map((r) => `| ${r.event_name} | ${nrLinii(r.declansari)} | ${nrLinii(r.sesiuni)} |`),
    "",
    "## Core Web Vitals",
    "",
    A.webVitals.masuratori
      ? `${nrLinii(A.webVitals.masuratori)} măsurători · LCP ${A.webVitals.lcp_mediu} ms · CLS ${A.webVitals.cls_mediu} · INP ${A.webVitals.inp_mediu} ms · FCP ${A.webVitals.fcp_mediu} ms · TTFB ${A.webVitals.ttfb_mediu} ms`
      : "Nicio măsurătoare colectată.",
    "",
    "## Tabele brute salvate",
    "",
    "| Tabel | Rânduri |",
    "|---|---:|",
    ...inventar.map((r) => `| \`${r.tabel}\` | ${nrLinii(r.randuri)} |`),
    "",
  ].join("\n");

  scrie("REZUMAT.md", md);

  console.log(`\nGata. ${inventar.reduce((s, r) => s + r.randuri, 0).toLocaleString("ro-RO")} de rânduri salvate în ${DIR}/`);
  console.log("Verifică REZUMAT.md înainte de a dezafecta instanța.\n");
} finally {
  await sql.end();
}
