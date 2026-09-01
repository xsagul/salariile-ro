# SXO: de ce /calculator-pfa stă pe poziția 30

Analiză din 2 septembrie 2026. Interogare țintă: **`calculator pfa`**.
Poziție actuală: 30,6 · 64 impresii · 1 click în 28 de zile.

## Sursa datelor, și o limitare care a contat

SERP-ul a fost furnizat de proprietar: google.ro, București, incognito.
Prima mea rulare a folosit unealta internă de căutare, care e **geo-US**, și
a produs un top diferit — `StartCo`, locul 2 real, nu apărea deloc.
Pentru orice analiză de SERP pe piața RO, SERP-ul se cere proprietarului
ÎNAINTE, nu se deduce din unelte US.

Structurile paginilor concurente sunt extrase de mine direct, prin fetch.

## Consensul SERP-ului

| # | Site | Octeți | Titluri | Inputuri | Acoperă |
|---|---|---:|---:|---:|---|
| 1 | solo.ro | 137 KB | 3 | (JS) | PFA + SRL + Micro |
| 2 | startco.ro | 151 KB | **1** | 6 | SRL + PFA |
| 3 | taxepfa.ro | **10 KB** | **1** | 5 | PFA |
| — | **salariile.ro** | 156 KB | **15** | **2** | PFA |

**Tipul de pagină: unealtă. Consens 9/9.** Pagina noastră ESTE unealtă, deci
NU există nepotrivire de tip — ipoteza standard SXO nu se aplică aici.

Nepotrivirea e de **formă**, nu de tip:

1. **Raport conținut/unealtă.** Topul are 1–3 titluri. Noi avem 15. Locul 3
   se clasează cu 10 KB — o pagină de 15 ori mai mică decât a noastră.
2. **Acoperire.** Două din primele trei compară PFA cu SRL. Noi tratăm
   „PFA sau SRL" ca secțiune de proză, nu ca formă calculată.

## Ipoteza proprietarului, corectată

Ipoteza era „pagina e prea complicată, prea multe funcționalități vizibile".
Măsurat, calculatorul nostru are **2 inputuri și 1 buton** — cel mai simplu
din SERP. StartCo are 6 inputuri și 7 butoane; taxepfa.ro are 5 inputuri,
slider și bifă de pensionar. Ei se clasează.

Deci nu funcționalitatea e problema. **Conținutul din jurul ei e.**
Remediul e opus celui presupus: nu simplificăm unealta, ci scoatem cele 10
secțiuni informaționale de deasupra ei.

## Ce prevede reconstrucția

Faza 1 — potrivirea structurii dominante:
- Calculatorul rămâne singurul lucru de deasupra pliului. Nimic altceva.
- Secțiunile informaționale (cum se calculează, plafoane, tranșe, praguri,
  sistem real vs normă, cheltuieli deductibile, calendar, surse) coboară
  sub unealtă sau se mută pe pagini proprii, cu link.
- Se păstrează structura, nu textul concurenților. Text identic = duplicat,
  adică exact pierderea eligibilității pe care o urmărim.

Faza 2 — diferențierea:
- „PFA sau SRL" devine **comparație calculată**, nu proză. Asta acoperă
  intenția pe care o servesc locurile 1 și 2, cu mecanica noastră.

Motivul pentru care faza 2 nu e opțională e în STUDIU-GOOGLE-LEAK-2024.md,
secțiunea D: NavBoost re-clasează pe clickuri reușite. Potrivirea de
structură te face eligibil; doar funcționalitatea proprie aduce goodClicks.

## De reținut

Locul 3 se clasează cu titlu „2025", învechit. SERP-ul ăsta nu premiază în
primul rând prospețimea, ci faptul că ești o unealtă. Nu investi în
actualizări de dată sperând că mută poziția.

## Limitări

- Interogările numite din GSC însumează 131 de impresii, față de 5.620 pe
  pagină. Vedem ~2% din cerere; restul e anonimizat de Google.
- solo.ro randează calculatorul prin JS, deci numărul lui de inputuri nu a
  putut fi extras.
- Nu s-au analizat PAA, AI Overview sau reclamele — captura furnizată
  acoperea doar primele trei rezultate organice.

---

# Teardown al concurenței — 2 septembrie 2026

Prima analiză a fost superficială: titluri, octeți, număr de inputuri.
Asta e cea completă, cerută de proprietar. Paginile au fost descărcate și
parsate, nu doar privite.

## Schema structurată

| | tipuri declarate |
|---|---|
| solo (#1) | SoftwareApplication, **Offer**, FAQPage, ImageObject, WebPage, Organization |
| startco (#2) | FAQPage, Question, Answer — atât |
| taxepfa (#3) | WebApplication, **Offer** |
| salariile.ro | WebApplication, FAQPage, BreadcrumbList, Organization, Person |

Locurile 1 și 3 declară `offers` cu preț; noi declarăm `isAccessibleForFree`.
Documentația Google pentru aplicații cere `offers`. Diferență mică, dar reală.
**Nu s-a implementat** — fără `aggregateRating` nu produce rich result oricum,
iar ratinguri nu se inventează.

## Funcționalitate, comparată

| | startco #2 | taxepfa #3 | noi |
|---|---|---|---|
| Venit lunar / anual | comutator | anual | doar anual pe calea directă |
| Slider de explorare | — | **0–500.000 lei** | — |
| „Sunt pensionar" | — | vizibil permanent | era ascuns |
| „Sunt salariat" | — | vizibil permanent | era ascuns |
| Recenzii / social proof | **da** | — | — |
| Comparație PFA vs SRL | da | — | da, cu clasament sortat |

## Ce s-a schimbat în urma teardown-ului

Eticheta panoului ascuns, de la „Calculator avansat" la „Sunt pensionar, am
salariu sau schimb contabilitatea". Panoul conține două bife care schimbă
rezultatul; cine e în acele situații primea un răspuns greșit pentru el.

Nu s-a copiat soluția taxepfa (bife mereu vizibile): simplitatea implicită —
două inputuri, cea mai mică din SERP — e un avantaj de păstrat. Problema era
descoperirea, nu vizibilitatea.

## Ce NU s-a făcut, și rămâne oportunitate

1. **Sliderul.** Cea mai distinctivă funcție a lui taxepfa. Nu e un input, e
   un mod de explorare: tragi și vezi cum se mișcă rezultatul. Exact tiparul
   care produce sesiuni lungi — `lastLongestClicks` din studiul NavBoost.
   Cea mai promițătoare adăugare rămasă, dar cere muncă în componentă și
   verificare vizuală serioasă.
2. **Venit lunar pe calea directă.** Mulți freelanceri gândesc lunar. Avem
   lunar doar pe calculul invers („din net lunar").
3. **`offers` în schema.** Vezi mai sus; valoare marginală.
