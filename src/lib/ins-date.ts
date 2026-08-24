// src/lib/ins-date.ts
// Acces tipat peste `src/data/ins-caen.json`, fisierul produs de
// `npm run ins:tempo` din TEMPO-Online (INS).
//
// Trei seturi, cu roluri diferite si perioade de referinta diferite — nu se
// amesteca niciodata intr-o singura cifra:
//   1. serie lunara pe activitati CAEN Rev.3 (brut si net), cea mai proaspata;
//   2. serie anuala pe activitati CAEN Rev.2 x judete, pentru harta salariala;
//   3. ancheta din octombrie pe grupe majore de ocupatii ISCO-08 x varste.
//
// Sursa se citeaza pe fiecare pagina: INS, matricea si perioada.

import dateInsBrute from "@/data/ins-caen.json";
import { DENUMIRI_CAEN, DENUMIRI_JUDETE } from "@/lib/caen-denumiri";

type SerieLunara = {
  matrice: string;
  denumire: string;
  ultimaActualizare: string;
  luni: string[];
  activitati: { caen: string; valori: (number | null)[] }[];
};

type SerieJudete = {
  matrice: string;
  denumire: string;
  ultimaActualizare: string;
  an: string;
  activitati: { caen: string; national: number | null; valori: Record<string, number | null> }[];
};

type SerieOcupatii = {
  matrice: string;
  denumire: string;
  ultimaActualizare: string;
  an: string;
  grupe: {
    isco: string;
    varste: Record<string, { salariati?: number | null; salariuDeBaza?: number | null; venitBrut?: number | null }>;
  }[];
};

type DateIns = {
  generatLa: string;
  sursa: { nume: string; url: string; licenta: string };
  brut: SerieLunara;
  net: SerieLunara;
  judete: SerieJudete;
  ocupatii: SerieOcupatii;
};

const date = dateInsBrute as DateIns;

export const INS_SURSA = date.sursa;
export const INS_GENERAT_LA = date.generatLa;

/** Cheia unei activitati = primul token din eticheta INS: „62", „38-39", „Q". */
function cheieActivitate(eticheta: string): string {
  return eticheta.trim().split(/\s+/)[0];
}

// ─── Serii lunare nationale (CAEN Rev.3) ─────────────────────────────────────

export const LUNI_SERIE = date.brut.luni;
export const LUNA_REFERINTA = LUNI_SERIE[LUNI_SERIE.length - 1];
export const MATRICE_BRUT = date.brut.matrice;
export const MATRICE_NET = date.net.matrice;
export const MATRICE_JUDETE = date.judete.matrice;
export const MATRICE_OCUPATII = date.ocupatii.matrice;
export const AN_JUDETE = date.judete.an;
export const AN_OCUPATII = date.ocupatii.an;

const indexBrut = new Map(date.brut.activitati.map((a) => [cheieActivitate(a.caen), a]));
const indexNet = new Map(date.net.activitati.map((a) => [cheieActivitate(a.caen), a]));
const indexJudete = new Map(date.judete.activitati.map((a) => [cheieActivitate(a.caen), a]));

export type ActivitateCaen = {
  cheie: string;
  eticheta: string;
  /** Denumirea fara prefixul de cod, cu prima litera mare. */
  denumire: string;
  brut: (number | null)[];
  net: (number | null)[];
  brutCurent: number;
  netCurent: number | null;
};

function denumireDinEticheta(cheie: string, eticheta: string): string {
  // Denumirea redactionala are prioritate: nomenclatorul INS e fara diacritice
  // si scris administrativ. Eticheta originala ramane disponibila in `eticheta`
  // si e cea citata in nota de sursa.
  const redactionala = DENUMIRI_CAEN[cheie];
  if (redactionala) return redactionala;

  const rest = eticheta.trim().replace(/^\S+\s*/, "").trim();
  if (!rest) return eticheta.trim();
  // Sectiunile vin cu majuscule („INDUSTRIA PRELUCRATOARE"); le aducem la
  // capitalizare normala ca sa nu tipe in pagina.
  const esteMajuscule = rest === rest.toLocaleUpperCase("ro-RO");
  const text = esteMajuscule ? rest.toLocaleLowerCase("ro-RO") : rest;
  return text.charAt(0).toLocaleUpperCase("ro-RO") + text.slice(1);
}

