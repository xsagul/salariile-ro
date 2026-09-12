# Mutarea salariile.ro de pe Vercel pe Cloudflare

Decizia proprietarului, 12 septembrie 2026. Motive: plafoanele planului Hobby
(Edge Requests 467K/1M la 10 septembrie, cu traficul în creștere) și faptul că
Hobby e restricționat la uz necomercial. Termenii Cloudflare pentru planul
gratuit nu interzic uzul comercial; singura restricție specifică e procesarea
datelor de card pe site.

**Stare (12 septembrie 2026): codul e gata și verificat; zona Cloudflare e
creată, iar nameserverele sunt schimbate la Namebox și în propagare. Producția
e încă pe Vercel.** Pașii 1–3 de mai jos sunt făcuți; urmează zona „Active” în
Cloudflare și pasul 4.

- Ramura: `migrare-cloudflare` (worktree local `C:\Users\Sorin\Desktop\salariile-ro-cf`)
- **Nu face merge în `main` înainte de comutare.** Vercel e încă legat de repo:
  ar publica exportul static fără headere de securitate și fără redirecturi.

## De ce nu se pierd pozițiile din Google

Rankingul ține de URL-uri, conținut, coduri de status și canonical, nu de
furnizorul de hosting. Google are procedură dedicată pentru „mutare fără
schimbarea URL-urilor”: infrastructura nouă se testează înainte, DNS-ul se
schimbă abia apoi, iar hostingul vechi se închide după ce traficul pe el ajunge
la zero. Google avertizează că imediat după schimbare crawl-ul scade temporar
și crește din nou în zilele următoare. E normal, nu e penalizare.

Condițiile, toate verificate pe ramură:

- același domeniu și exact aceleași URL-uri, fără slash final;
- aceleași coduri: 200 pe pagini, 301 pe URL-urile vechi, 404 real pe inexistente;
- același HTML pentru Google: titlu, meta, canonical, H1, JSON-LD, link-uri, text;
- comutare fără fereastră de indisponibilitate și cu rollback rapid.

## Ce s-a verificat (12 septembrie 2026)

| Verificare | Rezultat |
|---|---|
| `scripts/compara-hosting.mjs`, producția Vercel vs Cloudflare local | 338 URL-uri (323 din sitemap + cazuri speciale): **0 diferențe neasumate**, 12 asumate, fiecare cu motiv în script |
| `npm run test:rendered` pe runtime-ul local Cloudflare (`wrangler dev`) | 323 de rute: HTTP 200, un H1/main, canonical, JSON-LD, link graph, iframe-uri, Markdown, headere |
| `npm test`, `tsc --noEmit`, `eslint` | trecute (0 erori) |
| Browser Edge, mobil, pe runtime-ul Cloudflare | widget cu `?brut=` și `?variant=complet`, brut invalid ignorat, fluturaș, navigare client-side: 0 erori de consolă, 0 cereri eșuate |
| Build static | 327 HTML, 323 Markdown, 60 variante WebP, 3.769 fișiere, 157 MB. Limite Free: 20.000 fișiere, 25 MiB/fișier |
| Costul pe Cloudflare | cererile către assets statice sunt „free and unlimited”; site-ul nu are script de Worker, deci nu consumă invocări |

## Ce se schimbă, asumat

| Pe Vercel | Pe Cloudflare | Efect pentru Google |
|---|---|---|
| `/info` → 410 | 404 real, pagină noindex | niciunul pe termen lung; URL scos din index de luni |
| `/ruta/` → 308 | 301 | ambele permanente |
| Markdown pentru agenți prin `Accept: text/markdown` | fișiere `/ruta.md` generate la build | niciunul (HTML-ul e neschimbat); negocierea pe Accept se poate reface cu o regulă Cloudflare, dacă planul Free permite citirea header-ului — de verificat pe zonă |
| `/api/calendar/...?format=`, `/api/date-salarii/serie?format=` | `/date/calendar/<an>.<format>`, `/date/salarii-serie-ins.<format>` | niciunul: `/api/` era blocat în robots.txt; vechile URL-uri au 301 |
| widget: `?brut=` citit pe server, CSP cu nonce | citit în browser, validat 3–6 cifre, CSP fără nonce | niciunul: iframe-urile sunt noindex |
| imagini optimizate la cerere | variante WebP generate la build | LCP egal sau mai bun: hero-ul /salariu-minim pleacă la 6,5 KB pe mobil |
| Vercel Analytics + Speed Insights | Cloudflare Web Analytics (fără cookies, fără localStorage, fără amprentare) | niciunul; CWV din teren rămân în CrUX (`npm run psi`) |
| ISR la 12h pe `/zile-lucratoare-2026` | rebuild zilnic din CI | niciunul |
| texte legale despre Vercel | cookies, confidențialitate, despre, llms.txt actualizate (Cloudflare certificat EU-U.S. Data Privacy Framework, procesator) | niciunul |

