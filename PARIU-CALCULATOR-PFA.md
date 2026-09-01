# Pariu: /calculator-pfa pe pagina 1

Convenit între proprietar (Știuriuc Sorin-Marian) și agent, 2 septembrie 2026.
Scris aici pentru că niciunul dintre noi nu se poate baza pe memorie: agentul
nu are continuitate între sesiuni, iar 90 de zile sunt lungi.

## Termeni

**Țintă:** `/calculator-pfa` ajunge pe **poziția ≤ 8** pentru interogarea
`calculator pfa`, măsurată în Google Search Console.

**Termen:** până pe **1 decembrie 2026** (90 de zile).

**Măsurare:** `node scripts/gsc.mjs queries --query=calculator pfa`
Poziția medie pe fereastra de 28 de zile care se încheie cel mai aproape de
1 decembrie. Nu poziția dintr-o zi bună.

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
   La 90 de zile linkurile reci nu apucă să compună.

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
