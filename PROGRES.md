# Progres salariile.ro

Ultima actualizare: 29 iulie 2026

## Audit SEO complet și sprint de autoritate — 29 iulie 2026

Status: audit terminat, modificări locale verificate și un material extern publicat; batchul auditului nu a fost comis, împins sau deployat. Separat, commitul operațional `4280154` (`Add Vercel analytics reporting`) a produs un deploy Production la 07:22:18 și conține numai scriptul local de raportare plus comanda din `package.json`. Raportul complet este în `SEO-AUDIT-DEPARTAMENT-2026-07-29.md`.

- GSC 29 iunie–26 iulie versus 1–28 iunie: 2.237 vs. 495 clickuri (+351,9%), 184.388 vs. 41.281 impresii (+346,7%), CTR 1,21% vs. 1,20%, poziție 7,77 vs. 8,94. Ultimele 14 zile indică platou sănătos, nu declin.
- Auditul tehnic a confirmat 63/63 URL-uri live cu 200, 61/63 indexate individual în GSC, canonical/H1/SSR/JSON-LD corecte și Core Web Vitals bune. Plafonul principal este autoritatea externă.
- GSC Links raportează exact 67 linkuri externe din 3 domenii: Reddit 61, FaceToțiBanii 3 și FastFulfill 3. Indexurile terțe și referrerii Vercel sunt păstrate separat și nu se însumează.
- Implementat local `/date-salarii` cu Dataset/DataDownload JSON-LD, CSV, JSON, 4 înregistrări, 5 surse oficiale și test de sincronizare.
- Implementat local răspuns 410 pentru `/info`, semantică/contrast editorial îmbunătățite, adâncime maximă 3 clickuri pentru paginile calculator și snapshoturi Vercel persistente.
- Publicat pe DEV articolul `Auditing a Next.js Salary Calculator After a 4.5x Search Visibility Spike`, cu link follow către salariile.ro. DEV era deja domeniu de referință; nu se raportează ca domeniu nou și efectul nu este încă măsurabil.
- Pregătit forkul `xsagul/ro-open-source`, branch `add-salariile-ro`, commit `0dfb5d4`; PR-ul este blocat corect până la o decizie explicită privind licența codului.
- Draftul LinkedIn este în `seo-assets/linkedin-audit-seo-2026-07-29.txt`; nu a fost publicat deoarece editorul LinkedIn nu a acceptat introducerea automată a textului.
- Verificare finală: `npm test`, `npm run lint`, `npm run build`, `npm run test:rendered`, `git diff --check` și `npm run vercel:snapshot` au trecut.
- Următorul snapshot curat rămâne 4 august; batchul local poate fi deployat controlat după această citire, cu verdict direcțional la 14 zile și verdict robust la 28 zile.

## P1 SEO, securitate si plan 90 zile - 26 iulie 2026

Status: implementat, verificat, comis in `e168372` si publicat pe site la 26 iulie 2026.

