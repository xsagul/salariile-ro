// src/lib/joburi.ts
//
// Hubul de recrutare. Regula care defineste produsul si care e impusa de TIP,
// nu de conventie: `salariu` NU e optional. Un anunt fara salariu nu se poate
// construi, deci nu poate exista pe site.
//
// De ce asa: pe eJobs, 22,5% dintre anunturi publica salariul (masurat pe un
// esantion de 40 din feedul lor RSS, 29 august 2026, prin `baseSalary` din
// JSON-LD). Restul de 77,5% sunt „salariu negociabil". Diferentierea noastra nu
// e volumul — nu-l putem castiga — ci ca la noi cifra exista intotdeauna.
//
// Al doilea lucru pe care nu-l are nimeni: NETUL. eJobs afiseaza „4.200-6.100
// lei" si atat. Noi trecem fiecare interval prin `calculStandard` si aratam cat
// ramane in mana. E acelasi motor fiscal care alimenteaza calculatorul, deci
// cifra din anunt si cifra din calculator nu pot diverge.
//
// Legea transparentei salariale (proiect L445/2026, inca neadoptat) NU obliga
// la publicarea salariului in anunt — obliga la comunicarea lui candidatului in
// procesul de recrutare. Verificat pe 29 august 2026. Deci hubul asta nu se
// bazeaza pe lege ca sa existe; legea doar face norma ceea ce noi cerem oricum.

import { brutDinNetStandard, calculStandard } from "@/lib/fiscal";
import { distantaKm, localitate as gasesteLocalitate, type Localitate } from "@/lib/localitati";

export type ModLucru = "la-birou" | "hibrid" | "remote";
export type TipContract = "norma-intreaga" | "part-time" | "temporar" | "internship" | "sezonier";

export const MOD_LUCRU: Record<ModLucru, string> = {
  "la-birou": "La birou",
  hibrid: "Hibrid",
  remote: "Remote",
};

export const TIP_CONTRACT: Record<TipContract, string> = {
  "norma-intreaga": "Normă întreagă",
  "part-time": "Part-time",
  temporar: "Perioadă determinată",
  internship: "Internship",
  sezonier: "Sezonier",
};

/**
 * Intervalul lunar. Ambele capete obligatorii — un singur numar e tot un
 * interval, cu min = max.
 *
 * `tip` exista pentru ca jumatate din piata nu gandeste in brut. In HoReCa,
 * retail, constructii sau curatenie, oferta se spune „2.500 in mana" — adica
 * net. Daca am cere angajatorului sa converteasca singur, ar gresi sau ar
 * renunta, iar cifra publicata ar fi falsa. Asa ca il intrebam ce a vrut sa
 * spuna si convertim noi, in ambele sensuri.
 */
export type IntervalSalariu = {
  min: number;
  max: number;
  /** Deocamdata doar RON. Anunturile in euro se convertesc la publicare, nu la afisare. */
  moneda: "RON";
  /** Ce a declarat angajatorul: suma din contract sau suma din mana. */
  tip: "brut" | "net";
};

export type Job = {
  slug: string;
  titlu: string;
  companie: string;
  /** Slugul localitatii din `localitati.ts`. Normalizat, ca sa functioneze filtrul de distanta. */
  localitate: string;
  modLucru: ModLucru;
  tipContract: TipContract;
  /** OBLIGATORIU. Vezi comentariul din capul fisierului. */
  salariu: IntervalSalariu;
  /** Categoria din catalogul de meserii, ca sa putem lega anuntul de pagina de meserie. */
  categorie: string;
  /** Slugul meseriei din `meserii.ts`, cand se poate potrivi. Leaga anuntul de cifra INS. */
  meserie?: string;
  descriere: string;
  cerinte?: string[];
  /**
   * Contactul. Ordinea nu e intamplatoare: in HoReCa, retail, constructii sau
   * transport nimeni nu trimite CV — se suna. Un `tel:` pe telefon e o singura
   * apasare, cel mai mic efort posibil pentru un candidat. Emailul si formularul
   * de pe site-ul companiei raman pentru gulerele albe.
   */
  aplicaTelefon?: string;
  aplicaUrl?: string;
  aplicaEmail?: string;
  /** ISO. Data publicarii si data expirarii — ambele cerute de schema JobPosting. */
  publicatLa: string;
  expiraLa: string;
};

// ─── Sursa de date ───────────────────────────────────────────────────────────
//
// Deocamdata un fisier. NU e o solutie de durata: un hub de anunturi are nevoie
// de scriere, deci de o baza de date si de un flux de moderare. Pana se decide
// infrastructura, fisierul lasa sa se verifice ruta, SEO-ul, schema si forma
// paginii fara sa angajam nimic — si fara ca site-ul sa colecteze ceva.

import joburiData from "@/data/joburi.json";

