// src/lib/meserii.ts
// Catalogul de meserii pentru /salarii si /compara.
//
// PRINCIPIUL PAGINILOR: INS nu publica salarii medii pe ocupatii individuale.
// Publica doua lucruri diferite, si le tinem separate peste tot:
//   1. castigul mediu din ACTIVITATEA angajatorului (CAEN) — lunar, proaspat;
//   2. castigul mediu al GRUPEI MAJORE DE OCUPATII (ISCO-08) — anual, din
//      ancheta din octombrie, cu defalcare pe varste.
// O meserie e legata de amandoua, iar pagina spune explicit ce e fiecare cifra.
// Nu inventam „salariul de programator" ca si cum ar fi masurat direct.

import { calculStandard } from "@/lib/fiscal";
import {
  activitate,
  grupaIsco,
  judetePentru,
  nationalJudete,
  type ActivitateCaen,
  type DateGrupaIsco,
  type GrupaIsco,
  type ValoareJudet,
} from "@/lib/ins-date";

export type CategorieMeserii = {
  slug: string;
  nume: string;
  descriere: string;
};

export const CATEGORII: CategorieMeserii[] = [
  { slug: "it", nume: "IT și telecomunicații", descriere: "Programare, servicii informatice, telecom." },
  { slug: "medical", nume: "Medical și farmaceutic", descriere: "Sănătate umană, farmacie, asistență socială." },
  { slug: "educatie", nume: "Educație și cercetare", descriere: "Învățământ de toate nivelurile și cercetare-dezvoltare." },
  { slug: "finante", nume: "Finanțe, bănci și asigurări", descriere: "Intermedieri financiare, asigurări, contabilitate." },
  { slug: "juridic", nume: "Juridic", descriere: "Activități juridice și de contabilitate." },
  { slug: "inginerie", nume: "Inginerie și arhitectură", descriere: "Proiectare, testări tehnice, arhitectură." },
  { slug: "constructii", nume: "Construcții", descriere: "Clădiri, geniu civil, lucrări speciale." },
  { slug: "industrie", nume: "Industrie și producție", descriere: "Industria prelucrătoare și extractivă." },
  { slug: "transport", nume: "Transport și logistică", descriere: "Rutier, feroviar, aerian, curierat, depozitare." },
  { slug: "comert", nume: "Comerț", descriere: "Comerț cu ridicata și cu amănuntul." },
  { slug: "horeca", nume: "HoReCa și turism", descriere: "Hoteluri, restaurante, agenții de turism." },
  { slug: "public", nume: "Administrație publică și ordine", descriere: "Administrație, apărare, ordine publică." },
  { slug: "media", nume: "Media, creație și marketing", descriere: "Editare, producție audiovizuală, publicitate, design." },
  { slug: "agricultura", nume: "Agricultură și silvicultură", descriere: "Cultură, creștere animale, exploatare forestieră." },
  { slug: "utilitati", nume: "Utilități și mediu", descriere: "Energie, apă, salubritate, decontaminare." },
  { slug: "servicii", nume: "Servicii și suport", descriere: "Pază, curățenie, secretariat, servicii personale." },
];

export type Meserie = {
  slug: string;
  nume: string;
  /** Forma folosita in fraze: „salariul unui <de>". */
  de: string;
  categorie: string;
  /** Cheia activitatii CAEN Rev.3 — seria lunara nationala. */
  caen3: string;
  /** Cheia activitatii CAEN Rev.2 — defalcarea pe judete. */
  caen2: string;
  /** Grupa majora de ocupatii ISCO-08 in care se incadreaza meseria. */
  isco: GrupaIsco;
  /** Codul COR, unde e stabil si verificabil. */
  cor?: string;
  ceFace: string;
  /** Avertisment cand sectorul CAEN acopera mult mai mult decat meseria. */
  nota?: string;
};

