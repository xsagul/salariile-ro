import { COLOANA_IN_PLATA, GRILA, functiiDisponibile, SURSA_GRILA } from "@/lib/invatamant";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

/** Tabelul legal rămâne în HTML și când secțiunile sunt închise. */
export default function GrilaInvatamant() {
  return (
    <section id="grila-salarizare" className="rule-t bg-canvas py-10 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">Grila de salarizare în învățământ: tabel pentru 2026</h2>
        <p className="mt-3 text-stone-600">
          Consultă cele {GRILA.length} de rânduri pentru personalul didactic de predare din
          învățământul preuniversitar. Sumele sunt salarii de bază brute la gradația 0,
          din coloana iunie 2024 menținută în plată. Nu sunt salarii nete și nu includ
          gradația de vechime în muncă, majorările sau indemnizația de hrană.
        </p>
        <p className="mt-3 text-sm text-stone-600">
          S = studii superioare de lungă durată; SSD = studii superioare de scurtă durată;
          M = studii de nivel liceal. Încadrarea exactă este cea din denumirea funcției.
          Personalul auxiliar și funcțiile de conducere au grile distincte.
        </p>
        <a href="/date/grila-invatamant.csv" download className="my-4 inline-flex min-h-11 items-center rounded border border-stone-300 bg-surface px-4 text-sm font-medium text-stone-900 underline underline-offset-2">
          Descarcă grila în CSV, pentru Excel
        </a>
        <div className="divide-y divide-stone-200 border-y border-stone-200">
          {functiiDisponibile().map((functie) => (
            <details key={functie.nr} name="grila-invatamant" className="group py-1">
              <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-stone-900">
                {functie.functie}
              </summary>
              <div className="overflow-x-auto pb-4">
                <table className="w-full text-sm" data-grila-functie={functie.nr}>
                  <caption className="sr-only">{functie.functie}: salariu de bază brut, gradația 0</caption>
                  <thead><tr className="bg-canvas">
                    <th scope="col" className="p-3 text-left">Vechime în învățământ</th>
                    <th scope="col" className="p-3 text-left">Studii</th>
                    <th scope="col" className="p-3 text-right">Brut / lună</th>
                  </tr></thead>
                  <tbody>{GRILA.filter(r => r.nr === functie.nr).map(r => (
                    <tr key={r.vechime} className="border-b border-stone-200 bg-surface" data-grila-rand={`${r.nr}:${r.vechime}`}>
                      <th scope="row" className="p-3 text-left font-normal">{r.vechime}</th>
                      <td className="p-3">{r.studii}</td>
                      <td className="whitespace-nowrap p-3 text-right font-semibold tabular-nums">{fmt(r[COLOANA_IN_PLATA])} lei brut</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
        <p className="mt-4 text-xs text-stone-600">
          Sursă: <a className="underline" href={SURSA_GRILA.url}>{SURSA_GRILA.act}, {SURSA_GRILA.anexa}</a>.
          Pentru suma încasată, aplică în calculator gradația și drepturile corespunzătoare încadrării tale.
        </p>
      </div>
    </section>
  );
}
