import fs from 'node:fs';
import { occupations, classifyAll } from './occupations.mjs';
import { POLICY } from './policy.mjs';
import { deduplicate, summarize } from './aggregate.mjs';
// Some portals percent-encode titles in a legacy charset; the raw segment still classifies.
const safeDecode = s => { try { return decodeURIComponent(s); } catch { return s; } };

export function titleFromUrl(url, source) {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  return safeDecode(['publi24','ejobs','undelucram'].includes(source) ? parts.at(-2) : parts.at(-1)).replaceAll('-', ' ');
}
export function exportRun(state, root) {
  const all = Object.values(state.results);
  // One advert hiring several trades yields one observation per trade.
  const observations = deduplicate(all.filter(r=>r.accepted).flatMap(r=>r.observations || [r.observation]));
  const sourceInventory = Object.fromEntries(Object.entries(state.sources).map(([source,s])=> {
    const candidates = s.urls.filter(url=>classifyAll(titleFromUrl(url,source)).slugs.length);
    const checked = candidates.filter(url=>state.results[url]).length;
    return [source, { inventoryUrls:s.urls.length, sitemapOrCategories:s.maps.length,
      inventoryEnumerated:!!s.inventoryComplete, catalogCandidates:candidates.length,
      catalogChecked:checked, catalogPassComplete:checked===candidates.length && !!s.inventoryComplete,
      pagesFetched:all.filter(r=>r.source===source && r.evidence).length,
      listedAt:s.listedAt || null, events:s.events,
      limitation:'Completitudinea se raportează la inventarul public accesibil, nu la baza internă a platformei.' }];
  }));
  const payload = { version:POLICY.version, run:state.run, generatedAt:new Date().toISOString(), policy:POLICY, fx:state.fx,
    scope:{sources:Object.keys(state.sources),slugs:occupations.map(j=>j.slug),method:'public_source_inventories'},sourceInventory,
    stats:{inventoried:Object.values(state.sources).reduce((sum,s)=>sum+s.urls.length,0),read:all.length,
      acceptedAds:all.filter(r=>r.accepted).length,acceptedBeforeDedup:all.filter(r=>r.accepted).flatMap(r=>r.observations||[r.observation]).length,accepted:observations.length,
      duplicates:all.filter(r=>r.accepted).flatMap(r=>r.observations||[r.observation]).length-observations.length,rejected:all.filter(r=>!r.accepted).length,
      errors:Object.values(state.sources).reduce((sum,s)=>sum+s.events.length,0)},
    observations,coverage:Object.fromEntries(occupations.map(j=>[j.slug,{name:j.nume,...summarize(observations.filter(o=>o.slug===j.slug))}])) };
  fs.writeFileSync(`${root}/verified.json`,JSON.stringify(payload,null,2));
  fs.writeFileSync(`${root}/checkpoint.json`,JSON.stringify({records:observations,rejected:all.filter(r=>!r.accepted),events:Object.entries(state.sources).flatMap(([source,s])=>s.events.map(e=>({...e,source})))},null,2));
  return payload;
}
