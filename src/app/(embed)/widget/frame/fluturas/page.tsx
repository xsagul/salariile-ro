// app/widget/frame/fluturas/page.tsx
// Pagină dedicată iframe-ului pentru generatorul de fluturaș. Reutilizează
// aceeași componentă ca /fluturas-salariu, fără hero, Header, Footer sau conținut
// editorial. Ruta este noindex și poate fi încadrată extern prin CSP.

import type { Metadata } from "next";
import CalculatorSalariu from "@/app/components/CalculatorSalariu";

export const metadata: Metadata = {
  title: "Generator fluturaș de salariu (widget)",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://salariile.ro/fluturas-salariu" },
};

export default async function WidgetFluturasFramePage({
  searchParams,
}: {
  searchParams: Promise<{ brut?: string }>;
}) {
  const { brut } = await searchParams;
  const initialBrut = brut && /^\d{3,6}$/.test(brut) ? brut : undefined;

  return (
    <main className="min-h-screen bg-canvas">
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
