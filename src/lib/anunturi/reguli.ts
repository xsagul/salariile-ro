// Regulile unui anunț de angajare postat pe salariile.ro (hubul de anunțuri, pornit de proprietar
// pe 28 septembrie 2026). Un singur proprietar: formularul din browser și Worker-ul care primește
// anunțul folosesc exact aceleași verificări. Deciziile proprietarului:
//   - fără cont: anunțul se publică pe loc (fără confirmare pe email, decis pe 29 septembrie 2026)
//     și se gestionează dintr-un link primit pe email;
//   - salariul e obligatoriu, cu baza (brut sau net) — diferența față de OLX și eJobs; orice sumă,
//     fără prag minim (decis pe 28 septembrie 2026: respingerile ar încetini pornirea);
//   - numele firmei e opțional, CUI-ul nu se cere deloc (tot 28 septembrie);
//   - candidatul contactează direct angajatorul; site-ul nu primește CV-uri;
//   - moderare automată (regulile de mai jos) și buton de raportare, cu scoatere rapidă (DSA).
// Fără importuri cu „@/”: fișierul intră și în bundle-ul Worker-ului.
import { calculStandard } from "../fiscal";

export const JUDETE: Record<string, string> = {
  AB: "Alba", AR: "Arad", AG: "Argeș", BC: "Bacău", BH: "Bihor", BN: "Bistrița-Năsăud", BT: "Botoșani", BV: "Brașov",
  BR: "Brăila", B: "București", BZ: "Buzău", CS: "Caraș-Severin", CL: "Călărași", CJ: "Cluj", CT: "Constanța",
  CV: "Covasna", DB: "Dâmbovița", DJ: "Dolj", GL: "Galați", GR: "Giurgiu", GJ: "Gorj", HR: "Harghita", HD: "Hunedoara",
  IL: "Ialomița", IS: "Iași", IF: "Ilfov", MM: "Maramureș", MH: "Mehedinți", MS: "Mureș", NT: "Neamț", OT: "Olt",
  PH: "Prahova", SM: "Satu Mare", SJ: "Sălaj", SB: "Sibiu", SV: "Suceava", TR: "Teleorman", TM: "Timiș", TL: "Tulcea",
  VS: "Vaslui", VL: "Vâlcea", VN: "Vrancea",
};

export const NORME = { intreaga: "Normă întreagă", partiala: "Normă parțială" } as const;
export type Norma = keyof typeof NORME;
export type Baza = "brut" | "net";

/** Cât stă un anunț publicat până expiră; se poate prelungi din linkul de gestionare. */
export const ZILE_VALABILITATE = 30;
/** Cât păstrăm emailul celui care a postat după ce anunțul a expirat sau a fost șters. */
export const ZILE_PASTRARE_EMAIL = 30;
/** Anunțuri noi pe zi de la același email sau de la aceeași adresă IP. */
export const LIMITA_PE_ZI = 5;

export const LIMITE = { titlu: [8, 90], angajator: [0, 120], oras: [2, 60], adresa: [0, 120], descriere: [80, 6000] } as const;

export type AnuntNou = {
  titlu: string;
  meserie: string;          // slug din catalog sau "" (altă meserie)
  angajator: string;        // opțional; fără el anunțul nu intră în Google Jobs (JobPosting cere firma)
  judet: string;            // cod din JUDETE
  oras: string;
  adresa?: string;          // strada și numărul: harta și sortarea după apropiere (opțională)
  norma: Norma;
  orePeZi?: number;         // la normă parțială
  salariuMin: number;
  salariuMax?: number | null;
  baza: Baza;
  descriere: string;
  telefon: string;          // contactul: butonul de apel și, la mobil, cel de WhatsApp
  email: string;            // al celui care postează: primește linkul de confirmare; nu se publică
  acordPublicare: boolean;  // datele de contact ale angajatorului se publică în anunț
};

export type Eroare = { camp: keyof AnuntNou | "general"; mesaj: string };

