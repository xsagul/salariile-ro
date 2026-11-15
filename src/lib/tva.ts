// src/lib/tva.ts
//
// Taxa pe valoarea adăugată: cotele în vigoare și cele două calcule pe care le
// cere omul care caută „calculator TVA” — pune TVA peste un preț sau scoate TVA
// dintr-un preț care o conține deja. Fișierul acesta este proprietarul cotelor
// de TVA de pe site; nicio pagină nu le rescrie de mână.
//
// De ce există pagina, măsurat pe 15 noiembrie 2026 (SE Ranking, România):
// „calculator tva” 18.100 de căutări pe lună, „calcul tva” 5.700, iar prima
// pagină din Google e ținută de un ERP, un site de cărți agricole, aplicații de
// telefon și un exemplu de curs universitar. Cifrele și concurența: PROGRES.md.
//
// ─── Temeiul, citit din Codul fiscal consolidat pe 15 noiembrie 2026 ────────
// (legislatie.just.ro, forma care cuprinde Legea 199 din 15 octombrie 2026)
//
//   art. 291 alin. (1)  cota standard: „nivelul acesteia este 21%”, de la
//                       1 august 2025 (Legea 141/2025, M. Of. 699/25.07.2025);
//   art. 291 alin. (2)  „Cota redusă de 11%” pentru lista de la lit. a)–o);
//   art. 291 alin. (3)  abrogat de la 1 august 2025: cotele de 9% și 5% nu mai
//                       există în articol;
//   Legea 161/2026      cota de 9% la o singură locuință s-a aplicat până la
//                       30 septembrie 2026 inclusiv, deci nu mai e în vigoare;
//   art. 310 alin. (1)  plafonul de scutire pentru întreprinderile mici:
//                       395.000 lei, de la 1 septembrie 2025 (OG 22/2025).
//
// Regula proprietarului e „numai legislație în vigoare”: de aceea calculatorul
// oferă 21% și 11%, iar orice altă cotă (o factură veche, altă țară) se scrie
// de mână, fără ca pagina să afirme ceva despre ea.
//
// ─── Aritmetica, în bani întregi ────────────────────────────────────────────
//
// Sumele se țin în bani (întregi), iar cota în sutimi de procent (21% = 2100).
// În virgulă mobilă, 0,21 nu există exact, iar un calcul ca 0,50 × 0,21 poate
// cădea de partea greșită a jumătății de ban. Cu întregi, rotunjirea la ban e
// mereu cea de la școală: jumătatea urcă.
//
//   adaugă:  TVA = preț fără TVA × cotă
//   scoate:  TVA = preț cu TVA × cotă ÷ (100 + cotă)      (21 din 121)
//
// La „scoate”, prețul fără TVA e diferența, nu o a doua rotunjire: așa cele
// două sume se adună mereu exact la prețul scris de om.

export const COTA_STANDARD_PROCENT = 21;
export const COTA_REDUSA_PROCENT = 11;

/** Cifra de afaceri anuală până la care o firmă mică poate rămâne neplătitoare de TVA. */
export const PLAFON_SCUTIRE_LEI = 395_000;

/** Forma consolidată din care au fost citite articolele de mai sus. */
export const URL_COD_FISCAL = "https://legislatie.just.ro/Public/DetaliiDocumentAfis/315385";

/** Peste atât, produsul sumă × cotă nu mai e un întreg exact în JavaScript. */
export const SUMA_MAXIMA_BANI = 99_999_999_999;

export type DirectieTva = "adauga" | "scoate";

export type RezultatTva = {
  /** Toate sumele sunt în bani. `faraTva + tva === cuTva`, întotdeauna. */
  faraTva: number;
  tva: number;
  cuTva: number;
  /** Cota aplicată, în sutimi de procent: 2100 înseamnă 21%. */
  cotaSutimi: number;
};

const curata = (text: string) => text.replace(/[\s  ]/g, "").replace(/(lei|ron)$/i, "");

/**
 * Citește o sumă scrisă de om și o întoarce în bani, sau `null` dacă nu e o
 * sumă pozitivă.
 *
 * Oamenii scriu la fel de des „1.234,56”, „1234,56” și „1234.56”, iar un câmp
 * de tip număr acceptă numai una dintre forme, după limba telefonului. Regulile:
 *  - cu virgulă și punct, ultimul semn e cel zecimal;
 *  - o singură virgulă e zecimală, cum se scrie în română (7,459 lei pe litru);
 *  - un singur punct urmat de exact trei cifre desparte miile (1.234 = o mie
 *    două sute treizeci și patru); altfel e zecimal (49.99);
 *  - mai multe semne de același fel despart miile.
 * A treia zecimală rotunjește banul, jumătatea în sus.
 */
