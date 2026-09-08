import fs from 'node:fs';
import { normalizeText as clean, editDistance } from './policy.mjs';
// Names only. Never use baseline salaries as observations or calibration targets.
export const catalog = JSON.parse(fs.readFileSync('src/data/cor-meserii.json', 'utf8')).occupations;
const names = JSON.parse(fs.readFileSync('src/data/backup-baseline-132-meserii-2026-09-06.json', 'utf8')).map(({ slug, nume }) => ({ slug, nume }));
export const occupations = names;
const aliases = {
  programator: ['software developer','software engineer','inginer software','backend developer','java developer','python developer','full stack developer'],
  'web-developer': ['frontend developer','front end developer','react developer','angular developer'],
  'devops-engineer': ['devops','site reliability engineer','cloud engineer'],
  'administrator-sistem': ['administrator sistem','system administrator','sysadmin'],
  'tester-qa': ['qa engineer','quality assurance','software tester'],
  'analist-date': ['data analyst','analist date'],
  'operator-cnc': ['programator cnc','operator cnc','cnc operator','frezor cnc','strungar cnc'],
  electrician: ['electricieni','electricean','electrician auto'],
  instalator: ['instalatori','instalator sanitar'],
  constructor: ['muncitor constructii','muncitori constructii','muncitori in constructii','lucrator constructii','lucrator in constructii','muncitor necalificat constructii'],
  'agent-paza': ['agent securitate','agenti securitate','agent paza','agenti paza','ag securitate','paznic'],
  'agent-curatenie': ['personal curatenie','operator curatenie','femeie de serviciu','menajera'],
  chelner: ['ospatar','ospatari','ospatarita'],
  vanzator: ['vanzatoare','lucrator comercial','lucratori comerciali'],
  'sofer-tir': ['sofer camion','sofer c e','sofer tir','sofer profesionist','soferi profesionisti','soferi tir','sofer categoria c e','sofer categoria c+e'],
  taximetrist: ['sofer taxi'],
  'medic-veterinar': ['doctor veterinar'],
  stomatolog: ['medic dentist'],
  'consilier-juridic': ['jurist'],
  secretar: ['secretara','secretar birou notarial','asistent manager'],
  'designer-grafic': ['graphic designer','grafician'],
  'specialist-resurse-umane': ['specialist hr','hr specialist','recruiter','recrutor'],
  'manager-magazin': ['sef magazin','store manager','director magazin'],
  'inginer-agronom': ['agronom'],
  'operator-call-center': ['call center','customer support'],
  bucatar: ['bucatari','bucatareasa'],
  sudor: ['sudori'],
  contabil: ['contabila','accountant'],
  'agent-vanzari': ['reprezentant vanzari','sales representative','sales advisor','agenti vanzari','consultant vanzari','consilier vanzari','reprezentant comercial'],
  'asistent-medical': ['asistenta medicala','asistenti medicali','asistente medicale','asistent generalist'],
  'asistent-farmacie': ['asistent farmacie','asistenta farmacie'],
  infirmier: ['infirmiera','infirmiere'],
  'ingrijitor-batrani': ['ingrijitoare batrani','ingrijitor persoane varstnice'],
  'mecanic-auto': ['mecanici auto','mecanic autovehicule'],
  tamplar: ['tamplari'],
  dulgher: ['dulgheri'],
  zidar: ['zidari'],
  zugrav: ['zugravi'],
  croitor: ['croitoreasa','croitorese','croitori'],
  casier: ['casiera','casieri','casiere'],
  curier: ['curieri'],
  farmacist: ['farmacisti','farmacista'],
  cofetar: ['cofetari','cofetareasa'],
  'operator-productie': ['operatori productie'],
  frizer: ['frizeri','barber','frizerita'],
  cosmetician: ['cosmeticiana'],
  inginer: ['ingineri','inginer constructor'],
  sudor: ['sudori','welder'],
  educator: ['educatoare'],
  invatator: ['invatatoare'],
  profesor: ['profesoara'],
  'insotitor-de-bord': ['insotitor de bord','stewardesa','flight attendant','cabin crew'],
  'receptioner-hotel': ['receptioner hotel','hotel receptionist','receptionera hotel'],
};
export function queriesFor(job) { return [...new Set([clean(job.nume), ...(aliases[job.slug] || []).slice(0, 2)])]; }
const rules = names.flatMap(job => [clean(job.nume),clean(job.slug),...(aliases[job.slug] || [])].map(term => ({ slug: job.slug, term: clean(term) })));
const exclusions = [
  [/\b(caut loc de munca|caut un loc de munca|caut de lucru|caut angajare|caut colaborare|ofer servicii|prestam servicii|meditatii|inchiriez post|inchiriez camera)\b/, 'jobseeker_or_services_ad'],
  // Assistant roles outside the catalogue must never inherit the senior occupation.
  [/\b(ajutor|ajutoare|ajutoarelor|ucenic|ucenici)\b/, 'assistant_or_mixed_role'],
  [/\b(asistent veterinar|asistent stomatolog|secretar notarial)\b/, 'different_role'],
];
function matches(text, term) { return (` ${text} `).includes(` ${term} `); }
/** Romanian plural and inflection endings that must not hide a catalogue term. */
const stem = word => word.length >= 7 ? word.replace(/(uri|ilor|elor|ului|ele|ile|ii|i|e|a)$/, '') : word;
/** Misspellings are common in classifieds. Tolerance grows with term length only. */
function fuzzyMatches(tokens, stems, term) {
  const parts = term.split(' ');
  if (parts.some(p => p.length < 7)) return false;
  const budget = t => (t.length >= 11 ? 2 : 1);
  if (parts.length === 1) return tokens.some((t, i) => editDistance(t, term, budget(term)) <= budget(term) || editDistance(stems[i], stem(term), budget(term)) <= budget(term));
  return tokens.some((_, i) => parts.every((p, k) => i + k < tokens.length && editDistance(tokens[i + k], p, budget(p)) <= budget(p)));
}
/**
 * Every catalogue occupation named in the title. A single advert may hire for
 * several trades at once; each one is a separate observation, never a discard.
 */
export function classifyAll(title) {
  const text = clean(title);
  for (const [pattern, reason] of exclusions) if (pattern.test(text)) return { slugs: [], reason };
  if (/\b(programator|programatori)\b/.test(text) && /\b(plc|roboti|robot|injectie|masini)\b/.test(text) && !/\bcnc\b/.test(text)) return { slugs: [], reason: 'different_role' };
  const tokens = text.split(' ').filter(Boolean), stems = tokens.map(stem);
  let hits = rules.filter(r => matches(text, r.term));
  let how = 'title_match';
  if (!hits.length) { hits = rules.filter(r => fuzzyMatches(tokens, stems, r.term)); how = 'title_fuzzy_match'; }
  // Specific title wins over contained generic words: CNC/programator, medic veterinar/medic.
  hits = hits.filter(r => !hits.some(s => s.slug !== r.slug && s.term.length > r.term.length && matches(s.term, r.term)));
  const slugs = [...new Set(hits.map(r => r.slug))];
  return { slugs, reason: slugs.length ? how : 'unknown_occupation' };
}
/** Single-occupation view, for inventory filtering and for adverts about one job. */
export function classifyTitle(title) {
  const { slugs, reason } = classifyAll(title);
  return { slug: slugs.length === 1 ? slugs[0] : null, slugs, reason: slugs.length > 1 ? 'ambiguous_occupation' : reason };
}
