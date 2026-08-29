// src/lib/localitati.ts
//
// Localitatile pentru clusterul de recrutare.
//
// DE CE EXISTA. Traficul din recrutare sta in oras, nu in meserie. Masurat pe
// 30 august 2026, pe 12 competitori si 11.600 de cuvinte extrase din Seobility
// (Google.ro): interogarile care contin un oras aduna 1.743.710 cautari lunare,
// fata de 68.870 pentru combinatia meserie x oras. Un singur oras mediu —
// „locuri de munca brasov", 27.100 — valoreaza cat tot clusterul de calculatoare
// pe care il avem azi.
//
// COORDONATELE nu sunt decor. OLX are un filtru de distanta (+2, +5, +10, +15,
// +30, +50, +75, +100 km) care raspunde la intrebarea reala a candidatului: „ce
// e aproape de casa". Fara coordonate pe localitate, filtrul ala nu se poate
// construi. Sunt centre de oras, aproximate la trei zecimale — suficient pentru
// o raza de kilometri, si deliberat NU adrese exacte.
//
// `cerere` e volumul lunar cumulat de cautari masurat pentru orasul respectiv,
// dupa scoaterea interogarilor de brand („olx cluj", „publi24 sibiu"). Se
// foloseste ca sa ordonam paginile si sa stim unde merita efortul.

export type Localitate = {
  slug: string;
  nume: string;
  judet: string;
  lat: number;
  lng: number;
  /** Volum lunar de cautari masurat, fara interogari de brand. */
  cerere: number;
};

/**
 * Resedintele de judet plus orasele cu cerere masurata. Ordinea din fisier e
 * alfabetica dupa slug; sortarea dupa cerere se face in cod.
 */
export const LOCALITATI: Localitate[] = [
  { slug: "alba-iulia", nume: "Alba Iulia", judet: "Alba", lat: 46.067, lng: 23.58, cerere: 17170 },
  { slug: "alexandria", nume: "Alexandria", judet: "Teleorman", lat: 43.98, lng: 25.333, cerere: 1900 },
  { slug: "arad", nume: "Arad", judet: "Arad", lat: 46.183, lng: 21.312, cerere: 12150 },
  { slug: "bacau", nume: "Bacău", judet: "Bacău", lat: 46.567, lng: 26.914, cerere: 15010 },
  { slug: "baia-mare", nume: "Baia Mare", judet: "Maramureș", lat: 47.657, lng: 23.568, cerere: 7850 },
  { slug: "barlad", nume: "Bârlad", judet: "Vaslui", lat: 46.226, lng: 27.669, cerere: 2400 },
  { slug: "bistrita", nume: "Bistrița", judet: "Bistrița-Năsăud", lat: 47.133, lng: 24.5, cerere: 7130 },
  { slug: "botosani", nume: "Botoșani", judet: "Botoșani", lat: 47.748, lng: 26.66, cerere: 4800 },
  { slug: "braila", nume: "Brăila", judet: "Brăila", lat: 45.269, lng: 27.958, cerere: 6610 },
  { slug: "brasov", nume: "Brașov", judet: "Brașov", lat: 45.657, lng: 25.601, cerere: 49250 },
  { slug: "bucuresti", nume: "București", judet: "București", lat: 44.427, lng: 26.103, cerere: 107090 },
  { slug: "buzau", nume: "Buzău", judet: "Buzău", lat: 45.15, lng: 26.822, cerere: 36380 },
  { slug: "calarasi", nume: "Călărași", judet: "Călărași", lat: 44.206, lng: 27.33, cerere: 2900 },
  { slug: "campina", nume: "Câmpina", judet: "Prahova", lat: 45.128, lng: 25.735, cerere: 1600 },
  { slug: "cluj-napoca", nume: "Cluj-Napoca", judet: "Cluj", lat: 46.771, lng: 23.6, cerere: 16520 },
  { slug: "constanta", nume: "Constanța", judet: "Constanța", lat: 44.179, lng: 28.635, cerere: 22250 },
  { slug: "craiova", nume: "Craiova", judet: "Dolj", lat: 44.319, lng: 23.801, cerere: 14760 },
  { slug: "dej", nume: "Dej", judet: "Cluj", lat: 47.14, lng: 23.875, cerere: 6200 },
  { slug: "deva", nume: "Deva", judet: "Hunedoara", lat: 45.883, lng: 22.9, cerere: 5200 },
  { slug: "drobeta-turnu-severin", nume: "Drobeta-Turnu Severin", judet: "Mehedinți", lat: 44.632, lng: 22.656, cerere: 3600 },
  { slug: "focsani", nume: "Focșani", judet: "Vrancea", lat: 45.697, lng: 27.184, cerere: 5890 },
  { slug: "galati", nume: "Galați", judet: "Galați", lat: 45.435, lng: 28.008, cerere: 9830 },
  { slug: "giurgiu", nume: "Giurgiu", judet: "Giurgiu", lat: 43.903, lng: 25.97, cerere: 2200 },
  { slug: "hunedoara", nume: "Hunedoara", judet: "Hunedoara", lat: 45.75, lng: 22.9, cerere: 2900 },
  { slug: "iasi", nume: "Iași", judet: "Iași", lat: 47.158, lng: 27.601, cerere: 28720 },
  { slug: "lugoj", nume: "Lugoj", judet: "Timiș", lat: 45.688, lng: 21.903, cerere: 1900 },
  { slug: "mangalia", nume: "Mangalia", judet: "Constanța", lat: 43.816, lng: 28.583, cerere: 1300 },
  { slug: "medgidia", nume: "Medgidia", judet: "Constanța", lat: 44.249, lng: 28.271, cerere: 6560 },
  { slug: "medias", nume: "Mediaș", judet: "Sibiu", lat: 46.163, lng: 24.35, cerere: 2900 },
  { slug: "miercurea-ciuc", nume: "Miercurea Ciuc", judet: "Harghita", lat: 46.36, lng: 25.802, cerere: 1900 },
  { slug: "onesti", nume: "Onești", judet: "Bacău", lat: 46.25, lng: 26.767, cerere: 1600 },
  { slug: "oradea", nume: "Oradea", judet: "Bihor", lat: 47.057, lng: 21.94, cerere: 16710 },
  { slug: "pascani", nume: "Pașcani", judet: "Iași", lat: 47.25, lng: 26.727, cerere: 1300 },
  { slug: "petrosani", nume: "Petroșani", judet: "Hunedoara", lat: 45.417, lng: 23.367, cerere: 1600 },
  { slug: "piatra-neamt", nume: "Piatra Neamț", judet: "Neamț", lat: 46.928, lng: 26.371, cerere: 17830 },
  { slug: "pitesti", nume: "Pitești", judet: "Argeș", lat: 44.856, lng: 24.869, cerere: 11280 },
  { slug: "ploiesti", nume: "Ploiești", judet: "Prahova", lat: 44.94, lng: 26.022, cerere: 46720 },
  { slug: "ramnicu-valcea", nume: "Râmnicu Vâlcea", judet: "Vâlcea", lat: 45.1, lng: 24.375, cerere: 4400 },
  { slug: "resita", nume: "Reșița", judet: "Caraș-Severin", lat: 45.301, lng: 21.889, cerere: 2400 },
  { slug: "roman", nume: "Roman", judet: "Neamț", lat: 46.922, lng: 26.928, cerere: 17370 },
  { slug: "satu-mare", nume: "Satu Mare", judet: "Satu Mare", lat: 47.79, lng: 22.885, cerere: 7700 },
  { slug: "sfantu-gheorghe", nume: "Sfântu Gheorghe", judet: "Covasna", lat: 45.867, lng: 25.783, cerere: 2900 },
  { slug: "sibiu", nume: "Sibiu", judet: "Sibiu", lat: 45.798, lng: 24.152, cerere: 18090 },
  { slug: "sighetu-marmatiei", nume: "Sighetu Marmației", judet: "Maramureș", lat: 47.929, lng: 23.887, cerere: 1300 },
  { slug: "slatina", nume: "Slatina", judet: "Olt", lat: 44.43, lng: 24.371, cerere: 17510 },
  { slug: "slobozia", nume: "Slobozia", judet: "Ialomița", lat: 44.564, lng: 27.366, cerere: 2400 },
  { slug: "suceava", nume: "Suceava", judet: "Suceava", lat: 47.651, lng: 26.256, cerere: 34150 },
  { slug: "targoviste", nume: "Târgoviște", judet: "Dâmbovița", lat: 44.925, lng: 25.457, cerere: 6790 },
  { slug: "targu-jiu", nume: "Târgu Jiu", judet: "Gorj", lat: 45.036, lng: 23.274, cerere: 4400 },
  { slug: "targu-mures", nume: "Târgu Mureș", judet: "Mureș", lat: 46.542, lng: 24.558, cerere: 5400 },
  { slug: "timisoara", nume: "Timișoara", judet: "Timiș", lat: 45.756, lng: 21.229, cerere: 35490 },
  { slug: "tulcea", nume: "Tulcea", judet: "Tulcea", lat: 45.176, lng: 28.805, cerere: 3600 },
  { slug: "turda", nume: "Turda", judet: "Cluj", lat: 46.567, lng: 23.783, cerere: 2900 },
  { slug: "vaslui", nume: "Vaslui", judet: "Vaslui", lat: 46.638, lng: 27.729, cerere: 11590 },
  { slug: "zalau", nume: "Zalău", judet: "Sălaj", lat: 47.191, lng: 23.057, cerere: 10620 },
];

