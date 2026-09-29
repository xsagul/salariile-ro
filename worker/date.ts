// Accesul la baza D1 a anunțurilor. Schema: migrations/0001_anunturi.sql.
import type { Env } from "./index";
import type { Loc } from "./geocod";
import { LIMITA_PE_ZI, ZILE_PASTRARE_EMAIL, ZILE_VALABILITATE, netLunar, orasSlug, slugAnunt, type AnuntNou } from "../src/lib/anunturi/reguli";
import { grupMeserie, slugurileGrupului } from "../src/lib/anunturi/meserii";

export type Anunt = {
  id: number; stare: "neconfirmat" | "activ" | "expirat" | "sters" | "suspendat";
  titlu: string; slug: string; meserie: string | null; angajator: string;
  judet: string; oras: string; oras_slug: string; adresa: string | null; lat: number | null; lon: number | null; loc_precizie: "adresa" | "oras" | null; norma: "intreaga" | "partiala"; ore_pe_zi: number | null;
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
      salariu_min, salariu_max, baza, net_min, descriere, telefon, email, token_hash, creat_la, confirmat_la, expira_la)
     VALUES ('activ', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id, slug`,
  ).bind(a.titlu, slugAnunt(a.titlu, a.oras), a.meserie || null, a.angajator, a.judet, a.oras, orasSlug(a.oras),
    a.adresa ?? null, loc?.lat ?? null, loc?.lon ?? null, loc?.precizie ?? null, a.norma, a.orePeZi ?? null,
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
      norma = ?, ore_pe_zi = ?, salariu_min = ?, salariu_max = ?, baza = ?, net_min = ?, descriere = ?, telefon = ? WHERE id = ? AND stare IN ('neconfirmat', 'activ', 'expirat')`,
  ).bind(a.titlu, slugAnunt(a.titlu, a.oras), a.meserie || null, a.angajator, a.judet, a.oras, orasSlug(a.oras),
    a.adresa ?? null, loc?.lat ?? null, loc?.lon ?? null, loc?.precizie ?? null, a.norma, a.orePeZi ?? null, a.salariuMin,
    a.salariuMax ?? null, a.baza, netLunar(a.salariuMin, a.baza), a.descriere, a.telefon, id).run();
}

/** Ștergerea cerută de cel care a postat: anunțul dispare imediat, datele de contact la fel. */
export async function sterge(env: Env, id: number): Promise<void> {
  await env.DB.prepare("UPDATE anunturi SET stare = 'sters', sters_la = ?, telefon = NULL, adresa = NULL WHERE id = ?").bind(acum(), id).run();
}

export const PE_PAGINA = 20;

/** Filtrul unei liste. Meseria aduce tot grupul ei: la „chelner” apar și anunțurile de „ospătar”. */
function unde(f: { meserie?: string; oras?: string }): { where: string; val: unknown[] } {
  const cond = ["stare = 'activ'"], val: unknown[] = [];
  if (f.meserie) { const g = slugurileGrupului(f.meserie); cond.push(`meserie IN (${g.map(() => "?").join(", ")})`); val.push(...g); }
  if (f.oras) { cond.push("oras_slug = ?"); val.push(f.oras); }
  return { where: cond.join(" AND "), val };
}

export async function lista(env: Env, f: { meserie?: string; oras?: string; pagina: number }): Promise<{ anunturi: Anunt[]; total: number }> {
  const { where, val } = unde(f);
  const [n, r] = await env.DB.batch([
    env.DB.prepare(`SELECT COUNT(*) AS n FROM anunturi WHERE ${where}`).bind(...val),
    env.DB.prepare(`SELECT * FROM anunturi WHERE ${where} ORDER BY confirmat_la DESC LIMIT ? OFFSET ?`).bind(...val, PE_PAGINA, (f.pagina - 1) * PE_PAGINA),
  ]);
  return { total: (n.results[0] as { n: number }).n, anunturi: r.results as Anunt[] };
}

/**
 * Toate anunțurile unei liste, fără paginare și numai cu ce trebuie ca să le ordoneze telefonul
 * după distanță. Poziția vizitatorului nu pleacă niciodată din browser: el cere lista, nu trimite
 * unde e (/api/anunturi/lista).
 */
export async function listaPentruApropiere(env: Env, f: { meserie?: string; oras?: string }) {
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
}
