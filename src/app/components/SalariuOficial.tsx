import Link from "@/app/components/Link";
import CardSalariu, { SectiuneDetaliu, type Reper } from "@/app/components/CardSalariu";
import date from "@/data/venituri-oficiale.json";
import { calculStandard, SALARIU_MINIM } from "@/lib/fiscal";

/**
 * Primul ecran pentru meseriile la care angajatorul public își publică lunar venitul net plătit,
 * pe categorii (27 septembrie 2026; MApN: „Tabel cu minimul și maximul veniturilor salariale nete
 * achitate”). E suma plătită efectiv, nu grila din lege, care la armată rămăsese la nivelul
 * din 2022 și scotea soldatul sub salariul minim. Datele: src/data/venituri-oficiale.json.
 */

type Categorie = { categorie: string; min: number; max: number; brutMin?: number; brutMax?: number };
type Brut = { categorie: string; min?: number; max?: number; brutMin?: number; brutMax?: number };
/** Un tabel lunar al unei unități MAI: pe rând, [cu comandă min, max, fără comandă min, max]. */
export type Unitate = { nume: string; luna: string; url: string; pagina: string; randuri: Record<string, number[]> };
type Venit = {
  angajator: string; luna: string; platitIn?: string; url?: string; pagina: string; start: string;
  varf: string; ierarhie: string; brut?: boolean; nota?: string; eticheta?: string; categorii: Categorie[]; unitati?: Unitate[];
};
type Sursa = Omit<Venit, "categorii"> & { categorii?: Brut[]; categoriiDin?: [string, string, "cu" | "fara"][] };

// Ministerul Public publică brutul pe funcție (indemnizația și sporurile permanente); netul se
// calculează cu regulile obișnuite, ca pentru orice salariu. MApN publică direct netul plătit.
const netDin = (brut: number) => calculStandard(brut)?.net ?? 0;
const mediana = (x: number[]) => { const s = [...x].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };
/**
 * MAI e împărțit în unități (ISU, IPJ, IJJ), fiecare cu tabelul ei lunar (13 noiembrie 2026).
 * Pe categorie, cifra e mediana unităților. Un minim sub salariul minim net nu e o lună întreagă
 * (angajare sau plecare în cursul lunii: ISU Maramureș, 1.767 lei la subofițeri), deci nu intră.
 */
export const MINIM_LUNA_INTREAGA = netDin(SALARIU_MINIM);
export function categoriiDinUnitati(unitati: Unitate[], din: [string, string, "cu" | "fara"][]): Categorie[] {
  return din.flatMap(([categorie, rand, col]) => {
    const i = col === "cu" ? 0 : 2;
    const valori = unitati.map((u) => u.randuri[rand]).filter((r): r is number[] => !!r);
    const min = valori.map((r) => r[i]).filter((x) => x >= MINIM_LUNA_INTREAGA);
    const max = valori.map((r) => r[i + 1]).filter((x) => x >= MINIM_LUNA_INTREAGA);
    return min.length && max.length ? [{ categorie, min: mediana(min), max: mediana(max) }] : [];
  });
}
const V = date as unknown as Record<string, Sursa | string>;
export const venitOficial = (slug: string): Venit | null => {
  if (!Object.hasOwn(V, slug) || typeof V[slug] !== "object") return null;
  const v = V[slug] as Sursa;
  if (v.unitati && v.categoriiDin) return { ...v, categorii: categoriiDinUnitati(v.unitati, v.categoriiDin) };
  return {
    ...v,
    categorii: (v.categorii ?? []).map((c) => (c.brutMin ? { ...c, min: netDin(c.brutMin), max: netDin(c.brutMax!) } : (c as Categorie))),
  };
};
/** „după tabelul publicat de X pentru luna Y” sau, pe mai multe unități, mijlocul lor. */
export const frazaTabel = (v: Venit) =>
  v.unitati && v.unitati.length > 1
    ? `după mijlocul tabelelor publicate de ${v.unitati.length} unități (${v.unitati.map((u) => u.nume).join(", ")}) pentru ${v.luna}`
    : `după tabelul publicat de ${v.angajator} pentru ${v.luna}`;
