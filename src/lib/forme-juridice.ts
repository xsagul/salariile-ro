// Comparație între formele de organizare, anul fiscal 2026:
// PFA în sistem real, SRL microîntreprindere și SRL cu impozit pe profit.
//
// Verificat pe Codul fiscal consolidat, versiunea în vigoare la 1 iulie 2026.
// Atenție la sursele vechi: multe blog-uri de contabilitate încă afișează
// cotele micro de 1%/3%, iar consolidările vechi ale Codului fiscal de pe
// legislatie.just.ro servesc textul din 2016.

// Constantele sunt redefinite local, nu importate din pfa.ts/fiscal.ts:
// modulele din src/lib nu se importă între ele, iar un import relativ ar cere
// fie extensia .ts (respinsă de tsc), fie allowImportingTsExtensions. Divergența
// e prinsă de scripts/test-forme-juridice.mts, care compară aceste valori cu
// motorul fiscal și cu pfa.ts.

/** Salariul minim de la 1 ianuarie 2026, reperul plafoanelor anuale conform
 *  art. 135^1 alin. (3). Trebuie să rămână egal cu SALARIU_MINIM_PFA_2026. */
const SALARIU_MINIM_PFA_2026 = 4_050;

/** Cota unică pe veniturile microîntreprinderilor. Tranșa de 3% și excepțiile
 *  pentru consultanță/IT/HoReCa (art. 51 alin. (1^1) și (4^1)–(4^3)) au fost
 *  ABROGATE prin OUG 89/2025, cu efect de la 1 ianuarie 2026. */
export const COTA_MICRO = 0.01;

/** Art. 17 Cod fiscal, neschimbat. */
export const COTA_IMPOZIT_PROFIT = 0.16;

/** Art. 97 alin. (7), modificat prin Legea 141/2025. Se aplică dividendelor
 *  DISTRIBUITE începând cu 1 ianuarie 2026 — data distribuirii, nu anul din
 *  care provine profitul. Dividendele distribuite pe situații financiare
 *  interimare întocmite în 2025 rămân la 10%. */
export const COTA_DIVIDENDE = 0.16;

/** Art. 47 alin. (1) lit. c): plafonul de încadrare ca microîntreprindere. */
export const PLAFON_MICRO_EUR = 100_000;
/** Curs BNR la 31 decembrie 2025, ultima cotație a anului. */
export const CURS_EUR_31_12_2025 = 5.0985;
export const PLAFON_MICRO_LEI = Math.round(PLAFON_MICRO_EUR * CURS_EUR_31_12_2025);

/** Costul anual pentru angajator al unui salariu minim cu normă întreagă în
 *  2026, ținând cont de anul spart (4.050 lei până la 30 iunie, 4.325 lei de
 *  la 1 iulie) și de facilitatea OUG 89/2025 (300 lei/lună în S1, 200 în S2).
 *  Include CAM 2,25%. */
export const COST_ANGAJATOR_MINIM_2026 = 51_312;
/** Ce încasează efectiv salariatul, net, în aceleași condiții. */
export const NET_SALARIU_MINIM_2026 = 31_638;

/** Cheltuiala uzuală de contabilitate pentru un SRL. Este o ipoteză de piață,
 *  nu o cifră legală — la venituri medii, ea e de mărimea diferenței dintre
 *  PFA și micro, deci trebuie să rămână vizibilă și editabilă. */
export const CONTABILITATE_SRL_IMPLICIT = 6_000;

/**
 * CASS pentru veniturile din dividende (art. 170 alin. (2)–(3)).
 *
 * Nu este o cotă, ci trepte: baza e 6, 12 sau 24 de salarii minime, indiferent
 * cât depășești pragul. Un leu în plus peste prag poate costa 2.430 de lei.
 *
 * Suma comparată cu pragurile este dividendul PLĂTIT și diminuat cu impozitul
 * reținut (art. 170 alin. (4) lit. d), adică valoarea netă, nu cea brută.
 *
 * Salariul nu scutește: excepția din art. 174 alin. (7) privește doar diferența
 * până la minim la activități independente, nu veniturile din investiții.
 */
export function cassDividende(dividendeNete: number): number {
  const sm = SALARIU_MINIM_PFA_2026;
  if (dividendeNete < 6 * sm) return 0;
  if (dividendeNete < 12 * sm) return Math.round(6 * sm * 0.1);
  if (dividendeNete < 24 * sm) return Math.round(12 * sm * 0.1);
  return Math.round(24 * sm * 0.1);
}

export type TipSrl = "micro" | "profit";