export function activitate(cheie: string): ActivitateCaen | null {
  const brut = indexBrut.get(cheie);
  if (!brut) return null;
  const net = indexNet.get(cheie);
  const brutCurent = [...brut.valori].reverse().find((v): v is number => v !== null);
  if (brutCurent === undefined) return null;
  const netCurent = net ? ([...net.valori].reverse().find((v): v is number => v !== null) ?? null) : null;
  return {
    cheie,
    eticheta: brut.caen,
    denumire: denumireDinEticheta(cheie, brut.caen),
    brut: brut.valori,
    net: net?.valori ?? [],
    brutCurent,
    netCurent,
  };
}

export function activitateSauEroare(cheie: string): ActivitateCaen {
  const rezultat = activitate(cheie);
  if (!rezultat) throw new Error(`Activitatea CAEN Rev.3 „${cheie}" lipseste din datele INS.`);
  return rezultat;
}

/** Media pe economie, luna de referinta. */
export const TOTAL_ECONOMIE = activitateSauEroare("TOTAL");

/** Toate activitatile, in ordinea din nomenclatorul INS. */
export function toateActivitatile(): ActivitateCaen[] {
  return date.brut.activitati
    .map((a) => activitate(cheieActivitate(a.caen)))
    .filter((a): a is ActivitateCaen => a !== null);
}

/** Variatia procentuala fata de aceeasi luna a anului trecut, daca exista. */
export function variatieAnuala(serie: (number | null)[]): number | null {
  const ultimul = serie.length - 1;
  const acum = serie[ultimul];
  const anTrecut = serie[ultimul - 12];
  if (acum === null || acum === undefined || anTrecut === null || anTrecut === undefined) return null;
  return (acum - anTrecut) / anTrecut;
}

// ─── Judete (CAEN Rev.2, ultimul an disponibil) ──────────────────────────────

export type ValoareJudet = { judet: string; slug: string; brut: number };

export function judetePentru(cheieRev2: string): ValoareJudet[] {
  const activitate = indexJudete.get(cheieRev2);
  if (!activitate) return [];
  return Object.entries(activitate.valori)
    .filter((pereche): pereche is [string, number] => pereche[1] !== null)
    .map(([judet, brut]) => ({ judet: DENUMIRI_JUDETE[judet] ?? judet, slug: slugJudet(judet), brut }))
    .sort((a, b) => b.brut - a.brut);
}

/** Valoarea nationala a ACELEIASI serii anuale — singura baza corecta pentru
 *  abaterea unui judet. Seria lunara pe CAEN Rev.3 e alt an si alta
 *  clasificare, deci nu se foloseste aici. */
export function nationalJudete(cheieRev2: string): number | null {
  return indexJudete.get(cheieRev2)?.national ?? null;
}

export function etichetaJudete(cheieRev2: string): string | null {
  return indexJudete.get(cheieRev2)?.caen ?? null;
}

// ─── Grupe majore de ocupatii (ISCO-08, ancheta din octombrie) ───────────────

export const GRUPE_ISCO = {
  conducatori: "Membri ai corpului legislativ, ai executivului, inalti conducatori ai administratiei publice, conducatori si functionari superiori",
  specialisti: "Specialisti in diverse domenii de activitate",
  tehnicieni: "Tehnicieni si alti specialisti din domeniul tehnic",
  functionari: "Functionari administrativi",
  servicii: "Lucratori in domeniul serviciilor",
  agricultura: "Lucratori calificati in agricultura, silvicultura si pescuit",
  muncitori: "Muncitori calificati si asimilati",
  operatori: "Operatori la instalatii si masini; asamblori de masini si echipamente",
  elementare: "Ocupatii elementare",
} as const;

