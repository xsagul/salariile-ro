// src/lib/grile-publice.ts
//
// Salariile din sectorul bugetar, luate din grilele Legii-cadru nr. 153/2017.
//
// DE CE EXISTA. Restul site-ului arata, pentru fiecare meserie, o ESTIMARE:
// media sectorului CAEN ajustata cu raportul grupei ocupationale
// (`ocupatii-caen.ts`). E cea mai buna cifra pe care o poate da statistica, dar
// e tot o estimare, iar toate ocupatiile dintr-o grupa ies apropiate — un medic
// si un farmacist cad amandoi in „Specialisti in sanatate".
//
// Pentru sectorul bugetar nu e nevoie de estimare. Suma scrie in lege, pe
// fiecare functie si fiecare treapta. Un medic nu „castiga in jur de": are
// salariul de baza 7.125 lei ca rezident an I si 14.125 lei ca primar, la
// gradatia 0, pentru ca asa scrie in Anexa II. Diferenta e intre o cifra si o
// cariera intreaga.
//
// CE NU E CIFRA ASTA, si de ce nu inlocuieste estimarea:
//   — e SALARIU DE BAZA LA GRADATIA 0, inainte de gradatia de vechime, de
//     sporuri (garda, tura, conditii) si de orice majorare;
//   — se aplica numai personalului platit din fonduri publice. Un farmacist de
//     farmacie privata nu e platit dupa Anexa II;
//   — nu e comparabila cu castigul mediu INS, care e brut REALIZAT, cu tot cu
//     sporuri si ore suplimentare.
// De aceea grila se arata ca sectiune separata, etichetata, nu ca titlu de
// pagina. Cifra din titlu ramane cea statistica, comparabila intre meserii.
//
// Datele vin din `scripts/lege153-grile.mjs`. Coloana in plata e iunie 2024,
// prin lantul de mentinere din textul consolidat — vezi comentariul scriptului.

import date from "@/data/grile-153-2017.json";
import { calculStandard } from "@/lib/fiscal";

type RandGrila = {
  nr: number | null;
  functie: string;
  textOriginal: string | null;
  studii: string | null;
  valori: number[];
};

type Grila = {
  sectiune: string;
  aplicaLa: string | null;
  etichetaValori: string[] | null;
  coloane: string[];
  anul: string | null;
  randuri: RandGrila[];
};

type Payload = {
  sursa: { act: string; url: string; licenta: string; dataExtragerii: string };
  coloanaInPlata: string;
  anexe: { anexa: string; denumire: string; grile: Grila[] }[];
};

const D = date as Payload;

export const SURSA_GRILE = D.sursa;

// ─── Cautare in grile ────────────────────────────────────────────────────────

/**
 * O grila e „noua" daca are doua coloane — martie 2024 si iunie 2024. Cele
 * ramase pe o singura coloana n-au fost modificate in 2024 si stau la nivelul
 * anului 2022. Cand aceeasi functie apare in ambele, o vrem pe cea noua.
 */
const eNoua = (g: Grila) => g.coloane.length >= 2;

/** Ultima coloana e cea in plata; celelalte sunt etape din trecut. */
const inPlata = (r: RandGrila) => r.valori[r.valori.length - 1];

/**
 * Textul legii nu e consecvent cu diacriticele: acelasi domeniu apare si
 * „Unități clinice", si „Unităti clinice", uneori in tabele alaturate. O
 * potrivire pe sirul brut alege atunci grila dupa o greseala de tastare.
 */
const normal = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[șț]/g, (c) => (c === "ș" ? "s" : "t"))
    .replace(/\s+/g, " ")
    .trim();

/**
 * Grilele dintr-o anexa, cele in vigoare primele.
 *
 * Ordinea conteaza: aceeasi functie apare si in grila veche, si in cea
 * modificata in 2024. Cine ia prima potrivire fara sortarea asta publica
 * infirmiera cu 3.550 lei in loc de 4.615.
 */
