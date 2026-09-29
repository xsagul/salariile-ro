// Meseriile hubului de anunțuri (proprietar, 29 septembrie 2026): o listă separată de catalogul
// paginilor de salarii (src/lib/meserii.ts), fiindcă aici contează cum își scriu oamenii munca, nu
// ce susțin datele de salarii.
//
// Un grup e aceeași muncă spusă în mai multe feluri: „Ospătar”, „Chelner”. Fiecare formulare are
// adresa ei (/locuri-de-munca/ospatar, /locuri-de-munca/chelner), ca Google s-o găsească așa cum e
// căutată, dar listele unui grup se cumulează: la „chelner” apar și anunțurile puse la „ospătar”.
// Așa fac și OLX (q-ospatar), eJobs și Jooble. Primul nume din grup e cel mai căutat (SE Ranking,
// 29 septembrie 2026: „locuri de munca ospatar” 320/lună, „chelner” sub prag; „femeie de serviciu”
// 480, „agent curatenie” sub prag; „agent de paza” 390, „paznic” sub prag).
//
// Ce intră: titlurile frecvente din anunțurile citite (colectare/anunturi/vazute.txt, 6.935), ocupațiile
// cu cele mai multe oferte ANOFM (946 distincte, 8.776 de oferte pe 26 septembrie), subcategoriile OLX
// și meseriile din catalogul de salarii care se angajează prin anunț. Grupurile NU unesc munci
// diferite: „Ajutor ospătar” nu e „Ospătar”, „Menajeră” (în casă) nu e „Femeie de serviciu”.
// Funcțiile ocupate numai prin concurs (judecător, procuror, polițist) nu sunt aici.
import { faraDiacritice } from "./reguli";

