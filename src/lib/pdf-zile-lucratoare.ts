// Desenul PDF-urilor de pe paginile de zile lucrătoare, separat de butoane ca să poată fi
// generat și verificat și în afara browserului. Documentul vine gata făcut, cu fontul
// „Liberation” înregistrat (normal și bold), de la DescarcaZileLucratoare.tsx.
//
// Aspectul copiază pagina (proprietar, 27 sept. 2026): fundalul crem, lunile în carduri,
// titlul simplu al secțiunii și legenda de sub el. Fără fraze adăugate doar în PDF.
import type { jsPDF } from "jspdf";
import type { LunaCalendar } from "@/app/components/CalendarAn";

export type RandZileLucratoare = { name: string; zileCalendaristice: number; lucratoare: number; ore: number; libere: number };
export type SarbatoareZi = { data: string; label: string; weekend: boolean };
export type DateZileLucratoare = {
  an: number;
  rows: RandZileLucratoare[];
  luni: LunaCalendar[];
  sarbatori: SarbatoareZi[];
  total: number;
  ore: number;
  libere: number;
};

// Zilele săptămânii, ca pe site (CalendarAn).
export const ZILE = ["LU", "MA", "MI", "JO", "VI", "SÂ", "DU"];
// „20 zile lucrătoare”, fără „de”, ca în calendarul de pe pagină (proprietar, 27 sept. 2026).
export const zileLucratoareText = (n: number) => `${n} zile lucrătoare`;

// Paleta site-ului (globals.css și clasele din CalendarAn).
export const CULORI = {
  canvas: "#f8f5ef", //   fundalul paginii
  surface: "#fffdf9", //  cardul
  bordura: "#e7e5e4", //  stone-200, conturul cardului
  antet: "#efe9de", //    capul de tabel
  linie: "#d6d3d1", //    stone-300, liniile tabelului
  cerneala: "#1c1917", // stone-900: textul și sărbătoarea
  text: "#44403c", //     stone-700: zilele lucrătoare
  gri: "#57534e", //      stone-600: etichetele și weekendul
  weekend: "#f5f5f4", //  stone-100
};
const C = CULORI;

function fundal(doc: jsPDF) {
  doc.setFillColor(C.canvas).rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F");
}

function card(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setFillColor(C.surface).setDrawColor(C.bordura).setLineWidth(0.25).roundedRect(x, y, w, h, 1.6, 1.6, "FD");
}

function semnatura(doc: jsPDF, x: number, y: number) {
  doc.setFont("Liberation", "normal").setFontSize(7.5).setTextColor(C.gri).text("salariile.ro", x, y, { align: "right" });
}

/** A4 vertical: tabelul lunilor și lista sărbătorilor, fiecare într-un card. */
export function deseneazaPdfTabel(doc: jsPDF, { an, rows, sarbatori, total, ore, libere }: DateZileLucratoare) {
  fundal(doc);
  const x0 = 18, lat = 174;
  doc.setFont("Liberation", "bold").setFontSize(20).setTextColor(C.cerneala).text(`Zile lucrătoare ${an}`, x0, 24);

  // Tabelul, ca TabelArticol: cutie cu contur, antet pe fundal `antet`, linii fine.
  const col = [x0 + 5, x0 + 64, x0 + 100, x0 + 136, x0 + lat - 5];
  const cap = ["Luna", "Zile", "Lucrătoare", "Ore (8/zi)", "Libere"];
  const rh = 8, y0 = 34;
  const hTabel = rh * (rows.length + 2);
  card(doc, x0, y0, lat, hTabel);
  doc.setFillColor(C.antet).rect(x0 + 0.2, y0 + 0.2, lat - 0.4, rh - 0.2, "F");
  let y = y0;
  doc.setFont("Liberation", "bold").setFontSize(8).setTextColor(C.gri);
  cap.forEach((c, i) => doc.text(c.toUpperCase(), col[i], y + 5.2, { align: i === 0 ? "left" : "right" }));
  y += rh;
  doc.setFontSize(10.5);
  const rand = (v: string[], ingrosat: boolean) => {
    doc.setDrawColor(C.linie).setLineWidth(0.2).line(x0, y, x0 + lat, y);
    doc.setFont("Liberation", ingrosat ? "bold" : "normal").setTextColor(ingrosat ? C.cerneala : C.text);
    v.forEach((c, i) => doc.text(c, col[i], y + 5.4, { align: i === 0 ? "left" : "right" }));
    y += rh;
  };
  rows.forEach((r) => rand([r.name, String(r.zileCalendaristice), String(r.lucratoare), String(r.ore), String(r.libere)], false));
  rand([`Total ${an}`, String(rows.reduce((s, r) => s + r.zileCalendaristice, 0)), String(total), ore.toLocaleString("ro-RO"), String(libere)], true);

  // Sărbătorile, ca în cardul din dreapta tabelului de pe pagină.
  const yS = y0 + hTabel + 8;
  const hS = 14 + sarbatori.length * 5.4;
  card(doc, x0, yS, lat, hS);
  doc.setFont("Liberation", "bold").setFontSize(11).setTextColor(C.cerneala).text(`Sărbători legale ${an}`, x0 + 5, yS + 8);
  let ys = yS + 14.5;
  doc.setFontSize(9.5);
  for (const s of sarbatori) {
    doc.setFont("Liberation", "bold").setTextColor(s.weekend ? C.gri : C.cerneala).text(s.data, x0 + 5, ys);
    doc.setFont("Liberation", "normal").setTextColor(C.gri).text(`${s.label}${s.weekend ? " · în weekend" : ""}`, x0 + 40, ys);
    ys += 5.4;
  }
  semnatura(doc, x0 + lat, 289);
}

