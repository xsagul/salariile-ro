// Cititorul listelor de transparență salarială (art. 33 din Legea 153/2017).
//
// Fiecare instituție își publică lista în alt format, dar în PDF coloanele unui model stau la
// aceleași coordonate pe toate paginile. Cititorul folosește coordonatele reale (pdf.js):
//   1. grupează textul pe rânduri, după y;
//   2. un rând de date are o sumă de salariu (≥ 1.000) și text;
//   3. coloanele de numere se află din marginea dreaptă a cifrelor (aliniate la dreapta),
//      pe tot documentul; fiecare coloană primește antetul care se suprapune cu ea;
//   4. eticheta decide tipul: bază, bază de calcul, procent, ore, spor fix, variabil, hrană.
//
// De ce nu grila × procent: sporurile se calculează pe o „bază de calcul” mai mică decât
// salariul de bază (Bacău: 4.576 la o bază de 6.407; 75% × 4.576 = 3.432), deci numai sumele
// publicate sunt corecte (research/meserii-2026-09-26/STRATEGIE.md).
import fs from "node:fs";

const faraDiacritice = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const NUMERIC = /^(\d{1,3}(?:[.,]\d{3})+|\d+)(?:[.,](\d{1,2}))?\.?(%?)$/;

function valoare(t) {
  const m = t.replace(/\s+/g, "").match(NUMERIC);
  if (!m) return null;
  return { v: Number(m[1].replace(/[.,]/g, "")) + (m[2] ? Number(m[2]) / 10 ** m[2].length : 0), procent: m[3] === "%" };
}

/** Clasificarea etichetei unei coloane numerice. */
export function tipColoana(eticheta, procent, v = 0) {
  // Cuvinte despărțite în antet („sărbă-tori”) se unesc înainte de recunoaștere.
  const e = faraDiacritice(eticheta).toLowerCase().replace(/([a-z])-\s*([a-z])/g, "$1$2");
  // „Salariu spor” / „Salariu gărzi” sunt bazele de calcul ale sporurilor, nu sporuri:
  // la Sibiu, 5.411 lei = 71% din baza de 7.574, exact ca „Baza calcul spor” de la Bacău.
  if (/salariu\s+(spor|garzi|ture)\b/.test(e)) return "bazaCalcul";
  // Un procent de spor nu trece de 100: „Spor 100% ore în zilele de repaus” (659 lei) e o
  // sumă, oricât de aproape ar fi cuvântul „procent”.
  const cuvantProcent = /(^|[\s(])(%|procent\w*|cota)([\s)]|$)/.test(e) && !/(^|\s)(valoare|suma|sume)(\s|$)/.test(e);
  if (v <= 100 && (procent || cuvantProcent)) return "procent";
  if (/baza\s*(de\s*)?calcul|baz\w*\s+calcul/.test(e)) return "bazaCalcul";
  // „Total salariu brut”: cel mai sigur număr, când instituția îl publică (DGASPC Sector 2).
  if (/\btotal\b/.test(e) && !/ore|zile/.test(e)) return "total";
  if (/hran|voucher|vacant|vacan/.test(e)) return "hrana";
  if (/(^|\s)(ore|nr\.?\s*ore|zile|numar ore)(\s|$)/.test(e) && !/valoare|suma|sume|spor 100|spor 75|spor 40/.test(e)) return "ore";
  // „tură” doar ca vorbă separată: „veniTURI” nu e tură (Cluj, 26 septembrie 2026).
  if (/\btur[aei]?\b|\bture\b|noapte|gard|garzi|sarbat|nelucr|repaus|suplimentar|weekend|s\+d|domicil|sume ore|ore prestate/.test(e)) return "variabil";
  if (/(salar\w*|sal\.?)\s*(de\s*)?baz|salariul funct|indemnizat\w* de incadrare|solda/.test(e)) return "baza";
  if (/spor|indemniz|titlu|doctor|cfp|control financiar|gestiun|condit|pericul|deosebit|stres|risc|radiat|toxic|handicap|izolat|compen|19\/2024|3\^1/.test(e)) return "sporFix";
  return "necunoscut";
}

