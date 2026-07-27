#!/usr/bin/env node
// Snapshot SEO săptămânal: compară două ferestre complete de 28 de zile și
// grupează interogările după intențiile urmărite în roadmap.
//
// Folosire:
//   npm run gsc:weekly
//   npm run gsc:weekly -- --end=2026-07-24
//   npm run gsc:weekly -- --out=reports/gsc-weekly-2026-07-24.md

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const GSC_SCRIPT = path.join(SCRIPT_DIR, "gsc.mjs");
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith("--"))
    .map((arg) => {
      const [key, ...value] = arg.slice(2).split("=");
      return [key, value.length ? value.join("=") : true];
    }),
);

function iso(date) {
  return date.toISOString().slice(0, 10);
}

function shift(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return iso(date);
}

function runGsc(command, options = {}) {
  const cli = [GSC_SCRIPT, command, "--json"];
  for (const [key, value] of Object.entries(options)) {
    cli.push(`--${key}=${value}`);
  }

  const output = execFileSync(process.execPath, cli, {
    cwd: path.resolve(SCRIPT_DIR, ".."),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(output);
}

function latestAvailableDate() {
  const result = runGsc("dates", { days: 10, limit: 20 });
  const dates = (result.rows || []).map((row) => row.keys[0]).sort();
  if (!dates.length) throw new Error("GSC nu a returnat zile disponibile în ultimele 10 zile.");
  return dates.at(-1);
}

function metrics(rows) {
  const total = (rows || []).reduce(
    (acc, row) => {
      acc.clicks += row.clicks;
      acc.impressions += row.impressions;
      acc.positionWeight += row.position * row.impressions;
      return acc;
    },
    { clicks: 0, impressions: 0, positionWeight: 0 },
  );
  return {
    clicks: total.clicks,
    impressions: total.impressions,
    ctr: total.impressions ? total.clicks / total.impressions : 0,
    position: total.impressions ? total.positionWeight / total.impressions : 0,
  };
}

function pct(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function number(value) {
  return new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(value);
}

function position(value) {
  return value ? value.toFixed(2) : "—";
}

function delta(current, previous) {
  if (!previous) return "—";
  const value = ((current - previous) / previous) * 100;
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function clusterRows(rows, predicate) {
  return metrics(rows.filter((row) => predicate(row.keys[0].toLocaleLowerCase("ro-RO"))));
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|");
}

try {
  const end = String(args.end || latestAvailableDate());
  const currentStart = shift(end, -27);
  const previousEnd = shift(currentStart, -1);
  const previousStart = shift(previousEnd, -27);

  const currentDates = runGsc("dates", { start: currentStart, end, limit: 100 });
  const previousDates = runGsc("dates", { start: previousStart, end: previousEnd, limit: 100 });
  const currentPages = runGsc("pages", { start: currentStart, end, limit: 25_000 });
  const currentQueries = runGsc("queries", { start: currentStart, end, limit: 25_000 });

  const current = metrics(currentDates.rows || []);
  const previous = metrics(previousDates.rows || []);
  const queryRows = currentQueries.rows || [];
  const clusters = [
    {
      name: "Calculator generic",
      value: clusterRows(queryRows, (query) =>
        /calculator salari|calcul salari|salariu net|salariu brut/.test(query),
      ),
    },
    {
      name: "Salariu minim construcții",
      value: clusterRows(queryRows, (query) => /construct/.test(query)),
    },
    {
      name: "PFA",
      value: clusterRows(queryRows, (query) => /\bpfa\b|persoan[aă] fizic[aă] autorizat/.test(query)),
    },
    {
      name: "Brand salariile.ro",
      value: clusterRows(queryRows, (query) => /salariile[ .-]*ro/.test(query)),
    },
  ];

  const lines = [
    "# Snapshot GSC săptămânal",
    "",
    `Generat: ${iso(new Date())}  `,
    `Ultima zi cu date GSC: ${end}  `,
    `Fereastră curentă: ${currentStart} – ${end}  `,
    `Fereastră precedentă: ${previousStart} – ${previousEnd}`,
    "",
    "## Rezumat 28 vs 28 zile",
    "",
    "| Metrică | Curent | Precedent | Variație |",
    "|---|---:|---:|---:|",
    `| Clickuri | ${number(current.clicks)} | ${number(previous.clicks)} | ${delta(current.clicks, previous.clicks)} |`,
    `| Impresii | ${number(current.impressions)} | ${number(previous.impressions)} | ${delta(current.impressions, previous.impressions)} |`,
    `| CTR | ${pct(current.ctr)} | ${pct(previous.ctr)} | ${delta(current.ctr, previous.ctr)} |`,
    `| Poziție medie ponderată | ${position(current.position)} | ${position(previous.position)} | ${current.position && previous.position ? (current.position - previous.position).toFixed(2) : "—"} |`,
    "",
    "## Clustere de interogări",
    "",
    "Datele pe interogări exclud interogările anonimizate de Google și nu trebuie confundate cu totalul proprietății.",
    "",
    "| Cluster | Clickuri | Impresii | CTR | Poziție |",
    "|---|---:|---:|---:|---:|",
    ...clusters.map(
      ({ name, value }) =>
        `| ${name} | ${number(value.clicks)} | ${number(value.impressions)} | ${pct(value.ctr)} | ${position(value.position)} |`,
    ),
    "",
    "## Top pagini",
    "",
    "| URL | Clickuri | Impresii | CTR | Poziție |",
    "|---|---:|---:|---:|---:|",
    ...(currentPages.rows || []).slice(0, 15).map((row) => {
      const page = new URL(row.keys[0]).pathname;
      return `| ${escapeCell(page)} | ${number(row.clicks)} | ${number(row.impressions)} | ${pct(row.ctr)} | ${position(row.position)} |`;
    }),
    "",
    "## Semnale de urmărit",
    "",
    `- CTR total: ${current.ctr < 0.015 ? "sub 1,5%; optimizarea snippetului rămâne prioritară" : "cel puțin 1,5%; păstrăm testul și verificăm distribuția pe query-uri"}.`,
    `- Cluster generic: ${clusters[0].value.ctr < 0.015 ? "sub ținta intermediară de 1,5% CTR" : "la sau peste ținta intermediară de 1,5% CTR"}.`,
    `- Cerere construcții: ${number(clusters[1].value.impressions)} impresii în fereastra curentă.`,
    `- Cerere de brand: ${number(clusters[3].value.impressions)} impresii; autoritatea și distribuția rămân măsurabile separat de on-page.`,
    "",
  ];

  const report = lines.join("\n");
  if (args.out) {
    const outputPath = path.resolve(String(args.out));
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report, "utf8");
    console.log(`Snapshot scris: ${outputPath}`);
  } else {
    console.log(report);
  }
} catch (error) {
  console.error(`\n✗ ${error.message}\n`);
  process.exit(1);
}
