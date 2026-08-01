"use client";

// Adâncime de scroll și click-uri pe linkuri interne.
//
// Ce NU face, pentru că Enhanced measurement din GA4 le acoperă deja:
//   - scroll la 90% (evenimentul nativ `scroll`);
//   - click pe linkuri externe (evenimentul nativ `click`).
// Aici urmărim pragurile intermediare, ca să vezi unde pică oamenii pe pagină,
// și navigarea internă, pe care GA4 nu o vede deloc.
//
// Fără consimțământ, `trackEvent` este no-op: gtag nici nu există în pagină.

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const PRAGURI = [25, 50, 75, 90] as const;

export default function UrmarireInteractiuni() {
  const pathname = usePathname();

  // Adâncime de scroll. Pragurile se resetează la fiecare schimbare de rută,
  // altfel o navigare client-side ar moșteni pragurile paginii anterioare.
  useEffect(() => {
    const atinse = new Set<number>();
    let ultimaMasurare = 0;
    let temporizator: ReturnType<typeof setTimeout> | undefined;

    const masoara = () => {
      ultimaMasurare = Date.now();
      const doc = document.documentElement;
      const scrollabil = doc.scrollHeight - window.innerHeight;
      // Pagină mai scurtă decât ecranul: nu există adâncime de măsurat.
      if (scrollabil <= 0) return;
      const procent = Math.min(100, Math.round((window.scrollY / scrollabil) * 100));
      for (const prag of PRAGURI) {
        if (procent >= prag && !atinse.has(prag)) {
          atinse.add(prag);
          trackEvent("scroll_adancime", { procent: prag, cale: pathname });
        }
      }
    };

    // Throttle pe timp, nu pe requestAnimationFrame: rAF nu rulează în taburi
    // de fundal, iar un flag „am planificat deja" ar rămâne blocat definitiv,
    // omorând silențios urmărirea pentru toată pagina. Listener pasiv, deci
    // nu blochează scrollul și nu afectează INP-ul.
    const laScroll = () => {
      const acum = Date.now();
      const trecut = acum - ultimaMasurare;
      if (trecut >= 200) {
        masoara();
        return;
      }
      if (temporizator) return;
      temporizator = setTimeout(() => {
        temporizator = undefined;
        masoara();
      }, 200 - trecut);
    };

    // Măsurare inițială: pagina poate fi deja derulată (ancoră în URL sau
    // poziție restaurată de browser la revenire).
    masoara();
    window.addEventListener("scroll", laScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", laScroll);
      if (temporizator) clearTimeout(temporizator);
    };
  }, [pathname]);

  // Click pe linkuri. Delegare pe document, ca să prindem și linkurile
  // randate ulterior, fără să atașăm listener pe fiecare ancoră.
  useEffect(() => {
    const laClick = (ev: MouseEvent) => {
      const ancora = (ev.target as HTMLElement | null)?.closest?.("a");
      if (!ancora) return;
      const href = ancora.getAttribute("href");
      if (!href) return;

      if (href.startsWith("#")) {
        trackEvent("click_ancora", { destinatie: href.slice(0, 100), de_pe: pathname });
        return;
      }
      if (href.startsWith("mailto:") || href.startsWith("tel:")) {
        trackEvent("click_contact", { tip: href.split(":")[0], de_pe: pathname });
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      // Externele sunt deja acoperite de Enhanced measurement; nu le dublăm.
      if (url.host !== window.location.host) return;

      trackEvent("click_link_intern", {
        destinatie: url.pathname,
        de_pe: pathname,
        descarcare: /\.(csv|json|pdf)$/i.test(url.pathname),
      });
    };

    // capture: prindem click-ul înainte ca Next să facă navigarea.
    document.addEventListener("click", laClick, true);
    return () => document.removeEventListener("click", laClick, true);
  }, [pathname]);

  return null;
}
