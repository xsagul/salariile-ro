# salariile.ro — Design System

> **Cum folosești acest fișier (RO):** Lipește tot conținutul de mai jos ca
> context într-o unealtă de design AI (v0, Claude, Google Stitch) sau dă-l ca
> brief unui designer. Conține paleta, fonturile, spacing-ul și rețetele exacte
> ale fiecărei componente. Nu trebuie să copiezi codul site-ului — acest fișier
> e singura sursă de adevăr pentru design. Stack: **Next.js (App Router) +
> Tailwind CSS v4** (CSS-first, utilitare în JSX, fără CSS de componente).

---

## 1. Design philosophy

**"Modern & simple"** — a clean, trustworthy SaaS look for a Romanian salary /
tax calculator. The product is a tool people use to check money figures, so the
design prioritizes **legibility, calm, and trust** over decoration.

Principles:

- **White canvas, one accent.** Backgrounds are white or a very light gray.
  A single accent color (emerald green) marks anything actionable or important.
- **Neutral gray scale for everything else.** Text, borders, and surfaces use a
  cool gray (slate) ramp. No other hues.
- **One font.** Inter, everywhere. Hierarchy comes from weight and size, not
  from mixing typefaces.
- **Hairline borders, not heavy shadows.** Sections and cards are separated by
  1px gray borders. Shadows are subtle and used sparingly (cards only).
- **Numbers are first-class.** Tabular figures (`tabular-nums`) so columns of
  money line up. Tables are the core UI, styled like a clean payslip.
- **Generous vertical rhythm.** Sections breathe with consistent vertical
  padding; content is centered in constrained max-widths.

---

## 2. Color tokens

Palette = Tailwind's stock **slate** (neutrals) + **emerald** (accent). Only
these two ramps + white. Names below are Tailwind utility names; hex values are
the approximate equivalents (Tailwind v4 defines them in OKLCH).

### Neutrals — slate

| Token        | Hex       | Used for                                            |
| ------------ | --------- | --------------------------------------------------- |
| `white`      | `#ffffff` | Page & card backgrounds, header bar                 |
| `slate-50`   | `#f8fafc` | Subtle section background (hero, FAQ, footer, CTA)   |
| `slate-100`  | `#f1f5f9` | Table header fill, hover fills, alt rows             |
| `slate-200`  | `#e2e8f0` | **Default border / hairline divider** (most common) |
| `slate-300`  | `#cbd5e1` | Input borders, stronger dividers (table head bottom)|
| `slate-400`  | `#94a3b8` | Muted text: eyebrows, breadcrumbs, captions, icons  |
| `slate-500`  | `#64748b` | Secondary labels, field labels, table head text     |
| `slate-600`  | `#475569` | **Body text** (paragraphs, nav links)               |
| `slate-700`  | `#334155` | Slightly stronger body / secondary headings          |
| `slate-900`  | `#0f172a` | **Headings, logo, emphasized values**               |

### Accent — emerald

| Token         | Hex       | Used for                                           |
| ------------- | --------- | -------------------------------------------------- |
| `emerald-50`  | `#ecfdf5` | Active mobile nav background                        |
| `emerald-500` | `#10b981` | Input focus ring / focus border                     |
| `emerald-600` | `#059669` | **Primary buttons, highlighted row, logo accent, FAQ +/−** |
| `emerald-700` | `#047857` | **Links**, active nav text, button hover-from        |
| `emerald-800` | `#065f46` | Link hover                                          |

### Color usage rules

- **Links** are `emerald-700`, underlined with `underline-offset-2`; hover →
  `emerald-800`.
- **Primary button** = solid `emerald-600` bg, white text; hover → `emerald-700`.
- **The single most important value** in a table (the net salary result) gets a
  full `emerald-600` background row with white text.
- Everything decorative/structural stays in slate. Never introduce a third hue.
- Emphasis (`<em>` / `<strong>` highlight) uses `emerald-700` text, **not** italic.

---

## 3. Typography

