import fs from 'node:fs';
import * as cheerio from 'cheerio';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const baseline = JSON.parse(fs.readFileSync('src/data/backup-baseline-132-meserii-2026-09-06.json', 'utf8'));

const PUBLIC_SECTOR_SLUGS = new Set([
  'medic', 'medic-rezident', 'asistent-medical', 'asistent-farmacie', 'farmacist',
  'infirmier', 'fizioterapeut', 'psiholog', 'asistent-social', 'profesor',
  'invatator', 'educator', 'judecator', 'procuror', 'politist',
  'pompier', 'militar', 'functionar-public', 'bibliotecar', 'preot', 'cercetator'
]);

// Query & matching rules for each occupation
function getSearchConfig(slug, nume, cat) {
  // Normalize
  const cleanNume = nume.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Custom manual mappings for best results
  const CUSTOM = {
    'programator': { q: 'programator', matches: ['programator', 'software', 'developer', 'frontend', 'backend', 'java', 'python', 'c++', '.net', 'c#', 'php'] },
    'web-developer': { q: 'web developer', matches: ['web developer', 'frontend', 'fullstack', 'html', 'react', 'vue', 'angular', 'wordpress'] },
    'devops-engineer': { q: 'devops', matches: ['devops', 'cloud', 'sre', 'infrastructure', 'linux', 'sysadmin'] },
    'administrator-sistem': { q: 'administrator sistem', matches: ['administrator sistem', 'sysadmin', 'retea', 'it support', 'suport tehnic', 'helpdesk'] },
    'tester-qa': { q: 'tester qa', matches: ['tester', 'qa', 'quality assurance', 'testare'] },
    'analist-date': { q: 'analist date', matches: ['analist date', 'data analyst', 'bi analyst', 'business intelligence', 'sql', 'power bi'] },
    'inginer-date': { q: 'data engineer', matches: ['data engineer', 'inginer date', 'big data', 'etl', 'data warehouse'] },
    'specialist-securitate-it': { q: 'securitate it', matches: ['securitate it', 'cyber security', 'cybersecurity', 'infosec', 'soc analyst'] },
    'arhitect-software': { q: 'software architect', matches: ['architect', 'arhitect software', 'solutions architect', 'lead developer'] },
    'manager-proiect-it': { q: 'project manager it', matches: ['project manager', 'scrum master', 'product manager', 'manager proiect'] },
    'designer-ui-ux': { q: 'ui ux designer', matches: ['ui', 'ux', 'designer', 'product designer', 'figma'] },
    'inginer-mecanic': { q: 'inginer mecanic', matches: ['inginer mecanic', 'mecanica', 'proiectant mecanic', 'solidworks', 'cad'] },
    'inginer-electronist': { q: 'inginer electronist', matches: ['electronist', 'electronica', 'hardware', 'embedded', 'circuite'] },
    'inginer-electrotehnic': { q: 'inginer electrotehnic', matches: ['electrotehnic', 'electroenergetic', 'proiectant electric'] },
    'inginer-chimist': { q: 'inginer chimist', matches: ['chimist', 'chimie', 'laborator', 'analize chimice'] },
    'inginer-constructor': { q: 'inginer constructor', matches: ['inginer constructor', 'constructii', 'santier', 'proiectant constructii'] },
    'inginer-auto': { q: 'inginer auto', matches: ['inginer auto', 'automotive', 'autovehicule', 'calitate automotive'] },
    'inginer-agronom': { q: 'agronom', matches: ['agronom', 'ferma', 'cultura mare', 'agricol', 'fitosanitar'] },
    'inginer-silvic': { q: 'inginer silvic', matches: ['silvic', 'padure', 'ocol silvic', 'fond forestier'] },
    'inginer-geodez': { q: 'topograf', matches: ['geodez', 'topograf', 'cadastru', 'masuratori'] },
    'inginer-biomedical': { q: 'inginer biomedical', matches: ['biomedical', 'aparatura medicala', 'service medical'] },
    'inginer-aeronautic': { q: 'inginer aeronautic', matches: ['aeronautic', 'aviatie', 'aeronave'] },
    'inginer-petrol': { q: 'inginer petrol', matches: ['petrol', 'gaze', 'foraj', 'rafinarie'] },
    'inginer-energetician': { q: 'inginer energetician', matches: ['energetician', 'energie', 'fotovoltaic', 'regenerabile', 'statie'] },
    'inginer-telecomunicatii': { q: 'inginer telecomunicatii', matches: ['telecomunicatii', 'retele', 'fibra optica', 'radio', 'gsm'] },
    'inginer-mediu': { q: 'inginer protectia mediului', matches: ['protectia mediului', 'mediu', 'gestiunea deseurilor'] },
    'inginer-textil': { q: 'inginer textil', matches: ['textil', 'confectii', 'croitorie industriala'] },
    'inginer-instalatii': { q: 'inginer instalatii', matches: ['inginer instalatii', 'hvac', 'instalatii termice', 'sanitare'] },
    'electrician': { q: 'electrician', matches: ['electrician', 'electrice', 'tablotier', 'mentenanta electrica', 'instalatii electrice'] },
    'instalator': { q: 'instalator', matches: ['instalator', 'instalatii', 'sanitare', 'termice', 'gaze'] },
    'mecanic-auto': { q: 'mecanic auto', matches: ['mecanic', 'auto', 'service auto', 'diagnoza'] },
    'sudor': { q: 'sudor', matches: ['sudor', 'sudura', 'mig-mag', 'tig', 'wig', 'electrod'] },
    'lacatus-mecanic': { q: 'lacatus mecanic', matches: ['lacatus', 'mecanic', 'confectii metalice', 'asamblare'] },
    'operator-cnc': { q: 'operator cnc', matches: ['cnc', 'frezor', 'strungar', 'prelucrari mecanice'] },
    'strungar': { q: 'strungar', matches: ['strungar', 'strung', 'prelucrari mecanice'] },
    'frezor': { q: 'frezor', matches: ['frezor', 'freza', 'cnc'] },
    'tinichigiu-auto': { q: 'tinichigiu auto', matches: ['tinichigiu', 'caroserie', 'indreptat'] },
    'vopsitor-auto': { q: 'vopsitor auto', matches: ['vopsitor', 'vopsitorie auto', 'pregatitor'] },
    'electromecanic': { q: 'electromecanic', matches: ['electromecanic', 'mentenanta utilaje', 'tehnician'] },
    'tamplar': { q: 'tamplar', matches: ['tamplar', 'mobila', 'lemn', 'pal'] },
    'fierar-betonist': { q: 'fierar betonist', matches: ['fierar', 'betonist', 'armaturi', 'santier'] },
    'dulgher': { q: 'dulgher', matches: ['dulgher', 'cofraje', 'lemn', 'santier'] },
    'zidar': { q: 'zidar', matches: ['zidar', 'tencuitor', 'finisaje', 'amenajari'] },
    'zugrav': { q: 'zugrav', matches: ['zugrav', 'glet', 'lavabila', 'rigips', 'finisaje'] },
    'faiantar': { q: 'faiantar', matches: ['faiantar', 'gresie', 'faianta', 'placari'] },
    'macaragiu': { q: 'macaragiu', matches: ['macaragiu', 'macara', 'pod rulant'] },
    'stivuitorist': { q: 'stivuitorist', matches: ['stivuitorist', 'stivuitor', 'motostivuitor', 'depozit'] },
    'buldoexcavatorist': { q: 'buldoexcavatorist', matches: ['buldoexcavator', 'excavator', 'utilaje', 'terasamente'] },
    'sofer-tir': { q: 'sofer tir', matches: ['tir', 'camion', 'marfa', 'cap tractor', 'transport intern'] },
    'sofer-distributie': { q: 'sofer distributie', matches: ['distributie', 'curierat', 'duba', 'livrare', 'marfa'] },
    'sofer-autobuz': { q: 'sofer autobuz', matches: ['autobuz', 'microbuz', 'transport persoane'] },
    'sofer-taxi': { q: 'sofer taxi', matches: ['taxi', 'bolt', 'uber', 'transport alternativ'] },
    'curier': { q: 'curier', matches: ['curier', 'livrator', 'distributie colete', 'glovo', 'tazz'] },
    'livrator': { q: 'livrator', matches: ['livrator', 'curier', 'mancare', 'scuter'] },
    'bucatar': { q: 'bucatar', matches: ['bucatar', 'chef', 'pizzar', 'grataragiu', 'linie calda'] },
    'ajutor-bucatar': { q: 'ajutor bucatar', matches: ['ajutor bucatar', 'spalator vase', 'curatenie bucatarie'] },
    'ospatar': { q: 'ospatar', matches: ['ospatar', 'chelner', 'servire', 'evenimente'] },
    'barman': { q: 'barman', matches: ['barman', 'bar', 'cafenea', 'cocktail'] },
    'barista': { q: 'barista', matches: ['barista', 'cafenea', 'cafea', 'specialty'] },
    'cofetar': { q: 'cofetar', matches: ['cofetar', 'patiser', 'prajituri', 'torturi', 'laborator'] },
    'patiser': { q: 'patiser', matches: ['patiser', 'aluaturi', 'produse de panificatie'] },
    'brutar': { q: 'brutar', matches: ['brutar', 'panificatie', 'paine', 'cuptor'] },
    'pizzar': { q: 'pizzar', matches: ['pizzar', 'pizza', 'cuptor pe lemne'] },
    'receptioner-hotel': { q: 'receptioner hotel', matches: ['receptioner', 'front desk', 'cazare', 'hotel', 'pensiune'] },
    'camerista': { q: 'camerista', matches: ['camerista', 'curatenie camere', 'hotel'] },
    'vanzator': { q: 'vanzator', matches: ['vanzator', 'comercial', 'magazin', 'consilier vanzari'] },
    'casier': { q: 'casier', matches: ['casier', 'casa de marcat', 'incasare', 'supermarket'] },
    'lucrator-comercial': { q: 'lucrator comercial', matches: ['lucrator comercial', 'marfa', 'raft', 'depozit', 'supermarket'] },
    'manager-magazin': { q: 'sef magazin', matches: ['sef magazin', 'director magazin', 'store manager', 'responsabil magazin'] },
    'merchandiser': { q: 'merchandiser', matches: ['merchandiser', 'aranjare marfa', 'vizibilitate'] },
    'agent-securitate': { q: 'agent securitate', matches: ['paza', 'securitate', 'agent paza', 'obiective'] },
    'operator-curatenie': { q: 'operator curatenie', matches: ['curatenie', 'menajera', 'igienizare'] },
    'menajera': { q: 'menajera', matches: ['menajera', 'menaj', 'curatenie birouri', 'curatenie locuinte'] },
    'ingrijitor-batrani': { q: 'ingrijitor batrani', matches: ['ingrijitor', 'batrani', 'persoane varstnice', 'camin'] },
    'baby-sitter': { q: 'bona', matches: ['bona', 'babysitter', 'copii', 'ingrijire copii'] },
    'frizer': { q: 'frizer', matches: ['frizer', 'barber', 'tunsori', 'barber shop'] },
    'coafor': { q: 'coafor', matches: ['coafeza', 'hairstylist', 'coafor', 'vopsit'] },
    'manichiurista': { q: 'manichiurista', matches: ['manichiura', 'pedichiura', 'unghii false', 'nail'] },
    'cosmeticiana': { q: 'cosmeticiana', matches: ['cosmetica', 'epilare', 'tratamente faciale'] },
    'maseur': { q: 'maseur', matches: ['maseur', 'masaj', 'terapeut', 'spa'] },
    'instructor-auto': { q: 'instructor auto', matches: ['instructor auto', 'scoala de soferi', 'categoria b'] },
    'instructor-fitness': { q: 'instructor fitness', matches: ['fitness', 'antrenor personal', 'gym', 'aerobic'] },
    'agent-imobiliar': { q: 'agent imobiliar', matches: ['imobiliar', 'broker imobiliar', 'inchirieri', 'tranzactii'] },
    'agent-asigurari': { q: 'agent asigurari', matches: ['asigurari', 'consultant asigurari', 'broker asigurari'] },
    'agent-vanzari': { q: 'agent vanzari', matches: ['agent vanzari', 'reprezentant vanzari', 'sales representative', 'b2b'] },
    'contabil': { q: 'contabil', matches: ['contabil', 'contabilitate', 'balanta', 'declaratii', 'saga'] },
    'economist': { q: 'economist', matches: ['economist', 'financiar', 'raportari', 'analiza financiara'] },
    'auditor-financiar': { q: 'auditor financiar', matches: ['auditor', 'audit', 'audit extern', 'audit intern'] },
    'analist-financiar': { q: 'analist financiar', matches: ['analist financiar', 'financial analyst', 'bugetare', 'controling'] },
    'specialist-resurse-umane': { q: 'specialist hr', matches: ['resurse umane', 'hr', 'recrutare', 'salarizare', 'personal'] },
    'recrutor': { q: 'recruiter', matches: ['recrutor', 'recruiter', 'talent acquisition', 'recrutare'] },
    'specialist-marketing': { q: 'specialist marketing', matches: ['marketing', 'digital marketing', 'social media', 'campanii'] },
    'specialist-seo': { q: 'specialist seo', matches: ['seo', 'search engine optimization', 'link building', 'optimizare'] },
    'copywriter': { q: 'copywriter', matches: ['copywriter', 'content writer', 'redactare', 'articole'] },
    'grafician': { q: 'graphic designer', matches: ['grafician', 'graphic designer', 'photoshop', 'illustrator', 'design grafic'] },
    'fotograf': { q: 'fotograf', matches: ['fotograf', 'foto', 'sedinte foto', 'evenimente'] },
    'videograf': { q: 'cameraman', matches: ['videograf', 'cameraman', 'video editor', 'filmare', 'montaj'] },
    'traducator': { q: 'traducator', matches: ['traducator', 'traduceri', 'interpret'] },
    'consilier-juridic': { q: 'consilier juridic', matches: ['consilier juridic', 'jurist', 'contracte', 'avizari'] },
    'notar': { q: 'notar', matches: ['notar', 'birou notarial', 'secretar notariat'] },
    'avocat': { q: 'avocat', matches: ['avocat', 'cabinet avocat', 'litigii', 'barou'] },
    'arhitect': { q: 'arhitect', matches: ['arhitect', 'proiectare', 'arhitectura', 'autocad', 'archicad'] },
    'designer-interior': { q: 'designer interior', matches: ['designer interior', 'amenajari interioare', 'randari 3d'] },
    'medic-veterinar': { q: 'medic veterinar', matches: ['veterinar', 'cabinet veterinar', 'clinica veterinara'] },
    'asistent-veterinar': { q: 'asistent veterinar', matches: ['asistent veterinar', 'cabinet veterinar', 'animale'] },
    'tehnician-dentar': { q: 'tehnician dentar', matches: ['tehnician dentar', 'laborator dentar', 'proteze', 'ceramica'] },
    'optometrist': { q: 'optometrist', matches: ['optometrist', 'optica medicala', 'prescriptie ochelari'] },
    'kinetoterapeut': { q: 'kinetoterapeut', matches: ['kinetoterapeut', 'kinetoterapie', 'recuperare medicala'] },
    'asistent-radiologie': { q: 'asistent radiologie', matches: ['radiologie', 'imagistica', 'ct', 'rmn', 'radiografii'] },
    'operator-call-center': { q: 'operator call center', matches: ['call center', 'relatii clienti', 'customer care', 'suport'] },
    'dispecer-transport': { q: 'dispecer transport', matches: ['dispecer', 'transport marfa', 'expeditii', 'flota'] },
    'pilot': { q: 'pilot avion', matches: ['pilot', 'aviatie', 'aeronava', 'copilot'] }
  };

  if (CUSTOM[slug]) return CUSTOM[slug];

  return {
    q: cleanNume,
    matches: [cleanNume, slug.replace(/-/g, ' ')]
  };
}

