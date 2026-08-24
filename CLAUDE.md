# CLAUDE.md — Context permanent salariile.ro

> Acest fișier se pune în rădăcina repo-ului (`salariile-ro/CLAUDE.md`). Claude Code îl încarcă automat în context la fiecare sesiune, deci conține informația durabilă despre proiect. NU înlocuiește promptul de inițiere (care se dă o singură dată ca prim mesaj) — îl completează, asigurând continuitatea între sesiuni.

## Despre proiect

salariile.ro este un portal despre salarii și fiscalitate în România. Scop pe produs: calcul transparent salariu brut/net și informații fiscale actualizate, în prezent fără reclame și fără cont. Proiect independent, dezvoltat de Știuriuc Sorin-Marian.

### Strategia, în ordinea decisă de proprietar (24 august 2026)

Ținta finală este ca site-ul să producă venit cât să înlocuiască salariul de la job. Dar **secvența e deliberată și nu se scurtcircuitează**:

1. **Acum:** salariile.ro devine cel mai mare hub salarial din România, acoperind ce fac paylab.ro și undelucram.ro.
2. **Apoi:** postare de joburi, în zona ejobs / olx / anuntul.ro.
3. **Abia după acoperirea nișei:** se decide monetizarea — vânzarea produsului, vânzarea traficului, AdSense, abonament de tip SmartBill sau altceva.

**Nu propune monetizare acum.** A fost respinsă explicit. Nu e o scăpare, e o decizie: activul se construiește întâi. Versiuni anterioare ale acestui fișier spuneau că obiectivul e „tranziție profesională către front-end" — era greșit și a dus o sesiune întreagă pe direcția greșită.

### Ce blochează de fapt pasul 1

Nu numărul de pagini. **Datele.** Măsurat pe 24 august 2026:

- Catalogul are 123 de meserii, dar plafonul cu cifră proprie e **95–100**, pentru că datele INS au doar 102 activități CAEN. Peste el nu se trece fără o sursă nouă.
- paylab are **767 de poziții** pentru că are 14.383 de respondenți la sondaj. undelucram are **400.000 de salarii declarate** și 850.000 de utilizatori.
- Diferența față de ei nu e volumul de conținut, e că **ei colectează date de la utilizatori și noi nu colectăm nimic.** Site-ul nu are, la data asta, niciun mecanism de colectare.

Aproximativ **3.400 de sesiuni pe lună includ cel puțin un calcul salarial**, conform baseline-ului măsurat în analytics. Acesta este semnal de interes, nu echivalentul a 3.400 de persoane unice și nici un set de salarii declarat prin sondaj.

Decizia care ar debloca pasul 1 e dacă se colectează salarii anonim (meserie + județ + brut, fără cont, fără PII).

**Status: RIDICATĂ ȘI AMÂNATĂ de proprietar pe 24 august 2026.** Nu respinsă — amânată, cu motivul că nu e clar dacă strică poziționarea. Nu s-a construit nimic; site-ul continuă să nu colecteze absolut nimic de la vizitatori.

Tensiunea care a oprit-o, și care rămâne reală: `/despre` promite azi „nu există formulare, conturi de utilizator sau newsletter", iar politica de confidențialitate spune că nu colectăm date despre vizitatori individuali. Un formular de salarii, chiar anonim, schimbă contractul cu utilizatorul — și încrederea e exact activul care diferențiază site-ul de paylab și de presă.

**Nu propune reluarea ei ca idee nouă.** Dacă se reia, se reia cu: bază legală GDPR, prag de k-anonimitate înainte de a publica orice cifră pe celulă (meserie × județ), text de politică actualizat și o cale de ștergere. Și cu decizia explicită a proprietarului, nu ca inițiativă de agent.

**Live:** https://salariile.ro
**Repo:** https://github.com/xsagul/salariile-ro (public)

## Stack tehnic

