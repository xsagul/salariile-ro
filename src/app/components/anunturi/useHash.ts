"use client";

// Ce stă după „#” în adresă (tokenul de gestionare, id-ul raportat), citit fără setState în efect.
// `null` la randarea statică și la hidratare: pagina nu știe încă adresa, deci nu decide nimic.
import { useSyncExternalStore } from "react";

const abonare = (f: () => void) => { window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); };

export function useHash(): string | null {
  return useSyncExternalStore(abonare, () => window.location.hash.slice(1), () => null);
}
