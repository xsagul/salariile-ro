// Anunță la Google (Indexing API) anunțurile publicate care n-au trecut prin formular: cele de dinainte
// de 3 octombrie 2026 și importurile ANOFM. Cele noi din formular le anunță Worker-ul (worker/google.ts).
//
//   node scripts/anunturi/indexare-google.mjs            # cel mult 150 pe rulare
//   node scripts/anunturi/indexare-google.mjs --max 50
//   node scripts/anunturi/indexare-google.mjs --proba    # arată ce ar trimite, fără să trimită
//
// Cota Google: 200 de notificări pe zi pe proiect; 150 lasă loc formularului. Se rulează zilnic până
// spune „nimic de trimis” și după fiecare import ANOFM. Numai paginile cu JobPosting (Google nu
// permite API-ul pentru altele). Ce s-a trimis stă în .gsc/indexare-google.json (nu e în Git).
import fs from "node:fs";
import crypto from "node:crypto";

const SITE = "https://salariile.ro";
const STARE = ".gsc/indexare-google.json";
const argv = process.argv.slice(2);
const max = Number(argv[argv.indexOf("--max") + 1]) || 150;
const proba = argv.includes("--proba");

const trimise = fs.existsSync(STARE) ? JSON.parse(fs.readFileSync(STARE, "utf8")) : {};
const salveaza = () => { fs.mkdirSync(".gsc", { recursive: true }); fs.writeFileSync(STARE, JSON.stringify(trimise, null, 1)); };

async function tokenAcces() {
  const cheie = JSON.parse(fs.readFileSync(process.env.GSC_KEY_FILE || "gsc-key.json", "utf8"));
  const b = (s) => Buffer.from(s).toString("base64url");
  const t = Math.floor(Date.now() / 1000);
  const nesemnat = `${b(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b(JSON.stringify({ iss: cheie.client_email, scope: "https://www.googleapis.com/auth/indexing", aud: "https://oauth2.googleapis.com/token", iat: t, exp: t + 3600 }))}`;
  const semn = crypto.sign("RSA-SHA256", Buffer.from(nesemnat), cheie.private_key).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${nesemnat}.${semn}` }) });
  if (!r.ok) throw new Error(`token ${r.status}: ${await r.text()}`);
  return (await r.json()).access_token;
}

const harta = await (await fetch(`${SITE}/locuri-de-munca/sitemap.xml`)).text();
const anunturi = [...harta.matchAll(/<loc>([^<]*\/anunt-angajare-[^<]*)<\/loc>/g)].map((m) => m[1]).filter((u) => !trimise[u]);
console.log(`${anunturi.length} anunțuri active netrimise încă; caut JobPosting, trimit cel mult ${max}.`);

const acces = proba ? null : await tokenAcces();
let n = 0, faraFirma = 0;
for (const url of anunturi) {
  if (n >= max) break;
  const html = await (await fetch(url)).text();
  if (!html.includes('"@type":"JobPosting"')) { faraFirma++; continue; }
  if (proba) { console.log("  ", url); n++; continue; }
  const r = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST", headers: { authorization: `Bearer ${acces}`, "content-type": "application/json" }, body: JSON.stringify({ url, type: "URL_UPDATED" }),
  });
  if (!r.ok) {
    console.error(`Oprit la ${url}: ${r.status} ${(await r.text()).slice(0, 400)}`);
    break;
  }
  trimise[url] = new Date().toISOString();
  n++;
}
if (!proba) salveaza();
console.log(`${proba ? "De trimis" : "Trimise"}: ${n}. Fără JobPosting, sărite: ${faraFirma}.`);
