// src/app/components/TabelArticol.tsx
// Tabel pentru zonele editoriale (nu pentru calculatoare, care își păstrează
// stilul propriu inline).
//
// Exista un bug vizibil în producție: tabelele din articole erau scrise ca
// `<table>` fără nicio clasă, iar globals.css nu are reguli pentru `table`
// (fișierul declară explicit „zero CSS de componente"). Rezultatul era stilul
// implicit al browserului: fără chenar, fără padding, coloane lipite.
//
// Server Component pur. Aspectul urmărește tabelul din calculator: container
// rotunjit, header pe fundal canvas, linii de 1px între rânduri.

import type { ReactNode } from "react";

export default function TabelArticol({
  children,
  /** Aliniază la dreapta celulele de date și le dă cifre tabulare. Pentru
   *  tabele de sume; lasă-l pe false la tabelele comparative cu text. */
  numeric = false,
}: {
  children: ReactNode;
  numeric?: boolean;
}) {
  const base = [
    "w-full border-collapse text-left text-sm text-stone-700",
    "[&_th]:px-3 [&_th]:py-3 [&_td]:px-3 [&_td]:py-3",
    // Header
    "[&_thead_th]:bg-canvas [&_thead_th]:font-medium [&_thead_th]:text-stone-700",
    "[&_thead_th]:border-b [&_thead_th]:border-stone-300",
    // Rânduri
    "[&_tbody_tr]:border-b [&_tbody_tr]:border-stone-200",
    "[&_tbody_tr:last-child]:border-b-0",
    // Prima coloană ca antet de rând
    "[&_tbody_th]:font-medium [&_tbody_th]:text-stone-900 [&_tbody_th]:whitespace-nowrap",
    "[&_tbody_th]:border-r [&_tbody_th]:border-stone-200",
  ];

  const aliniere = numeric
    ? [
        "[&_thead_th:not(:first-child)]:text-right",
        "[&_tbody_td]:text-right [&_tbody_td]:tabular-nums [&_tbody_td]:whitespace-nowrap",
      ]
    : ["[&_td]:align-top", "[&_th]:align-top"];

  return (
    <div className="my-5 overflow-x-auto rounded border border-stone-300 bg-surface">
      <table className={[...base, ...aliniere].join(" ")}>{children}</table>
    </div>
  );
}
