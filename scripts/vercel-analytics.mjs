#!/usr/bin/env node
// Raport local din Vercel Web Analytics, prin sesiunea autentificată Vercel CLI.
//
// Folosire:
//   npm run vercel:analytics
//   npm run vercel:analytics -- --days=7 --limit=15
//   npm run vercel:analytics -- --days=28 --json

import { execFile, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const PROJECT_FILE = path.join(ROOT, ".vercel", "project.json");

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
  const json = process.argv.includes("--json");
  const cli = findVercelCli();
  const project = readProject();
  const until = Date.now();
  const since = until - days * 24 * 60 * 60 * 1000;
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
    ["daily", "day"],
  ];
  const reports = {};

  for (const [name, by] of dimensions) {
    reports[name] = await vercelApi(cli, "/v1/query/web-analytics/visits/aggregate", {
      ...common,
      by,
      limit: String(limit),
    });
  }

  const result = {
    project: project.projectName || project.projectId,
    requestedDays: days,
    interval: count.query,
    totals: count.data,
    reports: Object.fromEntries(
      Object.entries(reports).map(([name, report]) => [name, report.data]),
    ),
  };

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
