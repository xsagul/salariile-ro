"use client";

import { useState } from "react";
import FormularAnunt from "@/app/components/anunturi/FormularAnunt";

/** Formularul de publicare și mesajul de după trimitere: linkul de confirmare vine pe email. */
export default function PublicaAnunt() {
  const [email, setEmail] = useState<string | null>(null);
  if (email) {
    return (
      <div data-anunt-trimis="">
        <p className="text-lg font-semibold text-stone-900">Verifică-ți emailul</p>
        <p className="mt-2 text-base text-stone-700">
          Ți-am trimis la <strong>{email}</strong> linkul cu care publici anunțul. Până nu-l deschizi, anunțul nu apare pe site.
        </p>
        <p className="mt-2 text-sm text-stone-600">Nu găsești mesajul? Uită-te și în Spam sau Promoții. Fără confirmare, anunțul se șterge în 48 de ore.</p>
      </div>
    );
  }
  return (
    <FormularAnunt
      trimite={async (v) => {
        const r = await fetch("/api/anunturi", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) });
        const j = await r.json();
        if (!r.ok) return { erori: j.erori ?? [{ camp: "general", mesaj: j.eroare ?? "Nu s-a putut trimite." }] };
        setEmail(String(v.email));
      }}
    />
  );
}
