// Colectarea listelor de transparență salarială (art. 33 din Legea 153/2017).
//
//   node scripts/colectare/art33/colecteaza.mjs [--surse=id1,id2] [--refa]
//
// Registrul: colectare/art33/surse.json (instituție, tip, județ, fișier, perioadă).
// Fișierele descărcate stau în .cercetare-privata/art33/ (nu intră în repo); amprenta
// sha256 intră. Observațiile — un rând pe post, doar meseriile din catalog — se scriu în
// colectare/art33/observatii/<id>.jsonl, iar raportul de citire în colectare/art33/raport.json:
// câte rânduri, câte valide, ce coloane n-au fost recunoscute (de verificat de om).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { citestePdf, randValid, fisierAcceptat } from "./citeste.mjs";
import { meserie, studii } from "./functii.mjs";

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}`))?.split("=")[1] ?? (process.argv.includes(`--${k}`) ? true : null);
const REG = "colectare/art33/surse.json";
const CACHE = ".cercetare-privata/art33";
const OBS = "colectare/art33/observatii";
const RAPORT = "colectare/art33/raport.json";
// Gradația scrisă în textul funcției („Asistent medical licențiat pr. Gradatia 5”, Iași), când
// lista n-o are într-o coloană proprie.
const gradatieDinText = (t) => { const m = String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").match(/\bgradatia\s*([0-5])\b/i); return m ? Number(m[1]) : null; };

async function descarca(url) {
  fs.mkdirSync(CACHE, { recursive: true });
  const fisier = path.join(CACHE, crypto.createHash("sha1").update(url).digest("hex").slice(0, 16) + path.extname(new URL(url).pathname).toLowerCase());
  if (!fs.existsSync(fisier)) {
    const r = await fetch(url, { headers: { "user-agent": "salariile.ro colectare (https://salariile.ro/metodologie)" }, signal: AbortSignal.timeout(120_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    fs.writeFileSync(fisier, Buffer.from(await r.arrayBuffer()));
    await new Promise((res) => setTimeout(res, 1500));
  }
  const date = fs.readFileSync(fisier);
  return { fisier, sha256: crypto.createHash("sha256").update(date).digest("hex"), bytes: date.length };
}

async function main() {
  const reg = JSON.parse(fs.readFileSync(REG, "utf8"));
  const doar = typeof arg("surse") === "string" ? arg("surse").split(",") : null;
  const raport = fs.existsSync(RAPORT) ? JSON.parse(fs.readFileSync(RAPORT, "utf8")) : {};
  fs.mkdirSync(OBS, { recursive: true });
  for (const s of reg.surse) {
    if (!s.fisier || (doar && !doar.includes(s.id))) continue;
    if (!/\.(pdf|xlsx)$/i.test(new URL(s.fisier).pathname)) { raport[s.id] = { ...raport[s.id], stare: "format neacceptat încă (PDF și XLSX)" }; continue; }
    const out = path.join(OBS, `${s.id}.jsonl`);
    // Se recitește când instituția a publicat alt fișier (martie, septembrie), nu doar când lipsește.
    if (fs.existsSync(out) && !arg("refa") && raport[s.id]?.fisier === s.fisier) continue;
    try {
      const d = await descarca(s.fisier);
      const potrivire = (t) => meserie(t, s.tip) !== null;
      let citit = await citestePdf(d.fisier, { potrivire });
      // Lista scanată (fără text): OCR-ul din Windows (ocr.ps1), cu rezultatul păstrat lângă PDF.
      // Pe alt sistem, sau fără OCR, rămâne „fără rânduri”.
      let ocr = false;
      if (!citit.randuri.length && /\.pdf$/i.test(d.fisier) && process.platform === "win32") {
        const json = d.fisier.replace(/\.pdf$/i, ".ocr.json");
        if (!fs.existsSync(json)) execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "scripts/colectare/art33/ocr.ps1", "-Pdf", d.fisier, "-Out", json], { stdio: "inherit" });
        citit = await citestePdf(json, { potrivire });
        ocr = true;
      }
      const { randuri, coloane, perioadaDocument } = citit;
      // Fără rânduri, observațiile vechi ale sursei nu mai sunt adevărate: se șterg.
      if (!randuri.length) fs.rmSync(out, { force: true });
      if (!randuri.length) { raport[s.id] = { stare: ocr ? "fără rânduri verificabile după OCR" : "fără rânduri (scanat sau alt format)", sha256: d.sha256 }; continue; }
      // Luna datelor se ia din document („Luna: August 2025”), nu din numele fișierului:
      // Buzău a publicat „februarie 2026” cu datele din august 2025.
      const perioada = perioadaDocument ?? s.perioada;
      const respins = fisierAcceptat(randuri);
      const obs = randuri.map((r) => ({
        sursa: s.id, judet: s.judet, tip: s.tip, perioada,
        meserie: meserie(r.text, s.tip), studii: studii(r.text), gradatie: r.gradatie ?? gradatieDinText(r.text),
        text: r.text.slice(0, 160), baza: r.baza, sporFix: r.sporFix, variabil: r.variabil, hrana: r.hrana,
        invalid: randValid(r),
      }));
      fs.writeFileSync(out, obs.map((o) => JSON.stringify(o)).join("\n") + "\n");
      const peMeserie = {};
      for (const o of obs) peMeserie[o.meserie] = (peMeserie[o.meserie] ?? 0) + 1;
      raport[s.id] = {
        stare: respins ? `de verificat: ${respins}` : "acceptat", fisier: s.fisier, perioada, sha256: d.sha256, bytes: d.bytes, cititLa: new Date().toISOString().slice(0, 10),
        randuri: obs.length, valide: obs.filter((o) => !o.invalid).length, peMeserie,
        ...(ocr ? { ocr: true, respinseOcr: citit.respinseOcr } : {}),
        coloaneNecunoscute: coloane.filter((c) => c.tip === "necunoscut" && c.n > 5 && c.eticheta).map((c) => c.eticheta.slice(0, 100)),
      };
      console.log(`${s.id}: ${obs.length} rânduri, ${raport[s.id].valide} valide`, peMeserie);
    } catch (e) {
      raport[s.id] = { stare: `eroare: ${e.message}` };
      console.log(`${s.id}: ${e.message}`);
    }
  }
  fs.writeFileSync(RAPORT, JSON.stringify(raport, null, 1));
}

main().catch((e) => { console.error(e); process.exit(1); });
