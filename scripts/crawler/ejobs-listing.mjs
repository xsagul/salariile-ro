// Listarea publica de anunturi cu salariu a portalului eJobs. O pagina contine
// patruzeci de anunturi, cu suma, angajatorul, orasele si tipul de contract in
// payload-ul propriu al paginii. Pagina insasi este dovada, cu hash-ul ei.
import * as cheerio from 'cheerio';

/** Nuxt serializeaza payload-ul aplatizat pe indici; valorile nu stau langa chei. */
export function hydrateNuxt(flat) {
  const seen = new Array(flat.length), done = new Array(flat.length).fill(false);
  const specials = new Map([[-1, undefined], [-2, undefined], [-3, NaN], [-4, Infinity], [-5, -Infinity], [-6, -0]]);
  function at(i) {
    if (typeof i !== 'number') return i;
    if (i < 0) return specials.get(i);
    if (done[i]) return seen[i];
    const v = flat[i];
    if (v === null || typeof v !== 'object') { done[i] = true; return (seen[i] = v); }
    if (Array.isArray(v)) {
      if (typeof v[0] === 'string') {
        const [tag, ...rest] = v;
        done[i] = true;
        if (tag === 'Date') return (seen[i] = new Date(at(rest[0])));
        if (tag === 'Set') return (seen[i] = new Set(rest.map(at)));
        if (tag === 'Map') { const m = new Map(); seen[i] = m; for (let k = 0; k < rest.length; k += 2) m.set(at(rest[k]), at(rest[k + 1])); return m; }
        // Ref, Reactive, ShallowRef si celelalte ambalaje Nuxt: se despacheteaza.
        seen[i] = null; return (seen[i] = at(rest[0]));
      }
      const out = []; seen[i] = out; done[i] = true;
      for (const j of v) out.push(at(j));
      return out;
    }
    const out = {}; seen[i] = out; done[i] = true;
    for (const [k, j] of Object.entries(v)) out[k] = at(j);
    return out;
  }
  return at(0);
}

export function listingPayload(html) {
  const raw = cheerio.load(html)('#__NUXT_DATA__').text();
  if (!raw) return null;
  try { const flat = JSON.parse(raw); return { root: hydrateNuxt(flat), flat }; } catch { return null; }
}

/**
 * Dictionarul de orase al portalului: [id, slug, judetId, nume]. Nu este un obiect
 * in payload, ci un sir JSON de sute de kiloocteti pus intr-una din celule.
 */
function cityIndex(flat) {
  const out = new Map();
  for (const cell of flat) {
    if (typeof cell !== 'string' || !cell.startsWith('[[')) continue;
    let rows;
    try { rows = JSON.parse(cell); } catch { continue; }
    if (!Array.isArray(rows)) continue;
    for (const r of rows) {
      if (!Array.isArray(r) || r.length !== 4) continue;
      const [id, slug, countyId, name] = r;
      if (typeof id !== 'number' || typeof slug !== 'string' || typeof countyId !== 'number') continue;
      out.set(id, { slug, countyId, name: typeof name === 'string' ? name : name?.ro ?? slug });
    }
    if (out.size) return out;
  }
  return out;
}

// Identificatorii de tip de contract folositi de portal in listare.
const FULL_TIME_CONTRACT = 5;

/**
 * Anunturile de pe o pagina de listare, in aceeasi forma pe care o produce
 * `detailRecord`, ca sa treaca prin exact aceleasi verificari.
 */
export function listingRecords(html, pageUrl) {
  const payload = listingPayload(html);
  const items = payload?.root?.pinia?.jobs?._listItems;
  if (!Array.isArray(items) || !items.length) return [];
  const cities = cityIndex(payload.flat);
  return items.filter(it => it && it.id && it.title && it.salary).map(it => {
    const named = (it.locations || []).map(l => cities.get(l.cityId)).filter(Boolean);
    const contracts = it.contractTypesIds || [];
    return {
      title: it.title,
      // Listarea nu publica descrierea; exclusiunile care o cer raman in sarcina paginii de detaliu.
      description: '',
      url: new URL(`/user/locuri-de-munca/${it.slug}/${it.id}`, pageUrl).href,
      source: 'ejobs',
      employer: it.company?.name || null,
      employerId: it.company?.id ? `ejobs:${it.company.id}` : null,
      city: named.map(c => c.name).join('; ') || null,
      county: named.length === 1 ? String(named[0].countyId) : null,
      // Fiecare oras vine din nomenclatorul romanesc al portalului.
      country: named.length && named.length === (it.locations || []).length ? 'RO' : null,
      contract: contracts.length === 1 && contracts[0] === FULL_TIME_CONTRACT ? 'full-time' : null,
      date: it.creationDate || null,
      expires: it.expirationDate || null,
      salaryText: it.salary,
      salary: null,
      listingOnly: true,
    };
  });
}