async function fetchOlx(query, keywords) {
  const url = `https://www.olx.ro/api/v1/offers/?query=${encodeURIComponent(query)}&category_id=4`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json.data || [];
    const results = [];

    for (const it of items) {
      const title = (it.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const matchesKeyword = keywords.some(k => title.includes(k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
      if (!matchesKeyword) continue;

      const salParam = it.params?.find(p => p.key === 'salary')?.value;
      if (!salParam) continue;

      let min = salParam.from || salParam.to;
      let max = salParam.to || salParam.from;
      if (!min && !max) continue;
      if (min && !max) max = min;
      if (max && !min) min = max;

      const cur = salParam.currency || 'RON';
      if (cur !== 'RON') continue;

      if (max < 2699 || min > 75000) continue;
      if (min < 2699) min = 2699;

      results.push({
        sursa: 'OLX Locuri de Muncă',
        id: `olx-${it.id}`,
        titlu: it.title,
        oras: it.location?.city?.name || 'România',
        judet: it.location?.region?.name || '',
        salariuMin: min,
        salariuMax: max,
        salariuCalculat: Math.round((min + max) / 2),
        moneda: 'RON',
        esteBrut: !!salParam.gross,
        dataPublicare: it.created_time || it.last_refresh_time,
        url: it.url
      });
    }
    return results;
  } catch (e) {
    return [];
  }
}

async function fetchBestJobs(query, keywords) {
  const url = `https://www.bestjobs.eu/ro/locuri-de-munca?keyword=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const raw = $('#__NEXT_DATA__').html();
    if (!raw) return [];

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return [];
    }

    const items = data.props?.pageProps?.jobListCardsFromServer?.items || [];
    const results = [];

    for (const it of items) {
      const title = (it.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const matchesKeyword = keywords.some(k => title.includes(k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
      if (!matchesKeyword) continue;

      const locNames = (it.locations || []).map(l => (l.name || '').toLowerCase()).join(' ');
      if (locNames.includes('olanda') || locNames.includes('netherlands') || locNames.includes('germania') || locNames.includes('belgia') || locNames.includes('strainatate')) {
        continue;
      }
      if (title.includes('olanda') || title.includes('germania') || title.includes('netherlands')) {
        continue;
      }

      const salStr = it.salary;
      if (!salStr || typeof salStr !== 'string') continue;

      const parts = salStr.split('-').map(s => Number(s.replace(/[^0-9]/g, ''))).filter(n => !isNaN(n) && n > 0);
      if (!parts.length) continue;

      let min = parts[0];
      let max = parts[1] || parts[0];

      let moneda = 'RON';
      if (max < 3000) {
        moneda = 'EUR';
        min = Math.round(min * 4.97);
        max = Math.round(max * 4.97);
      }

      if (max < 2699 || min > 75000) continue;
      if (min < 2699) min = 2699;

      results.push({
        sursa: 'BestJobs',
        id: `bestjobs-${it.id}`,
        titlu: it.title,
        angajator: it.companyName || '',
        oras: (it.locations || []).map(l => l.name).join(', ') || 'România',
        salariuMin: min,
        salariuMax: max,
        salariuCalculat: Math.round((min + max) / 2),
        moneda: 'RON',
        esteBrut: false,
        url: it.slug ? `https://www.bestjobs.eu/ro/loc-de-munca/${it.slug}` : ''
      });
    }
    return results;
  } catch (e) {
    return [];
  }
}