function grileDin(anexa: string, domeniu?: string): Grila[] {
  const toate = D.anexe.filter((x) => x.anexa === anexa).flatMap((x) => x.grile);
  let filtrate = toate;
  if (domeniu) {
    const cheie = normal(domeniu);
    // Intai potrivirea exacta pe domeniul din antet — „Unitati sanitare, cu
    // exceptia celor cuprinse in unitati clinice" contine „unitati clinice",
    // deci o cautare pe subsir ar confunda tocmai grilele care se exclud.
    const exact = toate.filter((g) => g.aplicaLa && normal(g.aplicaLa) === cheie);
    filtrate = exact.length
      ? exact
      : toate.filter((g) => normal(`${g.aplicaLa ?? ""} ${g.sectiune}`).includes(cheie));
  }
  return [...filtrate].sort((x, y) => Number(eNoua(y)) - Number(eNoua(x)));
}

type CautareTreapta = { eticheta: string; functie: string; studii?: string };

function gaseste(grile: Grila[], cerere: CautareTreapta) {
  for (const g of grile) {
    const r = g.randuri.find(
      (x) => x.functie === cerere.functie && (cerere.studii === undefined || x.studii === cerere.studii),
    );
    if (r) return { rand: r, grila: g };
  }
  return null;
}

// ─── Definitiile pe meserie ──────────────────────────────────────────────────

type Definitie = {
  anexa: string;
  /** Filtru pe sectiune, unde aceeasi functie apare in mai multe grile. */
  sectiune?: string;
  /** Ce fel de angajator, in cuvintele cititorului. */
  domeniu: string;
  trepte: CautareTreapta[];
  /** Cand legea nu-i zice „salariu de baza". */
  numeSuma?: string;
  /** Limitarea specifica meseriei, cand exista una peste cea generala. */
  nota?: string;
};

const SALARIU_DE_BAZA = "salariul de bază brut";

/**
 * Anexa III nu salarizeaza „bibliotecarul", ci un sir intreg de functii puse la
 * acelasi nivel. Denumirea completa e cheia de cautare si trebuie sa ramana
 * litera cu litera cea din lege, inclusiv „gradul IA" de la coada, care face
 * parte din randul de baza al grilei.
 */
const BIBLIOTECAR_IA =
  "Bibliotecar, bibliotecar-arhivist, bibliograf, redactor, tehnoredactor, inginer de sistem, documentarist, conservator, restaurator, analist gradul IA";

/**
 * Sirurile din `functie` sunt exact cele din lege, dupa transportul denumirii
 * pe trepte facut de extractor. Se potrivesc pe egalitate, nu pe „contine" —
 * „Medic" si „Medic primar" sunt trepte diferite, iar o potrivire partiala le
 * confunda tacut.
 */
