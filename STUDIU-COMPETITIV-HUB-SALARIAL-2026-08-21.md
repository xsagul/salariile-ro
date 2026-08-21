# Studiu competitiv — drumul spre hub-ul salarial #1 din România

**Data:** 21 august 2026
**Ținte declarate:** paylab.ro, undelucram.ro
**Ținta acoperită anterior:** calculator-salarii.ro (rămâne acoperită)
**Scop:** ce anume deținem, ce anume deține fiecare competitor, în ce ordine îi
capturăm valoarea și care este blocajul care trebuie rezolvat *înainte* de
scalare.

---

## 0. Rezumatul într-un paragraf

Paylab și undelucram nu sunt același tip de adversar și nu se bat cu ei aceleași
arme. Paylab e un **atlas de poziții** subțire ca date (14.383 respondenți pe 767
poziții) dar lat ca acoperire, cu defecte tehnice și editoriale grave pe care le
putem depăși în luni, nu în ani. Undelucram e o **platformă de comunitate** cu
400.000 de salarii declarate și recenzii pe companii — un moat pe care nu îl
putem copia, pentru că e făcut din oameni, nu din pagini. Iar descoperirea
neașteptată e că **niciunul dintre ei nu deține de fapt query-urile ocupaționale**:
pe „salariu asistent medical 2026" primele rezultate sunt jurnalul.ro, cancan.ro,
bzi.ro, playtech.ro, gandul.ro. Nișa nu e apărată de un competitor puternic; e
ocupată de presă generalistă cu cifre neverificabile. Asta e deschiderea reală.

**Blocajul nostru înainte de orice extindere:** 67% dintre meseriile actuale
(68 din 102) afișează exact aceeași cifră ca altă meserie, pentru că toate
moștenesc media sectorului CAEN. La 102 pagini e o slăbiciune. La 767 ar fi
fatal.

---

## 1. Metodă, și ce n-am putut atinge

Ce am rulat pe 21 august 2026:

| Sursă | Acces | Ce am obținut |
|---|---|---|
| paylab.ro | robots deschis (`Disallow:` gol) | sitemap complet, 1.059 URL-uri, 7 pagini descărcate și disecate |
| salariucalculator.ro | robots deschis | sitemap complet, 92 URL-uri |
| calculator-salarii.ro | robots deschis | sitemap disponibil |
| undelucram.ro | **`User-agent: ClaudeBot / Disallow: /`** | doar SERP și surse terțe |
| ghidsalariu.ro | **`User-agent: ClaudeBot / Disallow: /`** | doar SERP și surse terțe |
| Search Console salariile.ro | propriu | 1.000 query-uri, 90 de zile |

**Limita 1 — două site-uri ne blochează explicit.** undelucram.ro și
ghidsalariu.ro (ultimul prin robots-ul managed de Cloudflare) interzic ClaudeBot.
Nu le-am făcut crawl. Tot ce scriu mai jos despre ele vine din rezultate de
căutare, din presă și din materialele lor publice de PR — nu din paginile lor.
Ce lipsește, și cine îl poate obține: tu, deschizându-le normal în browser.
Lista concretă e la §9.

