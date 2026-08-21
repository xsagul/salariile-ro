// scripts/lib/pdf-text.mjs
// Extractor minimal de text din PDF, fara dependente externe.
//
// De ce scriem asta in loc sa instalam un parser: scripturile din repo sunt
// deliberat zero-dependente, iar listele de transparenta salariala publicate de
// institutii (art. 33, Legea 153/2017) sunt PDF-uri simple, generate din Word
// sau Excel — text real, nu scanari. Pentru asa ceva ajunge sa dezarhivam
// stream-urile FlateDecode si sa citim operatorii de text.
//
// Ce NU face: PDF-uri scanate (fara strat de text), criptate, sau cu fonturi
// fara ToUnicode si cu encoding custom. In cazurile alea `extrageText` intoarce
// text gol sau ilizibil, iar apelantul trebuie sa trateze cazul — niciodata sa
// publice rezultatul nevalidat.

import zlib from "node:zlib";

/** Octetii dintre `stream` si `endstream`, pentru fiecare obiect din fisier. */
function* streamuri(buf) {
  let pozitie = 0;
  for (;;) {
    const start = buf.indexOf("stream", pozitie, "latin1");
    if (start === -1) return;
    const sfarsit = buf.indexOf("endstream", start, "latin1");
    if (sfarsit === -1) return;
    // Antetul obiectului, de unde aflam filtrul aplicat.
    const inceputObiect = Math.max(0, buf.lastIndexOf("obj", start, "latin1"));
    const antet = buf.toString("latin1", inceputObiect, start);
    // Sarim peste EOL-ul de dupa cuvantul „stream" (poate fi \r\n sau \n).
    let dateStart = start + "stream".length;
    if (buf[dateStart] === 0x0d) dateStart++;
    if (buf[dateStart] === 0x0a) dateStart++;
    yield { antet, date: buf.subarray(dateStart, sfarsit) };
    pozitie = sfarsit + "endstream".length;
  }
}

function dezarhiveaza(antet, date) {
  if (!/\/FlateDecode/.test(antet)) return null;
  try {
    return zlib.inflateSync(date);
  } catch {
    try {
      return zlib.inflateRawSync(date);
    } catch {
      return null;
    }
  }
}

const ESCAPE_OCTAL = new RegExp("\\\\([0-7]{1,3})", "g");
const ESCAPE_SIMPLU = new RegExp("\\\\([()\\\\])", "g");

