import Link from "@/app/components/Link";
import date from "@/data/venituri-oficiale.json";

/**
 * Primul ecran pentru meseriile la care angajatorul public își publică lunar venitul net plătit,
 * pe categorii (27 septembrie 2026; MApN: „Tabel cu minimul și maximul veniturilor salariale nete
 * achitate”). E suma plătită efectiv, nu grila din lege, care la armată rămăsese la nivelul
 * din 2022 și scotea soldatul sub salariul minim. Datele: src/data/venituri-oficiale.json.
 */

type Categorie = { categorie: string; min: number; max: number };
type Venit = { angajator: string; luna: string; platitIn: string; url: string; pagina: string; start: string; categorii: Categorie[] };

const V = date as unknown as Record<string, Venit | string>;
export const venitOficial = (slug: string): Venit | null => (Object.hasOwn(V, slug) && typeof V[slug] === "object" ? (V[slug] as Venit) : null);
/** Cifra de început, aceeași pe pagină, la „Meserii apropiate” și pe /salarii. */
export const netOficialDeStart = (slug: string) => {
  const v = venitOficial(slug);
  return v ? (v.categorii.find((c) => c.categorie === v.start) ?? v.categorii[0]).min : null;
};

const lei = (n: number) => n.toLocaleString("ro-RO");
const CARD = "rounded-md border border-stone-200 bg-surface p-5 shadow-soft sm:p-6";

export default function SalariuOficial({ slug, de }: { slug: string; de: string }) {
  const v = venitOficial(slug);
  if (!v) return null;
  const start = v.categorii.find((c) => c.categorie === v.start) ?? v.categorii[0];
  const varf = Math.max(...v.categorii.map((c) => c.max));
  return (
    <section className={`mt-6 ${CARD}`} data-salary-kind="venit-oficial-platit" data-salary-primary={start.min}>
      <p className="text-xs font-medium text-stone-700">Cât ia în mână un {de} la început</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">de la {lei(start.min)} lei net</p>
      <p className="mt-1 text-sm text-stone-600">
        {start.categorie} iau în mână, la program normal, între {lei(start.min)} și {lei(start.max)} lei net pe lună. Brutul nu se calculează ca la un salariu obișnuit, de aceea arătăm netul plătit.
      </p>
      <p className="mt-3 text-base text-stone-700">
        Ajunge până la <strong className="font-semibold text-stone-900">{lei(varf)} lei net</strong> la ofițerii cu funcții de comandă.
      </p>
      <table className="mt-4 w-full text-sm">
        <caption className="sr-only">Venitul net plătit, pe categorii</caption>
        <thead>
          <tr className="text-left text-xs text-stone-600">
            <th scope="col" className="py-2 font-medium">Categoria</th>
            <th scope="col" className="py-2 text-right font-medium">Minim</th>
            <th scope="col" className="py-2 text-right font-medium">Maxim</th>
          </tr>
        </thead>
        <tbody>
          {v.categorii.map((c) => (
            <tr key={c.categorie} className="border-t border-stone-100">
              <th scope="row" className="py-2 pr-2 text-left font-normal text-stone-800">{c.categorie}</th>
              <td className="whitespace-nowrap py-2 text-right text-stone-900">{lei(c.min)} lei</td>
              <td className="whitespace-nowrap py-2 text-right text-stone-900">{lei(c.max)} lei</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-stone-600">
        Venitul net plătit de {v.angajator} pentru {v.luna}, fără drepturile nepermanente ·{" "}
        <a href={v.pagina} className="underline underline-offset-2" rel="noopener">tabelul oficial</a> ·{" "}
        <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">sursele</Link>
      </p>
    </section>
  );
}
