# Subiecte noi din SE Ranking, 26 septembrie 2026

Scopul este să găsim familii de căutări la care nu ne-am gândit și pe care site-ul le poate
satisface. Nu am pornit nici de la paginile noastre, nici de la concurenți.

**Metoda.** Am căutat în baza RO semințe largi: calculator, concediu, impozit, pensie,
indemnizatie, somaj, demisie, contract de munca, tichete de masa. Am păstrat doar ce
ține de muncă, salariu și fiscalitate și unde răspunsul se poate verifica din lege. La
final am comparat rezultatele cu cuvintele pentru care salariile.ro apare deja
(`getDomainKeywords`, 500 de rânduri). Niciunul dintre subiectele de mai jos nu apare
acolo.

Volumele sunt estimări SE Ranking de căutări lunare, nu clicuri. KD înseamnă dificultatea.

## Familiile găsite

| Familie | Cuvinte principale (volum, KD) | Ce ar fi pagina | Legătura cu ce avem |
|---|---|---|---|
| **Concediu medical: cât primești** | concediu medical 18.100 (92); calcul concediu medical 540 (5); concediu medical 75 din brut sau net 480 (6); formula calcul concediu medical 390 (5); cod indemnizatie concediu medical 320; cod 01 / 06 câte 590 | calculator indemnizație concediu medical | pornește de la brutul din calculator |
| **Maternitate și creștere copil** | indemnizatie crestere copil 8.000 (63, urcă în septembrie); concediu prenatal 1.900; cat e indemnizatie crestere copil 590 (7); calcul concediu prenatal 480 (5); concediu prenatal calcul / calculator 390 + 390; calculator concediu maternitate 320 (9); venituri luate in calcul ICC 320 | calculator ICC + prenatal/postnatal | pornește de la venitul net și brut |
| **Demisie** | cerere demisie 5.700 (55); model demisie 1.300; cerere de demisie 1.100; demisie fara preaviz 810 (10); fara preaviz pdf / art 81 alin 7 câte 590; preaviz 15 zile lucratoare sau calendaristice 480 (6); la zi 390 | model de cerere de demisie, cu și fără preaviz | nu avem calculator de preaviz; poate intra în aceeași pagină |
| **Concediu de odihnă** | cerere concediu 3.600 (49); cerere concediu de odihna 720 (6); cate zile de concediu ai pe luna 590; calcul concediu de odihna neefectuat la incetare 590 (7); calculator / calcul zile concediu 480 + 480; calcul concediu de odihna 390 | calculator zile și indemnizație de concediu + model de cerere | Codul muncii e deja în `research/` |
| **Pensie** | calculator pensie 4.400 (53); calcul pensie 3.200 (59); anticipată cu penalizare 590 (17); program calcul pensie 590; calculator pensie de stat 590; câte puncte de pensie am 390 | calculator de pensie după Legea 360/2023 | CAS 25% din salariu; e complex |
| **Impozitul pe pensie** | impozit pensie 590 (8); impozitare pensie 590; calculator impozit pensie 480 (5) | calculator net pensie | fiscal, simplu |
| **Vechime** | calculator vechime 2.900 (59); calcul vechime in munca 590 (17); pentru pensie 390 | calculator de vechime în muncă | simplu |
| **TVA** | calculator tva 18.100 (54); calcul tva 6.600 (42); tva dintr-o suma 480 | calculator TVA | fiscal, dar departe de salariu; concurență multă |

## Ce s-a exclus și de ce

- **Cumul pensie salariu** (5.700, urcat de la 270 în 12 luni) vine din știrile despre un proiect.
  Pe site publicăm numai legislație în vigoare.
- **Taxe și impozite locale, pensii private, credite și RCA**: intenție locală sau comercială,
  fără legătură cu ce oferim.
- **Impozit dividende** (720 + 590, KD 7–8): pentru subiectul acesta avem deja
  `/calculator-dividende`, dar pagina nu apare pentru acest cuvânt. E o problemă de
  optimizare a paginii existente, nu o pagină nouă.
Lista completă, cu volum și dificultate: `research/seranking-2026-09-26-cuvinte.csv`.
