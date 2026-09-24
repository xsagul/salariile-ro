"use client";

// src/app/components/Header.tsx
import Link from "@/app/components/Link";
import Logo from "@/app/components/Logo";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type Leaf = { href: string; label: string };
type Group = { label: string; children: Leaf[] };
type Item = Leaf | Group;

// Structură extensibilă: linkuri simple + grupuri (dropdown). Starea meniurilor
// e ținută PE GRUP, nu global, ca să poată exista oricâte dropdownuri.
//
// Meniul apare pe fiecare pagină, deci fiecare intrare primește o parte din
// autoritatea TUTUROR paginilor. Pe 15 septembrie 2026 au rămas doar paginile cu
// cerere măsurată în Search Console. Au ieșit /compara (6 clicuri în 28 de zile),
// /widget (1), /calculator-ore-suplimentare (6) și /zile-libere-2026 (5, sezon
// trecut); toate rămân legate din textul paginilor înrudite. Nu adăuga o pagină
// aici fără cerere: fiecare intrare nouă scade partea tuturor celorlalte.
const NAV: Item[] = [
  { href: "/", label: "Calculator salariu" },
  { href: "/salarii", label: "Meserii" },
  {
    label: "Instrumente",
    children: [
      { href: "/calculator-pfa", label: "Calculator PFA" },
      { href: "/calculator-salariu-part-time", label: "Salariu part-time" },
      { href: "/calculator-salariu-constructii", label: "Salariu construcții" },
      { href: "/calculator-salariu-invatamant", label: "Salariu învățământ" },
      { href: "/calculator-salariu-sanatate", label: "Salariu sănătate" },
      { href: "/calculator-indemnizatie-somaj", label: "Indemnizație șomaj" },
      { href: "/fluturas-salariu", label: "Generator fluturaș" },
    ],
  },
  {
    label: "Ghiduri",
    children: [
      { href: "/salariu-minim", label: "Salariu minim" },
      { href: "/salariu-minim-constructii-2026", label: "Minim construcții" },
      { href: "/salariu-mediu", label: "Salariu mediu" },
      { href: "/deducere-personala-2026", label: "Deducere personală" },
      { href: "/zile-lucratoare-2026", label: "Zile lucrătoare 2026" },
    ],
  },
  { href: "/noutati", label: "Noutăți" },
];

const isGroup = (i: Item): i is Group => "children" in i;

/** Identificator stabil pentru `id`/`aria-controls`, derivat din etichetă.
 *  Diacriticele devin cratime — nu contează cum arată, contează să fie unic și
 *  să nu se schimbe între server și client. */
