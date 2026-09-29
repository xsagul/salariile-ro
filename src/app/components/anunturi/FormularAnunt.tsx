"use client";

// Formularul unui anunț de angajare: publicare (fără cont) și modificare din linkul primit pe email.
// Aceleași reguli ca Worker-ul (src/lib/anunturi/reguli.ts), deci erorile apar înainte de trimitere.
// Meseria, localitatea și strada se caută scriind (proprietar, 28 septembrie 2026): localitățile din
// SIRUTA (INS), străzile din OpenStreetMap, ambele încărcate de pe site; căutarea rămâne în browser.
import { useCallback, useEffect, useMemo, useState } from "react";
import { MESERII_ANUNTURI } from "@/lib/anunturi/meserii";
import { EMAIL_ACTIV, TURNSTILE_SITEKEY } from "@/lib/anunturi/config";
import { faraDiacritice, netLunar, valideaza, type Eroare } from "@/lib/anunturi/reguli";
import { cauta, detaliuLocalitate, incarcaLocalitati, numarDinText, strazileLocalitatii, type Localitate } from "@/lib/anunturi/localitati";
import CautaInLista from "@/app/components/anunturi/CautaInLista";
import Turnstile, { reseteazaTurnstile } from "@/app/components/anunturi/Turnstile";

// Meseriile hubului, cu sinonimele: „ospătar” și „chelner” se găsesc amândouă (src/lib/anunturi/meserii.ts).
const MESERII = MESERII_ANUNTURI.slice().sort((a, b) => a.nume.localeCompare(b.nume, "ro"));
const SLUGURI = new Set(MESERII.map((m) => m.slug));
const numeMeserie = (slug: unknown) => MESERII.find((m) => m.slug === slug)?.nume ?? "";

export type Valori = Record<string, string | boolean>;
const GOL: Valori = { titlu: "", meserie: "", angajator: "", judet: "", oras: "", adresa: "", norma: "intreaga", orePeZi: "4", salariuMin: "", salariuMax: "",
  baza: "", descriere: "", telefon: "", email: "", acordPublicare: false };

