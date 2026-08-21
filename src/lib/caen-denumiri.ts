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
