# Progres salariile.ro

Ultima actualizare: 10 iulie 2026

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
