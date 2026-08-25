// src/lib/caen-denumiri.ts
// Denumiri redactionale pentru activitatile CAEN afisate in paginile de
// meserii.
//
// Nomenclatorul INS vine fara diacritice si cu formulari administrative lungi
// („Activitati de programare si activitati de consultanta in tehnologia
// informatiei"). Le folosim asa cum sunt acolo unde CITAM sursa — in nota de
// subsol si in propozitia care spune sub ce nume apare activitatea la INS — dar
// in corpul paginii afisam varianta de mai jos: acelasi inteles, scris in
// romana curenta.
//
// Cheia este primul token din eticheta INS (codul diviziunii sau litera
// sectiunii). Ce nu are intrare aici cade pe denumirea derivata automat din
// eticheta INS, deci o activitate noua nu strica nimic.

export const DENUMIRI_CAEN: Record<string, string> = {
  TOTAL: "Total economie",

  "01": "Agricultură, vânătoare și servicii anexe",
  "02": "Silvicultură și exploatare forestieră",
  "05": "Extracția cărbunelui",
  "06": "Extracția petrolului brut și a gazelor naturale",
  "10": "Industria alimentară",
  "14": "Fabricarea articolelor de îmbrăcăminte",
  "16": "Prelucrarea lemnului și fabricarea produselor din lemn",
  "21": "Fabricarea produselor farmaceutice",
  "24": "Industria metalurgică",
  "25": "Construcții metalice și produse din metal",
  "26": "Fabricarea calculatoarelor și a produselor electronice",
  "29": "Fabricarea autovehiculelor și a remorcilor",
  "33": "Repararea și instalarea mașinilor și echipamentelor",
  "36": "Captarea, tratarea și distribuția apei",
  "38": "Colectarea și tratarea deșeurilor",
  "41": "Construcții de clădiri",
  "43": "Lucrări speciale de construcții",
  "46": "Comerț cu ridicata",
  "47": "Comerț cu amănuntul",
  "49": "Transporturi terestre și prin conducte",
  "51": "Transporturi aeriene",
  "52": "Depozitare și activități auxiliare pentru transporturi",
  "53": "Activități de poștă și de curier",
  "55": "Hoteluri și alte facilități de cazare",
  "56": "Restaurante și alte servicii de alimentație",
  "58": "Activități de editare",
  "59": "Producție cinematografică, video și de programe TV",
  "60": "Difuzarea de programe și agenții de știri",
  "61": "Telecomunicații",
  "62": "Programare și consultanță în tehnologia informației",
  "63": "Portaluri web, prelucrarea datelor și activități conexe",
  "64": "Intermedieri financiare, fără asigurări și fonduri de pensii",
  "65": "Asigurări, reasigurări și fonduri de pensii",
  "66": "Activități auxiliare intermedierilor financiare și asigurărilor",
  "69": "Activități juridice și de contabilitate",
  "71": "Arhitectură, inginerie și analiză tehnică",
  "72": "Cercetare-dezvoltare",
  "73": "Publicitate, studiul pieței și relații publice",
  "74": "Alte activități profesionale, științifice și tehnice",
  "75": "Activități veterinare",
  "78": "Servicii privind forța de muncă",
  "79": "Agenții turistice, tur-operatori și servicii de rezervare",
  "80": "Activități de investigații și protecție",
  "81": "Peisagistică și servicii pentru clădiri",
  "82": "Secretariat și alte servicii-suport pentru întreprinderi",
  "86": "Activități referitoare la sănătatea umană",
  "87": "Îngrijire medicală și asistență socială, cu cazare",
  "90": "Activități de creație și interpretare artistică",
  "91": "Biblioteci, arhive, muzee și alte activități culturale",
  "93": "Activități sportive, recreative și distractive",
  "96": "Alte activități de servicii",

  C: "Industria prelucrătoare",
  D: "Producția și furnizarea de energie electrică și termică, gaze și apă caldă",
  G: "Comerț cu ridicata și cu amănuntul",
  M: "Tranzacții imobiliare",
  P: "Administrație publică și apărare; asigurări sociale din sistemul public",
  Q: "Învățământ",
};

/** Numele judetelor, scrise cu diacritice. Nomenclatorul INS le da fara. */
export const DENUMIRI_JUDETE: Record<string, string> = {
  "Bistrita-Nasaud": "Bistrița-Năsăud",
  Maramures: "Maramureș",
  Salaj: "Sălaj",
  Brasov: "Brașov",
  Mures: "Mureș",
  Bacau: "Bacău",
  Botosani: "Botoșani",
  Iasi: "Iași",
  Neamt: "Neamț",
  Braila: "Brăila",
  Buzau: "Buzău",
  Constanta: "Constanța",
  Galati: "Galați",
  Arges: "Argeș",
  Calarasi: "Călărași",
  Dambovita: "Dâmbovița",
  Ialomita: "Ialomița",
  "Municipiul Bucuresti": "București",
  Mehedinti: "Mehedinți",
  Valcea: "Vâlcea",
  "Caras-Severin": "Caraș-Severin",
  Timis: "Timiș",
};