/** Cifra de început, aceeași pe pagină, la „Meserii apropiate” și pe /salarii. */
export const netOficialDeStart = (slug: string) => {
  const v = venitOficial(slug);
  return v ? (v.categorii.find((c) => c.categorie === v.start) ?? v.categorii[0]).min : null;
};

const lei = (n: number) => n.toLocaleString("ro-RO");

export default function SalariuOficial({ slug, de }: { slug: string; de: string }) {
  const v = venitOficial(slug);
  if (!v) return null;
  const start = v.categorii.find((c) => c.categorie === v.start) ?? v.categorii[0];
  const sus = v.categorii.reduce((a, c) => (c.max > a.max ? c : a), start);
  const multe = !!v.unitati && v.unitati.length > 1;
  const repere: Reper[] = [];
  if (start.max > start.min) repere.push({ eticheta: "Cu vechime", valoare: `${lei(start.max)} lei` });
  if (sus !== start) repere.push({ eticheta: sus.categorie, valoare: `${lei(sus.max)} lei` });
  return (
    <>
      <CardSalariu
        tip="venit-oficial-platit"
        primar={start.min}
        eticheta={v.eticheta ?? `Cât ia în mână un ${de} la început`}
        cifra={`${lei(start.min)} lei net`}
        brut={v.brut && start.brutMin ? `≈ ${lei(start.brutMin)} lei brut pe lună` : null}
        explicatie={v.brut ? `Salariul de bază și sporurile permanente, la ${v.angajator}.` : `${start.categorie}, venitul net plătit la program normal.`}
        repere={repere}
        sursa={<>
          {multe ? `Din tabelele publicate de ${v.unitati!.length} unități, ${v.luna}` : `Din tabelul publicat de ${v.angajator}, ${v.luna}`} ·{" "}
          <a href="#pe-categorii" className="underline underline-offset-2">{v.categorii.length > 1 ? "Pe categorii" : "De unde e cifra"}</a>
        </>}
      />
      <div id="pe-categorii" className="scroll-mt-24">
        <SectiuneDetaliu
          titlu={v.categorii.length > 1 ? "Pe categorii" : "De unde e cifra"}
          subtitlu={v.brut ? "Brutul publicat, cu netul calculat pentru o persoană fără persoane în întreținere." : "Venitul net plătit într-o lună, de la cel mai mic la cel mai mare din fiecare categorie."}
        >
          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Venitul net, pe categorii</caption>
            <thead>
              <tr className="text-left text-xs text-stone-600">
                <th scope="col" className="py-2 font-medium">Categoria</th>
                <th scope="col" className="py-2 text-right font-medium">De la</th>
                <th scope="col" className="py-2 text-right font-medium">Până la</th>
              </tr>
            </thead>
            <tbody>
              {v.categorii.map((c) => (
                <tr key={c.categorie} className="border-t border-stone-100">
                  <th scope="row" className="py-2 pr-2 text-left font-normal text-stone-800">{c.categorie}</th>
                  <td className="whitespace-nowrap py-2 pl-3 text-right text-stone-900">{lei(c.min)} lei</td>
                  <td className="whitespace-nowrap py-2 pl-3 text-right text-stone-900">{lei(c.max)} lei</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-stone-600">
            {multe ? (
              <>Mijlocul tabelelor publicate de {v.unitati!.length} unități, fără drepturile nepermanente. Minimele sub salariul minim net sunt luni lucrate parțial și nu intră. Tabelele:{" "}
                {v.unitati!.map((u, i) => (
                  <span key={u.nume}>{i ? ", " : ""}<a href={u.url} className="underline underline-offset-2" rel="noopener">{u.nume}</a> ({u.luna})</span>
                ))}.</>
            ) : v.brut ? (
              <>Drepturile brute publicate de {v.angajator} pentru {v.luna}: {v.nota} <a href={v.pagina} className="underline underline-offset-2" rel="noopener">Tabelul oficial</a>.</>
            ) : (
              <>Venitul net plătit de {v.angajator} pentru {v.luna}, fără drepturile nepermanente. <a href={v.pagina} className="underline underline-offset-2" rel="noopener">Tabelul oficial</a>.</>
            )}{" "}
            <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">Toate sursele</Link>
          </p>
        </SectiuneDetaliu>
      </div>
    </>
  );
}
