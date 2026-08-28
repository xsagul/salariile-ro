# Audit competitiv: impozitsalariu.ro — 28 august 2026

Document datat, de arhivă. Pozițiile și volumele de mai jos descriu momentul
auditului; nu sunt constante vii ale produsului.

## Verdict executiv

Scăderea relativă pe interogarea `calculator salariu` nu este explicată de o
problemă evidentă de logo, titlu sau descriere. Într-o căutare Google
nepersonalizată, salariile.ro era pe locul 4, iar impozitsalariu.ro pe locul 2.
Totuși, panoul Search Console afișat de Google pentru aceeași interogare arăta,
în ultimele 7 zile, 121 de clicuri (+404%), 8.240 de afișări (+59%) și poziția
medie 4,7, îmbunătățită cu 2 poziții. Nu există dovadă de prăbușire a CTR-ului
sau a site-ului; concurentul a crescut mai repede pe un grup restrâns de
interogări.

Avantajul cel mai clar al concurentului este un cluster coerent despre munca
part-time: calculator dedicat, articol explicativ, material D112 și pagină
despre posibila schimbare legislativă. Acest cluster ocupă locul 2 pe căutări ca
`calculator salariu 4 ore`, `calculator salariu part time` și `calculator
salariu 2 ore`. A doua diferență este distribuția: advertoriale, citări în
presă și o postare Reddit care a primit vizibilitate.

## Ce se vede în SERP

Ordinea nepersonalizată observată pentru `calculator salariu`:

1. calculator-salarii.ro
2. impozitsalariu.ro
3. salaria.ro
4. salariile.ro
5. paylab.ro

Snippetul salariile.ro avea faviconul distinct „S.”, titlul complet
„Calculator salariu net 2026: net, taxe și cost angajator” și o descriere
completă, mai informativă decât a concurentului. Nu schimbăm homepage-ul pe
baza unei singure zile și nu migrăm calculatorul principal: datele proprii
arată creștere, iar modificarea ar introduce risc fără o cauză demonstrată.

Seobility și Search Console măsoară lucruri diferite. Saltul de vizibilitate al
concurentului poate fi real fără ca noi să fi pierdut trafic: vizibilitatea
este un scor agregat pe setul monitorizat de cuvinte, în timp ce Search Console
arată expunerea și clicurile efective ale proprietății noastre.

## Inventarul editorial al concurentului

Sitemapul conținea 24 de articole în limba română: 16 materiale curente din
2026 și 8 pagini de arhivă din 2017–2018. Cele 16 materiale curente aveau în
medie aproximativ 1.092 de cuvinte, între 849 și 1.608.

Temele curente observate:

- taxe pe muncă în România și UE;
- D112 și supraimpozitarea contractelor part-time;
- salariul minim și efectele schimbării din iulie;
- tichete, zile libere și muncă fără contract;
- transparență salarială și conversii brut–net;
- materiale conjuncturale despre proiecte sau termene administrative.

Formula repetată este utilă și trebuie adoptată ca sistem, nu copiată ca text:
răspunsul apare imediat, urmat de scenarii sau tabel, legături interne,
trimiteri la surse primare și, unde subiectul permite, un instrument sau un
fișier reutilizabil. Activul lor despre taxarea muncii are grafic interactiv și
fișiere CSV/SVG/PNG pregătite pentru citare, ceea ce îl face mai ușor de
distribuit și de legat din presă.

## Distribuția verificată

- Libertatea a publicat un advertorial marcat ca publicitate, cu legături către
  calculatoarele lor.
- Bugetul.ro i-a citat în materiale despre zile libere și part-time/D112.
- AGERPRES OTS a publicat pe 27 august un material cu legătură către un articol
  și către homepage.
- Postarea Reddit despre taxarea muncii nu a fost publicată „astăzi”, cum
  susținea analiza primită. A fost publicată pe 14 august în r/RoMunca și avea
  46 de voturi la momentul verificării.

Corelația temporală dintre distribuție și saltul Seobility este plauzibilă, dar
nu dovedește că o singură legătură a produs creșterea. Explicația mai solidă
este reevaluarea unui pachet de semnale: conținut nou, cluster intern, mențiuni
editoriale și legături externe.

## Răspunsul implementat

Am adăugat `/calculator-salariu-part-time`, un calculator care separă netul
angajatului de diferențele CAS/CASS suportate de angajator și tratează
excepțiile legale. Pagina include scenarii pentru 2, 4 și 6 ore, cost/oră,
sursele oficiale și răspunsuri la întrebările care apar în SERP. Logica este în
modulul fiscal unic, are teste dedicate și este legată contextual din homepage,
pagina salariului minim, footer, sitemap și `llms.txt`.

Sursele primare folosite sunt Codul fiscal, OUG 89/2025 și instrucțiunile D112
din OPANAF 605/2026. Nu a fost publicat ca fapt proiectul de eliminare a
supraimpozitării din 2027.

## Următorul prag de decizie

Măsurăm separat interogările part-time după indexare și urmărim dacă pagina
intră în primele 10 rezultate. Homepage-ul se schimbă doar dacă Search Console
arată o scădere persistentă de CTR la poziții comparabile, nu ca reacție la
scorul zilnic al unui instrument terț.
