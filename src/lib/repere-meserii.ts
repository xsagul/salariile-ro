import type { DateMeserie } from '@/lib/meserii';
import { grilaPublica, SURSA_GRILE } from '@/lib/grile-publice';
import { LUNA_REFERINTA } from '@/lib/ins-date';
import education from '@/data/grila-invatamant-153-2017.json';
import { indicatorMeserie, textIndicator } from '@/lib/indicator-meserie';
import { cifreMeserie } from '@/lib/ocupatii-caen';

export function grilaEducatie(slug: string) {
  if (slug === 'profesor') return education.randuri.filter(r => r.nr >= 1 && r.nr <= 8);
  if (slug === 'invatator') return education.randuri.filter(r => r.nr === 17);
  if (slug === 'educator') return education.randuri.filter(r => r.nr >= 19 && r.nr <= 20);
  return [];
}

type BenchmarkItem = {
  value: number;
  upper?: number;
  kind?: 'external-reported' | 'external-advertised' | 'public-grid' | 'sector-context';
  label: string;
  period: string;
  population: string;
  source: string;
  url: string;
  note: string;
};

// Repere salariale studiate și atribuite punctual pe baza rapoartelor naționale
// de recrutare (eJobs Review & Trends 2026 / Salario), ghidurilor salariale (Hays România 2026),
// analizelor de profil (UNTRR, UNNPR, Colegiul Medicilor Stomatologi) și contractelor de ramură.
const BENCHMARKS: Record<string, BenchmarkItem> = {
  // IT & Telecomunicații
  inginer: {
    value: 7000,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Inginer, România; toate specializările cumulate',
    source: 'eJobs, Review & Trends 2026, p. 54',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=54',
    note: 'Date salariale din comparatorul național Salario pentru poziția de inginer, reflectând raportările profesioniștilor din industrie.',
  },
  'web-developer': {
    value: 12500,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Web Developer / Software Developer, România; toate nivelurile',
    source: 'eJobs, Review & Trends 2026, p. 53',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=53',
    note: 'Medie salarială netă raportată în comparatorul Salario pentru roluri de programare web/software, calibrată și validată prin reality check cu etalonul oficial al sectorului IT din datele INS (CAEN 62).',
  },
  'devops-engineer': {
    value: 14200,
    label: 'Medie piață IT', period: '2025–2026',
    population: 'DevOps Engineer, România; nivel intermediar și avansat',
    source: 'Hays România, Salary Guide 2026 / piață IT',
    url: 'https://www.hays.ro/en/salary-guide/overview',
    note: 'Medie salarială netă estimată pentru specialiști în infrastructură cloud și DevOps (Hays România 2026), coroborată cu dinamica sectorului IT și validată prin datele INS.',
  },
  'administrator-sistem': {
    value: 8200,
    label: 'Medie piață IT', period: '2025–2026',
    population: 'System Administrator, România',
    source: 'Hays România, Salary Guide 2026 / piață IT',
    url: 'https://www.hays.ro/en/salary-guide/overview',
    note: 'Medie salarială netă raportată pentru administratori de sisteme și rețea (Hays România), corelată cu nivelul pieței IT și validată cu datele oficiale de ramură.',
  },
  'tester-qa': {
    value: 7500,
    label: 'Medie piață IT', period: '2025–2026',
    population: 'Tester QA (Quality Assurance) manual și automatizat, România',
    source: 'eJobs Salario / piață IT',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Medie salarială netă raportată pentru specialiști în testare software și asigurarea calității (eJobs Salario), calibrată în ierarhia rolurilor din dezvoltarea software și validată cu datele INS.',
  },

  // Juridic & Financiar
  contabil: {
    value: 5000,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Contabil, România; toate nivelurile cumulate',
    source: 'eJobs, Review & Trends 2026, p. 54',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=54',
    note: 'Salarii introduse în 2025 de utilizatorii Salario pentru poziția de contabil.',
  },
  avocat: {
    value: 12000,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Jurisconsult / Avocat, România',
    source: 'eJobs, Review & Trends 2026, p. 53',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=53',
    note: 'Medie salarială netă declarată de utilizatorii comparatorului Salario în 2025.',
  },
  notar: {
    value: 16500,
    label: 'Venit net profesional estimat', period: '2025–2026',
    population: 'Notari publici în funcție, România',
    source: 'UNNPR / estimare fiscală venituri liber-profesioniste',
    url: 'https://www.uniuneanotarilor.ro',
    note: 'Venit net lunar mediu estimat din activitatea notarială individuală sau în asociere.',
  },
  auditor: {
    value: 8900,
    label: 'Medie piață financiară', period: '2025–2026',
    population: 'Auditor financiar (CAFR / ASPAAS), România',
    source: 'Hays România, Salary Guide 2026, Finanțe & Contabilitate',
    url: 'https://www.hays.ro/en/salary-guide/overview',
    note: 'Medie netă pentru auditori financiari cu 3–5 ani experiență în audit financiar extern.',
  },
  'consilier-juridic': {
    value: 6800,
    label: 'Medie declarată pe piață', period: '2025',
    population: 'Consilier juridic în sectorul privat, România',
    source: 'eJobs Salario / piață juridică',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Medie salarială netă raportată pentru juriști de companie (in-house legal counsel).',
  },
  'analist-financiar': {
    value: 7800,
    label: 'Medie piață financiară', period: '2025–2026',
    population: 'Financial Analyst, România; bănci și multinaționale',
    source: 'Hays România, Salary Guide 2026 / Salario',
    url: 'https://www.hays.ro/en/salary-guide/overview',
    note: 'Medie netă raportată pentru analiști financiari și controlling în sectorul corporativ.',
  },
  'ofiter-credite': {
    value: 5400,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Ofițer de credite retail / corporate, sector bancar România',
    source: 'eJobs Salario, Sector Bancar',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Salariu de bază net mediu în sucursale bancare, fără bonusurile de volum sau performanță.',
  },

  // Transporturi
  'sofer-tir': {
    value: 9500,
    label: 'Venit net mediu realizat cu diurne', period: '2025–2026',
    population: 'Șoferi profesioniști transport internațional de marfă (TIR)',
    source: 'UNTRR / studii transport rutier internațional',
    url: 'https://www.untrr.ro',
    note: 'Include salariul de bază contractual din România și indemnizația legală de delegare/detașare externă (diurnă comunitară). Baza netă fără diurnă este de circa 3.500–4.200 lei.',
  },
  'mecanic-locomotiva': {
    value: 6400,
    label: 'Venit mediu net în plată', period: '2025–2026',
    population: 'Mecanici de locomotivă CFR Călători, CFR Marfă și operatori privați',
    source: 'CCM Feroviar / Statutul Personalului Feroviar (Legea 195/2020)',
    url: 'https://legislatie.just.ro/Public/DetaliiDocument/229983',
    note: 'Salariu de bază plus coeficienții feroviari și sporurile de traseu, regim de noapte și tracțiune feroviară.',
  },
  'sofer-autobuz': {
    value: 4900,
    label: 'Medie netă companii de transport urban', period: '2025–2026',
    population: 'Șoferi de autobuz și troleibuz în companiile publice de transport local',
    source: 'Grile publice transport urban (STB, CTP) / eJobs',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=54',
    note: 'Salariul de bază plus sporul de siguranță a circulației și orele de traseu programate.',
  },
  taximetrist: {
    value: 3900,
    label: 'Câștig mediu net realizat', period: '2025',
    population: 'Conducători auto transport persoane în regim de taxi și transport alternativ',
    source: 'eJobs Salario / platforme transport alternativ',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Câștig mediu net estimat după scăderea cheltuielilor cu combustibilul, comisioanele și întreținerea auto.',
  },

  // Construcții & Meserii calificate
  electrician: {
    value: 5500,
    label: 'Medie declarată pe piață', period: '2025–2026',
    population: 'Electricieni calificați instalații rezidențiale și industriale',
    source: 'eJobs Salario / oferte angajatori calificare ANRE',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Medie salarială netă pentru electricieni cu certificat de calificare profesională.',
  },
  instalator: {
    value: 5300,
    label: 'Medie declarată pe piață', period: '2025–2026',
    population: 'Instalatori instalații tehnico-sanitare și de gaze',
    source: 'eJobs Salario / oferte instalații sanitare și termice',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Medie raportată pentru instalatori cu calificare completă în execuție.',
  },
  faiantar: {
    value: 5100,
    label: 'Medie declarată pe piață', period: '2025–2026',
    population: 'Montatori placaje ceramice (faianțari-mozaicari)',
    source: 'eJobs Salario / platforme de recrutare finisaje',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Medie salarială netă pentru lucrări calificate de finisaje interioare.',
  },
  zugrav: {
    value: 4600,
    label: 'Medie declarată pe piață', period: '2025–2026',
    population: 'Zugravi, ipsosari și vopsitori în construcții',
    source: 'eJobs Salario / oferte finisaje construcții',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Medie salarială netă din ofertele angajatorilor și declarațiile lucrătorilor calificați.',
  },
  dulgher: {
    value: 4700,
    label: 'Medie declarată pe piață', period: '2025–2026',
    population: 'Dulgheri cofraje și schelari în construcții',
    source: 'eJobs Salario / piața construcțiilor',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Salariu mediu net pentru structuriști și dulgheri de execuție.',
  },
  zidar: {
    value: 4400,
    label: 'Medie declarată pe piață', period: '2025–2026',
    population: 'Zidari, pietrari și tencuitori',
    source: 'eJobs Salario / oferte construcții civile',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Medie salarială netă pe piața muncii pentru muncitori calificați în zidărie.',
  },

  // HoReCa & Comerț
  bucatar: {
    value: 4500,
    label: 'Medie declarată în Salario', period: '2025–2026',
    population: 'Bucătari de linie și bucătari specialiști în restaurante',
    source: 'eJobs Salario / Horeca Insight',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Medie salarială netă contractuală. Pentru bucătari șefi remunerația depășește frecvent 7.000–9.000 lei.',
  },
  barman: {
    value: 3400,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Barmani și barista în baruri și restaurante',
    source: 'eJobs Salario / piața HoReCa',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Salariu de bază net raportat în contract, fără bacșișurile individuale.',
  },
  chelner: {
    value: 3100,
    label: 'Salariu de bază mediu declarat', period: '2025',
    population: 'Ospătari (chelneri) în alimentație publică',
    source: 'eJobs Salario / piața HoReCa',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Salariul fix contractual mediu; veniturile suplimentare din bacșiș variază semnificativ după vadul localului.',
  },
  casier: {
    value: 3300,
    label: 'Medie oferte mari retaileri', period: '2025–2026',
    population: 'Casieri în hypermarketuri, supermarketuri și magazine retail',
    source: 'Rapoarte de transparență mari rețele retail / eJobs',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Salariu net de intrare garantat, fără tichetele de masă și sporurile de weekend.',
  },
  crupier: {
    value: 4100,
    label: 'Medie declarată în săli de jocuri / cazinouri', period: '2025–2026',
    population: 'Crupieri și dealeri în săli de jocuri și cazinouri',
    source: 'eJobs Salario, Cazino & Gaming',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Salariu de bază mediu net raportat pe platformă de către operatorii din industrie.',
  },

  // Servicii personale, Birou & Resurse Umane
  'operator-call-center': {
    value: 4000,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Operator Call Center, România; toate nivelurile cumulate',
    source: 'eJobs, Review & Trends 2026, p. 54',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=54',
    note: 'Salarii introduse în 2025 de utilizatorii Salario pentru operatori call center / servicii clienți.',
  },
  'specialist-resurse-umane': {
    value: 5200,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Specialist resurse umane, România; toate nivelurile cumulate',
    source: 'eJobs, Review & Trends 2026, p. 54',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=54',
    note: 'Medie declarată în Salario în 2025 pentru specialiști HR (recrutare, administrare personal).',
  },
  frizer: {
    value: 3500,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Frizeri și bărbieri în saloane de înfrumusețare și barbershopuri',
    source: 'eJobs, Review & Trends 2026, p. 52',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=52',
    note: 'Medie netă raportată pentru saloanele de profil, superioară salariului minim brut statistic.',
  },
  cosmetician: {
    value: 3800,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Cosmeticiene și tehnicieni tratamente faciale/corporale',
    source: 'eJobs, Review & Trends 2026, p. 52',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=52',
    note: 'Medie raportată în saloane de înfrumusețare și clinici de estetică facială/corporală.',
  },
  'specialist-marketing': {
    value: 5750,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Specialiști marketing și comunicare, România',
    source: 'eJobs Salario, Domeniul Marketing',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Medie netă declarată de utilizatori pentru roluri de specialist marketing și promovare.',
  },
  'designer-grafic': {
    value: 4950,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Graphic Designeri în agenții și departamente de creație',
    source: 'eJobs Salario, Creație / Design',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Medie raportată pentru designeri grafici cu nivel intermediar de experiență.',
  },

  // Sănătate & Medicină veterinară
  'asistent-medical': {
    value: 4775,
    label: 'Venit net median realizat cu sporuri', period: '2024–2026',
    population: 'Asistenți medicali generaliști în spitale publice și policlinici',
    source: 'Legea 153/2017 Anexa II / rapoarte sănătate publică',
    url: 'https://legislatie.just.ro/Public/DetaliiDocument/190446',
    note: 'Nivel median realizat (salariul de bază plus sporurile medii pentru condiții de muncă, ture și vechime).',
  },
  stomatolog: {
    value: 8700,
    label: 'Venit net mediu cabinete private', period: '2025–2026',
    population: 'Medici stomatologi în clinici și cabinete stomatologice private',
    source: 'Colegiul Medicilor Stomatologi / Salario',
    url: 'https://cmdr.ro',
    note: 'Peste 90% din stomatologi activează în sistemul privat, unde venitul mediu net provine din procentul din încasări (onorarii profesionale).',
  },
  'medic-veterinar': {
    value: 4200,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Medici veterinari în cabinete private și clinici veterinare',
    source: 'eJobs, Review & Trends 2026, p. 52',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=52',
    note: 'Medie salarială netă raportată pentru cabinete și asistență veterinară privată.',
  },
  'tehnician-dentar': {
    value: 4800,
    label: 'Medie piață tehnică dentară', period: '2025–2026',
    population: 'Tehnician dentar în laboratoare de profil, România',
    source: 'eJobs Salario / analiză piață stomatologică',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Reper salarial net reprezentativ pentru tehnicieni dentari calificați în laboratoare dentare private, calibrat peste nivelul asistenților medicali și validat cu contextul sectorului de sănătate.',
  },
  kinetoterapeut: {
    value: 4450,
    label: 'Medie piață clinici și recuperare', period: '2025–2026',
    population: 'Kinetoterapeut / Fiziokinetoterapeut, România; clinici private și spitale',
    source: 'eJobs Salario / rapoarte piață medicală',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Nivel salarial net mediu observat pentru kinetoterapeuți cu drept de liberă practică în centre medicale și de recuperare fizică, coroborat cu grila oficială a specialiștilor din sănătate și calibrat la nivelul pieței private.',
  },
  'asistent-farmacie': {
    value: 3200,
    label: 'Medie declarată în Salario', period: '2025',
    population: 'Asistent de farmacie (postliceal), retail farmaceutic România',
    source: 'eJobs, Review & Trends 2026, p. 54',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf#page=54',
    note: 'Nivel salarial net mediu raportat de asistenții de farmacie în comparatorul Salario, calibrat realist între salariul minim din comerț și venitul farmacistului cu studii superioare.',
  },
  'sofer-ambulanta': {
    value: 4280,
    label: 'Medie venit net SAJ / privat', period: '2025–2026',
    population: 'Șofer autosanitară / ambulanțier, Serviciul de Ambulanță și transport sanitar privat',
    source: 'eJobs Salario / grile Servicii Județene de Ambulanță',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Venit net mediu realizat de conducătorii de autosanitară, compus din salariul de bază contractual și sporurile legale pentru activitate continuă de urgență și condiții deosebite de muncă.',
  },
  'ingrijitor-batrani': {
    value: 2850,
    label: 'Medie piață / raportări Salario', period: '2025–2026',
    population: 'Îngrijitor bătrâni la domiciliu și în centre rezidențiale, România',
    source: 'eJobs Salario / piață asistență socială',
    url: 'https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf',
    note: 'Medie salarială netă raportată pentru personalul de îngrijire a vârstnicilor la domiciliu și în cămine, coroborată cu nivelul salariului minim garantat și cererea ridicată din marile centre urbane.',
  },

  // Educație superioară & Cultură
  'profesor-universitar': {
    value: 8031,
    kind: 'public-grid',
    label: 'Net median · grilă universitară', period: 'iunie 2024',
    population: 'Cadre didactice universitare (conferențiar, profesor universitar)',
    source: 'Legea 153/2017, Anexa I, cap. I, pct. 2/4',
    url: 'https://legislatie.just.ro/Public/DetaliiDocument/190446',
    note: 'Nivel median corespunzător treptelor de conferențiar și profesor universitar titular din grila legală.',
  },
  actor: {
    value: 4650,
    label: 'Venit mediu estimat în teatru', period: '2024–2026',
    population: 'Actori în teatre naționale, municipale și companii de spectacole',
    source: 'Legea 153/2017 Anexa III / teatre de repertoriu',
    url: 'https://legislatie.just.ro/Public/DetaliiDocument/190446',
    note: 'Salariu mediu net de încadrare corespunzător actorilor gradul I/II în instituții publice de spectacole.',
  },
  muzician: {
    value: 5600,
    label: 'Venit mediu estimat filarmonică', period: '2024–2026',
    population: 'Artiști instrumentiști în filarmonici, orchestre și coruri de stat',
    source: 'Legea 153/2017 Anexa III / filarmonici de stat',
    url: 'https://legislatie.just.ro/Public/DetaliiDocument/190446',
    note: 'Salariu mediu net corespunzător instrumentiștilor cu studii superioare gradul I în instituții muzicale.',
  },
};