const DEFINITII: Record<string, Definitie> = {
  medic: {
    anexa: "Anexa nr. II",
    sectiune: "Unităti clinice",
    domeniu: "spitale și institute clinice",
    trepte: [
      { eticheta: "Rezident anul I", functie: "Medic rezident anul I" },
      { eticheta: "Rezident anul II", functie: "Medic rezident anul II" },
      { eticheta: "Rezident anul III", functie: "Medic rezident anul III" },
      { eticheta: "Rezident anul IV–V", functie: "Medic rezident anul IV - V" },
      { eticheta: "Rezident anul VI–VII", functie: "Medic rezident anul VI - VII" },
      { eticheta: "Medic", functie: "Medic" },
      { eticheta: "Medic specialist", functie: "Medic specialist" },
      { eticheta: "Medic primar", functie: "Medic primar" },
    ],
    nota:
      "În anatomie patologică și medicină legală grila e mai mare — 18.363 lei pentru medic primar — iar la ambulanță, UPU și ATI, 15.072 lei.",
  },

  stomatolog: {
    anexa: "Anexa nr. II",
    sectiune: "Unităti clinice",
    domeniu: "unități sanitare publice",
    trepte: [
      { eticheta: "Rezident anul I", functie: "Medic dentist rezident anul I" },
      { eticheta: "Rezident anul II", functie: "Medic dentist rezident anul II" },
      { eticheta: "Rezident anul III", functie: "Medic dentist rezident anul III" },
      { eticheta: "Rezident anul IV–V", functie: "Medic dentist rezident anul IV - V" },
      { eticheta: "Medic dentist", functie: "Medic dentist" },
      { eticheta: "Medic specialist dentist", functie: "Medic specialist dentist" },
      { eticheta: "Medic primar dentist", functie: "Medic primar dentist" },
    ],
    nota:
      "Majoritatea stomatologilor lucrează în cabinete private, unde grila nu se aplică. Cifra de mai jos descrie doar sistemul public.",
  },

  farmacist: {
    anexa: "Anexa nr. II",
    sectiune: "Unităti clinice",
    domeniu: "farmacii de spital și unități sanitare publice",
    trepte: [
      { eticheta: "Rezident anul I", functie: "Farmacist rezident anul I" },
      { eticheta: "Rezident anul II", functie: "Farmacist rezident anul II" },
      { eticheta: "Rezident anul III", functie: "Farmacist rezident anul III" },
      { eticheta: "Farmacist", functie: "Farmacist" },
      { eticheta: "Farmacist specialist", functie: "Farmacist specialist" },
      { eticheta: "Farmacist primar", functie: "Farmacist primar*1)" },
    ],
    nota:
      "Cei mai mulți farmaciști lucrează în farmacii cu circuit deschis, private. Grila se aplică farmaciilor din unități sanitare publice.",
  },

  "asistent-medical": {
    anexa: "Anexa nr. II",
    sectiune: "Unităti clinice",
    domeniu: "spitale și institute clinice",
    trepte: [
      { eticheta: "Debutant (postliceal)", functie: "Asistent medical, debutant*2)", studii: "PL" },
      { eticheta: "Asistent medical (postliceal)", functie: "Asistent medical*2)", studii: "PL" },
      { eticheta: "Principal (postliceal)", functie: "Asistent medical, principal*2)", studii: "PL" },
    ],
    nota:
      "Cu studii superioare, aceleași trepte merg de la 5.530 la 6.083 lei. Asistenții de la ambulanță, UPU și ATI au grilă separată, mai mare.",
  },

  fizioterapeut: {
    anexa: "Anexa nr. II",
    sectiune: "Unităti clinice",
    domeniu: "unități sanitare publice",
    trepte: [
      { eticheta: "Debutant", functie: "Fiziokinetoterapeut, bioinginer medical; debutant" },
      { eticheta: "Fiziokinetoterapeut", functie: "Fiziokinetoterapeut, bioinginer medical" },
      { eticheta: "Specialist", functie: "Fiziokinetoterapeut, bioinginer medical; specialist" },
      { eticheta: "Principal", functie: "Fiziokinetoterapeut, bioinginer medical; principal" },
    ],
  },

  psiholog: {
    anexa: "Anexa nr. II",
    domeniu: "unități sanitare și de asistență socială publice",
    trepte: [
      { eticheta: "Stagiar", functie: "Psiholog stagiar" },
      { eticheta: "Practicant", functie: "Psiholog practicant" },
      { eticheta: "Specialist", functie: "Psiholog specialist" },
      { eticheta: "Principal", functie: "Psiholog principal" },
    ],
  },

  "asistent-social": {
    anexa: "Anexa nr. II",
    domeniu: "unități sanitare și de asistență socială publice",
    trepte: [
      { eticheta: "Debutant", functie: "Asistent social debutant" },
      { eticheta: "Practicant", functie: "Asistent social practicant" },
      { eticheta: "Specialist", functie: "Asistent social specialist" },
      { eticheta: "Principal", functie: "Asistent social principal" },
    ],
  },

  infirmier: {
    anexa: "Anexa nr. II",
    sectiune: "Unități clinice",
    domeniu: "spitale și institute clinice",
    trepte: [
      { eticheta: "Debutant", functie: "Infirmieră, agent DDD; debutant" },
      { eticheta: "Infirmier / infirmieră", functie: "Infirmieră, agent DDD" },
    ],
    nota:
      "La ambulanță, UPU și ATI grila e puțin mai mare: 4.693 lei. Funcția apare în lege sub denumirea „infirmieră”, la feminin.",
  },

  judecator: {
    anexa: "Anexa nr. V",
    domeniu: "instanțe judecătorești",
    trepte: [
      { eticheta: "Judecător stagiar", functie: "Judecător stagiar" },
      { eticheta: "Judecătorie, sub 3 ani", functie: "Judecător cu grad de judecătorie; Baza 0-3 ani" },
      { eticheta: "Judecătorie, peste 20 ani", functie: "Judecător cu grad de judecătorie" },
      {
        eticheta: "Tribunal, peste 20 ani",
        functie: "Judecător cu grad de tribunal, judecător militar la tribunalul militar",
      },
      { eticheta: "Curte de apel, peste 20 ani", functie: "Judecător cu grad de curte de apel" },
      { eticheta: "Înalta Curte", functie: "Judecător cu grad de ICCJ" },
    ],
    numeSuma: "indemnizația brută de încadrare",
    nota: "Este indemnizație de încadrare, nu salariu de bază, și crește cu vechimea în funcție.",
  },

  procuror: {
    anexa: "Anexa nr. V",
    domeniu: "parchete",
    trepte: [
      { eticheta: "Procuror stagiar", functie: "Procuror stagiar" },
      { eticheta: "Judecătorie, sub 3 ani", functie: "Procuror cu grad de judecătorie; Baza 0-3 ani" },
      { eticheta: "Judecătorie, peste 20 ani", functie: "Procuror cu grad de judecătorie" },
      {
        eticheta: "Tribunal, peste 20 ani",
        functie: "Procuror cu grad de tribunal, judecător militar la tribunalul militar",
      },
      { eticheta: "Curte de apel, peste 20 ani", functie: "Procuror cu grad de curte de apel" },
      { eticheta: "Parchetul de pe lângă ÎCCJ", functie: "Procuror cu grad de PICCJ" },
    ],
    numeSuma: "indemnizația brută de încadrare",
    nota: "Este indemnizație de încadrare, nu salariu de bază, și crește cu vechimea în funcție.",
  },

  "functionar-public": {
    anexa: "Anexa nr. VIII",
    sectiune: "Funcții publice de stat",
    domeniu: "ministere și instituții centrale",
    trepte: [
      {
        eticheta: "Consilier debutant",
        functie: "Consilier, consilier juridic, expert, inspector; grad profesional debutant",
      },
      {
        eticheta: "Consilier asistent",
        functie: "Consilier, consilier juridic, expert, inspector; grad profesional asistent",
      },
      {
        eticheta: "Consilier principal",
        functie: "Consilier, consilier juridic, expert, inspector; grad profesional principal",
      },
      {
        eticheta: "Consilier superior",
        functie: "Consilier, consilier juridic, expert, inspector; grad profesional superior",
      },
    ],
    nota:
      "În administrația locală și în serviciile deconcentrate grila e mai mică: consilier superior 4.905 lei în loc de 6.580.",
  },

  bibliotecar: {
    anexa: "Anexa nr. III",
    sectiune: "Alte biblioteci*)",
    domeniu: "biblioteci publice, altele decât cele naționale",
    trepte: [
      { eticheta: "Debutant", functie: `${BIBLIOTECAR_IA}; debutant`, studii: "S" },
      { eticheta: "Gradul II", functie: `${BIBLIOTECAR_IA}; gradul II`, studii: "S" },
      { eticheta: "Gradul I", functie: `${BIBLIOTECAR_IA}; gradul I`, studii: "S" },
      { eticheta: "Gradul IA", functie: BIBLIOTECAR_IA, studii: "S" },
    ],
    nota:
      "În bibliotecile naționale și în Biblioteca Academiei Române grila e mai mare: 5.315 lei la gradul IA. Legea salarizează la fel bibliotecarul, bibliograful, redactorul, documentaristul, conservatorul și restauratorul.",
  },

  preot: {
    anexa: "Anexă",
    sectiune: "Culte",
    domeniu: "personal clerical sprijinit de la bugetul de stat",
    trepte: [
      { eticheta: "Debutant (studii superioare)", functie: "Preot; debutant", studii: "S" },
      { eticheta: "Definitiv", functie: "Preot; definitiv", studii: "S" },
      { eticheta: "Gradul II", functie: "Preot; gradul II", studii: "S" },
      { eticheta: "Gradul I", functie: "Preot; gradul I", studii: "S" },
    ],
    nota:
      "Statul asigură doar un sprijin lunar la salarizare, pentru un număr limitat de posturi. Restul veniturilor vine din unitatea de cult.",
  },

  "medic-veterinar": {
    anexa: "Anexa nr. VIII",
    sectiune: "Veterinar",
    domeniu: "direcții sanitar-veterinare",
    trepte: [
      { eticheta: "Debutant", functie: "Medic veterinar debutant" },
      { eticheta: "Gradul III", functie: "Medic veterinar gradul III" },
      { eticheta: "Gradul II", functie: "Medic veterinar gradul II" },
      { eticheta: "Primar / gradul I", functie: "Medic primar veterinar/ Medic veterinar gradul I" },
    ],
    nota: "Mulți medici veterinari lucrează în cabinete private, unde grila nu se aplică.",
  },
};

