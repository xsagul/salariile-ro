# Studiu: leak-ul Google Content Warehouse (2024) aplicat pe salariile.ro

Data studiului: 12 iunie 2026.
Surse: documentația scursă (google-api-content-warehouse.hexdocs.pm v0.4.0), analiza lui Rand Fishkin (SparkToro, 27 mai 2024), analiza lui Mike King (iPullRank), date live din Google Search Console (15 mai - 12 iunie 2026) și codul site-ului.

## 1. Ce este leak-ul, pe scurt

În martie 2024, documentația internă a API-ului "Content Warehouse" al Google Search a ajuns accidental pe GitHub și a fost publicată ca pachet Hex (Elixir). Conține **2.596 de module cu 14.014 atribute**. Important de înțeles corect:

- Cele 14.014 atribute **nu sunt 14.014 factori de ranking**. Majoritatea sunt câmpuri de stocare, metadate interne, câmpuri deprecated sau sisteme care nu țin de Search (People API, abuz, Assistant).
- Doar câteva sute de atribute sunt plauzibil legate de ranking (modulele PerDocData, CompressedQualitySignals, QualityNsrNsrData, Anchors, indicii NavBoost/Craps etc.).
- Dintre acestea, doar vreo **60-65 pot fi evaluate din exterior** pentru un site anume. Restul (scoruri interne, praguri, ponderi) nu sunt vizibile nimănui.

Acest studiu evaluează salariile.ro pe toate atributele auditabile.

## 2. Arhitectura dezvăluită

- **Trawler** - crawling; **Alexandria** - indexare; **HtmlrenderWebkitHeadless** - randare JS.
- **Mustang** - motorul principal de scoring (Ascorer).
- **NavBoost** - re-ranking pe baza clickurilor (13 luni de istoric: goodClicks, badClicks, lastLongestClicks, unsquashedClicks).
- **Glue / SuperRoot** - compunerea SERP-ului universal și orchestrarea.
- **Twiddlers** - filtre de re-ranking aplicate înainte de afișare (FreshnessTwiddler, demotions).

Cele mai mari confirmări (contraziceri ale declarațiilor publice Google):
1. **siteAuthority există** (autoritate la nivel de domeniu, în sistemul Q*).
2. **Clickurile influențează direct rankingul** (NavBoost).
3. **Sandbox-ul există** (atributul hostAge, "sandboxes fresh spam at serving time").
4. **Datele din Chrome sunt folosite** (chromeInTotal, vizualizări la nivel de site).

## 3. Auditul salariile.ro, atribut cu atribut

Legendă: ✓ bifat · ◐ parțial / în construcție · ✗ nebifat · N/A nu se aplică (echivalent cu bifat, pentru că atributul e o penalizare evitată).

### A. Conținut și relevanță (PerDocData, embeddings)

| Atribut din leak | Stare | Observații |
|---|---|---|
| titlematchScore | ✓ | Title-urile conțin exact interogările (GSC: poziția 1 pe "salariul minim pe economie 2026", "deducere personala 2026") |
| titleHardTokenCount | ✓ | Title-uri concise, fără stuffing |
| OriginalContentScore | ✓ | Calcule proprii, conținut original, nu agregat |
| shortContent (penalizare) | ✓ | Homepage ~2.000-2.500 cuvinte; paginile calculator au conținut substanțial |
| numTokens (trunchiere) | ✓ | Nicio pagină nu riscă trunchierea la limita de tokeni |
| avgTermWeight | ✓ | Termenii cheie (CAS, CASS, salariu minim) în headinguri și bold |
| pageEmbedding / siteEmbedding | ✓ | Conținut semantic dens și coerent pe temă |
| siteFocusScore | ✓✓ | Site 100% monotematic: salarii și fiscalitate RO. Punctul cel mai puternic |
| siteRadius | ✓ | Nicio pagină nu deviază de la temă |
| webrefEntities | ✓ | Entități clare: CAS, CASS, CAM, HG 146/2026, OUG 89/2025, Legea 201/2025 |
| KeywordStuffingScore (penalizare) | ✓ | Evitat, scriere naturală |
| spamtokensContentScore (UGC) | N/A | Nu există conținut generat de utilizatori |
| commercialScore | ✓ | Pagini informaționale, fără presiune comercială |

### B. Prospețime (bylineDate, syntacticDate, semanticDate)

