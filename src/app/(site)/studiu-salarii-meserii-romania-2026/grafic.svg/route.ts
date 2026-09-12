import { NextResponse } from "next/server";
import { TOTAL_ECONOMIE } from "@/lib/ins-date";
import { MESERII, dateMeserie, type DateMeserie } from "@/lib/meserii";

function esc(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[char] ?? char));
}

export function GET() {
  const rows = MESERII.map((meserie) => dateMeserie(meserie))
    .filter((date): date is DateMeserie => date !== null);

  const activitati = Array.from(new Map(rows.map((item) => [item.sector.cheie, item])).values())
    .sort((a, b) => b.sector.brutCurent - a.sector.brutCurent)
    .slice(0, 10);

  const max = activitati[0]?.sector.brutCurent ?? 1;
  const width = 1200;
  const height = 760;
  const left = 410;
  const right = 90;
  const barWidth = width - left - right;
  const rowH = 56;
  const top = 130;

  const bars = activitati.map((item, index) => {
    const y = top + index * rowH;
    const w = Math.round((item.sector.brutCurent / max) * barWidth);
    return `<text x="40" y="${y + 24}" font-family="Arial, sans-serif" font-size="20" fill="#1c1917">${esc(item.meserie.nume)}</text>
      <rect x="${left}" y="${y}" width="${w}" height="32" rx="4" fill="#292524" />
      <text x="${left + w + 12}" y="${y + 24}" font-family="Arial, sans-serif" font-size="18" fill="#44403c">${item.sector.brutCurent.toLocaleString("ro-RO")} lei</text>`;
  }).join("\n");

  const avgX = left + Math.round((TOTAL_ECONOMIE.brutCurent / max) * barWidth);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#fafaf9"/>
    <text x="40" y="52" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#1c1917">Harta salariilor în România 2026</text>
    <text x="40" y="86" font-family="Arial, sans-serif" font-size="19" fill="#57534e">Top 10 activități economice reprezentate în catalogul Salariile.ro · sursa: INS TEMPO-Online</text>
    <line x1="${avgX}" y1="112" x2="${avgX}" y2="${top + activitati.length * rowH - 15}" stroke="#a8a29e" stroke-width="2" stroke-dasharray="6 6"/>
    <text x="${avgX + 8}" y="118" font-family="Arial, sans-serif" font-size="15" fill="#78716c">media economiei</text>
    ${bars}
    <text x="40" y="720" font-family="Arial, sans-serif" font-size="16" fill="#78716c">Notă: valorile sunt medii brute ale activităților CAEN asociate meseriilor, nu salarii individuale garantate.</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": 'inline; filename="harta-salariilor-romania-2026.svg"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
