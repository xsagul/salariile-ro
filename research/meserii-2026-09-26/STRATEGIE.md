# Salarii pe meserii — cum devenim cei mai exacți, fără să întrebăm pe nimeni

Cercetare din 26 septembrie 2026, cerută de proprietar: „să fim mai granulari și mai exacți
decât toți competitorii la fiecare meserie, să ne desprindem de Salario, fără să întrebăm
utilizatorii, și să satisfacem intenția în primul ecran”.

## 1. Concluzia pe scurt

Există o sursă de **salarii efectiv plătite**, pe funcție, gradație, studii și secție, publicată
de mii de angajatori din obligație legală, pe care niciun concurent nu o adună: listele de
**transparență a veniturilor salariale** de la art. 33 din Legea-cadru 153/2017.

- Toate autoritățile și instituțiile publice (fără apărare, ordine publică și siguranță
  națională) publică **pe 31 martie și pe 30 septembrie** lista tuturor funcțiilor, cu salariul
  de bază, sporurile (tip, procent, valoare brută), voucherele, indemnizația de hrană și alte
  drepturi. Din 2018 le trimit și Ministerului Muncii, în octombrie (art. 33 alin. 1^1).
- La multe spitale fișierul are **un rând pentru fiecare post ocupat**, cu sumele din luna
  respectivă: SJU Alba Iulia ~3.000 de rânduri, SJU Miercurea Ciuc ~3.200, SJU Bacău, SJU
  Gorj, SCJU Cluj. Fără nume.
- Următoarea publicare e pe **30 septembrie 2026**, peste patru zile: o fotografie proaspătă,
  a întregului sector public, pentru toate meseriile noastre cu cea mai mare cerere.

Google tratează deja aceste liste drept cel mai bun răspuns: la „salariu asistent medical”,
**prima sursă citată de răspunsul AI este o listă de salarii a SCJU Bistrița**. Niciun site nu le
agregă.

## 2. Ce caută oamenii

Search Console, 28 august – 25 septembrie 2026, paginile `/salarii/*`: 470 de clicuri,
21.842 de afișări (de la ~21 de clicuri pe 9 septembrie). Primele pagini sunt aproape toate
bugetare: asistent social (41), medic rezident (39), registrator medical (38), bibliotecar
(24), procuror (22), asistent de farmacie (20), psiholog (18), șofer de ambulanță (17),
îngrijitor bătrâni (14), pompier (14), jandarm (13). Formulările: „debutant”, „net”, „2026”,
„DGASPC”, „comunal”, „cât câștigă”.

Intenția e una singură, cu trei nuanțe: **cât iau în mână** (net), **la început** (debutant) și
**cât se poate ajunge** (vechime, sporuri, ture, oraș). Aceleași trei nuanțe apar în răspunsul AI
al Google: stat vs privat, debutant vs gradație maximă, sporuri de secție.

## 3. Ce fac concurenții

| Site | Primul ecran | Ce e slab |
|---|---|---|
| paylab.ro | doar titlul; mai jos „80% câștigă 4.050–7.320 RON” | fără n, fără dată, fără stat/privat; capătul de jos e salariul minim din 2025 (plafonare); raport de 99 € |
| meseriile.ro | „Salariu mediu național 5.311 lei, minim 3.903, maxim 8.565” + tabel pe 40 de orașe | cifrele pe orașe sunt **media × un coeficient fix pe oraș** (Deva = Hunedoara = Petroșani; Sibiu = Mediaș; Tulcea = media națională), iar minimul și maximul sunt același procent din medie peste tot; COR greșit; fără sursă. Totuși, Google îl citează |
| undelucram.ro | nu are pagini publice pe meserie; „Salariometru” e în spatele contului | nu concurează în căutări pe meserii |
| Salario (eJobs) | medii declarate voluntar, în ghidul PDF | medie, nu mediană; fără n pe meserie; populație auto-selectată |
| jooble, reddit, forumuri, presă | rezultate vechi sau pentru alte meserii | SERP-ul e slab: loc liber pentru un răspuns bun |

Nimeni nu are: salarii plătite (nu declarate, nu oferite), diferența dintre bază și sporuri,
distribuția reală pe gradații, județe reale (nu coeficienți), sursa fiecărei cifre.

## 4. Metoda: registrul salariilor plătite de angajatorii publici

### 4.1. Ce colectăm
Pentru fiecare instituție: tipul (spital, DGASPC, bibliotecă, primărie, consiliu județean,
universitate…), județul, pagina de transparență, fișierul, perioada, data verificării, amprenta.
Pentru fiecare rând: funcția așa cum e scrisă, studiile, gradația/treapta, secția, salariul de
bază și fiecare sumă publicată, cu coloana ei.

