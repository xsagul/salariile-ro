# Progres salariile.ro

Ultima actualizare: 21 august 2026

## Faza 1 si pipeline-ul de salarizare publica — 21 august 2026 (sesiune autonoma)

### Livrat

- **Faza 1** (commit 644f1ce): pozitie in clasament, interval real pe judete si a
  doua cifra pe cardurile din /salarii. Perechi de cifre distincte pe hub: 57 → 70
  din 102. Medic si Asistent medical se despart; cele cinci meserii IT nu, pentru
  ca impart si CAEN 62, si grupa ISCO „specialisti".
- **21 de meserii noi** (commit caec42c), fiecare pe o activitate CAEN inca
  nefolosita: 102 → 123 de meserii, 57 → 78 de chei CAEN. Ponderea meseriilor
  fara cifra proprie scade de la 67% la 55%.
- **12 comparatii noi** (commit 5271767): 25 → 37.
- **16 pagini de domeniu** (commit c4c055e), `/salarii/domeniu/{slug}` — ~1.079
  de cuvinte si 58 de linkuri interne fiecare. Echivalentul hub-ului de categorie
  de la paylab, activul lor intern cel mai puternic.
- **Clasamentul complet** (commit d1c6c98), `/salarii/clasament` — toate cele 123
  de meserii, pe query-ul „cele mai bine platite meserii din Romania".
- **Extractor PDF zero-dependente** (commits 16e45f9 → a9ab9bf):
  `scripts/lib/pdf-text.mjs`, cu test propriu care isi genereaza fixture-ul.
  API: `randuri`, `pagini`, `benzi`, `coloane`, `tabel`, `calitateText`,
  `structuraTabel`, `hartiFonturi`.

**Sitemap: 197 → 247 de rute.** Raportul de acoperire fata de cei doi competitori
e in §8bis din STUDIU-COMPETITIV-HUB-SALARIAL-2026-08-21.md.

### Ce am aflat despre sursele art. 33, si de ce conteaza

1. Institutiile publica listele ca **PDF, nu ca tabel HTML** (Primaria Sector 1:
   30 de fisiere atasate, zero tabele in pagina). De aici extractorul.
2. Un PDF nu are randuri, are fragmente la coordonate. Fara urmarirea matricei de
   text, „31.03.2026" iese ca „3 1 .0 3 .202 6". Capcana: operanzii operatorilor
   netratati (Tf, cm, re) se aduna in coada, deci Tm se citeste de la ultimii sase.
3. **Limita care blocheaza publicarea:** pe lista ISJ Galati din martie 2026,
   cuvantul „Inspector" lipseste COMPLET din stratul de text, desi „general" si
   „auditor gradul" se extrag. Sunt subfontine cu encoding propriu, fara ToUnicode.
   Rezultatul e o extragere partiala care arata plauzibil — randul are cifre si o
   bucata de denumire. Pentru date salariale asta e mai periculos decat un esec.

De aceea exista `calitateText` si de aceea **nu s-a publicat nicio cifra de
salarizare publica pe site**.

### Ce a fost rezolvat de atunci (commits 2dad703, e7e8d06, 9bf055a)

- **Siruri hexazecimale.** Listele ISJ scriu tot textul in hexa, iar extractorul
  citea doar siruri literale. Pagina iesea aproape goala.
- **CMap-uri ToUnicode.** Dupa hexa, „inspector" iesea „LQVSHFWRU" — subfontina
  isi numeroteaza glifele cum vrea. Acum parcurgem lantul resurse `/Font` →
  obiect font → `/ToUnicode` → CMap, inclusiv `begincodespacerange`.
- **Matrici de transformare.** Urmaream doar translatia, nu si scalarea, si
  ignoram `cm`. Coordonatele urcau la 24.615 pe unele fisiere.
- **Pagini rotite** 90 de grade, unde un „rand" inseamna X constant.
- **Segmentare pe coloane**, ca tabelele exportate din Excel sa nu iasa lipite.

### Sonda de fezabilitate, si de ce conteaza mai mult decat codul

Pe **7 liste reale** de la institutii diferite: **3 sunt utilizabile** (Primaria
Sector 1, ISJ Galati, Spital Judetean Targu-Jiu). Celelalte patru pica din motive
diferite — fonturi fara ToUnicode (Spital Sibiu: 52.305 din 60.962 fragmente
nedecodabile), randuri intregi scrise ca un singur sir (Miercurea-Ciuc: 27% din
fragmente), zero strat de text (Spital Mures), sau pagina fara link de PDF.

Doua lectii care schimba planul:

1. **Rata de reusita e ~43%, nu ~100%.** Un set de date national din listele
   art. 33 e un proiect de saptamani, cu tratare per generator de PDF, nu o
   sarcina de o noapte. Ce se poate face onest e un set **curat dar rar**, in
   care fiecare cifra trimite la documentul ei.
2. **Text lizibil nu inseamna tabel extractibil.** Lista Spitalului Targu-Jiu
   trece verificarea de text — 207.860 de fragmente, zero suspecte — dar
   continutul e imprastiat in 661 de fluxuri. De aceea exista acum si
   `structuraTabel`: un colector care s-ar lua doar dupa calitatea textului ar
   raporta „citit cu succes" pe zero randuri.

## Studiu competitiv: paylab.ro si undelucram.ro — 21 august 2026

Scopul proiectului s-a largit: de la "acoperim calculator-salarii.ro" la "devenim
hub-ul salarial #1 din Romania". Studiul cap-coada e in
`STUDIU-COMPETITIV-HUB-SALARIAL-2026-08-21.md`. Trei lucruri de retinut fara sa-l
deschizi:

1. **Nisa ocupationala nu e aparata de paylab sau undelucram.** Pe "salariu
   asistent medical 2026" primele rezultate sunt jurnalul.ro, cancan.ro, bzi.ro,
   playtech.ro, gandul.ro. Adversarul real e presa generalista cu cifre fara sursa.
2. **Blocaj inainte de orice extindere:** 68 din 102 meserii (67%) afiseaza
   aceeasi cifra ca alta meserie, pentru ca toate mostenesc media sectorului CAEN.
   Avocat = Notar = Contabil = Auditor = Consilier juridic. Noi etichetam corect
   (spunem ca e media activitatii), dar la 767 de pagini tiparul devine thin
   content. Gate: nicio meserie noua fara o cifra proprie.
3. **Arma pe care n-o are nimeni:** Legea 153/2017 art. 33 obliga institutiile
   publice sa publice lista functiilor cu salariul de baza si valoarea bruta.
   Acopera exact ocupatiile unde domina presa (profesor, medic, asistent, politist,
   militar, functionar). Urmatoarea publicare: 30 septembrie 2026.

undelucram.ro si ghidsalariu.ro blocheaza ClaudeBot in robots.txt, deci nu au fost
crawl-uite. Ce lipseste si trebuie vazut manual e listat in §9 al studiului.

Date brute salvate: `research/paylab-pozitii-2026-08-21.csv` (767 pozitii),
`research/salariucalculator-urls-2026-08-21.txt` (92 URL-uri).

## Cluster nou: /salarii si /compara, pe date INS proprii — 21 august 2026

Pornit de la ghidsalariu.ro/salarii si /compara. Structura e aceeasi (hub de
meserii + pagini de meserie + hub de comparatii + pagini de comparatie), dar
datele si etichetarea lor sunt facute de la zero, pentru ca ale lor nu rezista
la verificare.

**Ce am gasit la competitor (verificat in browser, 21 august):**
- Publica „date INS 2024" pentru toate cele 98 de meserii. Noi avem iunie 2026.
- Cifra din spatele fiecarei meserii e media sectorului CAEN, prezentata ca
  salariu de ocupatie. De aceea Fermier = Inginer agronom = Veterinar = 5.850
  lei, iar cele 6 meserii IT au aceeasi cifra.
- Netul lor e gresit si inconsistent: pentru 15.537 lei brut afiseaza 12.157
  lei net (78% din brut, imposibil la CAS 25% + CASS 10% + impozit 10%; corect
  e ~9.089). Pe ACEEASI pagina, „meserii similare" cu acelasi brut apar cu
  11.709 lei. Doua formule diferite, ambele gresite.
