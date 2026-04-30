"use client";

// src/app/components/Header.tsx
// Header global cu navigare responsive.
// Desktop (>768px): linkuri inline orizontale
// Mobile (<=768px): buton hamburger care deschide dropdown vertical

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

  // Determină dacă un link e activ
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Închide meniul automat la schimbare de pagină
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Blochează scroll pe body când meniul e deschis (UX mobile)
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
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo">
          salariile<span>.ro</span>
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
  );
}
