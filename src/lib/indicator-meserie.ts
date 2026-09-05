import type { ReperMeserie } from './repere-meserii';

// Modul pur, comun catalogului, paginilor și comparatorului din browser.
// Grilele și mediile CAEN rămân context, niciodată puncte salariale ale meseriei.
export function indicatorMeserie(reper: ReperMeserie) {
  if (reper.kind !== 'external-advertised' && reper.kind !== 'external-reported') {
    return { value: null, metric: null };
  }
  if (reper.median !== null) return { value: reper.median, metric: 'median' as const };
  if (reper.upper === null && reper.value !== null) return { value: reper.value, metric: 'mean' as const };
  return { value: null, metric: null };
}

export function textIndicator(reper: ReperMeserie): string {
  const { value } = indicatorMeserie(reper);
  return value === null ? 'Date insuficiente' : `${value.toLocaleString('ro-RO')} lei net`;
}