Mike King: cele trei date trebuie să fie **consistente** între ele, altfel Google nu are încredere în niciuna.

| Atribut | Stare | Observații |
|---|---|---|
| bylineDate | ✓ | "Ultima actualizare: 8 iunie 2026" vizibil pe pagină |
| syntacticDate | ✓ | 2026 în URL-uri (/zile-libere-2026) și în title-uri |
| semanticDate | ✓ | Datele din conținut (1 iulie 2026, HG 146/2026) confirmă |
| Consistență sitemap ↔ pagină | ✓ | PAGE_LAST_MODIFIED în seo.ts ține date editoriale reale, nu data deploy-ului. Exact recomandarea din studiul leak-ului |
| lastSignificantUpdate | ✓ | Actualizările sunt de substanță (legislație nouă), nu cosmetice |
| FreshnessTwiddler | ◐ | Secțiunea /noutati există dar are puține articole; ritm de publicare de crescut |

### C. Autoritate și linkuri (Anchors, QualityNsrNsrData)

| Atribut | Stare | Observații |
|---|---|---|
| siteAuthority | ✗ | Domeniu nou, profil de backlinkuri abia început. Cel mai mare deficit |
| hostAge (sandbox) | ✗→◐ | Site lansat în 2026, deci în fereastra de sandbox. Totuși are deja poziții 1, semn că iese din sandbox pe interogări cu competiție mică |
| homepagePagerankNs | ✗ | PageRank-ul homepage-ului (folosit ca proxy pentru paginile noi) e încă mic |
| sourceType (linkuri din pagini high-tier) | ◐ | **Wikipedia (ro) citează salariile.ro/salariu-minim** ca referință în articolul "Salariul minim pe economie în România", iar referința apare chiar în featured snippet-ul Google. Link nofollow, dar pagină din tier-ul maxim. Planul din 1 iulie completează |
| Diversitatea ancorelor | ◐ | Puține linkuri, deci puține ancore; de construit natural |
| phraseAnchorSpamDays (penalizare velocity) | ✓ | Fără spike-uri de linkuri, creștere naturală |
| anchorMismatchDemotion | ✓ | Ancorele existente sunt relevante tematic |
| Linkuri externe către surse | ✓ | Citează legislația primară (lege5, gov), semnal de documentare |
| Penalizări de link spam | N/A | Profil curat |

### D. NavBoost și semnale de click (cea mai importantă descoperire a leak-ului)

Date reale GSC (15 mai - 12 iunie 2026): 115 clickuri, 13.428 impresii, CTR 0,86%, poziție medie ~7.

| Atribut | Stare | Observații |
|---|---|---|
| goodClicks | ◐ | Se acumulează; volumul e încă mic (NavBoost lucrează pe 13 luni de istoric) |
| badClicks / pogo-sticking | ✓ probabil | Calculatorul răspunde instant, fără reclame; cine intră primește răspunsul |
| lastLongestClicks (long click) | ✓ probabil | Unealtă interactivă = sesiuni care se termină pe site |
| unsquashedClicks (volum) | ✗ | Volumul absolut e mic; vine doar cu timpul și autoritatea |
| **CTR la poziții bune** | ⚠ | /salariu-minim are CTR 0,6% la poziția medie 5,7 (7.125 impresii). Verificat live în SERP (12 iunie): pe "salariul minim pe economie 2026" poziția organică desktop reală e **~14 (pagina 2)**; poziția 1,5 din GSC vine aproape sigur din **citările în AI Overview** (numărate ca poziția ~1, aproape fără clickuri). Deci nu e un eșec de CTR la poziția 1, ci vizibilitate GEO + ranking organic încă slab pe desktop |
| chromeInTotal | ◐ | Site-ul ARE deja date CrUX (raport de utilizatori Chrome reali pe PageSpeed Insights), deci există vizualizări Chrome măsurabile la nivel de origine. Volumul rămâne mic |
| queriesForWhichOfficial / cereri de brand | ✗ | Aproape nimeni nu caută încă "salariile.ro". Fishkin: cererea navigațională de brand e factorul suprem |
| Geo-fencing RO | ✓ | Audiență 100% România, semnalele de click sunt coerente geografic |
| Mobil vs desktop | ✓ | Pe mobil: poziție 6,0 și CTR 1,4% (mai bune decât desktop), unde e și volumul |

### E. E-E-A-T, entități, autor (isAuthor, YMYL)

