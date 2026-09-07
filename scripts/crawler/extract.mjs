import * as cheerio from 'cheerio';
import { classifyTitle } from './occupations.mjs';
import { POLICY, normalizeText, canonicalUrl } from './policy.mjs';
import { hash } from './http.mjs';
import { calculStandard } from '../../src/lib/fiscal.ts';
export const plain = html => {
  const $ = cheerio.load(html || '');
  $('br').replaceWith('\n');
  $('p,li,div,h1,h2,h3,h4,tr').append('\n');
  return $.text().replace(/[^\S\n]+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
};
export function olxState(html) {
  const m = html.match(/window\.__PRERENDERED_STATE__\s*=\s*("(?:\\.|[^"\\])*")/);
  return m ? JSON.parse(JSON.parse(m[1])) : null;
}
export function structuredJobs($) {
  const out = [];
  function visit(x) { if (!x || typeof x !== 'object') return; if (x['@type'] === 'JobPosting') out.push(x); else if (Array.isArray(x)) x.forEach(visit); else Object.values(x).forEach(visit); }
  $('script[type="application/ld+json"]').each((_, e) => {
    let text = $(e).text();
    // Some publishers place literal newlines inside JSON strings. Repair only controls inside strings.
    let quoted = false, escaped = false, fixed = '';
    for (const ch of text) { if (ch === '"' && !escaped) quoted = !quoted; fixed += quoted && ch === '\n' ? '\\n' : quoted && ch === '\r' ? '\\r' : quoted && ch === '\t' ? '\\t' : ch; escaped = ch === '\\' && !escaped; }
    try { visit(JSON.parse(fixed)); } catch { /* fail closed if invalid schema */ }
  });
  return out;
}
export function olxRecord(it) {
  return { title: it.title, description: plain(it.description), url: it.url, employer: it.user?.company_name || it.employer?.companyName || (it.isBusiness ? it.user?.name : null),
    employerId: it.user?.id ? `olx:${it.user.id}` : null, city: it.location?.cityName || it.location?.city?.name, county: it.location?.regionName || it.location?.region?.name,
    country: (it.location?.regionName || it.location?.region?.name) ? 'RO' : null, date: it.createdTime || it.createdAt, expires: it.validToTime || it.validTo,
    active: it.isActive ?? it.status === 'active', contract: it.params?.find(p => p.key === 'type')?.normalizedValue || it.params?.find(p => p.key === 'type')?.value?.key,
    salary: it.salary, source: 'olx' };
}
export function detailRecord(page, source) {
  const $ = cheerio.load(page.html);
  if (source === 'anuntul') {
    const title = $('h2.text-blue700').first().text().trim(); if (!title) return null;
    const main = $('h2.text-blue700').closest('.col-lg-9');
    const description = main.children('.mt-2').first().text().trim();
    const county = page.html.match(/'dlvJudet':\s*"([^"]+)"/)?.[1];
    const city = page.html.match(/'dlvLocalitate':\s*"([^"]+)"/)?.[1];
    const updated = main.text().match(/Actualizat\s+(\d{1,2})\s+(\S+)\s+'(\d{2})/);
    const months = ['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
    const month = updated ? months.indexOf(normalizeText(updated[2])) + 1 : 0;
    const date = month ? `20${updated[3]}-${String(month).padStart(2,'0')}-${updated[1].padStart(2,'0')}` : null;
    return { title, description, url: page.url, source, employer: null, county, city, country: county ? 'RO' : null,
      contract: /'dlvSubrubrica':\s*"oferte-full-time"/.test(page.html) ? 'full-time' : null,
      date, dateKind: 'updated', salaryText: main.find('.text-red-at.fs-2').first().text().trim() };
  }
  if (source === 'olx') { const it = olxState(page.html)?.jobAd?.job; return it ? olxRecord(it) : null; }
  if (source === 'bestjobs') {
    const text = $('#__NEXT_DATA__').text(); if (!text) return null;
    const j = JSON.parse(text).props?.pageProps?.job; if (!j) return null;
    return { title: j.title, description: plain(j.description), url: page.url, source, employer: j.employer?.employerName,
      employerId: j.employer?.employerId ? `bestjobs:${j.employer.employerId}` : null,
      city: j.locations?.map(l => l.name).join('; '), country: j.seoIsAbroad === false ? 'RO' : null,
      contract: j.employmentTypes?.length === 1 ? j.employmentTypes[0] : null, active: j.active,
      date: j.datePosted || null, salaryText: j.salaryConfidential ? '' : j.salary, salary: null };
  }
  const jobs = structuredJobs($); if (jobs.length !== 1) return null;
  const j = jobs[0], locations = [j.jobLocation].flat().filter(Boolean).map(l => l.address || {});
  const salaryText = source === 'ejobs' ? $('.jobs-show-main-summaries__summary-value').toArray().map(e => $(e).text()).find(s => /RON|EUR/.test(s)) : '';
  return { title: plain(j.title), description: plain(j.description), url: page.url, source, employer: j.hiringOrganization?.name,
    employerId: j.hiringOrganization?.sameAs || null,
    city: locations.map(l => l.addressLocality).join('; '), county: locations.length === 1 ? locations[0].addressRegion : null,
    country: locations.length && locations.every(l => ['RO','Romania','România'].includes(l.addressCountry?.name || l.addressCountry)) ? 'RO' : null,
    contract: [j.employmentType].flat().length === 1 ? [j.employmentType].flat()[0] : null, date: j.datePosted, expires: j.validThrough,
    salaryText, salary: j.baseSalary ? { from: j.baseSalary.value?.minValue || j.baseSalary.value?.value, to: j.baseSalary.value?.maxValue || j.baseSalary.value?.value, currencyCode: j.baseSalary.currency, period: j.baseSalary.value?.unitText } : null };
}
const amount = '(?:\\d{1,3}(?:[ .]\\d{3})+|\\d{3,6})';
const salaryPattern = new RegExp(`(${amount})(?:\\s*(?:[-–—]|si|și)\\s*(${amount}))?\\s*(lei|ron|eur|euro|€)`, 'gi');
const number = s => Number(s.replace(/[ .]/g, ''));
export function extractSalary(r) {
  // Local salary evidence only; benefits elsewhere do not become salary.
  const segments = (r.description || '').split(/[\n;!]/).flatMap(s => s.match(/[^.]+(?:\.(?=\d{3})[^.]+)*/g) || []);
  const candidates = [];
  for (const segment of segments) {
    for (const m of segment.matchAll(salaryPattern)) {
      const before = segment.slice(Math.max(0, m.index - 70), m.index);
      const after = segment.slice(m.index + m[0].length, m.index + m[0].length + 45);
      const context = before + m[0] + after.split(/\+|\bplus\b|\bsi bonuri\b|\bși bonuri\b/i)[0];
      if (!m[2] && /\b(de la|incepe|porneste|pana la|maximum|minim)\b/.test(normalizeText(context))) continue;
      if (!/salariu|salarial|remunerat/i.test(context)) continue;
      if (/tichet|bilet|concediu|recomand|prima|prime|bonus/i.test(normalizeText(before)) || /pachet|include|inclusiv|total/i.test(normalizeText(context))) continue;
      const basis = /\bnet\b/i.test(context) ? 'net' : /\bbrut\b/i.test(context) ? 'brut' : null;
      candidates.push({ min: number(m[1]), max: number(m[2] || m[1]), basis, currency: /lei|ron/i.test(m[3]) ? 'RON' : 'EUR', snippet: context.trim(), monthly: /(?:pe\s+|\/)?lun[aă]|lunar/i.test(context), explicitFixed: /fix|baza|garantat/i.test(normalizeText(context)) });
    }
  }
  if (r.salaryText && /\bRON\b|\bEUR\b|€|euro/i.test(r.salaryText)) {
    const nums = r.salaryText.match(new RegExp(amount,'g'));
    if (nums?.length && nums.length <= 2) candidates.unshift({ min: number(nums[0]), max: number(nums[1] || nums[0]), basis: /\bnet\b/i.test(r.salaryText) ? 'net' : /\bbrut\b/i.test(r.salaryText) ? 'brut' : null, currency: /\bRON\b/i.test(r.salaryText) ? 'RON' : 'EUR', snippet: r.salaryText, monthly: /lun[aă]/i.test(r.salaryText) || r.source === 'ejobs', explicitFixed: false });
  }
  const s = r.salary;
  if (s && ['RON','EUR'].includes(s.currencyCode) && Number(s.from) > 0 && Number(s.to) > 0) {
    const matching = candidates.filter(c => c.min === Number(s.from) && c.max === Number(s.to) && c.basis && c.currency === s.currencyCode);
    // Structured interval plus matching explicit net/brut evidence in the description.
    if (matching.length) return { ...matching[0], monthly: matching[0].monthly || normalizeText(s.period || '') === 'month' || r.source === 'ejobs' };
  }
  const known = candidates.filter(c => c.basis);
  const distinct = [...new Set(known.map(c => `${c.min}|${c.max}|${c.basis}|${c.currency}`))];
  if (distinct.length !== 1) return null;
  const selected = known[0];
  // Incompatible structured amount/currency requires review, never a silent override.
  if (s && (s.currencyCode !== selected.currency || Number(s.from) !== selected.min || Number(s.to) !== selected.max)) return null;
  if (/\b(pe ora|ora net|net ora|pe zi|zi net|net zi|orar|zilnic|saptamanal|pe saptamana|pe an|anual)\b/.test(normalizeText(selected.snippet))) return null;
  return selected;
}
export function assess(r, evidence, now = new Date()) {
  const reasons = []; if (!r) return { accepted: false, reasons: ['unsupported_detail_schema'] };
  const classification = classifyTitle(r.title || ''); if (!classification.slug) reasons.push(classification.reason);
  if (r.country !== 'RO') reasons.push('country_unconfirmed');
  const text = normalizeText(`${r.title} ${r.description}`);
  if (/\b(germania|olanda|belgia|austria|franta|anglia|italia|spania|strainatate|comunitate|diurna|videochat|mlm)\b/.test(text)) reasons.push('foreign_or_noncomparable_work');
  if (!['full time','norma intreaga'].includes(normalizeText(r.contract || ''))) reasons.push('full_time_unconfirmed');
  if (/\b(part time|pfa|srl propriu|contract de colaborare|colaborare b2b|exclusiv pe comision|doar comision)\b/.test(text)) reasons.push('contract_or_variable_income');
  const date = Date.parse(r.date);
  if (Number.isFinite(date) && date > now.getTime()+86400000) reasons.push('future_publication_date');
  const listedAt = Date.parse(r.listedAt), retrieved = Date.parse(evidence?.retrievedAt);
  const activeEvidence = r.active === true || (r.expires && Date.parse(r.expires) >= now.getTime()) || (Number.isFinite(listedAt) && Math.abs(now.getTime()-listedAt) <= POLICY.snapshotWindowDays*86400000);
  if (!activeEvidence) reasons.push('active_status_unconfirmed');
  if (!Number.isFinite(retrieved) || Math.abs(now.getTime()-retrieved) > POLICY.snapshotWindowDays*86400000) reasons.push('snapshot_date_unconfirmed');
  if (r.active === false || (r.expires && Date.parse(r.expires) < now.getTime())) reasons.push('expired');
  const salary = extractSalary(r);
  if (!salary) reasons.push('salary_evidence_incomplete');
  else {
    if (salary.currency === 'EUR' && !(r.fx?.EURRON > 0 && r.fx?.date && r.fx?.source)) reasons.push('exchange_rate_missing');
    // Preserve a separate, explicitly labelled cohort when a full-time ad states
    // net/brut and currency but omits the pay period. Never count it as explicit monthly evidence.
    if (!salary.monthly && !['full time','norma intreaga'].includes(normalizeText(r.contract || ''))) reasons.push('monthly_unconfirmed');
    if (!(salary.min > 0 && salary.max >= salary.min && salary.max <= 100000)) reasons.push('invalid_amount');
    if (salary.max / salary.min > 2) reasons.push('wide_range_review');
    if (/\b(tips|bacsis|bonus|comision)\b/.test(normalizeText(salary.snippet)) && !salary.explicitFixed) reasons.push('base_salary_unclear');
  }
  if (!evidence?.sha256 || !evidence.evidenceFile) reasons.push('evidence_missing');
  if (reasons.length) return { accepted: false, reasons, slug: classification.slug, title: r.title, url: r.url, source: r.source };
  const url = canonicalUrl(r.url);
  const employer = r.employer && !/confidential|anonim/i.test(r.employer) ? normalizeText(r.employer) : null;
  const rate = salary.currency === 'EUR' ? r.fx.EURRON : 1;
  const net = value => salary.basis === 'brut' ? calculStandard(Math.round(value*rate)).net : Math.round(value*rate);
  return { accepted: true, observation: { id: hash(url).slice(0,24), url, source: r.source, slug: classification.slug,
    title: r.title, min: net(salary.min), max: net(salary.max), originalSalary: salary, conversion: salary.currency === 'EUR' ? r.fx : null,
    netConversion: salary.basis === 'brut' ? 'calculStandard; ipotezele standard din fiscal.ts' : null,
    basis: 'net', currency: 'RON', unit: 'month', concept: 'advertised_base',
    periodEvidence: salary.monthly ? 'explicit_monthly' : 'assumed_monthly_full_time',
    employer: r.employer || null, employerKey: employer || r.employerId || null, employerKnown: !!employer,
    city: r.city || null, county: r.county || null, publishedAt: Number.isFinite(date) ? new Date(date).toISOString().slice(0,10) : null, dateKind: r.dateKind || 'published',
    listedAt: r.listedAt || null, activityEvidence: r.active === true ? 'explicit_active_status' : r.expires ? 'valid_through' : 'current_source_inventory',
    retrievedAt: evidence.retrievedAt, salaryEvidence: salary.snippet, salaryFieldEvidence:r.salaryText || null,
    evidence: { sha256: evidence.sha256, file: evidence.evidenceFile },
    descriptionHash: hash(normalizeText(r.description)), sources: [r.source], sourceUrls: [url] } };
}
