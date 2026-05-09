# salariile.ro — Design System

**Versiune:** 2.0  
**Data:** 9 mai 2026  
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
```css
--s-1: 4px;
--s-2: 8px;
--s-3: 12px;
--s-4: 16px;
--s-6: 24px;
--s-8: 32px;
--s-12: 48px;
--s-16: 64px;
```

### Font sizes (6 mărimi)
```css
--fs-xs: 12px;
--fs-sm: 14px;
--fs-base: 16px;
--fs-md: 18px;
--fs-lg: 24px;
--fs-xl: 32px;
```

**Cazuri speciale (intenționale):**
- Logo: `22px` (între md și lg)
- H1: `clamp(28px, 4vw, var(--fs-xl))` — scalare responsive

### Font weights (3 valori)
```css
--fw-normal: 500;
--fw-medium: 600;
--fw-bold: 700;
```

**Caz special:** Logo `800` — singurul ExtraBold.

### Letter-spacing
```css
--ls-tight: -0.03em;
--ls-tighter: -0.02em;
--ls-normal: 0;
--ls-wide: 0.05em;
--ls-wider: 0.1em;
```

### Line heights
```css
--lh-tight: 1.1;
--lh-snug: 1.25;
--lh-base: 1.6;
```

### Culori
```css
--text: #111111;
--bg: #ffffff;
--surface-alt: #f6f3f2;
--surface-bright: #fcf9f8;
--border: #e5e3dd;
--border-strong: #d4d2cb;
--muted: #555555;
--muted-soft: #757575;
```

---

## 3. Componente cheie

### Topbar
- Background `--text` (negru), text alb
- Înălțime `--s-8` desktop, **ascuns pe mobile**
- Monospace + uppercase + `--fs-xs`

### Header
- Înălțime 64px, alb, border-bottom 1px negru
- Logo: 22px weight 800
- Nav: `--fs-sm` weight 500/700

### Hero
- Padding `--s-8` sus, `--s-4` jos
- Container 1180px
- H1: clamp(28px, 4vw, 32px), weight 700
- Subtitle: `--fs-base`, max-width 640px
- **Breadcrumb apare doar pe pagini dinamice**

### Calculator
- Grid 2 coloane 1fr 1fr cu gap `--s-16`
- Padding `--s-8` sus/jos
- Linie verticală centrală
- Mobile: stack vertical

### Tabel rezultate
- Header `--surface-container-low`, uppercase, `--fs-xs`
- Total Net invertit (negru)
- Cost Total cu `--surface-bright`, uppercase
- Sub-rows indentate `--s-6`

### PDF Button
- Uppercase, `--fs-xs`, weight 600
- Hover: invertire (alb pe negru)

### FAQ section
- Background `--surface-alt`
- Padding `--s-12` vertical
- Items cu padding `--s-4`

### Footer
- Background negru, text alb cu opacity
- 3 coloane desktop, 2 mobile

---

## 4. Touch targets pe mobile

Toate elementele interactive **min 44×44px** (Apple HIG):
- Hamburger: 44×44px
- Pills, toggle, inputs, select, PDF button: min-height 44px

---

## 5. Reguli de combinare

**Fonturi:**
- Monospace = date tehnice (topbar, breadcrumb, dateline)
- Figtree = absolut tot restul

**Greutăți:**
- 500: body
- 600: pills, suffix, footer-title
- 700: titluri, labels
- 800: doar logo

**Mărimi:** folosește mereu `var(--fs-xx)`

**Padding:**
- Interior componentă: `--s-3` sau `--s-4`
- Secțiune verticală: `--s-12`
- Între componente: `--s-2` la `--s-4`
- Între secțiuni mari: `--s-8` la `--s-16`

---

## 6. Lista de "NU"

- ❌ Border-radius non-zero (cu excepția toggle/thumb)
- ❌ Gradient-uri sau shadow-uri colorate
- ❌ Mărimi font în afara scării
- ❌ Padding/margin în afara scării 4pt
- ❌ Greutăți în afara: 500/600/700/800-doar-logo
- ❌ Culori noi
- ❌ Inline styles statice în JSX
- ❌ `!important`
- ❌ Fonturi noi

---

## 7. Lista de "DA"

- ✅ Linii subtile pentru separare
- ✅ Tipografie ca element decorativ principal
- ✅ Spațiu negativ generos
- ✅ Monospace pentru date tehnice
- ✅ Total-net invertit
- ✅ Hover-uri "invertit"
- ✅ Touch targets min 44×44 pe mobile

---

## 8. Utility classes

| Class | Efect |
|-------|-------|
| `.muted` | `color: var(--muted)` |
| `.text-xs` | `font-size: var(--fs-xs)` |
| `.text-center` | `text-align: center` |
| `.mb-2` | `margin-bottom: var(--s-4)` |
| `.right` | `text-align: right` |
| `.table-scroll` | wrapper cu `overflow-x: auto` |
| `.article-list` | listă `<ul>` cu indent + muted |

---

## 9. Verificare automată

```bash
# Inline styles statice (ar trebui zero)
grep -rn "style={" src/app/ | grep -v 'width: \`'

# !important (ar trebui zero)
grep -n "!important" src/app/globals.css

# Font-sizes în afara scării
grep -nE "font-size:[^;]*[0-9]+\.?[0-9]*(rem|px)" src/app/globals.css | grep -v "var(--"

# Spacing în afara scării
grep -nE "(padding|margin|gap):[^;]*[0-9]+\.[0-9]+rem" src/app/globals.css | grep -v "var(--"
```

---

## 10. Cleanup repo

Fișiere reziduale (duplicate `page.tsx`):
- `src/app/salariu-minim/salariu-minim.tsx`
- `src/app/salariu-mediu/salariu-mediu.tsx`
- `src/app/info/info.tsx`

Verificare: `md5sum` confirmă identice cu `page.tsx`-urile.

---

## 11. Statistici sistem (post-refactor)

| Metric | Înainte | După |
|--------|:--:|:--:|
| Tokens în `:root` | 5 | **30+** |
| `!important` | 18 | **0** |
| Inline styles statice | 7 | **0** |
| Font-sizes folosite | 19 | **6** (+ logo + h1 clamp) |
| Spacing values | 13+ | **8** (4pt grid) |
| Font-weights | 4 mixt | **3** (+ 800 logo) |
| Touch targets sub 44px (mobile) | 3 | **0** |

---

## 12. Modificări viitoare

Când introduci ceva nou:
1. Verifică dacă există ceva similar
2. Folosește DOAR tokens
3. Dacă ai nevoie de token nou, adaugă-l aici și în `:root`
4. Testează pe mobile la 768px și 640px
5. Touch targets min 44×44px pe mobile
6. **NU folosi inline styles statice**
7. **NU folosi `!important`**

---

**Ultima actualizare:** 9 mai 2026  
**Versiune:** 2.0 (refactor sistematic complet)
