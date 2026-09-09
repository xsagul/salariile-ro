// src/lib/ore-suplimentare.ts
//
// Munca suplimentara, munca de noapte si munca in sarbatori legale —
// Codul Muncii (Legea 53/2003, forma consolidata).
//
// De ce exista pagina asta, si de ce trece testul „nu e pagina-usa": omul isi
// stie salariul de baza si stie cate ore a facut peste program, dar nu stie
// cat iese. Calculul cere trei lucruri pe care calculatorul obisnuit nu le are:
// tariful orar (care depinde de cate zile lucratoare are LUNA ALEEA), cotele
// minime din lege si regula ca sporul se aplica altfel la ore suplimentare
// decat la ore de noapte.
//
// Masurat pe 9 septembrie 2026: „calculator ore suplimentare", „calcul salariu
// cu ore suplimentare" si „calcul spor de noapte" aduna ~990 de cautari lunar
// la dificultate 5-6, iar noi aparem pe pozitia 54. Nimeni nu le tinteste.
//
// ─── Temeiul, verificat cuvant cu cuvant in textul consolidat ───────────────
//
//   art. 112 alin. (1)  norma intreaga = 8 ore pe zi, 40 pe saptamana;
//   art. 122            munca suplimentara se compenseaza INTAI cu ore libere
//                       platite; sporul vine abia daca asta nu e posibil;
//   art. 123 alin. (2)  sporul pentru munca suplimentara „nu poate fi mai mic
//                       de 75% din salariul de baza";
//   art. 125 alin. (1)  munca de noapte = intre 22:00 si 06:00;
//   art. 125 alin. (2)  salariat de noapte = cel putin 3 ore din ziua de lucru
//                       SAU cel putin 30% din timpul lunar de lucru;
//   art. 126            salariatul de noapte primeste FIE program redus cu o
//                       ora fara scaderea salariului, FIE spor de 25%;
//   art. 142 alin. (2)  munca in sarbatoare legala, necompensata cu timp liber,
//                       are spor de minimum 100% din salariul de baza.
//
// Toate cotele din lege sunt MINIME. Contractul colectiv sau cel individual pot
// da mai mult, niciodata mai putin. De aceea cotele sunt editabile in interfata,
// dar pornesc de la pragul legal si nu pot cobori sub el.
//
// ─── Doua reguli care se confunda constant ─────────────────────────────────
//
// Ora suplimentara NU e cuprinsa in salariul lunar: ea se plateste integral
// (tariful orar) PLUS sporul. Deci 1,75 x tarif la cota minima.
//
// Ora de noapte E cuprinsa in salariul lunar — e in programul normal, doar ca
// se presteaza noaptea. Se adauga numai sporul, 0,25 x tarif.
//
// Confuzia dintre cele doua e cea mai frecventa eroare in calculatoarele de pe
// piata si duce la supraestimari de zeci de procente.

import { calculeaza, type Rezultat } from "@/lib/fiscal";
import { zileLucratoareLuna } from "@/lib/sarbatori";

export const ORE_PE_ZI = 8;

export const COTA_MINIMA_SUPLIMENTARE = 0.75;
export const COTA_MINIMA_NOAPTE = 0.25;
export const COTA_MINIMA_SARBATOARE = 1.0;

export const PRAG_ORE_NOAPTE_ZI = 3;
export const INTERVAL_NOAPTE = "22:00–06:00";

export const TEMEI = {
  norma: "Codul Muncii, art. 112 alin. (1)",
  compensare: "Codul Muncii, art. 122",
  suplimentare: "Codul Muncii, art. 123 alin. (2)",
  noapteDefinitie: "Codul Muncii, art. 125 alin. (1) și (2)",
  noapteSpor: "Codul Muncii, art. 126",
  sarbatoare: "Codul Muncii, art. 142 alin. (2)",
} as const;

export const URL_COD_MUNCII = "https://legislatie.just.ro/Public/DetaliiDocument/128647";

/**
 * Orele de program normal dintr-o luna: zilele lucratoare x 8.
 *
 * Nu e un detaliu. Acelasi salariu de baza da un tarif orar diferit de la luna
 * la luna — februarie 2026 are 20 de zile lucratoare (160 de ore), iar
 * septembrie are 22 (176 de ore). Aceeasi ora suplimentara valoreaza cu 10%
 * mai mult in februarie. Un calculator care fixeaza 168 de ore se inseala in
 * fiecare luna in afara de cele care chiar au 21 de zile.
 */
export function oreNormaleLuna(an: number, luna0: number): number {
  return zileLucratoareLuna(an, luna0) * ORE_PE_ZI;
}

export type LinieSpor = {
  eticheta: string;
  ore: number;
  /** Cota aplicata, ca fractie: 0,75 = 75%. */
  cota: number;
  /** Cat se adauga la brut pentru linia asta. */
  suma: number;
  temei: string;
  detaliu?: string;
};

