#!/usr/bin/env node
// Raport local din Vercel Web Analytics, prin sesiunea autentificată Vercel CLI.
//
// Folosire:
//   npm run vercel:analytics
//   npm run vercel:analytics -- --days=7 --limit=15
//   npm run vercel:analytics -- --days=28 --json
//   npm run vercel:analytics -- --start=2026-07-27 --end=2026-08-23
//   npm run vercel:snapshot

import { execFile, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const PROJECT_FILE = path.join(ROOT, ".vercel", "project.json");
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAILY_BUCKETS = 100;

function option(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

function integerOption(name, fallback, min, max) {
  const value = Number(option(name, fallback));
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`--${name} trebuie să fie un număr întreg între ${min} și ${max}.`);
  }
  return value;
}

function parseIsoDateOption(name, value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`--${name} trebuie să aibă formatul YYYY-MM-DD.`);
  }
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new Error(`--${name} nu este o dată calendaristică validă.`);
  }
  return timestamp;
}

function findVercelCli() {
  const candidates = [];

  if (process.platform === "win32" && process.env.APPDATA) {
    candidates.push(
      path.join(process.env.APPDATA, "npm", "node_modules", "vercel", "dist", "vc.js"),
    );
  }

  try {
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const globalRoot = execFileSync(npm, ["root", "--global"], {
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    candidates.push(path.join(globalRoot, "vercel", "dist", "vc.js"));
  } catch {
    // Mesajul final de mai jos explică instalarea necesară.
  }

  const cli = candidates.find((candidate) => candidate && fs.existsSync(candidate));
  if (!cli) {
    throw new Error("Vercel CLI nu este instalat. Rulează: npm install --global vercel");
  }
  return cli;
}

function readProject() {
  if (!fs.existsSync(PROJECT_FILE)) {
    throw new Error("Proiectul nu este legat la Vercel. Rulează: vercel link");
  }

  const project = JSON.parse(fs.readFileSync(PROJECT_FILE, "utf8"));
  if (!project.projectId || !project.orgId) {
    throw new Error("Fișierul .vercel/project.json nu conține projectId și orgId.");
  }
  return project;
}

async function vercelApi(cli, route, params) {
  const query = new URLSearchParams(params).toString();
  const endpoint = `${route}?${query}`;

  try {
    const { stdout } = await execFileAsync(
      process.execPath,
      [cli, "api", endpoint, "--raw"],
      { cwd: ROOT, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
    );
    return JSON.parse(stdout);
  } catch (error) {
    const detail = error?.stdout || error?.stderr || error?.message || String(error);
    throw new Error(`Vercel API a eșuat: ${String(detail).trim()}`);
  }
}

async function dailyReport(cli, common, since, until) {
  const rowsByTimestamp = new Map();
  let chunkStart = since;

  while (chunkStart <= until) {
    const startDate = new Date(chunkStart);
    const startOfUtcDay = Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
    );
    // Cel mult 100 de date calendaristice pe apel, limita endpointului.
    const chunkEnd = Math.min(until, startOfUtcDay + MAX_DAILY_BUCKETS * DAY_MS - 1);
    const report = await vercelApi(cli, "/v1/query/web-analytics/visits/aggregate", {
      ...common,
      since: String(chunkStart),
      until: String(chunkEnd),
      by: "day",
      limit: String(MAX_DAILY_BUCKETS),
    });
    for (const row of report.data ?? []) {
      rowsByTimestamp.set(row.timestamp, row);
    }
    chunkStart = chunkEnd + 1;
  }

  return {
    data: [...rowsByTimestamp.values()].sort(
      (left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp),
    ),
  };
}

function number(value) {
  return Number(value || 0).toLocaleString("ro-RO");
}

function label(value, fallback = "(necunoscut)") {
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function table(rows, firstKey) {
  if (!rows.length) {
    console.log("  fără date");
    return;
  }

  const labels = rows.map((row) => {
    const value = label(row[firstKey]);
    return firstKey === "timestamp" ? value.slice(0, 10) : value;
  });
  const width = Math.min(60, Math.max(...labels.map((value) => value.length), 8));

  rows.forEach((row, index) => {
    const name = labels[index].slice(0, width).padEnd(width);
    console.log(
      `  ${name}  ${number(row.visitors).padStart(8)} vizitatori  ${number(row.pageviews).padStart(8)} afișări`,
    );
  });
}

async function main() {
  const days = integerOption("days", 28, 1, 365);
  const limit = integerOption("limit", 10, 1, 100);
  const startOption = option("start", "");
  const endOption = option("end", "");
  if (Boolean(startOption) !== Boolean(endOption)) {
    throw new Error("--start și --end trebuie folosite împreună.");
  }
  const json = process.argv.includes("--json");
  const snapshot = process.argv.includes("--snapshot");
  const outputOption = option("output", "");
  const cli = findVercelCli();
  const project = readProject();
  const now = Date.now();
  const generatedAt = new Date(now).toISOString();
  const since = startOption
    ? parseIsoDateOption("start", startOption)
    : now - days * DAY_MS;
  // `--end` este inclusiv pentru utilizator. API-ul Vercel tratează și `until`
  // inclusiv, deci trimitem ultima milisecundă UTC a zilei cerute; începutul
  // zilei următoare ar include încă un bucket zilnic.
  const until = endOption
    ? parseIsoDateOption("end", endOption) + DAY_MS - 1
    : now;
  if (since >= until) throw new Error("--start trebuie să fie anterior sau egal cu --end.");
  const requestedDays = startOption ? Math.ceil((until - since + 1) / DAY_MS) : days;
  const common = {
    projectId: project.projectId,
    teamId: project.orgId,
    since: String(since),
    until: String(until),
  };

  const count = await vercelApi(cli, "/v1/query/web-analytics/visits/count", common);
  const dimensions = [
    ["pages", "requestPath"],
    ["referrers", "referrerHostname"],
    ["countries", "country"],
    ["devices", "deviceType"],
  ];
  const reports = {};

  for (const [name, by] of dimensions) {
    reports[name] = await vercelApi(cli, "/v1/query/web-analytics/visits/aggregate", {
      ...common,
      by,
      limit: String(limit),
    });
  }
  // Endpointul acceptă cel mult 100 de bucketuri. Ferestrele mai lungi sunt
  // paginate pe date calendaristice și apoi reunite, fără truncare.
  reports.daily = await dailyReport(cli, common, since, until);

  const result = {
    project: project.projectName || project.projectId,
    generatedAt,
    requestedDays,
    requestedStart: startOption || null,
    requestedEnd: endOption || null,
    interval: count.query,
    totals: count.data,
    reports: Object.fromEntries(
      Object.entries(reports).map(([name, report]) => [name, report.data]),
    ),
  };

  const outputRelative = outputOption || (snapshot
    ? `seo-snapshots/vercel/${result.generatedAt.slice(0, 10)}.json`
    : "");
  if (outputRelative) {
    const outputPath = path.resolve(ROOT, outputRelative);
    const relativeToRoot = path.relative(ROOT, outputPath);
    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      throw new Error("Fișierul de ieșire trebuie să rămână în proiect.");
    }
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    if (!json) console.log(`Snapshot salvat: ${relativeToRoot}`);
  }

  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const visitors = Number(count.data?.visitors || 0);
  const pageviews = Number(count.data?.pageviews || 0);
  const viewsPerVisitor = visitors ? (pageviews / visitors).toFixed(2) : "0";

  console.log(`\nVercel Web Analytics — ${result.project}`);
  console.log(`Interval: ${count.query.since} → ${count.query.until}`);
  console.log(`Vizitatori: ${number(visitors)}  ·  Afișări: ${number(pageviews)}  ·  Afișări/vizitator: ${viewsPerVisitor}`);

  console.log("\nPagini principale");
  table(reports.pages.data, "requestPath");

  console.log("\nSurse de trafic");
  table(reports.referrers.data, "referrerHostname");

  console.log("\nȚări");
  table(reports.countries.data, "country");

  console.log("\nDispozitive");
  table(reports.devices.data, "deviceType");

  console.log("\nEvoluție zilnică");
  table(reports.daily.data, "timestamp");
  console.log("");
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}\n`);
  process.exit(1);
});
