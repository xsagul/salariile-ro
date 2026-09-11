import Link from "@/app/components/Link";
import {TOTAL_ECONOMIE,LUNI_SERIE,INS_GENERAT_LA,MATRICE_NET,MATRICE_BRUT} from '@/lib/ins-date';
import {GraficSerie,lunaLunga} from './Salarii';
export default function BuletinSalarii(){
 const i=LUNI_SERIE.length-1,now=TOTAL_ECONOMIE.net[i],prev=TOTAL_ECONOMIE.net[i-1],year=TOTAL_ECONOMIE.net[i-12];
 const pct=(a:number,b:number)=>((a/b-1)*100).toLocaleString('ro-RO',{maximumFractionDigits:1});
 return <section id="buletin-lunar" className="mt-10 space-y-4">
  <h2 className="text-2xl font-bold">Buletin salarial · {lunaLunga(LUNI_SERIE[i])}</h2>
  <p className="text-stone-600">Câștigul salarial mediu net raportat de INS este {now?.toLocaleString('ro-RO')} lei / lună.{now&&prev?` Variația față de luna precedentă: ${pct(now,prev)}%.`:''}{now&&year?` Față de aceeași lună din anul anterior: ${pct(now,year)}%.`:''} Comparația este nominală; nu măsoară puterea de cumpărare sau salariul unei meserii.</p>
  <GraficSerie valori={TOTAL_ECONOMIE.net} luni={LUNI_SERIE} titlu="Câștig salarial mediu net pe economie"/>
  <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="sr-only">Seria lunară INS pe economie</caption><thead><tr>{['Luna','Brut (lei/lună)','Net (lei/lună)'].map(h=><th key={h} scope="col" className="border-b p-3 text-left">{h}</th>)}</tr></thead><tbody>{LUNI_SERIE.slice(-13).map((month,j)=>{const idx=LUNI_SERIE.length-Math.min(13,LUNI_SERIE.length)+j;return <tr key={month}><th scope="row" className="border-b p-3 text-left font-normal">{lunaLunga(month)}</th><td className="border-b p-3">{TOTAL_ECONOMIE.brut[idx]?.toLocaleString('ro-RO')??'—'}</td><td className="border-b p-3">{TOTAL_ECONOMIE.net[idx]?.toLocaleString('ro-RO')??'—'}</td></tr>;})}</tbody></table></div>
  <p className="text-sm text-stone-600">Sursa: INS TEMPO, {MATRICE_BRUT} (brut), {MATRICE_NET} (net), TOTAL economie. Import: {INS_GENERAT_LA.slice(0,10)}. Netul INS este observat separat, nu calculat fiscal din brutul mediu. Primele sezoniere pot schimba comparația lunară.</p>
  <nav className="flex flex-wrap gap-4 text-sm"><a download className="min-h-11 py-3 underline" href="/date/salarii-serie-ins.csv">Descarcă seria CSV</a><a download className="min-h-11 py-3 underline" href="/date/salarii-serie-ins.json">Descarcă seria JSON</a><Link className="min-h-11 py-3 underline" href="/salarii/judete">Comparație între județe</Link></nav>
  <p className="text-sm text-stone-600">Citare: Salariile.ro, „Buletin salarial”, {lunaLunga(LUNI_SERIE[i])}, sursa INS TEMPO. Menționează luna statisticii și data importului când reutilizezi seria.</p>
 </section>;
}
