// Coordonatele locului de muncă, pentru hartă și pentru „sortează după apropiere” (proprietar,
// 28 septembrie 2026: „locația e foarte importantă”). Se cer o singură dată, la publicare sau la
// modificarea adresei, de la Nominatim (OpenStreetMap). Politica lor: identificare în User-Agent,
// cel mult o cerere pe secundă — volumul nostru e de ordinul anunțurilor pe zi, nu al vizitelor.
// Fără adresă sau dacă strada nu se găsește, se folosește centrul localității.
import { JUDETE } from "../src/lib/anunturi/reguli";

export type Loc = { lat: number; lon: number; precizie: "adresa" | "oras" };

const UA = "salariile.ro anunturi (https://salariile.ro/contact)";

async function cauta(parametri: Record<string, string>): Promise<{ lat: number; lon: number } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  for (const [k, v] of Object.entries({ ...parametri, country: "Romania", countrycodes: "ro", format: "jsonv2", limit: "1" })) url.searchParams.set(k, v);
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept-language": "ro" }, signal: AbortSignal.timeout(5000) });
    if (!r.ok) return null;
    const [x] = (await r.json()) as { lat: string; lon: string }[];
    return x ? { lat: Number(x.lat), lon: Number(x.lon) } : null;
  } catch {
    return null;
  }
}

export async function localizeaza(adresa: string | undefined, oras: string, judet: string): Promise<Loc | null> {
  const city = oras.replace(/,.*$/, "").replace(/\bsector(ul)?\s*\d\b/i, "").trim();
  const county = JUDETE[judet] ?? "";
  if (adresa) {
    const a = await cauta({ street: adresa, city, county });
    if (a) return { ...a, precizie: "adresa" };
  }
  const o = await cauta({ city, county });
  return o ? { ...o, precizie: "oras" } : null;
}
