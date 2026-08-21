// src/app/components/Salarii.tsx
// Primitive folosite de /salarii si /compara. Server Components pure, fara JS
// la client: graficul e SVG randat pe server, tabelele sunt HTML simplu.

import Link from "next/link";
import type { ReactNode } from "react";

export const lei = (valoare: number) => new Intl.NumberFormat("ro-RO").format(Math.round(valoare));

export const procent = (valoare: number, zecimale = 1) =>
  new Intl.NumberFormat("ro-RO", { minimumFractionDigits: zecimale, maximumFractionDigits: zecimale }).format(
    valoare * 100,
  );

const LUNI_SCURTE: Record<string, string> = {
  ianuarie: "ian.",
  februarie: "feb.",
  martie: "mar.",
  aprilie: "apr.",
  mai: "mai",
  iunie: "iun.",
  iulie: "iul.",
  august: "aug.",
  septembrie: "sep.",
  octombrie: "oct.",
  noiembrie: "noi.",
  decembrie: "dec.",
};

/** „Luna iunie 2026" → „iun. 2026". */
export function lunaScurta(eticheta: string): string {
  const potrivire = eticheta.match(/Luna\s+(\p{L}+)\s+(\d{4})/u);
  if (!potrivire) return eticheta;
  return `${LUNI_SCURTE[potrivire[1].toLowerCase()] ?? potrivire[1]} ${potrivire[2]}`;
}

/** „Luna iunie 2026" → „iunie 2026". */
export function lunaLunga(eticheta: string): string {
  return eticheta.replace(/^Luna\s+/, "");
}

