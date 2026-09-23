# BRAND.md — identitatea salariile.ro

Nucleul normativ al identității. Manualul complet, cu specimene vizuale, swatch-uri
și tabele de contrast, e publicat separat ca pagină de referință; acest fișier
conține regulile care trebuie să fie în repo, lângă cod.

**Precedență:** când acest document și codul nu sunt de acord, codul are dreptate
și documentul se corectează — cu excepția secțiunii „Datorii de identitate”, unde
codul e cel semnalat.

Auditat pe 27 august 2026, pe `main`. **Rebranding pe 23 septembrie 2026**, din
kitul de identitate dat de proprietar: numele „Salariile”, marca „ii” pe galben și
culoarea de marcaj. Secțiunile 3, 4, 5, 11, 15 și 16 descriu starea de după.

## 1. Poziționare

Portal despre salarii și fiscalitate în România, întreținut de o singură persoană.
Fără cont, fără formulare, fără colectare de date. Nu e o listă de
funcționalități lipsă — e poziționarea.

**Reclamele nu mai sunt excluse.** Decis de proprietar pe 23 septembrie 2026:
site-ul va avea reclame în viitor, deci „fără reclame” și „fără tracker” nu se
mai folosesc ca promisiune în textele de prezentare (OG, meta description,
`llms.txt`). Paginile legale descriu starea curentă și se actualizează în ziua în
care reclamele pornesc, nu înainte.

**Promisiunea:** de la cifra afișată se poate ajunge întotdeauna la formulă, la
actul normativ și la data de la care regula se aplică.

**Testul de brand.** Înainte de a adăuga orice element: face cifra mai ușor de
verificat, sau doar mai ușor de vândut? Dacă e a doua, nu intră.

**Audiența — gol declarat, nu omisiune.** Acest document nu definește audiența
și nici clienții pe care brandul vrea să-i atragă. Nu e o scăpare: sunt
singurele afirmații de identitate pe care numai proprietarul le poate face, iar
un răspuns dedus din forma site-ului ar fi plauzibil și fals. Se completează din
[`CHESTIONAR-BRAND.md`](CHESTIONAR-BRAND.md), secțiunile A–E. Până atunci,
nicio decizie de produs nu se justifică prin „audiența noastră vrea X".

## 2. Voce

Persoana a doua, prezent, propoziții scurte. Explicativ fără să fie didactic,
precis fără să fie birocratic, niciodată alarmist.

- Răspunsul primul: cifra sau verdictul în paragraful de deschidere.
- Cifra vine cu unitatea și cu perioada: „4.325 lei brut, din 1 iulie 2026”.
- Actul normativ se numește (HG 146/2026), nu „conform legislației în vigoare”.
- Diacriticele sunt obligatorii — titluri, corp, meta, alt-texte.
- Fără superlative, fără urgență fabricată, fără semne de exclamare.
- Limita se declară în text, nu în termeni și condiții.
- Nu scriem niciodată public despre defectele concurenței.

### Textul servește intenția — decis de proprietar pe 24 septembrie 2026

Utilizatorii s-au plâns că site-ul pare un almanah: CAS și CASS repetate peste
tot, cifre aruncate în fiecare paragraf, în loc de o formulă și o explicație.

- **Întâi intenția.** Omul a venit pentru ceva anume: pe o pagină-calculator,
  pentru instrument; pe un articol, pentru știre. Asta primește sus, iar tot ce
  urmează îl ajută să înțeleagă sau să decidă, nu umple pagina.
- **Sub calculator: explicație scurtă, apoi formula într-un card** (`Formula` din
  `src/app/components/ui.tsx`). Nu tabele cu un exemplu calculat pe o sumă pe care
  nu a cerut-o.
- **O idee pe paragraf, cel mult două-trei cifre.** Cifrele multe stau într-un
  tabel, nu în proză. Un card lateral nu repetă corpul paginii.
- **CAS, CASS și impozitul se explică o singură dată pe pagină.** În rest,
  „taxele” sau linkul către formulă.
- **Actul normativ stă lângă surse**, nu în paranteză după fiecare frază. În text
  apare doar când omul are ceva de făcut cu el (o plângere la ITM, un drept).
- **Voce umană.** Cum ar explica un prieten care se pricepe: propoziții scurte, fără
  „Iată”, „de fapt”, „Cheia e”, „Atenție la”, fără construcții „nu e X, ci Y”
  în serie, fără titluri-întrebare retorice și fără bold pe jumătate de paragraf.
