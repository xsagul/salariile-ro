# ROADMAP SEO ȘI CREȘTERE — 90 DE ZILE

- **Proiect:** salariile.ro
- **Versiune:** 1.1
- **Baseline fixat la:** 26 iulie 2026
- **Perioadă de execuție:** 27 iulie–24 octombrie 2026
- **Ultima zi completă disponibilă în GSC la baseline:** 24 iulie 2026

## 1. Regula de interpretare a baseline-ului

P0 a fost deployat după ultima zi disponibilă în Google Search Console, 24 iulie 2026. Prin urmare:

- datele din acest document descriu performanța de dinaintea P0;
- nu atribuim P0 niciun câștig și nicio pierdere din baseline;
- prima fereastră curată post-P0 este 27 iulie–2 august și poate fi citită în jurul datei de 4 august, în funcție de latența GSC;
- primul verdict orientativ despre P0 se poate formula după 14 zile complete;
- primul verdict suficient de robust pentru o decizie SEO se formulează după 28 de zile complete;
- excepțiile sunt defectele tehnice sau fiscale verificabile, care se corectează imediat.

GSC poate returna totaluri ușor diferite în funcție de dimensiunea cerută, filtrele de confidențialitate și anonimizarea query-urilor. Pentru controlul totalului folosim dimensiunea `device`, iar pentru comparațiile pagină-cu-pagină folosim aceeași dimensiune și același `rowLimit` în ambele perioade.

## 2. Verdict: nu facem un „mega update”

Site-ul nu este într-o scădere generală care să justifice rescrierea simultană a arhitecturii, metadatelor, conținutului și navigației. În ultimele 28 de zile complete a existat o creștere foarte mare față de intervalul precedent, urmată de un platou sănătos al impresiilor și de o mică îmbunătățire a clickurilor și poziției.

Un „mega update” ar elimina posibilitatea de atribuire: dacă traficul urcă sau scade, nu am ști ce schimbare a produs efectul. Ar crește și riscul de canibalizare sau reevaluare algoritmică exact când P0 abia începe să fie recitit.

Regula pentru aceste 90 de zile este:

1. o singură schimbare SEO majoră pe un cluster de URL-uri într-o fereastră de măsurare;
2. minimum 14 zile până la interpretarea direcției și 28 de zile până la decizia de păstrare sau revenire;
3. paginile noi sunt additive și au o intenție distinctă;
4. nu mutăm homepage-ul în același sprint cu un test de title, o reorganizare masivă de linkuri interne sau o extindere programatică;
5. nu schimbăm o pagină aflată în creștere doar pentru că o singură săptămână are CTR mai mic.

## 3. Baseline GSC

### 3.1. Total operațional

Intervalul curent este 27 iunie–24 iulie 2026.

| Citire | Clickuri | Impresii | CTR | Poziție medie operațională |
|---|---:|---:|---:|---:|
| Control proprietate, agregare pe device | 2.204 | 181.049 | 1,22% | aproximativ 7,8 |
| Export pe pagini, folosit la comparații | 2.208 | 183.259 | 1,20% | 7,78 |

Diferența de 4 clickuri și 2.210 impresii dintre cele două citiri este efectul normal al agregării GSC pe dimensiuni; nu este o eroare a site-ului.

### 3.2. Trend 28 zile versus 28 zile

Comparația pe aceeași dimensiune `page`:

| Interval | Clickuri | Impresii | CTR | Poziție |
|---|---:|---:|---:|---:|
| 30 mai–26 iunie | 439 | 36.738 | 1,19% | 9,15 |
| 27 iunie–24 iulie | 2.208 | 183.259 | 1,20% | 7,78 |
| Evoluție | **+403%** | **+399%** | **+0,01 pp** | **îmbunătățire 1,37 poziții** |

Concluzie: vizibilitatea a crescut de aproape cinci ori, dar CTR-ul agregat a rămas aproape neschimbat. Site-ul a câștigat distribuție în rezultate mai repede decât a câștigat clickuri per impresie.

### 3.3. Trend 14 zile versus 14 zile

| Interval | Clickuri | Impresii | CTR | Poziție |
|---|---:|---:|---:|---:|
| 27 iunie–10 iulie | 1.080 | 91.914 | 1,18% | 7,91 |
| 11–24 iulie | 1.128 | 91.345 | 1,23% | 7,64 |
| Evoluție | **+4,4%** | **-0,6%** | **+0,05 pp** | **îmbunătățire 0,27 poziții** |

