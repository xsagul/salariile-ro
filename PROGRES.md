# Progres salariile.ro

Ultima actualizare: 6 iulie 2026

## Audit SEO si marketing

Status: audit tehnic + continut + extern + AI/GEO rulat, cu doua runde de implementare publicate.

Commituri relevante:

- `6cff079` - Fix SEO metadata freshness
- `e395f18` - Add SEO pages for fiscal long-tail queries

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

