import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import * as cheerio from 'cheerio';
const raw=path.join(import.meta.dirname,'raw');
const args=process.argv.slice(2), targets=JSON.parse(await fs.readFile(args[0],'utf8'));
const result=[];
for(let k=0;k<targets.length;k+=3){
 await Promise.all(targets.slice(k,k+3).map(async({id,url})=>{
  try{
   const r=await fetch(url,{signal:AbortSignal.timeout(20000)});const b=new Uint8Array(await r.arrayBuffer());
   const type=r.headers.get('content-type')||'';const ext=type.includes('pdf')?'pdf':type.includes('json')?'json':type.includes('html')?'html':type.includes('xml')?'xml':url.match(/\.(xls|xlsx|zip)(?:\?|$)/)?.[1]||'txt';
   const file=id+'.'+ext;await fs.writeFile(path.join(raw,file),b);
   let detail={};
   if(type.includes('html')){const $=cheerio.load(new TextDecoder().decode(b));$('script,style,nav,footer,header').remove();await fs.writeFile(path.join(raw,id+'.text.txt'),$('body').text().replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n'));const links=$('a[href]').map((_,e)=>({text:$(e).text().trim(),url:new URL($(e).attr('href'),r.url).href})).get();await fs.writeFile(path.join(raw,id+'.links.json'),JSON.stringify(links,null,2));detail.links=links.length;}
   result.push({id,url,finalUrl:r.url,status:r.status,type,file,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),fetchedAt:new Date().toISOString(),detail});
   console.log(JSON.stringify({id,status:r.status,file,bytes:b.length}));
  }catch(e){result.push({id,url,error:e.message,cause:e.cause?.code,fetchedAt:new Date().toISOString()});console.log(JSON.stringify(result.at(-1)));}
 }));
}
await fs.writeFile(path.join(raw,path.basename(args[0],'.json')+'-manifest.json'),JSON.stringify(result,null,2));
