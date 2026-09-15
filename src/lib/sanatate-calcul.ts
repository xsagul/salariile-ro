// src/lib/sanatate-calcul.ts
//
// Aritmetica calculatorului de sănătate, fără nicio dependență de date.
//
// De ce e separată de `sanatate.ts`: acolo lista meseriilor se construiește din
// `grile-153-2017.json`, adică toate anexele Legii 153/2017. Importat într-o
// componentă client, fișierul ajungea întreg în browser — măsurat pe 15
// septembrie 2026 (audit SE Ranking + build): 1,9 MB de JavaScript, 517 KB
// comprimat, numai pe /calculator-salariu-sanatate. Aici rămân doar calculul și
// tipurile; grilele Anexei II le primește componenta de la pagină, ca props.

import type { TreaptaPublica } from "@/lib/grile-publice";
import { calculeaza, calculStandard, type Rezultat } from "@/lib/fiscal";
import {
  aplicaGradatia,
  gradatiaDupaVechime,
  INDEMNIZATIE_DOCTORAT_2026,
  INDEMNIZATIE_HRANA,
  PLAFON_HRANA_NET,
  TEMEI_DOCTORAT,
  TEMEI_HRANA,
  type LinieCalcul,
  type NivelGradatie,
} from "@/lib/lege153";

export type MeserieSanatate = {
  slug: string;
  nume: string;
  /** Cum ii spune legii angajatorul — „spitale și institute clinice". */
  domeniu: string;
  trepte: TreaptaPublica[];
};

export type IntrareSanatate = {
  slug: string;
  /** Eticheta treptei, exact cum o da `grilaPublica`. */
  treapta: string;
  /**
   * Gradatia de vechime in munca. Se da fie direct treapta (interfata alege
   * banda, pentru ca pe ea o cheie legea), fie anii impliniti si se deduce.
   */
  gradatie?: NivelGradatie;
  /** Vechimea in MUNCA, in ani impliniti — folosita cand `gradatie` lipseste. */
  aniMunca?: number;
  /** Titlu stiintific de doctor, in domeniul postului (art. 14). */
  doctorat?: boolean;
  /**
   * Primeste alte drepturi de hrana potrivit legislatiei specifice — caz in
   * care indemnizatia de 347 lei NU se acorda (art. 18 alin. (1), teza a doua).
   * In sanatate exceptia asta e reala, de aceea e comutator si nu presupunere.
   */
  alteDrepturiHrana?: boolean;
  persoanePretretinere?: number;
};

export type RezultatSanatate = {
  meserie: MeserieSanatate;
  treapta: TreaptaPublica;
  /** Suma din grila, la gradatia 0. */
  salariuGrila: number;
  gradatie: NivelGradatie;
  /** Dupa aplicarea gradatiei. */
  salariuDeBaza: number;
  /** Ce se adauga peste salariul de baza, fiecare cu temeiul lui. */
  linii: LinieCalcul[];
  brutTotal: number;
  fiscal: Rezultat;
  /** Adevarat cand indemnizatia de hrana a fost refuzata de plafon, nu de bifa. */
  hranaPesteplafon: boolean;
};

/** Calculul pentru o meserie deja aleasă. `input.slug` e ignorat: meseria e dată. */
export function calculeazaPentruMeserie(
  meserie: MeserieSanatate,
  input: IntrareSanatate,
): RezultatSanatate | null {
  const treapta = meserie.trepte.find((t) => t.eticheta === input.treapta);
  if (!treapta) return null;

  const salariuGrila = treapta.brut;
  const gradatie = input.gradatie ?? gradatiaDupaVechime(input.aniMunca ?? 0);
  const salariuDeBaza = aplicaGradatia(salariuGrila, gradatie);

  const linii: LinieCalcul[] = [];
  let total = salariuDeBaza;

  if (input.doctorat) {
    linii.push({
      eticheta: "Indemnizație titlu științific de doctor",
      suma: INDEMNIZATIE_DOCTORAT_2026,
      temei: TEMEI_DOCTORAT,
    });
    total += INDEMNIZATIE_DOCTORAT_2026;
  }

  // Plafonul se raporteaza la netul salariului de baza, nu la netul final —
  // altfel indemnizatia s-ar compara cu un net din care face ea insasi parte.
  // Vezi nota din `lege153.ts`: pentru invatamant asa spune legea expres, iar
  // pentru celelalte anexe e citirea noastra, declarata ca atare.
  const netBaza = calculStandard(salariuDeBaza)?.net ?? null;
  const pesteplafon = netBaza !== null && netBaza > PLAFON_HRANA_NET;
  if (!input.alteDrepturiHrana && netBaza !== null && !pesteplafon) {
    linii.push({ eticheta: "Indemnizație de hrană", suma: INDEMNIZATIE_HRANA, temei: TEMEI_HRANA });
    total += INDEMNIZATIE_HRANA;
  }

  const fiscal = calculeaza({
    brut: String(total),
    salariuDeBaza: String(salariuDeBaza),
    tichete: "",
    functieDeBAza: true,
    persoanePretretinere: input.persoanePretretinere ?? 0,
    varstaSub26: false,
    copiiScolarizati: 0,
    scutitImpozit: false,
    normaContract: "intreaga",
  });
  if (!fiscal) return null;

  return {
    meserie,
    treapta,
    salariuGrila,
    gradatie,
    salariuDeBaza,
    linii,
    brutTotal: total,
    fiscal,
    hranaPesteplafon: pesteplafon && !input.alteDrepturiHrana,
  };
}
