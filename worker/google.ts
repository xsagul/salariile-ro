// Google Indexing API (3 octombrie 2026): anunțul nou ajunge la Google în minute, nu după ce Google
// citește sitemap-ul, care la un site cu autoritate mică durează zile sau săptămâni. Google permite
// API-ul numai pentru pagini cu JobPosting; din 7 octombrie 2026 îl au toate anunțurile
// (`pagini.ts`, `paginaAnunt`), și cele fără firmă. Listele se descoperă din /locuri-de-munca/sitemap.xml.
// Cota: 200 de notificări pe zi pe proiect. Fără secretul GOOGLE_INDEXARE nu se trimite nimic.
import type { Env } from "./index";

type Cheie = { client_email: string; private_key: string };

/** Tokenul ține o oră; în memoria Worker-ului îl refolosesc cererile care nimeresc aceeași instanță. */
let token: { valoare: string; expira: number } | null = null;

const b64url = (s: string) => btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function tokenAcces(cheie: Cheie): Promise<string> {
  if (token && token.expira > Date.now() + 60_000) return token.valoare;
  const der = Uint8Array.from(atob(cheie.private_key.replace(/-----[^-]+-----|\s/g, "")), (c) => c.charCodeAt(0));
  const k = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const t = Math.floor(Date.now() / 1000);
  const nesemnat = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(JSON.stringify({
    iss: cheie.client_email, scope: "https://www.googleapis.com/auth/indexing", aud: "https://oauth2.googleapis.com/token", iat: t, exp: t + 3600,
  }))}`;
  const semn = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", k, new TextEncoder().encode(nesemnat)));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${nesemnat}.${b64url(String.fromCharCode(...semn))}` }),
  });
  if (!r.ok) throw new Error(`token ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json<{ access_token: string; expires_in: number }>();
  token = { valoare: j.access_token, expira: Date.now() + j.expires_in * 1000 };
  return token.valoare;
}

/**
 * URL_UPDATED la publicare, modificare și prelungire; URL_DELETED la ștergere și expirare, ca Google
 * Jobs să scoată anunțul în aceeași zi. Nu aruncă niciodată: o eroare aici nu strică postarea.
 */
export async function anuntaGoogle(env: Env, cai: string[], tip: "URL_UPDATED" | "URL_DELETED"): Promise<void> {
  if (!env.GOOGLE_INDEXARE || !cai.length) return;
  try {
    const acces = await tokenAcces(JSON.parse(env.GOOGLE_INDEXARE) as Cheie);
    for (const cale of cai) {
      const r = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
        method: "POST",
        headers: { authorization: `Bearer ${acces}`, "content-type": "application/json" },
        body: JSON.stringify({ url: env.SITE + cale, type: tip }),
      });
      if (r.ok) continue;
      console.error("indexare", tip, cale, r.status, (await r.text()).slice(0, 300));
      if (r.status === 429) return; // cota zilei s-a terminat; restul rămâne pe sitemap
    }
  } catch (e) {
    console.error("indexare", e);
  }
}
