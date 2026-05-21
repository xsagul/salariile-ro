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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
      {/* ─── NOU: TOPBAR DE AUTORITATE ─── */}
      <div className="topbar">
        <div className="container">
          {/* Acest span are clasa topbar-status care adaugă pătrățelul alb */}
          <span className="topbar-status">Date oficiale · Sincronizat cu Monitorul Oficial 196/2026</span>
          {/* Acest span va fi eliminat complet pe mobil prin CSS */}
          <span>Sincronizat cu Declarația 112 ANAF</span>
        </div>
      </div>

      {/* ─── HEADER PRINCIPAL ─── */}
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