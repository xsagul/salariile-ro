import type { DateMeserie } from '@/lib/meserii';
import { grilaPublica, SURSA_GRILE } from '@/lib/grile-publice';
import { LUNA_REFERINTA } from '@/lib/ins-date';
import education from '@/data/grila-invatamant-153-2017.json';
import { calculStandard } from '@/lib/fiscal';
import offers from '@/data/repere-oferte-it.json';
import { indicatorMeserie, textIndicator } from '@/lib/indicator-meserie';

export function grilaEducatie(slug:string) {
  if(slug==='profesor') return education.randuri.filter(r=>r.nr>=1 && r.nr<=8);
  if(slug==='invatator' || slug==='educator') return education.randuri.filter(r=>r.nr>=17 && r.nr<=20);
  return [];
}

// Câteva repere citate editorial din raport, nu o copie a bazei Salario.
// Numărul căutărilor din aceeași pagină NU este numărul de salarii raportate.
const SALARIO: Record<string, number> = {
  inginer: 7000, 'asistent-medical': 4000, contabil: 5000,
  'operator-call-center': 4000, 'specialist-resurse-umane': 5200,
};
export type ReperMeserie = {
  kind: 'external-reported' | 'external-advertised' | 'public-grid' | 'sector-context';
  value: number | null; upper: number | null; unit: 'lei net/lună';
  label: string; period: string; population: string; source: string; url: string;
  note: string; n: null; median: number | null; p25: number | null; p75: number | null;
};
export function reperMeserie(d: DateMeserie): ReperMeserie {
  const common = { n:null, median:null, p25:null, p75:null, upper:null };
  const advertised = Object.hasOwn(offers.roles, d.meserie.slug)
    ? offers.roles[d.meserie.slug as keyof typeof offers.roles] : null;
  if(advertised) return {
    ...common,kind:'external-advertised',value:advertised.mean,median:advertised.median,p25:advertised.p25,p75:advertised.p75,unit:'lei net/lună',
    label:'Medie publicată de DevJob · oferte',period:'perioadă neprecizată; consultat 6 septembrie 2026',
    population:`${advertised.population}, ${offers.geography}, ${offers.experience}`,
    source:`DevJob, ${advertised.population} salary in Romania`,url:advertised.url,
    note:'DevJob calculează statistici din intervalele salariale furnizate de angajatori în anunțuri. Sunt oferte, nu salarii încasate. Mediana și quartilele sunt cele publicate de furnizor; metoda de transformare a intervalelor, perioada și eșantionul exact al acestei selecții nu sunt precizate. Nu sunt statistici calculate de Salariile.ro.',
  };
  const teaching=grilaEducatie(d.meserie.slug);
  if(teaching.length) {
    const values=teaching.map(r=>calculStandard(r.iun2024)!.net);
    return {...common,kind:'public-grid',value:Math.min(...values),upper:Math.max(...values),unit:'lei net/lună',
      label:'Net standard · grilă didactică',period:'iunie 2024',
      population:d.meserie.slug==='profesor'?'Profesori din învățământul preuniversitar de stat, studii S/SSD':'Învățători și educatoare din sistemul de stat, studii liceale (M)',
      source:'Legea 153/2017, Anexa I, cap. I, pct. 5',url:education.sursa.url,
      note:'Limitele sunt valorile treptelor didactice din coloana iunie 2024, înaintea gradației de vechime în muncă, majorărilor și sporurilor. Nu reprezintă un interval al salariilor încasate. Pentru alt nivel de studii și situația individuală, folosește calculatorul de învățământ.',};
  }
  const reported = Object.hasOwn(SALARIO, d.meserie.slug) ? SALARIO[d.meserie.slug] : null;
  if (reported) return {
    ...common, kind:'external-reported',value:reported,unit:'lei net/lună',
    label:'Medie declarată în Salario',period:'2025',population:`${d.meserie.nume}, România; toate nivelurile cumulate`,
    source:'eJobs, Review & Trends 2026, p. 54',url:'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=54',
    note:'Salarii introduse în 2025 de utilizatorii Salario. Eșantionul acestei meserii și distribuția nu sunt publicate în raport. Media nu reprezintă o măsurare națională reprezentativă și nu a fost indexată la 2026.',
  };
  const grid = grilaPublica(d.meserie.slug);
  if (grid?.trepte.length) {
    const values=grid.trepte.map(x=>x.net);
    return {...common,kind:'public-grid',value:Math.min(...values),upper:Math.max(...values),unit:'lei net/lună',
      label:'Net standard · grilă publică',period:grid.coloana,population:grid.domeniu,
      source:`${SURSA_GRILE.act}, ${grid.anexa}`,url:SURSA_GRILE.url,
      note:`${grid.numeSuma}; limitele sunt treptele selectate din grilă, nu percentile ale angajaților. Nivelul coloanei este ${grid.coloana}. Nu includem aici toate sporurile, majorările individuale sau salariile din privat.`,};
  }
  return {...common,kind:'sector-context',value:d.netObservat,unit:'lei net/lună',
    label:'Context INS · media sectorului',period:LUNA_REFERINTA,
    population:`CAEN ${d.sector.cheie} — ${d.sector.denumire}; toate ocupațiile`,
    source:'INS, TEMPO-Online, FOM106G',url:'https://statistici.insse.ro/tempoins/?ind=FOM106G&lang=ro&page=tempo3',
    note:'Aceasta este media activității angajatorului, nu salariul măsurat al meseriei. Nu o transformăm în mediană, interval salarial sau salariu de debutant.',};
}
export function textReper(r: ReperMeserie): string {
  if(r.value === null) return 'Neraportat';
  const f=(n:number)=>n.toLocaleString('ro-RO',{maximumFractionDigits:0});
  return r.upper!==null && r.upper!==r.value ? `${f(r.value)}–${f(r.upper)}` : f(r.value);
}
export function descriereReper(d: DateMeserie): string {
  const r=reperMeserie(d);
  const indicator=indicatorMeserie(r);
  if(indicator.value===null) return `Nu avem încă suficiente date pentru un salariu median sau mediu al acestei meserii. ${r.label}: ${textReper(r)} ${r.unit}, ${r.period}. ${r.population}. ${r.note}`;
  return `${indicator.metric==='median'?'Mediană':'Medie'}: ${textIndicator(r)} pe lună. ${r.source}, ${r.period}. ${r.population}. ${r.note}`;
}