Concluzie: acesta este un platou de impresii, nu o prăbușire. Clickurile și poziția s-au îmbunătățit ușor.

### 3.4. Top pagini în intervalul 27 iunie–24 iulie

| URL | Clickuri | Impresii | CTR | Poziție | Observație |
|---|---:|---:|---:|---:|---|
| `/` | 1.310 | 98.433 | 1,3% | 7,9 | Principalul motor de trafic; CTR generic mic |
| `/salariu-minim` | 264 | 39.050 | 0,7% | 7,7 | Cererea evenimentului din iulie începe să scadă |
| `/calculator/calcul-salariu-net-4325-brut` | 161 | 11.062 | 1,5% | 4,8 | Pagina programatică dominantă |
| `/salariu-mediu` | 107 | 7.038 | 1,5% | 7,5 | Breakout recent; nu se rescrie impulsiv |
| `/deducere-personala-2026` | 87 | 672 | 12,9% | 5,0 | CTR foarte sănătos; protejăm intenția |
| `/noutati/cosul-minim-de-consum` | 74 | 1.539 | 4,8% | 4,8 | Candidat bun de linkable asset |
| `/zile-lucratoare-2026` | 52 | 6.904 | 0,8% | 5,3 | Creștere rapidă, dar CTR slab |
| articolul despre salariul minim din iulie | 46 | 6.099 | 0,8% | 7,3 | Conținut dependent de eveniment |
| `/metodologie` | 39 | 2.312 | 1,7% | 6,2 | Semnal bun pentru transparență și încredere |
| `/fluturas-salariu` | 18 | 347 | 5,2% | 9,9 | Puține impresii pe query-ul exact |
| `/zile-libere-2026` | 4 | 1.863 | 0,2% | 9,9 | Necesită diferențiator util, nu doar text |
| `/calculator-pfa` | 2 | 1.690 | 0,1% | 46,8 | Acesta este baseline-ul pre-P0, nu efectul P0 |

### 3.5. Clusterul generic cu cel mai mare potențial imediat

Cele cinci interogări generice principale — `calculator salarii 2026`, `calculator salariu net`, `calculator salariu net 2026`, `salariu net` și `calcul salariu net` — au împreună:

- 33.872 impresii;
- 272 clickuri;
- CTR combinat de aproximativ 0,80%.

Scenarii matematice la același volum de impresii, nu prognoze garantate:

- la 1,5% CTR: aproximativ 508 clickuri, adică +236/28 zile;
- la 2,0% CTR: aproximativ 677 clickuri, adică +405/28 zile;
- la 3,0% CTR: aproximativ 1.016 clickuri, adică +744/28 zile.

## 4. Cauzele performanței actuale

### 4.1. Normalizarea interesului după evenimentul din iulie

În a doua jumătate a perioadei, homepage-ul a trecut de la 682 la 628 clickuri, iar `/salariu-minim` de la 172 la 92. În același timp, pagina de 4.325 lei, salariul mediu, deducerea personală și zilele lucrătoare au crescut. Modelul este compatibil cu scăderea interesului pentru evenimentul punctual, nu cu o penalizare la nivel de domeniu.

### 4.2. CTR mic pe query-uri generice

Site-ul apare frecvent pe pozițiile 6–10, dar primește sub 1% CTR pe unele interogări mari. Acesta este principalul levier cuantificabil pe termen scurt. Featured snippets sau alte elemente SERP pot contribui, dar fără monitorizare SERP dedicată rămân o ipoteză, nu o cauză demonstrată.

### 4.3. Autoritate și brand încă slabe

Interogarea de brand `salariile.ro` are numai 6 impresii și 2 clickuri în interval. Verificarea publică arată puține mențiuni relevante, iar Bing nu raportează backlinkuri. Bing nu este un index complet de linkuri, deci acest semnal se folosește numai orientativ.

### 4.4. Goluri clare de intenție

- Query-urile despre salariul minim în construcții produc aproximativ 4.194 impresii, dar nu au un URL dedicat.
- Competitorii au deja pagini 2027 pentru zile libere și zile lucrătoare.
- PFA nu acoperea suficient normă de venit, excepții, D212 și comparații; P0 trebuie măsurat înainte de următoarea extindere.
- Pagina de fluturaș are o propunere bună, dar vizibilitate redusă pe interogarea exactă.

