import fs from 'node:fs';
import { calculStandard } from '../../../src/lib/fiscal.ts';
import { valideazaSiNormalizeazaObservatie } from '../schema.mjs';

/**
 * Conector pentru datele din sectorul public (Transparență D112 spitale, grile Legea 153/2017)
 */

export function extrageObservatiiSectorPublic() {
  const observatii = [];

  // 1. Transparență Spitalul Județean Constanța (în plată martie 2026)
  if (fs.existsSync('src/data/transparenta-constanta.json')) {
    const spital = JSON.parse(fs.readFileSync('src/data/transparenta-constanta.json', 'utf8'));
    const records = spital.records || [];

    for (const r of records) {
      if (!r.componentsMin || !r.componentsMax) continue;
      const netMin = calculStandard(r.componentsMin).net;
      const netMax = calculStandard(r.componentsMax).net;
      const netBazaMin = calculStandard(r.baseMin).net;
      const netCalculat = Math.round((netMin + netMax) / 2);

      const obs = {
        job_title_raw: `${r.roles?.join(' / ') || r.slug} (${r.rows} posturi în plată)`,
        ocupatie_normalizata: r.slug,
        nume_ocupatie: r.roles?.[0] || r.slug,
        cor_probabil: { cod: null, denumire: r.roles?.[0] || r.slug },
        judet: 'Constanța',
        oras: 'Constanța',
        salariu_min: netMin,
        salariu_max: netMax,
        salariu_calculat: netCalculat,
        salariu_baza_garantat: netBazaMin,
        net_brut: 'brut',
        lunar_orar: 'lunar',
        experienta: 'mid',
        tip_contract: 'full-time',
        angajator_raw: 'Spitalul Clinic Județean de Urgență Sf. Apostol Andrei Constanța',
        angajator_normalizat: 'scju-constanta',
        sursa: 'transparenta_d112',
        surse_confirmate: ['transparenta_d112', 'legea_153_2017'],
        url: spital.url || 'https://spitaluljudeteanconstanta.ro/transparenta-venituri-salariale/',
        data_publicarii: '2026-03-31',
        data_crawlului: new Date().toISOString(),
        scepticism_bonus: {
          areTips: false,
          areBonusuri: true, // sporuri de secție și gărzi
          ajustareAplicata: 'venit_in_plata_cu_sporuri_reale'
        },
        confidence_score: 0.98,
        confidence_reasons: [`Venit în plată certificat oficial (${r.rows} posturi D112 SCJU Constanța)`]
      };
      observatii.push(valideazaSiNormalizeazaObservatie(obs));
    }
  }

  return observatii;
}
