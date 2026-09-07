# Colectarea și verificarea ofertelor salariale

Comanda principală este `npm run crawl:census -- --run=<id>`.
Inventarul pornește din sitemap-uri publice și, pentru OLX, din categoriile
și paginile listă. Parametrul `--sources=olx,ejobs,bestjobs,publi24,anuntul`
restrânge o reluare; nu șterge sursele deja salvate. `--include-unknown`
extinde lectura și la titlurile URL care nu sunt încă asociate catalogului.

Rezultatele și paginile sursă rămân în `.cercetare-privata/crawl-runs/`.
Nu publica HTML-ul anunțurilor, descrieri integrale, nume de persoane sau
date de contact. Registrul public expune doar fapte salariale, linkuri,
date, transformări și amprentele dovezilor.

## Flux reproductibil

1. `crawl:census` descoperă URL-uri și salvează progresul în `state.json`.
   Reluarea aceleiași rulări folosește cache-ul și continuă URL-urile neprocesate.
2. După terminare, `npm run crawl:reprocess -- --run=<id> --complete-details`
   recitește dovezile cu parserul final și poate completa detaliile OLX.
   Nu rulează simultan cu un colector care scrie același state.
   `--preview` scrie un raport separat și nu modifică starea colectorului.
3. `npm run crawl:report -- --run=<id>` verifică hash-urile, reextrage fiecare
   observație acceptată din pagina sursă și generează acoperirea.
4. Numai după audit, `crawl:report -- --run=<id> --publish` actualizează
   `src/data/acoperire-anunturi.json` și registrul din `public/date/`.
   Se rulează apoi testele, build-ul și verificările paginilor randate.

La oprire manuală, procesul se închide întâi, apoi se înregistrează
`collectionStoppedAt` în state. Oprirea la cererea utilizatorului nu justifică
etichetarea unei colectări incomplete drept completă.

## Reguli de interpretare

`policy.mjs` deține pragurile. `extract.mjs` identifică unitățile, activitatea,
contractul și suma de bază. Nu folosește meseria din interogare drept rezultat,
nu ghicește moneda din mărimea numărului și nu presupune că toate sumele sunt nete.
Data unui sitemap este dovadă de listare, nu data inventată a publicării.

Sumele brute sunt convertite prin `calculStandard` din motorul fiscal.
Euro se transformă folosind cursul BCE datat și salvat cu dovada sursei.
Ipoteza lunară în anunțurile cu normă întreagă care omit perioada este marcată
distinct de perioada lunară explicită. Sensibilitatea la această ipoteză este
verificată înainte de publicarea unui reper central.

Un anunț, indiferent de numărul declarat de posturi, este cel mult o observație.
Republicările identice ale aceluiași angajator nu sunt voturi suplimentare.
Platformele copiate rămân în proveniență, fără a mări artificial diversitatea.
Angajatorii necunoscuți nu devin companii inventate pentru a atinge pragul.

Mediana mijloacelor intervalelor este o estimare a ofertelor. Limitele medianei
se calculează separat din capetele intervalelor. Niciuna nu descrie automat
salariile efectiv încasate sau salariul cel mai frecvent în populație.
Un număr suficient de rânduri nu dovedește reprezentativitatea națională.

## Acces și limitări

Cereri seriale pe gazdă, identificare proprie, pauză și respectarea robots.txt.
Răspunsurile de limitare sau autentificare opresc gazda; `Retry-After` este
respectat. O provocare de acces nu se ocolește. Cache-ul poate fi auditat offline.

Raportul distinge inventarul descoperit, candidații pentru catalog și stadiul
parcurgerii. „Inventar parcurs” nu înseamnă întreaga bază internă a platformei.
Erorile și lipsurile rămân explicite chiar dacă alte surse au funcționat.

Vechile entrypoint-uri și conectori sunt retrași. Codul istoric se găsește în
Git; snapshot-urile originale rămân arhivă. Nu le folosi drept observații noi,
etaloane de calibrare sau dovezi că o meserie are deja eșantion suficient.