- Baseline-ul GSC folosit pentru decizii este ultima fereastra completa, 27 iunie-24 iulie 2026: 2.204 clickuri, 181.049 impresii, CTR 1,22% si pozitie medie 7,77. Fata de cele 28 de zile anterioare, clickurile au crescut cu 403,2%, iar impresiile cu 397,3%; proiectul nu este in stagnare. Datele se opresc inaintea deploy-urilor P0/P1, deci efectul lor nu este inca masurabil.
- Creat `ROADMAP-90-ZILE.md`, cu matrice intentie-competitor-URL, sprinturi, KPI base/stretch, praguri de rollback, calendar de masurare, gate pentru migrarea homepage-ului si gate separat pentru AdSense. Competitorii sunt folositi ca benchmark intern, nu introdusi artificial pe fiecare pagina.
- Creat dashboard-ul reproductibil `npm run gsc:weekly -- --end=YYYY-MM-DD`; snapshoturile de control post-deploy sunt stabilite pentru 4 august si 25 august 2026.
- Inchis spatiul programmatic la 40 de pagini salariale validate prin date de cautare. URL-urile arbitrare si variantele cu zerouri initiale raspund 404. Pagina `2.574 net` foloseste corect regimul istoric S1 si inverseaza la 4.050 lei brut; fiecare pagina valida are legaturi catre vecini si sensul opus de calcul.
- Publicata pagina `/salariu-minim-constructii-2026`: 4.582 lei brut, 27,714 lei/ora, net standard 2.739 lei in S1 si 2.754 lei in S2, cu facilitate 0, comparatie cu minimul general, surse oficiale si JSON-LD Article/Breadcrumb/FAQ.
- Corectate afirmatii editoriale neverificabile sau imprecise in paginile despre salariul minim, salariul mediu, fluturas, widget, zile libere si despre proiect. HG 146/2026 este descrisa exact ca act pentru minimul general; pragul din constructii are temei separat in OUG 156/2024, art. LXIX.
- Intarit endpointul Markdown cu allowlist, origine controlata, redirect blocat, timeout, validare HTML si limita de 2 MB. Middleware-ul exclude API/assets, iar asset-urile publice fara hash nu mai primesc cache `immutable` de un an.
- Actualizat Next.js la 16.2.12 si dependentele de productie; `npm audit --omit=dev` raporteaza 0 vulnerabilitati. Auditul complet mai semnaleaza numai lantul dev-only `brace-expansion` din pluginurile ESLint, fara o actualizare compatibila cu ESLint 9 in acest moment.
- Verificare locala: ESLint, testele fiscale si PFA, TypeScript, build Next.js 16.2.12 si `npm run test:rendered` trecute. Testul rendered a verificat 63 de URL-uri, 63 de blocuri JSON-LD, un singur H1/main, canonical, allowlist, legaturi interne, Markdown si cache.
- Verificare dupa deploy: crawl live 63/63 URL-uri cu HTTP 200, exact un H1, canonical corect si JSON-LD; pagina constructii si calculul istoric 2.574 net confirmate in browser fara erori de consola; URL-urile `5551 brut` si `00004325 brut` raspund 404; Markdown raspunde `text/markdown`; endpointul direct off-list raspunde 404.
- Distribuire tehnica: sitemap-ul a fost retrimis si acceptat de Google Search Console; IndexNow a acceptat toate cele 63 de URL-uri cu HTTP 200.

## P0 fiscal, PFA si continut - 26 iulie 2026

Status: implementat, verificat, comis in `d5d022d` si publicat pe site la 26 iulie 2026.

- Motorul PFA a fost extras in `src/lib/pfa.ts` si acoperit cu teste pentru praguri, pensionari, venit zero/pierdere, exceptia salariala si calcul invers. Logica urmeaza ghidul ANAF 2026, inclusiv faptul ca diferenta CASS pana la plafonul minim nu este deductibila. Exemplul ANAF pentru venit net 57.000 lei este inclus ca test de regresie.
- Regimurile salariale 2026 sunt separate explicit: S1 (4.050 lei, facilitate 300 lei) si S2 (4.325 lei, facilitate 200 lei). Pagina programatica pentru 4.050 brut foloseste acum integral S1, inclusiv calculatorul interactiv si calculul invers.
- Validarea D112 ramane descrisa ferm si exact: formular completat separat de Sorin si verificat cu validatorul ANAF; campurile si sumele au coincis cu motorul site-ului.
- Corectate paginile `/salariu-mediu`, `/salariu-minim`, `/metodologie`, `/fluturas-salariu`, homepage si articolele afectate. Ultimul castig salarial INS publicat este mai 2026 (9.483 lei brut, 5.684 lei net); indicatorul BASS de 9.192 lei este etichetat separat.
- Articolul despre cosul minim foloseste ultima valoare publicata de FES/Syndex (septembrie 2025), fara intervale 2026 inventate.
- Contextul permanent din `AGENTS.md` a fost corectat cu snapshotul GSC real si distinctia INS/BASS.
- Verificare finala locala: `npm test` (inclusiv 22 asertiuni PFA), ESLint, TypeScript si build Next.js trecute. `npm run test:rendered` a verificat 56 de URL-uri din sitemap: HTTP 200, exact un H1, canonical corect si controalele P0 de continut/JSON-LD.
- Verificare dupa deploy: toate cele 56 de URL-uri live din sitemap au raspuns HTTP 200, cu exact un H1 si canonical corect; markerii P0 noi sunt activi pe productie.

Nota: sectiunile de mai jos sunt jurnal istoric si pot contine stari care au fost ulterior corectate.

