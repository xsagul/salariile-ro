import Link from "@/app/components/Link";
import CardSalariu, { type Reper } from "@/app/components/CardSalariu";
import ghid from "@/data/repere-piata-verificate.json";
import anofm from "@/data/anofm-meserii.json";
import salario from "@/data/salario-pagini.json";
import acoperire from "@/data/acoperire-anunturi.json";
import publice from "@/data/venituri-declarate-public.json";
import { brutDinNetStandard, calculStandard } from "@/lib/fiscal";
import { MESERII } from "@/lib/meserii";

/**
 * Primul ecran al meseriilor fără salariu-concluzie, grilă în plată sau venit oficial
 * (27 septembrie 2026, cererea proprietarului: fiecare meserie cu o sumă). Două surse, fiecare
 * numită pe card, fără medie între ele:
 *  - salariul net declarat de angajați în Ghidul salarial eJobs 2026 (Salario), o medie publicată;
 *  - salariul brut declarat de angajatori în ofertele depuse la ANOFM (mediana, cu cota la minim).
 * Cifra mare e a ghidului, unde există (e mai aproape de ce se ia în mână); altfel, ANOFM.
 */

type Ghid = { slug: string; role: string; net: number; n?: number | null; url?: string; pagina?: boolean };
type Anofm = { oferte: number; angajatori: number; brutMedian: number; brutP25: number; brutP75: number; laMinim: number; grupa?: string };

// Ghidul eJobs 2026 întâi; altfel pagina meseriei pe Salario (verificată pe 7 septembrie 2026).
const G: Record<string, Ghid> = {
  // Numai cu cel puțin 20 de salarii introduse: un regizor cu o singură declarație nu e o sumă.
  ...Object.fromEntries((salario.records as Ghid[]).filter((r) => (r.n ?? 0) >= 20).map((r) => [r.slug, { ...r, pagina: true }])),
  ...Object.fromEntries((ghid.records as Ghid[]).map((r) => [r.slug, r])),
};
/**
 * Rezerva meseriilor fără nicio altă cifră (13 noiembrie 2026, cererea proprietarului: „nu mai vreau
 * meserii fără salariu”): Salario de la 5 salarii introduse, cu numărul lor pe card.
 */
const SALARIO_MIN_REZERVA = 5;
const SALARIO_ALT_ROL = new Set<string>();
/** Ce trebuie spus lângă cifră când meseria nu se plătește de obicei cu salariu. */
const NOTA_MESERIE: Record<string, string> = {
  fermier: "Fermierul care își lucrează propria fermă nu are salariu: câștigă din ce vinde și din subvenții. Ofertele de mai jos sunt pentru agricultorii și crescătorii de animale angajați.",
  notar: "Notarul public nu e salariat: câștigă din onorariile biroului, iar venitul acesta nu-l publică nimeni. Suma de mai jos e a celor care s-au declarat notari pe Salario.",
};
const GR: Record<string, Ghid> = Object.fromEntries((salario.records as Ghid[])
  .filter((r) => (r.n ?? 0) >= SALARIO_MIN_REZERVA && !SALARIO_ALT_ROL.has(r.slug)).map((r) => [r.slug, { ...r, pagina: true }]));
