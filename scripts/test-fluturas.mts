// scripts/test-fluturas.mts
// Test vizual LOCAL pentru fluturașul PDF: rulează exact logica din
// CalculatorSalariu.tsx (calcul real din fiscal.ts + același layout) și scrie
// PDF-urile pe disc, ca să poată fi inspectate. Nu face parte din build.
// Rulare: npx tsx scripts/test-fluturas.mts

import { jsPDF } from "jspdf";
import fs from "node:fs";
import { calculeaza, SALARIU_MINIM, DEDUCERE_MINIM, type Rezultat } from "../src/lib/fiscal";
import { zileLucratoareLuna } from "../src/lib/sarbatori";

function fixDiacritice(text: string): string {
  return text
    .replace(/ă/g, "a").replace(/Ă/g, "A")
    .replace(/â/g, "a").replace(/Â/g, "A")
    .replace(/î/g, "i").replace(/Î/g, "I")
    .replace(/ș/g, "s").replace(/Ș/g, "S")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ț/g, "t").replace(/Ț/g, "T")
    .replace(/ţ/g, "t").replace(/Ţ/g, "T");
}

// ⇩ COPIE 1:1 a generarePDFFluturas din CalculatorSalariu.tsx (fără importul dinamic + save pe disc)
async function generarePDFFluturas(opts: {
  brut: number;
  rez: Rezultat;
  esteSalariuMinim: boolean;
  facilitate: number;
  nrTichete: string;
  valoareTichet: string;
  scutitImpozit: boolean;
  out: string;
}): Promise<void> {
  const { brut, rez, esteSalariuMinim, facilitate, nrTichete, valoareTichet, scutitImpozit } = opts;

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const facilitateEf = esteSalariuMinim ? facilitate : 0;
  const tichete = rez.tichete;
  const bazaCas = brut - facilitateEf;
  const bazaCass = brut - facilitateEf + tichete;
  const totalRetineri = rez.cas + rez.cass + rez.impozit;

  const azi = new Date();
  const zileLucr = zileLucratoareLuna(azi.getFullYear(), azi.getMonth());
  const lunaNume = azi
    .toLocaleDateString("ro-RO", { month: "long", year: "numeric" })
    .toUpperCase();

  const pageWidth = 210;
  const margin = 17;
  const boxW = pageWidth - margin * 2;
  const FS = 9;
  const COLS = 84;
  const xText = margin + 4;
  const LH = 5;
  let y = 20;

  const lei = (n: number) => `${n.toLocaleString("ro-RO")} lei`;
  const mono = (bold = false, dim = false) => {
    doc.setFont("courier", bold ? "bold" : "normal");
    doc.setFontSize(FS);
    doc.setTextColor(dim ? 110 : 0);
  };

  const rand = (label: string, valoare: string, o?: { bold?: boolean; dim?: boolean }) => {
    mono(o?.bold, o?.dim);
    const l = fixDiacritice(label);
    const v = fixDiacritice(valoare);
    const dots = ".".repeat(Math.max(2, COLS - l.length - v.length - 2));
    doc.text(`${l} ${dots} ${v}`, xText, y);
    y += LH;
  };

  const rand2 = (st: string, dr: string, o?: { bold?: boolean }) => {
    mono(o?.bold);
    const s = fixDiacritice(st);
    const d = fixDiacritice(dr);
    doc.text(s.padEnd(Math.max(s.length + 1, COLS - d.length)) + d, xText, y);
    y += LH;
  };

  const sectiune = (titlu?: string) => {
    y += 1;
    doc.setLineWidth(0.2);
    doc.line(margin, y - 3.4, margin + boxW, y - 3.4);
    y += 1.5;
    if (titlu) {
      mono(true);
      doc.text(fixDiacritice(titlu), xText, y);
      y += LH;
    }
  };

  doc.setFont("courier", "bold");
  doc.setFontSize(13);
  doc.text("FLUTURAS DE SALARIU", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(10);
  doc.text(fixDiacritice(`Luna: ${lunaNume}`), pageWidth / 2, y, { align: "center" });
  y += 8;

  const yBoxTop = y - 4;

  rand2(`Unitatea: ${"_".repeat(34)}`, `C.U.I.: ${"_".repeat(14)}`);
  rand2(`Angajat:  ${"_".repeat(34)}`, `Marca:  ${"_".repeat(14)}`);
  rand2(`Functia:  ${"_".repeat(34)}`, `CNP:    ${"_".repeat(14)}`);

  sectiune();
  rand2(
    `Zile lucratoare: ${zileLucr}    Zile lucrate: ${zileLucr}    Ore lucrate: ${zileLucr * 8}`,
    "Norma: 8 h/zi"
  );

  sectiune("DREPTURI SALARIALE");
  rand("Salariu de baza (incadrare)", lei(brut));
  if (tichete > 0) {
    const nrT = parseInt(nrTichete) || 0;
    const valT = parseInt(valoareTichet) || 0;
    const detaliu = nrT > 0 && valT > 0 && nrT * valT === tichete ? ` (${nrT} buc x ${valT} lei)` : "";
    rand(`Tichete de masa${detaliu}`, lei(tichete));
  }
  rand("TOTAL DREPTURI", lei(brut + tichete), { bold: true });

  sectiune("RETINERI");
  if (facilitateEf > 0) {
    rand("Suma netaxabila salariu minim (OUG 89/2025)", lei(facilitateEf), { dim: true });
  }
  rand(`C.A.S. pensii 25% (baza: ${lei(bazaCas)})`, lei(rez.cas));
  rand(`C.A.S.S. sanatate 10% (baza: ${lei(bazaCass)})`, lei(rez.cass));
  if (rez.deducerePersonala > 0) {
    rand("Deducere personala (netaxabila)", lei(rez.deducerePersonala), { dim: true });
  }
  rand("Baza de calcul impozit", lei(Math.round(rez.bazaCalculImpozit)), { dim: true });
  rand("Impozit pe venit 10%", scutitImpozit ? "0 lei (scutit)" : lei(rez.impozit));
  rand("TOTAL RETINERI", lei(totalRetineri), { bold: true });

  sectiune("DE PLATA");
  rand("SALARIU NET (virat in cont)", lei(rez.netBani), { bold: true });
  if (tichete > 0) {
    rand("Tichete de masa (pe card, valoare integrala)", lei(tichete));
    rand("TOTAL INCASAT (cont + card)", lei(rez.net), { bold: true });
  }
  rand("Avans", "0 lei");
  rand("REST DE PLATA", lei(rez.netBani), { bold: true });

  sectiune("ANGAJATOR (INFORMATIV)");
  rand(`C.A.M. 2,25% (baza: ${lei(bazaCas)})`, lei(rez.cam));
  rand(`COST TOTAL ANGAJATOR (brut + CAM${tichete > 0 ? " + tichete" : ""})`, lei(rez.costTotal), { bold: true });

  sectiune();
  rand2("Intocmit (angajator),", "Am primit (angajat),");
  y += 4;
  rand2("_".repeat(24), "_".repeat(24));
  y += 1;

  doc.setLineWidth(0.4);
  doc.rect(margin, yBoxTop, boxW, y - yBoxTop - 2);

  y += 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(
    fixDiacritice("Document informativ generat pe salariile.ro, conform HG 146/2026 si OUG 89/2025."),
    pageWidth / 2, y, { align: "center" }
  );
  y += 3.6;
  doc.text(
    fixDiacritice(`Nu inlocuieste fluturasul oficial emis de angajator. Generat la ${azi.toLocaleString("ro-RO")}.`),
    pageWidth / 2, y, { align: "center" }
  );

  fs.writeFileSync(opts.out, Buffer.from(doc.output("arraybuffer")));
  console.log("scris:", opts.out);
}

// Caz 1: salariul minim cu facilitate + tichete (21 x 40 lei) — cazul cel mai complex
const rez1 = calculeaza({
  brut: String(SALARIU_MINIM), tichete: "840", functieDeBAza: true,
  persoanePretretinere: 0, varstaSub26: false, copiiScolarizati: 0, scutitImpozit: false,
})!;
await generarePDFFluturas({
  brut: SALARIU_MINIM, rez: rez1, esteSalariuMinim: true, facilitate: DEDUCERE_MINIM,
  nrTichete: "21", valoareTichet: "40", scutitImpozit: false, out: "test-fluturas-minim.pdf",
});

// Caz 2: 8000 brut, fără tichete, fără facilitate — cazul standard
const rez2 = calculeaza({
  brut: "8000", tichete: "", functieDeBAza: true,
  persoanePretretinere: 0, varstaSub26: false, copiiScolarizati: 0, scutitImpozit: false,
})!;
await generarePDFFluturas({
  brut: 8000, rez: rez2, esteSalariuMinim: false, facilitate: DEDUCERE_MINIM,
  nrTichete: "", valoareTichet: "", scutitImpozit: false, out: "test-fluturas-8000.pdf",
});
