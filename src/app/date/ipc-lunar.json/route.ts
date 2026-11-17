// Aceleași date ca ipc-lunar.csv, pentru cine le citește dintr-un program.
// Mutată de pe calculatorulinflatiei.ro/ipc-lunar.json pe 17 noiembrie 2026.
import date from "@/data/ipc-lunar.json";

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(date, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