type OfertaPutina = { baza: "brut" | "net" | null; min: number | null; max: number | null; luna: string | null; ocupatie?: string | null };
const A = (anofm as unknown as { luna: string; meserii: Record<string, Anofm>; putine?: Record<string, OfertaPutina[]> });
// Cifra principală din ANOFM cere 10 oferte; între 3 și 9 oferte, numai ca rezervă.
const ANOFM_MIN = 10;
const ghidMeserie = (slug: string): Ghid | null => (Object.hasOwn(G, slug) ? G[slug] : null);
// Un cod COR folosit de mai multe meserii din catalog (832201: taximetrist, șofer de ridesharing,
// șofer de distribuție) nu spune a cui e oferta: ofertele lui nu se arată la niciuna.
const corComun = (slug: string) => {
  const cor = MESERII.find((m) => m.slug === slug)?.cor;
  return !!cor && MESERII.filter((m) => m.cor === cor).length > 1;
};
const anofmToate = (slug: string): Anofm | null => (Object.hasOwn(A.meserii, slug) && !corComun(slug) ? A.meserii[slug] : null);
const anofmMeserie = (slug: string): Anofm | null => { const a = anofmToate(slug); return a && a.oferte >= ANOFM_MIN ? a : null; };
// Cifra paginii din ANOFM numai când sub un sfert din oferte sunt la minim, ca la salariul-concluzie:
// altfel mediana e chiar minimul, declarat ca formalitate (28 septembrie 2026, șofer de ridesharing).
const anofmPrincipalStrict = (slug: string): Anofm | null => { const a = anofmMeserie(slug); return a && a.laMinim < 25 ? a : null; };
/** Rezerva, numai fără Salario și fără ANOFM principal: ofertele ANOFM oricare ar fi cota la minim, de la 3. */
const rezervaSalario = (slug: string): Ghid | null => (!ghidMeserie(slug) && !anofmPrincipalStrict(slug) && Object.hasOwn(GR, slug) ? GR[slug] : null);
/**
 * Anunțurile citite de noi, sub pragul medianei publicate (30 de anunțuri, 10 cu perioada lunară scrisă),
 * dar cu cel puțin 10 anunțuri de la 5 angajatori: mijlocul lor, net, ca rezervă (manipulant, șofer de
 * distribuție). E înaintea ofertelor ANOFM, unde angajatorii declară mai ales minimul.
 */
type Acoperire = { n: number; employers: number; counties: number; centralEstimate: number | null; observedRange?: { min: number; max: number } | null; medianBounds?: unknown };
const AC = (acoperire as unknown as { coverage: Record<string, Acoperire> }).coverage;
export const anunturiRezerva = (slug: string): Acoperire | null => {
  if (ghidMeserie(slug) || anofmPrincipalStrict(slug) || rezervaSalario(slug) || !Object.hasOwn(AC, slug)) return null;
  const a = AC[slug];
  return !a.medianBounds && a.n >= 10 && a.employers >= 5 && a.centralEstimate ? a : null;
};
/**
 * Ultima treaptă, „date puține” (13 noiembrie 2026): sub toate pragurile, dar măsurat chiar pe meserie
 * (oferte ANOFM cu codul COR exact, Salario cu rolul exact, de la 2 salarii). Nu se face o medie:
 * pagina arată fiecare dovadă și intervalul lor, cu numărul spus. Anunțurile sub 10 nu intră: la
 * meseriile rare, potrivirea titlului greșește („marinar” prinsese un anunț din procesarea cărnii).
 */
