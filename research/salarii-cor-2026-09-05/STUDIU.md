# Salariile.ro — baza de date salarială pe ocupații COR

Studiu de fezabilitate, metodologie de publicare și proiect de sistem. Verificare: **5 septembrie 2026**.

**Recomandarea este să construim un sistem de dovezi salariale pe ocupație, alimentat în primul rând de angajatori și date de salarizare, cu salariile oferite în anunțuri într-o serie separată.** INS și Eurostat rămân utile pentru control și context. Un API comercial bazat pe regresie poate extinde acoperirea, dar nu transformă automat estimările în salarii observate.

Obiectivul „toate meseriile COR” trebuie împărțit în două: catalog complet al ocupațiilor și acoperire salarială demonstrabilă pentru fiecare ocupație. Primul poate fi construit și versionat. Al doilea necesită date, drepturi și eșantioane suficiente; nu poate fi obținut corect prin multiplicarea mediilor de sector.

Nu solicităm salarii de la vizitatorii Salariile.ro. Nu am cumpărat licențe, trimis cereri către instituții sau modificat paginile publice în cadrul acestui studiu. Am pregătit cererile ca documente locale și am construit fișierele de verificare.

## 1. Ce am verificat efectiv

Inventarul detaliat se află în [REGISTRU-SURSE.md](REGISTRU-SURSE.md): 30 fișe principale și opt familii de piste suplimentare, cu granularitate, fișiere/API-uri, limite și drepturi.

Am descărcat și analizat nomenclatorul COR, specificația Paylab, două tabele SES 2022 pentru România, metadatele Eurostat, extrasele ILOSTAT pentru medie și mediană, raportul eJobs și un fișier salarial public UAUIM. Am verificat pagina DevJob în browserul care execută JavaScript. Am citit legislația relevantă și publicația INS despre structura câștigurilor salariale.

Am păstrat separat:

- dovezile HTTP și hash-urile fișierelor, în `raw/*manifest.json`;
- catalogul COR din 2024 și comparația cu cele 126 pagini existente;
- structura reală a API-ului Paylab;
- rezultatele testelor de granularitate a tabelelor;
- exemple salariale punctuale, cu concept și limită, în `exemple-dovezi.json`;
- modelul de date și regulile de acceptare, în `ARHITECTURA.md`.

**Limite concrete ale verificării:** pagina INS a avut o eroare de certificat în clientul de descărcare; Excel-urile anexei SES nu au fost obținute; unele anunțuri ANOFM indexate au dispărut; nu am primit loturi comerciale RO. Acestea sunt marcate ca neconfirmate, fără valori înlocuitoare inventate.

## 2. Unde este oportunitatea reală

| Strat | Ce răspunde utilizatorului | Sursa preferată | Ce putem afirma |
|---|---|---|---|
| Venit realizat | „Cât se plătește efectiv?” | Payroll / angajatori / anchete salariale documentate | Distribuția din cohorta observată; reprezentativitatea națională trebuie justificată separat |
| Salariu contractual de bază | „Ce salarii sunt în contracte?” | Agregate REGES autorizate | Distribuția bazelor contractuale, cu normă și dată, fără a o numi salariu total încasat |
| Salariu oferit | „Ce oferă angajatorii acum?” | Anunțuri originale și feeduri licențiate | Intervalele și punctele din oferte, pentru perioada și locurile respective |
| Reper normativ / instituțional | „Ce grilă se aplică aici?” | Liste publice, lege, contract colectiv | Valoarea aferentă funcției și condițiilor, nu o mediană a tuturor angajaților |
| Rezultat modelat | „Ce estimează un model pentru acest profil?” | Furnizor cu metodologie / model propriu validat | Estimare explicită, separat de observații și de `n` real |

Avantajul competitiv este trasabilitatea: o cifră trebuie să poată fi urmărită până la sursă, perioadă, definiție, ocupație și metodă. Un număr cu multe zecimale sau un interval îngust nu dovedește precizie.

