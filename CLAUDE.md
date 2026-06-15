# CLAUDE.md — Context permanent salariile.ro

> Acest fișier se pune în rădăcina repo-ului (`salariile-ro/CLAUDE.md`). Claude Code îl încarcă automat în context la fiecare sesiune, deci conține informația durabilă despre proiect. NU înlocuiește promptul de inițiere (care se dă o singură dată ca prim mesaj) — îl completează, asigurând continuitatea între sesiuni.

## Despre proiect

salariile.ro este un portal despre salarii și fiscalitate în România. Scop: calcul transparent salariu brut/net, informații fiscale actualizate, fără reclame, fără cont. Proiect independent, dezvoltat de Știuriuc Sorin-Marian, cu obiectiv de tranziție profesională către front-end.

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
- Salariu mediu — `/salariu-mediu`
- Zile libere 2026 — `/zile-libere-2026`
- Noutăți (secțiune editorială, articole) — `/noutati`
- Pagini suport: `/despre`, `/metodologie`, `/contact`, legal

## Constante fiscale curente (2026)

- Salariu minim brut: **4.325 lei din 1 iulie 2026** (HG 146/2026); 4.050 lei în prima jumătate a anului
- Salariu minim net: 2.699 lei (facilitate fiscală 200 lei, OUG 89/2025)
- Salariu mediu brut: 9.192 lei; net: 5.377 lei
- CAS (pensie) 25%, CASS (sănătate) 10%, impozit venit 10%, CAM (angajator) 2,25%
- Plafon deducere personală: 6.325 lei
- Facilitățile IT/construcții ELIMINATE din 1 ian 2025 (OUG 156/2024)
- Surse oficiale: legislatie.just.ro (HG 146/2026, OUG 89/2025, OUG 156/2024, Codul Fiscal, Codul Muncii)

## Starea SEO (referință)

- GSC: ~10.700 impresii, 98 clickuri
- Poziția 1.0–1.1 pentru query-uri cu volum mare, dar CTR mic din cauza featured snippets Google
- Paginile de calculator (tranzacționale) au CTR mai sănătos decât homepage-ul
- Tehnic & on-page: nivel A/A+ conform tool-urilor de audit
- Off-site (backlinkuri, autoritate de domeniu/DR): nivel F — zona cu cel mai mare potențial de creștere
- GSC și Google Analytics sunt conectate și configurate

## Deadline critic

**1 iulie 2026** — schimbarea salariului minim (4.050 → 4.325 lei). Fereastră SEO importantă. Conținutul relevant trebuie publicat, indexat și maturat cu 2-3 săptămâni înainte (deci înainte de ~15 iunie) ca să rankeze la timp.

## Reguli de lucru

- **Autonomie:** lucrează singur pe cod SEO, conținut, analiză, audit în browser, commits/deploy non-distructive, cercetare. Tu deții roadmap-ul; nu cere direcție zilnică.
- **Cheamă patronul DOAR la:** CAPTCHA / verificare SMS / butoane „creează cont", plăți sau angajamente financiare, trimis emailuri în numele lui, schimbări mari de arhitectură care șterg/mută secțiuni.
- **Persistență:** contextul se compactează automat — nu opri sarcini devreme din grija de tokeni; salvează progresul în `PROGRES.md` înainte de limită ca sesiunea următoare să continue de unde ai rămas.
- **Backlinkuri:** prioritizează linkable assets pe site peste outreach manual. NU cumpăra linkuri, nu folosi tactici care riscă penalizare Google.
- **Canale de distribuție existente (active):** dev.to (`dev.to/sorin_stiuriuc`), LinkedIn, Reddit (r/RoMunca), GitHub.

## Direcție de arhitectură în plan (NU înainte de 1 iulie)

Există un plan de mutare a calculatorului de pe homepage într-o structură de hub cu pagini dedicate, homepage-ul devenind pagină editorială / vizualizare de date.

**IMPORTANT — timing:** această migrare NU se face înainte de 1 iulie. Până atunci, calculatorul rămâne exact unde e (rankează pe poziția 1.0–1.1 pentru query-uri cu volum mare) și nu se atinge structura paginilor care rankează. O migrare de arhitectură chiar înainte de evenimentul de trafic din iulie ar declanșa reindexare și reevaluare Google, cu risc de pierdere temporară de poziții fix în fereastra critică — exact momentul pe care vreau să-l captez. Migrarea se planifică și se execută DUPĂ ce trece valul (iulie-august), când o fluctuație temporară nu mai costă. Până pe 1 iulie: zero schimbări structurale pe paginile care rankează; doar adăugări (articole noi, optimizări non-distructive) și pregătire.

## Verificare

Arată dovezi, nu doar afirmații: la fiecare schimbare importantă, arată ce comandă ai rulat și ce a returnat, build-ul, sau rezultatul concret — nu doar „am rezolvat".