const CAMP = "mt-1 block w-full rounded-md border border-stone-300 bg-surface px-3 py-2 text-base text-stone-900 focus:border-stone-600 focus:outline-none";
const ETICHETA = "block text-sm font-medium text-stone-800";
const NOTA = "mt-1 block text-xs text-stone-600";
const cheieLoc = (l: Localitate) => `${l[0]}|${l[1]}|${l[2]}`;

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

  // Meseria: se alege din listă; un nume scris întocmai se recunoaște și fără clic.
  const [meserieText, setMeserieText] = useState(numeMeserie(initial?.meserie));
  const optMeserii = useMemo(() => cauta(MESERII, meserieText, (m) => m.nume).map((m) => ({ cheie: m.slug, text: m.nume })), [meserieText]);
  const scrieMeserie = (s: string) => {
    setMeserieText(s);
    const exact = MESERII.find((m) => faraDiacritice(m.nume) === faraDiacritice(s.trim()));
    setV((x) => ({ ...x, meserie: exact?.slug ?? "" }));
  };

  // Localitatea: lista SIRUTA se încarcă la primul focus (~110 KB comprimat).
  const [localitati, setLocalitati] = useState<Localitate[] | null>(null);
  const [locText, setLocText] = useState(String(initial?.oras ?? ""));
  const [loc, setLoc] = useState<Localitate | null>(null);
  const incarca = useCallback(() => { if (!localitati) incarcaLocalitati().then(setLocalitati).catch(() => {}); }, [localitati]);
  const gasite = useMemo(() => (localitati ? cauta(localitati, locText, (l) => l[0], (l) => l[3]) : []), [localitati, locText]);
  const alegeLoc = (l: Localitate) => { setLoc(l); setLocText(l[0]); setV((x) => ({ ...x, oras: l[0], judet: l[1] })); };
  const scrieLoc = (s: string) => {
    setLocText(s);
    // Un nume scris întocmai și purtat de o singură localitate se alege singur.
    const exacte = (localitati ?? []).filter((l) => faraDiacritice(l[0]) === faraDiacritice(s.trim()));
    if (exacte.length === 1) alegeLoc(exacte[0]);
    else { setLoc(null); setV((x) => ({ ...x, oras: "", judet: "" })); }
  };
  // La modificare, localitatea salvată se regăsește în listă, ca să vină și străzile ei.
  useEffect(() => {
    if (!initial?.oras) return;
    incarcaLocalitati().then((toate) => {
      setLocalitati(toate);
      const l = toate.find((x: Localitate) => x[0] === initial.oras && x[1] === initial.judet);
      if (l) setLoc(l);
    }).catch(() => {});
  }, [initial?.oras, initial?.judet]);

  // Strada: sugestii din străzile localității alese; se poate scrie și de mână.
  // Lista ține minte localitatea ei: la schimbare, străzile vechi dispar fără setState în efect.
  const [straziLoc, setStraziLoc] = useState<{ loc: Localitate; lista: string[] } | null>(null);
  useEffect(() => { if (loc) strazileLocalitatii(loc).then((lista) => setStraziLoc({ loc, lista })); }, [loc]);
  const strazi = useMemo(() => (straziLoc && straziLoc.loc === loc ? straziLoc.lista : []), [straziLoc, loc]);
  const optStrazi = useMemo(() => cauta(strazi, String(v.adresa), (s) => s).map((s) => ({ cheie: s, text: s })), [strazi, v.adresa]);

  const net = useMemo(() => {
    const s = Number(v.salariuMin);
    return v.baza === "brut" && s >= 1000 ? netLunar(s, "brut") : null;
  }, [v.salariuMin, v.baza]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = valideaza({ ...v, email: modificare ? "modificare@salariile.ro" : v.email, acordPublicare: modificare || v.acordPublicare }, SLUGURI);
    if ("erori" in r) { setErori(r.erori); return; }
    // Verificarea anti-spam durează câteva secunde după deschiderea paginii.
    if (!modificare && TURNSTILE_SITEKEY && !token) {
      setErori([{ camp: "general", mesaj: "Verificarea anti-spam se termină în câteva secunde. Apasă din nou „Trimite anunțul”." }]);
      return;
    }
    setTrimis(true);
    const rez = await trimite({ ...v, turnstile: token }).catch(() => ({ erori: [{ camp: "general", mesaj: "Nu s-a putut trimite. Verifică internetul și încearcă din nou." }] as Eroare[] }));
    setTrimis(false);
    setErori(rez?.erori ?? []);
    if (rez?.erori?.length) { setToken(""); reseteazaTurnstile(); }
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
        <CautaInLista eticheta="Meseria (opțional)" valoare={meserieText} onText={scrieMeserie} optiuni={optMeserii}
          onAlege={(o) => { setMeserieText(o.text); setV((x) => ({ ...x, meserie: o.cheie })); }}
          placeholder="Scrie: barman, șofer, vânzător…" eroare={eroare("meserie")}
          nota="Cu meseria aleasă, anunțul apare și în lista meseriei." />
        <CautaInLista eticheta="Localitatea" valoare={locText} onText={scrieLoc} onFocus={incarca}
          optiuni={gasite.map((l) => ({ cheie: cheieLoc(l), text: l[0], detaliu: detaliuLocalitate(l) }))}
          onAlege={(o) => { const l = gasite.find((x) => cheieLoc(x) === o.cheie); if (l) alegeLoc(l); }}
          placeholder="Scrie: București, Cluj-Napoca, un sat…" eroare={eroare("oras")}
          gol={localitati ? "Nicio localitate cu acest nume. Verifică scrierea." : "Se încarcă lista localităților…"} />
        <CautaInLista eticheta="Strada și numărul (opțional)" valoare={String(v.adresa)} maxLength={120}
          onText={(s) => setV((x) => ({ ...x, adresa: s }))} optiuni={optStrazi}
          onAlege={(o) => setV((x) => { const nr = numarDinText(String(x.adresa)); return { ...x, adresa: nr ? `${o.text} ${nr}` : `${o.text} ` }; })}
          placeholder="Strada Lipscani 69" eroare={eroare("adresa")}
          nota={<>Cu adresa, anunțul apare pe hartă și primul pentru cei care caută aproape de ei. Străzile: © <a href="https://www.openstreetmap.org/copyright" className="underline underline-offset-2">OpenStreetMap</a>.</>} />
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
          {Camp({ k: "salariuMin", eticheta: "De la (lei)", type: "number", inputMode: "numeric", min: 0 })}
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
        {Camp({ k: "angajator", eticheta: "Numele firmei (opțional)", placeholder: "Firma SRL" })}
        {Camp({ k: "telefon", eticheta: "Telefonul la care te sună candidații", type: "tel", inputMode: "tel", placeholder: "0722 123 456", nota: "În anunț apare un buton care sună direct și, la un număr de mobil, unul de WhatsApp." })}
      </fieldset>

      {!modificare && (
        <fieldset className="grid gap-4">
          <legend className="text-base font-bold text-stone-900">{EMAIL_ACTIV ? "Emailul tău" : "Acordul tău"}</legend>
          {EMAIL_ACTIV && Camp({ k: "email", eticheta: "Emailul tău", type: "email", nota: "Nu apare în anunț. Primești aici linkul cu care modifici sau ștergi anunțul." })}
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