- **Articolele se scriu ca la o publicație bună de știri:** titlu informativ, primul
  paragraf spune ce s-a întâmplat și ce înseamnă pentru cititor, apoi contextul.
- **FAQ-ul răspunde doar la ce nu a acoperit pagina**, în două-trei propoziții.

## 3. Nume

| Formă | Rol |
|---|---|
| `Salariile` | Numele mărcii în metadate: `og:site_name`, `publisher`, sufixul de titlu, schema.org `WebSite` și `Organization`, manifestul. Sursa unică: `NUME_SITE` din `src/lib/seo.ts`. |
| `salariile.ro` / `Salariile.ro` | Domeniul și `alternateName` în schema.org. În proză rămâne acceptat ca nume al entității („calcul Salariile.ro”), iar în atribuirea widgetului, ca adresă. |
| `SALARIILE` / `SALARIILE.RO` | Interzis. |

Numele din `WebSite` (doar pe homepage), `og:site_name` și sufixul titlurilor
trebuie să fie identice: din ele alege Google numele afișat deasupra URL-ului.

Sufix SEO: `%s | Salariile`, cu titlul complet sub 60 de caractere *cu* sufix.
Autorul se scrie complet, cu diacritice: Știuriuc Sorin-Marian.

Licența Apache-2.0 acoperă codul, **nu** numele, domeniul, logo-ul sau
identitatea vizuală (vezi [LICENSING.md](LICENSING.md)).

## 4. Marcă

Semnul e **„ii”-ul din „Salariile”**: două tije rotunjite cu punct, în cerneală,
pe un dreptunghi galben de marcaj — ca un cuvânt subliniat cu markerul. În
wordmark, „ii” stă pe marcaj în interiorul cuvântului; singur, devine simbolul.

| Formă | Unde | Fișier |
|---|---|---|
| Wordmark cu `.ro` | Header, footer, colțul OG | `src/app/components/Logo.tsx` (inline) |
| Favicon rotund | Browser și rezultatele Google | `src/app/icon.svg`, `src/app/favicon.ico` (16/32/48) |
| Simbol pătrat, colțuri rotunjite | Aplicație, rețele sociale, OG | `src/app/apple-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png` |

Literele sunt Inter ExtraBold convertit în contur; „ii” e desenat separat.
Sursa tuturor fișierelor e kitul de identitate din 23 septembrie 2026; path-urile
nu se redesenează de mână.

- Spațiu liber: minimum înălțimea marcajului „ii” pe toate laturile.
- Minim: 28 px înălțime wordmarkul în chrome, 16 px faviconul.
- Pe fundal deschis: varianta normală. Pe fundal închis: varianta „invers” —
  litere albe, `.ro` în #9A958C, iar „ii” **galben, fără căsuță**. Decis de
  proprietar pe 23 septembrie 2026: în kit, „ii” era negru în căsuță și alb unde
  ieșea din ea; la dimensiuni mici părea rupt. Pe negru, galbenul ca literă are
  11,6:1 — regula „galbenul nu e text” privește fundalul deschis. Fără căsuță,
  „le.ro” se apropie cu 169 de unități (din 9.852), ca golul după „ii” să fie
  egal cu cel dinainte; altfel rămâne locul gol al căsuței.
- Interzis: rotire, umbră, contur, gradient, recolorare, alt font, „ii” fără
  marcaj pe fundal deschis.

## 5. Culoare — monocrom cald, cu un singur marcaj

O singură familie pentru interfață: **stone**, plus două fundaluri proprii. Din 23
septembrie 2026 se adaugă culorile mărcii, cu rol strict limitat:

| Token | Hex | Rol |
|---|---|---|
| `--color-marcaj` | #FFC61A | Fundalul „ii” din marcă, favicon, bara browserului (`theme-color`) și utilitara `marcaj` pe cifra principală a unui calcul |
| `--color-cerneala` | #121212 | Semnul „ii” și textul scris peste galben |
| — | #8A857C / #9A958C | Sufixul `.ro` din logo, pe deschis / pe închis. Nu e token de interfață. |

**Galbenul nu e niciodată text pe fundal deschis** — pe alb are 1,6:1. Singura
excepție pe închis e „ii” din logoul invers (§4). Se folosește doar ca fundal,
cu cerneală peste (12,1:1). Pe ecran apare o singură cifră marcată: netul (sau
„rămâne la tine” la PFA) din rândul de total al calculatoarelor.

