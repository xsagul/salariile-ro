import {TOTAL_ECONOMIE,LUNI_SERIE,INS_GENERAT_LA,MATRICE_NET,MATRICE_BRUT} from '@/lib/ins-date';
export function GET(request:Request){
 const rows=LUNI_SERIE.map((period,i)=>({period,gross:TOTAL_ECONOMIE.brut[i],net:TOTAL_ECONOMIE.net[i]}));
 const format=new URL(request.url).searchParams.get('format')??'json';
 if(!['json','csv'].includes(format))return new Response('Format invalid',{status:400});
 const payload={source:'INS TEMPO',matrices:{gross:MATRICE_BRUT,net:MATRICE_NET},importedAt:INS_GENERAT_LA,population:'TOTAL economie',unit:'RON/month',metric:'observed_aggregate',rows};
 const body=format==='json'?JSON.stringify(payload):'\uFEFFperiod,gross_lei,net_lei,matrice_brut,matrice_net,imported_at\r\n'+rows.map(r=>`"${r.period}",${r.gross??''},${r.net??''},${MATRICE_BRUT},${MATRICE_NET},${INS_GENERAT_LA}`).join('\r\n');
 return new Response(body,{headers:{'Content-Type':format==='json'?'application/json; charset=utf-8':'text/csv; charset=utf-8','Cache-Control':'public, max-age=3600','Content-Disposition':`attachment; filename="salarii-serie-ins.${format}"`}});
}
