import type { DateMeserie } from '@/lib/meserii';
import { INS_SURSA } from "@/lib/ins-date";
import { grilaPublica, SURSA_GRILE } from '@/lib/grile-publice';
import { LUNA_REFERINTA } from '@/lib/ins-date';
import education from '@/data/grila-invatamant-153-2017.json';
import reports from '@/data/repere-piata-verificate.json';
import { ACOPERIRE_ANUNTURI, DATA_VERIFICARE_ANUNTURI, type AcoperireAnunturi } from '@/lib/acoperire-anunturi';
import { calculStandard } from '@/lib/fiscal';
import { textIndicator } from '@/lib/indicator-meserie';
import { cifreMeserie } from '@/lib/ocupatii-caen';

export function grilaEducatie(slug: string) {
  if (slug === 'profesor') return education.randuri.filter(r => r.nr >= 1 && r.nr <= 8);
  if (slug === 'invatator') return education.randuri.filter(r => r.nr === 17);
  if (slug === 'educator') return education.randuri.filter(r => r.nr >= 19 && r.nr <= 20);
  return [];
}

export type ReperMeserie = {
  kind: 'salariile-ro' | 'external-reported' | 'external-advertised' | 'public-grid' | 'sector-context';
  value: number | null;
  upper: number | null;
  unit: 'lei net/lună';
  label: string;
  period: string;
  population: string;
  source: string;
  url: string;
  note: string;
  n: number | null;
  median: number | null;
  p25: number | null;
  p75: number | null;
  anunturi?: AcoperireAnunturi;
  compus?: ReperCompus;
};

