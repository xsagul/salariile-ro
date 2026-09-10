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

- Catalogul are 142 de meserii (`MESERII.length` din `src/lib/meserii.ts` deține numărul). Plafonul cu cifră proprie **nu mai e 95–100** — cifra aia, scrisă pe 24 august, presupunea că INS publică doar media pe activitate CAEN. Verificat pe 31 august 2026, pe tot catalogul TEMPO (1.916 matrice): matricea **FOM121A** încrucișează activitatea cu grupa de ocupații, pe forme de proprietate, sexe și 11 ani. Sunt **544 de celule cu date, 527 de valori distincte** — deci plafonul real e de ordinul a 500, nu 100. Ce nu există nicăieri în TEMPO e COR: fiecare matrice de salarii cu dimensiune ocupațională are exact 10 opțiuni, Total plus cele 9 grupe majore ISCO. Deci „specialiști în servicii IT” rămâne o grupă, nu „programator”.
- paylab are **767 de poziții** pentru că are 14.383 de respondenți la sondaj. undelucram are **400.000 de salarii declarate** și 850.000 de utilizatori.
- Diferența față de ei nu e volumul de conținut, e că **ei colectează date de la utilizatori și noi nu colectăm nimic.** Site-ul nu are, la data asta, niciun mecanism de colectare.

Aproximativ **3.400 de sesiuni pe lună includ cel puțin un calcul salarial**, măsurat în Umami în august 2026. Cifra nu se mai poate reface: instanța Umami a fost dezafectată pe 28 august 2026, iar Vercel Analytics nu are evenimente proprii. Acesta este semnal de interes, nu echivalentul a 3.400 de persoane unice și nici un set de salarii declarat prin sondaj.

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

<!-- fiscal:start — bloc verificat automat de `scripts/test-context-drift.mts`
     contra `src/lib/fiscal.ts` și `src/lib/date-salarii.ts`, care dețin valorile.
     Nu edita cifrele aici: schimbă-le în cod, apoi adu blocul la zi. Orice sumă
     în lei sau cotă procentuală de mai jos care nu există în cod pică `npm run test`. -->

- Salariu minim brut: **4.325 lei din 1 iulie 2026** (HG 146/2026); 4.050 lei în prima jumătate a anului
- Salariu minim net: 2.699 lei (facilitate fiscală 200 lei, OUG 89/2025)
- Indicatorul BASS 2026: 9.192 lei brut; net standard estimat: 5.377 lei. Nu se etichetează drept ultimul salariu mediu INS.
- Ultimul câștig salarial mediu publicat de INS (iunie 2026): 9.564 lei brut; 5.734 lei net. Se actualizează lunar.
- CAS (pensie) 25%, CASS (sănătate) 10%, impozit venit 10%, CAM (angajator) 2,25%
- Plafon deducere personală: 6.325 lei
- Facilitățile IT/construcții ELIMINATE din 1 ian 2025 (OUG 156/2024)
- Surse oficiale: legislatie.just.ro (HG 146/2026, OUG 89/2025, OUG 156/2024, Codul Fiscal, Codul Muncii)

<!-- fiscal:end -->

## Starea SEO (referință verificată la 26 iulie 2026)

