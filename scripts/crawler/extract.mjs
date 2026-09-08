import * as cheerio from 'cheerio';
import { classifyTitle, classifyAll } from './occupations.mjs';
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
  // OLX stores a single declared amount as from = to - 1; that is one figure, not a range.
  const s = it.salary && Number(it.salary.from) > 0
    ? { ...it.salary, to: Number(it.salary.to) - Number(it.salary.from) === 1 ? Number(it.salary.from) : it.salary.to }
    : it.salary;
  return { title: it.title, description: plain(it.description), url: it.url, employer: it.user?.company_name || it.employer?.companyName || (it.isBusiness ? it.user?.name : null),
    employerId: it.user?.id ? `olx:${it.user.id}` : null, city: it.location?.cityName || it.location?.city?.name, county: it.location?.regionName || it.location?.region?.name,
    country: (it.location?.regionName || it.location?.region?.name) ? 'RO' : null, date: it.createdTime || it.createdAt, expires: it.validToTime || it.validTo,
    active: it.isActive ?? it.status === 'active', contract: it.params?.find(p => p.key === 'type')?.normalizedValue || it.params?.find(p => p.key === 'type')?.value?.key,
    salary: s, source: 'olx' };
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
    // Some publishers put the country code in addressRegion and omit addressCountry.
    country: locations.length && locations.every(l => ['RO','Romania','România'].includes(l.addressCountry?.name || l.addressCountry) || l.addressRegion === 'RO') ? 'RO' : null,
    contract: [j.employmentType].flat().length === 1 ? [j.employmentType].flat()[0] : null, date: j.datePosted, expires: j.validThrough,
    salaryText, salary: j.baseSalary ? { from: j.baseSalary.value?.minValue || j.baseSalary.value?.value, to: j.baseSalary.value?.maxValue || j.baseSalary.value?.value, currencyCode: j.baseSalary.currency, period: j.baseSalary.value?.unitText } : null };
}
const amount = '(?:\\d{1,3}(?:[ .]\\d{3})+|\\d{3,6})';
const salaryPattern = new RegExp(`(${amount})(?:\\s*(?:[-–—]|si|și|la)\\s*(${amount}))?\\s*(lei|ron|eur|euro|€)`, 'gi');
const number = s => Number(s.replace(/[ .]/g, ''));
// An advert names pay in many ways. "In mana" and "in cont" are the everyday
// Romanian for take-home pay and count as an explicit net basis.
const STRONG_PAY = /salari|remunerat|salariz|leafa|in mana|pe mana|in cont/;
const WEAK_PAY = /venit|castig|plata|platim|oferim|se ofera|se acorda/;
// Formele flexionate sunt curente in anunturi: „salariul net", „salarii nete", „plata neta".
const NET_WORDS = /\bnet(a|e|ul|ului|ele|elor)?\b|in mana|pe mana|in cont/;
const BENEFIT_BEFORE = /tichet|bilet|bon |bonuri|bonus|prima|prime|premi|bacsis|tips|comision|diurna|spor|cazare|transport|abonament|asigurare|concediu|recomand|vechime/;
const PACKAGE_CONTEXT = /pachet|include|inclusiv|total/;
const NON_MONTHLY = /\b(pe ora|ora net|net ora|pe zi|zi net|net zi|orar|zilnic|saptamanal|pe saptamana|pe an|anual)\b/;
const OPEN_ENDED = /\b(de la|incepe|porneste|pana la|maximum|minim)\b/;
const GROSS_WORDS = /\bbrut(a|e|ul|ului|ele|elor)?\b/;
/** The qualifier nearest the figure wins: "brut 5000 lei ... net 2981" is gross then net. */
function nearestBasis(before, after) {
  const b = normalizeText(before), a = normalizeText(after);
  const back = re => { let last = -1; for (const m of b.matchAll(new RegExp(re.source, 'g'))) last = m.index + m[0].length; return last < 0 ? Infinity : b.length - last; };
  const forward = re => { const m = a.match(re); return m ? m.index : Infinity; };
  const scores = [['net', Math.min(back(NET_WORDS), forward(NET_WORDS))], ['brut', Math.min(back(GROSS_WORDS), forward(GROSS_WORDS))]];
  const [name, distance] = scores.sort((x, y) => x[1] - y[1])[0];
  return Number.isFinite(distance) ? name : null;
}

