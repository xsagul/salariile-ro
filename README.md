# Salariile.ro - Calculator salariu net/brut 2026 pentru Romania

Repository public pentru [salariile.ro](https://salariile.ro), un portal independent despre salarii si fiscalitate in Romania.

Site-ul ofera calculatoare si ghiduri actualizate pentru salariu net/brut, salariu minim, salariu mediu, taxe PFA si resurse utile pentru angajati, freelanceri, contabili si editori care scriu despre fiscalitate.

## Linkuri utile

- [Calculator salariu net/brut 2026](https://salariile.ro/)
- [Widget calculator salariu pentru site-uri](https://salariile.ro/widget)
- [Metodologie calcul salariu](https://salariile.ro/metodologie)
- [Salariu minim 2026](https://salariile.ro/salariu-minim)
- [Salariu mediu pe economie](https://salariile.ro/salariu-mediu)
- [Calculator taxe PFA](https://salariile.ro/calculator-pfa)
- [Generator fluturas salariu](https://salariile.ro/fluturas-salariu)
- [Zile libere si lucratoare 2026](https://salariile.ro/zile-libere-2026)

## Ce contine proiectul

- Calculator salariu din brut in net si din net in brut.
- Defalcare CAS, CASS, impozit pe venit, CAM si cost total angajator.
- Suport pentru ambele regimuri ale salariului minim din 2026, cu perioada de aplicare a fiecaruia.
- Explicatii pentru deducerea personala si facilitatea fiscala aplicata la salariul minim.
- Pagini informationale pentru salariul minim, salariul mediu, zile libere, PFA si noutati fiscale.
- Widget iframe/script care poate fi integrat gratuit pe alte site-uri.

## Surse si transparenta

<!-- fiscal:start — cotele de mai jos sunt verificate contra `src/lib/fiscal.ts`
     de `scripts/test-context-drift.mts`. Schimba-le in cod, apoi aici. -->

Formulele sunt documentate public pe pagina de [metodologie](https://salariile.ro/metodologie). Calculele sunt orientative si folosesc legislatia fiscala curenta aplicabila in Romania, inclusiv CAS 25%, CASS 10%, impozit pe venit 10% si CAM 2,25%.

<!-- fiscal:end -->

Sursele principale sunt actele publicate pe `legislatie.just.ro`, datele INS si comunicatele institutiilor publice relevante.

## Stack tehnic

- Next.js
- TypeScript
- Tailwind CSS
- Deploy pe Vercel
- Sitemap si metadata generate pentru indexare

## Autor

Proiect independent dezvoltat de Stiuriuc Sorin-Marian.

Live: [https://salariile.ro](https://salariile.ro)

## Licență

Codul software original este open-source sub [Apache License 2.0](LICENSE). Licența este permisivă, include un grant explicit de brevete și nu acordă drepturi asupra numelui, domeniului, logo-ului sau identității `salariile.ro`.

Textele editoriale, materialele vizuale și brandul nu sunt incluse automat în licența software. Delimitarea completă dintre cod, conținut, date și identitate este documentată în [LICENSING.md](LICENSING.md).
