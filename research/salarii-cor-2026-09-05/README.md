# Bază salarială COR — pachet de lucru

**Începe cu [STUDIU.md](STUDIU.md).** Acesta cuprinde concluzia, opțiunile de surse, metodologia statistică, regulile de publicare și planul de implementare.

| Document | Utilizare |
|---|---|
| [Studiul și recomandarea](STUDIU.md) | Decizia de produs, date și investiție |
| [Registrul celor 30 fișe de surse](REGISTRU-SURSE.md) | Granularitate, acces, variabile, limite și legalitate; opt familii suplimentare de piste |
| [API-uri și fișiere](ANEXA-API.md) | Cereri reproductibile și câmpuri efectiv verificate |
| [Arhitectura și dicționarul de date](ARHITECTURA.md) | Specificație pentru implementarea corectă |
| [Cereri de date — netrimise](CERERI-DATE.md) | Texte concrete pentru INS, REGES, furnizori, payroll și platforme |
| [Auditul mapărilor paginilor](audit-cor-pagini.json) | 126 pagini comparate cu nomenclatorul verificat |
| [Exemple de dovezi salariale](exemple-dovezi.json) | Patru probe reale cu limite explicite; fără n inventat |
| [Registrul surselor JSON](registru-surse.json) | Import în instrumentul de lucru |
| [Registrul de acoperire COR](acoperire-cor.json) | 4.537 ocupații din fotografia 2024; statistici nevalidate păstrate null |
| [Verificarea tabelelor](tables-coverage-verified.json) | Granularitatea efectivă a exporturilor Eurostat / ILOSTAT |

Fotografia COR din aprilie 2024 **nu este certificată ca nomenclator complet actualizat în septembrie 2026**. Există amendamente ulterioare documentate. Registrul de acoperire nu este un fișier cu salarii gata de publicat: separă ținta de cercetare de ceea ce este efectiv demonstrat.

Nu au fost cumpărate licențe, trimise mesaje către terți sau schimbate sursele de producție ale site-ului. Datele salariale de probă nu sunt combinate într-o medie. Dovezile brute și metadatele de descărcare se află în `raw/`; distribuirea lor poate avea condiții diferite de citarea unei constatări în studiu.

Instrumentele `collect-sources.mjs`, `fetch-evidence.mjs`, `inspect-core.py`, `analyse-evidence.mjs`, `summarise-tables.py`, `read-public-pay.py` și `build-register.mjs` permit reproducerea extragerilor și verificărilor locale. Rezultatul verificării pachetului: [verificare-pachet.json](verificare-pachet.json).
