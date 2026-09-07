import * as cheerio from 'cheerio';
import { fetchWithRetry, sleep } from './base.mjs';
import { normalizeazaOcupatie } from '../normalizer.mjs';
import { calculeazaScorIncredere } from '../confidence.mjs';
import { valideazaSiNormalizeazaObservatie } from '../schema.mjs';

export async function extrageObservatiiBestJobs(termenCautare, slugMeserie, keywords = [], maxPages = 2) {
  const observatii = [];
  let nextCursor = null;

  for (let page = 0; page < maxPages; page++) {
    let url = `https://www.bestjobs.eu/ro/locuri-de-munca?keyword=${encodeURIComponent(termenCautare)}`;
    if (nextCursor) {
      url += `&cursor=${encodeURIComponent(nextCursor)}`;
    }

    try {
      const res = await fetchWithRetry(url);
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
        const rawTitle = it.title || '';
        const titleClean = rawTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const matchesKeyword = keywords.some(k => titleClean.includes(k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
        if (!matchesKeyword) continue;

        // Skip diaspora
        const locNames = (it.locations || []).map(l => (l.name || '').toLowerCase()).join(' ');
        if (locNames.includes('olanda') || locNames.includes('netherlands') || locNames.includes('germania') || locNames.includes('belgia') || locNames.includes('strainatate')) {
          continue;
        }

        const salStr = it.salary;
        if (!salStr || typeof salStr !== 'string') continue;

        const parts = salStr.split('-').map(s => Number(s.replace(/[^0-9]/g, ''))).filter(n => !isNaN(n) && n > 0);
        if (!parts.length) continue;

        let min = parts[0];
        let max = parts[1] || parts[0];

        // Conversie EUR / RON
        let isEur = false;
        if (max < 3000) {
          isEur = true;
          min = Math.round(min * 4.97);
          max = Math.round(max * 4.97);
        }

        if (max < 2699 || min > 75000) continue;
        if (min < 2699) min = 2699;

        const norm = normalizeazaOcupatie(rawTitle, it.intro || it.snippet || '', slugMeserie);
        const employer = (it.companyName || 'BestJobs Client').trim();
        const city = (it.locations || []).map(l => l.name).join(', ') || 'România';

        const obsCandidate = {
          job_title_raw: rawTitle,
          ocupatie_normalizata: norm.ocupatie_normalizata,
          nume_ocupatie: norm.nume_ocupatie,
          cor_probabil: norm.cor_probabil,
          judet: city.split(',')[0]?.trim() || 'România',
          oras: city,
          salariu_min: min,
          salariu_max: max,
          salariu_calculat: Math.round((min + max) / 2),
          salariu_baza_garantat: min,
          net_brut: 'net',
          lunar_orar: 'lunar',
          experienta: norm.experienta,
          tip_contract: 'full-time',
          angajator_raw: employer,
          angajator_normalizat: employer.toLowerCase().replace(/[^a-z0-9]/g, ''),
          sursa: 'bestjobs',
          surse_confirmate: ['bestjobs'],
          url: it.slug ? `https://www.bestjobs.eu/ro/loc-de-munca/${it.slug}` : '',
          data_publicarii: '2026-08',
          data_crawlului: new Date().toISOString(),
          scepticism_bonus: {
            areTips: false,
            areBonusuri: false,
            ajustareAplicata: 'standard'
          }
        };

        const scor = calculeazaScorIncredere(obsCandidate);
        if (!scor.esteAcceptabila) continue;

        obsCandidate.confidence_score = scor.confidence_score;
        obsCandidate.confidence_reasons = scor.confidence_reasons;

        observatii.push(valideazaSiNormalizeazaObservatie(obsCandidate));
      }

      if (!nextCursor) break;
      await sleep(250);
    } catch (e) {
      break;
    }
  }

  return observatii;
}
