"use client";

// src/app/components/Masurare.tsx
// Ciclul paginii pentru GA4: afișări, scroll, secțiuni văzute, detalii
// deschise, clickuri interne, ieșire, Core Web Vitals și erori. Lista completă a
// evenimentelor și motivul pentru care afișările se trimit din cod stau în
// src/lib/analytics.ts.
//
// Montat o singură dată, în src/app/(site)/layout.tsx. Starea paginii curente e
// deci la nivel de modul, nu în ref-uri.
//
// Ieșirea se raportează o dată pe afișare, la prima dintre: navigare internă sau
// pagină ascunsă (tab schimbat, Back, închidere). Cine schimbă tabul și revine
// apare cu timpul de până la prima ascundere — prețul unei singure raportări.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import {
  DOMENII_MASURATE,
  GA_MEASUREMENT_ID,
  adresaFaraSume,
  clasaViewport,
  gtag,
  seteazaParametriComuni,
  textScurt,
  trimiteEveniment,
} from "@/lib/analytics";

type Pagina = {
  /** Momentul (performance.now) de la care pagina e vizibilă; null cât e ascunsă. */
  inceputVizibil: number | null;
  msVizibil: number;
  scrollMax: number;
  praguri: Set<number>;
  interactiune: boolean;
  raportata: boolean;
  erori: number;
};

const PRAGURI_SCROLL = [25, 50, 75] as const;
const MAX_ERORI_PE_PAGINA = 3;

let configurat = false;
let adresaAnterioara = "";
let pagina: Pagina | null = null;
let latimeRaportata = 0;

/** Cât din pagină a ajuns deasupra marginii de jos a ecranului, ca la GA4. */
function adancimeScroll(): number {
  const inaltime = document.documentElement.scrollHeight;
  if (inaltime <= 0) return 100;
  return Math.min(100, Math.round(((window.scrollY + window.innerHeight) / inaltime) * 100));
}

function paginaNoua(): Pagina {
  return {
    inceputVizibil: document.visibilityState === "visible" ? performance.now() : null,
    msVizibil: 0,
    scrollMax: adancimeScroll(),
    praguri: new Set(),
    interactiune: false,
    raportata: false,
    erori: 0,
  };
}

function opresteCronometrul(p: Pagina) {
  if (p.inceputVizibil === null) return;
  p.msVizibil += performance.now() - p.inceputVizibil;
  p.inceputVizibil = null;
}

function raporteazaParasirea(motiv: "navigare_interna" | "ascunsa") {
  const p = pagina;
  if (!p || p.raportata) return;
  p.raportata = true;
  opresteCronometrul(p);
  trimiteEveniment("parasire_pagina", {
    secunde: Math.round(p.msVizibil / 1000),
    scroll_max: p.scrollMax,
    interactiune: p.interactiune ? "da" : "nu",
    motiv,
  });
}

function seteazaViewport() {
  latimeRaportata = window.innerWidth;
  const viewport_clasa = clasaViewport(window.innerWidth);
  seteazaParametriComuni({ viewport: `${window.innerWidth}x${window.innerHeight}`, viewport_clasa });
  gtag("set", "user_properties", { viewport_clasa });
}

function zona(element: Element): string {
  // Sertarul mobil stă în afara <header> (e fix, peste pagină), dar e tot meniul.
  if (element.closest("#meniu-mobil")) return "meniu_mobil";
  if (element.closest("header")) return "header";
  if (element.closest("footer")) return "footer";
  if (element.closest("main")) return "continut";
  return "altul";
}

// În afara componentei, ca referința să rămână stabilă între randări.
function raporteazaViteza(metric: { name: string; value: number; rating?: string }) {
  if (metric.name !== "LCP" && metric.name !== "INP" && metric.name !== "CLS") return;
  trimiteEveniment("web_vitals", {
    metrica: metric.name,
    valoare: metric.name === "CLS" ? Math.round(metric.value * 1000) / 1000 : Math.round(metric.value),
    evaluare: metric.rating,
  });
}