Tokenii proprii trăiesc în `src/app/globals.css` → `@theme`:

```
--color-canvas:   #f8f5ef   fundal de secțiune (cremă cald, deliberat nu gri)
--color-surface:  #fffdf9   fundal de card și tabel
--hairline-color: #d6d3d1   linia punctată de semnătură și separatoarele pline
--shadow-soft:    0 1px 3px 0 rgba(28,25,23,.05)   singura umbră din sistem
```

Tușul e `stone-900` / `#1c1917` — nu negru pur.

**De ce un singur marcaj și nu un accent:** într-un tabel fiscal, singurul lucru
care are voie să iasă în evidență e o sumă. Galbenul e pus chiar pe ea, nu pe
butoane, linkuri sau titluri. Nu semnalează „bine” sau „rău” — e același pe orice
salariu.

### Contrast pe `canvas` (#f8f5ef), WCAG 2.x

| Token | Hex | Raport | Verdict |
|---|---|---:|---|
| stone-900 | #1c1917 | 16,07 | AAA |
| stone-700 | #44403c | 9,44 | AAA |
| stone-600 | #57534e | 7,01 | AAA |
| stone-500 | #78716c | 4,41 | **sub AA** |
| stone-400 | #a8a29e | 2,32 | niciodată text |
| stone-300 | #d6d3d1 | 1,37 | doar non-text |
| stone-200 | #e7e5e4 | 1,15 | doar non-text |

**Regula operațională:** stone-600 e cea mai deschisă culoare permisă pentru text,
indiferent de dimensiune. stone-500 doar peste `surface` (4,72), niciodată peste
`canvas`. stone-400 nu poartă niciodată informație.

**Culoare semantică:** nu există. Eroarea se marchează prin text îngroșat
stone-900 plus bordură stone-500, nu prin roșu. Succesul nu se marchează deloc.

## 6. Tipografie