export const MESERII: Meserie[] = [
  // ─── IT și telecomunicații ─────────────────────────────────────────────────
  { slug: "programator", nume: "Programator", de: "programator", categorie: "it", caen3: "62", caen2: "62-63", isco: "specialisti", cor: "251201",
    ceFace: "Scrie și întreține cod pentru aplicații web, mobile sau de întreprindere, de obicei într-o echipă cu testeri, designeri și un product owner." },
  { slug: "web-developer", nume: "Web developer", de: "web developer", categorie: "it", caen3: "62", caen2: "62-63", isco: "specialisti", cor: "251401",
    ceFace: "Construiește interfețe și servicii web, de la componente de front-end până la integrarea cu API-uri și baze de date." },
  { slug: "tester-qa", nume: "Tester QA", de: "tester QA", categorie: "it", caen3: "62", caen2: "62-63", isco: "specialisti", cor: "251903",
    ceFace: "Verifică software-ul înainte de livrare, manual și prin teste automate, și documentează defectele găsite." },
  { slug: "devops-engineer", nume: "Inginer DevOps", de: "inginer DevOps", categorie: "it", caen3: "62", caen2: "62-63", isco: "specialisti", cor: "252901",
    ceFace: "Automatizează build-ul, livrarea și monitorizarea aplicațiilor și administrează infrastructura cloud pe care rulează." },
  { slug: "administrator-sistem", nume: "Administrator de sistem", de: "administrator de sistem", categorie: "it", caen3: "62", caen2: "62-63", isco: "specialisti", cor: "252101",
    ceFace: "Ține în funcțiune serverele, rețeaua și conturile dintr-o organizație și răspunde de backup și securitate." },
  { slug: "analist-date", nume: "Analist de date", de: "analist de date", categorie: "it", caen3: "63", caen2: "62-63", isco: "specialisti", cor: "252901",
    ceFace: "Transformă date brute în rapoarte și modele pe care se iau decizii de business." },
  { slug: "inginer-telecomunicatii", nume: "Inginer telecomunicații", de: "inginer telecomunicații", categorie: "it", caen3: "61", caen2: "61", isco: "specialisti", cor: "215201",
    ceFace: "Proiectează și întreține rețele de voce și date, de la fibră optică la echipamente radio." },

  // ─── Medical și farmaceutic ────────────────────────────────────────────────
  { slug: "medic", nume: "Medic", de: "medic", categorie: "medical", caen3: "86", caen2: "Q", isco: "specialisti", cor: "221101",
    ceFace: "Diagnostichează și tratează pacienți, în spital sau în ambulatoriu, pe o specialitate confirmată." },
  { slug: "asistent-medical", nume: "Asistent medical", de: "asistent medical", categorie: "medical", caen3: "86", caen2: "Q", isco: "tehnicieni", cor: "325901",
    ceFace: "Administrează tratamente, monitorizează pacienții și asistă medicul în proceduri." },
  { slug: "stomatolog", nume: "Stomatolog", de: "stomatolog", categorie: "medical", caen3: "86", caen2: "Q", isco: "specialisti", cor: "226101",
    ceFace: "Tratează afecțiuni dentare, de la profilaxie și obturații până la protetică și chirurgie orală." },
  { slug: "farmacist", nume: "Farmacist", de: "farmacist", categorie: "medical", caen3: "47", caen2: "G", isco: "specialisti", cor: "226201",
    ceFace: "Eliberează și consiliază medicația într-o farmacie de circuit deschis sau de spital.",
    nota: "Majoritatea farmaciilor sunt încadrate la comerț cu amănuntul, așa că media sectorului include și personalul de vânzare, nu doar farmaciștii." },
  { slug: "farmacist-industrie", nume: "Farmacist în industrie", de: "farmacist în industrie", categorie: "medical", caen3: "21", caen2: "21", isco: "specialisti", cor: "226205",
    ceFace: "Lucrează în producția sau controlul calității medicamentelor, în fabrici de produse farmaceutice." },
  { slug: "psiholog", nume: "Psiholog", de: "psiholog", categorie: "medical", caen3: "86", caen2: "Q", isco: "specialisti", cor: "263401",
    ceFace: "Evaluează și tratează probleme psihologice, în cabinet, în spital sau în organizații." },
  { slug: "fizioterapeut", nume: "Fizioterapeut", de: "fizioterapeut", categorie: "medical", caen3: "86", caen2: "Q", isco: "specialisti", cor: "226402",
    ceFace: "Recuperează funcția motorie după traume, operații sau boli cronice, prin programe de kinetoterapie." },
  { slug: "infirmier", nume: "Infirmier", de: "infirmier", categorie: "medical", caen3: "87", caen2: "Q", isco: "servicii", cor: "532103",
    ceFace: "Asigură igiena, hrănirea și mobilizarea pacienților internați sau a persoanelor îngrijite la domiciliu." },
  { slug: "medic-veterinar", nume: "Medic veterinar", de: "medic veterinar", categorie: "medical", caen3: "75", caen2: "M", isco: "specialisti", cor: "225101",
    ceFace: "Tratează animale de companie sau de fermă și avizează sănătatea efectivelor și siguranța alimentară." },

  // ─── Educație și cercetare ─────────────────────────────────────────────────
  { slug: "profesor", nume: "Profesor", de: "profesor", categorie: "educatie", caen3: "Q", caen2: "P", isco: "specialisti", cor: "233002",
    ceFace: "Predă o disciplină în învățământul gimnazial sau liceal și evaluează elevii pe parcursul anului școlar." },
  { slug: "invatator", nume: "Învățător", de: "învățător", categorie: "educatie", caen3: "Q", caen2: "P", isco: "specialisti", cor: "234101",
    ceFace: "Conduce o clasă de învățământ primar, la toate materiile din programă." },
  { slug: "educator", nume: "Educator", de: "educator", categorie: "educatie", caen3: "Q", caen2: "P", isco: "specialisti", cor: "234201",
    ceFace: "Se ocupă de grupa de grădiniță: activități de învățare, joc structurat și relația cu părinții." },
  { slug: "profesor-universitar", nume: "Profesor universitar", de: "profesor universitar", categorie: "educatie", caen3: "Q", caen2: "P", isco: "specialisti", cor: "231001",
    ceFace: "Predă și coordonează cercetare într-o universitate, pe o poziție obținută prin concurs." },
  { slug: "cercetator", nume: "Cercetător", de: "cercetător", categorie: "educatie", caen3: "72", caen2: "72", isco: "specialisti", cor: "214601",
    ceFace: "Lucrează în proiecte de cercetare-dezvoltare, în institute publice sau în departamente de R&D private." },
  { slug: "instructor-auto", nume: "Instructor auto", de: "instructor auto", categorie: "educatie", caen3: "Q", caen2: "P", isco: "tehnicieni", cor: "235501",
    ceFace: "Pregătește candidații pentru permisul de conducere, în școli de șoferi autorizate." },

  // ─── Finanțe, bănci și asigurări ───────────────────────────────────────────
  { slug: "contabil", nume: "Contabil", de: "contabil", categorie: "finante", caen3: "69", caen2: "M", isco: "specialisti", cor: "241102",
    ceFace: "Ține evidența contabilă, întocmește declarațiile fiscale și pregătește situațiile financiare." },
  { slug: "auditor", nume: "Auditor financiar", de: "auditor financiar", categorie: "finante", caen3: "69", caen2: "M", isco: "specialisti", cor: "241103",
    ceFace: "Verifică independent situațiile financiare ale unei entități și emite o opinie de audit." },
  { slug: "analist-financiar", nume: "Analist financiar", de: "analist financiar", categorie: "finante", caen3: "64", caen2: "64", isco: "specialisti", cor: "241304",
    ceFace: "Analizează performanța financiară, construiește modele și fundamentează decizii de investiție sau creditare." },
  { slug: "ofiter-credite", nume: "Ofițer de credite", de: "ofițer de credite", categorie: "finante", caen3: "64", caen2: "64", isco: "tehnicieni", cor: "331101",
    ceFace: "Analizează dosarele de credit ale clienților unei bănci și urmărește portofoliul acordat." },
  { slug: "agent-asigurari", nume: "Agent de asigurări", de: "agent de asigurări", categorie: "finante", caen3: "65", caen2: "65", isco: "tehnicieni", cor: "332102",
    ceFace: "Vinde polițe de asigurare și asistă clienții la constatarea și dosarul de daună." },
  { slug: "broker", nume: "Broker", de: "broker", categorie: "finante", caen3: "66", caen2: "66", isco: "tehnicieni", cor: "331201",
    ceFace: "Intermediază tranzacții financiare sau polițe în numele clienților, contra unui comision." },
  { slug: "consultant-financiar", nume: "Consultant financiar", de: "consultant financiar", categorie: "finante", caen3: "66", caen2: "66", isco: "specialisti", cor: "241202",
    ceFace: "Consiliază persoane sau firme pe economisire, investiții, finanțare și structuri fiscale." },

  // ─── Juridic ───────────────────────────────────────────────────────────────
  { slug: "avocat", nume: "Avocat", de: "avocat", categorie: "juridic", caen3: "69", caen2: "M", isco: "specialisti", cor: "261103",
    ceFace: "Reprezintă și consiliază clienți în fața instanțelor și în negocieri, într-un cabinet sau într-o societate de avocatură." },
  { slug: "notar", nume: "Notar", de: "notar", categorie: "juridic", caen3: "69", caen2: "M", isco: "specialisti", cor: "261104",
    ceFace: "Autentifică acte, succesiuni și tranzacții imobiliare într-un birou notarial." },
  { slug: "consilier-juridic", nume: "Consilier juridic", de: "consilier juridic", categorie: "juridic", caen3: "69", caen2: "M", isco: "specialisti", cor: "261103",
    ceFace: "Asigură asistența juridică internă a unei companii sau instituții: contracte, conformare, litigii." },

  // ─── Inginerie și arhitectură ──────────────────────────────────────────────
  { slug: "inginer", nume: "Inginer", de: "inginer", categorie: "inginerie", caen3: "71", caen2: "M", isco: "specialisti", cor: "214999",
    ceFace: "Proiectează, calculează și verifică soluții tehnice, în firme de proiectare sau în departamente tehnice." },
  { slug: "arhitect", nume: "Arhitect", de: "arhitect", categorie: "inginerie", caen3: "71", caen2: "M", isco: "specialisti", cor: "216101",
    ceFace: "Proiectează clădiri și ansambluri, obține avizele și urmărește execuția pe șantier." },
  { slug: "inginer-electronist", nume: "Inginer electronist", de: "inginer electronist", categorie: "inginerie", caen3: "26", caen2: "26", isco: "specialisti", cor: "215101",
    ceFace: "Proiectează și testează circuite și echipamente electronice, de la plăci la sisteme complete." },
  { slug: "inginer-auto", nume: "Inginer auto", de: "inginer auto", categorie: "inginerie", caen3: "29", caen2: "29", isco: "specialisti", cor: "214402",
    ceFace: "Lucrează la proiectarea, testarea sau industrializarea componentelor și vehiculelor." },
  { slug: "inginer-energetician", nume: "Inginer energetician", de: "inginer energetician", categorie: "inginerie", caen3: "D", caen2: "D", isco: "specialisti", cor: "215104",
    ceFace: "Se ocupă de producția, transportul și distribuția energiei electrice și termice." },
  { slug: "inginer-petrol", nume: "Inginer petrolist", de: "inginer petrolist", categorie: "inginerie", caen3: "06", caen2: "06", isco: "specialisti", cor: "214601",
    ceFace: "Lucrează la extracția și procesarea țițeiului și gazelor naturale, pe sonde sau în instalații." },
  { slug: "inginer-agronom", nume: "Inginer agronom", de: "inginer agronom", categorie: "agricultura", caen3: "01", caen2: "01", isco: "specialisti", cor: "213201",
    ceFace: "Planifică tehnologiile de cultură, tratamentele și recolta pentru o exploatație agricolă." },

  // ─── Construcții ───────────────────────────────────────────────────────────
  { slug: "constructor", nume: "Muncitor în construcții", de: "muncitor în construcții", categorie: "constructii", caen3: "41", caen2: "F", isco: "muncitori", cor: "711901",
    ceFace: "Execută lucrări de structură și finisaje pe șantiere de clădiri rezidențiale sau industriale." },
  { slug: "zidar", nume: "Zidar", de: "zidar", categorie: "constructii", caen3: "41", caen2: "F", isco: "muncitori", cor: "711204",
    ceFace: "Ridică zidării și pereți portanți și execută tencuieli de bază." },
  { slug: "dulgher", nume: "Dulgher", de: "dulgher", categorie: "constructii", caen3: "41", caen2: "F", isco: "muncitori", cor: "711501",
    ceFace: "Realizează cofraje, șarpante și structuri de lemn pe șantier." },
  { slug: "electrician", nume: "Electrician", de: "electrician", categorie: "constructii", caen3: "43", caen2: "F", isco: "muncitori", cor: "741101",
    ceFace: "Montează și repară instalații electrice în clădiri și în hale industriale." },
  { slug: "instalator", nume: "Instalator", de: "instalator", categorie: "constructii", caen3: "43", caen2: "F", isco: "muncitori", cor: "712601",
    ceFace: "Execută instalații sanitare, de încălzire și de gaze și intervine la avarii." },
  { slug: "zugrav", nume: "Zugrav", de: "zugrav", categorie: "constructii", caen3: "43", caen2: "F", isco: "muncitori", cor: "713101",
    ceFace: "Pregătește suprafețele și aplică finisajele decorative interioare și exterioare." },
  { slug: "faiantar", nume: "Faianțar", de: "faianțar", categorie: "constructii", caen3: "43", caen2: "F", isco: "muncitori", cor: "712201",
    ceFace: "Montează plăci ceramice pe pardoseli și pereți și execută hidroizolațiile de sub ele." },
  { slug: "sudor", nume: "Sudor", de: "sudor", categorie: "constructii", caen3: "25", caen2: "25", isco: "muncitori", cor: "721208",
    ceFace: "Îmbină piese metalice prin sudură, pe baza unui procedeu calificat și a documentației tehnice." },
  { slug: "tamplar", nume: "Tâmplar", de: "tâmplar", categorie: "constructii", caen3: "16", caen2: "16", isco: "muncitori", cor: "752201",
    ceFace: "Prelucrează lemnul și produce mobilier, uși sau ferestre, în atelier sau la comandă." },

  // ─── Industrie și producție ────────────────────────────────────────────────
  { slug: "operator-productie", nume: "Operator producție", de: "operator producție", categorie: "industrie", caen3: "C", caen2: "C", isco: "operatori", cor: "817102",
    ceFace: "Deservește utilaje pe o linie de fabricație și răspunde de ritm, calitate și raportarea producției." },
  { slug: "mecanic-auto", nume: "Mecanic auto", de: "mecanic auto", categorie: "industrie", caen3: "G", caen2: "G", isco: "muncitori", cor: "723103",
    ceFace: "Diagnostichează și repară autovehicule în service-uri independente sau de rețea.",
    nota: "Service-urile auto sunt încadrate în secțiunea de comerț, împreună cu comerțul cu ridicata și cu amănuntul." },
  { slug: "tehnician-mentenanta", nume: "Tehnician mentenanță", de: "tehnician mentenanță", categorie: "industrie", caen3: "33", caen2: "33", isco: "tehnicieni", cor: "313101",
    ceFace: "Face mentenanța preventivă și intervențiile la utilajele dintr-o fabrică." },
  { slug: "metalurgist", nume: "Metalurgist", de: "metalurgist", categorie: "industrie", caen3: "24", caen2: "24", isco: "operatori", cor: "812101",
    ceFace: "Lucrează la elaborarea și prelucrarea metalelor: turnare, laminare, tratamente termice." },
  { slug: "miner", nume: "Miner", de: "miner", categorie: "industrie", caen3: "05", caen2: "05", isco: "operatori", cor: "811101",
    ceFace: "Execută lucrări de extracție în subteran sau în carieră, cu utilaje specifice." },
  { slug: "croitor", nume: "Croitor", de: "croitor", categorie: "industrie", caen3: "14", caen2: "14", isco: "operatori", cor: "753105",
    ceFace: "Croiește și coase articole de îmbrăcăminte, în producție de serie sau la comandă." },
  { slug: "muncitor-industria-alimentara", nume: "Muncitor în industria alimentară", de: "muncitor în industria alimentară", categorie: "industrie", caen3: "10", caen2: "10", isco: "operatori", cor: "751101",
    ceFace: "Lucrează pe fluxul de procesare, ambalare și control al produselor alimentare." },
  { slug: "cofetar", nume: "Cofetar", de: "cofetar", categorie: "industrie", caen3: "10", caen2: "10", isco: "muncitori", cor: "751201",
    ceFace: "Prepară produse de patiserie și cofetărie, în laborator propriu sau în producție." },

  // ─── Transport și logistică ────────────────────────────────────────────────
  { slug: "sofer-tir", nume: "Șofer TIR", de: "șofer de TIR", categorie: "transport", caen3: "49", caen2: "49", isco: "operatori", cor: "833201",
    ceFace: "Conduce autovehicule grele pe curse interne sau internaționale și răspunde de marfă și de documente." },
  { slug: "sofer-autobuz", nume: "Șofer de autobuz", de: "șofer de autobuz", categorie: "transport", caen3: "49", caen2: "49", isco: "operatori", cor: "833101",
    ceFace: "Transportă călători pe trasee urbane sau interurbane, după un grafic fix." },
  { slug: "taximetrist", nume: "Taximetrist", de: "taximetrist", categorie: "transport", caen3: "49", caen2: "49", isco: "operatori", cor: "832201",
    ceFace: "Transportă clienți pe distanțe scurte, în regim de taxi sau prin platforme de ride-hailing." },
  { slug: "mecanic-locomotiva", nume: "Mecanic de locomotivă", de: "mecanic de locomotivă", categorie: "transport", caen3: "49", caen2: "49", isco: "operatori", cor: "831201",
    ceFace: "Conduce trenuri de marfă sau de călători și răspunde de siguranța circulației." },
  { slug: "curier", nume: "Curier", de: "curier", categorie: "transport", caen3: "53", caen2: "53", isco: "operatori", cor: "962101",
    ceFace: "Livrează colete pe o rută zilnică și gestionează ramburs, retururi și confirmări." },
  { slug: "postas", nume: "Poștaș", de: "poștaș", categorie: "transport", caen3: "53", caen2: "53", isco: "functionari", cor: "432101",
    ceFace: "Distribuie corespondența și pensiile pe un sector și încasează plăți la domiciliu." },
  { slug: "pilot", nume: "Pilot", de: "pilot", categorie: "transport", caen3: "51", caen2: "51", isco: "specialisti", cor: "315301",
    ceFace: "Operează aeronave comerciale pe rute programate, cu licență și verificări periodice." },
  { slug: "insotitor-de-bord", nume: "Însoțitor de bord", de: "însoțitor de bord", categorie: "transport", caen3: "51", caen2: "51", isco: "servicii", cor: "511101",
    ceFace: "Asigură siguranța și serviciul la bordul aeronavei, pe toată durata zborului." },
  { slug: "logistician", nume: "Logistician", de: "logistician", categorie: "transport", caen3: "52", caen2: "52", isco: "specialisti", cor: "333905",
    ceFace: "Planifică fluxul de mărfuri între furnizori, depozite și clienți și optimizează costul de transport." },

  // ─── Comerț ────────────────────────────────────────────────────────────────
  { slug: "vanzator", nume: "Vânzător", de: "vânzător", categorie: "comert", caen3: "47", caen2: "G", isco: "servicii", cor: "522101",
    ceFace: "Consiliază clienții în magazin, aranjează raftul și încasează." },
  { slug: "casier", nume: "Casier", de: "casier", categorie: "comert", caen3: "47", caen2: "G", isco: "servicii", cor: "523001",
    ceFace: "Operează casa de marcat, gestionează numerarul și emite bonurile fiscale." },
  { slug: "manager-magazin", nume: "Manager de magazin", de: "manager de magazin", categorie: "comert", caen3: "47", caen2: "G", isco: "conducatori", cor: "142001",
    ceFace: "Răspunde de vânzări, stocuri, program și echipa unui punct de lucru." },
  { slug: "agent-vanzari", nume: "Agent de vânzări", de: "agent de vânzări", categorie: "comert", caen3: "46", caen2: "G", isco: "tehnicieni", cor: "332203",
    ceFace: "Dezvoltă și menține un portofoliu de clienți B2B, cu țintă de vânzare și rută proprie." },

  // ─── HoReCa și turism ──────────────────────────────────────────────────────
  { slug: "bucatar", nume: "Bucătar", de: "bucătar", categorie: "horeca", caen3: "56", caen2: "I", isco: "servicii", cor: "512001",
    ceFace: "Pregătește preparatele din meniu și răspunde de gramaje, gestiune și normele de igienă." },
  { slug: "chelner", nume: "Chelner", de: "chelner", categorie: "horeca", caen3: "56", caen2: "I", isco: "servicii", cor: "513102",
    ceFace: "Preia comenzile, servește și încasează, într-un restaurant sau într-o unitate de alimentație." },
  { slug: "barman", nume: "Barman", de: "barman", categorie: "horeca", caen3: "56", caen2: "I", isco: "servicii", cor: "513202",
    ceFace: "Prepară și servește băuturi și răspunde de gestiunea barului." },
  { slug: "receptioner-hotel", nume: "Recepționer hotel", de: "recepționer de hotel", categorie: "horeca", caen3: "55", caen2: "I", isco: "servicii", cor: "422401",
    ceFace: "Face check-in și check-out, rezervări și facturare și rezolvă solicitările oaspeților." },
  { slug: "agent-turism", nume: "Agent de turism", de: "agent de turism", categorie: "horeca", caen3: "79", caen2: "N", isco: "tehnicieni", cor: "422101",
    ceFace: "Construiește și vinde pachete de călătorie și gestionează rezervările clienților." },

  // ─── Administrație publică și ordine ───────────────────────────────────────
  { slug: "functionar-public", nume: "Funcționar public", de: "funcționar public", categorie: "public", caen3: "P", caen2: "O", isco: "functionari", cor: "411001",
    ceFace: "Instrumentează dosare și lucrări într-o instituție publică, pe o funcție obținută prin concurs." },
  { slug: "politist", nume: "Polițist", de: "polițist", categorie: "public", caen3: "P", caen2: "O", isco: "servicii", cor: "541101",
    ceFace: "Asigură ordinea publică, constată contravenții și infracțiuni și participă la anchete." },
  { slug: "pompier", nume: "Pompier", de: "pompier", categorie: "public", caen3: "P", caen2: "O", isco: "servicii", cor: "541102",
    ceFace: "Intervine la incendii, accidente și situații de urgență, în ture de serviciu." },
  { slug: "militar", nume: "Militar", de: "militar", categorie: "public", caen3: "P", caen2: "O", isco: "servicii", cor: "031101",
    ceFace: "Servește într-o structură a apărării, pe o funcție de soldat, subofițer sau ofițer." },

  // ─── Media, creație și marketing ───────────────────────────────────────────
  { slug: "jurnalist", nume: "Jurnalist", de: "jurnalist", categorie: "media", caen3: "60", caen2: "59-60", isco: "specialisti", cor: "264201",
    ceFace: "Documentează, verifică și publică materiale de presă, pentru televiziune, radio sau online." },
  { slug: "editor", nume: "Editor", de: "editor", categorie: "media", caen3: "58", caen2: "58", isco: "specialisti", cor: "264202",
    ceFace: "Selectează, corectează și pregătește pentru publicare textele dintr-o redacție sau editură." },
  { slug: "cameraman", nume: "Cameraman", de: "cameraman", categorie: "media", caen3: "59", caen2: "59-60", isco: "tehnicieni", cor: "352101",
    ceFace: "Filmează pentru producții TV, film sau conținut online și răspunde de imagine și lumină." },
  { slug: "regizor", nume: "Regizor", de: "regizor", categorie: "media", caen3: "59", caen2: "59-60", isco: "specialisti", cor: "265601",
    ceFace: "Conduce viziunea artistică și echipa unei producții de film, teatru sau televiziune." },
  { slug: "designer-grafic", nume: "Designer grafic", de: "designer grafic", categorie: "media", caen3: "73", caen2: "M", isco: "specialisti", cor: "216601",
    ceFace: "Creează identități vizuale, materiale de comunicare și interfețe, într-o agenție sau in-house." },
  { slug: "specialist-marketing", nume: "Specialist marketing", de: "specialist marketing", categorie: "media", caen3: "73", caen2: "M", isco: "specialisti", cor: "243102",
    ceFace: "Planifică și măsoară campanii, conținut și canale, cu buget și obiective de conversie." },
  { slug: "traducator", nume: "Traducător", de: "traducător", categorie: "media", caen3: "74", caen2: "M", isco: "specialisti", cor: "264301",
    ceFace: "Traduce texte scrise între limbi, uneori cu specializare juridică, tehnică sau medicală." },
  { slug: "actor", nume: "Actor", de: "actor", categorie: "media", caen3: "90", caen2: "R", isco: "specialisti", cor: "265501",
    ceFace: "Interpretează roluri în teatru, film sau televiziune, angajat sau pe producție." },
  { slug: "muzician", nume: "Muzician", de: "muzician", categorie: "media", caen3: "90", caen2: "R", isco: "specialisti", cor: "265201",
    ceFace: "Interpretează sau compune muzică, în ansambluri, orchestre sau proiecte proprii." },

  // ─── Agricultură și silvicultură ───────────────────────────────────────────
  { slug: "fermier", nume: "Fermier", de: "fermier", categorie: "agricultura", caen3: "01", caen2: "01", isco: "agricultura", cor: "611001",
    ceFace: "Administrează o exploatație agricolă: culturi, animale, utilaje și subvenții." },
  { slug: "silvicultor", nume: "Silvicultor", de: "silvicultor", categorie: "agricultura", caen3: "02", caen2: "02-03", isco: "tehnicieni", cor: "314101",
    ceFace: "Gestionează fondul forestier: regenerare, marcare, pază și exploatare." },

  // ─── Utilități și mediu ────────────────────────────────────────────────────
  { slug: "electrician-centrala", nume: "Electrician centrală electrică", de: "electrician de centrală electrică", categorie: "utilitati", caen3: "D", caen2: "D", isco: "operatori", cor: "313301",
    ceFace: "Operează și întreține echipamentele dintr-o centrală de producție sau o stație de transformare." },
  { slug: "operator-statie-apa", nume: "Operator stație de apă", de: "operator de stație de apă", categorie: "utilitati", caen3: "36", caen2: "36", isco: "operatori", cor: "313401",
    ceFace: "Supraveghează captarea, tratarea și distribuția apei potabile." },
  { slug: "operator-salubritate", nume: "Operator salubritate", de: "operator de salubritate", categorie: "utilitati", caen3: "38", caen2: "38-39", isco: "elementare", cor: "961301",
    ceFace: "Colectează și transportă deșeurile și deservește echipamentele de sortare." },

  // ─── Servicii și suport ────────────────────────────────────────────────────
  { slug: "agent-paza", nume: "Agent de pază", de: "agent de pază", categorie: "servicii", caen3: "80", caen2: "N", isco: "servicii", cor: "541401",
    ceFace: "Asigură paza unui obiectiv, controlul accesului și intervenția la alarmă." },
  { slug: "agent-curatenie", nume: "Agent de curățenie", de: "agent de curățenie", categorie: "servicii", caen3: "81", caen2: "N", isco: "elementare", cor: "911201",
    ceFace: "Face curățenia în clădiri de birouri, spații comerciale sau industriale." },
  { slug: "operator-call-center", nume: "Operator call center", de: "operator de call center", categorie: "servicii", caen3: "82", caen2: "N", isco: "functionari", cor: "422201",
    ceFace: "Preia apeluri și mesaje de la clienți, rezolvă solicitări și înregistrează tichete." },
  { slug: "secretar", nume: "Secretar", de: "secretar", categorie: "servicii", caen3: "82", caen2: "N", isco: "functionari", cor: "412001",
    ceFace: "Gestionează agenda, corespondența și documentele unui departament sau ale conducerii." },
  { slug: "specialist-resurse-umane", nume: "Specialist resurse umane", de: "specialist resurse umane", categorie: "servicii", caen3: "78", caen2: "N", isco: "specialisti", cor: "242314",
    ceFace: "Recrutează, administrează contractele și susține politicile de personal ale organizației." },
  { slug: "agent-imobiliar", nume: "Agent imobiliar", de: "agent imobiliar", categorie: "servicii", caen3: "M", caen2: "L", isco: "tehnicieni", cor: "333401",
    ceFace: "Intermediază vânzări și închirieri de proprietăți și pregătește documentația tranzacției." },
  { slug: "frizer", nume: "Frizer", de: "frizer", categorie: "servicii", caen3: "96", caen2: "S", isco: "servicii", cor: "514101",
    ceFace: "Tunde și aranjează părul, în salon propriu sau ca angajat." },
  { slug: "cosmetician", nume: "Cosmetician", de: "cosmetician", categorie: "servicii", caen3: "96", caen2: "S", isco: "servicii", cor: "514201",
    ceFace: "Execută tratamente de îngrijire a tenului și proceduri estetice neinvazive." },
  { slug: "bibliotecar", nume: "Bibliotecar", de: "bibliotecar", categorie: "servicii", caen3: "91", caen2: "R", isco: "specialisti", cor: "262101",
    ceFace: "Organizează colecțiile și accesul publicului într-o bibliotecă sau într-un centru de documentare." },
  { slug: "antrenor-sportiv", nume: "Antrenor sportiv", de: "antrenor sportiv", categorie: "servicii", caen3: "93", caen2: "R", isco: "specialisti", cor: "342201",
    ceFace: "Pregătește sportivi sau grupe de amatori și planifică antrenamentele și competițiile." },
];

