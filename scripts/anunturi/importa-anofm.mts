// Anunțurile de pornire din ofertele ANOFM (proprietar, 30 septembrie 2026: „le poți pune direct ca și
// cum ar fi fost trecute prin postează anunț, cu data de publicare originală”). Fiecare ofertă
// eligibilă devine cererea pe care o trimite formularul de pe /adauga-anunt-angajare, trece prin
// aceleași reguli (`valideaza`) și ajunge în D1 cu rândul pe care l-ar scrie `adauga` din
// worker/date.ts: aceleași coloane, slug, meserie, net și coordonate. Diferențe: `creat_la` e data
// publicării la ANOFM, iar `expira_la` e data până la care angajatorul a declarat oferta acolo.
//
// Eligibilă: telefon românesc valid, localitatea găsită în lista SIRUTA a formularului, o sumă și
// baza ei, descrierea originală de cel puțin 80 de caractere (minimul formularului).
// Titlul e ocupația din ofertă, cu litere mici (regula formularului respinge titlul numai cu majuscule).
// Baza: cea declarată la ANOFM; fără ea, numai când se vede din ofertă — salariul minim brut
// sau cuvântul „net”/„brut” în descriere. Altfel oferta se sare: netul nu se presupune.
//
//   tsx scripts/anunturi/importa-anofm.mts --din=oferte.json        (numai raport)
//   tsx scripts/anunturi/importa-anofm.mts --din=oferte.json --sql  (scrie .anunturi-import/import.sql)
//   wrangler d1 execute salariile-anunturi --remote --file=.anunturi-import/import.sql
//
// `--din`: răspunsurile API-ului mediere.anofm.ro/api/entity/vw_public_job_posting, rândurile brute.
// Linkurile de gestionare se scriu în .anunturi-import/ (ignorat de git): în bază stă numai hash-ul lor.
import crypto from "node:crypto";
import fs from "node:fs";
import { JUDETE, faraDiacritice, netLunar, orasSlug, slugAnunt, telefonCurat, valideaza, type AnuntNou } from "../../src/lib/anunturi/reguli";
import { MESERII_ANUNTURI, ghicesteMeserie } from "../../src/lib/anunturi/meserii";
import { SALARIU_MINIM } from "../../src/lib/fiscal";
import { localizeaza, type Loc } from "../../worker/geocod";

type Oferta = Record<string, string | number | boolean | null>;
type Localitate = [string, string, string, number];

const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const SQL = process.argv.includes("--sql");
const SITE = "https://salariile.ro";
const DIR = ".anunturi-import";
const PAUZA_MS = 2200; // o adresă cere Nominatim de cel mult două ori; politica lor: o cerere pe secundă

const MESERII = new Set(MESERII_ANUNTURI.map((m) => m.slug));
const LOCALITATI: Localitate[] = JSON.parse(fs.readFileSync("public/date/anunturi/localitati.json", "utf8"));
const cheie = (s: string) => faraDiacritice(s).replace(/[^a-z0-9]+/g, " ").trim();
const JUDET_DUPA_NUME = new Map(Object.entries(JUDETE).map(([cod, nume]) => [cheie(nume), cod]));
const PE_JUDET = new Map<string, Localitate[]>();
for (const l of LOCALITATI) PE_JUDET.set(l[1], [...(PE_JUDET.get(l[1]) ?? []), l]);

const faraPrefix = (s: string) => cheie(s).replace(/^(municipiul|oras|orasul|comuna)\s+/, "");

