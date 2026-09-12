# Migrarea salariile.ro de pe Next.js pe Astro

Decizia proprietarului, 12 septembrie 2026, după două experimente măsurate.
Acest fișier e planul de lucru: trăiește pe `main`, se actualizează pe măsură ce
porțile trec, și e scris ca să supraviețuiască compactării contextului. Dacă o
sesiune viitoare îl citește, trebuie să poată continua fără conversație.

**Stare: PORNITĂ. Nimic nu atinge producția.** Site-ul rulează în continuare
Next.js exportat static pe Cloudflare Workers, servit din `main`.

---

## De ce, în cifre măsurate

Nu din preferință de framework. Constrângerea Vercel a dispărut odată cu mutarea
pe Cloudflare (12 septembrie 2026), iar React fusese ales pentru că Next pe Vercel
asta cerea.

| Măsurat pe producție | Valoare |
|---|---|
| JS pe orice pagină, comprimat | **188,3 KB** |
| JS adăugat de calculator | ~16 KB |
| Pagini din 327 care au vreun formular | **53** — restul plătesc taxa degeaba |
| Din HTML-ul unei pagini de meserie | **61% e încărcătură React serializată** |

**Contraargumentul care rămâne valabil:** datele de teren sunt deja verzi — INP
73–158 ms, LCP sub 1,4 s, CLS 0. Migrarea elimină risipă și dependență, **nu
produce o accelerare pe care utilizatorii o simt mâine**. Cine reia proiectul să
nu-l vândă ca pe o optimizare de viteză.

---

## Ce s-a dovedit deja (nu se re-testează)

**Pasul 1 — `/salarii/[meserie]`, 142 de pagini.** Paritate `142/142` pe title,
description, robots, canonical, h1, jsonLd și linkuriInterne. Textul: identic pe
toate, o dată scăzuți markerii `<!-- -->` pe care React îi emite singur (constant
109 caractere/pagină). Greutate: **210,8 KB → 9,8 KB pe fir**, zero fișiere `.js`.
Build: 143 de pagini în 2,44 s.

**Pasul 2 — motorul fiscal în browser.** Astro împachetează `fiscal.ts` din
`src/lib` și îl **încorporează inline**: **912 octeți comprimat** pentru tot
motorul. Verificat funcțional: 10.000 brut → net 5.850; 4.325 brut → net 2.699 cu
facilitatea de 200 lei aplicată corect; intrare invalidă tratată. Zero erori în
consolă. Aceleași funcții pe server și în browser.

**Creierul se refolosește, nu se copiază.** `src/lib` are 33 de fișiere din care
doar 2 ating Next (`seo.ts` — import doar de tip, `image-loader.ts`). `fiscal.ts`,
`sarbatori.ts`, `fluturas.ts`, `calculator-texte.ts`, `curs.ts` nu importă nimic
din framework. `scripts/` (10.832 linii) și **22 din 23 de teste** supraviețuiesc
neatinse; doar `test-ui-contracts.mts` e legat de Next.

---

## Arhitectura: unde se construiește

**Proiect Astro imbricat în repo, pe ramura `migrare-astro`**, cu `package.json`
propriu și `node_modules` proprii.

De ce nu în rădăcină: Next tratează `src/pages` drept Pages Router, deci structura
Astro ar rupe build-ul actual. De ce nu într-un folder vecin (cum a fost
experimentul): aliasul către alt repo e acceptabil pentru o probă, dar pentru
producție ar crea a doua sursă de adevăr. Imbricat în repo, aliasul `@/` arată
către `../src/`, deci **același** `src/lib`, versionat o dată.

La final, proiectul Astro urcă în rădăcină și Next dispare — într-un singur commit
pe ramură, cu harnașamentul ca poartă.

- Ramura: `migrare-astro`
- **Nu se unește în `main` până nu trece paritatea pe toate rutele.**
- Producția se publică în continuare din `main` (Next), manual cu `wrangler`.

---