/** Keep different populations and metrics separate. Missing quartiles stay missing. */
export function reperMeserie(d: DateMeserie): ReperMeserie {
  const common = { unit: 'lei net/lună' as const, median: null, p25: null, p75: null,
    anunturi: ACOPERIRE_ANUNTURI[d.meserie.slug] };
  const report = reports.records.find(r => r.slug === d.meserie.slug);

  // Cand doua repere independente descriu aceeasi meserie — ce se ofera si ce se
  // declara — reperul propriu al site-ului conduce. Nu inlocuieste pilonii: se
  // construieste din ei si ii arata dedesubt, fiecare cu sursa lui.
  const compus = reperCompus(piloniMeserie(d));
  if (compus && compus.surse >= 2) {
    return {
      ...common, kind: 'salariile-ro', value: compus.valoare, upper: null, n: common.anunturi?.n ?? null,
      compus, label: 'Reper Salariile.ro',
      period: `anunțuri active la ${new Date(DATA_VERIFICARE_ANUNTURI).toLocaleDateString('ro-RO', { timeZone: 'Europe/Bucharest' })} și surse declarate citate`,
      population: compus.intrari.map(i => i.titlu.toLowerCase()).join(' și '),
      source: 'Salariile.ro', url: 'https://salariile.ro/metodologie',
      note: `${compus.metoda} Intrări: ${compus.intrari.map(i => `${i.titlu} ${Math.round(i.valoare).toLocaleString('ro-RO')} lei`).join('; ')}.${compus.verificareOficiala ? ` Verificare INS pe grupa de ocupații: ${compus.verificareOficiala.valoare.toLocaleString('ro-RO')} lei, raport ${compus.verificareOficiala.raport}${compus.verificareOficiala.inBanda ? ', în bandă plauzibilă' : ', în afara benzii plauzibile'}.` : ''}`,
    };
  }

  // Colectarea proprie conduce cand trece toate pragurile: e singura cifra pe
  // meseria exacta, cu n publicat, surse numite si registru public de dovezi.
  const ads = common.anunturi;
  if (ads?.medianBounds && ads.midpointEstimate !== null) {
    return {
      ...common,
      kind: 'external-advertised', value: Math.round(ads.midpointEstimate),
      upper: null, n: ads.n,
      label: 'Reper central al salariilor oferite în anunțuri',
      period: `anunțuri active la ${new Date(DATA_VERIFICARE_ANUNTURI).toLocaleDateString('ro-RO', { timeZone: 'Europe/Bucharest' })}`,
      population: `${ads.n} anunțuri verificate, ${ads.employers} angajatori, ${ads.counties} județe, ${Object.keys(ads.sourceCounts).length} platforme`,
      source: 'Colectare proprie Salariile.ro', url: 'https://salariile.ro/salarii/acoperire',
      note: `Mediana mijloacelor intervalelor oferite; limitele posibile ale medianei sunt ${Math.round(ads.medianBounds.min).toLocaleString('ro-RO')}–${Math.round(ads.medianBounds.max).toLocaleString('ro-RO')} lei net. Este ce se oferă la angajare, nu ce încasează cine lucrează deja în acel post.`,
    };
  }

  if (report) {
    return {
      ...common,
      kind: 'external-reported', value: report.net, upper: null, n: null,
      label: 'Medie netă declarată în Salario', period: reports.period,
      population: `${report.role}, România; nivelurile de experiență și localitățile cumulate`,
      source: reports.source, url: reports.url,
      note: `${reports.method} ${report.note} Media nu este o mediană și nu stabilește salariul cel mai frecvent.`,
    };
  }

  // Grila legală este un reper separat, cu propriul sens statistic.
  const teaching = grilaEducatie(d.meserie.slug);
  const gridBrut = grilaPublica(d.meserie.slug);
  // O grila care descrie doar angajatorul public nu poate fi cifra unei meserii
  // practicate majoritar in privat. Ramane sectiune in pagina, nu reper.
  const grid = gridBrut?.doarSectiune ? null : gridBrut;
  const values = teaching.length ? teaching.map(r => calculStandard(r.iun2024)!.net) : grid?.trepte.map(r => r.net) ?? [];
  if (values.length) {
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    return {
      ...common,
      kind: 'public-grid',
      value: minVal,
      upper: maxVal,
      n: null,
      label: 'Interval net calculat din grila de bază',
      period: teaching.length ? 'coloana iunie 2024' : grid!.coloana,
      population: teaching.length ? 'Funcții didactice din învățământul public' : grid!.domeniu,
      source: teaching.length ? 'Legea 153/2017, Anexa I, învățământ preuniversitar' : `${SURSA_GRILE.act}, ${grid!.anexa}`,
      url: teaching.length ? education.sursa.url : SURSA_GRILE.url,
      note: 'Capetele sunt trepte din grila publicată, convertite prin calculul fiscal standard. Nu reprezintă salariul mediu încasat sau totalul cu sporuri.',
    };
  }

  const cm = cifreMeserie(d.meserie.caen2, d.meserie.isco, { net: d.netObservat ?? d.netStandard, brut: d.sector.brutCurent });
  const val = cm.dinIntersectie ? cm.net : (d.netObservat ?? d.netStandard);
  return {
    ...common,
    kind: 'sector-context',
    value: val,
    upper: null,
    n: null,
    label: cm.dinIntersectie ? 'Estimare INS · grupă ocupațională în sector' : 'Context INS · media sectorului',
    period: LUNA_REFERINTA,
    population: `CAEN ${d.sector.cheie} — ${d.sector.denumire}${cm.dinIntersectie ? `; grupa majoră ISCO ${d.meserie.isco}` : '; toate ocupațiile'}`,
    source: cm.dinIntersectie ? 'INS, FOM121A × FOM106G; calcul Salariile.ro' : 'INS, FOM106G',
    url: INS_SURSA.url,
    note: 'Reper agregat de context. Nu există aici o observație salarială verificată pentru meseria exactă.',
  };
}

export function textReper(r: ReperMeserie): string {
  if (r.value === null) return 'Neraportat';
  const f = (n: number) => n.toLocaleString('ro-RO', { maximumFractionDigits: 0 });
  return r.upper !== null && r.upper !== r.value ? `${f(r.value)}–${f(r.upper)}` : f(r.value);
}

export function descriereReper(d: DateMeserie): string {
  const r = reperMeserie(d);
  return `${r.label}: ${textIndicator(r)} pe lună. ${r.population}. Perioada: ${r.period}. Sursă: ${r.source}. ${r.note}`;
}

