// src/lib/sarbatori.ts
// Sărbătorile legale (Codul Muncii art. 139) — sursă unică, partajată de paginile
// /zile-libere-<an> și de generatorul de fluturaș PDF (zile lucrătoare).
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

// Codul Muncii art. 139; date pascale: Episcopia Ortodoxă Română din America,
// calendar 2025, tabelul „Data Sfintelor Paști până în anul 2027”.
export const SARBATORI_LEGALE_2027: Record<string,string> = {
  '1-1':'Anul Nou','1-2':'A doua zi de Anul Nou','1-6':'Bobotează','1-7':'Sfântul Ioan Botezătorul',
  '1-24':'Ziua Unirii Principatelor','4-30':'Vinerea Mare','5-1':'Ziua Muncii',
  '5-2':'Paștele (ortodox)','5-3':'A doua zi de Paște','6-1':'Ziua Copilului',
  '6-20':'Rusalii','6-21':'A doua zi de Rusalii','8-15':'Adormirea Maicii Domnului',
  '11-30':'Sfântul Andrei','12-1':'Ziua Națională','12-25':'Crăciunul','12-26':'A doua zi de Crăciun',
};
// Anii cu pagină de zile libere (cerut de proprietar pe 25 septembrie 2026, după
// zileliberelegale.ro, care are file pe ani). 2026 și 2027 au listele verificate
// mai sus; ceilalți se calculează din Codul Muncii, art. 139, în vigoare, și din
// data Paștelui ortodox. `scripts/test-calendar.mts` cere ca listele calculate
// pentru 2026 și 2027 să fie identice cu cele verificate.
export const ANI_CALENDAR = [2026, 2027, 2028, 2029, 2030, 2031] as const;

const ZI_MS = 86_400_000;

/** Duminica Paștelui ortodox, ca moment UTC. Calculul iulian (Meeus), plus 13 zile până la calendarul gregorian, valabil 1900–2099. */
export function pasteOrtodox(an: number): number {
  const d = (19 * (an % 19) + 15) % 30;
  const e = (2 * (an % 4) + 4 * (an % 7) - d + 34) % 7;
  const luna = Math.floor((d + e + 114) / 31);
  const zi = ((d + e + 114) % 31) + 1;
  return Date.UTC(an, luna - 1, zi) + 13 * ZI_MS;
}

/** Sărbătorile legale ale unui an după Codul Muncii, art. 139, în ordinea zilelor. */
export function sarbatoriCalculate(an: number): Record<string, string> {
  const paste = pasteOrtodox(an);
  const cheie = (t: number) => `${new Date(t).getUTCMonth() + 1}-${new Date(t).getUTCDate()}`;
  // Întâi sărbătorile mobile, apoi cele fixe: când două cad în aceeași zi (1 iunie 2026),
  // numele se leagă în ordinea asta, ca în lista verificată.
  const lista: [string, string][] = [
    [cheie(paste - 2 * ZI_MS), "Vinerea Mare"],
    [cheie(paste), "Paștele (ortodox)"],
    [cheie(paste + ZI_MS), "A doua zi de Paște"],
    [cheie(paste + 49 * ZI_MS), "Rusalii"],
    [cheie(paste + 50 * ZI_MS), "A doua zi de Rusalii"],
    ["1-1", "Anul Nou"], ["1-2", "A doua zi de Anul Nou"], ["1-6", "Bobotează"], ["1-7", "Sfântul Ioan Botezătorul"],
    ["1-24", "Ziua Unirii Principatelor"], ["5-1", "Ziua Muncii"], ["6-1", "Ziua Copilului"],
    ["8-15", "Adormirea Maicii Domnului"], ["11-30", "Sfântul Andrei"], ["12-1", "Ziua Națională"],
    ["12-25", "Crăciunul"], ["12-26", "A doua zi de Crăciun"],
  ];
  const zile = new Map<string, string>();
  for (const [k, nume] of lista) zile.set(k, zile.has(k) ? `${zile.get(k)} / ${nume}` : nume);
  const t = (k: string) => { const [m, d] = k.split("-").map(Number); return Date.UTC(an, m - 1, d); };
  return Object.fromEntries([...zile].sort(([a], [b]) => t(a) - t(b)));
}

export function sarbatoriAn(an:number):Record<string,string> {
  if(an===2026)return SARBATORI_LEGALE_2026;
  if(an===2027)return SARBATORI_LEGALE_2027;
  if((ANI_CALENDAR as readonly number[]).includes(an))return sarbatoriCalculate(an);
  throw new RangeError(`Calendarul legal este publicat pentru ${ANI_CALENDAR[0]}–${ANI_CALENDAR[ANI_CALENDAR.length-1]}.`);
}

/** Capetele intervalului sunt incluse; calcul în UTC, fără deplasări DST. */
export function zileLucratoareInterval(start:string,end:string) {
  const valid=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s;
  if(!valid(start)||!valid(end)||start>end)throw new RangeError('Alege un interval valid, cu data de început înaintea datei de sfârșit.');
  if(start<'2026-01-01'||end>'2027-12-31')throw new RangeError('Alege date din 2026 sau 2027.');
  let lucratoare=0,calendaristice=0;
  for(let t=Date.parse(start);t<=Date.parse(end);t+=86400000){
    const d=new Date(t);calendaristice++;
    if(d.getUTCDay()!==0&&d.getUTCDay()!==6&&!sarbatoriAn(d.getUTCFullYear())[`${d.getUTCMonth()+1}-${d.getUTCDate()}`])lucratoare++;
  }
  return {lucratoare,calendaristice,ore:lucratoare*8};
}

/**
 * Zilele lucrătoare dintr-o lună (luni–vineri, minus sărbătorile legale).
 * `luna0` e 0-indexată (0 = ianuarie). Sărbătorile sunt cunoscute pentru
 * ANI_CALENDAR; pentru alți ani se numără doar zilele de luni–vineri.
 */
export function zileLucratoareLuna(an: number, luna0: number): number {
  const zileInLuna = new Date(Date.UTC(an, luna0 + 1, 0)).getUTCDate();
  let lucratoare = 0;
  for (let d = 1; d <= zileInLuna; d++) {
    const dow = new Date(Date.UTC(an, luna0, d)).getUTCDay(); // 0=Du … 6=Sâ
    const weekend = dow === 0 || dow === 6;
    const sarbatoare = (ANI_CALENDAR as readonly number[]).includes(an) && Boolean(sarbatoriAn(an)[`${luna0 + 1}-${d}`]);
    if (!weekend && !sarbatoare) lucratoare++;
  }
  return lucratoare;
}