// Etichete scurte pentru cardurile din listinguri (hub-ul /salarii). Denumirea
// completa de mai sus e corecta, dar pe un ecran de 375px nu incape langa titlu
// si suma — cardul fie se taie, fie latea coloana peste viewport. Aici pastram
// intelesul in 2-3 cuvinte; codul CAEN ramane afisat, iar denumirea completa
// apare pe pagina meseriei si in nota de sursa, deci nu se pierde nimic.
export const DENUMIRI_CAEN_SCURTE: Record<string, string> = {
  TOTAL: "Total economie",

  "01": "Agricultură",
  "02": "Silvicultură",
  "05": "Extracția cărbunelui",
  "06": "Petrol și gaze",
  "10": "Industria alimentară",
  "14": "Confecții",
  "16": "Prelucrarea lemnului",
  "21": "Industria farmaceutică",
  "24": "Metalurgie",
  "25": "Construcții metalice",
  "26": "Calculatoare și electronice",
  "29": "Industria auto",
  "33": "Reparații de utilaje",
  "36": "Distribuția apei",
  "38": "Salubritate",
  "41": "Construcții de clădiri",
  "43": "Lucrări speciale",
  "46": "Comerț cu ridicata",
  "47": "Comerț cu amănuntul",
  "49": "Transport terestru",
  "51": "Transport aerian",
  "52": "Depozitare și logistică",
  "53": "Poștă și curierat",
  "55": "Hoteluri și cazare",
  "56": "Restaurante",
  "58": "Activități de editare",
  "59": "Film și televiziune",
  "60": "Radio, TV și știri",
  "61": "Telecomunicații",
  "62": "IT și software",
  "63": "Servicii web și date",
  "64": "Bănci și creditare",
  "65": "Asigurări și pensii",
  "66": "Servicii financiare",
  "69": "Juridic și contabilitate",
  "71": "Inginerie și arhitectură",
  "72": "Cercetare-dezvoltare",
  "73": "Publicitate și marketing",
  "74": "Servicii profesionale",
  "75": "Servicii veterinare",
  "78": "Resurse umane",
  "79": "Turism și rezervări",
  "80": "Pază și protecție",
  "81": "Curățenie și spații verzi",
  "82": "Secretariat și suport",
  "86": "Sănătate",
  "87": "Îngrijire cu cazare",
  "90": "Creație artistică",
  "91": "Muzee și biblioteci",
  "93": "Sport și recreere",
  "96": "Alte servicii",

  C: "Industria prelucrătoare",
  D: "Energie și gaze",
  G: "Comerț",
  M: "Tranzacții imobiliare",
  P: "Administrație publică",
  Q: "Învățământ",
};

/** Eticheta scurta pentru listinguri; cade pe denumirea completa daca lipseste. */
export function denumireScurtaCaen(cheie: string, completa: string): string {
  return DENUMIRI_CAEN_SCURTE[cheie] ?? completa;
}

// Secțiunile alfabetice s-au deplasat în CAEN Rev.3. Tabelul județean FOM107E
// este încă pe Rev.2, deci nu poate reutiliza dicționarul de mai sus: acolo P
// înseamnă Învățământ și Q înseamnă Sănătate, nu Administrație și Învățământ.
export const DENUMIRI_CAEN_REV2_SCURTE: Record<string, string> = {
  A: "Agricultură, silvicultură și pescuit",
  B: "Industria extractivă",
  C: "Industria prelucrătoare",
  D: "Energie electrică, termică și gaze",
  E: "Apă, salubritate și deșeuri",
  F: "Construcții",
  G: "Comerț și reparații auto",
  H: "Transport și depozitare",
  I: "Hoteluri și restaurante",
  J: "Informații și comunicații",
  K: "Finanțe și asigurări",
  L: "Tranzacții imobiliare",
  M: "Activități profesionale, științifice și tehnice",
  N: "Servicii administrative și suport",
  O: "Administrație publică și apărare",
  P: "Învățământ",
  Q: "Sănătate și asistență socială",
  R: "Cultură și activități recreative",
  S: "Alte servicii",
};

export function denumireScurtaCaenRev2(cheie: string, completa: string): string {
  return DENUMIRI_CAEN_REV2_SCURTE[cheie] ?? DENUMIRI_CAEN_SCURTE[cheie] ?? completa;
}