export function citesteSuma(text: string): number | null {
  const t = curata(text);
  if (!/^\d[\d.,]*$/.test(t)) return null;

  const virgule = (t.match(/,/g) ?? []).length;
  const puncte = (t.match(/\./g) ?? []).length;
  let zecimal: "," | "." | null = null;

  if (virgule && puncte) {
    zecimal = t.lastIndexOf(",") > t.lastIndexOf(".") ? "," : ".";
    // Semnul zecimal apare o singură dată; altfel nu e o sumă.
    if ((zecimal === "," ? virgule : puncte) > 1) return null;
  } else if (virgule === 1) {
    zecimal = ",";
  } else if (puncte === 1) {
    const [intreg, rest] = t.split(".");
    const desparteMiile = rest.length === 3 && intreg.length <= 3 && intreg[0] !== "0";
    zecimal = desparteMiile ? null : ".";
  }

  const [parteIntreaga, parteZecimala = ""] = zecimal ? t.split(zecimal) : [t];
  const intreg = parteIntreaga.replace(/[.,]/g, "");
  if (!/^\d+$/.test(intreg) || !/^\d*$/.test(parteZecimala)) return null;

  const treiZecimale = Number((parteZecimala + "000").slice(0, 3));
  const bani = Number(intreg) * 100 + Math.floor((treiZecimale + 5) / 10);
  if (!Number.isSafeInteger(bani) || bani <= 0 || bani > SUMA_MAXIMA_BANI) return null;
  return bani;
}

/**
 * Citește o cotă scrisă de om („9”, „9,5”, „19%”) și o întoarce în sutimi de
 * procent, sau `null` dacă nu e între 0 și 100.
 */
export function citesteCota(text: string): number | null {
  const t = text.replace(/[\s  %]/g, "").replace(",", ".");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(t)) return null;
  const sutimi = Math.round(Number(t) * 100);
  if (sutimi <= 0 || sutimi > 10_000) return null;
  return sutimi;
}

/** Împărțire de întregi pozitivi, rotunjită la cel mai apropiat întreg; jumătatea urcă. */
const imparteRotunjit = (numarator: number, numitor: number) =>
  Math.floor((2 * numarator + numitor) / (2 * numitor));

export function calculeazaTva(input: {
  /** Suma scrisă de om, în bani. */
  sumaBani: number;
  /** Cota, în sutimi de procent: 2100 pentru 21%. */
  cotaSutimi: number;
  directie: DirectieTva;
}): RezultatTva | null {
  const { sumaBani, cotaSutimi, directie } = input;
  if (!Number.isSafeInteger(sumaBani) || sumaBani <= 0 || sumaBani > SUMA_MAXIMA_BANI) return null;
  if (!Number.isSafeInteger(cotaSutimi) || cotaSutimi <= 0 || cotaSutimi > 10_000) return null;

  if (directie === "adauga") {
    const tva = imparteRotunjit(sumaBani * cotaSutimi, 10_000);
    return { faraTva: sumaBani, tva, cuTva: sumaBani + tva, cotaSutimi };
  }

  // Scos din total: din 121 de lei, 21 sunt TVA.
  const tva = imparteRotunjit(sumaBani * cotaSutimi, 10_000 + cotaSutimi);
  return { faraTva: sumaBani - tva, tva, cuTva: sumaBani, cotaSutimi };
}

const FORMAT_LEI = new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** „1.234,56” din 123456 de bani. */
export const formatBani = (bani: number) => FORMAT_LEI.format(bani / 100);

/** „21” din 2100, „9,5” din 950. */
export const formatCota = (cotaSutimi: number) =>
  new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 }).format(cotaSutimi / 100);

/**
 * Ce intră la cota redusă, pe scurt, în ordinea în care se întâlnește mai des.
 * E un rezumat al art. 291 alin. (2), nu lista completă: literele despre
 * agricultură (apă pentru irigații, îngrășăminte, pesticide, semințe),
 * locuințele sociale și hrana albinelor nu sunt aici.
 *
 * Două capcane din textul legii, ca rezumatul să nu spună mai mult decât ea:
 *  - la alimente, lit. b) scoate băuturile alcoolice, băuturile nealcoolice de
 *    la codul NC 2202 (răcoritoarele, nu apa plată și nu sucul de fructe),
 *    alimentele cu zahăr adăugat care au cel puțin 10 g de zahăr la 100 g și
 *    suplimentele alimentare — toate acestea sunt la cota standard;
 *  - energia termică, lit. k), e la 11% numai în sezonul rece (1 noiembrie –
 *    31 martie) și numai pentru categoriile enumerate; populația e prima.
 */
export const LA_COTA_REDUSA = [
  "alimente",
  "medicamente de uz uman",
  "restaurant și catering",
  "cazare la hotel, pensiune sau camping",
  "cărți, manuale, ziare și reviste",
  "apă și canalizare",
  "lemn de foc, peleți și brichete",
  "căldura livrată populației în sezonul rece",
  "intrarea la muzee, castele, monumente, grădini zoologice și botanice",
] as const;

/** Ce rămâne la cota standard deși e în raionul de alimente: excepțiile de la lit. b). */
export const EXCEPTII_ALIMENTE =
  "băuturile alcoolice, răcoritoarele, alimentele cu zahăr adăugat care au cel puțin 10 g de zahăr la 100 g și suplimentele alimentare";
