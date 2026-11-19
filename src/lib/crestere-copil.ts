// src/lib/crestere-copil.ts
// Indemnizația de creștere a copilului (ICC) și stimulentul de inserție în 2026:
//   - OUG nr. 111/2010 (art. 2, art. 5, art. 7, art. 11)
//   - Legea nr. 141/2025 (reținerea CASS 10% la sursă)

import { CASS_PROCENT } from "@/lib/fiscal";

/** Procentul legal aplicat mediei veniturilor nete din ultimele 12 luni (OUG 111/2010, art. 2 alin. 2). */
export const COTA_ICC = 0.85;

/** Pragul minim brut lunar în 2026: 2,5 × ISR, valoare comunicată de ANPIS (1.651 lei). */
export const MINIM_ICC_BRUT = 1651;

/** Plafonul maxim brut lunar pentru indemnizația de bază (OUG 111/2010, art. 2 alin. 2). */
export const MAXIM_ICC_BRUT = 8500;

/** Stimulent de inserție dacă părintele revine la muncă înainte ca copilul să împlinească 6 luni. */
export const STIMULENT_SUB_6_LUNI = 1500;

/** Stimulent de inserție pentru revenirea după 6 luni (până la 3 ani, respectiv 4 ani pentru copil cu handicap). */
export const STIMULENT_DUPA_6_LUNI = 650;

/** Minimum de luni netransferabile rezervate celuilalt părinte (OUG 111/2010, art. 11). */
export const LUNI_CELALALT_PARINTE = 2;

export const TEMEI_ICC = {
  baza: "OUG nr. 111/2010, art. 2 alin. (2)",
  multiplu: "OUG nr. 111/2010, art. 5",
  stimulent: "OUG nr. 111/2010, art. 7",
  celalaltParinte: "OUG nr. 111/2010, art. 11",
  cass: "Legea nr. 141/2025 (CASS 10%)",
  impozit: "Codul Fiscal, art. 62 (scutit de impozit)",
} as const;

export const URL_OUG_111 = "https://legislatie.just.ro/Public/DetaliiDocument/124564";

export type IntrareCrestereCopil = {
  /** Media veniturilor nete lunare realizate în cele 12 luni eligibile din ultimii 2 ani. */
  mediaNeta12Luni: number;
  /** Numărul de copii proveniți din aceeași naștere (1 = un copil, 2 = gemeni, 3 = tripleți). */
  numarCopii?: number;
  /** True pentru copil încadrat în grad de handicap (durată până la 3 ani). */
  copilCuHandicap?: boolean;
};

export type RezultatCrestereCopil = {
  mediaNeta12Luni: number;
  brutNecorectat: number;
  /** Indemnizația brută de bază (pentru primul copil), încadrată între 1.651 și 8.500 lei. */
  brutBaza: number;
  plafonatMinim: boolean;
  plafonatMaxim: boolean;
  numarCopii: number;
  /** Majorarea totală brută pentru copiii suplimentari (gemeni/tripleți), art. 5 OUG 111/2010. */
  suplimentMultipluBrut: number;
  brutTotal: number;
  /** CASS 10% reținut la sursă de AJPIS. */
  cass: number;
  /** Suma netă lunară încasată efectiv pe card. */
  netLunar: number;
  durataAni: number;
  luniCelalaltParinte: number;
};

export function calculeazaCrestereCopil(input: IntrareCrestereCopil): RezultatCrestereCopil | null {
  const media = Number(input.mediaNeta12Luni);
  const numarCopii = Math.max(1, Math.min(5, Math.round(Number(input.numarCopii ?? 1))));
  if (!Number.isFinite(media) || media < 0) return null;

  const brutNecorectat = Math.round(media * COTA_ICC);
  const plafonatMinim = brutNecorectat < MINIM_ICC_BRUT;
  const plafonatMaxim = brutNecorectat > MAXIM_ICC_BRUT;
  const brutBaza = Math.min(MAXIM_ICC_BRUT, Math.max(MINIM_ICC_BRUT, brutNecorectat));

  // Art. 5 OUG 111/2010: +50% din indemnizația cuvenită pentru fiecare copil începând cu al doilea,
  // dar nu mai puțin decât valoarea minimă legală (1.651 lei).
  const suplimentPerCopil = numarCopii > 1 ? Math.max(MINIM_ICC_BRUT, Math.round(brutBaza * 0.5)) : 0;
  const suplimentMultipluBrut = (numarCopii - 1) * suplimentPerCopil;
  const brutTotal = brutBaza + suplimentMultipluBrut;

  const cass = Math.round(brutTotal * CASS_PROCENT);
  const netLunar = brutTotal - cass;
  const durataAni = input.copilCuHandicap ? 3 : 2;

  return {
    mediaNeta12Luni: media,
    brutNecorectat,
    brutBaza,
    plafonatMinim,
    plafonatMaxim,
    numarCopii,
    suplimentMultipluBrut,
    brutTotal,
    cass,
    netLunar,
    durataAni,
    luniCelalaltParinte: LUNI_CELALALT_PARINTE,
  };
}
