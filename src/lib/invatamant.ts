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

// ─── Axele de selectie, pentru interfata cu pastile ──────────────────────────
//
// Grila are 21 de "functii" cu gradul copt in denumire — "Profesor,
// educator-puericultor studii superioare de lunga durata grad didactic I".
// Intr-un dropdown, o educatoare trebuie sa parcurga toate ca sa se recunoasca.
//
// Descompunerea in trei axe (grup x grad x studii) reconstituie exact cele 21
// de combinatii, fara coliziuni — verificat in test. Asta permite selectoare
// separate, cu combinatiile imposibile dezactivate: profesor si institutor
// exista doar cu S si SSD, invatator si necalificat doar cu M.

export type Grup = "profesor" | "institutor" | "invatator" | "necalificat";
export type Grad = "gradul-i" | "gradul-ii" | "definitivat" | "debutant" | "fara-grad";

export const GRUPURI: { cod: Grup; eticheta: string; exemple: string }[] = [
  { cod: "profesor", eticheta: "Profesor", exemple: "profesor, educator-puericultor" },
  { cod: "institutor", eticheta: "Institutor", exemple: "institutor, maistru-instructor" },
  { cod: "invatator", eticheta: "Învățător / educatoare", exemple: "învățător, educatoare, maistru-instructor, educator-puericultor" },
  { cod: "necalificat", eticheta: "Fără pregătire de specialitate", exemple: "suplinitor necalificat" },
];

export const GRADE: { cod: Grad; eticheta: string; explicatie: string }[] = [
  { cod: "gradul-i", eticheta: "Gradul I", explicatie: "cel puțin 4 ani de la obținerea gradului II" },
  { cod: "gradul-ii", eticheta: "Gradul II", explicatie: "cel puțin 4 ani de la definitivat" },
  { cod: "definitivat", eticheta: "Definitivat", explicatie: "după examenul de definitivare în învățământ" },
  { cod: "debutant", eticheta: "Debutant", explicatie: "până la obținerea definitivatului" },
  { cod: "fara-grad", eticheta: "Fără grad", explicatie: "fără pregătire de specialitate" },
];

export const NIVELURI: { cod: string; eticheta: string; explicatie: string }[] = [
  { cod: "S", eticheta: "S", explicatie: "studii superioare de lungă durată" },
  { cod: "SSD", eticheta: "SSD", explicatie: "studii superioare de scurtă durată" },
  { cod: "M", eticheta: "M", explicatie: "studii medii, nivel liceal" },
];

/** Descompunerea celor 21 de functii, derivata din denumiri. */
const AXE: { nr: number; grup: Grup; grad: Grad; studii: string }[] = (() => {
  const tipareGrad: [RegExp, Grad][] = [
    [/grad didactic I$/, "gradul-i"],
    [/grad didactic II$/, "gradul-ii"],
    [/grad didactic definitiv$/, "definitivat"],
    [/debutant$/, "debutant"],
    [/fără pregătire de specialitate\)$/, "fara-grad"],
  ];
  const tipareGrup: [RegExp, Grup][] = [
    [/^Profesor, educator-puericultor/, "profesor"],
    [/^Institutor, maistru-instructor/, "institutor"],
    [/^Învățător, educatoare, maistru-\s?instructor/, "invatator"],
    [/^Profesor, învățător, educatoare, educator/, "necalificat"],
  ];
  const vazute = new Set<number>();
  const out: { nr: number; grup: Grup; grad: Grad; studii: string }[] = [];
  for (const r of GRILA) {
    if (vazute.has(r.nr)) continue;
    vazute.add(r.nr);
    const grad = tipareGrad.find(([re]) => re.test(r.functie))?.[1];
    const grup = tipareGrup.find(([re]) => re.test(r.functie))?.[1];
    if (grad && grup) out.push({ nr: r.nr, grup, grad, studii: r.studii });
  }
  return out.sort((a, b) => a.nr - b.nr);
})();

export function toateAxele() {
  return AXE;
}

/** Numarul functiei pentru o combinatie, sau null daca nu exista. */
export function functiaPentru(grup: Grup, grad: Grad, studii: string): number | null {
  return AXE.find((a) => a.grup === grup && a.grad === grad && a.studii === studii)?.nr ?? null;
}

/** Gradele posibile pentru un grup (restul se dezactiveaza in interfata). */
export function gradePosibile(grup: Grup): Set<Grad> {
  return new Set(AXE.filter((a) => a.grup === grup).map((a) => a.grad));
}

