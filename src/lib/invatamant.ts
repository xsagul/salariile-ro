// src/lib/invatamant.ts
//
// Salarizarea personalului didactic din invatamantul preuniversitar de stat,
// dupa Legea-cadru nr. 153/2017, Anexa I, Capitolul I.
//
// De ce e o grila separata si nu coeficienti: pentru preuniversitar, anexa da
// SUME IN LEI la Gradatia 0, nu coeficienti inmultiti cu salariul minim. Grila
// pe coeficienti (1,57-2,21) din aceeasi anexa se aplica invatamantului
// SUPERIOR. Confundarea celor doua da cifre gresite exact pentru publicul cel
// mai mare.
//
// Ce coloana e in plata azi. Anexa are doua coloane, ianuarie 2024 si iunie
// 2024. Cea in plata in 2026 e iunie 2024, prin lantul de mentinere verificat
// in textul consolidat:
//   - in anul 2025, de la 1 ianuarie, cuantumul brut al salariilor de baza se
//     mentine la nivelul lunii decembrie 2024;
//   - in anul 2026, de la 1 ianuarie, se mentine la nivelul lunii decembrie 2025.
//
// ATENTIE la doua feluri de vechime, usor de confundat:
//   - `vechimeInvatamant` — selecteaza RANDUL din grila (e in tabel);
//   - `vechimeMunca`      — da GRADATIA, aplicata peste valoarea din grila.
// Un profesor cu 22 de ani in invatamant are randul "peste 25 ani"? Nu. Are
// randul "20-25 ani" si gradatia 5.
//
// Legea 153/2017 urmeaza sa fie abrogata de o lege-cadru noua, aflata in
// proiect la data scrierii. Structura de mai jos e pregatita pentru al doilea
// regim, ca in `fiscal.ts`.
//
// DAR nu se construieste pe proiect. Decizie a proprietarului, 28 august 2026:
// se pune numai legislatie IN VIGOARE. Un proiect se schimba pana la adoptare —
// grilele de invatamant s-au schimbat deja intre versiunea din 25 mai si cea
// transmisa sindicatelor pe 20 august — iar daca legea trece abia anul viitor,
// publicarea lui acum inseamna un an de cifre false.
//
// Declansatorul pentru al doilea regim e PUBLICAREA IN MONITORUL OFICIAL, nu
// adoptarea in Parlament si nu articolele de presa. Cand se intampla, de
// verificat in primul rand: gradatia de merit (+25%, art. 5) dispare in proiect,
// deci `MAJORARI` trebuie legata de regim, nu lasata globala.

import grilaData from "@/data/grila-invatamant-153-2017.json";

export const SURSA_GRILA = grilaData.sursa;

export type NivelStudii = "S" | "SSD" | "M";

export type RandGrila = {
  nr: number;
  functie: string;
  studii: string;
  vechime: string;
  ian2024: number;
  iun2024: number;
};

export const GRILA: RandGrila[] = grilaData.randuri as RandGrila[];

/** Coloana in plata. Se schimba doar cand se schimba legea, nu la editare. */
export const COLOANA_IN_PLATA = "iun2024" as const;

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

// ─── Majorari specifice personalului didactic (Anexa I, cap. I, lit. B) ──────
//
// Ordinea conteaza. ORDINUL 3.993/2021, art. 1 alin. (1): majorarile de la
// art. 4, art. 5 alin. (1), art. 7 si art. 8 "se aplica la salariul de baza
// DETINUT/aflat in plata" — adica dupa gradatie, nu peste valoarea din anexa.

export type Majorare = {
  cod: string;
  eticheta: string;
  /** Cota aplicata la salariul de baza detinut. */
  cota: number;
  /** Temeiul, asa cum se afiseaza public. */
  temei: string;
};

