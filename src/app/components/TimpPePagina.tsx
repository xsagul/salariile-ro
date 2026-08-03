"use client";

// Măsoară timpul petrecut pe fiecare pagină și îl trimite la Umami ca eveniment
// de ieșire.
//
// De ce e nevoie: Umami calculează durata unei vizite ca diferența dintre primul
// și ultimul eveniment. Cu un singur `pageview` per pagină, o vizită de o
// singură pagină are un singur timestamp, deci durata iese zero — nu pentru că
// omul a plecat instant, ci pentru că n-avem al doilea punct de măsurare. La
// noi asta însemna 87% din vizite raportate ca 0s.
//
// Evenimentul de ieșire adaugă acel al doilea timestamp pentru FIECARE afișare,
// inclusiv ultima dintr-o vizită, care altfel nu se măsoară niciodată. Nu e o
// metrică paralelă: repară numărătoarea pe care Umami o face deja, iar
// rapoartele lui native încep să arate durate reale.
//
// Nu setează cookies și nu scrie nimic pe dispozitiv — totul stă în memorie cât
// ține pagina. Site-ul rămâne fără banner de consimțământ.

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type UmamiTracker = {
  track: (event: string, data?: Record<string, string | number | boolean>) => void;
};

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

export default function TimpPePagina() {
  const pathname = usePathname();

  useEffect(() => {
    const intrare = Date.now();
    let trimis = false;

    const trimite = () => {
      // O singură dată per afișare: `pagehide` și `visibilitychange` se pot
      // declanșa amândouă pentru aceeași plecare.
      if (trimis) return;
      const secunde = Math.round((Date.now() - intrare) / 1000);
      // Sub o secundă nu e lectură, e o redirecționare sau un bot.
      if (secunde < 1) return;
      // Peste 30 de minute e aproape sigur un tab uitat deschis, nu timp de
      // citit. Îl plafonăm ca să nu strice mediile.
      if (secunde > 1800) return;

      trimis = true;
      window.umami?.track("timp-pagina", { secunde, cale: pathname });
    };

    // Ambele evenimente, deliberat:
    //   - `pagehide` prinde navigarea și închiderea pe desktop;
    //   - `visibilitychange` e singurul de încredere pe iOS Safari, unde
    //     `pagehide` nu se declanșează consecvent la închiderea tabului.
    // 36% din traficul nostru e mobil, deci al doilea nu e opțional.
    const laAscundere = () => {
      if (document.visibilityState === "hidden") trimite();
    };

    window.addEventListener("pagehide", trimite);
    document.addEventListener("visibilitychange", laAscundere);

    return () => {
      // Navigare client-side către altă rută: pagina curentă s-a încheiat,
      // deci o raportăm acum. Fără asta, o vizită cu mai multe pagini ar
      // trimite un singur eveniment, la final.
      trimite();
      window.removeEventListener("pagehide", trimite);
      document.removeEventListener("visibilitychange", laAscundere);
    };
  }, [pathname]);

  return null;
}