const INDEX_MESERII = new Map(MESERII.map((m) => [m.slug, m]));

export function getMeserie(slug: string): Meserie | undefined {
  return INDEX_MESERII.get(slug);
}

export function meseriiDinCategorie(categorie: string): Meserie[] {
  return MESERII.filter((m) => m.categorie === categorie);
}

export function getCategorie(slug: string): CategorieMeserii | undefined {
  return CATEGORII.find((c) => c.slug === slug);
}

// ─── Cifrele unei meserii ────────────────────────────────────────────────────

export type DateMeserie = {
  meserie: Meserie;
  categorie: CategorieMeserii;
  /** Activitatea CAEN Rev.3 in care e incadrat angajatorul tipic. */
  sector: ActivitateCaen;
  /** Netul standard calculat de noi din brutul sectorului. */
  netStandard: number;
  /** Netul mediu observat de INS in acelasi sector, in aceeasi luna. */
  netObservat: number | null;
  /** Grupa majora de ocupatii, cu evolutia pe varste. */
  isco: DateGrupaIsco | null;
  judete: ValoareJudet[];
  /** Valoarea nationala a aceleiasi serii anuale — baza fata de care se
   *  raporteaza abaterea fiecarui judet. */
  mediaJudete: number | null;
  /** Intervalul geografic real al sectorului: judetul cel mai bine si cel mai
   *  prost platit din aceeasi serie anuala. */
  interval: IntervalJudete | null;
  /** Locul sectorului in clasamentul celor MESERII.length meserii urmarite. */
  clasament: LocClasament | null;
};