- Next.js + TypeScript (~87%) + Tailwind / CSS
- Deploy pe Vercel
- Arhitectură SSR (problemele de client-side rendering care stricau indexarea sunt rezolvate)
- Fișiere cheie: `src/proxy.ts` (fostul `middleware.ts`, redenumit în Next 16), `next.config.ts`, `src/`, `public/`
- Rutare: `src/app/(site)/` = paginile publice (Header/Footer/analytics), `src/app/(embed)/` = rutele de widget care rulează în iframe pe site-uri terțe. Grupurile nu apar în URL. Root layout-ul e minimal și trebuie să rămână static — nu adăuga `headers()` sau `cookies()` acolo, scoate tot site-ul din cache.

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
- Ultimul câștig salarial mediu publicat de INS (iunie 2026): 9.564 lei brut; 5.734 lei net. Se actualizează lunar.
- CAS (pensie) 25%, CASS (sănătate) 10%, impozit venit 10%, CAM (angajator) 2,25%
- Plafon deducere personală: 6.325 lei
- Facilitățile IT/construcții ELIMINATE din 1 ian 2025 (OUG 156/2024)
- Surse oficiale: legislatie.just.ro (HG 146/2026, OUG 89/2025, OUG 156/2024, Codul Fiscal, Codul Muncii)

## Starea SEO (referință verificată la 26 iulie 2026)

- GSC, ultimele 28 zile complete disponibile (27 iunie–24 iulie): 181.049 impresii, 2.204 clickuri, CTR 1,22%
- Query-urile generice cu volum mare sunt în principal pe pozițiile 6–10, nu 1.0–1.1; plafonul actual este CTR-ul și autoritatea
- P0 a fost publicat după ultima zi GSC disponibilă, deci efectul lui nu este încă măsurabil
- Paginile de calculator tranzacționale tind să aibă CTR mai sănătos decât paginile pur informative
- Tehnic & on-page: nivel A/A+ conform tool-urilor de audit
- Off-site (backlinkuri, autoritate de domeniu/DR): nivel F — zona cu cel mai mare potențial de creștere
- GSC este conectat. Proiectul folosește Vercel Analytics, nu Google Analytics.

## Roadmap activ

- Planul verificat pe 90 de zile este în `ROADMAP-90-ZILE.md`; baseline-ul pre-P0 se termină la 24 iulie 2026
- Snapshotul reproductibil se rulează cu `npm run gsc:weekly`; nu se atribuie efecte P0/P1 înainte de date post-deploy complete
- Rutele `/calculator/[valoare]` sunt allowlist-only. O valoare nouă intră în `src/lib/seo.ts` numai cu cerere demonstrată sau rol fiscal distinct și trebuie acoperită de `scripts/test-rendered.mts`
- Homepage-ul rămâne owner-ul calculatorului generic până la îndeplinirea gate-ului de migrare din roadmap

## Deadline critic

**1 iulie 2026** — schimbarea salariului minim (4.050 → 4.325 lei) a intrat în vigoare. Fereastra de vârf a produs creștere puternică; după P0 se măsoară normalizarea pe clustere și nu se atribuie rezultate înainte de 14–28 zile complete.

## Reguli de lucru

- **Autonomie:** lucrează singur pe cod SEO, conținut, analiză, audit în browser, commits/deploy non-distructive, cercetare. Tu deții roadmap-ul; nu cere direcție zilnică.
- **Cheamă patronul DOAR la:** CAPTCHA / verificare SMS / butoane „creează cont", plăți sau angajamente financiare, trimis emailuri în numele lui, schimbări mari de arhitectură care șterg/mută secțiuni.
- **Persistență:** contextul se compactează automat — nu opri sarcini devreme din grija de tokeni; salvează progresul în `PROGRES.md` înainte de limită ca sesiunea următoare să continue de unde ai rămas.
- **Backlinkuri:** prioritizează linkable assets pe site peste outreach manual. NU cumpăra linkuri, nu folosi tactici care riscă penalizare Google.
- **Canale de distribuție existente (active):** dev.to (`dev.to/sorin_stiuriuc`), LinkedIn, Reddit (r/RoMunca), GitHub.

## Direcție de arhitectură în plan (după stabilizarea valului din iulie)

Există un plan de mutare a calculatorului de pe homepage într-o structură de hub cu pagini dedicate, homepage-ul devenind pagină editorială / vizualizare de date.

**IMPORTANT — timing:** calculatorul rămâne pe homepage până când există minimum două ferestre post-P0 comparabile de câte 28 zile. Migrarea cere hartă query → URL, redirecturi/canonice, măsurare separată și criterii de rollback; până atunci facem doar adăugări și optimizări non-distructive.

## Verificare

Arată dovezi, nu doar afirmații: la fiecare schimbare importantă, arată ce comandă ai rulat și ce a returnat, build-ul, sau rezultatul concret — nu doar „am rezolvat".
