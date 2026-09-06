import openpyxl, json, collections, statistics
book = openpyxl.load_workbook('research/surse-salarii/constanta-martie-2026.xlsx', data_only=True, read_only=True)
rows = list(book['Sheet1'].values)
functions = collections.Counter(r[0] for r in rows[3:] if isinstance(r[0], str))
print('\n'.join(f'{k}: {v}' for k,v in functions.items()))
groups = {
 'asistent-medical': lambda s: s.startswith('Asistent medical'),
 'asistent-farmacie': lambda s: s.startswith('Asistent de farmacie') or s.startswith('Asistent farmacie'),
 'medic': lambda s: s.startswith('Medic specialist') or s.startswith('Medic primar'),
 'medic-rezident': lambda s: s.startswith('Medic rezident'),
 'farmacist': lambda s: s.startswith('Farmacist'),
 'infirmier': lambda s: s.startswith('Infirmier'),
 'psiholog': lambda s: s.startswith('Psiholog'),
 'kinetoterapeut': lambda s: s.lower().startswith('kinetoterapeut'),
 'fizioterapeut': lambda s: s.startswith('Fiziokinetoterapeut'),
 'biolog': lambda s: s.startswith('Biolog'),
 'chimist': lambda s: s.startswith('Chimist'),
 'electrician': lambda s: s.startswith('Electrician'),
 'instalator': lambda s: s.startswith('Instalator'),
 'asistent-social': lambda s: s.startswith('Asistent social'),
 'cercetator': lambda s: s.startswith('Cercetator stiintific'),
 'pompier': lambda s: s == 'Pompier',
}
result = []
for slug, matches in groups.items():
    selected = [(i+1,r) for i,r in enumerate(rows) if isinstance(r[0],str) and matches(r[0]) and isinstance(r[3],(int,float)) and r[3]>0 and not r[1]]
    if len(selected)<5: continue
    base = [r[3] for _,r in selected]
    total = [sum(v for v in r[3:21] if isinstance(v,(int,float))) for _,r in selected]
    result.append(dict(slug=slug, rows=len(selected), locator=f'Sheet1, rânduri {selected[0][0]}–{selected[-1][0]}, funcții fără conducere',
                       roles=sorted(set(r[0] for _,r in selected)), baseMin=min(base),baseMax=max(base),
                       componentsMin=min(total),componentsMax=max(total)))
payload=dict(source='SCJU Sfântul Apostol Andrei Constanța',url='https://www.spitalulconstanta.ro/wp-content/uploads/2026/03/Venituri_salariale-Martie_2026.xlsx',
             checkedAt='2026-09-07',period='martie 2026',unit='gross/month/RON',
             method='Intervalul rândurilor publicate pentru funcții de execuție. Baza este coloana D; suma componentelor lunare este D:U. Voucherele și indemnizația anuală de hrană V:W sunt excluse. Rândurile nu sunt identificate drept persoane distincte. Nu estimăm media națională.',records=result)
with open('src/data/transparenta-constanta.json','w',encoding='utf8') as f: json.dump(payload,f,ensure_ascii=False,indent=2);f.write('\n')
print('IMPORTED', [(r['slug'],r['rows']) for r in result])
