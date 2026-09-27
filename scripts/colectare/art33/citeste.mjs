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
  // Suceava are trei „salar bază”: pentru calculul sporului de ture (4.304), din fișa postului
  // din decembrie 2023 (5.775) și „cf. L153/2017 și bază de calcul pentru sporuri” (8.084) —
  // ultima e baza. Fișa veche nu e baza de acum.
  if (/\(fisa\)/.test(e)) return "necunoscut";
  // O coloană numită doar „Salariul” (Teatrul Radu Stanca Sibiu) e salariul de bază al postului.
  if (/^salariul?$/.test(e.trim())) return "baza";
  if (/salar\w*\s*baza\s*cf\.?\s*l\.?\s*153/.test(e)) return "baza";
  if (/baza\s*(de\s*|pt\.?\s*|pentru\s*)?calcul|baz\w*\s+calcul/.test(e)) return "bazaCalcul";
  // „Total salariu brut”: cel mai sigur număr, când instituția îl publică (DGASPC Sector 2).
  if (/\btotal\b/.test(e) && !/ore|zile/.test(e)) return "total";
  if (/hran|voucher|vacant|vacan/.test(e)) return "hrana";
  if (/(^|\s)(ore|nr\.?\s*ore|zile|numar ore)(\s|$)/.test(e) && !/valoare|suma|sume|spor 100|spor 75|spor 40/.test(e)) return "ore";
  // „tură” doar ca vorbă separată: „veniTURI” nu e tură (Cluj, 26 septembrie 2026).
  if (/\btur[aei]?\b|\bture\b|noapte|gard|garzi|sarbat|\bsarb\b|\bsamb|duminic|nelucr|repaus|suplimentar|weekend|s\+d|domicil|sume ore|ore prestate/.test(e)) return "variabil";
  if (/(salar\w*|sal\.?)\s*(de\s*)?baz|salariul funct|indemnizat\w* de incadrare|solda/.test(e)) return "baza";
  // „Baza lei grilă” (Brăila), „Sal de … baza” (Filantropia): „bază” singur e baza, după ce
  // bazele de calcul au fost deja recunoscute mai sus.
  if (/\bbaza\b/.test(e) && !/spor|val\.?\s/.test(e)) return "baza";
  // Prescurtări: „Val. cond deoseb”, „Val. cond deoseb de peric”.
  if (/\bval\.?\s*(cond|spor)|\bcond\.?\s*deoseb|\bdeoseb|\bperic/.test(e)) return "sporFix";
  if (/spor|indemniz|titlu|doctor|cfp|control financiar|gestiun|condit|pericul|deosebit|stres|risc|radiat|toxic|handicap|izolat|compen|19\/2024|3\^1/.test(e)) return "sporFix";
  // Sub-coloanele sporurilor de condiții pe anexele HG 153/2018 („Anexa 5 Suma”), sporul de
  // handicap prescurtat („hand … Suma”) și cel după HG 917 (Suceava).
  if (/\banexa\s*\d+\b[^%]*\bsuma\b|\bhand\b[^%]*\bsuma\b|\bhg\s*917\b[^%]*\bsuma\b/.test(e)) return "sporFix";
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
        // Numai bucățile care se ating; textele suprapuse sunt antete diferite care trec unul
        // peste altul (Timișoara), nu bucăți ale aceluiași cuvânt.
        const gol = u ? i.x0 - u.x1 : 0;
        if (u && gol < 0.6 && gol > -1 && !/^\d/.test(i.t) && !/\d$/.test(u.t)) { u.t += i.t; u.x1 = i.x1; }
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
  // Un an din antet („Decembrie 2023”, „L153/2,017”, Suceava) nu e o sumă: altfel antetul de
  // sub el ar fi luat drept primul rând de date, iar etichetele coloanelor s-ar pierde.
  const an = (n) => Number.isInteger(n.v) && n.v >= 1990 && n.v <= 2035;
  return nr.length >= 2 && nr.some((n) => n.v >= 1000 && !n.procent && !an(n)) && l.items.some((i) => /[a-zăâîșț]{3}/i.test(i.t));
};

/**
 * Citește rândurile căutate dintr-un PDF. `potrivire(text)` alege rândurile (funcția);
 * `profil.dupaEticheta(eticheta, numar)` poate fixa manual tipul unei coloane.
 */
/**
 * Rândurile unei liste scanate, din cuvintele recunoscute de OCR (scripts/colectare/art33/ocr.ps1),
 * în aceeași formă ca la PDF: y crește în sus, cuvintele pe același rând când centrele lor verticale
 * sunt la mai puțin de jumătate de înălțime de literă. Cuvintele se păstrează separat; cititorul
 * unește oricum textul unui rând, iar numerele rămân în coloanele lor.
 */