### 4.5. Concentrare programatică excesivă

Din 38 de URL-uri salariale cu impresii, pagina pentru 4.325 lei produce aproximativ 66% din impresii și 82% din clickuri. Primele cinci pagini produc peste 90% din vizibilitate. Concluzia nu este „generăm fiecare valoare”, ci „extindem numai unde există cerere demonstrată și rezultat unic”.

## 5. Matrice competitor → intenție → URL → gap/decizie

Matricea este un instrument intern de poziționare. Numele competitorilor nu se introduc mecanic în paginile noastre. Îi menționăm public numai într-o comparație legitimă, neutră și susținută de date.

| Intenție / cluster | Competitori vizibili | URL proprietar salariile.ro | Gap observat | Decizie |
|---|---|---|---|---|
| Calculator salariu generic | Calculator-Salarii, InfoSalariu, eSalariu, NetDinBrut | `/` | CTR mic pe query-uri mari | Homepage-ul păstrează intenția în această etapă; un singur test de snippet |
| Calculator salariu minim | Calculator-Salarii, JobInfo, Folositor | `/` | Intenția tranzacțională se amestecă parțial cu cea informativă | Homepage pentru calcul; `/salariu-minim` pentru explicații |
| Informații salariu minim | JobInfo, Folositor, GhidSalariu și presa | `/salariu-minim` | Cerere dependentă de actualitate | Pagină evergreen, surse oficiale, actualizare la schimbarea legii |
| Salariu minim construcții | SalariuCalculator, Folositor | lipsește | Aproximativ 4.194 impresii existente fără owner dedicat | Pagină distinctă, bazată pe surse oficiale și exemple validate |
| Valori brut/net exacte | Calculator-Salarii | `/calculator/...` | Inventar mare la lider, dar cererea noastră este concentrată | Hub și allowlist; fără clonare per leu |
| PFA sistem real | SOLO, SimpluFisc, CalcProfit, PFAExpert | `/calculator-pfa` | Baseline foarte slab; P0 încă nemăsurat | Măsurăm P0; extindem doar după fereastra curată |
| PFA normă / CAEN / județ | SOLO, SimpluFisc, CatRămâi | lipsește sau incomplet | Utilitate importantă și date suplimentare necesare | V2 după validare fiscală și surse oficiale |
| PFA vs SRL vs CIM | SOLO, SimpluFisc, CatRămâi | lipsește | Comparator cu risc mare de concluzii greșite | Numai după model fiscal separat și scenarii explicite |
| Salariu mediu oficial | GhidSalariu, CalculatoareUșoare, presa economică | `/salariu-mediu` | Presa câștigă la prospețime | SLA 24–48h după INS; tabel, grafic și sursă |
| Deducere personală | Folositor, Accace și calculatoare salariale | `/deducere-personala-2026` | Pagina noastră are deja CTR puternic | Protejăm owner-ul; adăugări utile, fără rescriere totală |
| Zile lucrătoare | JobInfo și site-uri calendaristice | `/zile-lucratoare-2026` | CTR mic; unii competitori au date greșite, dar instrumente utile | Păstrăm acuratețea și adăugăm export/calendar |
| Zile libere și minivacanțe | ZileLibere.eu, LibereLegale | `/zile-libere-2026` | Competitorii au multi-an, ICS și utilitare | Pagini 2027 și import calendar, fără pagini subțiri |
| Fluturaș salariu | eSalariu, Fluturaș, CalculatoareUșoare | `/fluturas-salariu` | Autoritate și vizibilitate mică pe termenul exact | Diferențiator: fără CNP, verificare angajat, metodă validată D112 |
| Salarii pe ocupații | Undelucram, eJobs/Salario, Paylab | lipsește | Nu avem date proprietare la nivel de rol | Începem numai cu agregate INS/CAEN/județ și metodologie clară |
| Cost minim de consum | Presă și rapoarte sociale | `/noutati/cosul-minim-de-consum` | Bună poziție, dar distribuție externă mică | Transformare în asset citabil, cu tabel/grafic/date descărcabile |
| Metodologie / widget / date reutilizabile | Puțini competitori direcți | `/metodologie`, `/widget` | Potențial de citare insuficient exploatat | Changelog, versiuni, embed și explicații pentru jurnaliști/dezvoltatori |

