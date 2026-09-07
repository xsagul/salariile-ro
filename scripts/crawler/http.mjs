import fs from 'node:fs';
import crypto from 'node:crypto';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const hash = s => crypto.createHash('sha256').update(s).digest('hex');
const ua = 'SalariileRoResearch/2.0 (+https://salariile.ro/despre)';
const hosts = new Map(), robots = new Map(), blocked = new Set();
export function allowedByRobots(text, url) {
  const rules = []; let applies = false;
  for (const line of text.split(/\r?\n/)) {
    const m = line.replace(/#.*/, '').trim().match(/^([\w-]+):\s*(.*)$/); if (!m) continue;
    const key = m[1].toLowerCase(), value = m[2].trim();
    if (key === 'user-agent') applies = value === '*' || /salariilero/i.test(value);
    if (applies && ['allow','disallow'].includes(key) && value) {
      const pattern = value.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$');
      if (new RegExp('^' + pattern).test(new URL(url).pathname + new URL(url).search)) rules.push({ allow: key === 'allow', length: value.replace(/\*/g, '').length });
    }
  }
  rules.sort((a,b) => b.length-a.length || Number(b.allow)-Number(a.allow));
  return rules[0]?.allow ?? true;
}
export async function getPage(url, dir) {
  const origin = new URL(url).origin;
  fs.mkdirSync(dir, { recursive: true });
  const key = hash(url), metaPath = `${dir}/${key}.json`, htmlPath = `${dir}/${key}.html`;
  if (fs.existsSync(metaPath) && fs.existsSync(htmlPath)) return { ...JSON.parse(fs.readFileSync(metaPath, 'utf8')), html: fs.readFileSync(htmlPath, 'utf8') };
  const pausePath=`${dir}/pause-${hash(origin)}.json`;
  if(fs.existsSync(pausePath)) {const pause=JSON.parse(fs.readFileSync(pausePath,'utf8'));if(!pause.until || Date.parse(pause.until)>Date.now())throw new Error(`host_paused_${pause.status}`);}
  if (blocked.has(origin)) throw new Error('host_paused');
  if (!robots.has(origin)) {
    robots.set(origin, (async () => {
      const r = await fetch(origin + '/robots.txt', { headers: { 'User-Agent': ua }, signal: AbortSignal.timeout(20000) });
      if (!r.ok && r.status !== 404) throw new Error('robots_unavailable_' + r.status);
      return r.status === 404 ? '' : r.text();
    })());
  }
  if (!allowedByRobots(await robots.get(origin), url)) throw new Error('robots_disallowed');
  // Per-host queue: at most one request in flight, with an inter-request pause.
  const previous = hosts.get(origin) || Promise.resolve();
  const task = previous.catch(() => {}).then(async () => {
    const crawlDelay=Number((await robots.get(origin)).match(/Crawl-delay:\s*(\d+(?:\.\d+)?)/i)?.[1] || 0)*1000;
    await sleep(Math.max(1000,crawlDelay));
    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await fetch(url, { headers: { 'User-Agent': ua }, signal: AbortSignal.timeout(20000), redirect: 'manual' });
      if ([301,302,303,307,308].includes(r.status)) {
        const target = new URL(r.headers.get('location'), url).href;
        // Caller retries redirects outside this queue to avoid deadlock.
        return { redirect: target };
      }
      if ([401,403,429].includes(r.status)) {
        blocked.add(origin);
        const retry=r.headers.get('retry-after'),retryMs=Number(retry)*1000 || (Date.parse(retry)-Date.now()) || 0;
        fs.writeFileSync(pausePath,JSON.stringify({status:r.status,at:new Date().toISOString(),until:r.status===429?new Date(Date.now()+Math.max(3600000,retryMs)).toISOString():null}));
        throw new Error('host_paused_' + r.status);
      }
      if ([500,502,503,504].includes(r.status) && attempt < 2) { await sleep(Math.min(30000, Number(r.headers.get('retry-after')) * 1000 || 2000 * 2 ** attempt)); continue; }
      if (!r.ok) throw new Error('http_' + r.status);
      const html = await r.text();
      if (/just a moment|verify you are human/i.test(html.slice(0,2000))) {blocked.add(origin);fs.writeFileSync(pausePath,JSON.stringify({status:'challenge',at:new Date().toISOString(),until:null}));throw new Error('host_paused_challenge');}
      const meta = { url: r.url, retrievedAt: new Date().toISOString(), sha256: hash(html), evidenceFile: htmlPath };
      fs.writeFileSync(htmlPath, html); fs.writeFileSync(metaPath, JSON.stringify(meta));
      return { ...meta, html };
    }
    throw new Error('retries_exhausted');
  });
  hosts.set(origin, task);
  const result = await task;
  if (result.redirect) throw Object.assign(new Error('redirect'), { target: result.redirect });
  return result;
}
export async function fetchPage(url, dir) {
  for (let i = 0; i < 5; i++) {
    try { return await getPage(url, dir); } catch (e) { if (!e.target) throw e; url = e.target; }
  }
  throw new Error('redirect_loop');
}
