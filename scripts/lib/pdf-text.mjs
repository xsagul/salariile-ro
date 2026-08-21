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

/** Randurile documentului, reconstruite din pozitiile fragmentelor. */
export function randuri(buffer) {
  const toate = [];
  for (const { antet, date } of streamuri(buffer)) {
    const desfacut = dezarhiveaza(antet, date);
    if (!desfacut) continue;
    const continut = desfacut.toString("latin1");
    // Un content stream contine operatori de text; sarim peste fonturi si imagini.
    if (!/\bTj\b/.test(continut) && !/\bTJ\b/.test(continut)) continue;
    // Fiecare stream e o pagina: randurile ei se inchid inainte de urmatoarea.
    toate.push(...randuriDinFragmente(fragmenteDinContinut(continut)));
  }
  return toate;
}

/** Textul intregului document, un rand pe linie. */
export function extrageText(buffer) {
  return randuri(buffer).join("\n");
}