export const MAJORARI: Majorare[] = [
  {
    cod: "dirigentie",
    eticheta: "Dirigenție / învățător / educatoare / profesor înv. primar sau preșcolar",
    cota: 0.10,
    temei: "Anexa I, cap. I, lit. B, art. 8",
  },
  {
    cod: "gradatie-merit",
    eticheta: "Gradație de merit",
    cota: 0.25,
    temei: "Anexa I, cap. I, lit. B, art. 5 alin. (1)",
  },
  {
    cod: "simultan-2",
    eticheta: "Predare simultană la 2 clase",
    cota: 0.07,
    temei: "Anexa I, cap. I, lit. B, art. 7 lit. a)",
  },
];

/** Indemnizatia pentru titlul stiintific de doctor — suma fixa, nu procent. */
export const INDEMNIZATIE_DOCTORAT_2026 = 500;
export const TEMEI_DOCTORAT = "OUG 7/2026, art. LIV alin. (1)";

// ─── Indemnizatia de hrana (art. 18) ─────────────────────────────────────────
//
// Art. 18 alin. (1), in forma de la 1 ianuarie 2026 (modificat prin Legea
// 141/2025, art. XV pct. 5): 347 lei lunar, pentru personalul "ale carui
// salarii lunare sunt de pana la 6.000 lei net inclusiv".
//
// Alin. (1^2), introdus prin OUG 10/2024 SPECIAL pentru invatamant: pragul se
// aplica "prin raportare la salariul NET CUVENIT FUNCTIEI DE BAZA". Asta
// rezolva circularitatea — se compara netul salariului de baza, nu netul final
// care ar include chiar indemnizatia.
//
// Se acorda proportional cu timpul efectiv lucrat in luna anterioara
// (alin. (2)); calculatorul presupune luna intreaga.
//
// Este venit salarial si se impoziteaza: intra in brut inainte de CAS/CASS/
// impozit. Asa o trateaza si calculatorul de pe salarii.invatamantpreuniversitar.ro,
// care e referinta de piata pe segmentul asta.
//
// Sub grila actuala pragul nu musca niciodata: maximul e 8.215 lei la gradatia
// 0, adica 10.230 cu gradatia 5, iar netul lui e 5.984 lei. Primul brut cu net
// peste 6.000 e 10.259. Verificarea ramane in cod pentru cazul in care grila
// creste — nu ca sa fie decorativa.

export const INDEMNIZATIE_HRANA = 347;
export const PLAFON_HRANA_NET = 6000;
export const TEMEI_HRANA = "Legea 153/2017, art. 18 alin. (1) și (1^2)";

// ─── Calculul ────────────────────────────────────────────────────────────────

export type IntrareInvatamant = {
  /** Numarul functiei din grila (1–21). */
  functie: number;
  /** Randul de vechime in invatamant, exact ca in grila. */
  vechimeInvatamant: string;
  /** Vechimea in MUNCA, in ani impliniti — da gradatia. */
  aniMunca: number;
  /** Codurile majorarilor bifate. */
  majorari?: string[];
  /** Titlu stiintific de doctor, in domeniul postului. */
  doctorat?: boolean;
};

export type LinieCalcul = {
  eticheta: string;
  suma: number;
  temei: string;
};

export type RezultatInvatamant = {
  salariuGrila: number;
  gradatie: NivelGradatie;
  salariuDeBaza: number;
  linii: LinieCalcul[];
  brutTotal: number;
  rand: RandGrila;
};

export function calculeazaInvatamant(input: IntrareInvatamant): RezultatInvatamant | null {
  const rand = GRILA.find(
    (g) => g.nr === input.functie && g.vechime === input.vechimeInvatamant,
  );
  if (!rand) return null;

  const salariuGrila = rand[COLOANA_IN_PLATA];
  const gradatie = gradatiaDupaVechime(input.aniMunca);
  const salariuDeBaza = aplicaGradatia(salariuGrila, gradatie);

  const linii: LinieCalcul[] = [];
  let total = salariuDeBaza;

  for (const cod of input.majorari ?? []) {
    const m = MAJORARI.find((x) => x.cod === cod);
    if (!m) continue;
    const suma = Math.round(salariuDeBaza * m.cota);
    linii.push({ eticheta: m.eticheta, suma, temei: m.temei });
    total += suma;
  }

  if (input.doctorat) {
    linii.push({
      eticheta: "Indemnizație titlu științific de doctor",
      suma: INDEMNIZATIE_DOCTORAT_2026,
      temei: TEMEI_DOCTORAT,
    });
    total += INDEMNIZATIE_DOCTORAT_2026;
  }

  return { salariuGrila, gradatie, salariuDeBaza, linii, brutTotal: total, rand };
}

