#!/usr/bin/env node
// scripts/gsc.mjs
// Utilitar zero-dependențe pentru Google Search Console API.
// Autentificare cu service account (JWT -> access token), apoi searchAnalytics.query.
//
// Folosire:
//   node scripts/gsc.mjs queries                 # top 25 cuvinte-cheie, ultimele 28 zile
//   node scripts/gsc.mjs pages   --days=90 --limit=50
//   node scripts/gsc.mjs countries
//   node scripts/gsc.mjs devices
//   node scripts/gsc.mjs dates                   # evoluție pe zile
//   node scripts/gsc.mjs queries --page=/calculator-pfa   # interogări pentru o pagină
//   node scripts/gsc.mjs pages   --query=salariu minim    # pagini pentru o interogare
//   node scripts/gsc.mjs queries --start=2026-05-01 --end=2026-05-31
//   node scripts/gsc.mjs queries --json          # JSON brut (pentru pipe/analiză)
//   node scripts/gsc.mjs queries --csv           # ieșire CSV
//
//   node scripts/gsc.mjs inspect /calculator-pfa # e pagina indexată de Google?
//   node scripts/gsc.mjs inspect https://salariile.ro/salariu-minim
//
//   node scripts/gsc.mjs sitemaps                # stare sitemap-uri (descoperire URL-uri)
//   node scripts/gsc.mjs opportunities           # cuvinte pe poz. 4-20 (câștiguri ușoare)
//   node scripts/gsc.mjs opps --min=5 --max=15 --days=90
//
// (cu npm: `npm run gsc -- queries --days=90`)
//
// Config (env, opțional):
//   GSC_KEY_FILE  cale către cheia JSON a service account-ului (default: ./gsc-key.json sau ./.gsc/key.json)
//   GSC_SITE      proprietatea (default: https://salariile.ro/)

import crypto from "node:crypto";
import fs from "node:fs";

const SITE = process.env.GSC_SITE || "https://salariile.ro/";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

const DIM = {
  queries: "query",
  pages: "page",
  countries: "country",
  devices: "device",
  dates: "date",
  appearance: "searchAppearance",
};

// ── args ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const positionals = argv.filter((a) => !a.startsWith("--"));
const cmd = positionals[0] || "queries";
const opt = Object.fromEntries(
  argv
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...rest] = a.slice(2).split("=");
      return [k, rest.length ? rest.join("=") : true];
    }),
);

// ── cheie service account ─────────────────────────────────────────────────────
function loadKey() {
  const candidates = [
    process.env.GSC_KEY_FILE,
    "./gsc-key.json",
    "./.gsc/key.json",
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
    } catch (e) {
      throw new Error(`Nu pot citi cheia din ${p}: ${e.message}`);
    }
  }
  throw new Error(
    "Lipsește cheia service account. Pune fișierul JSON la ./gsc-key.json " +
      "sau setează GSC_KEY_FILE=cale/către/key.json",
  );
}

// ── auth: JWT semnat RS256 -> access token ─────────────────────────────────────
const b64url = (input) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsigned)
    .sign(key.private_key)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const assertion = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Eroare la obținerea token-ului (${res.status}): ${await res.text()}`);
  }
  return (await res.json()).access_token;
}

// OAuth (Plan B): dacă există .gsc/oauth-token.json, folosește refresh_token.
async function getOAuthToken() {
  let t;
  try {
    t = JSON.parse(fs.readFileSync("./.gsc/oauth-token.json", "utf8"));
  } catch {
    return null;
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: t.client_id,
      client_secret: t.client_secret,
      refresh_token: t.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Eroare refresh OAuth (${res.status}): ${await res.text()}`);
  }
  return (await res.json()).access_token;
}

// Preferă OAuth; altfel cade pe service account (JWT).
async function resolveAccessToken() {
  const oauth = await getOAuthToken();
  if (oauth) return oauth;
  return getAccessToken(loadKey());
}