/** Nivelurile de studii posibile pentru un grup si un grad. */
export function studiiPosibile(grup: Grup, grad: Grad): Set<string> {
  return new Set(AXE.filter((a) => a.grup === grup && a.grad === grad).map((a) => a.studii));
}

// ─── Functii de conducere si didactice auxiliare (sectiunile 2 si 6) ─────────
//
// Aceeasi anexa, alte doua tabele. Motivul pentru care exista aici: un director
// de scoala sau contabilul unitatii ajung pe aceeasi pagina si nu se gaseau in
// grila didactica. Sectiunea 6 e cea mai mare din toata anexa — 296 de randuri.

import grileExtra from "@/data/grile-anexa1-conducere-auxiliar.json";

export const SURSA_GRILE_EXTRA = grileExtra.sursa;

export type RandConducere = {
  nr: number;
  functie: string;
  studii: string;
  gradI: { ian2024: number; iun2024: number };
  gradII: { ian2024: number; iun2024: number };
};

export type RandAuxiliar = {
  nr: number;
  functie: string;
  treapta: string;
  studii: string;
  ian2024: number;
  iun2024: number;
};

export const CONDUCERE: RandConducere[] = grileExtra.conducere.randuri as RandConducere[];
export const AUXILIAR: RandAuxiliar[] = grileExtra.auxiliar.randuri as RandAuxiliar[];

export const REGULI_CONDUCERE = grileExtra.conducere.reguli;

/** Diminuarea pentru studii superioare de scurta durata la functiile de conducere. */
export const DIMINUARE_SSD_CONDUCERE = 0.20;

/**
 * Salariul unei functii de conducere.
 *
 * CRITIC: la conducere NU se aplica gradatia de vechime. Nota 2 de sub tabelul
 * sectiunii 2: "Salariile de baza prevazute la gradul I si gradul II cuprind
 * sporul de vechime in munca la nivel maxim." Aplicarea gradatiei peste ar
 * umfla rezultatul cu pana la 24,52%.
 */
export function salariuConducere(
  nr: number,
  grad: "I" | "II",
  studiiScurte = false,
): { salariu: number; rand: RandConducere; temei: string } | null {
  const rand = CONDUCERE.find((r) => r.nr === nr);
  if (!rand) return null;
  const brut = (grad === "I" ? rand.gradI : rand.gradII)[COLOANA_IN_PLATA];
  const salariu = studiiScurte ? Math.round(brut * (1 - DIMINUARE_SSD_CONDUCERE)) : brut;
  return {
    salariu,
    rand,
    temei:
      "Anexa I, cap. I, pct. 2" +
      (studiiScurte ? " · nota 1 (studii superioare de scurtă durată, −20%)" : "") +
      " · include sporul de vechime la nivel maxim (nota 2)",
  };
}

/** Functiile auxiliare distincte, pentru selector. */
export function functiiAuxiliare(): { nr: number; functie: string }[] {
  const vazute = new Set<number>();
  const out: { nr: number; functie: string }[] = [];
  for (const r of AUXILIAR) {
    if (vazute.has(r.nr)) continue;
    vazute.add(r.nr);
    out.push({ nr: r.nr, functie: r.functie });
  }
  return out.sort((a, b) => a.functie.localeCompare(b.functie, "ro"));
}

/** Treptele disponibile pentru o functie auxiliara. */
export function trepteAuxiliare(nr: number): RandAuxiliar[] {
  return AUXILIAR.filter((r) => r.nr === nr);
}

/**
 * Salariul unei functii didactice auxiliare. Sumele sunt la Gradatia 0, deci
 * aici gradatia se aplica normal, spre deosebire de conducere.
 */
export function salariuAuxiliar(
  nr: number,
  treapta: string,
  aniMunca: number,
): { salariuGrila: number; gradatie: NivelGradatie; salariuDeBaza: number; rand: RandAuxiliar } | null {
  const rand = AUXILIAR.find((r) => r.nr === nr && r.treapta === treapta);
  if (!rand) return null;
  const gradatie = gradatiaDupaVechime(aniMunca);
  return {
    salariuGrila: rand[COLOANA_IN_PLATA],
    gradatie,
    salariuDeBaza: aplicaGradatia(rand[COLOANA_IN_PLATA], gradatie),
    rand,
  };
}
