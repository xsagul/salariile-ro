# salariile.ro — Design System

**Versiune:** 1.0  
**Stil:** Editorial fiscal · Document oficial sobru  
**Inspirație:** NYT, Stripe Press, ANAF modernizat

---

## 1. Filosofia vizuală

Site-ul nu e produs SaaS. E **document fiscal serios** — autoritate prin acuratețe, nu prin sclipici.

**Principii:**
- **Zero rotunjire** — toate elementele cu colțuri perfect drepte
- **Negru/alb cu un singur cremos** — fără palete colorate
- **Tipografie ca singur element decorativ** — ierarhia se face prin mărime și greutate
- **Linii ca separatori** — în loc de shadow-uri sau backgrounds colorate
- **Densitate informațională mare** — utilizatorul vine după date

---

## 2. Tokens (în `:root`)

### Spacing (4pt grid)
```
--s-1: 4px
--s-2: 8px
--s-3: 12px
--s-4: 16px
--s-6: 24px
--s-8: 32px
--s-12: 48px
--s-16: 64px
```

### Font sizes (6 mărimi)
```
--fs-xs: 12px    (labels, dateline, breadcrumb)
--fs-sm: 14px    (navbar, body small, table content)
--fs-base: 16px  (body, subtitle, input)
--fs-md: 18px    (h3, card heading)
--fs-lg: 24px    (h2)
--fs-xl: 32px    (h1 desktop)
```

Cazuri speciale:
- Logo: `22px` (intenționat, între md și lg)
- H1 mobile: `clamp(28px, 4vw, 32px)` — scalează responsive

### Font weights (3 valori)
```
--fw-normal: 500   (body, navbar default)
--fw-medium: 600   (pills, suffix, accent text)
--fw-bold: 700     (h1, h2, labels, total-net)
```

Caz special: Logo `800` (singurul element ExtraBold).

### Letter-spacing
```
--ls-tight: -0.03em    (h1, logo)
--ls-tighter: -0.02em  (h2)
--ls-normal: 0         (body)
--ls-wide: 0.05em      (uppercase mic)
--ls-wider: 0.1em      (labels uppercase)
```

### Line heights
```
--lh-tight: 1.1   (h1, h2)
--lh-snug: 1.25   (h3)
--lh-base: 1.6    (body, FAQ)
```

### Culori
```
--text: #111111         (text principal, accent)
--bg: #ffffff           (background)
--surface-alt: #f6f3f2  (FAQ, header tabel)
--surface-bright: #fcf9f8 (off-white subtil)
--border: #e5e3dd       (separatori)
--border-strong: #d4d2cb (borders inputs)
--muted: #555555        (text secundar)
--muted-soft: #757575   (eyebrow, dateline)
```

---

## 3. Componente

### Topbar
- Background `--text` (negru), text alb
- Înălțime 32px desktop, **ascuns pe mobile**
- Monospace + uppercase + `--fs-xs`
- Conține: status oficial + validare ANAF

### Header
- Înălțime 64px, alb, border-bottom 1px negru tăios
- Logo: 22px weight 800
- Nav links: 14px weight 500, active = weight 700 + border-bottom 2px

### Hero
- Padding 32px sus, 16px jos
- Container 1180px (NU narrow)
- H1: clamp(28px-32px), weight 700
- Subtitle: 16px, line-height 1.6, max-width 640px
- Dateline: monospace 12px

### Calculator (calc-layout)
- Grid 2 coloane 1fr 1fr cu gap 64px desktop
- Border-top + border-bottom subtile
- Linie verticală centrală (1px gri)
- Pe mobile: stack vertical, fără linie

### Tabel rezultate
- Header `--surface-container-low`, uppercase, 12px
- Total Net invertit (negru cu text alb)
- Cost Total cu `--surface-bright`, uppercase
- Sub-rows indentate cu `--s-6`

### Form
- Background transparent, fără border (decizie editorială minimalistă)
- Label-uri uppercase 12px weight 700
- Input cu border `--border-strong`
- Pills active = negru cu text alb

### FAQ section
- Background `--surface-alt` (cremos)
- Padding 48px vertical
- Accordion cu +/- la dreapta

### Footer
- Background negru, text alb cu opacity
- 3 coloane desktop, 2 mobile

---

## 4. Touch targets pe mobile

Toate elementele interactive **min 44×44px efectiv** (Apple HIG):
- Hamburger 44×44px
- Pills cu padding 14px → ~44px
- Toggle switch 52×32px
- FAQ summary, nav links — natural mari

---

## 5. Reguli de combinare

### Când folosești ce font?
- **Monospace:** date tehnice, validări (topbar, breadcrumb, dateline)
- **Figtree (sans-serif):** absolut tot restul

### Când folosești ce greutate?
- **500:** body, navbar inactive
- **600:** pills, suffix, footer-title
- **700:** h1, h2, labels uppercase, total-net
- **800:** doar logo

### Când folosești ce mărime?
Folosește mereu `var(--fs-xx)`. **Nu inventa mărimi noi.**

### Când folosești ce padding?
- Padding interior componentă: `--s-3` sau `--s-4`
- Padding secțiune verticală: `--s-12`
- Gap între componente related: `--s-2` la `--s-4`
- Gap între secțiuni majore: `--s-8` la `--s-16`

---

## 6. Lista de "NU"

- ❌ Border-radius non-zero (cu excepția toggle/thumb)
- ❌ Gradient-uri
- ❌ Shadow-uri colorate sau dramatice
- ❌ Mărimi de font în afara scării (ex: 13px, 19px, 0.6875rem)
- ❌ Padding/margin în afara scării 4pt
- ❌ Greutăți font în afara: 500/600/700/800-doar-logo
- ❌ Culori noi
- ❌ Animații complexe sau parallax
- ❌ Inline styles în JSX
- ❌ `!important` (cu excepție pe utility classes deliberate)

---

## 7. Lista de "DA"

- ✅ Linii subtile pentru separare
- ✅ Tipografie ca element decorativ principal
- ✅ Spațiu negativ generos
- ✅ Borders negre pure pentru elemente cu importanță maximă
- ✅ Monospace pentru date tehnice
- ✅ Total-net invertit (negru pe alb → alb pe negru)
- ✅ Hover-uri "invertit" (PDF button)

---

## 8. Probleme cleanup în repo

Următoarele fișiere reziduale se pot șterge:
- `src/app/salariu-minim/salariu-minim.tsx` (duplicat al `page.tsx`)
- `src/app/salariu-mediu/salariu-mediu.tsx` (duplicat)
- `src/app/info/info.tsx` (duplicat)

---

## 9. Cum să verifici că sistemul e respectat

```bash
# Caută inline styles (ar trebui zero)
grep -rn "style={" src/app/

# Caută !important (ar trebui zero)
grep -n "!important" src/app/globals.css

# Caută valori font în afara scării (ar trebui zero)
grep -nE "[0-9]+\.[0-9]+rem" src/app/globals.css | grep -v "var(--"
```

---

## 10. Modificări viitoare

Când introduci o componentă nouă:
1. Verifică dacă deja există ceva similar și extinde-o
2. Folosește DOAR tokens definite
3. Dacă ai nevoie de un token nou, adaugă-l în `:root` și documentează-l aici
4. Testează pe mobile la 768px și 640px
5. Asigură-te că touch targets sunt min 44×44px pe mobile
6. **NU folosi inline styles** — adaugă o clasă în CSS

---

**Ultima actualizare:** 9 mai 2026  
**Maintainer:** Sorin (proprietar salariile.ro)
