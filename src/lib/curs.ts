// src/lib/curs.ts
//
// Cursul de referinta EUR/RON. Proprietarul faptului: `src/data/curs-valutar.json`,
// generat de `scripts/curs-valutar.mjs` din cursul de referinta al Bancii
// Centrale Europene.
//
// Regula care nu se incalca: cursul NU intra in calculul salarial. Contributiile,
// plafoanele, deducerea personala si suma netaxabila sunt scrise in lege in lei,
// iar calculul se face in lei intotdeauna. Euro e un strat de afisare si de
// introducere a sumei — se converteste la intrare si la iesire, atat.
//
// Consecinta pe care pagina trebuie sa o spuna pe fata: sumele in euro sunt o
// conversie orientativa la un curs cu data cunoscuta, nu sume pe care le
// plateste cineva. Salariul, contributiile si fluturasul real sunt in lei.

import date from "@/data/curs-valutar.json";

export type Moneda = "RON" | "EUR";

export const CURS = date as {
  eurRon: number;
  data: string;
  generatLa: string;
  sursa: { nume: string; url: string; licenta: string };
};

export const EUR_RON = CURS.eurRon;
export const CURS_DATA = CURS.data;
export const CURS_SURSA = CURS.sursa;

/** Peste atatea zile cursul se considera vechi si se semnaleaza in interfata. */
export const ZILE_MAXIME = 30;

/** Cate zile are cursul fata de o data de referinta. */
export function vechimeCursZile(acum: Date = new Date()): number {
  return Math.floor((acum.getTime() - Date.parse(CURS_DATA)) / 86400000);
}

export function cursVechi(acum: Date = new Date()): boolean {
  return vechimeCursZile(acum) > ZILE_MAXIME;
}

/**
 * Lei → euro. Se rotunjeste la leu/euro intreg, ca peste tot in calculator:
 * sumele afisate sunt orientative, iar zecimalele ar sugera o precizie pe care
 * conversia nu o are.
 */
export function inEuro(lei: number): number {
  return Math.round(lei / EUR_RON);
}

/** Euro → lei. Folosit la intrare, cand utilizatorul tasteaza suma in euro. */
export function inLei(euro: number): number {
  return Math.round(euro * EUR_RON);
}

/** Conversie in moneda ceruta, pornind mereu de la lei. */
export function converteste(lei: number, moneda: Moneda): number {
  return moneda === "EUR" ? inEuro(lei) : Math.round(lei);
}

/** Data cursului, scrisa pentru cititor. */
export function cursFormatat(locale = "ro-RO"): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(CURS_DATA),
  );
}