// ── apel API ───────────────────────────────────────────────────────────────────
async function searchAnalytics(token, body) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    SITE,
  )}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Eroare API (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

// ── Sitemaps API (stare sitemap-uri) ───────────────────────────────────────────
async function listSitemaps(token) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    SITE,
  )}/sitemaps`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Eroare Sitemaps (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

// ── URL Inspection API (verificare indexare) ───────────────────────────────────
async function inspectUrl(token, fullUrl) {
  const res = await fetch(
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        inspectionUrl: fullUrl,
        siteUrl: SITE,
        languageCode: "ro",
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`Eroare URL Inspection (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

// Transformă un argument (path sau URL complet) într-un URL absolut pe proprietate.
function toFullUrl(arg) {
  if (!arg) return null;
  if (/^https?:\/\//i.test(arg)) return arg;
  const origin = SITE.replace(/\/+$/, ""); // https://salariile.ro
  return origin + (arg.startsWith("/") ? arg : "/" + arg);
}

// ── date helpers ───────────────────────────────────────────────────────────────
const isoDaysAgo = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};

// ── output ───────────────────────────────────────────────────────────────────────
function printTable(rows, dimLabel) {
  if (!rows.length) {
    console.log("(niciun rând — fie nu există date încă, fie filtrul e prea strict)");
    return;
  }
  const data = rows.map((r) => ({
    [dimLabel]: r.keys.join(" · "),
    clicuri: r.clicks,
    impresii: r.impressions,
    ctr: (r.ctr * 100).toFixed(1) + "%",
    pozitie: r.position.toFixed(1),
  }));
  const cols = Object.keys(data[0]);
  const width = (c) => Math.max(c.length, ...data.map((row) => String(row[c]).length));
  const w = Object.fromEntries(cols.map((c) => [c, width(c)]));
  const pad = (s, n, right = false) =>
    right ? String(s).padStart(n) : String(s).padEnd(n);
  const sep = cols.map((c) => "─".repeat(w[c])).join("─┼─");
  const head = cols.map((c) => pad(c, w[c])).join(" │ ");
  console.log(head);
  console.log(sep);
  for (const row of data) {
    console.log(
      cols
        .map((c) => pad(row[c], w[c], c !== cols[0]))
        .join(" │ "),
    );
  }
}

function printCsv(rows, dimLabel) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  console.log([dimLabel, "clicks", "impressions", "ctr", "position"].map(esc).join(","));
  for (const r of rows) {
    console.log(
      [r.keys.join(" · "), r.clicks, r.impressions, r.ctr, r.position].map(esc).join(","),
    );
  }
}

