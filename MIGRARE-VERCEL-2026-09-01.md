# Inventar DNS + Vercel înainte de migrarea de cont — 1 septembrie 2026

Capturat din contul `xsaguls-projects` cu `vercel dns ls salariile.ro`,
confirmat independent prin interogări DNS la 8.8.8.8.

## Situația de plecare

- Proiect Vercel: `xsaguls-projects/salariile-ro`
- Domeniu: `salariile.ro` — registrar TERȚ, dar **nameservere Vercel**
  (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
- **DNS-ul autoritativ trăiește în contul care urmează să fie șters.**
- Variabile de mediu pe Vercel: NICIUNA (`vercel env ls` → gol)

## Înregistrări DNS de replicat — TOATE

| Tip | Nume | Valoare | Rol |
|---|---|---|---|
| TXT | @ | `google-site-verification=Ix4lU_YUiGCjX5B6z_v2gKpdpQ5VRsfp0uqzg8MMU_c` | verificare Google Search Console |
| TXT | @ | `v=spf1 include:spf.improvmx.com ~all` | SPF email |
| MX | @ | `10 mx1.improvmx.com.` | email |
| MX | @ | `20 mx2.improvmx.com.` | email |
| CNAME | `53fdca2c38bf59088c691abe62770fff` | `verify.bing.com.` | verificare Bing Webmaster |
| CAA | @ | `0 issue "pki.goog"` | implicit Vercel |
| CAA | @ | `0 issue "sectigo.com"` | implicit Vercel |
| CAA | @ | `0 issue "letsencrypt.org"` | implicit Vercel |
| ALIAS | `*` | `cname.vercel-dns-017.com.` | wildcard → Vercel |
| ALIAS | @ | `3918a89b6786ae46.vercel-dns-017.com` | apex → Vercel |

IP-uri servite azi pentru apex: `216.198.79.1`, `64.29.17.1`

## Ce se rupe dacă se pierde fiecare

- **MX + SPF** → email-ul pe domeniu (ImprovMX) moare. Cel mai grav; e și
  cel mai ușor de uitat, fiindcă nu ține de site.
- **TXT google-site-verification** → proprietatea GSC devine neverificată;
  `npm run gsc` și `npm run gsc:weekly` se opresc.
- **CNAME verify.bing.com** → verificarea Bing cade; `npm run bing` se oprește.
- **ALIAS** → site-ul nu mai rezolvă.

## Ce NU se transferă niciodată între conturi Vercel

- Istoricul Vercel Analytics și Speed Insights (date, nu configurație).
- Istoricul de deployment-uri și URL-urile de preview vechi.

---

# Plan de execuție — DNS la namebox.ro

Decizie luată 1 septembrie 2026: DNS autoritativ mutat la namebox.ro,
ca să nu mai depindă de niciun cont Vercel.

Proiectul are DOAR `salariile.ro` + `www.salariile.ro`. Niciun domeniu
wildcard, deci NU e obligatorie metoda cu nameservere (Vercel o cere doar
pentru wildcard). Înregistrarea `*` din zona veche e un default al
nameserverelor Vercel, nu un domeniu configurat pe proiect — nu se replică.

## Zona de creat la namebox.ro

| Tip | Nume | Valoare | Note |
|---|---|---|---|
| A | `@` | *(din dashboard-ul proiectului nou)* | apex → Vercel |
| CNAME | `www` | *(CNAME unic al proiectului nou, `*.vercel-dns-017.com`)* | |
| MX | `@` | `10 mx1.improvmx.com.` | **email — nu omite** |
| MX | `@` | `20 mx2.improvmx.com.` | **email — nu omite** |
| TXT | `@` | `v=spf1 include:spf.improvmx.com ~all` | **email** |
| TXT | `@` | `google-site-verification=Ix4lU_YUiGCjX5B6z_v2gKpdpQ5VRsfp0uqzg8MMU_c` | GSC |
| CNAME | `53fdca2c38bf59088c691abe62770fff` | `verify.bing.com.` | Bing |
| CAA | `@` | `0 issue "pki.goog"` | |
| CAA | `@` | `0 issue "sectigo.com"` | |
| CAA | `@` | `0 issue "letsencrypt.org"` | |
| TXT | `_vercel` | *(valoare dată de contul nou la adăugarea domeniului)* | verificare cross-account |

Valorile marcate *(din dashboard)* se completează la faza 3 — sunt unice
per proiect și nu se pot ghici.

## Ordinea, și de ce contează

1. Proiect nou creat și deployat — verificat pe URL `.vercel.app`.
2. Zona completă creată la namebox, DAR nameserverele încă pe Vercel. Zero efect.
3. Domeniul adăugat în proiectul nou → Vercel dă TXT `_vercel`; se pune în
   DNS-ul VECHI (acolo e încă autoritatea). Verificarea trece. Zero efect.
4. Nameservere comutate la namebox. Ambele zone răspund identic → zero downtime.
5. **Abia după propagare completă:** domeniul scos din proiectul vechi,
   preluat de cel nou. Aici e singura fereastră de indisponibilitate.
6. Contul vechi șters — DOAR după ce pasul 5 e verificat.

## Regula care nu se încalcă

Contul vechi NU se șterge cât timp nameserverele Vercel mai sunt interogate
de vreun resolver. Propagarea NS la `.ro` poate dura 24–48h. Criteriul e
măsurătoarea, nu calendarul.

---

# REVIZIE: proprietarul a ales ștergere + recreare (nu namebox)

Decizie 1 septembrie 2026. Motivul refuzului variantei namebox: nu voia să
aștepte 24h de propagare înainte de a putea șterge contul vechi.
I s-a semnalat că `vercel domains move` ar muta proprietatea fără fereastră
de indisponibilitate; a ales tot ștergere + recreare. Decizia lui, asumată.

Nameserverele NU se schimbă: rămân ns1/ns2.vercel-dns.com. Se mută doar
contul care găzduiește zona. Deci zero propagare, dar există o fereastră
între ștergerea zonei din contul vechi și recrearea ei în cel nou.

## Ce s-a făcut deja

1. Proiect `salariile-ro` creat în echipa `salariile-ro` (user
   `sorinstiuriuc-4567`), importat din `xsagul/salariile-ro`, deployat.
   Live pe `salariile-ro-theta.vercel.app` / `salariile-ro.vercel.app`.
   Verificat: același conținut ca producția.
2. Environment Variables: niciuna — corect, nici contul vechi nu are.
3. `salariile.ro` adăugat în proiectul nou, environment Production.
   **Căsuța „Redirect apex domains to www" DEBIFATĂ** — direcția reală a
   site-ului e www → apex (măsurat: apex 200, www 301 → apex, canonical
   `https://salariile.ro`). Default-ul Vercel ar fi inversat canonicul.
4. TXT `_vercel` = `vc-domain-verify=salariile.ro,8ac7860c6c4258eba5ac`
   adăugat în zona veche → verificare trecută, domeniul arată
   "Valid Configuration" în proiectul nou. Producția neatinsă.

## Ce a MAI rămas

- [ ] `www.salariile.ro` în proiectul nou, ca redirect 301 → `salariile.ro`
- [ ] Login CLI cont nou: `vercel --global-config C:\Users\Sorin\.vercel-nou login`
- [ ] Comutarea propriu-zisă (vezi mai jos)
- [ ] Ștergerea contului vechi — DUPĂ verificare

## Minimizarea ferestrei

Sesiuni CLI paralele prin `--global-config`, ca ambele conturi să fie
disponibile simultan. Recrearea se face cu `vercel dns import` — o singură
comandă pentru toate înregistrările, nu nouă comenzi.

Zonefile pregătit (TTL 60s, ca o eventuală corecție să se propage în 1 min):

```
@	60	IN	TXT	"google-site-verification=Ix4lU_YUiGCjX5B6z_v2gKpdpQ5VRsfp0uqzg8MMU_c"
@	60	IN	TXT	"v=spf1 include:spf.improvmx.com ~all"
@	60	IN	MX	10 mx1.improvmx.com.
@	60	IN	MX	20 mx2.improvmx.com.
53fdca2c38bf59088c691abe62770fff	60	IN	CNAME	verify.bing.com.
```

ALIAS și CAA sunt excluse intenționat: erau marcate "default" în zona veche,
adică le regenerează Vercel automat la adăugarea domeniului în cont.

Nota liniștitoare pentru email: serverele expeditoare reîncearcă la eșec DNS.
O fereastră de secunde înseamnă mesaje întârziate, nu pierdute.

---

# REZULTAT: migrare reușită, ZERO downtime

## Ce a blocat varianta aleasă, și ce a salvat operațiunea

Ștergerea + recrearea a eșuat la primul pas, cu 409:

```
salariile.ro cannot be removed since it's still using Vercel Nameservers.
```

Vercel refuză structural ștergerea unui domeniu care folosește nameserverele
lui. Protecția e exact împotriva scenariului pe care îl construiam. Calea
respinsă (namebox, 24h) și cea aleasă (ștergere) erau amândouă închise:
prima prin decizie, a doua prin platformă.

A rămas `vercel domains move`, care a rezolvat totul fără fereastră.
Nimic nu s-a stricat la eșec — verificat imediat: site 200, MX prezente.

## Cum s-a făcut

1. `vercel domains move salariile.ro salariile-ro`
2. Vercel a trimis cerere de aprobare pe contul destinație
3. Aprobare din notificările contului nou ("Accept Move Request")

Sesiuni CLI paralele prin `--global-config C:\Users\Sorin\.vercel-nou`,
ca ambele conturi să fie comandabile simultan.

## Dovada că zona s-a MUTAT, nu s-a recreat

ID-urile și vechimile înregistrărilor au rămas neschimbate după mutare:
`google-site-verification` — 93 zile; SPF, ambele MX, CNAME-ul Bing —
113 zile. O recreare le-ar fi resetat la "acum".

Singura schimbare automată: ALIAS-ul apex, de la `3918a89b6786ae46` la
`e7a3acca07d8035a.vercel-dns-017.com` — Vercel l-a repointat pe proiectul nou.

## Verificat după migrare

- apex 200; www 301 → apex (canonicul păstrat: apex, NU www)
- MX ambele; SPF; google-site-verification; CNAME Bing — toate prezente
- `npm run gsc sitemaps` → 298 URL-uri, 0 erori
- `npm run bing sites` → salariile.ro verificat
- cont vechi: 0 domenii
- TXT-urile `_vercel` de verificare: șterse după mutare, nu mai au rol

## RĂMÂNE DE FĂCUT

- [ ] **Proiectul vechi e încă legat la același repo GitHub.** Până la
      ștergerea contului, fiecare push declanșează build în AMBELE proiecte.
      Nu strică nimic (vechiul nu mai are domeniu), dar e zgomot.
- [ ] Ștergerea contului vechi — acum sigură: domeniul și zona DNS au ieșit.
      Se pierde definitiv istoricul Vercel Analytics și Speed Insights.
