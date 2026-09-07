import type { DateMeserie } from '@/lib/meserii';
import { grilaPublica, SURSA_GRILE } from '@/lib/grile-publice';
import { LUNA_REFERINTA } from '@/lib/ins-date';
import education from '@/data/grila-invatamant-153-2017.json';
import reports from '@/data/repere-piata-verificate.json';
import { ACOPERIRE_ANUNTURI, type AcoperireAnunturi } from '@/lib/acoperire-anunturi';
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
  kind: 'external-reported' | 'external-advertised' | 'public-grid' | 'sector-context';
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
};

/** Keep different populations and metrics separate. Missing quartiles stay missing. */
export function reperMeserie(d: DateMeserie): ReperMeserie {
  const common = { unit: 'lei net/lună' as const, median: null, p25: null, p75: null,
    anunturi: ACOPERIRE_ANUNTURI[d.meserie.slug] };
  const report = reports.records.find(r => r.slug === d.meserie.slug);

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
  const grid = grilaPublica(d.meserie.slug);
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
    url: `https://statistici.insse.ro/tempoins/?ind=${cm.dinIntersectie ? 'FOM121A' : 'FOM106G'}&lang=ro&page=tempo3`,
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
