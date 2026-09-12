// Seria INS, generată static la build. Vezi src/lib/export-serie-ins.ts.
import { continutSerieIns } from "@/lib/export-serie-ins";

export const dynamic = "force-static";

export function GET() {
  return new Response(continutSerieIns("json"), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
