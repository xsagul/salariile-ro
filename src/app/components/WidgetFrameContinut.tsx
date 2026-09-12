// src/app/components/WidgetFrameContinut.tsx
// Conținutul iframe-ului /widget/frame: minimalist implicit, grila completă cu ?variant=complet.

import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import WidgetCalculator from "@/app/components/WidgetCalculator";
import EmbedAutoResize from "@/app/components/EmbedAutoResize";

export default function WidgetFrameContinut({ initialBrut, isComplete }: { initialBrut?: string; isComplete: boolean }) {
  return (
    <main className="bg-canvas">
      {isComplete ? (
        <>
          <EmbedAutoResize />
          <h1 className="sr-only">Calculator complet de salarii 2026</h1>
          <CalculatorSalariu brutInitial={initialBrut} embedded />
        </>
      ) : (
        <div className="widget-minimal-autoheight">
          <style>{`
            .widget-minimal-autoheight > div > div:first-child {
              height: auto !important;
              overflow: visible !important;
            }
            .widget-minimal-autoheight > div > div:nth-child(2) {
              display: none !important;
            }
          `}</style>
          <WidgetCalculator initialBrut={initialBrut} />
        </div>
      )}
    </main>
  );
}
