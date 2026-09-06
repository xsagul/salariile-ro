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

// Codul Muncii art. 139; date pascale: Episcopia Ortodoxă Română din America,
// calendar 2025, tabelul „Data Sfintelor Paști până în anul 2027”.
export const SARBATORI_LEGALE_2027: Record<string,string> = {
  '1-1':'Anul Nou','1-2':'A doua zi de Anul Nou','1-6':'Bobotează','1-7':'Sfântul Ioan Botezătorul',
  '1-24':'Ziua Unirii Principatelor','4-30':'Vinerea Mare','5-1':'Ziua Muncii',
  '5-2':'Paștele (ortodox)','5-3':'A doua zi de Paște','6-1':'Ziua Copilului',
  '6-20':'Rusalii','6-21':'A doua zi de Rusalii','8-15':'Adormirea Maicii Domnului',
  '11-30':'Sfântul Andrei','12-1':'Ziua Națională','12-25':'Crăciunul','12-26':'A doua zi de Crăciun',
};
export function sarbatoriAn(an:number):Record<string,string> {
  if(an===2026)return SARBATORI_LEGALE_2026;
  if(an===2027)return SARBATORI_LEGALE_2027;
  throw new RangeError('Calendarul legal este documentat pentru 2026 și 2027.');
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
 * `luna0` e 0-indexată (0 = ianuarie). Sărbătorile sunt cunoscute doar pentru
 * 2026; pentru alți ani se numără doar zilele de luni–vineri.
 */
export function zileLucratoareLuna(an: number, luna0: number): number {
  const zileInLuna = new Date(Date.UTC(an, luna0 + 1, 0)).getUTCDate();
  let lucratoare = 0;
  for (let d = 1; d <= zileInLuna; d++) {
    const dow = new Date(Date.UTC(an, luna0, d)).getUTCDay(); // 0=Du … 6=Sâ
    const weekend = dow === 0 || dow === 6;
    const sarbatoare = (an === 2026 || an === 2027) && Boolean(sarbatoriAn(an)[`${luna0 + 1}-${d}`]);
    if (!weekend && !sarbatoare) lucratoare++;
  }
  return lucratoare;
}
