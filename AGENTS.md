# AGENTS.md — Context permanent salariile.ro

> Acest fișier se pune în rădăcina repo-ului (`salariile-ro/AGENTS.md`). Codex îl încarcă automat în context la fiecare sesiune, deci conține informația durabilă despre proiect. NU înlocuiește promptul de inițiere (care se dă o singură dată ca prim mesaj) — îl completează, asigurând continuitatea între sesiuni.

## Despre proiect

salariile.ro este un portal despre salarii și fiscalitate în România. Scop: calcul transparent salariu brut/net și informații fiscale actualizate, în prezent fără reclame și fără cont. Modelul planificat este trafic organic și, numai după pragurile de conformitate/performance, monetizare prin AdSense. Proiect independent, dezvoltat de Știuriuc Sorin-Marian, cu obiectiv de tranziție profesională către front-end.

**Live:** https://salariile.ro
**Repo:** https://github.com/xsagul/salariile-ro (public)

## Stack tehnic

- Next.js + TypeScript (~87%) + Tailwind / CSS
- Deploy pe Vercel
- Arhitectură SSR (problemele de client-side rendering care stricau indexarea sunt rezolvate)
- Fișiere cheie: `middleware.ts`, `next.config.ts`, `src/`, `public/`

## Secțiunile site-ului

- Calculator salariu net/brut (homepage actual)
- Calculator PFA — `/calculator-pfa`
- Salariu minim — `/salariu-minim`
- Salariu minim construcții — `/salariu-minim-constructii-2026`
- Salariu mediu — `/salariu-mediu`
- Zile libere 2026 — `/zile-libere-2026`
- Noutăți (secțiune editorială, articole) — `/noutati`
- Pagini suport: `/despre`, `/metodologie`, `/contact`, legal

## Constante fiscale curente (2026)

- Salariu minim brut: **4.325 lei din 1 iulie 2026** (HG 146/2026); 4.050 lei în prima jumătate a anului
- Salariu minim net: 2.699 lei (facilitate fiscală 200 lei, OUG 89/2025)
- Indicatorul BASS 2026: 9.192 lei brut; net standard estimat: 5.377 lei. Nu se etichetează drept ultimul salariu mediu INS.
- Ultimul câștig salarial mediu publicat de INS (mai 2026): 9.483 lei brut; 5.684 lei net. Se actualizează lunar când INS publică o lună nouă.
- CAS (pensie) 25%, CASS (sănătate) 10%, impozit venit 10%, CAM (angajator) 2,25%
- Plafon deducere personală: 6.325 lei
- Facilitățile IT/construcții ELIMINATE din 1 ian 2025 (OUG 156/2024)
- Surse oficiale: legislatie.just.ro (HG 146/2026, OUG 89/2025, OUG 156/2024, Codul Fiscal, Codul Muncii)

## Starea SEO (referință verificată la 26 iulie 2026)

- GSC, ultimele 28 zile complete disponibile (27 iunie–24 iulie): 181.049 impresii, 2.204 clickuri, CTR 1,22%
- Query-urile generice cu volum mare sunt în principal pe pozițiile 6–10, nu 1.0–1.1; aici sunt plafonul de autoritate și oportunitatea de CTR
- Primele patru pagini concentrează ~84,5% din impresii; diversificarea clusterelor este prioritară
- Paginile de calculator tranzacționale tind să aibă CTR mai sănătos decât paginile pur informative
- Tehnic & on-page: nivel A/A+ conform tool-urilor de audit
- Off-site (backlinkuri, autoritate de domeniu/DR): nivel F — zona cu cel mai mare potențial de creștere
- GSC este conectat și verificat. În cod există Vercel Analytics, nu Google Analytics; politica de confidențialitate spune explicit că GA nu este folosit

## Roadmap activ

- Planul verificat pe 90 de zile este în `ROADMAP-90-ZILE.md`; baseline-ul pre-P0 se termină la 24 iulie 2026
- Snapshotul reproductibil se rulează cu `npm run gsc:weekly`; nu se atribuie efecte P0/P1 înainte de date post-deploy complete
- Rutele `/calculator/[valoare]` sunt allowlist-only. O valoare nouă intră în `src/lib/seo.ts` numai cu cerere demonstrată sau rol fiscal distinct și trebuie acoperită de `scripts/test-rendered.mts`
- Homepage-ul rămâne owner-ul calculatorului generic până la îndeplinirea gate-ului de migrare din roadmap

## Deadline critic

**1 iulie 2026** — schimbarea salariului minim (4.050 → 4.325 lei) a intrat în vigoare. Fereastra de vârf a produs creștere puternică; în perioada imediat următoare se evită migrarea grăbită a homepage-ului și se măsoară normalizarea pe clustere.

## Reguli de lucru

- **Autonomie:** lucrează singur pe cod SEO, conținut, analiză, audit în browser, commits/deploy non-distructive, cercetare. Tu deții roadmap-ul; nu cere direcție zilnică.
- **Cheamă patronul DOAR la:** CAPTCHA / verificare SMS / butoane „creează cont", plăți sau angajamente financiare, trimis emailuri în numele lui, schimbări mari de arhitectură care șterg/mută secțiuni.
- **Persistență:** contextul se compactează automat — nu opri sarcini devreme din grija de tokeni; salvează progresul în `PROGRES.md` înainte de limită ca sesiunea următoare să continue de unde ai rămas.
- **Backlinkuri:** prioritizează linkable assets pe site peste outreach manual. NU cumpăra linkuri, nu folosi tactici care riscă penalizare Google.
- **Canale de distribuție existente (active):** dev.to (`dev.to/sorin_stiuriuc`), LinkedIn, Reddit (r/RoMunca), GitHub.

## Direcție de arhitectură în plan (după stabilizarea valului din iulie)

Există un plan de mutare a calculatorului de pe homepage într-o structură de hub cu pagini dedicate, homepage-ul devenind pagină editorială / vizualizare de date.

**IMPORTANT — timing:** calculatorul rămâne pe homepage în timpul sprintului P0 și până când normalizarea din iulie este măsurată. Homepage-ul este cea mai puternică pagină organică, chiar dacă query-urile generice nu sunt pe poziția 1. Migrarea se face numai cu hartă query → URL, redirecturi, canonice și criterii de rollback; între timp sunt permise adăugări și optimizări non-distructive.

## Verificare

Arată dovezi, nu doar afirmații: la fiecare schimbare importantă, arată ce comandă ai rulat și ce a returnat, build-ul, sau rezultatul concret — nu doar „am rezolvat".
