// Accesul la baza D1 a anunțurilor. Schema: migrations/0001_anunturi.sql.
import type { Env } from "./index";
import { LIMITA_PE_ZI, ZILE_PASTRARE_EMAIL, ZILE_VALABILITATE, netLunar, orasSlug, slugAnunt, type AnuntNou } from "../src/lib/anunturi/reguli";

export type Anunt = {
  id: number; stare: "neconfirmat" | "activ" | "expirat" | "sters" | "suspendat";
  titlu: string; slug: string; meserie: string | null; angajator: string; cui: string | null;
  judet: string; oras: string; oras_slug: string; norma: "intreaga" | "partiala"; ore_pe_zi: number | null;
  salariu_min: number; salariu_max: number | null; baza: "brut" | "net"; net_min: number;
  descriere: string; telefon: string | null; email_contact: string | null;
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
  const chei = [`email:${await sha256(env.SARE + email)}`, `ip:${await sha256(env.SARE + ip)}`];
  const ieri = new Date(Date.now() - 86400000).toISOString();
  for (const c of chei) {
    const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM limite WHERE cheie = ? AND la > ?").bind(c, ieri).first<{ n: number }>();
    if ((r?.n ?? 0) >= LIMITA_PE_ZI) return false;
  }
  await env.DB.batch(chei.map((c) => env.DB.prepare("INSERT INTO limite (cheie, la) VALUES (?, ?)").bind(c, acum())));
  return true;
}