// ── main ─────────────────────────────────────────────────────────────────────────
(async () => {
  try {
    // ── comandă: inspect (verificare indexare a unei pagini) ──
    if (cmd === "inspect") {
      const fullUrl = toFullUrl(positionals[1] || opt.url || "/");
      const token = await resolveAccessToken();
      const data = await inspectUrl(token, fullUrl);

      if (opt.json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      const r = data.inspectionResult || {};
      const idx = r.indexStatusResult || {};
      const verdictRo = {
        PASS: "✓ INDEXATĂ",
        NEUTRAL: "~ neutră",
        FAIL: "✗ NU e indexată",
        PARTIAL: "~ parțial",
      };
      console.log(`\nURL inspectat : ${fullUrl}`);
      console.log(`Verdict       : ${verdictRo[idx.verdict] || idx.verdict || "necunoscut"}`);
      console.log(`Stare         : ${idx.coverageState || "—"}`);
      console.log(`Robots.txt    : ${idx.robotsTxtState || "—"}`);
      console.log(`Indexare      : ${idx.indexingState || "—"}`);
      console.log(`Ultima crawl  : ${idx.lastCrawlTime || "niciodată (încă necrawl-ată)"}`);
      console.log(`Fetch pagină  : ${idx.pageFetchState || "—"}`);
      console.log(`Canonical Google: ${idx.googleCanonical || "—"}`);
      console.log(`Canonical decl. : ${idx.userCanonical || "—"}`);
      if (r.inspectionResultLink) console.log(`Detalii în GSC  : ${r.inspectionResultLink}`);
      console.log("");
      return;
    }

    // ── comandă: sitemaps (stare sitemap-uri trimise la Google) ──
    if (cmd === "sitemaps") {
      const token = await resolveAccessToken();
      const data = await listSitemaps(token);
      if (opt.json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }
      const sm = data.sitemap || [];
      console.log(`\nProprietate : ${SITE}`);
      if (!sm.length) {
        console.log(
          "\n(niciun sitemap înregistrat la Search Console — îl poți trimite din GSC → Sitemaps)\n",
        );
        return;
      }
      for (const s of sm) {
        console.log(`\nSitemap      : ${s.path}`);
        console.log(`Trimis       : ${s.lastSubmitted || "—"}`);
        console.log(`Descărcat    : ${s.lastDownloaded || "—"}`);
        console.log(`În așteptare : ${s.isPending ? "da" : "nu"}`);
        console.log(`Erori        : ${s.errors || 0}  ·  avertismente: ${s.warnings || 0}`);
        for (const c of s.contents || []) {
          console.log(`  ${c.type}: ${c.submitted ?? "—"} trimise / ${c.indexed ?? "—"} indexate`);
        }
      }
      console.log("");
      return;
    }

    // ── comandă: opportunities (cuvinte pe pozițiile 4-20, „striking distance") ──
    if (cmd === "opportunities" || cmd === "opps") {
      const days = Number(opt.days || 28);
      const startDate = String(opt.start || isoDaysAgo(days));
      const endDate = String(opt.end || isoDaysAgo(0));
      const minPos = Number(opt.min || 4);
      const maxPos = Number(opt.max || 20);

      const token = await resolveAccessToken();
      const result = await searchAnalytics(token, {
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: 1000,
      });
      const opps = (result.rows || [])
        .filter((r) => r.position >= minPos && r.position <= maxPos)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, Number(opt.limit || 25));

      if (opt.json) {
        console.log(JSON.stringify(opps, null, 2));
        return;
      }
      console.log(`\nProprietate : ${SITE}`);
      console.log(`Interval    : ${startDate} → ${endDate}`);
      console.log(
        `Oportunități: cuvinte pe pozițiile ${minPos}-${maxPos} (la un pas de prima pagină), sortate după impresii\n`,
      );
      printTable(opps, "query");
      console.log(
        "\n→ Astea sunt câștigurile ușoare: mic push pe conținut/titlu și urci pe pagina 1.\n",
      );
      return;
    }

    const dimension = opt.dim || DIM[cmd];
    if (!dimension) {
      console.error(
        `Comandă necunoscută: "${cmd}". Folosește: ${Object.keys(DIM).join(", ")} (sau --dim=...)`,
      );
      process.exit(1);
    }

    const days = Number(opt.days || 28);
    const startDate = String(opt.start || isoDaysAgo(days));
    const endDate = String(opt.end || isoDaysAgo(0));
    const rowLimit = Number(opt.limit || 25);

    const body = { startDate, endDate, dimensions: [dimension], rowLimit };

    const filters = [];
    if (opt.country) filters.push({ dimension: "country", expression: String(opt.country) });
    if (opt.page) filters.push({ dimension: "page", operator: "contains", expression: String(opt.page) });
    if (opt.query) filters.push({ dimension: "query", operator: "contains", expression: String(opt.query) });
    if (filters.length) body.dimensionFilterGroups = [{ filters }];

    const token = await resolveAccessToken();
    const result = await searchAnalytics(token, body);
    const rows = result.rows || [];

    if (opt.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (opt.csv) {
      printCsv(rows, dimension);
      return;
    }

    const totals = rows.reduce(
      (acc, r) => {
        acc.clicks += r.clicks;
        acc.impressions += r.impressions;
        return acc;
      },
      { clicks: 0, impressions: 0 },
    );

    console.log(`\nProprietate : ${SITE}`);
    console.log(`Dimensiune  : ${dimension}`);
    console.log(`Interval    : ${startDate} → ${endDate}`);
    if (filters.length) {
      console.log(`Filtre      : ${filters.map((f) => `${f.dimension}~${f.expression}`).join(", ")}`);
    }
    console.log(
      `Rânduri     : ${rows.length}  ·  total clicuri ${totals.clicks}  ·  total impresii ${totals.impressions}\n`,
    );
    printTable(rows, dimension);
    console.log("");
  } catch (e) {
    console.error("\n✗ " + e.message + "\n");
    process.exit(1);
  }
})();
