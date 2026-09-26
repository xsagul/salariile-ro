"use client";
// Descărcările de pe paginile de zile lucrătoare (cerute de proprietar pe 27 sept. 2026,
// după primele două rezultate din Google): tabelul în PDF, ca la calculator-salarii.ro,
// și calendarul în PDF și PNG, ca la Edenred. Fișierele se desenează direct în browser,
// fără captură de pagină: jsPDF pentru PDF, un <canvas> pentru PNG. Fontul PDF-ului
// (Liberation Sans, SIL OFL, în public/fonts) are ș, ț, ă și se încarcă doar la clic.

import { useState } from "react";
import { trimiteEveniment } from "@/lib/analytics";
import { CERNEALA, GRI, ZILE, deseneazaPdfCalendar, deseneazaPdfTabel, type DateZileLucratoare } from "@/lib/pdf-zile-lucratoare";

type Props = DateZileLucratoare;

// ─── PDF ─────────────────────────────────────────────────────────────────────

async function base64(url: string) {
  const buf = new Uint8Array(await (await fetch(url)).arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}

async function documentNou(orientare: "portrait" | "landscape") {
  const [{ jsPDF }, normal, bold] = await Promise.all([
    import("jspdf"),
    base64("/fonts/LiberationSans-Regular.ttf"),
    base64("/fonts/LiberationSans-Bold.ttf"),
  ]);
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: orientare });
  doc.addFileToVFS("LiberationSans-Regular.ttf", normal);
  doc.addFont("LiberationSans-Regular.ttf", "Liberation", "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", bold);
  doc.addFont("LiberationSans-Bold.ttf", "Liberation", "bold");
  return doc;
}

async function pdfTabel(d: Props) {
  const doc = await documentNou("portrait");
  deseneazaPdfTabel(doc, d);
  doc.save(`zile-lucratoare-${d.an}.pdf`);
}

async function pdfCalendar(d: Props) {
  const doc = await documentNou("landscape");
  deseneazaPdfCalendar(doc, d);
  doc.save(`calendar-zile-lucratoare-${d.an}.pdf`);
}

// ─── PNG ─────────────────────────────────────────────────────────────────────

// Aceeași așezare ca la Edenred: 6 luni pe rând, două rânduri, lista sărbătorilor în dreapta.
async function pngCalendar({ an, luni, sarbatori, total, ore }: Props) {
  const W = 1920, H = 1080;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const font = getComputedStyle(document.body).fontFamily || "sans-serif";
  const f = (px: number, bold = false) => `${bold ? 700 : 400} ${px}px ${font}`;
  await document.fonts?.ready;

  g.fillStyle = "#f8f5ef"; g.fillRect(0, 0, W, H);
  g.fillStyle = CERNEALA; g.font = f(30, true); g.fillText("salariile.ro", 90, 100);
  g.font = f(64, true); g.fillText(`Calendar zile lucrătoare ${an}`, 90, 190);
  g.fillStyle = GRI; g.font = f(28); g.fillText(`${total} de zile lucrătoare · ${ore.toLocaleString("ro-RO")} de ore la 8 ore pe zi`, 90, 240);

  const lw = 212, gx = 28, x0 = 90, y0 = 320, lh = 350, celula = 30;
  g.textAlign = "center";
  luni.forEach((l, i) => {
    const x = x0 + (i % 6) * (lw + gx), y = y0 + Math.floor(i / 6) * lh;
    g.fillStyle = CERNEALA; g.font = f(26, true); g.fillText(l.nume.toUpperCase(), x + lw / 2, y);
    g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(x, y + 14, lw, 34, 17); g.fill();
    g.fillStyle = GRI; g.font = f(19); g.fillText(`${l.lucr} zile lucrătoare`, x + lw / 2, y + 38);
    g.font = f(18, true);
    ZILE.forEach((z, j) => { g.fillStyle = j >= 5 ? GRI : CERNEALA; g.fillText(z, x + j * celula + celula / 2 + 1, y + 82); });
    l.cells.forEach((cel, k) => {
      if (!cel) return;
      const cx = x + (k % 7) * celula + 1, cy = y + 96 + Math.floor(k / 7) * 36;
      if (cel.name || cel.weekend) {
        // Pe fundalul crem al imaginii, stone-100 nu se vede; aici weekendul e un ton mai închis.
        g.fillStyle = cel.name ? CERNEALA : "#e9e4dc";
        g.beginPath(); g.roundRect(cx + 2, cy, celula - 4, 30, 5); g.fill();
      }
      g.fillStyle = cel.name ? "#ffffff" : cel.weekend ? GRI : CERNEALA;
      g.font = f(18, Boolean(cel.name));
      g.fillText(String(cel.day), cx + celula / 2, cy + 21);
    });
  });

  g.textAlign = "left";
  const xl = x0 + 6 * (lw + gx) + 20;
  g.fillStyle = CERNEALA; g.font = f(26, true); g.fillText("Sărbători legale", xl, y0);
  sarbatori.forEach((s, i) => {
    const y = y0 + 46 + i * 36;
    g.fillStyle = s.weekend ? GRI : CERNEALA; g.font = f(18, true); g.fillText(s.data, xl, y);
    g.font = f(18); g.fillText(s.label.length > 21 ? `${s.label.slice(0, 20)}…` : s.label, xl + 150, y);
  });
  g.fillStyle = GRI; g.font = f(20); g.fillText(`salariile.ro/zile-lucratoare-${an} · program luni–vineri, sărbătorile din Codul Muncii, art. 139`, 90, H - 50);

  const blob: Blob = await new Promise((r, e) => c.toBlob((b) => (b ? r(b) : e(new Error("png"))), "image/png"));
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `calendar-zile-lucratoare-${an}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ─── Butoanele ───────────────────────────────────────────────────────────────

const BUTON =
  "inline-flex min-h-11 items-center rounded border border-stone-300 bg-surface px-4 text-sm font-medium text-stone-900 shadow-soft transition-colors hover:bg-stone-100 disabled:opacity-60";

export default function DescarcaZileLucratoare(props: Props & { ce: "tabel" | "calendar" }) {
  const [lucreaza, setLucreaza] = useState<string | null>(null);
  const [eroare, setEroare] = useState(false);
  const porneste = async (tip: "pdf-tabel" | "pdf-calendar" | "png-calendar") => {
    setLucreaza(tip);
    setEroare(false);
    try {
      if (tip === "pdf-tabel") await pdfTabel(props);
      else if (tip === "pdf-calendar") await pdfCalendar(props);
      else await pngCalendar(props);
      trimiteEveniment("file_download", {
        file_extension: tip.startsWith("png") ? "png" : "pdf",
        file_name: `${tip}-${props.an}`,
        link_text: tip,
        instrument: "zile_lucratoare",
      });
    } catch {
      setEroare(true);
    } finally {
      setLucreaza(null);
    }
  };
  const buton = (tip: "pdf-tabel" | "pdf-calendar" | "png-calendar", text: string) => (
    <button type="button" className={BUTON} disabled={lucreaza !== null} onClick={() => porneste(tip)}>
      {lucreaza === tip ? "Se pregătește…" : text}
    </button>
  );
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {props.ce === "tabel"
        ? buton("pdf-tabel", "Descarcă tabelul (PDF)")
        : (<>{buton("pdf-calendar", "Descarcă calendarul (PDF)")}{buton("png-calendar", "Descarcă calendarul (imagine)")}</>)}
      {eroare ? <span className="text-sm text-stone-600">Nu s-a putut descărca. Încearcă din nou.</span> : null}
    </div>
  );
}
