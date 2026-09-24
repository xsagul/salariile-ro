"use client";

// src/app/components/Header.tsx
import Link from "@/app/components/Link";
import Logo from "@/app/components/Logo";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  raporteazaVariantaNavbar,
  variantaNavbarDinAdresa,
  variantaNavbarDinCookie,
  type VariantaNavbar,
} from "@/lib/analytics";

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
  const sertarRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  // Sertarul și fundalul pornesc de sub bara de sus, care rămâne neumbrită, cu
  // logoul și cu X-ul în locul butonului de meniu. Bara nu e fixă, așa că
  // marginea se măsoară la deschidere.
  const [susSertar, setSusSertar] = useState(64);
  // Testul A/B/C al barei de sus (vezi analytics.ts). Randarea statică e mereu
  // varianta a; b și c se aplică după încărcare, doar vizitatorilor cu acord.
  // Trecerea de la `relative` la `sticky` nu mută nimic în pagină: bara își
  // păstrează locul, deci nu există salt de layout.
  const [navbar, setNavbar] = useState<VariantaNavbar>("a");
  const [baraAscunsa, setBaraAscunsa] = useState(false);
  // Sertarul mobil: un singur grup deschis odată (cerut de proprietar pe 24
  // septembrie 2026). La deschidere e deschis grupul paginii curente.
  const [grupDeschis, setGrupDeschis] = useState<string | null>(
    () => NAV.filter(isGroup).find((g) => g.children.some((c) => pathname.startsWith(c.href)))?.label ?? null,
  );

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const groupActive = (g: Group) => g.children.some((c) => isActive(c.href));


  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setOpen(false);
      setDesktopOpen(null);
      // După navigare, la redeschidere e deschis grupul noii pagini.
      setGrupDeschis(NAV.filter(isGroup).find((g) => g.children.some((c) => pathname.startsWith(c.href)))?.label ?? null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    // Acordul poate veni în timpul vizitei, deci varianta se recitește la
    // fiecare navigare și o dată la câteva secunde după încărcare.
    const citeste = () => {
      const previzualizare = variantaNavbarDinAdresa(window.location.search);
      if (previzualizare) {
        setNavbar(previzualizare); // doar pe ecran, nu intră în test
        return;
      }
      const varianta = variantaNavbarDinCookie(document.cookie);
      if (!varianta) return;
      setNavbar(varianta);
      raporteazaVariantaNavbar(varianta);
    };
    const frame = requestAnimationFrame(citeste);
    const intarziat = setTimeout(citeste, 6000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(intarziat);
    };
  }, [pathname]);

  useEffect(() => {
    if (navbar !== "c") return;
    // Varianta c: bara pleacă la derulare în jos și revine la prima derulare în
    // sus. Pragul de 6 px ignoră tremuratul degetului; sus de tot e mereu vizibilă.
    let ultim = window.scrollY;
    const laDerulare = () => {
      const y = window.scrollY;
      if (y < 64) setBaraAscunsa(false);
      else if (y > ultim + 6) setBaraAscunsa(true);
      else if (y < ultim - 6) setBaraAscunsa(false);
      ultim = y;
    };
    window.addEventListener("scroll", laDerulare, { passive: true });
    return () => window.removeEventListener("scroll", laDerulare);
  }, [navbar]);

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

  const inchideSertarul = () => {
    setOpen(false);
    hamburgerRef.current?.focus();
  };

  const deschideSertarul = () => {
    setSusSertar(Math.max(0, Math.round(headerRef.current?.getBoundingClientRect().bottom ?? 64)));
    setOpen(true);
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      // Escape închide sertarul și duce focusul înapoi pe butonul de meniu.
      if (event.key === "Escape") {
        setOpen(false);
        hamburgerRef.current?.focus();
        return;
      }
      // Cât e deschis, focusul circulă între butonul X și sertar.
      if (event.key === "Tab" && sertarRef.current) {
        const focusabile = [
          hamburgerRef.current,
          ...sertarRef.current.querySelectorAll<HTMLElement>("a[href], button"),
        ].filter((el): el is HTMLElement => Boolean(el));
        const primul = focusabile[0];
        const ultimul = focusabile[focusabile.length - 1];
        if (event.shiftKey && document.activeElement === primul) {
          event.preventDefault();
          ultimul?.focus();
        } else if (!event.shiftKey && document.activeElement === ultimul) {
          event.preventDefault();
          primul?.focus();
        }
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
    `flex min-h-12 items-center px-5 text-base ${active ? "bg-stone-100 font-semibold text-stone-900" : "text-stone-800"}`;

  const bar = "block h-0.5 w-5 bg-stone-900 transition duration-[250ms]";

  const chevron = (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );

  return (
    <>
      {/* Fundalul întunecat din spatele sertarului; o atingere pe el închide meniul. */}
      <div
        style={{ top: susSertar }}
        className={`fixed inset-x-0 bottom-0 z-40 bg-stone-900/40 transition-opacity duration-300 motion-reduce:transition-none md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={inchideSertarul}
      />

    <header
      ref={headerRef}
      data-navbar={navbar}
      className={`hairline-b w-full bg-canvas ${
        navbar === "a"
          ? "relative"
          : `sticky top-0 z-40 ${
              navbar === "c"
                ? // Durate Material Design: intrarea 225 ms cu încetinire la final,
                  // ieșirea 195 ms cu accelerare — ce pleacă e puțin mai rapid.
                  `transition-transform motion-reduce:transition-none ${
                    baraAscunsa && !open ? "-translate-y-full duration-[195ms] ease-in" : "duration-[225ms] ease-out"
                  }`
                : ""
            }`
      }`}
    >
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
          onClick={() => (open ? inchideSertarul() : deschideSertarul())}
        >
          <span className={`${bar} ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`${bar} ${open ? "opacity-0" : ""}`} />
          <span className={`${bar} ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>

    </header>

      {/* Sertarul mobil, refăcut pe 24 septembrie 2026 după modelul cerut de
          proprietar: vine din dreapta, ocupă 85% din lățime, iar pagina rămâne
          vizibilă și întunecată în stânga. Lista are scroll propriu, cât
          ecranul (înainte, două grupuri deschise treceau de margine fără scroll),
          iar grupurile sunt acordeoane cu un singur grup deschis odată. Bara de
          sus rămâne deasupra, neumbrită: logoul se vede, iar butonul de meniu
          devine X exact unde a fost apăsat. */}
      <div
        id="meniu-mobil"
        ref={sertarRef}
        inert={!open}
        style={{ top: susSertar }}
        className={`fixed bottom-0 right-0 z-50 flex w-[85%] max-w-sm flex-col bg-canvas shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav aria-label="Meniu principal" className="flex-1 overflow-y-auto overscroll-contain pb-6">
          {NAV.map((item) =>
            isGroup(item) ? (
              <div key={item.label} className="border-b border-stone-200">
                <button
                  type="button"
                  className={`flex min-h-12 w-full items-center justify-between px-5 text-base ${
                    groupActive(item) ? "font-semibold text-stone-900" : "text-stone-800"
                  }`}
                  aria-expanded={grupDeschis === item.label}
                  aria-controls={`sertar-${idGrup(item.label)}`}
                  onClick={() => setGrupDeschis((g) => (g === item.label ? null : item.label))}
                >
                  {item.label}
                  <span className={`transition-transform duration-200 ${grupDeschis === item.label ? "rotate-180" : ""}`}>
                    {chevron}
                  </span>
                </button>
                <div id={`sertar-${idGrup(item.label)}`} hidden={grupDeschis !== item.label} className="pb-2">
                  {item.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      aria-current={isActive(c.href) ? "page" : undefined}
                      className={`flex min-h-11 items-center py-2 pl-9 pr-5 text-[15px] ${
                        isActive(c.href) ? "bg-stone-100 font-semibold text-stone-900" : "text-stone-600"
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
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
      </div>
    </>
  );
}
