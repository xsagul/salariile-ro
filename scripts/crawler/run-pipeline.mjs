import fs from 'node:fs';
import { extrageObservatiiOlx } from './connectors/olx.mjs';
import { extrageObservatiiBestJobs } from './connectors/bestjobs.mjs';
import { extrageObservatiiSectorPublic } from './connectors/public-sector.mjs';
import { deduplicaObservatiiCrossSite } from './deduplicator.mjs';
import { sleep } from './connectors/base.mjs';

const baseline = JSON.parse(fs.readFileSync('src/data/backup-baseline-132-meserii-2026-09-06.json', 'utf8'));

const PUBLIC_SECTOR_SLUGS = new Set([
  'medic', 'medic-rezident', 'asistent-medical', 'asistent-farmacie', 'farmacist',
  'infirmier', 'fizioterapeut', 'psiholog', 'asistent-social', 'profesor',
  'invatator', 'educator', 'judecator', 'procuror', 'politist',
  'pompier', 'militar', 'functionar-public', 'bibliotecar', 'preot', 'cercetator'
]);

function getSearchConfig(slug, nume) {
  const cleanNume = nume.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const CUSTOM = {
    'programator': { q: 'programator', matches: ['programator', 'software', 'developer', 'frontend', 'backend', 'java', 'python', 'c++', '.net', 'c#', 'php', 'fullstack'] },
    'web-developer': { q: 'web developer', matches: ['web developer', 'frontend', 'fullstack', 'html', 'react', 'vue', 'angular', 'wordpress', 'javascript'] },
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
    'electrician': { q: 'electrician', matches: ['electrician', 'electricean', 'electrice', 'tablotier', 'mentenanta electrica', 'instalatii electrice', 'tablouri electrice'] },
    'instalator': { q: 'instalator', matches: ['instalator', 'instalatii', 'sanitare', 'termice', 'gaze', 'hvac', 'om instalatii'] },
    'mecanic-auto': { q: 'mecanic auto', matches: ['mecanic', 'mecanic auto', 'auto', 'service auto', 'diagnoza', 'mecanica'] },
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
    'zugrav': { q: 'zugrav', matches: ['zugrav', 'glet', 'lavabila', 'rigips', 'finisaje', 'amenajari', 'zugraveala'] },
    'faiantar': { q: 'faiantar', matches: ['faiantar', 'faianțar', 'gresie', 'faianta', 'placari', 'meserias gresie'] },
    'macaragiu': { q: 'macaragiu', matches: ['macaragiu', 'macara', 'pod rulant'] },
    'stivuitorist': { q: 'stivuitorist', matches: ['stivuitorist', 'stivuitor', 'motostivuitor', 'depozit'] },
    'buldoexcavatorist': { q: 'buldoexcavatorist', matches: ['buldoexcavator', 'excavator', 'utilaje', 'terasamente'] },
    'sofer-tir': { q: 'sofer tir', matches: ['tir', 'camion', 'marfa', 'cap tractor', 'transport intern'] },
    'sofer-distributie': { q: 'sofer distributie', matches: ['distributie', 'curierat', 'duba', 'livrare', 'marfa'] },
    'sofer-autobuz': { q: 'sofer autobuz', matches: ['autobuz', 'microbuz', 'transport persoane'] },
    'sofer-taxi': { q: 'sofer taxi', matches: ['taxi', 'bolt', 'uber', 'transport alternativ'] },
    'curier': { q: 'curier', matches: ['curier', 'livrator', 'distributie colete', 'glovo', 'tazz'] },
    'livrator': { q: 'livrator', matches: ['livrator', 'curier', 'mancare', 'scuter'] },
    'bucatar': { q: 'bucatar', matches: ['bucatar', 'bucatareasa', 'chef', 'pizzar', 'grataragiu', 'linie calda'] },
    'ajutor-bucatar': { q: 'ajutor bucatar', matches: ['ajutor bucatar', 'ajutor bucatarie', 'spalator vase', 'curatenie bucatarie'] },
    'ospatar': { q: 'ospatar', matches: ['ospatar', 'ospatarita', 'chelner', 'servire', 'evenimente'] },
    'barman': { q: 'barman', matches: ['barman', 'bar', 'cafenea', 'cocktail'] },
    'barista': { q: 'barista', matches: ['barista', 'cafenea', 'cafea', 'specialty'] },
    'cofetar': { q: 'cofetar', matches: ['cofetar', 'patiser', 'prajituri', 'torturi', 'laborator'] },
    'patiser': { q: 'patiser', matches: ['patiser', 'aluaturi', 'produse de panificatie'] },
    'brutar': { q: 'brutar', matches: ['brutar', 'panificatie', 'paine', 'cuptor'] },
    'pizzar': { q: 'pizzar', matches: ['pizzar', 'pizza', 'cuptor pe lemne'] },
    'receptioner-hotel': { q: 'receptioner hotel', matches: ['receptioner', 'front desk', 'cazare', 'hotel', 'pensiune'] },
    'camerista': { q: 'camerista', matches: ['camerista', 'curatenie camere', 'hotel'] },
    'vanzator': { q: 'vanzator', matches: ['vanzator', 'vanzatoare', 'comercial', 'magazin', 'consilier vanzari'] },
    'casier': { q: 'casier', matches: ['casier', 'casiera', 'casa de marcat', 'incasare', 'supermarket'] },
    'lucrator-comercial': { q: 'lucrator comercial', matches: ['lucrator comercial', 'marfa', 'raft', 'depozit', 'supermarket', 'aranjare marfa'] },
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
    'pilot': { q: 'pilot avion', matches: ['pilot', 'aviatie', 'aeronava', 'copilot'] },
    'constructor': { q: 'muncitor constructii', matches: ['constructii', 'santier', 'muncitor constructii', 'lucrator constructii', 'muncitor necalificat'] },
    'taximetrist': { q: 'sofer taxi', matches: ['taxi', 'taximetrist', 'bolt', 'uber', 'transport persoane'] },
    'muncitor-industria-alimentara': { q: 'muncitor fabrica', matches: ['alimentara', 'panificatie', 'mezeluri', 'ambalator', 'productie'] },
    'postas': { q: 'factor postal', matches: ['postas', 'posta', 'curierat postal', 'factor postal'] },
    'marinar': { q: 'marinar', matches: ['marinar', 'timonier', 'fluvial', 'portuar', 'navigatie'] }
  };

  if (CUSTOM[slug]) return CUSTOM[slug];
  return { q: cleanNume, matches: [cleanNume, slug.replace(/-/g, ' ')] };
}