export const JOBURI: Job[] = joburiData.joburi as Job[];
export const SURSA_JOBURI = joburiData.sursa;

// ─── Netul ───────────────────────────────────────────────────────────────────

export type SalariuCalculat = {
  brutMin: number;
  brutMax: number;
  netMin: number;
  netMax: number;
  /** true cand min === max, ca sa nu afisam „3.000 – 3.000 lei". */
  fix: boolean;
  /** Capatul declarat de angajator; celalalt e calculat de noi. */
  declarat: "brut" | "net";
};

/**
 * Completeaza intervalul in ambele sensuri, indiferent ce a declarat
 * angajatorul. Se folosesc `calculStandard` si `brutDinNetStandard`, adica
 * exact ce ruleaza calculatorul de pe homepage: fara persoane in intretinere,
 * norma intreaga, functie de baza.
 */
export function salariuCalculat(s: IntervalSalariu): SalariuCalculat | null {
  const fix = s.min === s.max;
  if (s.tip === "net") {
    const brutMin = brutDinNetStandard(s.min);
    const brutMax = brutDinNetStandard(s.max);
    if (!brutMin || !brutMax) return null;
    return { brutMin, brutMax, netMin: s.min, netMax: s.max, fix, declarat: "net" };
  }
  const netMin = calculStandard(s.min)?.net;
  const netMax = calculStandard(s.max)?.net;
  if (netMin == null || netMax == null) return null;
  return { brutMin: s.min, brutMax: s.max, netMin, netMax, fix, declarat: "brut" };
}

// ─── Selectii ────────────────────────────────────────────────────────────────

export function jobDupaSlug(slug: string): Job | null {
  return JOBURI.find((j) => j.slug === slug) ?? null;
}

/** Anunturile neexpirate, cele mai noi intai. */
export function joburiActive(acum: Date = new Date()): Job[] {
  return JOBURI.filter((j) => new Date(j.expiraLa) >= acum).sort(
    (a, b) => new Date(b.publicatLa).getTime() - new Date(a.publicatLa).getTime(),
  );
}

// ─── Prospetimea anuntului ───────────────────────────────────────────────────
//
// Problema clasica a oricarui site de recrutare: angajatorul ocupa postul si nu
// se mai intoarce sa retraga anuntul. Candidatii suna saptamani intregi pentru
// un loc care nu mai exista, iar increderea in site se duce prima.
//
// Nu se rezolva prin expirare lunga si speranta. Trei masuri, toate vizibile:
//   1. DURATA SCURTA — 30 de zile, nu 60. Un anunt real se reinnoieste usor.
//   2. VARSTA LA VEDERE — candidatul vede „publicat acum 24 de zile" si isi face
//      singur o idee, in loc sa presupuna ca e proaspat.
//   3. SEMNAL DE VECHIME — peste 21 de zile anuntul e marcat explicit, ca sa nu
//      se piarda in lista.

export const ZILE_VALABILITATE = 30;
/** De la cate zile marcam anuntul ca fiind vechi. */
export const ZILE_PANA_LA_AVERTISMENT = 21;

export function zileDeLaPublicare(job: Job, acum: Date = new Date()): number {
  return Math.max(0, Math.floor((acum.getTime() - new Date(job.publicatLa).getTime()) / 86_400_000));
}

export function zilePanaLaExpirare(job: Job, acum: Date = new Date()): number {
  return Math.max(0, Math.ceil((new Date(job.expiraLa).getTime() - acum.getTime()) / 86_400_000));
}

export function esteVechi(job: Job, acum: Date = new Date()): boolean {
  return zileDeLaPublicare(job, acum) >= ZILE_PANA_LA_AVERTISMENT;
}

/** „azi", „acum 1 zi", „acum 12 zile". */
export function varstaText(job: Job, acum: Date = new Date()): string {
  const z = zileDeLaPublicare(job, acum);
  if (z === 0) return "publicat azi";
  if (z === 1) return "publicat acum o zi";
  return `publicat acum ${z} zile`;
}

export function joburiDinCategorie(categorie: string): Job[] {
  return joburiActive().filter((j) => j.categorie === categorie);
}

/** Localitatea unui anunt, sau null daca slugul nu e in catalog. */
export function localitateaJobului(job: Job): Localitate | null {
  return gasesteLocalitate(job.localitate);
}

export function joburiDinLocalitate(slug: string): Job[] {
  return joburiActive().filter((j) => j.localitate === slug);
}

export function joburiDinLocalitateSiMeserie(slugLocalitate: string, slugMeserie: string): Job[] {
  return joburiDinLocalitate(slugLocalitate).filter((j) => j.meserie === slugMeserie);
}

export function joburiDinMeserie(slugMeserie: string): Job[] {
  return joburiActive().filter((j) => j.meserie === slugMeserie);
}