export function randuriOcr(fisier) {
  const d = JSON.parse(fs.readFileSync(fisier, "utf8"));
  const out = [];
  for (const p of [d.pagini].flat()) {
    const brute = [p.cuvinte ?? []].flat().filter((c) => c && String(c.t).trim());
    // Scanările sunt ușor strâmbe (Tribunalul Sălaj: ~1°, 45 px pe 2.500 px de rând): se alege
    // înclinarea la care cuvintele se strâng în cele mai puține rânduri și se îndreaptă y-ul.
    const randuriLa = (panta) => {
      const ys = brute.map((c) => c.y + c.h / 2 - panta * c.x).sort((a, b) => a - b);
      let n = 0, ultim = -Infinity;
      for (const y of ys) { if (y - ultim > 18) n++; ultim = y; }
      return n;
    };
    let panta = 0, cel = Infinity;
    for (let s = -0.035; s <= 0.035001; s += 0.0025) { const n = randuriLa(s); if (n < cel) { cel = n; panta = s; } }
    for (let s = panta - 0.002; s <= panta + 0.002001; s += 0.00025) { const n = randuriLa(s); if (n < cel) { cel = n; panta = s; } }
    const grupeaza = (s) => {
      const cuvinte = brute
        .map((c) => ({ x0: c.x, x1: c.x + c.w, xc: c.x + c.w / 2, yc: c.y + c.h / 2 - s * (c.x + c.w / 2), h: c.h, t: String(c.t).trim() }))
        .sort((a, b) => a.yc - b.yc || a.x0 - b.x0);
      const linii = [];
      for (const c of cuvinte) {
        const l = linii.find((l) => Math.abs(l.yc - c.yc) <= Math.max(4, 0.5 * Math.min(l.h, c.h)));
        if (l) { l.items.push(c); l.yc = (l.yc * (l.items.length - 1) + c.yc) / l.items.length; }
        else linii.push({ yc: c.yc, h: c.h, items: [c] });
      }
      return linii;
    };
    // Înclinarea rămasă se măsoară pe rândurile lungi (pantă prin cele mai mici pătrate) și se
    // corectează de două ori: la capătul din dreapta al tabelului, o eroare de 0,2° mută sporul
    // în rândul vecin.
    const latimePagina = Math.max(1, ...brute.map((c) => c.x + c.w));
    let linii = grupeaza(panta);
    for (let k = 0; k < 2; k++) {
      const pante = linii.filter((l) => l.items.length >= 3 && Math.max(...l.items.map((i) => i.xc)) - Math.min(...l.items.map((i) => i.xc)) > 0.4 * latimePagina)
        .map((l) => {
          const n = l.items.length, mx = l.items.reduce((a, i) => a + i.xc, 0) / n, my = l.items.reduce((a, i) => a + i.yc, 0) / n;
          const num = l.items.reduce((a, i) => a + (i.xc - mx) * (i.yc - my), 0), den = l.items.reduce((a, i) => a + (i.xc - mx) ** 2, 0);
          return den ? num / den : 0;
        }).sort((a, b) => a - b);
      if (!pante.length) break;
      panta += pante[Math.floor(pante.length / 2)];
      linii = grupeaza(panta);
    }
    // Hârtia scanată e și curbată, nu doar rotită: fiecare cuvânt primește înclinarea celui mai
    // apropiat rând lung (pe verticală), nu una singură pe toată pagina.
    const lungi = linii.filter((l) => l.items.length >= 3 && Math.max(...l.items.map((i) => i.xc)) - Math.min(...l.items.map((i) => i.xc)) > 0.4 * latimePagina)
      .map((l) => {
        const n = l.items.length, mx = l.items.reduce((a, i) => a + i.xc, 0) / n, my = l.items.reduce((a, i) => a + i.yc, 0) / n;
        const num = l.items.reduce((a, i) => a + (i.xc - mx) * (i.yc - my), 0), den = l.items.reduce((a, i) => a + (i.xc - mx) ** 2, 0);
        return { yc: my, panta: panta + (den ? num / den : 0) };
      });
    if (lungi.length >= 3) {
      const pantaLa = (y) => lungi.reduce((best, l) => (Math.abs(l.yc - y) < Math.abs(best.yc - y) ? l : best)).panta;
      const cuvinte = brute
        .map((c) => { const xc = c.x + c.w / 2, y0 = c.y + c.h / 2 - panta * xc; return { x0: c.x, x1: c.x + c.w, xc, yc: c.y + c.h / 2 - pantaLa(y0) * xc, h: c.h, t: String(c.t).trim() }; })
        .sort((a, b) => a.yc - b.yc || a.x0 - b.x0);
      linii = [];
      for (const c of cuvinte) {
        const l = linii.find((l) => Math.abs(l.yc - c.yc) <= Math.max(4, 0.5 * Math.min(l.h, c.h)));
        if (l) { l.items.push(c); l.yc = (l.yc * (l.items.length - 1) + c.yc) / l.items.length; }
        else linii.push({ yc: c.yc, h: c.h, items: [c] });
      }
    }
    // Corecția pe coloane: rândurile tabelului se recunosc după denumirea funcției din stânga, iar
    // fiecare coloană de numere primește propria deplasare verticală față de ele (mediana
    // diferențelor). Hârtia strâmbă sau curbată mută o coloană întreagă cu câțiva pixeli; o
    // deplasare pe coloană o readuce în rândul ei (Tribunalul Sălaj: sporul de risc, x ≈ 3.300).
    // Un rând de tabel ocupă adesea două rânduri de text (Sălaj: „Judecător” sus, „S grad
    // tribunal 10-15 ani” dedesubt, cu sporurile pe al doilea): rândul începe la funcția din
    // prima coloană și ține până la următoarea funcție.
    const numeric = (t) => /^[\d.,]+%?$/.test(t) && /\d/.test(t);
    const cuSuma = (l) => l.items.some((i) => numeric(i.t) && Number(i.t.replace(/[.,]\d{1,2}$/, "").replace(/[.,]/g, "")) >= 1000);
    const minX = Math.min(...linii.map((l) => Math.min(...l.items.map((i) => i.x0))));
    const primaSuma = Math.min(...linii.filter(cuSuma).map((l) => l.yc));
    const eAncora = (l) => {
      const st = l.items.reduce((a, i) => (i.x0 < a.x0 ? i : a));
      return !numeric(st.t) && /[a-zăâîșț]{2}/i.test(st.t) && st.x0 < minX + 0.04 * latimePagina && l.yc >= primaSuma - 60;
    };
    const ancore = linii.filter(eAncora).sort((a, b) => a.yc - b.yc);
    if (ancore.length >= 5) {
      const pasi = ancore.slice(1).map((l, i) => l.yc - ancore[i].yc).filter((d) => d > 5).sort((a, b) => a - b);
      const pas = pasi[Math.floor(pasi.length / 2)];
      const dedesupra = (y) => { let a = null; for (const l of ancore) if (l.yc <= y) a = l; return a; };
      const cuvinte = linii.filter((l) => l.yc >= ancore[0].yc - 0.3 * pas && l.yc <= ancore[ancore.length - 1].yc + 1.3 * pas).flatMap((l) => l.items);
      const cuvNumerice = cuvinte.filter((i) => numeric(i.t));
      const hMed = [...cuvNumerice.map((c) => c.h)].sort((a, b) => a - b)[Math.floor(cuvNumerice.length / 2)] || 30;
      // Coloanele de numere, după centru; fiecare primește deplasarea ei față de începutul
      // rândului (mediana), ca o coloană coborâtă de hârtia strâmbă să nu treacă în rândul următor.
      const coloaneX = [];
      for (const c of [...cuvNumerice].sort((a, b) => a.xc - b.xc)) {
        const k = coloaneX[coloaneX.length - 1];
        if (k && c.xc - k.xmax < 1.5 * hMed) { k.cuv.push(c); k.xmax = c.xc; } else coloaneX.push({ xmax: c.xc, cuv: [c] });
      }
      const alocate = new Map(ancore.map((l) => [l, []]));
      const alocat = new Set();
      const pune = (c, y) => { const a = dedesupra(y); if (a && y - a.yc < 1.3 * pas) { alocate.get(a).push(c); alocat.add(c); } };
      for (const k of coloaneX) {
        const dif = k.cuv.map((c) => { const a = dedesupra(c.yc + 0.3 * pas); return a ? c.yc - a.yc : null; }).filter((d) => d !== null && d < pas).sort((a, b) => a - b);
        const dep = dif.length ? dif[Math.floor(dif.length / 2)] : 0;
        for (const c of k.cuv) pune(c, c.yc - dep + 0.3 * pas);
      }
      for (const c of cuvinte) if (!numeric(c.t) && !alocat.has(c)) pune(c, c.yc + 0.3 * hMed);
      linii = linii.map((l) => ({ ...l, items: [...l.items.filter((i) => !alocat.has(i)), ...(alocate.get(l) ?? [])] }))
        .filter((l) => l.items.length);
    }
    for (const l of linii) {
      l.items.sort((a, b) => a.x0 - b.x0);
      // OCR desparte uneori miile: „25. 311” sau „25 311” → o singură sumă, când bucățile se ating.
      const unite = [];
      for (const i of l.items) {
        const u = unite[unite.length - 1];
        // Numai bucățile de pe același rând de text: după unirea rândurilor duble, „460” și „477”
        // din rânduri diferite ajung alăturate (Sălaj).
        if (u && /^\d{1,3}[.,]?$/.test(u.t) && /^\d{3}([.,]\d{1,2})?$/.test(i.t) && i.x0 - u.x1 < 0.6 * i.h && Math.abs(u.yc - i.yc) < 0.5 * i.h) { u.t = u.t.replace(/[.,]$/, "") + "." + i.t; u.x1 = i.x1; }
        else unite.push({ x0: i.x0, x1: i.x1, yc: i.yc, t: i.t });
      }
      // Pixelii scanării se aduc la scara unei pagini PDF (842 de puncte pe lățime), ca pragurile
      // cititorului (coloane la 6 unități, antete late de 400) să însemne același lucru.
      const k = 842 / latimePagina;
      out.push({ pagina: p.pagina, y: -l.yc * k, items: unite.map((i) => ({ x0: i.x0 * k, x1: i.x1 * k, t: i.t })), ocr: true });
    }
  }
  return out.sort((a, b) => a.pagina - b.pagina || b.y - a.y);
}

