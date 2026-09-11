// Fișierele de calendar, generate static la build. Vezi src/lib/export-calendar.ts.
import { FISIERE_CALENDAR, continutCalendar } from "@/lib/export-calendar";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return FISIERE_CALENDAR.map((fisier) => ({ fisier }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ fisier: string }> }) {
  const { fisier } = await params;
  const [an, format] = fisier.split(".") as ["2026" | "2027", "csv" | "ics"];
  return new Response(continutCalendar(an, format), {
    headers: {
      "Content-Type": format === "csv" ? "text/csv; charset=utf-8" : "text/calendar; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
