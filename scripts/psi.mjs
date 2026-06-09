#!/usr/bin/env node
// scripts/psi.mjs
// Utilitar zero-dependențe pentru PageSpeed Insights API (Lighthouse + Core Web Vitals).
// Funcționează pe orice URL public — NU cere service account, NU cere Search Console.
//
// Folosire:
//   node scripts/psi.mjs                          # homepage, pe mobil
//   node scripts/psi.mjs /calculator-pfa          # o pagină anume
//   node scripts/psi.mjs /salariu-minim --desktop # strategie desktop
//   node scripts/psi.mjs https://salariile.ro/    # URL complet
//   node scripts/psi.mjs /calculator-pfa --json   # JSON brut
//
// Config (opțional):
//   PSI_KEY   cheie API PageSpeed (gratuită) — necesară doar dacă lovești limita keyless
//             node scripts/psi.mjs / --key=AIza...
//
// Notă: apelul durează 10-30s (Google rulează Lighthouse live pe pagina ta).

import fs from "node:fs";

const ORIGIN = process.env.PSI_ORIGIN || "https://salariile.ro";

const argv = process.argv.slice(2);
const positionals = argv.filter((a) => !a.startsWith("--"));
const opt = Object.fromEntries(
  argv
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...rest] = a.slice(2).split("=");
      return [k, rest.length ? rest.join("=") : true];
    }),
);

function toFullUrl(arg) {
  if (!arg) return ORIGIN + "/";
  if (/^https?:\/\//i.test(arg)) return arg;
  return ORIGIN.replace(/\/+$/, "") + (arg.startsWith("/") ? arg : "/" + arg);
}

const mark = (score) =>
  score == null ? "·" : score >= 0.9 ? "✓" : score >= 0.5 ? "~" : "✗";
const pct = (score) => (score == null ? "—" : Math.round(score * 100));

(async () => {
  try {
    const url = toFullUrl(positionals[0]);
    const strategy = opt.desktop ? "desktop" : "mobile";
    let key = opt.key || process.env.PSI_KEY;
    if (!key) {
      try {
        key = fs.readFileSync("./.gsc/psi-key", "utf8").trim();
      } catch {
        /* fără cheie — se încearcă keyless */
      }
    }

    const params = new URLSearchParams({ url, strategy });
    for (const c of ["performance", "accessibility", "best-practices", "seo"]) {
      params.append("category", c);
    }
    if (key) params.set("key", String(key));

    const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`;
    console.log(`\n⏳ Rulez Lighthouse pe ${url} (${strategy}) — durează 10-30s...\n`);

    const res = await fetch(api);
    if (!res.ok) {
      throw new Error(`Eroare PSI (${res.status}): ${await res.text()}`);
    }
    const data = await res.json();

    if (opt.json) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    const lh = data.lighthouseResult || {};
    const cats = lh.categories || {};
    const audits = lh.audits || {};

    // ── Scoruri categorii ──
    console.log(`URL        : ${url}`);
    console.log(`Strategie  : ${strategy}\n`);
    console.log("SCORURI (0-100):");
    const catOrder = [
      ["performance", "Performanță"],
      ["seo", "SEO"],
      ["accessibility", "Accesibilitate"],
      ["best-practices", "Best Practices"],
    ];
    for (const [k, label] of catOrder) {
      const s = cats[k]?.score;
      console.log(`  ${mark(s)} ${label.padEnd(16)} ${pct(s)}`);
    }

    // ── Core Web Vitals — date de laborator ──
    console.log("\nMETRICI (laborator):");
    const labMetrics = [
      ["largest-contentful-paint", "LCP (Largest Contentful Paint)"],
      ["first-contentful-paint", "FCP (First Contentful Paint)"],
      ["cumulative-layout-shift", "CLS (Cumulative Layout Shift)"],
      ["total-blocking-time", "TBT (Total Blocking Time)"],
      ["speed-index", "Speed Index"],
      ["interactive", "Time to Interactive"],
    ];
    for (const [id, label] of labMetrics) {
      const a = audits[id];
      if (!a) continue;
      console.log(`  ${mark(a.score)} ${label.padEnd(34)} ${a.displayValue || "—"}`);
    }

    // ── Core Web Vitals — date de teren (CrUX, dacă există) ──
    const fe = data.loadingExperience;
    if (fe && fe.metrics && Object.keys(fe.metrics).length) {
      const catRo = { FAST: "bun", AVERAGE: "mediu", SLOW: "slab" };
      console.log(
        `\nDATE DE TEREN (utilizatori reali) — verdict general: ${
          catRo[fe.overall_category] || fe.overall_category || "—"
        }`,
      );
      const fieldMap = {
        LARGEST_CONTENTFUL_PAINT_MS: "LCP",
        INTERACTION_TO_NEXT_PAINT: "INP",
        CUMULATIVE_LAYOUT_SHIFT_SCORE: "CLS",
        FIRST_CONTENTFUL_PAINT_MS: "FCP",
      };
      for (const [k, m] of Object.entries(fe.metrics)) {
        const label = fieldMap[k] || k;
        const val = k.includes("CLS") ? (m.percentile / 100).toFixed(2) : `${m.percentile} ms`;
        console.log(`  ${label.padEnd(6)} ${val.padEnd(10)} (${catRo[m.category] || m.category})`);
      }
    } else {
      console.log(
        "\nDATE DE TEREN: încă indisponibile (site nou — Google are nevoie de trafic real ca să adune CrUX).",
      );
    }

    // ── Probleme de reparat (top, după economia de timp) ──
    const issues = Object.values(audits)
      .filter(
        (a) =>
          typeof a.score === "number" &&
          a.score < 0.9 &&
          a.title &&
          (a.details?.overallSavingsMs || a.scoreDisplayMode === "metricSavings" || a.scoreDisplayMode === "binary"),
      )
      .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
      .slice(0, 8);

    if (issues.length) {
      console.log("\nDE REPARAT (prioritar):");
      for (const a of issues) {
        const save = a.details?.overallSavingsMs
          ? `  (~${Math.round(a.details.overallSavingsMs)} ms)`
          : "";
        console.log(`  ${mark(a.score)} ${a.title}${save}`);
      }
    }
    console.log("");
  } catch (e) {
    console.error("\n✗ " + e.message + "\n");
    process.exit(1);
  }
})();