export async function adauga(env: Env, a: AnuntNou, token: string): Promise<number> {
  const r = await env.DB.prepare(
    `INSERT INTO anunturi (stare, titlu, slug, meserie, angajator, cui, judet, oras, oras_slug, norma, ore_pe_zi, salariu_min, salariu_max, baza, net_min,
      descriere, telefon, email_contact, email, token_hash, creat_la)
     VALUES ('neconfirmat', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
  ).bind(a.titlu, slugAnunt(a.titlu, a.oras), a.meserie || null, a.angajator, a.cui ?? null, a.judet, a.oras, orasSlug(a.oras), a.norma, a.orePeZi ?? null,
    a.salariuMin, a.salariuMax ?? null, a.baza, netLunar(a.salariuMin, a.baza), a.descriere, a.telefon ?? null, a.emailContact ?? null,
    a.email, await sha256(token), acum()).first<{ id: number }>();
  return r!.id;
}

export async function dupaToken(env: Env, token: string): Promise<Anunt | null> {
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return null;
  return env.DB.prepare("SELECT * FROM anunturi WHERE token_hash = ? AND stare != 'sters'").bind(await sha256(token)).first<Anunt>();
}

export async function dupaId(env: Env, id: number): Promise<Anunt | null> {
  return env.DB.prepare("SELECT * FROM anunturi WHERE id = ?").bind(id).first<Anunt>();
}

/** Confirmarea din link: prima dată publică anunțul și pornește cele 30 de zile. */
export async function confirma(env: Env, id: number): Promise<void> {
  await env.DB.prepare("UPDATE anunturi SET stare = 'activ', confirmat_la = COALESCE(confirmat_la, ?), expira_la = ? WHERE id = ? AND stare = 'neconfirmat'")
    .bind(acum(), peste(ZILE_VALABILITATE), id).run();
}

export async function prelungeste(env: Env, id: number): Promise<void> {
  await env.DB.prepare("UPDATE anunturi SET stare = 'activ', expira_la = ? WHERE id = ? AND stare IN ('activ', 'expirat')").bind(peste(ZILE_VALABILITATE), id).run();
}

export async function modifica(env: Env, id: number, a: AnuntNou): Promise<void> {
  await env.DB.prepare(
    `UPDATE anunturi SET titlu = ?, slug = ?, meserie = ?, angajator = ?, cui = ?, judet = ?, oras = ?, oras_slug = ?, norma = ?, ore_pe_zi = ?, salariu_min = ?,
      salariu_max = ?, baza = ?, net_min = ?, descriere = ?, telefon = ?, email_contact = ? WHERE id = ? AND stare IN ('neconfirmat', 'activ', 'expirat')`,
  ).bind(a.titlu, slugAnunt(a.titlu, a.oras), a.meserie || null, a.angajator, a.cui ?? null, a.judet, a.oras, orasSlug(a.oras), a.norma, a.orePeZi ?? null, a.salariuMin,
    a.salariuMax ?? null, a.baza, netLunar(a.salariuMin, a.baza), a.descriere, a.telefon ?? null, a.emailContact ?? null, id).run();
}

/** Ștergerea cerută de cel care a postat: anunțul dispare imediat, datele de contact la fel. */
export async function sterge(env: Env, id: number): Promise<void> {
  await env.DB.prepare("UPDATE anunturi SET stare = 'sters', sters_la = ?, telefon = NULL, email_contact = NULL WHERE id = ?").bind(acum(), id).run();
}

export const PE_PAGINA = 20;
export async function lista(env: Env, f: { meserie?: string; oras?: string; pagina: number }): Promise<{ anunturi: Anunt[]; total: number }> {
  const cond = ["stare = 'activ'"], val: unknown[] = [];
  if (f.meserie) { cond.push("meserie = ?"); val.push(f.meserie); }
  if (f.oras) { cond.push("oras_slug = ?"); val.push(f.oras); }
  const where = cond.join(" AND ");
  const [n, r] = await env.DB.batch([
    env.DB.prepare(`SELECT COUNT(*) AS n FROM anunturi WHERE ${where}`).bind(...val),
    env.DB.prepare(`SELECT * FROM anunturi WHERE ${where} ORDER BY confirmat_la DESC LIMIT ? OFFSET ?`).bind(...val, PE_PAGINA, (f.pagina - 1) * PE_PAGINA),
  ]);
  return { total: (n.results[0] as { n: number }).n, anunturi: r.results as Anunt[] };
}

/** Numele localității cum îl scriu anunțurile („Cluj-Napoca”), pentru titlul paginii ei. */
export async function numeOras(env: Env, slug: string): Promise<string | null> {
  const r = await env.DB.prepare("SELECT oras FROM anunturi WHERE oras_slug = ? AND stare = 'activ' GROUP BY oras ORDER BY COUNT(*) DESC LIMIT 1").bind(slug).first<{ oras: string }>();
  return r?.oras.replace(/,.*$/, "").trim() ?? null;
}

/** Paginile de listă cu anunțuri destule ca să intre în Google (sitemap). */
export async function listeIndexabile(env: Env, prag: number): Promise<{ oras: string | null; meserie: string | null }[]> {
  const q = (grup: string) => env.DB.prepare(`SELECT ${grup} FROM anunturi WHERE stare = 'activ' GROUP BY ${grup} HAVING COUNT(*) >= ?`).bind(prag);
  const [o, m, om] = await env.DB.batch([q("oras_slug"), q("meserie"), q("oras_slug, meserie")]);
  return [
    ...(o.results as { oras_slug: string }[]).map((r) => ({ oras: r.oras_slug, meserie: null })),
    ...(m.results as { meserie: string | null }[]).filter((r) => r.meserie).map((r) => ({ oras: null, meserie: r.meserie })),
    ...(om.results as { oras_slug: string; meserie: string | null }[]).filter((r) => r.meserie).map((r) => ({ oras: r.oras_slug, meserie: r.meserie })),
  ];
}

export async function toateActive(env: Env): Promise<Pick<Anunt, "id" | "slug" | "confirmat_la">[]> {
  return (await env.DB.prepare("SELECT id, slug, confirmat_la FROM anunturi WHERE stare = 'activ' ORDER BY id DESC LIMIT 45000").all<Pick<Anunt, "id" | "slug" | "confirmat_la">>()).results;
}

/** Raportarea unui vizitator; la trei raportări nerezolvate anunțul se suspendă până la verificare. */
export async function raporteaza(env: Env, id: number, motiv: string, detalii: string, email: string | null): Promise<number> {
  await env.DB.prepare("INSERT INTO raportari (anunt_id, motiv, detalii, email, creat_la) VALUES (?, ?, ?, ?, ?)").bind(id, motiv, detalii || null, email, acum()).run();
  const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM raportari WHERE anunt_id = ? AND rezolvat_la IS NULL").bind(id).first<{ n: number }>();
  if ((r?.n ?? 0) >= 3) await env.DB.prepare("UPDATE anunturi SET stare = 'suspendat', motiv_suspendare = 'trei raportări, în verificare' WHERE id = ? AND stare = 'activ'").bind(id).run();
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