## Pașii proprietarului (numai tu îi poți face)

1. **Cont Cloudflare gratuit:** https://dash.cloudflare.com/sign-up
2. **Add a domain → `salariile.ro` → planul Free.** La scanarea DNS verifică să
   existe exact înregistrările de mai jos, și **toate pe „DNS only” (nor gri)**.
   Cu nor gri, traficul merge în continuare la Vercel: schimbarea
   nameserverelor nu modifică nimic pentru vizitatori sau pentru Google.

   | Tip | Nume | Valoare | Rol |
   |---|---|---|---|
   | A | `@` | `216.198.79.1` | site (Vercel, până la comutare) |
   | A | `@` | `64.29.17.1` | site (Vercel, până la comutare) |
   | A | `www` | `216.198.79.1` | www → redirect la apex (Vercel) |
   | A | `www` | `64.29.17.1` | www → redirect la apex (Vercel) |
   | MX | `@` | `mx1.improvmx.com`, prioritate 10 | **email — nu omite** |
   | MX | `@` | `mx2.improvmx.com`, prioritate 20 | **email — nu omite** |
   | TXT | `@` | `v=spf1 include:spf.improvmx.com ~all` | **email** |
   | TXT | `@` | `google-site-verification=Ix4lU_YUiGCjX5B6z_v2gKpdpQ5VRsfp0uqzg8MMU_c` | Search Console |
   | CNAME | `53fdca2c38bf59088c691abe62770fff` | `verify.bing.com` | Bing Webmaster |

   Valorile sunt cele servite public pe 12 septembrie 2026 (interogare la 1.1.1.1).
   Nu copia înregistrările CAA ale Vercel: erau implicite și ar putea bloca
   certificatul Cloudflare.

3. **La Namebox (namebox.ro, registrarul domeniului):** înlocuiește
   `ns1.vercel-dns.com` și `ns2.vercel-dns.com` cu cele două nameservere pe
   care ți le dă Cloudflare. DNSSEC e inactiv (verificat în WHOIS ROTLD), deci
   nu e nimic de dezactivat înainte. Propagarea la `.ro` poate dura 24–48 h; în
   tot acest timp ambele DNS-uri răspund identic și site-ul rămâne pe Vercel.
4. **Când Cloudflare arată zona „Active”:** spune-mi. Pornesc `wrangler login`,
   tu aprobi în browser (ca la `vercel login`).
5. **Publicarea automată din GitHub:** în Cloudflare, *My Profile → API Tokens →
   Create Token → „Edit Cloudflare Workers”*; apoi în GitHub, *Settings →
   Secrets and variables → Actions*: `CLOUDFLARE_API_TOKEN` și
   `CLOUDFLARE_ACCOUNT_ID`.

## Pașii agentului, după pașii proprietarului

1. `npm run deploy:previzualizare`: publică pe Worker-ul separat
   `salariile-ro-previzualizare` (workers.dev), cu noindex pe tot, niciodată
   pe producție. `compara-hosting` contra lui: infrastructura Cloudflare reală,
   nu doar runtime-ul local.
2. Test pe un subdomeniu (`cf.salariile.ro`), cu Custom Domain pe Worker-ul de
   previzualizare: cât durează emiterea certificatului și ce face Cloudflare cu
   o înregistrare A existentă. Documentația nu spune nici una, nici alta. Cu HSTS
   preload, un certificat lipsă înseamnă site inaccesibil, deci se măsoară întâi
   aici, nu pe apex.