export type RezultatSrl = {
  tip: TipSrl;
  venituri: number;
  cheltuieli: number;
  /** Costul total al salariului minim pentru firmă, 0 dacă nu se ia salariu. */
  costSalarial: number;
  /** Netul încasat de proprietar din acel salariu. */
  salariuNet: number;
  /** Impozit micro (1% pe venituri) sau impozit pe profit (16%). */
  impozitFirma: number;
  dividendeBrute: number;
  impozitDividende: number;
  dividendeNete: number;
  cassDividende: number;
  /** Total dus la stat, din toate sursele. */
  totalTaxe: number;
  /**
   * Cât lipsește din venituri ca firma să-și acopere singură cheltuielile,
   * salariul minim obligatoriu și impozitul. Peste zero înseamnă că forma
   * nu se susține la cifra asta: banii trebuie băgați de proprietar.
   */
  deficit: number;
  /** Cât ajunge efectiv la proprietar. Negativ dacă are de acoperit un deficit. */
  ramas: number;
};

/**
 * Cât rămâne proprietarului unui SRL, la venituri și cheltuieli date.
 *
 * Ipoteze explicite, pentru că nu există un răspuns unic:
 *  - tot profitul distribuibil se distribuie ca dividende în același an;
 *  - dividendele se distribuie după 1 ianuarie 2026, deci impozit 16%;
 *  - proprietarul e și salariat, la nivelul salariului minim.
 *
 * Salariul e OBLIGATORIU la micro: art. 47 alin. (1) lit. g) cere cel puțin un
 * salariat, condiție îndeplinită și de un contract de mandat remunerat cel
 * puțin la nivelul salariului minim. La impozit pe profit nu există condiția.
 */
export function calculeazaSrl(
  venituriInitiale: number,
  cheltuieliInitiale: number,
  optiuni: { tip: TipSrl; cuSalariu?: boolean; cheltuialaContabilitate?: number },
): RezultatSrl {
  const venituri = Math.max(0, venituriInitiale);
  const contabilitate = Math.max(0, optiuni.cheltuialaContabilitate ?? CONTABILITATE_SRL_IMPLICIT);
  const cheltuieli = Math.max(0, cheltuieliInitiale) + contabilitate;

  // Micro nu poate exista fără salariat, deci acolo salariul nu e opțional.
  const cuSalariu = optiuni.tip === "micro" ? true : optiuni.cuSalariu !== false;
  const costSalarial = cuSalariu ? COST_ANGAJATOR_MINIM_2026 : 0;
  const salariuNet = cuSalariu ? NET_SALARIU_MINIM_2026 : 0;

  const impozitFirma =
    optiuni.tip === "micro"
      ? Math.round(venituri * COTA_MICRO)
      : Math.round(Math.max(0, venituri - cheltuieli - costSalarial) * COTA_IMPOZIT_PROFIT);

  const dividendeBrute = Math.max(0, venituri - cheltuieli - costSalarial - impozitFirma);
  const impozitDividende = Math.round(dividendeBrute * COTA_DIVIDENDE);
  const dividendeNete = dividendeBrute - impozitDividende;
  const cass = cassDividende(dividendeNete);

  // Contribuțiile din salariu sunt deja incluse în costSalarial (partea firmei)
  // și în diferența dintre brut și salariuNet (partea angajatului).
  const taxeSalariale = costSalarial - salariuNet;
  const totalTaxe = taxeSalariale + impozitFirma + impozitDividende + cass;

  // Salariul minim e obligatoriu la micro, dar obligatia nu creeaza si banii
  // din care sa fie platit. Sub un anumit venit, firma nu isi acopera propriile
  // costuri, iar diferenta o pune proprietarul din buzunar.
  const deficit = Math.max(0, cheltuieli + costSalarial + impozitFirma - venituri);

  return {
    tip: optiuni.tip,
    venituri,
    cheltuieli,
    costSalarial,
    salariuNet,
    impozitFirma,
    dividendeBrute,
    impozitDividende,
    dividendeNete,
    cassDividende: cass,
    totalTaxe,
    deficit,
    // Cand firma e solvabila, asta e identic cu salariuNet + dividendeNete − cass.
    // Difera exact cu deficitul, adica exact acolo unde Math.max de mai sus taia
    // pierderea si faceau sa para ca iei acasa un salariu pe care nu-l acopera
    // nimic. La 12.000 lei venit anual, micro arata asa +31.638 in loc de −13.794.
    ramas: venituri - cheltuieli - totalTaxe,
  };
}