/** „Dolj > MOTATEI > DOBRIDOR” → Dobridor (sat din comuna Motatei, jud. Dolj), cum îl alege formularul. */
export function localitate(cale: string): { oras: string; judet: string } | null {
  const [jud, uat, loc] = cale.split(" > ").map((x) => x.trim());
  const judet = /bucuresti/.test(cheie(jud ?? "")) ? "B" : JUDET_DUPA_NUME.get(cheie(jud ?? ""));
  if (!judet) return null;
  if (judet === "B") return { oras: "București", judet };
  const lista = PE_JUDET.get(judet) ?? [];
  const u = faraPrefix(uat ?? ""), l = faraPrefix(loc ?? uat ?? "");
  const gasita = lista.find((x) => cheie(x[0]) === l && (cheie(x[2]) === u || (!x[2] && cheie(x[0]) === u)))
    ?? lista.find((x) => cheie(x[0]) === l && !x[2])
    ?? (loc ? undefined : lista.find((x) => cheie(x[0]) === u));
  return gasita ? { oras: gasita[0], judet } : null;
}

const cuMajusculaInitiala = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Cuvintele scrise numai cu majuscule („Calea CHIŞINĂULUI”), cu literă mare doar la început (adresele). */
const cuvinte = (s: string) => s.replace(/\p{Lu}{2,}/gu, (w) => w.charAt(0) + w.slice(1).toLowerCase());

export function titlu(o: Oferta): string {
  let t = cuMajusculaInitiala(String(o.occupation ?? "").replace(/\s+/g, " ").trim().toLowerCase());
  if (t.length < 8) t = `Angajăm ${t.toLowerCase()}`; // „Casier” are 6 litere; minimul formularului e 8
  if (t.length > 90) t = t.slice(0, 90).replace(/[\s,;-]+\S*$/, "");
  return t;
}

export function adresa(o: Oferta): string | undefined {
  const strada = String(o.address_street ?? "").replace(/\s+/g, " ").trim();
  const nr = String(o.address_street_number ?? "").replace(/\s+/g, " ").trim();
  if (strada.length < 2) return undefined;
  const a = cuvinte(nr && !strada.includes(nr) ? `${strada} ${nr}` : strada);
  return a.length > 120 ? undefined : a;
}

/** Baza sumei: cea declarată; altfel numai ce se vede din ofertă. */
export function baza(o: Oferta, suma: number): "brut" | "net" | null {
  if (o.salary_type === "gross") return "brut";
  if (o.salary_type === "net") return "net";
  const d = faraDiacritice(String(o.description ?? ""));
  const net = /\bnet\b/.test(d), brut = /\bbrut\b/.test(d);
  if (net !== brut) return net ? "net" : "brut";
  // Salariul minim e o sumă brută; ANOFM îl vede exact la ofertele „la minim”.
  if (suma === SALARIU_MINIM || suma === 4050) return "brut";
  return null;
}

const persoanaFizica = (o: Oferta) => {
  const cod = String(o.employer_tax_code ?? "").replace(/\D/g, "");
  return cod.length === 13 || /\b(P\.?F\.?A|I\.?I\.?|I\.?F\.?)\b/i.test(String(o.employer_name ?? ""));
};

