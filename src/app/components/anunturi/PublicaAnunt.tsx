"use client";

import { useState } from "react";
import FormularAnunt from "@/app/components/anunturi/FormularAnunt";
import { linkDistribuieFacebook, linkDistribuieWhatsApp } from "@/lib/anunturi/reguli";

const BUTON = "inline-flex min-h-11 items-center rounded-md border border-stone-300 bg-surface px-4 font-semibold text-stone-900 hover:border-stone-500";

/**
 * Formularul de publicare și mesajul de după trimitere. Anunțul e publicat pe loc (proprietar,
 * 29 septembrie 2026); linkul de gestionare vine pe email și apare și aici, ca să nu se piardă.
 */
export default function PublicaAnunt() {
  const [gata, setGata] = useState<{ email: string; url: string; gestionare: string; titlu: string; suma: string } | null>(null);
  const [copiat, setCopiat] = useState(false);
  if (gata) {
    const link = `${window.location.origin}${gata.url}`;
    return (
      // Butonul de trimitere e la capătul formularului: fără derulare, mesajul ar rămâne deasupra ecranului.
      <div data-anunt-trimis="" ref={(el) => el?.scrollIntoView({ block: "center" })}>
        <p className="text-lg font-semibold text-stone-900">Anunțul e publicat</p>
        <p className="mt-2 text-base text-stone-700">Candidații îl văd de acum și te sună direct. Rămâne pe site 30 de zile.</p>
        <p className="mt-4 flex flex-wrap gap-3">
          <a href={gata.url} className="inline-flex min-h-11 items-center rounded-md bg-stone-900 px-4 font-semibold text-white hover:bg-stone-700">Vezi anunțul</a>
          <a href={gata.gestionare} className={BUTON}>Modifică sau șterge</a>
        </p>
        <div className="mt-5 rounded-md border border-stone-200 bg-stone-50 p-4">
          <p className="text-base font-semibold text-stone-900">Adu mai mulți candidați</p>
          <p className="mt-1 text-sm text-stone-700">Pune linkul în grupurile de Facebook cu locuri de muncă din orașul tău sau trimite-l pe WhatsApp: cine îl deschide vede salariul și te sună direct.</p>
          <p className="mt-3 flex flex-wrap gap-3">
            <a href={linkDistribuieFacebook(link)} target="_blank" rel="noopener" className={BUTON} data-distribuie="facebook">Distribuie pe Facebook</a>
            <a href={linkDistribuieWhatsApp(link, gata.titlu, gata.suma)} target="_blank" rel="noopener" className={BUTON} data-distribuie="whatsapp">Trimite pe WhatsApp</a>
            <button type="button" className={BUTON} data-distribuie="copiaza"
              onClick={() => navigator.clipboard?.writeText(link).then(() => setCopiat(true), () => setCopiat(false))}>
              {copiat ? "Linkul e copiat" : "Copiază linkul"}
            </button>
          </p>
        </div>
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
        const suma = `${[v.salariuMin, v.salariuMax].filter(Boolean).map((x) => Number(x).toLocaleString("ro-RO")).join("–")} lei ${v.baza}`;
        setGata({ email: String(v.email), url: j.url, gestionare: j.gestionare, titlu: String(v.titlu), suma });
      }}
    />
  );
}
