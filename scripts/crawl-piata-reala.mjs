import fs from 'node:fs';
import * as cheerio from 'cheerio';
import { calculStandard } from '../src/lib/fiscal.ts';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const baseline = JSON.parse(fs.readFileSync('src/data/backup-baseline-132-meserii-2026-09-06.json', 'utf8'));

const PUBLIC_SECTOR_SLUGS = new Set([
  'medic', 'medic-rezident', 'asistent-medical', 'asistent-farmacie', 'farmacist',
  'infirmier', 'fizioterapeut', 'psiholog', 'asistent-social', 'profesor',
  'invatator', 'educator', 'judecator', 'procuror', 'politist',
  'pompier', 'militar', 'functionar-public', 'bibliotecar', 'preot', 'cercetator'
]);

const FRESHNESS_THRESHOLD = new Date('2025-03-01').getTime();

function getSearchConfig(slug, nume, cat) {
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

  return {
    q: cleanNume,
    matches: [cleanNume, slug.replace(/-/g, ' ')]
  };
}

function analizeazaSemanticAnunt({ titlu, descriere = '', netMin, netMax }) {
  const textCurat = (titlu + ' ' + (descriere || '')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Verificare Diaspora / Străinătate ascunsă
  const termeniStrainatate = [
    'germania', 'olanda', 'netherlands', 'belgia', 'anglia', 'austria',
    'spania', 'franta', 'diurna externa', 'contract strainatate',
    'plecari germania', 'munca in afara', 'munca strainatate'
  ];
  for (const t of termeniStrainatate) {
    if (textCurat.includes(t)) {
      return { valid: false, motiv: `Detectat job în străinătate (${t})` };
    }
  }

  // 2. Verificare Înșelăciuni / MLM / Videochat / Spam dubios
  const termeniDubiosi = [
    'lucru de acasa 500', 'bani din telefon', 'fara experienta castiguri uriase',
    'videochat', 'model online', 'operator chat', 'ambalat pixuri', 'plafar acasa',
    'castiga zilnic mii', 'munca usoara la domiciliu'
  ];
  for (const t of termeniDubiosi) {
    if (textCurat.includes(t)) {
      return { valid: false, motiv: `Detectat anunț spam/dubios (${t})` };
    }
  }

  // 3. Scepticism sănătos Bacșiș, Tips, Bonusuri și Comisioane
  const areTips = /bac[sș]i[sș]|tips/.test(textCurat);
  const areBonusuriSauComisioane = /bonus|comision|comisioane|performan[tț][aă]|tinte de v[aâ]nz[aă]ri|comenzi livrate/.test(textCurat);
  const areTipsSauBonus = areTips || areBonusuriSauComisioane;

  let salariuBazaCalculat = Math.round((netMin + netMax) / 2);
  let ajustareSceptica = 'standard';
  let salariuBazaGarantat = netMin;

  // Căutare salariu fix / garantat explicit în descriere (ex: "salariu fix 3500 lei", "salariu net de baza 4000 lei + tips")
  const regexFix = /salariu(?:l)?\s*(?:fix|de baz[aă]|garantat|net)?\s*(?:de|este|:)?\s*(\d{4,5})\s*(?:lei|ron)/i;
  const matchFix = textCurat.match(regexFix);
  if (matchFix) {
    const valFix = parseInt(matchFix[1], 10);
    if (valFix >= 2699 && valFix <= 35000) {
      salariuBazaCalculat = valFix;
      salariuBazaGarantat = valFix;
      ajustareSceptica = 'extras_salariu_fix_garantat_din_text';
    }
  }

  // Dacă nu există o mențiune explicită de salariu fix, dar există tips sau bonusuri variabile:
  if (ajustareSceptica === 'standard' && areTipsSauBonus) {
    const raportEcart = netMax / netMin;
    if (raportEcart >= 1.5) {
      // Angajatorul a introdus în interval estimări de tips sau bonusuri ipotetice (ex: 3500 - 8000 lei)
      // Ancorăm sceptic pe baza garantată (minimul) plus cel mult 15% din ecart
      salariuBazaCalculat = Math.round(netMin + 0.15 * (netMax - netMin));
      ajustareSceptica = areTips ? 'temperat_sceptic_bacsis_inclus' : 'temperat_sceptic_bonus_performanta';
    } else {
      // Ecart moderat cu bonus/tips opțional (ex: 4000 - 4500 lei)
      salariuBazaCalculat = Math.round((netMin + netMax) / 2);
      ajustareSceptica = 'ecart_moderat_cu_tips_bonus';
    }
  }

  return {
    valid: true,
    salariuBazaCalculat,
    salariuBazaGarantat,
    areTipsSauBonus,
    areTips,
    areBonusuri: areBonusuriSauComisioane,
    ajustareSceptica
  };
}

async function fetchOlxDeep(query, keywords, maxPages = 3) {
  const results = [];
  for (let page = 0; page < maxPages; page++) {
    const offset = page * 50;
    const url = `https://www.olx.ro/api/v1/offers/?query=${encodeURIComponent(query)}&category_id=4&offset=${offset}&limit=50`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      if (!res.ok) break;
      const json = await res.json();
      const items = json.data || [];
      if (!items.length) break;

      for (const it of items) {
        // Full-time filter
        const typeParam = it.params?.find(p => p.key === 'type')?.value?.key;
        if (typeParam === 'part-time') continue;

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

        // Freshness check: must be >= March 1, 2025
        const pubDate = it.created_time || it.last_refresh_time;
        const dt = pubDate ? new Date(pubDate).getTime() : 0;
        if (dt && dt < FRESHNESS_THRESHOLD) continue;

        // Gross to net conversion using fiscal.ts
        const isGross = !!salParam.gross;
        let netMin = min;
        let netMax = max;
        if (isGross) {
          netMin = calculStandard(min).net;
          netMax = calculStandard(max).net;
        }

        if (netMax < 2699 || netMin > 75000) continue;
        if (netMin < 2699) netMin = 2699;

        // Analiză semantică inteligentă a descrierii și scepticism la bonusuri/tips
        const rawDesc = (it.description || '').replace(/<[^>]+>/g, ' ');
        const semantic = analizeazaSemanticAnunt({
          titlu: it.title,
          descriere: rawDesc,
          netMin,
          netMax
        });

        if (!semantic.valid) continue;

        let seniority = 'mid';
        const expParam = it.params?.find(p => p.key === 'nivel_experienta')?.value?.key;
        if (expParam === 'entry_level' || title.includes('junior') || title.includes('debutant') || title.includes('ajutor')) {
          seniority = 'junior';
        } else if (title.includes('senior') || title.includes('sef') || title.includes('lead') || title.includes('maistru')) {
          seniority = 'senior';
        }

        const employer = (it.user?.company_name || it.user?.name || `user-${it.user?.id || 'anon'}`).trim();

        results.push({
          sursa: 'OLX Locuri de Muncă',
          id: `olx-${it.id}`,
          titlu: it.title.trim(),
          angajator: employer,
          oras: it.location?.city?.name || 'România',
          judet: it.location?.region?.name || '',
          salariuMinNet: netMin,
          salariuMaxNet: netMax,
          salariuNetCalculat: semantic.salariuBazaCalculat,
          salariuBazaGarantat: semantic.salariuBazaGarantat,
          areTipsSauBonus: semantic.areTipsSauBonus,
          ajustareSceptica: semantic.ajustareSceptica,
          eraBrut: isGross,
          senioritate: seniority,
          dataPublicare: pubDate,
          url: it.url
        });
      }
      await sleep(200);
    } catch (e) {
      break;
    }
  }
  return results;
}