/** Rândurile de text ale unui PDF, cu coordonate: [{ pagina, y, items: [{ x0, x1, t }] }]. */
export async function randuriPdf(fisier) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(fisier)), verbosity: 0 }).promise;
  const out = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const pagina = await doc.getPage(p);
    const { items } = await pagina.getTextContent();
    // Unele liste sunt rotite cu 90° (Miercurea Ciuc): rotim coordonatele înapoi după
    // orientarea dominantă a textului de pe pagină, ca rândurile tabelului să fie orizontale.
    const cu = items.filter((i) => i.str.trim());
    const unghiuri = {};
    for (const i of cu) { const u = Math.round(Math.atan2(i.transform[1], i.transform[0]) / (Math.PI / 2)) * 90; unghiuri[u] = (unghiuri[u] ?? 0) + i.str.length; }
    const unghi = Number(Object.entries(unghiuri).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0) * Math.PI / 180;
    const cos = Math.round(Math.cos(unghi)), sin = Math.round(Math.sin(unghi));
    const buc = cu.map((i) => {
      const [x, y] = [i.transform[4], i.transform[5]];
      const u = x * cos + y * sin, v = -x * sin + y * cos;
      return { x0: u, x1: u + i.width, y: v, t: i.str.trim() };
    });
    buc.sort((a, b) => b.y - a.y || a.x0 - b.x0);
    // Unele PDF-uri desenează același text de două ori, suprapus (îngroșare simulată, Gorj):
    // păstrăm o singură copie pentru același text la aceeași poziție.
    const vazute = new Set();
    for (let k = buc.length - 1; k >= 0; k--) {
      const b = buc[k], cheie = `${b.t}|${Math.round(b.x0)}|${Math.round(b.y)}`;
      if (vazute.has(cheie)) buc.splice(k, 1); else vazute.add(cheie);
    }
    const linii = [];
    for (const b of buc) {
      const l = linii.find((l) => Math.abs(l.y - b.y) <= 2.2);
      if (l) l.items.push(b); else linii.push({ pagina: p, y: b.y, items: [b] });
    }
    // pdf.js rupe unele cuvinte în bucăți lipite („G” „ă” „rzi”): le unim când se ating.
    for (const l of linii) {
      l.items.sort((a, b) => a.x0 - b.x0);
      const unite = [];
      for (const i of l.items) {
        const u = unite[unite.length - 1];
        if (u && i.x0 - u.x1 < 0.6 && !/^\d/.test(i.t) && !/\d$/.test(u.t)) { u.t += i.t; u.x1 = i.x1; }
        else unite.push({ ...i });
      }
      l.items = unite;
    }
    out.push(...linii.sort((a, b) => b.y - a.y));
  }
  return out;
}

/**
 * Rândurile unei foi XLSX, în aceeași formă ca la PDF: fiecare celulă e un „cuvânt” cu
 * poziție (100 de unități pe coloană), iar o celulă unită în antet acoperă toate coloanele
 * ei, ca un titlu de grup deasupra sub-coloanelor.
 */
export async function randuriXlsx(fisier) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(fisier);
  const out = [];
  wb.worksheets.forEach((ws, k) => {
    const unite = {};
    for (const zona of ws.model.merges ?? []) {
      const [a, b] = zona.split(":");
      const s = ws.getCell(a), e = ws.getCell(b);
      unite[`${s.row}:${s.col}`] = e.col;
    }
    ws.eachRow({ includeEmpty: false }, (row, r) => {
      const items = [];
      row.eachCell({ includeEmpty: false }, (cell, c) => {
        let v = cell.value;
        if (v && typeof v === "object") v = v.result ?? v.text ?? (v.richText ? v.richText.map((x) => x.text).join("") : null);
        if (v === null || v === undefined || String(v).trim() === "") return;
        const t = typeof v === "number" ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : String(v).replace(/\s+/g, " ").trim();
        const pana = unite[`${r}:${c}`] ?? c;
        items.push({ x0: c * 100, x1: pana * 100 + 90, t });
      });
      if (items.length) out.push({ pagina: k + 1, y: -r * 10, items });
    });
  });
  return out;
}