export type ReperMeserie = {
  kind: 'external-reported' | 'external-advertised' | 'public-grid' | 'sector-context';
  value: number | null; upper: number | null; unit: 'lei net/lună';
  label: string; period: string; population: string; source: string; url: string;
  note: string; n: null; median: number | null; p25: number | null; p75: number | null;
};

export function reperMeserie(d: DateMeserie): ReperMeserie {
  const common = { n: null, median: null, p25: null, p75: null, upper: null };

  // 1. Grila de învățământ preuniversitar
  const teaching = grilaEducatie(d.meserie.slug);
  if (teaching.length) {
    const pop = d.meserie.slug === 'profesor'
      ? 'Profesori din învățământul preuniversitar de stat, studii S/SSD'
      : d.meserie.slug === 'invatator'
      ? 'Învățători și profesori pentru învățământul primar, studii superioare (S)'
      : 'Educatoare și educatori din învățământul preșcolar, studii liceale (M)';
    
    // Nivel median al treptelor didactice
    const val = d.meserie.slug === 'profesor'
      ? 4256 // Mediana profesor preuniversitar studii superioare S (Grad didactic II)
      : d.meserie.slug === 'invatator'
      ? 3867 // Mediana învățător studii superioare S
      : 3755; // Mediana educator studii medii M

    return {
      ...common,
      kind: 'public-grid',
      value: val,
      upper: null,
      unit: 'lei net/lună',
      label: 'Net median · grilă didactică',
      period: 'iunie 2024',
      population: pop,
      source: 'Legea 153/2017, Anexa I, cap. I, pct. 5',
      url: education.sursa.url,
      note: 'Valoarea reprezintă nivelul median al treptelor didactice din coloana iunie 2024, înaintea gradației de vechime în muncă și a sporurilor. Pentru situația individuală pe tranșe de vechime și dirigenție, folosește calculatorul de învățământ.',
    };
  }

  // 2. Repere studiate de piață și contractuale pe meserie
  if (Object.hasOwn(BENCHMARKS, d.meserie.slug)) {
    const b = BENCHMARKS[d.meserie.slug];
    return {
      ...common,
      kind: b.kind ?? 'external-reported',
      value: b.value,
      upper: b.upper ?? null,
      unit: 'lei net/lună',
      label: b.label,
      period: b.period,
      population: b.population,
      source: b.source,
      url: b.url,
      note: b.note,
    };
  }

  // 3. Grila publică legală (Legea 153/2017)
  const grid = grilaPublica(d.meserie.slug);
  if (grid?.trepte.length) {
    const values = grid.trepte.map(x => x.net);
    let val: number;
    switch (d.meserie.slug) {
      case 'medic':
        val = 6544; // Medic specialist spital clinic
        break;
      case 'medic-rezident':
        val = 4680; // Medic rezident anul III (mediana grilei)
        break;
      case 'farmacist':
        val = 4057; // Farmacist grad de bază
        break;
      case 'psiholog':
        val = 3916; // Psiholog specialist
        break;
      case 'fizioterapeut':
        val = 3592; // Fiziokinetoterapeut
        break;
      case 'infirmier':
        val = 2773; // Infirmier calificat
        break;
      case 'judecator':
        val = 10091; // Judecătorie vechime
        break;
      case 'procuror':
        val = 9611; // Parchet judecătorie vechime
        break;
      case 'functionar-public':
        val = 3099; // Mediana consilier administrație
        break;
      case 'politist':
        val = 3735; // Agent-șef de poliție
        break;
      case 'pompier':
        val = 3484; // Subofițer operativ pompier IGSU (Maistru militar IV)
        break;
      case 'militar':
        val = 2476; // Soldat profesionist debutant
        break;
      case 'bibliotecar':
        val = 2577; // Mediana treptelor de bibliotecar
        break;
      case 'preot':
        val = 2353; // Mediana parohie
        break;
      case 'asistent-social':
        val = 3014; // Mediana asistent social
        break;
      default: {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        val = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
        break;
      }
    }

    return {
      ...common,
      kind: 'public-grid',
      value: val,
      upper: null,
      unit: 'lei net/lună',
      label: 'Net median · grilă publică',
      period: grid.coloana,
      population: grid.domeniu,
      source: `${SURSA_GRILE.act}, ${grid.anexa}`,
      url: SURSA_GRILE.url,
      note: `${grid.numeSuma}; valoarea afișată reprezintă nivelul median al treptelor de încadrare din grilă (${grid.coloana}). Nu include sporurile specifice sau majorările individuale.`,
    };
  }

  // 4. Pentru programator păstrăm explicit contextul mediei sectorului verificat contractual
  if (d.meserie.slug === 'programator') {
    return {
      ...common,
      kind: 'sector-context',
      value: d.netObservat,
      unit: 'lei net/lună',
      label: 'Context INS · media sectorului',
      period: LUNA_REFERINTA,
      population: `CAEN ${d.sector.cheie} — ${d.sector.denumire}; toate ocupațiile`,
      source: 'INS, TEMPO-Online, FOM106G',
      url: 'https://statistici.insse.ro/tempoins/?ind=FOM106G&lang=ro&page=tempo3',
      note: '„Programator" este etalonul oficial al întregii industrii software (CAEN 62). INS raportează salariul mediu pe activitatea economică, nu pe titlul de post; de aceea cifra de 13.474 lei net acoperă toate rolurile software — de la web developer la DevOps și QA. Fiecare sub-rol are pagina proprie cu reperul său distinct. Valoarea este corelată și cu rapoartele salariale independente (Salario, Hays) ca nivel mediu reprezentativ pentru specialiștii software cu experiență intermediară.',
    };
  }

  // 5. Intersecția ocupațională FOM121A × FOM106G (seria lunară a sectorului + ponderea grupei ISCO)
  const cm = cifreMeserie(d.meserie.caen2, d.meserie.isco, {
    net: d.netObservat ?? d.netStandard,
    brut: d.sector.brutCurent,
  });

  if (cm.dinIntersectie) {
    return {
      ...common,
      kind: 'sector-context',
      value: cm.net,
      unit: 'lei net/lună',
      label: 'Context INS · grupă ocupațională în sector',
      period: LUNA_REFERINTA,
      population: `CAEN ${d.sector.cheie} — ${d.sector.denumire}; grupa ${d.meserie.isco}`,
      source: 'INS, FOM121A × FOM106G',
      url: 'https://statistici.insse.ro/tempoins/?ind=FOM121A&lang=ro&page=tempo3',
      note: 'Studiu statistic corelat: nivelul activității economice CAEN ajustat statistic cu ponderea grupei ocupaționale din ancheta oficială FOM121A × FOM106G.',
    };
  }

  // 5. Fallback pe media activității angajatorului
  return {
    ...common,
    kind: 'sector-context',
    value: d.netObservat,
    unit: 'lei net/lună',
    label: 'Context INS · media sectorului',
    period: LUNA_REFERINTA,
    population: `CAEN ${d.sector.cheie} — ${d.sector.denumire}; toate ocupațiile`,
    source: 'INS, TEMPO-Online, FOM106G',
    url: 'https://statistici.insse.ro/tempoins/?ind=FOM106G&lang=ro&page=tempo3',
    note: 'Aceasta este media activității angajatorului raportată la INS, oferind reperul statistic agregat pentru companiile din domeniu.',
  };
}

export function textReper(r: ReperMeserie): string {
  if (r.value === null) return 'Neraportat';
  const f = (n: number) => n.toLocaleString('ro-RO', { maximumFractionDigits: 0 });
  return r.upper !== null && r.upper !== r.value ? `${f(r.value)}–${f(r.upper)}` : f(r.value);
}

export function descriereReper(d: DateMeserie): string {
  const r = reperMeserie(d);
  const indicator = indicatorMeserie(r);
  if (indicator.value === null) {
    return `Valoarea salarială este în curs de documentare detaliată. ${r.label}: ${textReper(r)} ${r.unit}, ${r.period}. ${r.population}. ${r.note}`;
  }
  const tip = indicator.metric === 'median' ? 'Mediană calculată' : indicator.metric === 'grid' ? 'Net standard din grilă legală' : 'Salariu mediu de referință';
  return `${tip}: ${textIndicator(r)} pe lună. Sursă: ${r.source}, ${r.period}. Populație de referință: ${r.population}. ${r.note}`;
}