export default function Masurare() {
  const pathname = usePathname();

  useReportWebVitals(raporteazaViteza);

  // Afișarea paginii. Rulează la încărcare și la fiecare schimbare de cale;
  // `?brut=` scris de calculator nu schimbă calea, deci nu mai e o afișare.
  useEffect(() => {
    const adresa = adresaFaraSume(window.location.href);

    if (!configurat) {
      configurat = true;
      gtag("js", new Date());
      const referinta = adresaFaraSume(document.referrer);
      gtag("set", { page_location: adresa, ...(referinta ? { page_referrer: referinta } : {}) });
      seteazaViewport();
      if (DOMENII_MASURATE.has(window.location.hostname)) {
        gtag("config", GA_MEASUREMENT_ID, {
          send_page_view: false,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
        });
      }
    } else {
      gtag("set", { page_location: adresa, page_referrer: adresaAnterioara });
    }

    adresaAnterioara = adresa;
    pagina = paginaNoua();
    trimiteEveniment("page_view", { page_title: document.title });

    const observator = new IntersectionObserver((intrari) => {
      for (const intrare of intrari) {
        if (!intrare.isIntersecting) continue;
        observator.unobserve(intrare.target);
        const element = textScurt(intrare.target.textContent);
        if (element) trimiteEveniment("sectiune_vazuta", { element });
      }
    });
    for (const titlu of document.querySelectorAll("main h2")) observator.observe(titlu);

    return () => {
      observator.disconnect();
      raporteazaParasirea("navigare_interna");
    };
  }, [pathname]);

  // Ascultătorii globali: o singură dată pe toată durata documentului.
  useEffect(() => {
    let cadru = 0;
    const laScroll = () => {
      if (cadru) return;
      cadru = requestAnimationFrame(() => {
        cadru = 0;
        const p = pagina;
        if (!p) return;
        const adancime = adancimeScroll();
        if (adancime > p.scrollMax) p.scrollMax = adancime;
        for (const prag of PRAGURI_SCROLL) {
          if (adancime < prag || p.praguri.has(prag)) continue;
          p.praguri.add(prag);
          trimiteEveniment("scroll", { percent_scrolled: prag });
        }
      });
    };

    // Scrollul singur nu e interacțiune: Next derulează și el la navigare, iar
    // calculatorul aduce rezultatul în ecran. Contează doar gesturile omului.
    const laGest = () => {
      if (pagina) pagina.interactiune = true;
    };

    const laClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      let url: URL;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      // Linkurile externe și descărcările uzuale le măsoară GA4 singur.
      if (url.origin !== window.location.origin) return;
      const extensie = /\.([a-z0-9]{2,5})$/i.exec(url.pathname)?.[1]?.toLowerCase();
      if (extensie) {
        if (extensie === "ics" || extensie === "json") {
          trimiteEveniment("file_download", {
            file_extension: extensie,
            file_name: url.pathname,
            link_url: url.href,
            link_text: textScurt(link.textContent),
          });
        }
        return;
      }
      trimiteEveniment("click_link_intern", {
        link_url: adresaFaraSume(url.href),
        link_text: textScurt(link.textContent || link.getAttribute("aria-label")),
        zona: zona(link),
      });
    };

    // `toggle` nu urcă în DOM, deci se prinde în faza de captură.
    const laToggle = (event: Event) => {
      const detalii = event.target;
      if (!(detalii instanceof HTMLDetailsElement) || !detalii.open) return;
      // Rezumatul conține și markerii „+” și „−” ai acordeonului, lipiți de text.
      const element = textScurt(detalii.querySelector("summary")?.textContent).replace(/[\s+−]+$/, "");
      if (element) trimiteEveniment("detalii_deschise", { element });
    };

    // Pe `window`, în captură: rulează înaintea tagului Google, care golește
    // coada la ascunderea paginii. Altfel evenimentul de ieșire ar rămâne în urmă.
    const laVizibilitate = () => {
      const p = pagina;
      if (!p) return;
      if (document.visibilityState === "hidden") {
        opresteCronometrul(p);
        raporteazaParasirea("ascunsa");
      } else if (p.inceputVizibil === null) {
        p.inceputVizibil = performance.now();
      }
    };
    const laPagehide = () => raporteazaParasirea("ascunsa");

    let temporizator = 0;
    const laRedimensionare = () => {
      window.clearTimeout(temporizator);
      temporizator = window.setTimeout(() => {
        if (window.innerWidth !== latimeRaportata) seteazaViewport();
      }, 400);
    };

    const laEroare = (event: ErrorEvent) => {
      const p = pagina;
      if (!p || p.erori >= MAX_ERORI_PE_PAGINA) return;
      // Doar scripturile noastre: erorile scripturilor Google nu sunt ale site-ului.
      if (!event.filename?.startsWith(window.location.origin)) return;
      p.erori++;
      trimiteEveniment("eroare_js", {
        mesaj: textScurt(event.message),
        sursa: textScurt(`${new URL(event.filename).pathname}:${event.lineno}`),
      });
    };
    const laPromisiune = (event: PromiseRejectionEvent) => {
      const p = pagina;
      const motiv = event.reason;
      if (!p || p.erori >= MAX_ERORI_PE_PAGINA || !(motiv instanceof Error)) return;
      if (!motiv.stack?.includes(`${window.location.origin}/_next/`)) return;
      p.erori++;
      trimiteEveniment("eroare_js", { mesaj: textScurt(motiv.message), sursa: "promisiune" });
    };

    const pasiv = { passive: true } as const;
    window.addEventListener("scroll", laScroll, pasiv);
    window.addEventListener("pointerdown", laGest, pasiv);
    window.addEventListener("keydown", laGest, pasiv);
    window.addEventListener("wheel", laGest, pasiv);
    window.addEventListener("touchmove", laGest, pasiv);
    document.addEventListener("click", laClick, true);
    document.addEventListener("toggle", laToggle, true);
    window.addEventListener("visibilitychange", laVizibilitate, true);
    window.addEventListener("pagehide", laPagehide, true);
    window.addEventListener("resize", laRedimensionare, pasiv);
    window.addEventListener("error", laEroare);
    window.addEventListener("unhandledrejection", laPromisiune);

    return () => {
      cancelAnimationFrame(cadru);
      window.clearTimeout(temporizator);
      window.removeEventListener("scroll", laScroll);
      window.removeEventListener("pointerdown", laGest);
      window.removeEventListener("keydown", laGest);
      window.removeEventListener("wheel", laGest);
      window.removeEventListener("touchmove", laGest);
      document.removeEventListener("click", laClick, true);
      document.removeEventListener("toggle", laToggle, true);
      window.removeEventListener("visibilitychange", laVizibilitate, true);
      window.removeEventListener("pagehide", laPagehide, true);
      window.removeEventListener("resize", laRedimensionare);
      window.removeEventListener("error", laEroare);
      window.removeEventListener("unhandledrejection", laPromisiune);
    };
  }, []);

  return null;
}