/**
 * Anunturile din raza data fata de o localitate. Asta e raspunsul la intrebarea
 * pe care si-o pune de fapt un candidat — „ce e aproape de casa" — si e singurul
 * filtru pe care OLX il are, iar eJobs nu.
 *
 * Anunturile remote intra intotdeauna, indiferent de raza: nu au distanta.
 */
export function joburiInRaza(slugLocalitate: string, km: number): Job[] {
  const centru = gasesteLocalitate(slugLocalitate);
  if (!centru) return [];
  return joburiActive().filter((j) => {
    if (j.modLucru === "remote") return true;
    if (j.localitate === slugLocalitate) return true;
    if (km <= 0) return false;
    const l = gasesteLocalitate(j.localitate);
    return l ? distantaKm(centru, l) <= km : false;
  });
}

/** Localitatile care au cel putin un anunt activ, cu numarul lor. */
export function localitatiCuJoburi(): { localitate: Localitate; nr: number }[] {
  const m = new Map<string, number>();
  for (const j of joburiActive()) m.set(j.localitate, (m.get(j.localitate) ?? 0) + 1);
  return [...m.entries()]
    .map(([slug, nr]) => ({ localitate: gasesteLocalitate(slug), nr }))
    .filter((x): x is { localitate: Localitate; nr: number } => x.localitate !== null)
    .sort((a, b) => b.nr - a.nr || a.localitate.nume.localeCompare(b.localitate.nume, "ro"));
}

/** Meseriile care au cel putin un anunt activ intr-o localitate. */
export function meseriiDinLocalitate(slug: string): { meserie: string; nr: number }[] {
  const m = new Map<string, number>();
  for (const j of joburiDinLocalitate(slug)) if (j.meserie) m.set(j.meserie, (m.get(j.meserie) ?? 0) + 1);
  return [...m.entries()].map(([meserie, nr]) => ({ meserie, nr })).sort((a, b) => b.nr - a.nr);
}

export function categoriiCuJoburi(): { categorie: string; nr: number }[] {
  const m = new Map<string, number>();
  for (const j of joburiActive()) m.set(j.categorie, (m.get(j.categorie) ?? 0) + 1);
  return [...m.entries()]
    .map(([categorie, nr]) => ({ categorie, nr }))
    .sort((a, b) => b.nr - a.nr);
}

/** Mediana intervalelor brute, pentru contextul din capul hubului. */
export function medianaBrut(joburi: Job[] = joburiActive()): number | null {
  if (!joburi.length) return null;
  const mijloace = joburi.map((j) => (j.salariu.min + j.salariu.max) / 2).sort((a, b) => a - b);
  const i = Math.floor(mijloace.length / 2);
  return Math.round(mijloace.length % 2 ? mijloace[i] : (mijloace[i - 1] + mijloace[i]) / 2);
}

// ─── schema.org ──────────────────────────────────────────────────────────────
//
// JobPosting e conditia de intrare in Google for Jobs — widgetul de joburi din
// SERP. Fara el, anunturile sunt pagini obisnuite. Campurile obligatorii sunt
// title, description, datePosted, hiringOrganization si jobLocation; `validThrough`
// si `baseSalary` sunt puternic recomandate, iar la noi baseSalary exista mereu.

export function jobPostingSchema(j: Job, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: j.titlu,
    description: j.descriere,
    datePosted: j.publicatLa,
    validThrough: j.expiraLa,
    employmentType:
      j.tipContract === "part-time" ? "PART_TIME" : j.tipContract === "internship" ? "INTERN" : "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: j.companie },
    ...(() => {
      const l = gasesteLocalitate(j.localitate);
      return {
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: l?.nume ?? j.localitate,
            addressRegion: l?.judet ?? "",
            addressCountry: "RO",
          },
          // Coordonatele intra in schema: Google for Jobs le foloseste pentru
          // „joburi langa mine", care e exact intentia din spatele filtrului de
          // distanta al OLX-ului.
          ...(l ? { geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng } } : {}),
        },
      };
    })(),
    ...(j.modLucru === "remote" ? { jobLocationType: "TELECOMMUTE" } : {}),
    // ATENTIE: `baseSalary` din schema.org inseamna BRUT. Cand angajatorul a
    // declarat suma in mana, aici trebuie sa mearga brutul calculat, nu cifra
    // lui — altfel Google for Jobs ar arata un barman cu „3.000-3.800" ca si
    // cum ar fi salariul din contract, adica aproape jumatate din cat costa
    // efectiv postul.
    ...(() => {
      const s = salariuCalculat(j.salariu);
      return s
        ? {
            baseSalary: {
              "@type": "MonetaryAmount",
              currency: j.salariu.moneda,
              value: {
                "@type": "QuantitativeValue",
                minValue: s.brutMin,
                maxValue: s.brutMax,
                unitText: "MONTH",
              },
            },
          }
        : {};
    })(),
    url,
    directApply: Boolean(j.aplicaEmail),
  };
}
