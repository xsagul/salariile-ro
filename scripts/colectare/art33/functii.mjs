// Legătura dintre denumirea unei funcții din listele art. 33 și meseria din catalog
// (src/lib/meserii.ts). Reguli stricte, ca la anunțuri: o meserie nu se lărgește ca să
// atingă un prag (CLAUDE.md).
//
// - Funcțiile de conducere (șef, coordonator, director, manager, adjunct) nu intră: sunt alt
//   post, cu indemnizație de conducere.
// - „Îngrijitoare” din spitale face curățenie (COR 532104), nu îngrijire de bătrâni: intră la
//   îngrijitor de bătrâni doar în instituțiile de asistență socială (DGASPC).

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

const CONDUCERE = /\b(SEF|SEFA|COORDONATOR|COORDONATOARE|DIRECTOR|MANAGER|ADJUNCT|INLOCUITOR|PRESEDINTE|VICEPRESEDINTE|PRIM PROCUROR)\b/;

/** [slug, regex pe textul normalizat, tipuri de instituții permise (opțional)] */
const REGULI = [
  // Instanțele și parchetele (liste scanate, citite prin OCR din 27 septembrie 2026). Rândul
  // începe cu funcția; „Președinte judecătorie”, „prim-procuror” sunt conducere și ies mai sus.
  ["judecator", /^JUDECATOR\b/, ["instanta"]],
  ["procuror", /^PROCUROR\b/, ["parchet"]],
  ["grefier", /\bGREFIER\b/, ["instanta", "parchet"]],
  ["asistent-farmacie", /\bASISTENT (MEDICAL )?(DE )?FARMACIE\b/],
  ["asistent-medical", /\bASISTENT MEDICAL\b|\bSORA MEDICALA\b/],
  ["asistent-social", /\bASISTENT SOCIAL\b/],
  ["infirmier", /\bINFIRMIER/],
  ["ingrijitor-batrani", /\bINGRIJITOR|\bINGRIJITOARE\b/, ["dgaspc"]],
  ["registrator-medical", /\bREGISTRATOR MEDICAL\b/],
  ["sofer-ambulanta", /\bSOFER (DE )?(AUTOSANITARA|AMBULANTA)\b|\bAMBULANTIER\b/],
  ["psiholog", /\bPSIHOLOG\b/],
  ["fizioterapeut", /\bFIZIOTERAPEUT\b|\bFIZIOKINETOTERAPEUT\b/],
  ["kinetoterapeut", /\bKINETOTERAPEUT\b/],
  ["medic-rezident", /\bMEDIC REZIDENT\b/],
  ["medic", /\bMEDIC (PRIMAR|SPECIALIST)\b/],
  ["farmacist", /^FARMACIST\b/],
  ["bucatar", /\bBUCATAR\b/],
  ["electrician", /\bELECTRICIAN\b/],
  ["instalator", /\bINSTALATOR\b/],
  ["economist", /\bECONOMIST\b/],
  ["contabil", /\bCONTABIL\b/],
  ["magaziner", /\bMAGAZINER\b/],
  ["bibliotecar", /\bBIBLIOTECAR\b/],
  // Instituțiile de spectacole și concerte (teatre, filarmonici, opere). „Regizor scenă” e
  // conducătorul de spectacol din culise, altă meserie decât regizorul artistic.
  ["muzician", /\bARTIST (INSTRUMENTIST|LIRIC)\b|\bINSTRUMENTIST\b|\bCORIST\b|\bSOLIST (VOCAL|INSTRUMENTIST)\b/, ["cultura"]],
  ["regizor", /\bREGIZOR ARTISTIC\b/, ["cultura"]],
  ["actor", /^ACTOR\b|\bACTOR (I|II|III|IA|DEBUTANT|PAPUSAR|MANUIT)/, ["cultura"]],
  ["educator", /\bEDUCATOR\b/],
  ["programator", /\bPROGRAMATOR\b/],
  ["consilier-juridic", /\bCONSILIER JURIDIC\b/],
  // Doar gradul de profesor: lectorul și conferențiarul sunt alte trepte, cu alte salarii.
  ["profesor-universitar", /\bPROFESOR UNIVERSITAR\b|^PROFESOR\b/, ["universitate"]],
  // Funcțiile publice de execuție din primării, consilii și instituții centrale.
  ["functionar-public", /^(CONSILIER|INSPECTOR|REFERENT|AUDITOR|EXPERT)\b/, ["primarie", "consiliu-judetean", "institutie-centrala"]],
];

/** Studiile, din textul rândului: S, SSD, PL, M, G sau null. */
export function studii(text) {
  const t = ` ${norm(text)} `;
  if (/ (SSD|SCURTA DURATA) /.test(t)) return "SSD";
  if (/ (S|SUPERIOARE|LICENTA|UNIVERSITARE) /.test(t)) return "S";
  if (/ (PL|POSTLICEALE|POST LICEALE|POSTLICEAL) /.test(t)) return "PL";
  if (/ (M|MEDII|LICEALE) /.test(t)) return "M";
  if (/ (G|GENERALE|GIMNAZIALE) /.test(t)) return "G";
  return null;
}

/** Meseria din catalog pentru un rând, sau null. `tip` = tipul instituției. */
export function meserie(text, tip) {
  const t = norm(text);
  if (CONDUCERE.test(t)) return null;
  for (const [slug, re, tipuri] of REGULI) {
    if (re.test(t) && (!tipuri || tipuri.includes(tip))) return slug;
  }
  return null;
}

export const MESERII_ART33 = REGULI.map(([slug]) => slug);