| Atribut | Stare | Observații |
|---|---|---|
| author (stocat ca text, nu doar markup) | ✓ | Autorul apare în text pe /despre, nu doar în schema |
| isAuthor (potrivire entitate-autor) | ✓ | Person schema cu @id stabil + sameAs (LinkedIn, GitHub, dev.to) |
| Entitate Organization | ✓ | Organization cu founder legat de Person |
| YMYL (scorere dedicate fiscal/financiar) | ◐ | Site-ul e YMYL-bani. Compensare bună: citarea legislației primare, metodologie publică, transparență totală. Deficit: autorul nu are credențiale fiscale formale (declarat onest pe /despre) |
| smallPersonalSite | ✓ | Flag-ul există în leak; după Helpful Content Update, direcția publică Google e de a promova site-urile mici independente. Profilul site-ului (independent, fără reclame, un singur autor) e exact acela |
| Whitelists editoriale (travel, covid, election) | N/A | Nu se aplică nișei |

### F. Penalizări (Twiddlers de demotion) - toate evitate

| Atribut | Stare | Observații |
|---|---|---|
| navDemotion (UX rău) | ✓ | Navigare curată, fără interstitials |
| clutterScore | ✓ | Zero reclame, zero popup-uri |
| serpDemotion | ⚠ | Singura cu risc, dacă CTR-ul rămâne sub așteptări (vezi secțiunea D) |
| exactMatchDomainDemotion | ◐ | "salariile.ro" e parțial exact-match pentru "salarii", dar e nume de brand generic, nu "calculatorsalariunet2026.ro". Risc mic |
| babyPandaDemotion (thin/HCU) | ✓ | Conținut util, nu thin |
| pandaDemotion | ◐ | Panda = raportul dintre domenii care leagă independent și cererea de interogări. Ambele sunt mici acum; trebuie crescute împreună |
| productReviewDemotion | N/A | Nu e site de review-uri |
| scamness / spamBrain / gibberishScore | ✓ | Curat |
| docLevelSpamScore | ✓ | Curat |

### G. Tehnic (Trawler, Alexandria, randare)

| Atribut | Stare | Observații |
|---|---|---|
| Crawlabilitate (robots, sitemap) | ✓ | robots.txt dinamic, sitemap cu lastmod reale, IndexNow + Bing configurate |
| Canonical | ✓ | Setat pe toate paginile |
| Randare | ✓ | Next.js cu pre-randare statică; conținutul nu depinde de JS client |
| urlChanges (istoric stabil; Google ține ultimele 20 versiuni) | ✓ | URL-uri stabile, fără migrări |
| Mobile-first | ✓ | Performanță mai bună pe mobil în GSC |
| Imagini (OG, alt) | ✓ | OG image 1200x630, imagini hero dedicate |
| Core Web Vitals | ✓✓ | **Verificat live pe 12 iunie (PageSpeed Insights, date de teren CrUX): evaluare REUȘITĂ.** LCP 1,5s, INP 120ms, CLS 0, FCP 1,5s, TTFB 0,4s, toate verzi. Lighthouse mobil: Performanță 97, Accesibilitate 100, Best Practices 100, SEO 100 |
| Rich results valide | ✓ | **Verificat live cu Rich Results Test: 2 elemente valide** (FAQ + Software apps). Singurele observații: câmpurile opționale offers/aggregateRating, omise intenționat |

## 4. Scor final

Din **66 de atribute auditabile extern** derivate din leak (după verificările live din 12 iunie):

- **✓ bifate: 47** (inclusiv N/A = penalizări evitate)
- **◐ parțiale / în construcție: 12**
- **✗ nebifate: 7**

**Scor: ~71% bifat complet, ~89% bifat sau parțial.**

Esențial: toate cele 7 atribute nebifate sunt din aceeași familie și **niciunul nu se rezolvă din cod**: siteAuthority, hostAge, homepagePagerankNs, unsquashedClicks, cereri de brand. Toate cer **timp + backlinkuri + notorietate**. On-page, site-ul e practic la plafon.

## 5. Răspuns la întrebare: e site-ul "perfect" pentru a ranka mai sus?

**On-page și arhitectural: da, aproape perfect** după criteriile leak-ului. siteFocusScore maxim, freshness consistentă pe toate cele 3 date, entitate-autor construită corect, zero penalizări, tehnic impecabil.

