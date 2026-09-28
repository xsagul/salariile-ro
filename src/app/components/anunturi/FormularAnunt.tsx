"use client";

// Formularul unui anunț de angajare: publicare (fără cont) și modificare din linkul primit pe email.
// Aceleași reguli ca Worker-ul (src/lib/anunturi/reguli.ts), deci erorile apar înainte de trimitere.
import { useCallback, useMemo, useState } from "react";
import catalog from "@/data/meserii-catalog.json";
import { JUDETE, MINIM_BRUT, MINIM_NET, netLunar, valideaza, type Eroare } from "@/lib/anunturi/reguli";
import Turnstile from "@/app/components/anunturi/Turnstile";

const MESERII = (catalog as { meserii: { slug: string; nume: string }[] }).meserii.slice().sort((a, b) => a.nume.localeCompare(b.nume, "ro"));
const SLUGURI = new Set(MESERII.map((m) => m.slug));
const JUDETE_SORTATE = Object.entries(JUDETE).sort((a, b) => a[1].localeCompare(b[1], "ro"));

export type Valori = Record<string, string | boolean>;
const GOL: Valori = { titlu: "", meserie: "", angajator: "", cui: "", judet: "", oras: "", norma: "intreaga", orePeZi: "4", salariuMin: "", salariuMax: "",
  baza: "", descriere: "", telefon: "", emailContact: "", email: "", acordPublicare: false };

const CAMP = "mt-1 block w-full rounded-md border border-stone-300 bg-surface px-3 py-2 text-base text-stone-900 focus:border-stone-600 focus:outline-none";
const ETICHETA = "block text-sm font-medium text-stone-800";
const NOTA = "mt-1 text-xs text-stone-600";

