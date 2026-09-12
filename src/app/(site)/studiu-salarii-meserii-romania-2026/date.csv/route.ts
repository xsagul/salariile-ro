import { NextResponse } from "next/server";
import { LUNA_REFERINTA, TOTAL_ECONOMIE } from "@/lib/ins-date";
import { MESERII, dateMeserie, type DateMeserie } from "@/lib/meserii";

function csvEscape(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function GET() {
  const rows = MESERII.map((meserie) => dateMeserie(meserie))
    .filter((date): date is DateMeserie => date !== null)
    .sort((a, b) => b.sector.brutCurent - a.sector.brutCurent || a.meserie.nume.localeCompare(b.meserie.nume, "ro"));

  const header = [
    "meserie",
    "slug",
    "categorie",
    "cod_cor",
    "caen",
    "activitate_ins",
    "brut_lunar_lei",
    "net_standard_lei",
    "media_economie_brut_lei",
    "diferenta_fata_de_economie_pct",
    "luna_referinta",
    "sursa",
  ];

  const lines = [header.join(",")];
  for (const row of rows) {
    const diferenta = ((row.sector.brutCurent - TOTAL_ECONOMIE.brutCurent) / TOTAL_ECONOMIE.brutCurent) * 100;
    lines.push(
      [
        row.meserie.nume,
        row.meserie.slug,
        row.categorie.nume,
        row.meserie.cor ?? "",
        row.sector.cheie,
        row.sector.denumire,
        row.sector.brutCurent,
        row.netStandard,
        TOTAL_ECONOMIE.brutCurent,
        diferenta.toFixed(1),
        LUNA_REFERINTA,
        "INS TEMPO-Online / Salariile.ro",
      ].map(csvEscape).join(","),
    );
  }

  return new NextResponse(`\uFEFF${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="harta-salariilor-romania-2026.csv"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