/** Octal si backslash-uri din sirurile PDF literale. */
function decodeazaSir(brut) {
  return brut
    .replace(ESCAPE_OCTAL, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(ESCAPE_SIMPLU, "$1");
}

// Siruri literale intre paranteze, cu escapari inauntru, SAU siruri
// hexazecimale intre <>. Multe generatoare (inclusiv cel folosit de ISJ Galati)
// scriu tot textul in hexa, deci fara varianta asta pagina iese goala.
const REGEX_SIR = new RegExp("\\((?:\\\\.|[^\\\\()])*\\)|<[0-9A-Fa-f\\s]*>", "g");

/** `<48656C6F>` → „Helo". Octetii impari se completeaza cu zero, ca in spec. */
function decodeazaHexa(brut) {
  const cifre = brut.slice(1, -1).replace(/\s+/g, "");
  const perechi = cifre.length % 2 === 0 ? cifre : cifre + "0";
  let text = "";
  for (let i = 0; i < perechi.length; i += 2) {
    text += String.fromCharCode(parseInt(perechi.slice(i, i + 2), 16));
  }
  return text;
}

/** Un sir PDF, in oricare din cele doua notatii. */
function decodeazaOriceSir(brut) {
  return brut.startsWith("<") ? decodeazaHexa(brut) : decodeazaSir(brut.slice(1, -1));
}

/**
 * Un sir, trecut prin CMap-ul fontului activ daca acesta are unul.
 *
 * Fara CMap, un sir hexa dintr-o subfontina da litere decalate: „inspector"
 * devine „LQVSHFWRU". Cu CMap, codurile se traduc in caracterele reale.
 */
function decodeazaCuFont(brut, cmap) {
  if (!cmap) return decodeazaOriceSir(brut);
  const octeti = brut.startsWith("<")
    ? decodeazaHexa(brut)
    : decodeazaSir(brut.slice(1, -1));
  const latime = cmap.latime ?? 1;
  let text = "";
  for (let i = 0; i < octeti.length; i += latime) {
    let cod = 0;
    for (let j = 0; j < latime && i + j < octeti.length; j++) {
      cod = (cod << 8) | (octeti.charCodeAt(i + j) & 0xff);
    }
    const caracter = cmap.get(cod);
    // Codul nemapat se pastreaza ca atare: mai bine un caracter ciudat vizibil
    // decat un gol tacut care face randul sa para complet.
    text += caracter !== undefined ? caracter : octeti.slice(i, i + latime);
  }
  return text;
}

// ─── Fonturi cu encoding propriu (ToUnicode) ─────────────────────────────────
//
// O subfontina isi numeroteaza glifele cum vrea. Pe lista ISJ Galati,
// „inspector" iese ca „LQVSHFWRU" — fiecare cod e litera reala minus 29. Fara
// CMap-ul ToUnicode al fontului, textul arata ca text, dar e altceva. Asa ceva
// nu se ghiceste; se citeste din fisier.

/** Pozitia fiecarui obiect indirect: numar → offset in fisier. */
function indexObiecte(brut) {
  const index = new Map();
  const regex = /(\d+)\s+0\s+obj\b/g;
  let potrivire;
  while ((potrivire = regex.exec(brut)) !== null) {
    index.set(Number(potrivire[1]), potrivire.index);
  }
  return index;
}

/** Continutul dezarhivat al stream-ului unui obiect. */
function streamObiectului(buf, brut, offset) {
  const start = brut.indexOf("stream", offset);
  if (start === -1) return null;
  const sfarsit = brut.indexOf("endstream", start);
  if (sfarsit === -1) return null;
  const antet = brut.slice(offset, start);
  let dateStart = start + "stream".length;
  if (buf[dateStart] === 0x0d) dateStart++;
  if (buf[dateStart] === 0x0a) dateStart++;
  const desfacut = dezarhiveaza(antet, buf.subarray(dateStart, sfarsit));
  return desfacut ? desfacut.toString("latin1") : null;
}

/** `<0029> <002A> <0046>` si `<0003> <0020>` → harta cod → caracter. */
function parseazaCMap(text) {
  // Cati octeti are un cod: `<0000> <FFFF>` inseamna doi. Fara asta am taia
  // sirul hexa in bucati gresite si am cauta coduri care nu exista.
  const codespace = text.match(/begincodespacerange\s*<([0-9A-Fa-f]+)>/);
  const latime = codespace ? Math.max(1, Math.round(codespace[1].length / 2)) : 1;
  const harta = new Map();
  harta.latime = latime;
  for (const bloc of text.match(/beginbfchar[\s\S]*?endbfchar/g) ?? []) {
    for (const pereche of bloc.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g) ?? []) {
      const [cod, unicode] = pereche.match(/<([0-9A-Fa-f]+)>/g).map((h) => h.slice(1, -1));
      harta.set(parseInt(cod, 16), unicodeDinHexa(unicode));
    }
  }
  for (const bloc of text.match(/beginbfrange[\s\S]*?endbfrange/g) ?? []) {
    // Forma cu destinatie unica: <de la> <pana la> <primul unicode>
    for (const rand of bloc.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g) ?? []) {
      const [dela, panaLa, primul] = rand.match(/<([0-9A-Fa-f]+)>/g).map((h) => h.slice(1, -1));
      const start = parseInt(dela, 16);
      const stop = parseInt(panaLa, 16);
      const baza = parseInt(primul, 16);
      // Un interval absurd de mare inseamna ca am citit gresit; nu-l umflam.
      if (stop < start || stop - start > 0xffff) continue;
      for (let i = 0; i <= stop - start; i++) harta.set(start + i, String.fromCodePoint(baza + i));
    }
    // Forma cu tablou: <de la> <pana la> [<u1> <u2> ...]
    for (const rand of bloc.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[[^\]]*\]/g) ?? []) {
      const capete = rand.match(/^<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/);
      if (!capete) continue;
      const start = parseInt(capete[1], 16);
      const tinte = (rand.match(/\[([\s\S]*)\]/)?.[1].match(/<([0-9A-Fa-f]+)>/g) ?? []).map((h) => h.slice(1, -1));
      tinte.forEach((tinta, i) => harta.set(start + i, unicodeDinHexa(tinta)));
    }
  }
  return harta;
}

