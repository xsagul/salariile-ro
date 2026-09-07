import * as cheerio from 'cheerio';
import { fetchWithRetry, sleep } from './base.mjs';
import { calculStandard } from '../../../src/lib/fiscal.ts';
import { normalizeazaOcupatie } from '../normalizer.mjs';
import { calculeazaScorIncredere } from '../confidence.mjs';
import { valideazaSiNormalizeazaObservatie } from '../schema.mjs';

const EUR_RON = 4.97;

export async function extrageObservatiiEjobs(termenCautare, slugMeserie, keywords = [], maxPages = 1) {
  const observatii = [];
  const cleanTerm = termenCautare.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const urls = [
    `https://www.ejobs.ro/locuri-de-munca/${encodeURIComponent(cleanTerm)}/`
  ];

  for (const url of urls) {
    try {
      const res = await fetchWithRetry(url, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        }
      });

      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      $('.job-card-content-middle__salary').each((_, salaryEl) => {
        const salText = $(salaryEl).text().trim();
        if (!salText || !/\d/.test(salText)) return;

        const parent = $(salaryEl).closest('.job-card-content-middle');
        if (!parent.length) return;

        const titleEl = parent.find('.job-card-content-middle__title a').first();
        const rawTitle = titleEl.text().trim();
        if (!rawTitle) return;

        const titleClean = rawTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const matchesKeyword = keywords.length === 0 || keywords.some(k => titleClean.includes(k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
        if (!matchesKeyword) return;

        const company = parent.find('.job-card-content-middle__info a').first().text().trim() ||
                        parent.find('.job-card-content-middle__info--darker').text().trim() ||
                        'Companie eJobs';

        const locationText = parent.find('.job-card-content-middle__info').not('.job-card-content-middle__info--darker').text().trim() || 'România';

        const isEur = /eur|euro|€/i.test(salText);
        const isBrut = /brut/i.test(salText);

        const numbers = salText.match(/\d+[\.\s]?\d*/g);
        if (!numbers || !numbers.length) return;

        const cleanNums = numbers.map(n => parseInt(n.replace(/[\.\s]/g, ''), 10)).filter(n => !isNaN(n) && n > 0);
        if (!cleanNums.length) return;

        let min = cleanNums[0];
        let max = cleanNums.length > 1 ? cleanNums[1] : cleanNums[0];
        if (min > max) [min, max] = [max, min];

        if (isEur) {
          min = Math.round(min * EUR_RON);
          max = Math.round(max * EUR_RON);
        }

        let netMin = min;
        let netMax = max;
        if (isBrut) {
          netMin = calculStandard(min).net;
          netMax = calculStandard(max).net;
        }

        if (netMax < 2699 || netMin > 75000) return;
        if (netMin < 2699) netMin = 2699;

        const norm = normalizeazaOcupatie(rawTitle, '', slugMeserie);
        const relHref = titleEl.attr('href') || '';
        const fullUrl = relHref.startsWith('http') ? relHref : `https://www.ejobs.ro${relHref}`;

        const city = locationText.split(',')[0]?.trim() || 'România';

        const obsCandidate = {
          job_title_raw: rawTitle,
          ocupatie_normalizata: norm.ocupatie_normalizata,
          nume_ocupatie: norm.nume_ocupatie,
          cor_probabil: norm.cor_probabil,
          judet: city,
          oras: locationText,
          salariu_min: netMin,
          salariu_max: netMax,
          salariu_calculat: Math.round((netMin + netMax) / 2),
          salariu_baza_garantat: netMin,
          net_brut: isBrut ? 'brut' : 'net',
          lunar_orar: 'lunar',
          experienta: norm.experienta,
          tip_contract: 'full-time',
          angajator_raw: company,
          angajator_normalizat: company.toLowerCase().replace(/[^a-z0-9]/g, ''),
          sursa: 'ejobs',
          surse_confirmate: ['ejobs'],
          url: fullUrl,
          data_publicarii: '2026-08',
          data_crawlului: new Date().toISOString(),
          scepticism_bonus: {
            areTips: false,
            areBonusuri: false,
            ajustareAplicata: 'standard'
          }
        };

        const scor = calculeazaScorIncredere(obsCandidate);
        if (!scor.esteAcceptabila) return;

        obsCandidate.confidence_score = scor.confidence_score;
        obsCandidate.confidence_reasons = scor.confidence_reasons;

        observatii.push(valideazaSiNormalizeazaObservatie(obsCandidate));
      });

      await sleep(350);
    } catch (err) {
      // Ignorăm erorile punctuale de rețea
    }
  }

  return observatii;
}