// ─── Politie, armata, pompieri ───────────────────────────────────────────────
//
// Aici salariul nu e un singur numar din grila. Anexa VI, Sectiunea a 2-a,
// art. 3 alin. (2): „Solda lunara se compune din solda de functie, solda de
// grad, gradatii si, dupa caz, solda de comanda, indemnizatii, compensatii,
// sporuri, prime, premii si din alte drepturi salariale."
//
// Deci cifra de baza a unui politist sau militar e SUMA a doua grile diferite,
// publicate separat in aceeasi anexa. Un site care arata doar solda de functie
// subestimeaza cu 1.600–2.800 de lei. Le adunam si spunem ca le-am adunat.

type TreaptaMilitara = { eticheta: string; functie: string; grad: string };

const MILITARE: Record<string, { domeniu: string; numeSuma: string; nota: string; trepte: TreaptaMilitara[] }> = {
  politist: {
    domeniu: "Poliția Română și poliția penitenciarelor",
    numeSuma: "salariul brut de funcție plus salariul gradului profesional",
    nota:
      "Salariul de funcție are un minim și un maxim; folosim minimul. Peste el vin gradațiile de vechime și sporurile specifice, care la poliție sunt o parte însemnată din venit.",
    trepte: [
      {
        eticheta: "Agent de poliție debutant",
        functie:
          "Funcții corespunzătoare gradului de maistru militar cls. a V-a/sergent/agent de poliție/ penitenciare debutant",
        grad: "Sergent major, agent de poliție/penitenciare",
      },
      {
        eticheta: "Agent-șef",
        functie: "Funcții corespunzătoare gradului de agent-agent șef principal de politie/penitenciare",
        grad: "Plutonier adjutant, agent-șef de poliție/penitenciare",
      },
      {
        eticheta: "Subinspector de poliție",
        functie: "Funcții corespunzătoare gradului de sublocotenent, aspirant, subinspector de poliție/penitenciare",
        grad: "Sublocotenent, aspirant, subinspector de poliție/penitenciare",
      },
      {
        eticheta: "Inspector principal",
        functie: "Funcții corespunzătoare gradului de căpitan, inspector principal de poliție/penitenciare",
        grad: "Căpitan, inspector principal de poliție/penitenciare",
      },
      {
        eticheta: "Comisar-șef",
        functie: "Funcții corespunzătoare gradului de colonel, comandor, comisar-șef de poliție/penitenciare",
        grad: "Colonel, comandor, comisar-șef de poliție/penitenciare",
      },
    ],
  },
  militar: {
    domeniu: "Armata României",
    numeSuma: "solda brută de funcție plus solda de grad",
    nota:
      "Solda de funcție are un minim și un maxim; folosim minimul. Peste ea vin gradațiile de vechime, solda de comandă și sporurile pentru condiții.",
    // Fiecare treapta pereche doua randuri care numesc ACELASI grad in ambele
    // grile. Randurile militare si cele de politie stau amestecate in tabel —
    // „cls. a V-a/sergent/agent de politie" e un singur rand — si o pereche
    // aleasa dupa aproximare ar aduna solda unui grad cu gradul altuia.
    trepte: [
      { eticheta: "Soldat", functie: "Funcții corespunzătoare gradului de soldat", grad: "Soldat" },
      {
        eticheta: "Maistru militar clasa a IV-a",
        functie: "Funcții corespunzătoare gradului de maistru militar cls. a IV-a/sergent major",
        grad: "Maistru militar clasa a IV-a",
      },
      {
        eticheta: "Sublocotenent",
        functie: "Funcții corespunzătoare gradului de sublocotenent, aspirant, subinspector de poliție/penitenciare",
        grad: "Sublocotenent, aspirant, subinspector de poliție/penitenciare",
      },
      {
        eticheta: "Căpitan",
        functie: "Funcții corespunzătoare gradului de căpitan, inspector principal de poliție/penitenciare",
        grad: "Căpitan, inspector principal de poliție/penitenciare",
      },
      {
        eticheta: "Colonel",
        functie: "Funcții corespunzătoare gradului de colonel, comandor, comisar-șef de poliție/penitenciare",
        grad: "Colonel, comandor, comisar-șef de poliție/penitenciare",
      },
    ],
  },
};

