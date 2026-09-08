// scripts/lib/url-sursa.ts
//
// Un URL de sursa trebuie sa fie https. Singura exceptie e TEMPO Online, pe
// care INS il serveste numai pe http, pe portul 8077: https pe aceeasi gazda
// pica la handshake TLS, verificat pe 9 septembrie 2026 si in browser, si cu
// curl. Pana atunci citam https://statistici.insse.ro/tempoins/..., care
// raspundea 404 pe 191 de pagini construite — un link https rupt e mai rau
// decat un link http care functioneaza.
//
// Exceptia e legata de INS_SURSA.url, nu scrisa de mana, ca sa dispara singura
// in ziua in care INS publica TEMPO pe https.

import { INS_SURSA } from "../../src/lib/ins-date";

export const urlSursaValid = (u: string): boolean =>
  u.startsWith("https://") || u === INS_SURSA.url;