**Limita 2 — SERP-ul.** Căutarea pe care o pot rula este ancorată în SUA. Pentru
query-uri românești rezultatele sunt orientative, nu identice cu google.ro. Le
tratez ca semnal de *tip de rezultat* („presă generalistă domină"), nu ca poziții
exacte.

---

## 2. paylab.ro — demontat cap-coadă

### 2.1 Inventarul complet de pagini (1.059 URL-uri în sitemap)

| Tipar | Nr. | Rol |
|---|---|---|
| `/informatii-calculator-salarii/{categorie}/{poziție}` | **767** | motorul organic |
| `/informatii-calculator-salarii/{categorie}` | 38 | huburi de categorie |
| `/informatii-calculator-salarii` | 1 | hub general |
| linkuri către `www.paylab.com` | 222 | scurgere de autoritate în afara domeniului |
| `/salarii-top/clasament/*` | 7 | clasamente |
| `/salarii-in-tara` | 1 | pagina lor cea mai bogată |
| `/calculator-salariu`, `/calculator-salariu-wizard` | 2 | poarta către chestionar |
| `/partner/*` | 9 | parteneri |
| newsroom (`/50455` etc.) | 18 | articole cu URL numeric |
| suport (metodologie, contact, legal) | ~6 | — |

Cele 38 de categorii, ordonate după numărul de poziții: tehnologia informației
(66), medicină și asistență socială (52), management (52), construcții și
imobiliare (39), transporturi și logistică (36), jurnalism-presă-media (33),
economie-finanțe-contabilitate (31), comerț (31), educație-știință-cercetare
(29), turism-gastronomie-hotelier (27), inginerie mecanică (25), conducere de
nivel superior (22), producție (21), banking (21), arte și cultură (21),
marketing-publicitate-PR (20), inginerie electrică (19), servicii (19),
telecomunicații (18), administrație publică (17), industria auto (16),
agricultură-alimentar (16), administrație (15), resurse umane (13), asigurări
(13), farmaceutică (12), ape-silvicultură-mediu (11), securitate (10), drept
(10), lemn (8), muncă necalificată (7), textile (6), minerit-metalurgie (6),
tehnologie-dezvoltare (5), asistență clienți (5), managementul calității (4),
leasing (4), chimie (4), traduceri (3).

### 2.2 Anatomia paginii de poziție (`/tehnologia-informatiei/programator`)

Ordinea modulelor, exact cum apar:

1. **Breadcrumb** Pagina principală › Salarii pe poziții › Categorie › Poziție
2. **H1** „Salariu pentru poziția Programator, România"
3. **Blocul de date** — „80% dintre oameni câștigă: 5.296 – 17.264 RON", cu
   decila 10 și decila 90 explicitate separat
4. **CTA gated** „Compară-ți salariul cu ceilalți" (repetat de 4 ori în pagină)
5. **„Ce înseamnă datele din grafic?"** — paragraf de metodologie inline
6. **Butoane de share** (Share / Tweet / Save / Get link)
7. **„Ce muncă desfășoară de obicei"** — fișa postului, 7 bullets
8. **CTA B2B** „Pentru companii — câștigați încredere…"
9. **„Cea mai frecventă cale de carieră"** — graf de progresie între poziții
10. **„Poziționați X pe piața muncii"** — locul în clasament (locul 90 din 687),
    **% femei în funcție (25%)**, **vârsta medie a respondentului (31)**
11. **Poziții vecine în clasament** — 89, 90, 91 + prima și ultima, fiecare cu
    interval salarial și link
12. **Ofertă comercială** — raport salarial 99 EUR/job, cu lista de conținut
13. **FAQ** — 5 întrebări, cu formulări scrise pentru featured snippet:
    „Care este salariul…", „Cât voi câștiga ca…", „Ce salariu ar trebui să
    aștept după 5 ani de experiență", „Cum să negociezi un salariu mai bun"
14. **Numărul de respondenți** — „134 respondenți verificați" pentru Programator

Volum: ~1.065 de cuvinte. Title: „Salariu Programator - România".

### 2.3 Pagina de categorie — activul lor intern cel mai puternic

`/informatii-calculator-salarii/tehnologia-informatiei`: **6.343 de cuvinte, 109
linkuri interne**. Un tabel Poziție | Descrierea postului | Interval salarial, în
care fiecare din cele 66 de poziții primește o fișă de post reală de 5–13
bullets. Nu e o listă de linkuri; e un document. De aici își distribuie ei
autoritatea internă către cele 767 de pagini-frunză.

### 2.4 `/salarii-in-tara` — ce ar trebui să avem și noi

1.487 de cuvinte, 67 de linkuri interne, și blocuri de date pe care noi nu le
avem deloc:
- distribuția angajaților pe **benzi salariale**
- salariu mediu și interval **după vârstă**
- **comparație bărbați / femei** (gender pay gap)
- cele mai bine și cele mai prost plătite poziții
- comparație între țări

### 2.5 Defectele lor — lista de atac

Astea sunt verificabile azi, în sursa paginilor:

1. **`LS_PP2_ServerName`** — un placeholder de template neînlocuit apare de
   patru ori în **textul vizibil**, inclusiv în două răspunsuri din FAQ:
   „Pe baza sondajului privind salariile LS_PP2_ServerName…". Semnal de
   calitate slabă, la vedere, pe pagina lor cea mai importantă.
2. **Contradicție brut/net în aceeași pagină.** Titlul blocului spune „Salariu
   mediu lunar **net**". Nota de sub el spune „Salariile din sondaj sunt
   exprimate în **brut**". Paragraful următor spune „câștigă între 5.296 și
   17.264 RON lunar **net**". FAQ-ul spune „salariul **brut** total variază între
   **4.416 și 29.932** RON" — alt interval decât graficul. Aceleași date, patru
   etichete diferite. **Aici avem noi dreptul moral și tehnic să câștigăm:**
   noi separăm explicit brutul INS, netul observat INS și netul standard calculat.
3. **Zero JSON-LD.** Niciun bloc de date structurate pe niciuna dintre paginile
   verificate — nici măcar `FAQPage`, deși au FAQ vizibil, nici `BreadcrumbList`,
   deși au breadcrumb. Noi avem deja FAQPage + BreadcrumbList + CollectionPage +
   ItemList pe `/salarii`.
4. **Title-uri cu brand gol.** Toate se termină în „ - " („Salarii în România - ",
   „Salarii de top - "). Template stricat, pe tot site-ul.
5. **Canonical inconsistent.** `/calculator-salariu` are canonical către
   `/calculator-salariu-wizard`.
6. **Newsroom fără slug.** Articolele stau la `/50455`, `/50414` — zero cuvinte-
   cheie în URL, 18 articole în total.
7. **Bază de date subțire.** 14.383 de respondenți împărțiți la 767 de poziții =
   ~18 pe poziție în medie. Programator, una dintre pozițiile lor de top, are
   **134**. Intervalele de la pozițiile din coada lungă sunt statistic goale.
8. **222 de linkuri către paylab.com** chiar din sitemap-ul .ro.

### 2.6 Modelul lor de business

Lead-gen dublu: utilizatorul completează chestionarul gratuit ca să-și vadă
comparația (ei capătă datele), iar compania cumpără **raport salarial 99 EUR/job**.
Toate CTA-urile din pagină servesc una din cele două pâlnii. Sunt parte din
grupul Alma Career (fostul Alma Media / Profesia).

---

## 3. undelucram.ro — ce știm fără să le atingem serverele

**Model:** platformă de comunitate, nu bază de date editorială. Structura
declarată public: pentru fiecare companie — Forum, Evaluări, Salarii, Interviuri,
Beneficii. Peste asta: „Ghidul salariilor" (secțiune editorială), „Creare CV
online" (șabloane CV), „Salariometru" (comparator salarial), și
`/angajatori/raport-salarial` (monetizare B2B, ca la paylab).

**Scara declarată de ei:** peste **850.000 de utilizatori** și peste **400.000 de
salarii colectate**, procesate cu un algoritm propriu pentru medie, mediană,
cuartile. Adică **de ~28 de ori mai multe date declarate decât paylab** pe piața
românească.

**Ce e capturabil și ce nu.** Recenziile de angajator, interviurile și forumul
sunt UGC — nu le putem replica fără comunitate, și nu are rost să încercăm.
Salariometrul e replicabil ca *unealtă*, dar nu ca *date*. Ce e capturabil e
stratul editorial: „Ghidul salariilor" e conținut redacțional obișnuit, iar
paginile de tip „salariu pentru funcția X" se bat pe aceleași query-uri unde,
după cum arată §4, câștigă azi presa — nu ei.

**Concluzia strategică:** nu-i atacăm pe UGC. Îi ocolim pe **datele obiective**.
Ei au „ce zic oamenii că iau"; noi putem avea „ce arată statistica oficială și
legea", cu sursă și dată de referință. Sunt două produse diferite care încap
amândouă în SERP, iar al doilea e apărabil de un singur om.

---

## 4. Cine deține de fapt query-urile ocupaționale (surpriza studiului)

Pentru „salariu asistent medical 2026", rezultatele sunt dominate de presă
generalistă: jurnalul.ro, cancan.ro, bzi.ro, playtech.ro, gandul.ro, csid.ro,
doctorulzilei.ro. Niciun paylab, niciun undelucram în capul listei.

Pentru „salariu programator România", peisajul e alt amestec: **ghidsalariu.ro**
(model identic cu ce vrem noi să construim), **salariucalculator.ro/ghiduri/…**,
jooble.org/salary/…, plus bloguri de școli de programare (sdacademy.ro,
goit.global, digitalpedia.ro, ramonnastase.ro). Paylab apare — dar cu URL-ul
**englezesc** (`/en/salaryinfo/information-technology/programmer`), nu cu cel
românesc.

Ce înseamnă asta:

1. **Nișa nu e apărată.** Adversarul de bătut pe query-urile ocupaționale nu e o
   platformă cu 400.000 de salarii, ci un articol de ziar scris în 40 de minute.
2. **Formatul care câștigă** la ei: an în titlu, „la stat vs la privat", „în
   funcție de studii și experiență", interval nu cifră unică. Toate replicabile
   de noi, cu avantajul că ale noastre pot fi verificabile.
3. **Slăbiciunea lor** e exact forța noastră: cifrele din presă nu au sursă, nu
   au dată de referință și nu se actualizează. Ale noastre au matrice TEMPO, lună
   de referință și metodologie.
4. **ghidsalariu.ro rămâne competitorul cel mai apropiat ca format** — deja
   documentat în PROGRES.md, cu date INS 2024 și net calculat greșit. Nu e în
   lista ta de ținte, dar e în SERP-ul nostru.

---

## 5. Unde stăm noi, măsurat

**Search Console, ultimele 90 de zile:** 357.727 impresii, 4.289 clickuri pe
1.000 de query-uri. Dintre acestea, query-urile de tip ocupațional însumează
**375 de impresii și 7 clickuri** — sub 0,11%. Clusterul `/salarii` e nou, deci
cifra e așteptată; dar înseamnă că pornim de la zero pe exact terenul pe care
vrem să devenim numărul unu.

**Acoperire:** 102 meserii, 25 de comparații, 57 de chei CAEN, pe setul INS din
iunie 2026. Paylab: 767 de poziții. Gap brut: ~460 de poziții pe care ei le au
și noi nu (potrivire aproximativă pe slug — cifra reală e probabil mai mare,
pentru că potrivirea e permisivă). Categoriile cu cele mai mari lipsuri:
management (42), medical (32), IT (26), comerț (23), presă (23), transport (22),
construcții (21).

**Ce avem și ei nu:** date INS lunare cu lună de referință la vedere, calcul
fiscal 2026 corect și transparent, defalcare pe județe, grupe ISCO-08 pe vârste,
JSON-LD complet, CWV bune, zero reclame.

---

## 6. Blocajul care trebuie rezolvat înainte de scalare

Am măsurat catalogul propriu. Rezultatul:

> **68 din 102 meserii (67%) afișează aceeași cifră ca altă meserie.**

| CAEN | Meserii care împart aceeași cifră |
|---|---|
| 62 | Programator, Web developer, Tester QA, Inginer DevOps, Administrator de sistem |
| 69 | Contabil, Auditor financiar, Avocat, Notar, Consilier juridic |
| 86 | Medic, Asistent medical, Stomatolog, Psiholog, Fizioterapeut |
| Q | Profesor, Învățător, Educator, Profesor universitar, Instructor auto |
| 43 | Electrician, Instalator, Zugrav, Faianțar |
| 47 | Farmacist, Vânzător, Casier, Manager de magazin |
| 49 | Șofer TIR, Șofer de autobuz, Taximetrist, Mecanic de locomotivă |
| P | Funcționar public, Polițist, Pompier, Militar |

…plus încă 15 grupuri de câte 2–3.

Diferența față de ghidsalariu.ro e că **noi etichetăm corect** — spunem explicit
că e media activității CAEN, nu „salariul de programator". Onestitatea ne apără
de acuzația de dezinformare, dar nu ne apără de două lucruri practice:

1. **Utilitatea.** Omul care caută „cât ia un notar" nu primește un răspuns
   despre notari. Primește media activităților juridice și contabile.
2. **SEO.** 5 pagini cu aceeași cifră și structură identică sunt, pentru Google,
   candidate la thin content. La 767 de pagini construite pe același tipar,
   riscul nu mai e teoretic.

**Regula pe care o propun, scrisă ca gate:** nicio extindere peste 102 meserii
până când fiecare meserie nouă are cel puțin **o cifră care îi aparține** — nu
moștenită de la sector.

---

## 7. De unde vine diferențierea: trei surse, în ordinea raportului valoare/efort

### 7.1 Legea 153/2017, art. 33 — arma pe care n-o are nimeni

Legea-cadru privind salarizarea personalului plătit din fonduri publice obligă
**fiecare autoritate și instituție publică** să publice periodic lista funcțiilor,
cu salariul de bază, sporurile, procentele și **valoarea brută** pentru fiecare
funcție, plus temeiul legal. Sunt publicate pe site-urile instituțiilor, ca
documente publice, în martie și septembrie.

Ce înseamnă concret: pentru profesor, medic, asistent medical, polițist, pompier,
militar, funcționar public — adică **exact ocupațiile unde presa domină SERP-ul
cu articole vagi** — există cifre oficiale, pe funcție, pe grad, pe vechime, cu
temei legal citabil. Nici paylab, nici undelucram, nici ghidsalariu nu le
folosesc. Un cluster construit pe ele ar fi:
- diferențiat per ocupație (rezolvă §6 pentru toată zona publică),
- verificabil (fiecare cifră trimite la documentul instituției),
- greu de copiat (cere muncă de agregare, nu un scraper de o oră),
- un **linkable asset** real — genul de lucru pe care presa îl citează, ceea ce
  atacă direct constrângerea noastră de autoritate.

Următorul termen de publicare: **30 septembrie 2026**. Merită să prindem
fereastra.

### 7.2 ISCO-08 pe vârste — deja în casă, insuficient exploatat

Avem ancheta INS pe grupe majore de ocupații, cu progresie pe vârste. E prea
grosieră ca să diferențieze programator de tester, dar diferențiază specialist
de tehnician de muncitor necalificat. Folosită ca a doua axă, sparge o parte din
grupurile de la §6 și dă modulul „salariu după N ani" pe care paylab îl are și
noi nu.

### 7.3 Date proprii — singura cale către paritate pe termen lung

Ambii competitori au același moat: date declarate de utilizatori. Noi n-avem
niciuna și n-avem cont. Un formular anonim de raportare salarială, cu prag de
afișare (nu publicăm nimic sub N răspunsuri, exact ca ei), e singura cale prin
care ajungem vreodată la „salariu de programator" în loc de „media CAEN 62".
E o decizie de produs, nu de SEO, și se leagă de direcția încă nedecisă
reclame-vs-produs. **Nu o pornim acum** — o notez ca dependență a fazei 4.

---

## 8. Planul pe faze, cu criterii de trecere

**Faza 1 — reparăm fundația (înainte de orice pagină nouă)**
- rezolvă diferențierea pentru cele 8 grupuri mari de la §6
- adaugă modulele care lipsesc din paginile de meserie și pe care paylab le are:
  interval (nu doar medie), progresie pe vârste, poziție în clasament
- gate: zero meserii cu cifră 100% moștenită de la sector

**Faza 2 — clusterul sector public pe Legea 153/2017**
- ținte: profesor, medic, asistent medical, polițist, militar, pompier,
  funcționar public
- fiecare pagină citează documentul instituției și data publicării
- gate: cluster indexat, plus prima citare externă obținută

**Faza 3 — lățime, dar disciplinată**
- extindem spre cele ~460 de poziții lipsă, în ordinea cererii reale, nu în
  ordinea listei paylab
- fișă de post proprie per poziție (ei o au; e diferențiatorul de conținut)
- pagina de categorie devine document de 3.000+ cuvinte, nu listă de linkuri
- gate: nicio poziție nouă fără cifră proprie și fișă proprie

**Faza 4 — paritate pe date (decizie de produs)**
- raportare salarială anonimă, cu prag de afișare
- gate: decizia reclame-vs-produs luată

**Ce NU facem:** nu ne batem cu undelucram pe recenzii de companii; nu cumpărăm
linkuri; nu publicăm cifre fără sursă și fără dată de referință — e singurul
lucru care ne diferențiază de presa care domină azi nișa.

---

## 9. Ce rămâne de verificat manual (îmi trebuie ochii tăi)

undelucram.ro și ghidsalariu.ro ne blochează crawlerul. Deschide-le normal în
browser și notează:

**undelucram.ro**
1. Structura URL pentru salarii — `/salarii/{funcție}`? `/companii/{firmă}/salarii`?
2. Câte funcții distincte au pagină proprie de salariu
3. Ce afișează pe pagina de funcție: mediană, cuartile, nr. de raportări?
4. Au JSON-LD? (Ctrl+U, caută `application/ld+json`)
5. Cum arată „Ghidul salariilor" — câte articole, ce format
6. Salariometrul: e gated ca la paylab sau deschis?

**ghidsalariu.ro**
7. Câte meserii au acum (erau 98) și dacă au trecut de la INS 2024 la date noi
8. Dacă au corectat netul (era 78% din brut — imposibil fiscal)

Cu răspunsurile la 1–4 pot dimensiona exact clusterul lor și pot spune ce e de
capturat primul.

---

## 10. Fișiere și date brute

Salvate în repo, ca să reziste între sesiuni:

- `research/paylab-pozitii-2026-08-21.csv` — cele 767 de poziții, cu categoria
  lor. Ăsta e planul de extindere din faza 3, în formă brută.
- `research/salariucalculator-urls-2026-08-21.txt` — cele 92 de URL-uri ale
  salariucalculator.ro, pentru comparație de structură.

Paginile HTML descărcate au rămas în scratchpad-ul sesiunii și dispar odată cu
ea; comenzile de mai jos le reproduc.

Comenzi reproductibile:

```bash
curl -sL https://www.paylab.ro/sitemap_index.xml
```

```bash
node scripts/gsc.mjs queries --days=90 --limit=1000 --json
```
