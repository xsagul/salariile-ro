"use client";

// src/app/components/Header.tsx
// Header global. Folosește usePathname() ca să evidențieze automat
// linkul corespunzător paginii curente — fără să trebuiască să specifici
// `active` pe fiecare pagină.

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Calculator" },
  { href: "/salariu-minim", label: "Salariu minim" },
  { href: "/salariu-mediu", label: "Salariu mediu" },
  { href: "/noutati", label: "Noutăți" },
];

export default function Header() {
  const pathname = usePathname();

  // Determină dacă un link e activ
  // - "/" e activ doar pentru exact "/"
  // - celelalte sunt active dacă pathname-ul începe cu href (ex: /salariu-minim/sub-pagina)
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo">
          salariile<span>.ro</span>
        </Link>
        <nav>
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
      </div>
    </header>
  );
}
