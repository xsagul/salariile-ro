"use client";

// Raportarea unui anunț (DSA, art. 16): /locuri-de-munca/raporteaza#<id>. Motivul, detalii
// opționale și, dacă vrea, emailul celui care raportează, ca să primească răspunsul.
import { useState } from "react";
import { useHash } from "@/app/components/anunturi/useHash";

const MOTIVE = ["țeapă sau cerere de bani", "discriminare", "salariul nu e cel real", "anunț fals sau duplicat", "conținut ilegal", "altceva"];
const CAMP = "mt-1 block w-full rounded-md border border-stone-300 bg-surface px-3 py-2 text-base text-stone-900";

export default function RaporteazaAnunt() {
  const [motiv, setMotiv] = useState("");
  const [detalii, setDetalii] = useState("");
  const [email, setEmail] = useState("");
  const [stare, setStare] = useState<"" | "trimis" | string>("");
  const hash = useHash();
  const n = Number(hash);
  const id = hash && Number.isInteger(n) && n > 0 ? n : null;

  if (id === null) return <p className="text-base text-stone-700">Deschide raportarea din pagina anunțului.</p>;
  if (stare === "trimis") return <p className="text-base text-stone-800">Mulțumim. Verificăm anunțul{email ? " și îți scriem când am decis" : ""}.</p>;

  async function trimite(e: React.FormEvent) {
    e.preventDefault();
    if (!motiv) { setStare("Alege un motiv."); return; }
    const r = await fetch("/api/anunturi/raporteaza", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, motiv, detalii, email }) });
    const j = await r.json();
    setStare(r.ok ? "trimis" : j.eroare ?? "Nu s-a putut trimite.");
  }

  return (
    <form onSubmit={trimite} className="grid gap-4">
      {stare && <p className="text-sm text-red-700">{stare}</p>}
      <fieldset className="grid gap-2">
        <legend className="text-base font-bold text-stone-900">Ce e în neregulă?</legend>
        {MOTIVE.map((m) => (
          <label key={m} className="flex items-center gap-2 text-base text-stone-800"><input type="radio" name="motiv" value={m} checked={motiv === m} onChange={() => setMotiv(m)} />{m.charAt(0).toUpperCase() + m.slice(1)}</label>
        ))}
      </fieldset>
      <label className="block text-sm font-medium text-stone-800">Detalii (opțional)
        <textarea value={detalii} onChange={(e) => setDetalii(e.target.value)} rows={4} maxLength={1000} className={CAMP} />
      </label>
      <label className="block text-sm font-medium text-stone-800">Emailul tău, dacă vrei răspuns (opțional)
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={CAMP} />
      </label>
      <div><button type="submit" className="inline-flex min-h-11 items-center rounded-md bg-stone-900 px-5 font-semibold text-white hover:bg-stone-700">Trimite raportarea</button></div>
    </form>
  );
}
