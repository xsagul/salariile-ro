import { COLOANA_IN_PLATA, GRILA, SURSA_GRILA } from "@/lib/invatamant";

export const dynamic = "force-static";

export function GET() {
  const rows = [
    ["Functie", "Studii", "Vechime in invatamant", "Salariu baza brut lei/luna", "Gradatie", "Coloana legala", "Sursa"],
    ...GRILA.map(r => [r.functie, r.studii, r.vechime, r[COLOANA_IN_PLATA], 0, "iunie 2024", SURSA_GRILA.url]),
  ];
  const csv = "\uFEFF" + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(";")).join("\r\n");
  return new Response(csv, { headers: {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": 'attachment; filename="grila-invatamant-2026.csv"',
    "X-Robots-Tag": "noindex",
  } });
}