async function main() {
  console.log('=== START CRAWLING PIAȚA MUNCII ROMÂNIA (111 Meserii Private) ===');
  const marketJobs = baseline.filter(x => !PUBLIC_SECTOR_SLUGS.has(x.slug));
  const rawDatabase = {};
  let totalAdsCollected = 0;

  for (let i = 0; i < marketJobs.length; i++) {
    const job = marketJobs[i];
    const conf = getSearchConfig(job.slug, job.nume, job.categorie);
    process.stdout.write(`[${i + 1}/${marketJobs.length}] Crawling "${job.nume}" (${conf.q})... `);

    const olxAds = await fetchOlx(conf.q, conf.matches);
    await sleep(250);
    const bjAds = await fetchBestJobs(conf.q, conf.matches);
    await sleep(250);

    // Deduplicate by title & employer & salary
    const seen = new Set();
    const unique = [];
    for (const ad of [...olxAds, ...bjAds]) {
      const key = `${ad.sursa}|${ad.titlu}|${ad.salariuMin}-${ad.salariuMax}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(ad);
      }
    }

    rawDatabase[job.slug] = {
      slug: job.slug,
      nume: job.nume,
      categorie: job.categorie,
      termenCautat: conf.q,
      totalOferte: unique.length,
      distributie: {
        olx: olxAds.length,
        bestjobs: bjAds.length
      },
      oferte: unique
    };

    totalAdsCollected += unique.length;
    console.log(`✓ ${unique.length} oferte (${olxAds.length} OLX, ${bjAds.length} BestJobs)`);
  }

  const payload = {
    generatLa: new Date().toISOString(),
    totalOferte: totalAdsCollected,
    totalMeseriiScanate: marketJobs.length,
    meserii: rawDatabase
  };

  fs.mkdirSync('research/surse-salarii', { recursive: true });
  fs.writeFileSync('research/surse-salarii/anunturi-piata-reale-2026.json', JSON.stringify(payload, null, 2), 'utf8');
  console.log(`\n========================================`);
  console.log(`GATA! Colectat ${totalAdsCollected} anunțuri active reale din piață.`);
  console.log(`Salvat în: research/surse-salarii/anunturi-piata-reale-2026.json`);
  console.log(`========================================`);
}

main();