export type Dovada = { text: string; netMin: number; netMax: number; eticheta: string };
const netDinBaza = (suma: number, baza: "brut" | "net" | null) => (baza === "net" ? suma : baza === "brut" ? netDin(suma) : null);
export function datePutine(slug: string): Dovada[] | null {
  if (ghidSau(slug) || anunturiRezerva(slug) || anofmToate(slug)) return null;
  const d: Dovada[] = [];
  const sal = (salario.records as Ghid[]).find((r) => r.slug === slug);
  if (sal && (sal.n ?? 0) >= 1 && !SALARIO_ALT_ROL.has(slug)) d.push({ eticheta: `Salario, ${sal.n === 1 ? "un salariu" : cate(sal.n!, "salarii")}`, text: sal.n === 1 ? `Salario (eJobs): ${lei(sal.net)} lei net, un singur salariu introdus, de cineva care lucrează ca „${sal.role}”` : `Salario (eJobs): ${lei(sal.net)} lei net, media a ${cate(sal.n!, "salarii introduse")} de cei care lucrează ca „${sal.role}”`, netMin: sal.net, netMax: sal.net });
  for (const o of (A.putine && Object.hasOwn(A.putine, slug) && !corComun(slug) ? A.putine[slug] : [])) {
    const a = o.min ?? o.max!, b = o.max && o.max >= a ? o.max : a;
    const na = netDinBaza(a, o.baza), nb = netDinBaza(b, o.baza);
    if (!na || !nb) continue; // fără bază declarată nu se poate spune cât e în mână
    d.push({ eticheta: "ANOFM, o ofertă", text: `Ofertă ANOFM${o.ocupatie || o.luna ? ` (${[o.ocupatie, o.luna && LUNA_RO(o.luna)].filter(Boolean).join(", ")})` : ""}: ${a === b ? lei(a) : `${lei(a)}–${lei(b)}`} lei ${o.baza}${o.baza === "brut" ? `, adică ${na === nb ? lei(na) : `${lei(na)}–${lei(nb)}`} lei net` : ""}`, netMin: na, netMax: nb });
  }
  // Aceeași ofertă depusă de două ori (același angajator, aceeași sumă) se arată o dată, cu numărul.
  const grupate = new Map<string, { d: Dovada; n: number }>();
  for (const x of d) { const g = grupate.get(x.text); if (g) g.n++; else grupate.set(x.text, { d: x, n: 1 }); }
  const r = [...grupate.values()].map(({ d: x, n }) => (n > 1 ? { ...x, eticheta: x.eticheta.replace(/^ANOFM, o ofertă/, `ANOFM, ${n} oferte`), text: x.text.replace(/^Ofertă ANOFM/, `${n} oferte ANOFM`) } : x));
  return r.length ? r : null;
}
const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
const LUNA_RO = (l: string) => `${LUNI[Number(l.slice(5, 7)) - 1]} ${l.slice(0, 4)}`;
const intervalPutine = (d: Dovada[]) => [Math.min(...d.map((x) => x.netMin)), Math.max(...d.map((x) => x.netMax))] as const;
/**
 * După toate: suma declarată public de angajator sau de platformă (venituri-declarate-public.json),
 * cu sursa, data și ce cuprinde. Pentru meseriile fără salarii publicate pe funcție (13 noiembrie 2026).
 */
type VenitPublic = { eticheta: string; scurt: string; text: string; sursa: string; sursaScurta?: string; url: string; nota?: string; net?: number; peste?: boolean; brut?: number; netMin?: number; netMax?: number; incasariMin?: number; incasariMax?: number };
const VP = publice as unknown as Record<string, VenitPublic | string>;
export function venitPublic(slug: string): VenitPublic | null {
  if (!Object.hasOwn(VP, slug) || typeof VP[slug] !== "object") return null;
  if (ghidSau(slug) || anunturiRezerva(slug) || anofmToate(slug) || datePutine(slug)) return null;
  return VP[slug] as VenitPublic;
}
/** Netul pentru liste (null la încasări, care nu sunt un venit net). */
const netPublic = (v: VenitPublic) => v.net ?? (v.brut ? netDin(v.brut) : v.netMin && v.netMax ? Math.round((v.netMin + v.netMax) / 20) * 10 : null);
const anofmPrincipal = (slug: string): Anofm | null =>
  anofmPrincipalStrict(slug) ?? (!ghidMeserie(slug) && !rezervaSalario(slug) && !anunturiRezerva(slug) ? anofmToate(slug) : null);
/** Salario (ghidul sau pagina cu ≥ 20 de salarii), altfel rezerva de la 5. */
const ghidSau = (slug: string): Ghid | null => ghidMeserie(slug) ?? rezervaSalario(slug);
// „5 oferte”, dar „20 de oferte”: numeralul cere „de” de la 20 în sus.
const cate = (n: number, ce: string) => `${n.toLocaleString("ro-RO")}${n % 100 >= 20 || n % 100 === 0 ? " de" : ""} ${ce}`;
const netDin = (brut: number) => calculStandard(brut)?.net ?? null;

/** Cifra de pe card: netul din ghid sau netul medianei ANOFM; aceeași pe /salarii și la „Meserii apropiate”. */
export function netDeclarat(slug: string): number | null {
  const g = ghidSau(slug);
  if (g) return g.net;
  const r = anunturiRezerva(slug);
  if (r) return Math.round(r.centralEstimate! / 10) * 10;
  const a = anofmPrincipal(slug);
  if (a) return netDin(a.brutMedian);
  const d = datePutine(slug);
  if (!d) { const v = venitPublic(slug); return v ? netPublic(v) : null; }
  const [x, y] = intervalPutine(d);
  return Math.round((x + y) / 20) * 10;
}
export const areSalariuDeclarat = (slug: string) => netDeclarat(slug) !== null || !!venitPublic(slug);

