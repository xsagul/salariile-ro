"use client";
// Descărcările de pe paginile de zile lucrătoare (cerute de proprietar pe 27 sept. 2026,
// după primele două rezultate din Google): tabelul în PDF, ca la calculator-salarii.ro,
// și calendarul în PDF și PNG, ca la Edenred. Fișierele se desenează direct în browser,
// fără captură de pagină: jsPDF pentru PDF, un <canvas> pentru PNG. Fontul PDF-ului
// (Liberation Sans, SIL OFL, în public/fonts) are ș, ț, ă și se încarcă doar la clic.

import { useState } from "react";
import { trimiteEveniment } from "@/lib/analytics";
import { CULORI as C, MACHETA, deseneazaCalendar, deseneazaPdfCalendar, deseneazaPdfTabel, inaltimeCalendar, type DateZileLucratoare, type Pictor } from "@/lib/pdf-zile-lucratoare";

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
  const doc = await documentNou("portrait");
  deseneazaPdfCalendar(doc, d);
  doc.save(`calendar-zile-lucratoare-${d.an}.pdf`);
}

// ─── PNG ─────────────────────────────────────────────────────────────────────

// Calendarul de pe pagină, la aceleași mărimi (MACHETA), desenat de două ori mai mare
// ca să fie clar și pe ecranele dense: 48 px margine, titlu, legendă, 12 carduri pe 3 coloane.
async function pngCalendar({ an, luni }: Props) {
  const margine = 48, scara = 2;
  const W = MACHETA.latime + 2 * margine, H = inaltimeCalendar(luni.length) + 2 * margine + 24;
  const c = document.createElement("canvas");
  c.width = W * scara; c.height = H * scara;
  const g = c.getContext("2d")!;
  g.scale(scara, scara);
  const familie = getComputedStyle(document.body).fontFamily || "sans-serif";
  const font = (px: number, gros?: boolean) => `${gros ? 600 : 400} ${px}px ${familie}`;
  await document.fonts?.ready;

  g.fillStyle = C.canvas; g.fillRect(0, 0, W, H);
  g.save();
  g.translate(margine, margine);
  const pictor: Pictor = {
    dreptunghi(x, y, w, h, r, umplere, contur) {
      g.beginPath(); g.roundRect(x, y, w, h, r);
      g.fillStyle = umplere; g.fill();
      if (contur) { g.strokeStyle = contur; g.lineWidth = 1; g.stroke(); }
    },
    text(t, x, y, o) {
      g.font = font(o.px, o.gros); g.fillStyle = o.culoare; g.textAlign = o.aliniere ?? "left"; g.textBaseline = "middle";
      g.fillText(t, x, y);
    },
    latime(t, px, gros) { g.font = font(px, gros); return g.measureText(t).width; },
  };
  deseneazaCalendar(pictor, an, luni);
  g.restore();
  g.font = font(12); g.fillStyle = C.gri; g.textAlign = "right"; g.textBaseline = "alphabetic";
  g.fillText("salariile.ro", W - margine, H - margine / 2);

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

export default function DescarcaZileLucratoare({ className = "mt-4", ...props }: Props & { ce: "tabel" | "calendar"; className?: string }) {
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
    <div className={`${className} flex flex-wrap items-center gap-3`}>
      {props.ce === "tabel"
        ? buton("pdf-tabel", "Descarcă tabelul (PDF)")
        : (<>{buton("pdf-calendar", "Descarcă calendarul (PDF)")}{buton("png-calendar", "Descarcă calendarul (imagine)")}</>)}
      {eroare ? <span className="text-sm text-stone-600">Nu s-a putut descărca. Încearcă din nou.</span> : null}
    </div>
  );
}