/** Every distinct pay figure the advert states, with the evidence around it. */
export function extractSalaryCandidates(r) {
  const title = r.title || '', description = r.description || '';
  const document = normalizeText(`${title} ${description}`);
  const packaged = /pachet salarial|pachet de beneficii|pachet complet/.test(document);
  // Titles carry the figure often enough that skipping them loses real adverts.
  const segments = [title, ...description.split(/[\n;!]/).flatMap(s => s.match(/[^.]+(?:\.(?=\d{3})[^.]+)*/g) || [])];
  const candidates = [], excluded = [];
  for (const segment of segments) {
    const found = [...segment.matchAll(salaryPattern)];
    let payInSegment = false;
    for (const [i, m] of found.entries()) {
      const end = m.index + m[0].length;
      // Context stops at the neighbouring figure, so "brut ... net" stays two figures.
      const start = Math.max(0, i ? found[i - 1].index + found[i - 1][0].length : 0, m.index - 70);
      const before = segment.slice(start, m.index);
      const after = segment.slice(end, Math.min(i + 1 < found.length ? found[i + 1].index : segment.length, end + 45));
      const context = before + m[0] + after.split(/\+|\bplus\b|\bsi bonuri\b|\bși bonuri\b/i)[0];
      const flat = normalizeText(context), flatBefore = normalizeText(before);
      const drop = reason => excluded.push({ min: number(m[1]), max: number(m[2] || m[1]), currency: /lei|ron/i.test(m[3]) ? 'RON' : 'EUR', reason });
      if (!m[2] && OPEN_ENDED.test(flat)) { drop('open_ended'); continue; }
      const strong = STRONG_PAY.test(flat);
      // "Salariu brut X, adica net Y": the second figure inherits the pay framing of
      // the sentence, but only when it carries a basis word of its own.
      const inherits = payInSegment && (NET_WORDS.test(flat) || GROSS_WORDS.test(flat));
      if (!strong && !inherits && !WEAK_PAY.test(flat)) { drop('not_pay_context'); continue; }
      // A package framing turns a bare "venit" figure into the package, not the base pay.
      if (packaged && !strong && !inherits) { drop('package_framing'); continue; }
      if (BENEFIT_BEFORE.test(flatBefore) || PACKAGE_CONTEXT.test(flat)) { drop('benefit_or_package'); continue; }
      if (NON_MONTHLY.test(flat)) { drop('non_monthly_unit'); continue; }
      const localBasis = nearestBasis(before, after);
      candidates.push({ min: number(m[1]), max: number(m[2] || m[1]),
        basis: localBasis, basisEvidence: localBasis ? 'local' : null,
        currency: /lei|ron/i.test(m[3]) ? 'RON' : 'EUR', snippet: context.trim(),
        monthly: /lunar|pe luna|\/ ?luna|\bluna\b/.test(flat), explicitFixed: /fix|baza|garantat/.test(flat),
        roleSlugs: classifyAll(segment).slugs, evidenceKind: 'description_text' });
      payInSegment = true;
    }
  }
  if (r.salaryText && /\bRON\b|\bEUR\b|€|euro/i.test(r.salaryText)) {
    const nums = r.salaryText.match(new RegExp(amount, 'g'));
    const flat = normalizeText(r.salaryText);
    if (nums?.length && nums.length <= 2 && !NON_MONTHLY.test(flat)) candidates.unshift({ min: number(nums[0]), max: number(nums[1] || nums[0]),
      basis: NET_WORDS.test(flat) ? 'net' : GROSS_WORDS.test(flat) ? 'brut' : null,
      currency: /\bRON\b/i.test(r.salaryText) ? 'RON' : 'EUR', snippet: r.salaryText,
      // Unele portaluri eticheteaza toate sumele la fel, din propriul model de date.
      // eJobs afiseaza „net" pe fiecare anunt — masurat 196 din 196, niciodata „brut" —
      // iar payload-ul paginii nu contine nicio cheie de baza. Este o conventie a
      // platformei, nu o declaratie a angajatorului, si se numara separat.
      basisEvidence: r.source === 'ejobs' ? 'platform' : NET_WORDS.test(flat) || GROSS_WORDS.test(flat) ? 'local' : null,
      monthly: /lun[aă]/i.test(r.salaryText) || r.source === 'ejobs', explicitFixed: false,
      roleSlugs: [], evidenceKind: 'salary_field' });
  }
  // Figures the wording rules out. A portal field must never resurrect them.
  candidates.excluded = excluded;
  return candidates;
}
/**
 * Cand suma nu are calificativ langa ea, dar anuntul spune o singura data „net”
 * sau o singura data „brut”, aceea este baza declarata a anuntului. Este dovada
 * din text, nu o presupunere: daca apar amandoua, ramane nedeclarata.
 */
