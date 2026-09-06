import type {Metadata} from 'next';
import Calendar2027 from '@/app/components/Calendar2027';
import {ogPage,twPage} from '@/lib/seo';
const title='Zile lucrătoare 2027: tabel lunar și calcul pe interval';
const description='Zile și ore lucrătoare în 2027, pe luni. Descarcă tabelul CSV și calculează norma pe un interval. Sărbători ortodoxe, program luni–vineri.';
export const metadata:Metadata={title:{absolute:title},description,alternates:{canonical:'https://salariile.ro/zile-lucratoare-2027'},openGraph:ogPage({title,description,path:'/zile-lucratoare-2027'}),twitter:twPage({title,description})};
export default function Page(){return <Calendar2027 tip="lucratoare"/>;}