/** Un cod unicode scris hexa, posibil pe mai multe unitati UTF-16. */
function unicodeDinHexa(hexa) {
  let text = "";
  for (let i = 0; i + 4 <= hexa.length; i += 4) {
    text += String.fromCharCode(parseInt(hexa.slice(i, i + 4), 16));
  }
  return text || String.fromCharCode(parseInt(hexa, 16));
}

/**
 * Harta „nume de font din pagina" → CMap, pentru tot documentul.
 *
 * Numele (`/F3`) sunt locale paginii, dar in practica acelasi nume trimite la
 * acelasi obiect font in tot fisierul. Cand nu e asa, pastram prima potrivire
 * si semnalam conflictul, ca sa nu decodam tacut cu fontul gresit.
 */
export function hartiFonturi(buffer) {
  const brut = buffer.toString("latin1");
  const index = indexObiecte(brut);
  const cmapCache = new Map();
  const harti = new Map();
  const conflicte = new Set();

  for (const resurse of brut.match(/\/Font\s*<<[^>]*>>/g) ?? []) {
    for (const intrare of resurse.match(/\/([A-Za-z0-9]+)\s+(\d+)\s+0\s+R/g) ?? []) {
      const potrivire = intrare.match(/\/([A-Za-z0-9]+)\s+(\d+)/);
      if (!potrivire) continue;
      const [, nume, numarFont] = potrivire;
      const offsetFont = index.get(Number(numarFont));
      if (offsetFont === undefined) continue;
      // Dictionarul fontului, pana la primul „endobj".
      const sfarsitObiect = brut.indexOf("endobj", offsetFont);
      const dict = brut.slice(offsetFont, sfarsitObiect === -1 ? offsetFont + 2000 : sfarsitObiect);
      const refToUnicode = dict.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
      if (!refToUnicode) continue;
      const numarCMap = Number(refToUnicode[1]);
      if (!cmapCache.has(numarCMap)) {
        const offsetCMap = index.get(numarCMap);
        const text = offsetCMap === undefined ? null : streamObiectului(buffer, brut, offsetCMap);
        cmapCache.set(numarCMap, text ? parseazaCMap(text) : null);
      }
      const cmap = cmapCache.get(numarCMap);
      if (!cmap || cmap.size === 0) continue;
      const existent = harti.get(nume);
      if (existent && existent.numar !== numarCMap) {
        conflicte.add(nume);
        continue;
      }
      if (!existent) harti.set(nume, { numar: numarCMap, cmap });
    }
  }
  return { harti, conflicte };
}

// Un operator PDF si operanzii lui numerici sau siruri. Scanam secvential,
// pentru ca pozitia textului conteaza: intr-un tabel, celulele de pe acelasi
// rand sunt fragmente separate, emise fiecare cu propriul Tj.
const REGEX_TOKEN = new RegExp(
  "(\\[(?:[^\\[\\]\\\\]|\\\\.)*\\])|" + // tabloul de la TJ
    "(\\((?:\\\\.|[^\\\\()])*\\)|<[0-9A-Fa-f\\s]*>)|" + // sir literal sau hexa
    "(-?\\d*\\.?\\d+(?:[eE]-?\\d+)?)|" + // numar
    "(/[A-Za-z0-9+.-]+)|" + // nume de resursa, pentru Tf
    "(Tm|Td|TD|T\\*|TJ|Tj|Tf|TL|BT|ET|cm|q|Q|'|\")", // operatorii care ne intereseaza
  "g",
);

// Matricile PDF sunt afine, scrise ca [a b c d e f]:
//   | a b 0 |
//   | c d 0 |
//   | e f 1 |
const UNITATE = [1, 0, 0, 1, 0, 0];

function inmulteste(m1, m2) {
  return [
    m1[0] * m2[0] + m1[1] * m2[2],
    m1[0] * m2[1] + m1[1] * m2[3],
    m1[2] * m2[0] + m1[3] * m2[2],
    m1[2] * m2[1] + m1[3] * m2[3],
    m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
    m1[4] * m2[1] + m1[5] * m2[3] + m2[5],
  ];
}

