// Accesul la baza D1 a anunțurilor. Schema: migrations/0001_anunturi.sql.
import type { Env } from "./index";
import type { Loc } from "./geocod";
import { anuntaGoogle } from "./google";
import { LIMITA_PE_ZI, ZILE_PASTRARE_EMAIL, ZILE_VALABILITATE, faraDiacritice, netLunar, orasSlug, slugAnunt, urlAnunt, type AnuntNou, type Contract, type LocMunca, type Norma } from "../src/lib/anunturi/reguli";
import { MESERII_ANUNTURI, formaTitlu, ghicesteMeserie, grupMeserie, meseriileDomeniului, pentruPotrivire, slugurileGrupului, variante } from "../src/lib/anunturi/meserii";

export type Anunt = {
  id: number; stare: "neconfirmat" | "activ" | "expirat" | "sters" | "suspendat";
  titlu: string; slug: string; meserie: string | null; angajator: string;
  judet: string; oras: string; oras_slug: string; adresa: string | null; lat: number | null; lon: number | null; loc_precizie: "adresa" | "oras" | null; norma: "intreaga" | "partiala"; ore_pe_zi: number | null;
  fara_experienta: number; contract: Contract | null; loc_munca: LocMunca | null;
  salariu_min: number; salariu_max: number | null; baza: "brut" | "net"; net_min: number;
  descriere: string; telefon: string | null;
  email: string | null; creat_la: string; confirmat_la: string | null; expira_la: string | null;
};

const acum = () => new Date().toISOString();
const peste = (zile: number) => new Date(Date.now() + zile * 86400000).toISOString();