export type GrupaIsco = keyof typeof GRUPE_ISCO;

/** Denumirile scurte, folosite in pagina (cele INS sunt prea lungi). */
export const NUME_GRUPE_ISCO: Record<GrupaIsco, string> = {
  conducatori: "Conducători și funcționari superiori",
  specialisti: "Specialiști în diverse domenii de activitate",
  tehnicieni: "Tehnicieni și alți specialiști din domeniul tehnic",
  functionari: "Funcționari administrativi",
  servicii: "Lucrători în domeniul serviciilor",
  agricultura: "Lucrători calificați în agricultură și silvicultură",
  muncitori: "Muncitori calificați și asimilați",
  operatori: "Operatori la instalații și mașini",
  elementare: "Ocupații elementare",
};

const indexIsco = new Map(date.ocupatii.grupe.map((g) => [g.isco, g]));

export type PragVarsta = { varsta: string; venitBrut: number; salariuDeBaza: number | null; salariati: number | null };

export type DateGrupaIsco = {
  grupa: GrupaIsco;
  nume: string;
  venitBrutTotal: number;
  salariuDeBazaTotal: number | null;
  salariati: number | null;
  varste: PragVarsta[];
};

const ORDINE_VARSTE = [
  "15-19 ani",
  "20-24 ani",
  "25-29 ani",
  "30-34 ani",
  "35-39 ani",
  "40-44 ani",
  "45-49 ani",
  "50-54 ani",
  "55-59 ani",
  "60-64 ani",
  "65 de ani si peste",
];

export function grupaIsco(grupa: GrupaIsco): DateGrupaIsco | null {
  const brut = indexIsco.get(GRUPE_ISCO[grupa]);
  const total = brut?.varste["Total"];
  if (!brut || !total?.venitBrut) return null;
  return {
    grupa,
    nume: NUME_GRUPE_ISCO[grupa],
    venitBrutTotal: total.venitBrut,
    salariuDeBazaTotal: total.salariuDeBaza ?? null,
    salariati: total.salariati ?? null,
    varste: ORDINE_VARSTE.map((varsta) => {
      const valori = brut.varste[varsta];
      if (!valori?.venitBrut) return null;
      return {
        varsta: varsta.replace("65 de ani si peste", "65+ ani"),
        venitBrut: valori.venitBrut,
        salariuDeBaza: valori.salariuDeBaza ?? null,
        salariati: valori.salariati ?? null,
      };
    }).filter((v): v is PragVarsta => v !== null),
  };
}

/** Media pe toate ocupatiile din ancheta din octombrie (referinta de comparatie). */
export function totalOcupatii(): { venitBrut: number; salariuDeBaza: number | null; salariati: number | null } | null {
  const total = indexIsco.get("Total")?.varste["Total"];
  if (!total?.venitBrut) return null;
  return {
    venitBrut: total.venitBrut,
    salariuDeBaza: total.salariuDeBaza ?? null,
    salariati: total.salariati ?? null,
  };
}

// ─── Punerea celor doua serii pe aceeasi perioada ────────────────────────────
//
// Seria pe activitati CAEN e lunara si proaspata; ancheta pe ocupatii ISCO e
// anuala si din octombrie, deci mai veche cu peste un an. Cele doua cifre NU se
// pot pune in acelasi interval asa cum vin: ar amesteca doua momente diferite.
//
// Le aducem la aceeasi luna inmultind valorile ISCO cu raportul dintre media pe
// economie de acum si media pe economie din ancheta. Ipoteza, declarata explicit
// in pagina: grupele de ocupatii au crescut in acelasi ritm cu economia. Nu e o
// masuratoare, e o indexare — de aceea valorile indexate se eticheteaza mereu
// „estimare", niciodata „conform INS".

