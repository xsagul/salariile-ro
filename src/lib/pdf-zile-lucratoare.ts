// Desenul PDF-urilor de pe paginile de zile lucrătoare, separat de butoane ca să poată fi
// generat și verificat și în afara browserului. Documentul vine gata făcut, cu fontul
// „Liberation” înregistrat (normal și bold), de la DescarcaZileLucratoare.tsx.
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

export const ZILE = ["L", "M", "M", "J", "V", "S", "D"];
// „20 de zile lucrătoare”, dar „18 zile lucrătoare”, ca în calendarul de pe pagină.
export const zileLucratoareText = (n: number) => `${n}${n % 100 >= 20 || n % 100 === 0 ? " de" : ""} zile lucrătoare`;
// Culorile calendarului de pe pagină (CalendarAn): sărbătoarea stone-900 pe alb,
// weekendul stone-100 cu text stone-600.
export const CERNEALA = "#1c1917";
export const GRI = "#57534e";
export const WEEKEND = "#f5f5f4";
const ANTET = "#efe9de";
const LINIE = "#d6d3d1";

function subsol(doc: jsPDF, an: number, x: number, y: number) {
  doc.setFont("Liberation", "normal").setFontSize(8).setTextColor(GRI);
  doc.text(`salariile.ro/zile-lucratoare-${an} · program luni–vineri, sărbătorile din Codul Muncii, art. 139`, x, y);
}

/** A4 vertical: tabelul lunilor, apoi lista sărbătorilor. */
export function deseneazaPdfTabel(doc: jsPDF, { an, rows, sarbatori, total, ore, libere }: DateZileLucratoare) {
  const x0 = 20, lat = 170;
  doc.setFont("Liberation", "bold").setFontSize(20).setTextColor(CERNEALA);
  doc.text(`Zile lucrătoare ${an}`, x0, 26);
  doc.setFont("Liberation", "normal").setFontSize(11).setTextColor(GRI);
  doc.text(`${total} de zile lucrătoare, adică ${ore.toLocaleString("ro-RO")} de ore la program de 8 ore pe zi.`, x0, 34);

  const col = [x0 + 4, x0 + 62, x0 + 98, x0 + 134, x0 + lat - 4];
  const cap = ["Luna", "Zile", "Lucrătoare", "Ore (8/zi)", "Libere"];
  let y = 46;
  const rh = 8.2;
  doc.setFillColor(ANTET).rect(x0, y, lat, rh, "F");
  doc.setFont("Liberation", "bold").setFontSize(9).setTextColor(GRI);
  cap.forEach((c, i) => doc.text(c.toUpperCase(), col[i], y + 5.4, { align: i === 0 ? "left" : "right" }));
  y += rh;
  doc.setFontSize(11);
  const rand = (v: string[], ingrosat: boolean) => {
    doc.setFont("Liberation", ingrosat ? "bold" : "normal").setTextColor(CERNEALA);
    v.forEach((c, i) => doc.text(c, col[i], y + 5.6, { align: i === 0 ? "left" : "right" }));
    y += rh;
    doc.setDrawColor(LINIE).setLineWidth(0.2).line(x0, y, x0 + lat, y);
  };
  rows.forEach((r) => rand([r.name, String(r.zileCalendaristice), String(r.lucratoare), String(r.ore), String(r.libere)], false));
  rand([`Total ${an}`, String(rows.reduce((s, r) => s + r.zileCalendaristice, 0)), String(total), ore.toLocaleString("ro-RO"), String(libere)], true);
  doc.setDrawColor(LINIE).rect(x0, 46, lat, y - 46);

  y += 12;
  doc.setFont("Liberation", "bold").setFontSize(12).setTextColor(CERNEALA).text(`Sărbători legale ${an}`, x0, y);
  y += 7;
  doc.setFontSize(10);
  for (const s of sarbatori) {
    doc.setFont("Liberation", "bold").setTextColor(s.weekend ? GRI : CERNEALA).text(s.data, x0, y);
    doc.setFont("Liberation", "normal").text(`${s.label}${s.weekend ? " · în weekend" : ""}`, x0 + 34, y);
    y += 5.6;
  }
  subsol(doc, an, x0, 285);
}

/** A4 orizontal: cele 12 luni, 4 pe rând, cu sărbătorile marcate. */
export function deseneazaPdfCalendar(doc: jsPDF, { an, luni, total, ore }: DateZileLucratoare) {
  doc.setFont("Liberation", "bold").setFontSize(18).setTextColor(CERNEALA);
  doc.text(`Calendar zile lucrătoare ${an}`, 14, 16);
  doc.setFont("Liberation", "normal").setFontSize(10).setTextColor(GRI);
  doc.text(`${total} de zile lucrătoare · ${ore.toLocaleString("ro-RO")} de ore · sărbătorile legale sunt marcate`, 14, 22);

  const coloane = 4, lw = 64, lh = 55, gx = 6.3, x0 = 14, y0 = 30;
  const celula = 8.4;
  luni.forEach((l, i) => {
    const x = x0 + (i % coloane) * (lw + gx);
    const y = y0 + Math.floor(i / coloane) * lh;
    doc.setFont("Liberation", "bold").setFontSize(11).setTextColor(CERNEALA).text(l.nume, x, y + 4);
    doc.setFont("Liberation", "normal").setFontSize(8).setTextColor(GRI).text(zileLucratoareText(l.lucr), x + lw, y + 4, { align: "right" });
    doc.setFontSize(7.5);
    ZILE.forEach((z, j) => doc.setTextColor(j >= 5 ? GRI : CERNEALA).text(z, x + j * celula + celula / 2 + 1, y + 10.5, { align: "center" }));
    l.cells.forEach((c, k) => {
      if (!c) return;
      const cx = x + (k % 7) * celula + 1, cy = y + 12.5 + Math.floor(k / 7) * 6.6;
      if (c.name) doc.setFillColor(CERNEALA).roundedRect(cx + 0.6, cy, celula - 1.2, 5.6, 0.8, 0.8, "F");
      else if (c.weekend) doc.setFillColor(WEEKEND).roundedRect(cx + 0.6, cy, celula - 1.2, 5.6, 0.8, 0.8, "F");
      doc.setFont("Liberation", c.name ? "bold" : "normal").setFontSize(8)
        .setTextColor(c.name ? "#ffffff" : c.weekend ? GRI : CERNEALA)
        .text(String(c.day), cx + celula / 2, cy + 4, { align: "center" });
    });
  });
  subsol(doc, an, 14, 203);
}