/**
 * Fragmentele de text dintr-un content stream, fiecare cu pozitia lui.
 *
 * PDF-ul nu are notiunea de „rand de tabel": are fragmente asezate la
 * coordonate. Reconstruim randurile grupand dupa Y si sortand dupa X, altfel
 * o data ca „31.03.2026" iese bucatita in „3", „1", „.0", „3", „.202", „6".
 */
function fragmenteDinContinut(continut, harti = new Map()) {
  const fragmente = [];
  let tm = UNITATE; // matricea de text curenta
  let tlm = UNITATE; // matricea liniei de text, de la care pleaca Td si T*
  let ctm = UNITATE; // matricea grafica, schimbata de `cm` intre q si Q
  const stiva = [];
  let leading = 0;
  let marime = 10;
  let cmapActiv = null;
  const numere = [];
  let token;
  REGEX_TOKEN.lastIndex = 0;
  while ((token = REGEX_TOKEN.exec(continut)) !== null) {
    const [, tablou, sir, numar, nume, operator] = token;
    if (numar !== undefined) {
      numere.push(parseFloat(numar));
      continue;
    }
    if (nume !== undefined) {
      numere.push({ nume: nume.slice(1) });
      continue;
    }
    if (tablou !== undefined || sir !== undefined) {
      // Sirurile raman in coada pana la operatorul care le afiseaza.
      numere.push(tablou !== undefined ? { tablou } : { sir });
      continue;
    }
    if (operator === undefined) continue;

    const argumente = numere.splice(0, numere.length);
    const siruri = argumente.filter((a) => typeof a === "object" && (a.sir !== undefined || a.tablou !== undefined));
    const nume2 = argumente.filter((a) => typeof a === "object" && a.nume !== undefined);
    const cifre = argumente.filter((a) => typeof a === "number");

    if (operator === "Tf") {
      const numeFont = nume2.length ? nume2[nume2.length - 1].nume : null;
      cmapActiv = numeFont ? (harti.get(numeFont)?.cmap ?? null) : null;
      if (cifre.length) marime = Math.abs(cifre[cifre.length - 1]) || marime;
      continue;
    }

    switch (operator) {
      case "cm":
        // Matricea grafica se compune, nu se inlocuieste.
        if (cifre.length >= 6) ctm = inmulteste(cifre.slice(-6), ctm);
        break;
      case "q":
        stiva.push(ctm);
        break;
      case "Q":
        ctm = stiva.pop() ?? ctm;
        break;
      case "Tm":
        if (cifre.length >= 6) {
          // Ultimii sase operanzi, nu primii: in coada s-au putut aduna si
          // numere de la operatori pe care nu ii tratam (Tf, re).
          tlm = cifre.slice(-6);
          tm = tlm;
        }
        break;
      case "Td":
      case "TD":
        if (cifre.length >= 2) {
          const tx = cifre[cifre.length - 2];
          const ty = cifre[cifre.length - 1];
          if (operator === "TD") leading = -ty;
          tlm = inmulteste([1, 0, 0, 1, tx, ty], tlm);
          tm = tlm;
        }
        break;
      case "T*":
        tlm = inmulteste([1, 0, 0, 1, 0, -leading], tlm);
        tm = tlm;
        break;
      case "TL":
        if (cifre.length) leading = cifre[cifre.length - 1];
        break;
      case "BT":
        tm = UNITATE;
        tlm = UNITATE;
        break;
      case "'":
      case '"':
        tlm = inmulteste([1, 0, 0, 1, 0, -leading], tlm);
        tm = tlm;
      // fallthrough: ' si " afiseaza sirul dupa ce trec la randul urmator
      case "Tj":
      case "TJ": {
        // Pozitia reala pe pagina e matricea de text compusa cu cea grafica.
        // Fara compunere, un document cu Tm scalat da coordonate de zeci de mii
        // si tabelul se rupe in coloane inexistente.
        const efectiv = inmulteste(tm, ctm);
        const x = efectiv[4];
        const y = efectiv[5];
        // Marimea vizibila a fontului include scalarea verticala a matricei.
        const scalare = Math.hypot(efectiv[1], efectiv[3]) || 1;
        const marimeEfectiva = marime * scalare;
        for (const argument of siruri) {
          let text = "";
          if (argument.sir !== undefined) {
            text = decodeazaCuFont(argument.sir, cmapActiv);
          } else {
            // TJ: siruri intercalate cu ajustari de kerning. O ajustare mare
            // negativa inseamna spatiu vizibil intre glife.
            const parti = argument.tablou.match(REGEX_SIR) ?? [];
            text = parti.map((p) => decodeazaCuFont(p, cmapActiv)).join("");
          }
          // Cand componenta „b" a matricei o depaseste pe „a", textul e scris
          // pe verticala: pagina e un tabel landscape rotit 90 de grade.
          const rotit = Math.abs(efectiv[1]) > Math.abs(efectiv[0]);
          if (text.trim()) fragmente.push({ x, y, text, marime: marimeEfectiva, rotit });
        }
        break;
      }
      default:
        break;
    }
  }
  return fragmente;
}