/** Răspunsul scurt (întrebări frecvente, descrierea din Google), cu sursa în frază. */
export function frazaDeclarat(slug: string, de: string): string | null {
  const g = ghidSau(slug), a = g ? anofmMeserie(slug) : anofmPrincipal(slug);
  const f = (n: number) => n.toLocaleString("ro-RO");
  if (g) return `Cei care lucrează ca ${de} declară în medie ${f(g.net)} lei net pe lună, după ${g.pagina ? `${g.n ? cate(g.n, "salarii") + " introduse" : "salariile introduse"} pe Salario (eJobs)` : "Ghidul salarial eJobs 2026"}.${a ? ` În ofertele depuse la ANOFM, angajatorii declară ${f(a.brutMedian)} lei brut (mediana din ${cate(a.oferte, "oferte")}).` : ""}`;
  const r = anunturiRezerva(slug);
  if (r) return `În anunțurile de angajare citite de noi, unui ${de} i se oferă în jur de ${f(Math.round(r.centralEstimate! / 10) * 10)} lei net pe lună, mijlocul a ${cate(r.n, "anunțuri")} de la ${cate(r.employers, "angajatori")} din ${cate(r.counties, "județe")}.${a ? ` La ANOFM, angajatorii declară ${f(a.brutMedian)} lei brut (mediana din ${cate(a.oferte, "oferte")}${a.laMinim >= 25 ? `, ${a.laMinim}% la salariul minim` : ""}).` : ""}`;
  const vp = !a ? venitPublic(slug) : null;
  if (vp) return `${vp.text}${vp.nota ? ` ${vp.nota}` : ""}`;
  const dp = !a ? datePutine(slug) : null;
  if (dp) { const [x, y] = intervalPutine(dp); return `Avem foarte puține date pentru ${de}: ${dp.map((v) => v.text).join("; ")}. ${x === y ? `Adică ${f(x)} lei net pe lună` : `Adică între ${f(x)} și ${f(y)} lei net pe lună`}, o cifră orientativă.`; }
  if (a) return `În ofertele depuse la ANOFM${a.grupa ? ` pentru ${a.grupa}` : ""}, angajatorii declară${a.grupa ? "" : ` pentru un ${de}`} ${f(a.brutMedian)} lei brut, adică ${f(netDin(a.brutMedian)!)} lei net (mediana din ${cate(a.oferte, "oferte")}${a.laMinim >= 25 ? `; ${a.laMinim}% sunt la salariul minim` : ""}).`;
  return null;
}

const lei = (n: number) => n.toLocaleString("ro-RO");