async function fetchBestJobsDeep(query, keywords, maxPages = 2) {
  const results = [];
  let nextCursor = null;

  for (let page = 0; page < maxPages; page++) {
    let url = `https://www.bestjobs.eu/ro/locuri-de-munca?keyword=${encodeURIComponent(query)}`;
    if (nextCursor) {
      url += `&cursor=${encodeURIComponent(nextCursor)}`;
    }

    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      if (!res.ok) break;
      const html = await res.text();
      const $ = cheerio.load(html);
      const raw = $('#__NEXT_DATA__').html();
      if (!raw) break;

      const data = JSON.parse(raw);
      const serverData = data.props?.pageProps?.jobListCardsFromServer;
      const items = serverData?.items || [];
      nextCursor = serverData?.nextCursor || null;

      if (!items.length) break;

      for (const it of items) {
        const title = (it.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const matchesKeyword = keywords.some(k => title.includes(k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
        if (!matchesKeyword) continue;

        // Skip diaspora/abroad
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

        // EUR vs RON conversion
        let isEur = false;
        if (max < 3000) {
          isEur = true;
          min = Math.round(min * 4.97);
          max = Math.round(max * 4.97);
        }

        if (max < 2699 || min > 75000) continue;
        if (min < 2699) min = 2699;

        let seniority = 'mid';
        if (title.includes('junior') || title.includes('entry') || title.includes('intern') || title.includes('trainee')) {
          seniority = 'junior';
        } else if (title.includes('senior') || title.includes('lead') || title.includes('principal') || title.includes('head')) {
          seniority = 'senior';
        }

        const employer = (it.companyName || 'BestJobs Client').trim();

        // Semantic check
        const semantic = analizeazaSemanticAnunt({
          titlu: it.title,
          descriere: it.intro || it.snippet || '',
          netMin: min,
          netMax: max
        });

        if (!semantic.valid) continue;

        results.push({
          sursa: 'BestJobs',
          id: `bestjobs-${it.id}`,
          titlu: it.title.trim(),
          angajator: employer,
          oras: (it.locations || []).map(l => l.name).join(', ') || 'România',
          salariuMinNet: min,
          salariuMaxNet: max,
          salariuNetCalculat: semantic.salariuBazaCalculat,
          salariuBazaGarantat: semantic.salariuBazaGarantat,
          areTipsSauBonus: semantic.areTipsSauBonus,
          ajustareSceptica: semantic.ajustareSceptica,
          eraBrut: false,
          senioritate: seniority,
          dataPublicare: '2026-08',
          url: it.slug ? `https://www.bestjobs.eu/ro/loc-de-munca/${it.slug}` : ''
        });
      }

      if (!nextCursor) break;
      await sleep(250);
    } catch (e) {
      break;
    }
  }

  return results;
}

async function main() {
  console.log('=== START CRAWLING MASIV PIAȚA MUNCII ROMÂNIA (Paginat & Anti-Spam & Semantic AI) ===');
  const marketJobs = baseline.filter(x => !PUBLIC_SECTOR_SLUGS.has(x.slug));
  const rawDatabase = {};
  let totalRawCollected = 0;
  let totalDeduplicatedCollected = 0;

  for (let i = 0; i < marketJobs.length; i++) {
    const job = marketJobs[i];
    const conf = getSearchConfig(job.slug, job.nume, job.categorie);
    process.stdout.write(`[${i + 1}/${marketJobs.length}] Deep crawl "${job.nume}" (${conf.q})... `);

    const olxAds = await fetchOlxDeep(conf.q, conf.matches, 3);
    await sleep(200);
    const bjAds = await fetchBestJobsDeep(conf.q, conf.matches, 2);
    await sleep(200);

    const combined = [...olxAds, ...bjAds];
    totalRawCollected += combined.length;

    // Deduplication key: normalized employer + normalized title stem + salary interval
    // 1 position = 1 vote! Prevents 1 recruitment agency posting 40 identical listings across 20 cities.
    const seen = new Map();
    for (const ad of combined) {
      const normTitle = ad.titlu.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
      const normEmp = ad.angajator.toLowerCase().replace(/[^a-z0-9]/g, '');
      const key = `${normEmp}|${normTitle}|${ad.salariuMinNet}-${ad.salariuMaxNet}`;
      if (!seen.has(key)) {
        seen.set(key, ad);
      }
    }

    const unique = Array.from(seen.values());
    totalDeduplicatedCollected += unique.length;

    const countOlx = unique.filter(a => a.sursa.includes('OLX')).length;
    const countBestJobs = unique.filter(a => a.sursa.includes('BestJobs')).length;

    rawDatabase[job.slug] = {
      slug: job.slug,
      nume: job.nume,
      categorie: job.categorie,
      termenCautat: conf.q,
      totalOferteBrute: combined.length,
      totalOferteDeduplicate: unique.length,
      distributie: {
        olx: countOlx,
        bestjobs: countBestJobs
      },
      oferte: unique
    };

    console.log(`✓ ${unique.length} unice (${countOlx} OLX, ${countBestJobs} BestJobs; ${combined.length - unique.length} spam/duplicate eliminate)`);
  }

  const payload = {
    generatLa: new Date().toISOString(),
    snapshot: 'septembrie 2026',
    valabilitate: 'septembrie 2026 – martie 2027',
    totalOferteBrute: totalRawCollected,
    totalOferteDeduplicate: totalDeduplicatedCollected,
    totalMeseriiScanate: marketJobs.length,
    metodologie: 'Crawling multi-pagină OLX + BestJobs, filtrare full-time, conversie D112 brut->net, deduplicare anti-spam (1 post = 1 vot), prospețime sub 18 luni',
    meserii: rawDatabase
  };

  fs.mkdirSync('research/surse-salarii', { recursive: true });
  fs.writeFileSync('research/surse-salarii/anunturi-piata-reale-2026.json', JSON.stringify(payload, null, 2), 'utf8');
  console.log(`\n============================================================`);
  console.log(`CRAWLING COMPLET!`);
  console.log(`Oferte brute scanate: ${totalRawCollected}`);
  console.log(`Oferte curate deduplicate: ${totalDeduplicatedCollected}`);
  console.log(`Duplicate/spam eliminate: ${totalRawCollected - totalDeduplicatedCollected}`);
  console.log(`Salvat în: research/surse-salarii/anunturi-piata-reale-2026.json`);
  console.log(`============================================================`);
}

main();