/**
 * Lipeste bucatile unei benzi, punand spatiu doar unde chiar e spatiu.
 *
 * Unele generatoare pozitioneaza fiecare glifa separat. Daca am pune spatiu
 * intre orice doua fragmente, „inspector" ar iesi „i n s p e c t o r". Estimam
 * latimea textului din numarul de caractere si marimea fontului, si punem
 * spatiu numai cand distanta pana la fragmentul urmator o depaseste vizibil.
 */
function lipesteBucati(bucati) {
  let text = "";
  let sfarsitAnterior = null;
  for (const bucata of bucati) {
    const marime = bucata.marime ?? 10;
    if (sfarsitAnterior !== null) {
      const gol = bucata.x - sfarsitAnterior;
      const areSpatiuLaCapete = /\s$/.test(text) || /^\s/.test(bucata.text);
      if (!areSpatiuLaCapete && gol > marime * 0.22) text += " ";
    }
    text += bucata.text;
    // Latime aproximativa: 0,5 em pe caracter e media pentru fonturile de text.
    sfarsitAnterior = bucata.x + bucata.text.length * marime * 0.5;
  }
  return text.replace(/\s+/g, " ").trim();
}

/** Fragmentele grupate in randuri: acelasi Y (cu toleranta), ordonate dupa X. */
function randuriDinFragmente(fragmente) {
  if (fragmente.length === 0) return [];
  const grupe = new Map();
  for (const fragment of fragmente) {
    // Toleranta de 2 unitati acopera diferentele de baseline din acelasi rand.
    const cheie = Math.round(fragment.y / 2);
    if (!grupe.has(cheie)) grupe.set(cheie, []);
    grupe.get(cheie).push(fragment);
  }
  return [...grupe.entries()]
    .sort((a, b) => b[0] - a[0]) // de sus in jos
    .map(([, bucati]) =>
      lipesteBucati(bucati.sort((a, b) => a.x - b.x)),
    )
    .filter(Boolean);
}

/**
 * Fragmentele fiecarei pagini, cu coordonate.
 *
 * Pentru tabele nu ajung randurile ca text: intr-o lista de transparenta,
 * denumirea functiei e o celula pe mai multe randuri, asa ca numele ajunge pe
 * alt Y decat cifrele. Cine parseaza un tabel are nevoie de X ca sa stie in ce
 * coloana cade fiecare bucata. `randuri` ramane pentru citit, asta e pentru
 * extras date.
 */
/**
 * Aduce o pagina rotita la orientarea normala.
 *
 * Multe liste de salarii sunt tabele late, tiparite landscape prin rotirea
 * continutului cu 90 de grade. Pe o astfel de pagina, un „rand" inseamna X
 * constant si Y variabil — exact invers fata de o pagina normala. Daca nu
 * normalizam, gruparea pe benzi citeste coloanele drept randuri si tabelul iese
 * pe dos: pe lista Spitalului Miercurea-Ciuc, „doctor" aparea literă cu literă,
 * pe verticala.
 */
function normalizeazaRotatia(fragmente) {
  const rotite = fragmente.filter((f) => f.rotit).length;
  if (rotite <= fragmente.length / 2) return fragmente;
  return fragmente.map((f) => ({ ...f, x: f.y, y: -f.x }));
}

export function pagini(buffer) {
  const { harti } = hartiFonturi(buffer);
  const rezultat = [];
  for (const { antet, date } of streamuri(buffer)) {
    const desfacut = dezarhiveaza(antet, date);
    if (!desfacut) continue;
    const continut = desfacut.toString("latin1");
    if (!/\bTj\b/.test(continut) && !/\bTJ\b/.test(continut)) continue;
    const fragmente = fragmenteDinContinut(continut, harti);
    if (fragmente.length) rezultat.push(normalizeazaRotatia(fragmente));
  }
  return rezultat;
}

