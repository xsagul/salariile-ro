# Interfețe și fișiere verificate

Aceste exemple sunt cereri de citire. Nu conțin chei. Parametrii dintre acolade se înlocuiesc din catalogul furnizorului, nu se ghicesc. Datele de răspuns din exemplele documentațiilor comerciale nu sunt salarii reale de importat.

## 1. COR

```text
GET https://data.gov.ro/api/3/action/package_show?id=clasificarea-ocupatiilor-din-romania
```

Se citesc `result.license_id`, `result.license_title`, `result.resources[].url`, `last_modified`, `format`. Fișierul oficial de coduri este pachet Word XML: `pkg:part` cu `pkg:name=/word/document.xml`, rânduri `w:tr`, celule `w:tc`, texte `w:t`. Scriptul `inspect-core.py` extrage codul de șase caractere și denumirea; a verificat unicitatea celor 4.537 coduri extrase. Nu extrage salarii.

## 2. TEMPO

```text
GET http://statistici.insse.ro:8077/tempo-ins/matrix/FOM121A
```

Metadate: `dimensionsMap`, cu opțiuni și identificatorii selecțiilor (`nomItemId`, `offset`, `parentId`). Interogarea folosită de scripturile existente trimite POST cu `language`, `arr`, `matrixName`, `matrixDetails`; răspunsul conține `resultTable` HTML. Structura exactă a selecției se construiește din metadate. Nu se copiază identificatori dintr-o altă matrice.

În această sesiune portul a refuzat conexiunea. Documentăm protocolul existent, nu pretindem un test reușit acum. Pentru exploatare: exportul oficial / un acces convenit cu INS, limitare de rată, cache și alerte la schimbarea metadatelor.

## 3. Eurostat — cerere concretă cu rezultat verificat

```text
GET https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/earn_ses22_21?lang=EN&geo=RO&time=2022&sex=T&indic_se=ERN&isco08=OC7&sizeclas=GE10&age=TOTAL&unit=NAC&freq=A
```

Celula din răspunsul integral verificat: **4.781**. Unitate: lei, câștig mediu brut lunar; grupă ISCO 7; SES 2022; întreprinderi 10+; sfera NACE B–S fără O. Nu COR6, nu salariu 2026.

Fișiere păstrate: `raw/eurostat-ses22-21.json`, `raw/eurostat-ses22-48.json`. Dicționarele din `dimension` trebuie folosite la decodificarea `value` și `status`; poziția într-o matrice JSON-stat nu este un cod de ocupație.

`earn_ses22_48` verificat: aceleași principii, cu activitate economică. Catalogul descărcat confirmă `_03`, `_53`, `_54` pentru numere de salariați și `_21`, `_25`, `_48` pentru medii lunare în ediția 2022. Aceste tabele nu dau quartile individuale de meserie.

Am testat și `earn_ses_monthly`. Dicționarul său include valori care nu au observații pentru selecția dorită. Interogarea de diagnostic pentru `RO / 2022 / OC7 / FT` a rămas fără valori; nu completăm `null` cu zero și nu deducem o mediană din existența codului `MED_E_EUR`.

## 4. ILOSTAT — codurile actuale, nu vechile denumiri

```text
GET https://rplumber.ilo.org/metadata/toc/indicator?lang=en&format=.csv
GET https://rplumber.ilo.org/data/indicator/?id=EAR_EMTA_SEX_OCU_NB_A&ref_area=ROU
GET https://rplumber.ilo.org/data/indicator/?id=EAR_EMTM_SEX_OCU_NB_A&ref_area=ROU
```

Primul export verifică identificatorul înainte de descărcare. Un identificator vechi, `EAR_4MTH_SEX_OCU_CUR_NB_A`, a primit explicit eroare „deprecated or invalid”. Nu construim integrarea dintr-un exemplu vechi găsit pe internet.

Exporturile RO au antet CSV și BOM UTF-8; parserul folosește `utf-8-sig`. Se păstrează `source`, toate notele și `obs_status`, alături de valoare. Coduri efectiv observate: `OCU_ISCO08_0`–`9`, totaluri și grupe de competență, plus ISCO88 istoric. Granularitatea nu ajunge la ocupația individuală. Unitatea și natura venitului se confirmă din notele sursei înainte de folosirea oricărei sume.

