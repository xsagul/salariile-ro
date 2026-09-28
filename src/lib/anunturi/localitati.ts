// Sugestiile din formularul anunțurilor: meseria, localitatea (SIRUTA, INS) și strada (OpenStreetMap).
// Fișierele le face scripts/anunturi/genereaza-localitati.mjs; se încarcă din site, la nevoie, iar ce
// scrie vizitatorul nu pleacă nicăieri: căutarea se face în browser.
import { JUDETE, faraDiacritice } from "./reguli";

/** [nume, județ, comuna (la sate, altfel ""), rang: 0 reședință de județ … 4 sat] */
export type Localitate = [string, string, string, number];

export const cheieUat = ([nume, jud, comuna]: Localitate) =>
  jud === "B" ? "bucuresti" : faraDiacritice((comuna || nume).replace(/î/gi, "a")).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** „Ciumbrud · Aiud, jud. Alba”, ca să se deosebească cele 30 de sate „Valea Mare”. */
export const detaliuLocalitate = ([, jud, comuna]: Localitate) =>
  jud === "B" ? "" : `${comuna ? `${comuna}, ` : ""}jud. ${JUDETE[jud] ?? jud}`;

let localitati: Promise<Localitate[]> | null = null;
export const incarcaLocalitati = () =>
  (localitati ??= fetch("/date/anunturi/localitati.json").then((r) => r.json()).catch((e) => { localitati = null; throw e; }));

const strazi = new Map<string, Promise<Record<string, string[]>>>();
export async function strazileLocalitatii(l: Localitate): Promise<string[]> {
  const jud = l[1];
  if (!strazi.has(jud)) strazi.set(jud, fetch(`/date/anunturi/strazi/${jud}.json`).then((r) => r.ok ? r.json() : {}).catch(() => { strazi.delete(jud); return {}; }));
  return (await strazi.get(jud)!)[cheieUat(l)] ?? [];
}

// Prescurtările de la începutul adresei („str. lipscani”) nu trebuie să se potrivească literă cu literă.
const PREFIX = /^(str|strada|bd|bdul|b-dul|bulevardul|sos|soseaua|cal|calea|al|aleea|p-ta|piata|splaiul|intr|intrarea)\.?\s+/;

/**
 * Primele `n` potriviri: întâi cele care încep cu ce s-a scris, apoi cele în care un cuvânt începe
 * așa, apoi restul; la egalitate, după `rang` și alfabetic. Cifrele din căutare (numărul străzii)
 * nu intră în potrivire.
 */
export function cauta<T>(lista: readonly T[], text: string, nume: (t: T) => string, rang: (t: T) => number = () => 0, n = 8): T[] {
  let q = faraDiacritice(text).replace(/\d+\S*/g, " ").replace(/\s+/g, " ").trim();
  if (!q) return [];
  const faraPrefix = q.replace(PREFIX, "");
  if (faraPrefix) q = faraPrefix;
  const gasite: [T, number][] = [];
  for (const t of lista) {
    const s = faraDiacritice(nume(t));
    // În mijlocul cuvântului, abia de la 3 litere: „li” găsea și „Iuliu”.
    const scor = s.startsWith(q) ? 0 : s.includes(" " + q) || s.includes("-" + q) ? 1 : q.length >= 3 && s.includes(q) ? 2 : -1;
    if (scor >= 0) gasite.push([t, scor]);
  }
  return gasite.sort((a, b) => a[1] - b[1] || rang(a[0]) - rang(b[0]) || nume(a[0]).localeCompare(nume(b[0]), "ro")).slice(0, n).map((x) => x[0]);
}

/** Numărul scris deja („Lipscani 69”) rămâne după ce se alege strada din listă. */
export const numarDinText = (text: string) => (text.match(/\d.*$/)?.[0] ?? "").trim();