## Standard de content + drafturi /salariu-minim - 10 iulie 2026

Status: studiu terminat, 4 variante draft construite local; NIMIC modificat pe pagina live, NIMIC comis.

Ce s-a facut:

- Userul a respins 3 propuneri de content la rand (repetitie nevazuta la review, hook in loc de raspuns, caseta "Raspuns scurt" golita de raspuns) si a cerut studiu serios inainte de orice modificare.
- Citit integral ghidul de content Adobe Spectrum (9 pagini) si scris `STUDIU-SPECTRUM-CONTENT.md` (radacina repo): 6 lentile (utilitate, placere de citit, cine cauta, intentie, cum scrii, cum faci AI sa scrie bine) + protocol obligatoriu de scriere cu AI + audit /salariu-minim (pica: repetitia tripla din primul ecran, dublura barei angajat/stat, "mai jos" directional, date contradictorii 6 vs 1 iulie, grafic fara tabel HTML, FAQ part-time vag).
- Memorie noua: `content_standards_spectrum.md` (regulile confirmate de user).
- Construite 4 variante draft in `src/app/draft-sm/` (noindex, nu-s in sitemap, NU se comit fara acord): index + v1 "Lede canonic" (interventie minima), v2 "Caseta-raspuns", v3 "Ordinea intentiilor" (drepturi + norma partiala urcate in corp, FAQ redus), v4 "Intrebarile cititorului" (H2 intrebari + bloc raspuns marcat). Module comune in `draft-sm/comune.tsx`.
- Cifre noi norma partiala calculate cu motorul fiscal (`scripts/calc-parttime.mts`): 2h brut 1.081 -> net 703; 4h 2.163 -> 1.352; 6h 3.244 -> 1.985; 8h 4.325 -> 2.699 (sanity check OK).
- Verificat in browser pe dev server: toate 4 variantele randeaza, consola curata, fraza-raspuns apare o singura data in DOM per pagina.

Userul a ales V1 si a iterat pe el: (1) separarea "Sectoare si obligatiile angajatorului" in doua sectiuni; (2) adaugarea sectiunilor din V3 "Drepturile tale la salariul minim" si "Pe ora, pe zi si la norma partiala" (cardurile SubMinim/2Ani si 6 FAQ-uri acoperite retrase, FAQ ramas la 8); (3) reechilibrare cu carduri ADITIVE noi in comune.tsx (variante nealese pastrate pe /draft-sm/carduri; cifre in scripts/calc-carduri.mts si calc-parttime.mts, toate din motorul fiscal).

Maparea FINALA V1 (validata de user, 10 iul): Ce se retine din brut -> CardPentruCe; Netul pas cu pas -> CardPastrezi + CardCatiOameni (831.382 salariati, mmuncii); Angajat/firma -> CardCifre; Drepturile tale -> CardSalariuIntarziat (art. 166 + 81); Pe ora/zi/partial -> CardOreSuplimentare + CardPartTimeGri; Minimul pe sectoare -> CardSectoareNet (net constructii 2.754); Obligatiile angajatorului -> CardCostFirma (1.704/salariat S2); Cum a crescut -> CardPutereCumparare + CardUrmatoareaCrestere; FAQ -> CardSurse. Verificat in DOM: consola curata, cifrele-cheie o singura data.

APLICAT PE LIVE (10 iul, cu acordul userului): V1 rescris ca fisier de sine statator in src/app/salariu-minim/page.tsx — metadata pastrata, JSON-LD actualizat (Article dateModified 2026-07-10 + FAQPage pe cele 8 intrebari ramase), date unificate pe 10 iulie, zero em dash-uri in text (em dash = amprenta AI, corectia userului; regula adaugata in standard). Verificat local: H2-uri in ordinea aprobata, FAQ 8=8, consola curata, npm run build trecut. Comis si impins pe main (deploy automat Vercel). NU s-au comis: draft-sm/ (raman locale), STUDIU-SPECTRUM-CONTENT.md si STUDIU-ADOBE-AI-WRITING.md (interne — contin discutia despre redactarea cu AI, iar userul a decis sa nu declare public; repo-ul e public). Cardul REGES retras (cerea verificare factuala); CardCatiOameni citeaza comunicatul mmuncii din iulie 2026.

