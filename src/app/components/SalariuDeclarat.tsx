import Link from "@/app/components/Link";
import ghid from "@/data/repere-piata-verificate.json";
import anofm from "@/data/anofm-meserii.json";
import salario from "@/data/salario-pagini.json";
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
const A = (anofm as unknown as { luna: string; meserii: Record<string, Anofm> });
const ghidMeserie = (slug: string): Ghid | null => (Object.hasOwn(G, slug) ? G[slug] : null);
// Un cod COR folosit de mai multe meserii din catalog (832201: taximetrist, șofer de ridesharing,
// șofer de distribuție) nu spune a cui e oferta: ofertele lui nu se arată la niciuna.
const corComun = (slug: string) => {
  const cor = MESERII.find((m) => m.slug === slug)?.cor;
  return !!cor && MESERII.filter((m) => m.cor === cor).length > 1;
};
const anofmMeserie = (slug: string): Anofm | null => (Object.hasOwn(A.meserii, slug) && !corComun(slug) ? A.meserii[slug] : null);
// Cifra paginii din ANOFM numai când sub un sfert din oferte sunt la minim, ca la salariul-concluzie:
// altfel mediana e chiar minimul, declarat ca formalitate (28 septembrie 2026, șofer de ridesharing).
const anofmPrincipal = (slug: string): Anofm | null => { const a = anofmMeserie(slug); return a && a.laMinim < 25 ? a : null; };
const netDin = (brut: number) => calculStandard(brut)?.net ?? null;

/** Cifra de pe card: netul din ghid sau netul medianei ANOFM; aceeași pe /salarii și la „Meserii apropiate”. */
export function netDeclarat(slug: string): number | null {
  const g = ghidMeserie(slug);
  if (g) return g.net;
  const a = anofmPrincipal(slug);
  return a ? netDin(a.brutMedian) : null;
}
export const areSalariuDeclarat = (slug: string) => netDeclarat(slug) !== null;

/** Răspunsul scurt (întrebări frecvente, descrierea din Google), cu sursa în frază. */
export function frazaDeclarat(slug: string, de: string): string | null {
  const g = ghidMeserie(slug), a = g ? anofmMeserie(slug) : anofmPrincipal(slug);
  const f = (n: number) => n.toLocaleString("ro-RO");
  if (g) return `Cei care lucrează ca ${de} declară în medie ${f(g.net)} lei net pe lună, după ${g.pagina ? "salariile introduse pe Salario (eJobs)" : "Ghidul salarial eJobs 2026"}.${a ? ` În ofertele depuse la ANOFM, angajatorii declară ${f(a.brutMedian)} lei brut (mediana din ${a.oferte} de oferte).` : ""}`;
  if (a) return `În ofertele depuse la ANOFM, angajatorii declară pentru un ${de} ${f(a.brutMedian)} lei brut, adică ${f(netDin(a.brutMedian)!)} lei net (mediana din ${a.oferte} de oferte).`;
  return null;
}

const lei = (n: number) => n.toLocaleString("ro-RO");
const CARD = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";

export default function SalariuDeclarat({ slug, de }: { slug: string; de: string }) {
  const g = ghidMeserie(slug), a = g ? anofmMeserie(slug) : anofmPrincipal(slug);
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
          ? `Media salariilor declarate de angajați pentru „${g.role}”${g.n ? `, din ${lei(g.n)} de salarii introduse` : ""}, din toată țara și toate nivelurile de experiență.`
          : `Mediana din ${a!.oferte} de oferte cu salariul brut declarat de ${a!.angajatori} de angajatori.`}
      </p>
      {g && a && (
        <p className="mt-3 text-base text-stone-700">
          În ofertele depuse la ANOFM, angajatorii declară <strong className="font-semibold text-stone-900">{lei(a.brutMedian)} lei brut</strong>{" "}
          (≈ {lei(netDin(a.brutMedian)!)} lei net), mediana din {a.oferte} de oferte.
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
