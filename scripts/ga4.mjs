#!/usr/bin/env node
// scripts/ga4.mjs
// Audit de CONFIGURARE pentru Google Analytics 4, zero dependențe.
//
// De ce există: întrebarea „e GA4 setat la maxim pentru ce vrem să aflăm?” se
// răspunde cu dovezi, nu din memorie. Scriptul citește setările reale prin
// Analytics Admin API și le compară cu ce cere produsul. Nu citește trafic și
// nu scrie nimic: scope-ul e `analytics.readonly`.
//
// Folosire:
//   node scripts/ga4.mjs login       # o singură dată, consimțământ OAuth
//   node scripts/ga4.mjs properties  # ce proprietăți GA4 vede contul
//   node scripts/ga4.mjs audit       # verdictul pe setări
//   node scripts/ga4.mjs audit --property=123456789
//   node scripts/ga4.mjs audit --json
//
// Refolosește ./.gsc/oauth-client.json (același client „Desktop app” ca la GSC).
// Tokenul GA4 e separat, în ./.gsc/ga4-token.json, fiindcă scope-ul diferă.
// Ambele sunt gitignored prin /.gsc/.

import fs from "node:fs";
import http from "node:http";
import crypto from "node:crypto";
import { exec } from "node:child_process";

const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const CLIENT_FILE = "./.gsc/oauth-client.json";
const TOKEN_FILE = "./.gsc/ga4-token.json";
const ADMIN = "https://analyticsadmin.googleapis.com";

const argv = process.argv.slice(2);
const cmd = argv.find((a) => !a.startsWith("--")) || "audit";
const opt = Object.fromEntries(
  argv
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...rest] = a.slice(2).split("=");
      return [k, rest.length ? rest.join("=") : true];
    }),
);

// ── OAuth ────────────────────────────────────────────────────────────────────

function citesteClient() {
  try {
    return JSON.parse(fs.readFileSync(CLIENT_FILE, "utf8"));
  } catch {
    console.error(
      `\n✗ Lipsește ${CLIENT_FILE} cu { "client_id": "...", "client_secret": "..." }\n` +
        "  E același fișier folosit de scripts/gsc-login.mjs (OAuth client de tip „Desktop app”).\n",
    );
    process.exit(1);
  }
}

async function login() {
  const client = citesteClient();
  const PORT = 4572; // 4571 e al gsc-login.mjs; nu ne călcăm pe picioare
  const REDIRECT = `http://127.0.0.1:${PORT}`;
  const state = crypto.randomBytes(8).toString("hex");

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: client.client_id,
      redirect_uri: REDIRECT,
      response_type: "code",
      scope: SCOPE,
      access_type: "offline",
      prompt: "consent",
      state,
    });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, REDIRECT);
    const code = url.searchParams.get("code");
    if (!code) {
      res.writeHead(400).end("Lipsește codul.");
      return;
    }
    if (url.searchParams.get("state") !== state) {
      res.writeHead(400).end("State invalid.");
      server.close();
      process.exit(1);
    }
    try {
      const r = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: client.client_id,
          client_secret: client.client_secret,
          redirect_uri: REDIRECT,
          grant_type: "authorization_code",
        }),
      });
      const tokens = await r.json();
      if (!r.ok || !tokens.refresh_token) {
        res.writeHead(500).end("Eroare la token. Vezi terminalul.");
        console.error("\n✗ Eroare token:", JSON.stringify(tokens, null, 2), "\n");
        server.close();
        process.exit(1);
      }
      fs.writeFileSync(
        TOKEN_FILE,
        JSON.stringify(
          {
            refresh_token: tokens.refresh_token,
            client_id: client.client_id,
            client_secret: client.client_secret,
          },
          null,
          2,
        ),
      );
      res
        .writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
        .end("<h2>✓ Autentificare reușită!</h2><p>Închide fila și întoarce-te în terminal.</p>");
      console.log(`\n✓ Token salvat în ${TOKEN_FILE} — rulează \`npm run ga4\`.\n`);
      server.close();
      process.exit(0);
    } catch (e) {
      res.writeHead(500).end("Eroare. Vezi terminalul.");
      console.error("\n✗ " + e.message + "\n");
      server.close();
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    console.log("\nDeschid browserul pentru autentificare Google (scope: analytics.readonly)...");
    console.log("Dacă nu se deschide singur, copiază adresa:\n\n" + authUrl + "\n");
    const c =
      process.platform === "win32"
        ? `start "" "${authUrl}"`
        : process.platform === "darwin"
          ? `open "${authUrl}"`
          : `xdg-open "${authUrl}"`;
    exec(c, () => {});
  });
}