- GSC, ultimele 28 zile complete disponibile (27 iunie–24 iulie): 181.049 impresii, 2.204 clickuri, CTR 1,22%
- Query-urile generice cu volum mare sunt în principal pe pozițiile 6–10, nu 1.0–1.1; plafonul actual este CTR-ul și autoritatea
- P0 a fost publicat după ultima zi GSC disponibilă, deci efectul lui nu este încă măsurabil
- Paginile de calculator tranzacționale tind să aibă CTR mai sănătos decât paginile pur informative
- Tehnic & on-page: nivel A/A+ conform tool-urilor de audit
- Off-site (backlinkuri, autoritate de domeniu/DR): nivel F — zona cu cel mai mare potențial de creștere
- GSC este conectat. Măsurătoarea de trafic e Vercel Analytics — nu Google Analytics, și nici Umami, dezafectat pe 28 august 2026. Vercel Speed Insights e activ din 1 septembrie 2026, dar **la rată plină a epuizat cota Hobby de 10.000 de evenimente în 9 zile** (10K/10K, măsurat pe 10 septembrie), deci Core Web Vitals din teren nu erau disponibile „din nou", ci doar până se umplea cota. Din 10 septembrie rulează cu `sampleRate={0.2}` în `src/app/(site)/layout.tsx`, ca datele să acopere toată luna. Rămân pierdute: evenimentele proprii și timpul pe pagină. Evenimentele proprii nu se pot recâștiga pe planul Hobby, care nu permite custom events — deci „câte sesiuni includ un calcul salarial” rămâne nemăsurabil fără Pro.
- **Cotele Vercel se citesc doar din dashboard.** `vercel usage` dă 404 pe Hobby, `/v1/usage` din API e Pro/Enterprise, iar `vercel metrics` cere Observability Plus. Singura cale e https://vercel.com/salariile-ro/~/usage în browser. Măsurat acolo pe 10 septembrie (30 de zile): Speed Insights 10K/10K (plin), Edge Requests 467K/1M, Function Invocations 311K/1M, ISR Reads 333K/1M, Fast Origin Transfer 2,69/10 GB, Fast Data Transfer 3,67/100 GB, Image Transformations 296/5K. Nu presupune că o cotă e în regulă fiindcă traficul pare mic — Speed Insights s-a umplut la ~830 de afișări pe zi.
- **Middleware-ul se facturează ca invocare, la fiecare cerere care îi atinge matcher-ul.** În Next 16 `src/proxy.ts` rulează pe runtime Node, deci intră la Function Invocations, nu la Edge Middleware Invocations (care arată 0). Până pe 10 septembrie 2026 rula pe fiecare cerere HTML, boți incluși, pe un site unde 331 de rute sunt prerandate și s-ar fi servit gratuit din CDN. Headerele constante (CSP, `Link`, `X-Robots-Tag`) stau acum în `next.config.ts`, iar matcher-ul are condiție `has` pe Accept. Înainte de a pune ceva în proxy, întreabă dacă depinde efectiv de cerere; dacă nu, locul lui e în config.
- **Link-urile nu se pre-încarcă.** `next/link` pre-încarcă în producție fiecare rută statică al cărei link intră în ecran, segment cu segment, și fiecare cerere e o Edge Request. Măsurat pe 11 septembrie 2026, vizitator nou pe mobil, cu scroll complet: homepage 143 de cereri pe vizită, din care 113 pre-încărcări; după oprire, 17 pe producție, indiferent de scroll, cu navigarea prin click tot client-side. Toate link-urile trec prin `src/app/components/Link.tsx` (`prefetch = false`), iar `scripts/test-ui-contracts.mts` pică la orice import direct din `next/link`. La 17 cereri pe vizită, plafonul de 1M Edge Requests se atinge pe la ~1.800 de afișări/zi; la 851/zi (media 2–10 septembrie) rezerva e ~2×. La depășire susținută Vercel pune deploy-ul pe pauză (503 DEPLOYMENT_PAUSED) și nu îl reia automat. Nicio optimizare nu face cererile zero: asigurarea împotriva unei creșteri peste rezervă e planul Pro, iar asta e decizia financiară a proprietarului, nu a agentului.

## Roadmap activ

### Prioritizarea SEO — precizare a proprietarului, 9 septembrie 2026

Folosește SE Ranking pentru descoperirea familiilor mari de căutări conectate cu
paginile existente și pentru extinderea utilității lor. Un cuvânt izolat cu volum
mic și dificultate mică nu justifică o pagină nouă. Compară intenția întregului
subiect, paginile care atrag trafic la concurenți, datele GSC și capacitatea
noastră de a oferi un răspuns verificabil. Nu limita cercetarea la cuvinte ușoare
și nu relua auditul tehnic general. Volumele SE Ranking sunt estimări de căutări,
nu impresii sau clicuri garantate; variantele aceleiași intenții se pot suprapune.

### Salarii pe meserii — colectarea decisă pe 7 septembrie 2026

Proprietarul cere o colectare amplă a anunțurilor active la momentul verificării,
cât mai completă pe fiecare sursă, pentru toate meseriile din catalog. După această
perioadă de colectare intenționează o pauză de aproximativ șase luni. Nu programa
recrawl automat; data fotografiei pieței rămâne vizibilă și nu devine o promisiune
că ofertele vor fi actuale pe toată durata pauzei.

Scopul cifrei orientative este compararea remunerației și alegerea carierei.
Preferința este pentru un indicator central, rezistent la extreme. Ofertele,
salariile declarate de angajați și grilele legale rămân concepte distincte.
O medie publicată nu se redenumește mediană. Mijlocul unui interval oferit este
o ipoteză de estimare, nu salariul observat al unui angajat.