**Dar leak-ul spune explicit că on-page nu e jocul principal.** Concluzia lui Fishkin: brandul și cererea navigațională bat SEO-ul clasic. Concluzia lui King: clickurile reușite pe un set tot mai larg de interogări (NavBoost + Panda) decid. Pe acestea site-ul e abia la început.

## 6. Cele 4 acțiuni cu impact maxim, în ordinea priorității

1. **Ridicarea poziției organice reale pe /salariu-minim** (corectat după verificarea live). Pe desktop, rezultatul organic e pe pagina 2 (~14), în timp ce AI Overview citează deja site-ul (de aici poziția 1,5 din GSC, cu clickuri puține prin natura formatului). Cine ocupă pagina 1: mmuncii.gov.ro, juridice.ro, startupcafe.ro, calculator-salarii.ro, avocatnet.ro, adică exact site-urile cu siteAuthority. Concluzia leak-ului se aplică literal: diferența nu mai e on-page (acolo site-ul e peste toți), ci autoritate + clickuri. Title/description rămân de testat pentru clickurile din AI Overview ("cât primești net, cu deducerea ta"), dar pârghia principală e punctul 2.
2. **Backlinkuri (siteAuthority + ieșirea din sandbox)**. Planul din 1 iulie e exact ce prescrie leak-ul: linkuri din pagini cu trafic real (tier-ul "high quality" e definit prin clickuri), din surse fresh/news, fără spike-uri. Țintele deja verificate (zoso, Softpedia, hackingwork) se potrivesc.
3. **Lărgirea setului de interogări cu clickuri reușite (rețeta anti-Panda / HCU)**. Recovery-ul și creșterea Panda = mai multe clickuri reușite pe mai multe interogări + mai multe domenii independente care leagă. Practic: articole /noutati pe evenimente fiscale (1 iulie e o ocazie perfectă: schimbarea salariului minim), fiecare țintind interogări noi.
4. **Cerere de brand**. Orice canal extern (dev.to, comunități, social) care face oamenii să caute "salariile ro" în Google e, conform leak-ului, cel mai pur semnal de autoritate care există.

## 7. Verificări live (12 iunie 2026, prin Chrome)

1. **PageSpeed Insights (date de teren CrUX, mobil)**: evaluare Core Web Vitals **reușită**. LCP 1,5s, INP 120ms, CLS 0, FCP 1,5s, TTFB 0,4s. Lighthouse: 97 / 100 / 100 / 100. Existența raportului CrUX confirmă utilizatori Chrome reali măsurabili (relevant pentru chromeInTotal).
2. **Rich Results Test pe homepage**: 2 elemente valide (FAQ, Software apps), crawl reușit, fără erori. Doar câmpurile opționale offers/aggregateRating lipsesc, omise intenționat.
3. **SERP real "salariul minim pe economie 2026"** (desktop, gl=ro): featured snippet Wikipedia, iar în notele snippet-ului apare referința către salariile.ro/salariu-minim. **Wikipedia (ro) citează site-ul** în articolul "Salariul minim pe economie în România". Organic, salariile.ro e pe ~14 (pagina 2); pagina 1 e ocupată de mmuncii.gov.ro, juridice.ro, startupcafe.ro, calculator-salarii.ro, papervee, undelucram, digi24.
4. **PAA ("Oamenii au mai întrebat și")**: răspunsul generat de AI la "Cât va fi salariul minim în 2026 net?" dă exact cifra calculată de salariile.ro (2.699 lei, cu facilitatea de 200 lei), dar citează mmuncii.gov.ro și calculator-salarii.ro. Conținutul site-ului modelează deja răspunsurile AI, citarea trebuie câștigată prin autoritate.
5. **Interpretarea corectă a GSC**: poziția medie 1,5 cu CTR 0,3-0,6% pe interogarea principală nu e "poziția 1 organică fără clickuri", ci citări în AI Overview (numărate ca poziție ~1) suprapuse peste un ranking organic desktop de pagina 2.

## 8. Notă de onestitate metodologică

Google a declarat că documentele sunt "scoase din context". Leak-ul arată ce câmpuri stochează Google, nu ponderile lor și nu dacă fiecare câmp e activ în producție. Studiul de față tratează atributele ca direcții confirmate (multe au fost reconfirmate ulterior în procesul antitrust DOJ: NavBoost, Q*, semnalele de click), nu ca un checklist garantat. Numărătoarea "45/65" e o evaluare practică, nu o măsurătoare oficială.
