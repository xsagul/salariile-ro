import fs from 'node:fs';

const corData = JSON.parse(fs.readFileSync('src/data/cor-meserii.json', 'utf8')).occupations;
const baseline = JSON.parse(fs.readFileSync('src/data/backup-baseline-132-meserii-2026-09-06.json', 'utf8'));

const meseriiMap = new Map(baseline.map(m => [m.slug, m]));

// Reguli avansate de potrivire semantică și clustering tehnologic/profesional
const REGULI_OCUPATII = [
  // IT & Tech
  {
    slug: 'programator',
    keywords: ['programator', 'software developer', 'software engineer', 'backend developer', 'java developer', 'c++ developer', 'python developer', 'c# developer', '.net developer', 'php developer', 'fullstack developer', 'full stack developer'],
    excludeKeywords: ['cnc'],
    cor: corData['programator']
  },
  {
    slug: 'web-developer',
    keywords: ['web developer', 'frontend developer', 'front-end', 'react developer', 'angular developer', 'vue developer', 'wordpress developer', 'dezvoltator web'],
    cor: corData['web-developer']
  },
  {
    slug: 'tester-qa',
    keywords: ['tester qa', 'qa engineer', 'quality assurance', 'testare software', 'manual tester', 'automation tester', 'tester software'],
    cor: corData['tester-qa']
  },
  {
    slug: 'devops-engineer',
    keywords: ['devops', 'cloud engineer', 'sre', 'site reliability', 'infrastructure engineer', 'kubernetes', 'aws engineer', 'azure engineer'],
    cor: corData['devops-engineer'] || { code: '251208', denumire: 'inginer sisteme software' }
  },
  {
    slug: 'administrator-sistem',
    keywords: ['administrator sistem', 'sysadmin', 'administrator retea', 'it support', 'suport tehnic it', 'helpdesk it', 'tehnician it'],
    cor: corData['administrator-sistem'] || { code: '252201', denumire: 'administrator de rețea' }
  },
  {
    slug: 'analist-date',
    keywords: ['analist date', 'data analyst', 'bi analyst', 'business intelligence', 'power bi', 'sql analyst'],
    cor: corData['analist-date'] || { code: '252101', denumire: 'proiectant baze de date' }
  },
  {
    slug: 'designer-ui-ux',
    keywords: ['ui ux', 'ux designer', 'ui designer', 'product designer', 'figma designer', 'web designer'],
    cor: corData['designer-ui-ux'] || { code: '216601', denumire: 'designer grafică' }
  },
  
  // Blue-collar & Meșteșuguri
  {
    slug: 'electrician',
    keywords: ['electrician', 'electricean', 'tablotier', 'mentenanta electrica', 'instalatii electrice', 'electrician auto', 'electrician mt', 'electrician jt', 'tehnician electrician'],
    cor: corData['electrician'] || { code: '741101', denumire: 'electrician în construcții' }
  },
  {
    slug: 'instalator',
    keywords: ['instalator', 'instalatii sanitare', 'instalatii termice', 'instalator gaze', 'instalatii hvac', 'tehnico-sanitare', 'montator instalatii'],
    cor: corData['instalator'] || { code: '712601', denumire: 'instalator apă, canal' }
  },
  {
    slug: 'mecanic-auto',
    keywords: ['mecanic auto', 'diagnoza auto', 'service auto mecanic', 'mecanic utilaje', 'reparatii auto', 'mecanica auto'],
    cor: corData['mecanic-auto'] || { code: '723101', denumire: 'mecanic auto' }
  },
  {
    slug: 'sudor',
    keywords: ['sudor', 'sudura', 'mig mag', 'tig wig', 'sudor electrod', 'sudor tevi', 'confectii metalice sudor'],
    cor: corData['sudor'] || { code: '721201', denumire: 'sudor' }
  },
  {
    slug: 'lacatus-mecanic',
    keywords: ['lacatus mecanic', 'lacatus confectii metalice', 'lacatus montator', 'asamblare mecanica'],
    cor: corData['lacatus-mecanic'] || { code: '721401', denumire: 'lăcătuș mecanic' }
  },
  {
    slug: 'operator-cnc',
    keywords: ['operator cnc', 'frezor cnc', 'strungar cnc', 'programator cnc', 'prelucrari mecanice cnc'],
    cor: corData['operator-cnc'] || { code: '722301', denumire: 'reglor mașini-unelte' }
  },
  {
    slug: 'strungar',
    keywords: ['strungar', 'strung clasic', 'strungar universal'],
    cor: corData['strungar'] || { code: '722303', denumire: 'strungar universal' }
  },
  {
    slug: 'frezor',
    keywords: ['frezor', 'freza clasica', 'frezor universal'],
    cor: corData['frezor'] || { code: '722302', denumire: 'frezor universal' }
  },
  {
    slug: 'tamplar',
    keywords: ['tamplar', 'tamplar mobilier', 'pal melaminat', 'lemn masiv', 'montator mobila'],
    cor: corData['tamplar'] || { code: '752201', denumire: 'tâmplar universal' }
  },
  {
    slug: 'zugrav',
    keywords: ['zugrav', 'gletuitor', 'lavabila', 'rigipsar', 'finisor interioare', 'amenajari interioare zugrav', 'zugraveala'],
    cor: corData['zugrav'] || { code: '713102', denumire: 'zugrav' }
  },
  {
    slug: 'faiantar',
    keywords: ['faiantar', 'faianțar', 'gresie', 'faianta', 'placari ceramice', 'meserias gresie'],
    cor: corData['faiantar'] || { code: '712201', denumire: 'mozaicar-faianțar' }
  },
  {
    slug: 'zidar',
    keywords: ['zidar', 'zidarie', 'tencuitor', 'tencuieli mecanizate'],
    cor: corData['zidar'] || { code: '711201', denumire: 'zidar pietrar' }
  },
  {
    slug: 'fierar-betonist',
    keywords: ['fierar betonist', 'armaturi fier', 'fasonator fier'],
    cor: corData['fierar-betonist'] || { code: '711401', denumire: 'fierar betonist' }
  },
  {
    slug: 'dulgher',
    keywords: ['dulgher', 'cofraje', 'dulgherie acoperis'],
    cor: corData['dulgher'] || { code: '711501', denumire: 'dulgher construcții' }
  },
  {
    slug: 'constructor',
    keywords: ['muncitor constructii', 'muncitor necalificat constructii', 'lucrator santier', 'om santier', 'constructii civile'],
    cor: { code: '931301', denumire: 'muncitor necalificat la demolarea clădirilor' }
  },
  {
    slug: 'electromecanic',
    keywords: ['electromecanic', 'mentenanta utilaje electromecanic', 'tehnician electromecanic'],
    cor: corData['electromecanic'] || { code: '741201', denumire: 'electromecanic' }
  },

  // Transport & Logistică
  {
    slug: 'sofer-tir',
    keywords: ['sofer tir', 'sofer c+e', 'cap tractor', 'transport marfa intern', 'comunitate tir', 'camion'],
    cor: corData['sofer-tir'] || { code: '833201', denumire: 'șofer autocamion' }
  },
  {
    slug: 'sofer-distributie',
    keywords: ['sofer distributie', 'sofer duba', 'sofer categoria b livrari', 'distributie marfa', 'curierat duba'],
    cor: corData['sofer-distributie'] || { code: '832201', denumire: 'șofer autoturisme și camionete' }
  },
  {
    slug: 'curier',
    keywords: ['curier', 'curierat', 'distributie colete', 'sameday', 'fan courier', 'gls', 'dpd', 'easybox'],
    cor: corData['curier'] || { code: '962101', denumire: 'curier' }
  },
  {
    slug: 'livrator',
    keywords: ['livrator', 'livrator mancare', 'glovo', 'bolt food', 'wolt', 'livrator scuter', 'livrator pizza'],
    cor: corData['livrator'] || { code: '962102', denumire: 'livrator la domiciliu' }
  },
  {
    slug: 'stivuitorist',
    keywords: ['stivuitorist', 'motostivuitorist', 'operator stivuitor', 'depozit stivuitor'],
    cor: corData['stivuitorist'] || { code: '834401', denumire: 'stivuitorist' }
  },
  {
    slug: 'taximetrist',
    keywords: ['taximetrist', 'sofer taxi', 'transport alternativ', 'sofer bolt', 'sofer uber'],
    cor: corData['taximetrist'] || { code: '832202', denumire: 'taximetrist' }
  },

  // HoReCa & Comerț
  {
    slug: 'bucatar',
    keywords: ['bucatar', 'chef bucatar', 'bucatareasa', 'pizzar', 'grataragiu', 'bucatarie calda'],
    cor: corData['bucatar'] || { code: '512001', denumire: 'bucătar' }
  },
  {
    slug: 'ajutor-bucatar',
    keywords: ['ajutor bucatar', 'ajutor bucatarie', 'spalator vase', 'lucrator bucatarie'],
    cor: corData['ajutor-bucatar'] || { code: '941201', denumire: 'spălător vase' }
  },
  {
    slug: 'ospatar',
    keywords: ['ospatar', 'ospatarita', 'chelner', 'servire restaurant', 'ospatar evenimente'],
    cor: corData['ospatar'] || { code: '513102', denumire: 'ospătar' }
  },
  {
    slug: 'barman',
    keywords: ['barman', 'barista cafea', 'preparator bar'],
    cor: corData['barman'] || { code: '513201', denumire: 'barman' }
  },
  {
    slug: 'vanzator',
    keywords: ['vanzator', 'vanzatoare', 'consilier vanzari magazin', 'lucrator vanzari'],
    cor: corData['vanzator'] || { code: '522301', denumire: 'vânzător' }
  },
  {
    slug: 'casier',
    keywords: ['casier', 'casiera', 'casa de marcat', 'casier magazin', 'casier incasator'],
    cor: corData['casier'] || { code: '523001', denumire: 'casier' }
  },
  {
    slug: 'lucrator-comercial',
    keywords: ['lucrator comercial', 'aranjare marfa', 'manipulant marfa magazin', 'aprovizionare raft'],
    cor: corData['lucrator-comercial'] || { code: '522303', denumire: 'lucrător comercial' }
  },
  {
    slug: 'contabil',
    keywords: ['contabil', 'contabila', 'evidenta contabila', 'economist contabilitate', 'saga contabilitate', 'balanta contabila'],
    cor: corData['contabil'] || { code: '241104', denumire: 'contabil' }
  }
];