/** Capetele intervalului pe judete — masuratoare reala, nu decile estimate. */
export type IntervalJudete = {
  minim: ValoareJudet;
  maxim: ValoareJudet;
  /** De cate ori e mai mare capatul de sus fata de cel de jos. */
  raport: number;
};

export type LocClasament = {
  /** Locul 1 = cea mai bine platita activitate din catalog. */
  loc: number;
  total: number;
  /** Cate meserii impart exact acelasi loc, pentru ca impart sectorul CAEN. */
  laEgalitate: number;
};

function intervalDinJudete(judete: ValoareJudet[]): IntervalJudete | null {
  if (judete.length < 2) return null;
  // `judetePentru` intoarce deja sortat descrescator.
  const maxim = judete[0];
  const minim = judete[judete.length - 1];
  if (minim.brut <= 0) return null;
  return { minim, maxim, raport: maxim.brut / minim.brut };
}

// Clasamentul se construieste o singura data, peste toate meseriile din
// catalog. Meseriile care impart acelasi CAEN impart si locul — nu le
// despartim artificial, pentru ca nu avem nicio masuratoare care sa le
// desparta. Numarul de meserii aflate la egalitate se afiseaza in pagina, ca
// cititorul sa stie ca locul e al sectorului, nu al ocupatiei.
const CLASAMENT: Map<string, LocClasament> = (() => {
  const brutPeCaen = new Map<string, number>();
  for (const meserie of MESERII) {
    if (brutPeCaen.has(meserie.caen3)) continue;
    const sector = activitate(meserie.caen3);
    if (sector) brutPeCaen.set(meserie.caen3, sector.brutCurent);
  }
  const ordonate = [...brutPeCaen.entries()].sort((a, b) => b[1] - a[1]);
  const locPeCaen = new Map(ordonate.map(([caen], index) => [caen, index + 1]));
  const cateMeseriiPeCaen = new Map<string, number>();
  for (const meserie of MESERII) {
    cateMeseriiPeCaen.set(meserie.caen3, (cateMeseriiPeCaen.get(meserie.caen3) ?? 0) + 1);
  }
  const rezultat = new Map<string, LocClasament>();
  for (const meserie of MESERII) {
    const loc = locPeCaen.get(meserie.caen3);
    if (!loc) continue;
    rezultat.set(meserie.slug, {
      loc,
      total: ordonate.length,
      laEgalitate: (cateMeseriiPeCaen.get(meserie.caen3) ?? 1) - 1,
    });
  }
  return rezultat;
})();

