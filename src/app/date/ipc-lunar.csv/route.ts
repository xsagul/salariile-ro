// Seria lunară a indicelui prețurilor de consum (INS, TEMPO IPC102A), descărcabilă.
// Mutată de pe calculatorulinflatiei.ro/ipc-lunar.csv pe 17 noiembrie 2026; adresa
// veche trimite aici cu 301. Generată static la build.
import date from "@/data/ipc-lunar.json";

export const dynamic = "force-static";

export function GET() {
  const cap = "an;luna;indice_lunar_total;indice_lunar_alimentare;indice_lunar_nealimentare;indice_lunar_servicii";
  const c = date.categorii as Record<string, { an: number; luna: number; indice: number }[]>;
  const randuri = (date.serie as { an: number; luna: number }[]).map((r, i) =>
    [r.an, r.luna, c["Total"][i].indice, c["Marfuri alimentare"][i].indice, c["Marfuri nealimentare"][i].indice, c["Servicii"][i].indice].join(";"),
  );
  // BOM, ca Excel-ul românesc să nu strice diacriticele și separatorul.
  const csv = "﻿" + [cap, ...randuri].join("\r\n") + "\r\n";
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
}
