# Arhitectura colectării continue, din mai multe surse

Decizia proprietarului, 26 septembrie 2026: colectare continuă din mai multe surse, fără
să întrebăm utilizatorii și fără cereri către instituții, ca fiecare job să aibă un salariu
de referință mai granular decât la orice concurent. Completează `STRATEGIE.md`.

## 1. Sursele, pe ce răspund

| Pilon | Sursă | Ce aduce în plus față de concurenți | Frecvență | Stare |
|---|---|---|---|---|
| **Plătit** (sector public) | Listele art. 33 L153/2017, de la spitale, DGASPC, biblioteci, primării, consilii județene, universități | salariul plătit pe post: bază + fiecare spor; secție, gradație, studii; județ real | 31 martie, 30 septembrie | registru început (`surse.json`), proba pe asistenți medicali |
| **Oferit, oficial** | ANOFM — `mediere.anofm.ro` (Legea 76/2002: declarare obligatorie) | **cod COR pe fiecare ofertă**; brut/net declarat; minim și maxim; normă; experiența cerută; studii; județ, localitate; CUI | zilnic | **colector în producție** (`scripts/colectare/anofm.mjs`, `.github/workflows/colectare.yml`) |
| **Oferit, piață** | Platformele existente: OLX, eJobs, BestJobs, Publi24, Anuntul, hipo, undelucram | intervalele reale din anunțuri; privatul pur | săptămânal (de programat) | colector existent (`scripts/crawler/`), rulat manual |
| **Oferit, angajator** | Site-urile de cariere ale angajatorilor mari care publică salariul pe post și magazin: Lidl, Kaufland (confirmate), apoi Profi, Mega Image, Pepco, Dedeman, eMAG, curierat, producție | salariul direct de la angajator, pe oraș; volum mare pe meseriile de masă | săptămânal | de construit |
| **Legal** | Legea 153/2017, grilele | treapta și gradația, pentru meseriile de la stat și cele exceptate de art. 33 (poliție, armată) | la modificarea legii (numai după Monitorul Oficial) | existent |

Un pilon nu se topește în altul (CLAUDE.md, „Cei trei piloni…”). Salariul de referință al
unui job e **cifra pilonului celui mai potrivit pentru acel job**, cu ceilalți alături, nu
o medie ponderată.

## 2. Cheia de legătură între surse

Aceeași ofertă apare pe ANOFM, pe eJobs și pe site-ul angajatorului. O legăm prin:
**angajator** (CUI la ANOFM; nume normalizat pe platforme) + **ocupație** (COR la ANOFM;
titlu mapat la platforme) + **localitate** + **fereastră de timp**. Rezultatul: numărăm o
ofertă o singură dată și îi păstrăm toate sumele — minimul oficial de la ANOFM și intervalul
din anunț sunt adesea diferite, iar diferența e ea însăși informație („declarat la minim,
oferit 5.000–6.000”).

Codul COR de la ANOFM devine și **dicționarul** pentru platforme: titlurile anunțurilor
aceluiași angajator se învață din perechile (titlu → COR), în loc de reguli scrise de mână.

## 3. ANOFM — măsurat pe 26 septembrie 2026

8.759 de oferte active, 37.465 de posturi, 949 de coduri COR, 4.101 angajatori, toate cele
42 de județe; cele mai vechi active din februarie 2025.

- Baza: brut 4.539, net 780, nedeclarată 3.440 (cohortă separată, ca `undeclaredBasis`).
- Normă întreagă + brut: **43% exact la salariul minim** (4.325), 31% peste minim + 5%.
- Pe meserii: pază 81% la minim, casier 80%, vânzător 79%, bucătar 77%, manipulant 70%,
  șofer TIR 69%; construcțiile pornesc de la minimul sectorului (4.582), cu 0–4% la minimul
  general. Programator: mediana 14.000 lei brut (n = 13); asistent medical 5.250 (n = 44).
- Deci ANOFM e **salariul de bază declarat oficial**, nu remunerația totală: la meseriile de
  bază e adesea minimul legal, cu restul (diurne, bonusuri, ture) în afara declarației. Se
  afișează ca atare, cu procentul „la minim” ca informație, nu se amestecă cu anunțurile.
- Calitate: un salariu de 1 leu (electromecanic), 425 de oferte brute la normă întreagă sub
  minimul de azi (multe create înainte de iulie, cu minimul de atunci). Validarea judecă
  minimul după data ofertei și respinge sumele sub jumătate din minim la normă întreagă.
- Catalog: taximetrist, șofer ridesharing și șofer de distribuție au același COR (832201) —
  cifre identice; mapările trebuie corectate înainte de publicare (vezi auditul COR din 5
  septembrie).

## 4. Fluxul

```
surse ──► colectare (zilnic / săptămânal / semestrial)
          • doar ce e nou, cu ID-ul sursei; ziua primei și ultimei apariții
          • fără contacte; fără cod și nume pentru angajatori persoane fizice
      ──► normalizare: sumă, bază (brut/net/nedeclarată), perioadă, normă, COR, județ
      ──► legare între surse (angajator + COR + localitate + timp)
      ──► agregare pe job × județ × experiență, cu praguri (policy.mjs)
      ──► verificare (teste, audit pe eșantion) ──► publicare în src/data
```

Datele brute ANOFM stau în `colectare/anofm/` în repo (doar oferte noi pe zi, comprimate de
git; ~câțiva MB pe an). Commit-ul zilnic are `[skip ci]`; site-ul se schimbă doar la
publicarea agregatelor, după verificare.

## 5. Ce facem cu fiecare meserie

- Meserii de la stat (asistent medical, infirmier, registrator medical, asistent social,
  îngrijitor, bibliotecar…): cifra principală din listele art. 33 (plătit); ANOFM și anunțurile
  arată privatul; grila explică treptele.
- Meserii de masă din privat (casier, lucrător comercial, șofer, curier, manipulant): anunțuri
  + site-urile angajatorilor; ANOFM arată cât de des se declară minimul.
- Meserii calificate (programator, contabil, electrician): anunțuri cu interval; ANOFM pentru
  gradientul pe experiență (câmpul „experiență cerută” lipsește din aproape toate anunțurile).

## 6. Pașii următori

1. Colectorul ANOFM rulează zilnic din 26 septembrie; după 30 de zile avem fluxul de oferte
   noi pe lună, pe COR și județ.
2. Cititorul pentru listele art. 33 + colectarea din 30 septembrie (spitale județene, DGASPC).
3. Conectori pentru site-urile de cariere Lidl și Kaufland.
4. Programarea săptămânală a colectorului de platforme.
5. Legarea surselor și noul prim ecran pe primele meserii peste prag.
