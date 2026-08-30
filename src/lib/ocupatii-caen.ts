// src/lib/ocupatii-caen.ts
//
// Intersectia activitate x ocupatie: „cat castiga un specialist IN servicii IT",
// nu „cat castiga toata lumea din IT" si nici „cat castiga specialistii din
// toata economia".
//
// De ce conteaza. Pana pe 31 august 2026 aratam pe fiecare pagina de meserie
// patru cifre — media sectorului, brutul sectorului, reperul grupei ISCO si
// reperul de inceput de cariera — pentru ca INS parea sa publice doar marginale.
// Nu era asa. FOM121A incruciseaza cele doua clasificari, iar celula comuna e
// mult mai apropiata de meserie decat oricare marginala:
//
//   programator, media sectorului IT ............ 22.689 brut
//   programator, reperul specialistilor ......... 14.122 brut
//   programator, INTERSECTIA .................... 18.565 brut
//
// Intersectia nu e media celor doua si nu se putea deduce din ele.
//
// CE NU REZOLVA. Tot nu e salariu pe ocupatie individuala. COR nu exista in
// TEMPO — verificat pe toate cele 1.916 matrice, fiecare matrice de salarii cu
// dimensiune ocupationala are exact 10 optiuni. Programatorul, testerul si
// devops-ul cad in aceeasi celula, pentru ca sunt statistic aceeasi categorie.
// Masurat: coliziunile scad de la 56% la 46%, nu la zero.

import date from "@/data/ins-ocupatii-caen.json";
import { calculStandard } from "@/lib/fiscal";
import { LUNA_REFERINTA, indexatLaZi, type GrupaIsco } from "@/lib/ins-date";

type Payload = {
  matrice: string;
  denumire: string;
  generatLa: string;
  nomenclatoare: {
    caen: string[];
    isco: string[];
    sexe: string[];
    proprietate: string[];
    ani: string[];
    masuri: string[];
  };
  celule: (number | null)[][][][][][];
};

const D = date as Payload;
const N = D.nomenclatoare;

/** Grupele noastre ISCO → eticheta din nomenclatorul INS. */
const ETICHETA_ISCO: Record<GrupaIsco, string> = {
  conducatori: "Membri ai corpului legislativ",
  specialisti: "Specialisti in diverse domenii",
  tehnicieni: "Tehnicieni si alti specialisti",
  functionari: "Functionari administrativi",
  servicii: "Lucratori in domeniul serviciilor",
  agricultura: "Lucratori calificati in agricultura",
  muncitori: "Muncitori calificati si asimilati",
  operatori: "Operatori la instalatii si masini",
  elementare: "Ocupatii elementare",
};

const AN = N.ani[N.ani.length - 1];
const iAn = N.ani.indexOf(AN);
const iVenit = N.masuri.indexOf("venitBrut");
const iSalariati = N.masuri.indexOf("salariati");
const iTotalProp = N.proprietate.indexOf("Total");
const iTotalSex = N.sexe.indexOf("Total");
const iMasculin = N.sexe.indexOf("Masculin");
const iFeminin = N.sexe.indexOf("Feminin");

/** Nomenclatorul e ierarhic mixt: sectiuni („Q  SANATATE") si diviziuni („62-63 …"). */
function indexCaen(cheie: string): number {
  return N.caen.findIndex((x) => {
    const e = x.trim();
    return e === cheie || e.startsWith(`${cheie} `);
  });
}
const indexIsco = (grupa: GrupaIsco) =>
  N.isco.findIndex((x) => x.startsWith(ETICHETA_ISCO[grupa]));

const celula = (masura: number, caen: number, isco: number, sex: number): number | null =>
  D.celule[iAn]?.[masura]?.[iTotalProp]?.[caen]?.[isco]?.[sex] ?? null;

export type Intersectie = {
  /** Brutul din ancheta, asa cum l-a publicat INS. */
  brutBaza: number;
  /** Acelasi brut, adus la luna de referinta a seriei lunare. */
  brut: number;
  /** Netul calculat din brutul indexat, in conditii standard. */
  net: number;
  /** Anul anchetei — se afiseaza, nu se ascunde. */
  an: string;
  luna: string;
  /** Cati salariati stau in spatele cifrei. Sub cateva mii, e fragila. */
  salariati: number | null;
  activitate: string;
  grupa: string;
  /** Diferenta pe sexe in aceeasi celula, cand INS o publica. */
  peSexe: { masculin: number; feminin: number; diferentaProcent: number } | null;
};

/**
 * Celula comuna pentru o meserie. `caenRev2` e cheia din catalogul de meserii —
 * FOM121A foloseste CAEN Rev.2, nu Rev.3 ca seria lunara.
 */
export function intersectie(caenRev2: string, grupa: GrupaIsco): Intersectie | null {
  const c = indexCaen(caenRev2);
  const i = indexIsco(grupa);
  if (c < 0 || i < 0) return null;

  const brutBaza = celula(iVenit, c, i, iTotalSex);
  if (brutBaza == null) return null;

  const brut = indexatLaZi(brutBaza);
  const net = calculStandard(brut)?.net;
  if (net == null) return null;

  const m = celula(iVenit, c, i, iMasculin);
  const f = celula(iVenit, c, i, iFeminin);

  return {
    brutBaza,
    brut,
    net,
    an: AN,
    luna: LUNA_REFERINTA,
    salariati: celula(iSalariati, c, i, iTotalSex),
    activitate: N.caen[c].trim(),
    grupa: N.isco[i].trim(),
    peSexe:
      m != null && f != null && m > 0
        ? { masculin: m, feminin: f, diferentaProcent: Math.round((100 * (m - f)) / m) }
        : null,
  };
}

export const SURSA_INTERSECTIE = {
  matrice: D.matrice,
  denumire: D.denumire,
  an: AN,
  generatLa: D.generatLa,
};