// ─── Netul ───────────────────────────────────────────────────────────────────
//
// Se leaga la `calculeaza()` din fiscal.ts, care detine regulile fiscale. Aici
// nu se rescrie nicio cota — modulul asta stie doar sa compuna brutul.
//
// `salariuDeBaza` se transmite explicit pentru ca brutul e compus (baza +
// majorari): facilitatea OUG 89/2025 se decide pe baza, nu pe brutul compus.
// La salariile din invatamant facilitatea oricum nu se aplica (pragul e mult
// sub), dar transmiterea corecta e ce face calculul valabil si daca pragurile
// se schimba.

import { calculeaza, type Rezultat } from "@/lib/fiscal";

export type RezultatComplet = RezultatInvatamant & {
  fiscal: Rezultat;
};

/** Netul salariului de baza — baza de comparatie pentru pragul de la art. 18. */
function netulFunctieiDeBaza(salariuDeBaza: number): number | null {
  const r = calculeaza({
    brut: String(salariuDeBaza),
    tichete: "",
    functieDeBAza: true,
    persoanePretretinere: 0,
    varstaSub26: false,
    copiiScolarizati: 0,
    scutitImpozit: false,
    normaContract: "intreaga",
  });
  return r ? r.netBani : null;
}

export function calculeazaInvatamantComplet(
  input: IntrareInvatamant,
  optiuni?: { persoanePretretinere?: number; faraHrana?: boolean },
): RezultatComplet | null {
  const brut = calculeazaInvatamant(input);
  if (!brut) return null;

  // Indemnizatia de hrana intra in brut inainte de contributii, dar numai daca
  // netul functiei de baza e sub plafon. `faraHrana` e pentru personalul care
  // primeste alte drepturi de hrana — exclus expres de art. 18 alin. (1).
  const netBaza = netulFunctieiDeBaza(brut.salariuDeBaza);
  const areHrana = !optiuni?.faraHrana && netBaza !== null && netBaza <= PLAFON_HRANA_NET;

  if (areHrana) {
    brut.linii.push({
      eticheta: "Indemnizație de hrană",
      suma: INDEMNIZATIE_HRANA,
      temei: TEMEI_HRANA,
    });
    brut.brutTotal += INDEMNIZATIE_HRANA;
  }

  const fiscal = calculeaza({
    brut: String(brut.brutTotal),
    salariuDeBaza: String(brut.salariuDeBaza),
    tichete: "",
    functieDeBAza: true,
    persoanePretretinere: optiuni?.persoanePretretinere ?? 0,
    varstaSub26: false,
    copiiScolarizati: 0,
    scutitImpozit: false,
    normaContract: "intreaga",
  });
  if (!fiscal) return null;

  return { ...brut, fiscal };
}

/** Functiile distincte din grila, pentru selector. */
export function functiiDisponibile(): { nr: number; functie: string; studii: string }[] {
  const vazute = new Set<number>();
  const out: { nr: number; functie: string; studii: string }[] = [];
  for (const g of GRILA) {
    if (vazute.has(g.nr)) continue;
    vazute.add(g.nr);
    out.push({ nr: g.nr, functie: g.functie, studii: g.studii });
  }
  return out.sort((a, b) => a.nr - b.nr);
}

/** Transele de vechime in invatamant disponibile pentru o functie. */
export function vechimiPentruFunctie(nr: number): string[] {
  return GRILA.filter((g) => g.nr === nr).map((g) => g.vechime);
}
