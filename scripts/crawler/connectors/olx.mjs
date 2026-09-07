import { fetchWithRetry, sleep } from './base.mjs';
import { calculStandard } from '../../../src/lib/fiscal.ts';
import { normalizeazaOcupatie } from '../normalizer.mjs';
import { calculeazaScorIncredere } from '../confidence.mjs';
import { valideazaSiNormalizeazaObservatie } from '../schema.mjs';

const FRESHNESS_THRESHOLD = new Date('2025-03-01').getTime();

function analizeazaSemanticOlx(titlu, descriere, netMin, netMax) {
  const textCurat = (titlu + ' ' + (descriere || '')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Excludere străinătate
  const termeniStrainatate = ['germania', 'olanda', 'netherlands', 'belgia', 'anglia', 'austria', 'spania', 'franta', 'diurna externa', 'contract strainatate', 'plecari germania', 'munca in afara'];
  for (const t of termeniStrainatate) {
    if (textCurat.includes(t)) {
      return { valid: false, motiv: `Detectat job în străinătate (${t})` };
    }
  }

  // 2. Excludere spam / MLM / videochat
  const termeniDubiosi = ['lucru de acasa 500', 'bani din telefon', 'fara experienta castiguri uriase', 'videochat', 'model online', 'operator chat', 'ambalat pixuri', 'plafar acasa', 'castiga zilnic mii'];
  for (const t of termeniDubiosi) {
    if (textCurat.includes(t)) {
      return { valid: false, motiv: `Detectat anunț spam/dubios (${t})` };
    }
  }

  // 3. Scepticism sănătos pe bacșiș & bonusuri
  const areTips = /bac[sș]i[sș]|tips/.test(textCurat);
  const areBonusuri = /bonus|comision|comisioane|performan[tț][aă]|tinte de v[aâ]nz[aă]ri|comenzi livrate/.test(textCurat);
  let salariuBazaCalculat = Math.round((netMin + netMax) / 2);
  let ajustareSceptica = 'standard';
  let salariuBazaGarantat = netMin;

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

  if (ajustareSceptica === 'standard' && (areTips || areBonusuri)) {
    const raportEcart = netMax / netMin;
    if (raportEcart >= 1.5) {
      salariuBazaCalculat = Math.round(netMin + 0.15 * (netMax - netMin));
      ajustareSceptica = areTips ? 'temperat_sceptic_bacsis_inclus' : 'temperat_sceptic_bonus_performanta';
    } else {
      salariuBazaCalculat = Math.round((netMin + netMax) / 2);
      ajustareSceptica = 'ecart_moderat_cu_tips_bonus';
    }
  }

  return {
    valid: true,
    salariuBazaCalculat,
    salariuBazaGarantat,
    areTips,
    areBonusuri,
    ajustareSceptica
  };
}

export async function extrageObservatiiOlx(termenCautare, slugMeserie, keywords = [], maxPages = 3) {
  const observatii = [];

  for (let page = 0; page < maxPages; page++) {
    const offset = page * 50;
    const url = `https://www.olx.ro/api/v1/offers/?query=${encodeURIComponent(termenCautare)}&category_id=4&offset=${offset}&limit=50`;

    try {
      const res = await fetchWithRetry(url);
      const json = await res.json();
      const items = json.data || [];
      if (!items.length) break;

      for (const it of items) {
        // Filtru full-time
        const typeParam = it.params?.find(p => p.key === 'type')?.value?.key;
        if (typeParam === 'part-time') continue;

        const rawTitle = it.title || '';
        const titleClean = rawTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const matchesKeyword = keywords.some(k => titleClean.includes(k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
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

        const pubDate = it.created_time || it.last_refresh_time;
        const dt = pubDate ? new Date(pubDate).getTime() : 0;
        if (dt && dt < FRESHNESS_THRESHOLD) continue;

        const isGross = !!salParam.gross;
        let netMin = min;
        let netMax = max;
        if (isGross) {
          netMin = calculStandard(min).net;
          netMax = calculStandard(max).net;
        }

        if (netMax < 2699 || netMin > 75000) continue;
        if (netMin < 2699) netMin = 2699;

        const rawDesc = (it.description || '').replace(/<[^>]+>/g, ' ');
        const semantic = analizeazaSemanticOlx(rawTitle, rawDesc, netMin, netMax);
        if (!semantic.valid) continue;

        // Normalizare titlu și identificare COR
        const norm = normalizeazaOcupatie(rawTitle, rawDesc, slugMeserie);

        const employer = (it.user?.company_name || it.user?.name || `user-${it.user?.id || 'anon'}`).trim();

        const obsCandidate = {
          job_title_raw: rawTitle,
          ocupatie_normalizata: norm.ocupatie_normalizata,
          nume_ocupatie: norm.nume_ocupatie,
          cor_probabil: norm.cor_probabil,
          judet: it.location?.region?.name || 'România',
          oras: it.location?.city?.name || 'România',
          salariu_min: netMin,
          salariu_max: netMax,
          salariu_calculat: semantic.salariuBazaCalculat,
          salariu_baza_garantat: semantic.salariuBazaGarantat,
          net_brut: isGross ? 'brut' : 'net',
          lunar_orar: 'lunar',
          experienta: norm.experienta,
          tip_contract: 'full-time',
          angajator_raw: employer,
          angajator_normalizat: employer.toLowerCase().replace(/[^a-z0-9]/g, ''),
          sursa: 'olx',
          surse_confirmate: ['olx'],
          url: it.url,
          data_publicarii: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : '2026-09',
          data_crawlului: new Date().toISOString(),
          scepticism_bonus: {
            areTips: semantic.areTips,
            areBonusuri: semantic.areBonusuri,
            ajustareAplicata: semantic.ajustareSceptica
          }
        };

        const scor = calculeazaScorIncredere(obsCandidate);
        if (!scor.esteAcceptabila) continue;

        obsCandidate.confidence_score = scor.confidence_score;
        obsCandidate.confidence_reasons = scor.confidence_reasons;

        observatii.push(valideazaSiNormalizeazaObservatie(obsCandidate));
      }

      await sleep(220);
    } catch (e) {
      break;
    }
  }

  return observatii;
}