Auditul codului a identificat observații generate artificial în vechiul
„Cenzus Curat”. Generatorul este retras; istoricul rămâne pentru audit.
Nu reintroduce observații pornind de la salarii-țintă, nume de angajatori,
scoruri de încredere inventate sau cote minime pe meserie. Verificarea cere
pagina sursă, suma originală, interpretarea unității și data colectării.
Pragurile de publicare sunt deținute de `scripts/crawler/policy.mjs`,
acoperirea produsului de `src/data/acoperire-anunturi.json`.
„Undă verde” se acordă pe dovezi; lipsa datelor nu se rezolvă prin valori fabricate.

**Nu confunda un plafon de cod cu un plafon al pieței.** Pe 8 septembrie 2026,
concluzia „în România există doar ~12 anunțuri cu sumă pe meserie” s-a dovedit
falsă: erau trei bug-uri. OLX nu fusese niciodată deschis (se judeca din cardul de
listare, care nu conține salariul), câmpul structurat de salariu era ignorat ca
dovadă, iar parserul cerea cuvântul „net” sau „brut”. Măsurat pe eșantion aleator,
47% dintre anunțurile OLX declarau un salariu, în timp ce parserul accepta 0,7%.
Înainte de a raporta o limită a datelor, măsoară un eșantion din ce ai respins:
`scripts/crawler/masoara-olx.mjs` și `scripts/crawler/masoara-pierderi.mjs` există
exact pentru asta și nu ating rețeaua decât pe eșantion.

**Sumele fără net/brut sunt cohortă separată, decis de proprietar pe 8 septembrie
2026.** Aproape jumătate din anunțurile cu sumă nu spun baza. Nu se presupune netul:
3.600 lei brut înseamnă circa 2.100 lei net. Cohorta `undeclaredBasis` se numără și
se publică alături, niciodată în mediană, în praguri sau în intervalul principal.

**Cei trei piloni nu se topesc într-o cifră.** `piloniMeserie` din
`src/lib/repere-meserii.ts` calculează independent anunțurile (colectare proprie),
salariile declarate (Salario) și datele oficiale (INS, grilele 153/2017). Sunt
populații și concepte diferite; o medie ponderată a lor n-ar avea nicio sursă care
s-o susțină și ar repeta eroarea cenzusului sintetic. Divergența dintre piloni se
afișează ca informație, nu se netezește.

**Cererea de căutare e la bugetari, nu unde e ușor de colectat.** Măsurat pe 8
septembrie 2026, din date SE Ranking: 15 din primele 25 de clustere de căutare
pentru salarii sunt sector public — asistent medical 1.890/lună, profesor 1.690,
polițist 1.310 — adică ~69% din volum. Acolo cifra vine din Legea 153/2017, nu
din anunțuri, iar datele sunt deja complete. Meseriile publicate din anunțuri —
electrician, vânzător, casier — nu apar în primele 25. `programator` are ~120 de
căutări lunare pe toate variantele; „salariu profesor debutant" singur are 590.
Nu prioritiza după ce e ușor de colectat.

**Catalogul de meserii are o singură sursă de adevăr: `src/lib/meserii.ts`.**
Crawlerul citește `src/data/meserii-catalog.json`, generat din ea de
`scripts/genereaza-catalog-meserii.mts` și verificat la fiecare `npm test`. Până
pe 9 septembrie 2026 citea dintr-un backup înghețat cu 132 de meserii, deci
meseriile adăugate nu se recunoșteau niciodată în anunțuri.

**O grilă legală descrie un fel de angajator, nu o meserie.** Anexa III
salarizează filarmonicile și teatrele de stat; cine caută „salariu muzician" e
freelancerul. Steagul `doarSectiune` din `src/lib/grile-publice.ts` arată grila ca
secțiune, cu domeniul ei, fără s-o lase să devină cifra paginii. Verifică
întotdeauna dacă meseria e practicată majoritar la stat înainte de a lega o grilă
ca reper principal.

**Grefier: rândurile există în lege, extragerea nu le prinde.** Tabelul din Anexa V
are și coloană de lei, și una de coeficienți, iar `grila()` din
`scripts/lege153-grile.mjs` îl respinge. Re-extragerea pe text proaspăt dă exact
aceleași 2.100 de rânduri — nu e cache vechi. Nereparat: modificarea atinge toate
anexele și cere diff complet înainte de acceptare. Textul legii e în
`research/lege153-consolidat.html`.