/** Cererea formularului pentru o ofertă, sau motivul pentru care nu e eligibilă. */
export function cerere(o: Oferta): { corp: Record<string, unknown> } | { motiv: string } {
  const telefon = telefonCurat(String(o.contact_phone ?? "").replace(/^\s*40\s*(?=7)/, "0"));
  if (!telefon) return { motiv: "fără telefon românesc valid" };
  const descriere = String(o.description ?? "").trim();
  if (descriere.length < 80) return { motiv: "descriere sub 80 de caractere" };
  const loc = localitate(String(o.address_locality_name ?? ""));
  if (!loc) return { motiv: "localitate negăsită" };
  const min = Math.round(Number(o.minimum_salary) || 0), max = Math.round(Number(o.maximum_salary) || 0);
  const salariuMin = min || max, salariuMax = max > salariuMin ? max : null;
  // O sumă de două-trei cifre e plata pe oră sau pe zi, nu salariul lunar pe care îl cere formularul.
  if (salariuMin < 1000) return { motiv: "fără sumă lunară" };
  const b = baza(o, salariuMin);
  if (!b) return { motiv: "baza sumei nu se vede" };
  const partiala = /parțial|partial/i.test(String(o.work_type_name ?? ""));
  const ore = Number(/(\d)\s*(h|ore)/i.exec(String(o.work_type_details ?? ""))?.[1]);
  if (partiala && !(ore >= 1 && ore <= 7)) return { motiv: "normă parțială fără orele pe zi" };
  const contractNume = faraDiacritice(String(o.contract_type_name ?? ""));
  const regim = faraDiacritice(String(o.work_regime_name ?? ""));
  return {
    corp: {
      titlu: titlu(o),
      meserie: "",
      angajator: persoanaFizica(o) ? "" : String(o.employer_name ?? "").replace(/\s+/g, " ").trim().slice(0, 120),
      judet: loc.judet,
      oras: loc.oras,
      adresa: adresa(o) ?? "",
      norma: partiala ? "partiala" : "intreaga",
      orePeZi: partiala ? String(ore) : "",
      faraExperienta: /^fara experienta/.test(faraDiacritice(String(o.professional_experience_name ?? ""))),
      contract: /sezon/.test(contractNume) ? "sezonier" : /nedeterminat/.test(contractNume) ? "nedeterminata" : /determinat/.test(contractNume) ? "determinata" : "",
      locMunca: /hibrid/.test(regim) ? "hibrid" : /domiciliu|telemunca|distanta/.test(regim) ? "acasa" : /sediu/.test(regim) ? "sediu" : "",
      salariuMin: String(salariuMin),
      salariuMax: salariuMax ? String(salariuMax) : "",
      baza: b,
      descriere,
      telefon,
      email: "",
      acordPublicare: true,
    },
  };
}