// Pompierii militari din IGSU sunt cadre militare: nu au grila proprie in lege,
// ci pe cea din Anexa VI. E o identitate, nu o aproximare.
MILITARE.pompier = {
  ...MILITARE.militar,
  domeniu: "Inspectoratul General pentru Situații de Urgență",
  nota: `Pompierii militari sunt cadre militare și se salarizează după aceeași anexă ca armata. ${MILITARE.militar.nota}`,
};

// ─── Iesirea ─────────────────────────────────────────────────────────────────

export type TreaptaPublica = {
  eticheta: string;
  brut: number;
  net: number;
  /** Descompunerea, unde salariul e o suma de componente (militari, poliție). */
  componente?: { eticheta: string; valoare: number }[];
};

export type GrilaPublica = {
  anexa: string;
  domeniu: string;
  /**
   * Cum se numeste suma IN LEGE. Nu e cosmetic: judecatorii au „indemnizatie de
   * incadrare", nu salariu de baza, iar militarii si politistii au solda de
   * functie plus solda de grad. O pagina care le zice pe toate „salariu de
   * baza" foloseste un termen care nu apare in actul pe care il citeaza.
   */
  numeSuma: string;
  /** „iunie 2024" sau „2022" — se afiseaza, nu se ascunde. */
  coloana: string;
  trepte: TreaptaPublica[];
  nota?: string;
};