export async function ruleazaPipelineComplet({ snapshotId = '2026-09', limit = null } = {}) {
  console.log(`=== START PIPELINE MODULAR DE CRAWLING ȘI OBSERVATII (Snapshot ${snapshotId}) ===`);
  const snapshotDir = `data/snapshots/${snapshotId}`;
  fs.mkdirSync(snapshotDir, { recursive: true });

  const marketJobs = baseline.filter(x => !PUBLIC_SECTOR_SLUGS.has(x.slug));
  const jobsToProcess = limit ? marketJobs.slice(0, limit) : marketJobs;

  let toateObservatiileBrute = [];

  // 1. Rulare conectori privați (OLX + BestJobs)
  for (let i = 0; i < jobsToProcess.length; i++) {
    const job = jobsToProcess[i];
    const conf = getSearchConfig(job.slug, job.nume);
    process.stdout.write(`[${i + 1}/${jobsToProcess.length}] Scanare conectată "${job.nume}" (${conf.q})... `);

    const olxObs = await extrageObservatiiOlx(conf.q, job.slug, conf.matches, 3);
    await sleep(200);

    const bjObs = await extrageObservatiiBestJobs(conf.q, job.slug, conf.matches, 2);
    await sleep(200);

    const rawJobObs = [...olxObs, ...bjObs];
    toateObservatiileBrute.push(...rawJobObs);

    console.log(`✓ ${rawJobObs.length} observații culese (${olxObs.length} OLX, ${bjObs.length} BestJobs)`);
  }

  // 2. Rulare conector sector public (D112 spitale / grile)
  console.log(`\nScanare conector sector public (D112 / SCJU Constanța)...`);
  const publicObs = extrageObservatiiSectorPublic();
  console.log(`✓ ${publicObs.length} observații oficiale extrase din transparență publică.`);
  toateObservatiileBrute.push(...publicObs);

  // 3. Deduplicare cross-site și calcul scor de încredere consolidat
  console.log(`\nDeduplicare cross-site și scoring de încredere...`);
  const { observatiiUnice, totalOriginal, totalDeduplicate, duplicateEliminate, confirmateCrossSite } = deduplicaObservatiiCrossSite(toateObservatiileBrute);

  console.log(`Total observații brute culese: ${totalOriginal}`);
  console.log(`Observații unice păstrate (1 post = 1 vot): ${totalDeduplicate}`);
  console.log(`Duplicate cross-site eliminate: ${duplicateEliminate}`);
  console.log(`Confirmate pe multiple platforme: ${confirmateCrossSite}`);

  // 4. Salvare snapshot istoric (fără suprascriere a istoricului trecut)
  const snapshotPayload = {
    snapshot: snapshotId,
    generatLa: new Date().toISOString(),
    valabilitate: `${snapshotId} – ${snapshotId === '2026-09' ? '2027-03' : 'următorul semestru'}`,
    statistici: {
      totalObservatiiBrute: totalOriginal,
      totalObservatiiUnice: totalDeduplicate,
      duplicateEliminate,
      confirmateCrossSite,
      scorIncredereMediu: Math.round((observatiiUnice.reduce((acc, o) => acc + o.confidence_score, 0) / (observatiiUnice.length || 1)) * 100) / 100
    },
    observatii: observatiiUnice
  };

  fs.writeFileSync(`${snapshotDir}/observatii-complete.json`, JSON.stringify(snapshotPayload, null, 2), 'utf8');
  console.log(`\n✓ Salvat snapshot istoric: ${snapshotDir}/observatii-complete.json`);

  // 5. Sincronizare cu compatibilitatea legacy pentru generare triangulare
  const groupedBySlug = new Map();
  for (const obs of observatiiUnice) {
    if (!groupedBySlug.has(obs.ocupatie_normalizata)) {
      groupedBySlug.set(obs.ocupatie_normalizata, []);
    }
    groupedBySlug.get(obs.ocupatie_normalizata).push(obs);
  }

  const rawDatabase = {};
  for (const job of baseline) {
    const jobObs = groupedBySlug.get(job.slug) || [];
    const countOlx = jobObs.filter(a => (a.surse_confirmate || []).includes('olx') || a.sursa === 'olx').length;
    const countBestJobs = jobObs.filter(a => (a.surse_confirmate || []).includes('bestjobs') || a.sursa === 'bestjobs').length;

    rawDatabase[job.slug] = {
      slug: job.slug,
      nume: job.nume,
      categorie: job.categorie,
      totalOferteDeduplicate: jobObs.length,
      distributie: { olx: countOlx, bestjobs: countBestJobs },
      oferte: jobObs.map(o => ({
        sursa: o.sursa === 'olx' ? 'OLX Locuri de Muncă' : (o.sursa === 'bestjobs' ? 'BestJobs' : o.sursa),
        id: o.id,
        titlu: o.job_title_raw,
        angajator: o.angajator_raw,
        oras: o.oras,
        salariuMinNet: o.salariu_min,
        salariuMaxNet: o.salariu_max,
        salariuNetCalculat: o.salariu_calculat,
        salariuBazaGarantat: o.salariu_baza_garantat,
        confidence_score: o.confidence_score,
        surse_confirmate: o.surse_confirmate,
        dataPublicare: o.data_publicarii,
        url: o.url
      }))
    };
  }

  const legacyPayload = {
    generatLa: new Date().toISOString(),
    snapshot: 'septembrie 2026',
    valabilitate: 'septembrie 2026 – martie 2027',
    totalOferteBrute: totalOriginal,
    totalOferteDeduplicate: totalDeduplicate,
    totalMeseriiScanate: baseline.length,
    metodologie: 'Pipeline modular multi-sursă (conectori independenți OLX + BestJobs + D112), normalizare COR, deduplicare cross-site, scoring de încredere, stocare istorică',
    meserii: rawDatabase
  };

  fs.writeFileSync('research/surse-salarii/anunturi-piata-reale-2026.json', JSON.stringify(legacyPayload, null, 2), 'utf8');
  console.log(`✓ Sincronizat: research/surse-salarii/anunturi-piata-reale-2026.json`);

  return snapshotPayload;
}

// Rulare CLI dacă este executat direct
if (process.argv[1]?.endsWith('run-pipeline.mjs')) {
  const isQuick = process.argv.includes('--quick');
  ruleazaPipelineComplet({ limit: isQuick ? 5 : null });
}