export default function FormularAnunt({ initial, modificare = false, trimite }: {
  initial?: Valori; modificare?: boolean;
  trimite: (v: Valori & { turnstile: string }) => Promise<{ erori?: Eroare[] } | void>;
}) {
  const [v, setV] = useState<Valori>({ ...GOL, ...initial });
  const [erori, setErori] = useState<Eroare[]>([]);
  const [trimis, setTrimis] = useState(false);
  const [token, setToken] = useState("");
  const onToken = useCallback((t: string) => setToken(t), []);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((x) => ({ ...x, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));
  const eroare = (camp: string) => erori.find((e) => e.camp === camp)?.mesaj;

  const net = useMemo(() => {
    const s = Number(v.salariuMin);
    return v.baza === "brut" && s >= 1000 ? netLunar(s, "brut") : null;
  }, [v.salariuMin, v.baza]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = valideaza({ ...v, email: modificare ? "modificare@salariile.ro" : v.email, acordPublicare: modificare || v.acordPublicare }, SLUGURI);
    if ("erori" in r) { setErori(r.erori); return; }
    setTrimis(true);
    const rez = await trimite({ ...v, turnstile: token }).catch(() => ({ erori: [{ camp: "general", mesaj: "Nu s-a putut trimite. Verifică internetul și încearcă din nou." }] as Eroare[] }));
    setTrimis(false);
    setErori(rez?.erori ?? []);
  }

  const Camp = ({ k, eticheta, nota, ...rest }: { k: string; eticheta: string; nota?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className={ETICHETA}>{eticheta}
      <input name={k} value={String(v[k] ?? "")} onChange={set(k)} className={CAMP} aria-invalid={!!eroare(k)} {...rest} />
      {nota && <span className={NOTA}>{nota}</span>}
      {eroare(k) && <span className="mt-1 block text-sm text-red-700">{eroare(k)}</span>}
    </label>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {eroare("general") && <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{eroare("general")}</p>}
      <fieldset className="grid gap-4">
        <legend className="text-base font-bold text-stone-900">Postul</legend>
        {Camp({ k: "titlu", eticheta: "Titlul anunțului", placeholder: "Șofer de distribuție, categoria B", maxLength: 90 })}
        <label className={ETICHETA}>Meseria
          <select value={String(v.meserie)} onChange={set("meserie")} className={CAMP}>
            <option value="">Altă meserie</option>
            {MESERII.map((m) => <option key={m.slug} value={m.slug}>{m.nume}</option>)}
          </select>
          <span className={NOTA}>Cu meseria aleasă, anunțul apare și pe pagina ei de salariu.</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={ETICHETA}>Județul
            <select value={String(v.judet)} onChange={set("judet")} className={CAMP} aria-invalid={!!eroare("judet")}>
              <option value="">Alege</option>
              {JUDETE_SORTATE.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
            {eroare("judet") && <span className="mt-1 block text-sm text-red-700">{eroare("judet")}</span>}
          </label>
          {Camp({ k: "oras", eticheta: "Localitatea", placeholder: "Cluj-Napoca" })}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={ETICHETA}>Programul
            <select value={String(v.norma)} onChange={set("norma")} className={CAMP}>
              <option value="intreaga">Normă întreagă</option>
              <option value="partiala">Normă parțială</option>
            </select>
          </label>
          {v.norma === "partiala" && Camp({ k: "orePeZi", eticheta: "Ore pe zi", type: "number", min: 1, max: 7, inputMode: "numeric" })}
        </div>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="text-base font-bold text-stone-900">Salariul lunar</legend>
        <div className="flex flex-wrap gap-4 text-base" role="radiogroup" aria-label="Baza salariului">
          {(["brut", "net"] as const).map((b) => (
            <label key={b} className="flex items-center gap-2"><input type="radio" name="baza" value={b} checked={v.baza === b} onChange={set("baza")} />{b === "brut" ? "Brut" : "Net (în mână)"}</label>
          ))}
        </div>
        {eroare("baza") && <span className="text-sm text-red-700">{eroare("baza")}</span>}
        <div className="grid gap-4 sm:grid-cols-2">
          {Camp({ k: "salariuMin", eticheta: "De la (lei)", type: "number", inputMode: "numeric", min: 0, nota: `Minimul legal la normă întreagă: ${MINIM_BRUT.toLocaleString("ro-RO")} lei brut, adică ${MINIM_NET.toLocaleString("ro-RO")} lei net.` })}
          {Camp({ k: "salariuMax", eticheta: "Până la (lei, opțional)", type: "number", inputMode: "numeric", min: 0 })}
        </div>
        {net !== null && <p className="text-sm text-stone-700">Din {Number(v.salariuMin).toLocaleString("ro-RO")} lei brut, angajatul primește {net.toLocaleString("ro-RO")} lei net.</p>}
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="text-base font-bold text-stone-900">Descrierea</legend>
        <label className={ETICHETA}>Ce face, ce cereți, ce oferiți
          <textarea name="descriere" value={String(v.descriere)} onChange={set("descriere")} rows={9} maxLength={6000} className={CAMP} aria-invalid={!!eroare("descriere")} />
          <span className={NOTA}>Programul, experiența cerută, beneficiile. Fără cerințe de vârstă, sex sau stare civilă: legea le interzice.</span>
          {eroare("descriere") && <span className="mt-1 block text-sm text-red-700">{eroare("descriere")}</span>}
        </label>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="text-base font-bold text-stone-900">Angajatorul și contactul</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {Camp({ k: "angajator", eticheta: "Numele angajatorului", placeholder: "Firma SRL" })}
          {Camp({ k: "cui", eticheta: "CUI (opțional)", placeholder: "RO12345678", nota: "Apare în anunț, ca să poată fi găsită firma." })}
        </div>
        <p className="text-sm text-stone-700">Candidații te contactează direct. Dă cel puțin un contact, telefon sau email:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {Camp({ k: "telefon", eticheta: "Telefon", type: "tel", inputMode: "tel" })}
          {Camp({ k: "emailContact", eticheta: "Email pentru CV-uri", type: "email" })}
        </div>
      </fieldset>

      {!modificare && (
        <fieldset className="grid gap-4">
          <legend className="text-base font-bold text-stone-900">Emailul tău</legend>
          {Camp({ k: "email", eticheta: "Emailul tău", type: "email", nota: "Nu apare în anunț. Primești aici linkul cu care publici, modifici sau ștergi anunțul." })}
          <label className="flex items-start gap-2 text-sm text-stone-800">
            <input type="checkbox" checked={v.acordPublicare === true} onChange={set("acordPublicare")} className="mt-1" />
            <span>Sunt de acord ca datele de contact ale angajatorului să apară în anunț și accept <a href="/termeni#anunturi" className="underline underline-offset-2">regulile anunțurilor</a>. Datele se prelucrează ca în <a href="/politica-confidentialitate#anunturi" className="underline underline-offset-2">politica de confidențialitate</a>.</span>
          </label>
          {eroare("acordPublicare") && <span className="text-sm text-red-700">{eroare("acordPublicare")}</span>}
        </fieldset>
      )}

      <Turnstile onToken={onToken} />
      <div>
        <button type="submit" disabled={trimis} className="inline-flex min-h-11 items-center rounded-md bg-stone-900 px-5 font-semibold text-white hover:bg-stone-700 disabled:opacity-60">
          {trimis ? "Se trimite…" : modificare ? "Salvează modificările" : "Trimite anunțul"}
        </button>
      </div>
    </form>
  );
}
