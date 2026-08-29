"use client";

// src/app/components/RaporteazaAnunt.tsx
//
// Un buton, un click. Candidatul care descopera ca postul e luat nu trebuie sa
// compuna un email, sa explice sau sa lase datele lui — apasa si pleaca.
//
// Butonul NU retrage anuntul. Trimite un semnal, iar verificarea o facem noi.
// Textul spune exact asta, ca sa nu para ca site-ul minte cand anuntul e inca
// acolo peste cinci minute.

import { useState } from "react";

type Stare = "gata" | "trimit" | "trimis" | "eroare";

export default function RaporteazaAnunt({ slug }: { slug: string }) {
  const [stare, setStare] = useState<Stare>("gata");

  async function raporteaza() {
    if (stare === "trimit" || stare === "trimis") return;
    setStare("trimit");
    try {
      const r = await fetch("/api/joburi/raport", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      setStare(r.ok ? "trimis" : "eroare");
    } catch {
      setStare("eroare");
    }
  }

  if (stare === "trimis") {
    return (
      <p className="text-sm text-stone-700" role="status">
        <strong className="font-medium text-stone-900">Mulțumim.</strong> Verificăm anunțul și îl retragem
        dacă postul e ocupat.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={raporteaza}
        disabled={stare === "trimit"}
        className="min-h-11 rounded border border-stone-300 bg-surface px-4 text-sm font-medium text-stone-900 transition-colors hover:bg-canvas disabled:cursor-wait disabled:text-stone-400"
      >
        {stare === "trimit" ? "Se trimite…" : "Postul nu mai e liber"}
      </button>
      <p className="mt-2 text-xs text-stone-600">
        {stare === "eroare"
          ? "Nu am putut trimite semnalul. Încearcă din nou peste câteva momente."
          : "Un click ne anunță să verificăm. Nu-ți cerem numele și nu retrage anunțul automat."}
      </p>
    </div>
  );
}
