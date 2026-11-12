// Marcajele din șablonul paginilor de anunțuri (src/app/(site)/locuri-de-munca/sablon/page.tsx),
// pe care Worker-ul (worker/pagini.ts) le înlocuiește cu valorile fiecărei pagini.
export const MARCAJE = {
  titlu: "ANUNTURI_MARCAJ_TITLU_COMPLET",
  titluScurt: "ANUNTURI_MARCAJ_TITLU_SCURT",
  descriere: "ANUNTURI_MARCAJ_DESCRIERE",
  canonic: "https://salariile.ro/ANUNTURI_MARCAJ_CANONIC",
  robots: "ANUNTURI_MARCAJ_ROBOTS",
} as const;

/**
 * Scoate jumătățile de emoji. Un emoji e scris pe două unități (o pereche de surogate), iar una
 * singură nu e text valid: HTMLRewriter se oprește când o primește și pagina pleacă tăiată, cu
 * status 200. Pe 12 noiembrie 2026 lista națională era goală de câteva zile din cauza unui singur
 * anunț cu emoji în descriere, tăiat de `.slice(0, 240)` exact prin mijlocul unuia.
 */
export const textIntreg = (s: string) => s.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");

/**
 * Primele `n` caractere ale unui text scris de oameni, fără să rupă un emoji: numără caractere
 * întregi, nu unități UTF-16, și nu lasă la coadă lipiciul dintre emoji (ZWJ, selector de variație).
 * Orice text venit din formular se scurtează cu ea, nu cu `.slice`.
 */
export function scurteaza(s: string, n: number): string {
  const caractere = Array.from(s);
  return textIntreg(caractere.length <= n ? s : caractere.slice(0, n).join("").replace(/[‍️]+$/, ""));
}

const escHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
// În <script>, valoarea e un șir JSON (RSC) într-un șir JavaScript (self.__next_f.push): se escapează
// de două ori, iar „<” nu rămâne literal, ca să nu închidă scriptul.
const escScript = (s: string) => JSON.stringify(JSON.stringify(s).slice(1, -1)).slice(1, -1).replace(/</g, "\\u003c");

/** Pune valorile în locul marcajelor, cu escaparea potrivită locului: HTML sau script. */
export function completeazaSablon(html: string, v: Record<keyof typeof MARCAJE, string>): string {
  const perechi = (Object.keys(MARCAJE) as (keyof typeof MARCAJE)[])
    .sort((a, b) => MARCAJE[b].length - MARCAJE[a].length)
    .map((k) => [MARCAJE[k], v[k]] as const);
  const inlocuieste = (s: string, esc: (x: string) => string) => perechi.reduce((acc, [m, x]) => acc.split(m).join(esc(x)), s);
  return html
    .split(/(<script\b[^>]*>[\s\S]*?<\/script>)/)
    .map((bucata, i) => inlocuieste(bucata, i % 2 ? escScript : escHtml))
    .join("");
}
