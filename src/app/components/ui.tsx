// src/app/components/ui.tsx
// Primitive de layout + tipografie pentru paginile de conținut.
// Limbajul pilonului: stone monocrom, fără accent, tracking Inter, bg-canvas.
// <Prose> stilează automat h2/h3/p/ul/a/strong/table prin variante descendente.

import Link from "next/link";
import type { ReactNode } from "react";

const PROSE = [
  "[&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-[-0.02em] [&_h2]:text-stone-900 sm:[&_h2]:text-2xl",
  "[&>h2:first-child]:mt-0",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-[-0.01em] [&_h3]:text-stone-900",
  "[&_p]:mb-4 [&_p]:text-base [&_p]:leading-normal [&_p]:tracking-[-0.01em] [&_p]:text-stone-600",
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-stone-600 [&_li]:mb-2 [&_li]:leading-normal [&_li]:tracking-[-0.01em]",
  "[&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-stone-600",
  "[&_strong]:font-semibold [&_strong]:text-stone-900",
  "[&_em]:not-italic [&_em]:font-medium [&_em]:text-stone-900",
  // Tabele: card boxat (border rotunjit + header pe bg-canvas), linii de rând, tabular-nums.
  "[&_table]:my-6 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-md [&_table]:border [&_table]:border-stone-200 [&_table]:bg-surface [&_table]:shadow-soft [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:text-sm [&_table]:tabular-nums",
  // .table-wrap (adăugat de noutati.ts în jurul tabelelor din markdown): scroll
  // orizontal propriu pe ecrane înguste, ca tabelul lat să nu lărgească pagina.
  "[&_.table-wrap]:my-6 [&_.table-wrap]:overflow-x-auto [&_.table-wrap>table]:my-0",
  "[&_thead_th]:border-b [&_thead_th]:border-stone-200 [&_thead_th]:bg-canvas [&_thead_th]:px-3 [&_thead_th]:py-3 [&_thead_th]:text-left [&_thead_th]:text-xs [&_thead_th]:font-medium [&_thead_th]:uppercase [&_thead_th]:tracking-wide [&_thead_th]:text-stone-600",
  "[&_tbody_td]:border-b [&_tbody_td]:border-stone-100 [&_tbody_td]:px-3 [&_tbody_td]:py-3 [&_tbody_td]:text-stone-700",
  "[&_tbody_tr:last-child_td]:border-b-0",
  // .source-note (specificitate 0,2,0) bate variantele de element 0,1,1
  "[&_.source-note]:mt-4 [&_.source-note]:text-xs [&_.source-note]:leading-normal [&_.source-note]:text-stone-600",
].join(" ");

export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${PROSE} ${className}`}>{children}</div>;
}

export function Hero({ children }: { children: ReactNode }) {
  return (
    <section className="border-b border-stone-200 bg-canvas py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function Section({
  children,
  wide = false,
  noTopBorder = false,
}: {
  children: ReactNode;
  wide?: boolean;
  noTopBorder?: boolean;
}) {
  return (
    <section className={`${noTopBorder ? "border-t-0" : "border-t border-stone-200 first:border-t-0"} bg-canvas py-10 sm:py-12`}>
      <div className={`mx-auto px-4 sm:px-6 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        <Prose>{children}</Prose>
      </div>
    </section>
  );
}

export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="mb-4 flex flex-wrap gap-2 text-xs text-stone-600" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="flex gap-2">
          {it.href ? (
            <Link href={it.href} className="hover:text-stone-700">{it.label}</Link>
          ) : (
            <span aria-current="page">{it.label}</span>
          )}
          {i < items.length - 1 && <span aria-hidden="true">/</span>}
        </span>
      ))}
    </nav>
  );
}

export function H1({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-3xl font-bold tracking-[-0.02em] text-stone-900 sm:text-4xl [&_em]:not-italic [&_em]:text-stone-900">
      {children}
    </h1>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 max-w-prose text-base leading-normal tracking-[-0.01em] text-stone-600 [&_a]:font-medium [&_a]:text-stone-900 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-stone-600">
      {children}
    </p>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-xs uppercase tracking-wide text-stone-500">{children}</p>;
}

// Listă FAQ cu <details>/<summary> nativ. Marker custom +/− prin group-open.
export function Faq({
  items,
  title = "Întrebări frecvente",
}: {
  items: { q: string; a: string }[];
  title?: string;
}) {
  return (
    <section className="border-t border-stone-200 bg-canvas py-10 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold tracking-[-0.02em] text-stone-900 sm:text-3xl">{title}</h2>
        <div className="flex flex-col">
          {items.map((item, i) => (
            <details key={i} name="faq" className="group border-b border-stone-200 py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium tracking-[-0.01em] text-stone-900 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex-shrink-0 text-xl text-stone-900 group-open:hidden">+</span>
                <span className="hidden flex-shrink-0 text-xl text-stone-900 group-open:inline">−</span>
              </summary>
              <p className="mt-3 text-base leading-normal tracking-[-0.01em] text-stone-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// Card CTA final — titlu, paragraf, buton stone (fără accent).
export function CtaCard({
  title,
  children,
  href = "/",
  label,
}: {
  title: string;
  children: ReactNode;
  href?: string;
  label: string;
}) {
  return (
    <section className="border-t border-stone-200 bg-canvas py-10 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-md border border-stone-200 bg-surface p-6 shadow-soft sm:p-8">
          <h2 className="mb-2 text-2xl font-bold tracking-[-0.02em] text-stone-900">{title}</h2>
          <p className="mb-5 leading-normal tracking-[-0.01em] text-stone-600">{children}</p>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center rounded border border-stone-900 bg-stone-900 px-5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
          >
            {label}
          </Link>
        </div>
      </div>
    </section>
  );
}
