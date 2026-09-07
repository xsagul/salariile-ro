import crypto from 'node:crypto';
import { calculeazaScorIncredere } from './confidence.mjs';

/**
 * Motorul de deduplicare cross-site (1 postare = 1 vot)
 */

export function genereazaAmprentaCrossSite(obs) {
  const angajatorNorm = (obs.angajator_normalizat || obs.angajator_raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);

  const titluStem = (obs.job_title_raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 18);

  const judetNorm = (obs.judet || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  const key = `${angajatorNorm}|${titluStem}|${judetNorm}|${obs.salariu_min}-${obs.salariu_max}`;
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 20);
}

export function deduplicaObservatiiCrossSite(observatiiRaw) {
  const map = new Map();
  let duplicateEliminate = 0;
  let confirmateCrossSite = 0;

  for (const obs of observatiiRaw) {
    const fingerprint = genereazaAmprentaCrossSite(obs);

    if (!map.has(fingerprint)) {
      map.set(fingerprint, { ...obs, fingerprint });
    } else {
      duplicateEliminate++;
      const existing = map.get(fingerprint);

      // Adăugăm sursa suplimentară dacă e cross-site
      const surseSet = new Set(existing.surse_confirmate || [existing.sursa]);
      if (obs.sursa && !surseSet.has(obs.sursa)) {
        surseSet.add(obs.sursa);
        confirmateCrossSite++;
      }
      existing.surse_confirmate = Array.from(surseSet);

      // Recalculăm scorul de încredere după consolidare multi-sursă
      const scorNou = calculeazaScorIncredere(existing);
      existing.confidence_score = scorNou.confidence_score;
      existing.confidence_reasons = scorNou.confidence_reasons;

      map.set(fingerprint, existing);
    }
  }

  const observatiiUnice = Array.from(map.values());

  return {
    observatiiUnice,
    totalOriginal: observatiiRaw.length,
    totalDeduplicate: observatiiUnice.length,
    duplicateEliminate,
    confirmateCrossSite
  };
}
