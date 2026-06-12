// src/lib/sarbatori.ts
// Sărbătorile legale 2026 (Codul Muncii art. 139) — sursă unică, partajată de
// pagina /zile-libere-2026 și de generatorul de fluturaș PDF (zile lucrătoare).
// Cheia e "lună-zi" (lună 1–12).

export const SARBATORI_LEGALE_2026: Record<string, string> = {
  "1-1": "Anul Nou",
  "1-2": "A doua zi de Anul Nou",
  "1-6": "Bobotează",
  "1-7": "Sfântul Ioan Botezătorul",
  "1-24": "Ziua Unirii Principatelor",
  "4-10": "Vinerea Mare",
  "4-12": "Paștele (ortodox)",
  "4-13": "A doua zi de Paște",
  "5-1": "Ziua Muncii",
  "5-31": "Rusalii",
  "6-1": "A doua zi de Rusalii / Ziua Copilului",
  "8-15": "Adormirea Maicii Domnului",
  "11-30": "Sfântul Andrei",
  "12-1": "Ziua Națională",
  "12-25": "Crăciunul",
  "12-26": "A doua zi de Crăciun",
};

/**
 * Zilele lucrătoare dintr-o lună (luni–vineri, minus sărbătorile legale).
 * `luna0` e 0-indexată (0 = ianuarie). Sărbătorile sunt cunoscute doar pentru
 * 2026; pentru alți ani se numără doar zilele de luni–vineri.
 */
export function zileLucratoareLuna(an: number, luna0: number): number {
  const zileInLuna = new Date(Date.UTC(an, luna0 + 1, 0)).getUTCDate();
  let lucratoare = 0;
  for (let d = 1; d <= zileInLuna; d++) {
    const dow = new Date(Date.UTC(an, luna0, d)).getUTCDay(); // 0=Du … 6=Sâ
    const weekend = dow === 0 || dow === 6;
    const sarbatoare = an === 2026 && Boolean(SARBATORI_LEGALE_2026[`${luna0 + 1}-${d}`]);
    if (!weekend && !sarbatoare) lucratoare++;
  }
  return lucratoare;
}
