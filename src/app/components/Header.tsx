"use client";

// src/app/components/Header.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Calculator" },
  { href: "/salariu-minim", label: "Salariu minim" },
  { href: "/salariu-mediu", label: "Salariu mediu" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* HEADER PRINCIPAL — pattern Maggie Appleton / Linear:
          transparent, NEsticky, parte din hero. Scroll-uiește natural cu pagina.
          Trust signals (Sincronizat D-112) rămân în dateline-ul din hero. */}
      <header className="site-header">
        <div className="container">
          <Link href="/" className="logo">
            salariile.ro
          </Link>

          {/* Desktop nav */}
          <nav className="nav-desktop">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(link.href) ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger button */}
          <button
            className="hamburger"
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span className={`hamburger-bar ${open ? "open" : ""}`} />
            <span className={`hamburger-bar ${open ? "open" : ""}`} />
            <span className={`hamburger-bar ${open ? "open" : ""}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        <nav className={`nav-mobile ${open ? "open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}