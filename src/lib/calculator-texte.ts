// src/lib/calculator-texte.ts
//
// Textele calculatorului de salariu, in romana si engleza.
//
// De ce exista fisierul asta si de ce NU s-a facut o copie a componentei:
// pagina engleza trebuie sa fie exact acelasi calculator, nu o varianta
// simplificata. O componenta duplicata ar diverge de la prima modificare a
// regulilor fiscale — una dintre cele doua ar ramane in urma tacut, exact
// tiparul pe care CLAUDE.md il interzice („un fapt viu are exact un
// proprietar"). Aici textele au un proprietar, iar logica ramane in
// `CalculatorSalariu.tsx`, in continuare una singura.
//
// Romana e implicita. Componenta primeste `limba` ca prop, iar homepage-ul nu
// il transmite — deci randeaza identic la bit fata de inainte de acest fisier.
// Verificat prin md5 pe toate cele 43 de pagini care folosesc componenta.
//
// Ce NU se traduce, deliberat:
//   — denumirile contributiilor (CAS, CASS, CAM) raman abrevierile romanesti,
//     pentru ca asa apar pe fluturasul real si in D112; se explica in paranteza;
//   — numerele actelor normative (HG 146/2026, OUG 89/2025, Legea 201/2025)
//     raman cum sunt publicate in Monitorul Oficial.
//
// Moneda: pagina engleza porneste in euro, dar CALCULUL ramane in lei. Cursul
// vine din `src/lib/curs.ts`, adus de la Banca Centrala Europeana si datat, ca
// sa nu existe niciun numar fara sursa vie. Conversia e un strat de afisare si
// de introducere a sumei, si se spune pe fata in `notaConversie`.

export type Limba = "ro" | "en";

export type TexteCalculator = {
  /** Formatarea numerelor si eticheta monedei. */
  locale: string;
  moneda: string;
  monedaPeLuna: string;
  perLuna: string;
  ore: string;

  // ─── Hero ─────────────────────────────────────────────────────────────
  acasa: string;
  breadcrumbFluturas: string;
  breadcrumbCalculator: string;
  titlu: string;
  /** O frază: ce face calculatorul. Actele normative și data actualizării stau
   *  lângă sursele de sub calculator, nu deasupra câmpului de salariu. */
  subtitlu: string;

  // ─── Formular ─────────────────────────────────────────────────────────
  dateSalariale: string;
  directieCalcul: string;
  moneda_: string;
  cursNota: (curs: string, data: string) => string;
  cursVechiNota: string;
  notaConversie: string;
  /** Butoanele mici de direcție din dreptul titlului „Date salariale”. */
  brutInNetScurt: string;
  netInBrutScurt: string;
  salariuDeBazaBrut: string;
  salariuBrut: string;
  salariuNet: string;
  exemplu: string;
  eroareSalariuGol: string;
  /** Nota de sub câmp când brutul calculat e sub salariul minim al lunii, pe un rând:
   *  „Sub minimul de 4.325 lei · Calculator part-time” are 266 px la 12 px, iar câmpul
   *  are 294 px pe un telefon de 360 px (proprietar, 26 septembrie 2026). Cu „salariul
   *  minim” întreg avea 300 px și se rupea pe 360 px. */
  subMinim: (minim: string) => string;
  subMinimLink: string;
  ascundeAvansate: string;
  calculatorAvansat: string;
  calculeaza: string;
  ariaCalculeaza: string;

  firma: string;
  normaContract: string;
  normaExplicatie: (ore: string) => string;
  oreLucrate: string;
  sporOreSupl: string;
  sporExplicatie: string;
  sporuriPrime: string;
  retineri: string;
  retineriExplicatie: string;
  tichetePeLuna: string;
  valoareTichet: string;
  tichetExplicatie: string;
  tichetTotal: string;
  persoaneIntretinere: string;
  persoana: string;
  persoane: string;
  niciuna: string;
  niciunul: string;
  copil: string;
  copii: string;
  copiiScolari: string;
  functieDeBaza: string;
  varstaSub26: string;
  scutitImpozit: string;

  // ─── Rezultat ─────────────────────────────────────────────────────────
  rezultatCalcul: string;
  fluturasDeSalariu: string;
  staleInainte: string;
  staleDupa: string;
  eticheta: string;
  indicatorFiscal: string;
  salariuNetRand: string;
  casPensii: string;
  camAngajatorRand: string;
  costTotalAngajator: string;
  barAngajat: (p: number) => string;
  barStat: (p: number) => string;
  aiUnSite: string;
  puneCalculatorul: string;
  faraCont: string;
  suma: string;

  salariuDeBazaIncadrare: string;
  oreStandard: (ore: number) => string;
  oreSuplimentare: string;
  sporuriPrimeRand: string;
  venitBrutTotal: string;
  tichete: string;
  sumaNetaxabila: string;
  casPensie: string;
  cassSanatate: string;
  deducerePersonala: string;
  bazaImpozit: string;
  impozitVenit: string;
  scutit: string;
  totalRetineri: string;
  totalRetineriAngajat: string;
  restDePlata: string;
  retineriRand: string;
  tichetePeCard: string;
  notaTichete: string;

  salariuIncadrareBrut: string;
  facilitateFiscala: string;
  deducereAplicata: string;

  costAngajator: string;
  camAngajator: string;
  costTotal: string;
  bara: (angajat: number, stat: number) => string;
  baraNota: string;

  descarcaPdf: string;
  seGenereaza: string;
  pdfDescarcat: string;
  pdfEroare: string;
  copiazaLink: string;
  linkCopiat: string;

  gol: string;
  golFluturas: string;
  /** Nota de sub un calcul făcut cu regulile altei perioade decât cea curentă. */
  notaIstoric: (perioada: string) => string;
  /** Eticheta selectorului de lună (ascunsă vizual, citită de cititoarele de ecran). */
  lunaSalariului: string;
  /** Eticheta rândului cu anul și luna salariului. */
  anul: string;
  /** Explicațiile semnului „?” și eticheta lui pentru cititoarele de ecran. */
  ajutorBrut: string;
  ajutorBrutTitlu: string;
  ajutorNet: string;
  ajutorNetTitlu: string;
  ajutorAnul: string;
  ajutorAnulTitlu: string;
  /** Titlul grupului de luni cu aceleași reguli: „Reguli fiscale: ianuarie–iunie”. */
  totAnul: string;
  reguliFiscale: string;
  /** Lunile, cu literă mică, pentru „martie 2025” și „ianuarie–iunie 2026”. */
  luni: readonly string[];

  // ─── PDF ──────────────────────────────────────────────────────────────
  pdfTitlu: string;
  pdfContractIntreaga: string;
  pdfContractPartial: string;
  pdfDrepturi: string;
  pdfRetineri: string;
  pdfSalariuNet: string;
  pdfIntocmit: string;
  pdfAmPrimit: string;
  pdfNota: string;
  pdfGeneratLa: (data: string) => string;
  pdfFisier: string;
};

