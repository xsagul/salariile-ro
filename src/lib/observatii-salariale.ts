// src/lib/observatii-salariale.ts
//
// Modelul unic pentru salarii observate pe OCUPATIE, nu pe sector.
//
// Datele INS din `ins-date.ts` raspund la „cat se castiga in activitatea CAEN X"
// si „cat castiga grupa majora ISCO Y". Niciuna nu raspunde la „cat castiga un
// zugrav". Fisierul asta tine cealalta specie de date: observatii individuale,
// fiecare cu ocupatia ei, sursa ei si data ei.
//
// E deliberat agnostic de sursa. Aceeasi structura primeste:
//   - grile de salarizare publica (Legea 153/2017, art. 33) — pe functie;
//   - intervale din anunturi de angajare — pe titlu de post;
//   - orice sursa viitoare, inclusiv date declarate.
// Fara modelul asta, fiecare sursa noua cere rescris de la zero.
//
// Ce NU tine: text de anunt, nume de angajator, descrieri. Doar cifra, ocupatia,
// locul, data si o referinta verificabila catre sursa.

import { MESERII, type Meserie } from "@/lib/meserii";

/** De unde vine observatia. Determina cum se eticheteaza public cifra. */
export type FelSursa =
  /** Grila publicata de o institutie publica pe baza Legii 153/2017. */
  | "lege-153"
  /** Interval declarat intr-un anunt de angajare. */
  | "anunt"
  /** Salariu raportat direct de o persoana. */
  | "declarat";

/** Ce reprezinta suma. Nu amestecam brut cu net si nici baza cu realizat. */
export type FelSuma = "brut" | "net";

export type ObservatieSalariala = {
  /** Slug-ul meseriei din catalog. `null` daca nu s-a putut incadra. */
  meserie: string | null;
  /** Codul COR, cand sursa il declara. Cea mai buna cheie de incadrare. */
  cor?: string;
  /** Titlul brut, pastrat doar pentru audit si reincadrare ulterioara. */
  titluSursa: string;
  fel: FelSursa;
  suma: FelSuma;
  /** Capetele intervalului, in lei/luna. Egale cand sursa da o singura cifra. */
  minim: number;
  maxim: number;
  /** Judetul, unde sursa il precizeaza. */
  judet?: string;
  /** Data la care a fost observata cifra, ISO `YYYY-MM-DD`. */
  data: string;
  /** Referinta verificabila: URL de document, numar de act, identificator. */
  referinta: string;
  /** Cohorta trebuie declarată de importator; lipsa ei împiedică publicarea. */
  perioada?: string;
  concept?: "baza" | "realizat" | "ofertat";
  norma?: "intreaga" | "partiala";
  experienta?: string;
  /** Identificator stabil al înregistrării, pentru deduplicare. */
  id?: string;
  reutilizarePermisa?: boolean;
};

/**
 * Pragul sub care nu publicam nimic pe o celula. Aceeasi logica pe care o
 * folosesc si competitorii care lucreaza cu sondaje, din acelasi motiv: sub
 * cateva observatii, o „medie" e un accident, nu o masuratoare.
 */
export const PRAG_PUBLICARE = 30;

export type Agregat = {
  meserie: string;
  judet: string | null;
  suma: FelSuma;
  /** Numarul de observatii din spatele cifrelor. Se afiseaza intotdeauna. */
  observatii: number;
  median: number;
  mean: number;
  p25: number | null;
  p75: number | null;
  /** Cea mai veche si cea mai noua observatie folosita. */
  dataPrimei: string;
  dataUltimei: string;
  surse: FelSursa[];
};

/** Percentila prin rang apropiat, pe o serie deja sortata crescator. */
function percentila(sortate: number[], p: number): number {
  if (sortate.length === 0) throw new Error("Serie goala.");
  const rang = Math.ceil((p / 100) * sortate.length);
  return sortate[Math.min(Math.max(rang, 1), sortate.length) - 1];
}

const faraDiacritice = (x: string) =>
  x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const cuvinte = (x: string) =>
  faraDiacritice(x)
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

const indexCor = new Map<string, Meserie>();
for (const m of MESERII) if (m.cor && MESERII.filter(x=>x.cor===m.cor).length === 1) indexCor.set(m.cor, m);

/**
 * Incadreaza un titlu liber intr-o meserie din catalog.
 *
 * Ordinea conteaza: codul COR e declarat de sursa si e neambiguu, deci bate
 * orice potrivire pe text. Potrivirea pe nume cere ca *toate* cuvintele numelui
 * nostru sa apara in titlu — cuvintele in plus din titlu („junior", orasul,
 * „cautam") sunt inofensive, cele lipsa descalifica.
 *
 * Nu filtram cuvinte de grad din numele din catalog: acolo fiecare cuvant e
 * ales, iar „Asistent medical" e ocupatie, nu treapta. Un filtru de genul asta
 * a facut, la prima versiune, ca „Registrator medical" sa se incadreze la
 * „Asistent medical" — exact greseala pe care modelul trebuie s-o previna.
 *
 * Preferam sa nu incadram decat sa incadram gresit: o observatie neincadrata se
 * poate relua, una pusa pe meseria gresita strica o cifra publicata.
 */
