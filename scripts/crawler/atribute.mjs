// Factorii unui anunț de angajare, citiți din titlu și descriere (27 septembrie 2026).
// Până acum colectorul păstra din anunț doar salariul. Aici se păstrează și ce cere postul
// și ce oferă angajatorul: experiență, studii, limbi, permis, program, beneficii, atestate,
// tehnologii. Se păstrează doar factorii, niciodată textul anunțului, numele sau contactele.
//
// Regula: un factor intră numai când formularea îl spune explicit. Ce e ambiguu rămâne
// necunoscut, nu ghicit. „Vârsta 18–50 de ani” nu e experiență; „experiența constituie un
// avantaj” nu e o cerință. Cazurile-capcană sunt în scripts/test-atribute.mjs.

const norm = (s) => String(s || "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[ţţ]/g, "t").replace(/[şș]/g, "s")
  .toLowerCase().replace(/\s+/g, " ");

const are = (t, re) => re.test(t);
const lista = (t, perechi) => perechi.filter(([, re]) => re.test(t)).map(([nume]) => nume);

// ─── Experiență ─────────────────────────────────────────────────────────────
// Anii se citesc doar lângă cuvântul „experiență”, în aceeași propoziție (cel mult ~40 de
// caractere distanță), ca vârsta, vechimea firmei sau garanția să nu fie luate drept experiență.
const NUM = "(\\d{1,2})";
const NUME_NUMERE = { un: 1, unu: 1, o: 1, doi: 2, doua: 2, trei: 3, patru: 4, cinci: 5, sase: 6, sapte: 7, opt: 8, zece: 10 };
function experienta(t) {
  if (/(nu (este|e) (necesara|obligatorie|nevoie de) experienta|fara experienta|nu necesita experienta|experienta nu (este|e) (necesara|obligatorie)|nu conteaza experienta|te calificam|calificare la locul de munca|nu ai experienta\?)/.test(t))
    return { cerinta: "fara", min: 0, max: null };
  const cuvant = "(?:" + Object.keys(NUME_NUMERE).join("|") + ")";
  const val = (x) => (/^\d+$/.test(x) ? Number(x) : NUME_NUMERE[x]);
  const tipare = [
    // „experiență de minim 2 ani”, „experienta de cel putin 3 ani”, „experiență 2-3 ani”
    new RegExp(`experienta[^.;!?\\n]{0,40}?(?:minim(?:um)?|cel putin|de peste|peste|de)?\\s*(${NUM.slice(1, -1)}|${cuvant})\\s*(?:[-–]|la|pana la)?\\s*(${NUM.slice(1, -1)})?\\s*(?:\\+\\s*)?an(?:i|ul)?\\b`),
    // „minim 2 ani experienta”, „2+ ani de experienta”, „3-5 ani experienta”
    new RegExp(`(?:minim(?:um)?|cel putin|peste)?\\s*(${NUM.slice(1, -1)}|${cuvant})\\s*(?:[-–]|la)?\\s*(${NUM.slice(1, -1)})?\\s*(?:\\+\\s*)?an(?:i|ul)?\\s*(?:de\\s*)?experienta`),
  ];
  // Toate potrivirile, în ordine; se ține prima care e despre candidat. Se sar: vechimea firmei
  // („firmă cu peste 15 ani de experiență”, „companie cu 20 de ani experiență pe piață”) și
  // vechimea permisului („experiență auto: permis ... de minimum 2 ani”).
  const FIRMA = /(firma|firmei|companie|compania|companiei|societate|societatea|grup(ul)?|brand(ul)?|fabrica|echipa noastra|avem|suntem|noastra|nostru|cu o|pe piata|in piata)[^.;!?]{0,35}$/;
  const candidati = tipare.flatMap((re) => [...t.matchAll(new RegExp(re.source, "g"))]).sort((x, y) => x.index - y.index);
  for (const m of candidati) {
    const inainte = t.slice(Math.max(0, m.index - 45), m.index);
    const potrivire = m[0];
    if (FIRMA.test(inainte) || /permis|carnet|conducere/.test(potrivire)) continue;
    // Ce urmează spune cine are experiența: firma („..., angajează”, „pe piață”) sau candidatul.
    if (/^[\s,.:;!-]*(pe piata|in piata|in industrie|pe plan|angajeaza|isi mareste|recruteaza|cauta (colegi|oameni|persoane)|suntem|oferim)/.test(t.slice(m.index + potrivire.length, m.index + potrivire.length + 30))) continue;
    const min = val(m[1]), max = m[2] ? Number(m[2]) : null;
    if (Number.isFinite(min) && min <= 20 && (max === null || (max >= min && max <= 25))) {
      return { cerinta: "ani", min, max };
    }
  }
  // Anunțurile scrise în engleză: „3+ years of experience”, „at least 2 years in”, „2-4 years experience”.
  const en = t.match(/(?:minimum|min\.?|at least|over)?\s*\b(\d{1,2})\s*(?:[-–]|to)?\s*(\d{1,2})?\s*\+?\s*years?\b[^.;!?\n]{0,30}?\b(?:of )?(?:\w+ ){0,3}?(?:experience|exp\b)/);
  if (en && !/(company|we have|history|since|founded)[^.;!?]{0,40}$/.test(t.slice(Math.max(0, en.index - 45), en.index))) {
    const min = Number(en[1]), max = en[2] ? Number(en[2]) : null;
    if (min <= 20 && (max === null || (max >= min && max <= 25))) return { cerinta: "ani", min, max };
  }
  if (/no (prior |previous )?experience (is )?(required|needed)|entry[- ]level/.test(t)) return { cerinta: "fara", min: 0, max: null };
  if (/experienta[^.;!?]{0,30}(constituie|reprezinta|este|e) (un )?avantaj|(constituie|reprezinta) avantaj[^.;!?]{0,30}experienta/.test(t))
    return { cerinta: "avantaj", min: null, max: null };
  if (/(experienta (anterioara |similara |dovedita |relevanta )?(in|pe|ca|intr-un|intr-o|pe un post)|experienta (obligatorie|necesara|minima))/.test(t))
    return { cerinta: "da", min: null, max: null };
  return null;
}

// ─── Studii ─────────────────────────────────────────────────────────────────
function studii(t) {
  if (/(bachelor|master'?s degree|university degree|degree in (computer|informatics|engineering|economics|mathematics|a related)|\bbsc\b|\bmsc\b)/.test(t)) return "superioare";
  if (/(studii superioare|facultate|absolvent(a)? (de|al|al unei) (facultat|universit)|licenta in|diploma de licenta|master in)/.test(t)) return "superioare";
  if (/(studii postliceale|scoala postliceala|postliceal)/.test(t)) return "postliceale";
  if (/(studii medii|liceu|bacalaureat|diploma de bac|studii liceale)/.test(t)) return "medii";
  if (/(scoala profesionala|scoala de arte si meserii|studii profesionale)/.test(t)) return "profesionale";
  if (/(studii generale|8 clase|scoala generala|minim 8 clase|10 clase)/.test(t)) return "generale";
  return null;
}

// ─── Limbi străine ──────────────────────────────────────────────────────────
// Doar cu context de cerință („limba engleză”, „cunoștințe de germană”, „engleză nivel B2”),
// nu simpla apariție a cuvântului: un anunț scris în engleză nu cere automat engleza.
const LIMBI = { engleza: "englez[ae]?|english", germana: "german[ae]?|germane", franceza: "francez[ae]?|french", italiana: "italian[ae]?", spaniola: "spaniol[ae]?|spanish", maghiara: "maghiar[ae]?", olandeza: "olandez[ae]?|dutch" };
function limbi(t) {
  return Object.entries(LIMBI).filter(([, r]) =>
    new RegExp(`(limb(a|ii|ilor)[^.;!?]{0,25}(${r})|cunost\\w*[^.;!?]{0,25}(${r})|(${r})\\s*(nivel|level|conversational|fluent|avansat|mediu|scris|vorbit|a1|a2|b1|b2|c1|c2)|(fluent|proficient|good command of|knowledge of)\\s*(in\\s*)?(${r}))`).test(t),
  ).map(([k]) => k);
}

// ─── Permis și atestate ─────────────────────────────────────────────────────
function permis(t) {
  const m = [...t.matchAll(/permis(?:ul)?(?: de conducere| auto)?[^.;!?]{0,20}?(?:categori[ae]|cat\.?|cat)\s*((?:[bcde](?:\s*\+\s*e|e)?)(?:\s*(?:,|si|\/)\s*[bcde](?:\s*\+\s*e|e)?)*)\b/g)];
  const cat = new Set();
  for (const x of m) for (const c of x[1].split(/,|si|\//)) { const k = c.replace(/\s+/g, "").replace("+", "").toUpperCase(); if (/^(B|C|D|E|BE|CE|DE)$/.test(k)) cat.add(k); }
  if (!cat.size && /permis (de conducere|auto)|permisul de conducere/.test(t)) cat.add("da");
  return [...cat].sort();
}
const ATESTATE = [
  ["ANRE", /\banre\b/], ["ISCIR", /\biscir\b/], ["atestat transport (CPC)", /atestat (profesional|cpc|transport)|\bcpc\b/],
  ["card tahograf", /card(ul)? (de )?tahograf/], ["autorizare sudor", /sudor autorizat|autorizare (de )?sudor|autorizat(ie)? (iscir|de sudura)/],
  ["autorizare stivuitorist", /(autorizat|autorizare|atestat)[^.;!?]{0,20}(stivuitor|motostivuitor|iscir)|stivuitorist autorizat/],
  ["certificat ECDL", /\becdl\b/], ["atestat pază", /atestat (de )?paza|agent de paza atestat/],
];

// ─── Program și mod de lucru ────────────────────────────────────────────────
const PROGRAM = [
  ["ture", /\b(in |pe )?ture\b|doua schimburi|trei schimburi|\b[23] schimburi|program in schimburi|tura (de zi|de noapte|i|ii|iii)/],
  ["noapte", /tura de noapte|program de noapte|lucru (pe timp )?de noapte|schimb(ul)? de noapte/],
  ["weekend", /(lucru|program|disponibilitate)[^.;!?]{0,20}(in )?weekend|sambata si duminica|si in weekend/],
  ["luni–vineri", /luni[ -]?(-|–|pana)?[ -]?vineri|\bl-v\b/],
  ["12/24", /12\s*\/\s*24|12\s*\/\s*48|ture de 12 ore|program 12 ore/],
  ["flexibil", /program flexibil|orar flexibil|flexible (hours|schedule)/],
];
const MOD = [
  ["remote", /\bremote\b|100% de acasa|lucru de acasa|work from home|\bwfh\b|telemunca/],
  ["hibrid", /\bhibrid\b|\bhybrid\b/],
];
function contract(t) {
  const norma = /part[- ]?time|timp partial|norma partiala|\b[46] ore\s*\/\s*zi|program de [46] ore/.test(t) ? "part-time"
    : /full[- ]?time|norma intreaga|8 ore\s*\/\s*zi|program de 8 ore/.test(t) ? "full-time" : null;
  const durata = /perioada nedeterminata|durata nedeterminata|contract pe perioada nedeterminata/.test(t) ? "nedeterminată"
    : /perioada determinata|durata determinata|contract (sezonier|temporar)|job sezonier|munca sezoniera/.test(t) ? "determinată" : null;
  return { norma, durata };
}

// ─── Beneficii ──────────────────────────────────────────────────────────────
const BENEFICII = [
  ["tichete de masă", /tichete de masa|bonuri de masa|card de masa|tichete masa|tichet de masa/],
  ["transport", /transport (gratuit|asigurat|decontat|inclus|platit|la si de la)|decontare(a)? (transport|navet)|microbuz|asiguram transport|transport asigurat/],
  ["cazare", /cazare (gratuita|asigurata|oferita|inclusa|platita|decontata)|asiguram cazare|oferim cazare|cazare in regim|cazarea (este )?(asigurata|gratuita|oferita)/],
  ["masă", /masa (gratuita|asigurata|calda|de pranz)|pranz(ul)? (gratuit|asigurat)|o masa pe zi|masa oferita/],
  ["bonus", /bonus(uri)?\b/],
  ["prime", /\bprime (de|la|anuale|de sarbatori)|prima de (paste|craciun|vacanta)|al 13-lea salariu|salariul 13/],
  ["asigurare medicală", /abonament medical|asigurare (medicala|de sanatate|privata de sanatate)|servicii medicale private|medical (insurance|subscription)/],
  ["ore suplimentare plătite", /ore(le)? suplimentare (platite|remunerate|se platesc)|plata orelor suplimentare/],
  ["spor", /\bspor(uri)?\b/],
  ["vouchere de vacanță", /vouchere? de vacanta|tichete de vacanta/],
  ["cursuri / training", /cursuri de (formare|calificare|perfectionare)|training(uri)?\b|instruire (gratuita|platita)|calificare gratuita/],
  ["echipament de lucru", /echipament(ul)? (de lucru|de protectie)|echipament asigurat/],
  ["telefon / laptop", /telefon (de serviciu|mobil de serviciu)|laptop|masina de serviciu|autoturism de serviciu/],
];

// ─── Tehnologii și unelte (IT, inginerie) ───────────────────────────────────
const TEHNOLOGII = [
  ["Java", /\bjava\b(?!script)/], ["JavaScript", /\bjavascript\b|\bjs\b/], ["TypeScript", /\btypescript\b/], ["Python", /\bpython\b/],
  ["C#", /\bc#|\bc sharp\b/], [".NET", /\.net\b|\bdotnet\b/], ["C++", /\bc\+\+/], ["PHP", /\bphp\b/], ["Go", /\bgolang\b/],
  ["Kotlin", /\bkotlin\b/], ["Swift", /\bswift\b/], ["Ruby", /\bruby\b/], ["Rust", /\brust\b/], ["Scala", /\bscala\b/],
  ["React", /\breact(\.?js)?\b/], ["Angular", /\bangular\b/], ["Vue", /\bvue(\.?js)?\b/], ["Node.js", /\bnode(\.?js)?\b/],
  ["Spring", /\bspring( boot)?\b/], ["Django", /\bdjango\b/], ["Laravel", /\blaravel\b/], ["Flutter", /\bflutter\b/],
  ["SQL", /\bsql\b|\bmysql\b|\bpostgres(ql)?\b|\bmssql\b|\boracle db\b/], ["NoSQL", /\bmongodb\b|\bnosql\b|\bredis\b/],
  ["AWS", /\baws\b|amazon web services/], ["Azure", /\bazure\b/], ["GCP", /\bgcp\b|google cloud/],
  ["Docker", /\bdocker\b/], ["Kubernetes", /\bkubernetes\b|\bk8s\b/], ["Linux", /\blinux\b/], ["Git", /\bgit\b|\bgithub\b|\bgitlab\b/],
  ["SAP", /\bsap\b/], ["ABAP", /\babap\b/], ["Salesforce", /\bsalesforce\b/], ["Power BI", /power ?bi\b/],
  ["Excel", /\bexcel\b/], ["AutoCAD", /\bautocad\b/], ["SolidWorks", /\bsolidworks\b/], ["PLC", /\bplc\b/], ["SCADA", /\bscada\b/],
  ["CNC", /\bcnc\b/], ["Selenium", /\bselenium\b/], ["Jira", /\bjira\b/], ["Figma", /\bfigma\b/],
];

// ─── Nivel (din titlu) ──────────────────────────────────────────────────────
function nivel(titlu) {
  const t = norm(titlu);
  if (/\b(intern|internship|stagiar|practica)\b/.test(t)) return "stagiar";
  if (/\b(junior|jr\.?|debutant|incepator)\b/.test(t)) return "junior";
  if (/\b(senior|sr\.?|principal|expert)\b/.test(t)) return "senior";
  if (/\b(lead|team lead|coordonator|sef de echipa|sef echipa|tech lead)\b/.test(t)) return "lead";
  if (/\b(mid|middle|medior)\b/.test(t)) return "mid";
  return null;
}

/** Factorii unui anunț. `limbaAnunt` = „en” dacă descrierea e scrisă în engleză. */
export function atributeAnunt({ title = "", description = "", extra = "", structurat = null } = {}) {
  const t = norm(`${title}. ${description}. ${extra}`);
  const cuvinteEn = (t.match(/\b(the|and|with|you|we|our|your|experience|team|will)\b/g) || []).length;
  const cuvinteRo = (t.match(/\b(si|cu|pentru|echipa|experienta|oferim|cautam|angajam|de|la)\b/g) || []).length;
  const c = contract(t);
  return {
    nivel: nivel(title),
    experienta: experienta(t),
    studii: studii(t),
    limbi: limbi(t),
    permis: permis(t),
    atestate: lista(t, ATESTATE),
    program: lista(t, PROGRAM),
    mod: [...new Set([...lista(t, MOD), ...(structurat?.remote ? ["remote"] : [])])],
    // Treapta aleasă de angajator dintr-o listă a portalului (hipo.ro), separat de cerința scrisă.
    experientaPortal: structurat?.experientaPortal ?? null,
    norma: c.norma,
    durata: c.durata,
    beneficii: lista(t, BENEFICII),
    tehnologii: lista(t, TEHNOLOGII),
    negociabil: /salariu(l)? (este )?negociabil|salariu de negociat|negociabil in functie/.test(t),
    strainatate: /\b(germania|olanda|belgia|austria|anglia|marea britanie|uk|franta|italia|spania|norvegia|danemarca|suedia|elvetia)\b[^.;!?]{0,40}(lucru|munca|job|angaj)|(lucru|munca|job|angaj)[^.;!?]{0,40}\b(germania|olanda|belgia|austria|anglia|marea britanie|franta|italia|spania|norvegia|danemarca|suedia|elvetia)\b/.test(t),
    limbaAnunt: cuvinteEn > cuvinteRo * 1.5 && cuvinteEn >= 8 ? "en" : "ro",
    lungime: description.length + extra.length,
  };
}