„Cea mai exactă bază din România” rămâne un obiectiv de validat. Îl putem susține public numai după evaluări independente, pe date de plată care nu au intrat în construcția rezultatului, și după compararea cu alternativele pe aceleași definiții.

## 3. Ce pot și ce nu pot furniza instituțiile

### INS / TEMPO

FOM121A este o sursă reală pentru intersecția dintre activitatea angajatorului și grupa ocupațională. Totuși, o grupă majoră nu identifică un instalator, un zugrav sau un electrician. La fel, media CAEN a construcțiilor poate include meserii și niveluri ierarhice diferite. [Catalog TEMPO](https://statistici.insse.ro/tempoins/?context=15&lang=ro&page=tempo2).

Am verificat suplimentar publicația INS „Disparități salariale — factori de influență, 2022”. Secțiunea despre ocupații prezintă grupe majore; anexele Excel sunt anunțate, dar nu au fost livrate prin pagina accesibilă. Publicația precizează folosirea colectării directe împreună cu REGES, D112 și estimarea unor indicatori. Prin urmare, „oficial” nu înseamnă că fiecare valoare rezultată este o observație individuală neimputată. [Publicația INS, copie a documentului original](https://cdn.edupedu.ro/wp-content/uploads/2024/09/disparitati_salariale_factori_de_influenta_in_anul_2022.pdf).

Pista care merită urmărită este **tabularea specială**, deoarece documentația națională SES descrie codificarea ocupațiilor colectate la patru cifre ISCO. Trebuie confirmate disponibilitatea, precizia și drepturile pentru tabelul solicitat. Nu rezultă de aici că INS ne poate livra automat toate COR6 × județ × experiență. [Raportul de calitate SES România](https://ec.europa.eu/eurostat/cache/metadata/en/earn_ses2022_esqrs_ro.htm).

### Eurostat / ILOSTAT

Am testat datele, nu doar titlurile. `earn_ses22_21` conține efectiv pentru România media de **4.781 lei brut lunar** pentru grupa ISCO 7 în SES 2022, cu întreprinderi de minimum 10 angajați și sfera economică definită de tabel. Aceasta este o demonstrație a limitei: cifra nu poate deveni „salariul zugravului în 2026”. Interogarea exactă este în [ANEXA-API.md](ANEXA-API.md).

ILOSTAT oferă pentru RO medie și mediană, dar codurile ocupaționale identificate în extrase sunt tot grupe de o cifră și agregate de competență. Numărul de rânduri ale unui API nu este eșantionul salarial. INS, Eurostat și ILO pot disemina aceeași informație de origine; nu sunt automat trei confirmări independente. [Tabelul Eurostat verificat](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/earn_ses22_21?geo=RO&lang=EN), [mediana ILOSTAT verificată](https://rplumber.ilo.org/data/indicator/?id=EAR_EMTM_SEX_OCU_NB_A&ref_area=ROU).

### REGES și payroll

REGES este pista cu cea mai bună potrivire structurală pentru COR6 și salariul contractual. Cererea noastră trebuie să solicite agregate, nu acces la contractele personale ale populației. Pentru salariul efectiv plătit avem nevoie de date de salarizare compatibile sau de o tabulare realizată legal de deținător. Nu presupunem că accesul Sorin la un cont de angajator oferă drepturi asupra întregii baze naționale. [HG 295/2025](https://legislatie.just.ro/Public/DetaliiDocumentAfis/295995).

O distribuție contractuală completă poate rata bonusuri, concedii, ore suplimentare și munca informală. O distribuție payroll poate rata microîntreprinderile care nu participă. Aceste diferențe trebuie descrise, nu ascunse într-o medie comună.

## 4. Sursele comerciale: alegerea potrivită scopului

Pentru nucleul de acuratețe, aș evalua întâi un partener de payroll și PwC PayWell, apoi Mercer / WTW / Aon pe baza unui lot demonstrativ pentru România. Alegerea se face pe acoperirea meseriilor și drepturile de publicare, nu pe numărul de țări din broșură. PwC confirmă public un eșantion mare de angajați în România; exportul concret și licența editorială trebuie negociate. [PayWell România](https://www.pwc.ro/ro/Store/Studiul_salarial_si_de_beneficii_PayWell.html).

Paylab este o opțiune tehnică rapidă pentru repere pe rol. Am verificat că schema are indicator de model, număr și calitate, dar modelarea și lipsa intersecției regiune × experiență sunt limite importante. Oferta trebuie să explice exact populația din `count` și ce rezultate putem publica. [Specificația Paylab](https://api.swaggerhub.com/apis/Profesia/PaylabPublicApi/1.2).

Pentru ofertele actuale, alegerea se face între feeduri directe ale platformelor românești, angajatori și un agregator licențiat precum Lightcast. Un feed amplu cu puține salarii publicate poate fi mai puțin valoros decât un partener mic cu intervale clare și angajatori reali. Hays, Salario, Undelucram și sondajele externe sunt utile ca repere atribuite și pentru verificări, cu limitele fiecărui produs.

| Opțiune | Cost indicativ confirmat pe pagina produsului | Ce nu este inclus automat |
|---|---|---|
| Paylab Advanced, 12 luni | 491 × 12 = **5.892 EUR**, înainte de taxe / depășiri | Drept editorial, volum final, acoperirea tuturor COR, observații empirice, intersecții |
| Paylab Full, 12 luni | 860 × 12 = **10.320 EUR**, înainte de taxe / depășiri | Regiune × experiență combinat; documentația îl exclude |
| PayWell, neparticipant | De la **3.300 EUR + TVA**, conform paginii | Durata exactă, modulele, API și republicarea pe Salariile.ro necesită ofertă |
| Payroll / REGES / INS tabulare / alte survey-uri | Fără ofertă verificată | Nu inventăm prețuri, termene de livrare sau drepturi |

Sumele Paylab sunt calcule ale costului anual pe baza tarifelor afișate, nu angajamente de cumpărare. Nu aș cumpăra un abonament înainte de a primi matricea de acoperire și clauza care permite utilizarea publică dorită. [Prețuri Paylab](https://www.paylab.com/paylab-api?lang=en).

## 5. Pilotul: ce probe salariale avem deja

| Probă | Valoare citită | Ce dovedește | Ce NU rezultă |
|---|---|---|---|
| Salario, contabil, date 2025 | Medie publicată 5.000 lei net/lună | Există benchmark extern pentru titlul „contabil” | Mediană, quartile, `n`, experiență sau COR exact |
| UAUIM, contabil șef, martie 2026 | Bază publicată 10.115 lei | Există o valoare salarială instituțională verificabilă pentru funcția respectivă | Salariul contabilului obișnuit, net încasat sau distribuție națională |
| DevJob, Software Developer, pagina verificată la 05.09.2026 | Statisticile publicate: mediană 12.000; P25–P75 8.800–17.000 RON net/lună | Există intervale de oferte IT agregate de platformă | Distribuția salariilor efectiv plătite; `n` exact al celulei |

Surse: [Salario, p. 54](https://www.ejobs.ro/static/resurse/Review_and_Trends_2026.pdf), [UAUIM, XLSX](https://www.uauim.ro/universitatea/personal/2025-2026/Transparenta%20veniturilor%20salariale%20cf.%20L153-2017%20martie%202026.xlsx), [DevJob](https://devjob.ro/en/salaries).

Aceste exemple rămân **probe de fezabilitate și repere atribuite**, nu trei rânduri compatibile de introdus într-o medie. Pentru instalator, zugrav și zidar nu am în acest pilot un eșantion actual, licențiat, de salarii plătite care să justifice publicarea tuturor statisticilor cerute.

## 6. Corectitudinea COR: prima condiție a preciziei

Comparația cu fotografia oficială din aprilie 2024 a găsit: **126 pagini**, **24 fără COR**, **9 coduri care nu apar în acel fișier** și **3 coduri refolosite pe mai multe pagini**. Cele nouă absențe nu dovedesc singure invaliditatea în 2026; trebuie verificate actele ulterioare. Diferențele de denumire sunt candidate la revizuire, nu se corectează toate prin potrivire aproximativă de text.

| Pagina actuală | COR folosit | Denumirea din fișierul oficial verificat | Intervenție necesară |
|---|---|---|---|
| Programator | 251201 | analist | „programator” este 251202 în fotografie; revizie documentată |
| Web developer | 251401 | specialist în domeniul proiectării asistate pe calculator | Nu echivalăm denumirea engleză cu un cod doar după structură |
| Contabil | 241102 | expert contabil-verificator | Distincție de „contabil”, 331302; calificarea și atribuțiile contează |
| Avocat | 261103 | consilier juridic | „avocat” este 261101 în fotografie |
| Instalator | 712601 | detector pierderi apă și gaze | Alegere după specializare: sanitar, gaze, termic etc. |
| Zugrav | 713101 | tapetar | „zugrav” este 713102 în fotografie |
| Zidar | 711204 | zidar șamotor | Pagina generică nu trebuie limitată accidental la șamotor |
| Electrician | 741101 | electrician în construcții | Este o specializare reală, dar nu cuprinde orice electrician |

Datele și toate rândurile sunt în [audit-cor-pagini.json](audit-cor-pagini.json), derivat din [nomenclatorul oficial](https://data.gov.ro/api/3/action/package_show?id=clasificarea-ocupatiilor-din-romania). Amendamentul din martie 2026 include mutări și eliminări, deci versiunea nomenclatorului este obligatorie. [Ordinul 66/51/2026](https://legislatie.just.ro/Public/DetaliiDocument/308425).

Trebuie să existe două obiecte diferite: **ocupație COR** și **rol căutat de utilizator**. „Web developer”, „contabil” sau „electrician” pot avea mapări unu-la-mai-multe. O pagină umbrelă poate include specializări, dar distribuția comună este validă doar dacă definim explicit populația și evităm dubla numărare.

Nu distribuim salariul unui ISCO4 identic tuturor codurilor COR6 din interior. Nu mapăm automat un anunț la primul COR cu același prefix. Un model lingvistic poate propune candidați din atribuții și competențe, însă maparea incertă intră în revizuire, nu în agregatul public.

## 7. Metodologia statistică propusă

### 7.1. Definim întâi cifra pe care vrem să o estimăm

Indicatorul principal propus: salariu lunar brut realizat, pentru angajați cu normă întreagă, ocupație validată și perioadă de plată completă, în România. Publicăm netul direct observat numai când sursa îl definește și îl măsoară corespunzător. Putem oferi separat o conversie fiscală ilustrativă, cu profilul și regulile datate.

Pentru comparații de carieră, utilizatorul trebuie să poată selecta aceeași definiție, regiune și experiență la ambele ocupații. Salariul dintr-un contract de muncă nu este comparabil direct cu încasările unui PFA, cifra de afaceri a unei firme sau tariful de manoperă al unui meseriaș. Pentru independenți ar fi necesar un produs distinct: venit, cheltuieli, timp nefacturabil și profit.

Pe lângă salariul total, păstrăm baza, bonusurile regulate, bonusurile anuale, orele suplimentare, tichetele, indemnizațiile și acțiunile ca componente separate. Compararea bazei cu total cash fără etichetă produce erori sistematice.

### 7.2. Normalizare și calendar

O observație păstrează suma originală, moneda, periodicitatea, perioada de referință, norma și sursa. Conversia în RON se face cu cursul și data documentate, adecvate perioadei măsurate. „PPS” nu este o monedă în care se plătește salariul.

Împărțirea unui brut anual la 12 produce un echivalent lunar anual, care poate include prime. Nu îl combinăm cu baza lunară de octombrie. Convertirea unui salariu orar în lunar cere orele aferente; nu presupunem că fiecare lună are același număr. Un total pentru o fracție de lună nu devine automat salariu pentru lună întreagă.

Media netă nu se obține în general aplicând calculatorul brut–net mediei brute. Deducerile, excepțiile, plafonările și profilurile fiscale pot schimba rezultatul. Dacă facem conversii individuale pe ipoteze, statisticile lor sunt rezultate derivate și se etichetează astfel.

Pentru date reale, folosim fotografia lunară cea mai recentă sau o fereastră mobilă clar definită. O singură persoană prezentă în 12 luni nu reprezintă 12 persoane independente. Fereastra implicită propusă pentru oferte este 90 zile, cu extindere la 180 doar afișată explicit. Pentru salarii, surse cu perioade mai vechi de 18 luni ies din candidaturile la cifra principală curentă; pragurile se calibrează pe surse.

### 7.3. Deduplicare și unitate de numărare

Pentru payroll: identificator pseudonim de persoană/contract, generat și guvernat de partener, plus perioadă. Preferăm ca deținătorul să producă agregate înainte de transfer. Nu cerem CNP sau nume pentru paginile salariale. Pentru persoane cu mai multe contracte, definim dacă măsurăm contractul principal sau venitul persoanei; nu schimbăm definiția în mijlocul seriei.

Pentru anunțuri: identificator de origine, angajator, URL canonic, titlu, locație, dată, amprentă a conținutului. Același job redistribuit pe trei platforme rămâne un job. Mai multe orașe într-un singur anunț nu creează mai multe observații independente. Posturile declarate sunt alt indicator decât numărul de anunțuri.

Contorizăm separat `n_raw`, `n_valid`, `n_unique_people` sau `n_unique_contracts`, `n_unique_ads`, `n_employers`, `n_eff` și, dacă este furnizată, populația ponderată `N_population`. Nu redenumim `count` al unui furnizor fără definiție scrisă.

### 7.4. Medie și cuantile

Pentru observații punctuale compatibile `xᵢ`, cu ponderi documentate `wᵢ > 0`:

`media = Σ(wᵢ × xᵢ) / Σwᵢ`

Definim funcția de distribuție ponderată `F(x) = Σ[wᵢ × 1(xᵢ ≤ x)] / Σwᵢ`. Folosim `Q(p) = inf{x : F(x) ≥ p}`, cu p = 0,25; 0,50; 0,75. P25–P75 descrie jumătatea centrală a distribuției, **nu intervalul de încredere al medianei**. Convenția de calcul se publică și se versionează.

Ponderile de sondaj provin din design sau dintr-o calibrare justificată pe o populație de referință. Nu inventăm ponderi pentru a apropia rezultatul de o medie INS dorită. Pentru eșantioane voluntare, calibrarea reduce unele dezechilibre observabile, dar nu elimină automat biasul de selecție.

Păstrăm rezultatul pe angajați și un control pe angajatori. Dacă o singură companie domină, declarăm concentrarea sau reținem publicarea; nu schimbăm ponderile ascuns. `n_eff = (Σw)² / Σ(w²)` este un diagnostic al ponderilor, nu înlocuitor pentru efectul de cluster sau pentru eșantionul real.

### 7.5. Ce facem cu intervalele din anunțuri

O ofertă `[L,U]` nu spune ce salariu a acceptat persoana angajată. **Mijlocul intervalului nu devine salariu observat.** Publicăm numărul de oferte, limitele și distribuțiile limitelor sau o statistică explicit numită „mediana pragului minim ofertat”. Nu o redenumim „salariul median încasat”.

Dacă există un model justificat de observații cenzurate pe interval, rezultatul se păstrează ca model, cu ipoteze, validare și incertitudine. Limite matematice pentru cuantilele unei variabile ipotetice cu valori în intervalele respective pot fi calculate din capete; nu dovedesc distribuția salariilor plătite și nu corectează selecția angajatorilor.

Anunțurile „de la X”, „până la X”, salariu negociabil, venit cu comisioane nelimitate sau intervale care combină mai multe niveluri au tipuri distincte. Nu completăm capătul lipsă și nu amestecăm tarifele B2B cu CIM.

### 7.6. Cum combinăm sursele

Nu facem media medianelor Paylab, DevJob și Salario. Nu combinăm quartilele publicate ca și cum ar fi observații individuale. Nu tratăm o grilă drept încă un fluturaș.

Medii agregate se pot combina numai pentru cohorte compatibile, fără suprapunere, cu numitori corecți și ponderi comparabile. Pentru cuantile comune sunt necesare microdate, distribuții/histograme compatibile ori structuri aproximative cu eroare documentată. Dacă furnizorul transmite doar P25/mediană/P75, păstrăm acel benchmark atribuit.

Reconcilierea se face între surse după COR/rol, perioadă, normă, geografie, definiția remunerației și selecția populației. O discrepanță peste 20% față de o sursă comparabilă declanșează investigație propusă, nu o corecție automată a uneia dintre valori. Pragul este operațional, de calibrat.

### 7.7. Regiune și experiență

Regiunea salariului este în primul rând locul muncii, nu domiciliul angajatului sau sediul fiscal al angajatorului. Păstrăm județ, localitate și cod geografic versionat, plus eticheta remote. Pentru posturi remote, distingem eligibilitatea din România de grila salarială aplicată în România.

Experiența în rol, experiența profesională totală, vechimea în companie și nivelul junior/mid/senior sunt variabile diferite. Nu transformăm vârsta în experiență. O gradație bugetară nu este automat senioritate de piață.

Propunem grupe editoriale 0–2, 3–5, 6–10 și peste 10 ani, numai pentru surse cu ani comparabili; păstrăm și variabila originală. Nivelurile furnizorilor pot fi afișate separat. Dacă avem doar marginalele „București” și „senior”, nu avem distribuția „senior în București”.

### 7.8. Incertitudine și regula de publicare

Pragurile de mai jos sunt **politica inițială propusă**, nu standarde legale sau garanții de precizie. Le calibrăm prin simulări și validări pe date reale înainte de producție. Contractele surselor și regulile de confidențialitate pot fi mai restrictive.

| Condiție pentru celula analizată | Politică propusă |
|---|---|
| Drepturi neclare, COR ambiguu, concept/monedă/perioadă necunoscute | Nu intră în agregatul public |
| Sub 10 persoane independente sau risc de identificare | Suprimăm statistica; exemplul public al unei grile poate rămâne atribuit ca grilă |
| 10–29 persoane ori sub 5 angajatori | Cercetare internă / benchmark local atribuit; fără mediană națională proprie |
| Minimum 30 persoane și 5 angajatori | Mediană candidată, numai după verificarea preciziei, concentrării și acoperirii |
| Minimum 60 persoane și 5 angajatori | Quartile candidate, cu verificări separate ale incertitudinii lor |
| Un angajator peste 30% din pondere | Revizuire obligatorie; nu mascăm dependența |
| Interval de încredere 95% al medianei prea larg | Reținem cifra principală sau extindem fereastra/cohorta explicit |

Țintă inițială de precizie: jumătatea lățimii intervalului de încredere al medianei sub 15% din mediană. Pentru un eșantion de companii, folosim bootstrap pe angajatori, cu designul de sondaj și repetarea persoanelor tratate adecvat; pentru anchete oficiale folosim metoda/replicatele furnizate. Un interval bootstrap îngust nu demonstrează reprezentativitate națională dacă eșantionul exclude categorii întregi de angajatori.

Publicarea are două niveluri distincte: „în eșantionul documentat” și „estimare pentru populația națională definită”. Cel de-al doilea cere o justificare a acoperirii și ponderării suplimentară față de simplul `n`.

### 7.9. Date puține și ocupații rare

Fiecare COR poate avea un rând de acoperire cu valori `null`; absența unei medii nu devine zero. Unele ocupații rare nu vor suporta defalcări regionale fără risc de identificare. Nu există o metodă statistică prin care lipsa completă a observațiilor să producă o mediană empirică exactă.

Putem extinde perioada, agrega o regiune, prezenta o specializare apropiată ca reper separat sau construi un model ierarhic. Orice transfer de informație între ocupații este etichetat ca estimare. Modelul poate utiliza ocupația, regiunea, experiența, industria și dimensiunea angajatorului; nu publicăm numărul observațiilor grupei-părinte ca `n` al COR-ului rar.

## 8. Validare și criteriul „mai exacți”

Validarea trebuie să testeze simultan extragerea, clasificarea și rezultatul statistic:

1. Lot de referință revizuit manual: ocupație, salariu, net/brut, monedă, perioadă, normă, duplicate. Erorile pe aceste câmpuri se raportează separat.
2. Separare pe angajatori, nu împărțire aleatorie a anunțurilor duplicate între antrenare și test.
3. Test temporal: construim rezultatul doar cu date disponibile la data respectivă și verificăm ulterior pe salarii reale independente.
4. Comparăm erorile medianei, deviația relativă, pierderea pe cuantile și acoperirea intervalelor. Nu folosim succesul SEO drept măsură de corectitudine salarială.
5. Evaluare distinctă pentru IT, meserii manuale, sănătate, contabilitate, public/privat, regiuni și angajatori mici/mari.
6. Analiză de sensibilitate: cu/fără un furnizor, cu/fără angajatorul dominant, ferestre diferite, conversii fiscale și observații suspecte.
7. Eșantioanele folosite ca adevăr de referință nu participă și la model. Un furnizor care reambalează alt furnizor nu este test independent.

Nu eliminăm automat salariile mari doar fiindcă sunt în afara a 1,5 IQR. Investigăm întâi moneda, periodicitatea, rolul, bonusul și norma. Păstrăm motivul excluderii și sensibilitatea rezultatului la observația respectivă.

## 9. Legalitatea, aplicată sistemului

Accesul public, citarea, descărcarea tehnică și dreptul de republicare sistematică sunt lucruri diferite. Licența trebuie verificată pentru fiecare produs, nu doar pentru companie. Registrul detaliază această decizie pentru fiecare sursă.

Pentru date personale: minimizare, scop determinat, temei legal, contracte și măsuri de protecție. Un identificator pseudonim nu face automat datele anonime. Pentru tabele publice: celule mici, angajator dominant și posibilitatea reidentificării prin combinarea filtrelor necesită control; uneori și suprimare complementară. [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj).

Pentru baze comerciale: protecția bazei poate exista chiar dacă salariul ca fapt nu are protecție de autor. Copierea repetată a unor părți mici poate reconstrui o parte substanțială. Un API descoperit sau un scraper vândut de altcineva nu acordă drepturile deținătorului. [Directiva 96/9/CE](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=celex%3A31996L0009).

Pentru instituții: cerem documentele și condițiile de reutilizare, cu respectarea excepțiilor de confidențialitate; nu presupunem că legea obligă furnizarea microdatelor ori crearea de analize nelimitate. [Legea 179/2022](https://legislatie.just.ro/Public/DetaliiDocument/256414). Pentru Eurostat, politica permite utilizarea comercială a datelor vizate cu atribuire și respectarea excepțiilor. [Politica Eurostat](https://ec.europa.eu/eurostat/help/copyright-notice).

Directiva UE privind transparența salarială poate îmbunătăți accesul candidaților la informații, dar nu creează o licență generală de scraping și nu înseamnă că toate anunțurile românești trebuie tratate automat ca având salariu public. Stadiul transpunerii și regulile naționale trebuie verificate la implementare; nu am certificat aici situația transpunerii în România. [Directiva 2023/970, art. 5](https://eur-lex.europa.eu/eli/dir/2023/970/oj).

## 10. Cum ar trebui să arate pagina „Salariu”

Titlul SEO poate rămâne **„Salariu zugrav 2026”**, iar un interval se adaugă numai când îl putem susține și explicăm ce măsoară. Nu este necesar să punem „nu avem date” sau „estimare” în titlu. Claritatea metodologică trebuie să fie lângă cifră, în pagină.

Ordinea propusă:

1. Ocupația și specializarea; brut/net, regiune și experiență selectate.
2. Cifra principală eligibilă și P25–P75, cu eticheta scurtă „salarii plătite” sau „salarii contractuale”. Un interval din oferte are propria etichetă.
3. Perioada, numărul real de persoane/angajatori sau de oferte și data ultimei actualizări a datelor.
4. Distribuția și comparația între regiuni/niveluri, doar pentru celule eligibile.
5. Exemple actuale de oferte și diferența dintre salariul de bază, bonusuri și venit total.
6. Explicații despre calificare, atribuții, autorizări și căi de carieră, revizuite pentru meseria respectivă.
7. Surse precise, metodologie, limitări, istoric de revizii și un mecanism de semnalare a unei erori — fără formular de colectare a salariului personal.

Un grafic P25–P75 arată jumătatea centrală; nu îi promitem utilizatorului că „sigur va câștiga” în acel interval. Pentru comparația între cariere, aliniem filtrele și afișăm dacă definițiile surselor diferă.

Nu publicăm automat mii de pagini identice din catalogul COR. Separăm catalogul de cercetare de paginile indexabile. O pagină intră în extinderea SEO când are răspuns salarial susținut, informație specifică și surse; nu când există numai un cod în nomenclator. `JobPosting` se folosește pentru un post real, nu pentru un articol salarial. Datele structurate nu înlocuiesc dovada statistică.

## 11. Plan de execuție și puncte de decizie

Intervalele de mai jos sunt un plan de lucru propus. Răspunsurile instituțiilor și licențele sunt dependențe externe, nu termene garantate.

| Etapă | Livrabil | Criteriu de trecere |
|---|---|---|
| Zilele 1–7: fundație | Nomenclator versionat la zi, revizia celor 126 mapări, dicționar salarial, registru de drepturi, importuri în staging | Niciun COR ales doar din prefix; nicio sursă fără concept / drepturi documentate |
| Zilele 1–14, în paralel cu fundația | Cereri concrete către INS/Inspecția Muncii; RFI și probe de la furnizori; parteneri payroll | Fișiere demonstrative și răspuns explicit privind publicarea statisticilor |
| Zilele 8–30: pilot | 12–20 ocupații din domenii diferite; verificare manuală și statistică | Măsurăm câte celule sunt eligibile, fără a umple golurile artificial |
| După validarea pilotului | Noua pagină pe 5–10 ocupații cu cele mai bune date; comparații compatibile; bibliografie și versiuni | Reguli de publicare trecute, eroare de mapare evaluată, licență activă |
| Etapa următoare | Extindere la paginile existente și apoi COR-uri noi, după cerere și acoperire | Creșterea numărului de ocupații validate, nu doar a URL-urilor |

Pilot propus: programator, web developer, contabil, contabil șef, electrician în construcții, instalator tehnico-sanitar/gaze, zugrav, zidar roșar-tencuitor, sudor, șofer de autocamion, asistent medical, bucătar. Se adaugă alte roluri după catalogul și eșantioanele furnizorilor. Formularea exactă și codul fiecăruia se aprobă prin revizia nomenclatorului.

Primul buget trebuie alocat unui lot cu drept de publicare și unei verificări statistice, nu importului în masă. Dacă furnizorul nu poate demonstra salarii și `n` pentru meserii manuale, nu îl considerăm soluție pentru întreaga nișă chiar dacă IT-ul este bine acoperit.

## 12. Decizia recomandată acum

**Construim infrastructura comună și un pilot cu date externe verificabile; nu înlocuim un proxy INS cu un alt proxy ascuns.** Prioritatea este: corectarea mapărilor COR, obținerea unui nucleu de date ale angajatorilor cu drept editorial, negocierea unei surse de oferte pentru meserii manuale și validarea independentă.

INS/Eurostat/ILO rămân surse de control. Paylab poate fi evaluat ca strat de benchmark modelat, cu etichetă și drepturi. Datele din anunțuri răspund foarte bine la întrebarea „ce oferte există”, iar payroll răspunde la „ce se plătește efectiv”. Păstrarea acestei distincții este esențială pentru pagini pe care alții le pot cita fără să preia o afirmație falsă.
