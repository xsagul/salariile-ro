# BRAND.md — identitatea salariile.ro

Nucleul normativ al identității. Manualul complet, cu specimene vizuale, swatch-uri
și tabele de contrast, e publicat separat ca pagină de referință; acest fișier
conține regulile care trebuie să fie în repo, lângă cod.

**Precedență:** când acest document și codul nu sunt de acord, codul are dreptate
și documentul se corectează — cu excepția secțiunii „Datorii de identitate”, unde
codul e cel semnalat.

Auditat pe 27 august 2026, pe `main`.

## 1. Poziționare

Portal despre salarii și fiscalitate în România, întreținut de o singură persoană.
Fără reclame, fără cont, fără formulare, fără colectare de date. Nu e o listă de
funcționalități lipsă — e poziționarea.

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

## 3. Nume

| Formă | Rol |
|---|---|
| `salariile.ro` | Wordmark. Header, footer, semnătură OG, atribuire widget. Mereu minuscule. |
| `Salariile.ro` | Numele entității în propoziție și în metadate (`siteName`, `publisher`, sufix de titlu, schema.org). |
| `SALARIILE.RO` | Interzis. |
| `Salariile` | Interzis. Numele include TLD-ul. |

Sufix SEO: `%s | Salariile.ro`, cu titlul complet sub 60 de caractere *cu* sufix.
Autorul se scrie complet, cu diacritice: Știuriuc Sorin-Marian.

Licența Apache-2.0 acoperă codul, **nu** numele, domeniul, logo-ul sau
identitatea vizuală (vezi [LICENSING.md](LICENSING.md)).

## 4. Marcă

Litera **S urmată de punct**, albă pe pătrat închis. Punctul face parte din marcă
și nu se elimină. Wordmarkul se folosește în chrome-ul site-ului; marca „S.”
acolo unde nu încape cuvântul (favicon, iconuri, colț OG).

Fișiere: `src/app/icon.svg`, `src/app/apple-icon.png`, `public/icon-192.png`,
`public/icon-512.png`, `public/og-image.svg`.

- Spațiu liber: minimum înălțimea literei „S” pe toate laturile.
- Minim: 24 px marca, 96 px lățime wordmarkul.
- Două variante: alb pe închis (implicit), tuș pe deschis. Nu există variantă colorată.
- Interzis: rotire, umbră, contur, gradient, recolorare, siglă compusă, alt font,
  wordmark cu altă greutate decât 700.

## 5. Culoare — monocrom cald, fără accent

O singură familie: **stone**, plus două fundaluri proprii. Măsurat pe 27 aug 2026,
în `src/` nu există nicio utilitară de culoare în afara familiei stone.

Tokenii proprii trăiesc în `src/app/globals.css` → `@theme`:

```
--color-canvas:   #f8f5ef   fundal de secțiune (cremă cald, deliberat nu gri)
--color-surface:  #fffdf9   fundal de card și tabel
--hairline-color: #d6d3d1   linia punctată de semnătură și separatoarele pline
--shadow-soft:    0 1px 3px 0 rgba(28,25,23,.05)   singura umbră din sistem
```

Tușul e `stone-900` / `#1c1917` — nu negru pur.

**De ce fără accent:** într-un tabel fiscal, singurul lucru care are voie să iasă
în evidență e o sumă. O culoare de accent ar concura cu ea și ar semnala „bine”
sau „rău” despre salariul cuiva.

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
fără accent cromatic, ea e diferențiatorul.

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

OG: fundal închis (invers față de site, ca să iasă din fluxul alb al rețelei),
marca „S.” la stânga, eyebrow majuscule, titlu pe max. trei rânduri ~61 px / 750,
linie de 1 px, promisiunea într-un rând, jos wordmark + referință legală în mono.

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

- Nu adăugăm culoare de accent fără decizie explicită a proprietarului, documentată aici.
- Nu punem reclame, popupuri, interstițiale sau bannere de newsletter. `/despre`
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
| `theme_color: "#52565f"` — gri-albastru rece, inexistent în restul identității | `src/app/manifest.ts:16` | Vizibil: bara browserului pe Android, fereastra PWA | `#1c1917` sau `#f8f5ef` |
| `background_color: "#faf8f5"` ≠ `--color-canvas: #f8f5ef` | `src/app/manifest.ts:15` | Vizibil: splash-ul PWA nu se potrivește cu prima pagină | `#f8f5ef` |
| Iconul și OG folosesc `#111111` / `#FAFAF7`, site-ul `#1c1917` / `#f8f5ef` | `src/app/icon.svg`, `public/og-image.svg` | Minor: negru rece lângă un sistem cald | Aliniere la tușul cald |
| `<body>` are `bg-white`, dar fiecare secțiune randează pe `bg-canvas` | `src/app/layout.tsx:92` | Minor: alb pur la overscroll și pe pagini scurte | `bg-canvas` |
| Comentariul descrie paleta ca „slate + accent emerald”; nu există nici slate, nici emerald | `src/app/globals.css:7` | Documentație: trimite pe pistă greșită orice contribuitor | Rescriere: stone monocrom |
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
| Iconuri, culori PWA | `src/app/manifest.ts`, `src/app/icon.svg` |
| Metadate, OG, titluri | `src/app/layout.tsx`, `src/lib/seo.ts` |
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
