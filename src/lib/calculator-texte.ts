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
//     raman cum sunt publicate in Monitorul Oficial;
//   — moneda ramane RON, fara conversie: un curs valutar are nevoie de o sursa
//     vie cu proprietar, iar o valoare inghetata in cod ar deveni falsa in
//     cateva luni.

export type Limba = "ro" | "en";

export type TexteCalculator = {
  /** Formatarea numerelor si eticheta monedei. */
  locale: string;
  moneda: string;
  monedaPeLuna: string;
  ore: string;

  // ─── Hero ─────────────────────────────────────────────────────────────
  acasa: string;
  breadcrumbFluturas: string;
  breadcrumbCalculator: string;
  titlu: string;
  subtitluInainteLink: string;
  subtitluIntreLinkuri: string;
  subtitluDupaLink: string;
  ultimaActualizare: string;

  // ─── Formular ─────────────────────────────────────────────────────────
  dateSalariale: string;
  directieCalcul: string;
  dinBrutInNet: string;
  dinNetInBrut: string;
  salariuDeBazaBrut: string;
  salariuBrut: string;
  salariuNet: string;
  exemplu: string;
  eroareSalariuGol: string;
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
  notaIstoric: string;

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
  ore: "ore",

  acasa: "Acasă",
  breadcrumbFluturas: "Fluturaș de salariu",
  breadcrumbCalculator: "Calculator salariu",
  titlu: "Calculator salariu net 2026",
  subtitluInainteLink:
    "Calcul salariu net din brut: pune salariul brut și vezi netul, cu CAS, CASS, impozit și costul angajatorului, conform ",
  subtitluIntreLinkuri: " și ",
  subtitluDupaLink: ". Funcționează și invers, din net în brut.",
  ultimaActualizare: "Ultima actualizare: 26 iulie 2026",

  dateSalariale: "Date salariale",
  directieCalcul: "Direcție de calcul",
  dinBrutInNet: "Din brut în net",
  dinNetInBrut: "Din net în brut",
  salariuDeBazaBrut: "Salariu de bază (brut)",
  salariuBrut: "Salariu brut",
  salariuNet: "Salariu net",
  exemplu: "ex:",
  eroareSalariuGol: "Introdu un salariu mai întâi.",
  ascundeAvansate: "▲ Ascunde opțiuni avansate",
  calculatorAvansat: "▼ Calculator avansat",
  calculeaza: "Calculează",
  ariaCalculeaza: "Calculează salariul și navighează la rezultat",

  firma: "Firma (opțional, apare pe PDF)",
  normaContract: "Normă contract / lună",
  normaExplicatie: (ore) =>
    `Norma întreagă a lunii curente este ${ore} ore. O normă contractuală mai mică este tratată ca timp parțial, fără facilitatea OUG 89/2025. La normă întreagă, orele lucrate sub normă proratează baza și facilitatea; peste normă, diferența este plătită ca ore suplimentare.`,
  oreLucrate: "Ore lucrate",
  sporOreSupl: "Spor ore supl.",
  sporExplicatie:
    "Sporul legal minim la ore suplimentare e 75% (Codul Muncii art. 123). Sporurile brute se taxează ca salariul.",
  sporuriPrime: "Sporuri și prime (brute)",
  retineri: "Rețineri (avans, popriri)",
  retineriExplicatie: "Se scad la final, din netul de plată.",
  tichetePeLuna: "Tichete / lună",
  valoareTichet: "Valoare / tichet",
  tichetExplicatie: "Cel mult un tichet pe zi lucrată · maxim legal 45 lei/tichet (Legea 201/2025).",
  tichetTotal: "Total:",
  persoaneIntretinere: "Persoane în întreținere",
  persoana: "persoană",
  persoane: "persoane",
  copiiScolari: "Dintre care, copii minori școlari",
  functieDeBaza: "Funcție de bază (jobul principal)",
  varstaSub26: "Vârstă sub 26 ani",
  scutitImpozit: "Scutit de impozit (de exemplu, handicap)",

  rezultatCalcul: "Rezultat calcul",
  fluturasDeSalariu: "Fluturaș de salariu",
  staleInainte: "Ai modificat datele – apasă ",
  staleDupa: " pentru a actualiza rezultatul.",
  eticheta: "Element",
  suma: "Sumă",

  salariuDeBazaIncadrare: "Salariu de bază (încadrare)",
  oreStandard: (ore) => `Ore standard (${ore} ore/lună)`,
  oreSuplimentare: "Ore suplimentare",
  sporuriPrimeRand: "Sporuri și prime (brute)",
  venitBrutTotal: "Venit brut total",
  tichete: "Tichete de masă",
  sumaNetaxabila: "Sumă netaxabilă salariu minim (OUG 89/2025)",
  casPensie: "CAS (pensie – 25%)",
  cassSanatate: "CASS (sănătate – 10%)",
  deducerePersonala: "Deducere personală (netaxabilă)",
  bazaImpozit: "Baza de calcul impozit",
  impozitVenit: "Impozit pe venit (10%)",
  scutit: "0 lei (scutit)",
  totalRetineri: "Total rețineri",
  totalRetineriAngajat: "Total rețineri angajat",
  restDePlata: "Rest de plată",
  retineriRand: "Rețineri (avans, popriri)",
  tichetePeCard: "Tichete de masă (pe card, valoare integrală)",
  notaTichete:
    "E normal ca banii din cont să coboare sub netul standard al salariului: taxele pe tichete (CASS + impozit) se opresc din salariul în bani, iar tichetele intră integral pe card. Așa apare și pe fluturaș.",

  salariuIncadrareBrut: "Salariu de încadrare (Brut)",
  facilitateFiscala: "Facilitate fiscală (neimpozabilă)",
  deducereAplicata: "Deducere personală (aplicată)",

  costAngajator: "Cost angajator",
  camAngajator: "CAM (2,25%)",
  costTotal: "Cost total angajator",
  bara: (angajat, stat) =>
    `Din costul total al firmei, ${angajat}% ajunge la angajat (salariu net) și ${stat}% la stat (CAS, CASS, impozit, CAM).`,
  baraNota: "Din costul total al firmei: cât ajunge la tine (net) și cât la stat (CAS, CASS, impozit, CAM).",

  descarcaPdf: "↓ Descarcă fluturaș PDF",
  seGenereaza: "Se generează…",
  pdfDescarcat: "PDF descărcat.",
  pdfEroare: "PDF-ul nu a putut fi generat. Încearcă din nou.",
  copiazaLink: "⧉ Copiază linkul calculului",
  linkCopiat: "✓ Link copiat",

  gol: "Completează salariul pentru a vedea rezultatul · Grila fiscală 2026",
  golFluturas: "Completează salariul brut pentru a genera fluturașul · Grila fiscală 2026",
  notaIstoric:
    "Calcul istoric pentru ianuarie–iunie 2026. Fluturașul PDF este disponibil numai pentru grila fiscală curentă.",

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
  ore: "hours",

  acasa: "Home",
  breadcrumbFluturas: "Payslip",
  breadcrumbCalculator: "Salary calculator",
  titlu: "Romanian Salary Calculator 2026",
  subtitluInainteLink:
    "Gross to net salary in Romania: enter the gross and see what you take home, with pension, health contributions, income tax and the total employer cost, under ",
  subtitluIntreLinkuri: " and ",
  subtitluDupaLink: ". It works the other way round too, from net to gross.",
  ultimaActualizare: "Last updated: 26 July 2026",

  dateSalariale: "Salary details",
  directieCalcul: "Calculation direction",
  dinBrutInNet: "Gross to net",
  dinNetInBrut: "Net to gross",
  salariuDeBazaBrut: "Base salary (gross)",
  salariuBrut: "Gross salary",
  salariuNet: "Net salary",
  exemplu: "e.g.",
  eroareSalariuGol: "Enter a salary first.",
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
  copiiScolari: "Of which, school-age children",
  functieDeBaza: "Main employer (primary job)",
  varstaSub26: "Under 26 years old",
  scutitImpozit: "Exempt from income tax (for example, disability)",

  rezultatCalcul: "Result",
  fluturasDeSalariu: "Payslip",
  staleInainte: "You changed the inputs – press ",
  staleDupa: " to refresh the result.",
  eticheta: "Item",
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

  gol: "Enter a salary to see the result · 2026 tax rules",
  golFluturas: "Enter the gross salary to generate the payslip · 2026 tax rules",
  notaIstoric:
    "Historical calculation for January–June 2026. The PDF payslip is available only for the current tax rules.",

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
