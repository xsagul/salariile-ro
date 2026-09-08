// src/lib/sanatate.ts
//
// Salarizarea personalului din unitatile sanitare publice — Legea-cadru
// nr. 153/2017, Anexa nr. II.
//
// De ce exista pagina asta, cand calculatorul obisnuit face deja brut → net:
// pentru ca un asistent medical nu-si stie brutul. Stie ca e „asistent medical
// principal, postliceal, cu 15 ani vechime". Brutul lui vine din grila, iar
// peste el se aplica gradatia de vechime (pana la +24,52%) si, sub un plafon,
// indemnizatia de hrana. Asta e munca pe care calculatorul generic n-o poate
// face, si e singurul motiv pentru care o pagina separata se justifica.
//
// Un calculator sectorial pentru constructii sau IT NU se justifica: acolo
// facilitatile fiscale au fost eliminate de la 1 ianuarie 2025, calculul e
// identic cu cel standard, iar omul isi stie brutul din contract.
//
// De unde vin cifrele. NU se citeste direct din `grile-153-2017.json`: acolo
// randurile cu mai multe coloane sunt neetichetate (un „Manager" are patru
// sume, fara sa se stie care e spitalul peste 400 de paturi si care gradul II).
// Se citeste prin `grilaPublica()`, care potriveste randul dupa numele exact al
// functiei din lege si e acoperita de `test-grile-publice.mts`, unde sumele
// asteptate sunt luate de mana din textul consolidat.
//
// Ce NU include calculul, si de ce:
//   — sporurile pentru conditii deosebite, vatamatoare sau periculoase
//     (Anexa II, cap. II): procentele depind de incadrarea concreta a locului
//     de munca, stabilita prin regulament intern, nu prin lege;
//   — garzile si munca de noapte: depind de graficul lunar;
//   — sporul de doctorat e inclus, dar pe bifa (art. 14 il conditioneaza).
// O cifra care le-ar presupune ar fi mai mare si mai falsa.

import { grilaPublica, MESERII_CU_GRILA, type TreaptaPublica } from "@/lib/grile-publice";
import { getMeserie } from "@/lib/meserii";
import { calculeaza, calculStandard, type Rezultat } from "@/lib/fiscal";
import {
  aplicaGradatia,
  gradatiaDupaVechime,
  CONDITII_DOCTORAT,
  INDEMNIZATIE_DOCTORAT_2026,
  INDEMNIZATIE_HRANA,
  PLAFON_HRANA_NET,
  TEMEI_DOCTORAT,
  TEMEI_GRADATIE,
  TEMEI_HRANA,
  type LinieCalcul,
  type NivelGradatie,
} from "@/lib/lege153";

export const ANEXA = "Anexa nr. II";

export { CONDITII_DOCTORAT };

// ─── Ce meserii acopera ──────────────────────────────────────────────────────
//
// Lista se DERIVA din `grile-publice.ts`, nu se scrie de mana. Daca acolo se
// adauga o functie din Anexa II, apare si aici fara alta interventie; daca se
// scoate, dispare. O a doua lista scrisa manual ar ramane in urma tacut.

export type MeserieSanatate = {
  slug: string;
  nume: string;
  /** Cum ii spune legii angajatorul — „spitale și institute clinice". */
  domeniu: string;
  trepte: TreaptaPublica[];
};

function construieste(): MeserieSanatate[] {
  const out: MeserieSanatate[] = [];
  for (const slug of MESERII_CU_GRILA) {
    const g = grilaPublica(slug);
    if (!g || g.anexa !== ANEXA || g.doarSectiune) continue;
    const m = getMeserie(slug);
    out.push({
      slug,
      nume: m?.nume ?? slug,
      domeniu: g.domeniu,
      trepte: g.trepte,
    });
  }
  return out.sort((a, b) => a.nume.localeCompare(b.nume, "ro"));
}

export const MESERII_SANATATE: MeserieSanatate[] = construieste();

export function meserieSanatate(slug: string): MeserieSanatate | undefined {
  return MESERII_SANATATE.find((m) => m.slug === slug);
}

/** Cate trepte are grila, cumulat — pentru textul paginii, nu hardcodat. */
export const TOTAL_TREPTE = MESERII_SANATATE.reduce((n, m) => n + m.trepte.length, 0);

// ─── Calculul ────────────────────────────────────────────────────────────────

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

export function calculeazaSanatate(input: IntrareSanatate): RezultatSanatate | null {
  const meserie = meserieSanatate(input.slug);
  if (!meserie) return null;
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

export const TEMEI_GRADATIE_PUBLIC = TEMEI_GRADATIE;
