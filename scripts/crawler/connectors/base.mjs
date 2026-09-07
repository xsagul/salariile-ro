const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
];

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let attempt = 0;
  const ua = options.userAgent || DEFAULT_USER_AGENTS[Math.floor(Math.random() * DEFAULT_USER_AGENTS.length)];
  const headers = {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7',
    'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
    ...options.headers
  };

  while (attempt < maxRetries) {
    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 429) {
        // Rate limited - backoff
        await sleep(1500 * (attempt + 1));
        attempt++;
        continue;
      }
      if (!res.ok && res.status >= 500) {
        await sleep(1000 * (attempt + 1));
        attempt++;
        continue;
      }
      return res;
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      await sleep(1000 * attempt);
    }
  }

  throw new Error(`Eșuat după ${maxRetries} încercări pentru ${url}`);
}