export default function SalariuDeclarat({ slug, de }: { slug: string; de: string }) {
  const g = ghidSau(slug), a = g ? anofmMeserie(slug) : anofmPrincipal(slug);
  const nota = Object.hasOwn(NOTA_MESERIE, slug) ? NOTA_MESERIE[slug] : null;
  const surse = <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">Sursele</Link>;
  const brutDe = (net: number) => `≈ ${lei(Math.round(brutDinNetStandard(net) / 10) * 10)} lei brut pe lună`;
  // Ce declară angajatorii la ANOFM, ca reper, când cifra mare vine din altă parte.
  const repereAnofm = (x: Anofm | null): Reper[] => !x ? [] : [
    { eticheta: "Declarat la ANOFM", valoare: `${lei(x.brutMedian)} lei brut` },
    ...(x.laMinim >= 25 ? [{ eticheta: "Oferte la salariul minim", valoare: `${x.laMinim}%` }] : []),
  ];

  const vp = !g && !a ? venitPublic(slug) : null;
  if (vp) {
    const net = netPublic(vp);
    return (
      <CardSalariu
        tip="declarat-public" primar={net ?? vp.incasariMin}
        eticheta={vp.eticheta}
        cifra={vp.incasariMin ? `${lei(vp.incasariMin)}–${lei(vp.incasariMax!)} lei` : vp.netMin ? `${lei(vp.netMin)}–${lei(vp.netMax!)} lei net` : `${vp.peste ? "peste " : ""}${lei(net!)} lei net`}
        brut={vp.brut ? `${lei(vp.brut)} lei brut pe lună` : vp.incasariMin ? "încasări brute pe lună, înainte de costuri" : null}
        explicatie={vp.scurt}
        nota={vp.nota}
        sursa={<><a href={vp.url} title={vp.sursa} className="underline underline-offset-2" rel="noopener">{vp.sursaScurta ?? vp.sursa}</a> · {surse}</>}
      />
    );
  }
  const dp = !g && !a ? datePutine(slug) : null;
  if (dp) {
    const [x, y] = intervalPutine(dp);
    return (
      <CardSalariu
        tip="date-putine" primar={Math.round((x + y) / 20) * 10}
        eticheta={`Cât câștigă un ${de}`}
        cifra={x === y ? `${lei(x)} lei net` : `${lei(x)}–${lei(y)} lei net`}
        explicatie="Orientativ: am găsit foarte puține salarii publicate."
        repere={dp.map((v) => ({ eticheta: v.eticheta, valoare: v.netMin === v.netMax ? `${lei(v.netMin)} lei` : `${lei(v.netMin)}–${lei(v.netMax)} lei` }))}
        nota={nota}
        sursa={<>Salario (eJobs) și ofertele ANOFM · {surse}</>}
      />
    );
  }
  const r = g ? null : anunturiRezerva(slug);
  if (r) {
    const net = Math.round(r.centralEstimate! / 10) * 10;
    return (
      <CardSalariu
        tip="oferit-anunturi-rezerva" primar={net}
        eticheta={`Cât oferă angajatorii unui ${de}`}
        cifra={`${lei(net)} lei net`}
        brut={brutDe(net)}
        explicatie={`Mijlocul salariilor din ${cate(r.n, "anunțuri")} de angajare.`}
        repere={repereAnofm(anofmMeserie(slug))}
        nota={nota}
        sursa={<>Din {cate(r.n, "anunțuri")} de la {cate(r.employers, "angajatori")}, {cate(r.counties, "județe")} · {surse}</>}
      />
    );
  }
  if (!g && !a) return null;
  if (g) {
    return (
      <CardSalariu
        tip="declarat-angajati" primar={g.net}
        eticheta={`Cât iau în mână cei care lucrează ca ${de}`}
        cifra={`${lei(g.net)} lei net`}
        brut={brutDe(g.net)}
        explicatie={g.n ? `Media salariilor declarate de ${cate(g.n, "angajați")}.` : "Media salariilor declarate de angajați."}
        repere={repereAnofm(a)}
        nota={nota}
        sursa={<>{g.pagina ? "Salario (eJobs)" : "Ghidul salarial eJobs 2026"}{a ? `, ofertele ANOFM din ${A.luna}` : ""} · {surse}</>}
      />
    );
  }
  const net = netDin(a!.brutMedian)!;
  return (
    <CardSalariu
      tip="declarat-anofm" primar={net}
      eticheta={`Cât oferă angajatorii unui ${de}`}
      cifra={`${lei(net)} lei net`}
      brut={`≈ ${lei(a!.brutMedian)} lei brut pe lună`}
      explicatie={`Mijlocul a ${cate(a!.oferte, "oferte")} depuse la ANOFM${a!.grupa ? ", pentru ocupațiile apropiate" : ""}.`}
      repere={a!.laMinim >= 25 ? [{ eticheta: "Oferte la salariul minim", valoare: `${a!.laMinim}%` }] : []}
      nota={nota ?? (a!.laMinim >= 25 ? "Angajatorii declară adesea minimul la ANOFM; sporurile și bonusurile vin peste." : null)}
      sursa={<>Ofertele ANOFM din {A.luna}{a!.grupa ? `, ${a!.grupa}` : ""} · {surse}</>}
    />
  );
}
