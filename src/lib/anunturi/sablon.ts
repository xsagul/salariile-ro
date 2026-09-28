// Marcajele din șablonul paginilor de anunțuri (src/app/(site)/locuri-de-munca/sablon/page.tsx),
// pe care Worker-ul (worker/pagini.ts) le înlocuiește cu valorile fiecărei pagini.
export const MARCAJE = {
  titlu: "ANUNTURI_MARCAJ_TITLU_COMPLET",
  titluScurt: "ANUNTURI_MARCAJ_TITLU_SCURT",
  descriere: "ANUNTURI_MARCAJ_DESCRIERE",
  canonic: "https://salariile.ro/ANUNTURI_MARCAJ_CANONIC",
  robots: "ANUNTURI_MARCAJ_ROBOTS",
} as const;

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