export type Pilon = {
  cheie: 'anunturi' | 'declarat' | 'oficial';
  titlu: string;
  valoare: number | null;
  interval: { min: number; max: number } | null;
  concept: string;
  populatie: string;
  sursa: string;
  url: string;
  n: number | null;
  stare: 'publicat' | 'insuficient' | 'lipsa';
  nota: string;
};

/**
 * Cei trei piloni, calculati independent. Populatii si concepte diferite, deci
 * nu se pondereaza intre ei si nu produc o singura cifra: o medie a lor nu ar
 * avea nicio sursa care s-o sustina. Convergenta si divergenta se citesc direct.
 */
export function piloniMeserie(d: DateMeserie): Pilon[] {
  const a = ACOPERIRE_ANUNTURI[d.meserie.slug];
  const report = reports.records.find(r => r.slug === d.meserie.slug);
  const teaching = grilaEducatie(d.meserie.slug);
  const gridBrut = grilaPublica(d.meserie.slug);
  // O grila care descrie doar angajatorul public nu poate fi cifra unei meserii
  // practicate majoritar in privat. Ramane sectiune in pagina, nu reper.
  const grid = gridBrut?.doarSectiune ? null : gridBrut;
  const trepte = teaching.length ? teaching.map(r => calculStandard(r.iun2024)!.net) : grid?.trepte.map(r => r.net) ?? [];
  const cm = cifreMeserie(d.meserie.caen2, d.meserie.isco, { net: d.netObservat ?? d.netStandard, brut: d.sector.brutCurent });

  // Sub praguri cifra ramane utila pentru orientare daca esantionul e macar de zece
  // anunturi, dar nu devine cifra principala a paginii.
  const centralAnunturi = a?.midpointEstimate ?? ((a?.n ?? 0) >= 10 ? a?.centralEstimate ?? null : null);
  const anunturi: Pilon = {
    cheie: 'anunturi', titlu: 'Ce se oferă acum în anunțuri',
    valoare: centralAnunturi !== null && centralAnunturi !== undefined ? Math.round(centralAnunturi) : null,
    interval: a?.medianBounds ?? a?.observedRange ?? null,
    concept: 'salariu oferit la angajare',
    populatie: 'anunțuri active, normă întreagă, muncă în România, sumă explicită',
    sursa: 'Colectare proprie Salariile.ro', url: '/salarii/acoperire',
    n: a?.n ?? 0,
    stare: a?.medianBounds ? 'publicat' : a?.n ? 'insuficient' : 'lipsa',
    nota: 'O ofertă de angajare nu este salariul încasat de cineva care lucrează de ani în acel post.',
  };
  const declarat: Pilon = report ? {
    cheie: 'declarat', titlu: 'Ce declară angajații',
    valoare: report.net, interval: null,
    concept: 'medie a raportărilor voluntare',
    populatie: `${report.role}, România; niveluri și orașe cumulate`,
    sursa: reports.source, url: reports.url, n: null, stare: 'publicat',
    nota: 'Media nu este mediană. Sursa nu publică mărimea eșantionului pentru fiecare meserie.',
  } : {
    cheie: 'declarat', titlu: 'Ce declară angajații',
    valoare: null, interval: null, concept: 'medie a raportărilor voluntare',
    populatie: '—', sursa: reports.source, url: reports.url, n: null, stare: 'lipsa',
    nota: 'Sursa externă nu publică un reper pentru această meserie.',
  };
  const oficial: Pilon = trepte.length ? {
    cheie: 'oficial', titlu: 'Ce prevede legea',
    valoare: null, interval: { min: Math.min(...trepte), max: Math.max(...trepte) },
    concept: 'trepte din grila de salarizare, convertite în net standard',
    populatie: teaching.length ? 'Funcții didactice din învățământul public' : grid!.domeniu,
    sursa: teaching.length ? 'Legea 153/2017, Anexa I' : `${SURSA_GRILE.act}, ${grid!.anexa}`,
    url: teaching.length ? education.sursa.url : SURSA_GRILE.url, n: null, stare: 'publicat',
    nota: 'Salariul de bază din grilă, fără sporuri și fără vechime individuală.',
  } : {
    cheie: 'oficial', titlu: 'Ce măsoară statistica oficială',
    valoare: cm.dinIntersectie ? cm.net : (d.netObservat ?? d.netStandard), interval: null,
    concept: cm.dinIntersectie ? 'estimare pentru grupa de ocupații din sector' : 'media sectorului de activitate',
    populatie: `CAEN ${d.sector.cheie} — ${d.sector.denumire}${cm.dinIntersectie ? `; grupa majoră ISCO ${d.meserie.isco}` : '; toate ocupațiile'}`,
    sursa: cm.dinIntersectie ? 'INS, FOM121A × FOM106G; calcul Salariile.ro' : 'INS, FOM106G',
    url: INS_SURSA.url,
    n: null, stare: 'publicat',
    nota: 'Salariu efectiv plătit, dar pe o grupă largă de ocupații — nu pe meseria exactă. INS nu publică salarii pe codul COR.',
  };
  return [anunturi, declarat, oficial];
}