3. Certificatul Universal SSL al zonei confirmat „Active”; TTL-ul înregistrărilor
   apex coborât la 60 s, ca rollback-ul să se propage într-un minut.

## Comutarea (împreună, la oră cu trafic minim)

1. Auto-deploy-ul Vercel oprit pe `main`, ca producția Vercel să rămână
   înghețată ca rezervă.
2. Merge `migrare-cloudflare` în `main` → CI rulează testele și publică pe
   Cloudflare.
3. În zona Cloudflare, `salariile.ro` și `www` trec pe „Proxied”. Traficul merge
   prin Cloudflare la Vercel, fără nicio fereastră: verificat pe subdomeniu,
   schimbarea IP-ului nu a ratat niciun răspuns.
4. Se adaugă ruta `salariile.ro/*` către Worker-ul de producție. Din acel moment
   site-ul e servit de Cloudflare, nu de Vercel.
5. Imediat după: apex 200 cu CSP și HSTS, `www` → 301, `http` → https,
   `compara-hosting` între deploy-ul Vercel înghețat și `https://salariile.ro`.
6. Web Analytics pornit (setare automată), cu `/widget/frame*` exclus.
7. Search Console: test live URL Inspection pe câteva URL-uri, sitemap retrimis.

**Rollback:** se șterge ruta din Workers Routes. Traficul revine la Vercel de la
prima cerere de după ștergere (măsurat pe subdomeniu). Atenție: `wrangler deploy`
fără `--route` NU șterge o rută existentă — ștergerea se face din dashboard. Dacă
e nevoie și de întoarcerea DNS-ului, `@` și `www` se pun înapoi pe „DNS only”.

## După comutare

- Primele ore: `compara-hosting`, erori 5xx, trafic rezidual pe Vercel (propagare).
- 14 zile: Search Console (Crawl stats, Page indexing), `npm run gsc:weekly`,
  CrUX pe homepage și /salariu-minim.
- După 14 zile stabile: domeniul scos din Vercel și proiectul Vercel șters —
  pas ireversibil, al proprietarului.

## Ce nu se poate verifica fără cont Cloudflare

- durata emiterii certificatului pe un Custom Domain;
- comportamentul la o înregistrare A existentă pe hostname;
- dacă regulile gratuite pot citi header-ul `Accept` (negocierea Markdown);
- echivalența edge-ului real cu `wrangler dev` — acoperită de pasul 1 al agentului.


## Metoda de comutare, validată pe subdomeniu (12 septembrie 2026)

Testat pe `cf.salariile.ro`, subdomeniu nefolosit, cu o sondă care cerea pagina
în fiecare secundă prin nameserverul autoritativ Cloudflare:

- **Custom Domain nu e potrivit pentru apex.** Cloudflare refuză hostname-urile
  care au deja înregistrări: „Hostname 'cf.salariile.ro' already has externally
  managed DNS records (A, CNAME, etc). Delete them first” (cod 100117). Ar fi
  cerut ștergerea A-urilor înainte, deci o fereastră în care numele nu ar exista,
  iar resolverele ar fi putut ține minte răspunsul negativ.
- **Trecerea pe „Proxied” nu întrerupe nimic.** IP-ul s-a schimbat din cel Vercel
  în cel Cloudflare fără niciun răspuns ratat și cu certificat valid tot timpul.
- **Ruta funcționează pe un Worker doar cu fișiere statice**, lucru pe care
  documentația nu îl confirmă. După atașare: 200 pe pagini, 301 pe `/ruta/` și pe
  URL-urile vechi, 404 real, fără antete Vercel.
- **Revenirea e imediată:** prima interogare de după ștergerea rutei arată din nou
  răspunsul Vercel.
- **Două capcane:** `wrangler deploy` fără `--route` nu șterge ruta existentă, iar
  un deploy cu `--domain` sau `--route` dezactivează `workers.dev` dacă
  `workers_dev` lipsește din configurație. De aceea e acum explicit în ambele
  fișiere de configurare.