### 4.2. Ce cifre publicăm, cu nume precise
- **Salariul fix** = baza + sporurile permanente (condiții de muncă), ce se plătește în fiecare
  lună. Cifra principală.
- **Cu ture și gărzi** = ce se adaugă variabil; separat, niciodată amestecat în cifra principală.
- **Netul** se calculează rând cu rând, din brutul publicat, cu regulile fiscale ale lunii
  (motorul verificat pe 26 septembrie), cazul standard. Mediana netului, nu netul medianei.
- Distribuții: mediana și „jumătate câștigă între X și Y” (P25–P75), pe meserie, pe județ, pe
  gradație și pe studii, numai peste praguri.

### 4.3. De ce e mai exact decât orice calcul din grilă
Proba pe SCJU Cluj și SJU Alba: sporul publicat **nu** e procentul din lege înmulțit cu baza.
La Cluj, spor de 15% la o bază de 6.281 lei = 673 lei (nu 942); la 5.842 lei, 626 (nu 876);
la Alba, 15% la 6.819 = 731. Raportul e ~10,7%, constant: sporurile se calculează pe o bază
veche, înghețată. Grila + procente dă cifre greșite; sumele publicate dau cifra plătită.

### 4.4. Proba — asistent medical, 2 spitale județene, 462 de rânduri

> **Corectat pe 26 septembrie 2026, noaptea:** proba de mai jos citea coloanele după poziția
> în rând și la Alba a luat o coloană greșită. Cu cititorul pe coordonate (scripts/colectare/
> art33/), pe 10 instituții din 9 județe și 4.975 de posturi, asistentul medical are **4.896
> lei net fix** (P25–P75 4.471–5.931), debutant 4.484, cu ture și gărzi 5.848. Cifrele de mai
> jos rămân ca istoric al probei.
| | Median net | Jumătate între |
|---|---|---|
| Salariul fix (bază + spor de condiții) | **4.416 lei** | 4.216–5.357 |
| Debutant | 4.133 lei | 3.826–4.969 |
| Doar baza | 3.989 lei | |

Spor median: Cluj 1.623 lei, Alba 731 lei — spitalele diferă, deci și județele. Pagina noastră
spune azi „4.000 lei (Salario)” sus și „3.116–3.239 lei” din grilă: ambele greșite față de
salariul plătit. Două spitale nu ajung pentru publicare (vezi pragurile); proba arată metoda.

### 4.5. Reguli (continuă regulile existente din CLAUDE.md)
- Un rând e un post publicat, nu neapărat o persoană; verificăm pentru fiecare instituție dacă
  lista e pe posturi ocupate (un rând pe angajat) sau pe tipuri de funcții (grilă), și nu le
  amestecăm în aceeași distribuție.
- Praguri propuse pentru cifra principală a unei meserii: minim 5 instituții, 3 județe și 50
  de rânduri; pe județ: minim 3 instituții sau 30 de rânduri; sub prag nu se arată nici cifră,
  nici interval (regula existentă din test-observatii).
- Nicio instituție peste 30% din rânduri fără să spunem; mediana pe instituții ca verificare.
- Nu publicăm rânduri unice (director, manager) și nu legăm o sumă de o persoană.
- Legalitate: informații publicate din obligație legală (art. 33), fără date personale;
  reutilizare conform Legii 179/2022; păstrăm sursa și data pentru fiecare cifră.
- Sectorul public e un sector: eticheta spune „la angajatori publici”. Privatul are pilonul lui
  (anunțurile), pe care nu-l topim în aceeași cifră.

### 4.6. Acoperire
Spitale publice (~370): asistent medical, infirmier, îngrijitor, registrator medical, medic,
medic rezident, farmacist, asistent de farmacie, psiholog, kinetoterapeut, fizioterapeut,
brancardier, șofer de ambulanță, bucătar, spălătoreasă, electrician, instalator, fochist,
muncitor, contabil/economist, informatician. DGASPC (47): asistent social, psiholog, educator,
îngrijitor, infirmier, șofer. Biblioteci și muzee: bibliotecar, muzeograf. Primării (3.180) și
consilii județene: șofer, muncitor calificat, electrician, instalator, paznic, îngrijitor,
contabil, polițist local, asistent social. Universități: personal auxiliar, IT, administrativ.
Căutări de probă au găsit pagini cu fișiere din martie 2026 la 10 spitale județene, 10 DGASPC,
5 biblioteci și 8 primării/consilii — vezi `surse.json`.