/** Punctele comparabile ale pilonilor. Doua repere care nu se suprapun sunt informatie, nu eroare. */
export function convergentaPiloni(piloni: Pilon[]) {
  const puncte = piloni
    .map(p => ({ cheie: p.cheie, valoare: p.valoare ?? (p.interval ? (p.interval.min + p.interval.max) / 2 : null) }))
    .filter((p): p is { cheie: Pilon['cheie']; valoare: number } => p.valoare !== null && p.valoare > 0);
  if (puncte.length < 2) return null;
  const valori = puncte.map(p => p.valoare);
  const min = Math.min(...valori), max = Math.max(...valori);
  return { min, max, raspandire: (max - min) / min, puncte };
}

export type ReperCompus = {
  valoare: number;
  surse: number;
  intrari: { cheie: Pilon['cheie']; titlu: string; valoare: number }[];
  verificareOficiala: { valoare: number; raport: number; inBanda: boolean } | null;
  metoda: string;
};

/**
 * Punctul de orientare al site-ului. Nu este salariul cuiva anume si nu inlocuieste
 * pilonii: se construieste din ei si ii arata dedesubt.
 *
 * Intra doar reperele care descriu meseria exacta — ce se ofera in anunturi si ce
 * declara angajatii. Statistica oficiala este pe grupa larga de ocupatii, prea larga
 * ca sa traga cifra, dar buna ca sa verifice ca nu a luat-o razna: daca rezultatul
 * iese din banda din jurul ei, se marcheaza in loc sa se ascunda.
 */
export function reperCompus(piloni: Pilon[]): ReperCompus | null {
  // Doar valori centrale. Mijlocul intervalului observat este media dintre cea mai
  // mica si cea mai mare suma gasita — nu descrie piata si nu intra niciodata aici.
  const specifice = piloni
    .filter(p => p.cheie === 'anunturi' || p.cheie === 'declarat')
    .map(p => ({ cheie: p.cheie, titlu: p.titlu, valoare: p.valoare }))
    .filter((p): p is { cheie: Pilon['cheie']; titlu: string; valoare: number } => p.valoare !== null && p.valoare > 0);
  if (!specifice.length) return null;

  const valori = [...specifice.map(p => p.valoare)].sort((a, b) => a - b);
  const mijloc = Math.floor(valori.length / 2);
  const valoare = Math.round(valori.length % 2 ? valori[mijloc] : (valori[mijloc - 1] + valori[mijloc]) / 2);

  const oficial = piloni.find(p => p.cheie === 'oficial');
  const referinta = oficial?.valoare ?? (oficial?.interval ? (oficial.interval.min + oficial.interval.max) / 2 : null);
  const verificareOficiala = referinta && referinta > 0
    ? { valoare: Math.round(referinta), raport: +(valoare / referinta).toFixed(2), inBanda: valoare >= referinta * 0.6 && valoare <= referinta * 1.8 }
    : null;

  return {
    valoare, surse: specifice.length, intrari: specifice, verificareOficiala,
    metoda: 'Mediana reperelor care descriu meseria exactă: salariile oferite în anunțurile verificate de noi și salariile declarate de angajați în sursele citate. Statistica oficială nu intră în calcul, fiindcă măsoară o grupă largă de ocupații; este folosită doar ca verificare de plauzibilitate.',
  };
}
