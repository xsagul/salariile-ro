import {sarbatoriAn,zileLucratoareLuna} from '@/lib/sarbatori';
export async function GET(request:Request,{params}:{params:Promise<{an:string}>}){
 const {an}=await params;
 if(!['2026','2027'].includes(an))return new Response('Calendar indisponibil',{status:404});
 const year=Number(an),format=new URL(request.url).searchParams.get('format')??'ics';
 if(!['csv','ics'].includes(format))return new Response('Format invalid',{status:400});
 const pad=(n:number)=>String(n).padStart(2,'0');
 let body:string;
 if(format==='csv')body='\uFEFFLuna,Zile lucratoare,Ore la 8 ore pe zi\r\n'+Array.from({length:12},(_,i)=>`${i+1},${zileLucratoareLuna(year,i)},${zileLucratoareLuna(year,i)*8}`).join('\r\n');
 else body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Salariile.ro//Calendar legal//RO','CALSCALE:GREGORIAN',...Object.entries(sarbatoriAn(year)).flatMap(([key,name])=>{
  const [m,d]=key.split('-').map(Number),start=`${an}${pad(m)}${pad(d)}`,next=new Date(Date.UTC(year,m-1,d+1));
  const end=`${next.getUTCFullYear()}${pad(next.getUTCMonth()+1)}${pad(next.getUTCDate())}`;
  return ['BEGIN:VEVENT',`UID:${start}@salariile.ro`,'DTSTAMP:20260907T000000Z',`DTSTART;VALUE=DATE:${start}`,`DTEND;VALUE=DATE:${end}`,`SUMMARY:${name}`,'TRANSP:TRANSPARENT','END:VEVENT'];
 }),'END:VCALENDAR',''].join('\r\n');
 return new Response(body,{headers:{'Content-Type':format==='csv'?'text/csv; charset=utf-8':'text/calendar; charset=utf-8','Content-Disposition':`attachment; filename="calendar-${an}.${format}"`,'Cache-Control':'public, max-age=86400','X-Robots-Tag':'noindex'}});
}