Inter Variable, prin `next/font/google`, subseturi `latin` + `latin-ext`
(al doilea e obligatoriu pentru ș și ț). Un singur font pe tot site-ul.
Stiva mono de sistem (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`)
e rezervată metadatelor și referințelor legale — nu e un al doilea font de brand.

Obligatoriu pe `body`:

```css
font-variant-numeric: tabular-nums;              /* fără el, tabelele fiscale se rup */
font-feature-settings: "cv11", "ss01", "ss03";
```

Tracking: **−0,02em** pe titluri de la 18 px în sus, **−0,01em** pe corp,
**pozitiv** (`tracking-wide`) pe etichetele majuscule — singurul loc unde crește.

| Rol | Corp | Greutate |
|---|---|---|
| H1 | 30 → 36 px | 700 |
| H2 | 20 → 24 px | 700 |
| H3 | 18 px | 600 |
| Lead / corp | 16 px, stone-600 | 400 |
| Interfață / tabel | 14 px | 400–500 |
| Note și unități | 12 px, stone-600 | 400 |
| Eyebrow | 12 px, majuscule | 400 |

Fără italic: `<em>` se stilizează ca îngroșare. 800 apare doar în imaginile OG.
Textul curent stă în `max-w-prose` (~65 caractere) sau `max-w-3xl`.

## 7. Spațiu

| Element | Valoare |
|---|---|
| Container de conținut | `max-w-3xl` (768 px) |
| Container larg | `max-w-6xl` (1152 px) |
| Padding lateral | 16 px → 24 px de la `sm` |
| Ritm de secțiune | 40 px → 48 px de la `sm` |
| Bara de navigație | 64 px |
| Țintă de atingere | **44 px minim** — inclusiv sumarele de FAQ |
| Rază de colț | 4 px controale · 6 px suprafețe · complet pentru comutatoare |

## 8. Linia punctată — semnătura

1 px, liniuțe de 14 px separate de goluri de 12 px, în `#d6d3d1`. Într-o identitate
fără accent cromatic în interfață, ea e diferențiatorul — galbenul aparține mărcii și cifrei, nu layoutului.

**Regula:** punctatul (`hairline-t` / `hairline-b`) marchează limita site-ului —
sub header și deasupra footerului, două apariții pe pagină. Interiorul se separă
cu linie plină (`rule-t` / `rule-b`), aceeași culoare. Dacă punctatul apare de
zece ori pe pagină, încetează să mai fie semnătură.

Lungimea, golul și culoarea se reglează exclusiv în `@theme`.

## 9. Componente

- **Buton primar:** plin stone-900, text alb, hover stone-700. Unul singur pe ecran.
- **Buton secundar:** `surface`, bordură stone-300, text stone-900.
- **Buton terțiar:** bordură punctată, 12 px — doar pentru opțiuni avansate.
- Toate: min 44 px înălțime, rază 4 px, greutate 500, tranziție doar pe culoare.
- **Câmp numeric:** unitatea *în interiorul* câmpului, separată de bordură verticală;
  corp de 16 px pe mobil (sub asta Safari face zoom la focus); focus = bordură
  stone-400 + strălucire caldă 6 px, fără inel albastru de sistem.
- **Tabel fiscal:** antet pe `canvas`, corp pe `surface`, sume la dreapta,
  `tabular-nums`. **Rândul de total se inversează** (alb pe stone-900) — singurul
  fundal plin de rând din sistem, rezervat rezultatului final. Containere cu
  derulare proprie; pagina nu derulează niciodată lateral.
- **Card:** `surface`, bordură stone-200, rază 6 px, umbra unică. Cardurile nu se stivuiesc.
- **FAQ:** `<details>` / `<summary>` nativ, grupate prin `name`, marker `+` / `−`. Zero JS.

## 10. Cifre — regula cea mai importantă

- Întotdeauna `Intl.NumberFormat("ro-RO")`: `9.564 lei`, `2,25%`.
- Unitatea se scrie **lei**, nu „RON”, nu simbol. Perioada: „lei / lună”.
- Valoarea lipsă e `—`, niciodată 0.
- **brut** / **net** însoțesc obligatoriu orice sumă salarială, inclusiv în meta
  description. La meserii, netul stă în prim-plan.
- Când sursa nu susține o valoare unică, publicăm **intervalul**, nu media.
  O medie sectorială prezentată ca salariu de meserie e mai înșelătoare decât un
  interval larg declarat onest.

Fiecare cifră vine cu sursa:

| Tip | Ce se afișează lângă ea |
|---|---|
| Prag legal | Actul normativ + data intrării în vigoare |
| Statistică INS | Indicatorul exact, luna de referință, „se actualizează lunar” |
| Rezultat de calculator | Perioada fiscală + link la metodologie |
| Cifră derivată | Ipoteza care a produs-o (curs, plafon, zile lucrătoare) |

Distincții care nu se pierd niciodată:

- Indicatorul BASS (9.192 lei brut, 2026) **nu** e câștigul salarial mediu INS.
- Netul agregat INS **nu** e conversia fiscală a unui salariu individual.
- O sesiune cu un calcul **nu** e o persoană și **nu** e un salariu declarat.

## 11. Imagini

OG: fundal cerneală #121212 (invers față de site, ca să iasă din fluxul alb al
rețelei), simbolul „ii” pe galben la stânga, eyebrow majuscule, titlu pe max. trei
rânduri ~61 px / 800, linie de 1 px, promisiunea într-un rând, jos wordmarkul
„invers” („ii” galben, fără căsuță) + referință legală în mono. `public/og-image.png` se randează din
`public/og-image.svg` cu Inter instalat local; fără el, `sharp` cade pe Arial.

Editorial: ilustrație în paletă caldă, `.webp` în `public/noutati/`, declarate în
frontmatter prin `hero:` / `heroAlt:` (nu `image:` / `imageAlt:` — motorul nu le
citește). Alt-text obligatoriu, în română, cu diacritice, descriind conținutul.
Nicio imagine nu conține text de care depinde înțelegerea.

Grafice: monocrome. Serie principală stone-900, secundară stone-400, grilă
stone-200. Diferențiere prin poziție și etichetă, nu prin culoare.

## 12. Accesibilitate

- Contrast minim 4,5:1 pentru orice text (vezi §5).
- Focus vizibil pe fiecare element interactiv. `outline-none` e permis **numai**
  dacă în același loc se definește o stare de focus alternativă vizibilă.
- 44 px zonă de atingere.
- HTML nativ înainte de ARIA: `<details>`, `<table>`, `<label htmlFor>`.
- Erorile se anunță: `role="alert"`, `aria-invalid`, `aria-describedby`.
- Semnificația nu stă niciodată doar în culoare.

Neacoperit azi, ca decizie deschisă: `prefers-reduced-motion` și tema închisă
(nu există nicio utilitară `dark:` în `src/`).

## 13. Aplicații

