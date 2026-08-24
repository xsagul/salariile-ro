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

/** Ziua in care paginile de meserie au trecut pe intervalul CAEN×ISCO. */
const ZIUA_INTERVALULUI = "2026-08-24";

/** „1 click", nu „1 clickuri". */
function clickuri(n) {
  return `${number(n)} ${n === 1 ? "click" : "clickuri"}`;
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

  // ─── Clusterul de meserii, urmarit pe pagini, nu pe interogari ─────────────
  //
  // Pe interogari nu se poate izola: „salariu asistent medical" si „calculator
  // salariu" cad amandoua in tipare largi. Pe pagini e curat, fiindca tot
  // clusterul sta sub /salarii si /compara.
  //
  // De ce e aici si nu intr-un script separat: pe 24 august 2026 paginile de
  // meserie au trecut de la media sectorului CAEN la un interval CAEN×ISCO,
  // pentru ca 55% dintre ele afisau aceeasi cifra ca alta meserie. Testul
  // falsificabil al schimbarii e mai jos si trebuie sa apara la fiecare rulare,
  // nu cand isi aminteste cineva de el.
  const paginiCluster = (currentPages.rows || []).filter((rand) =>
    /\/(salarii|compara)(\/|$)/.test(rand.keys?.[0] ?? ""),
  );
  const clusterMeserii = {
    clicks: paginiCluster.reduce((total, r) => total + (r.clicks || 0), 0),
    impressions: paginiCluster.reduce((total, r) => total + (r.impressions || 0), 0),
    pagini: paginiCluster.length,
  };
  clusterMeserii.ctr = clusterMeserii.impressions
    ? clusterMeserii.clicks / clusterMeserii.impressions
    : 0;

  const asistent = (currentPages.rows || []).find((r) =>
    (r.keys?.[0] ?? "").endsWith("/salarii/asistent-medical"),
  );

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
    "## Clusterul de meserii — testul intervalului",
    "",
    "Pe 24 august 2026, paginile de meserie au trecut de la media sectorului CAEN",
    "la un interval CAEN×ISCO, pentru că 68 din 123 (55%) afișau aceeași cifră ca",
    "altă meserie. Baseline-ul de dinainte, pe 7 zile: `/salarii/asistent-medical`",
    "avea **17 afișări și 0 clickuri** de pe pozițiile 4,5–6.",
    "",
    `- Cluster \`/salarii\` + \`/compara\`: **${clickuri(clusterMeserii.clicks)}** din ${number(clusterMeserii.impressions)} afișări (CTR ${pct(clusterMeserii.ctr)}), pe ${clusterMeserii.pagini} pagini cu date.`,
    asistent
      ? `- \`/salarii/asistent-medical\`: **${clickuri(asistent.clicks)}** din ${number(asistent.impressions)} afișări, poziția ${position(asistent.position)}.`
      : "- `/salarii/asistent-medical`: fără date în această fereastră.",
    // Verdictul se da NUMAI pe o fereastra care incepe dupa schimbare. Altfel
    // raportul ar judeca modificarea folosind zile in care ea inca nu exista pe
    // site — exact eroarea de atribuire pe care roadmap-ul o interzice.
    currentStart < ZIUA_INTERVALULUI
      ? `- Verdict: **nu se poate formula încă.** Fereastra începe pe ${currentStart}, înainte de schimbarea din ${ZIUA_INTERVALULUI}, deci conține zile în care paginile arătau încă media sectorului. Prima citire curată e după ${ZIUA_INTERVALULUI} + 28 de zile.`
      : !asistent || asistent.impressions < 15
        ? "- Verdict: încă nu se poate formula, afișările sunt prea puține față de baseline."
        : asistent.clicks === 0
          ? "- **Verdict: ipoteza e INFIRMATĂ.** Pagina are afișări comparabile cu baseline-ul și tot zero clickuri, deci cifra greșită nu era cauza. Caută altundeva: intenția interogării, SERP features sau titlul."
          : "- **Verdict: ipoteza ține.** Pagina a trecut de la zero clickuri; confirmă pe încă o fereastră înainte de a extinde modelul.",
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
