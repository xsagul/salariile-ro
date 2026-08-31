// src/app/components/Salarii.tsx
// Primitive folosite de /salarii si /compara. Server Components pure, fara JS
// la client: graficul e SVG randat pe server, tabelele sunt HTML simplu.

import Link from "next/link";
import type { ReactNode } from "react";
import type { GrilaPublica } from "@/lib/grile-publice";
import type { ValoareJudet } from "@/lib/ins-date";

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

const TRIMESTRE: Record<string, string> = { I: "1", II: "2", III: "3", IV: "4" };

/** „Trimestrul II 2026" → „T2 2026". Cifra romana nu se scrie cu litere mici. */
export function trimestruScurt(eticheta: string | null): string {
  if (!eticheta) return "";
  const potrivire = eticheta.match(/Trimestrul\s+(I{1,3}|IV)\s+(\d{4})/i);
  if (!potrivire) return eticheta;
  return `T${TRIMESTRE[potrivire[1].toUpperCase()] ?? potrivire[1]} ${potrivire[2]}`;
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
  // Cardul principal NU se inverseaza pe negru. Restul limbajului vizual spune
  // „stone monocrom, fara accent", iar negrul plin e rezervat butoanelor —
  // altfel un card si un buton arata la fel si nu se mai stie ce se poate apasa.
  // Accentul se marcheaza prin BORDURA, ca in BRAND.md §5: greutate si contur,
  // nu inversare de fundal.
  return (
    <div
      className={`flex h-full flex-col rounded-md bg-surface p-5 shadow-soft ${
        accent ? "border-2 border-stone-900" : "border border-stone-200"
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-stone-500">{eticheta}</div>
      <div className="mt-2 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">
        {valoare}
        {unitate && <span className="ml-1 text-base font-medium">{unitate}</span>}
      </div>
      {nota && <p className="mt-2 text-xs leading-normal text-stone-600">{nota}</p>}
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
  numeActivitate,
}: {
  // Tipul vine din biblioteca, nu redeclarat aici: cand `ValoareJudet` a primit
  // `slug`, o copie locala ar fi ramas in urma in tacere.
  judete: ValoareJudet[];
  /** Valoarea nationala a ACELEIASI serii si a aceluiasi an. */
  media: number | null;
  an: string;
  /** Eticheta activitatii din seria judeteana CAEN Rev.2. */
  numeActivitate: string;
}) {
  if (judete.length === 0) return null;
  const max = Math.max(...judete.map((judet) => judet.brut));
  const minim = judete.reduce((curent, judet) => (judet.brut < curent.brut ? judet : curent));
  const areMedieNationala = media !== null && media > 0;
  const este2024 = an === "2024";

  return (
    <div className="my-6">
      <div className="rounded-md border border-stone-200 bg-surface p-4 text-sm leading-normal text-stone-600 shadow-soft">
        <p>
          <strong className="font-semibold text-stone-900">Brut lunar, media anului {an}:</strong> fiecare sumă este
          câștigul salarial nominal mediu brut lunar al activității CAEN Rev.2 „{numeActivitate}”, calculat pentru
          întregul an. Nu este salariu net și nu reprezintă salariul minim din 2026. Vezi{" "}
          <a
            href="https://statistici.insse.ro/tempoins/?ind=FOM107E&lang=ro&page=tempo3"
            target="_blank"
            rel="noopener"
            className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
          >
            definiția INS (FOM107E)
          </a>
          .
        </p>
        {este2024 && (
          <p className="mt-2">
            În 2024, salariul de bază minim brut pentru normă întreagă a fost{" "}
            <a
              href="https://legislatie.just.ro/Public/DetaliiDocument/274843"
              target="_blank"
              rel="noopener"
              className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
            >
              3.300 lei în ianuarie–iunie
            </a>{" "}
            și{" "}
            <a
              href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/283807"
              target="_blank"
              rel="noopener"
              className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
            >
              3.700 lei din 1 iulie
            </a>
            . Reperul calendaristic simplu pentru cele 12 luni este 3.500 lei; o medie anuală nu se compară doar cu
            nivelul din semestrul al doilea.
            {minim.brut >= 3_500
              ? ` În acest tabel, chiar valoarea minimă — ${lei(minim.brut)} lei în ${minim.judet} — este peste acel reper.`
              : ""}{" "}
            Câștigul mediu și salariul de bază minim rămân indicatori diferiți.
          </p>
        )}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[32rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft tabular-nums">
          <caption className="sr-only">
            {`Câștig salarial nominal mediu brut lunar pe județe, media anului ${an}, activitatea CAEN Rev.2 ${numeActivitate}.${areMedieNationala ? ` Media brută națională a aceleiași activități: ${lei(media)} lei.` : ""}`}
          </caption>
          <thead>
            <tr>
              <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
                Județ
              </th>
              <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                Brut lunar · media {an}
              </th>
              <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
                Față de media brută națională · {an}
              </th>
            </tr>
          </thead>
          <tbody>
            {judete.map((rand) => {
              const abatere = areMedieNationala ? (rand.brut - media) / media : null;
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
                    {/* Judetul trimite la pagina lui: acolo se vede cum sta el pe
                      TOATE activitatile, nu doar pe cea din tabelul asta. */}
                    <span className="relative">
                      <Link
                        href={`/salarii/judet/${rand.slug}`}
                        className="underline underline-offset-2 hover:text-stone-600"
                      >
                        {rand.judet}
                      </Link>
                    </span>
                  </th>
                  <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-700">
                    {lei(rand.brut)} lei
                  </td>
                  <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-600">
                    {abatere === null ? (
                      "—"
                    ) : (
                      <>
                        {abatere >= 0 ? "+" : "−"}
                        {procent(Math.abs(abatere), 0)}%
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
  subvaloare,
  cauta,
}: {
  href: string;
  titlu: string;
  detaliu?: string;
  valoare?: string;
  /** A doua cifra, ancorata in ocupatie. Fara ea, toate meseriile dintr-un
   *  sector arata identic in listing. */
  subvaloare?: string;
  /** Textul peste care cauta filtrul de pe /salarii. Contine si sinonime care
   *  nu se vad pe card, ca sa gaseasca „sora medicala" sau „IT". */
  cauta?: string;
}) {
  return (
    <Link
      href={href}
      data-cauta={cauta}
      className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-stone-200 bg-surface px-4 py-3 shadow-soft transition-colors hover:border-stone-300 hover:bg-canvas"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-stone-900">{titlu}</span>
        {detaliu && <span className="block truncate text-xs text-stone-500">{detaliu}</span>}
      </span>
      {valoare && (
        <span className="shrink-0 text-right">
          <span className="block text-sm font-semibold tabular-nums text-stone-700">{valoare}</span>
          {subvaloare && <span className="block text-xs tabular-nums text-stone-500">{subvaloare}</span>}
        </span>
      )}
    </Link>
  );
}

/**
 * Scara de salarii dintr-o grila a Legii 153/2017.
 *
 * Se uita altfel decat restul paginii, si intentionat: celelalte tabele arata
 * o medie masurata, asta arata o suma scrisa in lege. De aceea coloana de brut
 * e cea principala — grila e stabilita in brut, iar netul e calculul nostru
 * peste ea, nu o cifra din act.
 */
export function TabelGrila({
  grila,
  meserie,
}: {
  grila: GrilaPublica;
  /** Numele meseriei, la singular si cu litera mica, pentru rezumatul tabelului. */
  meserie: string;
}) {
  const max = Math.max(...grila.trepte.map((t) => t.brut));
  const areComponente = grila.trepte.some((t) => t.componente);

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[34rem] border-separate border-spacing-0 overflow-hidden rounded-md border border-stone-200 bg-surface text-sm shadow-soft tabular-nums">
        <caption className="sr-only">
          {`${grila.numeSuma[0].toUpperCase()}${grila.numeSuma.slice(1)} la gradația 0 pentru ${meserie}, pe trepte, din ${grila.anexa} la Legea-cadru nr. 153/2017, nivelul ${grila.coloana}.`}
        </caption>
        <thead>
          <tr>
            <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-600">
              Treaptă
            </th>
            {areComponente && (
              <th className="hidden border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600 sm:table-cell">
                Funcție + grad
              </th>
            )}
            <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
              Brut lunar
            </th>
            <th className="border-b border-stone-200 bg-canvas px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-600">
              Net estimat
            </th>
          </tr>
        </thead>
        <tbody>
          {grila.trepte.map((t) => (
            <tr key={t.eticheta}>
              <th
                scope="row"
                className="relative border-b border-stone-100 px-3 py-2 text-left font-medium text-stone-900"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-1 left-0 rounded-r bg-stone-900/[0.06]"
                  style={{ width: `${Math.max(4, (t.brut / max) * 100)}%` }}
                />
                <span className="relative">{t.eticheta}</span>
              </th>
              {areComponente && (
                <td className="hidden border-b border-stone-100 px-3 py-2 text-right text-xs text-stone-500 sm:table-cell">
                  {t.componente ? t.componente.map((c) => lei(c.valoare)).join(" + ") : "—"}
                </td>
              )}
              <td className="border-b border-stone-100 px-3 py-2 text-right font-semibold text-stone-900">
                {lei(t.brut)} lei
              </td>
              <td className="border-b border-stone-100 px-3 py-2 text-right text-stone-600">{lei(t.net)} lei</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