## CSS și fontul — singura capcană identificată

**Tailwind v4, configurat integral în CSS.** Nu există `tailwind.config.js`; toată
tema stă în `src/app/globals.css`, 84 de linii, în blocuri `@theme` și `@utility`
(paleta caldă `canvas`/`surface`, umbra unică, hairline-urile). Fișierul se
portează **ca atare**. Integrarea `@astrojs/tailwind` e **depreciată** — v4 se
folosește prin pluginul Vite (`@tailwindcss/vite`), verificat în documentație pe
12 septembrie 2026.

**Fontul e partea care se rupe tăcut.** Producția auto-găzduiește Inter prin
`next/font/google`: două fișiere `.woff2` preîncărcate din `/_next/static/media/`,
aplicate printr-o clasă generată pe `<html>`. Variabila `--font-inter`, de care
depinde `--font-sans` din temă, **nu apare în HTML** — e definită în CSS-ul
generat de Next.

În Astro nu există `next/font`. Trebuie, explicit:
1. fontul auto-găzduit (cel mai fidel: exact fișierele servite azi, copiate în
   `public/`, nu o altă tăietură Inter de pe npm);
2. `@font-face` propriu, cu `font-display: swap`;
3. `--font-inter` definită în CSS;
4. `<link rel="preload">` pentru aceleași două fișiere.

**Harnașamentul NU prinde această regresie**, fiindcă nu compară stiluri. Dacă e
greșită, tot site-ul cade pe fontul de sistem și nimic nu semnalează. Se verifică
vizual, separat, pe fiecare lot.

---

## Inventar și ordinea de portare

41 de fișiere de pagină, 16 cu interactivitate. Ordinea urmează riscul crescător,
nu poziția în meniu.

### Lotul 1 — conținut pur, generat în serie (risc minim, câștig maxim)
Acoperă ~255 din 327 de pagini generate. Toate coboară la **zero JS**.

| Rută | Linii | Stare |
|---|---|---|
| `/salarii/[meserie]` | 660 | **FĂCUT** (pasul 1, paritate 142/142) |
| `/salarii/judet/[judet]` | 341 | |
| `/salarii/domeniu/[domeniu]` | 344 | |
| `/compara/[pereche]` | 272 | |
| `/noutati/[slug]` | 200 | |

### Lotul 2 — conținut pur, pagini singulare
`/salariu-minim` (857), `/salariu-mediu` (622), `/salarii/femei-barbati` (422),
`/salarii/locuri-vacante` (391), `/zile-libere-2026` (391),
`/salariu-minim-constructii-2026` (381), `/metodologie` (350),
`/date-salarii` (328), `/salarii/judete` (262),
`/deducere-personala-2026` (224), `/politica-confidentialitate` (204),
`/cookies` (191), `/termeni` (168), `/despre` (155),
`/salarii/clasament` (145), `/contact` (131), `/noutati` (108),
`/salarii/acoperire` (57), `/zile-libere-2027` (7), `/zile-lucratoare-2027` (7).

### Lotul 3 — calculatoarele
Tiparul e dovedit (pasul 2). Se rescrie interfața, **nu** matematica.
`/` (homepage, 306), `/calculator/[valoare]` (544), `/calculator-pfa` (550),
`/calculator-salariu-invatamant` (286), `/calculator-ore-suplimentare` (269),
`/calculator-indemnizatie-somaj` (260), `/calculator-salariu-part-time` (243),
`/calculator-salariu-sanatate` (240), `/zile-lucratoare-2026` (390),
`/salarii` (254, filtru), `/compara` (144, selector).

### Lotul 4 — cele mai încâlcite, la final
`/fluturas-salariu` (248) cu generarea PDF (`jspdf`, import dinamic),
`/en/salary-calculator` (253) cu engleza și comutatorul EUR,
`/widget` (227) și rutele de iframe `/widget/frame`, `/widget/frame/fluturas`.