// Un rând de date: o sumă de salariu, cel puțin încă un număr și text. Titlul „…martie 2026”
// are un singur număr și nu e rând de date (Miercurea Ciuc, 26 septembrie 2026).
const eDate = (l) => {
  const nr = l.items.map((i) => valoare(i.t)).filter(Boolean);
  return nr.length >= 2 && nr.some((n) => n.v >= 1000 && !n.procent) && l.items.some((i) => /[a-zăâîșț]{3}/i.test(i.t));
};

/**
 * Citește rândurile căutate dintr-un PDF. `potrivire(text)` alege rândurile (funcția);
 * `profil.dupaEticheta(eticheta, numar)` poate fixa manual tipul unei coloane.
 */
export async function citestePdf(fisier, { potrivire, profil = {} }) {
  const linii = /\.xlsx$/i.test(fisier) ? await randuriXlsx(fisier) : await randuriPdf(fisier);
  const date = linii.filter(eDate);
  if (!date.length) return { randuri: [], coloane: [] };

  // Antetul: liniile de deasupra primului rând de date, pe prima pagină cu date.
  const prima = date[0];
  const antet = linii.filter((l) => l.pagina === prima.pagina && l.y > prima.y + 1);

  // Coloanele de numere: marginea dreaptă a cifrelor, grupată la 6 unități.
  const margini = [];
  for (const l of date) for (const i of l.items) if (valoare(i.t)) margini.push({ x1: i.x1, x0: i.x0 });
  margini.sort((a, b) => a.x1 - b.x1);
  const coloane = [];
  for (const m of margini) {
    const c = coloane[coloane.length - 1];
    if (c && m.x1 - c.x1max <= 6) { c.x1max = m.x1; c.x0min = Math.min(c.x0min, m.x0); c.n++; }
    else coloane.push({ x1min: m.x1, x1max: m.x1, x0min: m.x0, n: 1 });
  }
  // Zona fiecărei coloane: cifrele sunt aliniate la dreapta, deci celula începe unde se
  // termină coloana din stânga și se oprește la marginea dreaptă a propriilor cifre. Antetul
  // stă oriunde în celulă — la stânga (Miercurea Ciuc), centrat sau la dreapta.
  coloane.forEach((c, k) => {
    const prev = coloane[k - 1];
    c.L = prev ? prev.x1max + 0.5 : c.x0min - 40;
    c.R = c.x1max + 3;
  });
  // Eticheta: textul de antet din zona coloanei. Un text lat (titlu de grup) etichetează
  // toate coloanele pe care le acoperă; titlul documentului (foarte lat) pe niciuna.
  const inZona = (i, c) => {
    const w = i.x1 - i.x0;
    if (w > 400) return false;
    const suprapunere = Math.min(i.x1, c.R) - Math.max(i.x0, c.L);
    return suprapunere > 0 && (suprapunere >= 0.5 * Math.min(w, c.R - c.L) || ((i.x0 + i.x1) / 2 >= c.L && (i.x0 + i.x1) / 2 <= c.R));
  };
  for (const c of coloane) {
    c.eticheta = antet.map((l) => l.items.filter((i) => inZona(i, c)).map((i) => i.t).join(" ")).filter(Boolean).join(" ").replace(/\s+/g, " ");
  }
  const coloanaPentru = (i) => coloane.find((c) => i.x1 >= c.x1min - 0.5 && i.x1 <= c.x1max + 0.5) ?? coloane.find((c) => i.x1 >= c.L && i.x1 <= c.R);
  const etichetaText = (i) => antet.map((l) => l.items.filter((h) => h.x1 >= i.x0 - 2 && h.x0 <= i.x1 + 2).map((h) => h.t).join(" ")).filter(Boolean).join(" ");

  const randuri = [];
  for (const l of date) {
    const text = l.items.filter((i) => !valoare(i.t)).map((i) => i.t).join(" ").replace(/\s+/g, " ");
    if (!potrivire(text)) continue;
    const r = { pagina: l.pagina, text, campuri: {}, baza: null, total: null, sporFix: 0, variabil: 0, hrana: 0, necunoscut: [], sume: [] };
    for (const i of l.items) {
      const n = valoare(i.t);
      if (!n) { r.campuri[faraDiacritice(etichetaText(i)).toLowerCase().slice(0, 40) || "?"] = i.t; continue; }
      const c = coloanaPentru(i);
      const et = c?.eticheta ?? "";
      const tip = profil.dupaEticheta?.(et, n) ?? tipColoana(et, n.procent, n.v);
      r.sume.push({ v: n.v, tip, eticheta: et });
      if (/grada/i.test(faraDiacritice(et)) && n.v <= 10) { r.gradatie = n.v; r.sume[r.sume.length - 1].tip = "gradatie"; continue; }
      if (tip === "total") { r.total = n.v; continue; }
      if (tip === "baza" && r.baza === null) r.baza = n.v;
      else if (tip === "sporFix") r.sporFix += n.v;
      else if (tip === "variabil") r.variabil += n.v;
      else if (tip === "hrana") r.hrana += n.v;
      else if (tip === "necunoscut" && n.v >= 100) r.necunoscut.push(n.v);
    }
    // Cu total publicat și fără sporuri recunoscute, sporul fix e diferența până la total.
    // Totalul poate cuprinde și indemnizația lunară de hrană (Biblioteca Alba: 6.692 = 6.345 +
    // 347), deci hrana publicată se scade: mai bine un spor subestimat decât hrana luată drept spor.
    if (r.total && r.baza && r.total > r.baza && r.sporFix === 0 && r.variabil === 0) r.sporFix = Math.max(0, r.total - r.baza - r.hrana);
    if (r.baza === null) {
      const p = r.sume.find((x) => !["procent", "ore", "bazaCalcul"].includes(x.tip) && x.v >= 1000);
      if (p) { r.baza = p.v; if (p.tip === "sporFix") r.sporFix -= p.v; p.tip = "baza?"; }
    }
    randuri.push(r);
  }
  return { randuri, perioadaDocument: perioadaDin(antet), coloane: coloane.map(({ x1max, n, eticheta }) => ({ x: Math.round(x1max), n, eticheta, tip: tipColoana(eticheta, false, 1000) })) };
}

