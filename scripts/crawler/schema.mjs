import crypto from 'node:crypto';

/**
 * Schema unică de date pentru fiecare observație salarială culeasă din piața muncii din România.
 */

export function valideazaSiNormalizeazaObservatie(input) {
  if (!input.job_title_raw || typeof input.job_title_raw !== 'string') {
    throw new Error('job_title_raw este obligatoriu');
  }
  if (!input.ocupatie_normalizata || typeof input.ocupatie_normalizata !== 'string') {
    throw new Error('ocupatie_normalizata (slug) este obligatorie');
  }

  const salariuMin = Math.round(Number(input.salariu_min) || 2699);
  const salariuMax = Math.round(Number(input.salariu_max) || salariuMin);
  const salariuCalculat = Math.round(Number(input.salariu_calculat) || Math.round((salariuMin + salariuMax) / 2));
  const salariuBazaGarantat = Math.round(Number(input.salariu_baza_garantat) || salariuMin);

  // Hash determinist pentru identificare unică
  const angajatorNorm = (input.angajator_normalizat || input.angajator_raw || 'anon')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const titluNorm = input.job_title_raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 25);
  const hashKey = `${angajatorNorm}|${titluNorm}|${input.judet || ''}|${salariuMin}-${salariuMax}`;
  const id = input.id || crypto.createHash('sha256').update(hashKey).digest('hex').slice(0, 16);

  return {
    id,
    job_title_raw: input.job_title_raw.trim(),
    ocupatie_normalizata: input.ocupatie_normalizata.trim(),
    nume_ocupatie: input.nume_ocupatie || input.ocupatie_normalizata,
    cor_probabil: {
      cod: input.cor_probabil?.cod || null,
      denumire: input.cor_probabil?.denumire || null
    },
    judet: input.judet || 'România',
    oras: input.oras || 'Național',
    salariu_min: salariuMin,
    salariu_max: salariuMax,
    salariu_calculat: salariuCalculat,
    salariu_baza_garantat: salariuBazaGarantat,
    net_brut: input.net_brut === 'brut' ? 'brut' : 'net',
    lunar_orar: input.lunar_orar === 'orar' ? 'orar' : 'lunar',
    experienta: ['junior', 'mid', 'senior'].includes(input.experienta) ? input.experienta : 'nespecificat',
    tip_contract: input.tip_contract === 'part-time' ? 'part-time' : 'full-time',
    angajator_raw: input.angajator_raw || 'Angajator confidențial',
    angajator_normalizat: angajatorNorm || 'angajator-anon',
    sursa: input.sursa || 'necunoscut',
    surse_confirmate: Array.isArray(input.surse_confirmate) && input.surse_confirmate.length > 0
      ? input.surse_confirmate
      : [input.sursa || 'necunoscut'],
    url: input.url || '',
    data_publicarii: input.data_publicarii || new Date().toISOString().slice(0, 7),
    data_crawlului: input.data_crawlului || new Date().toISOString(),
    scepticism_bonus: {
      areTips: !!input.scepticism_bonus?.areTips,
      areBonusuri: !!input.scepticism_bonus?.areBonusuri,
      ajustareAplicata: input.scepticism_bonus?.ajustareAplicata || 'standard'
    },
    confidence_score: Math.min(1.0, Math.max(0.0, Number(input.confidence_score) || 0.5)),
    confidence_reasons: Array.isArray(input.confidence_reasons) ? input.confidence_reasons : []
  };
}
