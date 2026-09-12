// src/app/components/WidgetFluturasContinut.tsx
// Conținutul iframe-ului /widget/frame/fluturas (generatorul de fluturaș).

import CalculatorSalariu from "@/app/components/CalculatorSalariu";
import EmbedAutoResize from "@/app/components/EmbedAutoResize";

export default function WidgetFluturasContinut({ initialBrut }: { initialBrut?: string }) {
  return (
    <main className="bg-canvas">
      <EmbedAutoResize />
      <h1 className="sr-only">Generator fluturaș de salariu 2026</h1>
      <CalculatorSalariu
        brutInitial={initialBrut}
        modInitial="brut"
        fluturas
        embedded
      />
    </main>
  );
}
