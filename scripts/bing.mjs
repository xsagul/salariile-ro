#!/usr/bin/env node
// scripts/bing.mjs
// Utilitar zero-dependențe pentru Bing Webmaster Tools API.
// Backlinkuri (inbound links), performanță de căutare pe Bing, crawl stats.
//
// Folosire:
//   node scripts/bing.mjs sites              # site-urile verificate (confirmă cheia)
//   node scripts/bing.mjs links              # backlinkuri către homepage
//   node scripts/bing.mjs links /calculator-pfa   # backlinkuri către o pagină
//   node scripts/bing.mjs linkcounts         # pagini + câte linkuri externe are fiecare
//   node scripts/bing.mjs queries            # interogări de căutare pe Bing
//   node scripts/bing.mjs crawl              # statistici de crawl Bing
//   <orice> --json                           # JSON brut
//
// Config (opțional):
//   BING_KEY   cheia API (default: citită din ./.gsc/bing-key)
//   BING_SITE  proprietatea (default: https://salariile.ro)

import fs from "node:fs";

const SITE = process.env.BING_SITE || "https://salariile.ro/";
const BASE = "https://ssl.bing.com/webmaster/api.svc/json";

const argv = process.argv.slice(2);
const positionals = argv.filter((a) => !a.startsWith("--"));
const cmd = positionals[0] || "sites";
const opt = Object.fromEntries(
  argv
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...rest] = a.slice(2).split("=");
      return [k, rest.length ? rest.join("=") : true];
    }),
);

function loadKey() {
  if (opt.key) return String(opt.key);
  if (process.env.BING_KEY) return process.env.BING_KEY;
  try {
    return fs.readFileSync("./.gsc/bing-key", "utf8").trim();
  } catch {
    throw new Error("Lipsește cheia Bing. Pune-o în ./.gsc/bing-key sau setează BING_KEY.");
  }
}

const KEY = loadKey();

async function call(method, params = {}) {
  const qs = new URLSearchParams({ apikey: KEY, ...params });
  const res = await fetch(`${BASE}/${method}?${qs}`, {
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Răspuns ne-JSON de la ${method} (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok || json.ErrorCode) {
    throw new Error(`Eroare ${method} (${res.status}): ${json.Message || text.slice(0, 200)}`);
  }
  return json.d; // Bing înfășoară datele în "d"
}

const fullUrl = (arg) => {
  if (!arg) return SITE;
  if (/^https?:\/\//i.test(arg)) return arg;
  return SITE.replace(/\/+$/, "") + (arg.startsWith("/") ? arg : "/" + arg);
};

(async () => {
  try {
    if (cmd === "sites") {
      const d = await call("GetUserSites");
      if (opt.json) return console.log(JSON.stringify(d, null, 2));
      console.log("\nSite-uri verificate în Bing Webmaster Tools:");
      for (const s of d || []) {
        console.log(`  • ${s.Url}  (verificat: ${s.IsVerified ? "da" : "nu"})`);
      }
      console.log("");
      return;
    }

    if (cmd === "links") {
      const target = fullUrl(positionals[1]);
      const d = await call("GetUrlLinks", { siteUrl: SITE, link: target, page: opt.page || 0 });
      if (opt.json) return console.log(JSON.stringify(d, null, 2));
      const links = d?.Details || [];
      console.log(`\nBacklinkuri către ${target} (cum le vede Bing):`);
      console.log(`Pagini de rezultate: ${d?.TotalPages ?? 0}  ·  pe pagina curentă: ${links.length}\n`);
      if (!links.length) {
        console.log("(niciun backlink raportat încă)\n");
        return;
      }
      for (const l of links) {
        console.log(`  ← ${l.Url || l.AnchorTextUrl || l}`);
        if (l.AnchorText) console.log(`     ancoră: „${l.AnchorText}"`);
      }
      console.log("");
      return;
    }

    if (cmd === "linkcounts") {
      const d = await call("GetLinkCounts", { siteUrl: SITE, page: opt.page || 0 });
      if (opt.json) return console.log(JSON.stringify(d, null, 2));
      const rows = d?.Links || d || [];
      console.log(`\nPagini și numărul de linkuri externe (Bing):\n`);
      if (!rows.length) return console.log("(niciun link raportat încă)\n");
      for (const r of rows) {
        console.log(`  ${String(r.Count ?? r.LinkCount ?? "?").padStart(6)}  ${r.Url || r.SourceUrl || ""}`);
      }
      console.log("");
      return;
    }

    if (cmd === "queries") {
      const d = await call("GetQueryStats", { siteUrl: SITE });
      if (opt.json) return console.log(JSON.stringify(d, null, 2));
      const rows = d || [];
      console.log(`\nInterogări de căutare pe Bing (ultima perioadă):\n`);
      if (!rows.length) return console.log("(niciun date încă)\n");
      console.log("  impresii  clicuri  poziție  interogare");
      for (const r of rows.slice(0, Number(opt.limit || 30))) {
        const q = r.Query || "";
        console.log(
          `  ${String(r.Impressions ?? "—").padStart(8)}  ${String(r.Clicks ?? "—").padStart(7)}  ${String(
            r.AvgImpressionPosition ?? r.Position ?? "—",
          ).padStart(7)}  ${q}`,
        );
      }
      console.log("");
      return;
    }

    if (cmd === "crawl") {
      const d = await call("GetCrawlStats", { siteUrl: SITE });
      if (opt.json) return console.log(JSON.stringify(d, null, 2));
      console.log("\nStatistici crawl Bing:");
      console.log(JSON.stringify(d, null, 2));
      console.log("");
      return;
    }

    console.error(`Comandă necunoscută: "${cmd}". Folosește: sites, links, linkcounts, queries, crawl`);
    process.exit(1);
  } catch (e) {
    console.error("\n✗ " + e.message + "\n");
    process.exit(1);
  }
})();