export async function sha256(text: string): Promise<string> {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/** Linkul de gestionare: 32 de octeți aleatori; în bază rămâne doar hash-ul lui. */
export function tokenNou(): string {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Numără și înregistrează o postare; `false` când emailul sau IP-ul a trecut de limita pe zi. */
export async function inLimita(env: Env, email: string, ip: string): Promise<boolean> {
  // Fără email (EMAIL_ACTIV oprit) rămâne numai limita pe IP.
  const chei = [...(email ? [`email:${await sha256(env.SARE + email)}`] : []), `ip:${await sha256(env.SARE + ip)}`];
  const ieri = new Date(Date.now() - 86400000).toISOString();
  for (const c of chei) {
    const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM limite WHERE cheie = ? AND la > ?").bind(c, ieri).first<{ n: number }>();
    if ((r?.n ?? 0) >= LIMITA_PE_ZI) return false;
  }
  await env.DB.batch(chei.map((c) => env.DB.prepare("INSERT INTO limite (cheie, la) VALUES (?, ?)").bind(c, acum())));
  return true;
}

/**
 * Anunțul se publică pe loc, fără confirmarea din email (proprietar, 29 septembrie 2026: la pornire,
 * orice pas în plus scade numărul de anunțuri). Emailul rămâne obligatoriu pentru linkul de
 * gestionare; frâna rămâne limita pe zi, regulile de conținut și raportările (Turnstile scos pe
 * 29 septembrie 2026: oamenii nu reușeau să posteze).
 */
export async function adauga(env: Env, a: AnuntNou, loc: Loc | null, token: string): Promise<{ id: number; slug: string }> {
  const t = acum();
  const r = await env.DB.prepare(
    `INSERT INTO anunturi (stare, titlu, slug, meserie, angajator, judet, oras, oras_slug, adresa, lat, lon, loc_precizie, norma, ore_pe_zi,
      fara_experienta, contract, loc_munca, salariu_min, salariu_max, baza, net_min, descriere, telefon, email, token_hash, creat_la, confirmat_la, expira_la)
     VALUES ('activ', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id, slug`,
  ).bind(a.titlu, slugAnunt(a.titlu, a.oras), a.meserie || ghicesteMeserie(a.titlu), a.angajator, a.judet, a.oras, orasSlug(a.oras),
    a.adresa ?? null, loc?.lat ?? null, loc?.lon ?? null, loc?.precizie ?? null, a.norma, a.orePeZi ?? null,
    a.faraExperienta ? 1 : 0, a.contract ?? null, a.locMunca ?? null,
    a.salariuMin, a.salariuMax ?? null, a.baza, netLunar(a.salariuMin, a.baza), a.descriere, a.telefon, a.email || null, await sha256(token),
    t, t, peste(ZILE_VALABILITATE)).first<{ id: number; slug: string }>();
  return r!;
}

export async function dupaToken(env: Env, token: string): Promise<Anunt | null> {
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return null;
  return env.DB.prepare("SELECT * FROM anunturi WHERE token_hash = ? AND stare != 'sters'").bind(await sha256(token)).first<Anunt>();
}

export async function dupaId(env: Env, id: number): Promise<Anunt | null> {
  return env.DB.prepare("SELECT * FROM anunturi WHERE id = ?").bind(id).first<Anunt>();
}

export async function prelungeste(env: Env, id: number): Promise<void> {
  await env.DB.prepare("UPDATE anunturi SET stare = 'activ', expira_la = ? WHERE id = ? AND stare IN ('activ', 'expirat')").bind(peste(ZILE_VALABILITATE), id).run();
}

export async function modifica(env: Env, id: number, a: AnuntNou, loc: Loc | null): Promise<void> {
  await env.DB.prepare(
    `UPDATE anunturi SET titlu = ?, slug = ?, meserie = ?, angajator = ?, judet = ?, oras = ?, oras_slug = ?, adresa = ?, lat = ?, lon = ?, loc_precizie = ?,
      norma = ?, ore_pe_zi = ?, fara_experienta = ?, contract = ?, loc_munca = ?, salariu_min = ?, salariu_max = ?, baza = ?, net_min = ?, descriere = ?, telefon = ? WHERE id = ? AND stare IN ('neconfirmat', 'activ', 'expirat')`,
  ).bind(a.titlu, slugAnunt(a.titlu, a.oras), a.meserie || ghicesteMeserie(a.titlu), a.angajator, a.judet, a.oras, orasSlug(a.oras),
    a.adresa ?? null, loc?.lat ?? null, loc?.lon ?? null, loc?.precizie ?? null, a.norma, a.orePeZi ?? null,
    a.faraExperienta ? 1 : 0, a.contract ?? null, a.locMunca ?? null, a.salariuMin,
    a.salariuMax ?? null, a.baza, netLunar(a.salariuMin, a.baza), a.descriere, a.telefon, id).run();
}

/** Ștergerea cerută de cel care a postat: anunțul dispare imediat, datele de contact la fel. */
export async function sterge(env: Env, id: number): Promise<void> {
  await env.DB.prepare("UPDATE anunturi SET stare = 'sters', sters_la = ?, telefon = NULL, adresa = NULL WHERE id = ?").bind(acum(), id).run();
}

export const PE_PAGINA = 20;

/**
 * Filtrele unei liste: meseria și localitatea vin din adresă; norma, domeniul și căutarea liberă din
 * interogare (proprietar, 29 septembrie 2026).
 */
export type Filtru = { meserie?: string; oras?: string; norma?: Norma; domeniu?: string; q?: string; faraExperienta?: boolean; contract?: Contract; locMunca?: LocMunca };

/**
 * Toate anunțurile active, citite din D1 cel mult o dată pe minut pe fiecare instanță a Worker-ului,
 * nu la fiecare listă. Până pe 30 septembrie 2026 o listă făcea 9 interogări, fiecare prin toate
 * anunțurile (~7.000 de rânduri la 790 de anunțuri); ClaudeBot a trecut prin combinațiile filtrelor
 * și D1 a depășit limita gratuită de 5 milioane de rânduri citite pe zi. Acum filtrele, ordinea și
 * numerele din coloană se calculează aici, pe lista din memorie. Un anunț nou apare în liste în cel
 * mult un minut, cât țineau oricum listele în cache; pagina lui (dupaId) se citește direct.
 */
type AnuntActiv = Anunt & { titluPotrivire: string; textCautare: string };
const MEMORIE_MS = 60_000;
let memorie: { la: number; anunturi: Promise<AnuntActiv[]> } | null = null;
function active(env: Env): Promise<AnuntActiv[]> {
  if (memorie && Date.now() - memorie.la < MEMORIE_MS) return memorie.anunturi;
  const anunturi = env.DB.prepare("SELECT * FROM anunturi WHERE stare = 'activ' ORDER BY confirmat_la DESC").all<Anunt>().then((r) =>
    r.results.map((a) => ({
      ...a,
      // Titlul cu spații la capete, fără diacritice și semne, ca „Barista/barman” să aibă cuvântul „barman”.
      titluPotrivire: ` ${formaTitlu(a.titlu)} `,
      // Textul în care caută bara, ca pe OLX: titlul, firma, localitatea și descrierea.
      textCautare: faraDiacritice(`${a.titlu} ${a.angajator} ${a.oras} ${a.descriere}`),
    })));
  const intrare = { la: Date.now(), anunturi };
  memorie = intrare;
  // O citire eșuată (limita D1, de exemplu) nu rămâne în memorie un minut întreg.
  anunturi.catch(() => { if (memorie === intrare) memorie = null; });
  return anunturi;
}

/** Formele din titlu ale grupului unei meserii: „barman”, „barmanita”. */
const formeGrup = (slug: string) => MESERII_ANUNTURI.filter((m) => m.grup === grupMeserie(slug)).map((m) => formaTitlu(m.nume));
/** Cum apare o formă în titlu: întreagă la numele scurte („bona” nu e „bonus”), ca început de cuvânt la celelalte („barmanii”). */
const inTitlu = (forma: string) => (forma.length <= 4 ? ` ${forma} ` : ` ${forma}`);
const GRUPURI_TITLU = [...new Set(MESERII_ANUNTURI.map((m) => m.grup))].map((g) => ({ g, sluguri: new Set(slugurileGrupului(g)), forme: formeGrup(g).map(inTitlu) }));

/** Cuvinte care nu spun nimic despre job: „locuri de muncă barman” caută „barman”. */
const CUVINTE_GOALE = new Set(["loc", "locuri", "munca", "job", "joburi", "angajare", "angajam", "angajez", "angajeaza", "caut", "anunt", "anunturi", "post", "posturi"]);
export const cuvinteCautate = (q: string) => pentruPotrivire(q).trim().split(" ").filter((w) => w.length >= 2 && !CUVINTE_GOALE.has(w)).slice(0, 6);
/** Meseriile din grupurile în care un nume începe cu `w`: „chelner” aduce și anunțurile de ospătar. */
function sinonime(w: string): string[] {
  const grupuri = new Set(MESERII_ANUNTURI.filter((m) => pentruPotrivire(m.nume).includes(` ${w}`)).map((m) => m.grup));
  return MESERII_ANUNTURI.filter((m) => grupuri.has(m.grup)).map((m) => m.slug);
}

type Dimensiune = "meserie" | "oras" | "norma" | "domeniu" | "contract" | "locMunca";
/** Condiția filtrului. Meseria aduce tot grupul ei: la „chelner” apar și anunțurile de „ospătar”.
 *  `fara` lasă deoparte o dimensiune: numărul de lângă o opțiune ține cont de celelalte filtre, nu de al ei. */
function potrivit(f: Filtru, fara?: Dimensiune): (a: AnuntActiv) => boolean {
  const conditii: ((a: AnuntActiv) => boolean)[] = [];
  if (f.meserie && fara !== "meserie") {
    // Meseria cumulează (proprietar, 29 septembrie 2026: „să creștem poolul de găsite, nu să-l scădem”):
    // anunțurile puse la meseria grupului și cele care o au în titlu, ca „Ajutor barman…” la Barman.
    const sluguri = new Set(slugurileGrupului(f.meserie)), forme = formeGrup(f.meserie).map(inTitlu);
    conditii.push((a) => (a.meserie !== null && sluguri.has(a.meserie)) || forme.some((x) => a.titluPotrivire.includes(x)));
  }
  if (f.oras && fara !== "oras") { const o = f.oras; conditii.push((a) => a.oras_slug === o); }
  if (f.norma && fara !== "norma") { const n = f.norma; conditii.push((a) => a.norma === n); }
  if (f.domeniu && fara !== "domeniu") { const m = new Set(meseriileDomeniului(f.domeniu)); conditii.push((a) => a.meserie !== null && m.has(a.meserie)); }
  if (f.faraExperienta) conditii.push((a) => a.fara_experienta === 1);
  if (f.contract && fara !== "contract") { const c = f.contract; conditii.push((a) => a.contract === c); }
  if (f.locMunca && fara !== "locMunca") { const l = f.locMunca; conditii.push((a) => a.loc_munca === l); }
  // Fiecare cuvânt căutat, într-una din formele lui, trebuie să apară în text sau să fie numele
  // meseriei anunțului (de la 4 litere, ca „bar” să nu aducă și frizerii de la „barber”).
  for (const w of f.q ? cuvinteCautate(f.q) : []) {
    const forme = variante(w), sin = new Set(forme.filter((x) => x.length >= 4).flatMap(sinonime));
    conditii.push((a) => forme.some((x) => a.textCautare.includes(x)) || (a.meserie !== null && sin.has(a.meserie)));
  }
  return (a) => conditii.every((c) => c(a));
}

export async function lista(env: Env, f: Filtru & { pagina: number; ordine?: "salariu" }): Promise<{ anunturi: Anunt[]; total: number }> {
  // Din memorie vin deja de la cel mai nou; sortarea e stabilă, deci la salarii egale rămâne ordinea asta.
  const gasite = (await active(env)).filter(potrivit(f));
  const ordonate = f.ordine === "salariu" ? [...gasite].sort((a, b) => b.net_min - a.net_min) : gasite;
  return { total: gasite.length, anunturi: ordonate.slice((f.pagina - 1) * PE_PAGINA, f.pagina * PE_PAGINA) };
}

export type Numarare = { s: string; n: string; c: number };
const DOMENIUL = new Map(MESERII_ANUNTURI.map((m) => [m.slug, m.domeniu]));

/**
 * Numerele din coloana de filtre. Localitățile sunt toate cele cu anunțuri active (căutarea nu
 * trebuie să ducă la o pagină 404), cu numărul potrivit celorlalte filtre; meseriile și normele,
 * numai cele care au anunțuri.
 */
export async function fatete(env: Env, f: Filtru): Promise<{
  orase: Numarare[]; meserii: { s: string; c: number }[]; norme: { s: Norma; c: number }[]; domenii: { s: string; c: number }[];
  contracte: { s: Contract; c: number }[]; locuri: { s: LocMunca; c: number }[]; faraExperienta: number;
}> {
  // Meseria și domeniul înlocuiesc căutarea liberă (în bară și în coloană), deci se numără fără ea;
  // localitatea și norma o rafinează, deci se numără cu ea.
  const faraText = { ...f, q: undefined };
  const po = potrivit(f, "oras"), pm = potrivit(faraText, "meserie"), pn = potrivit(f, "norma"), pd = potrivit(faraText, "domeniu");
  const pc = potrivit(f, "contract"), pl = potrivit(f, "locMunca"), pe = potrivit({ ...f, faraExperienta: false });
  const orase = new Map<string, Numarare>(), peGrup = new Map<string, number>(), norme = new Map<Norma, number>();
  const peDomeniu = new Map<string, number>(), contracte = new Map<Contract, number>(), locuri = new Map<LocMunca, number>();
  const plus = <K>(m: Map<K, number>, k: K) => m.set(k, (m.get(k) ?? 0) + 1);
  let faraExperienta = 0;
  for (const a of await active(env)) {
    // Numele localității: cel mai mic alfabetic dintre formele ei, ca MIN(oras) din SQL-ul de dinainte.
    const o = orase.get(a.oras_slug) ?? { s: a.oras_slug, n: a.oras, c: 0 };
    if (a.oras < o.n) o.n = a.oras;
    if (po(a)) o.c++;
    orase.set(a.oras_slug, o);
    // Numerele meseriilor, cumulate ca filtrul: meseria anunțului sau numele ei în titlu. Un anunț
    // „Ajutor barman” se numără și la Barman, și la Ajutor barman.
    if (pm(a)) for (const x of GRUPURI_TITLU) if ((a.meserie && x.sluguri.has(a.meserie)) || x.forme.some((fm) => a.titluPotrivire.includes(fm))) plus(peGrup, x.g);
    if (pn(a)) plus(norme, a.norma);
    if (pd(a) && a.meserie) { const dom = DOMENIUL.get(a.meserie); if (dom) plus(peDomeniu, dom); }
    if (pc(a) && a.contract) plus(contracte, a.contract);
    if (pl(a) && a.loc_munca) plus(locuri, a.loc_munca);
    if (pe(a) && a.fara_experienta === 1) faraExperienta++;
  }
  const perechi = <K>(m: Map<K, number>) => [...m].map(([s, c]) => ({ s, c }));
  return {
    orase: [...orase.values()].sort((x, y) => (x.n < y.n ? -1 : x.n > y.n ? 1 : 0)),
    meserii: perechi(peGrup), norme: perechi(norme), domenii: perechi(peDomeniu),
    contracte: perechi(contracte), locuri: perechi(locuri), faraExperienta,
  };
}

/**
 * Toate anunțurile unei liste, fără paginare și numai cu ce trebuie ca să le ordoneze telefonul
 * după distanță. Poziția vizitatorului nu pleacă niciodată din browser: el cere lista, nu trimite
 * unde e (/api/anunturi/lista).
 */
export async function listaPentruApropiere(env: Env, f: Filtru): Promise<Anunt[]> {
  return (await active(env)).filter(potrivit(f)).slice(0, 500);
}

/** Numele localității cum îl scriu anunțurile („Cluj-Napoca”), pentru titlul paginii ei: forma cea mai des folosită. */
export async function numeOras(env: Env, slug: string): Promise<string | null> {
  const forme = new Map<string, number>();
  for (const a of await active(env)) if (a.oras_slug === slug) forme.set(a.oras, (forme.get(a.oras) ?? 0) + 1);
  const cea = [...forme].sort((x, y) => y[1] - x[1])[0]?.[0];
  return cea?.replace(/,.*$/, "").trim() ?? null;
}

/**
 * Paginile de listă cu anunțuri destule ca să intre în Google (sitemap). La meserii se numără
 * grupul, iar un grup peste prag intră cu toate formulările lui: „ospătar” și „chelner”.
 */
export async function listeIndexabile(env: Env, prag: number): Promise<{ oras: string | null; meserie: string | null }[]> {
  const [o, om] = await env.DB.batch([
    env.DB.prepare("SELECT oras_slug FROM anunturi WHERE stare = 'activ' GROUP BY oras_slug HAVING COUNT(*) >= ?").bind(prag),
    env.DB.prepare("SELECT oras_slug, meserie, COUNT(*) AS n FROM anunturi WHERE stare = 'activ' AND meserie IS NOT NULL GROUP BY oras_slug, meserie"),
  ]);
  const peGrup = new Map<string, number>();
  const aduna = (k: string, n: number) => peGrup.set(k, (peGrup.get(k) ?? 0) + n);
  for (const r of om.results as { oras_slug: string; meserie: string; n: number }[]) {
    aduna(`|${grupMeserie(r.meserie)}`, r.n);
    aduna(`${r.oras_slug}|${grupMeserie(r.meserie)}`, r.n);
  }
  const liste: { oras: string | null; meserie: string | null }[] = (o.results as { oras_slug: string }[]).map((r) => ({ oras: r.oras_slug, meserie: null }));
  for (const [k, n] of peGrup) {
    if (n < prag) continue;
    const [oras, grup] = k.split("|");
    for (const m of slugurileGrupului(grup)) liste.push({ oras: oras || null, meserie: m });
  }
  return liste;
}

export async function toateActive(env: Env): Promise<Pick<Anunt, "id" | "slug" | "confirmat_la">[]> {
  return (await env.DB.prepare("SELECT id, slug, confirmat_la FROM anunturi WHERE stare = 'activ' ORDER BY id DESC LIMIT 45000").all<Pick<Anunt, "id" | "slug" | "confirmat_la">>()).results;
}

/**
 * Anunțurile scoase în ultimele `zile`: expirate sau șterse de angajator. Stau în sitemap-ul lor
 * cât Google le reverifică, vede 410 și le scoate din Google Jobs (cum face eJobs cu
 * `sitemap-expired-listings.xml`). Expiratele se caută pe indexul `anunturi_scoase`.
 */
export async function scoaseRecent(env: Env, zile: number): Promise<{ id: number; slug: string; la: string }[]> {
  const din = new Date(Date.now() - zile * 86400000).toISOString();
  return (await env.DB.prepare(
    "SELECT id, slug, expira_la AS la FROM anunturi WHERE stare = 'expirat' AND expira_la >= ?1 UNION ALL SELECT id, slug, sters_la AS la FROM anunturi WHERE stare = 'sters' AND sters_la >= ?1 LIMIT 45000",
  ).bind(din).all<{ id: number; slug: string; la: string }>()).results;
}

/**
 * Raportarea unui vizitator. Anunțul rămâne publicat: proprietarul verifică raportările în cel mult
 * 3 zile și decide el (29 septembrie 2026). Înainte, trei raportări îl suspendau automat, deci
 * oricine putea scoate anunțul altcuiva. Întoarce numărul raportărilor nerezolvate ale anunțului.
 */
export async function raporteaza(env: Env, id: number, motiv: string, detalii: string, email: string | null): Promise<number> {
  await env.DB.prepare("INSERT INTO raportari (anunt_id, motiv, detalii, email, creat_la) VALUES (?, ?, ?, ?, ?)").bind(id, motiv, detalii || null, email, acum()).run();
  const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM raportari WHERE anunt_id = ? AND rezolvat_la IS NULL").bind(id).first<{ n: number }>();
  return r?.n ?? 0;
}

/** Rulează zilnic: expirările, emailurile păstrate peste termen, limitele și neconfirmatele vechi. */
export async function curatenie(env: Env): Promise<void> {
  const t = acum(), dupa = (zile: number) => new Date(Date.now() - zile * 86400000).toISOString();
  // Cele care expiră acum: Google le scoate din Google Jobs în aceeași zi. Cel mult 45:
  // planul gratuit dă 50 de cereri externe pe rulare. Restul le găsește Google în sitemap-expirate.xml.
  const expira = (await env.DB.prepare("SELECT id, slug FROM anunturi WHERE stare = 'activ' AND expira_la < ? LIMIT 45")
    .bind(t).all<{ id: number; slug: string }>()).results;
  await env.DB.batch([
    env.DB.prepare("UPDATE anunturi SET stare = 'expirat' WHERE stare = 'activ' AND expira_la < ?").bind(t),
    env.DB.prepare("UPDATE anunturi SET email = NULL WHERE email IS NOT NULL AND ((stare = 'expirat' AND expira_la < ?) OR (stare = 'sters' AND sters_la < ?))").bind(dupa(ZILE_PASTRARE_EMAIL), dupa(ZILE_PASTRARE_EMAIL)),
    env.DB.prepare("DELETE FROM anunturi WHERE stare = 'neconfirmat' AND creat_la < ?").bind(dupa(2)),
    env.DB.prepare("DELETE FROM limite WHERE la < ?").bind(dupa(2)),
  ]);
  await anuntaGoogle(env, expira.map(urlAnunt), "URL_DELETED");
  // Anunțurile rămase fără meserie o primesc din titlu, când titlul o spune (proprietar, 29 septembrie
  // 2026: „Ajutor barman restaurant Beraria H” nu apărea la niciun filtru). Publicarea o face deja.
  const fara = (await env.DB.prepare("SELECT id, titlu FROM anunturi WHERE meserie IS NULL AND stare = 'activ'").all<{ id: number; titlu: string }>()).results;
  const gasite = fara.map((a) => ({ id: a.id, m: ghicesteMeserie(a.titlu) })).filter((a) => a.m);
  if (gasite.length) await env.DB.batch(gasite.map((a) => env.DB.prepare("UPDATE anunturi SET meserie = ? WHERE id = ? AND meserie IS NULL").bind(a.m, a.id)));
}
