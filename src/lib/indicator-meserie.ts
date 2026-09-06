import type { ReperMeserie } from './repere-meserii';

// Modul pur, comun catalogului, paginilor și comparatorului din browser.
export function indicatorMeserie(reper: ReperMeserie) {
  if (reper.median !== null) return { value: reper.median, metric: 'median' as const };
  if (reper.kind === 'public-grid') return { value: reper.value, metric: 'grid' as const };
  if (reper.kind === 'sector-context') return { value: reper.value, metric: 'context' as const };
  if (reper.value !== null) return { value: reper.value, metric: 'mean' as const };
  return { value: null, metric: null };
}

export function textIndicator(reper: ReperMeserie): string {
  const { value } = indicatorMeserie(reper);
  if (value === null) return 'Date insuficiente';
  const upper = reper.upper !== null && reper.upper !== value ? `–${reper.upper.toLocaleString('ro-RO')}` : '';
  return `${value.toLocaleString('ro-RO')}${upper} lei net`;
}