- **Font family:** `Inter` (loaded via Next font, variable `--font-inter`),
  fallback `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- **Font features:** `cv11, ss01, ss03` + `font-variant-numeric: tabular-nums`
  globally on `body`. Antialiased.

### Type scale

| Role             | Size (mobile → desktop) | Weight        | Color       | Notes                                   |
| ---------------- | ----------------------- | ------------- | ----------- | --------------------------------------- |
| H1 (page title)  | `text-3xl` → `sm:text-4xl` | `font-bold` | `slate-900` | `tracking-tight`                        |
| H2 (section)     | `text-2xl`              | `font-bold`   | `slate-900` | `tracking-tight`, `mt-10 mb-4`          |
| H3 (subsection)  | `text-lg`               | `font-semibold` | `slate-900` | `mt-6 mb-2`                            |
| Lead paragraph   | `text-base`             | normal        | `slate-600` | `leading-relaxed`, `max-w-2xl`, `mt-3`  |
| Body paragraph   | `text-base`             | normal        | `slate-600` | `leading-relaxed`, `mb-4`               |
| Small / caption  | `text-sm`               | normal        | `slate-500` |                                         |
| Eyebrow / label  | `text-xs`               | normal–bold   | `slate-400` / `slate-500` | `uppercase tracking-wide` |
| Logo             | `text-xl`               | `font-extrabold` | `slate-900` | `.ro` part is `emerald-600`           |

Headings always `tracking-tight`. Uppercase micro-labels always
`uppercase tracking-wide` (or `tracking-wider` for field labels).

---

## 4. Spacing, radius, shadow, layout

### Layout containers

- **Page max-width:** `max-w-6xl` (~72rem) for full-width sections (hero, nav,
  footer, calculator).
- **Reading max-width:** `max-w-3xl` (~48rem) for prose/article content.
- **Lead text width:** `max-w-2xl`.
- **Horizontal padding:** `px-4 sm:px-6`, always centered with `mx-auto`.

### Vertical rhythm

- **Section padding:** `py-10 sm:py-12` (the standard block spacing).
- Sections are separated by a **top border** `border-t border-slate-200`
  (hero uses `border-b`).

### Radius

| Token         | Value      | Used for                          |
| ------------- | ---------- | --------------------------------- |
| `rounded-md`  | `0.375rem` | Small interactive (nav link, icon btn, hamburger) |
| `rounded-lg`  | `0.5rem`   | Buttons, inputs, tables, segmented toggles |
| `rounded-xl`  | `0.75rem`  | Cards (calculator columns, CTA card) |

### Shadow

- `shadow-sm` only — on cards (calculator columns) and primary buttons.
- No large/colored shadows. Depth comes from borders, not elevation.

### Borders

- Default hairline: **`border border-slate-200`**.
- Inputs & table-head bottom: `slate-300`.
- Inner table row dividers: `slate-100`.

### Breakpoints (Tailwind defaults)

- `sm` 640px, `md` 768px, `lg` 1024px. Mobile-first.
- Nav collapses to a hamburger below `md`. Calculator grid stacks below `md`.

---

## 5. Components (exact recipes)

Each recipe lists the Tailwind classes actually used. Reproduce these visually
in any tool.

### Primary button

```
inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold
text-white shadow-sm transition-colors hover:bg-emerald-700
```

Large/CTA variant (full width inside calculator): `min-h-12 w-full px-4 py-3
uppercase tracking-wide`, plus `active:translate-y-px`.

### Secondary / outline button (e.g. "Download PDF")

```
inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5
text-xs font-medium uppercase tracking-wide text-slate-700 transition-colors
hover:border-emerald-600 hover:bg-emerald-600 hover:text-white
```

### Dashed toggle button (e.g. "Advanced calculator")

```
w-full rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-xs
font-medium uppercase tracking-wide text-slate-500 transition-colors
hover:border-slate-400 hover:text-slate-700
```

### Text input / select (control)

```
w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm
text-slate-900 outline-none transition-colors focus:border-emerald-500
focus:ring-1 focus:ring-emerald-500
```

Field label above each control:
```
mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500
```

### Segmented control (two-option switch)

Wrapper: `inline-flex overflow-hidden rounded-lg border border-slate-300`.
Each segment: `min-h-11 px-4 py-2.5 text-sm font-medium transition-colors`.
- Active: `bg-emerald-600 text-white`
- Inactive: `text-slate-500 hover:bg-slate-50`
- Second segment gets `border-l border-slate-300`.

### Card

```
rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6
```

A "soft" card variant uses `bg-slate-50` (no shadow) — used for the CTA card.

### Table (payslip style) — the signature component

Wrapper: `overflow-hidden rounded-lg border border-slate-200` (wrap in
`overflow-x-auto` if it can overflow on mobile).
Table: `w-full border-collapse text-sm text-slate-700`.

- **Head cells (`th`):** `border-b border-slate-300 bg-slate-100 px-3 py-2.5
  text-xs font-bold uppercase tracking-wide text-slate-500`. Left-aligned label
  column, right-aligned value column.
- **Body cells (`td`):** `border-b border-slate-100 px-3 py-2.5`,
  text `slate-700`. Value column is `text-right tabular-nums`.
- **Indented sub-rows** (sub-components of a total): label cell adds `pl-8`,
  text `slate-500`.
- **Subtotal row** (e.g. total deductions): `bg-slate-50`, cells
  `font-semibold text-slate-900`.
- **Hero / result row** (the net salary — the ONE highlight): full
  `bg-emerald-600`, cells `text-white`, label `text-sm font-bold uppercase
  tracking-wide`, value `text-base font-bold tabular-nums`.
- **Spacer row** between table sections: `<tr aria-hidden="true"><td
  colSpan={...} class="h-3 border-0 p-0"></td></tr>`.

> Specificity note (Tailwind v4): when a generic `td` style and a row-level
> override collide, force the row override with a trailing `!`, e.g.
> `[&_td]:text-white!`.

### FAQ accordion (native `<details>`)

Section: `border-t border-slate-200 bg-slate-50 py-10 sm:py-12`, inner
`mx-auto max-w-3xl px-4 sm:px-6`. Title `mb-6 text-2xl font-bold
tracking-tight text-slate-900`.

Each item: `<details class="group border-b border-slate-200 py-4">`.
- Summary: `flex cursor-pointer items-center justify-between gap-4 text-base
  font-medium text-slate-900` (hide native marker:
  `[&::-webkit-details-marker]:hidden`).
- Custom marker: a `+` (`group-open:hidden`) and `−` (`hidden
  group-open:inline`), both `text-xl text-emerald-600`.
- Answer: `mt-3 leading-relaxed text-slate-600`.

### CTA card (end-of-page conversion block)

Section `border-t border-slate-200 py-10 sm:py-12` → inner `max-w-3xl` →
card `rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8` containing an
H2, a `slate-600` paragraph, and one primary button.

### Eyebrow / metadata line

```
text-xs uppercase tracking-wide text-slate-400
```
Used for taglines like `PROIECT INDEPENDENT · LANSAT APRILIE 2026`.

### Breadcrumb

```
flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-400
```
Links hover → `slate-700`; separator is a `/` between items; current page is
plain text with `aria-current="page"`.

---

## 6. Chrome (header & footer)

### Header

- `sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur`.
- Inner bar: `flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6 mx-auto`.
- Logo left (`mr-auto`): `text-xl font-extrabold tracking-tight text-slate-900`
  with `.ro` in `emerald-600`.
- Desktop nav links: `rounded-md px-3 text-sm hover:bg-slate-100`; active =
  `font-semibold text-emerald-700`, inactive = `font-medium text-slate-600`.
- Mobile: hamburger (three `h-0.5 w-5 bg-slate-900` bars that animate into an
  X), dropdown panel `border-t border-slate-200 bg-white`; mobile links
  `min-h-12 px-4 py-3 text-base`, active = `bg-emerald-50 text-emerald-700`.

### Footer

- `border-t border-slate-200 bg-slate-50 pt-12 pb-6 text-slate-500`.
- Top row: logo + a short `text-sm slate-500` disclaimer, divided by
  `border-b border-slate-200 pb-8`.
- Link groups: `grid grid-cols-2 sm:grid-cols-3 gap-8`. Group titles
  `text-xs font-semibold uppercase tracking-wide text-slate-400`; links
  `text-sm text-slate-600 hover:text-emerald-700`.
- Bottom row: copyright `text-xs text-slate-400` + small icon links (LinkedIn,
  GitHub) `h-8 w-8 rounded-md text-slate-400 hover:bg-slate-200
  hover:text-slate-900`.

---

## 7. Page layout pattern

A typical content page top-to-bottom:

1. **Hero** — `section border-b border-slate-200 bg-slate-50 py-10 sm:py-12`,
   inner `max-w-6xl`. Contains: Breadcrumb → H1 → optional byline (`text-sm
   slate-500`) → Lead → optional Eyebrow.
2. **Body sections** — repeated `section border-t border-slate-200 py-10
   sm:py-12`, inner `max-w-3xl` (or `max-w-6xl` for wide tables), content
   styled as prose (H2/H3/p/ul/table all auto-styled per §3 & §5).
3. **FAQ accordion** (optional).
4. **CTA card** (optional).
5. **Footer** (global).

The homepage replaces the hero/body with the **calculator**: a `max-w-6xl
grid md:grid-cols-5 gap-6` — left form card (`md:col-span-2`) + right result
card (`md:col-span-3`, contains the payslip table).

---

## 8. Quick prompt for AI design tools

> Design a page for a Romanian salary calculator in a clean, modern SaaS style.
> White background, one emerald-green accent (#059669), everything else a cool
> gray scale (slate). Inter font only; bold tight headings, gray-600 body text,
> emerald-700 underlined links. 1px slate-200 hairline borders separate
> sections; cards are white with rounded-xl corners and a subtle shadow.
> Primary buttons are solid emerald, rounded-lg. The core element is a clean
> payslip-style table with a slate-100 header, right-aligned tabular numbers,
> and ONE emerald row for the final net-salary result. Generous vertical
> spacing (py-12), content centered in max-w-3xl (prose) / max-w-6xl (full
> width). Calm, trustworthy, legible — no extra colors, no heavy shadows.