/** Cat a crescut media pe economie intre ancheta pe ocupatii si luna curenta. */
export const FACTOR_INDEXARE_OCUPATII: number | null = (() => {
  const ancheta = indexIsco.get("Total")?.varste["Total"]?.venitBrut;
  if (!ancheta) return null;
  return TOTAL_ECONOMIE.brutCurent / ancheta;
})();

/** O valoare din ancheta pe ocupatii, adusa la luna de referinta a seriei lunare. */
export function indexatLaZi(valoare: number): number {
  if (!FACTOR_INDEXARE_OCUPATII) return valoare;
  return Math.round(valoare * FACTOR_INDEXARE_OCUPATII);
}

// ─── Perspectiva inversa: un judet, toate activitatile lui ───────────────────
//
// `judetePentru` raspunde la „cum arata activitatea X pe judete". Aici raspundem
// la intrebarea cealalta, pe care o pune cine cauta „salariu mediu in Cluj":
// cum arata judetul Y pe toate activitatile.
//
// Seria e ANUALA si pe CAEN Rev.2, deci e mai veche decat seria lunara — INS nu
// publica defalcare pe judete lunar. Paginile trebuie sa spuna anul la vedere.

export type Judet = {
  slug: string;
  /** Numele cu diacritice, asa cum il afisam. */
  nume: string;
  /** Castigul mediu brut al judetului, randul TOTAL din seria anuala. */
  brut: number;
};

/** „Municipiul Bucuresti" → „bucuresti"; „Bistrita-Nasaud" → „bistrita-nasaud". */
export function slugJudet(nume: string): string {
  return nume
    .replace(/^Municipiul\s+/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[șş]/gi, "s")
    .replace(/[țţ]/gi, "t")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const randTotalJudete = date.judete.activitati.find((a) => cheieActivitate(a.caen) === "TOTAL");

/** Toate judetele, ordonate descrescator dupa castigul mediu brut. */
export const JUDETE: Judet[] = randTotalJudete
  ? Object.entries(randTotalJudete.valori)
      .filter((pereche): pereche is [string, number] => pereche[1] !== null)
      .map(([brutNume, brut]) => ({
        slug: slugJudet(brutNume),
        nume: DENUMIRI_JUDETE[brutNume] ?? brutNume.replace(/^Municipiul\s+/i, ""),
        brut,
      }))
      .sort((a, b) => b.brut - a.brut)
  : [];

const indexJudetDupaSlug = new Map(JUDETE.map((j) => [j.slug, j]));
/** Cheia din nomenclatorul INS, de care avem nevoie ca sa citim valorile. */
const numeInsDupaSlug = new Map(
  randTotalJudete ? Object.keys(randTotalJudete.valori).map((nume) => [slugJudet(nume), nume]) : [],
);

export function getJudet(slug: string): Judet | undefined {
  return indexJudetDupaSlug.get(slug);
}

/** Media nationala a seriei anuale — singura baza corecta de comparatie. */
export const NATIONAL_JUDETE: number | null = randTotalJudete?.national ?? null;

export type ActivitateInJudet = {
  cheie: string;
  denumire: string;
  brut: number;
  /** Valoarea nationala a ACELEIASI activitati, din acelasi an. */
  national: number | null;
};

/** Toate activitatile cu valoare in judetul dat, ordonate descrescator. */
export function activitatiInJudet(slug: string): ActivitateInJudet[] {
  const numeIns = numeInsDupaSlug.get(slug);
  if (!numeIns) return [];
  return date.judete.activitati
    .filter((a) => cheieActivitate(a.caen) !== "TOTAL")
    .map((a) => {
      const brut = a.valori[numeIns];
      if (brut === null || brut === undefined) return null;
      const cheie = cheieActivitate(a.caen);
      return { cheie, denumire: denumireDinEticheta(cheie, a.caen), brut, national: a.national };
    })
    .filter((a): a is ActivitateInJudet => a !== null)
    .sort((a, b) => b.brut - a.brut);
}