const idGrup = (label: string) =>
  `desktop-menu-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Eticheta grupului deschis pe desktop, sau null. Un singur meniu deschis
  // odată, dar oricare dintre ele.
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);
  const desktopMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const desktopTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const groupActive = (g: Group) => g.children.some((c) => isActive(c.href));


  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setOpen(false);
      setDesktopOpen(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const inauntru = Object.values(desktopMenuRefs.current).some((node) =>
        node?.contains(event.target as Node),
      );
      if (!inauntru) setDesktopOpen(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const closeDesktopMenu = (label?: string) => {
    setDesktopOpen(null);
    if (label) desktopTriggerRefs.current[label]?.focus();
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    // Escape închide meniul și duce focusul înapoi pe buton.
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const desktopLink = (active: boolean) =>
    `flex items-center text-sm font-medium transition-colors duration-100 ${
      active ? "text-stone-900" : "text-stone-600 hover:text-stone-900"
    }`;

  const mobileLink = (active: boolean) =>
    `block min-h-12 px-4 py-3 text-base ${active ? "font-medium bg-stone-100 text-stone-900" : "text-stone-700"}`;

  const bar = "block h-0.5 w-5 bg-stone-900 transition duration-[250ms]";

  const chevron = (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );

  return (
    <>
      {/* Backdrop blur — apare doar pe mobil când meniul e deschis */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-30 bg-stone-900/25 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

    <header className="hairline-b relative w-full bg-canvas">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
        <Link href="/" aria-label="Salariile, pagina principală" className="mr-auto inline-flex min-h-11 items-center">
          <Logo className="h-7 w-auto sm:h-8" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden h-full items-center gap-6 md:flex">
          {NAV.map((item) =>
            isGroup(item) ? (
              <div
                key={item.label}
                ref={(node) => {
                  desktopMenuRefs.current[item.label] = node;
                }}
                className="relative flex h-full items-center"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    closeDesktopMenu(item.label);
                  }
                }}
              >
                <button
                  ref={(node) => {
                    desktopTriggerRefs.current[item.label] = node;
                  }}
                  className={`${desktopLink(groupActive(item))} gap-1 outline-none`}
                  aria-haspopup="menu"
                  aria-expanded={desktopOpen === item.label}
                  aria-controls={idGrup(item.label)}
                  onClick={() => setDesktopOpen((value) => (value === item.label ? null : item.label))}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setDesktopOpen(item.label);
                      requestAnimationFrame(() =>
                        desktopMenuRefs.current[item.label]
                          ?.querySelector<HTMLAnchorElement>("[role=menuitem]")
                          ?.focus(),
                      );
                    }
                  }}
                >
                  {item.label}
                  {chevron}
                </button>
                <div
                  id={idGrup(item.label)}
                  role="menu"
                  className={`${desktopOpen === item.label ? "visible opacity-100" : "invisible opacity-0"} absolute left-1/2 top-full z-50 min-w-48 -translate-x-1/2 rounded-md border border-stone-200 bg-canvas py-1 shadow-soft transition-opacity duration-100`}
                >
                  {item.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      role="menuitem"
                      tabIndex={desktopOpen === item.label ? 0 : -1}
                      onClick={() => closeDesktopMenu()}
                      className={`block whitespace-nowrap px-4 py-2 text-sm ${
                        isActive(c.href) ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className={desktopLink(isActive(item.href))}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          ref={hamburgerRef}
          className="ml-auto flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded p-0 hover:bg-stone-200/60 md:hidden"
          aria-label={open ? "Închide meniul" : "Deschide meniul"}
          aria-expanded={open}
          aria-controls="meniu-mobil"
          onClick={() => setOpen(!open)}
        >
          <span className={`${bar} ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`${bar} ${open ? "opacity-0" : ""}`} />
          <span className={`${bar} ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Meniul mobil, refăcut pe 24 septembrie 2026. Înainte: acordeoane care,
          deschise amândouă, depășeau ecranul, fără scroll (pagina din spate e
          blocată). Cu doar 12 linkuri, acordeonul nu economisea spațiu, doar
          ascundea pagini (NN/g: acordeoanele se evită când omul are nevoie de
          aproape tot). Acum totul e vizibil: grupurile au un titlu mic, iar
          linkurile lor stau pe două coloane, deci meniul încape pe un ecran de
          telefon. Pe ecranele foarte mici are scroll propriu, fără să miște
          pagina (`overscroll-contain`). */}
      <nav
        id="meniu-mobil"
        aria-label="Meniu principal"
        className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full z-40 max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto overscroll-contain border-t border-stone-200 bg-canvas shadow-md md:hidden`}
      >
        {NAV.map((item) =>
          isGroup(item) ? (
            <div key={item.label} className="border-b border-stone-200 px-4 pb-2 pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-600">{item.label}</p>
              <ul className="mt-1 grid grid-cols-2 gap-x-4">
                {item.children.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      aria-current={isActive(c.href) ? "page" : undefined}
                      className={`flex min-h-11 items-center text-[15px] leading-snug ${
                        isActive(c.href) ? "font-semibold text-stone-900 underline underline-offset-4" : "text-stone-700"
                      }`}
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`${mobileLink(isActive(item.href))} border-b border-stone-200`}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>
    </header>
    </>
  );
}
