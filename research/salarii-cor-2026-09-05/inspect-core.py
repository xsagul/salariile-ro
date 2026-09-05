from pathlib import Path
import xml.etree.ElementTree as ET
import json,re,importlib.util
from pypdf import PdfReader
root=Path(__file__).parent
ns={'pkg':'http://schemas.microsoft.com/office/2006/xmlPackage','w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
xml=ET.parse(root/'raw/cor-2024.xml')
part=next(x for x in xml.findall('pkg:part',ns) if x.get('{'+ns['pkg']+'}name')=='/word/document.xml')
rows=[]
for tr in part.findall('.//w:tr',ns):
    cells=[''.join(t.text or '' for t in tc.findall('.//w:t',ns)).strip() for tc in tr.findall('w:tc',ns)]
    if len(cells)>=3 and re.fullmatch(r'\d{6}',cells[1]): rows.append({'cor':cells[1],'name':cells[2],'snapshot':'2024-04-22','source_id':'cor-2024'})
codes=[r['cor'] for r in rows]
assert len(codes)==len(set(codes)), 'Duplicate official codes need review'
(root/'cor-catalogue-2024.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'cor_count':len(rows),'selected':[r for r in rows if re.search('instalator|zugrav|contabil|programator|electrician|zidar|avocat|juridic',r['name'],re.I)]},ensure_ascii=False))
p=PdfReader(root/'raw/ses-anonymisation.pdf')
t='\n'.join('PAGE '+str(i+1)+'\n'+page.extract_text() for i,page in enumerate(p.pages))
(root/'raw/ses-anonymisation.text.txt').write_text(t,encoding='utf8')
print('SES pages',len(p.pages),'xlrd',bool(importlib.util.find_spec('xlrd')))
print('\n'.join(x for x in t.splitlines() if re.search('Romania|occupation|ISCO|digit|experience|B23|B41',x,re.I)))
