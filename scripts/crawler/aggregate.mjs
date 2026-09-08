import { POLICY, quantile, normalizeText } from './policy.mjs';
export function deduplicate(records) {
  const out = [], urls = new Map(), fingerprints = new Map();
  for (const r of [...records].sort((a,b) => b.retrievedAt.localeCompare(a.retrievedAt))) {
    // Cross-portal matching requires the same named employer, complete title,
    // location and interval. Unknown employers are never merged across portals.
    // A trade is part of the identity: one advert hiring several trades is
    // several observations, and they must not collapse into one.
    const key = r.employerKnown ? [r.employerKey,r.slug,normalizeText(r.title),normalizeText(r.city || ''),r.min,r.max,r.basis,r.unit].join('|') : null;
    const exactContent = r.employerKey ? [r.employerKey,r.slug,r.descriptionHash,r.min,r.max].join('|') : null;
    const seenUrl = `${r.url}|${r.slug}`;
    const existing = urls.get(seenUrl) || (key && fingerprints.get(key)) || (exactContent && fingerprints.get(exactContent));
    if (existing) {
      existing.sources = [...new Set([...existing.sources,...r.sources])]; existing.sourceUrls = [...new Set([...existing.sourceUrls,...r.sourceUrls])];
      urls.set(seenUrl, existing); if (key) fingerprints.set(key,existing); if (exactContent) fingerprints.set(exactContent,existing);
    } else { const x = { ...r, sources: [...r.sources], sourceUrls: [...r.sourceUrls] }; out.push(x); urls.set(seenUrl,x); if (key) fingerprints.set(key,x); if (exactContent) fingerprints.set(exactContent,x); }
  }
  return out;
}
/** Adverts that state a net or gross basis. The rest are a separate, named cohort. */
const declared = r => r.basisDeclared !== false;
function cohort(records) {
  if (!records.length) return { n: 0, observedRange: null, midpointEstimate: null, sourceCounts: {} };
  const sourceCounts = {};
  for (const r of records) sourceCounts[r.source] = (sourceCounts[r.source] || 0) + 1;
  return { n: records.length, sourceCounts,
    observedRange: { min: Math.min(...records.map(r => r.min)), max: Math.max(...records.map(r => r.max)) },
    midpointEstimate: quantile(records.map(r => (r.min + r.max) / 2), 0.5) };
}
export function summarize(all) {
  const records = all.filter(declared), employers = new Map(), sourceCounts = {}, counties = new Set(), ads = new Set();
  const n = records.length;
  for (const r of records) {
    if (r.employerKnown) employers.set(r.employerKey,(employers.get(r.employerKey)||0)+1);
    if (r.county) counties.add(normalizeText(r.county));
    if (r.adId) ads.add(r.adId);
    // Copies on another platform are provenance, not additional independent votes.
    sourceCounts[r.source] = (sourceCounts[r.source] || 0) + 1;
  }
  const employerShare = n ? Math.max(0,...employers.values())/n : 0;
  const sourceShare = n ? Math.max(0,...Object.values(sourceCounts))/n : 0;
  const gaps = [];
  if (n < POLICY.minAds) gaps.push('too_few_ads');
  if (employers.size < POLICY.minEmployers) gaps.push('too_few_known_employers');
  if (counties.size < POLICY.minCounties) gaps.push('too_few_known_counties');
  if (Object.keys(sourceCounts).length < POLICY.minSources) gaps.push('single_source');
  if (employerShare > POLICY.maxEmployerShare) gaps.push('employer_concentration');
  if (sourceShare > POLICY.maxSourceShare) gaps.push('source_concentration');
  // Interval-censored salaries: the median itself lies between these two endpoints.
  // Never turn the midpoint of an offered range into an observed employee salary.
  // Baza scrisa langa suma este dovada mai tare decat una aflata in alta parte a anuntului.
  const basisNearAmount = records.filter(r => r.basisEvidence !== 'document').length;
  const strict = records.filter(r=>r.periodEvidence === 'explicit_monthly');
  const explicitMonthly = strict.length;
  const midpoint = rows=>quantile(rows.map(r=>(r.min+r.max)/2),0.5);
  const midpointEstimate = n ? midpoint(records) : null;
  const strictMidpoint = strict.length ? midpoint(strict) : null;
  const periodSensitivity = strictMidpoint && midpointEstimate ? Math.abs(midpointEstimate-strictMidpoint)/strictMidpoint : null;
  if (explicitMonthly < POLICY.minExplicitMonthly) gaps.push('too_few_explicit_monthly');
  if (periodSensitivity !== null && periodSensitivity > POLICY.maxSensitivity) gaps.push('pay_period_sensitivity');
  const omitSource = Object.keys(sourceCounts).map(source=>midpoint(records.filter(r=>r.source!==source))).filter(v=>v!==null);
  const sourceSensitivity = midpointEstimate && omitSource.length ? Math.max(...omitSource.map(v=>Math.abs(v-midpointEstimate)/midpointEstimate)) : null;
  if (sourceSensitivity !== null && sourceSensitivity > POLICY.maxSensitivity) gaps.push('source_sensitivity');
  const publishable = gaps.length === 0;
  return { n, ads: ads.size || n, basisNearAmount, basisFromDocument: n - basisNearAmount, employers: employers.size, counties: counties.size, sourceCounts, employerShare, sourceShare, gaps,
    explicitMonthly, assumedMonthly:n-explicitMonthly, periodSensitivity, sourceSensitivity,
    midpointEstimate:publishable ? midpointEstimate : null,
    status: publishable ? 'advertised_interval' : n ? 'insufficient' : 'no_verified_ads',
    medianBounds: publishable ? { min: quantile(records.map(r=>r.min),0.5), max: quantile(records.map(r=>r.max),0.5) } : null,
    observedRange: n ? { min: Math.min(...records.map(r=>r.min)), max: Math.max(...records.map(r=>r.max)) } : null,
    // Reported beside the headline figure, never merged into it.
    undeclaredBasis: cohort(all.filter(r => !declared(r))) };
}
