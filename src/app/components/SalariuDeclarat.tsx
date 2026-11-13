import Link from "@/app/components/Link";
import ghid from "@/data/repere-piata-verificate.json";
import anofm from "@/data/anofm-meserii.json";
import salario from "@/data/salario-pagini.json";
import acoperire from "@/data/acoperire-anunturi.json";
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
type Anofm = { oferte: number; angajatori: number; brutMedian: number; brutP25: number; brutP75: number; laMinim: number };

// Ghidul eJobs 2026 întâi; altfel pagina meseriei pe Salario (verificată pe 7 septembrie 2026).
const G: Record<string, Ghid> = {
  // Numai cu cel puțin 20 de salarii introduse: un regizor cu o singură declarație nu e o sumă.
  ...Object.fromEntries((salario.records as Ghid[]).filter((r) => (r.n ?? 0) >= 20).map((r) => [r.slug, { ...r, pagina: true }])),
  ...Object.fromEntries((ghid.records as Ghid[]).map((r) => [r.slug, r])),
};
/**
 * Rezerva meseriilor fără nicio altă cifră (13 noiembrie 2026, cererea proprietarului: „nu mai vreau
 * meserii fără salariu”): Salario de la 5 salarii introduse, cu numărul lor pe card. Nu pentru
 * meseriile unde rolul de pe Salario nu e meseria: la „Notar” media de 3.800 lei net vine de la
 * angajații birourilor notariale, nu de la notari, care nu sunt salariați.
 */
const SALARIO_MIN_REZERVA = 5;
// La „Pilot”, 6.500 lei net din 5 salarii nu e pilotul de linie (13 noiembrie 2026).
const SALARIO_ALT_ROL = new Set(["notar", "pilot"]);
const GR: Record<string, Ghid> = Object.fromEntries((salario.records as Ghid[])
  .filter((r) => (r.n ?? 0) >= SALARIO_MIN_REZERVA && !SALARIO_ALT_ROL.has(r.slug)).map((r) => [r.slug, { ...r, pagina: true }]));
const A = (anofm as unknown as { luna: string; meserii: Record<string, Anofm> });
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
  return a ? netDin(a.brutMedian) : null;
}
export const areSalariuDeclarat = (slug: string) => netDeclarat(slug) !== null;

/** Răspunsul scurt (întrebări frecvente, descrierea din Google), cu sursa în frază. */
export function frazaDeclarat(slug: string, de: string): string | null {
  const g = ghidSau(slug), a = g ? anofmMeserie(slug) : anofmPrincipal(slug);
  const f = (n: number) => n.toLocaleString("ro-RO");
  if (g) return `Cei care lucrează ca ${de} declară în medie ${f(g.net)} lei net pe lună, după ${g.pagina ? `${g.n ? cate(g.n, "salarii") + " introduse" : "salariile introduse"} pe Salario (eJobs)` : "Ghidul salarial eJobs 2026"}.${a ? ` În ofertele depuse la ANOFM, angajatorii declară ${f(a.brutMedian)} lei brut (mediana din ${cate(a.oferte, "oferte")}).` : ""}`;
  const r = anunturiRezerva(slug);
  if (r) return `În anunțurile de angajare citite de noi, unui ${de} i se oferă în jur de ${f(Math.round(r.centralEstimate! / 10) * 10)} lei net pe lună, mijlocul a ${cate(r.n, "anunțuri")} de la ${cate(r.employers, "angajatori")} din ${cate(r.counties, "județe")}.${a ? ` La ANOFM, angajatorii declară ${f(a.brutMedian)} lei brut (mediana din ${cate(a.oferte, "oferte")}${a.laMinim >= 25 ? `, ${a.laMinim}% la salariul minim` : ""}).` : ""}`;
  if (a) return `În ofertele depuse la ANOFM, angajatorii declară pentru un ${de} ${f(a.brutMedian)} lei brut, adică ${f(netDin(a.brutMedian)!)} lei net (mediana din ${cate(a.oferte, "oferte")}${a.laMinim >= 25 ? `; ${a.laMinim}% sunt la salariul minim` : ""}).`;
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
          : `Mediana din ${cate(a!.oferte, "oferte")} cu salariul brut declarat de ${cate(a!.angajatori, a!.angajatori === 1 ? "angajator" : "angajatori")}.`}
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
      <p className="mt-4 text-xs text-stone-600">
        {g && (g.pagina ? <>Salario (eJobs), salariile introduse de angajați · </> : <>Ghidul salarial eJobs 2026, salarii raportate pe Salario · </>)}
        {a && <>Ofertele ANOFM active în {A.luna} · </>}
        <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">sursele</Link>
      </p>
    </section>
  );
}
