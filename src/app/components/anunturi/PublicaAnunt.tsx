"use client";

import { useState } from "react";
import FormularAnunt from "@/app/components/anunturi/FormularAnunt";

/**
 * Formularul de publicare și mesajul de după trimitere. Anunțul e publicat pe loc (proprietar,
 * 29 septembrie 2026); linkul de gestionare vine pe email și apare și aici, ca să nu se piardă.
 */
export default function PublicaAnunt() {
  const [gata, setGata] = useState<{ email: string; url: string; gestionare: string } | null>(null);
  if (gata) {
    return (
      // Butonul de trimitere e la capătul formularului: fără derulare, mesajul ar rămâne deasupra ecranului.
      <div data-anunt-trimis="" ref={(el) => el?.scrollIntoView({ block: "center" })}>
        <p className="text-lg font-semibold text-stone-900">Anunțul e publicat</p>
        <p className="mt-2 text-base text-stone-700">Candidații îl văd de acum și te sună direct. Rămâne pe site 30 de zile.</p>
        <p className="mt-4 flex flex-wrap gap-3">
          <a href={gata.url} className="inline-flex min-h-11 items-center rounded-md bg-stone-900 px-4 font-semibold text-white hover:bg-stone-700">Vezi anunțul</a>
          <a href={gata.gestionare} className="inline-flex min-h-11 items-center rounded-md border border-stone-300 bg-surface px-4 font-semibold text-stone-900 hover:border-stone-500">Modifică sau șterge</a>
        </p>
        <p className="mt-4 text-sm text-stone-600">
          Ți-am trimis la <strong>{gata.email}</strong> linkul cu care îl modifici, îl prelungești sau îl ștergi. Nu-l găsești? Uită-te și în Spam sau Promoții, ori salvează acum butonul „Modifică sau șterge”.
        </p>
      </div>
    );
  }
  return (
    <FormularAnunt
      trimite={async (v) => {
        const r = await fetch("/api/anunturi", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) });
        const j = await r.json();
        if (!r.ok) return { erori: j.erori ?? [{ camp: "general", mesaj: j.eroare ?? "Nu s-a putut trimite." }] };
        setGata({ email: String(v.email), url: j.url, gestionare: j.gestionare });
      }}
    />
  );
}
