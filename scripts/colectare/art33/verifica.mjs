// Verificarea de om a unui fișier art. 33: coloanele recunoscute sau rândurile citite.
//   node scripts/colectare/art33/verifica.mjs <id> col        — etichetele și tipul fiecărei coloane
//   node scripts/colectare/art33/verifica.mjs <id> 0 10 50    — rândurile, sumă cu sumă
import { citestePdf } from "./citeste.mjs";
import { meserie } from "./functii.mjs";
import crypto from "node:crypto"; import fs from "node:fs"; import path from "node:path";
const reg = JSON.parse(fs.readFileSync("colectare/art33/surse.json", "utf8"));
const [id, ...idx] = process.argv.slice(2);
const s = reg.surse.find((x) => x.id === id);
const f = path.join(".cercetare-privata/art33", crypto.createHash("sha1").update(s.fisier).digest("hex").slice(0, 16) + path.extname(new URL(s.fisier).pathname).toLowerCase());
const { randuri: r, coloane } = await citestePdf(f, { potrivire: (t) => meserie(t, s.tip) !== null });
if (idx[0] === "col") for (const c of coloane) console.log(`   x=${c.x} n=${c.n} ${c.tip.padEnd(10)} ${c.eticheta.slice(0, 120)}`);
else for (const i of idx.map(Number)) { const x = r[i]; console.log(`--- ${x.text.slice(0, 90)} | baza ${x.baza}`); for (const q of x.sume) console.log(`   ${String(q.v).padStart(8)} ${q.tip.padEnd(10)} ← ${q.eticheta.slice(0, 100)}`); }
