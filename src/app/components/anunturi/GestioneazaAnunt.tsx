"use client";

// Gestionarea unui anunț din linkul primit pe email: /adauga-anunt-angajare/gestioneaza#<token>.
// Tokenul stă după „#”, deci nu ajunge niciodată la server în URL și nici în logurile Cloudflare;
// nici scanerele de linkuri din email nu publică anunțul: publicarea cere apăsarea butonului.
import { useEffect, useState } from "react";
import FormularAnunt, { type Valori } from "@/app/components/anunturi/FormularAnunt";
import { urlAnunt } from "@/lib/anunturi/reguli";

type Anunt = {
  id: number; stare: string; titlu: string; slug: string; meserie: string | null; angajator: string; cui: string | null; judet: string; oras: string;
  norma: string; ore_pe_zi: number | null; salariu_min: number; salariu_max: number | null; baza: string; descriere: string;
  telefon: string | null; email_contact: string | null; expira_la: string | null;
};

const STARI: Record<string, string> = {
  neconfirmat: "Nepublicat încă: apasă „Publică anunțul”.",
  activ: "Publicat.",
  expirat: "Expirat: nu mai apare pe site. Îl poți prelungi cu 30 de zile.",
  suspendat: "Suspendat cât timp îl verificăm, după raportări.",
};

async function cere(token: string, actiune: string, date?: Valori) {
  const r = await fetch("/api/anunturi/gestioneaza", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, actiune, date }) });
  return { ok: r.ok, j: await r.json() };
}

export default function GestioneazaAnunt() {
  const [token, setToken] = useState("");
  const [a, setA] = useState<Anunt | null>(null);
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [modifica, setModifica] = useState(false);

  useEffect(() => {
    const t = window.location.hash.slice(1);
    setToken(t);
    if (!t) { setMesaj("Linkul e incomplet. Deschide-l exact cum a venit în email."); return; }
    cere(t, "citeste").then(({ ok, j }) => (ok ? setA(j.anunt) : setMesaj(j.eroare)));
  }, []);

  async function actiune(nume: string) {
    if (nume === "sterge" && !window.confirm("Ștergi anunțul? Nu se mai poate recupera.")) return;
    const { ok, j } = await cere(token, nume);
    if (!ok) { setMesaj(j.eroare ?? "Nu s-a putut."); return; }
    if (j.sters) { setA(null); setMesaj("Anunțul a fost șters. Datele de contact au fost șterse odată cu el."); return; }
    setA(j.anunt);
    setMesaj(nume === "confirma" ? "Anunțul e publicat." : nume === "prelungeste" ? "Anunțul e prelungit cu 30 de zile." : null);
  }

  if (!a) return <p className="text-base text-stone-700">{mesaj ?? "Se încarcă…"}</p>;
  const initial: Valori = {
    titlu: a.titlu, meserie: a.meserie ?? "", angajator: a.angajator, cui: a.cui ?? "", judet: a.judet, oras: a.oras, norma: a.norma,
    orePeZi: String(a.ore_pe_zi ?? 4), salariuMin: String(a.salariu_min), salariuMax: a.salariu_max ? String(a.salariu_max) : "", baza: a.baza,
    descriere: a.descriere, telefon: a.telefon ?? "", emailContact: a.email_contact ?? "",
  };
  const BUTON = "inline-flex min-h-11 items-center rounded-md px-4 font-semibold";
  return (
    <div className="grid gap-5">
      {mesaj && <p className="rounded-md border border-stone-300 bg-stone-50 p-3 text-sm text-stone-800">{mesaj}</p>}
      <div>
        <p className="text-lg font-semibold text-stone-900">{a.titlu}</p>
        <p className="mt-1 text-sm text-stone-700">{STARI[a.stare] ?? a.stare}{a.stare === "activ" && a.expira_la ? ` Până pe ${new Date(a.expira_la).toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}.` : ""}</p>
        {a.stare === "activ" && <p className="mt-1 text-sm"><a className="underline underline-offset-2" href={urlAnunt(a)}>Vezi anunțul pe site</a></p>}
      </div>
      <div className="flex flex-wrap gap-3">
        {a.stare === "neconfirmat" && <button onClick={() => actiune("confirma")} className={`${BUTON} bg-stone-900 text-white hover:bg-stone-700`}>Publică anunțul</button>}
        {(a.stare === "activ" || a.stare === "expirat") && <button onClick={() => actiune("prelungeste")} className={`${BUTON} border border-stone-300 bg-surface text-stone-900`}>Prelungește cu 30 de zile</button>}
        <button onClick={() => setModifica((x) => !x)} className={`${BUTON} border border-stone-300 bg-surface text-stone-900`}>{modifica ? "Renunță la modificări" : "Modifică"}</button>
        <button onClick={() => actiune("sterge")} className={`${BUTON} border border-red-300 bg-surface text-red-800`}>Șterge anunțul</button>
      </div>
      {modifica && (
        <FormularAnunt modificare initial={initial} trimite={async (v) => {
          const { ok, j } = await cere(token, "modifica", v);
          if (!ok) return { erori: j.erori ?? [{ camp: "general", mesaj: j.eroare ?? "Nu s-a putut." }] };
          setA(j.anunt); setModifica(false); setMesaj("Modificările sunt salvate.");
        }} />
      )}
    </div>
  );
}
