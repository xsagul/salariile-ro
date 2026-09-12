// src/lib/export-serie-ins.ts
//
// Seria lunară INS pentru economia totală, ca fișier CSV sau JSON. Mutată din
// /api/date-salarii/serie?format=..., care nu poate exista pe găzduire statică.

import {TOTAL_ECONOMIE,LUNI_SERIE,INS_GENERAT_LA,MATRICE_NET,MATRICE_BRUT} from '@/lib/ins-date';

export function continutSerieIns(format: "json" | "csv"): string {
 const rows=LUNI_SERIE.map((period,i)=>({period,gross:TOTAL_ECONOMIE.brut[i],net:TOTAL_ECONOMIE.net[i]}));
 const payload={source:'INS TEMPO',matrices:{gross:MATRICE_BRUT,net:MATRICE_NET},importedAt:INS_GENERAT_LA,population:'TOTAL economie',unit:'RON/month',metric:'observed_aggregate',rows};
 const body=format==='json'?JSON.stringify(payload):'\uFEFFperiod,gross_lei,net_lei,matrice_brut,matrice_net,imported_at\r\n'+rows.map(r=>`"${r.period}",${r.gross??''},${r.net??''},${MATRICE_BRUT},${MATRICE_NET},${INS_GENERAT_LA}`).join('\r\n');
 return body;
}