Conținutul și structura competitorilor se verifică periodic pe paginile publice. Estimările Semrush sau ale altor platforme despre trafic și backlinkuri sunt date secundare, direcționale; nu sunt tratate drept Analytics-ul competitorilor și nu intră în KPI-urile noastre.

## 6. Ce livrăm azi în P1

P1 de azi combină remediile tehnice urgente cu adăugări care au intenție distinctă și pot fi măsurate separat:

- baseline pre-P0 fixat și documentat;
- upgrade Next.js 16.2.4 → 16.2.12 și dependențe de producție fără vulnerabilități raportate de `npm audit --omit=dev`;
- închiderea spațiului programatic arbitrar la un allowlist alimentat de GSC, plus linkuri între calculele validate;
- endpointul Markdown limitat la URL-urile publice cunoscute, origin controlat, timeout și plafon de răspuns;
- pagină dedicată salariului minim în construcții, cerută de aproximativ 4.197 impresii/28 zile;
- separarea intențiilor „zile libere” și „zile lucrătoare”, fără tabel lunar duplicat;
- corecții factuale/editoriale și eliminarea landmarkurilor `<main>` imbricate;
- owner clar pentru fiecare intenție principală;
- matrice de competiție și goluri de conținut;
- backlog prioritizat pe 90 de zile;
- protocol săptămânal de măsurare cu comenzi reproductibile și `npm run gsc:weekly`;
- praguri de păstrare, iterare și rollback;
- criterii pentru programmatic SEO și migrarea homepage-ului;
- checklist de pregătire AdSense, fără activare;
- briefuri de distribuție care rămân draft până la acordul proprietarului.

Nu livrăm azi:

- outreach, emailuri sau postări în numele proprietarului;
- activarea AdSense;
- o migrare de homepage;
- sute de pagini programatice;
- concluzii despre efectul P0 înainte de existența datelor post-deploy.

## 7. Sprinturi

### Zilele 1–7: 27 iulie–2 august

Obiectiv: stabilitate, indexare și instrumentare.

- Notăm data și ora deploy-ului P0 în jurnalul de măsurare.
- Verificăm URL-urile P0 cu URL Inspection; nu trimitem în masă URL-uri fără motiv.
- Verificăm sitemap, canonical, robots, SSR și build pentru paginile prioritare.
- Înghețăm timp de 14 zile rescrierile pe `/salariu-mediu`, `/deducere-personala-2026`, `/zile-lucratoare-2026` și pagina 4.325, exceptând erori factuale.
- Definim dashboard-ul pentru total, top pagini, query-uri generice, PFA, construcții, calendar și brand.
- Scriem briefurile pentru pagina dedicată construcții și paginile calendaristice 2027.
- Un test de title pe homepage poate începe numai dacă title-ul nu a fost schimbat de P0 și dacă este singura variabilă modificată pe acel cluster.
- Pregătim drafturi pentru distribuție pe Reddit, LinkedIn și DEV; nu publicăm și nu contactăm pe nimeni în numele proprietarului fără aprobare.

### Zilele 8–30: 3–25 august

Obiectiv: active additive și prima citire P0.

- Citire P0 la 14 zile și la 28 de zile, fără a confunda fluctuația inițială cu verdictul final.
- Măsurăm separat pagina dedicată salariului minim în construcții publicată în P1 și o iterăm numai după date.
- Publicăm `zile-libere-2027` și `zile-lucratoare-2027` cu valoare distinctă: ICS, import calendar, tabel lunar și metodologie.
- Adăugăm un hub browsabil pentru valorile salariale care au cerere GSC demonstrată.
- Pregătim PFA V2: normă de venit, CAEN/județ, excepții, venituri multiple, D212 și export/share.
- Comparatorul PFA/SRL/CIM rămâne în validare separată; nu reutilizăm presupuneri neverificate.
- Stabilim SLA de 24–48 de ore pentru fiecare comunicat salarial INS.
- Construim o listă internă de publicații și pagini care ar beneficia de datele noastre; orice outreach rămâne blocat până la aprobarea proprietarului.

### Zilele 31–60: 26 august–24 septembrie

Obiectiv: păstrăm numai experimentele dovedite și construim autoritate prin date.

