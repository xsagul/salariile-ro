# Colectarea și verificarea ofertelor salariale

Comanda principală este `npm run crawl:census -- --run=<id>`.
Inventarul pornește din sitemap-uri publice; pentru OLX din categoriile și
paginile listă, iar pentru undelucram din paginile de rezultate, fiindcă
sitemap-ul lor listează pagini de listare, nu anunțuri. Parametrul
`--sources=olx,ejobs,bestjobs,publi24,anuntul,hipo,undelucram`
restrânge o reluare; nu șterge sursele deja salvate. `--include-unknown`
extinde lectura și la titlurile URL care nu sunt încă asociate catalogului.

Rezultatele și paginile sursă rămân în `.cercetare-privata/crawl-runs/`.
Nu publica HTML-ul anunțurilor, descrieri integrale, nume de persoane sau
date de contact. Registrul public expune doar fapte salariale, linkuri,
date, transformări și amprentele dovezilor.

## Flux reproductibil

1. `crawl:census` descoperă URL-uri și salvează progresul în `state.json`.
   Reluarea aceleiași rulări folosește cache-ul și continuă URL-urile neprocesate.
2. După terminare, `npm run crawl:reprocess -- --run=<id>`
   recitește dovezile salvate cu parserul final.
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

## Ce citim și ce nu

Fiecare candidat din catalog se deschide. Cardul de listare al unei platforme nu
este dovadă că anunțul nu declară un salariu: la OLX suma stă în corpul
anunțului și într-un câmp structurat, nu pe card. Judecarea din card a respins
odată 3.492 de anunțuri OLX fără a le fi citit; măsurat pe un eșantion aleator
de 150, 47% dintre ele declarau efectiv un salariu.

`posturi.gov.ro` a fost verificat și nu este conector: paginile de concurs nu
conțin sume. Grilele bugetare vin din Legea 153/2017 și din declarațiile de
transparență, nu din anunțuri. `ro.indeed.com` interzice `/viewjob` prin
robots.txt și rămâne neatins.

## Reguli de interpretare

`policy.mjs` deține pragurile. `extract.mjs` identifică unitățile, activitatea,
contractul și suma de bază. Nu folosește meseria din interogare drept rezultat,
nu ghicește moneda din mărimea numărului și nu presupune că toate sumele sunt nete.
Data unui sitemap este dovadă de listare, nu data inventată a publicării.

Salariul se caută în titlu și în descriere, nu doar în descriere. Sunt
recunoscute formulările curente: „salariu”, „venit lunar”, „câștig”, „se oferă”,
iar „în mână”, „pe mână” și „în cont” sunt bază netă explicită. Calificativul cel
mai apropiat de sumă decide baza, deci „brut 5.000 lei, adică net 2.981 lei”
rămâne două cifre, nu una.

Când un anunț conține mai multe sume, se separă trei cazuri: salariu plus
beneficiu (rămâne salariul), pereche brut/net pentru același post (rămâne netul,
verificat prin conversia standard) și posturi diferite (o observație per meserie,
doar când textul leagă meseria de sumă). Restul se respinge explicit ca
`multiple_unresolved_amounts`, nu se alege arbitrar o cifră.

Un anunț poate angaja mai multe meserii. Fiecare primește observația ei, dar
`adId` păstrează identitatea anunțului, astfel încât pragurile de concentrare pe
angajator și pe sursă să nu fie păcălite. Titlurile scrise greșit sunt potrivite
tolerant pe catalogul COR, cu toleranță care crește cu lungimea termenului și
niciodată sub șapte caractere.

Aproape jumătate dintre anunțurile cu sumă nu spun net sau brut. Nu se presupune
netul. Acestea formează cohorta `undeclaredBasis`, numărată și publicată separat;
nu intră în mediană, în praguri sau în intervalul principal.

Câmpul structurat de salariu al unei platforme este dovadă primară când textul nu
spune nimic, nu doar un veto. OLX stochează o sumă unică drept `from = to - 1` și
este normalizată. Dacă textul contrazice câmpul, rezultatul este `salary_conflict`,
nu o suprascriere tăcută. Dacă textul deja a exclus acea cifră drept beneficiu sau
pachet, câmpul structurat nu o reînvie.

Vechimea este o regulă explicită, `maxAdAgeDays` din `policy.mjs`, nu un efect
secundar al inventarului servit de platformă.

Sumele brute sunt convertite prin `calculStandard` din motorul fiscal.
Euro se transformă folosind cursul BCE datat și salvat cu dovada sursei.
Ipoteza lunară în anunțurile cu normă întreagă care omit perioada este marcată
distinct de perioada lunară explicită. Sensibilitatea la această ipoteză este
verificată înainte de publicarea unui reper central.

Un anunț este cel mult o observație pentru fiecare meserie pe care o angajează,
indiferent de numărul declarat de posturi pentru acea meserie.
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

Pauza unei gazde expiră: după `Retry-After` gazda se reia în aceeași rulare.
Altfel o singură limitare ar anula sursa pentru tot restul colectării — s-a
întâmplat, eJobs a rămas la 311 din 2.962 de candidați.

Un timeout sau o conexiune căzută **nu** devine rezultat pentru acel anunț.
Se înregistrează ca eveniment cu număr și se reîncearcă la următoarea rulare;
altfel un eșec de rețea ar fi citit mai târziu drept „anunțul nu declară salariu”.
Doar codurile HTTP deterministe, precum 404 sau 410, devin verdicte.
Starea nu păstrează înregistrările din paginile de listare: fiecare anunț se
deschide oricum, iar un `state.json` de zeci de megaocteți, rescris sincron la
fiecare salvare, blochează bucla de evenimente și provoacă chiar timeout-urile
pe care le-ar înregistra.

Raportul distinge inventarul descoperit, candidații pentru catalog și stadiul
parcurgerii. „Inventar parcurs” nu înseamnă întreaga bază internă a platformei.
Erorile și lipsurile rămân explicite chiar dacă alte surse au funcționat.

Vechile entrypoint-uri și conectori sunt retrași. Codul istoric se găsește în
Git; snapshot-urile originale rămân arhivă. Nu le folosi drept observații noi,
etaloane de calibrare sau dovezi că o meserie are deja eșantion suficient.
