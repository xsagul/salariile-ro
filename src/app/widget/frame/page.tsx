// app/widget/frame/page.tsx
// Conținutul iframe-ului embeddabil: DOAR calculatorul compact (layout-ul root
// ascunde Header/Footer pe această rută, iar middleware-ul permite frame-ancestors *).
// noindex: pagina trăiește în iframe pe alte site-uri, nu în rezultatele Google —
// pagina indexabilă care o prezintă e /widget.

import type { Metadata } from "next";
import WidgetCalculator from "@/app/components/WidgetCalculator";

export const metadata: Metadata = {
  title: "Calculator salariu net (widget)",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://salariile.ro/widget" },
};

export default async function WidgetFramePage({
  searchParams,
}: {
  searchParams: Promise<{ brut?: string }>;
}) {
  const { brut } = await searchParams;
  const initialBrut = brut && /^\d{3,6}$/.test(brut) ? brut : undefined;
  return <WidgetCalculator initialBrut={initialBrut} />;
}
