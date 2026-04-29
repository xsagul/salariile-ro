// src/app/components/Footer.tsx
// Footer global. Server Component pur (zero JS la client).
// Afișează doar linkuri către pagini IMPLEMENTATE.
// Adaugă o pagină în IMPLEMENTED_PAGES când e gata și apare automat.

import Link from "next/link";

// Set centralizat: aici adăugăm rutele pe măsură ce le construim
const IMPLEMENTED_PAGES = new Set<string>([
  "/",
  "/salariu-minim",
  // Adaugă pe măsură ce construiești:
  "/salariu-mediu",
  // "/calculator-pfa",
  // "/calculator-concediu",
  // "/noutati",
  // "/politica-confidentialitate",
  // "/termeni",
]);

type FooterLink = { href: string; label: string };

const FOOTER_GROUPS: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Calculatoare",
    links: [
      { href: "/", label: "Calculator salariu net" },
      { href: "/calculator-pfa", label: "Calculator PFA" },
      { href: "/calculator-concediu", label: "Calculator concediu medical" },
    ],
  },
  {
    title: "Informații",
    links: [
      { href: "/salariu-minim", label: "Salariu minim 2026" },
      { href: "/salariu-mediu", label: "Salariu mediu 2026" },
      { href: "/noutati", label: "Noutăți legislative" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/politica-confidentialitate", label: "Politică confidențialitate" },
      { href: "/termeni", label: "Termeni și condiții" },
    ],
  },
];

export default function Footer() {
  // Filtrăm doar grupurile care au cel puțin un link implementat
  const visibleGroups = FOOTER_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((l) => IMPLEMENTED_PAGES.has(l.href)),
  })).filter((group) => group.links.length > 0);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Link href="/" className="logo">
            salariile<span>.ro</span>
          </Link>
          <p>
            Informații și instrumente despre salariile din România.
            <br />
            Calculele au caracter orientativ. Consultați un specialist contabil
            pentru situații complexe.
          </p>
        </div>

        {visibleGroups.length > 0 && (
          <div className="footer-links">
            {visibleGroups.map((group) => (
              <div key={group.title}>
                <h4>{group.title}</h4>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Salariile.ro — Actualizat conform
            legislației fiscale în vigoare
          </p>
        </div>
      </div>
    </footer>
  );
}