- Evaluăm primul test de title după o fereastră completă de 28 de zile.
- Extindem programmatic numai valorile care trec pragurile din secțiunea 11.
- Lansăm sau extindem hub-ul de date oficiale: serii INS, CAEN/județ, tabel, CSV, grafic și embed.
- Adăugăm changelog și versiune metodologică pentru calculatoare și seturi de date.
- Pregătim un prim pachet de distribuție pentru activele care au demonstrat impresii și poziții.
- Outreach-ul editorial poate începe doar după aprobare explicită și numai către surse relevante HR, payroll, fiscalitate, presă economică sau drepturile angajaților.
- Excludem cumpărarea de linkuri, directoarele fără relevanță și schimburile artificiale.

### Zilele 61–90: 25 septembrie–24 octombrie

Obiectiv: scalare selectivă și decizii pe două ferestre de date.

- Pornim cel mult un nou test controlat pe clusterul cu cel mai mare potențial demonstrat.
- Repetăm actualizarea INS și distribuim numai activele care au câștigat deja tracțiune organică.
- Decidem dacă PFA justifică extensia spre normă, CAEN sau comparator complet.
- Decidem dacă salariile pe ocupații pot porni din date oficiale suficiente; nu publicăm mediane inventate.
- Evaluăm eligibilitatea pentru migrarea homepage-ului folosind gate-urile din secțiunea 12.
- Facem auditul de readiness AdSense, fără activare automată.
- Stabilim roadmap-ul următoarelor 90 de zile din date, nu din numărul de pagini publicate.

## 8. KPI base și stretch

Acestea sunt ținte de lucru, nu promisiuni garantate. Schimbările de cerere, SERP și algoritm nu sunt controlabile.

| Moment | KPI base | KPI stretch |
|---|---|---|
| Baseline | 2.204 clickuri, 181.049 impresii, CTR 1,22% / 28 zile | — |
| Ziua 30 | P0 recrawl-uit; cluster generic la 1,1–1,3% CTR; două active additive indexate sau gata de indexare | Pagina construcții intră în top 20; PFA arată o îmbunătățire clară de impresii/poziție |
| Ziua 60 | 3.500 clickuri / 28 zile; poziție mediană cel mult 6 pe clusterul generic; PFA către top 30–35 | 5.000 clickuri / 28 zile; minimum 5 domenii editoriale relevante noi, dacă distribuția a fost aprobată |
| Ziua 90 | 5.000 clickuri / 28 zile; CTR generic 1,5%; construcții top 10–15; 10 domenii relevante noi | 8.000 clickuri / 28 zile; CTR generic 2%; construcții top 5–10; PFA top 20; 20 domenii relevante noi |

Pentru backlinkuri urmărim relevanța, pagina care trimite, contextul editorial și traficul potențial, nu doar numărul brut.

## 9. Praguri de decizie și rollback

| Schimbare | Păstrăm | Iterăm | Rollback / consolidare |
|---|---|---|---|
| P0 pe PFA | După 28 zile: impresii sau poziție în îmbunătățire, fără regresie fiscală/tehnică | Indexat, dar fără progres după 28 zile: intenție, snippet și linkuri interne | Imediat pentru eroare fiscală, canonical greșit, noindex, 5xx sau calcul incorect; nu pentru volatilitate de 7 zile |
| Test title/meta | CTR relativ +15% sau mai mult, cu poziția degradată cu cel mult 0,5 | Rezultat între -15% și +15% după 28 zile | CTR relativ -15% sau mai rău, cu impresii comparabile și fără schimbare majoră de cerere; revenire la varianta documentată |
| Pagină nouă | Indexată în maximum 14 zile și acumulează minimum 100 impresii/28 zile ori obține utilitate/link editorial clar | Top 20 cu impresii în creștere: îmbunătățim răspunsul și snippet-ul | După 90 zile, sub 20 impresii și fără utilitate, linkuri sau intenție distinctă: review pentru merge/noindex; nu automat |
| Canibalizare | Un URL deține peste 70% din impresiile clusterului | Două URL-uri împart cererea, dar clickurile combinate cresc | Două URL-uri au fiecare peste 20% din impresii, iar clickurile combinate scad cu peste 15% față de 28 zile anterioare: consolidăm owner-ul |
| UI / reclamă experimentală | CWV p75 rămâne în zona bună | Mică degradare fără impact de trafic sau venit: optimizăm sloturile | Rollback dacă schimbarea produce CLS peste 0,1, LCP peste 2,5 s sau INP peste 200 ms la p75 și regresia este atribuibilă schimbării |
| Migrare homepage | Clusterul principal păstrează minimum 85% din clickurile baseline la 28 zile și tinde spre 95% la 56 zile | Între 70–85% la 28 zile, fără probleme tehnice: mai măsurăm și întărim linkurile | Defectele tehnice se repară imediat; rollback de arhitectură numai după diagnostic, nu în primele zile de reevaluare |