async function main() {
  const din = arg("din");
  if (!din) throw new Error("--din=oferte.json lipsește");
  const oferte: Oferta[] = JSON.parse(fs.readFileSync(din, "utf8"));
  const publicate: Record<string, unknown> =
    fs.existsSync(`${DIR}/gestionare.json`) && !SQL ? JSON.parse(fs.readFileSync(`${DIR}/gestionare.json`, "utf8")) : {};

  const motive = new Map<string, number>(), deTrimis: { anofm: string; corp: Record<string, unknown>; anunt: AnuntNou; oferta: Oferta }[] = [];
  const vazute = new Set<string>();
  for (const o of oferte) {
    const r = cerere(o);
    if ("motiv" in r) { motive.set(r.motiv, (motive.get(r.motiv) ?? 0) + 1); continue; }
    const v = valideaza(r.corp, MESERII);
    if ("erori" in v) { const m = `respinsă de reguli: ${v.erori[0].mesaj}`; motive.set(m, (motive.get(m) ?? 0) + 1); continue; }
    // Aceeași ofertă declarată de mai multe ori (alt ID, aceleași date) intră o singură dată.
    const dublura = [o.employer_id, r.corp.titlu, r.corp.oras, r.corp.salariuMin, r.corp.baza].join("|");
    if (vazute.has(dublura)) { motive.set("dublură", (motive.get("dublură") ?? 0) + 1); continue; }
    vazute.add(dublura);
    if (publicate[String(o.id)]) { motive.set("publicată deja", (motive.get("publicată deja") ?? 0) + 1); continue; }
    deTrimis.push({ anofm: String(o.id), corp: r.corp, anunt: v.anunt, oferta: o });
  }
  console.log(`Oferte: ${oferte.length}. De publicat: ${deTrimis.length}.`);
  for (const [m, n] of [...motive].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(5)}  ${m}`);
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(`${DIR}/de-publicat.json`, JSON.stringify(deTrimis, null, 1));
  if (!SQL) { console.log(`Cererile: ${DIR}/de-publicat.json. Fără --sql nu se scrie nimic de publicat.`); return; }

  // Coordonatele, ca la publicarea din formular (worker/geocod.ts), o singură dată pe adresă.
  const fisGeo = `${DIR}/geocod.json`;
  const geo: Record<string, Loc | null> = fs.existsSync(fisGeo) ? JSON.parse(fs.readFileSync(fisGeo, "utf8")) : {};
  const randuri: { creat: string; sql: string; anofm: string; slug: string; token: string; loc: boolean }[] = [];
  const maine = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  for (const [i, x] of deTrimis.entries()) {
    if (String(x.oferta.job_expiry_date) < maine) continue; // expiră la ANOFM azi: n-ar apărea deloc
    const a = x.anunt, k = `${a.adresa ?? ""}|${a.oras}|${a.judet}`;
    if (!(k in geo)) {
      geo[k] = await localizeaza(a.adresa, a.oras, a.judet);
      fs.writeFileSync(fisGeo, JSON.stringify(geo));
      await new Promise((z) => setTimeout(z, PAUZA_MS));
      if (i % 50 === 0) console.log(`  coordonate: ${i}/${deTrimis.length}`);
    }
    const loc = geo[k];
    const creat = oraBucuresti(String(x.oferta.created_at));
    const expira = new Date(`${x.oferta.job_expiry_date}T23:59:59+03:00`).toISOString();
    const token = crypto.randomBytes(32).toString("base64url");
    const slug = slugAnunt(a.titlu, a.oras);
    const v = [a.titlu, slug, a.meserie || ghicesteMeserie(a.titlu), a.angajator, a.judet, a.oras, orasSlug(a.oras),
      a.adresa ?? null, loc?.lat ?? null, loc?.lon ?? null, loc?.precizie ?? null, a.norma, a.orePeZi ?? null,
      a.faraExperienta ? 1 : 0, a.contract ?? null, a.locMunca ?? null, a.salariuMin, a.salariuMax ?? null, a.baza,
      netLunar(a.salariuMin, a.baza), a.descriere, a.telefon, null, crypto.createHash("sha256").update(token).digest("hex"), creat, creat, expira];
    // Coloanele și valorile lui `adauga` din worker/date.ts: rândul arată ca unul trimis din formular.
    randuri.push({ creat, anofm: x.anofm, slug, token, loc: Boolean(loc), sql:
      `INSERT INTO anunturi (stare, titlu, slug, meserie, angajator, judet, oras, oras_slug, adresa, lat, lon, loc_precizie, norma, ore_pe_zi, ` +
      `fara_experienta, contract, loc_munca, salariu_min, salariu_max, baza, net_min, descriere, telefon, email, token_hash, creat_la, confirmat_la, expira_la) ` +
      `VALUES ('activ', ${v.map(sqlValoare).join(", ")});` });
  }
  // În ordinea publicării la ANOFM: ID-urile cresc cu data, ca la anunțurile puse din formular.
  randuri.sort((a, b) => a.creat.localeCompare(b.creat));
  fs.writeFileSync(`${DIR}/import.sql`, randuri.map((r) => r.sql).join("\n") + "\n");
  fs.writeFileSync(`${DIR}/gestionare.json`, JSON.stringify(Object.fromEntries(randuri.map((r) => [r.anofm, { slug: r.slug, gestionare: `${SITE}/adauga-anunt-angajare/gestioneaza#${r.token}` }])), null, 1));
  const faraLoc = randuri.filter((r) => !r.loc).length;
  console.log(`${DIR}/import.sql: ${randuri.length} anunțuri, ${faraLoc} fără coordonate. Linkurile de gestionare: ${DIR}/gestionare.json.`);
}

/** „2026-09-29 22:48:13”, ora României (ANOFM), în ISO UTC, cum scrie Worker-ul `creat_la`. */
function oraBucuresti(s: string): string {
  const ca = new Date(`${s.replace(" ", "T")}Z`);
  const acolo = new Date(ca.toLocaleString("en-US", { timeZone: "Europe/Bucharest" }));
  const aici = new Date(ca.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(ca.getTime() - (acolo.getTime() - aici.getTime())).toISOString();
}

const sqlValoare = (x: unknown) => (x == null ? "NULL" : typeof x === "number" ? String(x) : `'${String(x).replace(/'/g, "''")}'`);

if (process.argv[1]?.endsWith("importa-anofm.mts")) await main();