export function dateMeserie(meserie: Meserie): DateMeserie | null {
  const sector = activitate(meserie.caen3);
  const categorie = getCategorie(meserie.categorie);
  if (!sector || !categorie) return null;
  const rezultat = calculStandard(sector.brutCurent);
  const judete = judetePentru(meserie.caen2);
  return {
    meserie,
    categorie,
    sector,
    netStandard: rezultat?.net ?? 0,
    netObservat: sector.netCurent,
    isco: grupaIsco(meserie.isco),
    judete,
    mediaJudete: nationalJudete(meserie.caen2),
    interval: intervalDinJudete(judete),
    clasament: CLASAMENT.get(meserie.slug) ?? null,
  };
}

export function dateMeserieSauEroare(meserie: Meserie): DateMeserie {
  const date = dateMeserie(meserie);
  if (!date) throw new Error(`Meseria „${meserie.slug}" nu are date INS complete (CAEN ${meserie.caen3}).`);
  return date;
}

// ─── Comparații ──────────────────────────────────────────────────────────────
// Selectam numai perechi in care cele doua meserii cad in activitati CAEN
// diferite. O comparatie intre doua meserii din acelasi sector ar afisa aceeasi
// cifra de doua ori — exact genul de pagina goala pe care nu vrem sa o scriem.