export function CardCifra({
  eticheta,
  valoare,
  unitate = "lei",
  nota,
  accent = false,
}: {
  eticheta: string;
  valoare: string;
  unitate?: string;
  nota?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-md border p-5 shadow-soft ${
        accent ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-surface"
      }`}
    >
      <div className={`text-xs font-medium uppercase tracking-wide ${accent ? "text-stone-300" : "text-stone-500"}`}>
        {eticheta}
      </div>
      <div className={`mt-2 text-2xl font-bold tracking-[-0.02em] sm:text-3xl ${accent ? "text-white" : "text-stone-900"}`}>
        {valoare}
        {unitate && <span className="ml-1 text-base font-medium">{unitate}</span>}
      </div>
      {nota && (
        <p className={`mt-2 text-xs leading-normal ${accent ? "text-stone-300" : "text-stone-600"}`}>{nota}</p>
      )}
    </div>
  );
}

/** Grafic de linie SVG pentru seria lunara a unui sector. */
export function GraficSerie({
  luni,
  valori,
  titlu,
}: {
  luni: string[];
  valori: (number | null)[];
  titlu: string;
}) {
  const puncte = valori
    .map((valoare, index) => ({ valoare, luna: luni[index] }))
    .filter((punct): punct is { valoare: number; luna: string } => punct.valoare !== null);
  if (puncte.length < 2) return null;

  const W = 640;
  const H = 240;
  const padL = 8;
  const padR = 64;
  const padT = 16;
  const padB = 26;
  const valoriNumerice = puncte.map((p) => p.valoare);
  const max = Math.max(...valoriNumerice) * 1.06;
  const min = Math.min(...valoriNumerice) * 0.94;
  const X = (i: number) => padL + (i / (puncte.length - 1)) * (W - padL - padR);
  const Y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);

  const linie = puncte.map((p, i) => `${X(i).toFixed(1)},${Y(p.valoare).toFixed(1)}`).join(" ");
  const arie = `${padL},${H - padB} ${linie} ${X(puncte.length - 1).toFixed(1)},${H - padB}`;
  const ultimul = puncte[puncte.length - 1];
  const etichete = [0, Math.floor((puncte.length - 1) / 2), puncte.length - 1];

  return (
    <figure className="my-6">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`${titlu}: de la ${lei(puncte[0].valoare)} lei în ${lunaLunga(puncte[0].luna)} la ${lei(ultimul.valoare)} lei în ${lunaLunga(ultimul.luna)}.`}
      >
        <polygon points={arie} fill="#1c1917" opacity="0.06" />
        <polyline points={linie} fill="none" stroke="#1c1917" strokeWidth="2" strokeLinejoin="round" />
        <circle cx={X(puncte.length - 1)} cy={Y(ultimul.valoare)} r="4" fill="#1c1917" />
        <text
          x={X(puncte.length - 1) + 10}
          y={Y(ultimul.valoare) + 4}
          fontSize="13"
          fontWeight="600"
          fill="#1c1917"
        >
          {lei(ultimul.valoare)}
        </text>
        {etichete.map((index) => (
          <text
            key={index}
            x={X(index)}
            y={H - 6}
            fontSize="11"
            fill="#78716c"
            textAnchor={index === 0 ? "start" : index === puncte.length - 1 ? "end" : "middle"}
          >
            {lunaScurta(puncte[index].luna)}
          </text>
        ))}
      </svg>
      <figcaption className="text-xs leading-normal text-stone-600">{titlu}</figcaption>
    </figure>
  );
}

/** Tabel judete cu bara proportionala si abaterea fata de media nationala. */
export function TabelJudete({
  judete,
  media,
  an,
  numeSector,
}: {
  judete: { judet: string; brut: number }[];
  /** Valoarea nationala a ACELEIASI serii si a aceluiasi an. */
  media: number;
  an: string;
  numeSector: string;
}) {
  if (judete.length === 0) return null;
  const max = judete[0].brut;

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-[32rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft tabular-nums">
        <caption className="sr-only">{`Câștig salarial mediu brut pe județe în ${an}, ${numeSector}. Media națională a aceleiași activități: ${lei(media)} lei.`}</caption>
        <thead>
          <tr>
            <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
              Județ
            </th>
            <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
              Brut
            </th>
            <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
              Față de media pe țară ({an})
            </th>
          </tr>
        </thead>
        <tbody>
          {judete.map((rand) => {
            const abatere = (rand.brut - media) / media;
            return (
              <tr key={rand.judet}>
                <th
                  scope="row"
                  className="relative border-b border-stone-100 px-3 py-2 text-left font-medium text-stone-900"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-0 rounded-r bg-stone-900/[0.06]"
                    style={{ width: `${Math.max(4, (rand.brut / max) * 100)}%` }}
                  />
                  <span className="relative">{rand.judet}</span>
                </th>
                <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-700">{lei(rand.brut)} lei</td>
                <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-600">
                  {abatere >= 0 ? "+" : "−"}
                  {procent(Math.abs(abatere), 0)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Nota de sursa, identica pe toate paginile din cluster. */
export function NotaSursa({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 rounded-md border border-stone-200 bg-surface p-4 text-xs leading-normal text-stone-600 shadow-soft [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2">
      {children}
    </p>
  );
}

// `min-w-0` pe radacina nu e decorativ: cardul e item de grid, iar un item de
// grid are min-width auto, deci pista se dimensiona la max-content (denumirea
// CAEN intreaga) si impingea lista peste latimea ecranului pe telefon. Cu
// min-width 0, pista se opreste la latimea containerului si `truncate` de mai
// jos chiar taie textul in loc sa fie ignorat.
export function LinkCard({
  href,
  titlu,
  detaliu,
  valoare,
}: {
  href: string;
  titlu: string;
  detaliu?: string;
  valoare?: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-stone-200 bg-surface px-4 py-3 shadow-soft transition-colors hover:border-stone-300 hover:bg-canvas"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-stone-900">{titlu}</span>
        {detaliu && <span className="block truncate text-xs text-stone-500">{detaliu}</span>}
      </span>
      {valoare && <span className="shrink-0 text-sm font-semibold tabular-nums text-stone-700">{valoare}</span>}
    </Link>
  );
}
