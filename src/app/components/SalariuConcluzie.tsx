import Link from "@/app/components/Link";
import data from "@/data/salariu-concluzie.json";

/**
 * Primul ecran al paginii de meserie, când avem salariul-concluzie (26 septembrie 2026):
 * o cifră, ce înseamnă, trei repere care o schimbă și de unde vine. Concluzia e sursa cea
 * mai apropiată de „cât se plătește” care trece pragurile — salariile plătite, publicate de
 * instituții, apoi ofertele din anunțuri — verificată de celelalte surse, nu o medie între
 * ele. Datele: scripts/colectare/agregare.mjs → publica.mjs.
 */

type Concluzie = {
  sursa: "platit" | "oferit" | "declarat";
  net: number;
  interval: [number, number] | null;
  platit: null | {
    randuri: number; institutii: number; judete: number; perioade: string[]; surse: string[];
    debutant: number | null; cuVariabil: { net: number; cota: number } | null;
    studii: Record<string, number>;
    peVechime: { gradatie: number; randuri: number; net: number }[];
    peJudet: { judet: string; randuri: number; institutii: number; net: number }[];
  };
  oferit: null | { net: number; anunturi: number };
  declarat: null | { net: number; oferte: number; laMinim: number };
  angajatori: null | {
    firma: string; post: string; anunturi: number; orase: number; min: number; max: number;
    baza: "brut" | null; venitMediuBrut: { min: number; max: number } | null;
  }[];
};

const MESERII = data.meserii as unknown as Record<string, Concluzie>;
export const concluzieMeserie = (slug: string): Concluzie | null => (Object.hasOwn(MESERII, slug) ? MESERII[slug] : null);

const lei = (n: number) => n.toLocaleString("ro-RO");
// Gradațiile de vechime din Legea-cadru 153/2017, art. 10.
const VECHIME = ["Sub 3 ani", "3–5 ani", "5–10 ani", "10–15 ani", "15–20 ani", "Peste 20 de ani"];
const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
const luna = (p: string) => `${LUNI[Number(p.slice(5, 7)) - 1]} ${p.slice(0, 4)}`;
function perioada(p: string[]) {
  if (p.length === 1) return luna(p[0]);
  const [a, b] = [p[0], p[p.length - 1]];
  return a.slice(0, 4) === b.slice(0, 4) ? `${LUNI[Number(a.slice(5, 7)) - 1]}–${luna(b)}` : `${luna(a)}–${luna(b)}`;
}
const diferenta = (x: number, ref: number) => {
  const d = Math.round((100 * (x - ref)) / ref);
  return d === 0 ? "cam la fel" : `${d > 0 ? "+" : "−"}${Math.abs(d)}%`;
};

