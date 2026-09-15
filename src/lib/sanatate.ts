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
// Un calculator separat pentru constructii exista din alt motiv: aritmetica e cea
// standard, dar cererea de cautare e mare (vezi `/calculator-salariu-constructii`).
// Aici pagina se justifica prin calcul, acolo prin intentia de cautare.
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

import { grilaPublica, MESERII_CU_GRILA } from "@/lib/grile-publice";
import { getMeserie } from "@/lib/meserii";
import {
  calculeazaPentruMeserie,
  type IntrareSanatate,
  type MeserieSanatate,
  type RezultatSanatate,
} from "@/lib/sanatate-calcul";
import { CONDITII_DOCTORAT, TEMEI_GRADATIE } from "@/lib/lege153";

export type { IntrareSanatate, MeserieSanatate, RezultatSanatate };

export const ANEXA = "Anexa nr. II";

export { CONDITII_DOCTORAT };

// ─── Ce meserii acopera ──────────────────────────────────────────────────────
//
// Lista se DERIVA din `grile-publice.ts`, nu se scrie de mana. Daca acolo se
// adauga o functie din Anexa II, apare si aici fara alta interventie; daca se
// scoate, dispare. O a doua lista scrisa manual ar ramane in urma tacut.
//
// Modulul importa toate grilele, deci NU se importa din componente client:
// pagina ii da componentei `MESERII_SANATATE` ca props, iar calculul vine din
// `sanatate-calcul.ts`.

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

export function calculeazaSanatate(input: IntrareSanatate): RezultatSanatate | null {
  const meserie = meserieSanatate(input.slug);
  if (!meserie) return null;
  return calculeazaPentruMeserie(meserie, input);
}

export const TEMEI_GRADATIE_PUBLIC = TEMEI_GRADATIE;
