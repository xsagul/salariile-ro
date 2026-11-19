// src/lib/vechime-munca.ts
// Calculator de vechime în muncă (ani, luni, zile) cu unificarea perioadelor suprapuse,
// gradația de vechime (Legea-cadru 153/2017, art. 10), pragurile de pensie (Legea 360/2023)
// și pragurile pentru ajutorul de șomaj (Legea 76/2002).

export const STAGIU_MINIM_PENSIE_ANI = 15;
export const STAGIU_COMPLET_PENSIE_ANI = 35;

export type PerioadaMunca = {
  /** Format ISO YYYY-MM-DD, inclusiv. */
  deLa: string;
  /** Format ISO YYYY-MM-DD, inclusiv. */
  panaLa: string;
};

export type GradatieVechime = {
  gradatie: number;
  interval: string;
  sporCumulat: string;
  aniUrmator: number | null;
};

export type RezultatVechime = {
  ani: number;
  luni: number;
  zile: number;
  zileTotale: number;
  perioadeValide: number;
  zileSuprapuseEliminate: number;
  gradatie: GradatieVechime;
  luniRamaseStagiuMinimPensie: number;
  luniRamaseStagiuCompletPensie: number;
  cotaSomajProcent: number;
};

const MS_ZI = 86_400_000;

function parseDataUtc(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const an = Number(m[1]);
  const luna = Number(m[2]);
  const zi = Number(m[3]);
  if (luna < 1 || luna > 12 || zi < 1 || zi > 31) return null;
  const t = Date.UTC(an, luna - 1, zi);
  const d = new Date(t);
  if (d.getUTCFullYear() !== an || d.getUTCMonth() !== luna - 1 || d.getUTCDate() !== zi) return null;
  return t;
}

/** Gradația de vechime din Legea-cadru nr. 153/2017, art. 10. */
export function gradatiePentruAni(ani: number): GradatieVechime {
  if (ani < 3) return { gradatie: 0, interval: "Sub 3 ani", sporCumulat: "0%", aniUrmator: 3 };
  if (ani < 5) return { gradatie: 1, interval: "3–5 ani", sporCumulat: "+7,5%", aniUrmator: 5 };
  if (ani < 10) return { gradatie: 2, interval: "5–10 ani", sporCumulat: "+12,88%", aniUrmator: 10 };
  if (ani < 15) return { gradatie: 3, interval: "10–15 ani", sporCumulat: "+18,52%", aniUrmator: 15 };
  if (ani < 20) return { gradatie: 4, interval: "15–20 ani", sporCumulat: "+21,48%", aniUrmator: 20 };
  return { gradatie: 5, interval: "Peste 20 de ani", sporCumulat: "+24,52%", aniUrmator: null };
}

function cotaSomajPentruAni(ani: number): number {
  if (ani >= 20) return 10;
  if (ani >= 10) return 7;
  if (ani >= 5) return 5;
  if (ani >= 3) return 3;
  return 0;
}

/**
 * Calculează diferența calendaristică exactă între două date UTC inclusive
 * (ex: 2020-01-01 până la 2020-12-31 = 1 an, 0 luni, 0 zile).
 */
function diferentaCalendaristicaInclusiva(startMs: number, endMs: number): { ani: number; luni: number; zile: number } {
  const start = new Date(startMs);
  // Adăugăm 1 zi pentru că intervalul de muncă este inclusiv la ambele capete.
  const endExclusiv = new Date(endMs + MS_ZI);

  let ani = endExclusiv.getUTCFullYear() - start.getUTCFullYear();
  let luni = endExclusiv.getUTCMonth() - start.getUTCMonth();
  let zile = endExclusiv.getUTCDate() - start.getUTCDate();

  if (zile < 0) {
    luni -= 1;
    // Zilele din luna precedentă datei endExclusiv.
    const zileLunaAnterioara = new Date(Date.UTC(endExclusiv.getUTCFullYear(), endExclusiv.getUTCMonth(), 0)).getUTCDate();
    zile += zileLunaAnterioara;
  }
  if (luni < 0) {
    ani -= 1;
    luni += 12;
  }

  return { ani, luni, zile };
}

export function calculeazaVechime(perioade: readonly PerioadaMunca[]): RezultatVechime | null {
  const intervale: { start: number; end: number }[] = [];
  let zileBruteInsummate = 0;

  for (const p of perioade) {
    const start = parseDataUtc(p.deLa);
    const end = parseDataUtc(p.panaLa);
    if (start === null || end === null || end < start) continue;
    intervale.push({ start, end });
    zileBruteInsummate += Math.round((end - start) / MS_ZI) + 1;
  }

  if (intervale.length === 0) return null;

  // Fuzionăm intervalele suprapuse sau adiacente (două contracte simultane nu dublează vechimea calendaristică).
  intervale.sort((a, b) => a.start - b.start || a.end - b.end);
  const fuzionate: { start: number; end: number }[] = [intervale[0]];
  for (let i = 1; i < intervale.length; i++) {
    const curent = intervale[i];
    const ultim = fuzionate[fuzionate.length - 1];
    if (curent.start <= ultim.end + MS_ZI) {
      ultim.end = Math.max(ultim.end, curent.end);
    } else {
      fuzionate.push({ ...curent });
    }
  }

  let zileTotale = 0;
  let totalAni = 0;
  let totalLuni = 0;
  let totalZile = 0;

  for (const itv of fuzionate) {
    zileTotale += Math.round((itv.end - itv.start) / MS_ZI) + 1;
    const d = diferentaCalendaristicaInclusiva(itv.start, itv.end);
    totalAni += d.ani;
    totalLuni += d.luni;
    totalZile += d.zile;
  }

  // Normalizăm la standardul de evidență a muncii (30 zile = 1 lună, 12 luni = 1 an) când se adună intervale separate.
  if (totalZile >= 30) {
    totalLuni += Math.floor(totalZile / 30);
    totalZile = totalZile % 30;
  }
  if (totalLuni >= 12) {
    totalAni += Math.floor(totalLuni / 12);
    totalLuni = totalLuni % 12;
  }

  const luniTotaleImplinite = totalAni * 12 + totalLuni;

  return {
    ani: totalAni,
    luni: totalLuni,
    zile: totalZile,
    zileTotale,
    perioadeValide: intervale.length,
    zileSuprapuseEliminate: Math.max(0, zileBruteInsummate - zileTotale),
    gradatie: gradatiePentruAni(totalAni),
    luniRamaseStagiuMinimPensie: Math.max(0, STAGIU_MINIM_PENSIE_ANI * 12 - luniTotaleImplinite),
    luniRamaseStagiuCompletPensie: Math.max(0, STAGIU_COMPLET_PENSIE_ANI * 12 - luniTotaleImplinite),
    cotaSomajProcent: cotaSomajPentruAni(totalAni),
  };
}