**Calculatorul e folosit în șapte locuri**, cu proprietăți diferite
(`brutInitial`, `modInitial`, `regimFiscal`, `fluturas`, `embedded`, `limba`,
`monedaInitiala`, `cuMoneda`). Portarea trebuie să le suporte pe toate, nu doar
cazul de pe homepage.

---

## Porțile de verificare

Nicio rută nu se consideră gata fără:

1. **Paritate pe câmpurile pe care le vede Google** — `scripts/compara-hosting.mjs`
   compară status, redirecturi, cinci headere, CSP, plus `title`, `description`,
   `robots`, `canonical`, `h1`, `jsonLd`, `linkuriInterne` și `text`.
   Textul se compară **ignorând spațiile**, fiindcă React emite markeri `<!-- -->`
   pe care extractorul îi transformă în spații. Orice altă diferență e reală.
2. **Verificare vizuală** pe lot — singurul lucru pe care harnașamentul nu-l vede:
   font, culori, așezare.
3. **`npm test`** din rădăcină: 22 din 23 de teste sunt agnostice și trebuie să
   rămână verzi. `test-rendered.mts` rulează pe HTML-ul construit, deci se
   reorientează spre `dist/` și rămâne valabil.

**Lecție plătită deja, la pasul 1:** `linkuriInterne` a ieșit `142/142` chiar și cu
un link lipsă din pagină, fiindcă acel URL apărea oricum în meniu, iar câmpul
compară o **mulțime**, nu aparițiile. Doar comparația pe **text** a prins
omisiunea. Nu declara paritate pe baza linkurilor.

---

## Ce nu se atinge

- **Producția**, până când toate rutele trec paritatea.
- **`src/lib`** — se refolosește, nu se rescrie și nu se copiază. Dacă o funcție
  trebuie schimbată, se schimbă acolo, pentru amândouă.
- **Datele și scripturile** din `scripts/`, inclusiv crawlerul.
- **Regulile din `CLAUDE.md`** despre conținut și date: migrarea e tehnică, nu e
  ocazia de a rescrie texte sau de a reintroduce decizii respinse.

---

## Comutarea și rollback-ul

Aceeași disciplină ca la mutarea de pe Vercel, care a ieșit cu 0 diferențe:

1. Paritate completă pe toate rutele, din build local contra producției.
2. Publicare pe Worker-ul de previzualizare, `noindex` pe tot, și `compara-hosting`
   contra lui — infrastructură reală, nu doar build local.
3. Unirea în `main` și publicarea pe producție.
4. Verificare imediată pe producție, apoi Search Console 14 zile.

**Rollback:** `main` păstrează istoricul Next; revenirea e un `git revert` al
commit-ului de unire, plus un `wrangler deploy`. Structura Astro nu schimbă niciun
URL — `trailingSlash: 'never'` și `build.format: 'file'` păstrează exact forma
indexată. **Dacă se greșește aici, fiecare URL al site-ului se schimbă.**

---

## Lecții de unealtă (ca să nu fie redescoperite)

- `preview_start` citește `.claude/launch.json` **din directorul sesiunii**, nu din
  folderul pe care i-l dai. Cerând configurația experimentului, a pornit serverul
  de dezvoltare Next al site-ului real.
- `file://` în afara folderului de proiect se deschide ca **instantaneu static**,
  unde scripturile nu rulează. Nu e cale de testare.
- Astro **încorporează inline** scripturile mici împachetate: „zero fișiere `.js`"
  nu înseamnă „script lipsă". Se verifică în HTML, nu în `dist/**/*.js`.

---

## Ce rămâne al proprietarului

- Cheile `CLOUDFLARE_API_TOKEN` și `CLOUDFLARE_ACCOUNT_ID` în GitHub — agentul nu
  creează și nu introduce tokenuri. Până atunci publicarea rămâne manuală.
- Scoaterea domeniului din Vercel și ștergerea proiectului, după cele 14 zile de
  Search Console stabil. Ireversibil.
