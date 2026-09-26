# Ce se caută în weekend, 26 septembrie 2026

**Întrebarea:** în weekend căutările și clicurile noastre scad la jumătate sau sub. Există
subiecte căutate mult în weekend, inclusiv în afara cuvintelor noastre, care să acopere
zilele slabe?

**Metoda.** SE Ranking dă doar volume lunare. Ziua săptămânii vine din două surse:

- **Google Trends**, România, ultimele 3 luni, cu date zilnice. Pentru fiecare cuvânt am
  calculat media pe o zi de weekend împărțită la media pe o zi lucrătoare. Fiecare cerere
  a inclus ancora „calculator salariu”, ca volumele să se poată compara între cereri.
  Fereastra include vacanța de vară.
- **Search Console**: paginile și cuvintele noastre pe 24 august – 20 septembrie
  (4 săptămâni complete). `node scripts/gsc.mjs pages --si=date`.

## Google Trends

Coloanele: volumul ca multiplu al ancorei „calculator salariu” și raportul
weekend / zi lucrătoare. Raportul 1,00 înseamnă „la fel de căutat în weekend”.

| Cuvânt | Volum × ancoră | Weekend / zi lucrătoare |
|---|---|---|
| calculator salariu (ancora) | 1 | 0,26 |
| calculator tva | 0,03 | 0,10 |
| indemnizatie crestere copil | 0,17 | 0,11 |
| concediu medical | 1,09 | 0,48 |
| impozit / taxe | 2,65 / 2,94 | 0,49 / 0,52 |
| salariu | 6,62 | 0,56 |
| ejobs | 1,83 | 0,53 |
| angajari | 3,99 | 0,63 |
| **locuri de munca** | **10,9** | **0,76** |
| joburi / job | 2,8 / 4,3 | 0,79 / 0,85 |
| part time | 1,18 | 0,83 |
| cat castiga | 0,38 | 0,88 |
| bolt / glovo | 3,11 / 1,25 | 0,92 / 1,09 |
| bani | 7,89 | 0,93 |
| chirie | 4,09 | 1,00 |
| pensie | 19,2 | 1,02 |
| vacanta | 5,55 | 1,03 |
| horoscop / reteta / meteo | 7,7 / 17,7 / 195 | 1,04 / 1,26 / 0,97 |
| loto / loto 6/49 | 12,1 / 1,9 | 1,37 / 1,48 |

Pe cuvintele pentru pensie raportul scade: „calcul pensie” 0,25, „calculator pensie” 0,20,
„pensie anticipata” 0,47. Cuvântul general „pensie” rămâne constant (1,02).

## Search Console: paginile noastre

Raportul e afișări pe o zi de weekend împărțite la afișări pe o zi lucrătoare.

- **Crescătoare în weekend:**
  - `/zile-libere-2027`: 1,86
  - pagini de meserie: preot 2,06, procuror 1,59, grefier 1,48, medic rezident 1,33,
    judecător 1,31, avocat 1,26
- **Cele mai slabe în weekend:**
  - homepage 0,41
  - `/zile-lucratoare-2026` 0,46
  - `/deducere-personala-2026` 0,36

## Concluzie

- **Căderea din weekend e structurală.** Tot ce ține de salariu, taxe și acte se caută
  în zilele de lucru.
- **Ce rezistă în weekend e altă intenție:**
  - căutarea unui loc de muncă;
  - curiozitatea despre meserii („cât câștigă un…”, paginile noastre de meserie);
  - planificarea anului următor (zile libere 2027);
  - timpul liber: meteo, rețete, horoscop, loto, vacanță.
- **„Locuri de muncă”** are de 11 ori volumul ancorei și păstrează 76% în weekend.
  Corespunde pasului 2 din strategie (postarea de joburi).