const RO: TexteCalculator = {
  locale: "ro-RO",
  moneda: "lei",
  monedaPeLuna: "lei / lună",
  perLuna: "/ lună",
  ore: "ore",

  acasa: "Acasă",
  breadcrumbFluturas: "Fluturaș de salariu",
  breadcrumbCalculator: "Calculator salariu",
  titlu: "Calculator salariu net 2026",
  subtitlu: "Vezi netul din brut sau brutul din net, cu taxele reținute și costul total pentru angajator.",

  dateSalariale: "Date salariale",
  directieCalcul: "Direcție de calcul",
  moneda_: "Monedă",
  cursNota: (curs, data) => `1 EUR = ${curs} RON · curs de referință BCE din ${data}`,
  cursVechiNota: "Cursul afișat este mai vechi de o lună.",
  notaConversie:
    "Sumele în euro sunt o conversie orientativă. Salariul, contribuțiile și fluturașul real sunt în lei — legea scrie plafoanele în lei, iar calculul se face în lei.",
  brutInNetScurt: "Brut → net",
  netInBrutScurt: "Net → brut",
  salariuDeBazaBrut: "Salariu de bază (brut)",
  salariuBrut: "Salariu brut",
  salariuNet: "Salariu net",
  exemplu: "ex:",
  eroareSalariuGol: "Scrie mai întâi un salariu.",
  subMinim: (minim) => `Sub minimul de ${minim}`,
  subMinimLink: "Calculator part-time",
  ascundeAvansate: "▲ Ascunde opțiuni avansate",
  calculatorAvansat: "▼ Calculator avansat",
  calculeaza: "Calculează",
  ariaCalculeaza: "Calculează salariul și navighează la rezultat",

  firma: "Firma (opțional, apare pe PDF)",
  normaContract: "Normă contract / lună",
  normaExplicatie: (ore) =>
    `Luna curentă are ${ore} ore la normă întreagă. Dacă ai lucrat mai puțin, salariul scade proporțional. Orele peste normă se plătesc ca ore suplimentare.`,
  oreLucrate: "Ore lucrate",
  sporOreSupl: "Spor ore supl.",
  sporExplicatie:
    "Legea cere cel puțin 75% spor pentru orele suplimentare. Sporurile și primele se taxează ca salariul.",
  sporuriPrime: "Sporuri și prime (brute)",
  retineri: "Rețineri (avans, popriri)",
  retineriExplicatie: "Se scad la final, din netul de plată.",
  tichetePeLuna: "Tichete / lună",
  valoareTichet: "Valoare / tichet",
  tichetExplicatie: "Cel mult un tichet pe zi lucrată, de maximum 45 lei.",
  tichetTotal: "Total:",
  persoaneIntretinere: "Persoane în întreținere",
  persoana: "persoană",
  persoane: "persoane",
  niciuna: "Niciuna",
  niciunul: "Niciunul",
  copil: "copil",
  copii: "copii",
  copiiScolari: "Dintre care, copii minori școlari",
  functieDeBaza: "Funcție de bază (jobul principal)",
  varstaSub26: "Vârstă sub 26 ani",
  scutitImpozit: "Scutit de impozit (de exemplu, handicap)",

  rezultatCalcul: "Rezultat calcul",
  fluturasDeSalariu: "Fluturaș de salariu",
  staleInainte: "Ai modificat datele – apasă ",
  staleDupa: " pentru a actualiza rezultatul.",
  eticheta: "Element",
  indicatorFiscal: "Indicator fiscal",
  salariuNetRand: "Salariu net",
  casPensii: "CAS, pensie (25%)",
  camAngajatorRand: "CAM, plătit de firmă (2,25%)",
  costTotalAngajator: "Cost total pentru firmă",
  barAngajat: (p) => `Angajat ${p}%`,
  barStat: (p) => `Stat ${p}%`,
  aiUnSite: "Ai un site?",
  puneCalculatorul: "Pune calculatorul pe el, gratuit",
  faraCont: "— fără cont și fără reclame.",
  suma: "Sumă",

  salariuDeBazaIncadrare: "Salariu de bază (încadrare)",
  oreStandard: (ore) => `Ore standard (${ore} ore/lună)`,
  oreSuplimentare: "Ore suplimentare",
  sporuriPrimeRand: "Sporuri și prime (brute)",
  venitBrutTotal: "Venit brut total",
  tichete: "Tichete de masă",
  sumaNetaxabila: "Sumă netaxabilă salariu minim (OUG 89/2025)",
  casPensie: "CAS, pensie (25%)",
  cassSanatate: "CASS, sănătate (10%)",
  deducerePersonala: "Deducere personală (netaxabilă)",
  bazaImpozit: "Baza de calcul impozit",
  impozitVenit: "Impozit pe venit (10%)",
  scutit: "0 lei (scutit)",
  totalRetineri: "Total rețineri",
  totalRetineriAngajat: "Total taxe reținute",
  restDePlata: "Rest de plată",
  retineriRand: "Rețineri (avans, popriri)",
  tichetePeCard: "Tichete de masă (pe card, valoare integrală)",
  notaTichete:
    "Banii din cont ies puțin mai mici decât fără tichete. E normal: tichetele intră întregi pe card, iar taxele pe ele se opresc din salariu, la fel ca pe fluturaș.",

  salariuIncadrareBrut: "Salariu brut",
  facilitateFiscala: "Netaxat la salariul minim",
  deducereAplicata: "Deducere personală",

  costAngajator: "Cost angajator",
  camAngajator: "CAM (2,25%)",
  costTotal: "Cost total angajator",
  bara: (angajat, stat) =>
    `Din costul total al firmei, ${angajat}% ajunge la angajat (salariu net) și ${stat}% la stat (CAS, CASS, impozit, CAM).`,
  baraNota: "Din tot ce plătește firma pentru postul tău: partea care ajunge la tine și partea care merge la stat.",

  descarcaPdf: "↓ Descarcă fluturaș PDF",
  seGenereaza: "Se generează…",
  pdfDescarcat: "PDF descărcat.",
  pdfEroare: "PDF-ul nu a putut fi generat. Încearcă din nou.",
  copiazaLink: "⧉ Copiază linkul calculului",
  linkCopiat: "✓ Link copiat",

  gol: "Rezultatul apare aici. Calculul folosește regulile fiscale în vigoare.",
  golFluturas: "Fluturașul apare aici după ce scrii salariul de bază.",
  notaIstoric: (perioada) =>
    `Calcul pentru ${perioada}, cu regulile fiscale de atunci. Fluturașul PDF este disponibil numai pentru grila fiscală curentă.`,
  lunaSalariului: "Luna salariului",
  anul: "Anul",
  ajutorBrut: "Salariul din contract, înainte de taxe. Îl găsești în contractul de muncă sau pe fluturaș, la „salariu brut”.",
  ajutorBrutTitlu: "Ce este salariul brut",
  ajutorNet: "Suma care îți intră în cont în fiecare lună, după taxe. Calculatorul află brutul din care rezultă.",
  ajutorNetTitlu: "Ce este salariul net",
  ajutorAnul: "Luna pentru care calculezi. Salariul minim și suma scutită de taxe se schimbă de la an la an, uneori și în iulie, iar calculul folosește regulile lunii alese.",
  ajutorAnulTitlu: "De ce contează luna",
  totAnul: "tot anul",
  reguliFiscale: "Reguli fiscale",
  luni: ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"],

  pdfTitlu: "FLUTURAS DE SALARIU",
  pdfContractIntreaga: "Contract: norma intreaga",
  pdfContractPartial: "Contract: timp partial",
  pdfDrepturi: "DREPTURI SALARIALE",
  pdfRetineri: "RETINERI",
  pdfSalariuNet: "SALARIU NET",
  pdfIntocmit: "Intocmit (angajator),",
  pdfAmPrimit: "Am primit (angajat),",
  pdfNota: "Document informativ generat pe salariile.ro, conform HG 146/2026 si OUG 89/2025.",
  pdfGeneratLa: (data) => `Nu inlocuieste fluturasul oficial emis de angajator. Generat la ${data}.`,
  pdfFisier: "fluturas-salariu",
};