**Widget pe site-uri terțe** — singura suprafață unde identitatea noastră stă
lângă a altcuiva: atribuirea `salariile.ro` e vizibilă și obligatorie, injectată
în DOM-ul gazdei; widgetul nu preia culorile gazdei și nu se tematizează; fără
navigație, fără footer, fără măsurare; înălțime negociată prin `postMessage`
între 360 și 900 px.

**Social** (dev.to, LinkedIn, r/RoMunca, GitHub) — aceeași voce, nu există „ton
pentru rețele”. Fără hashtaguri decorative, fără emoji în titluri.

**Fluturașul PDF** — imită formatul contabil recunoscut, nu estetica site-ului;
acolo familiaritatea bate identitatea. Transliterarea diacriticelor e o limitare
tehnică a generatorului și singura excepție acceptată de la regula diacriticelor.

## 14. Ce nu facem

- Nu adăugăm altă culoare și nu extindem galbenul dincolo de rolurile din §5 fără
  decizie explicită a proprietarului, documentată aici.
- Nu punem popupuri proprii, interstițiale sau bannere de newsletter. `/despre`
  promite public că nu există formulare, conturi sau newsletter — orice element
  care contrazice promisiunea cere întâi actualizarea promisiunii.
- Nu introducem un al doilea font.
- Nu folosim emoji ca marcatori de secțiune, în titluri sau în navigație.
- Nu publicăm cifre fără sursă.
- Nu scriem despre concurență.
- Nu cumpărăm linkuri.
- Nu colectăm date de la vizitatori. Dacă se schimbă, se schimbă întâi contractul
  cu utilizatorul: bază legală GDPR, prag de k-anonimitate, politică actualizată
  și cale de ștergere — în ordinea asta, înainte de orice element de interfață.

## 15. Datorii de identitate — măsurate 27 august 2026

Locuri unde codul se contrazice pe el însuși. Nu sunt propuneri de redesign.

| Ce | Unde | Impact | Corecția |
|---|---|---|---|
| Tușul interfeței e stone-900 #1c1917, marca folosește cerneală #121212 | `src/app/components/Logo.tsx`, `ui.tsx` | Minor: diferență abia perceptibilă lângă logo | Decizie deschisă: se aliniază interfața la #121212 sau rămâne tușul cald |
| `text-stone-500` pe `bg-canvas` = 4,41:1, sub AA | `src/app/components/ui.tsx:96`, 127 apariții | Accesibilitate: eyebrow + indicații sub câmpuri | `stone-600` pe canvas |
| Rază amestecată: 67× `rounded` (4 px), 78× `rounded-md` (6 px), fără regulă | tot `src/` | Minor: buton lângă card | 4 px controale, 6 px suprafețe (§7) |

Ordinea recomandată: contrastul și `theme_color` (vizibile pentru utilizator),
apoi comentariul din `globals.css` (induce în eroare la fiecare sesiune nouă),
raza de colț la urmă, ca trecere unică.

## 16. Guvernanță

| Ce | Sursa unică de adevăr |
|---|---|
| Tokeni de culoare, font, umbră, hairline | `src/app/globals.css` → `@theme` |
| Primitive de tipografie și layout | `src/app/components/ui.tsx` |
| Navigație și footer | `src/app/components/Header.tsx`, `Footer.tsx` |
| Iconuri, culori PWA | `src/app/manifest.ts`, `src/app/icon.svg`, `src/app/layout.tsx` (`viewport.themeColor`) |
| Wordmark | `src/app/components/Logo.tsx` |
| Numele mărcii, metadate, OG, titluri | `src/lib/seo.ts` (`NUME_SITE`), `src/app/layout.tsx` |
| Constante fiscale și context de proiect | `CLAUDE.md` |
| Drepturi asupra mărcii și conținutului | `LICENSING.md` |

- Un token se modifică **doar în `@theme`**. Suprascrierea locală a unei culori de
  brand într-o componentă e o eroare de sistem, nu o preferință.
- O componentă nouă se compune din primitivele existente. Dacă nu se poate,
  primitivele se extind — nu se ocolesc.
- Orice abatere de la §14 cere decizia explicită a proprietarului și actualizarea
  acestui document în același commit.
- Reaudit trimestrial: se recalculează contrastele și se renumără utilitarele de culoare.

---

© 2026 Știuriuc Sorin-Marian. Marca, wordmarkul și identitatea vizuală nu sunt
acoperite de licența Apache-2.0 a codului.
