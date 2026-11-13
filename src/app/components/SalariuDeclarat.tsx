import Link from "@/app/components/Link";
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
export type Dovada = { text: string; netMin: number; netMax: number };
const netDinBaza = (suma: number, baza: "brut" | "net" | null) => (baza === "net" ? suma : baza === "brut" ? netDin(suma) : null);
export function datePutine(slug: string): Dovada[] | null {
  if (ghidSau(slug) || anunturiRezerva(slug) || anofmToate(slug)) return null;
  const d: Dovada[] = [];
  const sal = (salario.records as Ghid[]).find((r) => r.slug === slug);
  if (sal && (sal.n ?? 0) >= 1 && !SALARIO_ALT_ROL.has(slug)) d.push({ text: sal.n === 1 ? `Salario (eJobs): ${lei(sal.net)} lei net, un singur salariu introdus, de cineva care lucrează ca „${sal.role}”` : `Salario (eJobs): ${lei(sal.net)} lei net, media a ${cate(sal.n!, "salarii introduse")} de cei care lucrează ca „${sal.role}”`, netMin: sal.net, netMax: sal.net });
  for (const o of (A.putine && Object.hasOwn(A.putine, slug) && !corComun(slug) ? A.putine[slug] : [])) {
    const a = o.min ?? o.max!, b = o.max && o.max >= a ? o.max : a;
    const na = netDinBaza(a, o.baza), nb = netDinBaza(b, o.baza);
    if (!na || !nb) continue; // fără bază declarată nu se poate spune cât e în mână
    d.push({ text: `Ofertă ANOFM${o.ocupatie || o.luna ? ` (${[o.ocupatie, o.luna && LUNA_RO(o.luna)].filter(Boolean).join(", ")})` : ""}: ${a === b ? lei(a) : `${lei(a)}–${lei(b)}`} lei ${o.baza}${o.baza === "brut" ? `, adică ${na === nb ? lei(na) : `${lei(na)}–${lei(nb)}`} lei net` : ""}`, netMin: na, netMax: nb });
  }
  // Aceeași ofertă depusă de două ori (același angajator, aceeași sumă) se arată o dată, cu numărul.
  const grupate = new Map<string, { d: Dovada; n: number }>();
  for (const x of d) { const g = grupate.get(x.text); if (g) g.n++; else grupate.set(x.text, { d: x, n: 1 }); }
  const r = [...grupate.values()].map(({ d: x, n }) => (n > 1 ? { ...x, text: x.text.replace(/^Ofertă ANOFM/, `${n} oferte ANOFM`) } : x));
  return r.length ? r : null;
}
const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
const LUNA_RO = (l: string) => `${LUNI[Number(l.slice(5, 7)) - 1]} ${l.slice(0, 4)}`;
const intervalPutine = (d: Dovada[]) => [Math.min(...d.map((x) => x.netMin)), Math.max(...d.map((x) => x.netMax))] as const;
/**
 * După toate: suma declarată public de angajator sau de platformă (venituri-declarate-public.json),
 * cu sursa, data și ce cuprinde. Pentru meseriile fără salarii publicate pe funcție (13 noiembrie 2026).
 */
type VenitPublic = { eticheta: string; text: string; sursa: string; url: string; nota?: string; net?: number; peste?: boolean; brut?: number; netMin?: number; netMax?: number; incasariMin?: number; incasariMax?: number };
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
const CARD = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";