const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
/** Luna datelor, din antetul documentului („Luna: August 2025”, „martie 2026”, „31.03.2026”). */
function perioadaDin(antet) {
  const t = faraDiacritice(antet.map((l) => l.items.map((i) => i.t).join(" ")).join(" ")).toLowerCase();
  const m = t.match(new RegExp(`(${LUNI.join("|")})\\s*(20\\d{2})`));
  if (m) return `${m[2]}-${String(LUNI.indexOf(m[1]) + 1).padStart(2, "0")}`;
  const d = t.match(/\b\d{1,2}[.\/-](\d{1,2})[.\/-](20\d{2})\b/);
  if (d) return `${d[2]}-${d[1].padStart(2, "0")}`;
  return null;
}

/** Poarta de calitate a unui fișier: intră în agregat numai dacă citirea arată sănătos. */
export function fisierAcceptat(randuri) {
  if (randuri.length < 5) return "prea puține rânduri";
  const valide = randuri.filter((r) => !randValid(r));
  if (valide.length / randuri.length < 0.9) return `numai ${Math.round((100 * valide.length) / randuri.length)}% rânduri valide`;
  const baze = valide.map((r) => r.baza).sort((a, b) => a - b);
  const med = baze[Math.floor(baze.length / 2)];
  if (med < 3000 || med > 25000) return `mediana bazelor neplauzibilă (${med})`;
  if (randuri.filter((r) => r.sume.some((x) => x.tip === "baza?")).length / randuri.length > 0.3) return "baza ghicită la peste 30% din rânduri";
  return null;
}

/** Verificări de bun-simț pe un rând: nu intră în agregat dacă pică. */
export function randValid(r) {
  if (!r.baza || r.baza < 1500 || r.baza > 60000) return "bază în afara plajei";
  if (r.sporFix < 0 || r.sporFix > 1.5 * r.baza) return "spor fix neplauzibil";
  if (r.variabil > 3 * r.baza) return "variabil neplauzibil";
  return null;
}
