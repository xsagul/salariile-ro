import { COLOANA_IN_PLATA, GRILA, functiiDisponibile, SURSA_GRILA } from "@/lib/invatamant";
import { CardCompanion, GrilaPagina } from "@/app/components/ui";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n);

/** Tabelul legal rămâne în HTML și când secțiunile sunt închise. */
export default function GrilaInvatamant() {
  return (
    <section id="grila-salarizare" className="rule-t bg-canvas py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <GrilaPagina continut={<>
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">Grila de salarizare în învățământ: tabel pentru 2026</h2>
        <p className="mt-3 text-stone-600">
          Toate cele {GRILA.length} de rânduri ale grilei pentru cadrele didactice din
          învățământul preuniversitar. Sumele sunt brute și reprezintă salariul de pornire, înainte
          de gradația de vechime și de sporuri.
        </p>
        <div className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
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
          Sursă: <a className="underline" href={SURSA_GRILA.url}>Legea-cadru 153/2017, anexa I</a>, coloana
          din iunie 2024, rămasă în plată.
        </p>
        </>}
        companion={
          // Grila e lungă: cardul rămâne în vedere cât derulezi, în loc să se
          // întindă gol pe toată înălțimea ei.
          <div className="md:sticky md:top-24">
          <CardCompanion titlu="Cum citești grila">
            <dl className="text-sm">
              {([
                ["S", "studii superioare de lungă durată"],
                ["SSD", "studii superioare de scurtă durată"],
                ["M", "studii liceale"],
              ] as const).map(([k, v]) => (
                <div key={k} className="flex gap-3 border-b border-stone-100 py-2 last:border-b-0">
                  <dt className="w-10 shrink-0 font-semibold text-stone-900">{k}</dt>
                  <dd className="text-stone-600">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm leading-normal text-stone-600">
              Deschide funcția ta și caută rândul cu anii tăi în învățământ. Suma e salariul de pornire, brut.
            </p>
            <a href="/date/grila-invatamant.csv" download className="mt-4 inline-flex min-h-11 items-center self-start rounded border border-stone-300 bg-surface px-4 text-sm font-medium text-stone-900 underline underline-offset-2">
              Descarcă grila în CSV, pentru Excel
            </a>
          </CardCompanion>
          </div>
        } />
      </div>
    </section>
  );
}