/**
 * Benzile orizontale ale unei pagini: fragmentele grupate dupa Y, fiecare banda
 * pastrandu-si bucatile cu X, ordonate de la stanga la dreapta.
 */
export function benzi(fragmente, toleranta = 2) {
  const grupe = new Map();
  for (const fragment of fragmente) {
    const cheie = Math.round(fragment.y / toleranta);
    if (!grupe.has(cheie)) grupe.set(cheie, []);
    grupe.get(cheie).push(fragment);
  }
  return [...grupe.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([cheie, bucati]) => ({
      y: cheie * toleranta,
      bucati: bucati.sort((a, b) => a.x - b.x),
      text: bucati.map((b) => b.text).join(" ").replace(/\s+/g, " ").trim(),
    }))
    .filter((banda) => banda.text);
}

/** Randurile documentului, reconstruite din pozitiile fragmentelor. */
export function randuri(buffer) {
  return pagini(buffer).flatMap((fragmente) => randuriDinFragmente(fragmente));
}

/**
 * Coloanele unei pagini, deduse din marginile din stanga ale fragmentelor.
 *
 * Intr-un tabel exportat din Excel, celulele vecine se ating: lipite ca text
 * dau „517592144300000000100", din care nu mai stii unde se termina salariul de
 * baza si unde incepe sporul. Singura separare reala e pozitia. Marginile din
 * stanga se repeta de la rand la rand, deci se aduna in ciorchini — fiecare
 * ciorchine e o coloana.
 */
export function coloane(fragmente, toleranta = 3) {
  const margini = fragmente.map((f) => f.x).sort((a, b) => a - b);
  const ciorchini = [];
  for (const margine of margini) {
    const ultimul = ciorchini[ciorchini.length - 1];
    if (ultimul && margine - ultimul.ultima <= toleranta) {
      ultimul.ultima = margine;
      ultimul.cate += 1;
    } else {
      ciorchini.push({ prima: margine, ultima: margine, cate: 1 });
    }
  }
  // O coloana adevarata are mai multe randuri. Cele cu o singura aparitie sunt
  // de obicei titluri sau note, si ar sparge tabelul in coloane inexistente.
  // Pragul se plafoneaza: pe un document de 200.000 de fragmente, un prag
  // proportional ar cere mii de aparitii si ar sterge toate coloanele.
  const prag = Math.min(50, Math.max(2, Math.round(fragmente.length / 200)));
  return ciorchini.filter((c) => c.cate >= prag).map((c) => c.prima);
}

/**
 * Pagina ca tabel: fiecare banda devine un rand, fiecare fragment cade in
 * coloana a carei margine din stanga o depaseste ultima.
 */
export function tabel(fragmente, optiuni = {}) {
  const margini = optiuni.coloane ?? coloane(fragmente, optiuni.toleranta ?? 3);
  if (margini.length === 0) return [];
  return benzi(fragmente, optiuni.tolerantaRand ?? 2).map((banda) => {
    const celule = new Array(margini.length).fill("");
    for (const bucata of banda.bucati) {
      let index = 0;
      for (let i = 0; i < margini.length; i++) {
        if (bucata.x >= margini[i] - 1) index = i;
      }
      celule[index] = celule[index] ? `${celule[index]} ${bucata.text}` : bucata.text;
    }
    return { y: banda.y, celule: celule.map((c) => c.replace(/\s+/g, " ").trim()) };
  });
}

/**
 * Cat de mult din stratul de text s-a putut decoda.
 *
 * De ce exista asta: pe lista ISJ Galati din martie 2026, cuvantul „Inspector"
 * lipseste complet din text, desi „general" si „auditor gradul" se extrag —
 * celulele sunt scrise cu o subfontina cu encoding propriu, fara ToUnicode, iar
 * noi citim octetii bruti. Rezultatul e o extragere PARTIALA, care arata
 * plauzibil: randul are cifre si o bucata de denumire, dar denumirea e trunchiata.
 *
 * Pentru date salariale, o extragere partiala tacuta e mai periculoasa decat un
 * esec: publici „general — 14.017 lei" fara sa stii ca era „Inspector scolar
 * general". De aceea orice apelant trebuie sa treaca prin verificarea asta si sa
 * refuze fisierul care nu o trece, in loc sa publice ce a apucat sa citeasca.
 */
