# Pariu: /calculator-pfa pe pagina 1

Convenit între proprietar (Știuriuc Sorin-Marian) și agent, 2 septembrie 2026.
Scris aici pentru că niciunul dintre noi nu se poate baza pe memorie: agentul
nu are continuitate între sesiuni, iar o lună e lungă.

## Termeni

**Țintă:** `/calculator-pfa` ajunge pe **poziția ≤ 8** pentru interogarea
`calculator pfa`, măsurată în Google Search Console.

**Termen:** până pe **2 octombrie 2026** (o lună de la stabilirea pariului).

**Măsurare:** `node scripts/gsc.mjs queries --query=calculator pfa`
Poziția medie pe fereastra de 28 de zile care se încheie cel mai aproape de
2 octombrie. Nu poziția dintr-o zi bună.

## Punctul de plecare, 2 septembrie 2026

| | |
|---|---|
| Poziție `calculator pfa` | **30,6** |
| Impresii (28 zile) | 64 pe interogare · 5.620 pe pagină |
| Clickuri | 1 pe interogare · 30 pe pagină |

Baseline complet de site: `GSC-BASELINE-POST-MIGRARE-2026-09-01.md`
Analiza care stă la baza planului: `SXO-CALCULATOR-PFA-2026-09-02.md`

## Reguli

1. Pagina e a agentului. Proprietarul nu intervine pe ea.
2. Agentul nu trimite emailuri și nu postează nimic direct. Compune; textul
   e citit și trimis de proprietar, care rămâne răspunzător pentru ce apare
   sub numele lui.
3. Fără cumpărare de linkuri și fără tactici care riscă penalizare — regula
   e din CLAUDE.md și rămâne valabilă și în interiorul pariului.
4. Prioritatea e linkable assets și arhitectura internă, nu outreach rece.
   La o lună linkurile reci nu apucă să compună.

## De ce contează rezultatul, indiferent cine câștigă

Ipoteza agentului: pagina stă la 30 din cauza **formei** — nu semnala că e
unealtă de comparație, deși funcția exista ascunsă în calculator.

Dacă urcă: forma conta, iar aceeași metodă se aplică celorlalte pagini slabe.
Dacă nu urcă: constrângerea e **autoritatea**, iar propriul audit al site-ului
o spune deja — off-site, nivel F. Atunci resursele trebuie mutate acolo, iar
optimizarea de structură e o distragere. Ambele răspunsuri sunt utile.

## Jurnal

- **2026-09-02** — Faza 1: titlu, descriere și hero anunță comparația PFA vs
  SRL; blocul „Răspuns scurt" coborât sub calculator; hero comprimat de la 6
  la 2 rânduri pe mobil. Commit `21c93cd`.
- **2026-09-02** — Sesiunea alocată. Termenul s-a scurtat la **1 lună**
  (2 octombrie 2026), la cererea proprietarului: mai devreme = procent mai
  mare; la fix o lună 51%; la o lună și o zi egalitate; peste, pierdut.

  Ce s-a făcut:
  1. Faza 1 pe pagină (commit `21c93cd`) — titlu, descriere și hero anunță
     comparația PFA vs SRL; „Răspuns scurt" coborât sub calculator.
  2. Grup „Instrumente" în bară (commit `98508a6`) — +1 link intern crawlabil
     către pagină pe toate cele 298 de rute. Măsurat pe HTML livrat.

  Ce NU s-a făcut, și de ce:
  - **Faza 2 abandonată ca inutilă.** Plănuiam să scot comparația PFA vs SRL
    în față. Verificând componenta, era deja acolo: primul element din panoul
    de rezultat, comutator în trei căi, verdict sortat, cu micro exclus peste
    plafonul de 100.000 €. Singurul gol era că pagina n-o anunța — reparat la
    faza 1. A modifica o componentă corectă pentru câștig marginal ar fi fost
    o greșeală.
  - **Fără outreach.** La 30 de zile linkurile reci nu apucă să compună.

  ## Riscul principal, și singura acțiune cerută proprietarului

  `gsc inspect` arată **ultima crawl pe 10 august 2026** — 23 de zile.
  Dacă intervalul se menține, Google s-ar putea să nu vadă schimbările înainte
  de 2 octombrie. Optimizarea unei pagini necitite nu produce nimic.

  **Acțiune cerută: „Request Indexing" în GSC pentru /calculator-pfa.**
  E acțiune de cont, nu intervenție pe pagină, deci nu strică pariul.

  ## Context istoric găsit în Header.tsx

  Pagina a pierdut locul doi din bară pe 10 august 2026, dar NU de-aia a căzut:
  îl pierduse fiindcă era deja pe poziția 48 cu 3 clickuri. De atunci a urcat
  singură la 30,6. Trendul era deja pozitiv înainte de intervenția mea — ceea
  ce înseamnă că o eventuală urcare nu se poate atribui integral schimbărilor
  de azi.

- **2026-09-02, sesiunea a doua.** Măsurătoare la zi: `calculator pfa` a urcat
  de la 30,6 (28 zile) la **23,5** (7 zile) și 24,2 (3 zile). Eșantion mic —
  9-19 impresii — deci direcție, nu dovadă. Varianta `calculator pfa 2026` stă
  deja la 11,7-13,2.

  **Ce s-a făcut:** articol `/noutati/pfa-sau-srl-2026` (commit `80493c6`).

  Motivul, în ordinea în care a fost descoperit:
  1. Pagina era o insulă. Subiectul PFA apărea o singură dată în tot restul
     site-ului, deci nu exista de unde să vină suport tematic.
  2. Clusterul PFA vs SRL exista în GSC, cu site-ul pe pozițiile 40-80. Cerere
     reală, nefolosită.
  3. Locurile 1 și 2 pe „calculator pfa" (SOLO, StartCo) câștigă exact pe acest
     unghi — îl au în titlu.
  4. Motorul de calcul era deja construit și testat. Cifrele din articol sunt
     produse cu el, nu preluate din presă.

  Articolul aduce patru linkuri contextuale către pagină, din conținut
  relevant tematic — altceva decât linkul de navigație adăugat dimineață.

  **De făcut de proprietar:** imaginea hero pentru articol. Câmpul e opțional
  în cod, dar celelalte 11 articole au una și lipsa se vede în listare.
