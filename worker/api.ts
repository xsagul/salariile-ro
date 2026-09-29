// API-ul anunțurilor: postare, gestionare din linkul primit pe email, raportare.
// Toate cererile sunt JSON prin POST; răspunsurile nu conțin niciodată emailul celui care postează.
import type { Env } from "./index";
import { URL_ADAUGA, urlAnunt, valideaza } from "../src/lib/anunturi/reguli";
import { MESERII_ANUNTURI } from "../src/lib/anunturi/meserii";
import { adauga, dupaId, dupaToken, inLimita, listaPentruApropiere, modifica, prelungeste, raporteaza, sterge, tokenNou, type Anunt } from "./date";
import { localizeaza } from "./geocod";
import { cardLista, citesteExtra } from "./pagini";

const MESERII = new Set(MESERII_ANUNTURI.map((m) => m.slug));
const MOTIVE_RAPORTARE = ["țeapă sau cerere de bani", "discriminare", "salariul nu e cel real", "anunț fals sau duplicat", "conținut ilegal", "altceva"];

const json = (date: unknown, status = 200) => new Response(JSON.stringify(date), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

function linkGestionare(env: Env, token: string) {
  return `${env.SITE}${URL_ADAUGA}/gestioneaza#${token}`;
}

async function trimite(env: Env, to: string, subject: string, text: string): Promise<void> {
  if (!env.EMAIL) { console.log(`[email local] către ${to}: ${subject}\n${text}`); return; }
  await env.EMAIL.send({ to, from: { email: env.EMAIL_EXPEDITOR, name: "salariile.ro" }, subject, text });
}

/** Ce vede cel care gestionează: tot anunțul, fără emailul lui și fără hash-uri. */
const public_ = (a: Anunt) => {
  const { email: _e, ...rest } = a as Anunt & { token_hash?: string };
  delete (rest as { token_hash?: string }).token_hash;
  return rest;
};

export async function api(req: Request, env: Env, ctx: ExecutionContext, cale: string): Promise<Response> {
  // Lista pentru „sortează după apropiere”: telefonul cere anunțurile și le ordonează singur după
  // distanță; poziția vizitatorului nu ajunge la noi. Numai câmpurile cardului, fără contact.
  if (cale === "/api/anunturi/lista" && req.method === "GET") {
    const u = new URL(req.url);
    const meserie = MESERII.has(u.searchParams.get("meserie") ?? "") ? u.searchParams.get("meserie")! : undefined;
    const oras = /^[a-z0-9-]{2,60}$/.test(u.searchParams.get("oras") ?? "") ? u.searchParams.get("oras")! : undefined;
    const e = citesteExtra(u);
    const r = await listaPentruApropiere(env, { meserie, oras, norma: e.norma, netMin: e.net });
    return new Response(JSON.stringify(r.map((a) => ({ lat: a.lat, lon: a.lon, precis: a.loc_precizie === "adresa", html: cardLista(a) }))),
      { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" } });
  }
  if (req.method !== "POST") return json({ eroare: "Metodă nepermisă" }, 405);
  // Numai de pe site: un formular de pe alt domeniu nu poate posta în numele vizitatorului.
  const origin = req.headers.get("origin");
  if (origin && origin !== env.SITE && !origin.startsWith("http://localhost") && !origin.startsWith("http://127.0.0.1")) return json({ eroare: "Origine nepermisă" }, 403);
  let corp: Record<string, unknown>;
  try { corp = (await req.json()) as Record<string, unknown>; } catch { return json({ eroare: "Cerere invalidă" }, 400); }
  const ip = req.headers.get("cf-connecting-ip") ?? "local";

  if (cale === "/api/anunturi") {
    // Fără Turnstile (proprietar, 29 septembrie 2026): oamenii scriau că nu pot posta. Frâna rămâne
    // limita pe zi, regulile de conținut și raportările, verificate de proprietar.
    const v = valideaza(corp, MESERII);
    if ("erori" in v) return json({ erori: v.erori }, 400);
    if (!(await inLimita(env, v.anunt.email, ip))) return json({ erori: [{ camp: "general", mesaj: "Ai publicat multe anunțuri azi. Mai încearcă mâine." }] }, 429);
    const token = tokenNou();
    const a = await adauga(env, v.anunt, await localizeaza(v.anunt.adresa, v.anunt.oras, v.anunt.judet), token);
    const trimis = Boolean(v.anunt.email && env.EMAIL);
    if (trimis) ctx.waitUntil(trimite(env, v.anunt.email, `Anunțul „${v.anunt.titlu}” e publicat`,
      `Bună ziua,\n\nAnunțul „${v.anunt.titlu}” e publicat pe salariile.ro:\n${env.SITE}${urlAnunt(a)}\n\n` +
      `Pune linkul anunțului și în grupurile de Facebook cu locuri de muncă din orașul tău: candidații ajung direct la el, cu salariul și telefonul.\n\n` +
      `Îl modifici, îl prelungești sau îl ștergi oricând din linkul de mai jos. Păstrează emailul: linkul nu se mai trimite o dată.\n\n${linkGestionare(env, token)}\n\n` +
      `Anunțul rămâne publicat 30 de zile. Dacă nu l-ai trimis tu, deschide linkul și apasă „Șterge anunțul”.\n\nsalariile.ro`));
    // Linkul de gestionare se dă și pe ecran: emailul nu e verificat, iar o greșeală de scriere l-ar pierde.
    return json({ ok: true, id: a.id, url: urlAnunt(a), gestionare: `${URL_ADAUGA}/gestioneaza#${token}`, emailTrimis: trimis });
  }

  if (cale === "/api/anunturi/gestioneaza") {
    const a = await dupaToken(env, String(corp.token ?? ""));
    if (!a) return json({ eroare: "Linkul nu mai e valid: anunțul a fost șters sau linkul e incomplet." }, 404);
    switch (corp.actiune) {
      case "citeste": return json({ anunt: public_(a) });
      case "prelungeste": await prelungeste(env, a.id); break;
      case "sterge": await sterge(env, a.id); return json({ ok: true, sters: true });
      case "modifica": {
        const v = valideaza({ ...(corp.date as Record<string, unknown>), email: a.email ?? "sters@salariile.ro", acordPublicare: true }, MESERII);
        if ("erori" in v) return json({ erori: v.erori }, 400);
        const loc = v.anunt.adresa === (a.adresa ?? undefined) && v.anunt.oras === a.oras && a.lat != null
          ? { lat: a.lat, lon: a.lon!, precizie: a.loc_precizie ?? "oras" as const }
          : await localizeaza(v.anunt.adresa, v.anunt.oras, v.anunt.judet);
        await modifica(env, a.id, v.anunt, loc);
        break;
      }
      default: return json({ eroare: "Acțiune necunoscută" }, 400);
    }
    return json({ ok: true, anunt: public_((await dupaId(env, a.id))!) });
  }

  if (cale === "/api/anunturi/raporteaza") {
    const id = Number(corp.id), motiv = String(corp.motiv ?? "");
    const a = Number.isInteger(id) ? await dupaId(env, id) : null;
    if (!a || a.stare !== "activ") return json({ eroare: "Anunțul nu mai e publicat." }, 404);
    if (!MOTIVE_RAPORTARE.includes(motiv)) return json({ eroare: "Alege un motiv." }, 400);
    const detalii = String(corp.detalii ?? "").slice(0, 1000);
    const email = typeof corp.email === "string" && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(corp.email) ? corp.email : null;
    const n = await raporteaza(env, id, motiv, detalii, email);
    ctx.waitUntil(trimite(env, env.EMAIL_PROPRIETAR, `Raportare anunț ${id}: ${motiv}`,
      `Anunțul ${env.SITE}${urlAnunt(a)}\nMotiv: ${motiv}\nDetalii: ${detalii || "—"}\nRaportări nerezolvate: ${n}\nContact raportor: ${email ?? "—"}`));
    return json({ ok: true });
  }

  return json({ eroare: "Negăsit" }, 404);
}
