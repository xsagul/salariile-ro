// src/lib/lege153.ts
//
// Prevederile GENERALE ale Legii-cadru nr. 153/2017 — cele care se aplica
// intregului personal platit din fonduri publice, indiferent de anexa.
//
// De ce exista fisierul asta separat: pana pe 9 septembrie 2026 gradatia de
// vechime, indemnizatia de hrana si cea de doctorat traiau in `invatamant.ts`,
// pentru ca acolo au fost scrise prima data. Sunt insa articole din corpul
// legii (art. 10, 14, 18), nu din Anexa I, si se aplica la fel unui asistent
// medical sau unui functionar public. Lasate acolo, orice al doilea calculator
// ar fi trebuit sa importe „invatamant" ca sa calculeze salariul unui medic —
// sau, mai rau, sa-si rescrie propria copie a cotelor.
//
// `invatamant.ts` le re-exporta, ca sa nu se rupa nimic din ce le importa deja.
// Proprietarul lor e acest fisier.

export type LinieCalcul = {
  eticheta: string;
  suma: number;
  temei: string;
};

// ─── Gradatia de vechime in munca (art. 10 alin. (4)) ────────────────────────
//
// Cotele se COMPUN, nu se aduna: fiecare se aplica la salariul de baza avut,
// nu la cel din anexa. Adunarea (7,5+5+5+2,5+2,5 = 22,5%) e gresita; compunerea
// da 24,52%. E cea mai frecventa eroare in calculatoarele de pe piata.

export const GRADATII = [
  { nivel: 0, eticheta: "sub 3 ani", cota: 0 },
  { nivel: 1, eticheta: "3–5 ani", cota: 0.075 },
  { nivel: 2, eticheta: "5–10 ani", cota: 0.05 },
  { nivel: 3, eticheta: "10–15 ani", cota: 0.05 },
  { nivel: 4, eticheta: "15–20 ani", cota: 0.025 },
  { nivel: 5, eticheta: "peste 20 ani", cota: 0.025 },
] as const;

export type NivelGradatie = 0 | 1 | 2 | 3 | 4 | 5;

/** Gradatia in functie de vechimea in munca, in ani impliniti. */
export function gradatiaDupaVechime(aniMunca: number): NivelGradatie {
  if (aniMunca < 3) return 0;
  if (aniMunca < 5) return 1;
  if (aniMunca < 10) return 2;
  if (aniMunca < 15) return 3;
  if (aniMunca < 20) return 4;
  return 5;
}

/**
 * Aplica gradatiile cumulativ, rotunjind la leu dupa fiecare treapta.
 *
 * Rotunjirea pe treapta, si nu o singura data la final, e alegerea noastra:
 * legea spune ca fiecare gradatie da "noul salariu de baza", deci fiecare
 * treapta produce o suma concreta. Diferenta fata de rotunjirea finala e de
 * cel mult cativa lei. Marcata explicit ca ipoteza, nu ca text de lege.
 */
export function aplicaGradatia(salariuGrila: number, gradatie: NivelGradatie): number {
  let s = salariuGrila;
  for (let i = 1; i <= gradatie; i++) {
    s = Math.round(s * (1 + GRADATII[i].cota));
  }
  return s;
}

export const TEMEI_GRADATIE = "Legea 153/2017, art. 10 alin. (4)";

// ─── Indemnizatia pentru titlul stiintific de doctor (art. 14) ───────────────
//
// Art. 14 alin. (1) o da "personalului care detine titlul stiintific de doctor",
// fara sa o limiteze la vreo anexa — deci si medicilor, si juristilor, nu doar
// cadrelor didactice. Nu e insa automata: se acorda "numai daca isi desfasoara
// activitatea in domeniul pentru care detine titlul" SI daca fisa postului
// prevede atributii obiective si cuantificabile. De aceea sta pe o bifa, nu
// pornita din oficiu.
//
// Cuantumul din art. 14 e 50% din salariul minim brut, dar el e inghetat prin
// legile anuale de consolidare fiscala; suma efectiv platita in 2026 e cea de
// mai jos.

export const INDEMNIZATIE_DOCTORAT_2026 = 500;
export const TEMEI_DOCTORAT = "OUG 7/2026, art. LIV alin. (1)";
export const CONDITII_DOCTORAT =
  "Se acordă numai dacă activitatea se desfășoară în domeniul titlului și fișa postului prevede atribuții obiective și cuantificabile (art. 14 alin. (1)).";

// ─── Indemnizatia de hrana (art. 18) ─────────────────────────────────────────
//
// Art. 18 alin. (1), in forma de la 1 ianuarie 2026 (modificat prin Legea
// 141/2025, art. XV pct. 5): 347 lei lunar, pentru personalul "ale carui
// salarii lunare sunt de pana la 6.000 lei net inclusiv". Textul e general —
// "personalul incadrat" — deci acopera toate anexele.
//
// Exceptia din acelasi alineat conteaza mai ales in sanatate: "de acest drept
// nu beneficiaza personalul caruia i se acorda alte drepturi de hrana, potrivit
// legislatiei specifice". De aceea calculatoarele au un comutator, nu o
// presupunere.
//
// Circularitatea pragului: alin. (1) compara cu "salariile lunare", dar
// indemnizatia e ea insasi parte din salariu. Pentru invatamant, alin. (1^2)
// (introdus prin OUG 10/2024) o rezolva expres — raportarea se face la salariul
// NET CUVENIT FUNCTIEI DE BAZA. Pentru celelalte anexe nu exista o clarificare
// echivalenta, iar noi aplicam aceeasi citire, marcata ca interpretare. La
// invatamant pragul nu musca niciodata; in sanatate musca — un medic primar are
// baza peste plafon si nu primeste indemnizatia.
//
// Este venit salarial si se impoziteaza: intra in brut inainte de CAS/CASS.

export const INDEMNIZATIE_HRANA = 347;
export const PLAFON_HRANA_NET = 6000;
export const TEMEI_HRANA = "Legea 153/2017, art. 18 alin. (1) și (1^2)";