function documentBasis(text) {
  const net = NET_WORDS.test(text), gross = GROSS_WORDS.test(text);
  return net && !gross ? 'net' : gross && !net ? 'brut' : null;
}
/** Two figures for one job when the net is the standard conversion of the gross. */
function grossNetPair(a, b) {
  const gross = a.basis === 'brut' ? a : b, net = a.basis === 'net' ? a : b;
  if (gross.basis !== 'brut' || net.basis !== 'net' || gross.currency !== net.currency) return null;
  const converted = calculStandard(gross.min)?.net;
  if (!(converted > 0) || Math.abs(converted - net.min) / net.min > 0.03) return null;
  return { ...net, pairedGross: { min: gross.min, max: gross.max }, snippet: `${net.snippet} · ${gross.snippet}` };
}
const key = c => `${c.min}|${c.max}|${c.basis}|${c.currency}`;
/**
 * One figure for the advert, or a reason it cannot be reduced to one.
 * The structured pay field of a portal is primary evidence, not merely a veto.
 */
export function resolveSalary(r, candidates = extractSalaryCandidates(r)) {
  const s = r.salary;
  const wholeAd = normalizeText(`${r.title || ''} ${r.description || ''} ${r.salaryText || ''}`);
  const fallback = documentBasis(wholeAd);
  if (fallback) for (const c of candidates) if (!c.basis) { c.basis = fallback; c.basisEvidence = 'document'; }
  const structured = s && ['RON','EUR'].includes(s.currencyCode) && Number(s.from) > 0 && Number(s.to) >= Number(s.from)
    ? { min: Number(s.from), max: Number(s.to), currency: s.currencyCode, period: normalizeText(s.period || '') } : null;
  const document = normalizeText(`${r.title || ''} ${r.description || ''}`);
  if (structured) {
    const matching = candidates.filter(c => c.min === structured.min && c.max === structured.max && c.currency === structured.currency);
    if (matching.length) {
      const best = matching.find(c => c.basis) || matching[0];
      return { salary: { ...best, monthly: best.monthly || structured.period === 'month' || r.source === 'ejobs', evidenceKind: 'structured_field_and_text' } };
    }
    // Campul structurat este intervalul larg pe care angajatorul il completeaza in
    // formular; textul poate numi cifra exacta, cu net sau brut chiar langa ea.
    // Cand cifra din text cade in interiorul intervalului declarat, ea este dovada
    // mai specifica, nu o contrazicere. In afara intervalului ramane conflict.
    const inside = c => c.currency === structured.currency && c.min >= structured.min && c.max <= structured.max;
    // O cifra din afara intervalului declarat contrazice portalul: conflict, nu suprascriere.
    if (candidates.some(c => !inside(c))) return { error: 'salary_conflict' };
    const named = candidates.filter(c => c.basis);
    const bases = new Set(named.map(c => c.basis));
    if (named.length && bases.size === 1) {
      const min = Math.min(...named.map(c => c.min)), max = Math.max(...named.map(c => c.max));
      return { salary: { ...named[0], min, max,
        monthly: named.some(c => c.monthly) || structured.period === 'month',
        snippet: `${named[0].snippet} · în intervalul declarat ${structured.min}–${structured.max} ${structured.currency}`,
        evidenceKind: 'text_within_structured_range' } };
    }
    // O suma din interiorul intervalului, fara baza declarata nicaieri, nu adauga
    // nimic peste ce spune deja portalul: ramane campul structurat, fara baza.
    // The wording already ruled this figure out as a benefit, a package or the wrong unit.
    if ((candidates.excluded || []).some(x => x.min === structured.min && x.currency === structured.currency)) return { error: 'salary_evidence_incomplete' };
    const declared = documentBasis(document);
    return { salary: { ...structured, basis: declared, basisEvidence: declared ? 'document' : null,
      snippet: `câmp structurat ${r.source}: ${structured.min}${structured.max !== structured.min ? `–${structured.max}` : ''} ${structured.currency}`,
      monthly: structured.period === 'month', explicitFixed: false, roleSlugs: [], evidenceKind: 'structured_field' } };
  }
  const distinct = [...new Map(candidates.map(c => [key(c), c])).values()];
  if (!distinct.length) return { error: 'salary_evidence_incomplete' };
  if (distinct.length === 1) return { salary: distinct[0] };
  if (distinct.length === 2) { const paired = grossNetPair(distinct[0], distinct[1]); if (paired) return { salary: paired }; }
  return { error: 'multiple_unresolved_amounts', candidates: distinct };
}
/** Backwards-compatible single-value view. */
export function extractSalary(r) { return resolveSalary(r).salary || null; }