## 5. Paylab — contract API citit, fără acces salarial cumpărat

Specificație: [OpenAPI 1.2](https://api.swaggerhub.com/apis/Profesia/PaylabPublicApi/1.2). Bază: `https://paylab.com/paylab_api/v1`. Autentificare: antet `X-Auth-Token`.

```text
GET /countries
GET /category_positions
GET /country/{country}/category_positions
GET /country/{country}/category_position/{catpos}/advanced
GET /country/{country}/category_position/{catpos}/full
```

`country` este ID-ul intern returnat de catalog. Din `Country` se citesc inclusiv `code`, `currency`, `salaryType`. Din `CountryCatpos`: `model`, `count`, `quality`. Din rezultate: `quantiles.average`, `q25`, `q50`, `q75`, cu moneda și identificatorul rolului. Full oferă defalcări marginale; documentația exclude combinarea parametrilor.

Fișierul local `paylab-api-verified.json` păstrează schema rezumată. Exemplele de tip `count:123` ori `quality:3` din OpenAPI sunt **exemple ale documentației**, nu date pentru România.

## 6. Anunțuri — câmpuri obligatorii la ingestie

[Ashby](https://developers.ashbyhq.com/docs/public-job-posting-api):

```text
GET https://api.ashbyhq.com/posting-api/job-board/{JOB_BOARD_NAME}?includeCompensation=true
```

[Greenhouse](https://developers.greenhouse.io/job-board.html):

```text
GET https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs/{job_id}?pay_transparency=true
```

Parserul păstrează salariul ofertat, componentele, periodicitatea, moneda, eligibilitatea geografică, perioada și sursa de origine. Net/brut necunoscut rămâne necunoscut. Nu presupunem că un API public al unei platforme de cariere autorizează agregarea repetată a tuturor clienților săi.

Pentru [Jooble](https://help.jooble.org/ro/support/solutions/articles/60001448238-documenta%C8%9Bie-rest-api), se folosește cheia regională și schema documentată. `salary` este text, iar `updated` nu dovedește singur data primei publicări sau faptul că oferta este încă activă. Pentru [Lightcast](https://docs.lightcast.io/lightcast-api/reference/overview-global-job-postings), accesul este OAuth2 / `postings:global`; schema produsului cumpărat trebuie să distingă oferta publicată de imputare.

## 7. Exemplu de fișier public XLSX

[UAUIM, martie 2026](https://www.uauim.ro/universitatea/personal/2025-2026/Transparenta%20veniturilor%20salariale%20cf.%20L153-2017%20martie%202026.xlsx).

Antetul este pe rândul 5; funcție în A, bază în B, tip spor în C, procent în D, bază de calcul în E, valoare brută spor în F, temei în G. Pentru „Contabil șef”, rândul 181, B181 este 10.115. F181 este un spor distinct, nu un al doilea salariat și nu salariul de bază.

Unele rânduri următoare au funcția goală și continuă componentele aceleiași funcții. Nu se completează în jos identitatea apoi se numără fiecare spor ca observație salarială. Fișierul nu furnizează aici `n` angajați, experiență sau COR. Fișierul brut local are extensia `.xml` din clasificarea MIME a colectorului, dar conținutul este XLSX și a fost citit ca atare din bytes; metadatele de proveniență păstrează tipul original.

## 8. Reproducerea verificărilor locale

Se rulează din rădăcina proiectului cu Node și Python disponibile în mediul local:

```text
node research/salarii-cor-2026-09-05/collect-sources.mjs
node research/salarii-cor-2026-09-05/fetch-evidence.mjs research/salarii-cor-2026-09-05/targets-year-tables.json
python research/salarii-cor-2026-09-05/inspect-core.py
node research/salarii-cor-2026-09-05/analyse-evidence.mjs
python research/salarii-cor-2026-09-05/summarise-tables.py
python research/salarii-cor-2026-09-05/read-public-pay.py
```

Rerularea poate primi alte răspunsuri: sursele se schimbă și anunțurile expiră. Snapshotul, data și hash-ul sunt referința cercetării, nu promisiunea că un URL va rămâne identic. Fișierele brute sunt dovezi interne; dreptul de distribuire a fiecăruia se verifică separat.
