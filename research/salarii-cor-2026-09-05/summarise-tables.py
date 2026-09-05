import json,csv,collections
from pathlib import Path
r=Path(__file__).parent
out={}
for id in ['ilo-monthly-mean','ilo-monthly-median']:
 rows=list(csv.DictReader((r/('raw/'+id+'.txt')).open(encoding='utf-8-sig')))
 out[id]={'rows':len(rows),'countries':sorted({x['ref_area'] for x in rows}),'sources':sorted({x['source'] for x in rows}),'years':sorted({x['time'] for x in rows}),'occupation_codes':sorted({x['classif1'] for x in rows}),'columns':list(rows[0])}
for id in ['eurostat-ses22-21','eurostat-monthly']:
 j=json.loads((r/('raw/'+id+'.json')).read_text())
 dims=[sorted(j['dimension'][k]['category']['index'],key=lambda c:j['dimension'][k]['category']['index'][c]) for k in j['id']]
 counts=collections.Counter();sample=[]
 for ix,v in j['value'].items():
  n=int(ix);d={}
  for a in range(len(j['id'])-1,-1,-1): d[j['id'][a]]=dims[a][n%j['size'][a]];n//=j['size'][a]
  counts[(d['time'],d.get('isco08'))]+=1
  if d.get('isco08')=='OC7' and d.get('sex')=='T' and d.get('indic_se')=='ERN' and d.get('unit')=='NAC' and d.get('sizeclas')=='GE10' and d.get('age')=='TOTAL':sample.append(dict(d,value=v,status=j.get('status',{}).get(ix)))
 out[id]={'nonempty':len(j['value']),'populated_dimensions':[{'year':y,'isco08':i,'nonempty':v} for (y,i),v in sorted(counts.items())],'sample_craft_group':sample}
(r/'tables-coverage-verified.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(out,ensure_ascii=False,indent=2))
