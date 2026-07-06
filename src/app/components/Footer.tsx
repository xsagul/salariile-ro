// src/app/components/Footer.tsx
// Footer global. Server Component pur (zero JS la client).
// Afișează doar linkuri către pagini IMPLEMENTATE.
// Adaugă o pagină în IMPLEMENTED_PAGES când e gata și apare automat.

import Link from "next/link";

// Set centralizat: aici adăugăm rutele pe măsură ce le construim
const IMPLEMENTED_PAGES = new Set<string>([
  "/",
  "/calculator-pfa",
  "/fluturas-salariu",
  "/widget",
  "/salariu-minim",
  "/salariu-mediu",
  "/deducere-personala-2026",
  "/zile-libere-2026",
  "/zile-lucratoare-2026",
  "/noutati",
  "/despre",
  "/metodologie",
  "/contact",
  "/politica-confidentialitate",
  "/cookies",
  "/termeni",
  // Adaugă pe măsură ce construiești:
  // "/calculator-concediu",
]);

type FooterLink = { href: string; label: string; external?: boolean };

const FOOTER_GROUPS: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Instrumente",
    links: [
      { href: "/", label: "Calculator salariu net" },
      { href: "/calculator-pfa", label: "Calculator PFA" },
      { href: "/fluturas-salariu", label: "Generator fluturaș salariu" },
      { href: "/widget", label: "Widget pentru site-ul tău" },
      { href: "/calculator-concediu", label: "Calculator concediu medical" },
    ],
  },
  {
    title: "Informații",
    links: [
      { href: "/salariu-minim", label: "Salariu minim 2026" },
      { href: "/salariu-mediu", label: "Salariu mediu 2026" },
      { href: "/deducere-personala-2026", label: "Deducere personală 2026" },
      { href: "/zile-libere-2026", label: "Zile libere 2026" },
      { href: "/zile-lucratoare-2026", label: "Zile lucrătoare 2026" },
      { href: "/noutati", label: "Noutăți legislative" },
    ],
  },
  {
    title: "Comunitate",
    links: [
      // Parteneriat: subreddit-ul de muncă/salarii care găzduiește proiectul
      { href: "https://www.reddit.com/r/RoMunca/", label: "r/RoMunca pe Reddit", external: true },
    ],
  },
  {
    title: "Despre",
    links: [
      { href: "/despre", label: "Despre proiect" },
      { href: "/metodologie", label: "Metodologie de calcul" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/politica-confidentialitate", label: "Politica de confidențialitate" },
      { href: "/cookies", label: "Politica cookies" },
      { href: "/termeni", label: "Termeni și condiții" },
    ],
  },
];

export default function Footer() {
  // Filtrăm doar grupurile care au cel puțin un link implementat
  const visibleGroups = FOOTER_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((l) => l.external || IMPLEMENTED_PAGES.has(l.href)),
  })).filter((group) => group.links.length > 0);

  return (
    <footer className="hairline-t bg-canvas pt-8 pb-6 text-stone-600 sm:pt-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col items-start gap-8 border-b border-stone-200 pb-8 sm:flex-row">
          <Link
            href="/"
            className="mr-auto text-xl font-bold tracking-[-0.02em] text-stone-900"
          >
            salariile.ro
          </Link>
          <p className="max-w-[400px] text-sm leading-normal tracking-[-0.01em] text-stone-600">
            Informații și instrumente despre salariile din România.
            <br />
            Calculele au caracter orientativ. Consultați un specialist contabil
            pentru situații complexe.
          </p>
        </div>

        {visibleGroups.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-8 border-b border-stone-200 pb-8 sm:grid-cols-3">
            {visibleGroups.map((group) => (
              <div key={group.title}>
                <div className="mb-3 text-xs font-medium text-stone-600">
                  {group.title}
                </div>
                {group.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener"
                      className="mb-2 block text-sm text-stone-600 hover:text-stone-900"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="mb-2 block text-sm text-stone-600 hover:text-stone-900"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col flex-wrap items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="m-0 text-xs text-stone-600">
            © {new Date().getFullYear()} Salariile.ro – Actualizat conform
            legislației fiscale în vigoare
          </p>
          {/* Profiluri publice ale autorului – semnal E-E-A-T vizibil pentru
              Quality Raters. rel="me" = atribut microformat oficial pentru
              identitatea autorului. URL-urile nu sunt afișate niciodată
              utilizatorului – doar iconițele minimale. */}
          <div className="inline-flex items-center gap-2" role="group" aria-label="Profiluri publice autor">
            <a
              href="https://www.linkedin.com/in/%C8%99tiuriuc-sorin-marian/"
              target="_blank"
              rel="noopener noreferrer me"
              aria-label="Profil LinkedIn Știuriuc Sorin-Marian"
              title="LinkedIn"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900 focus-visible:bg-stone-200 focus-visible:text-stone-900"
            >
              <svg className="block" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a
              href="https://github.com/xsagul"
              target="_blank"
              rel="noopener noreferrer me"
              aria-label="Profil GitHub Știuriuc Sorin-Marian"
              title="GitHub"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900 focus-visible:bg-stone-200 focus-visible:text-stone-900"
            >
              <svg className="block" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