Poziția medie nu se folosește singură. O decizie cere minimum clickuri, impresii, CTR, poziție, query-owner și verificarea sezonalității.

## 10. Calendar săptămânal de măsurare

Măsurarea se face în fiecare marți, folosind ultima duminică pentru care GSC are date complete. Dacă GSC are întârziere, nu completăm artificial săptămâna; mutăm citirea cu o zi.

| Citire | Data estimată | Fereastră completă | Decizie permisă |
|---|---|---|---|
| W0 | 26 iulie | 27 iunie–24 iulie | Fixare baseline pre-P0 |
| W1 | 4 august | 27 iulie–2 august | Numai indexare și defecte tehnice |
| W2 | 11 august | 3–9 august | Direcție preliminară, fără verdict P0 |
| W3 | 18 august | 10–16 august | Verificare consistență 14+ zile |
| W4 | 25 august | 17–23 august; plus 27 iulie–23 august | Primul verdict P0 la 28 zile |
| W5 | 1 septembrie | 24–30 august | Confirmare sau anomalie |
| W6 | 8 septembrie | 31 august–6 septembrie | Analiză pe clustere |
| W7 | 15 septembrie | 7–13 septembrie | Verificare active noi |
| W8 | 22 septembrie | 14–20 septembrie; plus 24 august–20 septembrie | A doua fereastră completă de 28 zile |
| W9 | 29 septembrie | 21–27 septembrie | Confirmare trend |
| W10 | 6 octombrie | 28 septembrie–4 octombrie | Analiză seasonal/query mix |
| W11 | 13 octombrie | 5–11 octombrie | Pregătire decizii ziua 90 |
| W12 | 20 octombrie | 12–18 octombrie | Confirmare KPI |
| W13 | 26–27 octombrie | 18–24 octombrie | Închidere roadmap 90 zile |

### Comenzile exacte pentru reproducerea baseline-ului

```powershell
npm run gsc -- devices --start=2026-06-27 --end=2026-07-24 --limit=10
npm run gsc -- pages --start=2026-06-27 --end=2026-07-24 --limit=1000
npm run gsc -- queries --start=2026-06-27 --end=2026-07-24 --limit=1000
npm run gsc -- devices --start=2026-05-30 --end=2026-06-26 --limit=10
npm run gsc -- pages --start=2026-05-30 --end=2026-06-26 --limit=1000
npm run gsc -- queries --start=2026-05-30 --end=2026-06-26 --limit=1000
```

### Prima fereastră curată post-P0

```powershell
npm run gsc -- dates --start=2026-07-27 --end=2026-08-02 --limit=100
npm run gsc -- devices --start=2026-07-27 --end=2026-08-02 --limit=10
npm run gsc -- pages --start=2026-07-27 --end=2026-08-02 --limit=1000
npm run gsc -- queries --start=2026-07-27 --end=2026-08-02 --limit=1000
npm run gsc -- queries --page=/calculator-pfa --start=2026-07-27 --end=2026-08-02 --limit=1000
npm run gsc -- opportunities --start=2026-07-27 --end=2026-08-02 --min=4 --max=20 --limit=100
```

### Setul săptămânal standard

În comenzile de mai jos, `START` și `END` se înlocuiesc cu intervalul exact din calendarul W1–W13.

```powershell
npm run gsc:weekly
npm run gsc -- dates --start=START --end=END --limit=100
npm run gsc -- devices --start=START --end=END --limit=10
npm run gsc -- pages --start=START --end=END --limit=1000
npm run gsc -- queries --start=START --end=END --limit=1000
npm run gsc -- queries --page=/calculator-pfa --start=START --end=END --limit=1000
npm run gsc -- queries --page=/salariu-mediu --start=START --end=END --limit=1000
npm run gsc -- queries --query="calculator salariu" --start=START --end=END --limit=1000
npm run gsc -- queries --query="constructii" --start=START --end=END --limit=1000
npm run gsc -- queries --query="zile lucratoare" --start=START --end=END --limit=1000
npm run gsc -- opportunities --start=START --end=END --min=4 --max=20 --limit=100
```