export function calitateText(buffer) {
  const fragmente = pagini(buffer).flat();
  const cuLitere = fragmente.filter((f) => /\p{L}/u.test(f.text));
  // Un fragment „suspect" are litere, dar aproape numai caractere pe care nu le
  // recunoastem ca text romanesc — semnul tipic de encoding nedecodat.
  const suspecte = cuLitere.filter((f) => {
    const litere = [...f.text].filter((c) => /\p{L}/u.test(c));
    const recunoscute = litere.filter((c) => /[A-Za-zĂÂÎȘȚăâîșțĂ-ț]/.test(c));
    return litere.length > 0 && recunoscute.length / litere.length < 0.8;
  });
  // Un sir foarte lung de cifre, fara separator, inseamna ca generatorul a
  // scris tot randul de tabel ca un singur text. Pe lista Spitalului Judetean
  // Miercurea-Ciuc, un rand intreg vine ca „517592144300000000100" — un singur
  // fragment. Nu exista pozitie dupa care sa-l tai, si nu se poate ghici:
  // „5 | 17592 | 1443 | ..." si „51 | 7592 | 1443 | ..." sunt la fel de
  // plauzibile. Fisierele astea se refuza, nu se interpreteaza.
  // Numaram doar siruri de cifre lipite in textul brut. Daca am scoate intai
  // punctele, o data ca „01.07.2025" ar deveni „01072025" si ar trece drept
  // celule lipite — verificat, exact asa pica lista Primariei Sector 1, care
  // altfel se citeste perfect.
  const cifreLipite = fragmente.filter((f) => /\d{8,}/.test(f.text)).length;
  // Un numar lung izolat e normal (coduri, referinte). Semnalul e sistematic:
  // la Spitalul Miercurea-Ciuc, 1.611 din 5.969 de fragmente (27%) sunt asa.
  const proportieLipite = fragmente.length ? cifreLipite / fragmente.length : 0;
  return {
    fragmente: fragmente.length,
    cuLitere: cuLitere.length,
    suspecte: suspecte.length,
    cifreLipite,
    proportieLipite,
    /** Fara niciun fragment cu litere, fisierul e scanat sau necitibil. */
    areText: cuLitere.length > 0,
    /** Text lizibil — necesar, dar NU suficient pentru a extrage un tabel. */
    sePoateFolosi: cuLitere.length > 0 && suspecte.length === 0 && proportieLipite <= 0.02,
  };
}

/**
 * Are documentul o pagina din care chiar se poate scoate un tabel?
 *
 * `calitateText` spune doar daca textul e lizibil. Lista Spitalului Judetean
 * Targu-Jiu trece verificarea aceea — 207.860 de fragmente, zero suspecte — dar
 * continutul e imprastiat in 661 de fluxuri cu una-trei bucati fiecare, deci nu
 * exista nicio pagina cu tabel. Un colector care s-ar lua dupa calitatea
 * textului ar raporta „citit cu succes" si ar produce zero randuri, sau, mai
 * rau, cateva randuri rupte care par valide.
 */
export function structuraTabel(buffer, minimColoane = 3, minimRanduri = 5) {
  const paginile = pagini(buffer);
  let ceaMaiBuna = { pagina: -1, coloane: 0, randuri: 0 };
  paginile.forEach((fragmente, index) => {
    const cate = coloane(fragmente).length;
    const cateRanduri = benzi(fragmente).length;
    if (cate > ceaMaiBuna.coloane || (cate === ceaMaiBuna.coloane && cateRanduri > ceaMaiBuna.randuri)) {
      ceaMaiBuna = { pagina: index, coloane: cate, randuri: cateRanduri };
    }
  });
  return {
    pagini: paginile.length,
    ...ceaMaiBuna,
    areTabel: ceaMaiBuna.coloane >= minimColoane && ceaMaiBuna.randuri >= minimRanduri,
  };
}

/** Textul intregului document, un rand pe linie. */
export function extrageText(buffer) {
  return randuri(buffer).join("\n");
}