export const SURSA_CERERE =
  "Seobility Keyword Research, Google.ro, 30 august 2026. Volum lunar cumulat pe interogările care conțin localitatea, fără interogări de brand.";

const dupaSlug = new Map(LOCALITATI.map((l) => [l.slug, l]));

export function localitate(slug: string): Localitate | null {
  return dupaSlug.get(slug) ?? null;
}

/** Localitatile ordonate dupa cererea masurata — cele mai cautate intai. */
export function localitatiDupaCerere(): Localitate[] {
  return [...LOCALITATI].sort((a, b) => b.cerere - a.cerere || a.nume.localeCompare(b.nume, "ro"));
}

export function localitatiDinJudet(judet: string): Localitate[] {
  return LOCALITATI.filter((l) => l.judet === judet);
}

// ─── Distanta ────────────────────────────────────────────────────────────────
//
// Haversine pe raza medie a Pamantului. Pentru distante intre orase din Romania,
// eroarea fata de o formula elipsoidala e sub 0,3% — irelevanta cand pragul e
// „pana la 30 km".

const R_PAMANT_KM = 6371;
const rad = (g: number) => (g * Math.PI) / 180;

export function distantaKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_PAMANT_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Pragurile de raza, copiate de la OLX pentru ca sunt deja invatate de utilizatori. */
export const RAZE_KM = [0, 5, 10, 15, 30, 50, 100] as const;
export type RazaKm = (typeof RAZE_KM)[number];

/** Localitatile aflate in raza data fata de una de referinta, cea de referinta inclusa. */
export function inRaza(centru: Localitate, km: number): Localitate[] {
  if (km <= 0) return [centru];
  return LOCALITATI.filter((l) => distantaKm(centru, l) <= km).sort(
    (a, b) => distantaKm(centru, a) - distantaKm(centru, b),
  );
}