### Verificări de indexare și infrastructură

```powershell
npm run gsc -- inspect /calculator-pfa
npm run gsc -- inspect /salariu-mediu
npm run gsc -- inspect /zile-lucratoare-2026
npm run gsc -- sitemaps
```

`inspect` verifică starea cunoscută de Google; nu garantează poziție și nu înlocuiește fereastra Search Analytics.

## 11. Criterii pentru extinderea programmatică

Nu publicăm automat o pagină pentru fiecare sumă brută sau netă. Un URL programatic nou trebuie să treacă toate condițiile de calitate și cel puțin una dintre condițiile de cerere.

### Condiții de cerere

Cel puțin una:

- query-ul sau suma are minimum 100 impresii în ultimele 28 de zile în GSC;
- o pagină existentă primește deja minimum 100 impresii din acel subiect, dar răspunde imperfect intenției;
- există un eveniment fiscal oficial cu cerere previzibilă și termen clar;
- cercetarea publică arată o intenție distinctă, nu doar o variație lexicală.

### Condiții obligatorii de calitate

- rezultat de calcul unic și verificabil;
- explicație fiscală adaptată sumei sau scenariului, nu text duplicat;
- SSR, self-canonical, title și H1 distincte;
- loc clar într-un hub și linkuri interne utile;
- zero conflict cu owner-ul existent al intenției;
- surse și perioadă fiscală vizibile;
- batch inițial de maximum 10 URL-uri, urmat de 60–90 zile de măsurare.

### Reguli de continuare

- extindem modelele care ajung în top 20 și cresc în impresii;
- îmbunătățim snippet-ul celor cu poziție bună și CTR slab;
- analizăm merge/noindex după 90 de zile pentru pagini cu sub 20 impresii, fără linkuri și fără utilitate distinctă;
- nu eliminăm automat pagini doar pentru că nu au clickuri într-o singură lună;
- nu folosim totalul de URL-uri drept KPI.

## 12. Gate pentru migrarea homepage-ului

Migrarea calculatorului de pe homepage nu începe până când toate condițiile sunt îndeplinite:

1. există minimum 56 de zile complete post-P0 și două ferestre comparabile de 28 de zile;
2. valul evenimentului salariului minim din iulie este separat în date de trendul evergreen;
3. nu există un eveniment fiscal major în următoarele șase săptămâni;
4. query-urile tranzacționale și informative au owner clar și nu există canibalizare nerezolvată;
5. destinația calculatorului este SSR, testată, rapidă și are canonical, schema și linkuri interne corecte;
6. există inventar complet de URL-uri, plan de redirect/canonical și verificare sitemap;
7. avem baseline separat pentru clickurile homepage-ului provenite din clusterul de calculator;
8. migrarea este singura schimbare majoră a acelui sprint;
9. există un plan de remediere tehnică și un punct de decizie după 28 și 56 de zile.

Pragul operațional de succes este minimum 85% din clickurile baseline ale clusterului la 28 de zile și tendință spre minimum 95% la 56 de zile. Nu facem rollback în primele zile doar din cauza reevaluării normale; remediem imediat numai erorile tehnice verificabile.

## 13. Distribuție și autoritate externă

Distribuția urmărește active utile și citabile, nu linkuri artificiale.

Active prioritare:

- calculator PFA validat și metodologia aferentă;
- pagina dedicată salariului minim în construcții;
- calendarele 2027 cu ICS/import;
- seria lunară INS cu CSV/grafic/embed;
- coșul minim de consum ca set de date reutilizabil;
- fluturașul salarial fără colectare de CNP și cu explicație D112;
- widget și metodologie versionată.

Canalele existente sunt Reddit, LinkedIn, DEV și GitHub. Pentru fiecare activ pregătim:

- un rezumat factual;
- o imagine/grafic;
- link către metodologie și sursa oficială;
- un unghi adaptat comunității;
- răspunsuri la întrebările probabile.

În aceste 90 de zile, Codex poate pregăti drafturi și liste de oportunități. Nu trimite emailuri, mesaje, comentarii și nu publică în numele proprietarului fără aprobare explicită. Nu cumpărăm linkuri și nu facem schimburi artificiale.