- Judetele sunt etichetate ca orase („Timisoara"), desi INS publica pe judet.

**Pipeline de date — `scripts/ins-tempo.mjs`, `npm run ins:tempo`:**
API-ul TEMPO-Online nu e documentat public. Protocolul: `GET /matrix/{cod}`
intoarce nomenclatoarele, iar `POST` pe ACELASI URL, cu optiunile selectate in
`arr` si cu `matrixName` + `matrixDetails` din metadate, intoarce un tabel HTML.
Doua capcane: `dimCode` trebuie sters din optiuni (asa face si UI-ul TEMPO, in
`sendMatrix`), iar tabelul returnat inchide celulele de date malformat
(`</td align='right'>`), deci parserul trebuie sa accepte atribute in eticheta
de inchidere. Rezultatul se scrie in `src/data/ins-caen.json` (180 KB), deci
build-ul ramane reproductibil offline.

Trei serii, cu roluri diferite si perioade diferite — nu se amesteca niciodata:
- FOM107G / FOM106G: brut si net lunar pe 102 activitati CAEN Rev.3, ultima
  luna **iunie 2026** (media pe economie: 9.564 lei brut, 5.734 lei net).
- FOM107E: brut pe 68 activitati CAEN Rev.2 x 42 judete, 2024, cu randul
  national inclus.
- FOM121B: ancheta din octombrie 2024 pe 9 grupe majore ISCO-08 x 11 grupe de
  varsta, cu numar de salariati, salariu de baza SI venit brut realizat.

FOM119D si FOM118G (CAEN x ISCO) au ultima actualizare in 2013 — inutilizabile.

**Pozitia editoriala.** INS nu masoara „salariul de programator". Fiecare pagina
spune asta explicit si arata patru cifre etichetate separat: brutul sectorului,
netul mediu OBSERVAT de INS in acelasi sector, netul standard CALCULAT cu
motorul fiscal al site-ului, si venitul brut al grupei de ocupatii. Diferenta
dintre netul observat si cel calculat e explicata, nu ascunsa.

**Livrat:** 102 meserii in 16 categorii (`/salarii/[meserie]`), 25 de
comparatii (`/compara/[pereche]`), doua hub-uri. Rutele au trecut de la 70 la
197. Toate statice.

**Doua reguli codificate, ca sa nu alunece:**
- O comparatie exista doar intre meserii din activitati CAEN diferite. Doua
  ocupatii din acelasi sector ar afisa aceeasi cifra de doua ori. `COMPARATII`
  filtreaza tacut, deci `scripts/test-meserii.mts` verifica lista sursa.
- Abaterea unui judet se raporteaza la valoarea NATIONALA a aceleiasi serii
  anuale, nu la seria lunara CAEN Rev.3. Prima versiune compara 2024 cu iunie
  2026 si arata toate cele 42 de judete sub medie, inclusiv Clujul. Corect:
  Cluj +17%, Bucuresti +13%, Timis +8%, Brasov -4%.

**Alte decizii:**
- Nomenclatorul INS vine fara diacritice si scris administrativ. Denumirile
  afisate sunt redactate de noi (`src/lib/caen-denumiri.ts`, 57 de activitati +
  22 de judete); eticheta INS originala ramane doar acolo unde CITAM sursa.
- Nu sunt in bara de navigatie, la cererea patronului. Intrare doar din footer
  (grup nou „Meserii"), din sitemap si din llms.txt.
- Scoasa banda de trei carduri (media pe economie / net observat / net calculat)
  de pe hubul /salarii: impingea lista de meserii sub fold, adica exact ce cauta
  omul care intra pe pagina. Prima meserie e acum la 592 px, in viewport.
  Cifrele raman in FAQ si pe fiecare pagina de meserie.
- Titlurile din cluster sunt verificate STRICT la 60 de caractere in
  `test-rendered.mts`, ca cele de calculator.
- 21 august, dupa lansare: „Fluturas salariu” a iesit din bara de sus si a
  fost inlocuit cu grupul „Meserii” (Salarii pe meserii + Compara doua
  meserii), dropdown ca „Ghiduri”. Header.tsx era scris pentru UN singur grup
  — `desktopOpen` boolean, refs unice, `id="desktop-ghiduri-menu"` hardcodat.
  Cu doua grupuri s-ar fi deschis amandoua odata si s-ar fi duplicat id-ul.
  Starea e acum pe grup (`desktopOpen: string | null`, refs pe eticheta,
  `groupsOpen` pe grup), iar test-ui-contracts.mts pazeste invariantul.
  Atentie: e un pariu, nu o masuratoare. Fluturasul aducea 46 de clicuri in 28
  de zile de pe pozitia 7,6; clusterul de meserii nu are inca niciun istoric.
  De reevaluat in GSC dupa 28 de zile complete.

**Verificare:** `npm run test:ci` trece integral — 197 rute cu HTTP 200, un
singur H1/main, canonical corect, 197 blocuri JSON-LD valide, 19 verificari de
continut.

**De facut la urmatoarea sesiune:**
- `npm run ins:tempo` lunar, cand INS publica luna noua; sitemap-ul isi ia
  `lastModified` din `generatLa`, deci se propaga singur.
- De masurat in GSC dupa 14-28 de zile complete daca clusterul prinde impresii
  pe „salariu <meserie>". Daca nu prinde nimic in 8 saptamani, de restrans
  catalogul la meseriile cu semnal, nu de mai adaugat.
- De decis daca intra in bara abia dupa ce exista semnal.

## Trei articole noi + imaginile de brand refăcute — 5 august 2026

Primul livrabil al scriitorului de content. Calitate bună: nicio afirmație
factual FALSĂ în cele trei articole. Dar a cerut corecturi reale de precizie,
verificate pe textele consolidate (Cod fiscal și OUG 158/2005 la consolidarea
01.07.2026).

**Integrare — de reținut pentru livrările următoare:**
- Frontmatterul folosea `image:` / `imageAlt:`. Motorul citește `hero:` /
  `heroAlt:` (`src/lib/noutati.ts`), deci imaginile NU s-ar fi randat deloc.
- `updated:` era egal cu `date:` pe articole noi; motorul cere `updated` doar
  la o actualizare reală, altfel apare „Actualizat" inutil.
- Toate cele trei titluri depășeau 60 de caractere cu sufixul de brand
  (transparența ajungea la 87). Scurtate.
- **Nu e nevoie de nicio configurare:** articolele sunt descoperite automat din
  `content/noutati/*.md`, intră singure în sitemap prin `getAllArticles()`.
  Rutele au trecut de la 64 la 67.

**Corecturi de fond aplicate:**
- *Tichete:* plafonul facilității e 4.300 lei în S1 și 4.600 în S2, nu doar
  4.600; voucherele de vacanță lipseau din excluderi; cei ~19% sunt valabili
  doar dacă deducerea personală nu se schimbă; lista zilelor nelucrate e în
  HG 1.045/2018 și era incompletă.
- *Concediu medical:* excepțiile de la diminuarea cu o zi erau 2 din 5, iar
  îngrijirea copilului bolnav NU e exceptată; zilele 2–6 sunt derogare
  temporară (art. 12 din OUG 158/2005, cu zilele 1–5, revine din 2028);
  regula „o singură zi pe episod" e din Legea 64/2026, în vigoare 18 mai 2026,
  nu din februarie; procentele 55/65/75 sunt din 1 august 2025, nu 2026;
  exemplul de 442 lei vine din Ordinul 506/1.030/2026 (MO 507/19.06.2026).
- *Transparență salarială:* evaluarea comună e obligatorie, nu „poate deveni
  necesară", cu trei condiții cumulative și termen de 6 luni; directiva spune
  „sau, în alt mod", deci nu impune salariul în anunț; adăugat calendarul exact
  de raportare (250+/150–249 → 7 iunie 2027; 100–149 → 7 iunie 2031).
- Înlocuite 3 linkuri-placeholder care duceau la rădăcina senat.ro și
  legislatie.just.ro. Toate URL-urile noi verificate cu HTTP 200.

**De reverificat pe 1 și 15 septembrie 2026:** articolul despre transparență
depinde de un proiect în Parlament, cu termene pe 2 și 8 septembrie și regulă
de adoptare tacită. Formularea „în lucru, la comisiile permanente ale
Senatului" va deveni falsă în toamnă.

Separat, imaginile de brand (iconuri, favicon, OG, hero de articol) au fost
refăcute de proprietar la calitate mai bună și deployate.

## Comparator PFA / SRL micro / SRL profit în calculator — 5 august 2026

Status: implementat, testat, deployat. Cerut de proprietar: „tabelul de ieșire
poate avea 3 butoane… și sub butoane să scrie într-o propoziție scurtă cu care
ieșeai mai bine".

- `src/lib/forme-juridice.ts` + 31 aserțiuni în `scripts/test-forme-juridice.mts`.
- **Verificare fiscală pe Codul fiscal consolidat (în vigoare 1 iulie 2026).**
  Descoperiri care contrazic majoritatea surselor online:
  - **Cota micro este 1%, unică.** Tranșa de 3% și excepțiile
    consultanță/IT/HoReCa au fost ABROGATE prin OUG 89/2025, de la 1 ian 2026.
  - **Limita de 20% la consultanță nu mai există** (abrogată prin OUG 156/2024,
    din 2025), deși e încă citată peste tot ca fiind în vigoare.
  - **Impozit pe dividende 16%** (Legea 141/2025), declanșat de **data
    distribuirii**, nu de anul profitului. Dividendele pe situații interimare
    din 2025 rămân la 10%.
  - **CASS pe dividende e pe trepte, nu procent**: 6/12/24 salarii minime →
    0 / 2.430 / 4.860 / 9.720 lei, calculate pe dividendul NET, plafonat la
    9.720. Salariul NU scutește (excepția art. 174 alin. (7) e doar pentru PFA).
  - IMCA nu e abrogată pentru 2026: e 0,5% peste 50 mil. euro, cu sunset la
    31.12.2026. Nu scrie nicăieri că a fost eliminată.
- Constantele salariale nu sunt hardcodate: costul angajatorului (51.312) și
  netul (31.638) pentru un salariu minim pe anul spart 2026 sunt derivate din
  motorul fiscal al site-ului, iar testul verifică să nu diveargă.
- Comparația e disponibilă doar în modul „din venit anual" — impozitul micro se
  aplică pe cifra de afaceri, iar la calculul invers nu știm împărțirea.
- Micro iese din clasament peste plafonul de 509.850 lei (100.000 euro la cursul
  BNR de la 31.12.2025, 5,0985), fiindcă nu mai e o opțiune legală.
- Verdictul NU declară câștigător când diferența e sub 1.000 lei: la 200.000 lei
  încasări, PFA și micro sunt la 634 lei distanță, adică sub ipoteza de
  contabilitate. Cheltuiala de contabilitate SRL e input editabil tocmai pentru
  că schimbă câștigătorul.

## Tabelele din articole erau nestilizate în producție — 5 august 2026

Status: reparat și deployat în `d0cc400`. Semnalat de proprietar cu capturi de
ecran: „zonele astea par rupte atât pc cât și telefon".

- Cauza: tabelele din zonele editoriale erau scrise ca `<table>` fără nicio
  clasă, iar `globals.css` **nu are nicio regulă pentru `table`** — fișierul
  declară explicit „zero CSS de componente". Deci se aplica stilul implicit al
  browserului: fără chenar, fără padding, coloane lipite.
- Nu era doar pe `/calculator-pfa`: **9 tabele pe 5 pagini** aveau același bug
  (`/date-salarii`, `/deducere-personala-2026`,
  `/salariu-minim-constructii-2026`, `/zile-lucratoare-2026`).
  Calculatoarele nu erau afectate — își poartă stilul inline.
- Rezolvat cu `src/app/components/TabelArticol.tsx`, Server Component care
  respectă convenția proiectului (stil în JSX, nu CSS de componente).
- Verificat pe producție: 9/9 tabele stilizate, 0 `<table>` gol rămas. Pe
  mobil pagina nu are overflow orizontal, iar tabelele late scrolează în
  interiorul propriului container.
- **De reținut ca tipar:** clasa `source-note` e folosită de 21 de ori și nu e
  definită nicăieri — aceeași categorie de bug, încă nereparată.

## /calculator-pfa terminat: normă de venit, verificare fiscală, SERP — 4 august 2026

Status: implementat, verificat și deployat. Batchul de imagini (icon-uri, OG,
`og-image.svg` cu marca „s." convertită în path vectorial) rămâne NECOMIS —
e o schimbare de brand din altă sesiune, nu ține de PFA și cere decizia
proprietarului.

- Motorul `calculeazaPfaNormaVenit` exista din sesiunea anterioară, testat, dar
  importat și nefolosit în UI (warning de lint). Acum e conectat: selector de
  regim „Sistem real / Normă de venit" în calculator.
- La normă: câmp pentru normă + încasări efective și cheltuieli reale
  opționale. Taxele se calculează pe normă; „rămâne la tine" se calculează din
  încasările reale când sunt completate. Comparație directă „la aceleași cifre,
  în sistem real" și avertisment la depășirea pragului de 126.038 lei.
- Verificare fiscală independentă pe Codul fiscal consolidat ANAF + BNR.
  Regula critică (la normă impozitul e 10% pe normă, FĂRĂ deducerea CAS/CASS)
  este CONFIRMATĂ, cu temei mai bun decât foloseam: **art. 69^2 alin. (1)**,
  nu inferența din art. 118 alin. (2). Exemplul ANAF 2026 (normă 42.150 →
  CASS 4.215 → impozit 4.215) e acum test de regresie. 39 aserțiuni PFA trec.
- Corecții factuale aplicate: „Bază CAS maximă (24 minime)" era GREȘIT —
  art. 148 alin. (2) definește 12/24 minime ca praguri sub care baza aleasă nu
  poate coborî, nu ca plafon; redenumit „Prag CAS superior". Citări corectate:
  art. 135^1 alin. (3) pentru reperul de 4.050 lei, art. 174 alin. (7)–(8)
  pentru excepțiile CASS (nu art. 180 / art. 170 alin. (2)). Termen D212 pentru
  2026: 25 mai 2027. Curs BNR 5,0415 recalculat din seria BNR 2025 și confirmat,
  dar formularea acum spune explicit că se folosește cursul anului de venit.
  Adăugat caveatul deducerii proporționale, art. 118 alin. (2^2)–(2^4).
- Cercetare SERP: competitorii presupuși (SmartBill, Accace, Termene, Contzilla,
  calculator-salarii.ro) NU concurează aici. Ocupanții reali: solo.ro și keez.ro
  ca singurele branduri, restul site-uri mici SEO. 4 din 13 au cifre 2026
  greșite sau expirate (plafonul CASS 60 vs 72 minime e linia de falie;
  quickconta.ro folosește greșit 4.325 ca reper pentru 2026).
- **Niciun competitor din 13 nu are calcul invers.** Noi îl aveam deja și nu
  era comunicat nicăieri pe pagină — acum e în primul paragraf.
- GSC: `/calculator-pfa` e indexată, dar ultimul crawl e 5 iulie, deci Google
  NU a văzut încă extinderea din 005f181/6a043a1. „calculator pfa" = poziția
  58,3 cu 103 afișări/90 zile. Long-tailul e la pozițiile 50–86.
- Reparat eroarea React de chei duplicate de pe homepage: „Pagini conexe" avea
  `/salariu-minim` de două ori.
- Verificare: `npm test` (39 aserțiuni PFA), lint, `tsc --noEmit`, build și
  `npm run test:rendered` (64 rute) trecute. Cele trei moduri ale
  calculatorului verificate în browser cu cifre confirmate manual; fără
  overflow orizontal pe mobil; toate controalele calculatorului ≥44px.

## Audit SEO complet și sprint de autoritate — 29 iulie 2026

Status: audit terminat, modificări locale verificate și un material extern publicat; batchul auditului nu a fost comis, împins sau deployat. Separat, commitul operațional `4280154` (`Add Vercel analytics reporting`) a produs un deploy Production la 07:22:18 și conține numai scriptul local de raportare plus comanda din `package.json`. Raportul complet este în `SEO-AUDIT-DEPARTAMENT-2026-07-29.md`.

- GSC 29 iunie–26 iulie versus 1–28 iunie: 2.237 vs. 495 clickuri (+351,9%), 184.388 vs. 41.281 impresii (+346,7%), CTR 1,21% vs. 1,20%, poziție 7,77 vs. 8,94. Ultimele 14 zile indică platou sănătos, nu declin.
- Auditul tehnic a confirmat 63/63 URL-uri live cu 200, 61/63 indexate individual în GSC, canonical/H1/SSR/JSON-LD corecte și Core Web Vitals bune. Plafonul principal este autoritatea externă.
- GSC Links raportează exact 67 linkuri externe din 3 domenii: Reddit 61, FaceToțiBanii 3 și FastFulfill 3. Indexurile terțe și referrerii Vercel sunt păstrate separat și nu se însumează.
- Implementat local `/date-salarii` cu Dataset/DataDownload JSON-LD, CSV, JSON, 4 înregistrări, 5 surse oficiale și test de sincronizare.
- Implementat local răspuns 410 pentru `/info`, semantică/contrast editorial îmbunătățite, adâncime maximă 3 clickuri pentru paginile calculator și snapshoturi Vercel persistente.
- Publicat pe DEV articolul `Auditing a Next.js Salary Calculator After a 4.5x Search Visibility Spike`, cu link follow către salariile.ro. DEV era deja domeniu de referință; nu se raportează ca domeniu nou și efectul nu este încă măsurabil.
- Pregătit forkul `xsagul/ro-open-source`, branch `add-salariile-ro`, commit `0dfb5d4`; PR-ul este blocat corect până la o decizie explicită privind licența codului.
- Draftul LinkedIn este în `seo-assets/linkedin-audit-seo-2026-07-29.txt`; nu a fost publicat deoarece editorul LinkedIn nu a acceptat introducerea automată a textului.
- Verificare finală: `npm test`, `npm run lint`, `npm run build`, `npm run test:rendered`, `git diff --check` și `npm run vercel:snapshot` au trecut.
- Următorul snapshot curat rămâne 4 august; batchul local poate fi deployat controlat după această citire, cu verdict direcțional la 14 zile și verdict robust la 28 zile.

## P1 SEO, securitate si plan 90 zile - 26 iulie 2026

Status: implementat, verificat, comis in `e168372` si publicat pe site la 26 iulie 2026.

- Baseline-ul GSC folosit pentru decizii este ultima fereastra completa, 27 iunie-24 iulie 2026: 2.204 clickuri, 181.049 impresii, CTR 1,22% si pozitie medie 7,77. Fata de cele 28 de zile anterioare, clickurile au crescut cu 403,2%, iar impresiile cu 397,3%; proiectul nu este in stagnare. Datele se opresc inaintea deploy-urilor P0/P1, deci efectul lor nu este inca masurabil.
- Creat `ROADMAP-90-ZILE.md`, cu matrice intentie-competitor-URL, sprinturi, KPI base/stretch, praguri de rollback, calendar de masurare, gate pentru migrarea homepage-ului si gate separat pentru AdSense. Competitorii sunt folositi ca benchmark intern, nu introdusi artificial pe fiecare pagina.
- Creat dashboard-ul reproductibil `npm run gsc:weekly -- --end=YYYY-MM-DD`; snapshoturile de control post-deploy sunt stabilite pentru 4 august si 25 august 2026.
- Inchis spatiul programmatic la 40 de pagini salariale validate prin date de cautare. URL-urile arbitrare si variantele cu zerouri initiale raspund 404. Pagina `2.574 net` foloseste corect regimul istoric S1 si inverseaza la 4.050 lei brut; fiecare pagina valida are legaturi catre vecini si sensul opus de calcul.
- Publicata pagina `/salariu-minim-constructii-2026`: 4.582 lei brut, 27,714 lei/ora, net standard 2.739 lei in S1 si 2.754 lei in S2, cu facilitate 0, comparatie cu minimul general, surse oficiale si JSON-LD Article/Breadcrumb/FAQ.
- Corectate afirmatii editoriale neverificabile sau imprecise in paginile despre salariul minim, salariul mediu, fluturas, widget, zile libere si despre proiect. HG 146/2026 este descrisa exact ca act pentru minimul general; pragul din constructii are temei separat in OUG 156/2024, art. LXIX.
- Intarit endpointul Markdown cu allowlist, origine controlata, redirect blocat, timeout, validare HTML si limita de 2 MB. Middleware-ul exclude API/assets, iar asset-urile publice fara hash nu mai primesc cache `immutable` de un an.
- Actualizat Next.js la 16.2.12 si dependentele de productie; `npm audit --omit=dev` raporteaza 0 vulnerabilitati. Auditul complet mai semnaleaza numai lantul dev-only `brace-expansion` din pluginurile ESLint, fara o actualizare compatibila cu ESLint 9 in acest moment.
- Verificare locala: ESLint, testele fiscale si PFA, TypeScript, build Next.js 16.2.12 si `npm run test:rendered` trecute. Testul rendered a verificat 63 de URL-uri, 63 de blocuri JSON-LD, un singur H1/main, canonical, allowlist, legaturi interne, Markdown si cache.
- Verificare dupa deploy: crawl live 63/63 URL-uri cu HTTP 200, exact un H1, canonical corect si JSON-LD; pagina constructii si calculul istoric 2.574 net confirmate in browser fara erori de consola; URL-urile `5551 brut` si `00004325 brut` raspund 404; Markdown raspunde `text/markdown`; endpointul direct off-list raspunde 404.
- Distribuire tehnica: sitemap-ul a fost retrimis si acceptat de Google Search Console; IndexNow a acceptat toate cele 63 de URL-uri cu HTTP 200.

## P0 fiscal, PFA si continut - 26 iulie 2026

Status: implementat, verificat, comis in `d5d022d` si publicat pe site la 26 iulie 2026.

- Motorul PFA a fost extras in `src/lib/pfa.ts` si acoperit cu teste pentru praguri, pensionari, venit zero/pierdere, exceptia salariala si calcul invers. Logica urmeaza ghidul ANAF 2026, inclusiv faptul ca diferenta CASS pana la plafonul minim nu este deductibila. Exemplul ANAF pentru venit net 57.000 lei este inclus ca test de regresie.
- Regimurile salariale 2026 sunt separate explicit: S1 (4.050 lei, facilitate 300 lei) si S2 (4.325 lei, facilitate 200 lei). Pagina programatica pentru 4.050 brut foloseste acum integral S1, inclusiv calculatorul interactiv si calculul invers.
- Validarea D112 ramane descrisa ferm si exact: formular completat separat de Sorin si verificat cu validatorul ANAF; campurile si sumele au coincis cu motorul site-ului.
- Corectate paginile `/salariu-mediu`, `/salariu-minim`, `/metodologie`, `/fluturas-salariu`, homepage si articolele afectate. Ultimul castig salarial INS publicat este mai 2026 (9.483 lei brut, 5.684 lei net); indicatorul BASS de 9.192 lei este etichetat separat.
- Articolul despre cosul minim foloseste ultima valoare publicata de FES/Syndex (septembrie 2025), fara intervale 2026 inventate.
- Contextul permanent din `AGENTS.md` a fost corectat cu snapshotul GSC real si distinctia INS/BASS.
- Verificare finala locala: `npm test` (inclusiv 22 asertiuni PFA), ESLint, TypeScript si build Next.js trecute. `npm run test:rendered` a verificat 56 de URL-uri din sitemap: HTTP 200, exact un H1, canonical corect si controalele P0 de continut/JSON-LD.
- Verificare dupa deploy: toate cele 56 de URL-uri live din sitemap au raspuns HTTP 200, cu exact un H1 si canonical corect; markerii P0 noi sunt activi pe productie.

Nota: sectiunile de mai jos sunt jurnal istoric si pot contine stari care au fost ulterior corectate.

## Standard de content + drafturi /salariu-minim - 10 iulie 2026

Status: studiu terminat, 4 variante draft construite local; NIMIC modificat pe pagina live, NIMIC comis.

Ce s-a facut:

- Userul a respins 3 propuneri de content la rand (repetitie nevazuta la review, hook in loc de raspuns, caseta "Raspuns scurt" golita de raspuns) si a cerut studiu serios inainte de orice modificare.
- Citit integral ghidul de content Adobe Spectrum (9 pagini) si scris `STUDIU-SPECTRUM-CONTENT.md` (radacina repo): 6 lentile (utilitate, placere de citit, cine cauta, intentie, cum scrii, cum faci AI sa scrie bine) + protocol obligatoriu de scriere cu AI + audit /salariu-minim (pica: repetitia tripla din primul ecran, dublura barei angajat/stat, "mai jos" directional, date contradictorii 6 vs 1 iulie, grafic fara tabel HTML, FAQ part-time vag).
- Memorie noua: `content_standards_spectrum.md` (regulile confirmate de user).
- Construite 4 variante draft in `src/app/draft-sm/` (noindex, nu-s in sitemap, NU se comit fara acord): index + v1 "Lede canonic" (interventie minima), v2 "Caseta-raspuns", v3 "Ordinea intentiilor" (drepturi + norma partiala urcate in corp, FAQ redus), v4 "Intrebarile cititorului" (H2 intrebari + bloc raspuns marcat). Module comune in `draft-sm/comune.tsx`.
- Cifre noi norma partiala calculate cu motorul fiscal (`scripts/calc-parttime.mts`): 2h brut 1.081 -> net 703; 4h 2.163 -> 1.352; 6h 3.244 -> 1.985; 8h 4.325 -> 2.699 (sanity check OK).
- Verificat in browser pe dev server: toate 4 variantele randeaza, consola curata, fraza-raspuns apare o singura data in DOM per pagina.

Userul a ales V1 si a iterat pe el: (1) separarea "Sectoare si obligatiile angajatorului" in doua sectiuni; (2) adaugarea sectiunilor din V3 "Drepturile tale la salariul minim" si "Pe ora, pe zi si la norma partiala" (cardurile SubMinim/2Ani si 6 FAQ-uri acoperite retrase, FAQ ramas la 8); (3) reechilibrare cu carduri ADITIVE noi in comune.tsx (variante nealese pastrate pe /draft-sm/carduri; cifre in scripts/calc-carduri.mts si calc-parttime.mts, toate din motorul fiscal).

Maparea FINALA V1 (validata de user, 10 iul): Ce se retine din brut -> CardPentruCe; Netul pas cu pas -> CardPastrezi + CardCatiOameni (831.382 salariati, mmuncii); Angajat/firma -> CardCifre; Drepturile tale -> CardSalariuIntarziat (art. 166 + 81); Pe ora/zi/partial -> CardOreSuplimentare + CardPartTimeGri; Minimul pe sectoare -> CardSectoareNet (net constructii 2.754); Obligatiile angajatorului -> CardCostFirma (1.704/salariat S2); Cum a crescut -> CardPutereCumparare + CardUrmatoareaCrestere; FAQ -> CardSurse. Verificat in DOM: consola curata, cifrele-cheie o singura data.

APLICAT PE LIVE (10 iul, cu acordul userului): V1 rescris ca fisier de sine statator in src/app/salariu-minim/page.tsx — metadata pastrata, JSON-LD actualizat (Article dateModified 2026-07-10 + FAQPage pe cele 8 intrebari ramase), date unificate pe 10 iulie, zero em dash-uri in text (em dash = amprenta AI, corectia userului; regula adaugata in standard). Verificat local: H2-uri in ordinea aprobata, FAQ 8=8, consola curata, npm run build trecut. Comis si impins pe main (deploy automat Vercel). NU s-au comis: draft-sm/ (raman locale), STUDIU-SPECTRUM-CONTENT.md si STUDIU-ADOBE-AI-WRITING.md (interne — contin discutia despre redactarea cu AI, iar userul a decis sa nu declare public; repo-ul e public). Cardul REGES retras (cerea verificare factuala); CardCatiOameni citeaza comunicatul mmuncii din iulie 2026.

De urmarit dupa deploy: pozitiile GSC pe query-urile "net" si "constructii" (intentia #2, ~30% din afisari, inca subacoperita — pagina dedicata constructii ramane oportunitatea principala); featured snippet pe raspunsul-intai din lede.

## /salariu-mediu restructurat pe aceeasi formula - 10 iulie 2026

Aplicat si impins pe live cu acordul userului ("pagina de test, mana libera"). Audit: aceleasi boli ca la minim (repetitie tripla in primul ecran, mediana de 4 ori, FAQ 6/8 dubluri ale corpului, grafic fara tabel, "vezi cifra alaturi" directional). GSC 90 zile (597 afisari, volum mic cum stiam): intentia #1 = valoarea oficiala pt pensie ("salariu mediu brut 2026 pentru calcul pensie" 121 imp poz 11,6 + clusterul "castig salarial mediu brut utilizat la fundamentarea bugetului" ~32% din afisari); brut > net aici (invers ca la minim).

Schimbari: lede canonic unic (caseta "Raspuns scurt" stearsa), sectiunea pensiei urcata pe locul 2 cu expresia legala EXACTA in corp (nu exista deloc; eram poz 10-11 pe cluster) + raspuns explicit la "ce salariu trebuie sa ai pentru un punct de pensie" (poz 1 deja), tabel istoric HTML nou (coloanele crestere + legea anului, existau in date nerandate), FAQ 8->4, card nou "Media fata de minim" (link bidirectional intre piloni). Cifrele verificate cu motorul (9.192 -> 5.377, CAM 207, cost 9.399 - toate corecte deja). INS mai 2026 NEpublicat inca (apare ~mijloc iulie) - aprilie ramane la zi; DE ACTUALIZAT cifra INS cand iese comunicatul (5.843/9.740 apr).

## Sprint SEO extern - 7 iulie 2026

Status: lucru extern/off-site pornit, cu Seobility, SERP si backlinkuri competitoriale verificate.

Ce s-a facut:

- Verificat Seobility in browser pe proiectul salariile.ro:
  - On-page score: 78%.
  - Tech & Meta: 90%.
  - Structure: 95%.
  - Content: 48%.
  - Backlinkuri detectate: calculatorulinflatiei.ro, dev.to/sorin_stiuriuc, fastfulfill.ro.
  - Top pages cu backlinkuri: `/` si `/salariu-minim`.
  - Link Building arata 294 oportunitati brute, dar multe sunt spam/toxice (`anomaly-seo`, `link-legion`, retele `.xyz`/`.space`).
- Identificati competitori directi noi/activi:
  - `calcultaxe.ro`
  - `totulcalculat.ro`
  - `portalx.ro`
  - `netdinbrut.ro`
  - `jobinfo.ro`
  - plus competitorii mari: `calculator-salarii.ro`, `undelucram.ro`, `salaria.ro`, `paylab.ro`, `calculatorvenituri.sdworx.ro`, `accace.ro`.
- Creat action board extern pe Desktop:
  - `C:\Users\Sorin\Desktop\EXTERNAL-SEO-ACTIONBOARD-SALARIILERO-2026-07-07.md`
- Rescris `README.md` ca asset public GitHub pentru proiect:
  - linkuri spre calculator, widget, metodologie, salariu minim, salariu mediu, PFA, fluturas, zile libere.
  - pozitionare clara: calculator salariu net/brut 2026 pentru Romania.
- Commit + push public pe GitHub:
  - `4b81236` - Improve public project profile for external SEO
- Configurat Seobility Rankings:
  - adaugate 10 keyword-uri lipsa: `widget calculator salariu`, `calculator salariu minim 2026`, `4325 brut in net`, `4325 brut net`, `zile lucratoare 2026`, `zile lucratoare iulie 2026`, `calculator salarii iulie 2026`, `calculator salariu iulie 2026`, `calculator salariu net iulie 2026`, `calcul salariu net iulie 2026`.
  - dupa salvare, Seobility a afisat `Keywords with rankings 35 / 63 +10`.
  - verificare ulterioara: unele keyword-uri noi apar in tabel cu tara `COM`, nu `RO`; cauza este default-ul `Country Google.com` din modalul `New keyword`. Trebuie re-adaugate pe `Google.ro` si apoi eliminate/ignorate variantele `COM`.
  - remediat in browser: aceleasi 10 keyword-uri au fost re-adaugate cu `Country Google.ro`; verificare prin filtrul `widget calculator salariu` arata atat randul vechi `COM`, cat si randul nou `RO`, iar headerul Seobility arata `Keywords with rankings 37 / 73 +10`.
  - variantele `COM` raman in cont, dar nu au fost sterse pentru ca stergerea ar elimina istoricul; se pot curata separat dupa confirmare.
  - completati competitorii directi in Rankings/Competitors: `calculator-salarii.ro`, `salaria.ro`, `paylab.ro`, `undelucram.ro`, `ghidsalariu.ro` plus competitorii deja existenti (`calculatoare-salarizare.ro`, `eghiseul.ro`, `papervee.com`, `leaveboard.com`, `impozitsalariu.ro`, `brutnet.ro`, `salariu-net.ro`, `calculatorvenituri.ro`).
  - `netdinbrut.ro`/`jobinfo.ro` raman de re-verificat daca incap in limita de 20 competitori sau daca Seobility le normalizeaza diferit.
- Triat primele 20 oportunitati din Seobility `Backlinks > Link Building`:
  - 2 sunt prospecte reale/posibile: `aesynero.ro`, `catalin.francu.com/blog/`.
  - 18 sunt retele spam/toxice: `anomaly-seo`, `link-legion`, `bhs-links`, domenii `.xyz`/`.space` si footprint adult/spam. Decizie: nu se replica.
  - prospecte externe curate adaugate in action board: `aesynero.ro`, `timeoff.guru`, `24conta.ro`, cu outreach pregatit doar dupa confirmare.
  - competitori reali din randurile spam notati pentru analiza, nu outreach: `leaveboard.com`, `eghiseul.ro`, `impozitsalariu.ro`, `salaria.ro`, `paylab.ro`, `calculator-salarii.ro`, `calculatoare-salarizare.ro`.
- Creat outreach pack pe Desktop:
  - `C:\Users\Sorin\Desktop\OUTREACH-PACK-SALARIILERO-2026-07-07.md`
  - `C:\Users\Sorin\Desktop\DIRECTORY-SUBMISSION-PACK-SALARIILERO-2026-07-07.md`
  - include drafturi pentru Aesynero, TimeOff.Guru, 24Conta, LinkedIn, DEV.to si Reddit.
  - include copy pentru ROTSA, RomanianStartups, StartupBlink, EU-Startups, Uneed, AlternativeTo si Startup Stash.
  - status: nimic trimis/publicat fara confirmare.
- Runda 2 cercetare off-site:
  - adaugata in action board o lista de directoare/startup databases: ROTSA, RomanianStartups, StartupBlink, EU-Startups, TrustMRR, Uneed, AlternativeTo, Startup Stash.
  - adaugate prospecte SERP din zona HR/contabilitate: GNConta, Statul de Plata, SITT, CalculatoareUsoare, Portal Codul Fiscal/Portal Codul Muncii.
  - verificat contacte publice pentru runda 2: `office@gnconta.ro`, `office@statuldeplata.ro`, `contact@sitt.ro`.
  - adaugate drafturi netrimise pentru GNConta, Statul de Plata si SITT in outreach pack.
  - concluzie: cele mai bune tinte raman paginile cu linkuri utile, articole care citeaza calculatoare vechi si site-uri HR/contabilitate fara calculator actualizat.
- Rulat GSC local pentru maparea tintelor de link building:
  - pagini prioritare pentru linkuri externe: `/`, `/salariu-minim`, `/calculator/calcul-salariu-net-4325-brut`, `/metodologie`, `/noutati/cosul-minim-de-consum`.
  - query-uri prioritare: `calculator salariu net 2026`, `calculator salarii 2026`, `salariu minim pe economie 2026 net`, `calculator salariu minim 2026`, `calculator salariu brut 2026`, `4325 brut in net`.
  - `/calculator-pfa` are 1.545 impresii si pozitie 52,4; se recomanda consolidare on-site inainte de outreach.

Urmatorii pasi off-site:

1. Decide daca stergem variantele `COM` din Seobility sau le lasam ca istoric separat.
2. Trimite, dupa confirmare, primele 3 outreach-uri catre Aesynero, TimeOff.Guru si 24Conta.
3. Trimite, dupa confirmare, runda 2 catre GNConta, Statul de Plata si SITT.
4. Publica, dupa confirmare, postare LinkedIn + articol DEV despre widget.
5. Submit, dupa confirmare, in ROTSA si RomanianStartups; apoi StartupBlink/Uneed daca pozitionarea este potrivita.
6. Verifica in Seobility daca competitorii noi pot include si `netdinbrut.ro` / `jobinfo.ro` fara sa depaseasca limita.
7. Continua trierea Seobility Link Building paginile 2-3, dar doar pentru prospecte reale, nu retele de linkuri.

## Audit SEO si marketing

Status: audit tehnic + continut + extern + AI/GEO rulat, cu doua runde de implementare publicate.

Commituri relevante:

- `6cff079` - Fix SEO metadata freshness
- `e395f18` - Add SEO pages for fiscal long-tail queries
- `9a3f698` - Document SEO audit progress
- `db8e8ea` - Remove unused app archive artifact
- `d9dfebd` - Add concise answers to key SEO pages
- `fb79ac7` - Link new guides from main navigation

Ce s-a facut:

- `npm run lint` trece.
- `npm run build` trece, 66 pagini generate.
- Au fost publicate paginile:
  - `/deducere-personala-2026`
  - `/zile-lucratoare-2026`
- Metadata a fost scurtata astfel incat crawl-ul local are:
  - 56 URL-uri crawlate
  - 0 probleme blocante
  - 0 titluri peste 70 caractere
  - 0 descrieri peste 160 caractere
- Sitemap trimis la Google si Bing.
- IndexNow a acceptat 13 URL-uri.
- Live verificat: paginile noi raspund 200.
- A fost sters artefactul mort `src/app/components.zip`.
- Au fost adaugate blocuri "Raspuns scurt" pe:
  - `/salariu-minim`
  - `/salariu-mediu`
  - `/zile-libere-2026`
  - `/calculator-pfa`
- `/salariu-mediu` a fost actualizat cu date INS aprilie 2026: 9.740 lei brut si 5.843 lei net.
- Sitemap Google/Bing si IndexNow au fost retrimise dupa aceste schimbari.
- Paginile noi `/deducere-personala-2026` si `/zile-lucratoare-2026` au fost adaugate in dropdownul principal "Ghiduri".

Rapoarte generate pe Desktop:

- `C:\Users\Sorin\Desktop\AUDIT-SEO-MASTER-SALARIILERO-2026-07-06.md`
- `C:\Users\Sorin\Desktop\PLAN-MARKETING-OFFSITE-SALARIILERO-2026-07-06.md`
- `C:\Users\Sorin\Desktop\AUDIT-SEO-SALARIILERO-2026-07-06.md`
- `C:\Users\Sorin\Desktop\AUDIT-SEO-EXTERN-SALARIILERO-2026-07-06.md`

## Urmatorii pasi prioritari

1. Verifica manual in GSC UI indexarea pentru:
   - `/deducere-personala-2026`
   - `/zile-lucratoare-2026`
2. Monitorizeaza in 7-14 zile impresiile pentru:
   - `deducere personala 2026`
   - `tabel deducere personala`
   - `zile lucratoare 2026`
   - `zile lucratoare iulie 2026`
3. Refactorizeaza `/calculator-pfa` intr-un hub complet PFA/PFA vs SRL.
4. Adauga blocuri "Raspuns scurt" pe paginile informationale mari.
5. Promoveaza linkable assets:
   - widget calculator salariu
   - tabel deducere personala
   - calendar zile lucratoare
   - metodologie calcul

## Observatii

- Blocajul SEO principal nu este tehnic, ci autoritate externa + acoperire de intentii laterale.
- `calculator-pfa` este cea mai mare oportunitate on-site ramasa.
- Nu cumpara linkuri si nu folosi widgetul ca schema agresiva de linkuri.

## Seobility competitor keyword universe - 2026-07-08

Status: completat peste lista existenta, fara stergeri.

Ce s-a facut:

- Au fost pastrate cele 73 keyword-uri existente in Seobility.
- Au fost adaugate 19 keyword-uri noi pe `Google.ro`, extrase din topurile publice AhrefsTop pentru competitorii care aveau date disponibile:
  - `undelucram`
  - `totogaming`
  - `sabroso`
  - `flip ro`
  - `salarii it`
  - `salariu contabil`
  - `salarii`
  - `contabil salariu`
  - `inginer mecanic salariu`
  - `verificare rovinieta`
  - `verificare rovinieta fara serie sasiu`
  - `verificare rovinieta online`
  - `rovinieta verificare`
  - `numar cadastral`
  - `calculator vechime`
  - `calculator concediu medical`
  - `calculator salarii 2023`
  - `calculator indemnizatie crestere copil`
  - `calculator concediu de odihna`
- In modalul Seobility s-a vazut `Keyword limit: 92 / 300`, adica 73 existente + 19 noi.
- Verificare post-save in Seobility: filtrul gaseste keyword-uri noi precum `calculator vechime` si `undelucram`.
- Au fost verificate si topurile `calculator-salarii.ro`; termenii mari (`calculator salariu`, `calculator salariu net`, `salariu net`, `calculator salarii`, `calculator salariu brut`, `calcul salariu net`, `brut to net`) erau deja urmariti sau acoperiti, deci nu au fost duplicati.
- `leaveboard.com` a fost verificat, dar topurile publice disponibile sunt United States (`federal holidays 2024`, etc.), nu Romania, deci nu au fost adaugate in proiectul `Google.ro`.
- Nu exista pagina publica AhrefsTop/Semrush folosibila pentru: `impozitsalariu.ro`, `jobinfo.ro`, `brutnet.ro`, `netdinbrut.ro`, `ghidsalariu.ro`, `calculatorvenituri.ro`, `salaria.ro`.

Raport complet pe Desktop:

- `C:\Users\Sorin\Desktop\COMPETITOR-KEYWORD-UNIVERSE-SALARIILERO-2026-07-08.md`

## Verificare volume keyword-uri in Seobility - 2026-07-08

Status: metoda de verificare gasita si aplicata.

Ce s-a verificat:

- Metoda buna: `Seobility App > Tools > Keyword Research Tool > URL/Domain > Domain > Google.ro > Organic keywords`, sortat dupa `Volume`.
- Pentru cele 19 keyword-uri deja adaugate, verificarea s-a facut si in `Rankings > Keywords`, prin coloana `S.V.`, pe `RO`.
- Seobility public keyword tool era limitat (`0 checks left today`), dar aplicatia avea `50 checks` si a permis analiza.
- Au fost verificate domeniile: `calculator-salarii.ro`, `salaria.ro`, `paylab.ro`, `calculatoare-salarizare.ro`, `undelucram.ro`, `eghiseul.ro`, `papervee.com`, `leaveboard.com`, `impozitsalariu.ro`, `brutnet.ro`, `salariu-net.ro`, `ghidsalariu.ro`, `calculatorvenituri.ro`, `netdinbrut.ro`, `jobinfo.ro`.
- `calculatorvenituri.ro` nu a returnat rezultate organice in Seobility pe `Google.ro`.
- Raportul AhrefsTop initial ramane sursa secundara; pentru decizii folosim Seobility, fiind acelasi ecosistem cu tracking-ul.

Raport complet pe Desktop:

- `C:\Users\Sorin\Desktop\SEOBILITY-KEYWORD-VOLUME-VERIFICATION-SALARIILERO-2026-07-08.md`

## Audit cap-coada pe departamente — 2026-07-31

Status: 9 echipe paralele (tehnic/QA, date, continut, crawl live, SERP,
fiscal, off-site, AI/GEO, forensic salariu-minim). Deployat commitul `1602341`.

### Descoperiri care schimba prioritatile

- **Al doilea val de trafic a inceput pe 27 iulie**, invizibil in auditul din
  29 iulie (care se oprea pe 26). Media 20-26 iul: 6.987 impresii/zi;
  27-28 iul: 18.532/zi (+142,8% pe aceleasi zile de saptamana). Confirmat
  independent de Vercel, continua pe 29-30 iulie. **Cauza neatribuibila** —
  deployul nostru a fost pe 29, dupa inceputul saltului.
  Consecinta: masurarea de pe 4 august e contaminata (doua evenimente
  suprapuse). Baseline nou de la 29 iulie.
- **CTR-ul a scazut**, nu a stagnat: 1,31% -> 1,16% (28v28). Cresterea vine
  din generice pe pozitiile 6-10.
- **Intentia "salariu minim net" e zero-click.** Forensic pe sub-intentii,
  comparat cu baseline PRE-eveniment (17-28 iun, nu cu varful din iulie):
  CTR plat sub 1% indiferent de pozitie, inclusiv pe locul 1. Recuperarea
  celor 2,5 pozitii pierdute valoreaza sub 20 clickuri/luna.
  In schimb homepage-ul a urcat pe intentia de calculator (8,67 -> 5,38),
  unde CTR-ul e 2-10%. **Decizie: nu urmarim rangul pe informational net;
  consolidam pe calculator.**
- **Autoritatea reala e ~4 domenii dofollow.** Din cele 67 linkuri GSC,
  61 sunt Reddit nofollow. Backlinkul de pe facetotibanii.ro a fost STERS
  (verificat in DOM live; GSC inca il raporteaza). Brand: 8 impresii la
  210.945 servite.
- **Clona locala era in urma cu 2 commituri**, iar `9220ac1` redenumise
  `middleware.ts` -> `src/proxy.ts`. Batchul P2 modifica middleware.ts, deci
  commitul direct ar fi pus handlerul 410 intr-un fisier ignorat de Next 16.
  Rezolvat prin rebase (git a urmarit redenumirea si a fuzionat corect).

### Livrat in productie (commit 1602341)

- `/date-salarii` + CSV + JSON live (erau 404; toate unghiurile de PR
  depindeau de ele). CSV se serveste ca `text/csv`.
- `/info` -> 410 (era indexata; 1 click/90 zile, 0 linkuri interne).
- `/zile-lucratoare-2026`: titlul/blocul "Raspuns rapid"/FAQ lunar se
  calculeaza din luna curenta. Era hardcodat pe iulie si expira pe 1 august
  pe o pagina cu 11.032 impresii, pozitia 5,11.
- Dezambiguizare 16 zile libere vs 17 sarbatori denumite (a doua zi de
  Rusalii cade pe 1 iunie in 2026). Site-ul se contrazicea singur.
- Homepage nu mai revendica fraza informationala "Salariu minim net";
  H1 + JSON-LD pe /salariu-minim aliniate cu title-ul.
- `seo-snapshots/`, `seo-assets/`, `SEO-AUDIT-*.md` -> .gitignore
  (repo public; decizie explicita a proprietarului).

### Backlog urmator, in ordine

1. **Meta descriptions rescrise de Google**: pe `/salariu-minim-constructii-2026`,
   `/deducere-personala-2026` si 2 rute `/calculator/*`, Google afiseaza
   meniul de navigatie ca snippet. De rescris descrierile ca sa raspunda
   intentiei, nu ca sa fie call-to-action.
2. **`/calculator/*` (40 pagini)**: raspunsul nu e in title, description sau
   primele 40 de cuvinte. Titlu de forma "5.000 lei brut = 2.981 lei net in
   2026". Cel mai mare deficit GEO identificat.
3. **`llms.txt` generat din cod** (route handler ca robots.txt): azi listeaza
   1 articol din 6 si 13 calculatoare din 40; divergenta e structurala.
4. **`src/lib/organization.ts`**: entitatea Organization e definita inline in
   ~9 locuri, fara `@id` si fara `sameAs`. Person e facut corect, Organization nu.
5. **Valoarea INS in 6 locuri** — comunicatul pentru iunie se asteapta
   ~12-14 august. De extras intr-o constanta unica inainte.
6. **Recuperare linkuri**: facetotibanii.ro (sters) si contractorii.ro
   (mentiune fara link). Drafturi pregatite, NETRIMISE.
7. Hub PFA (pozitia 47, acoperire tematica incompleta) si test de title
   izolat pe `/zile-libere-2026` (4 clickuri = risc zero), dupa fereastra curata.

### Neverificat

- Gmail, GSC UI, Vercel dashboard, Seobility: extensia Claude for Chrome nu
  era conectata (`list_connected_browsers` -> lista goala). Datele GSC/Vercel
  au venit prin API si scripturi locale.
- Numarul de linkuri externe din GSC nu e expus prin API; ramane cifra din
  raportul UI (67/3 domenii), care oricum supraestimeaza (vezi mai sus).

### Runda 2 — 31 iulie 2026, dupa conectarea extensiei Chrome

Deployat: `7c68f9b` (raspunsul in title/description/lead), `73c508c`
(titlu /salariu-minim sub pragul de trunchiere), plus commitul CC0.

**Din GSC UI (date pe care API-ul nu le expune):**
- Raport linkuri: exact **3 domenii**. reddit.com 61, facetotibanii.ro 3,
  fastfulfill.ro 3 = 67 total. Cele de la facetotibanii sunt linkul deja
  sters din pagina. Ramane practic **un singur domeniu editorial viu**.
- Indexare: 62 indexate, 14 nu (4 redirect, 2 x 404, 7 crawled-not-indexed,
  1 duplicate canonical).
- `/date-salarii` era "URL is not on Google" -> cerut indexare, confirmat
  in priority crawl queue.
- `/zile-lucratoare-2026` -> cerut reindexare dupa schimbarea titlului.
  GSC semnaleaza singur +165% impresii pe aceasta pagina.
- Gmail: niciun mesaj relevant in 14 zile in afara de vercel[bot].
  Nicio actiune manuala, nicio alerta.

**Livrat pe CTR:**
- 40 pagini /calculator/*: title de forma "5.000 lei brut in net = 2.981 lei
  (2026)", descriere care incepe cu cifra, paragraf-raspuns de ~42 cuvinte
  inainte de calculator. Rezultatul se calcula anterior abia in componenta;
  a fost extras intr-o functie unica folosita si de generateMetadata.
- /deducere-personala-2026: "Deducere personala 2026: 865-1.946 lei".
- /salariu-minim: titlu 70 -> 54 caractere. Era pagina cu cea mai mare
  rezerva de CTR (39.205 impresii, 0,66% la pozitia 7,74).
- Raman peste 60 de caractere, acceptat deliberat: /salariu-mediu (66),
  /zile-libere-2026 (63), /zile-lucratoare-2026 (61),
  /noutati/cosul-minim-de-consum (61).

**Licenta datasetului: CC0 1.0.**
Decizie a proprietarului. Argument: valorile sunt fapte din acte normative
si comunicate INS, asupra carora nu revendicam drepturi; o licenta cu
atribuire obligatorie ar fi neexecutabila pe fapte. Citarea ramane ceruta
ca norma, nu ca obligatie. Compromis acceptat constient: CC0 renunta la
atribuire ca obligatie, exact intr-un moment cand blocajul e numarul de
linkuri.

**Blocat:**
- Articol dev.to despre dataset scris si verificat afirmatie cu afirmatie
  (`seo-assets/dev-open-dataset-2026-07-31.md`, gitignorat).
  NEPUBLICAT: dev.to cere autentificare in browser, iar login-ul nu se face
  de catre agent. Proprietarul trebuie sa se logheze, apoi se publica.
- Reddit: 3 postari in ~2 saptamani deja; a patra a fost respinsa deliberat
  ca risc de spam. De reluat la interval mai mare.

**Backlog GEO ramas neatins:** llms.txt generat din cod, src/lib/organization.ts
cu @id si sameAs, variableMeasured ca PropertyValue, byline vizibil pe
homepage, normalizarea numelui autorului ("Sorin" vs "Stiuriuc Sorin-Marian").

## Off-site — 3 august 2026

### Backlink necunoscut, gasit prin verificare directa

`timeoff.guru/blog/ro/calculator-salariu-romania` linkeaza catre
`salariile.ro/salariu-minim`, ancora "1 iulie 2026", **fara rel, deci
dofollow**, in articol editorial. NU apare in raportul GSC de linkuri.

Ironia: timeoff.guru era pe lista de prospecti pentru outreach. Ne dadusera
deja linkul.

Concluzie de metoda: GSC subraporteaza si are intarzieri mari. Cei "3
domenii" pe care i-am tratat ca adevar sunt un minim, nu o cifra exacta.
Verificarea directa a paginii bate raportul.

### Problema reala: linkurile merg in adancime, nu spre homepage

Distributia: `/` are 64 linkuri (61 Reddit nofollow), `/salariu-minim` are
3 dofollow editoriale. Toate linkurile bune gasite pana acum
(timeoff.guru, dinpolitica.ro, fastfulfill.ro, calcul-salariu-brut.ro)
merg catre `/salariu-minim`.

Cauza e structurala: cine scrie despre salariul minim linkeaza pagina cu
salariul minim. Linkurile editoriale nu vin niciodata spre homepage.

Conteaza pentru `homepagePagerankNs`, unul dintre cele 7 atribute nebifate
din STUDIU-GOOGLE-LEAK-2024.md.

### Tinte pentru homepage (categoria care linkeaza homepage-uri)

1. **PR #1 pe `gadgetisimo/ro-open-source`** — deschis din 29 iulie, fara
   reactie. Descoperire noua: lista are si versiune de site
   (`gadgetisimo.ro/en/romanian-open-source-projects/`), unde salariile.ro
   NU apare inca. Deci PR-ul acceptat aduce DOUA linkuri, nu unul.
2. **`IonicaBizau/made-in-romania`** — lista GitHub, link spre homepage.
3. **`romania.github.io`** — colectie de baze de date deschise din Romania
   (autogari, CFR, coduri postale, buget, petitii). `/date-salarii` sub CC0
   se incadreaza exact. Cea mai buna potrivire gasita: contribui cu o baza
   de date la o colectie de baze de date, nu ceri un link.

### Prospect nou validat

`cabinetexpert.ro` — blog de contabilitate care **linkeaza efectiv in afara**
(nextup.ro, itsoftgroup.ro). Articolul lor de salarizare e din 2024 si inca
trateaza 4.050 lei ca predictie. Unghi: corectie factuala, nu cerere de link.

### Respinse, cu motiv

- `portalcontabilitate.ro`, `portalcodulmuncii.ro` — au sectiuni "linkuri
  utile" dar linkeaza EXCLUSIV intern, in propria familie de portaluri.
  Zero linkuri externe pe homepage. Ecosisteme inchise.
- `directorromania.wordpress.com`, `director-web.ro` — directoare web de tip
  vechi cu "adauga site gratuit". Aceeasi categorie respinsa in iulie
  (18 din 20 oportunitati Seobility erau retele toxice).
- `folositor.ro` — nu e prospect, e COMPETITOR cu propriul calculator.

### Context de algoritm, 3 august

Volatilitate mare neconfirmata, 1-3 august, in crestere. Search Status
Dashboard-ul oficial Google e curat pentru iulie si august; ultimul update
confirmat e spam update-ul 14-26 iunie.

Cronologie relevanta: 4 iulie, 11-12 iulie (varf 10,38/10), 18-19 iulie,
**24 iulie**, 1-3 august. Al doilea val al site-ului a inceput pe 27 iulie,
la trei zile dupa episodul din 24 iulie.

**Consecinta pentru masurare:** cele trei interventii din 31 iulie nu mai
pot fi atribuite curat. Se vor citi ca "nu au stricat nimic", nu ca "au adus
cresterea". Iar cresterea actuala poate fi retrasa la urmatoarea rulare —
nu se trateaza ca nivel nou stabilit pana nu tine 2-3 saptamani.

## AdSense — test de 24 de ore si retragere, 13-14 august 2026

### Ce s-a intamplat

Cont creat de proprietar (`ca-pub-5894290637571256`), aprobat rapid; site
"Ready", ads.txt "Authorised". Integrat pe 13 aug (`4f084d0`), reparat CSP pe
14 aug (`6b5b151`), scos complet pe 14 aug (`de84c09`).

### Bug-ul care merita retinut

CSP-ul avea `default-src 'self'` si NICIUN `frame-src` sau `connect-src`.
La primul deploy lipsea `fundingchoicesmessages.google.com` din connect-src,
deci AdSense se incarca normal dar bannerul de consimtamant era BLOCAT — adica
reclame fara acord, exact starea de evitat. **Nimic din interfata AdSense nu
semnala asta**; s-a vazut doar in consola browserului, la verificarea de dupa
deploy. Daca se repune AdSense, comentariile din `src/proxy.ts` si
`src/app/layout.tsx` listeaza tot ce trebuie repus.

### Masuratoarea care a decis retragerea

Cu scriptul activ si ZERO unitati de anunt, pe utilizatori reali (Umami):

| metrica | inainte | dupa | delta |
|---|---|---|---|
| LCP median | 760 ms | 884 ms | +16% |
| INP median | 64 ms | 80 ms | +25% |
| CLS median | 0,007 | 0,007 | 0 |
| timp median pe pagina | 27-37 s | **22 s** | minim al seriei de 12 zile |

Traficul a ramas in plaja de zgomot (262 -> 280 sesiuni in primele 20h, fata
de un baseline de 300-340 in zile lucratoare). Frica initiala de scadere de
trafic NU s-a confirmat; semnalul real a fost pe timpul pe pagina si CWV.

Venit estimat la trafic actual: **~66 lei/luna** (7.227 afisari/luna, 1,38-1,55
pagini/vizita, RPM RO ~2 $). Pentru 100 $/luna ar trebui ~7x traficul.
Concluzie: platam intreg costul pentru zero venit, fiindca nu existau unitati
de anunt. Proprietarul a ales retragerea completa.

### Ce ramane castigat

Aprobarea de cont NU se pierde. Google cere recenzie noua abia dupa **5 luni**
fara reclame afisate. Mesajul CMP ramane publicat (inactiv fara script).
Repunerea = ~10 minute.

Nota de conformitate: paginile legale au fost rescrise de doua ori si NU
pretind ca testul nu a existat. `/cookies` pastreaza o sectiune cu ce s-a
masurat si de ce s-a renuntat.

Reziduu cunoscut: vizitatorii din fereastra de 24h raman cu un cookie `FCCDCF`
orfan pana expira. Nimic nu il mai citeste. Vizitatorii noi: zero cookies,
zero localStorage, zero domenii externe (verificat in productie).

### UMAMI DEBLOCAT — cel mai valoros rezultat al zilei

Nu e nevoie de share URL si nu exista chei de API in self-hosted 3.2.0.
Exista o clona locala la `~/Desktop/umami` cu `DATABASE_URL` catre Neon.
`pg` e instalat acolo, deci scripturile trebuie rulate DIN acel folder.
Website id: `17dce2b5-ee24-4155-9ad9-a7ed937066fd`.
Coloanele CWV (lcp/cls/inp/fcp/ttfb) sunt direct pe `website_event`.
Evenimentul `timp-pagina` are proprietatile in `event_data` (`cale`, `secunde`).

Prima observatie din date — timp median pe pagina:

| pagina | timp median |
|---|---|
| /noutati/concediu-medical-2026 | 63 s |
| /deducere-personala-2026 | 47 s |
| /salariu-mediu | 35 s |
| / | 31 s |
| /zile-lucratoare-2026 | 20 s |
| /noutati | 8 s |

Continutul explicativ retine de 3x mai mult decat calculatorul. Relevant
indiferent de modelul de business ales.

### Decizie deschisa

Proprietarul se consulta saptamana viitoare pe directie: reclame vs produse
software (salarizare, facturare, plati). Pasul care dezamorseaza intrebarea e
instrumentarea (`calcul`, `calcul-pfa`, `descarca-fluturas`, `copiaza-embed`) —
ar arata in 2-3 saptamani cati vizitatori sunt angajati care verifica un
salariu vs angajatori/PFA care ar plati. Momentan exista UN SINGUR eveniment
custom in tot codul (`TimpPePagina.tsx:52`).

## Caching: site scos din render dinamic, 15 august 2026

Commit `d9d0619`. Cauza unica era `await headers()` in root layout (nonce CSP +
`x-pathname`). Un API dinamic in root layout scoate INTREGUL site din static.

**Rezultat masurat in productie:**

| | inainte | dupa |
|---|---|---|
| rute dinamice / statice | 26 / 6 | **3 / 28** |
| X-Vercel-Cache | MISS pe tot | **HIT** |
| Cache-Control | `private, no-cache, no-store` | `public, max-age=0, must-revalidate` |
| ISR zile-lucratoare-2026 | cod mort | **12h, activ** |

Structura: route groups `(site)` si `(embed)` in loc de citit headere.
URL-urile sunt neschimbate (grupurile nu apar in URL), git a inregistrat totul
ca redenumiri.

CSP diferentiat: pagini publice `script-src 'self' 'unsafe-inline'`, rute de
widget `'self' 'nonce-...' 'strict-dynamic'`. Justificare: paginile publice nu
primesc niciun input de utilizator, widgetul e singurul care citeste `?brut=`
si ramane dinamic oricum. `unsafe-hashes` scos (niciun handler inline in src/).

**DE VERIFICAT peste cateva zile:** TTFB-ul de teren din Umami
(`website_event.ttfb`). Inainte: 395-465 ms mediana. curl de pe masina arata
~190 ms, dar nu e comparabil — se compara doar date de teren cu date de teren.

### Doua capcane de proces, ambele au produs rezultate false

1. `.next` retine tipuri generate pe vechile cai dupa mutarea fisierelor.
   `rm -rf .next` inainte de build, altfel typecheck-ul esueaza aiurea.
2. **Am raportat un deploy care nu existase.** Eram pe ramura
   `curatenie-caching`, iar `git push origin main` impingea `main`-ul
   nemodificat — "Everything up-to-date", exit 0. In plus, verificarea de
   propagare cauta `unsafe-inline`, sir care exista deja in `style-src`, deci
   a dat fals pozitiv. Doua greseli care s-au acoperit una pe alta.
   Regula: verifica `git branch --show-current` inainte de push, si alege
   pentru propagare un sir care exista DOAR in build-ul nou.

## Audit SEO cap-coadă, 21 august 2026

Sesiune cu trei agenți în paralel (off-site, SERP, on-page) plus tragere de
date GSC, Bing, Umami și Vercel Analytics. Commit: `5aa3b54`.

### Creșterea e reală și mare

| | baseline 27 iun – 24 iul | 24 iul – 21 aug |
|---|---|---|
| clicuri | 2.204 | **4.693** (+113%) |
| impresii | 181.049 | **429.491** (+137%) |
| poziție medie | 6–10 pe generice | ~5,6 |

### CTR-ul agregat e o problemă de MIX, nu de calitate

| segment | interogări | clicuri | impresii | CTR | poz |
|---|---|---|---|---|---|
| cu an (2026) | 295 | 1.869 | 95.318 | **1,96%** | 4,8 |
| fără an | 705 | 1.324 | 162.439 | **0,82%** | 6,1 |

Cap de serie: „calculator salariu net" 54.076 impresii / 0,6% / poz 5,7 vs
„calculator salariu net 2026" 6.505 impresii / 4,6% / poz 3,3 — clicuri aproape
egale (323 vs 299) din de 8x mai puține impresii. Confirmă nota din memorie:
nu trata CTR-ul agregat ca metrică de calitate fără să-l descompui.

### Clusterul „zile lucrătoare" e zero-click. DOVADĂ, nu ipoteză.

Ambii agenți au recomandat ca **prioritate 1** construirea a 12 pagini pe lună,
pe argumentul „titlu potrivit pe lună = 9–13% CTR". **Am verificat și e fals.**
Cele 9–13% erau interogări de *calculator* (homepage), nu de zile lucrătoare.

Experiment controlat, din propriile date, aceeași pagină, două luni:

| fereastră | titlul spunea | interogare | clicuri / impresii | CTR |
|---|---|---|---|---|
| 1–31 iulie | „iulie" | zile lucratoare iulie 2026 | 15 / 6.290 | **0,2%** |
| 1–18 august | „august" | zile lucratoare august 2026 | 9 / 3.603 | **0,2%** |

Potrivirea titlului cu luna nu schimbă nimic. Cluster total: 38.761 impresii,
222 clicuri, 0,57% CTR, la poziția **4,5**. Google și competitorii (pluxee,
edenred) afișează numărul direct în SERP. **Nu construi pagini pe lună.**

Ce s-a făcut în schimb: titlul devine anual (interogarea anuală e cea mai mare
a paginii, 14.979 impresii, și primea un titlu care promitea altă lună), luna
rămâne în descriere.

### Canibalizare, două cazuri

1. **Rezolvat azi.** Trei ancore „Zile libere și lucrătoare 2026" trimiteau spre
   `/zile-libere-2026`. Efectul: pagina „lucrătoare" e pe **1,0** pe „sarbatori
   legale august 2026", iar pagina „libere" pe **55,2** pe „sarbatori legale
   2026". Ancore dezambiguizate + intrare separată pe homepage.
2. **Deschis.** `/salariu-minim` deviază ~2.128 impresii de „construcții" de la
   `/salariu-minim-constructii-2026` — ambele apar în același SERP pe aceleași
   interogări. Sursa: secțiunea „Minimul din construcții" din
   `salariu-minim/page.tsx:583-589` + „construcții" în descrierea Article.

### /calculator-pfa: 39 impresii în 28 de zile

Nu e defect tehnic. Indexată, prerender static, canonică proprie, 8.721 de
cuvinte, în sitemap. Dar **95,8% din impresii sunt de pe poziția 20+**, iar pe
potrivirea exactă a propriului titlu („calculator taxe pfa 2026") stă pe 59,7.
E autoritate, nu on-page. **Nu investi acolo.** Observație utilă: 8 din primele
10 rezultate au „PFA vs SRL" în titlu; noi avem comparația în corp, nu în titlu.

### Umami: 7 zile de date de conversie (evenimente din 15 august)

- **~40% din sesiuni finalizează un calcul.** Mobil 42,5% > laptop 32,8%.
- `calcul-finalizat` 1.439 · `descarca-fluturas` 71 · `calcul-pfa` 48 ·
  `copiaza-embed` **0 (niciodată)**
- `mod-calcul`: **net→brut 185 vs brut→net 75** — 71% vor sensul invers celui
  implicit. Merită testat ce se întâmplă dacă modul implicit se schimbă.
- 63 din 71 de descărcări de fluturaș vin din calculator, doar 8 din
  `/fluturas-salariu` (pagina are 9s timp median — cel mai slab de pe site).
- Mobil 55,8% din sesiuni.
- Surse: google 1.167 · direct 316 · bing 112 · ddg 27 · brave 21 · **chatgpt 8**
  (pe 31 de zile, Vercel Analytics: **chatgpt 50**, claude 4, gemini 2 —
  traficul din LLM-uri depășește deja orice referrer clasic non-motor).

**Pentru decizia reclame vs produs:** publicul e covârșitor B2C — angajați care
își verifică salariul o dată. PFA (potențial plătitor) e ~3% din utilizarea
calculatorului, embed-ul 0%. Datele NU susțin un produs plătit pentru publicul
actual.

### CORECȚIE la nota de caching din 15 august

PROGRES.md susținea un baseline TTFB de „395–465 ms mediană". **Nu există în
date.** Măsurat pe teren (Umami), excluzând ziua deployului:

| | TTFB avg | p50 | p75 | p95 | LCP p50 | LCP p75 |
|---|---|---|---|---|---|---|
| înainte (2–14 aug) | 305 | 180 | 322 | 823 | 784 | 1.204 |
| după (16–20 aug) | 287 | **170** | 305 | 897 | **688** | 1.100 |

TTFB-ul era deja bun și abia s-a mișcat. Câștigul real e pe **LCP: −12% la
mediană**. Refactorizarea a meritat, dar nu pentru motivul consemnat.

CWV pe dispozitiv (p75, după refactorizare): laptop trece tot în verde; **mobil
pică pe CLS (0,147 > 0,1)** și e la limită pe INP (120 ms). Mobilul e 56% din
trafic și convertește cel mai bine — CLS-ul de pe mobil e următoarea țintă CWV.

### Off-site: s-a mișcat, dar constrângerea rămâne

| | anterior | azi (verificat) |
|---|---|---|
| domenii care linkează (non-social) | 3 | 5 |
| dofollow **și independente** | ? | **2** (timeoff.guru, dev.to) |
| linkuri Wikipedia RO | 0 | **4, în 3 articole** |
| InLinks după Bing | — | 21 → 57 în 6 săptămâni |

Wikipedia RO a acceptat site-ul ca sursă citabilă în trei articole
(`Salariul minim pe economie în România`, `Salariu minim pe economie`,
`Salariul mediu în economia României`) — citări `{{Citat web}}`, nofollow, dar
e cel mai greu prag și e trecut. Saltul Bing e cel mai probabil propagare de
mirror-uri Wikipedia, **nu** autoritate nouă. Diagnosticul din 10 august stă.

**Widgetul nu e balast — e activ gata, fără distribuție.** `/widget` are 0
impresii GSC și 0 evenimente `copiaza-embed`, dar livrează 3 snippeturi fiecare
cu link de atribuire **dofollow**. Niciun site terț nu l-a încorporat. E cea mai
scalabilă pârghie de linkuri nefolosită.

API-ul Bing `GetUrlLinks`/`GetLinkCounts` returnează gol pentru proprietate
(nu e problemă de cheie — `sites` și `queries` merg). Nu se poate enumera
profilul de linkuri de acolo; `GetCrawlStats.InLinks` e singurul semnal.

### Ce s-a schimbat azi (commit 5aa3b54)

- titlu anual pe `/zile-lucratoare-2026`, luna mutată în descriere
- `title: { absolute }` pe `/zile-lucratoare-2026`, `/zile-libere-2026`,
  `/salariu-mediu` — avertismentele de titlu >60 car. scad **5 → 2**
- trei ancore dezambiguizate + link nou spre zile lucrătoare din homepage
- `public/llms.txt` lista **1 articol din 10**; completat, iar `npm test`
  prinde de acum derivarea (`scripts/test-ui-contracts.mts`)

Verificat: `npm run test`, `npm run lint`, `rm -rf .next && npm run build`,
`npm run test:rendered` — toate verzi, 68 de rute, 3 rute dinamice neschimbate,
ISR 12h păstrat pe zile-lucrătoare.

### Capcană de mediu, costă timp dacă nu o știi

Git Bash convertește argumentele care încep cu „/" în căi Windows.
`node scripts/gsc.mjs queries --page=/calculator-pfa` devine
`page~C:/Program Files/Git/calculator-pfa` și returnează **0 rânduri fără
eroare** — arată exact ca „pagina nu are date". Fix: `export MSYS_NO_PATHCONV=1`.

### Următoarele, în ordine

1. **CLS pe mobil** (0,147 p75) — 56% din trafic, singurul CWV în roșu
2. **Distribuție widget** — activul e construit, zero embed-uri terțe
3. **Canibalizarea construcții** din `/salariu-minim`
4. **Wikipedia**: 4 articole RO subcitate identificate ca ținte legitime
   (`Fiscalitatea în România` are 5 `<ref>` la 24.238 caractere). Atenție WP:COI
   — se declară pe pagina de discuție, doar `{{Citat web}}`, niciodată
   „Legături externe".
5. **NU** construi pagini pe lună pentru zile lucrătoare (vezi dovada de mai sus)
