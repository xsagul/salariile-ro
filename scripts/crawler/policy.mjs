// Operational publication gates, not a claim of population representativeness.
export const POLICY = Object.freeze({ version: 4, snapshotWindowDays: 7, maxAdAgeDays: 548, minAds: 30, minEmployers: 10, minCounties: 5, minSources: 2, maxEmployerShare: 0.2, maxSourceShare: 0.8, minExplicitMonthly:10, maxSensitivity:0.15 });
export const normalizeText = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9+#]+/g, ' ').trim();
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
/** Levenshtein distance, capped: returns max+1 as soon as the bound is exceeded. */
export function editDistance(a, b, max = 2) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (row[j] < best) best = row[j];
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}