export default function SalariuDeclarat({ slug, de }: { slug: string; de: string }) {
  const g = ghidSau(slug), a = g ? anofmMeserie(slug) : anofmPrincipal(slug);
  const r = g ? null : anunturiRezerva(slug);
  if (r) {
    const net = Math.round(r.centralEstimate! / 10) * 10, ao = anofmMeserie(slug);
    return (
      <section className={`mt-6 ${CARD}`} data-salary-kind="oferit-anunturi-rezerva" data-salary-primary={net}>
        <p className="text-xs font-medium text-stone-700">Cât oferă angajatorii unui {de} în anunțuri</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{lei(net)} lei net</p>
        <p className="mt-1 text-base text-stone-700">≈ {lei(Math.round(brutDinNetStandard(net) / 10) * 10)} lei brut pe lună</p>
        <p className="mt-1 text-sm text-stone-600">
          Mijlocul salariilor din {cate(r.n, "anunțuri")} cu suma și baza (net sau brut) scrise, de la {cate(r.employers, "angajatori")} din {cate(r.counties, "județe")}
. Sunt încă prea puține pentru intervalul complet, pe care îl publicăm de la 30 de anunțuri.
        </p>
        {ao && (
          <p className="mt-3 text-base text-stone-700">
            În ofertele depuse la ANOFM, angajatorii declară <strong className="font-semibold text-stone-900">{lei(ao.brutMedian)} lei brut</strong>, mediana din {cate(ao.oferte, "oferte")}
            {ao.laMinim >= 25 ? `; ${ao.laMinim}% sunt la salariul minim` : ""}.
          </p>
        )}
        <p className="mt-4 text-xs text-stone-600">
          Anunțurile active citite pe OLX, eJobs, BestJobs, Publi24 și alte platforme ·{ao ? ` ofertele ANOFM active în ${A.luna} · ` : " "}
          <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">sursele</Link>
        </p>
      </section>
    );
  }
  const vp = !g && !a ? venitPublic(slug) : null;
  if (vp) {
    const net = netPublic(vp);
    const mare = vp.incasariMin ? `${lei(vp.incasariMin)}–${lei(vp.incasariMax!)} lei` : vp.netMin ? `${lei(vp.netMin)}–${lei(vp.netMax!)} lei net` : `${vp.peste ? "peste " : ""}${lei(net!)} lei net`;
    return (
      <section className={`mt-6 ${CARD}`} data-salary-kind="declarat-public" data-salary-primary={net ?? vp.incasariMin}>
        <p className="text-xs font-medium text-stone-700">{vp.eticheta}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{mare}</p>
        {vp.brut ? <p className="mt-1 text-base text-stone-700">{lei(vp.brut)} lei brut pe lună</p> : vp.incasariMin ? <p className="mt-1 text-base text-stone-700">încasări brute pe lună, înainte de costuri</p> : null}
        <p className="mt-3 text-base text-stone-700">{vp.text}</p>
        {vp.nota && <p className="mt-2 text-sm text-stone-600">{vp.nota}</p>}
        <p className="mt-4 text-xs text-stone-600">
          <a href={vp.url} className="underline underline-offset-2" rel="noopener">{vp.sursa}</a> ·{" "}
          <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">sursele</Link>
        </p>
      </section>
    );
  }
  const dp = !g && !a ? datePutine(slug) : null;
  if (dp) {
    const [x, y] = intervalPutine(dp);
    return (
      <section className={`mt-6 ${CARD}`} data-salary-kind="date-putine" data-salary-primary={Math.round((x + y) / 20) * 10}>
        <p className="text-xs font-medium text-stone-700">Cât câștigă un {de}, din puținele date publicate</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{x === y ? `${lei(x)} lei net` : `${lei(x)}–${lei(y)} lei net`}</p>
        <p className="mt-1 text-sm text-stone-600">Orientativ: sunt prea puține date pentru o medie, așa că arătăm fiecare sumă găsită.</p>
        {Object.hasOwn(NOTA_MESERIE, slug) && <p className="mt-2 text-sm text-stone-700">{NOTA_MESERIE[slug]}</p>}
        <ul className="mt-3 space-y-1.5 text-base text-stone-700">
          {dp.map((v) => <li key={v.text}>{v.text}</li>)}
        </ul>
        <p className="mt-4 text-xs text-stone-600">
          Ofertele ANOFM cu codul COR al meseriei · Salario (eJobs), salariile introduse de angajați ·{" "}
          <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">sursele</Link>
        </p>
      </section>
    );
  }
  if (!g && !a) return null;
  const principal = g ? g.net : netDin(a!.brutMedian)!;
  return (
    <section className={`mt-6 ${CARD}`} data-salary-kind={g ? "declarat-angajati" : "declarat-anofm"} data-salary-primary={principal}>
      <p className="text-xs font-medium text-stone-700">
        {g ? `Cât declară că iau în mână cei care lucrează ca ${de}` : `Cât oferă angajatorii unui ${de}, declarat la ANOFM`}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{lei(principal)} lei net</p>
      <p className="mt-1 text-base text-stone-700">≈ {lei(g ? Math.round(brutDinNetStandard(principal) / 10) * 10 : a!.brutMedian)} lei brut pe lună</p>
      <p className="mt-1 text-sm text-stone-600">
        {g
          ? `Media salariilor declarate de angajați pentru „${g.role}”${g.n ? `, din ${cate(g.n, "salarii introduse")}` : ""}, din toată țara și toate nivelurile de experiență.`
          : `Mediana din ${cate(a!.oferte, "oferte")} cu salariul brut declarat de ${cate(a!.angajatori, a!.angajatori === 1 ? "angajator" : "angajatori")}${a!.grupa ? `, pentru ${a!.grupa}` : ""}.`}
      </p>
      {g && a && (
        <p className="mt-3 text-base text-stone-700">
          În ofertele depuse la ANOFM, angajatorii declară <strong className="font-semibold text-stone-900">{lei(a.brutMedian)} lei brut</strong>{" "}
          (≈ {lei(netDin(a.brutMedian)!)} lei net), mediana din {cate(a.oferte, "oferte")}.
        </p>
      )}
      {a && a.laMinim >= 25 && (
        <p className="mt-2 text-sm text-stone-600">
          {a.laMinim}% din ofertele ANOFM sunt la salariul minim: angajatorii declară adesea minimul, iar restul vine din sporuri și bonusuri.
        </p>
      )}
      {Object.hasOwn(NOTA_MESERIE, slug) && <p className="mt-2 text-sm text-stone-700">{NOTA_MESERIE[slug]}</p>}
      <p className="mt-4 text-xs text-stone-600">
        {g && (g.pagina ? <>Salario (eJobs), salariile introduse de angajați · </> : <>Ghidul salarial eJobs 2026, salarii raportate pe Salario · </>)}
        {a && <>Ofertele ANOFM active în {A.luna} · </>}
        <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">sursele</Link>
      </p>
    </section>
  );
}