## 14. AdSense readiness — fără activare azi

AdSense nu este o tactică de creștere a traficului. Activarea înainte de măsurarea traficului, consimțământului și impactului asupra UX poate reduce performanța și încrederea.

### Gate de conformitate și produs

- CMP compatibilă cu cerințele Google aplicabile în EEA, Regatul Unit și Elveția la data activării;
- consent flow verificat pentru reclame și măsurare, inclusiv retragerea consimțământului;
- pagini actualizate de confidențialitate și cookie-uri;
- verificarea politicilor AdSense, conținutului, traficului invalid și `ads.txt`;
- separare vizuală clară între conținut/calculator și reclamă;
- fără colectarea inutilă de date personale în calculatoare.

### Gate de performanță

- sloturi rezervate dimensional pentru a evita layout shift;
- CLS p75 cel mult 0,1;
- LCP p75 cel mult 2,5 secunde;
- INP p75 cel mult 200 ms;
- test pe un subset de pagini, nu activare simultană pe tot site-ul;
- comparație înainte/după pentru trafic organic, engagement și revenire.

### Gate economic

- minimum opt săptămâni de pageviews și sesiuni măsurate coerent;
- distribuție geografică și device cunoscute;
- RPM măsurat într-un experiment limitat, nu preluat din articole sau estimat optimist;
- venitul net estimat trebuie să acopere costurile vizate și un buffer operațional, fără degradarea KPI SEO/UX;
- decizia finală se ia după verificarea CMP și a politicilor curente Google.

Astăzi facem doar checklist-ul și proiectarea sloturilor. Nu activăm AdSense.

## 15. Surse și date disponibile

### Surse primare utilizabile azi

- Google Search Console prin `scripts/gsc.mjs`: query, pagină, dată, țară, device, search appearance, sitemap și URL Inspection;
- legislația oficială din [legislatie.just.ro](https://legislatie.just.ro/);
- formulare, instrucțiuni și materiale ANAF, inclusiv D112;
- INS și Tempo Online pentru serii lunare, CAEN și județe;
- Codul fiscal și Codul muncii în forma în vigoare;
- datele și testele fiscale versionate în repository;
- Bing Webmaster ca semnal secundar de query și indexare.

### Surse secundare

- paginile publice ale competitorilor și rezultatele SERP;
- Semrush și instrumente similare numai pentru ordine de mărime și descoperire, nu ca adevăr despre traficul competitorilor;
- presă economică, doar ca punct de descoperire; cifra finală se verifică în sursa oficială.

### Date care lipsesc sau nu au fost încă integrate în decizii

- export/retention suficient din Vercel Analytics pentru landing pages, surse, engagement și revenire; proiectul nu folosește Google Analytics;
- un index profesionist complet de domenii referente și linkuri pierdute/câștigate;
- monitorizare zilnică a feature-urilor SERP și a snippet-urilor afișate;
- date proprietare sau licențiate pentru salarii pe ocupație;
- măsurarea brandului în afara GSC;
- pageviews, sesiuni și RPM necesare modelului AdSense;
- validarea CMP și juridică la momentul activării reclamelor;
- rezultate post-P0, care nu există încă în baseline.

## 16. Riscuri și limite

- Nicio poziție, creștere sau valoare de trafic nu este garantată.
- GSC are latență, anonimizare și diferențe de agregare.
- Cererea pentru salariu minim, zile lucrătoare și modificări fiscale este sezonieră.
- Un competitor cu autoritate poate păstra poziția chiar dacă are conținut mai slab sau mai vechi.
- Backlinkurile editoriale și cererea de brand necesită de regulă 8–12 săptămâni sau mai mult.
- Reindexarea și reevaluarea unei pagini pot dura 2–6 săptămâni.
- Comparatorii fiscali trebuie validați separat pe fiecare regim; nu extrapolăm validarea D112 la scenarii PFA/SRL care nu au fost testate.

## 17. Jurnal de versiuni

| Versiune | Data | Schimbare |
|---|---|---|
| 1.0 | 26 iulie 2026 | Baseline pre-P0, matrice competițională, sprinturi, KPI, praguri, protocol GSC, gate programmatic/homepage și AdSense readiness |
| 1.1 | 26 iulie 2026 | Lot P1 implementat: securitate, allowlist programmatic, pagina construcții, separare de intenții, dashboard GSC și corecții editoriale |
