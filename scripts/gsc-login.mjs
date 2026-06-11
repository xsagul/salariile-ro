#!/usr/bin/env node
// scripts/gsc-login.mjs
// Login OAuth o singură dată pentru Google Search Console (Plan B — ocolește service account).
// Zero dependențe. Pornește un server loopback local, deschide browserul pentru consimțământ,
// salvează refresh_token în .gsc/oauth-token.json (gitignored).
//
// Necesită: .gsc/oauth-client.json  cu { "client_id": "...", "client_secret": "..." }
// (de la un OAuth client de tip „Desktop app" din Google Cloud Console).
//
// Rulează o dată:  node scripts/gsc-login.mjs

import fs from "node:fs";
import http from "node:http";
import crypto from "node:crypto";
import { exec } from "node:child_process";

// Scope read/write: tot ce expune API-ul Search Console (date + inspecție + sitemap submit/delete).
const SCOPE = "https://www.googleapis.com/auth/webmasters";

let client;
try {
  client = JSON.parse(fs.readFileSync("./.gsc/oauth-client.json", "utf8"));
} catch {
  console.error(
    '\n✗ Lipsește ./.gsc/oauth-client.json cu { "client_id": "...", "client_secret": "..." }\n',
  );
  process.exit(1);
}

const PORT = 4571;
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
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
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
    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.refresh_token) {
      res.writeHead(500).end("Eroare la token. Vezi terminalul.");
      console.error("\n✗ Eroare token:", JSON.stringify(tokens, null, 2), "\n");
      server.close();
      process.exit(1);
    }
    fs.writeFileSync(
      "./.gsc/oauth-token.json",
      JSON.stringify(
        { refresh_token: tokens.refresh_token, client_id: client.client_id, client_secret: client.client_secret },
        null,
        2,
      ),
    );
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(
      "<h2>✓ Autentificare reușită!</h2><p>Poți închide această filă și te întorci în terminal.</p>",
    );
    console.log("\n✓ Token salvat în .gsc/oauth-token.json — gata! Rulează `npm run gsc -- queries`.\n");
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
  console.log("\nDeschid browserul pentru autentificare Google...");
  console.log("Dacă nu se deschide singur, copiază adresa asta în browser:\n");
  console.log(authUrl + "\n");
  // Deschide browserul (Windows: start; mac: open; linux: xdg-open)
  const cmd =
    process.platform === "win32"
      ? `start "" "${authUrl}"`
      : process.platform === "darwin"
        ? `open "${authUrl}"`
        : `xdg-open "${authUrl}"`;
  exec(cmd, () => {});
});