const cuNet = (brut: number, rest: Omit<TreaptaPublica, "brut" | "net">): TreaptaPublica | null => {
  const net = calculStandard(brut)?.net;
  return net == null ? null : { ...rest, brut, net };
};

function grilaCivila(def: Definitie): GrilaPublica | null {
  const grile = grileDin(def.anexa, def.sectiune);
  const trepte: TreaptaPublica[] = [];
  let coloana: string | null = null;

  for (const cerere of def.trepte) {
    const gasit = gaseste(grile, cerere);
    if (!gasit) continue;
    const t = cuNet(inPlata(gasit.rand), { eticheta: cerere.eticheta });
    if (!t) continue;
    trepte.push(t);
    coloana ??= gasit.grila.coloane.at(-1) ?? gasit.grila.anul ?? D.coloanaInPlata;
  }
  if (trepte.length < 2) return null;
  // Ordinea de cariera nu e mereu si ordinea salariilor. Un „Medic" fara
  // specialitate ia 8.000 de lei, sub rezidentul de an VI-VII, care ia 9.875 —
  // pentru ca rezidentii din specialitatile lungi sunt platiti mai bine decat
  // un medic nespecializat. Afisam scara dupa bani, crescator, ca acolo se uita
  // cititorul; asa nu mai pare ca grila coboara la mijloc.
  trepte.sort((a, b) => a.brut - b.brut);
  return {
    anexa: def.anexa,
    domeniu: def.domeniu,
    numeSuma: def.numeSuma ?? SALARIU_DE_BAZA,
    coloana: coloana ?? D.coloanaInPlata,
    trepte,
    nota: def.nota,
  };
}

