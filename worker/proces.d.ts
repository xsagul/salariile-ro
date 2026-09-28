// src/lib/csp.ts citește process.env.NODE_ENV; în Worker valoarea e fixată la build (wrangler.jsonc → define).
declare const process: { env: Record<string, string | undefined> };