Nu acoperă: poliție, jandarmerie, armată (exceptate de art. 33 alin. 5; acolo rămâne grila
legală, completă), privatul pur (programator, vânzător, casier — rămân pe anunțuri).

### 4.7. Formatul fișierelor — munca reală
PDF-urile se citesc bine cu `pdftotext -table` (rânduri întregi). Coloanele diferă între
instituții, dar se repetă în timp și între instituții cu același program de salarii: pentru
fiecare model descriem o dată ce coloană e bază, ce e procent, ce e sumă fixă, ce e variabilă.
Unele fișiere sunt scanate (SCJU Ilfov: fără text) — le sărim, nu ghicim cifre.

## 5. Desprinderea de Salario

Salario e concurent și nu poate rămâne cifra din primul ecran. Pe meseriile acoperite de
registru, cifra principală devine salariul plătit; Salario coboară la „alte surse”, citat, apoi
iese complet acolo unde avem registru și anunțuri. Pe meseriile fără registru (privat pur),
cifra principală rămâne din anunțuri, peste praguri; Salario rămâne reper secundar până când
anunțurile trec pragul.

## 6. Primul ecran — propunere

Scop: răspunsul complet în primul ecran, pe telefon, fără să citești sursele.

```
Salariu asistent medical în 2026
                                                   
4.400 lei net pe lună                    ← salariul fix la stat, mediana
Jumătate iau între 4.200 și 5.400 lei.  ← P25–P75 spus omenește
                                                   
La început  4.100 lei · Cu ture și gărzi  +X lei
                                                   
Din salariile publicate de N spitale publice din M județe, martie 2026 · Cum am calculat
```

Imediat sub: tabelul pe județe (numai județele peste prag), apoi pe vechime (gradații) și pe
studii (PL / superioare). Mai jos: privatul (anunțuri), grila legală (restrânsă), ce face.

Scoatem de pe pagină: graficul CAEN 86 (media unui sector întreg, altă populație, se
contrazice cu cifra meseriei), textul despre grupa ISCO, blocul „Ce spun sursele” cu medii
puse una lângă alta, comparațiile repetate. Rămân: o singură cifră cu proveniență, distribuția
și detaliile care schimbă cifra (județ, vechime, studii, secție).

## 7. Plan

| Pas | Ce | Când |
|---|---|---|
| 1 | Registrul surselor (instituții, pagini, fișiere) — început în `surse.json` | acum |
| 2 | Cititor de tabele pe modele de fișiere + teste pe rânduri verificate manual | următoarele zile |
| 3 | Colectarea fișierelor din **30 septembrie 2026** pentru spitalele județene și DGASPC | 1–10 octombrie |
| 4 | Agregare pe meserie × județ × gradație, cu pragurile de mai sus | după colectare |
| 5 | Noul prim ecran pe primele meserii peste prag: asistent medical, infirmier, registrator medical, asistent social, îngrijitor, bibliotecar | după agregare |
| 6 | Extindere: primării, biblioteci, universități; meserii de întreținere (electrician, șofer…) „la angajatori publici” | continuu, la fiecare publicare (martie, septembrie) |

Legea transparenței salariale (L445/2026, transpunerea Directivei 2023/970) e în Senat, deci nu
construim pe ea. Când apare în Monitorul Oficial, anunțurile vor avea obligatoriu salariu, iar
pilonul privat se îmbogățește fără nicio schimbare de metodă.

## Surse

- Legea-cadru 153/2017, art. 33 — text consolidat, `research/lege153-consolidat.html`
- SERP „salariu asistent medical”, SE Ranking, 25 septembrie 2026 (răspuns AI cu sursa SCJU
  Bistrița: https://sjub.ro/wp-content/uploads/2019/10/SALARII-LUNA-SEPTEMBRIE-2019.pdf)
- https://www.paylab.ro/informatii-calculator-salarii/medicina-si-asistenta-sociala/asistent-medical
- https://meseriile.ro/salariu/asistent-medical/
- https://www.undelucram.ro/ro/salariometru
- Proiectul L445/2026: https://mmuncii.gov.ro/lege-privind-transparenta-salariala-si-consolidarea-aplicarii-principiului-egalitatii-de-remunerare-intre-femei-si-barbati-pentru-o-munca-egala-sau-o-munca-de-valoare-egala-precum-si-pentru-modificar/
- Fișierele probei: SJU Alba Iulia (31.03.2026), SCJU Cluj (martie 2026) — în `surse.json`