function grilaMilitara(cheie: string): GrilaPublica | null {
  const def = MILITARE[cheie];
  const grile = grileDin("Anexa nr. VI");
  const gFunctie = grile.find((g) => g.etichetaValori !== null);
  const gGrad = grile.find((g) => g.etichetaValori === null);
  if (!gFunctie || !gGrad) return null;

  const trepte: TreaptaPublica[] = [];
  for (const t of def.trepte) {
    const rFunctie = gFunctie.randuri.find((x) => x.functie === t.functie);
    const rGrad = gGrad.randuri.find((x) => x.functie === t.grad);
    if (!rFunctie || !rGrad) continue;
    // Intervalul minim–maxim: luam minimul, ca sa nu promitem capatul de sus.
    const solda = rFunctie.valori[0];
    const grad = rGrad.valori[0];
    const rand = cuNet(solda + grad, {
      eticheta: t.eticheta,
      componente: [
        { eticheta: "Salariu / soldă de funcție", valoare: solda },
        { eticheta: "Salariul gradului profesional", valoare: grad },
      ],
    });
    if (rand) trepte.push(rand);
  }
  if (trepte.length < 2) return null;
  return {
    anexa: "Anexa nr. VI",
    domeniu: def.domeniu,
    numeSuma: def.numeSuma,
    coloana: gFunctie.anul ?? D.coloanaInPlata,
    trepte,
    nota: def.nota,
  };
}

/**
 * Grila legala pentru o meserie, sau `null` daca meseria nu e bugetara.
 *
 * Majoritatea meseriilor din catalog intorc `null`, si e in regula: un
 * programator sau un barman nu au salariu stabilit prin lege. Pentru ele
 * ramane estimarea statistica din `ocupatii-caen.ts`.
 */
export function grilaPublica(slug: string): GrilaPublica | null {
  // `Object.hasOwn`, nu `in` si nu `DEFINITII[slug]`. Catalogul are o meserie cu
  // slugul „constructor", iar `DEFINITII["constructor"]` intoarce constructorul
  // mostenit din Object.prototype — un obiect adevarat, fara `trepte`. Cu `in`
  // sau cu indexare simpla, pagina /salarii/constructor cade la build cu
  // „trepte is not iterable". La fel ar face „toString" sau „valueOf".
  if (Object.hasOwn(MILITARE, slug)) return grilaMilitara(slug);
  return Object.hasOwn(DEFINITII, slug) ? grilaCivila(DEFINITII[slug]) : null;
}

/** Slugurile acoperite, pentru teste si pentru hub. */
export const MESERII_CU_GRILA = [...Object.keys(DEFINITII), ...Object.keys(MILITARE)].sort();
