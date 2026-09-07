/**
 * Motorul de scoring de încredere pentru fiecare observație salarială individuală (0.00 – 1.00)
 */

export function calculeazaScorIncredere(obs) {
  let score = 0.50;
  const reasons = [];

  const min = obs.salariu_min;
  const max = obs.salariu_max;

  // 1. Ecart salarial (claritate și precizie)
  if (min > 0 && max > 0) {
    const raport = max / min;
    if (raport === 1.0) {
      score += 0.25;
      reasons.push('Salariu fix exact declarat (ecart 0)');
    } else if (raport <= 1.25) {
      score += 0.20;
      reasons.push(`Interval salarial foarte restrâns (${raport.toFixed(2)}x)`);
    } else if (raport <= 1.50) {
      score += 0.10;
      reasons.push(`Interval salarial rezonabil (${raport.toFixed(2)}x)`);
    } else {
      score -= 0.15;
      reasons.push(`Interval salarial larg / speculativ (${raport.toFixed(2)}x)`);
    }
  }

  // 2. Ajustare semantică pe bacșiș & bonusuri
  if (obs.scepticism_bonus?.ajustareAplicata === 'extras_salariu_fix_garantat_din_text') {
    score += 0.15;
    reasons.push('Salariu fix garantat extras din corpul anunțului');
  } else if (obs.scepticism_bonus?.ajustareAplicata?.includes('temperat_sceptic')) {
    score -= 0.10;
    reasons.push('Interval influențat de bonusuri/bacșiș variabil; temperat pe baza garantată');
  } else if (!obs.scepticism_bonus?.areTips && !obs.scepticism_bonus?.areBonusuri) {
    score += 0.05;
    reasons.push('Ofertă curată fără componente variabile speculative');
  }

  // 3. Confirmare cross-site (apariție pe 2+ platforme)
  if (Array.isArray(obs.surse_confirmate) && obs.surse_confirmate.length >= 2) {
    score += 0.15;
    reasons.push(`Validat cross-site pe ${obs.surse_confirmate.length} platforme (${obs.surse_confirmate.join(', ')})`);
  }

  // 4. Calitatea angajatorului
  const emp = (obs.angajator_raw || '').toLowerCase();
  if (emp.includes('srl') || emp.includes('sa') || emp.includes('group') || emp.includes('romania') || emp.includes('spital') || emp.includes('clinica')) {
    score += 0.05;
    reasons.push('Companie / persoană juridică identificabilă');
  } else if (emp.startsWith('user-') || emp.includes('anon')) {
    score -= 0.05;
    reasons.push('Angajator persoană fizică / profil anonim');
  }

  // 5. Senioritate clară
  if (obs.experienta && obs.experienta !== 'nespecificat') {
    score += 0.05;
    reasons.push(`Nivel de experiență specificat (${obs.experienta})`);
  }

  // Plafonare strictă între 0.10 și 1.00
  const finalScore = Math.min(1.00, Math.max(0.10, Math.round(score * 100) / 100));

  return {
    confidence_score: finalScore,
    confidence_reasons: reasons,
    esteAcceptabila: finalScore >= 0.35
  };
}
