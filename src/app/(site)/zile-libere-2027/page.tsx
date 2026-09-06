import type {Metadata} from 'next';
import Calendar2027 from '@/app/components/Calendar2027';
import {ogPage,twPage} from '@/lib/seo';
const title='Zile libere 2027: calendar și sărbători legale';
const description='Calendarul sărbătorilor legale din 2027 în România, cu zilele săptămânii, Paștele ortodox și fișier ICS pentru import. Fără punți neadoptate.';
export const metadata:Metadata={title:{absolute:title},description,alternates:{canonical:'https://salariile.ro/zile-libere-2027'},openGraph:ogPage({title,description,path:'/zile-libere-2027'}),twitter:twPage({title,description})};
export default function Page(){return <Calendar2027 tip="libere"/>;}