**Colectarea e publicată, iar constrângerea s-a mutat pe catalog.** Pe 9
septembrie 2026: 1.523 de anunțuri cu bază declarată, 2.264 în cohorta separată,
14 meserii cu cifră proprie din 142. Ce blochează restul nu mai e colectarea, ci
catalogul: 11.033 de anunțuri citite cad fiindcă titlul nu se potrivește nici unei
meserii, iar în 4.265 dintre ele parserul citise deja corect suma.

O meserie se adaugă numai pe dovezi, iar două precedente țin regula:
„montator" a fost respins cu 32 de anunțuri fiindcă în COR nu există ca ocupație,
ci ca cincisprezece meserii distincte; „ambalator" nu a intrat ca sinonim la
manipulant, deși ar fi urcat cifra peste prag, fiindcă ambalarea și manipularea
sunt grupe ISCO diferite. **O meserie nu se lărgește ca să atingă un prag.**

**Nu extinde catalogul dincolo de ce susțin dovezile.** Măsurat în Search Console
pe 9 septembrie: `/salarii/judecator`, `/salarii/preot` și `/salarii/procuror` sunt
descoperite din sitemap și **niciodată crawl-ate**. Google refuză deja să deschidă
pagini dintr-un set de peste o sută aproape identice. Paginile de meserie adună
împreună ~21 de clickuri la 28 de zile; calculatoarele pe clustere de bugetari
aduc de zeci de ori mai mult — învățământul a făcut 0 → 381 de clickuri pe
săptămână în două săptămâni.

**Sub praguri nu se arată nimic: nici cifră centrală, nici interval.** Capetele
unui eșantion mic nu sunt o statistică — un singur anunț a făcut cândva pagina de
medic să afișeze „20.000–20.000 lei". Ambele reguli au test propriu în
`test-observatii.mts`. Meseriile plătite după grila legală nu spun „nu avem", ci
că nu se măsoară prin anunț; nicăieri pe site nu apare „0 anunțuri".

**Surse de anunțuri.** Active: OLX, eJobs, BestJobs, Publi24, Anuntul.ro, hipo.ro,
undelucram.ro (ultima permisă explicit de proprietar pe 8 septembrie 2026).
Verificate și respinse cu motiv, nu din lipsă de timp: `posturi.gov.ro` — paginile
de concurs nu conțin sume, un conector acolo ar returna zero; `ro.indeed.com` —
robots.txt interzice `/viewjob`. Nu le repropune fără o verificare nouă.

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
- **Numai legislație în vigoare. Niciodată proiecte.** Decis de proprietar pe 28 august 2026, în contextul noii legi a salarizării bugetarilor. Motivul: un proiect se schimbă până la adoptare — grilele de învățământ s-au schimbat deja între versiunea din 25 mai și cea din 20 august — iar dacă legea trece abia anul viitor, publicarea lui acum înseamnă un an de cifre false. Nu propune coloane „după noua lege", simulări sindicale sau cifre din presă despre acte neadoptate, oricât de bine ar prinde intenția de căutare. Se construiește pe ele **abia după publicarea în Monitorul Oficial**. Ăsta e declanșatorul, nu adoptarea în Parlament și nu anunțurile de presă.
- **Un fapt viu are exact un proprietar.** Constantele fiscale sunt deținute de `src/lib/fiscal.ts`, cifrele INS de `src/lib/date-salarii.ts` și `src/lib/ins-date.ts`, strategia de acest fișier, identitatea de `BRAND.md`. Nu rescrie o valoare în proză ca s-o ai la îndemână — ai creat o a doua sursă care va rămâne în urmă. Blocurile marcate `<!-- fiscal:start ... fiscal:end -->` sunt verificate contra codului de `scripts/test-context-drift.mts`, în `npm run test`. `PROGRES.md` e exceptat: e jurnal, iar o cifră veche acolo e o înregistrare corectă a ce era adevărat atunci. La fel fișierele cu dată în nume — arhivă, nu se editează.

## Direcție de arhitectură în plan (după stabilizarea valului din iulie)

Există un plan de mutare a calculatorului de pe homepage într-o structură de hub cu pagini dedicate, homepage-ul devenind pagină editorială / vizualizare de date.

**IMPORTANT — timing:** calculatorul rămâne pe homepage până când există minimum două ferestre post-P0 comparabile de câte 28 zile. Migrarea cere hartă query → URL, redirecturi/canonice, măsurare separată și criterii de rollback; până atunci facem doar adăugări și optimizări non-distructive.

## Verificare

Arată dovezi, nu doar afirmații: la fiecare schimbare importantă, arată ce comandă ai rulat și ce a returnat, build-ul, sau rezultatul concret — nu doar „am rezolvat".
