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

// Siruri literale intre paranteze, cu escapari inauntru.
const REGEX_SIR = new RegExp("\\((?:\\\\.|[^\\\\()])*\\)", "g");

// Un operator PDF si operanzii lui numerici sau siruri. Scanam secvential,
// pentru ca pozitia textului conteaza: intr-un tabel, celulele de pe acelasi
// rand sunt fragmente separate, emise fiecare cu propriul Tj.
const REGEX_TOKEN = new RegExp(
  "(\\[(?:[^\\[\\]\\\\]|\\\\.)*\\])|" + // tabloul de la TJ
    "(\\((?:\\\\.|[^\\\\()])*\\))|" + // sir literal
    "(-?\\d+(?:\\.\\d+)?)|" + // numar
    "(Tm|Td|TD|T\\*|TJ|Tj|TL|BT|ET|'|\")", // operatorii care ne intereseaza
  "g",
);

/**
 * Fragmentele de text dintr-un content stream, fiecare cu pozitia lui.
 *
 * PDF-ul nu are notiunea de „rand de tabel": are fragmente asezate la
 * coordonate. Reconstruim randurile grupand dupa Y si sortand dupa X, altfel
 * o data ca „31.03.2026" iese bucatita in „3", „1", „.0", „3", „.202", „6".
 */
function fragmenteDinContinut(continut) {
  const fragmente = [];
  let x = 0;
  let y = 0;
  let leading = 0;
  const numere = [];
  let token;
  REGEX_TOKEN.lastIndex = 0;
  while ((token = REGEX_TOKEN.exec(continut)) !== null) {
    const [, tablou, sir, numar, operator] = token;
    if (numar !== undefined) {
      numere.push(parseFloat(numar));
      continue;
    }
    if (tablou !== undefined || sir !== undefined) {
      // Sirurile raman in coada pana la operatorul care le afiseaza.
      numere.push(tablou !== undefined ? { tablou } : { sir });
      continue;
    }
    if (operator === undefined) continue;

    const argumente = numere.splice(0, numere.length);
    const siruri = argumente.filter((a) => typeof a === "object");
    const cifre = argumente.filter((a) => typeof a === "number");

    switch (operator) {
      case "Tm":
        if (cifre.length >= 6) {
          // Ultimii sase operanzi, nu primii: in coada s-au putut aduna si
          // numere de la operatori pe care nu ii tratam (Tf, cm, re).
          const matrice = cifre.slice(-6);
          x = matrice[4];
          y = matrice[5];
        }
        break;
      case "Td":
      case "TD":
        if (cifre.length >= 2) {
          x += cifre[cifre.length - 2];
          y += cifre[cifre.length - 1];
          if (operator === "TD") leading = -cifre[cifre.length - 1];
        }
        break;
      case "T*":
        y -= leading;
        break;
      case "TL":
        if (cifre.length) leading = cifre[cifre.length - 1];
        break;
      case "BT":
        x = 0;
        y = 0;
        break;
      case "'":
      case '"':
        y -= leading;
      // fallthrough: ' si " afiseaza sirul dupa ce trec la randul urmator
      case "Tj":
      case "TJ": {
        for (const argument of siruri) {
          let text = "";
          if (argument.sir !== undefined) {
            text = decodeazaSir(argument.sir.slice(1, -1));
          } else {
            // TJ: siruri intercalate cu ajustari de kerning. O ajustare mare
            // negativa inseamna spatiu vizibil intre glife.
            const parti = argument.tablou.match(REGEX_SIR) ?? [];
            text = parti.map((p) => decodeazaSir(p.slice(1, -1))).join("");
          }
          if (text.trim()) fragmente.push({ x, y, text });
        }
        break;
      }
      default:
        break;
    }
  }
  return fragmente;
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
      bucati
        .sort((a, b) => a.x - b.x)
        .map((b) => b.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
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
export function pagini(buffer) {
  const rezultat = [];
  for (const { antet, date } of streamuri(buffer)) {
    const desfacut = dezarhiveaza(antet, date);
    if (!desfacut) continue;
    const continut = desfacut.toString("latin1");
    if (!/\bTj\b/.test(continut) && !/\bTJ\b/.test(continut)) continue;
    const fragmente = fragmenteDinContinut(continut);
    if (fragmente.length) rezultat.push(fragmente);
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
  return {
    fragmente: fragmente.length,
    cuLitere: cuLitere.length,
    suspecte: suspecte.length,
    /** Fara niciun fragment cu litere, fisierul e scanat sau necitibil. */
    areText: cuLitere.length > 0,
  };
}

/** Textul intregului document, un rand pe linie. */
export function extrageText(buffer) {
  return randuri(buffer).join("\n");
}
