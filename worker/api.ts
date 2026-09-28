// API-ul anunțurilor: postare, gestionare din linkul primit pe email, raportare.
// Toate cererile sunt JSON prin POST; răspunsurile nu conțin niciodată emailul celui care postează.
import type { Env } from "./index";
import catalog from "../src/data/meserii-catalog.json";
import { URL_ADAUGA, urlAnunt, valideaza } from "../src/lib/anunturi/reguli";
import { adauga, confirma, dupaId, dupaToken, inLimita, modifica, prelungeste, raporteaza, sterge, tokenNou, type Anunt } from "./date";

const MESERII = new Set((catalog as { meserii: { slug: string }[] }).meserii.map((m) => m.slug));
const MOTIVE_RAPORTARE = ["țeapă sau cerere de bani", "discriminare", "salariul nu e cel real", "anunț fals sau duplicat", "conținut ilegal", "altceva"];

const json = (date: unknown, status = 200) => new Response(JSON.stringify(date), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

async function turnstileOk(env: Env, raspuns: unknown, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true; // local, fără cheie
  if (typeof raspuns !== "string" || !raspuns) return false;
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: raspuns, remoteip: ip }),
  });
  return ((await r.json()) as { success?: boolean }).success === true;
}

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
  if (req.method !== "POST") return json({ eroare: "Metodă nepermisă" }, 405);
  // Numai de pe site: un formular de pe alt domeniu nu poate posta în numele vizitatorului.
  const origin = req.headers.get("origin");
  if (origin && origin !== env.SITE && !origin.startsWith("http://localhost") && !origin.startsWith("http://127.0.0.1")) return json({ eroare: "Origine nepermisă" }, 403);
  let corp: Record<string, unknown>;
  try { corp = (await req.json()) as Record<string, unknown>; } catch { return json({ eroare: "Cerere invalidă" }, 400); }
  const ip = req.headers.get("cf-connecting-ip") ?? "local";

  if (cale === "/api/anunturi") {
    if (!(await turnstileOk(env, corp.turnstile, ip))) return json({ erori: [{ camp: "general", mesaj: "Verificarea anti-spam n-a trecut. Reîncarcă pagina și încearcă din nou." }] }, 400);
    const v = valideaza(corp, MESERII);
    if ("erori" in v) return json({ erori: v.erori }, 400);
    if (!(await inLimita(env, v.anunt.email, ip))) return json({ erori: [{ camp: "general", mesaj: "Ai publicat multe anunțuri azi. Mai încearcă mâine." }] }, 429);
    const token = tokenNou();
    const id = await adauga(env, v.anunt, token);
    ctx.waitUntil(trimite(env, v.anunt.email, `Confirmă anunțul „${v.anunt.titlu}”`,
      `Bună ziua,\n\nCa să publici anunțul „${v.anunt.titlu}” pe salariile.ro, deschide linkul de mai jos și apasă „Publică anunțul”:\n\n${linkGestionare(env, token)}\n\n` +
      `Din același link îl poți modifica, prelungi sau șterge oricând. Păstrează emailul: linkul nu se mai trimite o dată.\n` +
      `Anunțul rămâne publicat 30 de zile. Dacă nu l-ai trimis tu, ignoră mesajul: fără confirmare, se șterge în 48 de ore.\n\nsalariile.ro`));
    return json({ ok: true, id });
  }

  if (cale === "/api/anunturi/gestioneaza") {
    const a = await dupaToken(env, String(corp.token ?? ""));
    if (!a) return json({ eroare: "Linkul nu mai e valid: anunțul a fost șters sau linkul e incomplet." }, 404);
    switch (corp.actiune) {
      case "citeste": return json({ anunt: public_(a) });
      case "confirma": await confirma(env, a.id); break;
      case "prelungeste": await prelungeste(env, a.id); break;
      case "sterge": await sterge(env, a.id); return json({ ok: true, sters: true });
      case "modifica": {
        const v = valideaza({ ...(corp.date as Record<string, unknown>), email: a.email ?? "sters@salariile.ro", acordPublicare: true }, MESERII);
        if ("erori" in v) return json({ erori: v.erori }, 400);
        await modifica(env, a.id, v.anunt);
        break;
      }
      default: return json({ eroare: "Acțiune necunoscută" }, 400);
    }
    return json({ ok: true, anunt: public_((await dupaId(env, a.id))!) });
  }

  if (cale === "/api/anunturi/raporteaza") {
    if (!(await turnstileOk(env, corp.turnstile, ip))) return json({ eroare: "Verificarea anti-spam n-a trecut." }, 400);
    const id = Number(corp.id), motiv = String(corp.motiv ?? "");
    const a = Number.isInteger(id) ? await dupaId(env, id) : null;
    if (!a || a.stare !== "activ") return json({ eroare: "Anunțul nu mai e publicat." }, 404);
    if (!MOTIVE_RAPORTARE.includes(motiv)) return json({ eroare: "Alege un motiv." }, 400);
    const detalii = String(corp.detalii ?? "").slice(0, 1000);
    const email = typeof corp.email === "string" && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(corp.email) ? corp.email : null;
    const n = await raporteaza(env, id, motiv, detalii, email);
    ctx.waitUntil(trimite(env, env.EMAIL_PROPRIETAR, `Raportare anunț ${id}: ${motiv}`,
      `Anunțul ${env.SITE}${urlAnunt(a)}\nMotiv: ${motiv}\nDetalii: ${detalii || "—"}\nRaportări nerezolvate: ${n}${n >= 3 ? " (anunțul a fost suspendat automat)" : ""}\nContact raportor: ${email ?? "—"}`));
    return json({ ok: true });
  }

  return json({ eroare: "Negăsit" }, 404);
}