export async function citestePdf(fisier, { potrivire, profil = {} }) {
  const linii = /\.xlsx$/i.test(fisier) ? await randuriXlsx(fisier) : /\.ocr\.json$/i.test(fisier) ? randuriOcr(fisier) : await randuriPdf(fisier);
  const ocr = linii.some((l) => l.ocr);
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
  // Rândul de numerotare a coloanelor („1 2 3 … 15”), când există, fixează celulele exact.
  // La Timișoara (septembrie 2026) antetele sunt texte lungi, pe un rând, care trec peste
  // coloanele vecine: „Salariul de bază…” (x 357–486) acoperea și coloana sporului de condiții
  // (x 480–493), așa că sporul era citit drept bază. Antetul unei celule începe la stânga
  // numărului ei, cel mult 25 de unități, niciodată în celula vecină.
  const numerotare = antet.find((l) => {
    const n = l.items.map((i) => (/^\d{1,2}$/.test(i.t) ? Number(i.t) : null));
    return n.length >= 5 && n.every((x, k) => x === k + 1);
  });
  if (numerotare) {
    const potrivite = coloane.map((c) => numerotare.items.reduce((best, i) => (Math.abs(i.x1 - c.x1max) < Math.abs((best?.x1 ?? Infinity) - c.x1max) ? i : best), null))
      .map((i, k) => (i && Math.abs(i.x1 - coloane[k].x1max) <= 12 ? i : null));
    if (potrivite.filter(Boolean).length >= 0.6 * coloane.length) {
      coloane.forEach((c, k) => {
        const nr = potrivite[k];
        if (!nr) return;
        c.eticheta = antet.filter((l) => l !== numerotare)
          .map((l) => l.items.filter((i) => i.x0 >= nr.x0 - 25 && i.x0 <= nr.x0 + 5 && i.x1 - i.x0 <= 400).map((i) => i.t).join(" "))
          .filter(Boolean).join(" ").replace(/\s+/g, " ");
      });
    }
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
      // „Grad/” singur (Timișoara) e coloana gradației: valori 0–5, lângă funcție.
      if ((/grada/i.test(faraDiacritice(et)) || /^grad\s*\/?$/i.test(et.trim())) && n.v <= 10) { r.gradatie = n.v; r.sume[r.sume.length - 1].tip = "gradatie"; continue; }
      if (tip === "total") { r.total = n.v; continue; }
      // O coloană de bază cu 0 (Curtea de Apel Bacău: indemnizația magistraților și salariul
      // personalului auxiliar, în coloane separate) nu e baza rândului.
      if (tip === "baza" && !r.baza) r.baza = n.v;
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
      // Sub 100.000: codul COR din coloana funcției (341103, Tribunalul Cluj) nu e o sumă.
      const p = r.sume.find((x) => !["procent", "ore", "bazaCalcul"].includes(x.tip) && x.v >= 1000 && x.v < 100000);
      if (p) {
        r.baza = p.v; if (p.tip === "sporFix") r.sporFix -= p.v;
        // Ghicitul se confirmă când rândul are și sporul de 5% din bază (confidențialitatea, la
        // instanțe și parchete, Anexa V): antetele verticale din listele instanțelor (Argeș,
        // Mehedinți) nu se citesc, dar aritmetica rândului arată care e baza.
        p.tip = r.sume.some((x) => x !== p && Math.abs(x.v - 0.05 * p.v) <= 2) ? "baza" : "baza?";
      }
    }
    // În listele scanate, o sumă din coloană necunoscută care e exact 5% din bază e sporul de
    // confidențialitate (instanțele, Anexa V), când antetul nu se citește (Maramureș). Numai la OCR:
    // în listele spitalelor, o coloană necunoscută de 5% nu e neapărat un spor permanent.
    if (r.baza && ocr) for (const x of r.sume) {
      if (x.tip === "necunoscut" && x.v >= 100 && Math.abs(x.v - 0.05 * r.baza) <= 2) {
        x.tip = "sporFix"; r.sporFix += x.v; r.necunoscut = r.necunoscut.filter((v) => v !== x.v);
      }
    }
    randuri.push(r);
  }
  const verificate = ocr ? verificaOcr(randuri) : randuri;
  return { randuri: verificate, respinseOcr: randuri.length - verificate.length, perioadaDocument: perioadaDin(antet), coloane:coloane.map(({ x1max, n, eticheta }) => ({ x: Math.round(x1max), n, eticheta, tip: tipColoana(eticheta, false, 1000) })) };
}

