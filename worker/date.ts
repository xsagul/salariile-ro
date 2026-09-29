// Accesul la baza D1 a anunțurilor. Schema: migrations/0001_anunturi.sql.
import type { Env } from "./index";
import type { Loc } from "./geocod";
import { LIMITA_PE_ZI, ZILE_PASTRARE_EMAIL, ZILE_VALABILITATE, netLunar, orasSlug, slugAnunt, type AnuntNou, type Contract, type LocMunca, type Norma } from "../src/lib/anunturi/reguli";
import { MESERII_ANUNTURI, ghicesteMeserie, grupMeserie, meseriileDomeniului, pentruPotrivire, slugurileGrupului } from "../src/lib/anunturi/meserii";

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
 * Textul în care caută bara, ca pe OLX: titlul, firma, localitatea și descrierea, cu litere mici și
 * fără diacritice. D1 n-are `unaccent`, iar `lower()` din SQLite schimbă numai literele fără semne.
 */
const TEXT = [["ă", "a"], ["â", "a"], ["î", "i"], ["ș", "s"], ["ş", "s"], ["ț", "t"], ["ţ", "t"], ["Ă", "a"], ["Â", "a"], ["Î", "i"], ["Ș", "s"], ["Ş", "s"], ["Ț", "t"], ["Ţ", "t"]]
  .reduce((e, [d, a]) => `replace(${e}, '${d}', '${a}')`, "lower(titlu || ' ' || angajator || ' ' || oras || ' ' || descriere)");
/** Cuvinte care nu spun nimic despre job: „locuri de muncă barman” caută „barman”. */
const CUVINTE_GOALE = new Set(["loc", "locuri", "munca", "job", "joburi", "angajare", "angajam", "angajez", "angajeaza", "caut", "anunt", "anunturi", "post", "posturi"]);
export const cuvinteCautate = (q: string) => pentruPotrivire(q).trim().split(" ").filter((w) => w.length >= 2 && !CUVINTE_GOALE.has(w)).slice(0, 6);
/** Meseriile din grupurile în care un nume începe cu `w`: „chelner” aduce și anunțurile de ospătar. */
function sinonime(w: string): string[] {
  const grupuri = new Set(MESERII_ANUNTURI.filter((m) => pentruPotrivire(m.nume).includes(` ${w}`)).map((m) => m.grup));
  return MESERII_ANUNTURI.filter((m) => grupuri.has(m.grup)).map((m) => m.slug);
}
/** Sluguri din catalogul nostru ([a-z0-9-]), scrise direct în SQL: D1 primește cel mult 100 de parametri. */
const inSql = (sluguri: string[]) => sluguri.map((x) => `'${x.replace(/[^a-z0-9-]/g, "")}'`).join(", ");

/** Condiția SQL a filtrului. Meseria aduce tot grupul ei: la „chelner” apar și anunțurile de „ospătar”.
 *  `fara` lasă deoparte o dimensiune: numărul de lângă o opțiune ține cont de celelalte filtre, nu de al ei. */
function unde(f: Filtru, fara?: "meserie" | "oras" | "norma" | "domeniu" | "contract" | "locMunca"): { where: string; val: unknown[] } {
  const cond = ["stare = 'activ'"], val: unknown[] = [];
  if (f.meserie && fara !== "meserie") cond.push(`meserie IN (${inSql(slugurileGrupului(f.meserie))})`);
  if (f.oras && fara !== "oras") { cond.push("oras_slug = ?"); val.push(f.oras); }
  if (f.norma && fara !== "norma") { cond.push("norma = ?"); val.push(f.norma); }
  if (f.domeniu && fara !== "domeniu") cond.push(`meserie IN (${inSql(meseriileDomeniului(f.domeniu))})`);
  if (f.faraExperienta) cond.push("fara_experienta = 1");
  if (f.contract && fara !== "contract") { cond.push("contract = ?"); val.push(f.contract); }
  if (f.locMunca && fara !== "locMunca") { cond.push("loc_munca = ?"); val.push(f.locMunca); }
  // Fiecare cuvânt trebuie să apară în text sau să fie numele meseriei anunțului (de la 4 litere, ca
  // „bar” să nu aducă și frizerii de la „barber”).
  for (const w of f.q ? cuvinteCautate(f.q) : []) {
    const sin = w.length >= 4 ? sinonime(w) : [];
    cond.push(sin.length ? `(${TEXT} LIKE ? OR meserie IN (${inSql(sin)}))` : `${TEXT} LIKE ?`);
    val.push(`%${w}%`);
  }
  return { where: cond.join(" AND "), val };
}