De urmarit dupa deploy: pozitiile GSC pe query-urile "net" si "constructii" (intentia #2, ~30% din afisari, inca subacoperita — pagina dedicata constructii ramane oportunitatea principala); featured snippet pe raspunsul-intai din lede.

## /salariu-mediu restructurat pe aceeasi formula - 10 iulie 2026

Aplicat si impins pe live cu acordul userului ("pagina de test, mana libera"). Audit: aceleasi boli ca la minim (repetitie tripla in primul ecran, mediana de 4 ori, FAQ 6/8 dubluri ale corpului, grafic fara tabel, "vezi cifra alaturi" directional). GSC 90 zile (597 afisari, volum mic cum stiam): intentia #1 = valoarea oficiala pt pensie ("salariu mediu brut 2026 pentru calcul pensie" 121 imp poz 11,6 + clusterul "castig salarial mediu brut utilizat la fundamentarea bugetului" ~32% din afisari); brut > net aici (invers ca la minim).

Schimbari: lede canonic unic (caseta "Raspuns scurt" stearsa), sectiunea pensiei urcata pe locul 2 cu expresia legala EXACTA in corp (nu exista deloc; eram poz 10-11 pe cluster) + raspuns explicit la "ce salariu trebuie sa ai pentru un punct de pensie" (poz 1 deja), tabel istoric HTML nou (coloanele crestere + legea anului, existau in date nerandate), FAQ 8->4, card nou "Media fata de minim" (link bidirectional intre piloni). Cifrele verificate cu motorul (9.192 -> 5.377, CAM 207, cost 9.399 - toate corecte deja). INS mai 2026 NEpublicat inca (apare ~mijloc iulie) - aprilie ramane la zi; DE ACTUALIZAT cifra INS cand iese comunicatul (5.843/9.740 apr).

## Sprint SEO extern - 7 iulie 2026

Status: lucru extern/off-site pornit, cu Seobility, SERP si backlinkuri competitoriale verificate.

Ce s-a facut:

- Verificat Seobility in browser pe proiectul salariile.ro:
  - On-page score: 78%.
  - Tech & Meta: 90%.
  - Structure: 95%.
  - Content: 48%.
  - Backlinkuri detectate: calculatorulinflatiei.ro, dev.to/sorin_stiuriuc, fastfulfill.ro.
  - Top pages cu backlinkuri: `/` si `/salariu-minim`.
  - Link Building arata 294 oportunitati brute, dar multe sunt spam/toxice (`anomaly-seo`, `link-legion`, retele `.xyz`/`.space`).
- Identificati competitori directi noi/activi:
  - `calcultaxe.ro`
  - `totulcalculat.ro`
  - `portalx.ro`
  - `netdinbrut.ro`
  - `jobinfo.ro`
  - plus competitorii mari: `calculator-salarii.ro`, `undelucram.ro`, `salaria.ro`, `paylab.ro`, `calculatorvenituri.sdworx.ro`, `accace.ro`.
- Creat action board extern pe Desktop:
  - `C:\Users\Sorin\Desktop\EXTERNAL-SEO-ACTIONBOARD-SALARIILERO-2026-07-07.md`
- Rescris `README.md` ca asset public GitHub pentru proiect:
  - linkuri spre calculator, widget, metodologie, salariu minim, salariu mediu, PFA, fluturas, zile libere.
  - pozitionare clara: calculator salariu net/brut 2026 pentru Romania.
- Commit + push public pe GitHub:
  - `4b81236` - Improve public project profile for external SEO
- Configurat Seobility Rankings:
  - adaugate 10 keyword-uri lipsa: `widget calculator salariu`, `calculator salariu minim 2026`, `4325 brut in net`, `4325 brut net`, `zile lucratoare 2026`, `zile lucratoare iulie 2026`, `calculator salarii iulie 2026`, `calculator salariu iulie 2026`, `calculator salariu net iulie 2026`, `calcul salariu net iulie 2026`.
  - dupa salvare, Seobility a afisat `Keywords with rankings 35 / 63 +10`.
  - verificare ulterioara: unele keyword-uri noi apar in tabel cu tara `COM`, nu `RO`; cauza este default-ul `Country Google.com` din modalul `New keyword`. Trebuie re-adaugate pe `Google.ro` si apoi eliminate/ignorate variantele `COM`.
  - remediat in browser: aceleasi 10 keyword-uri au fost re-adaugate cu `Country Google.ro`; verificare prin filtrul `widget calculator salariu` arata atat randul vechi `COM`, cat si randul nou `RO`, iar headerul Seobility arata `Keywords with rankings 37 / 73 +10`.
  - variantele `COM` raman in cont, dar nu au fost sterse pentru ca stergerea ar elimina istoricul; se pot curata separat dupa confirmare.
  - completati competitorii directi in Rankings/Competitors: `calculator-salarii.ro`, `salaria.ro`, `paylab.ro`, `undelucram.ro`, `ghidsalariu.ro` plus competitorii deja existenti (`calculatoare-salarizare.ro`, `eghiseul.ro`, `papervee.com`, `leaveboard.com`, `impozitsalariu.ro`, `brutnet.ro`, `salariu-net.ro`, `calculatorvenituri.ro`).
  - `netdinbrut.ro`/`jobinfo.ro` raman de re-verificat daca incap in limita de 20 competitori sau daca Seobility le normalizeaza diferit.
- Triat primele 20 oportunitati din Seobility `Backlinks > Link Building`:
  - 2 sunt prospecte reale/posibile: `aesynero.ro`, `catalin.francu.com/blog/`.
  - 18 sunt retele spam/toxice: `anomaly-seo`, `link-legion`, `bhs-links`, domenii `.xyz`/`.space` si footprint adult/spam. Decizie: nu se replica.
  - prospecte externe curate adaugate in action board: `aesynero.ro`, `timeoff.guru`, `24conta.ro`, cu outreach pregatit doar dupa confirmare.
  - competitori reali din randurile spam notati pentru analiza, nu outreach: `leaveboard.com`, `eghiseul.ro`, `impozitsalariu.ro`, `salaria.ro`, `paylab.ro`, `calculator-salarii.ro`, `calculatoare-salarizare.ro`.
- Creat outreach pack pe Desktop:
  - `C:\Users\Sorin\Desktop\OUTREACH-PACK-SALARIILERO-2026-07-07.md`
  - `C:\Users\Sorin\Desktop\DIRECTORY-SUBMISSION-PACK-SALARIILERO-2026-07-07.md`
  - include drafturi pentru Aesynero, TimeOff.Guru, 24Conta, LinkedIn, DEV.to si Reddit.
  - include copy pentru ROTSA, RomanianStartups, StartupBlink, EU-Startups, Uneed, AlternativeTo si Startup Stash.
  - status: nimic trimis/publicat fara confirmare.
- Runda 2 cercetare off-site:
  - adaugata in action board o lista de directoare/startup databases: ROTSA, RomanianStartups, StartupBlink, EU-Startups, TrustMRR, Uneed, AlternativeTo, Startup Stash.
  - adaugate prospecte SERP din zona HR/contabilitate: GNConta, Statul de Plata, SITT, CalculatoareUsoare, Portal Codul Fiscal/Portal Codul Muncii.
  - verificat contacte publice pentru runda 2: `office@gnconta.ro`, `office@statuldeplata.ro`, `contact@sitt.ro`.
  - adaugate drafturi netrimise pentru GNConta, Statul de Plata si SITT in outreach pack.
  - concluzie: cele mai bune tinte raman paginile cu linkuri utile, articole care citeaza calculatoare vechi si site-uri HR/contabilitate fara calculator actualizat.
- Rulat GSC local pentru maparea tintelor de link building:
  - pagini prioritare pentru linkuri externe: `/`, `/salariu-minim`, `/calculator/calcul-salariu-net-4325-brut`, `/metodologie`, `/noutati/cosul-minim-de-consum`.
  - query-uri prioritare: `calculator salariu net 2026`, `calculator salarii 2026`, `salariu minim pe economie 2026 net`, `calculator salariu minim 2026`, `calculator salariu brut 2026`, `4325 brut in net`.
  - `/calculator-pfa` are 1.545 impresii si pozitie 52,4; se recomanda consolidare on-site inainte de outreach.

Urmatorii pasi off-site:

1. Decide daca stergem variantele `COM` din Seobility sau le lasam ca istoric separat.
2. Trimite, dupa confirmare, primele 3 outreach-uri catre Aesynero, TimeOff.Guru si 24Conta.
3. Trimite, dupa confirmare, runda 2 catre GNConta, Statul de Plata si SITT.
4. Publica, dupa confirmare, postare LinkedIn + articol DEV despre widget.
5. Submit, dupa confirmare, in ROTSA si RomanianStartups; apoi StartupBlink/Uneed daca pozitionarea este potrivita.
6. Verifica in Seobility daca competitorii noi pot include si `netdinbrut.ro` / `jobinfo.ro` fara sa depaseasca limita.
7. Continua trierea Seobility Link Building paginile 2-3, dar doar pentru prospecte reale, nu retele de linkuri.

## Audit SEO si marketing

Status: audit tehnic + continut + extern + AI/GEO rulat, cu doua runde de implementare publicate.

Commituri relevante:

- `6cff079` - Fix SEO metadata freshness
- `e395f18` - Add SEO pages for fiscal long-tail queries
- `9a3f698` - Document SEO audit progress
- `db8e8ea` - Remove unused app archive artifact
- `d9dfebd` - Add concise answers to key SEO pages
- `fb79ac7` - Link new guides from main navigation

Ce s-a facut:

- `npm run lint` trece.
- `npm run build` trece, 66 pagini generate.
- Au fost publicate paginile:
  - `/deducere-personala-2026`
  - `/zile-lucratoare-2026`
- Metadata a fost scurtata astfel incat crawl-ul local are:
  - 56 URL-uri crawlate
  - 0 probleme blocante
  - 0 titluri peste 70 caractere
  - 0 descrieri peste 160 caractere
- Sitemap trimis la Google si Bing.
- IndexNow a acceptat 13 URL-uri.
- Live verificat: paginile noi raspund 200.
- A fost sters artefactul mort `src/app/components.zip`.
- Au fost adaugate blocuri "Raspuns scurt" pe:
  - `/salariu-minim`
  - `/salariu-mediu`
  - `/zile-libere-2026`
  - `/calculator-pfa`
- `/salariu-mediu` a fost actualizat cu date INS aprilie 2026: 9.740 lei brut si 5.843 lei net.
- Sitemap Google/Bing si IndexNow au fost retrimise dupa aceste schimbari.
- Paginile noi `/deducere-personala-2026` si `/zile-lucratoare-2026` au fost adaugate in dropdownul principal "Ghiduri".

Rapoarte generate pe Desktop:

- `C:\Users\Sorin\Desktop\AUDIT-SEO-MASTER-SALARIILERO-2026-07-06.md`
- `C:\Users\Sorin\Desktop\PLAN-MARKETING-OFFSITE-SALARIILERO-2026-07-06.md`
- `C:\Users\Sorin\Desktop\AUDIT-SEO-SALARIILERO-2026-07-06.md`
- `C:\Users\Sorin\Desktop\AUDIT-SEO-EXTERN-SALARIILERO-2026-07-06.md`

## Urmatorii pasi prioritari

1. Verifica manual in GSC UI indexarea pentru:
   - `/deducere-personala-2026`
   - `/zile-lucratoare-2026`
2. Monitorizeaza in 7-14 zile impresiile pentru:
   - `deducere personala 2026`
   - `tabel deducere personala`
   - `zile lucratoare 2026`
   - `zile lucratoare iulie 2026`
3. Refactorizeaza `/calculator-pfa` intr-un hub complet PFA/PFA vs SRL.
4. Adauga blocuri "Raspuns scurt" pe paginile informationale mari.
5. Promoveaza linkable assets:
   - widget calculator salariu
   - tabel deducere personala
   - calendar zile lucratoare
   - metodologie calcul

## Observatii

- Blocajul SEO principal nu este tehnic, ci autoritate externa + acoperire de intentii laterale.
- `calculator-pfa` este cea mai mare oportunitate on-site ramasa.
- Nu cumpara linkuri si nu folosi widgetul ca schema agresiva de linkuri.

## Seobility competitor keyword universe - 2026-07-08

Status: completat peste lista existenta, fara stergeri.

Ce s-a facut:

- Au fost pastrate cele 73 keyword-uri existente in Seobility.
- Au fost adaugate 19 keyword-uri noi pe `Google.ro`, extrase din topurile publice AhrefsTop pentru competitorii care aveau date disponibile:
  - `undelucram`
  - `totogaming`
  - `sabroso`
  - `flip ro`
  - `salarii it`
  - `salariu contabil`
  - `salarii`
  - `contabil salariu`
  - `inginer mecanic salariu`
  - `verificare rovinieta`
  - `verificare rovinieta fara serie sasiu`
  - `verificare rovinieta online`
  - `rovinieta verificare`
  - `numar cadastral`
  - `calculator vechime`
  - `calculator concediu medical`
  - `calculator salarii 2023`
  - `calculator indemnizatie crestere copil`
  - `calculator concediu de odihna`
- In modalul Seobility s-a vazut `Keyword limit: 92 / 300`, adica 73 existente + 19 noi.
- Verificare post-save in Seobility: filtrul gaseste keyword-uri noi precum `calculator vechime` si `undelucram`.
- Au fost verificate si topurile `calculator-salarii.ro`; termenii mari (`calculator salariu`, `calculator salariu net`, `salariu net`, `calculator salarii`, `calculator salariu brut`, `calcul salariu net`, `brut to net`) erau deja urmariti sau acoperiti, deci nu au fost duplicati.
- `leaveboard.com` a fost verificat, dar topurile publice disponibile sunt United States (`federal holidays 2024`, etc.), nu Romania, deci nu au fost adaugate in proiectul `Google.ro`.
- Nu exista pagina publica AhrefsTop/Semrush folosibila pentru: `impozitsalariu.ro`, `jobinfo.ro`, `brutnet.ro`, `netdinbrut.ro`, `ghidsalariu.ro`, `calculatorvenituri.ro`, `salaria.ro`.

Raport complet pe Desktop:

- `C:\Users\Sorin\Desktop\COMPETITOR-KEYWORD-UNIVERSE-SALARIILERO-2026-07-08.md`

## Verificare volume keyword-uri in Seobility - 2026-07-08

Status: metoda de verificare gasita si aplicata.

Ce s-a verificat:

- Metoda buna: `Seobility App > Tools > Keyword Research Tool > URL/Domain > Domain > Google.ro > Organic keywords`, sortat dupa `Volume`.
- Pentru cele 19 keyword-uri deja adaugate, verificarea s-a facut si in `Rankings > Keywords`, prin coloana `S.V.`, pe `RO`.
- Seobility public keyword tool era limitat (`0 checks left today`), dar aplicatia avea `50 checks` si a permis analiza.
- Au fost verificate domeniile: `calculator-salarii.ro`, `salaria.ro`, `paylab.ro`, `calculatoare-salarizare.ro`, `undelucram.ro`, `eghiseul.ro`, `papervee.com`, `leaveboard.com`, `impozitsalariu.ro`, `brutnet.ro`, `salariu-net.ro`, `ghidsalariu.ro`, `calculatorvenituri.ro`, `netdinbrut.ro`, `jobinfo.ro`.
- `calculatorvenituri.ro` nu a returnat rezultate organice in Seobility pe `Google.ro`.
- Raportul AhrefsTop initial ramane sursa secundara; pentru decizii folosim Seobility, fiind acelasi ecosistem cu tracking-ul.

Raport complet pe Desktop:

- `C:\Users\Sorin\Desktop\SEOBILITY-KEYWORD-VOLUME-VERIFICATION-SALARIILERO-2026-07-08.md`

## Audit cap-coada pe departamente — 2026-07-31

Status: 9 echipe paralele (tehnic/QA, date, continut, crawl live, SERP,
fiscal, off-site, AI/GEO, forensic salariu-minim). Deployat commitul `1602341`.

### Descoperiri care schimba prioritatile

- **Al doilea val de trafic a inceput pe 27 iulie**, invizibil in auditul din
  29 iulie (care se oprea pe 26). Media 20-26 iul: 6.987 impresii/zi;
  27-28 iul: 18.532/zi (+142,8% pe aceleasi zile de saptamana). Confirmat
  independent de Vercel, continua pe 29-30 iulie. **Cauza neatribuibila** —
  deployul nostru a fost pe 29, dupa inceputul saltului.
  Consecinta: masurarea de pe 4 august e contaminata (doua evenimente
  suprapuse). Baseline nou de la 29 iulie.
- **CTR-ul a scazut**, nu a stagnat: 1,31% -> 1,16% (28v28). Cresterea vine
  din generice pe pozitiile 6-10.
- **Intentia "salariu minim net" e zero-click.** Forensic pe sub-intentii,
  comparat cu baseline PRE-eveniment (17-28 iun, nu cu varful din iulie):
  CTR plat sub 1% indiferent de pozitie, inclusiv pe locul 1. Recuperarea
  celor 2,5 pozitii pierdute valoreaza sub 20 clickuri/luna.
  In schimb homepage-ul a urcat pe intentia de calculator (8,67 -> 5,38),
  unde CTR-ul e 2-10%. **Decizie: nu urmarim rangul pe informational net;
  consolidam pe calculator.**
- **Autoritatea reala e ~4 domenii dofollow.** Din cele 67 linkuri GSC,
  61 sunt Reddit nofollow. Backlinkul de pe facetotibanii.ro a fost STERS
  (verificat in DOM live; GSC inca il raporteaza). Brand: 8 impresii la
  210.945 servite.
- **Clona locala era in urma cu 2 commituri**, iar `9220ac1` redenumise
  `middleware.ts` -> `src/proxy.ts`. Batchul P2 modifica middleware.ts, deci
  commitul direct ar fi pus handlerul 410 intr-un fisier ignorat de Next 16.
  Rezolvat prin rebase (git a urmarit redenumirea si a fuzionat corect).

### Livrat in productie (commit 1602341)

- `/date-salarii` + CSV + JSON live (erau 404; toate unghiurile de PR
  depindeau de ele). CSV se serveste ca `text/csv`.
- `/info` -> 410 (era indexata; 1 click/90 zile, 0 linkuri interne).
- `/zile-lucratoare-2026`: titlul/blocul "Raspuns rapid"/FAQ lunar se
  calculeaza din luna curenta. Era hardcodat pe iulie si expira pe 1 august
  pe o pagina cu 11.032 impresii, pozitia 5,11.
- Dezambiguizare 16 zile libere vs 17 sarbatori denumite (a doua zi de
  Rusalii cade pe 1 iunie in 2026). Site-ul se contrazicea singur.
- Homepage nu mai revendica fraza informationala "Salariu minim net";
  H1 + JSON-LD pe /salariu-minim aliniate cu title-ul.
- `seo-snapshots/`, `seo-assets/`, `SEO-AUDIT-*.md` -> .gitignore
  (repo public; decizie explicita a proprietarului).

### Backlog urmator, in ordine

1. **Meta descriptions rescrise de Google**: pe `/salariu-minim-constructii-2026`,
   `/deducere-personala-2026` si 2 rute `/calculator/*`, Google afiseaza
   meniul de navigatie ca snippet. De rescris descrierile ca sa raspunda
   intentiei, nu ca sa fie call-to-action.
2. **`/calculator/*` (40 pagini)**: raspunsul nu e in title, description sau
   primele 40 de cuvinte. Titlu de forma "5.000 lei brut = 2.981 lei net in
   2026". Cel mai mare deficit GEO identificat.
3. **`llms.txt` generat din cod** (route handler ca robots.txt): azi listeaza
   1 articol din 6 si 13 calculatoare din 40; divergenta e structurala.
4. **`src/lib/organization.ts`**: entitatea Organization e definita inline in
   ~9 locuri, fara `@id` si fara `sameAs`. Person e facut corect, Organization nu.
5. **Valoarea INS in 6 locuri** — comunicatul pentru iunie se asteapta
   ~12-14 august. De extras intr-o constanta unica inainte.
6. **Recuperare linkuri**: facetotibanii.ro (sters) si contractorii.ro
   (mentiune fara link). Drafturi pregatite, NETRIMISE.
7. Hub PFA (pozitia 47, acoperire tematica incompleta) si test de title
   izolat pe `/zile-libere-2026` (4 clickuri = risc zero), dupa fereastra curata.

### Neverificat

- Gmail, GSC UI, Vercel dashboard, Seobility: extensia Claude for Chrome nu
  era conectata (`list_connected_browsers` -> lista goala). Datele GSC/Vercel
  au venit prin API si scripturi locale.
- Numarul de linkuri externe din GSC nu e expus prin API; ramane cifra din
  raportul UI (67/3 domenii), care oricum supraestimeaza (vezi mai sus).
