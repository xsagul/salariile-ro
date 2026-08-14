// app/widget/frame/page.tsx
// Conținutul iframe-ului embeddabil. Implicit redă widgetul minimalist; varianta
// allowlisted `?variant=complet` reutilizează grila completă a calculatorului de
// pe homepage. Layout-ul root ascunde Header/Footer pe această rută, iar proxy-ul
// permite frame-ancestors *.
// noindex: pagina trăiește în iframe pe alte site-uri, nu în rezultatele Google —
// pagina indexabilă care o prezintă e /widget.

import type { Metadata } from "next";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import WidgetCalculator from "@/app/components/WidgetCalculator";

export const metadata: Metadata = {
  title: "Calculator salariu net (widget)",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://salariile.ro/widget" },
};

export default async function WidgetFramePage({
  searchParams,
}: {
  searchParams: Promise<{ brut?: string; variant?: string }>;
}) {
  const { brut, variant } = await searchParams;
  const initialBrut = brut && /^\d{3,6}$/.test(brut) ? brut : undefined;
  const isComplete = variant === "complet";

  return (
    <main className="min-h-screen bg-canvas">
      {isComplete ? (
        <>
          <h1 className="sr-only">Calculator complet de salarii 2026</h1>
          <CalculatorSalariu brutInitial={initialBrut} embedded />
        </>
      ) : (
        <WidgetCalculator initialBrut={initialBrut} />
      )}
    </main>
  );
}