const EN: TexteCalculator = {
  locale: "en-GB",
  moneda: "RON",
  monedaPeLuna: "RON / month",
  perLuna: "/ month",
  ore: "hours",

  acasa: "Home",
  breadcrumbFluturas: "Payslip",
  breadcrumbCalculator: "Salary calculator",
  titlu: "Romanian Salary Calculator 2026",
  subtitlu: "See take-home pay from a gross salary, or the gross behind a net figure, with every deduction and the total employer cost.",

  dateSalariale: "Salary details",
  directieCalcul: "Calculation direction",
  moneda_: "Currency",
  cursNota: (curs, data) => `1 EUR = ${curs} RON · ECB reference rate of ${data}`,
  cursVechiNota: "The rate shown is more than a month old.",
  notaConversie:
    "Euro amounts are an indicative conversion. The salary, the contributions and the real payslip are in RON — the law sets every threshold in RON, and the calculation is done in RON.",
  brutInNetScurt: "From gross",
  netInBrutScurt: "From net",
  salariuDeBazaBrut: "Base salary (gross)",
  salariuBrut: "Gross salary",
  salariuNet: "Net salary",
  exemplu: "e.g.",
  eroareSalariuGol: "Enter a salary first.",
  subMinim: (minim) => `Under the ${minim} minimum`,
  subMinimLink: "Part-time calculator",
  ascundeAvansate: "▲ Hide advanced options",
  calculatorAvansat: "▼ Advanced calculator",
  calculeaza: "Calculate",
  ariaCalculeaza: "Calculate the salary and jump to the result",

  firma: "Company (optional, shown on the PDF)",
  normaContract: "Contracted hours / month",
  normaExplicatie: (ore) =>
    `Full time this month is ${ore} hours. A lower contracted figure is treated as part time, without the OUG 89/2025 tax relief. On a full-time contract, hours worked below the norm pro-rate both the base and the relief; hours above it are paid as overtime.`,
  oreLucrate: "Hours worked",
  sporOreSupl: "Overtime rate",
  sporExplicatie:
    "The legal minimum overtime supplement is 75% (Labour Code, art. 123). Gross supplements are taxed like salary.",
  sporuriPrime: "Bonuses and supplements (gross)",
  retineri: "Deductions (advances, garnishments)",
  retineriExplicatie: "Subtracted at the end, from the net pay.",
  tichetePeLuna: "Meal vouchers / month",
  valoareTichet: "Value / voucher",
  tichetExplicatie: "At most one voucher per day worked · legal maximum 45 RON per voucher (Law 201/2025).",
  tichetTotal: "Total:",
  persoaneIntretinere: "Dependants",
  persoana: "person",
  persoane: "people",
  niciuna: "None",
  niciunul: "None",
  copil: "child",
  copii: "children",
  copiiScolari: "Of which, school-age children",
  functieDeBaza: "Main employer (primary job)",
  varstaSub26: "Under 26 years old",
  scutitImpozit: "Exempt from income tax (for example, disability)",

  rezultatCalcul: "Result",
  fluturasDeSalariu: "Payslip",
  staleInainte: "You changed the inputs – press ",
  staleDupa: " to refresh the result.",
  eticheta: "Item",
  indicatorFiscal: "Item",
  salariuNetRand: "Net salary",
  casPensii: "CAS — pension contribution (25%)",
  camAngajatorRand: "CAM — employer contribution (2.25%)",
  costTotalAngajator: "Total employer cost",
  barAngajat: (p) => `Employee ${p}%`,
  barStat: (p) => `State ${p}%`,
  aiUnSite: "Have a website?",
  puneCalculatorul: "Embed this calculator, free",
  faraCont: "— no account, no ads.",
  suma: "Amount",

  salariuDeBazaIncadrare: "Base salary (contract)",
  oreStandard: (ore) => `Standard hours (${ore} hours/month)`,
  oreSuplimentare: "Overtime",
  sporuriPrimeRand: "Bonuses and supplements (gross)",
  venitBrutTotal: "Total gross income",
  tichete: "Meal vouchers",
  sumaNetaxabila: "Tax-free amount at minimum wage (OUG 89/2025)",
  casPensie: "CAS — pension contribution (25%)",
  cassSanatate: "CASS — health contribution (10%)",
  deducerePersonala: "Personal deduction (tax-free)",
  bazaImpozit: "Income tax base",
  impozitVenit: "Income tax (10%)",
  scutit: "0 RON (exempt)",
  totalRetineri: "Total deductions",
  totalRetineriAngajat: "Total employee deductions",
  restDePlata: "Amount payable",
  retineriRand: "Deductions (advances, garnishments)",
  tichetePeCard: "Meal vouchers (on card, full value)",
  notaTichete:
    "It is normal for the cash in your account to fall below the standard net salary: the taxes on meal vouchers (health contribution and income tax) are withheld from the cash part, while the vouchers themselves load onto the card at full value. A real payslip shows it the same way.",

  salariuIncadrareBrut: "Contract salary (gross)",
  facilitateFiscala: "Tax relief (non-taxable)",
  deducereAplicata: "Personal deduction (applied)",

  costAngajator: "Employer cost",
  camAngajator: "CAM — work insurance contribution (2.25%)",
  costTotal: "Total employer cost",
  bara: (angajat, stat) =>
    `Of the company's total cost, ${angajat}% reaches the employee as net salary and ${stat}% goes to the state (pension, health, income tax and work insurance contributions).`,
  baraNota:
    "Of the company's total cost: how much reaches you as net pay, and how much goes to the state (CAS, CASS, income tax, CAM).",

  descarcaPdf: "↓ Download payslip PDF",
  seGenereaza: "Generating…",
  pdfDescarcat: "PDF downloaded.",
  pdfEroare: "The PDF could not be generated. Please try again.",
  copiazaLink: "⧉ Copy link to this calculation",
  linkCopiat: "✓ Link copied",

  gol: "The result appears here. The calculation uses the tax rules currently in force.",
  golFluturas: "The payslip appears here once you enter the base salary.",
  notaIstoric: (perioada) =>
    `Calculation for ${perioada}, with the tax rules in force then. The PDF payslip is available only for the current tax rules.`,
  lunaSalariului: "Salary month",
  anul: "Year",
  ajutorBrut: "The salary in your contract, before taxes. You find it in your employment contract or on your payslip.",
  ajutorBrutTitlu: "What gross salary means",
  ajutorNet: "The amount paid into your account each month, after taxes. The calculator finds the gross salary behind it.",
  ajutorNetTitlu: "What net salary means",
  ajutorAnul: "The month you are calculating for. The minimum wage and the tax-free amount change from year to year, sometimes in July too, and the calculation uses the rules of the chosen month.",
  ajutorAnulTitlu: "Why the month matters",
  totAnul: "whole year",
  reguliFiscale: "Tax rules",
  luni: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],

  pdfTitlu: "PAYSLIP",
  pdfContractIntreaga: "Contract: full time",
  pdfContractPartial: "Contract: part time",
  pdfDrepturi: "EARNINGS",
  pdfRetineri: "DEDUCTIONS",
  pdfSalariuNet: "NET SALARY",
  pdfIntocmit: "Prepared by (employer),",
  pdfAmPrimit: "Received by (employee),",
  pdfNota: "Informative document generated on salariile.ro, under HG 146/2026 and OUG 89/2025.",
  pdfGeneratLa: (data) => `Does not replace the official payslip issued by the employer. Generated on ${data}.`,
  pdfFisier: "payslip",
};

export const TEXTE: Record<Limba, TexteCalculator> = { ro: RO, en: EN };