const text = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
const textLung = (v: unknown) => (typeof v === "string" ? v.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim() : "");
// \p{M} (semnele diacritice), nu intervalul lor scris cu caracterele combinate: în Worker,
// intervalul nu prindea nimic și „București” devenea „bucure-ti” (proba locală, 28 septembrie 2026).
export const faraDiacritice = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Anunțuri pe care nu le publicăm, cu motivul arătat celui care postează (Codul muncii art. 5 și
// OG 137/2000 — discriminarea; munca „în străinătate” cere agent de plasare autorizat, Legea
// 156/2000; taxele cerute candidatului sunt interzise tot de Legea 156/2000).
const REGULI_CONTINUT: { re: RegExp; motiv: string }[] = [
  { re: /\b(doar|numai|exclusiv)\s+(barbati|femei|fete|baieti|domni|doamne)\b/, motiv: "Anunțul nu poate cere un anumit sex (Codul muncii, art. 5)." },
  { re: /\bvarst[ae]\s+(maxim[aă]?|intre|de\s+pana|sub)\b|\bpana\s+(in|la)\s+\d{2}\s+(de\s+)?ani\b|\bsub\s+\d{2}\s+(de\s+)?ani\b/, motiv: "Anunțul nu poate pune o limită de vârstă (Codul muncii, art. 5)." },
  { re: /\bfara\s+copii\b|\bnecasatorit[aă]?\b|\baspect\s+fizic\s+placut\b|\bnationalitate\s+romana\b|\betnie\b/, motiv: "Anunțul conține o cerință discriminatorie (OG 137/2000)." },
  { re: /\b(taxa|tax[aă]|plata|avans)\s+(de\s+)?(inscriere|dosar|procesare|recrutare|plasare)\b/, motiv: "Nu se pot cere bani candidaților pentru angajare (Legea 156/2000)." },
  { re: /\b(crypto|criptomonede|bitcoin|forex|trading|investitie\s+initiala|castig\s+garantat|munca\s+de\s+acasa\s+\d+\s*(lei|euro)\s+pe\s+zi)\b/, motiv: "Anunțul arată ca o schemă de câștig, nu ca un loc de muncă." },
  { re: /\b(in\s+strainatate|germania|anglia|marea\s+britanie|olanda|belgia|franta|italia|spania|danemarca|norvegia|austria)\b.*\b(munca|lucru|job|post)\b|\b(munca|lucru|job|post)\b.*\b(in\s+strainatate)\b/, motiv: "Deocamdată publicăm numai locuri de muncă în România." },
  { re: /\b(videochat|video\s*chat|webcam|escort|masaj\s+erotic|dame\s+de\s+companie)\b/, motiv: "Nu publicăm acest tip de anunț." },
];

export function verificaContinut(titlu: string, descriere: string): string | null {
  const t = faraDiacritice(`${titlu}\n${descriere}`);
  for (const r of REGULI_CONTINUT) if (r.re.test(t)) return r.motiv;
  // Majuscule peste tot sau semne repetate: spam, nu anunț.
  const litere = titlu.replace(/[^A-Za-zĂÂÎȘȚăâîșț]/g, "");
  if (litere.length > 12 && litere === litere.toUpperCase()) return "Scrie titlul cu litere mici, nu doar cu majuscule.";
  if (/(.)\1{5,}/.test(t) || /[!?]{3,}/.test(t)) return "Anunțul are caractere repetate; scrie-l simplu.";
  const linkuri = (descriere.match(/https?:\/\//g) ?? []).length;
  if (linkuri > 2) return "Descrierea poate avea cel mult două linkuri.";
  return null;
}

/** „0722 123 456”, „+40722123456” → „0722123456”, sau null dacă nu e un număr românesc. */
export function telefonCurat(t: string): string | null {
  const c = t.replace(/[\s.\-()/]/g, "").replace(/^(\+40|0040)/, "0");
  return /^0[237]\d{8}$/.test(c) ? c : null;
}
/** Contactul, decis de proprietar pe 28 septembrie 2026: un buton care sună și unul de WhatsApp. */
export const esteMobil = (t: string) => /^07\d{8}$/.test(t);
export const linkApel = (t: string) => `tel:+4${t}`;
export const linkWhatsApp = (t: string, titlu: string) => `https://wa.me/4${t}?text=${encodeURIComponent(`Bună ziua, vă scriu pentru anunțul „${titlu}” de pe salariile.ro.`)}`;
/** „0722 123 456”, ca să se citească ușor pe buton. */
export const telefonAfisat = (t: string) => (t.startsWith("07") ? `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : `${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6)}`);
const emailValid = (e: string) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(e);

/**
 * Curăță și verifică anunțul. `meseriiValide`: sluguri din catalog (src/data/meserii-catalog.json).
 * Întoarce anunțul curățat sau lista erorilor, câmp cu câmp.
 */
export function valideaza(brut: Record<string, unknown>, meseriiValide: Set<string>): { anunt: AnuntNou } | { erori: Eroare[] } {
  const e: Eroare[] = [];
  const a: AnuntNou = {
    titlu: text(brut.titlu),
    meserie: text(brut.meserie),
    angajator: text(brut.angajator),
    judet: text(brut.judet).toUpperCase(),
    oras: text(brut.oras),
    adresa: text(brut.adresa) || undefined,
    norma: brut.norma === "partiala" ? "partiala" : "intreaga",
    orePeZi: brut.norma === "partiala" ? Number(brut.orePeZi) : undefined,
    salariuMin: Math.round(Number(brut.salariuMin)),
    salariuMax: brut.salariuMax === "" || brut.salariuMax == null ? null : Math.round(Number(brut.salariuMax)),
    baza: brut.baza === "net" ? "net" : brut.baza === "brut" ? "brut" : ("" as Baza),
    descriere: textLung(brut.descriere),
    telefon: telefonCurat(text(brut.telefon)) ?? text(brut.telefon),
    email: text(brut.email).toLowerCase(),
    acordPublicare: brut.acordPublicare === true || brut.acordPublicare === "true" || brut.acordPublicare === "on",
  };
  const lung = (camp: keyof typeof LIMITE, v: string, nume: string) => {
    const [min, max] = LIMITE[camp];
    if (v.length < min) e.push({ camp, mesaj: `${nume}: cel puțin ${min} caractere.` });
    if (v.length > max) e.push({ camp, mesaj: `${nume}: cel mult ${max} caractere.` });
  };
  lung("titlu", a.titlu, "Titlul");
  lung("angajator", a.angajator, "Numele firmei");
  if (!a.oras || !Object.hasOwn(JUDETE, a.judet)) e.push({ camp: "oras", mesaj: "Alege localitatea din listă." });
  else lung("oras", a.oras, "Localitatea");
  if (a.adresa) lung("adresa", a.adresa, "Adresa");
  lung("descriere", a.descriere, "Descrierea");
  if (a.meserie && !meseriiValide.has(a.meserie)) e.push({ camp: "meserie", mesaj: "Alege meseria din listă sau „Altă meserie”." });
  if (a.norma === "partiala" && !(a.orePeZi! >= 1 && a.orePeZi! <= 7)) e.push({ camp: "orePeZi", mesaj: "La normă parțială, scrie câte ore pe zi (1–7)." });

  // Salariul: obligatoriu, cu baza; orice sumă (fără prag minim, proprietar, 28 septembrie 2026).
  // Rămân numai greșelile evidente: zero, un maxim sub minim, o sumă cu cifre în plus.
  if (a.baza !== "brut" && a.baza !== "net") e.push({ camp: "baza", mesaj: "Spune dacă suma e brută sau netă." });
  if (!Number.isFinite(a.salariuMin) || a.salariuMin <= 0) e.push({ camp: "salariuMin", mesaj: "Scrie salariul lunar oferit, în lei." });
  else if (a.salariuMin > 200000) e.push({ camp: "salariuMin", mesaj: "Suma pare greșită; scrie salariul lunar, în lei." });
  if (a.salariuMax != null) {
    if (!Number.isFinite(a.salariuMax) || a.salariuMax < a.salariuMin) e.push({ camp: "salariuMax", mesaj: "Maximul trebuie să fie cel puțin cât minimul." });
    else if (a.salariuMax > 200000) e.push({ camp: "salariuMax", mesaj: "Suma pare greșită; scrie salariul lunar, în lei." });
    else if (a.salariuMax === a.salariuMin) a.salariuMax = null;
  }

  // Contactul angajatorului: telefonul, publicat cu acordul celui care postează. Fără link de
  // aplicare, email pentru CV-uri sau CV prin site: pe OLX și anuntul.ro angajatorii dau un
  // telefon, iar candidatul sună sau scrie pe WhatsApp (proprietar, 28 septembrie 2026).
  if (!a.telefon) e.push({ camp: "telefon", mesaj: "Scrie telefonul la care te sună candidații." });
  else if (!telefonCurat(a.telefon)) e.push({ camp: "telefon", mesaj: "Telefonul nu pare un număr românesc valid." });
  if (!emailValid(a.email)) e.push({ camp: "email", mesaj: "Scrie emailul tău: acolo primești linkul de confirmare." });
  if (!a.acordPublicare) e.push({ camp: "acordPublicare", mesaj: "Bifează acordul: datele de contact ale angajatorului apar în anunț." });

  if (!e.length) {
    const motiv = verificaContinut(a.titlu, a.descriere);
    if (motiv) e.push({ camp: "general", mesaj: motiv });
  }
  return e.length ? { erori: e } : { anunt: a };
}

const slug = (s: string) => faraDiacritice(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Structura URL-urilor, verificată în Google România pe 28 septembrie 2026 (SE Ranking):
 *   /locuri-de-munca, /locuri-de-munca/{meserie}, /locuri-de-munca/{oraș}, /locuri-de-munca/{oraș}/{meserie}
 *     — la căutările de joburi, top 3 sunt liste pe oraș și meserie (eJobs, OLX, iajob), orașul primul;
 *   /anunt-angajare-{titlu}-{oraș}-{id}
 *     — la „anunt de angajare” (480/lună), prima pagină e numai anunțuri cu `anunt-angajare-` în adresă;
 *   /adauga-anunt-angajare — „adaugă anunț” e formularea căutată; nicio pagină de publicare nu e în top.
 */
export const urlAnunt = (a: { id: number; slug: string }) => `/anunt-angajare-${a.slug}-${a.id}`;
export const urlLista = (oras?: string | null, meserie?: string | null) => `/locuri-de-munca${oras ? `/${oras}` : ""}${meserie ? `/${meserie}` : ""}`;
export const URL_ADAUGA = "/adauga-anunt-angajare";

/** Partea din URL a anunțului: „sofer-distributie-cluj-napoca” (fără „anunt angajare” repetat). */
export function slugAnunt(titlu: string, oras: string): string {
  const t = slug(titlu).replace(/^(anunt-)?(de-)?angaj(are|am|ez|eaza)-/, "");
  const o = orasSlug(oras);
  return (t.endsWith(o) ? t : `${t}-${o}`).slice(0, 80).replace(/-+$/, "");
}

/** Localitatea în URL: „Cluj-Napoca” → „cluj-napoca”, „București, sector 3” → „bucuresti”. */
export function orasSlug(oras: string): string {
  const s = slug(oras.replace(/,.*$/, "").replace(/\bsector(ul)?\s*\d\b/i, ""));
  return /^(municipiul-)?bucuresti/.test(s) ? "bucuresti" : s.replace(/^(municipiul|orasul|comuna)-/, "");
}

/** Salariul net lunar (pentru comparații și filtre), din brut cu calculul standard. */
export function netLunar(suma: number, baza: Baza): number {
  return baza === "net" ? suma : calculStandard(suma)?.net ?? suma;
}
