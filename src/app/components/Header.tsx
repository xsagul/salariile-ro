"use client";

// src/app/components/Header.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type Leaf = { href: string; label: string };
type Group = { label: string; children: Leaf[] };
type Item = Leaf | Group;

// Structură extensibilă: linkuri simple + grupuri (dropdown). Starea meniurilor
// e ținută PE GRUP, nu global, ca să poată exista oricâte dropdownuri.
//
// Locul doi din bară se dă pe merit, nu pe vechime. Istoric: /fluturas-salariu
// l-a luat de la /calculator-pfa pe 10 august 2026, cu 46 de clicuri din Google
// în 28 de zile de pe poziția 7,6, față de 3 clicuri de pe poziția 48. Pe 21
// august l-a cedat grupului „Meserii" — clusterul /salarii + /compara, 127 de
// pagini noi care n-au încă niciun istoric în GSC și au nevoie de un drum
// intern ca să fie descoperite. E un pariu, nu o măsurătoare: fluturașul aducea
// trafic real, meseriile încă nu aduc niciunul.
//
// Nici /fluturas-salariu, nici /calculator-pfa nu rămân orfane: ambele sunt
// linkate din footer, iar PFA și contextual din /salariu-minim.
const NAV: Item[] = [
  { href: "/", label: "Calculator salariu" },
  {
    label: "Meserii",
    children: [
      { href: "/salarii", label: "Salarii pe meserii" },
      { href: "/compara", label: "Compară două meserii" },
    ],
  },
  {
    label: "Ghiduri",
    children: [
      { href: "/salariu-minim", label: "Salariu minim" },
      { href: "/salariu-minim-constructii-2026", label: "Minim construcții" },
      { href: "/salariu-mediu", label: "Salariu mediu" },
      { href: "/deducere-personala-2026", label: "Deducere personală" },
      { href: "/zile-libere-2026", label: "Zile libere 2026" },
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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const groupActive = (g: Group) => g.children.some((c) => isActive(c.href));

  // Accordeon mobil: deschis implicit doar grupul din care face parte pagina
  // curentă, nu toate deodată.
  const [groupsOpen, setGroupsOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      NAV.filter(isGroup).map((g) => [g.label, g.children.some((c) => pathname.startsWith(c.href))]),
    )
  );

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
    return () => {
      document.body.style.overflow = "";
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
        <Link href="/" className="mr-auto text-xl font-bold tracking-[-0.02em] text-stone-900">
          salariile.ro
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
          className="ml-auto flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-md p-0 hover:bg-stone-200/60 md:hidden"
          aria-label={open ? "Închide meniul" : "Deschide meniul"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className={`${bar} ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`${bar} ${open ? "opacity-0" : ""}`} />
          <span className={`${bar} ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown — overlay absolut sub header, nu împinge pagina */}
      <nav className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full z-40 flex-col border-t border-stone-200 bg-canvas shadow-md md:hidden`}>
        {NAV.map((item) =>
          isGroup(item) ? (
            <div key={item.label} className="border-b border-stone-200">
              <button
                className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-base text-stone-700"
                aria-expanded={Boolean(groupsOpen[item.label])}
                onClick={() =>
                  setGroupsOpen((v) => ({ ...v, [item.label]: !v[item.label] }))
                }
              >
                {item.label}
                <span className={`transition-transform duration-200 ${groupsOpen[item.label] ? "rotate-180" : ""}`}>
                  {chevron}
                </span>
              </button>
              {groupsOpen[item.label] && (
                <div className="bg-stone-50">
                  {item.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className={`block min-h-12 py-3 pl-8 pr-4 text-base ${
                        isActive(c.href) ? "font-medium text-stone-900" : "text-stone-600"
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
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