/**
 * Rândurile citite prin OCR trec numai dacă se verifică singure, pe structura propriei liste:
 *  - câte sume are rândul (fără gradație și coeficient) e exact numărul obișnuit din listă: o
 *    sumă lipsă sau în plus înseamnă că un spor a căzut în rândul vecin;
 *  - nicio sumă nu depășește baza (două numere lipite, „460477”);
 *  - fiecare rând are sporul de 5% din bază (confidențialitatea la instanțe, Sălaj), la ±2 lei:
 *    e singura verificare aritmetică a rândului; o listă fără ea nu intră deloc prin OCR;
 *  - sporurile, ca parte din bază, sunt la ±20% de mediana listei.
 * Un rând respins nu se corectează: se pierde, ca la orice listă ilizibilă.
 */
function verificaOcr(randuri) {
  const sume = (r) => r.sume.filter((s) => s.tip !== "gradatie" && s.v >= 100 && s.v < 100000 && s.v !== r.baza);
  const n = {};
  for (const r of randuri) { const k = sume(r).length; n[k] = (n[k] ?? 0) + 1; }
  const obisnuit = Number(Object.entries(n).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0);
  const cinci = (r) => sume(r).some((s) => Math.abs(s.v - 0.05 * r.baza) <= 2);
  const bune = randuri.filter((r) => r.baza && sume(r).length === obisnuit && !sume(r).some((s) => s.v > r.baza));
  const cota5 = bune.filter(cinci).length / (bune.length || 1);
  // Sub 40% din rânduri cu sporul de 5%, fie coloana e decalată (Tribunalul Cluj), fie lista
  // n-are coloana care verifică rândul: la Spitalul Mureș (164 de pagini) medicii primari ieșeau
  // cu baze de 5.000–8.800 lei și fără sporuri. Fără verificare aritmetică, nu intră niciun rând.
  if (cota5 < 0.4) return [];
  const trecute = bune.filter(cinci);
  // Sporurile, ca parte din bază, apropiate de mediana listei (±20%): un spor mare căzut în alt
  // rând lasă în urmă un rând cu numărul corect de sume, dar cu un spor mic în locul lui.
  const cote = trecute.map((r) => r.sporFix / r.baza).sort((a, b) => a - b);
  const med = cote[Math.floor(cote.length / 2)] ?? 0;
  return trecute.filter((r) => Math.abs(r.sporFix / r.baza - med) <= 0.2 * med);
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
  // Sub 3.700 lei (salariul minim din 2024, cel mai mic al perioadelor citite) o bază de post
  // cu normă întreagă nu există. Printre sursele citite corect, cel mult 11% din rânduri (norme
  // parțiale); la Suceava, unde se citise „baza pentru calculul sporului de ture”, peste 40%.
  const sub = valide.filter((r) => r.baza < 3700).length / valide.length;
  if (sub > 0.25) return `baze sub salariul minim la ${Math.round(100 * sub)}% din rânduri`;
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