export function incadreaza(titlu: string, cor?: string): Meserie | null {
  if (cor) {
    const dupaCor = indexCor.get(cor);
    if (dupaCor) return dupaCor;
    // O grupă de bază nu identifică ocupația. Nu ignorăm un COR explicit.
    return null;
  }

  const tokTitlu = new Set(cuvinte(titlu));
  if (tokTitlu.size === 0) return null;

  let castigator: Meserie | null = null;
  let scorMax = 0;
  for (const m of MESERII) {
    const tokMeserie = cuvinte(m.nume);
    if (tokMeserie.length === 0) continue;
    if (!tokMeserie.every((t) => tokTitlu.has(t))) continue;
    // Numele mai lung care se potriveste integral e mai specific.
    if (tokMeserie.length > scorMax) {
      scorMax = tokMeserie.length;
      castigator = m;
    }
  }
  return castigator;
}

/**
 * Agrega observatiile unei meserii intr-o cifra publicabila.
 *
 * Nu amesteca brut cu net si nu amesteca judete: cine cere agregat pe judet
 * primeste doar observatiile din judetul ala. Intoarce `null` sub prag — apelantul
 * trebuie sa trateze cazul, nu sa afiseze o cifra slaba cu o nota mica.
 */
export function agregheaza(
  observatii: ObservatieSalariala[],
  optiuni: { meserie: string; suma: FelSuma; judet?: string | null; prag?: number },
): Agregat | null {
  const { meserie, suma, judet = null, prag = PRAG_PUBLICARE } = optiuni;

  if (!Number.isInteger(prag) || prag < PRAG_PUBLICARE) return null;
  const candidate = observatii.filter(
    (o) =>
      o.meserie === meserie &&
      o.suma === suma &&
      (judet === null || o.judet === judet) &&
      Number.isFinite(o.minim) &&
      Number.isFinite(o.maxim) &&
      o.minim > 0 &&
      o.maxim === o.minim &&
      o.fel !== "lege-153" &&
      o.reutilizarePermisa === true && !!o.id && !!o.perioada &&
      !!o.concept && !!o.norma && !!o.experienta &&
      /^\d{4}-\d{2}-\d{2}$/.test(o.data) &&
      Number.isFinite(Date.parse(o.data)),
  );
  // Nu calculăm statistici din intervale, grile sau cohorte incompatibile.
  const cohorta = new Set(candidate.map(o=>JSON.stringify([o.fel,o.perioada,o.concept,o.norma,o.experienta])));
  if (cohorta.size !== 1) return null;
  const unice = new Map<string, ObservatieSalariala>();
  for (const o of candidate) {
    const anterior=unice.get(o.id!);
    if(anterior && JSON.stringify(anterior)!==JSON.stringify(o)) return null;
    unice.set(o.id!,o);
  }
  const relevante=[...unice.values()];
  if (relevante.length < prag) return null;

  const valori = relevante.map((o) => o.minim).sort((a, b) => a - b);
  const date = relevante.map((o) => o.data).sort();

  return {
    meserie,
    judet,
    suma,
    observatii: relevante.length,
    median: (valori[Math.floor((valori.length-1)/2)] + valori[Math.floor(valori.length/2)]) / 2,
    mean: valori.reduce((a,b)=>a+b,0)/valori.length,
    p25: valori.length >= 60 ? percentila(valori, 25) : null,
    p75: valori.length >= 60 ? percentila(valori, 75) : null,
    dataPrimei: date[0],
    dataUltimei: date[date.length - 1],
    surse: [...new Set(relevante.map((o) => o.fel))],
  };
}

/** Toate agregatele care trec pragul, pentru o serie de observatii. */
export function agregheazaTot(
  observatii: ObservatieSalariala[],
  prag = PRAG_PUBLICARE,
): Agregat[] {
  const chei = new Set<string>();
  for (const o of observatii) {
    if (!o.meserie) continue;
    chei.add(`${o.meserie}\u0000${o.suma}\u0000`);
    if (o.judet) chei.add(`${o.meserie}\u0000${o.suma}\u0000${o.judet}`);
  }

  const rezultate: Agregat[] = [];
  for (const cheie of chei) {
    const [meserie, suma, judet] = cheie.split("\u0000");
    const agregat = agregheaza(observatii, {
      meserie,
      suma: suma as FelSuma,
      judet: judet || null,
      prag,
    });
    if (agregat) rezultate.push(agregat);
  }
  return rezultate.sort(
    (a, b) => a.meserie.localeCompare(b.meserie) || (a.judet ?? "").localeCompare(b.judet ?? ""),
  );
}

/** Eticheta publica a sursei. Fiecare cifra afisata o poarta. */
export function etichetaSursa(fel: FelSursa): string {
  switch (fel) {
    case "lege-153":
      return "grilă de salarizare publicată conform Legii 153/2017";
    case "anunt":
      return "intervale declarate în anunțuri de angajare";
    case "declarat":
      return "salarii raportate direct";
  }
}