export default function SalariuConcluzie({ slug, de }: { slug: string; de: string }) {
  const c = concluzieMeserie(slug);
  if (!c) return null;
  const P = c.platit;
  const repere: { eticheta: string; valoare: string }[] = [];
  if (P?.debutant) repere.push({ eticheta: "La început", valoare: `${lei(P.debutant)} lei` });
  // Gărzile medicilor se plătesc pe contracte separate, excluse din posturi: acolo „cu ture și
  // gărzi” ar ieși aproape egal cu salariul fix și ar induce în eroare. Doar peste +3%.
  if (P?.cuVariabil && P.cuVariabil.net > c.net * 1.03) repere.push({ eticheta: "Cu ture și gărzi", valoare: `${lei(P.cuVariabil.net)} lei` });
  if (P?.studii.S && P.studii.PL) repere.push({ eticheta: "Cu studii superioare", valoare: `${lei(P.studii.S)} lei` });

  const alte: { eticheta: string; net: number; nota: string }[] = [];
  if (c.sursa !== "oferit" && c.oferit) alte.push({ eticheta: "Anunțuri de angajare", net: c.oferit.net, nota: `${c.oferit.anunturi} anunțuri verificate` });
  if (c.declarat) alte.push({ eticheta: "Oferte declarate la ANOFM", net: c.declarat.net, nota: `${Math.round(c.declarat.laMinim * 100)}% la salariul minim` });

  return (
    <>
      <section className="mt-6 rounded-md border border-stone-300 bg-surface p-5 sm:p-6" data-salary-kind={`concluzie-${c.sursa}`} data-salary-primary={c.net}>
        <p className="text-xs font-medium text-stone-700">
          {c.sursa === "platit" ? `Cât ia în mână un ${de} la stat` : `Cât se oferă unui ${de} la angajare`}
        </p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{lei(c.net)} lei net</p>
        <p className="mt-1 text-sm text-stone-600">
          pe lună · {c.sursa === "platit" ? "salariul fix: baza și sporurile permanente, fără ture și gărzi" : "mijlocul salariilor oferite în anunțurile verificate"}
        </p>
        {c.interval && (
          <p className="mt-3 text-base text-stone-700">
            Jumătate din posturi au între <strong className="font-semibold text-stone-900">{lei(c.interval[0])}</strong> și{" "}
            <strong className="font-semibold text-stone-900">{lei(c.interval[1])} lei</strong>.
          </p>
        )}
        {repere.length > 0 && (
          // Pe un rând și pe telefon: stivuite, cele trei repere ocupau jumătate de ecran.
          <dl className={`mt-4 grid gap-2 sm:gap-3 ${repere.length === 3 ? "grid-cols-3" : repere.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {repere.map((r) => (
              <div key={r.eticheta} className="rounded-md border border-stone-200 p-2.5 sm:p-3">
                <dt className="text-xs text-stone-600">{r.eticheta}</dt>
                <dd className="mt-1 text-base font-semibold text-stone-900">{r.valoare}</dd>
              </div>
            ))}
          </dl>
        )}
        {P && (
          <p className="mt-4 text-xs text-stone-600">
            Din salariile publicate de {P.institutii} instituții publice din {P.judete} județe, pentru {perioada(P.perioade)} ·{" "}
            {lei(P.randuri)} de posturi ·{" "}
            <a href="#cum-am-calculat" className="underline underline-offset-2">Cum am calculat</a>
          </p>
        )}
        {c.sursa === "oferit" && c.oferit && (
          <p className="mt-4 text-xs text-stone-600">
            Din {lei(c.oferit.anunturi)} anunțuri de angajare verificate ·{" "}
            <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">anunțurile din spate</Link>
          </p>
        )}
      </section>

      {alte.length > 0 && (
        <section className="mt-4 rounded-md border border-stone-200 bg-surface p-5">
          <h2 className="text-base font-semibold text-stone-900">Ce spun celelalte surse</h2>
          <ul className="mt-3 divide-y divide-stone-100">
            {alte.map((a) => (
              <li key={a.eticheta} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2 text-sm">
                <span className="text-stone-700">{a.eticheta} <span className="text-xs text-stone-600">· {a.nota}</span></span>
                <span className="whitespace-nowrap font-semibold text-stone-900">
                  {lei(a.net)} lei <span className="text-xs font-normal text-stone-600">({diferenta(a.net, c.net)})</span>
                </span>
              </li>
            ))}
          </ul>
          {c.declarat && c.declarat.laMinim >= 0.25 && (
            <p className="mt-2 text-xs text-stone-600">
              La ANOFM, angajatorii declară adesea salariul minim ca formalitate; de aceea nu e concluzia.
            </p>
          )}
        </section>
      )}

      {P && P.peVechime.length >= 3 && (
        <section className="mt-4 rounded-md border border-stone-200 bg-surface p-5">
          <h2 className="text-base font-semibold text-stone-900">Pe vechime în muncă</h2>
          <p className="mt-1 text-xs text-stone-600">Salariul fix din mijloc, după gradația de vechime din statul de plată.</p>
          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Salariul fix net pe vechime în muncă</caption>
            <thead>
              <tr className="text-left text-xs text-stone-600">
                <th scope="col" className="py-2 font-medium">Vechime</th>
                <th scope="col" className="py-2 text-right font-medium">Posturi</th>
                <th scope="col" className="py-2 text-right font-medium">Net lunar</th>
              </tr>
            </thead>
            <tbody>
              {P.peVechime.map((v) => (
                <tr key={v.gradatie} className="border-t border-stone-100">
                  <th scope="row" className="py-2 text-left font-normal text-stone-700">{VECHIME[v.gradatie]}</th>
                  <td className="py-2 text-right tabular-nums text-stone-600">{lei(v.randuri)}</td>
                  <td className="py-2 text-right font-semibold tabular-nums text-stone-900">{lei(v.net)} lei</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {c.angajatori && c.angajatori.length > 0 && (
        <section className="mt-4 rounded-md border border-stone-200 bg-surface p-5">
          <h2 className="text-base font-semibold text-stone-900">Ce oferă marii angajatori</h2>
          <p className="mt-1 text-xs text-stone-600">Sumele publicate chiar de angajator în anunțurile de pe site-ul lui, pentru normă întreagă.</p>
          <ul className="mt-3 divide-y divide-stone-100">
            {c.angajatori.map((a) => (
              <li key={`${a.firma}-${a.post}`} className="py-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-900">{a.firma}</span>, {a.post.toLocaleLowerCase("ro-RO")}:{" "}
                <span className="font-semibold text-stone-900">
                  {a.min === a.max ? lei(a.min) : `${lei(a.min)}–${lei(a.max)}`} lei{a.baza === "brut" ? " brut" : ""}
                </span>
                {a.baza === null && <span className="text-xs text-stone-600"> (anunțul nu spune dacă e brut sau net)</span>}
                {a.venitMediuBrut && (
                  <>; venit mediu brut total {a.venitMediuBrut.min === a.venitMediuBrut.max ? lei(a.venitMediuBrut.min) : `${lei(a.venitMediuBrut.min)}–${lei(a.venitMediuBrut.max)}`} lei, cu tichete, bonusuri și sporuri</>
                )}
                <span className="text-xs text-stone-600"> · {a.anunturi} anunțuri, {a.orase} {a.orase === 1 ? "oraș" : "orașe"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {P && P.peJudet.length > 1 && (
        <section className="mt-4 rounded-md border border-stone-200 bg-surface p-5">
          <h2 className="text-base font-semibold text-stone-900">Pe județe</h2>
          <p className="mt-1 text-xs text-stone-600">Salariul fix din mijloc, în instituțiile citite din fiecare județ.</p>
          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Salariul fix net pe județe</caption>
            <thead>
              <tr className="text-left text-xs text-stone-600">
                <th scope="col" className="py-2 font-medium">Județ</th>
                <th scope="col" className="py-2 text-right font-medium">Posturi</th>
                <th scope="col" className="py-2 text-right font-medium">Net lunar</th>
              </tr>
            </thead>
            <tbody>
              {P.peJudet.map((j) => (
                <tr key={j.judet} className="border-t border-stone-100">
                  <th scope="row" className="py-2 text-left font-normal text-stone-700">{j.judet}</th>
                  <td className="py-2 text-right tabular-nums text-stone-600">{lei(j.randuri)}</td>
                  <td className="py-2 text-right font-semibold tabular-nums text-stone-900">{lei(j.net)} lei</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {P && (
        <details id="cum-am-calculat" className="mt-4 rounded-md border border-stone-200 bg-surface p-5">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-stone-900">Cum am calculat</summary>
          <div className="mt-2 space-y-2 text-sm text-stone-700">
            <p>
              Instituțiile publice sunt obligate să publice de două ori pe an salariile tuturor funcțiilor, cu baza și fiecare spor. Am citit
              listele publicate și am păstrat posturile de {de}, fără funcțiile de conducere și fără contractele de gardă sau cu normă parțială.
            </p>
            <p>
              Pentru fiecare post am adunat baza și sporurile care se plătesc în fiecare lună, apoi am calculat netul cu regulile fiscale ale
              lunii respective, pentru o persoană fără persoane în întreținere. Turele și gărzile sunt separat, pentru că variază de la o lună la alta.
              Fiecare instituție cântărește la fel, ca un spital mare să nu mute singur cifra.
            </p>
            <p className="text-xs text-stone-600">Surse: {P.surse.join(", ")}.</p>
            <p className="text-xs text-stone-600">
              Anunțurile de angajare citite pentru această meserie sunt în{" "}
              <Link href={`/salarii/acoperire#${slug}`} className="underline underline-offset-2">registrul de acoperire</Link>.
            </p>
          </div>
        </details>
      )}
    </>
  );
}
