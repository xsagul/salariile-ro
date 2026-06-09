"use client";

// src/app/components/Header.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type Leaf = { href: string; label: string };
type Group = { label: string; children: Leaf[] };
type Item = Leaf | Group;

// Structură extensibilă: linkuri simple + grupuri (dropdown). Adaugi ușor
// „Calculator PFA" sau „Noutăți" fie ca leaf, fie în grupul Ghiduri.
const NAV: Item[] = [
  { href: "/", label: "Calculator" },
  { href: "/calculator-pfa", label: "Calculator PFA" },
  {
    label: "Ghiduri",
    children: [
      { href: "/salariu-minim", label: "Salariu minim" },
      { href: "/salariu-mediu", label: "Salariu mediu" },
      { href: "/zile-libere-2026", label: "Zile libere 2026" },
    ],
  },
  { href: "/noutati", label: "Noutăți" },
];

const isGroup = (i: Item): i is Group => "children" in i;

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const groupActive = (g: Group) => g.children.some((c) => isActive(c.href));

  // Accordeon mobil: deschis implicit dacă ești pe o pagină din grup.
  const [groupOpen, setGroupOpen] = useState(() =>
    NAV.some((i) => isGroup(i) && i.children.some((c) => pathname.startsWith(c.href)))
  );

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

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
              <div key={item.label} className="group relative flex h-full items-center">
                <button className={`${desktopLink(groupActive(item))} gap-1 outline-none`} aria-haspopup="menu">
                  {item.label}
                  {chevron}
                </button>
                <div className="invisible absolute left-1/2 top-full z-50 min-w-48 -translate-x-1/2 rounded-md border border-stone-200 bg-canvas py-1 opacity-0 shadow-soft transition-opacity duration-100 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {item.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className={`block px-4 py-2 text-sm ${
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
                aria-expanded={groupOpen}
                onClick={() => setGroupOpen((v) => !v)}
              >
                {item.label}
                <span className={`transition-transform duration-200 ${groupOpen ? "rotate-180" : ""}`}>{chevron}</span>
              </button>
              {groupOpen && (
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
