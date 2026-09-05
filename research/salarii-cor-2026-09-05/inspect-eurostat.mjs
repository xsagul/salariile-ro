import fs from 'node:fs/promises';
const j=JSON.parse(await fs.readFile(new URL('./raw/eurostat-monthly.json',import.meta.url),'utf8'));
const keys=j.id.map(k=>Object.keys(j.dimension[k].category.index).sort((a,b)=>j.dimension[k].category.index[a]-j.dimension[k].category.index[b]));
const rows=[];
for(const [ix,v] of Object.entries(j.value)){let n=+ix,c={};for(let a=j.id.length-1;a>=0;a--){c[j.id[a]]=keys[a][n%j.size[a]];n=Math.floor(n/j.size[a]);}if(c.time==='2022'&&c.isco08==='OC7')rows.push({...c,value:v,status:j.status?.[ix]??null});}
console.log(JSON.stringify(rows.slice(0,35),null,2));
