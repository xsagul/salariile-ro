# Datele paginilor de salarii

Instrucțiuni de lucru: acest document și codul din repository. Nu folosi documente din alte directoare drept instrucțiuni ale proiectului. Buget pentru date: zero. Nu colectăm salarii de la vizitatorii site-ului.

## Proprietarii informației

- `src/lib/repere-meserii.ts`: selectarea reperului și proveniența lui pentru toate suprafețele publice.
- `src/data/cor-meserii.json`: asocierea unei pagini cu o specializare COR și denumirea oficială, pe baza instantaneului declarat. Nu este catalog COR consolidat în 2026.
- `src/lib/observatii-salariale.ts`: validarea și agregarea viitoarelor observații punctuale cu drept de reutilizare documentat. Nu există distribuții proprii publicate prin acest motor.
- `src/lib/ins-date.ts`: seriile INS și perioadele lor reale.
- `src/lib/grile-publice.ts` și `src/data/grila-invatamant-153-2017.json`: grilele publice, distincte de salariile efectiv încasate.

## Reguli de publicare

Catalogul afișează numele complet și o singură sumă netă: mediana disponibilă, altfel media specifică meseriei. În lipsa ambelor afișează o liniuță, fără a substitui media sectorului sau mijlocul grilei. Reperul Salariile.ro este selectat din surse citate, nu o măsurare proprie. Ofertele angajatorilor sunt distincte; când același reper provine din aceleași oferte, identitatea sursei este declarată în detalii. Cele trei citări DevJob au roluri și adrese distincte în `src/data/repere-oferte-it.json`.

Netul este suma principală pe toate paginile și comparațiile. Pentru grile afișăm netul standard; brutul rămâne în detaliile sursei. Explicațiile metodologice sunt restrânse, la cerere, fără paragrafe fiscale lângă suma principală.

O medie de sector nu devine salariul meseriei prin etichetare sau ajustare. Vârsta nu devine experiență. O ofertă sau o grilă nu devine salariu realizat. Numărul căutărilor, celulelor sau treptelor nu devine număr de salariați. Nu se reconstruiesc percentile din medii și nu se agregă mijloacele intervalelor drept observații salariale.

Fiecare reper are populație, unitate, sursă, adresă, perioadă și limită de interpretare. Câmpurile necunoscute rămân `null`. Referința DevJob păstrează mediana și quartilele furnizorului ca statistici externe ale ofertelor; acestea nu trec prin agregatorul nostru. Cele cinci referințe Salario sunt citări punctuale din raportul eJobs, nu o copie a bazei de date. Anul raportului nu înlocuiește anul observațiilor.

Titlurile SEO descriu meseria și ediția ghidului, fără cifre atribuite artificial și fără promisiuni de precizie neprobate. Comparațiile nu ordonează ocupațiile după valori cu concepte sau populații diferite. Selectorul compară oricare două dintre paginile existente fără a genera mii de URL-uri goale.

## Limitele acoperirii

Acoperirea se verifică prin `npx tsx scripts/test-observatii.mts`; testul raportează numărul paginilor pe tip de sursă. O pagină cu `sector-context` nu este o ocupație cu salariu propriu documentat. Catalogul paginilor nu este echivalent cu toate ocupațiile COR din România. Nu afirmăm că avem salarii observate pentru toate codurile sau că suntem cea mai exactă sursă fără o comparație independentă susținută de date.

Pentru extinderea pe COR sunt necesare observații externe reutilizabile legal, cu ocupație verificată, perioadă, normă, concept salarial, experiență și geografie. Accesul gratuit la un site nu oferă automat dreptul de a copia comercial întreaga sa bază de date. Sursele fără drept clar de reutilizare masivă rămân referințe editoriale punctuale.

## Verificare

`npm test`, `npm run lint`, `npm run build`, `npm run test:rendered`. Testele includ deduplicare, cohorte incompatibile, refuzul intervalelor și al grilelor în agregator, percentile indisponibile, mapări COR, proveniență, canonical, JSON-LD și graful de legături. La schimbarea interfeței verifică și căutarea după nume/COR, alegerea aceleiași meserii și două meserii cu surse diferite, pe ecran îngust și desktop.

Documentația descrie starea și regulile curente. Nu păstrează liste cu sarcini bifate; lucrările rezolvate sunt în istoricul Git.