export async function lista(env: Env, f: Filtru & { pagina: number; ordine?: "salariu" }): Promise<{ anunturi: Anunt[]; total: number }> {
  const { where, val } = unde(f);
  const ordine = f.ordine === "salariu" ? "net_min DESC, confirmat_la DESC" : "confirmat_la DESC";
  const [n, r] = await env.DB.batch([
    env.DB.prepare(`SELECT COUNT(*) AS n FROM anunturi WHERE ${where}`).bind(...val),
    env.DB.prepare(`SELECT * FROM anunturi WHERE ${where} ORDER BY ${ordine} LIMIT ? OFFSET ?`).bind(...val, PE_PAGINA, (f.pagina - 1) * PE_PAGINA),
  ]);
  return { total: (n.results[0] as { n: number }).n, anunturi: r.results as Anunt[] };
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
  const o = unde(f, "oras"), m = unde(faraText, "meserie"), n = unde(f, "norma"), d = unde(faraText, "domeniu");
  const c = unde(f, "contract"), l = unde(f, "locMunca"), e = unde({ ...f, faraExperienta: false });
  const [ro, rm, rn, rd, rc, rl, re] = await env.DB.batch([
    env.DB.prepare(`SELECT oras_slug AS s, MIN(oras) AS n, SUM(CASE WHEN ${o.where} THEN 1 ELSE 0 END) AS c FROM anunturi WHERE stare = 'activ' GROUP BY oras_slug ORDER BY n`).bind(...o.val),
    env.DB.prepare(`SELECT meserie AS s, COUNT(*) AS c FROM anunturi WHERE ${m.where} AND meserie IS NOT NULL GROUP BY meserie`).bind(...m.val),
    env.DB.prepare(`SELECT norma AS s, COUNT(*) AS c FROM anunturi WHERE ${n.where} GROUP BY norma`).bind(...n.val),
    env.DB.prepare(`SELECT meserie AS s, COUNT(*) AS c FROM anunturi WHERE ${d.where} AND meserie IS NOT NULL GROUP BY meserie`).bind(...d.val),
    env.DB.prepare(`SELECT contract AS s, COUNT(*) AS c FROM anunturi WHERE ${c.where} AND contract IS NOT NULL GROUP BY contract`).bind(...c.val),
    env.DB.prepare(`SELECT loc_munca AS s, COUNT(*) AS c FROM anunturi WHERE ${l.where} AND loc_munca IS NOT NULL GROUP BY loc_munca`).bind(...l.val),
    env.DB.prepare(`SELECT COUNT(*) AS c FROM anunturi WHERE ${e.where} AND fara_experienta = 1`).bind(...e.val),
  ]);
  const peDomeniu = new Map<string, number>();
  for (const r of rd.results as { s: string; c: number }[]) {
    const dom = DOMENIUL.get(r.s);
    if (dom) peDomeniu.set(dom, (peDomeniu.get(dom) ?? 0) + r.c);
  }
  return {
    orase: ro.results as Numarare[], meserii: rm.results as { s: string; c: number }[], norme: rn.results as { s: Norma; c: number }[],
    domenii: [...peDomeniu].map(([s, c]) => ({ s, c })),
    contracte: rc.results as { s: Contract; c: number }[], locuri: rl.results as { s: LocMunca; c: number }[],
    faraExperienta: (re.results[0] as { c: number } | undefined)?.c ?? 0,
  };
}

/**
 * Toate anunțurile unei liste, fără paginare și numai cu ce trebuie ca să le ordoneze telefonul
 * după distanță. Poziția vizitatorului nu pleacă niciodată din browser: el cere lista, nu trimite
 * unde e (/api/anunturi/lista).
 */
export async function listaPentruApropiere(env: Env, f: Filtru) {
  const { where, val } = unde(f);
  return (await env.DB.prepare(`SELECT * FROM anunturi WHERE ${where} ORDER BY confirmat_la DESC LIMIT 500`).bind(...val).all<Anunt>()).results;
}

/** Numele localității cum îl scriu anunțurile („Cluj-Napoca”), pentru titlul paginii ei. */
export async function numeOras(env: Env, slug: string): Promise<string | null> {
  const r = await env.DB.prepare("SELECT oras FROM anunturi WHERE oras_slug = ? AND stare = 'activ' GROUP BY oras ORDER BY COUNT(*) DESC LIMIT 1").bind(slug).first<{ oras: string }>();
  return r?.oras.replace(/,.*$/, "").trim() ?? null;
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
  await env.DB.batch([
    env.DB.prepare("UPDATE anunturi SET stare = 'expirat' WHERE stare = 'activ' AND expira_la < ?").bind(t),
    env.DB.prepare("UPDATE anunturi SET email = NULL WHERE email IS NOT NULL AND ((stare = 'expirat' AND expira_la < ?) OR (stare = 'sters' AND sters_la < ?))").bind(dupa(ZILE_PASTRARE_EMAIL), dupa(ZILE_PASTRARE_EMAIL)),
    env.DB.prepare("DELETE FROM anunturi WHERE stare = 'neconfirmat' AND creat_la < ?").bind(dupa(2)),
    env.DB.prepare("DELETE FROM limite WHERE la < ?").bind(dupa(2)),
  ]);
  // Anunțurile rămase fără meserie o primesc din titlu, când titlul o spune (proprietar, 29 septembrie
  // 2026: „Ajutor barman restaurant Beraria H” nu apărea la niciun filtru). Publicarea o face deja.
  const fara = (await env.DB.prepare("SELECT id, titlu FROM anunturi WHERE meserie IS NULL AND stare = 'activ'").all<{ id: number; titlu: string }>()).results;
  const gasite = fara.map((a) => ({ id: a.id, m: ghicesteMeserie(a.titlu) })).filter((a) => a.m);
  if (gasite.length) await env.DB.batch(gasite.map((a) => env.DB.prepare("UPDATE anunturi SET meserie = ? WHERE id = ? AND meserie IS NULL").bind(a.m, a.id)));
}