export function curataTextTitlu(raw) {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(angajam|angajeaza|cautam|caut|urgent|oferta|firma|serioasa|partener|salariu|motivant|avantajos)\b/gi, '')
    .replace(/[^a-z0-9\s\+\#\.\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detecteazaSenioritate(text) {
  const t = text.toLowerCase();
  if (/\b(junior|entry|debutant|asistent|ajutor|incepator|trainee|intern)\b/.test(t)) {
    return 'junior';
  }
  if (/\b(senior|lead|principal|sef|maistru|expert|specialist)\b/.test(t)) {
    return 'senior';
  }
  return 'mid';
}

export function normalizeazaOcupatie(rawTitle, rawDesc = '', defaultSlug = null) {
  const textCurat = curataTextTitlu(rawTitle);
  const textDesc = (rawDesc || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const comb = `${textCurat} ${textDesc.slice(0, 300)}`;

  // Dacă avem un defaultSlug sugerat de crawler
  if (defaultSlug && meseriiMap.has(defaultSlug)) {
    const reg = REGULI_OCUPATII.find(r => r.slug === defaultSlug);
    if (reg && reg.keywords.some(k => comb.includes(k))) {
      const b = meseriiMap.get(defaultSlug);
      return {
        ocupatie_normalizata: defaultSlug,
        nume_ocupatie: b.nume,
        cor_probabil: {
          cod: reg.cor?.code || null,
          denumire: reg.cor?.name || reg.cor?.denumire || b.nume
        },
        experienta: detecteazaSenioritate(rawTitle)
      };
    }
  }

  // Căutare reguli definite
  for (const reg of REGULI_OCUPATII) {
    if (reg.excludeKeywords && reg.excludeKeywords.some(ex => textCurat.includes(ex))) {
      continue;
    }
    for (const kw of reg.keywords) {
      if (textCurat.includes(kw)) {
        const b = meseriiMap.get(reg.slug) || { nume: reg.slug };
        return {
          ocupatie_normalizata: reg.slug,
          nume_ocupatie: b.nume,
          cor_probabil: {
            cod: reg.cor?.code || null,
            denumire: reg.cor?.name || reg.cor?.denumire || b.nume
          },
          experienta: detecteazaSenioritate(rawTitle)
        };
      }
    }
  }

  // Fallback pe baseline dacă există potrivire
  for (const b of baseline) {
    const cleanB = curataTextTitlu(b.nume);
    if (cleanB.length >= 4 && textCurat.includes(cleanB)) {
      const cor = corData[b.slug] || { code: null, denumire: null };
      return {
        ocupatie_normalizata: b.slug,
        nume_ocupatie: b.nume,
        cor_probabil: {
          cod: cor.code || null,
          denumire: cor.name || b.nume
        },
        experienta: detecteazaSenioritate(rawTitle)
      };
    }
  }

  return {
    ocupatie_normalizata: defaultSlug || 'alta-ocupatie',
    nume_ocupatie: defaultSlug ? (meseriiMap.get(defaultSlug)?.nume || defaultSlug) : rawTitle.slice(0, 30),
    cor_probabil: { cod: null, denumire: null },
    experienta: detecteazaSenioritate(rawTitle)
  };
}
