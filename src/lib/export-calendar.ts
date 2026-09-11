// src/lib/export-calendar.ts
//
// Calendarul sărbătorilor legale ca fișier: ICS pentru import, CSV pentru tabel.
// Mutat din /api/calendar/[an]?format=..., care nu poate exista pe găzduire
// statică. Fișierele se generează la build, la /date/calendar/<an>.<format>.

import { sarbatoriAn, zileLucratoareLuna } from "@/lib/sarbatori";

export const FISIERE_CALENDAR = ["2026.ics", "2026.csv", "2027.ics", "2027.csv"] as const;

export function continutCalendar(an: "2026" | "2027", format: "csv" | "ics"): string {
 const year = Number(an);
 const pad=(n:number)=>String(n).padStart(2,'0');
 let body:string;
 if(format==='csv')body='\uFEFFLuna,Zile lucratoare,Ore la 8 ore pe zi\r\n'+Array.from({length:12},(_,i)=>`${i+1},${zileLucratoareLuna(year,i)},${zileLucratoareLuna(year,i)*8}`).join('\r\n');
 else body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Salariile.ro//Calendar legal//RO','CALSCALE:GREGORIAN',...Object.entries(sarbatoriAn(year)).flatMap(([key,name])=>{
  const [m,d]=key.split('-').map(Number),start=`${an}${pad(m)}${pad(d)}`,next=new Date(Date.UTC(year,m-1,d+1));
  const end=`${next.getUTCFullYear()}${pad(next.getUTCMonth()+1)}${pad(next.getUTCDate())}`;
  return ['BEGIN:VEVENT',`UID:${start}@salariile.ro`,'DTSTAMP:20260907T000000Z',`DTSTART;VALUE=DATE:${start}`,`DTEND;VALUE=DATE:${end}`,`SUMMARY:${name}`,'TRANSP:TRANSPARENT','END:VEVENT'];
 }),'END:VCALENDAR',''].join('\r\n');
 return body;
}
