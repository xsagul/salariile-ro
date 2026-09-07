// Operational publication gates, not a claim of population representativeness.
export const POLICY = Object.freeze({ version: 3, snapshotWindowDays: 7, minAds: 30, minEmployers: 10, minCounties: 5, minSources: 2, maxEmployerShare: 0.2, maxSourceShare: 0.8, minExplicitMonthly:10, maxSensitivity:0.15 });
export const normalizeText = (s = '') => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9+#]+/g, ' ').trim();
export function canonicalUrl(value) {
  const u = new URL(value);
  if (u.protocol !== 'https:') throw new Error('HTTPS required');
  u.hash = ''; u.search = '';
  return u.href;
}
export function quantile(values, p) {
  if (!values.length) return null;
  const a = [...values].sort((x, y) => x - y), i = (a.length - 1) * p, lo = Math.floor(i);
  return a[lo] + (a[Math.ceil(i)] - a[lo]) * (i - lo);
}