async function accessToken() {
  let t;
  try {
    t = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));
  } catch {
    console.error(`\n✗ Lipsește ${TOKEN_FILE}. Rulează întâi: node scripts/ga4.mjs login\n`);
    process.exit(1);
  }
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: t.client_id,
      client_secret: t.client_secret,
      refresh_token: t.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!r.ok) {
    console.error("\n✗ Refresh token respins: " + (await r.text()) + "\n");
    process.exit(1);
  }
  return (await r.json()).access_token;
}

// GET tolerant: un endpoint care nu există pe versiunea asta de API sau la care
// contul n-are drepturi întoarce motivul, nu oprește auditul.
async function get(token, cale) {
  try {
    const r = await fetch(`${ADMIN}/${cale}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return { _eroare: `HTTP ${r.status}`, _detaliu: (await r.text()).slice(0, 300) };
    return await r.json();
  } catch (e) {
    return { _eroare: e.message };
  }
}

// ── prezentare ───────────────────────────────────────────────────────────────

const OK = "✓";
const RAU = "✗";
const NEUTRU = "·";

const randuri = [];
const probleme = [];

function verdict(semn, eticheta, valoare, explicatie) {
  randuri.push(`  ${semn} ${eticheta.padEnd(32)} ${valoare}`);
  if (semn === RAU) probleme.push({ eticheta, valoare, explicatie });
  if (explicatie && semn !== OK) randuri.push(`      └─ ${explicatie}`);
}

// ── comenzi ──────────────────────────────────────────────────────────────────

async function listeazaProprietati(token) {
  const r = await get(token, "v1beta/accountSummaries");
  if (r._eroare) {
    console.error(`\n✗ Nu pot citi conturile: ${r._eroare}\n${r._detaliu || ""}\n`);
    process.exit(1);
  }
  const proprietati = [];
  for (const cont of r.accountSummaries || []) {
    for (const p of cont.propertySummaries || []) {
      proprietati.push({
        id: p.property.split("/")[1],
        nume: p.displayName,
        cont: cont.displayName,
      });
    }
  }
  return proprietati;
}

async function audit() {
  const token = await accessToken();
  const proprietati = await listeazaProprietati(token);

  if (!proprietati.length) {
    console.error("\n✗ Contul nu vede nicio proprietate GA4.\n");
    process.exit(1);
  }

  let id = opt.property;
  if (!id) {
    if (proprietati.length > 1) {
      console.error("\n✗ Mai multe proprietăți. Alege una cu --property=<id>:\n");
      for (const p of proprietati) console.error(`    ${p.id}  ${p.nume}  (${p.cont})`);
      console.error("");
      process.exit(1);
    }
    id = proprietati[0].id;
  }
  const aleasa = proprietati.find((p) => p.id === String(id)) || { id, nume: "(necunoscută)" };

  const [prop, retentie, fluxuri, evenimenteCheie, dimensiuni, metrici, signals, bigQuery, atribuire, adsLinks] =
    await Promise.all([
      get(token, `v1beta/properties/${id}`),
      get(token, `v1beta/properties/${id}/dataRetentionSettings`),
      get(token, `v1beta/properties/${id}/dataStreams`),
      get(token, `v1beta/properties/${id}/keyEvents`),
      get(token, `v1beta/properties/${id}/customDimensions`),
      get(token, `v1beta/properties/${id}/customMetrics`),
      get(token, `v1alpha/properties/${id}/googleSignalsSettings`),
      get(token, `v1beta/properties/${id}/bigQueryLinks`),
      get(token, `v1alpha/properties/${id}/attributionSettings`),
      get(token, `v1beta/properties/${id}/googleAdsLinks`),
    ]);

  const fluxuriWeb = (fluxuri.dataStreams || []).filter((f) => f.type === "WEB_DATA_STREAM");
  const imbunatatita = {};
  for (const f of fluxuriWeb) {
    const sid = f.name.split("/").pop();
    imbunatatita[sid] = await get(token, `v1alpha/properties/${id}/dataStreams/${sid}/enhancedMeasurementSettings`);
  }

  if (opt.json) {
    console.log(
      JSON.stringify(
        { proprietate: prop, retentie, fluxuri, imbunatatita, evenimenteCheie, dimensiuni, metrici, signals, bigQuery, atribuire, adsLinks },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`\n  GA4 — ${aleasa.nume} (${id})`);
  console.log(`  ${"─".repeat(60)}\n`);

  // 1. Retenția: default 2 luni, maxim 14 pe gratuit, NU e retroactivă.
  const r = retentie.eventDataRetention;
  verdict(
    r === "FOURTEEN_MONTHS" || r === "TWENTY_SIX_MONTHS" || r === "THIRTY_EIGHT_MONTHS" || r === "FIFTY_MONTHS"
      ? OK
      : RAU,
    "Retenție date la nivel de eveniment",
    r || retentie._eroare || "?",
    "Implicit sunt 2 luni. Peste 60 de zile, Explorations (pâlnii, drumuri, segmente) rămân goale. " +
      "Nu e retroactiv: ce s-a șters nu se mai recuperează. Admin → Data settings → Data retention → 14 luni.",
  );
  verdict(
    retentie.resetUserDataOnNewActivity === false ? OK : NEUTRU,
    "Reset la activitate nouă",
    String(retentie.resetUserDataOnNewActivity ?? "?"),
    "Pe „true” fereastra se prelungește pentru vizitatorii care revin. Nu e greșit, doar de știut.",
  );

  // 2. Fluxuri web + măsurarea îmbunătățită.
  verdict(fluxuriWeb.length ? OK : RAU, "Fluxuri web", String(fluxuriWeb.length));
  for (const f of fluxuriWeb) {
    const sid = f.name.split("/").pop();
    const e = imbunatatita[sid] || {};
    console.log(`\n    Flux „${f.displayName}” — ${f.webStreamData?.measurementId || "?"} → ${f.webStreamData?.defaultUri || "?"}\n`);

    if (e._eroare) {
      verdict(RAU, "Măsurare îmbunătățită", e._eroare, e._detaliu || "");
      continue;
    }
    verdict(e.streamEnabled ? OK : RAU, "Măsurare îmbunătățită", String(!!e.streamEnabled));

    // Critic pentru salariile.ro: site-ul e Next.js cu navigare client-side.
    // Fără asta, GA4 numără o singură pagină pe vizită, oricâte ai deschide.
    verdict(
      e.pageChangesEnabled ? OK : RAU,
      "Schimbări de pagină (history)",
      String(!!e.pageChangesEnabled),
      "Site-ul e Next.js cu navigare client-side: fără asta GA4 înregistrează DOAR prima pagină din vizită. " +
        "Tot ce înseamnă „ce fac userii pe site” devine nemăsurabil.",
    );

    verdict(
      e.siteSearchEnabled ? OK : RAU,
      "Căutare internă",
      String(!!e.siteSearchEnabled) + (e.searchQueryParameter ? ` (param: ${e.searchQueryParameter})` : ""),
      "GA4 citește termenul dintr-un parametru din URL. Căutarea de meserii e pur client-side și nu atinge " +
        "URL-ul, deci setarea asta nu prinde nimic fără o schimbare în cod.",
    );
    verdict(e.scrollsEnabled ? OK : RAU, "Scroll", String(!!e.scrollsEnabled), "Un singur prag, 90%.");
    verdict(e.outboundClicksEnabled ? OK : RAU, "Clickuri externe", String(!!e.outboundClicksEnabled));
    verdict(e.fileDownloadsEnabled ? OK : RAU, "Descărcări fișiere", String(!!e.fileDownloadsEnabled));
    verdict(e.formInteractionsEnabled ? OK : RAU, "Interacțiuni cu formulare", String(!!e.formInteractionsEnabled));
    verdict(e.videoEngagementEnabled ? OK : NEUTRU, "Video", String(!!e.videoEngagementEnabled), "Irelevant: nu avem video.");
    console.log("");
  }

  // 3. Evenimente-cheie, dimensiuni, metrici.
  const nrChei = (evenimenteCheie.keyEvents || []).length;
  verdict(
    nrChei ? OK : RAU,
    "Evenimente-cheie (conversii)",
    String(nrChei),
    "Fără ele, GA4 nu știe ce înseamnă „reușită” pe site. Minim: un calcul de salariu dus la capăt.",
  );
  for (const k of evenimenteCheie.keyEvents || []) console.log(`      ${NEUTRU} ${k.eventName}`);

  const nrDim = (dimensiuni.customDimensions || []).length;
  verdict(
    nrDim ? OK : RAU,
    "Dimensiuni personalizate",
    String(nrDim),
    "Parametrii trimiși cu evenimentele NU apar în rapoarte până nu sunt înregistrați aici. " +
      "Un eveniment cu parametrul „meserie” rămâne invizibil altfel.",
  );
  for (const d of dimensiuni.customDimensions || [])
    console.log(`      ${NEUTRU} ${d.parameterName} → ${d.displayName} (${d.scope})`);

  const nrMet = (metrici.customMetrics || []).length;
  verdict(nrMet ? OK : NEUTRU, "Metrici personalizate", String(nrMet));

  // 4. Legături și confidențialitate.
  verdict(
    signals.state === "GOOGLE_SIGNALS_ENABLED" ? NEUTRU : OK,
    "Google Signals",
    signals.state || signals._eroare || "?",
    "Pe „enabled” adaugă date demografice, dar înseamnă prelucrare pe bază de consimțământ, " +
      "din conturi Google. Pentru un site care își face din confidențialitate un argument, e o decizie, nu un default.",
  );
  verdict(
    (bigQuery.bigqueryLinks || []).length ? OK : NEUTRU,
    "Export BigQuery",
    String((bigQuery.bigqueryLinks || []).length),
    "Singura cale de a scoate datele brute, la nivel de eveniment, fără samplingul din Explorations. " +
      "Are nivel gratuit. Fără el, la 14 luni datele dispar definitiv.",
  );
  verdict((adsLinks.googleAdsLinks || []).length ? NEUTRU : NEUTRU, "Legături Google Ads", String((adsLinks.googleAdsLinks || []).length));
  verdict(
    atribuire.reportingAttributionModel ? NEUTRU : NEUTRU,
    "Model de atribuire",
    atribuire.reportingAttributionModel || atribuire._eroare || "?",
  );

  console.log(randuri.join("\n"));

  console.log(`\n  ${"─".repeat(60)}`);
  if (probleme.length) {
    console.log(`\n  ${probleme.length} lucruri de reparat, în ordinea impactului:\n`);
    probleme.forEach((p, i) => console.log(`   ${i + 1}. ${p.eticheta} — acum: ${p.valoare}`));
  } else {
    console.log("\n  Nimic de reparat pe setările verificate.");
  }
  console.log("");
}

// ── dispecer ─────────────────────────────────────────────────────────────────

if (cmd === "login") {
  await login();
} else if (cmd === "properties") {
  const proprietati = await listeazaProprietati(await accessToken());
  console.log("");
  for (const p of proprietati) console.log(`  ${p.id}  ${p.nume}  (${p.cont})`);
  console.log("");
} else if (cmd === "audit") {
  await audit();
} else {
  console.error(`\n✗ Comandă necunoscută: ${cmd}. Folosește: login | properties | audit\n`);
  process.exit(1);
}