export type IntrareOre = {
  /** Salariul de baza brut lunar, din contract. */
  salariuDeBaza: number;
  an: number;
  /** Luna, 0 = ianuarie. */
  luna0: number;
  /** Ore suplimentare NEcompensate cu ore libere platite. */
  oreSuplimentare?: number;
  cotaSuplimentare?: number;
  /** Ore prestate intre 22:00 si 06:00, in programul normal. */
  oreNoapte?: number;
  cotaNoapte?: number;
  /** Ore lucrate in zile de sarbatoare legala, necompensate cu timp liber. */
  oreSarbatoare?: number;
  cotaSarbatoare?: number;
  persoanePretretinere?: number;
};

export type RezultatOre = {
  oreNormale: number;
  zileLucratoare: number;
  tarifOrar: number;
  linii: LinieSpor[];
  /** Suma sporurilor si a orelor suplimentare, peste salariul de baza. */
  totalSporuri: number;
  brutTotal: number;
  fiscal: Rezultat;
  /** Netul salariului de baza singur, ca sa se vada diferenta pe care o fac orele. */
  netFaraSporuri: number | null;
  /** Sub 3 ore de noapte pe zi sporul nu se cuvine din acest temei (art. 125). */
  avertismentNoapte: boolean;
};

/** Rotunjire la leu, ca in restul modulelor fiscale. */
const lei = (n: number) => Math.round(n);

export function calculeazaOre(input: IntrareOre): RezultatOre | null {
  const baza = Number(input.salariuDeBaza);
  if (!Number.isFinite(baza) || baza <= 0) return null;
  if (!Number.isInteger(input.luna0) || input.luna0 < 0 || input.luna0 > 11) return null;

  const zile = zileLucratoareLuna(input.an, input.luna0);
  const oreNormale = zile * ORE_PE_ZI;
  if (oreNormale <= 0) return null;

  const tarifOrar = baza / oreNormale;

  const oreSup = Math.max(0, Number(input.oreSuplimentare ?? 0));
  const oreNoapte = Math.max(0, Number(input.oreNoapte ?? 0));
  const oreSarb = Math.max(0, Number(input.oreSarbatoare ?? 0));

  // Cotele nu pot cobori sub pragul legal: legea le da ca minime, nu ca valori.
  const cotaSup = Math.max(COTA_MINIMA_SUPLIMENTARE, Number(input.cotaSuplimentare ?? COTA_MINIMA_SUPLIMENTARE));
  const cotaNoapte = Math.max(COTA_MINIMA_NOAPTE, Number(input.cotaNoapte ?? COTA_MINIMA_NOAPTE));
  const cotaSarb = Math.max(COTA_MINIMA_SARBATOARE, Number(input.cotaSarbatoare ?? COTA_MINIMA_SARBATOARE));

  const linii: LinieSpor[] = [];

  if (oreSup > 0) {
    // Ora suplimentara nu e in salariul lunar: se plateste intreaga, plus sporul.
    linii.push({
      eticheta: "Ore suplimentare",
      ore: oreSup,
      cota: cotaSup,
      suma: lei(oreSup * tarifOrar * (1 + cotaSup)),
      temei: TEMEI.suplimentare,
      detaliu: `Ora plătită integral plus sporul de ${Math.round(cotaSup * 100)}%.`,
    });
  }

  if (oreNoapte > 0) {
    // Ora de noapte e deja in salariul lunar: se adauga numai sporul.
    linii.push({
      eticheta: "Spor de noapte",
      ore: oreNoapte,
      cota: cotaNoapte,
      suma: lei(oreNoapte * tarifOrar * cotaNoapte),
      temei: TEMEI.noapteSpor,
      detaliu: `Doar sporul de ${Math.round(cotaNoapte * 100)}%: ora e deja cuprinsă în salariul lunar.`,
    });
  }

  if (oreSarb > 0) {
    linii.push({
      eticheta: "Spor pentru sărbători legale",
      ore: oreSarb,
      cota: cotaSarb,
      suma: lei(oreSarb * tarifOrar * cotaSarb),
      temei: TEMEI.sarbatoare,
      detaliu: `Sporul de ${Math.round(cotaSarb * 100)}% peste plata zilei, care e deja în salariu.`,
    });
  }

  const totalSporuri = linii.reduce((s, l) => s + l.suma, 0);
  const brutTotal = lei(baza) + totalSporuri;

  const comun = {
    tichete: "",
    functieDeBAza: true,
    persoanePretretinere: input.persoanePretretinere ?? 0,
    varstaSub26: false,
    copiiScolarizati: 0,
    scutitImpozit: false,
    normaContract: "intreaga" as const,
  };

  const fiscal = calculeaza({ brut: String(brutTotal), salariuDeBaza: String(lei(baza)), ...comun });
  if (!fiscal) return null;

  const doarBaza = calculeaza({ brut: String(lei(baza)), salariuDeBaza: String(lei(baza)), ...comun });

  return {
    oreNormale,
    zileLucratoare: zile,
    tarifOrar,
    linii,
    totalSporuri,
    brutTotal,
    fiscal,
    netFaraSporuri: doarBaza?.netBani ?? null,
    // Art. 125 alin. (2) lit. a) cere cel putin 3 ore de noapte din ziua de
    // lucru. Sub prag, sporul nu se cuvine din acest temei — poate exista din
    // contractul colectiv, dar asta nu se poate presupune.
    avertismentNoapte: oreNoapte > 0 && oreNoapte < PRAG_ORE_NOAPTE_ZI,
  };
}

export const LUNI = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
] as const;