// ─── Calendarul, la mărimile de pe site ──────────────────────────────────────
// Măsurat pe /zile-lucratoare-2025 la 1280 px (27 sept. 2026): conținut de 1104 px,
// 3 carduri pe rând de 357×294, 16 px între ele, padding 24, colțuri de 6; căsuțele
// zilelor 41×28 la 4 px una de alta, rânduri la 32 px. Imaginea și PDF-ul desenează din
// aceleași cifre, printr-un „pictor” care știe doar dreptunghiuri și text.

export type Pictor = {
  dreptunghi(x: number, y: number, w: number, h: number, r: number, umplere: string, contur?: string): void;
  text(t: string, x: number, y: number, o: { px: number; gros?: boolean; culoare: string; aliniere?: "left" | "center" | "right" }): void;
  latime(t: string, px: number, gros?: boolean): number;
};

export const MACHETA = { latime: 1104, coloane: 3, spatiu: 16, cardH: 294, pad: 24, celulaH: 28, spatiuCelula: 4, rand: 32 };
const M = MACHETA;
const SUS_GRILA = 86; // titlul (30) + 16 + legenda (16) + 24

/** Înălțimea desenului, în px de site. */
export const inaltimeCalendar = (luni: number) => SUS_GRILA + Math.ceil(luni / M.coloane) * (M.cardH + M.spatiu) - M.spatiu;

export function deseneazaCalendar(p: Pictor, an: number, luni: LunaCalendar[]) {
  // Titlul secțiunii: TITLU_SECTIUNE, 24 px bold.
  p.text(`Calendarul anului ${an}`, 0, 15, { px: 24, gros: true, culoare: C.cerneala });
  // Legenda: pătrățele de 12 px, 8 px până la text, 20 px între elemente.
  let x = 0;
  for (const [t, umplere, contur] of [["Zi lucrătoare", C.surface, C.linie], ["Weekend", C.weekend, C.linie], ["Sărbătoare legală", C.cerneala, undefined]] as const) {
    p.dreptunghi(x, 48, 12, 12, 2, umplere, contur);
    p.text(t, x + 20, 54, { px: 12, culoare: C.gri });
    x += 20 + p.latime(t, 12) + 20;
  }
  const w = (M.latime - (M.coloane - 1) * M.spatiu) / M.coloane;
  const interior = w - 2 * (M.pad + 1);
  const cw = (interior - 6 * M.spatiuCelula) / 7;
  luni.forEach((l, i) => {
    const cx = (i % M.coloane) * (w + M.spatiu), cy = SUS_GRILA + Math.floor(i / M.coloane) * (M.cardH + M.spatiu);
    p.dreptunghi(cx, cy, w, M.cardH, 6, C.surface, C.bordura);
    const x0 = cx + M.pad + 1;
    p.text(l.nume, x0, cy + 37, { px: 16, gros: true, culoare: C.cerneala });
    p.text(zileLucratoareText(l.lucr), cx + w - M.pad, cy + 38, { px: 12, culoare: C.gri, aliniere: "right" });
    ZILE.forEach((z, j) => p.text(z, x0 + j * (cw + M.spatiuCelula) + cw / 2, cy + 69, { px: 12, gros: true, culoare: C.gri, aliniere: "center" }));
    l.cells.forEach((c, k) => {
      if (!c) return;
      const zx = x0 + (k % 7) * (cw + M.spatiuCelula), zy = cy + 81 + Math.floor(k / 7) * M.rand;
      if (c.name || c.weekend) p.dreptunghi(zx, zy, cw, M.celulaH, 4, c.name ? C.cerneala : C.weekend);
      p.text(String(c.day), zx + cw / 2, zy + M.celulaH / 2, { px: 12, gros: Boolean(c.name), culoare: c.name ? "#ffffff" : c.weekend ? C.gri : C.text, aliniere: "center" });
    });
  });
}

/** A4 vertical, aceeași machetă ca pe site, scalată pe lățimea paginii. */
export function deseneazaPdfCalendar(doc: jsPDF, { an, luni }: DateZileLucratoare) {
  fundal(doc);
  const margine = 12, k = (210 - 2 * margine) / M.latime; // mm pe px
  const X = (px: number) => margine + px * k, Y = (px: number) => 14 + px * k;
  const pt = (px: number) => px * k * 2.835;
  const pictor: Pictor = {
    dreptunghi(x, y, w, h, r, umplere, contur) {
      doc.setFillColor(umplere);
      if (contur) doc.setDrawColor(contur).setLineWidth(0.2);
      doc.roundedRect(X(x), Y(y), w * k, h * k, r * k, r * k, contur ? "FD" : "F");
    },
    text(t, x, y, o) {
      doc.setFont("Liberation", o.gros ? "bold" : "normal").setFontSize(pt(o.px)).setTextColor(o.culoare);
      doc.text(t, X(x), Y(y), { align: o.aliniere ?? "left", baseline: "middle" });
    },
    latime(t, px, gros) {
      doc.setFont("Liberation", gros ? "bold" : "normal").setFontSize(pt(px));
      return doc.getTextWidth(t) / k;
    },
  };
  deseneazaCalendar(pictor, an, luni);
  semnatura(doc, 210 - margine, Y(inaltimeCalendar(luni.length)) + 6);
}