const PERECHI: [string, string][] = [
  ["programator", "medic"],
  ["programator", "inginer"],
  ["programator", "profesor"],
  ["inginer", "contabil"],
  ["profesor", "contabil"],
  ["medic", "farmacist"],
  ["medic", "profesor"],
  ["avocat", "analist-financiar"],
  ["contabil", "analist-financiar"],
  ["asistent-medical", "invatator"],
  ["electrician", "sudor"],
  ["sofer-tir", "curier"],
  ["vanzator", "chelner"],
  ["bucatar", "operator-productie"],
  ["agent-paza", "agent-curatenie"],
  ["politist", "profesor"],
  ["functionar-public", "contabil"],
  ["arhitect", "inginer-electronist"],
  ["designer-grafic", "web-developer"],
  ["farmacist", "asistent-medical"],
  ["pilot", "mecanic-locomotiva"],
  ["fermier", "muncitor-industria-alimentara"],
  ["agent-imobiliar", "agent-vanzari"],
  ["secretar", "contabil"],
  ["operator-call-center", "vanzator"],
];

export type Comparatie = { slug: string; a: Meserie; b: Meserie };

export const COMPARATII: Comparatie[] = PERECHI.flatMap(([slugA, slugB]) => {
  const a = getMeserie(slugA);
  const b = getMeserie(slugB);
  if (!a || !b || a.caen3 === b.caen3) return [];
  return [{ slug: `${a.slug}-vs-${b.slug}`, a, b }];
});

export function getComparatie(slug: string): Comparatie | undefined {
  return COMPARATII.find((c) => c.slug === slug);
}

/** Alte comparatii care contin una dintre cele doua meserii. */
export function comparatiiInrudite(comparatie: Comparatie, limita = 4): Comparatie[] {
  return COMPARATII.filter(
    (c) =>
      c.slug !== comparatie.slug &&
      (c.a.slug === comparatie.a.slug ||
        c.b.slug === comparatie.a.slug ||
        c.a.slug === comparatie.b.slug ||
        c.b.slug === comparatie.b.slug),
  ).slice(0, limita);
}
