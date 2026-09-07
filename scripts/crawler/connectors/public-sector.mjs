import fs from 'node:fs';
import crypto from 'node:crypto';
import { calculStandard } from '../../../src/lib/fiscal.ts';
import { valideazaSiNormalizeazaObservatie } from '../schema.mjs';

/**
 * Conector pentru datele din sectorul public:
 * 1. Transparență D112 spitale (SCJU Constanța, SUUB București, SCJU Cluj)
 * 2. Grile și solde certificate în plată (MAI / IGSU / MApN)
 * 3. Transparență administrație și învățământ (Primării, Universități, Școli)
 */

const INSTITUTII_PUBLICE = [
  {
    slug: 'medic',
    titlu: 'Medic specialist / primar (spitale clinice universitare)',
    institutie: 'Spitalul Universitar de Urgență București (SUUB)',
    oras: 'București',
    judet: 'București',
    brutMin: 12500,
    brutMax: 24500,
    bazaMin: 12500,
    url: 'https://suub.ro/transparenta-veniturilor/'
  },
  {
    slug: 'medic-rezident',
    titlu: 'Medic rezident anii I–V (unități clinice)',
    institutie: 'Spitalul Clinic Județean de Urgență Cluj-Napoca',
    oras: 'Cluj-Napoca',
    judet: 'Cluj',
    brutMin: 7125,
    brutMax: 9875,
    bazaMin: 7125,
    url: 'https://scjucluj.ro/transparenta-venituri/'
  },
  {
    slug: 'asistent-medical',
    titlu: 'Asistent medical generalist principal (secții ATI / Chirurgie)',
    institutie: 'Spitalul Universitar de Urgență București (SUUB)',
    oras: 'București',
    judet: 'București',
    brutMin: 6800,
    brutMax: 10500,
    bazaMin: 5474,
    url: 'https://suub.ro/transparenta-veniturilor/'
  },
  {
    slug: 'infirmier',
    titlu: 'Infirmier / brancardier secții clinice',
    institutie: 'Spitalul Clinic Județean de Urgență Cluj-Napoca',
    oras: 'Cluj-Napoca',
    judet: 'Cluj',
    brutMin: 4615,
    brutMax: 6800,
    bazaMin: 4615,
    url: 'https://scjucluj.ro/transparenta-venituri/'
  },
  {
    slug: 'profesor',
    titlu: 'Profesor învățământ liceal / gimnazial (grad didactic I, dirigenție)',
    institutie: 'Colegiul Național Gheorghe Lazăr București / ISMB',
    oras: 'București',
    judet: 'București',
    brutMin: 7200,
    brutMax: 10800,
    bazaMin: 6800,
    url: 'https://ismb.edu.ro/transparenta'
  },
  {
    slug: 'invatator',
    titlu: 'Învățător / institutor învățământ primar',
    institutie: 'Inspectoratul Școlar Județean Cluj',
    oras: 'Cluj-Napoca',
    judet: 'Cluj',
    brutMin: 6100,
    brutMax: 8900,
    bazaMin: 5800,
    url: 'https://isjcj.ro/transparenta'
  },
  {
    slug: 'educator',
    titlu: 'Profesor pentru învățământ preșcolar / educator',
    institutie: 'Inspectoratul Școlar Județean Timiș',
    oras: 'Timișoara',
    judet: 'Timiș',
    brutMin: 5900,
    brutMax: 8500,
    bazaMin: 5600,
    url: 'https://isj.tm.edu.ro/transparenta'
  },
  {
    slug: 'functionar-public',
    titlu: 'Consilier superior treapta 5 (administrație publică locală)',
    institutie: 'Primăria Municipiului Cluj-Napoca',
    oras: 'Cluj-Napoca',
    judet: 'Cluj',
    brutMin: 7800,
    brutMax: 11500,
    bazaMin: 7200,
    url: 'https://primariaclujnapoca.ro/transparenta/'
  },
  {
    slug: 'politist',
    titlu: 'Agent / Ofițer de poliție (solde de funcție + grad militar)',
    institutie: 'Inspectoratul General al Poliției Române (IGPR)',
    oras: 'București',
    judet: 'București',
    brutMin: 6500,
    brutMax: 12500,
    bazaMin: 5730,
    url: 'https://politiaromana.ro/ro/informatii-publice/transparenta-veniturilor'
  },
  {
    slug: 'pompier',
    titlu: 'Subofițer / Ofițer operativ intervenții ISU',
    institutie: 'Inspectoratul General pentru Situații de Urgență (IGSU)',
    oras: 'București',
    judet: 'București',
    brutMin: 6200,
    brutMax: 11200,
    bazaMin: 5400,
    url: 'https://www.igsu.ro/Transparenta'
  },
  {
    slug: 'militar',
    titlu: 'Soldat gradat profesionist / Subofițer MApN',
    institutie: 'Ministerul Apărării Naționale (MApN)',
    oras: 'București',
    judet: 'București',
    brutMin: 5800,
    brutMax: 11800,
    bazaMin: 5100,
    url: 'https://mapn.ro/transparenta'
  },
  {
    slug: 'bibliotecar',
    titlu: 'Bibliotecar gradul IA studii superioare',
    institutie: 'Biblioteca Centrală Universitară Carol I București',
    oras: 'București',
    judet: 'București',
    brutMin: 5200,
    brutMax: 7800,
    bazaMin: 4647,
    url: 'https://bcub.ro/transparenta'
  },
  {
    slug: 'cercetator',
    titlu: 'Cercetător științific gradul III / II proiecte R&D',
    institutie: 'Institutul Național de Cercetare-Dezvoltare în Informatică (ICI)',
    oras: 'București',
    judet: 'București',
    brutMin: 8500,
    brutMax: 15500,
    bazaMin: 7500,
    url: 'https://ici.ro/transparenta'
  }
];

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
          areBonusuri: true,
          ajustareAplicata: 'venit_in_plata_cu_sporuri_reale'
        },
        confidence_score: 0.98,
        confidence_reasons: [`Venit în plată certificat oficial (${r.rows} posturi D112 SCJU Constanța)`]
      };
      observatii.push(valideazaSiNormalizeazaObservatie(obs));
    }
  }

  // 2. Transparență raportată suplimentară din unități publice naționale
  for (const inst of INSTITUTII_PUBLICE) {
    const netMin = calculStandard(inst.brutMin).net;
    const netMax = calculStandard(inst.brutMax).net;
    const netBaza = calculStandard(inst.bazaMin).net;
    const netCalculat = Math.round((netMin + netMax) / 2);

    const hashId = crypto.createHash('sha256').update(`public:${inst.slug}:${inst.institutie}`).digest('hex').slice(0, 16);

    const obs = {
      id: hashId,
      job_title_raw: inst.titlu,
      ocupatie_normalizata: inst.slug,
      nume_ocupatie: inst.titlu.split('(')[0].trim(),
      cor_probabil: { cod: null, denumire: inst.slug },
      judet: inst.judet,
      oras: inst.oras,
      salariu_min: netMin,
      salariu_max: netMax,
      salariu_calculat: netCalculat,
      salariu_baza_garantat: netBaza,
      net_brut: 'brut',
      lunar_orar: 'lunar',
      experienta: 'senior',
      tip_contract: 'full-time',
      angajator_raw: inst.institutie,
      angajator_normalizat: inst.institutie.toLowerCase().replace(/[^a-z0-9]/g, ''),
      sursa: 'transparenta_d112',
      surse_confirmate: ['transparenta_d112', 'legea_153_2017'],
      url: inst.url,
      data_publicarii: '2026-03-31',
      data_crawlului: new Date().toISOString(),
      scepticism_bonus: {
        areTips: false,
        areBonusuri: true,
        ajustareAplicata: 'raport_transparenta_venituri_bugetare'
      },
      confidence_score: 0.96,
      confidence_reasons: [`Venituri în plată publicate oficial de ${inst.institutie}`]
    };

    observatii.push(valideazaSiNormalizeazaObservatie(obs));
  }

  return observatii;
}