const GRUPURI: string[][] = [
  // HoReCa
  ["Ospătar", "Chelner", "Ospătăriță"],
  ["Ajutor ospătar"],
  ["Barman", "Barmaniță"],
  ["Barista"],
  ["Bucătar", "Bucătăreasă"],
  ["Ajutor bucătar", "Lucrător bucătărie"],
  ["Spălător vase"],
  ["Pizzar"],
  ["Patiser"],
  ["Cofetar"],
  ["Brutar"],
  ["Șef de sală"],
  ["Recepționer", "Recepționer hotel", "Recepționeră"],
  ["Cameristă"],
  ["Lucrător fast-food"],
  // Comerț și vânzări
  ["Vânzător", "Vânzătoare", "Lucrător comercial"],
  ["Casier", "Casieră"],
  ["Manager magazin", "Șef magazin", "Director magazin"],
  ["Merchandiser"],
  ["Gestionar"],
  ["Agent de vânzări", "Reprezentant vânzări", "Consultant vânzări", "Consilier vânzări", "Agent comercial"],
  ["Promoter"],
  ["Operator call center", "Agent call center", "Suport clienți"],
  // Curățenie, casă, îngrijire
  ["Femeie de serviciu", "Agent de curățenie", "Personal curățenie", "Îngrijitor clădiri"],
  ["Menajeră"],
  ["Bonă", "Babysitter"],
  ["Îngrijitoare bătrâni", "Îngrijitor bătrâni"],
  ["Grădinar"],
  ["Administrator bloc"],
  // Pază
  ["Agent de pază", "Paznic", "Agent de securitate"],
  ["Dispecer"],
  // Transport și auto
  ["Șofer"],
  ["Șofer profesionist", "Șofer TIR", "Șofer camion", "Șofer C+E"],
  ["Șofer distribuție", "Șofer categoria B", "Șofer livrări"],
  ["Șofer autobuz"],
  ["Șofer microbuz"],
  ["Taximetrist", "Șofer taxi"],
  ["Șofer ride-sharing", "Șofer Bolt", "Șofer Uber"],
  ["Curier", "Livrator"],
  ["Mecanic auto"],
  ["Electrician auto"],
  ["Tinichigiu auto", "Tinichigiu carosier"],
  ["Vopsitor auto"],
  ["Vulcanizator"],
  ["Spălător auto"],
  ["Mecanic utilaje"],
  ["Instructor auto"],
  ["Mecanic locomotivă"],
  ["Însoțitor de bord", "Stewardesă"],
  ["Pilot"],
  ["Marinar"],
  // Depozit și producție
  ["Manipulant mărfuri", "Manipulant marfă", "Încărcător-descărcător"],
  ["Lucrător depozit", "Operator depozit", "Picker"],
  ["Magaziner", "Gestionar depozit"],
  ["Stivuitorist", "Operator stivuitor"],
  ["Operator producție", "Muncitor producție"],
  ["Muncitor necalificat"],
  ["Ambalator"],
  ["Operator CNC"],
  ["Programator CNC"],
  ["Strungar"],
  ["Frezor"],
  ["Lăcătuș", "Lăcătuș mecanic"],
  ["Sudor"],
  ["Electromecanic"],
  ["Tehnician mentenanță"],
  ["Controlor calitate", "Inspector calitate"],
  ["Confecționer", "Operator confecții"],
  ["Croitor", "Croitoreasă"],
  ["Cizmar"],
  ["Tapițer"],
  ["Operator mase plastice"],
  ["Operator chimist"],
  ["Muncitor industria alimentară"],
  ["Măcelar", "Tranșator"],
  ["Tipograf"],
  ["Țesător"],
  ["Sticlar"],
  ["Metalurgist"],
  ["Miner"],
  ["Sondor"],
  ["Operator rafinărie"],
  ["Operator stație apă"],
  ["Operator epurare"],
  ["Operator salubritate"],
  // Construcții și meserii
  ["Muncitor construcții", "Constructor"],
  ["Zidar"],
  ["Zugrav"],
  ["Faianțar"],
  ["Dulgher"],
  ["Fierar betonist"],
  ["Rigipsar", "Montator gips-carton"],
  ["Instalator", "Instalator sanitar"],
  ["Electrician"],
  ["Electrician centrală electrică"],
  ["Tâmplar"],
  ["Montator mobilier"],
  ["Montator tâmplărie PVC"],
  ["Excavatorist", "Operator excavator"],
  ["Macaragiu"],
  ["Operator utilaje", "Mașinist utilaje"],
  ["Constructor drumuri"],
  ["Șef de șantier"],
  ["Inginer constructor", "Inginer construcții"],
  ["Arhitect"],
  // Frumusețe
  ["Frizer", "Barber"],
  ["Coafor", "Coafeză"],
  ["Manichiuristă", "Tehnician unghii"],
  ["Cosmetician", "Cosmeticiană"],
  ["Maseur", "Maseuză"],
  // Sănătate
  ["Asistent medical", "Asistentă medicală"],
  ["Infirmier", "Infirmieră"],
  ["Brancardier"],
  ["Medic"],
  ["Medic rezident"],
  ["Medic veterinar"],
  ["Medic dentist", "Stomatolog"],
  ["Asistent dentar"],
  ["Tehnician dentar"],
  ["Farmacist"],
  ["Asistent farmacie"],
  ["Fizioterapeut"],
  ["Kinetoterapeut"],
  ["Registrator medical"],
  ["Psiholog"],
  ["Asistent social"],
  // Birou, financiar, juridic
  ["Contabil", "Contabilă"],
  ["Economist"],
  ["Secretară", "Secretar", "Asistent manager"],
  ["Operator introducere date", "Operator date"],
  ["Funcționar administrativ", "Referent"],
  ["Specialist resurse umane", "Recrutor"],
  ["Consilier juridic", "Jurist"],
  ["Avocat"],
  ["Notar"],
  ["Specialist achiziții", "Achizitor"],
  ["Analist financiar"],
  ["Auditor"],
  ["Consultant financiar"],
  ["Broker"],
  ["Agent asigurări", "Consultant asigurări"],
  ["Agent imobiliar", "Consultant imobiliar"],
  ["Ofițer credite"],
  ["Specialist marketing"],
  ["Designer grafic", "Grafician"],
  ["Editor"],
  ["Jurnalist"],
  ["Traducător"],
  ["Manager proiect"],
  ["Logistician"],
  ["Agent turism"],
  ["Funcționar public"],
  ["Consultant management"],
  // IT și telecomunicații
  ["Programator", "Software developer"],
  ["Web developer", "Frontend developer"],
  ["Tester QA", "Tester"],
  ["Inginer DevOps", "DevOps"],
  ["Administrator de sistem"],
  ["Analist de date", "Data analyst"],
  ["Tehnician calculatoare", "Tehnician IT"],
  ["Inginer telecomunicații"],
  // Inginerie
  ["Inginer"],
  ["Inginer mecanic"],
  ["Inginer electrician", "Inginer electric"],
  ["Inginer automatist"],
  ["Inginer producție"],
  ["Inginer proiectant"],
  ["Inginer auto"],
  ["Inginer aeronautic"],
  ["Inginer energetician"],
  ["Inginer petrol"],
  ["Inginer electronist"],
  ["Cercetător"],
  // Educație, cultură, sport
  ["Profesor", "Profesoară"],
  ["Educatoare", "Educator"],
  ["Învățătoare", "Învățător"],
  ["Profesor universitar"],
  ["Bibliotecar"],
  ["Antrenor sportiv"],
  ["Actor"],
  ["Muzician"],
  ["Regizor"],
  ["Cameraman"],
  ["Crupier", "Dealer cazino"],
  ["Bijutier"],
  // Agricultură
  ["Muncitor agricol", "Lucrător agricol"],
  ["Tractorist"],
  ["Îngrijitor animale"],
  ["Fermier"],
  ["Inginer agronom", "Agronom"],
  ["Silvicultor"],
  ["Pescar"],
  ["Poștaș"],
];

export const slugMeserie = (nume: string) => faraDiacritice(nume).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export type MeserieAnunt = { slug: string; nume: string; /** slugul primului nume din grup */ grup: string };

/** Toate formulările, fiecare cu grupul ei, în ordinea din listă. */
export const MESERII_ANUNTURI: MeserieAnunt[] = GRUPURI.flatMap((g) => g.map((nume) => ({ slug: slugMeserie(nume), nume, grup: slugMeserie(g[0]) })));

const DUPA_SLUG = new Map(MESERII_ANUNTURI.map((m) => [m.slug, m]));
const IN_GRUP = new Map<string, string[]>();
for (const m of MESERII_ANUNTURI) IN_GRUP.set(m.grup, [...(IN_GRUP.get(m.grup) ?? []), m.slug]);

export const esteMeserieAnunt = (slug: string) => DUPA_SLUG.has(slug);
export const numeMeserieAnunt = (slug: string) => DUPA_SLUG.get(slug)?.nume ?? "";
export const grupMeserie = (slug: string) => DUPA_SLUG.get(slug)?.grup ?? slug;
/** Toate formulările grupului în care e `slug`, inclusiv el. */
export const slugurileGrupului = (slug: string) => IN_GRUP.get(grupMeserie(slug)) ?? [slug];