function salaryProblems(salary, r) {
  const reasons = [];
  if (salary.currency === 'EUR' && !(r.fx?.EURRON > 0 && r.fx?.date && r.fx?.source)) reasons.push('exchange_rate_missing');
  // Preserve a separate, explicitly labelled cohort when a full-time advert states
  // an amount but omits the pay period. Never count it as explicit monthly evidence.
  if (!salary.monthly && !['full time','norma intreaga'].includes(normalizeText(r.contract || ''))) reasons.push('monthly_unconfirmed');
  if (!(salary.min > 0 && salary.max >= salary.min && salary.max <= 100000)) reasons.push('invalid_amount');
  if (salary.max / salary.min > 2) reasons.push('wide_range_review');
  if (/\b(tips|bacsis|bonus|comision)\b/.test(normalizeText(salary.snippet)) && !salary.explicitFixed) reasons.push('base_salary_unclear');
  return reasons;
}
function observation(r, evidence, salary, slug, date, extra) {
  const url = canonicalUrl(r.url);
  const employer = r.employer && !/confidential|anonim/i.test(r.employer) ? normalizeText(r.employer) : null;
  const rate = salary.currency === 'EUR' ? r.fx.EURRON : 1;
  // An undeclared basis is never guessed. It is carried as its own cohort.
  const net = value => salary.basis === 'brut' ? calculStandard(Math.round(value * rate)).net : Math.round(value * rate);
  return { id: hash(`${url}|${slug}`).slice(0, 24), adId: hash(url).slice(0, 24), url, source: r.source, slug,
    title: r.title, min: net(salary.min), max: net(salary.max), originalSalary: salary, conversion: salary.currency === 'EUR' ? r.fx : null,
    netConversion: salary.basis === 'brut' ? 'calculStandard; ipotezele standard din fiscal.ts' : null,
    basis: salary.basis || 'nedeclarat', basisDeclared: !!salary.basis, basisEvidence: salary.basisEvidence || null, currency: 'RON', unit: 'month', concept: 'advertised_base',
    periodEvidence: salary.monthly ? 'explicit_monthly' : 'assumed_monthly_full_time',
    salaryEvidenceKind: salary.evidenceKind || 'description_text',
    employer: r.employer || null, employerKey: employer || r.employerId || null, employerKnown: !!employer,
    city: r.city || null, county: r.county || null, publishedAt: Number.isFinite(date) ? new Date(date).toISOString().slice(0,10) : null, dateKind: r.dateKind || 'published',
    listedAt: r.listedAt || null, activityEvidence: r.active === true ? 'explicit_active_status' : r.expires ? 'valid_through' : 'current_source_inventory',
    retrievedAt: evidence.retrievedAt, salaryEvidence: salary.snippet, salaryFieldEvidence: r.salaryText || null,
    evidence: { sha256: evidence.sha256, file: evidence.evidenceFile },
    descriptionHash: hash(normalizeText(r.description)), sources: [r.source], sourceUrls: [url], ...extra };
}
export function assess(r, evidence, now = new Date()) {
  const reasons = []; if (!r) return { accepted: false, reasons: ['unsupported_detail_schema'] };
  const classification = classifyAll(r.title || ''); if (!classification.slugs.length) reasons.push(classification.reason);
  if (r.country !== 'RO') reasons.push('country_unconfirmed');
  const text = normalizeText(`${r.title} ${r.description}`);
  if (/\b(germania|olanda|belgia|austria|franta|anglia|italia|spania|strainatate|comunitate|diurna|videochat|mlm)\b/.test(text)) reasons.push('foreign_or_noncomparable_work');
  if (!['full time','norma intreaga'].includes(normalizeText(r.contract || ''))) reasons.push('full_time_unconfirmed');
  if (/\b(part time|pfa|srl propriu|contract de colaborare|colaborare b2b|exclusiv pe comision|doar comision)\b/.test(text)) reasons.push('contract_or_variable_income');
  const date = Date.parse(r.date);
  if (Number.isFinite(date) && date > now.getTime()+86400000) reasons.push('future_publication_date');
  // An explicit staleness bound, so freshness is a rule and not a side effect of the inventory.
  if (Number.isFinite(date) && now.getTime()-date > POLICY.maxAdAgeDays*86400000) reasons.push('ad_too_old');
  const listedAt = Date.parse(r.listedAt), retrieved = Date.parse(evidence?.retrievedAt);
  const activeEvidence = r.active === true || (r.expires && Date.parse(r.expires) >= now.getTime()) || (Number.isFinite(listedAt) && Math.abs(now.getTime()-listedAt) <= POLICY.snapshotWindowDays*86400000);
  if (!activeEvidence) reasons.push('active_status_unconfirmed');
  if (!Number.isFinite(retrieved) || Math.abs(now.getTime()-retrieved) > POLICY.snapshotWindowDays*86400000) reasons.push('snapshot_date_unconfirmed');
  if (r.active === false || (r.expires && Date.parse(r.expires) < now.getTime())) reasons.push('expired');
  if (!evidence?.sha256 || !evidence.evidenceFile) reasons.push('evidence_missing');

  const candidates = extractSalaryCandidates(r);
  const resolved = resolveSalary(r, candidates);
  // One advert may hire several trades. Attribute a figure to a trade only when the
  // wording names them together; otherwise the single figure applies to each opening.
  const perRole = classification.slugs.length > 1 && resolved.error === 'multiple_unresolved_amounts'
    ? resolved.candidates.filter(c => c.roleSlugs.length === 1 && classification.slugs.includes(c.roleSlugs[0]))
    : [];
  const roleCovered = new Set(perRole.map(c => c.roleSlugs[0]));
  const pairs = perRole.length && roleCovered.size === perRole.length
    ? perRole.map(c => ({ slug: c.roleSlugs[0], salary: c }))
    : resolved.salary ? classification.slugs.map(slug => ({ slug, salary: resolved.salary })) : [];

  if (!pairs.length) reasons.push(resolved.error || 'salary_evidence_incomplete');
  else for (const p of pairs) reasons.push(...salaryProblems(p.salary, r));
  if (reasons.length) return { accepted: false, reasons: [...new Set(reasons)], slug: classification.slugs[0] || null, slugs: classification.slugs, title: r.title, url: r.url, source: r.source };

  const sharedFigure = pairs.length > 1 && new Set(pairs.map(p => key(p.salary))).size === 1;
  const observations = pairs.map(p => observation(r, evidence, p.salary, p.slug, date,
    sharedFigure ? { figureSharedAcrossRoles: pairs.map(x => x.slug) } : {}));
  return { accepted: true, observation: observations[0], observations };
}
