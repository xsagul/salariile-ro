// src/app/components/TabelArticol.tsx
// Tabelul standard al site-ului, pentru tot ce nu e în interiorul unui
// calculator (acolo rândurile de calcul își păstrează stilul propriu).
//
// Standard decis de proprietar pe 24 septembrie 2026, după ce pe site existau
// 17 variante de tabel (antet mare sau mic, cu sau fără fundal, cu linie
// verticală după prima coloană, cutie cu sau fără umbră). Este exact stilul
// tabelelor din articole, definit în PROSE din ui.tsx: cutie rotunjită cu
// bordură și umbră, antet mic cu majuscule pe fundal canvas, linii fine între
// rânduri. Clasele de aici și cele din PROSE trebuie să rămână identice; în
// interiorul unui <Prose> se suprapun fără conflict.

import type { ReactNode } from "react";

export const TABEL_STANDARD = [
  "w-full overflow-hidden rounded-md border border-stone-200 bg-surface shadow-soft",
  "border-separate border-spacing-0 text-left text-sm tabular-nums text-stone-700",
  // Alinierea stă pe tabel, nu pe celule: o regulă `[&_th]:text-left` ar fi mai
  // specifică decât `text-right` pus pe o celulă cu sume și l-ar anula.
  // Antet
  "[&_thead_th]:border-b [&_thead_th]:border-stone-200 [&_thead_th]:bg-antet [&_thead_th]:px-3 [&_thead_th]:py-3",
  "[&_thead_th]:text-xs [&_thead_th]:font-medium [&_thead_th]:uppercase [&_thead_th]:tracking-wide [&_thead_th]:text-stone-600",
  // Rânduri
  "[&_tbody_td]:border-b [&_tbody_td]:border-stone-100 [&_tbody_td]:px-3 [&_tbody_td]:py-3",
  "[&_tbody_th]:border-b [&_tbody_th]:border-stone-100 [&_tbody_th]:px-3 [&_tbody_th]:py-3 [&_tbody_th]:font-medium [&_tbody_th]:text-stone-900",
  "[&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:last-child_th]:border-b-0",
].join(" ");

export default function TabelArticol({
  children,
  /** Aliniază la dreapta celulele de date și le dă cifre tabulare. Pentru
   *  tabele de sume; lasă-l pe false la tabelele comparative cu text. */
  numeric = false,
}: {
  children: ReactNode;
  numeric?: boolean;
}) {
  const aliniere = numeric
    ? "[&_thead_th:not(:first-child)]:text-right [&_tbody_td]:text-right [&_tbody_td]:whitespace-nowrap [&_tbody_th]:whitespace-nowrap"
    : "[&_td]:align-top [&_th]:align-top";

  return (
    <div className="table-wrap my-6 overflow-x-auto">
      <table className={`${TABEL_STANDARD} ${aliniere}`}>{children}</table>
    </div>
  );
}
